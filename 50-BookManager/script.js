document.addEventListener('DOMContentLoaded', function() {

    initApp();
    
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

const state = {
    bookmarks: JSON.parse(localStorage.getItem('luxuriaBookmarks')) || [],
    categories: JSON.parse(localStorage.getItem('luxuriaCategories')) || [
        { name: 'Work', color: '#7c3aed' },
        { name: 'Personal', color: '#06b6d4' },
        { name: 'Entertainment', color: '#f59e0b' },
        { name: 'Education', color: '#10b981' },
        { name: 'Shopping', color: '#ef4444' }
    ],
    selectedCategory: 'all',
    viewMode: 'grid',
    selectedColor: '#7c3aed'
};

// Color palette options
const colorPalette = [
    '#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444',
    '#8b5cf6', '#3b82f6', '#f97316', '#14b8a6', '#ec4899'
];

// Initialize the application
function initApp() {
    renderCategories();
    renderColorPalette();
    renderBookmarks();
    updateStats();
    setupEventListeners();
    loadCategoriesToDatalist();
}

// Set up event listeners
function setupEventListeners() {
    // Bookmark form submission
    document.getElementById('bookmark-form').addEventListener('submit', saveBookmark);
    
    // Clear form button
    document.getElementById('clear-form').addEventListener('click', clearForm);
    
    // New category button
    document.getElementById('new-category-btn').addEventListener('click', addNewCategory);
    
    // Search functionality
    document.getElementById('search-bookmarks').addEventListener('input', searchBookmarks);
    
    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.viewMode = this.dataset.view;
            renderBookmarks();
        });
    });
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportBookmarks);
    
    // Import button
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-modal').classList.add('active');
    });
    
    // Clear all button
    document.getElementById('clear-all-btn').addEventListener('click', clearAllBookmarks);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('import-modal').classList.remove('active');
        });
    });
    
    // Confirm import button
    document.getElementById('confirm-import').addEventListener('click', importBookmarks);
    
    // Close modal when clicking outside
    document.getElementById('import-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
}

// Save a new bookmark
function saveBookmark(e) {
    e.preventDefault();
    
    const title = document.getElementById('bookmark-title').value.trim();
    const url = document.getElementById('bookmark-url').value.trim();
    const category = document.getElementById('bookmark-category').value.trim();
    const notes = document.getElementById('bookmark-notes').value.trim();
    
    // Validate inputs
    if (!title || !url || !category) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    // Check if category exists, if not create it
    let categoryExists = state.categories.find(cat => cat.name.toLowerCase() === category.toLowerCase());
    
    if (!categoryExists) {
        const newCategory = {
            name: category,
            color: state.selectedColor
        };
        state.categories.push(newCategory);
        saveCategories();
        renderCategories();
        loadCategoriesToDatalist();
    }
    
    // Create bookmark object
    const bookmark = {
        id: Date.now().toString(),
        title,
        url,
        category,
        notes,
        dateAdded: new Date().toISOString()
    };
    
    // Add to bookmarks array
    state.bookmarks.push(bookmark);
    
    // Save to localStorage
    saveBookmarks();
    
    // Update UI
    renderBookmarks();
    updateStats();
    clearForm();
    
    // Show success message
    showToast('Bookmark saved successfully!');
}

// Clear the form
function clearForm() {
    document.getElementById('bookmark-form').reset();
    document.querySelector('.categories-preview').innerHTML = '';
}

// Add a new category
function addNewCategory() {
    const categoryInput = document.getElementById('bookmark-category');
    const categoryName = categoryInput.value.trim();
    
    if (!categoryName) {
        showToast('Please enter a category name', 'error');
        return;
    }
    
    // Check if category already exists
    const categoryExists = state.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    
    if (categoryExists) {
        showToast('Category already exists', 'error');
        return;
    }
    
    // Add new category
    const newCategory = {
        name: categoryName,
        color: state.selectedColor
    };
    
    state.categories.push(newCategory);
    saveCategories();
    renderCategories();
    loadCategoriesToDatalist();
    
    // Show category in preview
    renderCategoryPreview(newCategory);
    
    // Clear input
    categoryInput.value = '';
    
    showToast('Category added successfully!');
}

// Render category preview
function renderCategoryPreview(category) {
    const previewContainer = document.querySelector('.categories-preview');
    
    const categoryTag = document.createElement('div');
    categoryTag.className = 'category-tag';
    categoryTag.style.backgroundColor = category.color;
    categoryTag.style.color = getContrastColor(category.color);
    
    categoryTag.innerHTML = `
        ${category.name}
        <i class="fas fa-times" data-category="${category.name}"></i>
    `;
    
    // Add event listener to remove button
    categoryTag.querySelector('i').addEventListener('click', function(e) {
        e.stopPropagation();
        removeCategory(category.name);
    });
    
    previewContainer.appendChild(categoryTag);
}

// Remove a category
function removeCategory(categoryName) {
    // Check if category is used by any bookmarks
    const isUsed = state.bookmarks.some(bookmark => bookmark.category === categoryName);
    
    if (isUsed) {
        showToast('Cannot delete category that is in use', 'error');
        return;
    }
    
    // Remove category from state
    state.categories = state.categories.filter(cat => cat.name !== categoryName);
    
    // Save and update UI
    saveCategories();
    renderCategories();
    loadCategoriesToDatalist();
    
    showToast('Category removed successfully!');
}

// Render categories filter
function renderCategories() {
    const filterContainer = document.getElementById('categories-filter');
    const categoriesPreview = document.querySelector('.categories-preview');
    
    // Clear containers (except "All" button)
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-category="all">
            <i class="fas fa-star"></i>
            All
        </button>
    `;
    
    if (categoriesPreview) {
        categoriesPreview.innerHTML = '';
    }
    
    // Add category filter buttons
    state.categories.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.dataset.category = category.name;
        filterBtn.innerHTML = `
            <i class="fas fa-tag"></i>
            ${category.name}
        `;
        filterBtn.style.borderColor = category.color;
        
        filterBtn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            state.selectedCategory = this.dataset.category;
            renderBookmarks();
        });
        
        filterContainer.appendChild(filterBtn);
    });
    
    // Add event listener to "All" button
    document.querySelector('[data-category="all"]').addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        state.selectedCategory = 'all';
        renderBookmarks();
    });
}

// Render color palette
function renderColorPalette() {
    const paletteContainer = document.getElementById('color-palette');
    paletteContainer.innerHTML = '';
    
    colorPalette.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option ${color === state.selectedColor ? 'selected' : ''}`;
        colorOption.style.backgroundColor = color;
        
        colorOption.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            state.selectedColor = color;
        });
        
        paletteContainer.appendChild(colorOption);
    });
}

// Load categories to datalist
function loadCategoriesToDatalist() {
    const datalist = document.getElementById('categories-list');
    datalist.innerHTML = '';
    
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        datalist.appendChild(option);
    });
}

// Render bookmarks
function renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    const emptyState = document.getElementById('empty-state');
    
    // Filter bookmarks based on selected category and search
    let filteredBookmarks = state.bookmarks;
    
    if (state.selectedCategory !== 'all') {
        filteredBookmarks = filteredBookmarks.filter(bookmark => bookmark.category === state.selectedCategory);
    }
    
    const searchTerm = document.getElementById('search-bookmarks').value.toLowerCase();
    if (searchTerm) {
        filteredBookmarks = filteredBookmarks.filter(bookmark => 
            bookmark.title.toLowerCase().includes(searchTerm) || 
            bookmark.notes.toLowerCase().includes(searchTerm)
        );
    }
    
    // Show empty state if no bookmarks
    if (filteredBookmarks.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'flex';
        container.appendChild(emptyState);
        return;
    }
    
    // Hide empty state
    emptyState.style.display = 'none';
    
    // Create bookmarks container
    const bookmarksGrid = document.createElement('div');
    bookmarksGrid.className = `bookmarks-${state.viewMode}`;
    
    // Add bookmarks
    filteredBookmarks.forEach(bookmark => {
        const category = state.categories.find(cat => cat.name === bookmark.category);
        const categoryColor = category ? category.color : '#7c3aed';
        
        const bookmarkCard = document.createElement('div');
        bookmarkCard.className = 'bookmark-card';
        bookmarkCard.style.borderLeftColor = categoryColor;
        
        // Format date
        const dateAdded = new Date(bookmark.dateAdded);
        const formattedDate = dateAdded.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        bookmarkCard.innerHTML = `
            <div class="bookmark-header">
                <div>
                    <h3 class="bookmark-title">${bookmark.title}</h3>
                    <div class="bookmark-category" style="background-color: ${categoryColor}">
                        ${bookmark.category}
                    </div>
                </div>
                <span class="bookmark-date">${formattedDate}</span>
            </div>
            <div class="bookmark-url">
                <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i>
                    ${bookmark.url}
                </a>
            </div>
            ${bookmark.notes ? `<div class="bookmark-notes">${bookmark.notes}</div>` : ''}
            <div class="bookmark-actions">
                <button class="action-btn visit-btn" title="Visit">
                    <i class="fas fa-external-link-alt"></i>
                </button>
                <button class="action-btn edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to action buttons
        const visitBtn = bookmarkCard.querySelector('.visit-btn');
        const editBtn = bookmarkCard.querySelector('.edit-btn');
        const deleteBtn = bookmarkCard.querySelector('.delete-btn');
        
        visitBtn.addEventListener('click', () => {
            window.open(bookmark.url, '_blank');
        });
        
        editBtn.addEventListener('click', () => {
            editBookmark(bookmark.id);
        });
        
        deleteBtn.addEventListener('click', () => {
            deleteBookmark(bookmark.id);
        });
        
        bookmarksGrid.appendChild(bookmarkCard);
    });
    
    container.innerHTML = '';
    container.appendChild(bookmarksGrid);
}

// Edit a bookmark
function editBookmark(id) {
    const bookmark = state.bookmarks.find(b => b.id === id);
    
    if (!bookmark) return;
    
    // Populate form with bookmark data
    document.getElementById('bookmark-title').value = bookmark.title;
    document.getElementById('bookmark-url').value = bookmark.url;
    document.getElementById('bookmark-category').value = bookmark.category;
    document.getElementById('bookmark-notes').value = bookmark.notes;
    
    // Remove bookmark
    deleteBookmark(id, false);
    
    // Scroll to form
    document.querySelector('.left-panel').scrollIntoView({ behavior: 'smooth' });
}

// Delete a bookmark
function deleteBookmark(id, showToast = true) {
    // Confirm deletion
    if (showToast && !confirm('Are you sure you want to delete this bookmark?')) {
        return;
    }
    
    // Remove from state
    state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== id);
    
    // Save and update UI
    saveBookmarks();
    renderBookmarks();
    updateStats();
    
    if (showToast) {
        showToast('Bookmark deleted successfully!');
    }
}

// Search bookmarks
function searchBookmarks() {
    renderBookmarks();
}

// Update statistics
function updateStats() {
    document.getElementById('total-bookmarks').textContent = state.bookmarks.length;
    document.getElementById('total-categories').textContent = state.categories.length;
}

// Export bookmarks to JSON file
function exportBookmarks() {
    const dataStr = JSON.stringify({
        bookmarks: state.bookmarks,
        categories: state.categories
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `luxuria-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Bookmarks exported successfully!');
}

// Import bookmarks from JSON file
function importBookmarks() {
    const fileInput = document.getElementById('import-file');
    
    if (!fileInput.files.length) {
        showToast('Please select a file to import', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
                throw new Error('Invalid file format');
            }
            
            // Confirm import (will replace existing data)
            if (!confirm('Importing bookmarks will replace your current bookmarks. Continue?')) {
                return;
            }
            
            // Import data
            state.bookmarks = data.bookmarks;
            if (data.categories && Array.isArray(data.categories)) {
                state.categories = data.categories;
            }
            
            // Save to localStorage
            saveBookmarks();
            saveCategories();
            
            // Update UI
            renderCategories();
            renderBookmarks();
            updateStats();
            loadCategoriesToDatalist();
            
            // Close modal and reset file input
            document.getElementById('import-modal').classList.remove('active');
            fileInput.value = '';
            
            showToast('Bookmarks imported successfully!');
        } catch (error) {
            showToast('Error importing bookmarks. Please check the file format.', 'error');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}

// Clear all bookmarks
function clearAllBookmarks() {
    if (!confirm('Are you sure you want to delete ALL bookmarks? This action cannot be undone.')) {
        return;
    }
    
    state.bookmarks = [];
    saveBookmarks();
    renderBookmarks();
    updateStats();
    
    showToast('All bookmarks have been deleted');
}

// Save bookmarks to localStorage
function saveBookmarks() {
    localStorage.setItem('luxuriaBookmarks', JSON.stringify(state.bookmarks));
}

// Save categories to localStorage
function saveCategories() {
    localStorage.setItem('luxuriaCategories', JSON.stringify(state.categories));
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    // Set message and icon
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.style.backgroundColor = 'var(--danger-color)';
        toastIcon.className = 'fas fa-exclamation-circle';
    } else {
        toast.style.backgroundColor = 'var(--success-color)';
        toastIcon.className = 'fas fa-check-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility: Get contrast color (black or white) for a given background color
function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
}