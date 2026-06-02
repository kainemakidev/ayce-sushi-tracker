'use client';

import { useState } from 'react';
import { Settings, Sun, Moon, LogOut, TrendingUp, Award, Utensils, DollarSign, Star, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMeals } from '@/hooks/useMeals';
import { useTheme } from '@/components/shared/ThemeProvider';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatMultiplier } from '@/lib/utils';
import { getValueLevel } from '@/lib/calculations';
import { ACHIEVEMENTS } from '@/lib/achievements';

const HEADER_GRADIENT = 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)';
const GOLD = '#F39C12';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { meals } = useMeals();
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  // Lifetime calculations
  const lifetimeSavings = meals.reduce((s, m) => s + m.savings, 0);
  const lifetimeValue = meals.reduce((s, m) => s + m.menuValue, 0);
  const lifetimePaid = meals.reduce((s, m) => s + m.aycePrice * (m.diners?.length ?? 1), 0);
  const avgMultiplier = meals.length > 0
    ? meals.reduce((s, m) => s + m.valueMultiplier, 0) / meals.length
    : 0;
  const avgSavings = meals.length > 0 ? lifetimeSavings / meals.length : 0;
  const bestMultiplierMeal = meals.length > 0
    ? meals.reduce((best, m) => m.valueMultiplier > best.valueMultiplier ? m : best)
    : null;
  const bestValueMeal = meals.length > 0
    ? meals.reduce((best, m) => m.menuValue > best.menuValue ? m : best)
    : null;

  // Restaurant breakdown
  const restaurantMap = new Map<string, { name: string; count: number; totalValue: number }>();
  for (const m of meals) {
    const existing = restaurantMap.get(m.restaurantId);
    if (existing) {
      existing.count++;
      existing.totalValue += m.menuValue;
    } else {
      restaurantMap.set(m.restaurantId, { name: m.restaurantName, count: 1, totalValue: m.menuValue });
    }
  }
  const topRestaurant = restaurantMap.size > 0
    ? Array.from(restaurantMap.values()).sort((a, b) => b.count - a.count)[0]
    : null;

  // Lifetime achievements: collect all unique achievement IDs across all meals
  const lifetimeAchievements = (() => {
    const firstEarnedMap = new Map<string, { date: string; restaurantName: string }>();
    for (const meal of [...meals].reverse()) {
      for (const id of (meal.achievements ?? [])) {
        if (!firstEarnedMap.has(id)) {
          firstEarnedMap.set(id, { date: meal.date, restaurantName: meal.restaurantName });
        }
      }
    }
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      earned: firstEarnedMap.get(a.id) ?? null,
    }));
  })();
  const earnedCount = lifetimeAchievements.filter((a) => a.earned).length;

  const statCards = [
    { label: 'Meals Tracked', value: meals.length.toString(), icon: Utensils, color: '#C0392B' },
    { label: 'Lifetime Savings', value: formatCurrency(lifetimeSavings), icon: DollarSign, color: '#27AE60' },
    { label: 'Total Value Eaten', value: formatCurrency(lifetimeValue), icon: TrendingUp, color: '#3b82f6' },
    { label: 'Total Paid', value: formatCurrency(lifetimePaid), icon: DollarSign, color: '#8b5cf6' },
    { label: 'Avg Savings / Meal', value: formatCurrency(avgSavings), icon: TrendingUp, color: '#27AE60' },
    { label: 'Avg Multiplier', value: `${avgMultiplier.toFixed(2)}×`, icon: Star, color: GOLD },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-12 pb-8 text-white relative" style={{ background: HEADER_GRADIENT }}>
        {/* Gear icon */}
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 p-2 rounded-xl cursor-pointer transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover shrink-0"
              style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }}
            />
          ) : (
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {user?.displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0 pr-10">
            <h1
              className="text-xl font-bold leading-tight truncate"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {user?.displayName ?? 'RollCall User'}
            </h1>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick stats strip */}
        {meals.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <p className="text-[10px] opacity-70">Meals</p>
              <p className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                {meals.length}
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <p className="text-[10px] opacity-70">Lifetime Saved</p>
              <p className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                {formatCurrency(lifetimeSavings)}
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <p className="text-[10px] opacity-70">Avg ×</p>
              <p className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                {avgMultiplier.toFixed(2)}×
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-5">
        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-5xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}>📊</div>
            <p className="text-base font-bold text-gray-800 dark:text-gray-200" style={{ fontFamily: "'Sora', sans-serif" }}>
              No stats yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              Complete your first meal to see lifetime stats
            </p>
          </div>
        ) : (
          <>
            {/* Lifetime stat grid */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                Lifetime Summary
              </p>
              <div className="grid grid-cols-2 gap-3">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                  <Card key={label}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                        <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{label}</p>
                      </div>
                      <p
                        className="text-lg font-bold text-gray-900 dark:text-gray-100"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Records */}
            {(bestMultiplierMeal || bestValueMeal || topRestaurant) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                  Personal Records
                </p>
                <div className="space-y-2">
                  {bestMultiplierMeal && (() => {
                    const level = getValueLevel(bestMultiplierMeal.valueMultiplier);
                    return (
                      <Card key="best-multi">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                              <p className="text-xs text-gray-400 dark:text-gray-500">Best Multiplier</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {bestMultiplierMeal.restaurantName}
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-sm font-bold px-2.5 py-1 rounded-full"
                            style={{ color: level.color, backgroundColor: `${level.color}15`, fontFamily: "'Sora', sans-serif" }}
                          >
                            {formatMultiplier(bestMultiplierMeal.valueMultiplier)}
                          </span>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {bestValueMeal && (
                    <Card key="best-value">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💰</span>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Highest Value Meal</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {bestValueMeal.restaurantName}
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-sm font-bold text-red-600"
                          style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                          {formatCurrency(bestValueMeal.menuValue)}
                        </span>
                      </CardContent>
                    </Card>
                  )}

                  {topRestaurant && topRestaurant.count > 1 && (
                    <Card key="fav-restaurant">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🍱</span>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Favourite Restaurant</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {topRestaurant.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {topRestaurant.count} visits
                        </span>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
            {/* Lifetime achievements */}
            {earnedCount > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: GOLD }}>
                  <Trophy className="h-3.5 w-3.5" />
                  Achievements ({earnedCount}/{ACHIEVEMENTS.length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {lifetimeAchievements.filter((a) => a.earned).map((achievement) => (
                    <Card key={achievement.id} style={{ boxShadow: '0 0 10px rgba(251,191,36,0.2)', border: '2px solid #FBBF24' }}>
                      <CardContent className="p-3 relative overflow-hidden">
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded-full">
                          ✓ Unlocked
                        </span>
                        <div className="text-2xl mb-1">{achievement.emoji}</div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">{achievement.name}</p>
                        {achievement.earned && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(achievement.earned.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {lifetimeAchievements.filter((a) => !a.earned).map((achievement) => (
                    <Card key={achievement.id} className="opacity-35">
                      <CardContent className="p-3">
                        <div className="text-2xl mb-1 grayscale">{achievement.emoji}</div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-tight">{achievement.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{achievement.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Settings bottom sheet */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl animate-fade-in max-w-lg mx-auto">
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-1" />

            {/* Appearance */}
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
                Appearance
              </p>
            </div>
            <button
              type="button"
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <Sun className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="flex-1 text-left">Light Mode</span>
              {theme === 'light' && (
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-t border-gray-100 dark:border-gray-800"
            >
              <Moon className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="flex-1 text-left">Dark Mode</span>
              {theme === 'dark' && (
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>

            {/* Account */}
            <div className="px-4 pt-4 pb-1 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
                Account
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setShowSettings(false); signOut(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Sign Out</span>
            </button>

            {/* Safe area spacer */}
            <div className="h-6" />
          </div>
        </>
      )}
    </div>
  );
}
