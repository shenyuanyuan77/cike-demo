import { createServer } from "node:http";

const HOST = "127.0.0.1";
const PORT = Number(process.env.CIKE_PROXY_PORT || 8787);
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function sendJson(response, status, data) {
  response.writeHead(status, { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("请求体超过 2 MB 限制");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, service: "cike-deepseek-proxy" });
    return;
  }

  if (request.method !== "POST" || request.url !== "/chat/completions") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    sendJson(response, 401, { error: "缺少 DeepSeek Authorization" });
    return;
  }

  try {
    const body = await readBody(request);
    const upstream = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body,
    });
    const payload = Buffer.from(await upstream.arrayBuffer());
    response.writeHead(upstream.status, {
      ...corsHeaders,
      "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
    });
    response.end(payload);
  } catch (error) {
    sendJson(response, 502, { error: error instanceof Error ? error.message : "代理请求失败" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`此刻 DeepSeek 本地代理已启动：http://${HOST}:${PORT}`);
  console.log(`健康检查：http://${HOST}:${PORT}/health`);
});

