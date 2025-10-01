# CTRLY Management – Functional Build

This build wires Projects, Tasks, Tickets, Chat (DMs), and Calendar to Firebase.

## 1) Environment
Create `.env.local` in the app root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
OWNER_ALLOWLIST=carlabihawbar434@gmail.com
```

Functions/admin env (Vercel env or local):  
```env
FB_ADMIN_PROJECT_ID=...
FB_ADMIN_CLIENT_EMAIL=...
FB_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 2) Deploy rules & indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 3) Run dev
```bash
pnpm i
pnpm dev
```

## 4) Flow
- New signup -> `/profiles/{uid}` is created.
- Owner (carlabihawbar434@gmail.com) signs in; they’re auto-`owner` via allowlist when posting to `/api/auth/session`.
- Owner grants roles via existing admin UI.
- Projects page is live; create + view projects (owner/admin/manager).
- Project page: create tasks & tickets and change statuses.
- Messages: DM chat using Firestore (`/chats/*`).
- Calendar: events stored in `/events` (org-scoped).

## 5) Collections
- `users/{uid}` – private user info
- `profiles/{uid}` – public profile + `orgId`
- `projects/{id}` – fields: `orgId, name, description, status, members[], writers[], clients[], createdAt`
  - `tasks/{id}` – fields: `title, description, status, assignees[], createdAt`
  - `tickets/{id}` – fields: `title, description, status, assignee, priority, createdAt`
- `events/{id}` – org calendar events
- `chats/{id}` – `orgId, participants[]`
  - `messages/{id}` – `text, senderId, createdAt`

## Notes
- Server routes enforce org & role.
- Firestore Rules mirror the same constraints.
- The UI now fetches real data; no dummy project lists.
```
