/**
 * DeepSeek 客户端（纯 fetch，不依赖 openai SDK）。
 *
 * 不用 openai npm 包的原因：该包内部存在 CJS 循环引用
 *（resources/chat/index.js 引用未初始化的 ChatCompletionStoreMessagesPage），
 * Metro/RN bundler（含动态 import）在 Web 端运行时仍会触发
 * "Cannot access X before initialization"。DeepSeek 是 OpenAI 兼容 REST 端点，
 * 直接 fetch /chat/completions 即可，彻底避开该包。
 *
 * Key 来源（按优先级）：
 * 1. 构建期从 .env 注入的 key（getDeepSeekApiKey）—— 用户无需在 App 内填写
 * 2. 本地存储的 key（getApiKey）—— 兜底，未来若支持多用户切换
 *
 * 平台分流：
 * - 移动端 RN：直连 api.deepseek.com（无 CORS）
 * - Web：若配置代理则走代理，否则直连
 *
 * 依据 docs/architecture.md §3.1、docs/design.md §4.6。
 */
import { Platform } from "react-native";

import { DEEPSEEK } from "@/config";
import { getDeepSeekApiKey, getDeepSeekProxyUrl } from "@/config/env";
import type { ChatClient } from "./call-json";
import { getApiKey } from "@/lib/storage";

interface ChatCompletionResponse {
  choices: { message?: { content?: string | null } }[];
}

/** 获取生效的 DeepSeek key：优先构建期注入，兜底本地存储 */
async function resolveApiKey(): Promise<string> {
  const injected = getDeepSeekApiKey();
  if (injected) return injected;
  return (await getApiKey()) ?? "";
}

/**
 * 创建 DeepSeek 客户端（纯 fetch 实现）。
 * 无需传 key —— 内部按优先级自动解析。
 */
export async function createLlmClient(): Promise<ChatClient> {
  const proxyUrl = getDeepSeekProxyUrl();
  const baseURL = Platform.OS === "web" && proxyUrl ? proxyUrl : DEEPSEEK.apiBase;

  return {
    chat: {
      completions: {
        create: async (options: Record<string, unknown>) => {
          const apiKey = await resolveApiKey();
          if (!apiKey) {
            throw new Error("未配置 DeepSeek API key，请在项目根 .env 填写 EXPO_PUBLIC_DEEPSEEK_KEY");
          }
          const res = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(options),
          });
          if (!res.ok) {
            const detail = await res.text().catch(() => res.statusText);
            throw new Error(`DeepSeek 请求失败 ${res.status}: ${detail.slice(0, 200)}`);
          }
          const json = (await res.json()) as ChatCompletionResponse;
          return {
            choices: json.choices.map((c) => ({
              message: { content: c.message?.content ?? undefined },
            })),
          };
        },
      },
    },
  };
}
