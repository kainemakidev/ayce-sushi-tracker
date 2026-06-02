'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CompletedMeal } from '@/types';

interface HistoryState {
  meals: CompletedMeal[];
  saveMeal: (meal: CompletedMeal) => void;
  deleteMeal: (id: string) => void;
  clearHistory: () => void;
  setMeals: (meals: CompletedMeal[]) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      meals: [],

      saveMeal: (meal) =>
        set((state) => ({
          meals: [meal, ...state.meals],
        })),

      deleteMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        })),

      clearHistory: () => set({ meals: [] }),

      setMeals: (meals) => set({ meals }),
    }),
    {
      name: 'ayce-history-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
