"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/Shared/Topbar";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotifType = "task" | "project" | "mention" | "system";
type Notification = {
  id: string;
  orgId: string;
  type: NotifType;
  title: string;
  message?: string;
  projectId?: string;
  recipients: string[]; // ["all_org"] or uids
  createdAt?: any;
  createdBy?: string;
  readBy?: string[];
};

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [me, setMe] = useState<{ uid: string; role: string; orgId: string } | null>(null);
  const [rows, setRows] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"all" | NotifType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selected, setSelected] = useState<Notification | null>(null);

  // ───────────────────────────────── Auth → my user doc
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setRows([]);
      setLoading(true);
      if (!u) {
        setMe(null);
        setLoading(false);
        toast.error("Not signed in");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const d = snap.data() as any;
        setMe({ uid: u.uid, role: d?.role ?? "", orgId: d?.orgId ?? "" });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // ───────────────────────────────── Stream notifications
  useEffect(() => {
    if (!me?.orgId) return;
    setRows([]);
    setLoading(true);

    const col = collection(db, "notifications");

    // Owner gets everything in org
    if (me.role === "owner") {
      const qy = query(col, where("orgId", "==", me.orgId), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(
        qy,
        (snap) => {
          setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Notification[]);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          toast.error(err?.message || "Failed to load notifications");
          setLoading(false);
        }
      );
      return () => unsub();
    }

    // Non-owner: union of (recipients contains me.uid) ∪ (recipients contains "all_org")
    const unsubMine = onSnapshot(
      query(
        col,
        where("orgId", "==", me.orgId),
        where("recipients", "array-contains", me.uid),
        orderBy("createdAt", "desc")
      ),
      (snap) => {
        setRows((prev) => mergeById(prev, snap.docs.map(toNotif)));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error(err?.message || "Failed to load notifications");
        setLoading(false);
      }
    );
    const unsubAll = onSnapshot(
      query(
        col,
        where("orgId", "==", me.orgId),
        where("recipients", "array-contains", "all_org"),
        orderBy("createdAt", "desc")
      ),
      (snap) => {
        setRows((prev) => mergeById(prev, snap.docs.map(toNotif)));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error(err?.message || "Failed to load notifications");
        setLoading(false);
      }
    );

    return () => {
      unsubMine();
      unsubAll();
    };
  }, [me?.orgId, me?.role, me?.uid]);

  // ───────────────────────────────── Derived lists + counts
  const searched = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.message || "").toLowerCase().includes(q) ||
        (n.projectId || "").toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  const tabbed = useMemo(() => {
    if (activeTab === "all") return searched;
    return searched.filter((n) => n.type === activeTab);
  }, [searched, activeTab]);

  const counts = useMemo(() => {
    const all = rows.length;
    const task = rows.filter((n) => n.type === "task").length;
    const project = rows.filter((n) => n.type === "project").length;
    const mention = rows.filter((n) => n.type === "mention").length;
    const system = rows.filter((n) => n.type === "system").length;
    return { all, task, project, mention, system };
  }, [rows]);

  // ───────────────────────────────── Item select → mark as read
  async function openDetail(n: Notification) {
    setSelected(n);
    const uid = me?.uid;
    if (!uid) return;
    if ((n.readBy || []).includes(uid)) return;
    try {
      await updateDoc(doc(db, "notifications", n.id), {
        readBy: [...(n.readBy || []), uid],
      });
    } catch {
      // ignore (if you didn’t add the small exception rule to allow readBy updates)
    }
  }

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16 min-h-screen">
        <Topbar
          name="Notifications"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="border-b bg-white">
          <div className="px-4 lg:px-6 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as any);
                setSelected(null);
              }}
              className="w-full md:w-auto"
            >
              <TabsList className="flex flex-wrap justify-start">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-50">
                  All <Badge variant="secondary" className="ml-2">{counts.all}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="w-full md:w-80">
              <Input
                placeholder="Search notifications…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* List + Detail */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-12 h-full">
            <div
              className={cn(
                "h-full overflow-y-auto bg-white",
                selected ? "col-span-12 md:col-span-6 lg:col-span-7" : "col-span-12"
              )}
            >
              {loading ? (
                <div className="p-6 text-sm text-muted-foreground">Loading notifications…</div>
              ) : tabbed.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No notifications.</div>
              ) : (
                <ul className="divide-y">
                  {tabbed.map((n) => {
                    const isUnread = me?.uid ? !(n.readBy || []).includes(me.uid) : false;
                    const ts = n.createdAt?.toMillis
                      ? new Date(n.createdAt.toMillis())
                      : n.createdAt?.seconds
                      ? new Date(n.createdAt.seconds * 1000)
                      : null;
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          "p-4 cursor-pointer hover:bg-gray-50",
                          selected?.id === n.id && "bg-blue-50/40"
                        )}
                        onClick={() => openDetail(n)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{n.title}</span>
                              <Badge variant="outline" className="capitalize">{n.type}</Badge>
                              {n.projectId ? (
                                <Badge variant="secondary" className="hidden md:inline">
                                  {n.projectId}
                                </Badge>
                              ) : null}
                            </div>
                            {n.message ? (
                              <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {n.message}
                              </div>
                            ) : null}
                            {ts ? (
                              <div className="text-[11px] text-muted-foreground mt-1">
                                {ts.toLocaleString()}
                              </div>
                            ) : null}
                          </div>
                          {isUnread ? (
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-600 mt-2" />
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {selected && (
              <div className="col-span-12 md:col-span-6 lg:col-span-5 h-full border-l bg-white">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold truncate">{selected.title}</h2>
                        <Badge variant="outline" className="capitalize">
                          {selected.type}
                        </Badge>
                      </div>
                      {selected.projectId ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          Project: <span className="font-medium">{selected.projectId}</span>
                        </div>
                      ) : null}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                  </div>

                  {selected.message ? (
                    <div className="text-sm leading-6">{selected.message}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No extra details.</div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Recipients:{" "}
                      {selected.recipients?.length
                        ? selected.recipients.join(", ")
                        : "—"}
                    </div>
                    {selected.createdAt ? (
                      <div className="text-xs text-muted-foreground mt-1">
                        Created:{" "}
                        {selected.createdAt?.toMillis
                          ? new Date(selected.createdAt.toMillis()).toLocaleString()
                          : selected.createdAt?.seconds
                          ? new Date(selected.createdAt.seconds * 1000).toLocaleString()
                          : "—"}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// helpers
function toNotif(d: any): Notification {
  return { id: d.id, ...(d.data() as any) } as Notification;
}
function mergeById(prev: Notification[], next: Notification[]) {
  const map = new Map<string, Notification>();
  [...prev, ...next].forEach((n) => map.set(n.id, n));
  return Array.from(map.values());
}
