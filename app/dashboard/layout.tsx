// app/dashboard/layout.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        setReady(true);
      }
    });
    return () => unsub();
  }, [router]);

  if (!ready) {
    return <div className="p-6 text-sm">Loading…</div>;
  }

  return <>{children}</>;
}
