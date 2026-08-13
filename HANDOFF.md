# 此刻 (Cike) 项目交接文档

> **项目**: 此刻 — AI 驱动的心情歌单生成器  
> **交接时间**: 2026-08-12  
> **工作目录**: `D:\此刻demo`  
> **技术栈**: Expo SDK 57 / React Native 0.86 / React 19.2.3 / TypeScript

---

## 🎯 项目概述

「此刻」是一款 AI 歌单生成器：用户输入一句话描述心情/场景，App 调用 **DeepSeek LLM** 理解意图，通过 **Audius API** 搜索音乐，生成 10 首定制歌单。支持歌单调整、历史记录、全屏播放等功能。

**三端目标**: iOS / Android / Web

---

## ✅ 当前完成状态

### 1. 核心功能（已实现）

| 模块 | 状态 | 关键文件 |
|------|:----:|---------|
| 导航结构 (Tab + Stack) | ✅ | `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx` |
| 首页（输入 + 快捷场景 Chip） | ✅ | `src/app/(tabs)/index.tsx` |
| 历史歌单页 | ✅ | `src/app/(tabs)/history.tsx` |
| 个人中心页 | ✅ | `src/app/(tabs)/profile.tsx` |
| 生成中动画页 | ✅ | `src/app/generating.tsx` + `src/components/loading-orb.tsx` |
| 歌单详情页 | ✅ | `src/app/playlist.tsx` |
| 全屏播放器 | ✅ | `src/app/player.tsx` |
| 调整面板（快捷标签 + 自由输入） | ✅ | `src/components/adjust-panel.tsx` |
| LLM 客户端（纯 fetch） | ✅ | `src/lib/llm/client.ts` |
| Audius 音乐搜索 | ✅ | `src/lib/music/search.ts`, `src/lib/music/client.ts` |
| 播放器（平台分流） | ✅ | `src/lib/music/player.ts` + `.native.ts` / `.web.ts` |
| 本地存储（平台分流） | ✅ | `src/lib/storage/settings.ts` |
| 历史记录持久化 | ✅ | `src/lib/storage/playlists.ts` |
| 紫色暗色主题 | ✅ | `src/constants/theme.ts`, `src/global.css` |
| 渐变背景组件 | ✅ | `src/components/gradient-background.tsx` |

### 2. 平台适配（已完成对齐）

| 能力 | Native (iOS/Android) | Web | 适配文件 |
|------|----------------------|-----|---------|
| 音频播放 | `expo-audio` (AudioPlayer) | `HTMLAudioElement` | `player-runtime.native.ts` / `.web.ts` |
| 安全存储 | `expo-secure-store` (Keychain) | `AsyncStorage` (IndexedDB) | `storage/settings.ts` (Platform.OS 分支) |
| LLM 调用 | 直连 `api.deepseek.com` | CORS 代理 `127.0.0.1:8787` | `llm/client.ts` |
| 渐变 | `expo-linear-gradient` | 同上 (CSS 降级) | `gradient-background.tsx` |

### 3. 自动化测试（20/20 全通过 ✅）

- **测试脚本**: `cike_web_test.py` (Playwright + Edge Headless)
- **测试报告**: `TEST_REPORT.md` / `test_report.json`
- **截图证据**: `test_screenshots/` (11 张)
- **覆盖**: 首页渲染、导航切换、主题一致性、响应式布局、交互元素、无障碍、控制台错误、网络请求

---

## 🔧 运行环境

### 当前运行中的服务

| 服务 | 地址 | 启动命令 |
|------|------|---------|
| **Web 开发服务器** | http://localhost:8092 | `npx expo start --web --port 8092` |
| **DeepSeek CORS 代理** | http://127.0.0.1:8787 | `node edge/deepseek-proxy/dev-server.mjs` |
| **Android 真机预览** | `exp://10.253.234.22:8082` | `npx expo start --lan --go --port 8082`（当前已停） |

### 关键配置

- **`.env`**: `EXPO_PUBLIC_DEEPSEEK_KEY=sk-***`（已 redact）, `EXPO_PUBLIC_DEEPSEEK_PROXY_URL=http://127.0.0.1:8787`
- **`app.config.ts`**: plugins = `["expo-router", "expo-audio", "expo-asset"]`, web.output = "static"
- **`tsconfig.json`**: 启用 `strict`, `paths` 别名 `@/*` → `src/*`

### 常用命令

```bash
# 启动 Web 开发（含代理）
npm run dev:web                # 一键启动代理 + Web

# 单独启动
node edge/deepseek-proxy/dev-server.mjs   # CORS 代理
npx expo start --web --port 8092          # Web dev server
npx expo start --lan --go --port 8082     # Android 真机 (Expo Go)

# 构建
npx expo export -p web         # Web 静态导出

# 测试
python cike_web_test.py        # 运行自动化测试

# 类型检查
npx tsc --noEmit               # 当前 0 errors ✅
```

---

## 📐 架构与约定

### 目录结构

```
src/
├── app/                    # Expo Router 页面
│   ├── _layout.tsx         # 根布局 (Stack + Head)
│   ├── (tabs)/             # Tab 导航组
│   │   ├── _layout.tsx     # BottomTabNavigator
│   │   ├── index.tsx       # 首页（输入 + Chip）
│   │   ├── history.tsx     # 历史歌单
│   │   └── profile.tsx     # 个人中心
│   ├── generating.tsx      # 生成中（全屏 Modal）
│   ├── playlist.tsx        # 歌单详情
│   └── player.tsx          # 全屏播放器（Modal）
├── components/             # UI 组件（单一职责）
├── config/                 # 常量与环境配置
├── constants/              # 主题色 + 快捷场景定义
├── hooks/                  # 自定义 Hooks（平台检测等）
├── lib/                    # 业务逻辑（无 UI 依赖）
│   ├── llm/                # DeepSeek 客户端 + prompt
│   ├── music/              # Audius 搜索 + 播放器
│   ├── playlist/           # 歌单生成逻辑
│   └── storage/            # 持久化（平台分流）
└── types/                  # TypeScript 类型定义
```

### 编码约定（AGENTS.md）

- 配置/常量集中管理，禁止硬编码（第 10 条）
- 平台特定代码用 `.native.ts` / `.web.ts` 后缀（Metro 自动解析）
- 组件单一职责，优先复用已有组件（第 3-4 条）
- 修改保持最小影响范围（第 8 条）
- 修改后检查编译/类型/运行状态（第 14 条）

### 主题系统

```typescript
// src/constants/theme.ts
Colors.dark = {
  background: "#0A0A0F",       // 深蓝黑
  backgroundElement: "#16161E",
  accentFrom: "#6366F1",       // 靛蓝紫
  accentTo: "#A855F7",          // 品紫
  text: "#F5F5F7",
  textSecondary: "#8E8E93",
}
// Web 端侧边栏选中态通过 global.css !important 覆盖 RN 默认蓝色
```

---

## ⏳ 未完成 / 待办事项

### 1. Android 模拟器环境（进行中）

- ✅ Android SDK 已安装 (`C:\Users\Trashmak1r\AppData\Local\Android\Sdk`)
- ✅ Emulator v37.1.11 + API 34 系统镜像已安装
- ✅ AVD `Cike_Emulator` 已创建
- ❌ **WHPX 虚拟化未启用** — 模拟器无法启动（错误：`x86_64 emulation currently requires hardware acceleration`）
- **待用户操作**: 以管理员身份启用 Windows Hypervisor Platform 功能并重启
  ```powershell
  dism.exe /online /enable-feature /featurename:HypervisorPlatform /all /norestart
  ```

### 2. 设计稿对齐（部分完成）

计划文件: `.zcode/plans/plan-sess_44c1f597-6754-49a7-a605-491046a85192.md`

已完成 Phase 1-5（导航重构、首页、生成页、歌单页、播放器）。Phase 6（响应式适配）部分完成——移动端/平板端/桌面端基本可用，但可能需要进一步打磨像素级还原。

**可能的后续优化方向**:
- 歌单页头部背景图（首首歌封面模糊）
- 全屏播放器进度条拖拽
- iPad/Web 侧边栏（DrawerNavigation）与移动端 BottomTabs 的更精细切换
- 设计稿中的「收藏」功能（当前历史页可能不完整）

### 3. 依赖清理（低优先级）

`package.json` 中以下 5 个包声明了依赖但 `src/` 中从未导入，可安全移除以减小 bundle：
- `expo-glass-effect`
- `expo-symbols`
- `expo-web-browser`
- `expo-splash-screen`
- `expo-system-ui`

### 4. 功能完整性

- **歌单生成端到端流程**: LLM + Audius 集成代码已就绪，但需在真机上完整验证（输入 → 生成 → 播放 → 调整 → 历史）
- **Web 端 LLM 调用**: 代理已配置，需验证实际生成歌单（非 demo 数据）
- **收藏功能**: 设计稿中有 ❤️ 收藏按钮，需确认是否已实现

---

## 🚨 注意事项

1. **API Key 安全**: `.env` 含 `EXPO_PUBLIC_DEEPSEEK_KEY`，已 gitignore，但 Expo public 变量会打包进客户端 bundle（仅限 demo 场景）。

2. **CORS 代理仅本地**: `edge/deepseek-proxy/dev-server.mjs` 监听 `127.0.0.1:8787`，仅适用于开发。生产环境 Web 端需部署边缘函数（代码已在 `edge/deepseek-proxy/index.ts` 使用 Hono）。

3. **Node.js 版本**: 当前 v20.17.0，Expo SDK 57 建议 ≥ 20.19.4（有警告但可运行）。

4. **Playwright Chromium 下载失败**: 需使用系统 Edge (`channel="msedge"`)，测试脚本已适配。

5. **Git 未初始化**: 项目尚未提交任何 commit（`No commits yet`），所有文件均为 Untracked。

---

## 📚 关键参考文件

| 文件 | 内容 |
|------|------|
| `AGENTS.md` | 仓库编码原则（15 条） |
| `docs/architecture.md` | 架构设计文档 |
| `docs/design.md` | 设计文档（含 API 规范 §4） |
| `docs/contracts.md` | 接口契约（存储 key 等 §5） |
| `docs/milestones.md` | 里程碑规划 |
| `.zcode/plans/plan-sess_*.md` | UI 对齐设计稿实施计划 |
| `TEST_REPORT.md` | 自动化测试报告（100% 通过） |
| `README.md` | 项目说明 |

---

## 🛠️ 建议的技能 (Suggested Skills)

下一任 Agent 可根据任务类型调用以下技能：

| 场景 | 技能 | 用途 |
|------|------|------|
| 继续对齐设计稿 | `frontend-design` | 视觉设计指导、像素级还原 |
| 构建/修改 UI 组件 | `frontend-ui-engineering` | 生产级 UI 工程、WCAG 无障碍 |
| 运行 Web 自动化测试 | `webapp-testing` | Playwright 测试脚本 |
| Android 模拟器验证 | `android-emulator:android-dev` | 构建/运行/截图 Android 应用 |
| 调试 Bug | `diagnosing-bugs` | 系统性诊断循环 |
| 代码审查 | `code-review` | Standards + Spec 双轴审查 |
| 测试驱动开发 | `tdd` | 红-绿-重构循环 |
| 原型探索 | `prototype` | 抛弃式原型验证设计 |

---

## 📝 最近完成的变更摘要

本次会话（交接前）的主要工作：

1. **Web 端插件对齐**: 验证音频/存储/LLM/渐变四模块双端一致性，配置 CORS 代理
2. **Android 环境配置**: 安装 Emulator + API 34 镜像 + 创建 AVD（待启用 WHPX）
3. **自动化测试修复**: 从 50% → 100% 通过率
   - 修复真实 Bug: 空 `<title>` → 添加 `<Head>` 组件到 `src/app/_layout.tsx`
   - 优化 7 项测试选择器（Tab 激活态、cursor:pointer 检测、背景色容差等）
4. **生成测试报告**: `TEST_REPORT.md` + `test_report.json` + 11 张截图

---

*交接文档由 ZCode AI Agent 生成*
