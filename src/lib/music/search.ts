/**
 * Audius 歌曲召回。
 *
 * 职责（单一）：用 SearchIntent 调 /v1/tracks/search 召回真实歌曲，映射字段。
 *
 * 召回策略（带降级，避免某些 query+genre+mood 组合命中空集）：
 * 1. 首选：query + genre + mood + bpm（最精准）
 * 2. 若 1 为空：query + genre（去掉 mood，mood 在叠加时容易导致空集）
 * 3. 若 2 为空：仅 query（文本检索兜底）
 * 4. 若 3 为空：该 genre 的 trending（最后兜底）
 *
 * 依据 docs/contracts.md §3.2、§3.3。
 */

import { AUDIUS, PLAYBACK, PLAYLIST } from "@/config";
import type { RawSong, SearchIntent } from "@/types";

import { audiusFetch } from "./client";

/** Audius track 资源结构（只取我们关心的字段） */
interface AudiusTrack {
  id: string;
  title: string;
  artwork: { "480x480"?: string; "1000x1000"?: string } | null;
  stream: { url?: string } | string | null;
  permalink: string | null;
  user?: { name?: string };
  duration?: number;
}

interface SearchResponse {
  data: AudiusTrack[];
}

/**
 * 用检索意图召回真实歌曲（免认证）。
 * 带降级策略，避免特定参数组合命中空集。
 */
export async function searchSongs(intent: SearchIntent): Promise<RawSong[]> {
  const genre = intent.genres[0] ?? "";
  const query = intent.seedKeywords.join(" ");

  // 构造各级降级的参数组合（从精到宽）
  const attempts: Record<string, string>[] = [];
  const full: Record<string, string> = { query, genre, mood: intent.audiusMood ?? "" };
  if (intent.bpmRange) {
    full.bpm_min = String(intent.bpmRange[0]);
    full.bpm_max = String(intent.bpmRange[1]);
  }
  attempts.push(full);
  // 降级 1：去 mood
  attempts.push({ query, genre });
  // 降级 2：仅 query
  if (query) attempts.push({ query });
  // 降级 3：trending by genre（不同端点，单独处理）

  for (const params of attempts) {
    const songs = await trySearch("/v1/tracks/search", params);
    if (songs.length > 0) return songs.slice(0, PLAYLIST.targetSize);
  }

  // 最后兜底：该 genre 的 trending
  if (genre) {
    const trending = await trySearch("/v1/tracks/trending", { genre });
    if (trending.length > 0) return trending.slice(0, PLAYLIST.targetSize);
  }

  // 实在没有任何结果
  return [];
}

/** 单次检索 + 字段映射，返回 RawSong[] */
async function trySearch(path: string, params: Record<string, string>): Promise<RawSong[]> {
  try {
    const res = await audiusFetch(path, { ...params, limit: String(AUDIUS.searchLimit) });
    const json = (await res.json()) as SearchResponse;
    const seen = new Set<string>();
    return (json.data ?? [])
      .map(mapTrack)
      .filter((s): s is RawSong => {
        if (!s.id || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
  } catch {
    return [];
  }
}

/** Audius track → RawSong 字段映射 */
function mapTrack(track: AudiusTrack): RawSong {
  const streamUrl = typeof track.stream === "string" ? track.stream : track.stream?.url ?? "";
  return {
    id: track.id,
    title: track.title,
    artist: track.user?.name ?? "未知艺人",
    artworkUrl:
      track.artwork?.[PLAYBACK.artworkSizeKey] ?? track.artwork?.["1000x1000"] ?? "",
    previewUrl: null, // 播放时现取（stream?preview=true）
    streamUrl,
    permalink: track.permalink,
    duration: track.duration,
  };
}
