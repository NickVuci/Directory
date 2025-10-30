/**
 * Playlist Engine - Core filtering and search logic
 * Handles filtering tracks based on multiple criteria with AND/OR logic
 * Version: 1.0 - Stage 2: Core Playlist Engine
 */

class PlaylistEngine {
    /**
     * Initialize the playlist engine
     * @param {PlaylistDataManager} dataManager - Data manager instance
     * @param {PlaylistStorage} storage - Storage manager instance
     */
    constructor(dataManager, storage) {
        this.dataManager = dataManager;
        this.storage = storage;
        this.activeFilters = new Map();  // Currently active filters by category
        this.filteredTracks = [];        // Tracks after applying filters
        this.filterCombinationMode = 'AND'; // Default to AND logic between categories
        this.searchQuery = '';
        
        // Filter cache for performance
        this.filterCache = new Map();
        this.lastFilterHash = null;
        
        // Initialize
        this.resetFilters();
    }    /**
     * Reset all filters to default state
     */
    resetFilters() {
        this.activeFilters.clear();
        this.filteredTracks = Array.from(this.dataManager.tracks.values());
        this.lastFilterHash = null;
        
        // Load any saved filter states from storage
        const preferences = this.storage?.getPreferences ? this.storage.getPreferences() : {};
        const savedFilters = preferences.filterStates;
        if (savedFilters) {
            for (const [category, filters] of Object.entries(savedFilters)) {
                if (Array.isArray(filters) && filters.length > 0) {
                    this.activeFilters.set(category, new Set(filters));
                }
            }
            this.applyFilters();
        }
        // Load search query if available
        if (typeof preferences.searchQuery === 'string') {
            this.searchQuery = preferences.searchQuery;
        }
    }

    /**
     * Set filter combination mode (AND/OR between categories)
     * @param {string} mode - 'AND' or 'OR'
     */
    setFilterCombinationMode(mode) {
        if (mode === 'AND' || mode === 'OR') {
            this.filterCombinationMode = mode;
            this.applyFilters();
            
            // Save preference
            if (this.storage?.updatePreferences) {
                this.storage.updatePreferences({ filterCombinationMode: mode });
            }
        }
    }

    /**
     * Back-compat: setFilterMode maps to setFilterCombinationMode
     */
    setFilterMode(mode) {
        this.setFilterCombinationMode(mode);
    }

    /**
     * Update the search query and re-apply filters
     */
    setSearchQuery(query) {
        this.searchQuery = (query || '').trim();
        if (this.storage?.updateSearchQuery) {
            this.storage.updateSearchQuery(this.searchQuery);
        }
        this.applyFilters();
    }

    /**
     * Toggle a filter value within a category
     * @param {string} category - Filter category (genre, mood, etc)
     * @param {string} value - Filter value to toggle
     * @returns {boolean} - Whether the filter is now active
     */
    toggleFilter(category, value) {
        if (!this.activeFilters.has(category)) {
            this.activeFilters.set(category, new Set());
        }
        
        const categoryFilters = this.activeFilters.get(category);
        const isActive = categoryFilters.has(value);
        
        if (isActive) {
            categoryFilters.delete(value);
            if (categoryFilters.size === 0) {
                this.activeFilters.delete(category);
            }
        } else {
            categoryFilters.add(value);
        }
        
        // Apply filters and save state
        this.applyFilters();
        this.saveFilterState();
        
        return !isActive;
    }

    /**
     * Add a filter value (idempotent)
     */
    addFilter(category, value) {
        if (!this.activeFilters.has(category)) {
            this.activeFilters.set(category, new Set());
        }
        const set = this.activeFilters.get(category);
        set.add(value);
        this.applyFilters();
        this.saveFilterState();
    }

    /**
     * Remove a filter value (idempotent)
     */
    removeFilter(category, value) {
        if (!this.activeFilters.has(category)) return;
        const set = this.activeFilters.get(category);
        set.delete(value);
        if (set.size === 0) this.activeFilters.delete(category);
        this.applyFilters();
        this.saveFilterState();
    }
    
    /**
     * Check if a filter value is active
     * @param {string} category - Filter category
     * @param {string} value - Filter value
     * @returns {boolean} - Whether filter is active
     */
    isFilterActive(category, value) {
        // First check if the category exists
        if (!this.activeFilters.has(category)) {
            return false;
        }
        
        // Then check if the value exists in this category
        const categoryValues = this.activeFilters.get(category);
        return categoryValues && categoryValues.has(value);
    }    /**
     * Clear all filters in a category
     * @param {string} category - Category to clear
     */
    clearCategoryFilters(category) {
        console.log(`Clearing filters for category: ${category}. Before:`, this.debugFilterState());
        
        if (this.activeFilters.has(category)) {
            // Delete the category from active filters
            this.activeFilters.delete(category);
            
            // Force refresh filteredTracks if there are no more filters
            if (this.activeFilters.size === 0) {
                this.filteredTracks = Array.from(this.dataManager.tracks.values());
            }
            
            // Apply filters and save state
            this.applyFilters();
            this.saveFilterState();
            
            // Clear the cache entry for this filter state
            this.lastFilterHash = null;
            
            console.log(`After clearing ${category} filters:`, this.debugFilterState());
        } else {
            console.log(`Category ${category} not found in active filters`);
        }
    }
      /**
     * Clear all active filters
     */
    clearAllFilters() {
        console.log('Clearing all filters. Before:', this.debugFilterState());
        
        // Clear active filters
        this.activeFilters.clear();
        
        // Make sure all tracks are included when no filters are active
        this.filteredTracks = Array.from(this.dataManager.tracks.values());
        
        // Apply filters and save state
        this.applyFilters();
        this.saveFilterState();
        
        // Clear the filter cache to ensure fresh results
        this.lastFilterHash = null;
        
        console.log('After clearing all filters:', this.debugFilterState());
    }    /**
     * Save current filter state to storage
     */
    saveFilterState() {
        const filterState = {};
        
        // Convert the Map of Sets to a plain object with arrays
        for (const [category, values] of this.activeFilters.entries()) {
            filterState[category] = Array.from(values);
        }
        
        // If the map is empty, explicitly set an empty object to clear stored filters
        if (this.activeFilters.size === 0) {
            console.log('No active filters to save, clearing storage');
        } else {
            console.log('Saving filter state:', filterState);
        }
        
        // Update storage with current filter state
        const success = this.storage.updateFilterStates(filterState);
        if (!success) {
            console.warn('Failed to save filter state to storage');
        }
        
        return success;
    }
    
    /**
     * Generate a unique hash for current filter state
     * Used for caching filter results
     * @returns {string} - Filter state hash
     */
    getFilterStateHash() {
        const parts = [];
        const sortedCategories = Array.from(this.activeFilters.keys()).sort();
        
        for (const category of sortedCategories) {
            const values = Array.from(this.activeFilters.get(category)).sort();
            parts.push(`${category}:${values.join(',')}`);
        }
        // Include search query in hash as it impacts results
        return parts.join(';') + `:${this.filterCombinationMode}` + `:q=${this.searchQuery}`;
    }
    
    /**
     * Apply all active filters to tracks
     * This is the core filtering algorithm
     */
    applyFilters() {
        // If no filters, show all tracks
        if (this.activeFilters.size === 0) {
            this.filteredTracks = Array.from(this.dataManager.tracks.values());
            return;
        }
        
        // Check cache first
        const filterHash = this.getFilterStateHash();
        if (this.lastFilterHash === filterHash) {
            return; // No change in filters
        }
        
        if (this.filterCache.has(filterHash)) {
            this.filteredTracks = this.filterCache.get(filterHash);
            this.lastFilterHash = filterHash;
            return;
        }
        
        // Filter tracks
        const allTracks = Array.from(this.dataManager.tracks.values());
        
        // Apply AND/OR logic between categories
        if (this.filterCombinationMode === 'AND') {
            // Track must match at least one value in EVERY active category
            this.filteredTracks = allTracks.filter(track => {
                const matchesFilters = Array.from(this.activeFilters.entries()).every(([category, values]) => {
                    return this.trackMatchesCategory(track, category, values);
                });
                return matchesFilters;
            });
        } else {
            // Track must match at least one value in ANY active category
            this.filteredTracks = allTracks.filter(track => {
                const matchesFilters = Array.from(this.activeFilters.entries()).some(([category, values]) => {
                    return this.trackMatchesCategory(track, category, values);
                });
                return matchesFilters;
            });
        }

        // Apply search query if present (title/artist basic search)
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            this.filteredTracks = this.filteredTracks.filter(t => {
                const title = (t.title || '').toLowerCase();
                const artist = (t.artist || '').toLowerCase();
                return title.includes(q) || artist.includes(q);
            });
        }
        
        // Cache the result
        this.filterCache.set(filterHash, this.filteredTracks);
        this.lastFilterHash = filterHash;
        
        // If we're caching too many filter combinations, clear older ones
        if (this.filterCache.size > 100) {
            // Keep only the 50 most recent
            const keys = Array.from(this.filterCache.keys());
            for (let i = 0; i < keys.length - 50; i++) {
                this.filterCache.delete(keys[i]);
            }
        }
    }
    
    /**
     * Check if a track matches any value in a category
     * @param {Object} track - Track to check
     * @param {string} category - Filter category
     * @param {Set} values - Set of values to match against
     * @returns {boolean} - Whether track matches
     */
    trackMatchesCategory(track, category, values) {
        // Get track field value for this category
        let fieldValue = track[category];
        
        // Handle special categories
        switch (category) {
            case 'year':
                return values.has(String(fieldValue));
            case 'duration':
                // Handle duration ranges
                for (const value of values) {
                    const [min, max] = value.split('-').map(Number);
                    if (fieldValue >= min && fieldValue <= max) return true;
                }
                return false;
            case 'bpm':
                // Handle BPM ranges
                for (const value of values) {
                    const [min, max] = value.split('-').map(Number);
                    if (fieldValue >= min && fieldValue <= max) return true;
                }
                return false;
            default:
                // For array fields (genre, mood, tags, etc)
                if (Array.isArray(fieldValue)) {
                    return Array.from(values).some(value => 
                        fieldValue.some(v => 
                            this.smartCompare(v, value)
                        )
                    );
                }
                // For string fields
                else if (typeof fieldValue === 'string') {
                    return Array.from(values).some(value => 
                        this.smartCompare(fieldValue, value)
                    );
                }
                // For numeric fields
                else if (typeof fieldValue === 'number') {
                    return values.has(String(fieldValue));
                }
                // Field doesn't exist
                return false;
        }
    }
    
    /**
     * Smart comparison for strings
     * Handles case-insensitive matching and similar values
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {boolean} - Whether strings match
     */
    smartCompare(a, b) {
        if (!a || !b) return false;
        
        // Exact match
        if (a === b) return true;
        
        // Case-insensitive match
        if (a.toLowerCase() === b.toLowerCase()) return true;
        
        // Similar values (e.g. "16-EDO" vs "16-tone")
        // Tuning similarities
        if (a.includes('EDO') && b.includes('tone')) {
            const aEDO = a.match(/(\d+)-EDO/i);
            const bTone = b.match(/(\d+)-tone/i);
            if (aEDO && bTone && aEDO[1] === bTone[1]) return true;
        }
        
        return false;
    }
    
    /**
     * Get all tracks after filtering
     * @returns {Array} - Filtered tracks
     */
    getFilteredTracks() {
        return this.filteredTracks;
    }
    
    /**
     * Get count of active filters
     * @returns {number} - Total number of active filter values
     */
    getActiveFilterCount(category) {
        if (typeof category === 'string') {
            if (!this.activeFilters.has(category)) return 0;
            return this.activeFilters.get(category).size;
        }
        let count = 0;
        for (const values of this.activeFilters.values()) {
            count += values.size;
        }
        return count;
    }
    
    /**
     * Get all active filters organized by category
     * @returns {Object} - Active filters by category
     */
    getActiveFilters() {
        const result = {};
        for (const [category, values] of this.activeFilters.entries()) {
            result[category] = Array.from(values);
        }
        return result;
    }
    
    /**
     * Check if there are any active filters
     * @returns {boolean} - True if there are any active filters
     */
    hasActiveFilters() {
        return this.activeFilters.size > 0 && this.getActiveFilterCount() > 0;
    }
    
    /**
     * Clear the filter cache
     */
    clearCache() {
        this.filterCache.clear();
    }

    /**
     * Return filter categories with option counts for UI
     */
    getFilterCategories() {
        const categories = [];
        const tracks = Array.from(this.dataManager.tracks.values());
        const filtersMap = this.dataManager.filters; // Map(category -> values[])

        const toTitle = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        filtersMap.forEach((values, category) => {
            // Build counts
            const counts = new Map();
            tracks.forEach(track => {
                const val = track[category];
                if (Array.isArray(val)) {
                    val.forEach(v => counts.set(String(v), (counts.get(String(v)) || 0) + 1));
                } else if (val !== undefined && val !== null) {
                    counts.set(String(val), (counts.get(String(val)) || 0) + 1);
                }
            });

            const options = values.map(v => ({
                value: String(v),
                label: String(v),
                count: counts.get(String(v)) || 0
            }));

            categories.push({
                name: category,
                displayName: toTitle(category),
                options
            });
        });

        return categories;
    }

    /**
     * Set filter states from object map
     */
    setFilterStates(stateObj) {
        this.activeFilters.clear();
        if (stateObj && typeof stateObj === 'object') {
            Object.entries(stateObj).forEach(([cat, arr]) => {
                if (Array.isArray(arr) && arr.length > 0) {
                    this.activeFilters.set(cat, new Set(arr));
                }
            });
        }
        this.applyFilters();
        this.saveFilterState();
    }

    /**
     * Expose filter states for saving
     */
    getFilterStates() {
        const out = {};
        this.activeFilters.forEach((set, cat) => {
            out[cat] = Array.from(set);
        });
        return out;
    }
    
    /**
     * Debug method to output current filter state
     * @returns {Object} Debug information about current filter state
     */
    debugFilterState() {
        const activeFiltersSimple = {};
        
        for (const [category, values] of this.activeFilters.entries()) {
            activeFiltersSimple[category] = Array.from(values);
        }
        
        return {
            activeFilters: activeFiltersSimple,
            filteredTrackCount: this.filteredTracks.length,
            totalTrackCount: this.dataManager.tracks.size,
            filterCombinationMode: this.filterCombinationMode,
            filterHash: this.getFilterStateHash(),
            isCached: this.filterCache.has(this.getFilterStateHash())
        };
    }
}

// Export
window.PlaylistEngine = PlaylistEngine;
