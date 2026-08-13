/**
 * 底部对话调整栏（M2：对话调整）。
 *
 * 用户输入反馈（如"再欢快一点""换掉第 3 首"），触发重新生成。
 * 依据 docs/contracts.md §2.2、docs/milestones.md M2。
 */
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Colors, Spacing } from "@/constants/theme";

interface Props {
  /** 提交反馈，返回 Promise；进行中显示 loading */
  onSubmit: (feedback: string) => Promise<void>;
  /** 是否正在处理上一条反馈 */
  busy?: boolean;
}

export function ChatBar({ onSubmit, busy }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setText("");
    await onSubmit(trimmed);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="说点什么，比如「再欢快一点」"
        placeholderTextColor={Colors.dark.textSecondary}
        editable={!busy}
      />
      <Pressable style={styles.sendButton} onPress={handleSubmit} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={Colors.dark.text} size="small" />
        ) : (
          <Text style={styles.sendText}>调整</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.dark.background,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Colors.dark.accentFrom,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 64,
  },
  sendText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
