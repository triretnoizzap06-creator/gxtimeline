# Setup: GitHub → Vercel + Firebase (admin panel, Save & Publish)

Until Firebase is set up, the site keeps working as before (data stays in each browser).
After setup:

- **Visitors** at `gxtimeline.vercel.app` see the **published** version (read-only, updates live).
- **Admins/editors** at `gxtimeline.vercel.app/admin` log in → edit → **Save changes** (stored in Firebase, visible on every device) → **Publish** (goes live).

Do it once, about 20 minutes. Order: **1 Firebase → 2 Vercel env → 3 GitHub push → 4 first login.**

---

## 1. Firebase (free Spark plan is enough)

1. Open https://console.firebase.google.com → **Add project** → name it e.g. `gx27-ops` (Google Analytics is optional; you can turn it off).
2. **Build → Firestore Database → Create database**
   - Location: `asia-southeast2 (Jakarta)` or `asia-southeast1 (Singapore)`
   - Start in **production mode**.
3. Firestore → **Rules** tab → delete everything, paste the full contents of `firebase/firestore.rules` → **Publish**.
4. **Build → Authentication → Get started → Sign-in method**, enable:
   - **Google** (pick a support email) → Save
   - **Email/Password** → also turn on **Email link (passwordless sign-in)** → Save
5. Authentication → **Settings → Authorized domains → Add domain**: `gxtimeline.vercel.app`
6. Add yourself as the first admin: **Firestore → Data → Start collection**
   - Collection ID: `admins`
   - Document ID: **your email in lowercase**, e.g. `putri@globalxtreme.net`
   - Field: `role` (string) = `admin` → Save
   (After this, add other team members from the Admin panel on the website. No need to open the console again.)
7. **Project settings (gear icon) → General → Your apps → Web (`</>`)** → app nickname `gx27-web` → Register (Firebase Hosting is NOT needed).
   Copy the `firebaseConfig` object it shows, for example:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "gx27-ops.firebaseapp.com",
     projectId: "gx27-ops",
     storageBucket: "gx27-ops.appspot.com",
     messagingSenderId: "123...",
     appId: "1:123...:web:abc..."
   };
   ```

> These config values are designed to be public. What protects the data is the Rules from step 3.
> Firebase Storage isn't needed: uploaded logos are shrunk automatically and stored in Firestore.

## 2. Vercel → Environment Variables

Vercel → project **gxtimeline** → **Settings → Environment Variables** → tick Production + Preview:

| Name | Value | Required |
|---|---|---|
| `FIREBASE_CONFIG` | paste the whole `firebaseConfig` block from step 1.7 (it can include `const firebaseConfig =`) | ✅ |
| `VERCEL_DEPLOY_HOOK_URL` | Settings → Git → Deploy Hooks → name `admin-redeploy`, branch `main` → Create → copy the URL | for the Redeploy button |
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create | optional, automatic build status |
| `VERCEL_PROJECT_ID` | Settings → General → Project ID | optional, automatic build status |
| `VERCEL_TEAM_ID` | only if the project is under a Team | optional |

## 3. Push the code to GitHub (Vercel deploys automatically)

The `gxtimeline` project on Vercel is already connected to your GitHub repo, so **you don't need to "deploy to Vercel" manually**:
pushing to GitHub is enough and Vercel will build automatically.

**Option A — via the GitHub website (no terminal needed):**
1. Open the repo on github.com → **Add file → Upload files**.
2. Extract the zip, then drag in **everything inside the folder** (not the folder itself), including the `api`, `data`, `firebase`, `scripts`, `assets` folders.
   Files with the same name are overwritten automatically.
3. Delete the old `supabase/` folder if it exists in the repo (it's no longer used).
4. **Commit changes**. Wait 1–2 minutes and check under the repo's Vercel Deployments tab.

> Make sure the `api` and `data` folders appear in the repo after upload. If folders get skipped when dragging,
> upload them one by one using "Add file → Upload files" from inside that folder in the repo.

**Option B — terminal:**
```bash
cd your-repo-folder
# copy the zip contents here (overwrite)
git rm -r --cached supabase 2>/dev/null; rm -rf supabase
git add -A
git commit -m "Firebase admin panel, rundown, category manager, logo fix"
git push
```

Env vars only take effect on a **new** deploy. If you set them after pushing: Vercel → Deployments → ⋯ → **Redeploy**.

## 4. First login (data loads automatically)

The website **shows data right away** — even before anyone logs in, visitors already see the timeline, tasks, budget and Festival Flow rundown that are built into the code.

1. Open `https://gxtimeline.vercel.app/admin` **in the browser you've been using to edit the dashboard** (that's where your latest edits are).
2. **Sign in with Google** (or use an email link) with the email from step 1.6.
3. Done. The database is filled automatically and **published right away**:
   - if this browser has your previous edits → those are used,
   - if not → the website's built-in data is used.
   A notice at the top tells you which data was used. To use different data: Admin panel → Data tools.

## 5. Add your team

Admin panel → **Team & permissions** → email + role:
- **admin**: edit, save, publish, manage the team, redeploy
- **editor**: edit + save drafts, cannot publish

They log in at `/admin` with that email (Google or email link).

---

## Daily workflow

1. Open `/admin` → edit on any page: Master Timeline, **Rundown**, Tasks, Finance, Calendar, Admin panel.
2. The top bar shows **Unsaved changes** → **Save changes** (or Ctrl/Cmd+S).
3. **Publish** → review the change summary → **Publish now** → status **Published · live**.

## What can be changed from the website vs. what needs a code deploy

**From the website (Save → Publish):**
- Tasks: add, edit, delete, status, PIC, deadline, notes, blockers
- **Task categories & workstreams: add, rename (all records update automatically), reorder, delete (in-use items must be moved first)**
- Budget & payments, linking to tasks
- **Rundown (Festival Flow): segments, concurrent/parallel programs, activity zone & area cards**
- Website title, event name & date, preparation deadlines, tagline, logo, sheet link
- Admin/editor team, publish history, restoring old versions

**Needs a code change + push to GitHub:**
layout/colours/fonts, new pages, new fields, finance calculation formulas, new admin panel features.
The Admin panel's **Redeploy** button only rebuilds the latest commit on GitHub.

## Troubleshooting

| Problem | Fix |
|---|---|
| `/admin` says "Database not configured yet" | `FIREBASE_CONFIG` isn't set / no redeploy since it was set |
| Login says "Domain not registered yet" | Add `gxtimeline.vercel.app` under Authentication → Settings → Authorized domains |
| "This sign-in method isn't enabled yet" | Enable Google / Email link under Authentication → Sign-in method |
| "Account doesn't have access yet" | The email (lowercase) isn't in the `admins` collection |
| Save/Publish fails with "no permission" | The Rules from `firebase/firestore.rules` haven't been published, or the role isn't `admin` |
| Logo / pages don't appear after upload | Check that the `api`, `data`, `assets` folders and `sync.js`, `admin.js`, `admin.html` exist in the GitHub repo |
