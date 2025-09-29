'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
// ⬇️ adjust these import paths if needed
import { auth, db } from '../../../firebase';
import { createSessionCookie } from '@/client/utils/createSessionCookie';

export default async function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  // Optional invite deep link (?orgId=...&role=client|worker)
  const inviteOrgId = params.get('orgId');
  const inviteRole = (params.get('role') as 'owner' | 'worker' | 'client' | null) ?? null;

  useEffect(() => {
    // Use device language for auth emails
    // @ts-ignore
    auth.useDeviceLanguage?.();
  }, []);

  async function materializeProfile(uid: string, displayName?: string) {
    await setDoc(
      doc(db, 'profiles', uid),
      {
        displayName: displayName || name || null,
        email,
        createdAt: serverTimestamp(),
        invite: inviteOrgId ? { orgId: inviteOrgId, role: inviteRole || 'client' } : null,
      },
      { merge: true }
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await materializeProfile(cred.user.uid, name);

      // Send verification (don’t block UI on errors)
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };
      sendEmailVerification(cred.user, actionCodeSettings).catch((err) => {
        console.error('sendEmailVerification failed:', err);
      });

      // Go to verify page; after the user confirms, your /verify page routes to /pending or /dashboard
      router.replace('/verify');
    } catch (e: any) {
      console.error('email signup error', e);
      setErr(e?.message || 'Sign-up failed');
      setLoading(false);
    }
  }

  // If user signs up with Google, email is already verified → still need owner approval
  async function onGoogle() {
    setErr('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await materializeProfile(cred.user.uid, cred.user.displayName || undefined);

      // Set the session cookie so server can authorize API/layouts immediately
      const idToken = await cred.user.getIdToken(true);
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const token = await cred.user.getIdTokenResult(true);
      const role = token.claims.role as string | undefined;
      const orgId = token.claims.orgId as string | undefined;
      router.replace(!role || !orgId ? '/pending' : '/dashboard');
    } catch (e: any) {
      console.error('google signup error', e);
      setErr(e?.message || 'Google sign-up failed');
      setLoading(false);
    }
  }

  await createSessionCookie();
  await routeByClaims();

  

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Full name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />
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
          placeholder="Password (min 6)"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full px-4 py-2 rounded bg-black text-white"
        >
          {loading ? 'Creating…' : 'Sign up'}
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
        Already have an account? <a className="underline" href="/login">Sign in</a>
      </p>
    </div>
  );
}
function routeByClaims() {
  throw new Error('Function not implemented.');
}

