/**
 * 全局类型声明。
 */

/// <reference types="expo/env" />

// Expo 公共环境变量（.env 中 EXPO_PUBLIC_ 前缀，构建时注入 process.env）
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** DeepSeek API key（从 .env 注入） */
      EXPO_PUBLIC_DEEPSEEK_KEY?: string;
      /** Web 端可选的 DeepSeek 代理 URL */
      EXPO_PUBLIC_DEEPSEEK_PROXY_URL?: string;
    }
  }
}

declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
