"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";

// UI
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/Shared/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Firebase
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";

/** ─────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────*/
type Role =
  | "owner"
  | "client"
  | "video_editor"
  | "content_manager"
  | "graphic_designer"
  | "project_manager";

type TicketStatus = "todo" | "doing" | "done";

type UserDoc = {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: Role;
  orgId?: string;
};

type ProjectDoc = {
  id: string;
  name?: string;
  members?: string[]; // user uids
  orgId?: string;
  logoUrl?: string;
};

type Ticket = {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;            // "todo" | "doing" | "done"
  orgId: string;                   // required for server-side filtering
  projectId: string;               // link to project
  assignedTo?: string;             // single assignee (optional)
  assignees?: string[];            // or multiple assignees (optional)
  priority?: "low" | "medium" | "high";
  createdAt?: any;
  createdBy?: string;
  // denormalized for UI
  projectName?: string;
  assigneeList?: { id: string; name?: string }[];
};

const DND_TYPES = { CARD: "KANBAN_TICKET" };
const COLUMNS: { key: TicketStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" },
];

/** ─────────────────────────────────────────────────────────
 * Page wrapper (keeps Sidebar + Topbar)
 * ────────────────────────────────────────────────────────*/
export default function KanbanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
        <Topbar
          name="Kanban"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50 p-3 lg:p-6">
          <KanbanBoard />
        </main>
      </div>
    </div>
  );
}

/** ─────────────────────────────────────────────────────────
 * Kanban Board (streams from Firestore `tickets`)
 * ────────────────────────────────────────────────────────*/
function KanbanBoard() {
  const [me, setMe] = useState<UserDoc | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Record<string, ProjectDoc>>({});
  const [usersMap, setUsersMap] = useState<Record<string, { name?: string }>>({});

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // dynamic unsubscribers
  const topLevelUnsub = useRef<Unsubscribe | null>(null);
  const projectTicketUnsubs = useRef<Unsubscribe[]>([]);

  // Auth + my user doc + preload org users/projects + start streams
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      cleanupStreams();
      setLoading(true);

      if (!u) {
        setMe(null);
        setIsOwner(false);
        setOrgId(null);
        setTickets([]);
        setProjects({});
        setUsersMap({});
        setLoading(false);
        toast.error("Not signed in");
        return;
      }

      try {
        // my user doc
        const meSnap = await getDoc(doc(db, "users", u.uid));
        const meDoc = (meSnap.exists() ? { uid: u.uid, ...(meSnap.data() as any) } : { uid: u.uid }) as UserDoc;
        setMe(meDoc);
        setIsOwner(meDoc.role === "owner");
        setOrgId(meDoc.orgId || null);

        if (!meDoc.orgId) {
          setLoading(false);
          toast.error("Your account has no orgId.");
          return;
        }

        // preload org users
        const uQ = query(collection(db, "users"), where("orgId", "==", meDoc.orgId));
        const uSnap = await getDocs(uQ);
        const uMap: Record<string, { name?: string }> = {};
        uSnap.forEach((d) => {
          const x = d.data() as UserDoc;
          uMap[d.id] = { name: x.displayName || x.email };
        });
        setUsersMap(uMap);

        // preload org projects
        const pQ = query(collection(db, "projects"), where("orgId", "==", meDoc.orgId));
        const pSnap = await getDocs(pQ);
        const pMap: Record<string, ProjectDoc> = {};
        pSnap.forEach((d) => {
          const x = d.data() as any;
          pMap[d.id] = { id: d.id, name: x.name || "Untitled", members: x.members || [], orgId: x.orgId };
        });
        setProjects(pMap);

        // start streams:
        if (meDoc.role === "owner") {
          // owner sees all org tickets
          streamOrgTickets(meDoc.orgId);
        } else {
          // member sees: tickets in member projects + tickets assigned to them + tickets they created
          streamMemberTickets(meDoc.uid, meDoc.orgId);
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Failed to load your profile");
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      cleanupStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupStreams() {
    topLevelUnsub.current?.();
    topLevelUnsub.current = null;
    projectTicketUnsubs.current.forEach((u) => u());
    projectTicketUnsubs.current = [];
  }

  // Owner stream: one collection query
  function streamOrgTickets(org: string) {
    topLevelUnsub.current?.();
    const qy = query(collection(db, "tickets"), where("orgId", "==", org));
    topLevelUnsub.current = onSnapshot(
      qy,
      (snap) => {
        const list = snap.docs.map((d) => toTicket(d.id, d.data() as any));
        setTickets(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error(err?.message || "Failed to load tickets");
        setLoading(false);
      }
    );
  }

  // Member streams: project member tickets + personal tickets (assignedTo/assignees/createdBy)
  function streamMemberTickets(uid: string, org: string) {
    topLevelUnsub.current?.();
    projectTicketUnsubs.current.forEach((u) => u());
    projectTicketUnsubs.current = [];

    // live projects where I'm a member
    topLevelUnsub.current = onSnapshot(
      query(collection(db, "projects"), where("orgId", "==", org), where("members", "array-contains", uid)),
      (psnap) => {
        // close old tickets listeners
        projectTicketUnsubs.current.forEach((u) => u());
        projectTicketUnsubs.current = [];

        const projIds = psnap.docs.map((p) => p.id);
        const buckets: Record<string, Ticket[]> = {};

        // 1) project-based tickets
        projIds.forEach((pid) => {
          const unsub = onSnapshot(
            query(collection(db, "tickets"), where("orgId", "==", org), where("projectId", "==", pid)),
            (tsnap) => {
              buckets[pid] = tsnap.docs.map((d) => toTicket(d.id, d.data() as any));
              setTickets(collectTickets(buckets));
              setLoading(false);
            },
            (err) => {
              console.error(err);
              toast.error(err?.message || "Failed to load project tickets");
              setLoading(false);
            }
          );
          projectTicketUnsubs.current.push(unsub);
        });

        // 2) personal tickets (assignedTo == me)
        const unsubMeAssigned = onSnapshot(
          query(collection(db, "tickets"), where("orgId", "==", org), where("assignedTo", "==", uid)),
          (tsnap) => {
            buckets["__meAssigned"] = tsnap.docs.map((d) => toTicket(d.id, d.data() as any));
            setTickets(collectTickets(buckets));
            setLoading(false);
          },
          (err) => {
            console.error(err);
            toast.error(err?.message || "Failed to load assigned tickets");
            setLoading(false);
          }
        );
        projectTicketUnsubs.current.push(unsubMeAssigned);

        // 3) personal tickets (assignees array-contains me)
        const unsubMeInArray = onSnapshot(
          query(collection(db, "tickets"), where("orgId", "==", org), where("assignees", "array-contains", uid)),
          (tsnap) => {
            buckets["__meInArray"] = tsnap.docs.map((d) => toTicket(d.id, d.data() as any));
            setTickets(collectTickets(buckets));
            setLoading(false);
          },
          (err) => {
            console.error(err);
            toast.error(err?.message || "Failed to load assigned tickets");
            setLoading(false);
          }
        );
        projectTicketUnsubs.current.push(unsubMeInArray);

        // 4) created by me (optional but handy)
        const unsubMeCreated = onSnapshot(
          query(collection(db, "tickets"), where("orgId", "==", org), where("createdBy", "==", uid)),
          (tsnap) => {
            buckets["__meCreated"] = tsnap.docs.map((d) => toTicket(d.id, d.data() as any));
            setTickets(collectTickets(buckets));
            setLoading(false);
          },
          (err) => {
            console.error(err);
            toast.error(err?.message || "Failed to load your tickets");
            setLoading(false);
          }
        );
        projectTicketUnsubs.current.push(unsubMeCreated);
      },
      (err) => {
        console.error(err);
        toast.error(err?.message || "Failed to load your projects");
        setLoading(false);
      }
    );
  }

  function collectTickets(buckets: Record<string, Ticket[]>) {
    // merge + de-dup by id
    const map = new Map<string, Ticket>();
    Object.values(buckets).forEach((arr) => {
      arr.forEach((t) => map.set(t.id, t));
    });
    return Array.from(map.values());
  }

  function toTicket(id: string, x: any): Ticket {
    const assigneeIds: string[] = Array.isArray(x.assignees)
      ? x.assignees
      : x.assignedTo
      ? [x.assignedTo]
      : [];

    return {
      id,
      title: x.title || "Untitled",
      description: x.description || "",
      status: (x.status || "todo") as TicketStatus,
      orgId: x.orgId,
      projectId: x.projectId,
      assignedTo: x.assignedTo,
      assignees: assigneeIds,
      priority: (x.priority || "medium") as "low" | "medium" | "high",
      createdAt: x.createdAt,
      createdBy: x.createdBy,
      projectName: projects[x.projectId]?.name || x.projectName || "",
      assigneeList: assigneeIds.map((id: string) => ({ id, name: usersMap[id]?.name || id })),
    };
  }

  /** Group by status */
const grouped = useMemo(() => {
  const map: Record<TicketStatus, Ticket[]> = { todo: [], doing: [], done: [] };
  if (!tickets || !Array.isArray(tickets)) return map;
  for (const t of tickets) {
    const key: TicketStatus =
      t?.status && ["todo", "doing", "done"].includes(t.status)
        ? t.status
        : "todo";
    map[key].push(t);
  }
  return map;
}, [tickets]);


  /** Move handler -> updates Firestore */
  async function moveTicket(t: Ticket, status: TicketStatus) {
    if (t.status === status) return;
    try {
      await updateDoc(doc(db, "tickets", t.id), { status, updatedAt: new Date() });
      if (status === "done") toast.success(`🎉 "${t.title}" marked done`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update ticket");
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {loading && <div className="text-sm text-muted-foreground mb-3">Loading tickets…</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((c) => (
          <Column key={c.key} label={c.label} status={c.key} tickets={grouped[c.key]} onMove={moveTicket} />
        ))}
      </div>
    </DndProvider>
  );
}

/** ─────────────────────────────────────────────────────────
 * Column + Card (minimal; built-in DnD)
 * ────────────────────────────────────────────────────────*/
function Column({
  label,
  status,
  tickets,
  onMove,
}: {
  label: string;
  status: TicketStatus;
  tickets: Ticket[];
  onMove: (t: Ticket, s: TicketStatus) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop<
    { type: string; ticket: Ticket },
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: DND_TYPES.CARD,
      drop: (item) => onMove(item.ticket, status),
      canDrop: () => true,
      collect: (m) => ({ isOver: !!m.isOver(), canDrop: !!m.canDrop() }),
    }),
    [status, onMove]
  );

  return (
    <div
      ref={drop}
      className={cn(
        "rounded-md border bg-white p-3 transition-colors",
        isOver && canDrop ? "bg-blue-50" : "bg-white"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="font-medium">{label}</div>
        <Badge variant="secondary">{tickets.length}</Badge>
      </div>

      <div className="space-y-3 min-h-[40px]">
        {tickets.map((t) => (
          <Card key={t.id} ticket={t} />
        ))}
        {tickets.length === 0 && (
          <div className="text-xs text-muted-foreground">Drop tickets here</div>
        )}
      </div>
    </div>
  );
}

function Card({ ticket }: { ticket: Ticket }) {
  const [, drag] = useDrag(
    () => ({
      type: DND_TYPES.CARD,
      item: { type: DND_TYPES.CARD, ticket },
    }),
    [ticket]
  );

  const pri =
    ticket.priority === "high" ? "destructive" : ticket.priority === "low" ? "outline" : "secondary";

  return (
    <div ref={drag} className="rounded-md border bg-white p-3 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{ticket.title}</div>
          {ticket.projectName ? (
            <div className="text-xs text-muted-foreground truncate">{ticket.projectName}</div>
          ) : null}
        </div>
        <Badge variant={pri as any}>{ticket.priority || "medium"}</Badge>
      </div>

      {ticket.description ? (
        <>
          <Separator className="my-2" />
          <div className="text-xs text-muted-foreground line-clamp-3">
            {ticket.description}
          </div>
        </>
      ) : null}

      {ticket.assigneeList && ticket.assigneeList.length ? (
        <>
          <Separator className="my-2" />
          <div className="flex flex-wrap gap-1">
            {ticket.assigneeList.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                title={a.name || a.id}
              >
                {a.name || a.id}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
