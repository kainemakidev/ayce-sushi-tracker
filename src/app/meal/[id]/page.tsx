'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, ImageOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useHistoryStore } from '@/store/historyStore';
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
import { RESTAURANTS, getMenuForRestaurant, CATEGORY_COLORS } from '@/data/restaurants';
import { getEffectivePortionInfo, getValueLevel } from '@/lib/calculations';
import { formatCurrency, formatMultiplier, formatDateShort } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/lib/achievements';

function ItemThumb({ src, name, code, color }: { src?: string; name: string; code: string; color: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-11 w-11 rounded-lg object-cover shrink-0"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className="h-11 w-11 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold"
      style={{ backgroundColor: `${color}25`, color }}
    >
      {code}
    </div>
  );
}

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { meals } = useHistoryStore();
  const { ayceQtyOverrides } = useMenuOverrideStore();

  const meal = meals.find((m) => m.id === id);
  const restaurant = meal ? RESTAURANTS.find((r) => r.id === meal.restaurantId) : null;

  const menu = useMemo(
    () => (restaurant ? getMenuForRestaurant(restaurant.id) : []),
    [restaurant],
  );

  // Consolidate items by itemId (sum across diners)
  const consolidatedItems = useMemo(() => {
    if (!meal) return [];
    const grouped = new Map<string, number>();
    for (const r of meal.items) {
      if (r.quantity <= 0) continue;
      grouped.set(r.itemId, (grouped.get(r.itemId) ?? 0) + r.quantity);
    }
    return Array.from(grouped.entries())
      .map(([itemId, quantity]) => {
        const menuItem = menu.find((m) => m.id === itemId);
        if (!menuItem) return null;
        const { portionRatio, effectiveAyceQty } = getEffectivePortionInfo(menuItem, ayceQtyOverrides);
        const valuePerOrder = menuItem.price * portionRatio;
        const totalValue = valuePerOrder * quantity;
        return { itemId, quantity, menuItem, valuePerOrder, totalValue, effectiveAyceQty };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [meal, menu, ayceQtyOverrides]);

  if (!meal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <div className="text-5xl">🍱</div>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Meal not found</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-red-600 hover:underline cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  const level = getValueLevel(meal.valueMultiplier);
  const topAchievement = ACHIEVEMENTS.find((a) => meal.achievements?.includes(a.id));
  const groupSize = meal.diners?.length ?? 1;
  const topPicks = consolidatedItems.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="animate-fade-in pb-8">
      {/* Hero */}
      <div
        className="px-5 pt-12 pb-6 text-white"
        style={{ background: `linear-gradient(135deg, ${level.color}ee 0%, ${level.color} 100%)` }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 mb-4 cursor-pointer transition-colors"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Past Meals</span>
        </button>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70 mb-0.5">
              Meal Recap
            </p>
            <h1
              className="text-xl font-bold leading-tight"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {meal.restaurantName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 opacity-60" />
                <p className="text-xs opacity-70">{formatDateShort(meal.date)}</p>
              </div>
              {meal.pricingLabel && (
                <span className="text-xs opacity-60">· {meal.pricingLabel}</span>
              )}
              {meal.cashPayment && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  💵 Cash
                </span>
              )}
            </div>
          </div>
          <div className="text-4xl shrink-0">{topAchievement?.emoji ?? '🍣'}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <p className="text-xs opacity-70">
              AYCE Paid{groupSize > 1 ? ` (×${groupSize})` : ''}
            </p>
            <p className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatCurrency(meal.aycePrice * groupSize)}
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <p className="text-xs opacity-70">À La Carte Value</p>
            <p className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatCurrency(meal.menuValue)}
            </p>
          </div>
        </div>

        {/* Multiplier + savings row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontFamily: "'Sora', sans-serif" }}
          >
            {formatMultiplier(meal.valueMultiplier)} · {level.label}
          </span>
          <span className="text-sm opacity-75">
            {meal.savings >= 0 ? '+' : ''}{formatCurrency(meal.savings)} saved
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Top Picks */}
        {topPicks.length > 0 && (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#F39C12' }}
            >
              Top Picks This Meal
            </h2>
            <div className="space-y-2">
              {topPicks.map(({ itemId, quantity, menuItem, valuePerOrder, totalValue }, idx) => {
                const catColor = CATEGORY_COLORS[menuItem.category] || '#6b7280';
                return (
                  <Card key={`top-${itemId}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-xl shrink-0">{medals[idx]}</span>
                      <ItemThumb src={menuItem.image} name={menuItem.name} code={menuItem.code} color={catColor} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {menuItem.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {quantity}× · {formatCurrency(valuePerOrder)} each
                        </p>
                      </div>
                      <p className="text-sm font-bold shrink-0" style={{ color: catColor }}>
                        {formatCurrency(totalValue)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Items */}
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#F39C12' }}
          >
            All Items · {meal.itemCount} ordered
          </h2>
          {consolidatedItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No item data available</p>
          ) : (
            <div className="space-y-2">
              {consolidatedItems.map(({ itemId, quantity, menuItem, valuePerOrder, totalValue }) => {
                const catColor = CATEGORY_COLORS[menuItem.category] || '#6b7280';
                const hasPrice = menuItem.price > 0;
                return (
                  <Card key={`item-${itemId}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <ItemThumb src={menuItem.image} name={menuItem.name} code={menuItem.code} color={catColor} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {menuItem.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{menuItem.code}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: `${catColor}20`, color: catColor }}
                          >
                            {menuItem.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400 dark:text-gray-500">×{quantity}</p>
                        {hasPrice ? (
                          <p className="text-sm font-bold text-red-600">{formatCurrency(totalValue)}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Price TBD</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
