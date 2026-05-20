const LIGNES = 8;
const COLONNES = 10;
const NB_MINES = 10;

let grille = [];
let visible = [];
let drapeaux = 0;
let partieTerminee = false;
let timerInterval = null;
let secondes = 0;
let premierClic = true;

function creerGrille() {
  grille = Array.from({ length: LIGNES }, () => Array(COLONNES).fill(0));
  visible = Array.from({ length: LIGNES }, () => Array(COLONNES).fill("caché"));
  drapeaux = 0;
  partieTerminee = false;
  premierClic = true;
  secondes = 0;

  clearInterval(timerInterval);
  document.getElementById("chrono").textContent = "⏱ 0s";
  document.getElementById("compteur-mines").textContent = `💣 ${NB_MINES}`;
  document.getElementById("message").textContent = "";
  document.getElementById("message").className = "";
}

function placerMines(exY, exX) {
  // On évite de placer une mine sur le premier clic
  let placees = 0;
  while (placees < NB_MINES) {
    const x = Math.floor(Math.random() * COLONNES);
    const y = Math.floor(Math.random() * LIGNES);
    if (grille[y][x] === 0 && !(y === exY && x === exX)) {
      grille[y][x] = 9;
      placees++;
    }
  }
}

function remplirGrille() {
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (grille[y][x] === 9) continue;
      let compteur = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue;
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < LIGNES && nx >= 0 && nx < COLONNES) {
            if (grille[ny][nx] === 9) compteur++;
          }
        }
      }
      grille[y][x] = compteur;
    }
  }
}

function decouvrir(y, x) {
  if (y < 0 || y >= LIGNES || x < 0 || x >= COLONNES) return;
  if (visible[y][x] !== "caché") return;

  visible[y][x] = "découvert";

  if (grille[y][x] === 0) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
        decouvrir(y + dy, x + dx);
      }
    }
  }
}

function verifierVictoire() {
  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      if (grille[y][x] !== 9 && visible[y][x] === "caché") return false;
    }
  }
  return true;
}

function afficherGrille() {
  const conteneur = document.getElementById("grille");
  conteneur.innerHTML = "";

  for (let y = 0; y < LIGNES; y++) {
    for (let x = 0; x < COLONNES; x++) {
      const div = document.createElement("div");
      div.classList.add("case");
      div.dataset.y = y;
      div.dataset.x = x;

      const etat = visible[y][x];

      if (etat === "découvert") {
        div.classList.add("découverte");
        const val = grille[y][x];
        if (val === 9) {
          div.classList.add("mine");
          div.textContent = "💣";
        } else if (val > 0) {
          div.textContent = val;
          div.classList.add(`n${val}`);
        }
      } else if (etat === "drapeau") {
        div.classList.add("drapeau");
        div.textContent = "🚩";
      }

      div.addEventListener("click", cliquerCase);
      div.addEventListener("contextmenu", poserDrapeau);

      conteneur.appendChild(div);
    }
  }
}

function cliquerCase(e) {
  if (partieTerminee) return;
  const y = parseInt(e.target.dataset.y);
  const x = parseInt(e.target.dataset.x);

  if (visible[y][x] === "drapeau" || visible[y][x] === "découvert") return;

  // Premier clic : on place les mines maintenant pour éviter de tomber dessus
  if (premierClic) {
    premierClic = false;
    placerMines(y, x);
    remplirGrille();
    timerInterval = setInterval(() => {
      secondes++;
      document.getElementById("chrono").textContent = `⏱ ${secondes}s`;
    }, 1000);
  }

  if (grille[y][x] === 9) {
    // Défaite : on révèle toutes les mines
    for (let ly = 0; ly < LIGNES; ly++) {
      for (let lx = 0; lx < COLONNES; lx++) {
        if (grille[ly][lx] === 9) visible[ly][lx] = "découvert";
      }
    }
    partieTerminee = true;
    clearInterval(timerInterval);
    afficherGrille();
    const msg = document.getElementById("message");
    msg.textContent = "💥 Mine ! Vous avez perdu.";
    msg.className = "defaite";
    return;
  }

  decouvrir(y, x);

  if (verifierVictoire()) {
    partieTerminee = true;
    clearInterval(timerInterval);
    afficherGrille();
    const msg = document.getElementById("message");
    msg.textContent = `🎉 Bravo, vous avez gagné en ${secondes}s !`;
    msg.className = "victoire";
    return;
  }

  afficherGrille();
}

function poserDrapeau(e) {
  e.preventDefault();
  if (partieTerminee) return;
  const y = parseInt(e.target.dataset.y);
  const x = parseInt(e.target.dataset.x);

  if (visible[y][x] === "découvert") return;

  if (visible[y][x] === "drapeau") {
    visible[y][x] = "caché";
    drapeaux--;
  } else {
    visible[y][x] = "drapeau";
    drapeaux++;
  }

  document.getElementById("compteur-mines").textContent = `💣 ${NB_MINES - drapeaux}`;
  afficherGrille();
}

document.getElementById("btn-reset").addEventListener("click", () => {
  creerGrille();
  afficherGrille();
});

// Lancement initial
creerGrille();
afficherGrille();
