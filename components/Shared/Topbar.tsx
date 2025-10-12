'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NewProjectModal from './NewProjectModal';

// Firebase
import { auth, db } from '@/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

type TopbarProps = {
  name: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

function getInitials(name?: string, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'U';
  }
  if (email) return email[0]?.toUpperCase() || 'U';
  return 'U';
}

export default function Topbar({ name, sidebarOpen, setSidebarOpen }: TopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(auth.currentUser ?? null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) return setRole(null);

      const ref = doc(db, 'users', u.uid);
      const unsubUser = onSnapshot(
        ref,
        (snap) => setRole((snap.data() as any)?.role || null),
        () => setRole(null)
      );
      return () => unsubUser();
    });
    return () => unsubAuth();
  }, []);

  const displayName = user?.displayName || '';
  const email = user?.email || '';
  const photoURL = user?.photoURL || '';
  const initials = useMemo(() => getInitials(displayName, email), [displayName, email]);

  async function handleLogout() {
    try {
      await signOut(auth);
      toast.success('Signed out');
      router.push('/login');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to sign out');
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm fixed w-full lg:w-[calc(100%-16rem)] top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: menu + page title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-10 w-10" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
        </div>

        {/* Right: owner-only Add Project + profile */}
        <div className="flex items-center space-x-3">
          {role === 'owner' && (
     <div className="flex items-center space-x-3">
          {role === 'owner' && <NewProjectModal />}
          {/* ...profile dropdown... */}
        </div>

          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {photoURL ? (
                    <AvatarImage src={photoURL} alt={displayName || email || 'Profile'} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
