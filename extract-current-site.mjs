import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outDir = path.resolve("extracted/current-site");
const pages = [
  ["wood", "https://www.bluebirdfence.com/wood-fence-installation"],
  ["vinyl", "https://www.bluebirdfence.com/vinyl-fence-installation"],
  ["temporary", "https://www.bluebirdfence.com/temporary-fence-installation"],
  ["chain-link", "https://www.bluebirdfence.com/chain-link-fence-installation"],
  ["aluminum", "https://www.bluebirdfence.com/aluminum-fence-installation"],
  ["gallery", "https://www.bluebirdfence.com/gallery"],
  ["about", "https://www.bluebirdfence.com/about"]
];

function cleanLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line, index, arr) => index === 0 || line !== arr[index - 1]);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1400 },
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
});

await fs.mkdir(outDir, { recursive: true });

for (const [key, url] of pages) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(4000);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 800) {
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);

  const data = await page.evaluate(() => {
    const images = Array.from(document.images)
      .map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt || "",
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0
      }))
      .filter((img) => img.src && !img.src.startsWith("data:"));
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4"))
      .map((node) => ({ tag: node.tagName, text: node.textContent.replace(/\s+/g, " ").trim() }))
      .filter((item) => item.text);
    return {
      title: document.title,
      url: location.href,
      text: document.body.innerText,
      headings,
      images
    };
  });

  const lines = cleanLines(data.text);
  await fs.writeFile(path.join(outDir, `${key}.json`), JSON.stringify({ ...data, lines }, null, 2));
  await fs.writeFile(path.join(outDir, `${key}.txt`), lines.join("\n"));
  await page.screenshot({ path: path.join(outDir, `${key}.png`), fullPage: true });
  await page.close();
}

await browser.close();
