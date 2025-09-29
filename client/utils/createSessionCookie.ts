// client/utils/createSessionCookie.ts
import { auth } from '@/firebase';

export async function createSessionCookie() {
  const u = auth.currentUser;
  if (!u) return;

  // 1) post current token (this may grant owner for allowlisted emails)
  let idToken = await u.getIdToken(true);
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include',
  });

  // 2) force-refresh token to pull new custom claims, then post again
  await u.getIdToken(true);
  idToken = await u.getIdToken(true);
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include',
  });
}
