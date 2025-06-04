/**
 * Audio Player Initialization
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if iOS player has already initialized or should initialize
    setTimeout(() => {
        if (!shouldUseIOSPlayer()) {
            console.log('🎵 Non-iOS device or iOS player not active, initializing original player');
            initializeAudioPlayer();
        } else {
            console.log('🎵 iOS player should be active, skipping original player initialization');
        }
    }, 150); // Slightly longer delay to ensure iOS detection is complete
    
    // Backup mechanism: if no player is found after 3 seconds, force original player
    setTimeout(() => {
        const hasAnyPlayer = document.querySelector('audio') || 
                           document.querySelector('.ios-music-player') || 
                           document.querySelector('.audio-player') ||
                           window.audioPlayer;
        
        if (!hasAnyPlayer) {
            console.warn('🎵 No player detected after 3 seconds, forcing original player initialization');
            initializeAudioPlayer();
        }
    }, 3000);
});

/**
 * Determine if iOS player should be used
 */
function shouldUseIOSPlayer() {
    // Check if iOS player is explicitly forced
    const forceIOS = localStorage.getItem('forceIOSPlayer') === 'true' || 
                     window.location.hash.includes('ios') ||
                     window.location.search.includes('ios=true');
    
    if (forceIOS) {
        console.log('🎵 iOS player forced via settings');
        return true;
    }
    
    // Check if we're actually on an iOS device
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (!isIOS) {
        console.log('🎵 Not an iOS device, using original player');
        return false;
    }
    
    // Check if iOS player is already active
    const isIOSPlayerActive = document.body.classList.contains('ios-mode') || 
                             document.querySelector('.ios-music-player') !== null ||
                             (window.iosPlayerInit && window.iosPlayerInit.isPlayerReady && window.iosPlayerInit.isPlayerReady());
    
    console.log('🎵 iOS player active check:', isIOSPlayerActive);
    return isIOSPlayerActive;
}

/**
 * Check if iOS player is active (legacy function for backwards compatibility)
 */
function isIOSPlayerActive() {
    return shouldUseIOSPlayer();
}

/**
 * Select and load a random track
 * @param {Object} player - The audio player instance
 */
function selectRandomTrack(player) {
    // Check if tracks are available
    if (player.tracks && player.tracks.length > 0) {
        // Generate a random index
        const randomIndex = Math.floor(Math.random() * player.tracks.length);
        
        // Load the random track
        player.loadTrack(randomIndex);
        
        console.log(`Random track selected: ${player.tracks[randomIndex].title}`);
    } else {
        console.warn('No tracks available for random selection');
    }
}

/**
 * Initialize the audio player
 */
function initializeAudioPlayer() {
    console.log('🎵 Initializing original audio player...');
    
    // Find the footer to replace
    const footer = document.querySelector('.footer');
    
    if (!footer) {
        console.error('🎵 No footer found to replace with audio player');
        return;
    }
    
    try {
        // Create player container
        const playerContainer = document.createElement('div');
        playerContainer.id = 'audio-player-container';
        playerContainer.className = 'footer-player';

        // Clear footer and add container
        footer.innerHTML = '';
        footer.appendChild(playerContainer);
        
        // Check if AudioPlayerCore is available
        if (typeof AudioPlayerCore === 'undefined') {
            console.error('🎵 AudioPlayerCore not found, cannot initialize player');
            createFallbackPlayer(playerContainer);
            return;
        }

        // Create and initialize player
        const player = new AudioPlayerCore();
        player.init(playerContainer);
        
        // Create copyright container and append AFTER player initialization
        const copyrightContainer = document.createElement('div');
        copyrightContainer.className = 'copyright';
        copyrightContainer.innerHTML = `<p>&copy; ${new Date().getFullYear()} Nick Vuci. All rights reserved.</p>`;
        playerContainer.appendChild(copyrightContainer);
        
        // Add player to window for global access
        window.audioPlayer = player;
        
        // Select a random track on initialization if tracks are available
        selectRandomTrack(player);
        
        console.log('🎵 Original audio player initialized successfully');
        
    } catch (error) {
        console.error('🎵 Audio player initialization failed:', error);
        createFallbackPlayer(footer);
    }
}

/**
 * Create a basic fallback player when the main player fails
 */
function createFallbackPlayer(container) {
    console.log('🎵 Creating fallback player...');
    
    container.innerHTML = `
        <div class="basic-audio-player">
            <div class="basic-player-content">
                <h3>Audio Player</h3>
                <p>There was an issue loading the audio player.</p>
                <p>Please refresh the page to try again.</p>
                <button onclick="location.reload()" class="btn-unified">Refresh Page</button>
            </div>
        </div>
        <div class="copyright">
            <p>&copy; ${new Date().getFullYear()} Nick Vuci. All rights reserved.</p>
        </div>
    `;
    
    // Add basic styling
    const style = document.createElement('style');
    style.textContent = `
        .basic-audio-player {
            padding: var(--spacing-xl);
            text-align: center;
            background: var(--dark-bg);
            border-top: 1px solid var(--border-accent);
            color: var(--text-light);
        }
        .basic-player-content h3 {
            color: var(--primary-gold);
            margin-bottom: var(--spacing-md);
        }
        .basic-player-content p {
            color: var(--text-secondary);
            margin: var(--spacing-sm) 0;
        }
    `;
    document.head.appendChild(style);
}

/* Playlist functionality removed */
