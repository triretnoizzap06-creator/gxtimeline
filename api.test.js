// Run: node tests/api.test.js   (no install needed; Node 18+)
// Tests the Vercel functions in api/ with a fake fetch — no network and no real keys.
const assert = require('assert');
const path = require('path');
const fresh = (m) => { const f = require.resolve(path.join(__dirname, '..', 'api', m)); delete require.cache[f]; delete require.cache[require.resolve(path.join(__dirname, '..', 'api', '_lib'))]; return require(f); };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (p) => b64({ alg: 'HS256' }) + '.' + b64(p) + '.sig';
function call(handler, req = {}) {
  return new Promise((resolve) => {
    const out = { status: 200, headers: {}, body: '' };
    const res = { set statusCode(v) { out.status = v; }, get statusCode() { return out.status; }, setHeader(k, v) { out.headers[k.toLowerCase()] = v; }, end(b) { out.body = b || ''; resolve(out); } };
    Promise.resolve(handler(Object.assign({ method: 'GET', headers: {} }, req), res));
  });
}
const cfgOf = (body) => JSON.parse(body.replace(/^window\.GX27_CONFIG = /, '').replace(/;\s*$/, ''));
let passed = 0; const t = async (name, fn) => { await fn(); passed++; console.log('PASS ', name); };
function setEnv(e) { for (const k of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_GOOGLE_LOGIN', 'VERCEL_DEPLOY_HOOK_URL', 'VERCEL_TOKEN', 'VERCEL_PROJECT_ID']) delete process.env[k]; Object.assign(process.env, e); }
const URL_ = 'https://dorkvauioeotodkpeawo.supabase.co', ANON = jwt({ role: 'anon', ref: 'dorkvauioeotodkpeawo' });

(async () => {
  await t('config: not configured → local mode, no error', async () => {
    setEnv({}); const c = cfgOf((await call(fresh('config'))).body);
    assert.strictEqual(c.configured, false); assert.strictEqual(c.configError, null);
  });
  await t('config: URL + anon key → configured, exposes only public values', async () => {
    setEnv({ SUPABASE_URL: URL_ + '/', SUPABASE_ANON_KEY: ANON, VERCEL_TOKEN: 'secret-token', VERCEL_PROJECT_ID: 'p' });
    const r = await call(fresh('config')); const c = cfgOf(r.body);
    assert.strictEqual(c.configured, true); assert.strictEqual(c.supabaseUrl, URL_); assert.strictEqual(c.supabaseAnonKey, ANON);
    assert.ok(!r.body.includes('secret-token'), 'Vercel token must never be sent to the browser');
    assert.strictEqual(r.headers['cache-control'], 'no-store');
  });
  await t('config: publishable key accepted', async () => {
    setEnv({ SUPABASE_URL: URL_, SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_abc123' }); assert.strictEqual(cfgOf((await call(fresh('config'))).body).configured, true);
  });
  await t('config: service_role key is refused and never exposed', async () => {
    const svc = jwt({ role: 'service_role' }); setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: svc });
    const r = await call(fresh('config')); const c = cfgOf(r.body);
    assert.strictEqual(c.configured, false); assert.ok(/secret\/service_role/.test(c.configError)); assert.ok(!r.body.includes(svc));
  });
  await t('config: sb_secret_ key is refused', async () => {
    setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: 'sb_secret_xyz' }); const c = cfgOf((await call(fresh('config'))).body); assert.strictEqual(c.configured, false);
  });
  await t('config: wrong URL shape reported', async () => {
    setEnv({ SUPABASE_URL: 'https://supabase.com/dashboard/project/x', SUPABASE_ANON_KEY: ANON }); const c = cfgOf((await call(fresh('config'))).body);
    assert.strictEqual(c.configured, false); assert.ok(/SUPABASE_URL/.test(c.configError));
  });
  // deploy
  const hook = 'https://api.vercel.com/v1/integrations/deploy/prj_x/abc';
  function fakeFetch(role, hookStatus = 201) {
    const calls = [];
    global.fetch = async (url, opts = {}) => {
      calls.push(url);
      if (url.endsWith('/rest/v1/rpc/my_role')) {
        assert.strictEqual(opts.headers.apikey, ANON);
        const ok = (opts.headers.Authorization || '') === 'Bearer user-token';
        return { ok, json: async () => (ok ? role : null) };
      }
      if (url === hook) return { ok: hookStatus < 300, status: hookStatus, text: async () => JSON.stringify({ job: { id: 'j1', state: 'PENDING' } }) };
      throw new Error('unexpected fetch ' + url);
    };
    return calls;
  }
  await t('deploy: GET refused', async () => { setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON, VERCEL_DEPLOY_HOOK_URL: hook }); assert.strictEqual((await call(fresh('deploy'), { method: 'GET' })).status, 405); });
  await t('deploy: no hook configured → 501', async () => { setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON }); assert.strictEqual((await call(fresh('deploy'), { method: 'POST' })).status, 501); });
  await t('deploy: non-Vercel hook URL refused', async () => { setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON, VERCEL_DEPLOY_HOOK_URL: 'https://evil.example/x' }); assert.strictEqual((await call(fresh('deploy'), { method: 'POST' })).status, 500); });
  await t('deploy: anonymous caller → 403, hook not called', async () => {
    setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON, VERCEL_DEPLOY_HOOK_URL: hook }); const calls = fakeFetch('admin');
    assert.strictEqual((await call(fresh('deploy'), { method: 'POST' })).status, 403); assert.ok(!calls.includes(hook));
  });
  await t('deploy: editor → 403, hook not called', async () => {
    setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON, VERCEL_DEPLOY_HOOK_URL: hook }); const calls = fakeFetch('editor');
    const r = await call(fresh('deploy'), { method: 'POST', headers: { authorization: 'Bearer user-token' } });
    assert.strictEqual(r.status, 403); assert.ok(!calls.includes(hook));
  });
  await t('deploy: admin → hook called, 200', async () => {
    setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON, VERCEL_DEPLOY_HOOK_URL: hook }); const calls = fakeFetch('admin');
    const r = await call(fresh('deploy'), { method: 'POST', headers: { authorization: 'Bearer user-token' } });
    assert.strictEqual(r.status, 200); assert.ok(calls.includes(hook)); assert.strictEqual(JSON.parse(r.body).ok, true);
  });
  await t('deploy-status: not configured → configured:false for editors', async () => {
    setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON }); fakeFetch('editor');
    const r = await call(fresh('deploy-status'), { headers: { authorization: 'Bearer user-token' } });
    assert.strictEqual(r.status, 200); assert.strictEqual(JSON.parse(r.body).configured, false);
  });
  await t('deploy-status: anonymous → 403', async () => {
    setEnv({ SUPABASE_URL: URL_, SUPABASE_ANON_KEY: ANON, VERCEL_TOKEN: 't', VERCEL_PROJECT_ID: 'p' }); fakeFetch('admin');
    assert.strictEqual((await call(fresh('deploy-status'))).status, 403);
  });
  console.log('\n' + passed + ' API tests passed');
})().catch((e) => { console.error('FAIL ', e && e.message); process.exit(1); });
