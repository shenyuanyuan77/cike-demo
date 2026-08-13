/**
 * 历史歌单持久化。
 *
 * 歌单 JSON 存 AsyncStorage（三端通吃，Web→IndexedDB）。
 * 注意：歌单里的 streamUrl 带签名短期失效，历史歌单的播放可能需要重新召回。
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "@/config";
import type { Playlist } from "@/types";

/** 读取全部历史歌单（按生成时间倒序） */
export async function getPlaylists(): Promise<Playlist[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.playlistsHistory);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Playlist[];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

/** 追加一条历史歌单（最新在前） */
export async function savePlaylist(playlist: Playlist): Promise<void> {
  const list = await getPlaylists();
  list.unshift(playlist);
  // 仅保留最近 50 条，避免无限增长
  const trimmed = list.slice(0, 50);
  await AsyncStorage.setItem(STORAGE_KEYS.playlistsHistory, JSON.stringify(trimmed));
}

/** 更新已有歌单（调整结果写回历史，避免同一 id 出现重复记录）。 */
export async function updatePlaylist(playlist: Playlist): Promise<void> {
  const list = await getPlaylists();
  const index = list.findIndex((item) => item.id === playlist.id);
  if (index === -1) {
    await savePlaylist(playlist);
    return;
  }
  list[index] = playlist;
  await AsyncStorage.setItem(STORAGE_KEYS.playlistsHistory, JSON.stringify(list));
}

/** 清空历史 */
export async function clearPlaylists(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.playlistsHistory);
}
