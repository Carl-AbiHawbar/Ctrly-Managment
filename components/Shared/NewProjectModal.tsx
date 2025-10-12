'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// Firebase
import { auth, db } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';

type Role =
  | 'owner'
  | 'client'
  | 'video_editor'
  | 'content_manager'
  | 'graphic_designer'
  | 'project_manager';

type UserDoc = {
  uid: string;
  email: string;
  displayName?: string;
  orgId: string;
  role: Role;
  photoURL?: string;
};

type Permission = 'owner' | 'editor' | 'viewer';

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
  '🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '👍','👎','👏','🙌','👐','🤲','🤝','🙏','✌️','🤟',
  '🧠','👀','👁️','👄','👅','🎯','🚀','✨','🌟','🔥',
];

export default function NewProjectModal() {
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);

  // org + users
  const [me, setMe] = useState<UserDoc | null>(null);
  const [orgUsers, setOrgUsers] = useState<UserDoc[]>([]);

  // members & permissions
  const [members, setMembers] = useState<string[]>([]); // array of user UIDs
  const [permissions, setPermissions] = useState<Record<string, Permission>>({}); // uid -> permission

  // branding
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // data URL
  const [emoji, setEmoji] = useState<string | null>(null);
  const [tab, setTab] = useState<'upload' | 'emoji'>('upload');

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    // Load my user doc
    const myRef = doc(db, 'users', u.uid);
    const unsubMe = onSnapshot(myRef, (snap) => {
      const d = snap.data() as UserDoc | undefined;
      if (!d) return;
      setMe(d);

      // owner can read org users — stream them
      const usersQ = query(collection(db, 'users'), where('orgId', '==', d.orgId));
      const unsubUsers = onSnapshot(
        usersQ,
        (ss) => {
          const rows = ss.docs.map((x) => x.data() as UserDoc);
          setOrgUsers(rows);

          // default: ensure I am a member & owner
          if (!members.includes(d.uid)) {
            setMembers((m) => Array.from(new Set([...m, d.uid])));
          }
          setPermissions((p) => ({ ...p, [d.uid]: 'owner' }));
        },
        () => setOrgUsers([])
      );

      return () => unsubUsers();
    });

    return () => unsubMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => projectName.trim().length > 0, [projectName]);

  function toggleMember(uid: string, checked: boolean) {
    setMembers((prev) => {
      const next = new Set(prev);
      if (checked) next.add(uid);
      else next.delete(uid);
      return Array.from(next);
    });
  }

  function changePermission(uid: string, value: Permission) {
    setPermissions((prev) => ({ ...prev, [uid]: value }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setEmoji(null); // prefer uploaded image over emoji if both present
    };
    reader.readAsDataURL(file);
  }

  async function uploadLogoIfAny(projectId: string, orgId: string) {
    if (!uploadedImage) return null;
    const storage = getStorage();
    const path = `orgs/${orgId}/projects/${projectId}/logo`;
    const ref = storageRef(storage, path);
    // uploadedImage is a DataURL; upload as such for convenience
    await uploadString(ref, uploadedImage, 'data_url');
    const url = await getDownloadURL(ref);
    return url;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Not signed in');
      return;
    }
    if (!me) {
      toast.error('User profile missing');
      return;
    }
    if (!canSubmit) return;

    try {
      setSaving(true);

      // Create project with minimal fields first to get id
      const payload: any = {
        orgId: me.orgId,
        name: projectName.trim(),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        members: members.length ? members : [auth.currentUser.uid],
        permissions, // { uid: 'owner'|'editor'|'viewer' }
      };
      if (emoji) payload.emoji = emoji;

      const ref = await addDoc(collection(db, 'projects'), payload);
      let logoURL: string | null = null;

      // If there is an uploaded logo, upload to Storage and patch doc
      if (uploadedImage) {
        try {
          logoURL = await uploadLogoIfAny(ref.id, me.orgId);
        } catch (err) {
          console.error(err);
          toast.error('Logo upload failed (project created without logo)');
        }
      }
      if (logoURL) {
        await updateDoc(ref, { logoURL });
      }

      toast.success('Project created');
      // close dialog & refresh UI
      if (typeof window !== 'undefined') window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="hidden md:block w-full lg:max-w-[960px] h-full lg:h-max overflow-y-auto">
        <form onSubmit={handleCreate} className="contents">
          <DialogHeader>
            <DialogTitle className="text-xl lg:text-2xl">Create New Project</DialogTitle>
            <DialogDescription>Fill in the details to create a new project.</DialogDescription>
          </DialogHeader>

          <div className="p-2 overflow-y-auto mt-5">
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-7">
                {/* Project Name */}
                <div className="space-y-2">
                  <label htmlFor="project-name" className="block text-lg md:text-xl font-medium">
                    Project name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="project-name"
                    placeholder="Project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                {/* Team Section (dynamic) */}
                <div className="mt-5">
                  <h3 className="text-lg lg:text-xl font-medium mb-3">Team</h3>

                  <div className="space-y-3">
                    {orgUsers.map((u) => {
                      const checked = members.includes(u.uid);
                      const permVal: Permission = permissions[u.uid] || (u.uid === me?.uid ? 'owner' : 'viewer');
                      const initials = (u.displayName || u.email || '?')
                        .split(' ')
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <div key={u.uid} className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`m-${u.uid}`}
                              checked={checked}
                              onCheckedChange={(v) => toggleMember(u.uid, Boolean(v))}
                            />
                            <label htmlFor={`m-${u.uid}`} className="flex items-center space-x-3 cursor-pointer">
                              <Avatar>
                                {u.photoURL ? (
                                  <AvatarImage src={u.photoURL} alt={u.displayName || u.email || 'user'} />
                                ) : null}
                                <AvatarFallback>{initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.displayName || u.email || u.uid}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </label>
                          </div>

                          <Select
                            value={permVal}
                            onValueChange={(val) => changePermission(u.uid, val as Permission)}
                            disabled={u.uid === me?.uid} // current user locked as whatever you set (default owner)
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}

                    {orgUsers.length === 0 && (
                      <div className="text-sm text-gray-500">No users found in your org.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-12 lg:col-span-5">
                <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'emoji')} className="w-full">
                  <TabsList className="flex flex-wrap gap-2 w-max mb-4">
                    <TabsTrigger value="upload">Upload logo</TabsTrigger>
                    <TabsTrigger value="emoji">Emoji</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-0">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 h-40 relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt="Preview"
                          className="h-24 w-24 object-cover rounded-full"
                        />
                      ) : (
                        <>
                          <div className="rounded-full bg-gray-100 p-2 mb-2">
                            <Upload className="h-5 w-5 text-gray-500" />
                          </div>
                          <p className="text-sm font-medium">Upload project logo</p>
                          <p className="text-xs text-gray-500">Min 600x600, PNG or JPEG</p>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="emoji" className="mt-0">
                    <div className="h-40 overflow-y-auto">
                      <div className="grid grid-cols-8 gap-2">
                        {EMOJIS.map((e) => {
                          const active = emoji === e;
                          return (
                            <button
                              type="button"
                              key={e}
                              className={`aspect-square flex items-center justify-center text-2xl p-2 border rounded-md hover:bg-gray-50 ${
                                active ? 'ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => {
                                setEmoji(e);
                                setUploadedImage(null); // prefer emoji if selected
                              }}
                            >
                              {e}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-4 lg:mt-8">
                  {/* Optional secondary action area; removed "Update" dummy */}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-start gap-2 mt-4">
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
