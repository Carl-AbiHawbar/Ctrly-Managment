import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../../functions/lib/firebaseAdmin";

const COOKIE_NAME = "__session";
export const runtime = "nodejs";

function parseAllowlist(): string[] {
  return (process.env.OWNER_ALLOWLIST || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

function setCookie(res: NextResponse, value: string, maxAgeSec: number) {
  res.cookies.set({
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const email = (decoded as any).email as string | undefined;
    const uid = decoded.uid;

    // Bootstrap owner from allowlist
    const allow = parseAllowlist();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "ctrly-agency";
    const role = (decoded as any).role as string | undefined;

    if (email && allow.includes(email.toLowerCase()) && role !== "owner") {
      await adminAuth.setCustomUserClaims(uid, { role: "owner", orgId });
    }

    // Mint session cookie
    const expiresInMs = 1000 * 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: expiresInMs });

    const res = NextResponse.json({ ok: true });
    setCookie(res, sessionCookie, Math.floor(expiresInMs / 1000));
    return res;
  } catch (e: any) {
    console.error("session POST error", e);
    return NextResponse.json({ error: e?.message || "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  setCookie(res, "", 0);
  return res;
}
