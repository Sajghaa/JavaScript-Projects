// NewsTicker.js - Renders news ticker
class NewsTicker {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.render();
    }

    render() {
        const container = document.getElementById('newsList');
        const news = this.stateManager.get('news');
        
        container.innerHTML = news.map(item => `
            <div class="news-item">
                <div class="news-title">${item.title}</div>
                <div class="news-time">${item.time} • ${item.source}</div>
            </div>
        `).join('');
    }
}

window.NewsTicker = NewsTicker;