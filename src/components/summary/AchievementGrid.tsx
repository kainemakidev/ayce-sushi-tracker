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
              className="p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200"
            >
              <div className="text-2xl mb-1">{achievement.emoji}</div>
              <p className="text-xs font-bold text-gray-900">{achievement.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{achievement.description}</p>
            </div>
          ))}
          {locked.map((achievement) => (
            <div
              key={achievement.id}
              className="p-3 rounded-xl bg-gray-50 border border-gray-100 opacity-50"
            >
              <div className="text-2xl mb-1 grayscale">{achievement.emoji}</div>
              <p className="text-xs font-bold text-gray-500">{achievement.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{achievement.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
