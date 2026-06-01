'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ConsumptionRecord, Diner } from '@/types';
import { generateId } from '@/lib/utils';

const DINER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

interface MealState {
  selectedRestaurantId: string | null;
  selectedAycePrice: number | null;
  selectedPricingLabel: string | null;
  cashPayment: boolean;
  mealStarted: boolean;
  mealStartTime: string | null;
  items: ConsumptionRecord[];
  diners: Diner[];
  partyModeEnabled: boolean;
  selectedDinerId: string | null;

  startMeal: (restaurantId: string, aycePrice: number, pricingLabel: string, cashPayment: boolean) => void;
  addItem: (itemId: string, dinerId?: string) => void;
  decrementItem: (itemId: string, dinerId?: string) => void;
  removeItem: (itemId: string, dinerId?: string) => void;
  setQuantity: (itemId: string, quantity: number, dinerId?: string) => void;
  clearMeal: () => void;
  addDiner: (name: string) => void;
  removeDiner: (id: string) => void;
  togglePartyMode: (enabled: boolean) => void;
  setSelectedDiner: (id: string | null) => void;
}

export const useMealStore = create<MealState>()(
  persist(
    (set) => ({
      selectedRestaurantId: null,
      selectedAycePrice: null,
      selectedPricingLabel: null,
      cashPayment: false,
      mealStarted: false,
      mealStartTime: null,
      items: [],
      diners: [],
      partyModeEnabled: false,
      selectedDinerId: null,

      startMeal: (restaurantId, aycePrice, pricingLabel, cashPayment) =>
        set({
          selectedRestaurantId: restaurantId,
          selectedAycePrice: aycePrice,
          selectedPricingLabel: pricingLabel,
          cashPayment,
          mealStarted: true,
          mealStartTime: new Date().toISOString(),
          items: [],
          diners: [],
          partyModeEnabled: false,
          selectedDinerId: null,
        }),

      addItem: (itemId, dinerId) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (r) => r.itemId === itemId && r.dinerId === dinerId,
          );
          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + 1,
            };
            return { items: updated };
          }
          return { items: [...state.items, { itemId, quantity: 1, dinerId }] };
        }),

      decrementItem: (itemId, dinerId) =>
        set((state) => {
          const idx = state.items.findIndex(
            (r) => r.itemId === itemId && r.dinerId === dinerId,
          );
          if (idx < 0) return state;
          const current = state.items[idx];
          if (current.quantity <= 1) {
            return { items: state.items.filter((_, i) => i !== idx) };
          }
          const updated = [...state.items];
          updated[idx] = { ...current, quantity: current.quantity - 1 };
          return { items: updated };
        }),

      removeItem: (itemId, dinerId) =>
        set((state) => ({
          items: state.items.filter(
            (r) => !(r.itemId === itemId && r.dinerId === dinerId),
          ),
        })),

      setQuantity: (itemId, quantity, dinerId) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (r) => !(r.itemId === itemId && r.dinerId === dinerId),
              ),
            };
          }
          const idx = state.items.findIndex(
            (r) => r.itemId === itemId && r.dinerId === dinerId,
          );
          if (idx >= 0) {
            const updated = [...state.items];
            updated[idx] = { ...updated[idx], quantity };
            return { items: updated };
          }
          return { items: [...state.items, { itemId, quantity, dinerId }] };
        }),

      clearMeal: () =>
        set({
          items: [],
          mealStarted: false,
          mealStartTime: null,
          selectedRestaurantId: null,
          selectedAycePrice: null,
          selectedPricingLabel: null,
          cashPayment: false,
          diners: [],
          partyModeEnabled: false,
          selectedDinerId: null,
        }),

      addDiner: (name) =>
        set((state) => ({
          diners: [
            ...state.diners,
            {
              id: generateId(),
              name,
              color: DINER_COLORS[state.diners.length % DINER_COLORS.length],
            },
          ],
        })),

      removeDiner: (id) =>
        set((state) => ({
          diners: state.diners.filter((d) => d.id !== id),
          selectedDinerId: state.selectedDinerId === id ? null : state.selectedDinerId,
        })),

      togglePartyMode: (enabled) => set({ partyModeEnabled: enabled }),
      setSelectedDiner: (id) => set({ selectedDinerId: id }),
    }),
    {
      name: 'ayce-meal-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
