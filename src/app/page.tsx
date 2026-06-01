'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, History, ChevronRight, TrendingUp, Banknote, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMealStore } from '@/store/mealStore';
import { useHistoryStore } from '@/store/historyStore';
import { RESTAURANTS, getDefaultTier } from '@/data/restaurants';
import { formatCurrency, formatMultiplier } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PricingTier, Restaurant } from '@/types';

function PricingSelector({
  restaurant,
  onStart,
}: {
  restaurant: Restaurant;
  onStart: (aycePrice: number, label: string, cash: boolean) => void;
}) {
  const defaultTier = getDefaultTier(restaurant);
  const [selectedTierId, setSelectedTierId] = useState(defaultTier.id);
  const [cashPayment, setCashPayment] = useState(false);

  const tier = restaurant.pricingTiers.find((t) => t.id === selectedTierId) ?? defaultTier;
  const finalPrice = cashPayment ? tier.cashPrice : tier.price;
  const cashSaving = tier.price - tier.cashPrice;

  return (
    <div className="space-y-4">
      {/* Tier selector */}
      <div className="grid grid-cols-2 gap-2">
        {restaurant.pricingTiers.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTierId(t.id)}
            className={cn(
              'p-3 rounded-xl border-2 text-left transition-all cursor-pointer',
              selectedTierId === t.id
                ? 'border-red-500 bg-red-50'
                : 'border-gray-100 bg-white hover:border-gray-200',
            )}
          >
            <p className={cn(
              'text-xs font-semibold leading-tight',
              selectedTierId === t.id ? 'text-red-700' : 'text-gray-600',
            )}>
              {t.label}
            </p>
            <p className={cn(
              'text-base font-bold mt-0.5',
              selectedTierId === t.id ? 'text-red-600' : 'text-gray-800',
            )}>
              {formatCurrency(t.price)}
            </p>
          </button>
        ))}
      </div>

      {/* Cash / Card toggle */}
      <div className="flex rounded-xl border-2 border-gray-100 overflow-hidden">
        <button
          onClick={() => setCashPayment(false)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all cursor-pointer',
            !cashPayment ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50',
          )}
        >
          <CreditCard className="h-4 w-4" />
          Card
        </button>
        <button
          onClick={() => setCashPayment(true)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all cursor-pointer',
            cashPayment ? 'bg-green-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50',
          )}
        >
          <Banknote className="h-4 w-4" />
          Cash
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded-full font-bold',
            cashPayment ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700',
          )}>
            −10%
          </span>
        </button>
      </div>

      {/* Price summary */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-xl',
        cashPayment ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100',
      )}>
        <div>
          <p className="text-xs text-gray-500">Your AYCE price</p>
          <div className="flex items-baseline gap-2">
            <p className={cn('text-2xl font-bold', cashPayment ? 'text-green-700' : 'text-gray-900')}>
              {formatCurrency(finalPrice)}
            </p>
            {cashPayment && (
              <p className="text-xs text-green-600 font-medium">
                saving {formatCurrency(cashSaving)}
              </p>
            )}
          </div>
        </div>
        {cashPayment && <Banknote className="h-8 w-8 text-green-400" />}
      </div>

      {/* Start buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          className="gap-2"
          onClick={() => onStart(finalPrice, tier.label, cashPayment)}
        >
          🍣 Start Meal
        </Button>
        <Link href="/fast-entry" className="contents">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => onStart(finalPrice, tier.label, cashPayment)}
          >
            <Zap className="h-4 w-4 text-yellow-500" />
            Fast Entry
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { mealStarted, selectedAycePrice, items, startMeal } = useMealStore();
  const { meals } = useHistoryStore();

  const handleStart = (restaurantId: string, aycePrice: number, label: string, cash: boolean) => {
    startMeal(restaurantId, aycePrice, label, cash);
    router.push('/tracker');
  };

  const recentMeals = meals.slice(0, 3);
  const lifetimeSavings = meals.reduce((sum, m) => sum + m.savings, 0);
  const totalItems = items.reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-5 pt-12 pb-8 text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🍣</span>
          <h1 className="text-2xl font-bold tracking-tight">AYCE Sushi Tracker</h1>
        </div>
        <p className="text-red-200 text-sm">Know your value, every bite.</p>

        {meals.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-red-200">Meals Tracked</p>
              <p className="text-2xl font-bold">{meals.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-red-200">Lifetime Savings</p>
              <p className="text-2xl font-bold">{formatCurrency(lifetimeSavings)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Active meal banner */}
        {mealStarted && totalItems > 0 && (
          <button
            className="w-full flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl cursor-pointer text-left"
            onClick={() => router.push('/tracker')}
          >
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-green-800">Meal in Progress</p>
                <p className="text-xs text-green-600">
                  {totalItems} items · {selectedAycePrice ? formatCurrency(selectedAycePrice) : ''} AYCE
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-green-600" />
          </button>
        )}

        {/* Restaurant + pricing selector */}
        {RESTAURANTS.map((restaurant) => (
          <div key={restaurant.id}>
            {/* Restaurant header */}
            <Card className="mb-3">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl shrink-0">
                  🍱
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 leading-tight">{restaurant.name}</p>
                  {restaurant.address && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{restaurant.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing selector */}
            <PricingSelector
              restaurant={restaurant}
              onStart={(price, label, cash) =>
                handleStart(restaurant.id, price, label, cash)
              }
            />
          </div>
        ))}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/summary">
            <Card className="hover:border-red-200 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Summary</p>
                  <p className="text-xs text-gray-400">Charts & stats</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/history">
            <Card className="hover:border-red-200 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <History className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">History</p>
                  <p className="text-xs text-gray-400">{meals.length} meals</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent meals */}
        {recentMeals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Meals</h2>
              <Link href="/history" className="text-xs text-red-600 font-medium hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {recentMeals.map((meal) => (
                <Card key={meal.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{meal.restaurantName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(meal.date).toLocaleDateString()} · {meal.itemCount} items
                        {meal.pricingLabel ? ` · ${meal.pricingLabel}` : ''}
                        {meal.cashPayment ? ' · Cash' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{formatCurrency(meal.menuValue)}</p>
                      <p className="text-xs text-green-600 font-medium">{formatMultiplier(meal.valueMultiplier)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
