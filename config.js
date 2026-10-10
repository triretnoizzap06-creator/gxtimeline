// GET /api/config → a small script that tells the browser how to reach Supabase.
// Only public values are exposed (the anon key is designed to be public; RLS protects the data).
module.exports = (req, res) => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || '';
  const cfg = {
    configured: Boolean(url && key),
    supabaseUrl: url,
    supabaseAnonKey: key,
    deployHook: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL),
    deployStatus: Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID)
  };
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end('window.GX27_CONFIG = ' + JSON.stringify(cfg) + ';\n');
};
