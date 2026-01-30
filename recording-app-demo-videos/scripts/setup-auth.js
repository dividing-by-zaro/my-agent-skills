const { chromium } = require('playwright');
const path = require('path');

// ============================================================
// CUSTOMIZE: Set the default dev server URL for this project.
// ============================================================
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(APP_URL);
  console.log('\nLog in to the app in the browser window.');
  console.log('When done, close the Playwright Inspector to save your session.\n');

  await page.pause();

  await context.storageState({ path: AUTH_STATE_PATH });
  console.log(`Auth state saved to ${AUTH_STATE_PATH}`);

  await browser.close();
})();
