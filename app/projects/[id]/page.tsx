'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  createdAt?: any;
};

type Ticket = {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt?: any;
  projectId: string;
  orgId: string;
};

export default function ProjectView({ params }: { params: { id: string } }) {
  const projectId = params.id;

  const [userUid, setUserUid] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // separate input states to avoid clashing
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserUid(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // load project once
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const pRef = doc(db, 'projects', projectId);
        const snap = await getDoc(pRef);
        if (!snap.exists()) {
          toast.error('Project not found');
          return;
        }
        setProject({ id: snap.id, ...snap.data() });
      } catch (e: any) {
        console.error(e);
        toast.error('Failed to load project');
      }
    })();
  }, [projectId]);

  // live tasks under subcollection: projects/{id}/tasks
  useEffect(() => {
    if (!projectId) return;
    const tRef = collection(db, 'projects', projectId, 'tasks');
    const qy = query(tRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows: Task[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setTasks(rows);
      },
      (err) => {
        console.error(err);
        toast.error('Failed to load tasks');
      }
    );
    return () => unsub();
  }, [projectId]);

  // live tickets (top-level) filtered by projectId
  useEffect(() => {
    if (!projectId || !project?.orgId) return;
    const kRef = collection(db, 'tickets');
    const qy = query(
      kRef,
      where('projectId', '==', projectId),
      where('orgId', '==', project.orgId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows: Ticket[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setTickets(rows);
      },
      (err) => {
        console.error(err);
        toast.error('Failed to load tickets');
      }
    );
    return () => unsub();
  }, [projectId, project?.orgId]);

  // add task to subcollection
  async function addTask() {
    if (!userUid) return toast.error('Not signed in');
    if (!taskTitle.trim()) return;

    try {
      const tRef = collection(db, 'projects', projectId, 'tasks');
      await addDoc(tRef, {
        title: taskTitle.trim(),
        description: taskDesc.trim() || '',
        status: 'todo' as const,
        createdAt: serverTimestamp(),
        createdBy: userUid,
      });
      setTaskTitle('');
      setTaskDesc('');
      toast.success('Task added');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to add task');
    }
  }

  // update task status
  async function setTaskStatus(id: string, status: Task['status']) {
    try {
      const ref = doc(db, 'projects', projectId, 'tasks', id);
      await updateDoc(ref, { status });
      // local state will update via onSnapshot
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to update task');
    }
  }

  // add ticket to top-level collection with projectId + orgId
  async function addTicket() {
    if (!userUid) return toast.error('Not signed in');
    if (!ticketTitle.trim()) return;
    if (!project?.orgId) return toast.error('Project missing orgId');

    try {
      const kRef = collection(db, 'tickets');
      await addDoc(kRef, {
        title: ticketTitle.trim(),
        description: ticketDesc.trim() || '',
        status: 'open' as const,
        createdAt: serverTimestamp(),
        createdBy: userUid,
        projectId,
        orgId: project.orgId,
      });
      setTicketTitle('');
      setTicketDesc('');
      toast.success('Ticket opened');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to open ticket');
    }
  }

  // update ticket status
  async function setTicketStatus(id: string, status: Ticket['status']) {
    try {
      const ref = doc(db, 'tickets', id);
      await updateDoc(ref, { status });
      // local state will update via onSnapshot
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to update ticket');
    }
  }

  const projectStatus = useMemo(
    () => project?.status || 'active',
    [project?.status]
  );

  if (!project) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="text-sm text-muted-foreground">Status: {projectStatus}</div>
      </div>
      {project.description ? (
        <p className="text-muted-foreground">{project.description}</p>
      ) : null}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="space-y-3">
          <h2 className="font-medium">Tasks</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Button onClick={addTask}>Add</Button>
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.status}</div>
                    {t.description ? (
                      <div className="text-sm text-muted-foreground mt-1">{t.description}</div>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {(['todo', 'doing', 'done'] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={t.status === s ? 'default' : 'outline'}
                        onClick={() => setTaskStatus(t.id, s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
            {tasks.length === 0 && <li className="text-sm text-muted-foreground">No tasks yet.</li>}
          </ul>
        </div>

        {/* Tickets */}
        <div className="space-y-3">
          <h2 className="font-medium">Tickets</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Ticket title"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
            />
            <Button onClick={addTicket}>Open</Button>
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={ticketDesc}
            onChange={(e) => setTicketDesc(e.target.value)}
          />
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.status.replace('_', ' ')}
                    </div>
                    {t.description ? (
                      <div className="text-sm text-muted-foreground mt-1">{t.description}</div>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {(['open', 'in_progress', 'closed'] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={t.status === s ? 'default' : 'outline'}
                        onClick={() => setTicketStatus(t.id, s)}
                      >
                        {s.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
            {tickets.length === 0 && <li className="text-sm text-muted-foreground">No tickets yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
