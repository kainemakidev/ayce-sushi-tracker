'use client';

import { useRef, useState } from 'react';
import { Share2, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { formatCurrency, formatMultiplier, formatDateShort } from '@/lib/utils';
import type { MealCalculation } from '@/types';

interface ShareCardProps {
  restaurantName: string;
  date: string;
  stats: MealCalculation;
  earnedAchievementIds: string[];
}

export function ShareCard({ restaurantName, date, stats, earnedAchievementIds }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const topAchievement = ACHIEVEMENTS.find((a) => earnedAchievementIds.at(-1) === a.id);
  const isProfit = stats.totalMenuValue >= stats.aycePrice;

  const shareText = `🍣 ${restaurantName} — ${formatDateShort(date)}
💰 Paid: ${formatCurrency(stats.aycePrice)}
🏷️ Value: ${formatCurrency(stats.totalMenuValue)}
💚 Savings: ${formatCurrency(stats.savings)}
📊 Multiplier: ${formatMultiplier(stats.valueMultiplier)}
${topAchievement ? `🏆 ${topAchievement.emoji} ${topAchievement.name}` : ''}
#AYCESushi #SushiValue`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My AYCE Sushi Stats', text: shareText });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-3">
      {/* Visual card */}
      <div className="relative overflow-hidden rounded-2xl text-white p-5" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #1f0505 100%)',
      }}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium opacity-75">🍣 AYCE Sushi Tracker</p>
              <p className="text-lg font-bold mt-0.5">{restaurantName}</p>
              <p className="text-xs opacity-60">{formatDateShort(date)}</p>
            </div>
            {topAchievement && (
              <div className="text-3xl">{topAchievement.emoji}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs opacity-75">Paid</p>
              <p className="text-xl font-bold">{formatCurrency(stats.aycePrice)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs opacity-75">À La Carte Value</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalMenuValue)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs opacity-75">Savings</p>
              <p className="text-xl font-bold text-green-300">
                {stats.savings >= 0 ? '+' : ''}{formatCurrency(stats.savings)}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs opacity-75">Multiplier</p>
              <p className="text-xl font-bold text-yellow-300">{formatMultiplier(stats.valueMultiplier)}</p>
            </div>
          </div>

          {topAchievement && (
            <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-lg">{topAchievement.emoji}</span>
              <div>
                <p className="text-sm font-bold">{topAchievement.name}</p>
                <p className="text-xs opacity-75">{topAchievement.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share button */}
      <Button onClick={handleShare} className="w-full gap-2">
        {copied ? (
          <><Check className="h-4 w-4" /> Copied!</>
        ) : (
          <><Share2 className="h-4 w-4" /> Share Results</>
        )}
      </Button>
    </div>
  );
}
