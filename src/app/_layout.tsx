/**
 * 根布局 —— Stack + Tab/Drawer 混合导航。
 *
 * 结构：
 *   Stack
 *   ├── (tabs)          ← Tab 导航组（首页/历史/我的）
 *   │   ├── index       ← 首页（输入）
 *   │   ├── history     ← 历史歌单
 *   │   └── profile     ← 我的
 *   ├── generating      ← 生成中（无 Tab，全屏）
 *   ├── playlist         ← 歌单详情（无 Tab，全屏）
 *   └── player           ← 全屏播放器（Modal）
 */
import Head from "expo-router/head";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>此刻 - AI 歌单生成器</title>
        <meta
          name="description"
          content="一句话，生成此刻想听的音乐。AI 驱动的心情歌单生成器。"
        />
        <meta name="theme-color" content={Colors.dark.background} />
      </Head>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
        }}
      >
        {/* Tab 导航组 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 全屏页面（不在 Tab 内） */}
        <Stack.Screen
          name="generating"
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="playlist"
          options={{
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="player"
          options={{
            presentation: "transparentModal",
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>
    </>
  );
}
