/**
 * 迷你播放器 —— 固定在页面底部的紧凑播放条。
 *
 * 功能：
 * - 显示当前歌曲信息（缩略图 + 歌名）
 * - 播放/暂停按钮
 * - 进度条
 * - 点击展开到全屏播放器
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";

import { Colors, Spacing } from "@/constants/theme";
import type { Song } from "@/types";

/** 迷你播放器固定高度 */
const MINI_PLAYER_HEIGHT = 70;

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  progress?: number; // 0-1
  duration?: number; // seconds
  playlistId?: string;
  songIndex?: number;
  onTogglePlay: () => void;
  onExpand?: () => void;
}

export function MiniPlayer({
  currentSong,
  isPlaying,
  progress = 0,
  playlistId,
  songIndex,
  onTogglePlay,
  onExpand,
}: MiniPlayerProps) {
  if (!currentSong) return null;

  return (
    <Pressable
      style={styles.container}
      onPress={onExpand ?? (() => router.push({ pathname: "/player", params: { songId: currentSong.id, playlistId, index: String(songIndex ?? 0) } }))}
      accessibilityLabel={`正在播放：${currentSong.title}`}
      accessibilityHint="点击展开完整播放器"
    >
      {/* 进度条 */}
      <View
        style={styles.progressTrack}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress * 100, 100)}%` },
          ]}
        />
      </View>

      <View style={[styles.content, { height: MINI_PLAYER_HEIGHT - 2 }]}>
        {currentSong.artworkUrl ? (
          <Image source={{ uri: currentSong.artworkUrl }} style={styles.artworkPlaceholder} contentFit="cover" accessibilityElementsHidden />
        ) : (
          <View style={styles.artworkPlaceholder} accessibilityElementsHidden>
            <Ionicons name="musical-notes" size={18} color={Colors.dark.textSecondary} />
          </View>
        )}

        {/* 歌曲信息 */}
        <View style={styles.info}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        {/* 控制按钮 */}
        <Pressable
          style={({ pressed }) => [styles.playBtn, pressed && styles.playBtnPressed]}
          onPress={(e) => {
            e?.stopPropagation?.();
            onTogglePlay();
          }}
          accessibilityLabel={isPlaying ? "暂停" : "播放"}
          accessibilityHint={isPlaying ? "暂停当前歌曲" : "继续播放"}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={22}
            color="#161625"
          />
        </Pressable>
        <Ionicons name="list" size={21} color={Colors.dark.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute" as const,
    zIndex: 20,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15,17,36,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.09)",
    // 细微阴影增加层次感
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  progressTrack: {
    height: 2,
    backgroundColor: Colors.dark.backgroundSelected,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.accentFrom,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    gap: Spacing.two + 2,
  },
  artworkPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.dark.backgroundSelected,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "500",
  },
  artistName: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  playBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
