'use client';

import { useMemo } from 'react';
import { Star, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BreakEvenBar } from '@/components/shared/BreakEvenBar';
import { useMealStore } from '@/store/mealStore';
import { getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats, getValueLevel } from '@/lib/calculations';
import { formatCurrency, formatMultiplier } from '@/lib/utils';

export function LiveStats() {
  const { selectedRestaurantId, selectedAycePrice, selectedPricingLabel, cashPayment, items } =
    useMealStore();

  const stats = useMemo(() => {
    if (!selectedRestaurantId || !selectedAycePrice) return null;
    const menu = getMenuForRestaurant(selectedRestaurantId);
    return calculateMealStats(items, menu, selectedAycePrice);
  }, [selectedRestaurantId, selectedAycePrice, items]);

  if (!stats) return null;

  const level = getValueLevel(stats.valueMultiplier);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="pt-5">
          {/* Pricing label */}
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
              <p className="text-xs text-gray-500 mb-0.5">AYCE Price</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.aycePrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">À La Carte Value</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalMenuValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Savings</p>
              <p className={`text-lg font-bold ${stats.savings >= 0 ? 'text-green-600' : 'text-orange-500'}`}>
                {stats.savings >= 0 ? '+' : ''}{formatCurrency(stats.savings)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Value Multiplier</p>
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
            <p className="text-2xl font-bold text-gray-900">{stats.itemCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueItemCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Unique</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.categoryStats.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Categories</p>
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
                  <p className="text-xs text-gray-500">Most Expensive</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{stats.mostExpensiveItem.name}</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(stats.mostExpensiveItem.price)}</p>
              </CardContent>
            </Card>
          )}
          {stats.mostConsumedItem && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Utensils className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-xs text-gray-500">Most Consumed</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{stats.mostConsumedItem.name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
