#!/usr/bin/env node
// Récupère automatiquement le titre et la durée des vidéos via yt-dlp.
// Ne touche jamais aux champs éditorialisés à la main (theme, motsCles, resume, captation).
//
// Prérequis : yt-dlp installé et accessible dans le PATH (pip install yt-dlp,
// ou brew install yt-dlp). Nécessite un accès réseau sortant vers YouTube.
//
// Usage : node scripts/fetch-metadata.mjs [--force]
//   --force : re-télécharge aussi les vidéos qui ont déjà un titre/une durée.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "videos.json");
const force = process.argv.includes("--force");

function formatDuration(totalSeconds) {
  const s = Math.round(Number(totalSeconds) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function fetchOne(youtubeId) {
  const url = `https://youtu.be/${youtubeId}`;
  const raw = execFileSync(
    "yt-dlp",
    ["--skip-download", "--print", "%(title)s\t%(duration)s", url],
    { encoding: "utf8" }
  ).trim();
  const [titre, dureeSecondes] = raw.split("\t");
  return { titre, duree: formatDuration(dureeSecondes) };
}

const videos = JSON.parse(readFileSync(DATA_PATH, "utf8"));

let updated = 0;
for (const video of videos) {
  if (!force && video.titre && video.duree) continue;
  try {
    const { titre, duree } = fetchOne(video.youtubeId);
    video.titre = titre;
    video.duree = duree;
    updated++;
    console.log(`OK  ${video.youtubeId} -> "${titre}" (${duree})`);
  } catch (err) {
    console.error(`ECHEC ${video.youtubeId} : ${err.message}`);
  }
}

writeFileSync(DATA_PATH, JSON.stringify(videos, null, 2) + "\n");
console.log(`\n${updated} vidéo(s) mise(s) à jour sur ${videos.length}.`);
