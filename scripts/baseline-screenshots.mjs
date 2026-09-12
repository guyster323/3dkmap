import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = "http://localhost:3000";
const outDir = path.join("docs", "qa", "wave-0");
fs.mkdirSync(outDir, { recursive: true });

const widths = [375, 768, 1440, 1920];
const routes = [
  ["home", "/"],
  ["world", "/world"],
  ["luoyang", "/world/luoyang"],
  ["episode", "/episodes/v01-e04"],
];

const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width >= 1440 ? 900 : 812 } });
  page.setDefaultTimeout(20000);
  for (const [name, route] of routes) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    const file = path.join(outDir, `${width}-${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("wrote", file);
  }
  await page.close();
}
await browser.close();
