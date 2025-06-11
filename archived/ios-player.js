/**
 * iOS-Optimized Music Player
 * Native iOS experience for iPhone users
 */

class iOSMusicPlayer {
    constructor() {
        this.isExpanded = false;
        this.isDragging = false;
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 0.7;
        
        // Track management
        this.tracks = window.TRACKS || [];
        this.currentTrackIndex = 0;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
          // Get audio element (shared with main site)
        this.audio = document.getElementById('audioPlayer');
        if (!this.audio) {
            console.warn('🍎 Audio element not found, creating one');
            this.audio = document.createElement('audio');
            this.audio.id = 'audioPlayer';
            this.audio.preload = 'metadata';
            document.body.appendChild(this.audio);
        }
        
        // Get iOS player elements
        this.initializeElements();
        this.setupEventListeners();
        this.setupProgressHandling();
        
        console.log('🍎 iOS Music Player initialized with', this.tracks.length, 'tracks');
    }
      initializeElements() {
        // Mini player elements (required)
        this.miniPlayer = document.getElementById('iosMiniPlayer');
        this.miniArt = document.getElementById('iosMiniArt');
        this.miniTitle = document.getElementById('iosMiniTitle');
        this.miniArtist = document.getElementById('iosMiniArtist');
        this.miniPlayBtn = document.getElementById('iosMiniPlayBtn');
        this.miniProgress = document.getElementById('iosMiniProgress');
        
        // Verify mini player elements exist
        if (!this.miniPlayer || !this.miniTitle || !this.miniArtist || !this.miniPlayBtn) {
            console.warn('🍎 Some mini player elements missing - functionality may be limited');
        }
        
        // Full player elements (optional)
        this.fullPlayer = document.getElementById('iosFullPlayer');
        this.fullArt = document.getElementById('iosFullArt');
        this.fullTitle = document.getElementById('iosFullTitle');
        this.fullArtist = document.getElementById('iosFullArtist');
        this.mainPlayBtn = document.getElementById('iosMainPlayBtn');
        this.progressTrack = document.getElementById('iosProgressTrack');
        this.progressFill = document.getElementById('iosProgressFill');
        this.progressThumb = document.getElementById('iosProgressThumb');
        this.currentTimeLabel = document.getElementById('iosCurrentTime');
        this.durationLabel = document.getElementById('iosDuration');
        this.volumeSlider = document.getElementById('iosVolumeSlider');
        this.shuffleBtn = document.getElementById('iosShuffleBtn');
        this.repeatBtn = document.getElementById('iosRepeatBtn');
        
        // Log what elements are available
        const hasFullPlayer = this.fullPlayer && this.fullTitle && this.fullArtist;
        console.log('🍎 iOS Player elements:', {
            miniPlayer: !!this.miniPlayer,
            fullPlayer: hasFullPlayer,
            audio: !!this.audio
        });
    }    setupEventListeners() {
        // Audio element events
        if (this.audio) {
            this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('play', () => this.updatePlayState(true));
            this.audio.addEventListener('pause', () => this.updatePlayState(false));
            this.audio.addEventListener('ended', () => this.handleTrackEnd());
            this.audio.addEventListener('error', (e) => this.handleError(e));
        }
        
        // Volume control
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }
        
        // Prevent mini player expansion when tapping controls
        if (this.miniPlayBtn) {
            this.miniPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Mini player click to expand
        if (this.miniPlayer) {
            this.miniPlayer.addEventListener('click', () => {
                this.expand();
            });
        }
    }
    
    setupProgressHandling() {
        let startX = 0;
        let startTime = 0;
        
        const handleStart = (e) => {
            this.isDragging = true;
            this.progressTrack.classList.add('dragging');
            
            // Get touch/mouse position
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            startX = clientX;
            startTime = this.audio.currentTime;
            
            // Immediate position update
            this.updateProgressFromPosition(clientX);
            
            e.preventDefault();
        };
        
        const handleMove = (e) => {
            if (!this.isDragging) return;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            this.updateProgressFromPosition(clientX);
            
            e.preventDefault();
        };
        
        const handleEnd = () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.progressTrack.classList.remove('dragging');
            }
        };
        
        // Touch events for mobile
        this.progressTrack.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
        
        // Mouse events for desktop testing
        this.progressTrack.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        // Click to seek
        this.progressTrack.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.updateProgressFromPosition(e.clientX);
            }
        });
    }
    
    updateProgressFromPosition(clientX) {
        const rect = this.progressTrack.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newTime = percent * this.audio.duration;
        
        if (isFinite(newTime)) {
            this.audio.currentTime = newTime;
            this.updateProgressDisplay(newTime, this.audio.duration);
        }
    }
    
    // Public methods for integration with main site
    loadTrack(trackData) {
        console.log('🍎 Loading track:', trackData.title);
        
        this.currentTrack = trackData;
        
        // Update track info in both mini and full player
        this.updateTrackInfo(trackData);
        
        // Load audio
        this.audio.src = trackData.src;
        this.audio.load();
        
        // Reset progress
        this.updateProgressDisplay(0, 0);
    }    updateTrackInfo(trackData) {
        const title = trackData.title || 'Unknown Track';
        const tuning = trackData.tuning || 'Unknown Tuning';
        const artwork = trackData.artwork || '';
        
        // Update mini player (show tuning as the subtitle, consistent with main site)
        if (this.miniTitle) this.miniTitle.textContent = title;
        if (this.miniArtist) this.miniArtist.textContent = tuning;
        
        // Handle artwork
        if (this.miniArt) {
            if (artwork) {
                this.miniArt.src = artwork;
                this.miniArt.style.display = 'block';
            } else {
                this.miniArt.style.display = 'none';
            }
        }
        
        // Update full player (show only tuning, no artist name since it's your website)
        if (this.fullTitle) this.fullTitle.textContent = title;
        if (this.fullArtist) this.fullArtist.textContent = tuning;
        
        if (this.fullArt) {
            if (artwork) {
                this.fullArt.src = artwork;
                this.fullArt.style.display = 'block';
            } else {
                this.fullArt.style.display = 'none';
            }
        }
    }
      togglePlayPause() {
        if (!this.audio.src) {
            console.warn('🍎 No track loaded');
            return;
        }
        
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }
    
    play() {
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('🍎 Playback started');
            }).catch(error => {
                console.error('🍎 Playback failed:', error);
            });
        }
    }
    
    pause() {
        this.audio.pause();
        console.log('🍎 Playback paused');
    }
    
    setVolume(value) {
        this.volume = value / 100;
        this.audio.volume = this.volume;
        this.volumeSlider.value = value;
    }
    
    expand() {
        if (this.isExpanded) return;
        
        console.log('🍎 Expanding player');
        this.isExpanded = true;
        this.fullPlayer.style.display = 'block';
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.fullPlayer.classList.add('expanded');
        });
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    collapse() {
        if (!this.isExpanded) return;
        
        console.log('🍎 Collapsing player');
        this.fullPlayer.classList.remove('expanded');
        
        // Hide after animation
        setTimeout(() => {
            if (!this.isExpanded) {
                this.fullPlayer.style.display = 'none';
            }
        }, 400);
        
        this.isExpanded = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    showOptions() {
        // Placeholder for options menu
        console.log('🍎 Show options menu');
        // Could implement: Add to playlist, Share, etc.
    }
    
    // Track navigation methods
    nextTrack() {
        if (this.tracks.length === 0) return;
        
        if (this.isShuffled) {
            // Random track
            this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
        } else {
            // Sequential track
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        
        const nextTrack = this.tracks[this.currentTrackIndex];
        this.loadTrack(nextTrack);
        
        console.log('🍎 Now playing:', nextTrack.title);
    }
    
    previousTrack() {
        if (this.tracks.length === 0) return;
        
        // Sequential previous track
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        
        const prevTrack = this.tracks[this.currentTrackIndex];
        this.loadTrack(prevTrack);
        
        console.log('🍎 Now playing:', prevTrack.title);
    }
    
    // Load track by index from tracks array
    loadTrackByIndex(index, autoplay = false) {
        if (!this.tracks || index < 0 || index >= this.tracks.length) {
            console.warn('🍎 Invalid track index', index);
            return;
        }
        
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        this.loadTrack(track);
        
        if (autoplay) {
            // Wait for track to load then play
            this.audio.addEventListener('canplay', () => {
                this.play();
            }, { once: true });
        }
    }
    
    // Shuffle functionality
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.updateShuffleState(this.isShuffled);
        console.log('🍎 Shuffle:', this.isShuffled ? 'ON' : 'OFF');
    }
    
    // Repeat functionality
    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        this.updateRepeatState(this.repeatMode);
        console.log('🍎 Repeat mode:', this.repeatMode);
    }
      // Seek functionality
    seekTo(percentage) {
        if (!this.audio.duration) return;
        
        const newTime = (percentage / 100) * this.audio.duration;
        this.audio.currentTime = newTime;
        this.updateProgressDisplay(newTime, this.audio.duration);
        console.log('🍎 Seeked to:', percentage + '%');
    }

    // Internal update methods
    updateDuration() {
        const duration = this.audio.duration;
        if (isFinite(duration)) {
            this.durationLabel.textContent = this.formatTime(duration);
        }
    }
    
    updateProgress() {
        if (this.isDragging) return; // Don't update while user is dragging
        
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        this.updateProgressDisplay(currentTime, duration);
    }
      updateProgressDisplay(currentTime, duration) {
        // Update time labels
        if (this.currentTimeLabel) {
            this.currentTimeLabel.textContent = this.formatTime(currentTime);
        }
        if (this.durationLabel) {
            this.durationLabel.textContent = this.formatTime(duration || 0);
        }
        
        if (isFinite(duration) && duration > 0) {
            // Update progress bars
            const percent = (currentTime / duration) * 100;
            
            // Mini player progress
            if (this.miniProgress) {
                this.miniProgress.style.width = percent + '%';
            }
            
            // Full player progress
            if (this.progressFill) {
                this.progressFill.style.width = percent + '%';
            }
            if (this.progressThumb) {
                this.progressThumb.style.left = percent + '%';
            }
        }
    }
      updatePlayState(playing) {
        this.isPlaying = playing;
        
        // Update play/pause buttons
        const playIcon = playing ? '⏸' : '▶';
        
        if (this.miniPlayBtn) {
            const iconElement = this.miniPlayBtn.querySelector('.ios-icon');
            if (iconElement) iconElement.textContent = playIcon;
        }
        
        if (this.mainPlayBtn) {
            const iconElement = this.mainPlayBtn.querySelector('.ios-icon');
            if (iconElement) iconElement.textContent = playIcon;
        }
        
        console.log('🍎 Play state updated:', playing ? 'Playing' : 'Paused');
    }
      
    handleTrackEnd() {
        console.log('🍎 Track ended, repeat mode:', this.repeatMode);
        this.updatePlayState(false);
        
        if (this.repeatMode === 'one') {
            // Repeat current track
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all') {
            // Play next track
            this.nextTrack();
            this.play();
        } else {
            // No repeat - just go to next track but don't auto-play
            this.nextTrack();
        }
    }
    
    formatTime(seconds) {
        if (!isFinite(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Integration methods for main site functions
    updateShuffleState(isShuffled) {
        this.shuffleBtn.classList.toggle('active', isShuffled);
    }
    
    updateRepeatState(repeatMode) {
        // repeatMode: 'none', 'all', 'one'
        this.repeatBtn.classList.toggle('active', repeatMode !== 'none');
        
        const repeatIcon = repeatMode === 'one' ? '🔂' : '🔁';
        this.repeatBtn.querySelector('.ios-icon').textContent = repeatIcon;
    }
    
    // Error handling
    handleError(error) {
        console.error('🍎 iOS Player Error:', error);
        
        // Reset to safe state
        this.updatePlayState(false);
        this.updateProgressDisplay(0, 0);
    }
}

// Initialize iOS player when DOM is ready
let iosPlayer;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for TRACKS to be available
    if (window.TRACKS && window.TRACKS.length > 0) {
        iosPlayer = new iOSMusicPlayer();
        iosPlayer.setVolume(70);
        console.log('🍎 iOS Music Player ready with', window.TRACKS.length, 'tracks');
    } else {
        // Wait a bit for tracks to load
        setTimeout(() => {
            iosPlayer = new iOSMusicPlayer();
            iosPlayer.setVolume(70);
            console.log('🍎 iOS Music Player ready (delayed load)');
        }, 100);
    }
});

// Integration functions for main site compatibility
function loadTrackInIOSPlayer(trackData) {
    if (iosPlayer) {
        iosPlayer.loadTrack(trackData);
    }
}

function updateIOSPlayerState(state) {
    if (!iosPlayer) return;
    
    if (state.shuffled !== undefined) {
        iosPlayer.updateShuffleState(state.shuffled);
    }
    
    if (state.repeat !== undefined) {
        iosPlayer.updateRepeatState(state.repeat);
    }
}

// Export for global access
window.iosPlayer = iosPlayer;
window.loadTrackInIOSPlayer = loadTrackInIOSPlayer;
window.updateIOSPlayerState = updateIOSPlayerState;
