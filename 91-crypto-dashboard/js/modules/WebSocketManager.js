class WebSocketManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.ws = null;
        this.init();
    }

    init() {
        // Using CoinGecko's WebSocket alternative - REST polling
        this.startPolling();
    }

    startPolling() {
        setInterval(async () => {
            const coins = this.stateManager.get('coins');
            if(coins.length > 0) {
                const ids = coins.slice(0, 10).map(c => c.id).join(',');
                try {
                    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
                    const data = await response.json();
                    this.eventBus.emit('prices:updated', data);
                } catch(err) { console.error(err); }
            }
        }, 30000);
    }
}
window.WebSocketManager = WebSocketManager;