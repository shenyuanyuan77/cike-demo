/**
 * 歌单与歌曲类型定义。
 *
 * 依据 docs/contracts.md §1.2、§1.3，是跨模块的数据契约。
 */

import type { SearchIntent } from "./intent";

/**
 * 单首歌（Audius 召回结果 + LLM 生成的 reason）。
 *
 * ⚠️ streamUrl / previewUrl 带签名、短期失效。Song 对象里存的 URL 仅作短期引用；
 * 播放前应在 lib/music/player.ts 现取（调 /v1/tracks/{id}/stream）。
 */
export interface Song {
  /** Audius track id（字符串 permalink id，如 "95wro"） */
  id: string;
  /** 歌名 */
  title: string;
  /** 艺人名（Audius user.name） */
  artist: string;
  /** 封面图 URL（取 artwork["480x480"]，完整 URL 无占位符） */
  artworkUrl: string;
  /** 30 秒试听流 URL（stream?preview=true；带签名短期失效） */
  previewUrl: string | null;
  /** 整曲流 URL（stream.url，带签名短期失效；播放前现取更稳） */
  streamUrl: string;
  /** Audius track permalink（可选，供外链/分享） */
  permalink: string | null;
  /** "为什么这首歌契合用户此刻"，由 gen-reason 生成 */
  reason: string;
  /** 歌曲时长（秒），可选（Audius 不一定返回） */
  duration?: number;
}

/** 召回阶段尚未生成 reason 的歌曲（search.ts 输出） */
export type RawSong = Omit<Song, "reason">;

/** 一份完整歌单 */
export interface Playlist {
  /** 本地生成的 uuid */
  id: string;
  /** 歌单标题（可选，可从 prompt 或 LLM 生成） */
  title?: string;
  /** 用户原始一句话输入 */
  prompt: string;
  /** 生成时的检索意图（供对话调整复用） */
  intent: SearchIntent;
  songs: Song[];
  /** ISO 8601 时间戳 */
  createdAt: string;
}
