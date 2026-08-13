/**
 * 「此刻」只走暗色主题（见 constants/theme.ts 说明）。
 * 此 hook 保留为统一取色入口，业务代码用 useTheme() 而非直接读 Colors。
 */
import { Colors } from "@/constants/theme";

export function useTheme() {
  return Colors.dark;
}
