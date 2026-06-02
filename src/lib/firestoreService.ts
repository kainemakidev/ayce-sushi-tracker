import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CompletedMeal } from '@/types';

function mealsCol(userId: string) {
  return collection(db, 'users', userId, 'meals');
}

export async function loadMealsFromFirestore(userId: string): Promise<CompletedMeal[]> {
  const q = query(mealsCol(userId), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CompletedMeal);
}

export async function saveMealToFirestore(userId: string, meal: CompletedMeal): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'meals', meal.id), meal);
}

export async function deleteMealFromFirestore(userId: string, mealId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'meals', mealId));
}

export async function clearMealsFromFirestore(userId: string): Promise<void> {
  const snap = await getDocs(mealsCol(userId));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
