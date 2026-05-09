class ChartManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.chart = null;
        this.currentPeriod = '1';
        this.priceChart = new PriceChart(stateManager, eventBus);
        this.init();
    }

    init() {
        this.eventBus.on('coinData:updated', (data) => this.updateChart(data));
        this.setupTimeButtons();
    }

    async updateChart(coinData) {
        if(!coinData || !coinData.id) return;
        const period = this.currentPeriod;
        const days = period === '1' ? 1 : period === '7' ? 7 : period === '30' ? 30 : period === '90' ? 90 : 365;
        
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinData.id}/market_chart?vs_currency=usd&days=${days}`);
            if(!response.ok) return;
            const data = await response.json();
            if(!data || !data.prices || !Array.isArray(data.prices)) return;
            const prices = data.prices.map(p => ({ x: new Date(p[0]), y: p[1] }));
            const labels = prices.map(p => p.x.toLocaleDateString());
            const values = prices.map(p => p.y);
            
            const ctx = document.getElementById('priceChart');
            if(!ctx) return;
            const chartCtx = ctx.getContext('2d');
            if(this.chart) this.chart.destroy();
            this.chart = new Chart(chartCtx, {
                type: 'line',
                data: { labels, datasets: [{ label: 'Price (USD)', data: values, borderColor: '#f7931a', backgroundColor: 'rgba(247,147,26,0.1)', fill: true, tension: 0.4 }] },
                options: { responsive: true, maintainAspectRatio: true, plugins: { tooltip: { callbacks: { label: (ctx) => `$${ctx.raw.toFixed(2)}` } } } }
            });
            
            const marketData = coinData.market_data;
            if(marketData && typeof marketData.current_price === 'object') {
                const currentPrice = marketData.current_price.usd;
                const priceChange = marketData.price_change_percentage_24h;
                if(typeof currentPrice === 'number' && typeof priceChange === 'number') {
                    document.getElementById('selectedCoinName').textContent = `${coinData.name} (${coinData.symbol.toUpperCase()})`;
                    document.getElementById('selectedCoinPrice').textContent = `$${currentPrice.toLocaleString()}`;
                    document.getElementById('selectedCoinChange').textContent = `${priceChange.toFixed(2)}%`;
                    document.getElementById('selectedCoinChange').className = `change ${priceChange >= 0 ? 'positive' : 'negative'}`;
                }
            }
        } catch(err) { console.error('Chart update error:', err); }
    }

    setupTimeButtons() {
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.eventBus.emit('chart:periodChange', this.currentPeriod);
                const coinData = this.stateManager.get('coinData');
                if(coinData && coinData.id) this.updateChart(coinData);
            };
        });
    }
}
window.ChartManager = ChartManager;