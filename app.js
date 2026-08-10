let allGames = [];

fetch('games.json')
  .then(response => response.json())
  .then(data => {
    allGames = data;
    filterGames('current');
  });

document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const category = button.getAttribute('data-tab');
    filterGames(category);
    document.getElementById('game-details').classList.add('hidden');
  });
});

function filterGames(category) {
  const grid = document.getElementById('games-grid');
  grid.innerHTML = '';

  const filtered = allGames.filter(game => game.category === category);

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-id', game.id);
    card.innerHTML = `
      <img src="${game.cover}" alt="${game.title}">
      <h4>${game.title}</h4>
    `;
    card.addEventListener('click', () => {
      // Entferne Rahmen bei allen anderen Spielen
      document.querySelectorAll('.game-card').forEach(c => c.classList.remove('selected'));
      // Neon-grünen Rahmen zum geklickten Spiel hinzufügen
      card.classList.add('selected');
      showGameDetails(game);
    });
    grid.appendChild(card);
  });
}

function showGameDetails(game) {
  const detailsSection = document.getElementById('game-details');
  detailsSection.classList.remove('hidden');

  document.getElementById('detail-title').innerText = game.title;

  // Orden rendern
  const badgesContainer = document.getElementById('badges-container');
  badgesContainer.innerHTML = game.badges.map(b => `
    <div class="badge-card">
      <p class="badge-name">${b.name}</p>
      <img src="${b.image}" alt="${b.name}">
      <p class="status ${b.completed ? 'done' : ''}">${b.completed ? '✔' : ''}</p>
    </div>
  `).join('');

  // Team rendern
  const teamContainer = document.getElementById('team-container');
  teamContainer.innerHTML = game.team.map(p => `
    <div class="pokemon-card">
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <div class="level">${p.level ? 'Lv. ' + p.level : ''}</div>
      <p><strong>Location:</strong> ${p.location || '-'}</p>
      <p><strong>Ability:</strong> ${p.ability || '-'}</p>
      <p><strong>@</strong> ${p.item || '-'}</p>
      <ul>
        ${p.moves.map(move => `<li>${move}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}
