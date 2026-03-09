// StateManager.js - Centralized state management
export class StateManager {
    constructor() {
        this.state = {
            tracks: [],
            playlists: [],
            currentTrack: null,
            currentPlaylist: null,
            currentView: 'all-tracks',
            searchQuery: '',
            filters: {
                sortBy: 'title',
                sortOrder: 'asc'
            },
            player: {
                isPlaying: false,
                currentTime: 0,
                duration: 0,
                volume: 70,
                isMuted: false,
                repeat: 'off', // off, one, all
                shuffle: false
            },
            favorites: [],
            recentlyPlayed: []
        };
        
        this.listeners = new Map();
        this.initFromStorage();
    }

    // Initialize from localStorage
    initFromStorage() {
        const savedState = StorageManager.load('playlistState');
        if (savedState) {
            this.state = { ...this.state, ...savedState };
        }
    }

    // Get state
    get(key) {
        return this.state[key];
    }

    // Set state
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        this.notifyListeners(key, value, oldValue);
        this.persist();
    }

    // Update multiple states
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            const oldValue = this.state[key];
            this.state[key] = value;
            this.notifyListeners(key, value, oldValue);
        });
        this.persist();
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.get(key)?.delete(callback);
        };
    }

    // Notify listeners
    notifyListeners(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    }

    // Persist state
    persist() {
        StorageManager.save('playlistState', this.state);
    }

    // Add track
    addTrack(track) {
        const tracks = [...this.state.tracks];
        if (!tracks.some(t => t.id === track.id)) {
            tracks.push({
                ...track,
                id: track.id || Date.now().toString(),
                dateAdded: new Date().toISOString()
            });
            this.set('tracks', tracks);
            return true;
        }
        return false;
    }

    // Remove track
    removeTrack(trackId) {
        const tracks = this.state.tracks.filter(t => t.id !== trackId);
        this.set('tracks', tracks);
        
        // Remove from playlists
        const playlists = this.state.playlists.map(playlist => ({
            ...playlist,
            tracks: playlist.tracks.filter(id => id !== trackId)
        }));
        this.set('playlists', playlists);
    }

    // Create playlist
    createPlaylist(playlist) {
        const playlists = [...this.state.playlists];
        const newPlaylist = {
            id: Date.now().toString(),
            tracks: [],
            dateCreated: new Date().toISOString(),
            ...playlist
        };
        playlists.push(newPlaylist);
        this.set('playlists', playlists);
        return newPlaylist;
    }

    // Update playlist
    updatePlaylist(playlistId, updates) {
        const playlists = this.state.playlists.map(playlist =>
            playlist.id === playlistId ? { ...playlist, ...updates } : playlist
        );
        this.set('playlists', playlists);
    }

    // Delete playlist
    deletePlaylist(playlistId) {
        const playlists = this.state.playlists.filter(p => p.id !== playlistId);
        this.set('playlists', playlists);
        
        if (this.state.currentPlaylist?.id === playlistId) {
            this.set('currentPlaylist', null);
        }
    }

    // Add track to playlist
    addTrackToPlaylist(trackId, playlistId) {
        const playlists = this.state.playlists.map(playlist => {
            if (playlist.id === playlistId && !playlist.tracks.includes(trackId)) {
                return {
                    ...playlist,
                    tracks: [...playlist.tracks, trackId]
                };
            }
            return playlist;
        });
        this.set('playlists', playlists);
    }

    // Remove track from playlist
    removeTrackFromPlaylist(trackId, playlistId) {
        const playlists = this.state.playlists.map(playlist => {
            if (playlist.id === playlistId) {
                return {
                    ...playlist,
                    tracks: playlist.tracks.filter(id => id !== trackId)
                };
            }
            return playlist;
        });
        this.set('playlists', playlists);
    }

    // Toggle favorite
    toggleFavorite(trackId) {
        const favorites = [...this.state.favorites];
        const index = favorites.indexOf(trackId);
        
        if (index === -1) {
            favorites.push(trackId);
        } else {
            favorites.splice(index, 1);
        }
        
        this.set('favorites', favorites);
        return index === -1;
    }

    // Check if track is favorite
    isFavorite(trackId) {
        return this.state.favorites.includes(trackId);
    }

    // Add to recently played
    addToRecentlyPlayed(trackId) {
        let recentlyPlayed = [...this.state.recentlyPlayed];
        recentlyPlayed = recentlyPlayed.filter(id => id !== trackId);
        recentlyPlayed.unshift(trackId);
        recentlyPlayed = recentlyPlayed.slice(0, 20); // Keep last 20
        
        this.set('recentlyPlayed', recentlyPlayed);
    }

    // Get tracks for current view
    getCurrentViewTracks() {
        let tracks = [...this.state.tracks];
        
        // Filter by view
        switch (this.state.currentView) {
            case 'favorites':
                tracks = tracks.filter(t => this.state.favorites.includes(t.id));
                break;
            case 'recent':
                tracks = tracks.filter(t => 
                    this.state.recentlyPlayed.includes(t.id)
                ).sort((a, b) => {
                    return this.state.recentlyPlayed.indexOf(a.id) - 
                           this.state.recentlyPlayed.indexOf(b.id);
                });
                break;
            case 'playlist':
                if (this.state.currentPlaylist) {
                    tracks = tracks.filter(t => 
                        this.state.currentPlaylist.tracks.includes(t.id)
                    );
                }
                break;
        }
        
        // Apply search filter
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            tracks = tracks.filter(t => 
                t.title.toLowerCase().includes(query) ||
                t.artist.toLowerCase().includes(query) ||
                (t.album && t.album.toLowerCase().includes(query))
            );
        }
        
        // Apply sorting
        const { sortBy, sortOrder } = this.state.filters;
        tracks.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'dateAdded') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return tracks;
    }
}