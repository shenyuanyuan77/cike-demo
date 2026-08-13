/**
 * parse-intent：把用户的一句话翻译成 Audius 检索意图。
 *
 * 依据 docs/contracts.md §2.1。
 */
import type { SearchIntent } from "@/types";

import { callJson, type ChatClient } from "./call-json";
import { PARSE_INTENT_SYSTEM } from "./prompts";

/** LLM 返回的原始结构（count 可能是 number，需校正为字面量 10） */
type RawIntent = Omit<SearchIntent, "count"> & { count?: number };

/**
 * @param scene 用户的一句话（心情/场景描述）
 * @param client DeepSeek 客户端
 */
export async function parseIntent(scene: string, client: ChatClient): Promise<SearchIntent> {
  const raw = await callJson<RawIntent>(client, PARSE_INTENT_SYSTEM, scene);
  return {
    language: raw.language ?? null,
    mood: raw.mood ?? "",
    audiusMood: raw.audiusMood ?? null,
    energy: typeof raw.energy === "number" ? raw.energy : 0.5,
    bpmRange: Array.isArray(raw.bpmRange) ? raw.bpmRange : null,
    genres: Array.isArray(raw.genres) ? raw.genres : [],
    seedKeywords: Array.isArray(raw.seedKeywords) ? raw.seedKeywords : [],
    count: 10,
  };
}
