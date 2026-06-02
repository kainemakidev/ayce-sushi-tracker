'use client';

import { useMemo } from 'react';
import { useMealStore } from '@/store/mealStore';
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
import { getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats } from '@/lib/calculations';
import { formatCurrency, formatMultiplier } from '@/lib/utils';

export function LiveStatsBar() {
  const { selectedRestaurantId, selectedAycePrice, items, diners } = useMealStore();
  const { ayceQtyOverrides } = useMenuOverrideStore();

  const stats = useMemo(() => {
    if (!selectedRestaurantId || !selectedAycePrice) return null;
    const menu = getMenuForRestaurant(selectedRestaurantId);
    const groupSize = diners.length || 1;
    return calculateMealStats(items, menu, selectedAycePrice * groupSize, ayceQtyOverrides);
  }, [selectedRestaurantId, selectedAycePrice, items, diners, ayceQtyOverrides]);

  if (!stats) return null;

  const isProfit = stats.totalMenuValue >= stats.aycePrice;

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 text-white"
      style={{ background: isProfit ? 'linear-gradient(135deg, #1a7a46, #27AE60)' : 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)' }}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-lg font-bold leading-none" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
          {formatCurrency(stats.totalMenuValue)}
        </span>
        <span className="text-xs opacity-70">value</span>
      </div>
      <div className="flex items-center gap-2 text-xs" style={{ opacity: 0.85 }}>
        <span>{stats.itemCount} item{stats.itemCount !== 1 ? 's' : ''}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span className="font-semibold">{formatMultiplier(stats.valueMultiplier)}</span>
      </div>
    </div>
  );
}
