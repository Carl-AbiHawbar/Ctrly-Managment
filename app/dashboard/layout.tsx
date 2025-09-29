import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "../../functions/lib/firebaseAdmin";

export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();                 // ✅ await (Next 15)
  const session = cookieStore.get("__session")?.value; // ✅ then get()
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
