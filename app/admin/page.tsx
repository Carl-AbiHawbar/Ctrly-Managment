'use client';

import { useEffect, useMemo, useState } from 'react';
import { setUserRole } from '@/functions/lib/setUserRole';

type Role = 'client' | 'worker' | 'owner';
type Profile = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  invite?: { orgId: string; role: Role } | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'ctrly-agency';

export default function AdminApprovalsPage() {
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/profiles', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load');
      setRows(data.rows || []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.displayName || '').toLowerCase().includes(s) ||
      (r.email || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  async function approve(uid: string, role: Role) {
    try {
      await setUserRole({ uid, role, orgId: ORG_ID });
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to set role');
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin – Approvals</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search users"
        className="w-full border rounded p-2"
      />
      {err && <div className="text-red-600 text-sm">{err}</div>}
      {loading ? (
        <div className="p-6">Loading…</div>
      ) : (
        <div className="border rounded divide-y">
          {filtered.map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{r.displayName || '(no name)'}</div>
                <div className="text-sm text-neutral-600">{r.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => approve(r.id, 'client')} className="px-3 py-1.5 rounded border">Make Client</button>
                <button onClick={() => approve(r.id, 'worker')} className="px-3 py-1.5 rounded bg-black text-white">Make Worker</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-sm text-neutral-600">No users found.</div>
          )}
        </div>
      )}
    </main>
  );
}
