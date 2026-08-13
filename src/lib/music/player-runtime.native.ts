/**
 * 移动端播放器实现（expo-audio 命令式单例）。
 *
 * 依据 expo-audio SDK 54 实际类型（createAudioPlayer 是具名导出）：
 * - createAudioPlayer(source) → AudioPlayer（命令式，非 hook）
 * - 切歌用 player.replace(source)，复用实例
 * - 释放用 player.remove()
 *
 * 依据 docs/design.md §4.4。
 */
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

import type { Player } from "./player";
import type { Song } from "@/types";

let player: AudioPlayer | null = null;

function ensurePlayer(url: string): AudioPlayer {
  if (!player) {
    player = createAudioPlayer({ uri: url });
    return player;
  }
  player.replace({ uri: url });
  return player;
}

/** 给 stream URL 追加 preview=true 参数 */
function appendPreview(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("preview", "true");
    return u.toString();
  } catch {
    return url;
  }
}

export function getPlayer(): Player {
  return {
    async play(song: Song) {
      const p = ensurePlayer(song.streamUrl);
      p.play();
    },
    async playPreview(song: Song) {
      const p = ensurePlayer(appendPreview(song.streamUrl));
      p.play();
    },
    async stop() {
      if (!player) return;
      player.pause();
      try {
        await player.seekTo(0);
      } catch {
        // seekTo 失败不影响 stop 语义
      }
    },
  };
}
