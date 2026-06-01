'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface BreakEvenBarProps {
  aycePrice: number;
  currentValue: number;
  className?: string;
}

const LEVELS = [
  { threshold: 0, label: 'Under Break-Even', color: '#ef4444', barClass: 'bg-red-400' },
  { threshold: 100, label: 'Break-Even Achieved', color: '#f97316', barClass: 'bg-orange-400' },
  { threshold: 150, label: 'Great Value', color: '#22c55e', barClass: 'bg-green-500' },
  { threshold: 250, label: 'Sushi Legend', color: '#8b5cf6', barClass: 'bg-purple-500' },
];

function getLevel(multiplier: number) {
  if (multiplier < 1) return LEVELS[0];
  if (multiplier < 1.5) return LEVELS[1];
  if (multiplier < 2.5) return LEVELS[2];
  return LEVELS[3];
}

export function BreakEvenBar({ aycePrice, currentValue, className }: BreakEvenBarProps) {
  const progress = aycePrice > 0 ? Math.min((currentValue / aycePrice) * 100, 100) : 0;
  const multiplier = aycePrice > 0 ? currentValue / aycePrice : 0;
  const level = getLevel(multiplier);
  const remaining = Math.max(aycePrice - currentValue, 0);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold" style={{ color: level.color }}>
          {level.label}
        </span>
        <span className="text-gray-500 text-xs">
          {progress >= 100 ? '✓ Break-even reached!' : `${formatCurrency(remaining)} to break-even`}
        </span>
      </div>
      <Progress
        value={progress}
        indicatorClassName={level.barClass}
        className="h-3"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>$0</span>
        <span className="font-medium text-gray-600">{formatCurrency(aycePrice)} AYCE</span>
        <span>{formatCurrency(aycePrice * 3)}</span>
      </div>
    </div>
  );
}
