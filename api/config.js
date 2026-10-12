const { supabaseConfig } = require('../_lib');

module.exports = (req, res) => {
  const sb = supabaseConfig();

  const anySet = Boolean(
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY
  );

  const cfg = {
    configured: sb.ok,
    supabaseUrl: sb.ok ? sb.url : null,
    supabaseAnonKey: sb.ok ? sb.key : null,
    configError:
      anySet && !sb.ok
        ? 'Konfigurasi Supabase di Vercel belum benar: ' +
          sb.problems.join('; ') + '.'
        : null,
    googleLogin: process.env.SUPABASE_GOOGLE_LOGIN === 'true',
    deployHook: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL),
    deployStatus: Boolean(
      process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID
    )
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end('window.GX27_CONFIG = ' + JSON.stringify(cfg) + ';\n');
};
