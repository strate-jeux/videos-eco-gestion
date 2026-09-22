# Répertoire vidéo Éco-Gestion

Un répertoire de vidéos YouTube utiles aux cours d'économie, gestion, management,
stratégie et marketing,
pour s'appuyer sur des contenus vidéo bien faits plutôt que de chercher à les
refaire. Site statique, sans base de données, pensé pour être hébergé
gratuitement sur GitHub Pages.

## Fonctionnalités

- Recherche par mots-clés (titre, résumé, thème, chaîne, mots-clés)
- Filtre par thème principal
- Fiche par vidéo : titre, chaîne, ton, résumé, piste pédagogique, mots-clés,
  durée, pouvoir de captation (étoiles), lien vers YouTube
- Disclaimer enseignant toujours visible (bandeau + pied de page)

Volontairement absent : pas de champ "niveau" (retiré par rapport à la v1).

## Structure du projet

```
index.html                   page unique
css/styles.css               charte graphique (voir plus bas)
js/app.js                    recherche, filtres, rendu des fiches
data/videos.json             les 41 vidéos — source de vérité du site
data/fiches.json             les 40 analyses éditoriales (tableau d'origine)
scripts/fetch-metadata.mjs   récupère titre + chaîne via oEmbed
scripts/import-fiches.mjs    rapproche fiches.json et videos.json par le titre
.github/workflows/           bouton "Run workflow" qui lance les deux scripts
```

## Modèle de données (`data/videos.json`)

| Champ              | Origine              | Détail                                           |
|--------------------|----------------------|--------------------------------------------------|
| `youtubeId`        | Fourni               | identifiant de la vidéo (`youtu.be/<id>`)        |
| `titre`            | Auto (oEmbed)        | titre exact de la vidéo                          |
| `chaine`           | Auto (oEmbed)        | ex. Les Echos, Le Monde…                         |
| `duree`            | Auto (clé API)       | format `mm:ss`, vide sans clé — voir plus bas    |
| `theme`            | Fiche / manuel       | Économie, Marketing, Stratégie, Droit, RSE…      |
| `discipline`       | Fiche / manuel       | intitulé détaillé de la piste pédagogique        |
| `ton`              | Fiche / manuel       | ex. "Pédagogique & analytique"                   |
| `motsCles`         | Fiche / manuel       | sert à la recherche par mots-clés                |
| `resume`           | Fiche / manuel       | 2-3 phrases                                      |
| `pistePedagogique` | Fiche / manuel       | exploitation en cours                            |
| `captation`        | Manuel (0-5)         | pouvoir de captation de l'attention, en étoiles  |
| `indisponible`     | Auto                 | `true` si la vidéo est privée ou supprimée       |

`data/videos.json` est la source de vérité : c'est ce fichier qu'on édite à la
main. Les scripts ne remplissent que les champs **vides**, ils n'écrasent donc
jamais une correction (sauf lancés avec `--force`).

## Mettre à jour les métadonnées (titre, chaîne, fiches)

### Depuis un navigateur — aucune installation, marche sur iPad

1. Va sur https://github.com/strate-jeux/videos-eco-gestion
2. Onglet **Actions**
3. À gauche, **"Récupérer les métadonnées YouTube"**
4. Bouton **"Run workflow"** → laisse la case décochée → **"Run workflow"**
5. Au bout d'une minute, `data/videos.json` est mis à jour et le commit poussé
   automatiquement.

### Sur ordinateur

```bash
node scripts/fetch-metadata.mjs   # titres + chaînes via oEmbed
node scripts/import-fiches.mjs    # associe les fiches éditoriales
```

### Pourquoi pas yt-dlp ?

yt-dlp est systématiquement bloqué depuis les serveurs GitHub ("Sign in to
confirm you're not a bot"), quel que soit le client utilisé. L'endpoint oEmbed
public de YouTube, lui, répond normalement et fournit titre et chaîne sans clé
API : c'est donc lui qui est utilisé.

### Durées

oEmbed n'expose pas la durée des vidéos. Pour la récupérer, il faut une clé
gratuite de l'API YouTube Data v3 :

1. Créer la clé sur https://console.cloud.google.com (activer "YouTube Data
   API v3").
2. Dans le dépôt : **Settings → Secrets and variables → Actions → New
   repository secret**, nommé `YOUTUBE_API_KEY`.
3. Relancer le workflow : les durées se remplissent toutes seules.

Sans cette clé, le champ `duree` reste vide et le site ne l'affiche simplement
pas — tout le reste fonctionne normalement.

## Compléter les champs éditoriaux

39 vidéos sur 41 ont déjà thème, ton, résumé, piste pédagogique et mots-clés,
importés du tableau d'analyse (`data/fiches.json`). Restent à compléter à la
main, après visionnage :

- le champ `captation` (0 à 5 étoiles) de chaque vidéo ;
- la fiche de "Les clubs de football peuvent-ils faire faillite ?"
  (`gQhbsINSBvY`), absente du tableau d'analyse ;
- le sort de `OL4Lz5SAYUY`, dont la vidéo est privée ou supprimée : soit la
  remplacer par un lien valide, soit retirer l'entrée. La fiche "Comment un
  gamin pauvre a bâti l'empire Starbucks" du tableau n'a trouvé aucune vidéo
  correspondante — il s'agit probablement de celle-là.

Éditer `data/videos.json` suffit : aucune recompilation, le site lit le JSON
directement.

## Ajouter une nouvelle vidéo

Ajoutez une entrée dans `data/videos.json` :

```json
{ "youtubeId": "XXXXXXXXXXX", "titre": "", "chaine": "", "duree": "", "theme": "", "discipline": "", "ton": "", "motsCles": [], "resume": "", "pistePedagogique": "", "captation": 0 }
```

puis relancez le workflow (ou `node scripts/fetch-metadata.mjs`) pour récupérer
titre et chaîne, et complétez les champs éditoriaux.

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
