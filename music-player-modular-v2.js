/* ==========================================
   MUSIC PLAYER CLASS - MODULAR VERSION 2.0
   Phase 2: Enhanced with DOM, Config, and Event modules
   ========================================== */

// Import modules
import { Utils } from './js-modules/utils/Utils.js';
import { AudioEngine } from './js-modules/audio/AudioEngine.js';
import { DOMHandler } from './js-modules/dom/DOMHandler.js';
import { Configuration, getConfig, isMobileMode } from './js-modules/config/Configuration.js';
import { EventHandler } from './js-modules/events/EventHandler.js';

// Music Player Functionality - Enhanced with Modules
class MusicPlayer {
    /* ========================================
       CONSTRUCTOR & INITIALIZATION
       ======================================== */
    
    constructor() {
        // Load configuration
        this.config = Configuration;
        
        // Initialize core state
        this.tracks = window.TRACKS || [];
        this.currentTrackIndex = 0;
        this.isCollapsed = getConfig('desktop.collapsedByDefault', true);
        this.isPlaying = false;
        this.isMobile = isMobileMode();
        
        // Initialize modules
        this.initializeModules();
        
        // Initialize player
        this.initializePlayer();
    }
    
    /* ========================================
       MODULE INITIALIZATION
       ======================================== */
    
    initializeModules() {
        try {
            // Initialize DOM Handler
            this.domHandler = new DOMHandler();
            
            if (!this.domHandler.isReady()) {
                throw new Error('Failed to initialize DOM Handler');
            }
            
            // Get elements from DOM handler
            const elements = this.domHandler.getElements();
            
            // Initialize Audio Engine
            this.audioEngine = new AudioEngine(elements.audio);
            
            // Initialize Event Handler with callbacks
            this.eventHandler = new EventHandler(elements, {
                onLoadedMetadata: this.handleLoadedMetadata.bind(this),
                onTimeUpdate: this.handleTimeUpdate.bind(this),
                onEnded: this.handleEnded.bind(this),
                onPlay: this.handlePlay.bind(this),
                onPause: this.handlePause.bind(this),
                onError: this.handleError.bind(this),
                onDragStart: this.handleDragStart.bind(this),
                onDragMove: this.handleDragMove.bind(this),
                onDragEnd: this.handleDragEnd.bind(this),
                onMobileSliderTap: this.handleMobileSliderTap.bind(this),
                onMobileSliderSeekEnd: this.handleMobileSliderSeekEnd.bind(this),
                onResize: this.handleResize.bind(this)
            });
            
            // Store elements reference for direct access when needed
            this.elements = elements;
            
            console.log('🟢 MODULAR v2.0: All modules initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize modules:', error);
            // Fallback to basic functionality if modules fail
            this.initializeFallbackElements();
        }
    }
    
    initializeFallbackElements() {
        // Fallback DOM element initialization if modules fail
        this.elements = {};
        this.elements.audio = document.getElementById('audioPlayer');
        this.elements.player = document.getElementById('musicPlayer');
        this.elements.playPause = document.getElementById('playPauseBtn');
        this.elements.progress = document.getElementById('progressBar');
        this.elements.volume = document.getElementById('volumeSlider');
        this.elements.trackTitle = document.getElementById('trackTitle');
        this.elements.trackArtist = document.getElementById('trackArtist');
        this.elements.currentTime = document.getElementById('currentTime');
        this.elements.totalTime = document.getElementById('totalTime');
        
        // Mobile elements
        this.elements.mobilePlayer = document.getElementById('mobileMusicPlayer');
        this.elements.mobileProgress = document.getElementById('mobileProgressBar');
        this.elements.mobileThumb = document.getElementById('mobileSliderThumb');
        this.elements.mobileTitle = document.getElementById('mobileTrackTitle');
        this.elements.mobileTuning = document.getElementById('mobileTrackTuning');
        this.elements.mobileCurrentTime = document.getElementById('mobileCurrentTime');
        this.elements.mobileTotalTime = document.getElementById('mobileTotalTime');
    }
    
    /* ========================================
       CORE INITIALIZATION METHODS
       ======================================== */
    
    initializePlayer() {
        try {
            // Set initial volume
            if (this.elements.audio) {
                this.elements.audio.volume = getConfig('audio.defaultVolume', 0.5);
            }
            
            // Load first track
            this.loadTrack(0);            // Set initial collapsed state for desktop
            if (!this.isMobile && this.domHandler) {
                if (this.isCollapsed) {
                    // Apply collapsed class directly to match initial state
                    if (this.elements.player && !this.elements.player.classList.contains('collapsed')) {
                        this.elements.player.classList.add('collapsed');
                    }
                }
            }
            
            // Update player visibility based on screen size
            if (this.domHandler) {
                this.domHandler.updatePlayerVisibility();
            }
            
            // Initialize mobile enhancements
            this.initializeMobileEnhancements();
            
            console.log('🎵 MODULAR v2.0: Player initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing player:', error);
        }
    }
    
    initializeMobileEnhancements() {
        if (!this.isMobile || !this.domHandler) return;
        
        try {
            // Update mobile thumb position and icon
            this.domHandler.updateMobileThumbPosition(0, 100);
            this.domHandler.updatePlayPauseDisplay(false);
            
            // Show initial hint flash for mobile users
            this.showInitialHint();
            
        } catch (error) {
            console.error('❌ Error initializing mobile enhancements:', error);
        }
    }
    
    showInitialHint() {
        const hintDuration = getConfig('mobile.hintDisplayDuration', 3000);
        
        setTimeout(() => {
            const hint = document.querySelector('.mobile-progress-hint');
            if (hint) {
                hint.style.animation = 'hintFlash 3s ease-in-out';
                setTimeout(() => {
                    hint.style.animation = '';
                }, hintDuration);
            }
        }, 1000);
    }
    
    /* ========================================
       AUDIO EVENT HANDLERS
       ======================================== */
    
    handleLoadedMetadata(duration) {
        try {
            if (this.domHandler) {
                this.domHandler.updateTimeDisplay(0, duration);
                this.domHandler.updateProgressDisplay(0, duration);
                this.domHandler.updateMobileThumbPosition(0, duration);
            }
        } catch (error) {
            console.error('❌ Error handling loaded metadata:', error);
        }
    }
    
    handleTimeUpdate(currentTime, duration) {
        try {
            if (this.domHandler) {
                this.domHandler.updateTimeDisplay(currentTime, duration);
                this.domHandler.updateProgressDisplay(currentTime, duration);
                this.domHandler.updateMobileThumbPosition(currentTime, duration);
            }
        } catch (error) {
            console.error('❌ Error handling time update:', error);
        }
    }
    
    handleEnded() {
        try {
            // Auto-advance to next track and continue playing
            this.nextTrack(true);
        } catch (error) {
            console.error('❌ Error handling audio ended:', error);
        }
    }
    
    handlePlay() {
        try {
            this.isPlaying = true;
            if (this.domHandler) {
                this.domHandler.updatePlayPauseDisplay(true);
            }
        } catch (error) {
            console.error('❌ Error handling play event:', error);
        }
    }
    
    handlePause() {
        try {
            this.isPlaying = false;
            if (this.domHandler) {
                this.domHandler.updatePlayPauseDisplay(false);
            }
        } catch (error) {
            console.error('❌ Error handling pause event:', error);
        }
    }
    
    handleError(error) {
        try {
            console.error('Audio error:', error);
            if (this.domHandler) {
                this.domHandler.showErrorState('Error loading track');
            }
        } catch (err) {
            console.error('❌ Error handling audio error:', err);
        }
    }
    
    /* ========================================
       DRAG EVENT HANDLERS
       ======================================== */
    
    handleDragStart() {
        try {
            if (this.domHandler) {
                this.domHandler.setDraggingState(true);
            }
        } catch (error) {
            console.error('❌ Error handling drag start:', error);
        }
    }
    
    handleDragMove(x, y) {
        try {
            if (this.elements.player) {
                this.elements.player.style.left = `${x}px`;
                this.elements.player.style.top = `${y}px`;
                this.elements.player.style.right = 'auto';
                this.elements.player.style.bottom = 'auto';
            }
        } catch (error) {
            console.error('❌ Error handling drag move:', error);
        }
    }
    
    handleDragEnd(wasDragging, hasMoved) {
        try {
            if (this.domHandler) {
                this.domHandler.setDraggingState(false);
                
                // If it was a click (not drag) and player is collapsed, expand it
                if (wasDragging && !hasMoved && this.isCollapsed) {
                    this.togglePlayer();
                }
            }
        } catch (error) {
            console.error('❌ Error handling drag end:', error);
        }
    }
    
    /* ========================================
       MOBILE SLIDER EVENT HANDLERS
       ======================================== */
    
    handleMobileSliderTap() {
        try {
            this.togglePlayPause();
        } catch (error) {
            console.error('❌ Error handling mobile slider tap:', error);
        }
    }
    
    handleMobileSliderSeekEnd() {
        try {
            if (this.audioEngine) {
                this.audioEngine.play();
            }
        } catch (error) {
            console.error('❌ Error handling mobile slider seek end:', error);
        }
    }
    
    handleResize() {
        try {
            if (this.domHandler && this.domHandler.updateResponsiveState()) {
                // Screen size changed between mobile/desktop
                this.isMobile = isMobileMode();
                
                // Re-initialize mobile enhancements if switched to mobile
                if (this.isMobile) {
                    this.initializeMobileEnhancements();
                }
            }
            
            if (this.eventHandler) {
                this.eventHandler.updateResponsiveState();
            }
        } catch (error) {
            console.error('❌ Error handling resize:', error);
        }
    }
    
    /* ========================================
       BASIC PLAYER CONTROLS
       ======================================== */
      togglePlayer() {
        try {
            if (this.domHandler) {
                // Toggle the DOM state and get the NEW state
                const isNowCollapsed = this.domHandler.toggleCollapsed();
                // Sync our JavaScript state with the DOM state
                this.isCollapsed = isNowCollapsed;
            }
        } catch (error) {
            console.error('❌ Error toggling player:', error);
        }
    }
    
    togglePlayPause() {
        try {
            if (!this.elements.audio) return;
            
            if (this.elements.audio.paused) {
                if (this.audioEngine) {
                    this.audioEngine.play();
                } else {
                    this.elements.audio.play().catch(e => console.error('Play error:', e));
                }
                this.isPlaying = true;
            } else {
                if (this.audioEngine) {
                    this.audioEngine.pause();
                } else {
                    this.elements.audio.pause();
                }
                this.isPlaying = false;
            }
            
            // Update display
            if (this.domHandler) {
                this.domHandler.updatePlayPauseDisplay(this.isPlaying);
            }
            
        } catch (error) {
            console.error('❌ Error toggling play/pause:', error);
        }
    }
    
    /* ========================================
       TRACK MANAGEMENT & NAVIGATION
       ======================================== */
    
    loadTrack(index) {
        try {
            if (index >= 0 && index < this.tracks.length) {
                this.currentTrackIndex = index;
                const track = this.tracks[index];
                
                if (this.elements.audio) {
                    this.elements.audio.src = track.src;
                }
                
                // Update display using DOM handler
                if (this.domHandler) {
                    this.domHandler.updateTrackDisplay(track);
                    this.domHandler.updatePlayPauseDisplay(false);
                }
                
                this.isPlaying = false;
            }
        } catch (error) {
            console.error('❌ Error loading track:', error);
        }
    }
    
// filepath: [music-player-modular-v2.js](http://_vscodecontentref_/2)
loadTrack(index, preservePlayState = false) {
    try {
        if (index >= 0 && index < this.tracks.length) {
            const currentPlayState = preservePlayState ? this.isPlaying : false;
            
            this.currentTrackIndex = index;
            const track = this.tracks[index];
            
            if (this.elements.audio) {
                this.elements.audio.src = track.src;
            }
            
            // Update display using DOM handler
            if (this.domHandler) {
                this.domHandler.updateTrackDisplay(track);
                // Only update play/pause display if not preserving state
                if (!preservePlayState) {
                    this.domHandler.updatePlayPauseDisplay(false);
                    this.isPlaying = false;
                } else {
                    // Keep the current state
                    this.isPlaying = currentPlayState;
                }
            }
        }
    } catch (error) {
        console.error('❌ Error loading track:', error);
    }
}

nextTrack(autoAdvance = false) {
    try {
        const wasPlaying = this.isPlaying || !this.elements.audio.paused;
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        
        // Pass true to preserve play state during track loading
        this.loadTrack(nextIndex, wasPlaying || autoAdvance);
        
        // Always continue playing if music was playing before track change
        if (wasPlaying || autoAdvance) {
            // Wait for the new track to load before playing
            const playWhenReady = () => {
                if (this.audioEngine) {
                    this.audioEngine.play();
                } else {
                    this.elements.audio.play().catch(e => console.error('Auto-play error:', e));
                }
                this.isPlaying = true;
                
                if (this.domHandler) {
                    this.domHandler.updatePlayPauseDisplay(true);
                }
            };

            // If audio is ready, play immediately, otherwise wait
            if (this.elements.audio.readyState >= 2) {
                playWhenReady();
            } else {
                this.elements.audio.addEventListener('canplay', playWhenReady, { once: true });
            }
        }
    } catch (error) {
        console.error('❌ Error advancing to next track:', error);
    }
}

previousTrack() {
    try {
        const wasPlaying = this.isPlaying || !this.elements.audio.paused;
        const prevIndex = this.currentTrackIndex === 0 
            ? this.tracks.length - 1 
            : this.currentTrackIndex - 1;
            
        // Pass true to preserve play state during track loading
        this.loadTrack(prevIndex, wasPlaying);
        
        // Continue playing if music was playing before track change
        if (wasPlaying) {
            const playWhenReady = () => {
                if (this.audioEngine) {
                    this.audioEngine.play();
                } else {
                    this.elements.audio.play().catch(e => console.error('Auto-play error:', e));
                }
                this.isPlaying = true;
                
                if (this.domHandler) {
                    this.domHandler.updatePlayPauseDisplay(true);
                }
            };

            // If audio is ready, play immediately, otherwise wait
            if (this.elements.audio.readyState >= 2) {
                playWhenReady();
            } else {
                this.elements.audio.addEventListener('canplay', playWhenReady, { once: true });
            }
        }
    } catch (error) {
        console.error('❌ Error going to previous track:', error);
    }
}
    
    /* ========================================
       LEGACY COMPATIBILITY METHODS
       ======================================== */
    
    // Legacy methods for backward compatibility with main.js bridge functions
    get audio() {
        return this.elements.audio;
    }
    
    get playPauseBtn() {
        return this.elements.playPause;
    }
    
    get progressBar() {
        return this.elements.progress;
    }
    
    get volumeSlider() {
        return this.elements.volume;
    }
    
    get trackTitle() {
        return this.elements.trackTitle;
    }
    
    get trackArtist() {
        return this.elements.trackArtist;
    }
    
    get currentTime() {
        return this.elements.currentTime;
    }
    
    get totalTime() {
        return this.elements.totalTime;
    }
    
    get playerElement() {
        return this.elements.player;
    }
    
    get mobilePlayerElement() {
        return this.elements.mobilePlayer;
    }
    
    get mobileProgressBar() {
        return this.elements.mobileProgress;
    }
    
    get mobileSliderThumb() {
        return this.elements.mobileThumb;
    }
    
    get mobileTrackTitle() {
        return this.elements.mobileTitle;
    }
    
    get mobileTrackTuning() {
        return this.elements.mobileTuning;
    }
    
    get mobileCurrentTime() {
        return this.elements.mobileCurrentTime;
    }
    
    get mobileTotalTime() {
        return this.elements.mobileTotalTime;
    }
    
    // Legacy utility method (routed through Utils module)
    formatTime(seconds) {
        return Utils.formatTime(seconds);
    }
    
    // Legacy mobile methods for backward compatibility
    updateMobileThumbPosition() {
        if (this.domHandler && this.elements.audio) {
            this.domHandler.updateMobileThumbPosition(
                this.elements.audio.currentTime,
                this.elements.audio.duration
            );
        }
    }
    
    updateMobileThumbIcon() {
        if (this.domHandler) {
            this.domHandler.updatePlayPauseDisplay(this.isPlaying);
        }
    }
    
    setupEventListeners() {
        console.log('🔄 setupEventListeners called - handled by EventHandler module');
    }
    
    setupDragFunctionality() {
        console.log('🔄 setupDragFunctionality called - handled by EventHandler module');
    }
    
    setupResponsiveHandling() {
        console.log('🔄 setupResponsiveHandling called - handled by EventHandler module');
    }
    
    setupEnhancedMobileSlider() {
        console.log('🔄 setupEnhancedMobileSlider called - handled by EventHandler module');
    }
    
    updatePlayerVisibility() {
        if (this.domHandler) {
            this.domHandler.updatePlayerVisibility();
        }
    }
    
    /* ========================================
       CLEANUP & DESTRUCTION
       ======================================== */
    
    destroy() {
        try {
            if (this.eventHandler) {
                this.eventHandler.destroy();
            }
            if (this.audioEngine) {
                this.audioEngine.destroy();
            }
            if (this.domHandler) {
                this.domHandler.destroy();
            }
            
            console.log('🧹 MODULAR v2.0: Player destroyed successfully');
            
        } catch (error) {
            console.error('❌ Error destroying player:', error);
        }
    }
}

// Export for ES6 modules
export { MusicPlayer };

// Global assignment for HTML compatibility
window.MusicPlayer = MusicPlayer;

// Enhanced version identifier
console.log('🚀 MODULAR v2.0: Music Player loaded with Phase 2 modules (DOM, Config, Events)');
