import { NextRequest, NextResponse } from "next/server";
import { adb, getServerUser } from "@/lib/server-auth";

export const runtime = "nodejs";

async function getProject(db: FirebaseFirestore.Firestore, id: string) {
  const doc = await db.collection("projects").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

function canRead(project: any, user: any) {
  if (!project || !user) return false;
  if (project.orgId !== user.orgId) return false;
  if (["owner","admin","manager"].includes(String(user.role))) return true;
  return Array.isArray(project.members) && project.members.includes(user.uid);
}
function canWrite(project: any, user: any) {
  if (!project || !user) return false;
  if (project.orgId !== user.orgId) return false;
  if (["owner","admin","manager"].includes(String(user.role))) return true;
  return Array.isArray(project.writers) && project.writers.includes(user.uid);
}

export async function GET(_: NextRequest, { params }: { params: { id: string }}) {
  const user = await getServerUser();
  if (!user?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adb();
  const project = await getProject(db, params.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canRead(project, user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const snap = await db.collection("projects").doc(params.id).collection("tasks").orderBy("createdAt","desc").get();
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest, { params }: { params: { id: string }}) {
  const user = await getServerUser();
  if (!user?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adb();
  const project = await getProject(db, params.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canWrite(project, user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, description = "", assignees = [] } = body || {};
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const now = new Date();
  const doc = {
    title, description,
    status: "todo",
    assignees: Array.isArray(assignees) ? assignees : [],
    createdAt: now,
    createdBy: user.uid,
  };

  const ref = await db.collection("projects").doc(params.id).collection("tasks").add(doc);
  return NextResponse.json({ id: ref.id, ...doc });
}
