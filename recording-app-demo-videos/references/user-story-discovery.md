# User Story Discovery Methodology

A systematic approach for analyzing any web app codebase to identify its core user stories for demo video recording.

## Phase 1: Understand the App

### 1.1 Read Project Documentation

Check these files in order (stop when you have enough context):
- `CLAUDE.md` — project-specific instructions, often the richest source
- `README.md` — overview, features list, architecture
- `CONTRIBUTING.md` — may describe key features
- `docs/` directory — deeper feature documentation

Extract:
- What the app does (one sentence)
- Who the target users are
- What the primary value proposition is

### 1.2 Identify the Frontend Framework

Read `package.json` (or the project root) to determine:

| Framework | Indicators |
|-----------|-----------|
| React (Vite) | `vite`, `react`, `react-dom` in dependencies |
| React (CRA) | `react-scripts` in dependencies |
| Next.js | `next` in dependencies, `pages/` or `app/` directory |
| Vue | `vue` in dependencies |
| Svelte/SvelteKit | `svelte` or `@sveltejs/kit` in dependencies |
| Angular | `@angular/core` in dependencies |
| Astro | `astro` in dependencies |

This determines where to look for routing, components, and entry points.

### 1.3 Find the Entry Point

| Framework | Entry point |
|-----------|------------|
| React (Vite) | `src/main.tsx` → `src/App.tsx` |
| React (CRA) | `src/index.tsx` → `src/App.tsx` |
| Next.js (App Router) | `app/layout.tsx` → `app/page.tsx` |
| Next.js (Pages Router) | `pages/_app.tsx` → `pages/index.tsx` |
| Vue | `src/main.ts` → `src/App.vue` |
| SvelteKit | `src/routes/+layout.svelte` → `src/routes/+page.svelte` |

Read the entry point to understand the app shell (layout, navigation, auth wrappers).

## Phase 2: Map the App Structure

### 2.1 Trace Routing

Find all navigable pages/views:

**React Router**:
```bash
# Search for route definitions
grep -r "Route\|path:" src/ --include="*.tsx" --include="*.ts"
grep -r "createBrowserRouter\|createRoutesFromElements" src/
```

**Next.js**:
```bash
# List all page files
find app/ -name "page.tsx" -o -name "page.js"
find pages/ -name "*.tsx" -o -name "*.js" | grep -v "_app\|_document\|api/"
```

**View modes** (no router): Some apps use state-based views instead of URL routing. Look for:
- `viewMode` or `currentView` state variables
- Switch/case or conditional rendering in the main component
- Tab or sidebar navigation that doesn't change the URL

Output: A list of all views/pages with their paths or trigger conditions.

### 2.2 Identify Navigation

Find the navigation structure:
- **Sidebar**: Look for `Sidebar`, `Nav`, `SideNav` components
- **Header/Navbar**: Look for `Header`, `Navbar`, `TopBar` components
- **Tab bars**: Look for `Tabs`, `TabBar` components
- **Breadcrumbs**: Look for `Breadcrumb` components

Note which views are accessible from navigation vs. only reachable through actions.

### 2.3 Find Interactive Elements

Search for components that indicate user interactions:

```
# Forms and inputs
grep -r "onSubmit\|handleSubmit\|<form" src/ --include="*.tsx"
grep -r "<input\|<textarea\|<select" src/ --include="*.tsx"

# Modals and dialogs
grep -r "Modal\|Dialog\|Drawer\|Sheet" src/ --include="*.tsx"

# Buttons with handlers
grep -r "onClick\|handleClick" src/ --include="*.tsx"

# State changes
grep -r "useState\|useReducer\|dispatch" src/ --include="*.tsx"
```

### 2.4 Identify Auth Requirements

Check if the app has authentication:
- Look for `AuthContext`, `AuthProvider`, `useAuth`, `ProtectedRoute`
- Check for login/signup pages or components
- Check for session/token handling

If auth exists, the demo videos will need the auth setup step.

## Phase 3: Compose User Stories

### 3.1 Priority Framework

Categorize discovered features into three tiers:

**P0 — Essential Views** (record these first)
- The landing/home page in its default state
- The main content view that users spend most time on
- The primary dashboard or feed

Criteria: Every user sees this. Doesn't require specific actions to reach.

**P1 — Core Flows** (record these next)
- The primary CRUD operations (add, edit, delete)
- Key search or filter functionality
- Form submissions that are the app's core purpose
- Navigation between major sections

Criteria: Most users do this regularly. It's the app's main value.

**P2 — Secondary Interactions** (record if time allows)
- Settings and preferences
- Secondary modals or dialogs
- Advanced filters or sort options
- Edge cases or less common flows
- Profile management

Criteria: Users do this occasionally. Not the primary value but still important.

### 3.2 Story Template

Each story should describe:
- **Number**: Sequential order (01, 02, 03...)
- **Name**: Short descriptive name (kebab-case for filenames)
- **Priority**: P0, P1, or P2
- **Description**: One sentence describing what the user does
- **Starting state**: Where the recording begins (e.g., "app home page", "after clicking Settings")
- **Key actions**: Numbered list of what happens in the video
- **End state**: What the viewer sees at the end

Example:
```
03 - filter-updates (P1)
Description: Apply significance and category filters to narrow the feed
Starting state: Main feed view with multiple updates visible
Key actions:
  1. Click significance filter dropdown
  2. Select "Major" filter
  3. Observe feed updates to show only major items
  4. Click category filter dropdown
  5. Select "Security" category
  6. Observe further filtering
End state: Feed showing only major security updates
```

### 3.3 Ordering Rules

1. P0 stories come first, then P1, then P2
2. Within a priority tier, order by the natural user journey (what a new user would do first)
3. Stories that set up state for later stories should come earlier (e.g., "add repo" before "browse feed")
4. Group related stories together (e.g., all filter stories adjacent)

### 3.4 Story Count Guidelines

- Small app (< 5 views): 3–5 stories
- Medium app (5–15 views): 5–10 stories
- Large app (15+ views): 8–15 stories (cap at the most important flows)

Don't try to cover every feature. Focus on the stories that best demonstrate the app's value.

## Phase 4: User Approval

Before generating any scripts, present the story list to the user and ask:

1. **Are these the right stories?** Any to add or remove?
2. **Is the priority order correct?** Should anything move up or down?
3. **Are the descriptions accurate?** Any details wrong about how the app works?
4. **What data is in the app right now?** Which views have content vs. are empty? Empty views make boring videos. If the default landing page is empty (e.g., an inbox the user already cleared), start videos from a content-rich view instead.
5. **What's most interesting to showcase?** The user knows what's impressive about their app. Generic demos are forgettable — ask what specific content, queries, or flows would make a viewer say "wow." For search/query features, ask the user for a specific compelling question rather than using a generic placeholder.
6. **Auth required?** Confirm whether login is needed for the demos.
7. **App URL?** Confirm the dev server URL (default: `http://localhost:5173`).

Only proceed to script generation after user approval.

### Exploration Over Checklists

Demo videos should feel like someone excitedly exploring an app, not robotically checking off features. For each story:

- **Interact with the content**: Don't just scroll past items — click into them, expand details, hover to reveal hidden UI. Show that the app is alive.
- **Show cause and effect**: When a user action produces a result (indexing starts, a modal streams content, filters narrow the feed), hold the camera on the result long enough for the viewer to appreciate what happened.
- **Finish the flow**: Don't stop at "submit." If adding a repo triggers indexing, navigate to the repo and show the indexing progress. If asking a question produces a streaming answer, wait for the answer to build up and scroll through the citations.
- **Pick specific, compelling examples**: "vercel/next.js" is more interesting than "owner/repo." "When were agent skills first introduced?" is more interesting than "What changed recently?"

## Tips for Different App Types

### CRUD Apps (admin panels, project management)
Focus on: Create flow, list/table view, detail view, edit flow, delete confirmation

### Content/Feed Apps (social media, news readers)
Focus on: Feed browsing, content interaction (like, comment, share), filtering/sorting, content detail view

### Dashboard Apps (analytics, monitoring)
Focus on: Dashboard overview, chart interactions, date range selection, drill-down to details

### E-commerce
Focus on: Product browsing, search, product detail, add to cart, checkout flow

### Auth-heavy Apps (multi-tenant, role-based)
Focus on: Login flow, role-specific views, permission boundaries, settings
