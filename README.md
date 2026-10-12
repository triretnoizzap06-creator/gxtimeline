# GX27 Operations — Festival of Connectivity

Dashboard tim acara GX27: **Master Timeline, Rundown (Festival Flow), Overview, Tasks, Finance & Procurement, Calendar**, plus **Admin panel** dengan Save & Publish.

- Website: **https://gxtimeline.vercel.app/** (pengunjung, read-only)
- Admin: **https://gxtimeline.vercel.app/admin** (login → edit → Save → Publish)
- Backend: **Supabase** (Auth, Database Postgres, Storage, Realtime) — menggantikan Firebase
- Hosting: **Vercel** (deploy otomatis dari GitHub)

Desain, fitur, data, dan URL tetap sama. Yang berubah hanya backend.

---

## 1. Isi project

```
index.html            Halaman publik (read-only setelah Supabase aktif)
admin.html            Halaman /admin: login, Save, Publish, Admin panel
app.js                Semua halaman & logika: timeline, rundown, tasks, finance, kalender, kategori
admin.js              Admin: login, Save/Publish, konflik versi, settings, logo, tim, riwayat, redeploy
sync.js               Koneksi ke Supabase (Auth, DB via RPC, Storage, Realtime) + endpoint deploy
styles.css            Tampilan
api/config.js         GET /api/config → URL + anon key Supabase untuk browser (hanya nilai publik)
api/deploy.js         POST /api/deploy → redeploy Vercel (khusus admin, dicek ke Supabase)
api/deploy-status.js  GET /api/deploy-status → status build terakhir (admin/editor)
api/_lib.js           Helper bersama (validasi env, cek role)
supabase/schema.sql   Tabel, RLS, fungsi save/publish, storage logo, realtime, admin pertama
tests/api.test.js     Tes otomatis fungsi API (node tests/api.test.js)
scripts/build_seed.py Memperbarui data budget bawaan di app.js dari file xlsx budget
favicon*, apple-touch-icon.png   Ikon tab browser (logo bulat)
vercel.json           Clean URL (/admin), header keamanan & cache
package.json          Versi Node untuk Vercel (22.x), tanpa dependency
.env.example          Daftar environment variable (tanpa nilai rahasia)
```

Data timeline, task, budget (sheet *Budgeting_Anniv_GX_27TH_1.xlsx*, 76 baris, Rp 204.280.139), rundown Festival Flow, zona/area, dan logo GlobalXtreme **tertanam di app.js**, jadi website selalu tampil dengan data, bahkan sebelum database diisi.

---

## 2. Cara kerja data

| Lokasi | Isi | Siapa |
|---|---|---|
| `site_content` baris **draft** | Versi yang sedang diedit admin/editor | Admin & editor (baca/tulis lewat Save) |
| `site_content` baris **published** | Versi yang dilihat pengunjung | Semua orang baca, hanya admin Publish |
| `content_versions` | Setiap Save tersimpan (tidak pernah ditimpa) | Admin & editor |
| `site_admins` | Daftar email + role `admin`/`editor` | Dikelola admin dari Admin panel |
| `publish_log` | Riwayat save, publish, deploy | Admin & editor |
| Storage bucket `site-assets` | Logo yang di-upload | Publik baca, admin/editor upload |

- **Save changes** → draft baru di database (tersinkron ke semua admin di semua perangkat).
- **Publish** → draft disalin ke versi live → pengunjung langsung melihat (Realtime, tanpa refresh).
- Kalau dua orang edit bersamaan, yang Save belakangan mendapat **dialog konflik** (tidak ada data yang tertimpa diam-diam).
- **Login pertama admin ke database kosong**: database otomatis diisi (dari data di browser itu kalau ada, kalau tidak dari data bawaan) dan langsung dipublish.
- Sebelum Supabase dikonfigurasi, website jalan seperti dulu (edit tersimpan di browser saja).

**Keamanan**
- Semua penulisan lewat fungsi database yang mengecek role. Tabel tidak bisa ditulis langsung dari browser.
- Role dibaca dari akun Supabase yang **emailnya sudah terkonfirmasi**, bukan dari data yang bisa diubah user.
- Browser hanya menerima **anon/publishable key** (memang aman untuk publik). **Service role / secret key tidak dipakai sama sekali** dan akan ditolak oleh `/api/config` kalau tidak sengaja dimasukkan.

---

## 3. Setup Supabase

Project: `https://dorkvauioeotodkpeawo.supabase.co`

1. **Jalankan schema**
   Supabase Dashboard → **SQL Editor** → New query → paste **seluruh isi** `supabase/schema.sql` → **Run**.
   - Aman dijalankan ulang (tidak menghapus data).
   - Otomatis mendaftarkan **triretnoizzap06@gmail.com** sebagai **admin**.
   - Membuat bucket Storage `site-assets` dan mengaktifkan Realtime untuk `site_content`.
   - Hasil yang benar: "Success. No rows returned" (NOTICE "already exists, skipping" saat dijalankan ulang itu normal).

2. **Atur URL login**
   **Authentication → URL Configuration**
   - Site URL: `https://gxtimeline.vercel.app`
   - Redirect URLs → Add: `https://gxtimeline.vercel.app/admin`

3. **Pastikan login email aktif**
   **Authentication → Sign In / Providers → Email**: Enabled, dan **Confirm email = ON** (default).
   Login memakai **magic link** (link sekali pakai ke email), tanpa password.

4. **(Disarankan) Email SMTP sendiri**
   Email bawaan Supabase dibatasi beberapa email per jam. Kalau tim sering login: **Authentication → Emails → SMTP Settings** (mis. Gmail App Password, Resend, Brevo).

5. **(Opsional) Login Google**
   Authentication → Providers → Google → isi Client ID & Secret dari Google Cloud Console (redirect URI: `https://dorkvauioeotodkpeawo.supabase.co/auth/v1/callback`). Setelah aktif, set `SUPABASE_GOOGLE_LOGIN=true` di Vercel agar tombolnya muncul.

6. **Ambil anon key**
   **Project Settings → API Keys** → copy **anon public** (`eyJ...`) atau **Publishable key** (`sb_publishable_...`).
   ⚠ Jangan copy `service_role` / `secret`.

---

## 4. Setup Vercel

Project **gxtimeline** → **Settings → Environment Variables** (centang Production + Preview):

| Name | Value | Wajib |
|---|---|---|
| `SUPABASE_URL` | `https://dorkvauioeotodkpeawo.supabase.co` | ✅ |
| `SUPABASE_ANON_KEY` | anon public / publishable key (langkah 3.6) | ✅ |
| `SUPABASE_GOOGLE_LOGIN` | `true` kalau Google login sudah aktif, selain itu `false` | – |
| `VERCEL_DEPLOY_HOOK_URL` | Settings → Git → Deploy Hooks → buat hook `main` → copy URL | untuk tombol Redeploy |
| `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` (+ `VERCEL_TEAM_ID`) | untuk status build otomatis | – |

**Hapus env lama yang tidak dipakai lagi:** `FIREBASE_CONFIG`.

Env baru terbaca setelah deploy berikutnya: **Deployments → ⋯ → Redeploy** (atau push ke GitHub).

Pengaturan Build di Vercel tetap: Framework Preset **Other**, Build Command **kosong**, Output Directory **kosong** (root).

---

## 5. Upload ke GitHub

ZIP ini adalah **isi lengkap repo**.

**Lewat website GitHub:**
1. Extract ZIP.
2. Buka repo → **Add file → Upload files** → drag **semua isi folder** (bukan foldernya) termasuk folder `api`, `data`, `supabase`, `scripts`, `tests` → Commit.
3. **Hapus file/folder lama yang tidak dipakai lagi** (kalau ada di repo):
   `firebase/`, `SETUP.md`, `assets/`, `data/festival-flow-seed.js`, `data/rundown-seed.js`, `scripts/build_rundown.py`.
   (Buka file/folder → ikon ⋯ / tong sampah → Commit.)
4. Cek di repo: `index.html`, `admin.html`, `sync.js`, folder `api/` (4 file), `supabase/schema.sql` ada di **halaman utama repo**, bukan di dalam subfolder.

**Lewat terminal:**
```bash
cd repo-gxtimeline
git rm -r --ignore-unmatch firebase SETUP.md assets data/festival-flow-seed.js data/rundown-seed.js scripts/build_rundown.py
# copy seluruh isi ZIP ke sini (timpa)
git add -A
git commit -m "Migrasi backend Firebase → Supabase"
git push
```

Vercel deploy otomatis 1–2 menit setelah push.

---

## 6. Login pertama

1. Buka **https://gxtimeline.vercel.app/admin** di laptop yang selama ini dipakai edit dashboard.
2. Masukkan `triretnoizzap06@gmail.com` → **Kirim link login** → buka email → klik link.
3. Kembali di `/admin` sebagai **ADMIN**. Karena database masih kosong, data otomatis diisi & dipublish
   (notifikasi di atas menyebut sumber datanya).
4. Tambah tim: **Admin panel → Team & permissions** → email + role (`admin` / `editor`). Mereka login di `/admin` dengan email itu.

---

## 7. Pemakaian harian

- Edit apa saja di `/admin` → **Save changes** (atau Ctrl/Cmd+S) → **Publish** → konfirmasi.
- **Langsung dari website:** task, kategori & workstream, budget & pembayaran, rundown & zona, judul/tanggal event, preparation deadlines, logo, link sheet, tim, restore versi lama.
- **Perlu ubah kode + push ke GitHub:** layout/warna/font, halaman baru, field baru, rumus finance. Tombol **Redeploy** di Admin panel hanya build ulang commit terakhir.

---

## 7b. Status task (bisa dikelola sendiri)

Default ada 4 status, dipakai di **Tasks, Master Timeline, Calendar, Rundown, dan Overview**:

| Status | Warna | Jenis |
|---|---|---|
| Not Started | abu-abu | Belum mulai |
| In Progress | biru | Berjalan |
| Pending | merah | Menunggu |
| Done | hijau | Selesai (dicoret, masuk KPI Completed) |

Kelola di **Tasks → Kelola kategori → Status task** (atau link "Kelola status" di form task/segmen): tambah, ganti nama, ganti warna, ubah urutan, hapus. Ganti nama otomatis memperbarui semua task & segmen rundown; status yang masih dipakai harus dipindah dulu sebelum dihapus. Data lama dengan status *Pending Approval* / *Blocked* otomatis dipindah ke **Pending**; status rundown lama (Planned/Confirmed/Changed/Cancelled) dipindah ke Not Started/Done/Pending.

Status pembayaran di Finance (Pending Payment / DP Paid / Full Paid) tetap terpisah karena dipakai untuk menghitung nominal.

## 7c. Data budget dari sheet

- Finance otomatis terisi dari sheet bawaan kalau masih kosong.
- Kalau data di database/browser berasal dari sheet versi lama, halaman Finance (untuk admin) menampilkan banner **"Data budget dari sheet terbaru tersedia" → Terapkan data sheet terbaru** → Save → Publish. Task, rundown, dan settings tidak berubah; versi lama tetap ada di Version history.

## 7d. Realtime (beda device / beda email)

- **Auto-save**: setiap perubahan di admin panel langsung tersimpan ke database (±1 detik). Tombol Save tetap ada untuk simpan manual.
- **Auto-publish**: perubahan yang disimpan **admin** langsung tampil di website live. Perubahan **editor** masuk draft dan tampil di semua admin panel, tapi baru live setelah admin klik Publish.
- Semua admin panel yang terbuka (device/email apa pun) ikut berubah tanpa refresh. Pengunjung website juga dapat versi live terbaru tanpa refresh.
- Kalau dua orang mengedit bersamaan, perubahan digabung per item. Kalau field yang sama diubah dua-duanya, yang terakhir disimpan yang dipakai. Form yang sedang dibuka tidak ditimpa: update dari orang lain masuk setelah form ditutup.
- Indikator di sidebar: **Live** = realtime tersambung; **Sinkron tiap 5 detik** = websocket belum tersambung, website mengecek ulang otomatis; **Offline** = tidak ada internet (perubahan disimpan di browser lalu dikirim saat online).
- Kedua pengaturan bisa dimatikan admin di Admin panel → **Realtime & sinkronisasi**.
- Supabase Realtime harus aktif untuk tabel `site_content` (sudah diatur oleh `schema.sql`). Cek di Supabase → Database → Publications → `supabase_realtime` → `site_content` tercentang.
- Auto-save membuat banyak versi, jadi database otomatis menyimpan **300 versi terakhir** (ditambah versi yang sedang live) dan **2.000 baris riwayat**. Ini supaya tetap muat di paket gratis Supabase.
- **Penting:** jalankan ulang `supabase/schema.sql` di SQL Editor setelah upload ZIP ini (aman dijalankan berulang).

## 8. Checklist testing setelah deploy

Centang satu per satu di production:

- [ ] `https://gxtimeline.vercel.app/api/config` menampilkan `"configured":true` dan URL Supabase (bukan error)
- [ ] Halaman publik tampil lengkap: logo, Master Timeline, Rundown, Tasks, Finance, Calendar; favicon logo bulat di tab
- [ ] Finance terisi (Estimated budget Rp 204.280.139, 76 rows). Kalau admin melihat banner "Data budget dari sheet terbaru tersedia" → klik Terapkan → Save → Publish
- [ ] Status task hanya 4 (Not Started abu, In Progress biru, Pending merah, Done hijau) dan tampil di Tasks, Master Timeline, Calendar, Rundown
- [ ] Pengunjung tidak melihat tombol "+ New task", "Kelola kategori", dll.
- [ ] `/admin` → kirim magic link ke `triretnoizzap06@gmail.com` → email masuk → klik → masuk sebagai **ADMIN**
- [ ] Database kosong langsung terisi & dipublish (cek Supabase → Table Editor → `site_content` ada baris `draft` dan `published`)
- [ ] Ubah status satu task → **Save** → muncul "Tersimpan ke database · versi N"
- [ ] **Publish** → konfirmasi menampilkan ringkasan perubahan → status **Published · live**
- [ ] Buka website di HP / browser lain → perubahan sudah terlihat (tanpa login)
- [ ] Upload logo di Admin panel → Apply → Save → Publish → logo baru tampil di website (Storage → `site-assets/logo/` ada filenya)
- [ ] Tambah 1 editor → editor login → bisa Save, tombol Publish nonaktif
- [ ] Dua admin edit bersamaan → yang Save belakangan dapat dialog konflik
- [ ] Admin panel → Version history → "Muat ke editor" versi lama → Save → Publish
- [ ] Akun yang tidak terdaftar → layar "Akun belum punya akses"
- [ ] (Kalau diisi) Tombol **Redeploy** → status build berubah ke Published

---

- [ ] Buka /admin di 2 device dengan 2 email admin. Ubah status task di device 1 tanpa klik Save. Device 2 dan website publik harus berubah dalam beberapa detik, dan sidebar menunjukkan "Live".
- [ ] Ubah task berbeda di 2 device bersamaan. Kedua perubahan harus tetap ada.

## 9. Yang masih perlu kamu lakukan manual

1. Jalankan `supabase/schema.sql` di SQL Editor Supabase.
2. Atur **Site URL** dan **Redirect URL** `/admin` di Supabase Authentication.
3. Copy **anon/publishable key** → isi `SUPABASE_URL` & `SUPABASE_ANON_KEY` di Vercel → hapus `FIREBASE_CONFIG`.
4. Upload isi ZIP ke GitHub + hapus file lama Firebase (bagian 5).
5. Redeploy di Vercel, lalu login pertama di `/admin`.
6. (Disarankan) SMTP sendiri di Supabase supaya magic link tidak kena limit.
7. (Opsional) Google login, Deploy Hook, Vercel token.
8. Jalankan checklist bagian 8.
9. Setelah semua jalan: matikan/hapus project Firebase lama kalau sudah tidak dipakai.

---

## 10. Tes yang sudah dijalankan sebelum ZIP ini dibuat

Dijalankan di lingkungan lokal (bukan di production kamu):

- **Database (PostgreSQL 16 asli + `schema.sql` final, 35/35 lolos):** schema bisa dijalankan 2× tanpa error; role admin/editor/pengunjung/akun asing; email belum terkonfirmasi ditolak; konflik versi; editor tidak bisa publish; tabel tidak bisa ditulis langsung; admin tidak bisa menghapus diri sendiri; kebijakan upload logo.
- **End-to-end (34/34 lolos):** website asli + library `supabase-js` 2.49.4 asli + PostgREST (server REST yang dipakai Supabase) + PostgreSQL dengan `schema.sql`, plus fungsi `/api/config` asli. Mencakup magic link, isi otomatis & publish pertama, Save, Publish dengan konfirmasi, kategori, rundown, logo ke Storage, pengunjung read-only di browser lain, editor, konflik dua user, restore versi, logout.
- **Status & budget (26/26 lolos):** isi otomatis Finance kosong, migrasi status lama ke 4 status, banner Terapkan sheet, kelola status (ganti nama/warna, tambah, hapus+pindah), status tampil di Timeline/Rundown/Calendar/Tasks, tampilan mobile.
- **API (14/14 lolos):** `node tests/api.test.js` — config, penolakan service role key, deploy hanya untuk admin.

**Belum bisa diuji dari sini** (perlu dicek lewat checklist di production):
pengiriman email magic link sungguhan oleh Supabase, Realtime lewat server Supabase asli (di tes lokal, sinkronisasi dicek dengan memuat ulang halaman), login Google, Deploy Hook & API Vercel sungguhan.

---

## 11. Update data budget dari sheet

```bash
pip install openpyxl
python3 scripts/build_seed.py Budgeting_Anniv_GX_27TH.xlsx
```
Ini hanya mengubah **data bawaan**. Setelah database aktif, data utama ada di Supabase. Untuk memasukkan budget baru ke database pakai **Admin panel → Data tools → Import budget sheet**, lalu Save & Publish.

## 12. Aturan hitung Finance

- **Est. total** = kolom Total Price sheet (atau qty × harga).
- **Vendor invoice** (Bali Games, BUMI, OJISAN, Doorprize): invoice & pembayaran dicatat di baris vendor; baris di bawahnya rincian estimasi.
- **Emergency Fund**: alokasi; baris di bawahnya adalah pemakaian dana.
- **Paid** = DP / nominal transfer; biaya transfer Rp2.500 dicatat terpisah. **Remaining** = invoice − paid (pakai estimasi kalau invoice belum ada).
- Subtotal & grand total dihitung dari baris item, tanpa double count. Status pembayaran tidak mengubah status operasional task.
