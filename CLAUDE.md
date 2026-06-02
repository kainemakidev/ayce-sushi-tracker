# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Read the Next.js docs first

This project uses **Next.js 16.2.6** with **React 19** — breaking changes from older versions exist. Before writing any Next.js-specific code (layouts, dynamic routes, server components, params handling), read the relevant guide in `node_modules/next/dist/docs/`. Key differences from older Next.js:

- Dynamic route `params` is a **Promise** in client components — unwrap with `use(params)` from React
- React 19's `use()` hook is available for promises and context

## Commands

```bash
npm run dev       # Start dev server (Turbopack, default port 3000)
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # Type-check without emitting (use node_modules\.bin\tsc on Windows)
```

No test suite exists in this project.

## Architecture

### App structure
Next.js App Router (`src/app/`). All pages are client components (`'use client'`). Routes:
- `/` — home, restaurant list, navigate to setup
- `/restaurant/[id]` — meal setup (pricing tier, cash/card, group/names)
- `/tracker` — live meal tracking with per-diner tabs
- `/summary` — post-meal stats, achievements, bill split
- `/history` — past meals

### State management (Zustand + localStorage)
Three persisted stores in `src/store/`:
- **`mealStore`** — active meal state: restaurant, price, diners, items ordered. Cleared via `clearMeal()` when Finish Meal is tapped (before navigating to summary).
- **`historyStore`** — completed meals array, prepended on save.
- **`menuOverrideStore`** — per-item AYCE quantity overrides (`{ [itemId]: number }`), persisted so users only enter once.

All stores use `persist` middleware with `localStorage`.

### Data flow for a meal
1. Home → tap restaurant → `/restaurant/[id]`
2. Setup page calls `startMeal(restaurantId, price, label, cashPayment, diners[])` — pre-populates diners and auto-enables party mode when `diners.length > 1`
3. Tracker reads from `mealStore`; `selectedDinerId` controls which diner items are attributed to
4. "Finish Meal" → `calculateMealStats()` → `saveMeal()` → `clearMeal()` → navigate to `/summary`
5. Summary falls back to `meals[0]` from historyStore (since active meal is cleared)

### Menu data (`src/data/`)
- **`menu.json`** — flat array of all items. Codes: `A1-A36` (Appetizer), `D1-D3` (Dim Sum), `S1-S7` (Soup), `SA1-SA10` (Salad), `R1-R62`/`SR1-SR7` (Maki Roll), `HR1-HR32` (Hand Roll), `T1-T5`/`TR1-TR5` (Torched Sushi), `N1-N25` (Sushi), `SAsh1-SAsh14` (Sashimi), `SP1-SP4` (Sushi Pizza).
- **`restaurants.ts`** — `RESTAURANTS` array, `getDefaultTier()` (auto-detects lunch 11AM–3PM / dinner 3PM–10PM, weekday Mon–Thu / weekend Fri–Sun), `getSessionInfo()`, `ALL_CATEGORIES`, `CATEGORY_COLORS`.

### Value calculation (`src/lib/calculations.ts`)
`calculateMealStats(items, menu, aycePrice, ayceQtyOverrides?)` is the core function. It accepts optional overrides from `menuOverrideStore`. Key logic:
- Items with both `aLaCarteQty` and `ayceQty` (or user override) in `menu.json` get proportional value: `price × (ayceQty / aLaCarteQty)`
- `parseALaCarteQty(name)` auto-parses piece counts from names like "Beef Gyoza (6 pcs)" — so `aLaCarteQty` only needs to be explicit when the name doesn't follow that pattern
- `getEffectivePortionInfo(item, overrides)` is exported for use in `MenuItemCard`

### Dark mode
Class-based via `@custom-variant dark` in `globals.css`. `ThemeProvider` (`src/components/shared/ThemeProvider.tsx`) syncs `localStorage` → `document.documentElement.classList`. An inline `<script>` in `layout.tsx` applies the class before React hydrates to prevent flash. Toggle is in the bottom `Navigation` bar.

### Styling
Tailwind v4 (`@import "tailwindcss"` in `globals.css`). Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes. All dark mode variants are `dark:*` utility classes — the custom variant makes them apply when `<html class="dark">`.

### Bill split (`src/components/summary/BillSplit.tsx`)
Reads from `meals[0]` in historyStore (not the active meal store). Tip selector (0/15/18/20%), one-bill vs split toggle. Formula: `subtotal = aycePrice × groupSize`, `total = subtotal × (1 + tipRate)`, `perPerson = total / groupSize`. The cash discount is already baked into `aycePrice`.
