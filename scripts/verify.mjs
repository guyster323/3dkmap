import { chromium } from "playwright";

const base = "http://localhost:3000";
const fails = [];

async function check(name, cond, extra = "") {
  if (!cond) {
    fails.push(`${name}${extra ? " — " + extra : ""}`);
    console.log("FAIL", name, extra);
  } else {
    console.log("OK  ", name);
  }
}

async function seen(page, locator) {
  try {
    await locator.first().waitFor({ state: "visible", timeout: 12000 });
    return true;
  } catch {
    return false;
  }
}

async function run(viewport, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(15000);

  await page.goto(base, { waitUntil: "networkidle" });
  await check(`${label} home title`, await page.getByRole("heading", { name: "천하동시" }).isVisible());
  await page.getByRole("link", { name: "권·제목 고르기" }).click();
  await check(`${label} volumes`, await seen(page, page.getByRole("heading", { name: "목차" })));
  await check(`${label} vol60`, await seen(page, page.getByText("촉한 그 뒤")));

  await page.goto(`${base}/volumes/1`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "도원결의" }).first().click();
  await check(`${label} plot`, await page.getByRole("heading", { name: "도원결의" }).isVisible());
  await page.getByRole("link", { name: "같은 시각 천하 보기" }).click();
  await check(`${label} world`, await seen(page, page.getByText("WORLDVIEW")));
  await check(`${label} ticker`, await seen(page, page.getByText("같은 시각 다른 땅")));
  await page.getByRole("button", { name: "일시정지" }).click();
  await check(`${label} pause`, await page.getByRole("button", { name: "재생" }).isVisible());
  await page.getByRole("button", { name: "가족용 요약" }).click();
  await check(`${label} mature`, await page.getByRole("button", { name: "본편 수위 열림" }).isVisible());

  await page.goto(`${base}/me`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "서울" }).click();
  await check(`${label} seoul`, await page.getByText("마한").first().isVisible());
  await page.getByRole("button", { name: "부산" }).click();
  await check(`${label} busan`, await page.getByText("변한").first().isVisible());

  await page.goto(`${base}/scan`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("예: 도원결의, 5권, 호로관").fill("호로관");
  await check(`${label} scan match`, await page.getByText("호로관의 여포").isVisible());

  await page.goto(`${base}/volumes/11`, { waitUntil: "networkidle" });
  await check(`${label} stub`, await page.getByText("다음 단계에서 채워집니다").isVisible());

  await page.goto(`${base}/characters/liu-bei`, { waitUntil: "networkidle" });
  await check(`${label} character`, await page.getByRole("heading", { name: /유비/ }).isVisible());

  await browser.close();
}

await run({ width: 390, height: 844 }, "phone");
await run({ width: 1024, height: 768 }, "tablet");

if (fails.length) {
  console.error("\nFailed:\n" + fails.join("\n"));
  process.exit(1);
}
console.log("\nAll verification checks passed.");
