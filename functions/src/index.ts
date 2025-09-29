/* eslint-disable @typescript-eslint/no-explicit-any */
import * as admin from "firebase-admin";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

if (!admin.apps.length) admin.initializeApp();

type Role = "owner" | "worker" | "client";

/**
 * Ensure the caller is an owner (uses v2 CallableRequest).
 */
function assertOwner(request: CallableRequest): void {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required");
  }
  const claims = (request.auth.token || {}) as any;
  if (claims.role !== "owner") {
    throw new HttpsError("permission-denied", "Owners only");
  }
}

/**
 * One-time bootstrap: make specific UIDs owners.
 * Protected with a shared secret from runtime config (Spark plan).
 */
export const grantOwner = onCall(async (request) => {
  const data = request.data as {
    secret: string;
    orgId: string;
    ownerUids: string[];
  };

  const configured =
    process.env.GRANT_OWNER_SECRET || functions.config()?.bootstrap?.secret;

  if (!configured || data.secret !== configured) {
    throw new HttpsError("permission-denied", "Bad secret");
  }

  if (!data.orgId || !data.ownerUids?.length) {
    throw new HttpsError("invalid-argument", "orgId & ownerUids required");
  }

  const db = admin.firestore();
  const batch = db.batch();

  for (const uid of data.ownerUids) {
    await admin.auth().setCustomUserClaims(uid, {
      role: "owner",
      orgId: data.orgId,
    });
    batch.set(
      db.doc(`orgs/${data.orgId}/users/${uid}`),
      { role: "owner" },
      { merge: true }
    );
  }

  batch.set(
    db.doc(`orgs/${data.orgId}`),
    { ownerUids: data.ownerUids },
    { merge: true }
  );

  await batch.commit();
  return { ok: true, owners: data.ownerUids.length };
});

/**
 * Approve & assign role (client/worker/owner) for a user in the org.
 */
export const setRole = onCall(async (request) => {
  assertOwner(request);
  const data = request.data as {
    uid: string;
    role: Role;
    orgId: string;
  };

  if (!data.uid || !data.role || !data.orgId) {
    throw new HttpsError("invalid-argument", "uid, role, orgId required");
  }

  await admin.auth().setCustomUserClaims(data.uid, {
    role: data.role,
    orgId: data.orgId,
  });

  await admin
    .firestore()
    .doc(`orgs/${data.orgId}/users/${data.uid}`)
    .set({ role: data.role }, { merge: true });

  return { ok: true };
});

/**
 * Optional: revoke role (clear claims -> user returns to /pending).
 */
export const revokeRole = onCall(async (request) => {
  assertOwner(request);
  const data = request.data as { uid: string };

  if (!data.uid) {
    throw new HttpsError("invalid-argument", "uid required");
  }

  await admin.auth().setCustomUserClaims(data.uid, {});
  return { ok: true };
});
