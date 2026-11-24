/**
 * Réglages rapides d'un écran d'accueil, ouverts depuis la barre d'outils de gauche.
 * Chacun voit ses réglages d'écran (portée client / utilisateur) ; le MJ ou Gardien voit en plus
 * les réglages de la table (portée monde) et les fenêtres de configuration du module.
 */

const esc = (v) => foundry.utils.escapeHTML ? foundry.utils.escapeHTML(String(v ?? "")) : String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const loc = (v) => (v ? game.i18n.localize(String(v)) : "");

/** Réglages visibles du module, rangés en « mes réglages » et « réglages de la table ». */
function reglagesDu(id) {
  const moi = [];
  const table = [];
  for (const s of game.settings.settings.values()) {
    if (s.namespace !== id || !s.config) continue;
    if (s.scope === "world") {
      if (game.user.isGM) table.push(s);
    } else moi.push(s);
  }
  const menus = [...game.settings.menus.values()].filter((m) => m.namespace === id && (!m.restricted || game.user.isGM));
  return { moi, table, menus };
}

function typeDe(s) {
  const t = s.type;
  if (t === Boolean || t?.name === "Boolean" || t instanceof foundry.data.fields.BooleanField) return "bool";
  if (t === Number || t?.name === "Number" || t instanceof foundry.data.fields.NumberField) return "num";
  return "str";
}

function champ(s) {
  const nom = `${s.namespace}.${s.key}`;
  const val = game.settings.get(s.namespace, s.key);
  const titre = esc(loc(s.name) || s.key);
  const aide = s.hint ? `<p class="ra-aide">${esc(loc(s.hint))}</p>` : "";
  const type = typeDe(s);
  let entree;
  if (type === "bool") {
    entree = `<input type="checkbox" name="${nom}" data-type="bool" ${val ? "checked" : ""}>`;
    return `<div class="ra-ligne ra-case"><label>${entree}<span class="ra-titre">${titre}</span></label>${aide}</div>`;
  }
  if (s.choices) {
    const opts = Object.entries(s.choices).map(([k, v]) => `<option value="${esc(k)}" ${String(val) === k ? "selected" : ""}>${esc(loc(v))}</option>`).join("");
    entree = `<select name="${nom}" data-type="${type}">${opts}</select>`;
  } else if (type === "num" && s.range) {
    const { min = 0, max = 100, step = 1 } = s.range;
    entree = `<span class="ra-curseur"><input type="range" name="${nom}" data-type="num" min="${min}" max="${max}" step="${step}" value="${Number(val)}"><output>${Number(val)}</output></span>`;
  } else if (type === "num") {
    entree = `<input type="number" name="${nom}" data-type="num" value="${Number(val)}">`;
  } else {
    entree = `<input type="text" name="${nom}" data-type="str" value="${esc(val)}">`;
  }
  return `<div class="ra-ligne"><label><span class="ra-titre">${titre}</span>${entree}</label>${aide}</div>`;
}

/**
 * Ouvre la fenêtre des réglages de l'accueil.
 * @param {object} o
 * @param {string} o.id        Identifiant du module.
 * @param {string} o.titre     Titre de la fenêtre.
 * @param {string} [o.couleur] Couleur d'accent (habillage du module).
 * @param {string} [o.icone]   Icône Font Awesome de la fenêtre.
 */
export async function ouvrirReglages({ id, titre = "Réglages de l'accueil", couleur = "#c9a227", icone = "fa-solid fa-sliders" }) {
  const { moi, table, menus } = reglagesDu(id);
  const mj = game.user.isGM ? "MJ" : "joueur";
  const gardien = game.system.id === "CoC7" ? "Gardien" : "MJ";
  const bloc = (titreBloc, sous, liste) => liste.length ? `<section class="ra-bloc"><h3>${titreBloc}</h3><p class="ra-sous">${sous}</p>${liste.map(champ).join("")}</section>` : "";
  const boutonsMenus = menus.length ? `<section class="ra-bloc"><h3>Configuration avancée</h3>${menus.map((m) => `<button type="button" class="ra-menu" data-menu="${esc(`${m.namespace}.${m.key}`)}"><i class="${esc(m.icon || "fa-solid fa-gear")}"></i> ${esc(loc(m.name) || loc(m.label))}</button>`).join("")}</section>` : "";
  const vide = !moi.length && !table.length && !menus.length ? `<p class="ra-sous">Aucun réglage pour ce module.</p>` : "";
  const content = `<div class="ra-corps" style="--ra-accent:${esc(couleur)}">
    ${bloc("Mes réglages", "Pour ton écran seulement : chaque joueur règle le sien.", moi)}
    ${bloc(`Réglages de la table (${gardien})`, "Valent pour tout le monde.", table)}
    ${boutonsMenus}${vide}
  </div>`;

  const DialogV2 = foundry.applications.api.DialogV2;
  await DialogV2.wait({
    window: { title: titre, icon: icone },
    classes: ["ra-reglages-accueil", `ra-${mj}`],
    position: { width: 500 },
    content,
    rejectClose: false,
    render: (event, dialog) => {
      const el = dialog?.element ?? event?.target?.element;
      if (!el) return;
      el.querySelectorAll(".ra-curseur input").forEach((r) => r.addEventListener("input", () => { r.nextElementSibling.value = r.value; }));
      el.querySelectorAll(".ra-menu").forEach((b) => b.addEventListener("click", () => {
        const m = game.settings.menus.get(b.dataset.menu);
        if (m?.type) new m.type().render(true);
      }));
    },
    buttons: [
      {
        action: "ok", label: "Enregistrer", icon: "fa-solid fa-floppy-disk", default: true,
        callback: async (event, button) => {
          const form = button.form;
          for (const input of form.querySelectorAll("[name][data-type]")) {
            const [ns, ...rest] = input.name.split(".");
            const key = rest.join(".");
            const t = input.dataset.type;
            const v = t === "bool" ? input.checked : t === "num" ? Number(input.value) : input.value;
            if (v !== game.settings.get(ns, key)) await game.settings.set(ns, key, v);
          }
          ui.notifications.info("Réglages de l'accueil enregistrés.");
        }
      },
      { action: "annuler", label: "Annuler", icon: "fa-solid fa-xmark" }
    ]
  });
}

/** Feuille de style de la fenêtre (injectée une seule fois). */
function style() {
  if (document.getElementById("ra-reglages-accueil-css")) return;
  const css = document.createElement("style");
  css.id = "ra-reglages-accueil-css";
  css.textContent = `
.ra-reglages-accueil .ra-corps { display: flex; flex-direction: column; gap: 10px; max-height: 70vh; overflow-y: auto; padding-right: 4px; }
.ra-reglages-accueil .ra-bloc { border: 1px solid var(--ra-accent); border-radius: 6px; padding: 8px 10px; background: color-mix(in srgb, var(--ra-accent) 8%, transparent); }
.ra-reglages-accueil .ra-bloc h3 { margin: 0 0 2px; border: 0; color: var(--ra-accent); font-size: 1.05rem; }
.ra-reglages-accueil .ra-sous { margin: 0 0 6px; font-size: .8rem; opacity: .75; font-style: italic; }
.ra-reglages-accueil .ra-ligne { margin: 6px 0; }
.ra-reglages-accueil .ra-ligne > label { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ra-reglages-accueil .ra-case > label { justify-content: flex-start; }
.ra-reglages-accueil .ra-titre { font-weight: 600; }
.ra-reglages-accueil .ra-ligne select, .ra-reglages-accueil .ra-ligne input[type=text], .ra-reglages-accueil .ra-ligne input[type=number] { flex: 0 0 52%; max-width: 52%; }
.ra-reglages-accueil .ra-curseur { flex: 0 0 52%; display: flex; align-items: center; gap: 6px; }
.ra-reglages-accueil .ra-curseur input { flex: 1 1 auto; accent-color: var(--ra-accent); }
.ra-reglages-accueil .ra-curseur output { flex: 0 0 2.6em; text-align: right; font-variant-numeric: tabular-nums; }
.ra-reglages-accueil .ra-aide { margin: 2px 0 0; font-size: .78rem; opacity: .7; line-height: 1.25; }
.ra-reglages-accueil .ra-menu { display: flex; align-items: center; gap: 6px; width: 100%; margin: 4px 0; border-color: var(--ra-accent); }
`;
  document.head.append(css);
}
Hooks.once("ready", style);
