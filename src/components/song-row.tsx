/**
 * 歌曲行 —— 紧凑的歌曲列表项。
 *
 * 替代 SongCard 卡片，对齐设计稿的紧凑行布局：
 * - 序号 + 歌名 + 时长（主行）
 * - 艺人名（副行）
 * - 点击整行播放/暂停
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { Colors, Spacing } from "@/constants/theme";
import type { Song } from "@/types";

interface SongRowProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function SongRow({ song, index, isPlaying, onTogglePlay }: SongRowProps) {
  /** 格式化时长 mm:ss */
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        isPlaying && styles.rowPlaying,
      ]}
      onPress={onTogglePlay}
      accessibilityLabel={`${song.title}，${song.artist}`}
      accessibilityHint={isPlaying ? "正在播放，点击暂停" : "点击播放这首歌"}
      accessibilityState={{ selected: isPlaying }}
    >
      {/* 左侧：序号或播放图标 */}
      <View style={styles.indexBox}>
        {isPlaying ? (
          <View style={styles.playingIndicator}>
            <Ionicons name="volume-high" size={14} color={Colors.dark.accentFrom} />
          </View>
        ) : (
          <Text style={styles.indexNum}>{index + 1}</Text>
        )}
      </View>

      <Image
        source={song.artworkUrl ? { uri: song.artworkUrl } : undefined}
        style={styles.artwork}
        contentFit="cover"
        accessibilityElementsHidden
      />

      {/* 中间：歌名 + 艺人 */}
      <View style={styles.meta}>
        <Text
          style={[styles.title, isPlaying && styles.titlePlaying]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text style={styles.reason} numberOfLines={1}>{song.reason}</Text>
      </View>

      {/* 右侧：时长 */}
      <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
      <Ionicons name="play-circle-outline" size={22} color={isPlaying ? Colors.dark.accentFrom : Colors.dark.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    paddingVertical: 7,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowPlaying: {
    // 播放中背景高亮
    backgroundColor: "rgba(128, 101, 246, 0.12)",
  },
  indexBox: {
    width: 28,
    alignItems: "center",
  },
  indexNum: {
    color: Colors.dark.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
  playingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  artwork: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.dark.backgroundSelected,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: "600",
  },
  titlePlaying: {
    color: Colors.dark.accentFrom,
  },
  artist: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  reason: {
    color: "#6F6D80",
    fontSize: 10,
  },
  duration: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontVariant: ["tabular-nums"] as any,
  },
});
