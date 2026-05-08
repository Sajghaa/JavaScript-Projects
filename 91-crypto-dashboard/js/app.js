(function(){
	const state = new StateManager();
	const bus = new EventBus();
	window.appState = state;
	window.appBus = bus;

	function showToast({ message = '', type = 'info', duration = 3000 } = {}) {
		const toast = document.getElementById('toast');
		if(!toast) return;
		toast.textContent = message;
		toast.className = `toast ${type} visible`;
		clearTimeout(toast._hideTimer);
		toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), duration);
	}
	window.showToast = showToast;
	bus.on('toast', (payload) => showToast(payload));

	window.closeModal = function() { const m = document.getElementById('portfolioModal'); if(m) m.classList.remove('active'); };
	window.openModal = function() { const m = document.getElementById('portfolioModal'); if(m) m.classList.add('active'); };

	// Theme toggle
	const themeToggle = document.getElementById('themeToggle');
	if(themeToggle) themeToggle.onclick = () => document.body.classList.toggle('dark');

	// Search filtering (works after coins render)
	const searchInput = document.getElementById('searchInput');
	if(searchInput) {
		searchInput.addEventListener('input', (e) => {
			const q = (e.target.value || '').trim().toLowerCase();
			document.querySelectorAll('.crypto-card').forEach(el => {
				const name = (el.querySelector('.crypto-name')?.textContent || '') + ' ' + (el.querySelector('.crypto-symbol')?.textContent || '');
				el.style.display = name.toLowerCase().includes(q) ? '' : 'none';
			});
		});
	}

	// Initialize core managers
	const cryptoManager = new CryptoManager(state, bus);
	const chartManager = new ChartManager(state, bus);
	const portfolioManager = new PortfolioManager(state, bus);
	const marketManager = new MarketManager(state, bus);
	const wsManager = new WebSocketManager(state, bus);
	const newsTicker = new NewsTicker(state, bus);

	// Apply lightweight price updates coming from polling
	bus.on('prices:updated', (data) => {
		const coins = state.get('coins') || [];
		let changed = false;
		coins.forEach(c => {
			if(data[c.id]) {
				const p = data[c.id].usd;
				const change = data[c.id].usd_24h_change;
				if(typeof p === 'number') { c.current_price = p; changed = true; }
				if(typeof change === 'number') { c.price_change_percentage_24h = change; }
			}
		});
		if(changed) state.set('coins', coins);
	});

	// Close toast on click
	const toastEl = document.getElementById('toast');
	if(toastEl) toastEl.addEventListener('click', () => toastEl.classList.remove('visible'));
})();
