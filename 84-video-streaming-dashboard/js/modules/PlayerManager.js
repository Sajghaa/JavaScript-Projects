class PlayerManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.videoPlayer = new VideoPlayer(stateManager, eventBus);
        this.init();
    }

    init() {
        this.eventBus.on('video:select', (id) => this.playVideo(id));
        document.getElementById('likeBtn').onclick = () => this.likeVideo();
        document.getElementById('addToQueueBtn').onclick = () => this.addCurrentToQueue();
        document.getElementById('watchLaterBtn').onclick = () => this.addCurrentToWatchLater();
        document.getElementById('favoriteBtn').onclick = () => this.toggleFavoriteCurrent();
    }

    playVideo(id) {
        const video = this.stateManager.get('videos').find(v=>v.id===id);
        if(video) {
            this.stateManager.set('currentVideo', video);
            document.getElementById('videoPlayer').innerHTML = this.videoPlayer.render(video);
            this.videoPlayer.updateInfo(video);
            this.eventBus.emit('toast', { message: `Now playing: ${video.title}`, type: 'success' });
        }
    }

    likeVideo() {
        const current = this.stateManager.get('currentVideo');
        if(current) { this.stateManager.likeVideo(current.id); this.videoPlayer.updateInfo(current); this.eventBus.emit('toast', { message: 'Liked!', type: 'success' }); }
    }

    addCurrentToQueue() {
        const current = this.stateManager.get('currentVideo');
        if(current) { this.stateManager.addToQueue(current); this.eventBus.emit('toast', { message: 'Added to queue', type: 'success' }); }
    }

    addCurrentToWatchLater() {
        const current = this.stateManager.get('currentVideo');
        if(current) { this.stateManager.addToWatchLater(current); this.eventBus.emit('toast', { message: 'Added to Watch Later', type: 'success' }); }
    }

    toggleFavoriteCurrent() {
        const current = this.stateManager.get('currentVideo');
        if(current) { this.stateManager.toggleFavorite(current.id); this.videoPlayer.updateInfo(current); this.eventBus.emit('toast', { message: this.stateManager.isFavorite(current.id) ? 'Added to favorites' : 'Removed from favorites', type: 'success' }); }
    }
}
window.PlayerManager = PlayerManager;