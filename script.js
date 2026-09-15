// =====================================================
// TRANSFERWIRE - SCRIPT PRINCIPAL
// Firebase + Firestore + Logique complète
// =====================================================

// ========== FIREBASE IMPORTS ==========
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// ========== INITIALISATION FIREBASE ==========
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================================================
// FIRESTORE WRAPPER
// =====================================================
const FireDB = {
  async getClient(id) {
    try {
      const snap = await getDoc(doc(db, 'clients', id));
      return snap.exists() ? { id, ...snap.data() } : null;
    } catch (e) {
      console.error('getClient error:', e);
      return null;
    }
  },

  async getAllClients() {
    try {
      const snap = await getDocs(collection(db, 'clients'));
      const result = {};
      snap.forEach(d => {
        result[d.id] = { id: d.id, ...d.data() };
      });
      return result;
    } catch (e) {
      console.error('getAllClients error:', e);
      return {};
    }
  },

  async createClient(id, data) {
    try {
      await setDoc(doc(db, 'clients', id), {
        ...data,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error('createClient error:', e);
      return false;
    }
  },

  async updateClient(id, data) {
    try {
      await updateDoc(doc(db, 'clients', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error('updateClient error:', e);
      return false;
    }
  },

  async deleteClient(id) {
    try {
      await deleteDoc(doc(db, 'clients', id));
      return true;
    } catch (e) {
      console.error('deleteClient error:', e);
      return false;
    }
  }
};

// =====================================================
// AUTH & SESSION
// =====================================================
const AdminAuth = {
  getPass: () => localStorage.getItem('tw_admin_pass') || 'admin123',
  setPass: (p) => localStorage.setItem('tw_admin_pass', p),
  isLogged: () => sessionStorage.getItem('tw_admin_session') === 'true',
  setLogged: () => sessionStorage.setItem('tw_admin_session', 'true'),
  clearLogged: () => sessionStorage.removeItem('tw_admin_session')
};

const ClientSession = {
  getActive: () => localStorage.getItem('tw_active_client'),
  setActive: (id) => localStorage.setItem('tw_active_client', id),
  clear: () => localStorage.removeItem('tw_active_client')
};

// =====================================================
// TRADUCTIONS (5 langues)
// =====================================================
const i18n = {
  pl: {
    loginTitle: "Zaloguj się na swoje konto", emailPh: "Twój adres e-mail", pinPh: "Twój kod dostępu", loginBtn: "Zaloguj się", loginErr: "Nieprawidłowy e-mail lub PIN.",
    greeting: "Witam", balanceLabel: "Saldo konta :", makeTransferBtn: "Zrób przelew", myCardBtn: "Moja karta", transactionHistory: "Historia transakcji", noTransactions: "Brak historii transakcji.",
    sendOutgoingTransfer: "Wyślij przelew wychodzący", transferDetails: "Szczegóły przelewu", ibanPh: "Wpisz IBAN/Numer konta", swiftPh: "Kod banku (BIC/SWIFT)", bankPh: "Nazwa banku", beneficiaryPh: "Nazwa beneficjenta", reasonPh: "Powód przeniesienia", processingWarning: "Realizacja przelewu w ciągu 1-2 dni roboczych. Opłaty: bezpłatne", nextBtn: "Następny",
    transferSummary: "Podsumowanie transferu", transferAmountLabel: "Kwota przelewu:", ibanLabel: "IBAN/numer", ibanLabelLine2: "konta:", swiftLabel: "Kod banku (BIC/SWIFT):", bankLabel: "Bank odbiorczy:", beneficiaryLabel: "Nazwa beneficjenta:", reasonLabel: "Powód przeniesienia:", identityVerification: "Weryfikacja tożsamości", verificationDesc: "Wprowadź otrzymany kod zabezpieczający, aby zatwierdzić przelew:", securityCodePh: "Wprowadź kod zabezpieczający", sendBtn: "Wyślij",
    wellDone: "Dobrze zrobiony!", processingDesc: "Weryfikacja tożsamości zakończona pomyślnie.", amountToReceive: "Kwota do otrzymania:", processingText: "Transfer w toku, proszę czekać...",
    cardWelcome: "Gratulacje, Twoja karta debetowa jest dostępna.", activateCardBtn: "Aktywuj moją kartę", blockCardBtn: "Zablokuj moją kartę", cardTransactions: "Transakcje kartowe", validUntil: "WAŻNE DO:",
    personalData: "Dane osobowe", accountOwner: "Właściciel konta:", emailLabel: "Adres e-mail:", phoneLabel: "Numer telefonu:", countryLabel: "Kraj zamieszkania:", addressLabel: "Adres zamieszkania:", accountAndTransfer: "Konto i przelew", balanceProfile: "Saldo konta:", accountType: "Typ konta:", accountStatus: "Stan konta:", statusActive: "Aktywny", supportedTransfer: "Obsługiwany transfer:", beneficiaryIban: "IBAN beneficjenta:", accountTypeValue: "Profesjonalny", transferTypeValue: "Klasyczny", profileBanner: "Aby zaktualizować informacje o swoim koncie, skontaktuj się z naszym zespołem wsparcia.", logoutBtn: "Rozłącz",
    modalSuccess: "Przeniesienie {amount} wysłane pomyślnie", modalFailure: "Transfer nie powiódł się", sendTime: "Wyślij czas:", closeBtn: "Zamknij", navBalance: "Równowaga", navCard: "Moja karta", navTransfer: "Przeniesienie", navAccount: "Moje konto", txTransferSent: "Przelew wysłany", txTransferReceived: "Przelew otrzymany"
  },
  fr: {
    loginTitle: "Connectez-vous à votre compte", emailPh: "Votre adresse e-mail", pinPh: "Votre code d'accès", loginBtn: "Se connecter", loginErr: "Adresse e-mail ou code PIN incorrect.",
    greeting: "Bonjour", balanceLabel: "Solde du compte :", makeTransferBtn: "Faire un virement", myCardBtn: "Ma carte", transactionHistory: "Historique des transactions", noTransactions: "Aucun historique de transaction.",
    sendOutgoingTransfer: "Envoyer un virement sortant", transferDetails: "Détails du virement", ibanPh: "Entrez l'IBAN/Numéro de compte", swiftPh: "Code banque (BIC/SWIFT)", bankPh: "Nom de la banque", beneficiaryPh: "Nom du bénéficiaire", reasonPh: "Motif du virement", processingWarning: "Réalisation du virement sous 1 à 2 jours ouvrables. Frais : gratuits", nextBtn: "Suivant",
    transferSummary: "Récapitulatif du virement", transferAmountLabel: "Montant du virement :", ibanLabel: "IBAN/numéro", ibanLabelLine2: "de compte :", swiftLabel: "Code banque (BIC/SWIFT) :", bankLabel: "Banque destinataire :", beneficiaryLabel: "Nom du bénéficiaire :", reasonLabel: "Motif du virement :", identityVerification: "Vérification d'identité", verificationDesc: "Saisissez le code de sécurité reçu pour valider le virement :", securityCodePh: "Entrez le code de sécurité", sendBtn: "Envoyer",
    wellDone: "Bien joué !", processingDesc: "Vérification d'identité réussie.", amountToReceive: "Montant à recevoir :", processingText: "Virement en cours, veuillez patienter...",
    cardWelcome: "Félicitations, votre carte de débit est disponible.", activateCardBtn: "Activer ma carte", blockCardBtn: "Bloquer ma carte", cardTransactions: "Transactions par carte", validUntil: "VALABLE JUSQU'AU :",
    personalData: "Données personnelles", accountOwner: "Titulaire du compte :", emailLabel: "Adresse e-mail :", phoneLabel: "Numéro de téléphone :", countryLabel: "Pays de résidence :", addressLabel: "Adresse de résidence :", accountAndTransfer: "Compte et virement", balanceProfile: "Solde du compte :", accountType: "Type de compte :", accountStatus: "Statut du compte :", statusActive: "Actif", supportedTransfer: "Virement supporté :", beneficiaryIban: "IBAN du bénéficiaire :", accountTypeValue: "Professionnel", transferTypeValue: "Classique", profileBanner: "Pour mettre à jour les informations de votre compte, contactez notre équipe.", logoutBtn: "Se déconnecter",
    modalSuccess: "Virement de {amount} envoyé avec succès", modalFailure: "Échec du transfert", sendTime: "Heure d'envoi :", closeBtn: "Fermer", navBalance: "Solde", navCard: "Ma carte", navTransfer: "Virement", navAccount: "Mon compte", txTransferSent: "Virement envoyé", txTransferReceived: "Virement reçu"
  },
  es: {
    loginTitle: "Inicia sesión en tu cuenta", emailPh: "Tu correo electrónico", pinPh: "Tu código de acceso", loginBtn: "Iniciar sesión", loginErr: "Correo electrónico o código PIN incorrecto.",
    greeting: "Hola", balanceLabel: "Saldo de la cuenta :", makeTransferBtn: "Hacer una transferencia", myCardBtn: "Mi tarjeta", transactionHistory: "Historial de transacciones", noTransactions: "Sin historial.",
    sendOutgoingTransfer: "Enviar transferencia saliente", transferDetails: "Detalles de la transferencia", ibanPh: "Ingrese el IBAN", swiftPh: "Código del banco (BIC/SWIFT)", bankPh: "Nombre del banco", beneficiaryPh: "Nombre del beneficiario", reasonPh: "Motivo", processingWarning: "Realización en 1-2 días hábiles.", nextBtn: "Siguiente",
    transferSummary: "Resumen", transferAmountLabel: "Importe:", ibanLabel: "IBAN/número", ibanLabelLine2: "de cuenta:", swiftLabel: "BIC/SWIFT:", bankLabel: "Banco receptor:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", identityVerification: "Verificación", verificationDesc: "Introduzca el código:", securityCodePh: "Código", sendBtn: "Enviar",
    wellDone: "¡Bien hecho!", processingDesc: "Verificación exitosa.", amountToReceive: "Importe:", processingText: "En curso...",
    cardWelcome: "Tarjeta disponible.", activateCardBtn: "Activar", blockCardBtn: "Bloquear", cardTransactions: "Transacciones", validUntil: "VÁLIDA HASTA:",
    personalData: "Datos personales", accountOwner: "Titular:", emailLabel: "Correo:", phoneLabel: "Teléfono:", countryLabel: "País:", addressLabel: "Dirección:", accountAndTransfer: "Cuenta", balanceProfile: "Saldo:", accountType: "Tipo:", accountStatus: "Estado:", statusActive: "Activo", supportedTransfer: "Soporte:", beneficiaryIban: "IBAN:", accountTypeValue: "Profesional", transferTypeValue: "Clásico", profileBanner: "Contacte con soporte.", logoutBtn: "Salir",
    modalSuccess: "Transferencia de {amount} enviada", modalFailure: "Fallida", sendTime: "Hora:", closeBtn: "Cerrar", navBalance: "Saldo", navCard: "Tarjeta", navTransfer: "Transferir", navAccount: "Cuenta", txTransferSent: "Enviada", txTransferReceived: "Recibida"
  },
  it: {
    loginTitle: "Accedi al tuo account", emailPh: "La tua email", pinPh: "Il tuo codice di accesso", loginBtn: "Accedi", loginErr: "Email o codice PIN errato.",
    greeting: "Ciao", balanceLabel: "Saldo del conto :", makeTransferBtn: "Fai un bonifico", myCardBtn: "La mia carta", transactionHistory: "Cronologia", noTransactions: "Nessuna cronologia.",
    sendOutgoingTransfer: "Invia bonifico", transferDetails: "Dettagli", ibanPh: "IBAN", swiftPh: "BIC/SWIFT", bankPh: "Banca", beneficiaryPh: "Beneficiario", reasonPh: "Motivo", processingWarning: "Esecuzione entro 1-2 giorni.", nextBtn: "Avanti",
    transferSummary: "Riepilogo", transferAmountLabel: "Importo:", ibanLabel: "IBAN", ibanLabelLine2: "conto:", swiftLabel: "BIC:", bankLabel: "Banca:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", identityVerification: "Verifica", verificationDesc: "Inserisci il codice:", securityCodePh: "Codice", sendBtn: "Invia",
    wellDone: "Ben fatto!", processingDesc: "Verifica riuscita.", amountToReceive: "Importo:", processingText: "In corso...",
    cardWelcome: "Carta disponibile.", activateCardBtn: "Attiva", blockCardBtn: "Blocca", cardTransactions: "Transazioni", validUntil: "VALIDA FINO AL:",
    personalData: "Dati personali", accountOwner: "Titolare:", emailLabel: "Email:", phoneLabel: "Telefono:", countryLabel: "Paese:", addressLabel: "Indirizzo:", accountAndTransfer: "Conto", balanceProfile: "Saldo:", accountType: "Tipo:", accountStatus: "Stato:", statusActive: "Attivo", supportedTransfer: "Supporto:", beneficiaryIban: "IBAN:", accountTypeValue: "Professionale", transferTypeValue: "Classico", profileBanner: "Contatta il supporto.", logoutBtn: "Esci",
    modalSuccess: "Bonifico di {amount} inviato", modalFailure: "Fallito", sendTime: "Ora:", closeBtn: "Chiudi", navBalance: "Saldo", navCard: "Carta", navTransfer: "Bonifico", navAccount: "Conto", txTransferSent: "Inviato", txTransferReceived: "Ricevuto"
  },
  de: {
    loginTitle: "Melden Sie sich an", emailPh: "Ihre E-Mail", pinPh: "Ihr Zugangscode", loginBtn: "Anmelden", loginErr: "Falsche E-Mail oder PIN.",
    greeting: "Hallo", balanceLabel: "Kontostand :", makeTransferBtn: "Überweisung", myCardBtn: "Meine Karte", transactionHistory: "Verlauf", noTransactions: "Kein Verlauf.",
    sendOutgoingTransfer: "Überweisung senden", transferDetails: "Details", ibanPh: "IBAN", swiftPh: "BIC/SWIFT", bankPh: "Bank", beneficiaryPh: "Begünstigter", reasonPh: "Grund", processingWarning: "Ausführung in 1-2 Werktagen.", nextBtn: "Weiter",
    transferSummary: "Übersicht", transferAmountLabel: "Betrag:", ibanLabel: "IBAN", ibanLabelLine2: "des Kontos:", swiftLabel: "BIC:", bankLabel: "Empfänger:", beneficiaryLabel: "Begünstigter:", reasonLabel: "Grund:", identityVerification: "Prüfung", verificationDesc: "Code eingeben:", securityCodePh: "Code", sendBtn: "Senden",
    wellDone: "Gut gemacht!", processingDesc: "Erfolgreich.", amountToReceive: "Betrag:", processingText: "In Bearbeitung...",
    cardWelcome: "Karte verfügbar.", activateCardBtn: "Aktivieren", blockCardBtn: "Sperren", cardTransactions: "Transaktionen", validUntil: "GÜLTIG BIS:",
    personalData: "Persönliche Daten", accountOwner: "Kontoinhaber:", emailLabel: "E-Mail:", phoneLabel: "Telefon:", countryLabel: "Land:", addressLabel: "Adresse:", accountAndTransfer: "Konto", balanceProfile: "Kontostand:", accountType: "Typ:", accountStatus: "Status:", statusActive: "Aktiv", supportedTransfer: "Support:", beneficiaryIban: "IBAN:", accountTypeValue: "Professionell", transferTypeValue: "Klassisch", profileBanner: "Support kontaktieren.", logoutBtn: "Abmelden",
    modalSuccess: "Überweisung von {amount} gesendet", modalFailure: "Fehlgeschlagen", sendTime: "Zeit:", closeBtn: "Schließen", navBalance: "Kontostand", navCard: "Karte", navTransfer: "Überweisung", navAccount: "Konto", txTransferSent: "Gesendet", txTransferReceived: "Erhalten"
  }
};

// =====================================================
// UTILITAIRES
// =====================================================
let currentLang = 'fr';
let currentClient = null;
let progressInterval = null;

const t = (key) => {
  const dict = i18n[currentLang] || i18n.fr;
  return dict[key] !== undefined ? dict[key] : (i18n.fr[key] || key);
};

const formatAmount = (amount, currency) => {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ' + currency;
};

const generateShortId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const darken = (hex, pct) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((n >> 16) & 255) - pct);
  const g = Math.max(0, ((n >> 8) & 255) - pct);
  const b = Math.max(0, (n & 255) - pct);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

const applyTheme = (color) => {
  color = color || '#1a73e8';
  document.documentElement.style.setProperty('--primary', color);
  document.documentElement.style.setProperty('--primary-dark', darken(color, 40));
};

// =====================================================
// EXPORTS
// =====================================================
export function initClientApp() {
  initClient();
}

export function initAdminApp() {
  initAdmin();
}

// =====================================================
// ========== CLIENT - LOGIQUE ==========
// =====================================================
async function initClient() {
  const clientId = new URLSearchParams(window.location.search).get('id');
  const root = document.getElementById('app-root');
  
  if (!root) return;

  if (!clientId) {
    root.innerHTML = `
      <div class="view active">
        <div class="no-access">
          <div class="ico">
            <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
          </div>
          <h2>Accès restreint</h2>
          <p>Cette application nécessite un lien de connexion valide. Veuillez utiliser le lien fourni par votre établissement bancaire.</p>
        </div>
      </div>`;
    return;
  }

  const client = await FireDB.getClient(clientId);
  
  if (!client) {
    root.innerHTML = `
      <div class="view active">
        <div class="blocked-screen">
          <div class="ico">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </div>
          <h2>Lien invalide</h2>
          <p>Ce lien de connexion n'est plus valide ou a été supprimé par l'administrateur.</p>
        </div>
      </div>`;
    return;
  }

  if (client.blocked) {
    root.innerHTML = `
      <div class="view active">
        <div class="blocked-screen">
          <div class="ico">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <h2>Compte suspendu</h2>
          <p>Votre accès a été temporairement suspendu. Veuillez contacter le service client.</p>
        </div>
      </div>`;
    return;
  }

  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  
  const activeId = ClientSession.getActive();
  if (activeId === clientId) {
    renderBankingApp(client);
  } else {
    renderLoginPage(client);
  }
}

// =====================================================
// CLIENT - PAGE DE CONNEXION
// =====================================================
function renderLoginPage(client) {
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  const root = document.getElementById('app-root');

  root.innerHTML = `
    <div class="view active">
      <div class="login-container">
        <div class="login-logo">
          <svg viewBox="0 0 24 24" fill="var(--primary)"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          <span>TRANSFERWIRE</span>
        </div>
        <div class="login-title">${t('loginTitle')}</div>
        <div class="user-badge">
          <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span>${client.firstName.toUpperCase()} ${client.lastName.toUpperCase()}</span>
        </div>
        <form id="login-form" style="width:100%;display:flex;flex-direction:column;align-items:center;">
          <div class="login-input-group">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <input type="email" id="email" placeholder="${t('emailPh')}" required>
          </div>
          <div class="login-input-group">
            <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            <input type="password" id="pin" placeholder="${t('pinPh')}" required>
          </div>
          <button type="submit" class="btn-login">
            ${t('loginBtn')}
            <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
          </button>
          <div class="error-msg" id="error-msg">${t('loginErr')}</div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pin = document.getElementById('pin').value.trim();

    if (email === client.email && pin === client.pin) {
      const fresh = await FireDB.getClient(client.id);
      if (!fresh) { alert('Lien invalide'); return; }
      if (fresh.blocked) { alert('Compte suspendu'); return; }
      ClientSession.setActive(client.id);
      initClient();
    } else {
      document.getElementById('error-msg').style.display = 'block';
    }
  });
}

// =====================================================
// CLIENT - APPLICATION BANCAIRE
// =====================================================
function renderBankingApp(client) {
  currentClient = client;
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  const root = document.getElementById('app-root');
  const currency = client.currency || '€';
  const balanceFormatted = formatAmount(client.balance || 0, currency);

  root.innerHTML = `
    <div class="view active" style="display:flex;flex-direction:column;height:100%;">
      <header class="app-header">
        <button class="icon-button menu-icon" onclick="window.ClientLogout()">
          <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <div class="header-title">TRANSFERWIRE</div>
        <button class="icon-button" onclick="window.navigateTo('screen-profile')">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        </button>
      </header>

      <div class="screens-container">
        <div id="screen-dashboard" class="screen active">
          <div class="greeting">${t('greeting')} ${client.firstName} ${client.lastName} ,</div>
          <div class="balance-card">
            <div class="balance-header">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
              ${t('balanceLabel')}
            </div>
            <div class="balance-amount" id="display-balance">${balanceFormatted}</div>
            <div class="balance-actions">
              <button class="btn btn-yellow" onclick="window.navigateTo('screen-transfer')">
                ${t('makeTransferBtn')}
                <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
              </button>
              <button class="btn btn-green" onclick="window.navigateTo('screen-card')">
                ${t('myCardBtn')}
                <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
              </button>
            </div>
          </div>
          <div class="section-heading">
            <div>
              <div class="section-title">${t('transactionHistory')}</div>
            </div>
            <span class="section-count">${(client.transactions || []).length}</span>
          </div>
          <div class="transaction-list" id="transaction-list">
            ${renderTransactions(client.transactions)}
          </div>
        </div>

        <div id="screen-transfer" class="screen">
          <div class="page-title-bar">
            <div class="page-title-icon"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></div>
            <span>${t('sendOutgoingTransfer')}</span>
          </div>
          <div class="transfer-amount">${balanceFormatted}</div>
          <div class="details-header">
            <div class="details-icon">i</div>
            <span>${t('transferDetails')}</span>
          </div>
          <form id="transfer-form">
            <div class="form-group"><input type="text" class="form-input" id="input-iban" placeholder="${t('ibanPh')}" required></div>
            <div class="form-group"><input type="text" class="form-input" id="input-swift" placeholder="${t('swiftPh')}" required></div>
            <div class="form-group"><input type="text" class="form-input" id="input-bank" placeholder="${t('bankPh')}" required></div>
            <div class="form-group"><input type="text" class="form-input" id="input-name" placeholder="${t('beneficiaryPh')}" required></div>
            <div class="form-group"><input type="text" class="form-input" id="input-title" placeholder="${t('reasonPh')}" required></div>
          </form>
          <div class="warning-box">
            <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            <div class="warning-text">${t('processingWarning')}</div>
          </div>
          <button class="submit-btn" onclick="window.submitTransferForm()">
            ${t('nextBtn')}
            <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
          </button>
        </div>

        <div id="screen-verification" class="screen">
          <div class="summary-card">
            <div class="summary-header">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
              <span>${t('transferSummary')}</span>
            </div>
            <div class="summary-list">
              <div class="summary-item"><span>${t('transferAmountLabel')}</span><span class="summary-value">${balanceFormatted}</span></div>
              <div class="summary-item"><span>${t('ibanLabel')}</span><span class="summary-value-block" id="summary-iban">${t('ibanLabelLine2')} </span></div>
              <div class="summary-item"><span>${t('swiftLabel')}</span><span class="summary-value" id="summary-swift"></span></div>
              <div class="summary-item"><span>${t('bankLabel')}</span><span class="summary-value" id="summary-bank"></span></div>
              <div class="summary-item"><span>${t('beneficiaryLabel')}</span><span class="summary-value" id="summary-name"></span></div>
              <div class="summary-item"><span>${t('reasonLabel')}</span><span class="summary-value" id="summary-title"></span></div>
            </div>
          </div>
          <div class="verification-section">
            <div class="verification-header">
              <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              <span>${t('identityVerification')}</span>
            </div>
            <div class="verification-desc">${t('verificationDesc')}</div>
            <input type="text" class="verification-input" id="security-code" placeholder="${t('securityCodePh')}" required>
            <button class="submit-btn" onclick="window.startProcessing()">
              ${t('sendBtn')}
              <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
            </button>
          </div>
        </div>

        <div id="screen-processing" class="screen">
          <div class="info-card">
            <h2>${t('wellDone')}</h2>
            <p>${t('processingDesc')}</p>
            <div class="divider"></div>
            <div class="info-details">
              <div><span class="lbl">${t('beneficiaryLabel')}</span>${client.firstName} ${client.lastName}</div>
              <div><span class="lbl">${t('bankLabel')}</span>${client.bankName || 'BNP Paribas'}</div>
              <div><span class="lbl">${t('ibanLabel')}</span><span id="processing-iban"></span></div>
              <div><span class="lbl">${t('amountToReceive')}</span>${balanceFormatted}</div>
            </div>
          </div>
          <div class="progress-section">
            <div class="progress-text">${t('processingText')}</div>
            <div class="progress-bar-container">
              <div class="progress-fill" id="progress-bar">
                <span class="progress-percentage" id="progress-text">0%</span>
              </div>
            </div>
          </div>
        </div>

        <div id="screen-card" class="screen">
          <div class="info-banner info-banner-blue" id="card-banner">
            <div class="banner-text">${t('cardWelcome')}</div>
            <div class="banner-close" onclick="document.getElementById('card-banner').style.display='none'">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </div>
          </div>
          <div class="credit-card">
            <div>
              <div class="card-brand">TRANSFERWIRE</div>
              <div class="card-number">4987 **** **** 3327</div>
              <div class="card-holder">${client.firstName} ${client.lastName}</div>
            </div>
            <div class="card-footer">
              <div>
                <div class="card-expiry">${t('validUntil')} 05/2029</div>
                <div class="card-cvv">CVV : 843</div>
              </div>
              <div class="visa-logo">VISA</div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-green" onclick="alert('${t('activateCardBtn')}')">${t('activateCardBtn')}</button>
            <button class="btn btn-red" onclick="alert('${t('blockCardBtn')}')">${t('blockCardBtn')}</button>
          </div>
          <div class="card-transactions-title">${t('cardTransactions')}</div>
          <div class="spinner-container"><div class="spinner"></div></div>
        </div>

        <div id="screen-profile" class="screen">
          <div class="info-banner info-banner-yellow" id="profile-banner">
            <div class="banner-text">${t('profileBanner')}</div>
            <div class="banner-close" onclick="document.getElementById('profile-banner').style.display='none'">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </div>
          </div>
          <div class="profile-section">
            <div class="profile-header">
              <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>${t('personalData')}</span>
            </div>
            <div class="profile-list">
              <div class="profile-item"><span class="profile-label">${t('accountOwner')}</span><span class="profile-value">${client.firstName} ${client.lastName}</span></div>
              <div class="profile-item"><span class="profile-label">${t('emailLabel')}</span><span class="profile-value">${client.email}</span></div>
              <div class="profile-item"><span class="profile-label">${t('phoneLabel')}</span><span class="profile-value">${client.phone || '-'}</span></div>
              <div class="profile-item"><span class="profile-label">${t('countryLabel')}</span><span class="profile-value">${client.country}</span></div>
              <div class="profile-item"><span class="profile-label">${t('addressLabel')}</span><span class="profile-value">${client.address || '-'}</span></div>
            </div>
          </div>
          <div class="profile-section">
            <div class="profile-header">
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
              <span>${t('accountAndTransfer')}</span>
            </div>
            <div class="profile-list">
              <div class="profile-item"><span class="profile-label">${t('balanceProfile')}</span><span class="profile-value">${balanceFormatted}</span></div>
              <div class="profile-item"><span class="profile-label">${t('accountType')}</span><span class="profile-value">${t('accountTypeValue')}</span></div>
              <div class="profile-item"><span class="profile-label">${t('accountStatus')}</span><span class="profile-value status-active"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>${t('statusActive')}</span></div>
              <div class="profile-item"><span class="profile-label">${t('supportedTransfer')}</span><span class="profile-value">${t('transferTypeValue')}</span></div>
              <div class="profile-item"><span class="profile-label">${t('beneficiaryIban')}</span><span class="profile-value iban-link">${client.address || 'N/A'}</span></div>
            </div>
          </div>
          <button class="logout-btn" onclick="window.ClientLogout()">
            <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            ${t('logoutBtn')}
        </div>

      </div>
      <nav class="bottom-nav" aria-label="Navigation principale">
        <button class="nav-item active" id="nav-dashboard" type="button" aria-label="Accueil" onclick="window.navigateTo('screen-dashboard')">
          <span class="nav-item-icon"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span>
          <span>${t('navBalance')}</span>
        </button>
        <button class="nav-item" id="nav-transfer" type="button" aria-label="Paiements" onclick="window.navigateTo('screen-transfer')">
          <span class="nav-item-icon"><svg viewBox="0 0 24 24"><path d="M4 7h11.17l-2.58-2.59L14 3l5 5-5 5-1.41-1.41L15.17 9H4V7zm16 10H8.83l2.58 2.59L10 21l-5-5 5-5 1.41 1.41L8.83 15H20v2z"/></svg></span>
          <span>${t('navTransfer')}</span>
        </button>
        <button class="nav-item" id="nav-card" type="button" aria-label="Carte virtuelle" onclick="window.navigateTo('screen-card')">
          <span class="nav-item-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.1-.89-2-2-2zm0 4H4V6h16v2z"/></svg></span>
          <span>${t('navCard')}</span>
        </button>
        <button class="nav-item" id="nav-profile" type="button" aria-label="Profil" onclick="window.navigateTo('screen-profile')">
          <span class="nav-item-icon"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></span>
          <span>${t('navAccount')}</span>
        </button>
      </nav>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function formatTransactionDate(value) {
  if (!value) return 'Date non disponible';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime()) && /T|Z|-/.test(String(value))) {
    return date.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : currentLang, {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
  return escapeHtml(value);
}

function renderTransactions(txs) {
  if (!txs || txs.length === 0) {
    return `<div class="transactions-empty">
      <div class="transactions-empty-icon"><svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.44C5.09 14.32 5 14.66 5 15c0 1.1.9 2 2 2h12v-2H7.42l.9-1.63h7.23c.75 0 1.41-.41 1.75-1.03L20.88 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.89-2-2-2z"/></svg></div>
      <strong>${t('noTransactions')}</strong>
    </div>`;
  }
  return `<div class="transaction-stack">${txs.map((tx, index) => {
    const isIncoming = tx.type === 'in';
    const subtitle = escapeHtml(tx.subtitle || (isIncoming ? (currentLang === 'fr' ? 'Remboursement reçu' : t('txTransferReceived')) : t('txTransferSent')));
    const title = escapeHtml(tx.title || tx.bankName || (isIncoming ? (currentLang === 'fr' ? 'Banque émettrice' : 'TransferWire') : (currentLang === 'fr' ? 'Bénéficiaire' : 'TransferWire')));
    const amount = `${isIncoming ? '+' : '-'}${escapeHtml(tx.amount || '0')}`;
    const date = formatTransactionDate(tx.date);
    const iconPath = isIncoming
      ? '<path d="M12 3a9 9 0 1 0 8.49 12h-2.13A7 7 0 1 1 17 9h-3l4 4 4-4h-3.08A9 9 0 0 0 12 3z"/>'
      : '<path d="M12 2l7 7h-4v7h-6V9H5l7-7zm-7 18h14v2H5v-2z"/>';
    const iconClass = isIncoming ? 'tx-incoming' : 'tx-outgoing';
    return `<article class="transaction-item ${iconClass}" style="--tx-index:${Math.min(index, 8)}">
      <div class="tx-icon ${iconClass}"><svg viewBox="0 0 24 24">${iconPath}</svg></div>
      <div class="tx-details">
        <div class="tx-title">${subtitle}</div>
        <div class="tx-subtitle">${title}</div>
      </div>
      <div class="tx-amount">
        <div class="${isIncoming ? 'amount-pos' : 'amount-neg'}">${amount}</div>
        <div class="tx-date">${date}</div>
      </div>
    </article>`;
  }).join('')}</div>`;
}

// =====================================================
// NAVIGATION CLIENT
// =====================================================
window.ClientLogout = () => {
  ClientSession.clear();
  initClient();
};

window.navigateTo = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(i => {
    i.classList.remove('active');
    const ind = i.querySelector('.active-indicator');
    if (ind) ind.remove();
  });
  
  const map = {
    'screen-dashboard': 'nav-dashboard',
    'screen-card': 'nav-card',
    'screen-profile': 'nav-profile'
  };
  let navId = map[id];
  if (id === 'screen-transfer' || id === 'screen-verification' || id === 'screen-processing') {
    navId = 'nav-transfer';
  }
  if (navId) {
    const navEl = document.getElementById(navId);
    if (navEl) {
      navEl.classList.add('active');
      navEl.insertAdjacentHTML('afterbegin', '<div class="active-indicator"></div>');
    }
  }
  
  const container = document.querySelector('.screens-container');
  if (container) container.scrollTop = 0;
};

window.submitTransferForm = () => {
  const iban = document.getElementById('input-iban').value.trim();
  const swift = document.getElementById('input-swift').value.trim();
  const bank = document.getElementById('input-bank').value.trim();
  const name = document.getElementById('input-name').value.trim();
  const title = document.getElementById('input-title').value.trim();

  if (!iban || !swift || !bank || !name || !title) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  document.getElementById('summary-iban').innerText = t('ibanLabelLine2') + ' ' + iban;
  document.getElementById('summary-swift').innerText = swift;
  document.getElementById('summary-bank').innerText = bank;
  document.getElementById('summary-name').innerText = name;
  document.getElementById('summary-title').innerText = title;

  window.navigateTo('screen-verification');
};

window.startProcessing = () => {
  const code = document.getElementById('security-code').value.trim();
  if (!code) { alert("Veuillez saisir le code de sécurité."); return; }
  if (code !== currentClient.activationCode) { alert("Code de sécurité incorrect."); return; }

  document.getElementById('processing-iban').innerText = document.getElementById('input-iban').value;
  window.navigateTo('screen-processing');

  const pb = document.getElementById('progress-bar');
  const pt = document.getElementById('progress-text');
  let progress = currentClient.startPercent || 0;
  const stopAt = currentClient.stopPercent || 100;

  pb.style.width = progress + '%';
  pt.innerText = progress + '%';

  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (progress >= stopAt) {
      clearInterval(progressInterval);
      setTimeout(() => showResultModal(stopAt >= 100), 500);
      return;
    }
    progress += Math.floor(Math.random() * 3) + 1;
    if (progress > stopAt) progress = stopAt;
    pb.style.width = progress + '%';
    pt.innerText = progress + '%';
  }, 150);
};

function showResultModal(isSuccess) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const currency = currentClient.currency || '€';
  const balanceFormatted = formatAmount(currentClient.balance, currency);

  const iban = document.getElementById('input-iban').value;
  const swift = document.getElementById('input-swift').value;
  const bank = document.getElementById('input-bank').value;
  const name = document.getElementById('input-name').value;
  const reason = document.getElementById('input-title').value;

  const mh = document.getElementById('modal-header');
  const mc = document.getElementById('modal-icon-circle');
  const ms = document.getElementById('modal-icon-svg');
  const mt = document.getElementById('modal-title');
  const mi = document.getElementById('modal-info-icon');

  if (isSuccess) {
    mh.className = 'modal-header success';
    mc.className = 'check-icon-circle success';
    ms.innerHTML = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
    mt.className = 'modal-title success';
    mt.innerText = t('modalSuccess').replace('{amount}', balanceFormatted);
    mi.innerHTML = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>';
    mi.style.fill = '#334155';
  } else {
    mh.className = 'modal-header failure';
    mc.className = 'check-icon-circle failure';
    ms.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
    mt.className = 'modal-title failure';
    mt.innerText = t('modalFailure');
    mi.innerHTML = '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>';
    mi.style.fill = '#dc2626';
  }

  document.getElementById('modal-details').innerHTML = `
    <div><span class="lbl">${t('beneficiaryLabel')}</span>${name}</div>
    <div><span class="lbl">${t('bankLabel')}</span>${bank}</div>
    <div><span class="lbl">${t('ibanLabel')}</span>${iban}</div>
    <div><span class="lbl">${t('swiftLabel')}</span>${swift}</div>
    <div><span class="lbl">${t('reasonLabel')}</span>${reason}</div>
    <div><span class="lbl">${t('sendTime')}</span>${dateStr}</div>
  `;

  document.getElementById('modal-message').innerText = currentClient.message || '...';
  document.getElementById('modal-close-btn').innerText = t('closeBtn');
  document.getElementById('result-modal').classList.add('active');

  window.currentTransferSuccess = isSuccess;
}

window.closeResultModal = async () => {
  document.getElementById('result-modal').classList.remove('active');
  const isSuccess = window.currentTransferSuccess;
  const currency = currentClient.currency || '€';

  const fresh = await FireDB.getClient(currentClient.id);
  if (!fresh) { alert('Compte supprimé'); window.location.reload(); return; }
  if (fresh.blocked) { alert('Compte suspendu'); ClientSession.clear(); window.location.reload(); return; }

  if (isSuccess) {
    const amt = fresh.balance;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newTx = {
      type: 'out',
      subtitle: document.getElementById('input-name').value || (fresh.firstName + ' ' + fresh.lastName),
      amount: formatAmount(amt, currency),
      date: dateStr
    };
    const transactions = fresh.transactions || [];
    transactions.unshift(newTx);
    await FireDB.updateClient(fresh.id, { balance: 0, transactions });
  }

  document.getElementById('transfer-form').reset();
  document.getElementById('security-code').value = '';
  window.navigateTo('screen-dashboard');
};

// =====================================================
// ========== ADMIN - LOGIQUE ==========
// =====================================================
async function initAdmin() {
  const root = document.getElementById('admin-root');
  if (!root) return;
  if (!AdminAuth.isLogged()) {
    renderAdminLogin();
  } else {
    await renderAdminPage();
  }
}

function renderAdminLogin() {
  const root = document.getElementById('admin-root');
  root.innerHTML = `
    <div class="view active">
      <div class="admin-login">
        <div class="logo">
          <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
        </div>
        <h1>Espace Administrateur</h1>
        <p>Accès sécurisé réservé</p>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          <input type="password" id="admin-pass" placeholder="Mot de passe administrateur" autofocus>
        </div>
        <button class="btn-auth" onclick="window.handleAdminLogin()">Accéder au panneau</button>
        <div class="err" id="admin-err">Mot de passe incorrect</div>
        <div class="hint">Mot de passe par défaut : <code>admin123</code></div>
      </div>
    </div>
  `;

  document.getElementById('admin-pass').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') window.handleAdminLogin();
  });
}

window.handleAdminLogin = () => {
  const pass = document.getElementById('admin-pass').value;
  if (pass === AdminAuth.getPass()) {
    AdminAuth.setLogged();
    renderAdminPage();
  } else {
    document.getElementById('admin-err').style.display = 'block';
    document.getElementById('admin-pass').value = '';
  }
};

window.adminLogout = () => {
  AdminAuth.clearLogged();
  initAdmin();
};

async function renderAdminPage() {
  const root = document.getElementById('admin-root');
  root.innerHTML = `
    <div class="view active" style="display:flex;align-items:center;justify-content:center;height:100%;">
      <div class="spinner"></div>
    </div>
  `;

  const clients = await FireDB.getAllClients();
  const list = Object.keys(clients);
  const totalBalance = list.reduce((s, id) => s + (parseFloat(clients[id].balance) || 0), 0);
  const totalTx = list.reduce((s, id) => s + ((clients[id].transactions || []).length), 0);
  const active = list.filter(id => !clients[id].blocked).length;
  const langNames = { pl: 'Polonais', fr: 'Français', es: 'Espagnol', it: 'Italien', de: 'Allemand' };

  let clientsHtml = '';
  if (list.length === 0) {
    clientsHtml = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm-7 13c0-2.33 4.67-3.5 7-3.5s7 1.17 7 3.5v1H5v-1z"/></svg>
        <p>Aucun client créé pour le moment</p>
      </div>`;
  } else {
    const sorted = list.sort((a, b) => b.localeCompare(a));
    const basePath = window.location.pathname.replace(/admin\.html$/, '');
    
    sorted.forEach(id => {
      const c = clients[id];
      const link = window.location.origin + basePath + '?id=' + id;
      const balance = formatAmount(parseFloat(c.balance) || 0, c.currency || '€');
      const txCount = (c.transactions || []).length;

      clientsHtml += `
        <div class="client-card ${c.blocked ? 'blocked' : ''}">
          <div class="cc-header">
            <div class="cc-name">${c.firstName} ${c.lastName}</div>
            <div class="cc-badges">
              <span class="cc-badge ${c.blocked ? 'blocked' : 'active'}">${c.blocked ? 'Suspendu' : 'Actif'}</span>
              <span class="cc-badge lang">${langNames[c.language] || c.language}</span>
            </div>
          </div>
          <div class="cc-info">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <strong>${c.email}</strong>
          </div>
          <div class="cc-info">
            <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            ${c.phone || '-'}
          </div>
          <div class="cc-info">
            <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            <strong>Solde : ${balance}</strong>
          </div>
          <div class="cc-codes">
            <div class="cc-code"><span>PIN</span>${c.pin}</div>
            <div class="cc-code"><span>CODE</span>${c.activationCode}</div>
            <div class="cc-code"><span>ARRÊT</span>${c.stopPercent}%</div>
            <div class="cc-code" style="background:${c.themeColor || '#1a73e8'};color:#fff"><span style="color:rgba(255,255,255,.7)">THÈME</span>●</div>
          </div>
          <div class="cc-link">
            <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            <a href="${link}" target="_blank">${link}</a>
          </div>
          <div class="cc-actions">
            <button class="cc-btn edit" onclick="window.openEditModal('${id}')">
              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              Éditer
            </button>
            <button class="cc-btn copy" onclick="window.copyToClipboard('${link}')">
              <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              Copier
            </button>
            <button class="cc-btn tx" onclick="window.openTxModal('${id}')">
              <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Tx (${txCount})
            </button>
            <button class="cc-btn ${c.blocked ? 'unblock' : 'block'}" onclick="window.toggleBlock('${id}')">
              <svg viewBox="0 0 24 24"><path d="${c.blocked ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z'}"/></svg>
              ${c.blocked ? 'Activer' : 'Bloquer'}
            </button>
            <button class="cc-btn del" onclick="window.deleteClientConfirm('${id}')">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Suppr.
            </button>
          </div>
        </div>
      `;
    });
  }

  root.innerHTML = `
    <div class="view active">
      <div class="admin-wrapper">
        <div class="admin-topbar">
          <div class="brand">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
            ADMIN
          </div>
          <div class="actions">
            <button class="icon-btn" onclick="document.getElementById('pass-modal').classList.add('active')" title="Paramètres">
              <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            </button>
            <button class="icon-btn" onclick="window.adminLogout()" title="Déconnexion">
              <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            </button>
          </div>
        </div>
        <div class="admin-body">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="ico blue"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
              <div class="val">${list.length}</div>
              <div class="lbl">Clients</div>
            </div>
            <div class="stat-card">
              <div class="ico green"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>
              <div class="val">${totalBalance.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div class="lbl">Solde total</div>
            </div>
            <div class="stat-card">
              <div class="ico orange"><svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg></div>
              <div class="val">${totalTx}</div>
              <div class="lbl">Transactions</div>
            </div>
            <div class="stat-card">
              <div class="ico purple"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
              <div class="val">${active}</div>
              <div class="lbl">Actifs</div>
            </div>
          </div>

          <form id="admin-form">
            <div class="admin-section">
              <div class="admin-section-title">
                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                Informations client
              </div>
              <div class="admin-grid">
                <div class="admin-group"><label>Nom <span class="req">*</span></label><input type="text" id="lastName" required></div>
                <div class="admin-group"><label>Prénom <span class="req">*</span></label><input type="text" id="firstName" required></div>
                <div class="admin-group"><label>Pays <span class="req">*</span></label>
                  <select id="country">
                    <option value="France">🇫🇷 France</option>
                    <option value="Pologne">🇵🇱 Pologne</option>
                    <option value="Espagne">🇪🇸 Espagne</option>
                    <option value="Italie">🇮🇹 Italie</option>
                    <option value="Allemagne">🇩🇪 Allemagne</option>
                  </select>
                </div>
                <div class="admin-group"><label>Téléphone</label><input type="tel" id="phone"></div>
                <div class="admin-group"><label>Email <span class="req">*</span></label><input type="email" id="email" required></div>
                <div class="admin-group"><label>Langue <span class="req">*</span></label>
                  <select id="language">
                    <option value="pl">Polonais</option>
                    <option value="fr" selected>Français</option>
                    <option value="es">Espagnol</option>
                    <option value="it">Italien</option>
                    <option value="de">Allemand</option>
                  </select>
                </div>
                <div class="admin-group full-width"><label>Adresse</label><input type="text" id="address"></div>
              </div>
            </div>

            <div class="admin-section">
              <div class="admin-section-title">
                <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                Compte et sécurité
              </div>
              <div class="admin-grid">
                <div class="admin-group full-width"><label>Banque émettrice</label><input type="text" id="bankName" placeholder="BNP Paribas"></div>
                <div class="admin-group"><label>Solde <span class="req">*</span></label><input type="number" id="balance" step="0.01" placeholder="5000" required></div>
                <div class="admin-group"><label>Devise <span class="req">*</span></label>
                  <select id="currency">
                    <option value="€">€ Euro</option>
                    <option value="$">$ Dollar</option>
                    <option value="£">£ Livre</option>
                    <option value="zł">zł Zloty</option>
                  </select>
                </div>
                <div class="admin-group"><label>Départ % <span class="req">*</span></label><input type="number" id="startPercent" min="0" max="100" value="0" required></div>
                <div class="admin-group"><label>Arrêt % <span class="req">*</span></label><input type="number" id="stopPercent" min="0" max="100" value="100" required></div>
                <div class="admin-group"><label>Code PIN <span class="req">*</span></label><input type="text" id="pin" placeholder="1234" required></div>
                <div class="admin-group"><label>Code d'activation <span class="req">*</span></label><input type="text" id="activationCode" placeholder="987654" required></div>
                <div class="admin-group full-width"><label>Message de fin</label><textarea id="message" rows="2" placeholder="Message affiché à la fin du virement..."></textarea></div>
                <div class="admin-group full-width">
                  <label>Couleur du thème</label>
                  <div class="color-presets" id="color-presets"></div>
                  <div class="color-picker-row">
                    <input type="color" id="themeColor" value="#1a73e8">
                    <input type="text" id="themeColorHex" value="#1a73e8" readonly>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn-admin-submit">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Créer le client
              </button>
            </div>
          </form>

          <div class="client-list-title">Clients <span class="count">${list.length}</span></div>
          <div class="client-list">${clientsHtml}</div>
        </div>
      </div>
    </div>
  `;

  const presets = ['#1a73e8', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#ec4899', '#a855f7', '#6366f1', '#0f172a'];
  const presetContainer = document.getElementById('color-presets');
  if (presetContainer) {
    presets.forEach(col => {
      const div = document.createElement('div');
      div.className = 'color-preset' + (col === '#1a73e8' ? ' selected' : '');
      div.style.background = col;
      div.onclick = () => {
        presetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
        div.classList.add('selected');
        document.getElementById('themeColor').value = col;
        document.getElementById('themeColorHex').value = col;
      };
      presetContainer.appendChild(div);
    });
  }

  const themeColorInput = document.getElementById('themeColor');
  if (themeColorInput) {
    themeColorInput.addEventListener('input', (e) => {
      document.getElementById('themeColorHex').value = e.target.value;
      presetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
    });
  }

  const adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let id;
      do {
        id = generateShortId();
      } while (await FireDB.getClient(id));

      // ✅ TRANSACTION INITIALE OBLIGATOIRE
      const initialBalance = parseFloat(document.getElementById('balance').value) || 0;
      const currencyValue = document.getElementById('currency').value;
      const bankNameValue = document.getElementById('bankName').value.trim();
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      // Si le solde est supérieur à 0, on ajoute automatiquement une transaction
      const initialTransactions = initialBalance > 0 ? [{
        type: 'in',
        subtitle: bankNameValue || 'Dépôt initial',
        amount: formatAmount(initialBalance, currencyValue),
        date: dateStr
      }] : [];

      const clientData = {
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        country: document.getElementById('country').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        language: document.getElementById('language').value,
        bankName: bankNameValue,
        balance: initialBalance,
        currency: currencyValue,
        startPercent: parseInt(document.getElementById('startPercent').value),
        stopPercent: parseInt(document.getElementById('stopPercent').value),
        pin: document.getElementById('pin').value,
        activationCode: document.getElementById('activationCode').value,
        message: document.getElementById('message').value,
        themeColor: document.getElementById('themeColor').value,
        blocked: false,
        transactions: initialTransactions
      };

      const ok = await FireDB.createClient(id, clientData);
      if (ok) {
        alert('✅ Client créé avec succès !');
        renderAdminPage();
      } else {
        alert('❌ Erreur lors de la création. Vérifiez votre connexion Firebase.');
      }
    });
  }
}

// =====================================================
// FONCTIONS ADMIN
// =====================================================
window.copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Lien copié !');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('✅ Lien copié !');
  });
};

window.toggleBlock = async (id) => {
  const c = await FireDB.getClient(id);
  if (!c) return;
  await FireDB.updateClient(id, { blocked: !c.blocked });
  if (!c.blocked && ClientSession.getActive() === id) ClientSession.clear();
  renderAdminPage();
};

window.deleteClientConfirm = async (id) => {
  const c = await FireDB.getClient(id);
  if (!c) return;
  if (confirm(`Supprimer définitivement ${c.firstName} ${c.lastName} ?\n\nLe lien deviendra invalide et le client perdra tout accès.`)) {
    await FireDB.deleteClient(id);
    renderAdminPage();
  }
};

window.openEditModal = async (id) => {
  const c = await FireDB.getClient(id);
  if (!c) return;

  const body = document.getElementById('edit-form-body');
  const presets = ['#1a73e8', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#ec4899', '#a855f7', '#6366f1', '#0f172a'];

  body.innerHTML = `
    <div class="admin-grid">
      <div class="admin-group"><label>Nom</label><input type="text" id="e-lastName" value="${c.lastName}"></div>
      <div class="admin-group"><label>Prénom</label><input type="text" id="e-firstName" value="${c.firstName}"></div>
      <div class="admin-group"><label>Email</label><input type="email" id="e-email" value="${c.email}"></div>
      <div class="admin-group"><label>Téléphone</label><input type="tel" id="e-phone" value="${c.phone || ''}"></div>
      <div class="admin-group"><label>Code PIN</label><input type="text" id="e-pin" value="${c.pin}"></div>
      <div class="admin-group"><label>Code d'activation</label><input type="text" id="e-activationCode" value="${c.activationCode}"></div>
      <div class="admin-group"><label>Départ %</label><input type="number" id="e-startPercent" value="${c.startPercent}" min="0" max="100"></div>
      <div class="admin-group"><label>Arrêt %</label><input type="number" id="e-stopPercent" value="${c.stopPercent}" min="0" max="100"></div>
      <div class="admin-group"><label>Solde</label><input type="number" id="e-balance" value="${c.balance}" step="0.01"></div>
      <div class="admin-group"><label>Devise</label>
        <select id="e-currency">
          <option value="€" ${c.currency === '€' ? 'selected' : ''}>€</option>
          <option value="$" ${c.currency === '$' ? 'selected' : ''}>$</option>
          <option value="£" ${c.currency === '£' ? 'selected' : ''}>£</option>
          <option value="zł" ${c.currency === 'zł' ? 'selected' : ''}>zł</option>
        </select>
      </div>
      <div class="admin-group full-width"><label>Message de fin</label><textarea id="e-message" rows="2">${c.message || ''}</textarea></div>
      <div class="admin-group full-width">
        <label>Couleur du thème</label>
        <div class="color-presets" id="e-presets"></div>
        <div class="color-picker-row">
          <input type="color" id="e-themeColor" value="${c.themeColor || '#1a73e8'}">
          <input type="text" id="e-themeColorHex" value="${c.themeColor || '#1a73e8'}" readonly>
        </div>
      </div>
    </div>
    <button class="btn-admin-submit" style="margin-top:20px;" onclick="window.saveEdit('${id}')">
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      Enregistrer les modifications
    </button>
  `;

  const presetContainer = document.getElementById('e-presets');
  presets.forEach(col => {
    const div = document.createElement('div');
    div.className = 'color-preset' + ((c.themeColor || '#1a73e8') === col ? ' selected' : '');
    div.style.background = col;
    div.onclick = () => {
      presetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
      div.classList.add('selected');
      document.getElementById('e-themeColor').value = col;
      document.getElementById('e-themeColorHex').value = col;
    };
    presetContainer.appendChild(div);
  });

  document.getElementById('e-themeColor').addEventListener('input', (e) => {
    document.getElementById('e-themeColorHex').value = e.target.value;
    presetContainer.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
  });

  document.getElementById('edit-modal').classList.add('active');
};

window.saveEdit = async (id) => {
  await FireDB.updateClient(id, {
    lastName: document.getElementById('e-lastName').value,
    firstName: document.getElementById('e-firstName').value,
    email: document.getElementById('e-email').value,
    phone: document.getElementById('e-phone').value,
    pin: document.getElementById('e-pin').value,
    activationCode: document.getElementById('e-activationCode').value,
    startPercent: parseInt(document.getElementById('e-startPercent').value),
    stopPercent: parseInt(document.getElementById('e-stopPercent').value),
    balance: parseFloat(document.getElementById('e-balance').value),
    currency: document.getElementById('e-currency').value,
    message: document.getElementById('e-message').value,
    themeColor: document.getElementById('e-themeColor').value
  });
  window.closeEditModal();
  renderAdminPage();
};

window.closeEditModal = () => {
  document.getElementById('edit-modal').classList.remove('active');
};

window.openTxModal = async (id) => {
  const c = await FireDB.getClient(id);
  if (!c) return;
  const txs = c.transactions || [];
  const body = document.getElementById('tx-modal-body');

  let html = `<div style="font-size:13px;color:#64748b;margin-bottom:16px;font-weight:600;">
    Client : <strong style="color:#0f172a;">${c.firstName} ${c.lastName}</strong>
  </div>`;

  if (txs.length === 0) {
    html += '<div style="text-align:center;padding:40px 20px;color:#94a3b8;font-size:14px;">Aucune transaction</div>';
  } else {
    html += '<div class="tx-list">';
    txs.forEach(tx => {
      const isIn = tx.type === 'in';
      html += `
        <div class="tx-row">
          <div class="tx-ico ${isIn ? 'in' : 'out'}">
            <svg viewBox="0 0 24 24">${isIn ? '<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>' : '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>'}</svg>
          </div>
          <div class="tx-info">
            <div class="tx-name">${tx.subtitle || (isIn ? 'Reçu' : 'Envoyé')}</div>
            <div class="tx-date">${tx.date}</div>
          </div>
          <div class="tx-amt ${isIn ? 'pos' : 'neg'}">${isIn ? '+' : '-'}${tx.amount}</div>
        </div>
      `;
    });
    html += '</div>';
  }

  body.innerHTML = html;
  document.getElementById('tx-modal').classList.add('active');
};

window.changePassword = () => {
  const oldp = document.getElementById('old-pass').value;
  const newp = document.getElementById('new-pass').value;
  const conf = document.getElementById('confirm-pass').value;
  const err = document.getElementById('pass-error');

  if (oldp !== AdminAuth.getPass()) {
    err.textContent = 'Ancien mot de passe incorrect';
    err.style.display = 'block';
    return;
  }
  if (newp.length < 4) {
    err.textContent = 'Le nouveau mot de passe doit contenir au moins 4 caractères';
    err.style.display = 'block';
    return;
  }
  if (newp !== conf) {
    err.textContent = 'Les mots de passe ne correspondent pas';
    err.style.display = 'block';
    return;
  }

  AdminAuth.setPass(newp);
  err.style.display = 'none';
  document.getElementById('pass-modal').classList.remove('active');
  alert('✅ Mot de passe modifié avec succès');
  document.getElementById('old-pass').value = '';
  document.getElementById('new-pass').value = '';
  document.getElementById('confirm-pass').value = '';
};

// =====================================================
// GESTION ERREURS GLOBALES
// =====================================================
window.addEventListener('error', (e) => {
  console.error('Global error:', e.message);
});
