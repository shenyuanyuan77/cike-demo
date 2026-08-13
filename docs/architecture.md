# 「此刻」技术架构

> 配套 `design.md`。本文档定义分层、数据流、三端差异隔离方案。
> 音乐来源：Audius（2026-08-11 从 Apple Music 切换，见 design.md 重大变更）。

---

## 一、分层架构

```
┌──────────────────────────────────────────────────────┐
│  src/app/                 Expo Router（三端共享路由） │
│   ├─ _layout.tsx          Stack + DarkTheme           │
│   ├─ index.tsx            输入页：一句话描述心情/场景 │
│   ├─ generating.tsx       生成中：情绪化动效          │
│   └─ playlist.tsx         歌单页：歌曲卡列表 + 对话栏 │
├──────────────────────────────────────────────────────┤
│  src/components/          表现层组件                  │
│   ├─ GradientBackground   暗色渐变背景                │
│   ├─ SongCard             单首歌（封面+歌名+reason）  │
│   ├─ ReasonHighlight      reason 文案高亮展示          │
│   ├─ ChatBar              底部对话调整输入栏           │
│   └─ PlayerControls       播放控件（试听/整曲/进度）   │
├──────────────────────────────────────────────────────┤
│  src/lib/                 业务逻辑层                  │
│   ├─ playlist/generate.ts 编排：意图→召回→reason      │
│   ├─ llm/                 DeepSeek 客户端 + Prompt    │
│   │   ├─ client.ts        OpenAI 兼容客户端（平台分流）│
│   │   ├─ parse-intent.ts  一句话 → 检索意图 JSON      │
│   │   ├─ adjust-intent.ts 当前意图 + 反馈 → 新意图    │
│   │   ├─ gen-reason.ts    歌曲 + 场景 → reason 文案   │
│   │   └─ prompts.ts       集中管理所有 Prompt 模板    │
│   ├─ music/               Audius 集成                 │
│   │   ├─ client.ts        host 获取 + fetch 封装       │
│   │   ├─ search.ts        /v1/tracks/search 召回       │
│   │   └─ player.ts        统一播放接口（三端通用）     │
│   └─ storage/             持久化                      │
│       ├─ settings.ts      用户 key / 偏好             │
│       └─ playlists.ts     历史歌单                    │
├──────────────────────────────────────────────────────┤
│  edge/                    仅 Web 用的边缘函数         │
│   └─ deepseek-proxy/      转发 DeepSeek + CORS        │
├──────────────────────────────────────────────────────┤
│  src/config/  constants.ts(端点/模型名) env.ts         │
│  src/types/   playlist.ts(song schema) intent.ts       │
└──────────────────────────────────────────────────────┘
```

**与 Apple 方案的差异**：
- ❌ 移除 `scripts/sign-apple-token.ts`（Audius 免认证，无需签发）
- ❌ 移除 `src/config/apple-token.ts`（无 token 注入）
- ❌ 移除 `lib/apple-music/player.web.ts` / `player.native.ts` 双实现（Audius 三端播放方式一致，统一一个 `player.ts`）
- ✅ `lib/apple-music/` → `lib/music/`（中性命名，不再绑定具体平台）

**职责边界**：
- `app/` 只管路由与页面组装，不含业务逻辑。
- `components/` 是纯展示组件，不直接调 lib。
- `lib/` 是业务核心，所有外部 API 调用都封装在此层。
- `config/` / `types/` 集中管理常量与类型，禁止业务代码硬编码（AGENTS.md 第 10 条）。

---

## 二、核心数据流（生成闭环）

```
用户一句话
   │
   ▼
[lib/llm/parse-intent.ts]  DeepSeek（JSON 模式，关 thinking）
   │  输出 SearchIntent { language, mood, energy, genres[], seedArtists[], bpmRange, count:10 }
   ▼
[lib/music/search.ts]  Audius /v1/tracks/search（免认证）
   │  用 mood + genre + bpm_min/max 直接筛选，召回 10 首真实歌曲
   │  输出 Song[] { id, title, artist, artworkUrl, previewUrl, streamUrl }
   ▼
[lib/llm/gen-reason.ts]  DeepSeek（每首歌生成 reason，可批量）
   │  输入：用户原句 + 歌曲元数据 → 输出 { reason: "..." }
   ▼
[lib/playlist/generate.ts]  合成最终 Playlist { id, prompt, songs[], createdAt }
   │
   ▼
[app/playlist.tsx]  渲染 SongCard 列表
```

**对话调整闭环**：
```
用户反馈（"再欢快一点" / "换掉第 3 首"）
   │
   ▼
[lib/llm/adjust-intent.ts]  当前 SearchIntent + 反馈 → 新 SearchIntent
   │
   ▼ （回到召回流程）lib/music/search.ts → gen-reason → 刷新歌单
```

---

## 三、三端差异隔离方案（简化后）

Audius 三端播放方式一致（普通 MP3，CORS 通配），**播放层不再需要平台分流**。唯一剩余的三端差异是 DeepSeek 调用（CORS）。

### 3.1 DeepSeek 调用（唯一需要平台分流处）

| 端 | 方式 | 实现 |
|---|---|---|
| iOS/Android (RN) | 直连 `api.deepseek.com`（原生网络栈，无 CORS） | `lib/llm/client.ts` 默认导出 |
| Web | 走 `edge/deepseek-proxy` 边缘函数（解决 CORS） | `lib/llm/client.web.ts` 覆盖 baseURL |

统一接口：`createLlmClient(apiKey)` → 返回 OpenAI 实例。`.web.ts` 把 baseURL 指向代理。

### 3.2 音乐播放（Audius，三端统一）

Audius stream URL 是普通 HTTPS MP3，CORS 通配、支持 Range，**三端用同一套播放代码**：

| 端 | 方式 |
|---|---|
| Web | `<audio src={streamUrl}>` 或 Web Audio API |
| iOS/Android | `expo-av`(`Audio.Sound.createAsync({uri})`) 或 SDK 57 的 `expo-audio` |

`lib/music/player.ts` 提供统一接口：
```ts
type Player = {
  play(song: Song): Promise<void>;        // 整曲播放（默认）
  playPreview(song: Song): Promise<void>; // 30s 试听（stream?preview=true）
  stop(): Promise<void>;
};
```
内部按平台选实现（Web 用 HTMLAudioElement，RN 用 expo-av），但**业务代码只调统一接口**。

### 3.3 Key 存储（不变）

| 端 | 存储 |
|---|---|
| iOS/Android | `expo-secure-store`（加密） |
| Web | AsyncStorage（明文，IndexedDB） |

---

## 四、依赖清单（更新后）

**运行时**：
- `expo` + Expo Router + react-native-web（SDK 57 默认模板自带）
- `@react-native-async-storage/async-storage`（持久化，三端）
- `expo-secure-store`（移动端加密存 key）
- `expo-av` 或 `expo-audio`（音频播放，三端通用）—— M1 确认 SDK 57 推荐项
- `expo-constants`（读 app.config 注入）
- `openai`（DeepSeek OpenAI 兼容客户端）

**边缘函数**：
- `hono`（最小 Web 框架，DeepSeek 代理 + CORS）

**❌ 移除**（Apple 方案）：
- `jsonwebtoken`（不再需要签发 Apple Developer Token）
- `tsx`（不再需要跑签名脚本）—— 保留作通用 TS 脚本运行器可选

---

## 五、与 AGENTS.md 原则的对应

| AGENTS.md 原则 | 本架构的体现 |
|---|---|
| 1 清晰目录结构 | 四层分层（app/components/lib/工具层） |
| 3 单一职责 | 每个 lib 模块只做一件事 |
| 4 复用 | Audius 三端播放统一，无需双实现 |
| 6 控制耦合 | app 不直接调外部 API，必经 lib |
| 9 删除废弃代码 | Apple 专有文件（签名脚本/token 文件）已移除 |
| 10 配置集中 | config/ + types/ 统一管理 |
