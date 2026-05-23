import type { Citation, SourceChunk, SourceDocument } from "./types";
import { newId } from "./utils";

export const MIN_RELEVANCE_SCORE = 0.05;

interface ChunkRecord {
  text: string;
  vector: Map<string, number>;
  chunkIndex: number;
  locator: string;
}

interface FileRecord {
  fileId: string;
  name: string;
  mimeType: string;
  createdAt: number;
  chunks: ChunkRecord[];
}

const files = new Map<string, FileRecord>();

const TOKEN_RE = /[\p{L}\p{N}]+/gu;

function tokenize(text: string) {
  return (text.toLowerCase().match(TOKEN_RE) ?? []).filter((token) => token.length > 1);
}

function vectorize(text: string) {
  const vector = new Map<string, number>();
  for (const token of tokenize(text)) {
    vector.set(token, (vector.get(token) ?? 0) + 1);
  }
  return vector;
}

function cosine(a: Map<string, number>, b: Map<string, number>) {
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  for (const value of a.values()) aNorm += value * value;
  for (const value of b.values()) bNorm += value * value;
  for (const [key, value] of a) {
    dot += value * (b.get(key) ?? 0);
  }
  if (!aNorm || !bNorm) return 0;
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
}

export function splitTextIntoChunks(text: string, chunkSize = 900, overlap = 120) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end).trim());
    if (end === clean.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks.filter(Boolean);
}

export function addFileToStore(
  name: string,
  text: string,
  mimeType = "text/plain"
): SourceDocument {
  const fileId = newId("file");
  const createdAt = Date.now();
  const rawChunks = splitTextIntoChunks(text);
  const chunks: ChunkRecord[] = rawChunks.map((chunk, index) => ({
    text: chunk,
    vector: vectorize(chunk),
    chunkIndex: index,
    locator: `chunk ${index + 1}`
  }));
  const record: FileRecord = { fileId, name, mimeType, createdAt, chunks };
  files.set(fileId, record);
  return {
    sourceId: fileId,
    fileName: name,
    mimeType,
    chunkCount: chunks.length,
    createdAt
  };
}

export function addPdfPagesToStore(
  name: string,
  pages: Array<{ page: number; text: string }>
): SourceDocument {
  const fileId = newId("file");
  const createdAt = Date.now();
  const mimeType = "application/pdf";
  const chunks: ChunkRecord[] = [];
  for (const page of pages) {
    if (!page.text.trim()) continue;
    const pageChunks = splitTextIntoChunks(page.text);
    for (let i = 0; i < pageChunks.length; i++) {
      chunks.push({
        text: pageChunks[i],
        vector: vectorize(pageChunks[i]),
        chunkIndex: chunks.length,
        locator: pageChunks.length === 1 ? `page ${page.page}` : `page ${page.page}, part ${i + 1}`
      });
    }
  }
  const record: FileRecord = { fileId, name, mimeType, createdAt, chunks };
  files.set(fileId, record);
  return {
    sourceId: fileId,
    fileName: name,
    mimeType,
    chunkCount: chunks.length,
    createdAt
  };
}

export function listFiles() {
  return [...files.values()].map((file) => ({
    fileId: file.fileId,
    name: file.name,
    chunkCount: file.chunks.length
  }));
}

export function listSourceDocuments(): SourceDocument[] {
  return [...files.values()].map((file) => ({
    sourceId: file.fileId,
    fileName: file.name,
    mimeType: file.mimeType,
    chunkCount: file.chunks.length,
    createdAt: file.createdAt
  }));
}

export function getSourceDocument(sourceId: string): SourceDocument | null {
  const file = files.get(sourceId);
  if (!file) return null;
  return {
    sourceId: file.fileId,
    fileName: file.name,
    mimeType: file.mimeType,
    chunkCount: file.chunks.length,
    createdAt: file.createdAt
  };
}

export function getSourceChunks(
  sourceId: string,
  chunkIndex?: number
): { document: SourceDocument; focusChunk: SourceChunk | null; nearbyChunks: SourceChunk[] } | null {
  const file = files.get(sourceId);
  if (!file) return null;

  const document: SourceDocument = {
    sourceId: file.fileId,
    fileName: file.name,
    mimeType: file.mimeType,
    chunkCount: file.chunks.length,
    createdAt: file.createdAt
  };

  const toSourceChunk = (c: ChunkRecord): SourceChunk => ({
    sourceId: file.fileId,
    fileName: file.name,
    chunkIndex: c.chunkIndex,
    locator: c.locator,
    text: c.text
  });

  if (chunkIndex !== undefined && chunkIndex >= 0 && chunkIndex < file.chunks.length) {
    const focus = file.chunks[chunkIndex];
    const start = Math.max(0, chunkIndex - 1);
    const end = Math.min(file.chunks.length, chunkIndex + 2);
    const nearby = file.chunks
      .slice(start, end)
      .filter((c) => c.chunkIndex !== chunkIndex);
    return {
      document,
      focusChunk: toSourceChunk(focus),
      nearbyChunks: nearby.map(toSourceChunk)
    };
  }

  return {
    document,
    focusChunk: null,
    nearbyChunks: file.chunks.map(toSourceChunk)
  };
}

export function getRelevantContext(
  fileId: string,
  question: string,
  topK = 4
): { context: string; maxScore: number; citations: Citation[] } | null {
  const file = files.get(fileId);
  if (!file) return null;
  const queryVector = vectorize(question);
  const ranked = file.chunks
    .map((chunk) => ({
      chunk,
      score: cosine(queryVector, chunk.vector)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const maxScore = ranked[0]?.score ?? 0;

  if (maxScore < MIN_RELEVANCE_SCORE) {
    return { context: "", maxScore, citations: [] };
  }

  const citations: Citation[] = ranked
    .filter((item) => item.score >= MIN_RELEVANCE_SCORE)
    .map((item) => ({
      sourceId: file.fileId,
      fileName: file.name,
      chunkIndex: item.chunk.chunkIndex,
      locator: item.chunk.locator,
      excerpt: item.chunk.text.slice(0, 200) + (item.chunk.text.length > 200 ? "..." : ""),
      score: Math.round(item.score * 1000) / 1000
    }));

  const context = ranked
    .map((item) => item.chunk.text)
    .join("\n\n---\n\n");

  return { context, maxScore, citations };
}

export function localFileAnswer(context: string, question: string) {
  if (!context.trim()) return "文件中未找到相关信息。";
  return `基于已上传资料，最相关的内容如下：

${context}

针对问题"${question}"，请优先依据以上片段判断；如果片段仍不足以回答，则文件中未找到相关信息。`;
}
