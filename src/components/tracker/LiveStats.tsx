'use client';

import { useMemo } from 'react';
import { Star, Utensils, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BreakEvenBar } from '@/components/shared/BreakEvenBar';
import { useMealStore } from '@/store/mealStore';
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
import { getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats, getValueLevel } from '@/lib/calculations';
import { formatCurrency, formatMultiplier } from '@/lib/utils';

export function LiveStats() {
  const {
    selectedRestaurantId,
    selectedAycePrice,
    selectedPricingLabel,
    cashPayment,
    items,
    partyModeEnabled,
    selectedDinerId,
    diners,
  } = useMealStore();
  const { ayceQtyOverrides } = useMenuOverrideStore();

  const activeDiner = partyModeEnabled && selectedDinerId
    ? diners.find((d) => d.id === selectedDinerId) ?? null
    : null;

  const filteredItems = useMemo(
    () => (activeDiner ? items.filter((r) => r.dinerId === activeDiner.id) : items),
    [items, activeDiner],
  );

  const stats = useMemo(() => {
    if (!selectedRestaurantId || !selectedAycePrice) return null;
    const menu = getMenuForRestaurant(selectedRestaurantId);
    // Per-person view uses individual price; combined view uses total group price
    const effectivePrice = activeDiner ? selectedAycePrice : selectedAycePrice * (diners.length || 1);
    return calculateMealStats(filteredItems, menu, effectivePrice, ayceQtyOverrides);
  }, [selectedRestaurantId, selectedAycePrice, filteredItems, ayceQtyOverrides, activeDiner, diners]);

  if (!stats) return null;

  const level = getValueLevel(stats.valueMultiplier);

  return (
    <div className="space-y-3">
      {/* Who we're viewing */}
      {partyModeEnabled && (
        <div className="flex items-center gap-2">
          {activeDiner ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: activeDiner.color }}>
              <span className="h-4 w-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold leading-none">
                {activeDiner.name[0].toUpperCase()}
              </span>
              {activeDiner.name}'s Stats
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold">
              <Users className="h-3.5 w-3.5" />
              Everyone · Combined
            </div>
          )}
          {activeDiner && (
            <span className="text-xs text-gray-400 dark:text-gray-500">Tap another name to switch</span>
          )}
        </div>
      )}

      <Card className={stats.valueMultiplier >= 1 ? 'border-green-300 dark:border-green-700' : ''}>
        <CardContent className="pt-5">
          {stats.valueMultiplier >= 1 && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-50 dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-base">🎉</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-green-700 dark:text-green-400">You&apos;re ahead!</p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  +{formatCurrency(stats.savings)} in value — keep going!
                </p>
              </div>
            </div>
          )}
          {selectedPricingLabel && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">{selectedPricingLabel}</span>
              {cashPayment && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  Cash −10%
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">AYCE Price</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.aycePrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">À La Carte Value</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalMenuValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Savings</p>
              <p className={`text-lg font-bold ${stats.savings >= 0 ? 'text-green-600' : 'text-orange-500'}`}>
                {stats.savings >= 0 ? '+' : ''}{formatCurrency(stats.savings)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Value Multiplier</p>
              <p className="text-lg font-bold" style={{ color: level.color }}>
                {formatMultiplier(stats.valueMultiplier)}
              </p>
            </div>
          </div>
          <BreakEvenBar aycePrice={stats.aycePrice} currentValue={stats.totalMenuValue} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.itemCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.uniqueItemCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Unique</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.categoryStats.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Categories</p>
          </CardContent>
        </Card>
      </div>

      {(stats.mostExpensiveItem || stats.mostConsumedItem) && (
        <div className="grid grid-cols-2 gap-2">
          {stats.mostExpensiveItem && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Most Expensive</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{stats.mostExpensiveItem.name}</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(stats.mostExpensiveItem.price)}</p>
              </CardContent>
            </Card>
          )}
          {stats.mostConsumedItem && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Utensils className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Most Consumed</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{stats.mostConsumedItem.name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
