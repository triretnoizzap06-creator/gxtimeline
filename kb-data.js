/* Knowledge Base GX CS — materi hasil crawling Notion "Customer Service Division Information - GlobalXtreme"
   (https://melon-lime-e28.notion.site/Customer-Service-Division-Information-GlobalXtreme-47b6a98d6f6347c5893df56334d34b25),
   dikelompokkan ulang per kategori + quiz per materi. Password/kredensial sengaja TIDAK dimasukkan.
   Format body: baris "## " = sub-judul, "- " = poin, "1. " = langkah, "> " = catatan penting, **tebal**. */
window.KB_CATS = [
  ['helpdesk', 'Info Helpdesk', 'SOP, template & tools tim Helpdesk Customer Support dan Account Manager'],
  ['admin', 'Administrasi', 'Billing, pembayaran, invoice & perubahan data pelanggan'],
  ['teknis', 'Teknis', 'Handling teknis, troubleshooting & pengetahuan jaringan'],
  ['umum', 'Handling & Kebijakan', 'Flow handling customer, template, kebijakan divisi, KPI & promo'],
];
const N = id => 'https://melon-lime-e28.notion.site/' + id;
window.KB_MATERI = [
/* ============================ INFO HELPDESK ============================ */
{ id: 'sop-flow-helpdesk', cat: 'helpdesk', title: 'SOP Flow Handling Helpdesk Customer Support', src: N('1d69b0fbceac80b98317da1a66743b16'),
  summary: 'Alur kerja Helpdesk & CC Piket dari terima komplain di GX Connect sampai Investigated H+1 (flow baru 1 September 2026).',
  body: `## Tools
- **Public Ticket GX Connect**: https://gxcsconnect.globalxtreme-solutions.net/public/tickets
- **GX Connect (login CSO)**: https://gxcsconnect.globalxtreme-solutions.net/login
## Alur handling
1. **Terima komplain** dari internal GlobalXtreme / Sales lewat GX Connect → klik **Take & Start Monitoring** (status jadi In Progress).
2. **Cek UID / nomor telepon** customer di Qiscus — apakah customer sudah pernah terhubung.
3. **Cek history ticket** — apakah case pernah ditangani CSO lain, termasuk kemungkinan Contact Person (CP) berbeda.
4. **Sudah terhubung & keluhan sama dengan case CC** → biarkan Contact Center melanjutkan; Helpdesk cukup monitor, update progress di GX Connect, lalu double crosscheck tiket di GX One.
5. **Sudah terhubung tapi keluhan berbeda** → broadcast ulang sesuai kendala terbaru, update GX Connect, crosscheck di GX One.
6. **Belum pernah terhubung** → kirim Broadcast General Helpdesk dan update progress di GX Connect.
> Wajib menambahkan UID / CID pada Customer Properties di Qiscus setiap kali broadcast.
## Ketentuan broadcast
- Broadcast **tidak perlu open ticket** — ticket dibuka oleh agent yang mendapat chat langsung dari customer.
- **BC 1 (1 jam pertama)**: fu_helpdesk_eng_new / fu_helpdesk_ind_new; tanpa User ID pakai fu_helpdesk_without_uid.
- **BC 2 (follow up)**: fu_bc2_helpdesk bila customer belum merespons.
- **Gamas**: cek dulu apakah sudah di-broadcast Tim Dispatcher. Sudah → tidak perlu broadcast ulang; belum → Helpdesk/CC Piket wajib broadcast sesuai flow Gamas.
## Rules update GX Connect
- Status wajib di-update sampai **Solved**, **No Resp BC 2**, atau **No Resp After Connected**.
- Update **maksimal setiap 3 jam**, tetap wajib walau customer belum merespons.
- Dilarang membiarkan case tanpa monitoring / tanpa update. Case yang di-handle Dispatcher pun nomor ticket-nya tetap diinput di GX Connect.
## Status
- **New**: komplain baru, belum diambil. **In Progress**: sudah Take & Start Monitoring.
- **No Resp BC 1**: tidak ada respons 1 jam setelah BC 1 → lanjut BC 2.
- **No Resp BC 2** dan **No Resp After Connected** → masuk **Investigated H+1**.
- **Done**: masalah selesai & terkonfirmasi.
## Investigated H+1
- Dicek hari berikutnya lewat system/traffic & info handling terbaru.
- **Solved** (customer konfirmasi) → Done. **Solved by Our Side** (tidak respons tapi traffic sudah normal) → Done. **Unresolved** → lanjut handling.
## Request Sales yang butuh CTSO
- Contoh: info SSID / panduan ganti SSID → update GX Connect → Create Ticket di GX One → **Send to CTSO** → monitor & update GX Connect tiap ada update CTSO.
## Wiredown
- Info WD dari Sales tanpa foto ONU → broadcast Qiscus untuk cek kondisi listrik di lokasi.
- Dengan foto ONU (lampu LOS menyala): cek ONU Monitoring + screenshot → cek jadwal → create ticket WO → broadcast fu_jadwal_wd_eng_new / fu_jadwal_wd_indo_new → kirim ticket update ke GX Connect.
- Parameter template: {{1}} nomor WO/tiket, {{2}} ketersediaan jadwal, {{3}} estimasi jadwal lanjutan (jadwal hari ini → paling lambat besok; jadwal besok → paling lambat lusa).`,
  quiz: [
    { q: 'Apa langkah pertama saat Helpdesk menerima komplain di GX Connect?', o: ['Langsung broadcast ke customer', 'Take & Start Monitoring', 'Create ticket di GX One', 'Menunggu CC'], a: 1, e: 'Take & Start Monitoring menandakan case sudah diambil Helpdesk dan status menjadi In Progress.' },
    { q: 'Berapa interval maksimal update progress di GX Connect?', o: ['1 jam', '3 jam', '6 jam', 'Sekali sehari'], a: 1, e: 'Update wajib maksimal setiap 3 jam, walaupun customer belum merespons.' },
    { q: 'Template BC 1 untuk customer tanpa User ID adalah…', o: ['fu_bc2_helpdesk', 'fu_helpdesk_ind_new', 'fu_helpdesk_without_uid', 'template_gamas_general_1'], a: 2, e: 'Customer tanpa UID memakai fu_helpdesk_without_uid.' },
    { q: 'Status mana yang masuk proses Investigated H+1?', o: ['New & In Progress', 'No Resp BC 2 & No Resp After Connected', 'No Resp BC 1', 'Done'], a: 1, e: 'Investigated H+1 dilakukan untuk No Resp BC 2 dan No Resp After Connected.' },
    { q: 'Customer tidak merespons, tapi traffic internet sudah normal saat dicek H+1. Statusnya…', o: ['Unresolved', 'Tetap In Progress', 'Done (Solved by Our Side)', 'No Resp BC 1'], a: 2, e: 'Solved by Our Side → status diubah menjadi Done.' },
  ] },
{ id: 'keyword-qiscus', cat: 'helpdesk', title: 'Keyword Template Qiscus Helpdesk', src: N('30d9b0fbceac8184b5efff365c48bd18'),
  summary: 'Daftar keyword template broadcast Qiscus beserta fungsi dan parameternya.',
  body: `> Broadcast saat ini memakai nomor **361-736-822**.
## Follow up general
- **fu_helpdesk_ind_new / fu_helpdesk_eng_new** — follow up langsung ke customer oleh Helpdesk (assign sesuai klasifikasi case).
## Billing & invoice (random assign)
- **konfirmasi_tagihan_resend_invoice** — konfirmasi tagihan & kirim ulang invoice.
- **resend_invoice_helpdesk** — permintaan resend invoice (Inet Aman).
## Jadwal & kunjungan teknisi (random assign)
- **arrival_estimasi_today** — kunjungan teknisi hari ini + konfirmasi 1 jam sebelum datang.
- **arrival_estimasi_tentative** — WO {{1}} sudah terjadwal tapi estimasi masih tentative (besok/lusa). {{1}} = nomor WO/tiket.
## Survey request Sales
- **fu_survey_schedule** — follow up jadwal survey dari Sales (random assign).
- **hasil_kunjungan_teknisi_new** — informasi hasil kunjungan (CC/Helpdesk/CSO sesuai case).
## Akses & credential
- **detail_mygx_hd** — khusus Helpdesk. {{1}} CID / User ID, {{2}} email, {{3}} password; {{4}}–{{6}} mengikuti pola yang sama.
## Wiredown / Gamas
- **fu_terdeteksi_wd_new** — customer terdeteksi WD, minta cek kelistrikan/sambungan kabel.
- **fu_jadwal_wd_eng_new / fu_jadwal_wd_indo_new** — jadwal WD: {{1}} nomor WO, {{2}} ketersediaan jadwal, {{3}} estimasi jadwal lanjutan.
- **template_gamas_general_1** — Gamas general + link tracker.
- **back_normal** — broadcast dari Dispatcher.`,
  quiz: [
    { q: 'Template untuk mengirim ulang invoice sekaligus konfirmasi tagihan adalah…', o: ['resend_invoice_helpdesk', 'konfirmasi_tagihan_resend_invoice', 'detail_mygx_hd', 'fu_survey_schedule'], a: 1, e: 'konfirmasi_tagihan_resend_invoice dipakai untuk follow up konfirmasi tagihan dan kirim ulang invoice.' },
    { q: 'Parameter {{1}} pada arrival_estimasi_tentative berisi…', o: ['Nama customer', 'Nomor Work Order / Tiket', 'Tanggal kunjungan', 'UID'], a: 1, e: '{{1}} = nomor Work Order / Tiket.' },
    { q: 'Template detail_mygx_hd digunakan oleh…', o: ['Dispatcher', 'Random assign', 'Helpdesk', 'CTSO'], a: 2, e: 'detail_mygx_hd khusus untuk follow up oleh tim Helpdesk.' },
    { q: 'Template untuk customer yang terdeteksi wiredown agar cek kelistrikan di lokasi…', o: ['back_normal', 'fu_terdeteksi_wd_new', 'template_gamas_general_1', 'arrival_estimasi_today'], a: 1, e: 'fu_terdeteksi_wd_new meminta customer mengecek kelistrikan/sambungan kabel.' },
  ] },
{ id: 'sop-operational-rules', cat: 'helpdesk', title: 'SOP Operational Rules Helpdesk & CC Piket', src: N('3229b0fbceac803db321d30ef6880ecd'),
  summary: 'Aturan handling case Customer Support dan SOP follow up request dari Sales (flow 13 Maret 2026).',
  body: `## Prinsip
- Semua permintaan dari Sales ditangani & dibuatkan tiket oleh Helpdesk.
- Permintaan internal saja → langsung di-handle (OT / WO) **tanpa broadcast** ke customer.
- Permintaan yang butuh konfirmasi ke customer → **wajib broadcast** dengan template yang sesuai.
## Case handling rules
1. CSO / CC **tidak boleh** handover case ke Qiscus Helpdesk.
2. Self-assign / membalas chat broadcast sendiri **hanya untuk CC Piket / Helpdesk** bila perlu follow up personal.
3. Setelah shift Helpdesk selesai, **CC Piket boleh self-assign** untuk melanjutkan handling.
4. Request dari Sales → Helpdesk boleh membuat ticket sesuai kebutuhan.
5. Sales minta follow up ke customer → **wajib broadcast lewat Qiscus**.
6. Case Gamas → Helpdesk / CC Piket wajib broadcast sesuai flow Gamas.
## Follow up direct request Sales (contoh survey instalasi)
1. Cek kembali tiket di **H+1** setelah WO dibuat.
2. Pastikan update terbaru dari WO teknisi sudah masuk tiket.
3. Sampaikan hasil kunjungan teknisi ke customer (self-assign saat broadcast).
4. Sampaikan progress ke Sales.
## Edukasi setelah survey & instalasi
- Layanan memakai **prepaid system**.
- Biaya instalasi di awal adalah **estimasi** dari survey; biaya aktual bisa disesuaikan setelah instalasi.
## Flow instalasi
- Request survey → survey lokasi → bila ada kebutuhan tambahan dibuat **Proforma Invoice** → customer approve → **Invoice** (prepaid) → customer bayar → instalasi → **Report Realization** → penyesuaian biaya.
- Biaya lebih → jadi **Credit Balance**; biaya kurang → customer bayar selisih.
## Cek WO vs realization
- Billing Helpdesk membuat invoice dari data realization di WO. Bila ada mismatch (mis. panjang kabel), **lapor ke SPV** dan follow up ke teknisi terkait.`,
  quiz: [
    { q: 'Siapa yang boleh self-assign / membalas chat broadcast sendiri?', o: ['Semua CSO', 'Hanya CC Piket / Helpdesk', 'Hanya Dispatcher', 'Hanya SPV'], a: 1, e: 'Self-assign hanya untuk CC Piket / Helpdesk saat perlu follow up personal.' },
    { q: 'Jika biaya realisasi instalasi lebih kecil dari yang sudah dibayar, kelebihannya menjadi…', o: ['Dikembalikan tunai', 'Credit Balance', 'Hangus', 'Diskon bulan depan'], a: 1, e: 'Kelebihan biaya menjadi Credit Balance.' },
    { q: 'Ada mismatch panjang kabel antara WO dan realization. Apa yang harus dilakukan?', o: ['Abaikan', 'Lapor SPV dan follow up teknisi', 'Langsung revisi invoice sendiri', 'Hubungi customer'], a: 1, e: 'Agent wajib melapor ke SPV dan follow up teknisi untuk klarifikasi.' },
    { q: 'Request Sales yang hanya bersifat internal ditangani dengan…', o: ['Broadcast ke customer', 'OT / WO tanpa broadcast', 'Handover ke CC', 'Email ke billing'], a: 1, e: 'Permintaan internal langsung di-handle (OT/WO) tanpa broadcast.' },
  ] },
{ id: 'scope-helpdesk', cat: 'helpdesk', title: 'Scope Penanganan Helpdesk Customer Support', src: N('30d9b0fbceac8006a3c3d7107e5469c8'),
  summary: '9 kategori pekerjaan yang ditangani tim Helpdesk dari request Sales.',
  body: `## Kategori penanganan
1. **GAMAS** — gangguan massal yang berdampak ke beberapa pelanggan dalam satu area.
2. **Grace Period Extension / Billing Bypass** — perpanjangan masa tenggang / bypass billing sesuai SOP.
3. **Resend Invoice ke Sales** — kirim ulang invoice **ke tim Sales** untuk kebutuhan customer.
4. **Post Payment** — input / konfirmasi pembayaran yang sudah diterima.
5. **Change Payment Cycle Period** — bila sudah fix dan tidak perlu follow up ke customer.
6. **Password Information** — reset/info password MyGX; reset/info SSID & password WiFi (CTSO); info diberikan ke Sales sesuai kebutuhan.
7. **Survey direct dari Sales** — open WO memakai akun GlobalXtreme MNT **globalxtremG39A**.
8. **Pengiriman hasil survey** ke Sales / tim internal.
9. **Penjadwalan LAN request dari Sales** — bila customer sudah bayar, detail lengkap, tanggal & ticket fix: cek jadwal, rekonfirmasi ke Sales, input jadwal, update status ke Sales. **Tidak follow up ke customer.**`,
  quiz: [
    { q: 'Akun yang dipakai untuk open WO survey direct dari Sales adalah…', o: ['cso@globalxtreme.net', 'globalxtremG39A', 'helpdesk2', 'Akun pribadi CSO'], a: 1, e: 'Survey direct dari Sales dibuka memakai akun GlobalXtreme MNT globalxtremG39A.' },
    { q: 'Pada penjadwalan LAN request dari Sales, Helpdesk…', o: ['Follow up customer langsung', 'Tidak follow up ke customer', 'Membuat proforma', 'Menunggu customer menghubungi'], a: 1, e: 'Helpdesk mengatur jadwal & update ke Sales, tanpa follow up ke customer.' },
    { q: 'Resend invoice pada scope Helpdesk dikirim kepada…', o: ['Customer langsung', 'Tim Sales', 'Accounting', 'CTSO'], a: 1, e: 'Resend invoice dikirim kepada tim Sales.' },
  ] },
{ id: 'pengawalan-tiket', cat: 'helpdesk', title: 'Ketentuan Pengawalan Tiket Customer Support', src: N('3109b0fbceac80958cd8e492fceb467e'),
  summary: 'Aturan serah terima pengawalan tiket antar shift lewat Sheet Monitoring.',
  body: `## Ketentuan
1. Serah terima pengawalan dilakukan lewat tracking di **Sheet Monitoring** untuk shift berikutnya.
2. Tiket **IN PROGRESS** wajib dilanjutkan & di-update shift berikutnya, **maksimal interval update 3 jam**.
3. Sebelum ganti shift, CC Piket/Helpdesk wajib update pengawalan di sheet monitoring.
4. Shift berikutnya wajib cek Sheet Monitoring sebelum melanjutkan.
5. Setelah serah terima, pengawalan sepenuhnya tanggung jawab shift berikutnya.
## Format serah terima
- **Sebelum Helpdesk end shift**: "Pengawalan Monitoring Customer Support — Helpdesk: Bagas ➝ Sita, CC Piket: Mahadi". Tanggung jawab monitoring pindah ke Helpdesk berikutnya.
- **Setelah Helpdesk end shift**: monitoring wajib diserahkan ke **CC Piket** (contoh "Helpdesk: Sita ➝ Mahadi (CC Piket)") beserta daftar **UID In Progress**.`,
  quiz: [
    { q: 'Serah terima pengawalan tiket dilakukan melalui…', o: ['Chat pribadi', 'Sheet Monitoring', 'Email', 'Lisan saja'], a: 1, e: 'Tracking pengawalan dilakukan di Sheet Monitoring.' },
    { q: 'Jika Helpdesk sudah end shift, monitoring diserahkan ke…', o: ['SPV', 'CC Piket', 'Dispatcher', 'Sales'], a: 1, e: 'Setelah Helpdesk end shift, monitoring wajib diserahkan ke CC Piket.' },
    { q: 'Apa yang wajib dicantumkan saat serah terima ke CC Piket?', o: ['Daftar UID In Progress', 'Nomor rekening', 'Password Qiscus', 'Jadwal teknisi'], a: 0, e: 'Serah terima ke CC Piket menyertakan daftar UID yang masih In Progress.' },
  ] },
{ id: 'flow-account-manager', cat: 'helpdesk', title: 'Flow Account Manager — Handling Group VIP', src: N('2fe9b0fbceac808ba433d9149a7d0a4f'),
  summary: 'Cara Account Manager & CC Piket memonitor dan menangani Group VIP.',
  body: `## 1. Monitoring Group VIP
- Account Manager wajib monitoring aktif di WhatsApp Group VIP: pesan pelanggan, update internal, case yang belum direspons.
## 2. Complaint & first response
- Greeting sopan & casual, lalu pengecekan awal.
- **Administrasi / penjadwalan / wiredown / info Gamas** → bisa langsung di-handle AM atau CC Piket.
- **Teknis** (koneksi, device, link) → tag **CTSO VIP** langsung di group.
## 3. Bahasa
- Lebih casual, human, profesional; **tidak memakai template kaku**; tetap jaga etika.
## 4. Tracking load VIP
- Tracking monitoring Group VIP wajib diisi AM (GX Connect) untuk menghitung load & memantau case hold.
## 5. Follow up proaktif
- Follow up ulang case yang belum dikonfirmasi / menggantung — **proaktif, jangan menunggu pelanggan**.
## 6. Response time & take over
- Chat belum terbalas **maksimal 5 menit** → CC Piket atau AM boleh take over.
- Case WD tanpa balasan CC Piket/AM → Dispatcher boleh mengawal sampai penjadwalan.
## 7. Upgrade package
- AM meng-handle dari awal sampai form lengkap, lalu di-share random ke WA Primary untuk di-assign ke human agent. Bila tidak ada AM incharge, CC Piket boleh handle.
- Trial upgrade: bisa CC Piket atau AM.
## 8. Personal chat
- Pelanggan Group VIP diarahkan kembali ke group. Bila harus PC ke PIC lain, tetap tulis **summary di Group VIP**.
## 9. Monitoring Group Ticket Request CTSO
- Pantau group CTSO untuk info Group VIP baru / belum ada AM. Admin group CTSO → minta CTSO menambahkan AM; admin Head/Kabag/PIC lain → minta bantuan PIC Putri.`,
  quiz: [
    { q: 'Case teknis di Group VIP ditangani dengan cara…', o: ['Langsung dijadwalkan teknisi', 'Tag CTSO VIP di group', 'Dialihkan ke PC', 'Dibiarkan sampai pelanggan follow up'], a: 1, e: 'Case teknis dikoordinasikan dengan CTSO VIP melalui tag di group.' },
    { q: 'Batas waktu chat Group VIP belum terbalas sebelum boleh di-take over?', o: ['1 menit', '5 menit', '15 menit', '1 jam'], a: 1, e: 'Maksimal 5 menit; CC Piket atau AM boleh take over.' },
    { q: 'Jika pelanggan VIP menghubungi lewat personal chat…', o: ['Layani di PC saja', 'Arahkan ke Group VIP; bila PC tetap tulis summary di group', 'Abaikan', 'Blokir nomornya'], a: 1, e: 'Komunikasi diarahkan ke Group VIP; PC ke PIC lain wajib diringkas di group.' },
    { q: 'Gaya bahasa di Group VIP adalah…', o: ['Template kaku', 'Casual, human & profesional', 'Bahasa Inggris formal', 'Singkat tanpa salam'], a: 1, e: 'Lebih casual, human, profesional, tanpa template kaku.' },
  ] },
{ id: 'masterlist-vip', cat: 'helpdesk', title: 'Masterlist VIP & Intracity, Reminder Bill 25, Outstanding Bill DIA', src: N('3af9b0fbceac80df82d9ccd40e69e705'),
  summary: 'Sheet referensi tim AM: data group VIP, reminder tagihan tanggal 25, dan outstanding DIA.',
  body: `## Link
- **Masterlist VIP & Intracity Group**: https://docs.google.com/spreadsheets/d/1LRCBD_d1KjX1HQ4cIyAakXVlkPwQTg8mBv7E5QoMBkU/edit?hl=id&gid=0#gid=0
- **Reminder Bill 25 — VIP & Intracity**: https://docs.google.com/spreadsheets/d/19mNgXyeEei_hIwdwS9gfphbzlbPVjdn-/edit?gid=138707526#gid=138707526
- **Outstanding Bills — Dedicated Package (DIA)**: https://docs.google.com/spreadsheets/d/1p2rNp5duqp8zvWIqDWFznzCkv4TUBXY3E2WJEd_J5U0/edit?usp=sharing
## Isi Masterlist
- Tab General / Update / Update 2: nama group, link account data, sub area, sales, MRR & catatan (take-out / keep).
- Tab Intracity: group partner Intracity + group finance-nya.
- Tab Sales Badung: group VIP per sales.
## Update INV VIP tiap tanggal 25
- Per tanggal 25 langsung update INV VIP di sheet **Reminder Bill 25** (link juga ada di deskripsi group).
- Pembagian group per orang ada di materi **"Pembagian Update INV VIP tanggal 25"**.`,
  quiz: [
    { q: 'Tanggal berapa INV VIP wajib di-update?', o: ['Tanggal 1', 'Tanggal 10', 'Tanggal 25', 'Akhir bulan'], a: 2, e: 'Per tanggal 25 update INV VIP di sheet Reminder Bill 25.' },
    { q: 'Data outstanding pelanggan DIA ada di sheet…', o: ['Masterlist VIP', 'Outstanding Bills — Dedicated Package', 'Reminder Bill 25', 'Sheet Monitoring CS'], a: 1, e: 'Outstanding DIA tercatat di Outstanding Bills — Dedicated Package.' },
  ] },
{ id: 'inv-vip-25', cat: 'helpdesk', title: 'Pembagian Update INV VIP tanggal 25', src: '',
  summary: 'Siapa meng-update INV group VIP mana setiap tanggal 25 (otomatis jadi to-do bulanan tim).',
  body: `> "Guys ini aku bagi biar per tanggal 25 langsung update inv VIP di link ini yaa, ada di desc group juga." — Putri
- Sheet: **Reminder Bill 25** — https://docs.google.com/spreadsheets/d/19mNgXyeEei_hIwdwS9gfphbzlbPVjdn-/edit?gid=138707526#gid=138707526
## Account Manager
- **Bagas** — Gilangram Management, Betrand
- **Desi** — Balinest, Red Cubic
- **Sevia** — Canggu Property M, Taman Bali Surga/BVM, Padma
## Helpdesk
- **Sita** — BnB Profits, Saridewi
- **Oka** — Taufik Hidayat
- **Rani** — Mr. Arnaulth, Pepito - Crossfit
> Task ini muncul otomatis setiap bulan di Dashboard Helpdesk / Dashboard AM masing-masing dengan due date tanggal 25.`,
  quiz: [
    { q: 'Siapa yang meng-update INV Padma?', o: ['Desi', 'Sevia', 'Bagas', 'Sita'], a: 1, e: 'Padma dipegang Sevia (bersama Canggu Property M dan Taman Bali Surga/BVM).' },
    { q: 'Group BnB Profits dan Saridewi di-update oleh…', o: ['Sita', 'Rani', 'Oka', 'Desi'], a: 0, e: 'BnB Profits dan Saridewi dipegang Sita.' },
    { q: 'Link sheet untuk update INV juga bisa ditemukan di…', o: ['Deskripsi group', 'Email CSO', 'GX One', 'Notion pribadi'], a: 0, e: 'Link Reminder Bill 25 juga ada di deskripsi group.' },
  ] },
{ id: 'tools-akses', cat: 'helpdesk', title: 'Tools & Access', src: '',
  summary: 'Tools used by Helpdesk, Account Manager & TMRW Labs. Passwords are not listed here — open them in Dashboard Helpdesk / AM (Tools & Access).',
  body: `> Passwords are **not** shown in the Knowledge Base (this page is public). Open **Tools & Access** in Dashboard Helpdesk / Dashboard AM, or ask your SPV.
## Helpdesk
- **Qiscus Helpdesk** — https://omnichannel.qiscus.com/web/welcome/coani-jj7bz2y9lonj4ky/login (account: helpdesk2@dps.globalxtreme.net)
- **CSO Bali email** — cso.bali@globalxtreme.net
- **CSO email** — cso@globalxtreme.net
- **GX Connect public tickets** — https://gxcsconnect.globalxtreme-solutions.net/public/tickets
- **GX Connect** — https://gxcsconnect.globalxtreme-solutions.net/login
## VIP
- **VIP Masterlist** — https://docs.google.com/spreadsheets/d/1LRCBD_d1KjX1HQ4cIyAakXVlkPwQTg8mBv7E5QoMBkU/edit?hl=id&gid=0#gid=0
- **VIP Bill Reminder (25th)** — https://docs.google.com/spreadsheets/d/19mNgXyeEei_hIwdwS9gfphbzlbPVjdn-/edit?gid=138707526#gid=138707526
- **DIA Outstanding Bills** — https://docs.google.com/spreadsheets/d/1p2rNp5duqp8zvWIqDWFznzCkv4TUBXY3E2WJEd_J5U0/edit?usp=sharing
- **Survey UID** — globalxtremG39A
- **Pak Ferre Project Overview** — https://docs.google.com/spreadsheets/d/1kZod_oNU-eYa9vE6jXV2g0KvAJTbmPdCQyDM0cvFQdc/edit?gid=290041170#gid=290041170
## TMRW Labs
- **TMRW Labs Flow** — https://tmrwlabsonboarding.figma.site/
- **Gorgias** — https://tmrwlabs.gorgias.com/app (Continue with Gmail cso@globalxtreme.net — live chat for existing customers & email only)
- **TMRW Labs Dashboard** — https://dashboard.tmrwlabs.io/login (account: support@tmrwlabs.io)
- **TMRW Labs CRM** — https://app.notion.com/p/CRM-1c15deef9c358156a03fe4457d1f32dd`,
  quiz: [
    { q: 'UID yang dipakai untuk membuka WO survey adalah…', o: ['globalxtremG39A', 'helpdesk2', 'cso.bali', 'support'], a: 0, e: 'Survey UID: globalxtremG39A.' },
    { q: 'Gorgias TMRW Labs dipakai untuk…', o: ['Semua customer GX', 'Live chat existing customer & email TMRW Labs', 'Billing DIA', 'Monitoring VIP'], a: 1, e: 'Gorgias hanya untuk live chat existing customer & email TMRW Labs.' },
  ] },
{ id: 'observation-hd-am', cat: 'helpdesk', title: 'Observation Helpdesk & Account Manager', src: N('3a49b0fbceac8083a04ad730f467cb52'),
  summary: 'Link penilaian observation dan kualifikasi observasi Helpdesk.',
  body: `## Link
- **Penilaian Observation (Observation Audit Helpdesk Responses)**: https://docs.google.com/spreadsheets/d/1QdHBsPjKp_2Ma_9ZmKvl_CIRajAccSKI923Ep9R3FAU/edit?gid=1289126939#gid=1289126939
- **Kualifikasi Observasi Helpdesk**: https://digest-role-07712888.figma.site/
- Detail observation per orang juga bisa dicek di **CSO Workspace**: https://cso-workspace.vercel.app
> Observation dinilai 2 kasus per bulan dan menyumbang 30% skor Best Employee.`,
  quiz: [
    { q: 'Observation menyumbang berapa persen skor Best Employee?', o: ['20%', '30%', '50%', '10%'], a: 1, e: 'Bobot Observation = 30% (Productivity 50%, Attendance 20%).' },
    { q: 'Berapa kasus yang diobservasi per bulan?', o: ['1', '2', '5', '10'], a: 1, e: 'Observation dinilai dari 2 kasus per bulan.' },
  ] },
];
/* ============================ ADMINISTRASI ============================ */
window.KB_MATERI.push(
{ id: 'billing-payment', cat: 'admin', title: 'Billing & Payment System', src: N('1d59b0fbceac80d3993ac473f3965ded'),
  summary: 'Sistem prepaid, siklus tagihan, diskon periode, dan channel pembayaran resmi.',
  body: `## Sistem tagihan
- GlobalXtreme memakai **prepaid system** — layanan dibayar di muka.
- **Monthly**: tagihan dikirim tanggal **25**, jatuh tempo tanggal **1** bulan berikutnya.
- Belum bayar → pemblokiran bertahap tanggal **2–15** (info internal). **DIA / Intracity tidak diblokir.**
- **Quarterly / Semester / Annual**: berbasis anniversary, tagihan dikirim **1 bulan sebelum** periode berakhir.
- Reminder email H-2 & H-1 sebelum jatuh tempo; aktivasi kembali maks. **1x24 jam** setelah bayar.
## Diskon periode
- Semester **10%**, Annual **20%**.
## Channel pembayaran
- **MyGX** (app / https://customer.globalxtreme.net/login) & web portal — VA Mandiri, VA BCA, Xendit (settlement T+3).
- **Virtual Account** BCA / Mandiri (nomor VA di invoice).
- **Rekening perusahaan BCA** khusus instalasi baru.
- **Tunai** di kantor: Kerobokan No. 388X Bali; Jl. Rinjani 22 Malang.`,
  quiz: [
    { q: 'Tagihan monthly dikirim tanggal berapa?', o: ['1', '15', '25', '30'], a: 2, e: 'Tagihan monthly dikirim tanggal 25 dan jatuh tempo tanggal 1.' },
    { q: 'Diskon untuk pembayaran annual adalah…', o: ['5%', '10%', '15%', '20%'], a: 3, e: 'Semester 10%, Annual 20%.' },
    { q: 'Pelanggan mana yang tidak terkena pemblokiran bertahap?', o: ['Residential', 'DIA / Intracity', 'Pelanggan baru', 'Pelanggan Malang'], a: 1, e: 'Pemblokiran tidak berlaku untuk DIA / Intracity.' },
  ] },
{ id: 'panduan-pembayaran', cat: 'admin', title: 'Panduan Pembayaran (Tokopedia, Wise, Indomaret, Transfer Bank)', src: N('3a39b0fbceac8045b914cf86a7023f90'),
  summary: 'Langkah bayar tagihan lewat channel non-VA yang sering ditanyakan pelanggan.',
  body: `## Tokopedia
1. Menu **Top Up & Tagihan → Internet & TV Kabel → GlobalXtreme**.
2. Masukkan **User ID GlobalXtreme**, cek nama & nominal, pilih metode bayar, klik **Bayar**.
## Wise (transfer internasional)
1. **Kirim → Transfer bank → Transfer internasional**.
2. Bank **Mandiri (Rekening Virtual)**, SWIFT/BIC **BMRIIDJA**, nama & nomor rekening sesuai **VA di invoice**.
> Wise butuh sekitar 3–5 hari kerja — bisa jadi justifikasi perpanjangan grace.
## Indomaret (via MyGX)
1. Login MyGX → **Billing & Service** → Service Location → **Pay → Pay Now**.
2. **Other Payment → Retail Outlet (Indomaret)** → tunjukkan kode bayar ke kasir.
## Transfer antar bank ke VA Mandiri
- **Permata**: Transfer → Bank Mandiri → nomor VA → metode **Online**.
- **BNI**: Transfer → Antarbank → **Realtime Online** (**jangan BI-FAST**, bisa gagal).
- **BRI (BRImo)**: Transfer → Bank Mandiri → nomor VA → **Transfer Online**.
## Catatan untuk pelanggan
- Simpan bukti bayar sampai status di MyGX **Lunas**.
- Sudah bayar tapi belum aktif → tunggu sinkronisasi atau hubungi CS dengan bukti bayar.`,
  quiz: [
    { q: 'Transfer dari BNI ke VA Mandiri harus memakai metode…', o: ['BI-FAST', 'Realtime Online', 'SKN', 'RTGS'], a: 1, e: 'Gunakan Realtime Online, bukan BI-FAST, karena pembayaran bisa gagal.' },
    { q: 'SWIFT/BIC tujuan saat bayar lewat Wise adalah…', o: ['CENAIDJA', 'BMRIIDJA', 'BNINIDJA', 'BRINIDJA'], a: 1, e: 'Wise ke VA Mandiri memakai SWIFT/BIC BMRIIDJA.' },
    { q: 'Bayar di Indomaret dimulai dari…', o: ['Kasir langsung tanpa kode', 'MyGX → Other Payment → Retail Outlet', 'Tokopedia', 'Email billing'], a: 1, e: 'Kode bayar Indomaret dibuat dari MyGX (Other Payment → Retail Outlet).' },
  ] },
{ id: 'sop-grace', cat: 'admin', title: 'SOP Grace Period & Billing Bypass', src: N('30c9b0fbceac80c48214eee55919842a'),
  summary: 'Kapan grace boleh diberikan, durasinya, dan template edukasi untuk pelanggan yang minta booking grace.',
  body: `## Ketentuan
- Grace **hanya** untuk akun berstatus **Blocked**, memakai fitur **Billing Bypass**.
- Durasi standar **2 x 24 jam (48 jam)**.
- Pengecualian: pembayaran via metode lambat seperti **Wise (3–5 hari kerja)** → durasi bisa disesuaikan dengan justifikasi.
## Aturan tambahan
1. Grace / perubahan billing maksimal **1 kali dalam 1 bulan**.
2. Lebih dari 1 kali di bulan yang sama → wajib **persetujuan SPV**.
3. Sistem otomatis menolak pengajuan berulang berdekatan (potensi fraud).
4. Edukasi pelanggan untuk bayar tepat waktu.
5. **Tidak boleh booking grace saat internet masih aktif** — pengaktifan hanya bila sudah tertangguhkan otomatis karena tagihan (bisa di hari yang sama).
## Template edukasi (Group VIP)
- ID: "Halo Kak, mohon maaf, saat ini sistem belum dapat memproses perpanjangan hingga {{tanggal}} selama status internet masih aktif. Apabila terdapat kendala pada layanan, silakan hubungi kami agar dapat kami bantu pengecekan dan pengaktifannya. Kami juga menunggu konfirmasi pembayarannya agar layanan tetap berjalan lancar. Terima kasih atas pengertiannya 🙏"
- EN: "Hello, we're sorry, the system is currently unable to process your extension request until {{date}} while the internet status is still active. If you experience any service issues, please contact us so we can assist with checking and reactivation. Kindly confirm your payment to ensure the service continues smoothly. Thank you for your understanding 🙏"`,
  quiz: [
    { q: 'Durasi standar grace period adalah…', o: ['24 jam', '48 jam', '72 jam', '7 hari'], a: 1, e: 'Grace standar 2 x 24 jam (48 jam).' },
    { q: 'Pelanggan minta booking grace padahal internetnya masih aktif. Apa yang dilakukan?', o: ['Langsung bypass', 'Informasikan sistem belum bisa memproses selama internet aktif', 'Minta approval SPV', 'Buat ticket ke billing'], a: 1, e: 'Grace tidak boleh di-booking saat internet masih aktif; gunakan template edukasi.' },
    { q: 'Grace kedua di bulan yang sama membutuhkan…', o: ['Tidak boleh sama sekali', 'Persetujuan SPV', 'Bukti transfer', 'Email ke accounting'], a: 1, e: 'Lebih dari 1 kali sebulan wajib persetujuan SPV.' },
  ] },
{ id: 'kelengkapan-administrasi', cat: 'admin', title: 'Kelengkapan Administrasi (Inactive, Terminasi, Refund, Ganti Paket, dll)', src: N('1d59b0fbceac80d3993ac473f3965ded'),
  summary: 'Syarat & alur request administrasi pelanggan yang paling sering masuk.',
  body: `## Inactive Temporary
- Biaya **Rp100.000/bulan** (Intracity free), durasi **1–3 bulan**.
- Form **PandaDoc + KTP**; request diajukan tanggal **30/31** via ticket GX-One.
- ONU diambil; bila ONU tidak dikembalikan dikenakan kompensasi Rp333.000.
## Terminasi
- Minimal berlangganan **1 tahun** dan seluruh tagihan lunas; jadwalkan **dismantle** terlebih dulu.
## Refund
- Proses **1–2 minggu**, request lewat email ke billing + accounting.
## Change Package
- **Upgrade** bisa kapan saja (prorata). **Downgrade** hanya tanggal **1** atau saat renewal.
- Cek spesifikasi router pelanggan sebelum upgrade.
## Change Billing Period & Ownership
- Ganti periode billing saat **renewal**.
- Change Ownership biaya **Rp100.000**, request via email lalu ticket.
## Reactivation & Pemindahan Dana
- Detail reaktivasi ada di materi **Reactivation Account**.
- Pemindahan dana: email + ticket ke Billing Helpdesk.`,
  quiz: [
    { q: 'Biaya Inactive Temporary per bulan (non-Intracity) adalah…', o: ['Gratis', 'Rp50.000', 'Rp100.000', 'Rp333.000'], a: 2, e: 'Inactive Rp100.000/bulan, maksimal 3 bulan; Intracity free.' },
    { q: 'Kapan downgrade paket boleh dilakukan?', o: ['Kapan saja', 'Tanggal 1 atau saat renewal', 'Tanggal 25', 'Hanya akhir tahun'], a: 1, e: 'Downgrade hanya tanggal 1 atau saat renewal; upgrade bisa kapan saja.' },
    { q: 'Syarat terminasi adalah…', o: ['Minimal 6 bulan', 'Minimal 1 tahun & tagihan lunas', 'Cukup email', 'Bayar Rp100.000'], a: 1, e: 'Terminasi minimal 1 tahun berlangganan dan semua tagihan lunas.' },
  ] },
{ id: 'reactivation', cat: 'admin', title: 'Reactivation Account', src: N('30c9b0fbceac80b8a407ef6ef2060ce2'),
  summary: 'Aturan aktivasi kembali akun Inactive, Blocked, dan Terminasi beserta program retention.',
  body: `## Status akun
- **Inactive** (permintaan pelanggan, maks. 3 bulan) → terhitung reaktivasi.
- **Blocked < 1 bulan** → tidak terhitung reaktivasi.
- **Blocked > 1 bulan** → terhitung reaktivasi.
- **Terminasi dini** (tidak bayar 3 bulan berturut-turut / by request) → harus **pasang baru lewat Sales**.
## A. Inactive
- Lunasi biaya Inactive (Rp100.000/bulan) + **prorata bulan berjalan**.
- Prorata = Harga Paket ÷ jumlah hari dalam bulan × jumlah hari pemakaian.
- Setelah bayar → ticket GX-One ke Billing Helpdesk → aktif maks. **1x24 jam**.
## B. Blocked < 1 bulan
- Wajib lunas penuh, tidak ada penghapusan piutang, aktif otomatis maks. 1x24 jam.
## C. Blocked > 1 bulan
- Opsi 1: lunasi seluruh tunggakan.
- Opsi 2: **Program Retention** — bayar 3 / 6 / 12 bulan; piutang internet sebelumnya bisa dihapus, billing direset dari tanggal reaktivasi. Tidak berlaku untuk tunggakan perangkat.
## Prosedur internal sebelum reaktivasi
1. Cek histori pembongkaran.
2. Cek status ONU — WD / Power Off / Power Issue → jadwalkan teknisi (**free visit**).
3. ONU sudah dibongkar → jadwalkan teknisi (free visit).
4. Ajukan reaktivasi via GX-One ke Billing Helpdesk & pantau progres.
5. Informasikan pelanggan + kirim tagihan tertunggak; buat ticket report lengkap.
## Eskalasi khusus
- Hard complaint / kendala finansial / permintaan di luar kebijakan → kirim ke SPV: data akun, detail kendala, langkah yang sudah dilakukan, saran solusi. **Tunggu approval** sebelum memberi keputusan.`,
  quiz: [
    { q: 'Akun Blocked kurang dari 1 bulan…', o: ['Masuk program retention', 'Wajib lunas penuh, tidak terhitung reaktivasi', 'Harus pasang baru', 'Gratis aktif kembali'], a: 1, e: 'Blocked < 1 bulan wajib lunas penuh dan tidak masuk program retention.' },
    { q: 'Keuntungan Program Retention untuk Blocked > 1 bulan adalah…', o: ['Gratis 3 bulan', 'Piutang internet sebelumnya bisa dihapus', 'Diskon perangkat', 'Upgrade gratis'], a: 1, e: 'Piutang internet sebelumnya dapat dihapus dan billing direset (bukan tunggakan perangkat).' },
    { q: 'Pelanggan terminasi dini ingin aktif lagi. Caranya…', o: ['Reaktivasi via ticket', 'Pasang baru lewat Sales', 'Bayar prorata', 'Grace 48 jam'], a: 1, e: 'Terminasi tidak terhitung reaktivasi → harus pasang baru oleh Sales.' },
    { q: 'Sebelum reaktivasi, ONU pelanggan terdeteksi Power Off. Tindakannya…', o: ['Tolak reaktivasi', 'Jadwalkan teknisi (free visit)', 'Charge kunjungan Rp100.000', 'Abaikan'], a: 1, e: 'ONU WD/Power Off/Power Issue → jadwalkan teknisi dengan free visit.' },
  ] },
{ id: 'faktur-pajak', cat: 'admin', title: 'Permintaan Faktur Pajak & PPh 23', src: N('30c9b0fbceac809299c2fb1215ba945b'),
  summary: 'Dokumen, alur internal, dan perhitungan PPh 23 2% / PPN 11% untuk request faktur pajak.',
  body: `## Persyaratan dokumen
- Formulir Permintaan Faktur Pajak (**PandaDoc**) yang sudah ditandatangani.
- Salinan **KTP** pemilik akun dan **NPWP aktif** (personal maupun perusahaan).
- Dokumen belum lengkap → request tidak bisa diproses.
## Wajib ditanyakan CSO
> "Apakah pelanggan akan melakukan pelaporan atau pemotongan PPh 23 sebesar 2%?"
- **Ya** → catat di sistem, invoice berikutnya dipotong 2%, pelaporan langsung oleh pelanggan (tercatat otomatis di Coretax, bukti tidak perlu di-email).
- **Tidak** → catat di sistem, invoice dibayar penuh.
## Alur internal
1. Pastikan dokumen lengkap.
2. Kirim email permintaan ke **Billing Helpdesk**.
3. Buat ticket GX-One (subject = salinan subject email) → **Send to Billing Helpdesk**.
4. Billing Helpdesk memproses & verifikasi di Coretax.
5. Informasikan pelanggan dan buat report ticket lengkap.
## Perhitungan (harga dasar Rp1.000.000)
- PPN 11% = Rp110.000; PPh 23 = 2% × harga dasar **sebelum PPN** = Rp20.000.
- Dengan PPh 23: 1.000.000 + 110.000 − 20.000 = **Rp1.090.000**.
- Tanpa PPh 23: **Rp1.110.000**.
## Catatan
- Pelanggan boleh minta pemotongan PPh 23 **tanpa** faktur pajak → cukup ticket ke Billing Helpdesk + capture percakapan, tanpa form & NPWP.`,
  quiz: [
    { q: 'PPh 23 dihitung dari…', o: ['Total setelah PPN', 'Harga dasar sebelum PPN', 'PPN saja', 'Total tahunan'], a: 1, e: 'PPh 23 = 2% dari harga dasar sebelum PPN.' },
    { q: 'Harga dasar Rp1.000.000, pelanggan memotong PPh 23. Total bayar…', o: ['Rp1.110.000', 'Rp1.090.000', 'Rp1.000.000', 'Rp980.000'], a: 1, e: '1.000.000 + 110.000 − 20.000 = Rp1.090.000.' },
    { q: 'Dokumen yang TIDAK diperlukan untuk faktur pajak adalah…', o: ['Form PandaDoc', 'KTP', 'NPWP aktif', 'Foto ONU'], a: 3, e: 'Syaratnya form PandaDoc, KTP, dan NPWP aktif.' },
  ] },
{ id: 'proforma-invoice', cat: 'admin', title: 'Proforma & Invoice', src: N('1d59b0fbceac80d3993ac473f3965ded'),
  summary: 'Beda proforma dan invoice, masa berlaku, dan alur ticket-nya.',
  body: `## Definisi
- **Proforma** = penawaran / quotation sebelum tagihan resmi. Proforma hardware berlaku **1 minggu**.
- **Invoice** = tagihan resmi; jatuh tempo **7 hari** setelah terbit, lewat itu layanan auto-disconnect.
## Alur
1. Request lewat ticket **GX-One** ke Billing Helpdesk.
2. Nomor ticket proforma diinfokan di **group CSO**.
3. Pelanggan approve proforma → invoice terbit → pelanggan bayar → pekerjaan dijadwalkan.`,
  quiz: [
    { q: 'Masa berlaku proforma hardware adalah…', o: ['1 hari', '1 minggu', '1 bulan', 'Tidak ada batas'], a: 1, e: 'Proforma hardware berlaku 1 minggu.' },
    { q: 'Invoice jatuh tempo berapa hari setelah terbit?', o: ['3', '7', '14', '30'], a: 1, e: 'Invoice jatuh tempo 7 hari setelah terbit.' },
  ] },
{ id: 'changing-customer-data', cat: 'admin', title: 'Changing Customer Data', src: N('1d59b0fbceac80d3993ac473f3965ded'),
  summary: 'Alur perubahan data pelanggan lewat PandaDoc + ticket ke Billing Helpdesk.',
  body: `## Alur
1. Pelanggan mengisi form **PandaDoc**.
2. CSO membuat ticket GX-One, lampirkan dokumen, tulis deskripsi detail.
3. **Send to Billing Helpdesk**. Status di Billing Helpdesk: In Progress → **Send to CSO** setelah selesai.
4. Nomor ticket proforma (bila ada) dikirim ke group CSO.
> Google Form **sudah tidak dipakai**.
## Masih via email
- Trial, refund, dan stop layanan TV.`,
  quiz: [
    { q: 'Perubahan data pelanggan sekarang diajukan lewat…', o: ['Google Form', 'PandaDoc + ticket GX-One', 'Chat WA', 'Telepon'], a: 1, e: 'Google Form tidak dipakai lagi; gunakan PandaDoc + ticket.' },
    { q: 'Request mana yang masih lewat email?', o: ['Change ownership', 'Trial, refund & stop TV', 'Upgrade paket', 'Ganti alamat'], a: 1, e: 'Trial, refund, dan stop TV masih diproses via email.' },
  ] },
{ id: 'upgrade-vip', cat: 'admin', title: 'Upgrade Package (Group VIP)', src: N('2e19b0fbceac80b08319e9127732ad6a'),
  summary: 'Alur klaim upgrade package dari Group VIP.',
  body: `- Upgrade package dari tim handling Group VIP **wajib dilempar ke Team CSO** via chat ke **0361-736811**.
- Penanganan **random** — CSO yang menerima chat bertanggung jawab membantu proses upgrade.
- Upgrade dari **Team Leader** (khususnya Group VIP) wajib dilempar ke chat CSO; **TL tidak boleh memproses langsung**.
- Bila tim Helpdesk Group VIP / PIC tidak in charge dan dibantu **CSO piket**, CSO piket boleh memproses upgrade.
> Lihat juga Flow Account Manager poin Upgrade Package (form dilengkapi AM lalu di-share ke WA Primary).`,
  quiz: [
    { q: 'Upgrade package dari Group VIP dilempar ke nomor…', o: ['361-736-822', '0361-736811', 'Nomor pribadi AM', 'Email billing'], a: 1, e: 'Dilempar ke chat CSO di 0361-736811.' },
    { q: 'Bolehkah Team Leader memproses upgrade package langsung?', o: ['Boleh', 'Tidak, wajib dilempar ke chat CSO', 'Boleh jika VIP', 'Hanya akhir bulan'], a: 1, e: 'TL tidak diperkenankan memproses upgrade secara langsung.' },
  ] },
{ id: 'maintenance-fee', cat: 'admin', title: 'Maintenance Fee (Price List Jasa & Instalasi Kabel)', src: N('3fe9b0fbceac809e9fd6f0b181028d59'),
  summary: 'Daftar harga jasa maintenance regular case dan instalasi kabel LAN/FO (exclude PPN, garansi 1 bulan).',
  body: `> Semua harga **exclude PPN**, garansi **1 bulan**.
## Jasa setting / troubleshooting (per node/titik)
- Dedicated Router Standard Setup (NAT, DHCP, firewall) — **Rp300.000**
- Dedicated Router Full Setup (QoS, hotspot, VPN, load balance, VLAN) — **Rp1.000.000**
- Wireless Router Setup — Rp150.000 (free bila alat beli di GX)
- Access Point Setting — Rp150.000 (free bila alat beli di GX)
- Unmanaged Switch — Rp100.000; Managed Switch — Rp200.000
- Extender / Repeater / Mesh — Rp150.000 (free bila alat beli di GX)
- CCTV Online (setting only) — Rp150.000; IoT / Smart Home online — Rp150.000
- LAN Mapping — Rp100.000; Cable Organization — Rp100.000; Cable Tracing & Repairing — Rp100.000
- Problem solving connection issue di sisi customer — **Rp100.000/visit**
- Ganti SSID & password WiFi (visit on site) — Rp100.000
- Application issue consulting — Rp150.000/case
- Network Improvement Consulting (survey) — Rumah/Villa Rp100.000, Resto/Bar/Office Rp150.000, Hotel/Kompleks Villa Rp300.000; **biaya survey dikembalikan bila penawaran disetujui**.
## Instalasi kabel
- Kabel < 1 m dari ONU: **free** untuk new customer & customer priority; existing customer **Rp100.000/titik**.
- Tanpa conduit jalur normal Rp5.000/m; masuk plafon / medan sulit Rp15.000/m.
- Ducting / TC cable Rp5.000/m; PVC conduit normal Rp5.000/m; PVC conduit plafon/sulit Rp15.000/m.
- Galian tanah normal Rp25.000/m; galian paving/cor + penutupan Rp75.000/m.
- Wall chaser / bobokan (tanpa plester) Rp15.000/m.
- Terminasi ke patch panel / wall plate Rp50.000/titik.
- FO OTB terminating Rp50.000/core; FO splicing Rp50.000/core.
- Aksesoris gratis: klem, cable ties, RJ45 curah, isolasi, double tape, label. RJ45 premium & material dihitung terpisah.`,
  quiz: [
    { q: 'Biaya problem solving koneksi di sisi customer adalah…', o: ['Gratis', 'Rp100.000/visit', 'Rp300.000', 'Rp1.000.000'], a: 1, e: 'Problem Solving Connection Issue (customer side) Rp100.000/visit.' },
    { q: 'Pemasangan kabel < 1 m dari ONU untuk pelanggan baru…', o: ['Rp100.000', 'Rp5.000/m', 'Free', 'Rp50.000'], a: 2, e: 'Free untuk new customer & customer priority; existing customer Rp100.000.' },
    { q: 'Biaya survey Network Improvement Consulting dikembalikan jika…', o: ['Pelanggan VIP', 'Pelanggan menyetujui penawaran', 'Survey < 1 jam', 'Tidak pernah'], a: 1, e: 'Jika solusi/penawaran disetujui, biaya survey dikembalikan.' },
  ] },
);
window.KB_MATERI.push(
{ id: 'flow-handling', cat: 'umum', title: 'Flow Handling Customer (Chat, Phone, Walk-in)', src: N('2769b0fbceac8069add1de78ace568b1'),
  summary: '9 tahap wajib/kondisional saat handling customer, plus opsi informasi sebelum menekan Resolved.',
  body: `## 9 tahap handling
1. **Salam & Verifikasi** (wajib) — minta Service Location ID / nomor pelanggan.
2. **Empati singkat** (wajib).
3. **Probing inti & ringkas ulang** (wajib) — sejak kapan, status lampu PON/LOS/Internet, tes 1 perangkat via LAN, speedtest; untuk billing: periode, tanggal & metode bayar terakhir, perubahan paket.
4. **Quick fix** (wajib) — refresh sesi dari sistem + minta reboot ONU & router ±30 detik; untuk billing kirim rincian tagihan.
5. Eskalasi / penugasan teknis (kondisional) — local network: **self-repair dipandu technical support (gratis)** atau **kunjungan teknisi (berbayar Rp100.000/visit)**.
6. **Set ekspektasi & dokumentasi** (wajib) — sebutkan **nomor tiket** & kanal update.
7. Edukasi singkat (opsional) — 5 GHz untuk jarak dekat, 2.4 GHz untuk jangkauan; cek folder Spam untuk email tagihan.
8. **Closing & konfirmasi kebutuhan** (wajib).
9. **Informasi pra-Resolved** (wajib, pilih satu).
> Contoh kalimat di Notion **bukan template untuk copas** — sesuaikan dengan case.
## Opsi sebelum Resolved
- **A. No Response** — sampaikan percakapan diakhiri karena keterbatasan sistem + closing promo.
- **B. Masalah selesai** — ucapan terima kasih + closing promo.
- **C. Complaint** — **closing promo wajib**: diskon 10% (6 bulan) & 20% (12 bulan).
- **D. Non-complaint** — upsell ringan: upgrade premium, gratis router, diskon hingga 20%.`,
  quiz: [
    { q: 'Tahap mana yang bersifat kondisional (tidak selalu wajib)?', o: ['Salam & verifikasi', 'Eskalasi / penugasan teknis', 'Set ekspektasi & dokumentasi', 'Closing & konfirmasi'], a: 1, e: 'Eskalasi hanya dilakukan bila layanan belum pulih setelah quick fix.' },
    { q: 'Biaya kunjungan teknisi untuk masalah local network adalah…', o: ['Gratis', 'Rp50.000', 'Rp100.000 per kunjungan', 'Rp300.000'], a: 2, e: 'Opsi 2 kunjungan teknisi dijadwalkan dan berbayar Rp100.000/visit; self-repair gratis.' },
    { q: 'Untuk case complaint, closing promo…', o: ['Opsional', 'Wajib', 'Dilarang', 'Hanya untuk VIP'], a: 1, e: 'Complaint — closing promo wajib.' },
    { q: 'Di tahap Set Ekspektasi, apa yang wajib disampaikan?', o: ['Nama teknisi', 'Nomor tiket', 'Password WiFi', 'Nomor rekening'], a: 1, e: 'Dokumentasi wajib dengan nomor tiket.' },
  ] },
{ id: 'greeting-closing', cat: 'umum', title: 'Template Greeting & SOP Closing Chat (CSAT)', src: N('1e69b0fbceac80f7810bc0bdb47695e7'),
  summary: 'Struktur greeting, aturan kapan chat boleh di-close, dan template closing CSAT wajib (mulai 15 Oktober 2026).',
  body: `## SOP closing chat
- Chat menunggu konfirmasi boleh di-close **minimal 1 jam** setelah chat masuk / terakhir dibalas.
- Case sudah selesai → boleh langsung close tanpa menunggu 1 jam.
- Batas maksimal closing: **akhir shift** — semua chat harus ter-close sebelum shift berakhir.
- Klasifikasikan chat secara mandiri; jangan close terlalu cepat bila case belum jelas.
## Greeting (panduan, boleh disesuaikan)
- **Tanpa User ID**: sapa nama, minta maaf atas ketidaknyamanan, minta Service Location ID / nomor pelanggan, tutup dengan "[Nama CSO] – GlobalXtreme".
- **Dengan User ID**: terima kasih atas detailnya, minta maaf, sampaikan akan lanjut pengecekan.
- **Umum**: "Senang bisa terhubung dengan Anda hari ini 😊 Ada informasi atau bantuan yang bisa kami berikan hari ini?"
## Closing CSAT — WAJIB (update 15 Oktober 2026)
> Satu-satunya template closing, dikirim dalam **1 bubble chat**.
- ID: "Terima kasih sudah menghubungi GlobalXtreme 😊 Kami harap layanan kami hari ini membantu Anda. Mohon kesediaannya mengisi survei singkat berikut (±1 menit): https://bit.ly/4xajHIt"
- EN: "Thank you for contacting GlobalXtreme 😊 We hope our service was helpful today. Please help us by completing this short survey (±1 minute): https://bit.ly/4xajHIt"`,
  quiz: [
    { q: 'Waktu minimum sebelum chat yang menunggu konfirmasi boleh di-close?', o: ['15 menit', '30 menit', '1 jam', '3 jam'], a: 2, e: 'Minimal 1 jam setelah chat masuk atau terakhir dibalas.' },
    { q: 'Sejak 15 Oktober 2026, template closing yang dipakai adalah…', o: ['Closing promo saja', 'Closing CSAT dalam 1 bubble chat', 'Bebas', 'Tanpa closing'], a: 1, e: 'Closing CSAT menjadi satu-satunya template closing, dikirim dalam 1 bubble.' },
    { q: 'Batas maksimal menahan chat yang menunggu konfirmasi adalah…', o: ['Besok pagi', 'Akhir shift', '24 jam', 'Tidak ada batas'], a: 1, e: 'Chat paling lambat di-close saat shift berakhir.' },
  ] },
{ id: 'cs-language', cat: 'umum', title: 'Customer Service Language & NATO Phonetic Alphabet', src: N('18c9b0fbceac814a877dd168beed6649'),
  summary: 'Padanan istilah yang lebih profesional untuk pelanggan, dan ejaan fonetik untuk telepon.',
  body: `## Istilah CS
- Kerusakan → **Gangguan Teknis**; Kesalahan → **Error / Gangguan**
- Lapor → **Ajukan Tiket**; Umpan balik → **Feedback**; Cek ulang → **Revisi / Validasi Ulang**
- Jawab → **Respon**; Menghubungi kembali → **Follow-up**; Penyelesaian → **Solusi**
- Pemberitahuan → **Notifikasi**; Bukti pembayaran → **Konfirmasi Pembayaran**
- Terminasi → **Penutupan Akun (Account Closure)**; Inaktif → **Penangguhan Sementara**
- Blokir → **Suspensi (Suspension of Service)**; Biaya tambahan → **Charge / Fee**; Pindahkan data → **Migrasi Data**
## NATO Phonetic Alphabet (dipakai saat mengeja UID/email via telepon)
- A Alpha · B Bravo · C Charlie · D Delta · E Echo · F Foxtrot · G Golf · H Hotel · I India
- J Juliet · K Kilo · L Lima · M Mike · N November · O Oscar · P Papa · Q Quebec · R Romeo
- S Sierra · T Tango · U Uniform · V Victor · W Whiskey · X X-ray · Y Yankee · Z Zulu`,
  quiz: [
    { q: 'Istilah CS yang tepat untuk "blokir" adalah…', o: ['Terminasi', 'Suspensi / Penangguhan', 'Migrasi', 'Inaktif'], a: 1, e: 'Blokir = Suspensi (Suspension of Service).' },
    { q: 'Huruf "Q" dalam NATO phonetic adalah…', o: ['Queen', 'Quebec', 'Quarter', 'Quick'], a: 1, e: 'Q = Quebec (keh-BECK).' },
    { q: '"Terminasi" disampaikan ke pelanggan sebagai…', o: ['Penangguhan Sementara', 'Penutupan Akun', 'Suspensi', 'Feedback'], a: 1, e: 'Terminasi = Closing / Penutupan Akun (Account Closure).' },
  ] },
{ id: 'service-channels', cat: 'umum', title: 'Service Channels & Jobdesk CS / CC / Piket / Shift 3', src: N('35f9b0fbceac80c5a193cbc05f6c149a'),
  summary: 'Pembagian kanal layanan dan jobdesk tiap peran di divisi Customer Service.',
  body: `## Customer Service (CS)
- Walk-in customer, Omnichannel (Qiscus), Email.
## Contact Center (CC)
- Phone call, Omnichannel (Qiscus).
## Piket CC (pagi & siang, 1 orang per pos)
1. **Backup Helpdesk & Account Manager** — login Maxchat Helpdesk, bantu kebutuhan Helpdesk & AM.
2. **MyGX & Qiscus** — monitoring & handling customer via MyGX & Qiscus.
3. **Tawk.to, PP & Group Ticket Request CTSO** — handling Tawk.to, monitoring List PP & group CTSO.
## Shift 3 (night shift / full backup operasional)
- Mengawal List Wiredown (jobdesk Dispatch Bravo) & mengisi link penjadwalan Maintenance hari berikutnya.
- Monitoring outage GX Network.
- Handling Qiscus, Cust Support, WhatsApp Piket (jobdesk Helpdesk), Maxchat, email, Tawk.to, MyGX, incoming call.
- Serah terima pengawalan saat pergantian shift (Serter) & monitoring List PP.
> Maxchat & Tawk.to sudah ditandai **discontinued** di Notion — ikuti arahan SPV terbaru.`,
  quiz: [
    { q: 'Kanal yang ditangani CS (bukan CC) adalah…', o: ['Phone call', 'Walk-in, Qiscus & Email', 'Hanya telepon', 'Group VIP'], a: 1, e: 'CS: walk-in, omnichannel (Qiscus), email. CC: phone & Qiscus.' },
    { q: 'Siapa yang mengawal List Wiredown pada malam hari?', o: ['Helpdesk', 'Shift 3', 'Piket pagi', 'Account Manager'], a: 1, e: 'Shift 3 mengawal List Wiredown (jobdesk Dispatch Bravo).' },
  ] },
{ id: 'aturan-lobby', cat: 'umum', title: 'Aturan Area Lobby & Grooming CSO', src: N('2339b0fbceac80439a14c154c1637d58'),
  summary: 'Larangan saat incharge di lobby Badung/Denpasar dan standar grooming divisi.',
  body: `## Larangan di area lobby
- Tidak memakai seragam sebagaimana mestinya (tanpa name tag, rambut acak-acakan, sandal, dll). Baju Anniversary GX hanya hari Minggu dan harus seragam dengan rekan.
- **Makan & minum di lobby** — gunakan cafetaria; simpan makanan di loker.
- Menempel password / data penting dengan sticky notes — budayakan **clean desk**.
- Membiarkan form registrasi / perubahan data / pembayaran berserakan — simpan di laci & serahkan ke admin.
## Penempatan CC di Lobby Badung (Sabtu, Minggu, libur nasional — 1 orang)
- **Senior (> 1 tahun)**: ambil antrian & handling customer sesuai SOP lobby.
- **Junior (< 1 tahun)**: tidak ambil antrian, fokus chat, tetap menyapa, mengamati & mempelajari aturan lobby.
> Pelanggaran dicatat di personal record dan diproses tim HC.
## Grooming
- Kaos kaki menutup mata kaki & senada; flatshoes hanya stocking warna kulit; **tidak boleh sepatu sandal**.
- Baju tidak dimasukkan; tidak memakai masker bila sehat.
- **Wajib deodoran & parfum**, jaga kebersihan mulut.
- Wanita: makeup natural profesional, rambut rapi. Pria: rambut rapi, tidak gondrong, tanpa kumis/jenggot.`,
  quiz: [
    { q: 'CSO junior yang ditempatkan di Lobby Badung saat weekend…', o: ['Mengambil antrian', 'Fokus chat, tidak mengambil antrian', 'Libur', 'Menjadi kasir'], a: 1, e: 'Junior (< 1 tahun) fokus handling chat dan mempelajari aturan lobby.' },
    { q: 'Di mana CSO boleh makan saat bertugas di lobby?', o: ['Meja lobby', 'Cafetaria', 'Ruang tunggu customer', 'Di mana saja'], a: 1, e: 'Makan & minum di cafetaria; lobby adalah image perusahaan.' },
  ] },
{ id: 'follow-up-blokir', cat: 'admin', title: 'Follow Up User Blokir (Retention Harian)', src: N('2819b0fbceac8074972ecce170bfb23d'),
  summary: 'Target follow up 2 UID blokir per hari beserta kriteria dan template pesannya.',
  body: `## SOP
- Setiap CSO **wajib follow up 2 UID per hari** dan **wajib buat tiket** untuk setiap follow up.
## Kriteria UID
- Status **BLOKIR**.
- Umur blokir **maksimal 3 bulan ke belakang** (contoh Oktober → Juli–September).
- **Belum di-follow up dalam 7 hari terakhir**.
## Isi pesan (ID / EN)
- Sapa nama → info **ID, Paket, Alamat** → status nonaktif sementara karena pembayaran periode {Start}–{End} belum diterima.
- Tawarkan perpanjangan **6 bulan (diskon 10%)** atau **12 bulan (diskon 20%)**.
- Minta bukti bayar bila sudah membayar → tanda tangan "[Nama CSO] – GlobalXtreme".`,
  quiz: [
    { q: 'Berapa UID blokir yang wajib di-follow up tiap CSO per hari?', o: ['1', '2', '5', '10'], a: 1, e: 'Wajib follow up 2 UID per hari dan buat tiket.' },
    { q: 'UID blokir sejak 5 bulan lalu…', o: ['Wajib di-follow up', 'Tidak masuk kriteria (maks. 3 bulan)', 'Di-terminasi', 'Diberi grace'], a: 1, e: 'Umur blokir maksimal 3 bulan ke belakang.' },
    { q: 'Penawaran yang disampaikan di pesan follow up blokir adalah…', o: ['Gratis 1 bulan', '6 bulan diskon 10% / 12 bulan diskon 20%', 'Upgrade gratis', 'Potongan PPN'], a: 1, e: 'Perpanjangan 6 bulan (10%) atau 12 bulan (20%).' },
  ] },
{ id: 'e-form', cat: 'admin', title: 'E-Form GX Document (update 2 November 2026)', src: N('2049b0fbceac8043a3e9e8956ac82a17'),
  summary: 'Cara membuat & mengirim form perubahan data lewat GX Document dengan verifikasi OTP email.',
  body: `> Update 2 November 2026: email pelanggan **wajib valid & aktif** (verifikasi **OTP 6 digit**), Settings wajib diatur, pelanggan menyetujui Electronic Signature Disclosure, penulisan wajib rapi.
## A. Membuat form
1. Buka https://docs.globalxtreme.net/ dan login akun GX Document masing-masing (belum punya password → cari email "Your GlobalXtreme Document Manager account" di mail dps).
2. Menu **Template** → pilih dokumen → **Send v1 for signature**.
3. Isi **Document name**, **email (valid)**, **nama pelanggan**, **nomor telepon** → Save.
4. Isi data keperluan pelanggan — data langsung tersimpan dan **tidak bisa diubah pelanggan**.
## Aturan pengisian (wajib)
- **Huruf kapital di awal setiap kata** (Made Budi Santosa), singkatan sesuai aslinya.
- **Kode paket copy-paste dari GXOne**, jangan diketik ulang.
- Cek typo, spasi ganda, dan angka.
## B. Settings & kirim
- **Title**: Nama Form - Account ID; **Remind Every**: 3 Days; **Expires On**: 1 minggu sejak dibuat → **Save settings**.
- Klik **Send for signing** (beda dengan "Send v1 for signature"), copy link, kirim ke pelanggan.
## C. Sisi pelanggan
- Verifikasi OTP 6 digit dari email → **Verify and Continue** → setujui Electronic Signature Disclosure → tanda tangan.
## D. Monitoring
- Pantau progress lewat link dokumen atau langsung di GX Document.`,
  quiz: [
    { q: 'Mengapa email pelanggan wajib valid sejak 2 November 2026?', o: ['Untuk promo', 'Pelanggan verifikasi lewat OTP 6 digit di email', 'Untuk invoice', 'Tidak wajib'], a: 1, e: 'Pelanggan harus memasukkan kode OTP yang dikirim ke email sebelum tanda tangan.' },
    { q: 'Setting "Expires On" form diatur…', o: ['1 hari', '3 hari', '1 minggu sejak dibuat', '1 bulan'], a: 2, e: 'Remind Every 3 Days, Expires On 1 minggu.' },
    { q: 'Kode paket di form harus…', o: ['Diketik manual', 'Copy-paste dari GXOne', 'Ditulis pelanggan', 'Dikosongkan'], a: 1, e: 'Kode paket wajib copy-paste dari GXOne.' },
  ] },
{ id: 'cashier-dcr', cat: 'admin', title: 'Cashier — Daily Cashier Report (DCR)', src: N('2099b0fbceac80fba64edb374fceae74'),
  summary: 'Format laporan kasir harian CSO ke SPV.',
  body: `## Format DCR ke SPV
- Pembuka: "Dear SPV, berikut adalah Total Daily Cashier Report CSO [Nama] ([Tanggal])".
- **GlobalXtreme**: Total Cash, Total Debet/CC.
- **SBN**: Total Cash, Total Debet/CC.
- **Pasang Baru**: Total Cash, Total Debet/CC.
- **Promo Google Review**: daftar UID.
- Flow lengkap: https://globalxtreme.notion.site/Draft-Flow-Daily-Cashier-Report-DCR-6a3155ad60a1476db037088c98084f1f`,
  quiz: [
    { q: 'Kategori apa saja yang dilaporkan di DCR?', o: ['GlobalXtreme, SBN, Pasang Baru, Promo Google Review', 'Hanya GlobalXtreme', 'VIP & DIA', 'Refund saja'], a: 0, e: 'DCR memuat GlobalXtreme, SBN, Pasang Baru (cash & debet/CC) dan UID Promo Google Review.' },
  ] },
/* ============================ TEKNIS ============================ */
{ id: 'slot-lan', cat: 'teknis', title: 'Prosedur Booking Slot LAN', src: N('23f9b0fbceac8048971afc88eedd0d9c'),
  summary: 'Cara booking slot pekerjaan LAN lewat SPV Teknisi Maintenance (berlaku sejak 24 Juli 2025).',
  body: `- Link Slot LAN: https://globalxtreme.notion.site/SLOT-LAN-03ab3c7cee064978a5e768aa4bdf62a6
## Perubahan
- Sebelumnya: konfirmasi ke CTSO via personal chat.
- Sekarang: **booking melalui SPV Teknisi Maintenance (Nur & Galang)**.
## Prosedur
1. Booking di grup **WAG KOORDINASI CSO–CTSO–MNT** dengan **tag SPV Teknisi**.
2. Cantumkan **UserID pelanggan** dan **keterangan jadwal**.
3. Pastikan request sudah **di-reply / di-reaction SPV**. Booking boleh dilakukan sambil menunggu pembayaran.
4. Setelah pembayaran selesai, **update SPV dengan nomor tiket jadwal**.
5. Bila sudah bayar saat booking, cukup lampirkan nomor tiket jadwal LAN + tag SPV Teknisi.
> Saran/masukan prosedur → hubungi Andry.`,
  quiz: [
    { q: 'Booking slot LAN sekarang dilakukan melalui…', o: ['PC ke CTSO', 'Grup WAG Koordinasi CSO–CTSO–MNT dengan tag SPV Teknisi', 'Email', 'GX Connect'], a: 1, e: 'Booking lewat grup koordinasi dengan tag SPV Teknisi (Nur & Galang).' },
    { q: 'Bolehkah booking slot LAN sebelum pelanggan membayar?', o: ['Tidak boleh', 'Boleh, lalu update SPV dengan nomor tiket setelah bayar', 'Hanya untuk VIP', 'Hanya hari Senin'], a: 1, e: 'Booking boleh sambil menunggu pembayaran; setelah bayar update nomor tiket jadwal.' },
  ] },
{ id: 'router-spec', cat: 'teknis', title: 'Router Specification Data', src: N('28e9b0fbceac8085bd44e6a1af67324e'),
  summary: 'Referensi spesifikasi router untuk cek kesesuaian perangkat pelanggan (misal sebelum upgrade).',
  body: `- Spesifikasi router menentukan kinerja: kecepatan transfer, pita frekuensi, jangkauan, jumlah port, dan teknologi jaringan.
- Gunakan data ini untuk mengevaluasi apakah router pelanggan mendukung paket/kecepatan yang diminta.
- **Data Spesifikasi Router**: https://docs.google.com/spreadsheets/d/1wK0Ofs0ZgBXA5b0JjAZoq8yg1Wo_hjHC9fxnnJF8uJQ/edit?usp=sharing
> Terkait SOP Change Package: cek spesifikasi router sebelum upgrade.`,
  quiz: [
    { q: 'Kapan data spesifikasi router paling relevan dicek?', o: ['Saat refund', 'Sebelum upgrade paket', 'Saat ganti nama', 'Saat bayar Indomaret'], a: 1, e: 'Spesifikasi router dicek untuk memastikan perangkat mendukung paket yang di-upgrade.' },
  ] },
);
window.KB_MATERI.push(
{ id: 'basic-technical', cat: 'teknis', title: 'Basic Technical Knowledge — Infrastruktur Fiber Optic', src: N('2849b0fbceac80bd8d58dae27c889fc5'),
  summary: 'Istilah perangkat & jaringan yang wajib dipahami CS: dari NAP sampai ONU, router dan switch.',
  body: `## Jaringan inti
- **NAP (Network Access Point)** — titik tempat banyak jaringan internet besar saling terhubung & bertukar data.
- **ISP** — penyedia layanan internet (contoh: GlobalXtreme, Indihome, Biznet).
- **Fiber Optic** — kabel kaca/plastik halus yang menghantar data dengan **cahaya**: cepat, jarak jauh, tahan gangguan listrik.
## Distribusi fiber
- **Joint Closure (JC)** — wadah pelindung sambungan kabel FO di jalur utama.
- **Dome** — JC berbentuk kubah untuk sambungan outdoor.
- **ODC (Optical Distribution Cabinet)** — lemari pembagi kabel dari feeder ke beberapa jalur distribusi.
- **Splitter** — membagi satu sinyal optik ke beberapa output (sistem PON).
- **FDB (Fiber Distribution Box)** / Terminal Port — kotak pembagi dari kabel utama ke kabel pelanggan.
## Di sisi pelanggan
- **Pigtail** — potongan FO pendek berkonektor untuk ke OTB/ONU.
- **OTB (Optical Termination Box)** — terminasi kabel FO luar ke dalam rumah; ada gulungan untuk menjaga power FO.
- **ONU** — mengubah sinyal cahaya menjadi data; menghubungkan fiber ke main router (box putih logo GlobalXtreme).
- **Router** — membagi koneksi & memberi IP ke perangkat. **Access Point** — memancarkan WiFi untuk area luas.
- **Switch** mengirim data ke perangkat tujuan saja (efisien); **Hub** ke semua port.
- **UTP** — kabel tembaga dipilin tanpa pelindung; **STP** — dengan shield untuk area banyak gangguan listrik.
## Alat teknisi
- **Joinkit** (perlengkapan sambung), **Fusion Splicer** (sambung permanen dengan panas), **Cleaver** (potong fiber rata), **OTDR** (deteksi titik putus/redaman).`,
  quiz: [
    { q: 'Perangkat di rumah pelanggan yang mengubah sinyal cahaya menjadi data adalah…', o: ['Router', 'ONU', 'ODC', 'Switch'], a: 1, e: 'ONU mengubah sinyal cahaya fiber menjadi sinyal data dan terhubung ke router.' },
    { q: 'Alat untuk mendeteksi titik putus pada kabel fiber optic adalah…', o: ['Cleaver', 'OTDR', 'Splitter', 'Pigtail'], a: 1, e: 'OTDR mengukur panjang, kualitas, dan lokasi gangguan fiber.' },
    { q: 'Perbedaan switch dan hub adalah…', o: ['Hub lebih cepat', 'Switch mengirim data hanya ke perangkat tujuan', 'Sama saja', 'Switch tanpa kabel'], a: 1, e: 'Switch lebih efisien karena mengirim data hanya ke port tujuan.' },
    { q: 'Kotak pembagi dari kabel utama ke kabel rumah pelanggan (terminal port) adalah…', o: ['FDB', 'OTB', 'Dome', 'NAP'], a: 0, e: 'FDB (Fiber Distribution Box) atau terminal port.' },
  ] },
{ id: 'bod-dia-intracity', cat: 'teknis', title: 'Bandwidth on Demand (BOD), DIA & Intracity', src: N('2829b0fbceac805593faed9b6dbef109'),
  summary: 'Rumus harga BOD, alur request ke Billing Helpdesk & NA, kuota BOD gratis DIA/Intracity, dan alur DIA.',
  body: `## BOD — penambahan bandwidth sementara
- Rumus: **(Harga paket ÷ jumlah hari dalam bulan) + 50%** per hari.
- Contoh Signature 400 Mbps Rp4.440.000: 4.440.000 ÷ 31 = 143.225 → +50% = 214.838/hari → 3 hari = **Rp644.514** (incl. pajak).
## Alur BOD
1. Email ke **Billing Helpdesk & NA** — subject "GX BALI – Permohonan BOD Akun ID [xxxxx]" berisi akun, paket, periode, total biaya.
2. Copy subject email → ticket GXOne ke Billing Helpdesk untuk invoice BOD.
3. Ticket baru **Send to NA** dengan remarks "Mohon bantu proses permintaan BOD" (+ subject email) → masuk grup Telegram CTSO–NA.
4. Cek ulang limiter di menu **Check ONU (GX-One)**.
5. Info pelanggan + lampirkan invoice; setelah periode selesai kirim permintaan penghentian BOD (email + ticket NA).
## Ketentuan BOD
- Hanya untuk **pelanggan existing**; bandwidth otomatis kembali ke paket semula.
- **DIA: free 2x/bulan**, **Intracity: free 1x/bulan**, maks. **3 hari per request**, total bandwidth maks. **1 Gbps** (termasuk paket existing).
- GlobalXtreme **tidak menyewakan router** → arahkan ke pihak ketiga (contoh https://my.monis.rent/).
## BOD Intracity
- Gratis dengan total **maks. 3 hari per bulan (akumulasi)**; khusus CNI free tidak terbatas.
- Bandwidth BOD bisa disesuaikan hingga kapasitas ONU pelanggan.
- Melebihi 3 hari → **jangan approve langsung**; eskalasi ke **PIC Intracity (Putri)** → koordinasi Head Sales.
## DIA (Dedicated Internet Access)
- Rasio **1:1** tanpa sharing, top priority service. Harga **Rp75.000/Mbps** (belum pajak), contoh 100 Mbps = Rp7.500.000/bulan.
- Alur: analisis kebutuhan → penawaran (SPV CS) → kontrak (Administrasi) → aktivasi NA (retail ↔ DIA butuh kunjungan teknisi untuk konfigurasi IP) → invoice Billing Helpdesk & monitoring SLA.
- Intracity: **Rp5.000/Mbps** (belum pajak).`,
  quiz: [
    { q: 'Rumus harga BOD per hari adalah…', o: ['Harga paket ÷ 30', '(Harga paket ÷ jumlah hari) + 50%', 'Harga paket × 2', 'Rp75.000/Mbps'], a: 1, e: 'BOD = (harga paket / jumlah hari dalam 1 bulan) + 50%.' },
    { q: 'Berapa kali BOD gratis per bulan untuk pelanggan DIA?', o: ['1 kali', '2 kali', '3 kali', 'Tidak ada'], a: 1, e: 'DIA free 2x/bulan, Intracity 1x/bulan, maks. 3 hari per request.' },
    { q: 'Pelanggan Intracity minta BOD yang membuat total > 3 hari bulan ini. Tindakannya…', o: ['Approve langsung', 'Eskalasi ke PIC Intracity (Putri)', 'Tolak', 'Charge otomatis'], a: 1, e: 'Wajib konfirmasi PIC Intracity yang lalu koordinasi dengan Head Sales.' },
    { q: 'Harga DIA per Mbps (belum pajak) adalah…', o: ['Rp5.000', 'Rp25.000', 'Rp75.000', 'Rp100.000'], a: 2, e: 'DIA Rp75.000/Mbps; Intracity Rp5.000/Mbps.' },
  ] },
{ id: 'divisi-peran', cat: 'umum', title: 'Divisi & Peran Tim di GlobalXtreme', src: N('1dc9b0fbceac80d9a964fd47f06bc4e5'),
  summary: 'Siapa mengerjakan apa — membantu CS tahu ke mana harus eskalasi.',
  body: `## Customer Service Officer (Head: Pak Rachmat)
- **Customer Service** — walk-in, chat/email, terima pembayaran new & existing, follow up keluhan.
- **Contact Center** — telepon, email, chat; respon cepat laporan gangguan.
- **Helpdesk Administrator** — request/keluhan dari line internal (Sales, CTSO, dll).
- **Billing Helpdesk** — data administrasi & billing, e-faktur, inactive, proforma, aktivasi pelanggan baru.
- **Dispatcher Alpha** — jadwal kunjungan **pelanggan baru**. **Dispatcher Bravo** — jadwal kunjungan **pelanggan existing**.
## Teknis
- **CTSO** (Head: Pak Dimas Tonang) — technical issue dengan panduan online; bila tidak selesai jadwalkan teknisi.
- **FO Installation Lastmile** (Pak Alan) — tarik FO dari FDB ke rumah + pasang ONU & OTB.
- **Customer Maintenance / CMT** (Pak Angga) — aktivasi router, maintenance reguler jaringan lokal, dismantle.
- **FO Maintenance / Wire-down** (Pak Bobi) — kabel putus, reposisi ONU/FO, survey jalur baru, perbaikan power ONU.
- **FO Backbone** (Pak Bobi) — kabel backbone ke FDB, pasang tiang/FDB/ODC.
- **FO Upgrading** (Pak Ajid) — tiang & distribusi FDB, pemindahan kabel udara ke tanah.
- **NA & NO** (Pak Purwoko / Pak Handaru) — infrastruktur jaringan, link budget, aktivasi network pelanggan baru.
## Pendukung
- GA (Bu Tini), HC (Bu Cecil) & L&D (Pak Malik), Software Development (Pak Wawan — CRM, GX Employee, MyGX, GXOne), Finance & Accounting (Pak Wayan), Marketing (Pak Arwin), Legal (Pak Artis), Logistics/Warehouse (Bu Dhani).
- Sales: Badung (Pak Anton), Denpasar Selatan (Pak Rizal), Denpasar Utara (Pak Dimas Agung) — sales lapangan, telesales, admin sales.`,
  quiz: [
    { q: 'Penjadwalan kunjungan pelanggan existing ditangani oleh…', o: ['Dispatcher Alpha', 'Dispatcher Bravo', 'Billing Helpdesk', 'Sales'], a: 1, e: 'Alpha = pelanggan baru, Bravo = pelanggan existing.' },
    { q: 'Tim yang menangani kabel FO putus adalah…', o: ['CMT', 'FO Maintenance (Wire-down)', 'NA', 'GA'], a: 1, e: 'FO Maintenance / Team Wire-down menangani kabel putus & kendala fisik FO.' },
    { q: 'Proses e-faktur & inactive temporary diproses oleh…', o: ['Billing Helpdesk', 'Dispatcher', 'CTSO', 'Marketing'], a: 0, e: 'Billing Helpdesk memproses permintaan administrasi pelanggan.' },
  ] },
{ id: 'gx-employee', cat: 'umum', title: 'GX Employee — Absensi & Salary Simulation', src: N('25a9b0fbceac80c38e7cd03dbc8968ab'),
  summary: 'Cara cek absensi dan gaji real-time di GX Employee.',
  body: `- Website: https://employee.globalxtreme-technologies.net/personal/attendance
## Absensi
- Cek absensi **wajib lewat website** GX Employee.
## Salary simulation
- Shift Correction, Personal Leave, dan Sick Leave dicek & di-approve **Pak Rachmat sekitar tanggal 27–29** — karena itu pre-salary di email & draft slip belum tentu sesuai.
- **Tidak perlu personal chat** Pak Rachmat untuk minta approve; tunggu info SPV.
- Cek gaji real-time: Web **My Salary → Simulation → Generate**; Apps **Pay Slip → Salary Simulation → Generate**.
> Pre-salary email & slip draft **tidak real time** — jangan dijadikan acuan.`,
  quiz: [
    { q: 'Cara cek gaji real-time di web GX Employee…', o: ['Lihat email pre-salary', 'My Salary → Simulation → Generate', 'Tanya HC', 'Slip draft'], a: 1, e: 'Gunakan Salary Simulation → Generate; pre-salary email tidak real time.' },
    { q: 'Approval shift correction & leave biasanya dilakukan sekitar tanggal…', o: ['1–3', '10–12', '20–22', '27–29'], a: 3, e: 'Dicek & di-approve Pak Rachmat sekitar tanggal 27–29.' },
  ] },
);
window.KB_MATERI.push(
{ id: 'tech-admin-issues', cat: 'teknis', title: 'Technical & Administrative Issues — Alur Penanganan Keluhan', src: N('2849b0fbceac80059414f93c4c735303'),
  summary: 'Alur cek keluhan (verifikasi → bill → network → histori), diagnosa awal, penanganan power, visit, dan template Power Off.',
  body: `## Kanal komplain resmi
- WhatsApp CSO: 0361-736811 (1st line Qiscus), 0361-736822 (2nd line Qiscus), 0878-6120-0012 (Dispatcher Bravo), 0877-3331-1187 (Account Manager – Helpdesk).
- WhatsApp CTSO: 0819-9996-2272 (1st), 0878-6120-0009 (2nd).
- Email cso@globalxtreme.net · Telepon (0361) 736811 · Web chat globalxtreme.net · Walk-in Jl. Raya Kerobokan No. 388X · **MyGX** (otomatis membuat tiket di GXOne).
## Alur utama
1. **Catat komplain** — nama, ID layanan, kontak, deskripsi.
2. **Verifikasi akun** — nama, Circuit ID, alamat terdaftar.
3. **Bill checking** — ada tunggakan → arahkan bayar dulu sebelum troubleshooting.
4. **Network checking** — status perangkat, koneksi, performa di sistem monitoring.
5. **Histori ticket** — hindari duplikasi; repeat complaint beri note penanganan lanjutan.
## Diagnosa awal
- **Customer Education** — edukasi penggunaan/konfigurasi.
- **Port 1 LAN Down** — panduan cek LAN ONU-router; perlu lanjut → **Ticket Send to CTSO**.
- **Power Off** — cek kelistrikan & ONU; listrik normal tapi ONU off / LOS merah → jadwalkan FO maintenance.
- **Wire Down** — pastikan bukan masalah listrik → request kunjungan tim Wiredown.
- **Power Issue** — analisis ke NA (ONU atau FDB) → Wiredown / Upgrading.
## Penanganan power
- ONU power low/high → ticket ke **Dispatcher** (perbaikan Tim Wiredown).
- OLT power low/high → koordinasi **NA** via Telegram.
- FDB → update di WAG Harian Pekerjaan FDB (perbaikan tim Upgrading).
## Visit & penutupan
- Visit MNT reguler **Rp100.000/visit**; visit Wiredown / Upgrading tanpa biaya.
- Setelah WO closed → follow up pelanggan **maks. 2 kali (by call)**; masih kendala → "Solved & Create New Ticket".
- Ticket aktif wajib dikawal; **update progress setiap 15 menit** (status, estimasi, teknisi).
## Template Power Off (inti)
- Info modem/box putih terdeteksi mati → tanyakan pemadaman listrik → minta pastikan terhubung ke colokan → bila normal, minta **video kondisi modem**.`,
  quiz: [
    { q: 'Pelanggan komplain internet mati tapi masih ada tunggakan. Langkah pertama…', o: ['Langsung jadwalkan teknisi', 'Arahkan pembayaran dulu sebelum troubleshooting', 'Grace otomatis', 'Ticket ke NA'], a: 1, e: 'Bill checking: bila ada tunggakan, pelanggan diarahkan membayar terlebih dahulu.' },
    { q: 'ONU power low/high ditangani dengan…', o: ['Koordinasi NA via Telegram', 'Ticket ke Dispatcher (Tim Wiredown)', 'Email billing', 'Upgrade paket'], a: 1, e: 'ONU/User power → ticket ke Dispatcher, diperbaiki Tim Wiredown. OLT → NA.' },
    { q: 'Interval update progress ticket aktif ke pelanggan/divisi terkait…', o: ['5 menit', '15 menit', '1 jam', '1 hari'], a: 1, e: 'Update progress setiap 15 menit.' },
    { q: 'Listrik normal tapi ONU tetap off / LOS merah. Tindakannya…', o: ['Tutup case', 'Jadwalkan FO maintenance', 'Ganti paket', 'Refund'], a: 1, e: 'Power Off dengan listrik normal → jadwalkan FO maintenance.' },
  ] },
{ id: 'tv-transvision', cat: 'teknis', title: 'Troubleshooting TV Transvision', src: N('2d69b0fbceac801e8367ff2d0ad96c80'),
  summary: 'SOP kendala TV Transvision: cek administrasi dulu, semua kendala teknis langsung ke CTSO.',
  body: `> Transvision **discontinued untuk langganan baru** — SOP ini untuk pelanggan existing.
## 1. Pengecekan awal (wajib)
- Pastikan administrasi aman: pelanggan sudah **bayar / top up** (koordinasi Team Leader Unni/Tiyo bila perlu).
- Administrasi aman tapi masih bermasalah → kemungkinan bug sistem Transvision atau STB (mis. status RP).
## 2. Sudah bayar tapi TV belum bisa
1. CC/CSO konfirmasi status top up ke Team Leader.
2. TL kirim **SS bukti top up**.
3. Minta pelanggan mencoba lagi.
4. Masih gagal → **Open Ticket ke CTSO** + lampirkan SS bukti top up.
## 3. Kendala teknis
- Login–logout, penyesuaian tanggal & jam STB, bug sistem → **SELURUHNYA langsung ke CTSO**, tidak ditangani di level CC/CSO.
## 4. Case berulang → migrasi Postpaid
- Boleh disarankan bila pembayaran lancar tapi sering terputus.
- Wajib **penjadwalan teknisi H-1** sebelum masa langganan berakhir.
- Edukasi wajib: terminasi diajukan **minimal 1 bulan sebelumnya**, kalau tidak tetap ditagih; pastikan pelanggan paham & setuju.`,
  quiz: [
    { q: 'Kendala teknis STB Transvision (login–logout, jam STB) ditangani oleh…', o: ['CC/CSO', 'CTSO', 'Billing', 'Sales'], a: 1, e: 'Seluruh kendala teknis langsung diarahkan ke CTSO.' },
    { q: 'Setelah migrasi ke postpaid, terminasi harus diajukan…', o: ['Kapan saja', 'Minimal 1 bulan sebelumnya', '1 minggu sebelumnya', 'Tidak bisa terminasi'], a: 1, e: 'Wajib minimal 1 bulan sebelumnya, jika tidak tetap terhitung tagihan.' },
  ] },
{ id: 'crm-guide', cat: 'teknis', title: 'CRM User Guide', src: N('18c9b0fbceac81ec9dcbd6ee43df5508'),
  summary: 'Navigasi CRM: status akun, activity, package, balance, VA, cashier drawer, dan menu misc.',
  body: `- Akses via Chrome: http://172.16.79.144/ (login email kantor yang terdaftar di HC).
## Menu Customer
- **Manage / List** — data pribadi, login MyGX, email penerima tagihan.
- **Service Location** — data akun (cari by Account ID / Name / Number / Address); Priority/Score otomatis.
## Status akun
- **Active** — internet aktif, tagihan lunas / belum jatuh tempo.
- **Blocked** — internet mati, lewat jatuh tempo.
- **Graced** — internet aktif dalam perpanjangan sementara (maks. 3 hari).
- **Inactive** — berhenti sementara (maks. 3 bulan). **Terminate** — permanen. **Pending** — proses pasang baru.
## Detail akun
- Activity: start date, expiry date, **grace date** (waktu pemutusan bila belum bayar), More Action untuk grace.
- Package: billing date, Include Tax, Include E-Faktur, Include PPh23 (Yes = pelaporan dari pelanggan), Override Package Setting.
- Balance: Credit (uang muka/kelebihan), Payment, Account total (biru = ada uang muka, merah = ada tagihan).
- Deposit (bisa dikembalikan setelah 1 tahun kontrak).
- **VA BCA** hanya dari sesama BCA; **VA Mandiri** dari semua bank (estimasi masuk 10–15 menit).
- Representatives, Billing Statements (https://globalxtreme.net/info/understanding-bill), Invoice, Payment, Documents, Gallery.
## Menu Cashier — My Drawer
- **Start Shift** → Invoice Payment (invoice sudah terbit) / **Top Up Credit** (invoice belum terbit).
- **Close Shift** → isi Actual Cash Balance, Central Receipt pilih I Wayan Yastika.
## Menu Misc
- Document (template), Priority (view only), **Coverage Area** (cek coverage by address), Blocking (view only), Broadcast (generate kontak).`,
  quiz: [
    { q: 'Status akun "Graced" artinya…', o: ['Internet mati permanen', 'Internet aktif dalam perpanjangan sementara', 'Proses pasang baru', 'Berhenti sementara 3 bulan'], a: 1, e: 'Graced: internet aktif dalam masa perpanjangan sementara.' },
    { q: 'VA yang hanya bisa ditransfer dari sesama rekening bank yang sama adalah…', o: ['VA Mandiri', 'VA BCA', 'Keduanya', 'Tidak ada'], a: 1, e: 'VA BCA hanya dari sesama BCA; VA Mandiri dari semua bank.' },
    { q: 'Pembayaran diterima tapi invoice belum terbit, posting di My Drawer memakai…', o: ['Invoice Payment', 'Top Up Credit', 'Close Shift', 'Broadcast'], a: 1, e: 'Top Up Credit dipakai bila invoice belum diterbitkan.' },
    { q: 'Untuk mengecek coverage lokasi pemasangan baru gunakan menu…', o: ['Billing', 'Misc → Coverage Area', 'Inventory', 'Cashier'], a: 1, e: 'Menu Misc → Coverage Area (search by address).' },
  ] },
{ id: 'reposisi-relokasi', cat: 'teknis', title: 'Reposisi, Relokasi & Restorasi', src: N('2f19b0fbceac80eab1b6ea99f3381685'),
  summary: 'Membedakan reposisi, relokasi, restorasi, dan pasang baru beserta biaya dan alurnya.',
  body: `## Tentukan jenis permintaan
- Perangkat dipindah di **alamat yang sama** → **Reposisi**.
- Pelanggan pindah ke **alamat baru** → **Relokasi**.
- Aktifkan kembali akun terminasi dengan **nama sama** → **Restorasi**.
- Nama pelanggan berbeda → **Pasang Baru**.
## Reposisi
- Reposisi ONU **gratis** bila jalur mudah; perlu splice FO **Rp50.000/titik**.
- Reposisi router / access point **Rp100.000/titik** (akumulatif).
- Jadwal: ONU / ONU + 1 router → **Tim CMT Reguler**; perlu pindah jalur FO → koordinasi **Tim FO Maintenance**. Survey dulu bila perlu.
## Relokasi
- Mengikuti alur pasang baru (Survey → Registrasi → Instalasi); akun lama di-terminate, akun baru dibuat.
- Sisa masa langganan bisa dilanjutkan; tagihan akun lama wajib lunas. Biaya ditentukan Sales dari hasil survey.
- CSO: input ke **Leads Sales – GX ONE** dengan keterangan "Relokasi dari User ID XXXXX" → share ke grup Sales & After Sales area.
## Restorasi
- Pastikan akun lama terminasi & nama sama → input Leads Sales dengan "Restorasi dari User ID XXXXX" → share ke grup Sales & After Sales.`,
  quiz: [
    { q: 'Pelanggan memindahkan router ke lantai 2 di rumah yang sama. Ini termasuk…', o: ['Relokasi', 'Reposisi', 'Restorasi', 'Pasang baru'], a: 1, e: 'Pemindahan perangkat di alamat yang sama = reposisi.' },
    { q: 'Biaya reposisi router / access point adalah…', o: ['Gratis', 'Rp50.000/titik', 'Rp100.000/titik', 'Ditentukan Sales'], a: 2, e: 'Router/AP Rp100.000 per titik (akumulatif).' },
    { q: 'Akun terminasi ingin diaktifkan kembali tapi atas nama orang lain. Prosesnya…', o: ['Restorasi', 'Pasang baru', 'Reaktivasi', 'Reposisi'], a: 1, e: 'Nama berbeda → diproses sebagai pasang baru.' },
  ] },
);
window.KB_MATERI.push(
{ id: 'cek-status-jaringan', cat: 'teknis', title: 'Panduan Pengecekan Status Jaringan (ONU, Port, Power, Limiter)', src: N('2a79b0fbceac8005956ce15f738b4392'),
  summary: 'Cara membaca status ONU, port, receive power, dan limiter — serta ke tim mana eskalasinya.',
  body: `## 1. Status ONU
- **Online** — ONU menyala, tidak ada masalah FO & ONU.
- **Offline** — ONU mati / wiredown → cek **Last Dereg Reason**:
- **Wiredown** → pastikan listrik aman → **Ticket send to Dispatcher** (tim Wiredown).
- **Power Off** → cek listrik/adaptor; bila hanya lampu power yang menyala atau ONU tidak mau menyala = ONU rusak → **Ticket send to CTSO (CMT-Reguler)** untuk ganti ONU.
## 2. Status port (bila online)
- **Up** — UTP ONU–router terhubung baik. **Down** — kabel UTP lepas / tidak terhubung (**customer side issue**).
## 3. Receive power
- **Power ONU** normal **-18 s/d -28 dBm** (Within Threshold).
- **Too Low** (mis. -29 dBm) → kunjungan **Wiredown**, WO oleh Dispatcher (ticket send to Dispatcher).
- **Too High** (mis. -17 dBm) → kunjungan **CMT Reguler**, WO oleh CTSO (ticket send to CTSO) + share nomor ticket ke WAG Ticket Request CTSO.
- **Power balik (OLT)** normal ±2 dBm dari power ONU, maks. -30 dBm. Low/High → konfirmasi NA/NO di Telegram CTSO/NA:
- Aman → network normal. Perlu perbaikan arah user / power ONU → Wiredown (ticket ke Dispatcher). Perlu perbaikan FDB → minta titik GPS FDB, kirim ke WAG **Pekerjaan Harian FDB** via WA Center Dispatcher Bravo.
## 4. Limiter
- Pastikan limiter sesuai paket. Contoh **210.000 Kbps = 200 Mbps**.`,
  quiz: [
    { q: 'Range normal power ONU adalah…', o: ['-5 s/d -10 dBm', '-18 s/d -28 dBm', '-30 s/d -40 dBm', '0 dBm'], a: 1, e: 'Power ONU normal -18 dBm hingga -28 dBm.' },
    { q: 'Power ONU -29 dBm (too low). Eskalasinya…', o: ['Ticket send to CTSO (CMT)', 'Ticket send to Dispatcher (Wiredown)', 'Tidak perlu', 'Ke Sales'], a: 1, e: 'Too low → kunjungan Wiredown, WO dibuat Dispatcher.' },
    { q: 'Power ONU -17 dBm (too high). Eskalasinya…', o: ['Ticket send to CTSO (CMT Reguler)', 'Ticket ke Dispatcher', 'Email NA', 'Grace'], a: 0, e: 'Too high → CMT Reguler, WO oleh CTSO + share ke WAG Ticket Request CTSO.' },
    { q: 'ONU online tapi status port Down artinya…', o: ['FO putus', 'Kabel UTP ONU–router tidak terhubung (customer side)', 'ONU rusak', 'Tagihan belum bayar'], a: 1, e: 'Port Down = UTP tidak terhubung baik, customer side issue.' },
  ] },
{ id: 'restart-perangkat', cat: 'teknis', title: 'Restart Perangkat Jaringan (ONU & Router)', src: N('2989b0fbceac80be9c02d4dab2ea785a'),
  summary: 'Tiga cara restart: oleh pelanggan, ONU via remote network, dan router via remote.',
  body: `## 1. Restart oleh pelanggan
1. Pastikan ONU & router ada di lokasi; tandai kabel/adaptor power.
2. Info pelanggan perangkat akan mati sementara.
3. Cabut adaptor router & ONU **1–3 menit**, pasang kembali, tunggu booting.
4. Minta pelanggan mencoba koneksi lagi.
## 2. Restart ONU via remote network
1. Info internet mati **2–3 menit**.
2. Menu **Service Location** di Network → cari Location ID → **Reboot ONU**.
3. Cek **ONU Monitoring** sampai up & power normal → minta pelanggan mencoba lagi.
## 3. Restart router via remote
- Remote router sesuai IP/pengaturan dari laporan teknisi → **System → Reboot** (2–3 menit, router tidak bisa di-ping selama reboot) → pastikan bisa di-remote & ping normal kembali.`,
  quiz: [
    { q: 'Berapa lama adaptor ONU & router dicabut saat restart manual?', o: ['5 detik', '1–3 menit', '10 menit', '1 jam'], a: 1, e: 'Cabut adaptor power selama 1–3 menit lalu pasang kembali.' },
    { q: 'Restart ONU via remote dilakukan dari menu…', o: ['Billing', 'Service Location → Reboot ONU', 'Cashier', 'Coverage Area'], a: 1, e: 'Service Location di Network → Reboot ONU, lalu pantau ONU Monitoring.' },
  ] },
{ id: 'ticketing-guide', cat: 'teknis', title: 'Ticketing Guide GXOne (Type → Category → Problem Type)', src: N('3d19b0fbceac805bb1d4f51c34147802'),
  summary: 'Cara memilih klasifikasi ticket yang tepat, aturan multiple issue, dan golden rule CSO.',
  body: `## Quick guide
1. **TYPE** — **Complaint** (gangguan/kegagalan/ketidaksesuaian) atau **Info** (informasi/panduan/status/request).
2. **CATEGORY** — area/service terkait.
3. **PROBLEM TYPE** — pilih yang **paling spesifik**.
> Golden rule: jangan pilih Other / By Request / yang generik bila ada pilihan lebih spesifik.
## Contoh Complaint
- **Internet Problem**: Can't access internet, Slow access, Equipment issue, Billing Issue, Email Issue, Site Blocking, Mass-Problem, Wiredown, Forwarding IP & Port, Signal Coverage, **Connection ON/OFF** (sering putus-sambung).
- **Equipment Issue**: defect in/out warranty, tidak sesuai spesifikasi, tukar unit, device loan, cable route, pole position.
- **Account Details**: data discrepancy, invalid email/contact/address, activation issue, termination not yet processed.
- **Billing Problem**: incorrect invoice/proforma, deposit refund, invalid VA, payment failed, invoice email not received, invalid tax invoice / PPh23, billing statement issue.
- **Package Benefit** (bandwidth discrepancy, IP public), **Field Team Issue** (arrival time, working result, scheduling), **MyGX** (payment failed, login issue), **TV** (buffering).
## Contoh Info
- **Internet**: Request MRTG, forwarding, network availability, signal coverage.
- **Hardware**: installation, re-positioning, dismantle, trial device, relocation, cable route, pole, equipment replacement, **Changing SSID & Password**.
- **Account**: temporary inactivation, reactivation, change ownership/email/number/address, activation, account info, document/contract.
- **Billing**: tax invoice, PPh23, post payment, change cycle, deposit refund, VA info, **grace period extension**, proforma, resend invoice, generate invoice, invoice details, receipt, payment method, void invoice, reminder, WO invoice, funds movement.
- **Termination**: by system, relocation, restoration, renovation, business closed, by request, moving, network/price issue, switch to competitor, change ownership, mechanism.
- **Package**: upgrade/downgrade, details, trial, add-on TV, unreg add-on, Xstream Transvision, info, promotion, FOC, **BOD**.
- **Technician**, **Outbound Call** (follow-up), **MyGX Apps** (password info), **Survey** (installation, re-positioning).
## Multiple issue
- **1 issue dengan 1 workflow = 1 ticket.** Contoh "internet sering putus + ganti password WiFi" → Ticket 1 Complaint → Internet Problem → Connection ON/OFF; Ticket 2 Info → Hardware/Internet → Changing SSID & Password.
- Terpaksa 1 ticket → pakai primary issue, issue tambahan di description.
## Unclear case
- Probing dulu: "Apakah internet tidak bisa digunakan sama sekali, lambat, atau sering terputus?"`,
  quiz: [
    { q: 'Pelanggan bilang internetnya sering putus-sambung. Problem type yang tepat…', o: ['Slow access internet', 'Connection ON/OFF', 'Other', 'Wiredown'], a: 1, e: 'Koneksi sering terputus dan tersambung kembali = Connection ON/OFF.' },
    { q: 'Pelanggan minta ganti password WiFi sekaligus komplain internet lambat. Berapa ticket?', o: ['1 ticket', '2 ticket (workflow berbeda)', 'Tidak perlu ticket', '3 ticket'], a: 1, e: '1 issue dengan 1 workflow = 1 ticket; workflow berbeda → split ticket.' },
    { q: 'Request perpanjangan masa toleransi pembayaran masuk TYPE…', o: ['Complaint → Billing Problem', 'Info → Billing → Grace Period Extension', 'Info → Account', 'Complaint → MyGX'], a: 1, e: 'Grace period extension adalah Info → Billing.' },
    { q: 'Kapan boleh memilih "Other / By Request"?', o: ['Selalu', 'Hanya sebagai pilihan terakhir', 'Untuk VIP', 'Untuk complaint'], a: 1, e: 'Golden rule: Other/By Request hanya pilihan terakhir.' },
  ] },
{ id: 'whatsapp-cost-saving', cat: 'umum', title: 'WhatsApp Cost Saving Guide (berlaku 1 Oktober 2026)', src: N('3de9b0fbceac804b9f2ae70929ceb8fc'),
  summary: 'Pesan service WhatsApp kini berbayar per delivered message — gabungkan informasi tanpa mengurangi kualitas.',
  body: `> Mulai **1 Oktober 2026** pesan Service dalam window 24 jam dikenakan biaya **per delivered message**. Prinsip: **"Message seperlunya, informasi selengkapnya."**
## Prinsip
- **One issue → one clear answer** — jangan pecah satu informasi jadi beberapa bubble.
- Gabungkan informasi yang saling berkaitan dalam satu pesan.
- **Hindari acknowledgement berdiri sendiri** ("Baik Kak", "Siap", "Mohon ditunggu") — gabungkan dengan tindakan berikutnya.
- **Kumpulkan pertanyaan sekaligus**: nama lengkap, UID, nomor HP terdaftar, kendala, sejak kapan.
- Berikan info lengkap sejak awal (nominal + jatuh tempo + instruksi bukti bayar).
- Pakai **line break** untuk readability — line break bukan pesan baru.
- Cek history, **jangan ulang** informasi yang sudah diberikan.
## Boleh dipisah bila
- Konteks / action berbeda, terlalu panjang, kebutuhan template sistem, atau info baru tersedia setelah proses selesai.
## Golden rule
- **Think → Combine → Check → Send.**`,
  quiz: [
    { q: 'Mana yang paling sesuai panduan cost saving?', o: ['Kirim "Baik Kak" lalu "Kami cek ya"', 'Satu pesan berisi acknowledgement + tindakan berikutnya', 'Tanya data satu per satu', 'Ulangi jadwal teknisi tiap jam'], a: 1, e: 'Acknowledgement digabung dengan informasi/tindakan berikutnya dalam satu pesan.' },
    { q: 'Golden rule sebelum mengirim pesan adalah…', o: ['Copy → Paste → Send', 'Think → Combine → Check → Send', 'Ask → Wait → Close', 'Send → Check → Fix'], a: 1, e: 'Think → Combine → Check → Send.' },
    { q: 'Apakah line break dihitung sebagai pesan baru?', o: ['Ya', 'Tidak — line break tetap dalam satu bubble', 'Tergantung panjang', 'Hanya di email'], a: 1, e: 'Line break bukan message baru; dipakai untuk readability.' },
  ] },
{ id: 'mygx-migration', cat: 'helpdesk', title: 'Migrasi WhatsApp ke MyGX Apps & Link Live Chat', src: N('3e29b0fbceac803b8787d45b7fa797b2'),
  summary: 'Workflow migrasi per tim dan link live chat tiap kanal.',
  body: `## Workflow per tim
- CC & Customer Service: https://miter-purr-51013206.figma.site/
- Dispatcher Alpha & Bravo: https://hide-flask-72146509.figma.site/
- Helpdesk: https://workflowhelpdesk.figma.site/
## Link live chat
- Customer Support Bali — https://apps.globalxtreme-solutions.net/chat/customer-support/
- **Helpdesk Bali** — https://apps.globalxtreme-solutions.net/chat/helpdesk/
- Dispatcher Alpha — https://apps.globalxtreme-solutions.net/chat/dispatcher-alpha/
- Dispatcher Bravo — https://apps.globalxtreme-solutions.net/chat/dispatcher-bravo/
- GlobalXtreme Malang — https://apps.globalxtreme-solutions.net/chat/gx-malang/
- My GX One — https://apps.globalxtreme-solutions.net/myglobalxtreme/`,
  quiz: [
    { q: 'Link live chat khusus Helpdesk Bali berakhiran…', o: ['/chat/customer-support/', '/chat/helpdesk/', '/chat/gx-malang/', '/myglobalxtreme/'], a: 1, e: 'Helpdesk Bali: apps.globalxtreme-solutions.net/chat/helpdesk/.' },
  ] },
);
window.KB_MATERI.push(
{ id: 'cso-scheduling', cat: 'umum', title: 'CSO Scheduling — Pilih Shift, Kuota & Tukar Shift', src: N('3c39b0fbceac80f794a6cf250c7629b0'),
  summary: 'Cara pakai website scheduling, aturan kuota, aturan Minggu/tanggal merah, dan tukar shift.',
  body: `- Website: https://gx-cso-scheduling.vercel.app/ — login pakai akun dari admin/SPV (lupa password → minta reset, **jangan buat akun baru**).
## Menu
- **My Schedule** — kalender bulanan untuk pilih/ubah shift. Kode abu-abu = slot harian penuh, kuota bulanan habis, atau tidak tersedia.
- **Shift Swap** — tukar shift dengan rekan satu sub-divisi (perlu approval admin).
- **Public Recap** — jadwal seluruh tim; tanda merah di pojok sel = ada catatan admin.
## Kuota
- Dua batasan berlaku sekaligus: **slot kebutuhan harian** dan **kuota shift per orang** (first come, first served).
- Penuhi kebutuhan shift dulu, baru atur libur. Maks. **7 hari kerja berturut-turut**; tidak boleh menabung libur di periode berjalan.
## Minggu & tanggal merah
- **0 Day off** dan **½ Half day** selalu boleh; **C Leave (cuti)** dan **i Permission** tidak boleh (darurat → hubungi SPV).
## Tukar shift
1. Maksimal **H-2 sebelum hari tukar, weekday sebelum 17.00** (contoh tukar Senin → paling lambat Sabtu 17.00).
2. Harus disetujui kedua pihak; pantau status approval; belum berubah sampai H-1 → hubungi SPV.
3. Tukar shift yang membuat kerja > 7 hari lalu sakit di tengahnya → **sick leave tidak di-approve**.
## Half-day shift
- Jam 09.00–13.00, valid bila total kerja **> 4 jam** — jangan clock out tepat 13.00; telat masuk → clock out menyesuaikan.`,
  quiz: [
    { q: 'Batas pengajuan tukar shift untuk hari Rabu adalah…', o: ['Selasa 17.00', 'Senin sebelum 17.00', 'Minggu', 'Rabu pagi'], a: 1, e: 'Maksimal H-2 sebelum hari tukar, weekday sebelum jam 17.00.' },
    { q: 'Kode apa yang TIDAK boleh dipilih di hari Minggu/tanggal merah?', o: ['0 Day off', '½ Half day', 'C Leave', 'Semua boleh'], a: 2, e: 'C (Leave) dan i (Permission) tidak boleh di Minggu/tanggal merah.' },
    { q: 'Maksimal hari kerja berturut-turut tanpa libur adalah…', o: ['5 hari', '6 hari', '7 hari', '10 hari'], a: 2, e: 'Agent tidak boleh bekerja lebih dari 7 hari berturut-turut.' },
  ] },
{ id: 'absence-policy', cat: 'umum', title: 'Kebijakan Absensi — Sick Leave, Alfa, Cuti, Late Clock In', src: N('4f1547f926cd4d1dba1d602bf1cf6da3'),
  summary: 'Aturan sakit, alfa, absensi harian, cuti/personal leave, half-day, dan keterlambatan.',
  body: `## Sick leave
- Wajib info SPV via chat/telepon + foto **surat dokter & obat** (surat dokter online boleh, tetap lampirkan foto obat).
- Upload ke GX Employee **hari yang sama atau maks. H+1**. Tanpa surat & foto obat → unapproved.
- Tanpa surat dokter → ambil cuti (bila slot ada) atau personal leave (unpaid).
## Alfa
- Penyebab: tidak masuk tanpa request leave, leave tidak di-approve, clock in/out tidak terdeteksi, kode shift salah sehingga late/early.
- **Alfa > 2 kali dalam 1 bulan → SP 1.**
## Daily attendance
- Cek clock in/out & kode shift **setiap hari**; kesalahan diinfokan **hari H**. Terlambat info → tidak bisa shift correction (tidak ada correction tanpa persetujuan Kenza).
## Cuti / personal leave
- Flow: input form → info SPV (saat slotting ditutup) → approved → request di GX Employee → screenshot → kirim email dengan lampiran.
- Paling lambat diinformasikan **1 minggu setelah jadwal dinyatakan fix**; maks. **7 hari** cuti; bersifat permohonan sesuai kebutuhan operasional.
## Half-day & late clock in
- Masuk setengah hari tidak disetujui (kecuali SK HC) → disarankan ambil cuti.
- Telat > 3 kali berturut dalam seminggu atau 5 kali sebulan → sanksi. Tidak ada permit.
- Telat > 1 jam → pakai cuti (bila slot ada) atau dianggap alfa; tanpa cuti → personal leave.`,
  quiz: [
    { q: 'Batas upload surat dokter ke GX Employee adalah…', o: ['H+3', 'Hari yang sama atau maks. H+1', '1 minggu', 'Tidak perlu'], a: 1, e: 'Wajib upload di hari yang sama atau maksimal H+1.' },
    { q: 'Alfa berapa kali dalam sebulan yang menyebabkan SP 1?', o: ['Lebih dari 1', 'Lebih dari 2', 'Lebih dari 5', '10'], a: 1, e: 'Alfa lebih dari 2 kali dalam 1 bulan dikenakan SP 1.' },
    { q: 'Kesalahan kode shift harus diinformasikan…', o: ['Akhir bulan', 'Hari H', 'Saat gajian', 'Kapan saja'], a: 1, e: 'Diinformasikan hari H; terlambat info tidak bisa shift correction.' },
  ] },
{ id: 'personal-record', cat: 'umum', title: 'Personal Record / Surat Teguran & SP', src: N('18c9b0fbceac80ff9bbae40f74c46da1'),
  summary: 'Kapan personal record dikeluarkan, masa berlaku, dan jenjang SP.',
  body: `- Diberikan untuk pelanggaran aturan perusahaan/divisi, disengaja maupun tidak (contoh: terlambat, tidak mengikuti prosedur, perilaku tidak sesuai norma).
- Hanya **SPV atau Head of Division** yang berhak mengeluarkan.
- Berlaku **1 tahun**, lalu dihapus bila tidak ada pelanggaran lanjutan.
## Sanksi
- **3 Personal Record → SP 1** (berlaku 6 bulan, **incentive dipotong 25%** selama 6 bulan).
- 3 Personal Record tambahan selama SP 1 → **SP 2** (6 bulan, **incentive dipotong 50%**).`,
  quiz: [
    { q: 'Berapa personal record untuk mendapatkan SP 1?', o: ['1', '2', '3', '5'], a: 2, e: '3 Personal Record → SP 1.' },
    { q: 'Sanksi SP 2 adalah…', o: ['Potong incentive 25%', 'Potong incentive 50% selama 6 bulan', 'PHK', 'Tidak ada'], a: 1, e: 'SP 2: pengurangan incentive 50% selama 6 bulan.' },
  ] },
);
window.KB_MATERI.push(
{ id: 'kpi-cso', cat: 'umum', title: 'KPI CSO — Baseline Revenue & CSAT', src: N('2e09b0fbceac800caa00f907b9b86841'),
  summary: 'Target KPI divisi CS dan cara menghitung sisa baseline.',
  body: `## Target
- **Baseline Revenue Rp12.000.000** — dicapai dari **reaktivasi** dan **upgrade**.
- **CSAT 91%** (sebelumnya 90%).
## Cara hitung baseline
- Setiap revenue yang masuk **mengurangi baseline** (dihitung tanpa pajak).
- Contoh: reaktivasi ke Xtreme Lite 300 Annual Rp2.880.000 → sisa baseline 12.000.000 − 2.880.000 = **Rp9.120.000**.
## Observation CS/CC
- Form observasi indikator versi baru mulai penilaian **Juni 2026**.
- Link penilaian 2026: https://docs.google.com/spreadsheets/d/11BLvGCDQmU3lv9V0j1-TSZvZOqfxDtvQIxLyBMl7mYY/edit?usp=sharing`,
  quiz: [
    { q: 'Target CSAT terbaru divisi CS adalah…', o: ['85%', '90%', '91%', '95%'], a: 2, e: 'CSAT 91% (sebelumnya 90%).' },
    { q: 'Baseline revenue dicapai dari…', o: ['Pasang baru', 'Reaktivasi & upgrade', 'Refund', 'Grace'], a: 1, e: 'Baseline Rp12.000.000 dicapai dari reaktivasi dan upgrade.' },
    { q: 'Upgrade senilai Rp2.000.000 (tanpa pajak) dari baseline penuh menyisakan…', o: ['Rp10.000.000', 'Rp12.000.000', 'Rp14.000.000', 'Rp9.120.000'], a: 0, e: '12.000.000 − 2.000.000 = Rp10.000.000.' },
  ] },
{ id: 'retention-program', cat: 'admin', title: 'Retention Program (Reactivation) — 4 Skenario Piutang', src: N('2019b0fbceac802b8c99c2973b060571'),
  summary: 'Kebijakan penagihan piutang saat pelanggan reaktivasi, termasuk opsi penghapusan piutang.',
  body: `## Siklus pembayaran (dokumen kebijakan)
- Tagihan dikirim tanggal **25** bulan sebelumnya; gagal terima email tidak memperpanjang masa bayar.
- Reminder H-2 & H-1; aktif kembali maks. 1x24 jam setelah dana efektif diterima.
- Tidak bayar beberapa bulan berturut-turut → **terminasi dini** dan GlobalXtreme berhak mengambil perangkat.
> Untuk batas hari blokir & terminasi operasional terbaru, ikuti materi **Billing & Payment System** dan **Reactivation Account**.
## Skenario 1 — tunggakan bulan berjalan
- Telat bayar → bayar penuh 1 bulan.
- Bayar setelah tagihan bulan berikutnya terbit (tgl 25) → bayar **2 bulan**.
- Ingin hapus piutang bulan berjalan → ubah ke **kuartal/semester/tahunan** dan bayar penuh periode berikutnya (paket sama atau lebih tinggi); billing direset ke tanggal bayar terbaru.
## Skenario 2 — tunggakan bulan ke-1 & ke-2 (tanpa inactive)
- Lunasi bulan ke-1 & ke-2, atau hapus piutang dengan pindah ke kuartal/semester/tahunan.
## Skenario 3 — inactive dengan pembayaran lancar
- Biaya **Rp100.000/bulan**, maks. **3 bulan**; pelanggan wajib konfirmasi di bulan ke-3 (reaktivasi / terminasi). Tanpa kabar → terminasi otomatis awal bulan ke-4.
## Skenario 4 — biaya inactive tidak terbayar
- Lunasi piutang inactive + biaya internet bulan berikutnya, atau hapus piutang inactive dengan bayar penuh di muka secara kuartal/semester/annual.
> Penghapusan piutang **hanya untuk tagihan internet**, tidak untuk peralatan/jasa lain.`,
  quiz: [
    { q: 'Penghapusan piutang pada retention program berlaku untuk…', o: ['Semua tagihan', 'Hanya tagihan langganan internet', 'Peralatan saja', 'Jasa instalasi'], a: 1, e: 'Tidak berlaku untuk piutang peralatan atau jasa lainnya.' },
    { q: 'Syarat menghapus piutang bulan berjalan adalah…', o: ['Bayar denda', 'Ubah ke kuartal/semester/tahunan & bayar penuh periode berikutnya', 'Minta SPV', 'Grace 48 jam'], a: 1, e: 'Pelanggan pindah ke siklus kuartal/semester/tahunan dan bayar penuh dengan paket sama atau lebih tinggi.' },
    { q: 'Pelanggan inactive tidak memberi kabar sampai akhir bulan ke-3. Apa yang terjadi?', o: ['Diperpanjang otomatis', 'Terminasi otomatis awal bulan ke-4', 'Aktif kembali', 'Dikenakan denda'], a: 1, e: 'Akun diterminasi otomatis oleh sistem pada awal bulan ke-4.' },
  ] },
{ id: 'promo-padel', cat: 'umum', title: 'Promo Voucher Pay 2 Months Get 1 Month FREE (Padel Event)', src: N('2cd9b0fbceac802d872cda2d85bc3b29'),
  summary: 'Ketentuan dan alur redeem voucher promo event Padel untuk pelanggan baru & existing.',
  body: `## Pelanggan baru
- Sales kirim data lengkap di Sales After Sales & input GXOne → Billing Helpdesk otomatis pakai **quarterly + diskon 1 bulan**.
## Pelanggan existing
- **Monthly**: bayar 2 bulan di muka → free 1 bulan (tidak perlu ganti billing cycle).
- **Anniversary yang habis sebelum 31 Januari 2026**: lanjut cycle sama → ticket redeem, potongan 1 bulan (contoh Lite 200 Annual Rp3.196.800 ÷ 12 = **Rp266.400**); atau ubah cycle (min. quarterly) dengan notes "Customer ingin Redeem Promo Voucher Pay 2 Months Get 1 Month FREE".
- **Anniversary yang berakhir setelah 31 Januari 2026**: bayar periode berikutnya sesuai cycle saat ini → potongan 1 bulan.
## Flow CSO
1. Catat data pelanggan di Google Sheet promo (akses email CSO).
2. Ticket **Info → Package → Promotion** (wajib lampirkan **foto voucher**).
3. Request redeem ke Billing Helpdesk: "Dear Billing Helpdesk, mohon bantu redeem voucher Promo Voucher Pay 2 Months Get 1 Month FREE sesuai paket customer saat ini, dengan detail sesuai di Google Sheet."
4. Setelah invoice terbit, info pelanggan untuk bayar.`,
  quiz: [
    { q: 'Kategori ticket untuk redeem voucher promo adalah…', o: ['Complaint → Billing', 'Info → Package → Promotion', 'Info → Account', 'Info → Billing → Grace'], a: 1, e: 'Info → Package → Promotion dengan lampiran foto voucher.' },
    { q: 'Pelanggan monthly existing mendapat free 1 bulan jika…', o: ['Bayar 2 bulan di muka', 'Upgrade paket', 'Ganti ke annual', 'Isi survey'], a: 0, e: 'Monthly: bayar 2 bulan di muka, free 1 bulan.' },
  ] },
{ id: 'dispatcher-qiscus', cat: 'helpdesk', title: 'INFO Dispatcher — Qiscus Broadcast Handling Flow', src: N('47b6a98d6f6347c5893df56334d34b25'),
  summary: 'Ringkasan peran Dispatcher Alpha/Bravo dan alur handling chat broadcast di Qiscus.',
  body: `## Peran
- **Dispatcher Alpha** — penjadwalan & koordinasi kunjungan **pelanggan baru**, rute teknisi, konfirmasi jadwal.
- **Dispatcher Bravo** — penjadwalan & koordinasi kunjungan **pelanggan existing** (termasuk List Wiredown & WAG Pekerjaan Harian FDB).
## Qiscus broadcast handling
1. Cek chat **Unserved** di Qiscus secara berkala.
2. **Assign** chat ke agent yang sesuai.
3. Target response time **< 5 menit**.
> Detail SOP per Dispatcher (Alpha & Bravo) ada di Notion bagian INFO Dispatcher.`,
  quiz: [
    { q: 'Target response time chat broadcast di Qiscus adalah…', o: ['< 5 menit', '< 15 menit', '< 1 jam', '< 24 jam'], a: 0, e: 'Response time kurang dari 5 menit.' },
  ] },
);
/* ============================ SDM & SCHEDULE + bank soal tambahan (target 35 soal per set quiz) ============================ */
window.KB_CATS.push(['sdm', 'SDM & Schedule', 'Absensi, cuti, jadwal shift, personal record, GX Employee & grooming']);
['cso-scheduling', 'absence-policy', 'personal-record', 'gx-employee', 'aturan-lobby'].forEach(id => { const m = window.KB_MATERI.find(x => x.id === id); if (m) m.cat = 'sdm'; });
const addQ = (id, arr) => { const m = window.KB_MATERI.find(x => x.id === id); if (m) m.quiz.push(...arr); };
addQ('cso-scheduling', [
  { q: 'Lupa password website CSO Scheduling, apa yang dilakukan?', o: ['Buat akun baru', 'Minta reset ke admin/SPV', 'Pakai akun rekan', 'Isi jadwal lewat WhatsApp'], a: 1, e: 'Lupa password → minta admin/SPV reset; jangan membuat akun baru.' },
  { q: 'Di My Schedule, kode shift berwarna abu-abu/redup artinya…', o: ['Shift favorit', 'Tidak bisa dipilih (slot harian penuh, kuota habis, atau tidak tersedia)', 'Sudah di-approve', 'Shift lembur'], a: 1, e: 'Kode redup tidak bisa dipilih karena slot harian penuh, jatah bulanan habis, atau tidak tersedia hari itu.' },
  { q: 'Dua jenis kuota yang berlaku saat memilih shift adalah…', o: ['Kuota cuti & kuota lembur', 'Slot kebutuhan harian & kuota shift per orang', 'Kuota divisi & kuota cabang', 'Hanya slot harian'], a: 1, e: 'Kedua batasan berlaku sekaligus: slot harian dan kuota shift masing-masing agent.' },
  { q: 'Saat mengisi jadwal, urutan prioritasnya adalah…', o: ['Atur libur dulu, baru shift', 'Penuhi kebutuhan shift dulu, baru atur libur', 'Bebas', 'Pilih shift malam dulu'], a: 1, e: 'Penuhi seluruh kebutuhan shift terlebih dahulu, setelah itu baru mengatur libur.' },
  { q: 'Tanda merah kecil di pojok sel Public Recap menandakan…', o: ['Jadwal bermasalah', 'Ada catatan dari admin — klik untuk membaca', 'Agent alfa', 'Shift lembur'], a: 1, e: 'Tanda merah = ada catatan; ditulis admin, bisa dibaca semua orang.' },
  { q: 'Absensi half-day shift (09.00–13.00) valid bila…', o: ['Clock out tepat 13.00', 'Total jam kerja lebih dari 4 jam', 'Clock in sebelum 10.00', 'Ada izin SPV'], a: 1, e: 'Valid bila total kerja > 4 jam; clock out tepat 13.00 tidak dihitung 4 jam.' },
  { q: 'Half-day shift: clock in 09.10, clock out paling cepat jam…', o: ['13.00', '13.05', '13.11', '12.50'], a: 2, e: 'Telat masuk → clock out menyesuaikan, contoh clock in 09.10 → clock out minimal 13.11.' },
]);
addQ('absence-policy', [
  { q: 'Bolehkah memakai surat dokter online (mis. Halodoc) untuk sick leave?', o: ['Tidak boleh', 'Boleh, wajib lampirkan foto obat dari konsultasi', 'Boleh tanpa lampiran', 'Hanya untuk SPV'], a: 1, e: 'Surat dokter online boleh, tetapi wajib melampirkan foto obat yang diberikan dokter.' },
  { q: 'Karyawan sakit tetapi tidak punya surat dokter. Opsinya…', o: ['Tetap sick leave', 'Cuti (bila slot ada) atau personal leave unpaid', 'Alfa otomatis tanpa pilihan', 'Tukar shift'], a: 1, e: 'Tanpa surat dokter → cuti (selama slot tersedia) atau personal leave (unpaid).' },
  { q: 'Mana yang BUKAN penyebab alfa?', o: ['Tidak masuk tanpa request leave', 'Clock in/out tidak terdeteksi', 'Sick leave dengan surat dokter & foto obat', 'Kode shift salah sehingga late/early'], a: 2, e: 'Sick leave lengkap dengan surat dokter & foto obat akan disetujui; yang lain bisa menyebabkan alfa.' },
  { q: 'Sanksi keterlambatan berlaku bila terlambat…', o: ['1 kali sebulan', 'Lebih dari 3 kali berturut dalam seminggu atau 5 kali dalam sebulan', '2 kali seminggu', 'Lebih dari 10 kali sebulan'], a: 1, e: 'Telat > 3 kali berturut dalam 1 minggu atau 5 kali dalam 1 bulan tanpa alasan → sanksi.' },
  { q: 'Terlambat lebih dari 1 jam dan tidak punya paid leave. Statusnya…', o: ['Tetap hadir', 'Personal leave', 'Half-day', 'Shift correction'], a: 1, e: 'Tanpa paid leave (cuti) → menggunakan personal leave.' },
  { q: 'Maksimal cuti yang bisa diajukan adalah…', o: ['3 hari', '5 hari', '7 hari', '14 hari'], a: 2, e: 'Maksimal 7 hari cuti (max libur 7 hari), sesuai ketentuan yang berlaku.' },
  { q: 'Cuti / personal leave paling lambat diinformasikan…', o: ['H-1', '1 minggu setelah jadwal dinyatakan fix', 'Saat war schedule dibuka', 'Kapan saja'], a: 1, e: 'Paling lambat 1 minggu setelah schedule dinyatakan fix.' },
  { q: 'Masuk kerja hanya setengah hari (tanpa SK HC)…', o: ['Disetujui', 'Tidak disetujui — disarankan ambil cuti', 'Otomatis half-day shift', 'Dihitung lembur'], a: 1, e: 'Half-day attendance tidak disetujui kecuali ada SK dari HC; disarankan ambil cuti.' },
]);
addQ('personal-record', [
  { q: 'Personal record berlaku selama…', o: ['3 bulan', '6 bulan', '1 tahun', 'Selamanya'], a: 2, e: 'Berlaku 1 tahun sejak dikeluarkan, lalu dihapus bila tidak ada pelanggaran lanjutan.' },
  { q: 'Siapa yang berhak mengeluarkan personal record?', o: ['Rekan kerja', 'SPV atau Head of Division', 'HC saja', 'Customer'], a: 1, e: 'Hanya Supervisor atau Head of Division.' },
  { q: 'SP 1 berlaku selama dan sanksinya…', o: ['3 bulan, potong gaji 10%', '6 bulan, potong incentive 25%', '1 tahun, potong incentive 50%', '1 bulan, teguran lisan'], a: 1, e: 'SP 1 berlaku 6 bulan dengan pengurangan incentive 25%.' },
]);
addQ('gx-employee', [
  { q: 'Mengapa pre-salary di email tidak boleh dijadikan acuan gaji?', o: ['Formatnya salah', 'Tidak real time — approval leave/correction belum masuk', 'Dikirim bulan depan', 'Hanya untuk SPV'], a: 1, e: 'Pre-salary & slip draft tidak real time; gunakan Salary Simulation → Generate.' },
  { q: 'Cek salary simulation di aplikasi GX Employee melalui menu…', o: ['Attendance → Recap', 'Pay Slip → Salary Simulation → Generate', 'Profile → Salary', 'Leave → Balance'], a: 1, e: 'Apps: Pay Slip → Salary Simulation → Generate (Web: My Salary → Simulation → Generate).' },
]);
addQ('aturan-lobby', [
  { q: 'Baju Anniversary GX boleh dipakai saat…', o: ['Setiap hari', 'Hari Minggu, seragam dengan rekan kerja', 'Hari Senin', 'Tidak pernah'], a: 1, e: 'Khusus hari Minggu dan janjian dengan rekan — tidak boleh kaos yang berbeda-beda.' },
  { q: 'Form registrasi / pembayaran setelah dipakai harus…', o: ['Dibiarkan di meja', 'Disimpan di laci dan diserahkan ke admin', 'Dibuang', 'Dibawa pulang'], a: 1, e: 'Simpan di laci meja dan serahkan ke admin setelah compile & jam tugas selesai.' },
  { q: 'Menempel password atau reminder dengan sticky notes di monitor…', o: ['Boleh asal rapi', 'Dilarang — budayakan clean desk', 'Boleh di lobby Denpasar', 'Wajib'], a: 1, e: 'Dilarang menempel password/data penting dengan sticky notes; budayakan clean desk.' },
  { q: 'Standar grooming yang benar adalah…', o: ['Sepatu sandal boleh', 'Wajib deodoran & parfum serta menjaga kebersihan mulut', 'Masker wajib walau sehat', 'Baju dimasukkan'], a: 1, e: 'Wajib deodoran & parfum, menjaga kebersihan mulut; tanpa sepatu sandal, baju tidak dimasukkan, tanpa masker bila sehat.' },
]);
addQ('cek-status-jaringan', [
  { q: 'Limiter 210.000 Kbps setara dengan paket…', o: ['100 Mbps', '200 Mbps', '210 Gbps', '21 Mbps'], a: 1, e: 'Contoh di SOP: 210.000 Kbps = 200 Mbps; limiter harus sesuai paket pelanggan.' },
]);
addQ('bod-dia-intracity', [
  { q: 'Layanan BOD berlaku untuk…', o: ['Calon pelanggan', 'Pelanggan existing saja', 'Pelanggan blokir', 'Semua orang'], a: 1, e: 'BOD hanya untuk pelanggan existing.' },
  { q: 'Pelanggan paket 300 Mbps minta BOD gratis. Total bandwidth maksimal setelah BOD…', o: ['1,3 Gbps', '1 Gbps total (termasuk paket existing)', '600 Mbps', 'Tidak terbatas'], a: 1, e: 'Total kapasitas setelah BOD maksimal 1 Gbps, termasuk kapasitas paket existing.' },
]);
addQ('reposisi-relokasi', [
  { q: 'Reposisi ONU yang memerlukan penyambungan (splice) fiber dikenakan biaya…', o: ['Gratis', 'Rp50.000 per titik', 'Rp100.000 per titik', 'Ditentukan Sales'], a: 1, e: 'Reposisi ONU gratis bila jalur mudah; perlu splice FO Rp50.000 per titik.' },
]);
