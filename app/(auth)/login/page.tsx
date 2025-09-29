'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
// ⬇️ adjust this import path if needed
import { auth } from '../../../firebase';

export default async function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function routeByClaims() {
    const u = auth.currentUser;
    if (!u) return;
    const token = await u.getIdTokenResult(true);
    const isVerified = (token.claims as any).email_verified ?? u.emailVerified;
    const role = token.claims.role as string | undefined;
    const orgId = token.claims.orgId as string | undefined;

    if (!isVerified) return router.replace('/verify');
    if (!role || !orgId) return router.replace('/pending');
    return router.replace('/dashboard');
  }

  // Create the HttpOnly session cookie (server uses it for /api/* and layouts)
  async function createSessionCookie() {
  const u = auth.currentUser;
  if (!u) return;
  const idToken = await u.getIdToken(true);
  const r = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create session");
  }
}


  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) await routeByClaims();
    });
    return () => unsub();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await createSessionCookie();
      await routeByClaims();
    } catch (e: any) {
      console.error('email login error', e);
      setErr(e?.message || 'Sign-in failed');
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await createSessionCookie();
      await routeByClaims();
    } catch (e: any) {
      console.error('google login error', e);
      setErr(e?.message || 'Google sign-in failed');
      setLoading(false);
    }
  }

  await createSessionCookie();
  await routeByClaims();


  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full px-4 py-2 rounded bg-black text-white"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <button
        onClick={onGoogle}
        disabled={loading}
        className="w-full border rounded py-2"
      >
        Continue with Google
      </button>
      <p className="text-sm">
        No account? <a className="underline" href="/signup">Create one</a>
      </p>
    </div>
  );
}
