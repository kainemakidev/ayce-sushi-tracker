'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BreakEvenBar } from '@/components/shared/BreakEvenBar';
import { SummaryCharts } from '@/components/summary/SummaryCharts';
import { AchievementGrid } from '@/components/summary/AchievementGrid';
import { ShareCard } from '@/components/summary/ShareCard';
import { BillSplit } from '@/components/summary/BillSplit';
import { useMealStore } from '@/store/mealStore';
import { useHistoryStore } from '@/store/historyStore';
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
import { RESTAURANTS, getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats, getValueLevel } from '@/lib/calculations';
import { checkAchievements } from '@/lib/achievements';
import { formatCurrency, formatMultiplier } from '@/lib/utils';

export default function SummaryPage() {
  const router = useRouter();
  const { selectedRestaurantId, selectedAycePrice, selectedPricingLabel, cashPayment, items, diners, clearMeal } = useMealStore();
  const { meals } = useHistoryStore();
  const { ayceQtyOverrides } = useMenuOverrideStore();

  const restaurant = RESTAURANTS.find((r) => r.id === selectedRestaurantId);
  const menu = useMemo(
    () => (selectedRestaurantId ? getMenuForRestaurant(selectedRestaurantId) : []),
    [selectedRestaurantId],
  );

  // Use current meal or most recent saved meal
  const { stats, achievements, date, restaurantName, pricingLabel, isCash } = useMemo(() => {
    if (restaurant && selectedAycePrice && items.length > 0) {
      const s = calculateMealStats(items, menu, selectedAycePrice, ayceQtyOverrides);
      const a = checkAchievements(s, items, menu);
      return {
        stats: s,
        achievements: a,
        date: new Date().toISOString(),
        restaurantName: restaurant.name,
        pricingLabel: selectedPricingLabel,
        isCash: cashPayment,
      };
    }
    // Fall back to most recent history
    const lastMeal = meals[0];
    if (lastMeal) {
      const r = RESTAURANTS.find((res) => res.id === lastMeal.restaurantId);
      const m = r ? getMenuForRestaurant(r.id) : [];
      const s = calculateMealStats(lastMeal.items, m, lastMeal.aycePrice);
      return {
        stats: s,
        achievements: lastMeal.achievements || [],
        date: lastMeal.date,
        restaurantName: lastMeal.restaurantName,
        pricingLabel: lastMeal.pricingLabel ?? null,
        isCash: lastMeal.cashPayment ?? false,
      };
    }
    return { stats: null, achievements: [], date: new Date().toISOString(), restaurantName: null, pricingLabel: null, isCash: false };
  }, [restaurant, selectedAycePrice, selectedPricingLabel, cashPayment, items, menu, meals, ayceQtyOverrides]);

  const handleNewMeal = () => {
    clearMeal();
    router.push('/');
  };

  if (!stats || !restaurantName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <div className="text-4xl">📊</div>
        <p className="text-lg font-semibold text-gray-700">No meal data yet</p>
        <p className="text-sm text-gray-400 text-center">Start tracking a meal to see your summary</p>
        <Link href="/">
          <Button>Start a Meal</Button>
        </Link>
      </div>
    );
  }

  const level = getValueLevel(stats.valueMultiplier);
  const isCurrentMeal = restaurant && selectedAycePrice && items.length > 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 text-white"
        style={{ background: `linear-gradient(135deg, ${level.color}dd, ${level.color})` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium opacity-80">
              {isCurrentMeal ? 'Current Meal' : 'Last Meal'}
            </p>
            <h1 className="text-xl font-bold leading-tight">{restaurantName}</h1>
            {pricingLabel && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs opacity-70">{pricingLabel}</p>
                {isCash && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Cash −10%</span>}
              </div>
            )}
          </div>
          <div className="text-4xl">
            {achievements.at(-1) ? '🏆' : '🍣'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-75">À La Carte Value</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalMenuValue)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-75">Multiplier</p>
            <p className="text-2xl font-bold">{formatMultiplier(stats.valueMultiplier)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'AYCE Price', value: formatCurrency(stats.aycePrice), color: 'text-gray-900' },
            { label: 'Total Value', value: formatCurrency(stats.totalMenuValue), color: 'text-red-600' },
            { label: 'You Saved', value: (stats.savings >= 0 ? '+' : '') + formatCurrency(stats.savings), color: stats.savings >= 0 ? 'text-green-600' : 'text-orange-500' },
            { label: 'Items Eaten', value: stats.itemCount.toString(), color: 'text-gray-900' },
            { label: 'Unique Items', value: stats.uniqueItemCount.toString(), color: 'text-gray-900' },
            { label: 'Categories', value: stats.categoryStats.length.toString(), color: 'text-gray-900' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Highlights */}
        {(stats.mostExpensiveItem || stats.mostConsumedItem) && (
          <div className="grid grid-cols-2 gap-3">
            {stats.mostExpensiveItem && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-gray-400 mb-1">⭐ Most Valuable</p>
                  <p className="text-sm font-semibold text-gray-900">{stats.mostExpensiveItem.name}</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(stats.mostExpensiveItem.price)}</p>
                </CardContent>
              </Card>
            )}
            {stats.mostConsumedItem && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-gray-400 mb-1">🔥 Most Ordered</p>
                  <p className="text-sm font-semibold text-gray-900">{stats.mostConsumedItem.name}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Break-even */}
        <Card>
          <CardContent className="pt-5">
            <BreakEvenBar aycePrice={stats.aycePrice} currentValue={stats.totalMenuValue} />
          </CardContent>
        </Card>

        {/* Charts */}
        {stats.categoryStats.length > 0 && (
          <SummaryCharts categoryStats={stats.categoryStats} topItems={stats.topItems} />
        )}

        {/* Achievements */}
        <AchievementGrid earnedIds={achievements} />

        {/* Bill split — use the most recent saved meal so it works after clearMeal() */}
        {meals[0] && (
          <BillSplit
            aycePrice={meals[0].aycePrice}
            diners={meals[0].diners ?? []}
            cashPayment={meals[0].cashPayment ?? false}
          />
        )}

        {/* Share card */}
        <ShareCard
          restaurantName={restaurantName}
          date={date}
          stats={stats}
          earnedAchievementIds={achievements}
        />

        {/* Actions */}
        <div className="flex gap-3 pb-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleNewMeal}>
            <RefreshCw className="h-4 w-4" />
            New Meal
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
