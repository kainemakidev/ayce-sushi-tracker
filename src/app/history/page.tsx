'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealHistoryCard } from '@/components/history/MealHistoryCard';
import { LifetimeStats } from '@/components/history/LifetimeStats';
import { useHistoryStore } from '@/store/historyStore';

const HEADER_GRADIENT = 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)';
const GOLD = '#F39C12';

export default function HistoryPage() {
  const { meals, deleteMeal, clearHistory } = useHistoryStore();
  const [confirmClear, setConfirmClear] = useState(false);

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
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs cursor-pointer"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { clearHistory(); setConfirmClear(false); }}
                className="text-xs font-semibold cursor-pointer"
                style={{ color: '#F8C471' }}
              >
                Clear All
              </button>
            </div>
          )}
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
              <MealHistoryCard key={meal.id} meal={meal} onDelete={deleteMeal} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
