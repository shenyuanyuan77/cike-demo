/**
 * 暗色情绪化渐变背景（Q15）。
 *
 * 用 LinearGradent 实现深色 → 紫色调的氛围渐变。
 * RN 用 expo-linear-gradient；Web 用 CSS（expo-linear-gradient 在 web 有降级）。
 * 三端统一走 expo-linear-gradient 即可（SDK 54 支持 web）。
 */
import { LinearGradient } from "expo-linear-gradient";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";

interface Props {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function GradientBackground({ style, children }: Props) {
  return (
    <LinearGradient
      colors={["#151633", "#231B43", "#172442", Colors.dark.background]}
      locations={[0, 0.34, 0.72, 1]}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={[styles.base, style]}
    >
      <View style={[styles.glow, styles.glowPink]} />
      <View style={[styles.glow, styles.glowBlue]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    pointerEvents: "none",
    width: 520,
    height: 520,
    borderRadius: 260,
    opacity: 0.2,
  },
  glowPink: {
    backgroundColor: "#B96CA8",
    top: -210,
    left: "18%",
    shadowColor: "#E795D1",
    shadowOpacity: 0.7,
    shadowRadius: 100,
  },
  glowBlue: {
    backgroundColor: "#5976C5",
    right: -230,
    top: 80,
    shadowColor: "#7394EE",
    shadowOpacity: 0.65,
    shadowRadius: 110,
  },
});
