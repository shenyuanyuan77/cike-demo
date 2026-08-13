/**
 * 检索意图类型定义。
 *
 * SearchIntent 是 LLM（parse-intent）的输出、Audius Search（search.ts）的输入。
 * schema 依据 docs/contracts.md §1.1，是跨模块的数据契约，修改需同步更新文档。
 */

/** 目标语种偏好；null 表示不限。Audius 华语稀少，常为 en */
export type Language = "zh" | "en" | null;

/**
 * LLM 把用户的一句话翻译成的结构化检索意图。
 * 用于驱动 Audius /v1/tracks/search 召回真实歌曲（docs/architecture.md §二）。
 */
export interface SearchIntent {
  /** 目标语种偏好 */
  language: Language;
  /** 情绪关键词串（中文自然语言，供 reason 生成复用），如 "孤独、释然" */
  mood: string;
  /** Audius mood 枚举值（供 search.ts 的 mood 参数），如 "Peaceful" / "Energizing"；不确定时 null */
  audiusMood: string | null;
  /** 能量值 0-1：0=极度安静，1=极度亢奋。映射到 bpmRange */
  energy: number;
  /** BPM 区间，由 energy 推导或 LLM 直接给，如 [80, 110]；null 表示不限 */
  bpmRange: [number, number] | null;
  /** Audius 风格标签，如 ["Electronic", "Lo-fi", "Hip-Hop/Rap"] */
  genres: string[];
  /** 种子关键词（英文，供 Audius query 文本检索），如 ["rainy", "midnight"] */
  seedKeywords: string[];
  /** 目标歌曲数，固定为 PLAYLIST.targetSize（10） */
  count: 10;
}
