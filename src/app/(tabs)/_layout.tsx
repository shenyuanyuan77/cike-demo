import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { usePlatform } from "@/hooks/use-platform";

const TAB_META = {
  index: { label: "此刻", icon: "disc-outline" as const, accessibility: "首页" },
  history: { label: "歌单", icon: "heart-outline" as const, accessibility: "历史歌单" },
  profile: { label: "我的", icon: "person-outline" as const, accessibility: "个人中心" },
};

type AppTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0] & { sidebar: boolean };

export default function TabsLayout() {
  const { isDesktop, isTablet } = usePlatform();
  const sidebar = isDesktop || isTablet;

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} sidebar={sidebar} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: sidebar ? "left" : "bottom",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "此刻" }} />
      <Tabs.Screen name="history" options={{ title: "歌单" }} />
      <Tabs.Screen name="profile" options={{ title: "我的" }} />
    </Tabs>
  );
}

function AppTabBar({ state, navigation, sidebar }: AppTabBarProps) {
  return (
    <View style={sidebar ? styles.sidebar : styles.mobileBar} accessibilityRole="tablist">
      {sidebar ? (
        <View style={styles.sidebarBrand}>
          <View style={styles.brandBars}><View style={styles.barShort} /><View style={styles.barTall} /></View>
          <Text style={styles.brandText}>此刻</Text>
        </View>
      ) : null}

      <View style={sidebar ? styles.sidebarNav : styles.mobileNav}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name as keyof typeof TAB_META];
          if (!meta) return null;
          const selected = state.index === index;
          return (
            <Pressable
              key={route.key}
              style={({ pressed }) => [sidebar ? styles.sidebarItem : styles.mobileItem, selected && (sidebar ? styles.sidebarItemSelected : styles.mobileItemSelected), pressed && styles.pressed]}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              accessibilityRole="tab"
              accessibilityLabel={meta.accessibility}
              accessibilityState={{ selected }}
            >
              {route.name === "profile" ? (
                <MaterialIcons name="person-outline" size={sidebar ? 19 : 21} color={selected ? "#C2AEFF" : Colors.dark.textSecondary} />
              ) : (
                <Ionicons name={meta.icon} size={sidebar ? 18 : 21} color={selected ? "#C2AEFF" : Colors.dark.textSecondary} />
              )}
              <Text style={[sidebar ? styles.sidebarLabel : styles.mobileLabel, selected && styles.labelSelected]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {sidebar ? (
        <View style={styles.settingsRow}>
          <Ionicons name="settings-outline" size={17} color={Colors.dark.textSecondary} />
          <Text style={styles.settingsText}>设置</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { width: 176, height: "100%", backgroundColor: "rgba(8,9,22,0.96)", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.06)", paddingHorizontal: 12 },
  sidebarBrand: { marginTop: 38, marginLeft: 10, flexDirection: "row", alignItems: "center", gap: 9 },
  brandBars: { width: 20, height: 22, flexDirection: "row", alignItems: "flex-end", gap: 3 },
  barShort: { width: 7, height: 12, borderRadius: 3, backgroundColor: "#B182FF" },
  barTall: { width: 7, height: 21, borderRadius: 3, backgroundColor: "#8065F6" },
  brandText: { color: Colors.dark.text, fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  sidebarNav: { marginTop: 44, gap: 8 },
  sidebarItem: { height: 42, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 11 },
  sidebarItemSelected: { backgroundColor: "rgba(128,101,246,0.18)", borderLeftWidth: 3, borderLeftColor: Colors.dark.accentFrom, paddingLeft: 8 },
  sidebarLabel: { color: Colors.dark.textSecondary, fontSize: 13, fontWeight: "600" },
  labelSelected: { color: Colors.dark.text },
  settingsRow: { position: "absolute", left: 24, bottom: 32, flexDirection: "row", alignItems: "center", gap: 10 },
  settingsText: { color: Colors.dark.textSecondary, fontSize: 12 },
  mobileBar: { height: 72, flexDirection: "row", backgroundColor: "rgba(9,10,24,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 },
  mobileNav: { flex: 1, flexDirection: "row" },
  mobileItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 13 },
  mobileItemSelected: { backgroundColor: "rgba(128,101,246,0.1)" },
  mobileLabel: { color: Colors.dark.textSecondary, fontSize: 10, fontWeight: "600" },
  pressed: { opacity: 0.7 },
});
