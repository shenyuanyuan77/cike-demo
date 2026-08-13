# 「此刻」设计共识文档

> 本文件是「此刻」AI 歌单 App 的北极星文档。所有后续开发、架构变更、功能取舍都以此为准。
> 锁定日期：2026-08-11。来源：grilling 会话（16 项决策）+ 多轮技术核实。

---

## ⚠️ 重大变更（2026-08-11）：音乐来源从 Apple Music 改为 Audius

**原方案**：音乐来源 = Apple Music（grilling Q1-Q16 锁定）。
**新方案**：音乐来源 = **Audius**（开放音乐协议，docs.audius.co）。

**变更原因**：用户无 Apple Developer 凭据（$99/年会员 + MusicKit key），无法跑通真实召回与整曲播放。经核实，Audius 在 demo 场景下反而更优：

| 维度 | Apple Music（原） | Audius（新） |
|---|---|---|
| 认证 | 需要 Developer Token（.p8 私钥签发） | **完全免认证** |
| 凭据成本 | $99/年 Apple Developer Program | **零成本** |
| 30s 试听 | 免订阅 | `stream?preview=true` |
| 整曲播放 | 需用户 Apple Music 订阅（¥10/月） | **免费、无订阅门槛** |
| 播放方式 | Web 内嵌 / 移动端拉起官方 App | **三端 App 内直接播放**（普通 MP3，CORS 通配） |
| 检索能力 | Catalog Search（文本） | **支持 mood/genre/bpm 直接筛选** |
| 曲库 | 华语主流齐全 | ~200 万首，**Electronic/Hip-Hop 为主，华语稀少** |
| 大陆访问 | 官方可用 | 全球可用（单网关 `api.audius.co`） |

**因此作废的决策**：Q9（构建期签发 Developer Token）、Q11（移动端拉起 App）、Q12（未订阅引导）—— Audius 无订阅门槛，三端 App 内播放。

**产品定位的连带调整**：原「华语心情歌单」场景命中率下降，定位调整为「**情绪/场景驱动的独立音乐发现**」。reason 文案仍是核心卖点，但曲风以 Electronic/Hip-Hop/Lo-fi/Indie 为主。

---

## 一、产品定位（更新后）

**一句话描述心情或场景 → AI 生成个性化歌单 → 对话调整 → 试听 → 一键播放。**

核心魔法时刻：用户输入「雨夜下班路上想安静一会」→ 30 秒内得到 10 首贴切的歌，每首都附带「为什么这首歌契合你此刻」的 reason 文案。

核心卖点是 **reason 文案**（情绪共鸣），不是推荐算法本身。

**曲风基调**：独立音乐、Electronic、Hip-Hop、Lo-fi、Ambient、Indie。华语主流覆盖弱。

---

## 二、硬约束（不可妥协，更新后）

| 约束 | 来源 | 影响 |
|---|---|---|
| **音乐来源 = Audius** | 重大变更 | 免认证、整曲免费播放、App 内播放、CORS 通配 |
| **个人 + demo 优先 + 原生能力有限** | Q3 | 架构纯 JS 三端同构，不碰原生模块 |
| **DeepSeek `deepseek-v4-flash`** | Q6 | 全小写，关闭 thinking，JSON 输出，大陆直连 |
| **三端 App 内播放** | Audius 特性 | 不拉起外部 App，expo-av/expo-audio 内嵌 |

### 为什么是 Audius（核实结论摘要）

- 网易云 / QQ 音乐：**无开放 API**，逆向项目已归档，商用违法。❌
- Spotify / YouTube：大陆不可用 / 无 Music API。❌
- Apple Music：合法但**需 $99/年凭据 + 整曲需用户订阅**，demo 阶段阻塞。⚠️（保留为未来升级路径）
- **Audius**：免认证、整曲免费流式、CORS 通配、支持 mood/genre/bpm 筛选、三端 App 内播放。✅

---

## 三、决策表（更新后）

### 仍有效的决策

| # | 决策 | 值 |
|---|---|---|
| Q1 | 目标市场 | 全球（Audius 无区域限制；原大陆优先已放宽） |
| Q2 | 跨端架构 | Expo (RN) + Web 同构 |
| Q3 | 团队/预算 | 个人 demo + DeepSeek key + 前端 OK / 原生有限 |
| Q4 | MVP 范围 | 核心必做闭环，免登录 |
| Q5 | 后端 | 纯前端 + 极小 DeepSeek 代理（Web 端 CORS）；Audius 直连无代理 |
| Q6 | LLM 模型 | `deepseek-v4-flash`，关 thinking，JSON 输出 |
| Q7 | 歌单 schema | `title` / `artist` / `reason` + `artworkUrl` / `previewUrl` / `streamUrl` |
| Q8 | 持久化 | AsyncStorage（Web→IndexedDB） |
| Q10 | 幻觉控制 | 召回式：LLM 出检索标签 → Audius Search 召回真实歌曲 |
| Q13 | 歌单数量 | 固定 10 首，召不够不补 |
| Q14 | 骨架 | 单 Expo 仓 + Expo Router + react-native-web |
| Q15 | UI 风格 | 暗色情绪化 |
| Q16 | 执行顺序 | A→C→B |

### 作废的决策（Apple 方案，留档）

| # | 原决策 | 作废原因 |
|---|---|---|
| Q9 | 构建期签发 Apple Developer Token | Audius 免认证，无需 token |
| Q11 | 移动端拉起 Apple Music App | Audius 三端 App 内直接播放 |
| Q12 | 未订阅用户引导 | Audius 无订阅门槛 |

### 新增/变更的决策

| # | 决策 | 值 |
|---|---|---|
| Q9' | 音乐 API 认证 | 无（Audius 读取/播放全免认证） |
| Q11' | 播放方式 | 三端统一用 `expo-av`/`expo-audio` 内嵌播放（stream URL 是普通 MP3） |
| Q12' | 试听 vs 整曲 | 默认整曲播放；30s 试听是 stream 端点 `?preview=true` 的可选模式 |

---

## 四、技术核实结论（Audius，已实测）

来源：docs.audius.co + `api.audius.co` 实时探测（2026-08-11）。

### 4.1 API 基础
- **Base URL**：启动时 `GET https://api.audius.co` → 返回 `{data:[host列表]}`，取 `data[0]`（当前即 `https://api.audius.co`）。单网关模型。
- **认证**：读取/搜索/播放**完全免认证**。`api_key` 仅写操作需要。
- **官方 SDK**：`@audius/sdk` 存在但非必须，直接 `fetch` 即可。
- **速率限制**：官方文档未提及（未从正文核实），实测连续调用未限流。

### 4.2 检索召回
- **端点**：`GET {host}/v1/tracks/search`
- **关键参数**（全部实测生效）：
  - `query` — 文本检索（可空）
  - `genre` — 流派（Electronic / Hip-Hop/Rap / Lo-fi / Ambient / Pop 等）
  - `mood` — **心情**（Peaceful / Energizing / Sophisticated / Empowering 等）
  - `bpm_min` / `bpm_max` — BPM 区间
  - `limit` / `offset` — 分页
- **返回字段**：`id`(字符串)、`title`、`genre`、`mood`、`bpm`、`duration`、`artwork`(`{"150x150","480x480","1000x1000"}` 直接 URL)、`stream`(`{url, mirrors}` 已内嵌可播地址)、`user`(`{handle, name, ...}`)

### 4.3 整曲流式播放
- **端点**：`GET {host}/v1/tracks/{id}/stream`
- **行为**：302 重定向到签名 MP3 URL，最终 `206 Partial Content` / `Content-Type: audio/mpeg` / 支持 Range。
- **CORS**：`Access-Control-Allow-Origin: *` —— Web 端 `<audio>` / fetch 直接可用。
- **免费/合法/无 DRM**：已实测，匿名即可整曲播放，返回裸 MP3。
- **流 URL 时效性**：带签名，**短期失效**（TTL 官方未文档化）→ 每次播放现取，不长缓存。
- **30s 试听**：stream 端点加 `?preview=true`。

### 4.4 三端播放集成
| 端 | 方式 | 依据 |
|---|---|---|
| Web | `<audio src={streamUrl}>` / Web Audio | CORS 通配、audio/mpeg、支持 Range |
| iOS/Android | `expo-av`(`Audio.Sound.createAsync({uri})`) 或 `expo-audio` | 普通 HTTPS MP3，无需原生模块、无需拉起外部 App |

### 4.5 曲库性质
- **规模**：~200 万首（由 `/v1/genres/popular` 流派计数推得）。
- **主力曲风**：Electronic（~36 万）+ Hip-Hop/Rap（~35 万）占绝对主导。
- **华语**：存在但稀少（实测 `query=华语` 仅 2 首）。召回需主要面向英文/电音/Hip-hop 场景。
- **独立音乐人为主**，无主流厂牌。

### 4.6 DeepSeek（不变，仍有效）
- 模型 `deepseek-v4-flash`，base `https://api.deepseek.com`，JSON 模式 `response_format:{type:"json_object"}`，关 thinking `thinking:{type:"disabled"}`，大陆直连。

---

## 五、开发期需实测确认的项（Audius 相关）

1. **stream URL TTL**：官方未文档化，开发时观察失效时长，定下"现取"策略的刷新时机。
2. **Audius 商用授权成文条款**：stream 是 sanctioned 消费方式，但无 explicit 商用条款 → 上线前向 Audius 确认（demo 阶段不阻塞）。
3. **`mood` 取值全集**：实测 Peaceful/Energizing/Sophisticated/Empowering 生效，完整集合查 swagger。
4. **expo-av vs expo-audio**：SDK 57 推荐 `expo-audio`，确认其 API（旧 `expo-av` 的 `Audio.Sound.createAsync` 在新模块可能是 `useAudioPlayer`）。

---

## 六、风险登记（更新后）

| # | 风险 | 严重度 | 缓解 |
|---|---|---|---|
| 1 | DeepSeek Web 端 CORS | 高 | Web 走最小边缘代理（不变） |
| 2 | Web 端 DeepSeek key 明文存储 | 中 | UI 风险告知；移动端 SecureStore |
| 3 | Audius 曲库华语稀少，原"华语心情歌单"定位失效 | 中 | 定位调整为独立/电音/情绪发现；reason 文案补足情绪共鸣 |
| 4 | stream URL 短期失效 | 低 | 每次播放现取，不长缓存 |
| 5 | Audius 商用授权无成文条款 | 低 | demo 阶段不阻塞；上线前确认 |
| 6 | MusicKit JS / Apple 方案细节 | — | 已作废，不再相关 |

---

## 七、变更记录

| 日期 | 变更 | 原因 |
|---|---|---|
| 2026-08-11 | 初版锁定（16 决策，Apple Music 路径） | grilling 会话 |
| 2026-08-11 | Q5 修正：D → D + 极小 DeepSeek 代理 | 技术核实发现 Web CORS |
| 2026-08-11 | **音乐来源 Apple Music → Audius；Q9/Q11/Q12 作废** | 用户无 Apple 凭据；Audius 核实更优 |
