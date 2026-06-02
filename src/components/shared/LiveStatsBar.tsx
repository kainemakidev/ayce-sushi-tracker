'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { useMealStore } from '@/store/mealStore';
import { useMenuOverrideStore } from '@/store/menuOverrideStore';
import { getMenuForRestaurant } from '@/data/restaurants';
import { calculateMealStats } from '@/lib/calculations';
import { formatCurrency, formatMultiplier } from '@/lib/utils';

export function LiveStatsBar() {
  const { selectedRestaurantId, selectedAycePrice, items, diners } = useMealStore();
  const { ayceQtyOverrides } = useMenuOverrideStore();
  const [showToast, setShowToast] = useState(false);
  const prevWasBelow = useRef<boolean | null>(null);

  const stats = useMemo(() => {
    if (!selectedRestaurantId || !selectedAycePrice) return null;
    const menu = getMenuForRestaurant(selectedRestaurantId);
    const groupSize = diners.length || 1;
    return calculateMealStats(items, menu, selectedAycePrice * groupSize, ayceQtyOverrides);
  }, [selectedRestaurantId, selectedAycePrice, items, diners, ayceQtyOverrides]);

  useEffect(() => {
    if (!stats) return;
    const isAbove = stats.valueMultiplier >= 1;
    if (prevWasBelow.current === true && isAbove) {
      prevWasBelow.current = false; // mark as above before returning so it won't re-fire
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 3500);
      return () => clearTimeout(t);
    }
    prevWasBelow.current = !isAbove;
  }, [stats?.valueMultiplier]);

  if (!stats) return null;

  const isProfit = stats.totalMenuValue >= stats.aycePrice;
  const progress = Math.min(100, stats.breakEvenProgress);

  return (
    <>
      <div
        className="text-white"
        style={{ background: isProfit ? 'linear-gradient(135deg, #1a7a46, #27AE60)' : 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)' }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold leading-none" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
              {formatCurrency(stats.totalMenuValue)}
            </span>
            <span className="text-xs opacity-70">value</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ opacity: 0.85 }}>
            <span>{stats.itemCount} item{stats.itemCount !== 1 ? 's' : ''}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span className="font-semibold">{formatMultiplier(stats.valueMultiplier)}</span>
          </div>
        </div>
        {/* Break-even progress bar */}
        <div className="h-1 w-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, backgroundColor: 'rgba(255,255,255,0.75)' }}
          />
        </div>
      </div>

      {/* Break-even milestone toast */}
      {showToast && (
        <div
          className="fixed bottom-20 left-4 right-4 z-50 rounded-xl p-3 flex items-center gap-3 shadow-2xl animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #1a7a46, #27AE60)', color: '#fff' }}
        >
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>Break-Even Reached!</p>
            <p className="text-xs opacity-80">You're in the profit zone — keep eating!</p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-auto text-white/60 hover:text-white cursor-pointer text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
