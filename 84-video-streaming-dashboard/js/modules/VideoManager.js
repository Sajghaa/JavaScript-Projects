class VideoManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.videoCard = new VideoCard(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderVideos();
        this.eventBus.on('category:changed', () => this.renderVideos());
        this.eventBus.on('search:updated', () => this.renderVideos());
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.onclick = () => {
                const view = btn.dataset.view;
                this.stateManager.set('viewMode', view);
                document.querySelectorAll('.view-btn').forEach(b=>b.classList.remove('active'));
                btn.classList.add('active');
                this.renderVideos();
            };
        });
    }

    renderVideos() {
        const container = document.getElementById('videosGrid');
        const videos = this.stateManager.getFilteredVideos();
        const viewMode = this.stateManager.get('viewMode');
        container.className = `videos-grid ${viewMode === 'list' ? 'list-view' : ''}`;
        container.innerHTML = videos.map(v => this.videoCard.render(v, viewMode)).join('');
        this.attachEvents();
    }

    attachEvents() {
        document.querySelectorAll('.video-card').forEach(card => {
            card.onclick = (e) => {
                if(!e.target.closest('.favorite-btn') && !e.target.closest('.queue-btn') && !e.target.closest('.watchlater-btn')) {
                    const id = card.dataset.videoId;
                    this.eventBus.emit('video:select', id);
                }
            };
        });
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.eventBus.emit('video:favorite', btn.dataset.id); };
        });
        document.querySelectorAll('.queue-btn').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.eventBus.emit('video:queue', btn.dataset.id); };
        });
        document.querySelectorAll('.watchlater-btn').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.eventBus.emit('video:watchlater', btn.dataset.id); };
        });
    }
}
window.VideoManager = VideoManager;