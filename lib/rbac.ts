import { getFirestore } from "firebase-admin/firestore";

export type Role = "owner" | "admin" | "manager" | "worker" | "client";

export interface UserProfile {
  uid: string;
  email?: string;
  orgId: string;
  role: Role;
  projects?: string[];
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestore();
  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data() as any;
  return {
    uid,
    email: data.email,
    orgId: data.orgId || process.env.NEXT_PUBLIC_ORG_ID || "default",
    role: (data.role || "worker") as Role,
    projects: data.projects || []
  };
}

export function canReadProject(role: Role, project: any, profile: UserProfile | null) {
  if (role === "owner" || role === "admin" || role === "manager") return project.orgId === profile?.orgId;
  // worker/client: must be in members
  return Array.isArray(project.members) && project.members.includes(profile?.uid);
}

export function canWriteProject(role: Role, project: any, profile: UserProfile | null) {
  if (role === "owner" || role === "admin" || role === "manager") return project.orgId === profile?.orgId;
  // workers/clients: write if explicitly allowed
  return Array.isArray(project.writers) && project.writers.includes(profile?.uid);
}

export function assertOwnerOrAdmin(role: Role) {
  if (!["owner","admin"].includes(role)) {
    const err = new Error("Forbidden");
    // @ts-ignore
    err.status = 403;
    throw err;
  }
}
