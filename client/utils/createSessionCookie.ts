// client/utils/createSessionCookie.ts
import { auth } from '@/firebase';

export async function createSessionCookie() {
  const u = auth.currentUser;
  if (!u) return;

  // 1) post current token (this may promote allowlisted owners server-side)
  let idToken = await u.getIdToken(true);
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include', // make sure cookie is stored
  });

  // 2) force-refresh token to pull new custom claims, then post again to mint cookie with them
  await u.getIdToken(true);
  idToken = await u.getIdToken(true);
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include',
  });
}
