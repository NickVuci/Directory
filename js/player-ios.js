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
            
            // Remove any remaining active states that might be stuck
            button.classList.remove('active', 'ios-button-active');
            
            // Ensure proper default styling is applied
            button.style.transition = 'all var(--transition-fast)';
        });
        
        // Add touch-friendly progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.classList.add('ios-progress');
        }
        
        // Add touch event listeners for control buttons
        this.addTouchListeners();
        
        // Handle mobile player controls if they exist
        const mobileButtons = document.querySelectorAll('.mobile-control-btn');
        mobileButtons.forEach(button => {
            button.classList.add('ios-touch-target');
        });
    }
      /**
     * Add iOS-specific touch event listeners
     */
    addTouchListeners() {
        // Add touch-specific event handling for all control buttons
        const allControlButtons = document.querySelectorAll('.control-btn');
        
        allControlButtons.forEach(button => {
            // Clone and replace to remove any existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add active class on touch start
            newButton.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-tap zoom
                newButton.classList.add('ios-button-active');
                
                // Handle play/pause button specifically
                if (newButton.classList.contains('play-pause-btn')) {
                    this.basePlayer.togglePlay();
                } else if (newButton.classList.contains('prev-btn')) {
                    this.basePlayer.playPreviousTrack();
                } else if (newButton.classList.contains('next-btn')) {
                    this.basePlayer.playNextTrack();
                }
            });
            
            // Remove active class on touch end
            newButton.addEventListener('touchend', () => {
                newButton.classList.remove('ios-button-active');
            });
            
            // Remove active class if touch is moved outside the button
            newButton.addEventListener('touchcancel', () => {
                newButton.classList.remove('ios-button-active');
            });
        });
        
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
            
            progressBar.addEventListener('touchcancel', () => {
                // Remove active state class on touch cancel as well
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
                album: this.basePlayer.currentTrack.album,
                tuning: this.basePlayer.currentTrack.tuning,

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
        // Hide volume controls on iOS as they're redundant (iOS uses system volume)
        const volumeControl = document.querySelector('.volume-control');
        if (volumeControl) {
            volumeControl.style.display = 'none';
        }
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
                -webkit-touch-callout: none; /* Disable callout on long press */
                -webkit-user-select: none;   /* Disable text selection */
                user-select: none;           /* Disable text selection */
            }
            
            /* Explicit active state styling for iOS */
            .ios-button-active {
                background: var(--button-hover-bg) !important;
                color: var(--button-hover-color) !important;
                transform: scale(0.95);
                transition: transform 0.1s ease;
            }
            
            /* Reset all hover states on iOS since they can "stick" */
            .ios-device .control-btn:hover {
                background: var(--button-bg);
                color: var(--button-color);
            }
            
            /* Only apply hover effects when not on a touch device */
            @media (hover: hover) {
                .ios-device .control-btn:hover {
                    background: var(--button-hover-bg);
                    color: var(--button-hover-color);
                }
            }
            
            .ios-progress {
                height: 8px;
            }
            
            .ios-active {
                height: 12px !important;
            }
            
            .ios-progress::-webkit-slider-thumb {
                width: 20px;
                height: 20px;
            }
            
            /* Fix for iOS input styling */
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
            }
            
            /* Hide volume control on iOS devices */
            .ios-optimized .volume-control {
                display: none !important;
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
