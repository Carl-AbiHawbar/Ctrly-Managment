// lib/setUserRole.ts (client-side helper)
import {auth} from "@/firebase"; // your client SDK init

export async function setUserRole(params: {
  uid: string;
  role: "client" | "worker" | "owner";
  orgId: string;
}) {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in");
  const token = await u.getIdToken(true);

  const res = await fetch("/api/admin/setRole", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to set role");
  }
}
