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
import { getValueLevel } from '@/lib/calculations';

const HEADER_GRADIENT = 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)';
const GOLD = '#F39C12';

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
      <div className="px-5 pt-12 pb-8 text-white" style={{ background: HEADER_GRADIENT }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🍣</span>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}
          >
            RollCall
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
          Know your value, every bite.
        </p>

        {meals.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Meals Tracked</p>
              <p className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>{meals.length}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Lifetime Savings</p>
              <p className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>{formatCurrency(lifetimeSavings)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Active meal banner */}
        {mealStarted && totalItems > 0 && (
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 rounded-2xl cursor-pointer text-left border-2 transition-all"
            style={{ background: '#F0FDF4', borderColor: '#27AE60' }}
            onClick={() => router.push('/tracker')}
          >
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: '#27AE60' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#15803d' }}>Meal in Progress</p>
                <p className="text-xs" style={{ color: '#16a34a' }}>
                  {totalItems} items · {selectedAycePrice ? formatCurrency(selectedAycePrice) : ''} AYCE
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5" style={{ color: '#16a34a' }} />
          </button>
        )}

        {/* Restaurant list */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Restaurants
          </h2>
          <div className="space-y-2">
            {RESTAURANTS.map((restaurant) => {
              const restaurantMeals = meals.filter((m) => m.restaurantId === restaurant.id);
              const avgMultiplier = restaurantMeals.length > 0
                ? restaurantMeals.reduce((s, m) => s + m.valueMultiplier, 0) / restaurantMeals.length
                : null;
              const lastVisit = restaurantMeals[0]
                ? new Date(restaurantMeals[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : null;
              return (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                  <Card className="transition-all cursor-pointer hover:shadow-md" style={{ borderRadius: '16px' }}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: '#FEF3F2', border: '1px solid #fecaca' }}>
                        🍱
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                          {restaurant.name}
                        </p>
                        {restaurant.address && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {restaurant.address}
                          </p>
                        )}
                        {restaurantMeals.length > 0 && avgMultiplier !== null && (
                          <p className="text-xs mt-1" style={{ color: getValueLevel(avgMultiplier).color }}>
                            {restaurantMeals.length} visit{restaurantMeals.length !== 1 ? 's' : ''} · Avg {formatMultiplier(avgMultiplier)} · Last {lastVisit}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent meals */}
        {recentMeals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
                Recent Meals
              </h2>
              <Link href="/history" className="text-xs font-medium hover:underline" style={{ color: '#C0392B' }}>
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {recentMeals.map((meal) => (
                <Card key={meal.id} style={{ borderRadius: '16px' }}>
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
                      <p className="text-sm font-bold" style={{ color: '#C0392B' }}>{formatCurrency(meal.menuValue)}</p>
                      <p className="text-xs font-medium" style={{ color: getValueLevel(meal.valueMultiplier).color }}>{formatMultiplier(meal.valueMultiplier)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* New user value preview */}
        {meals.length === 0 && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: '#FEF9F0',
              border: '1.5px dashed rgba(231, 76, 60, 0.35)',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              Your Value Snapshot
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">AYCE Price</span>
                <span className="text-sm font-bold text-gray-700">$35.99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">À La Carte Value</span>
                <span className="text-sm font-bold" style={{ color: '#C0392B' }}>$78.50</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E8E6E0' }}>
                <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #27AE60, #2ECC71)' }} />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-bold"
                  style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '18px', color: '#27AE60' }}
                >
                  +$42.51 saved
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-sm font-bold"
                  style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, background: '#F39C12', color: '#1A1A1A' }}
                >
                  2.18×
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Start a meal to see your real savings →
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
