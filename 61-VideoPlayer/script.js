const VideoPlayerApp = (() => {

    const elements = {
        video: document.getElementById('mainVideo'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        playIcon: document.getElementById('playIcon'),
        playLargeBtn: document.getElementById('playLargeBtn'),
        skipBackBtn: document.getElementById('skipBackBtn'),
        skipForwardBtn: document.getElementById('skipForwardBtn'),
        volumeBtn: document.getElementById('volumeBtn'),
        volumeIcon: document.getElementById('volumeIcon'),
        volumeSlider: document.getElementById('volumeSlider'),
        progressBar: document.getElementById('progressBar'),
        progressFill: document.getElementById('progressFill'),
        progressThumb: document.getElementById('progressThumb'),
        currentTime: document.getElementById('currentTime'),
        duration: document.getElementById('duration'),
        fullscreenBtn: document.getElementById('fullscreenBtn'),
        pipBtn: document.getElementById('pipBtn'),
        speedBtn: document.getElementById('speedBtn'),
        subtitlesBtn: document.getElementById('subtitlesBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        closeSettingsBtn: document.getElementById('closeSettingsBtn'),
        settingsPanel: document.getElementById('settingsPanel'),
        theaterBtn: document.getElementById('theaterBtn'),
        shuffleBtn: document.getElementById('shuffleBtn'),
        repeatBtn: document.getElementById('repeatBtn'),
        playlistItems: document.getElementById('playlistItems'),
        addVideoBtn: document.getElementById('addVideoBtn'),
        addVideoModal: document.getElementById('addVideoModal'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        cancelAddBtn: document.getElementById('cancelAddBtn'),
        confirmAddBtn: document.getElementById('confirmAddBtn'),
        themeBtns: document.querySelectorAll('.theme-btn'),
        currentVideoTitle: document.getElementById('currentVideoTitle'),
        currentVideoDesc: document.getElementById('currentVideoDesc'),
        currentPlayStat: document.getElementById('currentPlayStat'),
        watchTimeStat: document.getElementById('watchTimeStat'),
        speedStat: document.getElementById('speedStat'),
        volumeStat: document.getElementById('volumeStat'),
        totalVideos: document.getElementById('totalVideos'),
        totalDuration: document.getElementById('totalDuration')
    };

    let state = {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        playbackRate: 1,
        isFullscreen: false,
        isTheaterMode: false,
        isShuffle: false,
        repeatMode: 'none', // 'none', 'one', 'all'
        currentVideoIndex: 0,
        videos: [
            {
                id: 1,
                title: "Big Buck Bunny",
                description: "A large and lovable rabbit fights back against his tormentors",
                url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail: "https://peach.blender.org/wp-content/uploads/bbb-splash.png?x11217",
                duration: 634
            },
            {
                id: 2,
                title: "Elephant's Dream",
                description: "The story of two strange characters exploring a capricious and seemingly infinite machine",
                url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail: "https://i.ytimg.com/vi/UWx5xOHwxHQ/maxresdefault.jpg",
                duration: 653
            },
            {
                id: 3,
                title: "For Bigger Blazes",
                description: "A video showcasing Google's technology",
                url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "https://i.ytimg.com/vi/t3D7u9lFGNc/maxresdefault.jpg",
                duration: 45
            },
            {
                id: 4,
                title: "For Bigger Escape",
                description: "Experience the thrill of escape in this high-energy video",
                url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                thumbnail: "https://i.ytimg.com/vi/3sEQ-5_8hss/maxresdefault.jpg",
                duration: 15
            },
            {
                id: 5,
                title: "For Bigger Fun",
                description: "A fun and entertaining video for all ages",
                url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                thumbnail: "https://i.ytimg.com/vi/cx2-tQ4hr5s/maxresdefault.jpg",
                duration: 59
            }
        ]
    };

    // Initialize all modules
    const init = () => {
        VideoControls.init(elements, state);
        PlaybackManager.init(elements, state);
        PlaylistManager.init(elements, state);
        ThemeManager.init(elements, state);
        ModalManager.init(elements, state);
        StatsManager.init(elements, state);
        
        // Load first video
        PlaylistManager.loadVideo(0);
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize stats
        StatsManager.updateStats();
        
        console.log('🎥 Luxury Video Player initialized!');
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Video events
        elements.video.addEventListener('loadedmetadata', () => {
            state.duration = elements.video.duration;
            PlaybackManager.updateDurationDisplay();
            StatsManager.updateStats();
        });

        elements.video.addEventListener('timeupdate', () => {
            state.currentTime = elements.video.currentTime;
            PlaybackManager.updateProgressBar();
            PlaybackManager.updateTimeDisplay();
            StatsManager.updateStats();
        });

        elements.video.addEventListener('ended', () => {
            PlaylistManager.playNextVideo();
        });

        // Mouse movement to show controls
        let controlsTimeout;
        elements.video.addEventListener('mousemove', () => {
            elements.video.style.cursor = 'default';
            clearTimeout(controlsTimeout);
            
            controlsTimeout = setTimeout(() => {
                elements.video.style.cursor = 'none';
            }, 3000);
        });
    };

    // Public API
    return {
        init,
        state,
        elements
    };
})();

// Video Controls Module
const VideoControls = (() => {
    let elements, state;

    const init = (el, st) => {
        elements = el;
        state = st;
        bindEvents();
    };

    const bindEvents = () => {
        // Play/Pause
        elements.playPauseBtn.addEventListener('click', togglePlay);
        elements.playLargeBtn.addEventListener('click', togglePlay);
        elements.video.addEventListener('click', togglePlay);

        // Skip buttons
        elements.skipBackBtn.addEventListener('click', skipBackward);
        elements.skipForwardBtn.addEventListener('click', skipForward);

        // Volume
        elements.volumeBtn.addEventListener('click', toggleMute);
        elements.volumeSlider.addEventListener('input', changeVolume);

        // Progress bar
        elements.progressBar.addEventListener('click', seek);
        
        // Progress bar dragging
        let isDragging = false;
        elements.progressBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            seek(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                seek(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Fullscreen
        elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

        // Picture in Picture
        elements.pipBtn.addEventListener('click', togglePiP);

        // Settings
        elements.settingsBtn.addEventListener('click', toggleSettings);
        elements.closeSettingsBtn.addEventListener('click', closeSettings);

        // Theater mode
        elements.theaterBtn.addEventListener('click', toggleTheaterMode);
    };

    const togglePlay = () => {
        if (state.isPlaying) {
            elements.video.pause();
            elements.playIcon.className = 'fas fa-play';
            elements.playLargeBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            elements.video.play();
            elements.playIcon.className = 'fas fa-pause';
            elements.playLargeBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        state.isPlaying = !state.isPlaying;
    };

    const skipBackward = () => {
        elements.video.currentTime = Math.max(0, elements.video.currentTime - 10);
    };

    const skipForward = () => {
        elements.video.currentTime = Math.min(state.duration, elements.video.currentTime + 10);
    };

    const toggleMute = () => {
        state.isMuted = !state.isMuted;
        elements.video.muted = state.isMuted;
        
        if (state.isMuted) {
            elements.volumeIcon.className = 'fas fa-volume-mute';
            elements.volumeStat.textContent = '0%';
        } else {
            updateVolumeIcon(state.volume);
            elements.volumeStat.textContent = `${Math.round(state.volume * 100)}%`;
        }
    };

    const changeVolume = (e) => {
        state.volume = e.target.value;
        elements.video.volume = state.volume;
        updateVolumeIcon(state.volume);
        elements.volumeStat.textContent = `${Math.round(state.volume * 100)}%`;
        
        if (state.volume == 0) {
            state.isMuted = true;
            elements.video.muted = true;
            elements.volumeIcon.className = 'fas fa-volume-mute';
        } else if (state.isMuted) {
            state.isMuted = false;
            elements.video.muted = false;
        }
    };

    const updateVolumeIcon = (volume) => {
        if (volume == 0) {
            elements.volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            elements.volumeIcon.className = 'fas fa-volume-down';
        } else {
            elements.volumeIcon.className = 'fas fa-volume-up';
        }
    };

    const seek = (e) => {
        const rect = elements.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        elements.video.currentTime = pos * state.duration;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            elements.video.parentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            elements.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            state.isFullscreen = true;
        } else {
            document.exitFullscreen();
            elements.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            state.isFullscreen = false;
        }
    };

    const togglePiP = async () => {
        try {
            if (elements.video !== document.pictureInPictureElement) {
                await elements.video.requestPictureInPicture();
                elements.pipBtn.classList.add('active');
            } else {
                await document.exitPictureInPicture();
                elements.pipBtn.classList.remove('active');
            }
        } catch (error) {
            console.error('PiP error:', error);
        }
    };

    const toggleSettings = () => {
        elements.settingsPanel.classList.toggle('active');
    };

    const closeSettings = () => {
        elements.settingsPanel.classList.remove('active');
    };

    const toggleTheaterMode = () => {
        state.isTheaterMode = !state.isTheaterMode;
        const videoContainer = elements.video.parentElement;
        
        if (state.isTheaterMode) {
            videoContainer.style.maxHeight = '80vh';
            elements.theaterBtn.classList.add('active');
        } else {
            videoContainer.style.maxHeight = '';
            elements.theaterBtn.classList.remove('active');
        }
    };

    return {
        init,
        togglePlay,
        skipBackward,
        skipForward,
        toggleMute,
        changeVolume,
        seek,
        toggleFullscreen,
        togglePiP,
        toggleSettings,
        toggleTheaterMode
    };
})();

// Playback Manager Module
const PlaybackManager = (() => {
    let elements, state;

    const init = (el, st) => {
        elements = el;
        state = st;
        bindEvents();
    };

    const bindEvents = () => {
        // Speed control
        elements.speedBtn.addEventListener('click', cyclePlaybackSpeed);
        
        // Speed options in settings
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', () => {
                const speed = parseFloat(option.dataset.speed);
                setPlaybackSpeed(speed);
                
                // Update active state
                document.querySelectorAll('.speed-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                
                // Close settings
                elements.settingsPanel.classList.remove('active');
            });
        });
    };

    const updateProgressBar = () => {
        const percentage = (state.currentTime / state.duration) * 100;
        elements.progressFill.style.width = `${percentage}%`;
        elements.progressThumb.style.left = `${percentage}%`;
    };

    const updateTimeDisplay = () => {
        elements.currentTime.textContent = formatTime(state.currentTime);
        elements.watchTimeStat.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
    };

    const updateDurationDisplay = () => {
        elements.duration.textContent = formatTime(state.duration);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const cyclePlaybackSpeed = () => {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(state.playbackRate);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIndex]);
    };

    const setPlaybackSpeed = (speed) => {
        state.playbackRate = speed;
        elements.video.playbackRate = speed;
        elements.speedBtn.textContent = `${speed}x`;
        elements.speedStat.textContent = `${speed}x`;
        
        // Update settings panel
        document.querySelectorAll('.speed-option').forEach(option => {
            option.classList.toggle('active', parseFloat(option.dataset.speed) === speed);
        });
    };

    return {
        init,
        updateProgressBar,
        updateTimeDisplay,
        updateDurationDisplay,
        setPlaybackSpeed
    };
})();

// Playlist Manager Module
const PlaylistManager = (() => {
    let elements, state;

    const init = (el, st) => {
        elements = el;
        state = st;
        bindEvents();
        renderPlaylist();
        updatePlaylistStats();
    };

    const bindEvents = () => {
        // Shuffle and repeat
        elements.shuffleBtn.addEventListener('click', toggleShuffle);
        elements.repeatBtn.addEventListener('click', toggleRepeat);
        
        // Add video button
        elements.addVideoBtn.addEventListener('click', () => {
            ModalManager.openAddVideoModal();
        });
        
        // Sample video buttons
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('videoTitle').value = btn.dataset.title;
                document.getElementById('videoUrl').value = btn.dataset.url;
                document.getElementById('videoDescription').value = btn.dataset.desc;
            });
        });
    };

    const renderPlaylist = () => {
        elements.playlistItems.innerHTML = '';
        
        state.videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === state.currentVideoIndex ? 'active' : ''}`;
            item.dataset.index = index;
            
            item.innerHTML = `
                <div class="playlist-item-thumb">
                    ${video.thumbnail ? `<img src="${video.thumbnail}" alt="${video.title}">` : 
                      `<i class="fas fa-play"></i>`}
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${video.title}</div>
                    <div class="playlist-item-duration">${PlaybackManager.formatTime(video.duration)}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                loadVideo(index);
            });
            
            elements.playlistItems.appendChild(item);
        });
    };

    const loadVideo = (index) => {
        if (index < 0 || index >= state.videos.length) return;
        
        state.currentVideoIndex = index;
        const video = state.videos[index];
        
        // Update video source
        elements.video.src = video.url;
        
        // Update UI
        elements.currentVideoTitle.textContent = video.title;
        elements.currentVideoDesc.textContent = video.description;
        elements.currentPlayStat.textContent = video.title;
        
        // Update active playlist item
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        
        // Play the video
        elements.video.play();
        state.isPlaying = true;
        elements.playIcon.className = 'fas fa-pause';
        elements.playLargeBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        // Show toast notification
        showToast(`Now playing: ${video.title}`);
    };

    const playNextVideo = () => {
        let nextIndex;
        
        if (state.repeatMode === 'one') {
            nextIndex = state.currentVideoIndex;
        } else if (state.isShuffle) {
            nextIndex = getRandomIndex();
        } else {
            nextIndex = (state.currentVideoIndex + 1) % state.videos.length;
        }
        
        loadVideo(nextIndex);
    };

    const playPreviousVideo = () => {
        let prevIndex = state.currentVideoIndex - 1;
        if (prevIndex < 0) prevIndex = state.videos.length - 1;
        loadVideo(prevIndex);
    };

    const getRandomIndex = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * state.videos.length);
        } while (newIndex === state.currentVideoIndex && state.videos.length > 1);
        return newIndex;
    };

    const toggleShuffle = () => {
        state.isShuffle = !state.isShuffle;
        elements.shuffleBtn.classList.toggle('active', state.isShuffle);
        showToast(state.isShuffle ? 'Shuffle enabled' : 'Shuffle disabled');
    };

    const toggleRepeat = () => {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(state.repeatMode);
        state.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        // Update button icon
        const icons = ['fa-redo', 'fa-redo-alt', 'fa-infinity'];
        elements.repeatBtn.innerHTML = `<i class="fas ${icons[(currentIndex + 1) % modes.length]}"></i>`;
        
        elements.repeatBtn.classList.toggle('active', state.repeatMode !== 'none');
        showToast(`Repeat: ${state.repeatMode}`);
    };

    const addVideo = (videoData) => {
        const newVideo = {
            id: state.videos.length + 1,
            title: videoData.title,
            description: videoData.description || '',
            url: videoData.url,
            thumbnail: videoData.thumbnail || '',
            duration: videoData.duration || 0
        };
        
        state.videos.push(newVideo);
        renderPlaylist();
        updatePlaylistStats();
        showToast(`Added: ${videoData.title}`);
    };

    const updatePlaylistStats = () => {
        elements.totalVideos.textContent = state.videos.length;
        
        const totalSeconds = state.videos.reduce((sum, video) => sum + video.duration, 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        elements.totalDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        init,
        loadVideo,
        playNextVideo,
        playPreviousVideo,
        addVideo,
        renderPlaylist,
        updatePlaylistStats
    };
})();

// Theme Manager Module
const ThemeManager = (() => {
    const themes = {
        cyberpunk: {
            primary: '#00f3ff',
            secondary: '#ff00ff',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)'
        },
        midnight: {
            primary: '#4a69bd',
            secondary: '#1e3799',
            background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e, #16213e)'
        },
        sunset: {
            primary: '#ff7e5f',
            secondary: '#feb47b',
            background: 'linear-gradient(135deg, #2b5876, #4e4376, #ff7e5f)'
        },
        ocean: {
            primary: '#4a69bd',
            secondary: '#38ada9',
            background: 'linear-gradient(135deg, #0c2461, #1e3799, #4a69bd)'
        }
    };

    const init = (elements) => {
        elements.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                applyTheme(theme);
                
                // Update active button
                elements.themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update body class
                document.body.className = theme;
                
                showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`);
            });
        });
    };

    const applyTheme = (themeName) => {
        const theme = themes[themeName];
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        
        // Update gradient backgrounds
        document.querySelectorAll('.progress-fill').forEach(el => {
            el.style.background = `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`;
        });
        
        document.querySelectorAll('.stat-icon, .play-large').forEach(el => {
            el.style.background = `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`;
        });
    };

    return {
        init,
        applyTheme
    };
})();

// Modal Manager Module
const ModalManager = (() => {
    let elements;

    const init = (el) => {
        elements = el;
        bindEvents();
    };

    const bindEvents = () => {
        // Modal buttons
        elements.closeModalBtn.addEventListener('click', closeAddVideoModal);
        elements.cancelAddBtn.addEventListener('click', closeAddVideoModal);
        elements.confirmAddBtn.addEventListener('click', handleAddVideo);
        
        // Close modal on background click
        elements.addVideoModal.addEventListener('click', (e) => {
            if (e.target === elements.addVideoModal) {
                closeAddVideoModal();
            }
        });
    };

    const openAddVideoModal = () => {
        elements.addVideoModal.classList.add('active');
        // Clear form
        document.getElementById('videoTitle').value = '';
        document.getElementById('videoUrl').value = '';
        document.getElementById('videoDescription').value = '';
        document.getElementById('videoThumbnail').value = '';
    };

    const closeAddVideoModal = () => {
        elements.addVideoModal.classList.remove('active');
    };

    const handleAddVideo = () => {
        const title = document.getElementById('videoTitle').value.trim();
        const url = document.getElementById('videoUrl').value.trim();
        const description = document.getElementById('videoDescription').value.trim();
        const thumbnail = document.getElementById('videoThumbnail').value.trim();
        
        if (!title || !url) {
            showToast('Please fill in required fields', 'error');
            return;
        }
        
        // Validate URL
        if (!isValidUrl(url)) {
            showToast('Please enter a valid video URL', 'error');
            return;
        }
        
        // Create temp video element to get duration
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        
        tempVideo.addEventListener('loadedmetadata', () => {
            const videoData = {
                title,
                url,
                description,
                thumbnail,
                duration: tempVideo.duration || 0
            };
            
            PlaylistManager.addVideo(videoData);
            closeAddVideoModal();
        });
        
        tempVideo.addEventListener('error', () => {
            // If we can't get duration, use default
            const videoData = {
                title,
                url,
                description,
                thumbnail,
                duration: 0
            };
            
            PlaylistManager.addVideo(videoData);
            closeAddVideoModal();
        });
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    return {
        init,
        openAddVideoModal,
        closeAddVideoModal
    };
})();

// Stats Manager Module
const StatsManager = (() => {
    let elements, state;

    const init = (el, st) => {
        elements = el;
        state = st;
    };

    const updateStats = () => {
        if (!elements || !state) return;
        
        // These are updated by other modules
        // This module can be extended for additional statistics
        // like watch history, preferences, etc.
    };

    return {
        init,
        updateStats
    };
})();

// Utility Functions
const showToast = (message, type = 'info') => {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'fa-info-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'success') icon = 'fa-check-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    VideoPlayerApp.init();
});