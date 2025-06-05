/**
 * Playlist Storage Management
 * Handles localStorage persistence for playlist data and user preferences
 * Version: 1.0 - Foundation stage
 */

class PlaylistStorage {
    constructor() {
        this.storageKey = 'microtonal-playlist';
        this.version = "1.0";
        this.maxHistoryItems = 100;
        this.maxSearchHistory = 50;
        
        // Initialize storage structure
        this.initializeStorage();
    }

    /**
     * Initialize storage with default structure
     */
    initializeStorage() {
        const existing = this.getStorageData();
        if (!existing || existing.version !== this.version) {
            console.log('Initializing playlist storage...');
            this.resetToDefaults();
        }
    }

    /**
     * Get raw storage data
     * @returns {Object|null} - Storage data or null if not found
     */
    getStorageData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Set raw storage data
     * @param {Object} data - Data to store
     * @returns {boolean} - Success status
     */
    setStorageData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    /**
     * Reset storage to default values
     */
    resetToDefaults() {
        const defaultData = {
            version: this.version,
            preferences: {
                filterStates: {
                    genre: [],
                    tuning: [],
                    mood: [],
                    tags: [],
                    instruments: [],
                    artist: [],
                    album: [],
                    year: [],
                    key: []
                },
                searchQuery: "",
                sortBy: "dateAdded", // dateAdded, title, artist, year, playCount
                sortDirection: "desc", // asc, desc
                playbackMode: "normal", // normal, shuffle, repeat-one, repeat-all
                volume: 0.7,
                expandedSections: {
                    playlist: false,
                    filters: true,
                    queue: false
                },
                itemsPerPage: 50, // For virtual scrolling
                theme: "default"
            },
            history: {
                recentTracks: [], // Last played tracks
                searchHistory: [], // Recent search queries
                filterPresets: [], // Saved filter combinations
                playbackHistory: [] // Detailed playback history
            },
            stats: {
                totalPlayTime: 0, // Total seconds played
                sessionStartTime: null,
                lastSessionTime: null,
                mostPlayedTracks: [], // Track IDs with play counts
                dailyStats: {}, // Date -> stats object
                weeklyStats: {}, // Week -> stats object
                monthlyStats: {} // Month -> stats object
            },
            cache: {
                lastFilterResult: null, // Cache last filter operation
                lastSearchResult: null, // Cache last search result
                trackDurations: {}, // Cache track durations
                waveformData: {} // Cache waveform data
            },
            timestamp: new Date().toISOString()
        };
        
        this.setStorageData(defaultData);
        console.log('Reset playlist storage to defaults');
    }

    /**
     * Get user preferences
     * @returns {Object} - User preferences object
     */
    getPreferences() {
        const data = this.getStorageData();
        return data?.preferences || {};
    }

    /**
     * Update user preferences
     * @param {Object} updates - Preference updates
     * @returns {boolean} - Success status
     */
    updatePreferences(updates) {
        const data = this.getStorageData();
        if (!data) return false;
        
        data.preferences = { ...data.preferences, ...updates };
        data.timestamp = new Date().toISOString();
        
        return this.setStorageData(data);
    }

    /**
     * Get filter states
     * @returns {Object} - Current filter states
     */
    getFilterStates() {
        const preferences = this.getPreferences();
        return preferences.filterStates || {};
    }

    /**
     * Update filter states
     * @param {Object} filterStates - New filter states
     * @returns {boolean} - Success status
     */
    updateFilterStates(filterStates) {
        return this.updatePreferences({ filterStates });
    }

    /**
     * Get search query
     * @returns {string} - Current search query
     */
    getSearchQuery() {
        const preferences = this.getPreferences();
        return preferences.searchQuery || "";
    }

    /**
     * Update search query and add to history
     * @param {string} query - Search query
     * @returns {boolean} - Success status
     */
    updateSearchQuery(query) {
        const data = this.getStorageData();
        if (!data) return false;
        
        // Update current search
        data.preferences.searchQuery = query;
        
        // Add to search history if not empty and not duplicate
        if (query.trim() && !data.history.searchHistory.includes(query)) {
            data.history.searchHistory.unshift(query);
            // Keep only the most recent searches
            data.history.searchHistory = data.history.searchHistory.slice(0, this.maxSearchHistory);
        }
        
        data.timestamp = new Date().toISOString();
        return this.setStorageData(data);
    }

    /**
     * Get search history
     * @returns {Array} - Array of recent search queries
     */
    getSearchHistory() {
        const data = this.getStorageData();
        return data?.history?.searchHistory || [];
    }

    /**
     * Add track to recent history
     * @param {string} trackId - Track ID
     * @returns {boolean} - Success status
     */
    addToRecentTracks(trackId) {
        const data = this.getStorageData();
        if (!data) return false;
        
        // Remove if already exists (to move to front)
        data.history.recentTracks = data.history.recentTracks.filter(id => id !== trackId);
        
        // Add to front
        data.history.recentTracks.unshift(trackId);
        
        // Keep only recent tracks
        data.history.recentTracks = data.history.recentTracks.slice(0, this.maxHistoryItems);
        
        data.timestamp = new Date().toISOString();
        return this.setStorageData(data);
    }

    /**
     * Get recent tracks
     * @returns {Array} - Array of recent track IDs
     */
    getRecentTracks() {
        const data = this.getStorageData();
        return data?.history?.recentTracks || [];
    }

    /**
     * Record track playback
     * @param {string} trackId - Track ID
     * @param {number} duration - Playback duration in seconds
     * @returns {boolean} - Success status
     */
    recordPlayback(trackId, duration = 0) {
        const data = this.getStorageData();
        if (!data) return false;
        
        const now = new Date();
        const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Update total play time
        data.stats.totalPlayTime += duration;
        data.stats.lastSessionTime = now.toISOString();
        
        // Add to playback history
        data.history.playbackHistory.unshift({
            trackId,
            timestamp: now.toISOString(),
            duration
        });
        
        // Keep only recent playback history
        data.history.playbackHistory = data.history.playbackHistory.slice(0, this.maxHistoryItems);
        
        // Update daily stats
        if (!data.stats.dailyStats[dateKey]) {
            data.stats.dailyStats[dateKey] = {
                playCount: 0,
                totalTime: 0,
                tracks: new Set()
            };
        }
        data.stats.dailyStats[dateKey].playCount++;
        data.stats.dailyStats[dateKey].totalTime += duration;
        
        // Add to recent tracks
        this.addToRecentTracks(trackId);
        
        data.timestamp = new Date().toISOString();
        return this.setStorageData(data);
    }

    /**
     * Get playback statistics
     * @returns {Object} - Statistics object
     */
    getStatistics() {
        const data = this.getStorageData();
        return data?.stats || {};
    }

    /**
     * Save filter preset
     * @param {string} name - Preset name
     * @param {Object} filterStates - Filter states to save
     * @param {string} searchQuery - Search query to save
     * @returns {boolean} - Success status
     */
    saveFilterPreset(name, filterStates, searchQuery = "") {
        const data = this.getStorageData();
        if (!data) return false;
        
        const preset = {
            name,
            filterStates,
            searchQuery,
            createdAt: new Date().toISOString()
        };
        
        // Remove existing preset with same name
        data.history.filterPresets = data.history.filterPresets.filter(p => p.name !== name);
        
        // Add new preset
        data.history.filterPresets.unshift(preset);
        
        data.timestamp = new Date().toISOString();
        return this.setStorageData(data);
    }

    /**
     * Get filter presets
     * @returns {Array} - Array of saved filter presets
     */
    getFilterPresets() {
        const data = this.getStorageData();
        return data?.history?.filterPresets || [];
    }

    /**
     * Delete filter preset
     * @param {string} name - Preset name to delete
     * @returns {boolean} - Success status
     */
    deleteFilterPreset(name) {
        const data = this.getStorageData();
        if (!data) return false;
        
        data.history.filterPresets = data.history.filterPresets.filter(p => p.name !== name);
        data.timestamp = new Date().toISOString();
        
        return this.setStorageData(data);
    }

    /**
     * Cache track duration
     * @param {string} trackId - Track ID
     * @param {number} duration - Duration in seconds
     */
    cacheTrackDuration(trackId, duration) {
        const data = this.getStorageData();
        if (data) {
            data.cache.trackDurations[trackId] = duration;
            this.setStorageData(data);
        }
    }

    /**
     * Get cached track duration
     * @param {string} trackId - Track ID
     * @returns {number|null} - Cached duration or null
     */
    getCachedTrackDuration(trackId) {
        const data = this.getStorageData();
        return data?.cache?.trackDurations?.[trackId] || null;
    }

    /**
     * Start new session
     */
    startSession() {
        const data = this.getStorageData();
        if (data) {
            data.stats.sessionStartTime = new Date().toISOString();
            this.setStorageData(data);
        }
    }

    /**
     * End current session
     */
    endSession() {
        const data = this.getStorageData();
        if (data && data.stats.sessionStartTime) {
            const sessionDuration = Date.now() - new Date(data.stats.sessionStartTime).getTime();
            data.stats.lastSessionTime = new Date().toISOString();
            data.stats.sessionStartTime = null;
            
            // Add session duration to total time (in seconds)
            data.stats.totalPlayTime += Math.round(sessionDuration / 1000);
            
            this.setStorageData(data);
        }
    }

    /**
     * Export all storage data
     * @returns {Object} - Complete storage data
     */
    exportData() {
        return this.getStorageData();
    }

    /**
     * Import storage data
     * @param {Object} data - Data to import
     * @returns {boolean} - Success status
     */
    importData(data) {
        try {
            // Validate data structure
            if (!data.version || !data.preferences) {
                console.error('Invalid import data structure');
                return false;
            }
            
            // Merge with current data or replace
            data.timestamp = new Date().toISOString();
            return this.setStorageData(data);
        } catch (error) {
            console.error('Failed to import storage data:', error);
            return false;
        }
    }

    /**
     * Clear all storage data
     */
    clearAll() {
        localStorage.removeItem(this.storageKey);
        console.log('Cleared all playlist storage data');
    }

    /**
     * Get storage usage information
     * @returns {Object} - Storage usage stats
     */
    getStorageInfo() {
        const data = this.getStorageData();
        if (!data) return null;
        
        const jsonString = JSON.stringify(data);
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        
        return {
            version: data.version,
            timestamp: data.timestamp,
            sizeBytes: sizeInBytes,
            sizeKB: sizeInKB,
            recentTracksCount: data.history?.recentTracks?.length || 0,
            searchHistoryCount: data.history?.searchHistory?.length || 0,
            filterPresetsCount: data.history?.filterPresets?.length || 0,
            playbackHistoryCount: data.history?.playbackHistory?.length || 0,
            totalPlayTime: data.stats?.totalPlayTime || 0
        };
    }
}

// Create global instance
window.playlistStorage = new PlaylistStorage();

// Initialize session tracking
window.addEventListener('load', () => {
    window.playlistStorage.startSession();
});

window.addEventListener('beforeunload', () => {
    window.playlistStorage.endSession();
});

// Export to window for browser usage
window.PlaylistStorage = PlaylistStorage;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaylistStorage;
}
