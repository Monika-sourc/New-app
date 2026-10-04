// ============================================================
// api/send-notification.js
// API Serverless Vercel — Envoie un push FCM
// ============================================================

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// ============================================================
// 🔐 Initialisation Firebase Admin
// Les valeurs viennent des variables d'environnement Vercel
// ============================================================
function initFirebaseAdmin() {
  if (getApps().length > 0) return; // Déjà initialisé

  // Récupère les credentials depuis les variables d'environnement
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
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
// 🚀 Handler principal
// ============================================================
export default async function handler(req, res) {
  // CORS — autorise ton app à appeler cette API
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

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token manquant' });
    }

    // Init Firebase Admin
    initFirebaseAdmin();

    // Construit le message
    const notifTag = tag || 'younited-' + Date.now();
    const message = {
      token: token,
      notification: {
        title: title || 'YOUNITED',
        body: body || 'Nouvelle notification'
      },
      data: {
        click_action: clickAction || '/',
        title: title || 'YOUNITED',
        body: body || '',
        tag: notifTag
      },
      webpush: {
        notification: {
          icon: 'https://ki.getzenpay.com/logo-192.png',
          badge: 'https://ki.getzenpay.com/badge-72.png',
          vibrate: [200, 100, 200],
          tag: notifTag,
          renotify: true,
          requireInteraction: false
        },
        fcmOptions: {
          link: clickAction || 'https://ki.getzenpay.com/'
        }
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'younited-default'
        }
      }
    };

    // Envoie le push
    const response = await getMessaging().send(message);
    console.log('[API] Push envoyé ✓ :', response);

    return res.status(200).json({ success: true, messageId: response });

  } catch (error) {
    console.error('[API] Erreur :', error);

    // Si le token est invalide
    if (
      error.code === 'messaging/registration-token-not-registered' ||
      error.code === 'messaging/invalid-registration-token'
    ) {
      return res.status(200).json({
        success: false,
        error: 'invalid-token',
        message: 'Le token FCM est invalide ou expiré'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur inconnue'
    });
  }
}
