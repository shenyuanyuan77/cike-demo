import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { getPlayer, type Player } from "@/lib/music";
import { getPlaylists } from "@/lib/storage";
import type { Song } from "@/types";

const DEFAULT_DURATION = 200;

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ songId?: string; playlistId?: string; index?: string }>();
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    let mounted = true;
    void getPlaylists().then((playlists) => {
      if (!mounted) return;
      const playlist = params.playlistId ? playlists.find((item) => item.id === params.playlistId) : null;
      const nextQueue = playlist?.songs ?? [];
      const fromQueue = nextQueue.find((song) => song.id === params.songId) ?? nextQueue[Number(params.index ?? 0)];
      setQueue(nextQueue);
      setCurrentSong(fromQueue ?? null);
    });
    return () => { mounted = false; };
  }, [params.index, params.playlistId, params.songId]);

  const duration = currentSong?.duration ?? DEFAULT_DURATION;
  const index = useMemo(() => currentSong ? queue.findIndex((song) => song.id === currentSong.id) : -1, [currentSong, queue]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => setElapsed((value) => Math.min(value + 1, duration)), 1000);
    return () => clearInterval(timer);
  }, [duration, isPlaying]);

  const togglePlay = useCallback(async () => {
    if (!currentSong) return;
    try {
      if (!playerRef.current) playerRef.current = await getPlayer();
      if (isPlaying) { await playerRef.current.stop(); setIsPlaying(false); return; }
      await playerRef.current.play(currentSong);
      setIsPlaying(true); setError(null);
    } catch (e) { setIsPlaying(false); setError(e instanceof Error ? e.message : "播放失败"); }
  }, [currentSong, isPlaying]);

  const changeTrack = useCallback(async (direction: -1 | 1) => {
    if (!queue.length || index < 0) return;
    const next = queue[(index + direction + queue.length) % queue.length];
    if (playerRef.current) await playerRef.current.stop();
    setCurrentSong(next); setElapsed(0); setIsPlaying(false); setError(null);
  }, [index, queue]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.topBar}><Pressable style={styles.closeBtn} onPress={() => router.back()} accessibilityLabel="关闭播放器" accessibilityHint="返回上一页"><Ionicons name="chevron-down" size={25} color={Colors.dark.text} /></Pressable><Text style={styles.topBarTitle}>NOW PLAYING</Text><View style={styles.closeBtn} /></View>
          {currentSong ? <>
            <View style={styles.artworkContainer}>
              {currentSong.artworkUrl ? <Image source={{ uri: currentSong.artworkUrl }} style={styles.artwork} contentFit="cover" /> : <View style={styles.artworkPlaceholder}><View style={styles.artworkOrb} /><Ionicons name="musical-notes" size={62} color="#FFFFFF" /></View>}
            </View>
            <View style={styles.infoSection}><Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text><Text style={styles.artistName} numberOfLines={1}>{currentSong.artist}</Text><View style={styles.moodPill}><Ionicons name="sparkles" size={13} color={Colors.dark.accentFrom} /><Text style={styles.moodText}>{currentSong.reason}</Text></View></View>
            <View style={styles.progressSection}><View style={styles.progressLabels}><Text style={styles.timeLabel}>{formatTime(elapsed)}</Text><Text style={styles.timeLabel}>{formatTime(duration)}</Text></View><View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: duration, now: elapsed }}><View style={[styles.progressFill, { width: `${Math.min((elapsed / duration) * 100, 100)}%` }]} /></View></View>
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            <View style={styles.controlsRow}><Pressable style={styles.controlBtn} onPress={() => void changeTrack(-1)} accessibilityLabel="上一首"><Ionicons name="play-skip-back" size={27} color={Colors.dark.text} /></Pressable><Pressable style={styles.playPauseBtn} onPress={() => void togglePlay()} accessibilityLabel={isPlaying ? "暂停" : "播放"}><Ionicons name={isPlaying ? "pause" : "play"} size={31} color="#FFFFFF" /></Pressable><Pressable style={styles.controlBtn} onPress={() => void changeTrack(1)} accessibilityLabel="下一首"><Ionicons name="play-skip-forward" size={27} color={Colors.dark.text} /></Pressable></View>
            <Text style={styles.queueHint}>{queue.length ? `来自歌单 · ${index + 1} / ${queue.length}` : "独立播放"}</Text>
          </> : <View style={styles.empty}><Ionicons name="musical-notes-outline" size={48} color={Colors.dark.textSecondary} /><Text style={styles.emptyTitle}>还没有选中的歌曲</Text><Text style={styles.emptyText}>返回歌单，点击一首歌曲开始播放。</Text></View>}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

function formatTime(seconds: number) { const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return `${m}:${s.toString().padStart(2, "0")}`; }

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: Spacing.four },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.two },
  closeBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(26,26,36,0.82)", justifyContent: "center", alignItems: "center" },
  topBarTitle: { color: Colors.dark.textSecondary, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  artworkContainer: { flex: 1, minHeight: 230, justifyContent: "center", alignItems: "center", paddingVertical: Spacing.four },
  artwork: { width: 300, height: 300, borderRadius: 28, backgroundColor: Colors.dark.backgroundSelected },
  artworkPlaceholder: { width: 300, height: 300, borderRadius: 28, backgroundColor: Colors.dark.accentFrom, justifyContent: "center", alignItems: "center", overflow: "hidden", shadowColor: Colors.dark.accentTo, shadowOpacity: 0.45, shadowRadius: 30, shadowOffset: { width: 0, height: 12 }, elevation: 14 },
  artworkOrb: { position: "absolute", width: 350, height: 350, borderRadius: 175, backgroundColor: Colors.dark.accentTo, top: 110, left: 70, opacity: 0.58 },
  infoSection: { alignItems: "center", gap: 6 },
  songTitle: { color: Colors.dark.text, fontSize: 25, fontWeight: "800", textAlign: "center" },
  artistName: { color: Colors.dark.textSecondary, fontSize: 15, textAlign: "center" },
  moodPill: { flexDirection: "row", alignItems: "center", gap: 5, maxWidth: "92%", marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.1)" },
  moodText: { color: "#AAA8D5", fontSize: 11 },
  progressSection: { marginTop: Spacing.five },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  timeLabel: { color: Colors.dark.textSecondary, fontSize: 11, fontVariant: ["tabular-nums"] as any },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: Colors.dark.backgroundSelected, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.dark.accentFrom, borderRadius: 3 },
  error: { color: Colors.dark.warning, textAlign: "center", fontSize: 12, marginTop: Spacing.two },
  controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 38, marginTop: Spacing.five },
  controlBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  playPauseBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.dark.accentFrom, justifyContent: "center", alignItems: "center", shadowColor: Colors.dark.accentFrom, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  queueHint: { color: Colors.dark.textSecondary, fontSize: 11, textAlign: "center", marginTop: Spacing.three },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.two },
  emptyTitle: { color: Colors.dark.text, fontSize: 20, fontWeight: "700", marginTop: Spacing.two },
  emptyText: { color: Colors.dark.textSecondary, fontSize: 14 },
});
