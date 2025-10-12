'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Sidebar from '@/components/sidebar';
import Topbar from '@/components/Shared/Topbar';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Calendar, Clock, FileText, CheckSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// Firebase
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

type UserDoc = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'owner' | 'client' | 'video_editor' | 'content_manager' | 'graphic_designer' | 'project_manager';
  orgId?: string;
};

type ProjectDoc = {
  name: string;
  description?: string;
  status?: string;
  progress?: number;
  deadline?: string;
  startDate?: string;
  orgId?: string;
  members?: string[]; // array of user uids
  logoUrl?: string;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  createdAt?: any;
  createdBy: string; // uid
  assignee?: string; // uid
};

function initials(name?: string, email?: string) {
  if (name && name.trim()) {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[p.length - 1]?.[0] || '')).toUpperCase() || 'U';
  }
  return (email?.[0] || 'U').toUpperCase();
}

export default function ProjectPage() {
  const router = useRouter();
  const { id: projectId } = useParams<{ id: string }>(); // ✅ no sync-access warning

  // layout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team'>('overview');

  // auth + role
  const [me, setMe] = useState<UserDoc | null>(null);
  const isOwner = me?.role === 'owner';

  // data
  const [project, setProject] = useState<(ProjectDoc & { id: string }) | null>(null);
  const [teamUsers, setTeamUsers] = useState<Record<string, UserDoc>>({});
  const [loading, setLoading] = useState(true);

  // unified tasks (used to be tickets)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // watch auth -> me
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setMe(null);
        return;
      }
      const snap = await getDoc(doc(db, 'users', u.uid)).catch(() => null);
      setMe(snap?.exists() ? (snap.data() as UserDoc) : null);
    });
    return () => unsub();
  }, []);

  // stream project
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, 'projects', projectId),
      (snap) => {
        if (!snap.exists()) {
          toast.error('Project not found');
          router.push('/projects');
          return;
        }
        setProject({ id: snap.id, ...(snap.data() as ProjectDoc) });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error('Failed to load project');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [projectId, router]);

  // stream unified tasks
  useEffect(() => {
    if (!project) return;
    let triedNoOrder = false;

    const base = collection(db, 'projects', project.id, 'tasks');
    const start = (noOrder = false) => {
      const qy = noOrder ? query(base) : query(base, orderBy('createdAt', 'desc'));
      return onSnapshot(
        qy,
        (snap) => {
          setTasks(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[]
          );
        },
        (err) => {
          // fallback if index missing
          if (!triedNoOrder && String(err?.message || '').includes('The query requires an index')) {
            triedNoOrder = true;
            console.warn('Create Firestore index for tasks(createdAt). Falling back without order.');
            unsub && unsub();
            unsub = start(true);
            return;
          }
          console.error(err);
          toast.error('Failed to load tasks');
        }
      );
    };
    let unsub = start(false);
    return () => unsub && unsub();
  }, [project]);

  // resolve team members for avatars/labels
  useEffect(() => {
    let active = true;
    (async () => {
      if (!project?.members?.length) {
        if (active) setTeamUsers({});
        return;
      }
      const pairs: [string, UserDoc | null][] = await Promise.all(
        project.members.map(async (uid) => {
          const s = await getDoc(doc(db, 'users', uid)).catch(() => null);
          return [uid, s?.exists() ? (s.data() as UserDoc) : null];
        })
      );
      if (!active) return;
      const obj: Record<string, UserDoc> = {};
      for (const [uid, u] of pairs) if (u) obj[uid] = u;
      setTeamUsers(obj);
    })();
    return () => {
      active = false;
    };
  }, [project?.members]);

  const tasksBy = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === 'todo'),
      doing: tasks.filter((t) => t.status === 'doing'),
      done: tasks.filter((t) => t.status === 'done'),
    };
  }, [tasks]);

  async function createTask() {
    if (!project || !me) return;
    const title = newTitle.trim();
    if (!title) return;
    try {
      await addDoc(collection(db, 'projects', project.id, 'tasks'), {
        title,
        description: newDesc || '',
        status: 'todo',
        createdAt: serverTimestamp(),
        createdBy: me.uid,
        assignee: me.uid, // default assign to creator (adjust if you add picker)
      });
      setNewTitle('');
      setNewDesc('');
      toast.success('Ticket/Task created');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to create');
    }
  }

  async function setTaskStatus(id: string, status: Task['status'], createdBy: string) {
    if (!project || !me) return;
    // owner can change any; non-owner can change only their own
    if (!isOwner && createdBy !== me.uid) {
      toast.error('Only owner or the creator can change status');
      return;
    }
    try {
      await updateDoc(doc(db, 'projects', project.id, 'tasks', id), { status });
      toast.success('Status updated');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to update');
    }
  }

  if (loading || !project) {
    return (
      <div className="bg-gray-50">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
          <Topbar name="Project" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }

  // safe display helpers
  const projectStatus = project.status || 'active';
  const progress = Math.round(project.progress || 0);

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
        <Topbar name="Project" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {project.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.logoUrl} alt="Logo" className="h-10 w-10 rounded-md object-cover border" />
                ) : (
                  <div className="h-10 w-10 rounded-md border bg-muted grid place-items-center text-xs">
                    {project.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                    <Badge variant={projectStatus === 'active' ? 'default' : 'secondary'}>
                      {projectStatus}
                    </Badge>
                  </div>
                  {project.description ? (
                    <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                  ) : null}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    {project.deadline ? (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Deadline: {project.deadline}
                      </span>
                    ) : null}
                    {project.startDate ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Started: {project.startDate}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="min-w-[220px]">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Progress</div>
                  <div className="text-lg font-semibold mb-2">{progress}%</div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>

            {/* Team avatars */}
            {project.members?.length ? (
              <div className="mt-4 flex -space-x-2">
                {project.members.slice(0, 8).map((uid) => {
                  const u = teamUsers[uid];
                  const av = u?.photoURL || '';
                  const dn = u?.displayName || u?.email || 'User';
                  return (
                    <Avatar key={uid} className="h-8 w-8 border-2 border-white">
                      {av ? <AvatarImage src={av} alt={dn} /> : null}
                      <AvatarFallback>{initials(dn, u?.email)}</AvatarFallback>
                    </Avatar>
                  );
                })}
                {project.members.length > 8 ? (
                  <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white grid place-items-center text-xs">
                    +{project.members.length - 8}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-4 md:px-6 py-6">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} defaultValue="overview">
            <TabsList className="flex flex-wrap gap-1 justify-start h-full md:w-max mb-6">
              <TabsTrigger value="overview">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tickets / Tasks
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>Project summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{project.description || 'No description.'}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TASKS (unified) */}
            <TabsContent value="tasks" className="space-y-6">
              {/* Anyone signed-in (and allowed by rules) can create */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Ticket / Task</CardTitle>
                  <CardDescription>Describe what needs to be done</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <Textarea placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <Button onClick={createTask}>Create</Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                {(['todo', 'doing', 'done'] as const).map((col) => (
                  <Card key={col}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium capitalize">{col}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {tasksBy[col].length === 0 ? (
                        <div className="text-xs text-muted-foreground">Nothing here.</div>
                      ) : (
                        tasksBy[col].map((t) => {
                          const creator = teamUsers[t.createdBy];
                          const canChange = isOwner || t.createdBy === me?.uid;
                          return (
                            <div key={t.id} className="border rounded p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{t.title}</div>
                                  {t.description ? (
                                    <div className="text-xs text-muted-foreground line-clamp-2">{t.description}</div>
                                  ) : null}
                                  <div className="mt-2 flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      {creator?.photoURL ? (
                                        <AvatarImage src={creator.photoURL} alt={creator.displayName || creator.email || 'User'} />
                                      ) : null}
                                      <AvatarFallback>
                                        {initials(creator?.displayName, creator?.email)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      {creator?.displayName || creator?.email || 'User'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  {(['todo', 'doing', 'done'] as const).map((s) => (
                                    <Button
                                      key={s}
                                      variant={t.status === s ? 'default' : 'outline'}
                                      disabled={!canChange}
                                      onClick={() => setTaskStatus(t.id, s, t.createdBy)}
                                    >
                                      {s}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TEAM */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>People on this project</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b bg-neutral-50">
                        <th className="p-3">Member</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(project.members || []).map((uid) => {
                        const u = teamUsers[uid];
                        const dn = u?.displayName || u?.email || 'User';
                        return (
                          <tr key={uid} className="border-b">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {u?.photoURL ? <AvatarImage src={u.photoURL} alt={dn} /> : null}
                                  <AvatarFallback>{initials(dn, u?.email)}</AvatarFallback>
                                </Avatar>
                                <span>{dn}</span>
                              </div>
                            </td>
                            <td className="p-3">{u?.email || '—'}</td>
                            <td className="p-3 capitalize">{u?.role?.replace('_', ' ') || '—'}</td>
                          </tr>
                        );
                      })}
                      {!project.members?.length && (
                        <tr>
                          <td className="p-3" colSpan={3}>
                            No members yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
