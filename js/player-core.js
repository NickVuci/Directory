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
                <div class="player-header">
                    <div class="track-info">
                        <div class="track-title">Select a track</div>
                        <div class="track-details">No track selected</div>
                    </div>
                </div>
                  <div class="player-controls">
                    <button class="control-btn btn-unified prev-btn" aria-label="Previous track">⏮</button>
                    <button class="control-btn btn-unified play-pause-btn" aria-label="Play or pause">▶</button>
                    <button class="control-btn btn-unified next-btn" aria-label="Next track">⏭</button>
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
                }
            ];
            console.log('Using fallback demo tracks');
        }
    }
    
    /**
     * Toggle play/pause
     */
    togglePlay() {
        // If no track is loaded, load the first one
        if (!this.currentTrack) {
            this.loadTrack(0);
        }
        
        if (this.audioElement.paused) {
            this.audioElement.play()
                .then(() => {
                    this.isPlaying = true;
                    this.playPauseBtn.textContent = '⏸';
                    this.playPauseBtn.setAttribute('aria-label', 'Pause');
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
        this.trackInfoElement.textContent = 
            `${this.currentTrack.tuning || 'No tuning info'}`;
        
        // Reset progress and time displays
        this.progressBar.value = 0;
        this.currentTimeDisplay.textContent = '0:00';
        this.durationDisplay.textContent = '0:00';
        
        // Preload the audio
        this.audioElement.load();
        
        console.log(`Loaded track: ${this.currentTrack.title}`);
    }
    
    /**
     * Format time in seconds to MM:SS format
     * @param {number} timeInSeconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(timeInSeconds) {
        if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
        
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
    }
}

// Export the player
window.AudioPlayerCore = AudioPlayerCore;
