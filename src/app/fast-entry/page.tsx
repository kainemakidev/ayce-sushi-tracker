'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, List, Banknote, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FastEntryInput } from '@/components/fast-entry/FastEntryInput';
import { MenuReference } from '@/components/fast-entry/MenuReference';
import { LiveStatsBar } from '@/components/shared/LiveStatsBar';
import { useMealStore } from '@/store/mealStore';
import { useHistoryStore } from '@/store/historyStore';
import { RESTAURANTS, getDefaultTier, getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats } from '@/lib/calculations';
import { checkAchievements } from '@/lib/achievements';
import { generateId, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Restaurant } from '@/types';

function QuickStartForm({ restaurant, onStart }: {
  restaurant: Restaurant;
  onStart: (price: number, label: string, cash: boolean) => void;
}) {
  const defaultTier = getDefaultTier(restaurant);
  const [tierId, setTierId] = useState(defaultTier.id);
  const [cash, setCash] = useState(false);
  const tier = restaurant.pricingTiers.find((t) => t.id === tierId) ?? defaultTier;
  const price = cash ? tier.cashPrice : tier.price;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">Select pricing to start</p>

      {/* Tier pills */}
      <div className="grid grid-cols-2 gap-1.5">
        {restaurant.pricingTiers.map((t) => (
          <button
            key={t.id}
            onClick={() => setTierId(t.id)}
            className={cn(
              'p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer',
              tierId === t.id ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200',
            )}
          >
            <p className={cn('text-[11px] font-semibold', tierId === t.id ? 'text-red-700' : 'text-gray-600')}>
              {t.label}
            </p>
            <p className={cn('text-sm font-bold', tierId === t.id ? 'text-red-600' : 'text-gray-800')}>
              {formatCurrency(t.price)}
            </p>
          </button>
        ))}
      </div>

      {/* Cash / Card */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setCash(false)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all cursor-pointer',
            !cash ? 'bg-gray-900 text-white' : 'bg-white text-gray-500',
          )}
        >
          <CreditCard className="h-3.5 w-3.5" /> Card
        </button>
        <button
          onClick={() => setCash(true)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all cursor-pointer',
            cash ? 'bg-green-600 text-white' : 'bg-white text-gray-500',
          )}
        >
          <Banknote className="h-3.5 w-3.5" /> Cash −10%
        </button>
      </div>

      <Button className="w-full" onClick={() => onStart(price, tier.label, cash)}>
        ⚡ Start Fast Entry — {formatCurrency(price)}
      </Button>
    </div>
  );
}

export default function FastEntryPage() {
  const router = useRouter();
  const {
    selectedRestaurantId,
    selectedAycePrice,
    selectedPricingLabel,
    cashPayment,
    mealStarted,
    startMeal,
    items,
    diners,
  } = useMealStore();
  const { saveMeal } = useHistoryStore();

  const restaurant = RESTAURANTS.find((r) => r.id === selectedRestaurantId);

  const handleStart = (restaurantId: string, price: number, label: string, cash: boolean) => {
    startMeal(restaurantId, price, label, cash);
  };

  const handleFinishMeal = () => {
    if (!restaurant || !selectedAycePrice || items.length === 0) return;
    const menu = getMenuForRestaurant(restaurant.id);
    const stats = calculateMealStats(items, menu, selectedAycePrice);
    const achievements = checkAchievements(stats, items, menu);

    saveMeal({
      id: generateId(),
      date: new Date().toISOString(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      aycePrice: selectedAycePrice,
      pricingLabel: selectedPricingLabel ?? undefined,
      cashPayment,
      menuValue: stats.totalMenuValue,
      savings: stats.savings,
      valueMultiplier: stats.valueMultiplier,
      itemCount: stats.itemCount,
      uniqueItemCount: stats.uniqueItemCount,
      topCategory: stats.categoryStats[0]?.category || '',
      items,
      diners,
      achievements,
    });

    router.push('/summary');
  };

  // Not started — show quick-start form for each restaurant
  if (!selectedRestaurantId || !mealStarted) {
    return (
      <div className="px-4 py-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>⚡</span> Fast Entry
          </h1>
          <p className="text-sm text-gray-400 mt-1">Track by menu code, hands-free</p>
        </div>
        {RESTAURANTS.map((r) => (
          <div key={r.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍱</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                <p className="text-xs text-gray-400">{r.address}</p>
              </div>
            </div>
            <QuickStartForm
              restaurant={r}
              onStart={(price, label, cash) => handleStart(r.id, price, label, cash)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Link href="/tracker" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <span>⚡</span> Fast Entry
              </h1>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-gray-400">{selectedPricingLabel}</p>
                {cashPayment && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                    Cash
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/tracker">
              <Button variant="outline" size="sm">
                <List className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button size="sm" onClick={handleFinishMeal} disabled={items.length === 0}>
              Done
            </Button>
          </div>
        </div>
        <LiveStatsBar />
      </div>

      <div className="px-4 py-4 space-y-4">
        <FastEntryInput />
        {selectedRestaurantId && <MenuReference restaurantId={selectedRestaurantId} />}
      </div>
    </div>
  );
}
