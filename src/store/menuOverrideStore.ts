'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MenuOverrideState {
  ayceQtyOverrides: Record<string, number>;
  priceOverrides: Record<string, number>;
  setAyceQty: (itemId: string, qty: number) => void;
  clearAyceQty: (itemId: string) => void;
  setPriceOverride: (itemId: string, price: number) => void;
  clearPriceOverride: (itemId: string) => void;
}

export const useMenuOverrideStore = create<MenuOverrideState>()(
  persist(
    (set) => ({
      ayceQtyOverrides: {},
      priceOverrides: {},
      setAyceQty: (itemId, qty) =>
        set((state) => ({
          ayceQtyOverrides: { ...state.ayceQtyOverrides, [itemId]: qty },
        })),
      clearAyceQty: (itemId) =>
        set((state) => {
          const { [itemId]: _removed, ...rest } = state.ayceQtyOverrides;
          return { ayceQtyOverrides: rest };
        }),
      setPriceOverride: (itemId, price) =>
        set((state) => ({
          priceOverrides: { ...state.priceOverrides, [itemId]: price },
        })),
      clearPriceOverride: (itemId) =>
        set((state) => {
          const { [itemId]: _removed, ...rest } = state.priceOverrides;
          return { priceOverrides: rest };
        }),
    }),
    {
      name: 'ayce-menu-overrides',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
