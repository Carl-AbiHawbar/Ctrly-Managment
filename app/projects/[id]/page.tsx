"use client";
import React from "react";
import app from "@/firebase";
import { getAuth, onIdTokenChanged } from "firebase/auth";

const API = (path:string, t:string, init?:RequestInit) =>
  fetch(path, { ...(init||{}), headers: { ...(init?.headers||{}), authorization: `Bearer ${t}`, "content-type": "application/json" } }).then(r=>r.json());

export default function ProjectView({ params }: any){
  const [token, setToken] = React.useState<string|null>(null);
  const [project, setProject] = React.useState<any>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [title, setTitle] = React.useState("");
  const [assignees, setAssignees] = React.useState<string[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string|null>(null);

  React.useEffect(()=>{
    const auth = getAuth(app);
    return onIdTokenChanged(auth, async (u)=>{
      if (!u) return setToken(null);
      const t = await u.getIdToken();
      setToken(t);
    });
  },[]);

  const load = React.useCallback(async()=>{
    if (!token) return;
    setError(null);
    const p = await API(`/api/projects/${params.id}`, token);
    if (p.error) { setError(p.error); return; }
    setProject(p);
    const t = await API(`/api/projects/${params.id}/tasks`, token);
    setTasks(t.items || []);
    const u = await API(`/api/users`, token);
    setUsers(u.items || []);
  },[token, params.id]);

  React.useEffect(()=>{ load(); }, [load]);

  async function createTask(e:React.FormEvent){
    e.preventDefault();
    if (!token || !title) return;
    const res = await API(`/api/projects/${params.id}/tasks`, token, { method: "POST", body: JSON.stringify({ title, assignees })});
    if (!res.error) { setTitle(""); setAssignees([]); load(); }
  }

  async function setStatus(taskId:string, status:string){
    if (!token) return;
    const res = await API(`/api/projects/${params.id}/tasks/${taskId}`, token, { method:"PATCH", body: JSON.stringify({ status })});
    if (!res.error) load();
  }

  function toggleAssignee(uid:string){
    setAssignees(prev => prev.includes(uid) ? prev.filter(x=>x!==uid) : [...prev, uid]);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{project?.name || "Project"}</h1>
      {error && <p className="text-red-600">Error: {error}</p>}

      <form onSubmit={createTask} className="space-y-3 border rounded-2xl p-4">
        <input className="border rounded p-2 w-full" placeholder="New task title" value={title} onChange={e=>setTitle(e.target.value)} />
        <div>
          <div className="text-sm font-medium mb-1">Assign to</div>
          <div className="flex flex-wrap gap-2">
            {(users||[]).filter((u:any)=> (project?.members||[]).includes(u.id)).map((u:any)=>(
              <button type="button" key={u.id} onClick={()=>toggleAssignee(u.id)}
                className={`px-3 py-1 border rounded ${assignees.includes(u.id)?'bg-black text-white':''}`}>
                {u.email || u.id}
              </button>
            ))}
          </div>
        </div>
        <button className="px-4 py-2 rounded bg-black text-white">Add Task</button>
      </form>

      <h2 className="font-semibold">Tasks</h2>
      <ul className="grid gap-2">
        {tasks.map(t => (
          <li key={t.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs opacity-70">Assignees: {(t.assignees||[]).length ? (t.assignees||[]).join(", ") : "—"}</div>
              </div>
              <div className="flex gap-2">
                {["todo","doing","done"].map(s => (
                  <button key={s} className={`px-2 py-1 border rounded ${t.status===s?'bg-black text-white':''}`} onClick={()=>setStatus(t.id, s)}>{s}</button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
