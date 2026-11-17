// POST /api/ai → "Asisten AI" di dashboard (admin/editor saja).
// Browser kirim percakapan + ringkasan data dashboard. Fungsi ini meneruskan ke Claude (Anthropic API)
// dan mengembalikan jawaban + USULAN perubahan. Fungsi ini TIDAK mengubah database sama sekali:
// perubahan baru terjadi kalau user klik "Terapkan" di browser (lewat alur simpan yang biasa).
// Butuh env var ANTHROPIC_API_KEY (server-side saja, tidak pernah dikirim ke browser).
// Opsional: ANTHROPIC_MODEL (default claude-sonnet-5-5).
const { send, getRole } = require('./_lib');

const MAX_MSGS = 16, MAX_MSG_CHARS = 6000, MAX_CONTEXT_CHARS = 400000;

const TOOL = {
  name: 'ubah_data',
  description: 'Usulkan perubahan data dashboard GX27. Perubahan TIDAK langsung tersimpan: user akan melihat daftar perubahan dan klik Terapkan. Pakai hanya id yang ada di data. Satu panggilan boleh berisi banyak ops.',
  input_schema: {
    type: 'object',
    properties: {
      ringkasan: { type: 'string', description: 'Ringkasan singkat perubahan (bahasa Indonesia santai), mis. "Ubah invoice Hyrox 1 jadi 1,5 jt".' },
      ops: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            op: { type: 'string', enum: ['update', 'add', 'delete'] },
            table: { type: 'string', enum: ['finance', 'tasks', 'rundown'] },
            id: { type: 'string', description: 'Wajib untuk update/delete. Kosongkan untuk add.' },
            set: { type: 'object', description: 'Field yang diubah/diisi. Angka Rupiah sebagai number tanpa titik. Tanggal YYYY-MM-DD. null untuk mengosongkan.' }
          },
          required: ['op', 'table']
        }
      }
    },
    required: ['ringkasan', 'ops']
  }
};

const SYSTEM = [
  'Kamu "Asisten GX27", asisten di dalam dashboard operasional event GX 27 Festival of Connectivity (GlobalXtreme, 21 Nov 2026).',
  'User adalah admin panitia (tim acara). Jawab singkat, bahasa Indonesia santai campur English seperlunya.',
  '',
  'Tugasmu: (1) menjawab pertanyaan soal data dashboard, (2) kalau user minta mengubah/menambah/menghapus data, panggil tool ubah_data dengan ops yang tepat.',
  'Aturan:',
  '- Pakai HANYA id yang ada di DATA. Jangan mengarang id. Kalau item yang dimaksud ambigu (lebih dari satu kandidat), tanya dulu sambil sebut kandidatnya.',
  '- Perubahan tidak langsung tersimpan; user akan konfirmasi. Jadi cukup panggil tool sekali dengan semua ops, lalu jelaskan singkat apa yang diusulkan.',
  '- Angka Rupiah = number bulat tanpa pemisah (1500000). "1,5 jt" = 1500000. Tanggal format YYYY-MM-DD; tahun default 2026.',
  '- Field finance: item, workstream (kategori, pakai nama persis dari daftar workstreams), qty, unit, unitCost, estimated (Estimated Budget), invQty, invUnit, invUnitCost, invoice (nominal invoice/realisasi), dp (down payment), paidAmount (nominal sudah ditransfer), fee (biaya transfer), invoiceStatus (Submitted/Unsubmitted), paymentStatus (nama dari payStatuses), paymentDeadline, notes, invoiceNo (No. Invoice; baris dengan nilai sama dikelompokkan), invoiceRef (link file invoice), receipt / receipt2 (link bukti transfer DP / pelunasan), parentId (induk vendor/alokasi), kind ("" | "vendor" | "allocation"), fundSource ("" | "buffer" | "topup" | "pool"), fundPool (id alokasi kalau fundSource pool), reimburse (boolean), reimburseTo, taskId.',
  '- Field tasks: name, workstream, workstreams (array), category, pic (nama dipisah koma), status (nama dari taskStatuses), start, deadline, notes, blockers.',
  '- Field rundown: segment, start, end (HH:MM), flow, location, status, pic, concurrent (array).',
  '- Untuk add: isi field penting saja (finance minimal item + workstream; tasks minimal name + workstream + status).',
  '- Delete hanya kalau user jelas minta hapus.',
  '- Angka "_calc" di DATA adalah hasil hitungan dashboard (est, inv, paid, outstanding); "summary" berisi total per kategori. Pakai itu untuk menjawab, jangan menghitung ulang kalau sudah ada. Jangan ubah field _calc.',
  '- Kalau permintaan di luar data dashboard (mis. ubah tampilan/kode website), bilang itu perlu update kode, bukan lewat asisten ini.'
].join('\n');

function clean(messages) {
  if (!Array.isArray(messages)) return null;
  const out = [];
  messages.slice(-MAX_MSGS).forEach((m) => {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return;
    const text = String(m.content == null ? '' : m.content).slice(0, MAX_MSG_CHARS).trim();
    if (!text) return;
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += '\n\n' + text;
    else out.push({ role: m.role, content: text });
  });
  while (out.length && out[0].role !== 'user') out.shift();
  if (!out.length || out[out.length - 1].role !== 'user') return null;
  return out;
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') { try { return Promise.resolve(JSON.parse(req.body)); } catch (_) { return Promise.resolve(null); } }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 2e6) { raw = ''; resolve(null); } });
    req.on('end', () => { try { resolve(JSON.parse(raw)); } catch (_) { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });

  let role;
  try { role = await getRole(req); } catch (e) { return send(res, 500, { error: e.message }); }
  if (!role) return send(res, 403, { error: 'Login sebagai admin/editor dulu.' });

  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!key) return send(res, 501, { error: 'Asisten AI belum aktif: isi ANTHROPIC_API_KEY di Vercel → Settings → Environment Variables, lalu Redeploy.' });

  const body = await readBody(req);
  const messages = clean(body && body.messages);
  if (!messages) return send(res, 400, { error: 'Pesan kosong.' });
  let context = typeof (body && body.context) === 'string' ? body.context : JSON.stringify((body && body.context) || {});
  if (context.length > MAX_CONTEXT_CHARS) context = context.slice(0, MAX_CONTEXT_CHARS);

  const payload = {
    model: (process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5').trim(),
    max_tokens: 4000,
    system: [
      { type: 'text', text: SYSTEM },
      { type: 'text', text: 'DATA dashboard saat ini (JSON):\n' + context, cache_control: { type: 'ephemeral' } }
    ],
    tools: [TOOL],
    messages
  };

  let r, out;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    out = await r.json().catch(() => ({}));
  } catch (e) {
    return send(res, 502, { error: 'Tidak bisa menghubungi Anthropic: ' + e.message });
  }
  if (!r.ok) {
    const msg = (out && out.error && out.error.message) || ('HTTP ' + r.status);
    const hint = r.status === 401 ? ' (cek ANTHROPIC_API_KEY)' : r.status === 429 ? ' (kena rate limit, coba lagi sebentar)' : '';
    return send(res, 502, { error: 'AI error: ' + msg + hint });
  }

  const blocks = Array.isArray(out.content) ? out.content : [];
  const reply = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  const call = blocks.find((b) => b.type === 'tool_use' && b.name === TOOL.name);
  const proposal = call && call.input && Array.isArray(call.input.ops) && call.input.ops.length
    ? { summary: String(call.input.ringkasan || ''), ops: call.input.ops.slice(0, 60) }
    : null;
  return send(res, 200, { reply, proposal, role, model: out.model || payload.model });
};

module.exports._clean = clean;
module.exports._TOOL = TOOL;
