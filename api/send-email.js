// ============================================================
// api/send-email.js
// Proxy sécurisé pour l'envoi d'emails
// - Clé API conservée côté serveur (jamais exposée)
// - CORS restreint au domaine officiel
// - Accepte les requêtes same-origin (sans header Origin)
// ============================================================

export default async function handler(req, res) {
  const ALLOWED_ORIGINS = [
    'https://new-app-three-eta.vercel.app',
    'https://www.new-app-three-eta.vercel.app'
  ];

  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  // Cas 1 : Pas d'Origin (same-origin depuis notre propre site, ou appel direct)
  // Cas 2 : Origin présent et dans la whitelist
  const noOrigin = !origin;
  const isAllowedOrigin = noOrigin || ALLOWED_ORIGINS.indexOf(origin) !== -1;

  // Vérification supplémentaire via Referer si Origin absent
  let refererOk = true;
  if (noOrigin && referer) {
    refererOk = ALLOWED_ORIGINS.some(function (o) { return referer.indexOf(o) === 0; });
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (origin && isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin) return res.status(403).end();
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Blocage : si Origin présent ET pas dans la whitelist
  if (origin && !isAllowedOrigin) {
    console.error('[send-email] Origin refusée :', origin);
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  // Blocage : si Origin absent ET Referer présent ET pas bon
  if (noOrigin && !refererOk) {
    console.error('[send-email] Referer refusé :', referer);
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  try {
    const EMAIL_API_URL = 'https://getzenpay-email-api.onrender.com/api/send-welcome';
    const EMAIL_API_KEY = process.env.EMAIL_API_KEY;

    if (!EMAIL_API_KEY) {
      console.error('[send-email] EMAIL_API_KEY not configured');
      return res.status(500).json({ success: false, error: 'Server not configured' });
    }

    const body = req.body || {};

    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EMAIL_API_KEY
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[send-email] API error:', response.status, responseText);
      return res.status(response.status).send(responseText);
    }

    return res.status(200).send(responseText);

  } catch (error) {
    console.error('[send-email] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
