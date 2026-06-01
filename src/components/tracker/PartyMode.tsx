'use client';

import { useState } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMealStore } from '@/store/mealStore';
import { RESTAURANTS, getMenuForRestaurant } from '@/data/restaurants';
import { getPerDinerStats } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function PartyMode() {
  const { diners, addDiner, removeDiner, selectedDinerId, setSelectedDiner, selectedRestaurantId, items } =
    useMealStore();
  const [newName, setNewName] = useState('');

  const menu = selectedRestaurantId ? getMenuForRestaurant(selectedRestaurantId) : [];

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addDiner(trimmed);
    setNewName('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-red-600" />
          Party ({diners.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add diner */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add diner name..."
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} className="h-8 shrink-0">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* "Unassigned" option */}
        <button
          onClick={() => setSelectedDiner(null)}
          className={cn(
            'w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-left',
            selectedDinerId === null
              ? 'border-red-300 bg-red-50'
              : 'border-gray-100 hover:border-gray-200',
          )}
        >
          <span className="text-sm font-medium text-gray-700">Unassigned</span>
        </button>

        {/* Diners list */}
        {diners.map((diner) => {
          const stats = getPerDinerStats(items, menu, diner.id);
          const isSelected = selectedDinerId === diner.id;
          return (
            <div
              key={diner.id}
              className={cn(
                'flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer',
                isSelected ? 'border-2' : 'border-gray-100 hover:border-gray-200',
              )}
              style={isSelected ? { borderColor: diner.color, backgroundColor: `${diner.color}10` } : {}}
              onClick={() => setSelectedDiner(isSelected ? null : diner.id)}
            >
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: diner.color }}
              >
                {diner.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{diner.name}</p>
                {stats.count > 0 && (
                  <p className="text-xs text-gray-500">
                    {stats.count} items · {formatCurrency(stats.total)}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeDiner(diner.id); }}
                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
