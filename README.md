# GX27 Operations — Festival of Connectivity

A dashboard for the GX27 event team: Master Timeline, Tasks, Finance & Procurement, and Calendar.
It's a static site (HTML/CSS/JS) with no build step and no backend.

## Folder structure

```
index.html              Page shell (sidebar + script/CSS loading)
styles.css              All styling (Inter font, white theme)
app.js                  App logic: pages, CRUD, financial calculations, calendar
data/budget-seed.js     Initial budget data (sheet "EDIT DISINI", Acara division)
assets/globalxtreme-logo.png
scripts/build_seed.py   Regenerates data/budget-seed.js from the xlsx file
```

Initial task / timeline data (Master Timeline, task database, preparation deadlines) lives in `app.js`, inside the `seed()` function.

## Running locally

Open `index.html` directly in a browser, or:

```
npx serve .
# or
python3 -m http.server 8080
```

## Push to GitHub

```
cd gx27-site
git init
git add .
git commit -m "GX27 Operations dashboard"
git branch -M main
git remote add origin https://github.com/<username>/gx27-operations.git
git push -u origin main
```

## Deploy to Vercel

1. Go to vercel.com → **Add New → Project** → import the GitHub repo above.
2. **Framework Preset: Other**. Leave Build Command and Output Directory empty (the root folder is the site).
3. Click Deploy. Every later `git push` to `main` redeploys automatically.

Alternative via CLI: `npx vercel` from this folder, then `npx vercel --prod`.

## Updating the budget data from the sheet

1. Download the Google Sheet as `.xlsx` (File → Download → Microsoft Excel).
2. Run:
   ```
   pip install openpyxl
   python3 scripts/build_seed.py Budgeting_Anniv_GX_27TH.xlsx
   ```
   This rewrites `data/budget-seed.js` from the **EDIT DISINI** sheet, Acara division.
   The row mapping (vendor groups, Emergency Fund, row numbers) lives in the script. If rows move in the sheet, adjust the row numbers in the script.
3. Open `app.js` and bump the storage key so browsers load the new data:
   ```js
   var STORE_KEY = 'gx27.dashboard.v3';   // → 'gx27.dashboard.v4'
   ```
4. Commit and push. Vercel redeploys.

> Bumping `STORE_KEY` replaces each browser's local data with the new seed. Edits made in the browser that haven't been moved into the seed will be lost.

## Where data is stored

- Edits from the website (tasks, status, deadlines, budget items) are saved in **each browser's localStorage**.
  They survive a refresh, but **they aren't shared** between people or devices.
- For the whole team to see the same data in real time, the next step is a shared database
  (e.g. Supabase or Firebase). The data model in `app.js` is ready to be moved over.
- The Data panel (export/restore/import/reset) is hidden in the UI. Its code is still in `app.js`.
  To show it again, remove the `hidden` attribute from `#sideTools` and `#menuBtn` in `index.html`.

## Calculation rules (Finance)

- **Est. total**: the sheet's Total Price column. If it's empty, it's qty × price.
- **Vendor invoice** (Bali Games, BUMI, OJISAN, Doorprize): the invoice and payment are recorded on the vendor row. The line items below it only break down the estimate.
- **Emergency Fund**: an allocation of 20 million. The rows below it are spending from the fund.
- **Paid**: the DP or transferred amount. The Rp2,500 transfer fee (from the sheet's formula) is recorded separately.
- **Remaining**: invoice − paid. If there's no invoice yet, the estimate is used instead.
- Subtotals and the grand total are computed from item rows only, so nothing is counted twice.
- Payment status never changes a task's operational status.
