'use client';

import Link from 'next/link';
import { Trash2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CompletedMeal } from '@/types';
import { formatCurrency, formatMultiplier, formatDateShort } from '@/lib/utils';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { getValueLevel } from '@/lib/calculations';

interface MealHistoryCardProps {
  meal: CompletedMeal;
  onDelete: (id: string) => void;
}

export function MealHistoryCard({ meal, onDelete }: MealHistoryCardProps) {
  const level = getValueLevel(meal.valueMultiplier);
  const topAchievement = ACHIEVEMENTS.find((a) => meal.achievements?.includes(a.id));

  return (
    <Link href={`/meal/${meal.id}`} className="block">
      <Card className="transition-all hover:shadow-md cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{meal.restaurantName}</p>
                {topAchievement && (
                  <span title={topAchievement.name}>{topAchievement.emoji}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-2">{formatDateShort(meal.date)}</p>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Paid</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(meal.aycePrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Value</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(meal.menuValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Savings</p>
                  <p className={`text-sm font-bold ${meal.savings >= 0 ? 'text-green-600' : 'text-orange-500'}`}>
                    {meal.savings >= 0 ? '+' : ''}{formatCurrency(meal.savings)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: level.color, backgroundColor: `${level.color}15` }}
                >
                  {formatMultiplier(meal.valueMultiplier)} · {level.label}
                </span>
                <span className="text-xs text-gray-400">{meal.itemCount} items</span>
              </div>
            </div>

            <button
              onClick={(e) => { e.preventDefault(); onDelete(meal.id); }}
              className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer shrink-0"
              title="Delete meal"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
