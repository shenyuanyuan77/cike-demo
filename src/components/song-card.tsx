/**
 * 单首歌卡片：封面 + 歌名 + 艺人 + reason 高亮 + 播放/试听按钮。
 *
 * 依据 Q7（基础字段）、Q15（突出 reason）。
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { Colors, Spacing } from "@/constants/theme";
import type { Song } from "@/types";

interface Props {
  song: Song;
  index: number;
  isPlaying: boolean;
  onTogglePlay: (song: Song) => void;
}

export function SongCard({ song, index, isPlaying, onTogglePlay }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.index}>{index + 1}</Text>
        <Image
          source={song.artworkUrl ? { uri: song.artworkUrl } : undefined}
          style={styles.artwork}
          contentFit="cover"
        />
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>
        <Pressable
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={() => onTogglePlay(song)}
        >
          <Text style={styles.playButtonText}>{isPlaying ? "⏸" : "▶"}</Text>
        </Pressable>
      </View>
      <Text style={styles.reason}>「{song.reason}」</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  index: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    width: 20,
    textAlign: "center",
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.dark.backgroundSelected,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
  },
  artist: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.accentFrom,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonActive: {
    backgroundColor: Colors.dark.accentTo,
  },
  playButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  reason: {
    color: Colors.dark.text,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.dark.accentFrom,
  },
});
