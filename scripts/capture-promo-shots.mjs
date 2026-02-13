import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4010';

const shots = [
  {name: 'shot-compose.png', mode: 'compose'},
  {name: 'shot-practice.png', mode: 'practice'},
  {name: 'shot-coach.png', mode: 'coach'},
  {name: 'shot-theory.png', mode: 'theory'},
];

const run = async () => {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1728, height: 972}});
  await page.goto(base, {waitUntil: 'networkidle'});

  for (const shot of shots) {
    const btn = page.locator(`button[data-mode-target="${shot.mode}"]`);
    await btn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `assets/promo/${shot.name}`,
      fullPage: false,
    });
  }

  await browser.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
