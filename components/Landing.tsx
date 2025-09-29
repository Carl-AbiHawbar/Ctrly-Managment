'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; // make sure you have lib/firebase.ts exporting your app/auth

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        await u.getIdToken(true); // refresh claims
        router.replace('/dashboard');
      }
    });
    return () => unsub();
  }, [router]);

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl font-semibold">Welcome To Ctrly Agency</h1>
        <p className="text-neutral-600">
          Manage your clients, projects, tickets, and tasks.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/login" className="px-4 py-2 rounded bg-black text-white">Sign in</a>
          <a href="/signup" className="px-4 py-2 rounded border">Sign up</a>
        </div>
      </div>
    </main>
  );
}
