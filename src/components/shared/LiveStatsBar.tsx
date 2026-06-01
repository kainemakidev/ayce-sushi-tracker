'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useMealStore } from '@/store/mealStore';
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
import { RESTAURANTS, getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats } from '@/lib/calculations';
import { formatCurrency, formatMultiplier } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function LiveStatsBar() {
  const { selectedRestaurantId, selectedAycePrice, items } = useMealStore();
  const { ayceQtyOverrides } = useMenuOverrideStore();

  const stats = useMemo(() => {
    if (!selectedRestaurantId || !selectedAycePrice) return null;
    const menu = getMenuForRestaurant(selectedRestaurantId);
    return calculateMealStats(items, menu, selectedAycePrice, ayceQtyOverrides);
  }, [selectedRestaurantId, selectedAycePrice, items, ayceQtyOverrides]);

  if (!stats) return null;

  const isProfit = stats.totalMenuValue >= stats.aycePrice;

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2.5 text-white text-sm transition-all',
      isProfit ? 'bg-green-600' : 'bg-red-600',
    )}>
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="font-bold">{formatCurrency(stats.totalMenuValue)}</span>
        <span className="opacity-75 text-xs">value</span>
      </div>
      <div className="flex gap-3 text-xs">
        <span>{stats.itemCount} items</span>
        <span className="font-semibold">{formatMultiplier(stats.valueMultiplier)}</span>
      </div>
    </div>
  );
}
