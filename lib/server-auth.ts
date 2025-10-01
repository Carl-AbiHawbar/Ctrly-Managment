import { cookies } from "next/headers";
import { adminAuth } from "../functions/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";

export interface DecodedUser {
  uid: string;
  email?: string;
  role?: "owner"|"admin"|"manager"|"worker"|"client";
  orgId?: string;
}

export async function getServerUser(): Promise<DecodedUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: (decoded as any).role,
      orgId: (decoded as any).orgId,
    };
  } catch {
    return null;
  }
}

export const adb = () => getFirestore();
