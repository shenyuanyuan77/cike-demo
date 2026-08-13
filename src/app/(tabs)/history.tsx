import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground, MoodArtwork } from "@/components";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { getPlaylists } from "@/lib/storage";
import type { Playlist } from "@/types";

export default function HistoryScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void getPlaylists().then((list) => { if (active) { setPlaylists(list); setLoading(false); } }).catch(() => { if (active) { setError("历史歌单暂时无法读取"); setLoading(false); } });
    return () => { active = false; };
  }, []));

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.wrapper}>
          <View style={styles.header}><View><Text style={styles.eyebrow}>YOUR COLLECTION</Text><Text style={styles.title}>历史歌单</Text><Text style={styles.subtitle}>{playlists.length ? `${playlists.length} 份歌单，记录你的不同片刻` : "每一次生成，都会留在这里"}</Text></View><View style={styles.countBadge}><Text style={styles.countNumber}>{playlists.length}</Text><Text style={styles.countLabel}>PLAYLISTS</Text></View></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <View style={styles.empty}><Ionicons name="time-outline" size={34} color={Colors.dark.accentFrom} /><Text style={styles.emptyTitle}>正在读取你的歌单…</Text></View> : playlists.length === 0 ? <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="albums-outline" size={32} color={Colors.dark.accentFrom} /></View><Text style={styles.emptyTitle}>还没有歌单</Text><Text style={styles.emptyDesc}>去首页描述一个场景，生成你的第一份专属歌单。</Text><Pressable style={styles.cta} onPress={() => router.push("/" as never)}><Text style={styles.ctaText}>去生成一份</Text><Ionicons name="arrow-forward" size={16} color="#FFFFFF" /></Pressable></View> : <FlatList data={playlists} keyExtractor={(item) => item.id} renderItem={({ item }) => <HistoryCard item={item} />} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

function HistoryCard({ item }: { item: Playlist }) {
  const date = new Date(item.createdAt);
  const dateText = Number.isNaN(date.getTime()) ? "刚刚" : date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  return <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => router.push({ pathname: "/playlist", params: { id: item.id } })} accessibilityLabel={`歌单：${item.prompt}`} accessibilityHint="点击查看歌单详情"><View style={styles.cardCover}><MoodArtwork rounded={12} /></View><View style={styles.cardBody}><View style={styles.cardTop}><Text style={styles.cardTitle} numberOfLines={1}>{item.title || "此刻精选"}</Text><Text style={styles.cardDate}>{dateText}</Text></View><Text style={styles.cardPrompt} numberOfLines={2}>“{item.prompt}”</Text><View style={styles.cardMeta}><View style={styles.metaPill}><Ionicons name="musical-notes" size={11} color={Colors.dark.accentFrom} /><Text style={styles.metaText}>{item.songs.length} 首歌曲</Text></View><Text style={styles.metaText}>{item.intent.mood || "为你而选"}</Text></View></View><Ionicons name="chevron-forward" size={19} color={Colors.dark.textSecondary} /></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  wrapper: { flex: 1, width: "100%", maxWidth: MaxContentWidth + 280, alignSelf: "center", paddingHorizontal: Spacing.four },
  header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingTop: Spacing.five, paddingBottom: Spacing.three },
  eyebrow: { color: Colors.dark.accentFrom, fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: Colors.dark.text, fontSize: 31, fontWeight: "800", marginTop: 5 },
  subtitle: { color: Colors.dark.textSecondary, fontSize: 13, marginTop: 5 },
  countBadge: { alignItems: "flex-end", paddingBottom: 2 },
  countNumber: { color: Colors.dark.text, fontSize: 26, fontWeight: "800" },
  countLabel: { color: Colors.dark.textSecondary, fontSize: 9, letterSpacing: 1.3 },
  list: { paddingVertical: Spacing.two, gap: Spacing.two, paddingBottom: 30 },
  card: { flexDirection: "row", alignItems: "center", gap: Spacing.three, backgroundColor: "rgba(26,26,36,0.72)", borderRadius: 18, padding: Spacing.three, borderWidth: 1, borderColor: "rgba(45,42,66,0.72)" },
  cardPressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  cardCover: { width: 66, height: 66, borderRadius: 13, overflow: "hidden", backgroundColor: Colors.dark.accentFrom },
  cardBody: { flex: 1, gap: 5 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { color: Colors.dark.text, fontSize: 15, fontWeight: "700", flex: 1 },
  cardDate: { color: Colors.dark.textSecondary, fontSize: 11 },
  cardPrompt: { color: Colors.dark.textSecondary, fontSize: 12, lineHeight: 17 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: Colors.dark.textSecondary, fontSize: 11 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.two, paddingHorizontal: Spacing.four },
  emptyIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: "rgba(99,102,241,0.12)", justifyContent: "center", alignItems: "center", marginBottom: Spacing.one },
  emptyTitle: { color: Colors.dark.text, fontSize: 19, fontWeight: "700" },
  emptyDesc: { color: Colors.dark.textSecondary, fontSize: 13, lineHeight: 20, textAlign: "center", maxWidth: 310 },
  cta: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.dark.accentFrom, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, marginTop: Spacing.two },
  ctaText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  error: { color: Colors.dark.warning, fontSize: 12, paddingBottom: Spacing.two },
});
