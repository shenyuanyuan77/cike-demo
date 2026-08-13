/**
 * 运行时环境配置。
 *
 * 使用 Expo 的公共环境变量机制：.env 中以 EXPO_PUBLIC_ 开头的变量
 * 会在构建时被 Expo 注入到 process.env，运行时可直接读取。
 *
 * 私钥/key 永不出本机：.env 已 gitignore，不进仓库。
 * EXPO_PUBLIC_ 变量会被打包进客户端 bundle，仅适用于 demo 场景。
 */

/**
 * 获取 DeepSeek API key。
 * @returns key 字符串；未配置返回空串
 */
export function getDeepSeekApiKey(): string {
  return process.env.EXPO_PUBLIC_DEEPSEEK_KEY ?? "";
}

/**
 * 获取 Web 端可选的 DeepSeek 代理 URL。
 * @returns 代理 URL；未配置返回空串（直连）
 */
export function getDeepSeekProxyUrl(): string {
  return process.env.EXPO_PUBLIC_DEEPSEEK_PROXY_URL ?? "";
}
