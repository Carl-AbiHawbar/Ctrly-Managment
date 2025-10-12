'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Upload } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Firebase
import { auth, db, storage } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';

type Project = {
  id: string;
  name: string;
  description?: string;
  status?: string; // 'active' | 'paused' | etc
  progress?: number; // 0..100
  members?: string[];
  clients?: string[];
  orgId?: string;
  createdAt?: any;
  logoUrl?: string;
};

const STATUS_OPTIONS = ['active', 'paused', 'archived'];

export default function ProjectsList({
  viewMode,
  filterStatus,
}: {
  viewMode: 'grid' | 'list';
  filterStatus: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; status: string; progress: number }>({
    name: '',
    description: '',
    status: 'active',
    progress: 0,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // STREAM: auth -> my user -> projects
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    let unsubMe: (() => void) | undefined;
    let unsubProjects: (() => void) | undefined;

    setLoading(true);

    unsubAuth = onAuthStateChanged(auth, (u) => {
      setIsOwner(false);
      setOrgId(null);
      setProjects([]);
      unsubMe?.();
      unsubProjects?.();

      if (!u) {
        setLoading(false);
        return;
      }

      const meRef = doc(db, 'users', u.uid);
      unsubMe = onSnapshot(
        meRef,
        (meSnap) => {
          const me = meSnap.data() as { role?: string; orgId?: string } | undefined;
          const role = me?.role ?? null;
          const org = me?.orgId ?? null;
          setIsOwner(role === 'owner');
          setOrgId(org);

          unsubProjects?.();
          setProjects([]);

          if (!org) {
            setLoading(false);
            return;
          }

          const base = collection(db, 'projects');

          let qy =
            role === 'owner'
              ? query(base, where('orgId', '==', org), orderBy('createdAt', 'desc'))
              : query(
                  base,
                  where('orgId', '==', org),
                  where('members', 'array-contains', u.uid),
                  orderBy('createdAt', 'desc')
                );

          const startStream = (useNoOrder = false) => {
            if (useNoOrder) {
              qy =
                role === 'owner'
                  ? query(base, where('orgId', '==', org))
                  : query(base, where('orgId', '==', org), where('members', 'array-contains', u.uid));
            }
            unsubProjects = onSnapshot(
              qy,
              (snap) => {
                const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Project[];
                setProjects(rows);
                setLoading(false);
              },
              (err: any) => {
                if (err?.code === 'failed-precondition' && err?.message?.includes('create it here')) {
                  const link = err.message.match(/https?:\/\/[^\s)]+/)?.[0];
                  toast.error('Firestore index required. Open console to create it.');
                  if (link) console.warn('Create Firestore index:', link);
                  startStream(true); // retry without orderBy so UI still works
                  return;
                }
                console.error(err);
                toast.error('Failed to load projects');
                setLoading(false);
              }
            );
          };

          startStream(false);
        },
        (err) => {
          console.error(err);
          toast.error('Failed to load your profile');
          setLoading(false);
        }
      );
    });

    return () => {
      unsubProjects?.();
      unsubMe?.();
      unsubAuth?.();
    };
  }, []);

  // filter in client
  const filtered = useMemo(() => {
    if (!filterStatus) return projects;
    return projects.filter((p) => (p.status || 'active') === filterStatus);
  }, [projects, filterStatus]);

  // open edit
  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      status: p.status || 'active',
      progress: typeof p.progress === 'number' ? p.progress : 0,
    });
    setLogoFile(null);
    setEditOpen(true);
  }

  // submit edit
  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const ref = doc(db, 'projects', editing.id);

      // 1) update basic fields
      await updateDoc(ref, {
        name: form.name.trim() || 'Untitled project',
        description: (form.description || '').trim(),
        status: form.status,
        progress: Math.max(0, Math.min(100, Math.round(form.progress || 0))),
      });

      // 2) optional logo upload
      if (logoFile && orgId) {
        const path = `orgs/${orgId}/projects/${editing.id}/logo`;
        const sref = storageRef(storage, path);
        await uploadBytes(sref, logoFile);
        const url = await getDownloadURL(sref);
        await updateDoc(ref, { logoUrl: url });
      }

      toast.success('Project updated');
      setEditOpen(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(p: Project) {
    if (!isOwner) return;
    if (!confirm(`Delete project "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'projects', p.id));
      toast.success('Project deleted');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Delete failed');
    }
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading projects…</div>;
  if (!filtered.length) return <div className="p-6 text-sm text-muted-foreground">No projects yet.</div>;

  return (
    <>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
        {filtered.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.logoUrl}
                      alt={`${p.name} logo`}
                      className="h-8 w-8 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-md border bg-muted flex items-center justify-center text-xs">
                      {p.name?.[0]?.toUpperCase() || 'P'}
                    </div>
                  )}
                  <span className="truncate">{p.name || 'Untitled project'}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={(p.status || 'active') === 'active' ? 'default' : 'secondary'}>
                    {p.status || 'active'}
                  </Badge>

                  {isOwner && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDelete(p)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>

              {p.description ? <CardDescription className="line-clamp-2">{p.description}</CardDescription> : null}
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center gap-3 mb-2">
                <Progress value={p.progress || 0} className="h-2" />
                <span className="text-xs text-muted-foreground">{Math.round(p.progress || 0)}%</span>
              </div>

              <div className="flex justify-between items-center">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/projects/${p.id}/full-details`}>Full details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Update basic details and optionally replace the logo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Project name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Progress</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, progress: Number(e.target.value || 0) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Logo (optional)</label>
              <div className="flex items-center gap-3">
                {editing?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editing.logoUrl}
                    alt="Current logo"
                    className="h-10 w-10 rounded-md object-cover border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md border bg-muted" />
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG/JPG recommended. Uploading a new file replaces the current logo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
