class StateManager {
    constructor() {
        this.state = {
            videos: [],
            currentVideo: null,
            queue: [],
            watchLater: [],
            favorites: [],
            categories: [
                { id: 'all', name: 'All', icon: '🔥' },
                { id: 'music', name: 'Music', icon: '🎵' },
                { id: 'gaming', name: 'Gaming', icon: '🎮' },
                { id: 'movies', name: 'Movies', icon: '🎬' },
                { id: 'sports', name: 'Sports', icon: '⚽' },
                { id: 'news', name: 'News', icon: '📰' }
            ],
            currentCategory: 'all',
            searchQuery: '',
            viewMode: 'grid',
            likes: {}
        };
        this.listeners = new Map();
        this.loadFromStorage();
        this.initSampleVideos();
    }

    initSampleVideos() {
        if (this.state.videos.length === 0) {
            this.state.videos = [
                { id: '1', title: 'Top 10 JavaScript Tips', channel: 'CodeMaster', views: '125K', duration: '12:34', date: '2 days ago', category: 'technology', thumbnail: 'https://picsum.photos/300/200?random=1', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Learn the best JavaScript tips and tricks from an expert developer.' },
                { id: '2', title: 'Summer Vibes Mix', channel: 'MusicHub', views: '1.2M', duration: '45:20', date: '1 week ago', category: 'music', thumbnail: 'https://picsum.photos/300/200?random=2', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Best summer hits mix to brighten your day.' },
                { id: '3', title: 'Epic Gaming Montage', channel: 'GamePro', views: '890K', duration: '8:15', date: '3 days ago', category: 'gaming', thumbnail: 'https://picsum.photos/300/200?random=3', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Amazing gaming moments compilation.' },
                { id: '4', title: 'Movie Trailer 2024', channel: 'Cinema Central', views: '5.1M', duration: '2:30', date: '1 day ago', category: 'movies', thumbnail: 'https://picsum.photos/300/200?random=4', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'First look at the most anticipated movie of 2024.' },
                { id: '5', title: 'Live Concert Highlights', channel: 'LiveMusic', views: '450K', duration: '1:15:30', date: '5 days ago', category: 'music', thumbnail: 'https://picsum.photos/300/200?random=5', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Best moments from the live concert.' },
                { id: '6', title: 'Tech News Weekly', channel: 'TechToday', views: '78K', duration: '22:45', date: '4 hours ago', category: 'news', thumbnail: 'https://picsum.photos/300/200?random=6', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'This week in technology news.' },
                { id: '7', title: 'Football Highlights', channel: 'SportsZone', views: '2.3M', duration: '10:20', date: '12 hours ago', category: 'sports', thumbnail: 'https://picsum.photos/300/200?random=7', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Best goals and moments from this week.' },
                { id: '8', title: 'Coding Tutorial', channel: 'DevLife', views: '234K', duration: '35:00', date: '1 day ago', category: 'technology', thumbnail: 'https://picsum.photos/300/200?random=8', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Complete guide to modern web development.' }
            ];
            this.saveToStorage();
        }
    }

    get(path) { return path.split('.').reduce((o,k)=>o?.[k], this.state); }
    set(path, value) {
        const keys = path.split('.'), last = keys.pop(), target = keys.reduce((o,k)=>o[k], this.state);
        target[last] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }
    subscribe(path, cb) { if(!this.listeners.has(path)) this.listeners.set(path, new Set()); this.listeners.get(path).add(cb); return ()=>this.listeners.get(path)?.delete(cb); }
    notifyListeners(path, val) { if(this.listeners.has(path)) this.listeners.get(path).forEach(cb=>cb(val)); }

    getFilteredVideos() {
        let videos = [...this.state.videos];
        if(this.state.currentCategory !== 'all') videos = videos.filter(v=>v.category === this.state.currentCategory);
        if(this.state.searchQuery) videos = videos.filter(v=>v.title.toLowerCase().includes(this.state.searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(this.state.searchQuery.toLowerCase()));
        return videos;
    }

    addToQueue(video) { if(!this.state.queue.find(v=>v.id===video.id)) { this.state.queue.push(video); this.notifyListeners('queue', this.state.queue); this.saveToStorage(); } }
    removeFromQueue(id) { this.state.queue = this.state.queue.filter(v=>v.id!==id); this.notifyListeners('queue', this.state.queue); this.saveToStorage(); }
    clearQueue() { this.state.queue = []; this.notifyListeners('queue', this.state.queue); this.saveToStorage(); }

    addToWatchLater(video) { if(!this.state.watchLater.find(v=>v.id===video.id)) { this.state.watchLater.push(video); this.notifyListeners('watchLater', this.state.watchLater); this.saveToStorage(); } }
    removeFromWatchLater(id) { this.state.watchLater = this.state.watchLater.filter(v=>v.id!==id); this.notifyListeners('watchLater', this.state.watchLater); this.saveToStorage(); }

    toggleFavorite(id) { const idx = this.state.favorites.indexOf(id); if(idx===-1) this.state.favorites.push(id); else this.state.favorites.splice(idx,1); this.notifyListeners('favorites', this.state.favorites); this.saveToStorage(); }
    isFavorite(id) { return this.state.favorites.includes(id); }

    likeVideo(id) { this.state.likes[id] = (this.state.likes[id]||0)+1; this.notifyListeners('likes', this.state.likes); this.saveToStorage(); }
    getLikes(id) { return this.state.likes[id] || 0; }

    saveToStorage() { try { localStorage.setItem('video_state', JSON.stringify({ queue: this.state.queue, watchLater: this.state.watchLater, favorites: this.state.favorites, likes: this.state.likes })); } catch(e){} }
    loadFromStorage() { try { const saved = localStorage.getItem('video_state'); if(saved) { const data = JSON.parse(saved); this.state.queue = data.queue || []; this.state.watchLater = data.watchLater || []; this.state.favorites = data.favorites || []; this.state.likes = data.likes || {}; } } catch(e){} }
}
window.StateManager = StateManager;