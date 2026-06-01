'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronDown, CreditCard, Banknote, Clock, Plus, Minus, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RESTAURANTS, getDefaultTier, getSessionInfo } from '@/data/restaurants';
import { useMealStore } from '@/store/mealStore';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const DINER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { startMeal } = useMealStore();

  const restaurant = RESTAURANTS.find((r) => r.id === id);
  const session = getSessionInfo();
  const defaultTier = restaurant ? getDefaultTier(restaurant) : null;

  const [selectedTierId, setSelectedTierId] = useState(defaultTier?.id ?? '');
  const [cashPayment, setCashPayment] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [groupSize, setGroupSize] = useState(1);
  const [names, setNames] = useState<string[]>(['']);

  if (!restaurant || !defaultTier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Restaurant not found</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  const tier = restaurant.pricingTiers.find((t) => t.id === selectedTierId) ?? defaultTier;
  const pricePerPerson = cashPayment ? tier.cashPrice : tier.price;
  const cashSaving = tier.price - tier.cashPrice;

  const updateGroupSize = (next: number) => {
    const clamped = Math.max(1, Math.min(10, next));
    setGroupSize(clamped);
    setNames((prev) => {
      const updated = [...prev];
      while (updated.length < clamped) updated.push('');
      return updated.slice(0, clamped);
    });
  };

  const handleStart = () => {
    const diners = names.map((name, i) => ({
      name: name.trim() || `Person ${i + 1}`,
      color: DINER_COLORS[i % DINER_COLORS.length],
    }));
    startMeal(restaurant.id, pricePerPerson, tier.label, cashPayment, diners);
    router.push('/tracker');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-5 pt-12 pb-6 text-white">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-red-200 hover:text-white transition-colors mb-4 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            🍱
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">{restaurant.name}</h1>
            {restaurant.address && (
              <p className="text-xs text-red-200 mt-0.5">{restaurant.address}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* ── Pricing ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Pricing
          </h2>

          {/* Auto-detected session */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        session.isOpen ? 'bg-green-500' : 'bg-gray-400',
                      )}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.statusLabel}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                    {tier.label}
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(tier.price)}
              </p>
            </div>
          </div>

          {/* Override toggle */}
          <button
            type="button"
            onClick={() => setShowOverride((v) => !v)}
            className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            <ChevronDown
              className={cn('h-3 w-3 transition-transform duration-200', showOverride && 'rotate-180')}
            />
            {showOverride ? 'Hide options' : 'Different session?'}
          </button>

          {/* Override grid */}
          <div
            className="grid transition-all duration-300 ease-in-out"
            style={{ gridTemplateRows: showOverride ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="grid grid-cols-2 gap-2 pb-1">
                {restaurant.pricingTiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTierId(t.id)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all cursor-pointer',
                      selectedTierId === t.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/40'
                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600',
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs font-semibold leading-tight',
                        selectedTierId === t.id
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-gray-600 dark:text-gray-300',
                      )}
                    >
                      {t.label}
                    </p>
                    <p
                      className={cn(
                        'text-base font-bold mt-0.5',
                        selectedTierId === t.id ? 'text-red-600' : 'text-gray-800 dark:text-gray-100',
                      )}
                    >
                      {formatCurrency(t.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cash / Card toggle */}
          <div className="flex rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setCashPayment(false)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all cursor-pointer',
                !cashPayment
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
              )}
            >
              <CreditCard className="h-4 w-4" />
              Card
            </button>
            <button
              type="button"
              onClick={() => setCashPayment(true)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all cursor-pointer',
                cashPayment
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
              )}
            >
              <Banknote className="h-4 w-4" />
              Cash
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-bold',
                  cashPayment
                    ? 'bg-white/20 text-white'
                    : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
                )}
              >
                −10%
              </span>
            </button>
          </div>

          {/* Price per person summary */}
          <div
            className={cn(
              'flex items-center justify-between p-3 rounded-xl',
              cashPayment
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
            )}
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Price per person</p>
              <div className="flex items-baseline gap-2">
                <p
                  className={cn(
                    'text-2xl font-bold',
                    cashPayment ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-50',
                  )}
                >
                  {formatCurrency(pricePerPerson)}
                </p>
                {cashPayment && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    saving {formatCurrency(cashSaving)} each
                  </p>
                )}
              </div>
            </div>
            {cashPayment && <Banknote className="h-8 w-8 text-green-400" />}
          </div>
        </section>

        {/* ── Group ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Group
          </h2>

          {/* Group size counter */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">How many people?</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {groupSize === 1
                  ? 'Just you'
                  : `${groupSize} people · ${formatCurrency(pricePerPerson * groupSize)} total`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateGroupSize(groupSize - 1)}
                disabled={groupSize <= 1}
                className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 min-w-[20px] text-center">
                {groupSize}
              </span>
              <button
                type="button"
                onClick={() => updateGroupSize(groupSize + 1)}
                disabled={groupSize >= 10}
                className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Name inputs */}
          <div className="space-y-2">
            {names.map((name, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: DINER_COLORS[i % DINER_COLORS.length] }}
                >
                  {name.trim() ? (
                    name.trim()[0].toUpperCase()
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const updated = [...names];
                    updated[i] = e.target.value;
                    setNames(updated);
                  }}
                  placeholder={`Person ${i + 1}`}
                  maxLength={20}
                  className="flex-1 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-400 dark:focus:border-red-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Start button */}
        <Button className="w-full gap-2" size="lg" onClick={handleStart}>
          🍣 Start Meal
        </Button>
      </div>
    </div>
  );
}
