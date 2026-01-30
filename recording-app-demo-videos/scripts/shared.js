const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================================
// CUSTOMIZE: Set the default dev server URL for this project.
// Users can also override at runtime: APP_URL=http://... node record-all.js
// ============================================================
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ============================================================
// SHARED ENGINE — do not modify per project
// ============================================================

const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Pacing constants — tuned for watchable videos.
// Changing these affects every story script uniformly.
const PACE = {
  BEFORE_ACTION: 500,     // pause before clicking (lets viewer see cursor)
  AFTER_NAVIGATION: 1500, // wait after page load
  AFTER_MODAL_OPEN: 800,  // wait after modal/dialog appears
  TYPING_DELAY: 80,       // ms per character (simulates human typing)
  AFTER_TYPING: 600,      // pause after finishing text input
  AFTER_ACTION: 1000,     // general pause after click/interaction
  FINAL_HOLD: 2500,       // hold on final state before ending recording
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Auth state check — warns if session is stale
function checkAuth() {
  const useAuth = fs.existsSync(AUTH_STATE_PATH);
  if (useAuth) {
    const stats = fs.statSync(AUTH_STATE_PATH);
    const ageHours = (Date.now() - stats.mtimeMs) / 3600000;
    if (ageHours > 24) {
      console.warn('Auth state is over 24h old. Run setup-auth.js to refresh.');
    }
  }
  return useAuth;
}

// Visible cursor — injects a red dot that follows mouse position and
// pulses on click. Headless Playwright doesn't render a system cursor,
// so this is the only way viewers can see where interactions happen.
async function injectCursor(page) {
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.style.cssText = `
      width: 24px; height: 24px;
      background: radial-gradient(circle, rgba(255,80,80,0.9) 0%, rgba(255,80,80,0.4) 60%, transparent 70%);
      border: 2.5px solid rgba(0,0,0,0.7);
      border-radius: 50%;
      position: fixed;
      top: -50px; left: -50px;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: top 0.12s ease-out, left 0.12s ease-out, transform 0.1s ease-out, box-shadow 0.1s ease-out;
      box-shadow: 0 0 0 0 rgba(255,80,80,0);
    `;
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.6)';
      cursor.style.boxShadow = '0 0 0 8px rgba(255,80,80,0.25)';
    });
    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.boxShadow = '0 0 0 0 rgba(255,80,80,0)';
    });
  });
}

/**
 * Record a demo video.
 *
 * Two-phase structure:
 * 1. SETUP (fast) — setupFn navigates to the starting state with no sleeps.
 *    This appears as a brief ~1s flash in the video, not a slow walkthrough.
 * 2. STORY (paced) — storyFn performs the demo with PACE timings.
 *    This is the watchable part viewers care about.
 *
 * The visible cursor is injected between the two phases.
 *
 * @param {string} storyName - Output filename (without .webm extension)
 * @param {((page: import('playwright').Page) => Promise<void>) | null} setupFn
 *   Fast navigation to starting state. Pass null if the story starts on the landing page.
 * @param {(page: import('playwright').Page) => Promise<void>} storyFn
 *   Paced story actions — use PACE timings for all interactions.
 */
async function record(storyName, setupFn, storyFn) {
  const useAuth = checkAuth();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...(useAuth ? { storageState: AUTH_STATE_PATH } : {}),
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: path.join(OUTPUT_DIR, '_raw'),
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  try {
    // SETUP PHASE — fast navigation, no pacing
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    if (setupFn) await setupFn(page);

    // Inject visible cursor between phases
    await injectCursor(page);
    await sleep(300);

    // STORY PHASE — paced, watchable
    await storyFn(page);
    await sleep(PACE.FINAL_HOLD);
  } finally {
    await page.close();
    const video = page.video();
    if (video) {
      const rawPath = await video.path();
      const finalPath = path.join(OUTPUT_DIR, `${storyName}.webm`);
      fs.mkdirSync(path.dirname(finalPath), { recursive: true });
      await new Promise((r) => setTimeout(r, 500));
      fs.renameSync(rawPath, finalPath);
      console.log(`Saved: ${finalPath}`);
    }
    await context.close();
    await browser.close();
  }
}

module.exports = { PACE, sleep, injectCursor, record, checkAuth, APP_URL, AUTH_STATE_PATH, OUTPUT_DIR };
