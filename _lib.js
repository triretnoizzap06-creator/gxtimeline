// Shared helpers for the Vercel serverless functions (files starting with "_" are not routes).

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

// FIREBASE_CONFIG holds the web config from the Firebase console. People usually paste the
// JavaScript object as-is ({ apiKey: "…", … }), so accept that as well as strict JSON.
function firebaseConfig() {
  const raw = (process.env.FIREBASE_CONFIG || '').trim();
  if (!raw) return null;
  const start = raw.indexOf('{'), end = raw.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  const s = raw.slice(start, end + 1); // drops "const firebaseConfig =" and a trailing ";"
  try { return JSON.parse(s); } catch (_) {}
  try {
    const json = s
      .replace(/^\s*\/\/.*$/gm, '')                            // whole-line comments
      .replace(/'([^']*)'/g, '"$1"')                            // single → double quotes
      .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')   // quote keys
      .replace(/,\s*}/g, '}');                                  // trailing comma
    return JSON.parse(json);
  } catch (_) { return null; }
}

// Returns 'admin', 'editor' or null for the caller's Firebase ID token.
// Firestore checks the token signature and the security rules: a caller can only read
// their own /admins/{email} entry, so a valid answer proves who they are and their role.
async function getRole(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const cfg = firebaseConfig();
  if (!cfg || !cfg.projectId) throw new Error('FIREBASE_CONFIG belum diset di Vercel');
  let email = '';
  try {
    const payload = JSON.parse(Buffer.from(auth.slice(7).split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (payload.aud !== cfg.projectId || !payload.email_verified) return null;
    email = String(payload.email || '').toLowerCase();
  } catch (_) { return null; }
  if (!email) return null;
  const url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(cfg.projectId) +
    '/databases/(default)/documents/admins/' + encodeURIComponent(email);
  const r = await fetch(url, { headers: { Authorization: auth } });
  if (!r.ok) return null;
  const doc = await r.json();
  const role = doc && doc.fields && doc.fields.role && doc.fields.role.stringValue;
  return role === 'admin' || role === 'editor' ? role : null;
}

module.exports = { send, getRole, firebaseConfig };
