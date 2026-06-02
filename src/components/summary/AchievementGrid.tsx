'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface AchievementGridProps {
  earnedIds: string[];
}

export function AchievementGrid({ earnedIds }: AchievementGridProps) {
  const earned = ACHIEVEMENTS.filter((a) => earnedIds.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !earnedIds.includes(a.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Achievements ({earned.length}/{ACHIEVEMENTS.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {earned.map((achievement) => (
            <div
              key={achievement.id}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 border-2 border-yellow-400 dark:border-yellow-600 relative overflow-hidden"
              style={{ boxShadow: '0 0 12px rgba(251,191,36,0.25)' }}
            >
              <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-200 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded-full">
                ✓ Unlocked
              </span>
              <div className="text-2xl mb-1">{achievement.emoji}</div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">{achievement.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{achievement.description}</p>
            </div>
          ))}
          {locked.map((achievement) => (
            <div
              key={achievement.id}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-40"
            >
              <div className="text-2xl mb-1 grayscale">{achievement.emoji}</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-tight">{achievement.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{achievement.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
