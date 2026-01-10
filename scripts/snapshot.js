const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('artifacts/preview_content.html', html);
    await page.screenshot({ path: 'artifacts/preview_screenshot.png', fullPage: true });
    console.log('Saved snapshot and screenshot');
  } catch (e) {
    console.error('Error taking snapshot', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();