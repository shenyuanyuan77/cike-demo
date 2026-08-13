# AI 歌单开源项目分析与集成方案

## 研究问题

1. 哪些开源项目已经验证了 AI 歌单产品中的关键用户路径？
2. 哪些推荐算法可以在当前 Expo + Audius + DeepSeek 架构中低成本复用？
3. 如何把“推荐看起来合理”推进到“结果可播放、可解释、可调整、可持续使用”？

## 检索范围与判断标准

本次检索以 GitHub 公开仓库的 README、功能列表、架构说明和许可证信息为依据，优先选择与 AI 歌单、音乐发现、推荐、跨端播放器直接相关的项目。外部项目的代码未直接复制；本仓库只吸收已公开描述的产品模式与算法思想，并保持当前项目的独立实现。

| 项目 | 可借鉴能力 | 证据与适配判断 |
| --- | --- | --- |
| [MediaSage](https://github.com/ecwilsonaz/mediasage) | 先过滤可用曲库，再让 AI 生成；流式生成；来源/缓存状态；从歌曲维度分析 | README 明确将 filter-first 与 filter-last 对比，并提供 prompt/track 两种入口。当前 demo 暂无本地音乐库，因此落地为“先召回 Audius、缺 key 时本地规则降级、播放前解析 stream”。 |
| [Digarr](https://github.com/iuliandita/digarr) | Collect → Analyze → Discover → Resolve → Score → Filter → Store；反馈学习；预览队列；多来源和多语言 | README 给出了七阶段管线、推荐分数、过滤、反馈和预览队列。当前先落地为可解释的意图标签、能量条、调整面板、歌单持久化和上一首/下一首队列。 |
| [AudioMuse-AI](https://github.com/NeptuneHub/AudioMuse-AI) | 声学聚类、相似歌曲、Song Paths、Song Alchemy、文本/歌词检索 | README 说明了基于音频指纹的相似歌曲、2D Music Map 和加减偏好的交互。当前 Audius 搜索接口没有稳定的音频特征流，因此不伪造声学分数；先保留相似推荐的产品入口，后续接入音频特征服务再做真实聚类。 |
| [Spotify Recommendation System](https://github.com/unkletam/Spotify-Recommendation-System) | content-based filtering、K-means 聚类、mean vector、cosine similarity | README 明确描述了“聚类定位 + 簇内余弦相似度排序”的流程，并提醒 content-based 容易产生 more-of-the-same。当前将其转化为意图驱动的召回与多样性预留点，不在没有音频特征数据时硬算相似度。 |
| [Jellify Music](https://github.com/Jellify-Music/App) | 跨端播放器、相似艺人、队列、离线、收藏、React Native 生态 | README 列出队列、shuffle、similar artists、offline playback、gapless 等能力，且使用 React Navigation、Reanimated 和矢量图标。当前 demo 优先修复播放器状态、队列和响应式导航，暂不引入 Zustand/Tamagui 等大型依赖。 |

## 已落地的集成

### 1. 可播放性优先

当前歌曲召回不再要求搜索响应必须含 `stream.url`。不同 Audius host 返回字段可能不一致，歌曲列表应先保留合法的 track metadata；真正播放时再调用 `/v1/tracks/{id}/stream` 解析地址。这样避免“搜索结果为空”的假故障，也符合 MediaSage 的 filter-first 精神：只有在真正播放前才判断可用性。

### 2. 多级降级生成

生成顺序为：

```text
自然语言 → DeepSeek 结构化意图 → Audius 召回 → reason 解释
                         ↘ 失败 → 本地意图规则 → Audius 召回 → 本地 reason
                                      ↘ 网络不可用 → 内置展示歌单
```

内置歌单用于保证 demo 的布局、历史、调整和播放器流程可演示；内置数据没有虚构的播放地址，点击播放时会明确提示“这是展示数据”，不会伪装成可播放内容。

### 3. 可解释的推荐结果

歌单头部现在展示 AI 标识、用户原始描述、情绪/流派标签、能量条和歌曲数量；每首歌保留 reason。它对应 Digarr 的“推荐卡片解释”和 Spotify 示例中的特征驱动排序，但不把没有真实数据支撑的相似度写成精确分数。

### 4. 调整与队列

歌单页的调整面板继续支持“更轻松 / 更治愈 / 更热闹 / 更安静”和自然语言反馈；播放条保留当前歌曲，点击可进入全屏播放器；全屏播放器可以加载当前歌单并切换上一首/下一首。暂停不会再让迷你播放器消失，进度条也不再固定写死为 30%。

### 5. 产品界面

首页改成“品牌锁定区 + 主叙事 + 生成卡片 + 场景入口 + 使用统计”的响应式布局；大屏使用双栏布局，移动端自动堆叠。历史页增加真实加载态、空态、歌单摘要和聚焦刷新；个人页补充推荐方式、音乐来源和本地存储说明。

## 未直接集成的能力

- 本地音频库缓存：当前没有 Plex/Jellyfin/Navidrome 数据源，直接引入会扩大部署和数据模型范围。
- 声学聚类 / 2D Music Map：需要稳定的音频特征提取或预计算数据；当前 Audius metadata 不足以证明结果。
- 协同过滤：当前只有单用户本地历史，没有可用的多用户交互矩阵。
- 自动下载、跨服务导出、OAuth：与当前 demo 的“生成并试听”边界不同，暂不引入。

## 后续可扩展接口

1. 给 `Song` 增加可选 `audioFeatures`，用标准化向量接入 cosine similarity 与 MMR 多样性重排。
2. 给历史记录增加 `feedback`、`playedAt`、`skipped`，形成可审计的反馈学习数据。
3. 将 `searchSongs` 的多个来源统一为 `CandidateSource`，可以并行合并 Audius、ListenBrainz、Last.fm 或本地库。
4. 为播放器增加统一的 `subscribe({ position, duration, ended })` 接口，替换当前跨端通用的轻量进度模拟。

## 参考项目许可证提醒

本次实现没有复制外部源代码。若后续直接移植代码或资源，需要在集成前再次核对仓库当前许可证、第三方依赖许可证和 attribution 要求；README 中显示的 MIT 项目也不代表其全部依赖均为 MIT。
