// E2E: run the full generation flow on the live GitHub Pages site.
const { chromium } = require("playwright-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
  const browser = await chromium.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--disable-gpu", "--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 832 } });
  await page.goto("https://shenyuanyuan77.github.io/cike-demo/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  const input = page.getByPlaceholder("今天想听点什么？");
  await input.click();
  await input.fill("深夜加班后的地铁，安静治愈一点");
  await page.keyboard.press("Enter");

  let ok = false;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(3000);
    if (page.url().includes("playlist")) { ok = true; break; }
  }
  await page.waitForTimeout(3000);
  const text = (await page.innerText("body").catch(() => "")).slice(0, 300);
  console.log(JSON.stringify({
    navigated: ok,
    finalUrl: page.url(),
    hasSongsUI: /首歌曲|为你挑选|播放全部/.test(text),
    text: text.slice(0, 200),
  }, null, 2));
  await page.screenshot({ path: "/tmp/live_playlist.png" });
  await browser.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
