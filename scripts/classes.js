/**
 * Décors par classe posés sur le grimoire (1240 × 740, pages 0–620 et 620–1240).
 * Tout est en SVG / HTML dessiné, sans image. Les animations se coupent avec la classe .dac-calme.
 */

const JB2A = "modules/JB2A_DnD5e/Library";
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/** Image du symbole de Torm choisie dans les réglages (vide : gantelet dessiné). */
let TORM_IMG = "";
export const choisirTorm = (chemin) => { TORM_IMG = String(chemin ?? "").trim(); };
const jb2a = () => !!game.modules.get("JB2A_DnD5e")?.active;

/** Petit hasard reproductible (même dessin à chaque affichage). */
function hasard(graine) { let s = graine >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Une éclaboussure : tache irrégulière et gouttelettes autour. */
function eclaboussure(cx, cy, r, graine, couleur = "#7a0c08", op = .78) {
  const h = hasard(graine); const n = 16; const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const rr = r * (.62 + h() * .5); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) { const p = pts[(i + 1) % n]; const q = pts[i]; const mx = (p[0] + q[0]) / 2; const my = (p[1] + q[1]) / 2; d += `Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`; }
  let gouttes = "";
  for (let i = 0; i < 14; i++) { const a = h() * Math.PI * 2; const dd = r * (1.1 + h() * 1.3); const gr = r * (.04 + h() * .12); gouttes += `<circle cx="${(cx + Math.cos(a) * dd).toFixed(1)}" cy="${(cy + Math.sin(a) * dd).toFixed(1)}" r="${gr.toFixed(1)}"/>`; }
  for (let i = 0; i < 5; i++) { const a = h() * Math.PI * 2; const l = r * (1 + h() * .9); gouttes += `<path d="M${cx} ${cy}L${(cx + Math.cos(a) * l).toFixed(1)} ${(cy + Math.sin(a) * l).toFixed(1)}" stroke="${couleur}" stroke-width="${(r * .09).toFixed(1)}" stroke-linecap="round"/>`; }
  return `<g fill="${couleur}" opacity="${op}"><path d="${d}Z"/>${gouttes}</g>`;
}

/** Feuille (rôdeuse). */
const feuille = (x, y, rot, t = 1, c = "#5f8f3a") => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${t})"><path d="M0 0C10 -18 34 -22 52 -8C34 6 12 10 0 0Z" fill="${c}" stroke="#2f4a1e" stroke-width="1.2"/><path d="M0 0L48 -8" stroke="#2f4a1e" stroke-width="1"/></g>`;

/** Gantelet de Torm (main droite levée, paume en avant). */
const GANTELET = `<g stroke="#5a4210" stroke-width="3" stroke-linejoin="round">
  <path d="M-58 70L-52 150H52L58 70Z" fill="url(#torm-or)"/>
  <path d="M-46 92H46M-48 114H48M-50 134H50" fill="none"/>
  <path d="M-52 72C-56 30 -54 -6 -48 -40H48C54 -6 56 30 52 72Z" fill="url(#torm-or)"/>
  <rect x="-46" y="-120" width="20" height="86" rx="10" fill="url(#torm-or)"/>
  <rect x="-22" y="-142" width="20" height="108" rx="10" fill="url(#torm-or)"/>
  <rect x="2" y="-136" width="20" height="102" rx="10" fill="url(#torm-or)"/>
  <rect x="26" y="-112" width="20" height="80" rx="10" fill="url(#torm-or)"/>
  <path d="M-48 10C-70 -4 -88 -26 -92 -46C-94 -58 -82 -64 -74 -54C-62 -38 -54 -24 -44 -14Z" fill="url(#torm-or)"/>
  <path d="M-46 -90H-26M-22 -110H-2M2 -104H22M26 -84H46M-46 -64H-26M-22 -72H-2M2 -70H22M26 -60H46" fill="none" stroke-width="2"/>
  <circle cx="0" cy="20" r="14" fill="#2f5aa8" stroke="#fff4c0" stroke-width="3"/></g>`;

export function decor(cl) {
  const svg = (contenu, defs = "") => `<svg class="dac-deco-svg" viewBox="-100 -150 1440 1040" aria-hidden="true"><defs>${defs}</defs>${contenu}</svg>`;
  switch (cl) {
    case "rodeur": {
      const boue = [[90, 600, 70, 11], [200, 680, 40, 12], [1180, 640, 55, 13], [560, 30, 30, 14]].map(([x, y, r, g]) => eclaboussure(x, y, r, g, "#5a4026", .42)).join("");
      const traces = `<g opacity=".35" fill="#4b3520"><ellipse cx="300" cy="700" rx="70" ry="14" transform="rotate(-8 300 700)"/><ellipse cx="960" cy="712" rx="90" ry="12" transform="rotate(4 960 712)"/></g>`;
      const feuilles = feuille(40, 60, 30, 1.2) + feuille(70, 90, 80, .9, "#7fb04a") + feuille(1170, 690, -150, 1.3, "#8a6a2a") + feuille(1200, 650, -100, 1, "#5f8f3a") + feuille(520, 700, -20, 1, "#a07a2a") + feuille(30, 400, 110, .9, "#7fb04a");
      const fleche = `<g class="dac-fleche">
        <ellipse cx="1150" cy="114" rx="16" ry="6" fill="rgba(0,0,0,.35)"/>
        <path d="M1150 112l-14 -6M1150 112l-6 14M1150 112l12 9M1150 112l16 -2" stroke="#6b5030" stroke-width="1.6"/>
        <line x1="1164" y1="124" x2="1404" y2="-56" stroke="rgba(0,0,0,.35)" stroke-width="11" stroke-linecap="round"/>
        <line x1="1150" y1="112" x2="1390" y2="-68" stroke="url(#fut)" stroke-width="11" stroke-linecap="round"/>
        <g transform="translate(1366 -50) rotate(-36.9) scale(1.6)"><path d="M0 0L40 -16L58 -16L18 0Z" fill="#4f7a26" stroke="#2a3d18"/><path d="M0 0L40 16L58 16L18 0Z" fill="#6f9a3a" stroke="#2a3d18"/><path d="M0 0L44 0" stroke="#e8e0c0" stroke-width="2"/></g>
        <path d="M1340 -30l12 -9M1332 -24l12 -9" stroke="#2a3d18" stroke-width="4"/></g>`;
      const tombe = Array.from({ length: 7 }, (_, i) => `<i class="dac-feuille-tombe" style="left:${80 + i * 170}px;animation-delay:${(i * 1.9).toFixed(1)}s;animation-duration:${(11 + (i % 3) * 2.5).toFixed(1)}s;--c:${["#5f8f3a", "#7fb04a", "#a07a2a", "#8a6a2a"][i % 4]}"></i>`).join("");
      return svg(boue + traces + feuilles + fleche, `<linearGradient id="fut" x1="0" x2="1"><stop offset="0" stop-color="#8a6438"/><stop offset=".5" stop-color="#c9a06a"/><stop offset="1" stop-color="#7a5a32"/></linearGradient>`) + `<div class="dac-anim">${tombe}</div>`;
    }
    case "barbare": {
      const taches = [[560, 90, 46, 1], [70, 650, 34, 2], [1185, 420, 28, 3], [660, 690, 22, 4], [-10, 160, 30, 5], [1250, 60, 26, 6]].map(([x, y, r, g]) => eclaboussure(x, y, r, g)).join("");
      const main = `<g fill="#6a0a06" opacity=".55" transform="translate(470 610) rotate(-18)"><path d="M0 0C-6 -30 -2 -52 10 -54C18 -55 20 -40 18 -22C24 -46 30 -66 42 -64C52 -62 48 -40 42 -18C50 -40 60 -56 70 -52C80 -48 72 -26 64 -6C72 -22 82 -32 90 -26C98 -20 86 2 74 18C64 40 40 56 18 50C6 46 2 30 0 0Z"/></g>`;
      const coulures = [[1240, 0, 80], [620, 0, 60], [300, 0, 46]].map(([x, y, l], i) => `<g class="dac-coulure" style="animation-delay:${i * 2.3}s"><path d="M${x - 5} ${y}h10v${l}a5 5 0 0 1 -10 0z" fill="#7a0c08" opacity=".85"/><circle class="dac-goutte" cx="${x}" cy="${y + l + 8}" r="5" fill="#7a0c08"/></g>`).join("");
      return svg(taches + main + coulures);
    }
    case "ensorceleur": {
      const eclair = (pts, i) => `<g class="dac-eclair" style="animation-delay:${i * 1.3}s"><polyline points="${pts}" fill="none" stroke="#c9a0ff" stroke-width="9" opacity=".35" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></g>`;
      const e = [
        "-30,40 60,90 30,140 130,200 100,250 210,320",
        "1270,80 1190,150 1225,200 1130,260 1165,300 1060,380",
        "640,-30 600,60 650,110 590,200 630,240 580,330",
        "-20,700 90,640 70,600 190,560 170,520 280,480",
        "1260,720 1160,650 1190,610 1080,570 1110,530 980,500"
      ].map(eclair).join("");
      const sceau = `<g class="dac-sceau-tournant" fill="none" stroke="#ff8a3a" stroke-width="2" opacity=".45"><circle cx="310" cy="560" r="92"/><circle cx="310" cy="560" r="76"/><path d="M310 468L364 634L224 532H396L256 634Z"/></g>`;
      const braises = Array.from({ length: 12 }, (_, i) => `<i class="dac-braise" style="left:${40 + i * 100}px;animation-delay:${(i * .8).toFixed(1)}s;animation-duration:${(5 + (i % 4)).toFixed(1)}s"></i>`).join("");
      // Brûlures sur les pages (bords roussis)
      const brulures = `<g opacity=".55">${[[600, 720, 70], [1240, 330, 55], [0, 520, 60], [930, 0, 50]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#roussi)"/>`).join("")}</g>`;
      // Flammèches sur la tranche basse, les coins et le dos du livre (immobiles si les animations sont coupées)
      const lieux = [[40, 740], [110, 742], [190, 738], [300, 744], [420, 740], [540, 742], [700, 740], [820, 744], [960, 738], [1080, 742], [1190, 740], [-14, 600], [1254, 560], [-14, 300], [1254, 200], [620, 744]];
      const flammes = lieux.map(([x, y], i) => `<i class="dac-flamme" style="left:${x}px;top:${y}px;--t:${(.7 + (i % 4) * .18).toFixed(2)};animation-delay:${(i * .23).toFixed(2)}s"></i>`).join("");
      const boule = jb2a() ? "" : `<i class="dac-boule"><i class="dac-boule-queue"></i></i>`;
      return svg(brulures + sceau, `<radialGradient id="roussi"><stop offset="0" stop-color="#2a0e04" stop-opacity=".9"/><stop offset=".45" stop-color="#6a2a08" stop-opacity=".6"/><stop offset="1" stop-color="#a0581a" stop-opacity="0"/></radialGradient>`)
        + `<div class="dac-flammes">${flammes}</div><div class="dac-anim">${braises}${boule}</div>`;
    }
    case "barde": {
      const portee = (y0, x0, x1, ondule, id) => { let p = ""; for (let k = 0; k < 5; k++) p += `<path d="M${x0} ${y0 + k * 9}C${x0 + (x1 - x0) * .33} ${y0 + k * 9 - ondule} ${x0 + (x1 - x0) * .66} ${y0 + k * 9 + ondule} ${x1} ${y0 + k * 9}"/>`; return `<g id="${id}" fill="none" stroke="#b8913c" stroke-width="1.4" opacity=".55">${p}</g>`; };
      const notes = (liste) => liste.map(([x, y, n, r]) => `<text x="${x}" y="${y}" font-size="34" fill="#1d2f5a" opacity=".55" transform="rotate(${r} ${x} ${y})">${n}</text>`).join("");
      const contenu = portee(640, 50, 590, 14, "p1") + notes([[90, 660, "𝄞", 0], [160, 655, "♪", -4], [230, 670, "♫", 3], [320, 648, "♩", -2], [410, 664, "♬", 4], [500, 652, "♪", -3]])
        + portee(70, 660, 1200, 10, "p2") + notes([[700, 92, "𝄞", 0], [790, 84, "♫", 2], [880, 98, "♪", -3], [980, 80, "♬", 3], [1080, 94, "♩", -2]])
        + `<g fill="#6a1f4a" opacity=".3"><text x="40" y="420" font-size="44" transform="rotate(-18 40 420)">♫</text><text x="1190" y="560" font-size="40" transform="rotate(14 1190 560)">♪</text></g>`;
      const volantes = Array.from({ length: 8 }, (_, i) => `<i class="dac-note" style="left:${120 + i * 140}px;animation-delay:${(i * 1.4).toFixed(1)}s;animation-duration:${(7 + (i % 3) * 1.5).toFixed(1)}s">${["♪", "♫", "♩", "♬"][i % 4]}</i>`).join("");
      return svg(contenu) + `<div class="dac-anim">${volantes}</div>`;
    }
    case "pretre": {
      const defs = `<linearGradient id="torm-or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#8a6a1c"/></linearGradient>`;
      const filigrane = TORM_IMG ? `<image class="dac-torm-svg" href="${esc(TORM_IMG)}" x="250" y="470" width="120" height="230" opacity=".22"/>` : `<g class="dac-torm-svg" transform="translate(310 590) scale(.62)" opacity=".2">${GANTELET}</g>`;
      const coins = [[34, 34, 0], [1206, 34, 90], [1206, 706, 180], [34, 706, 270]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})" fill="none" stroke="#d4af37" stroke-width="3"><path d="M0 46V0H46"/><path d="M10 36V10H36" stroke-width="1.6"/><circle cx="0" cy="0" r="6" fill="#d4af37"/></g>`).join("");
      return `<div class="dac-halo"></div>` + svg(filigrane + coins, defs) + `<span class="dac-torm-livre">${tormMedaillon()}</span>`;
    }
  }
  return "";
}


/** Médaillon rond de Torm (gantelet), avec le cercle de runes de Soins (JB2A) qui tourne derrière. */
export function tormMedaillon() {
  const halo = jb2a() ? `<video class="dac-torm-halo" src="${JB2A}/1st_Level/Cure_Wounds/CureWounds_01_Blue_400x400.webm" autoplay loop muted playsinline></video>` : "";
  const dessin = `<svg viewBox="-110 -165 220 330" aria-hidden="true">${GANTELET.replaceAll("url(#torm-or)", "#e2bf55")}</svg>`;
  const image = TORM_IMG ? `<img src="${esc(TORM_IMG)}" alt="Symbole de Torm" draggable="false">` : dessin;
  return `<span class="dac-torm">${halo}<span class="dac-torm-rond${TORM_IMG ? " image" : ""}">${image}</span></span>`;
}

/** Arme spirituelle de Torm : le marteau (JB2A) frappe le centre de la carte, failles dorées (JB2A). */
export function tormFrappe() {
  const failles = `<svg class="dac-failles" viewBox="-100 -100 200 200" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="rgba(255,236,160,.9)" stroke-width="5" filter="blur(1.5px)"><path d="M0 0L-20 -34L-14 -60L-30 -88"/><path d="M0 0L36 -18L64 -12L90 -30"/><path d="M0 0L28 36L22 66L44 90"/><path d="M0 0L-38 20L-66 14L-92 34"/><path d="M0 0L-6 40L-24 70"/></g><g stroke="#2a1c08" stroke-width="2.2"><path d="M0 0L-20 -34L-14 -60L-30 -88M-14 -60L4 -72"/><path d="M0 0L36 -18L64 -12L90 -30M64 -12L74 6"/><path d="M0 0L28 36L22 66L44 90M22 66L4 80"/><path d="M0 0L-38 20L-66 14L-92 34M-66 14L-76 -4"/><path d="M0 0L-6 40L-24 70"/></g></g></svg>`;
  if (!jb2a()) return `<span class="dac-frappe sans-jb2a">${failles}<span class="dac-eclat"></span></span>`;
  return `<span class="dac-frappe"><video class="dac-faille" src="${JB2A}/Generic/Impact/GroundCrackFrostImpact_01_Regular_White_600x600.webm" muted playsinline preload="auto"></video>
    ${failles}<span class="dac-eclat"></span><span class="dac-marteau"><video src="${JB2A}/2nd_Level/Spiritual_Weapon/SpiritualWeapon_Maul01_02_Spectral_Green_400x400.webm" autoplay loop muted playsinline></video></span></span>`;
}

/* ================================================================== */
/*  Sorts et aptitudes de chaque classe, joués sur la carte (JB2A)     */
/* ================================================================== */

const L = (p) => `${JB2A}/${p}`;
/**
 * Un sort : nom affiché, ids (identifiants ou noms dnd5e qui l'activent s'ils sont sur la fiche), étapes.
 * Étape : t (ms après le début), type "zone" (vidéo centrée sur la cible ou le centre) ou "trait" (projectile depuis le bord),
 * src, taille (fraction de la largeur de la carte), w / h (taille de la vidéo de trait), decal (décalage en px), secousse, special.
 */
const SORTS = {
  rodeur: [
    { nom: "Marque du chasseur", ids: ["marque-du-chasseur", "hunters-mark"], etapes: [{ t: 0, type: "zone", src: L("1st_Level/Hunters_Mark/HuntersMark_01_Regular_Green_Pulse_200x200.webm"), taille: .32 }] },
    { nom: "Tir de l'archère", ids: ["archery", "archerie"], etapes: [{ t: 0, type: "trait", src: L("Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_Green_15ft_1000x400.webm"), w: 1000, h: 400 }, { t: 450, type: "trait", src: L("Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_Green_15ft_1000x400.webm"), w: 1000, h: 400, decal: 14 }, { t: 1100, type: "zone", src: L("1st_Level/Hunters_Mark/HuntersMark_01_Regular_Green_Pulse_200x200.webm"), taille: .22 }] },
    { nom: "Frappe piégeuse", ids: ["frappe-piegieuse", "frappe-piegeuse", "ensnaring-strike"], etapes: [{ t: 0, type: "trait", src: L("Generic/Weapon_Attacks/Ranged/Arrow01_01_Regular_Green_15ft_1000x400.webm"), w: 1000, h: 400 }, { t: 650, type: "zone", src: L("1st_Level/Entangle/Entangle02_02_Regular_Green_500x500.webm"), taille: .55 }] },
    { nom: "Passage sans trace", ids: ["passage-sans-trace", "pass-without-trace"], etapes: [{ t: 0, type: "zone", centre: true, src: L("Generic/Fireflies/Fireflies_01_Green_Many01_400x400.webm"), taille: .75 }] },
    { nom: "Soin des blessures", ids: ["soin-des-blessures", "cure-wounds"], etapes: [{ t: 0, type: "zone", src: L("1st_Level/Cure_Wounds/CureWounds_01_Blue_400x400.webm"), taille: .45 }] }
  ],
  barbare: [
    { nom: "Rage du berserker", ids: ["rage-barbare", "rage"], etapes: [{ t: 0, type: "zone", centre: true, src: L("Generic/Impact/GroundCrackImpact_02_Regular_Orange_600x600.webm"), taille: .8, secousse: 900 }, { t: 250, type: "zone", centre: true, src: L("Generic/Liquid/LiquidSplash02_01_Regular_Red_500x500.webm"), taille: .5 }] },
    { nom: "Coup de hache à deux mains", ids: ["style-de-combat--arme-a-deux-mains-guerrier-paladin", "extra-attack", "attaque-supplementaire"], etapes: [{ t: 0, type: "zone", src: L("Generic/Weapon_Attacks/Melee/GreatAxe01_01_Regular_White_800x600.webm"), taille: .7 }, { t: 700, type: "zone", src: L("Generic/Liquid/LiquidSplash02_01_Regular_Red_500x500.webm"), taille: .45, secousse: 450 }] },
    { nom: "Frénésie", ids: ["frenesie-barbare-berserker", "frenzy"], etapes: [{ t: 0, type: "zone", src: L("Generic/Weapon_Attacks/Melee/GenericWhirlwind01_01_Regular_Orange_800x600.webm"), taille: .75 }, { t: 600, type: "zone", src: L("Generic/Liquid/LiquidSplashSide02_01_Regular_Red_600x600.webm"), taille: .5, secousse: 400 }] },
    { nom: "Attaques sauvages", ids: ["attaques-sauvages", "savage-attacker"], etapes: [{ t: 0, type: "zone", src: L("Generic/Creature/Claw/CreatureAttackClaw_002_001_Red_800x600.webm"), taille: .7, secousse: 350 }, { t: 500, type: "zone", src: L("Generic/Liquid/LiquidSplash02_01_Regular_Red_500x500.webm"), taille: .4 }] }
  ],
  ensorceleur: [
    { nom: "Boule de feu", ids: ["fireball", "boule-de-feu"], etapes: [{ t: 0, type: "trait", src: L("3rd_Level/Fireball/FireballBeam_01_Orange_30ft_1600x400.webm"), w: 1600, h: 400 }, { t: 1500, type: "zone", src: L("3rd_Level/Fireball/FireballExplosion_01_Orange_800x800.webm"), taille: .85, secousse: 900 }] },
    { nom: "Trait de feu", ids: ["fire-bolt", "trait-de-feu"], etapes: [{ t: 0, type: "trait", src: L("Cantrip/Fire_Bolt/FireBolt_01_Regular_Orange_15ft_1000x400.webm"), w: 1000, h: 400 }, { t: 650, type: "zone", src: L("Generic/Impact/ImpactFire01_01_Regular_Orange_600x600.webm"), taille: .35 }] },
    { nom: "Rayon ardent", ids: ["scorching-ray", "rayon-ardent"], etapes: [0, 260, 520].map((t, i) => ({ t, type: "trait", src: L("2nd_Level/Scorching_Ray/ScorchingRay_01_Regular_Orange_15ft_1000x400.webm"), w: 1000, h: 400, decal: (i - 1) * 22 })) },
    { nom: "Projectile magique", ids: ["magic-missile", "projectile-magique"], etapes: ["01", "02", "03"].map((n, i) => ({ t: i * 200, type: "trait", src: L(`1st_Level/Magic_Missile/MagicMissile_01_Regular_Purple_15ft_${n}_1000x400.webm`), w: 1000, h: 400, decal: (i - 1) * 18 })) },
    { nom: "Ténèbres", ids: ["darkness", "tenebres"], etapes: [{ t: 0, type: "zone", src: L("2nd_Level/Darkness/Darkness_01_Black_600x600.webm"), taille: .7, op: .75 }] },
    { nom: "Mains brûlantes", ids: ["burning-hands", "mains-brulantes"], etapes: [{ t: 0, type: "zone", src: L("Generic/Template/Cone/Breath_Weapon/Breathweapon02_Fire01_Regular_Orange_Cone_Burst_800x800.webm"), taille: .8 }] }
  ],
  barde: [
    { nom: "Inspiration bardique", ids: ["inspiration-bardique-barde-d8", "bardic-inspiration"], etapes: [{ t: 0, type: "zone", centre: true, src: L("1st_Level/Bardic_Inspiration/BardicInspiration_01_Regular_GreenOrange_400x400.webm"), taille: .5 }] },
    { nom: "Murmure dissonant", ids: ["murmure-dissonant", "dissonant-whispers", "moquerie-cruelle", "vicious-mockery"], etapes: [{ t: 0, type: "zone", src: L("Generic/Template/Circle/TemplateMusicNoteCircle_01_Regular_Blue_800x800.webm"), taille: .6 }] },
    { nom: "Projectile magique", ids: ["magic-missile", "projectile-magique"], etapes: ["01", "02", "03"].map((n, i) => ({ t: i * 200, type: "trait", src: L(`1st_Level/Magic_Missile/MagicMissile_01_Regular_Purple_15ft_${n}_1000x400.webm`), w: 1000, h: 400, decal: (i - 1) * 18 })) },
    { nom: "Sommeil", ids: ["sommeil", "sleep"], etapes: [{ t: 0, type: "zone", src: L("1st_Level/Sleep/Cloud01_01_Regular_Pink_400x400.webm"), taille: .55 }, { t: 600, type: "zone", src: L("1st_Level/Sleep/SleepSymbol01_01_Regular_Pink_400x400.webm"), taille: .3 }] },
    { nom: "Lumières dansantes", ids: ["lumieres-dansantes", "dancing-lights"], etapes: [-60, 0, 60].map((d, i) => ({ t: i * 250, type: "zone", src: L("Cantrip/Dancing_Lights/DancingLights_01_BlueYellow_200x200.webm"), taille: .16, decal: d * 1.6 })) },
    { nom: "Mot de guérison", ids: ["mot-de-guerison", "healing-word"], etapes: [{ t: 0, type: "zone", src: L("Generic/Healing/HealingAbility_01_Green_400x400.webm"), taille: .4 }] }
  ],
  pretre: [
    { nom: "Arme spirituelle", ids: ["spiritual-weapon", "arme-spirituelle"], special: "marteau", etapes: [] },
    { nom: "Flamme sacrée", ids: ["flamme-sacree", "sacred-flame"], etapes: [{ t: 0, type: "zone", src: L("Cantrip/Sacred_Flame/SacredFlameTarget_01_Regular_Yellow_400x400.webm"), taille: .4 }] },
    { nom: "Balisage", ids: ["balisage", "guiding-bolt"], etapes: [{ t: 0, type: "trait", src: L("1st_Level/Guiding_Bolt/GuidingBolt_01_Regular_BlueYellow_15ft_1000x400.webm"), w: 1000, h: 400 }, { t: 750, type: "zone", src: L("2nd_Level/Divine_Smite/DivineSmite_01_Regular_BlueYellow_Target_400x400.webm"), taille: .4 }] },
    { nom: "Bénédiction", ids: ["benediction", "bless"], etapes: [{ t: 0, type: "zone", centre: true, src: L("1st_Level/Bless/Bless_01_Regular_Yellow_Intro_400x400.webm"), taille: .55 }] },
    { nom: "Mot de guérison de groupe", ids: ["mot-de-guerison-de-groupe", "mass-healing-word", "mot-de-guerison"], etapes: [{ t: 0, type: "zone", centre: true, src: L("Generic/Healing/HealingAbility_01_Yellow_400x400.webm"), taille: .6 }] },
    { nom: "Impact divin", ids: ["divine-strike", "impact-divin"], etapes: [{ t: 0, type: "zone", src: L("2nd_Level/Divine_Smite/DivineSmite_01_Regular_BlueYellow_Target_400x400.webm"), taille: .45, secousse: 400 }] }
  ]
};

/** Les sorts de la classe que le personnage possède (identifiant ou nom), sinon tous. */
function sortsDe(cl, perso) {
  const liste = SORTS[cl] ?? [];
  if (!perso?.items) return liste;
  const cles = new Set(); for (const i of perso.items) { if (i.system?.identifier) cles.add(i.system.identifier); cles.add(String(i.name ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }
  const miens = liste.filter((s) => s.ids.some((id) => cles.has(id)));
  return miens.length >= 2 ? miens : liste;
}

/** Joue un sort dans le cadre de la carte. */
function jouerSort(el, sort) {
  const cadre = el.querySelector(".dac-cadre"); if (!cadre) return;
  const W = cadre.clientWidth; const H = cadre.clientHeight; if (!W || !H) return;
  if (sort.special === "marteau") return el.dispatchEvent(new CustomEvent("dac-marteau"));
  const couche = document.createElement("div"); couche.className = "dac-sorts"; cadre.append(couche);
  const nom = document.createElement("div"); nom.className = "dac-sort-nom"; nom.textContent = sort.nom; couche.append(nom);
  const cible = { x: W * (.3 + Math.random() * .4), y: H * (.3 + Math.random() * .4) };
  const cote = Math.random() < .5 ? -1 : 1; // le projectile part du bord gauche ou droit, en bas
  const depart = { x: cote < 0 ? -W * .08 : W * 1.08, y: H * (.75 + Math.random() * .3) };
  let fin = 0;
  for (const e of sort.etapes) {
    fin = Math.max(fin, e.t + 4000);
    setTimeout(() => {
      const v = document.createElement("video"); v.src = e.src; v.muted = true; v.autoplay = true; v.playsInline = true; v.className = "dac-sort-video";
      if (e.type === "trait") {
        const dx = cible.x - depart.x; const dy = cible.y - depart.y + (e.decal ?? 0); const d = Math.hypot(dx, dy);
        const larg = d * e.w / (e.w - 400); const haut = larg * e.h / e.w; const ox = larg * 200 / e.w; // le projectile part à 200 px du bord gauche
        Object.assign(v.style, { left: `${depart.x - ox}px`, top: `${depart.y - haut / 2}px`, width: `${larg}px`, height: `${haut}px`, transformOrigin: `${ox}px 50%`, transform: `rotate(${Math.atan2(dy, dx)}rad)` });
      } else {
        const t = W * (e.taille ?? .4); const c = e.centre ? { x: W / 2, y: H / 2 } : cible;
        Object.assign(v.style, { left: `${c.x - t / 2 + (e.decal ?? 0)}px`, top: `${c.y - t / 2}px`, width: `${t}px`, height: `${t}px` });
      }
      if (e.op) v.style.opacity = String(e.op);
      couche.append(v); v.play?.().catch(() => {});
      v.addEventListener("ended", () => v.remove()); setTimeout(() => v.remove(), 7000);
      if (e.secousse) { const sc = el.querySelector(".dac-scene"); sc?.classList.remove("dac-secousse"); void sc?.offsetWidth; sc?.classList.add("dac-secousse"); setTimeout(() => sc?.classList.remove("dac-secousse"), e.secousse); }
    }, e.t);
  }
  setTimeout(() => couche.remove(), fin + 500);
}

/** Lance les sorts de la classe en boucle (un toutes les 10 s, jamais deux fois le même de suite). Renvoie la fonction d'arrêt. */
export function demarrerSorts(el, cl, perso) {
  if (!jb2a()) { if (cl !== "pretre") return () => {}; }
  const liste = jb2a() ? sortsDe(cl, perso) : (SORTS.pretre.filter((s) => s.special));
  if (!liste.length) return () => {};
  let dernier = -1;
  const suivant = () => { if (!el.isConnected) return; let i = Math.floor(Math.random() * liste.length); if (liste.length > 1 && i === dernier) i = (i + 1) % liste.length; dernier = i; jouerSort(el, liste[i]); };
  const debut = setTimeout(suivant, 2500); const boucle = setInterval(suivant, 10000);
  return () => { clearTimeout(debut); clearInterval(boucle); };
}
