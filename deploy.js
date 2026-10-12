// POST /api/deploy → redeploys the live site from the latest commit on GitHub (admins only).
// It calls the Vercel Deploy Hook stored in VERCEL_DEPLOY_HOOK_URL. It does not change any code:
// code changes must be pushed to GitHub first.
const { send, getRole } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return send(res, 501, { error: 'VERCEL_DEPLOY_HOOK_URL belum diset di Vercel → Settings → Environment Variables.' });
  if (!/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\//.test(hook)) return send(res, 500, { error: 'VERCEL_DEPLOY_HOOK_URL tidak valid. Pakai URL dari Vercel → Settings → Git → Deploy Hooks.' });

  let role;
  try { role = await getRole(req); } catch (e) { return send(res, 500, { error: e.message }); }
  if (role !== 'admin') return send(res, 403, { error: 'Hanya admin yang bisa redeploy website.' });

  try {
    const r = await fetch(hook, { method: 'POST' });
    const text = await r.text();
    let body = {};
    try { body = JSON.parse(text); } catch (_) {}
    if (!r.ok) return send(res, 502, { error: 'Deploy hook ditolak Vercel (HTTP ' + r.status + ').' });
    return send(res, 200, { ok: true, job: body.job || null, requestedAt: new Date().toISOString() });
  } catch (e) {
    return send(res, 502, { error: 'Tidak bisa menghubungi Vercel: ' + e.message });
  }
};
