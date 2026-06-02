'use client';

import { useAuth } from '@/context/AuthContext';
import { useMeals } from '@/hooks/useMeals';
import { useTheme } from '@/components/shared/ThemeProvider';
import { Sun, Moon, LogOut } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const HEADER_GRADIENT = 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)';
const GOLD = '#F39C12';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { meals, clearHistory } = useMeals();
  const { theme, toggleTheme } = useTheme();

  const lifetimeSavings = meals.reduce((s, m) => s + m.savings, 0);
  const avgMultiplier =
    meals.length > 0
      ? meals.reduce((s, m) => s + m.valueMultiplier, 0) / meals.length
      : 0;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-12 pb-8 text-white" style={{ background: HEADER_GRADIENT }}>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover"
              style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }}
            />
          ) : (
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {user?.displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0">
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

        {/* Mini stats */}
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
        {/* Appearance */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Appearance
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
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
            <div className="border-t border-gray-100 dark:border-gray-800" />
            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <Moon className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="flex-1 text-left">Dark Mode</span>
              {theme === 'dark' && (
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Account
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
