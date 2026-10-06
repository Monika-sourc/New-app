// ============================================================
// api/check-super-admin.js
// Vérifie le mot de passe Super Admin côté serveur
// ============================================================

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { password } = req.body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Password missing' });
    }

    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

    if (!SUPER_ADMIN_PASSWORD) {
      console.error('[check-super-admin] SUPER_ADMIN_PASSWORD not configured');
      return res.status(500).json({ success: false, error: 'Server not configured' });
    }

    if (password === SUPER_ADMIN_PASSWORD) {
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ success: false, error: 'Invalid password' });

  } catch (error) {
    console.error('[check-super-admin] Error:', error);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
