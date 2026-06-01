'use client';

import { TrendingUp, Award, Utensils, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompletedMeal } from '@/types';
import { formatCurrency, formatMultiplier } from '@/lib/utils';

interface LifetimeStatsProps {
  meals: CompletedMeal[];
}

export function LifetimeStats({ meals }: LifetimeStatsProps) {
  if (meals.length === 0) return null;

  const lifetimeSavings = meals.reduce((sum, m) => sum + m.savings, 0);
  const avgValue = meals.reduce((sum, m) => sum + m.menuValue, 0) / meals.length;
  const avgSavings = meals.reduce((sum, m) => sum + m.savings, 0) / meals.length;
  const bestMeal = meals.reduce((best, m) => (m.menuValue > best.menuValue ? m : best));
  const bestMultiplier = meals.reduce((best, m) =>
    m.valueMultiplier > best.valueMultiplier ? m : best,
  );

  const stats = [
    { label: 'Meals Tracked', value: meals.length.toString(), icon: Utensils, color: '#ef4444' },
    { label: 'Lifetime Savings', value: formatCurrency(lifetimeSavings), icon: DollarSign, color: '#22c55e' },
    { label: 'Avg Meal Value', value: formatCurrency(avgValue), icon: TrendingUp, color: '#3b82f6' },
    { label: 'Avg Savings', value: formatCurrency(avgSavings), icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Best Value', value: formatCurrency(bestMeal.menuValue), icon: Award, color: '#f97316' },
    { label: 'Best Multiplier', value: formatMultiplier(bestMultiplier.valueMultiplier), icon: Award, color: '#eab308' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4 text-yellow-500" />
          Lifetime Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
