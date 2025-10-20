"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/Shared/Topbar";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

type TaskStatus = "todo" | "doing" | "done";

type TaskDoc = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt?: any;
  createdBy?: string;
  assignee?: string;   // unified name
  orgId?: string;      // required for owner view
  projectId: string;   // derived from parent
};

type ProjectInfo = {
  id: string;
  name: string;
  logoUrl?: string;
};

type Me = { uid: string; role?: string; orgId?: string };

export default function MyTasksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [projectsMap, setProjectsMap] = useState<Record<string, ProjectInfo>>({});
  const [qText, setQText] = useState("");

  // Watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setMe(null);
        setTasks([]);
        setProjectsMap({});
        setLoading(false);
        toast.error("Not signed in");
        return;
      }
      try {
        const meSnap = await getDoc(doc(db, "users", u.uid));
        const d = meSnap.data() as any;
        setMe({ uid: u.uid, role: d?.role, orgId: d?.orgId });
      } catch {
        setMe({ uid: u.uid });
      }
    });
    return () => unsub();
  }, []);

  // Stream tasks (owner => all org, else => only assigned to me)
  useEffect(() => {
    if (!me?.uid) return;

    setLoading(true);
    const base = collectionGroup(db, "tasks");

    let unsub: undefined | (() => void);
    let hasRetriedWithoutOrder = false; // prevent infinite loops

    const mapDocs = (docs: QueryDocumentSnapshot<DocumentData>[]) =>
      docs.map((d) => {
        const projectId = d.ref.parent.parent?.id || "";
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title || "Untitled task",
          description: data.description || "",
          status: (data.status || "todo") as TaskStatus,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          assignee: data.assignee,
          orgId: data.orgId,
          projectId,
        } as TaskDoc;
      });

    const fetchMissingProjectInfo = async (rows: TaskDoc[]) => {
      const needed = Array.from(new Set(rows.map((t) => t.projectId))).filter(
        (pid) => pid && !projectsMap[pid]
      );
      if (!needed.length) return;

      // Batch fetch project docs
      const updates: Record<string, ProjectInfo> = {};
      await Promise.all(
        needed.map(async (pid) => {
          try {
            const pSnap = await getDoc(doc(db, "projects", pid));
            if (pSnap.exists()) {
              const d = pSnap.data() as any;
              updates[pid] = { id: pid, name: d.name || "Untitled project", logoUrl: d.logoUrl || "" };
            }
          } catch {
            // ignore failures per project
          }
        })
      );
      if (Object.keys(updates).length) {
        setProjectsMap((m) => ({ ...m, ...updates }));
      }
    };

    const startStream = (noOrder = false) => {
      // Build query based on role
      const qy =
        me.role === "owner" && me.orgId
          ? noOrder
            ? query(base, where("orgId", "==", me.orgId))
            : query(base, where("orgId", "==", me.orgId), orderBy("createdAt", "desc"))
          : noOrder
            ? query(base, where("assignee", "==", me.uid))
            : query(base, where("assignee", "==", me.uid), orderBy("createdAt", "desc"));

      // Close previous listener (if any) before opening a new one
      unsub?.();

      unsub = onSnapshot(
        qy,
        async (snap) => {
          const rows = mapDocs(snap.docs);

          // Debug: verify fields coming back
          // console.log(`[MyTasksPage] role=${me.role} orgId=${me.orgId} rows=${rows.length}`, rows.slice(0,3).map(r => ({id:r.id, projectId:r.projectId, assignee:r.assignee, orgId:r.orgId})));

          setTasks(rows);
          await fetchMissingProjectInfo(rows);
          setLoading(false);
        },
        (err: any) => {
          // If composite index missing, retry once without orderBy
          const needsIndex =
            err?.code === "failed-precondition" && String(err?.message || "").includes("create it here");
          if (!noOrder && !hasRetriedWithoutOrder && needsIndex) {
            console.warn("Missing index for tasks. Retrying without orderBy.");
            hasRetriedWithoutOrder = true;
            startStream(true);
            return;
          }
          console.error(err);
          toast.error("Failed to load tasks");
          setLoading(false);
        }
      );
    };

    startStream(false);

    return () => unsub?.();
    // IMPORTANT: do NOT include projectsMap in deps to avoid resubscribing loops
  }, [me?.uid, me?.role, me?.orgId]);

  // Client-side filter
  const filtered = useMemo(() => {
    if (!qText.trim()) return tasks;
    const ql = qText.toLowerCase();
    return tasks.filter((t) => {
      const p = projectsMap[t.projectId]?.name || "";
      return (
        t.title.toLowerCase().includes(ql) ||
        (t.description || "").toLowerCase().includes(ql) ||
        p.toLowerCase().includes(ql)
      );
    });
  }, [qText, tasks, projectsMap]);

  const todo = filtered.filter((t) => (t.status || "todo") === "todo");
  const doing = filtered.filter((t) => (t.status || "todo") === "doing");
  const done = filtered.filter((t) => (t.status || "todo") === "done");

  async function setStatus(t: TaskDoc, status: TaskStatus) {
    try {
      if (!t.projectId || !t.id) return;
      await updateDoc(doc(db, "projects", t.projectId, "tasks", t.id), { status });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  }

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
        <Topbar
          name={me?.role === "owner" ? "All Organization Tasks" : "My Assigned Tasks"}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50 p-3 lg:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Input
              placeholder={
                me?.role === "owner"
                  ? "Search all tasks (title, description, project)…"
                  : "Search my tasks…"
              }
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading tasks…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              {me?.role === "owner"
                ? "No tasks found in your organization."
                : "No tasks assigned to you yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Column title="To do" count={todo.length}>
                {todo.map((t) => (
                  <TaskItem
                    key={t.id + t.projectId}
                    task={t}
                    project={projectsMap[t.projectId]}
                    onSetStatus={setStatus}
                  />
                ))}
              </Column>

              <Column title="Doing" count={doing.length}>
                {doing.map((t) => (
                  <TaskItem
                    key={t.id + t.projectId}
                    task={t}
                    project={projectsMap[t.projectId]}
                    onSetStatus={setStatus}
                  />
                ))}
              </Column>

              <Column title="Done" count={done.length}>
                {done.map((t) => (
                  <TaskItem
                    key={t.id + t.projectId}
                    task={t}
                    project={projectsMap[t.projectId]}
                    onSetStatus={setStatus}
                  />
                ))}
              </Column>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Column({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {count === 0 ? <div className="text-xs text-muted-foreground">No items.</div> : children}
      </CardContent>
    </Card>
  );
}

function TaskItem({
  task,
  project,
  onSetStatus,
}: {
  task: TaskDoc;
  project?: ProjectInfo;
  onSetStatus: (t: TaskDoc, status: TaskStatus) => void;
}) {
  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="min-w-0">
        <div className="font-medium truncate">{task.title}</div>
        {task.description ? (
          <div className="text-xs text-muted-foreground line-clamp-2">{task.description}</div>
        ) : null}
        <div className="text-xs mt-2">
          <span className="text-muted-foreground">Project:</span>{" "}
          <span className="font-medium">{project?.name || task.projectId}</span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={task.status === "todo" ? "default" : "outline"}
          onClick={() => onSetStatus(task, "todo")}
        >
          To do
        </Button>
        <Button
          size="sm"
          variant={task.status === "doing" ? "default" : "outline"}
          onClick={() => onSetStatus(task, "doing")}
        >
          Doing
        </Button>
        <Button
          size="sm"
          variant={task.status === "done" ? "default" : "outline"}
          onClick={() => onSetStatus(task, "done")}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
