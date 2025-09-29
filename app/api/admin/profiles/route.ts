import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "../../../../functions/lib/firebaseAdmin";     // ✅ use app lib
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = (await cookies()).get("__session")?.value; // ✅ no await
    if (!session) return NextResponse.json({ error: "Unauthorized: no session cookie" }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(session, true);
    if ((decoded as any).role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getFirestore();
    const snap = await db.collection("profiles").orderBy("createdAt", "desc").limit(100).get();
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ rows });
  } catch (e: any) {
    console.error("profiles GET error", e);
    return NextResponse.json({ error: e?.message || "Failed to load profiles" }, { status: 500 });
  }
}
