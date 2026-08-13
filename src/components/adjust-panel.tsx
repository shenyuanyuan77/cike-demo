/**
 * 调整面板 —— 歌单调整输入区，含快捷标签 Chip。
 *
 * 对齐设计稿 Screen 5：
 * - 输入框 + 「调整歌单」按钮
 * - 快捷标签：更轻松、更治愈、更热闹、更安静
 */
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Spacing } from "@/constants/theme";
import { ADJUST_TAGS } from "@/constants/quick-scenes";

interface AdjustPanelProps {
  onSubmit: (feedback: string) => void;
  busy?: boolean;
}

export function AdjustPanel({ onSubmit, busy = false }: AdjustPanelProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleQuickTag = (label: string) => {
    onSubmit(label);
  };

  return (
    <View style={styles.container}>
      {/* 快捷标签行 */}
      <View style={styles.chipsRow}>
        {ADJUST_TAGS.map((tag) => (
          <Pressable
            key={tag.key}
            style={({ pressed }) => [
              styles.tagChip,
              pressed && styles.tagChipPressed,
              busy && styles.tagChipDisabled,
            ]}
            onPress={() => handleQuickTag(tag.label)}
            disabled={busy}
            accessibilityLabel={`调整：${tag.label}`}
            accessibilityHint="点击应用此调整风格"
          >
            <Text style={[styles.tagLabel, busy && styles.tagLabelDisabled]}>{tag.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* 输入区 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="想调整一下？"
          placeholderTextColor={Colors.dark.textSecondary}
          editable={!busy}
          multiline
          textAlignVertical="top"
          returnKeyType="send"
          onSubmitEditing={() => {
            if (!busy && text.trim()) handleSubmit();
          }}
          accessibilityLabel="歌单调整输入框"
          accessibilityHint="输入你想要的调整方向"
        />
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            (pressed || busy || !text.trim()) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={busy || !text.trim()}
          accessibilityLabel="提交调整"
          accessibilityHint={busy ? "正在处理中" : "根据输入调整歌单"}
        >
          {busy ? (
            <Ionicons name="hourglass-outline" size={18} color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitText}>调整歌单</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(11,13,29,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  tagChip: {
    backgroundColor: `${Colors.dark.accentFrom}15`,
    borderColor: Colors.dark.accentFrom,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
  },
  tagChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  tagChipDisabled: {
    opacity: 0.4,
  },
  tagLabel: {
    color: Colors.dark.accentFrom,
    fontSize: 13,
    fontWeight: "500",
  },
  tagLabelDisabled: {
    opacity: 0.5,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: Spacing.three,
    fontSize: 14,
    minHeight: 44,
    maxHeight: 80,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: Colors.dark.accentFrom,
    borderRadius: 20,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
});
