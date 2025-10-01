import { NextRequest, NextResponse } from "next/server";
import { adb, getServerUser } from "@/lib/server-auth";

export const runtime = "nodejs";

// GET /api/projects -> list projects user can see
export async function GET() {
  const user = await getServerUser();
  if (!user?.uid || !user.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adb();

  try {
    let q = db.collection("projects").where("orgId", "==", user.orgId);
    const snap = await q.get();
    let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (["owner","admin","manager"].includes(String(user.role))) {
      // can see all org projects
    } else {
      rows = rows.filter((p: any) => Array.isArray(p.members) && p.members.includes(user.uid));
    }
    return NextResponse.json({ rows });
  } catch (e:any) {
    console.error("projects GET error", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

// POST /api/projects -> create project (owner/admin/manager)
export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user?.uid || !user.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner","admin","manager"].includes(String(user.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { name, description, members = [], clients = [], writers = [] } = body || {};
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const db = adb();
  const now = new Date();
  const doc = {
    name, description: description || "",
    orgId: user.orgId,
    createdAt: now, updatedAt: now,
    createdBy: user.uid,
    status: "active",
    members: Array.from(new Set([user.uid, ...members])),
    clients: Array.isArray(clients) ? clients : [],
    writers: Array.isArray(writers) ? writers : [],
    progress: 0,
  };
  const ref = await db.collection("projects").add(doc);
  return NextResponse.json({ id: ref.id, ...doc });
}
