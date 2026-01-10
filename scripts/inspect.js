const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err));
  try {
    const resp = await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('status', resp && resp.status());
    await page.waitForTimeout(1000);
    const html = await page.content();
    require('fs').writeFileSync('artifacts/preview_content.html', html);
    console.log('Saved HTML length', html.length);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();