'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0); // seconds
  const router = useRouter();

  useEffect(() => {
    // @ts-ignore
    auth.useDeviceLanguage?.();
  }, []);

  // simple 60s cooldown to avoid auth/too-many-requests
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function resend() {
    setError('');
    const u = auth.currentUser;
    if (!u) return;
    if (cooldown > 0) return;

    try {
      const actionCodeSettings = { url: `${window.location.origin}/login`, handleCodeInApp: false };
      await sendEmailVerification(u, actionCodeSettings);
      setSent(true);
      setCooldown(60); // prevent spamming
    } catch (e: any) {
      console.error('verification error', e);
      setError(e?.message || 'Failed to send verification');
      // If Firebase throttled, set a short cooldown anyway
      setCooldown(60);
    }
  }

  async function refreshSessionCookie() {
    const u = auth.currentUser;
    if (!u) return;
    const idToken = await u.getIdToken(true);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  }

  async function iveVerified() {
    const u = auth.currentUser;
    if (!u) return;
    await u.reload();

    // If verified, refresh session cookie so the server reads updated claims
    if (u.emailVerified) {
      await refreshSessionCookie();

      const token = await u.getIdTokenResult(true);
      const role = token.claims.role as string | undefined;
      const orgId = token.claims.orgId as string | undefined;
      return router.replace(!role || !orgId ? '/pending' : '/dashboard');
    }
    setError('Still not verified. Check your inbox/spam and try again.');
  }

  // send one verification email on first visit
  useEffect(() => {
    if (!sent) void resend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent]);

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Verify your email</h1>
      <p className="text-sm text-neutral-600">
        We sent a verification link to your email. Click it, then return and press “I’ve verified”.
      </p>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {sent && <div className="text-green-600 text-sm">Verification email sent.</div>}

      <div className="flex gap-2 items-center">
        <button onClick={iveVerified} className="px-4 py-2 rounded bg-black text-white">I’ve verified</button>
        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="px-4 py-2 rounded border disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
        </button>
        <button onClick={() => signOut(auth)} className="px-4 py-2 rounded border">Sign out</button>
      </div>
    </div>
  );
}
