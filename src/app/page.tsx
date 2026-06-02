'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMealStore } from '@/store/mealStore';
import { useHistoryStore } from '@/store/historyStore';
import { RESTAURANTS } from '@/data/restaurants';
import { formatCurrency, formatMultiplier } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { mealStarted, selectedAycePrice, items } = useMealStore();
  const { meals } = useHistoryStore();

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
            type="button"
            className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl cursor-pointer text-left"
            onClick={() => router.push('/tracker')}
          >
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">Meal in Progress</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {totalItems} items · {selectedAycePrice ? formatCurrency(selectedAycePrice) : ''} AYCE
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-green-600 dark:text-green-400" />
          </button>
        )}

        {/* Restaurant list */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Restaurants
          </h2>
          <div className="space-y-2">
            {RESTAURANTS.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                <Card className="hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 flex items-center justify-center text-xl shrink-0">
                      🍱
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                        {restaurant.name}
                      </p>
                      {restaurant.address && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {restaurant.address}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent meals */}
        {recentMeals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent Meals
              </h2>
              <Link href="/history" className="text-xs text-red-600 font-medium hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {recentMeals.map((meal) => (
                <Card key={meal.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {meal.restaurantName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(meal.date).toLocaleDateString()} · {meal.itemCount} items
                        {meal.pricingLabel ? ` · ${meal.pricingLabel}` : ''}
                        {meal.cashPayment ? ' · Cash' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{formatCurrency(meal.menuValue)}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {formatMultiplier(meal.valueMultiplier)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* New user value preview */}
        {meals.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4">
            <p className="text-xs font-semibold text-red-400 dark:text-red-500 uppercase tracking-wider mb-3">What you'll track</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">AYCE Price</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">$35.99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">À La Carte Value</span>
                <span className="text-sm font-bold text-red-600">$78.50</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-green-500" style={{ width: '100%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">+$42.51 saved</span>
                <span className="text-sm font-bold text-purple-600">2.18×</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
              Track your first meal to see your real numbers →
            </p>
          </div>
        )}

        {/* Empty state */}
        {RESTAURANTS.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No restaurants added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
