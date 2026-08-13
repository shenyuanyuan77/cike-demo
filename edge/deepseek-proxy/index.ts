/**
 * DeepSeek 代理（仅 Web 端生产用）。
 *
 * 目的：解决 DeepSeek API 不发送 CORS 响应头、Web 浏览器直连被预检拦截的问题
 * （docs/design.md Q5 修正、风险 #1）。移动端 RN 无 CORS 限制，不走此代理。
 *
 * 职责（单一）：
 *   - POST /chat/completions → 透传到 https://api.deepseek.com/chat/completions
 *   - 从请求头读取用户自填的 DeepSeek key，注入上游 Authorization
 *   - 加 CORS 头，允许浏览器跨域
 *
 * 部署：Hono 兼容 Cloudflare Workers / Vercel Edge / Deno / Node。
 *      任选一处部署，把代理 URL 填入 .env 的 DEEPSEEK_PROXY_URL。
 */
import { Hono } from "hono";
import { cors } from "hono/cors";

/** DeepSeek OpenAI 兼容端点（不带 /v1，依据 docs/design.md §4.1） */
const DEEPSEEK_BASE = "https://api.deepseek.com";

const app = new Hono();

/** 允许浏览器跨域调用 */
app.use("*", cors({ origin: "*", allowMethods: ["POST", "OPTIONS"], allowHeaders: ["Content-Type", "Authorization"] }));

app.options("*", () => new Response(null, { status: 204 }));

app.post("/chat/completions", async (c) => {
  // 从请求头读用户自填 key（前端用 Authorization: Bearer <key> 传入）
  const auth = c.req.header("Authorization");
  if (!auth) {
    return c.json({ error: "缺少 Authorization 头（用户的 DeepSeek key）" }, 401);
  }

  const body = await c.req.text();
  const upstream = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body,
  });

  // 透传上游响应（含流式 SSE）
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
});

export default app;
