/**
 * iOS Mobile Player Bridge - Main Site Version
 * Provides iOS-only functionality and completely disables original players
 * Only loads on iOS devices detected in index.html
 */

class iOSBridge {
    constructor() {
        this.iosPlayer = null;
        this.currentTrackIndex = 0;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
        this.tracks = window.TRACKS || [];
        
        console.log('🍎 iOS Bridge initialized with', this.tracks.length, 'tracks');
    }
    
    async init() {
        // Wait for iOS player to be ready
        await this.waitForIOSPlayer();
        this.setupIOSOnlyFunctions();
        this.enforcePlayerVisibility();
    }
    
    async waitForIOSPlayer() {
        // Wait for iOS player to be available
        while (!window.iosPlayer) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.iosPlayer = window.iosPlayer;
        console.log('🍎 iOS Player ready');
    }
    
    setupIOSOnlyFunctions() {
        console.log('🍎 Setting up iOS-only global functions');
        const originalPreviousTrack = window.previousTrack;
        const originalToggleShuffle = window.toggleShuffle;
        const originalToggleRepeat = window.toggleRepeat;
        const originalSeekTo = window.seekTo;
        const originalSetVolume = window.setVolume;
        
        console.log('🍎 Bridge: Overriding global functions for iOS-only operation');
        
        // Override loadTrack - iOS only, no original calls
        window.loadTrack = (index, autoplay = false) => {
            console.log('🍎 Bridge: loadTrack called (iOS only)', index, autoplay);
            this.loadTrack(index, autoplay);
        };
        
        // Override togglePlayPause - iOS only
        window.togglePlayPause = () => {
            console.log('🍎 Bridge: togglePlayPause called (iOS only)');
            if (this.iosPlayer) {
                this.iosPlayer.togglePlayback();
            }
        };
        
        // Override nextTrack - iOS only
        window.nextTrack = () => {
            console.log('🍎 Bridge: nextTrack called (iOS only)');
            if (this.iosPlayer) {
                this.iosPlayer.nextTrack();
            }
        };
        
        // Override previousTrack - iOS only
        window.previousTrack = () => {
            console.log('🍎 Bridge: previousTrack called (iOS only)');
            if (this.iosPlayer) {
                this.iosPlayer.previousTrack();
            }
        };
        
        // Override toggleShuffle - iOS only
        window.toggleShuffle = () => {
            console.log('🍎 Bridge: toggleShuffle called (iOS only)');
            if (this.iosPlayer) {
                this.iosPlayer.toggleShuffle();
            }
        };
        
        // Override toggleRepeat - iOS only
        window.toggleRepeat = () => {
            console.log('🍎 Bridge: toggleRepeat called (iOS only)');
            if (this.iosPlayer) {
                this.iosPlayer.toggleRepeat();
            }
        };
        
        // Override seekTo - iOS only
        window.seekTo = (percentage) => {
            console.log('🍎 Bridge: seekTo called (iOS only)', percentage);
            if (this.iosPlayer) {
                this.iosPlayer.seekTo(percentage);
            }
        };
        
        // Override setVolume - iOS only
        window.setVolume = (volume) => {
            console.log('🍎 Bridge: setVolume called (iOS only)', volume);
            if (this.iosPlayer) {
                this.iosPlayer.setVolume(volume);
            }
        };
          // Override playTrack - iOS only
        window.playTrack = (index) => {
            console.log('🍎 Bridge: playTrack called (iOS only)', index);
            this.loadTrack(index, true);
        };
    }
    
    loadTrack(index, autoplay = false) {
        if (!this.tracks || index < 0 || index >= this.tracks.length) {
            console.warn('🍎 Bridge: Invalid track index', index);
            return;
        }
        
        const track = this.tracks[index];
        this.currentTrackIndex = index;
        
        console.log('🍎 Bridge: Loading track', track.title);
        
        // Load track in iOS player (no path modification needed - we're on main site)
        this.iosPlayer.loadTrack(track, autoplay);
        
        // Update global state
        window.currentTrackIndex = index;
    }
    
    // Sync state from main player to iOS player
    syncState() {
        if (!this.musicPlayer || !this.iosPlayer) return;
        
        // Sync shuffle state
        this.isShuffled = window.isShuffled || false;
        this.iosPlayer.updateShuffleState();
        
        // Sync repeat state
        this.repeatMode = window.repeatMode || 'none';
        this.iosPlayer.updateRepeatState();
        
        console.log('🍎 Bridge: State synced - shuffle:', this.isShuffled, 'repeat:', this.repeatMode);
    }
    
    // Handle track end events
    onTrackEnd() {
        console.log('🍎 Bridge: Track ended, repeat mode:', this.repeatMode);
        
        if (this.repeatMode === 'one') {
            // Repeat current track
            this.loadTrack(this.currentTrackIndex, true);
        } else if (this.repeatMode === 'all' || this.repeatMode === 'none') {
            // Move to next track (or stop if repeat is off and at end)
            const nextIndex = this.getNextTrackIndex();
            if (nextIndex !== -1) {
                this.loadTrack(nextIndex, true);
            }
        }
    }
    
    getNextTrackIndex() {
        if (this.isShuffled) {
            // Random track (but not current)
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.tracks.length);
            } while (randomIndex === this.currentTrackIndex && this.tracks.length > 1);
            return randomIndex;
        } else {
            // Next track in order
            const nextIndex = this.currentTrackIndex + 1;
            if (nextIndex < this.tracks.length) {
                return nextIndex;
            } else if (this.repeatMode === 'all') {
                return 0; // Loop back to first track
            } else {
                return -1; // End of playlist
            }
        }
    }
    
    getPreviousTrackIndex() {
        if (this.isShuffled) {
            // Random track (but not current)
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.tracks.length);
            } while (randomIndex === this.currentTrackIndex && this.tracks.length > 1);
            return randomIndex;
        } else {
            // Previous track in order
            const prevIndex = this.currentTrackIndex - 1;
            if (prevIndex >= 0) {
                return prevIndex;
            } else if (this.repeatMode === 'all') {
                return this.tracks.length - 1; // Loop to last track
            } else {
                return 0; // Stay at first track
            }
        }
    }
}

// Initialize iOS Bridge when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.isIOSDevice) {
        console.log('🍎 Initializing iOS Bridge for main site');
        
        // Ensure proper player visibility on orientation change
        const ensurePlayerVisibility = () => {
            const desktopPlayer = document.getElementById('musicPlayer');
            const mobilePlayer = document.getElementById('mobileMusicPlayer');
            const iosPlayer = document.getElementById('iosPlayer');
            
            if (desktopPlayer) {
                desktopPlayer.style.display = 'none';
                desktopPlayer.style.visibility = 'hidden';
            }
            if (mobilePlayer) {
                mobilePlayer.style.display = 'none';
                mobilePlayer.style.visibility = 'hidden';
            }
            if (iosPlayer) {
                iosPlayer.style.display = 'block';
                iosPlayer.style.visibility = 'visible';
            }
            
            console.log('🍎 Player visibility enforced - orientation:', screen.orientation?.angle || 'unknown');
        };
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(ensurePlayerVisibility, 100); // Small delay for orientation to settle
        });
        
        // Listen for resize events (fallback for orientation changes)
        window.addEventListener('resize', () => {
            setTimeout(ensurePlayerVisibility, 50);
        });
        
        // Initial visibility enforcement
        ensurePlayerVisibility();
        
        // Wait a bit for all scripts to load
        setTimeout(() => {
            const bridge = new iOSBridge();
            bridge.init().then(() => {
                console.log('🍎 iOS Bridge integration complete');
                bridge.syncState();
                // Ensure visibility again after bridge initialization
                ensurePlayerVisibility();
            }).catch(error => {
                console.error('🍎 iOS Bridge initialization failed:', error);
            });
        }, 500);
    }
});
