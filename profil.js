// =======================================
// Maximum Fire - profil.js (Update)
// =======================================

document.addEventListener("DOMContentLoaded", () => {
    // Observer registrieren: Passt die UI an den Login-Status an
    firebase.auth().onAuthStateChanged((user) => {
        renderAuthSection(user);
        loadProfileData();
    });
});

/**
 * Leert alle Eingabefelder im Stammdaten-Formular
 */
function clearProfileForm() {
    const fields = ["inputGewicht", "inputRuhepuls", "inputFTP", "inputMaxHR"];
    fields.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
}

/**
 * Lädt bestehende Profil-Stammdaten (aus Firestore oder localStorage via data-manager.js)
 */
async function loadProfileData() {
    // 1. Eingabefelder zuerst immer leeren
    clearProfileForm();

    // 2. Neue Daten laden (falls vorhanden)
    const data = await loadDocument("profile", "main");
    if (data) {
        if (data.gewicht !== undefined && data.gewicht !== null) document.getElementById("inputGewicht").value = data.gewicht;
        if (data.ruhepuls !== undefined && data.ruhepuls !== null) document.getElementById("inputRuhepuls").value = data.ruhepuls;
        if (data.ftp !== undefined && data.ftp !== null) document.getElementById("inputFTP").value = data.ftp;
        if (data.maxHR !== undefined && data.maxHR !== null) document.getElementById("inputMaxHR").value = data.maxHR;
    }
}

/**
 * Nutzer abmelden
 */
async function handleLogout() {
    try {
        await firebase.auth().signOut();
        clearProfileForm(); // Eingabefelder beim Abmelden sofort leeren
        alert("Du wurdest abgemeldet.");
    } catch (error) {
        console.error("Logout-Fehler:", error);
    }
}