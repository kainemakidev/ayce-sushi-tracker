'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMealStore } from '@/store/mealStore';
import { RESTAURANTS, getMenuForRestaurant } from '@/data/restaurants';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/types';

interface ConfirmationEntry {
  item: MenuItem;
  quantity: number;
  timestamp: number;
}

export function FastEntryInput() {
  const { selectedRestaurantId, items, addItem } = useMealStore();
  const [query, setQuery] = useState('');
  const [confirmations, setConfirmations] = useState<ConfirmationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const menu = useMemo(
    () => (selectedRestaurantId ? getMenuForRestaurant(selectedRestaurantId) : []),
    [selectedRestaurantId],
  );

  const restaurant = RESTAURANTS.find((r) => r.id === selectedRestaurantId);

  // Always keep focus on input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const findItem = useCallback(
    (q: string): MenuItem | null => {
      const upper = q.toUpperCase().trim();
      // Exact code match first
      const byCode = menu.find((m) => m.code.toUpperCase() === upper);
      if (byCode) return byCode;
      // Partial name match
      const byName = menu.find((m) => m.name.toUpperCase().includes(upper));
      return byName || null;
    },
    [menu],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;

      const item = findItem(q);
      if (!item) {
        setError(`"${q}" not found`);
        setTimeout(() => setError(null), 1500);
        return;
      }

      addItem(item.id);
      setError(null);

      setConfirmations((prev) => {
        const existing = prev.findIndex((c) => c.item.id === item.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1, timestamp: Date.now() };
          return updated;
        }
        return [{ item, quantity: 1, timestamp: Date.now() }, ...prev.slice(0, 9)];
      });

      setQuery('');
    }
  };

  // Get current quantity for item
  const getQty = (itemId: string) =>
    items.filter((r) => r.itemId === itemId).reduce((sum, r) => sum + r.quantity, 0);

  const preview = query.trim() ? findItem(query.trim()) : null;

  return (
    <div className="space-y-4">
      {/* Input area */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm font-semibold text-gray-700">
              Type a menu code and press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border border-gray-200 font-mono">Enter</kbd>
            </p>
          </div>

          {/* Main input */}
          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value.toUpperCase()); setError(null); }}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => inputRef.current?.focus(), 50)}
              placeholder="S01, R03, A02..."
              className={cn(
                'w-full text-3xl font-mono font-bold text-center py-5 px-4 border-2 rounded-xl focus:outline-none transition-all tracking-widest uppercase',
                error
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : preview
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-red-400 focus:bg-white',
              )}
            />
          </div>

          {/* Preview / Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-sm text-red-600 font-medium">{error}</span>
            </div>
          )}
          {preview && !error && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-semibold text-gray-900">{preview.name}</p>
                <p className="text-xs text-gray-500">{preview.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">{formatCurrency(preview.price)}</p>
                <p className="text-xs text-green-700 font-medium">↵ to add</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent entries */}
      {confirmations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
            Session Log
          </p>
          <div className="space-y-1.5">
            {confirmations.map((entry, i) => {
              const current = getQty(entry.item.id);
              return (
                <div
                  key={`${entry.item.id}-${entry.timestamp}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border bg-white transition-all',
                    i === 0 ? 'border-green-200 bg-green-50' : 'border-gray-100',
                  )}
                >
                  <CheckCircle
                    className={cn('h-4 w-4 shrink-0', i === 0 ? 'text-green-500' : 'text-gray-300')}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{entry.item.code}</span>
                      <span className="text-sm font-medium text-gray-900 truncate">{entry.item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-red-600">×{current}</span>
                    <span className="text-xs text-gray-500">{formatCurrency(entry.item.price * current)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="text-center py-2">
        <p className="text-xs text-gray-400">
          Input is always focused. Type any code and press Enter to track.
        </p>
      </div>
    </div>
  );
}
