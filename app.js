let allGames = [];

fetch('games.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP-Fehler ${response.status}: games.json konnte nicht geladen werden.`);
    }
    return response.json();
  })
  .then(data => {
    allGames = data;
    filterGames('current'); // Direkt CURRENT beim Start laden
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
  // Buttons optisch synchronisieren
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

  const badgesContainer = document.getElementById('badges-container');
  const progress = game.progress || {};
  
  const badges = progress.badges || [];
  const league = progress.league || [];
  const postgame = progress.postgame || [];

  let progressHTML = '';

  // --- ZEILE 1: Orden (max 12) + Lücke (1 Slot) + Liga (max 7) ---
  
  // 1. Bis zu 12 Orden rendern
  for (let i = 0; i < 12; i++) {
    if (i < badges.length) {
      progressHTML += renderBadgeCard(badges[i]);
    } else {
      progressHTML += `<div class="badge-spacer"></div>`; // Auffüllen falls weniger als 12
    }
  }

  // 2. Genau 1 Slot Lücke
  progressHTML += `<div class="badge-spacer"></div>`;

  // 3. Bis zu 7 Top 4 / Champ Items rendern
  for (let i = 0; i < 7; i++) {
    if (i < league.length) {
      progressHTML += renderBadgeCard(league[i]);
    } else {
      progressHTML += `<div class="badge-spacer"></div>`; // Auffüllen falls weniger als 7
    }
  }

  // --- ZEILE 2: Post Game (max 20) ---
  for (let i = 0; i < 20; i++) {
    if (i < postgame.length) {
      progressHTML += renderBadgeCard(postgame[i]);
    } else {
      progressHTML += `<div class="badge-spacer"></div>`; // Auffüllen falls weniger als 20
    }
  }

  badgesContainer.innerHTML = progressHTML;

  // --- TEAM RENDER (OHNE LOCATION) ---
  const teamContainer = document.getElementById('team-container');
  const team = game.team || [];
  teamContainer.innerHTML = team.map(p => {
    const moves = p.moves || [];
    return `
      <div class="pokemon-card">
        <img src="${p.image || ''}" alt="${p.name || ''}">
        <h4>${p.name || ''}</h4>
        <div class="level">${p.level ? 'Lv. ' + p.level : ''}</div>
        <p><strong>Ability:</strong> ${p.ability || '-'}</p>
        <p><strong>Item:</strong> ${p.item || '-'}</p>
        <ul>
          ${moves.map(move => `<li>${move}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');
}
