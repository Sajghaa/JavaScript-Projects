class VideoPlayer {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(video) {
        if(!video) return `<div class="player-placeholder"><i class="fas fa-play-circle"></i><p>Select a video to play</p></div>`;
        return `<iframe src="${video.videoUrl}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }

    updateInfo(video) {
        const likes = this.stateManager.getLikes(video.id);
        const isFavorite = this.stateManager.isFavorite(video.id);
        document.getElementById('currentVideoTitle').textContent = video.title;
        document.getElementById('currentVideoDescription').textContent = video.description;
        document.getElementById('currentVideoMeta').innerHTML = `
            <span><i class="fas fa-eye"></i> ${video.views} views</span>
            <span><i class="fas fa-calendar"></i> ${video.date}</span>
            <span><i class="fas fa-clock"></i> ${video.duration}</span>
        `;
        const likeBtn = document.getElementById('likeBtn');
        likeBtn.querySelector('span').textContent = likes;
        const favBtn = document.getElementById('favoriteBtn');
        if(isFavorite) favBtn.classList.add('active');
        else favBtn.classList.remove('active');
    }
}
window.VideoPlayer = VideoPlayer;