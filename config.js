// GX Helpdesk Report — koneksi Supabase dari browser.
// Isi 2 nilai di bawah dari Supabase → Project Settings → API (atau tombol "Connect" → API Keys):
//   url     = Project URL, contoh 'https://abcdefghijkl.supabase.co'
//   anonKey = kunci PUBLIK: "anon public" (eyJ...) atau "publishable" (sb_publishable_...)
// Kunci publik aman ditaruh di web: browser hanya bisa memanggil fungsi report (lihat supabase/schema.sql),
// tidak bisa membaca/mengubah tabel langsung.
// JANGAN pernah isi kunci service_role / secret (sb_secret_...) di file ini.
// Kosongkan keduanya bila ingin memakai server /api/report di Vercel (env SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
window.GX_SUPABASE = {
  url: '',
  anonKey: ''
};
