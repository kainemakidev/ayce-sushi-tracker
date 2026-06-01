'use client';

import { useState } from 'react';
import { Banknote, CreditCard, Users, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Diner } from '@/types';

const TIP_OPTIONS = [
  { label: '0%', value: 0 },
  { label: '15%', value: 0.15 },
  { label: '18%', value: 0.18 },
  { label: '20%', value: 0.20 },
];

interface BillSplitProps {
  aycePrice: number;
  diners: Diner[];
  cashPayment: boolean;
}

export function BillSplit({ aycePrice, diners, cashPayment }: BillSplitProps) {
  const [tipRate, setTipRate] = useState(0.18);
  const [splitBill, setSplitBill] = useState(diners.length > 1);

  const groupSize = Math.max(diners.length, 1);
  const subtotal = aycePrice * groupSize;
  const tipAmount = subtotal * tipRate;
  const total = subtotal + tipAmount;
  const perPerson = total / groupSize;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4 text-red-600" />
          Bill
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tip selector */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tip</p>
          <div className="grid grid-cols-4 gap-1.5">
            {TIP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTipRate(opt.value)}
                className={cn(
                  'py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                  tipRate === opt.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>
              {groupSize} × {formatCurrency(aycePrice)}
            </span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {tipRate > 0 && (
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Tip ({Math.round(tipRate * 100)}%)</span>
              <span>{formatCurrency(tipAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 pt-1.5 border-t border-gray-100 dark:border-gray-800">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* One bill / Split toggle — only relevant for groups */}
        {diners.length > 1 && (
          <>
            <div className="flex rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setSplitBill(false)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all cursor-pointer',
                  !splitBill
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                )}
              >
                <CreditCard className="h-4 w-4" />
                One Bill
              </button>
              <button
                type="button"
                onClick={() => setSplitBill(true)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all cursor-pointer',
                  splitBill
                    ? 'bg-red-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                )}
              >
                <Users className="h-4 w-4" />
                Split
              </button>
            </div>

            {splitBill ? (
              <div className="space-y-2">
                {diners.map((diner) => (
                  <div
                    key={diner.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: diner.color }}
                      >
                        {diner.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {diner.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(perPerson)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Total for {groupSize} people
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(total)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatCurrency(perPerson)} per person
                </p>
              </div>
            )}
          </>
        )}

        {/* Single person total */}
        {diners.length <= 1 && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(total)}
            </p>
          </div>
        )}

        {cashPayment && (
          <p className="text-xs text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-1">
            <Banknote className="h-3.5 w-3.5" />
            Cash discount (−10%) already applied
          </p>
        )}
      </CardContent>
    </Card>
  );
}
