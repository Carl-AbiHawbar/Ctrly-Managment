

## Final pass — 2025-09-30T02:22:18.714007 UTC
- Added **client** role to RBAC and Firestore rules. Client behaves like worker for visibility (must be member), no write unless writer.
- Ensured **.env.local** present with corrected bucket and VAPID key placeholder.
- Project task page now supports **assignees** (choose from project members), **status updates**, and uses existing APIs.
- Admin → Users includes **client** role button.
- Reminder: set auth **custom claims** for users so rules read `request.auth.token.role` correctly (`/api/admin/setClaims`).

