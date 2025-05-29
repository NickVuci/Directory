// Page Navigation Functionality
let currentContent = 'content1';  // Track which container is currently active

function showContent(section) {
    // Update the active button state immediately
    updateActiveButton(section);

    const oldContent = document.getElementById(currentContent);
    const newContent = document.getElementById(currentContent === 'content1' ? 'content2' : 'content1');

    // Start fade-out on the old content
    oldContent.classList.remove('fade-in');
    oldContent.classList.add('fade-out');

    // Load the new content after fade-out completes
    setTimeout(() => {
        // Fetch the new content and insert it into the hidden container
        fetch(`${section}.html`)
            .then(response => response.text())
            .then(data => {
                newContent.innerHTML = data;
                newContent.style.display = 'block';
                
                // Start fade-in on the new content
                newContent.classList.remove('fade-out');
                newContent.classList.add('fade-in');
                
                // Hide the old content after fade-out
                oldContent.style.display = 'none';
                
                // Update the active container
                currentContent = currentContent === 'content1' ? 'content2' : 'content1';
            });
    }, 500);  // Timeout matches the faster fade-out duration (0.5s)
}

function updateActiveButton(section) {
    // Remove the 'active' class from all buttons
    const buttons = document.querySelectorAll('.nav-buttons button');
    buttons.forEach(button => button.classList.remove('active'));

    // Add the 'active' class to the currently selected button
    const activeButton = document.querySelector(`.nav-buttons button[onclick="showContent('${section}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Global music player instance
let musicPlayer;

// Music player control functions (bridge functions for HTML onclick attributes)
function togglePlayer() {
    const player = document.getElementById('musicPlayer');
    player.classList.toggle('collapsed');
    musicPlayer.isCollapsed = !musicPlayer.isCollapsed;
}

function togglePlayPause() {
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

function nextTrack() {
    if (musicPlayer) {
        musicPlayer.nextTrack();
    }
}

function previousTrack() {
    if (musicPlayer) {
        musicPlayer.previousTrack();
    }
}

function seekTo(value) {
    musicPlayer.audio.currentTime = value;
}

function setVolume(value) {
    musicPlayer.audio.volume = value / 100;
}

// Function to play specific track from music library
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

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    showContent('about');
    // Initialize music player
    musicPlayer = new MusicPlayer();
});
