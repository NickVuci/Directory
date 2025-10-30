/**
 * Player Toggle Functionality
 * Handles the collapsing/expanding of the audio player
 */

document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.player-toggle-btn');
    const player = document.querySelector('.footer-player');
    
    // Add the toggle button if it doesn't exist in the HTML
    if (!toggleBtn && player) {
        // Create toggle button at the beginning of the player container
        const audioPlayer = player.querySelector('.audio-player');
        if (audioPlayer) {
            const newToggleBtn = document.createElement('button');
            newToggleBtn.className = 'player-toggle-btn';
            newToggleBtn.setAttribute('aria-label', 'Toggle player visibility');
            
            // Create icon element
            const iconElement = document.createElement('i');
            iconElement.className = 'fas fa-chevron-up'; // Using Font Awesome
            // Fallback for when Font Awesome might not be available
            iconElement.textContent = '▲'; 
            
            newToggleBtn.appendChild(iconElement);
            audioPlayer.prepend(newToggleBtn); // Add to the beginning of the player
            
            // Set up event listener for the new button
            setupToggleListener(newToggleBtn, player);
        }
    } else if (toggleBtn && player) {
        // Set up event listener for existing toggle button
        setupToggleListener(toggleBtn, player);
    }
    
    // Determine initial collapsed state
    // Previously defaulted to collapsed on mobile, which could hide the player off-screen on some devices.
    // Now default to expanded everywhere unless the user explicitly chose to collapse it.
    const isMobile = window.innerWidth <= 768;
    let startCollapsed = false; // Default expanded on all devices
    
    // Restore previous state from localStorage, if available
    const storedState = localStorage.getItem('playerCollapsed');
    if (storedState !== null) {
        startCollapsed = storedState === 'true';
    }
    
    if (player) {
        if (startCollapsed) {
            player.classList.add('collapsed');
            // Update icon if it exists
            const icon = player.querySelector('.player-toggle-btn i');
            if (icon) {
                icon.className = 'fas fa-chevron-down'; // Change to down arrow when collapsed
                // Fallback text
                icon.textContent = '▼';
            }
        }
        
        // Store initial state
        localStorage.setItem('playerCollapsed', startCollapsed);
    }
});

function setupToggleListener(button, player) {
    button.addEventListener('click', function() {
        player.classList.toggle('collapsed');
        
        // Update icon based on state
        const icon = this.querySelector('i');
        if (icon) {
            if (player.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-down';
                icon.textContent = '▼'; // Fallback text
            } else {
                icon.className = 'fas fa-chevron-up';
                icon.textContent = '▲'; // Fallback text
            }
        }
        
        // Save preference to localStorage
        const isCollapsed = player.classList.contains('collapsed');
        localStorage.setItem('playerCollapsed', isCollapsed);
    });
}
