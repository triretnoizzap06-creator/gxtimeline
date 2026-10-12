# GX27 Festival of Connectivity — Dashboard

Website timeline, rundown, task, finance, dan kalender GX27.
**Tanpa login.** Siapa pun yang membuka website bisa tambah, ubah, hapus, dan atur ulang semuanya. Perubahan langsung tersimpan dan muncul di semua device dalam beberapa detik.

## Yang bisa diatur langsung dari website
- **Task:** tambah (+ New task), edit (klik baris → Edit task), hapus (klik baris → Delete), ganti status langsung di tabel.
- **Kolom (Tasks & Finance):** tombol **Kelola kolom**. Bisa tambah kolom baru (teks, angka, rupiah, tanggal, dropdown, centang, link), ganti nama, sembunyikan, urutkan, dan hapus.
- **Status:** Kelola kategori → tab Status. Default: Done hijau, In Progress biru, Pending merah, Not Started abu. Bisa ditambah, diganti nama, diganti warna, diurutkan, dan dihapus.
- **Kategori & workstream:** Kelola kategori.
- **Budget, rundown, zona:** tambah, edit, hapus dari halamannya masing-masing.

## Isi folder
- `index.html`, `app.js`, `styles.css`: tampilan website.
- `admin.js`: mesin simpan otomatis dan sinkronisasi antar device (namanya saja, tidak ada admin/login).
- `sync.js`: koneksi ke Supabase.
- `api/config.js`: memberi tahu browser alamat Supabase (dari Environment Variables Vercel).
- `supabase/schema.sql`: struktur database.

## Setup (sekali saja)
1. **Supabase → SQL Editor:** paste isi `supabase/schema.sql`, lalu klik **Run**. Aman dijalankan berulang.
2. **Vercel → Settings → Environment Variables:**
   - `SUPABASE_URL` = `https://dorkvauioeotodkpeawo.supabase.co`
   - `SUPABASE_ANON_KEY` = anon / publishable key dari Supabase → Project Settings → API. **Jangan pakai service_role / secret key.**
   - Hapus `FIREBASE_CONFIG` kalau masih ada.
3. **GitHub:** upload semua file ZIP ini ke repo, timpa yang lama, lalu **hapus `admin.html`** dari repo kalau masih ada. Commit, dan Vercel deploy otomatis.
4. Buka website. Kalau database masih kosong, data awal (timeline + budget sheet) otomatis terisi.

Kalau Environment Variables belum diisi, website tetap bisa diedit tapi hanya tersimpan di browser masing-masing (tidak sinkron).

## Sinkron antar device
- Indikator di sidebar: **Live** (realtime tersambung), **Sinkron tiap 5 detik** (cadangan kalau realtime putus), **Offline** (perubahan disimpan di browser dulu lalu dikirim saat online).
- Status simpan di sidebar: **Menyimpan…** lalu **Tersimpan otomatis · vN**.
- Kalau dua orang edit bersamaan, perubahan digabung per item. Kalau field yang sama diubah dua-duanya, yang terakhir disimpan yang dipakai.

## Kalau ada data yang terhapus tidak sengaja
Setiap simpanan tersimpan sebagai versi (300 terakhir). Pemulihan: Supabase → Table Editor → `content_versions` → cari versi sebelum terhapus → salin kolom `data` → Supabase → SQL Editor:
```sql
select public.save_draft('<paste data>'::jsonb, 0, true);
select public.publish_content('pulihkan');
```

## Risiko
Siapa pun yang punya link bisa mengubah atau menghapus data. Bagikan link hanya ke tim.

## Testing checklist setelah deploy
- [ ] Buka website di HP dan laptop. Sidebar menunjukkan **Live**.
- [ ] Tambah task di HP. Dalam beberapa detik muncul di laptop tanpa refresh.
- [ ] Hapus task itu di laptop. Hilang juga di HP.
- [ ] Tasks → Kelola kolom → tambah kolom "Lokasi". Muncul di device lain.
- [ ] Ubah status task. Warnanya sesuai (Done hijau, In Progress biru, Pending merah, Not Started abu).
