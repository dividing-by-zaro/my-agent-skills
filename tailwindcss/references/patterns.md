# Tailwind CSS v4 Patterns

Detailed implementation patterns for Tailwind CSS v4 in Atlas applications.

## Tailwind v4 CSS Configuration

### Global CSS Setup

```css
/* src/styles/global.css */
@layer theme, base, clerk, components, utilities;

@import "tailwindcss";

@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Design tokens defined here */
}

:root {
  /* Light theme variables */
}

.dark {
  /* Dark theme variables */
}

@layer base {
  /* Base styles */
}

@layer components {
  /* Component classes */
}

@layer utilities {
  /* Custom utility classes */
}
```

### Design Tokens and Theme

**Semantic Spacing Scale (8px Grid)**:

```css
@theme inline {
  /* Micro adjustments */
  --space-3xs: 0.125rem; /* 2px */
  --space-2xs: 0.25rem; /* 4px */

  /* Standard grid */
  --space-xs: 0.5rem; /* 8px - base grid unit */
  --space-sm: 0.75rem; /* 12px - small components */
  --space-md: 1rem; /* 16px - component sections */
  --space-lg: 1.5rem; /* 24px - component groups */
  --space-xl: 2rem; /* 32px - layout sections */
  --space-2xl: 3rem; /* 48px - page sections */
  --space-3xl: 4rem; /* 64px - major sections */
  --space-4xl: 6rem; /* 96px - hero sections */

  /* Map Tailwind spacing to 8px grid */
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-0\.5: var(--space-3xs); /* 2px */
  --spacing-1: var(--space-2xs); /* 4px */
  --spacing-2: var(--space-xs); /* 8px - base grid */
  --spacing-3: var(--space-sm); /* 12px */
  --spacing-4: var(--space-md); /* 16px */
  --spacing-6: var(--space-lg); /* 24px */
  --spacing-8: var(--space-xl); /* 32px */
  --spacing-12: var(--space-2xl); /* 48px */
  --spacing-16: var(--space-3xl); /* 64px */
  --spacing-24: var(--space-4xl); /* 96px */
}
```

**Border Radius System**:

```css
@theme inline {
  --radius-sm: 0.125rem; /* 2px - badges, small elements */
  --radius-md: 0.375rem; /* 6px - buttons, inputs */
  --radius-lg: 0.5rem; /* 8px - cards, containers (default) */
  --radius-xl: 0.75rem; /* 12px - major layout elements */
  --radius-2xl: 1rem; /* 16px - modal overlays */

  --radius: var(--radius-lg); /* Default radius */
}
```

**Color System**:

```css
@theme inline {
  /* Semantic color tokens (map to CSS variables) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  /* Light theme - Coolors palette */
  --background: #fefae0; /* cream */
  --foreground: #283618; /* deep green - 7.2:1 contrast (WCAG AAA) */

  --card: #fffcf0;
  --card-foreground: #283618;

  --primary: #283618;
  --primary-foreground: #fefae0;

  --secondary: #606c38;
  --secondary-foreground: #fefae0;

  --muted: #efe9d2;
  --muted-foreground: #283618;

  --accent: #dda15e; /* sand */
  --accent-foreground: #283618;

  --destructive: #bc6c25; /* burnt orange */
  --destructive-foreground: #fefae0;

  --border: #e6dec2;
  --input: #e6dec2;
  --ring: #606c38;
}

.dark {
  /* Dark theme - inverted palette */
  --background: #283618;
  --foreground: #fefae0;

  --card: #324121;
  --card-foreground: #fefae0;

  --primary: #dda15e;
  --primary-foreground: #283618;

  --secondary: #606c38;
  --secondary-foreground: #fefae0;

  --muted: #2e3c1b;
  --muted-foreground: #ede6cf;

  --accent: #bc6c25;
  --accent-foreground: #fefae0;

  --destructive: #bc6c25;
  --destructive-foreground: #fefae0;

  --border: #3e4d23;
  --input: #3e4d23;
  --ring: #dda15e;
}
```

**Typography**:

```css
@theme inline {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;

  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}
```

## Layout Patterns

### Flexbox Layouts

**Horizontal centering**:

```tsx
<div className="flex items-center justify-center">
  <Content />
</div>
```

**Vertical stack**:

```tsx
<div className="flex flex-col gap-4">
  <Item1 />
  <Item2 />
  <Item3 />
</div>
```

**Space between**:

```tsx
<div className="flex items-center justify-between">
  <Left />
  <Right />
</div>
```

**Responsive wrapping**:

```tsx
<div className="flex flex-wrap gap-4">
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>
```

**Centered content with max width**:

```tsx
<div className="flex flex-col items-center justify-center min-h-screen p-6">
  <div className="w-full max-w-md space-y-4">
    <Content />
  </div>
</div>
```

### Grid Layouts

**Responsive columns**:

```tsx
{
  /* 1 col mobile, 2 tablet, 3 desktop, 4 wide */
}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>;
```

**Sidebar layout**:

```tsx
{
  /* Single column mobile, 2:1 ratio desktop */
}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
  <main>Main content</main>
  <aside>Sidebar</aside>
</div>;
```

**Equal height rows**:

```tsx
<div className="grid auto-rows-fr gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

**Dashboard grid**:

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Container Patterns

**Constrained width**:

```tsx
<div className="container mx-auto max-w-5xl px-6 py-8">
  <Content />
</div>
```

**Full width sections with constrained content**:

```tsx
<section className="w-full bg-muted">
  <div className="container mx-auto max-w-7xl px-6 py-12">
    <Content />
  </div>
</section>
```

## Responsive Utilities and Breakpoints

### Breakpoint System

```
mobile-first → sm (640px) → md (768px) → lg (1024px) → xl (1280px) → 2xl (1536px)
```

**Usage**:

```tsx
{/* Base styles apply to mobile, add larger breakpoints */}
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
```

### Visibility Control

**Desktop only**:

```tsx
<div className="hidden lg:block">Desktop sidebar</div>
```

**Mobile only**:

```tsx
<div className="block lg:hidden">Mobile menu</div>
```

**Tablet and up**:

```tsx
<div className="hidden md:flex">Navigation</div>
```

### Responsive Spacing

```tsx
{/* Mobile: 4px gap, Desktop: 8px gap */}
<div className="flex gap-1 lg:gap-2">

{/* Mobile: 16px padding, Desktop: 32px padding */}
<div className="p-4 lg:p-8">
```

### Responsive Typography

**Headings**:

```tsx
<h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
<h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
<h3 className="text-lg font-medium sm:text-xl">
```

**Body text**:

```tsx
<p className="text-sm sm:text-base lg:text-lg">
```

### Responsive Layout Shifts

**Stack on mobile, row on desktop**:

```tsx
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

**Form fields**:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <FormField label="First Name" />
  <FormField label="Last Name" />
</div>
```

## Typography Scale

### Heading Hierarchy

```tsx
{/* Hero */}
<h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">

{/* Page title */}
<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">

{/* Section title */}
<h2 className="text-xl font-semibold">

{/* Subsection */}
<h3 className="text-lg font-medium">

{/* Card title */}
<h4 className="text-base font-semibold">
```

### Body Text

```tsx
{/* Standard body */}
<p className="text-base text-foreground">

{/* Small body (captions, labels) */}
<p className="text-sm text-muted-foreground">

{/* Extra small (metadata, timestamps) */}
<p className="text-xs text-muted-foreground">
```

### Font Weights

```tsx
<span className="font-normal">   {/* 400 */}
<span className="font-medium">   {/* 500 */}
<span className="font-semibold"> {/* 600 */}
<span className="font-bold">     {/* 700 */}
```

### Letter Spacing

```tsx
<h1 className="tracking-tight">    {/* Headings */}
<p className="tracking-normal">     {/* Body */}
<span className="tracking-wide">    {/* Uppercase labels */}
```

## Color System

### Semantic Colors

**Backgrounds**:

```tsx
<div className="bg-background">        {/* Page background */}
<div className="bg-card">              {/* Card surface */}
<div className="bg-popover">           {/* Popover/dropdown */}
<div className="bg-muted">             {/* Subdued sections */}
```

**Text colors**:

```tsx
<span className="text-foreground">            {/* Primary text */}
<span className="text-muted-foreground">      {/* Secondary text */}
<span className="text-card-foreground">       {/* Text on cards */}
<span className="text-primary">               {/* Brand text */}
<span className="text-destructive">           {/* Error text */}
```

**Interactive elements**:

```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
```

### Opacity Modifiers

```tsx
<div className="bg-primary/10">     {/* 10% opacity */}
<div className="bg-primary/50">     {/* 50% opacity */}
<div className="bg-primary/90">     {/* 90% opacity */}

<span className="text-foreground/70">  {/* 70% text opacity */}
```

### Borders

```tsx
<div className="border border-border">
<div className="border-t border-border">
<div className="border-b-2 border-primary">
```

## Spacing and Sizing

### Spacing Scale (8px Grid)

```tsx
{/* gap, padding, margin all use same scale */}

{/* Micro spacing */}
gap-0.5   {/* 2px */}
gap-1     {/* 4px */}

{/* Standard grid */}
gap-2     {/* 8px - base unit */}
gap-3     {/* 12px */}
gap-4     {/* 16px */}
gap-6     {/* 24px */}
gap-8     {/* 32px */}

{/* Layout sections */}
gap-12    {/* 48px */}
gap-16    {/* 64px */}
gap-24    {/* 96px */}
```

### Component Spacing

**Stack (vertical)**:

```tsx
<div className="space-y-2">   {/* 8px between children */}
<div className="space-y-4">   {/* 16px between children */}
<div className="space-y-6">   {/* 24px between children */}
```

**Inline (horizontal)**:

```tsx
<div className="space-x-2">   {/* 8px between children */}
<div className="flex gap-4">  {/* 16px gap (flex preferred) */}
```

### Padding

```tsx
{/* Uniform padding */}
<div className="p-4">           {/* 16px all sides */}
<div className="p-6">           {/* 24px all sides */}

{/* Directional padding */}
<div className="px-4 py-2">     {/* 16px horizontal, 8px vertical */}
<div className="pt-8 pb-4">     {/* 32px top, 16px bottom */}
```

### Width and Height

```tsx
{/* Fixed sizes (touch targets) */}
<button className="h-11">       {/* 44px - mobile minimum */}
<button className="size-11">    {/* 44px × 44px icon button */}

{/* Responsive sizes */}
<div className="h-11 sm:h-9">   {/* 44px mobile, 36px desktop */}

{/* Percentage widths */}
<div className="w-full">
<div className="w-1/2">
<div className="w-1/3">

{/* Max widths */}
<div className="max-w-md">      {/* 448px */}
<div className="max-w-lg">      {/* 512px */}
<div className="max-w-5xl">     {/* 1024px */}
```

## Custom Utilities

### Focus States

```css
/* global.css @layer components */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2
         focus-visible:ring-ring focus-visible:ring-offset-2
         focus-visible:ring-offset-background;
}

.focus-ring-primary {
  @apply focus-visible:outline-none focus-visible:ring-2
         focus-visible:ring-primary focus-visible:ring-offset-2
         focus-visible:ring-offset-background;
}

.focus-ring-destructive {
  @apply focus-visible:outline-none focus-visible:ring-2
         focus-visible:ring-destructive/50 focus-visible:ring-offset-2
         focus-visible:ring-offset-background;
}
```

**Usage**:

```tsx
<button className="focus-ring">
<input className="focus-ring-primary">
<Button variant="destructive" className="focus-ring-destructive">
```

### Separators

```css
/* global.css @layer utilities */
.separator-dotted {
  height: 1px;
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: var(--space-2xs) var(--space-2xs);
  background-repeat: repeat-x;
}

.separator-dashed {
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    var(--border) 0,
    var(--border) var(--space-2xs),
    transparent var(--space-2xs),
    transparent var(--space-xs)
  );
}
```

**Usage**:

```tsx
<CardHeader>...</CardHeader>
<div className="separator-dotted mx-6" />
<CardContent>...</CardContent>
<div className="separator-dashed mx-6" />
<CardFooter>...</CardFooter>
```

### Skip Link

```css
/* global.css @layer components */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
         focus:z-50 focus:px-4 focus:py-2 focus:bg-primary
         focus:text-primary-foreground focus:rounded-md focus:shadow-lg;
}
```

**Usage**:

```tsx
<a className="skip-link" href="#main-content">
  Skip to main content
</a>
```

### Text Contrast Utilities

```css
/* global.css @layer utilities */
.text-high-contrast {
  @apply text-foreground;
}

.text-medium-contrast {
  @apply text-muted-foreground opacity-90;
}
```

## Dark Mode Patterns

### Custom Variant

```css
/* global.css */
@custom-variant dark (&:is(.dark *));
```

### Theme Switching

**Provider** (uses next-themes):

```tsx
import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

**Toggle button**:

```tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### Dark Mode Styles

```tsx
{/* Automatic via semantic tokens */}
<div className="bg-background text-foreground">

{/* Explicit dark mode */}
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

{/* Borders in dark mode */}
<div className="border-gray-200 dark:border-gray-700">
```

## Accessibility Patterns

### Reduced Motion

```css
/* global.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### High Contrast Mode

```css
/* global.css */
@media (prefers-contrast: high) {
  :root {
    --border: oklch(0.5 0 0);
    --ring: oklch(0.8 0 0);
  }

  .dark {
    --border: oklch(0.7 0 0);
    --ring: oklch(0.9 0 0);
  }
}
```

### Print Styles

```css
/* global.css */
@media print {
  .no-print {
    display: none !important;
  }

  a[href]:after {
    content: " (" attr(href) ")";
  }

  abbr[title]:after {
    content: " (" attr(title) ")";
  }
}
```

### Focus Management

```tsx
{/* Visible keyboard focus */}
<button className="focus-visible:ring-2 focus-visible:ring-ring">

{/* Focus within container */}
<div className="focus-within:ring-2 focus-within:ring-ring">
  <input />
</div>

{/* Custom focus color */}
<input className="focus:border-primary focus:ring-2 focus:ring-primary/20">
```

## Resources

- Atlas global.css: `/Users/josechifflet-mbp/Repos/atlas/src/styles/global.css`
- Tailwind v4 docs: https://tailwindcss.com/docs
- Color contrast checker: https://webaim.org/resources/contrastchecker/
