let allGames = [];

// JSON laden
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

// Tabs schalten
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

  // 1. LINKS: Cover & Jahr
  const coverImg = document.getElementById('detail-cover');
  const yearText = document.getElementById('detail-year');
  coverImg.src = game.cover || '';
  coverImg.alt = game.title || 'Cover';
  yearText.textContent = game.year || '';

  // 2. RECHTS: Konsolen-Bild & Name
  const consoleImg = document.getElementById('detail-console-img');
  const consoleNameText = document.getElementById('detail-console-name');
  consoleImg.src = game.consoleImage || '';
  consoleImg.alt = game.consoleName || 'Konsole';
  consoleNameText.textContent = game.consoleName || '';

// Mitte: Badges, Liga & Postgame in EINER Zeile
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
  
  // 4. MITTE: Team Rendern
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
