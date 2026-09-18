# Répertoire vidéo Éco-Gestion

Un répertoire de vidéos YouTube utiles aux cours d'économie-gestion (STMG/BTS),
pour s'appuyer sur des contenus vidéo bien faits plutôt que de chercher à les
refaire. Site statique, sans base de données, pensé pour être hébergé
gratuitement sur GitHub Pages.

## Fonctionnalités

- Recherche par mots-clés (titre, résumé, thème)
- Filtre par thème principal
- Fiche par vidéo : titre, résumé, durée, thème, pouvoir de captation
  (étoiles), lien vers YouTube
- Disclaimer enseignant toujours visible (bandeau + pied de page)

Volontairement absent : pas de champ "niveau" (retiré par rapport à la v1).

## Structure du projet

```
index.html            page unique
css/styles.css         charte graphique (voir plus bas)
js/app.js              recherche, filtres, rendu des fiches
data/videos.json       les 41 vidéos (une entrée par vidéo)
scripts/fetch-metadata.mjs   script pour récupérer titre + durée via yt-dlp
```

## Modèle de données (`data/videos.json`)

| Champ         | Origine            | Détail                                          |
|---------------|--------------------|--------------------------------------------------|
| `youtubeId`   | Fourni             | identifiant de la vidéo (`youtu.be/<id>`)        |
| `titre`       | Auto (yt-dlp)      | titre exact de la vidéo                          |
| `duree`       | Auto (yt-dlp)      | format `mm:ss`                                   |
| `theme`       | Manuel             | ex. Marché, RH, Marketing, Droit, RSE, Finance…  |
| `motsCles`    | Manuel (liste)     | sert à la recherche par mots-clés                |
| `resume`      | Manuel (2-3 phrases)| rédigé après visionnage                          |
| `captation`   | Manuel (0-5)       | pouvoir de captation de l'attention, en étoiles  |

Les 41 vidéos du brief sont déjà présentes avec seulement `youtubeId` rempli.
Le reste est à compléter (voir ci-dessous).

## Compléter les métadonnées automatiques (titre + durée)

Ce projet a été généré dans un environnement sans accès réseau sortant vers
YouTube ; les titres et durées n'ont donc **pas** pu être récupérés
automatiquement.

### Option A — depuis un navigateur (aucune installation, marche sur iPad)

Un bouton GitHub Actions fait tourner le script à ta place, sur les serveurs
de GitHub :

1. Va sur la page du dépôt : `https://github.com/strate-jeux/videos-eco-gestion`
2. Onglet **Actions** (en haut)
3. Dans la liste à gauche, clique sur **"Récupérer titres et durées YouTube"**
4. Bouton **"Run workflow"** (à droite) → laisse "force" décoché → **"Run workflow"**
5. Attends 1 à 2 minutes, puis rafraîchis la page : le run passe au ✅ vert
   quand c'est fini. Le fichier `data/videos.json` est automatiquement mis à
   jour et le commit poussé sur le dépôt — rien d'autre à faire.
6. Si le run échoue (❌ rouge), ouvre-le pour voir le détail : YouTube bloque
   parfois les téléchargements automatisés ("Sign in to confirm you're not a
   bot") ; relancer une seconde fois résout souvent le problème.

### Option B — sur ordinateur (Mac/Windows/Linux)

1. Installer [yt-dlp](https://github.com/yt-dlp/yt-dlp) : `pip install yt-dlp`
   (ou `brew install yt-dlp`).
2. Lancer :
   ```bash
   npm run fetch-metadata
   ```
   Le script ne touche qu'aux champs `titre` et `duree` ; il laisse intacts
   `theme`, `motsCles`, `resume` et `captation`. Il ne re-télécharge pas les
   vidéos déjà renseignées (sauf avec `--force`).

Alternative sans yt-dlp : le titre seul peut être récupéré sans clé API via
`https://www.youtube.com/oembed?url=<lien>&format=json` ; pour la durée
exacte il faut l'API YouTube Data v3 (clé gratuite) ou yt-dlp.

## Compléter les champs éditoriaux

Après avoir visionné chaque vidéo, éditez son entrée dans
`data/videos.json` pour renseigner `theme`, `motsCles`, `resume` et
`captation`. Aucune recompilation n'est nécessaire : le site lit le fichier
JSON directement.

## Ajouter une nouvelle vidéo

Ajoutez une entrée dans `data/videos.json` :

```json
{ "youtubeId": "XXXXXXXXXXX", "titre": "", "duree": "", "theme": "", "motsCles": [], "resume": "", "captation": 0 }
```

puis relancez `npm run fetch-metadata` pour récupérer titre et durée, et
complétez les champs manuels.

## Tester en local

```bash
npm run serve
```

puis ouvrir `http://localhost:8080`.

## Déployer sur GitHub Pages

Dans les réglages du dépôt GitHub : **Settings → Pages → Build and
deployment → Source : Deploy from a branch**, puis choisir la branche
`main` et le dossier `/ (root)`. Aucune étape de build n'est nécessaire,
le site est déjà statique.

## Charte graphique

La direction esthétique reprend les codes de strate-jeux.com : bleu foncé,
jaune moutarde franc, accent corail, rose pâle et bleu bébé ; ton chaleureux
et direct, icônes minimalistes, miniatures des vidéos en photo.

⚠️ **Les couleurs, la police et le rayon des boutons dans `css/styles.css`
sont une approximation** : l'accès réseau à strate-jeux.com était bloqué au
moment de la génération de ce projet, il n'a donc pas été possible d'extraire
les vraies valeurs CSS du site. Toutes les valeurs sont centralisées dans les
variables `:root` en haut de `css/styles.css` — à corriger en priorité pour
coller exactement à la charte réelle (couleurs hex, `font-family`,
`border-radius` des boutons).

## Disclaimer enseignant

Affiché en bandeau (dépliable) en haut de page et rappelé en pied de page :
les vidéos proviennent de tiers, l'enseignant reste responsable de vérifier
la fiabilité de la source, l'actualité du contenu, et l'absence de propos
discriminants ou inappropriés avant toute diffusion en classe.
