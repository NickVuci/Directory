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
    
    // Create copyright container
    const copyrightContainer = document.createElement('div');
    copyrightContainer.className = 'copyright';
    copyrightContainer.innerHTML = `<p>&copy; ${new Date().getFullYear()} Nick Vuci. All rights reserved.</p>`;
    
    // Replace footer content
    footer.innerHTML = '';
    footer.appendChild(playerContainer);
    footer.appendChild(copyrightContainer);
    
    // Create and initialize player
    const player = new AudioPlayerCore();
    player.init(playerContainer);
    
    // Add player to window for global access
    window.audioPlayer = player;
    
    // Add playlist button to toggle playlist visibility
    addPlaylistToggle(player, footer);
}

/**
 * Add playlist toggle functionality
 */
function addPlaylistToggle(player, footer) {
    // Create playlist toggle button
    const playlistToggleBtn = document.createElement('button');
    playlistToggleBtn.className = 'playlist-toggle-btn';
    playlistToggleBtn.innerHTML = '▲ Playlist';
    playlistToggleBtn.setAttribute('aria-label', 'Toggle playlist');
    
    // Create playlist container
    const playlistContainer = document.createElement('div');
    playlistContainer.className = 'playlist-container';
    playlistContainer.style.display = 'none'; // Hidden by default
    
    // Create playlist heading
    const playlistHeading = document.createElement('h3');
    playlistHeading.className = 'playlist-heading';
    playlistHeading.textContent = 'Tracks';
    
    // Create close button for playlist
    const closeBtn = document.createElement('button');
    closeBtn.className = 'playlist-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close playlist');
    
    // Create header container
    const headerContainer = document.createElement('div');
    headerContainer.className = 'playlist-header';
    headerContainer.appendChild(playlistHeading);
    headerContainer.appendChild(closeBtn);
    
    playlistContainer.appendChild(headerContainer);
    
    // Create playlist items
    const playlistItems = document.createElement('div');
    playlistItems.className = 'playlist-items';
    
    // Add track items
    player.tracks.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        trackItem.dataset.index = index;
        
        trackItem.innerHTML = `
            <div class="track-item-info">
                <div class="track-item-title">${track.title}</div>
                <div class="track-item-details">${track.tuning}</div>
            </div>
        `;
        
        // Add click event
        trackItem.addEventListener('click', () => {
            player.loadTrack(index);
            player.togglePlay();
            
            // Update active state
            document.querySelectorAll('.track-item').forEach(item => {
                item.classList.remove('active');
            });
            trackItem.classList.add('active');
        });
        
        playlistItems.appendChild(trackItem);
    });
    
    playlistContainer.appendChild(playlistItems);
    
    // Insert playlist into document
    document.body.appendChild(playlistContainer);
    
    // Add toggle button to footer
    footer.appendChild(playlistToggleBtn);
    
    // Add toggle functionality
    playlistToggleBtn.addEventListener('click', () => {
        const isHidden = playlistContainer.style.display === 'none';
        playlistContainer.style.display = isHidden ? 'block' : 'none';
        playlistToggleBtn.innerHTML = isHidden ? '▼ Playlist' : '▲ Playlist';
        
        // Add active class to toggle button when playlist is visible
        if (isHidden) {
            playlistToggleBtn.classList.add('active');
            // Ensure the currently playing track is visible
            if (player.currentTrackIndex !== undefined) {
                const activeTrack = playlistContainer.querySelector(`.track-item[data-index="${player.currentTrackIndex}"]`);
                if (activeTrack) {
                    activeTrack.classList.add('active');
                    activeTrack.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } else {
            playlistToggleBtn.classList.remove('active');
        }
    });
    
    // Add close button functionality
    closeBtn.addEventListener('click', () => {
        playlistContainer.style.display = 'none';
        playlistToggleBtn.innerHTML = '▲ Playlist';
        playlistToggleBtn.classList.remove('active');
    });
    
    // Close playlist when clicking outside
    document.addEventListener('click', (event) => {
        if (
            playlistContainer.style.display === 'block' &&
            !playlistContainer.contains(event.target) &&
            !playlistToggleBtn.contains(event.target)
        ) {
            playlistContainer.style.display = 'none';
            playlistToggleBtn.innerHTML = '▲ Playlist';
            playlistToggleBtn.classList.remove('active');
        }
    });
}
