'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHistoryStore } from '@/store/historyStore';
import { loadMealsFromFirestore, saveMealToFirestore } from '@/lib/firestoreService';
import { LoginScreen } from './LoginScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { setMeals, clearHistory } = useHistoryStore();
  const prevUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (prevUidRef.current) {
        clearHistory(); // Clear local data when a user signs out
      }
      prevUidRef.current = null;
      return;
    }

    if (prevUidRef.current === user.uid) return; // Same session, skip re-sync
    prevUidRef.current = user.uid;

    // Sync meals from Firestore on sign-in
    loadMealsFromFirestore(user.uid)
      .then(async (firestoreMeals) => {
        if (firestoreMeals.length > 0) {
          setMeals(firestoreMeals);
        } else {
          // No Firestore data — migrate any existing local meals up
          const localMeals = useHistoryStore.getState().meals;
          if (localMeals.length > 0) {
            await Promise.all(
              localMeals.map((m) => saveMealToFirestore(user.uid, m).catch(console.error)),
            );
          }
        }
      })
      .catch(console.error);
  }, [user, loading]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#FAFAF8' }}
      >
        <div className="text-5xl animate-bounce">🍣</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
