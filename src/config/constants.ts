/**
 * 全局常量集中管理。
 *
 * 业务代码不得硬编码端点、模型名、存储 key 等值，
 * 一律从此文件引用（AGENTS.md 第 10 条）。
 *
 * 所有数值的依据见 docs/contracts.md 与 docs/design.md 第四节。
 */

/** Audius API 接入配置（依据 docs/design.md §4.1-4.3） */
export const AUDIUS = {
  /** host 发现端点（启动时 GET 取 data[0]） */
  discoveryEndpoint: "https://api.audius.co",
  /** App 名称（Audius API 建议传 app_name 标识调用方） */
  appName: "此刻",
  /** 单次召回请求量（再在客户端筛到 TARGET_PLAYLIST_SIZE） */
  searchLimit: 25,
} as const;

/** DeepSeek / LLM 接入配置（依据 docs/design.md §4.6） */
export const DEEPSEEK = {
  /** OpenAI 兼容端点（当前文档不带 /v1） */
  apiBase: "https://api.deepseek.com",
  /** 快速低延迟模型，全小写 */
  model: "deepseek-v4-flash" as const,
  /** JSON 模式（prompt 必须含 "json" 字样） */
  jsonMode: { type: "json_object" } as const,
  /** 关闭 thinking（默认开且 high，必须显式关） */
  thinkingDisabled: { type: "disabled" } as const,
  /**
   * Web 端可选的代理 URL（部署 edge/deepseek-proxy 后填入）。
   * 留空则 Web 端直连 api.deepseek.com（可能受 CORS 拦截）。
   * 移动端 RN 无 CORS 限制，始终直连，忽略此值。
   */
  proxyUrl: "" as string,
} as const;

/** 歌单配置（依据 Q13） */
export const PLAYLIST = {
  /** 固定生成 10 首，召不够不补 */
  targetSize: 10 as const,
} as const;

/** 本地存储 key（依据 docs/contracts.md §5） */
export const STORAGE_KEYS = {
  /** 用户填入的 DeepSeek API key */
  deepseekApiKey: "deepseek_api_key",
  /** 历史歌单 Playlist[] 的 JSON */
  playlistsHistory: "playlists_history",
  /** 是否完成首次引导 */
  onboarded: "onboarded",
} as const;

/** 播放配置 */
export const PLAYBACK = {
  /** 封面图尺寸键（Audius artwork 直接给该尺寸的 URL） */
  artworkSizeKey: "480x480" as const,
  /** 试听模式参数（Audius stream 端点） */
  previewParam: "preview=true",
} as const;
