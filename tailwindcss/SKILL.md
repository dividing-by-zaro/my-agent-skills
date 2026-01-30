---
name: tailwindcss
description: Tailwind CSS v4 patterns for styling Next.js applications. This skill should be used when styling components, creating responsive layouts, implementing design systems, or working with custom utilities. Covers v4-specific CSS-first configuration with @theme/@import/@utility directives, design tokens, responsive patterns, mobile-first design, and Atlas-specific conventions including 8px grid spacing system and accessibility patterns.
---

# Tailwind CSS v4

## Purpose

Provide comprehensive Tailwind CSS v4 styling patterns for Next.js applications using the modern CSS-first configuration approach. Emphasize utility-first design, mobile-first responsive patterns, 8px grid alignment, and accessibility-first principles aligned with Atlas design system.

## When To Use This Skill

**Component Styling:**
- Apply Tailwind utility classes to new components
- Create responsive layouts using flexbox and grid
- Implement spacing using 8px grid system
- Style interactive states (hover, focus, active, disabled)

**Design System Implementation:**
- Define custom design tokens using @theme directives
- Configure color palettes with semantic names
- Set up typography scales and font families
- Create custom utilities with @utility directive
- Implement dark mode support

**Responsive Design:**
- Build mobile-first responsive patterns
- Apply breakpoint-specific utilities (sm:, md:, lg:, xl:)
- Create adaptive layouts that work across devices
- Ensure 44px minimum touch targets for mobile (WCAG AAA)

**Accessibility:**
- Add proper focus states with focus-visible
- Ensure sufficient color contrast ratios
- Hide decorative elements from screen readers (sr-only)
- Implement keyboard-navigable interfaces

**Migration & Troubleshooting:**
- Convert Tailwind v3 syntax to v4 CSS-first approach
- Debug configuration issues with @theme and @import
- Resolve spacing inconsistencies
- Fix accessibility violations (missing focus rings, low contrast)

## Overview

Tailwind CSS v4 introduces a CSS-first configuration approach that moves theme customization from JavaScript config files into CSS using `@theme`, `@import`, and `@utility` directives. This skill emphasizes:

1. **Utility-First Design**: Compose UI from small, single-purpose classes
2. **Mobile-First Responsive**: Start with base styles, add breakpoint variants
3. **Design System Alignment**: Use semantic tokens and 8px grid system
4. **Accessibility First**: Focus states, contrast, screen reader support
5. **V4 Modern Syntax**: CSS-first configuration, custom utilities

## Core Principles

**Utility-First Composition**:

```tsx
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
```

**Mobile-First Progressive**:

```tsx
<div className="text-sm sm:text-base lg:text-lg">
```

**Semantic Token Usage**:

```tsx
<div className="bg-background text-foreground p-4 rounded-lg">
```

**Design System Alignment**:

```tsx
<div className="space-y-4 p-lg">  {/* 8px grid spacing */}
```

## Quick Reference - Common Patterns

### Layout

**Flexbox**:

```tsx
// Row with centered items
<div className="flex items-center gap-4">

// Column layout
<div className="flex flex-col items-start gap-2">

// Center content
<div className="flex items-center justify-center min-h-screen">

// Space between
<div className="flex items-center justify-between">

// Responsive wrap
<div className="flex flex-wrap gap-4">
```

**Grid**:

```tsx
// Responsive columns
<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

// Sidebar layout
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">

// Equal height
<div className="grid auto-rows-fr gap-4">
```

### Spacing (8px Grid)

```tsx
// Micro spacing
<div className="gap-0.5">        {/* 2px */}
<div className="gap-1">          {/* 4px */}

// Standard grid (8px base)
<div className="gap-2">          {/* 8px */}
<div className="gap-3">          {/* 12px */}
<div className="gap-4">          {/* 16px */}
<div className="gap-6">          {/* 24px */}
<div className="gap-8">          {/* 32px */}

// Layout sections
<div className="gap-12">         {/* 48px */}
<div className="gap-16">         {/* 64px */}
```

### Typography

```tsx
// Headings (responsive)
<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
<h2 className="text-xl font-semibold">
<h3 className="text-lg font-medium">

// Body text
<p className="text-sm sm:text-base text-muted-foreground">

// Labels
<label className="text-sm font-medium">
```

### Colors

```tsx
// Semantic tokens
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-muted text-muted-foreground">

// Opacity modifiers
<div className="bg-primary/50 text-foreground/80">

// Hover states
<button className="hover:bg-primary/90">
```

### Borders & Radius

```tsx
// Borders
<div className="border border-border">
<div className="border-t border-b">

// Radius (pixel-perfect)
<div className="rounded-sm">    {/* 2px - badges */}
<div className="rounded-md">    {/* 6px - buttons/inputs */}
<div className="rounded-lg">    {/* 8px - cards (default) */}
<div className="rounded-xl">    {/* 12px - major elements */}
<div className="rounded-2xl">   {/* 16px - modals */}
```

## Responsive Design

### Breakpoints

```tsx
// Mobile first progression
<div className="text-sm sm:text-base md:text-lg lg:text-xl">

// Show/hide at breakpoints
<div className="hidden lg:block">     {/* Desktop only */}
<div className="block lg:hidden">     {/* Mobile only */}

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**Breakpoint values**:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Touch Targets (Mobile)

Minimum 44px for accessibility:

```tsx
<Button size="default">    {/* h-11 mobile (44px), h-9 desktop */}
<Button size="icon">       {/* size-11 (44px minimum) */}
```

## V4 Specific Features

### CSS-First Configuration

**Import Tailwind**:

```css
/* global.css */
@import "tailwindcss";
```

**Define Theme**:

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-sans: Inter, system-ui, sans-serif;
  --spacing-custom: 18rem;
}
```

**Custom Utilities**:

```css
@utility container-padding {
  padding-inline: 2rem;

  @media (min-width: 768px) {
    padding-inline: 4rem;
  }
}
```

### Migration from V3

**Directives change**:

```css
/* Old (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* New (v4) */
@import "tailwindcss";
```

**Theme moves to CSS**:

```js
// Old (v3) - tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { primary: '#3b82f6' }
    }
  }
}

// New (v4) - global.css
@theme {
  --color-primary: #3b82f6;
}
```

## Accessibility

### Focus States

```tsx
// Standard focus ring
<button className="focus-visible:ring-2 focus-visible:ring-ring">

// Atlas reusable classes
<button className="focus-ring">
<button className="focus-ring-primary">
```

### Color Contrast

```tsx
// High contrast (WCAG AA)
<div className="bg-background text-foreground">

// Medium contrast (readable)
<p className="text-muted-foreground">
```

### Screen Readers

```tsx
// Hidden from visual, available to screen readers
<span className="sr-only">Hidden label</span>

// Icon buttons need labels
<Button size="icon" aria-label="Delete item">
  <Trash className="h-4 w-4" />
</Button>

// Skip links
<a className="skip-link" href="#main">Skip to content</a>
```

## Common Component Patterns

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">Content</CardContent>
</Card>
```

### Forms

```tsx
<form className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <FormField label="First Name">
      <Input />
    </FormField>
    <FormField label="Last Name">
      <Input />
    </FormField>
  </div>

  <div className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

### Buttons

```tsx
// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Icon button (needs aria-label)
<Button size="icon" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>
```

## Dark Mode

### Configuration

```css
/* global.css */
@custom-variant dark (&:is(.dark *));

:root {
  --background: #ffffff;
  --foreground: #000000;
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
}
```

### Usage

```tsx
// Automatic dark mode
<div className="bg-background text-foreground">

// Explicit override
<div className="bg-white dark:bg-gray-900">
```

## Common Mistakes

**Using v3 syntax**:

```css
/* Wrong */
@tailwind base;

/* Right */
@import "tailwindcss";
```

**Off-grid spacing**:

```tsx
{/* Wrong - 4px off-grid */}
<div className="gap-1">

{/* Right - 8px on-grid */}
<div className="gap-2">
```

**Missing focus states**:

```tsx
{/* Wrong */}
<button className="p-4">

{/* Right */}
<button className="p-4 focus-visible:ring-2">
```

**Icon buttons without labels**:

```tsx
{
  /* Wrong - inaccessible */
}
<Button size="icon">
  <Trash />
</Button>;

{
  /* Right - accessible */
}
<Button size="icon" aria-label="Delete">
  <Trash />
</Button>;
```

**Not mobile-first**:

```tsx
{/* Wrong - desktop-first */}
<div className="lg:text-lg text-sm">

{/* Right - mobile-first */}
<div className="text-sm lg:text-lg">
```

## Resources

### Reference Files

- `references/patterns.md` - Detailed implementation patterns
- `references/recipes.md` - Common use case solutions
- `references/examples.md` - Complete working examples

### Atlas Documentation

- `src/styles/global.css` - Main stylesheet with @theme definitions
- `framework/patterns/styling.md` - Styling patterns
- `framework/patterns/shadcn.md` - Component integration
- `src/components/ui/button.tsx` - Button variants example

### External Resources

- **Tailwind v4 docs**: https://tailwindcss.com/docs
- **CSS-first config**: https://tailwindcss.com/docs/v4-beta
- **Migration guide**: https://tailwindcss.com/docs/upgrade-guide

## Next Steps

1. **Review patterns**: Read `references/patterns.md` for detailed implementations
2. **Study recipes**: Check `references/recipes.md` for specific use cases
3. **See examples**: Review `references/examples.md` for complete implementations
4. **Practice**: Build components using these patterns
5. **Validate**: Run `pnpm lint` to ensure code quality

## Quick Implementation Guide

**New component checklist**:

1. Start with semantic layout (flex/grid)
2. Apply 8px grid spacing
3. Use semantic color tokens
4. Add responsive breakpoints
5. Include focus states
6. Test keyboard navigation
7. Verify color contrast
8. Add dark mode support
