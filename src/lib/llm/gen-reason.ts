/**
 * gen-reason：为单首歌生成"为什么契合此刻"的 reason 文案。
 *
 * 依据 docs/contracts.md §2.3。
 */
import type { Song } from "@/types";

import { callJson, type ChatClient } from "./call-json";
import { GEN_REASON_SYSTEM } from "./prompts";

interface ReasonResult {
  reason: string;
}

/**
 * @param scene 用户原始一句话场景
 * @param song 歌曲元数据（仅需 title/artist，但多带字段无妨）
 * @param client DeepSeek 客户端
 * @returns reason 文案字符串
 */
export async function genReason(
  scene: string,
  song: Pick<Song, "title" | "artist">,
  client: ChatClient,
): Promise<string> {
  const userContent = JSON.stringify({
    scene,
    song: { title: song.title, artist: song.artist },
  });
  const res = await callJson<ReasonResult>(client, GEN_REASON_SYSTEM, userContent);
  return res.reason?.trim() || "契合此刻的氛围。";
}
