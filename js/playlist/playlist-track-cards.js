/**
 * Track Card Components for Playlist UI
 * Displays comprehensive track metadata with different layouts
 * Version: 1.0 - Initial implementation
 */

class TrackCard {
    constructor(track, options = {}) {
        this.track = track;
        this.options = {
            layout: 'default', // 'default', 'compact', 'detailed', 'grid'
            showMetadata: true,
            showControls: true,
            showWaveform: false,
            clickable: true,
            ...options
        };
        this.element = null;
        this.isPlaying = false;
        this.isCurrentTrack = false;
    }

    /**
     * Create the track card element
     */
    createElement() {
        const card = document.createElement('div');
        card.className = `track-card track-card--${this.options.layout}`;
        card.dataset.trackId = this.track.id;
        
        // Set up card states
        if (this.isCurrentTrack) card.classList.add('track-card--current');
        if (this.isPlaying) card.classList.add('track-card--playing');
        if (this.track.favorite) card.classList.add('track-card--favorite');

        // Build card content based on layout
        switch (this.options.layout) {
            case 'compact':
                card.innerHTML = this.createCompactLayout();
                break;
            case 'detailed':
                card.innerHTML = this.createDetailedLayout();
                break;
            case 'grid':
                card.innerHTML = this.createGridLayout();
                break;
            default:
                card.innerHTML = this.createDefaultLayout();
        }

        // Add event listeners
        this.setupEventListeners(card);
        
        this.element = card;
        return card;
    }

    /**
     * Default layout - balanced view with essential info
     */
    createDefaultLayout() {
        const duration = this.formatDuration(this.track.duration);
        const genres = this.track.genre ? this.track.genre.join(', ') : '';
        
        return `
            <div class="track-card__main">
                <div class="track-card__info">
                    <div class="track-card__title-section">
                        <h3 class="track-card__title">${this.escapeHtml(this.track.title)}</h3>
                        <span class="track-card__artist">${this.escapeHtml(this.track.artist)}</span>
                    </div>
                    <div class="track-card__metadata">
                        ${this.track.year ? `<span class="track-card__year">${this.track.year}</span>` : ''}
                        ${genres ? `<span class="track-card__genre">${this.escapeHtml(genres)}</span>` : ''}
                        ${this.track.tuning ? `<span class="track-card__tuning">${this.escapeHtml(this.track.tuning)}</span>` : ''}
                    </div>
                </div>
                <div class="track-card__controls">
                    <div class="track-card__actions">
                        <button class="track-card__btn track-card__btn--play" title="Play">
                            <span class="track-card__play-icon">▶</span>
                        </button>
                        <button class="track-card__btn track-card__btn--favorite ${this.track.favorite ? 'active' : ''}" title="Favorite">
                            <span class="track-card__favorite-icon">♥</span>
                        </button>
                        <button class="track-card__btn track-card__btn--menu" title="More options">
                            <span class="track-card__menu-icon">⋮</span>
                        </button>
                    </div>
                    <div class="track-card__duration">${duration}</div>
                </div>
            </div>
            ${this.options.showWaveform ? this.createWaveformSection() : ''}
        `;
    }

    /**
     * Compact layout - minimal info for dense lists
     */
    createCompactLayout() {
        const duration = this.formatDuration(this.track.duration);
        
        return `
            <div class="track-card__compact">
                <div class="track-card__play-indicator">
                    <span class="track-card__play-icon">▶</span>
                </div>
                <div class="track-card__info">
                    <span class="track-card__title">${this.escapeHtml(this.track.title)}</span>
                    <span class="track-card__artist">${this.escapeHtml(this.track.artist)}</span>
                </div>
                <div class="track-card__meta">
                    ${this.track.tuning ? `<span class="track-card__tuning-badge">${this.getTuningShort(this.track.tuning)}</span>` : ''}
                    <span class="track-card__duration">${duration}</span>
                </div>
            </div>
        `;
    }

    /**
     * Detailed layout - extensive metadata display
     */
    createDetailedLayout() {
        const duration = this.formatDuration(this.track.duration);
        const genres = this.track.genre ? this.track.genre.join(', ') : '';
        const instruments = this.track.instruments ? this.track.instruments.join(', ') : '';
        const tags = this.track.tags ? this.track.tags.join(', ') : '';
        
        return `
            <div class="track-card__detailed">
                <div class="track-card__header">
                    <div class="track-card__title-section">
                        <h3 class="track-card__title">${this.escapeHtml(this.track.title)}</h3>
                        <span class="track-card__artist">${this.escapeHtml(this.track.artist)}</span>
                        ${this.track.album ? `<span class="track-card__album">${this.escapeHtml(this.track.album)}</span>` : ''}
                    </div>
                    <div class="track-card__controls">
                        <button class="track-card__btn track-card__btn--play" title="Play">
                            <span class="track-card__play-icon">▶</span>
                        </button>
                        <button class="track-card__btn track-card__btn--favorite ${this.track.favorite ? 'active' : ''}" title="Favorite">
                            <span class="track-card__favorite-icon">♥</span>
                        </button>
                    </div>
                </div>
                
                <div class="track-card__metadata-grid">
                    ${this.track.year ? `
                        <div class="track-card__meta-item">
                            <span class="track-card__meta-label">Year:</span>
                            <span class="track-card__meta-value">${this.track.year}</span>
                        </div>
                    ` : ''}
                    
                    ${genres ? `
                        <div class="track-card__meta-item">
                            <span class="track-card__meta-label">Genre:</span>
                            <span class="track-card__meta-value">${this.escapeHtml(genres)}</span>
                        </div>
                    ` : ''}
                    
                    ${this.track.tuning ? `
                        <div class="track-card__meta-item">
                            <span class="track-card__meta-label">Tuning:</span>
                            <span class="track-card__meta-value">${this.escapeHtml(this.track.tuning)}</span>
                        </div>
                    ` : ''}
                    
                    ${this.track.key ? `
                        <div class="track-card__meta-item">
                            <span class="track-card__meta-label">Key:</span>
                            <span class="track-card__meta-value">${this.escapeHtml(this.track.key)}</span>
                        </div>
                    ` : ''}
                    
                    ${this.track.bpm ? `
                        <div class="track-card__meta-item">
                            <span class="track-card__meta-label">BPM:</span>
                            <span class="track-card__meta-value">${this.track.bpm}</span>
                        </div>
                    ` : ''}
                    
                    ${duration ? `
                        <div class="track-card__meta-item">
                            <span class="track-card__meta-label">Duration:</span>
                            <span class="track-card__meta-value">${duration}</span>
                        </div>
                    ` : ''}
                    
                    ${instruments ? `
                        <div class="track-card__meta-item">
                            <span class="track-card__meta-label">Instruments:</span>
                            <span class="track-card__meta-value">${this.escapeHtml(instruments)}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${this.track.description ? `
                    <div class="track-card__description">
                        <p>${this.escapeHtml(this.track.description)}</p>
                    </div>
                ` : ''}
                
                ${tags ? `
                    <div class="track-card__tags">
                        ${this.track.tags.map(tag => 
                            `<span class="track-card__tag">${this.escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                ` : ''}
                
                <div class="track-card__stats">
                    ${this.track.playCount > 0 ? `<span class="track-card__stat">Played ${this.track.playCount} times</span>` : ''}
                    ${this.track.lastPlayed ? `<span class="track-card__stat">Last played ${this.formatDate(this.track.lastPlayed)}</span>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Grid layout - card-style layout for grid displays
     */
    createGridLayout() {
        const duration = this.formatDuration(this.track.duration);
        const mainGenre = this.track.genre ? this.track.genre[0] : '';
        
        return `
            <div class="track-card__grid">
                <div class="track-card__grid-header">
                    <div class="track-card__title-section">
                        <h3 class="track-card__title">${this.escapeHtml(this.track.title)}</h3>
                        <span class="track-card__artist">${this.escapeHtml(this.track.artist)}</span>
                    </div>
                    <button class="track-card__btn track-card__btn--favorite ${this.track.favorite ? 'active' : ''}" title="Favorite">
                        <span class="track-card__favorite-icon">♥</span>
                    </button>
                </div>
                
                <div class="track-card__grid-content">
                    ${this.track.album ? `<div class="track-card__album">${this.escapeHtml(this.track.album)}</div>` : ''}
                    
                    <div class="track-card__metadata">
                        ${this.track.year ? `<span class="track-card__year">${this.track.year}</span>` : ''}
                        ${mainGenre ? `<span class="track-card__genre">${this.escapeHtml(mainGenre)}</span>` : ''}
                    </div>
                    
                    ${this.track.tuning ? `
                        <div class="track-card__tuning-highlight">
                            ${this.escapeHtml(this.track.tuning)}
                        </div>
                    ` : ''}
                </div>
                
                <div class="track-card__grid-footer">
                    <span class="track-card__duration">${duration}</span>
                    <button class="track-card__btn track-card__btn--play" title="Play">
                        <span class="track-card__play-icon">▶</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Create waveform visualization section (placeholder for future implementation)
     */
    createWaveformSection() {
        return `
            <div class="track-card__waveform">
                <div class="track-card__waveform-placeholder">
                    <span>Waveform visualization</span>
                </div>
            </div>
        `;
    }

    /**
     * Set up event listeners for the track card
     */
    setupEventListeners(card) {
        // Play button
        const playBtn = card.querySelector('.track-card__btn--play');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onPlay();
            });
        }

        // Favorite button
        const favoriteBtn = card.querySelector('.track-card__btn--favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onToggleFavorite();
            });
        }

        // Menu button
        const menuBtn = card.querySelector('.track-card__btn--menu');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onShowMenu(e);
            });
        }

        // Card click (if clickable)
        if (this.options.clickable) {
            card.addEventListener('click', () => {
                this.onCardClick();
            });
        }

        // Drag and drop (for future reordering)
        if (this.options.draggable) {
            card.draggable = true;
            card.addEventListener('dragstart', (e) => this.onDragStart(e));
            card.addEventListener('dragend', (e) => this.onDragEnd(e));
        }
    }

    /**
     * Event handlers
     */
    onPlay() {
        this.dispatchEvent('play', { track: this.track });
    }

    onToggleFavorite() {
        this.track.favorite = !this.track.favorite;
        this.element.classList.toggle('track-card--favorite', this.track.favorite);
        
        const favoriteBtn = this.element.querySelector('.track-card__btn--favorite');
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', this.track.favorite);
        }
        
        this.dispatchEvent('favorite', { track: this.track, favorite: this.track.favorite });
    }

    onShowMenu(event) {
        this.dispatchEvent('menu', { track: this.track, event });
    }

    onCardClick() {
        this.dispatchEvent('click', { track: this.track });
    }

    onDragStart(event) {
        this.element.classList.add('track-card--dragging');
        event.dataTransfer.setData('text/plain', this.track.id);
        this.dispatchEvent('dragstart', { track: this.track, event });
    }

    onDragEnd(event) {
        this.element.classList.remove('track-card--dragging');
        this.dispatchEvent('dragend', { track: this.track, event });
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, detail = {}) {
        if (this.element) {
            const event = new CustomEvent(`trackcard:${eventName}`, {
                detail,
                bubbles: true
            });
            this.element.dispatchEvent(event);
        }
    }

    /**
     * Update track card state
     */
    updateState(state = {}) {
        if (state.hasOwnProperty('isPlaying')) {
            this.isPlaying = state.isPlaying;
            this.element?.classList.toggle('track-card--playing', this.isPlaying);
            
            const playIcon = this.element?.querySelector('.track-card__play-icon');
            if (playIcon) {
                playIcon.textContent = this.isPlaying ? '⏸' : '▶';
            }
        }

        if (state.hasOwnProperty('isCurrentTrack')) {
            this.isCurrentTrack = state.isCurrentTrack;
            this.element?.classList.toggle('track-card--current', this.isCurrentTrack);
        }

        if (state.hasOwnProperty('favorite')) {
            this.track.favorite = state.favorite;
            this.element?.classList.toggle('track-card--favorite', this.track.favorite);
            
            const favoriteBtn = this.element?.querySelector('.track-card__btn--favorite');
            if (favoriteBtn) {
                favoriteBtn.classList.toggle('active', this.track.favorite);
            }
        }
    }

    /**
     * Utility methods
     */
    formatDuration(seconds) {
        if (!seconds) return '--:--';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    getTuningShort(tuning) {
        if (!tuning) return '';
        // Extract number and EDO from tuning strings like "16-tone equal temperament"
        const match = tuning.match(/(\d+)-?(?:tone|EDO|edo)/i);
        return match ? `${match[1]}EDO` : tuning.substring(0, 8);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Destroy the track card and clean up event listeners
     */
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

/**
 * Track Card Factory - creates track cards with different layouts
 */
class TrackCardFactory {
    static create(track, options = {}) {
        return new TrackCard(track, options);
    }

    static createList(tracks, options = {}) {
        return tracks.map(track => new TrackCard(track, options));
    }

    static createVirtualized(tracks, container, options = {}) {
        // For virtual scrolling integration
        const virtualOptions = {
            itemHeight: options.layout === 'compact' ? 60 : 120,
            renderItem: (track, index) => {
                const card = new TrackCard(track, options);
                return card.createElement();
            },
            ...options
        };

        return virtualOptions;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TrackCard = TrackCard;
    window.TrackCardFactory = TrackCardFactory;
}
