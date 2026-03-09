import { StateManager } from './modules/StateManager.js';
import { AudioPlayer } from './modules/AudioPlayer.js';
import { TrackManager } from './modules/TrackManager.js';
import { PlaylistManager } from './modules/PlaylistManager.js';
import { UIManager } from './modules/UIManager.js';
import { sampleTracks, samplePlaylists } from './data/sampleData.js';

class MusicApp {
    constructor() {
        this.stateManager = new StateManager();
        this.audioPlayer = new AudioPlayer(this.stateManager);
        this.trackManager = new TrackManager(this.stateManager, this.audioPlayer);
        this.playlistManager = new PlaylistManager(this.stateManager);
        this.uiManager = new UIManager(
            this.stateManager, 
            this.trackManager, 
            this.playlistManager,
            this.audioPlayer
        );
        
        this.initialize();
    }

    initialize() {
        // Load initial data if empty
        this.loadInitialData();
        
        // Load theme
        this.uiManager.loadTheme();
        
        // Refresh playlists
        this.playlistManager.refreshPlaylists();
        
        // Show welcome message
        this.uiManager.showToast('Welcome to Music Playlist Manager! 🎵', 'success');
    }

    loadInitialData() {
        const tracks = this.stateManager.get('tracks');
        const playlists = this.stateManager.get('playlists');
        
        if (tracks.length === 0) {
            sampleTracks.forEach(track => {
                this.stateManager.addTrack(track);
            });
        }
        
        if (playlists.length === 0) {
            samplePlaylists.forEach(playlist => {
                this.stateManager.createPlaylist(playlist);
            });
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicApp();
});