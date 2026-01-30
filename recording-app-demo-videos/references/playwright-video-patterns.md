# Playwright Video Recording Patterns

Reusable patterns for generating Playwright scripts that record watchable demo videos.

## Pacing Constants

All scripts should use these timing constants to produce videos that are comfortable to watch. Values are in milliseconds.

```javascript
const PACE = {
  BEFORE_ACTION: 500,     // Brief pause before clicking/interacting (lets viewer see cursor position)
  AFTER_NAVIGATION: 1500, // Wait after page load (lets page render and viewer orient)
  AFTER_MODAL_OPEN: 800,  // Wait after modal/dialog appears
  TYPING_DELAY: 80,       // Per-character delay when typing (simulates real typing speed)
  AFTER_TYPING: 600,      // Pause after finishing a text input
  AFTER_ACTION: 1000,     // General pause after a click or interaction
  FINAL_HOLD: 2500,       // Hold on the final state before ending recording
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
```

**Target video durations**: 10–60 seconds per story depending on complexity.
- Simple view/browse story: 10–20s
- Form submission flow: 20–40s
- Multi-step workflow: 40–60s

## Video Context Setup

Recording scripts run in **headless mode** by default (no visible browser window). Only `setup-auth.js` uses headed mode since it requires manual login interaction.

```javascript
// Recording scripts — headless (default)
const browser = await chromium.launch();

// Auth setup only — headed so the user can interact
const browser = await chromium.launch({ headless: false });
```

Every script should create a browser context with video recording enabled:

```javascript
const context = await browser.newContext({
  ...(useAuth ? { storageState: AUTH_STATE_PATH } : {}),
  viewport: { width: 1280, height: 800 },
  recordVideo: {
    dir: path.join(OUTPUT_DIR, '_raw'),
    size: { width: 1280, height: 800 },
  },
});
```

- **Headless**: Playwright captures video via CDP, not screen pixels, so headless mode produces identical recordings. No need to keep a browser window open.
- **Viewport**: 1280×800 is a good balance between readable text and compact file size.
- **Raw directory**: Playwright saves videos with random names. Scripts rename them in the `finally` block.
- **Format**: Playwright records as WebM (VP8 codec) by default.

## Visible Cursor

Playwright's headless mode doesn't render a mouse cursor in recordings. Inject a visible cursor dot so viewers can follow what's being clicked. This is built into `shared.js` — see `references/shared-js-template.md`.

- **Dot**: 24px red radial gradient with a dark border — visible on light and dark backgrounds.
- **Movement**: Smooth 120ms CSS transition so the cursor glides between positions instead of teleporting.
- **Click pulse**: On mousedown, the dot scales up to 1.6x and shows an expanding ring. Resets on mouseup.
- **Inject after setup**: Call `injectCursor(page)` AFTER the fast setup phase, right before the paced story begins. This prevents the cursor from flickering during setup navigation.

## Two-Phase Script Structure

Every recording script has two phases to eliminate "startup noise" (boring navigation to get to the interesting part):

```javascript
// === SETUP PHASE (fast, no pacing) ===
// Navigate to the starting state without any sleeps.
// This happens in ~1 second of video — a quick flash, not a slow walkthrough.
await page.goto(APP_URL);
await page.waitForLoadState('networkidle');
await page.locator('button:has-text("Section")').first().click();
await page.getByText('Target View').click();
await page.waitForSelector('.content', { state: 'visible', timeout: 10000 }).catch(() => {});

// Inject cursor between phases
await injectCursor(page);
await sleep(300); // brief settle

// === STORY PHASE (paced, watchable) ===
// Now the real demo begins. Use PACE timings for all actions.
await sleep(PACE.AFTER_ACTION);
// ... paced interactions ...
await sleep(PACE.FINAL_HOLD);
```

- **Setup phase**: No `sleep()` calls. Navigate to the exact starting view as fast as Playwright can. This shows up as a brief ~1s "opening" in the video.
- **Story phase**: All actions use `PACE` timings. This is the watchable part viewers care about.
- **Cursor injection**: Happens between phases so the cursor doesn't appear during the fast setup.

The `shared.js` module's `record()` function encapsulates this pattern.

## Action Patterns

### Navigation

```javascript
// Navigate to a URL
await page.goto(`${APP_URL}/some-path`);
await sleep(PACE.AFTER_NAVIGATION);

// Wait for the page to be fully loaded (use when content is dynamic)
await page.goto(APP_URL);
await page.waitForLoadState('networkidle');
await sleep(PACE.AFTER_NAVIGATION);
```

### Clicking

```javascript
// Click a button or link
await sleep(PACE.BEFORE_ACTION);
await page.click('button:has-text("Add Repository")');
await sleep(PACE.AFTER_ACTION);

// Click using accessible roles (preferred)
await sleep(PACE.BEFORE_ACTION);
await page.getByRole('button', { name: 'Submit' }).click();
await sleep(PACE.AFTER_ACTION);

// Click by text content
await sleep(PACE.BEFORE_ACTION);
await page.getByText('View All').click();
await sleep(PACE.AFTER_ACTION);
```

### Typing

```javascript
// Type into an input field (realistic speed)
await page.click('input[placeholder="Search..."]');
await page.type('input[placeholder="Search..."]', 'react', { delay: PACE.TYPING_DELAY });
await sleep(PACE.AFTER_TYPING);

// Clear and retype
await page.fill('input[name="query"]', '');
await page.type('input[name="query"]', 'new search term', { delay: PACE.TYPING_DELAY });
await sleep(PACE.AFTER_TYPING);

// Type into a focused element
await page.getByPlaceholder('Enter repository URL').click();
await page.getByPlaceholder('Enter repository URL').type('https://github.com/org/repo', {
  delay: PACE.TYPING_DELAY,
});
await sleep(PACE.AFTER_TYPING);
```

### Waiting for Elements

```javascript
// Wait for a modal to appear
await page.waitForSelector('[role="dialog"]', { state: 'visible' });
await sleep(PACE.AFTER_MODAL_OPEN);

// Wait for content to load
await page.waitForSelector('.feed-item', { state: 'visible', timeout: 10000 });
await sleep(PACE.AFTER_ACTION);

// Wait for an element to disappear (e.g., loading spinner)
await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 15000 });
await sleep(PACE.AFTER_ACTION);
```

### Scrolling

```javascript
// Scroll down smoothly
await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
await sleep(PACE.AFTER_ACTION);

// Scroll to a specific element
await page.evaluate(() => {
  document.querySelector('.target-section').scrollIntoView({ behavior: 'smooth' });
});
await sleep(PACE.AFTER_ACTION);

// Scroll to bottom
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
await sleep(PACE.AFTER_ACTION);

// Scroll back to top
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
await sleep(PACE.AFTER_ACTION);
```

### Hover (for tooltips, dropdown reveals)

```javascript
// Hover over an element to reveal a tooltip
await page.hover('.info-icon');
await sleep(PACE.BEFORE_ACTION);

// Hover to reveal action buttons
await page.hover('.list-item:first-child');
await sleep(PACE.AFTER_ACTION);
```

### Keyboard Shortcuts

```javascript
// Press a keyboard shortcut
await page.keyboard.press('Escape');
await sleep(PACE.AFTER_ACTION);

// Submit with Enter
await page.keyboard.press('Enter');
await sleep(PACE.AFTER_ACTION);

// Cmd/Ctrl+K (command palette)
await page.keyboard.press('Meta+k');
await sleep(PACE.AFTER_MODAL_OPEN);
```

### Dropdown / Select

```javascript
// Open a dropdown and select an option
await sleep(PACE.BEFORE_ACTION);
await page.click('[data-testid="filter-dropdown"]');
await sleep(PACE.AFTER_MODAL_OPEN);
await page.click('[data-value="major"]');
await sleep(PACE.AFTER_ACTION);
```

## Selector Strategy

Choose selectors in this priority order for reliability:

1. **`data-testid` attributes** (most stable, won't break with text/style changes):
   ```javascript
   await page.click('[data-testid="add-repo-button"]');
   ```

2. **Accessible roles** (semantic, readable, fairly stable):
   ```javascript
   await page.getByRole('button', { name: 'Add Repository' });
   await page.getByRole('link', { name: 'Settings' });
   await page.getByRole('dialog');
   ```

3. **Placeholder/label text** (good for form inputs):
   ```javascript
   await page.getByPlaceholder('Enter repository URL');
   await page.getByLabel('Email address');
   ```

4. **Visible text content** (readable but can break with copy changes):
   ```javascript
   await page.getByText('Add Repository');
   await page.getByText('View All Repos');
   ```

5. **CSS selectors** (last resort, most brittle):
   ```javascript
   await page.click('.sidebar button.add-btn');
   await page.click('nav a[href="/settings"]');
   ```

## Error Resilience

Scripts should be fault-tolerant since UI state can vary:

```javascript
// Use try/catch for optional actions (e.g., dismissing a banner that may not appear)
try {
  await page.click('.cookie-banner button', { timeout: 3000 });
} catch {
  // Banner not present, continue
}

// Use soft assertions for state that might vary
const count = await page.locator('.feed-item').count();
if (count > 0) {
  // Interact with feed items
  await page.click('.feed-item:first-child');
  await sleep(PACE.AFTER_ACTION);
}
```

## Tips for Watchable Videos

1. **Start with a clean state**: Navigate to the starting page, wait for full load.
2. **Pause before and after key moments**: Give the viewer time to see what happened.
3. **Use smooth scrolling**: `behavior: 'smooth'` makes scrolling feel natural.
4. **Realistic typing speed**: 80ms delay looks human; much faster looks robotic.
5. **End with a hold**: Always `await sleep(PACE.FINAL_HOLD)` at the end so the final state is visible.
6. **One story per video**: Keep each recording focused on a single user flow.
7. **Order scripts logically**: Number scripts (01, 02, ...) in the order a new user would discover features.
