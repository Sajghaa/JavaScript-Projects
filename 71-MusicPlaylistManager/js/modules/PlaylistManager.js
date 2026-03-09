export class PlaylistManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    // Create playlist element
    createPlaylistElement(playlist) {
        const element = document.createElement('div');
        element.className = 'playlist-item';
        element.dataset.id = playlist.id;
        
        const isActive = this.stateManager.get('currentPlaylist')?.id === playlist.id;
        if (isActive) {
            element.classList.add('active');
        }

        element.innerHTML = `
            <i class="fas fa-list"></i>
            <div class="playlist-info">
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-count">${playlist.tracks.length} tracks</div>
            </div>
            <div class="playlist-actions">
                <button class="edit-playlist" title="Edit playlist">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-playlist" title="Delete playlist">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        this.addPlaylistEventListeners(element, playlist);
        
        return element;
    }

    // Add event listeners to playlist
    addPlaylistEventListeners(element, playlist) {
        // Playlist click
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.playlist-actions')) {
                this.selectPlaylist(playlist);
            }
        });

        // Edit button
        const editBtn = element.querySelector('.edit-playlist');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEditPlaylistModal(playlist);
        });

        // Delete button
        const deleteBtn = element.querySelector('.delete-playlist');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDeletePlaylist(playlist);
        });
    }

    // Select playlist
    selectPlaylist(playlist) {
        this.stateManager.update({
            currentPlaylist: playlist,
            currentView: 'playlist'
        });
        
        // Update UI
        document.querySelectorAll('.playlist-item').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`.playlist-item[data-id="${playlist.id}"]`).classList.add('active');
        
        document.querySelectorAll('.menu-item').forEach(el => {
            el.classList.remove('active');
        });
        
        // Update header
        document.getElementById('currentViewTitle').textContent = playlist.name;
        document.getElementById('viewDescription').textContent = `${playlist.tracks.length} tracks`;
    }

    // Show create playlist modal
    showCreatePlaylistModal() {
        const modal = document.getElementById('playlistModal');
        const title = modal.querySelector('h2');
        const saveBtn = document.getElementById('savePlaylistBtn');
        
        title.textContent = 'Create New Playlist';
        saveBtn.textContent = 'Create Playlist';
        
        // Clear form
        document.getElementById('playlistName').value = '';
        document.getElementById('playlistDescription').value = '';
        document.getElementById('playlistArtwork').value = '';
        
        // Set save handler
        saveBtn.onclick = () => this.createPlaylist();
        
        modal.classList.add('active');
    }

    // Show edit playlist modal
    showEditPlaylistModal(playlist) {
        const modal = document.getElementById('playlistModal');
        const title = modal.querySelector('h2');
        const saveBtn = document.getElementById('savePlaylistBtn');
        
        title.textContent = 'Edit Playlist';
        saveBtn.textContent = 'Save Changes';
        
        // Fill form
        document.getElementById('playlistName').value = playlist.name;
        document.getElementById('playlistDescription').value = playlist.description || '';
        document.getElementById('playlistArtwork').value = playlist.artwork || '';
        
        // Set save handler
        saveBtn.onclick = () => this.updatePlaylist(playlist.id);
        
        modal.classList.add('active');
    }

    // Create playlist
    createPlaylist() {
        const name = document.getElementById('playlistName').value.trim();
        if (!name) {
            this.showNotification('Please enter a playlist name', 'error');
            return;
        }
        
        const playlist = {
            name,
            description: document.getElementById('playlistDescription').value.trim(),
            artwork: document.getElementById('playlistArtwork').value.trim()
        };
        
        const newPlaylist = this.stateManager.createPlaylist(playlist);
        this.renderPlaylist(newPlaylist);
        
        this.closeModal();
        this.showNotification('Playlist created', 'success');
    }

    // Update playlist
    updatePlaylist(playlistId) {
        const name = document.getElementById('playlistName').value.trim();
        if (!name) {
            this.showNotification('Please enter a playlist name', 'error');
            return;
        }
        
        const updates = {
            name,
            description: document.getElementById('playlistDescription').value.trim(),
            artwork: document.getElementById('playlistArtwork').value.trim()
        };
        
        this.stateManager.updatePlaylist(playlistId, updates);
        
        // Refresh UI
        this.refreshPlaylists();
        
        this.closeModal();
        this.showNotification('Playlist updated', 'success');
    }

    // Handle delete playlist
    handleDeletePlaylist(playlist) {
        if (confirm(`Delete "${playlist.name}"?`)) {
            this.stateManager.deletePlaylist(playlist.id);
            
            // Remove from UI
            document.querySelector(`.playlist-item[data-id="${playlist.id}"]`).remove();
            
            this.showNotification('Playlist deleted', 'success');
        }
    }

    // Render playlist in sidebar
    renderPlaylist(playlist) {
        const container = document.getElementById('playlistsList');
        const element = this.createPlaylistElement(playlist);
        container.appendChild(element);
    }

    // Refresh all playlists
    refreshPlaylists() {
        const container = document.getElementById('playlistsList');
        container.innerHTML = '';
        
        const playlists = this.stateManager.get('playlists');
        playlists.forEach(playlist => {
            container.appendChild(this.createPlaylistElement(playlist));
        });
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('playlistModal');
        modal.classList.remove('active');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const event = new CustomEvent('notification', { 
            detail: { message, type } 
        });
        document.dispatchEvent(event);
    }
}