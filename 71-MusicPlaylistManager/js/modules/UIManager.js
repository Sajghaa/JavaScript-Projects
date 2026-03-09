export class UIManager {
    constructor(stateManager, trackManager, playlistManager, audioPlayer) {
        this.stateManager = stateManager;
        this.trackManager = trackManager;
        this.playlistManager = playlistManager;
        this.audioPlayer = audioPlayer;
        
        this.elements = this.cacheElements();
        this.initEventListeners();
        this.initSubscriptions();
        this.updateUI();
    }

    // Cache DOM elements
    cacheElements() {
        return {
            tracksContainer: document.getElementById('tracksContainer'),
            emptyState: document.getElementById('emptyState'),
            loadingState: document.getElementById('loadingState'),
            totalTracks: document.getElementById('totalTracks'),
            favoritesCount: document.getElementById('favoritesCount'),
            currentViewTitle: document.getElementById('currentViewTitle'),
            viewDescription: document.getElementById('viewDescription'),
            searchInput: document.getElementById('searchInput'),
            sortBtn: document.getElementById('sortBtn'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Now playing elements
            currentTrackArtwork: document.getElementById('currentTrackArtwork'),
            currentTrackTitle: document.getElementById('currentTrackTitle'),
            currentTrackArtist: document.getElementById('currentTrackArtist'),
            favoriteCurrentBtn: document.getElementById('favoriteCurrentBtn'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            volumeBtn: document.getElementById('volumeBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            progressBar: document.getElementById('progressBar'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            
            // Modals
            playlistModal: document.getElementById('playlistModal'),
            addToPlaylistModal: document.getElementById('addToPlaylistModal'),
            closeModalBtns: document.querySelectorAll('.close-modal'),
            
            // Buttons
            createPlaylistBtn: document.getElementById('createPlaylistBtn'),
            addSampleTracks: document.getElementById('addSampleTracks'),
            
            // Menu items
            menuItems: document.querySelectorAll('.menu-item')
        };
    }

    // Initialize event listeners
    initEventListeners() {
        // Search
        this.elements.searchInput.addEventListener('input', (e) => {
            this.stateManager.set('searchQuery', e.target.value);
        });

        // Sort
        this.elements.sortBtn.addEventListener('click', () => this.toggleSort());

        // Theme
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Create playlist
        this.elements.createPlaylistBtn.addEventListener('click', () => {
            this.playlistManager.showCreatePlaylistModal();
        });

        // Add sample tracks
        this.elements.addSampleTracks.addEventListener('click', () => {
            this.trackManager.loadSampleTracks();
        });

        // Menu items
        this.elements.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.switchView(item.dataset.view);
            });
        });

        // Close modal buttons
        this.elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Player controls
        this.elements.playPauseBtn.addEventListener('click', () => {
            this.audioPlayer.togglePlay();
        });

        this.elements.prevBtn.addEventListener('click', () => {
            this.audioPlayer.playPreviousTrack();
        });

        this.elements.nextBtn.addEventListener('click', () => {
            this.audioPlayer.playNextTrack();
        });

        this.elements.shuffleBtn.addEventListener('click', () => {
            this.audioPlayer.toggleShuffle();
        });

        this.elements.repeatBtn.addEventListener('click', () => {
            this.audioPlayer.toggleRepeat();
        });

        this.elements.volumeBtn.addEventListener('click', () => {
            this.audioPlayer.toggleMute();
        });

        this.elements.volumeSlider.addEventListener('input', (e) => {
            this.audioPlayer.setVolume(parseInt(e.target.value));
        });

        this.elements.progressBar.addEventListener('input', (e) => {
            const duration = this.stateManager.get('player').duration;
            if (duration) {
                const position = (parseInt(e.target.value) / 100) * duration;
                this.audioPlayer.seek(position);
            }
        });

        this.elements.favoriteCurrentBtn.addEventListener('click', () => {
            const currentTrack = this.stateManager.get('currentTrack');
            if (currentTrack) {
                this.trackManager.handleFavoriteClick(
                    currentTrack, 
                    this.elements.favoriteCurrentBtn
                );
            }
        });

        // Custom event listeners
        document.addEventListener('notification', (e) => {
            this.showToast(e.detail.message, e.detail.type);
        });
    }

    // Initialize state subscriptions
    initSubscriptions() {
        // Subscribe to tracks changes
        this.stateManager.subscribe('tracks', () => {
            this.updateUI();
        });

        // Subscribe to current view
        this.stateManager.subscribe('currentView', () => {
            this.updateUI();
        });

        // Subscribe to search query
        this.stateManager.subscribe('searchQuery', () => {
            this.updateUI();
        });

        // Subscribe to current track
        this.stateManager.subscribe('currentTrack', (track) => {
            this.updateNowPlaying(track);
        });

        // Subscribe to player state
        this.stateManager.subscribe('player', (player) => {
            this.updatePlayerUI(player);
        });

        // Subscribe to favorites
        this.stateManager.subscribe('favorites', (favorites) => {
            this.elements.favoritesCount.textContent = favorites.length;
        });
    }

    // Update UI based on current state
    updateUI() {
        const tracks = this.stateManager.getCurrentViewTracks();
        const currentView = this.stateManager.get('currentView');
        const searchQuery = this.stateManager.get('searchQuery');
        
        // Update counts
        this.elements.totalTracks.textContent = this.stateManager.get('tracks').length;
        
        // Update view title
        this.updateViewTitle(currentView);
        
        // Clear container
        this.elements.tracksContainer.innerHTML = '';
        
        // Show empty state if no tracks
        if (tracks.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            this.elements.tracksContainer.classList.add('hidden');
        } else {
            this.elements.emptyState.classList.add('hidden');
            this.elements.tracksContainer.classList.remove('hidden');
            
            // Render tracks
            tracks.forEach(track => {
                const card = this.trackManager.createTrackCard(track);
                this.elements.tracksContainer.appendChild(card);
            });
        }
        
        // Update active menu item
        this.updateActiveMenu(currentView);
    }

    // Update view title
    updateViewTitle(view) {
        const titles = {
            'all-tracks': { title: 'All Tracks', desc: 'Browse your music library' },
            'favorites': { title: 'Favorites', desc: 'Your liked tracks' },
            'recent': { title: 'Recently Played', desc: 'Your listening history' },
            'playlist': { 
                title: this.stateManager.get('currentPlaylist')?.name || 'Playlist',
                desc: `${this.stateManager.get('currentPlaylist')?.tracks.length || 0} tracks`
            }
        };
        
        const current = titles[view] || titles['all-tracks'];
        this.elements.currentViewTitle.textContent = current.title;
        this.elements.viewDescription.textContent = current.desc;
    }

    // Update active menu
    updateActiveMenu(view) {
        this.elements.menuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
    }

    // Switch view
    switchView(view) {
        this.stateManager.set('currentView', view);
        if (view !== 'playlist') {
            this.stateManager.set('currentPlaylist', null);
        }
    }

    // Update now playing UI
    updateNowPlaying(track) {
        if (track) {
            this.elements.currentTrackArtwork.src = track.artwork || 'https://via.placeholder.com/56x56';
            this.elements.currentTrackTitle.textContent = track.title;
            this.elements.currentTrackArtist.textContent = track.artist;
            
            const isFavorite = this.stateManager.isFavorite(track.id);
            this.elements.favoriteCurrentBtn.classList.toggle('active', isFavorite);
        } else {
            this.elements.currentTrackArtwork.src = 'https://via.placeholder.com/56x56';
            this.elements.currentTrackTitle.textContent = 'No track playing';
            this.elements.currentTrackArtist.textContent = 'Select a track to play';
        }
    }

    // Update player UI
    updatePlayerUI(player) {
        // Play/Pause button
        const playIcon = this.elements.playPauseBtn.querySelector('i');
        playIcon.className = player.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        
        // Shuffle button
        this.elements.shuffleBtn.classList.toggle('active', player.shuffle);
        
        // Repeat button
        const repeatIcons = {
            'off': 'fa-repeat',
            'one': 'fa-repeat-1',
            'all': 'fa-repeat'
        };
        const repeatIcon = this.elements.repeatBtn.querySelector('i');
        repeatIcon.className = `fas ${repeatIcons[player.repeat]}`;
        this.elements.repeatBtn.classList.toggle('active', player.repeat !== 'off');
        
        // Volume button
        const volumeIcon = this.elements.volumeBtn.querySelector('i');
        if (player.isMuted || player.volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (player.volume < 30) {
            volumeIcon.className = 'fas fa-volume-off';
        } else if (player.volume < 70) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
        
        // Volume slider
        this.elements.volumeSlider.value = player.isMuted ? 0 : player.volume;
        
        // Progress
        const progressPercent = (player.currentTime / player.duration) * 100 || 0;
        this.elements.progressBar.value = progressPercent;
        this.elements.currentTime.textContent = this.audioPlayer.formatTime(player.currentTime);
        this.elements.duration.textContent = this.audioPlayer.formatTime(player.duration);
    }

    // Toggle sort
    toggleSort() {
        const filters = this.stateManager.get('filters');
        const sortOrders = ['asc', 'desc'];
        const currentIndex = sortOrders.indexOf(filters.sortOrder);
        const nextOrder = sortOrders[(currentIndex + 1) % sortOrders.length];
        
        this.stateManager.update({
            filters: {
                ...filters,
                sortOrder: nextOrder
            }
        });
        
        const icon = this.elements.sortBtn.querySelector('i');
        icon.className = nextOrder === 'asc' ? 'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Load saved theme
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}