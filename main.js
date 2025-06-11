// Page Navigation Functionality
let currentContent = 'content1';  // Track which container is currently active

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
        history.replaceState(null, null, '#' + newHash);
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

// Add a flag to track if we're loading from URL
let isLoadingFromURL = false;

function showContent(section, updateUrlFlag = true, skipRandomTrack = false) {
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
                onSectionLoaded(section, skipRandomTrack);
            });
    }, 500);
}/**
 * Handle section-specific initialization after content is loaded
 * @param {string} section - The section that was just loaded
 * @param {boolean} skipRandomTrack - Whether to skip loading a random track
 */
function onSectionLoaded(section, skipRandomTrack = false) {
    if (section === 'music') {
        setTimeout(() => {
            if (window.globalPlayer) {
                window.globalPlayer.updateCollectionStats();
                // updateMusicSection will be called by loadTrack automatically
            }
        }, 100);
    }
}

function loadFromURL() {
    const { page, track } = parseURL();
    
    let targetPage = 'about';
    if (page) {
        targetPage = page;
    } else if (track) {
        targetPage = 'music';
    }
    
    showContent(targetPage, false);
    
    // Load track immediately after page content is loaded
    setTimeout(() => {
        if (window.globalPlayer) {
            if (track) {
                const trackIndex = window.globalPlayer.tracks.findIndex(t => t.id === track);
                if (trackIndex !== -1) {
                    window.globalPlayer.loadTrack(trackIndex);
                } else {
                    selectRandomTrack(window.globalPlayer);
                }
            } else {
                selectRandomTrack(window.globalPlayer);
            }
        }
    }, 100); // Much faster
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
        // Load random track for default page load
        setTimeout(() => {
            if (window.globalPlayer) {
                selectRandomTrack(window.globalPlayer);
            }
        }, 700);
    }
});