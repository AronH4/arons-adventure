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
    filterGames('current'); // <-- Direkt CURRENT beim Start laden
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
  // Buttons optisch mit dem aktiven Filter synchronisieren
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

function showGameDetails(game) {
  const detailsSection = document.getElementById('game-details');
  detailsSection.classList.remove('hidden');

  const badgesContainer = document.getElementById('badges-container');
  const badges = game.badges || [];
  badgesContainer.innerHTML = badges.map(b => `
    <div class="badge-card ${b.completed ? 'done' : ''}">
      <p class="badge-name">${b.name || ''}</p>
      <img src="${b.image || ''}" alt="${b.name || ''}">
      <p class="status ${b.completed ? 'done' : ''}">${b.completed ? '✔' : ''}</p>
    </div>
  `).join('');

  const teamContainer = document.getElementById('team-container');
  const team = game.team || [];
  teamContainer.innerHTML = team.map(p => {
    const moves = p.moves || [];
    return `
      <div class="pokemon-card">
        <img src="${p.image || ''}" alt="${p.name || ''}">
        <h4>${p.name || ''}</h4>
        <div class="level">${p.level ? 'Lv. ' + p.level : ''}</div>
        <p><strong>Location:</strong> ${p.location || '-'}</p>
        <p><strong>Ability:</strong> ${p.ability || '-'}</p>
        <p><strong>Item:</strong> ${p.item || '-'}</p>
        <ul>
          ${moves.map(move => `<li>${move}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');
}
