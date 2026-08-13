/**
 * 动画加载光球 —— 渐变色圆形动画 + 跳动圆点。
 *
 * 使用 react-native-reanimated 实现流畅的脉冲/呼吸效果。
 * 对齐设计稿 Screen 2 的加载状态。
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Colors, Spacing } from "@/constants/theme";

/** 脉冲光球 —— 紫粉渐变 + 缩放呼吸 */
function PulseOrb() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [opacity, scale]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.orb, orbStyle]} />;
}

/** 单个跳动圆点 —— 通过 delay 形成错落动画 */
function BouncingDot({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(-8, { duration: 400, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) })
        )
      ),
      -1,
      true
    );
  }, [delay, translateY]);

  // 延迟启动，形成错落效果
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

/**
 * LoadingOrb —— 组合组件。
 *
 * 包含：
 * - 主标题文字
 * - 副标题文字
 * - 渐变光球（动画）
 * - 三个跳动圆点
 */
interface LoadingOrbProps {
  title?: string;
  subtitle?: string;
}

export function LoadingOrb({
  title = "正在为你生成歌单...",
  subtitle = "AI 正在理解你的描述",
}: LoadingOrbProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.orbContainer}>
        <PulseOrb />
      </View>

      <View style={styles.dotsRow}>
        <BouncingDot delay={0} />
        <BouncingDot delay={150} />
        <BouncingDot delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  orbContainer: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.accentFrom,
    // 模拟渐变效果（reanimated 不支持 LinearGradient 动画，
    // 用 opacity 叠加模拟）
    shadowColor: Colors.dark.accentTo,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  dotsRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.accentFrom,
  },
});
