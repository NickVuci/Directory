/**
 * Playlist Filters - Dynamic filter generation and UI management
 * Creates auto-generated filters from track metadata
 * Version: 1.0 - Stage 2: Core Playlist Engine
 */

class PlaylistFilters {
    /**
     * Initialize playlist filters
     * @param {PlaylistDataManager} dataManager - Data manager instance
     * @param {PlaylistEngine} engine - Playlist engine instance
     */
    constructor(dataManager, engine) {
        this.dataManager = dataManager;
        this.engine = engine;
        
        // Filter categories to display and their order
        this.filterCategories = [
            { key: 'genre', label: 'Genre', isArray: true },
            { key: 'tuning', label: 'Tuning', isArray: false },
            { key: 'mood', label: 'Mood', isArray: true },
            { key: 'tags', label: 'Tags', isArray: true },
            { key: 'instruments', label: 'Instruments', isArray: true },
            { key: 'artist', label: 'Artist', isArray: false },
            { key: 'album', label: 'Album', isArray: false },
            { key: 'year', label: 'Year', isArray: false }
        ];
        
        // Maximum filter values to show initially (rest go in "Show More")
        this.initialValuesLimit = 5;
        
        // Category element references
        this.categoryElements = new Map();
    }
    
    /**
     * Initialize filter UI
     * @param {HTMLElement} containerElement - Container for filter UI
     */
    initializeUI(containerElement) {
        this.containerElement = containerElement;
        containerElement.innerHTML = '';
        
        // Create filter option mode (AND/OR) toggle
        const modeSelector = this.createFilterModeSelector();
        containerElement.appendChild(modeSelector);
        
        // Create filter categories
        for (const category of this.filterCategories) {
            const categoryElement = this.createFilterCategory(category);
            containerElement.appendChild(categoryElement);
            this.categoryElements.set(category.key, categoryElement);
        }
          // Create clear all filters button
        const clearAllButton = document.createElement('button');
        clearAllButton.className = 'playlist-filter-clear-all';
        clearAllButton.textContent = 'Clear All Filters';        clearAllButton.addEventListener('click', () => {
            this.engine.clearAllFilters();
            this.updateUI();
            
            // Add visual feedback
            this.highlightClearedFilters();
            
            // Dispatch event that all filters have been cleared
            const event = new CustomEvent('playlist-filters-changed', {
                bubbles: true,
                detail: {
                    action: 'clear-all',
                    filterCount: 0
                }
            });
            containerElement.dispatchEvent(event);
        });
        containerElement.appendChild(clearAllButton);
    }
    
    /**
     * Create filter mode selector (AND/OR)
     * @returns {HTMLElement} - Filter mode selector element
     */
    createFilterModeSelector() {
        const container = document.createElement('div');
        container.className = 'playlist-filter-mode-selector';
        
        const label = document.createElement('span');
        label.textContent = 'Filter Mode: ';
        container.appendChild(label);
        
        const select = document.createElement('select');
        
        const andOption = document.createElement('option');
        andOption.value = 'AND';
        andOption.textContent = 'Match ALL Categories (AND)';
        
        const orOption = document.createElement('option');
        orOption.value = 'OR';
        orOption.textContent = 'Match ANY Category (OR)';
        
        select.appendChild(andOption);
        select.appendChild(orOption);
        
        // Set initial value from engine
        select.value = this.engine.filterCombinationMode;
        
        // Add change event listener
        select.addEventListener('change', () => {
            this.engine.setFilterCombinationMode(select.value);
            this.updateUI();
        });
        
        container.appendChild(select);
        return container;
    }
    
    /**
     * Create a filter category dropdown with checkboxes
     * @param {Object} category - Category configuration
     * @returns {HTMLElement} - Filter category element
     */    createFilterCategory(category) {
        const container = document.createElement('div');
        container.className = 'playlist-filter-category playlist-filter-expanded'; // Start expanded
        container.dataset.category = category.key;
        
        // Category header (clickable to expand/collapse)
        const header = document.createElement('div');
        header.className = 'playlist-filter-category-header';
        
        const title = document.createElement('h3');
        title.textContent = category.label;
        
        const badge = document.createElement('span');
        badge.className = 'playlist-filter-count';
        badge.textContent = '0';
        
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'playlist-filter-toggle-icon';
        toggleIcon.innerHTML = '▴'; // Pointing up for expanded state
        
        header.appendChild(title);
        header.appendChild(badge);
        header.appendChild(toggleIcon);
        
        // Content container (for checkbox options)
        const content = document.createElement('div');
        content.className = 'playlist-filter-category-content';
        
        // Add expand/collapse functionality
        header.addEventListener('click', () => {
            container.classList.toggle('playlist-filter-expanded');
            toggleIcon.innerHTML = container.classList.contains('playlist-filter-expanded') ? '▴' : '▾';
        });
          // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'playlist-filter-clear-category';
        clearBtn.textContent = 'Clear';        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the header click
            this.engine.clearCategoryFilters(category.key);
            this.updateUI();
            
            // Add visual feedback
            this.highlightClearedFilters(category.key);
            
            // Dispatch event that filters have been cleared for this category
            const event = new CustomEvent('playlist-filters-changed', {
                bubbles: true,
                detail: {
                    category: category.key,
                    action: 'clear-category',
                    filterCount: this.engine.getActiveFilterCount()
                }
            });
            container.dispatchEvent(event);
        });
        
        header.appendChild(clearBtn);
        
        // Add elements to container
        container.appendChild(header);
        container.appendChild(content);
        
        // Populate with filter options
        this.populateFilterOptions(category, content);
        
        return container;
    }
    
    /**
     * Populate a filter category with checkbox options
     * @param {Object} category - Category configuration
     * @param {HTMLElement} container - Container to add options to
     */
    populateFilterOptions(category, container) {
        // Get available values for this category
        const filterValues = this.dataManager.filters.get(category.key) || [];
        
        // No values
        if (!filterValues.length) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'playlist-filter-empty';
            emptyMsg.textContent = 'No filter values available';
            container.appendChild(emptyMsg);
            return;
        }
        
        // Create checkbox for each value
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'playlist-filter-options';
        
        // Determine how many values to show initially vs "Show More"
        const initialValues = filterValues.slice(0, this.initialValuesLimit);
        const moreValues = filterValues.slice(this.initialValuesLimit);
        
        // Add initial values
        initialValues.forEach(value => {
            const optionElem = this.createFilterOption(category.key, value);
            optionsContainer.appendChild(optionElem);
        });
        
        // Add "Show More" section if needed
        if (moreValues.length > 0) {
            const moreContainer = document.createElement('div');
            moreContainer.className = 'playlist-filter-more-container';
            
            const moreToggle = document.createElement('button');
            moreToggle.className = 'playlist-filter-more-toggle';
            moreToggle.textContent = `Show ${moreValues.length} more...`;
            moreToggle.addEventListener('click', () => {
                moreContainer.classList.toggle('playlist-filter-more-expanded');
                moreToggle.textContent = moreContainer.classList.contains('playlist-filter-more-expanded')
                    ? 'Show fewer'
                    : `Show ${moreValues.length} more...`;
            });
            
            const moreOptions = document.createElement('div');
            moreOptions.className = 'playlist-filter-more-options';
            
            // Add more values
            moreValues.forEach(value => {
                const optionElem = this.createFilterOption(category.key, value);
                moreOptions.appendChild(optionElem);
            });
            
            moreContainer.appendChild(moreToggle);
            moreContainer.appendChild(moreOptions);
            optionsContainer.appendChild(moreContainer);
        }
        
        container.appendChild(optionsContainer);
    }
    
    /**
     * Create a single filter option checkbox
     * @param {string} category - Filter category key
     * @param {string} value - Filter value
     * @returns {HTMLElement} - Filter option element
     */
    createFilterOption(category, value) {
        const container = document.createElement('div');
        container.className = 'playlist-filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-${category}-${this.sanitizeId(value)}`;
        checkbox.dataset.category = category;
        checkbox.dataset.value = value;
        checkbox.checked = this.engine.isFilterActive(category, value);
        
        checkbox.addEventListener('change', () => {
            this.engine.toggleFilter(category, value);
            this.updateFilterCounts();
            
            // Dispatch event that filters have changed
            const event = new CustomEvent('playlist-filters-changed', {
                bubbles: true,
                detail: {
                    category: category,
                    value: value,
                    active: checkbox.checked,
                    filterCount: this.engine.getActiveFilterCount()
                }
            });
            container.dispatchEvent(event);
        });
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = value;
        
        const count = document.createElement('span');
        count.className = 'playlist-filter-option-count';
        
        // Count tracks with this value
        const trackCount = this.countTracksWithValue(category, value);
        count.textContent = `(${trackCount})`;
        
        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(count);
        
        return container;
    }
    
    /**
     * Sanitize a filter value to make it usable as an ID
     * @param {string} value - Filter value
     * @returns {string} - Sanitized value
     */
    sanitizeId(value) {
        return value.toString().toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    
    /**
     * Count tracks that have a specific category value
     * @param {string} category - Filter category key
     * @param {string} value - Filter value
     * @returns {number} - Count of tracks with value
     */
    countTracksWithValue(category, value) {
        let count = 0;
        for (const track of this.dataManager.tracks.values()) {
            if (this.engine.trackMatchesCategory(track, category, new Set([value]))) {
                count++;
            }
        }
        return count;
    }
      /**
     * Update filter counts in the UI
     */
    updateFilterCounts() {
        const activeFilters = this.engine.getActiveFilters();
        
        // Update each category badge
        for (const category of this.filterCategories) {
            const categoryElement = this.categoryElements.get(category.key);
            if (!categoryElement) continue;
            
            const badge = categoryElement.querySelector('.playlist-filter-count');
            if (!badge) continue;
            
            const count = activeFilters[category.key]?.length || 0;
            badge.textContent = count > 0 ? count : '';
            
            // Add active class if there are filters
            if (count > 0) {
                categoryElement.classList.add('playlist-filter-active');
            } else {
                categoryElement.classList.remove('playlist-filter-active');
            }
        }
    }
    
    /**
     * Add a visual feedback effect when filters are cleared
     * @param {string|null} category - Category that was cleared, or null for all categories
     */
    highlightClearedFilters(category = null) {
        if (category) {
            // Highlight specific category
            const categoryElement = this.categoryElements.get(category);
            if (categoryElement) {
                categoryElement.classList.add('playlist-filter-cleared');
                setTimeout(() => {
                    categoryElement.classList.remove('playlist-filter-cleared');
                }, 1000);
            }
        } else {
            // Highlight all categories
            for (const categoryElement of this.categoryElements.values()) {
                categoryElement.classList.add('playlist-filter-cleared');
                setTimeout(() => {
                    categoryElement.classList.remove('playlist-filter-cleared');
                }, 1000);
            }
        }
    }
      /**
     * Update the entire filter UI
     */
    updateUI() {
        console.log('Updating filter UI');
        const activeFilters = this.engine.getActiveFilters();
        console.log('Active filters for UI update:', activeFilters);
        
        // Check each checkbox
        const checkboxes = document.querySelectorAll('.playlist-filter-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const category = checkbox.dataset.category;
            const value = checkbox.dataset.value;
            const isActive = this.engine.isFilterActive(category, value);
            
            // Only update if the state has changed
            if (checkbox.checked !== isActive) {
                checkbox.checked = isActive;
                
                // Add a quick highlight effect to changed checkboxes
                const label = checkbox.nextElementSibling;
                if (label) {
                    label.classList.add('filter-option-changed');
                    setTimeout(() => {
                        label.classList.remove('filter-option-changed');
                    }, 1000);
                }
            }
        });
        
        // Update counts
        this.updateFilterCounts();
    }
    
    /**
     * Completely rebuild the filter UI
     * Call when tracks data changes significantly
     */
    rebuildFilters() {
        if (this.containerElement) {
            this.initializeUI(this.containerElement);
        }
    }
    
    /**
     * Create filter option UI for a new value
     * @param {string} category - Filter category key
     * @param {string} value - Filter value
     */
    addFilterValue(category, value) {
        const categoryElement = this.categoryElements.get(category);
        if (!categoryElement) return;
        
        const optionsContainer = categoryElement.querySelector('.playlist-filter-options');
        if (!optionsContainer) return;
        
        const optionElement = this.createFilterOption(category, value);
        optionsContainer.appendChild(optionElement);
    }
    
    /**
     * Get active filter statistics
     * @returns {Object} - Filter statistics
     */
    getFilterStats() {
        return {
            totalFilters: this.engine.getActiveFilterCount(),
            activeCategories: Object.keys(this.engine.getActiveFilters()).length,
            filteredTracks: this.engine.getFilteredTracks().length,
            totalTracks: this.dataManager.tracks.size
        };
    }
}

// Export
window.PlaylistFilters = PlaylistFilters;