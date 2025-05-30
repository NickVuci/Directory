/**
 * iOS Player Integration Bridge
 * Connects the main site's music system with the iOS player
 */

class iOSIntegration {
    constructor() {
        this.currentTrackIndex = 0;
        this.tracks = [];
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.isInitialized = false;
        
        console.log('📱 iOS Integration initialized');
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Wait for tracks to be loaded
        if (window.TRACKS && window.TRACKS.length > 0) {
            this.tracks = window.TRACKS;
            this.loadFirstTrack();
            this.isInitialized = true;
            console.log('📱 Integration ready with', this.tracks.length, 'tracks');
        } else {
            // Retry in 100ms if tracks not loaded yet
            setTimeout(() => this.init(), 100);
        }
    }
    
    loadFirstTrack() {
        if (this.tracks.length > 0 && window.iosPlayer) {
            this.loadTrack(0);
        }
    }
    
    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length && window.iosPlayer) {
            this.currentTrackIndex = index;
            const track = this.tracks[index];
            
            console.log('📱 Loading track:', track.title);
            
            // Convert track format for iOS player
            const iOSTrackData = {
                title: track.title,
                artist: track.artist,
                src: track.src,
                artwork: track.artwork || '', // Add default artwork if needed
                tuning: track.tuning,
                genre: track.genre,
                year: track.year,
                description: track.description
            };
            
            window.iosPlayer.loadTrack(iOSTrackData);
        }
    }
    
    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex] || null;
    }
}

// Global integration instance
let iOSIntegration_instance;

// Bridge functions for main site compatibility
function togglePlayPause() {
    if (window.iosPlayer) {
        window.iosPlayer.togglePlayPause();
    }
}

function nextTrack() {
    if (!iOSIntegration_instance) return;
    
    let nextIndex;
    
    if (iOSIntegration_instance.isShuffled) {
        // Simple shuffle: random track (excluding current)
        do {
            nextIndex = Math.floor(Math.random() * iOSIntegration_instance.tracks.length);
        } while (nextIndex === iOSIntegration_instance.currentTrackIndex && iOSIntegration_instance.tracks.length > 1);
    } else {
        // Normal order
        nextIndex = (iOSIntegration_instance.currentTrackIndex + 1) % iOSIntegration_instance.tracks.length;
    }
    
    iOSIntegration_instance.loadTrack(nextIndex);
    
    // Auto-play if something was playing
    if (window.iosPlayer && window.iosPlayer.isPlaying) {
        setTimeout(() => {
            window.iosPlayer.play();
        }, 100);
    }
}

function previousTrack() {
    if (!iOSIntegration_instance) return;
    
    let prevIndex;
    
    if (iOSIntegration_instance.isShuffled) {
        // Simple shuffle: random track (excluding current)
        do {
            prevIndex = Math.floor(Math.random() * iOSIntegration_instance.tracks.length);
        } while (prevIndex === iOSIntegration_instance.currentTrackIndex && iOSIntegration_instance.tracks.length > 1);
    } else {
        // Normal order
        prevIndex = iOSIntegration_instance.currentTrackIndex === 0 
            ? iOSIntegration_instance.tracks.length - 1 
            : iOSIntegration_instance.currentTrackIndex - 1;
    }
    
    iOSIntegration_instance.loadTrack(prevIndex);
    
    // Auto-play if something was playing
    if (window.iosPlayer && window.iosPlayer.isPlaying) {
        setTimeout(() => {
            window.iosPlayer.play();
        }, 100);
    }
}

function playTrack(index) {
    if (iOSIntegration_instance && index >= 0 && index < iOSIntegration_instance.tracks.length) {
        iOSIntegration_instance.loadTrack(index);
        
        // Start playing and expand player
        if (window.iosPlayer) {
            setTimeout(() => {
                window.iosPlayer.play();
                window.iosPlayer.expand();
            }, 100);
        }
    }
}

function seekTo(value) {
    if (window.iosPlayer && window.iosPlayer.audio) {
        window.iosPlayer.audio.currentTime = value;
    }
}

function setVolume(value) {
    if (window.iosPlayer) {
        window.iosPlayer.setVolume(value);
    }
}

// Shuffle and repeat controls
function toggleShuffle() {
    if (!iOSIntegration_instance) return;
    
    iOSIntegration_instance.isShuffled = !iOSIntegration_instance.isShuffled;
    
    if (window.iosPlayer) {
        window.iosPlayer.updateShuffleState(iOSIntegration_instance.isShuffled);
    }
    
    console.log('📱 Shuffle:', iOSIntegration_instance.isShuffled ? 'ON' : 'OFF');
}

function toggleRepeat() {
    if (!iOSIntegration_instance) return;
    
    // Cycle through repeat modes: none -> all -> one -> none
    switch (iOSIntegration_instance.repeatMode) {
        case 'none':
            iOSIntegration_instance.repeatMode = 'all';
            break;
        case 'all':
            iOSIntegration_instance.repeatMode = 'one';
            break;
        case 'one':
            iOSIntegration_instance.repeatMode = 'none';
            break;
    }
    
    if (window.iosPlayer) {
        window.iosPlayer.updateRepeatState(iOSIntegration_instance.repeatMode);
    }
    
    console.log('📱 Repeat mode:', iOSIntegration_instance.repeatMode);
}

// Handle track end based on repeat mode
function handleTrackEnd() {
    if (!iOSIntegration_instance) return;
    
    switch (iOSIntegration_instance.repeatMode) {
        case 'one':
            // Repeat current track
            if (window.iosPlayer && window.iosPlayer.audio) {
                window.iosPlayer.audio.currentTime = 0;
                window.iosPlayer.play();
            }
            break;
        case 'all':
        case 'none':
        default:
            // Go to next track
            nextTrack();
            break;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    iOSIntegration_instance = new iOSIntegration();
    window.iOSIntegration = iOSIntegration_instance;
    
    // Wait for iOS player to be ready
    const initWhenReady = () => {
        if (window.iosPlayer) {
            iOSIntegration_instance.init();
            
            // Set up track end handler
            if (window.iosPlayer.audio) {
                window.iosPlayer.audio.addEventListener('ended', handleTrackEnd);
            }
        } else {
            setTimeout(initWhenReady, 100);
        }
    };
    
    initWhenReady();
});

// Export for global access
window.toggleShuffle = toggleShuffle;
window.toggleRepeat = toggleRepeat;
