/**
 * Mobile UX smoke check at iPhone-ish viewports.
 * Run: node scripts/verify-mobile-ux.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_BASE ?? 'http://127.0.0.1:5173/';
const VIEWPORTS = [
  { name: 'iPhone390', width: 390, height: 844 },
  { name: 'iPhone430', width: 430, height: 932 }
];

async function assertVisible(page, selector, label) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: 'visible', timeout: 8000 });
  const box = await el.boundingBox();
  if (!box || box.height < 8) {
    throw new Error(`${label}: not visibly laid out (${selector})`);
  }
  const vh = (await page.viewportSize()).height;
  if (box.y + box.height < 0 || box.y > vh) {
    throw new Error(`${label}: off-screen (${selector} y=${box.y})`);
  }
  return box;
}

async function runViewport(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0.0.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();
  const failures = [];

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector('.ask-shell', { timeout: 10000 });

    const appHeight = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--app-height').trim()
    );
    if (!appHeight.endsWith('px')) {
      failures.push(`--app-height missing (${appHeight})`);
    }

    const chromeBox = await assertVisible(page, '.app-chrome', 'App chrome');
    if (chromeBox.y < -2) {
      failures.push(`App chrome clipped above viewport (y=${chromeBox.y})`);
    }

    const starters = page.locator('.ask-starters button');
    const starterCount = await starters.count();
    if (starterCount < 4) {
      failures.push(`Expected 4 starters, got ${starterCount}`);
    }

    const emptyBody = page.locator('.ask-body-empty');
    await emptyBody.waitFor({ state: 'visible' });
    const overflowY = await emptyBody.evaluate((el) => getComputedStyle(el).overflowY);
    if (overflowY !== 'auto' && overflowY !== 'scroll') {
      failures.push(`.ask-body-empty overflow-y=${overflowY}, expected auto/scroll`);
    }

    await starters.nth(3).scrollIntoViewIfNeeded();
    const lastBox = await starters.nth(3).boundingBox();
    const footerBox = await page.locator('.site-footer').boundingBox();
    if (!lastBox || !footerBox) {
      failures.push('Could not measure last starter / footer');
    } else if (lastBox.y + lastBox.height > footerBox.y + 2) {
      failures.push(
        `4th starter overlaps footer (starter bottom ${lastBox.y + lastBox.height} vs footer ${footerBox.y})`
      );
    }

    await page.locator('.mode-switcher button').nth(1).click();
    await page.waitForSelector('.inspector-cta', { timeout: 15000 });
    await assertVisible(page, '.inspector-cta', 'Details CTA');

    if ((await page.locator('.mobile-inspector-panel').count()) > 0) {
      failures.push('mobile-inspector-panel still mounted');
    }

    await page.locator('.inspector-cta').click();
    await page.waitForSelector('.bottom-sheet', { timeout: 5000 });
    await assertVisible(page, '.bottom-sheet', 'Inspector sheet');
    await assertVisible(page, '.bottom-sheet .inspector', 'Inspector content');

    await page.locator('.inspector-backdrop').click({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(400);
    if ((await page.locator('.bottom-sheet').count()) > 0) {
      failures.push('Sheet did not dismiss on backdrop tap');
    }

    await page.locator('.inspector-cta').click();
    await page.waitForSelector('.bottom-sheet');
    await page.locator('.bottom-sheet-header .icon-btn').click();
    await page.waitForTimeout(300);
    if ((await page.locator('.bottom-sheet').count()) > 0) {
      failures.push('Sheet did not dismiss on close icon');
    }

    await page.locator('.header-link').first().click();
    await page.waitForSelector('.bottom-sheet .chat-panel', { timeout: 5000 });
    await page.locator('.bottom-sheet-header .icon-btn').click();
    await page.waitForTimeout(300);

    await page.locator('.chrome-pages-trigger').click();
    await page.locator('.chrome-pages-menu button').nth(1).click();
    await page.waitForSelector('.doc-page');
    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    if (bodyOverflow !== 'auto' && bodyOverflow !== 'scroll') {
      failures.push(`body.route-features overflow=${bodyOverflow}`);
    }

    await page.locator('.doc-page-back').click();
    await page.waitForSelector('.app-shell, .ask-shell', { timeout: 8000 });
    await assertVisible(page, '.app-chrome', 'App chrome after return');
  } catch (err) {
    failures.push(String(err));
  } finally {
    await context.close();
  }

  return failures;
}

const browser = await chromium.launch({ headless: true });
let failed = false;
for (const vp of VIEWPORTS) {
  const failures = await runViewport(browser, vp);
  if (failures.length) {
    failed = true;
    console.error(`FAIL ${vp.name}:`);
    for (const f of failures) console.error(`  - ${f}`);
  } else {
    console.log(`PASS ${vp.name}`);
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
