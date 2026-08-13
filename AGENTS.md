# AGENTS.md

本文件为工作在 `此刻demo` 仓库上的 ZCode 智能体提供指引。

## 仓库现状

- 工作区目录：`D:\此刻demo`
- 已纳入 Git 版本控制（当前处于初始提交前，大量文件尚未 `git add`）。

## 项目概述

「此刻」(cike) —— 一句话生成此刻想听的音乐的 AI 心情歌单生成器。
用户输入一句自然语言描述，由 **DeepSeek** LLM 拆解为情绪 / 场景 / 节奏，从 **Audius** 独立音乐曲库召回真实曲目，生成 10 首歌单并为每首解释推荐理由。

技术栈：**Expo SDK 54 + React Native 0.81 + React 19 + expo-router（文件路由 + typed routes + react compiler）**，iOS / Android / Web 三端同构。`userInterfaceStyle: dark`，仅暗色一套主题。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 DeepSeek 本地代理 + Web 服务（默认 `http://127.0.0.1:8081`），等价于双击 `启动此刻.bat` |
| `npm run android:preview` | Expo Go 局域网真机预览（默认端口 `8082`），等价于双击 `安卓预览.bat` |
| `npm run dev:proxy` | 单独启动 `edge/deepseek-proxy` 代理（`http://127.0.0.1:8787`） |
| `npm run web:build` | Web 生产构建（`expo export -p web`，输出 `dist/`） |
| `npm run lint` | ESLint（`expo lint`，配置 `eslint.config.js` + `eslint-config-expo`） |
| `npx tsc --noEmit` | 类型检查（`tsconfig.json`，继承 `expo/tsconfig.base`，`strict: true`） |

> 注意：项目**尚未配置测试框架**（无 Jest / Vitest 依赖）。`TEST_REPORT.md` / `test_report.json` / `cike_web_test.py` 为外部脚本产生的报告，非内置测试命令。

## 目录结构与分层边界

```
src/
├── app/            # expo-router 文件路由（typed routes）。_layout = 根 Stack；(tabs)/ = 标签组；generating/playlist/player = 全屏页
├── components/      # 可复用 UI 组件，统一 StyleSheet.create，通过 index.ts barrel 导出
├── config/          # 运行期配置：constants.ts（端点 / 模型名 / STORAGE_KEYS）、env.ts（EXPO_PUBLIC_* 读取）
├── constants/       # 主题与 UI 数据：theme.ts（Colors.dark / Fonts / Spacing）、quick-scenes.ts
├── hooks/           # use-platform（isMobile/isTablet/isDesktop）、use-theme、use-color-scheme
├── lib/             # 业务逻辑层（纯函数 + 平台分流，无 UI）
│   ├── llm/         # DeepSeek 客户端（client/call-json/prompts）
│   ├── music/       # Audius 客户端 + 统一播放器（player-runtime 分 .native / .web）
│   ├── playlist/    # 歌单生成与兜底逻辑
│   └── storage/     # 本地持久化（settings 平台分流 / playlists 历史）
├── types/           # TS 类型定义，barrel 导出
└── global.css       # 仅 Web 生效的全局样式 / 字体 CSS 变量（在 theme.ts 内 import 一次）
```

**分层规则：**
- `app/` 只编排导航与状态，UI 逻辑下沉到 `components/`，业务/网络逻辑下沉到 `lib/`。
- `lib/` 各子模块对外只通过 `index.ts` barrel 暴露，禁止反向依赖 `app/` 或 `components/`。
- `config/` 与 `constants/` 双中心：`config/` 放运行期值（端点、存储 key），`constants/` 放主题与静态 UI 数据。

## 编码与导入约定

- **路径别名**：`@/*` → `./src/*`，`@/assets/*` → `./assets/*`。统一使用 `@/` 别名，并通过各层 `index.ts` barrel 导入，避免深路径。
- **样式**：一律 `StyleSheet.create`，禁止引入 styled-components / NativeWind / Tailwind（RN 侧）。颜色取自 `Colors.dark.*`；尽管当前代码仍有少量内联 hex，新增样式应优先用主题 token。
- **响应式**：用 `usePlatform()` 返回的 `isMobile / isTablet / isDesktop` 分支合并样式数组，而非手写媒体查询。
- **图标**：`@expo/vector-icons`（`Ionicons` / `MaterialIcons`）。图片用 `expo-image`。背景渐变用 `expo-linear-gradient` 的 `<GradientBackground>`。安全区用 `react-native-safe-area-context` 的 `SafeAreaView`。
- **存储 key**：全部集中在 `src/config/constants.ts` 的 `STORAGE_KEYS`，业务代码不得硬编码 key 字符串（核心原则第 10 条）。

## 网络层（pure fetch，无 axios / openai SDK）

- 故意不使用 `openai` npm 包（CJS 循环依赖在 Metro/RN web 打包时崩溃），用最小 `fetch` 封装。
- **DeepSeek 客户端**（`lib/llm/client.ts`）：key 解析优先级 = 构建期注入的 `.env` key > 本地 `getApiKey()`。统一走 `callJson<T>()`（`response_format: json_object` + `thinking: disabled`）。
- **Audius 客户端**（`lib/music/client.ts`）：host 发现结果模块级缓存；所有请求带 `app_name=此刻` 与 15s `AbortController` 超时；流地址按需懒解析（签名 URL 短期失效）。

## 平台兼容性与陷阱（必读）

- **Web CORS**：Web 端直连 `api.deepseek.com` 可能被浏览器 CORS 拦截；`edge/deepseek-proxy`（Cloudflare Workers，默认 `:8787`）专用于解决此问题。**RN 移动端无 CORS 限制，始终直连，不走代理。**
- **存储平台分流**（`lib/storage/settings.ts`）：移动端用 `expo-secure-store`（Keychain/Keystore 加密），Web 端用 AsyncStorage（明文 IndexedDB，UI 应提示风险）。歌单历史全部走 AsyncStorage。
- **播放器运行时分流**：`player-runtime.native.ts`（expo-audio 指令式 API）与 `player-runtime.web.ts`（HTMLAudioElement）按平台加载。
- **字体平台感知**：`Fonts` 用 `Platform.select` 区分 iOS / 默认 / Web CSS 变量。
- **Web 全局样式**：`src/global.css` 仅在 Web 端生效，通过 `theme.ts` 顶部 `import "@/global.css"` 引入一次。

## 环境变量

`.env`（已 gitignore）通过 Expo 的 `EXPO_PUBLIC_` 前缀机制在构建期注入 `process.env`，模板见 `.env.example`：

- `EXPO_PUBLIC_DEEPSEEK_KEY` —— DeepSeek API key（必填，从 platform.deepseek.com 申请）
- `EXPO_PUBLIC_DEEPSEEK_PROXY_URL` —— Web 端代理地址（可选，部署 edge 代理后填入）

> Audius 免认证，无需任何凭据。

## 敏感区域相关文档

修改以下区域前，请先阅读 `docs/` 下的设计文档：

- `docs/design.md` —— 整体设计（含 §4 端点 / 模型 / 存储依据）
- `docs/architecture.md` —— 架构分层与平台分流（§3.3 存储分流）
- `docs/contracts.md` —— 数据契约与存储 key 定义（§5）
- `docs/github-open-source-analysis.md` —— 第三方开源选型分析

## 工作流程

- **新需求起步**：收到新需求时，先在 GitHub 上搜索相关开源项目（参考已有能力 / 业界实现 / 可复用方案），再决定实现方式。

## 核心原则（必须遵循）

以下原则适用于本仓库的所有编码与修改工作：

1. 保持清晰、合理的目录结构，按照功能和职责组织代码，避免文件随意堆放。

2. 优先保证代码的可读性、可维护性和可扩展性，避免为了短期实现而引入不必要的复杂度。

3. 遵循单一职责原则，一个模块、组件或函数只负责明确的功能。

4. 优先复用已有组件、工具函数和公共能力，避免重复实现相同逻辑。

5. 保持统一的代码风格、命名规范、目录规范和组件设计方式。

6. 控制模块之间的耦合，公共能力应合理抽象，但避免过度封装和过度设计。

7. 修改现有功能前先理解当前代码结构和调用关系，不随意重构无关代码。

8. 每次修改尽量保持最小影响范围，不破坏已有功能、接口和页面行为。

9. 删除废弃代码、无用依赖、调试代码和重复实现，保持项目整洁。

10. 配置、常量、类型定义和公共逻辑应集中管理，避免大量硬编码散落在业务代码中。

11. 组件和模块的命名应能够准确表达用途，避免使用含义模糊的名称。

12. 新增功能时优先考虑后续维护和修改成本，不仅以“当前能够运行”作为完成标准。

13. 保持合理的文件粒度，避免单个文件承担过多职责或无限膨胀。

14. 修改完成后检查编译、类型、Lint 和运行状态，确保项目保持可运行。

15. 未经明确要求，不修改与当前任务无关的代码、依赖、配置和项目结构。
