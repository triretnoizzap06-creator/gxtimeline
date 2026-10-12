
const { firebaseConfig } = require('../_lib');

module.exports = (req, res) => {
  const fb = firebaseConfig();
  const ok = Boolean(fb && fb.apiKey && fb.projectId && fb.authDomain);

  const cfg = {
    configured: ok,
    firebase: ok ? {
      apiKey: fb.apiKey,
      authDomain: fb.authDomain,
      projectId: fb.projectId,
      appId: fb.appId || undefined,
      messagingSenderId: fb.messagingSenderId || undefined,
      storageBucket: fb.storageBucket || undefined
    } : null,
    configError: process.env.FIREBASE_CONFIG && !ok
      ? 'FIREBASE_CONFIG tidak bisa dibaca. Paste ulang config dari Firebase Console.'
      : null,
    deployHook: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL),
    deployStatus: Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID)
  };

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end('window.GX27_CONFIG = ' + JSON.stringify(cfg) + ';\n');
};
