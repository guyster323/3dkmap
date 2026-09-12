import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const dests = process.argv.slice(2);
if (!dests.length) dests.push(path.join("docs", "qa", "wave-2"));
const widths = [375, 768, 1440, 1920];
const routes = [
  ["home", "/"],
  ["world", "/world"],
];
const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width >= 1440 ? 900 : 812 } });
  page.setDefaultTimeout(20000);
  for (const [name, route] of routes) {
    await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
    const file = `${width}-${name}.png`;
    for (const dir of dests) {
      fs.mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: path.join(dir, file), fullPage: true });
    }
    console.log("wrote", file);
  }
  await page.close();
}
await browser.close();
