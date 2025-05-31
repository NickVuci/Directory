/**
 * Configuration Module
 * Centralizes all settings, constants, and configuration options for the Music Player
 * 
 * @author GitHub Copilot
 * @version 2.0.0 - Phase 2
 * @since 2025-05-30
 */

/**
 * Default configuration settings for the Music Player
 */
export const Configuration = {
    // Audio Settings
    audio: {
        defaultVolume: 0.5,
        fadeInDuration: 300,
        fadeOutDuration: 200,
        crossfadeEnabled: false,
        autoplay: false
    },

    // Mobile Detection & Responsive Settings
    responsive: {
        mobileBreakpoint: 768,
        enableTouch: true,
        enableHapticFeedback: true,
        vibrationDuration: 50
    },

    // Desktop Player Settings
    desktop: {
        defaultPosition: { x: 40, y: 200 },
        enableDrag: true,
        collapsedByDefault: true,
        snapToEdges: false,
        minDistance: 5, // Minimum distance for drag detection
        dragTransition: 'none'
    },

    // Mobile Player Settings
    mobile: {
        enableDualFunctionSlider: true,
        showHints: true,
        hintDisplayDuration: 3000,
        hintFadeDuration: 1000,
        progressBarHeight: 6,
        thumbSize: 36
    },

    // UI Constants
    ui: {
        animationDuration: 300,
        transitions: {
            fast: '0.15s',
            normal: '0.3s',
            slow: '0.5s'
        },
        zIndex: {
            player: 1000,
            mobile: 1001,
            overlay: 1002
        }
    },

    // Time Display Settings
    time: {
        format: 'mm:ss',
        showHours: false,
        updateInterval: 100 // milliseconds
    },

    // Track Management
    tracks: {
        autoAdvance: true,
        shuffle: false,
        repeat: false,
        preloadNext: false
    },

    // Error Handling
    errors: {
        maxRetries: 3,
        retryDelay: 1000,
        showUserErrors: true,
        logErrors: true
    },

    // Performance Settings
    performance: {
        enableThrottling: true,
        throttleDelay: 16, // ~60fps
        enableRequestAnimationFrame: true,
        minUpdateInterval: 50
    },

    // Element IDs (for validation and consistency)
    elementIds: {
        // Desktop Elements
        audio: 'audioPlayer',
        player: 'musicPlayer',
        playPause: 'playPauseBtn',
        progress: 'progressBar',
        volume: 'volumeSlider',
        trackTitle: 'trackTitle',
        trackArtist: 'trackArtist',
        currentTime: 'currentTime',
        totalTime: 'totalTime',

        // Mobile Elements
        mobilePlayer: 'mobileMusicPlayer',
        mobileProgress: 'mobileProgressBar',
        mobileThumb: 'mobileSliderThumb',
        mobileTitle: 'mobileTrackTitle',
        mobileTuning: 'mobileTrackTuning',
        mobileCurrentTime: 'mobileCurrentTime',
        mobileTotalTime: 'mobileTotalTime'
    },

    // CSS Classes
    cssClasses: {
        // Desktop Player
        collapsed: 'collapsed',
        dragging: 'dragging',
        playing: 'playing',
        
        // Mobile Player
        active: 'active',
        mobileActive: 'mobile-active',
        
        // States
        loading: 'loading',
        error: 'error',
        disabled: 'disabled'
    },

    // Development Settings
    development: {
        debug: false,
        verbose: false,
        enableConsoleLogging: true,
        showTimings: false
    }
};

/**
 * Get configuration value by dot notation path
 * @param {string} path - Dot notation path (e.g., 'audio.defaultVolume')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value or default
 */
export function getConfig(path, defaultValue = null) {
    return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    }, Configuration);
}

/**
 * Set configuration value by dot notation path
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 */
export function setConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return obj[key];
    }, Configuration);
    target[lastKey] = value;
}

/**
 * Merge user configuration with defaults
 * @param {Object} userConfig - User configuration object
 * @returns {Object} Merged configuration
 */
export function mergeConfig(userConfig) {
    return deepMerge(Configuration, userConfig);
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export function validateConfig(config) {
    // Basic validation - can be expanded based on needs
    if (!config || typeof config !== 'object') {
        return false;
    }
    
    // Validate required sections exist
    const requiredSections = ['audio', 'responsive', 'ui', 'elementIds'];
    return requiredSections.every(section => config[section] && typeof config[section] === 'object');
}

/**
 * Get element ID with fallback
 * @param {string} elementKey - Key from elementIds config
 * @returns {string} Element ID
 */
export function getElementId(elementKey) {
    return getConfig(`elementIds.${elementKey}`, elementKey);
}

/**
 * Get CSS class name
 * @param {string} classKey - Key from cssClasses config
 * @returns {string} CSS class name
 */
export function getCssClass(classKey) {
    return getConfig(`cssClasses.${classKey}`, classKey);
}

/**
 * Check if mobile mode based on configuration
 * @returns {boolean} True if mobile
 */
export function isMobileMode() {
    return window.innerWidth <= getConfig('responsive.mobileBreakpoint', 768);
}

/**
 * Get current configuration (read-only copy)
 * @returns {Object} Current configuration
 */
export function getCurrentConfig() {
    return JSON.parse(JSON.stringify(Configuration));
}

// Export default configuration
export default Configuration;
