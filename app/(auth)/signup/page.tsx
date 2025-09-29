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
import { auth, db } from '../../../firebase';
import { createSessionCookie } from '@/client/utils/createSessionCookie';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });

      // create a profile doc (optional)
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        displayName: name || null,
        email: email || null,
        createdAt: serverTimestamp(),
      }, { merge: true });

      await sendEmailVerification(cred.user);
      await createSessionCookie(); // bootstraps owner if allowlisted
      router.push('/verify');
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
      await signInWithPopup(auth, new GoogleAuthProvider());
      await createSessionCookie();
      router.push('/verify');
    } catch (e: any) {
      setErr(e?.message || 'Failed with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded bg-black text-white py-2">{loading ? 'Creating…' : 'Create account'}</button>
      </form>

      <button onClick={onGoogle} disabled={loading} className="w-full border rounded py-2">
        Continue with Google
      </button>

      <p className="text-sm">
        Already have an account? <a className="underline" href="/login">Sign in</a>
      </p>
    </div>
  );
}
