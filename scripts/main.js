/**
 * D&D 5e – Accueil du Cercle de Pierre — « Le grimoire enluminé »
 * Écran d'accueil plein écran, sur fond transparent (la scène d'arrivée reste visible), à chaque session.
 * Un grimoire enluminé ouvert : en haut, un parchemin qui se déroule au survol (date du calendrier, lieu de la compagnie,
 * sous-titre) ; page de gauche, la chronique du jour et le portrait ; page de droite, la carte de la région avec le point
 * rouge et le trajet en pointillés ; sur la tranche, des onglets de cuir (fiche, journal de bord, compagnie, cartes en
 * vision, dernière séance, savoir, boîte à outils, et pour le MJ son bureau et la préparation). Tous les textes se règlent.
 * Module propre au monde « Le Cercle de Pierre » (habillage violet et or, comme les visuels de la Guerre des Drows).
 * Aucune animation en boucle.
 * Foundry VTT v13 / v14 — système dnd5e — magisterphamtom — MIT
 */

import { decor, tormMedaillon, tormFrappe, demarrerSorts, choisirTorm } from "./classes.js";
import { ouvrirReglages } from "./reglages.js";

const ID = "dnd5e-accueil-cercle-de-pierre";
const W = 1600; const H = 1000;
const PETITS = new Set(["de", "du", "des", "la", "le", "les", "et", "en", "à", "au", "aux", "sur", "d", "l"]);

const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const actif = (id) => !!game.modules.get(id)?.active;
const idDe = (ref) => (typeof ref === "string" ? ref : ref?.id ?? "").split(".").pop();
const sansAccent = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function joliNom(nom) {
  const s = String(nom ?? "").trim();
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().split(" ").map((m, i) => (i && PETITS.has(m) ? m : m.replace(/(^|[-'’])(\p{L})/gu, (x, a, b) => a + b.toUpperCase()))).join(" ");
}

/* ================================================================== */
/*  Habillages et réglages                                             */
/* ================================================================== */

/** Habillage de ce module (un module par monde). */
const HABILLAGE = "cercle";
const habillage = () => HABILLAGE;

const HABILLAGES = {
  cercle: {
    nom: "Le Cercle de Pierre (violet et or)",
    titre: "Le Cercle de Pierre", sous: "La Guerre des Drows", lieu: "Ossington", compagnie: "La Compagnie",
    entrer: "Entrer dans l'aventure", cartouche: "Le Grand Duché", aide: "relevé de la Compagnie",
    draps: ["#3b1d5c", "#5a1730", "#2b2a52", "#4a2468"]
  },
  faerun: {
    nom: "Aventures en Faerûn (azur et or)",
    titre: "Aventures en Faerûn", sous: "La Mine perdue de Phandalin", lieu: "Phandalin", compagnie: "La Compagnie",
    entrer: "Entrer dans l'aventure", cartouche: "La Côte des Épées", aide: "d'après les cartes de Padhiver",
    draps: ["#1d3d66", "#7a1f1f", "#1f4d4a", "#2d3570"]
  }
};

/** Textes des onglets : titre et ligne d'aide. Jetons : {nom} personnage, {n} nombre, {compagnie} nom de la compagnie, {nouveau} pages nouvelles. */
const ONGLETS = {
  fiche: { t: "Ma fiche", s: "{nom}" }, groupe: { t: "Les héros", s: "{n} personnages" },
  carnet: { t: "Journal de bord", s: "{nouveau}" }, carnets: { t: "Les journaux", s: "{n} journaux" },
  compagnie: { t: "{compagnie}", s: "{n} compagnons" }, cartes: { t: "Les cartes", s: "sans quitter la table" },
  resume: { t: "La dernière séance", s: "le résumé" }, savoir: { t: "Le savoir", s: "règles et wiki" },
  outils: { t: "La boîte à outils", s: "{n} modules" }, bureau: { t: "Le bureau du MJ", s: "wiki et réglages" },
  prepa: { t: "Préparer la partie", s: "compendiums à importer" }
};
const NOMS_ONGLETS = { fiche: "Ma fiche (joueur)", groupe: "Les héros (MJ)", carnet: "Journal de bord (joueur)", carnets: "Les journaux (MJ)", compagnie: "La Compagnie", cartes: "Les cartes", resume: "La dernière séance", savoir: "Le savoir", outils: "La boîte à outils", bureau: "Le bureau du MJ", prepa: "Préparer la partie (MJ)" };

/** Images propres à la table de Stéphane (droits non libres) : rangées dans le dossier du monde, jamais dans le module publié. */
const imagePrivee = (f) => (game.world?.id === "dans-le-maelstrom-dassignes" ? `worlds/dans-le-maelstrom-dassignes/assets/accueil/${f}` : "");

function defauts() {
  return {
    titre: "Le Cercle de Pierre", sous: "La Guerre des Drows", compagnie: "La Bande à DD", coord: "Ossington",
    chapitre: "Chronique du jour", accroche: "La Bande à DD fait halte à Ossington. Que chacun reprenne sa plume : le récit continue.",
    planche: "Planche I — Le Grand Duché, relevé de la Compagnie", entrer: "Ouvrir le chapitre", entrerSous: "La séance commence",
    textes: {}, carte: "", boussole: imagePrivee("boussole.webp"), torm: imagePrivee("torm.webp"), pointX: "50", pointY: "50", trajet: [], trace: true,
    cartes: [], persos: "", carnets: "", wiki: "", wikiMJ: "", positionsJoueurs: {}
  };
}
/** Style choisi par chaque utilisateur pour son écran : le grimoire ou la table du cartographe. */
const STYLES = { grimoire: "Le grimoire enluminé", carto: "La table du cartographe" };
const style = () => { try { const v = game.settings.get(ID, "style"); return STYLES[v] ? v : (game.settings.get(ID, "styleDefaut") || "grimoire"); } catch (err) { return "grimoire"; } };
const pct = (cle, def) => { try { return (Number(game.settings.get(ID, cle)) || def) / 100; } catch (err) { return def / 100; } };

/** Habillages du grimoire par classe ; « auto » prend la classe de mon personnage. */
const CLASSES = { rodeur: "Rôdeur (cuir de forêt, flèche)", barbare: "Barbare (peau de bête, sang)", ensorceleur: "Ensorceleur (grimoire infernal, éclairs)", barde: "Barde (recueil de chansons)", pretre: "Prêtre de Torm (ivoire et or, gantelet)" };
const IDENT = { ranger: "rodeur", rodeur: "rodeur", rodeuse: "rodeur", barbarian: "barbare", barbare: "barbare", sorcerer: "ensorceleur", ensorceleur: "ensorceleur", ensorceleuse: "ensorceleur", bard: "barde", barde: "barde", cleric: "pretre", clerc: "pretre", pretre: "pretre", pretresse: "pretre" };
function habillageClasse() {
  let v = ""; try { v = game.settings.get(ID, "classe"); } catch (err) { /* rien */ }
  if (v === "aucun") return ""; if (CLASSES[v]) return v;
  const p = monPersonnage(); if (!p) return "";
  for (const k of Object.values(p.classes ?? {})) {
    const c = IDENT[sansAccent(k.system?.identifier ?? "")] ?? IDENT[sansAccent(k.name).split(/[\s(]/)[0]];
    if (c) return c;
  }
  return "";
}

/** Disposition de mon écran (réglage client) ; à défaut, celle que le MJ a donnée aux joueurs. */
function positions() {
  const st = style();
  const mien = (game.settings.get(ID, "dispo") ?? {})[st];
  if (mien && Object.keys(mien).length) return mien;
  return config().positionsJoueurs?.[st] ?? {};
}
async function placerBloc(cle, x, y) {
  const st = style(); const d = foundry.utils.deepClone(game.settings.get(ID, "dispo") ?? {});
  d[st] = { ...positions(), [cle]: { x, y } };
  await game.settings.set(ID, "dispo", d);
}

/** Texte d'un onglet (réglé par le MJ ou par défaut), jetons remplacés. */
function texteOnglet(c, cle, champ, val = {}) {
  const brut = (c.textes?.[cle]?.[champ] ?? "").trim() || ONGLETS[cle][champ];
  return brut.replace(/\{(\w+)\}/g, (x, k) => (k === "compagnie" ? c.compagnie : val[k] ?? ""));
}

function config() {
  const c = foundry.utils.deepClone(game.settings.get(ID, "config") ?? {});
  return { ...defauts(), ...c };
}
async function enregistrer(maj) {
  const c = { ...config(), ...maj };
  await game.settings.set(ID, "config", c);
}

/** Premier lancement : dossiers et cartes repérés d'après leurs noms. */
function deviner() {
  const dossier = (type, re, racine = true) => game.folders.find((f) => f.type === type && (!racine || !f.folder) && re.test(sansAccent(f.name)));
  const persos = dossier("Actor", /joueur/)?.id ?? "";
  const carnets = (dossier("JournalEntry", /journal de bord/) ?? dossier("JournalEntry", /journal des joueurs/))?.id ?? "";
  const wiki = dossier("JournalEntry", /regle/)?.id ?? "";
  const cartes = game.scenes.filter((s) => /joueurs|royaumes oubli|forgotten realms/.test(sansAccent(s.name)) && !/meneur|\[mj\]/.test(sansAccent(s.name))).map((s) => s.id);
  return { persos, carnets, wiki, cartes };
}

/* ================================================================== */
/*  Données de l'accueil                                               */
/* ================================================================== */

const estPile = (a) => !!a?.flags?.["item-piles"]?.data?.enabled || /item pile/i.test(a?.name ?? "");
const estGroupe = (a) => /^le groupe$/i.test(String(a?.name ?? "").trim());

/** Les personnages joueurs : ceux du dossier choisi, sinon ceux attribués aux joueurs ou qu'ils possèdent. */
function personnages() {
  const c = config();
  let liste;
  if (c.persos && game.folders.get(c.persos)) {
    liste = game.actors.filter((a) => a.type === "character" && a.folder?.id === c.persos);
  } else {
    const joueurs = game.users.filter((u) => !u.isGM);
    const ids = new Set(joueurs.map((u) => u.character?.id).filter(Boolean));
    for (const a of game.actors) if (a.type === "character" && joueurs.some((u) => a.testUserPermission(u, "OWNER"))) ids.add(a.id);
    liste = [...ids].map((id) => game.actors.get(id)).filter(Boolean);
  }
  return liste.filter((a) => !estPile(a) && !estGroupe(a)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function monPersonnage() {
  if (game.user.isGM) return null;
  const c = game.user.character;
  if (c && !estGroupe(c)) return c;
  return personnages().find((a) => a.testUserPermission(game.user, "OWNER")) ?? (c ?? null);
}

function stats(a) {
  const s = a?.system ?? {};
  const hp = s.attributes?.hp ?? {};
  const classes = Object.values(a?.classes ?? {}).map((k) => k.name).join(" / ");
  const espece = a?.itemTypes?.race?.[0]?.name ?? (typeof s.details?.race === "string" ? s.details.race : s.details?.race?.name) ?? "";
  return { pv: hp.value ?? "–", pvMax: hp.max ?? "", ca: s.attributes?.ac?.value ?? "–", niv: s.details?.level ?? "–", classes, espece };
}

/** Journaux de bord : ceux du dossier choisi (sous-dossiers compris). */
function carnets() {
  const racine = game.folders.get(config().carnets); if (!racine) return [];
  const dans = (f) => { while (f) { if (f.id === racine.id) return true; f = f.folder; } return false; };
  return game.journal.filter((j) => dans(j.folder)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function monCarnet(perso) {
  if (game.user.isGM) return null;
  const miens = carnets().filter((j) => j.testUserPermission(game.user, "OWNER"));
  if (miens.length < 2 || !perso) return miens[0] ?? null;
  const mots = sansAccent(perso.name).split(/[\s"'«»’-]+/).filter((m) => m.length > 2);
  return miens.find((j) => mots.some((m) => sansAccent(j.name).includes(m))) ?? miens[0];
}

/** Pages nouvelles depuis la dernière ouverture (mémorisées sur l'utilisateur ; la première fois, tout est « déjà vu »). */
function pagesNouvelles(j) {
  if (!j) return 0;
  const vus = game.user.getFlag(ID, "vus") ?? {};
  if (!vus[j.id]) { Accueil.marquerVu(j); return 0; }
  return j.pages.filter((p) => !vus[j.id].includes(p.id) && p.testUserPermission(game.user, "OBSERVER")).length;
}

/** Date du calendrier du monde (Mini Calendar remplace le calendrier de Foundry). */
function dateDuJour() {
  try {
    const cal = game.time?.calendar; if (!cal) return "";
    const comp = game.time.components ?? cal.timeToComponents(game.time.worldTime);
    const mois = cal.months?.values?.[comp.month];
    const nomMois = mois ? game.i18n.localize(mois.name) : "";
    const jour = (comp.dayOfMonth ?? 0) + 1;
    const an = (comp.year ?? 0) + (cal.years?.yearZero ?? 0);
    if (!nomMois) return "";
    return `${jour === 1 ? "1er" : jour} ${nomMois} ${an}`;
  } catch (err) { return ""; }
}

const fondScene = (s) => s?.levels?.contents?.[0]?.background?.src || s?.background?.src || s?.thumb || "";
function outilBarre(nom) {
  for (const g of Object.values(ui.controls?.controls ?? {})) { const t = g?.tools?.[nom]; if (t) return t; }
  return null;
}
const outilResume = () => outilBarre("resumeHebdo");

/* ================================================================== */
/*  Boîte à outils : les modules de la table                           */
/* ================================================================== */

/**
 * Catalogue. qui : "tous" ou "mj". Action : outil (bouton de la barre de gauche), touche (raccourci), pack, fn, ou rien (automatique).
 * fermer : ferme l'accueil avant (pour ce qui s'affiche sur la scène, sous l'écran).
 */
const MODULES = [
  { id: "messages-secrets", qui: "tous", icone: "fa-user-secret", nom: "Messages secrets", desc: "Écrire en privé au MJ ou à un autre joueur.", outil: "messagesSecrets" },
  { id: "resume-hebdo", qui: "tous", icone: "fa-scroll", nom: "Résumé de la semaine", desc: "Le résumé illustré des dernières séances.", outil: "resumeHebdo" },
  { id: "wgtgm-mini-calendar", qui: "tous", icone: "fa-calendar-days", nom: "Calendrier", desc: "La date du jour, la météo et les notes du calendrier.", fn: "calendrier", fermer: true },
  { id: "barres-macros-libres", qui: "tous", icone: "fa-table-cells", nom: "Barres de macros libres", desc: "Réduire ou afficher tes barres de macros flottantes (Alt+M).", touche: "barres-macros-libres.toggle", fermer: true },
  { id: "carrousel-combat", qui: "tous", icone: "fa-circle-nodes", nom: "Carrousel de combat", desc: "Afficher ou masquer l'ordre du combat.", touche: "carrousel-combat.toggle", fermer: true },
  { id: "critiques-epiques", qui: "tous", icone: "fa-burst", nom: "Critiques épiques", desc: "Voir l'effet d'une réussite critique (il se joue tout seul pendant la partie).", fn: "critique", fermer: true },
  { id: "distribution-aides-fantasy", qui: "mj", icone: "fa-envelope-open-text", nom: "Remettre une aide de jeu", desc: "Donner une aide de jeu aux joueurs.", outil: "distributionAides" },
  { id: "enhancedcombathud", qui: "tous", icone: "fa-shield-halved", nom: "Argon – HUD de combat", desc: "Le tableau de bord de combat s'ouvre sur ton jeton pendant les combats." },
  { id: "dnd5e-flip-cards", qui: "tous", icone: "fa-repeat", nom: "Cartes de magie sauvage", desc: "Les cartes de déferlement se retournent d'un clic dans le chat." },
  { id: "speaking-status", qui: "tous", icone: "fa-comment-dots", nom: "Qui parle ?", desc: "Le jeton de celui qui parle s'illumine." },
  { id: "combat-distances", qui: "tous", icone: "fa-ruler", nom: "Distances de combat", desc: "Les distances s'affichent autour du jeton pendant le combat." },
  { id: "taille-jeton-molette", qui: "tous", icone: "fa-up-right-and-down-left-from-center", nom: "Taille des jetons à la molette", desc: "La molette sur un jeton change sa taille." },
  { id: "item-piles", qui: "tous", icone: "fa-sack-dollar", nom: "Tas d'objets et marchands", desc: "Ouvre les coffres, les butins et les boutiques posés sur la carte." },
  { id: "polyglot", qui: "tous", icone: "fa-language", nom: "Polyglot", desc: "Les messages en langues que ton personnage ne parle pas restent incompréhensibles." },
  { id: "dice-so-nice", qui: "tous", icone: "fa-dice-d20", nom: "Dice So Nice", desc: "Les dés roulent en 3D (réglages : Configurer les paramètres)." },
  { id: "dossiers-caches", qui: "mj", icone: "fa-folder-closed", nom: "Masquer les dossiers de journaux", desc: "Clic droit sur un dossier de journaux pour le masquer." },
  { id: "monks-tokenbar", qui: "mj", icone: "fa-users-rectangle", nom: "Monk's TokenBar", desc: "Demander des jets de groupe, répartir l'expérience et le butin." }
];

const cleModule = (m) => `${m.id}:${m.outil || m.touche || m.pack || m.fn || "auto"}`;
const JOUEURS_DEFAUT = ["messages-secrets:messagesSecrets", "resume-hebdo:resumeHebdo", "wgtgm-mini-calendar:calendrier", "barres-macros-libres:barres-macros-libres.toggle", "enhancedcombathud:auto", "item-piles:auto"];
function vusParJoueurs() { const v = game.settings.get(ID, "outilsJoueurs"); return Array.isArray(v) ? v : JOUEURS_DEFAUT; }

function modulesDisponibles() {
  const gm = game.user.isGM; const r = { tous: [], mj: [], auto: [] }; const vus = vusParJoueurs();
  MODULES.forEach((m, i) => {
    if (!actif(m.id)) return;
    if (m.qui === "mj" && !gm) return;
    const pourJoueurs = m.qui === "tous" && vus.includes(cleModule(m));
    if (!gm && !pourJoueurs) return;
    let ok = true;
    if (m.outil) { const t = outilBarre(m.outil); ok = !!t && t.visible !== false; }
    else if (m.touche) { const k = game.keybindings.actions.get(m.touche); ok = !!k && (!k.restricted || gm); }
    else if (m.pack) { const p = game.packs.get(m.pack); ok = !!p && (gm || p.visible !== false); }
    else if (m.fn === "calendrier") ok = !!game.modules.get(m.id)?.api?.openCalendar;
    else if (m.fn === "critique") ok = !!game.modules.get(m.id)?.api?.play;
    if (!ok) return;
    const action = m.outil || m.touche || m.pack || m.fn;
    (action ? (m.qui === "mj" ? r.mj : r.tous) : r.auto).push({ ...m, i, action: !!action, pourJoueurs });
  });
  return r;
}

async function lancerModule(i) {
  const m = MODULES[i]; if (!m) return;
  if (m.fermer) Accueil.fermer();
  try {
    if (m.outil) { const t = outilBarre(m.outil); return t?.onChange?.(new PointerEvent("click"), true); }
    if (m.touche) return game.keybindings.actions.get(m.touche)?.onDown?.({});
    if (m.pack) return game.packs.get(m.pack)?.render(true);
    switch (m.fn) {
      case "calendrier": return game.modules.get(m.id).api.openCalendar(true);
      case "critique": return game.modules.get(m.id).api.play("critical", { name: monPersonnage()?.name ?? game.user.name, subtitle: "Démonstration" });
    }
  } catch (err) { console.error(`${ID} | ${m.nom}`, err); ui.notifications.warn(`« ${m.nom} » n'a pas pu s'ouvrir.`); }
}

/* ================================================================== */
/*  Dessins                                                            */
/* ================================================================== */

/** Carte dessinée, en attendant l'image de la région (Réglages). */
function carteDessinee(h) {
  return `<svg class="dac-carte-svg" viewBox="0 0 760 540" aria-hidden="true">
  <defs><radialGradient id="dac-pap" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#f1e4c2"/><stop offset=".75" stop-color="#dcc592"/><stop offset="1" stop-color="#b08d52"/></radialGradient></defs>
  <rect width="760" height="540" fill="url(#dac-pap)"/>
  <path d="M0 0H210C190 60 150 90 160 150C170 210 110 240 120 300C130 360 80 420 95 540H0Z" fill="#b9cbc4" opacity=".75"/>
  <path d="M210 0C190 60 150 90 160 150C170 210 110 240 120 300C130 360 80 420 95 540" fill="none" stroke="#5b4428" stroke-width="2"/>
  <path d="M300 60C330 140 380 170 370 240C360 300 420 340 470 380C520 420 540 470 600 540" fill="none" stroke="#5e8a9a" stroke-width="3"/>
  <g fill="#8a6d43" stroke="#4b3720" stroke-width="1.2">${[[520, 90], [560, 110], [600, 80], [640, 120], [585, 140], [670, 95]].map(([x, y]) => `<path d="M${x - 18} ${y + 16}L${x} ${y - 16}L${x + 18} ${y + 16}Z"/>`).join("")}</g>
  <g fill="#6f7d4a" stroke="#3f4a26" stroke-width="1">${[[230, 330], [250, 350], [270, 325], [290, 355], [255, 375], [300, 330], [320, 360]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13"/>`).join("")}</g>
  <path d="M150 230C230 250 300 270 380 280C460 290 520 250 610 260" fill="none" stroke="#6b4f2a" stroke-width="2" stroke-dasharray="7 5"/>
  <g transform="translate(675 450)"><circle r="40" fill="none" stroke="#4b3720"/><path d="M0-52L8 0 0 52-8 0Z" fill="#4b3720"/><path d="M-52 0L0 7 52 0 0-7Z" fill="#8a6d43"/><text y="-58" text-anchor="middle" font-family="DAC Cinzel" font-size="15" fill="#4b3720">N</text></g>
  <g transform="translate(230 455)"><rect width="300" height="60" fill="#f4ead2" stroke="#4b3720"/><rect x="5" y="5" width="290" height="50" fill="none" stroke="#4b3720" stroke-width=".7"/>
    <text x="150" y="28" text-anchor="middle" font-family="DAC Cinzel Decorative" font-weight="700" font-size="20" fill="#2a2117">${esc(h.cartouche)}</text>
    <text x="150" y="47" text-anchor="middle" font-family="DAC Garamond" font-style="italic" font-size="13" fill="#4b3720">carte provisoire · le MJ choisit l'image dans les réglages</text></g>
</svg>`;
}

const ROSE = `<svg class="dac-rose" viewBox="-60 -60 120 120" aria-hidden="true"><circle r="44" fill="none" stroke="currentColor" stroke-width="1.5"/><circle r="36" fill="none" stroke="currentColor" stroke-width=".6"/>
  <path d="M0-56L9 0 0 56-9 0Z" fill="currentColor"/><path d="M-56 0L0 9 56 0 0-9Z" fill="currentColor" opacity=".55"/><path d="M-30-30L4-4M30 30L-4 4M30-30L4-4M-30 30L-4 4" stroke="currentColor" stroke-width="2"/>
  <text y="-46" text-anchor="middle" font-size="13" fill="currentColor" font-family="DAC Cinzel">N</text></svg>`;
const SILHOUETTE = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="40" r="17"/><path d="M18 100c2-26 16-38 32-38s30 12 32 38z"/></svg>`;

/** Clé d'un élément déplaçable : fanion, bannière (« titre ») ou carte (« carte »). */
const ALIAS = { fiche: "perso", groupe: "perso", aucun: "perso", carnet: "carnet", carnets: "carnet" };
function cleBloc(e) {
  if (e.matches(".dac-onglet, .dac-signet, .dac-fanion, .dac-plaque")) return ALIAS[e.dataset.dac] ?? e.dataset.dac;
  if (e.matches(".dac-parchemin, .dac-banniere")) return "titre";
  if (e.matches(".dac-livre")) return "livre";
  if (e.matches(".dac-carte")) return "carte";
  return null;
}
const BLOCS = ":scope > .dac-onglet, :scope > .dac-signet, :scope > .dac-parchemin, :scope > .dac-livre, :scope > .dac-fanion, :scope > .dac-plaque, :scope > .dac-banniere, :scope > .dac-carte";

/* ================================================================== */
/*  L'écran                                                            */
/* ================================================================== */

class Accueil {
  static el = null;
  static vue = "accueil";      // accueil | savoir | outils | bureau | prepa | compagnie | carnets | reglages
  static edition = false;      // panneau « changer la bannière » (MJ)
  static disposer = false;     // mise en place (MJ)
  static sansClic = false;     // un glisser vient de finir : ignorer le clic qui suit
  static vision = null;        // { titre, scenes: [ids], i }
  static wiki = { quel: "joueur", entree: null, page: null };

  static ouvrir(vue = "accueil") {
    if (!Accueil.el) {
      const el = document.createElement("section");
      el.id = "dacc-ecran"; el.tabIndex = -1; el.setAttribute("aria-label", "Écran d'accueil");
      el.addEventListener("click", (ev) => Accueil.#clic(ev));
      el.addEventListener("change", (ev) => {
        const s = ev.target.closest('[data-dac="fond-scene"]'); if (!s?.value) return;
        const champ = el.querySelector('[data-dac-reglage="carte"]');
        const src = fondScene(game.scenes.get(s.value));
        if (champ && src) champ.value = src; else ui.notifications.warn("Cette scène n'a pas d'image de fond.");
      });
      el.addEventListener("pointerdown", (ev) => {
        if (ev.target.closest(".dac-point")) return Accueil.#glisserPoint(ev);
        Accueil.#glisserBloc(ev);
      });
      el.addEventListener("keydown", (ev) => {
        if (ev.key !== "Escape") return;
        ev.stopPropagation();
        if (Accueil.disposer) { Accueil.disposer = false; return Accueil.afficher(); }
        if (Accueil.vision) return Accueil.fermerVision();
        return Accueil.vue !== "accueil" ? Accueil.afficher("accueil") : Accueil.fermer();
      });
      document.body.append(el); Accueil.el = el;
      el.focus({ preventScroll: true });
    }
    Accueil.afficher(vue);
    Accueil.majBouton();
  }

  static fermer() { Accueil.arretSorts?.(); Accueil.arretSorts = null; Accueil.el?.remove(); Accueil.el = null; Accueil.vision = null; Accueil.vue = "accueil"; Accueil.disposer = false; Accueil.edition = false; Accueil.majBouton(); }
  static basculer() { return Accueil.el ? Accueil.fermer() : Accueil.ouvrir(); }

  static majBouton() {
    const t = ui.controls?.controls?.tokens?.tools?.["dnd5e-accueil-cercle-de-pierre-bouton"];
    if (t) t.active = !!Accueil.el;
    ui.controls?.render?.();
  }

  /** L'accueil est dessiné à 1600 × 1000 puis mis à l'échelle de la fenêtre. */
  static echelle() {
    const scene = Accueil.el?.querySelector(".dac-scene"); if (!scene) return;
    const k = Math.min(window.innerWidth / W, window.innerHeight / H);
    scene.style.transform = `translate(-50%, -50%) scale(${k})`;
  }

  static async afficher(vue = Accueil.vue) {
    Accueil.vue = vue;
    const el = Accueil.el; if (!el) return;
    const cl = habillageClasse();
    let calme = false; try { calme = !game.settings.get(ID, "animations"); } catch (err) { /* rien */ }
    const torm = String(config().torm ?? "").trim(); choisirTorm(torm);
    el.className = `dac-${habillage()} st-${style()}${cl ? ` cl-${cl}` : ""}${calme ? " dac-calme" : ""}${torm ? " torm-img" : ""}`;
    if (torm) el.style.setProperty("--torm-img", `url("${encodeURI(foundry.utils.getRoute ? foundry.utils.getRoute(torm) : "/" + torm)}")`); else el.style.removeProperty("--torm-img");
    el.style.setProperty("--dac-taille", String(pct("taille", 80)));
    el.style.setProperty("--dac-onglets", String(pct("tailleOnglets", 80)));
    el.style.setProperty("--dac-livre", String(pct("tailleLivre", 100)));
    const page = vue === "accueil" ? "" : `<div class="dac-voile" data-dac="accueil"></div><article class="dac-page">${await Accueil.#page(vue)}</article>`;
    el.innerHTML = `<div class="dac-scene">${style() === "carto" ? Accueil.#accueilCarto() : Accueil.#accueil()}${page}${Accueil.vision ? Accueil.#vision() : ""}</div>`;
    Accueil.echelle();
    Accueil.#placer();
    Accueil.#zoom();
    Accueil.#ajusterDecor();
    Accueil.#torm();
    el.querySelector(".dac-page")?.scrollTo?.(0, 0);
  }

  /* ---------------- L'accueil ---------------- */

  static #accueil() {
    const c = config(); const gm = game.user.isGM;
    const perso = monPersonnage();
    const nom = perso?.name ?? game.user.name;
    const date = dateDuJour();
    const ps = personnages();
    const T = (cle, val) => ({ t: esc(texteOnglet(c, cle, "t", val)), s: esc(texteOnglet(c, cle, "s", val)) });

    // Onglets de cuir sur la tranche du livre
    const onglets = [];
    const onglet = (cle, val, extra = "") => { const x = T(cle, val); onglets.push({ cle, html: `<b>${x.t}</b><small>${x.s}</small>`, extra }); };
    if (gm) onglet("groupe", { n: ps.length });
    else if (perso) onglet("fiche", { nom: perso.name });
    if (gm) { if (carnets().length) onglet("carnets", { n: carnets().length }); }
    else {
      const j = monCarnet(perso); const nb = pagesNouvelles(j);
      if (j) onglet("carnet", { nouveau: nb ? `${nb} ${nb > 1 ? "pages nouvelles" : "page nouvelle"}` : j.name }, nb ? "dac-neuf" : "");
    }
    if (ps.length) onglet("compagnie", { n: ps.length });
    if ((c.cartes ?? []).some((id) => game.scenes.get(id))) onglet("cartes");
    else if (gm) onglets.push({ cle: "reglages", html: `<b>${T("cartes").t}</b><small>à choisir dans les réglages</small>`, extra: "dac-terne" });
    if (outilResume()) onglet("resume");
    if (c.wiki && game.folders.get(c.wiki)) onglet("savoir");
    const d = modulesDisponibles(); const nbOutils = d.tous.length + d.mj.length;
    if (nbOutils) onglet("outils", { n: nbOutils });
    if (gm) { onglet("bureau", {}, "dac-mj"); onglet("prepa", {}, "dac-mj"); }
    const ROMAINS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    const COULEURS = ["#3b1d5c", "#5a1730", "#1f3d4a", "#2f4a26", "#4a2468", "#6b3a12", "#2b2a52", "#3a2a5c", "#5a1730", "#2f4a26", "#1f3d4a"];
    const kL = pct("tailleLivre", 100); const bordD = Math.round(770 + 620 * kL); const haut = 165;
    const pas = Math.min(84, Math.floor(700 / Math.max(onglets.length, 1)));
    const htmlOnglets = onglets.map((o, k) => `<button type="button" class="dac-onglet ${o.extra}" data-dac="${o.cle}" style="left:${bordD + 2}px;top:${Math.round(haut + (25 + k * pas) * kL)}px;height:${pas - 10}px;--cuir:${o.extra.includes("dac-mj") ? "#8a6a1c" : COULEURS[k % COULEURS.length]}"><i>${ROMAINS[k] ?? "✦"}</i>${o.html}</button>`).join("");

    // Page de gauche : chronique, portrait
    let miniature;
    if (gm) miniature = `<button type="button" class="dac-miniature" data-dac="groupe"><span class="dac-trombi">${ps.slice(0, 6).map((a) => `<img src="${esc(a.img)}" alt="">`).join("")}</span><span><b>${esc(c.compagnie)}</b><em>${ps.length} héros · ouvrir leurs fiches</em></span></button>`;
    else if (perso) { const s = stats(perso); miniature = `<button type="button" class="dac-miniature" data-dac="fiche"><img class="dac-portrait" src="${esc(perso.img)}" alt=""><span><b>${esc(perso.name)}</b><em>${esc([s.espece, s.classes].filter(Boolean).join(" · "))}</em><code>PV ${s.pv}${s.pvMax ? `/${s.pvMax}` : ""} · CA ${s.ca} · Niv. ${s.niv}</code></span></button>`; }
    else miniature = `<button type="button" class="dac-miniature" data-dac="aucun"><span class="dac-portrait vide">${SILHOUETTE}</span><span><b>Aucun personnage</b><em>Le MJ ne t'a pas encore attribué de personnage</em></span></button>`;
    const chap = String(c.chapitre ?? "");
    const lettrine = chap ? `<span class="dac-lettrine">${esc(chap[0])}</span>${esc(chap.slice(1))}` : "";
    const pageG = `<div class="dac-page-g"><h2>${lettrine}</h2><div class="dac-orne">❦ ✦ ❦</div>
      <p class="dac-accroche">${esc(c.accroche).replace(/\n/g, "<br>")}</p>${miniature}<p class="dac-bienvenue">Bienvenue, ${esc(nom)}</p></div>`;

    // Page de droite : la carte en planche, point rouge et trajet
    const px = parseFloat(c.pointX); const py = parseFloat(c.pointY);
    const okPoint = Number.isFinite(px) && Number.isFinite(py);
    const trajet = okPoint && (c.trajet ?? []).length
      ? `<svg class="dac-trajet" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${[...c.trajet, { x: px, y: py }].map((p) => `${(+p.x).toFixed(2)},${(+p.y).toFixed(2)}`).join(" ")}"/></svg>
         ${c.trajet.map((p) => `<i class="dac-etape" style="left:${p.x}%;top:${p.y}%"></i>`).join("")}` : "";
    const point = okPoint ? `<i class="dac-point${gm ? " deplacable" : ""}" style="left:${px}%;top:${py}%"${gm ? ` title="Glisser pour déplacer la Compagnie"` : ""}></i>${(c.coord ?? "").trim() ? `<em class="dac-lieu" style="left:${px}%;top:${py}%">${esc(c.coord)}</em>` : ""}` : "";
    const h = HABILLAGES[habillage()] ?? HABILLAGES.cercle;
    const fond = c.carte ? `<img src="${esc(c.carte)}" alt="" draggable="false">` : carteDessinee(h);
    const pageD = `<div class="dac-page-d"><div class="dac-planche"><span class="dac-cadre">${fond}${trajet}${point}${habillageClasse() === "pretre" ? tormFrappe() : ""}</span></div><p class="dac-planche-titre">${esc(c.planche)}</p></div>`;

    const livre = `<div class="dac-livre"><span class="dac-couv"></span><div class="dac-feuille g">${pageG}</div><div class="dac-feuille d">${pageD}</div>${decor(habillageClasse())}</div>`;

    // Le parchemin du titre : roulé, il montre le titre ; il se déroule au survol (date, lieu de la compagnie, sous-titre)
    const outilsMJ = Accueil.#boutons();
    const lignes = [
      date ? `<span class="dac-date">${esc(date)}</span>` : "",
      okPoint && (c.coord ?? "").trim() ? `<span><b>${esc(c.compagnie)}</b> est à <b>${esc(c.coord)}</b></span>` : `<span><b>${esc(c.compagnie)}</b></span>`,
      c.sous ? `<span class="dac-sous-titre">${esc(c.sous)}</span>` : ""
    ].filter(Boolean).join(`<i class="dac-sep">✦</i>`);
    const parchemin = `<header class="dac-parchemin${Accueil.edition ? " ouvert" : ""}" tabindex="0">${outilsMJ}<span class="dac-rouleau haut"></span>
      <div class="dac-velin"><h1>${esc(c.titre)}</h1><div class="dac-deroule"><div class="dac-infos">${lignes}</div></div></div><span class="dac-rouleau bas"></span></header>`;

    const signet = `<button type="button" class="dac-signet" data-dac="entrer" style="left:${Math.round(770 - 440 * kL)}px;top:${Math.round(haut + 720 * kL)}px"><b>${esc(c.entrer)} ›</b><small>${esc(c.entrerSous)}</small></button>`;
    const mise = Accueil.#bandeau("le parchemin, le livre, un onglet ou le signet");

    return `${livre}${htmlOnglets}${signet}${parchemin}${gm && Accueil.edition ? Accueil.#edition() : ""}${mise}
      <p class="dac-aide"><span>Survole le parchemin pour le dérouler · bouton livre de la barre de gauche ou Alt+U pour rouvrir cet écran · Échap pour entrer</span></p>`;
  }

  /** Crayon (MJ), mise en place et choix du style (tous). */
  static #boutons() {
    const autre = style() === "carto" ? "grimoire" : "carto";
    return `${game.user.isGM ? `<button type="button" class="dac-editer" data-dac="editer" title="Changer les textes"><i class="fa-solid fa-pen"></i></button>` : ""}
      <button type="button" class="dac-editer dac-bouton-disposer${Accueil.disposer ? " actif" : ""}" data-dac="disposer" title="Disposer mon écran : déplacer les éléments (seulement chez moi)"><i class="fa-solid fa-up-down-left-right"></i></button>
      <button type="button" class="dac-editer dac-bouton-style" data-dac="style" data-style="${autre}" title="Passer au style « ${esc(STYLES[autre])} » (seulement chez moi)"><i class="fa-solid ${autre === "carto" ? "fa-map" : "fa-book-open"}"></i></button>`;
  }

  /** Bandeau de mise en place : chacun dispose son propre écran ; le MJ peut donner sa disposition aux joueurs. */
  static #bandeau(quoi) {
    if (!Accueil.disposer) return "";
    const gm = game.user.isGM; const st = style();
    const joueurs = Object.keys(config().positionsJoueurs?.[st] ?? {}).length;
    return `<div class="dac-bandeau"><span><b>Disposer mon écran</b> · fais glisser ${quoi} pour les placer · cela ne change que ton écran${gm ? " ; les tailles se règlent dans Configurer les paramètres › Accueil (chacun pour soi)" : ""}</span>
      <span class="dac-actions"><button type="button" class="dac-bouton" data-dac="pos-defaut">Places d'origine</button>
      ${gm ? `<button type="button" class="dac-bouton" data-dac="pos-joueurs"><i class="fa-solid fa-users"></i> Donner ma disposition aux joueurs</button>${joueurs ? `<button type="button" class="dac-bouton" data-dac="pos-joueurs-vider">Rendre aux joueurs les places d'origine</button>` : ""}` : ""}
      <button type="button" class="dac-bouton principal" data-dac="disposer"><i class="fa-solid fa-check"></i> Terminer</button></span></div>`;
  }

  static #accueilCarto() {
    const c = config(); const h = HABILLAGES[habillage()] ?? HABILLAGES.cercle; const gm = game.user.isGM;
    const T = (cle, val) => ({ t: esc(texteOnglet(c, cle, "t", val)), s: esc(texteOnglet(c, cle, "s", val)) });
    const perso = monPersonnage();
    const nom = perso?.name ?? game.user.name;
    const date = dateDuJour();
    let n = 0;
    /** Un fanion : hampe dorée, drap à pointes, icône, petit titre, titre, ligne d'aide. */
    const fanion = (cle, x, y, contenu, { r = 0, icone = "", extra = "" } = {}) => {
      const drap = h.draps[n++ % h.draps.length];
      return `<button type="button" class="dac-fanion ${extra}" data-dac="${cle}" style="left:${x}px;top:${y}px;--r:${r}deg;--drap:${drap}">
        <i class="dac-hampe"></i><span class="dac-drap">${icone ? `<i class="fa-solid ${icone} dac-ico"></i>` : ""}${contenu}</span></button>`;
    };
    const plaque = (cle, x, y, contenu, extra = "") => `<button type="button" class="dac-plaque ${extra}" data-dac="${cle}" style="left:${x}px;top:${y}px">${contenu}</button>`;

    // Colonne de gauche : ma fiche (le groupe pour le MJ), mon journal, la Compagnie, les cartes
    let fiche;
    const ps = personnages();
    if (gm) {
      fiche = fanion("groupe", 40, 200, `<small>Le MJ</small><b>${T("groupe").t}</b><span class="dac-trombi">${ps.slice(0, 6).map((a) => `<img src="${esc(a.img)}" alt="">`).join("")}</span><span>${T("groupe", { n: ps.length }).s}</span>`, { r: -2, icone: "fa-users" });
    } else if (perso) {
      const s = stats(perso);
      fiche = fanion("fiche", 40, 200, `<img class="dac-medaillon" src="${esc(perso.img)}" alt=""><b>${esc(perso.name)}</b><em>${esc([s.espece, s.classes].filter(Boolean).join(" · "))}</em>
        <code>PV ${s.pv}${s.pvMax ? `/${s.pvMax}` : ""} · CA ${s.ca} · Niv. ${s.niv}</code><span>Ouvrir ma fiche</span>`, { r: -2 });
    } else {
      fiche = fanion("aucun", 40, 200, `<span class="dac-medaillon vide">${SILHOUETTE}</span><b>Aucun personnage</b><span>Le MJ ne t'a pas encore attribué de personnage</span>`, { r: -2 });
    }

    let carnet = "";
    if (gm) {
      if (carnets().length) carnet = fanion("carnets", 215, 235, `<small>Le MJ</small><b>${T("carnets").t}</b><span>${T("carnets", { n: carnets().length }).s}</span>`, { r: 2, icone: "fa-book" });
    } else {
      const j = monCarnet(perso); const nb = pagesNouvelles(j);
      if (j) carnet = fanion("carnet", 215, 235, `<small>Mon</small><b>${T("carnet").t}</b><span>${T("carnet", { nouveau: j.name }).s}</span>${nb ? `<span class="dac-nouveau">${nb} ${nb > 1 ? "pages nouvelles" : "page nouvelle"}</span>` : ""}`, { r: 2, icone: "fa-book-open", extra: "dac-carnet" });
    }
    const compagnie = ps.length ? fanion("compagnie", 40, 545, `<small>Les héros</small><b>${T("compagnie").t}</b><span>${T("compagnie", { n: ps.length }).s}</span>`, { r: 1.5, icone: "fa-shield-halved" }) : "";
    const lesCartes = (c.cartes ?? []).filter((id) => game.scenes.get(id));
    const cartes = lesCartes.length ? fanion("cartes", 215, 575, `<small>Cartographie</small><b>${T("cartes").t}</b><span>${T("cartes").s}</span>`, { r: -2, icone: "fa-map" })
      : gm ? fanion("reglages", 215, 575, `<small>Cartographie</small><b>${T("cartes").t}</b><span>À choisir dans les réglages</span>`, { r: -2, icone: "fa-map", extra: "dac-terne" }) : "";

    // Colonne de droite : la dernière séance, le savoir, la boîte à outils, le bureau du MJ
    const resume = outilResume() ? fanion("resume", 1215, 235, `<small>Précédemment</small><b>${T("resume").t}</b><span>${T("resume").s}</span>`, { r: -2, icone: "fa-scroll" }) : "";
    const savoir = c.wiki && game.folders.get(c.wiki) ? fanion("savoir", 1390, 200, `<small>Bibliothèque</small><b>${T("savoir").t}</b><span>${T("savoir").s}</span>`, { r: 2, icone: "fa-book-atlas" }) : "";
    const nbOutils = (() => { const d = modulesDisponibles(); return d.tous.length + d.mj.length; })();
    const outils = nbOutils ? fanion("outils", 1215, 575, `<small>Matériel</small><b>${T("outils").t}</b><span>${T("outils", { n: nbOutils }).s}</span>`, { r: 1.5, icone: "fa-toolbox" }) : "";
    const bureau = gm ? fanion("bureau", 1390, 545, `<small>Le MJ</small><b>${T("bureau").t}</b><span>${T("bureau").s}</span>`, { r: -1.5, icone: "fa-feather-pointed" }) : "";

    const prepa = gm ? plaque("prepa", 430, 820, `<i class="fa-solid fa-file-import"></i><span><b>${T("prepa").t}</b><em>${T("prepa").s}</em></span>`, "bois") : "";
    const entrer = plaque("entrer", 660, 800, `<span class="dac-sceau"><i class="fa-solid fa-dragon"></i></span><span><b>${esc(c.entrer)} ›</b><em>${esc(c.entrerSous)}</em></span>`, "sombre");

    // La carte : image des réglages (ou carte dessinée), point rouge et trajet
    const px = parseFloat(c.pointX); const py = parseFloat(c.pointY);
    const okPoint = Number.isFinite(px) && Number.isFinite(py);
    const trajet = okPoint && (c.trajet ?? []).length
      ? `<svg class="dac-trajet" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${[...c.trajet, { x: px, y: py }].map((p) => `${(+p.x).toFixed(2)},${(+p.y).toFixed(2)}`).join(" ")}"/></svg>
         ${c.trajet.map((p) => `<i class="dac-etape" style="left:${p.x}%;top:${p.y}%"></i>`).join("")}` : "";
    const point = okPoint ? `<i class="dac-point${gm ? " deplacable" : ""}" style="left:${px}%;top:${py}%"${gm ? ` title="Glisser pour déplacer la Compagnie"` : ""}></i>${(c.coord ?? "").trim() ? `<em class="dac-lieu" style="left:${px}%;top:${py}%">${esc(c.coord)}</em>` : ""}` : "";
    const fond = c.carte ? `<img src="${esc(c.carte)}" alt="" draggable="false">` : carteDessinee(h);
    const rose = (c.boussole ?? "").trim() ? `<img class="dac-rose dac-rose-img" src="${esc(c.boussole)}" alt="" draggable="false">` : ROSE;
    const carte = `<div class="dac-carte"><span class="dac-cadre">${fond}${trajet}${point}${habillageClasse() ? `<div class="dac-deco-carto">${decor(habillageClasse())}</div>` : ""}${habillageClasse() === "pretre" ? `<span class="dac-torm-carte">${tormMedaillon()}</span>${tormFrappe()}` : ""}${rose}</span></div>`;

    const outilsMJ = Accueil.#boutons();
    const banniere = `<header class="dac-banniere">${outilsMJ}<span class="dac-ruban-g"></span><span class="dac-ruban-d"></span>
      <div class="dac-banniere-corps"><span class="dac-filet"><span>${esc(date || " ")}</span><span>${esc(c.sous)}</span></span>
      <h1>${esc(c.titre)}</h1><span class="dac-filet bas"><span>Bienvenue, ${esc(nom)}</span><span>${okPoint && (c.coord ?? "").trim() ? `${esc(c.compagnie)} est à ${esc(c.coord)}` : esc(c.compagnie)}</span></span></div></header>`;

    const mise = Accueil.#bandeau("un fanion, la bannière ou la carte");

    return `${carte}${banniere}${gm && Accueil.edition ? Accueil.#edition() : ""}${mise}
      ${fiche}${carnet}${compagnie}${cartes}${resume}${savoir}${outils}${bureau}${prepa}${entrer}
      <p class="dac-aide"><span>Cet écran revient à chaque séance · bouton livre de la barre de gauche ou Alt+U pour le rouvrir · Échap pour entrer</span></p>`;
  }

  /** Les sorts de la classe se jouent sur la carte toutes les 10 s (vidéos JB2A) ; le marteau spirituel de Torm en fait partie. */
  static arretSorts = null;
  static #torm() {
    Accueil.arretSorts?.(); Accueil.arretSorts = null;
    const el = Accueil.el; if (!el || el.classList.contains("dac-calme")) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const cl = habillageClasse(); if (!cl) return;
    if (!el.dataset.marteau) {
      el.dataset.marteau = "1";
      el.addEventListener("dac-marteau", () => {
        const z = Accueil.el?.querySelector(".dac-frappe"); if (!z) return;
        z.classList.remove("go"); void z.offsetWidth; z.classList.add("go");
        setTimeout(() => {
          const v = z.querySelector(".dac-faille"); if (v) { v.currentTime = 0; v.play().catch(() => {}); }
          const sc = Accueil.el?.querySelector(".dac-scene"); if (!sc) return;
          sc.classList.remove("dac-secousse"); void sc.offsetWidth; sc.classList.add("dac-secousse");
          setTimeout(() => sc.classList.remove("dac-secousse"), 700);
        }, 1050);
      });
    }
    Accueil.arretSorts = demarrerSorts(el, cl, monPersonnage());
  }

  /** Les décors de classe (dessinés pour 1240 × 740) suivent la taille réelle de la carte. */
  static #ajusterDecor() {
    const cadre = Accueil.el?.querySelector(".dac-carte .dac-cadre"); const d = cadre?.querySelector(".dac-deco-carto"); if (!d) return;
    const maj = () => { const w = cadre.clientWidth, h = cadre.clientHeight; if (w && h) d.style.transform = `scale(${(w / 1240).toFixed(4)}, ${(h / 740).toFixed(4)})`; };
    maj(); new ResizeObserver(maj).observe(cadre);
  }

  /** Panneau du MJ : tous les textes de l'écran (la date vient du calendrier). */
  static #edition() {
    const c = config(); const cal = dateDuJour();
    const champ = (cle, label) => `<label>${label}<input type="text" data-dac-ed="${cle}" value="${esc(c[cle] ?? "")}"></label>`;
    return `<div class="dac-edition"><h3>Les textes de l'accueil</h3>
      <div class="dac-reglages">${champ("titre", "Titre (sur le parchemin)")}${champ("sous", "Sous-titre (dans le parchemin déroulé)")}
        ${champ("compagnie", "Nom de la compagnie")}${champ("coord", "Lieu où elle se trouve (à côté du point rouge)")}
        ${champ("chapitre", "Titre de la page de gauche")}${champ("planche", "Légende de la carte")}
        ${champ("entrer", "Texte du signet")}${champ("entrerSous", "Petite ligne du signet")}
        <label class="large">Texte de la page de gauche<textarea data-dac-ed="accroche" rows="3">${esc(c.accroche ?? "")}</textarea></label></div>
      <p class="dac-consigne">Date : ${cal ? `« ${esc(cal)} », celle du calendrier` : "aucun calendrier actif"}. Les textes des onglets se règlent dans Réglages.</p>
      <label class="dac-coche"><input type="checkbox" data-dac-ed="trace" ${c.trace ? "checked" : ""}> Quand je déplace le point rouge, laisser le trajet en pointillés (${(c.trajet ?? []).length} étape(s))</label>
      <div class="dac-actions"><button type="button" class="dac-bouton" data-dac="trajet-retour"${(c.trajet ?? []).length ? "" : " disabled"}>Retirer la dernière étape</button><button type="button" class="dac-bouton" data-dac="trajet-vider"${(c.trajet ?? []).length ? "" : " disabled"}>Effacer le trajet</button>
        <button type="button" class="dac-bouton" data-dac="annuler-ed">Annuler</button><button type="button" class="dac-bouton principal" data-dac="enregistrer-ed"><i class="fa-solid fa-floppy-disk"></i> Enregistrer</button></div></div>`;
  }

  /* ---------------- Les pages ---------------- */

  static async #page(vue) {
    const c = config();
    const tete = (titre, sous) => `<header class="dac-p-tete"><button type="button" class="dac-retour" data-dac="accueil"><i class="fa-solid fa-arrow-left"></i> Retour à la table</button>
      <span class="dac-filet"><span>${esc(c.titre)}</span><span>${esc(c.sous)}</span></span><h2>${titre}</h2>${sous ? `<p class="dac-sous">${sous}</p>` : ""}</header>`;
    const h = HABILLAGES[habillage()] ?? HABILLAGES.cercle;
    if (vue === "savoir") return tete("Le savoir", "Règles et wiki des joueurs, page après page") + await Accueil.#wiki();
    if (vue === "bureau") return tete("Le bureau du MJ", "Ton wiki et tes outils") + Accueil.#outilsMJ() + await Accueil.#wiki("mj");
    if (vue === "outils") return tete("La boîte à outils", game.user.isGM ? "Les modules de la table, pour les joueurs et pour toi" : "Les modules que tu peux utiliser pendant la partie") + Accueil.#modules();
    if (vue === "prepa") return tete("Préparer la partie", "Coche les compendiums à importer : chacun arrive dans son dossier") + Accueil.#prepa();
    if (vue === "compagnie") return tete(esc(c.compagnie), "Les héros de la table") + Accueil.#compagnie();
    if (vue === "carnets") return tete("Les journaux de bord", "Ceux des joueurs") + Accueil.#listeCarnets();
    if (vue === "reglages") return tete("Réglages de l'accueil", `Habillage : ${esc(h.nom)}`) + Accueil.#reglages();
    return "";
  }

  static async #wiki(quel = "joueur") {
    const c = config(); const gm = game.user.isGM;
    const racine = game.folders.get(quel === "mj" ? c.wikiMJ : c.wiki);
    const dans = (f) => { while (f) { if (f.id === racine?.id) return true; f = f.folder; } return false; };
    const docs = racine ? game.journal.filter((j) => dans(j.folder) && (gm || j.testUserPermission(game.user, "OBSERVER"))).sort((a, b) => a.name.localeCompare(b.name, "fr")) : [];
    if (!docs.length) return `<p class="dac-vide">${quel === "mj" ? "Choisis le dossier du wiki du MJ dans les réglages." : "Le savoir est vide pour l'instant."}</p>`;
    const w = Accueil.wiki;
    if (w.quel !== quel) { w.quel = quel; w.entree = null; w.page = null; }
    const entree = docs.find((d) => d.id === w.entree) ?? docs[0]; w.entree = entree.id;
    const pages = entree.pages.contents.filter((p) => gm || p.testUserPermission(game.user, "OBSERVER")).sort((a, b) => a.sort - b.sort);
    const page = pages.find((p) => p.id === w.page) ?? pages[0]; w.page = page?.id;
    let contenu = "";
    if (page?.type === "image") contenu = `<figure><img src="${esc(page.src)}" alt=""><figcaption>${esc(page.image?.caption ?? page.name)}</figcaption></figure>`;
    else if (page) contenu = await foundry.applications.ux.TextEditor.implementation.enrichHTML(page.text?.content ?? "", { relativeTo: page, secrets: gm });
    return `<div class="dac-wiki"><nav>${docs.map((d) => `<button type="button" data-dac="wiki-entree" data-id="${d.id}" class="${d.id === entree.id ? "on" : ""}">${esc(d.name)}</button>`).join("")}</nav>
      <div class="dac-wiki-texte">${pages.length > 1 ? `<div class="dac-puces">${pages.map((p) => `<button type="button" class="dac-puce ${p.id === page?.id ? "on" : ""}" data-dac="wiki-page" data-id="${p.id}">${esc(p.name)}</button>`).join("")}</div>` : ""}
      <div class="dac-article journal-entry-page text"><div class="journal-page-content">${contenu}</div></div>
      <button type="button" class="dac-lien" data-dac="wiki-fenetre" data-id="${entree.id}"><i class="fa-solid fa-up-right-from-square"></i> Ouvrir dans une fenêtre</button></div></div>`;
  }

  static #outilsMJ() {
    const o = [["outils", "fa-toolbox", "La boîte à outils"], ["reglages", "fa-sliders", "Réglages de cet écran"], ["prepa", "fa-file-import", "Préparer la partie"]];
    return `<div class="dac-outils">${o.map(([a, i, t]) => `<button type="button" class="dac-bouton" data-dac="${a}"><i class="fa-solid ${i}"></i> ${t}</button>`).join("")}</div><h3>Le wiki du MJ</h3>`;
  }

  static #modules() {
    const d = modulesDisponibles(); const gm = game.user.isGM;
    const oeil = (x) => gm && x.qui === "tous" ? `<button type="button" class="dac-oeil${x.pourJoueurs ? " vu" : ""}" data-dac="module-voir" data-i="${x.i}" title="${x.pourJoueurs ? "Visible par les joueurs : cliquer pour le cacher" : "Caché aux joueurs : cliquer pour le montrer"}"><i class="fa-solid ${x.pourJoueurs ? "fa-eye" : "fa-eye-slash"}"></i></button>` : "";
    const fin = (x) => x.action ? `<button type="button" class="dac-bouton" data-dac="module" data-i="${x.i}">Ouvrir</button>` : `<small>Automatique</small>`;
    const carte = (x) => `<div class="dac-module${x.action ? "" : " auto"}${gm && x.qui === "tous" && !x.pourJoueurs ? " cache" : ""}"><i class="fa-solid ${x.icone}"></i><span><b>${esc(x.nom)}</b><em>${esc(x.desc)}</em></span>${fin(x)}${oeil(x)}</div>`;
    const bloc = (titre, l) => l.length ? `<h3>${titre}</h3><div class="dac-modules">${l.map(carte).join("")}</div>` : "";
    const aide = gm ? `<p class="dac-sous">L'œil choisit ce que les joueurs voient dans leur boîte à outils (barré = caché aux joueurs).</p>` : "";
    return aide + (bloc(gm ? "Pour les joueurs (et toi)" : "À ouvrir", d.tous) + bloc("Pour le MJ", d.mj) + bloc("Ce qui marche tout seul", d.auto)
      || `<p class="dac-sous">Aucun module de la table n'est activé.</p>`);
  }

  static #prepa() {
    const packs = game.packs.filter((p) => p.metadata.packageType !== "system" && CONST.FOLDER_DOCUMENT_TYPES.includes(p.documentName));
    const groupes = {};
    for (const p of packs) {
      const titre = p.metadata.packageType === "world" ? "Ce monde" : (game.modules.get(p.metadata.packageName)?.title ?? p.metadata.packageName);
      (groupes[titre] ??= []).push(p);
    }
    const deja = (p) => game.folders.some((f) => f.getFlag(ID, "pack") === p.collection);
    const html = Object.entries(groupes).sort(([a], [b]) => (a === "Ce monde" ? -1 : b === "Ce monde" ? 1 : a.localeCompare(b, "fr"))).map(([g, ps]) =>
      `<fieldset><legend>${esc(g)}</legend>${ps.map((p) => `<label><input type="checkbox" data-pack="${esc(p.collection)}"> ${esc(p.title)} <small>${esc(game.i18n.localize(`DOCUMENT.${p.documentName}s`) || p.documentName)} · ${p.index.size}</small>${deja(p) ? " <em>déjà dans le monde</em>" : ""}</label>`).join("")}</fieldset>`).join("");
    return `<div class="dac-prepa">${html || "<p class='dac-vide'>Aucun compendium à importer.</p>"}</div>
      <div class="dac-actions"><button type="button" class="dac-bouton principal" data-dac="importer"><i class="fa-solid fa-file-import"></i> Importer la sélection</button></div><p class="dac-message"></p>`;
  }

  static #compagnie() {
    const ps = personnages();
    if (!ps.length) return `<p class="dac-vide">Aucun personnage joueur.</p>`;
    return `<div class="dac-galerie">${ps.map((a) => { const s = stats(a); return `<button type="button" class="dac-vignette" data-dac="acteur" data-id="${a.id}"><img src="${esc(a.img)}" alt=""><b>${esc(a.name)}</b><em>${esc([s.espece, s.classes].filter(Boolean).join(" · "))}</em><code>Niv. ${s.niv} · PV ${s.pv}${s.pvMax ? `/${s.pvMax}` : ""} · CA ${s.ca}</code></button>`; }).join("")}</div>`;
  }

  static #listeCarnets() {
    const js = carnets();
    if (!js.length) return `<p class="dac-vide">Choisis le dossier des journaux de bord dans les réglages.</p>`;
    const proprietaire = (j) => game.users.filter((u) => !u.isGM && j.testUserPermission(u, "OWNER")).map((u) => u.character?.name || u.name).join(", ");
    return `<div class="dac-galerie">${js.map((j) => `<button type="button" class="dac-vignette livre" data-dac="journal" data-id="${j.id}"><span class="dac-livre"><i class="fa-solid fa-book"></i></span><b>${esc(j.name)}</b><em>${esc(proprietaire(j) || "—")}</em><code>${j.pages.size} page(s)</code></button>`).join("")}</div>`;
  }

  static #reglages() {
    const c = config();
    const scenes = [...game.scenes].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const dossiers = (type) => game.folders.filter((f) => f.type === type).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const opt = (liste, sel, nom = (x) => x.name) => `<option value="">—</option>` + liste.map((x) => `<option value="${x.id}" ${x.id === sel ? "selected" : ""}>${esc(nom(x))}</option>`).join("");
    const lieu = (s) => `${s.name}${s.folder ? ` (${s.folder.name})` : ""}`;
    const champ = (cle, label) => `<label>${label}<input type="text" data-dac-reglage="${cle}" value="${esc(c[cle])}"></label>`;
    const sel = (cle, label, type) => `<label>${label}<select data-dac-reglage="${cle}">${opt(dossiers(type), c[cle], lieu)}</select></label>`;
    return `<div class="dac-reglages">
        ${champ("titre", "Titre")}${champ("sous", "Sous-titre")}
        <label class="large">Image de la carte de la région (vide : carte provisoire dessinée)<span class="dac-fichier"><input type="text" data-dac-reglage="carte" value="${esc(c.carte)}"><button type="button" class="dac-bouton" data-dac="choisir-carte" aria-label="Choisir l'image"><i class="fa-solid fa-folder-open"></i></button></span></label>
        <label class="large">Image de la boussole (PNG ou WebP à fond transparent ; vide : boussole dessinée)<span class="dac-fichier"><input type="text" data-dac-reglage="boussole" value="${esc(c.boussole ?? "")}"><button type="button" class="dac-bouton" data-dac="choisir-boussole" aria-label="Choisir l'image"><i class="fa-solid fa-folder-open"></i></button></span></label>
        <label class="large">Image du symbole de Torm (habillage prêtre ; vide : gantelet dessiné)<span class="dac-fichier"><input type="text" data-dac-reglage="torm" value="${esc(c.torm ?? "")}"><button type="button" class="dac-bouton" data-dac="choisir-torm" aria-label="Choisir l'image"><i class="fa-solid fa-folder-open"></i></button></span></label>
        <label>… ou prendre le fond d'une scène<select data-dac="fond-scene"><option value="">—</option>${scenes.map((s) => `<option value="${s.id}">${esc(lieu(s))}</option>`).join("")}</select></label>
        ${champ("coord", "Lieu où est la Compagnie")}
        ${sel("persos", "Personnages joueurs : dossier (vide = ceux attribués aux joueurs)", "Actor")}
        ${sel("carnets", "Journaux de bord : dossier", "JournalEntry")}
        ${sel("wiki", "Le savoir (wiki des joueurs) : dossier", "JournalEntry")}
        ${sel("wikiMJ", "Wiki du MJ : dossier", "JournalEntry")}
      </div>
      <h3>Les textes des onglets</h3>
      <p class="dac-consigne">Vide = texte d'origine (en gris). Jetons possibles : {nom} le personnage, {n} le nombre, {compagnie} le nom de la compagnie, {nouveau} les pages nouvelles du journal.</p>
      <div class="dac-textes">${Object.keys(ONGLETS).map((k) => `<span>${esc(NOMS_ONGLETS[k])}</span><input type="text" data-dac-texte="${k}.t" value="${esc(c.textes?.[k]?.t ?? "")}" placeholder="${esc(ONGLETS[k].t)}"><input type="text" data-dac-texte="${k}.s" value="${esc(c.textes?.[k]?.s ?? "")}" placeholder="${esc(ONGLETS[k].s)}">`).join("")}</div>
      <h3>Les cartes (onglets de la vision)</h3>
      <p class="dac-consigne">Les joueurs les voient sans changer de scène : ne coche que celles qu'ils peuvent connaître.</p>
      <div class="dac-cartes-liste">${scenes.map((s) => `<label><input type="checkbox" data-dac-carte="${s.id}" ${c.cartes.includes(s.id) ? "checked" : ""}> ${esc(lieu(s))}</label>`).join("")}</div>
      <div class="dac-actions"><button type="button" class="dac-bouton" data-dac="deviner"><i class="fa-solid fa-wand-magic-sparkles"></i> Retrouver d'après les noms</button><button type="button" class="dac-bouton principal" data-dac="enregistrer"><i class="fa-solid fa-floppy-disk"></i> Enregistrer</button></div><p class="dac-message"></p>`;
  }

  /* ---------------- La vision (une scène dans un encadré) ---------------- */

  static ouvrirVision(titre, scenes) {
    const ids = scenes.filter((id) => game.scenes.get(id));
    if (!ids.length) return ui.notifications.warn("Aucune carte à montrer : vois les réglages de l'écran d'accueil.");
    Accueil.vision = { titre, scenes: ids, i: 0 };
    Accueil.afficher();
  }

  static fermerVision() { Accueil.vision = null; Accueil.afficher(); }

  static #vision() {
    const v = Accueil.vision;
    const s = game.scenes.get(v.scenes[v.i]); if (!s) return "";
    const onglets = v.scenes.length > 1 ? `<div class="dac-onglets">${v.scenes.map((id, i) => `<button type="button" data-dac="onglet" data-i="${i}" class="${i === v.i ? "on" : ""}">${esc(joliNom(game.scenes.get(id)?.navName || game.scenes.get(id)?.name))}</button>`).join("")}</div>` : "";
    return `<div class="dac-vision-voile" data-dac="fermer-vision"></div><div class="dac-vision">
      <div class="dac-vision-tete"><b>${esc(v.titre)}</b><span>vue sans quitter la table</span></div>${onglets}
      <div class="dac-vision-cadre">${Accueil.#plateau(s)}</div>
      <div class="dac-vision-pied"><span>Molette : zoom · glisser : déplacer · double-clic : recentrer</span>
        ${game.user.isGM ? `<button type="button" class="dac-bouton" data-dac="amener" data-scene="${s.id}"><i class="fa-solid fa-people-arrows"></i> Amener les joueurs</button>` : ""}
        <button type="button" class="dac-bouton" data-dac="aller" data-scene="${s.id}">Aller sur la scène (pour moi seul)</button>
        <button type="button" class="dac-bouton principal" data-dac="fermer-vision">Fermer</button></div></div>`;
  }

  /** La scène telle qu'elle est : fond + tuiles visibles aux mêmes places (en v14, x / y d'une tuile = son centre). */
  static #plateau(ps) {
    const d = ps.dimensions ?? {};
    const SW = d.sceneWidth || ps.width || 1920; const SH = d.sceneHeight || ps.height || 1080;
    const X0 = d.sceneX ?? 0; const Y0 = d.sceneY ?? 0;
    const pc = (v, t) => `${((v / t) * 100).toFixed(3)}%`;
    const media = (src, style = "") => /\.(webm|mp4|m4v|ogv)(\?|$)/i.test(src)
      ? `<video src="${esc(src)}" autoplay loop muted playsinline style="${style}"></video>` : `<img src="${esc(src)}" alt="" draggable="false" style="${style}">`;
    const tuiles = [...ps.tiles].filter((t) => !t.hidden && t.texture?.src).sort((a, b) => (a.elevation ?? 0) - (b.elevation ?? 0) || (a.sort ?? 0) - (b.sort ?? 0)).map((t) => {
      const gx = t.x - t.width * (t.texture?.anchorX ?? 0.5); const gy = t.y - t.height * (t.texture?.anchorY ?? 0.5);
      const style = `left:${pc(gx - X0, SW)};top:${pc(gy - Y0, SH)};width:${pc(t.width, SW)};height:${pc(t.height, SH)};${t.rotation ? `transform:rotate(${t.rotation}deg);` : ""}`;
      const im = media(t.texture.src, `opacity:${t.alpha ?? 1};`);
      const actions = (t.flags?.["monks-active-tiles"]?.actions ?? []).filter((a) => ["scene", "openactor", "openjournal"].includes(a.action));
      if (!actions.length || t.flags?.["monks-active-tiles"]?.active === false) return `<span class="dac-tuile" style="${style}" aria-hidden="true">${im}</span>`;
      const nom = joliNom(actions.map((a) => a.data?.sceneid?.name ?? a.data?.entity?.name).find(Boolean) ?? "Ouvrir");
      return `<button type="button" class="dac-tuile active" data-dac="tuile" data-scene="${ps.id}" data-tuile="${t.id}" style="${style}" aria-label="${esc(nom)}" data-tooltip="${esc(nom)}">${im}</button>`;
    }).join("");
    return `<div class="dac-plateau" data-w="${SW}" data-h="${SH}">${media(fondScene(ps))}${tuiles}</div>`;
  }

  static #zoom() {
    const cadre = Accueil.el?.querySelector(".dac-vision-cadre"); const pl = cadre?.querySelector(".dac-plateau");
    if (!pl) return;
    const k = Math.min(cadre.clientWidth / Number(pl.dataset.w), cadre.clientHeight / Number(pl.dataset.h)) || 0;
    pl.style.width = `${Math.round(Number(pl.dataset.w) * k)}px`; pl.style.height = `${Math.round(Number(pl.dataset.h) * k)}px`;
    const v = { s: 1, x: 0, y: 0 };
    const appliquer = () => { pl.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.s})`; cadre.classList.toggle("zoom", v.s > 1); };
    cadre.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      const s = Math.min(6, Math.max(1, v.s * (ev.deltaY < 0 ? 1.2 : 1 / 1.2)));
      v.x *= s / v.s; v.y *= s / v.s; v.s = s; if (s === 1) { v.x = 0; v.y = 0; }
      appliquer();
    }, { passive: false });
    let prise = null;
    cadre.addEventListener("pointerdown", (ev) => { if (v.s <= 1 || ev.target.closest(".dac-tuile.active")) return; prise = { x: ev.clientX - v.x, y: ev.clientY - v.y }; cadre.setPointerCapture(ev.pointerId); });
    cadre.addEventListener("pointermove", (ev) => { if (prise) { v.x = ev.clientX - prise.x; v.y = ev.clientY - prise.y; appliquer(); } });
    cadre.addEventListener("pointerup", () => { prise = null; });
    cadre.addEventListener("dblclick", () => { v.s = 1; v.x = 0; v.y = 0; appliquer(); });
  }

  /* ---------------- Glisser (MJ) ---------------- */

  static #placer() {
    const scene = Accueil.el?.querySelector(".dac-scene"); if (!scene) return;
    const pos = positions();
    for (const e of scene.querySelectorAll(BLOCS)) { const p = pos[cleBloc(e)]; if (p) { e.style.left = `${p.x}px`; e.style.top = `${p.y}px`; } }
    scene.classList.toggle("dac-disposer", !!Accueil.disposer);
  }

  static #glisserBloc(ev) {
    if (!Accueil.disposer || ev.button !== 0 || ev.target.closest(".dac-editer, .dac-bandeau, .dac-point, .dac-edition")) return;
    const scene = Accueil.el.querySelector(".dac-scene");
    const bloc = [...scene.querySelectorAll(BLOCS)].find((b) => b.contains(ev.target)); if (!bloc) return;
    const k = scene.getBoundingClientRect().width / W || 1;
    const x0 = ev.clientX; const y0 = ev.clientY; const l0 = bloc.offsetLeft; const t0 = bloc.offsetTop;
    let bouge = false; let x = l0; let y = t0;
    const bouger = (e) => {
      if (!bouge && Math.hypot(e.clientX - x0, e.clientY - y0) < 5) return;
      if (!bouge) { bouge = true; bloc.classList.add("dac-prise"); }
      x = Math.round(Math.min(W - 40, Math.max(-bloc.offsetWidth + 40, l0 + (e.clientX - x0) / k)));
      y = Math.round(Math.min(H - 30, Math.max(-20, t0 + (e.clientY - y0) / k)));
      bloc.style.left = `${x}px`; bloc.style.top = `${y}px`;
    };
    const lacher = async () => {
      window.removeEventListener("pointermove", bouger); window.removeEventListener("pointerup", lacher);
      if (!bouge) return;
      bloc.classList.remove("dac-prise");
      Accueil.sansClic = true; setTimeout(() => { Accueil.sansClic = false; }, 300);
      await placerBloc(cleBloc(bloc), x, y);
    };
    window.addEventListener("pointermove", bouger); window.addEventListener("pointerup", lacher);
  }

  /** Le MJ fait glisser le point rouge ; l'ancienne position devient une étape du trajet (si l'option est cochée). */
  static #glisserPoint(ev) {
    const point = ev.target.closest?.(".dac-point.deplacable"); if (!point || !game.user.isGM || ev.button !== 0) return;
    ev.preventDefault(); ev.stopPropagation();
    const cadre = point.parentElement; const lieu = cadre.querySelector(".dac-lieu");
    const c = config(); const depart = { x: parseFloat(c.pointX), y: parseFloat(c.pointY) };
    let x = depart.x; let y = depart.y; let bouge = false;
    const bouger = (e) => {
      const b = cadre.getBoundingClientRect(); bouge = true;
      x = Math.min(100, Math.max(0, (e.clientX - b.left) / b.width * 100)); y = Math.min(100, Math.max(0, (e.clientY - b.top) / b.height * 100));
      for (const n of [point, lieu]) { if (!n) continue; n.style.left = `${x}%`; n.style.top = `${y}%`; }
    };
    const lacher = async () => {
      window.removeEventListener("pointermove", bouger); window.removeEventListener("pointerup", lacher);
      point.classList.remove("prise");
      if (!bouge || Math.hypot(x - depart.x, y - depart.y) < 0.5) return;
      Accueil.sansClic = true; setTimeout(() => { Accueil.sansClic = false; }, 300);
      const trajet = [...(c.trajet ?? [])];
      if (c.trace) { trajet.push({ x: +depart.x.toFixed(2), y: +depart.y.toFixed(2) }); while (trajet.length > 20) trajet.shift(); }
      await enregistrer({ pointX: x.toFixed(2), pointY: y.toFixed(2), trajet });
    };
    point.classList.add("prise");
    window.addEventListener("pointermove", bouger); window.addEventListener("pointerup", lacher);
  }

  /* ---------------- Actions ---------------- */

  static async marquerVu(j) {
    if (!j) return;
    const vus = foundry.utils.deepClone(game.user.getFlag(ID, "vus") ?? {});
    vus[j.id] = j.pages.map((p) => p.id);
    await game.user.setFlag(ID, "vus", vus);
  }

  static #ouvrirActeur(a) {
    if (!a) return;
    if (a.testUserPermission(game.user, "LIMITED")) return a.sheet.render(true);
    return new foundry.applications.apps.ImagePopout({ src: a.img, window: { title: a.name } }).render(true);
  }

  static async #tuile(sceneId, tuileId) {
    const t = game.scenes.get(sceneId)?.tiles.get(tuileId);
    for (const a of t?.flags?.["monks-active-tiles"]?.actions ?? []) {
      const d = a.data ?? {};
      if (a.action === "scene") {
        const cible = idDe(d.sceneid); if (!game.scenes.get(cible)) continue;
        const v = Accueil.vision; const i = v.scenes.indexOf(cible);
        if (i >= 0) v.i = i; else { v.scenes.push(cible); v.i = v.scenes.length - 1; }
        return Accueil.afficher();
      }
      if (a.action === "openactor") Accueil.#ouvrirActeur(game.actors.get(idDe(d.entity)));
      if (a.action === "openjournal") {
        const j = game.journal.get(idDe(d.entity));
        if (j?.testUserPermission(game.user, "LIMITED")) j.sheet.render(true, d.page ? { pageId: d.page } : {});
      }
    }
  }

  static async #clic(ev) {
    if (Accueil.sansClic) { Accueil.sansClic = false; ev.preventDefault(); ev.stopPropagation(); return; }
    const b = ev.target.closest("[data-dac]"); if (!b) return;
    if (b.tagName === "SELECT") return;
    const a = b.dataset.dac;
    // En mise en place, les fanions ne s'ouvrent pas (seuls les boutons du bandeau et du crayon marchent)
    if (Accueil.disposer && b.closest(".dac-onglet, .dac-signet, .dac-miniature, .dac-fanion, .dac-plaque") && !["disposer", "pos-defaut"].includes(a)) return;
    ev.preventDefault(); ev.stopPropagation();
    const c = config();
    switch (a) {
      case "accueil": return Accueil.afficher("accueil");
      case "entrer": return Accueil.fermer();
      case "fiche": return Accueil.#ouvrirActeur(monPersonnage());
      case "groupe": case "compagnie": return Accueil.afficher("compagnie");
      case "aucun": return ui.notifications.info("Le MJ attribue les personnages dans la configuration des joueurs.");
      case "acteur": return Accueil.#ouvrirActeur(game.actors.get(b.dataset.id));
      case "carnet": { const j = monCarnet(monPersonnage()); if (!j) return; j.sheet.render(true); await Accueil.marquerVu(j); return Accueil.afficher(); }
      case "journal": return game.journal.get(b.dataset.id)?.sheet.render(true);
      case "cartes": return Accueil.ouvrirVision("Les cartes", c.cartes);
      case "onglet": Accueil.vision.i = Number(b.dataset.i); return Accueil.afficher();
      case "tuile": return Accueil.#tuile(b.dataset.scene, b.dataset.tuile);
      case "fermer-vision": return Accueil.fermerVision();
      case "aller": { const s = game.scenes.get(b.dataset.scene); Accueil.fermer(); return s?.view(); }
      case "amener": {
        const id = b.dataset.scene; const joueurs = game.users.filter((u) => u.active && !u.isGM);
        for (const u of joueurs) game.socket.emit("pullToScene", id, u.id);
        ui.notifications.info(`${joueurs.length} joueur(s) amené(s) sur « ${game.scenes.get(id)?.name} ».`);
        Accueil.fermer(); return game.scenes.get(id)?.view();
      }
      case "resume": { const t = outilResume(); return t?.onChange?.(new PointerEvent("click"), true); }
      case "module": return lancerModule(Number(b.dataset.i));
      case "module-voir": {
        if (!game.user.isGM) return;
        const k = cleModule(MODULES[Number(b.dataset.i)]); const v = new Set(vusParJoueurs());
        v.has(k) ? v.delete(k) : v.add(k);
        await game.settings.set(ID, "outilsJoueurs", [...v]); return Accueil.afficher();
      }
      case "disposer": Accueil.disposer = !Accueil.disposer; Accueil.edition = false; return Accueil.afficher("accueil");
      case "pos-defaut": { const d = foundry.utils.deepClone(game.settings.get(ID, "dispo") ?? {}); d[style()] = {}; await game.settings.set(ID, "dispo", d); return Accueil.afficher(); }
      case "pos-joueurs": {
        if (!game.user.isGM) return;
        const pj = foundry.utils.deepClone(config().positionsJoueurs ?? {}); pj[style()] = foundry.utils.deepClone(positions());
        await enregistrer({ positionsJoueurs: pj }); ui.notifications.info("Les joueurs qui n'ont pas disposé leur écran voient maintenant ta disposition."); return Accueil.afficher();
      }
      case "pos-joueurs-vider": { const pj = foundry.utils.deepClone(config().positionsJoueurs ?? {}); pj[style()] = {}; await enregistrer({ positionsJoueurs: pj }); return Accueil.afficher(); }
      case "style": await game.settings.set(ID, "style", b.dataset.style); return Accueil.afficher();
      case "editer": Accueil.edition = !Accueil.edition; Accueil.disposer = false; return Accueil.afficher();
      case "annuler-ed": Accueil.edition = false; return Accueil.afficher();
      case "enregistrer-ed": {
        if (!game.user.isGM) return;
        const maj = {};
        for (const i of Accueil.el.querySelectorAll("[data-dac-ed]")) maj[i.dataset.dacEd] = i.type === "checkbox" ? i.checked : i.value.trim();
        Accueil.edition = false;
        await enregistrer(maj); return Accueil.afficher();
      }
      case "trajet-retour": { const t = [...(c.trajet ?? [])]; const p = t.pop(); if (!p) return; await enregistrer({ trajet: t, pointX: String(p.x), pointY: String(p.y) }); return Accueil.afficher(); }
      case "trajet-vider": await enregistrer({ trajet: [] }); return Accueil.afficher();
      case "savoir": case "outils": case "bureau": case "prepa": case "carnets": case "reglages":
        if (a === "savoir") Accueil.wiki.quel = "";
        return Accueil.afficher(a);
      case "wiki-entree": Accueil.wiki.entree = b.dataset.id; Accueil.wiki.page = null; return Accueil.afficher();
      case "wiki-page": Accueil.wiki.page = b.dataset.id; return Accueil.afficher();
      case "wiki-fenetre": return game.journal.get(b.dataset.id)?.sheet.render(true);
      case "importer": return Accueil.#importer();
      case "choisir-torm": {
        const champ = Accueil.el.querySelector('[data-dac-reglage="torm"]');
        const FP = foundry.applications.apps.FilePicker.implementation;
        return new FP({ type: "image", current: champ.value, callback: (chemin) => { champ.value = chemin; } }).render(true);
      }
      case "choisir-boussole": {
        const champ = Accueil.el.querySelector('[data-dac-reglage="boussole"]');
        const FP = foundry.applications.apps.FilePicker.implementation;
        return new FP({ type: "image", current: champ.value, callback: (chemin) => { champ.value = chemin; } }).render(true);
      }
      case "choisir-carte": {
        const champ = Accueil.el.querySelector('[data-dac-reglage="carte"]');
        const FP = foundry.applications.apps.FilePicker.implementation;
        return new FP({ type: "image", current: champ.value, callback: (chemin) => { champ.value = chemin; } }).render(true);
      }
      case "deviner": await enregistrer(deviner()); return Accueil.afficher();
      case "enregistrer": {
        const r = Accueil.el; const maj = {};
        for (const i of r.querySelectorAll("[data-dac-reglage]")) maj[i.dataset.dacReglage] = i.value;
        maj.cartes = [...r.querySelectorAll("[data-dac-carte]")].filter((i) => i.checked).map((i) => i.dataset.dacCarte);
        maj.textes = {};
        for (const i of r.querySelectorAll("[data-dac-texte]")) { const [k, ch] = i.dataset.dacTexte.split("."); if (i.value.trim()) (maj.textes[k] ??= {})[ch] = i.value.trim(); }
        await enregistrer(maj);
        ui.notifications.info("Écran d'accueil enregistré.");
        return Accueil.afficher();
      }
    }
  }

  static async #importer() {
    const r = Accueil.el; const msg = r.querySelector(".dac-message");
    const choix = [...r.querySelectorAll("[data-pack]")].filter((i) => i.checked).map((i) => game.packs.get(i.dataset.pack)).filter(Boolean);
    if (!choix.length) { msg.textContent = "Coche au moins un compendium."; return; }
    msg.textContent = "Import en cours…";
    let n = 0;
    for (const p of choix) {
      let f = game.folders.find((x) => x.getFlag(ID, "pack") === p.collection);
      f ??= await Folder.implementation.create({ name: p.title, type: p.documentName, flags: { [ID]: { pack: p.collection } } });
      const docs = await p.importAll({ folderId: f.id });
      n += docs?.length ?? 0;
    }
    ui.notifications.info(`${n} élément(s) importé(s), chacun dans le dossier de son compendium.`);
    return Accueil.afficher();
  }
}

/* ================================================================== */
/*  Branchements                                                       */
/* ================================================================== */

const pageCalme = () => Accueil.el && Accueil.vue === "accueil" && !Accueil.vision && !Accueil.edition;

Hooks.once("init", () => {
  game.settings.register(ID, "config", { scope: "world", config: false, type: Object, default: {}, onChange: () => { if (pageCalme()) Accueil.afficher(); } });
  game.settings.register(ID, "ecranAccueil", {
    name: "Écran d'accueil à chaque session", hint: "La table du cartographe s'ouvre au lancement pour les joueurs et le MJ. Elle se rouvre à tout moment par le bouton carte de la barre de gauche (ou Alt+U).",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(ID, "outilsJoueurs", { scope: "world", config: false, type: Array, default: null });
  const redessiner = () => { if (Accueil.el) Accueil.afficher(); };
  game.settings.register(ID, "styleDefaut", {
    name: "Style de l'accueil par défaut", hint: "Le style que voient les joueurs tant qu'ils n'en ont pas choisi un (bouton en haut de l'écran d'accueil).",
    scope: "world", config: true, type: String, default: "grimoire", choices: STYLES, onChange: redessiner
  });
  game.settings.register(ID, "style", {
    name: "Mon style d'accueil", hint: "Le grimoire enluminé ou la table du cartographe, pour ton écran seulement.",
    scope: "client", config: true, type: String, default: "", choices: { "": "Celui choisi par le MJ", ...STYLES }, onChange: redessiner
  });
  game.settings.register(ID, "classe", {
    name: "Habillage de mon accueil", hint: "Pour le grimoire comme pour la table du cartographe. Par défaut, celui de la classe de ton personnage (rôdeur, barbare, ensorceleur, barde, prêtre). Pour ton écran seulement.",
    scope: "client", config: true, type: String, default: "", choices: { "": "Selon la classe de mon personnage", aucun: "Aucun (violet et or)", ...CLASSES }, onChange: redessiner
  });
  game.settings.register(ID, "animations", {
    name: "Animations de l'accueil", hint: "Feuilles qui tombent, sang qui coule, éclairs, notes qui s'envolent, lumière sacrée. Pour ton écran seulement.",
    scope: "client", config: true, type: Boolean, default: true, onChange: redessiner
  });
  game.settings.register(ID, "tailleLivre", {
    name: "Taille du grimoire (ou de la carte)", hint: "En %, pour ton écran seulement. Les onglets et le signet suivent le livre.",
    scope: "client", config: true, type: Number, range: { min: 50, max: 130, step: 5 }, default: 100, onChange: redessiner
  });
  game.settings.register(ID, "tailleOnglets", {
    name: "Taille des onglets (ou des fanions)", hint: "En %, pour ton écran seulement.",
    scope: "client", config: true, type: Number, range: { min: 40, max: 130, step: 5 }, default: 80, onChange: redessiner
  });
  game.settings.register(ID, "taille", {
    name: "Taille du parchemin et du signet", hint: "Le parchemin du titre (ou la bannière) et le signet (ou les plaques), en %, pour ton écran seulement.",
    scope: "client", config: true, type: Number, range: { min: 40, max: 130, step: 5 }, default: 80, onChange: redessiner
  });
  game.settings.register(ID, "dispo", { scope: "client", config: false, type: Object, default: {}, onChange: redessiner });
  game.keybindings.register(ID, "basculer", { name: "Ouvrir / fermer l'écran d'accueil", editable: [{ key: "KeyU", modifiers: ["Alt"] }], onDown: () => { Accueil.basculer(); return true; } });
});

Hooks.once("ready", async () => {
  if (game.user === game.users.activeGM) {
    const c = game.settings.get(ID, "config") ?? {};
    // v0.9 : les images privées (boussole, Torm) ne sont plus dans le module, mais dans le dossier du monde
    const maj = {};
    for (const [k, f] of [["boussole", "boussole.webp"], ["torm", "torm.webp"]]) if (String(c[k] ?? "").startsWith(`modules/${ID}/assets/`)) maj[k] = imagePrivee(f);
    if (Object.keys(maj).length) await game.settings.set(ID, "config", { ...c, ...maj });
    if (!c.initialise) {
      try { await game.settings.set(ID, "config", { ...defauts(), ...deviner(), ...c, initialise: true }); } catch (err) { console.error(`${ID} | premier réglage`, err); }
    }
  }
  const mod = game.modules.get(ID);
  if (mod) mod.api = { ouvrir: (vue) => Accueil.ouvrir(vue), fermer: () => Accueil.fermer(), basculer: () => Accueil.basculer(), vision: (titre, scenes) => { Accueil.ouvrir(); Accueil.ouvrirVision(titre, scenes); } };
  if (game.settings.get(ID, "ecranAccueil")) Accueil.ouvrir();
});

Hooks.on("getSceneControlButtons", (controls) => {
  const outils = controls?.tokens?.tools; if (!outils) return;
  outils["dnd5e-accueil-cercle-de-pierre-bouton"] = { name: "dnd5e-accueil-cercle-de-pierre-bouton", title: "Le grimoire (écran d'accueil)", icon: "fa-solid fa-book-open", order: 86, toggle: true, visible: true, active: !!Accueil.el, onChange: (event, on) => (on ? Accueil.ouvrir() : Accueil.fermer()) };
  outils["dnd5e-accueil-cercle-de-pierre-reglages"] = { name: "dnd5e-accueil-cercle-de-pierre-reglages", title: "Réglages du grimoire", icon: "fa-solid fa-sliders", order: 88, button: true, visible: true, onChange: () => ouvrirReglages({ id: ID, titre: "Réglages du grimoire", couleur: "#c9a227", icone: "fa-solid fa-book-open" }) };
});

window.addEventListener("resize", foundry.utils.debounce(() => { if (Accueil.el) Accueil.vision ? Accueil.afficher() : Accueil.echelle(); }, 200));
for (const h of ["updateActor", "createJournalEntryPage", "deleteJournalEntryPage", "updateWorldTime", "updateUser"]) Hooks.on(h, foundry.utils.debounce(() => { if (pageCalme()) Accueil.afficher(); }, 150));
