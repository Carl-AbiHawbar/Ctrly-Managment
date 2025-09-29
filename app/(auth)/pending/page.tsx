'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const [note, setNote] = useState('');
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(async () => {
      const u = auth.currentUser;
      if (!u) return;
      const token = await u.getIdTokenResult(true);
      const role = token.claims.role as string | undefined;
      const orgId = token.claims.orgId as string | undefined;
      if (role && orgId) {
        clearInterval(id);
        router.replace('/dashboard');
      } else {
        setNote('Waiting for owner approval…');
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Pending approval</h1>
      <p className="text-sm text-neutral-600">
        Your email is verified. An owner must approve your account and assign your role (client/worker) before you can access projects.
      </p>
      {note && <div className="text-sm">{note}</div>}
      <button onClick={() => signOut(auth)} className="px-4 py-2 rounded border">Sign out</button>
    </div>
  );
}
