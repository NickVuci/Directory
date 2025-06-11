/**
 * Utils Module - Shared Utility Functions
 * 
 * Provides common utility functions used across the music player
 * application. This module encapsulates helper functions for
 * formatting, validation, and device detection.
 * 
 * @author Nick Vuci
 * @version 1.0.0
 * @date May 30, 2025
 */

export const Utils = {
    /**
     * Format time in seconds to MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string (MM:SS)
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Detect if the current device is mobile based on viewport width
     * @returns {boolean} - True if mobile device
     */
    isMobileDevice() {
        return window.innerWidth <= 768;
    },
    
    /**
     * Validate that a DOM element exists and is accessible
     * @param {HTMLElement|null} element - Element to validate
     * @param {string} elementName - Name of element for error reporting
     * @returns {boolean} - True if element is valid
     */
    validateElement(element, elementName) {
        if (!element) {
            console.warn(`Element '${elementName}' not found`);
            return false;
        }
        return true;
    },
    
    /**
     * Clamp a value between min and max bounds
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Clamped value
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};
