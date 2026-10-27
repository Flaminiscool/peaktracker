# Peak State Tracker

Vite + React dashboard. Works offline (PWA) and can sync between devices via Supabase.

## 1. Deploy to Vercel
1. Push this folder to a GitHub repo (the folder itself is the repo root).
2. vercel.com -> Add New -> Project -> import the repo. Vercel auto-detects Vite. Click Deploy.

## 2. Sync laptop + phone (optional, free)
1. supabase.com -> New project.
2. SQL Editor -> paste `supabase/schema.sql` -> Run.
3. Authentication -> Providers -> Email. For easiest setup, turn OFF "Confirm email".
4. Project Settings -> API: copy the Project URL and the `anon public` key.
5. Vercel -> your project -> Settings -> Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   then Deployments -> Redeploy.
6. Open the site on each device, tap the cloud icon, create an account (first device) / sign in (other devices).

## 3. Install it + offline
- Phone: open the site -> Share/menu -> "Add to Home Screen".
- Laptop (Chrome/Edge): install icon in the address bar.
- Open it once while online. After that it loads with no connection. Edits are saved on the device and sync when you're back online.

## Local dev
```
npm install
npm run dev
```
Copy `.env.example` to `.env.local` to test sync locally.
