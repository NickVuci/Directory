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
    
    // Select a random track on initialization if tracks are available
    selectRandomTrack(player);
}