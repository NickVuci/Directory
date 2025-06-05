/**
 * Playlist Data Management System
 * Handles track data validation, processing, and manipulation
 * Version: 1.0 - Foundation stage
 */

class PlaylistDataManager {
    constructor() {
        this.tracks = new Map(); // Use Map for O(1) lookups
        this.filters = new Map(); // Auto-generated filter categories
        this.version = "1.0";
        
        // Initialize from tracks data
        this.initializeFromTracksData();
        this.generateFilterCategories();
    }

    /**
     * Initialize tracks from the global tracksData
     */
    initializeFromTracksData() {
        if (window.tracksData && window.tracksData.tracks) {
            window.tracksData.tracks.forEach(track => {
                if (this.validateTrack(track)) {
                    this.tracks.set(track.id, this.sanitizeTrack(track));
                } else {
                    console.warn('Invalid track data:', track);
                }
            });
        }
        console.log(`Initialized ${this.tracks.size} tracks`);
    }

    /**
     * Validate track data against schema
     * @param {Object} track - Track object to validate
     * @returns {boolean} - Whether track is valid
     */
    validateTrack(track) {
        if (!track || typeof track !== 'object') return false;
        
        const schema = window.tracksData?.trackSchema;
        if (!schema) return true; // If no schema, assume valid
        
        // Check required fields
        for (const field of schema.required) {
            if (!(field in track) || track[field] === null || track[field] === undefined) {
                console.warn(`Missing required field: ${field}`, track);
                return false;
            }
        }
        
        // Check field types
        for (const [field, expectedType] of Object.entries(schema.types)) {
            if (field in track) {
                if (!this.validateFieldType(track[field], expectedType)) {
                    console.warn(`Invalid type for field ${field}:`, track[field], 'expected:', expectedType);
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Validate field type
     * @param {*} value - Value to validate
     * @param {string|Array} expectedType - Expected type(s)
     * @returns {boolean} - Whether type is valid
     */
    validateFieldType(value, expectedType) {
        const types = Array.isArray(expectedType) ? expectedType : [expectedType];
        const actualType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
        
        return types.includes(actualType);
    }

    /**
     * Sanitize and normalize track data
     * @param {Object} track - Raw track data
     * @returns {Object} - Sanitized track data
     */
    sanitizeTrack(track) {
        const sanitized = { ...track };
        
        // Ensure arrays are properly formatted
        if (sanitized.genre && !Array.isArray(sanitized.genre)) {
            sanitized.genre = [sanitized.genre];
        }
        if (sanitized.mood && !Array.isArray(sanitized.mood)) {
            sanitized.mood = [sanitized.mood];
        }
        if (sanitized.tags && !Array.isArray(sanitized.tags)) {
            sanitized.tags = [sanitized.tags];
        }
        if (sanitized.instruments && !Array.isArray(sanitized.instruments)) {
            sanitized.instruments = [sanitized.instruments];
        }
        
        // Normalize strings
        sanitized.title = sanitized.title.trim();
        sanitized.artist = sanitized.artist.trim();
        
        // Ensure numeric fields
        if (sanitized.year && typeof sanitized.year === 'string') {
            sanitized.year = parseInt(sanitized.year);
        }
        if (sanitized.bpm && typeof sanitized.bpm === 'string') {
            sanitized.bpm = parseFloat(sanitized.bpm);
        }
        
        // Initialize tracking fields if missing
        if (sanitized.playCount === undefined) sanitized.playCount = 0;
        if (sanitized.favorite === undefined) sanitized.favorite = false;
        if (sanitized.dateAdded === undefined) {
            sanitized.dateAdded = new Date().toISOString().split('T')[0];
        }
        
        return sanitized;
    }

    /**
     * Generate filter categories from track data
     */
    generateFilterCategories() {
        const filters = {
            genre: new Set(),
            tuning: new Set(),
            mood: new Set(),
            tags: new Set(),
            instruments: new Set(),
            artist: new Set(),
            album: new Set(),
            year: new Set(),
            key: new Set()
        };
        
        // Collect all unique values from tracks
        this.tracks.forEach(track => {
            // Array fields
            if (track.genre) track.genre.forEach(g => filters.genre.add(g));
            if (track.mood) track.mood.forEach(m => filters.mood.add(m));
            if (track.tags) track.tags.forEach(t => filters.tags.add(t));
            if (track.instruments) track.instruments.forEach(i => filters.instruments.add(i));
            
            // String fields
            if (track.tuning) filters.tuning.add(track.tuning);
            if (track.artist) filters.artist.add(track.artist);
            if (track.album) filters.album.add(track.album);
            if (track.key) filters.key.add(track.key);
            if (track.year) filters.year.add(track.year);
        });
        
        // Convert Sets to sorted Arrays and store in Map
        Object.entries(filters).forEach(([category, values]) => {
            const sortedValues = Array.from(values).sort((a, b) => {
                // Special sorting for years (numeric)
                if (category === 'year') return b - a; // Newest first
                return a.localeCompare(b);
            });
            this.filters.set(category, sortedValues);
        });
        
        console.log('Generated filter categories:', Object.fromEntries(this.filters));
    }

    /**
     * Get all tracks as array
     * @returns {Array} - Array of all tracks
     */
    getAllTracks() {
        return Array.from(this.tracks.values());
    }

    /**
     * Get track by ID
     * @param {string} id - Track ID
     * @returns {Object|null} - Track object or null if not found
     */
    getTrack(id) {
        return this.tracks.get(id) || null;
    }

    /**
     * Get filter categories
     * @param {string} category - Filter category name
     * @returns {Array} - Array of filter values
     */
    getFilterValues(category) {
        return this.filters.get(category) || [];
    }

    /**
     * Get all filter categories
     * @returns {Object} - Object with all filter categories
     */
    getAllFilters() {
        return Object.fromEntries(this.filters);
    }

    /**
     * Add new track
     * @param {Object} track - Track data
     * @returns {boolean} - Success status
     */
    addTrack(track) {
        if (!this.validateTrack(track)) {
            console.error('Cannot add invalid track:', track);
            return false;
        }
        
        const sanitized = this.sanitizeTrack(track);
        this.tracks.set(sanitized.id, sanitized);
        this.generateFilterCategories(); // Regenerate filters
        
        console.log('Added track:', sanitized.title);
        return true;
    }

    /**
     * Update track
     * @param {string} id - Track ID
     * @param {Object} updates - Fields to update
     * @returns {boolean} - Success status
     */
    updateTrack(id, updates) {
        const track = this.tracks.get(id);
        if (!track) {
            console.error('Track not found:', id);
            return false;
        }
        
        const updatedTrack = { ...track, ...updates };
        if (!this.validateTrack(updatedTrack)) {
            console.error('Updated track data is invalid');
            return false;
        }
        
        this.tracks.set(id, this.sanitizeTrack(updatedTrack));
        this.generateFilterCategories(); // Regenerate filters if needed
        
        console.log('Updated track:', id);
        return true;
    }

    /**
     * Remove track
     * @param {string} id - Track ID
     * @returns {boolean} - Success status
     */
    removeTrack(id) {
        const success = this.tracks.delete(id);
        if (success) {
            this.generateFilterCategories(); // Regenerate filters
            console.log('Removed track:', id);
        }
        return success;
    }

    /**
     * Increment play count for track
     * @param {string} id - Track ID
     */
    incrementPlayCount(id) {
        const track = this.tracks.get(id);
        if (track) {
            track.playCount++;
            track.lastPlayed = new Date().toISOString();
            console.log(`Play count for "${track.title}": ${track.playCount}`);
        }
    }

    /**
     * Toggle favorite status
     * @param {string} id - Track ID
     * @returns {boolean} - New favorite status
     */
    toggleFavorite(id) {
        const track = this.tracks.get(id);
        if (track) {
            track.favorite = !track.favorite;
            console.log(`${track.title} favorite:`, track.favorite);
            return track.favorite;
        }
        return false;
    }

    /**
     * Get tracks statistics
     * @returns {Object} - Statistics object
     */
    getStatistics() {
        const tracks = this.getAllTracks();
        const totalTracks = tracks.length;
        const totalPlayCount = tracks.reduce((sum, track) => sum + track.playCount, 0);
        const favorites = tracks.filter(track => track.favorite).length;
        
        // Most played tracks
        const mostPlayed = tracks
            .filter(track => track.playCount > 0)
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 10);
        
        // Recent tracks (last played)
        const recentTracks = tracks
            .filter(track => track.lastPlayed)
            .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
            .slice(0, 10);
        
        return {
            totalTracks,
            totalPlayCount,
            favorites,
            mostPlayed,
            recentTracks,
            filterCategories: Object.keys(Object.fromEntries(this.filters))
        };
    }

    /**
     * Export data for backup/sharing
     * @returns {Object} - Serializable data object
     */
    exportData() {
        return {
            version: this.version,
            tracks: Object.fromEntries(this.tracks),
            filters: Object.fromEntries(this.filters),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import data from backup
     * @param {Object} data - Data to import
     * @returns {boolean} - Success status
     */
    importData(data) {
        try {
            if (data.tracks) {
                this.tracks.clear();
                Object.entries(data.tracks).forEach(([id, track]) => {
                    if (this.validateTrack(track)) {
                        this.tracks.set(id, this.sanitizeTrack(track));
                    }
                });
            }
            
            this.generateFilterCategories();
            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}

// Create global instance
window.playlistData = new PlaylistDataManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaylistDataManager;
}
