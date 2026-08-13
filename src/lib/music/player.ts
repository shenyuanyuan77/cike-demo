/**
 * 统一音乐播放接口（三端通用）。
 *
 * 平台实现：
 * - Web：HTMLAudioElement（player-runtime.web.ts）
 * - iOS/Android：expo-audio 命令式 API（player-runtime.native.ts）
 *
 * player-runtime.ts 提供无平台的兜底（理论上不会命中，三端都被平台文件覆盖）。
 * 业务代码只调本文件的 getPlayer()。
 * 依据 docs/contracts.md §3.4、§4。
 *
 * ⚠️ streamUrl 带签名短期失效；播放时优先用 Song 里存的，失败应现取。
 */

import type { Song } from "@/types";
import { resolveTrackStream } from "./client";
import { getPlayer as getPlatformPlayer } from "./player-runtime";

/** 统一播放器接口 */
export interface Player {
  /** 整曲播放（默认） */
  play(song: Song): Promise<void>;
  /** 30 秒试听（stream?preview=true） */
  playPreview(song: Song): Promise<void>;
  /** 停止播放 */
  stop(): Promise<void>;
}

// 这里统一补齐惰性 stream 解析，兼容 Audius 搜索结果没有 stream 字段的 host。
export async function getPlayer(): Promise<Player> {
  const platformPlayer = await getPlatformPlayer();
  const hydrate = async (song: Song): Promise<Song> => {
    if (song.streamUrl) return song;
    if (song.id.startsWith("demo-")) throw new Error("这是展示数据，配置音乐源后即可播放");
    return { ...song, streamUrl: await resolveTrackStream(song.id) };
  };
  return {
    play: async (song) => platformPlayer.play(await hydrate(song)),
    playPreview: async (song) => platformPlayer.playPreview(await hydrate(song)),
    stop: () => platformPlayer.stop(),
  };
}
