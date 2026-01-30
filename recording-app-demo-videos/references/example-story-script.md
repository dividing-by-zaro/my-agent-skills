# Example Story Script

Real example from the GitHub Curator project — an "Ask Feed" story that navigates to a repo, types a specific question, submits it, and watches a streaming AI answer with cited updates.

This demonstrates all the key patterns: fast setup, paced typing, waiting for async results, scrolling within a modal, and cleanup.

```javascript
const { record, PACE, sleep } = require('../shared');

record('04-ask-feed',
  // SETUP — navigate to the target repo (fast, no pacing)
  // This appears as a brief flash at the start of the video.
  async (page) => {
    // Expand sidebar section and click into a specific repo
    await page.locator('button:has-text("Repos")').first().click();
    await page.locator('li button span').filter({ hasText: /claude/i }).first().click();
    // Wait for the key element the story needs
    await page.waitForSelector('input[placeholder*="Ask about"]', {
      state: 'visible',
      timeout: 10000,
    }).catch(() => {});
  },
  // STORY — the paced, watchable demo
  async (page) => {
    await sleep(PACE.AFTER_ACTION);

    // Click the search/ask input — this reveals time preset chips
    const askInput = page.locator('input[placeholder*="Ask about"]');
    await sleep(PACE.BEFORE_ACTION);
    await askInput.click();
    await sleep(PACE.AFTER_ACTION);

    // Select a time range preset
    await sleep(PACE.BEFORE_ACTION);
    await page.getByText('All time', { exact: true }).click();
    await sleep(PACE.AFTER_ACTION);

    // Type a SPECIFIC, compelling question — not generic filler
    await askInput.type('When were agent skills first introduced?', {
      delay: PACE.TYPING_DELAY,
    });
    await sleep(PACE.AFTER_TYPING);

    // Submit the question
    await sleep(PACE.BEFORE_ACTION);
    await page.getByRole('button', { name: 'Ask' }).click();
    await sleep(PACE.AFTER_MODAL_OPEN);

    // Wait for the response modal to appear
    try {
      await page.waitForSelector('[class*="fixed inset-0"]', {
        state: 'visible',
        timeout: 10000,
      });
    } catch {}

    // Let the streaming answer build up — this is the payoff
    await sleep(8000);

    // Scroll down within the modal to show cited sources
    const modalContent = page.locator('[class*="overflow-y-auto"]').first();
    try {
      await modalContent.evaluate((el) => el.scrollBy({ top: 300, behavior: 'smooth' }));
      await sleep(1200);
      await modalContent.evaluate((el) => el.scrollBy({ top: 300, behavior: 'smooth' }));
      await sleep(1200);
      await modalContent.evaluate((el) => el.scrollBy({ top: 300, behavior: 'smooth' }));
      await sleep(1200);
    } catch {}

    // Close the modal
    await page.keyboard.press('Escape');
  }
);
```

## Patterns to notice

**Setup phase (fast):**
- No `sleep()` calls — clicks happen immediately
- Navigates through sidebar to a specific repo view
- Waits for the key element (`input[placeholder*="Ask about"]`) before proceeding
- Uses `.catch(() => {})` on waits so failures don't crash the script

**Story phase (paced):**
- `PACE.BEFORE_ACTION` before every click — gives viewer time to see the cursor
- `PACE.TYPING_DELAY` for realistic typing — 80ms per character looks human
- Long `sleep(8000)` after submitting — holds on the streaming answer, the most impressive part
- Smooth scrolling within the modal — `behavior: 'smooth'` looks natural
- `try/catch` around optional interactions — script continues even if modal structure varies

**Selector strategy:**
- `locator('button:has-text("Repos")')` — text-based for buttons
- `.filter({ hasText: /claude/i })` — regex for fuzzy matching sidebar items
- `input[placeholder*="Ask about"]` — CSS attribute selector for inputs
- `getByRole('button', { name: 'Ask' })` — accessible role for the submit button
- `[class*="fixed inset-0"]` — CSS class pattern for modal overlay (last resort)

**Specific over generic:**
- The question is "When were agent skills first introduced?" — not "What changed recently?"
- The time range is "All time" — the most interesting range for a historical question
- The repo is navigated to by name — not "the first repo in the list"
