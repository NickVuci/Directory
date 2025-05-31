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
// Note: These functions will be overridden by iOS bridge on iOS devices

function togglePlayPause() {
    // Skip if on iOS device - handled by iOS player
    if (window.isIOSDevice) {
        console.log('🍎 togglePlayPause called on iOS - should be handled by iOS bridge');
        return;
    }
    
    if (musicPlayer && musicPlayer.audio) {
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

function nextTrack() {
    // Skip if on iOS device - handled by iOS player
    if (window.isIOSDevice) {
        console.log('🍎 nextTrack called on iOS - should be handled by iOS bridge');
        return;
    }
    
    if (musicPlayer) {
        musicPlayer.nextTrack();
    }
}

function previousTrack() {
    // Skip if on iOS device - handled by iOS player
    if (window.isIOSDevice) {
        console.log('🍎 previousTrack called on iOS - should be handled by iOS bridge');
        return;
    }
    
    if (musicPlayer) {
        musicPlayer.previousTrack();
    }
}

function seekTo(value) {
    // Skip if on iOS device - handled by iOS player
    if (window.isIOSDevice) {
        console.log('🍎 seekTo called on iOS - should be handled by iOS bridge');
        return;
    }
    
    if (musicPlayer && musicPlayer.audio) {
        musicPlayer.audio.currentTime = value;
    }
}

function setVolume(value) {
    // Skip if on iOS device - handled by iOS player
    if (window.isIOSDevice) {
        console.log('🍎 setVolume called on iOS - should be handled by iOS bridge');
        return;
    }
    
    if (musicPlayer && musicPlayer.audio) {
        musicPlayer.audio.volume = value / 100;
    }
}

// Function to play specific track from music library
function playTrack(index) {
    // Skip if on iOS device - handled by iOS player
    if (window.isIOSDevice) {
        console.log('🍎 playTrack called on iOS - should be handled by iOS bridge');
        return;
    }
    
    if (musicPlayer) {
        musicPlayer.loadTrack(index);
        musicPlayer.audio.play().catch(e => {
            console.error('Play error:', e);
        });
        musicPlayer.playPauseBtn.textContent = '⏸';
        musicPlayer.isPlaying = true;
          // Expand player if collapsed
        if (musicPlayer.isCollapsed) {
            musicPlayer.togglePlayer();
        }
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    showContent('about');
    
    // Only initialize music player on non-iOS devices
    if (!window.isIOSDevice) {
        console.log('🖥️ Initializing standard music player for non-iOS device');
        // Wait for music-player module to load
        setTimeout(() => {
            if (window.MusicPlayer) {
                musicPlayer = new MusicPlayer();
            } else {
                console.warn('MusicPlayer class not available');
            }
        }, 100);
    } else {
        console.log('🍎 Skipping standard music player initialization on iOS device');
    }
});
