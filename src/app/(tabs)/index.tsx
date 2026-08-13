import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground, MoodArtwork, QuickChips, SearchInput } from "@/components";
import { QUICK_SCENES } from "@/constants/quick-scenes";
import { Colors, MaxContentWidth } from "@/constants/theme";
import { usePlatform } from "@/hooks/use-platform";
import { getPlaylists } from "@/lib/storage";
import type { Playlist, Song } from "@/types";

const SAMPLE_PROMPT = "下班后的城市夜路，松弛、有节奏，但不过分喧闹";

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [latestPlaylist, setLatestPlaylist] = useState<Playlist | null>(null);
  const { isMobile } = usePlatform();

  useFocusEffect(useCallback(() => {
    void getPlaylists().then((list) => setLatestPlaylist(list[0] ?? null));
  }, []));

  const handleGenerate = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    router.push({ pathname: "/generating", params: { prompt: trimmed } });
  };

  const openLatest = () => {
    if (latestPlaylist) {
      router.push({ pathname: "/playlist", params: { id: latestPlaylist.id } });
      return;
    }
    setPrompt(SAMPLE_PROMPT);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]} showsVerticalScrollIndicator={false}>
          <View style={[styles.container, isMobile && styles.containerMobile]}>
            {isMobile ? <MobileBrand /> : null}

            <View style={[styles.hero, isMobile && styles.heroMobile]}>
              <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>此刻</Text>
              <Text style={styles.heroSubtitle}>一句话，生成此刻即刻听的音乐</Text>
            </View>

            <View style={styles.composer}>
              <SearchInput
                value={prompt}
                onChangeText={(value) => setPrompt(value.slice(0, 120))}
                onSubmit={handleGenerate}
                placeholder="今天想听点什么？"
              />
              <View style={[styles.chipLine, isMobile && styles.chipLineMobile]}>
                <QuickChips scenes={QUICK_SCENES} onSelect={(scene) => setPrompt(scene.prompt)} />
                {!isMobile ? <Text style={styles.inputHint}>{prompt.length}/120</Text> : null}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{latestPlaylist ? "为你生成的歌单" : "从一个灵感开始"}</Text>
                <Text style={styles.sectionSubtitle}>{latestPlaylist ? "继续上一次的聆听片刻" : "描述一种氛围，AI 会从真实曲库中为你挑选"}</Text>
              </View>
              {latestPlaylist ? <Pressable onPress={() => router.push("/(tabs)/history")}><Text style={styles.historyLink}>历史 <Ionicons name="chevron-forward" size={11} /></Text></Pressable> : null}
            </View>

            <FeaturedPlaylist playlist={latestPlaylist} isMobile={isMobile} onPress={openLatest} />

            <View style={styles.trustRow}>
              <TrustItem icon="sparkles-outline" label="AI 理解此刻" />
              <TrustItem icon="radio-outline" label="Audius 真实曲库" />
              <TrustItem icon="headset-outline" label="歌曲即时试听" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function MobileBrand() {
  return (
    <View style={styles.mobileBrand}>
      <View style={styles.brandMark}><Ionicons name="musical-notes" size={16} color="#FFFFFF" /></View>
      <Text style={styles.brandName}>此刻</Text>
      <Pressable style={styles.notificationBtn} accessibilityLabel="通知">
        <Ionicons name="notifications-outline" size={19} color="#F4F2FA" />
      </Pressable>
    </View>
  );
}

function FeaturedPlaylist({ playlist, isMobile, onPress }: { playlist: Playlist | null; isMobile: boolean; onPress: () => void }) {
  const songs = playlist?.songs.slice(0, isMobile ? 4 : 5) ?? [];
  const title = playlist?.title || "城市晚风";
  const description = playlist?.prompt || SAMPLE_PROMPT;

  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureTop, isMobile && styles.featureTopMobile]}>
        <View style={[styles.cover, isMobile && styles.coverMobile]}><MoodArtwork /></View>
        <View style={styles.featureCopy}>
          <View style={styles.titleLine}>
            <Text style={styles.playlistTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.aiPill}><Text style={styles.aiPillText}>AI</Text></View>
          </View>
          <Text style={styles.playlistDescription} numberOfLines={2}>{description}</Text>
          <Text style={styles.playlistMeta}>{playlist ? `${playlist.songs.length} 首歌曲 · ${formatMinutes(playlist.songs)} 分钟` : "一个描述 · 一份专属歌单"}</Text>
          <View style={styles.featureActions}>
            <Pressable style={({ pressed }) => [styles.playButton, pressed && styles.pressed]} onPress={onPress} accessibilityLabel={playlist ? "打开歌单" : "使用这个灵感"}>
              <Ionicons name={playlist ? "play" : "sparkles"} size={15} color="#FFFFFF" />
              <Text style={styles.playButtonText}>{playlist ? "播放全部" : "试试这个灵感"}</Text>
            </Pressable>
            <Pressable style={styles.roundButton} accessibilityLabel="收藏"><Ionicons name="heart-outline" size={20} color={Colors.dark.text} /></Pressable>
            <Pressable style={styles.roundButton} accessibilityLabel="更多"><Ionicons name="ellipsis-horizontal" size={20} color={Colors.dark.text} /></Pressable>
          </View>
        </View>
      </View>

      {songs.length ? (
        <View style={styles.trackList}>
          <View style={styles.trackHead}><Text style={styles.trackIndex}>#</Text><Text style={styles.trackName}>歌曲</Text>{!isMobile ? <Text style={styles.trackArtist}>歌手</Text> : null}<Text style={styles.trackTime}>时长</Text></View>
          {songs.map((song, index) => <PreviewSong key={song.id} song={song} index={index} isMobile={isMobile} />)}
        </View>
      ) : (
        <View style={styles.emptySteps}>
          <EmptyStep icon="chatbubble-ellipses-outline" title="描述此刻" caption="一句自然语言就够了" />
          <View style={styles.stepLine} />
          <EmptyStep icon="color-wand-outline" title="理解氛围" caption="情绪、场景与节奏" />
          <View style={styles.stepLine} />
          <EmptyStep icon="headset-outline" title="即刻开听" caption="获得可播放的真实音乐" />
        </View>
      )}
    </View>
  );
}

function PreviewSong({ song, index, isMobile }: { song: Song; index: number; isMobile: boolean }) {
  return (
    <View style={styles.trackRow}>
      <Text style={[styles.trackIndex, index === 0 && styles.trackIndexActive]}>{index === 0 ? "▮▮" : index + 1}</Text>
      <View style={styles.trackNameWrap}>
        {song.artworkUrl ? <Image source={{ uri: song.artworkUrl }} style={styles.trackArtwork} contentFit="cover" /> : null}
        <View style={styles.trackTextWrap}>
          <Text style={styles.trackTitle} numberOfLines={1}>{song.title}</Text>
          {isMobile ? <Text style={styles.trackArtistMobile} numberOfLines={1}>{song.artist}</Text> : null}
        </View>
      </View>
      {!isMobile ? <Text style={styles.trackArtist} numberOfLines={1}>{song.artist}</Text> : null}
      <Text style={styles.trackTime}>{formatDuration(song.duration)}</Text>
      <Ionicons name="heart-outline" size={18} color={Colors.dark.textSecondary} />
      <Ionicons name="ellipsis-horizontal" size={18} color={Colors.dark.textSecondary} />
    </View>
  );
}

function EmptyStep({ icon, title, caption }: { icon: keyof typeof Ionicons.glyphMap; title: string; caption: string }) {
  return <View style={styles.emptyStep}><View style={styles.stepIcon}><Ionicons name={icon} size={18} color="#C0A7FF" /></View><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepCaption}>{caption}</Text></View>;
}

function TrustItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return <View style={styles.trustItem}><Ionicons name={icon} size={14} color="#C1AAFF" /><Text style={styles.trustText}>{label}</Text></View>;
}

function formatDuration(seconds?: number) {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function formatMinutes(songs: Song[]) {
  return Math.max(1, Math.round(songs.reduce((total, song) => total + (song.duration ?? 180), 0) / 60));
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 34 },
  scrollContentMobile: { paddingBottom: 28 },
  container: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: 34, paddingTop: 38, gap: 24 },
  containerMobile: { paddingHorizontal: 16, paddingTop: 8, gap: 18 },
  mobileBrand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 34, height: 34, borderRadius: 11, backgroundColor: Colors.dark.accentFrom, alignItems: "center", justifyContent: "center" },
  brandName: { color: Colors.dark.text, fontSize: 17, fontWeight: "800", letterSpacing: 1 },
  notificationBtn: { marginLeft: "auto", width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },
  hero: { maxWidth: 760, width: "100%", alignSelf: "center" },
  heroMobile: { marginTop: 8 },
  heroTitle: { color: Colors.dark.text, fontSize: 36, lineHeight: 42, fontWeight: "800", letterSpacing: -0.8 },
  heroTitleMobile: { fontSize: 30, lineHeight: 36 },
  heroSubtitle: { color: "#D6D2DF", fontSize: 14, marginTop: 3 },
  composer: { maxWidth: 760, width: "100%", alignSelf: "center", gap: 12 },
  chipLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  chipLineMobile: { alignItems: "flex-start" },
  inputHint: { color: "rgba(255,255,255,0.48)", fontSize: 10, fontVariant: ["tabular-nums"] as any },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 2 },
  sectionTitle: { color: Colors.dark.text, fontSize: 16, fontWeight: "700" },
  sectionSubtitle: { color: Colors.dark.textSecondary, fontSize: 11, marginTop: 4 },
  historyLink: { color: "#D6CCFF", fontSize: 11 },
  featureCard: { backgroundColor: "rgba(12,14,32,0.87)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", shadowColor: "#080812", shadowOpacity: 0.3, shadowRadius: 28, shadowOffset: { width: 0, height: 16 }, elevation: 10 },
  featureTop: { flexDirection: "row", gap: 18, padding: 16 },
  featureTopMobile: { gap: 13, padding: 12 },
  cover: { width: 140, height: 108, borderRadius: 15, overflow: "hidden", backgroundColor: "#342A65" },
  coverMobile: { width: 94, height: 94 },
  featureCopy: { flex: 1, minWidth: 0, justifyContent: "center" },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  playlistTitle: { color: Colors.dark.text, fontSize: 20, fontWeight: "800", flexShrink: 1 },
  aiPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, borderWidth: 1, borderColor: "#8A6CFF", backgroundColor: "rgba(128,101,246,0.12)" },
  aiPillText: { color: "#C9B8FF", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  playlistDescription: { color: Colors.dark.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 5 },
  playlistMeta: { color: "#77768B", fontSize: 10, marginTop: 7 },
  featureActions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  playButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.dark.accentFrom, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8 },
  playButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  roundButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.74, transform: [{ scale: 0.97 }] },
  trackList: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  trackHead: { flexDirection: "row", alignItems: "center", minHeight: 30, paddingHorizontal: 16, gap: 12 },
  trackRow: { flexDirection: "row", alignItems: "center", minHeight: 45, paddingHorizontal: 16, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.055)" },
  trackIndex: { width: 22, color: "#77768B", fontSize: 10, textAlign: "center" },
  trackIndexActive: { color: Colors.dark.accentTo, fontSize: 8, letterSpacing: -2 },
  trackName: { flex: 1, color: "#77768B", fontSize: 9 },
  trackNameWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9, minWidth: 0 },
  trackTextWrap: { flex: 1, minWidth: 0, gap: 2 },
  trackArtwork: { width: 28, height: 28, borderRadius: 6, backgroundColor: Colors.dark.backgroundSelected },
  trackTitle: { color: "#EEEAF5", fontSize: 11, flex: 1 },
  trackArtist: { width: 140, color: "#9896A7", fontSize: 10 },
  trackArtistMobile: { color: "#77768B", fontSize: 9 },
  trackTime: { width: 38, color: "#9896A7", fontSize: 10, fontVariant: ["tabular-nums"] as any },
  emptySteps: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 18, paddingVertical: 16 },
  emptyStep: { flex: 1, alignItems: "center", gap: 4 },
  stepIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(128,101,246,0.14)" },
  stepTitle: { color: Colors.dark.text, fontSize: 11, fontWeight: "700", marginTop: 2 },
  stepCaption: { color: Colors.dark.textSecondary, fontSize: 9, textAlign: "center" },
  stepLine: { width: 46, height: 1, backgroundColor: "rgba(184,138,247,0.3)" },
  trustRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, marginTop: -4 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustText: { color: "rgba(255,255,255,0.52)", fontSize: 10 },
});
