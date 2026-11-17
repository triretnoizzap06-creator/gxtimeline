// Run: node tests/ai.test.js — tests api/ai.js with a fake fetch (no network, no real keys).
const assert = require('assert');
const path = require('path');
const fresh = () => { for (const m of ['ai', '_lib']) delete require.cache[require.resolve(path.join(__dirname, '..', 'api', m))]; return require('../api/ai'); };
function call(handler, req) {
  return new Promise((resolve) => {
    const out = { status: 200, headers: {}, body: '' };
    const res = { set statusCode(v) { out.status = v; }, get statusCode() { return out.status; }, setHeader(k, v) { out.headers[k.toLowerCase()] = v; }, end(b) { out.body = b || ''; out.json = JSON.parse(out.body || '{}'); resolve(out); } };
    handler(Object.assign({ method: 'POST', headers: {} }, req), res);
  });
}
let passed = 0; const t = async (n, f) => { await f(); passed++; console.log('PASS ', n); };
const ENV = { SUPABASE_URL: 'https://dorkvauioeotodkpeawo.supabase.co', SUPABASE_ANON_KEY: 'sb_publishable_x', ANTHROPIC_API_KEY: 'sk-ant-test-123' };
let sent = null;
function fakeFetch({ role = 'admin', ai } = {}) {
  global.fetch = async (url, opts) => {
    if (url.includes('/rpc/my_role')) return { ok: true, json: async () => role };
    if (url.includes('api.anthropic.com')) { sent = { url, opts, body: JSON.parse(opts.body) }; return ai(); }
    throw new Error('unexpected ' + url);
  };
}
const auth = { authorization: 'Bearer user-jwt' };
const body = { messages: [{ role: 'user', content: 'ubah invoice F103 jadi 1,5jt' }], context: { finance: [{ id: 'F103', item: 'Hyrox 1', invoice: 2000000 }] } };

(async () => {
  Object.assign(process.env, ENV);
  await t('GET ditolak', async () => { const r = await call(fresh(), { method: 'GET' }); assert.strictEqual(r.status, 405); });
  await t('tanpa login → 403, Anthropic tidak dipanggil', async () => {
    sent = null; fakeFetch({ ai: () => { throw new Error('no'); } });
    const r = await call(fresh(), { headers: {}, body }); assert.strictEqual(r.status, 403); assert.strictEqual(sent, null);
  });
  await t('role viewer → 403', async () => { fakeFetch({ role: 'viewer', ai: () => { throw new Error('no'); } }); const r = await call(fresh(), { headers: auth, body }); assert.strictEqual(r.status, 403); });
  await t('tanpa ANTHROPIC_API_KEY → 501 dengan petunjuk', async () => {
    delete process.env.ANTHROPIC_API_KEY; fakeFetch({ ai: () => { throw new Error('no'); } });
    const r = await call(fresh(), { headers: auth, body }); assert.strictEqual(r.status, 501); assert.ok(/ANTHROPIC_API_KEY/.test(r.json.error));
    process.env.ANTHROPIC_API_KEY = ENV.ANTHROPIC_API_KEY;
  });
  await t('usulan tool_use diteruskan; key hanya di header server, tidak di response', async () => {
    fakeFetch({ ai: async () => ({ ok: true, status: 200, json: async () => ({ model: 'claude-sonnet-5-5', content: [{ type: 'text', text: 'Siap, aku usulkan:' }, { type: 'tool_use', name: 'ubah_data', input: { ringkasan: 'Invoice Hyrox 1 → 1,5 jt', ops: [{ op: 'update', table: 'finance', id: 'F103', set: { invoice: 1500000 } }] } }] }) }) });
    const r = await call(fresh(), { headers: auth, body });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.json.reply, 'Siap, aku usulkan:');
    assert.deepStrictEqual(r.json.proposal.ops[0], { op: 'update', table: 'finance', id: 'F103', set: { invoice: 1500000 } });
    assert.strictEqual(sent.opts.headers['x-api-key'], ENV.ANTHROPIC_API_KEY);
    assert.ok(!r.body.includes('sk-ant'), 'API key tidak boleh bocor ke browser');
    assert.strictEqual(sent.body.model, 'claude-sonnet-5-5');
    assert.ok(sent.body.system[1].text.includes('F103'), 'context data dikirim');
    assert.strictEqual(sent.body.tools[0].name, 'ubah_data');
  });
  await t('body string (raw) juga diterima', async () => {
    fakeFetch({ ai: async () => ({ ok: true, json: async () => ({ content: [{ type: 'text', text: 'Outstanding Rp 0' }] }) }) });
    const r = await call(fresh(), { headers: auth, body: JSON.stringify(body) }); assert.strictEqual(r.status, 200); assert.strictEqual(r.json.proposal, null);
  });
  await t('error Anthropic 401 → 502 dengan petunjuk', async () => {
    fakeFetch({ ai: async () => ({ ok: false, status: 401, json: async () => ({ error: { message: 'invalid x-api-key' } }) }) });
    const r = await call(fresh(), { headers: auth, body }); assert.strictEqual(r.status, 502); assert.ok(/cek ANTHROPIC_API_KEY/.test(r.json.error));
  });
  await t('riwayat dirapikan: mulai dari user, role berurutan, dipotong', async () => {
    const c = fresh()._clean([{ role: 'assistant', content: 'hai' }, { role: 'user', content: 'a' }, { role: 'user', content: 'b' }, { role: 'system', content: 'x' }]);
    assert.deepStrictEqual(c, [{ role: 'user', content: 'a\n\nb' }]);
    assert.strictEqual(fresh()._clean([{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }]), null);
  });
  console.log('\n' + passed + ' passed');
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
