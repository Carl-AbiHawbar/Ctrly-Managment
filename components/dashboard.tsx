"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

// Layout
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/Shared/Topbar";

// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Plus,
  ChevronDown,
  FileText,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Lock,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Your charts / cards (leave as-is in your codebase)
import { DonutChart } from "./donut-chart";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import { StatCard } from "./stat-card";

// Firebase
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

/* ─────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */
type Role =
  | "owner"
  | "client"
  | "video_editor"
  | "content_manager"
  | "graphic_designer"
  | "project_manager";

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
  orgId: string;
  name?: string;
  description?: string;
  status?: string; // "active" | "in-progress" | "completed" | "planning" | etc.
  progress?: number; // 0..100
  deadline?: any; // Firestore Timestamp | ISO | string
  members?: string[];
  logoUrl?: string;
};

type TicketDoc = {
  id: string;
  orgId: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  assignees?: string[];
  createdBy?: string;
  dueAt?: any; // Timestamp | ISO | string
};

type TaskListItem = {
  id: string;
  title: string;
  completed: boolean;
  due: string;
  status: "today" | "tomorrow" | "upcoming";
  priority: "low" | "medium" | "high";
  assignees: { name: string; avatar?: string }[];
};

type TeamRow = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  tasks: { total: number; running: number; completed: number };
  performance: number; // simple week delta placeholder
};

/* ─────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */
function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function parseDateLike(x: any): Date | null {
  try {
    if (!x) return null;
    if (typeof x?.toDate === "function") return x.toDate();
    if (typeof x === "string") return new Date(x);
    if (x instanceof Date) return x;
    return null;
  } catch {
    return null;
  }
}

function formatDueForBadge(date: Date | null): { label: string; bucket: "today" | "tomorrow" | "upcoming" } {
  if (!date) return { label: "No due date", bucket: "upcoming" };
  const now = new Date();
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d1 = new Date(d0);
  d1.setDate(d0.getDate() + 1);

  const isToday = date >= d0 && date < d1;
  if (isToday) {
    return { label: `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`, bucket: "today" };
  }
  const d2 = new Date(d1);
  d2.setDate(d1.getDate() + 1);
  const isTomorrow = date >= d1 && date < d2;
  if (isTomorrow) {
    return { label: `Tomorrow, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`, bucket: "tomorrow" };
  }
  return { label: date.toLocaleDateString(), bucket: "upcoming" };
}

function smartProjectStatus(p?: ProjectDoc): "Planning" | "In Progress" | "Completed" | "Active" | "Archived" {
  if (!p) return "Active";
  const s = (p.status || "").toLowerCase();
  if (s === "completed" || p.progress === 100) return "Completed";
  if (s === "planning") return "Planning";
  if (s === "archived") return "Archived";
  return "In Progress";
}

/* ─────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // me
  const [me, setMe] = useState<UserDoc | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // data
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [users, setUsers] = useState<Record<string, UserDoc>>({});
  const [ticketsMy, setTicketsMy] = useState<TicketDoc[]>([]);
  const [ticketsOrg, setTicketsOrg] = useState<TicketDoc[]>([]); // owner

  // loading
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // unsub refs
  const unsubProjectsRef = useRef<Unsubscribe | null>(null);
  const unsubTicketsRef = useRef<Unsubscribe[]>([]);
  const unsubOwnerTicketsRef = useRef<Unsubscribe | null>(null);
  const unsubUsersRef = useRef<Unsubscribe | null>(null);

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      // cleanup previous listeners on auth change
      unsubProjectsRef.current?.();
      unsubProjectsRef.current = null;
      unsubTicketsRef.current.forEach((u) => u());
      unsubTicketsRef.current = [];
      unsubOwnerTicketsRef.current?.();
      unsubOwnerTicketsRef.current = null;
      unsubUsersRef.current?.();
      unsubUsersRef.current = null;

      setProjects([]);
      setTicketsMy([]);
      setTicketsOrg([]);
      setUsers({});

      if (!u) {
        setMe(null);
        setOrgId(null);
        setIsOwner(false);
        setLoadingProjects(false);
        setLoadingTickets(false);
        setLoadingUsers(false);
        toast.error("Not signed in");
        return;
      }

      try {
        const meSnap = await getDoc(doc(db, "users", u.uid));
        const meDoc = (meSnap.exists()
          ? { uid: u.uid, ...(meSnap.data() as any) }
          : { uid: u.uid }) as UserDoc;

        setMe(meDoc);
        setOrgId(meDoc.orgId || null);
        setIsOwner(meDoc.role === "owner");

        if (!meDoc.orgId) {
          toast.error("Your account has no orgId.");
          return;
        }

        // stream org users
        setLoadingUsers(true);
        unsubUsersRef.current = onSnapshot(
          query(collection(db, "users"), where("orgId", "==", meDoc.orgId)),
          (snap) => {
            const map: Record<string, UserDoc> = {};
            snap.forEach((d) => (map[d.id] = { uid: d.id, ...(d.data() as any) }));
            setUsers(map);
            setLoadingUsers(false);
          },
          (err) => {
            console.error(err);
            toast.error(err?.message || "Failed to load users");
            setLoadingUsers(false);
          }
        );

        // stream projects (owner: all org; member: where I'm in members)
        setLoadingProjects(true);
        const pq =
          meDoc.role === "owner"
            ? query(collection(db, "projects"), where("orgId", "==", meDoc.orgId))
            : query(
                collection(db, "projects"),
                where("orgId", "==", meDoc.orgId),
                where("members", "array-contains", meDoc.uid)
              );
        unsubProjectsRef.current = onSnapshot(
          pq,
          (snap) => {
            const arr: ProjectDoc[] = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as any),
            }));
            setProjects(arr);
            setLoadingProjects(false);
          },
          (err) => {
            console.error(err);
            toast.error(err?.message || "Failed to load projects");
            setLoadingProjects(false);
          }
        );

        // tickets:
        setLoadingTickets(true);

        // owner -> one stream of all org tickets
        if (meDoc.role === "owner") {
          unsubOwnerTicketsRef.current = onSnapshot(
            query(collection(db, "tickets"), where("orgId", "==", meDoc.orgId)),
            (snap) => {
              const arr: TicketDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              setTicketsOrg(arr);
              setTicketsMy(arr.filter((t) => t.assignedTo === meDoc.uid || (t.assignees || []).includes(meDoc.uid) || t.createdBy === meDoc.uid));
              setLoadingTickets(false);
            },
            (err) => {
              console.error(err);
              toast.error(err?.message || "Failed to load tickets");
              setLoadingTickets(false);
            }
          );
        } else {
          // member -> merge 3 lightweight queries
          const buckets: Record<string, TicketDoc[]> = {};
          function publish() {
            const map = new Map<string, TicketDoc>();
            Object.values(buckets).forEach((arr) => arr.forEach((t) => map.set(t.id, t)));
            setTicketsMy(Array.from(map.values()));
            setLoadingTickets(false);
          }

          const unsub1 = onSnapshot(
            query(collection(db, "tickets"), where("orgId", "==", meDoc.orgId), where("assignedTo", "==", meDoc.uid)),
            (snap) => {
              buckets["assignedTo"] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              publish();
            },
            (err) => {
              console.error(err);
              toast.error("Failed to load assigned tickets");
              setLoadingTickets(false);
            }
          );
          const unsub2 = onSnapshot(
            query(collection(db, "tickets"), where("orgId", "==", meDoc.orgId), where("assignees", "array-contains", meDoc.uid)),
            (snap) => {
              buckets["assignees"] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              publish();
            },
            (err) => {
              console.error(err);
              toast.error("Failed to load assigned tickets");
              setLoadingTickets(false);
            }
          );
          const unsub3 = onSnapshot(
            query(collection(db, "tickets"), where("orgId", "==", meDoc.orgId), where("createdBy", "==", meDoc.uid)),
            (snap) => {
              buckets["createdBy"] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              publish();
            },
            (err) => {
              console.error(err);
              toast.error("Failed to load your tickets");
              setLoadingTickets(false);
            }
          );
          unsubTicketsRef.current = [unsub1, unsub2, unsub3];
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Failed to load profile");
      }
    });

    return () => {
      unsub();
      unsubProjectsRef.current?.();
      unsubTicketsRef.current.forEach((u) => u());
      unsubOwnerTicketsRef.current?.();
      unsubUsersRef.current?.();
    };
  }, []);

  /* ───────────── Stats: Projects ───────────── */
  const projectStats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => smartProjectStatus(p) === "Completed").length;
    const inProgress = projects.filter((p) => smartProjectStatus(p) === "In Progress").length;
    const now = new Date();
    const overdue = projects.filter((p) => {
      const d = parseDateLike(p.deadline);
      const done = smartProjectStatus(p) === "Completed";
      return !!d && d < now && !done;
    }).length;

    return { total, completed, inProgress, overdue };
  }, [projects]);

  /* ───────────── My Tasks → today/tomorrow/upcoming ───────────── */
  const myTaskGroups = useMemo(() => {
    // convert ticketsMy to TaskListItem[]
    const items: TaskListItem[] = ticketsMy.map((t) => {
      const due = parseDateLike(t.dueAt);
      const { label, bucket } = formatDueForBadge(due);
      return {
        id: t.id,
        title: t.title || "Untitled task",
        completed: t.status === "done",
        due: label,
        status: bucket,
        priority: (t.priority || "medium") as "low" | "medium" | "high",
        assignees: (t.assignees || (t.assignedTo ? [t.assignedTo] : []))?.map((uid) => ({
          name: users[uid]?.displayName || users[uid]?.email || uid,
          avatar: users[uid]?.photoURL,
        })),
      };
    });

    const byProject = new Map<string, TaskListItem[]>();
    items.forEach((it) => {
      // We do not have project name directly here; optional enhancement: join tickets to projects by projectId.
      // For grouping below, we’ll display without per-project header inside tab (still fine).
      const key = "All Projects";
      const arr = byProject.get(key) || [];
      arr.push(it);
      byProject.set(key, arr);
    });

    // group into tabs
    const today = items.filter((i) => i.status === "today");
    const tomorrow = items.filter((i) => i.status === "tomorrow");
    const upcoming = items.filter((i) => i.status === "upcoming");

    return { today, tomorrow, upcoming, raw: items };
  }, [ticketsMy, users]);

  // donut for my progress
  const donutData = useMemo(() => {
    const total = ticketsMy.length || 1;
    const completed = ticketsMy.filter((t) => t.status === "done").length;
    const doing = ticketsMy.filter((t) => t.status === "doing").length;
    const todo = total - completed - doing;
    return [
      { name: "Completed", value: Math.round((completed / total) * 100), color: "#10b981" },
      { name: "In Progress", value: Math.round((doing / total) * 100), color: "#f59e0b" },
      { name: "Not Started", value: Math.max(0, Math.min(100, 100 - Math.round((completed / total) * 100) - Math.round((doing / total) * 100))), color: "#6b7280" },
    ];
  }, [ticketsMy]);

  /* ───────────── Team performance (owner only) ───────────── */
  const teamRows: TeamRow[] = useMemo(() => {
    if (!isOwner) return [];
    // compute from org tickets
    const perUser = new Map<string, { total: number; running: number; completed: number }>();
    ticketsOrg.forEach((t) => {
      const assignees = t.assignees || (t.assignedTo ? [t.assignedTo] : []);
      assignees.forEach((uid) => {
        const cur = perUser.get(uid) || { total: 0, running: 0, completed: 0 };
        cur.total += 1;
        if (t.status === "doing") cur.running += 1;
        if (t.status === "done") cur.completed += 1;
        perUser.set(uid, cur);
      });
    });

    // map to display rows for all org users (even those with zero tasks)
    return Object.keys(users).map((uid) => {
      const u = users[uid];
      const agg = perUser.get(uid) || { total: 0, running: 0, completed: 0 };
      // simple fake delta = completed - running (bounded)
      const perf = Math.max(-20, Math.min(20, agg.completed - agg.running));
      return {
        id: uid,
        name: u.displayName || u.email || uid,
        email: u.email,
        role: u.role,
        avatar: u.photoURL,
        tasks: agg,
        performance: perf,
      };
    });
  }, [isOwner, ticketsOrg, users]);

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col overflow-hidden pt-16">
        <Topbar name="Home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
          {/* Stats Overview */}
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 xl:gap-6">
              <StatCard title="Total Projects" value={String(projectStats.total)} change="" changeText="" icon={FileText} trend="up" />
              <StatCard title="In Progress" value={String(projectStats.inProgress)} change="" changeText="" icon={Clock} trend="up" />
              <StatCard title="Completed" value={String(projectStats.completed)} change="" changeText="" icon={CheckCircle} trend="up" />
              <StatCard title="Overdue" value={String(projectStats.overdue)} change="" changeText="" icon={BarChart2} trend={projectStats.overdue > 0 ? "down" : "up"} />
            </div>
          </section>

          {/* Project Overview Cards */}
          <section className="mb-8">
            <div className="flex flex-wrap gap-2 md:gap-3 items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Project Overview</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <Link href="/projects">View All</Link>
                </Button>
              </div>
            </div>

            {loadingProjects ? (
              <div className="text-sm text-muted-foreground p-3">Loading projects…</div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3">No projects yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 xl:gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>

          {/* Analytics and Tasks */}
          <div className="grid grid-cols-12 gap-3 xl:gap-6 mb-8">
            {/* Analytics */}
            <div className="col-span-12 xl:col-span-8">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div>
                      <CardTitle>Project Analytics</CardTitle>
                      <CardDescription>Task completion and project progress over time</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          This Month
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>This Week</DropdownMenuItem>
                        <DropdownMenuItem>This Month</DropdownMenuItem>
                        <DropdownMenuItem>This Quarter</DropdownMenuItem>
                        <DropdownMenuItem>This Year</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <AreaChart />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Progress */}
            <div className="col-span-12 xl:col-span-4">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Progress</CardTitle>
                      <CardDescription>Your task completion rate</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Export Data</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <DonutChart data={donutData} />
                  <div className="grid grid-cols-3 gap-4 w-full mt-6">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-900">{donutData[0].value}%</span>
                      <span className="text-xs text-gray-500">Completed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-900">{donutData[1].value}%</span>
                      <span className="text-xs text-gray-500">In Progress</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-gray-900">{donutData[2].value}%</span>
                      <span className="text-xs text-gray-500">Not Started</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tasks and Team Performance */}
          <div className="grid grid-cols-12 gap-3 md:gap-6 mb-8">
            {/* My Tasks */}
            <div className="col-span-12 xl:col-span-8">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>My Tasks</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/my-tasks">View All Tasks</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="today">Today</TabsTrigger>
                      <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    </TabsList>

                    <TabsContent value="today" className="mt-0">
                      <div className="space-y-2">
                        {myTaskGroups.today.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No tasks for today.</div>
                        ) : (
                          myTaskGroups.today.map((task) => <TaskItem key={task.id} task={task} />)
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="tomorrow" className="mt-0">
                      <div className="space-y-2">
                        {myTaskGroups.tomorrow.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No tasks for tomorrow.</div>
                        ) : (
                          myTaskGroups.tomorrow.map((task) => <TaskItem key={task.id} task={task} />)
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="upcoming" className="mt-0">
                      <div className="space-y-2">
                        {myTaskGroups.upcoming.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No upcoming tasks.</div>
                        ) : (
                          myTaskGroups.upcoming.map((task) => <TaskItem key={task.id} task={task} />)
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-center">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/kanban">
                      <Plus className="h-4 w-4 mr-2" />
                      Add / Manage Tasks
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Team Performance (owner only) */}
            <div className="col-span-12 xl:col-span-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Performance</CardTitle>
                      <CardDescription>Weekly task completion rate</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isOwner ? (
                    <>
                      <div className="h-[300px] mb-4">
                        <BarChart />
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-500">Tasks</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-500">Performance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teamRows.map((m) => (
                              <tr key={m.id} className="border-b border-gray-100">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-3">
                                      <AvatarImage src={m.avatar || "/placeholder.svg"} alt={m.name} />
                                      <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-gray-900">{m.name}</div>
                                      <div className="text-xs text-gray-500">{m.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-center space-x-2">
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{m.tasks.total}</span>
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">{m.tasks.running}</span>
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{m.tasks.completed}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-nowrap">
                                  <div className="flex justify-center items-center">
                                    <Badge
                                      className={cn(
                                        "font-medium",
                                        m.performance > 0
                                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                                          : "bg-red-100 text-red-800 hover:bg-red-100"
                                      )}
                                    >
                                      {m.performance > 0 ? (
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                      ) : (
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                      )}
                                      {m.performance > 0 ? "+" : ""}
                                      {m.performance}% this week
                                    </Badge>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Only owners can view org-wide team performance.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Team Progress and Notes */}
          <div className="grid grid-cols-12 gap-3 xl:gap-6">
            <div className="col-span-12 xl:col-span-8">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Org members</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/contacts">
                        <Users className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(users).length === 0 ? (
                          <tr>
                            <td className="py-3 px-4 text-sm text-muted-foreground" colSpan={3}>
                              {loadingUsers ? "Loading members…" : "No members found."}
                            </td>
                          </tr>
                        ) : (
                          Object.values(users).map((u) => (
                            <tr key={u.uid} className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage src={u.photoURL || "/placeholder.svg"} alt={u.displayName || u.email || u.uid} />
                                    <AvatarFallback>{getInitials(u.displayName || u.email || u.uid)}</AvatarFallback>
                                  </Avatar>
                                  <div className="font-medium text-gray-900">
                                    {u.displayName || u.email || u.uid}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-nowrap">{u.role || "-"}</td>
                              <td className="py-3 px-4 text-gray-500 text-nowrap">{u.email || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <Card>
                <CardHeader className="pb-3 relative">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <CardTitle>Tomorrow Note</CardTitle>
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  </div>
                  <CardDescription>Your personal notes for tomorrow</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start"><span className="mr-2 text-blue-600 font-bold">•</span><span>Team meeting at 10:00 AM</span></li>
                    <li className="flex items-start"><span className="mr-2 text-blue-600 font-bold">•</span><span>Review design updates</span></li>
                    <li className="flex items-start"><span className="mr-2 text-blue-600 font-bold">•</span><span>Prepare client presentation</span></li>
                  </ul>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                  <Button variant="outline" size="sm">Edit Notes</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pieces
────────────────────────────────────────────────────────── */

function ProjectCard({ project }: { project: ProjectDoc }) {
  const statusPretty = smartProjectStatus(project);
  const deadline = parseDateLike(project.deadline);
  const deadlineText = deadline ? deadline.toLocaleDateString() : "—";
  const progress = typeof project.progress === "number" ? project.progress : 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 justify-between items-start">
          <div className="flex items-start space-x-2">
            <div
              className={cn(
                "w-1 h-12 rounded-full",
                statusPretty === "In Progress" && "bg-yellow-500",
                statusPretty === "Completed" && "bg-green-500",
                statusPretty === "Planning" && "bg-blue-500",
                statusPretty === "Active" && "bg-sky-500",
                statusPretty === "Archived" && "bg-gray-400"
              )}
            />
            <div>
              <CardTitle className="text-lg flex items-center">{project.name || "Untitled Project"}</CardTitle>
              <CardDescription>{project.description || "—"}</CardDescription>
            </div>
          </div>
          <Badge
            className={cn(
              "font-medium text-nowrap",
              statusPretty === "In Progress" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
              statusPretty === "Completed" && "bg-green-100 text-green-800 hover:bg-green-100",
              statusPretty === "Planning" && "bg-blue-100 text-blue-800 hover:bg-blue-100"
            )}
          >
            {statusPretty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-gray-500 text-sm">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Deadline: {deadlineText}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex -space-x-2">
            {(project.members || []).slice(0, 5).map((uid) => (
              <Avatar key={uid} className="h-8 w-8 border-2 border-white">
                {/* In a perfect world you’d join user photo here; omitted for brevity */}
                <AvatarFallback>{getInitials(uid)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1" />
              <span>{(project as any)?.tasks || 0} tasks</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="h-3.5 w-3.5 mr-1" />
              <span>{(project as any)?.activity || 0} activities</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskItem({ task }: { task: TaskListItem }) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
      <div className="flex items-center">
        <Checkbox id={`task-${task.id}`} className="mr-3" defaultChecked={task.completed} disabled />
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={`task-${task.id}`}
            className={cn("font-medium text-gray-900", task.completed && "line-through text-gray-500")}
          >
            {task.title}
          </label>
          <div className="flex flex-wrap gap-2 items-center mt-1">
            {task.due && (
              <div className="flex items-center text-xs mr-3">
                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                <span
                  className={cn(
                    task.status === "today" && "text-blue-600",
                    task.status === "tomorrow" && "text-yellow-600",
                    task.status === "upcoming" && "text-gray-500"
                  )}
                >
                  {task.due}
                </span>
              </div>
            )}
            {task.priority && (
              <Badge
                className={cn(
                  "text-xs",
                  task.priority === "high" && "bg-red-100 text-red-800 hover:bg-red-100",
                  task.priority === "medium" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                  task.priority === "low" && "bg-green-100 text-green-800 hover:bg-green-100"
                )}
              >
                {task.priority}
              </Badge>
            )}
            {task.completed && (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {task.assignees?.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.map((assignee, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
