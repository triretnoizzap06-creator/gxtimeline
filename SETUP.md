# Setup: Admin panel, online database, Save & Publish

Before setup, the website keeps working the way it does today (data stays in each browser).
Once these steps are done:

- **Visitors** at `gxtimeline.vercel.app` see the **published** version (read-only), and it updates live.
- **Admins/editors** at `gxtimeline.vercel.app/admin` log in, edit, then click **Save changes** (stored in the online database) and **Publish** (pushes to the live site).

Takes about 15–20 minutes. You only do it once.

---

## 1. Create the Supabase database (free)

1. Sign up at https://supabase.com → **New project** (pick the Southeast Asia (Singapore) region).
2. Open **SQL Editor → New query**, paste the full contents of `supabase/schema.sql`, then click **Run**.
3. Still in the SQL Editor, add yourself as the first admin (use your own email):
   ```sql
   insert into public.site_admins (email, role) values ('your-email@globalxtreme.net', 'admin')
     on conflict (email) do update set role = 'admin';
   ```
4. **Authentication → URL Configuration**
   - Site URL: `https://gxtimeline.vercel.app`
   - Redirect URLs: add `https://gxtimeline.vercel.app/admin`
5. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
   (Do NOT use the `service_role` key anywhere in this project.)

> Login emails use Supabase's built-in email service, which only sends a few emails per hour.
> If lots of people will log in, set up custom SMTP under Authentication → SMTP Settings (optional).

## 2. Set Environment Variables in Vercel

Vercel → project **gxtimeline** → **Settings → Environment Variables** (tick Production + Preview):

| Name | Value | Required |
|---|---|---|
| `SUPABASE_URL` | Project URL from step 1.5 | ✅ |
| `SUPABASE_ANON_KEY` | anon public key from step 1.5 | ✅ |
| `VERCEL_DEPLOY_HOOK_URL` | see below | for the Redeploy button |
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create | for automatic build status |
| `VERCEL_PROJECT_ID` | Settings → General → Project ID | for automatic build status |
| `VERCEL_TEAM_ID` | Team Settings → Team ID (only if the project is under a Team) | optional |

**Deploy Hook:** Settings → Git → Deploy Hooks → name `admin-redeploy`, branch `main` → Create → copy the URL into `VERCEL_DEPLOY_HOOK_URL`.

## 3. Push the code to GitHub (no rebuild from scratch)

Copy the contents of this folder over your existing repo (overwrite files with the same name), then:

```bash
git add .
git commit -m "Admin panel: online database, Save & Publish"
git push
```

Vercel deploys automatically. Environment variables only take effect on a **new** deploy, so do step 2 before pushing (or click Redeploy in the Vercel dashboard after setting them).

Changed / new files:
- changed: `index.html`, `app.js`, `styles.css`, `README.md`
- new: `admin.html`, `admin.js`, `sync.js`, `api/` (config, deploy, deploy-status), `supabase/schema.sql`, `vercel.json`, `SETUP.md`
- unchanged: `data/budget-seed.js`, `assets/`, `scripts/`

## 4. First login and moving your existing data

1. Open `https://gxtimeline.vercel.app/admin` **in the browser you've been using to edit the dashboard** (that's where the latest data lives).
2. Enter your email → click the link in the email.
3. The **"Fill the database for the first time"** screen appears. Pick **"Data saved in this browser"** so none of your edits are lost
   (or "Built-in starter data" if you want to start from the original timeline + budget sheet).
4. Data is saved as draft v1. Check it, then click **Publish** → confirm. The live site now shows that version.

Data in the browser is never deleted. It stays as a backup.

## 5. Add your team

Admin panel → **Team & permissions** → enter email + role:
- **admin**: edit, save, publish, manage the team, redeploy
- **editor**: edit and save drafts, cannot publish

They log in at `/admin` with that email.

---

## Daily workflow

1. Open `/admin`, edit tasks/budget/timeline as usual on their pages.
2. The top bar shows **Unsaved changes** → click **Save changes** (or Ctrl/Cmd+S). It's now stored in the database and visible to other admins on any device.
3. Click **Publish** → review the change summary → **Publish now**. Status changes to **Published · live** and visitors see the update without refreshing.

Status in the top bar:
- Save: `Unsaved changes` · `Saving…` · `Saved · vN` · `Save error`
- Live site: `Draft · not live` · `Publishing` · `Published · live` · `Failed`

## What you can manage from the website vs. what needs a deploy

**Directly from the website (Save → Publish), no deploy needed:**
tasks, statuses, PIC, deadlines, notes, blockers; budget items, invoices, DPs, payment status, transfer receipts;
Master Timeline & Calendar (they follow task data); title, subtitle, event name & date, preparation deadlines, tagline;
logo (upload); budget sheet link; admin/editor team; version history & restoring old versions.

**Needs a code change + deploy (push to GitHub → Vercel auto-deploys):**
layout, colours, fonts, new pages, new fields/columns, finance calculation rules, new admin panel features,
the import mapping from the sheet (`scripts/build_seed.py`).
The **Redeploy website** button in the admin panel only rebuilds the latest commit on GitHub. It doesn't change any code by itself.

## Security

- All database writes go through SQL functions that check the role (`save_draft`: editor/admin, `publish_content`: admin only).
  Hiding buttons in the UI is not the only protection: the database rejects writes from anyone without the right role.
- Visitors can only read the `published` row. Drafts, history, the team list and logs are only readable by admins/editors.
- `/api/deploy` checks the caller's login token with Supabase before calling the Deploy Hook. The Deploy Hook URL and the Vercel token never reach the browser.

## Troubleshooting

| Problem | Fix |
|---|---|
| `/admin` says "Database not configured yet" | `SUPABASE_URL`/`SUPABASE_ANON_KEY` aren't set, or there's been no redeploy since they were set |
| Login link opens the wrong website | Check Site URL & Redirect URLs (step 1.4) |
| "Account doesn't have access yet" | That email isn't in `site_admins`. Add it from the Team panel or via SQL |
| Save shows "Draft has been changed by someone else" | Another admin saved first. Pick "Load latest version" or "Save my version" (the old version stays in Version history) |
| Redeploy button is disabled | `VERCEL_DEPLOY_HOOK_URL` isn't set |
