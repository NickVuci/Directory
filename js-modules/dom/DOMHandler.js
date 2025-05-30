/**
 * DOM Handler Module
 * Centralizes all DOM manipulation, element management, and display updates
 * 
 * @author GitHub Copilot
 * @version 2.0.0 - Phase 2
 * @since 2025-05-30
 */

import { Utils } from '../utils/Utils.js';
import { Configuration, getConfig, getElementId, getCssClass } from '../config/Configuration.js';

/**
 * DOM Handler Class
 * Manages all DOM operations and element interactions
 */
export class DOMHandler {
    /**
     * Initialize DOM Handler
     * @param {Object} elements - Pre-initialized elements object (optional)
     */
    constructor(elements = null) {
        this.elements = {};
        this.isInitialized = false;
        this.isMobile = window.innerWidth <= getConfig('responsive.mobileBreakpoint', 768);
        
        // Initialize elements
        if (elements) {
            this.elements = elements;
            this.isInitialized = this.validateElements();
        } else {
            this.initializeElements();
        }
    }

    /**
     * Initialize all required DOM elements
     * @returns {boolean} True if all elements found
     */
    initializeElements() {
        const elementIds = getConfig('elementIds');
        
        // Desktop player elements
        this.elements.audio = this.getElement(elementIds.audio);
        this.elements.player = this.getElement(elementIds.player);
        this.elements.playPause = this.getElement(elementIds.playPause);
        this.elements.progress = this.getElement(elementIds.progress);
        this.elements.volume = this.getElement(elementIds.volume);
        this.elements.trackTitle = this.getElement(elementIds.trackTitle);
        this.elements.trackArtist = this.getElement(elementIds.trackArtist);
        this.elements.currentTime = this.getElement(elementIds.currentTime);
        this.elements.totalTime = this.getElement(elementIds.totalTime);
        
        // Mobile player elements
        this.elements.mobilePlayer = this.getElement(elementIds.mobilePlayer);
        this.elements.mobileProgress = this.getElement(elementIds.mobileProgress);
        this.elements.mobileThumb = this.getElement(elementIds.mobileThumb);
        this.elements.mobileTitle = this.getElement(elementIds.mobileTitle);
        this.elements.mobileTuning = this.getElement(elementIds.mobileTuning);
        this.elements.mobileCurrentTime = this.getElement(elementIds.mobileCurrentTime);
        this.elements.mobileTotalTime = this.getElement(elementIds.mobileTotalTime);
        
        this.isInitialized = this.validateElements();
        return this.isInitialized;
    }

    /**
     * Safely get DOM element with error handling
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null if not found
     */
    getElement(id) {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`DOMHandler: Element not found: ${id}`);
            }
            return element;
        } catch (error) {
            console.error(`DOMHandler: Error getting element ${id}:`, error);
            return null;
        }
    }

    /**
     * Validate that critical elements exist
     * @returns {boolean} True if validation passes
     */
    validateElements() {
        const criticalElements = ['audio', 'player'];
        const missing = criticalElements.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            console.error('DOMHandler: Missing critical elements:', missing);
            return false;
        }
        
        return true;
    }

    /**
     * Update time displays (both desktop and mobile)
     * @param {number} currentTime - Current playback time in seconds
     * @param {number} duration - Total duration in seconds
     */
    updateTimeDisplay(currentTime, duration) {
        if (!this.isInitialized) return;
        
        try {
            const formattedCurrent = Utils.formatTime(currentTime);
            const formattedDuration = Utils.formatTime(duration);
            
            // Update desktop displays
            if (this.elements.currentTime) {
                this.elements.currentTime.textContent = formattedCurrent;
            }
            if (this.elements.totalTime) {
                this.elements.totalTime.textContent = formattedDuration;
            }
            
            // Update mobile displays
            if (this.elements.mobileCurrentTime) {
                this.elements.mobileCurrentTime.textContent = formattedCurrent;
            }
            if (this.elements.mobileTotalTime) {
                this.elements.mobileTotalTime.textContent = formattedDuration;
            }
            
        } catch (error) {
            console.error('DOMHandler: Error updating time display:', error);
        }
    }

    /**
     * Update progress bars (both desktop and mobile)
     * @param {number} currentTime - Current playback time
     * @param {number} duration - Total duration
     */
    updateProgressDisplay(currentTime, duration) {
        if (!this.isInitialized) return;
        
        try {
            // Update desktop progress
            if (this.elements.progress) {
                this.elements.progress.value = currentTime;
                this.elements.progress.max = duration;
            }
            
            // Update mobile progress
            if (this.elements.mobileProgress) {
                this.elements.mobileProgress.value = currentTime;
                this.elements.mobileProgress.max = duration;
            }
            
        } catch (error) {
            console.error('DOMHandler: Error updating progress display:', error);
        }
    }

    /**
     * Update play/pause button states
     * @param {boolean} isPlaying - Whether audio is currently playing
     */
    updatePlayPauseDisplay(isPlaying) {
        if (!this.isInitialized) return;
        
        try {
            const icon = isPlaying ? '⏸' : '▶';
            
            // Update desktop button
            if (this.elements.playPause) {
                this.elements.playPause.textContent = icon;
            }
            
            // Update mobile thumb icon (if it exists)
            if (this.elements.mobileThumb) {
                this.elements.mobileThumb.textContent = icon;
                this.elements.mobileThumb.classList.toggle(getCssClass('playing'), isPlaying);
            }
            
            // Update mobile progress bar playing state
            if (this.elements.mobileProgress) {
                this.elements.mobileProgress.classList.toggle(getCssClass('playing'), isPlaying);
            }
            
        } catch (error) {
            console.error('DOMHandler: Error updating play/pause display:', error);
        }
    }

    /**
     * Update track information displays
     * @param {Object} track - Track object with title, artist, tuning, etc.
     */
    updateTrackDisplay(track) {
        if (!this.isInitialized || !track) return;
        
        try {
            const title = track.title || 'No track selected';
            const artist = track.artist || 'Unknown artist';
            const tuning = track.tuning || 'Unknown tuning';
            
            // Update desktop displays
            if (this.elements.trackTitle) {
                this.elements.trackTitle.textContent = title;
            }
            if (this.elements.trackArtist) {
                this.elements.trackArtist.textContent = artist;
            }
            
            // Update mobile displays
            if (this.elements.mobileTitle) {
                this.elements.mobileTitle.textContent = title;
            }
            if (this.elements.mobileTuning) {
                this.elements.mobileTuning.textContent = tuning;
            }
            
        } catch (error) {
            console.error('DOMHandler: Error updating track display:', error);
        }
    }

    /**
     * Update mobile slider thumb position
     * @param {number} currentTime - Current playback time
     * @param {number} duration - Total duration
     */
    updateMobileThumbPosition(currentTime, duration) {
        if (!this.elements.mobileThumb || !this.elements.mobileProgress) return;
        
        try {
            const value = currentTime || 0;
            const max = duration || 100;
            const min = 0;
            
            // Calculate percentage
            const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;
            
            // Position the thumb using percentage (CSS will handle the transform)
            this.elements.mobileThumb.style.left = `${Utils.clamp(percentage, 0, 100)}%`;
            
        } catch (error) {
            console.error('DOMHandler: Error updating mobile thumb position:', error);
        }
    }

    /**
     * Update volume display
     * @param {number} volume - Volume level (0-1)
     */
    updateVolumeDisplay(volume) {
        if (!this.isInitialized) return;
        
        try {
            if (this.elements.volume) {
                this.elements.volume.value = volume * 100;
            }
        } catch (error) {
            console.error('DOMHandler: Error updating volume display:', error);
        }
    }

    /**
     * Show error state in UI
     * @param {string} message - Error message to display
     */
    showErrorState(message = 'Error loading track') {
        if (!this.isInitialized) return;
        
        try {
            const errorTuning = 'No tuning';
            
            // Update desktop displays
            if (this.elements.trackTitle) {
                this.elements.trackTitle.textContent = message;
            }
            if (this.elements.trackArtist) {
                this.elements.trackArtist.textContent = errorTuning;
            }
            
            // Update mobile displays
            if (this.elements.mobileTitle) {
                this.elements.mobileTitle.textContent = message;
            }
            if (this.elements.mobileTuning) {
                this.elements.mobileTuning.textContent = errorTuning;
            }
            
        } catch (error) {
            console.error('DOMHandler: Error showing error state:', error);
        }
    }

    /**
     * Reset player display to initial state
     */
    resetPlayerDisplay() {
        if (!this.isInitialized) return;
        
        try {
            // Reset track info
            this.updateTrackDisplay({
                title: 'No track selected',
                artist: 'No artist',
                tuning: 'No tuning'
            });
            
            // Reset time displays
            this.updateTimeDisplay(0, 0);
            
            // Reset progress
            this.updateProgressDisplay(0, 0);
            
            // Reset play state
            this.updatePlayPauseDisplay(false);
            
            // Reset mobile thumb position
            this.updateMobileThumbPosition(0, 100);
            
        } catch (error) {
            console.error('DOMHandler: Error resetting player display:', error);
        }
    }

    /**
     * Toggle player visibility based on mobile/desktop mode
     */
    updatePlayerVisibility() {
        if (!this.isInitialized) return;
        
        try {
            const isMobile = this.isMobile;
            
            if (isMobile) {
                // Show mobile, hide desktop
                if (this.elements.mobilePlayer) {
                    this.elements.mobilePlayer.style.display = 'block';
                }
                if (this.elements.player) {
                    this.elements.player.style.display = 'none';
                }
            } else {
                // Show desktop, hide mobile
                if (this.elements.mobilePlayer) {
                    this.elements.mobilePlayer.style.display = 'none';
                }
                if (this.elements.player) {
                    this.elements.player.style.display = 'block';
                }
            }
            
        } catch (error) {
            console.error('DOMHandler: Error updating player visibility:', error);
        }
    }

    /**
     * Toggle collapsed state of desktop player
     */
    toggleCollapsed() {
        if (!this.elements.player) return;
        
        try {
            const collapsedClass = getCssClass('collapsed');
            this.elements.player.classList.toggle(collapsedClass);
            return this.elements.player.classList.contains(collapsedClass);
        } catch (error) {
            console.error('DOMHandler: Error toggling collapsed state:', error);
            return false;
        }
    }

    /**
     * Set dragging state for desktop player
     * @param {boolean} isDragging - Whether player is being dragged
     */
    setDraggingState(isDragging) {
        if (!this.elements.player) return;
        
        try {
            const draggingClass = getCssClass('dragging');
            if (isDragging) {
                this.elements.player.classList.add(draggingClass);
                this.elements.player.style.transition = getConfig('desktop.dragTransition', 'none');
            } else {
                this.elements.player.classList.remove(draggingClass);
                this.elements.player.style.transition = '';
            }
        } catch (error) {
            console.error('DOMHandler: Error setting dragging state:', error);
        }
    }

    /**
     * Update responsive state
     */
    updateResponsiveState() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= getConfig('responsive.mobileBreakpoint', 768);
        
        if (wasMobile !== this.isMobile) {
            this.updatePlayerVisibility();
            return true; // State changed
        }
        return false; // No change
    }

        /**
     * Handle iOS viewport adjustments for Safari browser controls
     */
    handleIOSViewportAdjustment() {
        if (!this.isMobile) return;
        
        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (!isIOS) return;
        
        const mobilePlayer = this.elements.mobilePlayer;
        if (!mobilePlayer) return;
        
        // Function to adjust player position
        const adjustPlayerPosition = () => {
            // Get the actual viewport height
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Calculate safe top position (above browser controls)
            const safeTop = Math.max(
                20, // Minimum for status bar
                window.screen.height - window.innerHeight // Browser controls height
            );
            
            mobilePlayer.style.top = `${safeTop}px`;
            mobilePlayer.style.paddingTop = `${Math.max(10, safeTop)}px`;
        };
        
        // Adjust on load
        adjustPlayerPosition();
        
        // Adjust when viewport changes (browser controls show/hide)
        window.addEventListener('resize', adjustPlayerPosition);
        window.addEventListener('orientationchange', () => {
            setTimeout(adjustPlayerPosition, 500); // Delay for orientation change
        });
        
        // Listen for scroll to detect browser controls hiding/showing
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Browser controls likely changed if significant height change without scroll
            if (Math.abs(currentScrollY - lastScrollY) < 10) {
                setTimeout(adjustPlayerPosition, 100);
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }

    /**
     * Get all elements (read-only)
     * @returns {Object} Elements object
     */
    getElements() {
        return { ...this.elements };
    }

    /**
     * Check if DOM handler is initialized
     * @returns {boolean} Initialization status
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Clean up DOM handler
     */
    destroy() {
        this.elements = {};
        this.isInitialized = false;
    }
}

export default DOMHandler;
