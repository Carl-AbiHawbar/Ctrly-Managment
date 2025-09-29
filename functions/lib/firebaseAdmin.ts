// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

if (!getApps().length) {
  const projectId = requireEnv("FB_ADMIN_PROJECT_ID");
  const clientEmail = requireEnv("FB_ADMIN_CLIENT_EMAIL");
  const privateKey = requireEnv("FB_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
} else {
  adminApp = getApps()[0]!;
}

export const adminAuth = getAuth(adminApp);
