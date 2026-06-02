'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface BreakEvenBarProps {
  aycePrice: number;
  currentValue: number;
  className?: string;
}

const LEVELS = [
  { threshold: 0,   label: 'Under Break-Even',    color: '#E74C3C' },
  { threshold: 100, label: 'Break-Even Achieved',  color: '#F39C12' },
  { threshold: 150, label: 'Great Value',           color: '#27AE60' },
  { threshold: 250, label: 'Sushi Legend',          color: '#8b5cf6' },
];

const BAR_GRADIENTS: Record<string, string> = {
  '#E74C3C': 'linear-gradient(90deg, #E74C3C, #f97316)',
  '#F39C12': 'linear-gradient(90deg, #F39C12, #F8C471)',
  '#27AE60': 'linear-gradient(90deg, #27AE60, #2ECC71)',
  '#8b5cf6': 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
};

function getLevel(multiplier: number) {
  if (multiplier < 1)   return LEVELS[0];
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
        <span className="font-semibold" style={{ color: level.color }}>{level.label}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {progress >= 100 ? '✓ Break-even reached!' : `${formatCurrency(remaining)} to break-even`}
        </span>
      </div>

      {/* Progress track */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E8E6E0' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: BAR_GRADIENTS[level.color] ?? BAR_GRADIENTS['#27AE60'],
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>$0</span>
        <span className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(aycePrice)} AYCE</span>
        <span>{formatCurrency(aycePrice * 3)}</span>
      </div>
    </div>
  );
}
