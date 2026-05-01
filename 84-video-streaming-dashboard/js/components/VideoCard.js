class VideoCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(video, viewMode = 'grid') {
        const isFavorite = this.stateManager.isFavorite(video.id);
        const likes = this.stateManager.getLikes(video.id);
        return `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <span class="video-duration">${video.duration}</span>
                </div>
                <div class="video-info-card">
                    <div class="video-title">${this.escapeHtml(video.title)}</div>
                    <div class="video-channel">${video.channel}</div>
                    <div class="video-stats">
                        <span><i class="fas fa-eye"></i> ${video.views}</span>
                        <span><i class="fas fa-thumbs-up"></i> ${likes}</span>
                        <span><i class="far fa-clock"></i> ${video.date}</span>
                    </div>
                    <div class="video-actions" style="margin-top: 8px;">
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${video.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="queue-btn" data-id="${video.id}">
                            <i class="fas fa-list"></i>
                        </button>
                        <button class="watchlater-btn" data-id="${video.id}">
                            <i class="far fa-clock"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
}
window.VideoCard = VideoCard;