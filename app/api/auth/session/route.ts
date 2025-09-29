import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../../functions/lib/firebaseAdmin"; // ⬅️ adjust if needed

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
    secure: process.env.NODE_ENV === "production", // ✅ allow on localhost
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    // Decode current token (to read email/claims)
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const { uid, email, email_verified } = decoded as any;

    const allowlist = parseAllowlist();
    const ORG_ID = process.env.ORG_ID || "ctrly-agency";

    // If the user is allowlisted owner AND verified, ensure owner claims
    const shouldBeOwner =
      email_verified && email && allowlist.includes(String(email).toLowerCase());

    if (shouldBeOwner && (decoded.role !== "owner" || decoded.orgId !== ORG_ID)) {
      await adminAuth.setCustomUserClaims(uid, { role: "owner", orgId: ORG_ID });
      // Force a refresh so the session cookie we mint reflects the new claims
      await adminAuth.revokeRefreshTokens(uid);
    }

    // Re-verify to pick up fresh claims if we just promoted
    const fresh = await adminAuth.verifyIdToken(idToken, true);

    // Create session cookie (7 days)
    const expiresInMs = 7 * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: expiresInMs });

    const res = NextResponse.json({
      ok: true,
      email: fresh.email,
      role: (fresh as any).role ?? null,
      orgId: (fresh as any).orgId ?? null,
      email_verified: (fresh as any).email_verified ?? false,
    });
    setCookie(res, sessionCookie, Math.floor(expiresInMs / 1000));
    return res;
  } catch (e: any) {
    console.error("session POST error", e);
    return NextResponse.json({ error: e?.message || "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  // Clear cookie
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
