/**
 * 平台检测 Hook —— 区分 Mobile / Tablet / Desktop。
 *
 * 用于响应式布局决策（导航模式、内容宽度、组件形态）。
 */
import { Platform, useWindowDimensions } from "react-native";

export interface PlatformInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function usePlatform(): PlatformInfo {
  const { width } = useWindowDimensions();
  return calc(width);
}

function calc(width: number): PlatformInfo {
  const isWeb = Platform.OS === "web";
  // Tablet detection: iOS has isTablet, Android/Web use pixel ratio + screen size
  const isTabletIOS = (Platform as any).isTablet === true;
  const isTabletAndroid =
    Platform.OS === "android" && width > 800;
  const isNativeTablet = isTabletIOS || isTabletAndroid;
  // Web 平台按断点区分：Mobile ≤768 | Tablet 769~1024 | Desktop >1024
  const isWebTablet = isWeb && width > 768 && width <= 1024;
  const isDesktop = isWeb && width > 1024;

  return {
    isMobile: !isNativeTablet && !isWebTablet && !isDesktop,
    isTablet: isNativeTablet || isWebTablet,
    isDesktop,
  };
}
