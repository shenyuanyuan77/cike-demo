/**
 * 快捷场景 Chip —— 带图标的场景选择按钮。
 *
 * 用于首页快捷选择常见场景（通勤/运动/深夜/旅行）。
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { Colors, Spacing } from "@/constants/theme";
import type { QuickScene } from "@/constants/quick-scenes";

interface QuickChipsProps {
  scenes: QuickScene[];
  onSelect: (scene: QuickScene) => void;
}

export function QuickChips({ scenes, onSelect }: QuickChipsProps) {
  return (
    <View style={styles.container}>
      {scenes.map((scene) => (
        <Pressable
          key={scene.key}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
          ]}
          onPress={() => onSelect(scene)}
          accessibilityLabel={`场景：${scene.label}`}
          accessibilityHint={`选择${scene.label}场景模板`}
        >
          <MaterialIcons
            name={scene.icon as any}
            size={18}
            color={Colors.dark.accentFrom}
          />
          <Text style={styles.label}>{scene.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  label: {
    color: "#E9E8F2",
    fontSize: 13,
    fontWeight: "500",
  },
});
