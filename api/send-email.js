// ============================================================
// api/send-email.js
// Proxy sécurisé pour l'envoi d'emails
// La clé API email reste sur le serveur, jamais exposée
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
