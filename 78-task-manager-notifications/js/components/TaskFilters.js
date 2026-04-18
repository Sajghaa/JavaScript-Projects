class TaskFilters {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.init();
    }

    init() {
        this.setupStatusFilter();
        this.setupPriorityFilter();
        this.setupCategoryFilter();
        this.setupSortFilter();
        this.setupClearFilters();
        this.setupCategoryChips();
    }

    setupStatusFilter() {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.value = this.stateManager.get('filters.status');
            statusFilter.addEventListener('change', (e) => {
                this.stateManager.set('filters.status', e.target.value);
                this.eventBus.emit('tasks:updated');
            });
        }
    }

    setupPriorityFilter() {
        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter) {
            priorityFilter.value = this.stateManager.get('filters.priority');
            priorityFilter.addEventListener('change', (e) => {
                this.stateManager.set('filters.priority', e.target.value);
                this.eventBus.emit('tasks:updated');
            });
        }
    }

    setupCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = this.stateManager.get('selectedCategory');
            categoryFilter.addEventListener('change', (e) => {
                this.stateManager.set('selectedCategory', e.target.value);
                this.updateCategoryChips(e.target.value);
                this.eventBus.emit('tasks:updated');
            });
        }
    }

    setupSortFilter() {
        const sortFilter = document.getElementById('sortBy');
        if (sortFilter) {
            sortFilter.value = this.stateManager.get('filters.sortBy');
            sortFilter.addEventListener('change', (e) => {
                this.stateManager.set('filters.sortBy', e.target.value);
                this.eventBus.emit('tasks:updated');
            });
        }
    }

    setupClearFilters() {
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    setupCategoryChips() {
        const chips = document.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const category = chip.dataset.category;
                this.selectCategory(category);
            });
        });
    }

    selectCategory(category) {
        this.stateManager.set('selectedCategory', category);
        
        // Update dropdown
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = category;
        
        // Update chips
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
        
        // Reset UI elements
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
        
        // Reset category chips
        this.updateCategoryChips('all');
        
        this.eventBus.emit('tasks:updated');
        this.eventBus.emit('toast', { message: 'All filters cleared', type: 'info' });
    }

    getActiveFiltersCount() {
        let count = 0;
        if (this.stateManager.get('filters.status') !== 'all') count++;
        if (this.stateManager.get('filters.priority') !== 'all') count++;
        if (this.stateManager.get('selectedCategory') !== 'all') count++;
        if (this.stateManager.get('searchQuery')) count++;
        return count;
    }
}

window.TaskFilters = TaskFilters;