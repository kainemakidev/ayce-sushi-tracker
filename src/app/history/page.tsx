'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MealHistoryCard } from '@/components/history/MealHistoryCard';
import { LifetimeStats } from '@/components/history/LifetimeStats';
import { useHistoryStore } from '@/store/historyStore';

export default function HistoryPage() {
  const { meals, deleteMeal, clearHistory } = useHistoryStore();
  const [confirmClear, setConfirmClear] = useState(false);

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <div className="text-5xl">📜</div>
        <h1 className="text-xl font-bold text-gray-900">No meals yet</h1>
        <p className="text-sm text-gray-400 text-center">
          Complete a meal to see it here
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
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meal History</h1>
            <p className="text-sm text-gray-400">{meals.length} meals tracked</p>
          </div>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs text-gray-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearHistory(); setConfirmClear(false); }}
                className="text-xs text-red-600 font-semibold cursor-pointer"
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
