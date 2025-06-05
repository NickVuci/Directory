/**
 * Virtual Scrolling for Playlist
 * Efficiently renders only the visible portion of large track lists
 * Version: 1.0 - Stage 2: Core Playlist Engine
 */

class PlaylistVirtualScroll {
    /**
     * Initialize the virtual scroll
     * @param {HTMLElement} container - Scrollable container element
     * @param {Function} renderItemCallback - Function to render a single item
     * @param {number} itemHeight - Height of each item in pixels
     * @param {number} bufferSize - Number of items to render outside viewport
     */
    constructor(container, renderItemCallback, itemHeight = 60, bufferSize = 5) {
        this.container = container;
        this.renderItem = renderItemCallback;
        this.itemHeight = itemHeight;
        this.bufferSize = bufferSize;
        this.items = [];
        this.visibleItems = new Map(); // Map of currently rendered items by index
        
        this.totalHeight = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.lastScrollPosition = 0;
        this.contentWrapper = null;
        this.spacerTop = null;
        this.spacerBottom = null;
        this.ticking = false;
        this.initialized = false;
        
        // IntersectionObserver for optimization
        this.observer = null;
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize the virtual scroll structure
     */
    initialize() {
        // Create the structure
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.className = 'playlist-virtual-scroll-content';
        
        this.spacerTop = document.createElement('div');
        this.spacerTop.className = 'playlist-virtual-scroll-spacer';
        
        this.spacerBottom = document.createElement('div');
        this.spacerBottom.className = 'playlist-virtual-scroll-spacer';
        
        this.container.innerHTML = '';
        this.container.appendChild(this.spacerTop);
        this.container.appendChild(this.contentWrapper);
        this.container.appendChild(this.spacerBottom);
        
        // Add styles
        this.container.style.overflowY = 'auto';
        this.contentWrapper.style.position = 'relative';
        
        // Setup scroll listener
        this.container.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Setup resize observer for container size changes
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(entries => {
                this.updateVisibleItems();
            });
            ro.observe(this.container);
        }
        
        // Create IntersectionObserver for rendering optimization
        if (window.IntersectionObserver) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                { root: this.container, threshold: 0 }
            );
        }
        
        this.initialized = true;
    }
    
    /**
     * Set the data items for the list
     * @param {Array} items - Array of data items to display
     */
    setItems(items) {
        this.items = items || [];
        this.totalHeight = this.items.length * this.itemHeight;
        this.updateVisibleItems(true);
    }
    
    /**
     * Handle scroll events
     * @param {Event} event - Scroll event
     */
    handleScroll(event) {
        if (!this.ticking) {
            // Use requestAnimationFrame for performance
            window.requestAnimationFrame(() => {
                this.updateVisibleItems();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    /**
     * Handle intersection observations
     * Used to dynamically load and unload items
     * @param {Array} entries - IntersectionObserver entries
     */
    handleIntersection(entries) {
        // Optimization potential here - we could load/unload
        // items more intelligently based on intersection
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                // Item is no longer visible, could be unloaded
                // For now, we'll let updateVisibleItems handle this
            }
        });
    }
    
    /**
     * Update the list of visible items
     * @param {boolean} forceUpdate - Whether to force complete rerender
     */
    updateVisibleItems(forceUpdate = false) {
        if (!this.initialized || this.items.length === 0) return;
        
        // Calculate visible range based on scroll position
        const scrollTop = this.container.scrollTop;
        const viewportHeight = this.container.clientHeight;
        
        // Only update if scrolled enough or forced
        if (!forceUpdate && Math.abs(scrollTop - this.lastScrollPosition) < this.itemHeight / 2) {
            return;
        }
        
        this.lastScrollPosition = scrollTop;
        
        // Calculate start and end indices with buffer
        this.startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
        this.endIndex = Math.min(
            this.items.length - 1,
            Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.bufferSize
        );
        
        // Update spacers
        this.spacerTop.style.height = `${this.startIndex * this.itemHeight}px`;
        this.spacerBottom.style.height = `${(this.items.length - this.endIndex - 1) * this.itemHeight}px`;
        
        // Determine which items need to be added/removed
        const newVisibleIndices = new Set();
        for (let i = this.startIndex; i <= this.endIndex; i++) {
            newVisibleIndices.add(i);
        }
        
        // Remove items that are no longer visible
        for (const [index, element] of this.visibleItems.entries()) {
            if (!newVisibleIndices.has(index)) {
                // Remove from DOM
                if (element.parentNode === this.contentWrapper) {
                    this.contentWrapper.removeChild(element);
                }
                // Remove from our tracking
                this.visibleItems.delete(index);
                
                // Remove from observer
                if (this.observer) {
                    this.observer.unobserve(element);
                }
            }
        }
        
        // Add new visible items
        for (let i = this.startIndex; i <= this.endIndex; i++) {
            if (!this.visibleItems.has(i) && i < this.items.length) {
                const item = this.items[i];
                const element = this.renderItem(item, i);
                
                // Position the element absolutely
                element.style.position = 'absolute';
                element.style.top = `${i * this.itemHeight}px`;
                element.style.width = '100%';
                element.style.height = `${this.itemHeight}px`;
                
                // Add to DOM
                this.contentWrapper.appendChild(element);
                
                // Add to our tracking
                this.visibleItems.set(i, element);
                
                // Add to observer
                if (this.observer) {
                    this.observer.observe(element);
                }
            }
        }
    }
    
    /**
     * Update an item in the list
     * @param {number} index - Index of item to update
     * @param {Object} newItem - New item data
     */
    updateItem(index, newItem) {
        if (index >= 0 && index < this.items.length) {
            this.items[index] = newItem;
            
            // If the item is currently visible, re-render it
            if (this.visibleItems.has(index)) {
                const oldElement = this.visibleItems.get(index);
                const newElement = this.renderItem(newItem, index);
                
                // Copy positioning styles
                newElement.style.position = 'absolute';
                newElement.style.top = `${index * this.itemHeight}px`;
                newElement.style.width = '100%';
                newElement.style.height = `${this.itemHeight}px`;
                
                // Replace in DOM
                this.contentWrapper.replaceChild(newElement, oldElement);
                
                // Update tracking
                this.visibleItems.set(index, newElement);
                
                // Update observer
                if (this.observer) {
                    this.observer.unobserve(oldElement);
                    this.observer.observe(newElement);
                }
            }
        }
    }
    
    /**
     * Refresh all visible items
     */
    refresh() {
        // Force complete re-render
        this.updateVisibleItems(true);
    }
    
    /**
     * Scroll to a specific item
     * @param {number} index - Index to scroll to
     * @param {string} position - Position of item: 'start', 'center', 'end'
     */
    scrollToItem(index, position = 'start') {
        if (index < 0 || index >= this.items.length) return;
        
        const topPosition = index * this.itemHeight;
        
        switch (position) {
            case 'center':
                this.container.scrollTop = topPosition - (this.container.clientHeight / 2) + (this.itemHeight / 2);
                break;
            case 'end':
                this.container.scrollTop = topPosition - this.container.clientHeight + this.itemHeight;
                break;
            case 'start':
            default:
                this.container.scrollTop = topPosition;
                break;
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.container.removeEventListener('scroll', this.handleScroll);
        if (this.observer) {
            this.observer.disconnect();
        }
        this.visibleItems.clear();
        this.items = [];
    }
}

// Export
window.PlaylistVirtualScroll = PlaylistVirtualScroll;
