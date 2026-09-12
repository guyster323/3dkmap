import { chromium } from "playwright";

const base = "http://localhost:3000";
const fails = [];

const HSCROLL_ROUTES = [
  "/",
  "/world",
  "/world/luoyang",
  "/world/xuchang",
  "/episodes/v01-e04",
  "/characters/liu-bei",
  "/characters/zhuge-liang",
  "/me",
  "/volumes",
  "/volumes/1",
  "/scan",
  "/places/luoyang",
];

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

async function goto(page, path) {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
}

async function hScrollBox(page) {
  return page.evaluate(() => {
    const el = document.scrollingElement;
    if (!el) return { sw: -1, cw: -1 };
    return { sw: el.scrollWidth, cw: el.clientWidth };
  });
}

async function run(viewport, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(15000);
  const wide = viewport.width >= 1024;

  await goto(page, "/");
  await check(`${label} home title`, await page.getByRole("heading", { name: "천하동시" }).isVisible());
  await check(`${label} scan start`, await page.getByRole("menuitem", { name: /책 스캔/ }).isVisible());
  await page.getByRole("menuitem", { name: "권·제목 고르기" }).click();
  await check(`${label} volumes`, await seen(page, page.getByRole("heading", { name: "목차" })));
  await check(`${label} vol60`, await seen(page, page.getByText("촉한 그 뒤")));
  const volLinks = await page.locator("main ol a").count();
  await check(`${label} vol count 60`, volLinks === 60, `got ${volLinks}`);
  await check(`${label} era tab`, await seen(page, page.getByRole("button", { name: /군웅할거/ })));
  await check(`${label} no stub jargon`, (await page.getByText(/^Plot$/).count()) === 0);

  await goto(page, "/volumes/12");
  await check(`${label} vol next`, await seen(page, page.getByRole("link", { name: /13권/ })));
  await check(`${label} vol event link`, (await page.locator('a[href^="/world?year="]').count()) > 0);

  await goto(page, "/volumes/1");
  await page.getByRole("link", { name: "도원결의" }).first().click();
  await check(`${label} plot`, await page.getByRole("heading", { name: "도원결의" }).isVisible());
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await check(`${label} chip yeonui`, await seen(page, page.locator("li").filter({ hasText: /^연의/ })));
  await check(`${label} chip jeongsa`, await seen(page, page.locator("li").filter({ hasText: /^정사/ })));
  const yeonuiClass = await page
    .locator("li")
    .filter({ hasText: /^연의/ })
    .first()
    .locator("span")
    .first()
    .getAttribute("class");
  await check(`${label} chip yeonui color`, Boolean(yeonuiClass && yeonuiClass.includes("cinnabar")), yeonuiClass ?? "");
  await check(`${label} mature hint`, await seen(page, page.getByRole("button", { name: /본편 수위/ })));
  await check(`${label} no playback`, (await page.getByRole("button", { name: /재생|플레이/ }).count()) === 0);
  await page.getByRole("link", { name: "같은 시각 천하 보기" }).click();
  await check(`${label} world`, await seen(page, page.getByText("전역도")));
  await check(`${label} frozen`, await seen(page, page.getByText("시계 정지")));
  await check(`${label} tiles`, await page.locator("canvas").first().isVisible());
  await check(`${label} prev event`, await seen(page, page.getByRole("button", { name: "◀ 이전 사건" })));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await check(`${label} chip samguk`, await seen(page, page.locator("li").filter({ hasText: /^삼국사기/ })));
  await page.getByRole("button", { name: "본편 수위" }).click();
  await check(
    `${label} mature`,
    (await page.getByRole("button", { name: "본편 수위" }).getAttribute("aria-pressed")) === "true",
  );
  const koreaStrip = page.locator("button[aria-pressed]").filter({ hasText: "한반도" }).first();
  await koreaStrip.click();
  await check(`${label} region filter`, (await koreaStrip.getAttribute("aria-pressed")) === "true");

  if (wide) {
    const node = page.getByRole("button", { name: "낙양", exact: true });
    await node.scrollIntoViewIfNeeded();
    await node.click();
    try {
      await page.waitForURL(/\/world\/luoyang/, { timeout: 8000 });
    } catch {
      /* fall through to the assertion */
    }
    await check(`${label} battle from node`, /\/world\/luoyang/.test(page.url()), page.url());
  } else {
    await goto(page, "/world/luoyang?episode=v01-e04");
  }

  await check(`${label} battle map`, await seen(page, page.getByText("전투맵")));
  await check(`${label} zoom`, await seen(page, page.getByRole("button", { name: "2배 확대" })));
  await check(`${label} tiles battle`, await page.locator("canvas").first().isVisible());
  await check(
    `${label} place label`,
    await seen(page, page.getByRole("button", { name: "낙양" })),
  );

  const menu = page.getByRole("menu", { name: "명령" });
  await check(`${label} command menu`, await seen(page, menu));
  await menu.scrollIntoViewIfNeeded();
  await menu.focus();
  const before = await menu.getAttribute("aria-activedescendant");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const after = await menu.getAttribute("aria-activedescendant");
  await check(
    `${label} command keys move`,
    Boolean(after && after !== before),
    `before=${before} after=${after}`,
  );
  await page.keyboard.press("Enter");
  try {
    await page.waitForURL(/\/episodes\//, { timeout: 8000 });
  } catch {
    /* fall through */
  }
  await check(`${label} command keys pick`, /\/episodes\//.test(page.url()), page.url());

  await goto(page, "/world/xuchang");
  await check(`${label} approx terrain`, await seen(page, page.getByText("약식 지형")));

  await goto(page, "/me");
  await check(`${label} me korea`, await seen(page, page.getByRole("heading", { name: "지금 당신이 있는 땅에서" })));
  await page.getByRole("button", { name: "서울" }).click();
  await check(`${label} seoul`, await page.getByText("마한").first().isVisible());
  await check(
    `${label} seoul selected`,
    (await page.getByRole("button", { name: "서울" }).getAttribute("aria-pressed")) === "true",
  );
  await check(`${label} korea map`, await seen(page, page.getByLabel("한반도 상황도")));
  await page.getByRole("button", { name: "부산" }).click();
  await check(`${label} busan`, await page.getByText("변한").first().isVisible());
  await check(`${label} year step`, await seen(page, page.getByRole("button", { name: "1년 전" })));

  await goto(page, "/scan");
  await check(`${label} scan heading`, await seen(page, page.getByRole("heading", { name: "책을 비추세요" })));
  await page.getByPlaceholder("예: 도원결의, 적벽, 오장원").fill("호로관");
  await check(`${label} scan match`, await page.getByText("호로관의 여포").isVisible());
  await check(`${label} scan badge`, await seen(page, page.getByText(/일치|유사 제목/)));
  await page.getByPlaceholder("예: 도원결의, 적벽, 오장원").fill("적벽");
  await check(`${label} scan late`, await page.getByText("적벽").first().isVisible());
  await page.getByPlaceholder("예: 도원결의, 적벽, 오장원").fill("qqqzzzwww");
  await check(`${label} scan empty`, await seen(page, page.getByText("일치하는 권이나 회차를 찾지 못했습니다")));

  const catalog = await (await page.goto(`${base}/api/catalog-check`, { waitUntil: "networkidle" })).json();
  await check(`${label} catalog`, catalog.ok, (catalog.issues ?? []).join(" | "));

  const tilesRes = await page.goto(`${base}/assets/eiketsu/tiles32.png`);
  const unitsRes = await page.goto(`${base}/assets/eiketsu/units.png`);
  const kaoRes = await page.goto(`${base}/assets/eiketsu/kao.png`);
  await check(`${label} atlas tiles`, Boolean(tilesRes?.ok()));
  await check(`${label} atlas units`, Boolean(unitsRes?.ok()));
  await check(`${label} atlas kao`, Boolean(kaoRes?.ok()));

  await goto(page, "/volumes/11");
  await check(`${label} vol11`, await seen(page, page.getByText("곡아의 거병")));
  await goto(page, "/volumes/26");
  await check(`${label} vol26`, await seen(page, page.getByText("장강이 불타다")));
  await goto(page, "/volumes/59");
  await check(`${label} vol59`, await seen(page, page.getByText("추풍 오장원")));

  await goto(page, "/characters/liu-bei");
  await check(`${label} character`, await page.getByRole("heading", { name: /유비/ }).isVisible());
  await goto(page, "/characters/zhuge-liang");
  await check(`${label} kao fallback`, await page.getByRole("heading", { name: /제갈량/ }).isVisible());
  await check(`${label} kao canvas`, await page.locator("canvas").first().isVisible());

  await goto(page, "/places/luoyang");
  await check(`${label} place map`, await page.locator("svg").first().isVisible());

  const vp = await page.locator('meta[name="viewport"]').getAttribute("content");
  await check(`${label} pinch zoom`, Boolean(vp && !/maximum-scale\s*=\s*1/i.test(vp)), vp ?? "");

  await browser.close();
}

async function runHScroll(viewport, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(15000);

  for (const path of HSCROLL_ROUTES) {
    await goto(page, path);
    const box = await hScrollBox(page);
    await check(
      `${label} no hscroll ${path}`,
      box.sw <= box.cw,
      `scrollWidth=${box.sw} clientWidth=${box.cw}`,
    );
  }

  await browser.close();
}

await run({ width: 390, height: 844 }, "phone");
await run({ width: 1024, height: 768 }, "tablet");
await runHScroll({ width: 375, height: 812 }, "375");

if (fails.length) {
  console.error("\nFailed:\n" + fails.join("\n"));
  process.exit(1);
}
console.log("\nAll verification checks passed.");
