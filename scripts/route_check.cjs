// Load a URL in headless Edge and report rendered state: route match, visible text, console errors.
const { chromium } = require("playwright-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = process.argv[2] || "http://127.0.0.1:8899/cike-demo/";

(async () => {
  const browser = await chromium.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--disable-gpu", "--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 832 } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text().slice(0, 200)); });
  page.on("pageerror", (err) => errors.push("PAGEERROR: " + String(err).slice(0, 200)));

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);

  const bodyText = (await page.innerText("body").catch(() => "")).slice(0, 400);
  const result = {
    url: page.url(),
    hasUnmatched: /Unmatched/i.test(bodyText),
    hasHome: /一句话|今天想听点什么/.test(bodyText),
    bodyText,
    errors: errors.slice(0, 6),
  };
  console.log(JSON.stringify(result, null, 2));
  await page.screenshot({ path: process.argv[3] || "/tmp/route_check.png" });
  await browser.close();
})().catch((e) => { console.error("FAILED:", e); process.exit(1); });
