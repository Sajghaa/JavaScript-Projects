const pokemonInput = document.getElementById('pokemonInput');
const searchBtn = document.getElementById('searchBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pokemonContainer = document.getElementById('pokemonContainer');

let currentPage = 1;
const limitPerPage = 10;

async function fetchPokemon(nameOrId) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    if (!res.ok) throw new Error("Pokemon not found");
    return await res.json();
  } catch {
    return null;
  }
}

async function renderPokemon(pokemons) {
  if (!Array.isArray(pokemons)) pokemons = [pokemons];

  const cards = pokemons.map(p => {
    if (!p) return `<div class="pokemon-card"><p>Pokemon not found ❌</p></div>`;

    const types = p.types.map(t => `<span class="type type-${t.type.name}">${t.type.name}</span>`).join('');

    return `
      <div class="pokemon-card" style="background: rgba(255,255,255,0.1)">
        <img src="${p.sprites.front_default}" alt="${p.name}" />
        <h2>${p.name.charAt(0).toUpperCase() + p.name.slice(1)}</h2>
        <p><strong>ID:</strong> ${p.id}</p>
        <p><strong>Types:</strong> ${types}</p>
        <p><strong>Height:</strong> ${p.height / 10} m</p>
        <p><strong>Weight:</strong> ${p.weight / 10} kg</p>
        <p><strong>Base XP:</strong> ${p.base_experience}</p>
      </div>
    `;
  }).join('');

  pokemonContainer.innerHTML = cards;
}

async function fetchPage(page) {
  const start = (page - 1) * limitPerPage + 1;
  const end = start + limitPerPage - 1;

  const promises = [];
  for (let i = start; i <= end; i++) {
    promises.push(fetchPokemon(i));
  }
  const results = await Promise.all(promises);
  renderPokemon(results);
}


searchBtn.addEventListener('click', async () => {
  const value = pokemonInput.value.toLowerCase().trim();
  if (!value) return;
  const data = await fetchPokemon(value);
  renderPokemon(data);
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPage(currentPage);
  }
});

nextPageBtn.addEventListener('click', () => {
  currentPage++;
  fetchPage(currentPage);
});

fetchPage(currentPage);
