# 「此刻」开发里程碑

> 配套 `design.md` / `architecture.md` / `contracts.md`。本文档列出阶段 B（骨架）之后的功能开发路线。
> 音乐来源：Audius（2026-08-11 从 Apple Music 切换）。

---

## M0 — 骨架就绪（阶段 B 产出）

**交付**：可运行的三端 Expo 空骨架 + DeepSeek 代理函数。
**验收**：
- `npx expo start` 三端 dev server 起得来
- `npx expo export -p web` 能导出 `dist/`
- 三个 Router 页面占位可导航，暗色主题生效
- 类型检查 `tsc --noEmit` 全过

---

## M1 — 核心闭环打通（生成 → 播放）

**目标**：用户输入一句话 → 看到 10 首真实歌曲 + reason → 能整曲播放。

> 相比 Apple 方案，M1 已包含整曲播放（Audius 无订阅门槛、三端 App 内播放），无需单独 M2。

- [ ] `src/lib/llm/client.ts` + 平台扩展（移动直连 / Web 代理）
- [ ] `src/lib/llm/parse-intent.ts` + Prompt 调通，输出合法 SearchIntent JSON
- [ ] `src/lib/music/client.ts`：Audius host 获取 + 缓存
- [ ] `src/lib/music/search.ts`：`/v1/tracks/search` 召回 + 字段映射
- [ ] `src/lib/llm/gen-reason.ts`：批量生成 reason
- [ ] `src/lib/playlist/generate.ts`：编排上述模块
- [ ] `src/app/index.tsx`：输入页（大输入框 + 示例 placeholder）
- [ ] `src/app/generating.tsx`：生成中情绪化动效
- [ ] `src/app/playlist.tsx`：SongCard 列表渲染
- [ ] `src/components/SongCard` + `ReasonHighlight`
- [ ] `src/lib/music/player.ts`：统一播放接口（Web HTMLAudio / RN expo-av）
- [ ] 播放控件接 `streamUrl`（每次播放前现取 stream URL，不长缓存）
- [ ] 装 `expo-av`（或确认 SDK 57 的 `expo-audio`）

**验收**：真机/Web 上输入"rainy midnight lofi"，得到 10 首带 reason 的独立音乐，点播放能整曲播放。

---

## M2 — 对话调整

**目标**：歌单页底部对话栏，支持整体风格调整 / 增删。

- [ ] `src/components/ChatBar`
- [ ] `src/lib/llm/adjust-intent.ts` + Prompt 调通
- [ ] 接入 `generatePlaylist` 的"重新生成"流程（保持 prompt，换 intent）
- [ ] "换掉第 N 首"的单独处理（单首替换，不走整体重召）
- [ ] 调整时的局部 loading 状态

**验收**：说"再欢快一点"歌单整体换风格；说"换掉第 3 首"只替换该首。

---

## M3 — 持久化与历史

**目标**：免登录也能看历史歌单。

- [ ] `src/lib/storage/settings.ts`：DeepSeek key 的存取（移动加密 / Web 明文 + 风险告知）
- [ ] `src/lib/storage/playlists.ts`：历史歌单存取
- [ ] 首次启动引导（填 key + Web 端风险告知）
- [ ] 历史歌单入口

**验收**：关 App 重开能看上次生成的歌单；Web 端首次填 key 有风险提示。

---

## M4（可选，非 demo 必做）

- 分享歌单（短链 + 后端存歌单）
- 账号系统
- 歌词同步
- 音乐可视化
- 能量曲线编排（按 BPM/能量排序歌单）
- 30s 试听模式切换（stream?preview=true）
- 升级回 Apple Music 路径（若未来取得凭据，作华语主流曲库补充）

---

## 开发期实测清单（贯穿 M1）

| 项 | 何时实测 | 确认方式 |
|---|---|---|
| Audius `mood` 枚举全集 | M1 | `https://api.audius.co/v1/swagger.yaml` |
| stream URL TTL（失效时长） | M1 | 播放后定时重试，定刷新策略 |
| `expo-av` vs `expo-audio`（SDK 57 推荐） | M1 | docs.expo.dev，确认 API |
| Audius 商用授权条款 | 上线前 | 邮件问 Audius（demo 不阻塞） |
