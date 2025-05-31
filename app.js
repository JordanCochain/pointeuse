// ---------- Données et initialisation ----------
let donnees = JSON.parse(localStorage.getItem("pointages")) || {};
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// ---------- Fonctions de format ----------
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function toTimeString(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------- Fonctions de pointage ----------
document.getElementById("btn-arrivee").onclick = () => enregistrerHeure("arrivee");
document.getElementById("btn-debut-pause").onclick = () => enregistrerHeure("debutPause");
document.getElementById("btn-fin-pause").onclick = () => enregistrerHeure("finPause");
document.getElementById("btn-depart").onclick = () => enregistrerHeure("depart");

function enregistrerHeure(type) {
  const date = document.getElementById("date").value || formatDate(new Date());
  if (!donnees[date]) donnees[date] = {};
  donnees[date][type] = new Date().toISOString();
  localStorage.setItem("pointages", JSON.stringify(donnees));
  afficherInfos(date);
}

document.getElementById("btn-enregistrer").onclick = () => {
  alert("Heures enregistrées !");
};

function afficherInfos(dateStr) {
  const pointage = donnees[dateStr];
  if (!pointage) {
    document.getElementById("heures-travail").textContent = "";
    document.getElementById("heures-sup").textContent = "";
    document.getElementById("salaire-estime").textContent = "";
    return;
  }

  const arrivee = pointage.arrivee ? new Date(pointage.arrivee) : null;
  const debutPause = pointage.debutPause ? new Date(pointage.debutPause) : null;
  const finPause = pointage.finPause ? new Date(pointage.finPause) : null;
  const depart = pointage.depart ? new Date(pointage.depart) : null;

  let heures = 0;

  if (arrivee && depart) {
    heures = (depart - arrivee) / 3600000;
    if (debutPause && finPause) {
      heures -= (finPause - debutPause) / 3600000;
    }
  }

  const heuresSup = Math.max(0, heures - 7);
  const taux = parseFloat(localStorage.getItem("tauxHoraire") || 0);
  const prime = parseFloat(localStorage.getItem("primeJournaliere") || 0);
  const salaire = (heures * taux) + (heures > 0 ? prime : 0);

  document.getElementById("heures-travail").textContent = `Heures travaillées : ${heures.toFixed(2)} h`;
  document.getElementById("heures-sup").textContent = `Heures supplémentaires : ${heuresSup.toFixed(2)} h`;
  document.getElementById("salaire-estime").textContent = `Salaire estimé : ${salaire.toFixed(2)} €`;
}

// ---------- Chargement automatique de la date du jour ----------
document.getElementById("date").value = formatDate(new Date());
afficherInfos(formatDate(new Date()));

// ---------- Paramètres ----------
document.getElementById("btn-sauvegarder").onclick = () => {
  const taux = parseFloat(document.getElementById("taux-horaire").value || 0);
  const prime = parseFloat(document.getElementById("prime-journaliere").value || 0);
  localStorage.setItem("tauxHoraire", taux);
  localStorage.setItem("primeJournaliere", prime);
  document.getElementById("msg-sauvegarde").textContent = "Paramètres sauvegardés.";
  setTimeout(() => document.getElementById("msg-sauvegarde").textContent = "", 2000);
};

// Remplir les paramètres au chargement
document.getElementById("taux-horaire").value = localStorage.getItem("tauxHoraire") || "";
document.getElementById("prime-journaliere").value = localStorage.getItem("primeJournaliere") || "";

// ---------- AGENDA ----------
const moisLabel = document.getElementById("mois-annee-label");
const calendrier = document.getElementById("grille-agenda");
const btnPrev = document.getElementById("mois-precedent");
const btnNext = document.getElementById("mois-suivant");

btnPrev.onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  afficherMois(currentYear, currentMonth);
};

btnNext.onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  afficherMois(currentYear, currentMonth);
};

function afficherMois(annee, mois) {
  calendrier.innerHTML = "";

  const premierJour = new Date(annee, mois, 1);
  const dernierJour = new Date(annee, mois + 1, 0);
  const nbJours = dernierJour.getDate();
  const premierJourSemaine = premierJour.getDay() === 0 ? 7 : premierJour.getDay();

  moisLabel.textContent = premierJour.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  // En-têtes jours semaine
  const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  joursSemaine.forEach(j => {
    const header = document.createElement("div");
    header.classList.add("agenda-header");
    header.textContent = j;
    calendrier.appendChild(header);
  });

  // Cases vides avant début mois
  for (let i = 1; i < premierJourSemaine; i++) {
    const vide = document.createElement("div");
    vide.classList.add("agenda-cell");
    calendrier.appendChild(vide);
  }

  // Cases jours
  for (let jour = 1; jour <= nbJours; jour++) {
    const cell = document.createElement("div");
    cell.classList.add("agenda-cell");
    const dateObj = new Date(annee, mois, jour);
    const dateStr = formatDate(dateObj);

    // Numéro du jour
    const jourNumero = document.createElement("div");
    jourNumero.textContent = jour;
    jourNumero.style.fontWeight = "bold";
    jourNumero.style.marginBottom = "4px";
    cell.appendChild(jourNumero);

    // Si données présentes, ajouter résumé des heures
    if (donnees[dateStr]) {
      cell.classList.add("has-data");

      const pointage = donnees[dateStr];
      const arrivee = pointage.arrivee ? new Date(pointage.arrivee) : null;
      const debutPause = pointage.debutPause ? new Date(pointage.debutPause) : null;
      const finPause = pointage.finPause ? new Date(pointage.finPause) : null;
      const depart = pointage.depart ? new Date(pointage.depart) : null;

      let heures = 0;
      if (arrivee && depart) {
        heures = (depart - arrivee) / 3600000;
        if (debutPause && finPause) {
          heures -= (finPause - debutPause) / 3600000;
        }
      }

      const résuméHeures = document.createElement("div");
      résuméHeures.textContent = `${heures.toFixed(2)} h`;
      résuméHeures.style.fontSize = "0.85em";
      résuméHeures.style.color = "#1565c0"; // bleu doux
      cell.appendChild(résuméHeures);
    }

    // Au clic, afficher détails
    cell.onclick = () => afficherInfos(dateStr);

    calendrier.appendChild(cell);
  }
}

afficherMois(currentYear, currentMonth);

// ---------- EXPORT EXCEL ----------
document.getElementById("btn-export-excel").onclick = () => {
  exportExcelMois(currentYear, currentMonth);
};

function exportExcelMois(annee, mois) {
  const donneesMois = [];
  donneesMois.push(["Date", "Arrivée", "Début Pause", "Fin Pause", "Départ", "Heures travaillées", "Heures Supplémentaires"]);

  const dernierJour = new Date(annee, mois + 1, 0).getDate();

  for (let jour = 1; jour <= dernierJour; jour++) {
    const dateStr = formatDate(new Date(annee, mois, jour));
    const pointage = donnees[dateStr];

    if (pointage) {
      const arrivee = pointage.arrivee ? new Date(pointage.arrivee) : null;
      const debutPause = pointage.debutPause ? new Date(pointage.debutPause) : null;
      const finPause = pointage.finPause ? new Date(pointage.finPause) : null;
      const depart = pointage.depart ? new Date(pointage.depart) : null;

      let heures = 0;
      if (arrivee && depart) {
        heures = (depart - arrivee) / 3600000;
        if (debutPause && finPause) {
          heures -= (finPause - debutPause) / 3600000;
        }
      }
      const heuresSup = Math.max(0, heures - 7);

      donneesMois.push([
        dateStr,
        arrivee ? toTimeString(arrivee) : "",
        debutPause ? toTimeString(debutPause) : "",
        finPause ? toTimeString(finPause) : "",
        depart ? toTimeString(depart) : "",
        heures.toFixed(2),
        heuresSup.toFixed(2),
      ]);
    } else {
      donneesMois.push([formatDate(new Date(annee, mois, jour)), "", "", "", "", "", ""]);
    }
  }

  // Génération CSV simple pour Excel
  let csvContent = "";
  donneesMois.forEach(row => {
    csvContent += row.join(";") + "\r\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pointage_${annee}_${(mois + 1).toString().padStart(2, "0")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- CONTACTS ----------
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

const contactsList = document.getElementById("contacts-list");
const formContact = document.getElementById("form-contact");

// Afficher contacts
function afficherContacts() {
  contactsList.innerHTML = "";
  if (contacts.length === 0) {
    contactsList.textContent = "Aucun contact enregistré.";
    return;
  }
  contacts.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "contact-item";
    div.style.borderBottom = "1px solid #ccc";
    div.style.padding = "6px 0";

    div.innerHTML = `<strong>${c.nom} ${c.prenom}</strong><br>
      Téléphone: <a href="tel:${c.telephone}">${c.telephone}</a><br>
      Email: <a href="mailto:${c.email}">${c.email}</a>
      <button data-index="${i}" class="btn-supprimer" style="margin-left:10px;color:red;">Supprimer</button>
    `;
    contactsList.appendChild(div);
  });

  // Gestion suppression
  const btnsSuppr = contactsList.querySelectorAll(".btn-supprimer");
  btnsSuppr.forEach(btn => {
    btn.onclick = (e) => {
      const idx = e.target.dataset.index;
      contacts.splice(idx, 1);
      localStorage.setItem("contacts", JSON.stringify(contacts));
      afficherContacts();
    };
  });
}

afficherContacts();

// Ajouter contact
formContact.onsubmit = (e) => {
  e.preventDefault();
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const telephone = document.getElementById("telephone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!nom || !prenom || !telephone || !email) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  contacts.push({ nom, prenom, telephone, email });
  localStorage.setItem("contacts", JSON.stringify(contacts));
  afficherContacts();

  formContact.reset();
};
