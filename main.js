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
    setTimeout(() => {        // Fetch the new content and insert it into the hidden container
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
                
                // Call section-specific initialization if needed
                onSectionLoaded(section);
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

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    showContent('about');
});
