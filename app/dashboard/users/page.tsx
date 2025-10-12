'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { toast } from 'sonner';

// ⬇️ layout pieces (adjust paths if different)
import Sidebar from '../../../components/sidebar';
import Topbar from '../../../components/Shared/Topbar';

type Role =
  | 'owner'
  | 'client'
  | 'video_editor'
  | 'content_manager'
  | 'graphic_designer'
  | 'project_manager';

type UserDoc = {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  orgId: string;
};

const ROLES: Role[] = [
  'client',
  'video_editor',
  'content_manager',
  'graphic_designer',
  'project_manager',
  'owner',
];

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [me, setMe] = useState<UserDoc | null>(null);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Watch auth, then my user doc by ID (rules allow userId == uid())
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setLoading(false);
        toast.error('Not signed in');
        return;
      }

      const myRef = doc(db, 'users', u.uid);
      const unsubMe = onSnapshot(
        myRef,
        (snap) => {
          const d = snap.data() as UserDoc | undefined;
          if (!d) {
            setLoading(false);
            toast.error('User record not found');
            return;
          }
          setMe(d);

          if (d.role !== 'owner') {
            setLoading(false);
            toast.error('Only owner can access this page');
            return;
          }

          // Stream org users (all must share the same orgId)
          const usersQ = query(collection(db, 'users'), where('orgId', '==', d.orgId));
          const unsubUsers = onSnapshot(
            usersQ,
            (snap2) => {
              const arr = snap2.docs
                .map((x) => x.data() as UserDoc)
                .sort((a, b) => (a.email || '').localeCompare(b.email || ''));
              setUsers(arr);
              setLoading(false);
            },
            (err) => {
              console.error(err);
              toast.error('Failed to load users');
              setLoading(false);
            }
          );

          // cleanup inner stream when my doc changes or auth changes
          return () => unsubUsers();
        },
        (err) => {
          console.error(err);
          toast.error('Failed to load your user doc');
          setLoading(false);
        }
      );

      // cleanup my doc listener when auth changes/unmounts
      return () => unsubMe();
    });

    return () => unsubAuth();
  }, []);

  async function changeRole(uid: string, role: Role) {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      toast.success('Role updated');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Update failed');
    }
  }

  return (
    <>
      {/* Sidebar (fixed) */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Topbar (fixed) */}
      <Topbar name="Users" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area — padded for topbar and shifted for sidebar on large screens */}
      <main className="pt-16 lg:ml-64">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {loading && <div className="p-6">Loading…</div>}
          {!loading && (!me || me.role !== 'owner') && (
            <div className="p-6">Forbidden</div>
          )}

          {!loading && me && me.role === 'owner' && (
            <>
              <div>
                <h1 className="text-2xl font-semibold">Users</h1>
                <p className="text-sm text-neutral-500">
                  Assign roles (owner-only). Everyone must share the same <code>orgId</code>.
                </p>
              </div>

              <div className="border rounded overflow-x-auto bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-neutral-50">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.uid} className="border-b">
                        <td className="p-3">{u.displayName || '—'}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                          <select
                            className="border rounded p-1"
                            value={u.role}
                            onChange={(e) => changeRole(u.uid, e.target.value as Role)}
                            disabled={u.uid === me.uid} // avoid self-change here
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td className="p-3" colSpan={3}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
