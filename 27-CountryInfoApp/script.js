const API_BASE = 'https://restcountries.com/v3.1';
const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const regionSelect = document.getElementById('regionSelect');
const countrySelect = document.getElementById('countrySelect');
const refreshBtn = document.getElementById('refreshBtn');
const detail = document.getElementById('detail');

const cardTpl = document.getElementById('cardTpl');
const detailTpl = document.getElementById('detailTpl');

let allCountries = [];

const fmtNum = n => n ? n.toLocaleString() : '—';
const joinValues = obj => obj ? Object.values(obj).map(v => (typeof v === 'object' ? (v.name||v) : v)).join(', ') : '—';


async function loadAllCountries() {
  try {
    grid.innerHTML = '<div class="empty">Loading countries…</div>';
    const res = await fetch(`${API_BASE}/all?fields=name,cca3,flags,region,capital,population,area`);
    const data = await res.json();
    allCountries = data.sort((a,b) => a.name.common.localeCompare(b.name.common));
    populateCountrySelect(allCountries);
    renderGrid(allCountries.slice(0, 40)); 
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="empty">Failed to load countries.</div>';
  }
}

function populateCountrySelect(list) {
  countrySelect.innerHTML = '<option value="">Select a country...</option>';
  list.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name.common;
    opt.textContent = `${c.name.common} (${c.cca3})`;
    countrySelect.appendChild(opt);
  });
}

function renderGrid(list) {
  grid.innerHTML = '';
  if (!list || list.length === 0) {
    document.getElementById('empty').classList.remove('hidden');
    return;
  } else {
    document.getElementById('empty').classList.add('hidden');
  }

  const frag = document.createDocumentFragment();
  list.forEach(country => {
    const node = cardTpl.content.cloneNode(true);
    node.querySelector('.flag').src = country.flags?.svg || country.flags?.png || '';
    node.querySelector('.flag').alt = `${country.name.common} flag`;
    node.querySelector('.name').textContent = country.name.common;
    node.querySelector('.region').textContent = country.region || '';
    node.querySelector('.capital').textContent = country.capital?.[0] || '—';
    node.querySelector('.population').textContent = fmtNum(country.population);
    const btn = node.querySelector('.viewBtn');
    btn.addEventListener('click', () => showDetail(country.name.common));
    frag.appendChild(node);
  });
  grid.appendChild(frag);
}


async function showDetail(nameOrCode) {
  try {
    detail.classList.remove('hidden');
    detail.innerHTML = '<div class="detail-card"><p>Loading details…</p></div>';
    
    let url;
    if (nameOrCode && nameOrCode.length === 3) {
      url = `${API_BASE}/alpha/${nameOrCode}`;
    } else {
      url = `${API_BASE}/name/${encodeURIComponent(nameOrCode)}?fullText=false`;
    }
    const res = await fetch(url);
    const data = await res.json();
    const country = Array.isArray(data) ? data[0] : data;
    if (!country) throw new Error('Country not found');

    
    const node = detailTpl.content.cloneNode(true);
    node.querySelector('.detail-flag img').src = country.flags?.svg || country.flags?.png || '';
    node.querySelector('.d-name').textContent = country.name.common + (country.name.official ? ` — ${country.name.official}` : '');
    node.querySelector('.d-region').textContent = `${country.region || ''} ${country.subregion ? '• ' + country.subregion : ''}`;
    node.querySelector('.d-capital').textContent = country.capital?.join(', ') || '—';
    node.querySelector('.d-population').textContent = fmtNum(country.population);
    node.querySelector('.d-area').textContent = country.area ? `${fmtNum(country.area)} km²` : '—';
    node.querySelector('.d-timezones').textContent = country.timezones?.join(', ') || '—';
    node.querySelector('.d-langs').textContent = joinValues(country.languages) || '—';
    
    if (country.currencies) {
      const cs = Object.entries(country.currencies).map(([code,info]) => `${info.name} (${code}) ${info.symbol ? ' ' + info.symbol : ''}`);
      node.querySelector('.d-currs').textContent = cs.join(', ');
    } else node.querySelector('.d-currs').textContent = '—';
    node.querySelector('.d-borders').textContent = country.borders?.join(', ') || '—';
    node.querySelector('.d-calling').textContent = country.idd?.root ? (country.idd.root + (country.idd.suffixes?country.idd.suffixes.join(', '):'')) : '—';

    const mapsUrl = country.maps?.googleMaps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(country.name.common)}`;
    node.querySelector('.mapsLink').href = mapsUrl;
    node.querySelector('.wikiLink').href = `https://en.wikipedia.org/wiki/${encodeURIComponent(country.name.common)}`;
    
    node.getElementById('closeDetail').addEventListener('click', ()=> detail.classList.add('hidden'));

    detail.innerHTML = '';
    detail.appendChild(node);
  } catch (err) {
    console.error(err);
    detail.innerHTML = `<div class="detail-card"><p>Failed to load details.</p></div>`;
  }
}


function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const region = regionSelect.value;
  let list = allCountries;
  if (region) list = list.filter(c => c.region === region);
  if (q) list = list.filter(c => c.name.common.toLowerCase().includes(q) || (c.cca3 && c.cca3.toLowerCase() === q));
  renderGrid(list.slice(0, 80)); 
}


searchInput.addEventListener('input', () => applyFilters());
regionSelect.addEventListener('change', () => applyFilters());
countrySelect.addEventListener('change', (e) => {
  const val = e.target.value;
  if (val) showDetail(val);
});
refreshBtn.addEventListener('click', () => loadAllCountries());

loadAllCountries();
