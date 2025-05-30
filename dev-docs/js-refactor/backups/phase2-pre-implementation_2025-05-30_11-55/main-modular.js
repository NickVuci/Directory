/**
 * Main Application Entry Point - Modular Version
 * 
 * This file initializes the music player and provides bridge functions
 * for HTML event handlers. This is the modular version that works with
 * ES6 modules while maintaining compatibility with existing HTML.
 * 
 * @author Nick Vuci
 * @version 1.0.0 (Modular)
 * @date May 30, 2025
 */

// Import the modular music player (will be handled by the browser's module system)
let musicPlayer;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Initializing Modular Music Player...');
    
    try {
        // Initialize the music player
        musicPlayer = new MusicPlayer();
        console.log('✅ Modular Music Player initialized successfully');
        
        // Add visual indicator that modular version is running
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        indicator.textContent = 'MODULAR v1.0';
        document.body.appendChild(indicator);
        
        // Auto-hide indicator after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transition = 'opacity 0.5s';
            setTimeout(() => indicator.remove(), 500);
        }, 3000);
        
    } catch (error) {
        console.error('❌ Failed to initialize Modular Music Player:', error);
        
        // Show error indicator
        const errorIndicator = document.createElement('div');
        errorIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #f44336;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorIndicator.textContent = 'MODULE ERROR';
        document.body.appendChild(errorIndicator);
    }
});

// Bridge functions for HTML event handlers
// These functions maintain compatibility with existing onclick attributes

/**
 * Toggle the music player collapsed/expanded state
 */
function togglePlayer() {
    if (musicPlayer) {
        musicPlayer.togglePlayer();
    }
}

/**
 * Toggle play/pause functionality
 */
function togglePlayPause() {
    if (musicPlayer) {
        if (musicPlayer.audio.paused) {
            musicPlayer.audio.play().catch(e => {
                console.error('Play error:', e);
            });
            musicPlayer.playPauseBtn.textContent = '⏸';
            musicPlayer.isPlaying = true;
            // Add playing state visual feedback to mobile slider
            if (musicPlayer.mobileProgressBar) {
                musicPlayer.mobileProgressBar.classList.add('playing');
            }
            // Update mobile thumb icon
            musicPlayer.updateMobileThumbIcon();
        } else {
            musicPlayer.audio.pause();
            musicPlayer.playPauseBtn.textContent = '▶';
            musicPlayer.isPlaying = false;
            // Remove playing state visual feedback
            if (musicPlayer.mobileProgressBar) {
                musicPlayer.mobileProgressBar.classList.remove('playing');
            }
            // Update mobile thumb icon
            musicPlayer.updateMobileThumbIcon();
        }
    }
}

/**
 * Navigate to next track
 */
function nextTrack() {
    if (musicPlayer) {
        musicPlayer.nextTrack();
    }
}

/**
 * Navigate to previous track
 */
function previousTrack() {
    if (musicPlayer) {
        musicPlayer.previousTrack();
    }
}

/**
 * Seek to specific position in track
 * @param {number} value - Position to seek to
 */
function seekTo(value) {
    if (musicPlayer) {
        musicPlayer.audio.currentTime = value;
    }
}

/**
 * Set audio volume
 * @param {number} value - Volume level (0-100)
 */
function setVolume(value) {
    if (musicPlayer) {
        musicPlayer.audio.volume = value / 100;
    }
}

/**
 * Play specific track from music library
 * @param {number} index - Track index to play
 */
function playTrack(index) {
    if (musicPlayer) {
        musicPlayer.loadTrack(index);
        musicPlayer.audio.play().catch(e => {
            console.error('Play error:', e);
        });
        musicPlayer.playPauseBtn.textContent = '⏸';
        musicPlayer.isPlaying = true;
        
        // Expand player if collapsed
        if (musicPlayer.isCollapsed) {
            togglePlayer();
        }
    }
}

// Make functions globally available for HTML onclick handlers
window.togglePlayer = togglePlayer;
window.togglePlayPause = togglePlayPause;
window.nextTrack = nextTrack;
window.previousTrack = previousTrack;
window.seekTo = seekTo;
window.setVolume = setVolume;
window.playTrack = playTrack;

// Export for potential future module usage
export {
    togglePlayer,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    playTrack
};
