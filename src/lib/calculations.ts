import type { ConsumptionRecord, MenuItem, MealCalculation, CategoryStat } from '@/types';
import { CATEGORY_COLORS } from '@/data/restaurants';

/** Parses the à la carte piece count from names like "Beef Gyoza (6 pcs)". */
export function parseALaCarteQty(name: string): number | undefined {
  const match = name.match(/\((\d+)\s*pcs?\)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

/** Returns the effective AYCE qty and per-order value for a menu item. */
export function getEffectivePortionInfo(
  item: MenuItem,
  ayceQtyOverrides?: Record<string, number>,
): { effectiveAyceQty: number; parsedALaCarteQty: number | undefined; portionRatio: number } {
  const parsedALaCarteQty = item.aLaCarteQty ?? parseALaCarteQty(item.name);
  const effectiveAyceQty =
    ayceQtyOverrides?.[item.id] ?? item.ayceQty ?? parsedALaCarteQty ?? 1;
  const portionRatio =
    parsedALaCarteQty != null && parsedALaCarteQty > 0
      ? effectiveAyceQty / parsedALaCarteQty
      : 1;
  return { effectiveAyceQty, parsedALaCarteQty, portionRatio };
}

export function calculateMealStats(
  items: ConsumptionRecord[],
  menu: MenuItem[],
  aycePrice: number,
  ayceQtyOverrides?: Record<string, number>,
): MealCalculation {
  const menuMap = new Map(menu.map((m) => [m.id, m]));

  let totalMenuValue = 0;
  let itemCount = 0;
  const categoryTotals: Record<string, { value: number; quantity: number }> = {};
  const itemTotals: Map<string, { item: MenuItem; quantity: number; value: number }> = new Map();

  for (const record of items) {
    const menuItem = menuMap.get(record.itemId);
    if (!menuItem) continue;

    const { portionRatio } = getEffectivePortionInfo(menuItem, ayceQtyOverrides);
    const value = menuItem.price * portionRatio * record.quantity;
    totalMenuValue += value;
    itemCount += record.quantity;

    if (!categoryTotals[menuItem.category]) {
      categoryTotals[menuItem.category] = { value: 0, quantity: 0 };
    }
    categoryTotals[menuItem.category].value += value;
    categoryTotals[menuItem.category].quantity += record.quantity;

    if (!itemTotals.has(menuItem.id)) {
      itemTotals.set(menuItem.id, { item: menuItem, quantity: 0, value: 0 });
    }
    const existing = itemTotals.get(menuItem.id)!;
    existing.quantity += record.quantity;
    existing.value += value;
  }

  const savings = totalMenuValue - aycePrice;
  const valueMultiplier = aycePrice > 0 ? totalMenuValue / aycePrice : 0;
  const breakEvenProgress = Math.min((totalMenuValue / aycePrice) * 100, 100);
  const uniqueItemCount = items.filter((r) => r.quantity > 0).length;

  const categoryStats: CategoryStat[] = Object.entries(categoryTotals).map(
    ([category, stats]) => ({
      category,
      value: stats.value,
      quantity: stats.quantity,
      color: CATEGORY_COLORS[category] || '#6b7280',
      percentage: totalMenuValue > 0 ? (stats.value / totalMenuValue) * 100 : 0,
    }),
  );
  categoryStats.sort((a, b) => b.value - a.value);

  const topItemsArray = Array.from(itemTotals.values()).sort((a, b) => b.quantity - a.quantity);

  let mostExpensiveItem: MenuItem | null = null;
  let maxPrice = 0;
  let mostConsumedItem: MenuItem | null = null;
  let maxQty = 0;

  for (const { item, quantity } of itemTotals.values()) {
    if (item.price > maxPrice) {
      maxPrice = item.price;
      mostExpensiveItem = item;
    }
    if (quantity > maxQty) {
      maxQty = quantity;
      mostConsumedItem = item;
    }
  }

  return {
    aycePrice,
    totalMenuValue,
    savings,
    valueMultiplier,
    itemCount,
    uniqueItemCount,
    mostExpensiveItem,
    mostConsumedItem,
    breakEvenProgress,
    categoryStats,
    topItems: topItemsArray.slice(0, 10),
  };
}

export function getValueLevel(multiplier: number): {
  label: string;
  color: string;
  description: string;
} {
  if (multiplier < 1) {
    return { label: 'Under Break-Even', color: '#ef4444', description: 'Keep eating!' };
  } else if (multiplier < 1.5) {
    return { label: 'Break-Even Achieved', color: '#f97316', description: "You're in the green!" };
  } else if (multiplier < 2.5) {
    return { label: 'Great Value', color: '#22c55e', description: 'Excellent value!' };
  } else {
    return { label: 'Sushi Legend', color: '#8b5cf6', description: 'Legendary performance!' };
  }
}

export function getPerDinerStats(
  items: ConsumptionRecord[],
  menu: MenuItem[],
  dinerId: string,
) {
  const dinerItems = items.filter((r) => r.dinerId === dinerId);
  const menuMap = new Map(menu.map((m) => [m.id, m]));
  let total = 0;
  let count = 0;
  for (const record of dinerItems) {
    const item = menuMap.get(record.itemId);
    if (item) {
      total += item.price * record.quantity;
      count += record.quantity;
    }
  }
  return { total, count, uniqueCount: dinerItems.length };
}
