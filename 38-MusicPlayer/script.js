// =============================================
// NEXUS MUSIC - FIXED & WORKING Audio Player
// =============================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 NEXUS MUSIC Initializing...');
    
    // Quick initialization without heavy dependencies
    initPlayerQuick();
});

// SIMPLIFIED GLOBAL STATE
const PlayerState = {
    isPlaying: false,
    currentTrackIndex: 0,
    isShuffled: false,
    isRepeating: false,
    isMuted: false,
    volume: 0.7,
    playbackSpeed: 1.0
};

// SIMPLIFIED MUSIC LIBRARY with local fallback tracks
const musicLibrary = [
    {
        id: 1,
        title: "Electric Dreams",
        artist: "Neon Waves",
        album: "Cyberpunk Symphony",
        year: "2023",
        duration: "3:45",
        file: "https://assets.codepen.io/4358584/audio-1.mp3",
        artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&w=800&h=800&fit=crop",
        mood: "Energetic"
    },
    {
        id: 2,
        title: "Midnight Drive",
        artist: "Synthwave Collective",
        album: "Retro Futures",
        year: "2022",
        duration: "4:20",
        file: "https://assets.codepen.io/4358584/audio-2.mp3",
        artwork: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&w=800&h=800&fit=crop",
        mood: "Chill"
    },
    {
        id: 3,
        title: "Neon Rain",
        artist: "Cyber Pulse",
        album: "Digital Dreams",
        year: "2023",
        duration: "3:15",
        file: "https://assets.codepen.io/4358584/audio-3.mp3",
        artwork: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&w=800&h=800&fit=crop",
        mood: "Mysterious"
    },
    {
        id: 4,
        title: "Starlight Highway",
        artist: "Future Echoes",
        album: "Horizon Lines",
        year: "2022",
        duration: "5:10",
        file: "https://assets.codepen.io/4358584/audio-4.mp3",
        artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&w=800&h=800&fit=crop",
        mood: "Epic"
    },
    {
        id: 5,
        title: "Digital Sunrise",
        artist: "Vector Dawn",
        album: "New Era",
        year: "2023",
        duration: "4:05",
        file: "https://assets.codepen.io/4358584/audio-5.mp3",
        artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&w=800&h=800&fit=crop",
        mood: "Uplifting"
    }
];

// DOM Elements
let audioElement;

// QUICK INITIALIZATION - No external dependencies
function initPlayerQuick() {
    console.log('🚀 Quick initialization started...');
    
    // Hide loading screen immediately
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 500);
    
    // Get audio element
    audioElement = document.getElementById('audio-player');
    if (!audioElement) {
        console.error('❌ Audio element not found!');
        return;
    }
    
    // Set initial volume
    audioElement.volume = PlayerState.volume;
    
    // Load first track
    loadTrack(0);
    
    // Setup basic UI
    setupBasicUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('NEXUS MUSIC Player Ready! 🎵', 'success');
    }, 1000);
    
    console.log('✅ Player initialized successfully!');
}

// BASIC UI SETUP
function setupBasicUI() {
    // Update track info for first track
    updateTrackInfo(musicLibrary[0]);
    
    // Render playlist
    renderPlaylist();
    
    // Update volume display
    updateVolumeDisplay();
    
    // Update play button
    updatePlayButton();
    
    // Start time display
    startTimeDisplay();
    
    // Add some visual effects
    startVisualEffects();
}

// LOAD TRACK
function loadTrack(index) {
    if (index < 0 || index >= musicLibrary.length) return;
    
    PlayerState.currentTrackIndex = index;
    const track = musicLibrary[index];
    
    // Update audio source
    audioElement.src = track.file;
    
    // Update UI
    updateTrackInfo(track);
    updateActivePlaylistItem();
    
    // Auto-play if player was playing
    if (PlayerState.isPlaying) {
        playAudio();
    }
}

// PLAY AUDIO
function playAudio() {
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            PlayerState.isPlaying = true;
            updatePlayButton();
            
            // Start vinyl animation
            const vinyl = document.querySelector('.vinyl-record');
            if (vinyl) vinyl.classList.add('playing');
            
            // Start visualizer
            startSimpleVisualizer();
            
            console.log('🎶 Playing:', musicLibrary[PlayerState.currentTrackIndex].title);
        }).catch(error => {
            console.error('Playback error:', error);
            showNotification('Click play to start music', 'info');
        });
    }
}

// PAUSE AUDIO
function pauseAudio() {
    audioElement.pause();
    PlayerState.isPlaying = false;
    updatePlayButton();
    
    const vinyl = document.querySelector('.vinyl-record');
    if (vinyl) vinyl.classList.remove('playing');
}

// TOGGLE PLAY/PAUSE
function togglePlay() {
    if (PlayerState.isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// NEXT TRACK
function nextTrack() {
    let nextIndex;
    
    if (PlayerState.isShuffled) {
        // Random track (avoid same track if multiple tracks)
        do {
            nextIndex = Math.floor(Math.random() * musicLibrary.length);
        } while (nextIndex === PlayerState.currentTrackIndex && musicLibrary.length > 1);
    } else {
        nextIndex = (PlayerState.currentTrackIndex + 1) % musicLibrary.length;
    }
    
    loadTrack(nextIndex);
    if (PlayerState.isPlaying) {
        playAudio();
    }
}

// PREVIOUS TRACK
function prevTrack() {
    let prevIndex;
    
    if (PlayerState.isShuffled) {
        // Random track
        do {
            prevIndex = Math.floor(Math.random() * musicLibrary.length);
        } while (prevIndex === PlayerState.currentTrackIndex && musicLibrary.length > 1);
    } else {
        prevIndex = (PlayerState.currentTrackIndex - 1 + musicLibrary.length) % musicLibrary.length;
    }
    
    loadTrack(prevIndex);
    if (PlayerState.isPlaying) {
        playAudio();
    }
}

// UPDATE TRACK INFO
function updateTrackInfo(track) {
    // Update main elements
    const updateElement = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    
    updateElement('track-title', track.title);
    updateElement('track-artist', track.artist);
    updateElement('track-album', track.album);
    
    // Update album art
    const albumArt = document.getElementById('album-art');
    if (albumArt) {
        albumArt.src = track.artwork;
        albumArt.onerror = () => {
            albumArt.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&w=800&h=800&fit=crop';
        };
    }
    
    // Update year
    const yearEl = document.querySelector('.year');
    if (yearEl) yearEl.textContent = track.year;
    
    // Update mood
    const moodText = document.querySelector('.mood-text');
    if (moodText) moodText.textContent = track.mood;
    
    // Update mini player
    const miniTitle = document.getElementById('mini-track-title');
    const miniArtist = document.getElementById('mini-track-artist');
    const miniArt = document.getElementById('mini-album-art');
    
    if (miniTitle) miniTitle.textContent = track.title;
    if (miniArtist) miniArtist.textContent = track.artist;
    if (miniArt) miniArt.src = track.artwork;
    
    // Update footer
    const nowPlaying = document.getElementById('now-playing');
    if (nowPlaying) nowPlaying.textContent = `${track.title} - ${track.artist}`;
}

// RENDER PLAYLIST
function renderPlaylist() {
    const playlist = document.getElementById('playlist');
    if (!playlist) return;
    
    playlist.innerHTML = '';
    
    musicLibrary.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = `track-item ${index === PlayerState.currentTrackIndex ? 'active' : ''}`;
        
        trackElement.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-info-small">
                <div class="title">${track.title}</div>
                <div class="artist">${track.artist}</div>
            </div>
            <div class="track-duration">${track.duration}</div>
        `;
        
        trackElement.addEventListener('click', () => {
            loadTrack(index);
            if (PlayerState.isPlaying) {
                playAudio();
            }
        });
        
        playlist.appendChild(trackElement);
    });
    
    // Update count
    const countEl = document.getElementById('playlist-count');
    if (countEl) countEl.textContent = `${musicLibrary.length} tracks`;
}

// UPDATE ACTIVE PLAYLIST ITEM
function updateActivePlaylistItem() {
    document.querySelectorAll('.track-item').forEach((item, index) => {
        item.classList.remove('active', 'playing');
        if (index === PlayerState.currentTrackIndex) {
            item.classList.add('active');
            if (PlayerState.isPlaying) {
                item.classList.add('playing');
            }
        }
    });
}

// UPDATE PLAY BUTTON
function updatePlayButton() {
    const playIcon = document.getElementById('play-icon');
    const playBtn = document.getElementById('play-btn');
    
    if (!playIcon || !playBtn) return;
    
    if (PlayerState.isPlaying) {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        playBtn.title = "Pause";
    } else {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        playBtn.title = "Play";
    }
}

// VOLUME CONTROL
function updateVolumeDisplay() {
    const volumeFill = document.getElementById('volume-fill');
    const volumeHandle = document.getElementById('volume-handle');
    const volumeLevel = document.getElementById('volume-level');
    const muteBtn = document.getElementById('mute-btn');
    
    if (!volumeFill || !volumeHandle) return;
    
    const percent = PlayerState.volume * 100;
    volumeFill.style.width = `${percent}%`;
    volumeHandle.style.left = `${percent}%`;
    
    if (volumeLevel) volumeLevel.textContent = `${Math.round(percent)}%`;
    
    if (muteBtn) {
        if (PlayerState.isMuted || PlayerState.volume === 0) {
            muteBtn.className = 'fas fa-volume-mute volume-icon';
        } else if (PlayerState.volume < 0.5) {
            muteBtn.className = 'fas fa-volume-down volume-icon';
        } else {
            muteBtn.className = 'fas fa-volume-up volume-icon';
        }
    }
}

// TIME DISPLAY
function startTimeDisplay() {
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const progressFill = document.getElementById('progress-fill');
    const progressHandle = document.getElementById('progress-handle');
    
    if (!currentTimeDisplay || !progressFill) return;
    
    function update() {
        if (audioElement.duration) {
            const current = audioElement.currentTime;
            const total = audioElement.duration;
            const percent = (current / total) * 100;
            
            // Update time displays
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = formatTime(current);
            }
            if (totalTimeDisplay) {
                totalTimeDisplay.textContent = formatTime(total);
            }
            
            // Update progress bar
            if (progressFill) {
                progressFill.style.width = `${percent}%`;
            }
            if (progressHandle) {
                progressHandle.style.left = `${percent}%`;
            }
        }
    }
    
    // Update every second
    setInterval(update, 1000);
    audioElement.addEventListener('timeupdate', update);
}

// FORMAT TIME (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// SIMPLE VISUALIZER
function startSimpleVisualizer() {
    const canvas = document.getElementById('visualizer-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Simple visualizer animation
    let animationId;
    let hue = 0;
    
    function draw() {
        if (!PlayerState.isPlaying) {
            // Draw idle animation
            drawIdleAnimation(ctx, canvas);
            animationId = requestAnimationFrame(draw);
            return;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient bars
        const barCount = 50;
        const barWidth = canvas.width / barCount;
        
        for (let i = 0; i < barCount; i++) {
            // Calculate bar height with some randomness
            const randomHeight = Math.sin(Date.now() * 0.001 + i * 0.1) * 0.5 + 0.5;
            const barHeight = canvas.height * randomHeight * 0.7;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, `hsla(${(hue + i * 5) % 360}, 100%, 60%, 0.8)`);
            gradient.addColorStop(1, `hsla(${(hue + i * 5) % 360}, 100%, 30%, 0.3)`);
            
            // Draw bar
            ctx.fillStyle = gradient;
            ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
        }
        
        // Update hue for color cycling
        hue = (hue + 1) % 360;
        
        // Continue animation
        animationId = requestAnimationFrame(draw);
    }
    
    // Start animation
    draw();
    
    // Store animation ID for cleanup
    window.visualizerAnimation = animationId;
}

function drawIdleAnimation(ctx, canvas) {
    // Draw pulsing circles when idle
    const time = Date.now() * 0.001;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pulsing rings
    for (let i = 0; i < 3; i++) {
        const radius = 50 + Math.sin(time + i) * 30;
        const opacity = 0.3 + Math.sin(time * 2 + i) * 0.2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw "Click play" text
    ctx.font = '20px Poppins';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Click play to start music', centerX, centerY);
}

// VISUAL EFFECTS
function startVisualEffects() {
    // Start typing effect
    startTypingEffect();
    
    // Start live time
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
    
    // Create some background particles
    createParticles();
}

// TYPING EFFECT
function startTypingEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;
    
    const messages = [
        "Immersive Audio Experience",
        "Professional Music Player",
        "Beautiful Visualizations",
        "Smart Playback Controls"
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentMessage = messages[messageIndex];
        
        if (isDeleting) {
            textElement.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentMessage.length) {
            // Pause at end of message
            isDeleting = true;
            setTimeout(type, 2000);
            return;
        }
        
        if (isDeleting && charIndex === 0) {
            // Move to next message
            isDeleting = false;
            messageIndex = (messageIndex + 1) % messages.length;
        }
        
        const speed = isDeleting ? 50 : 100;
        setTimeout(type, speed);
    }
    
    // Start after a delay
    setTimeout(type, 1000);
}

// LIVE TIME
function updateLiveTime() {
    const liveTimeEl = document.getElementById('live-time');
    if (!liveTimeEl) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    liveTimeEl.textContent = timeString;
}

// PARTICLES
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: hsl(${Math.random() * 360}, 100%, 60%);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: 0.7;
            pointer-events: none;
        `;
        
        // Simple animation
        particle.animate([
            { transform: 'translateY(0px)', opacity: 0 },
            { transform: `translateY(${Math.random() * 100}px)`, opacity: 0.7 },
            { transform: `translateY(${Math.random() * 200}px)`, opacity: 0 }
        ], {
            duration: Math.random() * 3000 + 2000,
            iterations: Infinity,
            delay: Math.random() * 2000
        });
        
        container.appendChild(particle);
    }
}

// NOTIFICATION SYSTEM
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icons[type] || 'fas fa-info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// EVENT LISTENERS
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Play/Pause
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', togglePlay);
    }
    
    // Navigation
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', prevTrack);
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);
    
    // Shuffle
    const shuffleBtn = document.getElementById('shuffle-btn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            PlayerState.isShuffled = !PlayerState.isShuffled;
            shuffleBtn.style.color = PlayerState.isShuffled ? 'var(--accent-color)' : '';
            shuffleBtn.style.textShadow = PlayerState.isShuffled ? '0 0 10px var(--accent-color)' : '';
            showNotification(`Shuffle ${PlayerState.isShuffled ? 'ON' : 'OFF'}`, 'info');
        });
    }
    
    // Repeat
    const repeatBtn = document.getElementById('repeat-btn');
    if (repeatBtn) {
        repeatBtn.addEventListener('click', () => {
            PlayerState.isRepeating = !PlayerState.isRepeating;
            repeatBtn.style.color = PlayerState.isRepeating ? 'var(--accent-color)' : '';
            repeatBtn.style.textShadow = PlayerState.isRepeating ? '0 0 10px var(--accent-color)' : '';
            audioElement.loop = PlayerState.isRepeating;
            showNotification(`Repeat ${PlayerState.isRepeating ? 'ON' : 'OFF'}`, 'info');
        });
    }
    
    // Volume control
    const volumeBar = document.querySelector('.volume-bar');
    if (volumeBar) {
        volumeBar.addEventListener('click', (e) => {
            const rect = volumeBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            PlayerState.volume = Math.max(0, Math.min(1, percent));
            audioElement.volume = PlayerState.volume;
            updateVolumeDisplay();
        });
    }
    
    // Mute button
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            PlayerState.isMuted = !PlayerState.isMuted;
            audioElement.muted = PlayerState.isMuted;
            updateVolumeDisplay();
        });
    }
    
    // Progress bar
    const progressBar = document.getElementById('progress-bg');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            if (!audioElement.duration) return;
            
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioElement.currentTime = percent * audioElement.duration;
        });
    }
    
    // Speed control
    const speedRange = document.getElementById('speed-range');
    if (speedRange) {
        speedRange.addEventListener('input', (e) => {
            PlayerState.playbackSpeed = e.target.value / 100;
            audioElement.playbackRate = PlayerState.playbackSpeed;
            
            const speedValue = document.getElementById('speed-value');
            if (speedValue) {
                speedValue.textContent = `${PlayerState.playbackSpeed.toFixed(1)}x`;
            }
        });
    }
    
    // Theme toggle
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            const newTheme = themeSwitch.checked ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('nexusMusicTheme', newTheme);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('nexusMusicTheme') || 'dark';
        themeSwitch.checked = savedTheme === 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Modal controls
    const lyricsBtn = document.getElementById('lyrics-btn');
    const closeLyricsBtn = document.getElementById('close-lyrics-btn');
    
    if (lyricsBtn) {
        lyricsBtn.addEventListener('click', () => {
            const lyricsContainer = document.getElementById('lyrics-container');
            if (lyricsContainer) lyricsContainer.style.display = 'block';
        });
    }
    
    if (closeLyricsBtn) {
        closeLyricsBtn.addEventListener('click', () => {
            const lyricsContainer = document.getElementById('lyrics-container');
            if (lyricsContainer) lyricsContainer.style.display = 'none';
        });
    }
    
    // Favorite button
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            const icon = favoriteBtn.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                favoriteBtn.classList.add('active');
                showNotification('Added to favorites', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                favoriteBtn.classList.remove('active');
                showNotification('Removed from favorites', 'info');
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'arrowright':
                e.preventDefault();
                nextTrack();
                break;
            case 'arrowleft':
                e.preventDefault();
                prevTrack();
                break;
            case 'arrowup':
                e.preventDefault();
                PlayerState.volume = Math.min(1, PlayerState.volume + 0.1);
                audioElement.volume = PlayerState.volume;
                updateVolumeDisplay();
                break;
            case 'arrowdown':
                e.preventDefault();
                PlayerState.volume = Math.max(0, PlayerState.volume - 0.1);
                audioElement.volume = PlayerState.volume;
                updateVolumeDisplay();
                break;
            case 'm':
                e.preventDefault();
                PlayerState.isMuted = !PlayerState.isMuted;
                audioElement.muted = PlayerState.isMuted;
                updateVolumeDisplay();
                break;
        }
    });
    
    // Track ended event
    audioElement.addEventListener('ended', () => {
        if (PlayerState.isRepeating) {
            audioElement.currentTime = 0;
            playAudio();
        } else {
            nextTrack();
        }
    });
    
    // Error handling
    audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        showNotification('Error loading audio. Trying next track...', 'error');
        setTimeout(nextTrack, 2000);
    });
    
    console.log('✅ Event listeners set up');
}

// SIMPLE VISUALIZER MODE SELECTOR
document.querySelectorAll('.viz-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.viz-mode-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Show notification
        const mode = btn.dataset.mode;
        showNotification(`Visualizer mode: ${mode}`, 'info');
        
        // In a real implementation, this would switch visualizer modes
        // For now, just restart the visualizer
        if (window.visualizerAnimation) {
            cancelAnimationFrame(window.visualizerAnimation);
        }
        startSimpleVisualizer();
    });
});

// Make functions available globally for debugging
window.player = {
    play: () => playAudio(),
    pause: () => pauseAudio(),
    next: () => nextTrack(),
    prev: () => prevTrack(),
    load: (index) => loadTrack(index),
    state: PlayerState
};

console.log('🎵 NEXUS MUSIC Player ready! Use window.player to control from console.');