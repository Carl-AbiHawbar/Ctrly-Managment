'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { createSessionCookie } from '@/client/utils/createSessionCookie';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function afterAuth() {
    // Post token to create session cookie and pull claims twice
    await createSessionCookie();
    router.push('/dashboard'); // server will redirect to /verify or /pending if needed
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        email: cred.user.email,
        displayName: displayName || cred.user.displayName || '',
        createdAt: serverTimestamp(),
      });
      await sendEmailVerification(cred.user);
      await afterAuth();
    } catch (e: any) {
      setErr(e?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        email: cred.user.email,
        displayName: cred.user.displayName || '',
        createdAt: serverTimestamp(),
      }, { merge: true });
      await afterAuth();
    } catch (e: any) {
      setErr(e?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Full name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded bg-black text-white py-2">{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <button onClick={onGoogle} disabled={loading} className="w-full border rounded py-2">Continue with Google</button>
      <p className="text-sm">Already have an account? <a className="underline" href="/login">Sign in</a></p>
    </div>
  );
}
