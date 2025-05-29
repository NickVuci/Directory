/**
 * AudioEngine Module - Core Audio Functionality
 * 
 * Handles all audio playback, control, and event management.
 * This module provides a clean API for audio operations while
 * encapsulating the complexity of HTML5 audio management.
 * 
 * @author Nick Vuci
 * @version 1.0.0
 * @date May 29, 2025
 */

export class AudioEngine {
    constructor(audioElement) {
        if (!audioElement) {
            throw new Error('AudioEngine requires an audio element');
        }
        
        this.audio = audioElement;
        this.isInitialized = false;
        this.eventCallbacks = {
            timeupdate: [],
            ended: [],
            loadstart: [],
            error: [],
            canplay: [],
            playing: [],
            pause: []
        };
        
        this.initialize();
    }
    
    /**
     * Initialize the audio engine with event listeners
     */
    initialize() {
        // Set up core audio event listeners
        this.audio.addEventListener('timeupdate', () => {
            this.eventCallbacks.timeupdate.forEach(callback => callback(this.getCurrentTime()));
        });
        
        this.audio.addEventListener('ended', () => {
            this.eventCallbacks.ended.forEach(callback => callback());
        });
        
        this.audio.addEventListener('loadstart', () => {
            this.eventCallbacks.loadstart.forEach(callback => callback());
        });
        
        this.audio.addEventListener('error', (e) => {
            this.eventCallbacks.error.forEach(callback => callback(e));
        });
        
        this.audio.addEventListener('canplay', () => {
            this.eventCallbacks.canplay.forEach(callback => callback());
        });
        
        this.audio.addEventListener('playing', () => {
            this.eventCallbacks.playing.forEach(callback => callback());
        });
        
        this.audio.addEventListener('pause', () => {
            this.eventCallbacks.pause.forEach(callback => callback());
        });
        
        this.isInitialized = true;
    }
    
    /**
     * Play the current audio track
     * @returns {Promise} - Promise that resolves when playback starts
     */
    async play() {
        try {
            await this.audio.play();
            return true;
        } catch (error) {
            console.error('Error playing audio:', error);
            return false;
        }
    }
    
    /**
     * Pause the current audio track
     */
    pause() {
        this.audio.pause();
    }
    
    /**
     * Stop the current audio track and reset position
     */
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    
    /**
     * Set the volume level
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.audio.volume = clampedVolume;
    }
    
    /**
     * Get the current volume level
     * @returns {number} - Current volume (0.0 to 1.0)
     */
    getVolume() {
        return this.audio.volume;
    }
    
    /**
     * Seek to a specific time position
     * @param {number} time - Time in seconds
     */
    seek(time) {
        if (this.getDuration() > 0) {
            const clampedTime = Math.max(0, Math.min(this.getDuration(), time));
            this.audio.currentTime = clampedTime;
        }
    }
    
    /**
     * Load a new track
     * @param {string} trackUrl - URL of the track to load
     */
    loadTrack(trackUrl) {
        this.audio.src = trackUrl;
        this.audio.load();
    }
    
    /**
     * Get the current playback time
     * @returns {number} - Current time in seconds
     */
    getCurrentTime() {
        return this.audio.currentTime || 0;
    }
    
    /**
     * Get the total duration of the current track
     * @returns {number} - Duration in seconds
     */
    getDuration() {
        return this.audio.duration || 0;
    }
    
    /**
     * Check if audio is currently playing
     * @returns {boolean} - True if playing, false otherwise
     */
    isPlaying() {
        return !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0;
    }
    
    /**
     * Check if audio is paused
     * @returns {boolean} - True if paused, false otherwise
     */
    isPaused() {
        return this.audio.paused;
    }
    
    /**
     * Get the loading progress percentage
     * @returns {number} - Progress percentage (0-100)
     */
    getLoadProgress() {
        if (this.audio.buffered.length > 0) {
            return (this.audio.buffered.end(0) / this.getDuration()) * 100;
        }
        return 0;
    }
    
    /**
     * Register event callbacks
     */
    onTimeUpdate(callback) {
        this.eventCallbacks.timeupdate.push(callback);
    }
    
    onTrackEnd(callback) {
        this.eventCallbacks.ended.push(callback);
    }
    
    onLoadStart(callback) {
        this.eventCallbacks.loadstart.push(callback);
    }
    
    onError(callback) {
        this.eventCallbacks.error.push(callback);
    }
    
    onCanPlay(callback) {
        this.eventCallbacks.canplay.push(callback);
    }
    
    onPlaying(callback) {
        this.eventCallbacks.playing.push(callback);
    }
    
    onPause(callback) {
        this.eventCallbacks.pause.push(callback);
    }
    
    /**
     * Remove all event callbacks
     */
    clearEventCallbacks() {
        Object.keys(this.eventCallbacks).forEach(event => {
            this.eventCallbacks[event] = [];
        });
    }
    
    /**
     * Destroy the audio engine and clean up resources
     */
    destroy() {
        this.clearEventCallbacks();
        this.stop();
        this.isInitialized = false;
    }
}
