/**
 * 搜索输入框 —— 带闪光图标的输入框组件。
 *
 * 设计稿特征：圆角矩形 + 深色背景 + 右侧 ✨ 图标 + placeholder 提示。
 */
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  multiline?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = "今天想听点什么？",
  multiline = false,
}: SearchInputProps) {
  const isEmpty = !value.trim();

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.textSecondary}
        multiline={multiline}
        textAlignVertical="center"
        // 多行输入时仍使用 "send" 键，方便用户一键提交
        returnKeyType="send"
        onSubmitEditing={() => {
          // 仅在有内容时触发提交
          if (!isEmpty) onSubmit?.();
        }}
        accessibilityLabel="歌单描述输入框"
        accessibilityHint="输入你此刻的心情或场景，AI 将为你生成专属歌单"
      />
      <Pressable
        style={({ pressed }) => [styles.sendButton, isEmpty && styles.sendButtonDisabled, pressed && !isEmpty && styles.sendButtonPressed]}
        onPress={() => !isEmpty && onSubmit?.()}
        disabled={isEmpty}
        accessibilityRole="button"
        accessibilityLabel="生成歌单"
        accessibilityState={{ disabled: isEmpty }}
      >
        <Ionicons name="arrow-forward" size={21} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative" as const,
    width: "100%",
    shadowColor: "#111022",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  input: {
    color: "#28273B",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 30,
    paddingHorizontal: Spacing.four,
    paddingRight: 70,
    fontSize: 15,
    minHeight: 58,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  sendButton: {
    position: "absolute" as const,
    right: 7,
    top: 7,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.accentFrom,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.accentFrom,
    shadowOpacity: 0.42,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  sendButtonDisabled: { backgroundColor: "#B7B2C7", shadowOpacity: 0 },
  sendButtonPressed: { transform: [{ scale: 0.94 }], opacity: 0.86 },
});
