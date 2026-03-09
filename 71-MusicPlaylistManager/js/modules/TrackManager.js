import { sampleTracks } from '../data/sampleData.js';

export class TrackManager {
    constructor(stateManager, audioPlayer) {
        this.stateManager = stateManager;
        this.audioPlayer = audioPlayer;
    }

    // Load sample tracks
    loadSampleTracks() {
        sampleTracks.forEach(track => {
            this.stateManager.addTrack(track);
        });
        
        this.showNotification(`Loaded ${sampleTracks.length} sample tracks`, 'success');
    }

    // Create track card element
    createTrackCard(track) {
        const card = document.createElement('div');
        card.className = 'track-card';
        card.dataset.id = track.id;
        
        const isFavorite = this.stateManager.isFavorite(track.id);
        const isPlaying = this.stateManager.get('currentTrack')?.id === track.id;
        
        if (isPlaying) {
            card.classList.add('playing');
        }

        card.innerHTML = `
            <div class="track-artwork">
                <img src="${track.artwork || 'https://via.placeholder.com/200'}" alt="${track.title}">
                <div class="track-overlay">
                    <button class="play-track-btn" data-id="${track.id}">
                        <i class="fas fa-${isPlaying ? 'pause' : 'play'}"></i>
                    </button>
                </div>
            </div>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
                <div class="track-meta">
                    <span>${track.duration || '3:30'}</span>
                    ${track.album ? `<span>${track.album}</span>` : ''}
                </div>
                <div class="track-actions">
                    <button class="favorite ${isFavorite ? 'active' : ''}" title="Add to favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="add-to-playlist" title="Add to playlist">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-track" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.addTrackEventListeners(card, track);
        
        return card;
    }

    // Add event listeners to track card
    addTrackEventListeners(card, track) {
        // Play button
        const playBtn = card.querySelector('.play-track-btn');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handlePlayClick(track);
        });

        // Favorite button
        const favBtn = card.querySelector('.favorite');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleFavoriteClick(track, favBtn);
        });

        // Add to playlist button
        const addBtn = card.querySelector('.add-to-playlist');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showAddToPlaylistModal(track);
        });

        // Remove button
        const removeBtn = card.querySelector('.remove-track');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleRemoveTrack(track);
        });

        // Card click
        card.addEventListener('click', () => {
            this.handlePlayClick(track);
        });
    }

    // Handle play click
    handlePlayClick(track) {
        const currentTrack = this.stateManager.get('currentTrack');
        const isPlaying = this.stateManager.get('player').isPlaying;
        
        if (currentTrack?.id === track.id) {
            this.audioPlayer.togglePlay();
        } else {
            this.audioPlayer.playTrack(track);
        }
    }

    // Handle favorite click
    handleFavoriteClick(track, button) {
        const isFavorite = this.stateManager.toggleFavorite(track.id);
        button.classList.toggle('active', isFavorite);
        
        this.showNotification(
            isFavorite ? `Added to favorites` : `Removed from favorites`,
            'success'
        );
    }

    // Handle remove track
    handleRemoveTrack(track) {
        if (confirm(`Remove "${track.title}" from your library?`)) {
            this.stateManager.removeTrack(track.id);
            this.showNotification('Track removed', 'success');
        }
    }

    // Show add to playlist modal
    showAddToPlaylistModal(track) {
        const modal = document.getElementById('addToPlaylistModal');
        const selection = document.getElementById('playlistSelection');
        
        const playlists = this.stateManager.get('playlists');
        
        if (playlists.length === 0) {
            selection.innerHTML = `
                <div class="empty-state small">
                    <p>No playlists yet</p>
                    <button onclick="document.getElementById('createPlaylistBtn').click()">
                        Create a playlist
                    </button>
                </div>
            `;
        } else {
            selection.innerHTML = playlists.map(playlist => `
                <div class="playlist-option" data-id="${playlist.id}">
                    <i class="fas fa-list"></i>
                    <div class="playlist-option-info">
                        <div class="playlist-option-name">${playlist.name}</div>
                        <div class="playlist-option-count">${playlist.tracks.length} tracks</div>
                    </div>
                </div>
            `).join('');
            
            selection.querySelectorAll('.playlist-option').forEach(option => {
                option.addEventListener('click', () => {
                    const playlistId = option.dataset.id;
                    this.stateManager.addTrackToPlaylist(track.id, playlistId);
                    modal.classList.remove('active');
                    this.showNotification(`Added to playlist`, 'success');
                });
            });
        }
        
        modal.classList.add('active');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const event = new CustomEvent('notification', { 
            detail: { message, type } 
        });
        document.dispatchEvent(event);
    }
}