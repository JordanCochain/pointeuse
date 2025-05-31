// ---------- Données et initialisation ----------
let donnees = JSON.parse(localStorage.getItem("pointages")) || {};
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let currentTab = localStorage.getItem("ongletActif") || "pointage";

// ---------- Fonctions de format ----------
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeString(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------- Fonctions de pointage ----------
document.getElementById("btn-arrivee").onclick = () => enregistrerHeure("arrivee");
document.getElementById("btn-debut-pause").onclick = () => enregistrerHeure("debutPause");
document.getElementById("btn-fin-pause").onclick = () => enregistrerHeure("finPause");
document.getElementById("btn-depart").onclick = () => enregistrerHeure("depart");

document.getElementById("btn-enregistrer").onclick = () => {
  alert("Heures enregistrées !");
};

function enregistrerHeure(type) {
  const date = document.getElementById("date").value || formatDate(new Date());
  if (!donnees[date]) donnees[date] = {};
  donnees[date][type] = new Date().toString();
  localStorage.setItem("pointages", JSON.stringify(donnees));
  afficherInfos(date);
}
function afficherInfos(dateStr) {
  const pointage = donnees[dateStr];
  if (!pointage) {
    document.getElementById("heures-travail").textContent = "";
    document.getElementById("heures-sup").textContent = "";
    document.getElementById("salaire-estime").textContent = "";
    afficherHeurePointage("arrivee", "");
    afficherHeurePointage("debutPause", "");
    afficherHeurePointage("finPause", "");
    afficherHeurePointage("depart", "");
    return;
  }

  const arrivee = pointage.arrivee ? new Date(pointage.arrivee) : null;
  const debutPause = pointage.debutPause ? new Date(pointage.debutPause) : null;
  const finPause = pointage.finPause ? new Date(pointage.finPause) : null;
  const depart = pointage.depart ? new Date(pointage.depart) : null;

  afficherHeurePointage("arrivee", arrivee ? toTimeString(arrivee) : "");
  afficherHeurePointage("debutPause", debutPause ? toTimeString(debutPause) : "");
  afficherHeurePointage("finPause", finPause ? toTimeString(finPause) : "");
  afficherHeurePointage("depart", depart ? toTimeString(depart) : "");

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

  const heuresEntieres = Math.floor(heures);
  const minutes = Math.round((heures - heuresEntieres) * 60);
  const heuresSupEntieres = Math.floor(heuresSup);
  const minutesSup = Math.round((heuresSup - heuresSupEntieres) * 60);

  document.getElementById("heures-travail").textContent = `Heures travaillées : ${heuresEntieres} h ${minutes} min`;
  document.getElementById("heures-sup").textContent = `Heures supplémentaires : ${heuresSupEntieres} h ${minutesSup} min`;
  document.getElementById("salaire-estime").textContent = `Salaire estimé : ${salaire.toFixed(2)} €`;
}

function afficherHeurePointage(type, texteHeure) {
  const id = "heure-" + type;
  const el = document.getElementById(id);
  if (el) {
    el.textContent = texteHeure ? `Pointé à ${texteHeure}` : "Non pointé";
  }
}

document.getElementById("date").value = formatDate(new Date());
afficherInfos(formatDate(new Date()));

document.getElementById("date").addEventListener("change", (e) => {
  afficherInfos(e.target.value);
});

// ---------- Gestion des onglets ----------
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.getAttribute("data-tab");
    document.querySelectorAll("section").forEach(s => s.classList.toggle("active", s.id === target));
    localStorage.setItem("ongletActif", target);
    if (target === "pointage") {
      afficherInfos(document.getElementById("date").value);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const boutonActif = document.querySelector(`nav button[data-tab='${currentTab}']`);
  if (boutonActif) boutonActif.click();
});
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

  moisLabel.textContent = premierJour.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  joursSemaine.forEach((j) => {
    const header = document.createElement("div");
    header.classList.add("agenda-header");
    header.textContent = j;
    calendrier.appendChild(header);
  });

  for (let i = 1; i < premierJourSemaine; i++) {
    const vide = document.createElement("div");
    vide.classList.add("agenda-cell");
    calendrier.appendChild(vide);
  }

  for (let jour = 1; jour <= nbJours; jour++) {
    const cell = document.createElement("div");
    cell.classList.add("agenda-cell");
    const dateObj = new Date(annee, mois, jour);
    const dateStr = formatDate(dateObj);

    const jourNumero = document.createElement("div");
    jourNumero.textContent = jour;
    jourNumero.style.fontWeight = "bold";
    jourNumero.style.marginBottom = "4px";
    cell.appendChild(jourNumero);

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
      résuméHeures.style.color = "#1565c0";
      cell.appendChild(résuméHeures);

      if (pointage.evenements && pointage.evenements.length > 0) {
        const badge = document.createElement("div");
        badge.textContent = `📌 ${pointage.evenements.length} év.`;
        badge.style.fontSize = "0.75em";
        badge.style.color = "#6a1b9a";
        badge.style.marginTop = "4px";
        cell.appendChild(badge);
      }
    }

    cell.onclick = () => {
      afficherInfos(dateStr);
      afficherDetailDansAgenda(dateStr);
    };
    calendrier.appendChild(cell);
  }
}

afficherMois(currentYear, currentMonth);

// ---------- DÉTAIL JOUR avec résumé pointage + événements ----------
function afficherDetailDansAgenda(dateStr) {
  const container = document.getElementById("detail-jour");
  const pointage = donnees[dateStr] || {};
  let html = `<h3>Détail du ${dateStr}</h3>`;

  // Résumé pointage
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
  const heuresEntieres = Math.floor(heures);
  const minutes = Math.round((heures - heuresEntieres) * 60);
  const heuresSupEntieres = Math.floor(heuresSup);
  const minutesSup = Math.round((heuresSup - heuresSupEntieres) * 60);

  html += `
    <p><strong>Heures travaillées :</strong> ${heuresEntieres} h ${minutes} min</p>
    <p><strong>Heures supplémentaires :</strong> ${heuresSupEntieres} h ${minutesSup} min</p>
    <p><strong>Pointage :</strong><br>
      - Arrivée : ${arrivee ? toTimeString(arrivee) : "Non pointé"}<br>
      - Début pause : ${debutPause ? toTimeString(debutPause) : "Non pointé"}<br>
      - Fin pause : ${finPause ? toTimeString(finPause) : "Non pointé"}<br>
      - Départ : ${depart ? toTimeString(depart) : "Non pointé"}
    </p>
  `;

  // Événements
  if (pointage.evenements && pointage.evenements.length > 0) {
    html += "<ul>" + pointage.evenements.map(ev =>
      `<li><strong>${ev.title}</strong><br>Du ${ev.startDate} au ${ev.endDate} de ${ev.startTime} à ${ev.endTime}<br>Lieu : ${ev.location}<br>Description : ${ev.description} <button onclick="supprimerEvenement('${dateStr}', '${ev.title}')">🗑️</button></li>`
    ).join("") + "</ul>";
  } else {
    html += "<p>Aucun événement.</p>";
  }

  container.innerHTML = html;
}
// ---------- EXPORT EXCEL ----------
document.getElementById("btn-export-excel").onclick = () => {
  exportExcelMois(currentYear, currentMonth);
};

function exportExcelMois(annee, mois) {
  const donneesMois = [];
  donneesMois.push(["Date", "Arrivée", "Début pause", "Fin pause", "Départ", "Heures totales", "Heures sup.", "Événements"]);

  const joursMois = new Date(annee, mois + 1, 0).getDate();

  for (let jour = 1; jour <= joursMois; jour++) {
    const dateStr = formatDate(new Date(annee, mois, jour));
    const p = donnees[dateStr] || {};
    const arrivee = p.arrivee ? toTimeString(new Date(p.arrivee)) : "";
    const debutPause = p.debutPause ? toTimeString(new Date(p.debutPause)) : "";
    const finPause = p.finPause ? toTimeString(new Date(p.finPause)) : "";
    const depart = p.depart ? toTimeString(new Date(p.depart)) : "";

    let heures = 0;
    if (p.arrivee && p.depart) {
      heures = (new Date(p.depart) - new Date(p.arrivee)) / 3600000;
      if (p.debutPause && p.finPause) {
        heures -= (new Date(p.finPause) - new Date(p.debutPause)) / 3600000;
      }
    }
    const heuresSup = Math.max(0, heures - 7);

    const evenementsText = (p.evenements || []).map(ev => `${ev.title} (${ev.startDate} → ${ev.endDate})`).join(" | ");

    donneesMois.push([dateStr, arrivee, debutPause, finPause, depart, heures.toFixed(2), heuresSup.toFixed(2), evenementsText]);
  }

  const csvContent = donneesMois.map(e => e.join(";")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `pointage-${annee}-${(mois + 1).toString().padStart(2, "0")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
// ---------- FORMULAIRE D'ÉVÉNEMENT PERMANENT ----------
function initialiserFormulaireEvenementPermanent() {
  const container = document.getElementById("formulaire-evenement-permanent");
  if (!container) return;

  container.innerHTML = `
    <h3>Ajouter un événement</h3>
    <input type="text" id="event-title" placeholder="Titre de l'événement" required /><br/>
    <label>Du <input type="date" id="event-start-date" /> au <input type="date" id="event-end-date" /></label><br/>
    <label>De <input type="time" id="event-start-time" /> à <input type="time" id="event-end-time" /></label><br/>
    <input type="text" id="event-location" placeholder="Lieu" /><br/>
    <textarea id="event-description" placeholder="Description"></textarea><br/>
    <button id="btn-add-event">Ajouter l'événement</button>
  `;

  document.getElementById("btn-add-event").onclick = () => {
    const title = document.getElementById("event-title").value.trim();
    const startDate = document.getElementById("event-start-date").value;
    const endDate = document.getElementById("event-end-date").value;
    const startTime = document.getElementById("event-start-time").value;
    const endTime = document.getElementById("event-end-time").value;
    const location = document.getElementById("event-location").value.trim();
    const description = document.getElementById("event-description").value.trim();

    if (!title || !startDate || !endDate) return alert("Veuillez remplir le titre et les dates.");

    const jours = getDateRange(startDate, endDate);
    jours.forEach(date => {
      if (!donnees[date]) donnees[date] = {};
      if (!donnees[date].evenements) donnees[date].evenements = [];

      donnees[date].evenements.push({
        title,
        startDate,
        endDate,
        startTime,
        endTime,
        location,
        description
      });
    });

    localStorage.setItem("pointages", JSON.stringify(donnees));
    alert("Événement(s) ajouté(s) avec succès !");
    initialiserFormulaireEvenementPermanent(); // Reset form
    afficherMois(currentYear, currentMonth); // Refresh calendrier
  };
}

function getDateRange(start, end) {
  const range = [];
  const dStart = new Date(start);
  const dEnd = new Date(end);
  while (dStart <= dEnd) {
    range.push(formatDate(dStart));
    dStart.setDate(dStart.getDate() + 1);
  }
  return range;
}

// Appeler à la fin
document.addEventListener("DOMContentLoaded", () => {
  initialiserFormulaireEvenementPermanent();
});
