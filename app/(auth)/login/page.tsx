'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../firebase';
import { createSessionCookie } from '@/client/utils/createSessionCookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  async function finish() {
    await createSessionCookie();
    router.push('/dashboard');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await finish();
    } catch (e: any) {
      setErr(e?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr('');
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await finish();
    } catch (e: any) {
      setErr(e?.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded bg-black text-white py-2">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <button onClick={onGoogle} disabled={loading} className="w-full border rounded py-2">Continue with Google</button>
      <p className="text-sm">No account? <a className="underline" href="/signup">Create one</a></p>
    </div>
  );
}
