'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealHistoryCard } from '@/components/history/MealHistoryCard';
import { LifetimeStats } from '@/components/history/LifetimeStats';
import { useMeals } from '@/hooks/useMeals';

const HEADER_GRADIENT = 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)';
const GOLD = '#F39C12';

export default function HistoryPage() {
  const { meals, deleteMeal, clearHistory } = useMeals();
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <div className="text-6xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}>🍱</div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Sora', sans-serif" }}>
          No feasts yet
        </h1>
        <p className="text-sm text-center text-gray-400 dark:text-gray-500">
          Your meal history will appear here
        </p>
        <Link href="/">
          <Button>Start Your First Meal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 text-white" style={{ background: HEADER_GRADIENT }}>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
            >
              Past Meals
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {meals.length} meal{meals.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <button
            onClick={() => setConfirmClear(true)}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            aria-label="Delete all meals"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Lifetime stats */}
        <LifetimeStats meals={meals} />

        {/* Meal list */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            All Meals
          </h2>
          <div className="space-y-2">
            {meals.map((meal) => (
              <MealHistoryCard key={meal.id} meal={meal} onDelete={(id) => setDeletingMealId(id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Single meal delete confirmation */}
      {deletingMealId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setDeletingMealId(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl p-5 shadow-2xl max-w-lg mx-auto animate-fade-in">
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🗑️</div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">Delete this meal?</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingMealId(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { deleteMeal(deletingMealId); setDeletingMealId(null); }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
            <div className="h-4" />
          </div>
        </>
      )}

      {/* Clear all confirmation */}
      {confirmClear && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmClear(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl p-5 shadow-2xl max-w-lg mx-auto animate-fade-in">
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🗑️</div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">Delete all {meals.length} meals?</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { clearHistory(); setConfirmClear(false); }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold cursor-pointer"
              >
                Delete All
              </button>
            </div>
            <div className="h-4" />
          </div>
        </>
      )}
    </div>
  );
}
