/**
 * iOS Player Initialization
 * Replaces the current player with iOS-optimized version
 */

class iOSPlayerInit {
    constructor() {
        this.isInitialized = false;
        this.player = null;
        this.isIOSDevice = this.detectIOSDevice();
        
        console.log('🍎 iOS Player Init - Device detected:', this.isIOSDevice ? 'iOS' : 'Non-iOS');
    }    /**
     * Detect if running on iOS device
     */
    detectIOSDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check for explicit iOS device identifiers
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        
        // More strict iOS detection - require explicit iOS indicators
        const isSafariOnIOS = isIOS && /safari/.test(userAgent);
        const isIOSApp = isIOS && (/webkit/.test(userAgent) || /applewebkit/.test(userAgent));
        
        // For development/testing: Check for iOS override or force iOS mode
        const forceIOS = localStorage.getItem('forceIOSPlayer') === 'true' || 
                         window.location.hash.includes('ios') ||
                         window.location.search.includes('ios=true');
        
        // Only return true for actual iOS devices or explicit force flag
        const detectedIOS = forceIOS || isIOS;
        
        console.log('🍎 iOS Detection Details:', {
            userAgent: userAgent,
            isIOS: isIOS,
            isSafariOnIOS: isSafariOnIOS,
            isIOSApp: isIOSApp,
            forceIOS: forceIOS,
            finalResult: detectedIOS
        });
        
        return detectedIOS;
    }
    
    /**
     * Initialize the appropriate player based on device
     */
    async init() {
        if (this.isInitialized) {
            console.log('🍎 Player already initialized');
            return;
        }
        
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Load CSS for iOS player
            await this.loadIOSPlayerCSS();
            
            // Find footer element
            const footerElement = document.querySelector('.footer');
            if (!footerElement) {
                console.error('🍎 Footer element not found');
                return;
            }
            
            if (this.isIOSDevice) {
                // Initialize iOS-optimized player
                await this.initIOSPlayer(footerElement);
            } else {
                // Initialize fallback player for non-iOS devices
                await this.initFallbackPlayer(footerElement);
            }
            
            this.isInitialized = true;
            console.log('🍎 Player initialization complete');
            
        } catch (error) {
            console.error('🍎 Player initialization failed:', error);
            // Fallback to basic player
            this.initBasicFallback();
        }
    }
    
    /**
     * Load iOS player CSS
     */
    async loadIOSPlayerCSS() {
        return new Promise((resolve, reject) => {
            // Check if CSS is already loaded
            if (document.querySelector('link[href*="ios-player.css"]')) {
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/ios-player.css';
            link.onload = () => {
                console.log('🍎 iOS Player CSS loaded');
                resolve();
            };
            link.onerror = () => {
                console.warn('🍎 Failed to load iOS Player CSS');
                reject(new Error('CSS load failed'));
            };
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * Initialize iOS-optimized player
     */
    async initIOSPlayer(container) {
        console.log('🍎 Initializing iOS-optimized player');
        
        // Clear existing content
        container.innerHTML = '';
        
        // Add iOS class to body for styling
        document.body.classList.add('ios-mode');
        
        // Hide original player elements if they exist
        this.hideOriginalPlayer();
        
        // Initialize iOS player core
        if (typeof window.iOSMusicPlayerCore === 'undefined') {
            throw new Error('iOS Player Core not found');
        }
        
        this.player = new window.iOSMusicPlayerCore();
        await this.player.init(container);
        
        // Add copyright notice
        this.addCopyright(container);
        
        // Setup media session for iOS
        this.setupMediaSession();
        
        console.log('🍎 iOS player ready');
    }    /**
     * Initialize fallback player for non-iOS devices
     */
    async initFallbackPlayer(container) {
        console.log('🍎 Initializing original player for non-iOS device');
        
        // Clear container first
        container.innerHTML = '';
        
        // Remove iOS mode class if it exists
        document.body.classList.remove('ios-mode');
        
        // Try to use the original player initialization logic
        try {
            if (typeof window.AudioPlayerCore !== 'undefined') {
                // Create player container
                const playerContainer = document.createElement('div');
                playerContainer.id = 'audio-player-container';
                playerContainer.className = 'footer-player';
                
                container.appendChild(playerContainer);
                
                this.player = new window.AudioPlayerCore();
                await this.player.init(playerContainer);
                
                // Add to window for global access
                window.audioPlayer = this.player;
                
                console.log('🍎 Original player initialized successfully via fallback');
            } else {
                // Fallback to basic player creation
                console.warn('🍎 AudioPlayerCore not found, creating basic player');
                this.createBasicPlayer(container);
            }
        } catch (error) {
            console.error('🍎 Fallback player initialization failed:', error);
            this.createBasicPlayer(container);
        }
        
        // Add copyright notice
        this.addCopyright(container);
    }
    
    /**
     * Create a basic player when AudioPlayerCore isn't available
     */
    createBasicPlayer(container) {
        // Create basic player HTML structure similar to the original
        const playerHTML = `
            <div class="audio-player">
                <div class="player-header">
                    <div class="track-info">
                        <div class="track-title">Select a track</div>
                        <div class="track-details">No track selected</div>
                    </div>
                </div>
                
                <div class="player-controls">
                    <button class="control-btn btn-unified prev-btn" aria-label="Previous track">⏮</button>
                    <button class="control-btn btn-unified play-pause-btn" aria-label="Play or pause">▶</button>
                    <button class="control-btn btn-unified next-btn" aria-label="Next track">⏭</button>
                </div>
                
                <div class="progress-container">
                    <span class="time-display current-time">0:00</span>
                    <div class="progress-bar-container">
                        <input type="range" class="progress-bar" min="0" max="100" value="0" step="0.1">
                    </div>
                    <span class="time-display duration">0:00</span>
                </div>
                
                <div class="volume-control">
                    <button class="volume-icon btn-unified" aria-label="Volume">🔊</button>
                    <div class="volume-slider-container">
                        <input type="range" class="volume-slider" min="0" max="100" value="70" step="1">
                    </div>
                </div>
                
                <audio id="audioElement" preload="metadata"></audio>
            </div>
        `;
        
        container.innerHTML = playerHTML;
        
        // Basic functionality setup
        this.setupBasicPlayerFunctionality(container);
    }
    
    /**
     * Setup basic player functionality
     */
    setupBasicPlayerFunctionality(container) {
        const audio = container.querySelector('#audioElement');
        const playBtn = container.querySelector('.play-pause-btn');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const progressBar = container.querySelector('.progress-bar');
        const volumeSlider = container.querySelector('.volume-slider');
        const trackTitle = container.querySelector('.track-title');
        const trackDetails = container.querySelector('.track-details');
        const currentTimeDisplay = container.querySelector('.current-time');
        const durationDisplay = container.querySelector('.duration');
        
        if (!audio || !playBtn) return;
        
        let currentTrackIndex = 0;
        let tracks = [];
        let isPlaying = false;
        
        // Load tracks data
        if (window.tracksData && window.tracksData.tracks) {
            tracks = window.tracksData.tracks;
            if (tracks.length > 0) {
                loadTrack(0);
            }
        }
        
        function loadTrack(index) {
            if (index < 0 || index >= tracks.length) return;
            
            currentTrackIndex = index;
            const track = tracks[index];
            
            audio.src = track.file;
            trackTitle.textContent = track.title;
            trackDetails.textContent = `${track.artist} • ${track.tuning}`;
            
            // Reset progress
            progressBar.value = 0;
            currentTimeDisplay.textContent = '0:00';
            durationDisplay.textContent = '0:00';
        }
        
        function togglePlayPause() {
            if (!tracks.length) return;
            
            if (isPlaying) {
                audio.pause();
                playBtn.textContent = '▶';
                isPlaying = false;
            } else {
                audio.play().then(() => {
                    playBtn.textContent = '⏸';
                    isPlaying = true;
                }).catch(console.error);
            }
        }
        
        function formatTime(seconds) {
            if (isNaN(seconds)) return '0:00';
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        // Event listeners
        playBtn.addEventListener('click', togglePlayPause);
        
        prevBtn.addEventListener('click', () => {
            const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
            loadTrack(prevIndex);
            if (isPlaying) audio.play().catch(console.error);
        });
        
        nextBtn.addEventListener('click', () => {
            const nextIndex = (currentTrackIndex + 1) % tracks.length;
            loadTrack(nextIndex);
            if (isPlaying) audio.play().catch(console.error);
        });
        
        progressBar.addEventListener('input', (e) => {
            if (audio.duration) {
                const time = (e.target.value / 100) * audio.duration;
                audio.currentTime = time;
            }
        });
        
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
        });
        
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.value = progress;
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
                durationDisplay.textContent = formatTime(audio.duration);
            }
        });
        
        audio.addEventListener('ended', () => {
            isPlaying = false;
            playBtn.textContent = '▶';
            // Auto-play next track
            const nextIndex = (currentTrackIndex + 1) % tracks.length;
            loadTrack(nextIndex);
        });
        
        console.log('🍎 Basic player functionality setup complete');
    }
    
    /**
     * Hide original player elements
     */
    hideOriginalPlayer() {
        // Hide any existing audio players
        const existingPlayers = document.querySelectorAll('.audio-player, #musicPlayer');
        existingPlayers.forEach(player => {
            player.style.display = 'none';
        });
    }
    
    /**
     * Setup media session for iOS integration
     */
    setupMediaSession() {
        if (!('mediaSession' in navigator)) {
            console.log('🍎 Media Session API not supported');
            return;
        }
        
        try {
            // Set up media session handlers
            navigator.mediaSession.setActionHandler('play', () => {
                if (this.player && typeof this.player.togglePlayPause === 'function') {
                    this.player.togglePlayPause();
                }
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                if (this.player && typeof this.player.togglePlayPause === 'function') {
                    this.player.togglePlayPause();
                }
            });
            
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                if (this.player && typeof this.player.previousTrack === 'function') {
                    this.player.previousTrack();
                }
            });
            
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                if (this.player && typeof this.player.nextTrack === 'function') {
                    this.player.nextTrack();
                }
            });
            
            console.log('🍎 Media Session configured');
            
        } catch (error) {
            console.warn('🍎 Media Session setup failed:', error);
        }
    }
    
    /**
     * Update media session metadata
     */
    updateMediaSessionMetadata(track) {
        if (!('mediaSession' in navigator) || !track) return;
        
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album || 'Xenharmonic Music',
                artwork: [
                    { src: 'favicon.ico', sizes: '32x32', type: 'image/x-icon' }
                ]
            });
            
            console.log('🍎 Media Session metadata updated');
            
        } catch (error) {
            console.warn('🍎 Media Session metadata update failed:', error);
        }
    }
    
    /**
     * Add copyright notice to footer
     */
    addCopyright(container) {
        const copyrightHTML = `
            <div class="footer-copyright">
                <p>&copy; ${new Date().getFullYear()} Nick Vuci. All rights reserved.</p>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', copyrightHTML);
    }
    
    /**
     * Basic fallback initialization
     */
    initBasicFallback() {
        console.log('🍎 Initializing basic fallback player');
        
        const container = document.querySelector('.footer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="basic-audio-player">
                <div class="basic-player-message">
                    <p>Audio player loading...</p>
                    <p>Please refresh the page if the player doesn't appear.</p>
                </div>
            </div>
        `;
        
        // Add basic styling
        const style = document.createElement('style');
        style.textContent = `
            .basic-audio-player {
                padding: var(--spacing-lg);
                text-align: center;
                background: var(--dark-bg);
                border-top: 1px solid var(--border-accent);
            }
            .basic-player-message p {
                color: var(--text-secondary);
                font-size: var(--font-size-sm);
                margin: var(--spacing-xs) 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Get current player instance
     */
    getPlayer() {
        return this.player;
    }
    
    /**
     * Check if player is initialized
     */
    isPlayerReady() {
        return this.isInitialized && this.player !== null;
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        if (this.player && typeof this.player.destroy === 'function') {
            this.player.destroy();
        }
        
        document.body.classList.remove('ios-mode');
        
        // Remove iOS CSS
        const cssLink = document.querySelector('link[href*="ios-player.css"]');
        if (cssLink) {
            cssLink.remove();
        }
        
        this.player = null;
        this.isInitialized = false;
        
        console.log('🍎 Player destroyed');
    }
}

// Initialize player when script loads
window.iosPlayerInit = new iOSPlayerInit();

// Only auto-initialize if we're actually on an iOS device or explicitly forced
const shouldAutoInit = window.iosPlayerInit.isIOSDevice;

console.log('🍎 Auto-init decision:', shouldAutoInit, 'iOS device:', window.iosPlayerInit.isIOSDevice);

if (shouldAutoInit) {
    // Auto-initialize iOS player when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🍎 DOM ready, initializing iOS player');
            window.iosPlayerInit.init();
        });
    } else {
        // DOM is already ready
        console.log('🍎 DOM already ready, initializing iOS player');
        window.iosPlayerInit.init();
    }
} else {
    console.log('🍎 Non-iOS device detected, original player will handle initialization');
}

// Export for manual access
window.iOSPlayerInit = iOSPlayerInit;
