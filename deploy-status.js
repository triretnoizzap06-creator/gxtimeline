// GET /api/deploy-status → latest production deployment from the Vercel API (editors + admins).
// Needs VERCEL_TOKEN and VERCEL_PROJECT_ID (and VERCEL_TEAM_ID if the project is in a team).
const { send, getRole } = require('./_lib');

const STATE = { READY: 'Published', ERROR: 'Failed', CANCELED: 'Failed', BUILDING: 'Publishing', QUEUED: 'Publishing', INITIALIZING: 'Publishing' };

module.exports = async (req, res) => {
  let role;
  try { role = await getRole(req); } catch (e) { return send(res, 500, { error: e.message }); }
  if (!role) return send(res, 403, { error: 'Login sebagai admin/editor dulu.' });

  const token = process.env.VERCEL_TOKEN, project = process.env.VERCEL_PROJECT_ID, team = process.env.VERCEL_TEAM_ID;
  if (!token || !project) return send(res, 200, { configured: false });

  const qs = new URLSearchParams({ projectId: project, limit: '5', target: 'production' });
  if (team) qs.set('teamId', team);
  try {
    const r = await fetch('https://api.vercel.com/v6/deployments?' + qs.toString(), { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) return send(res, 502, { error: 'Vercel API menolak request (HTTP ' + r.status + '). Cek VERCEL_TOKEN / PROJECT_ID.' });
    const body = await r.json();
    const list = (body.deployments || []).map((d) => {
      const raw = d.readyState || d.state || 'UNKNOWN';
      return {
        state: raw,
        status: STATE[raw] || raw,
        url: d.url ? 'https://' + d.url : null,
        createdAt: d.created || d.createdAt || null,
        commitMessage: (d.meta && d.meta.githubCommitMessage) || null,
        commitSha: (d.meta && d.meta.githubCommitSha) || null,
        commitRef: (d.meta && d.meta.githubCommitRef) || null
      };
    });
    return send(res, 200, { configured: true, latest: list[0] || null, recent: list });
  } catch (e) {
    return send(res, 502, { error: 'Tidak bisa menghubungi Vercel: ' + e.message });
  }
};
