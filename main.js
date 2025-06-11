// URL management functions
function parseURL() {
    const hash = window.location.hash.substring(1); // Remove #
    const params = new URLSearchParams(hash);
    
    return {
        page: params.get('page'),
        track: params.get('track')
    };
}

function updateURL(page, trackId) {
    const params = new URLSearchParams();
    
    // Only add page param if it's not the default 'about'
    if (page && page !== 'about') {
        params.set('page', page);
    }
    
    // Always add track param if provided
    if (trackId) {
        params.set('track', trackId);
    }
    
    const newHash = params.toString();
    
    // Update URL without triggering hashchange if it's different
    if (window.location.hash !== '#' + newHash) {
        // Use history.replaceState to avoid triggering hashchange
        const newURL = window.location.pathname + window.location.search + '#' + newHash;
        history.replaceState(null, null, newURL);
    }
}

// Make updateURL globally available for player integration
window.updateURL = updateURL;

function getCurrentPageName() {
    const activeButton = document.querySelector('.nav-buttons button.active');
    if (activeButton) {
        // Extract page name from onclick attribute
        const onclickAttr = activeButton.getAttribute('onclick');
        const match = onclickAttr.match(/showContent\('([^']+)'\)/);
        return match ? match[1] : 'about';
    }
    return 'about';
}

function showContent(section, updateUrlFlag = true) {
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
                
                // Update URL if requested
                if (updateUrlFlag) {
                    const currentTrackId = window.globalPlayer?.getCurrentTrackId?.() || null;
                    updateURL(section, currentTrackId);
                }
                
                // Call section-specific initialization if needed
                onSectionLoaded(section);
            });
    }, 500);
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

/**
 * Handle section-specific initialization after content is loaded
 * @param {string} section - The section that was just loaded
 */
function onSectionLoaded(section) {
    if (section === 'music') {
        // Update the music section with current track and stats
        // Wait a bit for the DOM to be ready
        setTimeout(() => {
            // Get the global player instance if it exists
            if (window.globalPlayer) {
                window.globalPlayer.updateCollectionStats();
                window.globalPlayer.updateMusicSection();
            }
        }, 100);
    }
}

// Function to load content based on URL
function loadFromURL() {
    const { page, track } = parseURL();
    
    // Determine which page to show
    let targetPage = 'about'; // default
    
    if (page) {
        targetPage = page;
    } else if (track) {
        // If only track is specified, show music page
        targetPage = 'music';
    }
    
    // Load the page first (without updating URL to avoid loops)
    showContent(targetPage, false);
    
    // Then handle track loading after page loads
    setTimeout(() => {
        if (track && window.globalPlayer) {
            const trackIndex = window.globalPlayer.tracks.findIndex(t => 
                t.id === track
            );
            
            if (trackIndex !== -1) {
                window.globalPlayer.loadTrack(trackIndex);
            } else {
                // Track not found, load random and update URL
                selectRandomTrack(window.globalPlayer);
            }
        } else if (window.globalPlayer) {
            // No track specified, load random
            selectRandomTrack(window.globalPlayer);
        }
        
        // Update URL to reflect final state
        const currentTrackId = window.globalPlayer?.getCurrentTrackId?.() || null;
        updateURL(targetPage, currentTrackId);
    }, 600); // Wait for page load + a bit more
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
    loadFromURL();
});

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if there's a URL to load, otherwise default to about
    if (window.location.hash) {
        loadFromURL();
    } else {
        showContent('about');
        // Load random track for default page load after player is ready
        setTimeout(() => {
            if (window.globalPlayer) {
                selectRandomTrack(window.globalPlayer);
            }
        }, 700);
    }
});