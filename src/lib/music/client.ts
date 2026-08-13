/**
 * Audius API 客户端。
 *
 * 职责（单一）：获取并缓存 Audius host，提供请求封装。
 * 依据 docs/contracts.md §3.1、docs/design.md §4.1。
 */

import { AUDIUS } from "@/config";

/** Audius host（模块级缓存，首次调用后填充） */
let cachedHost: string | null = null;

interface DiscoveryResponse {
  data: string[];
}

/**
 * 获取 Audius API host。
 * 首次调用时请求发现端点，取 data[0]（当前即 "https://api.audius.co"），后续返回缓存。
 */
export async function getAudiusHost(): Promise<string> {
  if (cachedHost) return cachedHost;
  const res = await fetch(AUDIUS.discoveryEndpoint);
  if (!res.ok) throw new Error(`Audius 发现端点请求失败: ${res.status}`);
  const json = (await res.json()) as DiscoveryResponse;
  const host = json.data?.[0];
  if (!host) throw new Error("Audius 发现端点未返回 host");
  cachedHost = host;
  return host;
}

/** 带超时的 fetch 封装（Audius 偶发慢响应的保护） */
export async function audiusFetch(path: string, params: Record<string, string>): Promise<Response> {
  const host = await getAudiusHost();
  const url = new URL(path, host);
  // 始终带 app_name 标识调用方
  url.searchParams.set("app_name", AUDIUS.appName);
  for (const [k, v] of Object.entries(params)) {
    if (v !== "" && v != null) url.searchParams.set(k, v);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new Error(`Audius 请求失败 ${url.pathname}: ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Search 返回的 track 在部分 Audius host 上不带 stream 字段。
 * 播放前按 id 解析真实音频地址，避免“列表有歌但点击播放无反应”。
 */
export async function resolveTrackStream(trackId: string): Promise<string> {
  const res = await audiusFetch(`/v1/tracks/${encodeURIComponent(trackId)}/stream`, {});
  const contentType = res.headers.get("content-type") ?? "";
  if (res.url && !contentType.includes("json")) return res.url;
  const json = (await res.json().catch(() => null)) as { data?: string | { url?: string } } | null;
  if (typeof json?.data === "string") return json.data;
  if (json?.data && typeof json.data === "object" && json.data.url) return json.data.url;
  throw new Error("未找到这首歌的播放地址");
}
