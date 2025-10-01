"use client";

import LayoutWithSidebar from "./layout-with-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, getDocs, doc, setDoc } from "firebase/firestore";

type Profile = { id: string; displayName?: string; email?: string; orgId?: string; avatarUrl?: string };
type Chat = { id: string; participants: string[]; orgId: string; createdAt?: any };
type Message = { id: string; text: string; senderId: string; createdAt: any };

export default function ChatPage() {
  const [me, setMe] = useState<any>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setMe(u);
      if (u) {
        // read profile to get orgId from Firestore
        const q = query(collection(db, "users"));
        // we'll fetch orgId from custom token via session cookie in SSR pages; on client we might not have it
        // as a fallback, select from /profiles mirror
        const profs = await getDocs(query(collection(db, "profiles")));
        const mine = profs.docs.find(d => d.id === u.uid)?.data() as any;
        setOrgId(mine?.orgId || null);
      }
    });
    return () => unsub();
  }, []);

  // Load users in my org
  useEffect(() => {
    if (!orgId) return;
    const qUsers = query(collection(db, "profiles"), where("orgId", "==", orgId));
    return onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [orgId]);

  // My chats
  useEffect(() => {
    if (!me || !orgId) return;
    const qChats = query(collection(db, "chats"), where("orgId", "==", orgId), where("participants", "array-contains", me.uid));
    return onSnapshot(qChats, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setChats(rows);
      if (!activeChatId && rows.length) setActiveChatId(rows[0].id);
    });
  }, [me, orgId]);

  // Messages for active chat
  useEffect(() => {
    if (!activeChatId) { setMessages([]); return; }
    const qMsgs = query(collection(db, "chats", activeChatId, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(qMsgs, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
  }, [activeChatId]);

  async function startChatWith(uid: string) {
    if (!me || !orgId) return;
    // Check if chat exists with exactly these two participants
    const qChats = query(collection(db, "chats"), where("orgId", "==", orgId), where("participants", "array-contains", me.uid));
    const existing = await getDocs(qChats);
    const found = existing.docs.find(d => {
      const parts = (d.data().participants || []) as string[];
      return parts.length === 2 && parts.includes(me.uid) && parts.includes(uid);
    });
    if (found) { setActiveChatId(found.id); return; }
    const docRef = await addDoc(collection(db, "chats"), { orgId, participants: [me.uid, uid], createdAt: serverTimestamp() });
    setActiveChatId(docRef.id);
  }

  async function send() {
    if (!text.trim() || !me || !activeChatId) return;
    await addDoc(collection(db, "chats", activeChatId, "messages"), {
      text: text.trim(),
      senderId: me.uid,
      createdAt: serverTimestamp(),
    });
    setText("");
  }

  return (
    <LayoutWithSidebar>
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: user list / chats */}
        <div className="w-72 border-r bg-white p-3 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground px-1">Team</div>
          {users.filter(u => u.id !== me?.uid).map(u => (
            <button key={u.id} onClick={() => startChatWith(u.id)} className={`w-full text-left rounded px-2 py-1 hover:bg-gray-50 ${chats.find(c => (c.participants||[]).includes(u.id)) ? "font-medium" : ""}`}>
              <div className="truncate">{u.displayName || u.email}</div>
              <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
            </button>
          ))}
          <div className="h-4"></div>
          <div className="text-xs font-semibold text-muted-foreground px-1">Conversations</div>
          {chats.map(c => {
            const other = users.find(u => u.id !== me?.uid && (c.participants||[]).includes(u.id));
            return (
              <button key={c.id} onClick={() => setActiveChatId(c.id)} className={`w-full text-left rounded px-2 py-1 hover:bg-gray-50 ${activeChatId===c.id ? "bg-gray-50":""}`}>
                <div className="truncate">{other?.displayName || other?.email || "Chat"}</div>
              </button>
            );
          })}
        </div>

        {/* Right: messages */}
        <div className="flex-1 flex flex-col">
          <Card className="m-3 flex flex-1 min-h-0">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messages.map(m => (
                  <div key={m.id} className={`max-w-[70%] rounded px-3 py-2 ${m.senderId===me?.uid ? "bg-primary text-primary-foreground ml-auto":"bg-muted"}`}>
                    {m.text}
                  </div>
                ))}
                <div ref={msgEndRef} />
              </div>
              <div className="flex gap-2 mt-2">
                <Input value={text} onChange={(e:any)=>setText(e.target.value)} placeholder="Type a message…" onKeyDown={(e:any)=>{ if(e.key==='Enter') send(); }} />
                <Button onClick={send}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
