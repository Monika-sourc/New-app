// =====================================================
// YOUNITED - SCRIPT PRINCIPAL v66.0
// (Notification email admin à la connexion client)
// =====================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, query, where, onSnapshot, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const SUPER_ADMIN_PASSWORD = 'SuperAdmin@TW2026';

const BANKS_BY_COUNTRY = {
  'France': [
    { name: 'BNP Paribas', initials: 'BNP', color: '#00915a', domain: 'bnpparibas.com', logo: 'https://www.google.com/s2/favicons?domain=bnpparibas.com&sz=128' },
    { name: 'Société Générale', initials: 'SG', color: '#e60028', domain: 'societegenerale.com', logo: 'https://www.google.com/s2/favicons?domain=societegenerale.com&sz=128' },
    { name: 'Crédit Agricole', initials: 'CA', color: '#006f3c', domain: 'credit-agricole.com', logo: 'https://www.google.com/s2/favicons?domain=credit-agricole.com&sz=128' },
    { name: 'LCL', initials: 'LCL', color: '#002f6c', domain: 'lcl.fr', logo: 'https://www.google.com/s2/favicons?domain=lcl.fr&sz=128' },
    { name: 'Caisse d\'Épargne', initials: 'CE', color: '#e2001a', domain: 'caisse-epargne.fr', logo: 'https://www.google.com/s2/favicons?domain=caisse-epargne.fr&sz=128' }
  ],
  'Pologne': [
    { name: 'PKO Bank Polski', initials: 'PKO', color: '#003580', domain: 'pkobp.pl', logo: 'https://www.google.com/s2/favicons?domain=pkobp.pl&sz=128' },
    { name: 'Bank Pekao', initials: 'PEO', color: '#e30613', domain: 'pekao.com.pl', logo: 'https://www.google.com/s2/favicons?domain=pekao.com.pl&sz=128' },
    { name: 'mBank', initials: 'mB', color: '#ff5f00', domain: 'mbank.pl', logo: 'https://www.google.com/s2/favicons?domain=mbank.pl&sz=128' },
    { name: 'ING Bank Śląski', initials: 'ING', color: '#ff6200', domain: 'ing.pl', logo: 'https://www.google.com/s2/favicons?domain=ing.pl&sz=128' },
    { name: 'Santander Polska', initials: 'SAN', color: '#ec0000', domain: 'santander.pl', logo: 'https://www.google.com/s2/favicons?domain=santander.pl&sz=128' }
  ],
  'Espagne': [
    { name: 'BBVA', initials: 'BBVA', color: '#004481', domain: 'bbva.com', logo: 'https://www.google.com/s2/favicons?domain=bbva.com&sz=128' },
    { name: 'Banco Santander', initials: 'SAN', color: '#ec0000', domain: 'santander.com', logo: 'https://www.google.com/s2/favicons?domain=santander.com&sz=128' },
    { name: 'CaixaBank', initials: 'CX', color: '#006cb6', domain: 'caixabank.com', logo: 'https://www.google.com/s2/favicons?domain=caixabank.com&sz=128' },
    { name: 'Bankinter', initials: 'BK', color: '#ff6600', domain: 'bankinter.com', logo: 'https://www.google.com/s2/favicons?domain=bankinter.com&sz=128' },
    { name: 'Banco Sabadell', initials: 'SAB', color: '#00447c', domain: 'bancsabadell.com', logo: 'https://www.google.com/s2/favicons?domain=bancsabadell.com&sz=128' }
  ],
  'Italie': [
    { name: 'Intesa Sanpaolo', initials: 'ISP', color: '#006b3c', domain: 'intesasanpaolo.com', logo: 'https://www.google.com/s2/favicons?domain=intesasanpaolo.com&sz=128' },
    { name: 'UniCredit', initials: 'UC', color: '#d40000', domain: 'unicreditgroup.eu', logo: 'https://www.google.com/s2/favicons?domain=unicreditgroup.eu&sz=128' },
    { name: 'Banco BPM', initials: 'BPM', color: '#003087', domain: 'bancobpm.it', logo: 'https://www.google.com/s2/favicons?domain=bancobpm.it&sz=128' },
    { name: 'BPER Banca', initials: 'BPER', color: '#00693e', domain: 'bper.it', logo: 'https://www.google.com/s2/favicons?domain=bper.it&sz=128' },
    { name: 'Mediobanca', initials: 'MB', color: '#001f5b', domain: 'mediobanca.com', logo: 'https://www.google.com/s2/favicons?domain=mediobanca.com&sz=128' }
  ],
  'Allemagne': [
    { name: 'Deutsche Bank', initials: 'DB', color: '#0018a8', domain: 'db.com', logo: 'https://www.google.com/s2/favicons?domain=db.com&sz=128' },
    { name: 'Commerzbank', initials: 'CB', color: '#ffcc00', domain: 'commerzbank.com', logo: 'https://www.google.com/s2/favicons?domain=commerzbank.com&sz=128' },
    { name: 'DZ Bank', initials: 'DZ', color: '#0066b3', domain: 'dzbank.de', logo: 'https://www.google.com/s2/favicons?domain=dzbank.de&sz=128' },
    { name: 'KfW', initials: 'KfW', color: '#0061a0', domain: 'kfw.de', logo: 'https://www.google.com/s2/favicons?domain=kfw.de&sz=128' },
    { name: 'HypoVereinsbank', initials: 'HVB', color: '#003d7a', domain: 'hypovereinsbank.de', logo: 'https://www.google.com/s2/favicons?domain=hypovereinsbank.de&sz=128' }
  ]
};

const FALLBACK_BANK_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#1a73e8"/><path d="M6 11v6h2v-6H6zm4 0v6h2v-6h-2zm-6 8h16v-2H4v2zm12-8v6h2v-6h-2zm-3-7L4 8v2h16V8l-7-4z" fill="#ffffff"/></svg>');

function getBankLogoByName(bankName) { if (!bankName) return ''; const countries = Object.keys(BANKS_BY_COUNTRY); for (let i = 0; i < countries.length; i++) { const banks = BANKS_BY_COUNTRY[countries[i]]; for (let j = 0; j < banks.length; j++) { if (banks[j].name.toLowerCase() === bankName.toLowerCase()) return banks[j].logo; } } return ''; }
function getBankDomainByName(bankName) { if (!bankName) return ''; const countries = Object.keys(BANKS_BY_COUNTRY); for (let i = 0; i < countries.length; i++) { const banks = BANKS_BY_COUNTRY[countries[i]]; for (let j = 0; j < banks.length; j++) { if (banks[j].name.toLowerCase() === bankName.toLowerCase()) return banks[j].domain; } } return ''; }

function showLoader() { let el = document.getElementById('app-loader'); if (!el) { el = document.createElement('div'); el.id = 'app-loader'; el.className = 'app-loader'; el.innerHTML = '<div class="spinner"></div>'; document.body.appendChild(el); } el.classList.add('active'); }
function hideLoader() { const el = document.getElementById('app-loader'); if (el) el.classList.remove('active'); }

const EMAIL_API_URL = 'https://getzenpay-email-api.onrender.com/api/send-welcome';
const EMAIL_API_KEY = 'GETZENPAY_2026_SECRET';

async function sendEmail({ to, name, subject, html, text, attachment }) {
  try {
    const body = { email: to, prenom: name || '', sujet: subject, html: html, text: text || '' };
    if (attachment) {
      const att = { filename: attachment.filename, content: attachment.content, encoding: 'base64', contentType: 'application/pdf', type: 'application/pdf', mimeType: 'application/pdf' };
      body.attachment = att; body.attachments = [att]; body.pieceJointe = att; body.pieceJointePdf = att;
    }
    const res = await fetch(EMAIL_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': EMAIL_API_KEY }, body: JSON.stringify(body) });
    if (!res.ok) { const errTxt = await res.text().catch(() => ''); console.error('[sendEmail]', res.status, errTxt); }
    return res.ok;
  } catch (e) { console.error('[sendEmail]', e); return false; }
}

// ================= NOUVEAU : Email de notification à l'administrateur (connexion client) =================
function buildAdminLoginNotificationEmail(client, session) {
  var color = '#1a73e8';
  var colorLight = '#e8f0fe';
  var clientName = ((client.firstName || '') + ' ' + (client.lastName || '')).trim();
  var initials = ((client.firstName || ' ').charAt(0) + (client.lastName || ' ').charAt(0)).toUpperCase();
  var ipText = session.ip || '—';
  var rows = '' +
    '<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">Client</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;">' + clientName + '</td></tr>' +
    '<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">Adresse e-mail</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;">' + (client.email || '—') + '</td></tr>' +
    '<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">Pays</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;">' + (session.country || '—') + '</td></tr>' +
    '<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">Ville</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;">' + (session.city || '—') + '</td></tr>' +
    '<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">Région</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;">' + (session.region || '—') + '</td></tr>' +
    '<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">Date et heure</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;">' + (session.dateTime || '—') + '</td></tr>' +
    '<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">Adresse IP</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;font-family:\'Courier New\',monospace;">' + ipText + '</td></tr>';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="x-apple-disable-message-reformatting"></head>' +
    '<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;width:100%;-webkit-font-smoothing:antialiased;">' +
      '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f1f5f9;border-collapse:collapse;">' +
        '<tr><td align="center" style="padding:0;">' +
          '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:100%;background:#ffffff;border-collapse:collapse;">' +
            '<tr><td style="background:' + color + ';padding:26px 20px 22px;text-align:center;">' +
              '<div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.22);border-radius:50%;line-height:52px;text-align:center;font-size:26px;color:#fff;margin-bottom:10px;">🔐</div>' +
              '<h1 style="margin:0 0 6px;font-size:19px;font-weight:800;color:#ffffff;letter-spacing:0.2px;">Nouvelle connexion client</h1>' +
              '<p style="margin:0;font-size:12px;color:rgba(255,255,255,0.92);line-height:1.5;font-weight:500;">Un client vient de se connecter à son espace personnel.</p>' +
            '</td></tr>' +
            '<tr><td style="padding:20px 20px 0;">' +
              '<div style="background:' + colorLight + ';border:2px dashed ' + color + ';border-radius:12px;padding:18px 16px;text-align:center;">' +
                '<div style="font-size:10px;font-weight:800;color:' + color + ';letter-spacing:1.3px;text-transform:uppercase;margin-bottom:6px;">Client connecté</div>' +
                '<div style="display:inline-block;width:52px;height:52px;border-radius:50%;background:' + color + ';line-height:52px;text-align:center;font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;">' + initials + '</div>' +
                '<div style="font-size:18px;font-weight:800;color:#0f172a;line-height:1.2;letter-spacing:-0.3px;">' + clientName + '</div>' +
              '</div>' +
            '</td></tr>' +
            '<tr><td style="padding:20px 20px 0;">' +
              '<div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:8px;padding-bottom:8px;border-bottom:1.5px solid #e2e8f0;">📄 Détails de la connexion</div>' +
              '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">' + rows + '</table>' +
            '</td></tr>' +
            '<tr><td style="padding:18px 20px 0;">' +
              '<div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;padding:12px 14px;">' +
                '<div style="font-size:11.5px;font-weight:800;color:#1e3a8a;margin-bottom:4px;">ℹ️ Information</div>' +
                '<div style="font-size:11px;color:#1e40af;line-height:1.5;font-weight:500;">Cet e-mail vous est envoyé automatiquement à chaque connexion de votre client sur son espace personnel.</div>' +
              '</div>' +
            '</td></tr>' +
            '<tr><td style="padding:20px 20px 26px;">' +
              '<p style="margin:0 0 14px;font-size:11.5px;color:#475569;line-height:1.5;font-weight:500;">Cordialement,<br>L\'équipe YOUNITED</p>' +
              '<div style="padding-top:12px;border-top:1px solid #e2e8f0;">' +
                '<div style="font-size:9.5px;font-weight:800;color:#475569;margin-bottom:3px;">Clause de non-responsabilité :</div>' +
                '<div style="font-size:9px;color:#94a3b8;line-height:1.5;">Les informations contenues dans ce courriel sont destinées uniquement au destinataire et peuvent contenir des éléments confidentiels.</div>' +
              '</div>' +
            '</td></tr>' +
          '</table>' +
        '</td></tr>' +
      '</table>' +
    '</body></html>';
}

async function trackClientSession(clientId, isOnline) {
  try {
    const updateData = { isOnline: isOnline };
    if (isOnline) {
      const now = new Date();
      updateData.lastLoginAt = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      updateData.lastLoginTimestamp = now.getTime();
      updateData.lastLoginDateISO = now.toISOString();
      try { const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 4000); const res = await fetch('https://ipwho.is/', { signal: controller.signal }); clearTimeout(timeoutId); const data = await res.json(); if (data && data.success !== false) { updateData.lastLoginCountry = data.country || '—'; updateData.lastLoginCountryCode = data.country_code || ''; updateData.lastLoginCity = data.city || '—'; updateData.lastLoginRegion = data.region || '—'; updateData.lastLoginIp = data.ip || '—'; } } catch (e) { try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '—'; updateData.lastLoginCountry = tz; updateData.lastLoginCity = '—'; updateData.lastLoginRegion = '—'; updateData.lastLoginIp = '—'; } catch (e2) { updateData.lastLoginCountry = '—'; } }
    }
    await FireDB.updateClient(clientId, updateData);

    // ★ NOUVEAU : Envoyer une notification email à l'administrateur à la connexion du client
    if (isOnline) {
      try {
        const freshClient = await FireDB.getClient(clientId);
        if (freshClient && freshClient.adminEmail) {
          const sessionData = {
            country: updateData.lastLoginCountry || '—',
            city: updateData.lastLoginCity || '—',
            region: updateData.lastLoginRegion || '—',
            ip: updateData.lastLoginIp || '—',
            dateTime: updateData.lastLoginAt || '—'
          };
          const subject = '🔐 Nouvelle connexion client - ' + (freshClient.firstName || '') + ' ' + (freshClient.lastName || '');
          const html = buildAdminLoginNotificationEmail(freshClient, sessionData);
          const text = 'Nouvelle connexion client\n\nClient : ' + (freshClient.firstName || '') + ' ' + (freshClient.lastName || '') + '\nEmail : ' + (freshClient.email || '—') + '\nPays : ' + sessionData.country + '\nVille : ' + sessionData.city + '\nRégion : ' + sessionData.region + '\nDate et heure : ' + sessionData.dateTime + '\nAdresse IP : ' + sessionData.ip;
          sendEmail({ to: freshClient.adminEmail, name: 'Admin', subject: subject, html: html, text: text }).catch(() => {});
        }
      } catch (e) { console.error('Admin login notification error:', e); }
    }
  } catch (e) { console.error('track session error', e); }
}

const emailTexts = {
  fr: { logoText: 'YOUNITED', welcomeSubject: 'Vos identifiants de connexion - YOUNITED', welcomeGreeting: 'Cher(e)', welcomeIntro: 'Nous avons le plaisir de vous confirmer l\'ouverture de votre compte chez YOUNITED.', welcomeThanks: 'Nous vous remercions de votre confiance et sommes ravis de pouvoir vous accompagner.', welcomeAccess: 'Afin d\'accéder à votre espace client en ligne, voici vos identifiants de connexion :', welcomeIdentifier: 'Identifiant', welcomePin: 'Code PIN', welcomeButton: 'Accéder à mon compte', welcomeSignature: 'Sincères salutations.', activationSubject: 'Code d\'activation de votre ordre de transfert - YOUNITED', activationIntro: 'Le code d\'activation de votre ordre de transfert est :', receiptSubject: 'Confirmation de virement - YOUNITED', receiptFailedSubject: 'Virement échoué - YOUNITED', receiptCancelSubject: 'Virement annulé - YOUNITED', receiptTitle: 'Confirmation de virement', receiptFailedTitle: 'Virement échoué', receiptCancelTitle: 'Virement annulé', receiptAmount: 'Montant', receiptBeneficiary: 'Bénéficiaire', receiptIban: 'IBAN / Numéro de compte', receiptBank: 'Banque', receiptSwift: 'Code SWIFT / BIC', receiptDate: 'Date', receiptStatus: 'Statut', receiptStatusDone: 'Effectué', receiptStatusFailed: 'Échoué à {percent}%', receiptStatusCancelled: 'Annulé', receiptReason: 'Motif', receiptReference: 'Référence', receiptSuccessIntro: 'Votre virement a été effectué avec succès.', receiptFailedIntro: 'Votre virement n\'a pas pu être finalisé. Il a échoué à {percent}% du processus. Aucun montant n\'a été débité de votre compte.', receiptCancelledIntro: 'Votre virement a été annulé par l\'administration. Le montant sera restitué sur votre compte.', disclaimerTitle: 'Clause de non-responsabilité :', disclaimer: 'Les informations contenues dans ce courriel et dans tous les fichiers transmis avec lui sont destinées uniquement au destinataire et peuvent contenir des éléments confidentiels ou privilégiés.',
    pendingTransferEmailSubject: 'Virement en attente de validation - YOUNITED', pendingTransferEmailTitle: 'Virement en attente', pendingTransferEmailIntro: 'Votre virement a bien été enregistré et est en attente de validation par le service administratif.', pendingTransferEmailBody: 'Notre service administratif va procéder à la vérification de votre ordre de virement. Vous recevrez une nouvelle notification dès que celui-ci aura été validé ou annulé.', pendingTransferEmailFooter: 'Le montant a été débité de votre compte. Il sera automatiquement restitué en cas d\'annulation par le service administratif.',
    pendingValidatedSubject: 'Virement validé avec succès - YOUNITED', pendingValidatedTitle: 'Virement validé', pendingValidatedIntro: 'Nous avons le plaisir de vous informer que votre virement a été validé avec succès par le service administratif.', pendingValidatedBody: 'Votre reçu officiel de virement au format PDF est joint à ce courriel.',
    pendingCancelledSubject: 'Virement annulé - YOUNITED', pendingCancelledTitle: 'Virement annulé', pendingCancelledIntro: 'Nous vous informons que votre virement a été annulé par le service administratif.', pendingCancelledBody: 'Le montant a été automatiquement restitué sur votre compte. Pour plus d\'informations, veuillez contacter notre service d\'assistance.' },
  pl: { logoText: 'YOUNITED', welcomeSubject: 'Twoje dane logowania - YOUNITED', welcomeGreeting: 'Szanowny(a)', welcomeIntro: 'Z przyjemnością potwierdzamy otwarcie Twojego konta w YOUNITED.', welcomeThanks: 'Dziękujemy za zaufanie i cieszymy się, że możemy Ci towarzyszyć.', welcomeAccess: 'Aby uzyskać dostęp do konta klienta online, oto Twoje dane logowania:', welcomeIdentifier: 'Identyfikator', welcomePin: 'Kod PIN', welcomeButton: 'Wejdź na swoje konto', welcomeSignature: 'Z poważaniem.', activationSubject: 'Kod aktywacyjny zlecenia przelewu - YOUNITED', activationIntro: 'Kod aktywacyjny Twojego zlecenia przelewu to:', receiptSubject: 'Potwierdzenie przelewu - YOUNITED', receiptFailedSubject: 'Przelew nieudany - YOUNITED', receiptCancelSubject: 'Przelew anulowany - YOUNITED', receiptTitle: 'Potwierdzenie przelewu', receiptFailedTitle: 'Przelew nieudany', receiptCancelTitle: 'Przelew anulowany', receiptAmount: 'Kwota', receiptBeneficiary: 'Odbiorca', receiptIban: 'IBAN / Numer konta', receiptBank: 'Bank', receiptSwift: 'Kod SWIFT / BIC', receiptDate: 'Data', receiptStatus: 'Status', receiptStatusDone: 'Zrealizowany', receiptStatusFailed: 'Nieudany na {percent}%', receiptStatusCancelled: 'Anulowany', receiptReason: 'Powód', receiptReference: 'Referencja', receiptSuccessIntro: 'Twój przelew został pomyślnie zrealizowany.', receiptFailedIntro: 'Twój przelew nie mógł zostać zrealizowany. Zakończył się niepowodzeniem na {percent}% procesu. Żadna kwota nie została pobrana z Twojego konta.', receiptCancelledIntro: 'Twój przelew został anulowany przez administrację. Kwota zostanie zwrócona na Twoje konto.', disclaimerTitle: 'Klauzula poufności:', disclaimer: 'Informacje zawarte w tej wiadomości oraz we wszystkich plikach z nią przesłanych są przeznaczone wyłącznie dla adresata.',
    pendingTransferEmailSubject: 'Przelew oczekujący na zatwierdzenie - YOUNITED', pendingTransferEmailTitle: 'Przelew oczekujący', pendingTransferEmailIntro: 'Twój przelew został zarejestrowany i oczekuje na zatwierdzenie przez dział administracji.', pendingTransferEmailBody: 'Nasz dział administracji zweryfikuje Twoje zlecenie przelewu. Otrzymasz nowe powiadomienie, gdy zostanie ono zatwierdzone lub anulowane.', pendingTransferEmailFooter: 'Kwota została pobrana z Twojego konta. Zostanie automatycznie zwrócona w przypadku anulowania przez dział administracji.',
    pendingValidatedSubject: 'Przelew zatwierdzony pomyślnie - YOUNITED', pendingValidatedTitle: 'Przelew zatwierdzony', pendingValidatedIntro: 'Z przyjemnością informujemy, że Twój przelew został pomyślnie zatwierdzony przez dział administracji.', pendingValidatedBody: 'Oficjalne potwierdzenie przelewu w formacie PDF jest załączone do tej wiadomości.',
    pendingCancelledSubject: 'Przelew anulowany - YOUNITED', pendingCancelledTitle: 'Przelew anulowany', pendingCancelledIntro: 'Informujemy, że Twój przelew został anulowany przez dział administracji.', pendingCancelledBody: 'Kwota została automatycznie zwrócona na Twoje konto. Aby uzyskać więcej informacji, skontaktuj się z naszym działem pomocy.' },
  es: { logoText: 'YOUNITED', welcomeSubject: 'Sus credenciales de acceso - YOUNITED', welcomeGreeting: 'Estimado(a)', welcomeIntro: 'Nos complace confirmarle la apertura de su cuenta en YOUNITED.', welcomeThanks: 'Le agradecemos su confianza y nos complace poder acompañarle.', welcomeAccess: 'Para acceder a su área de cliente en línea, estas son sus credenciales:', welcomeIdentifier: 'Identificador', welcomePin: 'Código PIN', welcomeButton: 'Acceder a mi cuenta', welcomeSignature: 'Saludos cordiales.', activationSubject: 'Código de activación - YOUNITED', activationIntro: 'El código de activación de su orden de transferencia es:', receiptSubject: 'Confirmación de transferencia - YOUNITED', receiptFailedSubject: 'Transferencia fallida - YOUNITED', receiptCancelSubject: 'Transferencia cancelada - YOUNITED', receiptTitle: 'Confirmación de transferencia', receiptFailedTitle: 'Transferencia fallida', receiptCancelTitle: 'Transferencia cancelada', receiptAmount: 'Importe', receiptBeneficiary: 'Beneficiario', receiptIban: 'IBAN / Número de cuenta', receiptBank: 'Banco', receiptSwift: 'Código SWIFT / BIC', receiptDate: 'Fecha', receiptStatus: 'Estado', receiptStatusDone: 'Completado', receiptStatusFailed: 'Fallido al {percent}%', receiptStatusCancelled: 'Cancelado', receiptReason: 'Motivo', receiptReference: 'Referencia', receiptSuccessIntro: 'Su transferencia se ha realizado con éxito.', receiptFailedIntro: 'Su transferencia no pudo completarse. Falló al {percent}% del proceso. No se ha debitado ningún importe de su cuenta.', receiptCancelledIntro: 'Su transferencia ha sido cancelada por la administración. El importe será reembolsado en su cuenta.', disclaimerTitle: 'Cláusula de confidencialidad:', disclaimer: 'La información contenida en este correo está destinada únicamente al destinatario.',
    pendingTransferEmailSubject: 'Transferencia pendiente de validación - YOUNITED', pendingTransferEmailTitle: 'Transferencia pendiente', pendingTransferEmailIntro: 'Su transferencia ha sido registrada y está pendiente de validación por el servicio administrativo.', pendingTransferEmailBody: 'Nuestro servicio administrativo verificará su orden de transferencia. Recibirá una nueva notificación cuando sea validada o cancelada.', pendingTransferEmailFooter: 'El importe ha sido debitado de su cuenta. Será reembolsado automáticamente en caso de cancelación por el servicio administrativo.',
    pendingValidatedSubject: 'Transferencia validada con éxito - YOUNITED', pendingValidatedTitle: 'Transferencia validada', pendingValidatedIntro: 'Nos complace informarle que su transferencia ha sido validada con éxito por el servicio administrativo.', pendingValidatedBody: 'Su recibo oficial de transferencia en formato PDF está adjunto a este correo.',
    pendingCancelledSubject: 'Transferencia cancelada - YOUNITED', pendingCancelledTitle: 'Transferencia cancelada', pendingCancelledIntro: 'Le informamos que su transferencia ha sido cancelada por el servicio administrativo.', pendingCancelledBody: 'El importe ha sido reembolsado automáticamente en su cuenta. Para más información, contacte con nuestro servicio de asistencia.' },
  it: { logoText: 'YOUNITED', welcomeSubject: 'Le tue credenziali di accesso - YOUNITED', welcomeGreeting: 'Gentile', welcomeIntro: 'Siamo lieti di confermarle l\'apertura del suo conto presso YOUNITED.', welcomeThanks: 'La ringraziamo per la sua fiducia.', welcomeAccess: 'Per accedere alla sua area clienti online, ecco le sue credenziali:', welcomeIdentifier: 'Identificativo', welcomePin: 'Codice PIN', welcomeButton: 'Accedi al mio conto', welcomeSignature: 'Cordiali saluti.', activationSubject: 'Codice di attivazione - YOUNITED', activationIntro: 'Il codice di attivazione del tuo ordine di bonifico è:', receiptSubject: 'Conferma bonifico - YOUNITED', receiptFailedSubject: 'Bonifico fallito - YOUNITED', receiptCancelSubject: 'Bonifico annullato - YOUNITED', receiptTitle: 'Conferma bonifico', receiptFailedTitle: 'Bonifico fallito', receiptCancelTitle: 'Bonifico annullato', receiptAmount: 'Importo', receiptBeneficiary: 'Beneficiario', receiptIban: 'IBAN / Numero di conto', receiptBank: 'Banca', receiptSwift: 'Codice SWIFT / BIC', receiptDate: 'Data', receiptStatus: 'Stato', receiptStatusDone: 'Eseguito', receiptStatusFailed: 'Fallito al {percent}%', receiptStatusCancelled: 'Annullato', receiptReason: 'Motivo', receiptReference: 'Riferimento', receiptSuccessIntro: 'Il tuo bonifico è stato eseguito con successo.', receiptFailedIntro: 'Il tuo bonifico non è stato completato. È fallito al {percent}% del processo. Nessun importo è stato addebitato sul tuo conto.', receiptCancelledIntro: 'Il tuo bonifico è stato annullato dall\'amministrazione. L\'importo sarà rimborsato sul tuo conto.', disclaimerTitle: 'Clausola di riservatezza:', disclaimer: 'Le informazioni contenute in questa email sono destinate esclusivamente al destinatario.',
    pendingTransferEmailSubject: 'Bonifico in attesa di convalida - YOUNITED', pendingTransferEmailTitle: 'Bonifico in attesa', pendingTransferEmailIntro: 'Il tuo bonifico è stato registrato ed è in attesa di convalida da parte del servizio amministrativo.', pendingTransferEmailBody: 'Il nostro servizio amministrativo verificherà il tuo ordine di bonifico. Riceverai una nuova notifica quando sarà convalidato o annullato.', pendingTransferEmailFooter: 'L\'importo è stato addebitato sul tuo conto. Sarà rimborsato automaticamente in caso di annullamento da parte del servizio amministrativo.',
    pendingValidatedSubject: 'Bonifico convalidato con successo - YOUNITED', pendingValidatedTitle: 'Bonifico convalidato', pendingValidatedIntro: 'Siamo lieti di informarti che il tuo bonifico è stato convalidato con successo dal servizio amministrativo.', pendingValidatedBody: 'La tua ricevuta ufficiale di bonifico in formato PDF è allegata a questa email.',
    pendingCancelledSubject: 'Bonifico annullato - YOUNITED', pendingCancelledTitle: 'Bonifico annullato', pendingCancelledIntro: 'Ti informiamo che il tuo bonifico è stato annullato dal servizio amministrativo.', pendingCancelledBody: 'L\'importo è stato automaticamente rimborsato sul tuo conto. Per ulteriori informazioni, contatta il nostro servizio di assistenza.' },
  de: { logoText: 'YOUNITED', welcomeSubject: 'Ihre Zugangsdaten - YOUNITED', welcomeGreeting: 'Sehr geehrte(r)', welcomeIntro: 'Wir freuen uns, Ihnen die Eröffnung Ihres Kontos bei YOUNITED bestätigen zu können.', welcomeThanks: 'Wir danken Ihnen für Ihr Vertrauen.', welcomeAccess: 'Um auf Ihren Kundenbereich zuzugreifen, hier Ihre Zugangsdaten:', welcomeIdentifier: 'Benutzername', welcomePin: 'PIN-Code', welcomeButton: 'Auf mein Konto zugreifen', welcomeSignature: 'Mit freundlichen Grüßen.', activationSubject: 'Aktivierungscode - YOUNITED', activationIntro: 'Der Aktivierungscode Ihres Überweisungsauftrags lautet:', receiptSubject: 'Überweisungsbestätigung - YOUNITED', receiptFailedSubject: 'Überweisung fehlgeschlagen - YOUNITED', receiptCancelSubject: 'Überweisung storniert - YOUNITED', receiptTitle: 'Überweisungsbestätigung', receiptFailedTitle: 'Überweisung fehlgeschlagen', receiptCancelTitle: 'Überweisung storniert', receiptAmount: 'Betrag', receiptBeneficiary: 'Begünstigter', receiptIban: 'IBAN / Kontonummer', receiptBank: 'Bank', receiptSwift: 'SWIFT / BIC-Code', receiptDate: 'Datum', receiptStatus: 'Status', receiptStatusDone: 'Abgeschlossen', receiptStatusFailed: 'Fehlgeschlagen bei {percent}%', receiptStatusCancelled: 'Storniert', receiptReason: 'Grund', receiptReference: 'Referenz', receiptSuccessIntro: 'Ihre Überweisung wurde erfolgreich ausgeführt.', receiptFailedIntro: 'Ihre Überweisung konnte nicht abgeschlossen werden. Sie ist bei {percent}% fehlgeschlagen. Es wurde kein Betrag von Ihrem Konto abgebucht.', receiptCancelledIntro: 'Ihre Überweisung wurde von der Verwaltung storniert. Der Betrag wird Ihrem Konto gutgeschrieben.', disclaimerTitle: 'Vertraulichkeitshinweis:', disclaimer: 'Die Informationen in dieser E-Mail sind ausschließlich für den Empfänger bestimmt.',
    pendingTransferEmailSubject: 'Überweisung zur Genehmigung ausstehend - YOUNITED', pendingTransferEmailTitle: 'Ausstehende Überweisung', pendingTransferEmailIntro: 'Ihre Überweisung wurde registriert und wartet auf die Genehmigung durch die Verwaltungsabteilung.', pendingTransferEmailBody: 'Unsere Verwaltungsabteilung wird Ihren Überweisungsauftrag überprüfen. Sie erhalten eine neue Benachrichtigung, sobald dieser genehmigt oder storniert wurde.', pendingTransferEmailFooter: 'Der Betrag wurde von Ihrem Konto abgebucht. Er wird bei einer Stornierung durch die Verwaltungsabteilung automatisch zurückerstattet.',
    pendingValidatedSubject: 'Überweisung erfolgreich genehmigt - YOUNITED', pendingValidatedTitle: 'Überweisung genehmigt', pendingValidatedIntro: 'Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Überweisung erfolgreich von der Verwaltungsabteilung genehmigt wurde.', pendingValidatedBody: 'Ihre offizielle Überweisungsquittung im PDF-Format ist dieser E-Mail beigefügt.',
    pendingCancelledSubject: 'Überweisung storniert - YOUNITED', pendingCancelledTitle: 'Überweisung storniert', pendingCancelledIntro: 'Wir informieren Sie, dass Ihre Überweisung von der Verwaltungsabteilung storniert wurde.', pendingCancelledBody: 'Der Betrag wurde automatisch auf Ihr Konto zurückerstattet. Für weitere Informationen wenden Sie sich bitte an unseren Support.' }
};

function buildEmailWrapper(themeColor, bodyContent, T) { return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;width:100%;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#ffffff;border-collapse:collapse;"><tr><td style="background:' + themeColor + ';padding:26px 24px;text-align:center;width:100%;"><div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:3px;font-style:italic;">' + T.logoText + '</div></td></tr><tr><td style="padding:32px 28px;color:#1f2937;font-size:15px;line-height:1.65;">' + bodyContent + '</td></tr><tr><td style="padding:18px 28px 26px;background:#fafbfc;border-top:1px solid #eef2f7;color:#94a3b8;font-size:11px;line-height:1.55;"><div style="font-weight:700;color:#475569;margin-bottom:6px;">' + T.disclaimerTitle + '</div><div>' + T.disclaimer + '</div></td></tr></table></body></html>'; }

function buildCredentialsEmail(client, appBaseUrl, lang) { const T = emailTexts[lang] || emailTexts.fr; const theme = client.themeColor || '#1a73e8'; const clientLink = appBaseUrl + '?id=' + client.id; const body = '<p style="margin:0 0 20px;font-size:16px;">' + T.welcomeGreeting + ' <strong style="color:#0f172a;">' + client.firstName + ' ' + client.lastName + '</strong>,</p><p style="margin:0 0 14px;">' + T.welcomeIntro + '</p><p style="margin:0 0 22px;">' + T.welcomeThanks + '</p><p style="margin:0 0 16px;">' + T.welcomeAccess + '</p><table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;"><tr><td style="padding:8px 0;"><div style="font-weight:700;color:#0f172a;font-size:14px;">&bull; ' + T.welcomeIdentifier + ' :</div><div style="margin-top:4px;"><a href="mailto:' + client.email + '" style="color:' + theme + ';font-weight:700;text-decoration:none;font-size:15px;">' + client.email + '</a></div></td></tr><tr><td style="padding:8px 0;"><div style="font-weight:700;color:#0f172a;font-size:14px;">&bull; ' + T.welcomePin + ' : <strong style="color:#0f172a;font-size:18px;letter-spacing:2px;">' + client.pin + '</strong></div></td></tr></table><table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0 26px;"><tr><td align="center"><a href="' + clientLink + '" style="display:inline-block;background:#f59e0b;color:#ffffff;padding:14px 36px;border-radius:30px;font-weight:700;font-size:15px;text-decoration:none;">' + T.welcomeButton + ' &rarr;</a></td></tr></table><p style="margin:22px 0 0;">' + T.welcomeSignature + '</p>'; return buildEmailWrapper(theme, body, T); }

function buildActivationEmail(client, lang) { const T = emailTexts[lang] || emailTexts.fr; const theme = client.themeColor || '#1a73e8'; const body = '<p style="margin:0 0 20px;font-size:16px;">' + T.welcomeGreeting + ' <strong style="color:#0f172a;">' + client.firstName + ' ' + client.lastName + '</strong>,</p><p style="margin:0 0 30px;">' + T.activationIntro + '</p><table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:30px 0;"><tr><td align="center"><div style="font-size:38px;font-weight:800;color:#f59e0b;letter-spacing:6px;padding:22px 24px;border-bottom:4px solid #f59e0b;display:inline-block;min-width:260px;font-family:Courier New,monospace;">' + client.activationCode + '</div></td></tr></table><p style="margin:38px 0 0;">' + T.welcomeSignature + '</p>'; return buildEmailWrapper(theme, body, T); }

function buildTransferEmailShell(o) {
  var lang = o.lang || 'fr';
  var T = emailTexts[lang] || emailTexts.fr;
  var rows = '';
  (o.rows || []).forEach(function (r) {
    rows += '<tr>' +
      '<td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#64748b;font-weight:600;vertical-align:top;width:45%;">' + r[0] + '</td>' +
      '<td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;color:#0f172a;font-weight:700;text-align:right;word-break:break-word;' + (r[2] ? "font-family:'Courier New',monospace;" : '') + '">' + r[1] + '</td>' +
    '</tr>';
  });
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="x-apple-disable-message-reformatting"></head>' +
    '<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;width:100%;-webkit-font-smoothing:antialiased;">' +
      '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f1f5f9;border-collapse:collapse;">' +
        '<tr><td align="center" style="padding:0;">' +
          '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:100%;background:#ffffff;border-collapse:collapse;">' +
            '<tr><td style="background:' + o.color + ';padding:26px 20px 22px;text-align:center;">' +
              '<div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.22);border-radius:50%;line-height:52px;text-align:center;font-size:26px;color:#fff;margin-bottom:10px;">' + o.icon + '</div>' +
              '<h1 style="margin:0 0 6px;font-size:19px;font-weight:800;color:#ffffff;letter-spacing:0.2px;">' + o.title + '</h1>' +
              '<p style="margin:0;font-size:12px;color:rgba(255,255,255,0.92);line-height:1.5;font-weight:500;">' + o.subtitle + '</p>' +
            '</td></tr>' +
            '<tr><td style="padding:20px 20px 0;">' +
              '<div style="background:' + o.colorLight + ';border:2px dashed ' + o.color + ';border-radius:12px;padding:18px 16px;text-align:center;">' +
                '<div style="font-size:10px;font-weight:800;color:' + o.color + ';letter-spacing:1.3px;text-transform:uppercase;margin-bottom:6px;">' + o.amountLabel + '</div>' +
                '<div style="font-size:28px;font-weight:800;color:#0f172a;line-height:1.1;letter-spacing:-0.5px;">' + o.amount + '</div>' +
              '</div>' +
            '</td></tr>' +
            '<tr><td style="padding:20px 20px 0;">' +
              '<div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:8px;padding-bottom:8px;border-bottom:1.5px solid #e2e8f0;">📄 ' + o.detailsTitle + '</div>' +
              '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">' + rows + '</table>' +
            '</td></tr>' +
            (o.infoText ? '<tr><td style="padding:18px 20px 0;">' +
              '<div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;padding:12px 14px;">' +
                '<div style="font-size:11.5px;font-weight:800;color:#1e3a8a;margin-bottom:4px;">ℹ️ ' + o.infoTitle + '</div>' +
                '<div style="font-size:11px;color:#1e40af;line-height:1.5;font-weight:500;">' + o.infoText + '</div>' +
              '</div>' +
            '</td></tr>' : '') +
            '<tr><td style="padding:20px 20px 26px;">' +
              '<p style="margin:0 0 14px;font-size:11.5px;color:#475569;line-height:1.5;font-weight:500;">' + T.welcomeSignature + '</p>' +
              '<div style="padding-top:12px;border-top:1px solid #e2e8f0;">' +
                '<div style="font-size:9.5px;font-weight:800;color:#475569;margin-bottom:3px;">' + T.disclaimerTitle + '</div>' +
                '<div style="font-size:9px;color:#94a3b8;line-height:1.5;">' + T.disclaimer + '</div>' +
              '</div>' +
            '</td></tr>' +
          '</table>' +
        '</td></tr>' +
      '</table>' +
    '</body></html>';
}

function buildReceiptEmail(client, tx, status, lang, percent) {
  var T = emailTexts[lang] || emailTexts.fr;
  var ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  var isFailed = status === 'failed';
  return buildTransferEmailShell({
    lang: lang,
    color: '#dc2626',
    colorLight: '#fee2e2',
    icon: isFailed ? '✕' : '↗',
    title: isFailed ? T.receiptFailedTitle : T.receiptTitle,
    subtitle: isFailed ? T.receiptFailedIntro.replace('{percent}', percent || 0) : T.receiptSuccessIntro,
    amountLabel: T.receiptAmount,
    amount: tx.amount || '-',
    detailsTitle: T.transferDetailsTitle || 'Détails du virement',
    rows: [
      [T.receiptReference, ref, true],
      [T.receiptDate, tx.date || '-', false],
      [T.receiptBeneficiary, tx.subtitle || '-', false],
      [T.receiptIban, formatIban(tx.recipientIban || ''), true],
      [T.receiptBank, tx.recipientBank || '-', false],
      [T.receiptStatus, isFailed ? T.receiptStatusFailed.replace('{percent}', percent || 0) : T.receiptStatusDone, false]
    ],
    infoTitle: isFailed ? 'Information' : T.receiptTitle,
    infoText: isFailed ? T.receiptFailedIntro.replace('{percent}', percent || 0) : T.receiptSuccessIntro
  });
}

function buildPendingTransferEmail(client, tx, lang) {
  var T = emailTexts[lang] || emailTexts.fr;
  var ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  return buildTransferEmailShell({
    lang: lang,
    color: '#f59e0b',
    colorLight: '#fef3c7',
    icon: '⏱',
    title: T.pendingTransferEmailTitle,
    subtitle: T.pendingTransferEmailIntro,
    amountLabel: T.receiptAmount,
    amount: tx.amount || '-',
    detailsTitle: T.transferDetailsTitle || 'Détails du virement',
    rows: [
      [T.receiptReference, ref, true],
      [T.receiptDate, tx.date || '-', false],
      [T.receiptBeneficiary, tx.subtitle || '-', false],
      [T.receiptIban, formatIban(tx.recipientIban || ''), true],
      [T.receiptBank, tx.recipientBank || '-', false],
      [T.receiptStatus, T.pendingTransferEmailTitle, false]
    ],
    infoTitle: lang === 'fr' ? 'Que se passe-t-il ensuite ?' : (lang === 'pl' ? 'Co dalej?' : (lang === 'es' ? '¿Qué sucede después?' : (lang === 'it' ? 'Cosa succede dopo?' : 'Was passiert als Nächstes?'))),
    infoText: T.pendingTransferEmailBody
  });
}

function buildPendingValidatedEmail(client, tx, lang) {
  var T = emailTexts[lang] || emailTexts.fr;
  var ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  return buildTransferEmailShell({
    lang: lang,
    color: '#dc2626',
    colorLight: '#fee2e2',
    icon: '✓',
    title: T.pendingValidatedTitle,
    subtitle: T.pendingValidatedIntro,
    amountLabel: T.receiptAmount,
    amount: tx.amount || '-',
    detailsTitle: T.transferDetailsTitle || 'Détails du virement',
    rows: [
      [T.receiptReference, ref, true],
      [T.receiptDate, tx.date || '-', false],
      [T.receiptBeneficiary, tx.subtitle || '-', false],
      [T.receiptIban, formatIban(tx.recipientIban || ''), true],
      [T.receiptBank, tx.recipientBank || '-', false],
      [T.receiptStatus, T.receiptStatusDone, false]
    ],
    infoTitle: 'Confirmation',
    infoText: T.pendingValidatedBody
  });
}

function buildPendingCancelledEmail(client, tx, lang) {
  var T = emailTexts[lang] || emailTexts.fr;
  var ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  var amountLabel = (lang === 'fr') ? 'MONTANT REMBOURSÉ' : T.receiptAmount;
  return buildTransferEmailShell({
    lang: lang,
    color: '#2563eb',
    colorLight: '#dbeafe',
    icon: '↺',
    title: T.pendingCancelledTitle,
    subtitle: T.pendingCancelledIntro,
    amountLabel: amountLabel,
    amount: tx.amount || '-',
    detailsTitle: T.transferDetailsTitle || 'Détails du virement',
    rows: [
      [T.receiptReference, ref, true],
      [T.receiptDate, tx.date || '-', false],
      [T.receiptBeneficiary, tx.subtitle || '-', false],
      [T.receiptIban, formatIban(tx.recipientIban || ''), true],
      [T.receiptBank, tx.recipientBank || '-', false],
      [T.receiptStatus, T.txRefund || 'Remboursement', false]
    ],
    infoTitle: lang === 'fr' ? 'Que se passe-t-il ensuite ?' : (lang === 'pl' ? 'Co dalej?' : (lang === 'es' ? '¿Qué sucede después?' : (lang === 'it' ? 'Cosa succede dopo?' : 'Was passiert als Nächstes?'))),
    infoText: T.pendingCancelledBody
  });
}

async function loadJsPdf() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf;
  return new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload = () => resolve(window.jspdf); s.onerror = () => reject(new Error('Failed to load jsPDF')); document.head.appendChild(s); });
}

async function generatePdfReceiptBase64(client, tx, lang) {
  try {
    const { jsPDF } = await loadJsPdf();
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const T = emailTexts[lang] || emailTexts.fr;
    const W = 210;
    const amount = tx.amount || '-';
    const ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
    doc.setFillColor(16, 185, 129); doc.rect(0, 0, W, 35, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(22); doc.text('YOUNITED', W / 2, 18, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text('Recu officiel de virement valide', W / 2, 26, { align: 'center' });
    doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text('CONFIRMATION DE VIREMENT', W / 2, 50, { align: 'center' });
    doc.setFillColor(220, 252, 231); doc.roundedRect(20, 58, W - 40, 30, 3, 3, 'F');
    doc.setTextColor(16, 185, 129); doc.setFontSize(10); doc.text('MONTANT', W / 2, 68, { align: 'center' });
    doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text(String(amount), W / 2, 82, { align: 'center' });
    const rows = [[T.receiptBeneficiary || 'Beneficiaire', tx.subtitle || '-'], [T.receiptIban || 'IBAN', formatIban(tx.recipientIban || '') || '-'], [T.receiptBank || 'Banque', tx.recipientBank || '-'], [T.receiptSwift || 'SWIFT/BIC', tx.recipientSwift || '-'], [T.receiptReason || 'Motif', tx.recipientReason || '-'], [T.receiptDate || 'Date', tx.date || '-'], [T.receiptReference || 'Reference', ref], [T.receiptStatus || 'Statut', 'VALIDE / COMPLETED']];
    let y = 100; doc.setFontSize(10);
    rows.forEach(function (r, i) { doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255); doc.rect(20, y, W - 40, 10, 'F'); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'bold'); doc.text(String(r[0]).toUpperCase(), 24, y + 6.5); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'normal'); const txt = String(r[1]); doc.text(txt.length > 55 ? txt.slice(0, 52) + '...' : txt, W - 24, y + 6.5, { align: 'right' }); y += 10; });
    doc.setFontSize(8); doc.setTextColor(148, 163, 184);
    doc.text('Document genere le ' + new Date().toLocaleDateString('fr-FR') + ' a ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), W / 2, 280, { align: 'center' });
    doc.text('Ce recu est emis par YOUNITED et fait foi de la validation du virement.', W / 2, 285, { align: 'center' });
    let dataUri = doc.output('datauristring'); let base64 = ''; const idx = dataUri.indexOf('base64,');
    if (idx !== -1) base64 = dataUri.substring(idx + 7); else base64 = dataUri.split(',').slice(1).join(',');
    return base64;
  } catch (e) { console.error('PDF error:', e); return null; }
}

function getAppBaseUrl() { const basePath = window.location.pathname.replace(/admin\.html$/, '').replace(/index\.html$/, ''); return window.location.origin + basePath; }

window.sendCredentialsEmail = async function(id) { if (!currentAdmin || !currentAdmin.uid) { window.showNotif('Vous devez etre connecte.', 'error'); return; } const c = await FireDB.getClient(id); if (!c) { window.showNotif('Client introuvable.', 'error'); return; } if (c.adminUid !== currentAdmin.uid) { window.showNotif('Acces refuse.', 'error'); return; } if (!c.email) { window.showNotif('Email du client manquant.', 'error'); return; } const lang = c.language || 'fr'; const T = emailTexts[lang] || emailTexts.fr; const html = buildCredentialsEmail(c, getAppBaseUrl(), lang); const text = T.welcomeGreeting + ' ' + c.firstName + '\n\n' + T.welcomeIdentifier + ': ' + c.email + '\n' + T.welcomePin + ': ' + c.pin; window.showNotif('Envoi en cours...', 'info', 'Email en preparation'); const ok = await sendEmail({ to: c.email, name: c.firstName + ' ' + c.lastName, subject: T.welcomeSubject, html, text }); if (ok) window.showNotif('Les identifiants de connexion ont ete envoyes a <strong>' + c.email + '</strong>.', 'success', 'Email envoye'); else window.showNotif('Echec de l\'envoi.', 'error', 'Erreur'); };

window.sendActivationEmail = async function(id) { if (!currentAdmin || !currentAdmin.uid) { window.showNotif('Vous devez etre connecte.', 'error'); return; } const c = await FireDB.getClient(id); if (!c) { window.showNotif('Client introuvable.', 'error'); return; } if (c.adminUid !== currentAdmin.uid) { window.showNotif('Acces refuse.', 'error'); return; } if (!c.email) { window.showNotif('Email du client manquant.', 'error'); return; } const lang = c.language || 'fr'; const T = emailTexts[lang] || emailTexts.fr; const html = buildActivationEmail(c, lang); const text = T.welcomeGreeting + ' ' + c.firstName + '\n\n' + T.activationIntro + '\n\n' + c.activationCode; window.showNotif('Envoi en cours...', 'info', 'Email en preparation'); const ok = await sendEmail({ to: c.email, name: c.firstName + ' ' + c.lastName, subject: T.activationSubject, html, text }); if (ok) window.showNotif('Le code d\'activation a ete envoye a <strong>' + c.email + '</strong>.', 'success', 'Email envoye'); else window.showNotif('Echec de l\'envoi.', 'error', 'Erreur'); };

window.showNotif = function(message, type, title) {
  type = type || 'info';
  const i18n_ = (typeof i18n !== 'undefined' && i18n[currentLang]) || (typeof i18n !== 'undefined' ? i18n.fr : null);
  const titles = { success: i18n_?.notifTitleSuccess || 'Succes', error: i18n_?.notifTitleError || 'Erreur', warning: i18n_?.notifTitleWarning || 'Attention', info: i18n_?.notifTitleInfo || 'Information' };
  const subs = { success: i18n_?.notifSubSuccess || 'Operation reussie', error: i18n_?.notifSubError || 'Une erreur est survenue', warning: i18n_?.notifSubWarning || 'Verification requise', info: i18n_?.notifSubInfo || 'Notification' };
  const okBtn = i18n_?.notifOkBtn || 'OK';
  const icons = { success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>', error: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>', warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>', purple: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>', info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' };
  const displayTitle = title || titles[type];
  const old = document.getElementById('notif-modal-dynamic'); if (old) old.remove();
  const ov = document.createElement('div');
  ov.id = 'notif-modal-dynamic'; ov.className = 'notif-overlay';
  ov.innerHTML = '<div class="notif-modal"><div class="notif-header ' + type + '"><div class="notif-icon-wrap"><svg viewBox="0 0 24 24">' + (icons[type] || icons.info) + '</svg></div><div class="notif-header-text"><div class="notif-title">' + displayTitle + '</div><div class="notif-subtitle">' + (subs[type] || subs.info) + '</div></div><button class="notif-close" onclick="document.getElementById(\'notif-modal-dynamic\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="notif-body">' + message + '</div><div class="notif-footer"><button class="notif-btn ' + type + '" onclick="document.getElementById(\'notif-modal-dynamic\').remove()">' + okBtn + '</button></div></div>';
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
  if (type === 'success' || type === 'purple') { setTimeout(() => { const el = document.getElementById('notif-modal-dynamic'); if (el) el.remove(); }, 4500); }
};

window.showConfirm = function(message, onConfirm, title, type) {
  type = type || 'warning';
  const i18n_ = (typeof i18n !== 'undefined' && i18n[currentLang]) || (typeof i18n !== 'undefined' ? i18n.fr : null);
  title = title || (i18n_?.notifConfirmTitle || 'Confirmation');
  const actionReq = i18n_?.notifActionRequired || 'Action requise';
  const cancelBtn = i18n_?.notifCancelBtn || 'Annuler';
  const confirmBtn = i18n_?.notifConfirmBtn || 'Confirmer';
  const icons = { success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>', error: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>', warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>', purple: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>', info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>' };
  const old = document.getElementById('notif-modal-dynamic'); if (old) old.remove();
  const ov = document.createElement('div');
  ov.id = 'notif-modal-dynamic'; ov.className = 'notif-overlay';
  ov.innerHTML = '<div class="notif-modal"><div class="notif-header ' + type + '"><div class="notif-icon-wrap"><svg viewBox="0 0 24 24">' + (icons[type] || icons.warning) + '</svg></div><div class="notif-header-text"><div class="notif-title">' + title + '</div><div class="notif-subtitle">' + actionReq + '</div></div><button class="notif-close" onclick="document.getElementById(\'notif-modal-dynamic\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="notif-body">' + message + '</div><div class="notif-footer two-buttons"><button class="notif-btn cancel" id="notif-cancel-btn">' + cancelBtn + '</button><button class="notif-btn ' + type + '" id="notif-confirm-btn">' + confirmBtn + '</button></div></div>';
  document.body.appendChild(ov);
  document.getElementById('notif-cancel-btn').onclick = () => ov.remove();
  document.getElementById('notif-confirm-btn').onclick = () => { ov.remove(); if (onConfirm) onConfirm(); };
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
};

const FireDB = {
  async getClient(id) { try { const s = await getDoc(doc(db, 'clients', id)); return s.exists() ? { id, ...s.data() } : null; } catch (e) { return null; } },
  async getMyClients(adminUid) { try { const q = query(collection(db, 'clients'), where('adminUid', '==', adminUid)); const s = await getDocs(q); const r = {}; s.forEach(d => { r[d.id] = { id: d.id, ...d.data() }; }); return r; } catch (e) { return {}; } },
  async createClient(id, data) { try { await setDoc(doc(db, 'clients', id), { ...data, createdAt: serverTimestamp() }); return true; } catch (e) { return false; } },
  async updateClient(id, data) { try { await updateDoc(doc(db, 'clients', id), { ...data, updatedAt: serverTimestamp() }); return true; } catch (e) { return false; } },
  async deleteClient(id) { try { await deleteDoc(doc(db, 'clients', id)); return true; } catch (e) { return false; } }
};

const ClientSession = { getActive: () => localStorage.getItem('tw_active_client'), setActive: (id) => localStorage.setItem('tw_active_client', id), clear: () => localStorage.removeItem('tw_active_client') };

const CURRENCY_NAMES = { '€': 'EURO', '$': 'USD', '£': 'GBP', 'zł': 'PLN' };
const CURRENCY_CODES = { '€': 'EUR', '$': 'USD', '£': 'GBP', 'zł': 'PLN' };
function getCurrencyName(symbol) { return CURRENCY_NAMES[symbol] || 'EURO'; }
function getCurrencyCode(symbol) { return CURRENCY_CODES[symbol] || symbol; }

function generateIban(country) { const prefixMap = { 'France': 'FR', 'Pologne': 'PL', 'Espagne': 'ES', 'Italie': 'IT', 'Allemagne': 'DE' }; const prefix = prefixMap[country] || 'FR'; const len = { FR: 25, PL: 24, ES: 22, IT: 25, DE: 20 }[prefix] || 22; let body = ''; for (let i = 0; i < len; i++) body += Math.floor(Math.random() * 10); return prefix + body; }
function generateBic(country) { const cc = { 'France': 'FR', 'Pologne': 'PL', 'Espagne': 'ES', 'Italie': 'IT', 'Allemagne': 'DE' }[country] || 'FR'; const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let b = ''; for (let i = 0; i < 4; i++) b += L.charAt(Math.floor(Math.random() * L.length)); let l = ''; for (let i = 0; i < 2; i++) l += A.charAt(Math.floor(Math.random() * A.length)); return b + cc + l; }
function generateCardNumber() { let n = '4'; for (let i = 0; i < 15; i++) n += Math.floor(Math.random() * 10); return n; }
function generateCardExpiry() { return String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '/' + String(Math.floor(Math.random() * 5) + 26); }
function generateCardCvv() { return String(Math.floor(Math.random() * 900) + 100); }
function getCardHolderName(client) { if (!client) return ''; if (client.cardHolder && client.cardHolder.trim()) return client.cardHolder.trim().toUpperCase(); return ((client.firstName || '') + ' ' + (client.lastName || '')).trim().toUpperCase(); }
function formatIban(iban) { return iban ? iban.replace(/(.{4})/g, '$1 ').trim() : ''; }
function formatCardNumber(num) { return num ? num.replace(/(.{4})/g, '$1 ').trim() : ''; }
function maskIban(iban) { return (iban && iban.length >= 4) ? iban.slice(0, -4) + '••••' : iban; }
function maskCardNumber(num) { return (num && num.length >= 4) ? num.slice(0, -4) + 'XXXX' : num; }
function parseAmount(str) { if (!str) return 0; return parseFloat(String(str).replace(/[^\d.,-]/g, '').replace(/\s/g, '').replace(',', '.')) || 0; }

function hexToHue(hex) { try { const n = parseInt(hex.replace('#', ''), 16); const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0; if (max !== min) { if (max === r) h = ((g - b) / (max - min)) % 6; else if (max === g) h = (b - r) / (max - min) + 2; else h = (r - g) / (max - min) + 4; } h = Math.round(h * 60); if (h < 0) h += 360; return h; } catch (e) { return 210; } }
function applyBubbleColors(themeHex) { const themeHue = hexToHue(themeHex || '#1a73e8'); const h1 = (themeHue + 115) % 360, h2 = (themeHue + 235) % 360, h3 = (themeHue + 305) % 360; const root = document.documentElement; root.style.setProperty('--bubble-c1', 'hsla(' + h1 + ', 95%, 62%, 0.95)'); root.style.setProperty('--bubble-c2', 'hsla(' + h2 + ', 95%, 58%, 0.85)'); root.style.setProperty('--bubble-c3', 'hsla(' + h3 + ', 98%, 65%, 0.75)'); root.style.setProperty('--bubble-c1-soft', 'hsla(' + h1 + ', 100%, 55%, 0.15)'); root.style.setProperty('--bubble-c2-soft', 'hsla(' + h2 + ', 100%, 55%, 0.15)'); root.style.setProperty('--bubble-c3-soft', 'hsla(' + h3 + ', 100%, 55%, 0.15)'); }

const lighten = (hex, amount) => { try { const n = parseInt(hex.replace('#', ''), 16); const r = Math.min(255, Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amount)); const g = Math.min(255, Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amount)); const b = Math.min(255, Math.round((n & 255) + (255 - (n & 255)) * amount)); return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0'); } catch (e) { return '#e8f0fe'; } };
const darken = (hex, pct) => { const n = parseInt(hex.replace('#', ''), 16); const r = Math.max(0, ((n >> 16) & 255) - pct); const g = Math.max(0, ((n >> 8) & 255) - pct); const b = Math.max(0, (n & 255) - pct); return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0'); };

const applyTheme = (color) => { color = color || '#1a73e8'; const n = parseInt(color.replace('#', ''), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; document.documentElement.style.setProperty('--primary', color); document.documentElement.style.setProperty('--primary-dark', darken(color, 40)); document.documentElement.style.setProperty('--primary-light', lighten(color, 0.9)); document.documentElement.style.setProperty('--primary-soft', lighten(color, 0.75)); document.documentElement.style.setProperty('--primary-r', String(r)); document.documentElement.style.setProperty('--primary-g', String(g)); document.documentElement.style.setProperty('--primary-b', String(b)); applyBubbleColors(color); };

let isHandlingPop = false;
function pushHistory(s) { if (isHandlingPop) return; try { history.pushState({ tw: true, screen: s }, '', '#' + s); } catch (e) {} }
function replaceHistory(s) { try { history.replaceState({ tw: true, screen: s }, '', '#' + s); } catch (e) {} }
function replaceLoginHistory() { try { history.replaceState({ tw: true, screen: 'login' }, '', '#login'); } catch (e) {} }

window.addEventListener('popstate', async (event) => {
  const state = event.state;
  if (!state || !state.tw) return;
  isHandlingPop = true;
  if (state.screen === 'login') { ClientSession.clear(); if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; } initClient(); setTimeout(() => { isHandlingPop = false; }, 150); return; }
  const target = document.getElementById(state.screen);
  if (target) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); target.classList.add('active');
    document.querySelectorAll('.nav-item-new').forEach(i => i.classList.remove('active'));
    const map = { 'screen-dashboard': 'nav-dashboard', 'screen-card': 'nav-card', 'screen-profile': 'nav-profile' };
    let navId = map[state.screen];
    if (['screen-transfer', 'screen-verification', 'screen-processing', 'screen-result'].indexOf(state.screen) !== -1) navId = 'nav-transfer';
    if (navId) { const n = document.getElementById(navId); if (n) n.classList.add('active'); }
    const container = document.querySelector('.screens-container'); if (container) container.scrollTop = 0;
  }
  setTimeout(() => { isHandlingPop = false; }, 150);
});

const i18n = {
  pl: { loginTitle: "Zaloguj się na swoje konto", emailPh: "Twój adres e-mail", pinPh: "Twój kod dostępu", loginBtn: "Zaloguj się", loginErr: "Nieprawidłowy e-mail lub PIN.", greeting: "Witaj", accountActive: "Konto aktywne", personalLabel: "Osobiste", availableBalance: "Dostępne saldo", detailsBtn: "Szczegóły", quickIbanLabel: "Zobacz mój IBAN", quickIbanSub: "Udostępnij moje dane", quickCardLabel: "Karta wirtualna", quickCardSub: "Zarządzaj kartą", quickTransferLabel: "Wykonaj przelew", quickTransferSub: "Wyślij pieniądze", seeAllBtn: "Zobacz wszystko", securityTitle: "Twoje bezpieczeństwo, nasze zobowiązanie", securityDesc: "Transakcje chronione, 24/7.", learnMoreBtn: "Dowiedz się więcej", navPaymentsNew: "Płatności", notifTitleSuccess: "Sukces", notifTitleError: "Błąd", notifTitleWarning: "Uwaga", notifTitleInfo: "Informacja", notifSubSuccess: "Operacja zakończona pomyślnie", notifSubError: "Wystąpił błąd", notifSubWarning: "Wymagana weryfikacja", notifSubInfo: "Powiadomienie", notifOkBtn: "OK", notifConfirmTitle: "Potwierdzenie", notifActionRequired: "Wymagane działanie", notifCancelBtn: "Anuluj", notifConfirmBtn: "Potwierdź", msgInvalidLink: "Nieprawidłowy link.", msgAccountSuspended: "Konto zawieszone.", msgFillAllFields: "Proszę wypełnić wszystkie pola.", msgEnterCode: "Proszę wprowadzić kod.", msgCodeIncorrect: "Nieprawidłowy kod.", msgClientNotInit: "Klient nie zainicjowany.", msgAccountDeleted: "Konto usunięte.", transferSentTitle: "Przelew wysłany", transferSentMsg: "Przelew <b>{amount}</b> został pomyślnie wysłany do <b>{name}</b>.<br>Konto: <b>{iban}</b>", transferFailedTitle: "Przelew nieudany", transferFailedMsg: "Przelew <b>{amount}</b> do <b>{name}</b> nie powiódł się na <b>{percent}%</b>.<br>Konto: <b>{iban}</b>", transferCancelledTitle: "Przelew anulowany", transferCancelledMsg: "Przelew <b>{amount}</b> do <b>{name}</b> został anulowany.<br>Konto: <b>{iban}</b>", adminTransfersTitle: "Zrealizowane przelewy", transferDetailsTitle: "Szczegóły przelewu", txTransferCancelled: "Przelew anulowany", txInitialDeposit: "Wpłata początkowa", txRefund: "Zwrot", copyBtn: "Kopiuj", copied: "Skopiowano!", transactionHistory: "Historia transakcji", noTransactions: "Brak historii.", sendOutgoingTransfer: "Wyślij przelew wychodzący", transferDetails: "Szczegóły przelewu", amountToDebit: "Kwota do obciążenia", labelIban: "IBAN / Numer konta", labelSwift: "Kod banku (BIC/SWIFT)", labelBank: "Nazwa banku", labelBeneficiary: "Nazwa beneficjenta", labelReason: "Powód przeniesienia", processingWarning: "Realizacja w ciągu 1 à 3 minut po weryfikacji końcowej.", nextBtn: "Następny", transferAmountLabel: "Kwota przelewu:", ibanLabel: "IBAN/numer", ibanLabelLine2: "konta:", swiftLabel: "Kod banku:", bankLabel: "Bank odbiorczy:", beneficiaryLabel: "Nazwa beneficjenta:", reasonLabel: "Powód:", cancelTransferBtn: "Anuluj przelew", lockText: "Wprowadź kod aktywacyjny przelewu", codeLabel: "Kod aktywacyjny", validateTransferBtn: "Zatwierdź przelew", processingPageTitle: "Twoje zlecenie przelewu w toku...", processingStatus: "Weryfikacja tożsamości zakończona pomyślnie.", processingDescLong: "Poczekaj na zakończenie przelewu środków do Twojego banku przed odświeżeniem tej strony.", processingDetailsTitle: "Szczegóły przelewu w toku", processingAmountLabel: "Kwota przelewu :", processingBeneficiaryLabel: "Nazwa beneficjenta :", processingIbanLabel: "IBAN / Numer konta :", processingBankLabel: "Nazwa banku :", receiptTitle: "Potwierdzenie transakcji", receiptSent: "Przelew wysłany", receiptReceived: "Przelew otrzymany", receiptAmount: "Kwota", receiptTo: "Odbiorca", receiptFrom: "Nadawca", receiptDate: "Data", receiptStatus: "Status", receiptStatusDone: "Zrealizowany", receiptRef: "Referencja", receiptClose: "Zamknij", profileEditBtn: "Edytuj", profileVerified: "Profil zweryfikowany", profilePersonalData: "Dane osobowe", profilePersonalDataSub: "Twoje dane osobowe", profileAccountSub: "Szczegóły konta", profileSecurityDesc: "Twoje dane są chronione.", pendingTitle: "Szczegóły oczekującego przelewu", pendingResultTitle: "Przelew oczekujący na zatwierdzenie", pendingResultMsg: "Twój przelew został zarejestrowany i oczekuje na weryfikację przez dział administracji.", pendingNotifTitle: "Przelew oczekujący", pendingNotifMsg: "Twój przelew <b>{amount}</b> jest w trakcie weryfikacji przez dział administracji.", adminPendingCardTitle: "Virement en attente", adminPendingCardSubtitle: "Aktywuj tryb oczekującego przelewu dla wybranego klienta.", adminPendingOn: "Włączony", adminPendingOff: "Wyłączony", adminPendingEnableBtn: "Włącz oczekujący przelew", adminPendingDisableBtn: "Wyłącz oczekujący przelew", adminPendingSectionTitle: "Przelewy oczekujące", adminPendingEmpty: "Brak oczekujących przelewów", adminPendingValidateBtn: "Zatwierdź", adminPendingCancelBtn: "Anuluj", adminValidateConfirmTitle: "Zatwierdzić przelew?", adminValidateConfirmMsg: "Czy na pewno chcesz zatwierdzić ten przelew? Klient otrzyma e-mail z potwierdzeniem i plikiem PDF.", adminCancelPendingConfirmTitle: "Anulować przelew?", adminCancelPendingConfirmMsg: "Czy na pewno chcesz anulować ten przelew? Kwota zostanie automatycznie zwrócona klientowi, a on otrzyma e-mail.", pendingValidatedNotifTitle: "Przelew zatwierdzony", pendingValidatedNotifMsg: "Przelew <b>{amount}</b> został zatwierdzony. Klient otrzyma e-mail z potwierdzeniem i PDF.", pendingCancelledNotifTitle: "Przelew anulowany", pendingCancelledNotifMsg: "Przelew <b>{amount}</b> został anulowany. Kwota została automatycznie zwrócona klientowi.", loginFooterProtected: "Twoje dane są chronione", loginFooterSecure: "Połączenie 100% bezpieczne", loginFooterSupport: "Wsparcie dla Ciebie", invalidAmountFormat: "Wpisz kwotę w prawidłowym formacie (tylko cyfry, bez spacji, przecinków ani kropek). Przykład: 3000", amountExceedsBalance: "Kwota przekracza saldo.", modalSuccess: "Przeniesienie {amount} wysłane", modalFailedAt: "Przelew {amount} nieudany na {percent}%", sendTime: "Czas:", closeBtn: "Zamknij", navBalance: "Pulpit", navCard: "Karta", navTransfer: "Płatności", navAccount: "Profil", txTransferSent: "Przelew wysłany", txTransferReceived: "Przelew otrzymany", cardWelcome: "Gratulacje, karta jest dostępna.", activateCardBtn: "Aktywuj", blockCardBtn: "Zablokuj", cardTransactions: "Transakcje kartowe", validUntil: "Ważne do:", accountOwner: "Właściciel", emailLabel: "E-mail", phoneLabel: "Telefon", countryLabel: "Kraj", addressLabel: "Adres zamieszkania", accountAndTransfer: "Konto i przelew", balanceProfile: "Saldo", accountType: "Typ", accountStatus: "Stan", statusActive: "Aktywny", supportedTransfer: "Transfer", accountTypeValue: "Profesjonalny", transferTypeValue: "Klasyczny", logoutBtn: "Rozłącz" },
  fr: { loginTitle: "Connectez-vous à votre compte", emailPh: "Votre adresse e-mail", pinPh: "Votre code d'accès", loginBtn: "Se connecter", loginErr: "Adresse e-mail ou code PIN incorrect.", greeting: "Bonjour", accountActive: "Compte actif", personalLabel: "Personnel", availableBalance: "Solde disponible", detailsBtn: "Détails", quickIbanLabel: "Voir mon IBAN", quickIbanSub: "Partager mes coordonnées", quickCardLabel: "Carte virtuelle", quickCardSub: "Gérer ma carte", quickTransferLabel: "Faire un virement", quickTransferSub: "Envoyer de l'argent", seeAllBtn: "Voir tout", securityTitle: "Votre sécurité, notre engagement", securityDesc: "Des transactions protégées, 24h/24 et 7j/7.", learnMoreBtn: "En savoir plus", navPaymentsNew: "Paiements", notifTitleSuccess: "Succès", notifTitleError: "Erreur", notifTitleWarning: "Attention", notifTitleInfo: "Information", notifSubSuccess: "Opération réussie", notifSubError: "Une erreur est survenue", notifSubWarning: "Vérification requise", notifSubInfo: "Notification", notifOkBtn: "OK", notifConfirmTitle: "Confirmation", notifActionRequired: "Action requise", notifCancelBtn: "Annuler", notifConfirmBtn: "Confirmer", msgInvalidLink: "Lien invalide.", msgAccountSuspended: "Compte suspendu.", msgFillAllFields: "Veuillez remplir tous les champs.", msgEnterCode: "Veuillez saisir le code.", msgCodeIncorrect: "Code incorrect.", msgClientNotInit: "Client non initialisé.", msgAccountDeleted: "Compte supprimé.", transferSentTitle: "Virement envoyé", transferSentMsg: "Virement de <b>{amount}</b> envoyé avec succès à <b>{name}</b>.<br>Compte bénéficiaire : <b>{iban}</b>", transferFailedTitle: "Virement échoué", transferFailedMsg: "Virement de <b>{amount}</b> à <b>{name}</b> a échoué à <b>{percent}%</b>.<br>Compte : <b>{iban}</b>", transferCancelledTitle: "Virement annulé", transferCancelledMsg: "Virement de <b>{amount}</b> à <b>{name}</b> a été annulé.<br>Compte : <b>{iban}</b>", adminTransfersTitle: "Virements effectués", transferDetailsTitle: "Détails du virement", txTransferCancelled: "Virement annulé", txInitialDeposit: "Dépôt initial", txRefund: "Remboursement", copyBtn: "Copier", copied: "Copié !", transactionHistory: "Historique des transactions", noTransactions: "Aucun historique.", sendOutgoingTransfer: "Envoyer un virement sortant", transferDetails: "Détails du virement", amountToDebit: "Montant à débiter", labelIban: "IBAN / Numéro de compte", labelSwift: "Code banque (BIC/SWIFT)", labelBank: "Nom de la banque", labelBeneficiary: "Nom du bénéficiaire", labelReason: "Motif du virement", processingWarning: "Réalisation sous 1 à 3 minutes après vérification finale.", nextBtn: "Suivant", transferAmountLabel: "Montant :", ibanLabel: "IBAN/Numéro", ibanLabelLine2: "de compte :", swiftLabel: "Code banque :", bankLabel: "Banque destinataire :", beneficiaryLabel: "Nom du bénéficiaire :", reasonLabel: "Motif :", cancelTransferBtn: "Annuler le virement", lockText: "Veuillez saisir le code d'activation du virement", codeLabel: "Code d'activation", validateTransferBtn: "Valider le virement", processingPageTitle: "Votre ordre de virement en cours...", processingStatus: "Vérification d'identité effectuée avec succès.", processingDescLong: "Veuillez patienter la fin du virement des fonds vers votre banque avant d'actualiser cette page.", processingDetailsTitle: "Détails du virement en cours", processingAmountLabel: "Montant du virement :", processingBeneficiaryLabel: "Nom du bénéficiaire :", processingIbanLabel: "IBAN / Numéro de Compte :", processingBankLabel: "Nom de la Banque :", receiptTitle: "Reçu de transaction", receiptSent: "Virement envoyé", receiptReceived: "Virement reçu", receiptAmount: "Montant", receiptTo: "Bénéficiaire", receiptFrom: "Expéditeur", receiptDate: "Date", receiptStatus: "Statut", receiptStatusDone: "Effectué", receiptRef: "Référence", receiptClose: "Fermer", profileEditBtn: "Modifier", profileVerified: "Profil vérifié", profilePersonalData: "Données personnelles", profilePersonalDataSub: "Vos informations personnelles", profileAccountSub: "Détails de votre compte et de vos virements", profileSecurityDesc: "Vos données sont protégées par un chiffrement de haute sécurité.", pendingTitle: "Détails du virement en attente", pendingResultTitle: "Virement en attente de validation", pendingResultMsg: "Votre virement a bien été enregistré et est en attente de validation par le service administratif.", pendingNotifTitle: "Virement en attente", pendingNotifMsg: "Votre virement <b>{amount}</b> est en cours de vérification par le service administratif.", adminPendingCardTitle: "Virement en attente", adminPendingCardSubtitle: "Activez le mode virement en attente pour le client sélectionné.", adminPendingOn: "Activé", adminPendingOff: "Désactivé", adminPendingEnableBtn: "Activer le virement en attente", adminPendingDisableBtn: "Désactiver le virement en attente", adminPendingSectionTitle: "Virements en attente", adminPendingEmpty: "Aucun virement en attente", adminPendingValidateBtn: "Valider", adminPendingCancelBtn: "Annuler", adminValidateConfirmTitle: "Valider le virement ?", adminValidateConfirmMsg: "Voulez-vous vraiment valider ce virement ? Le client recevra un email de confirmation avec le reçu PDF. La transaction passera au rouge.", adminCancelPendingConfirmTitle: "Annuler le virement ?", adminCancelPendingConfirmMsg: "Voulez-vous vraiment annuler ce virement ? Le montant sera automatiquement restitué au client et un email de notification lui sera envoyé.", pendingValidatedNotifTitle: "Virement validé", pendingValidatedNotifMsg: "Le virement <b>{amount}</b> a été validé. Le client recevra un email avec le reçu PDF.", pendingCancelledNotifTitle: "Virement annulé", pendingCancelledNotifMsg: "Le virement <b>{amount}</b> a été annulé. Le montant a été automatiquement restitué au client.", loginFooterProtected: "Vos données sont protégées", loginFooterSecure: "Connexion 100% sécurisée", loginFooterSupport: "Assistance à votre écoute", invalidAmountFormat: "Veuillez saisir le montant au format correct (uniquement des chiffres, sans virgule, sans point, sans espace). Exemple : 3000", amountExceedsBalance: "Le montant dépasse votre solde disponible.", modalSuccess: "Virement de {amount} envoyé", modalFailedAt: "Virement {amount} échoué à {percent}%", sendTime: "Heure d'envoi :", closeBtn: "Fermer", navBalance: "Accueil", navCard: "Carte virtuelle", navTransfer: "Paiements", navAccount: "Profil", txTransferSent: "Virement envoyé", txTransferReceived: "Virement reçu", cardWelcome: "Félicitations, votre carte est disponible.", activateCardBtn: "Activer ma carte", blockCardBtn: "Bloquer ma carte", cardTransactions: "Transactions par carte", validUntil: "Valable jusqu'au :", accountOwner: "Titulaire", emailLabel: "E-mail", phoneLabel: "Téléphone", countryLabel: "Pays", addressLabel: "Adresse de résidence", accountAndTransfer: "Compte et virement", balanceProfile: "Solde", accountType: "Type de compte", accountStatus: "Statut", statusActive: "Actif", supportedTransfer: "Virement supporté", accountTypeValue: "Professionnel", transferTypeValue: "Classique", logoutBtn: "Se déconnecter" },
  es: { loginTitle: "Inicia sesión", emailPh: "Tu correo", pinPh: "Tu código", loginBtn: "Iniciar", loginErr: "Correo o PIN incorrecto.", greeting: "Hola", accountActive: "Cuenta activa", personalLabel: "Personal", availableBalance: "Saldo disponible", detailsBtn: "Detalles", quickIbanLabel: "Ver mi IBAN", quickIbanSub: "Compartir mis datos", quickCardLabel: "Tarjeta virtual", quickCardSub: "Gestionar mi tarjeta", quickTransferLabel: "Hacer una transferencia", quickTransferSub: "Enviar dinero", seeAllBtn: "Ver todo", securityTitle: "Tu seguridad, nuestro compromiso", securityDesc: "Transacciones protegidas, 24/7.", learnMoreBtn: "Saber más", navPaymentsNew: "Pagos", notifTitleSuccess: "Éxito", notifTitleError: "Error", notifTitleWarning: "Atención", notifTitleInfo: "Información", notifSubSuccess: "Operación exitosa", notifSubError: "Se ha producido un error", notifSubWarning: "Verificación requerida", notifSubInfo: "Notificación", notifOkBtn: "OK", notifConfirmTitle: "Confirmación", notifActionRequired: "Acción requerida", notifCancelBtn: "Cancelar", notifConfirmBtn: "Confirmar", msgInvalidLink: "Enlace inválido.", msgAccountSuspended: "Cuenta suspendida.", msgFillAllFields: "Complete todos los campos.", msgEnterCode: "Introduzca el código.", msgCodeIncorrect: "Código incorrecto.", msgClientNotInit: "Cliente no inicializado.", msgAccountDeleted: "Cuenta eliminada.", transferSentTitle: "Transferencia enviada", transferSentMsg: "Transferencia de <b>{amount}</b> enviada con éxito a <b>{name}</b>.<br>Cuenta: <b>{iban}</b>", transferFailedTitle: "Transferencia fallida", transferFailedMsg: "Transferencia de <b>{amount}</b> a <b>{name}</b> falló al <b>{percent}%</b>.<br>Cuenta: <b>{iban}</b>", transferCancelledTitle: "Transferencia cancelada", transferCancelledMsg: "Transferencia de <b>{amount}</b> a <b>{name}</b> fue cancelada.<br>Cuenta: <b>{iban}</b>", adminTransfersTitle: "Transferencias realizadas", transferDetailsTitle: "Detalles", txTransferCancelled: "Transferencia cancelada", txInitialDeposit: "Depósito inicial", txRefund: "Reembolso", copyBtn: "Copiar", copied: "¡Copiado!", transactionHistory: "Historial", noTransactions: "Sin historial.", sendOutgoingTransfer: "Enviar transferencia", transferDetails: "Detalles", amountToDebit: "Importe a debitar", labelIban: "IBAN", labelSwift: "Código BIC/SWIFT", labelBank: "Nombre del banco", labelBeneficiary: "Beneficiario", labelReason: "Motivo", processingWarning: "Realización en 1-3 minutos tras verificación final.", nextBtn: "Siguiente", transferAmountLabel: "Importe:", ibanLabel: "IBAN", ibanLabelLine2: "cuenta:", swiftLabel: "BIC:", bankLabel: "Banco:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", cancelTransferBtn: "Cancelar la transferencia", lockText: "Introduzca el código de activación", codeLabel: "Código de activación", validateTransferBtn: "Validar", processingPageTitle: "Su orden de transferencia en curso...", processingStatus: "Verificación de identidad exitosa.", processingDescLong: "Espere el fin de la transferencia de fondos a su banco antes de actualizar esta página.", processingDetailsTitle: "Detalles en curso", processingAmountLabel: "Importe :", processingBeneficiaryLabel: "Beneficiario :", processingIbanLabel: "IBAN :", processingBankLabel: "Banco :", receiptTitle: "Recibo", receiptSent: "Enviada", receiptReceived: "Recibida", receiptAmount: "Importe", receiptTo: "Beneficiario", receiptFrom: "Remitente", receiptDate: "Fecha", receiptStatus: "Estado", receiptStatusDone: "Completado", receiptRef: "Referencia", receiptClose: "Cerrar", profileEditBtn: "Editar", profileVerified: "Perfil verificado", profilePersonalData: "Datos personales", profilePersonalDataSub: "Tu información personal", profileAccountSub: "Detalles de tu cuenta", profileSecurityDesc: "Tus datos están protegidos.", pendingTitle: "Detalles de la transferencia pendiente", pendingResultTitle: "Transferencia pendiente de validación", pendingResultMsg: "Su transferencia ha sido registrada y está pendiente de validación por el servicio administrativo.", pendingNotifTitle: "Transferencia pendiente", pendingNotifMsg: "Su transferencia <b>{amount}</b> está siendo verificada.", adminPendingCardTitle: "Transferencia pendiente", adminPendingCardSubtitle: "Active el modo transferencia pendiente para el cliente seleccionado.", adminPendingOn: "Activado", adminPendingOff: "Desactivado", adminPendingEnableBtn: "Activar", adminPendingDisableBtn: "Desactivar", adminPendingSectionTitle: "Transferencias pendientes", adminPendingEmpty: "Sin transferencias pendientes", adminPendingValidateBtn: "Validar", adminPendingCancelBtn: "Cancelar", adminValidateConfirmTitle: "¿Validar la transferencia?", adminValidateConfirmMsg: "¿Desea realmente validar esta transferencia? El cliente recibirá un correo de confirmación con el recibo PDF.", adminCancelPendingConfirmTitle: "¿Cancelar la transferencia?", adminCancelPendingConfirmMsg: "¿Desea realmente cancelar esta transferencia? El importe será devuelto automáticamente al cliente.", pendingValidatedNotifTitle: "Transferencia validada", pendingValidatedNotifMsg: "La transferencia <b>{amount}</b> ha sido validada. El cliente recibirá un correo con el recibo PDF.", pendingCancelledNotifTitle: "Transferencia cancelada", pendingCancelledNotifMsg: "La transferencia <b>{amount}</b> ha sido cancelada. El importe ha sido restituido automáticamente al cliente.", loginFooterProtected: "Tus datos están protegidos", loginFooterSecure: "Conexión 100% segura", loginFooterSupport: "Asistencia a tu disposición", invalidAmountFormat: "Ingrese el importe en el formato correcto (solo dígitos, sin coma, sin punto, sin espacio). Ejemplo: 3000", amountExceedsBalance: "El importe supera su saldo.", modalSuccess: "Transferencia de {amount} enviada", modalFailedAt: "Transferencia {amount} falló al {percent}%", sendTime: "Hora:", closeBtn: "Cerrar", navBalance: "Inicio", navCard: "Tarjeta virtual", navTransfer: "Pagos", navAccount: "Perfil", txTransferSent: "Enviada", txTransferReceived: "Recibida", cardWelcome: "Tarjeta disponible.", activateCardBtn: "Activar", blockCardBtn: "Bloquear", cardTransactions: "Transacciones", validUntil: "Válida hasta:", accountOwner: "Titular", emailLabel: "Correo", phoneLabel: "Teléfono", countryLabel: "País", addressLabel: "Dirección de residencia", accountAndTransfer: "Cuenta y transferencia", balanceProfile: "Saldo", accountType: "Tipo", accountStatus: "Estado", statusActive: "Activo", supportedTransfer: "Soporte", accountTypeValue: "Profesional", transferTypeValue: "Clásico", logoutBtn: "Salir" },
  it: { loginTitle: "Accedi", emailPh: "Email", pinPh: "Codice", loginBtn: "Accedi", loginErr: "Email o PIN errato.", greeting: "Ciao", accountActive: "Conto attivo", personalLabel: "Personale", availableBalance: "Saldo disponibile", detailsBtn: "Dettagli", quickIbanLabel: "Vedi il mio IBAN", quickIbanSub: "Condividi i miei dati", quickCardLabel: "Carta virtuale", quickCardSub: "Gestisci la carta", quickTransferLabel: "Fai un bonifico", quickTransferSub: "Invia denaro", seeAllBtn: "Vedi tutto", securityTitle: "La tua sicurezza, il nostro impegno", securityDesc: "Transazioni protette, 24/7.", learnMoreBtn: "Scopri di più", navPaymentsNew: "Pagamenti", notifTitleSuccess: "Successo", notifTitleError: "Errore", notifTitleWarning: "Attenzione", notifTitleInfo: "Informazione", notifSubSuccess: "Operazione riuscita", notifSubError: "Si è verificato un errore", notifSubWarning: "Verifica richiesta", notifSubInfo: "Notifica", notifOkBtn: "OK", notifConfirmTitle: "Conferma", notifActionRequired: "Azione richiesta", notifCancelBtn: "Annulla", notifConfirmBtn: "Conferma", msgInvalidLink: "Link non valido.", msgAccountSuspended: "Conto sospeso.", msgFillAllFields: "Compila tutti i campi.", msgEnterCode: "Inserisci il codice.", msgCodeIncorrect: "Codice errato.", msgClientNotInit: "Cliente non inizializzato.", msgAccountDeleted: "Conto eliminato.", transferSentTitle: "Bonifico inviato", transferSentMsg: "Bonifico di <b>{amount}</b> inviato con successo a <b>{name}</b>.<br>Conto beneficiario: <b>{iban}</b>", transferFailedTitle: "Bonifico fallito", transferFailedMsg: "Bonifico di <b>{amount}</b> a <b>{name}</b> fallito al <b>{percent}%</b>.<br>Conto: <b>{iban}</b>", transferCancelledTitle: "Bonifico annullato", transferCancelledMsg: "Bonifico di <b>{amount}</b> a <b>{name}</b> è stato annullato.<br>Conto: <b>{iban}</b>", adminTransfersTitle: "Bonifici effettuati", transferDetailsTitle: "Dettagli", txTransferCancelled: "Bonifico annullato", txInitialDeposit: "Deposito iniziale", txRefund: "Rimborso", copyBtn: "Copia", copied: "Copiato!", transactionHistory: "Cronologia", noTransactions: "Nessuna cronologia.", sendOutgoingTransfer: "Invia bonifico", transferDetails: "Dettagli", amountToDebit: "Importo da addebitare", labelIban: "IBAN", labelSwift: "Codice BIC/SWIFT", labelBank: "Nome della banca", labelBeneficiary: "Beneficiario", labelReason: "Motivo", processingWarning: "Esecuzione entro 1-3 minuti dopo verifica finale.", nextBtn: "Avanti", transferAmountLabel: "Importo:", ibanLabel: "IBAN", ibanLabelLine2: "conto:", swiftLabel: "BIC:", bankLabel: "Banca:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", cancelTransferBtn: "Annulla il bonifico", lockText: "Inserisci il codice di attivazione", codeLabel: "Codice di attivazione", validateTransferBtn: "Convalida", processingPageTitle: "Il tuo ordine di bonifico in corso...", processingStatus: "Verifica dell'identità completata con successo.", processingDescLong: "Attendere la fine del trasferimento dei fondi alla tua banca prima di aggiornare questa pagina.", processingDetailsTitle: "Dettagli in corso", processingAmountLabel: "Importo :", processingBeneficiaryLabel: "Beneficiario :", processingIbanLabel: "IBAN :", processingBankLabel: "Banca :", receiptTitle: "Ricevuta", receiptSent: "Inviato", receiptReceived: "Ricevuto", receiptAmount: "Importo", receiptTo: "Beneficiario", receiptFrom: "Mittente", receiptDate: "Data", receiptStatus: "Stato", receiptStatusDone: "Completato", receiptRef: "Riferimento", receiptClose: "Chiudi", profileEditBtn: "Modifica", profileVerified: "Profilo verificato", profilePersonalData: "Dati personali", profilePersonalDataSub: "Le tue informazioni", profileAccountSub: "Dettagli del conto", profileSecurityDesc: "I tuoi dati sono protetti.", pendingTitle: "Dettagli del bonifico in sospeso", pendingResultTitle: "Bonifico in attesa di convalida", pendingResultMsg: "Il tuo bonifico è stato registrato ed è in attesa di convalida da parte del servizio amministrativo.", pendingNotifTitle: "Bonifico in attesa", pendingNotifMsg: "Il tuo bonifico <b>{amount}</b> è in verifica.", adminPendingCardTitle: "Bonifico in attesa", adminPendingCardSubtitle: "Attiva la modalità bonifico in attesa per il cliente selezionato.", adminPendingOn: "Attivato", adminPendingOff: "Disattivato", adminPendingEnableBtn: "Attiva", adminPendingDisableBtn: "Disattiva", adminPendingSectionTitle: "Bonifici in attesa", adminPendingEmpty: "Nessun bonifico in attesa", adminPendingValidateBtn: "Convalida", adminPendingCancelBtn: "Annulla", adminValidateConfirmTitle: "Convalidare il bonifico?", adminValidateConfirmMsg: "Vuoi davvero convalidare questo bonifico? Il cliente riceverà un'email di conferma con la ricevuta PDF.", adminCancelPendingConfirmTitle: "Annullare il bonifico?", adminCancelPendingConfirmMsg: "Vuoi davvero annullare questo bonifico? L'importo sarà automaticamente rimborsato al cliente.", pendingValidatedNotifTitle: "Bonifico convalidato", pendingValidatedNotifMsg: "Il bonifico <b>{amount}</b> è stato convalidato. Il cliente riceverà un'email con la ricevuta PDF.", pendingCancelledNotifTitle: "Bonifico annullato", pendingCancelledNotifMsg: "Il bonifico <b>{amount}</b> è stato annullato. L'importo è stato automaticamente rimborsato al cliente.", loginFooterProtected: "I tuoi dati sono protetti", loginFooterSecure: "Connessione 100% sicura", loginFooterSupport: "Assistenza a tua disposizione", invalidAmountFormat: "Inserisci l'importo nel formato corretto (solo cifre, senza virgola, senza punto, senza spazio). Esempio: 3000", amountExceedsBalance: "L'importo supera il saldo.", modalSuccess: "Bonifico di {amount} inviato", modalFailedAt: "Bonifico {amount} fallito al {percent}%", sendTime: "Ora:", closeBtn: "Chiudi", navBalance: "Home", navCard: "Carta virtuale", navTransfer: "Pagamenti", navAccount: "Profilo", txTransferSent: "Inviato", txTransferReceived: "Ricevuto", cardWelcome: "Carta disponibile.", activateCardBtn: "Attiva", blockCardBtn: "Blocca", cardTransactions: "Transazioni", validUntil: "Valida fino al:", accountOwner: "Titolare", emailLabel: "Email", phoneLabel: "Telefono", countryLabel: "Paese", addressLabel: "Indirizzo di residenza", accountAndTransfer: "Conto e bonifico", balanceProfile: "Saldo", accountType: "Tipo", accountStatus: "Stato", statusActive: "Attivo", supportedTransfer: "Supporto", accountTypeValue: "Professionale", transferTypeValue: "Classico", logoutBtn: "Esci" },
  de: { loginTitle: "Anmelden", emailPh: "E-Mail", pinPh: "Zugangscode", loginBtn: "Anmelden", loginErr: "Falsche E-Mail oder PIN.", greeting: "Hallo", accountActive: "Konto aktiv", personalLabel: "Persönlich", availableBalance: "Verfügbares Guthaben", detailsBtn: "Details", quickIbanLabel: "Meine IBAN anzeigen", quickIbanSub: "Meine Daten teilen", quickCardLabel: "Virtuelle Karte", quickCardSub: "Karte verwalten", quickTransferLabel: "Überweisung tätigen", quickTransferSub: "Geld senden", seeAllBtn: "Alle anzeigen", securityTitle: "Ihre Sicherheit, unser Engagement", securityDesc: "Geschützte Transaktionen, rund um die Uhr.", learnMoreBtn: "Mehr erfahren", navPaymentsNew: "Zahlungen", notifTitleSuccess: "Erfolg", notifTitleError: "Fehler", notifTitleWarning: "Achtung", notifTitleInfo: "Information", notifSubSuccess: "Vorgang erfolgreich", notifSubError: "Ein Fehler ist aufgetreten", notifSubWarning: "Verifizierung erforderlich", notifSubInfo: "Benachrichtigung", notifOkBtn: "OK", notifConfirmTitle: "Bestätigung", notifActionRequired: "Aktion erforderlich", notifCancelBtn: "Abbrechen", notifConfirmBtn: "Bestätigen", msgInvalidLink: "Ungültiger Link.", msgAccountSuspended: "Konto gesperrt.", msgFillAllFields: "Bitte alle Felder ausfüllen.", msgEnterCode: "Bitte Code eingeben.", msgCodeIncorrect: "Falscher Code.", msgClientNotInit: "Kunde nicht initialisiert.", msgAccountDeleted: "Konto gelöscht.", transferSentTitle: "Überweisung gesendet", transferSentMsg: "Überweisung von <b>{amount}</b> erfolgreich an <b>{name}</b>.<br>Empfängerkonto: <b>{iban}</b>", transferFailedTitle: "Überweisung fehlgeschlagen", transferFailedMsg: "Überweisung von <b>{amount}</b> an <b>{name}</b> bei <b>{percent}%</b> fehlgeschlagen.<br>Konto: <b>{iban}</b>", transferCancelledTitle: "Überweisung storniert", transferCancelledMsg: "Überweisung von <b>{amount}</b> an <b>{name}</b> wurde storniert.<br>Konto: <b>{iban}</b>", adminTransfersTitle: "Ausgeführte Überweisungen", transferDetailsTitle: "Details", txTransferCancelled: "Überweisung storniert", txInitialDeposit: "Ersteinzahlung", txRefund: "Rückerstattung", copyBtn: "Kopieren", copied: "Kopiert!", transactionHistory: "Verlauf", noTransactions: "Kein Verlauf.", sendOutgoingTransfer: "Überweisung senden", transferDetails: "Details", amountToDebit: "Zu belastender Betrag", labelIban: "IBAN", labelSwift: "Bankcode", labelBank: "Name der Bank", labelBeneficiary: "Begünstigter", labelReason: "Grund", processingWarning: "Ausführung in 1-3 Minuten nach finaler Überprüfung.", nextBtn: "Weiter", transferAmountLabel: "Betrag:", ibanLabel: "IBAN", ibanLabelLine2: "Konto:", swiftLabel: "BIC:", bankLabel: "Empfänger:", beneficiaryLabel: "Begünstigter:", reasonLabel: "Grund:", cancelTransferBtn: "Überweisung stornieren", lockText: "Bitte Aktivierungscode eingeben", codeLabel: "Aktivierungscode", validateTransferBtn: "Bestätigen", processingPageTitle: "Ihr Überweisungsauftrag wird bearbeitet...", processingStatus: "Identitätsprüfung erfolgreich abgeschlossen.", processingDescLong: "Bitte warten Sie, bis die Überweisung an Ihre Bank abgeschlossen ist, bevor Sie diese Seite aktualisieren.", processingDetailsTitle: "Details der laufenden Überweisung", processingAmountLabel: "Betrag :", processingBeneficiaryLabel: "Begünstigter :", processingIbanLabel: "IBAN :", processingBankLabel: "Bank :", receiptTitle: "Transaktionsbeleg", receiptSent: "Gesendet", receiptReceived: "Erhalten", receiptAmount: "Betrag", receiptTo: "Begünstigter", receiptFrom: "Absender", receiptDate: "Datum", receiptStatus: "Status", receiptStatusDone: "Abgeschlossen", receiptRef: "Referenz", receiptClose: "Schließen", profileEditBtn: "Bearbeiten", profileVerified: "Verifiziertes Profil", profilePersonalData: "Persönliche Daten", profilePersonalDataSub: "Ihre Informationen", profileAccountSub: "Kontodetails", profileSecurityDesc: "Ihre Daten sind geschützt.", pendingTitle: "Details der ausstehenden Überweisung", pendingResultTitle: "Überweisung zur Genehmigung ausstehend", pendingResultMsg: "Ihre Überweisung wurde registriert und wartet auf die Genehmigung durch die Verwaltungsabteilung.", pendingNotifTitle: "Ausstehend", pendingNotifMsg: "Ihre Überweisung <b>{amount}</b> wird überprüft.", adminPendingCardTitle: "Ausstehend", adminPendingCardSubtitle: "Ausstehenden Modus für den ausgewählten Kunden aktivieren.", adminPendingOn: "Aktiviert", adminPendingOff: "Deaktiviert", adminPendingEnableBtn: "Aktivieren", adminPendingDisableBtn: "Deaktivieren", adminPendingSectionTitle: "Ausstehende Überweisungen", adminPendingEmpty: "Keine ausstehenden", adminPendingValidateBtn: "Genehmigen", adminPendingCancelBtn: "Stornieren", adminValidateConfirmTitle: "Überweisung genehmigen?", adminValidateConfirmMsg: "Möchten Sie diese Überweisung wirklich genehmigen? Der Kunde erhält eine Bestätigungs-E-Mail mit PDF-Beleg.", adminCancelPendingConfirmTitle: "Überweisung stornieren?", adminCancelPendingConfirmMsg: "Möchten Sie diese Überweisung wirklich stornieren? Der Betrag wird dem Kunden automatisch zurückerstattet.", pendingValidatedNotifTitle: "Genehmigt", pendingValidatedNotifMsg: "Die Überweisung <b>{amount}</b> wurde genehmigt. Der Kunde erhält eine E-Mail mit PDF-Beleg.", pendingCancelledNotifTitle: "Storniert", pendingCancelledNotifMsg: "Die Überweisung <b>{amount}</b> wurde storniert. Der Betrag wurde dem Kunden automatisch zurückerstattet.", loginFooterProtected: "Ihre Daten sind geschützt", loginFooterSecure: "100% sichere Verbindung", loginFooterSupport: "Support für Sie", invalidAmountFormat: "Bitte geben Sie den Betrag im richtigen Format ein (nur Ziffern, ohne Komma, ohne Punkt, ohne Leerzeichen). Beispiel: 3000", amountExceedsBalance: "Der Betrag übersteigt das Guthaben.", modalSuccess: "Überweisung von {amount} gesendet", modalFailedAt: "Überweisung {amount} bei {percent}% fehlgeschlagen", sendTime: "Zeit:", closeBtn: "Schließen", navBalance: "Start", navCard: "Virtuelle Karte", navTransfer: "Zahlungen", navAccount: "Profil", txTransferSent: "Gesendet", txTransferReceived: "Erhalten", cardWelcome: "Karte verfügbar.", activateCardBtn: "Aktivieren", blockCardBtn: "Sperren", cardTransactions: "Transaktionen", validUntil: "Gültig bis:", accountOwner: "Kontoinhaber", emailLabel: "E-Mail", phoneLabel: "Telefon", countryLabel: "Land", addressLabel: "Wohnadresse", accountAndTransfer: "Konto und Überweisung", balanceProfile: "Kontostand", accountType: "Kontotyp", accountStatus: "Status", statusActive: "Aktiv", supportedTransfer: "Unterstützte Überweisung", accountTypeValue: "Professionell", transferTypeValue: "Klassisch", logoutBtn: "Abmelden" }
};

const ibanLabels = {
  pl: { title: "Dane konta", numberLabel: "Numer IBAN", ownerLabel: "Właściciel", bicLabel: "BIC / SWIFT", warning: "Ze względów bezpieczeństwa niektóre znaki IBAN zostały zamaskowane." },
  fr: { title: "Détails du compte", numberLabel: "Numéro IBAN", ownerLabel: "Titulaire", bicLabel: "BIC / SWIFT", warning: "Pour des raisons de sécurité, certains caractères de l'IBAN ont été masqués." },
  es: { title: "Detalles de la cuenta", numberLabel: "Número IBAN", ownerLabel: "Titular", bicLabel: "BIC / SWIFT", warning: "Por razones de seguridad, algunos caracteres del IBAN han sido enmascarados." },
  it: { title: "Dettagli del conto", numberLabel: "Numero IBAN", ownerLabel: "Titolare", bicLabel: "BIC / SWIFT", warning: "Per motivi di sicurezza, alcuni caratteri dell'IBAN sono stati mascherati." },
  de: { title: "Kontodetails", numberLabel: "IBAN-Nummer", ownerLabel: "Inhaber", bicLabel: "BIC / SWIFT", warning: "Aus Sicherheitsgründen wurden einige IBAN-Zeichen maskiert." }
};

const cardLabels = {
  pl: { title: "Karta wirtualna", holderLabel: "Posiadacz", expiryLabel: "Ważna do", cvvLabel: "CVV", numberLabel: "Numer karty", typeLabel: "Typ", copyBtn: "Kopiuj numer", showBtn: "Pokaż", hideBtn: "Ukryj", warningMasked: "Ostatnie 4 cyfry są ukryte przez administratora.", warningCvvMasked: "CVV jest ukryty przez administratora.", warningFull: "Karta w pełni widoczna.", warningAdminMasked: "Ostatnie 4 cyfry i CVV są ukryte przez administratora." },
  fr: { title: "Carte virtuelle", holderLabel: "Titulaire", expiryLabel: "Valable jusqu'au", cvvLabel: "CVV", numberLabel: "Numéro de carte", typeLabel: "Type", copyBtn: "Copier le numéro", showBtn: "Afficher", hideBtn: "Masquer", warningMasked: "Les 4 derniers chiffres sont masqués par l'administrateur.", warningCvvMasked: "Le CVV est masqué par l'administrateur.", warningFull: "Carte complètement visible.", warningAdminMasked: "Les 4 derniers chiffres et le CVV sont masqués par l'administrateur." },
  es: { title: "Tarjeta virtual", holderLabel: "Titular", expiryLabel: "Válida hasta", cvvLabel: "CVV", numberLabel: "Número de tarjeta", typeLabel: "Tipo", copyBtn: "Copiar número", showBtn: "Mostrar", hideBtn: "Ocultar", warningMasked: "Los últimos 4 dígitos están ocultos por el administrador.", warningCvvMasked: "El CVV está oculto por el administrador.", warningFull: "Tarjeta completamente visible.", warningAdminMasked: "Los últimos 4 dígitos y el CVV están ocultos por el administrador." },
  it: { title: "Carta virtuale", holderLabel: "Titolare", expiryLabel: "Valida fino al", cvvLabel: "CVV", numberLabel: "Numero carta", typeLabel: "Tipo", copyBtn: "Copia numero", showBtn: "Mostra", hideBtn: "Nascondi", warningMasked: "Le ultime 4 cifre sono nascoste dall'amministratore.", warningCvvMasked: "Il CVV è nascosto dall'amministratore.", warningFull: "Carta completamente visibile.", warningAdminMasked: "Le ultime 4 cifre e il CVV sono nascosti dall'amministratore." },
  de: { title: "Virtuelle Karte", holderLabel: "Inhaber", expiryLabel: "Gültig bis", cvvLabel: "CVV", numberLabel: "Kartennummer", typeLabel: "Typ", copyBtn: "Nummer kopieren", showBtn: "Anzeigen", hideBtn: "Verbergen", warningMasked: "Die letzten 4 Ziffern sind vom Administrator ausgeblendet.", warningCvvMasked: "CVV ist vom Administrator ausgeblendet.", warningFull: "Karte vollständig sichtbar.", warningAdminMasked: "Die letzten 4 Ziffern und der CVV sind vom Administrator ausgeblendet." }
};

let currentLang = 'fr';
let currentClient = null;
let progressInterval = null;
let clientUnsubscribe = null;
let pendingTransferAmount = 0;
let pendingTransferPercent = 100;
let virtualCardRevealed = false;
let currentTransactions = [];

const t = (k) => { const d = i18n[currentLang] || i18n.fr; return d[k] !== undefined ? d[k] : (i18n.fr[k] || k); };
const formatAmount = (a, c) => a.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + c;
const generateShortId = () => { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let r = ''; for (let i = 0; i < 6; i++) r += c.charAt(Math.floor(Math.random() * c.length)); return r; };

function translateSubtitle(subtitle) { if (!subtitle) return ''; const map = { 'Depot initial': 'txInitialDeposit', 'Dépôt initial': 'txInitialDeposit', 'Virement recu': 'txTransferReceived', 'Virement reçu': 'txTransferReceived', 'Virement envoye': 'txTransferSent', 'Virement envoyé': 'txTransferSent', 'Virement annule': 'txTransferCancelled', 'Virement annulé': 'txTransferCancelled', 'Wplata poczatkowa': 'txInitialDeposit', 'Wpłata początkowa': 'txInitialDeposit', 'Przelew otrzymany': 'txTransferReceived', 'Przelew wyslany': 'txTransferSent', 'Przelew wysłany': 'txTransferSent', 'Przelew anulowany': 'txTransferCancelled', 'Deposito inicial': 'txInitialDeposit', 'Transferencia recibida': 'txTransferReceived', 'Transferencia enviada': 'txTransferSent', 'Transferencia cancelada': 'txTransferCancelled', 'Deposito iniziale': 'txInitialDeposit', 'Ricevuto': 'txTransferReceived', 'Inviato': 'txTransferSent', 'Bonifico annullato': 'txTransferCancelled', 'Ersteinzahlung': 'txInitialDeposit', 'Erhalten': 'txTransferReceived', 'Gesendet': 'txTransferSent', 'Uberweisung storniert': 'txTransferCancelled' }; const key = map[subtitle]; if (key) return t(key); return subtitle; }

// ============ GLOBAL STYLES ============
function ensureGlobalStyles() {
  if (document.getElementById('tw-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'tw-global-styles';
  style.textContent = `
    .nav-item-new.active{background:var(--primary-light) !important;}
    .nav-item-new.active svg{fill:var(--primary) !important;}
    .nav-item-new.active span{color:var(--primary) !important;}
    .balance-card-new{overflow:hidden !important;}
    .balance-bubbles-new{position:absolute !important;inset:0 !important;overflow:hidden !important;pointer-events:none !important;z-index:1 !important;border-radius:13px !important;}
    .bbn{position:absolute !important;border-radius:50% !important;opacity:0.75 !important;animation-name:bbnFloat !important;animation-timing-function:ease-in-out !important;animation-iteration-count:infinite !important;filter:blur(2px) !important;mix-blend-mode:screen !important;}
    .bbn.b1{width:180px !important;height:180px !important;left:-50px !important;bottom:-20px !important;background:radial-gradient(circle at 30% 30%,rgba(244,114,182,0.95) 0%,rgba(236,72,153,0.55) 40%,transparent 100%) !important;animation-duration:8s !important;}
    .bbn.b2{width:130px !important;height:130px !important;left:60% !important;bottom:-20px !important;background:radial-gradient(circle at 30% 30%,rgba(34,211,238,0.95) 0%,rgba(6,182,212,0.55) 40%,transparent 100%) !important;animation-duration:10s !important;animation-delay:-2s !important;}
    .bbn.b3{width:200px !important;height:200px !important;right:-60px !important;top:-30px !important;background:radial-gradient(circle at 30% 30%,rgba(251,191,36,0.95) 0%,rgba(245,158,11,0.55) 40%,transparent 100%) !important;animation-duration:9s !important;animation-delay:-4s !important;}
    .bbn.b4{width:110px !important;height:110px !important;left:35% !important;top:25% !important;background:radial-gradient(circle at 30% 30%,rgba(167,139,250,0.95) 0%,rgba(139,92,246,0.55) 40%,transparent 100%) !important;animation-duration:11s !important;animation-delay:-6s !important;}
    .bbn.b5{width:150px !important;height:150px !important;right:5% !important;bottom:10% !important;background:radial-gradient(circle at 30% 30%,rgba(74,222,128,0.95) 0%,rgba(34,197,94,0.55) 40%,transparent 100%) !important;animation-duration:12s !important;animation-delay:-3s !important;}
    @keyframes bbnFloat{0%,100%{transform:translate(0,0) rotate(0deg) scale(0.95);opacity:0.75;}50%{transform:translate(20px,-30px) rotate(15deg) scale(1.1);opacity:1;}}
    .balance-card-amount-new{margin-top:14px !important;padding-left:22px !important;}
    .balance-card-sub-new{margin-top:12px !important;padding-left:22px !important;}
    .nav-item-new span{font-size:7.5px !important;font-weight:900 !important;color:#0a0a0a !important;}
    .nav-item-new svg{width:14px !important;height:14px !important;fill:#0f172a !important;}
    .nav-item-new.active span{color:var(--primary) !important;}
    .nav-item-new.active svg{fill:var(--primary) !important;}
    .bottom-nav-new{background:#e2e6ec !important;}
    .tx-icon-circle-new.bank-logo{background:#fff !important;border:1px solid #e2e8f0 !important;padding:5px !important;}
    .tx-icon-circle-new.bank-logo img{width:100% !important;height:100% !important;object-fit:contain !important;border-radius:6px !important;}
    .result-header-block.pending{background:linear-gradient(135deg,#f59e0b,#d97706);}
    .result-check-circle.pending svg{fill:#f59e0b;}
    .result-title-text.pending{color:#d97706;}
    .tx-icon-circle-new.pending{background:#fef3c7;}
    .tx-icon-circle-new.pending svg{fill:#d97706;}
    .tx-amount-value-new.pending{color:#d97706;}
    .receipt-header-new.pending{background:linear-gradient(135deg,#f59e0b,#d97706);}
    .pending-transfer-card{background:#fffbeb;border-radius:4px;padding:14px;margin-bottom:13px;border:2px solid #f59e0b;}
    .pending-transfer-card .pt-title{display:inline-block;background:#fef3c7;border:2px solid #f59e0b;color:#78350f;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:700;margin-bottom:14px;}
    .pending-transfer-card .pt-title svg{width:13px;height:13px;fill:#d97706;vertical-align:middle;margin-right:4px;}
    .pending-transfer-card .pt-subtitle{font-size:11px;color:#78350f;line-height:1.5;margin-bottom:12px;font-weight:600;}
    .pending-transfer-card .pt-status-line{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:8px 10px;background:#fff;border-radius:4px;border:2px solid #f59e0b;}
    .pending-transfer-card .pt-status-label{font-size:10.5px;font-weight:700;color:#78350f;flex:1;}
    .pending-transfer-status-badge{display:inline-block;padding:4px 10px;border-radius:12px;font-size:9.5px;font-weight:700;border:2px solid;}
    .pending-transfer-status-badge.enabled{background:#dcfce7;color:#16a34a;border-color:#16a34a;}
    .pending-transfer-status-badge.disabled{background:#fee2e2;color:#dc2626;border-color:#dc2626;}
    .admin-pending-transfers-card{background:#fffbeb;border:2px solid #f59e0b;border-radius:4px;padding:12px;margin:12px 0 8px 0;}
    .admin-pending-transfers-title{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#d97706;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #fef3c7;}
    .admin-pending-transfers-title svg{width:14px;height:14px;fill:#d97706;}
    .admin-pending-empty{font-size:11px;color:#a16207;text-align:center;padding:16px 10px;font-weight:600;}
    .admin-pending-item{background:#fff;border:2px solid #f59e0b;border-radius:4px;padding:10px;margin-bottom:8px;}
    .admin-pending-name{font-size:12.5px;font-weight:700;color:#78350f;margin-bottom:3px;}
    .admin-pending-meta{font-size:10px;color:#a16207;font-weight:600;margin-bottom:6px;}
    .admin-pending-amount{font-size:14px;font-weight:700;color:#d97706;margin-bottom:10px;}
    .admin-pending-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
    .admin-pending-btn{border:2px solid;border-radius:4px;padding:9px;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;}
    .admin-pending-btn.validate{background:#16a34a;color:#fff;border-color:#15803d;}
    .admin-pending-btn.cancel{background:#dc2626;color:#fff;border-color:#991b1b;}
    .admin-pending-btn svg{width:12px;height:12px;fill:#fff;}
    .admin-section, .quick-actions-card, .stat-card, .client-list-card, .pending-transfer-card, .admin-transfers-card, .admin-pending-transfers-card, .connection-status-card, .admin-identity-card, .option-panel{border:2px solid #94a3b8 !important;}
    .stat-card{border-color:#cbd5e1 !important;}
    .admin-identity-card{border-color:#1a73e8 !important;}
    .admin-group input, .admin-group select, .admin-group textarea, .quick-actions-card input, .quick-actions-card select, .admin-auth input, .sa-login-input{border:2px solid #94a3b8 !important;background:#f8fafc !important;}
    .admin-group input:focus, .admin-group select:focus, .admin-group textarea:focus{border-color:#1a73e8 !important;background:#fff !important;}
    .btn-admin-submit, .client-line-btn, .admin-pending-btn, .sa-action-btn, .admin-transfer-cancel-btn, .detail-footer-btn, .verify-cancel-btn, .notif-btn, .submit-btn, .btn-auth{border-width:2px !important;border-style:solid !important;}
    .btn-admin-submit{border-color:#1557b0 !important;}
    .client-line-btn.block{border-color:#991b1b !important;}
    .client-line-btn.unblock{border-color:#15803d !important;}
    .client-line-btn.del{border-color:#475569 !important;}
    .qa-switch{border-width:2px !important;border-color:#94a3b8 !important;}
    .admin-section select, .quick-actions-card select, .pending-transfer-card select, .admin-group select, .option-panel select, #admin-root select { background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231a73e8'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e") !important; background-repeat:no-repeat !important; background-position:right 10px center !important; background-size:20px !important; padding-right:36px !important; appearance:none !important; -webkit-appearance:none !important; -moz-appearance:none !important; cursor:pointer !important; }
  `;
  document.head.appendChild(style);
}

function renderQuickActions() {
  return '<div class="quick-actions-row-new">' +
    '<div class="quick-action-item-new" onclick="window.showIban()"><div class="quick-action-icon-new green"><svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg></div><div class="quick-action-label-new">' + t('quickIbanLabel') + '</div></div>' +
    '<div class="quick-action-item-new" onclick="window.showVirtualCard()"><div class="quick-action-icon-new blue"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg></div><div class="quick-action-label-new">' + t('quickCardLabel') + '</div></div>' +
    '<div class="quick-action-item-new" onclick="window.navigateTo(\'screen-transfer\')"><div class="quick-action-icon-new purple"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></div><div class="quick-action-label-new">' + t('quickTransferLabel') + '</div></div>' +
  '</div>';
}

function buildBankLogoHtml(tx, circleClass, iconSvg, fallbackLogo) {
  if (!tx.bankLogo) return '<div class="tx-icon-circle-new ' + circleClass + '"><svg viewBox="0 0 24 24">' + iconSvg + '</svg></div>';
  const domain = tx.bankDomain || '';
  const primary = tx.bankLogo;
  const duck = domain ? 'https://icons.duckduckgo.com/ip3/' + domain + '.ico' : '';
  const fallbackEscaped = fallbackLogo.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  const onerr = "this.onerror=null;" + (duck ? "this.src='" + duck + "';this.onerror=function(){this.onerror=null;this.src='" + fallbackEscaped + "';};" : "this.src='" + fallbackEscaped + "';");
  return '<div class="tx-icon-circle-new bank-logo"><img src="' + primary + '" alt="bank" loading="lazy" referrerpolicy="no-referrer" onerror="' + onerr + '" /></div>';
}

function renderTransactions(txs) {
  currentTransactions = txs || [];
  if (!txs || txs.length === 0) { return '<p style="color:#64748b;font-size:11.5px;text-align:center;padding:22px 0;font-weight:600;">' + t('noTransactions') + '</p>'; }
  let h = '<div class="tx-list-new">';
  txs.forEach((tx, idx) => {
    const isCancelled = (tx.type === 'cancelled' || tx.cancelled === true);
    const isIn = tx.type === 'in';
    const isPending = tx.status === 'pending';
    const isRefund = tx.status === 'cancelledPending';
    let circleClass, iconSvg, amountClass, amountSign;
    if (isRefund) { circleClass = 'refund'; iconSvg = '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>'; amountClass = 'refund'; amountSign = '+'; }
    else if (isPending) { circleClass = 'pending'; iconSvg = '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>'; amountClass = 'pending'; amountSign = '−'; }
    else if (isCancelled) { circleClass = 'cancelled'; iconSvg = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'; amountClass = 'cancelled'; amountSign = '+'; }
    else if (isIn) { circleClass = 'in'; iconSvg = '<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>'; amountClass = 'pos'; amountSign = '+'; }
    else { circleClass = 'out'; iconSvg = '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'; amountClass = 'neg'; amountSign = '−'; }
    let iconHtml;
    if (tx.bankLogo && !isCancelled && !isPending && !isRefund) { iconHtml = buildBankLogoHtml(tx, circleClass, iconSvg, FALLBACK_BANK_LOGO); }
    else { iconHtml = '<div class="tx-icon-circle-new ' + circleClass + '"><svg viewBox="0 0 24 24">' + iconSvg + '</svg></div>'; }
    let title;
    if (isRefund) { title = t('txRefund') || 'Remboursement'; }
    else if (isPending) { title = t('pendingResultTitle') || 'Virement en attente'; }
    else if (isCancelled) { title = t('txTransferCancelled'); }
    else if (tx.labelKey) { title = t(tx.labelKey); }
    else if (isIn) { title = t('txTransferReceived'); }
    else { title = t('txTransferSent'); }
    const subtitle = translateSubtitle(tx.subtitle);
    h += '<div class="tx-item-new" onclick="window.openReceipt(' + idx + ')">' + iconHtml + '<div class="tx-info-new"><div class="tx-name-new">' + title + '</div><div class="tx-sub-new">' + subtitle + '</div></div><div class="tx-amount-box-new"><div class="tx-amount-value-new ' + amountClass + '">' + amountSign + ' ' + tx.amount + '</div><div class="tx-date-new">' + tx.date + '</div></div><svg class="tx-chevron-new" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
  });
  h += '</div>';
  return h;
}

function syncClientUI(fresh) {
  if (!fresh) return;
  const previousLang = currentLang;
  currentClient = fresh;
  currentLang = fresh.language || 'fr';
  applyTheme(fresh.themeColor);
  const currency = fresh.currency || '€';
  const balanceFormatted = formatAmount(fresh.balance || 0, currency);
  const balanceRaw = (parseFloat(fresh.balance) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const balanceAmountEl = document.querySelector('.balance-card-amount-new');
  if (balanceAmountEl) { const parts = balanceRaw.split(','); const intPart = parts[0] || '0'; const decPart = parts[1] !== undefined ? ',' + parts[1] : ',00'; balanceAmountEl.innerHTML = '<span class="int-part">' + intPart + '</span><span class="dec-part">' + decPart + '</span><span class="cur-part">' + currency + '</span>'; }
  const currSymbolEl = document.querySelector('.balance-card-type-label-new .curr-symbol');
  if (currSymbolEl) currSymbolEl.textContent = getCurrencyCode(currency);
  const txList = document.getElementById('transaction-list');
  if (txList) txList.innerHTML = renderTransactions(fresh.transactions);
  const greetingTitleEl = document.querySelector('.greeting-title-new');
  if (greetingTitleEl) greetingTitleEl.textContent = t('greeting') + ', ' + fresh.firstName + ' ' + fresh.lastName;
  const transferAmountEl = document.querySelector('#screen-transfer .transfer-amount');
  if (transferAmountEl) transferAmountEl.textContent = balanceFormatted;
  const profileScreen = document.getElementById('screen-profile');
  if (profileScreen) { const initials = ((fresh.firstName || '').charAt(0) + (fresh.lastName || '').charAt(0)).toUpperCase(); profileScreen.innerHTML = renderProfileScreen(fresh, initials, balanceFormatted); }
  const cardBody = document.getElementById('card-modal-body-content');
  if (cardBody) { virtualCardRevealed = false; cardBody.innerHTML = renderCardBody(fresh.cardNumber || '4944595344283327', getCardHolderName(fresh), fresh.cardExpiry || '02/28', fresh.cardCvv || '843', fresh.cardType || 'Visa Debit', fresh.cardMaskLast4 === true, fresh.cardMaskCvv === true, false); }
  const creditCard = document.querySelector('.credit-card .card-holder');
  if (creditCard) creditCard.textContent = getCardHolderName(fresh);
  if (previousLang !== currentLang) {
    const navLabels = { 'nav-dashboard': 'navBalance', 'nav-transfer': 'navPaymentsNew', 'nav-card': 'navCard', 'nav-profile': 'navAccount' };
    Object.keys(navLabels).forEach(function (navId) { const el = document.getElementById(navId); if (el) { const span = el.querySelector('span'); if (span) span.textContent = t(navLabels[navId]); } });
  }
}

function subscribeToClient(clientId) {
  if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; }
  try {
    clientUnsubscribe = onSnapshot(doc(db, 'clients', clientId), (snap) => {
      if (!snap.exists()) { ClientSession.clear(); if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; } initClient(); return; }
      const fresh = Object.assign({ id: snap.id }, snap.data());
      if (fresh.blocked) { ClientSession.clear(); if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; } initClient(); return; }
      syncClientUI(fresh);
    }, () => {});
  } catch (e) {}
}

export function initClientApp() { initClient(); }
export function initAdminApp() { initAdmin(); }
export function initSuperAdminApp() { initSuperAdmin(); }

async function initClient() {
  const clientId = new URLSearchParams(window.location.search).get('id');
  const root = document.getElementById('app-root');
  if (!root) return;
  ensureGlobalStyles();
  if (!clientId) { root.innerHTML = '<div class="view active"><div class="no-access"><div class="ico"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div><h2>Acces restreint</h2><p>Cette application necessite un lien de connexion valide.</p></div></div>'; return; }
  const client = await FireDB.getClient(clientId);
  if (!client) { root.innerHTML = '<div class="view active"><div class="blocked-screen"><div class="ico"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div><h2>Lien invalide</h2><p>Ce lien n\'est plus valide.</p></div></div>'; return; }
  if (client.blocked) { root.innerHTML = '<div class="view active"><div class="blocked-screen"><div class="ico"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div><h2>Compte suspendu</h2><p>Votre acces a ete temporairement suspendu.</p></div></div>'; return; }
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  const activeId = ClientSession.getActive();
  if (activeId === clientId) renderBankingApp(client);
  else renderLoginPage(client);
}

// ============ LOGIN PAGE (rectangulaire + petite) ============
function renderLoginPage(client) {
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  ensureGlobalStyles();
  const root = document.getElementById('app-root');
  const clientName = (client.firstName + ' ' + client.lastName).toUpperCase();

  root.innerHTML = '<div class="view active"><div class="yld-page"><div class="yld-card">' +
    '<div class="yld-logo">' +
      '<svg class="yld-logo-mark" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="14" cy="12" r="4" fill="#0d9488"/>' +
        '<circle cx="24" cy="8" r="3" fill="#0d9488"/>' +
        '<circle cx="34" cy="10" r="2.5" fill="#22c55e"/>' +
        '<circle cx="43" cy="15" r="2.5" fill="#84cc16"/>' +
        '<circle cx="7" cy="22" r="3.5" fill="#0d9488"/>' +
        '<circle cx="6" cy="34" r="3.5" fill="#0d9488"/>' +
        '<circle cx="10" cy="45" r="3" fill="#14b8a6"/>' +
        '<circle cx="20" cy="52" r="2.5" fill="#14b8a6"/>' +
        '<circle cx="32" cy="50" r="3" fill="#0d9488"/>' +
        '<circle cx="43" cy="43" r="3" fill="#0d9488"/>' +
        '<circle cx="50" cy="33" r="3" fill="#0d9488"/>' +
        '<circle cx="49" cy="21" r="2.5" fill="#14b8a6"/>' +
        '<circle cx="20" cy="22" r="2" fill="#5eead4"/>' +
        '<circle cx="24" cy="32" r="2.5" fill="#5eead4"/>' +
        '<circle cx="22" cy="42" r="2" fill="#5eead4"/>' +
        '<circle cx="33" cy="22" r="1.5" fill="#84cc16"/>' +
        '<circle cx="37" cy="30" r="2" fill="#84cc16"/>' +
        '<circle cx="34" cy="40" r="1.5" fill="#14b8a6"/>' +
      '</svg>' +
      '<span class="yld-logo-text">YOUNITED</span>' +
    '</div>' +
    '<div class="yld-hero">' +
      '<svg class="yld-hero-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="yldShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs>' +
        '<path class="yld-shield-pulse" d="M40 4 L72 17 V40 c0 19-15 31-32 37 C23 71 8 59 8 40 V17 Z" fill="#3b82f6" opacity="0.3"/>' +
        '<path d="M40 8 L68 19 V40 c0 17-13 28-28 34 C27 68 12 57 12 40 V19 Z" fill="url(#yldShieldGrad)"/>' +
        '<rect x="28" y="36" width="24" height="22" rx="3.5" fill="#ffffff"/>' +
        '<path d="M33 36 V31 a7 7 0 0 1 14 0 V36" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/>' +
        '<circle cx="40" cy="45" r="2.4" fill="#1d4ed8"/>' +
        '<rect x="38.8" y="45" width="2.4" height="6" rx="1.2" fill="#1d4ed8"/>' +
      '</svg>' +
      '<div class="yld-hero-text"><div class="yld-hero-title">' + t('loginTitle') + '</div></div>' +
    '</div>' +
    '<div class="yld-badge">' +
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' +
      '<span>' + clientName + '</span>' +
    '</div>' +
    '<form id="login-form" autocomplete="off">' +
      '<div class="yld-input-group">' +
        '<div class="yld-input-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></div>' +
        '<input type="email" id="email" placeholder="' + t('emailPh') + '" required>' +
      '</div>' +
      '<div class="yld-input-group">' +
        '<div class="yld-input-icon"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z"/></svg></div>' +
        '<input type="password" id="pin" placeholder="' + t('pinPh') + '" required>' +
        '<button type="button" class="yld-eye" id="pin-eye-toggle" onclick="window.toggleLoginPinVisibility()" aria-label="Afficher/Masquer">' +
          '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="yld-error" id="error-msg">' + t('loginErr') + '</div>' +
      '<button type="submit" class="yld-btn">' +
        '<span>' + t('loginBtn') + '</span>' +
        '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>' +
      '</button>' +
    '</form>' +
    '<div class="yld-footer">' +
      '<div class="yld-footer-item"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg><span>' + t('loginFooterProtected') + '</span></div>' +
      '<div class="yld-footer-divider"></div>' +
      '<div class="yld-footer-item"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>' + t('loginFooterSecure') + '</span></div>' +
      '<div class="yld-footer-divider"></div>' +
      '<div class="yld-footer-item"><svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg><span>' + t('loginFooterSupport') + '</span></div>' +
    '</div>' +
  '</div></div></div>';

  replaceLoginHistory();

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pin = document.getElementById('pin').value.trim();
    if (email === client.email && pin === client.pin) {
      showLoader();
      const fresh = await FireDB.getClient(client.id);
      if (!fresh) { hideLoader(); window.showNotif(t('msgInvalidLink'), 'error'); return; }
      if (fresh.blocked) { hideLoader(); window.showNotif(t('msgAccountSuspended'), 'error'); return; }
      ClientSession.setActive(client.id);
      trackClientSession(client.id, true);
      replaceHistory('screen-dashboard');
      setTimeout(() => { initClient(); hideLoader(); }, 350);
    } else {
      const errEl = document.getElementById('error-msg');
      errEl.style.display = 'block';
      errEl.classList.remove('show');
      void errEl.offsetWidth;
      errEl.classList.add('show');
    }
  });
}

window.toggleLoginPinVisibility = function () {
  const pinInput = document.getElementById('pin');
  const eyeBtn = document.getElementById('pin-eye-toggle');
  if (!pinInput || !eyeBtn) return;
  const isHidden = pinInput.type === 'password';
  pinInput.type = isHidden ? 'text' : 'password';
  if (isHidden) {
    eyeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  } else {
    eyeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  }
};

// ============ PROFILE STYLES ============
function ensureProfileStyles() {
  if (document.getElementById('profile-new-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-new-styles';
  style.textContent = `
    .profile-wrap-new{padding:11px;display:flex;flex-direction:column;gap:11px;background:#f1f5f9;padding-bottom:24px;}
    .profile-hero-new{position:relative;background:linear-gradient(135deg,var(--primary-dark) 0%,var(--primary) 100%);border-radius:6px;padding:16px 14px 18px 14px;overflow:hidden;box-shadow:0 12px 26px rgba(30,58,138,0.32);}
    .profile-hero-new::before{content:'';position:absolute;top:-30%;right:-20%;width:180px;height:180px;background:radial-gradient(circle,rgba(255,255,255,0.22),transparent 70%);border-radius:50%;pointer-events:none;}
    .profile-hero-new::after{content:'';position:absolute;bottom:-45%;left:-15%;width:220px;height:200px;background:radial-gradient(ellipse,rgba(255,255,255,0.14),transparent 70%);border-radius:50%;pointer-events:none;}
    .profile-hero-top{display:flex;align-items:flex-start;gap:14px;position:relative;z-index:2;}
    .profile-avatar-new{position:relative;width:74px;height:74px;flex-shrink:0;}
    .profile-avatar-circle{width:74px;height:74px;border-radius:50%;background:rgba(255,255,255,0.22);border:2.5px solid rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff;letter-spacing:0.5px;box-shadow:0 6px 16px rgba(0,0,0,0.28);}
    .profile-avatar-cam{position:absolute;bottom:-2px;right:-4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.35);border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;}
    .profile-avatar-cam svg{width:11px;height:11px;fill:#fff;}
    .profile-hero-info{flex:1;min-width:0;padding-top:2px;}
    .profile-hero-name{font-size:16px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:6px;word-break:break-word;}
    .profile-hero-status{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:#fff;margin-bottom:6px;}
    .profile-hero-status .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;box-shadow:0 0 0 2.5px rgba(34,197,94,0.25);}
    .profile-hero-email{display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:500;color:rgba(255,255,255,0.88);margin-bottom:9px;max-width:100%;}
    .profile-hero-email svg{width:12px;height:12px;fill:rgba(255,255,255,0.88);flex-shrink:0;}
    .profile-hero-email span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .profile-hero-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.4);padding:5px 11px;border-radius:16px;font-size:9.5px;font-weight:700;color:#fff;}
    .profile-hero-badge svg{width:12px;height:12px;fill:#fff;flex-shrink:0;}
    .profile-edit-btn-new{position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.42);color:#fff;padding:6px 11px;border-radius:14px;font-size:10px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-family:inherit;z-index:3;}
    .profile-edit-btn-new svg{width:11px;height:11px;fill:#fff;flex-shrink:0;}
    .profile-card-new{background:#fff;border-radius:6px;box-shadow:0 3px 12px rgba(15,23,42,0.07);border:1px solid #eef2f7;overflow:hidden;}
    .profile-card-header-new{display:flex;align-items:center;gap:11px;padding:12px 13px;border-bottom:1px solid #f1f5f9;}
    .profile-card-header-icon{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 10px rgba(26,115,232,0.35);}
    .profile-card-header-icon svg{width:17px;height:17px;fill:#fff;}
    .profile-card-header-text{flex:1;min-width:0;}
    .profile-card-header-title{font-size:12.5px;font-weight:800;color:#0f172a;line-height:1.2;}
    .profile-card-header-sub{font-size:9px;color:#94a3b8;font-weight:500;margin-top:2px;}
    .profile-card-header-chev{width:15px;height:15px;fill:#cbd5e1;flex-shrink:0;}
    .profile-rows-new{display:flex;flex-direction:column;padding:2px 0;}
    .profile-row-new{display:flex;align-items:center;gap:11px;padding:11px 13px;}
    .profile-row-new + .profile-row-new{border-top:1px solid #f1f5f9;}
    .profile-row-icon{width:22px;height:22px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
    .profile-row-icon svg{width:17px;height:17px;fill:var(--primary);}
    .profile-row-label{flex:1;min-width:0;font-size:11px;font-weight:500;color:#64748b;}
    .profile-row-value{font-size:12px;font-weight:800;color:#0f172a;text-align:right;max-width:58%;word-break:break-word;line-height:1.3;}
    .profile-row-value.green{color:#16a34a;}
    .profile-row-status-pill{display:inline-flex;align-items:center;gap:4px;background:#dcfce7;color:#16a34a;padding:4px 10px;border-radius:10px;font-size:10px;font-weight:800;}
    .profile-row-status-pill svg{width:11px;height:11px;fill:#16a34a;flex-shrink:0;}
    .profile-logout-new{width:100%;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:#fff;border:none;border-radius:8px;padding:13px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 10px 22px rgba(220,38,38,0.32);}
    .profile-logout-new svg{width:17px;height:17px;fill:#fff;flex-shrink:0;}
    .profile-security-new{position:relative;display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border:1px solid #bfdbfe;border-radius:6px;padding:12px 13px;overflow:hidden;}
    .profile-security-icon{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:2;}
    .profile-security-icon svg{width:17px;height:17px;fill:#fff;}
    .profile-security-text{flex:1;min-width:0;position:relative;z-index:2;}
    .profile-security-title{font-size:11px;font-weight:800;color:#1e3a8a;margin-bottom:2px;}
    .profile-security-desc{font-size:9px;color:#3b82f6;font-weight:500;line-height:1.4;}
    .profile-security-check{width:22px;height:22px;flex-shrink:0;position:relative;z-index:2;}
  `;
  document.head.appendChild(style);
}

function renderProfileScreen(client, initials, balanceFormatted) {
  const rowIcon = (path) => '<div class="profile-row-icon"><svg viewBox="0 0 24 24">' + path + '</svg></div>';
  const iconPerson = '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>';
  const iconEnvelope = '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>';
  const iconPhone = '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>';
  const iconPin = '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>';
  const iconMap = '<path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>';
  const iconCoins = '<path d="M12 2C6.48 2 2 4.02 2 6.5S6.48 11 12 11s10-2.02 10-4.5S17.52 2 12 2zm0 17c-5.05 0-9.13-1.66-9.87-3.87C2.05 15.13 2 15.31 2 15.5 2 17.98 6.48 20 12 20s10-2.02 10-4.5c0-.19-.05-.37-.13-.55C21.13 17.16 17.05 19 12 19zm0-6c-5.05 0-9.13-1.66-9.87-3.87C2.05 9.13 2 9.31 2 9.5 2 11.98 6.48 14 12 14s10-2.02 10-4.5c0-.19-.05-.37-.13-.55C21.13 11.16 17.05 13 12 13z"/>';
  const iconBriefcase = '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>';
  const iconCheckCircle = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>';
  const iconDiamond = '<path d="M19 3H5L2 9l10 12L22 9l-3-6z"/>';
  const iconCam = '<path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>';
  const iconShieldCheck = '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>';
  const iconShieldLock = '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z"/>';
  const iconEdit = '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>';
  const iconChev = '<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>';
  const iconCardHeader = '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>';

  return '<div class="profile-wrap-new">' +
    '<div class="profile-hero-new"><button class="profile-edit-btn-new"><svg viewBox="0 0 24 24">' + iconEdit + '</svg>' + t('profileEditBtn') + '</button><div class="profile-hero-top"><div class="profile-avatar-new"><div class="profile-avatar-circle">' + initials + '</div><div class="profile-avatar-cam"><svg viewBox="0 0 24 24">' + iconCam + '</svg></div></div><div class="profile-hero-info"><div class="profile-hero-name">' + client.firstName + ' ' + client.lastName + '</div><div class="profile-hero-status"><span class="dot"></span>' + t('accountActive') + '</div><div class="profile-hero-email"><svg viewBox="0 0 24 24">' + iconEnvelope + '</svg><span>' + (client.email || '—') + '</span></div><div class="profile-hero-badge"><svg viewBox="0 0 24 24">' + iconShieldCheck + '</svg>' + t('profileVerified') + '</div></div></div></div>' +
    '<div class="profile-card-new"><div class="profile-card-header-new"><div class="profile-card-header-icon"><svg viewBox="0 0 24 24">' + iconPerson + '</svg></div><div class="profile-card-header-text"><div class="profile-card-header-title">' + t('profilePersonalData') + '</div><div class="profile-card-header-sub">' + t('profilePersonalDataSub') + '</div></div><svg class="profile-card-header-chev" viewBox="0 0 24 24">' + iconChev + '</svg></div><div class="profile-rows-new"><div class="profile-row-new">' + rowIcon(iconPerson) + '<div class="profile-row-label">' + t('accountOwner') + '</div><div class="profile-row-value">' + client.firstName + ' ' + client.lastName + '</div></div><div class="profile-row-new">' + rowIcon(iconEnvelope) + '<div class="profile-row-label">' + t('emailLabel') + '</div><div class="profile-row-value">' + (client.email || '—') + '</div></div><div class="profile-row-new">' + rowIcon(iconPhone) + '<div class="profile-row-label">' + t('phoneLabel') + '</div><div class="profile-row-value">' + (client.phone || '—') + '</div></div><div class="profile-row-new">' + rowIcon(iconPin) + '<div class="profile-row-label">' + t('countryLabel') + '</div><div class="profile-row-value">' + (client.country || '—') + '</div></div><div class="profile-row-new">' + rowIcon(iconMap) + '<div class="profile-row-label">' + t('addressLabel') + '</div><div class="profile-row-value">' + (client.address || '—') + '</div></div></div></div>' +
    '<div class="profile-card-new"><div class="profile-card-header-new"><div class="profile-card-header-icon"><svg viewBox="0 0 24 24">' + iconCardHeader + '</svg></div><div class="profile-card-header-text"><div class="profile-card-header-title">' + t('accountAndTransfer') + '</div><div class="profile-card-header-sub">' + t('profileAccountSub') + '</div></div><svg class="profile-card-header-chev" viewBox="0 0 24 24">' + iconChev + '</svg></div><div class="profile-rows-new"><div class="profile-row-new">' + rowIcon(iconCoins) + '<div class="profile-row-label">' + t('balanceProfile') + '</div><div class="profile-row-value green">' + balanceFormatted + '</div></div><div class="profile-row-new">' + rowIcon(iconBriefcase) + '<div class="profile-row-label">' + t('accountType') + '</div><div class="profile-row-value">' + t('accountTypeValue') + '</div></div><div class="profile-row-new">' + rowIcon(iconCheckCircle) + '<div class="profile-row-label">' + t('accountStatus') + '</div><div class="profile-row-value"><span class="profile-row-status-pill"><svg viewBox="0 0 24 24">' + iconCheckCircle + '</svg>' + t('statusActive') + '</span></div></div><div class="profile-row-new">' + rowIcon(iconDiamond) + '<div class="profile-row-label">' + t('supportedTransfer') + '</div><div class="profile-row-value">' + t('transferTypeValue') + '</div></div></div></div>' +
    '<button class="profile-logout-new" onclick="window.ClientLogout()"><svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>' + t('logoutBtn') + '</button>' +
    '<div class="profile-security-new"><div class="profile-security-icon"><svg viewBox="0 0 24 24">' + iconShieldLock + '</svg></div><div class="profile-security-text"><div class="profile-security-title">' + t('securityTitle') + '</div><div class="profile-security-desc">' + t('profileSecurityDesc') + '</div></div><svg class="profile-security-check" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></div>' +
  '</div>';
}

function renderBankingApp(client) {
  currentClient = client;
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  ensureGlobalStyles();
  ensureProfileStyles();
  const root = document.getElementById('app-root');
  const currency = client.currency || '€';
  const balanceFormatted = formatAmount(client.balance || 0, currency);
  const balanceRaw = (parseFloat(client.balance) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const initials = ((client.firstName || '').charAt(0) + (client.lastName || '').charAt(0)).toUpperCase();

  root.innerHTML = '<div class="view active" style="display:flex;flex-direction:column;height:100%;">' +
    '<header class="header-new"><button class="hamburger-btn" onclick="window.ClientLogout()"><svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg></button><div class="header-brand-new"><svg class="header-logo-new" viewBox="0 0 40 40"><rect x="0" y="0" width="40" height="40" rx="9" fill="#1e40af"/><path d="M10 12h16v4H14v4h10v4H14v6h-4V12z" fill="#fff"/><path d="M24 22l6-4v8l-6-4z" fill="#60a5fa"/></svg><div class="header-brand-text-new"><div class="header-brand-title-new">YOUNITED</div></div></div><div class="header-actions-new"><button class="header-icon-btn-new" onclick="window.showNotif(\'' + t('notifSubInfo') + '\', \'info\')"><svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg><span class="header-notif-dot-new"></span></button><button class="header-icon-btn-new avatar-new" onclick="window.navigateTo(\'screen-profile\')"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff"/></svg></button></div></header>' +
    '<div class="screens-container">' +
      '<div id="screen-dashboard" class="screen active">' +
        '<div class="greeting-wrap-new"><div class="greeting-left-new"><span class="greeting-emoji-new">👋</span><div class="greeting-text-new"><div class="greeting-title-new">' + t('greeting') + ', ' + client.firstName + ' ' + client.lastName + '</div></div></div><div class="account-status-badge-new"><span class="account-status-dot-new"></span>' + t('accountActive') + '</div></div>' +
        '<div class="balance-card-new"><div class="balance-bubbles-new"><span class="bbn b1"></span><span class="bbn b2"></span><span class="bbn b3"></span><span class="bbn b4"></span><span class="bbn b5"></span></div><svg class="balance-card-chart-new" viewBox="0 0 400 180" preserveAspectRatio="none"><path d="M0,150 L60,130 L120,110 L180,90 L240,105 L300,70 L360,50 L400,40" stroke="rgba(147,197,253,0.5)" stroke-width="2" fill="none"/></svg><div class="balance-card-inner-new"><div class="balance-card-top-new"><div class="balance-card-type-icon-new"><svg viewBox="0 0 24 24"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg></div><div class="balance-card-type-label-new">' + t('personalLabel') + ' · <span class="curr-symbol">' + getCurrencyCode(currency) + '</span> <svg class="chev" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg></div></div><div class="balance-card-chip-new"><svg class="balance-card-chip-svg-new" viewBox="0 0 40 30"><rect x="0" y="0" width="40" height="30" rx="4" fill="#d4a437"/><rect x="2" y="2" width="36" height="26" rx="3" fill="none" stroke="#8a6a1a" stroke-width="1"/><line x1="0" y1="10" x2="40" y2="10" stroke="#8a6a1a" stroke-width="0.7"/><line x1="0" y1="20" x2="40" y2="20" stroke="#8a6a1a" stroke-width="0.7"/><line x1="13" y1="0" x2="13" y2="30" stroke="#8a6a1a" stroke-width="0.7"/><line x1="27" y1="0" x2="27" y2="30" stroke="#8a6a1a" stroke-width="0.7"/></svg><svg class="balance-card-waves-new" viewBox="0 0 24 24"><path d="M4 8c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2v2c-2 0-2-2-4-2s-2 2-4 2-2-2-4-2-2 2-4 2V8zm0 6c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2v2c-2 0-2-2-4-2s-2 2-4 2-2-2-4-2-2 2-4 2v-2z"/></svg></div><div class="balance-card-amount-new">' + (function(){ const parts = balanceRaw.split(','); const intPart = parts[0] || '0'; const decPart = parts[1] !== undefined ? ',' + parts[1] : ',00'; return '<span class="int-part">' + intPart + '</span><span class="dec-part">' + decPart + '</span><span class="cur-part">' + currency + '</span>'; })() + '</div><div class="balance-card-sub-new"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' + t('availableBalance') + '</div><div class="balance-card-bottom-new"><button class="balance-card-details-btn-new" onclick="window.navigateTo(\'screen-profile\')">' + t('detailsBtn') + ' <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button></div></div></div>' +
        renderQuickActions() +
        '<div class="transactions-section-new"><div class="tx-section-header-new"><div class="tx-section-title-new"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>' + t('transactionHistory') + '</div><button class="see-all-link-new" onclick="window.showFullHistory()">' + t('seeAllBtn') + ' <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button></div><div id="transaction-list">' + renderTransactions(client.transactions) + '</div></div>' +
        '<div class="security-banner-new"><svg class="security-shield-new" viewBox="0 0 120 120"><defs><linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#1e40af"/></linearGradient></defs><path d="M60 12 L100 26 V60 c0 26-18 44-40 50 C38 104 20 86 20 60 V26 Z" fill="url(#shieldGrad)" stroke="#93c5fd" stroke-width="2"/><rect x="42" y="52" width="36" height="30" rx="4" fill="#0a2540" stroke="#93c5fd" stroke-width="1.5"/><path d="M48 52 V44 a12 12 0 0 1 24 0 V52" fill="none" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="66" r="3.5" fill="#93c5fd"/></svg><div class="security-content-new"><div class="security-header-new"><span class="security-header-icon-new"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span><div class="security-title-new">' + t('securityTitle') + '</div></div><div class="security-desc-new">' + t('securityDesc') + '</div><button class="security-btn-new" onclick="window.showNotif(\'' + t('securityDesc') + '\', \'info\', \'' + t('securityTitle') + '\')">' + t('learnMoreBtn') + ' <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg></button></div></div>' +
      '</div>' +
      '<div id="screen-transfer" class="screen"><div class="page-title-bar"><div class="page-title-icon"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></div><span>' + t('sendOutgoingTransfer') + '</span></div><div class="transfer-amount">' + balanceFormatted + '</div><div class="transfer-card"><div class="details-header"><div class="details-icon">i</div><span>' + t('transferDetails') + '</span></div><form id="transfer-form" autocomplete="off"><div class="form-group"><label class="form-label">' + t('amountToDebit') + '</label><input type="text" inputmode="numeric" pattern="[0-9]*" class="form-input amount-input" id="input-amount" required autocomplete="off"><div class="amount-error-msg" id="amount-error-msg" style="display:none;"></div></div><div class="form-group"><label class="form-label">' + t('labelIban') + '</label><input type="text" class="form-input" id="input-iban" required autocomplete="off"></div><div class="form-group"><label class="form-label">' + t('labelSwift') + '</label><input type="text" class="form-input" id="input-swift" required autocomplete="off"></div><div class="form-group"><label class="form-label">' + t('labelBank') + '</label><input type="text" class="form-input" id="input-bank" required autocomplete="off"></div><div class="form-group"><label class="form-label">' + t('labelBeneficiary') + '</label><input type="text" class="form-input" id="input-name" required autocomplete="off"></div><div class="form-group"><label class="form-label">' + t('labelReason') + '</label><input type="text" class="form-input" id="input-title" required autocomplete="off"></div></form><div class="warning-box"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><div class="warning-text">' + t('processingWarning') + '</div></div></div><button class="submit-btn" onclick="window.submitTransferForm()">' + t('nextBtn') + '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button></div>' +
      '<div id="screen-verification" class="screen"><div class="verify-card"><div class="verify-header"><div class="verify-header-icon"><svg viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg></div><div class="verify-header-title">' + t('pendingTitle') + '</div><div class="verify-header-illustration"><svg viewBox="0 0 60 40"><g><rect x="10" y="6" width="42" height="26" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="7" y="9" width="42" height="26" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="4" y="12" width="42" height="26" rx="2" fill="#fff" stroke="currentColor" stroke-width="1.8"/><circle cx="25" cy="25" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="25" y="29" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor">$</text><path d="M48 30 L56 30 M53 27 L56 30 L53 33" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg></div></div><div class="verify-data-block"><div class="verify-list"><div class="verify-row"><div class="verify-row-label">' + t('transferAmountLabel') + '</div><div class="verify-row-value" id="summary-amount">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('beneficiaryLabel') + '</div><div class="verify-row-value" id="summary-name">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('ibanLabel') + ' ' + t('ibanLabelLine2') + '</div><div class="verify-row-value" id="summary-iban">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('swiftLabel') + '</div><div class="verify-row-value" id="summary-swift">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('bankLabel') + '</div><div class="verify-row-value" id="summary-bank">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('reasonLabel') + '</div><div class="verify-row-value" id="summary-title">-</div></div></div><button type="button" class="verify-cancel-btn" onclick="window.cancelTransfer()">' + t('cancelTransferBtn') + ' <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button></div><div class="verify-separator"></div><div class="verify-lock-row"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><span>' + t('lockText') + '</span></div><label class="verify-code-label">' + t('codeLabel') + '</label><input type="text" class="verify-code-input" id="security-code" placeholder="*******" required></div><button class="submit-btn verify-submit-btn" onclick="window.startProcessing()">' + t('validateTransferBtn') + ' <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button></div>' +
      '<div id="screen-processing" class="screen"><div class="processing-page-title">' + t('processingPageTitle') + '</div><div class="verify-card"><div class="processing-status-row"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>' + t('processingStatus') + '</span></div><div class="processing-desc-text">' + t('processingDescLong') + '</div><div class="processing-circle-wrapper"><div class="processing-circle"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" stroke-width="9"/><circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" stroke-width="9" stroke-dasharray="314.159" stroke-dashoffset="314.159" stroke-linecap="round" transform="rotate(-90 60 60)" id="progress-ring"/></svg><div class="processing-circle-label" id="progress-text">0%</div></div></div><div class="processing-details-header"><svg viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg><span>' + t('processingDetailsTitle') + '</span></div><div class="verify-data-block"><div class="verify-list"><div class="verify-row"><div class="verify-row-label">' + t('processingAmountLabel') + '</div><div class="verify-row-value" id="processing-amount">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('processingBeneficiaryLabel') + '</div><div class="verify-row-value" id="processing-beneficiary">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('processingIbanLabel') + '</div><div class="verify-row-value" id="processing-iban">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('processingBankLabel') + '</div><div class="verify-row-value" id="processing-bank">-</div></div></div></div></div></div>' +
      '<div id="screen-result" class="screen"><div class="result-page-wrapper"><div class="result-header-block success" id="result-header-block"><button class="result-close-btn" onclick="window.closeResultModal()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button><div class="result-check-circle success" id="result-check-circle"><svg viewBox="0 0 24 24" id="result-check-svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div></div><div class="result-body-block"><div class="result-title-text success" id="result-title-text"></div><div class="result-details-list" id="result-details-list"></div><div class="result-info-box"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg><span id="result-info-text"></span></div><div class="result-footer-block"><button class="result-close-action" id="result-close-action" onclick="window.closeResultModal()"></button></div></div></div></div>' +
      '<div id="screen-card" class="screen"><div class="info-banner info-banner-blue" id="card-banner"><div class="banner-text">' + t('cardWelcome') + '</div><div class="banner-close" onclick="document.getElementById(\'card-banner\').style.display=\'none\'"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div></div><div class="credit-card"><div><div class="card-brand">YOUNITED</div><div class="card-number">4987 **** **** 3327</div><div class="card-holder">' + getCardHolderName(client) + '</div></div><div class="card-footer"><div><div class="card-expiry">' + t('validUntil') + ' 05/2029</div><div class="card-cvv">CVV : 843</div></div><div class="visa-logo">VISA</div></div></div><div class="card-actions"><button class="btn btn-green" onclick="window.showNotif(\'' + t('activateCardBtn') + '\', \'info\')">' + t('activateCardBtn') + '</button><button class="btn btn-red" onclick="window.showNotif(\'' + t('blockCardBtn') + '\', \'info\')">' + t('blockCardBtn') + '</button></div><div class="card-transactions-title">' + t('cardTransactions') + '</div><div class="spinner-container"><div class="spinner"></div></div></div>' +
      '<div id="screen-profile" class="screen">' + renderProfileScreen(client, initials, balanceFormatted) + '</div>' +
    '</div>' +
    '<nav class="bottom-nav-new"><div class="bottom-nav-inner-new"><button class="nav-item-new active" id="nav-dashboard" onclick="window.navigateTo(\'screen-dashboard\')"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>' + t('navBalance') + '</span></button><button class="nav-item-new" id="nav-transfer" onclick="window.navigateTo(\'screen-transfer\')"><svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg><span>' + t('navPaymentsNew') + '</span></button><button class="nav-item-new" id="nav-card" onclick="window.showVirtualCard()"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg><span>' + t('navCard') + '</span></button><button class="nav-item-new" id="nav-profile" onclick="window.navigateTo(\'screen-profile\')"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>' + t('navAccount') + '</span></button></div></nav>' +
  '</div>';
  subscribeToClient(client.id);
  if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '') replaceHistory('screen-dashboard');
}

window.ClientLogout = function() { if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; } if (currentClient && currentClient.id) trackClientSession(currentClient.id, false); ClientSession.clear(); replaceLoginHistory(); initClient(); };

window.navigateTo = function(id) { showLoader(); setTimeout(() => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); const target = document.getElementById(id); if (target) target.classList.add('active'); document.querySelectorAll('.nav-item-new').forEach(i => i.classList.remove('active')); const map = { 'screen-dashboard': 'nav-dashboard', 'screen-card': 'nav-card', 'screen-profile': 'nav-profile' }; let navId = map[id]; if (['screen-transfer', 'screen-verification', 'screen-processing', 'screen-result'].indexOf(id) !== -1) navId = 'nav-transfer'; if (navId) { const n = document.getElementById(navId); if (n) n.classList.add('active'); } const container = document.querySelector('.screens-container'); if (container) container.scrollTop = 0; pushHistory(id); hideLoader(); }, 250); };

window.cancelTransfer = function() { const form = document.getElementById('transfer-form'); if (form) form.reset(); const codeInput = document.getElementById('security-code'); if (codeInput) codeInput.value = ''; const amountErr = document.getElementById('amount-error-msg'); if (amountErr) { amountErr.style.display = 'none'; amountErr.textContent = ''; } const amountEl = document.getElementById('input-amount'); if (amountEl) amountEl.classList.remove('input-error'); pendingTransferAmount = 0; pendingTransferPercent = 100; window.navigateTo('screen-transfer'); };

window.showFullHistory = function() { const old = document.getElementById('full-history-modal-dyn'); if (old) old.remove(); const txs = (currentClient && currentClient.transactions) || []; let bodyHtml; if (!txs || txs.length === 0) { bodyHtml = '<div class="full-history-empty"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>' + t('noTransactions') + '</div>'; } else { bodyHtml = renderTransactions(txs); } const ov = document.createElement('div'); ov.id = 'full-history-modal-dyn'; ov.className = 'full-history-overlay'; ov.innerHTML = '<div class="full-history-modal"><div class="full-history-header"><h3>' + t('transactionHistory') + '</h3><button class="full-history-close" onclick="document.getElementById(\'full-history-modal-dyn\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="full-history-body">' + bodyHtml + '</div></div>'; ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov); };

window.openReceipt = function(idx) {
  if (!currentTransactions || !currentTransactions[idx]) return;
  const tx = currentTransactions[idx];
  const isCancelled = (tx.type === 'cancelled' || tx.cancelled === true);
  const isIn = tx.type === 'in';
  const isFailed = tx.status === 'failed';
  const isPending = tx.status === 'pending';
  const isRefund = tx.status === 'cancelledPending';
  const old = document.getElementById('receipt-modal-dynamic'); if (old) old.remove();
  const iconArrowDown = '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>';
  const iconArrowUp = '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>';
  const iconX = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
  const iconClock = '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>';
  const iconHash = '<path d="M7 2h2v4h4V2h2v4h3v2h-3v4h3v2h-3v4h-2v-4h-4v4H7v-4H4v-2h3V8H4V6h3V2zm2 6v4h4V8H9z"/>';
  const iconCard = '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>';
  const iconUser = '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>';
  const iconCalendar = '<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>';
  const iconRef = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>';
  const iconStatus = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>';
  const iconRefund = '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>';
  let headerColor, statusLabel, statusBadgeText, headerIcon;
  if (isRefund) { headerColor = '#2563eb'; statusLabel = t('txRefund') || 'Remboursement'; statusBadgeText = t('txRefund') || 'Remboursement'; headerIcon = iconRefund; }
  else if (isPending) { headerColor = '#f59e0b'; statusLabel = t('pendingResultTitle') || 'En attente'; statusBadgeText = t('pendingResultTitle') || 'En attente'; headerIcon = iconClock; }
  else if (isCancelled) { headerColor = '#8b5cf6'; statusLabel = t('transferCancelledTitle'); statusBadgeText = t('transferCancelledTitle'); headerIcon = iconX; }
  else if (isIn) { headerColor = '#10b981'; statusLabel = t('receiptStatusDone'); statusBadgeText = t('receiptReceived'); headerIcon = iconArrowDown; }
  else { headerColor = isFailed ? '#dc2626' : '#dc2626'; statusLabel = isFailed ? t('transferFailedTitle') : t('receiptStatusDone'); statusBadgeText = t('receiptSent'); headerIcon = iconArrowUp; }
  const amountSign = (isCancelled || isRefund) ? '+' : (isIn ? '+' : '-');
  const ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-8) + '-' + String(idx + 1).padStart(3, '0');
  const txId = 'CR' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  const rowHtml = (label, value, iconPath, valueColor, isStatus) => '<div class="receipt-line"><div class="receipt-line-icon"><svg viewBox="0 0 24 24">' + iconPath + '</svg></div><div class="receipt-line-content"><div class="receipt-line-label">' + label + '</div>' + (isStatus ? '<div class="receipt-line-status" style="color:' + valueColor + ';border-color:' + valueColor + ';background:' + valueColor + '15;">' + value + '</div>' : '<div class="receipt-line-value" style="' + (valueColor ? 'color:' + valueColor + ';' : '') + '">' + value + '</div>') + '</div></div>';
  const labelThird = (isIn || isCancelled || isRefund) ? t('receiptFrom') : t('receiptTo');
  const ov = document.createElement('div');
  ov.id = 'receipt-modal-dynamic'; ov.className = 'receipt-overlay';
  ov.innerHTML = '<div class="receipt-modal-new"><div class="receipt-header-new' + (isPending ? ' pending' : '') + '" style="background:' + headerColor + ';"><button class="receipt-close-new" onclick="document.getElementById(\'receipt-modal-dynamic\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button><div class="receipt-header-circle"><svg viewBox="0 0 24 24">' + headerIcon + '</svg></div><div class="receipt-header-amount">' + amountSign + ' ' + tx.amount + '</div><div class="receipt-header-status">' + statusBadgeText + '</div></div><div class="receipt-body-new">' + rowHtml(t('receiptRef'), txId, iconHash) + rowHtml(t('receiptAmount'), amountSign + ' ' + tx.amount, iconCard, headerColor) + rowHtml(labelThird, tx.subtitle || '—', iconUser) + rowHtml(t('receiptDate'), tx.date, iconCalendar) + rowHtml(t('receiptTitle'), ref, iconRef) + rowHtml(t('receiptStatus'), statusLabel, iconStatus, headerColor, true) + '</div></div>';
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
};

window.showIban = function() { if (!currentClient) return; const old = document.getElementById('iban-modal-dynamic'); if (old) old.remove(); const rawIban = currentClient.iban || currentClient.address || 'N/A'; const ownerName = getCardHolderName(currentClient); const bic = currentClient.bic || 'BICCODEXX'; const adminForcedMask = currentClient.ibanMasked === true; const displayIban = adminForcedMask ? maskIban(rawIban) : rawIban; const formattedIban = formatIban(displayIban); const L = ibanLabels[currentLang] || ibanLabels.fr; const ov = document.createElement('div'); ov.id = 'iban-modal-dynamic'; ov.style.cssText = 'position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;background:rgba(15,23,42,0.7)!important;display:flex!important;justify-content:center!important;align-items:center!important;z-index:2147483647!important;padding:16px!important;box-sizing:border-box!important;overflow-y:auto!important;'; ov.innerHTML = '<div class="modal iban-modal-new"><div class="iban-new-header"><div class="iban-new-icon"><svg viewBox="0 0 24 24"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg></div><div class="iban-new-header-text"><div class="iban-new-title">' + L.title + '</div></div><button class="iban-new-close" onclick="document.getElementById(\'iban-modal-dynamic\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="iban-new-body"><div class="iban-new-iban-box"><div class="iban-new-iban-head"><span class="iban-new-iban-label">' + L.numberLabel + '</span><button class="iban-new-copy" id="iban-copy-label" onclick="window.copyIban()"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span>' + t('copyBtn') + '</span></button></div><div class="iban-new-iban-value">' + formattedIban + '</div></div><div class="iban-new-row"><div class="iban-new-info"><div class="iban-new-info-label">' + L.ownerLabel + '</div><div class="iban-new-info-value">' + ownerName + '</div></div><div class="iban-new-info"><div class="iban-new-info-label">' + L.bicLabel + '</div><div class="iban-new-info-value">' + bic + '</div></div></div>' + (adminForcedMask ? '<div class="iban-new-warning"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><span>' + L.warning + '</span></div>' : '') + '</div></div>'; ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov); };

window.copyIban = function() { const adminForcedMask = currentClient.ibanMasked === true; const rawIban = currentClient.iban || currentClient.address || ''; const toCopy = adminForcedMask ? maskIban(rawIban) : rawIban; const labelEl = document.getElementById('iban-copy-label'); if (!labelEl) return; const span = labelEl.querySelector('span') || labelEl; const orig = span.innerText; const show = () => { span.innerText = 'OK ' + t('copied'); setTimeout(() => { span.innerText = orig; }, 1500); }; if (navigator.clipboard) { navigator.clipboard.writeText(toCopy).then(show).catch(show); } else { const ta = document.createElement('textarea'); ta.value = toCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); show(); } };

function ensureVirtualCardStyles() {
  if (document.getElementById('vcard-styles')) return;
  const style = document.createElement('style');
  style.id = 'vcard-styles';
  style.textContent = `
    .vcard-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.75);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;justify-content:center;align-items:center;z-index:2147483647;padding:12px;box-sizing:border-box;overflow-y:auto;}
    .vcard-modal{background:#fff;border-radius:16px;width:100%;max-width:270px;max-height:82vh;overflow-y:auto;box-shadow:0 22px 55px rgba(15,23,42,0.45);display:flex;flex-direction:column;}
    .vcard-modal-header{display:flex;align-items:center;gap:7px;padding:9px 10px 7px 10px;border-bottom:1px solid #f1f5f9;flex-shrink:0;}
    .vcard-modal-header-icon{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .vcard-modal-header-icon svg{width:13px;height:13px;fill:#fff;}
    .vcard-modal-header-text{flex:1;min-width:0;}
    .vcard-modal-title{font-size:12px;font-weight:700;color:#0f172a;line-height:1.2;}
    .vcard-modal-subtitle{font-size:8px;color:#94a3b8;font-weight:500;margin-top:1px;}
    .vcard-modal-close{width:22px;height:22px;border-radius:50%;background:#f1f5f9;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:inherit;}
    .vcard-modal-close svg{width:9px;height:9px;fill:#64748b;}
    .vcard-modal-body{padding:9px;display:flex;flex-direction:column;gap:7px;background:#fff;}
    .vcard-card{position:relative;width:100%;aspect-ratio:1.586/1;border-radius:11px;padding:9px 11px;background:linear-gradient(125deg,#0a1e5c 0%,#16257a 25%,#3b1d95 55%,#6d28d9 85%,#a855f7 100%);overflow:hidden;box-shadow:0 9px 20px rgba(76,29,149,0.42);display:flex;flex-direction:column;justify-content:space-between;color:#fff;box-sizing:border-box;font-family:'Titillium Web',Arial,sans-serif;}
    .vcard-card::before{content:'';position:absolute;top:-45%;right:-35%;width:150%;height:150%;background:radial-gradient(ellipse at 65% 50%,rgba(168,85,247,0.55),transparent 60%);pointer-events:none;}
    .vcard-card::after{content:'';position:absolute;bottom:-55%;left:-25%;width:110%;height:110%;background:radial-gradient(ellipse at 40% 55%,rgba(37,99,235,0.45),transparent 65%);pointer-events:none;}
    .vcard-card-top{display:flex;align-items:flex-start;justify-content:space-between;position:relative;z-index:3;}
    .vcard-brand{display:flex;align-items:center;gap:5px;}
    .vcard-brand-mark{width:18px;height:18px;flex-shrink:0;}
    .vcard-brand-text{display:flex;flex-direction:column;}
    .vcard-brand-name{font-size:9.5px;font-weight:800;color:#fff;letter-spacing:0.8px;line-height:1;}
    .vcard-brand-sub{font-size:4.5px;font-weight:600;color:rgba(255,255,255,0.8);letter-spacing:1.1px;margin-top:2px;}
    .vcard-contactless{width:15px;height:15px;flex-shrink:0;}
    .vcard-chip{width:24px;height:18px;border-radius:3px;background:linear-gradient(135deg,#f5d67b 0%,#d4a437 50%,#b08a1f 100%);border:1px solid rgba(139,105,20,0.5);position:relative;z-index:3;margin-top:4px;overflow:hidden;}
    .vcard-chip::before,.vcard-chip::after{content:'';position:absolute;background:rgba(139,105,20,0.55);}
    .vcard-chip::before{top:0;bottom:0;left:33%;width:1px;}
    .vcard-chip::after{top:0;bottom:0;right:33%;width:1px;}
    .vcard-chip-inner{position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(139,105,20,0.55);transform:translateY(-50%);}
    .vcard-number{font-family:'Courier New',Consolas,monospace;font-size:11.5px;font-weight:700;color:#fff;letter-spacing:1.3px;position:relative;z-index:3;margin-top:6px;text-shadow:0 1px 3px rgba(0,0,0,0.3);word-break:break-all;line-height:1.15;}
    .vcard-bottom{display:grid;grid-template-columns:1.3fr 1fr 0.65fr auto;gap:4px;align-items:flex-end;position:relative;z-index:3;}
    .vcard-bottom-item{min-width:0;}
    .vcard-bottom-label{font-size:4.5px;font-weight:700;color:rgba(255,255,255,0.65);letter-spacing:0.8px;margin-bottom:2px;white-space:nowrap;}
    .vcard-bottom-value{font-size:7.5px;font-weight:800;color:#fff;letter-spacing:0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .vcard-visa{display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0;}
    .vcard-visa-mark{font-size:12px;font-weight:900;font-style:italic;color:#fff;letter-spacing:-0.5px;line-height:1;}
    .vcard-visa-sub{font-size:4px;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:1px;margin-top:1px;}
    .vcard-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
    .vcard-info{display:flex;align-items:center;gap:6px;background:#f8fafc;border:1px solid #eef2f7;border-radius:8px;padding:7px 8px;min-width:0;}
    .vcard-info.full{grid-column:span 2;}
    .vcard-info-icon{width:24px;height:24px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:5px;box-sizing:border-box;}
    .vcard-info-icon svg{width:100%;height:100%;fill:#2563eb;}
    .vcard-info-icon.visa{background:#eef2f7;padding:4px 5px;}
    .vcard-info-icon.visa svg{fill:#1a1f71;}
    .vcard-info-text{min-width:0;flex:1;}
    .vcard-info-label{font-size:7.5px;color:#94a3b8;font-weight:600;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .vcard-info-value{font-size:10px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .vcard-info-value.mono{font-family:'Courier New',Consolas,monospace;letter-spacing:0.5px;font-size:9.5px;}
    .vcard-info-eye{width:22px;height:22px;border-radius:50%;background:#e2e8f0;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0;font-family:inherit;}
    .vcard-info-eye svg{width:10px;height:10px;fill:#475569;}
    .vcard-copy-btn{width:100%;background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 45%,#6d28d9 100%);color:#fff;border:none;border-radius:9px;padding:10px 11px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 8px 18px rgba(124,58,237,0.42);}
    .vcard-copy-btn svg{width:12px;height:12px;fill:#fff;flex-shrink:0;}
    .vcard-security{display:flex;align-items:center;gap:7px;background:#f3eeff;border:1px solid #ddd3f7;border-radius:8px;padding:7px 8px;}
    .vcard-security-icon{width:26px;height:26px;border-radius:50%;background:#ddd3f7;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:5px;box-sizing:border-box;}
    .vcard-security-icon svg{width:100%;height:100%;fill:#6d28d9;}
    .vcard-security-text{flex:1;min-width:0;}
    .vcard-security-title{font-size:9.5px;font-weight:800;color:#3b1d82;margin-bottom:2px;line-height:1.25;}
    .vcard-security-desc{font-size:8px;color:#5b4a8a;line-height:1.35;font-weight:500;}
    .vcard-security-check{width:16px;height:16px;flex-shrink:0;}
  `;
  document.head.appendChild(style);
}

window.showVirtualCard = function() {
  if (!currentClient) { window.showNotif(t('msgClientNotInit'), 'error'); return; }
  ensureVirtualCardStyles();
  const old = document.getElementById('card-modal-dynamic'); if (old) old.remove();
  const cardNum = currentClient.cardNumber || '4944595344283327';
  const cardHolder = getCardHolderName(currentClient);
  const cardExpiry = currentClient.cardExpiry || '02/28';
  const cardCvv = currentClient.cardCvv || '843';
  const cardType = currentClient.cardType || 'Visa Debit';
  const maskLast4 = currentClient.cardMaskLast4 === true;
  const maskCvv = currentClient.cardMaskCvv === true;
  virtualCardRevealed = false;
  const L = cardLabels[currentLang] || cardLabels.fr;
  const subtitle = (currentLang === 'fr') ? 'Votre carte de paiement en ligne' : (currentLang === 'pl') ? 'Twoja karta płatnicza online' : (currentLang === 'es') ? 'Tu tarjeta de pago online' : (currentLang === 'it') ? 'La tua carta di pagamento online' : 'Ihre Online-Zahlungskarte';
  const ov = document.createElement('div');
  ov.id = 'card-modal-dynamic';
  ov.className = 'vcard-overlay';
  ov.innerHTML = '<div class="vcard-modal"><div class="vcard-modal-header"><div class="vcard-modal-header-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg></div><div class="vcard-modal-header-text"><div class="vcard-modal-title">' + L.title + '</div><div class="vcard-modal-subtitle">' + subtitle + '</div></div><button class="vcard-modal-close" onclick="document.getElementById(\'card-modal-dynamic\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div id="card-modal-body-content" class="vcard-modal-body">' + renderCardBody(cardNum, cardHolder, cardExpiry, cardCvv, cardType, maskLast4, maskCvv, false) + '</div></div>';
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
};

function renderCardBody(cardNum, cardHolder, cardExpiry, cardCvv, cardType, maskLast4, maskCvv, revealed) {
  const L = cardLabels[currentLang] || cardLabels.fr;
  const adminForcedNumber = maskLast4 === true;
  const adminForcedCvv = maskCvv === true;
  const anyAdminForced = adminForcedNumber || adminForcedCvv;
  const showFullNumber = adminForcedNumber ? false : (anyAdminForced ? true : revealed);
  const showFullCvv = adminForcedCvv ? false : (anyAdminForced ? true : revealed);
  const displayNum = showFullNumber ? cardNum : maskCardNumber(cardNum);
  const displayCvv = showFullCvv ? cardCvv : '•••';
  const formattedNum = formatCardNumber(displayNum);
  const formattedHolder = (cardHolder || '').toUpperCase();
  let warningText;
  if (adminForcedNumber && adminForcedCvv) warningText = L.warningAdminMasked;
  else if (adminForcedNumber) warningText = L.warningMasked;
  else if (adminForcedCvv) warningText = L.warningCvvMasked;
  else if (revealed) warningText = L.warningFull;
  else warningText = L.warningMasked;
  const eyeIcon = showFullNumber ? '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
  const hideEye = (adminForcedNumber && adminForcedCvv) ? 'style="display:none;"' : '';
  return '<div class="vcard-card"><div class="vcard-card-top"><div class="vcard-brand"><svg class="vcard-brand-mark" viewBox="0 0 40 40"><rect x="0" y="0" width="40" height="40" rx="9" fill="#1e40af"/><path d="M10 12h16v4H14v4h10v4H14v6h-4V12z" fill="#fff"/><path d="M24 22l6-4v8l-6-4z" fill="#60a5fa"/></svg><div class="vcard-brand-text"><div class="vcard-brand-name">YOUNITED</div><div class="vcard-brand-sub">VIRTUAL CARD</div></div></div><svg class="vcard-contactless" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M8 9a7 7 0 0 1 0 6"/><path d="M11.5 7a10 10 0 0 1 0 10"/><path d="M15 5a13 13 0 0 1 0 14"/></svg></div><div class="vcard-chip"><div class="vcard-chip-inner"></div></div><div class="vcard-number">' + formattedNum + '</div><div class="vcard-bottom"><div class="vcard-bottom-item"><div class="vcard-bottom-label">TITULAIRE</div><div class="vcard-bottom-value">' + formattedHolder + '</div></div><div class="vcard-bottom-item"><div class="vcard-bottom-label">VALABLE JUSQU\'À</div><div class="vcard-bottom-value">' + cardExpiry + '</div></div><div class="vcard-bottom-item"><div class="vcard-bottom-label">CVV</div><div class="vcard-bottom-value">' + displayCvv + '</div></div><div class="vcard-visa"><div class="vcard-visa-mark">VISA</div><div class="vcard-visa-sub">DEBIT</div></div></div></div>' +
    '<div class="vcard-info-grid"><div class="vcard-info"><div class="vcard-info-icon"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div><div class="vcard-info-text"><div class="vcard-info-label">Titulaire</div><div class="vcard-info-value">' + formattedHolder + '</div></div></div><div class="vcard-info"><div class="vcard-info-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg></div><div class="vcard-info-text"><div class="vcard-info-label">Valable jusqu\'au</div><div class="vcard-info-value">' + cardExpiry + '</div></div></div></div>' +
    '<div class="vcard-info full"><div class="vcard-info-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg></div><div class="vcard-info-text"><div class="vcard-info-label">Numéro de carte</div><div class="vcard-info-value mono">' + formattedNum + '</div></div><button class="vcard-info-eye" onclick="window.toggleCardVisibility()" ' + hideEye + '>' + eyeIcon + '</button></div>' +
    '<div class="vcard-info-grid"><div class="vcard-info"><div class="vcard-info-icon"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div><div class="vcard-info-text"><div class="vcard-info-label">CVV</div><div class="vcard-info-value">' + displayCvv + '</div></div></div><div class="vcard-info"><div class="vcard-info-icon visa"><svg viewBox="0 0 48 16"><path d="M20.3 12.5l2.5-10.3h4l-2.5 10.3h-4zm18.6-10.1c-.8-.3-2-.6-3.6-.6-3.9 0-6.7 2-6.7 4.8 0 2.1 2 3.3 3.5 4 1.5.7 2 1.2 2 1.9 0 1-1.2 1.5-2.3 1.5-1.9 0-2.9-.3-4.5-1l-.6-.3-.7 4.1c1.1.5 3.2 1 5.3 1 4.1 0 6.8-2 6.8-5.1 0-1.7-1-3-3.3-4-1.4-.7-2.2-1.1-2.2-1.8 0-.6.7-1.3 2.2-1.3 1.5 0 2.7.3 3.6.7l.4.2.6-4.1z" fill="currentColor"/></svg></div><div class="vcard-info-text"><div class="vcard-info-label">Type</div><div class="vcard-info-value">' + cardType + '</div></div></div></div>' +
    '<button class="vcard-copy-btn" onclick="window.copyCardNumber()"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span id="card-copy-label">' + L.copyBtn + '</span></button>' +
    '<div class="vcard-security"><div class="vcard-security-icon"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg></div><div class="vcard-security-text"><div class="vcard-security-title">Votre sécurité, notre priorité</div><div class="vcard-security-desc">' + warningText + '</div></div><svg class="vcard-security-check" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></div>';
}

window.toggleCardVisibility = function() { if (!currentClient) return; if (currentClient.cardMaskLast4 === true || currentClient.cardMaskCvv === true) return; virtualCardRevealed = !virtualCardRevealed; const body = document.getElementById('card-modal-body-content'); if (!body) return; body.innerHTML = renderCardBody(currentClient.cardNumber || '4944595344283327', getCardHolderName(currentClient), currentClient.cardExpiry || '02/28', currentClient.cardCvv || '843', currentClient.cardType || 'Visa Debit', currentClient.cardMaskLast4 === true, currentClient.cardMaskCvv === true, virtualCardRevealed); };

window.copyCardNumber = function() { const adminForcedNumber = currentClient.cardMaskLast4 === true; const raw = currentClient.cardNumber || ''; const toCopy = adminForcedNumber ? maskCardNumber(raw) : raw; if (!toCopy) return; const btn = document.getElementById('card-copy-label'); if (!btn) return; const orig = btn.innerText; const show = () => { btn.innerText = 'OK ' + t('copied'); setTimeout(() => { btn.innerText = orig; }, 1500); }; if (navigator.clipboard) { navigator.clipboard.writeText(toCopy).then(show).catch(show); } else { const ta = document.createElement('textarea'); ta.value = toCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); show(); } };

function showAmountError(message) {
  const errEl = document.getElementById('amount-error-msg');
  const amountEl = document.getElementById('input-amount');
  if (errEl) { errEl.textContent = message; errEl.style.display = 'block'; errEl.style.animation = 'none'; void errEl.offsetWidth; errEl.style.animation = ''; }
  if (amountEl) { amountEl.classList.add('input-error'); try { amountEl.focus(); } catch (e) {} }
}

function hideAmountError() {
  const errEl = document.getElementById('amount-error-msg');
  const amountEl = document.getElementById('input-amount');
  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  if (amountEl) amountEl.classList.remove('input-error');
}

window.submitTransferForm = function() {
  hideAmountError();
  const amountRaw = (document.getElementById('input-amount').value || '').trim();
  const balance = parseFloat(currentClient.balance) || 0;
  const currency = currentClient.currency || '€';
  if (!amountRaw) { showAmountError(t('invalidAmountFormat')); return; }
  if (!/^\d+$/.test(amountRaw)) { showAmountError(t('invalidAmountFormat')); return; }
  const amount = parseInt(amountRaw, 10);
  if (isNaN(amount) || amount <= 0) { showAmountError(t('invalidAmountFormat')); return; }
  if (amount > balance) { showAmountError(t('amountExceedsBalance')); return; }
  pendingTransferAmount = amount;
  const iban = document.getElementById('input-iban').value.trim();
  const swift = document.getElementById('input-swift').value.trim();
  const bank = document.getElementById('input-bank').value.trim();
  const name = document.getElementById('input-name').value.trim();
  const title = document.getElementById('input-title').value.trim();
  if (!iban || !swift || !bank || !name || !title) { window.showNotif(t('msgFillAllFields'), 'warning'); return; }
  document.getElementById('summary-amount').innerText = formatAmount(amount, currency);
  document.getElementById('summary-iban').innerText = iban;
  document.getElementById('summary-swift').innerText = swift;
  document.getElementById('summary-bank').innerText = bank;
  document.getElementById('summary-name').innerText = name;
  document.getElementById('summary-title').innerText = title;
  window.navigateTo('screen-verification');
};

window.startProcessing = function() {
  const code = document.getElementById('security-code').value.trim();
  if (!code) { window.showNotif(t('msgEnterCode'), 'warning'); return; }
  if (code !== currentClient.activationCode) { window.showNotif(t('msgCodeIncorrect'), 'error'); return; }
  const currency = currentClient.currency || '€';
  const inputIban = document.getElementById('input-iban').value;
  const inputBank = document.getElementById('input-bank').value;
  const inputName = document.getElementById('input-name').value;
  const procIban = document.getElementById('processing-iban');
  const procAmount = document.getElementById('processing-amount');
  const procBeneficiary = document.getElementById('processing-beneficiary');
  const procBank = document.getElementById('processing-bank');
  if (procIban) procIban.innerText = inputIban;
  if (procAmount) procAmount.innerText = formatAmount(pendingTransferAmount, currency);
  if (procBeneficiary) procBeneficiary.innerText = inputName;
  if (procBank) procBank.innerText = inputBank;
  window.navigateTo('screen-processing');
  const ring = document.getElementById('progress-ring');
  const pt = document.getElementById('progress-text');
  const circumference = 2 * Math.PI * 50;
  let progress = currentClient.startPercent || 0;
  const stopAt = currentClient.stopPercent || 100;
  pendingTransferPercent = stopAt;
  const updateRing = (p) => { if (ring) ring.style.strokeDashoffset = circumference - (circumference * p / 100); if (pt) pt.innerText = p + '%'; };
  updateRing(progress);
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (progress >= stopAt) { clearInterval(progressInterval); setTimeout(() => { showResultPage(stopAt >= 100); }, 500); return; }
    progress += Math.floor(Math.random() * 3) + 1;
    if (progress > stopAt) progress = stopAt;
    updateRing(progress);
  }, 150);
};

function showResultPage(isSuccess) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const currency = currentClient.currency || '€';
  const amountFormatted = formatAmount(pendingTransferAmount || 0, currency);
  const iban = document.getElementById('input-iban').value; const swift = document.getElementById('input-swift').value; const bank = document.getElementById('input-bank').value; const name = document.getElementById('input-name').value; const reason = document.getElementById('input-title').value;
  const headerBlock = document.getElementById('result-header-block'); const checkCircle = document.getElementById('result-check-circle'); const checkSvg = document.getElementById('result-check-svg'); const titleText = document.getElementById('result-title-text'); const detailsList = document.getElementById('result-details-list'); const infoText = document.getElementById('result-info-text'); const closeBtn = document.getElementById('result-close-action');
  const isPending = isSuccess && currentClient && currentClient.pendingTransferEnabled === true;
  if (isPending) {
    headerBlock.className = 'result-header-block pending';
    checkCircle.className = 'result-check-circle pending';
    checkSvg.innerHTML = '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>';
    titleText.className = 'result-title-text pending';
    titleText.innerText = t('pendingResultTitle') || 'Virement en attente de validation';
    infoText.innerText = t('pendingResultMsg') || currentClient.message || '...';
  } else if (isSuccess) {
    headerBlock.className = 'result-header-block success';
    checkCircle.className = 'result-check-circle success';
    checkSvg.innerHTML = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
    titleText.className = 'result-title-text success';
    titleText.innerText = t('modalSuccess').replace('{amount}', amountFormatted);
    infoText.innerText = currentClient.message || '...';
  } else {
    headerBlock.className = 'result-header-block failure';
    checkCircle.className = 'result-check-circle failure';
    checkSvg.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
    titleText.className = 'result-title-text failure';
    titleText.innerText = (t('modalFailedAt') || 'Virement {amount} echoue a {percent}%').replace('{amount}', amountFormatted).replace('{percent}', pendingTransferPercent);
    infoText.innerText = currentClient.message || '...';
  }
  detailsList.innerHTML = '<div class="result-detail-row"><span class="result-detail-label">' + t('receiptAmount') + ' :</span><span class="result-detail-value">' + amountFormatted + '</span></div><div class="result-detail-row"><span class="result-detail-label">' + t('beneficiaryLabel') + '</span><span class="result-detail-value">' + name + '</span></div><div class="result-detail-row"><span class="result-detail-label">' + t('bankLabel') + '</span><span class="result-detail-value">' + bank + '</span></div><div class="result-detail-row"><span class="result-detail-label">' + t('ibanLabel') + '</span><span class="result-detail-value">' + iban + '</span></div><div class="result-detail-row"><span class="result-detail-label">' + t('swiftLabel') + '</span><span class="result-detail-value">' + swift + '</span></div><div class="result-detail-row"><span class="result-detail-label">' + t('reasonLabel') + '</span><span class="result-detail-value">' + reason + '</span></div><div class="result-detail-row"><span class="result-detail-label">' + t('sendTime') + '</span><span class="result-detail-value">' + dateStr + '</span></div>';
  closeBtn.innerText = t('closeBtn');
  window.currentTransferSuccess = isSuccess;
  window.currentTransferPending = isPending;
  window.navigateTo('screen-result');
}

window.closeResultModal = async function() {
  const isSuccess = window.currentTransferSuccess;
  const isPending = window.currentTransferPending === true;
  const currency = currentClient.currency || '€';
  const fresh = await FireDB.getClient(currentClient.id);
  if (!fresh) { window.showNotif(t('msgAccountDeleted'), 'error'); window.location.reload(); return; }
  if (fresh.blocked) { window.showNotif(t('msgAccountSuspended'), 'error'); ClientSession.clear(); window.location.reload(); return; }
  const amt = pendingTransferAmount || 0; const percent = pendingTransferPercent;
  const now = new Date(); const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const recipientIban = document.getElementById('input-iban').value; const recipientBank = document.getElementById('input-bank').value; const recipientSwift = document.getElementById('input-swift').value; const recipientName = document.getElementById('input-name').value; const recipientReason = document.getElementById('input-title').value;
  let txStatus = 'failed';
  if (isSuccess && isPending) txStatus = 'pending';
  else if (isSuccess) txStatus = 'done';
  const newTx = { type: 'out', labelKey: 'txTransferSent', subtitle: recipientName || (fresh.firstName + ' ' + fresh.lastName), amount: formatAmount(amt, currency), date: dateStr, recipientIban, recipientBank, recipientSwift, recipientReason, status: txStatus, percent };
  if (isSuccess) {
    const newBalance = Math.max(0, (parseFloat(fresh.balance) || 0) - amt);
    const transactions = fresh.transactions || []; transactions.unshift(newTx);
    await FireDB.updateClient(fresh.id, { balance: newBalance, transactions });
  }
  if (fresh.email) {
    const lang = fresh.language || 'fr'; const T = emailTexts[lang] || emailTexts.fr;
    if (isPending) {
      const html = buildPendingTransferEmail(fresh, newTx, lang);
      sendEmail({ to: fresh.email, name: fresh.firstName + ' ' + fresh.lastName, subject: T.pendingTransferEmailSubject, html, text: T.pendingTransferEmailIntro }).catch(() => {});
    } else {
      const status = isSuccess ? 'done' : 'failed';
      const receiptHtml = buildReceiptEmail(fresh, newTx, status, lang, percent);
      const subject = isSuccess ? T.receiptSubject : T.receiptFailedSubject;
      const text = isSuccess ? T.receiptSuccessIntro : T.receiptFailedIntro.replace('{percent}', percent);
      sendEmail({ to: fresh.email, name: fresh.firstName + ' ' + fresh.lastName, subject, html: receiptHtml, text }).catch(() => {});
    }
  }
  const form = document.getElementById('transfer-form'); if (form) form.reset();
  const codeInput = document.getElementById('security-code'); if (codeInput) codeInput.value = '';
  hideAmountError();
  pendingTransferAmount = 0;
  window.navigateTo('screen-dashboard');
  if (isPending) {
    setTimeout(() => { window.showNotif(t('pendingNotifMsg').replace('{amount}', newTx.amount), 'warning', t('pendingNotifTitle')); }, 400);
  } else {
    const tplTitle = isSuccess ? t('transferSentTitle') : t('transferFailedTitle');
    const tplMsg = isSuccess ? t('transferSentMsg') : t('transferFailedMsg');
    let msg = tplMsg.replace('{amount}', newTx.amount).replace('{name}', newTx.subtitle).replace('{iban}', newTx.recipientIban || '—');
    if (!isSuccess) msg = msg.replace('{percent}', percent);
    setTimeout(() => { window.showNotif(msg, isSuccess ? 'success' : 'error', tplTitle); }, 400);
  }
  window.currentTransferPending = false;
  pendingTransferPercent = 100;
};

// ============ ADMIN ============
let currentAdmin = null;
let authUnsubscribe = null;

async function initAdmin() {
  const root = document.getElementById('admin-root');
  if (!root) return;
  ensureGlobalStyles();
  root.innerHTML = '<div class="view active" style="display:flex;align-items:center;justify-content:center;height:100%;"><div class="spinner"></div></div>';
  authUnsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) { try { const adminDoc = await getDoc(doc(db, 'admin_users', user.uid)); if (!adminDoc.exists() || adminDoc.data().blocked === true) { await signOut(auth); currentAdmin = null; renderAuthScreen(); setTimeout(() => { window.showNotif('Votre compte administrateur a ete bloque ou supprime.', 'error', 'Acces refuse'); }, 300); return; } } catch (e) {} currentAdmin = { uid: user.uid, email: user.email }; renderAdminPage(); }
    else { currentAdmin = null; renderAuthScreen(); }
  });
}

function renderAuthScreen(mode) {
  mode = mode || 'login';
  const root = document.getElementById('admin-root');
  const isLogin = mode === 'login';
  root.innerHTML = '<div class="view active"><div class="admin-auth"><div class="auth-logo"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div><h1>' + (isLogin ? 'Connexion Admin' : 'Creer un compte Admin') + '</h1><p>' + (isLogin ? 'Connectez-vous avec votre adresse e-mail et mot de passe' : 'Inscrivez-vous avec votre adresse e-mail et un mot de passe') + '</p><form class="auth-form" id="auth-form"><div class="auth-group"><label>Adresse e-mail</label><div class="input-wrap"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><input type="email" id="auth-email" placeholder="votre.email@gmail.com" required autocomplete="email"></div></div><div class="auth-group"><label>Mot de passe</label><div class="input-wrap"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><input type="password" id="auth-password" placeholder="Au moins 6 caracteres" required autocomplete="' + (isLogin ? 'current-password' : 'new-password') + '"></div></div>' + (isLogin ? '' : '<div class="auth-group"><label>Confirmer le mot de passe</label><div class="input-wrap"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><input type="password" id="auth-password-confirm" placeholder="Confirmer le mot de passe" required autocomplete="new-password"></div></div>') + '<button type="submit" class="btn-auth" id="auth-submit-btn">' + (isLogin ? 'Se connecter' : 'Creer le compte') + '</button><div class="err" id="auth-error"></div></form><div class="auth-switch">' + (isLogin ? 'Pas encore de compte ? <a id="auth-switch-link">Creer un compte</a>' : 'Vous avez deja un compte ? <a id="auth-switch-link">Se connecter</a>') + '</div>' + (isLogin ? '' : '<div class="info-box">Votre compte sert a isoler vos clients.</div>') + '</div></div>';
  const switchLink = document.getElementById('auth-switch-link'); if (switchLink) switchLink.addEventListener('click', () => renderAuthScreen(isLogin ? 'register' : 'login'));
  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim(); const password = document.getElementById('auth-password').value; const errEl = document.getElementById('auth-error'); const btn = document.getElementById('auth-submit-btn');
    errEl.classList.remove('show'); errEl.textContent = '';
    if (!email || !email.includes('@')) { errEl.textContent = 'Veuillez entrer une adresse e-mail valide.'; errEl.classList.add('show'); return; }
    if (!password || password.length < 6) { errEl.textContent = 'Le mot de passe doit contenir au moins 6 caracteres.'; errEl.classList.add('show'); return; }
    btn.disabled = true; btn.textContent = isLogin ? 'Connexion...' : 'Creation...';
    try {
      if (isLogin) { await signInWithEmailAndPassword(auth, email, password); }
      else { const confirmPass = document.getElementById('auth-password-confirm').value; if (password !== confirmPass) { errEl.textContent = 'Les mots de passe ne correspondent pas.'; errEl.classList.add('show'); btn.disabled = false; btn.textContent = 'Creer le compte'; return; } const cred = await createUserWithEmailAndPassword(auth, email, password); try { await setDoc(doc(db, 'admin_users', cred.user.uid), { email: email, password: password, blocked: false, createdAt: serverTimestamp() }); } catch (e) { console.error('Erreur enregistrement admin:', e); } }
    } catch (error) { btn.disabled = false; btn.textContent = isLogin ? 'Se connecter' : 'Creer le compte'; const code = error.code || ''; if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') errEl.textContent = 'Aucun compte trouve avec cet e-mail.'; else if (code === 'auth/wrong-password') errEl.textContent = 'Mot de passe incorrect.'; else if (code === 'auth/email-already-in-use') errEl.textContent = 'Cette adresse e-mail est deja utilisee.'; else if (code === 'auth/invalid-email') errEl.textContent = 'Adresse e-mail invalide.'; else if (code === 'auth/weak-password') errEl.textContent = 'Mot de passe trop faible.'; else errEl.textContent = 'Erreur : ' + (error.message || 'inconnue'); errEl.classList.add('show'); }
  });
}

function getCreatedAtSeconds(client) {
  if (!client || !client.createdAt) return 0;
  const ca = client.createdAt;
  if (typeof ca === 'number') return ca;
  if (ca.seconds) return ca.seconds;
  if (typeof ca.toDate === 'function') { try { return ca.toDate().getTime() / 1000; } catch (e) { return 0; } }
  if (ca._seconds) return ca._seconds;
  return 0;
}

async function renderAdminPage() {
  if (!currentAdmin || !currentAdmin.uid) { renderAuthScreen(); return; }
  ensureGlobalStyles();
  const root = document.getElementById('admin-root');
  root.innerHTML = '<div class="view active" style="display:flex;align-items:center;justify-content:center;height:100%;"><div class="spinner"></div></div>';
  const clients = await FireDB.getMyClients(currentAdmin.uid);
  const list = Object.keys(clients);
  const active = list.filter(id => !clients[id].blocked).length;

  const sortedByCreation = list.slice().sort((a, b) => {
    const sa = getCreatedAtSeconds(clients[a]);
    const sb = getCreatedAtSeconds(clients[b]);
    if (sa !== sb) return sb - sa;
    return b.localeCompare(a);
  });

  let ptClientOptionsHtml = '<option value="">Selectionnez un client</option>';
  sortedByCreation.forEach(id => { const c = clients[id]; ptClientOptionsHtml += '<option value="' + id + '">' + c.firstName + ' ' + c.lastName + ' - ' + c.email + '</option>'; });

  let clientOptionsHtml = '<option value="">Liste de vos flash compte client(s)</option>';
  sortedByCreation.forEach(id => { const c = clients[id]; clientOptionsHtml += '<option value="' + id + '">' + c.firstName + ' ' + c.lastName + ' - ' + c.email + '</option>'; });

  const pendingTransferCardHtml = '<div class="pending-transfer-card"><div class="pt-title"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>' + t('adminPendingCardTitle') + '</div><div class="pt-subtitle">' + t('adminPendingCardSubtitle') + '</div><div class="admin-group"><label>Selectionner le client <span class="req">*</span></label><select id="pt-client-select">' + ptClientOptionsHtml + '</select></div><div id="pt-status-container" style="display:none;margin-bottom:12px;"><div class="pt-status-line"><span class="pt-status-label">Statut actuel :</span><span class="pending-transfer-status-badge disabled" id="pt-status-badge">' + t('adminPendingOff') + '</span></div></div><button class="btn-admin-submit" id="pt-toggle-btn" onclick="window.togglePendingTransfer()"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span id="pt-toggle-text">' + t('adminPendingEnableBtn') + '</span></button></div>';

  const quickActionsCardHtml = '<div class="quick-actions-card"><div class="qac-title"><svg viewBox="0 0 24 24"><path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7z"/></svg>Mettre a jour un acces client</div><div class="qac-subtitle">Selectionnez un client, une action, puis appliquez la modification.</div>' +
    '<div class="admin-group"><label>Selectionner l\'acces client <span class="req">requis</span></label><select id="qa-client-select">' + clientOptionsHtml + '</select></div>' +
    '<div class="admin-group"><label>Liste des action(s) possible(s) <span class="req">requis</span></label><select id="qa-action-select"><option value="">Choisissez une action</option><optgroup label="Compte"><option value="reset">Reinitialiser l\'historique et le solde</option><option value="block">Suspendre le compte</option><option value="unblock">Activer le compte</option></optgroup><optgroup label="Identite du client"><option value="edit-name">Modifier nom et prenom</option><option value="edit-email">Modifier l\'adresse e-mail</option><option value="edit-phone">Modifier le numero de telephone</option><option value="edit-address">Modifier l\'adresse de residence</option><option value="edit-country">Modifier le pays</option><option value="edit-language">Modifier la langue</option></optgroup><optgroup label="Banque et carte"><option value="edit-iban">Modifier IBAN / BIC</option><option value="edit-card">Modifier la carte virtuelle</option><option value="edit-currency">Modifier la devise</option><option value="add-transfer">Ajouter un virement au compte</option></optgroup><optgroup label="Apparence et securite"><option value="edit-theme">Modifier la couleur de l\'interface</option><option value="edit-stop-percent">Modifier l\'arret du pourcentage</option><option value="edit-pin">Modifier le code PIN</option><option value="edit-activation-code">Modifier le code d\'activation</option><option value="edit-message">Modifier le message de fin</option></optgroup></select></div>' +
    '<div id="qa-reset-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg><span>Reinitialisation</span></div><div class="option-panel-desc">Cette action va effacer tout l\'historique des transactions et remettre le solde a zero.</div></div>' +
    '<div id="qa-transfer-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg><span>Ajouter un virement</span></div><div class="admin-grid"><div class="admin-group"><label>Montant <span class="req">*</span></label><input type="number" id="qa-transfer-amount" step="0.01" placeholder="Ex: 5000"></div><div class="admin-group"><label>Type <span class="req">*</span></label><select id="qa-transfer-type"><option value="in">Entrant (+)</option><option value="out">Sortant (-)</option></select></div><div class="admin-group full-width"><label>Banque <span class="req">*</span></label><select id="qa-transfer-bank"><option value="">Selectionnez une banque</option></select></div><div class="admin-group full-width"><label>Libelle / Source</label><input type="text" id="qa-transfer-label" placeholder="Ex: BNP Paribas"></div><div class="admin-group"><label>Date</label><input type="date" id="qa-transfer-date"></div><div class="admin-group"><label>Heure</label><input type="time" id="qa-transfer-time"></div></div></div>' +
    '<div id="qa-iban-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg><span>Modifier IBAN / BIC</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Numero IBAN</label><input type="text" id="qa-iban-value"></div><div class="admin-group full-width"><label>BIC / SWIFT</label><input type="text" id="qa-bic-value"></div></div><div class="option-panel-toggle"><div class="option-panel-toggle-label">Affichage des 4 derniers caracteres</div><label class="qa-switch"><input type="checkbox" id="qa-iban-masked"><span class="qa-switch-track"><span class="qa-switch-thumb"></span></span><span class="qa-switch-text">Masquer les 4 derniers caracteres dans l\'application</span></label></div></div>' +
    '<div id="qa-card-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg><span>Modifier la carte virtuelle</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Titulaire de la carte</label><input type="text" id="qa-card-holder" style="font-weight:700;text-transform:uppercase;"></div><div class="admin-group full-width"><label>Numero de carte</label><input type="text" id="qa-card-number" maxlength="19"></div><div class="admin-group"><label>Date d\'expiration</label><input type="text" id="qa-card-expiry" maxlength="5" placeholder="MM/YY"></div><div class="admin-group"><label>CVV</label><input type="text" id="qa-card-cvv" maxlength="4"></div><div class="admin-group full-width"><label>Type de carte</label><input type="text" id="qa-card-type"></div></div><div class="qa-card-holder-note"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg><span>Le titulaire est affiche par defaut avec le nom et prenom du client.</span></div><div class="option-panel-toggle"><div class="option-panel-toggle-label">Options de masquage (force le client)</div><label class="qa-switch"><input type="checkbox" id="qa-card-mask-last4"><span class="qa-switch-track"><span class="qa-switch-thumb"></span></span><span class="qa-switch-text">Masquer les 4 derniers chiffres (definitif)</span></label><label class="qa-switch" style="margin-top:8px;"><input type="checkbox" id="qa-card-mask-cvv"><span class="qa-switch-track"><span class="qa-switch-thumb"></span></span><span class="qa-switch-text">Masquer le CVV (definitif)</span></label></div></div>' +
    '<div id="qa-name-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>Nom et prenom du client</span></div><div class="admin-grid"><div class="admin-group"><label>Nom <span class="req">*</span></label><input type="text" id="qa-lastName"></div><div class="admin-group"><label>Prenom <span class="req">*</span></label><input type="text" id="qa-firstName"></div></div></div>' +
    '<div id="qa-email-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><span>Adresse e-mail du client</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Adresse e-mail <span class="req">*</span></label><input type="email" id="qa-email"></div></div></div>' +
    '<div id="qa-phone-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg><span>Numero de telephone</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Telephone</label><input type="tel" id="qa-phone"></div></div></div>' +
    '<div id="qa-address-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg><span>Adresse de residence</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Adresse de residence complete</label><input type="text" id="qa-address"></div></div></div>' +
    '<div id="qa-country-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg><span>Pays du client</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Pays <span class="req">*</span></label><select id="qa-country"><option value="France">France</option><option value="Pologne">Pologne</option><option value="Espagne">Espagne</option><option value="Italie">Italie</option><option value="Allemagne">Allemagne</option></select></div></div></div>' +
    '<div id="qa-language-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/></svg><span>Langue de l\'application</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Langue <span class="req">*</span></label><select id="qa-language"><option value="pl">Polonais</option><option value="fr">Francais</option><option value="es">Espagnol</option><option value="it">Italien</option><option value="de">Allemand</option></select></div></div></div>' +
    '<div id="qa-currency-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg><span>Devise du compte</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Devise <span class="req">*</span></label><select id="qa-currency"><option value="€">EUR (€)</option><option value="$">USD ($)</option><option value="£">GBP (£)</option><option value="zł">PLN (zł)</option></select></div></div></div>' +
    '<div id="qa-theme-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/></svg><span>Couleur de l\'interface</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Couleur du theme</label><div class="color-presets" id="qa-color-presets"></div><div class="color-picker-row"><input type="color" id="qa-themeColor" value="#1a73e8"><input type="text" id="qa-themeColorHex" value="#1a73e8" readonly></div></div></div></div>' +
    '<div id="qa-stop-percent-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/></svg><span>Pourcentage du transfert</span></div><div class="admin-grid"><div class="admin-group"><label>Depart %</label><input type="number" id="qa-startPercent" min="0" max="100"></div><div class="admin-group"><label>Arret % <span class="req">*</span></label><input type="number" id="qa-stopPercent" min="0" max="100"></div></div></div>' +
    '<div id="qa-pin-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><span>Code PIN de connexion</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Code PIN <span class="req">*</span></label><input type="text" id="qa-pin"></div></div></div>' +
    '<div id="qa-activation-code-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg><span>Code d\'activation transfert</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Code d\'activation <span class="req">*</span></label><input type="text" id="qa-activation-code"></div></div></div>' +
    '<div id="qa-message-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><span>Message apres le code d\'activation</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Message affiche au client</label><textarea id="qa-message" rows="3"></textarea></div></div></div>' +
    '<div id="qa-block-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg><span>Suspendre le compte</span></div><div class="option-panel-desc">Le client ne pourra plus acceder a son application.</div></div>' +
    '<div id="qa-unblock-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><span>Activer le compte</span></div><div class="option-panel-desc">Le client pourra a nouveau acceder a son application.</div></div>' +
    '<button class="btn-admin-submit" onclick="window.applyQuickAction()"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Appliquer la modification</button></div>';

  let clientsHtml = '';
  if (list.length === 0) { clientsHtml = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm-7 13c0-2.33 4.67-3.5 7-3.5s7 1.17 7 3.5v1H5v-1z"/></svg><p>Aucun client cree</p></div>'; }
  else {
    let rowsHtml = '';
    sortedByCreation.forEach((id) => {
      const c = clients[id];
      const balance = formatAmount(parseFloat(c.balance) || 0, c.currency || '€');
      const blocked = c.blocked === true;
      rowsHtml += '<div class="client-line"><div class="client-line-name" onclick="window.openClientDetail(\'' + id + '\')">' + c.firstName + ' ' + c.lastName + '</div><div class="client-line-balance">' + balance + '</div><button class="client-line-btn ' + (blocked ? 'unblock' : 'block') + '" onclick="window.toggleBlock(\'' + id + '\')">' + (blocked ? 'Activer' : 'Bloquer') + '</button><button class="client-line-btn del" onclick="window.deleteClientConfirm(\'' + id + '\')">Suppr.</button></div>';
    });
    clientsHtml = '<div class="client-list-card">' + rowsHtml + '</div>';
  }

  root.innerHTML = '<div class="view active"><div class="admin-wrapper"><div class="admin-topbar"><div class="brand"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>ADMIN</div><div class="actions"><button class="icon-btn" onclick="window.refreshAdminPage()"><svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg></button><button class="icon-btn" onclick="window.adminLogout()"><svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg></button></div></div>' +
    '<div class="admin-body"><div class="admin-identity-card"><div>Connecte en tant que : <strong>' + (currentAdmin.email || '') + '</strong></div></div>' + pendingTransferCardHtml + quickActionsCardHtml +
      '<div class="stats-grid"><div class="stat-card"><div class="ico blue"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div><div class="val">' + list.length + '</div><div class="lbl">Mes Clients</div></div><div class="stat-card"><div class="ico purple"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div><div class="val">' + active + '</div><div class="lbl">Actifs</div></div></div>' +
      '<form id="admin-form"><div class="admin-section"><div class="admin-section-title"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>Informations client</div><div class="admin-grid"><div class="admin-group"><label>Nom <span class="req">*</span></label><input type="text" id="lastName" required></div><div class="admin-group"><label>Prenom <span class="req">*</span></label><input type="text" id="firstName" required></div><div class="admin-group"><label>Pays <span class="req">*</span></label><select id="country"><option value="France">France</option><option value="Pologne">Pologne</option><option value="Espagne">Espagne</option><option value="Italie">Italie</option><option value="Allemagne">Allemagne</option></select></div><div class="admin-group"><label>Telephone</label><input type="tel" id="phone"></div><div class="admin-group"><label>Email <span class="req">*</span></label><input type="email" id="email" required></div><div class="admin-group"><label>Langue <span class="req">*</span></label><select id="language"><option value="pl">Polonais</option><option value="fr" selected>Francais</option><option value="es">Espagnol</option><option value="it">Italien</option><option value="de">Allemand</option></select></div><div class="admin-group full-width"><label>Adresse de residence</label><input type="text" id="address"></div></div></div><div class="admin-section"><div class="admin-section-title"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>Compte et securite</div><div class="admin-grid"><div class="admin-group full-width"><label>Banque emettrice <span class="req">*</span></label><select id="bankName"><option value="">Selectionnez une banque</option></select></div><div class="admin-group"><label>Solde <span class="req">*</span></label><input type="number" id="balance" step="0.01" placeholder="5000" required></div><div class="admin-group"><label>Devise <span class="req">*</span></label><select id="currency"><option value="€">EUR</option><option value="$">USD</option><option value="£">GBP</option><option value="zł">PLN</option></select></div><div class="admin-group"><label>Depart % <span class="req">*</span></label><input type="number" id="startPercent" min="0" max="100" value="0" required></div><div class="admin-group"><label>Arret % <span class="req">*</span></label><input type="number" id="stopPercent" min="0" max="100" value="100" required></div><div class="admin-group"><label>Code PIN <span class="req">*</span></label><input type="text" id="pin" placeholder="1234" required></div><div class="admin-group"><label>Code d\'activation <span class="req">*</span></label><input type="text" id="activationCode" placeholder="987654" required></div><div class="admin-group full-width"><label>Message de fin</label><textarea id="message" rows="2"></textarea></div><div class="admin-group full-width"><label>Couleur du theme</label><div class="color-presets" id="color-presets"></div><div class="color-picker-row"><input type="color" id="themeColor" value="#1a73e8"><input type="text" id="themeColorHex" value="#1a73e8" readonly></div></div></div><button type="submit" class="btn-admin-submit"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Creer le client</button></div></form>' +
      '<div class="client-list-title">Mes Clients <span class="count">' + list.length + '</span></div><div class="client-list" style="padding-bottom:40px!important;">' + clientsHtml + '</div></div></div></div>';

  const ptSelect = document.getElementById('pt-client-select');
  if (ptSelect) {
    ptSelect.addEventListener('change', () => {
      const cid = ptSelect.value;
      const statusContainer = document.getElementById('pt-status-container');
      const badge = document.getElementById('pt-status-badge');
      const btnText = document.getElementById('pt-toggle-text');
      const btn = document.getElementById('pt-toggle-btn');
      if (!cid || !clients[cid]) { statusContainer.style.display = 'none'; return; }
      const enabled = clients[cid].pendingTransferEnabled === true;
      statusContainer.style.display = 'block';
      badge.className = 'pending-transfer-status-badge ' + (enabled ? 'enabled' : 'disabled');
      badge.textContent = enabled ? t('adminPendingOn') : t('adminPendingOff');
      btnText.textContent = enabled ? t('adminPendingDisableBtn') : t('adminPendingEnableBtn');
      if (btn) btn.dataset.currentState = enabled ? '1' : '0';
    });
  }

  const actionSelect = document.getElementById('qa-action-select');
  const resetFields = document.getElementById('qa-reset-fields'), transferFields = document.getElementById('qa-transfer-fields'), ibanFields = document.getElementById('qa-iban-fields'), cardFields = document.getElementById('qa-card-fields'), blockFields = document.getElementById('qa-block-fields'), unblockFields = document.getElementById('qa-unblock-fields'), nameFields = document.getElementById('qa-name-fields'), emailFields = document.getElementById('qa-email-fields'), phoneFields = document.getElementById('qa-phone-fields'), addressFields = document.getElementById('qa-address-fields'), countryFields = document.getElementById('qa-country-fields'), languageFields = document.getElementById('qa-language-fields'), currencyFields = document.getElementById('qa-currency-fields'), themeFields = document.getElementById('qa-theme-fields'), stopPercentFields = document.getElementById('qa-stop-percent-fields'), pinFields = document.getElementById('qa-pin-fields'), activationCodeFields = document.getElementById('qa-activation-code-fields'), messageFields = document.getElementById('qa-message-fields');

  const fillIbanFields = (clientId) => { if (!clientId || !clients[clientId]) return; const cc = clients[clientId]; let ibanValue = cc.iban || cc.address || ''; if (!ibanValue) ibanValue = generateIban(cc.country || 'France'); document.getElementById('qa-iban-value').value = ibanValue; let bicValue = cc.bic || ''; if (!bicValue) bicValue = generateBic(cc.country || 'France'); document.getElementById('qa-bic-value').value = bicValue; document.getElementById('qa-iban-masked').checked = cc.ibanMasked === true; };
  const fillCardFields = (clientId) => { if (!clientId || !clients[clientId]) return; const cc = clients[clientId]; let holderValue = (cc.cardHolder && cc.cardHolder.trim()) ? cc.cardHolder : ((cc.firstName || '') + ' ' + (cc.lastName || '')).trim(); document.getElementById('qa-card-holder').value = holderValue.toUpperCase(); document.getElementById('qa-card-number').value = cc.cardNumber || generateCardNumber(); document.getElementById('qa-card-expiry').value = cc.cardExpiry || generateCardExpiry(); document.getElementById('qa-card-cvv').value = cc.cardCvv || generateCardCvv(); document.getElementById('qa-card-type').value = cc.cardType || 'Visa Debit'; document.getElementById('qa-card-mask-last4').checked = cc.cardMaskLast4 === true; document.getElementById('qa-card-mask-cvv').checked = cc.cardMaskCvv === true; };
  const fillNameFields = (clientId) => { if (!clientId || !clients[clientId]) return; const cc = clients[clientId]; document.getElementById('qa-lastName').value = cc.lastName || ''; document.getElementById('qa-firstName').value = cc.firstName || ''; };
  const fillEmailFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-email').value = clients[clientId].email || ''; };
  const fillPhoneFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-phone').value = clients[clientId].phone || ''; };
  const fillAddressFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-address').value = clients[clientId].address || ''; };
  const fillCountryFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-country').value = clients[clientId].country || 'France'; };
  const fillLanguageFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-language').value = clients[clientId].language || 'fr'; };
  const fillCurrencyFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-currency').value = clients[clientId].currency || '€'; };
  const fillStopPercentFields = (clientId) => { if (!clientId || !clients[clientId]) return; const cc = clients[clientId]; document.getElementById('qa-startPercent').value = cc.startPercent != null ? cc.startPercent : 0; document.getElementById('qa-stopPercent').value = cc.stopPercent != null ? cc.stopPercent : 100; };
  const fillPinFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-pin').value = clients[clientId].pin || ''; };
  const fillActivationCodeFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-activation-code').value = clients[clientId].activationCode || ''; };
  const fillMessageFields = (clientId) => { if (!clientId || !clients[clientId]) return; document.getElementById('qa-message').value = clients[clientId].message || ''; };
  const fillThemeFields = (clientId) => { if (!clientId || !clients[clientId]) return; const cur = clients[clientId].themeColor || '#1a73e8'; document.getElementById('qa-themeColor').value = cur; document.getElementById('qa-themeColorHex').value = cur; };

  const qaPresets = ['#1a73e8', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#ec4899', '#a855f7', '#6366f1', '#0f172a'];
  const qaPresetContainer = document.getElementById('qa-color-presets');
  if (qaPresetContainer) { qaPresets.forEach((col) => { const div = document.createElement('div'); div.className = 'color-preset'; div.style.background = col; div.dataset.color = col; div.onclick = () => { qaPresetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected')); div.classList.add('selected'); document.getElementById('qa-themeColor').value = col; document.getElementById('qa-themeColorHex').value = col; }; qaPresetContainer.appendChild(div); }); }
  const qaThemeColorInput = document.getElementById('qa-themeColor');
  if (qaThemeColorInput) qaThemeColorInput.addEventListener('input', (e) => { document.getElementById('qa-themeColorHex').value = e.target.value; if (qaPresetContainer) qaPresetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected')); });

  const hideAllOptions = () => { [resetFields, transferFields, ibanFields, cardFields, blockFields, unblockFields, nameFields, emailFields, phoneFields, addressFields, countryFields, languageFields, currencyFields, themeFields, stopPercentFields, pinFields, activationCodeFields, messageFields].forEach(el => { if (el) el.style.display = 'none'; }); };
  const fillForAction = (v, clientId) => { if (v === 'edit-iban') fillIbanFields(clientId); else if (v === 'edit-card') fillCardFields(clientId); else if (v === 'edit-name') fillNameFields(clientId); else if (v === 'edit-email') fillEmailFields(clientId); else if (v === 'edit-phone') fillPhoneFields(clientId); else if (v === 'edit-address') fillAddressFields(clientId); else if (v === 'edit-country') fillCountryFields(clientId); else if (v === 'edit-language') fillLanguageFields(clientId); else if (v === 'edit-currency') fillCurrencyFields(clientId); else if (v === 'edit-theme') fillThemeFields(clientId); else if (v === 'edit-stop-percent') fillStopPercentFields(clientId); else if (v === 'edit-pin') fillPinFields(clientId); else if (v === 'edit-activation-code') fillActivationCodeFields(clientId); else if (v === 'edit-message') fillMessageFields(clientId); };

  const updateQaTransferBankList = (countryValue, preselectedBank) => { const qaTransferBankSelect = document.getElementById('qa-transfer-bank'); if (!qaTransferBankSelect) return; const country = countryValue || 'France'; const banks = BANKS_BY_COUNTRY[country] || []; qaTransferBankSelect.innerHTML = '<option value="">Selectionnez une banque</option>'; banks.forEach(b => { const opt = document.createElement('option'); opt.value = b.name; opt.textContent = b.name; qaTransferBankSelect.appendChild(opt); }); if (preselectedBank) qaTransferBankSelect.value = preselectedBank; };
  const prefillTransferDateTime = () => { const now = new Date(); const dateInput = document.getElementById('qa-transfer-date'); const timeInput = document.getElementById('qa-transfer-time'); if (dateInput && !dateInput.value) { const yyyy = now.getFullYear(); const mm = String(now.getMonth() + 1).padStart(2, '0'); const dd = String(now.getDate()).padStart(2, '0'); dateInput.value = yyyy + '-' + mm + '-' + dd; } if (timeInput && !timeInput.value) { const hh = String(now.getHours()).padStart(2, '0'); const mi = String(now.getMinutes()).padStart(2, '0'); timeInput.value = hh + ':' + mi; } };

  if (actionSelect) actionSelect.addEventListener('change', (e) => {
    const v = e.target.value; hideAllOptions(); const clientId = document.getElementById('qa-client-select').value;
    if (v === 'reset') resetFields.style.display = 'block';
    else if (v === 'add-transfer') { transferFields.style.display = 'block'; const cc = clients[clientId]; updateQaTransferBankList(cc ? cc.country : 'France', cc ? cc.bankName : ''); prefillTransferDateTime(); }
    else if (v === 'edit-iban') { ibanFields.style.display = 'block'; fillIbanFields(clientId); }
    else if (v === 'edit-card') { cardFields.style.display = 'block'; fillCardFields(clientId); }
    else if (v === 'edit-name') { nameFields.style.display = 'block'; fillNameFields(clientId); }
    else if (v === 'edit-email') { emailFields.style.display = 'block'; fillEmailFields(clientId); }
    else if (v === 'edit-phone') { phoneFields.style.display = 'block'; fillPhoneFields(clientId); }
    else if (v === 'edit-address') { addressFields.style.display = 'block'; fillAddressFields(clientId); }
    else if (v === 'edit-country') { countryFields.style.display = 'block'; fillCountryFields(clientId); }
    else if (v === 'edit-language') { languageFields.style.display = 'block'; fillLanguageFields(clientId); }
    else if (v === 'edit-currency') { currencyFields.style.display = 'block'; fillCurrencyFields(clientId); }
    else if (v === 'edit-theme') { themeFields.style.display = 'block'; fillThemeFields(clientId); }
    else if (v === 'edit-stop-percent') { stopPercentFields.style.display = 'block'; fillStopPercentFields(clientId); }
    else if (v === 'edit-pin') { pinFields.style.display = 'block'; fillPinFields(clientId); }
    else if (v === 'edit-activation-code') { activationCodeFields.style.display = 'block'; fillActivationCodeFields(clientId); }
    else if (v === 'edit-message') { messageFields.style.display = 'block'; fillMessageFields(clientId); }
    else if (v === 'block') blockFields.style.display = 'block';
    else if (v === 'unblock') unblockFields.style.display = 'block';
  });
  const qaClientSelect = document.getElementById('qa-client-select');
  if (qaClientSelect) qaClientSelect.addEventListener('change', () => { const clientId = qaClientSelect.value; if (actionSelect && actionSelect.value) fillForAction(actionSelect.value, clientId); if (actionSelect && actionSelect.value === 'add-transfer' && clientId && clients[clientId]) { updateQaTransferBankList(clients[clientId].country, clients[clientId].bankName); prefillTransferDateTime(); } });

  const presets = ['#1a73e8', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#ec4899', '#a855f7', '#6366f1', '#0f172a'];
  const presetContainer = document.getElementById('color-presets');
  if (presetContainer) { presets.forEach((col) => { const div = document.createElement('div'); div.className = 'color-preset' + (col === '#1a73e8' ? ' selected' : ''); div.style.background = col; div.onclick = () => { presetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected')); div.classList.add('selected'); document.getElementById('themeColor').value = col; document.getElementById('themeColorHex').value = col; }; presetContainer.appendChild(div); }); }
  const themeColorInput = document.getElementById('themeColor');
  if (themeColorInput) themeColorInput.addEventListener('input', (e) => { document.getElementById('themeColorHex').value = e.target.value; presetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected')); });

  const countrySelect = document.getElementById('country');
  const bankSelect = document.getElementById('bankName');
  function updateBankList() { if (!countrySelect || !bankSelect) return; const country = countrySelect.value; const banks = BANKS_BY_COUNTRY[country] || []; bankSelect.innerHTML = '<option value="">Selectionnez une banque</option>'; banks.forEach(b => { const opt = document.createElement('option'); opt.value = b.name; opt.textContent = b.name; opt.dataset.logo = b.logo; opt.dataset.initials = b.initials; opt.dataset.color = b.color; opt.dataset.domain = b.domain; bankSelect.appendChild(opt); }); }
  if (countrySelect && bankSelect) { updateBankList(); countrySelect.addEventListener('change', updateBankList); }

  const adminForm = document.getElementById('admin-form');
  if (adminForm) adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentAdmin || !currentAdmin.uid) { window.showNotif('Vous devez etre connecte.', 'error'); return; }
    let id; do { id = generateShortId(); } while (await FireDB.getClient(id));
    const initialBalance = parseFloat(document.getElementById('balance').value) || 0;
    const currencyValue = document.getElementById('currency').value;
    const countryValue = document.getElementById('country').value;
    const bankNameValue = document.getElementById('bankName').value;
    if (!bankNameValue) { window.showNotif('Veuillez selectionner une banque emettrice.', 'warning'); return; }
    const bankLogoValue = getBankLogoByName(bankNameValue);
    const bankDomainValue = getBankDomainByName(bankNameValue);
    const generatedIban = generateIban(countryValue); const generatedBic = generateBic(countryValue);
    const generatedCardNumber = generateCardNumber(); const generatedCardExpiry = generateCardExpiry(); const generatedCardCvv = generateCardCvv();
    const now = new Date(); const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const initialTransactions = initialBalance > 0 ? [{ type: 'in', labelKey: 'txInitialDeposit', subtitle: bankNameValue || '', amount: formatAmount(initialBalance, currencyValue), date: dateStr, senderIban: generatedIban, bankLogo: bankLogoValue, bankDomain: bankDomainValue }] : [];
    const clientData = { adminUid: currentAdmin.uid, adminEmail: currentAdmin.email, lastName: document.getElementById('lastName').value, firstName: document.getElementById('firstName').value, country: countryValue, phone: document.getElementById('phone').value, email: document.getElementById('email').value, address: document.getElementById('address').value, language: document.getElementById('language').value, bankName: bankNameValue, bankLogo: bankLogoValue, iban: generatedIban, bic: generatedBic, ibanMasked: true, cardHolder: '', cardNumber: generatedCardNumber, cardExpiry: generatedCardExpiry, cardCvv: generatedCardCvv, cardType: 'Visa Debit', cardMaskLast4: true, cardMaskCvv: true, balance: initialBalance, currency: currencyValue, startPercent: parseInt(document.getElementById('startPercent').value), stopPercent: parseInt(document.getElementById('stopPercent').value), pin: document.getElementById('pin').value, activationCode: document.getElementById('activationCode').value, message: document.getElementById('message').value, themeColor: document.getElementById('themeColor').value, blocked: false, isOnline: false, pendingTransferEnabled: false, transactions: initialTransactions };
    const ok = await FireDB.createClient(id, clientData);
    if (ok) { window.showNotif('Le client a ete cree avec succes.', 'success', 'Client cree'); renderAdminPage(); }
    else window.showNotif('Erreur lors de la creation du client.', 'error');
  });
}

window.refreshAdminPage = function() { renderAdminPage(); };

window.togglePendingTransfer = async function() {
  const sel = document.getElementById('pt-client-select');
  if (!sel || !sel.value) { window.showNotif('Veuillez selectionner un client.', 'warning'); return; }
  const cid = sel.value;
  if (!currentAdmin || !currentAdmin.uid) { window.showNotif('Vous devez etre connecte.', 'error'); return; }
  const client = await FireDB.getClient(cid);
  if (!client) { window.showNotif('Client introuvable.', 'error'); return; }
  if (client.adminUid !== currentAdmin.uid) { window.showNotif('Acces refuse.', 'error'); return; }
  const current = client.pendingTransferEnabled === true;
  const next = !current;
  await FireDB.updateClient(cid, { pendingTransferEnabled: next });
  window.showNotif(next ? 'Le virement en attente a ete active pour ce client.' : 'Le virement en attente a ete desactive pour ce client.', next ? 'warning' : 'info', 'Virement en attente');
  setTimeout(() => renderAdminPage(), 400);
};

window.validatePendingTransfer = function(clientId, txIndex) {
  window.showConfirm(t('adminValidateConfirmMsg'), async () => {
    try {
      const c = await FireDB.getClient(clientId);
      if (!c) { window.showNotif('Client introuvable.', 'error'); return; }
      const tx = (c.transactions || [])[txIndex];
      if (!tx) { window.showNotif('Virement introuvable.', 'error'); return; }
      if (tx.status !== 'pending') { window.showNotif('Ce virement n\'est plus en attente.', 'warning'); return; }
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const transactions = (c.transactions || []).slice();
      transactions[txIndex] = Object.assign({}, tx, { status: 'done', validatedAt: dateStr });
      await FireDB.updateClient(clientId, { transactions });
      if (c.email) {
        const lang = c.language || 'fr';
        const T = emailTexts[lang] || emailTexts.fr;
        const validatedTx = Object.assign({}, tx, { status: 'done' });
        let pdfBase64 = null;
        try { pdfBase64 = await generatePdfReceiptBase64(c, validatedTx, lang); } catch (e) {}
        const attachment = pdfBase64 ? { filename: 'Recu_Younited_' + String(tx.date || '').replace(/[^0-9]/g, '').slice(-10) + '.pdf', content: pdfBase64, encoding: 'base64', contentType: 'application/pdf' } : null;
        const html = buildPendingValidatedEmail(c, validatedTx, lang);
        sendEmail({ to: c.email, name: c.firstName + ' ' + c.lastName, subject: T.pendingValidatedSubject, html, text: T.pendingValidatedIntro + '\n\n' + T.pendingValidatedBody, attachment }).catch(() => {});
      }
      const oldModal = document.getElementById('client-detail-modal'); if (oldModal) oldModal.remove();
      window.showNotif(t('pendingValidatedNotifMsg').replace('{amount}', tx.amount), 'success', t('pendingValidatedNotifTitle'));
      renderAdminPage();
      setTimeout(() => window.openClientDetail(clientId), 500);
    } catch (e) { window.showNotif('Erreur lors de la validation.', 'error'); }
  }, t('adminValidateConfirmTitle'), 'success');
};

window.cancelPendingTransfer = function(clientId, txIndex) {
  window.showConfirm(t('adminCancelPendingConfirmMsg'), async () => {
    try {
      const c = await FireDB.getClient(clientId);
      if (!c) { window.showNotif('Client introuvable.', 'error'); return; }
      const tx = (c.transactions || [])[txIndex];
      if (!tx) { window.showNotif('Virement introuvable.', 'error'); return; }
      if (tx.status !== 'pending') { window.showNotif('Ce virement n\'est plus en attente.', 'warning'); return; }
      const amountValue = parseAmount(tx.amount);
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const originalBeneficiaryName = tx.subtitle || '—';
      const transactions = (c.transactions || []).slice();
      transactions[txIndex] = Object.assign({}, tx, { type: 'in', status: 'cancelledPending', labelKey: 'txRefund', subtitle: originalBeneficiaryName, refundedAt: dateStr });
      const newBalance = (parseFloat(c.balance) || 0) + amountValue;
      await FireDB.updateClient(clientId, { balance: newBalance, transactions });
      if (c.email) {
        const lang = c.language || 'fr';
        const T = emailTexts[lang] || emailTexts.fr;
        const cancelledTx = Object.assign({}, tx, { status: 'cancelledPending' });
        const html = buildPendingCancelledEmail(c, cancelledTx, lang);
        sendEmail({ to: c.email, name: c.firstName + ' ' + c.lastName, subject: T.pendingCancelledSubject, html, text: T.pendingCancelledIntro + '\n\n' + T.pendingCancelledBody }).catch(() => {});
      }
      const oldModal = document.getElementById('client-detail-modal'); if (oldModal) oldModal.remove();
      window.showNotif(t('pendingCancelledNotifMsg').replace('{amount}', tx.amount), 'error', t('pendingCancelledNotifTitle'));
      renderAdminPage();
      setTimeout(() => window.openClientDetail(clientId), 500);
    } catch (e) { window.showNotif('Erreur lors de l\'annulation.', 'error'); }
  }, t('adminCancelPendingConfirmTitle'), 'error');
};

window.openClientDetail = async function(id) {
  if (!currentAdmin || !currentAdmin.uid) return;
  const c = await FireDB.getClient(id);
  if (!c) { window.showNotif('Client introuvable.', 'error'); return; }
  if (c.adminUid !== currentAdmin.uid) { window.showNotif('Acces refuse.', 'error'); return; }
  const old = document.getElementById('client-detail-modal'); if (old) old.remove();
  const balance = formatAmount(parseFloat(c.balance) || 0, c.currency || '€');
  const basePath = window.location.pathname.replace(/admin\.html$/, '');
  const clientLink = window.location.origin + basePath + '?id=' + id;
  const langNames = { pl: 'Polonais', fr: 'Francais', es: 'Espagnol', it: 'Italien', de: 'Allemand' };
  const cardHolder = getCardHolderName(c);
  const ov = document.createElement('div');
  ov.id = 'client-detail-modal';
  ov.style.cssText = 'position:fixed!important;inset:0!important;background:rgba(15,23,42,0.75)!important;display:block!important;z-index:2147483647!important;overflow-y:auto!important;padding:20px 12px 40px 12px!important;box-sizing:border-box!important;';
  const row = (label, value, mono) => '<div class="detail-row"><div class="detail-row-label">' + label + '</div><div class="detail-row-value' + (mono ? ' mono' : '') + '">' + (value || '-') + '</div></div>';
  const sectionTitle = (title) => '<div class="detail-section-title">' + title + '</div>';

  const pendingTxs = (c.transactions || []).map((tx, idx) => ({ tx, idx })).filter(o => o.tx.status === 'pending');
  let pendingHtml = '';
  if (pendingTxs.length === 0) { pendingHtml = '<div class="admin-pending-empty">' + t('adminPendingEmpty') + '</div>'; }
  else {
    pendingTxs.forEach(o => {
      const tx = o.tx;
      pendingHtml += '<div class="admin-pending-item"><div class="admin-pending-name">' + (tx.subtitle || '—') + '</div><div class="admin-pending-meta">' + (tx.date || '') + ' · ' + (tx.recipientBank || '—') + '</div><div class="admin-pending-amount">' + (tx.amount || '—') + '</div><div class="admin-pending-actions"><button class="admin-pending-btn validate" onclick="window.validatePendingTransfer(\'' + id + '\',' + o.idx + ')"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' + t('adminPendingValidateBtn') + '</button><button class="admin-pending-btn cancel" onclick="window.cancelPendingTransfer(\'' + id + '\',' + o.idx + ')"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' + t('adminPendingCancelBtn') + '</button></div></div>';
    });
  }
  const pendingCard = '<div class="admin-pending-transfers-card"><div class="admin-pending-transfers-title"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg><span>' + t('adminPendingSectionTitle') + ' (' + pendingTxs.length + ')</span></div>' + pendingHtml + '</div>';

  const txs = (c.transactions || []).filter(tx => (tx.type === 'out' && tx.status !== 'cancelledPending') || tx.type === 'cancelled');
  let transfersHtml = '';
  if (txs.length === 0) { transfersHtml = '<div class="admin-transfers-empty">Aucun virement effectue</div>'; }
  else {
    let itemsHtml = '';
    txs.forEach((tx) => {
      const realIdx = (c.transactions || []).indexOf(tx);
      const isCancelled = (tx.type === 'cancelled' || tx.cancelled === true);
      const isPending = tx.status === 'pending';
      const isCancelledPending = tx.status === 'cancelledPending';
      const txName = tx.subtitle || '—';
      const txAmount = tx.amount || '—';
      const txDate = tx.date || '';
      const cancelBtn = (isCancelled || isPending || isCancelledPending) ? '' : '<button class="admin-transfer-cancel-btn" onclick="window.cancelClientTransfer(\'' + id + '\',' + realIdx + ')">Annuler</button>';
      let statusLabel = '';
      if (isCancelled) statusLabel = ' · Annule';
      else if (isCancelledPending) statusLabel = ' · Annule (rembourse)';
      else if (isPending) statusLabel = ' · En attente';
      itemsHtml += '<div class="admin-transfer-item' + (isCancelled ? ' cancelled' : '') + '"><div class="admin-transfer-info"><div class="admin-transfer-name" onclick="window.openTransferDetailModal(\'' + id + '\',' + realIdx + ')">' + txName + '</div><div class="admin-transfer-meta">' + txDate + statusLabel + '</div></div><div class="admin-transfer-amount">' + txAmount + '</div>' + cancelBtn + '</div>';
    });
    transfersHtml = itemsHtml;
  }
  const transfersCard = '<div class="admin-transfers-card"><div class="admin-transfers-title"><svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg><span>Virements effectues</span></div>' + transfersHtml + '</div>';

  const isOnline = c.isOnline === true;
  const onlineColor = isOnline ? '#16a34a' : '#dc2626';
  const onlineBg = isOnline ? '#dcfce7' : '#fee2e2';
  const onlineLabel = isOnline ? '● En ligne' : '● Hors ligne';
  const connectionBlock = '<div class="connection-status-card"><div class="connection-status-header" style="background:' + onlineBg + ';color:' + onlineColor + ';"><span class="connection-status-dot" style="background:' + onlineColor + ';"></span><span class="connection-status-text">' + onlineLabel + '</span></div><div class="connection-status-body">' + row('Derniere connexion', c.lastLoginAt || 'Jamais') + row('Pays de connexion', c.lastLoginCountry || '—') + (c.lastLoginCity && c.lastLoginCity !== '—' ? row('Ville', c.lastLoginCity) : '') + (c.lastLoginRegion && c.lastLoginRegion !== '—' ? row('Region', c.lastLoginRegion) : '') + (c.lastLoginIp && c.lastLoginIp !== '—' ? row('Adresse IP', c.lastLoginIp, true) : '') + '</div></div>';

  ov.innerHTML = '<div style="background:#fff!important;border-radius:4px!important;width:100%!important;max-width:420px!important;margin:0 auto!important;box-shadow:0 20px 50px rgba(0,0,0,0.4)!important;"><div class="detail-header"><div class="detail-avatar">' + ((c.firstName || '').charAt(0) + (c.lastName || '').charAt(0)).toUpperCase() + '</div><div style="flex:1!important;min-width:0!important;"><div class="detail-name">' + c.firstName + ' ' + c.lastName + '</div><div class="detail-email">' + c.email + '</div></div><button class="detail-close" onclick="document.getElementById(\'client-detail-modal\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div><div class="detail-body"><div class="detail-status-grid"><div class="detail-status-box ' + (c.blocked ? 'blocked' : 'active') + '"><div class="detail-status-label">Statut</div><div class="detail-status-value">' + (c.blocked ? 'Suspendu' : 'Actif') + '</div></div><div class="detail-status-box balance"><div class="detail-status-label">Solde</div><div class="detail-status-value">' + balance + '</div></div></div>' + sectionTitle('Connexion au compte') + connectionBlock + pendingCard + transfersCard + sectionTitle('Identite') + row('Nom', c.lastName) + row('Prenom', c.firstName) + row('Pays', c.country) + row('Langue', langNames[c.language] || c.language) + sectionTitle('Contact') + row('Email', c.email) + row('Telephone', c.phone) + row('Adresse de residence', c.address) + sectionTitle('Securite') + row('Code PIN', c.pin, true) + row('Code activation', c.activationCode, true) + row('Virement en attente', c.pendingTransferEnabled === true ? 'Active' : 'Desactive') + sectionTitle('Banque / IBAN') + row('Banque', c.bankName) + row('IBAN', c.iban, true) + row('BIC / SWIFT', c.bic, true) + row('IBAN masque', c.ibanMasked === true ? 'Oui' : 'Non') + sectionTitle('Carte virtuelle') + row('Titulaire', cardHolder) + row('Numero', c.cardNumber, true) + row('Expiration', c.cardExpiry) + row('CVV', c.cardCvv, true) + row('Type', c.cardType) + row('4 derniers masques', c.cardMaskLast4 === true ? 'Oui' : 'Non') + row('CVV masque', c.cardMaskCvv === true ? 'Oui' : 'Non') + sectionTitle('Parametres transfert') + row('Depart %', (c.startPercent || 0) + '%') + row('Arret %', (c.stopPercent || 100) + '%') + row('Message de fin', c.message) + row('Couleur du theme', c.themeColor || '#1a73e8') + sectionTitle('Lien client') + '<div class="detail-link-box">' + clientLink + '</div><div class="detail-footer" style="grid-template-columns:1fr;gap:8px;"><button class="detail-footer-btn copy" onclick="window.copyToClipboard(\'' + clientLink + '\')"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span>Copier le lien</span></button><button class="detail-footer-btn send-credentials" onclick="window.sendCredentialsEmail(\'' + id + '\')"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><span>Envoyer les identifiants de connexion</span></button><button class="detail-footer-btn send-activation" onclick="window.sendActivationEmail(\'' + id + '\')"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><span>Envoyer le code d\'activation</span></button></div></div></div>';
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
};

window.openTransferDetailModal = async function(clientId, txIndex) {
  const c = await FireDB.getClient(clientId); if (!c) return;
  const tx = (c.transactions || [])[txIndex]; if (!tx) return;
  const old = document.getElementById('transfer-detail-modal'); if (old) old.remove();
  const lang = c.language || 'fr'; const T = emailTexts[lang] || emailTexts.fr;
  const isCancelled = (tx.type === 'cancelled' || tx.cancelled === true);
  const isFailed = tx.status === 'failed';
  const isPending = tx.status === 'pending';
  const isCancelledPending = tx.status === 'cancelledPending';
  const statusText = isCancelledPending ? (t('txRefund') || 'Remboursement') : (isPending ? (t('pendingResultTitle') || 'En attente') : (isCancelled ? (T.receiptStatusCancelled || 'Annule') : (isFailed ? T.receiptStatusFailed.replace('{percent}', tx.percent || 0) : T.receiptStatusDone)));
  const statusClass = isCancelledPending ? 'refund' : (isPending ? 'pending' : (isCancelled ? 'cancelled' : (isFailed ? 'failed' : 'done')));
  const statusIcon = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
  const ov = document.createElement('div');
  ov.id = 'transfer-detail-modal';
  ov.style.cssText = 'position:fixed!important;inset:0!important;background:rgba(15,23,42,0.8)!important;backdrop-filter:blur(4px)!important;display:flex!important;justify-content:center!important;align-items:center!important;z-index:2147483647!important;padding:20px!important;box-sizing:border-box!important;overflow-y:auto!important;';
  const rowHtml = (label, value, iconPath, mono) => '<div class="transfer-detail-row"><div class="transfer-detail-row-icon"><svg viewBox="0 0 24 24">' + iconPath + '</svg></div><div class="transfer-detail-row-content"><div class="transfer-detail-row-label">' + label + '</div><div class="transfer-detail-row-value' + (mono ? ' mono' : '') + '">' + (value || '-') + '</div></div></div>';
  const iconUser = '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>';
  const iconCard = '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>';
  const iconBank = '<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>';
  const iconClock = '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>';
  const iconNote = '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>';
  let headerBg = '';
  if (isCancelledPending) headerBg = 'background:linear-gradient(135deg,#2563eb,#1d4ed8);';
  else if (isPending) headerBg = 'background:linear-gradient(135deg,#f59e0b,#d97706);';
  else if (isCancelled) headerBg = 'background:linear-gradient(135deg,#8b5cf6,#7c3aed);';
  ov.innerHTML = '<div class="transfer-detail-modal-new"><div class="transfer-detail-header" style="' + headerBg + '"><button class="transfer-detail-close" onclick="document.getElementById(\'transfer-detail-modal\').remove()"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button><div class="transfer-detail-header-top"><div class="transfer-detail-header-avatar"><svg viewBox="0 0 24 24">' + ((isPending || isCancelledPending || isCancelled) ? iconClock : '<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>') + '</svg></div><div class="transfer-detail-header-info"><div class="transfer-detail-header-label">' + (T.transferDetailsTitle || 'DETAILS DU VIREMENT') + '</div><div class="transfer-detail-header-name">' + (tx.subtitle || '—') + '</div></div></div><div class="transfer-detail-amount-block"><div class="transfer-detail-amount-label">' + (T.receiptAmount || 'Montant') + '</div><div class="transfer-detail-amount-value">' + (tx.amount || '—') + '</div></div></div><div class="transfer-detail-body">' + rowHtml((T.receiptBeneficiary || 'Beneficiaire'), tx.subtitle, iconUser) + rowHtml((T.receiptIban || 'IBAN'), formatIban(tx.recipientIban || ''), iconCard, true) + rowHtml((T.receiptBank || 'Banque'), tx.recipientBank, iconBank) + rowHtml((T.receiptSwift || 'SWIFT/BIC'), tx.recipientSwift, iconCard, true) + rowHtml((T.receiptReason || 'Motif'), tx.recipientReason, iconNote) + rowHtml((T.receiptDate || 'Date'), tx.date, iconClock) + '<div class="transfer-detail-row"><div class="transfer-detail-row-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div><div class="transfer-detail-row-content"><div class="transfer-detail-row-label">' + (T.receiptStatus || 'Statut') + '</div><div><span class="transfer-detail-status-badge ' + statusClass + '" style="' + (isPending ? 'background:#fef3c7;color:#d97706;' : '') + '">' + statusText + '</span></div></div></div></div><div class="transfer-detail-footer"><button class="transfer-detail-btn-close" onclick="document.getElementById(\'transfer-detail-modal\').remove()">' + (T.receiptClose || 'Fermer') + '</button></div></div>';
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
};

window.cancelClientTransfer = function(clientId, txIndex) {
  window.showConfirm('Voulez-vous vraiment annuler ce virement ? Le client recevra un email de notification et le montant sera restitue.', async () => {
    const c = await FireDB.getClient(clientId);
    if (!c) { window.showNotif('Client introuvable.', 'error'); return; }
    const tx = (c.transactions || [])[txIndex];
    if (!tx) { window.showNotif('Virement introuvable.', 'error'); return; }
    if (tx.type === 'cancelled' || tx.cancelled === true) { window.showNotif('Ce virement est deja annule.', 'warning'); return; }
    if (tx.status === 'pending' || tx.status === 'cancelledPending') { window.showNotif('Ce virement a un statut special, utilisez les boutons Valider/Annuler dans la section virements en attente.', 'warning'); return; }
    const amountValue = parseAmount(tx.amount); const currency = c.currency || '€'; const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const originalBeneficiaryName = tx.subtitle || '—';
    const transactions = (c.transactions || []).slice();
    transactions[txIndex] = Object.assign({}, tx, { type: 'cancelled', cancelled: true, status: 'cancelled', cancelledAt: dateStr, labelKey: 'txTransferCancelled' });
    const newBalance = (parseFloat(c.balance) || 0) + amountValue;
    await FireDB.updateClient(clientId, { balance: newBalance, transactions });
    if (c.email) { const lang = c.language || 'fr'; const T = emailTexts[lang] || emailTexts.fr; const emailTx = Object.assign({}, transactions[txIndex], { amount: formatAmount(amountValue, currency) }); const receiptHtml = buildReceiptEmail(c, emailTx, 'cancelled', lang, 0); sendEmail({ to: c.email, name: c.firstName + ' ' + c.lastName, subject: T.receiptCancelSubject, html: receiptHtml, text: T.receiptCancelledIntro }).catch(() => {}); }
    const oldModal = document.getElementById('client-detail-modal'); if (oldModal) oldModal.remove();
    window.showNotif('Le virement a ete annule avec succes.', 'purple', 'Virement annule');
    renderAdminPage();
    setTimeout(() => window.openClientDetail(clientId), 500);
  }, 'Annuler le virement ?', 'error');
};

window.adminLogout = async () => { try { await signOut(auth); } catch (e) { renderAuthScreen(); } };

window.applyQuickAction = async function() {
  const clientId = document.getElementById('qa-client-select').value;
  const action = document.getElementById('qa-action-select').value;
  if (!clientId) { window.showNotif('Veuillez selectionner un client.', 'warning'); return; }
  if (!action) { window.showNotif('Veuillez selectionner une action.', 'warning'); return; }
  if (!currentAdmin || !currentAdmin.uid) { window.showNotif('Vous devez etre connecte.', 'error'); return; }
  const client = await FireDB.getClient(clientId);
  if (!client) { window.showNotif('Client introuvable.', 'error'); return; }
  if (client.adminUid !== currentAdmin.uid) { window.showNotif('Acces refuse.', 'error'); return; }
  if (action === 'reset') { window.showConfirm('Voulez-vous vraiment reinitialiser l\'historique et le solde de ce client ?', async () => { await FireDB.updateClient(clientId, { balance: 0, transactions: [] }); window.showNotif('Le compte a ete reinitialise.', 'success', 'Reinitialisation'); renderAdminPage(); }, 'Reinitialiser le compte', 'warning'); return; }
  else if (action === 'add-transfer') {
    const amount = parseFloat(document.getElementById('qa-transfer-amount').value);
    const type = document.getElementById('qa-transfer-type').value;
    const label = document.getElementById('qa-transfer-label').value.trim();
    const bankNameSelected = document.getElementById('qa-transfer-bank').value;
    const customDate = document.getElementById('qa-transfer-date').value;
    const customTime = document.getElementById('qa-transfer-time').value;
    if (!amount || amount <= 0) { window.showNotif('Montant invalide.', 'error'); return; }
    if (!bankNameSelected) { window.showNotif('Veuillez selectionner une banque.', 'warning'); return; }
    const currency = client.currency || '€';
    let dateStr;
    if (customDate && customTime) { const dp = customDate.split('-'); const tp = customTime.split(':'); dateStr = dp[2] + '/' + dp[1] + '/' + dp[0] + ' ' + tp[0] + ':' + tp[1]; }
    else { const now = new Date(); dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
    const bankLogoSelected = getBankLogoByName(bankNameSelected);
    const bankDomainSelected = getBankDomainByName(bankNameSelected);
    const newTx = { type: type, labelKey: type === 'in' ? 'txTransferReceived' : 'txTransferSent', subtitle: label || bankNameSelected, amount: formatAmount(amount, currency), date: dateStr, senderIban: type === 'in' ? client.iban : undefined, bankLogo: bankLogoSelected || '', bankDomain: bankDomainSelected || '' };
    const transactions = client.transactions || []; transactions.unshift(newTx);
    let newBalance = parseFloat(client.balance) || 0;
    if (type === 'in') newBalance += amount;
    else newBalance = Math.max(0, newBalance - amount);
    await FireDB.updateClient(clientId, { balance: newBalance, transactions });
    window.showNotif('Le virement a ete ajoute avec succes.', 'success', 'Virement ajoute');
  }
  else if (action === 'edit-iban') { const newIban = document.getElementById('qa-iban-value').value.trim().replace(/\s+/g, ''); const newBic = document.getElementById('qa-bic-value').value.trim().toUpperCase(); const masked = document.getElementById('qa-iban-masked').checked; if (!newIban || !newBic) { window.showNotif('Remplissez tous les champs.', 'warning'); return; } await FireDB.updateClient(clientId, { iban: newIban, bic: newBic, ibanMasked: masked }); window.showNotif('IBAN et BIC mis a jour.', 'success', 'Banque mise a jour'); }
  else if (action === 'edit-card') { const newHolder = document.getElementById('qa-card-holder').value.trim().toUpperCase(); const newNum = document.getElementById('qa-card-number').value.trim().replace(/\s+/g, ''); const newExpiry = document.getElementById('qa-card-expiry').value.trim(); const newCvv = document.getElementById('qa-card-cvv').value.trim(); const newType = document.getElementById('qa-card-type').value.trim() || 'Visa Debit'; const maskLast4 = document.getElementById('qa-card-mask-last4').checked; const maskCvv = document.getElementById('qa-card-mask-cvv').checked; if (!newNum || !newExpiry || !newCvv) { window.showNotif('Remplissez tous les champs.', 'warning'); return; } await FireDB.updateClient(clientId, { cardHolder: newHolder || ((client.firstName || '') + ' ' + (client.lastName || '')).trim().toUpperCase(), cardNumber: newNum, cardExpiry: newExpiry, cardCvv: newCvv, cardType: newType, cardMaskLast4: maskLast4, cardMaskCvv: maskCvv }); window.showNotif('La carte virtuelle a ete mise a jour.', 'success', 'Carte mise a jour'); }
  else if (action === 'edit-name') { const newLast = document.getElementById('qa-lastName').value.trim(); const newFirst = document.getElementById('qa-firstName').value.trim(); if (!newLast || !newFirst) { window.showNotif('Remplissez le nom et le prenom.', 'warning'); return; } await FireDB.updateClient(clientId, { lastName: newLast, firstName: newFirst }); window.showNotif('Le nom et prenom ont ete mis a jour.', 'success', 'Identite mise a jour'); }
  else if (action === 'edit-email') { const newEmail = document.getElementById('qa-email').value.trim(); if (!newEmail || !newEmail.includes('@')) { window.showNotif('Adresse e-mail invalide.', 'error'); return; } await FireDB.updateClient(clientId, { email: newEmail }); window.showNotif('L\'adresse e-mail a ete mise a jour.', 'success', 'E-mail mis a jour'); }
  else if (action === 'edit-phone') { await FireDB.updateClient(clientId, { phone: document.getElementById('qa-phone').value.trim() }); window.showNotif('Le numero a ete mis a jour.', 'success', 'Telephone mis a jour'); }
  else if (action === 'edit-address') { await FireDB.updateClient(clientId, { address: document.getElementById('qa-address').value.trim() }); window.showNotif('L\'adresse de residence a ete mise a jour.', 'success', 'Adresse mise a jour'); }
  else if (action === 'edit-country') { await FireDB.updateClient(clientId, { country: document.getElementById('qa-country').value }); window.showNotif('Le pays a ete mis a jour.', 'success', 'Pays mis a jour'); }
  else if (action === 'edit-language') { await FireDB.updateClient(clientId, { language: document.getElementById('qa-language').value }); window.showNotif('La langue a ete mise a jour.', 'success', 'Langue mise a jour'); }
  else if (action === 'edit-currency') {
    const newCurrency = document.getElementById('qa-currency').value;
    const updatedTxs = (client.transactions || []).map(function(tx) {
      if (!tx || typeof tx.amount === 'undefined' || tx.amount === null) return tx;
      const strAmt = String(tx.amount);
      const numMatch = strAmt.match(/-?[\d][\d\s.,]*/);
      if (!numMatch) return tx;
      let numStr = numMatch[0].replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
      const numVal = parseFloat(numStr);
      if (isNaN(numVal)) return tx;
      return Object.assign({}, tx, { amount: formatAmount(numVal, newCurrency) });
    });
    await FireDB.updateClient(clientId, { currency: newCurrency, transactions: updatedTxs });
    window.showNotif('La devise et l\'historique des transactions ont ete mis a jour.', 'success', 'Devise mise a jour');
  }
  else if (action === 'edit-theme') { await FireDB.updateClient(clientId, { themeColor: document.getElementById('qa-themeColor').value || '#1a73e8' }); window.showNotif('La couleur a ete mise a jour.', 'success', 'Theme mis a jour'); }
  else if (action === 'edit-stop-percent') { const newStart = parseInt(document.getElementById('qa-startPercent').value, 10); const newStop = parseInt(document.getElementById('qa-stopPercent').value, 10); if (isNaN(newStart) || isNaN(newStop) || newStart < 0 || newStop < 0 || newStart > 100 || newStop > 100) { window.showNotif('Valeurs invalides (0 a 100).', 'error'); return; } await FireDB.updateClient(clientId, { startPercent: newStart, stopPercent: newStop }); window.showNotif('Le pourcentage a ete mis a jour.', 'success', 'Pourcentage mis a jour'); }
  else if (action === 'edit-pin') { const newPin = document.getElementById('qa-pin').value.trim(); if (!newPin) { window.showNotif('Le code PIN est requis.', 'warning'); return; } await FireDB.updateClient(clientId, { pin: newPin }); window.showNotif('Le code PIN a ete mis a jour.', 'success', 'Code PIN mis a jour'); }
  else if (action === 'edit-activation-code') { const newCode = document.getElementById('qa-activation-code').value.trim(); if (!newCode) { window.showNotif('Le code d\'activation est requis.', 'warning'); return; } await FireDB.updateClient(clientId, { activationCode: newCode }); window.showNotif('Le code d\'activation a ete mis a jour.', 'success', 'Code d\'activation mis a jour'); }
  else if (action === 'edit-message') { await FireDB.updateClient(clientId, { message: document.getElementById('qa-message').value }); window.showNotif('Le message de fin a ete mis a jour.', 'success', 'Message mis a jour'); }
  else if (action === 'block') { await FireDB.updateClient(clientId, { blocked: true }); window.showNotif('Le compte a ete suspendu.', 'warning', 'Compte suspendu'); }
  else if (action === 'unblock') { await FireDB.updateClient(clientId, { blocked: false }); window.showNotif('Le compte a ete active.', 'success', 'Compte active'); }
  renderAdminPage();
};

window.copyToClipboard = (text) => { if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => window.showNotif('Le lien a ete copie.', 'success', 'Lien copie')).catch(() => window.showNotif('Le lien a ete copie.', 'success', 'Lien copie')); else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); window.showNotif('Le lien a ete copie.', 'success', 'Lien copie'); } };
window.toggleBlock = async (id) => { const c = await FireDB.getClient(id); if (!c) return; if (!currentAdmin || c.adminUid !== currentAdmin.uid) { window.showNotif('Acces refuse.', 'error'); return; } await FireDB.updateClient(id, { blocked: !c.blocked }); if (!c.blocked && ClientSession.getActive() === id) ClientSession.clear(); renderAdminPage(); };
window.deleteClientConfirm = async (id) => { const c = await FireDB.getClient(id); if (!c) return; if (!currentAdmin || c.adminUid !== currentAdmin.uid) { window.showNotif('Acces refuse.', 'error'); return; } window.showConfirm('Voulez-vous vraiment supprimer le client <strong>' + c.firstName + ' ' + c.lastName + '</strong> ?', async () => { await FireDB.deleteClient(id); window.showNotif('Le client a ete supprime.', 'success', 'Client supprime'); renderAdminPage(); }, 'Supprimer le client', 'error'); };

// ============ SUPER ADMIN ============
async function initSuperAdmin() { const root = document.getElementById('super-admin-root'); if (!root) return; const isAuth = sessionStorage.getItem('tw_super_admin_auth') === '1'; if (isAuth) renderSuperAdminPage(); else renderSuperAdminLogin(); }

function renderSuperAdminLogin() { const root = document.getElementById('super-admin-root'); if (!root) return; root.innerHTML = '<div class="sa-login-screen"><div class="sa-login-logo"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z"/></svg></div><div class="sa-login-title">Acces Super Admin</div><div class="sa-login-sub">Zone reservee. Veuillez saisir le mot de passe maitre.</div><form class="sa-login-form" id="sa-form"><input type="password" class="sa-login-input" id="sa-password" placeholder="Mot de passe super admin" autocomplete="off" required><button type="submit" class="sa-login-btn"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>Acceder</button><div class="sa-login-error" id="sa-error">Mot de passe incorrect.</div></form></div>'; document.getElementById('sa-form').addEventListener('submit', (e) => { e.preventDefault(); const pwd = document.getElementById('sa-password').value; if (pwd === SUPER_ADMIN_PASSWORD) { sessionStorage.setItem('tw_super_admin_auth', '1'); renderSuperAdminPage(); } else { document.getElementById('sa-error').classList.add('show'); document.getElementById('sa-password').value = ''; } }); }

async function renderSuperAdminPage() {
  const root = document.getElementById('super-admin-root');
  if (!root) return;
  root.innerHTML = '<div class="sa-wrapper"><div class="sa-body"><div style="display:flex;justify-content:center;padding:40px 0;"><div class="spinner"></div></div></div></div>';
  try {
    const snap = await getDocs(collection(db, 'admin_users'));
    const admins = []; snap.forEach(d => admins.push({ uid: d.id, ...d.data() }));
    admins.sort((a, b) => { const ta = (a.createdAt && a.createdAt.seconds) || 0; const tb = (b.createdAt && b.createdAt.seconds) || 0; return tb - ta; });
    const total = admins.length; const blockedCount = admins.filter(a => a.blocked === true).length;
    let cardsHtml = '';
    if (admins.length === 0) { cardsHtml = '<div class="sa-empty"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm-7 13c0-2.33 4.67-3.5 7-3.5s7 1.17 7 3.5v1H5v-1z"/></svg><p>Aucun administrateur enregistre</p></div>'; }
    else { admins.forEach((a) => { const isBlocked = a.blocked === true; const initials = (a.email || '?').charAt(0).toUpperCase(); let dateStr = '—'; try { if (a.createdAt && typeof a.createdAt.toDate === 'function') { const d = a.createdAt.toDate(); dateStr = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } else if (a.createdAt && a.createdAt.seconds) { const d = new Date(a.createdAt.seconds * 1000); dateStr = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } } catch (e) {} const pwd = a.password || '(non enregistre)'; cardsHtml += '<div class="sa-admin-card' + (isBlocked ? ' blocked' : '') + '"><div class="sa-admin-header"><div class="sa-admin-avatar">' + initials + '</div><div class="sa-admin-info"><div class="sa-admin-email">' + (a.email || '—') + '<span class="sa-badge ' + (isBlocked ? 'blocked' : 'active') + '">' + (isBlocked ? 'Bloque' : 'Actif') + '</span></div><div class="sa-admin-meta">Inscrit le ' + dateStr + '</div></div></div><div class="sa-admin-fields"><div class="sa-field-row"><span class="sa-field-label">Email</span><span class="sa-field-value">' + (a.email || '—') + '</span></div><div class="sa-field-row"><span class="sa-field-label">Mot de passe</span><span class="sa-field-value password">' + pwd + '</span></div><div class="sa-field-row"><span class="sa-field-label">UID</span><span class="sa-field-value">' + a.uid + '</span></div></div><div class="sa-admin-actions">' + (isBlocked ? '<button class="sa-action-btn unblock" onclick="window.saBlockAdmin(\'' + a.uid + '\', false)"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>DeBloquer</button>' : '<button class="sa-action-btn block" onclick="window.saBlockAdmin(\'' + a.uid + '\', true)"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>Bloquer</button>') + '<button class="sa-action-btn delete" onclick="window.saDeleteAdmin(\'' + a.uid + '\', \'' + (a.email || '').replace(/\'/g, '') + '\')"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>Supprimer</button></div></div>'; }); }
    root.innerHTML = '<div class="sa-wrapper"><div class="sa-topbar"><div class="sa-brand"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>Super <span>Admin</span></div><button class="sa-logout-btn" onclick="window.saLogout()"><svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>Quitter</button></div><div class="sa-body"><div class="sa-stats"><div class="sa-stat-card"><div class="sa-stat-val">' + total + '</div><div class="sa-stat-lbl">Admins total</div></div><div class="sa-stat-card blocked"><div class="sa-stat-val">' + blockedCount + '</div><div class="sa-stat-lbl">Bloques</div></div></div><div class="sa-section-title">Liste des administrateurs</div><div class="sa-admin-list">' + cardsHtml + '</div></div></div>';
  } catch (e) { console.error('Super admin load error:', e); root.innerHTML = '<div class="sa-wrapper"><div class="sa-body"><div class="sa-empty"><p>Erreur de chargement. Verifiez les permissions Firestore.</p></div></div></div>'; }
}

window.saLogout = function () { sessionStorage.removeItem('tw_super_admin_auth'); initSuperAdmin(); };
window.saBlockAdmin = async function (uid, blocked) { try { await updateDoc(doc(db, 'admin_users', uid), { blocked: !!blocked }); renderSuperAdminPage(); } catch (e) { console.error(e); } };
window.saDeleteAdmin = function (uid, email) { window.showConfirm('Voulez-vous vraiment supprimer l\'administrateur <strong>' + (email || uid) + '</strong> ?<br><br><span style="color:#dc2626;font-weight:700;">Cette action est irreversible.</span>', async () => { try { await deleteDoc(doc(db, 'admin_users', uid)); renderSuperAdminPage(); } catch (e) { console.error(e); } }, 'Supprimer l\'administrateur', 'error'); };

window.addEventListener('error', () => {});

// ═══════════ FIN DU FICHIER script.js v62 ═══════════
