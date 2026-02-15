import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, 'mock.html');
const outDir = path.join(__dirname, 'out');

const shots = [
  { id: 'screen-1', file: 'learning-lab-01-start-concept.png' },
  { id: 'screen-2', file: 'learning-lab-02-see-motion.png' },
  { id: 'screen-3', file: 'learning-lab-03-transfer-checkpoint.png' },
  { id: 'screen-4', file: 'learning-lab-04-repertoire-anchors.png' }
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 980 } });

await page.goto(`file://${htmlPath}`);
await page.waitForTimeout(120);

for (const shot of shots) {
  const locator = page.locator(`#${shot.id}`);
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);
  await locator.screenshot({
    path: path.join(outDir, shot.file),
    type: 'png'
  });
}

await browser.close();
console.log('Rendered mock screens to', outDir);
