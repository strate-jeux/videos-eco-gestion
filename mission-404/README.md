# Mission 404 — écran final (console de neutralisation)

Page unique et autonome (`index.html`, HTML/CSS/JS, aucune dépendance
externe) qui simule un faux terminal de sécurité compromis. C'est l'écran
final du jeu de piste cybersécurité : les élèves y saisissent le mot de
passe en 10 lettres trouvé en résolvant les 10 énigmes, pour "désinstaller"
le malware fictif et clore le jeu.

Aucune donnée n'est envoyée où que ce soit : la comparaison du mot de passe
se fait entièrement côté client, dans le navigateur.

## Déroulé

1. **Alerte** — panneau "SYSTÈME COMPROMIS", champ mot de passe uniquement.
2. **Mauvais mot de passe** — message d'erreur + secousse du champ, pas de
   limite de tentatives.
3. **Désinstallation** — séquence de logs façon EDR/SOC qui s'affiche
   progressivement (5 à 10 secondes), avec barre de progression.
4. **Victoire** — écran vert, confirmation de neutralisation, bouton discret
   "recommencer" pour la classe suivante.

## Changer le mot de passe

Le mot de passe attendu est **SENTINELLE** (la comparaison ignore la
casse : `SENTINELLE`, `sentinelle`, `Sentinelle` fonctionnent tous).

Il n'apparaît pas en clair dans le code : il est stocké sous forme de codes
de caractères, dans `index.html`, à chercher pour la variable
`EXPECTED_CODES` :

```js
// Mot de passe attendu, légèrement obfusqué (voir README pour le changer).
var EXPECTED_CODES = [83, 69, 78, 84, 73, 78, 69, 76, 76, 69]; // S E N T I N E L L E
```

Pour le remplacer par un autre mot de passe (par exemple pour une nouvelle
édition du jeu) :

1. Choisissez le nouveau mot de passe, tout en **majuscules** (la
   comparaison se fait en majuscules, la casse saisie par l'élève n'a pas
   d'importance).
2. Convertissez chaque lettre en code de caractère. Le plus simple est
   d'ouvrir la console du navigateur (F12) et de taper :
   ```js
   "VOTRENOUVEAUMOT".split("").map(c => c.charCodeAt(0))
   ```
3. Collez le tableau obtenu à la place de `EXPECTED_CODES`, et mettez à jour
   le commentaire à droite pour rester lisible.
4. Si le nouveau mot de passe est mentionné ailleurs dans la page (message
   d'alerte, log "Isolation de SENTINELLE..."), pensez à l'y remplacer aussi
   — ces occurrences sont uniquement du texte affiché, elles n'ont aucun
   impact sur la vérification.

Cette obfuscation n'est volontairement pas une vraie sécurité (il suffit de
décoder le tableau) : l'objectif est juste d'éviter qu'un·e élève trouve le
mot de passe en un clic via "Voir le code source".

## Déployer

Page 100% statique : elle peut être déployée telle quelle sur GitHub Pages
(le dossier `mission-404/` peut être servi directement, ou son contenu
copié à la racine d'un dépôt dédié) ou ouverte en local en double-cliquant
sur `index.html`.

## Tester en local

Ouvrez simplement `mission-404/index.html` dans un navigateur — aucun
serveur n'est nécessaire, et aucune build.
