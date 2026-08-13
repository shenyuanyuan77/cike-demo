/**
 * 「此刻」暗色情绪化主题（Q15：深色 + 渐变 + 大字号，烘托氛围，突出 reason）。
 *
 * 本产品只走暗色一套主题，不支持 light 模式 —— 音乐/情绪场景的视觉语言偏暗，
 * reason 文案在深色大字下最容易被「看见」，运行时始终使用 dark 配色。
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  dark: {
    /** 主文本：近白，保证暗底高对比 */
    text: "#F5F5F7",
    /** 页面背景：近黑，情绪化基调 */
    background: "#090A18",
    /** 卡片/区块背景：略亮于页面，用于歌曲卡、输入框 */
    backgroundElement: "#15172A",
    /** 选中态背景 */
    backgroundSelected: "#282945",
    /** 次要文本：reason 之外的说明文字 */
    textSecondary: "#A6A6B8",
    /** 强调色：情绪渐变起点（深紫蓝） */
    accentFrom: "#8065F6",
    /** 强调色：情绪渐变终点（粉紫） */
    accentTo: "#B88AF7",
    /** 半透明边界与玻璃卡片使用的中性色 */
    border: "#393852",
    /** 正向状态色 */
    success: "#6EE7B7",
    /** 提示状态色 */
    warning: "#FBBF24",
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 980;
