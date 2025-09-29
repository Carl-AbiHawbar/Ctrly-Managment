import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "../../functions/lib/firebaseAdmin"; // ✅ use app/lib

export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = (await cookies()).get("__session")?.value; // ✅ no await
  if (!session) redirect("/login");

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const emailVerified = (decoded as any).email_verified;
    const role = (decoded as any).role;
    const orgId = (decoded as any).orgId;

    if (!emailVerified) redirect("/verify");
    if (!role || !orgId) redirect("/pending");
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
