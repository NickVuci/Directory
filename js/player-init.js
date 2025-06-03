/**
 * Audio Player Initialization
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize player on all pages as a persistent footer player
    initializeAudioPlayer();
});

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
    footer.appendChild(playerContainer);
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
}

/* Playlist functionality removed */
