'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEffectivePortionInfo } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';
import type { Diner, ConsumptionRecord, MenuItem } from '@/types';

interface Props {
  diners: Diner[];
  items: ConsumptionRecord[];
  menu: MenuItem[];
  ayceQtyOverrides?: Record<string, number>;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function PartyLeaderboard({ diners, items, menu, ayceQtyOverrides }: Props) {
  const ranked = useMemo(() => {
    const menuMap = new Map(menu.map((m) => [m.id, m]));

    return diners
      .map((diner) => {
        const dinerItems = items.filter((r) => r.dinerId === diner.id && r.quantity > 0);
        let value = 0;
        let itemCount = 0;
        for (const record of dinerItems) {
          const menuItem = menuMap.get(record.itemId);
          if (!menuItem) continue;
          const { portionRatio } = getEffectivePortionInfo(menuItem, ayceQtyOverrides);
          value += menuItem.price * portionRatio * record.quantity;
          itemCount += record.quantity;
        }
        return { diner, value, itemCount, uniqueCount: dinerItems.length };
      })
      .sort((a, b) => b.value - a.value);
  }, [diners, items, menu, ayceQtyOverrides]);

  if (diners.length < 2) return null;

  const winner = ranked[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Party Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ranked.map((entry, i) => {
          const isWinner = i === 0;
          const pct = winner.value > 0 ? (entry.value / winner.value) * 100 : 0;
          return (
            <div
              key={entry.diner.id}
              className="flex items-center gap-3"
            >
              <span className="text-lg w-6 text-center shrink-0">
                {MEDALS[i] ?? `${i + 1}`}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: entry.diner.color }}
                >
                  {entry.diner.name[0].toUpperCase()}
                </span>
                <span className={`text-sm font-semibold ${isWinner ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                  {entry.diner.name}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: entry.diner.color }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${isWinner ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatCurrency(entry.value)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{entry.itemCount} items</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
