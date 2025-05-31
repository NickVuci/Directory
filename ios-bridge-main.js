/**
 * iOS Mobile Player Bridge - Main Site Version
 * Connects main site functions with iOS-specific player on same page
 */

class iOSBridge {
    constructor() {
        this.musicPlayer = null;
        this.iosPlayer = null;
        this.currentTrackIndex = 0;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'all', 'one'
        this.tracks = window.TRACKS || [];
        
        console.log('🍎 iOS Bridge (Main Site) initialized with', this.tracks.length, 'tracks');
    }
    
    async init() {
        // Wait for both players to be ready
        await this.waitForPlayers();
        this.setupIntegration();
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
        const originalLoadTrack = window.loadTrack;
        const originalTogglePlayPause = window.togglePlayPause;
        const originalNextTrack = window.nextTrack;
        const originalPreviousTrack = window.previousTrack;
        const originalToggleShuffle = window.toggleShuffle;
        const originalToggleRepeat = window.toggleRepeat;
        const originalSeekTo = window.seekTo;
        const originalSetVolume = window.setVolume;
        
        // Override loadTrack
        window.loadTrack = (index, autoplay = false) => {
            console.log('🍎 Bridge: loadTrack called', index, autoplay);
            if (originalLoadTrack) {
                originalLoadTrack(index, autoplay);
            }
            this.loadTrack(index, autoplay);
        };
        
        // Override togglePlayPause
        window.togglePlayPause = () => {
            console.log('🍎 Bridge: togglePlayPause called');
            if (originalTogglePlayPause) {
                originalTogglePlayPause();
            }
            this.iosPlayer.togglePlayback();
        };
        
        // Override nextTrack
        window.nextTrack = () => {
            console.log('🍎 Bridge: nextTrack called');
            if (originalNextTrack) {
                originalNextTrack();
            }
            // Don't call iosPlayer.nextTrack() to avoid double execution
        };
        
        // Override previousTrack
        window.previousTrack = () => {
            console.log('🍎 Bridge: previousTrack called');
            if (originalPreviousTrack) {
                originalPreviousTrack();
            }
            // Don't call iosPlayer.previousTrack() to avoid double execution
        };
        
        // Override toggleShuffle
        window.toggleShuffle = () => {
            console.log('🍎 Bridge: toggleShuffle called');
            if (originalToggleShuffle) {
                originalToggleShuffle();
            }
            this.iosPlayer.updateShuffleState();
        };
        
        // Override toggleRepeat
        window.toggleRepeat = () => {
            console.log('🍎 Bridge: toggleRepeat called');
            if (originalToggleRepeat) {
                originalToggleRepeat();
            }
            this.iosPlayer.updateRepeatState();
        };
        
        // Override seekTo
        window.seekTo = (percentage) => {
            console.log('🍎 Bridge: seekTo called', percentage);
            if (originalSeekTo) {
                originalSeekTo(percentage);
            }
            this.iosPlayer.seekTo(percentage);
        };
        
        // Override setVolume
        window.setVolume = (volume) => {
            console.log('🍎 Bridge: setVolume called', volume);
            if (originalSetVolume) {
                originalSetVolume(volume);
            }
            this.iosPlayer.setVolume(volume);
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
        
        // Wait a bit for all scripts to load
        setTimeout(() => {
            const bridge = new iOSBridge();
            bridge.init().then(() => {
                console.log('🍎 iOS Bridge integration complete');
                bridge.syncState();
            }).catch(error => {
                console.error('🍎 iOS Bridge initialization failed:', error);
            });
        }, 500);
    }
});
