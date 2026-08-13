/**
 * Web 端播放器实现（HTMLAudioElement 单例）。
 *
 * Audius stream URL CORS 通配、支持 Range，<audio> 直接可用。
 * 依据 docs/design.md §4.4、agent 核实结论。
 */
import type { Player } from "./player";
import type { Song } from "@/types";

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
  }
  return audio;
}

export function getPlayer(): Player {
  return {
    async play(song: Song) {
      const a = getAudio();
      a.src = song.streamUrl;
      await a.play();
    },
    async playPreview(song: Song) {
      // 试听模式：stream 端点加 ?preview=true
      const a = getAudio();
      a.src = appendPreview(song.streamUrl);
      await a.play();
    },
    async stop() {
      const a = getAudio();
      a.pause();
      a.currentTime = 0;
    },
  };
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
