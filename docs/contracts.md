# 「此刻」接口契约

> 配套 `design.md` 与 `architecture.md`。本文档定义所有跨模块的数据 schema 与 Prompt 契约，是 lib 层实现的唯一依据。
> 音乐来源：Audius（2026-08-11 从 Apple Music 切换）。

---

## 一、核心数据类型（→ `src/types/`）

### 1.1 SearchIntent（检索意图，LLM 输出 → Audius 召回输入）

```ts
// src/types/intent.ts
interface SearchIntent {
  /** 目标语种偏好：zh / en / null(不限)。Audius 华语稀少，常为 en */
  language: "zh" | "en" | null;
  /** 情绪关键词串（自然语言，供 reason 生成复用），如 "孤独、释然" */
  mood: string;
  /** Audius mood 枚举值（供 search.ts 的 mood 参数），如 "Peaceful" / "Energizing" */
  audiusMood: string | null;
  /** 能量值 0-1，0=极度安静，1=极度亢奋。映射到 bpmRange */
  energy: number;
  /** BPM 区间，由 energy 推导或 LLM 直接给，如 [80, 110] */
  bpmRange: [number, number] | null;
  /** Audius 风格标签，如 ["Electronic", "Lo-fi", "Hip-Hop/Rap"] */
  genres: string[];
  /** 种子关键词（供 Audius query 文本检索），如 ["rainy", "midnight"] */
  seedKeywords: string[];
  /** 目标歌曲数，固定 10 */
  count: 10;
}
```

> 注：相比 Apple 方案，新增 `audiusMood` / `bpmRange` / `seedKeywords`，移除 `era`/`seedArtists`（Audius 按艺人检索意义不大，独立艺人知名度低）。`audiusMood` 取值需对齐 Audius swagger 的 mood 枚举（见 design.md §五实测项）。

### 1.2 Song（歌曲，Audius 召回结果）

```ts
// src/types/playlist.ts
interface Song {
  /** Audius track id（字符串 permalink id，如 "95wro"） */
  id: string;
  title: string;
  /** 艺人名（Audius user.name） */
  artist: string;
  /** 封面图 URL（取 artwork["480x480"]，已是完整 URL 无占位符） */
  artworkUrl: string;
  /** 30 秒试听流 URL（stream 端点 + ?preview=true；每次播放现取，不长存） */
  previewUrl: string | null;
  /** 整曲流 URL（stream.url，带签名短期失效；每次播放现取） */
  streamUrl: string;
  /** Audius track permalink（可选，供外链/分享） */
  permalink: string | null;
  /** 由 gen-reason 生成，"为什么这首歌契合用户此刻" */
  reason: string;
}
```

> ⚠️ `streamUrl` / `previewUrl` 带签名、**短期失效**。Song 对象里存的 URL 仅作短期引用；播放前应在 `lib/music/player.ts` 现取（调 `/v1/tracks/{id}/stream`），失败时回退到 Song 里存的 URL。

### 1.3 Playlist（歌单聚合）

```ts
// src/types/playlist.ts
interface Playlist {
  /** 本地生成 uuid */
  id: string;
  /** 用户原始一句话输入 */
  prompt: string;
  /** 生成时的检索意图（供对话调整复用） */
  intent: SearchIntent;
  songs: Song[];
  /** ISO 时间戳 */
  createdAt: string;
}
```

---

## 二、Prompt 契约（→ `src/lib/llm/prompts.ts`）

三个 Prompt 全部走 DeepSeek **JSON 模式**（`response_format: { type: "json_object" }`），**关闭 thinking**（`thinking: { type: "disabled" }`）。

### 2.1 parse-intent（一句话 → SearchIntent）

**System**：
```
你是一名资深音乐策展人。用户会用一句话描述当前的心情或场景，你需要把它翻译成
用于 Audius 音乐检索的结构化意图。Audius 是独立音乐平台，曲库以 Electronic /
Hip-Hop / Lo-fi / Ambient / Indie 为主。只输出 JSON，不要解释。

输出 JSON schema：
{
  "language": "zh" | "en" | null,
  "mood": "情绪关键词串，中文，如 孤独、释然",
  "audiusMood": "Audius mood 枚举值，从 Peaceful/Energizing/Sophisticated/Empowering/
                 Somber/Rowdy/Defiant 选一个，或 null",
  "energy": 0到1的数字,
  "bpmRange": [最低bpm, 最高bpm] | null,
  "genres": ["Audius 风格，如 Electronic, Lo-fi, Hip-Hop/Rap, Ambient"],
  "seedKeywords": ["英文检索关键词，如 rainy, midnight, lofi"],
  "count": 10
}

规则：
- count 恒为 10。
- energy 0=极静（ambient/sleep），1=极亢奋（workout 电子）。
- bpmRange 由 energy 推导：energy<0.3 → [60,90]，0.3-0.7 → [90,120]，>0.7 → [120,150]。
- audiusMood 不确定时填 null。
- genres 给 1-3 个最贴合的，用 Audius 常见流派。
- seedKeywords 给 2-4 个英文词，供 Audius 文本检索。
```

**User**：用户的一句话（原样传入）。

### 2.2 adjust-intent（当前意图 + 反馈 → 新意图）

**System**：
```
你在调整一个 Audius 音乐检索意图。给定当前意图 JSON 和用户的自然语言反馈，
输出调整后的新意图 JSON。只输出 JSON，不要解释。

输出 schema 与输入意图相同：
{ language, mood, audiusMood, energy, bpmRange, genres, seedKeywords, count }

调整规则：
- 反馈"再欢快/安静一点" → 调 energy，并相应更新 bpmRange。
- 反馈"换成英文/中文歌" → 调 language。
- 反馈"加点 X 风格" → 并入 genres。
- 反馈"换掉第 N 首" → 不改意图（由调用方处理）。
- count 恒为 10。
- 只在用户明确要求时改字段，其余保持原值。
```

**User**：JSON 序列化的 `{ currentIntent, feedback }`。

### 2.3 gen-reason（歌曲 + 场景 → reason 文案）

**System**：
```
你是音乐情绪策展人。给定用户描述的场景和一首歌的元数据，用一句简短、有画面感的话
说明"为什么这首歌契合此刻"。语气温暖、感性、像朋友推荐，不要机械罗列音乐特征。
只输出 JSON：{ "reason": "..." }

规则：
- 中文，≤30 字。
- 点到为止，不堆砌形容词。
- 紧扣用户场景，不要泛泛而谈。
```

**User**：JSON 序列化的 `{ scene, song: { title, artist, genre, mood } }`。

---

## 三、Audius Search 调用契约（→ `src/lib/music/search.ts`）

### 3.1 host 获取（启动时一次，缓存）

```
GET https://api.audius.co
→ { "data": ["https://api.audius.co"], ... }
取 data[0] 作为后续 host。
```

### 3.2 Track Search（召回主力，免认证）

```
GET {host}/v1/tracks/search
  ?query=<URL编码的seedKeywords空格拼接>
  &genre=<genres[0]>
  &mood=<audiusMood>
  &bpm_min=<bpmRange[0]>
  &bpm_max=<bpmRange[1]>
  &limit=25
  &app_name=此刻
```

**term 构造策略**（在 `search.ts` 内）：
- `query` 用 `seedKeywords` 空格拼接（如 `"rainy midnight lofi"`）。
- `genre` 取 `genres[0]`（Audius 单流派筛选更稳）。
- `mood` 取 `audiusMood`（null 时不传）。
- `bpm_min/max` 取 `bpmRange`（null 时不传）。
- `limit=25` 召回后，客户端按 energy 相关性筛到 10 首（召不够不补，Q13）。

### 3.3 Track 资源字段映射（Audius → Song）

| Audius 字段 | → Song 字段 |
|---|---|
| `id`（字符串） | `id` |
| `title` | `title` |
| `user.name` | `artist` |
| `artwork["480x480"]` | `artworkUrl` |
| （播放时现取 `/v1/tracks/{id}/stream?preview=true`） | `previewUrl` |
| `stream.url`（召回时内嵌） | `streamUrl` |
| `permalink` | `permalink` |
| （由 gen-reason 生成） | `reason` |

### 3.4 Stream 端点（播放时现取）

```
GET {host}/v1/tracks/{id}/stream          → 302 到签名 MP3（整曲）
GET {host}/v1/tracks/{id}/stream?preview=true  → 30s 试听片段
```
返回 302，follow 后是 `audio/mpeg` / 206 Partial Content / CORS 通配。

---

## 四、lib 模块函数签名契约

```ts
// src/lib/llm/client.ts
function createLlmClient(apiKey: string): OpenAI;  // baseURL 由平台扩展分流

// src/lib/llm/parse-intent.ts
async function parseIntent(scene: string, client: OpenAI): Promise<SearchIntent>;

// src/lib/llm/adjust-intent.ts
async function adjustIntent(current: SearchIntent, feedback: string, client: OpenAI): Promise<SearchIntent>;

// src/lib/llm/gen-reason.ts
async function genReason(scene: string, song: Pick<Song, "title" | "artist">, client: OpenAI): Promise<string>;

// src/lib/music/client.ts
async function getAudiusHost(): Promise<string>;  // 启动时取，缓存

// src/lib/music/search.ts
async function searchSongs(intent: SearchIntent): Promise<Omit<Song, "reason">[]>;

// src/lib/music/player.ts（统一接口，内部按平台分流）
interface Player {
  play(song: Song): Promise<void>;         // 整曲
  playPreview(song: Song): Promise<void>;  // 30s 试听
  stop(): Promise<void>;
}

// src/lib/playlist/generate.ts（编排）
async function generatePlaylist(scene: string, opts: { apiKey: string }): Promise<Playlist>;
```

> 相比 Apple 方案，`searchSongs` / `generatePlaylist` 不再需要 `developerToken` 参数（Audius 免认证）。

---

## 五、存储键契约（→ `src/lib/storage/`，不变）

| key | 值 | 存储 |
|---|---|---|
| `deepseek_api_key` | 用户填入的 DeepSeek key | SecureStore（移动）/ AsyncStorage（Web） |
| `playlists_history` | `Playlist[]` JSON | AsyncStorage |
| `onboarded` | `"1"` | AsyncStorage |
