import type { Playlist, RawSong, SearchIntent, Song } from "@/types";

const MOOD_RULES: { keywords: string[]; mood: string; energy: number; genres: string[]; seeds: string[] }[] = [
  { keywords: ["运动", "跑步", "健身", "兴奋", "热闹"], mood: "兴奋、充满动力", energy: 0.86, genres: ["Electronic", "Hip-Hop/Rap"], seeds: ["workout", "energetic", "dance"] },
  { keywords: ["深夜", "睡前", "安静", "治愈", "雨", "独处"], mood: "安静、治愈", energy: 0.22, genres: ["Ambient", "Lo-fi"], seeds: ["midnight", "calm", "rainy"] },
  { keywords: ["通勤", "下班", "路上", "咖啡"], mood: "松弛、清醒", energy: 0.48, genres: ["Indie", "Lo-fi"], seeds: ["commute", "chill", "indie"] },
  { keywords: ["旅行", "自由", "公路", "海边", "阳光"], mood: "自由、开阔", energy: 0.66, genres: ["Indie", "Electronic"], seeds: ["roadtrip", "sunset", "freedom"] },
];

const DEMO_SONGS = [
  ["Neon Afterglow", "Cike Radio", "夜色里的第一束霓虹，给情绪留一点回响。"],
  ["Slow Motion", "Mellow Youth", "把脚步放慢，刚好接住此刻的松弛感。"],
  ["Blue Hour", "Paper Planes", "蓝调时分的留白，适合一个人安静地听。"],
  ["Open Road", "Northbound", "像把车窗摇下来，风会替你把心事带走。"],
  ["Soft Landing", "Luna Park", "轻轻落地，不必急着给今天下结论。"],
  ["First Light", "Sunday Club", "给清晨或重新出发的你，一点温柔的光。"],
  ["After Rain", "Small Hours", "雨停之后，空气里还留着一层清透的情绪。"],
  ["Parallel Lines", "Glass Garden", "旋律在两条轨道之间游走，适合保持自己的节奏。"],
  ["Warm Static", "Cloud Archive", "微微发热的噪点，让安静也有了触感。"],
  ["Homecoming", "The Last Postcard", "最后一首留给回家的路，熟悉又不乏新鲜。"],
] as const;

export function inferIntent(scene: string): SearchIntent {
  const normalized = scene.toLowerCase();
  const match = MOOD_RULES.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  const selected = match ?? {
    mood: "松弛、适合当下",
    energy: 0.5,
    genres: ["Indie", "Electronic"],
    seeds: ["mood", "chill", "indie"],
  };
  const energy = selected.energy;
  const bpmRange: [number, number] = energy < 0.3 ? [60, 90] : energy > 0.7 ? [120, 150] : [90, 120];
  return {
    language: null,
    mood: selected.mood,
    audiusMood: energy < 0.3 ? "Peaceful" : energy > 0.7 ? "Energizing" : null,
    energy,
    bpmRange,
    genres: selected.genres,
    seedKeywords: selected.seeds,
    count: 10,
  };
}

export function localReason(scene: string, song: Pick<Song, "title" | "artist">): string {
  const rule = MOOD_RULES.find((item) => item.keywords.some((keyword) => scene.includes(keyword)));
  return rule?.mood ? `为「${rule.mood}」挑的 ${song.title}，${DEMO_SONGS[Math.abs(song.title.length) % DEMO_SONGS.length][2]}` : `「${song.title}」的节奏，适合把这一刻听完整。`;
}

export function buildDemoPlaylist(scene: string, intent = inferIntent(scene)): Playlist {
  const songs: Song[] = DEMO_SONGS.map(([title, artist, reason], index) => ({
    id: `demo-${index + 1}`,
    title,
    artist,
    artworkUrl: "",
    previewUrl: null,
    streamUrl: "",
    permalink: null,
    reason: reason || localReason(scene, { title, artist }),
    duration: 168 + index * 9,
  }));
  return {
    id: uuid(),
    title: `${scene.slice(0, 18)} · 精选`,
    prompt: scene,
    intent,
    songs,
    createdAt: new Date().toISOString(),
  };
}

export function buildLocalPlaylist(scene: string, rawSongs: RawSong[], intent = inferIntent(scene)): Playlist {
  return {
    id: uuid(),
    title: `${scene.slice(0, 18)} · 精选`,
    prompt: scene,
    intent,
    songs: rawSongs.map((song) => ({ ...song, reason: localReason(scene, song) })),
    createdAt: new Date().toISOString(),
  };
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
