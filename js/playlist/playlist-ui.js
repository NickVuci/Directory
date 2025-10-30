/**
 * Playlist UI Components & Layout
 * Stage 3: Expandable UI components with smooth animations
 * Version: 1.0 - UI Components & Layout
 */

class PlaylistUI {
    constructor() {        this.isExpanded = false;
        this.expandedSections = new Set(['filters']); // Default expanded sections
        this.currentView = 'all'; // 'all', 'queue', 'favorites'
        this.isMobile = window.innerWidth <= 768;
        
        // Player state
        this.currentTrack = null;
        this.isPlaying = false;
        
        // UI state
        this.state = {
            showMetadata: true,
            viewLayout: 'default'
        };
        
        // Initialize components
        this.dataManager = null;
        this.engine = null;
        this.virtualScrollManager = null;
        this.storage = null;
        
        // DOM elements
        this.container = null;
        this.toggleButton = null;
        this.playlistContent = null;
        this.filterPanel = null;
        this.trackList = null;
        this.searchInput = null;
        
        // Initialize
        this.initialize();
    }    /**
     * Initialize the playlist UI system
     */
    async initialize() {
        console.log('Initializing Playlist UI...');
        
        try {
            // Show loading state
            this.showLoading('Loading playlist system...');
            
            // Wait for dependencies to be available
            await this.waitForDependencies();
            
            // Initialize core components
            this.initializeComponents();
            
            // Create UI structure
            this.createPlaylistToggleButton();
            this.createPlaylistContainer();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load saved preferences
            this.loadUserPreferences();
            
            // Hide loading state
            this.hideLoading();
            
            console.log('Playlist UI initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Playlist UI:', error);
            this.handleDependencyError(error);
            this.hideLoading();
        }
    }

    /**
     * Wait for required dependencies to be loaded
     */
    async waitForDependencies() {
        const maxWait = 5000; // 5 seconds
        const startTime = Date.now();
          while (Date.now() - startTime < maxWait) {
            if (window.PlaylistData && 
                window.PlaylistEngine && 
                window.PlaylistVirtualScroll && 
                window.PlaylistStorage) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('Failed to load playlist dependencies');
    }

    /**
     * Initialize core playlist components
     */    initializeComponents() {
        // Storage first so engine can read preferences
        this.storage = new PlaylistStorage();
        this.dataManager = new PlaylistData();
        this.engine = new PlaylistEngine(this.dataManager, this.storage);
        
        // Load saved filter states
        const savedFilters = this.storage.getFilterStates?.() || null;
        if (savedFilters) {
            this.engine.setFilterStates(savedFilters);
        }
    }

    /**
     * Create the playlist toggle button in the footer player
     */
    createPlaylistToggleButton() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        // Create toggle button
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'playlist-toggle-btn';
        this.toggleButton.innerHTML = `
            <span class="playlist-toggle-icon">♫</span>
            <span class="playlist-toggle-text">Playlist</span>
        `;
        this.toggleButton.setAttribute('aria-label', 'Toggle playlist');
        this.toggleButton.setAttribute('aria-expanded', 'false');

        // Position button at top of footer
        footer.style.position = 'relative';
        footer.appendChild(this.toggleButton);

        // Add click handler
        this.toggleButton.addEventListener('click', () => this.togglePlaylist());
    }

    /**
     * Create the main playlist container
     */
    createPlaylistContainer() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'playlist-container';
        this.container.setAttribute('aria-hidden', 'true');
        
        // Create playlist content structure
        this.container.innerHTML = `
            <div class="playlist-header">
                <div class="playlist-title">
                    <h3>Music Library</h3>
                    <span class="playlist-count">0 tracks</span>
                </div>
                <div class="playlist-view-controls">
                    <button class="playlist-view-btn active" data-view="all">All</button>
                    <button class="playlist-view-btn" data-view="queue">Queue</button>
                    <button class="playlist-view-btn" data-view="favorites">Favorites</button>
                </div>
                <button class="playlist-close-btn" aria-label="Close playlist">×</button>
            </div>
            
            <div class="playlist-content">
                <div class="playlist-search-section">
                    <div class="playlist-search-container">
                        <input type="text" class="playlist-search-input" placeholder="Search tracks..." aria-label="Search tracks">
                        <button class="playlist-search-clear" aria-label="Clear search">×</button>
                    </div>
                </div>
                
                <div class="playlist-filters-section">
                    <div class="playlist-section-header">
                        <h4>Filters</h4>
                        <button class="playlist-section-toggle" data-section="filters" aria-label="Toggle filters">
                            <span class="playlist-section-icon">▼</span>
                        </button>
                    </div>
                    <div class="playlist-section-content" data-section="filters">
                        <div class="playlist-filters-container">
                            <!-- Filters will be generated here -->
                        </div>
                    </div>
                </div>
                
                <div class="playlist-tracks-section">
                    <div class="playlist-section-header">
                        <h4>
                            <span class="playlist-tracks-title">All Tracks</span>
                            <span class="playlist-tracks-count">(0)</span>
                        </h4>
                        <div class="playlist-tracks-controls">
                            <button class="playlist-play-all-btn" title="Play all tracks">▶ Play All</button>
                            <button class="playlist-shuffle-btn" title="Shuffle all tracks">🔀 Shuffle</button>
                        </div>
                    </div>
                    <div class="playlist-section-content" data-section="tracks">
                        <div class="playlist-tracks-container">
                            <!-- Virtual scrolled track list will be here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert before footer
        const footer = document.querySelector('.footer');
        if (footer && footer.parentNode) {
            footer.parentNode.insertBefore(this.container, footer);
        }

        // Cache DOM references
        this.playlistContent = this.container.querySelector('.playlist-content');
        this.filterPanel = this.container.querySelector('.playlist-filters-container');
        this.trackList = this.container.querySelector('.playlist-tracks-container');
        this.searchInput = this.container.querySelector('.playlist-search-input');

        // Initialize sections
        this.initializeFilterPanel();
        this.initializeTrackList();
        this.updatePlaylistCount();
    }

    /**
     * Initialize the filter panel with auto-generated filters
     */
    initializeFilterPanel() {
        if (!this.filterPanel || !this.engine) return;

        const filterCategories = this.engine.getFilterCategories();
        
        // Create filter mode selector
        const modeSelector = document.createElement('div');
        modeSelector.className = 'playlist-filter-mode-selector';
        modeSelector.innerHTML = `
            <span>Filter Mode:</span>
            <select class="playlist-filter-mode">
                <option value="AND">Match All (AND)</option>
                <option value="OR">Match Any (OR)</option>
            </select>
        `;
        this.filterPanel.appendChild(modeSelector);

        // Create filter categories
        filterCategories.forEach(category => {
            const categoryElement = this.createFilterCategory(category);
            this.filterPanel.appendChild(categoryElement);
        });

        // Create clear all button
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'playlist-filter-clear-all';
        clearAllBtn.textContent = 'Clear All Filters';
        clearAllBtn.addEventListener('click', () => this.clearAllFilters());
        this.filterPanel.appendChild(clearAllBtn);
    }

    /**
     * Create a filter category UI component
     */
    createFilterCategory(category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'playlist-filter-category';
        if (this.expandedSections.has('filters')) {
            categoryDiv.classList.add('playlist-filter-expanded');
        }

        const activeCount = this.engine.getActiveFilterCount(category.name);
        const isActive = activeCount > 0;

        categoryDiv.innerHTML = `
            <div class="playlist-filter-category-header ${isActive ? 'playlist-filter-active' : ''}">
                <h3>
                    ${category.displayName}
                    ${isActive ? `<span class="playlist-filter-count">${activeCount}</span>` : ''}
                </h3>
                <div class="playlist-filter-category-controls">
                    ${isActive ? '<button class="playlist-filter-clear-category">Clear</button>' : ''}
                    <span class="playlist-filter-toggle-icon">▼</span>
                </div>
            </div>
            <div class="playlist-filter-category-content">
                <div class="playlist-filter-options">
                    ${this.renderFilterOptions(category)}
                </div>
            </div>
        `;

        // Add event listeners
        const header = categoryDiv.querySelector('.playlist-filter-category-header');
        const clearBtn = categoryDiv.querySelector('.playlist-filter-clear-category');
        
        header.addEventListener('click', (e) => {
            if (e.target === clearBtn) return; // Don't toggle when clicking clear
            this.toggleFilterCategory(categoryDiv, category.name);
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearCategoryFilters(category.name);
            });
        }

        return categoryDiv;
    }

    /**
     * Render filter options for a category
     */
    renderFilterOptions(category) {
        const options = category.options.slice(0, 10); // Show first 10 options
        const hasMore = category.options.length > 10;

        let html = options.map(option => `
            <div class="playlist-filter-option">
                <input type="checkbox" 
                       id="filter-${category.name}-${option.value}" 
                       value="${option.value}"
                       data-category="${category.name}"
                       ${this.engine.isFilterActive(category.name, option.value) ? 'checked' : ''}>
                <label for="filter-${category.name}-${option.value}">
                    ${option.label}
                    <span class="playlist-filter-option-count">(${option.count})</span>
                </label>
            </div>
        `).join('');

        if (hasMore) {
            const moreOptions = category.options.slice(10);
            html += `
                <div class="playlist-filter-more-container">
                    <button class="playlist-filter-more-toggle">Show ${moreOptions.length} more...</button>
                    <div class="playlist-filter-more-options">
                        ${moreOptions.map(option => `
                            <div class="playlist-filter-option">
                                <input type="checkbox" 
                                       id="filter-${category.name}-${option.value}" 
                                       value="${option.value}"
                                       data-category="${category.name}"
                                       ${this.engine.isFilterActive(category.name, option.value) ? 'checked' : ''}>
                                <label for="filter-${category.name}-${option.value}">
                                    ${option.label}
                                    <span class="playlist-filter-option-count">(${option.count})</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return html;
    }    /**
     * Initialize the track list with virtual scrolling and track cards
     */
    initializeTrackList() {
        if (!this.trackList) return;

        // Configure virtual scrolling with track cards
        const virtualScrollOptions = {
            container: this.trackList,
            itemHeight: this.getTrackItemHeight(),
            renderItem: (track, index) => this.renderTrackCard(track, index),
            bufferSize: 5,
            onScroll: (scrollTop) => this.onTrackListScroll(scrollTop),
            onVisibilityChange: (startIndex, endIndex) => this.onTrackVisibilityChange(startIndex, endIndex)
        };

        // Initialize virtual scroll manager
        this.virtualScrollManager = new PlaylistVirtualScroll(virtualScrollOptions);
        
        // Load initial tracks
        this.loadTracks();
    }

    /**
     * Get track item height based on current layout
     */
    getTrackItemHeight() {
        const viewMode = this.getViewMode();
        switch (viewMode) {
            case 'compact': return 60;
            case 'detailed': return 200;
            case 'grid': return 220;
            default: return 120;
        }
    }

    /**
     * Get current view mode
     */
    getViewMode() {
        const activeBtn = this.container.querySelector('.playlist-view-btn.active');
        return activeBtn ? activeBtn.dataset.view : 'all';
    }

    /**
     * Render a track card for the virtual scroll list
     */
    renderTrackCard(track, index) {
        const layout = this.getTrackCardLayout();
        const options = {
            layout,
            showMetadata: true,
            showControls: true,
            clickable: true,
            draggable: this.getViewMode() === 'queue'
        };

        // Create track card instance
        const trackCard = new TrackCard(track, options);
        const element = trackCard.createElement();

        // Update card state based on current player state
        if (this.currentTrack && this.currentTrack.id === track.id) {
            trackCard.updateState({ 
                isCurrentTrack: true, 
                isPlaying: this.isPlaying 
            });
        }

        // Add event listeners
        this.setupTrackCardEvents(element, track, trackCard);

        return element;
    }

    /**
     * Get the appropriate track card layout
     */
    getTrackCardLayout() {
        const viewMode = this.getViewMode();
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            return 'compact';
        }
        
        switch (viewMode) {
            case 'detailed': return 'detailed';
            case 'grid': return 'grid';
            case 'compact': return 'compact';
            default: return 'default';
        }
    }

    /**
     * Setup event listeners for track cards
     */
    setupTrackCardEvents(element, track, trackCard) {
        // Play track
        element.addEventListener('trackcard:play', (e) => {
            this.playTrack(track);
        });

        // Toggle favorite
        element.addEventListener('trackcard:favorite', (e) => {
            this.toggleTrackFavorite(track, e.detail.favorite);
        });

        // Show context menu
        element.addEventListener('trackcard:menu', (e) => {
            this.showTrackContextMenu(track, e.detail.event);
        });

        // Card click (play or select)
        element.addEventListener('trackcard:click', (e) => {
            if (this.getViewMode() === 'queue') {
                this.selectTrack(track);
            } else {
                this.playTrack(track);
            }
        });

        // Drag and drop for queue reordering
        if (this.getViewMode() === 'queue') {
            element.addEventListener('trackcard:dragstart', (e) => {
                this.startTrackDrag(track, e.detail.event);
            });

            element.addEventListener('trackcard:dragend', (e) => {
                this.endTrackDrag(track, e.detail.event);
            });
        }
    }

    /**
     * Load tracks into the virtual scroll
     */
    loadTracks() {
        this.updateTrackList();
    }

    /**
     * Toggle track favorite status
     */
    toggleTrackFavorite(track, isFavorite) {
        // Update track data
        track.favorite = isFavorite;
        
        // Dispatch event to save changes
        const favoriteEvent = new CustomEvent('playlist:favoriteToggled', {
            detail: { track, favorite: isFavorite }
        });
        document.dispatchEvent(favoriteEvent);
        
        console.log(`Track ${track.title} ${isFavorite ? 'added to' : 'removed from'} favorites`);
    }

    /**
     * Show context menu for track
     */
    showTrackContextMenu(track, event) {
        // TODO: Implement context menu
        console.log('Show context menu for:', track.title, event);
    }

    /**
     * Select track (for queue management)
     */
    selectTrack(track) {
        // TODO: Implement track selection for queue management
        console.log('Selected track:', track.title);
    }

    /**
     * Start track drag operation
     */
    startTrackDrag(track, event) {
        // TODO: Implement drag start for queue reordering
        console.log('Start drag:', track.title);
    }

    /**
     * End track drag operation
     */
    endTrackDrag(track, event) {
        // TODO: Implement drag end for queue reordering
        console.log('End drag:', track.title);
    }

    /**
     * Handle track list scroll for virtual scrolling optimizations
     */
    onTrackListScroll(scrollTop) {
        // TODO: Implement scroll optimizations
    }

    /**
     * Handle track visibility changes for performance
     */
    onTrackVisibilityChange(startIndex, endIndex) {
        // TODO: Implement visibility change optimizations
    }

    /**
     * Render a single track item
     */
    renderTrackItem(track, index) {
        const trackElement = document.createElement('div');
        trackElement.className = 'playlist-track-item';
        trackElement.dataset.trackId = track.id;
        trackElement.dataset.index = index;

        const duration = this.formatDuration(track.duration || 0);
        const genres = Array.isArray(track.genre) ? track.genre.join(', ') : (track.genre || 'Unknown');
        const moods = Array.isArray(track.mood) ? track.mood.join(', ') : (track.mood || '');

        trackElement.innerHTML = `
            <div class="playlist-track-info">
                <div class="playlist-track-title">${track.title || 'Unknown Title'}</div>
                <div class="playlist-track-artist">${track.artist || 'Unknown Artist'}</div>
                <div class="playlist-track-metadata">
                    ${track.tuning || 'Standard tuning'} • ${genres}
                    ${moods ? ` • ${moods}` : ''} • ${duration}
                </div>
            </div>
            <div class="playlist-track-controls">
                <button class="playlist-track-play" title="Play track" data-action="play">
                    ▶
                </button>
                <button class="playlist-track-options" title="More options" data-action="options">
                    ⋮
                </button>
            </div>
        `;

        // Add event listeners
        trackElement.addEventListener('click', (e) => this.handleTrackClick(e, track, index));

        return trackElement;
    }

    /**
     * Handle track item clicks
     */
    handleTrackClick(event, track, index) {
        const action = event.target.dataset.action;
        
        switch (action) {
            case 'play':
                this.playTrack(track, index);
                break;
            case 'options':
                this.showTrackOptions(track, event.target);
                break;
            default:
                // Click on track info - play track
                if (!event.target.closest('.playlist-track-controls')) {
                    this.playTrack(track, index);
                }
                break;
        }
    }

    /**
     * Play a specific track
     */
    playTrack(track, index) {
        // Dispatch event to player
        const playEvent = new CustomEvent('playlist:playTrack', {
            detail: { track, index, playlist: this.engine.getFilteredTracks() }
        });
        document.dispatchEvent(playEvent);
        
        console.log(`Playing track: ${track.title}`);
    }

    /**
     * Toggle the playlist visibility
     */
    togglePlaylist() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.showPlaylist();
        } else {
            this.hidePlaylist();
        }
        
        // Save state
        this.storage.set('playlistExpanded', this.isExpanded);
    }

    /**
     * Show the playlist with animation
     */
    showPlaylist() {
        this.container.classList.add('playlist-expanded');
        this.container.setAttribute('aria-hidden', 'false');
        this.toggleButton.setAttribute('aria-expanded', 'true');
        this.toggleButton.classList.add('active');
        
        // Focus search input for accessibility
        setTimeout(() => {
            if (this.searchInput && !this.isMobile) {
                this.searchInput.focus();
            }
        }, 300);
        
        // Update track list in case data changed
        this.updateTrackList();
    }

    /**
     * Hide the playlist with animation
     */
    hidePlaylist() {
        this.container.classList.remove('playlist-expanded');
        this.container.setAttribute('aria-hidden', 'true');
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.toggleButton.classList.remove('active');
    }

    /**
     * Toggle filter category expansion
     */
    toggleFilterCategory(categoryElement, categoryName) {
        const isExpanded = categoryElement.classList.contains('playlist-filter-expanded');
        
        if (isExpanded) {
            categoryElement.classList.remove('playlist-filter-expanded');
            this.expandedSections.delete(categoryName);
        } else {
            categoryElement.classList.add('playlist-filter-expanded');
            this.expandedSections.add(categoryName);
        }
        
        // Save state
        this.storage.set('expandedSections', Array.from(this.expandedSections));
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300); // Debounced search
            });
        }

        // Filter change handling
        this.container.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"][data-category]')) {
                this.handleFilterChange(e.target);
            } else if (e.target.matches('.playlist-filter-mode')) {
                this.handleFilterModeChange(e.target.value);
            }
        });

        // View controls
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.playlist-view-btn')) {
                this.switchView(e.target.dataset.view);
            } else if (e.target.matches('.playlist-close-btn')) {
                this.hidePlaylist();
            } else if (e.target.matches('.playlist-section-toggle')) {
                this.toggleSection(e.target.dataset.section);
            } else if (e.target.matches('.playlist-filter-more-toggle')) {
                this.toggleMoreFilters(e.target);
            } else if (e.target.matches('.playlist-play-all-btn')) {
                this.playAllTracks();
            } else if (e.target.matches('.playlist-shuffle-btn')) {
                this.shuffleAllTracks();
            }
        });

        // Close playlist when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isExpanded && 
                !this.container.contains(e.target) && 
                !this.toggleButton.contains(e.target)) {
                this.hidePlaylist();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.hidePlaylist();
            }
        });

        // Responsive handling
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.updateResponsiveLayout();
            }
        });
    }

    /**
     * Handle search input
     */
    handleSearch(query = '') {
        this.showLoading('Searching tracks...');
        
        // Delay search to simulate loading
        setTimeout(() => {
            this.engine.setSearchQuery(query);
            this.updateTrackList();
            this.updatePlaylistCount();
            this.hideLoading();
        }, 500);
    }

    /**
     * Handle filter checkbox changes
     */
    handleFilterChange(checkbox) {
        const category = checkbox.dataset.category;
        const value = checkbox.value;
        const isChecked = checkbox.checked;

        if (isChecked) {
            this.engine.addFilter(category, value);
        } else {
            this.engine.removeFilter(category, value);
        }

        // Update UI
        this.updateTrackList();
        this.updatePlaylistCount();
        this.updateFilterUI();
        
    // Save filter state
    this.storage.updateFilterStates?.(this.engine.getFilterStates());
    }

    /**
     * Handle filter mode changes
     */
    handleFilterModeChange(mode) {
        this.engine.setFilterMode(mode);
        this.updateTrackList();
        this.updatePlaylistCount();
        
        // Save mode
        this.storage.set('filterMode', mode);
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        this.engine.clearAllFilters();
        this.updateTrackList();
        this.updatePlaylistCount();
        this.updateFilterUI();
        
    // Save cleared state
    this.storage.updateFilterStates?.({});
    }

    /**
     * Clear filters for a specific category
     */
    clearCategoryFilters(categoryName) {
        this.engine.clearCategoryFilters(categoryName);
        this.updateTrackList();
        this.updatePlaylistCount();
        this.updateFilterUI();
        
    // Save state
    this.storage.updateFilterStates?.(this.engine.getFilterStates());
    }    /**
     * Update the track list with current filters
     */
    updateTrackList() {
        if (!this.virtualScrollManager) return;

        const filteredTracks = this.engine.getFilteredTracks();
        this.virtualScrollManager.setItems(filteredTracks);
    }

    /**
     * Update the playlist count display
     */
    updatePlaylistCount() {
        const totalTracks = this.dataManager.getTracks().length;
        const filteredTracks = this.engine.getFilteredTracks().length;
        
        const countElement = this.container.querySelector('.playlist-count');
        const tracksCountElement = this.container.querySelector('.playlist-tracks-count');
        
        if (countElement) {
            countElement.textContent = `${filteredTracks} of ${totalTracks} tracks`;
        }
        
        if (tracksCountElement) {
            tracksCountElement.textContent = `(${filteredTracks})`;
        }
    }

    /**
     * Update filter UI after changes
     */
    updateFilterUI() {
        // Refresh filter categories with updated counts
        this.filterPanel.innerHTML = '';
        this.initializeFilterPanel();
    }

    /**
     * Play all current tracks
     */
    playAllTracks() {
        const tracks = this.engine.getFilteredTracks();
        if (tracks.length === 0) return;

        const playEvent = new CustomEvent('playlist:playAll', {
            detail: { tracks, shuffle: false }
        });
        document.dispatchEvent(playEvent);
    }

    /**
     * Shuffle and play all tracks
     */
    shuffleAllTracks() {
        const tracks = this.engine.getFilteredTracks();
        if (tracks.length === 0) return;

        const playEvent = new CustomEvent('playlist:playAll', {
            detail: { tracks, shuffle: true }
        });
        document.dispatchEvent(playEvent);
    }

    /**
     * Format duration from seconds to MM:SS
     */
    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Switch between playlist views
     */
    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        this.container.querySelectorAll('.playlist-view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update track list based on view
        this.updateTrackList();
        
        // Save view preference
        this.storage.set('currentView', view);
    }

    /**
     * Toggle section expansion
     */
    toggleSection(sectionName) {
        const isExpanded = this.expandedSections.has(sectionName);
        
        if (isExpanded) {
            this.expandedSections.delete(sectionName);
        } else {
            this.expandedSections.add(sectionName);
        }
        
        // Update UI
        const sectionContent = this.container.querySelector(`[data-section="${sectionName}"]`);
        const toggle = this.container.querySelector(`[data-section="${sectionName}"] + .playlist-section-toggle`);
        
        if (sectionContent) {
            sectionContent.classList.toggle('expanded', !isExpanded);
        }
        
        if (toggle) {
            const icon = toggle.querySelector('.playlist-section-icon');
            if (icon) {
                icon.textContent = isExpanded ? '▼' : '▲';
            }
        }
        
        // Save state
        this.storage.set('expandedSections', Array.from(this.expandedSections));
    }

    /**
     * Toggle "show more" filters
     */
    toggleMoreFilters(button) {
        const container = button.closest('.playlist-filter-more-container');
        const isExpanded = container.classList.contains('playlist-filter-more-expanded');
        
        container.classList.toggle('playlist-filter-more-expanded', !isExpanded);
        button.textContent = isExpanded ? 
            `Show ${container.querySelectorAll('.playlist-filter-more-options .playlist-filter-option').length} more...` :
            'Show less...';
    }

    /**
     * Update responsive layout
     */
    updateResponsiveLayout() {
        if (this.isMobile && this.isExpanded) {
            // On mobile, make playlist full screen
            this.container.classList.add('playlist-mobile-fullscreen');
        } else {
            this.container.classList.remove('playlist-mobile-fullscreen');
        }
    }

    /**
     * Load user preferences from storage
     */
    loadUserPreferences() {
        const expandedState = this.storage.get('playlistExpanded');
        const expandedSections = this.storage.get('expandedSections');
        const currentView = this.storage.get('currentView');
        const filterMode = this.storage.get('filterMode');

        if (expandedState) {
            this.isExpanded = expandedState;
            if (this.isExpanded) {
                this.showPlaylist();
            }
        }

        if (expandedSections) {
            this.expandedSections = new Set(expandedSections);
        }

        if (currentView) {
            this.switchView(currentView);
        }

        if (filterMode) {
            this.engine.setFilterMode(filterMode);
            const modeSelect = this.container.querySelector('.playlist-filter-mode');
            if (modeSelect) {
                modeSelect.value = filterMode;
            }
        }
    }

    /**
     * Show track options menu
     */
    showTrackOptions(track, buttonElement) {
        // Create context menu for track options
        console.log('Track options for:', track.title);
        // TODO: Implement context menu for add to queue, favorites, etc.
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        if (!this.container) return;
        
        // Create loading overlay if it doesn't exist
        let loadingOverlay = this.container.querySelector('.playlist-loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'playlist-loading-overlay';
            this.container.appendChild(loadingOverlay);
        }
        
        loadingOverlay.innerHTML = `
            <div class="playlist-loading-content">
                <div class="playlist-loading-spinner"></div>
                <div class="playlist-loading-message">${message}</div>
            </div>
        `;
        loadingOverlay.style.display = 'flex';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (!this.container) return;
        
        const loadingOverlay = this.container.querySelector('.playlist-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message, isTemporary = true) {
        if (!this.container) return;
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'playlist-error-message';
        errorElement.innerHTML = `
            <div class="playlist-error-content">
                <span class="playlist-error-icon">⚠</span>
                <span class="playlist-error-text">${message}</span>
                <button class="playlist-error-close" aria-label="Close error">&times;</button>
            </div>
        `;
        
        // Insert at top of playlist content
        const playlistContent = this.container.querySelector('.playlist-content');
        if (playlistContent) {
            playlistContent.insertBefore(errorElement, playlistContent.firstChild);
        }
        
        // Add close handler
        const closeBtn = errorElement.querySelector('.playlist-error-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                errorElement.remove();
            });
        }
        
        // Auto-hide temporary errors after 5 seconds
        if (isTemporary) {
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.remove();
                }
            }, 5000);
        }
    }

    /**
     * Update player state from external player
     */
    updatePlayerState(state) {
        if (state.hasOwnProperty('currentTrack')) {
            this.currentTrack = state.currentTrack;
        }
        
        if (state.hasOwnProperty('isPlaying')) {
            this.isPlaying = state.isPlaying;
        }
        
        // Update all visible track cards
        this.updateVisibleTrackCards();
    }

    /**
     * Update all visible track cards with current state
     */
    updateVisibleTrackCards() {
        if (!this.container) return;
        
        const trackCards = this.container.querySelectorAll('.track-card');
        trackCards.forEach(cardElement => {
            const trackId = cardElement.dataset.trackId;
            const isCurrentTrack = this.currentTrack && this.currentTrack.id === trackId;
            
            // Update current track highlighting
            cardElement.classList.toggle('track-card--current', isCurrentTrack);
            cardElement.classList.toggle('track-card--playing', isCurrentTrack && this.isPlaying);
            
            // Update play icon
            const playIcon = cardElement.querySelector('.track-card__play-icon');
            if (playIcon && isCurrentTrack) {
                playIcon.textContent = this.isPlaying ? '⏸' : '▶';
            } else if (playIcon) {
                playIcon.textContent = '▶';
            }
        });
    }

    /**
     * Handle graceful degradation when dependencies fail to load
     */
    handleDependencyError(error) {
        console.error('Playlist dependency error:', error);
        
        this.showError(
            'Some playlist features may not be available. Please refresh the page to try again.',
            false
        );
        
        // Create minimal fallback UI
        this.createFallbackUI();
    }

    /**
     * Create minimal fallback UI when full playlist system fails
     */
    createFallbackUI() {
        if (!this.toggleButton) return;
        
        // Replace toggle button with simple track list
        this.toggleButton.addEventListener('click', () => {
            if (window.tracksData && window.tracksData.tracks) {
                const trackList = window.tracksData.tracks.map(track => 
                    `${track.title} - ${track.artist}`
                ).join('\n');
                
                alert(`Available tracks:\n\n${trackList}`);
            } else {
                alert('Track data not available');
            }
        });
    }

    /**
     * Get current UI state for debugging
     */
    getState() {
        return {
            isExpanded: this.isExpanded,
            expandedSections: Array.from(this.expandedSections),
            currentView: this.currentView,
            isMobile: this.isMobile,
            trackCount: this.dataManager?.getTracks().length || 0,
            filteredCount: this.engine?.getFilteredTracks().length || 0
        };
    }
}

// Export for global access
window.PlaylistUI = PlaylistUI;
