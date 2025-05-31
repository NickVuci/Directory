/**
 * iOS-specific optimizations for the audio player
 * This file extends the base AudioPlayerCore with iOS-friendly features
 */

class iOSAudioPlayer {
    constructor(basePlayer) {
        this.basePlayer = basePlayer;
        this.isIOS = this.detectIOS();
        
        if (this.isIOS) {
            console.log('🍎 iOS detected, applying optimizations');
            this.applyIOSOptimizations();
        }
    }
    
    /**
     * Detect iOS devices
     * @returns {boolean} True if the device is running iOS
     */
    detectIOS() {
        // Feature detection rather than user-agent sniffing when possible
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        return isIOS;
    }
    
    /**
     * Apply iOS-specific optimizations
     */
    applyIOSOptimizations() {
        // Add iOS-specific class to player
        const playerElement = document.querySelector('.audio-player');
        if (playerElement) {
            playerElement.classList.add('ios-optimized');
            document.documentElement.classList.add('ios-device');
        }
        
        // Enhance touch targets
        this.enhanceTouchTargets();
        
        // Set up Media Session API
        this.setupMediaSession();
        
        // Handle iOS-specific audio behaviors
        this.handleIOSAudioBehaviors();
        
        // Optimize appearance for iOS
        this.optimizeIOSAppearance();
    }
    
    /**
     * Enhance touch targets for better iOS experience
     */
    enhanceTouchTargets() {
        // Make player controls larger
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(button => {
            button.classList.add('ios-touch-target');
        });
        
        // Add touch-friendly progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.classList.add('ios-progress');
        }
        
        // Add touch event listeners (if needed)
        this.addTouchListeners();
    }
    
    /**
     * Add iOS-specific touch event listeners
     */
    addTouchListeners() {
        // Add touch-specific event handling if needed
        const playPauseBtn = document.querySelector('.play-pause-btn');
        if (playPauseBtn) {
            // Remove any existing listeners
            const newPlayPauseBtn = playPauseBtn.cloneNode(true);
            playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
            
            // Add touch listener
            newPlayPauseBtn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-tap zoom
                this.basePlayer.togglePlay();
            });
        }
        
        // Optimize progress bar for touch
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('touchstart', () => {
                // Add active state class
                progressBar.classList.add('ios-active');
            });
            
            progressBar.addEventListener('touchend', () => {
                // Remove active state class
                progressBar.classList.remove('ios-active');
            });
        }
    }
    
    /**
     * Set up Media Session API for lock screen controls
     */
    setupMediaSession() {
        if ('mediaSession' in navigator) {
            // Set metadata
            this.updateMediaSessionMetadata();
            
            // Set action handlers
            navigator.mediaSession.setActionHandler('play', () => {
                if (this.basePlayer.audioElement.paused) {
                    this.basePlayer.togglePlay();
                }
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                if (!this.basePlayer.audioElement.paused) {
                    this.basePlayer.togglePlay();
                }
            });
            
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                this.basePlayer.playPreviousTrack();
            });
            
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                this.basePlayer.playNextTrack();
            });
            
            // Listen for track changes to update metadata
            this.basePlayer.audioElement.addEventListener('loadedmetadata', () => {
                this.updateMediaSessionMetadata();
            });
        }
    }
    
    /**
     * Update Media Session metadata
     */
    updateMediaSessionMetadata() {
        if ('mediaSession' in navigator && this.basePlayer.currentTrack) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: this.basePlayer.currentTrack.title,
                artist: this.basePlayer.currentTrack.artist,
                album: this.basePlayer.currentTrack.tuning || 'Xenharmonic Music',
                artwork: [
                    { src: 'images/player-artwork-96.png', sizes: '96x96', type: 'image/png' },
                    { src: 'images/player-artwork-128.png', sizes: '128x128', type: 'image/png' },
                    { src: 'images/player-artwork-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'images/player-artwork-256.png', sizes: '256x256', type: 'image/png' },
                    { src: 'images/player-artwork-384.png', sizes: '384x384', type: 'image/png' },
                    { src: 'images/player-artwork-512.png', sizes: '512x512', type: 'image/png' },
                ]
            });
        }
    }
    
    /**
     * Handle iOS-specific audio behaviors
     */
    handleIOSAudioBehaviors() {
        // iOS requires user interaction to start audio
        document.documentElement.addEventListener('touchstart', () => {
            // Create and load an empty audio element to enable audio playback
            const silentAudio = document.createElement('audio');
            silentAudio.setAttribute('src', 'data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60elY5BbWs//MkxAoHAAJWUAhEmAQswqHjSNb/+9v875PquTkc5bW//MkxA4HKAIW8AhEmAQXekxN/xdPs//0d3ZPMdGC2sIM//MkxBcHAAJOMAhEmAQVoRgxP/+XP0nkKey2s//MkxBoHAAI8MAhEmAVKQiAPP/6XP8uGv59KCW1//MkxB4HAAI0YAhEmAUsJvyDP/6XP8KR/Lhn3bW//MkxCYHIAIiUAhEmAQwMY5PZ//z6HE3/6Wk1ZaW//MkxCsHAAIuAAhEmAQNrRQn//40DP/6sIMK2s//MkxDMHGAIaMAhEmAQlAGP/+XCwev/vTbGtbI//MkxDsHOAIaEAhEAAwwkRP/82DEP/+LPIKS2//MkxD8GkAIKMAhEmBQ+AMP/9//0K1a3/+srW//MkxEsGqAIoABEAAAl8MP/+ev//8uVrZa3//MkxE4HAAIOEAAIAAD4c///9//9BLW//+PP//MkxFUFwAIIAAAAAB0AP/8a///+l2//+bZa//MkxF4Fo/4IAAAAAAA/+ev//+BS2///z0//MkxGQEAA4IAAAAAAA//l3//+lS///k68');
            silentAudio.load();
            
            // Only needed once
            document.documentElement.removeEventListener('touchstart', this);
        }, { once: true });
        
        // Handle iOS audio focus - pause when audio focus is lost
        this.basePlayer.audioElement.addEventListener('pause', () => {
            this.basePlayer.isPlaying = false;
            this.basePlayer.playPauseBtn.textContent = '▶';
            this.basePlayer.playPauseBtn.setAttribute('aria-label', 'Play');
        });
        
        // Optimize seeking for iOS
        this.optimizeIOSSeeking();
    }
    
    /**
     * Optimize seeking behavior for iOS
     */
    optimizeIOSSeeking() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            // Use touchend to actually seek, for better performance on iOS
            progressBar.addEventListener('touchend', () => {
                this.basePlayer.setProgress();
            });
        }
    }
    
    /**
     * Optimize appearance for iOS
     */
    optimizeIOSAppearance() {
        // Add iOS-specific styles
        const stylesheet = document.createElement('style');
        stylesheet.textContent = `
            .ios-optimized {
                /* iOS-friendly styles */
                -webkit-tap-highlight-color: transparent;
            }
            
            .ios-touch-target {
                min-width: 44px;
                min-height: 44px;
            }
            
            .ios-progress {
                height: 8px;
            }
            
            .ios-progress::-webkit-slider-thumb {
                width: 20px;
                height: 20px;
            }
            
            /* Fix for iOS input styling */
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
            }
            
            /* iOS-specific playlist adjustments */
            @supports (-webkit-touch-callout: none) {
                .playlist-container {
                    -webkit-overflow-scrolling: touch;
                }
                
                .track-item {
                    padding: 12px;
                }
            }
        `;
        document.head.appendChild(stylesheet);
    }
}

// Initialize iOS enhancements when the audio player is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the base player to be initialized
    const checkPlayer = setInterval(() => {
        if (window.audioPlayer) {
            new iOSAudioPlayer(window.audioPlayer);
            clearInterval(checkPlayer);
        }
    }, 100);
});
