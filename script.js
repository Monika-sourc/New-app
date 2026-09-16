// =====================================================
// TRANSFERWIRE - SCRIPT PRINCIPAL
// v11 - Virtual card robust
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

// =====================================================
// FIRESTORE WRAPPER
// =====================================================
const FireDB = {
  async getClient(id) {
    try { const s = await getDoc(doc(db, 'clients', id)); return s.exists() ? { id, ...s.data() } : null; }
    catch (e) { console.error(e); return null; }
  },
  async getMyClients(adminUid) {
    try {
      const q = query(collection(db, 'clients'), where('adminUid', '==', adminUid));
      const s = await getDocs(q);
      const r = {};
      s.forEach(d => { r[d.id] = { id: d.id, ...d.data() }; });
      return r;
    } catch (e) { console.error(e); return {}; }
  },
  async createClient(id, data) {
    try { await setDoc(doc(db, 'clients', id), { ...data, createdAt: serverTimestamp() }); return true; }
    catch (e) { console.error(e); return false; }
  },
  async updateClient(id, data) {
    try { await updateDoc(doc(db, 'clients', id), { ...data, updatedAt: serverTimestamp() }); return true; }
    catch (e) { console.error(e); return false; }
  },
  async deleteClient(id) {
    try { await deleteDoc(doc(db, 'clients', id)); return true; }
    catch (e) { console.error(e); return false; }
  }
};

const ClientSession = {
  getActive: () => localStorage.getItem('tw_active_client'),
  setActive: (id) => localStorage.setItem('tw_active_client', id),
  clear: () => localStorage.removeItem('tw_active_client')
};

// =====================================================
// GENERATEURS
// =====================================================
function generateIban(country) {
  const prefixMap = { 'France': 'FR', 'Pologne': 'PL', 'Espagne': 'ES', 'Italie': 'IT', 'Allemagne': 'DE' };
  const prefix = prefixMap[country] || 'FR';
  const formatLens = { FR: 25, PL: 24, ES: 22, IT: 25, DE: 20 };
  const len = formatLens[prefix] || 22;
  let body = '';
  for (let i = 0; i < len; i++) body += Math.floor(Math.random() * 10);
  return prefix + body;
}
function generateBic(country) {
  const prefixMap = { 'France': 'FR', 'Pologne': 'PL', 'Espagne': 'ES', 'Italie': 'IT', 'Allemagne': 'DE' };
  const cc = prefixMap[country] || 'FR';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alnum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let bank = '';
  for (let i = 0; i < 4; i++) bank += letters.charAt(Math.floor(Math.random() * letters.length));
  let loc = '';
  for (let i = 0; i < 2; i++) loc += alnum.charAt(Math.floor(Math.random() * alnum.length));
  return bank + cc + loc;
}
function generateCardNumber() {
  let num = '4';
  for (let i = 0; i < 15; i++) num += Math.floor(Math.random() * 10);
  return num;
}
function generateCardExpiry() {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const year = String(Math.floor(Math.random() * 5) + 26);
  return month + '/' + year;
}
function generateCardCvv() { return String(Math.floor(Math.random() * 900) + 100); }

function getCardHolderName(client) {
  if (!client) return '';
  return ((client.firstName || '') + ' ' + (client.lastName || '')).trim().toUpperCase();
}
function formatIban(iban) { return iban ? iban.replace(/(.{4})/g, '$1 ').trim() : ''; }
function formatCardNumber(num) { return num ? num.replace(/(.{4})/g, '$1 ').trim() : ''; }
function maskIban(iban) { return (iban && iban.length >= 4) ? iban.slice(0, -4) + '••••' : iban; }
function maskCardNumber(num) { return (num && num.length >= 4) ? num.slice(0, -4) + 'XXXX' : num; }

// =====================================================
// GESTION HISTORIQUE
// =====================================================
let isHandlingPop = false;
function pushHistory(screenId) { if (isHandlingPop) return; try { history.pushState({ tw: true, screen: screenId }, '', '#' + screenId); } catch (e) {} }
function replaceHistory(screenId) { try { history.replaceState({ tw: true, screen: screenId }, '', '#' + screenId); } catch (e) {} }
function replaceLoginHistory() { try { history.replaceState({ tw: true, screen: 'login' }, '', '#login'); } catch (e) {} }

window.addEventListener('popstate', async (event) => {
  const state = event.state;
  if (!state || !state.tw) return;
  isHandlingPop = true;
  if (state.screen === 'login') {
    ClientSession.clear();
    if (clientUnsubscribe) { try { clientUnsubscribe(); } catch(e) {} clientUnsubscribe = null; }
    initClient();
    setTimeout(() => { isHandlingPop = false; }, 150);
    return;
  }
  const target = document.getElementById(state.screen);
  if (target) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const map = { 'screen-dashboard': 'nav-dashboard', 'screen-card': 'nav-card', 'screen-profile': 'nav-profile' };
    let navId = map[state.screen];
    if (['screen-transfer', 'screen-verification', 'screen-processing'].indexOf(state.screen) !== -1) navId = 'nav-transfer';
    if (navId) { const n = document.getElementById(navId); if (n) n.classList.add('active'); }
    if (state.screen === 'screen-dashboard' && currentClient) {
      try {
        const fresh = await FireDB.getClient(currentClient.id);
        if (fresh && !fresh.blocked) {
          currentClient = fresh;
          const list = document.getElementById('transaction-list');
          if (list) list.innerHTML = renderTransactions(fresh.transactions);
          const hero = document.getElementById('balance-hero');
          if (hero) hero.innerHTML = renderBalanceHero(fresh);
        }
      } catch (e) {}
    }
    const container = document.querySelector('.screens-container');
    if (container) container.scrollTop = 0;
  }
  setTimeout(() => { isHandlingPop = false; }, 150);
});

// =====================================================
// TRADUCTIONS
// =====================================================
const i18n = {
  pl: { loginTitle: "Zaloguj sie na swoje konto", emailPh: "Twoj adres e-mail", pinPh: "Twoj kod dostepu", loginBtn: "Zaloguj sie", loginErr: "Nieprawidlowy e-mail lub PIN.", greeting: "Witam", personalAccount: "Osobiste", accounts: "Konta", seeIban: "Zobacz moj IBAN", virtualCard: "Karta wirtualna", makeTransferShort: "Wykonaj przelew", myIbanTitle: "Moj IBAN", copyBtn: "Kopiuj", copied: "Skopiowano!", balanceLabel: "Saldo konta :", transactionHistory: "Historia transakcji", noTransactions: "Brak historii transakcji.", sendOutgoingTransfer: "Wyslij przelew wychodzacy", transferDetails: "Szczegoly przelewu", amountToDebit: "KWOTA DO OBCIAZENIA", labelIban: "IBAN / NUMER KONTA", labelSwift: "KOD BANKU (BIC/SWIFT)", labelBank: "NAZWA BANKU", labelBeneficiary: "NAZWA BENEFICJENTA", labelReason: "POWOD PRZENIESIENIA", processingWarning: "Realizacja w ciagu 1-3 minut po weryfikacji koncowej.", nextBtn: "Nastepny", transferSummary: "Podsumowanie transferu", transferAmountLabel: "Kwota przelewu:", ibanLabel: "IBAN/numer", ibanLabelLine2: "konta:", swiftLabel: "Kod banku:", bankLabel: "Bank odbiorczy:", beneficiaryLabel: "Nazwa beneficjenta:", reasonLabel: "Powod przeniesienia:", identityVerification: "Weryfikacja tozsamosci", verificationDesc: "Wprowadz kod zabezpieczajacy:", sendBtn: "Wyslij", wellDone: "Dobrze zrobiony!", processingDesc: "Weryfikacja zakonczona pomyslnie.", amountToReceive: "Kwota do otrzymania:", processingText: "Transfer w toku...", cardWelcome: "Gratulacje, karta jest dostepna.", activateCardBtn: "Aktywuj", blockCardBtn: "Zablokuj", cardTransactions: "Transakcje kartowe", validUntil: "WAZNE DO:", personalData: "Dane osobowe", accountOwner: "Wlasciciel:", emailLabel: "E-mail:", phoneLabel: "Telefon:", countryLabel: "Kraj:", addressLabel: "Adres:", accountAndTransfer: "Konto i przelew", balanceProfile: "Saldo:", accountType: "Typ:", accountStatus: "Stan:", statusActive: "Aktywny", supportedTransfer: "Transfer:", beneficiaryIban: "IBAN:", accountTypeValue: "Profesjonalny", transferTypeValue: "Klasyczny", profileBanner: "Skontaktuj sie z pomoca.", logoutBtn: "Rozlacz", modalSuccess: "Przeniesienie {amount} wyslane", modalFailure: "Transfer nie powiodl sie", sendTime: "Czas:", closeBtn: "Zamknij", navBalance: "Pulpit", navCard: "Karta", navTransfer: "Platnosci", navAccount: "Profil", txTransferSent: "Przelew wyslany", txTransferReceived: "Przelew otrzymany", invalidAmount: "Wpisz prawidlowa kwote.", amountExceedsBalance: "Kwota przekracza saldo." },
  fr: { loginTitle: "Connectez-vous a votre compte", emailPh: "Votre adresse e-mail", pinPh: "Votre code d'acces", loginBtn: "Se connecter", loginErr: "Adresse e-mail ou code PIN incorrect.", greeting: "Bonjour", personalAccount: "Personnel", accounts: "Comptes", seeIban: "Voir mon IBAN", virtualCard: "Carte virtuelle", makeTransferShort: "Faire un virement", myIbanTitle: "Mon IBAN", copyBtn: "Copier", copied: "Copie !", balanceLabel: "Solde du compte :", transactionHistory: "Historique des transactions", noTransactions: "Aucun historique.", sendOutgoingTransfer: "Envoyer un virement sortant", transferDetails: "Details du virement", amountToDebit: "MONTANT A DEBITER", labelIban: "IBAN / NUMERO DE COMPTE", labelSwift: "CODE BANQUE (BIC/SWIFT)", labelBank: "NOM DE LA BANQUE", labelBeneficiary: "NOM DU BENEFICIAIRE", labelReason: "MOTIF DU VIREMENT", processingWarning: "Realisation sous 1 a 3 minutes apres verification finale.", nextBtn: "Suivant", transferSummary: "Recapitulatif", transferAmountLabel: "Montant :", ibanLabel: "IBAN/numero", ibanLabelLine2: "de compte :", swiftLabel: "Code banque :", bankLabel: "Banque destinataire :", beneficiaryLabel: "Nom du beneficiaire :", reasonLabel: "Motif :", identityVerification: "Verification d'identite", verificationDesc: "Saisissez le code de securite :", sendBtn: "Envoyer", wellDone: "Bien joue !", processingDesc: "Verification reussie.", amountToReceive: "Montant a recevoir :", processingText: "Virement en cours...", cardWelcome: "Felicitations, votre carte est disponible.", activateCardBtn: "Activer ma carte", blockCardBtn: "Bloquer ma carte", cardTransactions: "Transactions par carte", validUntil: "VALABLE JUSQU'AU :", personalData: "Donnees personnelles", accountOwner: "Titulaire :", emailLabel: "E-mail :", phoneLabel: "Telephone :", countryLabel: "Pays :", addressLabel: "Adresse :", accountAndTransfer: "Compte et virement", balanceProfile: "Solde :", accountType: "Type :", accountStatus: "Statut :", statusActive: "Actif", supportedTransfer: "Virement supporte :", beneficiaryIban: "IBAN du beneficiaire :", accountTypeValue: "Professionnel", transferTypeValue: "Classique", profileBanner: "Contactez notre equipe d'assistance.", logoutBtn: "Se deconnecter", modalSuccess: "Virement de {amount} envoye", modalFailure: "Echec du transfert", sendTime: "Heure d'envoi :", closeBtn: "Fermer", navBalance: "Accueil", navCard: "Carte virtuelle", navTransfer: "Paiements", navAccount: "Profil", txTransferSent: "Virement envoye", txTransferReceived: "Virement recu", invalidAmount: "Veuillez saisir un montant valide.", amountExceedsBalance: "Le montant depasse votre solde disponible." },
  es: { loginTitle: "Inicia sesion", emailPh: "Tu correo", pinPh: "Tu codigo", loginBtn: "Iniciar", loginErr: "Correo o PIN incorrecto.", greeting: "Hola", personalAccount: "Personal", accounts: "Cuentas", seeIban: "Ver mi IBAN", virtualCard: "Tarjeta virtual", makeTransferShort: "Hacer transferencia", myIbanTitle: "Mi IBAN", copyBtn: "Copiar", copied: "Copiado!", balanceLabel: "Saldo :", transactionHistory: "Historial", noTransactions: "Sin historial.", sendOutgoingTransfer: "Enviar transferencia", transferDetails: "Detalles", amountToDebit: "IMPORTE A DEBITAR", labelIban: "IBAN / NUMERO DE CUENTA", labelSwift: "CODIGO BANCO (BIC/SWIFT)", labelBank: "NOMBRE DEL BANCO", labelBeneficiary: "NOMBRE DEL BENEFICIARIO", labelReason: "MOTIVO", processingWarning: "Realizacion en 1-3 minutos tras verificacion final.", nextBtn: "Siguiente", transferSummary: "Resumen", transferAmountLabel: "Importe:", ibanLabel: "IBAN", ibanLabelLine2: "de cuenta:", swiftLabel: "BIC:", bankLabel: "Banco:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", identityVerification: "Verificacion", verificationDesc: "Introduzca el codigo:", sendBtn: "Enviar", wellDone: "Bien hecho!", processingDesc: "Verificacion exitosa.", amountToReceive: "Importe:", processingText: "En curso...", cardWelcome: "Tarjeta disponible.", activateCardBtn: "Activar", blockCardBtn: "Bloquear", cardTransactions: "Transacciones", validUntil: "VALIDA HASTA:", personalData: "Datos personales", accountOwner: "Titular:", emailLabel: "Correo:", phoneLabel: "Telefono:", countryLabel: "Pais:", addressLabel: "Direccion:", accountAndTransfer: "Cuenta", balanceProfile: "Saldo:", accountType: "Tipo:", accountStatus: "Estado:", statusActive: "Activo", supportedTransfer: "Soporte:", beneficiaryIban: "IBAN:", accountTypeValue: "Profesional", transferTypeValue: "Clasico", profileBanner: "Contacte con soporte.", logoutBtn: "Salir", modalSuccess: "Transferencia de {amount} enviada", modalFailure: "Fallida", sendTime: "Hora:", closeBtn: "Cerrar", navBalance: "Inicio", navCard: "Tarjeta virtual", navTransfer: "Pagos", navAccount: "Perfil", txTransferSent: "Enviada", txTransferReceived: "Recibida", invalidAmount: "Ingrese un importe valido.", amountExceedsBalance: "El importe supera su saldo." },
  it: { loginTitle: "Accedi", emailPh: "Email", pinPh: "Codice", loginBtn: "Accedi", loginErr: "Email o PIN errato.", greeting: "Ciao", personalAccount: "Personale", accounts: "Conti", seeIban: "Vedi il mio IBAN", virtualCard: "Carta virtuale", makeTransferShort: "Fai un bonifico", myIbanTitle: "Il mio IBAN", copyBtn: "Copia", copied: "Copiato!", balanceLabel: "Saldo :", transactionHistory: "Cronologia", noTransactions: "Nessuna cronologia.", sendOutgoingTransfer: "Invia bonifico", transferDetails: "Dettagli", amountToDebit: "IMPORTO DA ADDEBITARE", labelIban: "IBAN / NUMERO DI CONTO", labelSwift: "CODICE BANCA (BIC/SWIFT)", labelBank: "NOME DELLA BANCA", labelBeneficiary: "NOME DEL BENEFICIARIO", labelReason: "MOTIVO", processingWarning: "Esecuzione entro 1-3 minuti dopo verifica finale.", nextBtn: "Avanti", transferSummary: "Riepilogo", transferAmountLabel: "Importo:", ibanLabel: "IBAN", ibanLabelLine2: "conto:", swiftLabel: "BIC:", bankLabel: "Banca:", beneficiaryLabel: "Beneficiario:", reasonLabel: "Motivo:", identityVerification: "Verifica", verificationDesc: "Inserisci il codice:", sendBtn: "Invia", wellDone: "Ben fatto!", processingDesc: "Verifica riuscita.", amountToReceive: "Importo:", processingText: "In corso...", cardWelcome: "Carta disponibile.", activateCardBtn: "Attiva", blockCardBtn: "Blocca", cardTransactions: "Transazioni", validUntil: "VALIDA FINO AL:", personalData: "Dati personali", accountOwner: "Titolare:", emailLabel: "Email:", phoneLabel: "Telefono:", countryLabel: "Paese:", addressLabel: "Indirizzo:", accountAndTransfer: "Conto", balanceProfile: "Saldo:", accountType: "Tipo:", accountStatus: "Stato:", statusActive: "Attivo", supportedTransfer: "Supporto:", beneficiaryIban: "IBAN:", accountTypeValue: "Professionale", transferTypeValue: "Classico", profileBanner: "Contatta il supporto.", logoutBtn: "Esci", modalSuccess: "Bonifico di {amount} inviato", modalFailure: "Fallito", sendTime: "Ora:", closeBtn: "Chiudi", navBalance: "Home", navCard: "Carta virtuale", navTransfer: "Pagamenti", navAccount: "Profilo", txTransferSent: "Inviato", txTransferReceived: "Ricevuto", invalidAmount: "Inserisci un importo valido.", amountExceedsBalance: "L'importo supera il saldo." },
  de: { loginTitle: "Anmelden", emailPh: "E-Mail", pinPh: "Zugangscode", loginBtn: "Anmelden", loginErr: "Falsche E-Mail oder PIN.", greeting: "Hallo", personalAccount: "Personlich", accounts: "Konten", seeIban: "Meine IBAN anzeigen", virtualCard: "Virtuelle Karte", makeTransferShort: "Uberweisung", myIbanTitle: "Meine IBAN", copyBtn: "Kopieren", copied: "Kopiert!", balanceLabel: "Kontostand :", transactionHistory: "Verlauf", noTransactions: "Kein Verlauf.", sendOutgoingTransfer: "Uberweisung senden", transferDetails: "Details", amountToDebit: "ZU BELASTENDER BETRAG", labelIban: "IBAN / KONTONUMMER", labelSwift: "BANKCODE (BIC/SWIFT)", labelBank: "NAME DER BANK", labelBeneficiary: "NAME DES BEGUNSTIGTEN", labelReason: "GRUND", processingWarning: "Ausfuhrung in 1-3 Minuten nach finaler Uberprufung.", nextBtn: "Weiter", transferSummary: "Ubersicht", transferAmountLabel: "Betrag:", ibanLabel: "IBAN", ibanLabelLine2: "des Kontos:", swiftLabel: "BIC:", bankLabel: "Empfanger:", beneficiaryLabel: "Begunstigter:", reasonLabel: "Grund:", identityVerification: "Prufung", verificationDesc: "Code eingeben:", sendBtn: "Senden", wellDone: "Gut gemacht!", processingDesc: "Erfolgreich.", amountToReceive: "Betrag:", processingText: "In Bearbeitung...", cardWelcome: "Karte verfugbar.", activateCardBtn: "Aktivieren", blockCardBtn: "Sperren", cardTransactions: "Transaktionen", validUntil: "GULTIG BIS:", personalData: "Personliche Daten", accountOwner: "Kontoinhaber:", emailLabel: "E-Mail:", phoneLabel: "Telefon:", countryLabel: "Land:", addressLabel: "Adresse:", accountAndTransfer: "Konto", balanceProfile: "Kontostand:", accountType: "Typ:", accountStatus: "Status:", statusActive: "Aktiv", supportedTransfer: "Support:", beneficiaryIban: "IBAN:", accountTypeValue: "Professionell", transferTypeValue: "Klassisch", profileBanner: "Support kontaktieren.", logoutBtn: "Abmelden", modalSuccess: "Uberweisung von {amount} gesendet", modalFailure: "Fehlgeschlagen", sendTime: "Zeit:", closeBtn: "Schliessen", navBalance: "Start", navCard: "Virtuelle Karte", navTransfer: "Zahlungen", navAccount: "Profil", txTransferSent: "Gesendet", txTransferReceived: "Erhalten", invalidAmount: "Bitte gultigen Betrag eingeben.", amountExceedsBalance: "Der Betrag ubersteigt das Guthaben." }
};

const ibanLabels = {
  pl: { title: "Dane konta", numberLabel: "NUMER IBAN", ownerLabel: "WLASCICIEL", bicLabel: "BIC / SWIFT", warning: "Ze wzgledow bezpieczenstwa niektore znaki IBAN zostaly zamaskowane." },
  fr: { title: "Details du compte", numberLabel: "NUMERO IBAN", ownerLabel: "TITULAIRE", bicLabel: "BIC / SWIFT", warning: "Pour des raisons de securite, certains caracteres de l'IBAN ont ete masques." },
  es: { title: "Detalles de la cuenta", numberLabel: "NUMERO IBAN", ownerLabel: "TITULAR", bicLabel: "BIC / SWIFT", warning: "Por razones de seguridad, algunos caracteres del IBAN han sido enmascarados." },
  it: { title: "Dettagli del conto", numberLabel: "NUMERO IBAN", ownerLabel: "TITOLARE", bicLabel: "BIC / SWIFT", warning: "Per motivi di sicurezza, alcuni caratteri dell'IBAN sono stati mascherati." },
  de: { title: "Kontodetails", numberLabel: "IBAN-NUMMER", ownerLabel: "INHABER", bicLabel: "BIC / SWIFT", warning: "Aus Sicherheitsgrunden wurden einige IBAN-Zeichen maskiert." }
};

const cardLabels = {
  pl: { title: "Karta wirtualna", holderLabel: "POSIADACZ", expiryLabel: "WAZNA DO", cvvLabel: "CVV", numberLabel: "NUMER KARTY", typeLabel: "TYP", typeValue: "Visa Debit", copyBtn: "Kopiuj numer", showBtn: "Pokaz", hideBtn: "Ukryj", warningMasked: "Ostatnie 4 cyfry ukryte. Kliknij \"Pokaz\", aby ujawnic pelny numer.", warningCvvMasked: "CVV jest ukryty.", warningFull: "Karta w pelni widoczna." },
  fr: { title: "Carte virtuelle", holderLabel: "TITULAIRE", expiryLabel: "VALABLE JUSQU'AU", cvvLabel: "CVV", numberLabel: "NUMERO DE CARTE", typeLabel: "TYPE", typeValue: "Visa Debit", copyBtn: "Copier le numero", showBtn: "Afficher", hideBtn: "Masquer", warningMasked: "Les 4 derniers chiffres sont caches. Cliquez sur \"Afficher\" pour reveler le numero complet.", warningCvvMasked: "Le CVV est masque.", warningFull: "Carte completement visible." },
  es: { title: "Tarjeta virtual", holderLabel: "TITULAR", expiryLabel: "VALIDA HASTA", cvvLabel: "CVV", numberLabel: "NUMERO DE TARJETA", typeLabel: "TIPO", typeValue: "Visa Debit", copyBtn: "Copiar numero", showBtn: "Mostrar", hideBtn: "Ocultar", warningMasked: "Los ultimos 4 digitos estan ocultos. Pulse \"Mostrar\" para revelar el numero completo.", warningCvvMasked: "El CVV esta oculto.", warningFull: "Tarjeta completamente visible." },
  it: { title: "Carta virtuale", holderLabel: "TITOLARE", expiryLabel: "VALIDA FINO AL", cvvLabel: "CVV", numberLabel: "NUMERO CARTA", typeLabel: "TIPO", typeValue: "Visa Debit", copyBtn: "Copia numero", showBtn: "Mostra", hideBtn: "Nascondi", warningMasked: "Le ultime 4 cifre sono nascoste. Clicca \"Mostra\" per rivelare il numero completo.", warningCvvMasked: "Il CVV e nascosto.", warningFull: "Carta completamente visibile." },
  de: { title: "Virtuelle Karte", holderLabel: "INHABER", expiryLabel: "GULTIG BIS", cvvLabel: "CVV", numberLabel: "KARTENNUMMER", typeLabel: "TYP", typeValue: "Visa Debit", copyBtn: "Nummer kopieren", showBtn: "Anzeigen", hideBtn: "Verbergen", warningMasked: "Die letzten 4 Ziffern sind ausgeblendet. Klicken Sie auf \"Anzeigen\", um die vollstandige Nummer zu sehen.", warningCvvMasked: "CVV ist ausgeblendet.", warningFull: "Karte vollstandig sichtbar." }
};

let currentLang = 'fr';
let currentClient = null;
let progressInterval = null;
let clientUnsubscribe = null;
let pendingTransferAmount = 0;
let virtualCardRevealed = false;

const t = function(k) { const d = i18n[currentLang] || i18n.fr; return d[k] !== undefined ? d[k] : (i18n.fr[k] || k); };
const formatAmount = function(a, c) { return a.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + c; };
const generateShortId = function() { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let r = ''; for (let i = 0; i < 6; i++) r += c.charAt(Math.floor(Math.random() * c.length)); return r; };
const darken = function(hex, pct) { const n = parseInt(hex.replace('#', ''), 16); const r = Math.max(0, ((n >> 16) & 255) - pct); const g = Math.max(0, ((n >> 8) & 255) - pct); const b = Math.max(0, (n & 255) - pct); return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0'); };
const applyTheme = function(color) { color = color || '#1a73e8'; document.documentElement.style.setProperty('--primary', color); document.documentElement.style.setProperty('--primary-dark', darken(color, 40)); };
const splitBalance = function(amount, currency) {
  const formatted = (amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lastComma = formatted.lastIndexOf(',');
  if (lastComma === -1) return { intPart: formatted, decPart: ' ' + currency };
  return { intPart: formatted.substring(0, lastComma + 1), decPart: formatted.substring(lastComma + 1) + ' ' + currency };
};

// =====================================================
// MODAL MANAGER — Version 100% robuste avec styles inline
// =====================================================
function ensureModal(modalId) {
  let overlay = document.getElementById(modalId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = modalId;
    // Styles inline forcés pour garantir la visibilité
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.75);display:none;justify-content:center;align-items:center;z-index:99999;padding:12px;box-sizing:border-box;overflow-y:auto;';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
      }
    });
  }
  return overlay;
}

function openModal(modalId) {
  const o = ensureModal(modalId);
  o.classList.add('active');
  o.style.display = 'flex';
}

function closeModal(modalId) {
  const o = document.getElementById(modalId);
  if (o) {
    o.classList.remove('active');
    o.style.display = 'none';
  }
}

// =====================================================
// COMPOSANTS PARTAGÉS
// =====================================================
function renderBalanceHero(client) {
  const currency = client.currency || '€';
  const parts = splitBalance(client.balance || 0, currency);
  return '<div class="balance-label">' + t('personalAccount') + ' · ' + currency + '</div>' +
    '<div class="balance-big">' +
      '<span class="balance-int">' + parts.intPart + '</span>' +
      '<span class="balance-dec">' + parts.decPart + '</span>' +
    '</div>' +
    '<button class="account-pill" onclick="window.navigateTo(\'screen-profile\')">' + t('accounts') + '</button>' +
    '<div class="dots-indicator"><span class="active"></span><span></span><span></span></div>';
}

function renderQuickActions() {
  return '<div class="quick-actions-block">' +
    '<div class="quick-action" onclick="window.showIban()">' +
      '<div class="quick-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div>' +
      '<span>' + t('seeIban') + '</span>' +
    '</div>' +
    '<div class="quick-action" onclick="window.showVirtualCard()">' +
      '<div class="quick-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg></div>' +
      '<span>' + t('virtualCard') + '</span>' +
    '</div>' +
    '<div class="quick-action" onclick="window.navigateTo(\'screen-transfer\')">' +
      '<div class="quick-icon"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></div>' +
      '<span>' + t('makeTransferShort') + '</span>' +
    '</div>' +
  '</div>';
}

function renderTransactions(txs) {
  if (!txs || txs.length === 0) return '<p style="color:#94a3b8;font-size:11px;text-align:center;padding:15px 0;">' + t('noTransactions') + '</p>';
  let html = '';
  txs.forEach(function(tx) {
    const isIn = tx.type === 'in';
    const title = isIn ? t('txTransferReceived') : t('txTransferSent');
    let iconClass = 'icon-grey';
    let iconSvg = '<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>';
    if (!isIn) { iconClass = 'icon-red'; iconSvg = '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>'; }
    else { iconClass = 'icon-green'; }
    html += '<div class="transaction-item"><div class="tx-icon ' + iconClass + '"><svg viewBox="0 0 24 24">' + iconSvg + '</svg></div><div class="tx-details"><div class="tx-title">' + title + '</div><div class="tx-subtitle">' + (tx.subtitle || '') + '</div></div><div class="tx-amount"><div class="' + (isIn ? 'amount-pos' : 'amount-neg') + '">' + (isIn ? '+' : '-') + tx.amount + '</div><div class="tx-date">' + tx.date + '</div></div></div>';
  });
  return html;
}

function subscribeToClient(clientId) {
  if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; }
  try {
    clientUnsubscribe = onSnapshot(doc(db, 'clients', clientId), function(snap) {
      if (!snap.exists()) { ClientSession.clear(); if (clientUnsubscribe) { try { clientUnsubscribe(); } catch(e) {} clientUnsubscribe = null; } initClient(); return; }
      const fresh = Object.assign({ id: snap.id }, snap.data());
      if (fresh.blocked) { ClientSession.clear(); if (clientUnsubscribe) { try { clientUnsubscribe(); } catch(e) {} clientUnsubscribe = null; } initClient(); return; }
      currentClient = fresh;
      currentLang = fresh.language || 'fr';
      applyTheme(fresh.themeColor);
      const hero = document.getElementById('balance-hero');
      if (hero) hero.innerHTML = renderBalanceHero(fresh);
      const list = document.getElementById('transaction-list');
      if (list) list.innerHTML = renderTransactions(fresh.transactions);
    }, function(err) { console.warn('onSnapshot error:', err); });
  } catch (e) { console.warn('subscribeToClient failed:', e); }
}

// =====================================================
// EXPORTS
// =====================================================
export function initClientApp() { initClient(); }
export function initAdminApp() { initAdmin(); }

// =====================================================
// CLIENT
// =====================================================
async function initClient() {
  const clientId = new URLSearchParams(window.location.search).get('id');
  const root = document.getElementById('app-root');
  if (!root) return;

  if (!clientId) {
    root.innerHTML = '<div class="view active"><div class="no-access"><div class="ico"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div><h2>Acces restreint</h2><p>Cette application necessite un lien de connexion valide.</p></div></div>';
    return;
  }

  const client = await FireDB.getClient(clientId);
  if (!client) {
    root.innerHTML = '<div class="view active"><div class="blocked-screen"><div class="ico"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div><h2>Lien invalide</h2><p>Ce lien n\'est plus valide.</p></div></div>';
    return;
  }
  if (client.blocked) {
    root.innerHTML = '<div class="view active"><div class="blocked-screen"><div class="ico"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div><h2>Compte suspendu</h2><p>Votre acces a ete temporairement suspendu.</p></div></div>';
    return;
  }

  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);

  const activeId = ClientSession.getActive();
  if (activeId === clientId) renderBankingApp(client);
  else renderLoginPage(client);
}

function renderLoginPage(client) {
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  const root = document.getElementById('app-root');

  root.innerHTML =
    '<div class="view active">' +
      '<div class="login-page">' +
        '<div class="login-card">' +
          '<div class="login-logo">' +
            '<svg class="login-logo-mark" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">' +
              '<circle cx="14" cy="12" r="4" fill="#0d9488"/><circle cx="24" cy="8" r="3" fill="#0d9488"/>' +
              '<circle cx="34" cy="10" r="2.5" fill="#22c55e"/><circle cx="43" cy="15" r="2.5" fill="#84cc16"/>' +
              '<circle cx="7" cy="22" r="3.5" fill="#0d9488"/><circle cx="6" cy="34" r="3.5" fill="#0d9488"/>' +
              '<circle cx="10" cy="45" r="3" fill="#14b8a6"/><circle cx="20" cy="52" r="2.5" fill="#14b8a6"/>' +
              '<circle cx="32" cy="50" r="3" fill="#0d9488"/><circle cx="43" cy="43" r="3" fill="#0d9488"/>' +
              '<circle cx="50" cy="33" r="3" fill="#0d9488"/><circle cx="49" cy="21" r="2.5" fill="#14b8a6"/>' +
              '<circle cx="20" cy="22" r="2" fill="#5eead4"/><circle cx="24" cy="32" r="2.5" fill="#5eead4"/>' +
              '<circle cx="22" cy="42" r="2" fill="#5eead4"/><circle cx="33" cy="22" r="1.5" fill="#84cc16"/>' +
              '<circle cx="37" cy="30" r="2" fill="#84cc16"/><circle cx="34" cy="40" r="1.5" fill="#14b8a6"/>' +
            '</svg>' +
            '<span class="login-logo-text">TRANSFERWIRE</span>' +
          '</div>' +
          '<div class="login-title">' + t('loginTitle') + '</div>' +
          '<div class="login-user-badge">' +
            '<svg viewBox="0 0 24 24" fill="none"><path d="M8 3H6a3 3 0 0 0-3 3v2M16 3h2a3 3 0 0 1 3 3v2M8 21H6a3 3 0 0 1-3-3v-2M16 21h2a3 3 0 0 0 3-3v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="10" r="2" fill="currentColor"/><path d="M8.5 16c0-1.8 1.6-2.8 3.5-2.8s3.5 1 3.5 2.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>' +
            '<span>' + (client.firstName + ' ' + client.lastName).toUpperCase() + '</span>' +
          '</div>' +
          '<form id="login-form" autocomplete="off">' +
            '<div class="login-input-group"><div class="login-input-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></div><input type="email" id="email" placeholder="' + t('emailPh') + '" required></div>' +
            '<div class="login-input-group"><div class="login-input-icon"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm0-6c-2.48 0-4.5 2.02-4.5 4.5S9.52 14 12 14s4.5-2.02 4.5-4.5S14.48 5 12 5z"/></svg></div><input type="password" id="pin" placeholder="' + t('pinPh') + '" required></div>' +
            '<div class="login-error-msg" id="error-msg">' + t('loginErr') + '</div>' +
            '<button type="submit" class="login-btn"><span>' + t('loginBtn') + '</span><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</div>';

  replaceLoginHistory();

  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pin = document.getElementById('pin').value.trim();
    if (email === client.email && pin === client.pin) {
      const fresh = await FireDB.getClient(client.id);
      if (!fresh) { alert('Lien invalide'); return; }
      if (fresh.blocked) { alert('Compte suspendu'); return; }
      ClientSession.setActive(client.id);
      replaceHistory('screen-dashboard');
      initClient();
    } else {
      document.getElementById('error-msg').style.display = 'block';
    }
  });
}

function renderBankingApp(client) {
  currentClient = client;
  currentLang = client.language || 'fr';
  applyTheme(client.themeColor);
  const root = document.getElementById('app-root');
  const currency = client.currency || '€';
  const balanceFormatted = formatAmount(client.balance || 0, currency);

  root.innerHTML = '<div class="view active" style="display:flex;flex-direction:column;height:100%;">' +
    '<header class="app-header">' +
      '<button class="icon-button menu-icon" onclick="window.ClientLogout()"><svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg></button>' +
      '<div class="header-title">TRANSFERWIRE</div>' +
      '<button class="icon-button" onclick="window.navigateTo(\'screen-profile\')"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></button>' +
    '</header>' +
    '<div class="screens-container">' +
      '<div id="screen-dashboard" class="screen active">' +
        '<div class="greeting">' + t('greeting') + ' ' + client.firstName + ' ' + client.lastName + ' ,</div>' +
        '<div class="dashboard-hero" id="balance-hero">' + renderBalanceHero(client) + '</div>' +
        renderQuickActions() +
        '<div class="section-title">' + t('transactionHistory') + '</div>' +
        '<div class="transaction-list" id="transaction-list">' + renderTransactions(client.transactions) + '</div>' +
      '</div>' +
      '<div id="screen-transfer" class="screen">' +
        '<div class="page-title-bar"><div class="page-title-icon"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></div><span>' + t('sendOutgoingTransfer') + '</span></div>' +
        '<div class="transfer-amount">' + balanceFormatted + '</div>' +
        '<div class="details-header"><div class="details-icon">i</div><span>' + t('transferDetails') + '</span></div>' +
        '<form id="transfer-form">' +
          '<div class="form-group"><label class="form-label">' + t('amountToDebit') + '</label><input type="number" class="form-input amount-input" id="input-amount" step="0.01" min="0.01" required></div>' +
          '<div class="form-group"><label class="form-label">' + t('labelIban') + '</label><input type="text" class="form-input" id="input-iban" required></div>' +
          '<div class="form-group"><label class="form-label">' + t('labelSwift') + '</label><input type="text" class="form-input" id="input-swift" required></div>' +
          '<div class="form-group"><label class="form-label">' + t('labelBank') + '</label><input type="text" class="form-input" id="input-bank" required></div>' +
          '<div class="form-group"><label class="form-label">' + t('labelBeneficiary') + '</label><input type="text" class="form-input" id="input-name" required></div>' +
          '<div class="form-group"><label class="form-label">' + t('labelReason') + '</label><input type="text" class="form-input" id="input-title" required></div>' +
        '</form>' +
        '<div class="warning-box"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><div class="warning-text">' + t('processingWarning') + '</div></div>' +
        '<button class="submit-btn" onclick="window.submitTransferForm()">' + t('nextBtn') + '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button>' +
      '</div>' +
      '<div id="screen-verification" class="screen">' +
        '<div class="summary-card">' +
          '<div class="summary-header"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg><span>' + t('transferSummary') + '</span></div>' +
          '<div class="summary-list">' +
            '<div class="summary-item"><span>' + t('transferAmountLabel') + '</span><span class="summary-value" id="summary-amount">-</span></div>' +
            '<div class="summary-item"><span>' + t('ibanLabel') + '</span><span class="summary-value-block" id="summary-iban">' + t('ibanLabelLine2') + ' </span></div>' +
            '<div class="summary-item"><span>' + t('swiftLabel') + '</span><span class="summary-value" id="summary-swift"></span></div>' +
            '<div class="summary-item"><span>' + t('bankLabel') + '</span><span class="summary-value" id="summary-bank"></span></div>' +
            '<div class="summary-item"><span>' + t('beneficiaryLabel') + '</span><span class="summary-value" id="summary-name"></span></div>' +
            '<div class="summary-item"><span>' + t('reasonLabel') + '</span><span class="summary-value" id="summary-title"></span></div>' +
          '</div>' +
        '</div>' +
        '<div class="verification-section">' +
          '<div class="verification-header"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg><span>' + t('identityVerification') + '</span></div>' +
          '<div class="verification-desc">' + t('verificationDesc') + '</div>' +
          '<input type="text" class="verification-input" id="security-code" required>' +
          '<button class="submit-btn" onclick="window.startProcessing()">' + t('sendBtn') + '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button>' +
        '</div>' +
      '</div>' +
      '<div id="screen-processing" class="screen">' +
        '<div class="info-card"><h2>' + t('wellDone') + '</h2><p>' + t('processingDesc') + '</p><div class="divider"></div>' +
          '<div class="info-details">' +
            '<div><span class="lbl">' + t('beneficiaryLabel') + '</span>' + client.firstName + ' ' + client.lastName + '</div>' +
            '<div><span class="lbl">' + t('bankLabel') + '</span>' + (client.bankName || 'BNP Paribas') + '</div>' +
            '<div><span class="lbl">' + t('ibanLabel') + '</span><span id="processing-iban"></span></div>' +
            '<div><span class="lbl">' + t('amountToReceive') + '</span><span id="processing-amount">-</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="progress-section">' +
          '<div class="progress-text">' + t('processingText') + '</div>' +
          '<div class="progress-circle-wrapper"><div class="progress-circle" id="progress-text">0%</div></div>' +
          '<div class="progress-bar-container"><div class="progress-fill" id="progress-bar"></div></div>' +
        '</div>' +
      '</div>' +
      '<div id="screen-card" class="screen">' +
        '<div class="info-banner info-banner-blue" id="card-banner"><div class="banner-text">' + t('cardWelcome') + '</div><div class="banner-close" onclick="document.getElementById(\'card-banner\').style.display=\'none\'"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div></div>' +
        '<div class="credit-card">' +
          '<div><div class="card-brand">TRANSFERWIRE</div><div class="card-number">4987 **** **** 3327</div><div class="card-holder">' + getCardHolderName(client) + '</div></div>' +
          '<div class="card-footer"><div><div class="card-expiry">' + t('validUntil') + ' 05/2029</div><div class="card-cvv">CVV : 843</div></div><div class="visa-logo">VISA</div></div>' +
        '</div>' +
        '<div class="card-actions">' +
          '<button class="btn btn-green" onclick="alert(\'' + t('activateCardBtn') + '\')">' + t('activateCardBtn') + '</button>' +
          '<button class="btn btn-red" onclick="alert(\'' + t('blockCardBtn') + '\')">' + t('blockCardBtn') + '</button>' +
        '</div>' +
        '<div class="card-transactions-title">' + t('cardTransactions') + '</div>' +
        '<div class="spinner-container"><div class="spinner"></div></div>' +
      '</div>' +
      '<div id="screen-profile" class="screen">' +
        '<div class="info-banner info-banner-yellow" id="profile-banner"><div class="banner-text">' + t('profileBanner') + '</div><div class="banner-close" onclick="document.getElementById(\'profile-banner\').style.display=\'none\'"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div></div>' +
        '<div class="profile-section">' +
          '<div class="profile-header"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>' + t('personalData') + '</span></div>' +
          '<div class="profile-list">' +
            '<div class="profile-item"><span class="profile-label">' + t('accountOwner') + '</span><span class="profile-value">' + client.firstName + ' ' + client.lastName + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('emailLabel') + '</span><span class="profile-value">' + client.email + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('phoneLabel') + '</span><span class="profile-value">' + (client.phone || '-') + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('countryLabel') + '</span><span class="profile-value">' + client.country + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('addressLabel') + '</span><span class="profile-value">' + (client.address || '-') + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="profile-section">' +
          '<div class="profile-header"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg><span>' + t('accountAndTransfer') + '</span></div>' +
          '<div class="profile-list">' +
            '<div class="profile-item"><span class="profile-label">' + t('balanceProfile') + '</span><span class="profile-value">' + balanceFormatted + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('accountType') + '</span><span class="profile-value">' + t('accountTypeValue') + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('accountStatus') + '</span><span class="profile-value status-active"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' + t('statusActive') + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('supportedTransfer') + '</span><span class="profile-value">' + t('transferTypeValue') + '</span></div>' +
            '<div class="profile-item"><span class="profile-label">' + t('beneficiaryIban') + '</span><span class="profile-value iban-link">' + (client.iban ? formatIban(client.iban) : 'N/A') + '</span></div>' +
          '</div>' +
        '</div>' +
        '<button class="logout-btn" onclick="window.ClientLogout()"><svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>' + t('logoutBtn') + '</button>' +
      '</div>' +
    '</div>' +
    '<nav class="bottom-nav">' +
      '<div class="bottom-nav-inner">' +
        '<div class="nav-item active" id="nav-dashboard" onclick="window.navigateTo(\'screen-dashboard\')"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>' + t('navBalance') + '</span></div>' +
        '<div class="nav-item" id="nav-transfer" onclick="window.navigateTo(\'screen-transfer\')"><svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg><span>' + t('navTransfer') + '</span></div>' +
        '<div class="nav-item" id="nav-card" onclick="window.showVirtualCard()"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2z"/></svg><span>' + t('navCard') + '</span></div>' +
        '<div class="nav-item" id="nav-profile" onclick="window.navigateTo(\'screen-profile\')"><svg viewBox="0 0 24 24"><path d="M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 3c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm6 5H6v-.99c.2-.72 3.3-2.01 6-2.01s5.8 1.29 6 2v1z"/></svg><div class="notification-dot"></div><span>' + t('navAccount') + '</span></div>' +
      '</div>' +
    '</nav>' +
  '</div>';

  subscribeToClient(client.id);

  if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '') {
    replaceHistory('screen-dashboard');
  }
}

// =====================================================
// NAVIGATION CLIENT
// =====================================================
window.ClientLogout = function() {
  if (clientUnsubscribe) { try { clientUnsubscribe(); } catch (e) {} clientUnsubscribe = null; }
  ClientSession.clear();
  replaceLoginHistory();
  initClient();
};

window.navigateTo = function(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); });
  const map = { 'screen-dashboard': 'nav-dashboard', 'screen-card': 'nav-card', 'screen-profile': 'nav-profile' };
  let navId = map[id];
  if (['screen-transfer', 'screen-verification', 'screen-processing'].indexOf(id) !== -1) navId = 'nav-transfer';
  if (navId) { const n = document.getElementById(navId); if (n) n.classList.add('active'); }
  const container = document.querySelector('.screens-container');
  if (container) container.scrollTop = 0;
  pushHistory(id);
};

// =====================================================
// IBAN MODAL
// =====================================================
window.showIban = function() {
  console.log('[showIban] appelée, currentClient =', currentClient);
  if (!currentClient) { alert('Client non initialise'); return; }

  const rawIban = currentClient.iban || currentClient.address || 'N/A';
  const ownerName = getCardHolderName(currentClient);
  const bic = currentClient.bic || 'BICCODEXX';
  const masked = currentClient.ibanMasked === true;
  const displayIban = masked ? maskIban(rawIban) : rawIban;
  const formattedIban = formatIban(displayIban);
  const L = ibanLabels[currentLang] || ibanLabels.fr;

  const overlay = ensureModal('iban-modal');
  overlay.innerHTML =
    '<div class="modal iban-modal-new">' +
      '<div class="iban-new-header">' +
        '<div class="iban-new-icon"><svg viewBox="0 0 24 24"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg></div>' +
        '<div class="iban-new-header-text"><div class="iban-new-title">' + L.title + '</div></div>' +
        '<button class="iban-new-close" onclick="window.closeIban()" aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>' +
      '</div>' +
      '<div class="iban-new-body">' +
        '<div class="iban-new-iban-box">' +
          '<div class="iban-new-iban-head">' +
            '<span class="iban-new-iban-label">' + L.numberLabel + '</span>' +
            '<button class="iban-new-copy" id="iban-copy-btn" onclick="window.copyIban()"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span id="iban-copy-label">' + t('copyBtn') + '</span></button>' +
          '</div>' +
          '<div class="iban-new-iban-value">' + formattedIban + '</div>' +
        '</div>' +
        '<div class="iban-new-row">' +
          '<div class="iban-new-info"><div class="iban-new-info-label">' + L.ownerLabel + '</div><div class="iban-new-info-value">' + ownerName + '</div></div>' +
          '<div class="iban-new-info"><div class="iban-new-info-label">' + L.bicLabel + '</div><div class="iban-new-info-value">' + bic + '</div></div>' +
        '</div>' +
        '<div class="iban-new-warning"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><span>' + L.warning + '</span></div>' +
      '</div>' +
    '</div>';

  openModal('iban-modal');
};

window.closeIban = function() { closeModal('iban-modal'); };

window.copyIban = function() {
  const rawIban = currentClient.iban || currentClient.address || '';
  const labelEl = document.getElementById('iban-copy-label');
  if (!labelEl) return;
  const original = labelEl.innerText;
  function showCopied() { labelEl.innerText = 'OK ' + t('copied'); setTimeout(function() { labelEl.innerText = original; }, 1500); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(rawIban).then(showCopied).catch(function() {
      const ta = document.createElement('textarea'); ta.value = rawIban; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); showCopied();
    });
  } else {
    const ta = document.createElement('textarea'); ta.value = rawIban; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta); showCopied();
  }
};

// =====================================================
// VIRTUAL CARD MODAL — VERSION ROBUSTE
// =====================================================
window.showVirtualCard = function() {
  console.log('===== [showVirtualCard] =====');
  console.log('currentClient =', currentClient);

  // Vérification : si currentClient n'existe pas
  if (!currentClient) {
    alert('Erreur : client non initialise. Rechargez la page.');
    return;
  }

  try {
    const cardNum = currentClient.cardNumber || '4987103143003327';
    const cardHolder = getCardHolderName(currentClient);
    const cardExpiry = currentClient.cardExpiry || '12/40';
    const cardCvv = currentClient.cardCvv || '843';
    const cardType = currentClient.cardType || 'Visa Debit';
    const maskLast4 = currentClient.cardMaskLast4 !== false;
    const maskCvv = currentClient.cardMaskCvv !== false;

    virtualCardRevealed = false;
    const L = cardLabels[currentLang] || cardLabels.fr;

    // Récupérer/créer l'overlay
    const overlay = ensureModal('card-modal');
    console.log('overlay =', overlay);

    // Injecter le contenu
    overlay.innerHTML =
      '<div class="modal card-modal-new">' +
        '<div class="card-modal-header">' +
          '<div class="card-modal-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6z"/></svg></div>' +
          '<div class="card-modal-title">' + L.title + '</div>' +
          '<button class="card-modal-close" onclick="window.closeVirtualCard()" aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>' +
        '</div>' +
        '<div class="card-modal-body" id="card-modal-body">' + renderVirtualCardBody(cardNum, cardHolder, cardExpiry, cardCvv, cardType, maskLast4, maskCvv, false) + '</div>' +
      '</div>';

    // Afficher
    openModal('card-modal');
    console.log('Modal ouverte avec success. display =', overlay.style.display);
  } catch (err) {
    console.error('Erreur dans showVirtualCard:', err);
    alert('Erreur : ' + err.message);
  }
};

window.closeVirtualCard = function() { closeModal('card-modal'); };

function renderVirtualCardBody(cardNum, cardHolder, cardExpiry, cardCvv, cardType, maskLast4, maskCvv, revealed) {
  const L = cardLabels[currentLang] || cardLabels.fr;
  const showFullNumber = revealed || !maskLast4;
  const showFullCvv = revealed || !maskCvv;
  const displayNum = showFullNumber ? cardNum : maskCardNumber(cardNum);
  const displayCvv = showFullCvv ? cardCvv : '•••';
  const formattedNum = formatCardNumber(displayNum);
  const formattedHolder = (cardHolder || '').toUpperCase();

  let warningText = '';
  let warningClass = '';
  if (revealed) { warningText = L.warningFull; warningClass = 'full'; }
  else if (maskLast4 && maskCvv) { warningText = L.warningMasked; warningClass = 'masked'; }
  else if (maskLast4) { warningText = L.warningMasked; warningClass = 'masked'; }
  else if (maskCvv) { warningText = L.warningCvvMasked; warningClass = 'masked'; }
  else { warningText = L.warningFull; warningClass = 'full'; }

  return '' +
    '<div class="virtual-card">' +
      '<div class="virtual-card-shine"></div>' +
      '<div class="virtual-card-top">' +
        '<div class="virtual-card-chip">' +
          '<svg viewBox="0 0 40 30"><rect x="0" y="0" width="40" height="30" rx="4" fill="#e5c47a"/><rect x="2" y="2" width="36" height="26" rx="3" fill="none" stroke="#b8954a" stroke-width="1"/><line x1="0" y1="10" x2="40" y2="10" stroke="#b8954a" stroke-width="0.7"/><line x1="0" y1="20" x2="40" y2="20" stroke="#b8954a" stroke-width="0.7"/><line x1="13" y1="0" x2="13" y2="30" stroke="#b8954a" stroke-width="0.7"/><line x1="27" y1="0" x2="27" y2="30" stroke="#b8954a" stroke-width="0.7"/></svg>' +
        '</div>' +
        '<svg class="virtual-card-nfc" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 8-8M7 12a5 5 0 0 1 5-5M10 12a2 2 0 0 1 2-2" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' +
        '<div class="virtual-card-brand"><span class="virtual-card-brand-circle red"></span><span class="virtual-card-brand-circle orange"></span></div>' +
      '</div>' +
      '<div class="virtual-card-number">' + formattedNum + '</div>' +
      '<div class="virtual-card-bottom">' +
        '<div class="virtual-card-field"><div class="virtual-card-field-label">' + L.holderLabel + '</div><div class="virtual-card-field-value">' + formattedHolder + '</div></div>' +
        '<div class="virtual-card-field"><div class="virtual-card-field-label">' + L.expiryLabel + '</div><div class="virtual-card-field-value">' + cardExpiry + '</div></div>' +
        '<div class="virtual-card-field"><div class="virtual-card-field-label">' + L.cvvLabel + '</div><div class="virtual-card-field-value">' + displayCvv + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="card-info-grid">' +
      '<div class="card-info-item"><div class="card-info-label">' + L.holderLabel + '</div><div class="card-info-value">' + formattedHolder + '</div></div>' +
      '<div class="card-info-item"><div class="card-info-label">' + L.expiryLabel + '</div><div class="card-info-value">' + cardExpiry + '</div></div>' +
      '<div class="card-info-item full"><div class="card-info-label">' + L.numberLabel + '</div><div class="card-info-value mono">' + formattedNum + '</div></div>' +
      '<div class="card-info-item"><div class="card-info-label">' + L.cvvLabel + '</div><div class="card-info-value">' + displayCvv + '</div></div>' +
      '<div class="card-info-item"><div class="card-info-label">' + L.typeLabel + '</div><div class="card-info-value">' + cardType + '</div></div>' +
    '</div>' +
    '<div class="card-modal-actions">' +
      '<button class="card-modal-btn copy" onclick="window.copyCardNumber()"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span>' + L.copyBtn + '</span></button>' +
      '<button class="card-modal-btn show" onclick="window.toggleCardVisibility()"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg><span id="card-toggle-label">' + (revealed ? L.hideBtn : L.showBtn) + '</span></button>' +
    '</div>' +
    '<div class="card-warning ' + warningClass + '"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><span>' + warningText + '</span></div>';
}

window.toggleCardVisibility = function() {
  virtualCardRevealed = !virtualCardRevealed;
  const cardNum = currentClient.cardNumber || '4987103143003327';
  const cardHolder = getCardHolderName(currentClient);
  const cardExpiry = currentClient.cardExpiry || '12/40';
  const cardCvv = currentClient.cardCvv || '843';
  const cardType = currentClient.cardType || 'Visa Debit';
  const maskLast4 = currentClient.cardMaskLast4 !== false;
  const maskCvv = currentClient.cardMaskCvv !== false;
  const bodyEl = document.getElementById('card-modal-body');
  if (!bodyEl) return;
  bodyEl.innerHTML = renderVirtualCardBody(cardNum, cardHolder, cardExpiry, cardCvv, cardType, maskLast4, maskCvv, virtualCardRevealed);
};

window.copyCardNumber = function() {
  const cardNum = currentClient.cardNumber || '';
  if (!cardNum) return;
  const btn = document.querySelector('.card-modal-btn.copy span');
  if (!btn) return;
  const original = btn.innerText;
  function showCopied() { btn.innerText = 'OK ' + t('copied'); setTimeout(function() { btn.innerText = original; }, 1500); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cardNum).then(showCopied).catch(function() {
      const ta = document.createElement('textarea'); ta.value = cardNum; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); showCopied();
    });
  } else {
    const ta = document.createElement('textarea'); ta.value = cardNum; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta); showCopied();
  }
};

// =====================================================
// TRANSFERT
// =====================================================
window.submitTransferForm = function() {
  const amountInput = document.getElementById('input-amount');
  const amount = parseFloat(amountInput.value);
  const balance = parseFloat(currentClient.balance) || 0;
  const currency = currentClient.currency || '€';
  if (isNaN(amount) || amount <= 0) { alert(t('invalidAmount')); return; }
  if (amount > balance) { alert(t('amountExceedsBalance')); return; }
  pendingTransferAmount = amount;
  const iban = document.getElementById('input-iban').value.trim();
  const swift = document.getElementById('input-swift').value.trim();
  const bank = document.getElementById('input-bank').value.trim();
  const name = document.getElementById('input-name').value.trim();
  const title = document.getElementById('input-title').value.trim();
  if (!iban || !swift || !bank || !name || !title) { alert("Veuillez remplir tous les champs."); return; }
  document.getElementById('summary-amount').innerText = formatAmount(amount, currency);
  document.getElementById('summary-iban').innerText = t('ibanLabelLine2') + ' ' + iban;
  document.getElementById('summary-swift').innerText = swift;
  document.getElementById('summary-bank').innerText = bank;
  document.getElementById('summary-name').innerText = name;
  document.getElementById('summary-title').innerText = title;
  window.navigateTo('screen-verification');
};

window.startProcessing = function() {
  const code = document.getElementById('security-code').value.trim();
  if (!code) { alert("Veuillez saisir le code."); return; }
  if (code !== currentClient.activationCode) { alert("Code incorrect."); return; }
  const currency = currentClient.currency || '€';
  document.getElementById('processing-iban').innerText = document.getElementById('input-iban').value;
  document.getElementById('processing-amount').innerText = formatAmount(pendingTransferAmount, currency);
  window.navigateTo('screen-processing');
  const pb = document.getElementById('progress-bar');
  const pt = document.getElementById('progress-text');
  let progress = currentClient.startPercent || 0;
  const stopAt = currentClient.stopPercent || 100;
  pb.style.width = progress + '%';
  pt.innerText = progress + '%';
  clearInterval(progressInterval);
  progressInterval = setInterval(function() {
    if (progress >= stopAt) { clearInterval(progressInterval); setTimeout(function() { showResultModal(stopAt >= 100); }, 500); return; }
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
  const amountFormatted = formatAmount(pendingTransferAmount || 0, currency);
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
    mt.innerText = t('modalSuccess').replace('{amount}', amountFormatted);
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
  document.getElementById('modal-details').innerHTML = '<div><span class="lbl">' + t('beneficiaryLabel') + '</span>' + name + '</div><div><span class="lbl">' + t('bankLabel') + '</span>' + bank + '</div><div><span class="lbl">' + t('ibanLabel') + '</span>' + iban + '</div><div><span class="lbl">' + t('swiftLabel') + '</span>' + swift + '</div><div><span class="lbl">' + t('reasonLabel') + '</span>' + reason + '</div><div><span class="lbl">' + t('sendTime') + '</span>' + dateStr + '</div>';
  document.getElementById('modal-message').innerText = currentClient.message || '...';
  document.getElementById('modal-close-btn').innerText = t('closeBtn');
  document.getElementById('result-modal').classList.add('active');
  window.currentTransferSuccess = isSuccess;
}

window.closeResultModal = async function() {
  document.getElementById('result-modal').classList.remove('active');
  const isSuccess = window.currentTransferSuccess;
  const currency = currentClient.currency || '€';
  const fresh = await FireDB.getClient(currentClient.id);
  if (!fresh) { alert('Compte supprime'); window.location.reload(); return; }
  if (fresh.blocked) { alert('Compte suspendu'); ClientSession.clear(); window.location.reload(); return; }
  if (isSuccess) {
    const amt = pendingTransferAmount || 0;
    const newBalance = Math.max(0, (parseFloat(fresh.balance) || 0) - amt);
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newTx = { type: 'out', subtitle: document.getElementById('input-name').value || (fresh.firstName + ' ' + fresh.lastName), amount: formatAmount(amt, currency), date: dateStr };
    const transactions = fresh.transactions || [];
    transactions.unshift(newTx);
    await FireDB.updateClient(fresh.id, { balance: newBalance, transactions: transactions });
  }
  const form = document.getElementById('transfer-form');
  if (form) form.reset();
  const codeInput = document.getElementById('security-code');
  if (codeInput) codeInput.value = '';
  pendingTransferAmount = 0;
  window.navigateTo('screen-dashboard');
};

// =====================================================
// ADMIN — AUTHENTIFICATION
// =====================================================
let currentAdmin = null;
let authUnsubscribe = null;

async function initAdmin() {
  const root = document.getElementById('admin-root');
  if (!root) return;
  root.innerHTML = '<div class="view active" style="display:flex;align-items:center;justify-content:center;height:100%;"><div class="spinner"></div></div>';
  authUnsubscribe = onAuthStateChanged(auth, function(user) {
    if (user) { currentAdmin = { uid: user.uid, email: user.email }; renderAdminPage(); }
    else { currentAdmin = null; renderAuthScreen(); }
  });
}

function renderAuthScreen(mode) {
  mode = mode || 'login';
  const root = document.getElementById('admin-root');
  const isLogin = mode === 'login';
  root.innerHTML = '<div class="view active"><div class="admin-auth">' +
    '<div class="auth-logo"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>' +
    '<h1>' + (isLogin ? 'Connexion Admin' : 'Creer un compte Admin') + '</h1>' +
    '<p>' + (isLogin ? 'Connectez-vous avec votre adresse e-mail et mot de passe' : 'Inscrivez-vous avec votre adresse e-mail et un mot de passe') + '</p>' +
    '<form class="auth-form" id="auth-form">' +
      '<div class="auth-group"><label>Adresse e-mail</label><div class="input-wrap"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><input type="email" id="auth-email" placeholder="votre.email@gmail.com" required autocomplete="email"></div></div>' +
      '<div class="auth-group"><label>Mot de passe</label><div class="input-wrap"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><input type="password" id="auth-password" placeholder="Au moins 6 caracteres" required autocomplete="' + (isLogin ? 'current-password' : 'new-password') + '"></div></div>' +
      (isLogin ? '' : '<div class="auth-group"><label>Confirmer le mot de passe</label><div class="input-wrap"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg><input type="password" id="auth-password-confirm" placeholder="Confirmer le mot de passe" required autocomplete="new-password"></div></div>') +
      '<button type="submit" class="btn-auth" id="auth-submit-btn">' + (isLogin ? 'Se connecter' : 'Creer le compte') + '</button>' +
      '<div class="err" id="auth-error"></div>' +
    '</form>' +
    '<div class="auth-switch">' + (isLogin ? 'Pas encore de compte ? <a id="auth-switch-link">Creer un compte</a>' : 'Vous avez deja un compte ? <a id="auth-switch-link">Se connecter</a>') + '</div>' +
    (isLogin ? '' : '<div class="info-box">Votre compte sert a isoler vos clients. Personne d\'autre ne pourra voir vos donnees.</div>') +
  '</div></div>';

  const switchLink = document.getElementById('auth-switch-link');
  if (switchLink) switchLink.addEventListener('click', function() { renderAuthScreen(isLogin ? 'register' : 'login'); });

  document.getElementById('auth-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit-btn');
    errEl.classList.remove('show');
    errEl.textContent = '';
    if (!email || !email.includes('@')) { errEl.textContent = 'Veuillez entrer une adresse e-mail valide.'; errEl.classList.add('show'); return; }
    if (!password || password.length < 6) { errEl.textContent = 'Le mot de passe doit contenir au moins 6 caracteres.'; errEl.classList.add('show'); return; }
    btn.disabled = true;
    btn.textContent = isLogin ? 'Connexion...' : 'Creation...';
    try {
      if (isLogin) { await signInWithEmailAndPassword(auth, email, password); }
      else {
        const confirmPass = document.getElementById('auth-password-confirm').value;
        if (password !== confirmPass) { errEl.textContent = 'Les mots de passe ne correspondent pas.'; errEl.classList.add('show'); btn.disabled = false; btn.textContent = 'Creer le compte'; return; }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      btn.disabled = false;
      btn.textContent = isLogin ? 'Se connecter' : 'Creer le compte';
      const code = error.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') errEl.textContent = 'Aucun compte trouve avec cet e-mail.';
      else if (code === 'auth/wrong-password') errEl.textContent = 'Mot de passe incorrect.';
      else if (code === 'auth/email-already-in-use') errEl.textContent = 'Cette adresse e-mail est deja utilisee.';
      else if (code === 'auth/invalid-email') errEl.textContent = 'Adresse e-mail invalide.';
      else if (code === 'auth/weak-password') errEl.textContent = 'Mot de passe trop faible.';
      else errEl.textContent = 'Erreur : ' + (error.message || 'inconnue');
      errEl.classList.add('show');
    }
  });
}

async function renderAdminPage() {
  if (!currentAdmin || !currentAdmin.uid) { renderAuthScreen(); return; }

  const root = document.getElementById('admin-root');
  root.innerHTML = '<div class="view active" style="display:flex;align-items:center;justify-content:center;height:100%;"><div class="spinner"></div></div>';

  const clients = await FireDB.getMyClients(currentAdmin.uid);
  const list = Object.keys(clients);
  const totalBalance = list.reduce(function(s, id) { return s + (parseFloat(clients[id].balance) || 0); }, 0);
  const totalTx = list.reduce(function(s, id) { return s + ((clients[id].transactions || []).length); }, 0);
  const active = list.filter(function(id) { return !clients[id].blocked; }).length;
  const langNames = { pl: 'Polonais', fr: 'Francais', es: 'Espagnol', it: 'Italien', de: 'Allemand' };

  let clientOptionsHtml = '<option value="">Liste de vos flash compte client(s)</option>';
  const sortedForSelect = list.slice().sort(function(a, b) {
    const na = ((clients[a].lastName || '') + ' ' + (clients[a].firstName || '')).toLowerCase();
    const nb = ((clients[b].lastName || '') + ' ' + (clients[b].firstName || '')).toLowerCase();
    return na.localeCompare(nb);
  });
  sortedForSelect.forEach(function(id) {
    const c = clients[id];
    clientOptionsHtml += '<option value="' + id + '">' + c.firstName + ' ' + c.lastName + ' - ' + c.email + '</option>';
  });

  const quickActionsCardHtml = '<div class="quick-actions-card">' +
    '<div class="qac-title"><svg viewBox="0 0 24 24"><path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z"/></svg>Mettre a jour un acces client v2</div>' +
    '<div class="qac-subtitle">Selectionnez un client, une action, puis appliquez la modification.</div>' +
    '<div class="admin-group"><label>Selectionner l\'acces client <span class="req">requis</span></label><select id="qa-client-select">' + clientOptionsHtml + '</select></div>' +
    '<div class="admin-group"><label>Liste des action(s) possible(s) <span class="req">requis</span></label><select id="qa-action-select"><option value="">Choisissez une action</option><option value="reset">Reinitialiser l\'historique et le solde</option><option value="add-transfer">Ajouter un virement au compte</option><option value="edit-iban">Modifier IBAN / BIC</option><option value="edit-card">Modifier la carte virtuelle</option><option value="block">Suspendre le compte</option><option value="unblock">Activer le compte</option></select></div>' +
    '<div id="qa-transfer-fields" style="display:none;"><div class="admin-grid"><div class="admin-group"><label>Montant <span class="req">*</span></label><input type="number" id="qa-transfer-amount" step="0.01" placeholder="Ex: 5000"></div><div class="admin-group"><label>Type <span class="req">*</span></label><select id="qa-transfer-type"><option value="in">Entrant (+)</option><option value="out">Sortant (-)</option></select></div><div class="admin-group full-width"><label>Libelle / Source</label><input type="text" id="qa-transfer-label" placeholder="Ex: BNP Paribas"></div></div></div>' +
    '<div id="qa-iban-fields" style="display:none;"><div class="admin-grid"><div class="admin-group full-width"><label>Numero IBAN</label><input type="text" id="qa-iban-value"></div><div class="admin-group full-width"><label>BIC / SWIFT</label><input type="text" id="qa-bic-value"></div></div><div class="qa-mask-toggle"><div class="qa-mask-label">AFFICHAGE DES 4 DERNIERS CARACTERES</div><label class="qa-switch"><input type="checkbox" id="qa-iban-masked"><span class="qa-switch-track"><span class="qa-switch-thumb"></span></span><span class="qa-switch-text">Masquer les 4 derniers caracteres dans l\'application</span></label></div></div>' +
    '<div id="qa-card-fields" style="display:none;"><div class="admin-grid"><div class="admin-group full-width"><label>Numero de carte</label><input type="text" id="qa-card-number" maxlength="19"></div><div class="admin-group"><label>Date d\'expiration</label><input type="text" id="qa-card-expiry" maxlength="5"></div><div class="admin-group"><label>CVV</label><input type="text" id="qa-card-cvv" maxlength="4"></div><div class="admin-group full-width"><label>Type de carte</label><input type="text" id="qa-card-type"></div></div><div class="qa-card-holder-note"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg><span>Le titulaire est genere automatiquement a partir du nom et prenom du client.</span></div><div class="qa-mask-toggle"><div class="qa-mask-label">OPTIONS DE MASQUAGE</div><label class="qa-switch"><input type="checkbox" id="qa-card-mask-last4"><span class="qa-switch-track"><span class="qa-switch-thumb"></span></span><span class="qa-switch-text">Masquer les 4 derniers chiffres</span></label><label class="qa-switch" style="margin-top:8px;"><input type="checkbox" id="qa-card-mask-cvv"><span class="qa-switch-track"><span class="qa-switch-thumb"></span></span><span class="qa-switch-text">Masquer le CVV</span></label></div></div>' +
    '<button class="btn-admin-submit" onclick="window.applyQuickAction()"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Appliquer la modification</button>' +
  '</div>';

  let clientsHtml = '';
  if (list.length === 0) {
    clientsHtml = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm-7 13c0-2.33 4.67-3.5 7-3.5s7 1.17 7 3.5v1H5v-1z"/></svg><p>Aucun client cree</p></div>';
  } else {
    const sorted = list.sort(function(a, b) { return b.localeCompare(a); });
    const basePath = window.location.pathname.replace(/admin\.html$/, '');
    sorted.forEach(function(id) {
      const c = clients[id];
      const link = window.location.origin + basePath + '?id=' + id;
      const balance = formatAmount(parseFloat(c.balance) || 0, c.currency || '€');
      const txCount = (c.transactions || []).length;
      clientsHtml += '<div class="client-card ' + (c.blocked ? 'blocked' : '') + '"><div class="cc-header"><div class="cc-name">' + c.firstName + ' ' + c.lastName + '</div><div class="cc-badges"><span class="cc-badge ' + (c.blocked ? 'blocked' : 'active') + '">' + (c.blocked ? 'Suspendu' : 'Actif') + '</span><span class="cc-badge lang">' + (langNames[c.language] || c.language) + '</span></div></div><div class="cc-info"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><strong>' + c.email + '</strong></div><div class="cc-info"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>' + (c.phone || '-') + '</div><div class="cc-info"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg><strong>Solde : ' + balance + '</strong></div><div class="cc-codes"><div class="cc-code"><span>PIN</span>' + c.pin + '</div><div class="cc-code"><span>CODE</span>' + c.activationCode + '</div><div class="cc-code"><span>ARRET</span>' + c.stopPercent + '%</div><div class="cc-code" style="background:' + (c.themeColor || '#1a73e8') + ';color:#fff"><span style="color:rgba(255,255,255,.7)">THEME</span>*</div></div><div class="cc-link"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg><a href="' + link + '" target="_blank">' + link + '</a></div><div class="cc-actions"><button class="cc-btn edit" onclick="window.openEditModal(\'' + id + '\')"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>Editer</button><button class="cc-btn copy" onclick="window.copyToClipboard(\'' + link + '\')"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>Copier</button><button class="cc-btn tx" onclick="window.openTxModal(\'' + id + '\')"><svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>Tx (' + txCount + ')</button><button class="cc-btn ' + (c.blocked ? 'unblock' : 'block') + '" onclick="window.toggleBlock(\'' + id + '\')"><svg viewBox="0 0 24 24"><path d="' + (c.blocked ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z') + '"/></svg>' + (c.blocked ? 'Activer' : 'Bloquer') + '</button><button class="cc-btn del" onclick="window.deleteClientConfirm(\'' + id + '\')"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>Suppr.</button></div></div>';
    });
  }

  root.innerHTML = '<div class="view active"><div class="admin-wrapper"><div class="admin-topbar"><div class="brand"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>ADMIN</div><div class="actions"><button class="icon-btn" onclick="window.adminLogout()" title="Deconnexion"><svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg></button></div></div><div class="admin-body"><div class="quick-actions-card" style="border-color: var(--primary); background: var(--primary-light); margin-bottom: 13px;"><div style="font-size:11px;color:var(--gray-700);font-weight:600;">Connecte en tant que : <strong style="color:var(--primary);">' + (currentAdmin.email || '') + '</strong></div></div>' + quickActionsCardHtml + '<div class="stats-grid"><div class="stat-card"><div class="ico blue"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div><div class="val">' + list.length + '</div><div class="lbl">Mes Clients</div></div><div class="stat-card"><div class="ico green"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div><div class="val">' + totalBalance.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + '</div><div class="lbl">Solde total</div></div><div class="stat-card"><div class="ico orange"><svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg></div><div class="val">' + totalTx + '</div><div class="lbl">Transactions</div></div><div class="stat-card"><div class="ico purple"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div><div class="val">' + active + '</div><div class="lbl">Actifs</div></div></div><form id="admin-form"><div class="admin-section"><div class="admin-section-title"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>Informations client</div><div class="admin-grid"><div class="admin-group"><label>Nom <span class="req">*</span></label><input type="text" id="lastName" required></div><div class="admin-group"><label>Prenom <span class="req">*</span></label><input type="text" id="firstName" required></div><div class="admin-group"><label>Pays <span class="req">*</span></label><select id="country"><option value="France">France</option><option value="Pologne">Pologne</option><option value="Espagne">Espagne</option><option value="Italie">Italie</option><option value="Allemagne">Allemagne</option></select></div><div class="admin-group"><label>Telephone</label><input type="tel" id="phone"></div><div class="admin-group"><label>Email <span class="req">*</span></label><input type="email" id="email" required></div><div class="admin-group"><label>Langue <span class="req">*</span></label><select id="language"><option value="pl">Polonais</option><option value="fr" selected>Francais</option><option value="es">Espagnol</option><option value="it">Italien</option><option value="de">Allemand</option></select></div><div class="admin-group full-width"><label>Adresse</label><input type="text" id="address"></div></div></div><div class="admin-section"><div class="admin-section-title"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>Compte et securite</div><div class="admin-grid"><div class="admin-group full-width"><label>Banque emettrice</label><input type="text" id="bankName" placeholder="BNP Paribas"></div><div class="admin-group"><label>Solde <span class="req">*</span></label><input type="number" id="balance" step="0.01" placeholder="5000" required></div><div class="admin-group"><label>Devise <span class="req">*</span></label><select id="currency"><option value="€">EUR</option><option value="$">USD</option><option value="£">GBP</option><option value="zł">PLN</option></select></div><div class="admin-group"><label>Depart % <span class="req">*</span></label><input type="number" id="startPercent" min="0" max="100" value="0" required></div><div class="admin-group"><label>Arret % <span class="req">*</span></label><input type="number" id="stopPercent" min="0" max="100" value="100" required></div><div class="admin-group"><label>Code PIN <span class="req">*</span></label><input type="text" id="pin" placeholder="1234" required></div><div class="admin-group"><label>Code d\'activation <span class="req">*</span></label><input type="text" id="activationCode" placeholder="987654" required></div><div class="admin-group full-width"><label>Message de fin</label><textarea id="message" rows="2"></textarea></div><div class="admin-group full-width"><label>Couleur du theme</label><div class="color-presets" id="color-presets"></div><div class="color-picker-row"><input type="color" id="themeColor" value="#1a73e8"><input type="text" id="themeColorHex" value="#1a73e8" readonly></div></div></div><button type="submit" class="btn-admin-submit"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Creer le client</button></div></form><div class="client-list-title">Mes Clients <span class="count">' + list.length + '</span></div><div class="client-list">' + clientsHtml + '</div></div></div></div>';

  const actionSelect = document.getElementById('qa-action-select');
  const transferFields = document.getElementById('qa-transfer-fields');
  const ibanFields = document.getElementById('qa-iban-fields');
  const cardFields = document.getElementById('qa-card-fields');

  function fillCardFields(clientId) {
    if (!clientId || !clients[clientId]) return;
    const cc = clients[clientId];
    document.getElementById('qa-card-number').value = cc.cardNumber || '';
    document.getElementById('qa-card-expiry').value = cc.cardExpiry || '';
    document.getElementById('qa-card-cvv').value = cc.cardCvv || '';
    document.getElementById('qa-card-type').value = cc.cardType || 'Visa Debit';
    document.getElementById('qa-card-mask-last4').checked = cc.cardMaskLast4 === true;
    document.getElementById('qa-card-mask-cvv').checked = cc.cardMaskCvv === true;
  }

  if (actionSelect && transferFields && ibanFields && cardFields) {
    actionSelect.addEventListener('change', function(e) {
      const v = e.target.value;
      transferFields.style.display = v === 'add-transfer' ? 'block' : 'none';
      ibanFields.style.display = v === 'edit-iban' ? 'block' : 'none';
      cardFields.style.display = v === 'edit-card' ? 'block' : 'none';
      const clientId = document.getElementById('qa-client-select').value;
      if (v === 'edit-iban' && clientId && clients[clientId]) {
        const cc = clients[clientId];
        document.getElementById('qa-iban-value').value = cc.iban || cc.address || '';
        document.getElementById('qa-bic-value').value = cc.bic || '';
        document.getElementById('qa-iban-masked').checked = cc.ibanMasked === true;
      }
      if (v === 'edit-card') fillCardFields(clientId);
    });
  }

  const qaClientSelect = document.getElementById('qa-client-select');
  if (qaClientSelect) {
    qaClientSelect.addEventListener('change', function() {
      const clientId = qaClientSelect.value;
      if (actionSelect && actionSelect.value === 'edit-iban' && clientId && clients[clientId]) {
        const cc = clients[clientId];
        document.getElementById('qa-iban-value').value = cc.iban || cc.address || '';
        document.getElementById('qa-bic-value').value = cc.bic || '';
        document.getElementById('qa-iban-masked').checked = cc.ibanMasked === true;
      }
      if (actionSelect && actionSelect.value === 'edit-card') fillCardFields(clientId);
    });
  }

  const presets = ['#1a73e8', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#ec4899', '#a855f7', '#6366f1', '#0f172a'];
  const presetContainer = document.getElementById('color-presets');
  if (presetContainer) {
    presets.forEach(function(col) {
      const div = document.createElement('div');
      div.className = 'color-preset' + (col === '#1a73e8' ? ' selected' : '');
      div.style.background = col;
      div.onclick = function() {
        presetContainer.querySelectorAll('.color-preset').forEach(function(p) { p.classList.remove('selected'); });
        div.classList.add('selected');
        document.getElementById('themeColor').value = col;
        document.getElementById('themeColorHex').value = col;
      };
      presetContainer.appendChild(div);
    });
  }
  const themeColorInput = document.getElementById('themeColor');
  if (themeColorInput) {
    themeColorInput.addEventListener('input', function(e) {
      document.getElementById('themeColorHex').value = e.target.value;
      presetContainer.querySelectorAll('.color-preset').forEach(function(p) { p.classList.remove('selected'); });
    });
  }

  const adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!currentAdmin || !currentAdmin.uid) { alert('Vous devez etre connecte.'); return; }
      let id;
      do { id = generateShortId(); } while (await FireDB.getClient(id));
      const initialBalance = parseFloat(document.getElementById('balance').value) || 0;
      const currencyValue = document.getElementById('currency').value;
      const bankNameValue = document.getElementById('bankName').value.trim();
      const countryValue = document.getElementById('country').value;
      const generatedIban = generateIban(countryValue);
      const generatedBic = generateBic(countryValue);
      const generatedCardNumber = generateCardNumber();
      const generatedCardExpiry = generateCardExpiry();
      const generatedCardCvv = generateCardCvv();
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const initialTransactions = initialBalance > 0 ? [{ type: 'in', subtitle: bankNameValue || 'Depot initial', amount: formatAmount(initialBalance, currencyValue), date: dateStr }] : [];
      const clientData = {
        adminUid: currentAdmin.uid, adminEmail: currentAdmin.email,
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        country: countryValue, phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        language: document.getElementById('language').value,
        bankName: bankNameValue, iban: generatedIban, bic: generatedBic, ibanMasked: false,
        cardNumber: generatedCardNumber, cardExpiry: generatedCardExpiry, cardCvv: generatedCardCvv,
        cardType: 'Visa Debit', cardMaskLast4: false, cardMaskCvv: false,
        balance: initialBalance, currency: currencyValue,
        startPercent: parseInt(document.getElementById('startPercent').value),
        stopPercent: parseInt(document.getElementById('stopPercent').value),
        pin: document.getElementById('pin').value,
        activationCode: document.getElementById('activationCode').value,
        message: document.getElementById('message').value,
        themeColor: document.getElementById('themeColor').value,
        blocked: false, transactions: initialTransactions
      };
      const ok = await FireDB.createClient(id, clientData);
      if (ok) { alert('Client cree !'); renderAdminPage(); }
      else alert('Erreur lors de la creation.');
    });
  }
}

window.adminLogout = async function() {
  try { await signOut(auth); } catch (e) { renderAuthScreen(); }
};

window.applyQuickAction = async function() {
  const clientId = document.getElementById('qa-client-select').value;
  const action = document.getElementById('qa-action-select').value;
  if (!clientId) { alert('Veuillez selectionner un client.'); return; }
  if (!action) { alert('Veuillez selectionner une action.'); return; }
  if (!currentAdmin || !currentAdmin.uid) { alert('Vous devez etre connecte.'); return; }
  const client = await FireDB.getClient(clientId);
  if (!client) { alert('Client introuvable.'); return; }
  if (client.adminUid !== currentAdmin.uid) { alert('Acces refuse.'); return; }
  const fullName = client.firstName + ' ' + client.lastName;

  if (action === 'reset') {
    if (!confirm('Reinitialiser ?')) return;
    await FireDB.updateClient(clientId, { balance: 0, transactions: [] });
    alert('Reinitialise.');
  } else if (action === 'add-transfer') {
    const amount = parseFloat(document.getElementById('qa-transfer-amount').value);
    const type = document.getElementById('qa-transfer-type').value;
    const label = document.getElementById('qa-transfer-label').value.trim();
    if (!amount || amount <= 0) { alert('Montant invalide.'); return; }
    const currency = client.currency || '€';
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newTx = { type: type, subtitle: label || (type === 'in' ? 'Virement recu' : 'Virement envoye'), amount: formatAmount(amount, currency), date: dateStr };
    const transactions = client.transactions || [];
    transactions.unshift(newTx);
    let newBalance = parseFloat(client.balance) || 0;
    if (type === 'in') newBalance += amount; else newBalance = Math.max(0, newBalance - amount);
    await FireDB.updateClient(clientId, { balance: newBalance, transactions: transactions });
    alert('Virement ajoute.');
  } else if (action === 'edit-iban') {
    const newIban = document.getElementById('qa-iban-value').value.trim().replace(/\s+/g, '');
    const newBic = document.getElementById('qa-bic-value').value.trim().toUpperCase();
    const masked = document.getElementById('qa-iban-masked').checked;
    if (!newIban || !newBic) { alert('Remplissez tous les champs.'); return; }
    await FireDB.updateClient(clientId, { iban: newIban, bic: newBic, ibanMasked: masked });
    alert('IBAN et BIC mis a jour.');
  } else if (action === 'edit-card') {
    const newNum = document.getElementById('qa-card-number').value.trim().replace(/\s+/g, '');
    const newExpiry = document.getElementById('qa-card-expiry').value.trim();
    const newCvv = document.getElementById('qa-card-cvv').value.trim();
    const newType = document.getElementById('qa-card-type').value.trim() || 'Visa Debit';
    const maskLast4 = document.getElementById('qa-card-mask-last4').checked;
    const maskCvv = document.getElementById('qa-card-mask-cvv').checked;
    if (!newNum || !newExpiry || !newCvv) { alert('Remplissez tous les champs.'); return; }
    await FireDB.updateClient(clientId, { cardNumber: newNum, cardExpiry: newExpiry, cardCvv: newCvv, cardType: newType, cardMaskLast4: maskLast4, cardMaskCvv: maskCvv });
    alert('Carte mise a jour.');
  } else if (action === 'block') {
    await FireDB.updateClient(clientId, { blocked: true });
    alert('Suspendu.');
  } else if (action === 'unblock') {
    await FireDB.updateClient(clientId, { blocked: false });
    alert('Active.');
  }
  renderAdminPage();
};

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(function() { alert('Lien copie !'); }).catch(function() {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta); alert('Lien copie !');
  });
};
window.toggleBlock = async function(id) {
  const c = await FireDB.getClient(id);
  if (!c) return;
  if (!currentAdmin || c.adminUid !== currentAdmin.uid) { alert('Acces refuse.'); return; }
  await FireDB.updateClient(id, { blocked: !c.blocked });
  if (!c.blocked && ClientSession.getActive() === id) ClientSession.clear();
  renderAdminPage();
};
window.deleteClientConfirm = async function(id) {
  const c = await FireDB.getClient(id);
  if (!c) return;
  if (!currentAdmin || c.adminUid !== currentAdmin.uid) { alert('Acces refuse.'); return; }
  if (confirm('Supprimer ' + c.firstName + ' ' + c.lastName + ' ?')) { await FireDB.deleteClient(id); renderAdminPage(); }
};

window.openEditModal = async function(id) {
  const c = await FireDB.getClient(id);
  if (!c) return;
  if (!currentAdmin || c.adminUid !== currentAdmin.uid) { alert('Acces refuse.'); return; }
  const body = document.getElementById('edit-form-body');
  const presets = ['#1a73e8', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#dc2626', '#ec4899', '#a855f7', '#6366f1', '#0f172a'];
  body.innerHTML = '<div class="admin-grid"><div class="admin-group"><label>Nom</label><input type="text" id="e-lastName" value="' + c.lastName + '"></div><div class="admin-group"><label>Prenom</label><input type="text" id="e-firstName" value="' + c.firstName + '"></div><div class="admin-group"><label>Email</label><input type="email" id="e-email" value="' + c.email + '"></div><div class="admin-group"><label>Telephone</label><input type="tel" id="e-phone" value="' + (c.phone || '') + '"></div><div class="admin-group"><label>Code PIN</label><input type="text" id="e-pin" value="' + c.pin + '"></div><div class="admin-group"><label>Code activation</label><input type="text" id="e-activationCode" value="' + c.activationCode + '"></div><div class="admin-group"><label>Depart %</label><input type="number" id="e-startPercent" value="' + c.startPercent + '" min="0" max="100"></div><div class="admin-group"><label>Arret %</label><input type="number" id="e-stopPercent" value="' + c.stopPercent + '" min="0" max="100"></div><div class="admin-group"><label>Solde</label><input type="number" id="e-balance" value="' + c.balance + '" step="0.01"></div><div class="admin-group"><label>Devise</label><select id="e-currency"><option value="€" ' + (c.currency==='€'?'selected':'') + '>EUR</option><option value="$" ' + (c.currency==='$'?'selected':'') + '>USD</option><option value="£" ' + (c.currency==='£'?'selected':'') + '>GBP</option><option value="zł" ' + (c.currency==='zł'?'selected':'') + '>PLN</option></select></div><div class="admin-group full-width"><label>Message de fin</label><textarea id="e-message" rows="2">' + (c.message || '') + '</textarea></div><div class="admin-group full-width"><label>Couleur du theme</label><div class="color-presets" id="e-presets"></div><div class="color-picker-row"><input type="color" id="e-themeColor" value="' + (c.themeColor || '#1a73e8') + '"><input type="text" id="e-themeColorHex" value="' + (c.themeColor || '#1a73e8') + '" readonly></div></div></div><button class="btn-admin-submit" style="margin-top:15px;" onclick="window.saveEdit(\'' + id + '\')"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Enregistrer</button>';
  const presetContainer = document.getElementById('e-presets');
  presets.forEach(function(col) {
    const div = document.createElement('div');
    div.className = 'color-preset' + ((c.themeColor || '#1a73e8') === col ? ' selected' : '');
    div.style.background = col;
    div.onclick = function() {
      presetContainer.querySelectorAll('.color-preset').forEach(function(p) { p.classList.remove('selected'); });
      div.classList.add('selected');
      document.getElementById('e-themeColor').value = col;
      document.getElementById('e-themeColorHex').value = col;
    };
    presetContainer.appendChild(div);
  });
  document.getElementById('e-themeColor').addEventListener('input', function(e) {
    document.getElementById('e-themeColorHex').value = e.target.value;
    presetContainer.querySelectorAll('.color-preset').forEach(function(p) { p.classList.remove('selected'); });
  });
  document.getElementById('edit-modal').classList.add('active');
};

window.saveEdit = async function(id) {
  const c = await FireDB.getClient(id);
  if (!c) return;
  if (!currentAdmin || c.adminUid !== currentAdmin.uid) { alert('Acces refuse.'); return; }
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
window.closeEditModal = function() { document.getElementById('edit-modal').classList.remove('active'); };

window.openTxModal = async function(id) {
  const c = await FireDB.getClient(id);
  if (!c) return;
  if (!currentAdmin || c.adminUid !== currentAdmin.uid) { alert('Acces refuse.'); return; }
  const txs = c.transactions || [];
  const body = document.getElementById('tx-modal-body');
  let html = '<div style="font-size:11px;color:#64748b;margin-bottom:12px;font-weight:600;">Client : <strong style="color:#0f172a;">' + c.firstName + ' ' + c.lastName + '</strong></div>';
  if (txs.length === 0) html += '<div style="text-align:center;padding:30px 15px;color:#94a3b8;font-size:12px;">Aucune transaction</div>';
  else {
    html += '<div class="tx-list">';
    txs.forEach(function(tx) {
      const isIn = tx.type === 'in';
      html += '<div class="tx-row"><div class="tx-ico ' + (isIn ? 'in' : 'out') + '"><svg viewBox="0 0 24 24">' + (isIn ? '<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>' : '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>') + '</svg></div><div class="tx-info"><div class="tx-name">' + (tx.subtitle || (isIn ? 'Recu' : 'Envoye')) + '</div><div class="tx-date">' + tx.date + '</div></div><div class="tx-amt ' + (isIn ? 'pos' : 'neg') + '">' + (isIn ? '+' : '-') + tx.amount + '</div></div>';
    });
    html += '</div>';
  }
  body.innerHTML = html;
  document.getElementById('tx-modal').classList.add('active');
};

window.addEventListener('error', function(e) { console.error('Global error:', e.message); });
