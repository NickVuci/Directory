/**
 * Utils Module - Shared Utility Functions
 * 
 * Provides common utility functions used across the music player
 * application. This module encapsulates helper functions for
 * formatting, validation, and device detection.
 * 
 * @author Nick Vuci
 * @version 1.0.0
 * @date May 29, 2025
 */

export const Utils = {
    /**
     * Format time in seconds to MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string (MM:SS)
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return '0:00';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Detect if the current device is mobile
     * @returns {boolean} - True if mobile device
     */
    isMobileDevice() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Validate that a DOM element exists and is accessible
     * @param {HTMLElement|null} element - Element to validate
     * @param {string} elementName - Name of element for error reporting
     * @returns {boolean} - True if element is valid
     */
    validateElement(element, elementName = 'Element') {
        if (!element) {
            console.warn(`${elementName} not found in DOM`);
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
    },
    
    /**
     * Debounce function calls to prevent excessive execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function calls to limit execution frequency
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Calculate percentage from value and total
     * @param {number} value - Current value
     * @param {number} total - Total value
     * @returns {number} - Percentage (0-100)
     */
    getPercentage(value, total) {
        if (total === 0) return 0;
        return Math.max(0, Math.min(100, (value / total) * 100));
    },
    
    /**
     * Calculate value from percentage and total
     * @param {number} percentage - Percentage (0-100)
     * @param {number} total - Total value
     * @returns {number} - Calculated value
     */
    getValueFromPercentage(percentage, total) {
        return (this.clamp(percentage, 0, 100) / 100) * total;
    },
    
    /**
     * Get element's position relative to page
     * @param {HTMLElement} element - Element to get position for
     * @returns {Object} - Object with x, y, width, height properties
     */
    getElementPosition(element) {
        if (!element) return { x: 0, y: 0, width: 0, height: 0 };
        
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    },
    
    /**
     * Check if a point is within an element's bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {HTMLElement} element - Element to check against
     * @returns {boolean} - True if point is within element
     */
    isPointInElement(x, y, element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    },
    
    /**
     * Safely parse a number from string with fallback
     * @param {string|number} value - Value to parse
     * @param {number} fallback - Fallback value if parsing fails
     * @returns {number} - Parsed number or fallback
     */
    safeParseNumber(value, fallback = 0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? fallback : parsed;
    },
    
    /**
     * Deep clone an object (simple implementation for basic objects)
     * @param {Object} obj - Object to clone
     * @returns {Object} - Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
};
