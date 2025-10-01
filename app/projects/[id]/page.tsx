"use client";
import React, { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { onIdTokenChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API = (path: string, t: string, init?: RequestInit) =>
  fetch(path, { ...(init||{}), headers: { ...(init?.headers||{}), "authorization": `Bearer ${t}`, "content-type": "application/json" } }).then(r=>r.json());

export default function ProjectView({ params }: any){
  const [token, setToken] = useState<string|null>(null);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      if (!u) { setToken(null); return; }
      const t = await u.getIdToken(true);
      setToken(t);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const p = await API(`/api/projects/${params.id}`, token);
      setProject(p);
      const ts = await API(`/api/projects/${params.id}/tasks`, token);
      setTasks(ts.rows || []);
      const ks = await API(`/api/projects/${params.id}/tickets`, token);
      setTickets(ks.rows || []);
    })();
  }, [token, params.id]);

  async function addTask() {
    if (!title.trim()) return;
    const t = await API(`/api/projects/${params.id}/tasks`, token!, { method: "POST", body: JSON.stringify({ title, description: desc }) });
    setTasks([t, ...tasks]);
    setTitle(""); setDesc("");
  }
  async function setTaskStatus(id: string, status: string) {
    const upd = await API(`/api/projects/${params.id}/tasks/${id}`, token!, { method: "PATCH", body: JSON.stringify({ status }) });
    setTasks(tasks.map(x => x.id === id ? upd : x));
  }

  async function addTicket() {
    if (!title.trim()) return;
    const k = await API(`/api/projects/${params.id}/tickets`, token!, { method: "POST", body: JSON.stringify({ title, description: desc }) });
    setTickets([k, ...tickets]);
    setTitle(""); setDesc("");
  }
  async function setTicketStatus(id: string, status: string) {
    const upd = await API(`/api/projects/${params.id}/tickets/${id}`, token!, { method: "PATCH", body: JSON.stringify({ status }) });
    setTickets(tickets.map(x => x.id === id ? upd : x));
  }

  if (!project) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="text-sm text-muted-foreground">Status: {project.status}</div>
      </div>
      <p className="text-muted-foreground">{project.description}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-medium">Tasks</h2>
          <div className="flex gap-2">
            <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
            <Button onClick={addTask}>Add</Button>
          </div>
          <Textarea placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
          <ul className="space-y-2">
            {tasks.map(t => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.status}</div>
                  </div>
                  <div className="flex gap-2">
                    {["todo","doing","done"].map(s => (
                      <Button key={s} size="sm" variant={t.status===s?"default":"outline"} onClick={()=>setTaskStatus(t.id, s)}>{s}</Button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-medium">Tickets</h2>
          <div className="flex gap-2">
            <Input placeholder="Ticket title" value={title} onChange={e => setTitle(e.target.value)} />
            <Button onClick={addTicket}>Open</Button>
          </div>
          <Textarea placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
          <ul className="space-y-2">
            {tickets.map(t => (
              <li key={t.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.status}</div>
                  </div>
                  <div className="flex gap-2">
                    {["open","in_progress","closed"].map(s => (
                      <Button key={s} size="sm" variant={t.status===s?"default":"outline"} onClick={()=>setTicketStatus(t.id, s)}>{s.replace("_"," ")}</Button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
