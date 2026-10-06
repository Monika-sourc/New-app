// ============================================================
// api/send-email.js
// Proxy sécurisé pour l'envoi d'emails
// - Clé API conservée côté serveur (jamais exposée)
// - CORS restreint au domaine officiel
// - Vérification de l'origine des requêtes
// ============================================================

export default async function handler(req, res) {
  // Domaines autorisés à appeler cette API
  const ALLOWED_ORIGINS = [
    'https://new-app-three-eta.vercel.app',
    'https://www.new-app-three-eta.vercel.app'
  ];

  const origin = req.headers.origin || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.indexOf(origin) !== -1;

  // Toujours indiquer que la réponse varie selon l'origine (cache)
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS : n'autoriser que les origines whitelistées
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Requête preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin) return res.status(403).end();
    return res.status(200).end();
  }

  // Seul le POST est accepté
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Vérification de l'origine : bloquer les appels externes
  if (!isAllowedOrigin) {
    console.error('[send-email] Origin refusée :', origin || '(vide)');
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  try {
    const EMAIL_API_URL = 'https://getzenpay-email-api.onrender.com/api/send-welcome';
    const EMAIL_API_KEY = process.env.EMAIL_API_KEY;

    if (!EMAIL_API_KEY) {
      console.error('[send-email] EMAIL_API_KEY not configured');
      return res.status(500).json({ success: false, error: 'Server not configured' });
    }

    // Récupère le corps de la requête client
    const body = req.body || {};

    // Transmet la requête à l'API email avec la clé secrète
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
