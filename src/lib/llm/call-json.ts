/**
 * DeepSeek 调用的共享 helper。
 *
 * 三个 LLM 调用（parse/adjust/gen-reason）都走相同的 JSON 模式 + 关闭 thinking 配置，
 * 抽成单一 helper 复用（AGENTS.md 第 4 条：避免重复实现）。
 *
 * client 类型用结构化最小接口而非 openai 的 OpenAI 类，
 * 避免顶层类型导入触发 openai 包的循环依赖。
 */
import { DEEPSEEK } from "@/config";

/** OpenAI 兼容客户端的最小调用接口（鸭子类型，不依赖 openai 包类型） */
export interface ChatClient {
  chat: {
    completions: {
      create: (options: Record<string, unknown>) => Promise<{
        choices: { message?: { content?: string } }[];
      }>;
    };
  };
}

/**
 * 以 JSON 模式调用 DeepSeek，解析返回的 JSON 对象。
 *
 * @param client DeepSeek 客户端
 * @param systemPrompt 系统提示词（必须含 "json" 字样）
 * @param userContent 用户消息内容
 * @returns 解析后的 JSON 对象
 */
export async function callJson<T>(
  client: ChatClient,
  systemPrompt: string,
  userContent: string,
): Promise<T> {
  const res = await client.chat.completions.create({
    model: DEEPSEEK.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: DEEPSEEK.jsonMode,
    thinking: DEEPSEEK.thinkingDisabled,
    max_tokens: 2048,
    stream: false,
  });
  const content = res.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}
