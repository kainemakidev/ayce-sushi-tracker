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
- `/` — home, restaurant list with per-restaurant visit history, recent meals
- `/restaurant/[id]` — meal setup (pricing tier, cash/card, group/names). Has `loading.tsx` skeleton.
- `/tracker` — live meal tracking with per-diner tabs, sort modes, discard flow
- `/summary` — post-meal stats with Last Meal / All Time toggle, achievements, bill split
- `/history` — past meals with delete confirmations
- `/meal/[id]` — meal detail/recap page, linked from history cards
- `/profile` — lifetime stats, personal records, all-time achievements, settings gear → bottom sheet

### Auth layer (Firebase)
`src/context/AuthContext.tsx` wraps Firebase auth state (`onAuthStateChanged`) and exposes `user`, `loading`, `signInWithGoogle`, `signOut`. `src/components/auth/AuthGuard.tsx` gates the entire app — shows `LoginScreen` when unauthenticated, syncs Firestore on login, clears local store on logout.

**Firebase lazy initialization** — `src/lib/firebase.ts` exports getter functions (`getAuth()`, `getDb()`) instead of module-level constants. This prevents `initializeApp` from running during Next.js static prerendering. Never call Firebase APIs at module evaluation time.

### State management (Zustand + localStorage)
Three persisted stores in `src/store/`:
- **`mealStore`** — active meal state: restaurant, price, diners, items ordered. Cleared via `clearMeal()` on Finish or Discard.
- **`historyStore`** — completed meals array, prepended on save. Has `setMeals()` for Firestore initial load.
- **`menuOverrideStore`** — two override maps persisted across sessions:
  - `ayceQtyOverrides: Record<itemId, number>` — user-set piece counts per AYCE order
  - `priceOverrides: Record<itemId, number>` — user-set prices for "Price TBD" items (price = 0 in menu.json)

All stores use `persist` middleware with `localStorage`.

### Firestore sync (`src/hooks/useMeals.ts`)
`useMeals()` is the canonical hook for reading/writing meal history — use it everywhere instead of `useHistoryStore` directly. It wraps `historyStore` and mirrors every mutation to `users/{userId}/meals/{mealId}` in Firestore when a user is signed in. `src/lib/firestoreService.ts` contains the CRUD functions; each calls `getDb()` internally (never at module level).

### Data flow for a meal
1. Home → tap restaurant → `/restaurant/[id]`
2. Setup page calls `startMeal(restaurantId, price, label, cashPayment, diners[])` — pre-populates diners and auto-enables party mode when `diners.length > 1`
3. Tracker reads from `mealStore`; `selectedDinerId` controls which diner items are attributed to
4. "Finish Meal" → `calculateMealStats()` → `saveMeal()` (via `useMeals`) → `clearMeal()` → navigate to `/summary`
5. "Discard Meal" → `clearMeal()` → navigate to `/`
6. Summary falls back to `meals[0]` from historyStore (since active meal is cleared before navigation)

### Menu data (`src/data/`)
- **`menu.json`** — flat array of all items. Codes: `A1-A36` (Appetizer), `D1-D3` (Dim Sum), `S1-S7` (Soup), `SA1-SA10` (Salad), `R1-R62`/`SR1-SR7` (Maki Roll), `HR1-HR32` (Hand Roll), `T1-T5`/`TR1-TR5` (Torched Sushi), `N1-N25` (Sushi), `SAsh1-SAsh14` (Sashimi), `SP1-SP4` (Sushi Pizza). Items with `price: 0` are "Price TBD" — the user is prompted to enter a price on first add.
- **`restaurants.ts`** — `RESTAURANTS` array, `getDefaultTier()` (auto-detects lunch 11AM–3PM / dinner 3PM–10PM, weekday Mon–Thu / weekend Fri–Sun), `getSessionInfo()`, `ALL_CATEGORIES`, `CATEGORY_COLORS`.

### Value calculation (`src/lib/calculations.ts`)
`calculateMealStats(items, menu, aycePrice, ayceQtyOverrides?, priceOverrides?)` is the core function. Key logic:
- Items with `price = 0` use `priceOverrides[item.id]` as the effective price
- Items with both `aLaCarteQty` and `ayceQty` get proportional value: `effectivePrice × (ayceQty / aLaCarteQty)`
- `parseALaCarteQty(name)` auto-parses piece counts from names like "Beef Gyoza (6 pcs)"
- `getEffectivePortionInfo(item, ayceQtyOverrides)` returns `{ effectiveAyceQty, portionRatio }` — exported for use in `MenuItemCard` and `LiveStatsBar`
- `getValueLevel(multiplier)` returns `{ label, color, shimmer? }` for the 5-band color scheme: red (<1×), orange (1–1.5×), yellow (1.5–2×), green (2–2.5×), gold/shimmer (2.5×+). Use this function everywhere a multiplier is colored — do not hardcode multiplier colors.

Both `LiveStatsBar` and the tracker's finish-confirm drawer call `calculateMealStats` with all five parameters (including `priceOverrides` from `menuOverrideStore`).

### Dark mode
Class-based via `@custom-variant dark` in `globals.css`. `ThemeProvider` (`src/components/shared/ThemeProvider.tsx`) syncs `localStorage` → `document.documentElement.classList`. An inline `<script>` in `layout.tsx` applies the class before React hydrates to prevent flash. Toggle is in the Profile page settings sheet.

### Styling
Tailwind v4 (`@import "tailwindcss"` in `globals.css`). Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes. All dark mode variants are `dark:*` utility classes.

### Bill split (`src/components/summary/BillSplit.tsx`)
Reads from `meals[0]` in historyStore (not the active meal store). Tip presets (0/15/18/20%) plus a "%" custom input mode. Formula: `subtotal = aycePrice × groupSize`, `total = subtotal × (1 + tipRate)`, `perPerson = total / groupSize`. The cash discount is already baked into `aycePrice`.
