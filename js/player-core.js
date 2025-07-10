/**
 * Basic Audio Player Core
 * Foundation player that works across platforms
 */

class AudioPlayerCore {    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.tracks = [];
        this.initialized = false;
        this.currentTrackIndex = 0;
        this.previousVolume = 0.7; // Store previous volume level for mute/unmute
        this.isMuted = false;
        
        // DOM elements - will be set in init()
        this.playerContainer = null;
        this.audioElement = null;
        this.playPauseBtn = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.progressBar = null;
        this.currentTimeDisplay = null;
        this.durationDisplay = null;
        this.trackTitleElement = null;
        this.trackInfoElement = null;
        this.volumeSlider = null;
        this.volumeIcon = null;
        
        // Bind methods for event listeners
        this.togglePlay = this.togglePlay.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.setProgress = this.setProgress.bind(this);
        this.playNextTrack = this.playNextTrack.bind(this);
        this.playPreviousTrack = this.playPreviousTrack.bind(this);
        this.loadTrack = this.loadTrack.bind(this);
        this.audioEnded = this.audioEnded.bind(this);
        this.setVolume = this.setVolume.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
    }
    
    /**
     * Initialize the player by creating and attaching DOM elements
     * @param {Element} containerElement - Container for the player
     */
    init(containerElement) {
        if (!containerElement) {
            console.error('No container provided for audio player');
            return;
        }
        
        this.playerContainer = containerElement;
        
        // Create player HTML structure
        this.createPlayerDOM();
        
        // Set up references to DOM elements
        this.setupDOMReferences();
        
        // Add event listeners
        this.addEventListeners();
        
        // Load tracks data
        this.loadTracksData();
        
        this.initialized = true;
        console.log('Audio player initialized');
    }
      /**
     * Create the DOM structure for the player
     */
    createPlayerDOM() {
        // Check if we're in the footer
        const isFooterPlayer = this.playerContainer.classList.contains('footer-player');
        
        // Create a more compact layout if it's in the footer
        const playerHTML = `
            <div class="audio-player ${isFooterPlayer ? 'footer-audio-player' : ''}">
                <button class="player-toggle-btn" aria-label="Toggle player visibility">
                    <i class="fas fa-chevron-up">▲</i>
                </button>
                <div class="player-header">
                    <div class="track-info">
                        <div class="track-title">Select a track</div>
                        <div class="track-details">No track selected</div>
                    </div>
                </div>                <div class="player-controls">
                    <button class="control-btn btn-unified prev-btn" aria-label="Previous track">«</button>
                    <button class="control-btn btn-unified play-pause-btn" aria-label="Play or pause">▶</button>
                    <button class="control-btn btn-unified next-btn" aria-label="Next track">»</button>
                </div>
                  <div class="progress-container">
                    <span class="time-display current-time">0:00</span>
                    <div class="progress-bar-container">
                        <input type="range" class="progress-bar" min="0" max="100" value="0" step="0.1">
                    </div>
                    <span class="time-display duration">0:00</span>
                </div>
                
                <div class="volume-control">
                    <button class="volume-icon btn-unified" aria-label="Mute">🔊</button>
                    <div class="volume-slider-container">
                        <input type="range" class="volume-slider" min="0" max="100" value="70" step="1">
                    </div>
                </div>
                
                <audio class="audio-element"></audio>
            </div>
        `;
        
        this.playerContainer.innerHTML = playerHTML;
    }
      /**
     * Set up references to DOM elements
     */
    setupDOMReferences() {
        // Audio element
        this.audioElement = this.playerContainer.querySelector('.audio-element');
        
        // Control buttons
        this.playPauseBtn = this.playerContainer.querySelector('.play-pause-btn');
        this.prevBtn = this.playerContainer.querySelector('.prev-btn');
        this.nextBtn = this.playerContainer.querySelector('.next-btn');
        
        // Progress elements
        this.progressBar = this.playerContainer.querySelector('.progress-bar');
        this.currentTimeDisplay = this.playerContainer.querySelector('.current-time');
        this.durationDisplay = this.playerContainer.querySelector('.duration');
        
        // Track info elements
        this.trackTitleElement = this.playerContainer.querySelector('.track-title');
        this.trackInfoElement = this.playerContainer.querySelector('.track-details');
        
        // Volume control elements
        this.volumeSlider = this.playerContainer.querySelector('.volume-slider');
        this.volumeIcon = this.playerContainer.querySelector('.volume-icon');
    }
      /**
     * Add event listeners to player elements
     */
    addEventListeners() {
        // Play/pause button
        this.playPauseBtn.addEventListener('click', this.togglePlay);
        
        // Progress bar
        this.progressBar.addEventListener('input', this.setProgress);
        
        // Next/Previous buttons
        this.prevBtn.addEventListener('click', this.playPreviousTrack);
        this.nextBtn.addEventListener('click', this.playNextTrack);
        
        // Volume control
        this.volumeSlider.addEventListener('input', this.setVolume);
        this.volumeIcon.addEventListener('click', this.toggleMute);
        
        // Audio element events
        this.audioElement.addEventListener('timeupdate', this.updateProgress);
        this.audioElement.addEventListener('ended', this.audioEnded);
        
        // Load metadata event
        this.audioElement.addEventListener('loadedmetadata', () => {
            this.durationDisplay.textContent = this.formatTime(this.audioElement.duration);
        });
    }
      /**
     * Load tracks data from tracks.js
     */
    loadTracksData() {
        // Check if tracks are available from window.tracksData
        if (window.tracksData && Array.isArray(window.tracksData.tracks)) {
            this.tracks = window.tracksData.tracks;
            console.log(`Loaded ${this.tracks.length} tracks`);
            
            // Set initial volume from config if available
            if (window.tracksData.defaultVolume) {
                const initialVolume = Math.round(window.tracksData.defaultVolume * 100);
                this.audioElement.volume = window.tracksData.defaultVolume;
                if (this.volumeSlider) {
                    this.volumeSlider.value = initialVolume;
                    this.updateVolumeIcon(initialVolume);
                }
                this.previousVolume = initialVolume;
            }
        } else {
            console.warn('No tracks data found. Make sure tracks.js is loaded.');
            
            // Set up some demo tracks as fallback
            this.tracks = [
                {
                    title: "Softer for J",
                    artist: "Nick Vuci",
                    tuning: "16-tone equal temperament",
                    file: "music/NickVuci-20220211-16edo-Softer.mp3"
                },
                {
                    title: "Solo Piano Miniature 1",
                    artist: "Nick Vuci",
                    tuning: "24-tone equal temperament",
                    file: "music/NV-20201021-24EDO-SoloPianoMiniature1.flac"
                }            ];
            console.log('Using fallback demo tracks');
        }
        
        // Update collection stats when tracks are loaded
        this.updateCollectionStats();
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        // If no track is loaded, load the first one
        if (!this.currentTrack) {
            this.loadTrack(0);
        }
          if (this.audioElement.paused) {            this.audioElement.play()
                .then(() => {
                    this.isPlaying = true;
                    this.playPauseBtn.textContent = '❙❙';
                    this.playPauseBtn.setAttribute('aria-label', 'Pause');
                    // Update music section when playback starts
                    this.updateMusicSection();
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        } else {
            this.audioElement.pause();
            this.isPlaying = false;
            this.playPauseBtn.textContent = '▶';
            this.playPauseBtn.setAttribute('aria-label', 'Play');
        }
    }
    
    /**
     * Update progress bar and time displays
     */
    updateProgress() {
        const { currentTime, duration } = this.audioElement;
        if (duration > 0) {
            // Update progress bar
            const progressPercent = (currentTime / duration) * 100;
            this.progressBar.value = progressPercent;
            
            // Update time displays
            this.currentTimeDisplay.textContent = this.formatTime(currentTime);
        }
    }
    
    /**
     * Set progress based on user input
     */
    setProgress() {
        const { duration } = this.audioElement;
        const newTime = (this.progressBar.value / 100) * duration;
        this.audioElement.currentTime = newTime;
    }
    
    /**
     * Play the next track
     */
    playNextTrack() {
        if (this.tracks.length === 0) return;
        
        let nextIndex = this.currentTrackIndex + 1;
        if (nextIndex >= this.tracks.length) {
            nextIndex = 0; // Loop back to first track
        }
        
        this.loadTrack(nextIndex);
        
        // If player was playing, continue playing the new track
        if (this.isPlaying) {
            this.audioElement.play()
                .catch(error => console.error('Error playing next track:', error));
        }

        this.updateURLForCurrentTrack();
    }
    
    /**
     * Play the previous track
     */
    playPreviousTrack() {
        if (this.tracks.length === 0) return;
        
        // If current time is more than 3 seconds, restart the current track
        if (this.audioElement.currentTime > 3) {
            this.audioElement.currentTime = 0;
            return;
        }
        
        let prevIndex = this.currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.tracks.length - 1; // Loop to last track
        }
        
        this.loadTrack(prevIndex);
        
        // If player was playing, continue playing the new track
        if (this.isPlaying) {
            this.audioElement.play()
                .catch(error => console.error('Error playing previous track:', error));
        }

        this.updateURLForCurrentTrack();
    }
    
    /**
     * Handle audio ended event
     */
    audioEnded() {
        this.playNextTrack();
    }
    
    /**
     * Load a specific track by index
     * @param {number} index - Track index
     */
    loadTrack(index) {
        if (this.tracks.length === 0) {
            console.warn('No tracks available to load');
            return;
        }
        
        if (index < 0 || index >= this.tracks.length) {
            console.warn(`Track index ${index} out of bounds`);
            return;
        }
        
        // Update current index
        this.currentTrackIndex = index;
        this.currentTrack = this.tracks[index];
        
        // Update audio source
        this.audioElement.src = this.currentTrack.file;
        
        // Update track info display
        this.trackTitleElement.textContent = this.currentTrack.title;
        this.trackInfoElement.textContent = this.currentTrack.album;
        this.trackInfoElement.textContent = this.currentTrack.tuning;
        
        // Reset progress and time displays
        this.progressBar.value = 0;
        this.currentTimeDisplay.textContent = '0:00';
        this.durationDisplay.textContent = '0:00';
        
        // Preload the audio
        this.audioElement.load();
        
        // Update the music section with current track information
        this.updateMusicSection();
        
        console.log(`Loaded track: ${this.currentTrack.title}`);

        this.updateURLForCurrentTrack();
    }
    
    /**
     * Format time in seconds to MM:SS format
     * @param {number} timeInSeconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Set volume based on slider input
     */
    setVolume() {
        const value = this.volumeSlider.value;
        this.audioElement.volume = value / 100;
        
        // Update icon based on volume level
        this.updateVolumeIcon(value);
        
        // Store current volume for mute toggle
        if (value > 0) {
            this.previousVolume = value;
            this.isMuted = false;
        } else {
            this.isMuted = true;
        }
    }
    
    /**
     * Toggle mute/unmute
     */
    toggleMute() {
        if (this.isMuted) {
            // Unmute - restore previous volume
            this.volumeSlider.value = this.previousVolume;
            this.audioElement.volume = this.previousVolume / 100;
            this.isMuted = false;
            this.volumeIcon.textContent = '🔊';
            this.volumeIcon.setAttribute('aria-label', 'Mute');
        } else {
            // Mute - set volume to 0
            this.previousVolume = this.volumeSlider.value;
            this.volumeSlider.value = 0;
            this.audioElement.volume = 0;
            this.isMuted = true;
            this.volumeIcon.textContent = '🔇';
            this.volumeIcon.setAttribute('aria-label', 'Unmute');
        }
    }
    
    /**
     * Update volume icon based on volume level
     * @param {number} value - Volume level (0-100)
     */
    updateVolumeIcon(value) {
        // Change icon based on volume level
        if (value == 0) {
            this.volumeIcon.textContent = '🔇'; // Muted
            this.volumeIcon.setAttribute('aria-label', 'Unmute');
            this.isMuted = true;
        } else if (value < 50) {
            this.volumeIcon.textContent = '🔉'; // Medium-low volume
            this.volumeIcon.setAttribute('aria-label', 'Mute');
            this.isMuted = false;
        } else {
            this.volumeIcon.textContent = '🔊'; // High volume
            this.volumeIcon.setAttribute('aria-label', 'Mute');
            this.isMuted = false;
        }
    }    /**
     * Update the music section with current track information
     */
    updateMusicSection() {
        const nowPlayingSection = document.getElementById('now-playing-section');
        const currentTrackTitle = document.getElementById('current-track-title');
        const currentTrackArtist = document.getElementById('current-track-artist');
        const currentTrackAlbum = document.getElementById('current-track-album');
        const currentTrackYear = document.getElementById('current-track-year');
        const currentTrackTuning = document.getElementById('current-track-tuning');
        const currentTrackDescription = document.getElementById('current-track-description');
        const currentTrackTags = document.getElementById('current-track-tags');
        
        // Show the now playing section
        if (nowPlayingSection) {
            nowPlayingSection.style.display = 'block';
        }
        
        // Check if we have a current track
        if (!this.currentTrack) {
            // If no track is loaded, show a message to start playback
            if (currentTrackTitle) {
                currentTrackTitle.textContent = 'No track selected';
            }
            if (currentTrackDescription) {
                currentTrackDescription.textContent = 'Use the player controls at the bottom to start listening to music';
            }
            return;
        }
        
        // Update track information
        if (currentTrackTitle) {
            currentTrackTitle.textContent = this.currentTrack.title || 'Unknown Title';
        }
        
        if (currentTrackArtist) {
            currentTrackArtist.textContent = this.currentTrack.artist || 'Unknown Artist';
        }
        
        if (currentTrackAlbum) {
            currentTrackAlbum.textContent = this.currentTrack.album || 'Unknown Album';
        }
        
        if (currentTrackYear) {
            currentTrackYear.textContent = this.currentTrack.year || 'Unknown Year';
        }
        
        if (currentTrackTuning) {
            currentTrackTuning.textContent = this.currentTrack.tuning || 'Standard Tuning';
        }
        
        if (currentTrackDescription) {
            currentTrackDescription.textContent = this.currentTrack.description || 'No description available';
        }
          if (currentTrackTags && this.currentTrack.tags) {
            currentTrackTags.textContent = this.currentTrack.tags.join(', ');
        }
        
        // Update the About My Music section
        this.updateAboutMusicSection();
    }
      /**
     * Update collection statistics in the music section
     */
    updateCollectionStats() {
        const totalTracksElement = document.getElementById('total-tracks');
        const totalDurationElement = document.getElementById('total-duration');
        
        if (totalTracksElement && this.tracks) {
            totalTracksElement.textContent = this.tracks.length;
        }
        
        if (totalDurationElement && this.tracks && this.tracks.length > 0) {
            // Calculate total duration from all tracks
            let totalSeconds = 0;
            let tracksWithDuration = 0;
            
            this.tracks.forEach(track => {
                if (track.duration && !isNaN(track.duration)) {
                    totalSeconds += track.duration;
                    tracksWithDuration++;
                }
            });
            
            if (totalSeconds > 0) {
                totalDurationElement.textContent = this.formatTime(totalSeconds);
            } else {
                // If no durations are available, show placeholder
                totalDurationElement.textContent = "calculating...";
                
                // Try to load durations asynchronously
                this.loadTrackDurations();
            }
        }
    }

    /**
     * Load track durations asynchronously for collection stats
     */
    async loadTrackDurations() {
        let totalSeconds = 0;
        let loadedCount = 0;
        
        // Create a temporary audio element for duration loading
        const tempAudio = new Audio();
        
        for (const track of this.tracks) {
            if (!track.duration || isNaN(track.duration)) {
                try {
                    await new Promise((resolve, reject) => {
                        tempAudio.onloadedmetadata = () => {
                            track.duration = tempAudio.duration;
                            totalSeconds += tempAudio.duration;
                            loadedCount++;
                            resolve();
                        };
                        tempAudio.onerror = () => reject();
                        tempAudio.src = track.file;
                    });
                } catch (error) {
                    console.warn(`Could not load duration for ${track.title}`);
                }
            } else {
                totalSeconds += track.duration;
                loadedCount++;
            }
        }
        
        // Update the display with calculated total
        const totalDurationElement = document.getElementById('total-duration');
        if (totalDurationElement && totalSeconds > 0) {
            totalDurationElement.textContent = this.formatTime(totalSeconds);
        }
    }
      /**
     * Update the "About My Music" section with dynamic content
     */
    updateAboutMusicSection() {
        const aboutMusicContent = document.getElementById('about-music-content');
        
        if (!aboutMusicContent) return;
        
        // If we have a current track, try to load its custom document
        if (this.currentTrack) {
            this.loadTrackAboutDocument(this.currentTrack);
        } else {
            // No track loaded - show default content
            this.showDefaultAboutContent();
        }
    }    /**
     * Try to load a custom about document for the current track
     * @param {Object} track - The track object
     */
    async loadTrackAboutDocument(track) {
        const aboutMusicContent = document.getElementById('about-music-content');
        if (!aboutMusicContent) return;

        // Generate the expected document path based on track ID or title
        const documentPath = this.getTrackDocumentPath(track);
        console.log(`Looking for custom about document: ${documentPath}`);
        
        try {
            // Try to fetch the custom document
            const response = await fetch(documentPath);
            
            if (response.ok) {
                const content = await response.text();
                console.log(`✅ Loaded custom about document for "${track.title}"`);
                // Show the custom content with track title as heading
                aboutMusicContent.innerHTML = `
                    <h4>About "${track.title}"</h4>
                    <div>${content}</div>
                `;
            } else {
                // Document doesn't exist - show fallback
                console.log(`📄 No custom document found for "${track.title}" (${response.status})`);
                this.showTrackAboutFallback(track);
            }
        } catch (error) {
            // Error loading document - show fallback
            console.log(`📄 No custom about document found for "${track.title}"`);
            this.showTrackAboutFallback(track);
        }
    }

    /**
     * Generate the expected path for a track's about document
     * @param {Object} track - The track object
     * @returns {string} The document path
     */
    getTrackDocumentPath(track) {
        // Use track ID if available, otherwise sanitize title
        const identifier = track.id || this.sanitizeFilename(track.title);
        return `about-tracks/${identifier}.html`;
    }

    /**
     * Sanitize a string to be used as a filename
     * @param {string} title - The track title
     * @returns {string} Sanitized filename
     */
    sanitizeFilename(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
    }    /**
     * Show fallback content when no custom document exists for a track
     * @param {Object} track - The track object
     */
    showTrackAboutFallback(track) {
        const aboutMusicContent = document.getElementById('about-music-content');
        if (!aboutMusicContent) return;

        aboutMusicContent.innerHTML = `
            <h4>About "${track.title}"</h4>
            <p><em>No custom info about this track currently.</em></p>
        `;
    }

    /**
     * Show default content when no track is loaded
     */
    showDefaultAboutContent() {
        const aboutMusicContent = document.getElementById('about-music-content');
        if (!aboutMusicContent) return;

        aboutMusicContent.innerHTML = `
            <h4>About My Music</h4>
            <p>My compositions explore microtonal tuning systems, particularly equal temperaments beyond the standard 12-tone scale. These pieces investigate new harmonic possibilities through alternative tuning approaches including 16-EDO, 24-EDO, and various xenharmonic temperaments.</p>
            <p><em>Select a track to learn more about it.</em></p>
        `;
    }

    /**
     * Get the current track ID for URL management
     * @returns {string|null} The current track ID or null if no track loaded
     */
    getCurrentTrackId() {
        return this.currentTrackIndex !== -1 ? this.tracks[this.currentTrackIndex]?.id : null;
    }

    /**
     * Update URL whenever track changes
     */
    updateURLForCurrentTrack() {
        // Add a small delay to ensure we don't interfere with initial loading
        setTimeout(() => {
            if (window.updateURL && typeof window.updateURL === 'function') {
                const activeButton = document.querySelector('.nav-buttons button.active');
                let currentPage = 'about';
                
                if (activeButton) {
                    const onclickAttr = activeButton.getAttribute('onclick');
                    const match = onclickAttr.match(/showContent\('([^']+)'\)/);
                    currentPage = match ? match[1] : 'about';
                }
                
                const trackId = this.getCurrentTrackId();
                window.updateURL(currentPage, trackId);
            }
        }, 50);
    }
}

// Export the player
window.AudioPlayerCore = AudioPlayerCore;
