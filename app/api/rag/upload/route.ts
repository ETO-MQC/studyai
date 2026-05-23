import { addFileToStore, addPdfPagesToStore, listSourceDocuments } from "@/lib/rag";

export const runtime = "nodejs";

const TEXT_TYPES: Record<string, string> = {
  "text/plain": "text/plain",
  "text/markdown": "text/markdown",
  "text/csv": "text/csv",
  "text/x-markdown": "text/markdown"
};

const TEXT_EXTENSIONS = [".txt", ".md", ".csv"];

function isTextFile(name: string, mime: string) {
  if (TEXT_TYPES[mime]) return true;
  const lower = name.toLowerCase();
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isPdfFile(name: string, mime: string) {
  return mime === "application/pdf" || name.toLowerCase().endsWith(".pdf");
}

async function parsePdfPages(buffer: Buffer): Promise<Array<{ page: number; text: string }>> {
  const pdfParse = (await import("pdf-parse")).default;
  // pdf-parse v1 exposes per-page text via custom pagerender.
  // The pagerender option is an undocumented but stable internal API.
  let currentPage = 0;
  const pages: Array<{ page: number; text: string }> = [];

  try {
    await pdfParse(buffer, {
      pagerender: (pageData: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) => {
        currentPage++;
        return pageData.getTextContent().then((content) => {
          const text = content.items.map((item) => item.str).join(" ");
          if (text.trim()) {
            pages.push({ page: currentPage, text });
          }
          return text;
        });
      }
    });
  } catch {
    // pagerender may fail for some PDFs; fall through to fallback
  }

  // Fallback: single-pass extraction if per-page didn't work
  if (pages.length === 0) {
    const data = await pdfParse(buffer);
    if (data.text.trim()) {
      pages.push({ page: 1, text: data.text });
    }
  }

  return pages;
}

export async function GET() {
  return Response.json({ files: listSourceDocuments() });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "请上传文件。" }, { status: 400 });
    }

    const name = file.name;
    const mime = file.type || "application/octet-stream";

    if (isPdfFile(name, mime)) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pages = await parsePdfPages(buffer);
      if (pages.length === 0) {
        return Response.json({ error: "PDF 中未提取到文本内容。" }, { status: 400 });
      }
      const doc = addPdfPagesToStore(name, pages);
      return Response.json(doc);
    }

    if (isTextFile(name, mime)) {
      const text = await file.text();
      if (!text.trim()) {
        return Response.json({ error: "文件内容为空。" }, { status: 400 });
      }
      const mimeType = TEXT_TYPES[mime] || "text/plain";
      const doc = addFileToStore(name, text, mimeType);
      return Response.json(doc);
    }

    return Response.json(
      { error: "不支持的文件类型。请上传 txt、md、csv 或 pdf 文件。" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
