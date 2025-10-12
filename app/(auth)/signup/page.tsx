'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  // GoogleAuthProvider,
  // signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) router.replace('/dashboard');
    });
    getRedirectResult(auth).catch(console.error);
    return () => unsub();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      if (displayName) await updateProfile(cred.user, { displayName });

      // Save Firestore user with orgId and role
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: displayName || cred.user.displayName || '',
          orgId: null, // can be set later when joining/creating org
          role: 'user', // default
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success('Account created!');
      router.replace('/dashboard');
    } catch (e: any) {
      setErr(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-center">Create Account</h1>
      {err && <p className="text-sm text-red-500">{err}</p>}

      <form onSubmit={handleSignup} className="space-y-3">
        <input
          type="text"
          placeholder="Full Name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
      </form>

      {/* Commented out Google sign-up for now
      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full border rounded py-2"
      >
        Continue with Google
      </button>
      */}

      <p className="text-sm text-center">
        Already have an account?{' '}
        <a href="/login" className="underline font-medium">
          Sign in
        </a>
      </p>
    </div>
  );
}
