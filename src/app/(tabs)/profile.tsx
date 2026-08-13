import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { getPlaylists } from "@/lib/storage";

export default function ProfileScreen() {
  const [playlistCount, setPlaylistCount] = useState(0);
  useEffect(() => { void getPlaylists().then((list) => setPlaylistCount(list.length)); }, []);
  return <GradientBackground><SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Text style={styles.eyebrow}>YOUR SPACE</Text><Text style={styles.title}>我的</Text><Text style={styles.subtitle}>把喜欢的声音，慢慢变成自己的风格。</Text></View><View style={styles.profileCard}><View style={styles.avatar}><Ionicons name="musical-notes" size={26} color="#FFFFFF" /></View><View style={styles.profileText}><Text style={styles.name}>音乐爱好者</Text><Text style={styles.profileHint}>此刻的每一份心情，都值得被听见</Text></View><View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>ACTIVE</Text></View></View><View style={styles.statsRow}><Stat value={String(playlistCount)} label="已保存歌单" /><Stat value="10" label="每份歌曲" /><Stat value="AI" label="推荐引擎" /></View><Text style={styles.sectionTitle}>关于此刻</Text><View style={styles.infoCard}><InfoRow icon="sparkles-outline" label="推荐方式" value="情绪 × 场景 × 节奏" /><InfoRow icon="radio-outline" label="音乐来源" value="Audius 独立音乐" /><InfoRow icon="shield-checkmark-outline" label="数据存储" value="仅保存在本机" /></View><View style={styles.aboutCard}><Text style={styles.aboutTitle}>让 AI 更懂你的这一刻</Text><Text style={styles.aboutText}>「此刻」会把你的自然语言描述拆解成情绪、风格与节奏，再从真实曲库中召回歌曲，并为每一首解释它为什么适合现在。</Text><Pressable style={styles.tip}><Ionicons name="bulb-outline" size={16} color={Colors.dark.warning} /><Text style={styles.tipText}>描述越具体，推荐越有画面感</Text></Pressable></View><Text style={styles.version}>此刻 Cike · v0.2.0</Text></ScrollView></SafeAreaView></GradientBackground>;
}

function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) { return <View style={styles.infoRow}><Ionicons name={icon} size={18} color={Colors.dark.accentFrom} /><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { width: "100%", maxWidth: MaxContentWidth + 280, alignSelf: "center", paddingHorizontal: Spacing.four, paddingTop: Spacing.five, paddingBottom: 40, gap: Spacing.three },
  header: { gap: 4, marginBottom: Spacing.two },
  eyebrow: { color: Colors.dark.accentFrom, fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: Colors.dark.text, fontSize: 31, fontWeight: "800" },
  subtitle: { color: Colors.dark.textSecondary, fontSize: 13 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: Spacing.three, backgroundColor: "rgba(26,26,36,0.78)", borderRadius: 20, padding: Spacing.three, borderWidth: 1, borderColor: Colors.dark.border },
  avatar: { width: 54, height: 54, borderRadius: 18, backgroundColor: Colors.dark.accentFrom, justifyContent: "center", alignItems: "center" },
  profileText: { flex: 1, gap: 4 },
  name: { color: Colors.dark.text, fontSize: 16, fontWeight: "700" },
  profileHint: { color: Colors.dark.textSecondary, fontSize: 12 },
  status: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.success },
  statusText: { color: Colors.dark.success, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  statsRow: { flexDirection: "row", backgroundColor: "rgba(26,26,36,0.56)", borderRadius: 16, paddingVertical: Spacing.three },
  stat: { flex: 1, alignItems: "center", gap: 4, borderRightWidth: 1, borderRightColor: Colors.dark.border },
  statValue: { color: Colors.dark.text, fontSize: 20, fontWeight: "800" },
  statLabel: { color: Colors.dark.textSecondary, fontSize: 11 },
  sectionTitle: { color: Colors.dark.text, fontSize: 17, fontWeight: "700", marginTop: Spacing.two },
  infoCard: { backgroundColor: "rgba(26,26,36,0.72)", borderRadius: 18, paddingHorizontal: Spacing.three, borderWidth: 1, borderColor: "rgba(45,42,66,0.72)" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two, paddingVertical: Spacing.three, borderBottomWidth: 1, borderBottomColor: "rgba(45,42,66,0.62)" },
  infoLabel: { color: Colors.dark.textSecondary, fontSize: 13, flex: 1 },
  infoValue: { color: Colors.dark.text, fontSize: 13, fontWeight: "600" },
  aboutCard: { backgroundColor: "rgba(99,102,241,0.1)", borderRadius: 18, padding: Spacing.three, gap: Spacing.two, borderWidth: 1, borderColor: "rgba(99,102,241,0.18)" },
  aboutTitle: { color: Colors.dark.text, fontSize: 15, fontWeight: "700" },
  aboutText: { color: "#AAA8BC", fontSize: 13, lineHeight: 21 },
  tip: { flexDirection: "row", alignItems: "center", gap: 7 },
  tipText: { color: Colors.dark.warning, fontSize: 11 },
  version: { color: "#585768", fontSize: 11, textAlign: "center", marginTop: Spacing.two },
});
