#!/usr/bin/env node
// Rapproche les fiches éditoriales (data/fiches.json, issues du tableau
// d'analyse) des vidéos (data/videos.json) en comparant les titres, puis
// recopie thème, mots-clés, résumé, piste pédagogique et ton.
//
// Ne remplit que les champs vides : les corrections faites à la main dans
// data/videos.json ne sont jamais écrasées (sauf avec --force).
//
// Prérequis : les titres doivent avoir été récupérés au préalable
// (node scripts/fetch-metadata.mjs).
//
// Usage : node scripts/import-fiches.mjs [--force]

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEOS_PATH = path.join(__dirname, "..", "data", "videos.json");
const FICHES_PATH = path.join(__dirname, "..", "data", "fiches.json");
const force = process.argv.includes("--force");
const SEUIL = 0.55;

function normaliser(texte) {
  return (texte || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((mot) => mot.length > 2);
}

// Proportion de mots communs, rapportée au titre le plus court : tolère qu'un
// titre YouTube soit plus long que celui du tableau (suffixe de chaîne, etc.).
function similarite(a, b) {
  const motsA = new Set(normaliser(a));
  const motsB = new Set(normaliser(b));
  if (motsA.size === 0 || motsB.size === 0) return 0;
  let communs = 0;
  for (const mot of motsA) if (motsB.has(mot)) communs++;
  return communs / Math.min(motsA.size, motsB.size);
}

const videos = JSON.parse(readFileSync(VIDEOS_PATH, "utf8"));
const fiches = JSON.parse(readFileSync(FICHES_PATH, "utf8"));
const fichesUtilisees = new Set();

let associees = 0;
const sansTitre = [];
const sansCorrespondance = [];

for (const video of videos) {
  if (!video.titre) {
    sansTitre.push(video.youtubeId);
    continue;
  }

  let meilleure = null;
  let meilleurScore = 0;
  for (const fiche of fiches) {
    if (fichesUtilisees.has(fiche)) continue;
    const score = similarite(video.titre, fiche.titre);
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleure = fiche;
    }
  }

  if (!meilleure || meilleurScore < SEUIL) {
    sansCorrespondance.push(`${video.youtubeId} — "${video.titre}"`);
    continue;
  }

  fichesUtilisees.add(meilleure);
  associees++;
  const remplir = (champ, valeur) => {
    const vide = Array.isArray(video[champ])
      ? video[champ].length === 0
      : !video[champ];
    if (vide || force) video[champ] = valeur;
  };
  remplir("theme", meilleure.theme);
  remplir("motsCles", meilleure.motsCles);
  remplir("resume", meilleure.resume);
  remplir("pistePedagogique", meilleure.pistePedagogique);
  remplir("discipline", meilleure.discipline);
  remplir("ton", meilleure.ton);
  remplir("chaine", meilleure.chaine);
  console.log(
    `OK    ${video.youtubeId} (${meilleurScore.toFixed(2)}) "${video.titre}" <- "${meilleure.titre}"`
  );
}

writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2) + "\n");

console.log(`\n${associees} vidéo(s) associée(s) à une fiche sur ${videos.length}.`);
if (sansTitre.length) {
  console.log(`\nSans titre (lancer fetch-metadata avant) : ${sansTitre.join(", ")}`);
}
if (sansCorrespondance.length) {
  console.log("\nAucune fiche trouvée pour :");
  for (const ligne of sansCorrespondance) console.log(`  - ${ligne}`);
}
const restantes = fiches.filter((f) => !fichesUtilisees.has(f));
if (restantes.length) {
  console.log("\nFiches non utilisées :");
  for (const fiche of restantes) console.log(`  - "${fiche.titre}"`);
}
