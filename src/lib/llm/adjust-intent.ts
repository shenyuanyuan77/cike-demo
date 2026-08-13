/**
 * adjust-intent：根据用户反馈调整检索意图。
 *
 * 依据 docs/contracts.md §2.2。
 */
import type { SearchIntent } from "@/types";

import { callJson, type ChatClient } from "./call-json";
import { ADJUST_INTENT_SYSTEM } from "./prompts";

type RawIntent = Omit<SearchIntent, "count"> & { count?: number };

/**
 * @param current 当前检索意图
 * @param feedback 用户反馈（如"再欢快一点"）
 * @param client DeepSeek 客户端
 */
export async function adjustIntent(
  current: SearchIntent,
  feedback: string,
  client: ChatClient,
): Promise<SearchIntent> {
  const userContent = JSON.stringify({ currentIntent: current, feedback });
  const raw = await callJson<RawIntent>(client, ADJUST_INTENT_SYSTEM, userContent);
  return {
    language: raw.language ?? current.language,
    mood: raw.mood ?? current.mood,
    audiusMood: raw.audiusMood ?? current.audiusMood,
    energy: typeof raw.energy === "number" ? raw.energy : current.energy,
    bpmRange: Array.isArray(raw.bpmRange) ? raw.bpmRange : current.bpmRange,
    genres: Array.isArray(raw.genres) ? raw.genres : current.genres,
    seedKeywords: Array.isArray(raw.seedKeywords) ? raw.seedKeywords : current.seedKeywords,
    count: 10,
  };
}
