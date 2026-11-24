# État — dnd5e-accueil-cercle-de-pierre

## v0.1.0 (24/11/2026)
- Consigne de Stéphane : accueil de ses deux mondes D&D 5e sur le modèle de `coc7-accueil-une` (Montagnes Hallucinées). Style B retenu : **la table du cartographe**. Demande de Stéphane : un module distinct par monde ; celui-ci est pour « Le Cercle de Pierre » (monde `dans-le-maelstrom-dassignes`), habillage violet et or, comme les visuels de la Guerre des Drows. Module jumeau : dnd5e-accueil-faerun.
- Fond transparent : la scène d'arrivée reste visible (DEPART / Accueil). Calque z-index 70, sous les fenêtres.
- Carte de la région au centre : image choisie dans les réglages (sélecteur de fichiers, ou fond d'une scène), sinon carte provisoire dessinée en SVG. Stéphane fournit les images.
- Point rouge = où est la Compagnie, déplaçable par le MJ ; l'ancienne position devient une étape du trajet en pointillés (option, 20 étapes au plus, « retirer la dernière étape », « effacer le trajet »). Pas de fil rouge.
- Fanions (hampe dorée, drap à pointes) : ma fiche (médaillon, espèce · classe, PV, CA, niveau) ou les héros (MJ) ; mon journal de bord (pages nouvelles) ou les journaux (MJ) ; la Compagnie ; les cartes (vision) ; la dernière séance (resume-hebdo) ; le savoir (wiki des joueurs) ; la boîte à outils ; le bureau du MJ. Plaques : préparer la partie (MJ), entrer dans l'aventure.
- Bannière : titre, sous-titre, date (Mini Calendar via `game.time`, ou date libre), « Bienvenue, X », lieu de la Compagnie. Crayon (MJ) pour tout changer sur place ; bouton mise en place pour déplacer fanions, bannière et carte (positions enregistrées dans le monde).
- Premier lancement (MJ) : personnages = dossier « LES JOUEURS » sinon ceux attribués / possédés par les joueurs (sans « Le Groupe » ni les tas d'objets) ; journaux = dossier « VOTRE JOURNAL DE BORD » / « Journal des Joueurs » ; savoir = dossier racine contenant « règle » ; cartes = scènes « … Joueurs » et « Royaumes Oubliés ».
- Polices : Cinzel et Cinzel Decorative (comme Critiques épiques), EB Garamond (OFL).
- Réglage client « Taille des fanions » (50–100 %, 80 % par défaut). Raccourci Alt+U. Bouton carte dans la barre de gauche.
- À faire : images des cartes par Stéphane ; dépôt GitHub (à créer par Stéphane).

## v0.2.0 (24/11/2026)
- Stéphane a demandé d'autres visuels plus « fantasy » (deux séries de maquettes) et a choisi d'essayer **le grimoire enluminé**, avec le titre en haut sur un **parchemin qui se déroule au survol**.
- Parchemin : roulé, il montre le titre ; déroulé (survol, focus ou panneau d'édition ouvert) : date du calendrier, « La Bande à DD est à Ossington », sous-titre.
- Livre ouvert (couverture pourpre, coins dorés) : page de gauche = titre de chronique avec lettrine (UnifrakturCook), texte d'accroche, portrait / trombinoscope (ouvre la fiche ou la page de la compagnie), « Bienvenue, X » ; page de droite = carte en planche avec point rouge, trajet et légende.
- Accès = onglets de cuir sur la tranche (chiffres romains, dorés pour le MJ) ; entrer = signet rouge sous le livre.
- **Tous les textes se règlent** (sauf la date, reliée au calendrier) : crayon = titre, sous-titre, nom de la compagnie (« La Bande à DD » par défaut), lieu, titre de page, texte de page, légende de la carte, signet ; Réglages = titre et ligne de chaque onglet (jetons {nom}, {n}, {compagnie}, {nouveau}).
- La date libre est retirée (calendrier uniquement). Mise en place : parchemin, livre, onglets, signet.
- Aperçu vérifié hors Foundry (capture headless) côté joueur et MJ. Habillage Faerûn inchangé (module séparé).

## v0.3.0 (24/11/2026)
- Demandes de Stéphane : régler la taille du grimoire et des onglets ; séparer MJ et joueurs (ce que le MJ déplace ou réduit changeait aussi chez les joueurs) ; garder les deux thèmes, chaque joueur choisit le sien.
- **Deux styles** dans le module : grimoire enluminé et table du cartographe (habillage violet et or, fanions aux textes réglables comme les onglets). Réglage client « Mon style d'accueil » + bouton sur l'écran (livre / carte) ; réglage monde « Style de l'accueil par défaut ».
- **Tailles par utilisateur** (réglages client) : grimoire ou carte (50–130 %, onglets et signet suivent le livre), onglets ou fanions (40–130 %), parchemin / bannière et signet / plaques (40–130 %).
- **Disposition par utilisateur** : réglage client `dispo` par style ; mise en place ouverte à tous (seulement son écran). Le MJ peut « Donner ma disposition aux joueurs » (réglage monde `positionsJoueurs`, utilisé par les joueurs qui n'ont rien disposé) ou la retirer. L'ancienne disposition monde (`positions`) est ignorée.
- Aperçus vérifiés hors Foundry : grimoire à 80 % / onglets 60 % (MJ), cartographe en mise en place (joueur).

## v0.4.0 (24/11/2026)
- Habillages du grimoire **par classe** (demande de Stéphane), choisis tout seuls d'après la classe du personnage (identifiant dnd5e ou nom : ranger/rôdeur, barbarian/barbare, sorcerer/ensorceleur, bard/barde, cleric/clerc/prêtre) ; réglage client « Habillage de mon grimoire » (selon la classe, aucun, ou un au choix). MJ : aucun par défaut.
- Décors (scripts/classes.js, SVG dessinés) : rôdeur = flèche plantée dans le grimoire, feuilles, traces de boue ; barbare = éclaboussures et main de sang, coulures ; ensorceleur = éclairs, sceau, braises ; barde = portées et notes ; prêtre de Torm = gantelet de Torm (filigrane et médaillon), coins dorés, halo.
- **Animations** (réglage client « Animations de l'accueil », coupées aussi si le système demande moins de mouvement) : feuilles qui tombent et flèche qui vibre, sang qui coule et gouttes, éclairs qui claquent, sceau qui tourne et braises, notes qui s'envolent, halo de lumière qui tourne et pulse.
- Seulement dans le style grimoire (la table du cartographe garde le violet et or).

## v0.4.1 (24/11/2026)
- Ensorceleur (Iïados lance souvent des sorts de feu, demande de Stéphane) : flammèches qui dansent sur la tranche basse, les bords et le dos du grimoire, pages roussies, et une **boule de feu** qui traverse le livre de gauche à droite toutes les 9 s avec sa traînée. Éclairs, sceau et braises gardés. Animations coupées = flammes immobiles, pas de boule de feu.

## v0.4.2 (24/11/2026)
- Ensorceleur : éclairs retirés (demande de Stéphane) ; restent les flammèches, les pages roussies, la boule de feu, le sceau et les braises.

## v0.5.0 (24/11/2026)
- Les cinq habillages de classe s'appliquent aussi à **la table du cartographe** (demande de Stéphane : au moins deux visuels par joueur) : bannière, fanions, cadre de la carte, plaques, rose des vents aux couleurs de la classe ; les décors et animations (flèche, sang, feu et boule de feu, notes, gantelet et halo) sont posés sur la carte (mis à l'échelle 0,645 × 0,784). Réglage renommé « Habillage de mon accueil ».

## v0.6.0 (24/11/2026)
- Animations de classe sur les **onglets** (grimoire) et les **fanions** (cartographe), décalées d'une étiquette à l'autre (demande de Stéphane) : rôdeur = une feuille se détache et tombe ; barbare = éclaboussure de sang qui éclate puis coule ; ensorceleur = flammèches qui lèchent le bas de l'étiquette ; barde = notes qui s'envolent ; prêtre de Torm = éclat de lumière qui balaie l'étiquette et auréole qui pulse. Coupées avec le réglage « Animations » (les flammes restent, immobiles).

## v0.6.1 (24/11/2026)
- Correction (capture de Stéphane) : dans les pages (Compagnie, savoir…), la ligne « titre · sous-titre » au-dessus du titre était collée en style grimoire (règle .dac-filet limitée au cartographe) : remise en ligne espacée avec filet. La page de la compagnie prend le nom réglé (« La Bande à DD »). Les pages et la vision passent devant le parchemin du titre.

## v0.6.2 (24/11/2026)
- Table du cartographe (capture de Stéphane, carte d'Ossington en portrait, taille réduite) : la boussole flottait à l'écart ; elle est maintenant accrochée au coin bas-droit de l'image de la carte, quelle que soit sa forme ou sa taille. Les décors de classe suivent aussi la taille réelle de la carte (mesurée après chargement de l'image).
- Nouveau réglage « Image de la boussole » (sélecteur de fichiers, PNG à fond transparent ; vide = boussole dessinée). Stéphane va fournir une vraie boussole.

## v0.6.3 (24/11/2026)
- Boussole fournie par Stéphane (GIF 253 px, 7 images identiques → `assets/boussole.webp` sans perte, fond transparent) : boussole par défaut de la table du cartographe. L'image porte le filigrane « PICMIX » (site picmix.com) : usage privé à la table, ne pas la publier sur GitHub ni foundryvtt.com sans une image libre de droits.

## v0.7.0 (24/11/2026)
- Prêtre de Torm refait (capture de Stéphane) : plus de fond noir sous les étiquettes (l'auréole par pseudo-élément prenait l'ombre portée du fanion) → lueur dorée par filtre animé ; le symbole de Torm n'est plus ovale : médaillon rond (gantelet doré, or plein) posé en haut de la carte ou sur le dos du grimoire, hors de la mise à l'échelle des décors, avec le cercle de runes de Soins de JB2A qui tourne derrière.
- Nouvelle animation (toutes les 12 s) : le **marteau spirituel** (JB2A, Spiritual Weapon Maul spectral vert) apparaît, se lève et frappe le milieu de la carte ; éclat de lumière, **secousse** de l'écran d'accueil, **failles** dorées (JB2A GroundCrackFrostImpact teinté or + failles dessinées). Sans JB2A : failles dessinées et éclat seulement. Coupé avec le réglage Animations ou le mouvement réduit.
- Fichiers JB2A lus depuis modules/JB2A_DnD5e (non copiés dans le module).

## v0.8.0 (24/11/2026)
- **Sorts et aptitudes de chaque classe joués sur la carte** (demande de Stéphane), dans les deux styles, toutes les 10 s, un au hasard (jamais deux fois de suite), avec le nom du sort en bandeau. Vidéos JB2A lues depuis modules/JB2A_DnD5e. Le module ne garde que les sorts présents sur la fiche du personnage (identifiant dnd5e ou nom), s'il en trouve au moins deux ; sinon toute la liste de la classe.
- Liste (fiches lues dans le monde `dans-le-maelstrom-dassignes`) :
  - Syl (rôdeuse chasseuse, archerie) : Marque du chasseur, Tir de l'archère (2 flèches), Frappe piégeuse (flèche + lianes), Passage sans trace (lucioles), Soin des blessures.
  - Garreck (barbare berserker) : Rage (sol fendu + sang, secousse), Coup de hache à deux mains (+ sang), Frénésie (tourbillon), Attaques sauvages (griffes).
  - Iïados (ensorceleur, adepte du feu) : Boule de feu (trait + explosion, secousse), Trait de feu, Rayon ardent (3 rayons), Projectile magique (3), Ténèbres, Mains brûlantes. La boule de feu dessinée est retirée quand JB2A est actif.
  - Elmos (barde, collège du savoir) : Inspiration bardique, Murmure dissonant (cercle de notes), Projectile magique, Sommeil, Lumières dansantes, Mot de guérison.
  - Grimbald (clerc de Torm, domaine de la Vie) : Arme spirituelle (marteau + failles + secousse), Flamme sacrée, Balisage (trait + châtiment), Bénédiction, Mot de guérison de groupe, Impact divin.
- Projectiles : partent d'un bord bas de la carte vers une cible au hasard ; géométrie calée sur les fichiers JB2A (le projectile commence à 200 px du bord gauche de la vidéo). Vérifiée par boîtes de contrôle (les vidéos ne se décodent pas en capture sans tête).
- Décors de classe sur la carte du cartographe : mise à l'échelle par ResizeObserver (les flammes débordaient quand l'image était déjà en cache).
- Sans JB2A : seuls les décors et le marteau dessiné restent.

## v0.8.1 (24/11/2026)
- Symbole de Torm fourni par Stéphane (gantelet d'acier aux entrelacs dorés, JPG détouré → `assets/torm.webp`, fond transparent) à la place du gantelet dessiné : médaillon rond (fond ivoire), filigrane de la page, emblème du dos du grimoire, sceau de la plaque d'entrée. Illustration d'origine inconnue (probablement tirée d'un livre des Royaumes oubliés) : usage privé à la table, ne pas publier.

## v0.9.0 (24/11/2026) — première publication GitHub
- Validé par Stéphane (« c'est nickel ») : mise en ligne du module sur GitHub (magisterphamtom/dnd5e-accueil-cercle-de-pierre), avec release automatique (workflow `release.yml`, zip à fichiers à la racine).
- Les images aux droits non libres (boussole PICMIX, gantelet de Torm) sortent du module : elles sont rangées dans `worlds/dans-le-maelstrom-dassignes/assets/accueil/` et prises par défaut dans ce monde seulement (ailleurs : boussole et gantelet dessinés). Anciens chemins enregistrés migrés au lancement. Nouveau réglage « Image du symbole de Torm ».
- Manifeste : url, bugs, manifest (latest), download, dnd5e vérifié 5.3.3, Foundry vérifié 14.368.

## v0.10.0 (en test)
- Bouton « Réglages » (curseurs) dans la barre d'outils de gauche, sous le bouton de l'écran : chacun y règle son écran (style, habillage, tailles, animations…) ; le MJ / Gardien voit en plus les réglages de la table et la configuration avancée. Fichier `scripts/reglages.js`, commun aux écrans d'accueil.
