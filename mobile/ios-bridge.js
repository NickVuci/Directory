/**
 * iOS Mobile Player Bridge
 * Connects main site functions with iOS-specific player
 */

class iOSBridge {
    constructor() {
        this.musicPlayer = null;
        this.iosPlayer = null;
        this.currentTrackIndex = 0;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
        this.tracks = window.TRACKS || [];
        
        console.log('🍎 iOS Bridge initialized with', this.tracks.length, 'tracks');
    }
    
    init() {
        // Wait for both players to be ready
        this.waitForPlayers().then(() => {
            this.setupIntegration();
            console.log('🍎 iOS Bridge integration complete');
        });
    }
    
    async waitForPlayers() {
        // Wait for main music player
        while (!window.musicPlayer) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.musicPlayer = window.musicPlayer;
        
        // Wait for iOS player
        while (!window.iosPlayer) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.iosPlayer = window.iosPlayer;
    }
    
    setupIntegration() {
        // Sync initial state
        if (this.musicPlayer && this.tracks.length > 0) {
            this.loadTrack(0, false);
        }
        
        // Override main player functions to sync with iOS player
        this.overrideFunctions();
    }
    
    overrideFunctions() {
        // Store original functions
        const originalTogglePlayPause = window.togglePlayPause;
        const originalNextTrack = window.nextTrack;
        const originalPreviousTrack = window.previousTrack;
        const originalPlayTrack = window.playTrack;
        
        // Override togglePlayPause
        window.togglePlayPause = () => {
            try {
                if (this.iosPlayer && this.iosPlayer.audio) {
                    this.iosPlayer.togglePlayPause();
                } else if (originalTogglePlayPause) {
                    originalTogglePlayPause();
                }
            } catch (error) {
                console.error('🍎 Error in togglePlayPause:', error);
            }
        };
        
        // Override nextTrack
        window.nextTrack = () => {
            try {
                this.nextTrack();
            } catch (error) {
                console.error('🍎 Error in nextTrack:', error);
            }
        };
        
        // Override previousTrack
        window.previousTrack = () => {
            try {
                this.previousTrack();
            } catch (error) {
                console.error('🍎 Error in previousTrack:', error);
            }
        };
        
        // Override playTrack
        window.playTrack = (index) => {
            try {
                this.loadTrack(index, true);
            } catch (error) {
                console.error('🍎 Error in playTrack:', error);
            }
        };
    }
    
    // Helper function to fix audio paths for mobile context
    fixAudioPath(track) {
        // Create a copy of the track with corrected path
        const fixedTrack = { ...track };
        
        // If we're in mobile subdirectory, adjust the path
        if (fixedTrack.src && !fixedTrack.src.startsWith('http') && !fixedTrack.src.startsWith('data:')) {
            // Add ../ prefix if not already there
            if (!fixedTrack.src.startsWith('../')) {
                fixedTrack.src = '../' + fixedTrack.src;
            }
        }
        
        console.log('🍎 Fixed audio path:', fixedTrack.src);
        return fixedTrack;
    }
    
    loadTrack(index, autoPlay = false) {
        if (index < 0 || index >= this.tracks.length) {
            console.warn('🍎 Invalid track index:', index);
            return;
        }
        
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        
        console.log('🍎 Loading track:', track.title);
        
        // Update iOS player
        if (this.iosPlayer) {
            const mobileTrack = this.fixAudioPath(track);
            this.iosPlayer.loadTrack(mobileTrack);
            
            if (autoPlay) {
                // Small delay to ensure track is loaded
                setTimeout(() => {
                    this.iosPlayer.play();
                }, 100);
            }
        }
        
        // Sync main player if available
        if (this.musicPlayer) {
            try {
                this.musicPlayer.loadTrack(index);
                if (autoPlay) {
                    this.musicPlayer.audio.play().catch(e => {
                        console.error('🍎 Main player autoplay error:', e);
                    });
                }
            } catch (error) {
                console.error('🍎 Error syncing main player:', error);
            }
        }
        
        // Update state
        this.updatePlayerStates();
    }
    
    nextTrack() {
        let nextIndex;
        
        if (this.isShuffled) {
            // Random next track
            nextIndex = Math.floor(Math.random() * this.tracks.length);
            // Avoid same track
            if (nextIndex === this.currentTrackIndex && this.tracks.length > 1) {
                nextIndex = (nextIndex + 1) % this.tracks.length;
            }
        } else {
            // Sequential next track
            nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        
        const wasPlaying = this.iosPlayer && !this.iosPlayer.audio.paused;
        this.loadTrack(nextIndex, wasPlaying);
    }
    
    previousTrack() {
        let prevIndex;
        
        if (this.isShuffled) {
            // Random previous track
            prevIndex = Math.floor(Math.random() * this.tracks.length);
            // Avoid same track
            if (prevIndex === this.currentTrackIndex && this.tracks.length > 1) {
                prevIndex = (prevIndex + 1) % this.tracks.length;
            }
        } else {
            // Sequential previous track
            prevIndex = this.currentTrackIndex === 0 
                ? this.tracks.length - 1 
                : this.currentTrackIndex - 1;
        }
        
        const wasPlaying = this.iosPlayer && !this.iosPlayer.audio.paused;
        this.loadTrack(prevIndex, wasPlaying);
    }
    
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        console.log('🍎 Shuffle:', this.isShuffled ? 'ON' : 'OFF');
        
        // Update iOS player state
        if (this.iosPlayer) {
            this.iosPlayer.updateShuffleState(this.isShuffled);
        }
        
        this.updatePlayerStates();
    }
    
    toggleRepeat() {
        // Cycle through repeat modes: none -> all -> one -> none
        switch (this.repeatMode) {
            case 'none':
                this.repeatMode = 'all';
                break;
            case 'all':
                this.repeatMode = 'one';
                break;
            case 'one':
                this.repeatMode = 'none';
                break;
        }
        
        console.log('🍎 Repeat mode:', this.repeatMode);
        
        // Update iOS player state
        if (this.iosPlayer) {
            this.iosPlayer.updateRepeatState(this.repeatMode);
        }
        
        this.updatePlayerStates();
    }
    
    handleTrackEnd() {
        console.log('🍎 Track ended, repeat mode:', this.repeatMode);
        
        switch (this.repeatMode) {
            case 'one':
                // Repeat current track
                if (this.iosPlayer && this.iosPlayer.audio) {
                    this.iosPlayer.audio.currentTime = 0;
                    this.iosPlayer.play();
                }
                break;
            case 'all':
                // Play next track
                this.nextTrack();
                break;
            case 'none':
            default:
                // Stop at end unless shuffle is on
                if (this.isShuffled) {
                    this.nextTrack();
                } else {
                    // Check if this is the last track
                    if (this.currentTrackIndex < this.tracks.length - 1) {
                        this.nextTrack();
                    } else {
                        // End of playlist
                        console.log('🍎 End of playlist reached');
                    }
                }
                break;
        }
    }
    
    updatePlayerStates() {
        // Update both players with current state
        const state = {
            shuffled: this.isShuffled,
            repeat: this.repeatMode,
            currentTrack: this.currentTrackIndex
        };
        
        if (this.iosPlayer && typeof this.iosPlayer.updateShuffleState === 'function') {
            this.iosPlayer.updateShuffleState(this.isShuffled);
            this.iosPlayer.updateRepeatState(this.repeatMode);
        }
        
        console.log('🍎 Player states updated:', state);
    }
    
    // Utility methods
    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex] || null;
    }
    
    getPlaybackState() {
        return {
            currentTrackIndex: this.currentTrackIndex,
            isShuffled: this.isShuffled,
            repeatMode: this.repeatMode,
            isPlaying: this.iosPlayer ? !this.iosPlayer.audio.paused : false
        };
    }
}

// Global bridge instance
let iOSBridge_instance = null;

// Bridge functions
function initBridge() {
    if (!iOSBridge_instance) {
        iOSBridge_instance = new iOSBridge();
        iOSBridge_instance.init();
        
        // Make available globally
        window.iOSBridge = iOSBridge_instance;
        
        // Set up track end handler
        document.addEventListener('DOMContentLoaded', () => {
            const checkAudio = () => {
                if (window.iosPlayer && window.iosPlayer.audio) {
                    window.iosPlayer.audio.addEventListener('ended', () => {
                        iOSBridge_instance.handleTrackEnd();
                    });
                } else {
                    setTimeout(checkAudio, 100);
                }
            };
            checkAudio();
        });
    }
    return iOSBridge_instance;
}

// Global functions for iOS integration
function toggleShuffle() {
    if (iOSBridge_instance) {
        iOSBridge_instance.toggleShuffle();
    }
}

function toggleRepeat() {
    if (iOSBridge_instance) {
        iOSBridge_instance.toggleRepeat();
    }
}

function handleTrackEnd() {
    if (iOSBridge_instance) {
        iOSBridge_instance.handleTrackEnd();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        initBridge();
    }, 500);
});

// Export for global access
window.toggleShuffle = toggleShuffle;
window.toggleRepeat = toggleRepeat;
window.handleTrackEnd = handleTrackEnd;
window.initBridge = initBridge;
