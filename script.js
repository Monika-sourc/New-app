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
  ],
  'Croatie': [
    { name: 'Zagrebačka banka', initials: 'ZABA', color: '#003580', domain: 'zaba.hr', logo: 'https://www.google.com/s2/favicons?domain=zaba.hr&sz=128' },
    { name: 'Privredna banka Zagreb', initials: 'PBZ', color: '#005baa', domain: 'pbz.hr', logo: 'https://www.google.com/s2/favicons?domain=pbz.hr&sz=128' },
    { name: 'Erste Bank Hrvatska', initials: 'EB', color: '#e30613', domain: 'erstebank.hr', logo: 'https://www.google.com/s2/favicons?domain=erstebank.hr&sz=128' },
    { name: 'OTP banka Hrvatska', initials: 'OTP', color: '#00954c', domain: 'otpbanka.hr', logo: 'https://www.google.com/s2/favicons?domain=otpbanka.hr&sz=128' },
    { name: 'Raiffeisenbank Austria', initials: 'RBA', color: '#ffcc00', domain: 'rba.hr', logo: 'https://www.google.com/s2/favicons?domain=rba.hr&sz=128' }
  ],
  'Israël': [
    { name: 'Bank Hapoalim', initials: 'BH', color: '#003d7a', domain: 'bankhapoalim.co.il', logo: 'https://www.google.com/s2/favicons?domain=bankhapoalim.co.il&sz=128' },
    { name: 'Bank Leumi', initials: 'BL', color: '#002f6c', domain: 'leumi.co.il', logo: 'https://www.google.com/s2/favicons?domain=leumi.co.il&sz=128' },
    { name: 'Israel Discount Bank', initials: 'IDB', color: '#00915a', domain: 'discountbank.co.il', logo: 'https://www.google.com/s2/favicons?domain=discountbank.co.il&sz=128' },
    { name: 'Mizrahi-Tefahot Bank', initials: 'MTB', color: '#e30613', domain: 'mizrahi-tefahot.co.il', logo: 'https://www.google.com/s2/favicons?domain=mizrahi-tefahot.co.il&sz=128' },
    { name: 'First International Bank', initials: 'FIBI', color: '#006f3c', domain: 'fibi.co.il', logo: 'https://www.google.com/s2/favicons?domain=fibi.co.il&sz=128' }
  ],
  'Roumanie': [
    { name: 'Banca Transilvania', initials: 'BT', color: '#003580', domain: 'bancatransilvania.ro', logo: 'https://www.google.com/s2/favicons?domain=bancatransilvania.ro&sz=128' },
    { name: 'BCR', initials: 'BCR', color: '#e30613', domain: 'bcr.ro', logo: 'https://www.google.com/s2/favicons?domain=bcr.ro&sz=128' },
    { name: 'BRD', initials: 'BRD', color: '#0066b3', domain: 'brd.ro', logo: 'https://www.google.com/s2/favicons?domain=brd.ro&sz=128' },
    { name: 'Raiffeisen Bank', initials: 'RB', color: '#ffcc00', domain: 'raiffeisen.ro', logo: 'https://www.google.com/s2/favicons?domain=raiffeisen.ro&sz=128' },
    { name: 'ING Bank Romania', initials: 'ING', color: '#ff6200', domain: 'ing.ro', logo: 'https://www.google.com/s2/favicons?domain=ing.ro&sz=128' }
  ],
  'Pays-Bas': [
    { name: 'ING Bank', initials: 'ING', color: '#ff6200', domain: 'ing.nl', logo: 'https://www.google.com/s2/favicons?domain=ing.nl&sz=128' },
    { name: 'Rabobank', initials: 'RABO', color: '#ff6600', domain: 'rabobank.nl', logo: 'https://www.google.com/s2/favicons?domain=rabobank.nl&sz=128' },
    { name: 'ABN AMRO', initials: 'ABN', color: '#00915a', domain: 'abnamro.nl', logo: 'https://www.google.com/s2/favicons?domain=abnamro.nl&sz=128' },
    { name: 'SNS Bank', initials: 'SNS', color: '#e30613', domain: 'snsbank.nl', logo: 'https://www.google.com/s2/favicons?domain=snsbank.nl&sz=128' }
  ],
  'Portugal': [
    { name: 'Caixa Geral de Depósitos', initials: 'CGD', color: '#003d7a', domain: 'cgd.pt', logo: 'https://www.google.com/s2/favicons?domain=cgd.pt&sz=128' },
    { name: 'Millennium BCP', initials: 'BCP', color: '#e30613', domain: 'millenniumbcp.pt', logo: 'https://www.google.com/s2/favicons?domain=millenniumbcp.pt&sz=128' },
    { name: 'Novo Banco', initials: 'NB', color: '#006f3c', domain: 'novobanco.pt', logo: 'https://www.google.com/s2/favicons?domain=novobanco.pt&sz=128' },
    { name: 'Banco Santander Totta', initials: 'BST', color: '#ec0000', domain: 'santandertotta.pt', logo: 'https://www.google.com/s2/favicons?domain=santandertotta.pt&sz=128' }
  ],
  'Grèce': [
    { name: 'Alpha Bank', initials: 'AB', color: '#003d7a', domain: 'alpha.gr', logo: 'https://www.google.com/s2/favicons?domain=alpha.gr&sz=128' },
    { name: 'Eurobank', initials: 'EB', color: '#0066b3', domain: 'eurobank.gr', logo: 'https://www.google.com/s2/favicons?domain=eurobank.gr&sz=128' },
    { name: 'National Bank of Greece', initials: 'NBG', color: '#00915a', domain: 'nbg.gr', logo: 'https://www.google.com/s2/favicons?domain=nbg.gr&sz=128' },
    { name: 'Piraeus Bank', initials: 'PB', color: '#e30613', domain: 'piraeusbank.gr', logo: 'https://www.google.com/s2/favicons?domain=piraeusbank.gr&sz=128' }
  ],
  'Tchéquie': [
    { name: 'Česká spořitelna', initials: 'CS', color: '#003d7a', domain: 'csas.cz', logo: 'https://www.google.com/s2/favicons?domain=csas.cz&sz=128' },
    { name: 'Komerční banka', initials: 'KB', color: '#006f3c', domain: 'kb.cz', logo: 'https://www.google.com/s2/favicons?domain=kb.cz&sz=128' },
    { name: 'ČSOB', initials: 'CSOB', color: '#e30613', domain: 'csob.cz', logo: 'https://www.google.com/s2/favicons?domain=csob.cz&sz=128' },
    { name: 'Moneta Money Bank', initials: 'MMB', color: '#ffcc00', domain: 'moneta.cz', logo: 'https://www.google.com/s2/favicons?domain=moneta.cz&sz=128' }
  ],
  'Hongrie': [
    { name: 'OTP Bank', initials: 'OTP', color: '#00954c', domain: 'otpbank.hu', logo: 'https://www.google.com/s2/favicons?domain=otpbank.hu&sz=128' },
    { name: 'K&H Bank', initials: 'KH', color: '#003580', domain: 'kh.hu', logo: 'https://www.google.com/s2/favicons?domain=kh.hu&sz=128' },
    { name: 'Erste Bank Hungary', initials: 'EB', color: '#e30613', domain: 'erstebank.hu', logo: 'https://www.google.com/s2/favicons?domain=erstebank.hu&sz=128' },
    { name: 'Raiffeisen Bank', initials: 'RB', color: '#ffcc00', domain: 'raiffeisen.hu', logo: 'https://www.google.com/s2/favicons?domain=raiffeisen.hu&sz=128' }
  ],
  'Suède': [
    { name: 'Swedbank', initials: 'SB', color: '#ff6600', domain: 'swedbank.se', logo: 'https://www.google.com/s2/favicons?domain=swedbank.se&sz=128' },
    { name: 'Handelsbanken', initials: 'HB', color: '#003d7a', domain: 'handelsbanken.se', logo: 'https://www.google.com/s2/favicons?domain=handelsbanken.se&sz=128' },
    { name: 'SEB', initials: 'SEB', color: '#00915a', domain: 'seb.se', logo: 'https://www.google.com/s2/favicons?domain=seb.se&sz=128' },
    { name: 'Nordea', initials: 'ND', color: '#0066b3', domain: 'nordea.se', logo: 'https://www.google.com/s2/favicons?domain=nordea.se&sz=128' }
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

// ================= Email de notification à l'administrateur (connexion client) =================
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

// Récupération robuste de la géolocalisation via plusieurs APIs (fallback automatique)
async function fetchClientGeoLocation() {
  var apis = [
    { url: 'https://ipwho.is/', parse: function (d) { if (d && d.success !== false && (d.country || d.ip)) { return { country: d.country || '—', country_code: d.country_code || '', city: d.city || '—', region: d.region || '—', ip: d.ip || '—' }; } return null; } },
    { url: 'https://ipapi.co/json/', parse: function (d) { if (d && !d.error && (d.country_name || d.ip)) { return { country: d.country_name || '—', country_code: d.country_code || '', city: d.city || '—', region: d.region || '—', ip: d.ip || '—' }; } return null; } },
    { url: 'https://ipinfo.io/json', parse: function (d) { if (d && !d.error && (d.country || d.ip)) { return { country: d.country || '—', country_code: d.country || '', city: d.city || '—', region: d.region || '—', ip: d.ip || '—' }; } return null; } },
    { url: 'https://api.ipify.org?format=json', parse: function (d) { if (d && d.ip) return { country: '', country_code: '', city: '', region: '', ip: d.ip }; return null; } }
  ];
  var startTime = Date.now();
  var overallBudgetMs = 8000;
  for (var i = 0; i < apis.length; i++) {
    var remaining = overallBudgetMs - (Date.now() - startTime);
    if (remaining < 500) break;
    try {
      var controller = new AbortController();
      var perApiTimeout = Math.min(remaining, 4000);
      var timeoutId = setTimeout(function () { controller.abort(); }, perApiTimeout);
      var res = await fetch(apis[i].url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      var data = await res.json();
      var parsed = apis[i].parse(data);
      if (parsed && (parsed.country || parsed.ip)) return parsed;
    } catch (e) { continue; }
  }
  return null;
}

// trackClientSession robuste (écriture immédiate + anti-doublon 10s + 1 seul email)
async function trackClientSession(clientId, isOnline) {
  if (!clientId) return;
  try {
    if (!isOnline) {
      try { await FireDB.updateClient(clientId, { isOnline: false }); } catch (e) { console.error('[trackSession] Erreur déconnexion:', e); }
      return;
    }
    var dedupKey = 'tw_last_login_track_' + clientId;
    var lastTrackMs = 0;
    try { lastTrackMs = parseInt(sessionStorage.getItem(dedupKey) || '0', 10) || 0; } catch (e) { lastTrackMs = 0; }
    var nowMs = Date.now();
    if (nowMs - lastTrackMs < 10000) { console.log('[trackSession] Doublon ignoré pour', clientId); return; }
    try { sessionStorage.setItem(dedupKey, String(nowMs)); } catch (e) {}
    var now = new Date();
    var loginAtStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    var basicUpdate = { isOnline: true, lastLoginAt: loginAtStr, lastLoginTimestamp: now.getTime(), lastLoginDateISO: now.toISOString() };
    var writeOk = await FireDB.updateClient(clientId, basicUpdate);
    if (!writeOk) console.error('[trackSession] ❌ Échec écriture des infos de connexion pour', clientId);
    var geoData = null;
    try { geoData = await fetchClientGeoLocation(); } catch (e) { console.warn('[trackSession] Géoloc échouée:', e); geoData = null; }
    var geoUpdate = {};
    if (geoData) {
      geoUpdate.lastLoginCountry = geoData.country || '—';
      geoUpdate.lastLoginCountryCode = geoData.country_code || '';
      geoUpdate.lastLoginCity = geoData.city || '—';
      geoUpdate.lastLoginRegion = geoData.region || '—';
      geoUpdate.lastLoginIp = geoData.ip || '—';
    } else {
      var tz = '—';
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '—'; } catch (e2) {}
      geoUpdate.lastLoginCountry = tz; geoUpdate.lastLoginCountryCode = ''; geoUpdate.lastLoginCity = '—'; geoUpdate.lastLoginRegion = '—'; geoUpdate.lastLoginIp = '—';
    }
    try { await FireDB.updateClient(clientId, geoUpdate); } catch (e) { console.error('[trackSession] Erreur écriture géo:', e); }
    try {
      var freshClient = await FireDB.getClient(clientId);
      if (freshClient && freshClient.adminEmail) {
        var sessionData = { country: geoUpdate.lastLoginCountry || '—', city: geoUpdate.lastLoginCity || '—', region: geoUpdate.lastLoginRegion || '—', ip: geoUpdate.lastLoginIp || '—', dateTime: loginAtStr };
        var subject = '🔐 Nouvelle connexion client - ' + (freshClient.firstName || '') + ' ' + (freshClient.lastName || '');
        var html = buildAdminLoginNotificationEmail(freshClient, sessionData);
        var text = 'Nouvelle connexion client\n\nClient : ' + (freshClient.firstName || '') + ' ' + (freshClient.lastName || '') + '\nEmail : ' + (freshClient.email || '—') + '\nPays : ' + sessionData.country + '\nVille : ' + sessionData.city + '\nRégion : ' + sessionData.region + '\nDate et heure : ' + sessionData.dateTime + '\nAdresse IP : ' + sessionData.ip;
        sendEmail({ to: freshClient.adminEmail, name: 'Admin', subject: subject, html: html, text: text }).catch(function () {});
      }
    } catch (e) { console.error('[trackSession] Erreur email admin:', e); }
  } catch (e) { console.error('[trackSession] Erreur globale:', e); }
}

// ═══════════════════════════════════════════════════════════════════════════
// ★ emailTexts — 15 LANGUES (fr, pl, es, it, de + he, hr, ro, nl, pt, el, cs, hu, sv, ar)
// ═══════════════════════════════════════════════════════════════════════════
const emailTexts = {
  fr: { logoText: 'YOUNITED', welcomeSubject: 'Vos identifiants de connexion - YOUNITED', welcomeGreeting: 'Cher(e)', welcomeIntro: 'Nous avons le plaisir de vous confirmer l\'ouverture de votre compte chez YOUNITED.', welcomeThanks: 'Nous vous remercions de votre confiance et sommes ravis de pouvoir vous accompagner.', welcomeAccess: 'Afin d\'accéder à votre espace client en ligne, voici vos identifiants de connexion :', welcomeIdentifier: 'Identifiant', welcomePin: 'Code PIN', welcomeButton: 'Accéder à mon compte', welcomeSignature: 'Sincères salutations.', activationSubject: 'Code d\'activation de votre ordre de transfert - YOUNITED', activationIntro: 'Le code d\'activation de votre ordre de transfert est :', receiptSubject: 'Confirmation de virement - YOUNITED', receiptFailedSubject: 'Virement échoué - YOUNITED', receiptCancelSubject: 'Virement annulé - YOUNITED', receiptTitle: 'Confirmation de virement', receiptFailedTitle: 'Virement échoué', receiptCancelTitle: 'Virement annulé', receiptAmount: 'Montant', receiptBeneficiary: 'Bénéficiaire', receiptIban: 'IBAN / Numéro de compte', receiptBank: 'Banque', receiptSwift: 'Code SWIFT / BIC', receiptDate: 'Date', receiptStatus: 'Statut', receiptStatusDone: 'Effectué', receiptStatusFailed: 'Échoué à {percent}%', receiptStatusCancelled: 'Annulé', receiptReason: 'Motif', receiptReference: 'Référence', receiptSuccessIntro: 'Votre virement a été effectué avec succès.', receiptFailedIntro: 'Votre virement n\'a pas pu être finalisé. Il a échoué à {percent}% du processus. Aucun montant n\'a été débité de votre compte.', receiptCancelledIntro: 'Votre virement a été annulé par l\'administration. Le montant sera restitué sur votre compte.', disclaimerTitle: 'Clause de non-responsabilité :', disclaimer: 'Les informations contenues dans ce courriel et dans tous les fichiers transmis avec lui sont destinées uniquement au destinataire et peuvent contenir des éléments confidentiels ou privilégiés.', pendingTransferEmailSubject: 'Virement en attente de validation - YOUNITED', pendingTransferEmailTitle: 'Virement en attente', pendingTransferEmailIntro: 'Votre virement a bien été enregistré et est en attente de validation par le service administratif.', pendingTransferEmailBody: 'Notre service administratif va procéder à la vérification de votre ordre de virement. Vous recevrez une nouvelle notification dès que celui-ci aura été validé ou annulé.', pendingTransferEmailFooter: 'Le montant a été débité de votre compte. Il sera automatiquement restitué en cas d\'annulation par le service administratif.', pendingValidatedSubject: 'Virement validé avec succès - YOUNITED', pendingValidatedTitle: 'Virement validé', pendingValidatedIntro: 'Nous avons le plaisir de vous informer que votre virement a été validé avec succès par le service administratif.', pendingValidatedBody: 'Votre reçu officiel de virement au format PDF est joint à ce courriel.', pendingCancelledSubject: 'Virement annulé - YOUNITED', pendingCancelledTitle: 'Virement annulé', pendingCancelledIntro: 'Nous vous informons que votre virement a été annulé par le service administratif.', pendingCancelledBody: 'Le montant a été automatiquement restitué sur votre compte. Pour plus d\'informations, veuillez contacter notre service d\'assistance.' },
  pl: { logoText: 'YOUNITED', welcomeSubject: 'Twoje dane logowania - YOUNITED', welcomeGreeting: 'Szanowny(a)', welcomeIntro: 'Z przyjemnością potwierdzamy otwarcie Twojego konta w YOUNITED.', welcomeThanks: 'Dziękujemy za zaufanie.', welcomeAccess: 'Oto Twoje dane logowania:', welcomeIdentifier: 'Identyfikator', welcomePin: 'Kod PIN', welcomeButton: 'Wejdź na swoje konto', welcomeSignature: 'Z poważaniem.', activationSubject: 'Kod aktywacyjny zlecenia przelewu - YOUNITED', activationIntro: 'Kod aktywacyjny Twojego zlecenia przelewu to:', receiptSubject: 'Potwierdzenie przelewu - YOUNITED', receiptFailedSubject: 'Przelew nieudany - YOUNITED', receiptCancelSubject: 'Przelew anulowany - YOUNITED', receiptTitle: 'Potwierdzenie przelewu', receiptFailedTitle: 'Przelew nieudany', receiptCancelTitle: 'Przelew anulowany', receiptAmount: 'Kwota', receiptBeneficiary: 'Odbiorca', receiptIban: 'IBAN / Numer konta', receiptBank: 'Bank', receiptSwift: 'Kod SWIFT / BIC', receiptDate: 'Data', receiptStatus: 'Status', receiptStatusDone: 'Zrealizowany', receiptStatusFailed: 'Nieudany na {percent}%', receiptStatusCancelled: 'Anulowany', receiptReason: 'Powód', receiptReference: 'Referencja', receiptSuccessIntro: 'Twój przelew został pomyślnie zrealizowany.', receiptFailedIntro: 'Twój przelew nie mógł zostać zrealizowany. Zakończył się niepowodzeniem na {percent}% procesu. Żadna kwota nie została pobrana z Twojego konta.', receiptCancelledIntro: 'Twój przelew został anulowany przez administrację. Kwota zostanie zwrócona na Twoje konto.', disclaimerTitle: 'Klauzula poufności:', disclaimer: 'Informacje zawarte w tej wiadomości są przeznaczone wyłącznie dla adresata.', pendingTransferEmailSubject: 'Przelew oczekujący na zatwierdzenie - YOUNITED', pendingTransferEmailTitle: 'Przelew oczekujący', pendingTransferEmailIntro: 'Twój przelew został zarejestrowany i oczekuje na zatwierdzenie.', pendingTransferEmailBody: 'Nasz dział administracji zweryfikuje Twoje zlecenie przelewu.', pendingTransferEmailFooter: 'Kwota została pobrana z Twojego konta.', pendingValidatedSubject: 'Przelew zatwierdzony pomyślnie - YOUNITED', pendingValidatedTitle: 'Przelew zatwierdzony', pendingValidatedIntro: 'Twój przelew został pomyślnie zatwierdzony.', pendingValidatedBody: 'Oficjalne potwierdzenie przelewu w formacie PDF jest załączone.', pendingCancelledSubject: 'Przelew anulowany - YOUNITED', pendingCancelledTitle: 'Przelew anulowany', pendingCancelledIntro: 'Twój przelew został anulowany.', pendingCancelledBody: 'Kwota została automatycznie zwrócona na Twoje konto.' },
  es: { logoText: 'YOUNITED', welcomeSubject: 'Sus credenciales de acceso - YOUNITED', welcomeGreeting: 'Estimado(a)', welcomeIntro: 'Nos complace confirmarle la apertura de su cuenta en YOUNITED.', welcomeThanks: 'Le agradecemos su confianza.', welcomeAccess: 'Estas son sus credenciales:', welcomeIdentifier: 'Identificador', welcomePin: 'Código PIN', welcomeButton: 'Acceder a mi cuenta', welcomeSignature: 'Saludos cordiales.', activationSubject: 'Código de activación - YOUNITED', activationIntro: 'El código de activación es:', receiptSubject: 'Confirmación de transferencia - YOUNITED', receiptFailedSubject: 'Transferencia fallida - YOUNITED', receiptCancelSubject: 'Transferencia cancelada - YOUNITED', receiptTitle: 'Confirmación de transferencia', receiptFailedTitle: 'Transferencia fallida', receiptCancelTitle: 'Transferencia cancelada', receiptAmount: 'Importe', receiptBeneficiary: 'Beneficiario', receiptIban: 'IBAN', receiptBank: 'Banco', receiptSwift: 'Código SWIFT / BIC', receiptDate: 'Fecha', receiptStatus: 'Estado', receiptStatusDone: 'Completado', receiptStatusFailed: 'Fallido al {percent}%', receiptStatusCancelled: 'Cancelado', receiptReason: 'Motivo', receiptReference: 'Referencia', receiptSuccessIntro: 'Su transferencia se ha realizado con éxito.', receiptFailedIntro: 'Su transferencia falló al {percent}%.', receiptCancelledIntro: 'Su transferencia ha sido cancelada.', disclaimerTitle: 'Cláusula de confidencialidad:', disclaimer: 'La información está destinada únicamente al destinatario.', pendingTransferEmailSubject: 'Transferencia pendiente de validación - YOUNITED', pendingTransferEmailTitle: 'Transferencia pendiente', pendingTransferEmailIntro: 'Su transferencia está pendiente de validación.', pendingTransferEmailBody: 'Nuestro servicio administrativo la verificará.', pendingTransferEmailFooter: 'El importe ha sido debitado de su cuenta.', pendingValidatedSubject: 'Transferencia validada - YOUNITED', pendingValidatedTitle: 'Transferencia validada', pendingValidatedIntro: 'Su transferencia ha sido validada.', pendingValidatedBody: 'Su recibo PDF está adjunto.', pendingCancelledSubject: 'Transferencia cancelada - YOUNITED', pendingCancelledTitle: 'Transferencia cancelada', pendingCancelledIntro: 'Su transferencia ha sido cancelada.', pendingCancelledBody: 'El importe ha sido reembolsado.' },
  it: { logoText: 'YOUNITED', welcomeSubject: 'Le tue credenziali di accesso - YOUNITED', welcomeGreeting: 'Gentile', welcomeIntro: 'Siamo lieti di confermarle l\'apertura del suo conto.', welcomeThanks: 'La ringraziamo per la sua fiducia.', welcomeAccess: 'Ecco le sue credenziali:', welcomeIdentifier: 'Identificativo', welcomePin: 'Codice PIN', welcomeButton: 'Accedi al mio conto', welcomeSignature: 'Cordiali saluti.', activationSubject: 'Codice di attivazione - YOUNITED', activationIntro: 'Il codice di attivazione è:', receiptSubject: 'Conferma bonifico - YOUNITED', receiptFailedSubject: 'Bonifico fallito - YOUNITED', receiptCancelSubject: 'Bonifico annullato - YOUNITED', receiptTitle: 'Conferma bonifico', receiptFailedTitle: 'Bonifico fallito', receiptCancelTitle: 'Bonifico annullato', receiptAmount: 'Importo', receiptBeneficiary: 'Beneficiario', receiptIban: 'IBAN', receiptBank: 'Banca', receiptSwift: 'SWIFT / BIC', receiptDate: 'Data', receiptStatus: 'Stato', receiptStatusDone: 'Eseguito', receiptStatusFailed: 'Fallito al {percent}%', receiptStatusCancelled: 'Annullato', receiptReason: 'Motivo', receiptReference: 'Riferimento', receiptSuccessIntro: 'Il tuo bonifico è stato eseguito.', receiptFailedIntro: 'Il bonifico è fallito al {percent}%.', receiptCancelledIntro: 'Il bonifico è stato annullato.', disclaimerTitle: 'Clausola di riservatezza:', disclaimer: 'Le informazioni sono destinate esclusivamente al destinatario.', pendingTransferEmailSubject: 'Bonifico in attesa - YOUNITED', pendingTransferEmailTitle: 'Bonifico in attesa', pendingTransferEmailIntro: 'Il bonifico è in attesa di convalida.', pendingTransferEmailBody: 'Il servizio amministrativo lo verificherà.', pendingTransferEmailFooter: 'L\'importo è stato addebitato.', pendingValidatedSubject: 'Bonifico convalidato - YOUNITED', pendingValidatedTitle: 'Bonifico convalidato', pendingValidatedIntro: 'Il bonifico è stato convalidato.', pendingValidatedBody: 'La ricevuta PDF è allegata.', pendingCancelledSubject: 'Bonifico annullato - YOUNITED', pendingCancelledTitle: 'Bonifico annullato', pendingCancelledIntro: 'Il bonifico è stato annullato.', pendingCancelledBody: 'L\'importo è stato rimborsato.' },
  de: { logoText: 'YOUNITED', welcomeSubject: 'Ihre Zugangsdaten - YOUNITED', welcomeGreeting: 'Sehr geehrte(r)', welcomeIntro: 'Wir freuen uns, Ihnen die Eröffnung Ihres Kontos zu bestätigen.', welcomeThanks: 'Wir danken Ihnen für Ihr Vertrauen.', welcomeAccess: 'Hier Ihre Zugangsdaten:', welcomeIdentifier: 'Benutzername', welcomePin: 'PIN-Code', welcomeButton: 'Auf mein Konto zugreifen', welcomeSignature: 'Mit freundlichen Grüßen.', activationSubject: 'Aktivierungscode - YOUNITED', activationIntro: 'Der Aktivierungscode lautet:', receiptSubject: 'Überweisungsbestätigung - YOUNITED', receiptFailedSubject: 'Überweisung fehlgeschlagen - YOUNITED', receiptCancelSubject: 'Überweisung storniert - YOUNITED', receiptTitle: 'Überweisungsbestätigung', receiptFailedTitle: 'Überweisung fehlgeschlagen', receiptCancelTitle: 'Überweisung storniert', receiptAmount: 'Betrag', receiptBeneficiary: 'Begünstigter', receiptIban: 'IBAN', receiptBank: 'Bank', receiptSwift: 'SWIFT / BIC', receiptDate: 'Datum', receiptStatus: 'Status', receiptStatusDone: 'Abgeschlossen', receiptStatusFailed: 'Fehlgeschlagen bei {percent}%', receiptStatusCancelled: 'Storniert', receiptReason: 'Grund', receiptReference: 'Referenz', receiptSuccessIntro: 'Ihre Überweisung wurde ausgeführt.', receiptFailedIntro: 'Ihre Überweisung ist bei {percent}% fehlgeschlagen.', receiptCancelledIntro: 'Ihre Überweisung wurde storniert.', disclaimerTitle: 'Vertraulichkeitshinweis:', disclaimer: 'Die Informationen sind ausschließlich für den Empfänger bestimmt.', pendingTransferEmailSubject: 'Überweisung ausstehend - YOUNITED', pendingTransferEmailTitle: 'Ausstehende Überweisung', pendingTransferEmailIntro: 'Ihre Überweisung wartet auf Genehmigung.', pendingTransferEmailBody: 'Unsere Verwaltungsabteilung wird sie prüfen.', pendingTransferEmailFooter: 'Der Betrag wurde abgebucht.', pendingValidatedSubject: 'Überweisung genehmigt - YOUNITED', pendingValidatedTitle: 'Überweisung genehmigt', pendingValidatedIntro: 'Ihre Überweisung wurde genehmigt.', pendingValidatedBody: 'Ihre PDF-Quittung ist beigefügt.', pendingCancelledSubject: 'Überweisung storniert - YOUNITED', pendingCancelledTitle: 'Überweisung storniert', pendingCancelledIntro: 'Ihre Überweisung wurde storniert.', pendingCancelledBody: 'Der Betrag wurde zurückerstattet.' },
  // ═══════════════ ★ NOUVELLES LANGUES ═══════════════
  he: { logoText: 'YOUNITED', welcomeSubject: 'פרטי ההתחברות שלך - YOUNITED', welcomeGreeting: 'שלום', welcomeIntro: 'אנו שמחים לאשר את פתיחת החשבון שלך ב-YOUNITED.', welcomeThanks: 'אנו מודים לך על האמון.', welcomeAccess: 'הנה פרטי ההתחברות שלך:', welcomeIdentifier: 'מזהה', welcomePin: 'קוד PIN', welcomeButton: 'גש לחשבון שלי', welcomeSignature: 'בברכה.', activationSubject: 'קוד הפעלה להעברה - YOUNITED', activationIntro: 'קוד ההפעלה של ההעברה שלך הוא:', receiptSubject: 'אישור העברה - YOUNITED', receiptFailedSubject: 'העברה נכשלה - YOUNITED', receiptCancelSubject: 'העברה בוטלה - YOUNITED', receiptTitle: 'אישור העברה', receiptFailedTitle: 'העברה נכשלה', receiptCancelTitle: 'העברה בוטלה', receiptAmount: 'סכום', receiptBeneficiary: 'מוטב', receiptIban: 'IBAN / מספר חשבון', receiptBank: 'בנק', receiptSwift: 'קוד SWIFT / BIC', receiptDate: 'תאריך', receiptStatus: 'סטטוס', receiptStatusDone: 'בוצע', receiptStatusFailed: 'נכשל ב-{percent}%', receiptStatusCancelled: 'בוטל', receiptReason: 'סיבה', receiptReference: 'אסמכתא', receiptSuccessIntro: 'ההעברה שלך בוצעה בהצלחה.', receiptFailedIntro: 'ההעברה שלך לא הושלמה. היא נכשלה ב-{percent}% מהתהליך.', receiptCancelledIntro: 'ההעברה שלך בוטלה על ידי המנהל.', disclaimerTitle: 'הצהרת אי-אחריות:', disclaimer: 'המידע מיועד לנמען בלבד.', pendingTransferEmailSubject: 'העברה ממתינה לאישור - YOUNITED', pendingTransferEmailTitle: 'העברה ממתינה', pendingTransferEmailIntro: 'ההעברה שלך נרשמה וממתינה לאישור.', pendingTransferEmailBody: 'המחלקה האדמיניסטרטיבית תבדוק אותה.', pendingTransferEmailFooter: 'הסכום נגבה מחשבונך.', pendingValidatedSubject: 'ההעברה אושרה - YOUNITED', pendingValidatedTitle: 'העברה אושרה', pendingValidatedIntro: 'ההעברה שלך אושרה בהצלחה.', pendingValidatedBody: 'הקבלה הרשמית בפורמט PDF מצורפת.', pendingCancelledSubject: 'ההעברה בוטלה - YOUNITED', pendingCancelledTitle: 'העברה בוטלה', pendingCancelledIntro: 'ההעברה שלך בוטלה.', pendingCancelledBody: 'הסכום הוחזר לחשבונך.' },
  hr: { logoText: 'YOUNITED', welcomeSubject: 'Vaši podaci za prijavu - YOUNITED', welcomeGreeting: 'Poštovani(a)', welcomeIntro: 'Sa zadovoljstvom potvrđujemo otvaranje vašeg računa u YOUNITED.', welcomeThanks: 'Zahvaljujemo na povjerenju.', welcomeAccess: 'Ovo su vaši podaci za prijavu:', welcomeIdentifier: 'Identifikator', welcomePin: 'PIN kod', welcomeButton: 'Pristupi mom računu', welcomeSignature: 'Srdačan pozdrav.', activationSubject: 'Aktivacijski kod naloga za prijenos - YOUNITED', activationIntro: 'Aktivacijski kod vašeg naloga za prijenos je:', receiptSubject: 'Potvrda prijenosa - YOUNITED', receiptFailedSubject: 'Prijenos neuspješan - YOUNITED', receiptCancelSubject: 'Prijenos otkazan - YOUNITED', receiptTitle: 'Potvrda prijenosa', receiptFailedTitle: 'Prijenos neuspješan', receiptCancelTitle: 'Prijenos otkazan', receiptAmount: 'Iznos', receiptBeneficiary: 'Primatelj', receiptIban: 'IBAN / Broj računa', receiptBank: 'Banka', receiptSwift: 'SWIFT / BIC', receiptDate: 'Datum', receiptStatus: 'Status', receiptStatusDone: 'Izvršeno', receiptStatusFailed: 'Neuspješno na {percent}%', receiptStatusCancelled: 'Otkazano', receiptReason: 'Razlog', receiptReference: 'Referenca', receiptSuccessIntro: 'Vaš prijenos je uspješno izvršen.', receiptFailedIntro: 'Vaš prijenos nije dovršen. Neuspješan na {percent}%.', receiptCancelledIntro: 'Vaš prijenos je otkazan od strane administracije.', disclaimerTitle: 'Odricanje odgovornosti:', disclaimer: 'Informacije su namijenjene isključivo primatelju.', pendingTransferEmailSubject: 'Prijenos čeka odobrenje - YOUNITED', pendingTransferEmailTitle: 'Prijenos na čekanju', pendingTransferEmailIntro: 'Vaš prijenos je registriran i čeka odobrenje.', pendingTransferEmailBody: 'Naš administrativni odjel će ga provjeriti.', pendingTransferEmailFooter: 'Iznos je terećen s vašeg računa.', pendingValidatedSubject: 'Prijenos odobren - YOUNITED', pendingValidatedTitle: 'Prijenos odobren', pendingValidatedIntro: 'Vaš prijenos je uspješno odobren.', pendingValidatedBody: 'Vaša PDF potvrda je priložena.', pendingCancelledSubject: 'Prijenos otkazan - YOUNITED', pendingCancelledTitle: 'Prijenos otkazan', pendingCancelledIntro: 'Vaš prijenos je otkazan.', pendingCancelledBody: 'Iznos je automatski vraćen na vaš račun.' },
  ro: { logoText: 'YOUNITED', welcomeSubject: 'Datele dvs. de conectare - YOUNITED', welcomeGreeting: 'Stimate', welcomeIntro: 'Avem plăcerea de a confirma deschiderea contului dvs. la YOUNITED.', welcomeThanks: 'Vă mulțumim pentru încredere.', welcomeAccess: 'Iată datele dvs. de conectare:', welcomeIdentifier: 'Identificator', welcomePin: 'Cod PIN', welcomeButton: 'Accesați contul meu', welcomeSignature: 'Cu stimă.', activationSubject: 'Cod de activare - YOUNITED', activationIntro: 'Codul de activare este:', receiptSubject: 'Confirmare transfer - YOUNITED', receiptFailedSubject: 'Transfer eșuat - YOUNITED', receiptCancelSubject: 'Transfer anulat - YOUNITED', receiptTitle: 'Confirmare transfer', receiptFailedTitle: 'Transfer eșuat', receiptCancelTitle: 'Transfer anulat', receiptAmount: 'Sumă', receiptBeneficiary: 'Beneficiar', receiptIban: 'IBAN / Număr cont', receiptBank: 'Bancă', receiptSwift: 'SWIFT / BIC', receiptDate: 'Data', receiptStatus: 'Status', receiptStatusDone: 'Efectuat', receiptStatusFailed: 'Eșuat la {percent}%', receiptStatusCancelled: 'Anulat', receiptReason: 'Motiv', receiptReference: 'Referință', receiptSuccessIntro: 'Transferul dvs. a fost efectuat cu succes.', receiptFailedIntro: 'Transferul dvs. a eșuat la {percent}%.', receiptCancelledIntro: 'Transferul dvs. a fost anulat de administrație.', disclaimerTitle: 'Clauză de exonerare:', disclaimer: 'Informațiile sunt destinate exclusiv destinatarului.', pendingTransferEmailSubject: 'Transfer în așteptare - YOUNITED', pendingTransferEmailTitle: 'Transfer în așteptare', pendingTransferEmailIntro: 'Transferul este în așteptarea validării.', pendingTransferEmailBody: 'Serviciul administrativ îl va verifica.', pendingTransferEmailFooter: 'Suma a fost debitată.', pendingValidatedSubject: 'Transfer validat - YOUNITED', pendingValidatedTitle: 'Transfer validat', pendingValidatedIntro: 'Transferul a fost validat cu succes.', pendingValidatedBody: 'Chitanța PDF este atașată.', pendingCancelledSubject: 'Transfer anulat - YOUNITED', pendingCancelledTitle: 'Transfer anulat', pendingCancelledIntro: 'Transferul a fost anulat.', pendingCancelledBody: 'Suma a fost restituită.' },
  nl: { logoText: 'YOUNITED', welcomeSubject: 'Uw inloggegevens - YOUNITED', welcomeGreeting: 'Beste', welcomeIntro: 'We bevestigen met genoegen de opening van uw account bij YOUNITED.', welcomeThanks: 'Bedankt voor uw vertrouwen.', welcomeAccess: 'Dit zijn uw inloggegevens:', welcomeIdentifier: 'Identificatie', welcomePin: 'Pincode', welcomeButton: 'Toegang tot mijn account', welcomeSignature: 'Met vriendelijke groeten.', activationSubject: 'Activatiecode - YOUNITED', activationIntro: 'De activatiecode is:', receiptSubject: 'Bevestiging overschrijving - YOUNITED', receiptFailedSubject: 'Overschrijving mislukt - YOUNITED', receiptCancelSubject: 'Overschrijving geannuleerd - YOUNITED', receiptTitle: 'Bevestiging overschrijving', receiptFailedTitle: 'Overschrijving mislukt', receiptCancelTitle: 'Overschrijving geannuleerd', receiptAmount: 'Bedrag', receiptBeneficiary: 'Begunstigde', receiptIban: 'IBAN', receiptBank: 'Bank', receiptSwift: 'SWIFT / BIC', receiptDate: 'Datum', receiptStatus: 'Status', receiptStatusDone: 'Uitgevoerd', receiptStatusFailed: 'Mislukt bij {percent}%', receiptStatusCancelled: 'Geannuleerd', receiptReason: 'Reden', receiptReference: 'Referentie', receiptSuccessIntro: 'Uw overschrijving is uitgevoerd.', receiptFailedIntro: 'Uw overschrijving is mislukt bij {percent}%.', receiptCancelledIntro: 'Uw overschrijving is geannuleerd.', disclaimerTitle: 'Disclaimer:', disclaimer: 'De informatie is uitsluitend voor de ontvanger.', pendingTransferEmailSubject: 'Overschrijving in afwachting - YOUNITED', pendingTransferEmailTitle: 'In afwachting', pendingTransferEmailIntro: 'Uw overschrijving wacht op validatie.', pendingTransferEmailBody: 'Onze administratie zal deze verifiëren.', pendingTransferEmailFooter: 'Het bedrag is afgeschreven.', pendingValidatedSubject: 'Overschrijving gevalideerd - YOUNITED', pendingValidatedTitle: 'Gevalideerd', pendingValidatedIntro: 'Uw overschrijving is gevalideerd.', pendingValidatedBody: 'Uw PDF-bon is bijgevoegd.', pendingCancelledSubject: 'Overschrijving geannuleerd - YOUNITED', pendingCancelledTitle: 'Geannuleerd', pendingCancelledIntro: 'Uw overschrijving is geannuleerd.', pendingCancelledBody: 'Het bedrag is terugbetaald.' },
  pt: { logoText: 'YOUNITED', welcomeSubject: 'As suas credenciais - YOUNITED', welcomeGreeting: 'Caro(a)', welcomeIntro: 'Temos o prazer de confirmar a abertura da sua conta na YOUNITED.', welcomeThanks: 'Agradecemos a sua confiança.', welcomeAccess: 'Aqui estão as suas credenciais:', welcomeIdentifier: 'Identificador', welcomePin: 'Código PIN', welcomeButton: 'Aceder à minha conta', welcomeSignature: 'Com os melhores cumprimentos.', activationSubject: 'Código de ativação - YOUNITED', activationIntro: 'O código de ativação é:', receiptSubject: 'Confirmação de transferência - YOUNITED', receiptFailedSubject: 'Transferência falhada - YOUNITED', receiptCancelSubject: 'Transferência cancelada - YOUNITED', receiptTitle: 'Confirmação de transferência', receiptFailedTitle: 'Transferência falhada', receiptCancelTitle: 'Transferência cancelada', receiptAmount: 'Montante', receiptBeneficiary: 'Beneficiário', receiptIban: 'IBAN', receiptBank: 'Banco', receiptSwift: 'SWIFT / BIC', receiptDate: 'Data', receiptStatus: 'Estado', receiptStatusDone: 'Concluído', receiptStatusFailed: 'Falhou em {percent}%', receiptStatusCancelled: 'Cancelado', receiptReason: 'Motivo', receiptReference: 'Referência', receiptSuccessIntro: 'A sua transferência foi concluída.', receiptFailedIntro: 'A sua transferência falhou em {percent}%.', receiptCancelledIntro: 'A sua transferência foi cancelada.', disclaimerTitle: 'Aviso legal:', disclaimer: 'As informações destinam-se exclusivamente ao destinatário.', pendingTransferEmailSubject: 'Transferência pendente - YOUNITED', pendingTransferEmailTitle: 'Transferência pendente', pendingTransferEmailIntro: 'A sua transferência aguarda validação.', pendingTransferEmailBody: 'O nosso serviço administrativo irá verificá-la.', pendingTransferEmailFooter: 'O montante foi debitado.', pendingValidatedSubject: 'Transferência validada - YOUNITED', pendingValidatedTitle: 'Validada', pendingValidatedIntro: 'A sua transferência foi validada.', pendingValidatedBody: 'O seu recibo PDF está em anexo.', pendingCancelledSubject: 'Transferência cancelada - YOUNITED', pendingCancelledTitle: 'Cancelada', pendingCancelledIntro: 'A sua transferência foi cancelada.', pendingCancelledBody: 'O montante foi reembolsado.' },
  el: { logoText: 'YOUNITED', welcomeSubject: 'Τα διαπιστευτήριά σας - YOUNITED', welcomeGreeting: 'Αγαπητέ/ή', welcomeIntro: 'Είμαστε στην ευχάριστη θέση να επιβεβαιώσουμε το άνοιγμα του λογαριασμού σας στη YOUNITED.', welcomeThanks: 'Σας ευχαριστούμε για την εμπιστοσύνη σας.', welcomeAccess: 'Ορίστε τα διαπιστευτήριά σας:', welcomeIdentifier: 'Αναγνωριστικό', welcomePin: 'Κωδικός PIN', welcomeButton: 'Πρόσβαση στον λογαριασμό μου', welcomeSignature: 'Με εκτίμηση.', activationSubject: 'Κωδικός ενεργοποίησης - YOUNITED', activationIntro: 'Ο κωδικός ενεργοποίησης είναι:', receiptSubject: 'Επιβεβαίωση μεταφοράς - YOUNITED', receiptFailedSubject: 'Αποτυχία μεταφοράς - YOUNITED', receiptCancelSubject: 'Ακύρωση μεταφοράς - YOUNITED', receiptTitle: 'Επιβεβαίωση μεταφοράς', receiptFailedTitle: 'Αποτυχία μεταφοράς', receiptCancelTitle: 'Ακύρωση μεταφοράς', receiptAmount: 'Ποσό', receiptBeneficiary: 'Δικαιούχος', receiptIban: 'IBAN', receiptBank: 'Τράπεζα', receiptSwift: 'SWIFT / BIC', receiptDate: 'Ημερομηνία', receiptStatus: 'Κατάσταση', receiptStatusDone: 'Ολοκληρώθηκε', receiptStatusFailed: 'Απέτυχε στο {percent}%', receiptStatusCancelled: 'Ακυρώθηκε', receiptReason: 'Αιτία', receiptReference: 'Αναφορά', receiptSuccessIntro: 'Η μεταφορά σας ολοκληρώθηκε με επιτυχία.', receiptFailedIntro: 'Η μεταφορά σας απέτυχε στο {percent}%.', receiptCancelledIntro: 'Η μεταφορά σας ακυρώθηκε.', disclaimerTitle: 'Αποποίηση ευθύνης:', disclaimer: 'Οι πληροφορίες προορίζονται αποκλειστικά για τον παραλήπτη.', pendingTransferEmailSubject: 'Μεταφορά σε εκκρεμότητα - YOUNITED', pendingTransferEmailTitle: 'Σε εκκρεμότητα', pendingTransferEmailIntro: 'Η μεταφορά σας εκκρεμεί για επικύρωση.', pendingTransferEmailBody: 'Η διοικητική υπηρεσία θα την ελέγξει.', pendingTransferEmailFooter: 'Το ποσό χρεώθηκε.', pendingValidatedSubject: 'Επικυρωμένη μεταφορά - YOUNITED', pendingValidatedTitle: 'Επικυρώθηκε', pendingValidatedIntro: 'Η μεταφορά σας επικυρώθηκε.', pendingValidatedBody: 'Η απόδειξη PDF επισυνάπτεται.', pendingCancelledSubject: 'Ακυρωμένη μεταφορά - YOUNITED', pendingCancelledTitle: 'Ακυρώθηκε', pendingCancelledIntro: 'Η μεταφορά σας ακυρώθηκε.', pendingCancelledBody: 'Το ποσό επιστράφηκε.' },
  cs: { logoText: 'YOUNITED', welcomeSubject: 'Vaše přihlašovací údaje - YOUNITED', welcomeGreeting: 'Vážený(á)', welcomeIntro: 'S potěšením potvrzujeme otevření vašeho účtu u YOUNITED.', welcomeThanks: 'Děkujeme za vaši důvěru.', welcomeAccess: 'Zde jsou vaše přihlašovací údaje:', welcomeIdentifier: 'Identifikátor', welcomePin: 'PIN kód', welcomeButton: 'Přihlásit se k účtu', welcomeSignature: 'S pozdravem.', activationSubject: 'Aktivační kód - YOUNITED', activationIntro: 'Aktivační kód je:', receiptSubject: 'Potvrzení převodu - YOUNITED', receiptFailedSubject: 'Převod selhal - YOUNITED', receiptCancelSubject: 'Převod zrušen - YOUNITED', receiptTitle: 'Potvrzení převodu', receiptFailedTitle: 'Převod selhal', receiptCancelTitle: 'Převod zrušen', receiptAmount: 'Částka', receiptBeneficiary: 'Příjemce', receiptIban: 'IBAN', receiptBank: 'Banka', receiptSwift: 'SWIFT / BIC', receiptDate: 'Datum', receiptStatus: 'Stav', receiptStatusDone: 'Provedeno', receiptStatusFailed: 'Selhalo na {percent}%', receiptStatusCancelled: 'Zrušeno', receiptReason: 'Důvod', receiptReference: 'Reference', receiptSuccessIntro: 'Váš převod byl úspěšně proveden.', receiptFailedIntro: 'Váš převod selhal na {percent}%.', receiptCancelledIntro: 'Váš převod byl zrušen.', disclaimerTitle: 'Prohlášení:', disclaimer: 'Informace jsou určeny výhradně příjemci.', pendingTransferEmailSubject: 'Převod čeká na schválení - YOUNITED', pendingTransferEmailTitle: 'Čeká na schválení', pendingTransferEmailIntro: 'Váš převod čeká na validaci.', pendingTransferEmailBody: 'Naše administrativní oddělení jej zkontroluje.', pendingTransferEmailFooter: 'Částka byla odečtena.', pendingValidatedSubject: 'Převod schválen - YOUNITED', pendingValidatedTitle: 'Schváleno', pendingValidatedIntro: 'Váš převod byl schválen.', pendingValidatedBody: 'Vaše PDF potvrzení je přiloženo.', pendingCancelledSubject: 'Převod zrušen - YOUNITED', pendingCancelledTitle: 'Zrušeno', pendingCancelledIntro: 'Váš převod byl zrušen.', pendingCancelledBody: 'Částka byla vrácena.' },
  hu: { logoText: 'YOUNITED', welcomeSubject: 'Bejelentkezési adatai - YOUNITED', welcomeGreeting: 'Kedves', welcomeIntro: 'Örömmel értesítjük, hogy YOUNITED fiókja megnyílt.', welcomeThanks: 'Köszönjük bizalmát.', welcomeAccess: 'Íme a bejelentkezési adatai:', welcomeIdentifier: 'Azonosító', welcomePin: 'PIN kód', welcomeButton: 'Fiókom megnyitása', welcomeSignature: 'Üdvözlettel.', activationSubject: 'Aktiválási kód - YOUNITED', activationIntro: 'Az aktiválási kód:', receiptSubject: 'Átutalás visszaigazolása - YOUNITED', receiptFailedSubject: 'Sikertelen átutalás - YOUNITED', receiptCancelSubject: 'Törölt átutalás - YOUNITED', receiptTitle: 'Átutalás visszaigazolása', receiptFailedTitle: 'Sikertelen átutalás', receiptCancelTitle: 'Törölt átutalás', receiptAmount: 'Összeg', receiptBeneficiary: 'Kedvezményezett', receiptIban: 'IBAN', receiptBank: 'Bank', receiptSwift: 'SWIFT / BIC', receiptDate: 'Dátum', receiptStatus: 'Állapot', receiptStatusDone: 'Teljesítve', receiptStatusFailed: 'Sikertelen {percent}%-nál', receiptStatusCancelled: 'Törölve', receiptReason: 'Ok', receiptReference: 'Hivatkozás', receiptSuccessIntro: 'Átutalása sikeresen megtörtént.', receiptFailedIntro: 'Átutalása {percent}%-nál sikertelen volt.', receiptCancelledIntro: 'Átutalását törölték.', disclaimerTitle: 'Felelősségkizárás:', disclaimer: 'Az információk kizárólag a címzettnek szólnak.', pendingTransferEmailSubject: 'Függőben lévő átutalás - YOUNITED', pendingTransferEmailTitle: 'Függőben', pendingTransferEmailIntro: 'Átutalása jóváhagyásra vár.', pendingTransferEmailBody: 'Adminisztrációs osztályunk ellenőrzi.', pendingTransferEmailFooter: 'Az összeget levontuk.', pendingValidatedSubject: 'Jóváhagyott átutalás - YOUNITED', pendingValidatedTitle: 'Jóváhagyva', pendingValidatedIntro: 'Átutalását jóváhagyták.', pendingValidatedBody: 'PDF nyugtája csatolva.', pendingCancelledSubject: 'Törölt átutalás - YOUNITED', pendingCancelledTitle: 'Törölve', pendingCancelledIntro: 'Átutalását törölték.', pendingCancelledBody: 'Az összeget visszatérítettük.' },
  sv: { logoText: 'YOUNITED', welcomeSubject: 'Dina inloggningsuppgifter - YOUNITED', welcomeGreeting: 'Kära', welcomeIntro: 'Vi är glada att bekräfta öppnandet av ditt konto hos YOUNITED.', welcomeThanks: 'Tack för ditt förtroende.', welcomeAccess: 'Här är dina inloggningsuppgifter:', welcomeIdentifier: 'Identifierare', welcomePin: 'PIN-kod', welcomeButton: 'Öppna mitt konto', welcomeSignature: 'Med vänliga hälsningar.', activationSubject: 'Aktiveringskod - YOUNITED', activationIntro: 'Aktiveringskoden är:', receiptSubject: 'Bekräftelse av överföring - YOUNITED', receiptFailedSubject: 'Överföring misslyckades - YOUNITED', receiptCancelSubject: 'Överföring avbruten - YOUNITED', receiptTitle: 'Bekräftelse av överföring', receiptFailedTitle: 'Överföring misslyckades', receiptCancelTitle: 'Överföring avbruten', receiptAmount: 'Belopp', receiptBeneficiary: 'Mottagare', receiptIban: 'IBAN', receiptBank: 'Bank', receiptSwift: 'SWIFT / BIC', receiptDate: 'Datum', receiptStatus: 'Status', receiptStatusDone: 'Genomförd', receiptStatusFailed: 'Misslyckades vid {percent}%', receiptStatusCancelled: 'Avbruten', receiptReason: 'Orsak', receiptReference: 'Referens', receiptSuccessIntro: 'Din överföring genomfördes.', receiptFailedIntro: 'Din överföring misslyckades vid {percent}%.', receiptCancelledIntro: 'Din överföring avbröts.', disclaimerTitle: 'Ansvarsfriskrivning:', disclaimer: 'Informationen är endast avsedd för mottagaren.', pendingTransferEmailSubject: 'Överföring väntar - YOUNITED', pendingTransferEmailTitle: 'Väntar', pendingTransferEmailIntro: 'Din överföring väntar på validering.', pendingTransferEmailBody: 'Vår administrativa avdelning kommer att verifiera den.', pendingTransferEmailFooter: 'Beloppet har dragits.', pendingValidatedSubject: 'Överföring validerad - YOUNITED', pendingValidatedTitle: 'Validerad', pendingValidatedIntro: 'Din överföring har validerats.', pendingValidatedBody: 'Ditt PDF-kvitto bifogas.', pendingCancelledSubject: 'Överföring avbruten - YOUNITED', pendingCancelledTitle: 'Avbruten', pendingCancelledIntro: 'Din överföring avbröts.', pendingCancelledBody: 'Beloppet har återbetalats.' },
  ar: { logoText: 'YOUNITED', welcomeSubject: 'بيانات تسجيل الدخول الخاصة بك - YOUNITED', welcomeGreeting: 'عزيزي(ة)', welcomeIntro: 'يسعدنا تأكيد فتح حسابك في YOUNITED.', welcomeThanks: 'نشكرك على ثقتك.', welcomeAccess: 'إليك بيانات تسجيل الدخول:', welcomeIdentifier: 'المُعرِّف', welcomePin: 'رمز PIN', welcomeButton: 'الوصول إلى حسابي', welcomeSignature: 'مع أطيب التحيات.', activationSubject: 'رمز التفعيل - YOUNITED', activationIntro: 'رمز التفعيل هو:', receiptSubject: 'تأكيد التحويل - YOUNITED', receiptFailedSubject: 'فشل التحويل - YOUNITED', receiptCancelSubject: 'تم إلغاء التحويل - YOUNITED', receiptTitle: 'تأكيد التحويل', receiptFailedTitle: 'فشل التحويل', receiptCancelTitle: 'تم إلغاء التحويل', receiptAmount: 'المبلغ', receiptBeneficiary: 'المستفيد', receiptIban: 'IBAN', receiptBank: 'البنك', receiptSwift: 'SWIFT / BIC', receiptDate: 'التاريخ', receiptStatus: 'الحالة', receiptStatusDone: 'تم التنفيذ', receiptStatusFailed: 'فشل عند {percent}%', receiptStatusCancelled: 'ملغى', receiptReason: 'السبب', receiptReference: 'المرجع', receiptSuccessIntro: 'تم تحويلك بنجاح.', receiptFailedIntro: 'فشل التحويل عند {percent}%.', receiptCancelledIntro: 'تم إلغاء تحويلك من قبل الإدارة.', disclaimerTitle: 'إخلاء المسؤولية:', disclaimer: 'المعلومات موجهة للمستلم فقط.', pendingTransferEmailSubject: 'تحويل في انتظار الموافقة - YOUNITED', pendingTransferEmailTitle: 'قيد الانتظار', pendingTransferEmailIntro: 'تحويلك في انتظار التحقق.', pendingTransferEmailBody: 'سيقوم قسم الإدارة بالتحقق منه.', pendingTransferEmailFooter: 'تم خصم المبلغ.', pendingValidatedSubject: 'تمت الموافقة على التحويل - YOUNITED', pendingValidatedTitle: 'تمت الموافقة', pendingValidatedIntro: 'تمت الموافقة على تحويلك بنجاح.', pendingValidatedBody: 'الإيصال بصيغة PDF مرفق.', pendingCancelledSubject: 'تم إلغاء التحويل - YOUNITED', pendingCancelledTitle: 'ملغى', pendingCancelledIntro: 'تم إلغاء تحويلك.', pendingCancelledBody: 'تم استرداد المبلغ.' }
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
            '<tr><td style="background:#0a2540;background-image:linear-gradient(135deg,#0a2540 0%,#0f2f5c 55%,#1e40af 100%);padding:22px 24px;text-align:center;width:100%;">' +
              '<div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:4px;font-style:italic;line-height:1.1;">YOUNITED</div>' +
              '<div style="font-size:9px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:2.5px;margin-top:5px;text-transform:uppercase;">Service financier sécurisé</div>' +
            '</td></tr>' +
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
  var isCancelled = status === 'cancelled';
  var color = isCancelled ? '#8b5cf6' : '#dc2626';
  var colorLight = isCancelled ? '#ede9fe' : '#fee2e2';
  var icon = isCancelled ? '✕' : (isFailed ? '✕' : '↗');
  var title = isCancelled ? T.receiptCancelTitle : (isFailed ? T.receiptFailedTitle : T.receiptTitle);
  var subtitle = isCancelled ? T.receiptCancelledIntro : (isFailed ? T.receiptFailedIntro.replace('{percent}', percent || 0) : T.receiptSuccessIntro);
  var statusLabel = isCancelled ? T.receiptStatusCancelled : (isFailed ? T.receiptStatusFailed.replace('{percent}', percent || 0) : T.receiptStatusDone);
  var infoTitle = isCancelled ? T.receiptCancelTitle : (isFailed ? 'Information' : T.receiptTitle);
  var infoText = isCancelled ? T.receiptCancelledIntro : (isFailed ? T.receiptFailedIntro.replace('{percent}', percent || 0) : T.receiptSuccessIntro);
  return buildTransferEmailShell({ lang: lang, color: color, colorLight: colorLight, icon: icon, title: title, subtitle: subtitle, amountLabel: T.receiptAmount, amount: tx.amount || '-', detailsTitle: T.transferDetailsTitle || 'Détails du virement', rows: [ [T.receiptReference, ref, true], [T.receiptDate, tx.date || '-', false], [T.receiptBeneficiary, tx.subtitle || '-', false], [T.receiptIban, formatIban(tx.recipientIban || ''), true], [T.receiptBank, tx.recipientBank || '-', false], [T.receiptStatus, statusLabel, false] ], infoTitle: infoTitle, infoText: infoText });
}

function buildPendingTransferEmail(client, tx, lang) {
  var T = emailTexts[lang] || emailTexts.fr;
  var ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  return buildTransferEmailShell({ lang: lang, color: '#f59e0b', colorLight: '#fef3c7', icon: '⏱', title: T.pendingTransferEmailTitle, subtitle: T.pendingTransferEmailIntro, amountLabel: T.receiptAmount, amount: tx.amount || '-', detailsTitle: T.transferDetailsTitle || 'Détails du virement', rows: [ [T.receiptReference, ref, true], [T.receiptDate, tx.date || '-', false], [T.receiptBeneficiary, tx.subtitle || '-', false], [T.receiptIban, formatIban(tx.recipientIban || ''), true], [T.receiptBank, tx.recipientBank || '-', false], [T.receiptStatus, T.pendingTransferEmailTitle, false] ], infoTitle: 'Information', infoText: T.pendingTransferEmailBody });
}

function buildPendingValidatedEmail(client, tx, lang) {
  var T = emailTexts[lang] || emailTexts.fr;
  var ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  return buildTransferEmailShell({ lang: lang, color: '#dc2626', colorLight: '#fee2e2', icon: '✓', title: T.pendingValidatedTitle, subtitle: T.pendingValidatedIntro, amountLabel: T.receiptAmount, amount: tx.amount || '-', detailsTitle: T.transferDetailsTitle || 'Détails du virement', rows: [ [T.receiptReference, ref, true], [T.receiptDate, tx.date || '-', false], [T.receiptBeneficiary, tx.subtitle || '-', false], [T.receiptIban, formatIban(tx.recipientIban || ''), true], [T.receiptBank, tx.recipientBank || '-', false], [T.receiptStatus, T.receiptStatusDone, false] ], infoTitle: 'Confirmation', infoText: T.pendingValidatedBody });
}

function buildPendingCancelledEmail(client, tx, lang) {
  var T = emailTexts[lang] || emailTexts.fr;
  var ref = 'TW-' + (tx.date || '').replace(/[^0-9]/g, '').slice(-10);
  var amountLabel = T.receiptAmount;
  return buildTransferEmailShell({ lang: lang, color: '#2563eb', colorLight: '#dbeafe', icon: '↺', title: T.pendingCancelledTitle, subtitle: T.pendingCancelledIntro, amountLabel: amountLabel, amount: tx.amount || '-', detailsTitle: T.transferDetailsTitle || 'Détails du virement', rows: [ [T.receiptReference, ref, true], [T.receiptDate, tx.date || '-', false], [T.receiptBeneficiary, tx.subtitle || '-', false], [T.receiptIban, formatIban(tx.recipientIban || ''), true], [T.receiptBank, tx.recipientBank || '-', false], [T.receiptStatus, T.txRefund || 'Remboursement', false] ], infoTitle: 'Information', infoText: T.pendingCancelledBody });
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
    doc.text('Ce recu est emis par YOUNITED.', W / 2, 285, { align: 'center' });
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
  async updateClient(id, data) { try { await setDoc(doc(db, 'clients', id), { ...data, updatedAt: serverTimestamp() }, { merge: true }); return true; } catch (e) { console.error('[FireDB.updateClient] Erreur pour', id, ':', e); return false; } },
  async deleteClient(id) { try { await deleteDoc(doc(db, 'clients', id)); return true; } catch (e) { return false; } }
};

const ClientSession = { getActive: () => localStorage.getItem('tw_active_client'), setActive: (id) => localStorage.setItem('tw_active_client', id), clear: () => localStorage.removeItem('tw_active_client') };

const CURRENCY_NAMES = { '€': 'EURO', '$': 'USD', '£': 'GBP', 'zł': 'PLN', '₪': 'ILS', 'lei': 'RON', 'kn': 'HRK', 'Kč': 'CZK', 'Ft': 'HUF', 'kr': 'SEK' };
const CURRENCY_CODES = { '€': 'EUR', '$': 'USD', '£': 'GBP', 'zł': 'PLN', '₪': 'ILS', 'lei': 'RON', 'kn': 'HRK', 'Kč': 'CZK', 'Ft': 'HUF', 'kr': 'SEK' };
function getCurrencyName(symbol) { return CURRENCY_NAMES[symbol] || 'EURO'; }
function getCurrencyCode(symbol) { return CURRENCY_CODES[symbol] || symbol; }

function generateIban(country) { const prefixMap = { 'France': 'FR', 'Pologne': 'PL', 'Espagne': 'ES', 'Italie': 'IT', 'Allemagne': 'DE', 'Croatie': 'HR', 'Israël': 'IL', 'Roumanie': 'RO', 'Pays-Bas': 'NL', 'Portugal': 'PT', 'Grèce': 'GR', 'Tchéquie': 'CZ', 'Hongrie': 'HU', 'Suède': 'SE' }; const prefix = prefixMap[country] || 'FR'; const len = { FR: 25, PL: 24, ES: 22, IT: 25, DE: 20, HR: 21, IL: 23, RO: 24, NL: 18, PT: 25, GR: 27, CZ: 24, HU: 28, SE: 24 }[prefix] || 22; let body = ''; for (let i = 0; i < len; i++) body += Math.floor(Math.random() * 10); return prefix + body; }
function generateBic(country) { const cc = { 'France': 'FR', 'Pologne': 'PL', 'Espagne': 'ES', 'Italie': 'IT', 'Allemagne': 'DE', 'Croatie': 'HR', 'Israël': 'IL', 'Roumanie': 'RO', 'Pays-Bas': 'NL', 'Portugal': 'PT', 'Grèce': 'GR', 'Tchéquie': 'CZ', 'Hongrie': 'HU', 'Suède': 'SE' }[country] || 'FR'; const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let b = ''; for (let i = 0; i < 4; i++) b += L.charAt(Math.floor(Math.random() * L.length)); let l = ''; for (let i = 0; i < 2; i++) l += A.charAt(Math.floor(Math.random() * A.length)); return b + cc + l; }
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

// ★ NOUVEAU : application du sens de lecture (RTL pour hébreu et arabe)
const RTL_LANGS = ['he', 'ar'];
function applyDirection(lang) {
  try {
    document.documentElement.setAttribute('lang', lang || 'fr');
    if (RTL_LANGS.indexOf(lang) !== -1) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.setAttribute('dir', 'rtl');
      document.body.style.direction = 'rtl';
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.setAttribute('dir', 'ltr');
      document.body.style.direction = 'ltr';
    }
  } catch (e) {}
}

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
  pl: { loginTitle: "Zaloguj się na swoje konto", emailPh: "Twój adres e-mail", pinPh: "Twój kod dostępu", loginBtn: "Zaloguj się", loginErr: "Nieprawidłowy e-mail lub PIN.", greeting: "Witaj", accountActive: "Konto aktywne", personalLabel: "Osobiste", availableBalance: "Dostępne saldo", detailsBtn: "Szczegóły", quickIbanLabel: "Zobacz mój IBAN", quickIbanSub: "Udostępnij moje dane", quickCardLabel: "Karta wirtualna", quickCardSub: "Zarządzaj kartą", quickTransferLabel: "Wykonaj przelew", quickTransferSub: "Wyślij pieniądze", seeAllBtn: "Zobacz wszystko", securityTitle: "Twoje bezpieczeństwo, nasze zobowiązanie", securityDesc: "Transakcje chronione, 24/7.", learnMoreBtn: "Dowiedz się więcej", navPaymentsNew: "Płatności", notifTitleSuccess: "Sukces", notifTitleError: "Błąd", notifTitleWarning: "Uwaga", notifTitleInfo: "Informacja", notifSubSuccess: "Operacja zakończona pomyślnie", notifSubError: "Wystąpił błąd", notifSubWarning: "Wymagana weryfikacja", notifSubInfo: "Powiadomienie", notifOkBtn: "OK", notifConfirmTitle: "Potwierdzenie", notifActionRequired: "Wymagane działanie", notifCancelBtn: "Anuluj", notifConfirmBtn: "Potwierdź", msgInvalidLink: "Nieprawidłowy link.", msgAccountSuspended: "Konto zawieszone.", msgFillAllFields: "Proszę wypełnić wszystkie pola.", msgEnterCode: "Proszę wprowadzić kod.", msgCodeIncorrect: "Nieprawidłowy kod.", msgClientNotInit: "Klient nie zainicjowany.", msgAccountDeleted: "Konto usunięte.", transferSentTitle: "Przelew wysłany", transferSentMsg: "Przelew <b>{amount}</b> wysłany do <b>{name}</b>.<br>Konto: <b>{iban}</b>", transferFailedTitle: "Przelew nieudany", transferFailedMsg: "Przelew <b>{amount}</b> do <b>{name}</b> nie powiódł się na <b>{percent}%</b>.<br>Konto: <b>{iban}</b>", transferCancelledTitle: "Przelew anulowany", transferCancelledMsg: "Przelew <b>{amount}</b> do <b>{name}</b> został anulowany.<br>Konto: <b>{iban}</b>", adminTransfersTitle: "Zrealizowane przelewy", transferDetailsTitle: "Szczegóły przelewu", txTransferCancelled: "Przelew anulowany", txInitialDeposit: "Wpłata początkowa", txRefund: "Zwrot", copyBtn: "Kopiuj", copied: "Skopiowano!", transactionHistory: "Historia transakcji", noTransactions: "Brak historii.", sendOutgoingTransfer: "Wyślij przelew wychodzący", transferDetails: "Szczegóły przelewu", amountToDebit: "Kwota do obciążenia", labelIban: "IBAN / Numer konta", labelSwift: "Kod banku (BIC/SWIFT)", labelBank: "Nazwa banku", labelBeneficiary: "Nazwa beneficjenta", labelReason: "Powód przeniesienia", processingWarning: "Realizacja w ciągu 1 à 3 minut po weryfikacji końcowej.", nextBtn: "Następny", transferAmountLabel: "Kwota przelewu:", ibanLabel: "IBAN/numer", ibanLabelLine2: "konta:", swiftLabel: "Kod banku:", bankLabel: "Bank odbiorczy:", beneficiaryLabel: "Nazwa beneficjenta:", reasonLabel: "Powód:", cancelTransferBtn: "Anuluj przelew", lockText: "Wprowadź kod aktywacyjny przelewu", codeLabel: "Kod aktywacyjny", validateTransferBtn: "Zatwierdź przelew", processingPageTitle: "Twoje zlecenie przelewu w toku...", processingStatus: "Weryfikacja tożsamości zakończona pomyślnie.", processingDescLong: "Poczekaj na zakończenie przelewu środków.", processingDetailsTitle: "Szczegóły przelewu w toku", processingAmountLabel: "Kwota przelewu :", processingBeneficiaryLabel: "Nazwa beneficjenta :", processingIbanLabel: "IBAN :", processingBankLabel: "Nazwa banku :", receiptTitle: "Potwierdzenie transakcji", receiptSent: "Przelew wysłany", receiptReceived: "Przelew otrzymany", receiptAmount: "Kwota", receiptTo: "Odbiorca", receiptFrom: "Nadawca", receiptDate: "Data", receiptStatus: "Status", receiptStatusDone: "Zrealizowany", receiptRef: "Referencja", receiptClose: "Zamknij", profileEditBtn: "Edytuj", profileVerified: "Profil zweryfikowany", profilePersonalData: "Dane osobowe", profilePersonalDataSub: "Twoje dane osobowe", profileAccountSub: "Szczegóły konta", profileSecurityDesc: "Twoje dane są chronione.", pendingTitle: "Szczegóły oczekującego przelewu", pendingResultTitle: "Przelew oczekujący na zatwierdzenie", pendingResultMsg: "Twój przelew oczekuje na weryfikację.", pendingNotifTitle: "Przelew oczekujący", pendingNotifMsg: "Twój przelew <b>{amount}</b> jest w trakcie weryfikacji.", adminPendingCardTitle: "Przelew oczekujący", adminPendingCardSubtitle: "Aktywuj tryb oczekującego przelewu.", adminPendingOn: "Włączony", adminPendingOff: "Wyłączony", adminPendingEnableBtn: "Włącz oczekujący przelew", adminPendingDisableBtn: "Wyłącz oczekujący przelew", adminPendingSectionTitle: "Przelewy oczekujące", adminPendingEmpty: "Brak oczekujących przelewów", adminPendingValidateBtn: "Zatwierdź", adminPendingCancelBtn: "Anuluj", adminValidateConfirmTitle: "Zatwierdzić przelew?", adminValidateConfirmMsg: "Czy na pewno chcesz zatwierdzić ten przelew?", adminCancelPendingConfirmTitle: "Anulować przelew?", adminCancelPendingConfirmMsg: "Czy na pewno chcesz anulować ten przelew?", pendingValidatedNotifTitle: "Przelew zatwierdzony", pendingValidatedNotifMsg: "Przelew <b>{amount}</b> został zatwierdzony.", pendingCancelledNotifTitle: "Przelew anulowany", pendingCancelledNotifMsg: "Przelew <b>{amount}</b> został anulowany.", loginFooterProtected: "Twoje dane są chronione", loginFooterSecure: "Połączenie bezpieczne", loginFooterSupport: "Wsparcie dla Ciebie", invalidAmountFormat: "Wpisz kwotę w prawidłowym formacie. Przykład: 3000", amountExceedsBalance: "Kwota przekracza saldo.", modalSuccess: "Przeniesienie {amount} wysłane", modalFailedAt: "Przelew {amount} nieudany na {percent}%", sendTime: "Czas:", closeBtn: "Zamknij", navBalance: "Pulpit", navCard: "Karta", navTransfer: "Płatności", navAccount: "Profil", txTransferSent: "Przelew wysłany", txTransferReceived: "Przelew otrzymany", cardWelcome: "Gratulacje, karta jest dostępna.", activateCardBtn: "Aktywuj", blockCardBtn: "Zablokuj", cardTransactions: "Transakcje kartowe", validUntil: "Ważne do:", accountOwner: "Właściciel", emailLabel: "E-mail", phoneLabel: "Telefon", countryLabel: "Kraj", addressLabel: "Adres zamieszkania", accountAndTransfer: "Konto i przelew", balanceProfile: "Saldo", accountType: "Typ", accountStatus: "Stan", statusActive: "Aktywny", supportedTransfer: "Transfer", accountTypeValue: "Profesjonalny", transferTypeValue: "Klasyczny", logoutBtn: "Rozłącz", blockedTitle: "Konto zablokowane", blockedDesc: "Twoje konto zostało zablokowane.", deletedTitle: "Link niedostępny", deletedDesc: "Ten link nie jest już dostępny." },
  fr: { loginTitle: "Connectez-vous à votre compte", emailPh: "Votre adresse e-mail", pinPh: "Votre code d'accès", loginBtn: "Se connecter", loginErr: "Adresse e-mail ou code PIN incorrect.", greeting: "Bonjour", accountActive: "Compte actif", personalLabel: "Personnel", availableBalance: "Solde disponible", detailsBtn: "Détails", quickIbanLabel: "Voir mon IBAN", quickIbanSub: "Partager mes coordonnées", quickCardLabel: "Carte virtuelle", quickCardSub: "Gérer ma carte", quickTransferLabel: "Faire un virement", quickTransferSub: "Envoyer de l'argent", seeAllBtn: "Voir tout", securityTitle: "Votre sécurité, notre engagement", securityDesc: "Des transactions protégées, 24h/24 et 7j/7.", learnMoreBtn: "En savoir plus", navPaymentsNew: "Paiements", notifTitleSuccess: "Succès", notifTitleError: "Erreur", notifTitleWarning: "Attention", notifTitleInfo: "Information", notifSubSuccess: "Opération réussie", notifSubError: "Une erreur est survenue", notifSubWarning: "Vérification requise", notifSubInfo: "Notification", notifOkBtn: "OK", notifConfirmTitle: "Confirmation", notifActionRequired: "Action requise", notifCancelBtn: "Annuler", notifConfirmBtn: "Confirmer", msgInvalidLink: "Lien invalide.", msgAccountSuspended: "Compte suspendu.", msgFillAllFields: "Veuillez remplir tous les champs.", msgEnterCode: "Veuillez saisir le code.", msgCodeIncorrect: "Code incorrect.", msgClientNotInit: "Client non initialisé.", msgAccountDeleted: "Compte supprimé.", transferSentTitle: "Virement envoyé", transferSentMsg: "Virement de <b>{amount}</b> envoyé avec succès à <b>{name}</b>.<br>Compte bénéficiaire : <b>{iban}</b>", transferFailedTitle: "Virement échoué", transferFailedMsg: "Virement de <b>{amount}</b> à <b>{name}</b> a échoué à <b>{percent}%</b>.<br>Compte : <b>{iban}</b>", transferCancelledTitle: "Virement annulé", transferCancelledMsg: "Virement de <b>{amount}</b> à <b>{name}</b> a été annulé.<br>Compte : <b>{iban}</b>", adminTransfersTitle: "Virements effectués", transferDetailsTitle: "Détails du virement", txTransferCancelled: "Virement annulé", txInitialDeposit: "Dépôt initial", txRefund: "Remboursement", copyBtn: "Copier", copied: "Copié !", transactionHistory: "Historique des transactions", noTransactions: "Aucun historique.", sendOutgoingTransfer: "Envoyer un virement sortant", transferDetails: "Détails du virement", amountToDebit: "Montant à débiter", labelIban: "IBAN / Numéro de compte", labelSwift: "Code banque (BIC/SWIFT)", labelBank: "Nom de la banque", labelBeneficiary: "Nom du bénéficiaire", labelReason: "Motif du virement", processingWarning: "Réalisation sous 1 à 3 minutes après vérification finale.", nextBtn: "Suivant", transferAmountLabel: "Montant :", ibanLabel: "IBAN/Numéro", ibanLabelLine2: "de compte :", swiftLabel: "Code banque :", bankLabel: "Banque destinataire :", beneficiaryLabel: "Nom du bénéficiaire :", reasonLabel: "Motif :", cancelTransferBtn: "Annuler le virement", lockText: "Veuillez saisir le code d'activation du virement", codeLabel: "Code d'activation", validateTransferBtn: "Valider le virement", processingPageTitle: "Votre ordre de virement en cours...", processingStatus: "Vérification d'identité effectuée avec succès.", processingDescLong: "Veuillez patienter la fin du virement des fonds.", processingDetailsTitle: "Détails du virement en cours", processingAmountLabel: "Montant du virement :", processingBeneficiaryLabel: "Nom du bénéficiaire :", processingIbanLabel: "IBAN / Numéro de Compte :", processingBankLabel: "Nom de la Banque :", receiptTitle: "Reçu de transaction", receiptSent: "Virement envoyé", receiptReceived: "Virement reçu", receiptAmount: "Montant", receiptTo: "Bénéficiaire", receiptFrom: "Expéditeur", receiptDate: "Date", receiptStatus: "Statut", receiptStatusDone: "Effectué", receiptRef: "Référence", receiptClose: "Fermer", profileEditBtn: "Modifier", profileVerified: "Profil vérifié", profilePersonalData: "Données personnelles", profilePersonalDataSub: "Vos informations personnelles", profileAccountSub: "Détails de votre compte et de vos virements", profileSecurityDesc: "Vos données sont protégées par un chiffrement de haute sécurité.", pendingTitle: "Détails du virement en attente", pendingResultTitle: "Virement en attente de validation", pendingResultMsg: "Votre virement a bien été enregistré et est en attente de validation.", pendingNotifTitle: "Virement en attente", pendingNotifMsg: "Votre virement <b>{amount}</b> est en cours de vérification.", adminPendingCardTitle: "Virement en attente", adminPendingCardSubtitle: "Activez le mode virement en attente pour le client sélectionné.", adminPendingOn: "Activé", adminPendingOff: "Désactivé", adminPendingEnableBtn: "Activer le virement en attente", adminPendingDisableBtn: "Désactiver le virement en attente", adminPendingSectionTitle: "Virements en attente", adminPendingEmpty: "Aucun virement en attente", adminPendingValidateBtn: "Valider", adminPendingCancelBtn: "Annuler", adminValidateConfirmTitle: "Valider le virement ?", adminValidateConfirmMsg: "Voulez-vous vraiment valider ce virement ? Le client recevra un email de confirmation avec le reçu PDF.", adminCancelPendingConfirmTitle: "Annuler le virement ?", adminCancelPendingConfirmMsg: "Voulez-vous vraiment annuler ce virement ? Le montant sera restitué au client.", pendingValidatedNotifTitle: "Virement validé", pendingValidatedNotifMsg: "Le virement <b>{amount}</b> a été validé. Le client recevra un email avec le reçu PDF.", pendingCancelledNotifTitle: "Virement annulé", pendingCancelledNotifMsg: "Le virement <b>{amount}</b> a été annulé. Le montant a été restitué au client.", loginFooterProtected: "Vos données sont protégées", loginFooterSecure: "Connexion 100% sécurisée", loginFooterSupport: "Assistance à votre écoute", invalidAmountFormat: "Veuillez saisir le montant au format correct (uniquement des chiffres). Exemple : 3000", amountExceedsBalance: "Le montant dépasse votre solde disponible.", modalSuccess: "Virement de {amount} envoyé", modalFailedAt: "Virement {amount} échoué à {percent}%", sendTime: "Heure d'envoi :", closeBtn: "Fermer", navBalance: "Accueil", navCard: "Carte virtuelle", navTransfer: "Paiements", navAccount: "Profil", txTransferSent: "Virement envoyé", txTransferReceived: "Virement reçu", cardWelcome: "Félicitations, votre carte est disponible.", activateCardBtn: "Activer ma carte", blockCardBtn: "Bloquer ma carte", cardTransactions: "Transactions par carte", validUntil: "Valable jusqu'au :", accountOwner: "Titulaire", emailLabel: "E-mail", phoneLabel: "Téléphone", countryLabel: "Pays", addressLabel: "Adresse de résidence", accountAndTransfer: "Compte et virement", balanceProfile: "Solde", accountType: "Type de compte", accountStatus: "Statut", statusActive: "Actif", supportedTransfer: "Virement supporté", accountTypeValue: "Professionnel", transferTypeValue: "Classique", logoutBtn: "Se déconnecter", blockedTitle: "Compte bloqué", blockedDesc: "Votre compte a été bloqué pour des raisons de sécurité.", deletedTitle: "Lien non disponible", deletedDesc: "Ce lien n'est plus disponible." },
  es: { loginTitle: "Inicia sesión", emailPh: "Tu correo", pinPh: "Tu código", loginBtn: "Iniciar", loginErr: "Correo o PIN incorrecto.", greeting: "Hola", accountActive: "Cuenta activa", personalLabel: "Personal", availableBalance: "Saldo disponible", detailsBtn: "Detalles", quickIbanLabel: "Ver mi IBAN", quickIbanSub: "Compartir mis datos", quickCardLabel: "Tarjeta virtual", quickCardSub: "Gestionar mi tarjeta", quickTransferLabel: "Hacer una transferencia", quickTransferSub: "Enviar dinero", seeAllBtn: "Ver todo", securityTitle: "Tu seguridad, nuestro compromiso", securityDesc: "Transacciones protegidas, 24/7.", learnMoreBtn: "Saber más", navPaymentsNew: "Pagos", notifTitleSuccess: "Éxito", notifTitleError: "Error", notifTitleWarning: "Atención", notifTitleInfo: "Información", notifSubSuccess: "Operación exitosa", notifSubError: "Se ha producido un error", notifSubWarning: "Verificación requerida", notifSubInfo: "Notificación", notifOkBtn: "OK", notifConfirmTitle: "Confirmación", notifActionRequired: "Acción requerida", notifCancelBtn: "Cancelar", notifConfirmBtn: "Confirmar", msgInvalidLink: "Enlace inválido.", msgAccountSuspended: "Cuenta suspendida.", msgFillAllFields: "Complete todos los campos.", msgEnterCode: "Introduzca el código.", msgCodeIncorrect: "Código incorrecto.", msgClientNotInit: "Cliente no inicializado.", msgAccountDeleted: "Cuenta eliminada.", transferSentTitle: "Transferencia enviada", transferSentMsg: "Transferencia de <b>{amount}</b> enviada con éxito a <b>{name}</b>.<br>Cuenta: <b>{iban}</b>", transferFailedTitle: "Transferencia fallida", transferFailedMsg: "Transferencia de <b>{amount}</b> a <b>{name}</b> falló al <b>{percent}%</b>.<br>Cuenta: <b>{iban}</b>", transferCancelledTitle: "Transferencia cancelada", transferCancelledMsg: "Transferencia de <b>{amount}</b> a <b>{name}</b> fue cancelada.<br>Cuenta: <b>{iban}</b>", adminTransfersTitle: "Transferencias realizadas", transferDetailsTitle: "Detalles", txTransferCancelled: "Transferencia cancelada", txInitialDeposit: "Depósito inicial", txRefund: "Reembolso", copyBtn: "Copiar", copied: "¡Copiado!", transactionHistory: "Historial", noTransactions: "Sin historial.", sendOutgoingTransfer: "Enviar transferencia", transferDetails: "Detalles", amountToDebit: "Importe a debitar", labelIban: "IBAN", labelSwift: "Código BIC/SWIFT", labelBank: "Nombre del banco", labelBeneficiary: "Beneficiario", labelReason: "Motivo", processingWarning: "Realización en 1-3 minutos tras verificación final.", nextBtn: "Siguiente", transferAmountLabel: "Importe:", ibanLabel: "IBAN", ibanLabelLine2: "cuenta:", swiftLabel: "BIC:", bankLabel: "Banco:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", cancelTransferBtn: "Cancelar la transferencia", lockText: "Introduzca el código de activación", codeLabel: "Código de activación", validateTransferBtn: "Validar", processingPageTitle: "Su orden de transferencia en curso...", processingStatus: "Verificación de identidad exitosa.", processingDescLong: "Espere el fin de la transferencia.", processingDetailsTitle: "Detalles en curso", processingAmountLabel: "Importe :", processingBeneficiaryLabel: "Beneficiario :", processingIbanLabel: "IBAN :", processingBankLabel: "Banco :", receiptTitle: "Recibo", receiptSent: "Enviada", receiptReceived: "Recibida", receiptAmount: "Importe", receiptTo: "Beneficiario", receiptFrom: "Remitente", receiptDate: "Fecha", receiptStatus: "Estado", receiptStatusDone: "Completado", receiptRef: "Referencia", receiptClose: "Cerrar", profileEditBtn: "Editar", profileVerified: "Perfil verificado", profilePersonalData: "Datos personales", profilePersonalDataSub: "Tu información personal", profileAccountSub: "Detalles de tu cuenta", profileSecurityDesc: "Tus datos están protegidos.", pendingTitle: "Detalles de la transferencia pendiente", pendingResultTitle: "Transferencia pendiente de validación", pendingResultMsg: "Su transferencia está pendiente de validación.", pendingNotifTitle: "Transferencia pendiente", pendingNotifMsg: "Su transferencia <b>{amount}</b> está siendo verificada.", adminPendingCardTitle: "Transferencia pendiente", adminPendingCardSubtitle: "Active el modo transferencia pendiente.", adminPendingOn: "Activado", adminPendingOff: "Desactivado", adminPendingEnableBtn: "Activar", adminPendingDisableBtn: "Desactivar", adminPendingSectionTitle: "Transferencias pendientes", adminPendingEmpty: "Sin transferencias pendientes", adminPendingValidateBtn: "Validar", adminPendingCancelBtn: "Cancelar", adminValidateConfirmTitle: "¿Validar la transferencia?", adminValidateConfirmMsg: "¿Desea validar esta transferencia?", adminCancelPendingConfirmTitle: "¿Cancelar la transferencia?", adminCancelPendingConfirmMsg: "¿Desea cancelar esta transferencia?", pendingValidatedNotifTitle: "Transferencia validada", pendingValidatedNotifMsg: "La transferencia <b>{amount}</b> ha sido validada.", pendingCancelledNotifTitle: "Transferencia cancelada", pendingCancelledNotifMsg: "La transferencia <b>{amount}</b> ha sido cancelada.", loginFooterProtected: "Tus datos están protegidos", loginFooterSecure: "Conexión segura", loginFooterSupport: "Asistencia a tu disposición", invalidAmountFormat: "Ingrese el importe correctamente. Ejemplo: 3000", amountExceedsBalance: "El importe supera su saldo.", modalSuccess: "Transferencia de {amount} enviada", modalFailedAt: "Transferencia {amount} falló al {percent}%", sendTime: "Hora:", closeBtn: "Cerrar", navBalance: "Inicio", navCard: "Tarjeta virtual", navTransfer: "Pagos", navAccount: "Perfil", txTransferSent: "Enviada", txTransferReceived: "Recibida", cardWelcome: "Tarjeta disponible.", activateCardBtn: "Activar", blockCardBtn: "Bloquear", cardTransactions: "Transacciones", validUntil: "Válida hasta:", accountOwner: "Titular", emailLabel: "Correo", phoneLabel: "Teléfono", countryLabel: "País", addressLabel: "Dirección de residencia", accountAndTransfer: "Cuenta y transferencia", balanceProfile: "Saldo", accountType: "Tipo", accountStatus: "Estado", statusActive: "Activo", supportedTransfer: "Soporte", accountTypeValue: "Profesional", transferTypeValue: "Clásico", logoutBtn: "Salir", blockedTitle: "Cuenta bloqueada", blockedDesc: "Su cuenta ha sido bloqueada.", deletedTitle: "Enlace no disponible", deletedDesc: "Este enlace ya no está disponible." },
  it: { loginTitle: "Accedi", emailPh: "Email", pinPh: "Codice", loginBtn: "Accedi", loginErr: "Email o PIN errato.", greeting: "Ciao", accountActive: "Conto attivo", personalLabel: "Personale", availableBalance: "Saldo disponibile", detailsBtn: "Dettagli", quickIbanLabel: "Vedi il mio IBAN", quickIbanSub: "Condividi i miei dati", quickCardLabel: "Carta virtuale", quickCardSub: "Gestisci la carta", quickTransferLabel: "Fai un bonifico", quickTransferSub: "Invia denaro", seeAllBtn: "Vedi tutto", securityTitle: "La tua sicurezza, il nostro impegno", securityDesc: "Transazioni protette, 24/7.", learnMoreBtn: "Scopri di più", navPaymentsNew: "Pagamenti", notifTitleSuccess: "Successo", notifTitleError: "Errore", notifTitleWarning: "Attenzione", notifTitleInfo: "Informazione", notifSubSuccess: "Operazione riuscita", notifSubError: "Si è verificato un errore", notifSubWarning: "Verifica richiesta", notifSubInfo: "Notifica", notifOkBtn: "OK", notifConfirmTitle: "Conferma", notifActionRequired: "Azione richiesta", notifCancelBtn: "Annulla", notifConfirmBtn: "Conferma", msgInvalidLink: "Link non valido.", msgAccountSuspended: "Conto sospeso.", msgFillAllFields: "Compila tutti i campi.", msgEnterCode: "Inserisci il codice.", msgCodeIncorrect: "Codice errato.", msgClientNotInit: "Cliente non inizializzato.", msgAccountDeleted: "Conto eliminato.", transferSentTitle: "Bonifico inviato", transferSentMsg: "Bonifico di <b>{amount}</b> inviato a <b>{name}</b>.<br>Conto: <b>{iban}</b>", transferFailedTitle: "Bonifico fallito", transferFailedMsg: "Bonifico di <b>{amount}</b> a <b>{name}</b> fallito al <b>{percent}%</b>.<br>Conto: <b>{iban}</b>", transferCancelledTitle: "Bonifico annullato", transferCancelledMsg: "Bonifico di <b>{amount}</b> a <b>{name}</b> annullato.<br>Conto: <b>{iban}</b>", adminTransfersTitle: "Bonifici effettuati", transferDetailsTitle: "Dettagli", txTransferCancelled: "Bonifico annullato", txInitialDeposit: "Deposito iniziale", txRefund: "Rimborso", copyBtn: "Copia", copied: "Copiato!", transactionHistory: "Cronologia", noTransactions: "Nessuna cronologia.", sendOutgoingTransfer: "Invia bonifico", transferDetails: "Dettagli", amountToDebit: "Importo da addebitare", labelIban: "IBAN", labelSwift: "Codice BIC/SWIFT", labelBank: "Nome della banca", labelBeneficiary: "Beneficiario", labelReason: "Motivo", processingWarning: "Esecuzione entro 1-3 minuti.", nextBtn: "Avanti", transferAmountLabel: "Importo:", ibanLabel: "IBAN", ibanLabelLine2: "conto:", swiftLabel: "BIC:", bankLabel: "Banca:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", cancelTransferBtn: "Annulla il bonifico", lockText: "Inserisci il codice di attivazione", codeLabel: "Codice di attivazione", validateTransferBtn: "Convalida", processingPageTitle: "Il tuo ordine di bonifico in corso...", processingStatus: "Verifica dell'identità completata.", processingDescLong: "Attendere la fine del trasferimento.", processingDetailsTitle: "Dettagli in corso", processingAmountLabel: "Importo :", processingBeneficiaryLabel: "Beneficiario :", processingIbanLabel: "IBAN :", processingBankLabel: "Banca :", receiptTitle: "Ricevuta", receiptSent: "Inviato", receiptReceived: "Ricevuto", receiptAmount: "Importo", receiptTo: "Beneficiario", receiptFrom: "Mittente", receiptDate: "Data", receiptStatus: "Stato", receiptStatusDone: "Completato", receiptRef: "Riferimento", receiptClose: "Chiudi", profileEditBtn: "Modifica", profileVerified: "Profilo verificato", profilePersonalData: "Dati personali", profilePersonalDataSub: "Le tue informazioni", profileAccountSub: "Dettagli del conto", profileSecurityDesc: "I tuoi dati sono protetti.", pendingTitle: "Dettagli del bonifico in sospeso", pendingResultTitle: "Bonifico in attesa di convalida", pendingResultMsg: "Il tuo bonifico è in attesa di convalida.", pendingNotifTitle: "Bonifico in attesa", pendingNotifMsg: "Il tuo bonifico <b>{amount}</b> è in verifica.", adminPendingCardTitle: "Bonifico in attesa", adminPendingCardSubtitle: "Attiva la modalità bonifico in attesa.", adminPendingOn: "Attivato", adminPendingOff: "Disattivato", adminPendingEnableBtn: "Attiva", adminPendingDisableBtn: "Disattiva", adminPendingSectionTitle: "Bonifici in attesa", adminPendingEmpty: "Nessun bonifico in attesa", adminPendingValidateBtn: "Convalida", adminPendingCancelBtn: "Annulla", adminValidateConfirmTitle: "Convalidare il bonifico?", adminValidateConfirmMsg: "Vuoi davvero convalidare questo bonifico?", adminCancelPendingConfirmTitle: "Annullare il bonifico?", adminCancelPendingConfirmMsg: "Vuoi davvero annullare questo bonifico?", pendingValidatedNotifTitle: "Bonifico convalidato", pendingValidatedNotifMsg: "Il bonifico <b>{amount}</b> è stato convalidato.", pendingCancelledNotifTitle: "Bonifico annullato", pendingCancelledNotifMsg: "Il bonifico <b>{amount}</b> è stato annullato.", loginFooterProtected: "I tuoi dati sono protetti", loginFooterSecure: "Connessione sicura", loginFooterSupport: "Assistenza a tua disposizione", invalidAmountFormat: "Inserisci l'importo correttamente. Esempio: 3000", amountExceedsBalance: "L'importo supera il saldo.", modalSuccess: "Bonifico di {amount} inviato", modalFailedAt: "Bonifico {amount} fallito al {percent}%", sendTime: "Ora:", closeBtn: "Chiudi", navBalance: "Home", navCard: "Carta virtuale", navTransfer: "Pagamenti", navAccount: "Profilo", txTransferSent: "Inviato", txTransferReceived: "Ricevuto", cardWelcome: "Carta disponibile.", activateCardBtn: "Attiva", blockCardBtn: "Blocca", cardTransactions: "Transazioni", validUntil: "Valida fino al:", accountOwner: "Titolare", emailLabel: "Email", phoneLabel: "Telefono", countryLabel: "Paese", addressLabel: "Indirizzo di residenza", accountAndTransfer: "Conto e bonifico", balanceProfile: "Saldo", accountType: "Tipo", accountStatus: "Stato", statusActive: "Attivo", supportedTransfer: "Supporto", accountTypeValue: "Professionale", transferTypeValue: "Classico", logoutBtn: "Esci", blockedTitle: "Conto bloccato", blockedDesc: "Il tuo conto è stato bloccato.", deletedTitle: "Link non disponibile", deletedDesc: "Questo link non è più disponibile." },
  de: { loginTitle: "Anmelden", emailPh: "E-Mail", pinPh: "Zugangscode", loginBtn: "Anmelden", loginErr: "Falsche E-Mail oder PIN.", greeting: "Hallo", accountActive: "Konto aktiv", personalLabel: "Persönlich", availableBalance: "Verfügbares Guthaben", detailsBtn: "Details", quickIbanLabel: "Meine IBAN anzeigen", quickIbanSub: "Meine Daten teilen", quickCardLabel: "Virtuelle Karte", quickCardSub: "Karte verwalten", quickTransferLabel: "Überweisung tätigen", quickTransferSub: "Geld senden", seeAllBtn: "Alle anzeigen", securityTitle: "Ihre Sicherheit, unser Engagement", securityDesc: "Geschützte Transaktionen, rund um die Uhr.", learnMoreBtn: "Mehr erfahren", navPaymentsNew: "Zahlungen", notifTitleSuccess: "Erfolg", notifTitleError: "Fehler", notifTitleWarning: "Achtung", notifTitleInfo: "Information", notifSubSuccess: "Vorgang erfolgreich", notifSubError: "Ein Fehler ist aufgetreten", notifSubWarning: "Verifizierung erforderlich", notifSubInfo: "Benachrichtigung", notifOkBtn: "OK", notifConfirmTitle: "Bestätigung", notifActionRequired: "Aktion erforderlich", notifCancelBtn: "Abbrechen", notifConfirmBtn: "Bestätigen", msgInvalidLink: "Ungültiger Link.", msgAccountSuspended: "Konto gesperrt.", msgFillAllFields: "Bitte alle Felder ausfüllen.", msgEnterCode: "Bitte Code eingeben.", msgCodeIncorrect: "Falscher Code.", msgClientNotInit: "Kunde nicht initialisiert.", msgAccountDeleted: "Konto gelöscht.", transferSentTitle: "Überweisung gesendet", transferSentMsg: "Überweisung von <b>{amount}</b> an <b>{name}</b>.<br>Konto: <b>{iban}</b>", transferFailedTitle: "Überweisung fehlgeschlagen", transferFailedMsg: "Überweisung von <b>{amount}</b> an <b>{name}</b> bei <b>{percent}%</b> fehlgeschlagen.<br>Konto: <b>{iban}</b>", transferCancelledTitle: "Überweisung storniert", transferCancelledMsg: "Überweisung von <b>{amount}</b> an <b>{name}</b> wurde storniert.<br>Konto: <b>{iban}</b>", adminTransfersTitle: "Ausgeführte Überweisungen", transferDetailsTitle: "Details", txTransferCancelled: "Überweisung storniert", txInitialDeposit: "Ersteinzahlung", txRefund: "Rückerstattung", copyBtn: "Kopieren", copied: "Kopiert!", transactionHistory: "Verlauf", noTransactions: "Kein Verlauf.", sendOutgoingTransfer: "Überweisung senden", transferDetails: "Details", amountToDebit: "Zu belastender Betrag", labelIban: "IBAN", labelSwift: "Bankcode", labelBank: "Name der Bank", labelBeneficiary: "Begünstigter", labelReason: "Grund", processingWarning: "Ausführung in 1-3 Minuten.", nextBtn: "Weiter", transferAmountLabel: "Betrag:", ibanLabel: "IBAN", ibanLabelLine2: "Konto:", swiftLabel: "BIC:", bankLabel: "Empfänger:", beneficiaryLabel: "Begünstigter:", reasonLabel: "Grund:", cancelTransferBtn: "Überweisung stornieren", lockText: "Bitte Aktivierungscode eingeben", codeLabel: "Aktivierungscode", validateTransferBtn: "Bestätigen", processingPageTitle: "Ihr Überweisungsauftrag wird bearbeitet...", processingStatus: "Identitätsprüfung abgeschlossen.", processingDescLong: "Bitte warten Sie, bis die Überweisung abgeschlossen ist.", processingDetailsTitle: "Details der laufenden Überweisung", processingAmountLabel: "Betrag :", processingBeneficiaryLabel: "Begünstigter :", processingIbanLabel: "IBAN :", processingBankLabel: "Bank :", receiptTitle: "Transaktionsbeleg", receiptSent: "Gesendet", receiptReceived: "Erhalten", receiptAmount: "Betrag", receiptTo: "Begünstigter", receiptFrom: "Absender", receiptDate: "Datum", receiptStatus: "Status", receiptStatusDone: "Abgeschlossen", receiptRef: "Referenz", receiptClose: "Schließen", profileEditBtn: "Bearbeiten", profileVerified: "Verifiziertes Profil", profilePersonalData: "Persönliche Daten", profilePersonalDataSub: "Ihre Informationen", profileAccountSub: "Kontodetails", profileSecurityDesc: "Ihre Daten sind geschützt.", pendingTitle: "Details der ausstehenden Überweisung", pendingResultTitle: "Überweisung zur Genehmigung ausstehend", pendingResultMsg: "Ihre Überweisung wartet auf die Genehmigung.", pendingNotifTitle: "Ausstehend", pendingNotifMsg: "Ihre Überweisung <b>{amount}</b> wird überprüft.", adminPendingCardTitle: "Ausstehend", adminPendingCardSubtitle: "Ausstehenden Modus aktivieren.", adminPendingOn: "Aktiviert", adminPendingOff: "Deaktiviert", adminPendingEnableBtn: "Aktivieren", adminPendingDisableBtn: "Deaktivieren", adminPendingSectionTitle: "Ausstehende Überweisungen", adminPendingEmpty: "Keine ausstehenden", adminPendingValidateBtn: "Genehmigen", adminPendingCancelBtn: "Stornieren", adminValidateConfirmTitle: "Überweisung genehmigen?", adminValidateConfirmMsg: "Möchten Sie diese Überweisung genehmigen?", adminCancelPendingConfirmTitle: "Überweisung stornieren?", adminCancelPendingConfirmMsg: "Möchten Sie diese Überweisung stornieren?", pendingValidatedNotifTitle: "Genehmigt", pendingValidatedNotifMsg: "Die Überweisung <b>{amount}</b> wurde genehmigt.", pendingCancelledNotifTitle: "Storniert", pendingCancelledNotifMsg: "Die Überweisung <b>{amount}</b> wurde storniert.", loginFooterProtected: "Ihre Daten sind geschützt", loginFooterSecure: "100% sichere Verbindung", loginFooterSupport: "Support für Sie", invalidAmountFormat: "Bitte geben Sie den Betrag korrekt ein. Beispiel: 3000", amountExceedsBalance: "Der Betrag übersteigt das Guthaben.", modalSuccess: "Überweisung von {amount} gesendet", modalFailedAt: "Überweisung {amount} bei {percent}% fehlgeschlagen", sendTime: "Zeit:", closeBtn: "Schließen", navBalance: "Start", navCard: "Virtuelle Karte", navTransfer: "Zahlungen", navAccount: "Profil", txTransferSent: "Gesendet", txTransferReceived: "Erhalten", cardWelcome: "Karte verfügbar.", activateCardBtn: "Aktivieren", blockCardBtn: "Sperren", cardTransactions: "Transaktionen", validUntil: "Gültig bis:", accountOwner: "Kontoinhaber", emailLabel: "E-Mail", phoneLabel: "Telefon", countryLabel: "Land", addressLabel: "Wohnadresse", accountAndTransfer: "Konto und Überweisung", balanceProfile: "Kontostand", accountType: "Kontotyp", accountStatus: "Status", statusActive: "Aktiv", supportedTransfer: "Unterstützte Überweisung", accountTypeValue: "Professionell", transferTypeValue: "Klassisch", logoutBtn: "Abmelden", blockedTitle: "Konto gesperrt", blockedDesc: "Ihr Konto wurde gesperrt.", deletedTitle: "Link nicht verfügbar", deletedDesc: "Dieser Link ist nicht mehr verfügbar." },
  // ═══════════════════════════════════════════════════════════
  // ★ NOUVELLES LANGUES (10)
  // ═══════════════════════════════════════════════════════════
  he: { loginTitle: "התחבר לחשבונך", emailPh: "כתובת האימייל שלך", pinPh: "קוד הגישה שלך", loginBtn: "התחבר", loginErr: "אימייל או קוד PIN שגוי.", greeting: "שלום", accountActive: "חשבון פעיל", personalLabel: "אישי", availableBalance: "יתרה זמינה", detailsBtn: "פרטים", quickIbanLabel: "הצג את ה-IBAN שלי", quickIbanSub: "שתף את הפרטים שלי", quickCardLabel: "כרטיס וירטואלי", quickCardSub: "נהל את הכרטיס שלי", quickTransferLabel: "בצע העברה", quickTransferSub: "שלח כסף", seeAllBtn: "הצג הכל", securityTitle: "האבטחה שלך, המחויבות שלנו", securityDesc: "עסקאות מוגנות, 24/7.", learnMoreBtn: "למד עוד", navPaymentsNew: "תשלומים", notifTitleSuccess: "הצלחה", notifTitleError: "שגיאה", notifTitleWarning: "אזהרה", notifTitleInfo: "מידע", notifSubSuccess: "הפעולה בוצעה בהצלחה", notifSubError: "אירעה שגיאה", notifSubWarning: "נדרש אימות", notifSubInfo: "התראה", notifOkBtn: "אישור", notifConfirmTitle: "אישור", notifActionRequired: "נדרשת פעולה", notifCancelBtn: "ביטול", notifConfirmBtn: "אשר", msgInvalidLink: "קישור לא תקין.", msgAccountSuspended: "החשבון מושעה.", msgFillAllFields: "מלא את כל השדות.", msgEnterCode: "הזן את הקוד.", msgCodeIncorrect: "קוד שגוי.", msgClientNotInit: "לקוח לא מאותחל.", msgAccountDeleted: "החשבון נמחק.", transferSentTitle: "ההעברה נשלחה", transferSentMsg: "העברה של <b>{amount}</b> נשלחה ל-<b>{name}</b>.<br>חשבון: <b>{iban}</b>", transferFailedTitle: "ההעברה נכשלה", transferFailedMsg: "העברה של <b>{amount}</b> ל-<b>{name}</b> נכשלה ב-<b>{percent}%</b>.<br>חשבון: <b>{iban}</b>", transferCancelledTitle: "ההעברה בוטלה", transferCancelledMsg: "העברה של <b>{amount}</b> ל-<b>{name}</b> בוטלה.<br>חשבון: <b>{iban}</b>", adminTransfersTitle: "העברות שבוצעו", transferDetailsTitle: "פרטי ההעברה", txTransferCancelled: "ההעברה בוטלה", txInitialDeposit: "הפקדה ראשונית", txRefund: "החזר", copyBtn: "העתק", copied: "הועתק!", transactionHistory: "היסטוריית עסקאות", noTransactions: "אין היסטוריה.", sendOutgoingTransfer: "שלח העברה יוצאת", transferDetails: "פרטי ההעברה", amountToDebit: "סכום לחיוב", labelIban: "IBAN / מספר חשבון", labelSwift: "קוד בנק (BIC/SWIFT)", labelBank: "שם הבנק", labelBeneficiary: "שם המוטב", labelReason: "סיבת ההעברה", processingWarning: "ביצוע תוך 1 עד 3 דקות לאחר אימות סופי.", nextBtn: "הבא", transferAmountLabel: "סכום ההעברה:", ibanLabel: "IBAN/מספר", ibanLabelLine2: "חשבון:", swiftLabel: "קוד בנק:", bankLabel: "בנק יעד:", beneficiaryLabel: "שם המוטב:", reasonLabel: "סיבה:", cancelTransferBtn: "בטל את ההעברה", lockText: "הזן את קוד ההפעלה של ההעברה", codeLabel: "קוד הפעלה", validateTransferBtn: "אשר את ההעברה", processingPageTitle: "ההעברה שלך מתבצעת...", processingStatus: "אימות הזהות בוצע בהצלחה.", processingDescLong: "אנא המתן לסיום ההעברה.", processingDetailsTitle: "פרטי ההעברה המתבצעת", processingAmountLabel: "סכום ההעברה :", processingBeneficiaryLabel: "שם המוטב :", processingIbanLabel: "IBAN :", processingBankLabel: "שם הבנק :", receiptTitle: "קבלת עסקה", receiptSent: "ההעברה נשלחה", receiptReceived: "ההעברה התקבלה", receiptAmount: "סכום", receiptTo: "מוטב", receiptFrom: "שולח", receiptDate: "תאריך", receiptStatus: "סטטוס", receiptStatusDone: "בוצע", receiptRef: "אסמכתא", receiptClose: "סגור", profileEditBtn: "ערוך", profileVerified: "פרופיל מאומת", profilePersonalData: "נתונים אישיים", profilePersonalDataSub: "המידע האישי שלך", profileAccountSub: "פרטי החשבון וההעברות", profileSecurityDesc: "הנתונים שלך מוגנים בהצפנה.", pendingTitle: "פרטי ההעברה הממתינה", pendingResultTitle: "ההעברה ממתינה לאישור", pendingResultMsg: "ההעברה שלך נרשמה וממתינה לאישור.", pendingNotifTitle: "העברה ממתינה", pendingNotifMsg: "ההעברה <b>{amount}</b> שלך נבדקת.", adminPendingCardTitle: "העברה ממתינה", adminPendingCardSubtitle: "הפעל מצב העברה ממתינה ללקוח שנבחר.", adminPendingOn: "מופעל", adminPendingOff: "מושבת", adminPendingEnableBtn: "הפעל העברה ממתינה", adminPendingDisableBtn: "השבת העברה ממתינה", adminPendingSectionTitle: "העברות ממתינות", adminPendingEmpty: "אין העברות ממתינות", adminPendingValidateBtn: "אשר", adminPendingCancelBtn: "בטל", adminValidateConfirmTitle: "לאשר את ההעברה?", adminValidateConfirmMsg: "האם לאשר את ההעברה? הלקוח יקבל מייל אישור עם קבלה PDF.", adminCancelPendingConfirmTitle: "לבטל את ההעברה?", adminCancelPendingConfirmMsg: "האם לבטל את ההעברה? הסכום יוחזר ללקוח אוטומטית.", pendingValidatedNotifTitle: "ההעברה אושרה", pendingValidatedNotifMsg: "ההעברה <b>{amount}</b> אושרה. הלקוח יקבל מייל.", pendingCancelledNotifTitle: "ההעברה בוטלה", pendingCancelledNotifMsg: "ההעברה <b>{amount}</b> בוטלה. הסכום הוחזר ללקוח.", loginFooterProtected: "הנתונים שלך מוגנים", loginFooterSecure: "חיבור מאובטח 100%", loginFooterSupport: "תמיכה לשירותך", invalidAmountFormat: "הזן סכום בפורמט תקין. דוגמה: 3000", amountExceedsBalance: "הסכום עולה על היתרה.", modalSuccess: "העברה של {amount} נשלחה", modalFailedAt: "העברה {amount} נכשלה ב-{percent}%", sendTime: "שעת שליחה:", closeBtn: "סגור", navBalance: "בית", navCard: "כרטיס וירטואלי", navTransfer: "תשלומים", navAccount: "פרופיל", txTransferSent: "ההעברה נשלחה", txTransferReceived: "ההעברה התקבלה", cardWelcome: "ברכות, הכרטיס זמין.", activateCardBtn: "הפעל כרטיס", blockCardBtn: "חסום כרטיס", cardTransactions: "עסקאות בכרטיס", validUntil: "בתוקף עד:", accountOwner: "בעל החשבון", emailLabel: "אימייל", phoneLabel: "טלפון", countryLabel: "מדינה", addressLabel: "כתובת מגורים", accountAndTransfer: "חשבון והעברה", balanceProfile: "יתרה", accountType: "סוג חשבון", accountStatus: "סטטוס", statusActive: "פעיל", supportedTransfer: "העברה נתמכת", accountTypeValue: "מקצועי", transferTypeValue: "קלאסי", logoutBtn: "התנתק", blockedTitle: "החשבון חסום", blockedDesc: "החשבון שלך נחסם מטעמי אבטחה.", deletedTitle: "הקישור אינו זמין", deletedDesc: "הקישור הזה כבר לא זמין." },
  hr: { loginTitle: "Prijavite se u svoj račun", emailPh: "Vaša e-mail adresa", pinPh: "Vaš pristupni kod", loginBtn: "Prijava", loginErr: "Neispravan e-mail ili PIN.", greeting: "Pozdrav", accountActive: "Račun aktivan", personalLabel: "Osobno", availableBalance: "Raspoloživo stanje", detailsBtn: "Detalji", quickIbanLabel: "Pogledaj moj IBAN", quickIbanSub: "Podijeli moje podatke", quickCardLabel: "Virtualna kartica", quickCardSub: "Upravljaj karticom", quickTransferLabel: "Izvrši prijenos", quickTransferSub: "Pošalji novac", seeAllBtn: "Vidi sve", securityTitle: "Vaša sigurnost, naša obveza", securityDesc: "Zaštićene transakcije, 24/7.", learnMoreBtn: "Saznaj više", navPaymentsNew: "Plaćanja", notifTitleSuccess: "Uspjeh", notifTitleError: "Greška", notifTitleWarning: "Pažnja", notifTitleInfo: "Informacija", notifSubSuccess: "Operacija uspješna", notifSubError: "Došlo je do greške", notifSubWarning: "Potrebna verifikacija", notifSubInfo: "Obavijest", notifOkBtn: "OK", notifConfirmTitle: "Potvrda", notifActionRequired: "Potrebna radnja", notifCancelBtn: "Otkaži", notifConfirmBtn: "Potvrdi", msgInvalidLink: "Neispravan link.", msgAccountSuspended: "Račun suspendiran.", msgFillAllFields: "Molimo ispunite sva polja.", msgEnterCode: "Unesite kod.", msgCodeIncorrect: "Neispravan kod.", msgClientNotInit: "Klijent nije inicijaliziran.", msgAccountDeleted: "Račun izbrisan.", transferSentTitle: "Prijenos poslan", transferSentMsg: "Prijenos od <b>{amount}</b> poslan na <b>{name}</b>.<br>Račun: <b>{iban}</b>", transferFailedTitle: "Prijenos neuspješan", transferFailedMsg: "Prijenos od <b>{amount}</b> na <b>{name}</b> neuspješan kod <b>{percent}%</b>.<br>Račun: <b>{iban}</b>", transferCancelledTitle: "Prijenos otkazan", transferCancelledMsg: "Prijenos od <b>{amount}</b> na <b>{name}</b> otkazan.<br>Račun: <b>{iban}</b>", adminTransfersTitle: "Izvršeni prijenosi", transferDetailsTitle: "Detalji prijenosa", txTransferCancelled: "Prijenos otkazan", txInitialDeposit: "Početni polog", txRefund: "Povrat", copyBtn: "Kopiraj", copied: "Kopirano!", transactionHistory: "Povijest transakcija", noTransactions: "Nema povijesti.", sendOutgoingTransfer: "Pošalji odlazni prijenos", transferDetails: "Detalji prijenosa", amountToDebit: "Iznos za terećenje", labelIban: "IBAN / Broj računa", labelSwift: "BIC/SWIFT kod", labelBank: "Naziv banke", labelBeneficiary: "Naziv primatelja", labelReason: "Svrha prijenosa", processingWarning: "Izvršenje u roku od 1 do 3 minute.", nextBtn: "Dalje", transferAmountLabel: "Iznos prijenosa:", ibanLabel: "IBAN/broj", ibanLabelLine2: "računa:", swiftLabel: "Kod banke:", bankLabel: "Banka primateljica:", beneficiaryLabel: "Naziv primatelja:", reasonLabel: "Svrha:", cancelTransferBtn: "Otkaži prijenos", lockText: "Unesite aktivacijski kod prijenosa", codeLabel: "Aktivacijski kod", validateTransferBtn: "Potvrdi prijenos", processingPageTitle: "Vaš nalog za prijenos u tijeku...", processingStatus: "Provjera identiteta uspješno obavljena.", processingDescLong: "Molimo pričekajte završetak prijenosa.", processingDetailsTitle: "Detalji prijenosa u tijeku", processingAmountLabel: "Iznos prijenosa :", processingBeneficiaryLabel: "Naziv primatelja :", processingIbanLabel: "IBAN :", processingBankLabel: "Naziv banke :", receiptTitle: "Potvrda transakcije", receiptSent: "Prijenos poslan", receiptReceived: "Prijenos primljen", receiptAmount: "Iznos", receiptTo: "Primatelj", receiptFrom: "Pošiljatelj", receiptDate: "Datum", receiptStatus: "Status", receiptStatusDone: "Izvršeno", receiptRef: "Referenca", receiptClose: "Zatvori", profileEditBtn: "Uredi", profileVerified: "Profil verificiran", profilePersonalData: "Osobni podaci", profilePersonalDataSub: "Vaši osobni podaci", profileAccountSub: "Detalji računa i prijenosa", profileSecurityDesc: "Vaši podaci su zaštićeni.", pendingTitle: "Detalji prijenosa na čekanju", pendingResultTitle: "Prijenos čeka odobrenje", pendingResultMsg: "Vaš prijenos je registriran i čeka odobrenje.", pendingNotifTitle: "Prijenos na čekanju", pendingNotifMsg: "Vaš prijenos <b>{amount}</b> je u obradi.", adminPendingCardTitle: "Prijenos na čekanju", adminPendingCardSubtitle: "Aktivirajte način prijenosa na čekanju.", adminPendingOn: "Aktivirano", adminPendingOff: "Deaktivirano", adminPendingEnableBtn: "Aktiviraj prijenos na čekanju", adminPendingDisableBtn: "Deaktiviraj prijenos na čekanju", adminPendingSectionTitle: "Prijenosi na čekanju", adminPendingEmpty: "Nema prijenosa na čekanju", adminPendingValidateBtn: "Odobri", adminPendingCancelBtn: "Otkaži", adminValidateConfirmTitle: "Odobriti prijenos?", adminValidateConfirmMsg: "Želite li odobriti ovaj prijenos?", adminCancelPendingConfirmTitle: "Otkazati prijenos?", adminCancelPendingConfirmMsg: "Želite li otkazati ovaj prijenos?", pendingValidatedNotifTitle: "Prijenos odobren", pendingValidatedNotifMsg: "Prijenos <b>{amount}</b> je odobren.", pendingCancelledNotifTitle: "Prijenos otkazan", pendingCancelledNotifMsg: "Prijenos <b>{amount}</b> je otkazan.", loginFooterProtected: "Vaši podaci su zaštićeni", loginFooterSecure: "100% sigurna veza", loginFooterSupport: "Podrška za vas", invalidAmountFormat: "Unesite iznos u ispravnom formatu. Primjer: 3000", amountExceedsBalance: "Iznos premašuje stanje.", modalSuccess: "Prijenos od {amount} poslan", modalFailedAt: "Prijenos {amount} neuspješan kod {percent}%", sendTime: "Vrijeme:", closeBtn: "Zatvori", navBalance: "Početna", navCard: "Virtualna kartica", navTransfer: "Plaćanja", navAccount: "Profil", txTransferSent: "Prijenos poslan", txTransferReceived: "Prijenos primljen", cardWelcome: "Čestitamo, kartica je dostupna.", activateCardBtn: "Aktiviraj", blockCardBtn: "Blokiraj", cardTransactions: "Transakcije karticom", validUntil: "Vrijedi do:", accountOwner: "Vlasnik", emailLabel: "E-mail", phoneLabel: "Telefon", countryLabel: "Država", addressLabel: "Adresa prebivališta", accountAndTransfer: "Račun i prijenos", balanceProfile: "Stanje", accountType: "Vrsta računa", accountStatus: "Status", statusActive: "Aktivan", supportedTransfer: "Podržani prijenos", accountTypeValue: "Profesionalni", transferTypeValue: "Klasični", logoutBtn: "Odjava", blockedTitle: "Račun blokiran", blockedDesc: "Vaš račun je blokiran iz sigurnosnih razloga.", deletedTitle: "Link nije dostupan", deletedDesc: "Ovaj link više nije dostupan." },
  ro: { loginTitle: "Conectați-vă la contul dvs.", emailPh: "Adresa dvs. de e-mail", pinPh: "Codul dvs. de acces", loginBtn: "Conectare", loginErr: "E-mail sau PIN incorect.", greeting: "Bună", accountActive: "Cont activ", personalLabel: "Personal", availableBalance: "Sold disponibil", detailsBtn: "Detalii", quickIbanLabel: "Vezi IBAN-ul meu", quickIbanSub: "Distribuie datele mele", quickCardLabel: "Card virtual", quickCardSub: "Gestionează cardul", quickTransferLabel: "Efectuează un transfer", quickTransferSub: "Trimite bani", seeAllBtn: "Vezi tot", securityTitle: "Siguranța dvs., angajamentul nostru", securityDesc: "Tranzacții protejate, 24/7.", learnMoreBtn: "Aflați mai multe", navPaymentsNew: "Plăți", notifTitleSuccess: "Succes", notifTitleError: "Eroare", notifTitleWarning: "Atenție", notifTitleInfo: "Informație", notifSubSuccess: "Operațiune reușită", notifSubError: "A apărut o eroare", notifSubWarning: "Verificare necesară", notifSubInfo: "Notificare", notifOkBtn: "OK", notifConfirmTitle: "Confirmare", notifActionRequired: "Acțiune necesară", notifCancelBtn: "Anulează", notifConfirmBtn: "Confirmă", msgInvalidLink: "Link invalid.", msgAccountSuspended: "Cont suspendat.", msgFillAllFields: "Completați toate câmpurile.", msgEnterCode: "Introduceți codul.", msgCodeIncorrect: "Cod incorect.", msgClientNotInit: "Client neinițializat.", msgAccountDeleted: "Cont șters.", transferSentTitle: "Transfer trimis", transferSentMsg: "Transfer de <b>{amount}</b> trimis către <b>{name}</b>.<br>Cont: <b>{iban}</b>", transferFailedTitle: "Transfer eșuat", transferFailedMsg: "Transfer de <b>{amount}</b> către <b>{name}</b> a eșuat la <b>{percent}%</b>.<br>Cont: <b>{iban}</b>", transferCancelledTitle: "Transfer anulat", transferCancelledMsg: "Transfer de <b>{amount}</b> către <b>{name}</b> a fost anulat.<br>Cont: <b>{iban}</b>", adminTransfersTitle: "Transferuri efectuate", transferDetailsTitle: "Detalii transfer", txTransferCancelled: "Transfer anulat", txInitialDeposit: "Depunere inițială", txRefund: "Rambursare", copyBtn: "Copiază", copied: "Copiat!", transactionHistory: "Istoric tranzacții", noTransactions: "Fără istoric.", sendOutgoingTransfer: "Trimite transfer ieșire", transferDetails: "Detalii transfer", amountToDebit: "Sumă de debitat", labelIban: "IBAN / Număr cont", labelSwift: "Cod bancă (BIC/SWIFT)", labelBank: "Numele băncii", labelBeneficiary: "Numele beneficiarului", labelReason: "Motivul transferului", processingWarning: "Efectuare în 1-3 minute după verificarea finală.", nextBtn: "Următor", transferAmountLabel: "Suma transferului:", ibanLabel: "IBAN/număr", ibanLabelLine2: "cont:", swiftLabel: "Cod bancă:", bankLabel: "Banca destinatară:", beneficiaryLabel: "Numele beneficiarului:", reasonLabel: "Motiv:", cancelTransferBtn: "Anulează transferul", lockText: "Introduceți codul de activare al transferului", codeLabel: "Cod de activare", validateTransferBtn: "Validează transferul", processingPageTitle: "Ordinul dvs. de transfer este în curs...", processingStatus: "Verificarea identității a fost efectuată cu succes.", processingDescLong: "Vă rugăm așteptați finalizarea transferului.", processingDetailsTitle: "Detalii transfer în curs", processingAmountLabel: "Suma transferului :", processingBeneficiaryLabel: "Numele beneficiarului :", processingIbanLabel: "IBAN :", processingBankLabel: "Numele băncii :", receiptTitle: "Chitanță tranzacție", receiptSent: "Transfer trimis", receiptReceived: "Transfer primit", receiptAmount: "Sumă", receiptTo: "Beneficiar", receiptFrom: "Expeditor", receiptDate: "Data", receiptStatus: "Status", receiptStatusDone: "Efectuat", receiptRef: "Referință", receiptClose: "Închide", profileEditBtn: "Modifică", profileVerified: "Profil verificat", profilePersonalData: "Date personale", profilePersonalDataSub: "Informațiile dvs. personale", profileAccountSub: "Detalii cont și transferuri", profileSecurityDesc: "Datele dvs. sunt protejate.", pendingTitle: "Detalii transfer în așteptare", pendingResultTitle: "Transfer în așteptarea validării", pendingResultMsg: "Transferul dvs. a fost înregistrat și așteaptă validarea.", pendingNotifTitle: "Transfer în așteptare", pendingNotifMsg: "Transferul dvs. <b>{amount}</b> este în curs de verificare.", adminPendingCardTitle: "Transfer în așteptare", adminPendingCardSubtitle: "Activați modul transfer în așteptare.", adminPendingOn: "Activat", adminPendingOff: "Dezactivat", adminPendingEnableBtn: "Activează transferul în așteptare", adminPendingDisableBtn: "Dezactivează transferul în așteptare", adminPendingSectionTitle: "Transferuri în așteptare", adminPendingEmpty: "Niciun transfer în așteptare", adminPendingValidateBtn: "Validează", adminPendingCancelBtn: "Anulează", adminValidateConfirmTitle: "Validați transferul?", adminValidateConfirmMsg: "Doriți să validați acest transfer?", adminCancelPendingConfirmTitle: "Anulați transferul?", adminCancelPendingConfirmMsg: "Doriți să anulați acest transfer?", pendingValidatedNotifTitle: "Transfer validat", pendingValidatedNotifMsg: "Transferul <b>{amount}</b> a fost validat.", pendingCancelledNotifTitle: "Transfer anulat", pendingCancelledNotifMsg: "Transferul <b>{amount}</b> a fost anulat.", loginFooterProtected: "Datele dvs. sunt protejate", loginFooterSecure: "Conexiune 100% sigură", loginFooterSupport: "Asistență pentru dvs.", invalidAmountFormat: "Introduceți suma corect. Exemplu: 3000", amountExceedsBalance: "Suma depășește soldul.", modalSuccess: "Transfer de {amount} trimis", modalFailedAt: "Transfer {amount} eșuat la {percent}%", sendTime: "Ora:", closeBtn: "Închide", navBalance: "Acasă", navCard: "Card virtual", navTransfer: "Plăți", navAccount: "Profil", txTransferSent: "Transfer trimis", txTransferReceived: "Transfer primit", cardWelcome: "Felicitări, cardul este disponibil.", activateCardBtn: "Activează", blockCardBtn: "Blochează", cardTransactions: "Tranzacții card", validUntil: "Valabil până la:", accountOwner: "Titular", emailLabel: "E-mail", phoneLabel: "Telefon", countryLabel: "Țară", addressLabel: "Adresa de domiciliu", accountAndTransfer: "Cont și transfer", balanceProfile: "Sold", accountType: "Tip cont", accountStatus: "Status", statusActive: "Activ", supportedTransfer: "Transfer acceptat", accountTypeValue: "Profesionist", transferTypeValue: "Clasic", logoutBtn: "Deconectare", blockedTitle: "Cont blocat", blockedDesc: "Contul dvs. a fost blocat.", deletedTitle: "Link indisponibil", deletedDesc: "Acest link nu mai este disponibil." },
  nl: { loginTitle: "Log in op uw account", emailPh: "Uw e-mailadres", pinPh: "Uw toegangscode", loginBtn: "Inloggen", loginErr: "Onjuist e-mailadres of PIN.", greeting: "Hallo", accountActive: "Account actief", personalLabel: "Persoonlijk", availableBalance: "Beschikbaar saldo", detailsBtn: "Details", quickIbanLabel: "Bekijk mijn IBAN", quickIbanSub: "Deel mijn gegevens", quickCardLabel: "Virtuele kaart", quickCardSub: "Beheer mijn kaart", quickTransferLabel: "Overschrijving doen", quickTransferSub: "Geld versturen", seeAllBtn: "Alles bekijken", securityTitle: "Uw veiligheid, onze toewijding", securityDesc: "Beveiligde transacties, 24/7.", learnMoreBtn: "Meer informatie", navPaymentsNew: "Betalingen", notifTitleSuccess: "Succes", notifTitleError: "Fout", notifTitleWarning: "Let op", notifTitleInfo: "Informatie", notifSubSuccess: "Bewerking geslaagd", notifSubError: "Er is een fout opgetreden", notifSubWarning: "Verificatie vereist", notifSubInfo: "Melding", notifOkBtn: "OK", notifConfirmTitle: "Bevestiging", notifActionRequired: "Actie vereist", notifCancelBtn: "Annuleren", notifConfirmBtn: "Bevestigen", msgInvalidLink: "Ongeldige link.", msgAccountSuspended: "Account opgeschort.", msgFillAllFields: "Vul alle velden in.", msgEnterCode: "Voer de code in.", msgCodeIncorrect: "Onjuiste code.", msgClientNotInit: "Klant niet geïnitialiseerd.", msgAccountDeleted: "Account verwijderd.", transferSentTitle: "Overschrijving verzonden", transferSentMsg: "Overschrijving van <b>{amount}</b> verzonden naar <b>{name}</b>.<br>Rekening: <b>{iban}</b>", transferFailedTitle: "Overschrijving mislukt", transferFailedMsg: "Overschrijving van <b>{amount}</b> naar <b>{name}</b> mislukt bij <b>{percent}%</b>.<br>Rekening: <b>{iban}</b>", transferCancelledTitle: "Overschrijving geannuleerd", transferCancelledMsg: "Overschrijving van <b>{amount}</b> naar <b>{name}</b> is geannuleerd.<br>Rekening: <b>{iban}</b>", adminTransfersTitle: "Uitgevoerde overschrijvingen", transferDetailsTitle: "Details overschrijving", txTransferCancelled: "Overschrijving geannuleerd", txInitialDeposit: "Eerste storting", txRefund: "Terugbetaling", copyBtn: "Kopiëren", copied: "Gekopieerd!", transactionHistory: "Transactiegeschiedenis", noTransactions: "Geen geschiedenis.", sendOutgoingTransfer: "Uitgaande overschrijving versturen", transferDetails: "Details overschrijving", amountToDebit: "Af te schrijven bedrag", labelIban: "IBAN / Rekeningnummer", labelSwift: "Bankcode (BIC/SWIFT)", labelBank: "Naam van de bank", labelBeneficiary: "Naam begunstigde", labelReason: "Reden overschrijving", processingWarning: "Uitvoering binnen 1 tot 3 minuten na eindverificatie.", nextBtn: "Volgende", transferAmountLabel: "Bedrag:", ibanLabel: "IBAN/nummer", ibanLabelLine2: "rekening:", swiftLabel: "Bankcode:", bankLabel: "Doelbank:", beneficiaryLabel: "Naam begunstigde:", reasonLabel: "Reden:", cancelTransferBtn: "Overschrijving annuleren", lockText: "Voer de activeringscode in", codeLabel: "Activeringscode", validateTransferBtn: "Overschrijving valideren", processingPageTitle: "Uw overschrijvingsopdracht wordt verwerkt...", processingStatus: "Identiteitsverificatie succesvol.", processingDescLong: "Wacht tot de overschrijving is voltooid.", processingDetailsTitle: "Details van de lopende overschrijving", processingAmountLabel: "Bedrag :", processingBeneficiaryLabel: "Begunstigde :", processingIbanLabel: "IBAN :", processingBankLabel: "Bank :", receiptTitle: "Transactiebewijs", receiptSent: "Overschrijving verzonden", receiptReceived: "Overschrijving ontvangen", receiptAmount: "Bedrag", receiptTo: "Begunstigde", receiptFrom: "Afzender", receiptDate: "Datum", receiptStatus: "Status", receiptStatusDone: "Uitgevoerd", receiptRef: "Referentie", receiptClose: "Sluiten", profileEditBtn: "Bewerken", profileVerified: "Profiel geverifieerd", profilePersonalData: "Persoonlijke gegevens", profilePersonalDataSub: "Uw persoonlijke informatie", profileAccountSub: "Details van uw rekening", profileSecurityDesc: "Uw gegevens zijn beveiligd.", pendingTitle: "Details van de wachtende overschrijving", pendingResultTitle: "Overschrijving wacht op validatie", pendingResultMsg: "Uw overschrijving is geregistreerd en wacht op validatie.", pendingNotifTitle: "Overschrijving in behandeling", pendingNotifMsg: "Uw overschrijving <b>{amount}</b> wordt geverifieerd.", adminPendingCardTitle: "Wachtende overschrijving", adminPendingCardSubtitle: "Activeer de wachtmodus voor de geselecteerde klant.", adminPendingOn: "Geactiveerd", adminPendingOff: "Gedeactiveerd", adminPendingEnableBtn: "Wachtende overschrijving inschakelen", adminPendingDisableBtn: "Wachtende overschrijving uitschakelen", adminPendingSectionTitle: "Wachtende overschrijvingen", adminPendingEmpty: "Geen wachtende overschrijvingen", adminPendingValidateBtn: "Valideren", adminPendingCancelBtn: "Annuleren", adminValidateConfirmTitle: "Overschrijving valideren?", adminValidateConfirmMsg: "Wilt u deze overschrijving valideren?", adminCancelPendingConfirmTitle: "Overschrijving annuleren?", adminCancelPendingConfirmMsg: "Wilt u deze overschrijving annuleren?", pendingValidatedNotifTitle: "Overschrijving gevalideerd", pendingValidatedNotifMsg: "De overschrijving <b>{amount}</b> is gevalideerd.", pendingCancelledNotifTitle: "Overschrijving geannuleerd", pendingCancelledNotifMsg: "De overschrijving <b>{amount}</b> is geannuleerd.", loginFooterProtected: "Uw gegevens zijn beschermd", loginFooterSecure: "100% veilige verbinding", loginFooterSupport: "Ondersteuning voor u", invalidAmountFormat: "Voer het bedrag correct in. Voorbeeld: 3000", amountExceedsBalance: "Het bedrag overschrijdt uw saldo.", modalSuccess: "Overschrijving van {amount} verzonden", modalFailedAt: "Overschrijving {amount} mislukt bij {percent}%", sendTime: "Tijd:", closeBtn: "Sluiten", navBalance: "Start", navCard: "Virtuele kaart", navTransfer: "Betalingen", navAccount: "Profiel", txTransferSent: "Overschrijving verzonden", txTransferReceived: "Overschrijving ontvangen", cardWelcome: "Gefeliciteerd, uw kaart is beschikbaar.", activateCardBtn: "Activeren", blockCardBtn: "Blokkeren", cardTransactions: "Kaarttransacties", validUntil: "Geldig tot:", accountOwner: "Houder", emailLabel: "E-mail", phoneLabel: "Telefoon", countryLabel: "Land", addressLabel: "Woonadres", accountAndTransfer: "Rekening en overschrijving", balanceProfile: "Saldo", accountType: "Type", accountStatus: "Status", statusActive: "Actief", supportedTransfer: "Ondersteund", accountTypeValue: "Professioneel", transferTypeValue: "Klassiek", logoutBtn: "Uitloggen", blockedTitle: "Account geblokkeerd", blockedDesc: "Uw account is geblokkeerd.", deletedTitle: "Link niet beschikbaar", deletedDesc: "Deze link is niet meer beschikbaar." },
  pt: { loginTitle: "Entre na sua conta", emailPh: "O seu endereço de e-mail", pinPh: "O seu código de acesso", loginBtn: "Entrar", loginErr: "E-mail ou PIN incorreto.", greeting: "Olá", accountActive: "Conta ativa", personalLabel: "Pessoal", availableBalance: "Saldo disponível", detailsBtn: "Detalhes", quickIbanLabel: "Ver o meu IBAN", quickIbanSub: "Partilhar os meus dados", quickCardLabel: "Cartão virtual", quickCardSub: "Gerir o meu cartão", quickTransferLabel: "Fazer uma transferência", quickTransferSub: "Enviar dinheiro", seeAllBtn: "Ver tudo", securityTitle: "A sua segurança, o nosso compromisso", securityDesc: "Transações protegidas, 24/7.", learnMoreBtn: "Saber mais", navPaymentsNew: "Pagamentos", notifTitleSuccess: "Sucesso", notifTitleError: "Erro", notifTitleWarning: "Atenção", notifTitleInfo: "Informação", notifSubSuccess: "Operação bem-sucedida", notifSubError: "Ocorreu um erro", notifSubWarning: "Verificação necessária", notifSubInfo: "Notificação", notifOkBtn: "OK", notifConfirmTitle: "Confirmação", notifActionRequired: "Ação necessária", notifCancelBtn: "Cancelar", notifConfirmBtn: "Confirmar", msgInvalidLink: "Ligação inválida.", msgAccountSuspended: "Conta suspensa.", msgFillAllFields: "Preencha todos os campos.", msgEnterCode: "Introduza o código.", msgCodeIncorrect: "Código incorreto.", msgClientNotInit: "Cliente não inicializado.", msgAccountDeleted: "Conta eliminada.", transferSentTitle: "Transferência enviada", transferSentMsg: "Transferência de <b>{amount}</b> enviada para <b>{name}</b>.<br>Conta: <b>{iban}</b>", transferFailedTitle: "Transferência falhada", transferFailedMsg: "Transferência de <b>{amount}</b> para <b>{name}</b> falhou em <b>{percent}%</b>.<br>Conta: <b>{iban}</b>", transferCancelledTitle: "Transferência cancelada", transferCancelledMsg: "Transferência de <b>{amount}</b> para <b>{name}</b> foi cancelada.<br>Conta: <b>{iban}</b>", adminTransfersTitle: "Transferências efetuadas", transferDetailsTitle: "Detalhes da transferência", txTransferCancelled: "Transferência cancelada", txInitialDeposit: "Depósito inicial", txRefund: "Reembolso", copyBtn: "Copiar", copied: "Copiado!", transactionHistory: "Histórico de transações", noTransactions: "Sem histórico.", sendOutgoingTransfer: "Enviar transferência de saída", transferDetails: "Detalhes da transferência", amountToDebit: "Montante a debitar", labelIban: "IBAN / Número de conta", labelSwift: "Código BIC/SWIFT", labelBank: "Nome do banco", labelBeneficiary: "Nome do beneficiário", labelReason: "Motivo da transferência", processingWarning: "Realização em 1 a 3 minutos após verificação final.", nextBtn: "Seguinte", transferAmountLabel: "Montante:", ibanLabel: "IBAN/número", ibanLabelLine2: "conta:", swiftLabel: "Código banco:", bankLabel: "Banco destinatário:", beneficiaryLabel: "Nome do beneficiário:", reasonLabel: "Motivo:", cancelTransferBtn: "Cancelar a transferência", lockText: "Introduza o código de ativação da transferência", codeLabel: "Código de ativação", validateTransferBtn: "Validar a transferência", processingPageTitle: "A sua ordem de transferência em curso...", processingStatus: "Verificação de identidade efetuada.", processingDescLong: "Aguarde a conclusão da transferência.", processingDetailsTitle: "Detalhes da transferência em curso", processingAmountLabel: "Montante :", processingBeneficiaryLabel: "Beneficiário :", processingIbanLabel: "IBAN :", processingBankLabel: "Banco :", receiptTitle: "Recibo da transação", receiptSent: "Transferência enviada", receiptReceived: "Transferência recebida", receiptAmount: "Montante", receiptTo: "Beneficiário", receiptFrom: "Remetente", receiptDate: "Data", receiptStatus: "Estado", receiptStatusDone: "Concluído", receiptRef: "Referência", receiptClose: "Fechar", profileEditBtn: "Editar", profileVerified: "Perfil verificado", profilePersonalData: "Dados pessoais", profilePersonalDataSub: "As suas informações pessoais", profileAccountSub: "Detalhes da sua conta", profileSecurityDesc: "Os seus dados estão protegidos.", pendingTitle: "Detalhes da transferência pendente", pendingResultTitle: "Transferência pendente de validação", pendingResultMsg: "A sua transferência foi registada e aguarda validação.", pendingNotifTitle: "Transferência pendente", pendingNotifMsg: "A sua transferência <b>{amount}</b> está a ser verificada.", adminPendingCardTitle: "Transferência pendente", adminPendingCardSubtitle: "Ative o modo transferência pendente.", adminPendingOn: "Ativado", adminPendingOff: "Desativado", adminPendingEnableBtn: "Ativar transferência pendente", adminPendingDisableBtn: "Desativar transferência pendente", adminPendingSectionTitle: "Transferências pendentes", adminPendingEmpty: "Sem transferências pendentes", adminPendingValidateBtn: "Validar", adminPendingCancelBtn: "Cancelar", adminValidateConfirmTitle: "Validar a transferência?", adminValidateConfirmMsg: "Deseja validar esta transferência?", adminCancelPendingConfirmTitle: "Cancelar a transferência?", adminCancelPendingConfirmMsg: "Deseja cancelar esta transferência?", pendingValidatedNotifTitle: "Transferência validada", pendingValidatedNotifMsg: "A transferência <b>{amount}</b> foi validada.", pendingCancelledNotifTitle: "Transferência cancelada", pendingCancelledNotifMsg: "A transferência <b>{amount}</b> foi cancelada.", loginFooterProtected: "Os seus dados estão protegidos", loginFooterSecure: "Ligação 100% segura", loginFooterSupport: "Assistência ao seu dispor", invalidAmountFormat: "Introduza o montante corretamente. Exemplo: 3000", amountExceedsBalance: "O montante excede o saldo.", modalSuccess: "Transferência de {amount} enviada", modalFailedAt: "Transferência {amount} falhou em {percent}%", sendTime: "Hora:", closeBtn: "Fechar", navBalance: "Início", navCard: "Cartão virtual", navTransfer: "Pagamentos", navAccount: "Perfil", txTransferSent: "Transferência enviada", txTransferReceived: "Transferência recebida", cardWelcome: "Parabéns, o seu cartão está disponível.", activateCardBtn: "Ativar", blockCardBtn: "Bloquear", cardTransactions: "Transações com cartão", validUntil: "Válido até:", accountOwner: "Titular", emailLabel: "E-mail", phoneLabel: "Telefone", countryLabel: "País", addressLabel: "Endereço de residência", accountAndTransfer: "Conta e transferência", balanceProfile: "Saldo", accountType: "Tipo de conta", accountStatus: "Estado", statusActive: "Ativo", supportedTransfer: "Transferência suportada", accountTypeValue: "Profissional", transferTypeValue: "Clássico", logoutBtn: "Terminar sessão", blockedTitle: "Conta bloqueada", blockedDesc: "A sua conta foi bloqueada por motivos de segurança.", deletedTitle: "Ligação indisponível", deletedDesc: "Esta ligação já não está disponível." },
  el: { loginTitle: "Συνδεθείτε στον λογαριασμό σας", emailPh: "Η διεύθυνση email σας", pinPh: "Ο κωδικός πρόσβασής σας", loginBtn: "Σύνδεση", loginErr: "Λανθασμένο email ή PIN.", greeting: "Γεια σας", accountActive: "Ενεργός λογαριασμός", personalLabel: "Προσωπικός", availableBalance: "Διαθέσιμο υπόλοιπο", detailsBtn: "Λεπτομέρειες", quickIbanLabel: "Δείτε το IBAN μου", quickIbanSub: "Μοιραστείτε τα στοιχεία μου", quickCardLabel: "Εικονική κάρτα", quickCardSub: "Διαχείριση κάρτας", quickTransferLabel: "Κάντε μεταφορά", quickTransferSub: "Στείλτε χρήματα", seeAllBtn: "Δείτε όλα", securityTitle: "Η ασφάλειά σας, η δέσμευσή μας", securityDesc: "Προστατευμένες συναλλαγές, 24/7.", learnMoreBtn: "Μάθετε περισσότερα", navPaymentsNew: "Πληρωμές", notifTitleSuccess: "Επιτυχία", notifTitleError: "Σφάλμα", notifTitleWarning: "Προσοχή", notifTitleInfo: "Πληροφορία", notifSubSuccess: "Η ενέργεια ολοκληρώθηκε", notifSubError: "Παρουσιάστηκε σφάλμα", notifSubWarning: "Απαιτείται επαλήθευση", notifSubInfo: "Ειδοποίηση", notifOkBtn: "OK", notifConfirmTitle: "Επιβεβαίωση", notifActionRequired: "Απαιτείται ενέργεια", notifCancelBtn: "Άκυρο", notifConfirmBtn: "Επιβεβαίωση", msgInvalidLink: "Μη έγκυρος σύνδεσμος.", msgAccountSuspended: "Ο λογαριασμός ανεστάλη.", msgFillAllFields: "Συμπληρώστε όλα τα πεδία.", msgEnterCode: "Εισαγάγετε τον κωδικό.", msgCodeIncorrect: "Λανθασμένος κωδικός.", msgClientNotInit: "Ο πελάτης δεν αρχικοποιήθηκε.", msgAccountDeleted: "Ο λογαριασμός διαγράφηκε.", transferSentTitle: "Η μεταφορά στάλθηκε", transferSentMsg: "Μεταφορά <b>{amount}</b> στάλθηκε στον <b>{name}</b>.<br>Λογαριασμός: <b>{iban}</b>", transferFailedTitle: "Η μεταφορά απέτυχε", transferFailedMsg: "Μεταφορά <b>{amount}</b> στον <b>{name}</b> απέτυχε στο <b>{percent}%</b>.<br>Λογαριασμός: <b>{iban}</b>", transferCancelledTitle: "Η μεταφορά ακυρώθηκε", transferCancelledMsg: "Μεταφορά <b>{amount}</b> στον <b>{name}</b> ακυρώθηκε.<br>Λογαριασμός: <b>{iban}</b>", adminTransfersTitle: "Εκτελεσμένες μεταφορές", transferDetailsTitle: "Λεπτομέρειες μεταφοράς", txTransferCancelled: "Μεταφορά ακυρωμένη", txInitialDeposit: "Αρχική κατάθεση", txRefund: "Επιστροφή", copyBtn: "Αντιγραφή", copied: "Αντιγράφηκε!", transactionHistory: "Ιστορικό συναλλαγών", noTransactions: "Χωρίς ιστορικό.", sendOutgoingTransfer: "Αποστολή εξερχόμενης μεταφοράς", transferDetails: "Λεπτομέρειες μεταφοράς", amountToDebit: "Ποσό χρέωσης", labelIban: "IBAN / Αριθμός λογαριασμού", labelSwift: "Κωδικός BIC/SWIFT", labelBank: "Όνομα τράπεζας", labelBeneficiary: "Όνομα δικαιούχου", labelReason: "Αιτιολογία μεταφοράς", processingWarning: "Εκτέλεση εντός 1-3 λεπτών μετά τον τελικό έλεγχο.", nextBtn: "Επόμενο", transferAmountLabel: "Ποσό μεταφοράς:", ibanLabel: "IBAN/αριθμός", ibanLabelLine2: "λογαριασμού:", swiftLabel: "Κωδικός τράπεζας:", bankLabel: "Τράπεζα προορισμού:", beneficiaryLabel: "Όνομα δικαιούχου:", reasonLabel: "Αιτιολογία:", cancelTransferBtn: "Ακύρωση μεταφοράς", lockText: "Εισαγάγετε τον κωδικό ενεργοποίησης", codeLabel: "Κωδικός ενεργοποίησης", validateTransferBtn: "Επικύρωση μεταφοράς", processingPageTitle: "Η εντολή μεταφοράς σας εκτελείται...", processingStatus: "Η επαλήθευση ταυτότητας ολοκληρώθηκε.", processingDescLong: "Παρακαλούμε περιμένετε την ολοκλήρωση της μεταφοράς.", processingDetailsTitle: "Λεπτομέρειες τρέχουσας μεταφοράς", processingAmountLabel: "Ποσό :", processingBeneficiaryLabel: "Δικαιούχος :", processingIbanLabel: "IBAN :", processingBankLabel: "Τράπεζα :", receiptTitle: "Απόδειξη συναλλαγής", receiptSent: "Η μεταφορά στάλθηκε", receiptReceived: "Η μεταφορά ελήφθη", receiptAmount: "Ποσό", receiptTo: "Δικαιούχος", receiptFrom: "Αποστολέας", receiptDate: "Ημερομηνία", receiptStatus: "Κατάσταση", receiptStatusDone: "Ολοκληρώθηκε", receiptRef: "Αναφορά", receiptClose: "Κλείσιμο", profileEditBtn: "Επεξεργασία", profileVerified: "Επαληθευμένο προφίλ", profilePersonalData: "Προσωπικά δεδομένα", profilePersonalDataSub: "Οι προσωπικές σας πληροφορίες", profileAccountSub: "Λεπτομέρειες λογαριασμού", profileSecurityDesc: "Τα δεδομένα σας προστατεύονται.", pendingTitle: "Λεπτομέρειες εκκρεμούς μεταφοράς", pendingResultTitle: "Μεταφορά σε εκκρεμότητα επικύρωσης", pendingResultMsg: "Η μεταφορά σας καταχωρήθηκε και εκκρεμεί επικύρωση.", pendingNotifTitle: "Μεταφορά σε εκκρεμότητα", pendingNotifMsg: "Η μεταφορά <b>{amount}</b> ελέγχεται.", adminPendingCardTitle: "Εκκρεμής μεταφορά", adminPendingCardSubtitle: "Ενεργοποιήστε τη λειτουργία εκκρεμούς μεταφοράς.", adminPendingOn: "Ενεργό", adminPendingOff: "Ανενεργό", adminPendingEnableBtn: "Ενεργοποίηση εκκρεμούς μεταφοράς", adminPendingDisableBtn: "Απενεργοποίηση εκκρεμούς μεταφοράς", adminPendingSectionTitle: "Εκκρεμείς μεταφορές", adminPendingEmpty: "Καμία εκκρεμής μεταφορά", adminPendingValidateBtn: "Επικύρωση", adminPendingCancelBtn: "Ακύρωση", adminValidateConfirmTitle: "Επικύρωση μεταφοράς;", adminValidateConfirmMsg: "Θέλετε να επικυρώσετε αυτή τη μεταφορά;", adminCancelPendingConfirmTitle: "Ακύρωση μεταφοράς;", adminCancelPendingConfirmMsg: "Θέλετε να ακυρώσετε αυτή τη μεταφορά;", pendingValidatedNotifTitle: "Επικυρωμένη μεταφορά", pendingValidatedNotifMsg: "Η μεταφορά <b>{amount}</b> επικυρώθηκε.", pendingCancelledNotifTitle: "Ακυρωμένη μεταφορά", pendingCancelledNotifMsg: "Η μεταφορά <b>{amount}</b> ακυρώθηκε.", loginFooterProtected: "Τα δεδομένα σας προστατεύονται", loginFooterSecure: "100% ασφαλής σύνδεση", loginFooterSupport: "Υποστήριξη στη διάθεσή σας", invalidAmountFormat: "Εισαγάγετε το ποσό σωστά. Παράδειγμα: 3000", amountExceedsBalance: "Το ποσό υπερβαίνει το υπόλοιπο.", modalSuccess: "Μεταφορά {amount} στάλθηκε", modalFailedAt: "Μεταφορά {amount} απέτυχε στο {percent}%", sendTime: "Ώρα:", closeBtn: "Κλείσιμο", navBalance: "Αρχική", navCard: "Εικονική κάρτα", navTransfer: "Πληρωμές", navAccount: "Προφίλ", txTransferSent: "Η μεταφορά στάλθηκε", txTransferReceived: "Η μεταφορά ελήφθη", cardWelcome: "Συγχαρητήρια, η κάρτα είναι διαθέσιμη.", activateCardBtn: "Ενεργοποίηση", blockCardBtn: "Φραγή", cardTransactions: "Συναλλαγές κάρτας", validUntil: "Ισχύει έως:", accountOwner: "Κάτοχος", emailLabel: "Email", phoneLabel: "Τηλέφωνο", countryLabel: "Χώρα", addressLabel: "Διεύθυνση κατοικίας", accountAndTransfer: "Λογαριασμός και μεταφορά", balanceProfile: "Υπόλοιπο", accountType: "Τύπος λογαριασμού", accountStatus: "Κατάσταση", statusActive: "Ενεργός", supportedTransfer: "Υποστηριζόμενη μεταφορά", accountTypeValue: "Επαγγελματικός", transferTypeValue: "Κλασικός", logoutBtn: "Αποσύνδεση", blockedTitle: "Λογαριασμός αποκλεισμένος", blockedDesc: "Ο λογαριασμός σας αποκλείστηκε για λόγους ασφαλείας.", deletedTitle: "Ο σύνδεσμος δεν είναι διαθέσιμος", deletedDesc: "Αυτός ο σύνδεσμος δεν είναι πλέον διαθέσιμος." },
  cs: { loginTitle: "Přihlaste se ke svému účtu", emailPh: "Vaše e-mailová adresa", pinPh: "Váš přístupový kód", loginBtn: "Přihlásit se", loginErr: "Nesprávný e-mail nebo PIN.", greeting: "Dobrý den", accountActive: "Účet aktivní", personalLabel: "Osobní", availableBalance: "Dostupný zůstatek", detailsBtn: "Podrobnosti", quickIbanLabel: "Zobrazit mé IBAN", quickIbanSub: "Sdílet mé údaje", quickCardLabel: "Virtuální karta", quickCardSub: "Spravovat kartu", quickTransferLabel: "Provést převod", quickTransferSub: "Poslat peníze", seeAllBtn: "Zobrazit vše", securityTitle: "Vaše bezpečnost, náš závazek", securityDesc: "Chráněné transakce, 24/7.", learnMoreBtn: "Zjistit více", navPaymentsNew: "Platby", notifTitleSuccess: "Úspěch", notifTitleError: "Chyba", notifTitleWarning: "Pozor", notifTitleInfo: "Informace", notifSubSuccess: "Operace úspěšná", notifSubError: "Došlo k chybě", notifSubWarning: "Vyžadováno ověření", notifSubInfo: "Oznámení", notifOkBtn: "OK", notifConfirmTitle: "Potvrzení", notifActionRequired: "Vyžadována akce", notifCancelBtn: "Zrušit", notifConfirmBtn: "Potvrdit", msgInvalidLink: "Neplatný odkaz.", msgAccountSuspended: "Účet pozastaven.", msgFillAllFields: "Vyplňte prosím všechna pole.", msgEnterCode: "Zadejte kód.", msgCodeIncorrect: "Nesprávný kód.", msgClientNotInit: "Klient neinicializován.", msgAccountDeleted: "Účet smazán.", transferSentTitle: "Převod odeslán", transferSentMsg: "Převod <b>{amount}</b> odeslán na <b>{name}</b>.<br>Účet: <b>{iban}</b>", transferFailedTitle: "Převod selhal", transferFailedMsg: "Převod <b>{amount}</b> na <b>{name}</b> selhal na <b>{percent}%</b>.<br>Účet: <b>{iban}</b>", transferCancelledTitle: "Převod zrušen", transferCancelledMsg: "Převod <b>{amount}</b> na <b>{name}</b> byl zrušen.<br>Účet: <b>{iban}</b>", adminTransfersTitle: "Provedené převody", transferDetailsTitle: "Podrobnosti převodu", txTransferCancelled: "Převod zrušen", txInitialDeposit: "Počáteční vklad", txRefund: "Vrácení", copyBtn: "Kopírovat", copied: "Zkopírováno!", transactionHistory: "Historie transakcí", noTransactions: "Žádná historie.", sendOutgoingTransfer: "Odeslat odchozí převod", transferDetails: "Podrobnosti převodu", amountToDebit: "Částka k zatížení", labelIban: "IBAN / Číslo účtu", labelSwift: "Kód banky (BIC/SWIFT)", labelBank: "Název banky", labelBeneficiary: "Název příjemce", labelReason: "Důvod převodu", processingWarning: "Provedení do 1 až 3 minut po závěrečném ověření.", nextBtn: "Další", transferAmountLabel: "Částka převodu:", ibanLabel: "IBAN/číslo", ibanLabelLine2: "účtu:", swiftLabel: "Kód banky:", bankLabel: "Cílová banka:", beneficiaryLabel: "Název příjemce:", reasonLabel: "Důvod:", cancelTransferBtn: "Zrušit převod", lockText: "Zadejte aktivační kód převodu", codeLabel: "Aktivační kód", validateTransferBtn: "Potvrdit převod", processingPageTitle: "Váš příkaz k převodu se zpracovává...", processingStatus: "Ověření identity úspěšně dokončeno.", processingDescLong: "Počkejte prosím na dokončení převodu.", processingDetailsTitle: "Podrobnosti probíhajícího převodu", processingAmountLabel: "Částka :", processingBeneficiaryLabel: "Příjemce :", processingIbanLabel: "IBAN :", processingBankLabel: "Banka :", receiptTitle: "Potvrzení transakce", receiptSent: "Převod odeslán", receiptReceived: "Převod přijat", receiptAmount: "Částka", receiptTo: "Příjemce", receiptFrom: "Odesílatel", receiptDate: "Datum", receiptStatus: "Stav", receiptStatusDone: "Provedeno", receiptRef: "Reference", receiptClose: "Zavřít", profileEditBtn: "Upravit", profileVerified: "Ověřený profil", profilePersonalData: "Osobní údaje", profilePersonalDataSub: "Vaše osobní informace", profileAccountSub: "Podrobnosti účtu a převodů", profileSecurityDesc: "Vaše data jsou chráněna.", pendingTitle: "Podrobnosti čekajícího převodu", pendingResultTitle: "Převod čeká na schválení", pendingResultMsg: "Váš převod byl zaregistrován a čeká na schválení.", pendingNotifTitle: "Převod čeká", pendingNotifMsg: "Váš převod <b>{amount}</b> se ověřuje.", adminPendingCardTitle: "Čekající převod", adminPendingCardSubtitle: "Aktivujte režim čekajícího převodu.", adminPendingOn: "Aktivní", adminPendingOff: "Neaktivní", adminPendingEnableBtn: "Aktivovat čekající převod", adminPendingDisableBtn: "Deaktivovat čekající převod", adminPendingSectionTitle: "Čekající převody", adminPendingEmpty: "Žádné čekající převody", adminPendingValidateBtn: "Schválit", adminPendingCancelBtn: "Zrušit", adminValidateConfirmTitle: "Schválit převod?", adminValidateConfirmMsg: "Chcete schválit tento převod?", adminCancelPendingConfirmTitle: "Zrušit převod?", adminCancelPendingConfirmMsg: "Chcete zrušit tento převod?", pendingValidatedNotifTitle: "Převod schválen", pendingValidatedNotifMsg: "Převod <b>{amount}</b> byl schválen.", pendingCancelledNotifTitle: "Převod zrušen", pendingCancelledNotifMsg: "Převod <b>{amount}</b> byl zrušen.", loginFooterProtected: "Vaše data jsou chráněna", loginFooterSecure: "100% bezpečné připojení", loginFooterSupport: "Podpora pro vás", invalidAmountFormat: "Zadejte částku správně. Příklad: 3000", amountExceedsBalance: "Částka převyšuje zůstatek.", modalSuccess: "Převod {amount} odeslán", modalFailedAt: "Převod {amount} selhal na {percent}%", sendTime: "Čas:", closeBtn: "Zavřít", navBalance: "Domů", navCard: "Virtuální karta", navTransfer: "Platby", navAccount: "Profil", txTransferSent: "Převod odeslán", txTransferReceived: "Převod přijat", cardWelcome: "Gratulujeme, karta je k dispozici.", activateCardBtn: "Aktivovat", blockCardBtn: "Blokovat", cardTransactions: "Transakce kartou", validUntil: "Platná do:", accountOwner: "Držitel", emailLabel: "E-mail", phoneLabel: "Telefon", countryLabel: "Země", addressLabel: "Adresa bydliště", accountAndTransfer: "Účet a převod", balanceProfile: "Zůstatek", accountType: "Typ účtu", accountStatus: "Stav", statusActive: "Aktivní", supportedTransfer: "Podporovaný převod", accountTypeValue: "Profesionální", transferTypeValue: "Klasický", logoutBtn: "Odhlásit se", blockedTitle: "Účet zablokován", blockedDesc: "Váš účet byl zablokován z bezpečnostních důvodů.", deletedTitle: "Odkaz není k dispozici", deletedDesc: "Tento odkaz již není k dispozici." },
  hu: { loginTitle: "Jelentkezzen be fiókjába", emailPh: "Az Ön e-mail címe", pinPh: "Az Ön hozzáférési kódja", loginBtn: "Bejelentkezés", loginErr: "Hibás e-mail vagy PIN.", greeting: "Üdvözöljük", accountActive: "Aktív fiók", personalLabel: "Személyes", availableBalance: "Elérhető egyenleg", detailsBtn: "Részletek", quickIbanLabel: "IBAN megtekintése", quickIbanSub: "Adataim megosztása", quickCardLabel: "Virtuális kártya", quickCardSub: "Kártya kezelése", quickTransferLabel: "Utalás végrehajtása", quickTransferSub: "Pénz küldése", seeAllBtn: "Összes megtekintése", securityTitle: "Az Ön biztonsága, a mi elkötelezettségünk", securityDesc: "Védett tranzakciók, 24/7.", learnMoreBtn: "Tudjon meg többet", navPaymentsNew: "Fizetések", notifTitleSuccess: "Sikeres", notifTitleError: "Hiba", notifTitleWarning: "Figyelem", notifTitleInfo: "Információ", notifSubSuccess: "Sikeres művelet", notifSubError: "Hiba történt", notifSubWarning: "Ellenőrzés szükséges", notifSubInfo: "Értesítés", notifOkBtn: "OK", notifConfirmTitle: "Megerősítés", notifActionRequired: "Művelet szükséges", notifCancelBtn: "Mégse", notifConfirmBtn: "Megerősítés", msgInvalidLink: "Érvénytelen link.", msgAccountSuspended: "Fiók felfüggesztve.", msgFillAllFields: "Kérjük, töltse ki az összes mezőt.", msgEnterCode: "Adja meg a kódot.", msgCodeIncorrect: "Hibás kód.", msgClientNotInit: "Ügyfél nincs inicializálva.", msgAccountDeleted: "Fiók törölve.", transferSentTitle: "Utalás elküldve", transferSentMsg: "<b>{amount}</b> utalás elküldve: <b>{name}</b>.<br>Fiók: <b>{iban}</b>", transferFailedTitle: "Utalás sikertelen", transferFailedMsg: "<b>{amount}</b> utalás <b>{name}</b> részére sikertelen <b>{percent}%</b>-nál.<br>Fiók: <b>{iban}</b>", transferCancelledTitle: "Utalás törölve", transferCancelledMsg: "<b>{amount}</b> utalás <b>{name}</b> részére törölve.<br>Fiók: <b>{iban}</b>", adminTransfersTitle: "Végrehajtott utalások", transferDetailsTitle: "Utalás részletei", txTransferCancelled: "Utalás törölve", txInitialDeposit: "Kezdeti befizetés", txRefund: "Visszatérítés", copyBtn: "Másolás", copied: "Másolva!", transactionHistory: "Tranzakció előzmények", noTransactions: "Nincs előzmény.", sendOutgoingTransfer: "Kimenő utalás küldése", transferDetails: "Utalás részletei", amountToDebit: "Terhelendő összeg", labelIban: "IBAN / Számlaszám", labelSwift: "Bankkód (BIC/SWIFT)", labelBank: "Bank neve", labelBeneficiary: "Kedvezményezett neve", labelReason: "Utalás oka", processingWarning: "Végrehajtás 1-3 percen belül a végső ellenőrzés után.", nextBtn: "Következő", transferAmountLabel: "Utalás összege:", ibanLabel: "IBAN/szám", ibanLabelLine2: "számla:", swiftLabel: "Bankkód:", bankLabel: "Célbank:", beneficiaryLabel: "Kedvezményezett:", reasonLabel: "Ok:", cancelTransferBtn: "Utalás törlése", lockText: "Adja meg az utalás aktiválási kódját", codeLabel: "Aktiválási kód", validateTransferBtn: "Utalás jóváhagyása", processingPageTitle: "Utalási megbízása feldolgozás alatt...", processingStatus: "Személyazonosság ellenőrzése sikeres.", processingDescLong: "Kérjük, várja meg az utalás befejezését.", processingDetailsTitle: "Folyamatban lévő utalás részletei", processingAmountLabel: "Összeg :", processingBeneficiaryLabel: "Kedvezményezett :", processingIbanLabel: "IBAN :", processingBankLabel: "Bank :", receiptTitle: "Tranzakciós bizonylat", receiptSent: "Utalás elküldve", receiptReceived: "Utalás fogadva", receiptAmount: "Összeg", receiptTo: "Kedvezményezett", receiptFrom: "Feladó", receiptDate: "Dátum", receiptStatus: "Állapot", receiptStatusDone: "Teljesítve", receiptRef: "Hivatkozás", receiptClose: "Bezárás", profileEditBtn: "Szerkesztés", profileVerified: "Ellenőrzött profil", profilePersonalData: "Személyes adatok", profilePersonalDataSub: "Személyes információi", profileAccountSub: "Fiók és utalás részletei", profileSecurityDesc: "Adatai védettek.", pendingTitle: "Függőben lévő utalás részletei", pendingResultTitle: "Utalás jóváhagyásra vár", pendingResultMsg: "Utalása rögzítve, jóváhagyásra vár.", pendingNotifTitle: "Függőben lévő utalás", pendingNotifMsg: "A <b>{amount}</b> utalás ellenőrzés alatt.", adminPendingCardTitle: "Függőben lévő utalás", adminPendingCardSubtitle: "Aktiválja a függőben lévő utalás módot.", adminPendingOn: "Aktív", adminPendingOff: "Inaktív", adminPendingEnableBtn: "Függő utalás engedélyezése", adminPendingDisableBtn: "Függő utalás letiltása", adminPendingSectionTitle: "Függőben lévő utalások", adminPendingEmpty: "Nincs függőben lévő utalás", adminPendingValidateBtn: "Jóváhagyás", adminPendingCancelBtn: "Törlés", adminValidateConfirmTitle: "Jóváhagyja az utalást?", adminValidateConfirmMsg: "Biztosan jóváhagyja ezt az utalást?", adminCancelPendingConfirmTitle: "Törli az utalást?", adminCancelPendingConfirmMsg: "Biztosan törli ezt az utalást?", pendingValidatedNotifTitle: "Utalás jóváhagyva", pendingValidatedNotifMsg: "A <b>{amount}</b> utalás jóváhagyva.", pendingCancelledNotifTitle: "Utalás törölve", pendingCancelledNotifMsg: "A <b>{amount}</b> utalás törölve.", loginFooterProtected: "Adatai védettek", loginFooterSecure: "100% biztonságos kapcsolat", loginFooterSupport: "Ügyfélszolgálat Önért", invalidAmountFormat: "Adja meg helyesen az összeget. Példa: 3000", amountExceedsBalance: "Az összeg meghaladja az egyenleget.", modalSuccess: "{amount} utalás elküldve", modalFailedAt: "{amount} utalás sikertelen {percent}%-nál", sendTime: "Idő:", closeBtn: "Bezárás", navBalance: "Kezdőlap", navCard: "Virtuális kártya", navTransfer: "Fizetések", navAccount: "Profil", txTransferSent: "Utalás elküldve", txTransferReceived: "Utalás fogadva", cardWelcome: "Gratulálunk, a kártya elérhető.", activateCardBtn: "Aktiválás", blockCardBtn: "Blokkolás", cardTransactions: "Kártyatranzakciók", validUntil: "Érvényes eddig:", accountOwner: "Tulajdonos", emailLabel: "E-mail", phoneLabel: "Telefon", countryLabel: "Ország", addressLabel: "Lakcím", accountAndTransfer: "Fiók és utalás", balanceProfile: "Egyenleg", accountType: "Fiók típusa", accountStatus: "Állapot", statusActive: "Aktív", supportedTransfer: "Támogatott utalás", accountTypeValue: "Professzionális", transferTypeValue: "Klasszikus", logoutBtn: "Kijelentkezés", blockedTitle: "Fiók blokkolva", blockedDesc: "Fiókját biztonsági okokból blokkoltuk.", deletedTitle: "A link nem elérhető", deletedDesc: "Ez a link már nem elérhető." },
  sv: { loginTitle: "Logga in på ditt konto", emailPh: "Din e-postadress", pinPh: "Din åtkomstkod", loginBtn: "Logga in", loginErr: "Felaktig e-post eller PIN.", greeting: "Hej", accountActive: "Konto aktivt", personalLabel: "Personlig", availableBalance: "Tillgängligt saldo", detailsBtn: "Detaljer", quickIbanLabel: "Visa mitt IBAN", quickIbanSub: "Dela mina uppgifter", quickCardLabel: "Virtuellt kort", quickCardSub: "Hantera mitt kort", quickTransferLabel: "Gör en överföring", quickTransferSub: "Skicka pengar", seeAllBtn: "Visa alla", securityTitle: "Din säkerhet, vårt åtagande", securityDesc: "Skyddade transaktioner, 24/7.", learnMoreBtn: "Läs mer", navPaymentsNew: "Betalningar", notifTitleSuccess: "Framgång", notifTitleError: "Fel", notifTitleWarning: "Varning", notifTitleInfo: "Information", notifSubSuccess: "Åtgärden lyckades", notifSubError: "Ett fel uppstod", notifSubWarning: "Verifiering krävs", notifSubInfo: "Avisering", notifOkBtn: "OK", notifConfirmTitle: "Bekräftelse", notifActionRequired: "Åtgärd krävs", notifCancelBtn: "Avbryt", notifConfirmBtn: "Bekräfta", msgInvalidLink: "Ogiltig länk.", msgAccountSuspended: "Konto avstängt.", msgFillAllFields: "Fyll i alla fält.", msgEnterCode: "Ange koden.", msgCodeIncorrect: "Felaktig kod.", msgClientNotInit: "Klienten är inte initierad.", msgAccountDeleted: "Konto borttaget.", transferSentTitle: "Överföring skickad", transferSentMsg: "Överföring av <b>{amount}</b> skickad till <b>{name}</b>.<br>Konto: <b>{iban}</b>", transferFailedTitle: "Överföring misslyckades", transferFailedMsg: "Överföring av <b>{amount}</b> till <b>{name}</b> misslyckades vid <b>{percent}%</b>.<br>Konto: <b>{iban}</b>", transferCancelledTitle: "Överföring avbruten", transferCancelledMsg: "Överföring av <b>{amount}</b> till <b>{name}</b> avbröts.<br>Konto: <b>{iban}</b>", adminTransfersTitle: "Utförda överföringar", transferDetailsTitle: "Detaljer för överföring", txTransferCancelled: "Överföring avbruten", txInitialDeposit: "Första insättning", txRefund: "Återbetalning", copyBtn: "Kopiera", copied: "Kopierat!", transactionHistory: "Transaktionshistorik", noTransactions: "Ingen historik.", sendOutgoingTransfer: "Skicka utgående överföring", transferDetails: "Detaljer för överföring", amountToDebit: "Belopp att debitera", labelIban: "IBAN / Kontonummer", labelSwift: "Bankkod (BIC/SWIFT)", labelBank: "Bankens namn", labelBeneficiary: "Mottagarens namn", labelReason: "Anledning till överföring", processingWarning: "Genomförande inom 1 till 3 minuter efter slutlig verifiering.", nextBtn: "Nästa", transferAmountLabel: "Belopp:", ibanLabel: "IBAN/nummer", ibanLabelLine2: "konto:", swiftLabel: "Bankkod:", bankLabel: "Mottagarbank:", beneficiaryLabel: "Mottagarens namn:", reasonLabel: "Anledning:", cancelTransferBtn: "Avbryt överföringen", lockText: "Ange aktiveringskoden för överföringen", codeLabel: "Aktiveringskod", validateTransferBtn: "Validera överföringen", processingPageTitle: "Din överföringsorder behandlas...", processingStatus: "Identitetsverifiering slutförd.", processingDescLong: "Vänta tills överföringen är klar.", processingDetailsTitle: "Detaljer för pågående överföring", processingAmountLabel: "Belopp :", processingBeneficiaryLabel: "Mottagare :", processingIbanLabel: "IBAN :", processingBankLabel: "Bank :", receiptTitle: "Transaktionskvitto", receiptSent: "Överföring skickad", receiptReceived: "Överföring mottagen", receiptAmount: "Belopp", receiptTo: "Mottagare", receiptFrom: "Avsändare", receiptDate: "Datum", receiptStatus: "Status", receiptStatusDone: "Genomförd", receiptRef: "Referens", receiptClose: "Stäng", profileEditBtn: "Redigera", profileVerified: "Verifierad profil", profilePersonalData: "Personuppgifter", profilePersonalDataSub: "Din personliga information", profileAccountSub: "Kontodetaljer och överföringar", profileSecurityDesc: "Dina uppgifter är skyddade.", pendingTitle: "Detaljer för väntande överföring", pendingResultTitle: "Överföring väntar på validering", pendingResultMsg: "Din överföring har registrerats och väntar på validering.", pendingNotifTitle: "Väntande överföring", pendingNotifMsg: "Din överföring <b>{amount}</b> verifieras.", adminPendingCardTitle: "Väntande överföring", adminPendingCardSubtitle: "Aktivera vänteläget för vald klient.", adminPendingOn: "Aktiverad", adminPendingOff: "Inaktiverad", adminPendingEnableBtn: "Aktivera väntande överföring", adminPendingDisableBtn: "Inaktivera väntande överföring", adminPendingSectionTitle: "Väntande överföringar", adminPendingEmpty: "Inga väntande överföringar", adminPendingValidateBtn: "Validera", adminPendingCancelBtn: "Avbryt", adminValidateConfirmTitle: "Validera överföringen?", adminValidateConfirmMsg: "Vill du validera denna överföring?", adminCancelPendingConfirmTitle: "Avbryt överföringen?", adminCancelPendingConfirmMsg: "Vill du avbryta denna överföring?", pendingValidatedNotifTitle: "Överföring validerad", pendingValidatedNotifMsg: "Överföringen <b>{amount}</b> har validerats.", pendingCancelledNotifTitle: "Överföring avbruten", pendingCancelledNotifMsg: "Överföringen <b>{amount}</b> har avbrutits.", loginFooterProtected: "Dina uppgifter är skyddade", loginFooterSecure: "100% säker anslutning", loginFooterSupport: "Support för dig", invalidAmountFormat: "Ange beloppet korrekt. Exempel: 3000", amountExceedsBalance: "Beloppet överstiger saldot.", modalSuccess: "Överföring av {amount} skickad", modalFailedAt: "Överföring {amount} misslyckades vid {percent}%", sendTime: "Tid:", closeBtn: "Stäng", navBalance: "Hem", navCard: "Virtuellt kort", navTransfer: "Betalningar", navAccount: "Profil", txTransferSent: "Överföring skickad", txTransferReceived: "Överföring mottagen", cardWelcome: "Grattis, ditt kort är tillgängligt.", activateCardBtn: "Aktivera", blockCardBtn: "Blockera", cardTransactions: "Korttransaktioner", validUntil: "Giltigt till:", accountOwner: "Innehavare", emailLabel: "E-post", phoneLabel: "Telefon", countryLabel: "Land", addressLabel: "Hemadress", accountAndTransfer: "Konto och överföring", balanceProfile: "Saldo", accountType: "Kontotyp", accountStatus: "Status", statusActive: "Aktiv", supportedTransfer: "Stöd överföring", accountTypeValue: "Professionell", transferTypeValue: "Klassisk", logoutBtn: "Logga ut", blockedTitle: "Konto blockerat", blockedDesc: "Ditt konto har blockerats av säkerhetsskäl.", deletedTitle: "Länken är inte tillgänglig", deletedDesc: "Denna länk är inte längre tillgänglig." },
  ar: { loginTitle: "تسجيل الدخول إلى حسابك", emailPh: "عنوان بريدك الإلكتروني", pinPh: "رمز الدخول الخاص بك", loginBtn: "تسجيل الدخول", loginErr: "البريد الإلكتروني أو رمز PIN غير صحيح.", greeting: "مرحباً", accountActive: "حساب نشط", personalLabel: "شخصي", availableBalance: "الرصيد المتاح", detailsBtn: "التفاصيل", quickIbanLabel: "عرض IBAN الخاص بي", quickIbanSub: "مشاركة بياناتي", quickCardLabel: "بطاقة افتراضية", quickCardSub: "إدارة بطاقتي", quickTransferLabel: "إجراء تحويل", quickTransferSub: "إرسال الأموال", seeAllBtn: "عرض الكل", securityTitle: "أمنك، التزامنا", securityDesc: "معاملات محمية، على مدار الساعة.", learnMoreBtn: "اعرف المزيد", navPaymentsNew: "المدفوعات", notifTitleSuccess: "نجاح", notifTitleError: "خطأ", notifTitleWarning: "تنبيه", notifTitleInfo: "معلومة", notifSubSuccess: "تمت العملية بنجاح", notifSubError: "حدث خطأ", notifSubWarning: "التحقق مطلوب", notifSubInfo: "إشعار", notifOkBtn: "حسناً", notifConfirmTitle: "تأكيد", notifActionRequired: "إجراء مطلوب", notifCancelBtn: "إلغاء", notifConfirmBtn: "تأكيد", msgInvalidLink: "رابط غير صالح.", msgAccountSuspended: "الحساب معلق.", msgFillAllFields: "يرجى ملء جميع الحقول.", msgEnterCode: "يرجى إدخال الرمز.", msgCodeIncorrect: "الرمز غير صحيح.", msgClientNotInit: "العميل غير مُهيأ.", msgAccountDeleted: "تم حذف الحساب.", transferSentTitle: "تم إرسال التحويل", transferSentMsg: "تم إرسال تحويل بمبلغ <b>{amount}</b> إلى <b>{name}</b>.<br>الحساب: <b>{iban}</b>", transferFailedTitle: "فشل التحويل", transferFailedMsg: "فشل تحويل بمبلغ <b>{amount}</b> إلى <b>{name}</b> عند <b>{percent}%</b>.<br>الحساب: <b>{iban}</b>", transferCancelledTitle: "تم إلغاء التحويل", transferCancelledMsg: "تم إلغاء تحويل بمبلغ <b>{amount}</b> إلى <b>{name}</b>.<br>الحساب: <b>{iban}</b>", adminTransfersTitle: "التحويلات المنفذة", transferDetailsTitle: "تفاصيل التحويل", txTransferCancelled: "تم إلغاء التحويل", txInitialDeposit: "الإيداع الأولي", txRefund: "استرداد", copyBtn: "نسخ", copied: "تم النسخ!", transactionHistory: "سجل المعاملات", noTransactions: "لا يوجد سجل.", sendOutgoingTransfer: "إرسال تحويل صادر", transferDetails: "تفاصيل التحويل", amountToDebit: "المبلغ المخصوم", labelIban: "IBAN / رقم الحساب", labelSwift: "رمز البنك (BIC/SWIFT)", labelBank: "اسم البنك", labelBeneficiary: "اسم المستفيد", labelReason: "سبب التحويل", processingWarning: "التنفيذ خلال 1 إلى 3 دقائق بعد التحقق النهائي.", nextBtn: "التالي", transferAmountLabel: "مبلغ التحويل:", ibanLabel: "IBAN/رقم", ibanLabelLine2: "الحساب:", swiftLabel: "رمز البنك:", bankLabel: "البنك المستلم:", beneficiaryLabel: "اسم المستفيد:", reasonLabel: "السبب:", cancelTransferBtn: "إلغاء التحويل", lockText: "أدخل رمز تفعيل التحويل", codeLabel: "رمز التفعيل", validateTransferBtn: "تأكيد التحويل", processingPageTitle: "طلب التحويل الخاص بك قيد المعالجة...", processingStatus: "تم التحقق من الهوية بنجاح.", processingDescLong: "يرجى الانتظار حتى انتهاء التحويل.", processingDetailsTitle: "تفاصيل التحويل الجاري", processingAmountLabel: "المبلغ :", processingBeneficiaryLabel: "المستفيد :", processingIbanLabel: "IBAN :", processingBankLabel: "البنك :", receiptTitle: "إيصال المعاملة", receiptSent: "تم إرسال التحويل", receiptReceived: "تم استلام التحويل", receiptAmount: "المبلغ", receiptTo: "المستفيد", receiptFrom: "المُرسل", receiptDate: "التاريخ", receiptStatus: "الحالة", receiptStatusDone: "تم التنفيذ", receiptRef: "المرجع", receiptClose: "إغلاق", profileEditBtn: "تعديل", profileVerified: "الملف موثق", profilePersonalData: "البيانات الشخصية", profilePersonalDataSub: "معلوماتك الشخصية", profileAccountSub: "تفاصيل حسابك وتحويلاتك", profileSecurityDesc: "بياناتك محمية بتشفير عالي الأمان.", pendingTitle: "تفاصيل التحويل المعلق", pendingResultTitle: "التحويل في انتظار الموافقة", pendingResultMsg: "تم تسجيل تحويلك وهو في انتظار الموافقة.", pendingNotifTitle: "تحويل معلق", pendingNotifMsg: "تحويلك <b>{amount}</b> قيد التحقق.", adminPendingCardTitle: "تحويل معلق", adminPendingCardSubtitle: "فعّل وضع التحويل المعلق للعميل المحدد.", adminPendingOn: "مُفعّل", adminPendingOff: "مُعطّل", adminPendingEnableBtn: "تفعيل التحويل المعلق", adminPendingDisableBtn: "تعطيل التحويل المعلق", adminPendingSectionTitle: "التحويلات المعلقة", adminPendingEmpty: "لا توجد تحويلات معلقة", adminPendingValidateBtn: "موافقة", adminPendingCancelBtn: "إلغاء", adminValidateConfirmTitle: "الموافقة على التحويل؟", adminValidateConfirmMsg: "هل تريد فعلاً الموافقة على هذا التحويل؟", adminCancelPendingConfirmTitle: "إلغاء التحويل؟", adminCancelPendingConfirmMsg: "هل تريد فعلاً إلغاء هذا التحويل؟", pendingValidatedNotifTitle: "تمت الموافقة", pendingValidatedNotifMsg: "تمت الموافقة على التحويل <b>{amount}</b>.", pendingCancelledNotifTitle: "تم الإلغاء", pendingCancelledNotifMsg: "تم إلغاء التحويل <b>{amount}</b>.", loginFooterProtected: "بياناتك محمية", loginFooterSecure: "اتصال آمن 100%", loginFooterSupport: "الدعم في خدمتك", invalidAmountFormat: "يرجى إدخال المبلغ بالتنسيق الصحيح. مثال: 3000", amountExceedsBalance: "المبلغ يتجاوز رصيدك.", modalSuccess: "تم إرسال تحويل {amount}", modalFailedAt: "فشل التحويل {amount} عند {percent}%", sendTime: "وقت الإرسال:", closeBtn: "إغلاق", navBalance: "الرئيسية", navCard: "بطاقة افتراضية", navTransfer: "المدفوعات", navAccount: "الملف", txTransferSent: "تم إرسال التحويل", txTransferReceived: "تم استلام التحويل", cardWelcome: "تهانينا، بطاقتك متوفرة.", activateCardBtn: "تفعيل بطاقتي", blockCardBtn: "حظر بطاقتي", cardTransactions: "معاملات البطاقة", validUntil: "صالحة حتى:", accountOwner: "صاحب الحساب", emailLabel: "البريد الإلكتروني", phoneLabel: "الهاتف", countryLabel: "الدولة", addressLabel: "عنوان الإقامة", accountAndTransfer: "الحساب والتحويل", balanceProfile: "الرصيد", accountType: "نوع الحساب", accountStatus: "الحالة", statusActive: "نشط", supportedTransfer: "التحويل مدعوم", accountTypeValue: "احترافي", transferTypeValue: "كلاسيكي", logoutBtn: "تسجيل الخروج", blockedTitle: "الحساب محظور", blockedDesc: "تم حظر حسابك لأسباب أمنية.", deletedTitle: "الرابط غير متوفر", deletedDesc: "هذا الرابط لم يعد متوفراً." }
};

const ibanLabels = {
  pl: { title: "Dane konta", numberLabel: "Numer IBAN", ownerLabel: "Właściciel", bicLabel: "BIC / SWIFT", warning: "Ze względów bezpieczeństwa niektóre znaki IBAN zostały zamaskowane." },
  fr: { title: "Détails du compte", numberLabel: "Numéro IBAN", ownerLabel: "Titulaire", bicLabel: "BIC / SWIFT", warning: "Pour des raisons de sécurité, certains caractères de l'IBAN ont été masqués." },
  es: { title: "Detalles de la cuenta", numberLabel: "Número IBAN", ownerLabel: "Titular", bicLabel: "BIC / SWIFT", warning: "Por razones de seguridad, algunos caracteres del IBAN han sido enmascarados." },
  it: { title: "Dettagli del conto", numberLabel: "Numero IBAN", ownerLabel: "Titolare", bicLabel: "BIC / SWIFT", warning: "Per motivi di sicurezza, alcuni caratteri dell'IBAN sono stati mascherati." },
  de: { title: "Kontodetails", numberLabel: "IBAN-Nummer", ownerLabel: "Inhaber", bicLabel: "BIC / SWIFT", warning: "Aus Sicherheitsgründen wurden einige IBAN-Zeichen maskiert." },
  he: { title: "פרטי החשבון", numberLabel: "מספר IBAN", ownerLabel: "בעל החשבון", bicLabel: "BIC / SWIFT", warning: "מטעמי אבטחה, חלק מהתווים ב-IBAN הוסתרו." },
  hr: { title: "Detalji računa", numberLabel: "IBAN broj", ownerLabel: "Vlasnik", bicLabel: "BIC / SWIFT", warning: "Iz sigurnosnih razloga neki znakovi IBAN-a su maskirani." },
  ro: { title: "Detalii cont", numberLabel: "Număr IBAN", ownerLabel: "Titular", bicLabel: "BIC / SWIFT", warning: "Din motive de securitate, unele caractere IBAN au fost mascate." },
  nl: { title: "Rekeninggegevens", numberLabel: "IBAN-nummer", ownerLabel: "Houder", bicLabel: "BIC / SWIFT", warning: "Om veiligheidsredenen zijn sommige IBAN-tekens gemaskeerd." },
  pt: { title: "Detalhes da conta", numberLabel: "Número IBAN", ownerLabel: "Titular", bicLabel: "BIC / SWIFT", warning: "Por razões de segurança, alguns caracteres do IBAN foram mascarados." },
  el: { title: "Στοιχεία λογαριασμού", numberLabel: "Αριθμός IBAN", ownerLabel: "Κάτοχος", bicLabel: "BIC / SWIFT", warning: "Για λόγους ασφαλείας, ορισμένοι χαρακτήρες του IBAN έχουν αποκρυφθεί." },
  cs: { title: "Podrobnosti účtu", numberLabel: "Číslo IBAN", ownerLabel: "Držitel", bicLabel: "BIC / SWIFT", warning: "Z bezpečnostních důvodů byly některé znaky IBAN maskovány." },
  hu: { title: "Számla részletei", numberLabel: "IBAN szám", ownerLabel: "Tulajdonos", bicLabel: "BIC / SWIFT", warning: "Biztonsági okokból az IBAN egyes karakterei maszkolva vannak." },
  sv: { title: "Kontodetaljer", numberLabel: "IBAN-nummer", ownerLabel: "Innehavare", bicLabel: "BIC / SWIFT", warning: "Av säkerhetsskäl har vissa IBAN-tecken maskerats." },
  ar: { title: "تفاصيل الحساب", numberLabel: "رقم IBAN", ownerLabel: "صاحب الحساب", bicLabel: "BIC / SWIFT", warning: "لأسباب أمنية، تم إخفاء بعض أحرف IBAN." }
};

const cardLabels = {
  pl: { title: "Karta wirtualna", holderLabel: "Posiadacz", expiryLabel: "Ważna do", cvvLabel: "CVV", numberLabel: "Numer karty", typeLabel: "Typ", copyBtn: "Kopiuj numer", showBtn: "Pokaż", hideBtn: "Ukryj", warningMasked: "Ostatnie 4 cyfry są ukryte przez administratora.", warningCvvMasked: "CVV jest ukryty przez administratora.", warningFull: "Karta w pełni widoczna.", warningAdminMasked: "Ostatnie 4 cyfry i CVV są ukryte przez administratora." },
  fr: { title: "Carte virtuelle", holderLabel: "Titulaire", expiryLabel: "Valable jusqu'au", cvvLabel: "CVV", numberLabel: "Numéro de carte", typeLabel: "Type", copyBtn: "Copier le numéro", showBtn: "Afficher", hideBtn: "Masquer", warningMasked: "Les 4 derniers chiffres sont masqués par l'administrateur.", warningCvvMasked: "Le CVV est masqué par l'administrateur.", warningFull: "Carte complètement visible.", warningAdminMasked: "Les 4 derniers chiffres et le CVV sont masqués par l'administrateur." },
  es: { title: "Tarjeta virtual", holderLabel: "Titular", expiryLabel: "Válida hasta", cvvLabel: "CVV", numberLabel: "Número de tarjeta", typeLabel: "Tipo", copyBtn: "Copiar número", showBtn: "Mostrar", hideBtn: "Ocultar", warningMasked: "Los últimos 4 dígitos están ocultos por el administrador.", warningCvvMasked: "El CVV está oculto por el administrador.", warningFull: "Tarjeta completamente visible.", warningAdminMasked: "Los últimos 4 dígitos y el CVV están ocultos por el administrador." },
  it: { title: "Carta virtuale", holderLabel: "Titolare", expiryLabel: "Valida fino al", cvvLabel: "CVV", numberLabel: "Numero carta", typeLabel: "Tipo", copyBtn: "Copia numero", showBtn: "Mostra", hideBtn: "Nascondi", warningMasked: "Le ultime 4 cifre sono nascoste dall'amministratore.", warningCvvMasked: "Il CVV è nascosto dall'amministratore.", warningFull: "Carta completamente visibile.", warningAdminMasked: "Le ultime 4 cifre e il CVV sono nascosti dall'amministratore." },
  de: { title: "Virtuelle Karte", holderLabel: "Inhaber", expiryLabel: "Gültig bis", cvvLabel: "CVV", numberLabel: "Kartennummer", typeLabel: "Typ", copyBtn: "Nummer kopieren", showBtn: "Anzeigen", hideBtn: "Verbergen", warningMasked: "Die letzten 4 Ziffern sind vom Administrator ausgeblendet.", warningCvvMasked: "CVV ist vom Administrator ausgeblendet.", warningFull: "Karte vollständig sichtbar.", warningAdminMasked: "Die letzten 4 Ziffern und der CVV sind vom Administrator ausgeblendet." },
  he: { title: "כרטיס וירטואלי", holderLabel: "בעל הכרטיס", expiryLabel: "בתוקף עד", cvvLabel: "CVV", numberLabel: "מספר כרטיס", typeLabel: "סוג", copyBtn: "העתק מספר", showBtn: "הצג", hideBtn: "הסתר", warningMasked: "4 הספרות האחרונות מוסתרות על ידי המנהל.", warningCvvMasked: "ה-CVV מוסתר על ידי המנהל.", warningFull: "הכרטיס גלוי לחלוטין.", warningAdminMasked: "4 הספרות האחרונות וה-CVV מוסתרים על ידי המנהל." },
  hr: { title: "Virtualna kartica", holderLabel: "Vlasnik", expiryLabel: "Vrijedi do", cvvLabel: "CVV", numberLabel: "Broj kartice", typeLabel: "Vrsta", copyBtn: "Kopiraj broj", showBtn: "Prikaži", hideBtn: "Sakrij", warningMasked: "Posljednje 4 znamenke skrivene su od strane administratora.", warningCvvMasked: "CVV je skriven od strane administratora.", warningFull: "Kartica potpuno vidljiva.", warningAdminMasked: "Posljednje 4 znamenke i CVV su skriveni od strane administratora." },
  ro: { title: "Card virtual", holderLabel: "Titular", expiryLabel: "Valabil până la", cvvLabel: "CVV", numberLabel: "Număr card", typeLabel: "Tip", copyBtn: "Copiază numărul", showBtn: "Afișează", hideBtn: "Ascunde", warningMasked: "Ultimele 4 cifre sunt ascunse de administrator.", warningCvvMasked: "CVV-ul este ascuns de administrator.", warningFull: "Card complet vizibil.", warningAdminMasked: "Ultimele 4 cifre și CVV-ul sunt ascunse de administrator." },
  nl: { title: "Virtuele kaart", holderLabel: "Houder", expiryLabel: "Geldig tot", cvvLabel: "CVV", numberLabel: "Kaartnummer", typeLabel: "Type", copyBtn: "Nummer kopiëren", showBtn: "Tonen", hideBtn: "Verbergen", warningMasked: "De laatste 4 cijfers zijn verborgen door de beheerder.", warningCvvMasked: "CVV is verborgen door de beheerder.", warningFull: "Kaart volledig zichtbaar.", warningAdminMasked: "De laatste 4 cijfers en CVV zijn verborgen door de beheerder." },
  pt: { title: "Cartão virtual", holderLabel: "Titular", expiryLabel: "Válido até", cvvLabel: "CVV", numberLabel: "Número do cartão", typeLabel: "Tipo", copyBtn: "Copiar o número", showBtn: "Mostrar", hideBtn: "Ocultar", warningMasked: "Os últimos 4 dígitos estão ocultos pelo administrador.", warningCvvMasked: "O CVV está oculto pelo administrador.", warningFull: "Cartão totalmente visível.", warningAdminMasked: "Os últimos 4 dígitos e o CVV estão ocultos pelo administrador." },
  el: { title: "Εικονική κάρτα", holderLabel: "Κάτοχος", expiryLabel: "Ισχύει έως", cvvLabel: "CVV", numberLabel: "Αριθμός κάρτας", typeLabel: "Τύπος", copyBtn: "Αντιγραφή αριθμού", showBtn: "Εμφάνιση", hideBtn: "Απόκρυψη", warningMasked: "Τα 4 τελευταία ψηφία αποκρύπτονται από τον διαχειριστή.", warningCvvMasked: "Το CVV αποκρύπτεται από τον διαχειριστή.", warningFull: "Η κάρτα είναι πλήρως ορατή.", warningAdminMasked: "Τα 4 τελευταία ψηφία και το CVV αποκρύπτονται από τον διαχειριστή." },
  cs: { title: "Virtuální karta", holderLabel: "Držitel", expiryLabel: "Platná do", cvvLabel: "CVV", numberLabel: "Číslo karty", typeLabel: "Typ", copyBtn: "Kopírovat číslo", showBtn: "Zobrazit", hideBtn: "Skrýt", warningMasked: "Poslední 4 číslice jsou skryty administrátorem.", warningCvvMasked: "CVV je skryto administrátorem.", warningFull: "Karta plně viditelná.", warningAdminMasked: "Poslední 4 číslice a CVV jsou skryty administrátorem." },
  hu: { title: "Virtuális kártya", holderLabel: "Tulajdonos", expiryLabel: "Érvényes eddig", cvvLabel: "CVV", numberLabel: "Kártyaszám", typeLabel: "Típus", copyBtn: "Szám másolása", showBtn: "Megjelenítés", hideBtn: "Elrejtés", warningMasked: "Az utolsó 4 számjegyet az adminisztrátor elrejtette.", warningCvvMasked: "A CVV-t az adminisztrátor elrejtette.", warningFull: "A kártya teljesen látható.", warningAdminMasked: "Az utolsó 4 számjegy és a CVV el van rejtve az adminisztrátor által." },
  sv: { title: "Virtuellt kort", holderLabel: "Innehavare", expiryLabel: "Giltigt till", cvvLabel: "CVV", numberLabel: "Kortnummer", typeLabel: "Typ", copyBtn: "Kopiera nummer", showBtn: "Visa", hideBtn: "Dölj", warningMasked: "De sista 4 siffrorna är dolda av administratören.", warningCvvMasked: "CVV är dolt av administratören.", warningFull: "Kortet är helt synligt.", warningAdminMasked: "De sista 4 siffrorna och CVV är dolda av administratören." },
  ar: { title: "بطاقة افتراضية", holderLabel: "حامل البطاقة", expiryLabel: "صالحة حتى", cvvLabel: "CVV", numberLabel: "رقم البطاقة", typeLabel: "النوع", copyBtn: "نسخ الرقم", showBtn: "عرض", hideBtn: "إخفاء", warningMasked: "تم إخفاء آخر 4 أرقام من قبل المسؤول.", warningCvvMasked: "تم إخفاء CVV من قبل المسؤول.", warningFull: "البطاقة مرئية بالكامل.", warningAdminMasked: "تم إخفاء آخر 4 أرقام و CVV من قبل المسؤول." }
};

// ═══════════════════════════════════════════════════════════
// ★ ASSISTANT IA CONVERSATIONNEL — Libellés multilingues (15 langues)
// ═══════════════════════════════════════════════════════════
const CHAT_LABELS = {
  fr: { title: "Assistant IA Younited", subtitle: "Intelligence artificielle · En ligne 24/7", placeholder: "Écrivez votre message...", send: "Envoyer", welcomeTitle: "Bienvenue !", welcomeBody: "Je suis votre assistant IA personnel, disponible 24h/24 et 7j/7. Posez-moi votre question." },
  pl: { title: "Asystent AI Younited", subtitle: "Sztuczna inteligencja · Online 24/7", placeholder: "Napisz wiadomość...", send: "Wyślij", welcomeTitle: "Witamy!", welcomeBody: "Jestem Twoim osobistym asystentem AI, dostępnym 24/7. Zadaj mi pytanie." },
  es: { title: "Asistente IA Younited", subtitle: "Inteligencia artificial · En línea 24/7", placeholder: "Escribe tu mensaje...", send: "Enviar", welcomeTitle: "¡Bienvenido!", welcomeBody: "Soy tu asistente personal de IA, disponible 24/7. Házmela." },
  it: { title: "Assistente IA Younited", subtitle: "Intelligenza artificiale · Online 24/7", placeholder: "Scrivi il tuo messaggio...", send: "Invia", welcomeTitle: "Benvenuto!", welcomeBody: "Sono il tuo assistente personale IA, disponibile 24/7. Fammi la tua domanda." },
  de: { title: "Younited KI-Assistent", subtitle: "Künstliche Intelligenz · Online 24/7", placeholder: "Schreiben Sie Ihre Nachricht...", send: "Senden", welcomeTitle: "Willkommen!", welcomeBody: "Ich bin Ihr persönlicher KI-Assistent, 24/7 verfügbar. Stellen Sie mir Ihre Frage." },
  he: { title: "עוזר AI של Younited", subtitle: "בינה מלאכותית · זמין 24/7", placeholder: "כתוב את ההודעה שלך...", send: "שלח", welcomeTitle: "ברוך הבא!", welcomeBody: "אני העוזר האישי שלך ב-AI, זמין 24/7. שאל אותי שאלה." },
  hr: { title: "AI asistent Younited", subtitle: "Umjetna inteligencija · Online 24/7", placeholder: "Napišite poruku...", send: "Pošalji", welcomeTitle: "Dobrodošli!", welcomeBody: "Ja sam vaš osobni AI asistent, dostupan 24/7. Postavite mi pitanje." },
  ro: { title: "Asistent AI Younited", subtitle: "Inteligență artificială · Online 24/7", placeholder: "Scrieți mesajul...", send: "Trimite", welcomeTitle: "Bine ați venit!", welcomeBody: "Sunt asistentul dvs. personal AI, disponibil 24/7. Puneți-mi o întrebare." },
  nl: { title: "Younited AI-assistent", subtitle: "Kunstmatige intelligentie · Online 24/7", placeholder: "Typ uw bericht...", send: "Verzenden", welcomeTitle: "Welkom!", welcomeBody: "Ik ben uw persoonlijke AI-assistent, 24/7 beschikbaar. Stel me een vraag." },
  pt: { title: "Assistente IA Younited", subtitle: "Inteligência artificial · Online 24/7", placeholder: "Escreva a sua mensagem...", send: "Enviar", welcomeTitle: "Bem-vindo!", welcomeBody: "Sou o seu assistente pessoal de IA, disponível 24/7. Faça-me uma pergunta." },
  el: { title: "Βοηθός AI Younited", subtitle: "Τεχνητή νοημοσύνη · Online 24/7", placeholder: "Γράψτε το μήνυμά σας...", send: "Αποστολή", welcomeTitle: "Καλώς ήρθατε!", welcomeBody: "Είμαι ο προσωπικός σας βοηθός AI, διαθέσιμος 24/7. Κάντε μου μια ερώτηση." },
  cs: { title: "AI asistent Younited", subtitle: "Umělá inteligence · Online 24/7", placeholder: "Napište zprávu...", send: "Odeslat", welcomeTitle: "Vítejte!", welcomeBody: "Jsem váš osobní AI asistent, dostupný 24/7. Zeptejte se mě." },
  hu: { title: "Younited AI asszisztens", subtitle: "Mesterséges intelligencia · Online 24/7", placeholder: "Írja be üzenetét...", send: "Küldés", welcomeTitle: "Üdvözöljük!", welcomeBody: "Én vagyok az Ön személyes AI asszisztense, 24/7 elérhető. Tegyen fel egy kérdést." },
  sv: { title: "Younited AI-assistent", subtitle: "Artificiell intelligens · Online 24/7", placeholder: "Skriv ditt meddelande...", send: "Skicka", welcomeTitle: "Välkommen!", welcomeBody: "Jag är din personliga AI-assistent, tillgänglig 24/7. Ställ mig en fråga." },
  ar: { title: "مساعد الذكاء الاصطناعي Younited", subtitle: "ذكاء اصطناعي · متصل 24/7", placeholder: "اكتب رسالتك...", send: "إرسال", welcomeTitle: "مرحباً!", welcomeBody: "أنا مساعدك الشخصي بالذكاء الاصطناعي، متاح على مدار الساعة. اطرح سؤالك." }
};

// ═══════════════════════════════════════════════════════════
// ★ CHAT_RESPONSES — Réponses multilingues
// (5 langues complètes + 10 nouvelles langues essentielles)
// ═══════════════════════════════════════════════════════════
const CHAT_RESPONSES = {
  fr: {
    greeting: ["Bonjour et bienvenue ! 👋 Je suis votre assistant IA Younited, disponible 24h/24. Comment puis-je vous aider aujourd'hui ?", "Bonjour ! 😊 Ravi de vous revoir. Que puis-je faire pour vous ?"],
    thanks: ["Avec grand plaisir ! 🙏 N'hésitez pas à revenir.", "C'est un honneur de vous aider ! 😊"],
    whoAreYou: ["Je suis l'Assistant IA Younited — une intelligence artificielle de nouvelle génération, entraînée pour vous accompagner 24h/24. Je connais chaque page de l'application : Accueil, Paiements, Carte virtuelle et Profil. 💙"],
    existence: ["Younited est un service financier établi et en pleine croissance, opérant à travers toute l'Europe. 🇪🇺 Nos processus sont audités et supervisés par des équipes de conformité dédiées. Vous pouvez avoir une totale confiance. 💙"],
    trust: ["Younited est un service sérieux, établi et fiable. 💙 Des milliers de clients nous font confiance chaque jour. 🙏"],
    security: ["Votre sécurité est notre priorité absolue. 🔒 Toutes vos transactions sont protégées par un chiffrement de bout en bout (AES-256). 💙"],
    fees: ["Concernant les frais, veuillez contacter notre **service client** ou notre **service administratif** : ils vous fourniront tous les détails. 🙏"],
    loan: ["Pour toute demande de prêt, notre **service administratif** est votre meilleur interlocuteur. 💼"],
    transfer: ["Les virements Younited sont traités rapidement et en toute sécurité. ⚡ Délai habituel : 1 à 3 minutes. 💙"],
    wait: ["Chaque virement est vérifié avec soin. ⏳ Si vous constatez un délai inhabituel, contactez le **service client**. 🙏"],
    balance: ["Vous pouvez consulter votre solde en temps réel sur la page **Accueil**. 💰"],
    iban: ["Vos coordonnées bancaires sont accessibles via le bouton **« Voir mon IBAN »** sur la page **Accueil**. 📄"],
    card: ["Votre carte virtuelle est disponible dans la section **« Carte virtuelle »**. 💳"],
    services: ["Younited vous propose : 💼\n\n• **Virements internationaux** sécurisés\n• **Carte virtuelle**\n• **Gestion de compte** en temps réel\n• **Support multilingue**\n• **Sécurité bancaire**\n• **Assistance 24h/24**\n\n🚀"],
    problem: ["Je suis désolé pour la difficulté. 🙏 Contactez notre **service client** ou **service administratif** qui traiteront votre situation. 💙"],
    howToTransfer: ["Pour effectuer un virement : 📋\n\n**1.** Onglet **« Paiements »**\n**2.** Remplissez : Montant, IBAN, BIC, Banque, Bénéficiaire, Motif\n**3.** Appuyez sur **« Suivant »**\n**4.** Saisissez votre **code d'activation**\n**5.** Appuyez sur **« Valider le virement »**\n\n✅ Confirmation par email. 💙"],
    howToFindActivationCode: ["Le **code d'activation** est fourni : 🔑\n\n**1.** Par **email**\n**2.** Ou via le **service client** / **service administratif**\n\n⚠️ Ne partagez jamais ce code. 💙"],
    howToNavigate: ["Structure de l'app : 🧭\n\n**🏠 Accueil** — solde et historique\n**💸 Paiements** — virements\n**💳 Carte virtuelle**\n**👤 Profil** — données et déconnexion\n\n💙"],
    howToLogin: ["Connexion : 🔐\n\n**1.** Email\n**2.** Code PIN\n**3.** Bouton **« Se connecter »**\n\nProblème ? Contactez le **service client**. 💙"],
    howToIban: ["Voir IBAN : 📄\n\n**1.** Tuile **« Voir mon IBAN »**\n**2.** Appuyez sur **« Copier »**\n\n💙"],
    howToCard: ["Carte virtuelle : 💳\n\n**1.** Tuile **« Carte virtuelle »**\n**2.** Numéro, expiration, CVV\n**3.** **« Copier le numéro »**\n\n💙"],
    howToDeposit: ["Pour ajouter des fonds : 💰 Contactez le **service administratif**. 💙"],
    howToCancelTransfer: ["Pour annuler un virement : 🔄 Contactez le **service client** ou **service administratif**. 💙"],
    howToViewReceipt: ["Pour consulter un reçu : 🧾 Cliquez sur la transaction dans l'historique. 💙"],
    howToContactSupport: ["Contact : 📞\n\n**Service client** — questions générales\n**Service administratif** — opérations sensibles\n\n💙"],
    help: ["Je peux vous aider sur : ✨\n\n• 📤 Virements\n• 🧭 Navigation\n• 🔐 Connexion\n• 📄 IBAN / BIC\n• 💳 Carte virtuelle\n• 🛡️ Sécurité\n• 💼 Services\n\n💙"],
    fallback: ["Merci pour votre message. 💙 Pouvez-vous préciser votre demande ? 🙏", "J'ai bien reçu votre message. ✨ Pouvez-vous reformuler ? 💙"]
  },
  pl: {
    greeting: ["Witaj! 👋 Jestem Twoim asystentem AI Younited. Jak mogę pomóc?", "Witaj ponownie! 😊 W czym mogę pomóc?"],
    thanks: ["Z przyjemnością! 🙏", "To dla mnie zaszczyt! 😊"],
    whoAreYou: ["Jestem Asystentem AI Younited. Znam każdą stronę aplikacji. 💙"],
    existence: ["Younited to ugruntowana usługa finansowa działająca w Europie. 🇪🇺 💙"],
    trust: ["Younited to poważna, niezawodna usługa. 💙 🙏"],
    security: ["Twoje bezpieczeństwo to nasz priorytet. 🔒 💙"],
    fees: ["Skontaktuj się z **obsługą klienta** lub **działem administracji**. 🙏"],
    loan: ["W sprawie pożyczek: **dział administracji**. 💼"],
    transfer: ["Przelewy Younited: szybko i bezpiecznie. ⚡ 1-3 minuty. 💙"],
    wait: ["Każdy przelew jest dokładnie weryfikowany. ⏳ 🙏"],
    balance: ["Sprawdź saldo na stronie głównej. 💰 🙏"],
    iban: ["Dane bankowe dostępne ze strony głównej. 📄 💙"],
    card: ["Karta wirtualna w sekcji «Karta wirtualna». 💳 🚀"],
    services: ["Younited oferuje: 💼\n\n• **Przelewy międzynarodowe**\n• **Karta wirtualna**\n• **Zarządzanie kontem**\n• **Wsparcie wielojęzyczne**\n• **Pomoc 24/7**\n\n🚀"],
    problem: ["Skontaktuj się z **obsługą klienta** lub **działem administracji**. 💙"],
    howToTransfer: ["Aby wykonać przelew: 📋\n\n**1.** Kafelek **«Płatności»**\n**2.** Wypełnij 6 pól\n**3.** **«Następny»**\n**4.** Kod aktywacyjny\n**5.** **«Zatwierdź przelew»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Kod aktywacyjny** otrzymujesz:\n\n**1.** E-mailem\n**2.** Od obsługi klienta\n\n💙"],
    howToNavigate: ["🧭 **🏠 Pulpit** · **💸 Płatności** · **💳 Karta** · **👤 Profil** 💙"],
    howToLogin: ["Logowanie: 🔐 Email + PIN → **«Zaloguj się»**. 💙"],
    howToIban: ["IBAN: 📄 **«Zobacz mój IBAN»** → **«Kopiuj»**. 💙"],
    howToCard: ["Karta: 💳 **«Karta wirtualna»**. 💙"],
    howToDeposit: ["Wpłaty: 💰 Skontaktuj się z **działem administracji**. 💙"],
    howToCancelTransfer: ["Anulowanie: 🔄 Kontakt z obsługą. 💙"],
    howToViewReceipt: ["Potwierdzenie: 🧾 Naciśnij transakcję. 💙"],
    howToContactSupport: ["Kontakt: 📞 **Obsługa klienta** / **Dział administracji**. 💙"],
    help: ["Mogę pomóc: ✨ Przelewy, Nawigacja, Logowanie, IBAN, Karta, Usługi. 💙"],
    fallback: ["Dziękuję za wiadomość. 💙 Sprecyzuj pytanie. 🙏"]
  },
  es: {
    greeting: ["¡Hola y bienvenido! 👋 Soy tu asistente IA Younited. ¿Cómo puedo ayudarte?", "¡Hola de nuevo! 😊 ¿Qué necesitas?"],
    thanks: ["¡Con mucho gusto! 🙏", "¡Un honor ayudarte! 😊"],
    whoAreYou: ["Soy el Asistente IA Younited. Conozco cada página de la app. 💙"],
    existence: ["Younited es un servicio financiero establecido en Europa. 🇪🇺 💙"],
    trust: ["Younited es un servicio serio y fiable. 💙 🙏"],
    security: ["Tu seguridad es nuestra prioridad. 🔒 💙"],
    fees: ["Contacta con el **servicio al cliente** o **administrativo**. 🙏"],
    loan: ["Para préstamos: **servicio administrativo**. 💼"],
    transfer: ["Transferencias rápidas y seguras. ⚡ 1-3 minutos. 💙"],
    wait: ["Cada transferencia es verificada. ⏳ 🙏"],
    balance: ["Consulta tu saldo en la página de inicio. 💰 🙏"],
    iban: ["Datos bancarios accesibles con un clic. 📄 💙"],
    card: ["Tarjeta virtual en «Tarjeta virtual». 💳 🚀"],
    services: ["Younited ofrece: 💼\n\n• **Transferencias internacionales**\n• **Tarjeta virtual**\n• **Gestión de cuenta**\n• **Soporte multilingüe**\n• **Asistencia 24/7**\n\n🚀"],
    problem: ["Contacta con el **servicio al cliente**. 💙"],
    howToTransfer: ["Guía de transferencia: 📋\n\n**1.** **«Pagos»**\n**2.** Rellena 6 campos\n**3.** **«Siguiente»**\n**4.** Código de activación\n**5.** **«Validar»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Código de activación**:\n\n**1.** Por email\n**2.** Servicio al cliente\n\n💙"],
    howToNavigate: ["🧭 **🏠 Inicio** · **💸 Pagos** · **💳 Tarjeta** · **👤 Perfil** 💙"],
    howToLogin: ["Login: 🔐 Email + PIN → **«Iniciar»**. 💙"],
    howToIban: ["IBAN: 📄 **«Ver mi IBAN»** → **«Copiar»**. 💙"],
    howToCard: ["Tarjeta: 💳 **«Tarjeta virtual»**. 💙"],
    howToDeposit: ["Añadir fondos: 💰 **Servicio administrativo**. 💙"],
    howToCancelTransfer: ["Cancelar: 🔄 Contacta con el servicio. 💙"],
    howToViewReceipt: ["Recibo: 🧾 Pulsa la transacción. 💙"],
    howToContactSupport: ["Contacto: 📞 **Servicio al cliente** / **Administrativo**. 💙"],
    help: ["Puedo ayudarte: ✨ Transferencias, Navegación, Login, IBAN, Tarjeta, Servicios. 💙"],
    fallback: ["Gracias por tu mensaje. 💙 ¿Puedes precisar? 🙏"]
  },
  it: {
    greeting: ["Benvenuto! 👋 Sono il tuo assistente IA Younited. Come posso aiutarti?", "Ciao di nuovo! 😊 Cosa ti serve?"],
    thanks: ["Con piacere! 🙏", "Un onore aiutarti! 😊"],
    whoAreYou: ["Sono l'Assistente IA Younited. Conosco ogni pagina dell'app. 💙"],
    existence: ["Younited è un servizio finanziario consolidato in Europa. 🇪🇺 💙"],
    trust: ["Younited è un servizio serio e affidabile. 💙 🙏"],
    security: ["La tua sicurezza è la nostra priorità. 🔒 💙"],
    fees: ["Contatta il **servizio clienti** o **amministrativo**. 🙏"],
    loan: ["Per prestiti: **servizio amministrativo**. 💼"],
    transfer: ["Bonifici rapidi e sicuri. ⚡ 1-3 minuti. 💙"],
    wait: ["Ogni bonifico è verificato. ⏳ 🙏"],
    balance: ["Saldo in tempo reale in home. 💰 🙏"],
    iban: ["Dati bancari accessibili con un clic. 📄 💙"],
    card: ["Carta virtuale in «Carta virtuale». 💳 🚀"],
    services: ["Younited offre: 💼\n\n• **Bonifici internazionali**\n• **Carta virtuale**\n• **Gestione conto**\n• **Supporto multilingue**\n• **Assistenza 24/7**\n\n🚀"],
    problem: ["Contatta il **servizio clienti**. 💙"],
    howToTransfer: ["Guida bonifico: 📋\n\n**1.** **«Pagamenti»**\n**2.** Compila 6 campi\n**3.** **«Avanti»**\n**4.** Codice di attivazione\n**5.** **«Convalida»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Codice di attivazione**:\n\n**1.** Via email\n**2.** Servizio clienti\n\n💙"],
    howToNavigate: ["🧭 **🏠 Home** · **💸 Pagamenti** · **💳 Carta** · **👤 Profilo** 💙"],
    howToLogin: ["Accesso: 🔐 Email + PIN → **«Accedi»**. 💙"],
    howToIban: ["IBAN: 📄 **«Vedi il mio IBAN»** → **«Copia»**. 💙"],
    howToCard: ["Carta: 💳 **«Carta virtuale»**. 💙"],
    howToDeposit: ["Fondi: 💰 **Servizio amministrativo**. 💙"],
    howToCancelTransfer: ["Annullare: 🔄 Contatta il servizio. 💙"],
    howToViewReceipt: ["Ricevuta: 🧾 Tocca la transazione. 💙"],
    howToContactSupport: ["Contatti: 📞 **Servizio clienti** / **Amministrativo**. 💙"],
    help: ["Posso aiutarti: ✨ Bonifici, Navigazione, Accesso, IBAN, Carta, Servizi. 💙"],
    fallback: ["Grazie per il messaggio. 💙 Puoi precisare? 🙏"]
  },
  de: {
    greeting: ["Hallo und willkommen! 👋 Ich bin Ihr Younited KI-Assistent. Wie kann ich helfen?", "Hallo erneut! 😊 Was benötigen Sie?"],
    thanks: ["Mit größtem Vergnügen! 🙏", "Eine Ehre, Ihnen zu helfen! 😊"],
    whoAreYou: ["Ich bin der Younited KI-Assistent. Ich kenne jede Seite der App. 💙"],
    existence: ["Younited ist ein etablierter Finanzdienst in Europa. 🇪🇺 💙"],
    trust: ["Younited ist ein seriöser und zuverlässiger Service. 💙 🙏"],
    security: ["Ihre Sicherheit hat absolute Priorität. 🔒 💙"],
    fees: ["Kontaktieren Sie den **Kundenservice** oder die **Verwaltungsabteilung**. 🙏"],
    loan: ["Für Kredite: **Verwaltungsabteilung**. 💼"],
    transfer: ["Überweisungen schnell und sicher. ⚡ 1-3 Minuten. 💙"],
    wait: ["Jede Überweisung wird geprüft. ⏳ 🙏"],
    balance: ["Guthaben auf der Startseite. 💰 🙏"],
    iban: ["Bankdaten mit einem Klick. 📄 💙"],
    card: ["Virtuelle Karte im Bereich «Virtuelle Karte». 💳 🚀"],
    services: ["Younited bietet: 💼\n\n• **Internationale Überweisungen**\n• **Virtuelle Karte**\n• **Kontoverwaltung**\n• **Mehrsprachiger Support**\n• **24/7-Unterstützung**\n\n🚀"],
    problem: ["Kontaktieren Sie den **Kundenservice**. 💙"],
    howToTransfer: ["Überweisung: 📋\n\n**1.** **«Zahlungen»**\n**2.** 6 Felder ausfüllen\n**3.** **«Weiter»**\n**4.** Aktivierungscode\n**5.** **«Bestätigen»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Aktivierungscode**:\n\n**1.** Per E-Mail\n**2.** Kundenservice\n\n💙"],
    howToNavigate: ["🧭 **🏠 Start** · **💸 Zahlungen** · **💳 Karte** · **👤 Profil** 💙"],
    howToLogin: ["Anmeldung: 🔐 E-Mail + PIN → **«Anmelden»**. 💙"],
    howToIban: ["IBAN: 📄 **«Meine IBAN anzeigen»** → **«Kopieren»**. 💙"],
    howToCard: ["Karte: 💳 **«Virtuelle Karte»**. 💙"],
    howToDeposit: ["Guthaben: 💰 **Verwaltungsabteilung**. 💙"],
    howToCancelTransfer: ["Stornieren: 🔄 Kundenservice. 💙"],
    howToViewReceipt: ["Beleg: 🧾 Transaktion antippen. 💙"],
    howToContactSupport: ["Kontakt: 📞 **Kundenservice** / **Verwaltung**. 💙"],
    help: ["Ich kann helfen: ✨ Überweisungen, Navigation, Anmeldung, IBAN, Karte, Dienste. 💙"],
    fallback: ["Vielen Dank. 💙 Können Sie präzisieren? 🙏"]
  },
  // ═══════════════════════════════════════════════════════════
  // ★ NOUVELLES LANGUES (10) — réponses essentielles
  // ═══════════════════════════════════════════════════════════
  he: {
    greeting: ["שלום וברוך הבא! 👋 אני העוזר AI שלך ב-Younited. איך אני יכול לעזור?", "שלום שוב! 😊 מה אתה צריך?"],
    thanks: ["בשמחה רבה! 🙏", "כבוד לעזור לך! 😊"],
    whoAreYou: ["אני העוזר AI של Younited. אני מכיר כל עמוד באפליקציה. 💙"],
    existence: ["Younited הוא שירות פיננסי מבוסס הפועל בכל אירופה. 🇪🇺 💙"],
    trust: ["Younited הוא שירות רציני ואמין. 💙 🙏"],
    security: ["האבטחה שלך היא העדיפות העליונה שלנו. 🔒 💙"],
    fees: ["צור קשר עם **שירות הלקוחות** או **המחלקה האדמיניסטרטיבית**. 🙏"],
    loan: ["להלוואות: **המחלקה האדמיניסטרטיבית**. 💼"],
    transfer: ["העברות Younited מהירות ובטוחות. ⚡ 1-3 דקות. 💙"],
    wait: ["כל העברה נבדקת בקפידה. ⏳ 🙏"],
    balance: ["בדוק את היתרה שלך בדף הבית. 💰 🙏"],
    iban: ["פרטי הבנק נגישים בלחיצה אחת. 📄 💙"],
    card: ["כרטיס וירטואלי במקטע «כרטיס וירטואלי». 💳 🚀"],
    services: ["Younited מציע: 💼\n\n• **העברות בינלאומיות**\n• **כרטיס וירטואלי**\n• **ניהול חשבון**\n• **תמיכה רב-לשונית**\n• **תמיכה 24/7**\n\n🚀"],
    problem: ["צור קשר עם **שירות הלקוחות**. 💙"],
    howToTransfer: ["להעברה: 📋\n\n**1.** **«תשלומים»**\n**2.** מלא 6 שדות\n**3.** **«הבא»**\n**4.** קוד הפעלה\n**5.** **«אשר את ההעברה»**\n\n✅ 💙"],
    howToFindActivationCode: ["**קוד הפעלה**:\n\n**1.** במייל\n**2.** שירות הלקוחות\n\n💙"],
    howToNavigate: ["🧭 **🏠 בית** · **💸 תשלומים** · **💳 כרטיס** · **👤 פרופיל** 💙"],
    howToLogin: ["התחברות: 🔐 אימייל + PIN → **«התחבר»**. 💙"],
    howToIban: ["IBAN: 📄 **«הצג את ה-IBAN שלי»** → **«העתק»**. 💙"],
    howToCard: ["כרטיס: 💳 **«כרטיס וירטואלי»**. 💙"],
    howToDeposit: ["הפקדות: 💰 **המחלקה האדמיניסטרטיבית**. 💙"],
    howToCancelTransfer: ["ביטול: 🔄 שירות הלקוחות. 💙"],
    howToViewReceipt: ["קבלה: 🧾 לחץ על העסקה. 💙"],
    howToContactSupport: ["יצירת קשר: 📞 **שירות לקוחות** / **מחלקה אדמיניסטרטיבית**. 💙"],
    help: ["אני יכול לעזור: ✨ העברות, ניווט, התחברות, IBAN, כרטיס, שירותים. 💙"],
    fallback: ["תודה על הודעתך. 💙 האם תוכל לפרט? 🙏"]
  },
  hr: {
    greeting: ["Pozdrav i dobrodošli! 👋 Ja sam vaš Younited AI asistent. Kako mogu pomoći?", "Pozdrav ponovno! 😊 Što vam treba?"],
    thanks: ["S velikim zadovoljstvom! 🙏", "Čast mi je pomoći! 😊"],
    whoAreYou: ["Ja sam Younited AI asistent. Poznajem svaku stranicu aplikacije. 💙"],
    existence: ["Younited je etablirana financijska usluga koja djeluje u cijeloj Europi. 🇪🇺 💙"],
    trust: ["Younited je ozbiljna i pouzdana usluga. 💙 🙏"],
    security: ["Vaša sigurnost je naš apsolutni prioritet. 🔒 💙"],
    fees: ["Kontaktirajte **korisničku službu** ili **administrativni odjel**. 🙏"],
    loan: ["Za kredite: **administrativni odjel**. 💼"],
    transfer: ["Younited prijenosi su brzi i sigurni. ⚡ 1-3 minute. 💙"],
    wait: ["Svaki prijenos se pažljivo provjerava. ⏳ 🙏"],
    balance: ["Provjerite stanje na početnoj stranici. 💰 🙏"],
    iban: ["Bankovni podaci dostupni jednim klikom. 📄 💙"],
    card: ["Virtualna kartica u odjeljku «Virtualna kartica». 💳 🚀"],
    services: ["Younited nudi: 💼\n\n• **Međunarodni prijenosi**\n• **Virtualna kartica**\n• **Upravljanje računom**\n• **Višejezična podrška**\n• **Podrška 24/7**\n\n🚀"],
    problem: ["Kontaktirajte **korisničku službu**. 💙"],
    howToTransfer: ["Za prijenos: 📋\n\n**1.** **«Plaćanja»**\n**2.** Ispunite 6 polja\n**3.** **«Dalje»**\n**4.** Aktivacijski kod\n**5.** **«Potvrdi prijenos»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Aktivacijski kod**:\n\n**1.** E-mailom\n**2.** Korisnička služba\n\n💙"],
    howToNavigate: ["🧭 **🏠 Početna** · **💸 Plaćanja** · **💳 Kartica** · **👤 Profil** 💙"],
    howToLogin: ["Prijava: 🔐 E-mail + PIN → **«Prijava»**. 💙"],
    howToIban: ["IBAN: 📄 **«Pogledaj moj IBAN»** → **«Kopiraj»**. 💙"],
    howToCard: ["Kartica: 💳 **«Virtualna kartica»**. 💙"],
    howToDeposit: ["Polog: 💰 **Administrativni odjel**. 💙"],
    howToCancelTransfer: ["Otkazivanje: 🔄 Korisnička služba. 💙"],
    howToViewReceipt: ["Potvrda: 🧾 Kliknite na transakciju. 💙"],
    howToContactSupport: ["Kontakt: 📞 **Korisnička služba** / **Administrativni odjel**. 💙"],
    help: ["Mogu pomoći: ✨ Prijenosi, Navigacija, Prijava, IBAN, Kartica, Usluge. 💙"],
    fallback: ["Hvala na poruci. 💙 Možete li pojasniti? 🙏"]
  },
  ro: {
    greeting: ["Bun venit! 👋 Sunt asistentul dvs. AI Younited. Cum vă pot ajuta?", "Bună din nou! 😊 Ce aveți nevoie?"],
    thanks: ["Cu mare plăcere! 🙏", "O onoare să vă ajut! 😊"],
    whoAreYou: ["Sunt asistentul AI Younited. Cunosc fiecare pagină a aplicației. 💙"],
    existence: ["Younited este un serviciu financiar consacrat care operează în toată Europa. 🇪🇺 💙"],
    trust: ["Younited este un serviciu serios și de încredere. 💙 🙏"],
    security: ["Siguranța dvs. este prioritatea noastră absolută. 🔒 💙"],
    fees: ["Contactați **serviciul clienți** sau **departamentul administrativ**. 🙏"],
    loan: ["Pentru credite: **departamentul administrativ**. 💼"],
    transfer: ["Transferurile Younited sunt rapide și sigure. ⚡ 1-3 minute. 💙"],
    wait: ["Fiecare transfer este verificat cu atenție. ⏳ 🙏"],
    balance: ["Consultați soldul pe pagina principală. 💰 🙏"],
    iban: ["Datele bancare accesibile cu un clic. 📄 💙"],
    card: ["Card virtual în secțiunea «Card virtual». 💳 🚀"],
    services: ["Younited oferă: 💼\n\n• **Transferuri internaționale**\n• **Card virtual**\n• **Gestionare cont**\n• **Suport multilingv**\n• **Asistență 24/7**\n\n🚀"],
    problem: ["Contactați **serviciul clienți**. 💙"],
    howToTransfer: ["Ghid transfer: 📋\n\n**1.** **«Plăți»**\n**2.** Completați 6 câmpuri\n**3.** **«Următor»**\n**4.** Cod de activare\n**5.** **«Validează transferul»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Cod de activare**:\n\n**1.** Prin email\n**2.** Serviciul clienți\n\n💙"],
    howToNavigate: ["🧭 **🏠 Acasă** · **💸 Plăți** · **💳 Card** · **👤 Profil** 💙"],
    howToLogin: ["Conectare: 🔐 Email + PIN → **«Conectare»**. 💙"],
    howToIban: ["IBAN: 📄 **«Vezi IBAN-ul meu»** → **«Copiază»**. 💙"],
    howToCard: ["Card: 💳 **«Card virtual»**. 💙"],
    howToDeposit: ["Depuneri: 💰 **Departamentul administrativ**. 💙"],
    howToCancelTransfer: ["Anulare: 🔄 Serviciul clienți. 💙"],
    howToViewReceipt: ["Chitanță: 🧾 Click pe tranzacție. 💙"],
    howToContactSupport: ["Contact: 📞 **Serviciul clienți** / **Administrativ**. 💙"],
    help: ["Vă pot ajuta: ✨ Transferuri, Navigare, Conectare, IBAN, Card, Servicii. 💙"],
    fallback: ["Vă mulțumim. 💙 Puteți preciza? 🙏"]
  },
  nl: {
    greeting: ["Hallo en welkom! 👋 Ik ben uw Younited AI-assistent. Hoe kan ik helpen?", "Hallo opnieuw! 😊 Wat heeft u nodig?"],
    thanks: ["Met groot plezier! 🙏", "Een eer om u te helpen! 😊"],
    whoAreYou: ["Ik ben de Younited AI-assistent. Ik ken elke pagina van de app. 💙"],
    existence: ["Younited is een gevestigde financiële dienst in heel Europa. 🇪🇺 💙"],
    trust: ["Younited is een serieuze en betrouwbare service. 💙 🙏"],
    security: ["Uw veiligheid is onze absolute prioriteit. 🔒 💙"],
    fees: ["Neem contact op met de **klantenservice** of **administratie**. 🙏"],
    loan: ["Voor leningen: **administratie**. 💼"],
    transfer: ["Younited overschrijvingen zijn snel en veilig. ⚡ 1-3 minuten. 💙"],
    wait: ["Elke overschrijving wordt zorgvuldig geverifieerd. ⏳ 🙏"],
    balance: ["Bekijk uw saldo op de startpagina. 💰 🙏"],
    iban: ["Bankgegevens met één klik. 📄 💙"],
    card: ["Virtuele kaart in «Virtuele kaart». 💳 🚀"],
    services: ["Younited biedt: 💼\n\n• **Internationale overschrijvingen**\n• **Virtuele kaart**\n• **Rekeningbeheer**\n• **Meertalige ondersteuning**\n• **24/7-ondersteuning**\n\n🚀"],
    problem: ["Neem contact op met de **klantenservice**. 💙"],
    howToTransfer: ["Overschrijvingsgids: 📋\n\n**1.** **«Betalingen»**\n**2.** Vul 6 velden in\n**3.** **«Volgende»**\n**4.** Activeringscode\n**5.** **«Valideren»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Activeringscode**:\n\n**1.** Per e-mail\n**2.** Klantenservice\n\n💙"],
    howToNavigate: ["🧭 **🏠 Start** · **💸 Betalingen** · **💳 Kaart** · **👤 Profiel** 💙"],
    howToLogin: ["Inloggen: 🔐 E-mail + PIN → **«Inloggen»**. 💙"],
    howToIban: ["IBAN: 📄 **«Bekijk mijn IBAN»** → **«Kopiëren»**. 💙"],
    howToCard: ["Kaart: 💳 **«Virtuele kaart»**. 💙"],
    howToDeposit: ["Storten: 💰 **Administratie**. 💙"],
    howToCancelTransfer: ["Annuleren: 🔄 Klantenservice. 💙"],
    howToViewReceipt: ["Bon: 🧾 Tik op de transactie. 💙"],
    howToContactSupport: ["Contact: 📞 **Klantenservice** / **Administratie**. 💙"],
    help: ["Ik kan helpen: ✨ Overschrijvingen, Navigatie, Inloggen, IBAN, Kaart, Diensten. 💙"],
    fallback: ["Bedankt voor uw bericht. 💙 Kunt u dit verduidelijken? 🙏"]
  },
  pt: {
    greeting: ["Olá e bem-vindo! 👋 Sou o seu assistente IA Younited. Como posso ajudar?", "Olá de novo! 😊 O que precisa?"],
    thanks: ["Com muito prazer! 🙏", "É uma honra ajudar! 😊"],
    whoAreYou: ["Sou o assistente IA Younited. Conheço cada página da aplicação. 💙"],
    existence: ["Younited é um serviço financeiro estabelecido em toda a Europa. 🇪🇺 💙"],
    trust: ["Younited é um serviço sério e fiável. 💙 🙏"],
    security: ["A sua segurança é a nossa prioridade absoluta. 🔒 💙"],
    fees: ["Contacte o **serviço ao cliente** ou **serviço administrativo**. 🙏"],
    loan: ["Para empréstimos: **serviço administrativo**. 💼"],
    transfer: ["Transferências Younited rápidas e seguras. ⚡ 1-3 minutos. 💙"],
    wait: ["Cada transferência é verificada com cuidado. ⏳ 🙏"],
    balance: ["Consulte o saldo na página inicial. 💰 🙏"],
    iban: ["Dados bancários acessíveis com um clique. 📄 💙"],
    card: ["Cartão virtual na secção «Cartão virtual». 💳 🚀"],
    services: ["Younited oferece: 💼\n\n• **Transferências internacionais**\n• **Cartão virtual**\n• **Gestão de conta**\n• **Suporte multilingue**\n• **Assistência 24/7**\n\n🚀"],
    problem: ["Contacte o **serviço ao cliente**. 💙"],
    howToTransfer: ["Guia de transferência: 📋\n\n**1.** **«Pagamentos»**\n**2.** Preencha 6 campos\n**3.** **«Seguinte»**\n**4.** Código de ativação\n**5.** **«Validar»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Código de ativação**:\n\n**1.** Por e-mail\n**2.** Serviço ao cliente\n\n💙"],
    howToNavigate: ["🧭 **🏠 Início** · **💸 Pagamentos** · **💳 Cartão** · **👤 Perfil** 💙"],
    howToLogin: ["Entrar: 🔐 E-mail + PIN → **«Entrar»**. 💙"],
    howToIban: ["IBAN: 📄 **«Ver o meu IBAN»** → **«Copiar»**. 💙"],
    howToCard: ["Cartão: 💳 **«Cartão virtual»**. 💙"],
    howToDeposit: ["Depósitos: 💰 **Serviço administrativo**. 💙"],
    howToCancelTransfer: ["Cancelar: 🔄 Serviço ao cliente. 💙"],
    howToViewReceipt: ["Recibo: 🧾 Toque na transação. 💙"],
    howToContactSupport: ["Contacto: 📞 **Serviço ao cliente** / **Administrativo**. 💙"],
    help: ["Posso ajudar: ✨ Transferências, Navegação, Login, IBAN, Cartão, Serviços. 💙"],
    fallback: ["Obrigado pela mensagem. 💙 Pode precisar? 🙏"]
  },
  el: {
    greeting: ["Γεια σας και καλώς ήρθατε! 👋 Είμαι ο βοηθός AI Younited. Πώς μπορώ να βοηθήσω;", "Γεια σας ξανά! 😊 Τι χρειάζεστε;"],
    thanks: ["Με μεγάλη μου χαρά! 🙏", "Τιμή μου να βοηθήσω! 😊"],
    whoAreYou: ["Είμαι ο βοηθός AI Younited. Γνωρίζω κάθε σελίδα της εφαρμογής. 💙"],
    existence: ["Το Younited είναι μια καθιερωμένη χρηματοοικονομική υπηρεσία στην Ευρώπη. 🇪🇺 💙"],
    trust: ["Το Younited είναι μια σοβαρή και αξιόπιστη υπηρεσία. 💙 🙏"],
    security: ["Η ασφάλειά σας είναι η απόλυτη προτεραιότητά μας. 🔒 💙"],
    fees: ["Επικοινωνήστε με το **τμήμα εξυπηρέτησης** ή το **διοικητικό τμήμα**. 🙏"],
    loan: ["Για δάνεια: **διοικητικό τμήμα**. 💼"],
    transfer: ["Οι μεταφορές Younited είναι γρήγορες και ασφαλείς. ⚡ 1-3 λεπτά. 💙"],
    wait: ["Κάθε μεταφορά ελέγχεται προσεκτικά. ⏳ 🙏"],
    balance: ["Δείτε το υπόλοιπο στην αρχική σελίδα. 💰 🙏"],
    iban: ["Τραπεζικά στοιχεία προσβάσιμα με ένα κλικ. 📄 💙"],
    card: ["Εικονική κάρτα στην ενότητα «Εικονική κάρτα». 💳 🚀"],
    services: ["Το Younited προσφέρει: 💼\n\n• **Διεθνείς μεταφορές**\n• **Εικονική κάρτα**\n• **Διαχείριση λογαριασμού**\n• **Πολύγλωσση υποστήριξη**\n• **Υποστήριξη 24/7**\n\n🚀"],
    problem: ["Επικοινωνήστε με το **τμήμα εξυπηρέτησης**. 💙"],
    howToTransfer: ["Οδηγός μεταφοράς: 📋\n\n**1.** **«Πληρωμές»**\n**2.** Συμπληρώστε 6 πεδία\n**3.** **«Επόμενο»**\n**4.** Κωδικός ενεργοποίησης\n**5.** **«Επικύρωση»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Κωδικός ενεργοποίησης**:\n\n**1.** Μέσω email\n**2.** Τμήμα εξυπηρέτησης\n\n💙"],
    howToNavigate: ["🧭 **🏠 Αρχική** · **💸 Πληρωμές** · **💳 Κάρτα** · **👤 Προφίλ** 💙"],
    howToLogin: ["Σύνδεση: 🔐 Email + PIN → **«Σύνδεση»**. 💙"],
    howToIban: ["IBAN: 📄 **«Δείτε το IBAN μου»** → **«Αντιγραφή»**. 💙"],
    howToCard: ["Κάρτα: 💳 **«Εικονική κάρτα»**. 💙"],
    howToDeposit: ["Καταθέσεις: 💰 **Διοικητικό τμήμα**. 💙"],
    howToCancelTransfer: ["Ακύρωση: 🔄 Τμήμα εξυπηρέτησης. 💙"],
    howToViewReceipt: ["Απόδειξη: 🧾 Πατήστε τη συναλλαγή. 💙"],
    howToContactSupport: ["Επικοινωνία: 📞 **Τμήμα εξυπηρέτησης** / **Διοικητικό**. 💙"],
    help: ["Μπορώ να βοηθήσω: ✨ Μεταφορές, Πλοήγηση, Σύνδεση, IBAN, Κάρτα, Υπηρεσίες. 💙"],
    fallback: ["Ευχαριστώ για το μήνυμα. 💙 Μπορείτε να διευκρινίσετε; 🙏"]
  },
  cs: {
    greeting: ["Vítejte! 👋 Jsem váš AI asistent Younited. Jak vám mohu pomoci?", "Ahoj znovu! 😊 Co potřebujete?"],
    thanks: ["S velkým potěšením! 🙏", "Je ctí vám pomoci! 😊"],
    whoAreYou: ["Jsem AI asistent Younited. Znám každou stránku aplikace. 💙"],
    existence: ["Younited je zavedená finanční služba působící po celé Evropě. 🇪🇺 💙"],
    trust: ["Younited je seriózní a spolehlivá služba. 💙 🙏"],
    security: ["Vaše bezpečnost je naší absolutní prioritou. 🔒 💙"],
    fees: ["Kontaktujte **zákaznický servis** nebo **správní oddělení**. 🙏"],
    loan: ["Pro půjčky: **správní oddělení**. 💼"],
    transfer: ["Převody Younited jsou rychlé a bezpečné. ⚡ 1-3 minuty. 💙"],
    wait: ["Každý převod je pečlivě ověřen. ⏳ 🙏"],
    balance: ["Zkontrolujte zůstatek na domovské stránce. 💰 🙏"],
    iban: ["Bankovní údaje přístupné jedním kliknutím. 📄 💙"],
    card: ["Virtuální karta v sekci «Virtuální karta». 💳 🚀"],
    services: ["Younited nabízí: 💼\n\n• **Mezinárodní převody**\n• **Virtuální karta**\n• **Správa účtu**\n• **Vícejazyčná podpora**\n• **Podpora 24/7**\n\n🚀"],
    problem: ["Kontaktujte **zákaznický servis**. 💙"],
    howToTransfer: ["Průvodce převodem: 📋\n\n**1.** **«Platby»**\n**2.** Vyplňte 6 polí\n**3.** **«Další»**\n**4.** Aktivační kód\n**5.** **«Potvrdit převod»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Aktivační kód**:\n\n**1.** E-mailem\n**2.** Zákaznický servis\n\n💙"],
    howToNavigate: ["🧭 **🏠 Domů** · **💸 Platby** · **💳 Karta** · **👤 Profil** 💙"],
    howToLogin: ["Přihlášení: 🔐 E-mail + PIN → **«Přihlásit se»**. 💙"],
    howToIban: ["IBAN: 📄 **«Zobrazit mé IBAN»** → **«Kopírovat»**. 💙"],
    howToCard: ["Karta: 💳 **«Virtuální karta»**. 💙"],
    howToDeposit: ["Vklady: 💰 **Správní oddělení**. 💙"],
    howToCancelTransfer: ["Zrušení: 🔄 Zákaznický servis. 💙"],
    howToViewReceipt: ["Potvrzení: 🧾 Klikněte na transakci. 💙"],
    howToContactSupport: ["Kontakt: 📞 **Zákaznický servis** / **Správní oddělení**. 💙"],
    help: ["Mohu pomoci: ✨ Převody, Navigace, Přihlášení, IBAN, Karta, Služby. 💙"],
    fallback: ["Děkuji za zprávu. 💙 Můžete upřesnit? 🙏"]
  },
  hu: {
    greeting: ["Üdvözöljük! 👋 Younited AI asszisztense vagyok. Hogyan segíthetek?", "Újra üdvözlöm! 😊 Mire van szüksége?"],
    thanks: ["Nagy örömmel! 🙏", "Megtiszteltetés segíteni! 😊"],
    whoAreYou: ["Younited AI asszisztens vagyok. Ismerem az alkalmazás minden oldalát. 💙"],
    existence: ["A Younited egy megalapozott pénzügyi szolgáltatás, amely egész Európában működik. 🇪🇺 💙"],
    trust: ["A Younited komoly és megbízható szolgáltatás. 💙 🙏"],
    security: ["Az Ön biztonsága a legfőbb prioritásunk. 🔒 💙"],
    fees: ["Vegye fel a kapcsolatot az **ügyfélszolgálattal** vagy az **adminisztratív osztállyal**. 🙏"],
    loan: ["Hitelek: **adminisztratív osztály**. 💼"],
    transfer: ["A Younited utalások gyorsak és biztonságosak. ⚡ 1-3 perc. 💙"],
    wait: ["Minden utalást gondosan ellenőrzünk. ⏳ 🙏"],
    balance: ["Nézze meg egyenlegét a kezdőlapon. 💰 🙏"],
    iban: ["Banki adatok egy kattintással. 📄 💙"],
    card: ["Virtuális kártya a «Virtuális kártya» szakaszban. 💳 🚀"],
    services: ["A Younited kínálata: 💼\n\n• **Nemzetközi utalások**\n• **Virtuális kártya**\n• **Számlakezelés**\n• **Többnyelvű támogatás**\n• **24/7 támogatás**\n\n🚀"],
    problem: ["Vegye fel a kapcsolatot az **ügyfélszolgálattal**. 💙"],
    howToTransfer: ["Utalási útmutató: 📋\n\n**1.** **«Fizetések»**\n**2.** Töltse ki a 6 mezőt\n**3.** **«Következő»**\n**4.** Aktiválási kód\n**5.** **«Utalás jóváhagyása»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Aktiválási kód**:\n\n**1.** E-mailben\n**2.** Ügyfélszolgálat\n\n💙"],
    howToNavigate: ["🧭 **🏠 Kezdőlap** · **💸 Fizetések** · **💳 Kártya** · **👤 Profil** 💙"],
    howToLogin: ["Bejelentkezés: 🔐 E-mail + PIN → **«Bejelentkezés»**. 💙"],
    howToIban: ["IBAN: 📄 **«IBAN megtekintése»** → **«Másolás»**. 💙"],
    howToCard: ["Kártya: 💳 **«Virtuális kártya»**. 💙"],
    howToDeposit: ["Befizetések: 💰 **Adminisztratív osztály**. 💙"],
    howToCancelTransfer: ["Törlés: 🔄 Ügyfélszolgálat. 💙"],
    howToViewReceipt: ["Bizonylat: 🧾 Kattintson a tranzakcióra. 💙"],
    howToContactSupport: ["Kapcsolat: 📞 **Ügyfélszolgálat** / **Adminisztráció**. 💙"],
    help: ["Segíthetek: ✨ Utalások, Navigáció, Bejelentkezés, IBAN, Kártya, Szolgáltatások. 💙"],
    fallback: ["Köszönöm az üzenetet. 💙 Pontosítaná? 🙏"]
  },
  sv: {
    greeting: ["Välkommen! 👋 Jag är din Younited AI-assistent. Hur kan jag hjälpa?", "Hej igen! 😊 Vad behöver du?"],
    thanks: ["Med största nöje! 🙏", "En ära att hjälpa! 😊"],
    whoAreYou: ["Jag är Younited AI-assistenten. Jag känner till varje sida i appen. 💙"],
    existence: ["Younited är en etablerad finansiell tjänst som verkar i hela Europa. 🇪🇺 💙"],
    trust: ["Younited är en seriös och pålitlig tjänst. 💙 🙏"],
    security: ["Din säkerhet är vår absoluta prioritet. 🔒 💙"],
    fees: ["Kontakta **kundtjänst** eller **administrativa avdelningen**. 🙏"],
    loan: ["För lån: **administrativa avdelningen**. 💼"],
    transfer: ["Younited-överföringar är snabba och säkra. ⚡ 1-3 minuter. 💙"],
    wait: ["Varje överföring verifieras noggrant. ⏳ 🙏"],
    balance: ["Se ditt saldo på startsidan. 💰 🙏"],
    iban: ["Bankuppgifter tillgängliga med ett klick. 📄 💙"],
    card: ["Virtuellt kort i avsnittet «Virtuellt kort». 💳 🚀"],
    services: ["Younited erbjuder: 💼\n\n• **Internationella överföringar**\n• **Virtuellt kort**\n• **Kontohantering**\n• **Flerspråkigt stöd**\n• **Support 24/7**\n\n🚀"],
    problem: ["Kontakta **kundtjänst**. 💙"],
    howToTransfer: ["Överföringsguide: 📋\n\n**1.** **«Betalningar»**\n**2.** Fyll i 6 fält\n**3.** **«Nästa»**\n**4.** Aktiveringskod\n**5.** **«Validera»**\n\n✅ 💙"],
    howToFindActivationCode: ["**Aktiveringskod**:\n\n**1.** Via e-post\n**2.** Kundtjänst\n\n💙"],
    howToNavigate: ["🧭 **🏠 Hem** · **💸 Betalningar** · **💳 Kort** · **👤 Profil** 💙"],
    howToLogin: ["Inloggning: 🔐 E-post + PIN → **«Logga in»**. 💙"],
    howToIban: ["IBAN: 📄 **«Visa mitt IBAN»** → **«Kopiera»**. 💙"],
    howToCard: ["Kort: 💳 **«Virtuellt kort»**. 💙"],
    howToDeposit: ["Insättningar: 💰 **Administrativa avdelningen**. 💙"],
    howToCancelTransfer: ["Avbryt: 🔄 Kundtjänst. 💙"],
    howToViewReceipt: ["Kvitto: 🧾 Tryck på transaktionen. 💙"],
    howToContactSupport: ["Kontakt: 📞 **Kundtjänst** / **Administrativa**. 💙"],
    help: ["Jag kan hjälpa: ✨ Överföringar, Navigering, Inloggning, IBAN, Kort, Tjänster. 💙"],
    fallback: ["Tack för ditt meddelande. 💙 Kan du förtydliga? 🙏"]
  },
  ar: {
    greeting: ["مرحباً وأهلاً بك! 👋 أنا مساعدك AI من Younited. كيف يمكنني مساعدتك؟", "مرحباً مجدداً! 😊 ماذا تحتاج؟"],
    thanks: ["بكل سرور! 🙏", "شرف لي أن أساعدك! 😊"],
    whoAreYou: ["أنا مساعد AI من Younited. أعرف كل صفحة في التطبيق. 💙"],
    existence: ["Younited خدمة مالية راسخة تعمل في جميع أنحاء أوروبا. 🇪🇺 💙"],
    trust: ["Younited خدمة جادة وموثوقة. 💙 🙏"],
    security: ["أمنك هو أولويتنا المطلقة. 🔒 💙"],
    fees: ["اتصل بـ **خدمة العملاء** أو **القسم الإداري**. 🙏"],
    loan: ["للقروض: **القسم الإداري**. 💼"],
    transfer: ["تحويلات Younited سريعة وآمنة. ⚡ 1-3 دقائق. 💙"],
    wait: ["يتم التحقق من كل تحويل بعناية. ⏳ 🙏"],
    balance: ["تحقق من رصيدك في الصفحة الرئيسية. 💰 🙏"],
    iban: ["البيانات البنكية بنقرة واحدة. 📄 💙"],
    card: ["بطاقة افتراضية في قسم «البطاقة الافتراضية». 💳 🚀"],
    services: ["Younited يقدم: 💼\n\n• **تحويلات دولية**\n• **بطاقة افتراضية**\n• **إدارة الحساب**\n• **دعم متعدد اللغات**\n• **دعم على مدار الساعة**\n\n🚀"],
    problem: ["اتصل بـ **خدمة العملاء**. 💙"],
    howToTransfer: ["دليل التحويل: 📋\n\n**1.** **«المدفوعات»**\n**2.** املأ 6 حقول\n**3.** **«التالي»**\n**4.** رمز التفعيل\n**5.** **«تأكيد التحويل»**\n\n✅ 💙"],
    howToFindActivationCode: ["**رمز التفعيل**:\n\n**1.** عبر البريد الإلكتروني\n**2.** خدمة العملاء\n\n💙"],
    howToNavigate: ["🧭 **🏠 الرئيسية** · **💸 المدفوعات** · **💳 البطاقة** · **👤 الملف** 💙"],
    howToLogin: ["تسجيل الدخول: 🔐 البريد + PIN → **«تسجيل الدخول»**. 💙"],
    howToIban: ["IBAN: 📄 **«عرض IBAN الخاص بي»** → **«نسخ»**. 💙"],
    howToCard: ["البطاقة: 💳 **«البطاقة الافتراضية»**. 💙"],
    howToDeposit: ["الإيداعات: 💰 **القسم الإداري**. 💙"],
    howToCancelTransfer: ["الإلغاء: 🔄 خدمة العملاء. 💙"],
    howToViewReceipt: ["الإيصال: 🧾 انقر على المعاملة. 💙"],
    howToContactSupport: ["التواصل: 📞 **خدمة العملاء** / **القسم الإداري**. 💙"],
    help: ["يمكنني المساعدة: ✨ التحويلات، التنقل، الدخول، IBAN، البطاقة، الخدمات. 💙"],
    fallback: ["شكراً على رسالتك. 💙 هل يمكنك التوضيح؟ 🙏"]
  }
};

const CHAT_KEYWORDS = {
  existence: ['existe', 'vrai', 'réel', 'fake', 'arnaque', 'scam', 'fiable', 'sérieux', 'légitime', 'istnieje', 'prawdziwy', 'oszustwo', 'real', 'estafa', 'serio', 'esiste', 'vero', 'truffa', 'existiert', 'echt', 'betrug', 'seriös', 'קיים', 'אמיתי', 'הונאה', 'موجود', 'حقيقي', 'احتيال'],
  fees: ['frais', 'tarif', 'payer', 'coût', 'prix', 'commission', 'opłata', 'koszt', 'tarifa', 'coste', 'precio', 'commissione', 'costo', 'gebühr', 'kosten', 'עמלה', 'תשלום', 'رسوم', 'عمولة'],
  trust: ['confiance', 'peur', 'doute', 'inquiet', 'méfier', 'zaufanie', 'strach', 'confianza', 'miedo', 'duda', 'fiducia', 'paura', 'vertrauen', 'angst', 'אמון', 'פחד', 'ثقة', 'خوف'],
  security: ['sécurité', 'sécurisé', 'protégé', 'chiffré', 'bezpieczeństwo', 'ochrona', 'seguridad', 'protegido', 'sicurezza', 'protetto', 'sicherheit', 'geschützt', 'אבטחה', 'מוגן', 'أمن', 'محمي'],
  loan: ['prêt', 'crédit', 'emprunt', 'pożyczka', 'kredyt', 'préstamo', 'crédito', 'prestito', 'kredit', 'darlehen', 'הלוואה', 'אשראי', 'قرض', 'ائتمان'],
  transfer: ['virement', 'transfert', 'envoyer', 'recevoir', 'przelew', 'wysłać', 'transferencia', 'enviar', 'bonifico', 'inviare', 'überweisung', 'senden', 'העברה', 'לשלוח', 'تحويل', 'إرسال'],
  wait: ['attendre', 'attente', 'retard', 'lent', 'czekać', 'opóźnienie', 'esperar', 'retraso', 'aspettare', 'ritardo', 'warten', 'langsam', 'המתנה', 'עיכוב', 'انتظار', 'تأخير'],
  balance: ['solde', 'combien', 'sald', 'pieniądze', 'saldo', 'dinero', 'guthaben', 'geld', 'יתרה', 'כסף', 'رصيد', 'مال'],
  iban: ['iban', 'bic', 'swift', 'compte bancaire', 'konto bankowe', 'cuenta bancaria', 'conto bancario', 'bankkonto', 'חשבון בנק', 'حساب بنكي'],
  card: ['carte virtuelle', 'cvv', 'karta wirtualna', 'tarjeta virtual', 'carta virtuale', 'virtuelle karte', 'כרטיס', 'بطاقة'],
  services: ['services', 'que faites', 'fonctionnalités', 'usługi', 'servicios', 'servizi', 'dienstleistungen', 'שירותים', 'خدمات'],
  problem: ['problème', 'souci', 'bug', 'erreur', 'bloqué', 'problem', 'błąd', 'problema', 'errore', 'fehler', 'בעיה', 'שגיאה', 'مشكلة', 'خطأ'],
  whoAreYou: ['qui es-tu', 'présente toi', 'qui êtes-vous', 'kim jesteś', 'quién eres', 'chi sei', 'wer bist du', 'מי אתה', 'من أنت'],
  howToFindActivationCode: ['code d\'activation', 'trouver le code', 'activation transfert', 'kod aktywacyjny', 'código de activación', 'codice di attivazione', 'aktivierungscode', 'קוד הפעלה', 'رمز التفعيل'],
  howToTransfer: ['comment faire un virement', 'faire un virement', 'envoyer un virement', 'guide virement', 'jak zrobić przelew', 'como hacer transferencia', 'come fare bonifico', 'wie überweisen', 'איך לעשות העברה', 'كيفية التحويل'],
  howToCancelTransfer: ['annuler un virement', 'annuler transfert', 'annullare bonifico', 'überweisung stornieren', 'לבטל העברה', 'إلغاء التحويل'],
  howToViewReceipt: ['voir le reçu', 'consulter le reçu', 'historique des transactions', 'ver recibo', 'beleg anzeigen', 'לקבל קבלה', 'عرض الإيصال'],
  howToContactSupport: ['contacter le service', 'service client', 'service administratif', 'obsługa klienta', 'servicio al cliente', 'servizio clienti', 'kundenservice', 'שירות לקוחות', 'خدمة العملاء'],
  howToNavigate: ['comment naviguer', 'où cliquer', 'comment utiliser l\'application', 'jak nawigować', 'cómo navegar', 'come navigare', 'wie navigieren', 'ניווט', 'التنقل'],
  howToLogin: ['comment se connecter', 'comment me connecter', 'mot de passe oublié', 'jak się zalogować', 'cómo iniciar sesión', 'come accedere', 'wie anmelden', 'איך להתחבר', 'كيفية تسجيل الدخول'],
  howToIban: ['voir mon iban', 'où est mon iban', 'zobacz iban', 'ver iban', 'iban anzeigen', 'הצג iban', 'عرض iban'],
  howToCard: ['voir ma carte', 'afficher ma carte', 'zobacz kartę', 'ver tarjeta', 'carta virtuale', 'כרטיס וירטואלי', 'بطاقة افتراضية'],
  howToDeposit: ['déposer', 'dépôt', 'ajouter des fonds', 'wpłacić', 'depositar', 'einzahlen', 'הפקדה', 'إيداع'],
  help: ['aide', 'aidez-moi', 'j\'ai besoin d\'aide', 'pomoc', 'ayuda', 'aiuto', 'hilfe', 'עזרה', 'مساعدة'],
  thanks: ['merci', 'thanks', 'dziękuję', 'gracias', 'grazie', 'danke', 'תודה', 'شكراً'],
  greeting: ['bonjour', 'salut', 'bonsoir', 'hello', 'cześć', 'witaj', 'hola', 'ciao', 'hallo', 'שלום', 'مرحباً', 'أهلاً']
};

function normalizeText(str) {
  if (!str) return '';
  return String(str).toLowerCase()
    .replace(/[!?.,;:'"«»\-_()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textMatchesAny(text, keywords) {
  if (!text || !keywords) return false;
  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i].toLowerCase();
    if (kw.indexOf(' ') !== -1) {
      if (text.indexOf(kw) !== -1) return true;
    } else {
      var re = new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (re.test(text)) return true;
    }
  }
  return false;
}

function getChatbotResponse(userText) {
  var lang = currentLang || 'fr';
  var responses = CHAT_RESPONSES[lang] || CHAT_RESPONSES.fr;
  var text = normalizeText(userText);
  var category = 'fallback';

  if (textMatchesAny(text, CHAT_KEYWORDS.howToFindActivationCode)) category = 'howToFindActivationCode';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToTransfer)) category = 'howToTransfer';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToCancelTransfer)) category = 'howToCancelTransfer';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToViewReceipt)) category = 'howToViewReceipt';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToContactSupport)) category = 'howToContactSupport';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToLogin)) category = 'howToLogin';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToIban)) category = 'howToIban';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToCard)) category = 'howToCard';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToDeposit)) category = 'howToDeposit';
  else if (textMatchesAny(text, CHAT_KEYWORDS.howToNavigate)) category = 'howToNavigate';
  else if (textMatchesAny(text, CHAT_KEYWORDS.help)) category = 'help';
  else if (textMatchesAny(text, CHAT_KEYWORDS.existence)) category = 'existence';
  else if (textMatchesAny(text, CHAT_KEYWORDS.fees)) category = 'fees';
  else if (textMatchesAny(text, CHAT_KEYWORDS.security)) category = 'security';
  else if (textMatchesAny(text, CHAT_KEYWORDS.loan)) category = 'loan';
  else if (textMatchesAny(text, CHAT_KEYWORDS.problem)) category = 'problem';
  else if (textMatchesAny(text, CHAT_KEYWORDS.transfer)) category = 'transfer';
  else if (textMatchesAny(text, CHAT_KEYWORDS.wait)) category = 'wait';
  else if (textMatchesAny(text, CHAT_KEYWORDS.balance)) category = 'balance';
  else if (textMatchesAny(text, CHAT_KEYWORDS.iban)) category = 'iban';
  else if (textMatchesAny(text, CHAT_KEYWORDS.card)) category = 'card';
  else if (textMatchesAny(text, CHAT_KEYWORDS.services)) category = 'services';
  else if (textMatchesAny(text, CHAT_KEYWORDS.trust)) category = 'trust';
  else if (textMatchesAny(text, CHAT_KEYWORDS.whoAreYou)) category = 'whoAreYou';
  else if (textMatchesAny(text, CHAT_KEYWORDS.thanks)) category = 'thanks';
  else if (textMatchesAny(text, CHAT_KEYWORDS.greeting)) category = 'greeting';

  var pool = responses[category] || responses.fallback || CHAT_RESPONSES.fr.fallback;
  return pool[Math.floor(Math.random() * pool.length)];
}

let currentLang = 'fr';
let currentClient = null;
let progressInterval = null;
let clientUnsubscribe = null;
let pendingTransferAmount = 0;
let pendingTransferPercent = 100;
let virtualCardRevealed = false;
let currentTransactions = [];
let chatbotOpen = false;

const t = (k) => { const d = i18n[currentLang] || i18n.fr; return d[k] !== undefined ? d[k] : (i18n.fr[k] || k); };

const formatAmount = (a, c) => {
  const num = typeof a === 'number' ? a : (parseFloat(a) || 0);
  return String(num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace(/\u202F/g, ' ') + ' ' + c;
};

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
    .admin-group label, .quick-actions-card label, .option-panel-toggle-label, .admin-auth .auth-group label { font-size: 12.5px !important; letter-spacing: 0.2px !important; line-height: 1.35 !important; }
    .admin-group input, .admin-group select, .admin-group textarea, .quick-actions-card input, .quick-actions-card select, .quick-actions-card textarea { font-size: 14.5px !important; line-height: 1.35 !important; padding-top: 10px !important; padding-bottom: 10px !important; }
    .admin-auth input { font-size: 14.5px !important; }
    .option-panel-title, .option-panel-title span { font-size: 13px !important; line-height: 1.35 !important; }
    .option-panel-desc { font-size: 12.5px !important; line-height: 1.55 !important; }
    .qa-switch-text { font-size: 13px !important; line-height: 1.4 !important; }
    .pending-transfer-card .pt-title { font-size: 13px !important; }
    .pending-transfer-card .pt-subtitle { font-size: 12.5px !important; line-height: 1.55 !important; }
    .pending-transfer-card .pt-status-label { font-size: 12px !important; }
    .pending-transfer-status-badge { font-size: 11px !important; }
    .admin-section-title { font-size: 12.5px !important; line-height: 1.35 !important; }
    .qac-title { font-size: 13px !important; line-height: 1.35 !important; }
    .qac-subtitle { font-size: 12.5px !important; line-height: 1.5 !important; }
    .qa-card-holder-note { font-size: 12px !important; line-height: 1.5 !important; }
    .client-list-title { font-size: 11.5px !important; }
    .admin-pending-empty, .admin-transfers-empty { font-size: 12px !important; }
    .admin-pending-name, .admin-transfer-name { font-size: 13.5px !important; }
    .admin-pending-meta, .admin-transfer-meta { font-size: 11.5px !important; }
    .admin-pending-amount, .admin-transfer-amount { font-size: 15px !important; }
    .admin-pending-btn, .admin-transfer-cancel-btn, .client-line-btn { font-size: 12px !important; }
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
  const previousClient = currentClient;
  currentClient = fresh;
  currentLang = fresh.language || 'fr';
  applyTheme(fresh.themeColor);
  try { applyDirection(currentLang); } catch (e) {}

  try {
    if (previousClient && previousClient.transactions) {
      const prevCancelledCount = previousClient.transactions.filter(function (t) {
        return t && (t.type === 'cancelled' || t.cancelled === true);
      }).length;
      const newTxs = fresh.transactions || [];
      const newCancelledList = newTxs.filter(function (t) {
        return t && (t.type === 'cancelled' || t.cancelled === true);
      });
      if (newCancelledList.length > prevCancelledCount) {
        const newTx = newCancelledList[0];
        const msg = (t('transferCancelledMsg') || 'Virement annulé.')
          .replace('{amount}', newTx.amount || '—')
          .replace('{name}', newTx.subtitle || '—')
          .replace('{iban}', newTx.recipientIban || '—');
        setTimeout(function () {
          window.showNotif(msg, 'purple', t('transferCancelledTitle') || 'Virement annulé');
        }, 500);
      }
    }
  } catch (e) {}

  const currency = fresh.currency || '€';
  const balanceFormatted = formatAmount(fresh.balance || 0, currency);
  const balanceRaw = (parseFloat(fresh.balance) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u202F/g, ' ');
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
  try {
    const chatTitle = document.getElementById('tw-chat-title');
    if (chatTitle) { const L = CHAT_LABELS[currentLang] || CHAT_LABELS.fr; chatTitle.textContent = L.title; }
    const chatSub = document.getElementById('tw-chat-subtitle');
    if (chatSub) { const L = CHAT_LABELS[currentLang] || CHAT_LABELS.fr; chatSub.textContent = L.subtitle; }
    const chatInput = document.getElementById('tw-chat-input');
    if (chatInput) { const L = CHAT_LABELS[currentLang] || CHAT_LABELS.fr; chatInput.placeholder = L.placeholder; }
  } catch (e) {}
  if (previousLang !== currentLang) {
    const navLabels = { 'nav-dashboard': 'navBalance', 'nav-transfer': 'navPaymentsNew', 'nav-card': 'navCard', 'nav-profile': 'navAccount' };
    Object.keys(navLabels).forEach(function (navId) { const el = document.getElementById(navId); if (el) { const span = el.querySelector('span'); if (span) span.textContent = t(navLabels[navId]); } });
  }
}

function subscribeToClient(clientId) {
  if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; }
  try {
    clientUnsubscribe = onSnapshot(doc(db, 'clients', clientId), (snap) => {
      if (!snap.exists()) {
        ClientSession.clear();
        if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; }
        try { removeChatbot(); } catch (e) {}
        initClient();
        return;
      }
      const fresh = Object.assign({ id: snap.id }, snap.data());
      const previousClient = currentClient;
      const previousLang = currentLang;
      const appRoot = document.getElementById('app-root');
      const hasStatusScreen = appRoot && appRoot.querySelector('.twd-status-screen');

      if (fresh.blocked) {
        if (hasStatusScreen) {
          if (previousLang !== (fresh.language || 'fr')) {
            currentClient = fresh;
            currentLang = fresh.language || 'fr';
            applyTheme(fresh.themeColor);
            try { removeChatbot(); } catch (e) {}
            setTimeout(function () { initClient(); }, 0);
          }
          return;
        }
        ClientSession.clear();
        if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; }
        try { removeChatbot(); } catch (e) {}
        initClient();
        return;
      }

      const wasBlocked = previousClient && previousClient.blocked === true;
      const langChanged = previousLang !== (fresh.language || 'fr');
      if (wasBlocked || hasStatusScreen || langChanged) {
        currentClient = fresh;
        currentLang = fresh.language || 'fr';
        applyTheme(fresh.themeColor);
        setTimeout(function () {
          const activeId = ClientSession.getActive();
          if (activeId === clientId) renderBankingApp(fresh);
          else renderLoginPage(fresh);
        }, 0);
        return;
      }

      syncClientUI(fresh);
    }, () => {});
  } catch (e) {}
}

export function initClientApp() { initClient(); }
export function initAdminApp() { initAdmin(); }
export function initSuperAdminApp() { initSuperAdmin(); }

function ensureStatusScreensStyles() {
  if (document.getElementById('twd-status-styles')) return;
  const style = document.createElement('style');
  style.id = 'twd-status-styles';
  style.textContent = `
    .twd-status-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 32px 24px; text-align: center; background: #ffffff; box-sizing: border-box; font-family: 'Titillium Web', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .twd-status-screen > * { animation: twdStatusIn 0.5s ease-out both; }
    @keyframes twdStatusIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .twd-status-icon { width: 140px; height: 140px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 28px; flex-shrink: 0; }
    .twd-status-icon.blocked { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); color: #dc2626; box-shadow: 0 14px 36px rgba(220, 38, 38, 0.22), 0 0 0 8px rgba(220, 38, 38, 0.05); }
    .twd-status-icon.deleted { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); color: #475569; box-shadow: 0 14px 36px rgba(71, 85, 105, 0.22), 0 0 0 8px rgba(71, 85, 105, 0.05); }
    .twd-status-icon svg { width: 84px; height: 84px; display: block; }
    .twd-status-title { font-size: 22px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.3px; line-height: 1.25; white-space: normal; word-break: break-word; font-family: 'Titillium Web', sans-serif; }
    .twd-status-title.blocked { color: #b91c1c; }
    .twd-status-title.deleted { color: #334155; }
    .twd-status-desc { font-size: 14px; color: #475569; line-height: 1.6; max-width: 320px; font-weight: 500; white-space: normal; word-break: break-word; font-family: 'Titillium Web', sans-serif; }
    @media (max-width: 400px) { .twd-status-icon { width: 120px; height: 120px; } .twd-status-icon svg { width: 70px; height: 70px; } .twd-status-title { font-size: 20px; } .twd-status-desc { font-size: 13px; } }
  `;
  document.head.appendChild(style);
}

// ★ CHATBOT IA — Styles, injection, rendu, moteur
function ensureChatbotStyles() {
  if (document.getElementById('tw-chat-styles')) return;
  const style = document.createElement('style');
  style.id = 'tw-chat-styles';
  style.textContent = `
    #tw-chat-fab { position: fixed; right: 14px; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #ec4899 0%, #a855f7 35%, #6366f1 65%, #06b6d4 100%); border: 2.5px solid rgba(255,255,255,0.9); cursor: pointer; box-shadow: 0 12px 30px rgba(168, 85, 247, 0.55), 0 6px 14px rgba(15, 23, 42, 0.28), inset 0 2px 4px rgba(255,255,255,0.35); display: flex; align-items: center; justify-content: center; z-index: 9998; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease; -webkit-tap-highlight-color: transparent; animation: twChatFabBounce 3s ease-in-out infinite; }
    #tw-chat-fab:active { transform: scale(0.92); }
    #tw-chat-fab svg { width: 32px; height: 32px; display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25)); position: relative; z-index: 2; }
    #tw-chat-fab.tw-chat-hidden { display: none !important; }
    @keyframes twChatFabBounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.04); } }
    #tw-chat-fab::before { content: ''; position: absolute; inset: -8px; border-radius: 50%; background: radial-gradient(circle, rgba(236,72,153,0.45) 0%, rgba(99,102,241,0.35) 50%, transparent 75%); animation: twChatPulse 2.2s ease-out infinite; z-index: -1; pointer-events: none; }
    #tw-chat-fab::after { content: ''; position: absolute; inset: -14px; border-radius: 50%; background: radial-gradient(circle, rgba(6,182,212,0.28) 0%, transparent 70%); animation: twChatPulse 2.2s ease-out infinite 0.5s; z-index: -2; pointer-events: none; }
    @keyframes twChatPulse { 0% { transform: scale(0.85); opacity: 0.85; } 70% { transform: scale(1.35); opacity: 0; } 100% { transform: scale(1.4); opacity: 0; } }
    .tw-chat-ai-badge { position: absolute; top: -6px; right: -6px; min-width: 24px; height: 20px; padding: 0 6px; border-radius: 10px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #ffffff; font-size: 10px; font-weight: 900; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(245, 158, 11, 0.55); font-family: 'Titillium Web', sans-serif; z-index: 3; text-transform: uppercase; }
    .tw-chat-ai-badge::before { content: '✦'; margin-right: 2px; font-size: 9px; }
    .tw-chat-tooltip { position: fixed; right: 86px; bottom: calc(105px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 8px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 700; font-family: 'Titillium Web', sans-serif; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.35); white-space: nowrap; z-index: 9997; animation: twChatTooltipIn 0.5s ease-out 1s both; pointer-events: none; border: 1px solid rgba(255,255,255,0.15); }
    .tw-chat-tooltip::after { content: ''; position: absolute; right: -6px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 6px solid #1e293b; }
    .tw-chat-tooltip.tw-chat-tooltip-hidden { display: none !important; }
    @keyframes twChatTooltipIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
    #tw-chat-window { position: fixed; right: 14px; bottom: calc(84px + env(safe-area-inset-bottom, 0px)); width: calc(100vw - 28px); max-width: 380px; height: 72vh; max-height: 580px; background: #ffffff; border-radius: 20px; box-shadow: 0 26px 70px rgba(168, 85, 247, 0.35), 0 10px 30px rgba(15, 23, 42, 0.22); display: none; flex-direction: column; overflow: hidden; z-index: 9999; transform-origin: bottom right; animation: twChatOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); border: 2px solid rgba(168, 85, 247, 0.25); }
    #tw-chat-window.tw-chat-open { display: flex; }
    @keyframes twChatOpen { from { opacity: 0; transform: translateY(20px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .tw-chat-header { background: linear-gradient(135deg, #ec4899 0%, #a855f7 30%, #6366f1 65%, #06b6d4 100%); padding: 14px 16px; display: flex; align-items: center; gap: 11px; color: #ffffff; flex-shrink: 0; position: relative; overflow: hidden; }
    .tw-chat-header-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; border: 2.5px solid rgba(255,255,255,0.55); box-shadow: 0 4px 12px rgba(0,0,0,0.28); }
    .tw-chat-header-avatar svg { width: 24px; height: 24px; display: block; fill: #7c3aed; }
    .tw-chat-header-avatar::after { content: ''; position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; border: 2.5px solid #ffffff; }
    .tw-chat-header-text { flex: 1; min-width: 0; }
    #tw-chat-title { font-size: 14.5px; font-weight: 800; color: #ffffff; line-height: 1.2; font-family: 'Titillium Web', sans-serif; display: flex; align-items: center; gap: 6px; }
    #tw-chat-title::before { content: '✦'; font-size: 12px; color: #fde68a; }
    #tw-chat-subtitle { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.9); margin-top: 3px; font-family: 'Titillium Web', sans-serif; }
    .tw-chat-close-btn { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.32); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tw-chat-close-btn svg { width: 13px; height: 13px; fill: #ffffff; }
    .tw-chat-messages { flex: 1; overflow-y: auto; padding: 14px 12px; background: linear-gradient(180deg, #faf5ff 0%, #f1f5f9 60%, #f8fafc 100%); display: flex; flex-direction: column; gap: 10px; }
    .tw-chat-msg { display: flex; align-items: flex-end; gap: 7px; max-width: 90%; animation: twChatMsgIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; word-wrap: break-word; }
    @keyframes twChatMsgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .tw-chat-msg.tw-chat-msg-user { align-self: flex-end; flex-direction: row-reverse; }
    .tw-chat-msg.tw-chat-msg-bot { align-self: flex-start; }
    .tw-chat-msg-avatar { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .tw-chat-msg-bot .tw-chat-msg-avatar { background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); }
    .tw-chat-msg-user .tw-chat-msg-avatar { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
    .tw-chat-msg-avatar svg { width: 15px; height: 15px; display: block; }
    .tw-chat-msg-bubble { padding: 11px 14px; border-radius: 16px; font-size: 13px; font-weight: 500; line-height: 1.55; word-break: break-word; font-family: 'Titillium Web', sans-serif; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08); }
    .tw-chat-msg-bot .tw-chat-msg-bubble { background: #ffffff; color: #0f172a; border-bottom-left-radius: 4px; border: 1px solid #e9d5ff; }
    .tw-chat-msg-user .tw-chat-msg-bubble { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; border-bottom-right-radius: 4px; }
    .tw-chat-msg-time { font-size: 9px; color: #94a3b8; margin-top: 3px; font-weight: 600; font-family: 'Titillium Web', sans-serif; }
    .tw-chat-typing { display: flex; align-items: center; gap: 7px; align-self: flex-start; max-width: 80%; }
    .tw-chat-typing .tw-chat-msg-avatar { background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); }
    .tw-chat-typing-bubble { background: #ffffff; border: 1px solid #e9d5ff; padding: 12px 16px; border-radius: 16px; display: flex; align-items: center; gap: 4px; }
    .tw-chat-typing-dot { width: 6px; height: 6px; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #6366f1); animation: twChatTyping 1.2s ease-in-out infinite; }
    .tw-chat-typing-dot:nth-child(1) { animation-delay: 0s; }
    .tw-chat-typing-dot:nth-child(2) { animation-delay: 0.18s; }
    .tw-chat-typing-dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes twChatTyping { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
    .tw-chat-footer { padding: 10px 10px 12px 10px; background: #ffffff; border-top: 1px solid #f3e8ff; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    #tw-chat-input { flex: 1; min-width: 0; padding: 12px 15px; border: 1.5px solid #e9d5ff; border-radius: 24px; font-size: 13px; font-weight: 500; color: #0f172a; background: #faf5ff; outline: none; font-family: 'Titillium Web', sans-serif; }
    #tw-chat-input:focus { border-color: #a855f7; background: #ffffff; }
    #tw-chat-send { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #06b6d4 100%); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    #tw-chat-send svg { width: 19px; height: 19px; fill: #ffffff; }
    @media (max-width: 420px) {
      #tw-chat-fab { right: 12px; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); width: 60px; height: 60px; }
      #tw-chat-window { right: 8px; left: 8px; width: auto; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); height: 74vh; max-height: none; }
    }
  `;
  document.head.appendChild(style);
}

function removeChatbot() {
  var fab = document.getElementById('tw-chat-fab');
  if (fab) fab.remove();
  var win = document.getElementById('tw-chat-window');
  if (win) win.remove();
  var tooltip = document.getElementById('tw-chat-tooltip');
  if (tooltip) tooltip.remove();
  chatbotOpen = false;
}

function loadChatMessages() {
  if (!currentClient) return [];
  var msgs = currentClient.aiMessages;
  if (msgs && Array.isArray(msgs) && msgs.length > 0) return msgs;
  try {
    var localKey = 'tw_ai_msgs_' + currentClient.id;
    var localMsgs = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (Array.isArray(localMsgs) && localMsgs.length > 0) return localMsgs;
  } catch (e) {}
  return [];
}

function saveChatMessage(role, text) {
  if (!currentClient || !currentClient.id) return;
  var msg = { role: role, text: text, ts: Date.now() };
  try {
    var localKey = 'tw_ai_msgs_' + currentClient.id;
    var localMsgs = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (!Array.isArray(localMsgs)) localMsgs = [];
    localMsgs.push(msg);
    if (localMsgs.length > 200) localMsgs = localMsgs.slice(-200);
    localStorage.setItem(localKey, JSON.stringify(localMsgs));
  } catch (e) {}
  var txs = (currentClient.aiMessages || []).slice();
  if (!Array.isArray(txs)) txs = [];
  txs.push(msg);
  if (txs.length > 200) txs = txs.slice(-200);
  currentClient.aiMessages = txs;
  try { FireDB.updateClient(currentClient.id, { aiMessages: txs }).catch(function () {}); } catch (e) {}
}

function formatChatTime(ts) {
  try {
    var d = new Date(ts);
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  } catch (e) { return ''; }
}

function robotAvatarSvg(size) {
  return '<svg viewBox="0 0 24 24" fill="#ffffff" style="width:' + (size || 15) + 'px;height:' + (size || 15) + 'px;display:block;"><path d="M12 2a1 1 0 0 1 1 1v1h3a3 3 0 0 1 3 3v2h1a1 1 0 0 1 0 2h-1v2a3 3 0 0 1-3 3h-1v1a1 1 0 0 1-2 0v-1h-2v1a1 1 0 0 1-2 0v-1H8a3 3 0 0 1-3-3v-2H4a1 1 0 0 1 0-2h1V7a3 3 0 0 1 3-3h3V3a1 1 0 0 1 1-1zm-2.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9 14a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9z"/></svg>';
}

function renderChatMessages() {
  var container = document.getElementById('tw-chat-messages');
  if (!container) return;
  var msgs = loadChatMessages();
  var L = CHAT_LABELS[currentLang] || CHAT_LABELS.fr;
  var html = '';
  if (!msgs || msgs.length === 0) {
    var welcomeText = L.welcomeTitle + '\n\n' + L.welcomeBody;
    html = '<div class="tw-chat-msg tw-chat-msg-bot"><div class="tw-chat-msg-avatar">' + robotAvatarSvg(15) + '</div><div><div class="tw-chat-msg-bubble">' + welcomeText.replace(/\n/g, '<br>') + '</div><div class="tw-chat-msg-time">' + formatChatTime(Date.now()) + '</div></div></div>';
  } else {
    msgs.forEach(function (m) {
      var isUser = m.role === 'user';
      var cls = isUser ? 'tw-chat-msg-user' : 'tw-chat-msg-bot';
      var avatarSvg = isUser
        ? '<svg viewBox="0 0 24 24" fill="#ffffff" style="width:15px;height:15px;display:block;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
        : robotAvatarSvg(15);
      var safeText = String(m.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
      html += '<div class="tw-chat-msg ' + cls + '"><div class="tw-chat-msg-avatar">' + avatarSvg + '</div><div><div class="tw-chat-msg-bubble">' + safeText + '</div><div class="tw-chat-msg-time">' + formatChatTime(m.ts || Date.now()) + '</div></div></div>';
    });
  }
  container.innerHTML = html;
  setTimeout(function () { container.scrollTop = container.scrollHeight; }, 50);
}

function showChatTyping() {
  var container = document.getElementById('tw-chat-messages');
  if (!container) return;
  var existing = document.getElementById('tw-chat-typing');
  if (existing) existing.remove();
  var typing = document.createElement('div');
  typing.id = 'tw-chat-typing';
  typing.className = 'tw-chat-typing';
  typing.innerHTML = '<div class="tw-chat-msg-avatar">' + robotAvatarSvg(15) + '</div><div class="tw-chat-typing-bubble"><span class="tw-chat-typing-dot"></span><span class="tw-chat-typing-dot"></span><span class="tw-chat-typing-dot"></span></div>';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function hideChatTyping() {
  var t = document.getElementById('tw-chat-typing');
  if (t) t.remove();
}

window.openChatbot = function () {
  var win = document.getElementById('tw-chat-window');
  if (!win) return;
  chatbotOpen = true;
  win.classList.add('tw-chat-open');
  setTimeout(function () { renderChatMessages(); }, 30);
  setTimeout(function () { var input = document.getElementById('tw-chat-input'); if (input) { try { input.focus(); } catch (e) {} } }, 250);
};

window.closeChatbot = function () {
  var win = document.getElementById('tw-chat-window');
  if (!win) return;
  chatbotOpen = false;
  win.classList.remove('tw-chat-open');
};

window.toggleChatbot = function () {
  if (chatbotOpen) window.closeChatbot();
  else window.openChatbot();
};

window.sendChatMessage = function () {
  var input = document.getElementById('tw-chat-input');
  if (!input) return;
  var text = String(input.value || '').trim();
  if (!text) return;
  input.value = '';
  saveChatMessage('user', text);
  renderChatMessages();
  showChatTyping();
  var delay = 700 + Math.floor(Math.random() * 600);
  setTimeout(function () {
    var reply = getChatbotResponse(text);
    hideChatTyping();
    saveChatMessage('bot', reply);
    renderChatMessages();
  }, delay);
};

function injectChatbot(client) {
  if (!client) return;
  removeChatbot();
  ensureChatbotStyles();
  var L = CHAT_LABELS[currentLang] || CHAT_LABELS.fr;

  var fab = document.createElement('button');
  fab.id = 'tw-chat-fab';
  fab.setAttribute('type', 'button');
  fab.setAttribute('aria-label', L.title);
  fab.innerHTML = robotAvatarSvg(30) + '<span class="tw-chat-ai-badge">AI</span>';
  fab.addEventListener('click', function () {
    var tt = document.getElementById('tw-chat-tooltip');
    if (tt) tt.classList.add('tw-chat-tooltip-hidden');
    window.toggleChatbot();
  });
  document.body.appendChild(fab);

  var tooltip = document.createElement('div');
  tooltip.id = 'tw-chat-tooltip';
  tooltip.className = 'tw-chat-tooltip';
  tooltip.textContent = '💬 ' + L.title;
  document.body.appendChild(tooltip);
  setTimeout(function () { var t = document.getElementById('tw-chat-tooltip'); if (t) t.classList.add('tw-chat-tooltip-hidden'); }, 8000);

  var win = document.createElement('div');
  win.id = 'tw-chat-window';
  win.innerHTML =
    '<div class="tw-chat-header">' +
      '<div class="tw-chat-header-avatar">' + robotAvatarSvg(24) + '</div>' +
      '<div class="tw-chat-header-text">' +
        '<div id="tw-chat-title">' + L.title + '</div>' +
        '<div id="tw-chat-subtitle">' + L.subtitle + '</div>' +
      '</div>' +
      '<button type="button" class="tw-chat-close-btn" onclick="window.closeChatbot()" aria-label="Close">' +
        '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="tw-chat-messages" id="tw-chat-messages"></div>' +
    '<div class="tw-chat-footer">' +
      '<input type="text" id="tw-chat-input" placeholder="' + L.placeholder + '" autocomplete="off" />' +
      '<button type="button" id="tw-chat-send" onclick="window.sendChatMessage()" aria-label="Send">' +
        '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
      '</button>' +
    '</div>';
  document.body.appendChild(win);

  var chatInput = document.getElementById('tw-chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendChatMessage(); }
    });
  }
  renderChatMessages();
}

async function initClient() {
  const clientId = new URLSearchParams(window.location.search).get('id');
  const root = document.getElementById('app-root');
  if (!root) return;
  ensureGlobalStyles();
  ensureStatusScreensStyles();
  try { removeChatbot(); } catch (e) {}
  if (!clientId) { root.innerHTML = '<div class="view active"><div class="no-access"><div class="ico"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div><h2>Acces restreint</h2><p>Cette application necessite un lien de connexion valide.</p></div></div>'; return; }
  const client = await FireDB.getClient(clientId);
  if (!client) {
    var navLang = (navigator.language || 'fr').toLowerCase().slice(0, 2);
    var AVAILABLE_LANGS = ['fr', 'pl', 'es', 'it', 'de', 'he', 'hr', 'ro', 'nl', 'pt', 'el', 'cs', 'hu', 'sv', 'ar'];
    if (AVAILABLE_LANGS.indexOf(navLang) === -1) navLang = 'fr';
    currentLang = navLang;
    try { applyDirection(currentLang); } catch (e) {}
    root.innerHTML = '<div class="view active"><div class="twd-status-screen"><div class="twd-status-icon deleted"><svg viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="46" y="14" width="28" height="10" rx="5" fill="currentColor"/><rect x="16" y="26" width="88" height="14" rx="4" fill="currentColor"/><path d="M24 40 L32 108 Q33 114 40 114 H80 Q87 114 88 108 L96 40 Z" fill="currentColor"/><line x1="42" y1="52" x2="42" y2="104" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><line x1="60" y1="52" x2="60" y2="104" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><line x1="78" y1="52" x2="78" y2="104" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></svg></div><div class="twd-status-title deleted">' + t('deletedTitle') + '</div><div class="twd-status-desc">' + t('deletedDesc') + '</div></div></div>'; return;
  }
  if (client.blocked) {
    currentLang = client.language || 'fr';
    try { applyDirection(currentLang); } catch (e) {}
    root.innerHTML = '<div class="view active"><div class="twd-status-screen"><div class="twd-status-icon blocked"><svg viewBox="0 0 175 125" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M33 52V40a22 22 0 0 1 44 0v12" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><rect x="20" y="52" width="70" height="55" rx="8" fill="currentColor"/><circle cx="55" cy="75" r="6" fill="#ffffff"/><rect x="52.5" y="75" width="5" height="14" rx="2" fill="#ffffff"/><g transform="translate(110, 75)" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="0" cy="0" r="11"/><circle cx="0" cy="0" r="4" fill="currentColor" stroke="none"/><line x1="11" y1="0" x2="50" y2="0"/><line x1="43" y1="0" x2="43" y2="8"/><line x1="35" y1="0" x2="35" y2="6"/></g></svg></div><div class="twd-status-title blocked">' + t('blockedTitle') + '</div><div class="twd-status-desc">' + t('blockedDesc') + '</div></div></div>'; return;
  }
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  try { applyDirection(currentLang); } catch (e) {}
  const activeId = ClientSession.getActive();
  if (activeId === clientId) renderBankingApp(client);
  else renderLoginPage(client);
}

function renderLoginPage(client) {
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  try { applyDirection(currentLang); } catch (e) {}
  ensureGlobalStyles();
  try { removeChatbot(); } catch (e) {}
  const root = document.getElementById('app-root');
  const clientName = (client.firstName + ' ' + client.lastName).toUpperCase();

  root.innerHTML = '<div class="view active"><div class="yld-page"><div class="yld-card">' +
    '<div class="yld-logo">' +
      '<svg class="yld-logo-mark" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="14" cy="12" r="4" fill="#0d9488"/><circle cx="24" cy="8" r="3" fill="#0d9488"/><circle cx="34" cy="10" r="2.5" fill="#22c55e"/><circle cx="43" cy="15" r="2.5" fill="#84cc16"/><circle cx="7" cy="22" r="3.5" fill="#0d9488"/><circle cx="6" cy="34" r="3.5" fill="#0d9488"/><circle cx="10" cy="45" r="3" fill="#14b8a6"/><circle cx="20" cy="52" r="2.5" fill="#14b8a6"/><circle cx="32" cy="50" r="3" fill="#0d9488"/><circle cx="43" cy="43" r="3" fill="#0d9488"/><circle cx="50" cy="33" r="3" fill="#0d9488"/><circle cx="49" cy="21" r="2.5" fill="#14b8a6"/><circle cx="20" cy="22" r="2" fill="#5eead4"/><circle cx="24" cy="32" r="2.5" fill="#5eead4"/><circle cx="22" cy="42" r="2" fill="#5eead4"/><circle cx="33" cy="22" r="1.5" fill="#84cc16"/><circle cx="37" cy="30" r="2" fill="#84cc16"/><circle cx="34" cy="40" r="1.5" fill="#14b8a6"/>' +
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
        '<circle cx="40" cy="45" r="2.4" fill="#1d4ed8"/><rect x="38.8" y="45" width="2.4" height="6" rx="1.2" fill="#1d4ed8"/>' +
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
  if (isHidden) { eyeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'; }
  else { eyeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'; }
};

function ensureProfileStyles() {
  if (document.getElementById('profile-new-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-new-styles';
  style.textContent = `
    .profile-wrap-new{padding:11px;display:flex;flex-direction:column;gap:11px;background:#f1f5f9;padding-bottom:24px;}
    .profile-hero-new{position:relative;background:linear-gradient(135deg,var(--primary-dark) 0%,var(--primary) 100%);border-radius:6px;padding:16px 14px 18px 14px;overflow:hidden;box-shadow:0 12px 26px rgba(30,58,138,0.32);}
    .profile-hero-top{display:flex;align-items:flex-start;gap:14px;position:relative;z-index:2;}
    .profile-avatar-new{position:relative;width:74px;height:74px;flex-shrink:0;}
    .profile-avatar-circle{width:74px;height:74px;border-radius:50%;background:rgba(255,255,255,0.22);border:2.5px solid rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff;}
    .profile-avatar-cam{position:absolute;bottom:-2px;right:-4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.35);border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;}
    .profile-avatar-cam svg{width:11px;height:11px;fill:#fff;}
    .profile-hero-info{flex:1;min-width:0;padding-top:2px;}
    .profile-hero-name{font-size:16px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:6px;word-break:break-word;}
    .profile-hero-status{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:#fff;margin-bottom:6px;}
    .profile-hero-status .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;}
    .profile-hero-email{display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:500;color:rgba(255,255,255,0.88);margin-bottom:9px;}
    .profile-hero-email svg{width:12px;height:12px;fill:rgba(255,255,255,0.88);flex-shrink:0;}
    .profile-hero-email span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .profile-hero-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.4);padding:5px 11px;border-radius:16px;font-size:9.5px;font-weight:700;color:#fff;}
    .profile-hero-badge svg{width:12px;height:12px;fill:#fff;flex-shrink:0;}
    .profile-edit-btn-new{position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.42);color:#fff;padding:6px 11px;border-radius:14px;font-size:10px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-family:inherit;z-index:3;}
    .profile-edit-btn-new svg{width:11px;height:11px;fill:#fff;flex-shrink:0;}
    .profile-card-new{background:#fff;border-radius:6px;box-shadow:0 3px 12px rgba(15,23,42,0.07);border:1px solid #eef2f7;overflow:hidden;}
    .profile-card-header-new{display:flex;align-items:center;gap:11px;padding:12px 13px;border-bottom:1px solid #f1f5f9;}
    .profile-card-header-icon{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
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
    .profile-logout-new{width:100%;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:#fff;border:none;border-radius:8px;padding:13px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:9px;}
    .profile-logout-new svg{width:17px;height:17px;fill:#fff;flex-shrink:0;}
    .profile-security-new{position:relative;display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border:1px solid #bfdbfe;border-radius:6px;padding:12px 13px;overflow:hidden;}
    .profile-security-icon{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .profile-security-icon svg{width:17px;height:17px;fill:#fff;}
    .profile-security-text{flex:1;min-width:0;}
    .profile-security-title{font-size:11px;font-weight:800;color:#1e3a8a;margin-bottom:2px;}
    .profile-security-desc{font-size:9px;color:#3b82f6;font-weight:500;line-height:1.4;}
    .profile-security-check{width:22px;height:22px;flex-shrink:0;}
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
  try { applyDirection(currentLang); } catch (e) {}
  ensureGlobalStyles();
  ensureProfileStyles();
  const root = document.getElementById('app-root');
  const currency = client.currency || '€';
  const balanceFormatted = formatAmount(client.balance || 0, currency);
  const balanceRaw = (parseFloat(client.balance) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u202F/g, ' ');
  const initials = ((client.firstName || '').charAt(0) + (client.lastName || '').charAt(0)).toUpperCase();

  root.innerHTML = '<div class="view active" style="display:flex;flex-direction:column;height:100%;">' +
    '<header class="header-new"><button class="hamburger-btn" onclick="window.ClientLogout()"><svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg></button><div class="header-brand-new"><svg class="header-logo-new" viewBox="0 0 40 40"><rect x="0" y="0" width="40" height="40" rx="9" fill="#1e40af"/><path d="M10 12h16v4H14v4h10v4H14v6h-4V12z" fill="#fff"/><path d="M24 22l6-4v8l-6-4z" fill="#60a5fa"/></svg><div class="header-brand-text-new"><div class="header-brand-title-new">YOUNITED</div></div></div><div class="header-actions-new"><button class="header-icon-btn-new" onclick="window.showNotif(\'' + t('notifSubInfo') + '\', \'info\')"><svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg><span class="header-notif-dot-new"></span></button><button class="header-icon-btn-new avatar-new" onclick="window.navigateTo(\'screen-profile\')"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff"/></svg></button></div></header>' +
    '<div class="screens-container">' +
      '<div id="screen-dashboard" class="screen active">' +
        '<div class="greeting-wrap-new"><div class="greeting-left-new"><span class="greeting-emoji-new">👋</span><div class="greeting-text-new"><div class="greeting-title-new">' + t('greeting') + ', ' + client.firstName + ' ' + client.lastName + '</div></div></div><div class="account-status-badge-new"><span class="account-status-dot-new"></span>' + t('accountActive') + '</div></div>' +
        '<div class="balance-card-new"><div class="balance-bubbles-new"><span class="bbn b1"></span><span class="bbn b2"></span><span class="bbn b3"></span><span class="bbn b4"></span><span class="bbn b5"></span></div><div class="balance-card-inner-new"><div class="balance-card-top-new"><div class="balance-card-type-icon-new"><svg viewBox="0 0 24 24"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg></div><div class="balance-card-type-label-new">' + t('personalLabel') + ' · <span class="curr-symbol">' + getCurrencyCode(currency) + '</span></div></div><div class="balance-card-amount-new">' + (function(){ const parts = balanceRaw.split(','); const intPart = parts[0] || '0'; const decPart = parts[1] !== undefined ? ',' + parts[1] : ',00'; return '<span class="int-part">' + intPart + '</span><span class="dec-part">' + decPart + '</span><span class="cur-part">' + currency + '</span>'; })() + '</div><div class="balance-card-sub-new"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg>' + t('availableBalance') + '</div><div class="balance-card-bottom-new"><button class="balance-card-details-btn-new" onclick="window.navigateTo(\'screen-profile\')">' + t('detailsBtn') + '</button></div></div></div>' +
        renderQuickActions() +
        '<div class="transactions-section-new"><div class="tx-section-header-new"><div class="tx-section-title-new">' + t('transactionHistory') + '</div><button class="see-all-link-new" onclick="window.showFullHistory()">' + t('seeAllBtn') + '</button></div><div id="transaction-list">' + renderTransactions(client.transactions) + '</div></div>' +
      '</div>' +
      '<div id="screen-transfer" class="screen"><div class="page-title-bar"><div class="page-title-icon"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></div><span>' + t('sendOutgoingTransfer') + '</span></div><div class="transfer-amount">' + balanceFormatted + '</div><div class="transfer-card"><div class="details-header"><span>' + t('transferDetails') + '</span></div><form id="transfer-form" autocomplete="off"><div class="form-group"><label class="form-label">' + t('amountToDebit') + '</label><input type="text" inputmode="numeric" pattern="[0-9]*" class="form-input amount-input" id="input-amount" required><div class="amount-error-msg" id="amount-error-msg" style="display:none;"></div></div><div class="form-group"><label class="form-label">' + t('labelIban') + '</label><input type="text" class="form-input" id="input-iban" required></div><div class="form-group"><label class="form-label">' + t('labelSwift') + '</label><input type="text" class="form-input" id="input-swift" required></div><div class="form-group"><label class="form-label">' + t('labelBank') + '</label><input type="text" class="form-input" id="input-bank" required></div><div class="form-group"><label class="form-label">' + t('labelBeneficiary') + '</label><input type="text" class="form-input" id="input-name" required></div><div class="form-group"><label class="form-label">' + t('labelReason') + '</label><input type="text" class="form-input" id="input-title" required></div></form><div class="warning-box">' + t('processingWarning') + '</div></div><button class="submit-btn" onclick="window.submitTransferForm()">' + t('nextBtn') + '</button></div>' +
      '<div id="screen-verification" class="screen"><div class="verify-card"><div class="verify-header"><div class="verify-header-title">' + t('pendingTitle') + '</div></div><div class="verify-data-block"><div class="verify-list"><div class="verify-row"><div class="verify-row-label">' + t('transferAmountLabel') + '</div><div class="verify-row-value" id="summary-amount">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('beneficiaryLabel') + '</div><div class="verify-row-value" id="summary-name">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('ibanLabel') + '</div><div class="verify-row-value" id="summary-iban">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('swiftLabel') + '</div><div class="verify-row-value" id="summary-swift">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('bankLabel') + '</div><div class="verify-row-value" id="summary-bank">-</div></div><div class="verify-row"><div class="verify-row-label">' + t('reasonLabel') + '</div><div class="verify-row-value" id="summary-title">-</div></div></div><button type="button" class="verify-cancel-btn" onclick="window.cancelTransfer()">' + t('cancelTransferBtn') + '</button></div><div class="verify-separator"></div><div class="verify-lock-row"><span>' + t('lockText') + '</span></div><label class="verify-code-label">' + t('codeLabel') + '</label><input type="text" class="verify-code-input" id="security-code" placeholder="*******" required></div><button class="submit-btn verify-submit-btn" onclick="window.startProcessing()">' + t('validateTransferBtn') + '</button></div>' +
      '<div id="screen-processing" class="screen"><div class="processing-page-title">' + t('processingPageTitle') + '</div><div class="verify-card"><div class="processing-status-row"><span>' + t('processingStatus') + '</span></div><div class="processing-desc-text">' + t('processingDescLong') + '</div><div class="processing-circle-wrapper"><div class="processing-circle"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" stroke-width="9"/><circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" stroke-width="9" stroke-dasharray="314.159" stroke-dashoffset="314.159" stroke-linecap="round" transform="rotate(-90 60 60)" id="progress-ring"/></svg><div class="processing-circle-label" id="progress-text">0%</div></div></div></div></div>' +
      '<div id="screen-result" class="screen"><div class="result-page-wrapper"><div class="result-header-block success" id="result-header-block"><button class="result-close-btn" onclick="window.closeResultModal()">×</button><div class="result-check-circle success" id="result-check-circle"><svg viewBox="0 0 24 24" id="result-check-svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div></div><div class="result-body-block"><div class="result-title-text success" id="result-title-text"></div><div class="result-details-list" id="result-details-list"></div><div class="result-info-box"><span id="result-info-text"></span></div><div class="result-footer-block"><button class="result-close-action" id="result-close-action" onclick="window.closeResultModal()"></button></div></div></div></div>' +
      '<div id="screen-card" class="screen"><div class="info-banner info-banner-blue" id="card-banner"><div class="banner-text">' + t('cardWelcome') + '</div></div><div class="card-actions"><button class="btn btn-green" onclick="window.showNotif(\'' + t('activateCardBtn') + '\', \'info\')">' + t('activateCardBtn') + '</button><button class="btn btn-red" onclick="window.showNotif(\'' + t('blockCardBtn') + '\', \'info\')">' + t('blockCardBtn') + '</button></div><div class="card-transactions-title">' + t('cardTransactions') + '</div></div>' +
      '<div id="screen-profile" class="screen">' + renderProfileScreen(client, initials, balanceFormatted) + '</div>' +
    '</div>' +
    '<nav class="bottom-nav-new"><div class="bottom-nav-inner-new"><button class="nav-item-new active" id="nav-dashboard" onclick="window.navigateTo(\'screen-dashboard\')"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>' + t('navBalance') + '</span></button><button class="nav-item-new" id="nav-transfer" onclick="window.navigateTo(\'screen-transfer\')"><svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg><span>' + t('navPaymentsNew') + '</span></button><button class="nav-item-new" id="nav-card" onclick="window.showVirtualCard()"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg><span>' + t('navCard') + '</span></button><button class="nav-item-new" id="nav-profile" onclick="window.navigateTo(\'screen-profile\')"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>' + t('navAccount') + '</span></button></div></nav>' +
  '</div>';
  subscribeToClient(client.id);
  injectChatbot(client);
  if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '') replaceHistory('screen-dashboard');
}

window.ClientLogout = function() { try { removeChatbot(); } catch (e) {} if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; } if (currentClient && currentClient.id) trackClientSession(currentClient.id, false); ClientSession.clear(); replaceLoginHistory(); initClient(); };

window.navigateTo = function(id) { showLoader(); setTimeout(() => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); const target = document.getElementById(id); if (target) target.classList.add('active'); document.querySelectorAll('.nav-item-new').forEach(i => i.classList.remove('active')); const map = { 'screen-dashboard': 'nav-dashboard', 'screen-card': 'nav-card', 'screen-profile': 'nav-profile' }; let navId = map[id]; if (['screen-transfer', 'screen-verification', 'screen-processing', 'screen-result'].indexOf(id) !== -1) navId = 'nav-transfer'; if (navId) { const n = document.getElementById(navId); if (n) n.classList.add('active'); } const container = document.querySelector('.screens-container'); if (container) container.scrollTop = 0; pushHistory(id); hideLoader(); }, 250); };

window.cancelTransfer = function() { const form = document.getElementById('transfer-form'); if (form) form.reset(); const codeInput = document.getElementById('security-code'); if (codeInput) codeInput.value = ''; const amountErr = document.getElementById('amount-error-msg'); if (amountErr) { amountErr.style.display = 'none'; amountErr.textContent = ''; } const amountEl = document.getElementById('input-amount'); if (amountEl) amountEl.classList.remove('input-error'); pendingTransferAmount = 0; pendingTransferPercent = 100; window.navigateTo('screen-transfer'); };

window.showFullHistory = function() { const old = document.getElementById('full-history-modal-dyn'); if (old) old.remove(); const txs = (currentClient && currentClient.transactions) || []; let bodyHtml; if (!txs || txs.length === 0) { bodyHtml = '<div class="full-history-empty">' + t('noTransactions') + '</div>'; } else { bodyHtml = renderTransactions(txs); } const ov = document.createElement('div'); ov.id = 'full-history-modal-dyn'; ov.className = 'full-history-overlay'; ov.innerHTML = '<div class="full-history-modal"><div class="full-history-header"><h3>' + t('transactionHistory') + '</h3><button class="full-history-close" onclick="document.getElementById(\'full-history-modal-dyn\').remove()">×</button></div><div class="full-history-body">' + bodyHtml + '</div></div>'; ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov); };

window.openReceipt = function(idx) {
  if (!currentTransactions || !currentTransactions[idx]) return;
  const tx = currentTransactions[idx];
  const isCancelled = (tx.type === 'cancelled' || tx.cancelled === true);
  const isIn = tx.type === 'in';
  const isFailed = tx.status === 'failed';
  const isPending = tx.status === 'pending';
  const isRefund = tx.status === 'cancelledPending';
  const old = document.getElementById('receipt-modal-dynamic'); if (old) old.remove();
  let headerColor, statusLabel, statusBadgeText, headerIcon;
  if (isRefund) { headerColor = '#2563eb'; statusLabel = t('txRefund') || 'Remboursement'; statusBadgeText = t('txRefund') || 'Remboursement'; headerIcon = ''; }
  else if (isPending) { headerColor = '#f59e0b'; statusLabel = t('pendingResultTitle') || 'En attente'; statusBadgeText = t('pendingResultTitle') || 'En attente'; headerIcon = ''; }
  else if (isCancelled) { headerColor = '#8b5cf6'; statusLabel = t('transferCancelledTitle'); statusBadgeText = t('transferCancelledTitle'); headerIcon = '×'; }
  else if (isIn) { headerColor = '#10b981'; statusLabel = t('receiptStatusDone'); statusBadgeText = t('receiptReceived'); headerIcon = '↘'; }
  else { headerColor = isFailed ? '#dc2626' : '#dc2626'; statusLabel = isFailed ? t('transferFailedTitle') : t('receiptStatusDone'); statusBadgeText = t('receiptSent'); headerIcon = '↗'; }
  const amountSign = (isCancelled || isRefund) ? '+' : (isIn ? '+' : '-');
  const ov = document.createElement('div');
  ov.id = 'receipt-modal-dynamic'; ov.className = 'receipt-overlay';
  ov.innerHTML = '<div class="receipt-modal-new"><div class="receipt-header-new' + (isPending ? ' pending' : '') + '" style="background:' + headerColor + ';"><button class="receipt-close-new" onclick="document.getElementById(\'receipt-modal-dynamic\').remove()">×</button><div class="receipt-header-circle">' + headerIcon + '</div><div class="receipt-header-amount">' + amountSign + ' ' + tx.amount + '</div><div class="receipt-header-status">' + statusBadgeText + '</div></div></div>';
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
};

window.showIban = function() { if (!currentClient) return; const old = document.getElementById('iban-modal-dynamic'); if (old) old.remove(); const rawIban = currentClient.iban || currentClient.address || 'N/A'; const ownerName = getCardHolderName(currentClient); const bic = currentClient.bic || 'BICCODEXX'; const adminForcedMask = currentClient.ibanMasked === true; const displayIban = adminForcedMask ? maskIban(rawIban) : rawIban; const formattedIban = formatIban(displayIban); const L = ibanLabels[currentLang] || ibanLabels.fr; const ov = document.createElement('div'); ov.id = 'iban-modal-dynamic'; ov.className = 'notif-overlay'; ov.innerHTML = '<div class="notif-modal"><div class="notif-body"><div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:8px;">' + L.title + '</div><div style="font-family:monospace;font-size:13px;background:#f1f5f9;padding:10px;border-radius:6px;margin-bottom:8px;word-break:break-all;">' + formattedIban + '</div><div style="font-size:11px;color:#475569;">' + L.ownerLabel + ' : ' + ownerName + '</div><div style="font-size:11px;color:#475569;">' + L.bicLabel + ' : ' + bic + '</div>' + (adminForcedMask ? '<div style="font-size:10px;color:#dc2626;margin-top:8px;">' + L.warning + '</div>' : '') + '</div><div class="notif-footer"><button class="notif-btn success" onclick="window.copyIban();document.getElementById(\'iban-modal-dynamic\').remove()">' + t('copyBtn') + '</button></div></div>'; ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov); };

window.copyIban = function() { const adminForcedMask = currentClient.ibanMasked === true; const rawIban = currentClient.iban || currentClient.address || ''; const toCopy = adminForcedMask ? maskIban(rawIban) : rawIban; if (navigator.clipboard) { navigator.clipboard.writeText(toCopy).then(() => window.showNotif('OK ' + t('copied'), 'success')).catch(() => {}); } else { const ta = document.createElement('textarea'); ta.value = toCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); window.showNotif('OK ' + t('copied'), 'success'); } };

function ensureVirtualCardStyles() { if (document.getElementById('vcard-styles')) return; const style = document.createElement('style'); style.id = 'vcard-styles'; style.textContent = '.vcard-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.75);display:flex;justify-content:center;align-items:center;z-index:2147483647;padding:12px;box-sizing:border-box;}.vcard-modal{background:#fff;border-radius:16px;width:100%;max-width:270px;padding:12px;box-shadow:0 22px 55px rgba(15,23,42,0.45);}.vcard-card{padding:14px;border-radius:11px;background:linear-gradient(125deg,#0a1e5c 0%,#3b1d95 55%,#a855f7 100%);color:#fff;font-family:monospace;}.vcard-card .vcard-number{font-size:14px;letter-spacing:1.5px;margin:10px 0;}.vcard-info-row{display:flex;justify-content:space-between;font-size:11px;margin-top:6px;background:#f8fafc;padding:8px;border-radius:8px;color:#0f172a;}.vcard-copy-btn{width:100%;background:linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%);color:#fff;border:none;border-radius:9px;padding:11px;font-size:12px;font-weight:700;margin-top:10px;cursor:pointer;font-family:inherit;}'; document.head.appendChild(style); }

window.showVirtualCard = function() { if (!currentClient) { window.showNotif(t('msgClientNotInit'), 'error'); return; } ensureVirtualCardStyles(); const old = document.getElementById('card-modal-dynamic'); if (old) old.remove(); const cardNum = currentClient.cardNumber || '4944595344283327'; const cardHolder = getCardHolderName(currentClient); const cardExpiry = currentClient.cardExpiry || '02/28'; const cardCvv = currentClient.cardCvv || '843'; const cardType = currentClient.cardType || 'Visa Debit'; const maskLast4 = currentClient.cardMaskLast4 === true; const maskCvv = currentClient.cardMaskCvv === true; virtualCardRevealed = false; const L = cardLabels[currentLang] || cardLabels.fr; const ov = document.createElement('div'); ov.id = 'card-modal-dynamic'; ov.className = 'vcard-overlay'; ov.innerHTML = '<div class="vcard-modal"><div style="font-size:14px;font-weight:800;margin-bottom:8px;color:#0f172a;">' + L.title + '</div><div id="card-modal-body-content">' + renderCardBody(cardNum, cardHolder, cardExpiry, cardCvv, cardType, maskLast4, maskCvv, false) + '</div></div>'; ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov); };

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
  return '<div class="vcard-card"><div style="display:flex;justify-content:space-between;font-weight:800;font-size:11px;"><span>YOUNITED</span><span>VISA</span></div><div class="vcard-number">' + formattedNum + '</div><div style="display:flex;justify-content:space-between;font-size:10px;"><span>' + formattedHolder + '</span><span>' + cardExpiry + '</span><span>CVV ' + displayCvv + '</span></div></div>' +
    '<div class="vcard-info-row"><span>' + L.holderLabel + '</span><span>' + formattedHolder + '</span></div>' +
    '<div class="vcard-info-row"><span>' + L.numberLabel + '</span><span style="font-family:monospace;">' + formattedNum + '</span></div>' +
    '<div class="vcard-info-row"><span>' + L.cvvLabel + '</span><span>' + displayCvv + '</span></div>' +
    '<div style="font-size:10px;color:#64748b;margin-top:8px;line-height:1.4;">' + warningText + '</div>' +
    '<button class="vcard-copy-btn" onclick="window.copyCardNumber()">' + L.copyBtn + '</button>';
}

window.toggleCardVisibility = function() { if (!currentClient) return; if (currentClient.cardMaskLast4 === true || currentClient.cardMaskCvv === true) return; virtualCardRevealed = !virtualCardRevealed; const body = document.getElementById('card-modal-body-content'); if (!body) return; body.innerHTML = renderCardBody(currentClient.cardNumber || '4944595344283327', getCardHolderName(currentClient), currentClient.cardExpiry || '02/28', currentClient.cardCvv || '843', currentClient.cardType || 'Visa Debit', currentClient.cardMaskLast4 === true, currentClient.cardMaskCvv === true, virtualCardRevealed); };

window.copyCardNumber = function() { const adminForcedNumber = currentClient.cardMaskLast4 === true; const raw = currentClient.cardNumber || ''; const toCopy = adminForcedNumber ? maskCardNumber(raw) : raw; if (!toCopy) return; if (navigator.clipboard) { navigator.clipboard.writeText(toCopy).then(() => window.showNotif('OK ' + t('copied'), 'success')).catch(() => {}); } };

function showAmountError(message) { const errEl = document.getElementById('amount-error-msg'); const amountEl = document.getElementById('input-amount'); if (errEl) { errEl.textContent = message; errEl.style.display = 'block'; } if (amountEl) { amountEl.classList.add('input-error'); try { amountEl.focus(); } catch (e) {} } }
function hideAmountError() { const errEl = document.getElementById('amount-error-msg'); const amountEl = document.getElementById('input-amount'); if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; } if (amountEl) amountEl.classList.remove('input-error'); }

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
  if (isPending) { titleText.innerText = t('pendingResultTitle') || ''; infoText.innerText = t('pendingResultMsg') || currentClient.message || ''; }
  else if (isSuccess) { titleText.innerText = t('modalSuccess').replace('{amount}', amountFormatted); infoText.innerText = currentClient.message || ''; }
  else { titleText.innerText = (t('modalFailedAt') || '').replace('{amount}', amountFormatted).replace('{percent}', pendingTransferPercent); infoText.innerText = currentClient.message || ''; }
  detailsList.innerHTML = '<div>' + t('receiptAmount') + ' : ' + amountFormatted + '</div><div>' + t('beneficiaryLabel') + ' : ' + name + '</div><div>' + t('ibanLabel') + ' : ' + iban + '</div><div>' + t('sendTime') + ' ' + dateStr + '</div>';
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
  if (isSuccess) { const newBalance = Math.max(0, (parseFloat(fresh.balance) || 0) - amt); const transactions = fresh.transactions || []; transactions.unshift(newTx); await FireDB.updateClient(fresh.id, { balance: newBalance, transactions }); }
  if (fresh.email) {
    const lang = fresh.language || 'fr'; const T = emailTexts[lang] || emailTexts.fr;
    if (isPending) { const html = buildPendingTransferEmail(fresh, newTx, lang); sendEmail({ to: fresh.email, name: fresh.firstName + ' ' + fresh.lastName, subject: T.pendingTransferEmailSubject, html, text: T.pendingTransferEmailIntro }).catch(() => {}); }
    else { const status = isSuccess ? 'done' : 'failed'; const receiptHtml = buildReceiptEmail(fresh, newTx, status, lang, percent); const subject = isSuccess ? T.receiptSubject : T.receiptFailedSubject; const text = isSuccess ? T.receiptSuccessIntro : T.receiptFailedIntro.replace('{percent}', percent); sendEmail({ to: fresh.email, name: fresh.firstName + ' ' + fresh.lastName, subject, html: receiptHtml, text }).catch(() => {}); }
  }
  const form = document.getElementById('transfer-form'); if (form) form.reset();
  const codeInput = document.getElementById('security-code'); if (codeInput) codeInput.value = '';
  hideAmountError();
  pendingTransferAmount = 0;
  window.navigateTo('screen-dashboard');
  if (isPending) { setTimeout(() => { window.showNotif(t('pendingNotifMsg').replace('{amount}', newTx.amount), 'warning', t('pendingNotifTitle')); }, 400); }
  else { const tplTitle = isSuccess ? t('transferSentTitle') : t('transferFailedTitle'); const tplMsg = isSuccess ? t('transferSentMsg') : t('transferFailedMsg'); let msg = tplMsg.replace('{amount}', newTx.amount).replace('{name}', newTx.subtitle).replace('{iban}', newTx.recipientIban || '—'); if (!isSuccess) msg = msg.replace('{percent}', percent); setTimeout(() => { window.showNotif(msg, isSuccess ? 'success' : 'error', tplTitle); }, 400); }
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
    '<div id="qa-name-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>Nom et prénom du client</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Nom et prénom du client <span class="req">*</span></label><input type="text" id="qa-fullName" placeholder="Ex: Jean Dupont"></div></div></div>' +
    '<div id="qa-email-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><span>Adresse e-mail du client</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Adresse e-mail <span class="req">*</span></label><input type="email" id="qa-email"></div></div></div>' +
    '<div id="qa-phone-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg><span>Numero de telephone</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Telephone</label><input type="tel" id="qa-phone"></div></div></div>' +
    '<div id="qa-address-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg><span>Adresse de residence</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Adresse de residence complete</label><input type="text" id="qa-address"></div></div></div>' +
    '<div id="qa-country-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg><span>Pays du client</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Pays <span class="req">*</span></label><select id="qa-country"><option value="France">France</option><option value="Pologne">Pologne</option><option value="Espagne">Espagne</option><option value="Italie">Italie</option><option value="Allemagne">Allemagne</option><option value="Croatie">Croatie</option><option value="Israël">Israël</option><option value="Roumanie">Roumanie</option><option value="Pays-Bas">Pays-Bas</option><option value="Portugal">Portugal</option><option value="Grèce">Grèce</option><option value="Tchéquie">Tchéquie</option><option value="Hongrie">Hongrie</option><option value="Suède">Suède</option></select></div></div></div>' +
    '<div id="qa-language-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/></svg><span>Langue de l\'application</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Langue <span class="req">*</span></label><select id="qa-language"><option value="fr">Français</option><option value="en">English</option><option value="pl">Polski</option><option value="es">Español</option><option value="it">Italiano</option><option value="de">Deutsch</option><option value="he">עברית (Hébreu)</option><option value="hr">Hrvatski (Croate)</option><option value="ro">Română (Roumain)</option><option value="nl">Nederlands (Néerlandais)</option><option value="pt">Português (Portugais)</option><option value="el">Ελληνικά (Grec)</option><option value="cs">Čeština (Tchèque)</option><option value="hu">Magyar (Hongrois)</option><option value="sv">Svenska (Suédois)</option><option value="ar">العربية (Arabe)</option></select></div></div></div>' +
    '<div id="qa-currency-fields" class="option-panel" style="display:none;"><div class="option-panel-title"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg><span>Devise du compte</span></div><div class="admin-grid"><div class="admin-group full-width"><label>Devise <span class="req">*</span></label><select id="qa-currency"><option value="€">EUR (€)</option><option value="$">USD ($)</option><option value="£">GBP (£)</option><option value="zł">PLN (zł)</option><option value="₪">ILS (₪)</option><option value="lei">RON (lei)</option><option value="kn">HRK (kn)</option><option value="Kč">CZK (Kč)</option><option value="Ft">HUF (Ft)</option><option value="kr">SEK (kr)</option></select></div></div></div>' +
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
      '<form id="admin-form"><div class="admin-section"><div class="admin-section-title"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>Informations client</div><div class="admin-grid"><div class="admin-group full-width"><label>Nom et prénom du client <span class="req">*</span></label><input type="text" id="fullName" placeholder="Ex: Jean Dupont" required></div><div class="admin-group"><label>Pays <span class="req">*</span></label><select id="country"><option value="France">France</option><option value="Pologne">Pologne</option><option value="Espagne">Espagne</option><option value="Italie">Italie</option><option value="Allemagne">Allemagne</option><option value="Croatie">Croatie</option><option value="Israël">Israël</option><option value="Roumanie">Roumanie</option><option value="Pays-Bas">Pays-Bas</option><option value="Portugal">Portugal</option><option value="Grèce">Grèce</option><option value="Tchéquie">Tchéquie</option><option value="Hongrie">Hongrie</option><option value="Suède">Suède</option></select></div><div class="admin-group"><label>Telephone</label><input type="tel" id="phone"></div><div class="admin-group"><label>Email <span class="req">*</span></label><input type="email" id="email" required></div><div class="admin-group"><label>Langue <span class="req">*</span></label><select id="language"><option value="fr" selected>Français</option><option value="en">English</option><option value="pl">Polski</option><option value="es">Español</option><option value="it">Italiano</option><option value="de">Deutsch</option><option value="he">עברית (Hébreu)</option><option value="hr">Hrvatski (Croate)</option><option value="ro">Română (Roumain)</option><option value="nl">Nederlands (Néerlandais)</option><option value="pt">Português (Portugais)</option><option value="el">Ελληνικά (Grec)</option><option value="cs">Čeština (Tchèque)</option><option value="hu">Magyar (Hongrois)</option><option value="sv">Svenska (Suédois)</option><option value="ar">العربية (Arabe)</option></select></div><div class="admin-group full-width"><label>Adresse de residence</label><input type="text" id="address"></div></div></div><div class="admin-section"><div class="admin-section-title"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>Compte et securite</div><div class="admin-grid"><div class="admin-group full-width"><label>Banque emettrice <span class="req">*</span></label><select id="bankName"><option value="">Selectionnez une banque</option></select></div><div class="admin-group"><label>Solde <span class="req">*</span></label><input type="number" id="balance" step="0.01" placeholder="5000" required></div><div class="admin-group"><label>Devise <span class="req">*</span></label><select id="currency"><option value="€">EUR</option><option value="$">USD</option><option value="£">GBP</option><option value="zł">PLN</option><option value="₪">ILS</option><option value="lei">RON</option><option value="kn">HRK</option><option value="Kč">CZK</option><option value="Ft">HUF</option><option value="kr">SEK</option></select></div><div class="admin-group"><label>Depart % <span class="req">*</span></label><input type="number" id="startPercent" min="0" max="100" value="0" required></div><div class="admin-group"><label>Arret % <span class="req">*</span></label><input type="number" id="stopPercent" min="0" max="100" value="100" required></div><div class="admin-group"><label>Code PIN <span class="req">*</span></label><input type="text" id="pin" placeholder="1234" required></div><div class="admin-group"><label>Code d\'activation <span class="req">*</span></label><input type="text" id="activationCode" placeholder="987654" required></div><div class="admin-group full-width"><label>Message de fin</label><textarea id="message" rows="2"></textarea></div><div class="admin-group full-width"><label>Couleur du theme</label><div class="color-presets" id="color-presets"></div><div class="color-picker-row"><input type="color" id="themeColor" value="#1a73e8"><input type="text" id="themeColorHex" value="#1a73e8" readonly></div></div></div><button type="submit" class="btn-admin-submit"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Creer le client</button></div></form>' +
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
  const fillNameFields = (clientId) => { if (!clientId || !clients[clientId]) return; const cc = clients[clientId]; document.getElementById('qa-fullName').value = ((cc.firstName || '') + ' ' + (cc.lastName || '')).trim(); };
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
    // ★ Fusion Nom + Prénom en un seul champ "Nom et prénom du client"
    const fullNameRaw = (document.getElementById('fullName').value || '').trim();
    if (!fullNameRaw) { window.showNotif('Veuillez saisir le nom et prénom du client.', 'warning'); return; }
    const nameParts = fullNameRaw.split(/\s+/).filter(Boolean);
    let clientFirstName = '';
    let clientLastName = '';
    if (nameParts.length === 1) { clientFirstName = nameParts[0]; }
    else { clientLastName = nameParts[nameParts.length - 1]; clientFirstName = nameParts.slice(0, -1).join(' '); }

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
    const clientData = { adminUid: currentAdmin.uid, adminEmail: currentAdmin.email, lastName: clientLastName, firstName: clientFirstName, country: countryValue, phone: document.getElementById('phone').value, email: document.getElementById('email').value, address: document.getElementById('address').value, language: document.getElementById('language').value, bankName: bankNameValue, bankLogo: bankLogoValue, iban: generatedIban, bic: generatedBic, ibanMasked: true, cardHolder: '', cardNumber: generatedCardNumber, cardExpiry: generatedCardExpiry, cardCvv: generatedCardCvv, cardType: 'Visa Debit', cardMaskLast4: true, cardMaskCvv: true, balance: initialBalance, currency: currencyValue, startPercent: parseInt(document.getElementById('startPercent').value), stopPercent: parseInt(document.getElementById('stopPercent').value), pin: document.getElementById('pin').value, activationCode: document.getElementById('activationCode').value, message: document.getElementById('message').value, themeColor: document.getElementById('themeColor').value, blocked: false, isOnline: false, pendingTransferEnabled: false, aiMessages: [], transactions: initialTransactions };
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
  // ★ NOUVEAU : noms étendus aux 15 langues
  const langNames = {
    fr: 'Français', en: 'English', pl: 'Polonais', es: 'Espagnol', it: 'Italien', de: 'Allemand',
    he: 'Hébreu', hr: 'Croate', ro: 'Roumain', nl: 'Néerlandais', pt: 'Portugais',
    el: 'Grec', cs: 'Tchèque', hu: 'Hongrois', sv: 'Suédois', ar: 'Arabe'
  };
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
  const ov = document.createElement('div');
  ov.id = 'transfer-detail-modal';
  ov.style.cssText = 'position:fixed!important;inset:0!important;background:rgba(15,23,42,0.8)!important;backdrop-filter:blur(4px)!important;display:flex!important;justify-content:center!important;align-items:center!important;z-index:2147483647!important;padding:20px!important;box-sizing:border-box!important;overflow-y:auto!important;';
  let headerBg = '';
  if (isCancelledPending) headerBg = 'background:linear-gradient(135deg,#2563eb,#1d4ed8);';
  else if (isPending) headerBg = 'background:linear-gradient(135deg,#f59e0b,#d97706);';
  else if (isCancelled) headerBg = 'background:linear-gradient(135deg,#8b5cf6,#7c3aed);';
  ov.innerHTML = '<div class="transfer-detail-modal-new"><div class="transfer-detail-header" style="' + headerBg + '"><button class="transfer-detail-close" onclick="document.getElementById(\'transfer-detail-modal\').remove()">×</button><div class="transfer-detail-header-info"><div class="transfer-detail-header-label">' + (T.transferDetailsTitle || 'DETAILS DU VIREMENT') + '</div><div class="transfer-detail-header-name">' + (tx.subtitle || '—') + '</div></div><div class="transfer-detail-amount-block"><div class="transfer-detail-amount-label">' + (T.receiptAmount || 'Montant') + '</div><div class="transfer-detail-amount-value">' + (tx.amount || '—') + '</div></div></div><div class="transfer-detail-body"><div>' + (T.receiptBeneficiary || 'Beneficiaire') + ' : ' + (tx.subtitle || '-') + '</div><div>' + (T.receiptIban || 'IBAN') + ' : ' + formatIban(tx.recipientIban || '') + '</div><div>' + (T.receiptBank || 'Banque') + ' : ' + (tx.recipientBank || '-') + '</div><div>' + (T.receiptSwift || 'SWIFT/BIC') + ' : ' + (tx.recipientSwift || '-') + '</div><div>' + (T.receiptReason || 'Motif') + ' : ' + (tx.recipientReason || '-') + '</div><div>' + (T.receiptDate || 'Date') + ' : ' + (tx.date || '-') + '</div><div>' + (T.receiptStatus || 'Statut') + ' : <span class="transfer-detail-status-badge ' + statusClass + '">' + statusText + '</span></div></div><div class="transfer-detail-footer"><button class="transfer-detail-btn-close" onclick="document.getElementById(\'transfer-detail-modal\').remove()">' + (T.receiptClose || 'Fermer') + '</button></div></div>';
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
  else if (action === 'edit-name') {
    // ★ Un seul champ "Nom et prénom du client"
    const fullNameRaw = (document.getElementById('qa-fullName').value || '').trim();
    if (!fullNameRaw) { window.showNotif('Veuillez saisir le nom et prénom du client.', 'warning'); return; }
    const parts = fullNameRaw.split(/\s+/).filter(Boolean);
    let newFirstName = '';
    let newLastName = '';
    if (parts.length === 1) { newFirstName = parts[0]; }
    else { newLastName = parts[parts.length - 1]; newFirstName = parts.slice(0, -1).join(' '); }
    await FireDB.updateClient(clientId, { lastName: newLastName, firstName: newFirstName });
    window.showNotif('Le nom et prénom du client ont été mis à jour.', 'success', 'Identité mise à jour');
  }
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

// ═══════════ FIN DU FICHIER script.js v66 ═══════════
