/**
 * 生成中页 —— 调真实生成流程，完成后跳转歌单页。
 *
 * 对齐设计稿 Screen 2：使用动画加载光球替代 ActivityIndicator。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground, LoadingOrb } from "@/components";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { generatePlaylist } from "@/lib/playlist/generate";
import { savePlaylist } from "@/lib/storage";

/** 生成超时时间（毫秒）—— 60 秒后自动提示用户 */
const GENERATE_TIMEOUT_MS = 60_000;

export default function GeneratingScreen() {
  const { prompt, _retry } = useLocalSearchParams<{ prompt: string; _retry?: string }>();
  const [error, setError] = useState<string | null>(() => (!prompt ? "缺少描述，请返回重新输入" : null));
  const [isTimeout, setIsTimeout] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 返回首页重新输入 */
  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  /** 重试生成 */
  const handleRetry = useCallback(() => {
    setError(null);
    setIsTimeout(false);
    // 触发重新执行 effect（通过重置一个 key 或直接调用）
    router.setParams({ prompt: prompt ?? "", _retry: Date.now().toString() });
  }, [prompt]);

  useEffect(() => {
    // 缺少 prompt 时提供返回按钮，而非死胡同
    if (!prompt) {
      return;
    }

    // 设置超时保护
    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true);
      setError("生成耗时较长，请检查网络后重试");
    }, GENERATE_TIMEOUT_MS);

    let cancelled = false;
    void run();
    async function run() {
      try {
        const playlist = await generatePlaylist(prompt);
        if (cancelled) return;
        // 清理超时定时器
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        await savePlaylist(playlist);
        router.replace({ pathname: "/playlist", params: { id: playlist.id } });
      } catch (e) {
        if (!cancelled) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    }
    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [prompt, _retry]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* 顶部栏：返回按钮 */}
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleGoBack}
            accessibilityLabel="返回"
            accessibilityHint="返回首页重新输入描述"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
          </Pressable>
        </View>

        <View style={styles.container}>
          {error ? (
            <View style={styles.errorContainer} accessibilityLiveRegion="polite">
              <Ionicons
                name={isTimeout ? "timer-outline" : "alert-circle-outline"}
                size={48}
                color={Colors.dark.accentTo}
                accessibilityElementsHidden
              />
              <Text style={styles.errorTitle}>
                {isTimeout ? "生成超时" : "生成失败"}
              </Text>
              <Text
                style={styles.errorDetail}
                accessibilityRole="alert"
              >
                {error}
              </Text>
              <View style={styles.errorActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.secondaryBtn,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={handleGoBack}
                  accessibilityLabel="返回首页"
                  accessibilityHint="返回重新输入描述"
                >
                  <Ionicons name="arrow-back" size={18} color={Colors.dark.text} />
                  <Text style={styles.actionBtnText}>返回</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.primaryBtn,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={handleRetry}
                  accessibilityLabel="重新生成"
                  accessibilityHint="使用相同描述重新尝试生成歌单"
                >
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>重试</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <LoadingOrb
              title="正在为你生成歌单..."
              subtitle="AI 正在理解你的描述"
            />
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    // 响应式约束
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: Spacing.three,
  },
  errorTitle: {
    color: Colors.dark.accentTo,
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  errorDetail: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.four + 4,
    paddingVertical: Spacing.two + 2,
    borderRadius: 12,
  },
  secondaryBtn: {
    backgroundColor: Colors.dark.backgroundElement,
  },
  primaryBtn: {
    backgroundColor: Colors.dark.accentFrom,
  },
  actionBtnText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
