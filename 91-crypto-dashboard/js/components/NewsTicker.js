class NewsTicker {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    async init() {
        await this.fetchNews();
        setInterval(() => this.fetchNews(), 300000);
    }

    async fetchNews() {
        try {
            const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
            const data = await response.json();
            if(data && data.Data && Array.isArray(data.Data)) {
                const articles = data.Data.slice(0, 10);
                this.renderNews(articles);
            }
        } catch(err) { console.error('News fetch error:', err); }
    }

    renderNews(articles) {
        const container = document.getElementById('newsList');
        container.innerHTML = articles.map(article => `
            <div class="news-item" onclick="window.open('${article.url}', '_blank')">
                <div class="news-title">${article.title}</div>
                <div class="news-source">${article.source} • ${new Date(article.published_on * 1000).toLocaleDateString()}</div>
            </div>
        `).join('');
    }
}
window.NewsTicker = NewsTicker;