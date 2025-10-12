"use client";

import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckSquare, FileText, Users, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Firebase
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Role =
  | "owner"
  | "client"
  | "video_editor"
  | "content_manager"
  | "graphic_designer"
  | "project_manager";

type MeDoc = { uid: string; orgId?: string; role?: Role; displayName?: string; email?: string; photoURL?: string };

type ProjectRow = { id: string; orgId: string; name?: string; description?: string; status?: string; members?: string[] };
type TicketRow = {
  id: string;
  orgId: string;
  projectId: string;
  title?: string;
  description?: string;
  status?: "todo" | "doing" | "done";
  assignedTo?: string;
  assignees?: string[];
  projectName?: string; // optional if you denormalize
};
type UserRow = { uid: string; displayName?: string; email?: string; role?: Role; photoURL?: string };

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"tasks" | "projects" | "people">("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // auth
  const [me, setMe] = useState<MeDoc | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // datasets
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  // auth + me
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setMe(null);
        setOrgId(null);
        setIsOwner(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", u.uid));
      const meDoc = (snap.exists() ? { uid: u.uid, ...(snap.data() as any) } : { uid: u.uid }) as MeDoc;
      setMe(meDoc);
      setOrgId(meDoc.orgId || null);
      setIsOwner(meDoc.role === "owner");
    });
    return () => unsub();
  }, []);

  // load org-scoped data on open
  useEffect(() => {
    if (!isOpen || !orgId || !me) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // PROJECTS
        const projQ = isOwner
          ? query(collection(db, "projects"), where("orgId", "==", orgId))
          : query(
              collection(db, "projects"),
              where("orgId", "==", orgId),
              where("members", "array-contains", me.uid)
            );
        const projSnap = await getDocs(projQ);
        const projRows: ProjectRow[] = projSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

        // TICKETS
        let ticketRows: TicketRow[] = [];
        if (isOwner) {
          const tq = query(collection(db, "tickets"), where("orgId", "==", orgId));
          const ts = await getDocs(tq);
          ticketRows = ts.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        } else {
          const buckets: TicketRow[] = [];
          const t1 = await getDocs(query(collection(db, "tickets"), where("orgId", "==", orgId), where("assignedTo", "==", me.uid)));
          buckets.push(...t1.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
          const t2 = await getDocs(query(collection(db, "tickets"), where("orgId", "==", orgId), where("assignees", "array-contains", me.uid)));
          buckets.push(...t2.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
          // De-dup by id:
          ticketRows = Array.from(new Map(buckets.map((t) => [t.id, t])).values());
        }

        // USERS
        const uSnap = await getDocs(query(collection(db, "users"), where("orgId", "==", orgId)));
        const userRows: UserRow[] = uSnap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }));

        if (!cancelled) {
          setProjects(projRows);
          setTickets(ticketRows);
          setUsers(userRows);
        }
      } catch (_e) {
        // keep UI snappy; errors usually rules/connection—sidebar still works
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, orgId, isOwner, me]);

  // Debounce query
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQuery.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // client filter
  const filtered = useMemo(() => {
    if (!debouncedQ) {
      return {
        tasks: tickets.slice(0, 20),
        projects: projects.slice(0, 20),
        people: users.slice(0, 20),
      };
    }
    const inc = (s?: string) => (s || "").toLowerCase().includes(debouncedQ);

    return {
      tasks: tickets
        .filter((t) => inc(t.title) || inc(t.description) || inc(t.projectName))
        .slice(0, 30),
      projects: projects
        .filter((p) => inc(p.name) || inc(p.description) || inc(p.status))
        .slice(0, 20),
      people: users.filter((u) => inc(u.displayName) || inc(u.email)).slice(0, 20),
    };
  }, [debouncedQ, tickets, projects, users]);

  // navigation
  function goProject(id: string) {
    onClose();
    // adjust route to your project details page
    router.push(`/projects/${id}/full-details`);
  }
  function goTask(id: string) {
    onClose();
    // If you have a ticket page:
    router.push(`/tickets/${id}`);
    // or focus in Kanban: router.push(`/dashboard/kanban?focus=${id}`);
  }
  function goUser(uid: string) {
    onClose();
    router.push(`/contacts?user=${uid}`);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl md:p-3 max-h-[400px] md:max-h-[600px] overflow-y-auto"
        aria-modal="true"
        role="dialog"
      >
        {/* Search input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search tasks, projects, people…"
              className="pl-10 pr-4 py-2 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-3 px-4">
            <TabButton
              active={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              icon={<CheckSquare className="h-4 w-4 mr-2" />}
            >
              Tasks
            </TabButton>
            <TabButton
              active={activeTab === "projects"}
              onClick={() => setActiveTab("projects")}
              icon={<FileText className="h-4 w-4 mr-2" />}
            >
              Projects
            </TabButton>
            <TabButton
              active={activeTab === "people"}
              onClick={() => setActiveTab("people")}
              icon={<Users className="h-4 w-4 mr-2" />}
            >
              People
            </TabButton>
          </div>
        </div>

        {/* Results */}
        <div className="p-2">
          {activeTab === "tasks" && (
            <div className="space-y-2">
              {loading && <RowSkeleton count={4} />}
              {!loading && filtered.tasks.length === 0 && (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">No matching tasks</div>
              )}
              {!loading &&
                filtered.tasks.map((t) => (
                  <button
                    key={`task-${t.id}`}
                    className="w-full flex items-center rounded-md p-3 hover:bg-gray-50 cursor-pointer text-left"
                    onClick={() => goTask(t.id)}
                  >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{t.title || "Untitled task"}</div>
                      <div className="mt-1 flex items-center gap-2">
                        {t.projectName ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            {t.projectName}
                          </span>
                        ) : null}
                        {t.status ? (
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-1 text-[10px] font-medium",
                              t.status === "doing" && "bg-yellow-100 text-yellow-800",
                              t.status === "done" && "bg-green-100 text-green-800",
                              (!t.status || t.status === "todo") && "bg-gray-100 text-gray-700"
                            )}
                          >
                            {t.status}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-2">
              {loading && <RowSkeleton count={4} />}
              {!loading && filtered.projects.length === 0 && (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">No matching projects</div>
              )}
              {!loading &&
                filtered.projects.map((p) => (
                  <button
                    key={`project-${p.id}`}
                    className="w-full flex items-center rounded-md p-3 hover:bg-gray-50 cursor-pointer text-left"
                    onClick={() => goProject(p.id)}
                  >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name || "Untitled project"}</div>
                      <div className="mt-1">
                        {p.status ? (
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-1 text-xs font-medium",
                              p.status === "planning" && "bg-blue-100 text-blue-800",
                              p.status === "in-progress" && "bg-yellow-100 text-yellow-800",
                              p.status === "completed" && "bg-green-100 text-green-800"
                            )}
                          >
                            {p.status === "in-progress"
                              ? "In Progress"
                              : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {activeTab === "people" && (
            <div className="space-y-2">
              {loading && <RowSkeleton count={4} />}
              {!loading && filtered.people.length === 0 && (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">No matching people</div>
              )}
              {!loading &&
                filtered.people.map((person) => (
                  <button
                    key={`person-${person.uid}`}
                    className="w-full flex items-center rounded-md p-3 hover:bg-gray-50 cursor-pointer text-left"
                    onClick={() => goUser(person.uid)}
                  >
                    <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={person.photoURL || "/placeholder.svg"}
                        alt={person.displayName || person.email || person.uid}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{person.displayName || person.email || person.uid}</div>
                      <div className="text-sm text-gray-500 truncate">{person.email}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap gap-2 items-center justify-between border-t border-gray-200 p-4">
          <Button variant="outline" size="sm" onClick={onClose} className="flex items-center">
            <X className="mr-2 h-4 w-4" />
            Return
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-blue-600"
            onClick={() => {
              onClose();
              // Optional: route to a dedicated search page with the query
              // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            }}
          >
            To View All Results
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* UI bits */

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function TabButton({ active, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center px-4 py-3 text-sm font-medium border-b-2 -mb-px",
        active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      )}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

function RowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 rounded-md bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

export default SearchModal;
