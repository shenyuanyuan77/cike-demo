import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AdjustPanel, GradientBackground, MiniPlayer, PlaylistHeader, SongRow } from "@/components";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { usePlatform } from "@/hooks/use-platform";
import { adjustIntent, createLlmClient, genReason } from "@/lib/llm";
import { getPlayer, searchSongs, type Player } from "@/lib/music";
import { buildLocalPlaylist, inferIntent } from "@/lib/playlist/fallback";
import { getPlaylists, updatePlaylist } from "@/lib/storage";
import type { Playlist, Song } from "@/types";

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adjusting, setAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = usePlatform();
  const playerRef = useRef<Player | null>(null);
  const adjustAbortRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    void getPlaylists().then((list) => {
      if (!mounted) return;
      const found = id ? list.find((item) => item.id === id) : list[0];
      if (found) setPlaylist(found);
      else router.replace("/" as never);
    });
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => () => { adjustAbortRef.current = true; }, []);

  const togglePlay = useCallback(async (song: Song) => {
    try {
      if (!playerRef.current) playerRef.current = await getPlayer();
      if (activeSongId === song.id && isPlaying) {
        await playerRef.current.stop();
        setIsPlaying(false);
        return;
      }
      await playerRef.current.play(song);
      setActiveSongId(song.id);
      setIsPlaying(true);
      setProgress(activeSongId === song.id ? progress : 0);
      setError(null);
    } catch (e) {
      setIsPlaying(false);
      setError(e instanceof Error ? e.message : "播放失败");
    }
  }, [activeSongId, isPlaying, progress]);

  useEffect(() => {
    if (!isPlaying || !playlist) return;
    const timer = setInterval(() => {
      setProgress((value) => {
        const next = value + 1 / Math.max(playlist.songs.find((song) => song.id === activeSongId)?.duration ?? 200, 1);
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSongId, isPlaying, playlist]);

  const handleAdjust = useCallback(async (feedback: string) => {
    if (!playlist) return;
    setAdjusting(true); setError(null); adjustAbortRef.current = false;
    try {
      const client = await createLlmClient();
      const newIntent = await adjustIntent(playlist.intent, feedback, client);
      if (adjustAbortRef.current) return;
      const rawSongs = await searchSongs(newIntent);
      if (rawSongs.length === 0) throw new Error("没有找到符合调整条件的歌曲");
      const songs = await Promise.all(rawSongs.map(async (raw) => ({ ...raw, reason: await genReason(playlist.prompt, { title: raw.title, artist: raw.artist }, client) })));
      if (adjustAbortRef.current) return;
      const updatedPlaylist = { ...playlist, intent: newIntent, songs };
      setPlaylist(updatedPlaylist);
      await updatePlaylist(updatedPlaylist);
      if (playerRef.current) await playerRef.current.stop();
      setActiveSongId(null); setIsPlaying(false); setProgress(0);
    } catch (e) {
      // 调整也沿用与生成一致的降级策略，避免 key/CORS 故障让页面失去交互。
      const intent = inferIntent(`${playlist.prompt} ${feedback}`);
      const rawSongs = await searchSongs(intent);
      if (rawSongs.length > 0) {
        const updatedPlaylist = { ...buildLocalPlaylist(playlist.prompt, rawSongs, intent), id: playlist.id };
        setPlaylist(updatedPlaylist);
        await updatePlaylist(updatedPlaylist);
      } else setError(e instanceof Error ? e.message : "调整失败");
    } finally { if (!adjustAbortRef.current) setAdjusting(false); }
  }, [playlist]);

  const currentSong = playlist?.songs.find((song) => song.id === activeSongId) ?? null;
  const openPlayer = useCallback(() => {
    if (!playlist || !currentSong) return;
    const index = playlist.songs.findIndex((song) => song.id === currentSong.id);
    router.push({ pathname: "/player", params: { playlistId: playlist.id, songId: currentSong.id, index: String(index) } });
  }, [currentSong, playlist]);

  if (!playlist) return <GradientBackground><SafeAreaView style={styles.safeArea}><View style={styles.center}><Ionicons name="sparkles" size={24} color={Colors.dark.accentFrom} /><Text style={styles.helper}>正在打开你的歌单…</Text></View></SafeAreaView></GradientBackground>;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          <View style={styles.topBar}><Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="返回" accessibilityHint="返回上一页"><Ionicons name="arrow-back" size={22} color={Colors.dark.text} /></Pressable><Text style={styles.topTitle}>PLAYLIST</Text><View style={styles.topSpacer} /></View>
          <View style={[styles.playlistCard, isMobile && styles.playlistCardMobile, { marginBottom: currentSong ? 82 : 14 }]}>
            <PlaylistHeader playlist={playlist} onPlayAll={() => void togglePlay(playlist.songs[0])} />
            {error ? <View style={styles.errorContainer} accessibilityLiveRegion="polite"><Ionicons name="alert-circle-outline" size={17} color={Colors.dark.warning} /><Text style={styles.error} accessibilityRole="alert">{error}</Text><Pressable onPress={() => setError(null)} hitSlop={8} accessibilityLabel="关闭错误提示"><Ionicons name="close" size={18} color={Colors.dark.textSecondary} /></Pressable></View> : null}
            <View style={styles.listHeader}><Text style={styles.listTitle}>为你挑选</Text><Text style={styles.listHint}>点击歌曲开始试听</Text></View>
            <View style={styles.listContainer}><FlatList data={playlist.songs} keyExtractor={(item) => item.id} renderItem={({ item, index }) => <SongRow song={item} index={index} isPlaying={activeSongId === item.id && isPlaying} onTogglePlay={() => void togglePlay(item)} />} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={styles.separator} />} /></View>
            <AdjustPanel onSubmit={handleAdjust} busy={adjusting} />
          </View>
          <MiniPlayer currentSong={currentSong} isPlaying={isPlaying} progress={progress} duration={currentSong?.duration} playlistId={playlist.id} songIndex={currentSong ? playlist.songs.findIndex((song) => song.id === currentSong.id) : 0} onTogglePlay={() => currentSong && void togglePlay(currentSong)} onExpand={openPlayer} />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  contentWrapper: { flex: 1, maxWidth: MaxContentWidth + 80, width: "100%", alignSelf: "center", overflow: "hidden" },
  topBar: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.three },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.07)", justifyContent: "center", alignItems: "center" },
  topTitle: { color: Colors.dark.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  topSpacer: { width: 40 },
  playlistCard: { flex: 1, marginHorizontal: Spacing.three, borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(11,13,30,0.9)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", shadowColor: "#060713", shadowOpacity: 0.28, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  playlistCardMobile: { marginHorizontal: Spacing.two, borderRadius: 16 },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.one },
  listTitle: { color: Colors.dark.text, fontSize: 16, fontWeight: "700" },
  listHint: { color: Colors.dark.textSecondary, fontSize: 11 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.two },
  helper: { color: Colors.dark.textSecondary, fontSize: 14 },
  errorContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.four, marginTop: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, backgroundColor: "rgba(251,191,36,0.1)", borderRadius: 10, gap: Spacing.two },
  error: { color: Colors.dark.warning, fontSize: 12, flex: 1, lineHeight: 18 },
  listContainer: { flex: 1, overflow: "hidden" },
  list: { paddingTop: Spacing.one, paddingBottom: 8 },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.055)", marginLeft: 82 },
});
