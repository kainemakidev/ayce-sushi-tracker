'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Sign-in failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)' }}
    >
      {/* Branding */}
      <div className="text-center text-white mb-12">
        <div className="text-7xl mb-5">🍣</div>
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}
        >
          RollCall
        </h1>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.72)' }}>
          Know your value, every bite.
        </p>
      </div>

      {/* Sign-in card */}
      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={handleSignIn}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 bg-white px-6 py-3.5 rounded-2xl font-semibold text-gray-800 text-sm shadow-xl hover:shadow-2xl active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {/* Google G logo */}
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.3-5.2C29.5 35.5 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C9.7 39.7 16.3 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.4 5.7l6.3 5.2C40.9 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z" />
          </svg>
          {busy ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && (
          <p className="text-sm text-center px-4 py-2 rounded-xl" style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' }}>
            {error}
          </p>
        )}
      </div>

      <p className="mt-10 text-xs text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Your meal history syncs across all your devices
      </p>
    </div>
  );
}
