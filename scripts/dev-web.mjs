import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proxyHealthUrl = "http://127.0.0.1:8787/health";
const children = new Set();
let shuttingDown = false;

function run(command, args) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
    windowsHide: false,
  });
  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
}

async function proxyIsReady() {
  try {
    const response = await fetch(proxyHealthUrl, { signal: AbortSignal.timeout(800) });
    if (!response.ok) return false;
    const body = await response.json();
    return body?.service === "cike-deepseek-proxy";
  } catch {
    return false;
  }
}

async function waitForProxy(timeoutMs = 6000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await proxyIsReady()) return true;
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
  return false;
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(exitCode), 250);
}

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));

console.log("\n此刻 · 一键启动器");
console.log("────────────────────────");

let ownsProxy = false;
if (await proxyIsReady()) {
  console.log("✓ DeepSeek 代理已在运行，直接复用");
} else {
  console.log("• 正在启动 DeepSeek 本地代理…");
  const proxy = run(process.execPath, ["edge/deepseek-proxy/dev-server.mjs"]);
  ownsProxy = true;
  proxy.once("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error("DeepSeek 代理意外退出，请检查 8787 端口是否被占用。");
      void shutdown(code || 1);
    }
  });
  if (!(await waitForProxy())) {
    console.error("DeepSeek 代理启动超时。");
    await shutdown(1);
  }
  console.log("✓ DeepSeek 代理已就绪：http://127.0.0.1:8787");
}

console.log("• 正在启动此刻 Web 应用…");
console.log("  应用地址：http://127.0.0.1:8081");
console.log("  按 Ctrl+C 可同时停止服务。\n");

const expo = process.platform === "win32"
  ? run(process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe", ["/d", "/s", "/c", "npm", "run", "web", "--", "--port", "8081"])
  : run("npm", ["run", "web", "--", "--port", "8081"]);
expo.once("exit", (code) => {
  if (!shuttingDown) void shutdown(code || 0);
});

if (!ownsProxy) {
  console.log("提示：检测到的现有代理不会在本启动器退出时被关闭。\n");
}
