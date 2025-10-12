'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  CheckSquare,
  Bell,
  Search,
  X,
  FileText,
  LayoutGrid,
  Calendar,
  ContactRound,
  Users as UsersIcon,
} from 'lucide-react';
import { SearchModal } from './search-modal';

// Firebase
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type Project = {
  id: string;
  name?: string;
  orgId: string;
  members?: string[];
  createdAt?: any;
};

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // role / access
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  // dynamic projects
  const [projList, setProjList] = useState<Project[]>([]);

  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubUser: (() => void) | undefined;
    let unsubProjects: (() => void) | undefined;

    unsubAuth = onAuthStateChanged(auth, (u) => {
      // reset on auth change
      setIsOwner(false);
      setProjList([]);

      if (!u) return;

      // watch my users/{uid} doc for role + orgId
      const meRef = doc(db, 'users', u.uid);
      unsubUser?.();
      unsubUser = onSnapshot(
        meRef,
        (meSnap) => {
          const me = meSnap.data() as { role?: string; orgId?: string } | undefined;
          const role = me?.role || null;
          const orgId = me?.orgId || null;
          setIsOwner(role === 'owner');

          // stop previous projects stream
          unsubProjects?.();

          if (!orgId) {
            setProjList([]);
            return;
          }

          if (role === 'owner') {
            // owner sees all org projects
            const qAll = query(collection(db, 'projects'), where('orgId', '==', orgId));
            unsubProjects = onSnapshot(
              qAll,
              (snap) => {
                setProjList(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
              },
              () => setProjList([])
            );
          } else {
            // non-owner sees only projects where they are a member
            const qMine = query(
              collection(db, 'projects'),
              where('orgId', '==', orgId),
              where('members', 'array-contains', u.uid)
            );
            unsubProjects = onSnapshot(
              qMine,
              (snap) => {
                setProjList(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
              },
              () => setProjList([])
            );
          }
        },
        () => {
          setIsOwner(false);
          setProjList([]);
        }
      );
    });

    return () => {
      unsubProjects?.();
      unsubUser?.();
      unsubAuth?.();
    };
  }, []);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 bottom-0 inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-500 ease-in-out lg:translate-x-0 lg:w-64 overflow-y-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <div className="w-18 h-18 mr-2">
              <img src="/ctrly.png" alt="CTRLY" />
            </div>
            <span className="text-xl font-semibold">CTRLY MANAGEMENT</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            {/* Main nav */}
            <nav className="space-y-1 mb-6">
              <NavItem href="/" icon={Home}>
                Home
              </NavItem>
              <NavItem href="/projects" icon={FileText}>
                Projects
              </NavItem>
              <NavItem href="/dashboard//my-tasks" icon={CheckSquare}>
                My Tasks
              </NavItem>
              <NavItem href="/dashboard//kanban" icon={LayoutGrid}>
                Kanban desk
              </NavItem>
              <NavItem href="/dashboard//calendar" icon={Calendar}>
                Calendar
              </NavItem>
              <NavItem href="/contacts" icon={ContactRound}>
                Contacts
              </NavItem>
              <NavItem href="/notifications" icon={Bell}>
                Notifications
              </NavItem>

              {/* Users tab only for owners */}
              {isOwner && (
                <NavItem href="/dashboard/users" icon={UsersIcon}>
                  Users
                </NavItem>
              )}

              <NavItem
                href="#"
                icon={Search}
                onClick={(e) => {
                  e.preventDefault();
                  setSearchModalOpen(true);
                }}
              >
                Search
              </NavItem>
            </nav>

            {/* Projects (dynamic) */}
            <div className="mb-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h3>
              </div>

              <div className="space-y-1">
                {projList.length > 0 ? (
                  projList.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}/full-details`}
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                    >
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-3" />
                      <span className="text-gray-700 truncate">{p.name || 'Untitled project'}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500">No projects.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function NavItem({ href, icon: Icon, children, active, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = active || pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-md',
        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
      )}
      onClick={onClick}
    >
      <Icon className={cn('h-5 w-5 mr-3', isActive ? 'text-blue-700' : 'text-gray-500')} />
      {children}
    </Link>
  );
}

export default Sidebar;
