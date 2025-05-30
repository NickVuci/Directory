/**
 * AudioEngine Module - Core Audio Control
 * 
 * Provides a safe interface to audio playback functionality while
 * maintaining compatibility with existing MusicPlayer implementation.
 * This module acts as a controlled wrapper around HTML5 audio elements.
 * 
 * @author Nick Vuci
 * @version 1.0.0 (Phase 1 - Minimal Implementation)
 * @date May 30, 2025
 */

export class AudioEngine {
    constructor(audioElement) {
        this.audio = audioElement;
        this.isInitialized = false;
        
        if (!this.audio) {
            console.error('AudioEngine: No audio element provided');
            return;
        }
        
        this.isInitialized = true;
    }
    
    /**
     * Check if the audio engine is properly initialized
     * @returns {boolean} - True if initialized
     */
    isReady() {
        return this.isInitialized && this.audio;
    }
    
    /**
     * Set audio source safely
     * @param {string} source - Audio file URL
     * @returns {boolean} - True if successfully set
     */
    setSource(source) {
        if (!this.isReady()) return false;
        
        try {
            this.audio.src = source;
            return true;
        } catch (error) {
            console.error('AudioEngine: Error setting source:', error);
            return false;
        }
    }
    
    /**
     * Set audio volume safely
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @returns {boolean} - True if successfully set
     */
    setVolume(volume) {
        if (!this.isReady()) return false;
        
        const clampedVolume = Math.max(0, Math.min(1, volume));
        
        try {
            this.audio.volume = clampedVolume;
            return true;
        } catch (error) {
            console.error('AudioEngine: Error setting volume:', error);
            return false;
        }
    }
    
    /**
     * Get current audio state information
     * @returns {Object} - Current audio state
     */
    getState() {
        if (!this.isReady()) {
            return {
                paused: true,
                currentTime: 0,
                duration: 0,
                volume: 0,
                error: 'Audio engine not ready'
            };
        }
        
        return {
            paused: this.audio.paused,
            currentTime: this.audio.currentTime,
            duration: this.audio.duration || 0,
            volume: this.audio.volume,
            src: this.audio.src
        };
    }
    
    /**
     * Safe play method with error handling
     * @returns {Promise<boolean>} - True if play was successful
     */
    async play() {
        if (!this.isReady()) return false;
        
        try {
            await this.audio.play();
            return true;
        } catch (error) {
            console.error('AudioEngine: Play error:', error);
            return false;
        }
    }
    
    /**
     * Safe pause method
     * @returns {boolean} - True if pause was successful
     */
    pause() {
        if (!this.isReady()) return false;
        
        try {
            this.audio.pause();
            return true;
        } catch (error) {
            console.error('AudioEngine: Pause error:', error);
            return false;
        }
    }
    
    /**
     * Safe seek method
     * @param {number} time - Time in seconds to seek to
     * @returns {boolean} - True if seek was successful
     */
    seek(time) {
        if (!this.isReady()) return false;
        
        try {
            const duration = this.audio.duration || 0;
            const clampedTime = Math.max(0, Math.min(duration, time));
            this.audio.currentTime = clampedTime;
            return true;
        } catch (error) {
            console.error('AudioEngine: Seek error:', error);
            return false;
        }
    }
}
