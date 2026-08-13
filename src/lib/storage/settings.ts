/**
 * 用户设置持久化（DeepSeek key 等）。
 *
 * 平台分流（依据 docs/architecture.md §3.3）：
 * - 移动端：expo-secure-store（Keychain/Keystore 加密）
 * - Web：AsyncStorage（明文 IndexedDB，UI 需告知风险）
 *
 * 业务代码统一通过本模块读写，不直接碰 SecureStore/AsyncStorage。
 */
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { STORAGE_KEYS } from "@/config";

/** 读取 DeepSeek API key */
export async function getApiKey(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(STORAGE_KEYS.deepseekApiKey);
  }
  return SecureStore.getItemAsync(STORAGE_KEYS.deepseekApiKey);
}

/** 写入 DeepSeek API key（移动端加密，Web 明文） */
export async function setApiKey(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(STORAGE_KEYS.deepseekApiKey, key);
  } else {
    await SecureStore.setItemAsync(STORAGE_KEYS.deepseekApiKey, key);
  }
}

/** 清除 DeepSeek API key */
export async function clearApiKey(): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(STORAGE_KEYS.deepseekApiKey);
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.deepseekApiKey);
  }
}

/** 是否已完成首次引导 */
export async function isOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.onboarded)) === "1";
}

/** 标记已完成首次引导 */
export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.onboarded, "1");
}
