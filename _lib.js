// Shared helpers for the Vercel serverless functions (files starting with "_" are not routes).

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

// Asks Supabase which role the caller has, using the caller's own login token.
// Returns 'admin', 'editor' or null. The role table is protected by RLS, so a forged
// or expired token simply gets null.
async function getRole(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY || '';
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY belum diset di Vercel');
  const r = await fetch(url + '/rest/v1/rpc/my_role', {
    method: 'POST',
    headers: { apikey: key, Authorization: auth, 'Content-Type': 'application/json' },
    body: '{}'
  });
  if (!r.ok) return null;
  const role = await r.json();
  return role === 'admin' || role === 'editor' ? role : null;
}

module.exports = { send, getRole };
