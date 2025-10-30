/**
 * Audio Player Initialization
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize player on all pages as a persistent footer player
    initializeAudioPlayer();
});

/**
 * Select and load a random track
 * @param {Object} player - The audio player instance
 */
// since loadTrack will handle it
function selectRandomTrack(player) {
    if (player && player.tracks && player.tracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * player.tracks.length);
        player.loadTrack(randomIndex);
        // URL will be updated automatically by loadTrack method
        console.log(`Random track selected: ${player.tracks[randomIndex].title}`);
    }
}

/**
 * Initialize the audio player
 */
function initializeAudioPlayer() {
    console.log('Initializing audio player...');
    
    // Find the footer to replace
    const footer = document.querySelector('.footer');
    
    if (!footer) {
        console.error('No footer found to replace with audio player');
        return;
    }
      // Create player container
    const playerContainer = document.createElement('div');
    playerContainer.id = 'audio-player-container';
    playerContainer.className = 'footer-player';

    // Replace footer content
    footer.innerHTML = '';
    footer.appendChild(playerContainer);    // Create and initialize player
    const player = new AudioPlayerCore();
    player.init(playerContainer);
    
    // Create copyright container and append AFTER player initialization
    const copyrightContainer = document.createElement('div');
    copyrightContainer.className = 'copyright';
    copyrightContainer.innerHTML = `<p>&copy; ${new Date().getFullYear()} Nick Vuci. All rights reserved.</p>`;
    playerContainer.appendChild(copyrightContainer);    // Add player to window for global access
    window.audioPlayer = player;
    window.globalPlayer = player;  // Alternative reference for main.js
    
    // Initialize playlist UI after a short delay to ensure player is ready
    setTimeout(() => {
        initializePlaylistUI();
    }, 100);
    
    // Select a random track on initialization if tracks are available
    selectRandomTrack(player);
}

/**
 * Initialize the playlist UI system
 */
function initializePlaylistUI() {
    console.log('Initializing playlist UI...');
            // Allow disabling via feature flag to avoid endless retries when scripts are commented out
        if (window.DISABLE_PLAYLIST_UI === true) {
                console.info('Playlist UI disabled by flag.');
                return;
        }
            // Check if all required playlist components are loaded
    if (!window.PlaylistData || 
        !window.PlaylistEngine || 
        !window.PlaylistVirtualScroll || 
        !window.PlaylistStorage ||
        !window.PlaylistUI) {
                // Limit retries to avoid spamming logs if scripts are disabled
                window.__playlistInitRetries = (window.__playlistInitRetries || 0) + 1;
                if (window.__playlistInitRetries <= 15) { // ~3 seconds total
                        console.warn('Playlist components not yet loaded, retrying...');
                        setTimeout(initializePlaylistUI, 200);
                } else {
                        console.info('Playlist components not available. Skipping playlist UI init.');
                }
        return;
    }
    
    try {
        // Create and initialize playlist UI
        window.playlistUI = new PlaylistUI();
        console.log('Playlist UI initialized successfully');
        
        // Setup playlist events for the audio player
        setupPlaylistPlayerIntegration();
        
    } catch (error) {
        console.error('Failed to initialize playlist UI:', error);
    }
}

/**
 * Setup integration between playlist and audio player
 */
function setupPlaylistPlayerIntegration() {
    const player = window.audioPlayer;
    if (!player) return;
    
    // Listen for playlist events
    document.addEventListener('playlist:playTrack', (event) => {
        const { track, index, playlist } = event.detail;
        
        // Load track into player
        if (track.file) {
            // Assuming the player has a method to load by file path
            // This will need to be adapted based on the actual player API
            console.log('Loading track from playlist:', track.title);
            
            // Find track index in player's track array
            const playerTrackIndex = player.tracks.findIndex(t => t.file === track.file);
            if (playerTrackIndex !== -1) {
                player.loadTrack(playerTrackIndex);
            }
        }
    });
    
    document.addEventListener('playlist:playAll', (event) => {
        const { tracks, shuffle } = event.detail;
        
        if (tracks.length > 0) {
            // Load first track and create queue
            console.log(`Playing ${tracks.length} tracks${shuffle ? ' (shuffled)' : ''}`);
            
            let tracksToPlay = [...tracks];
            if (shuffle) {
                tracksToPlay = shuffleArray(tracksToPlay);
            }
            
            // Load first track
            const firstTrack = tracksToPlay[0];
            const playerTrackIndex = player.tracks.findIndex(t => t.file === firstTrack.file);
            if (playerTrackIndex !== -1) {
                player.loadTrack(playerTrackIndex);
                // TODO: Set up queue with remaining tracks
            }
        }
    });
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/* Playlist functionality removed */
