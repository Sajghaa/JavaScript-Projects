export class AudioPlayer {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.audio = new Audio();
        this.audio.volume = this.stateManager.get('player').volume / 100;
        
        this.initEventListeners();
    }

    // Initialize audio event listeners
    initEventListeners() {
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });

        this.audio.addEventListener('ended', () => {
            this.handleTrackEnd();
        });

        this.audio.addEventListener('play', () => {
            this.stateManager.update({
                player: {
                    ...this.stateManager.get('player'),
                    isPlaying: true
                }
            });
        });

        this.audio.addEventListener('pause', () => {
            this.stateManager.update({
                player: {
                    ...this.stateManager.get('player'),
                    isPlaying: false
                }
            });
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.showNotification('Error playing track', 'error');
        });
    }

    // Load and play track
    async playTrack(track) {
        try {
            // For demo purposes, we'll simulate audio playback
            // In production, you would use actual audio files
            this.simulatePlayback(track);
            
            this.stateManager.set('currentTrack', track);
            this.stateManager.addToRecentlyPlayed(track.id);
            
            this.showNotification(`Now playing: ${track.title}`, 'success');
        } catch (error) {
            console.error('Error playing track:', error);
            this.showNotification('Failed to play track', 'error');
        }
    }

    // Simulate playback for demo (since we don't have actual audio files)
    simulatePlayback(track) {
        // Simulate loading metadata
        setTimeout(() => {
            this.audio.dispatchEvent(new Event('loadedmetadata'));
        }, 100);
        
        // Simulate time updates
        let currentTime = 0;
        const duration = this.parseDuration(track.duration) || 180; // Default 3 minutes
        
        this.stateManager.update({
            player: {
                ...this.stateManager.get('player'),
                duration: duration,
                isPlaying: true
            }
        });
        
        const interval = setInterval(() => {
            if (!this.stateManager.get('player').isPlaying) {
                clearInterval(interval);
                return;
            }
            
            currentTime += 1;
            if (currentTime >= duration) {
                currentTime = duration;
                clearInterval(interval);
                this.handleTrackEnd();
            }
            
            this.stateManager.update({
                player: {
                    ...this.stateManager.get('player'),
                    currentTime: currentTime
                }
            });
        }, 1000);
    }

    // Parse duration string (e.g., "3:45" to seconds)
    parseDuration(duration) {
        if (!duration) return 180;
        const parts = duration.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return 180;
    }

    // Pause current track
    pause() {
        this.audio.pause();
    }

    // Resume current track
    play() {
        this.audio.play();
    }

    // Toggle play/pause
    togglePlay() {
        const player = this.stateManager.get('player');
        this.stateManager.update({
            player: {
                ...player,
                isPlaying: !player.isPlaying
            }
        });
    }

    // Stop current track
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.stateManager.set('currentTrack', null);
    }

    // Seek to position
    seek(position) {
        this.audio.currentTime = position;
    }

    // Set volume
    setVolume(volume) {
        const normalizedVolume = Math.max(0, Math.min(100, volume));
        this.audio.volume = normalizedVolume / 100;
        
        this.stateManager.update({
            player: {
                ...this.stateManager.get('player'),
                volume: normalizedVolume,
                isMuted: normalizedVolume === 0
            }
        });
    }

    // Toggle mute
    toggleMute() {
        const player = this.stateManager.get('player');
        const newMuted = !player.isMuted;
        
        this.stateManager.update({
            player: {
                ...player,
                isMuted: newMuted,
                volume: newMuted ? 0 : player.volume
            }
        });
    }

    // Update progress
    updateProgress() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration || 0;
        
        this.stateManager.update({
            player: {
                ...this.stateManager.get('player'),
                currentTime,
                duration
            }
        });
    }

    // Update duration
    updateDuration() {
        this.stateManager.update({
            player: {
                ...this.stateManager.get('player'),
                duration: this.audio.duration
            }
        });
    }

    // Handle track end
    handleTrackEnd() {
        const player = this.stateManager.get('player');
        const tracks = this.stateManager.getCurrentViewTracks();
        const currentTrack = this.stateManager.get('currentTrack');
        
        if (!currentTrack) return;
        
        switch (player.repeat) {
            case 'one':
                // Repeat current track
                this.playTrack(currentTrack);
                break;
                
            case 'all':
                // Play next track or loop to first
                this.playNextTrack();
                break;
                
            default:
                // Play next track if available
                if (player.shuffle) {
                    this.playRandomTrack();
                } else {
                    this.playNextTrack();
                }
        }
    }

    // Play next track
    playNextTrack() {
        const tracks = this.stateManager.getCurrentViewTracks();
        const currentTrack = this.stateManager.get('currentTrack');
        
        if (!tracks.length || !currentTrack) return;
        
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        let nextIndex = currentIndex + 1;
        
        if (nextIndex >= tracks.length) {
            // Loop to beginning if repeat all
            if (this.stateManager.get('player').repeat === 'all') {
                nextIndex = 0;
            } else {
                this.stop();
                return;
            }
        }
        
        this.playTrack(tracks[nextIndex]);
    }

    // Play previous track
    playPreviousTrack() {
        const tracks = this.stateManager.getCurrentViewTracks();
        const currentTrack = this.stateManager.get('currentTrack');
        
        if (!tracks.length || !currentTrack) return;
        
        // If current time > 3 seconds, restart current track
        if (this.stateManager.get('player').currentTime > 3) {
            this.seek(0);
            return;
        }
        
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        let prevIndex = currentIndex - 1;
        
        if (prevIndex < 0) {
            prevIndex = tracks.length - 1;
        }
        
        this.playTrack(tracks[prevIndex]);
    }

    // Play random track
    playRandomTrack() {
        const tracks = this.stateManager.getCurrentViewTracks();
        if (!tracks.length) return;
        
        const randomIndex = Math.floor(Math.random() * tracks.length);
        this.playTrack(tracks[randomIndex]);
    }

    // Toggle repeat mode
    toggleRepeat() {
        const modes = ['off', 'one', 'all'];
        const currentMode = this.stateManager.get('player').repeat;
        const currentIndex = modes.indexOf(currentMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        
        this.stateManager.update({
            player: {
                ...this.stateManager.get('player'),
                repeat: nextMode
            }
        });
        
        this.showNotification(`Repeat: ${nextMode}`, 'info');
    }

    // Toggle shuffle
    toggleShuffle() {
        const shuffle = !this.stateManager.get('player').shuffle;
        
        this.stateManager.update({
            player: {
                ...this.stateManager.get('player'),
                shuffle
            }
        });
        
        this.showNotification(shuffle ? 'Shuffle on' : 'Shuffle off', 'info');
    }

    // Format time (seconds to MM:SS)
    formatTime(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Show notification
    showNotification(message, type = 'info') {
        const event = new CustomEvent('notification', { 
            detail: { message, type } 
        });
        document.dispatchEvent(event);
    }
}