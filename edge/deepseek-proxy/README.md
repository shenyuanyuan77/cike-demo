# DeepSeek 代理

Web 端专用，解决 DeepSeek API 不发 CORS 头导致浏览器直连被拦截的问题（见 `docs/design.md` Q5 修正、风险 #1）。移动端 RN 无此问题，直连 `api.deepseek.com`。

## 本地开发

项目已包含无需额外依赖的 Node 代理：

```bash
npm run proxy
```

默认监听 `http://127.0.0.1:8787`。项目根 `.env` 应配置：

```env
EXPO_PUBLIC_DEEPSEEK_PROXY_URL=http://127.0.0.1:8787
```

另开一个终端执行 `npm run web`。代理终端必须与 Web 开发服务器同时保持运行。

## 生产部署（任选其一）

### Cloudflare Workers

```bash
npm i -g wrangler
wrangler deploy edge/deepseek-proxy/index.ts --name cike-deepseek-proxy
```

### Vercel Edge Functions

把 `index.ts` 放到 `api/chat/completions.ts` 并 default export Hono app。

## 配置

部署后把代理 URL 填入项目根 `.env`：

```env
EXPO_PUBLIC_DEEPSEEK_PROXY_URL=https://your-proxy.workers.dev
```

前端 `src/lib/llm/client.ts` 会在 Web 平台把 `baseURL` 指向此 URL。

## 安全说明

代理只做转发，不持有任何 key —— DeepSeek key 由用户在前端填入，经 `Authorization` 头透传给上游。代理本身不存储、不记录 key。
