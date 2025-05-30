/**
 * Event Handler Module
 * Centralizes all event handling for touch, mouse, keyboard, and audio events
 * 
 * @author GitHub Copilot
 * @version 2.0.0 - Phase 2
 * @since 2025-05-30
 */

import { Configuration, getConfig, getCssClass } from '../config/Configuration.js';

/**
 * Event Handler Class
 * Manages all event listeners and interactions
 */
export class EventHandler {
    /**
     * Initialize Event Handler
     * @param {Object} elements - DOM elements object
     * @param {Object} callbacks - Callback functions object
     */
    constructor(elements, callbacks = {}) {
        this.elements = elements;
        this.callbacks = callbacks;
        this.isInitialized = false;
        this.isMobile = window.innerWidth <= getConfig('responsive.mobileBreakpoint', 768);
        
        // State tracking
        this.dragState = {
            isDragging: false,
            startX: 0,
            startY: 0,
            initialX: 0,
            initialY: 0,
            hasMoved: false
        };
        
        this.mobileSliderState = {
            isDragging: false,
            wasPlaying: false
        };
        
        // Bound event handlers for proper cleanup
        this.boundHandlers = {};
        
        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        try {
            this.setupAudioEventListeners();
            this.setupDesktopDragEventListeners();
            this.setupMobileSliderEventListeners();
            this.setupResponsiveEventListeners();
            this.isInitialized = true;
        } catch (error) {
            console.error('EventHandler: Error initializing event listeners:', error);
        }
    }

    /**
     * Setup audio-related event listeners
     */
    setupAudioEventListeners() {
        if (!this.elements.audio) return;
        
        // Loadedmetadata event
        this.boundHandlers.loadedmetadata = () => {
            if (this.callbacks.onLoadedMetadata) {
                this.callbacks.onLoadedMetadata(this.elements.audio.duration);
            }
        };
        
        // Timeupdate event
        this.boundHandlers.timeupdate = () => {
            if (this.callbacks.onTimeUpdate) {
                this.callbacks.onTimeUpdate(
                    this.elements.audio.currentTime,
                    this.elements.audio.duration
                );
            }
        };
        
        // Ended event
        this.boundHandlers.ended = () => {
            if (this.callbacks.onEnded) {
                this.callbacks.onEnded();
            }
        };
        
        // Play event
        this.boundHandlers.play = () => {
            if (this.callbacks.onPlay) {
                this.callbacks.onPlay();
            }
        };
        
        // Pause event
        this.boundHandlers.pause = () => {
            if (this.callbacks.onPause) {
                this.callbacks.onPause();
            }
        };
        
        // Error event
        this.boundHandlers.error = (e) => {
            console.error('Audio error:', e);
            if (this.callbacks.onError) {
                this.callbacks.onError(e);
            }
        };
        
        // Attach audio event listeners
        this.elements.audio.addEventListener('loadedmetadata', this.boundHandlers.loadedmetadata);
        this.elements.audio.addEventListener('timeupdate', this.boundHandlers.timeupdate);
        this.elements.audio.addEventListener('ended', this.boundHandlers.ended);
        this.elements.audio.addEventListener('play', this.boundHandlers.play);
        this.elements.audio.addEventListener('pause', this.boundHandlers.pause);
        this.elements.audio.addEventListener('error', this.boundHandlers.error);
    }

    /**
     * Setup desktop drag functionality
     */
    setupDesktopDragEventListeners() {
        if (!this.elements.player || this.isMobile) return;
        
        const minDistance = getConfig('desktop.minDistance', 5);
        
        // Mouse down handler
        this.boundHandlers.mouseDown = (e) => {
            // Prevent dragging when clicking on controls
            if (this.isControlElement(e.target)) return;
            
            this.dragState.isDragging = true;
            this.dragState.hasMoved = false;
            this.dragState.startX = e.clientX;
            this.dragState.startY = e.clientY;
            
            const rect = this.elements.player.getBoundingClientRect();
            this.dragState.initialX = rect.left;
            this.dragState.initialY = rect.top;
            
            if (this.callbacks.onDragStart) {
                this.callbacks.onDragStart();
            }
            
            document.addEventListener('mousemove', this.boundHandlers.mouseMove);
            document.addEventListener('mouseup', this.boundHandlers.mouseUp);
            
            e.preventDefault();
        };
        
        // Mouse move handler
        this.boundHandlers.mouseMove = (e) => {
            if (!this.dragState.isDragging) return;
            
            const deltaX = e.clientX - this.dragState.startX;
            const deltaY = e.clientY - this.dragState.startY;
            
            if (Math.abs(deltaX) > minDistance || Math.abs(deltaY) > minDistance) {
                this.dragState.hasMoved = true;
            }
            
            const newX = this.dragState.initialX + deltaX;
            const newY = this.dragState.initialY + deltaY;
            
            // Constrain to viewport
            const constrainedPos = this.constrainToViewport(newX, newY);
            
            if (this.callbacks.onDragMove) {
                this.callbacks.onDragMove(constrainedPos.x, constrainedPos.y);
            }
        };
        
        // Mouse up handler
        this.boundHandlers.mouseUp = () => {
            const wasDragging = this.dragState.isDragging;
            const hasMoved = this.dragState.hasMoved;
            
            this.dragState.isDragging = false;
            
            if (this.callbacks.onDragEnd) {
                this.callbacks.onDragEnd(wasDragging, hasMoved);
            }
            
            document.removeEventListener('mousemove', this.boundHandlers.mouseMove);
            document.removeEventListener('mouseup', this.boundHandlers.mouseUp);
        };
        
        // Touch handlers for desktop player
        this.boundHandlers.touchStart = (e) => {
            if (this.isControlElement(e.target)) return;
            
            const touch = e.touches[0];
            this.boundHandlers.mouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault()
            });
        };
        
        this.boundHandlers.touchMove = (e) => {
            if (!this.dragState.isDragging) return;
            const touch = e.touches[0];
            this.boundHandlers.mouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            e.preventDefault();
        };
        
        this.boundHandlers.touchEnd = () => {
            this.boundHandlers.mouseUp();
        };
        
        // Attach desktop drag event listeners
        this.elements.player.addEventListener('mousedown', this.boundHandlers.mouseDown);
        this.elements.player.addEventListener('touchstart', this.boundHandlers.touchStart, { passive: false });
        this.elements.player.addEventListener('touchmove', this.boundHandlers.touchMove, { passive: false });
        this.elements.player.addEventListener('touchend', this.boundHandlers.touchEnd);
        
        // Set cursor style
        this.elements.player.style.cursor = 'move';
    }

    /**
     * Setup mobile slider event listeners
     */
    setupMobileSliderEventListeners() {
        if (!this.elements.mobileProgress || !this.isMobile) return;
        
        // Touch start handler
        this.boundHandlers.mobileSliderTouchStart = (e) => {
            this.mobileSliderState.isDragging = false;
            this.mobileSliderState.wasPlaying = this.elements.audio && !this.elements.audio.paused;
            
            // Add visual feedback
            this.addMobileSliderActiveState();
            
            // Show hint
            this.showMobileSliderHint();
        };
        
        // Touch move handler
        this.boundHandlers.mobileSliderTouchMove = (e) => {
            this.mobileSliderState.isDragging = true;
            
            // Pause during drag for better performance
            if (this.elements.audio && !this.elements.audio.paused) {
                this.elements.audio.pause();
            }
        };
        
        // Touch end handler
        this.boundHandlers.mobileSliderTouchEnd = (e) => {
            this.removeMobileSliderActiveState();
            this.hideMobileSliderHint();
            
            if (!this.mobileSliderState.isDragging) {
                // This was a tap - toggle play/pause
                if (this.callbacks.onMobileSliderTap) {
                    this.callbacks.onMobileSliderTap();
                }
                
                // Add haptic feedback
                this.triggerHapticFeedback();
            } else {
                // This was a drag - restore play state if needed
                if (this.mobileSliderState.wasPlaying && this.callbacks.onMobileSliderSeekEnd) {
                    setTimeout(() => {
                        this.callbacks.onMobileSliderSeekEnd();
                    }, 100);
                }
            }
            
            this.mobileSliderState.isDragging = false;
        };
        
        // Mouse click handler for desktop testing
        this.boundHandlers.mobileSliderClick = (e) => {
            setTimeout(() => {
                if (!this.mobileSliderState.isDragging && this.callbacks.onMobileSliderTap) {
                    this.callbacks.onMobileSliderTap();
                }
            }, 50);
        };
        
        // Attach mobile slider event listeners
        this.elements.mobileProgress.addEventListener('touchstart', this.boundHandlers.mobileSliderTouchStart);
        this.elements.mobileProgress.addEventListener('touchmove', this.boundHandlers.mobileSliderTouchMove);
        this.elements.mobileProgress.addEventListener('touchend', this.boundHandlers.mobileSliderTouchEnd);
        this.elements.mobileProgress.addEventListener('click', this.boundHandlers.mobileSliderClick);
    }

    /**
     * Setup responsive event listeners
     */
    setupResponsiveEventListeners() {
        this.boundHandlers.resize = () => {
            if (this.callbacks.onResize) {
                this.callbacks.onResize();
            }
        };
        
        window.addEventListener('resize', this.boundHandlers.resize);
    }

    /**
     * Check if element is a control element that should prevent dragging
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if it's a control element
     */
    isControlElement(element) {
        return element.closest('.player-controls') ||
               element.closest('.player-progress') ||
               element.closest('.volume-control') ||
               element.matches('.progress-bar') ||
               element.matches('.volume-slider') ||
               element.closest('.collapse-btn');
    }

    /**
     * Constrain position to viewport
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} Constrained position
     */
    constrainToViewport(x, y) {
        if (!this.elements.player) return { x, y };
        
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        const playerRect = this.elements.player.getBoundingClientRect();
        
        return {
            x: Math.max(0, Math.min(x, viewport.width - playerRect.width)),
            y: Math.max(0, Math.min(y, viewport.height - playerRect.height))
        };
    }

    /**
     * Add active state to mobile slider
     */
    addMobileSliderActiveState() {
        const activeClass = getCssClass('active');
        
        if (this.elements.mobileProgress) {
            this.elements.mobileProgress.classList.add(activeClass);
        }
        if (this.elements.mobileThumb) {
            this.elements.mobileThumb.classList.add(activeClass);
        }
    }

    /**
     * Remove active state from mobile slider
     */
    removeMobileSliderActiveState() {
        const activeClass = getCssClass('active');
        
        if (this.elements.mobileProgress) {
            this.elements.mobileProgress.classList.remove(activeClass);
        }
        if (this.elements.mobileThumb) {
            this.elements.mobileThumb.classList.remove(activeClass);
        }
    }

    /**
     * Show mobile slider hint
     */
    showMobileSliderHint() {
        if (!this.elements.mobileProgress) return;
        
        const hint = this.elements.mobileProgress.parentElement?.querySelector('.mobile-progress-hint');
        if (hint) {
            hint.style.opacity = '1';
        }
    }

    /**
     * Hide mobile slider hint
     */
    hideMobileSliderHint() {
        if (!this.elements.mobileProgress) return;
        
        const hint = this.elements.mobileProgress.parentElement?.querySelector('.mobile-progress-hint');
        if (hint) {
            const hintFadeDuration = getConfig('mobile.hintFadeDuration', 1000);
            setTimeout(() => {
                hint.style.opacity = '0';
            }, hintFadeDuration);
        }
    }

    /**
     * Trigger haptic feedback on supported devices
     */
    triggerHapticFeedback() {
        if (getConfig('responsive.enableHapticFeedback', true) && navigator.vibrate) {
            const duration = getConfig('responsive.vibrationDuration', 50);
            navigator.vibrate(duration);
        }
    }

    /**
     * Update responsive state
     */
    updateResponsiveState() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= getConfig('responsive.mobileBreakpoint', 768);
        
        if (wasMobile !== this.isMobile) {
            // Need to re-setup event listeners for new mode
            this.removeEventListeners();
            this.initializeEventListeners();
            return true;
        }
        return false;
    }

    /**
     * Remove all event listeners
     */
    removeEventListeners() {
        try {
            // Remove audio event listeners
            if (this.elements.audio) {
                const audioEvents = ['loadedmetadata', 'timeupdate', 'ended', 'play', 'pause', 'error'];
                audioEvents.forEach(event => {
                    if (this.boundHandlers[event]) {
                        this.elements.audio.removeEventListener(event, this.boundHandlers[event]);
                    }
                });
            }
            
            // Remove desktop drag event listeners
            if (this.elements.player) {
                const dragEvents = ['mousedown', 'touchstart', 'touchmove', 'touchend'];
                dragEvents.forEach(event => {
                    if (this.boundHandlers[event]) {
                        this.elements.player.removeEventListener(event, this.boundHandlers[event]);
                    }
                });
            }
            
            // Remove mobile slider event listeners
            if (this.elements.mobileProgress) {
                const sliderEvents = ['touchstart', 'touchmove', 'touchend', 'click'];
                sliderEvents.forEach(event => {
                    const handlerKey = event === 'click' ? 'mobileSliderClick' : `mobileSlider${event.charAt(0).toUpperCase()}${event.slice(1)}`;
                    if (this.boundHandlers[handlerKey]) {
                        this.elements.mobileProgress.removeEventListener(event, this.boundHandlers[handlerKey]);
                    }
                });
            }
            
            // Remove document event listeners
            const documentEvents = ['mousemove', 'mouseup'];
            documentEvents.forEach(event => {
                if (this.boundHandlers[event]) {
                    document.removeEventListener(event, this.boundHandlers[event]);
                }
            });
            
            // Remove window event listeners
            if (this.boundHandlers.resize) {
                window.removeEventListener('resize', this.boundHandlers.resize);
            }
            
        } catch (error) {
            console.error('EventHandler: Error removing event listeners:', error);
        }
    }

    /**
     * Get current drag state
     * @returns {Object} Drag state
     */
    getDragState() {
        return { ...this.dragState };
    }

    /**
     * Get current mobile slider state
     * @returns {Object} Mobile slider state
     */
    getMobileSliderState() {
        return { ...this.mobileSliderState };
    }

    /**
     * Check if event handler is initialized
     * @returns {boolean} Initialization status
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Clean up event handler
     */
    destroy() {
        this.removeEventListeners();
        this.boundHandlers = {};
        this.isInitialized = false;
    }
}

export default EventHandler;
