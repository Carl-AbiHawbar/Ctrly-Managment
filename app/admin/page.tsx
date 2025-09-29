// app/(dashboard)/admin/approvals/page.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
// ✅ make sure this points to your app lib file
import { setUserRole } from '../../functions/lib/setUserRole';

type Role = 'client' | 'worker' | 'owner';
type Profile = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  invite?: { orgId: string; role: Role } | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || 'ctrly-agency';

export default function ApprovalsPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/profiles', {
        cache: 'no-store',
        credentials: 'include', // 👈 IMPORTANT so __session cookie is sent
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load profiles');
      setRows(data.rows || []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      (r.displayName || '').toLowerCase().includes(s) ||
      (r.email || '').toLowerCase().includes(s) ||
      r.id.includes(s)
    );
  }, [rows, search]);

  async function approve(uid: string, role: Role) {
    try {
      await setUserRole({ uid, role, orgId: ORG_ID });
      alert(`Approved ${uid} as ${role}.`);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to set role');
    }
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">User Approvals</h1>
          <p className="text-sm text-neutral-600">Approve users and assign a role.</p>
          {err && <div className="text-red-600 mt-2">{err}</div>}
        </div>
        <input
          className="border rounded px-3 py-2 w-72"
          placeholder="Search name, email, or UID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {loading && <div>Loading users…</div>}

      {!loading && !err && (
        <div className="overflow-hidden rounded border divide-y">
          {filtered.map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{r.displayName || '(no name)'}</div>
                <div className="text-sm text-neutral-600 truncate">{r.email || '(no email)'}</div>
                <div className="text-xs text-neutral-500">UID: <code className="break-all">{r.id}</code></div>
                {r.invite?.orgId && (
                  <div className="text-xs text-neutral-500">
                    Invite: {r.invite.orgId} → {r.invite.role}
                  </div>
                )}
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
