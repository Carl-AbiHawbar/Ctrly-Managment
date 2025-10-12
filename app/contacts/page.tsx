"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

// Layout
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/Shared/Topbar";

// UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Firebase
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

// Types
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
  approved?: boolean;
};

type Contact = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: Role;
};

export default function ContactsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [me, setMe] = useState<UserDoc | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState("");

  const router = useRouter();

  // ── Auth + load my profile ───────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setMe(null);
        setOrgId(null);
        setContacts([]);
        setLoading(false);
        toast.error("Not signed in");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const meDoc = (snap.exists()
          ? { uid: u.uid, ...(snap.data() as any) }
          : { uid: u.uid }) as UserDoc;

        if (!meDoc.orgId) {
          toast.error("Your account is missing an orgId.");
          setMe(meDoc);
          setOrgId(null);
          setLoading(false);
          return;
        }

        setMe(meDoc);
        setOrgId(meDoc.orgId);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Failed to load profile");
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // ── Stream org users (except me) ─────────────────────────────
  useEffect(() => {
    if (!orgId || !me?.uid) return;

    setLoading(true);
    // owners may want to see unapproved users too; if you want only approved, keep `where("approved","==",true)`
    const qy = query(
      collection(db, "users"),
      where("orgId", "==", orgId),
      orderBy("displayName", "asc")
    );

    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows: Contact[] = snap.docs
          .map((d) => {
            const x = d.data() as any;
            return {
              uid: d.id,
              displayName: x.displayName || x.email || "Unnamed",
              email: x.email || "",
              photoURL: x.photoURL || "",
              role: x.role as Role | undefined,
            };
          })
          .filter((c) => c.uid !== me.uid); // exclude me

        setContacts(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error(err?.message || "Failed to load contacts");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [orgId, me?.uid]);

  // ── Filtered list ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!q.trim()) return contacts;
    const needle = q.toLowerCase();
    return contacts.filter(
      (c) =>
        c.displayName.toLowerCase().includes(needle) ||
        (c.email || "").toLowerCase().includes(needle) ||
        (c.role || "").toLowerCase().includes(needle)
    );
  }, [q, contacts]);

  // ── Start or open a conversation ─────────────────────────────
  async function startConversation(otherUid: string) {
    if (!me?.uid || !orgId) return;

    try {
      // 1) Try to find an existing DM (participants contains me)
      const existingSnap = await getDocs(
        query(
          collection(db, "conversations"),
          where("orgId", "==", orgId),
          where("participants", "array-contains", me.uid),
          limit(20)
        )
      );

      let existingId: string | null = null;
      existingSnap.forEach((d) => {
        const x = d.data() as any;
        // ensure 1-1 DM: exactly two participants and includes other user
        if (
          Array.isArray(x.participants) &&
          x.participants.length === 2 &&
          x.participants.includes(otherUid)
        ) {
          existingId = d.id;
        }
      });

      // 2) If found, open it
      if (existingId) {
        router.push(`/conversations/${existingId}`);
        return;
      }

      // 3) Otherwise create a new conversation
      const newDocRef = await addDoc(collection(db, "conversations"), {
        orgId,
        participants: [me.uid, otherUid],
        type: "dm",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Conversation started");
      router.push(`/conversations/${newDocRef.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to start conversation");
    }
  }

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
        <Topbar
          name="Contacts"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50 p-3 lg:p-6">
          {/* Search + Count */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center gap-3">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, role…"
                className="w-full md:w-80"
              />
              <Badge variant="secondary">
                {loading ? "Loading…" : `${filtered.length} contacts`}
              </Badge>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-sm text-muted-foreground p-4">Loading contacts…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">
              No contacts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <Card
                  key={c.uid}
                  className="p-4 bg-white border hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <AvatarImage src={c.photoURL} name={c.displayName} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.email}
                      </div>
                    </div>
                    <div className="ml-auto">
                      {c.role ? (
                        <Badge variant="outline" className="capitalize">
                          {c.role.replace("_", " ")}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <Button size="sm" onClick={() => startConversation(c.uid)}>
                      Message
                    </Button>
                    {/* If you want a profile page later */}
                    {/* <Button asChild size="sm" variant="outline">
                      <Link href={`/contacts/${c.uid}`}>View profile</Link>
                    </Button> */}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/** Small avatar helper (fallback to initials) */
function AvatarImage({ src, name }: { src?: string; name: string }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <div className="h-10 w-10 relative rounded-full overflow-hidden border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 rounded-full bg-gray-100 border flex items-center justify-center text-xs font-semibold">
      {initials}
    </div>
  );
}
