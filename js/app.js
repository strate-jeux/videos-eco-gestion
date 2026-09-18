(function () {
  "use strict";

  const grid = document.getElementById("video-grid");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search-input");
  const themeSelect = document.getElementById("theme-select");
  const resultsCount = document.getElementById("results-count");

  let videos = [];

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function thumbnailUrl(youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  }

  function renderStars(count) {
    const n = Math.max(0, Math.min(5, Number(count) || 0));
    if (n === 0) return "";
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  function matchesQuery(video, query) {
    if (!query) return true;
    const haystack = [
      video.titre,
      video.resume,
      video.theme,
      video.discipline,
      video.chaine,
      video.pistePedagogique,
      ...(video.motsCles || []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }

  function matchesTheme(video, theme) {
    if (!theme) return true;
    return video.theme === theme;
  }

  function renderGrid() {
    const query = searchInput.value.trim().toLowerCase();
    const theme = themeSelect.value;
    const filtered = videos.filter(
      (v) => matchesQuery(v, query) && matchesTheme(v, theme)
    );

    grid.innerHTML = filtered.map(videoCardHtml).join("");
    emptyState.hidden = filtered.length !== 0;
    resultsCount.textContent = `${filtered.length} vidéo${filtered.length > 1 ? "s" : ""} sur ${videos.length}`;
  }

  function videoCardHtml(video) {
    const url = `https://youtu.be/${video.youtubeId}`;
    const title = video.titre || "(titre à récupérer)";
    return `
      <article class="video-card">
        <a class="video-card__thumb" href="${url}" target="_blank" rel="noopener">
          <img src="${thumbnailUrl(video.youtubeId)}" alt="" loading="lazy" />
          ${video.duree ? `<span class="video-card__duration">${escapeHtml(video.duree)}</span>` : ""}
        </a>
        <div class="video-card__body">
          <div class="video-card__tags">
            ${video.theme ? `<span class="video-card__theme">${escapeHtml(video.theme)}</span>` : ""}
            ${video.chaine ? `<span class="video-card__chaine">${escapeHtml(video.chaine)}</span>` : ""}
          </div>
          <h3 class="video-card__title">${escapeHtml(title)}</h3>
          ${video.ton ? `<p class="video-card__ton">${escapeHtml(video.ton)}</p>` : ""}
          <p class="video-card__summary">${escapeHtml(video.resume || "Résumé à venir.")}</p>
          ${
            video.pistePedagogique
              ? `<details class="video-card__piste">
                   <summary>Piste pédagogique${video.discipline ? ` — ${escapeHtml(video.discipline)}` : ""}</summary>
                   <p>${escapeHtml(video.pistePedagogique)}</p>
                 </details>`
              : ""
          }
          ${
            (video.motsCles || []).length
              ? `<ul class="video-card__mots">${video.motsCles
                  .map((mot) => `<li>${escapeHtml(mot)}</li>`)
                  .join("")}</ul>`
              : ""
          }
          <div class="video-card__meta">
            <span class="video-card__rating" aria-label="Pouvoir de captation">${renderStars(video.captation)}</span>
            <a class="video-card__cta" href="${url}" target="_blank" rel="noopener">Voir sur YouTube ↗</a>
          </div>
        </div>
      </article>
    `;
  }

  function populateThemeOptions() {
    const themes = Array.from(
      new Set(videos.map((v) => v.theme).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "fr"));
    for (const theme of themes) {
      const option = document.createElement("option");
      option.value = theme;
      option.textContent = theme;
      themeSelect.appendChild(option);
    }
  }

  function setupDisclaimerToggle() {
    const banner = document.getElementById("disclaimer");
    const toggle = document.getElementById("disclaimer-toggle");
    toggle.addEventListener("click", () => {
      const expanded = banner.classList.toggle("is-expanded");
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Réduire" : "Lire le disclaimer complet";
    });
  }

  async function init() {
    setupDisclaimerToggle();
    try {
      const res = await fetch("data/videos.json");
      videos = await res.json();
    } catch (err) {
      grid.innerHTML = `<p class="empty-state">Impossible de charger les vidéos (${escapeHtml(err.message)}).</p>`;
      return;
    }
    populateThemeOptions();
    renderGrid();
    searchInput.addEventListener("input", renderGrid);
    themeSelect.addEventListener("change", renderGrid);
  }

  init();
})();
