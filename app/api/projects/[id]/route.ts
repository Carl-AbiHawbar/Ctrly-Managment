import { NextRequest, NextResponse } from "next/server";
import { adb, getServerUser } from "@/lib/server-auth";

export const runtime = "nodejs";

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
  const doc = await db.collection("projects").doc(params.id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = { id: doc.id, ...doc.data() };

  if (!canRead(data, user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string }}) {
  const user = await getServerUser();
  if (!user?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adb();
  const ref = db.collection("projects").doc(params.id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const project = { id: snap.id, ...snap.data() };
  if (!canWrite(project, user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const patch = await req.json();
  patch.updatedAt = new Date();
  await ref.update(patch);
  const updated = (await ref.get()).data();
  return NextResponse.json({ id: params.id, ...updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string }}) {
  const user = await getServerUser();
  if (!user?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner","admin"].includes(String(user.role))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = adb();
  await db.collection("projects").doc(params.id).delete();
  return NextResponse.json({ ok: true });
}
