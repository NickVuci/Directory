/**
 * iOS-Optimized Music Player Core
 * Native iOS experience with existing brand colors and data structure
 */

class iOSMusicPlayerCore {
    constructor() {
        this.isExpanded = false;
        this.isDragging = false;
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 0.7;
        this.currentTime = 0;
        this.duration = 0;
        
        // Track management
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
        this.originalTrackOrder = [];
        
        // Touch handling
        this.startY = 0;
        this.currentY = 0;
        this.isDraggingPlayer = false;
        
        // Audio element
        this.audio = null;
        
        // DOM elements
        this.container = null;
        this.miniPlayer = null;
        this.fullPlayer = null;
        
        // Animation state
        this.isAnimating = false;
        
        // Bind methods
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleAudioTimeUpdate = this.handleAudioTimeUpdate.bind(this);
        this.handleAudioEnded = this.handleAudioEnded.bind(this);
        this.handleAudioLoadedMetadata = this.handleAudioLoadedMetadata.bind(this);
        
        console.log('🍎 iOS Music Player Core initialized');
    }
    
    /**
     * Initialize the iOS player
     */
    async init(containerElement) {
        if (!containerElement) {
            console.error('🍎 No container provided for iOS player');
            return;
        }
        
        this.container = containerElement;
        
        // Load tracks data
        await this.loadTracksData();
        
        // Create player structure
        this.createPlayerStructure();
        
        // Setup audio element
        this.setupAudioElement();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load first track
        if (this.tracks.length > 0) {
            this.loadTrack(0);
        }
        
        console.log('🍎 iOS Player initialized with', this.tracks.length, 'tracks');
    }
    
    /**
     * Load tracks data from window.tracksData
     */
    async loadTracksData() {
        if (window.tracksData && window.tracksData.tracks) {
            this.tracks = window.tracksData.tracks;
            this.originalTrackOrder = [...this.tracks];
            console.log('🍎 Loaded', this.tracks.length, 'tracks');
        } else {
            console.warn('🍎 No tracks data found');
            this.tracks = [];
        }
    }
    
    /**
     * Create the iOS player DOM structure
     */
    createPlayerStructure() {
        const playerHTML = `
            <div class="ios-music-player">
                <!-- Mini Player (Always Visible) -->
                <div class="ios-mini-player" id="iosMiniPlayer">
                    <div class="ios-mini-content">
                        <div class="ios-mini-art" id="iosMiniArt">
                            <div class="ios-mini-art-placeholder">♪</div>
                        </div>
                        <div class="ios-mini-info">
                            <div class="ios-mini-title" id="iosMiniTitle">Select a track</div>
                            <div class="ios-mini-artist" id="iosMiniArtist">Nick Vuci</div>
                        </div>
                        <button class="ios-mini-play-btn" id="iosMiniPlayBtn" aria-label="Play">
                            <span class="ios-play-icon">▶</span>
                        </button>
                    </div>
                    <div class="ios-mini-progress" id="iosMiniProgress">
                        <div class="ios-mini-progress-fill"></div>
                    </div>
                </div>
                
                <!-- Full Player (Expandable Overlay) -->
                <div class="ios-full-player" id="iosFullPlayer">
                    <div class="ios-full-backdrop"></div>
                    <div class="ios-full-content">
                        <!-- Header with collapse handle -->
                        <div class="ios-full-header">
                            <div class="ios-collapse-handle"></div>
                            <button class="ios-collapse-btn" id="iosCollapseBtn" aria-label="Collapse">
                                <span>⌄</span>
                            </button>
                        </div>
                        
                        <!-- Album Art -->
                        <div class="ios-full-art-container">
                            <div class="ios-full-art" id="iosFullArt">
                                <div class="ios-full-art-placeholder">♪</div>
                            </div>
                        </div>
                        
                        <!-- Track Info -->
                        <div class="ios-full-info">
                            <div class="ios-full-title" id="iosFullTitle">Select a track</div>
                            <div class="ios-full-artist" id="iosFullArtist">Nick Vuci</div>
                            <div class="ios-full-details" id="iosFullDetails">Xenharmonic Music</div>
                        </div>
                        
                        <!-- Progress Control -->
                        <div class="ios-full-progress-container">
                            <div class="ios-full-progress-bar" id="iosFullProgressBar">
                                <div class="ios-full-progress-track">
                                    <div class="ios-full-progress-fill" id="iosFullProgressFill"></div>
                                    <div class="ios-full-progress-thumb" id="iosFullProgressThumb"></div>
                                </div>
                            </div>
                            <div class="ios-full-time-display">
                                <span class="ios-current-time" id="iosCurrentTime">0:00</span>
                                <span class="ios-duration" id="iosDuration">0:00</span>
                            </div>
                        </div>
                        
                        <!-- Playback Controls -->
                        <div class="ios-full-controls">
                            <button class="ios-control-btn ios-shuffle-btn" id="iosShuffleBtn" aria-label="Shuffle">
                                <span>🔀</span>
                            </button>
                            <button class="ios-control-btn ios-prev-btn" id="iosPrevBtn" aria-label="Previous">
                                <span>⏮</span>
                            </button>
                            <button class="ios-control-btn ios-play-btn-large" id="iosPlayBtnLarge" aria-label="Play">
                                <span class="ios-play-icon-large">▶</span>
                            </button>
                            <button class="ios-control-btn ios-next-btn" id="iosNextBtn" aria-label="Next">
                                <span>⏭</span>
                            </button>
                            <button class="ios-control-btn ios-repeat-btn" id="iosRepeatBtn" aria-label="Repeat">
                                <span>🔁</span>
                            </button>
                        </div>
                        
                        <!-- Volume Control -->
                        <div class="ios-volume-container">
                            <span class="ios-volume-icon-min">🔈</span>
                            <div class="ios-volume-slider-container">
                                <input type="range" class="ios-volume-slider" id="iosVolumeSlider" 
                                       min="0" max="100" value="70" step="1">
                            </div>
                            <span class="ios-volume-icon-max">🔊</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = playerHTML;
        
        // Get references to key elements
        this.miniPlayer = document.getElementById('iosMiniPlayer');
        this.fullPlayer = document.getElementById('iosFullPlayer');
        
        // Mini player elements
        this.miniArt = document.getElementById('iosMiniArt');
        this.miniTitle = document.getElementById('iosMiniTitle');
        this.miniArtist = document.getElementById('iosMiniArtist');
        this.miniPlayBtn = document.getElementById('iosMiniPlayBtn');
        this.miniProgress = document.getElementById('iosMiniProgress');
        
        // Full player elements
        this.fullArt = document.getElementById('iosFullArt');
        this.fullTitle = document.getElementById('iosFullTitle');
        this.fullArtist = document.getElementById('iosFullArtist');
        this.fullDetails = document.getElementById('iosFullDetails');
        this.collapseBtn = document.getElementById('iosCollapseBtn');
        this.playBtnLarge = document.getElementById('iosPlayBtnLarge');
        this.prevBtn = document.getElementById('iosPrevBtn');
        this.nextBtn = document.getElementById('iosNextBtn');
        this.shuffleBtn = document.getElementById('iosShuffleBtn');
        this.repeatBtn = document.getElementById('iosRepeatBtn');
        this.volumeSlider = document.getElementById('iosVolumeSlider');
        this.currentTimeDisplay = document.getElementById('iosCurrentTime');
        this.durationDisplay = document.getElementById('iosDuration');
        this.progressBar = document.getElementById('iosFullProgressBar');
        this.progressFill = document.getElementById('iosFullProgressFill');
        this.progressThumb = document.getElementById('iosFullProgressThumb');
    }
    
    /**
     * Setup audio element
     */
    setupAudioElement() {
        // Create or get existing audio element
        this.audio = document.getElementById('audioElement') || document.createElement('audio');
        this.audio.id = 'audioElement';
        this.audio.preload = 'metadata';
        
        if (!document.getElementById('audioElement')) {
            document.body.appendChild(this.audio);
        }
        
        // Set initial volume
        this.audio.volume = this.volume;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mini player interactions
        this.miniPlayer.addEventListener('click', (e) => {
            if (e.target !== this.miniPlayBtn && !this.miniPlayBtn.contains(e.target)) {
                this.expandPlayer();
            }
        });
        
        this.miniPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlayPause();
        });
        
        // Full player interactions
        this.collapseBtn.addEventListener('click', () => this.collapsePlayer());
        this.playBtnLarge.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Volume control
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });
        
        // Progress bar interactions
        this.setupProgressBarInteractions();
        
        // Touch gestures for player expansion/collapse
        this.setupTouchGestures();
        
        // Audio events
        this.audio.addEventListener('timeupdate', this.handleAudioTimeUpdate);
        this.audio.addEventListener('ended', this.handleAudioEnded);
        this.audio.addEventListener('loadedmetadata', this.handleAudioLoadedMetadata);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.togglePlayPause();
            }
        });
    }
    
    /**
     * Setup touch gestures for expanding/collapsing player
     */
    setupTouchGestures() {
        // Mini player touch events
        this.miniPlayer.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.miniPlayer.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.miniPlayer.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        
        // Full player backdrop close
        const backdrop = this.fullPlayer.querySelector('.ios-full-backdrop');
        backdrop.addEventListener('click', () => this.collapsePlayer());
        
        // Handle swipe down on full player header
        const header = this.fullPlayer.querySelector('.ios-full-header');
        header.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        header.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        header.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }
    
    /**
     * Setup progress bar interactions
     */
    setupProgressBarInteractions() {
        let isDraggingProgress = false;
        
        const handleProgressInteraction = (e) => {
            if (!this.audio || !this.duration) return;
            
            const rect = this.progressBar.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            const newTime = percentage * this.duration;
            
            this.audio.currentTime = newTime;
            this.updateProgressDisplay(newTime, this.duration);
        };
        
        this.progressBar.addEventListener('mousedown', (e) => {
            isDraggingProgress = true;
            handleProgressInteraction(e);
        });
        
        this.progressBar.addEventListener('touchstart', (e) => {
            isDraggingProgress = true;
            handleProgressInteraction(e);
        }, { passive: false });
        
        document.addEventListener('mousemove', (e) => {
            if (isDraggingProgress) {
                handleProgressInteraction(e);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDraggingProgress) {
                e.preventDefault();
                handleProgressInteraction(e);
            }
        }, { passive: false });
        
        document.addEventListener('mouseup', () => {
            isDraggingProgress = false;
        });
        
        document.addEventListener('touchend', () => {
            isDraggingProgress = false;
        });
    }
    
    /**
     * Handle touch start for player gestures
     */
    handleTouchStart(e) {
        this.startY = e.touches[0].clientY;
        this.currentY = this.startY;
        this.isDraggingPlayer = false;
    }
    
    /**
     * Handle touch move for player gestures
     */
    handleTouchMove(e) {
        if (this.isAnimating) return;
        
        this.currentY = e.touches[0].clientY;
        const deltaY = this.currentY - this.startY;
        
        // Start dragging if moved more than 10px
        if (Math.abs(deltaY) > 10) {
            this.isDraggingPlayer = true;
            e.preventDefault();
        }
        
        // Handle different gestures based on current state
        if (this.isDraggingPlayer) {
            if (this.isExpanded && deltaY > 0) {
                // Dragging down on expanded player - start collapsing
                this.handleCollapseGesture(deltaY);
            } else if (!this.isExpanded && deltaY < 0) {
                // Dragging up on mini player - start expanding
                this.handleExpandGesture(Math.abs(deltaY));
            }
        }
    }
    
    /**
     * Handle touch end for player gestures
     */
    handleTouchEnd(e) {
        if (!this.isDraggingPlayer) return;
        
        const deltaY = this.currentY - this.startY;
        const threshold = 100; // pixels to trigger action
        
        if (this.isExpanded && deltaY > threshold) {
            this.collapsePlayer();
        } else if (!this.isExpanded && deltaY < -threshold) {
            this.expandPlayer();
        } else {
            // Reset to current state
            this.resetPlayerPosition();
        }
        
        this.isDraggingPlayer = false;
    }
    
    /**
     * Handle expand gesture
     */
    handleExpandGesture(distance) {
        const progress = Math.min(1, distance / 200);
        this.fullPlayer.style.transform = `translateY(${(1 - progress) * 100}%)`;
        this.fullPlayer.style.opacity = progress;
    }
    
    /**
     * Handle collapse gesture
     */
    handleCollapseGesture(distance) {
        const progress = Math.min(1, distance / 200);
        this.fullPlayer.style.transform = `translateY(${progress * 100}%)`;
        this.fullPlayer.style.opacity = 1 - progress;
    }
    
    /**
     * Reset player to current position
     */
    resetPlayerPosition() {
        this.fullPlayer.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
        
        if (this.isExpanded) {
            this.fullPlayer.style.transform = 'translateY(0)';
            this.fullPlayer.style.opacity = '1';
        } else {
            this.fullPlayer.style.transform = 'translateY(100%)';
            this.fullPlayer.style.opacity = '0';
        }
        
        setTimeout(() => {
            this.fullPlayer.style.transition = '';
        }, 300);
    }
    
    /**
     * Expand player to full screen
     */
    expandPlayer() {
        if (this.isExpanded || this.isAnimating) return;
        
        this.isAnimating = true;
        this.isExpanded = true;
        
        this.fullPlayer.style.display = 'block';
        
        // Force reflow
        this.fullPlayer.offsetHeight;
        
        this.fullPlayer.classList.add('expanding');
        
        setTimeout(() => {
            this.fullPlayer.classList.remove('expanding');
            this.isAnimating = false;
        }, 400);
        
        console.log('🍎 Player expanded');
    }
    
    /**
     * Collapse player to mini view
     */
    collapsePlayer() {
        if (!this.isExpanded || this.isAnimating) return;
        
        this.isAnimating = true;
        this.isExpanded = false;
        
        this.fullPlayer.classList.add('collapsing');
        
        setTimeout(() => {
            this.fullPlayer.style.display = 'none';
            this.fullPlayer.classList.remove('collapsing');
            this.isAnimating = false;
        }, 400);
        
        console.log('🍎 Player collapsed');
    }
    
    /**
     * Load a track by index
     */
    loadTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        this.currentTrackIndex = index;
        this.currentTrack = this.tracks[index];
        
        console.log('🍎 Loading track:', this.currentTrack.title);
        
        // Update audio source
        this.audio.src = this.currentTrack.file;
        
        // Update UI
        this.updateTrackInfo();
        
        // Reset progress
        this.currentTime = 0;
        this.updateProgressDisplay(0, 0);
    }
    
    /**
     * Update track info in UI
     */
    updateTrackInfo() {
        if (!this.currentTrack) return;
        
        const title = this.currentTrack.title;
        const artist = this.currentTrack.artist;
        const details = `${this.currentTrack.tuning} • ${this.currentTrack.year}`;
        
        // Update mini player
        this.miniTitle.textContent = title;
        this.miniArtist.textContent = artist;
        
        // Update full player
        this.fullTitle.textContent = title;
        this.fullArtist.textContent = artist;
        this.fullDetails.textContent = details;
    }
    
    /**
     * Toggle play/pause
     */
    async togglePlayPause() {
        if (!this.currentTrack) {
            console.log('🍎 No track loaded');
            return;
        }
        
        try {
            if (this.isPlaying) {
                await this.audio.pause();
                this.isPlaying = false;
                this.updatePlayButtonsState();
                console.log('🍎 Paused');
            } else {
                await this.audio.play();
                this.isPlaying = true;
                this.updatePlayButtonsState();
                console.log('🍎 Playing');
            }
        } catch (error) {
            console.error('🍎 Playback error:', error);
        }
    }
    
    /**
     * Update play button states
     */
    updatePlayButtonsState() {
        const playIcon = this.isPlaying ? '⏸' : '▶';
        
        // Update mini player button
        this.miniPlayBtn.querySelector('.ios-play-icon').textContent = playIcon;
        
        // Update full player button
        this.playBtnLarge.querySelector('.ios-play-icon-large').textContent = playIcon;
        
        // Update ARIA labels
        const label = this.isPlaying ? 'Pause' : 'Play';
        this.miniPlayBtn.setAttribute('aria-label', label);
        this.playBtnLarge.setAttribute('aria-label', label);
    }
    
    /**
     * Play next track
     */
    nextTrack() {
        let nextIndex;
        
        if (this.isShuffled) {
            nextIndex = Math.floor(Math.random() * this.tracks.length);
        } else {
            nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        
        this.loadTrack(nextIndex);
        
        if (this.isPlaying) {
            this.audio.play().catch(console.error);
        }
    }
    
    /**
     * Play previous track
     */
    previousTrack() {
        let prevIndex;
        
        if (this.isShuffled) {
            prevIndex = Math.floor(Math.random() * this.tracks.length);
        } else {
            prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        }
        
        this.loadTrack(prevIndex);
        
        if (this.isPlaying) {
            this.audio.play().catch(console.error);
        }
    }
    
    /**
     * Toggle shuffle mode
     */
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active', this.isShuffled);
        
        if (this.isShuffled) {
            this.shuffleBtn.style.color = 'var(--primary-gold)';
        } else {
            this.shuffleBtn.style.color = '';
        }
        
        console.log('🍎 Shuffle:', this.isShuffled ? 'ON' : 'OFF');
    }
    
    /**
     * Toggle repeat mode
     */
    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        
        if (this.repeatMode !== 'none') {
            this.repeatBtn.style.color = 'var(--primary-gold)';
            this.repeatBtn.querySelector('span').textContent = this.repeatMode === 'one' ? '🔂' : '🔁';
        } else {
            this.repeatBtn.style.color = '';
            this.repeatBtn.querySelector('span').textContent = '🔁';
        }
        
        console.log('🍎 Repeat mode:', this.repeatMode);
    }
    
    /**
     * Set volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        this.volumeSlider.value = this.volume * 100;
    }
    
    /**
     * Handle audio time update
     */
    handleAudioTimeUpdate() {
        if (!this.audio.duration) return;
        
        this.currentTime = this.audio.currentTime;
        this.duration = this.audio.duration;
        
        this.updateProgressDisplay(this.currentTime, this.duration);
    }
    
    /**
     * Handle audio ended
     */
    handleAudioEnded() {
        this.isPlaying = false;
        this.updatePlayButtonsState();
        
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.audio.play().catch(console.error);
        } else if (this.repeatMode === 'all' || this.currentTrackIndex < this.tracks.length - 1) {
            this.nextTrack();
        }
    }
    
    /**
     * Handle audio loaded metadata
     */
    handleAudioLoadedMetadata() {
        this.duration = this.audio.duration;
        this.updateProgressDisplay(this.currentTime, this.duration);
    }
    
    /**
     * Update progress display
     */
    updateProgressDisplay(currentTime, duration) {
        // Update time displays
        this.currentTimeDisplay.textContent = this.formatTime(currentTime);
        this.durationDisplay.textContent = this.formatTime(duration);
        
        // Update progress bars
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
        
        // Mini player progress
        const miniProgressFill = this.miniProgress.querySelector('.ios-mini-progress-fill');
        miniProgressFill.style.width = `${progress}%`;
        
        // Full player progress
        this.progressFill.style.width = `${progress}%`;
        this.progressThumb.style.left = `${progress}%`;
    }
    
    /**
     * Format time in MM:SS format
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Export for use
window.iOSMusicPlayerCore = iOSMusicPlayerCore;
