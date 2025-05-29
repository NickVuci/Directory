/* ==========================================
   MUSIC PLAYER CLASS
   ========================================== */

// Music Player Functionality
class MusicPlayer {
    /* ========================================
       CONSTRUCTOR & INITIALIZATION
       ======================================== */
    
    constructor() {
        // Desktop player elements
        this.audio = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progressBar');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.trackTitle = document.getElementById('trackTitle');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        this.playerElement = document.getElementById('musicPlayer');
        
        // Mobile player elements
        this.mobilePlayerElement = document.getElementById('mobileMusicPlayer');
        this.mobileProgressBar = document.getElementById('mobileProgressBar');
        this.mobileSliderThumb = document.getElementById('mobileSliderThumb');
        this.mobileTrackTitle = document.getElementById('mobileTrackTitle');
        this.mobileTrackTuning = document.getElementById('mobileTrackTuning');
        this.mobileCurrentTime = document.getElementById('mobileCurrentTime');        this.mobileTotalTime = document.getElementById('mobileTotalTime');
        
        // Configuration & State
        this.tracks = window.TRACKS || []; // Load tracks from external file
        this.currentTrackIndex = 0;
        this.isCollapsed = true;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isPlaying = false; // Track if we're in active playback mode
        this.isMobile = window.innerWidth <= 768;
        
        // Initialize all components
        this.initializePlayer();
        this.setupEventListeners();
        this.setupDragFunctionality();
        this.setupResponsiveHandling();
        this.setupEnhancedMobileSlider();    }
    
    /* ========================================
       CORE INITIALIZATION METHODS
       ======================================== */
    
    initializePlayer() {
        // Set initial volume
        this.audio.volume = 0.5;
        
        // Load first track
        this.loadTrack(0);
        
        // Start collapsed on desktop
        if (!this.isMobile) {
            document.getElementById('musicPlayer').classList.add('collapsed');
        }        // Show appropriate player based on screen size
        this.updatePlayerVisibility();
        
        // Setup enhanced mobile slider functionality
        this.setupEnhancedMobileSlider();
        
        // Initialize mobile thumb position and icon
        if (this.mobileSliderThumb) {
            this.updateMobileThumbPosition();
            this.updateMobileThumbIcon();
        }
        
        // Show initial hint flash for mobile users
        if (this.isMobile) {
            this.showInitialHint();
        }
    }
    
    showInitialHint() {
        setTimeout(() => {
            const hint = document.querySelector('.mobile-progress-hint');
            if (hint) {
                hint.style.animation = 'hintFlash 3s ease-in-out';
                setTimeout(() => {
                    hint.style.animation = '';
                }, 3000);
            }        }, 1000);
    }
    
    /* ========================================
       RESPONSIVE HANDLING
       ======================================== */

    setupResponsiveHandling() {
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.updatePlayerVisibility();
            }
        });
    }
    
    updatePlayerVisibility() {
        if (this.isMobile) {
            if (this.mobilePlayerElement) this.mobilePlayerElement.style.display = 'block';
            this.playerElement.style.display = 'none';
        } else {
            if (this.mobilePlayerElement) this.mobilePlayerElement.style.display = 'none';
            this.playerElement.style.display = 'block';        }
    }
    
    /* ========================================
       AUDIO EVENT LISTENERS
       ======================================== */
      
    setupEventListeners() {
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => {
            this.totalTime.textContent = this.formatTime(this.audio.duration);
            this.progressBar.max = this.audio.duration;
            
            // Update mobile elements too
            if (this.mobileTotalTime) {
                this.mobileTotalTime.textContent = this.formatTime(this.audio.duration);
                this.mobileProgressBar.max = this.audio.duration;
                
                // Update mobile thumb position and icon
                this.updateMobileThumbPosition();
                this.updateMobileThumbIcon();
            }
        });
          this.audio.addEventListener('timeupdate', () => {
            this.currentTime.textContent = this.formatTime(this.audio.currentTime);
            this.progressBar.value = this.audio.currentTime;
            
            // Update mobile elements too
            if (this.mobileCurrentTime) {
                this.mobileCurrentTime.textContent = this.formatTime(this.audio.currentTime);
                this.mobileProgressBar.value = this.audio.currentTime;
                
                // Update mobile thumb position
                this.updateMobileThumbPosition();
            }
        });
        
        this.audio.addEventListener('ended', () => {
            // Auto-advance to next track and continue playing
            this.nextTrack(true);
        });
          this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.playPauseBtn.textContent = '⏸';
            if (this.mobilePlayPauseBtn) {
                this.mobilePlayPauseBtn.textContent = '⏸';
            }
            // Update mobile thumb icon
            this.updateMobileThumbIcon();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.playPauseBtn.textContent = '▶';
            if (this.mobilePlayPauseBtn) {
                this.mobilePlayPauseBtn.textContent = '▶';
            }
            // Update mobile thumb icon
            this.updateMobileThumbIcon();
        });
          this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.trackTitle.textContent = 'Error loading track';
            if (this.mobileTrackTitle) {
                this.mobileTrackTitle.textContent = 'Error loading track';
                if (this.mobileTrackTuning) {
                    this.mobileTrackTuning.textContent = 'No tuning';
                }
            }        });
    }

    /* ========================================
       DESKTOP PLAYER DRAG FUNCTIONALITY
       ======================================== */

    setupDragFunctionality() {
        let startX, startY, initialX, initialY, hasMoved;
        
        const handleMouseDown = (e) => {
            // Prevent dragging when clicking on controls, sliders, or collapse button
            if (e.target.closest('.player-controls') || 
                e.target.closest('.player-progress') || 
                e.target.closest('.volume-control') ||
                e.target.matches('.progress-bar') ||
                e.target.matches('.volume-slider') ||
                e.target.closest('.collapse-btn')) {
                return;
            }
            
            this.isDragging = true;
            hasMoved = false;
            this.playerElement.style.transition = 'none';
            this.playerElement.classList.add('dragging');
            
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.playerElement.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            e.preventDefault();
        };
        
        const handleMouseMove = (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                hasMoved = true;
            }
            
            let newX = initialX + deltaX;
            let newY = initialY + deltaY;
            
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            const playerRect = this.playerElement.getBoundingClientRect();
            
            newX = Math.max(0, Math.min(newX, viewport.width - playerRect.width));
            newY = Math.max(0, Math.min(newY, viewport.height - playerRect.height));
            
            this.playerElement.style.left = `${newX}px`;
            this.playerElement.style.top = `${newY}px`;
            this.playerElement.style.right = 'auto';
            this.playerElement.style.bottom = 'auto';
        };

        const handleMouseUp = () => {
            this.isDragging = false;
            this.playerElement.classList.remove('dragging');
            
            if (!hasMoved && this.isCollapsed) {
                this.togglePlayer();
            }
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        // Touch events for mobile
        const handleTouchStart = (e) => {
            if (e.target.closest('.player-controls') || 
                e.target.closest('.player-progress') || 
                e.target.closest('.volume-control') ||
                e.target.matches('.progress-bar') ||
                e.target.matches('.volume-slider') ||
                e.target.closest('.collapse-btn')) {
                return;
            }
            
            const touch = e.touches[0];
            handleMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault()
            });
        };
        
        const handleTouchMove = (e) => {
            if (!this.isDragging) return;
            const touch = e.touches[0];
            handleMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            e.preventDefault();
        };
        
        const handleTouchEnd = () => {
            handleMouseUp();
        };
        
        // Add event listeners only for desktop player
        if (!this.isMobile) {
            this.playerElement.addEventListener('mousedown', handleMouseDown);
            this.playerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
            this.playerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
            this.playerElement.addEventListener('touchend', handleTouchEnd);
            this.playerElement.style.cursor = 'move';        }
    }
    
    /* ========================================
       BASIC PLAYER CONTROLS
       ======================================== */
      togglePlayer() {
        this.playerElement.classList.toggle('collapsed');
        this.isCollapsed = !this.isCollapsed;
    }
    
    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play();
            this.playPauseBtn.textContent = '⏸';
            // Add playing state visual feedback to mobile slider
            if (this.mobileProgressBar) {
                this.mobileProgressBar.classList.add('playing');
            }
            // Update mobile thumb icon
            this.updateMobileThumbIcon();
        } else {
            this.audio.pause();
            this.playPauseBtn.textContent = '▶';
            // Remove playing state visual feedback
            if (this.mobileProgressBar) {
                this.mobileProgressBar.classList.remove('playing');
            }
            // Update mobile thumb icon
            this.updateMobileThumbIcon();
        }
    }
    
    /* ========================================
       TRACK MANAGEMENT & NAVIGATION
       ======================================== */
      
    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            this.currentTrackIndex = index;
            const track = this.tracks[index];
            this.audio.src = track.src;
            this.trackTitle.textContent = track.title;
            this.playPauseBtn.textContent = '▶';
            
            // Update mobile player too
            if (this.mobileTrackTitle) {
                this.mobileTrackTitle.textContent = track.title;
                
                // Set tuning information
                if (this.mobileTrackTuning) {
                    this.mobileTrackTuning.textContent = track.tuning || 'Unknown tuning';
                }
            }
        }
    }    nextTrack(autoAdvance = false) {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(nextIndex);
        
        // Auto-play if this is an auto-advance (song ended) or if music was already playing
        if (autoAdvance || this.isPlaying) {
            this.audio.play().catch(e => {
                console.error('Auto-play error:', e);
            });
            this.playPauseBtn.textContent = '⏸';
            if (this.mobilePlayPauseBtn) {
                this.mobilePlayPauseBtn.textContent = '⏸';
            }
            this.isPlaying = true;
        }
    }
    
    previousTrack() {
        const prevIndex = this.currentTrackIndex === 0 
            ? this.tracks.length - 1 
            : this.currentTrackIndex - 1;
        this.loadTrack(prevIndex);
        
        // Auto-play if music was already playing
        if (this.isPlaying) {
            this.audio.play().catch(e => {
                console.error('Auto-play error:', e);
            });
            this.playPauseBtn.textContent = '⏸';
            if (this.mobilePlayPauseBtn) {
                this.mobilePlayPauseBtn.textContent = '⏸';
            }
        }
    }
    
    /* ========================================
       MOBILE PLAYER ENHANCED CONTROLS
       ======================================== */    
    // Enhanced mobile progress bar with play/pause functionality
    setupEnhancedMobileSlider() {
        if (!this.mobileProgressBar || !this.mobileSliderThumb) return;
        
        let isDragging = false;
        let wasPlaying = false;
        
        // Initialize thumb position and icon
        this.updateMobileThumbPosition();
        this.updateMobileThumbIcon();
        
        // Handle touch start - determine if this is a play/pause tap or drag start
        this.mobileProgressBar.addEventListener('touchstart', (e) => {
            isDragging = false;
            wasPlaying = !this.audio.paused;
            
            // Add visual feedback
            this.mobileProgressBar.classList.add('active');
            if (this.mobileSliderThumb) {
                this.mobileSliderThumb.classList.add('active');
            }
            
            // Show hint
            const hint = this.mobileProgressBar.parentElement.querySelector('.mobile-progress-hint');
            if (hint) hint.style.opacity = '1';
        });
        
        // Handle touch move - this indicates dragging for seek
        this.mobileProgressBar.addEventListener('touchmove', (e) => {
            isDragging = true;
            // Pause during drag for better performance
            if (!this.audio.paused) {
                this.audio.pause();
            }
        });
        
        // Handle touch end - determine final action
        this.mobileProgressBar.addEventListener('touchend', (e) => {
            this.mobileProgressBar.classList.remove('active');
            if (this.mobileSliderThumb) {
                this.mobileSliderThumb.classList.remove('active');
            }
            
            // Hide hint
            const hint = this.mobileProgressBar.parentElement.querySelector('.mobile-progress-hint');
            if (hint) {
                setTimeout(() => {
                    hint.style.opacity = '0';
                }, 1000);
            }
            
            if (!isDragging) {
                // This was a tap, not a drag - toggle play/pause
                this.togglePlayPause();
                
                // Add haptic feedback on supported devices
                if (navigator.vibrate) {
                    navigator.vibrate(50); // Brief vibration
                }
            } else {
                // This was a drag - seek occurred, restore play state if needed
                if (wasPlaying) {
                    setTimeout(() => {
                        this.audio.play();
                    }, 100);
                }
            }
            
            isDragging = false;
        });
        
        // Handle mouse events for desktop testing
        this.mobileProgressBar.addEventListener('click', (e) => {
            // Small delay to distinguish from drag
            setTimeout(() => {
                if (!isDragging) {
                    this.togglePlayPause();
                }
            }, 50);
        });
    }
    
    /* ========================================
       MOBILE THUMB POSITION & ICON UPDATES
       ======================================== */    
    // Update mobile slider thumb position based on current progress
    updateMobileThumbPosition() {
        if (!this.mobileProgressBar || !this.mobileSliderThumb) return;
        
        const slider = this.mobileProgressBar;
        const thumb = this.mobileSliderThumb;
        const value = parseFloat(slider.value) || 0;
        const max = parseFloat(slider.max) || 100;
        const min = parseFloat(slider.min) || 0;
        
        // Calculate percentage
        const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;
        
        // Position the thumb using percentage (CSS will handle the transform)
        thumb.style.left = `${Math.max(0, Math.min(100, percentage))}%`;
    }
    
    // Update mobile slider thumb icon based on play/pause state
    updateMobileThumbIcon() {
        if (!this.mobileSliderThumb) return;
        
        const thumb = this.mobileSliderThumb;
        const isPlaying = !this.audio.paused;
        
        // Update icon
        thumb.textContent = isPlaying ? '⏸' : '▶';
        
        // Update state classes
        thumb.classList.toggle('playing', isPlaying);
    }
    
    /* ========================================
       UTILITY FUNCTIONS
       ======================================== */
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}
