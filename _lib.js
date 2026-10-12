// Shared helpers for the Vercel serverless functions (files starting with "_" are not routes).

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

// Public Supabase settings. Only the URL and the PUBLIC key (anon / publishable) are used.
// Never put the service_role / secret key here: this project does not need it.
function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '').trim();
  const problems = [];
  if (!url) problems.push('SUPABASE_URL belum diisi');
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url)) problems.push('SUPABASE_URL harus berbentuk https://<project>.supabase.co');
  if (!key) problems.push('SUPABASE_ANON_KEY belum diisi');
  else if (/^sb_secret_/.test(key) || isServiceRoleJwt(key)) problems.push('SUPABASE_ANON_KEY berisi secret/service_role key. Ganti dengan anon (public) key');
  return { url, key, ok: problems.length === 0, problems };
}

function isServiceRoleJwt(key) {
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    return payload.role === 'service_role';
  } catch (_) { return false; }
}

// Returns 'admin', 'editor' or null for the caller's Supabase access token.
// Supabase verifies the token; my_role() reads the role from site_admins for that user.
async function getRole(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const cfg = supabaseConfig();
  if (!cfg.ok) throw new Error(cfg.problems.join('; '));
  const r = await fetch(cfg.url + '/rest/v1/rpc/my_role', {
    method: 'POST',
    headers: { apikey: cfg.key, Authorization: auth, 'Content-Type': 'application/json' },
    body: '{}'
  });
  if (!r.ok) return null;
  const role = await r.json();
  return role === 'admin' || role === 'editor' ? role : null;
}

module.exports = { send, getRole, supabaseConfig, isServiceRoleJwt };
