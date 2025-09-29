// scripts/grantOwners.mjs
import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Read env from .env.local (or .env)
const projectId   = process.env.FB_ADMIN_PROJECT_ID;
const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;
const privateKey  = process.env.FB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Sanity
if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FB_ADMIN_* env vars. Check .env.local');
  process.exit(1);
}

// Init Admin
initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const adminAuth = getAuth();

const ORG_ID = 'ctrly-agency'; // <-- your org id

// EITHER: put owner UIDs here directly:
const OWNER_UIDS = [
  'rABPnGu697a4i1dDLDI8M9QGkEI3',  // example
];

// OR: resolve by email (easier if you don’t know the UIDs yet):
const OWNER_EMAILS = [
  'carlabihawbar434@gmail.com',
];

async function main() {
  const uids = [...OWNER_UIDS];

  for (const email of OWNER_EMAILS) {
    try {
      const user = await adminAuth.getUserByEmail(email);
      uids.push(user.uid);
    } catch (e) {
      console.error(`Failed to resolve user by email ${email}:`, e?.message || e);
    }
  }

  if (uids.length === 0) {
    console.error('No owner UIDs/emails provided. Add OWNER_UIDS or OWNER_EMAILS.');
    process.exit(1);
  }

  for (const uid of uids) {
    await adminAuth.setCustomUserClaims(uid, { role: 'owner', orgId: ORG_ID });
    console.log(`Granted OWNER to ${uid} (org: ${ORG_ID})`);
  }

  console.log('Done. Ask owners to sign out/in to refresh claims.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
