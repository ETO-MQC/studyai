import { getSourceDocument, getSourceChunks } from "@/lib/rag";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sourceId = url.searchParams.get("sourceId");
    if (!sourceId) {
      return Response.json({ error: "缺少 sourceId 参数。" }, { status: 400 });
    }

    const chunkIndexParam = url.searchParams.get("chunkIndex");
    const chunkIndex = chunkIndexParam !== null ? parseInt(chunkIndexParam, 10) : undefined;

    const doc = getSourceDocument(sourceId);
    if (!doc) {
      return Response.json({ error: "未找到对应资料。" }, { status: 404 });
    }

    const result = getSourceChunks(sourceId, chunkIndex);
    if (!result) {
      return Response.json({ error: "未找到对应资料。" }, { status: 404 });
    }

    return Response.json({
      document: result.document,
      focusChunk: result.focusChunk,
      chunks: result.nearbyChunks
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
