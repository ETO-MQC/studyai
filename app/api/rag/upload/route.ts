import { addFileToStore, listFiles } from "@/lib/rag";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ files: listFiles() });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "请上传文本文件。" }, { status: 400 });
    }
    const text = await file.text();
    if (!text.trim()) {
      return Response.json({ error: "文件内容为空。" }, { status: 400 });
    }
    const record = addFileToStore(file.name, text);
    return Response.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
