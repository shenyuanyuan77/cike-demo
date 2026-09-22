/**
 * GitHub Pages 子路径部署辅助：把 expo export 产物中的根绝对路径
 * （/_expo/、/assets/、/favicon.ico）重写为项目子路径前缀。
 *
 * 用法：node scripts/fix-ghpages-basepath.mjs [distDir] [basePath]
 * 默认：dist / cike-demo
 *
 * 前提：expo-router 的导航前缀由构建期 EXPO_BASE_URL 提供：
 *   EXPO_BASE_URL=/cike-demo npx expo export -p web
 * 本脚本只补齐静态资源引用，二者缺一不可。
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const distDir = process.argv[2] ?? "dist";
const base = process.argv[3] ?? "cike-demo";
const prefix = `/${base.replace(/^\/|\/$/g, "")}`;

/** 需要重写的文本文件类型 */
const TEXT_EXTS = new Set([".html", ".js", ".css", ".json", ".txt", ".xml"]);

/** 根绝对路径 → 子路径前缀（保留引号边界，避免误伤内容文本） */
const RULES = [
  ['"/_expo/', `"${prefix}/_expo/`],
  ['"/assets/', `"${prefix}/assets/`],
  ['"/favicon.ico', `"${prefix}/favicon.ico`],
  ["(/assets/", `(${prefix}/assets/`],
  ["(/_expo/", `(${prefix}/_expo/`],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let files = 0, replacements = 0;
for await (const file of walk(distDir)) {
  if (!TEXT_EXTS.has(extname(file))) continue;
  const raw = await readFile(file, "utf8");
  let out = raw;
  for (const [from, to] of RULES) {
    const parts = out.split(from);
    if (parts.length > 1) {
      replacements += parts.length - 1;
      out = parts.join(to);
    }
  }
  if (out !== raw) {
    await writeFile(file, out, "utf8");
    files++;
    console.log(`[fix] ${file}`);
  }
}
console.log(`done: ${replacements} replacements in ${files} files (prefix=${prefix})`);
