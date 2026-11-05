# Setup GX CS Dashboard (versi tanpa folder)

Halaman:
- `/` → Dashboard (bahasa ID/EN, mode Terang/Gelap)
- `/helpdesk-report` → Helpdesk Report (tag Aftersales)
- `/helpdesk-performance` → Helpdesk Performance Report (tag Best Employee) — slide EN/ID, mode viewer
- `/helpdesk-directory` → Helpdesk Employee Directory (tag Helpdesk) — ulang tahun & reminder kontrak
Helpdesk Management (🔒):
- `/spv#todo` → Personal To-Do List (task pribadi SPV + task yang di-assign ke tim, dipisah)
- `/spv#h1` → Management Report (Reporting to Head) — riwayat: **H2 2026** (otomatis dari to-do Jul–Des) & H1 2026 (arsip, editable)
- `/management-report?r=h2-2026` → link viewer report (tanpa login, read-only; `h1-2026` … `h2-2030`)
- `/quiz` → Quiz Knowledge Base: latihan per kategori + live quiz ala Kahoot (PIN/QR, timer, leaderboard, review)

Team Dashboard (terbuka):
- `/dashboard-helpdesk` → To-Do List Helpdesk Customer Support
- `/dashboard-am` → To-Do List Account Manager VIP
- `/knowledge-base` → Knowledge Base: 50 materi (Info Helpdesk, Administrasi, Teknis, Handling & Kebijakan) + quiz per materi + link referensi (edit hanya SPV yang login)

## Update: Quiz ala Kahoot, Tools & Access, Report 2026–2030 (Nov 2026 #2)
1. GitHub → upload SEMUA file dari ZIP (file baru: `quiz.html`, `quiz.js`, `qrcode.js`; berubah: `kb.html`, `kb-data.js`, `team.html`, `spv.html`, `mreport.js`, `todo.js`, `login.js`, `_auth.js`, `index.html`, `vercel.json`, `spv-schema.sql`).
2. Supabase → SQL Editor → jalankan ulang **`spv-schema.sql`** (menambah tabel quiz; aman dijalankan ulang).
3. Vercel → Environment Variables → tambah **`GX_TEAM_PASSWORD`** = password untuk tim (beda dengan password dashboard SPV) → Redeploy.
   Dipakai tim untuk membuka password tools di Dashboard Helpdesk / AM. Password tools diisi SPV lewat ✎ Edit tools — tersimpan di Supabase, tidak ada di kode/GitHub.
4. Quiz: buka `/quiz` (login SPV dulu di `/spv`) → pilih set (mis. Administrasi), jumlah soal & timer → **Buat sesi** → tampilkan QR/PIN → tim scan dari HP → leaderboard live → tiap peserta bisa review jawaban.

## Update: To-do Jul–Okt, INV VIP tgl 25, Report H2, Knowledge Base (Nov 2026)
1. GitHub → upload SEMUA file dari ZIP → Commit (file baru: `kb-data.js`, `mreport.js`, `report-view.html`; berubah: `spv.html`, `kb.html`, `team.html`, `todo.js`, `vercel.json`).
2. Tidak perlu SQL baru. Vercel otomatis redeploy setelah commit.
3. Buka `/spv` → **Import Monthly Tracker (Jul, Agu, Sep 2026)** — hanya mengisi bulan yang masih kosong (Oktober yang sudah ada tidak disentuh).
4. Pilih bulan November → **Salin task rutin dari bulan lalu** (bila belum) → **+ Task INV VIP tgl 25** (6 task tim, due tgl 25). Task tim ini ikut tersalin tiap bulan dan due date-nya otomatis geser ke bulan berikutnya.
5. Buka tab **Management Report** sekali → link viewer H2 aktif (tombol *Salin link*). Data report ter-update setiap tab ini dibuka.
6. Knowledge Base tidak menyimpan password. Isi materi ada di `kb-data.js`; SPV bisa edit/sembunyikan/tambah materi langsung dari halaman (tersimpan di Supabase).

## Update: Dashboard SPV + password (wajib sekali)
1. GitHub → upload SEMUA file dari ZIP → Commit (file baru: `_auth.js`, `gate.js`, `login.js`, `todo.js`, `spv.html`, `team.html`, `kb.html`, `spv-schema.sql`, `vercel.json` berubah).
2. Supabase → SQL Editor → jalankan `spv-schema.sql` (tabel to-do & dokumen; aman dijalankan ulang).
3. Vercel → Settings → Environment Variables → tambah **`GX_DASH_PASSWORD`** = password dashboard → Save → Redeploy.
   Password TIDAK ada di kode/GitHub. Tanpa env ini, 4 halaman terkunci menampilkan pesan "password belum diatur".
4. Buka `/spv` → login → klik **Import Monthly Tracker (Oct 2026)** sekali untuk mengisi to-do dari tracker.

Halaman terkunci (Helpdesk Report, Performance, Directory, Personal To-Do List & Management Report) memakai 1 password yang sama; login berlaku 30 hari
(cookie HttpOnly). Ganti password = ubah `GX_DASH_PASSWORD` di Vercel + Redeploy (semua sesi lama otomatis keluar).
Link viewer deck (`?view=1`) Helpdesk Report & Performance tetap bisa dibuka tanpa password (read-only).

## Update dari versi sebelumnya
1. GitHub → Add file → Upload files → seret SEMUA file dari ZIP → Commit changes.
2. Supabase → SQL Editor → jalankan `directory-schema.sql` (tabel karyawan + data 7 karyawan; aman dijalankan ulang, hanya mengisi kolom kosong). Bila belum: `perf-schema.sql` juga.
3. Vercel → Environment Variables → tambah `PUBLISH_KEY` (password admin) → Redeploy.
   Tanpa PUBLISH_KEY, siapa pun yang punya link bisa mengubah data & melihat data karyawan.
4. Cek https://gxhelpdeskreport.vercel.app/api/health → "performanceTable" & "directoryTable" = ok.

## Mode viewer / admin
- PUBLISH_KEY diisi → orang lain hanya bisa melihat; tombol edit muncul setelah klik 🔒 Admin + password.
- Helpdesk Performance: tombol 🔗 Link viewer menyalin link `?view=1` (tanpa tombol edit sama sekali).
- Employee Directory: dengan PUBLISH_KEY, isi directory hanya bisa dibuka dengan password (data pribadi).

## Setup baru dari nol
1. Upload semua file ke GitHub.
2. Supabase → SQL Editor → jalankan `schema.sql` (sudah termasuk semua tabel).
3. Vercel → SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUBLISH_KEY → Redeploy.

Menambah menu dashboard: edit daftar `MENUS` di index.html.
Kunci service_role hanya di Vercel — jangan taruh di GitHub atau config.js.
