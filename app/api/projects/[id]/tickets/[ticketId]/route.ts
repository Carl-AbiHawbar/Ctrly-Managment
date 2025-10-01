import { NextRequest, NextResponse } from "next/server";
import { adb, getServerUser } from "@/lib/server-auth";

export const runtime = "nodejs";

async function getProject(db: FirebaseFirestore.Firestore, id: string) {
  const doc = await db.collection("projects").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}
function canWrite(project: any, user: any) {
  if (!project || !user) return false;
  if (project.orgId !== user.orgId) return false;
  if (["owner","admin","manager"].includes(String(user.role))) return true;
  return Array.isArray(project.writers) && project.writers.includes(user.uid);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string, ticketId: string }}) {
  const user = await getServerUser();
  if (!user?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adb();
  const project = await getProject(db, params.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canWrite(project, user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const patch = await req.json();
  patch.updatedAt = new Date();
  await db.collection("projects").doc(params.id).collection("tickets").doc(params.ticketId).update(patch);
  const updated = await db.collection("projects").doc(params.id).collection("tickets").doc(params.ticketId).get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}
