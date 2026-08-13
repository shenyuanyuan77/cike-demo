/**
 * Expo 配置（静态版）。
 *
 * DeepSeek key 通过 EXPO_PUBLIC_ 环境变量机制注入（见 src/config/env.ts），
 * Expo 自动把 .env 中 EXPO_PUBLIC_ 前缀的变量编译进 process.env，
 * 无需在 app.config 里手动读取。
 */
import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "此刻",
  slug: "cike",
  version: "0.1.0",
  scheme: "cike",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.cike.demo",
  },
  android: {
    package: "app.cike.demo",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router", "expo-audio", "expo-asset"],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
