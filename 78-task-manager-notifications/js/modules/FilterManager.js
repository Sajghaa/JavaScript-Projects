class FilterManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.initializeFilters();
    }

    initializeFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortBy');
        const clearBtn = document.getElementById('clearFiltersBtn');
        
        if (statusFilter) {
            statusFilter.value = this.stateManager.get('filters.status');
            statusFilter.onchange = () => {
                this.stateManager.set('filters.status', statusFilter.value);
                this.eventBus.emit('tasks:updated');
            };
        }
        
        if (priorityFilter) {
            priorityFilter.value = this.stateManager.get('filters.priority');
            priorityFilter.onchange = () => {
                this.stateManager.set('filters.priority', priorityFilter.value);
                this.eventBus.emit('tasks:updated');
            };
        }
        
        if (categoryFilter) {
            categoryFilter.value = this.stateManager.get('selectedCategory');
            categoryFilter.onchange = () => {
                this.stateManager.set('selectedCategory', categoryFilter.value);
                this.updateCategoryChips(categoryFilter.value);
                this.eventBus.emit('tasks:updated');
            };
        }
        
        if (sortFilter) {
            sortFilter.value = this.stateManager.get('filters.sortBy');
            sortFilter.onchange = () => {
                this.stateManager.set('filters.sortBy', sortFilter.value);
                this.eventBus.emit('tasks:updated');
            };
        }
        
        if (clearBtn) {
            clearBtn.onclick = () => this.clearAllFilters();
        }
        
        this.setupCategoryChips();
    }

    setupCategoryChips() {
        const chips = document.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            chip.onclick = () => {
                const category = chip.dataset.category;
                this.selectCategory(category);
            };
        });
    }

    selectCategory(category) {
        this.stateManager.set('selectedCategory', category);
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = category;
        
        this.updateCategoryChips(category);
        this.eventBus.emit('tasks:updated');
    }

    updateCategoryChips(activeCategory) {
        const chips = document.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === activeCategory);
        });
    }

    clearAllFilters() {
        this.stateManager.set('filters.status', 'all');
        this.stateManager.set('filters.priority', 'all');
        this.stateManager.set('selectedCategory', 'all');
        this.stateManager.set('filters.sortBy', 'dueDate');
        this.stateManager.set('searchQuery', '');
        
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortBy');
        const searchInput = document.getElementById('searchInput');
        
        if (statusFilter) statusFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        if (categoryFilter) categoryFilter.value = 'all';
        if (sortFilter) sortFilter.value = 'dueDate';
        if (searchInput) searchInput.value = '';
        
        this.updateCategoryChips('all');
        this.eventBus.emit('tasks:updated');
        this.eventBus.emit('toast', { message: 'All filters cleared', type: 'info' });
    }
}

window.FilterManager = FilterManager;