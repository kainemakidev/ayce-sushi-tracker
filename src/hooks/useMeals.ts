'use client';

import { useAuth } from '@/context/AuthContext';
import { useHistoryStore } from '@/store/historyStore';
import {
  saveMealToFirestore,
  deleteMealFromFirestore,
  clearMealsFromFirestore,
} from '@/lib/firestoreService';
import type { CompletedMeal } from '@/types';

/**
 * Drop-in replacement for useHistoryStore that mirrors mutations to Firestore
 * when a user is signed in.
 */
export function useMeals() {
  const { user } = useAuth();
  const store = useHistoryStore();

  const saveMeal = (meal: CompletedMeal) => {
    store.saveMeal(meal);
    if (user) saveMealToFirestore(user.uid, meal).catch(console.error);
  };

  const deleteMeal = (id: string) => {
    store.deleteMeal(id);
    if (user) deleteMealFromFirestore(user.uid, id).catch(console.error);
  };

  const clearHistory = () => {
    store.clearHistory();
    if (user) clearMealsFromFirestore(user.uid).catch(console.error);
  };

  return { meals: store.meals, saveMeal, deleteMeal, clearHistory };
}
