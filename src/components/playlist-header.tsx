import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Spacing } from "@/constants/theme";
import { usePlatform } from "@/hooks/use-platform";
import type { Playlist } from "@/types";
import { MoodArtwork } from "./mood-artwork";

interface PlaylistHeaderProps { playlist: Playlist; onPlayAll: () => void; }

export function PlaylistHeader({ playlist, onPlayAll }: PlaylistHeaderProps) {
  const { isMobile } = usePlatform();
  const energy = Math.round((playlist.intent.energy ?? 0.5) * 100);
  const tags = [playlist.intent.mood, ...(playlist.intent.genres ?? [])].filter(Boolean).slice(0, 3);
  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={[styles.coverPanel, isMobile && styles.coverPanelMobile]}>
        <MoodArtwork rounded={16} />
      </View>
      <View style={[styles.info, isMobile && styles.infoMobile]}>
        <View style={styles.kickerRow}><View style={styles.aiTag}><Ionicons name="sparkles" size={12} color={Colors.dark.accentFrom} /><Text style={styles.aiTagText}>AI 为你生成</Text></View><Text style={styles.date}>{formatDate(playlist.createdAt)}</Text></View>
        <Text style={styles.title}>{playlist.title || "此刻精选"}</Text>
        <Text style={styles.prompt} numberOfLines={2}>“{playlist.prompt}”</Text>
        <View style={styles.tags}>{tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View>
        <View style={styles.energyRow}><Text style={styles.energyLabel}>能量</Text><View style={styles.energyTrack}><View style={[styles.energyFill, { width: `${energy}%` }]} /></View><Text style={styles.energyValue}>{energy}%</Text><Text style={styles.songCount}>{playlist.songs.length} 首</Text></View>
        <View style={styles.actionRow}>
          <Pressable style={({ pressed }) => [styles.playAllBtn, pressed && styles.pressed]} onPress={onPlayAll} accessibilityLabel="播放全部" accessibilityHint={`播放歌单中的全部 ${playlist.songs.length} 首歌曲`}><Ionicons name="play" size={16} color="#FFFFFF" /><Text style={styles.playAllText}>播放全部</Text></Pressable>
          <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]} accessibilityLabel="收藏歌单"><Ionicons name="heart-outline" size={21} color={Colors.dark.text} /></Pressable>
          <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]} accessibilityLabel="更多选项"><Ionicons name="ellipsis-horizontal" size={21} color={Colors.dark.text} /></Pressable>
        </View>
      </View>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: Spacing.four, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four, backgroundColor: "transparent", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)" },
  containerMobile: { flexDirection: "column", paddingHorizontal: Spacing.three, gap: Spacing.three },
  coverPanel: { width: 148, height: 126, borderRadius: 16, overflow: "hidden", backgroundColor: Colors.dark.accentFrom, justifyContent: "center", alignItems: "center", position: "relative" },
  coverPanelMobile: { width: "100%", height: 142 },
  info: { flex: 1, justifyContent: "center", gap: Spacing.two },
  infoMobile: { minWidth: 0 },
  kickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aiTag: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  aiTagText: { color: Colors.dark.accentFrom, fontSize: 11, fontWeight: "700" },
  date: { color: Colors.dark.textSecondary, fontSize: 11 },
  title: { color: Colors.dark.text, fontSize: 25, fontWeight: "800", letterSpacing: -0.4 },
  prompt: { color: Colors.dark.textSecondary, fontSize: 13, lineHeight: 19 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: "rgba(99,102,241,0.12)", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: "#B9B7FF", fontSize: 11 },
  energyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  energyLabel: { color: Colors.dark.textSecondary, fontSize: 11 },
  energyTrack: { width: 86, height: 4, borderRadius: 2, backgroundColor: Colors.dark.backgroundSelected, overflow: "hidden" },
  energyFill: { height: "100%", borderRadius: 2, backgroundColor: Colors.dark.accentTo },
  energyValue: { color: Colors.dark.textSecondary, fontSize: 11, width: 34 },
  songCount: { color: Colors.dark.textSecondary, fontSize: 11, marginLeft: 4 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  playAllBtn: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: Colors.dark.accentFrom, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  playAllText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: "center", alignItems: "center" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});
