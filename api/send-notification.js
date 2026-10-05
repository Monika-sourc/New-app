// ============================================================
// api/send-notification.js
// API Serverless Vercel — Envoie un push FCM
// ✅ Version corrigée — Toutes les URLs absolues + config FCM optimale
// ============================================================

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// ============================================================
// 🌐 URL PUBLIQUE DE L'APPLICATION (source unique de vérité)
// Utilisée pour : icônes, badges, liens de clic
// ============================================================
const APP_URL = 'https://new-app-three-eta.vercel.app';

// ============================================================
// 🔐 Initialisation Firebase Admin
// Les valeurs viennent des variables d'environnement Vercel
// ============================================================
function initFirebaseAdmin() {
  if (getApps().length > 0) return; // Déjà initialisé

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: getPrivateKey(),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL || '')}`
  };

  initializeApp({
    credential: cert(serviceAccount)
  });
}

// ============================================================
// 🔑 Nettoie la clé privée FIREBASE_PRIVATE_KEY
// Gère : guillemets, espaces, \n littéraux, retours chariot
// ============================================================
function getPrivateKey() {
  let key = process.env.FIREBASE_PRIVATE_KEY || '';
  key = key.trim();

  // Supprime les guillemets englobants éventuels (copier-coller depuis un .env)
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Convertit les \n littéraux en vrais retours à la ligne
  key = key.replace(/\\n/g, '\n');

  // Nettoie les \r parasites (Windows)
  key = key.replace(/\r/g, '');

  return key;
}

// ============================================================
// 🔗 Convertit un chemin relatif en URL ABSOLUE
// Ex: "/admin.html"  → "https://new-app-three-eta.vercel.app/admin.html"
// Ex: "https://..."  → inchangé
// ============================================================
function toAbsoluteUrl(path, fallback) {
  if (!path || typeof path !== 'string') return fallback || (APP_URL + '/');

  const trimmed = path.trim();
  if (!trimmed) return fallback || (APP_URL + '/');

  // Déjà absolue
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Chemin relatif → préfixe avec APP_URL
  if (trimmed.startsWith('/')) return APP_URL + trimmed;
  return APP_URL + '/' + trimmed;
}

// ============================================================
// 🚀 Handler principal
// ============================================================
export default async function handler(req, res) {
  // ---- CORS ----
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
    const { token, title, body, clickAction, tag } = req.body || {};

    // ---- ✅ Vérification stricte du token ----
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({ success: false, error: 'Token manquant ou invalide' });
    }

    // ---- Init Firebase Admin ----
    initFirebaseAdmin();

    // ---- ✅ Normalisation des valeurs ----
    const notifTitle = (title && String(title).trim()) || 'YOUNITED';
    const notifBody  = (body  && String(body).trim())  || 'Nouvelle notification';
    const notifTag   = (tag   && String(tag).trim())   || ('younited-' + Date.now());

    // ✅ clickAction TOUJOURS absolu (crucial pour webpush.fcmOptions.link)
    const absoluteLink = toAbsoluteUrl(clickAction, APP_URL + '/');

    // ---- ✅ Construction du message FCM optimisé ----
    const message = {
      token: token.trim(),

      // Notification (fallback pour plateformes natives)
      notification: {
        title: notifTitle,
        body: notifBody
      },

      // Données personnalisées lues par le Service Worker
      data: {
        click_action: absoluteLink,
        title: notifTitle,
        body: notifBody,
        tag: notifTag
      },

      // ---- Configuration Web Push (navigateurs) ----
      webpush: {
        headers: {
          Urgency: 'high',        // Priorité maximale
          TTL: '2419200'          // 4 semaines
        },
        notification: {
          title: notifTitle,
          body: notifBody,
          icon: APP_URL + '/logo-192.png',    // ✅ Domaine réel
          badge: APP_URL + '/badge-72.png',   // ✅ Domaine réel
          vibrate: [200, 100, 200],
          tag: notifTag,
          renotify: true,
          requireInteraction: false,
          silent: false,
          dir: 'auto',
          lang: 'fr'
        },
        fcmOptions: {
          link: absoluteLink                  // ✅ URL absolue garantie
        }
      },

      // ---- Configuration Android natif ----
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'younited-default'
        }
      }
    };

    // ---- ✅ Envoi du push ----
    const response = await getMessaging().send(message);
    console.log('[API] Push envoyé ✓ :', response);

    return res.status(200).json({ success: true, messageId: response });

  } catch (error) {
    console.error('[API] Erreur :', (error && error.message) || error);

    const code = error && error.code;

    // ---- ✅ Token invalide ou expiré ----
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token' ||
      code === 'messaging/invalid-argument'
    ) {
      return res.status(200).json({
        success: false,
        error: 'invalid-token',
        message: 'Le token FCM est invalide ou expiré'
      });
    }

    // ---- ✅ Credentials Firebase Admin invalides ----
    if (
      code === 'messaging/third-party-auth-error' ||
      code === 'app/invalid-credential'
    ) {
      return res.status(200).json({
        success: false,
        error: 'invalid-credentials',
        message: 'Les credentials Firebase Admin sont invalides'
      });
    }

    // ---- ✅ Erreur générique ----
    return res.status(500).json({
      success: false,
      error: (error && error.message) || 'Erreur inconnue'
    });
  }
}
