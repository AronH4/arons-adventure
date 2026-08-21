let allGames = [];
let currentSelectedPokemon = null;

fetch('games.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP-Fehler ${response.status}: games.json konnte nicht geladen werden.`);
    }
    return response.json();
  })
  .then(data => {
    allGames = data;
    filterGames('current');
  })
  .catch(error => {
    console.error('Fehler:', error);
    document.getElementById('games-grid').innerHTML = `
      <p style="color: #ff4d4d; text-align: center; width: 100%;">
        ⚠️ <strong>Fehler beim Laden!</strong><br>${error.message}
      </p>`;
  });

document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-tab');
    filterGames(category);
    document.getElementById('game-details').classList.add('hidden');
  });
});

function filterGames(category) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const grid = document.getElementById('games-grid');
  grid.innerHTML = '';

  const filtered = allGames.filter(game => game.category === category);

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color: #aaa; text-align: center; width: 100%;">Keine Spiele in dieser Kategorie.</p>`;
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.cover || ''}" alt="${game.title || ''}">
      <h4>${game.title || ''}</h4>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      showGameDetails(game);
    });
    grid.appendChild(card);
  });
}

function renderBadgeCard(item) {
  return `
    <div class="badge-card ${item.completed ? 'done' : ''}">
      <p class="badge-name">${item.name || ''}</p>
      <img src="${item.image || ''}" alt="${item.name || ''}">
      <p class="status ${item.completed ? 'done' : ''}">${item.completed ? '✔' : ''}</p>
    </div>
  `;
}

function showGameDetails(game) {
  const detailsSection = document.getElementById('game-details');
  detailsSection.classList.remove('hidden');

  // Links: Cover, Jahr & Konsolenname (beide gleicher Style)
  const coverImg = document.getElementById('detail-cover');
  const regionText = document.getElementById('detail-region');
  const yearText = document.getElementById('detail-year');
  const consoleNameText = document.getElementById('detail-console-name');
  
  coverImg.src = game.cover || '';
  coverImg.alt = game.title || 'Cover';
  regionText.textContent = game.region || '';
  yearText.textContent = game.year || '';
  consoleNameText.textContent = game.consoleName || '';

  // Detail-Panel zurücksetzen/verstecken
  const detailsPanel = document.getElementById('poke-details-panel');
  detailsPanel.classList.add('hidden');
  currentSelectedPokemon = null;

  // Mitte: Badges, Liga & Postgame in 1 Zeile
  const badgesContainer = document.getElementById('badges-container');
  const progress = game.progress || {};
  
  const badges = progress.badges || [];
  const league = progress.league || [];
  const postgame = progress.postgame || [];

  const badgesHTML = badges.map(renderBadgeCard).join('');
  const leagueHTML = league.map(renderBadgeCard).join('');
  const postgameHTML = postgame.map(renderBadgeCard).join('');

  badgesContainer.innerHTML = `
    <div class="progress-row-1">
      <div class="badges-group">${badgesHTML}</div>
      ${league.length > 0 ? '<div class="row-gap"></div>' : ''}
      <div class="league-group">${leagueHTML}</div>
      ${postgame.length > 0 ? '<div class="row-gap"></div>' : ''}
      <div class="postgame-group">${postgameHTML}</div>
    </div>
  `;

  // Mitte: Team
  const teamContainer = document.getElementById('team-container');
  const team = game.team || [];
  teamContainer.innerHTML = '';

  team.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    const moves = p.moves || [];

    card.innerHTML = `
      <img src="${p.image || ''}" alt="${p.name || ''}">
      <h4>${p.name || ''}</h4>
      <div class="level">${p.level ? 'Lv. ' + p.level : ''}</div>
      <p><strong>Ability:</strong> ${p.ability || '-'}</p>
      <p><strong>Item:</strong> ${p.item || '-'}</p>
      <ul>
        ${moves.map(move => `<li>${move}</li>`).join('')}
      </ul>
    `;

    // Klick auf Pokémon schaltet das Detail-Fenster
    card.addEventListener('click', () => {
      document.querySelectorAll('.pokemon-card').forEach(c => c.classList.remove('active-poke'));
      
      if (currentSelectedPokemon === p) {
        detailsPanel.classList.add('hidden');
        currentSelectedPokemon = null;
      } else {
        card.classList.add('active-poke');
        renderPokemonDetails(p);
        currentSelectedPokemon = p;
      }
    });

    teamContainer.appendChild(card);
  });
}

// Rendert das rechte Detail-Fenster
function renderPokemonDetails(poke) {
  const panel = document.getElementById('poke-details-panel');
  panel.classList.remove('hidden');

  const d = poke.details || {};
  const stats = d.stats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);

const genderSymbol = d.gender === 'female' ? '<span class="pd-gender-symbol female">♀</span>' : 
                     d.gender === 'male' ? '<span class="pd-gender-symbol male">♂</span>' : 
                     d.gender === 'neutral' ? '<span class="pd-gender-symbol neutral">-</span>' : 
                     '<span class="pd-gender-symbol neutral">-</span>';

  const typesHTML = (d.types || []).map(t => `<img src="${t}" alt="Typ">`).join('');

  panel.innerHTML = `
    <!-- Header: Typen (Zentriert) -->
    <div class="pd-types-header">
      ${typesHTML}
    </div>

    <!-- Row 1: Ball, Ort/Datum, Geschlecht -->
    <div class="pd-info-row-1">
      ${d.ball ? `<img src="${d.ball}" class="pd-ball-img" alt="Ball">` : '<div></div>'}
      <div class="pd-loc-date">
        <div>${d.location || ''}</div>
        <div>${d.catchDate || ''}</div>
      </div>
      ${genderSymbol}
    </div>

    <!-- Row 2 (Kombiniert): Ruf | Kat + Dex + H/W | GIF -->
    <div class="pd-combined-row">
      ${d.cry ? `
        <button class="pd-cry-btn" onclick="new Audio('${d.cry}').play()">
          <span>🔊</span>
        </button>
      ` : '<div></div>'}

      <div class="pd-info-center">
        <div class="pd-category">${d.category || 'POKÉMON'}</div>
        <div class="pd-dex-num"># ${d.dexNumber || '???'}</div>
        <div class="pd-height-weight">${d.height || '-'} | ${d.weight || '-'}</div>
      </div>

      <div class="pd-gif-container">
        <img src="${d.gif || poke.image}" alt="${poke.name}">
      </div>
    </div>

    <!-- Mittleres Grid: Base Stats (Links) & Showdown (Rechts) -->
    <div class="pd-mid-grid">
      <!-- Base Stats -->
      <div class="pd-stats-box">
        <div class="pd-stats-title">Base Stats</div>
        ${renderStatRow('HP', stats.hp)}
        ${renderStatRow('ATK', stats.atk)}
        ${renderStatRow('DEF', stats.def)}
        ${renderStatRow('SPA', stats.spa)}
        ${renderStatRow('SPD', stats.spd)}
        ${renderStatRow('SPE', stats.spe)}
        <div class="pd-stat-row" style="margin-top:2px; border-top:1px solid #444; padding-top:2px;">
          <span class="pd-stat-label">SUM</span>
          <span class="pd-stat-val">${totalStats}</span>
          <div class="pd-stat-bar-bg" style="background:transparent;"></div>
        </div>
      </div>

      <!-- Showdown Box (Nutzt Platz rechts komplett, Copy-Button unten rechts) -->
      <div class="pd-showdown-box" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
        <textarea id="showdown-text" class="pd-showdown-text" readonly style="flex-grow: 1;">${d.showdown || ''}</textarea>
        <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
          <button class="pd-copy-btn" onclick="copyShowdown()" title="In Zwischenablage kopieren">📋</button>
        </div>
      </div>
    </div>

    <!-- Pokédex-Eintrag ganz unten über die volle Breite -->
    <div class="pd-flavor-box">
      ${d.flavorText || 'Kein Pokédex-Eintrag vorhanden.'}
    </div>
  `;
}

// Hilfsfunktion zur Ermittlung der Farbe basierend auf dem Wert
function getStatColor(value) {
  if (value < 30) return '#ff4d4d';      // Rot (0 - 29)
  if (value < 60) return '#ff944d';      // Orange (30 - 59)
  if (value < 90) return '#ffdd4d';      // Gelb (60 - 89)
  if (value < 120) return '#a3ff4d';     // Hellgrün (90 - 119)
  if (value < 150) return '#2eb82e';     // Dunkelgrün (120 - 149)
  return '#00b3b3';                      // Dunkles Türkis (150+)
}

function renderStatRow(label, value) {
  // Prozentualer Anteil bezogen auf den Max-Wert 200 (max. 100%)
  const percent = Math.min(100, Math.round((value / 200) * 100));
  const color = getStatColor(value);

  return `
    <div class="pd-stat-row">
      <span class="pd-stat-label">${label}</span>
      <span class="pd-stat-val">${value}</span>
      <div class="pd-stat-bar-bg">
        <div class="pd-stat-bar-fill" style="width: ${percent}%; background-color: ${color};"></div>
      </div>
    </div>
  `;
}

function copyShowdown() {
  const textarea = document.getElementById('showdown-text');
  if (textarea && textarea.value) {
    textarea.select();
    navigator.clipboard.writeText(textarea.value);
    alert('Showdown-Code in die Zwischenablage kopiert!');
  }
}
