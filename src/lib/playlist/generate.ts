/**
 * 歌单生成编排：意图 → 召回 → reason → Playlist。
 *
 * 依据 docs/architecture.md §二数据流、docs/contracts.md §四。
 *
 * key 不再由调用方传入 —— 从 .env 构建期注入（见 lib/llm/client.ts）。
 */

import type { Playlist, SearchIntent, Song } from "@/types";

import { createLlmClient, genReason, parseIntent } from "@/lib/llm";
import { searchSongs } from "@/lib/music/search";
import { buildDemoPlaylist, buildLocalPlaylist, inferIntent } from "./fallback";

/** 生成 uuid（Web 有 crypto.randomUUID；RN 无，用时间戳兜底） */
function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * 生成一份完整歌单。
 *
 * 流程：
 * 1. parseIntent：一句话 → SearchIntent
 * 2. searchSongs：意图 → Audius 召回真实歌曲
 * 3. genReason（并发）：每首歌 → reason
 * 4. 合成 Playlist
 *
 * @param scene 用户的一句话
 */
export async function generatePlaylist(scene: string): Promise<Playlist> {
  const fallbackIntent = inferIntent(scene);

  try {
    const client = await createLlmClient();
    const intent: SearchIntent = await parseIntent(scene, client);
    const rawSongs = await searchSongs(intent);
    if (rawSongs.length === 0) throw new Error("没有召回可播放歌曲");

    // 并发生成 reason（限制并发，避免瞬间打爆 LLM）
    const songs = await Promise.all(
      rawSongs.map(async (raw): Promise<Song> => ({
        ...raw,
        reason: await genReason(scene, { title: raw.title, artist: raw.artist }, client),
      })),
    );

    return {
      id: uuid(),
      title: `${scene.slice(0, 18)} · 精选`,
      prompt: scene,
      intent,
      songs,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    // 没有 key、LLM/CORS 暂时不可用时，仍然允许 demo 生成歌单：
    // 先尝试用本地规则召回真实 Audius 歌曲，网络也不可用再回退到内置展示数据。
    const rawSongs = await searchSongs(fallbackIntent);
    if (rawSongs.length > 0) return buildLocalPlaylist(scene, rawSongs, fallbackIntent);
    if (error instanceof Error && error.message.includes("没有召回")) {
      throw error;
    }
    return buildDemoPlaylist(scene, fallbackIntent);
  }
}
