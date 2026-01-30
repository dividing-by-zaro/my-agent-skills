# Recording App Demo Videos

Generate Playwright scripts that record short demo videos (WebM) of any web app's core user flows.

## Invocation

```
/recording-app-demo-videos
```

## What This Skill Does

Analyzes the current project's codebase, identifies core user stories, and generates Playwright scripts that record watchable demo videos of each flow. Videos are saved as WebM files in `scripts/demo-videos/output/`.

## Workflow

### Step 0: Prerequisites

Check that the project is ready for video recording:

1. **Playwright installed**: Check `package.json` for `@playwright/test` or `playwright`. If missing:
   ```bash
   npm install --save-dev @playwright/test
   ```
2. **Chromium browser binary**: Run `npx playwright install chromium` if needed.
3. **Dev server running**: Ask the user for the app URL. Default to `http://localhost:5173` (Vite) or `http://localhost:3000` (Next.js/CRA). Confirm the server is reachable before proceeding.
4. **Output directory**: Create `scripts/demo-videos/` directory structure:
   ```
   scripts/demo-videos/
     stories/          # One script per user story
     output/           # Recorded WebM files
   ```
5. **Gitignore**: Ensure `.auth-state.json` and `scripts/demo-videos/output/` are in `.gitignore`.

### Step 1: Analyze Codebase → User Stories

Follow the methodology in `references/user-story-discovery.md` to identify user stories:

1. **Read project context**: Check `README.md`, `CLAUDE.md`, or similar docs for high-level understanding.
2. **Identify frontend framework**: Read `package.json` for React, Vue, Svelte, Next.js, etc.
3. **Find entry point**: Locate main app component (`App.tsx`, `layout.tsx`, `+page.svelte`, etc.).
4. **Trace routes/navigation**: Find the router config or file-based routing structure. List all navigable pages.
5. **Scan interactive elements**: Look for forms, modals, dropdowns, filters, buttons with handlers, and any stateful UI.
6. **Compose user stories**: Create a prioritized list:
   - **P0 (Essential views)**: Landing page, main dashboard, key content pages — things every user sees.
   - **P1 (Core flows)**: Primary user actions — adding items, submitting forms, CRUD operations.
   - **P2 (Secondary interactions)**: Filters, settings, secondary modals, edge cases.

7. **Ask what's most interesting**: Before finalizing stories, ask the user:
   - What are the most impressive or unique features of this app?
   - What data currently exists in the app that would look good on video? (e.g., which repos, which content, populated vs empty views)
   - For any query/search features: what's a specific, compelling question or search that would showcase the feature's power? Generic queries like "show me recent changes" are boring — specific ones like "When were agent skills first introduced?" demonstrate real value.
   - Are any views currently empty or stale? (Avoid recording empty states unless that IS the story.)

8. **Present to user for approval**: Show the story list with descriptions and ask the user to confirm, reorder, add, or remove stories before generating scripts.

Example story format:
```
01 - Explore Feed (P0): Browse the All Repos feed, expand a commit list, hover over interactive elements
02 - Add Repository (P1): Add a repo via modal, then navigate to it in the sidebar and watch indexing progress
03 - Ask a Question (P1): Navigate to a specific repo, ask a pointed question, watch the streaming answer with citations
04 - Star Update (P2): Star an update and view the starred items view
```

### Step 2: Auth Setup

If the app requires authentication:

1. **Copy `scripts/setup-auth.js`** into the project's `scripts/demo-videos/setup-auth.js`. Update the `APP_URL` if the project doesn't use Vite's default port.
2. The script launches a **visible** Chromium browser, navigates to the app URL, and pauses via Playwright Inspector so the user can log in manually. On close, it saves browser state to `.auth-state.json`.
3. If the app does **not** require auth, skip this step and generate scripts without `storageState`.

### Step 3: Generate Recording Scripts

For each approved user story, generate a Playwright script in `scripts/demo-videos/stories/`. Use the patterns in `references/playwright-video-patterns.md`.

**Copy `scripts/shared.js`** into the project's `scripts/demo-videos/shared.js`. The only line to customize is `APP_URL` — everything else (cursor, recording lifecycle, pacing) is the shared engine that stays the same across all projects.

All story scripts import from this module to avoid boilerplate. It provides:
- `PACE` constants, `sleep` helper
- `injectCursor(page)` — adds a visible cursor dot to the page (see `references/playwright-video-patterns.md` for details)
- `record(storyName, setupFn, storyFn)` — the main recording lifecycle

**Two-phase script structure**: Every story script has a **setup phase** (fast, no pacing — navigates to the starting state) and a **story phase** (paced, watchable — the actual demo). The setup phase runs immediately after page load with no sleeps, so it appears as a brief flash at the start of the video rather than a slow, boring navigation sequence. The visible cursor is injected between the two phases.

Each story script should be concise, delegating boilerplate to `shared.js`. See `references/example-story-script.md` for a real example.

```javascript
const { record, PACE, sleep } = require('../shared');

record('NN-story-name',
  // SETUP PHASE — navigate to starting state (fast, no pacing)
  async (page) => {
    await page.locator('button:has-text("Section")').first().click();
    await page.getByText('Target View').click();
    await page.waitForSelector('.content', { state: 'visible', timeout: 10000 }).catch(() => {});
  },
  // STORY PHASE — the actual demo (paced, watchable)
  async (page) => {
    await sleep(PACE.AFTER_ACTION);

    // Scroll, click, type, hover — with PACE timings
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await sleep(1200);

    // ... more story actions ...
  }
);
```

**Key patterns for story actions** (see `references/playwright-video-patterns.md` for details):

- **Clicking**: `await sleep(PACE.BEFORE_ACTION); await page.click('selector'); await sleep(PACE.AFTER_ACTION);`
- **Typing**: `await page.type('selector', 'text', { delay: PACE.TYPING_DELAY }); await sleep(PACE.AFTER_TYPING);`
- **Navigation**: `await page.goto(url); await sleep(PACE.AFTER_NAVIGATION);`
- **Waiting for elements**: `await page.waitForSelector('selector', { state: 'visible' }); await sleep(PACE.AFTER_MODAL_OPEN);`
- **Scrolling**: `await page.evaluate(() => window.scrollBy(0, 400)); await sleep(PACE.AFTER_ACTION);`
- **Hovering**: `await page.hover('selector'); await sleep(PACE.BEFORE_ACTION);`

**Selector strategy** (in priority order):
1. `data-testid` attributes if they exist
2. Accessible roles: `page.getByRole('button', { name: 'Submit' })`
3. Text content: `page.getByText('Add Repository')`
4. CSS selectors as last resort

**Copy `scripts/record-all.js`** into the project's `scripts/demo-videos/record-all.js`. No customization needed — it discovers and runs all story scripts in `stories/` sequentially.

### Step 4: Record

Execute the recording pipeline:

1. **Check auth**: If auth is needed and `.auth-state.json` doesn't exist or is stale (>24h), run `setup-auth.js` first.
2. **Run `record-all.js`**:
   ```bash
   node scripts/demo-videos/record-all.js
   ```
3. **Verify results**: Check that `.webm` files exist in `scripts/demo-videos/output/`. Report file sizes and any failures.
4. **Troubleshooting**: If a script fails:
   - Check selector accuracy (elements may have changed)
   - Increase wait times for slow-loading content
   - Run the individual script with `DEBUG=pw:api` for verbose logs
   - Offer to fix and re-run the failing script

## Customization

Users can modify behavior by:
- Setting `APP_URL` environment variable to point to a different server
- Editing individual story scripts to adjust actions or pacing
- Adding/removing story scripts and updating `record-all.js`

## Output

```
scripts/demo-videos/
  shared.js               # Recording engine (cursor, pacing, lifecycle)
  setup-auth.js           # Manual login helper
  .auth-state.json        # Saved session (gitignored)
  record-all.js           # Orchestrator
  stories/
    01-story-name.js      # Individual story scripts
    02-story-name.js
    ...
  output/
    01-story-name.webm    # Recorded demo videos
    02-story-name.webm
    ...
```
