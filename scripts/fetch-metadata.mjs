#!/usr/bin/env node
// Récupère le titre et la chaîne de chaque vidéo via l'API oEmbed publique de
// YouTube (aucune clé requise, fonctionne depuis un serveur).
//
// La durée n'est pas exposée par oEmbed : elle n'est récupérée que si la
// variable d'environnement YOUTUBE_API_KEY est fournie (API YouTube Data v3).
// Sans clé, le champ duree reste vide et le site ne l'affiche simplement pas.
//
// Usage : node scripts/fetch-metadata.mjs [--force]
//   --force : rafraîchit aussi les vidéos déjà renseignées.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "videos.json");
const force = process.argv.includes("--force");
const apiKey = process.env.YOUTUBE_API_KEY;

// oEmbed répond 401 pour une vidéo privée et 404 pour une vidéo supprimée :
// dans les deux cas le lien est mort et doit être signalé sur le site.
async function fetchOembed(youtubeId) {
  const url = `https://www.youtube.com/oembed?url=https://youtu.be/${youtubeId}&format=json`;
  const res = await fetch(url);
  if (res.status === 401 || res.status === 404) {
    return { indisponible: true };
  }
  if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
  const data = await res.json();
  return { titre: data.title, chaine: data.author_name };
}

function formatDuration(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || "");
  if (!m) return "";
  const [h, min, s] = [Number(m[1] || 0), Number(m[2] || 0), Number(m[3] || 0)];
  const mm = h > 0 ? String(min).padStart(2, "0") : String(min);
  return `${h > 0 ? h + ":" : ""}${mm}:${String(s).padStart(2, "0")}`;
}

// L'API Data v3 accepte 50 identifiants par appel : une seule requête suffit.
async function fetchDurations(ids) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("key", apiKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Data v3 HTTP ${res.status}`);
  const data = await res.json();
  return new Map(
    data.items.map((item) => [item.id, formatDuration(item.contentDetails.duration)])
  );
}

const videos = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const aTraiter = videos.filter((v) => force || !v.titre);

let ok = 0;
for (const video of aTraiter) {
  try {
    const { titre, chaine, indisponible } = await fetchOembed(video.youtubeId);
    if (indisponible) {
      video.indisponible = true;
      console.log(`ABSENT ${video.youtubeId} : vidéo privée ou supprimée`);
      continue;
    }
    delete video.indisponible;
    video.titre = titre;
    if (!video.chaine || force) video.chaine = chaine;
    ok++;
    console.log(`OK    ${video.youtubeId} -> "${titre}" (${chaine})`);
  } catch (err) {
    console.error(`ECHEC ${video.youtubeId} : ${err.message}`);
  }
}

if (apiKey) {
  const ids = videos.filter((v) => force || !v.duree).map((v) => v.youtubeId);
  for (let i = 0; i < ids.length; i += 50) {
    try {
      const durees = await fetchDurations(ids.slice(i, i + 50));
      for (const video of videos) {
        const duree = durees.get(video.youtubeId);
        if (duree) video.duree = duree;
      }
    } catch (err) {
      console.error(`ECHEC durées : ${err.message}`);
    }
  }
} else {
  console.log("\nPas de YOUTUBE_API_KEY : durées non récupérées (champ laissé vide).");
}

writeFileSync(DATA_PATH, JSON.stringify(videos, null, 2) + "\n");
console.log(`\n${ok} titre(s) récupéré(s) sur ${aTraiter.length} traité(s).`);
