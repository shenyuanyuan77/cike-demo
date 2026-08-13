/**
 * 快捷场景定义 —— 首页场景 Chip 数据源。
 *
 * 每个场景包含：标签、图标名（MaterialIcons）、示例 prompt。
 */
export interface QuickScene {
  key: string;
  label: string;
  icon: string; // MaterialIcons icon name
  prompt: string;
}

export const QUICK_SCENES: QuickScene[] = [
  {
    key: "commute",
    label: "通勤",
    icon: "directions-car",
    prompt: "下班路上想听点轻松的歌",
  },
  {
    key: "sport",
    label: "运动",
    icon: "fitness-center",
    prompt: "运动时需要节奏感强的音乐",
  },
  {
    key: "night",
    label: "深夜",
    icon: "nightlight-round",
    prompt: "深夜独处想听安静治愈的歌",
  },
  {
    key: "travel",
    label: "旅行",
    icon: "flight-takeoff",
    prompt: "在路上想听自由开阔的音乐",
  },
];

/** 调整歌单快捷标签 */
export const ADJUST_TAGS = [
  { key: "relaxed", label: "更轻松" },
  { key: "healing", label: "更治愈" },
  { key: "energetic", label: "更热闹" },
  { key: "quiet", label: "更安静" },
];
