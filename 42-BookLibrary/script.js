// app.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const bookForm = document.getElementById('book-form');
    const bookTitleInput = document.getElementById('book-title');
    const bookAuthorInput = document.getElementById('book-author');
    const bookYearInput = document.getElementById('book-year');
    const bookPagesInput = document.getElementById('book-pages');
    const bookGenreInput = document.getElementById('book-genre');
    const bookStatusInput = document.getElementById('book-status');
    const bookRatingInput = document.getElementById('book-rating');
    const bookNotesInput = document.getElementById('book-notes');
    const clearFormBtn = document.getElementById('clear-form');
    const booksGrid = document.getElementById('books-grid');
    const searchBooksInput = document.getElementById('search-books');
    const filterStatusInput = document.getElementById('filter-status');
    const filterGenreInput = document.getElementById('filter-genre');
    const filterRatingInput = document.getElementById('filter-rating');
    const sortByInput = document.getElementById('sort-by');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const viewButtons = document.querySelectorAll('.view-btn');
    const exportBooksBtn = document.getElementById('export-books');
    const importBooksBtn = document.getElementById('import-books');
    const clearLibraryBtn = document.getElementById('clear-library');
    
    // Statistics elements
    const totalBooksElement = document.getElementById('total-books');
    const readBooksElement = document.getElementById('read-books');
    const readingBooksElement = document.getElementById('reading-books');
    const unreadBooksElement = document.getElementById('unread-books');
    const totalPagesElement = document.getElementById('total-pages');
    const avgRatingElement = document.getElementById('avg-rating');
    const totalAuthorsElement = document.getElementById('total-authors');
    const totalGenresElement = document.getElementById('total-genres');
    const showingCountElement = document.getElementById('showing-count');
    const totalCountElement = document.getElementById('total-count');
    
    // Templates
    const bookTemplate = document.getElementById('book-template');
    const recentTemplate = document.getElementById('recent-template');
    
    // Application state
    let books = [];
    let currentView = 'grid';
    let currentFilters = {
        status: 'all',
        genre: 'all',
        rating: 'all',
        search: ''
    };
    let editingBookId = null;
    
    // Initialize the app
    function init() {
        console.log('Initializing Book Library App...');
        
        // Set current year as max for year input
        const currentYear = new Date().getFullYear();
        bookYearInput.max = currentYear;
        
        // Load books from localStorage
        loadBooks();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize rating stars
        initRatingStars();
        
        // Render UI
        renderUI();
    }
    
    // Load books from localStorage
    function loadBooks() {
        try {
            const booksJson = localStorage.getItem('bookLibraryApp');
            console.log('Loading books from localStorage...');
            
            if (booksJson) {
                books = JSON.parse(booksJson);
                console.log(`Loaded ${books.length} books from localStorage`);
            } else {
                console.log('No books found in localStorage, starting fresh');
                books = [];
            }
        } catch (error) {
            console.error('Error loading books:', error);
            books = [];
        }
    }
    
    // Save books to localStorage
    function saveBooks() {
        try {
            console.log('Saving books to localStorage:', books);
            localStorage.setItem('bookLibraryApp', JSON.stringify(books));
            console.log(`Saved ${books.length} books to localStorage`);
        } catch (error) {
            console.error('Error saving books:', error);
            alert('Error saving books. Please try again.');
        }
    }
    
    // Initialize rating stars
    function initRatingStars() {
        const stars = document.querySelectorAll('.rating-input .stars i');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                setRating(rating);
            });
            
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.dataset.rating);
                highlightStars(rating);
            });
        });
        
        // Reset stars on mouse leave
        document.querySelector('.rating-input .stars').addEventListener('mouseleave', function() {
            const currentRating = parseInt(bookRatingInput.value);
            highlightStars(currentRating);
        });
    }
    
    // Set rating value
    function setRating(rating) {
        bookRatingInput.value = rating;
        highlightStars(rating);
    }
    
    // Highlight stars based on rating
    function highlightStars(rating) {
        const stars = document.querySelectorAll('.rating-input .stars i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Form submission
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!bookTitleInput.value.trim() || !bookAuthorInput.value.trim()) {
                alert('Please enter book title and author');
                return;
            }
            
            const bookData = {
                id: editingBookId ? editingBookId : Date.now().toString(),
                title: bookTitleInput.value.trim(),
                author: bookAuthorInput.value.trim(),
                year: bookYearInput.value ? parseInt(bookYearInput.value) : null,
                pages: bookPagesInput.value ? parseInt(bookPagesInput.value) : null,
                genre: bookGenreInput.value || 'other',
                status: bookStatusInput.value,
                rating: parseInt(bookRatingInput.value) || 0,
                notes: bookNotesInput.value.trim(),
                addedDate: editingBookId ? books.find(b => b.id === editingBookId)?.addedDate || new Date().toISOString() : new Date().toISOString(),
                updatedDate: new Date().toISOString()
            };
            
            if (editingBookId) {
                // Update existing book
                const bookIndex = books.findIndex(book => book.id === editingBookId);
                if (bookIndex !== -1) {
                    books[bookIndex] = bookData;
                    showNotification('Book updated successfully!', 'success');
                }
                editingBookId = null;
                
                // Change button text back to "Add Book"
                const submitButton = bookForm.querySelector('button[type="submit"]');
                submitButton.innerHTML = '<i class="fas fa-save"></i> Add Book';
            } else {
                // Add new book
                books.unshift(bookData);
                showNotification('Book added successfully!', 'success');
            }
            
            // Save to localStorage
            saveBooks();
            
            // Reset form
            clearForm();
            
            // Update UI
            renderUI();
        });
        
        // Clear form button
        clearFormBtn.addEventListener('click', clearForm);
        
        // Search input
        searchBooksInput.addEventListener('input', function() {
            currentFilters.search = this.value.trim();
            renderUI();
        });
        
        // Filter changes
        filterStatusInput.addEventListener('change', function() {
            currentFilters.status = this.value;
            renderUI();
        });
        
        filterGenreInput.addEventListener('change', function() {
            currentFilters.genre = this.value;
            renderUI();
        });
        
        filterRatingInput.addEventListener('change', function() {
            currentFilters.rating = this.value;
            renderUI();
        });
        
        // Sort by
        sortByInput.addEventListener('change', function() {
            renderUI();
        });
        
        // Clear filters button
        clearFiltersBtn.addEventListener('click', function() {
            searchBooksInput.value = '';
            filterStatusInput.value = 'all';
            filterGenreInput.value = 'all';
            filterRatingInput.value = 'all';
            sortByInput.value = 'newest';
            
            currentFilters = {
                status: 'all',
                genre: 'all',
                rating: 'all',
                search: ''
            };
            
            renderUI();
        });
        
        // View toggle buttons
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                viewButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentView = this.dataset.view;
                booksGrid.className = `books-grid ${currentView}-view`;
            });
        });
        
        // Export books button
        exportBooksBtn.addEventListener('click', function() {
            exportBooks();
        });
        
        // Import books button
        importBooksBtn.addEventListener('click', function() {
            showImportModal();
        });
        
        // Clear library button
        clearLibraryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your entire library? This action cannot be undone.')) {
                books = [];
                saveBooks();
                renderUI();
                showNotification('Library cleared successfully!', 'success');
            }
        });
    }
    
    // Clear form
    function clearForm() {
        bookForm.reset();
        bookRatingInput.value = '0';
        highlightStars(0);
        const currentYear = new Date().getFullYear();
        bookYearInput.max = currentYear;
        
        // Reset editing state
        editingBookId = null;
        const submitButton = bookForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Add Book';
    }
    
    // Get filtered and sorted books
    function getFilteredBooks() {
        let filteredBooks = [...books];
        
        // Filter by status
        if (currentFilters.status !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.status === currentFilters.status);
        }
        
        // Filter by genre
        if (currentFilters.genre !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.genre === currentFilters.genre);
        }
        
        // Filter by rating
        if (currentFilters.rating !== 'all') {
            const minRating = parseInt(currentFilters.rating);
            filteredBooks = filteredBooks.filter(book => book.rating >= minRating);
        }
        
        // Filter by search
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.genre.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort books
        const sortBy = sortByInput.value;
        filteredBooks.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.addedDate) - new Date(a.addedDate);
                case 'oldest':
                    return new Date(a.addedDate) - new Date(b.addedDate);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'author':
                    return a.author.localeCompare(b.author);
                case 'rating':
                    return b.rating - a.rating;
                case 'pages':
                    return (b.pages || 0) - (a.pages || 0);
                default:
                    return 0;
            }
        });
        
        return filteredBooks;
    }
    
    // Toggle book status
    function toggleBookStatus(bookId) {
        const book = books.find(b => b.id === bookId);
        if (book) {
            const statuses = ['unread', 'reading', 'read'];
            const currentIndex = statuses.indexOf(book.status);
            const nextIndex = (currentIndex + 1) % statuses.length;
            book.status = statuses[nextIndex];
            book.updatedDate = new Date().toISOString();
            saveBooks();
            renderUI();
            showNotification(`Book status changed to ${book.status}`, 'success');
        }
    }
    
    // Edit book
    function editBook(bookId) {
        const book = books.find(b => b.id === bookId);
        if (!book) return;
        
        // Populate form with book data
        bookTitleInput.value = book.title;
        bookAuthorInput.value = book.author;
        bookYearInput.value = book.year || '';
        bookPagesInput.value = book.pages || '';
        bookGenreInput.value = book.genre;
        bookStatusInput.value = book.status;
        bookNotesInput.value = book.notes || '';
        
        // Set rating
        setRating(book.rating);
        
        // Set editing state
        editingBookId = bookId;
        
        // Change button text
        const submitButton = bookForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Book';
        
        // Scroll to form
        bookForm.scrollIntoView({ behavior: 'smooth' });
        
        showNotification('Editing book. Update the fields and click "Update Book" to save.', 'info');
    }
    
    // Delete book
    function deleteBook(bookId) {
        const book = books.find(b => b.id === bookId);
        if (!book) return;
        
        if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
            books = books.filter(b => b.id !== bookId);
            saveBooks();
            renderUI();
            showNotification(`"${book.title}" deleted from library`, 'success');
        }
    }
    
    // Calculate statistics
    function calculateStats() {
        const stats = {
            total: books.length,
            read: 0,
            reading: 0,
            unread: 0,
            totalPages: 0,
            totalRating: 0,
            ratedBooks: 0,
            authors: new Set(),
            genres: new Set()
        };
        
        books.forEach(book => {
            // Count by status
            stats[book.status]++;
            
            // Count pages
            if (book.pages) {
                stats.totalPages += book.pages;
            }
            
            // Calculate average rating
            if (book.rating > 0) {
                stats.totalRating += book.rating;
                stats.ratedBooks++;
            }
            
            // Track unique authors and genres
            stats.authors.add(book.author);
            stats.genres.add(book.genre);
        });
        
        return stats;
    }
    
    // Export books to JSON
    function exportBooks() {
        const dataStr = JSON.stringify(books, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `book-library-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        showNotification('Books exported successfully!', 'success');
    }
    
    // Show import modal
    function showImportModal() {
        const importModal = document.getElementById('import-modal');
        importModal.classList.add('active');
        
        // Setup modal event listeners
        const modalClose = importModal.querySelector('.modal-close');
        const modalCancel = importModal.querySelector('.modal-cancel');
        const confirmImport = importModal.querySelector('#confirm-import');
        
        const closeModal = () => {
            importModal.classList.remove('active');
            document.getElementById('import-file').value = '';
        };
        
        modalClose.addEventListener('click', closeModal);
        modalCancel.addEventListener('click', closeModal);
        
        confirmImport.addEventListener('click', function() {
            const fileInput = document.getElementById('import-file');
            const overwrite = document.getElementById('import-overwrite').checked;
            
            if (!fileInput.files[0]) {
                alert('Please select a file to import');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedBooks = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedBooks)) {
                        throw new Error('Invalid file format');
                    }
                    
                    if (overwrite) {
                        books = importedBooks;
                    } else {
                        books = [...importedBooks, ...books];
                    }
                    
                    saveBooks();
                    closeModal();
                    renderUI();
                    showNotification('Books imported successfully!', 'success');
                } catch (error) {
                    alert('Error importing books. Invalid file format.');
                }
            };
            
            reader.readAsText(fileInput.files[0]);
        });
    }
    
    // Show notification
    function showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'error' ? 'exclamation-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 
                    type === 'info' ? 'info-circle' : 'check-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Update statistics display
    function updateStatistics() {
        const stats = calculateStats();
        
        totalBooksElement.textContent = stats.total;
        readBooksElement.textContent = stats.read;
        readingBooksElement.textContent = stats.reading;
        unreadBooksElement.textContent = stats.unread;
        totalPagesElement.textContent = stats.totalPages.toLocaleString();
        
        const avgRating = stats.ratedBooks > 0 ? (stats.totalRating / stats.ratedBooks).toFixed(1) : '0.0';
        avgRatingElement.textContent = avgRating;
        
        totalAuthorsElement.textContent = stats.authors.size;
        totalGenresElement.textContent = stats.genres.size;
    }
    
    // Update genre filter options
    function updateGenreFilter() {
        const genres = new Set(books.map(book => book.genre).filter(genre => genre));
        
        filterGenreInput.innerHTML = '<option value="all">All Genres</option>';
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ');
            filterGenreInput.appendChild(option);
        });
    }
    
    // Render books grid
    function renderBooksGrid() {
        const filteredBooks = getFilteredBooks();
        
        booksGrid.innerHTML = '';
        
        if (filteredBooks.length === 0) {
            booksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open-reader"></i>
                    <h3>No books found</h3>
                    <p>${books.length === 0 ? 'Add your first book using the form on the left' : 'Try changing your filters or search term'}</p>
                </div>
            `;
            return;
        }
        
        // Update showing count
        showingCountElement.textContent = filteredBooks.length;
        totalCountElement.textContent = books.length;
        
        // Render books
        filteredBooks.forEach(book => {
            const bookElement = bookTemplate.content.cloneNode(true);
            const bookCard = bookElement.querySelector('.book-card');
            
            // Set book data
            bookCard.querySelector('.book-title').textContent = book.title;
            bookCard.querySelector('.book-author').textContent = `By ${book.author}`;
            
            // Set year and pages
            const yearElement = bookCard.querySelector('.book-year');
            const pagesElement = bookCard.querySelector('.book-pages');
            
            if (book.year) {
                yearElement.innerHTML = `<i class="fas fa-calendar"></i> ${book.year}`;
            } else {
                yearElement.style.display = 'none';
            }
            
            if (book.pages) {
                pagesElement.innerHTML = `<i class="fas fa-file-lines"></i> ${book.pages} pages`;
            } else {
                pagesElement.style.display = 'none';
            }
            
            // Set genre
            const genreElement = bookCard.querySelector('.book-genre');
            genreElement.textContent = book.genre.charAt(0).toUpperCase() + book.genre.slice(1).replace('-', ' ');
            
            // Set status badge
            const statusElement = bookCard.querySelector('.book-status-badge span');
            statusElement.textContent = book.status.charAt(0).toUpperCase() + book.status.slice(1);
            statusElement.className = `status-${book.status}`;
            
            // Set rating
            const ratingContainer = bookCard.querySelector('.book-rating');
            const stars = ratingContainer.querySelectorAll('.stars i');
            const ratingText = ratingContainer.querySelector('.rating-text');
            
            if (book.rating > 0) {
                stars.forEach((star, index) => {
                    if (index < book.rating) {
                        star.classList.remove('far');
                        star.classList.add('fas');
                    } else {
                        star.classList.remove('fas');
                        star.classList.add('far');
                    }
                });
                ratingText.textContent = book.rating.toFixed(1);
            } else {
                ratingContainer.innerHTML = '<span class="rating-text">Not rated</span>';
            }
            
            // Set notes
            const notesElement = bookCard.querySelector('.book-notes p');
            if (book.notes) {
                notesElement.textContent = book.notes;
            } else {
                notesElement.textContent = 'No notes added';
                notesElement.style.fontStyle = 'italic';
                notesElement.style.color = '#94a3b8';
            }
            
            // Add event listeners
            bookCard.querySelector('.btn-toggle-status').addEventListener('click', () => toggleBookStatus(book.id));
            bookCard.querySelector('.btn-edit').addEventListener('click', () => editBook(book.id));
            bookCard.querySelector('.btn-delete').addEventListener('click', () => deleteBook(book.id));
            
            booksGrid.appendChild(bookElement);
        });
    }
    
    // Render recent books
    function renderRecentBooks() {
        const recentList = document.getElementById('recent-list');
        const recentBooks = [...books]
            .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
            .slice(0, 5);
        
        recentList.innerHTML = '';
        
        if (recentBooks.length === 0) {
            recentList.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-clock-rotate-left"></i>
                    <p>No books added yet</p>
                </div>
            `;
            return;
        }
        
        // Render recent books
        recentBooks.forEach(book => {
            const recentElement = recentTemplate.content.cloneNode(true);
            const recentItem = recentElement.querySelector('.recent-item');
            
            recentItem.querySelector('.recent-title').textContent = book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title;
            recentItem.querySelector('.recent-author').textContent = book.author;
            
            const statusElement = recentItem.querySelector('.recent-status');
            statusElement.textContent = book.status.charAt(0).toUpperCase() + book.status.slice(1);
            statusElement.className = `recent-status status-${book.status}`;
            
            const ratingElement = recentItem.querySelector('.recent-rating');
            if (book.rating > 0) {
                ratingElement.textContent = `⭐ ${book.rating.toFixed(1)}`;
            } else {
                ratingElement.textContent = 'Not rated';
            }
            
            recentList.appendChild(recentElement);
        });
    }
    
    // Render the entire UI
    function renderUI() {
        console.log('Rendering UI...');
        console.log('Current books:', books.length);
        
        updateStatistics();
        updateGenreFilter();
        renderBooksGrid();
        renderRecentBooks();
    }
    
    // Add notification styles to the page
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-info {
            border-left: 4px solid #3b82f6;
        }
        
        .notification-warning {
            border-left: 4px solid #f59e0b;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        .notification-success i {
            color: #10b981;
        }
        
        .notification-info i {
            color: #3b82f6;
        }
        
        .notification-warning i {
            color: #f59e0b;
        }
        
        .notification-error i {
            color: #ef4444;
        }
        
        .notification span {
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 1rem;
            padding: 0;
            display: flex;
            align-items: center;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
    
    // Initialize the application
    init();
});