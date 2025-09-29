import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../../functions/lib/firebaseAdmin";

export const runtime = "nodejs";

type Role = "owner" | "worker" | "client";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(idToken, true);
    if ((decoded as any).role !== "owner") {
      return NextResponse.json({ error: "Owners only" }, { status: 403 });
    }

    const { uid, role, orgId } = (await req.json()) as {
      uid: string; role: Role; orgId: string;
    };
    if (!uid || !role || !orgId) {
      return NextResponse.json({ error: "uid, role, orgId required" }, { status: 400 });
    }

    await adminAuth.setCustomUserClaims(uid, { role, orgId });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
