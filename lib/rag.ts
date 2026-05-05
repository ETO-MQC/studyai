import { newId } from "./utils";

interface ChunkRecord {
  text: string;
  vector: Map<string, number>;
}

interface FileRecord {
  fileId: string;
  name: string;
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

export function addFileToStore(name: string, text: string) {
  const chunks = splitTextIntoChunks(text).map((chunk) => ({
    text: chunk,
    vector: vectorize(chunk)
  }));
  const fileId = newId("file");
  const record: FileRecord = { fileId, name, chunks };
  files.set(fileId, record);
  return { fileId, name, chunkCount: chunks.length };
}

export function listFiles() {
  return [...files.values()].map((file) => ({
    fileId: file.fileId,
    name: file.name,
    chunkCount: file.chunks.length
  }));
}

export function getRelevantContext(fileId: string, question: string, topK = 4) {
  const file = files.get(fileId);
  if (!file) return null;
  const queryVector = vectorize(question);
  const ranked = file.chunks
    .map((chunk) => ({
      text: chunk.text,
      score: cosine(queryVector, chunk.vector)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  const context = ranked.map((item) => item.text).join("\n\n---\n\n");
  return {
    file,
    context,
    maxScore: ranked[0]?.score ?? 0
  };
}

export function localFileAnswer(context: string, question: string) {
  if (!context.trim()) return "文件中未找到相关信息。";
  return `基于已上传资料，最相关的内容如下：

${context}

针对问题“${question}”，请优先依据以上片段判断；如果片段仍不足以回答，则文件中未找到相关信息。`;
}
