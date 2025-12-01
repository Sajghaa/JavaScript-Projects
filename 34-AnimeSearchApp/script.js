class AnimeSearchApp {
    constructor() {
        // API Configuration
        this.apiBaseUrl = 'https://api.jikan.moe/v4';
        this.apiTimeout = 5000; // 5 seconds timeout
        this.rateLimit = {
            remaining: 60,
            reset: null,
            isLimited: false
        };
        
        // App State
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalResults = 0;
        this.currentQuery = '';
        this.currentFilter = 'all';
        this.currentView = 'grid'; // 'grid' or 'list'
        this.isLoading = false;
        this.animeList = [];
        this.filteredAnimeList = [];
        
        // DOM Elements
        this.domElements = {
            // Search elements
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            
            // Filter elements
            typeFilter: document.getElementById('typeFilter'),
            statusFilter: document.getElementById('statusFilter'),
            ratingFilter: document.getElementById('ratingFilter'),
            sortFilter: document.getElementById('sortFilter'),
            clearFilters: document.getElementById('clearFilters'),
            
            // Quick filters
            quickFilters: document.querySelectorAll('.quick-filter'),
            navLinks: document.querySelectorAll('.nav-link'),
            
            // View controls
            gridViewBtn: document.getElementById('gridView'),
            listViewBtn: document.getElementById('listView'),
            
            // Results elements
            animeContainer: document.getElementById('animeContainer'),
            resultsTitle: document.getElementById('resultsTitle'),
            resultsCount: document.getElementById('resultsCount'),
            
            // Pagination
            prevPageBtn: document.getElementById('prevPage'),
            nextPageBtn: document.getElementById('nextPage'),
            currentPageSpan: document.getElementById('currentPage'),
            totalPagesSpan: document.getElementById('totalPages'),
            
            // State elements
            loading: document.getElementById('loading'),
            errorContainer: document.getElementById('errorContainer'),
            errorMessage: document.getElementById('errorMessage'),
            retryBtn: document.getElementById('retryBtn'),
            noResults: document.getElementById('noResults'),
            resetSearch: document.getElementById('resetSearch'),
            
            // Modal
            animeModal: document.getElementById('animeModal'),
            modalBody: document.getElementById('modalBody'),
            
            // Featured section
            featuredSection: document.getElementById('featuredSection'),
            featuredContainer: document.getElementById('featuredContainer'),
            
            // Theme toggle
            themeToggle: document.getElementById('themeToggle'),
            
            // Back to top
            backToTop: document.getElementById('backToTop')
        };
        
        // Initialize the app
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTrendingAnime();
        this.setupTheme();
        this.setupQuickFilters();
    }
    
    setupEventListeners() {
        // Search functionality
        this.domElements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.domElements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Filter changes
        this.domElements.typeFilter.addEventListener('change', () => this.applyFilters());
        this.domElements.statusFilter.addEventListener('change', () => this.applyFilters());
        this.domElements.ratingFilter.addEventListener('change', () => this.applyFilters());
        this.domElements.sortFilter.addEventListener('change', () => this.sortAnime());
        
        // Clear filters
        this.domElements.clearFilters.addEventListener('click', () => this.clearAllFilters());
        
        // View controls
        this.domElements.gridViewBtn.addEventListener('click', () => this.setView('grid'));
        this.domElements.listViewBtn.addEventListener('click', () => this.setView('list'));
        
        // Pagination
        this.domElements.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.domElements.nextPageBtn.addEventListener('click', () => this.nextPage());
        
        // Error handling
        this.domElements.retryBtn.addEventListener('click', () => this.retryLastAction());
        this.domElements.resetSearch.addEventListener('click', () => this.loadTrendingAnime());
        
        // Modal
        this.domElements.animeModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close') ||
                e.target.closest('.modal-close')) {
                this.closeModal();
            }
        });
        
        // Theme toggle
        this.domElements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Back to top
        this.domElements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.domElements.animeModal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    setupQuickFilters() {
        // Navigation links
        this.domElements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = e.currentTarget.dataset.filter;
                this.handleNavFilter(filter);
                
                // Update active state
                this.domElements.navLinks.forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // Quick filter buttons
        this.domElements.quickFilters.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.handleQuickFilter(filter);
                
                // Update active state
                this.domElements.quickFilters.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }
    
    async loadTrendingAnime() {
        this.showLoading();
        this.hideError();
        this.hideNoResults();
        
        try {
            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/top/anime?limit=24`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.animeList = data.data;
                this.filteredAnimeList = [...this.animeList];
                this.currentQuery = '';
                this.domElements.resultsTitle.textContent = 'Popular Anime';
                this.renderAnime();
                this.updateResultsCount();
                this.loadFeaturedAnime();
            } else {
                this.showNoResults();
            }
        } catch (error) {
            this.handleApiError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    async handleSearch() {
        const query = this.domElements.searchInput.value.trim();
        
        if (!query) {
            this.loadTrendingAnime();
            return;
        }
        
        this.showLoading();
        this.hideError();
        this.hideNoResults();
        
        try {
            const response = await this.fetchWithTimeout(
                `${this.apiBaseUrl}/anime?q=${encodeURIComponent(query)}&limit=24&page=${this.currentPage}`
            );
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.animeList = data.data;
                this.filteredAnimeList = [...this.animeList];
                this.currentQuery = query;
                this.domElements.resultsTitle.textContent = `Results for "${query}"`;
                this.renderAnime();
                this.updateResultsCount();
                this.hideFeaturedSection();
            } else {
                this.showNoResults();
            }
        } catch (error) {
            this.handleApiError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    async handleNavFilter(filter) {
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.loadTrendingAnime();
        } else {
            this.showLoading();
            this.hideError();
            
            try {
                const response = await this.fetchWithTimeout(
                    `${this.apiBaseUrl}/top/anime?type=${filter}&limit=24`
                );
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    this.animeList = data.data;
                    this.filteredAnimeList = [...this.animeList];
                    this.currentQuery = '';
                    this.domElements.resultsTitle.textContent = `${this.getFilterName(filter)} Anime`;
                    this.renderAnime();
                    this.updateResultsCount();
                    this.loadFeaturedAnime();
                } else {
                    this.showNoResults();
                }
            } catch (error) {
                this.handleApiError(error);
            } finally {
                this.hideLoading();
            }
        }
    }
    
    async handleQuickFilter(filter) {
        this.showLoading();
        this.hideError();
        
        try {
            const response = await this.fetchWithTimeout(
                `${this.apiBaseUrl}/top/anime?filter=${filter}&limit=24`
            );
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.animeList = data.data;
                this.filteredAnimeList = [...this.animeList];
                this.currentQuery = '';
                this.domElements.resultsTitle.textContent = this.getQuickFilterTitle(filter);
                this.renderAnime();
                this.updateResultsCount();
                this.loadFeaturedAnime();
            } else {
                this.showNoResults();
            }
        } catch (error) {
            this.handleApiError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    applyFilters() {
        const type = this.domElements.typeFilter.value;
        const status = this.domElements.statusFilter.value;
        const rating = this.domElements.ratingFilter.value;
        
        this.filteredAnimeList = this.animeList.filter(anime => {
            // Type filter
            if (type !== 'all' && anime.type?.toLowerCase() !== type) {
                return false;
            }
            
            // Status filter
            if (status !== 'all') {
                if (status === 'airing' && !anime.airing) return false;
                if (status === 'complete' && anime.status?.toLowerCase() !== 'finished airing') return false;
                if (status === 'upcoming' && anime.status?.toLowerCase() !== 'not yet aired') return false;
            }
            
            // Rating filter
            if (rating !== 'all' && anime.rating?.split(' ')[0].toLowerCase() !== rating) {
                return false;
            }
            
            return true;
        });
        
        this.sortAnime();
        this.renderAnime();
        this.updateResultsCount();
        
        if (this.filteredAnimeList.length === 0) {
            this.showNoResults();
        } else {
            this.hideNoResults();
        }
    }
    
    sortAnime() {
        const sortBy = this.domElements.sortFilter.value;
        
        this.filteredAnimeList.sort((a, b) => {
            switch (sortBy) {
                case 'score':
                    return (b.score || 0) - (a.score || 0);
                case 'members':
                    return (b.members || 0) - (a.members || 0);
                case 'favorites':
                    return (b.favorites || 0) - (a.favorites || 0);
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'start_date':
                    return new Date(b.aired?.from || 0) - new Date(a.aired?.from || 0);
                case 'episodes':
                    return (b.episodes || 0) - (a.episodes || 0);
                default:
                    return 0;
            }
        });
        
        this.renderAnime();
    }
    
    clearAllFilters() {
        this.domElements.typeFilter.value = 'all';
        this.domElements.statusFilter.value = 'all';
        this.domElements.ratingFilter.value = 'all';
        this.domElements.sortFilter.value = 'score';
        
        this.filteredAnimeList = [...this.animeList];
        this.sortAnime();
        this.updateResultsCount();
    }
    
    renderAnime() {
        this.domElements.animeContainer.innerHTML = '';
        
        // Calculate pagination
        const itemsPerPage = 12;
        const startIndex = (this.currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const animeToShow = this.filteredAnimeList.slice(startIndex, endIndex);
        
        // Create anime cards
        animeToShow.forEach(anime => {
            const animeCard = this.createAnimeCard(anime);
            this.domElements.animeContainer.appendChild(animeCard);
        });
        
        // Update pagination
        this.totalPages = Math.ceil(this.filteredAnimeList.length / itemsPerPage);
        this.updatePagination();
        
        // Apply view class
        this.domElements.animeContainer.className = 
            `anime-grid ${this.currentView === 'list' ? 'list-view' : ''}`;
    }
    
    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.className = `anime-card ${this.currentView === 'list' ? 'list-view' : ''}`;
        
        // Format data
        const score = anime.score ? anime.score.toFixed(1) : 'N/A';
        const type = anime.type || 'Unknown';
        const episodes = anime.episodes ? `${anime.episodes} eps` : '? eps';
        const synopsis = anime.synopsis ? 
            anime.synopsis.substring(0, 150) + (anime.synopsis.length > 150 ? '...' : '') : 
            'No description available.';
        
        // Get up to 3 genres
        const genres = anime.genres ? anime.genres.slice(0, 3).map(g => g.name) : [];
        
        card.innerHTML = `
            <img src="${anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x450?text=No+Image'}" 
                 alt="${anime.title}" 
                 class="anime-image"
                 loading="lazy">
            
            <div class="anime-content">
                <div class="anime-meta">
                    <span class="anime-type">${type}</span>
                    <span class="anime-score">
                        <i class="fas fa-star"></i> ${score}
                    </span>
                </div>
                
                <h3 class="anime-title">${anime.title}</h3>
                
                <div class="anime-meta">
                    <span>${episodes}</span>
                    <span>${anime.status || 'Unknown'}</span>
                </div>
                
                <p class="anime-description">${synopsis}</p>
                
                ${genres.length > 0 ? `
                    <div class="anime-tags">
                        ${genres.map(genre => `<span class="anime-tag">${genre}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add click event for modal
        card.addEventListener('click', () => this.showAnimeDetails(anime));
        
        return card;
    }
    
    async showAnimeDetails(anime) {
        this.showLoading();
        
        try {
            // Fetch full anime details
            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/anime/${anime.mal_id}/full`);
            const data = await response.json();
            const animeData = data.data;
            
            // Create modal content
            this.createModalContent(animeData);
            this.showModal();
        } catch (error) {
            console.error('Error loading anime details:', error);
            // Fallback to basic info if detailed fetch fails
            this.createModalContent(anime);
            this.showModal();
        } finally {
            this.hideLoading();
        }
    }
    
    createModalContent(anime) {
        // Format data
        const score = anime.score ? anime.score.toFixed(1) : 'N/A';
        const rank = anime.rank ? `#${anime.rank}` : 'N/A';
        const popularity = anime.popularity ? `#${anime.popularity}` : 'N/A';
        const members = this.formatNumber(anime.members || 0);
        const favorites = this.formatNumber(anime.favorites || 0);
        
        // Dates
        const startDate = anime.aired?.from ? 
            new Date(anime.aired.from).toLocaleDateString() : 'Unknown';
        const endDate = anime.aired?.to ? 
            new Date(anime.aired.to).toLocaleDateString() : 'Currently Airing';
        
        // Studios
        const studios = anime.studios?.map(s => s.name).join(', ') || 'Unknown';
        
        // Genres
        const genres = anime.genres?.map(g => g.name).join(', ') || 'Unknown';
        
        // Themes
        const themes = anime.themes?.map(t => t.name).join(', ') || 'None';
        
        // Demographics
        const demographics = anime.demographics?.map(d => d.name).join(', ') || 'Unknown';
        
        // Duration
        const duration = anime.duration || 'Unknown';
        
        // Rating
        const rating = anime.rating || 'Unknown';
        
        // Background (truncate if too long)
        const background = anime.background ? 
            (anime.background.length > 500 ? anime.background.substring(0, 500) + '...' : anime.background) :
            'No background information available.';
        
        // Synopsis
        const synopsis = anime.synopsis || 'No synopsis available.';
        
        // Trailer
        const trailer = anime.trailer?.embed_url ? 
            `<iframe width="100%" height="315" src="${anime.trailer.embed_url}" 
                    frameborder="0" allowfullscreen class="anime-trailer"></iframe>` :
            '<p>No trailer available</p>';
        
        this.domElements.modalBody.innerHTML = `
            <div class="anime-modal-content">
                <div class="anime-modal-header">
                    <div class="anime-modal-image">
                        <img src="${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}" 
                             alt="${anime.title}">
                    </div>
                    <div class="anime-modal-info">
                        <h2 class="anime-modal-title">${anime.title}</h2>
                        <p class="anime-modal-japanese">${anime.title_japanese || ''}</p>
                        
                        <div class="anime-modal-stats">
                            <div class="stat-item">
                                <i class="fas fa-star"></i>
                                <div>
                                    <strong>${score}</strong>
                                    <span>Score</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-trophy"></i>
                                <div>
                                    <strong>${rank}</strong>
                                    <span>Rank</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-fire"></i>
                                <div>
                                    <strong>${popularity}</strong>
                                    <span>Popularity</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-users"></i>
                                <div>
                                    <strong>${members}</strong>
                                    <span>Members</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="anime-modal-details">
                            <div class="detail-item">
                                <i class="fas fa-tv"></i>
                                <span>Type:</span>
                                <strong>${anime.type || 'Unknown'}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span>Aired:</span>
                                <strong>${startDate} to ${endDate}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-film"></i>
                                <span>Episodes:</span>
                                <strong>${anime.episodes || 'Unknown'}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-clock"></i>
                                <span>Duration:</span>
                                <strong>${duration}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-building"></i>
                                <span>Studio:</span>
                                <strong>${studios}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-tags"></i>
                                <span>Genres:</span>
                                <strong>${genres}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-palette"></i>
                                <span>Themes:</span>
                                <strong>${themes}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-user-friends"></i>
                                <span>Demographic:</span>
                                <strong>${demographics}</strong>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Rating:</span>
                                <strong>${rating}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="anime-modal-sections">
                    <div class="modal-section">
                        <h3><i class="fas fa-book-open"></i> Synopsis</h3>
                        <p>${synopsis}</p>
                    </div>
                    
                    ${background ? `
                        <div class="modal-section">
                            <h3><i class="fas fa-info-circle"></i> Background</h3>
                            <p>${background}</p>
                        </div>
                    ` : ''}
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-play-circle"></i> Trailer</h3>
                        ${trailer}
                    </div>
                </div>
                
                <div class="modal-actions">
                    <a href="${anime.url}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> View on MyAnimeList
                    </a>
                    ${anime.trailer?.url ? `
                        <a href="${anime.trailer.url}" target="_blank" class="btn btn-secondary">
                            <i class="fab fa-youtube"></i> Watch Trailer
                        </a>
                    ` : ''}
                </div>
            </div>
            
            <style>
                .anime-modal-content {
                    padding: 20px 0;
                }
                
                .anime-modal-header {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }
                
                .anime-modal-image {
                    flex: 0 0 300px;
                }
                
                .anime-modal-image img {
                    width: 100%;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                }
                
                .anime-modal-info {
                    flex: 1;
                    min-width: 300px;
                }
                
                .anime-modal-title {
                    font-size: 2rem;
                    margin-bottom: 5px;
                    color: var(--text-color);
                }
                
                .anime-modal-japanese {
                    color: var(--text-light);
                    margin-bottom: 20px;
                    font-style: italic;
                }
                
                .anime-modal-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 15px;
                    margin-bottom: 25px;
                }
                
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    background-color: var(--card-bg);
                    border-radius: var(--radius-sm);
                    border-left: 4px solid var(--primary-color);
                }
                
                .stat-item i {
                    font-size: 1.5rem;
                    color: var(--primary-color);
                }
                
                .stat-item strong {
                    display: block;
                    font-size: 1.3rem;
                    color: var(--text-color);
                }
                
                .stat-item span {
                    font-size: 0.9rem;
                    color: var(--text-light);
                }
                
                .anime-modal-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                }
                
                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255, 107, 107, 0.1);
                }
                
                .detail-item i {
                    width: 20px;
                    color: var(--primary-color);
                }
                
                .detail-item span {
                    color: var(--text-light);
                    flex-shrink: 0;
                }
                
                .detail-item strong {
                    margin-left: auto;
                    color: var(--text-color);
                    text-align: right;
                }
                
                .anime-modal-sections {
                    margin-bottom: 30px;
                }
                
                .modal-section {
                    margin-bottom: 25px;
                }
                
                .modal-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    color: var(--text-color);
                    font-size: 1.3rem;
                }
                
                .modal-section h3 i {
                    color: var(--primary-color);
                }
                
                .modal-section p {
                    line-height: 1.7;
                    color: var(--text-color);
                }
                
                .anime-trailer {
                    border-radius: var(--radius-sm);
                    margin-top: 10px;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                    flex-wrap: wrap;
                }
                
                @media (max-width: 768px) {
                    .anime-modal-header {
                        flex-direction: column;
                    }
                    
                    .anime-modal-image {
                        flex: 0 0 auto;
                        max-width: 300px;
                        margin: 0 auto;
                    }
                    
                    .modal-actions {
                        flex-direction: column;
                    }
                    
                    .modal-actions .btn {
                        width: 100%;
                    }
                }
            </style>
        `;
    }
    
    async loadFeaturedAnime() {
        try {
            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/top/anime?filter=bypopularity&limit=10`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.renderFeaturedAnime(data.data);
                this.showFeaturedSection();
            }
        } catch (error) {
            console.error('Error loading featured anime:', error);
            this.hideFeaturedSection();
        }
    }
    
    renderFeaturedAnime(animeList) {
        this.domElements.featuredContainer.innerHTML = '';
        
        animeList.forEach(anime => {
            const featuredCard = document.createElement('div');
            featuredCard.className = 'featured-card';
            
            const description = anime.synopsis ? 
                anime.synopsis.substring(0, 100) + (anime.synopsis.length > 100 ? '...' : '') : 
                'No description available.';
            
            featuredCard.innerHTML = `
                <img src="${anime.images?.jpg?.image_url}" 
                     alt="${anime.title}" 
                     class="featured-image">
                <div class="featured-content">
                    <h4 class="featured-title">${anime.title}</h4>
                    <p class="featured-description">${description}</p>
                    <div class="anime-score">
                        <i class="fas fa-star"></i> ${anime.score?.toFixed(1) || 'N/A'}
                    </div>
                </div>
            `;
            
            featuredCard.addEventListener('click', () => this.showAnimeDetails(anime));
            this.domElements.featuredContainer.appendChild(featuredCard);
        });
    }
    
    updateResultsCount() {
        const count = this.filteredAnimeList.length;
        this.domElements.resultsCount.textContent = `(${count} ${count === 1 ? 'result' : 'results'})`;
        this.totalResults = count;
    }
    
    updatePagination() {
        this.domElements.currentPageSpan.textContent = this.currentPage;
        this.domElements.totalPagesSpan.textContent = this.totalPages;
        
        // Update button states
        this.domElements.prevPageBtn.disabled = this.currentPage <= 1;
        this.domElements.nextPageBtn.disabled = this.currentPage >= this.totalPages;
        
        // Update button text
        this.domElements.prevPageBtn.innerHTML = this.currentPage <= 1 ? 
            '<i class="fas fa-chevron-left"></i> Previous' : 
            `<i class="fas fa-chevron-left"></i> Page ${this.currentPage - 1}`;
            
        this.domElements.nextPageBtn.innerHTML = this.currentPage >= this.totalPages ? 
            'Next <i class="fas fa-chevron-right"></i>' : 
            `Page ${this.currentPage + 1} <i class="fas fa-chevron-right"></i>`;
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderAnime();
            this.scrollToResults();
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.renderAnime();
            this.scrollToResults();
        }
    }
    
    setView(view) {
        this.currentView = view;
        
        // Update active button
        this.domElements.gridViewBtn.classList.toggle('active', view === 'grid');
        this.domElements.listViewBtn.classList.toggle('active', view === 'list');
        
        // Re-render anime with new view
        this.renderAnime();
    }
    
    showModal() {
        this.domElements.animeModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.domElements.animeModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    showFeaturedSection() {
        this.domElements.featuredSection.style.display = 'block';
    }
    
    hideFeaturedSection() {
        this.domElements.featuredSection.style.display = 'none';
    }
    
    showLoading() {
        this.isLoading = true;
        this.domElements.loading.style.display = 'block';
    }
    
    hideLoading() {
        this.isLoading = false;
        this.domElements.loading.style.display = 'none';
    }
    
    showError(message) {
        this.domElements.errorMessage.textContent = message;
        this.domElements.errorContainer.style.display = 'block';
        this.domElements.animeContainer.style.display = 'none';
    }
    
    hideError() {
        this.domElements.errorContainer.style.display = 'none';
        this.domElements.animeContainer.style.display = 'grid';
    }
    
    showNoResults() {
        this.domElements.noResults.style.display = 'block';
        this.domElements.animeContainer.style.display = 'none';
        this.hideFeaturedSection();
    }
    
    hideNoResults() {
        this.domElements.noResults.style.display = 'none';
        this.domElements.animeContainer.style.display = 'grid';
    }
    
    retryLastAction() {
        if (this.currentQuery) {
            this.handleSearch();
        } else {
            this.loadTrendingAnime();
        }
    }
    
    scrollToResults() {
        document.querySelector('.results-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('anime-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('anime-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.domElements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Utility Methods
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Check rate limit headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            if (remaining && parseInt(remaining) < 10) {
                this.rateLimit.isLimited = true;
                this.rateLimit.remaining = parseInt(remaining);
            }
            
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    handleApiError(error) {
        console.error('API Error:', error);
        
        if (error.name === 'AbortError') {
            this.showError('Request timeout. Please try again.');
        } else if (this.rateLimit.isLimited) {
            this.showError('API rate limit reached. Please wait a moment before trying again.');
        } else {
            this.showError('Failed to load data. Please check your connection and try again.');
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    getFilterName(filter) {
        const filterNames = {
            'tv': 'TV Series',
            'movie': 'Movies',
            'ova': 'OVA',
            'special': 'Special',
            'ona': 'ONA'
        };
        return filterNames[filter] || filter;
    }
    
    getQuickFilterTitle(filter) {
        const titles = {
            'airing': 'Currently Airing',
            'upcoming': 'Upcoming Anime',
            'bypopularity': 'Most Popular',
            'favorite': 'Most Favorited'
        };
        return titles[filter] || 'Anime';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animeApp = new AnimeSearchApp();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in input
        if (e.target.matches('input, textarea')) return;
        
        // Space to focus search
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && document.getElementById('animeModal').style.display === 'block') {
            animeApp.closeModal();
        }
    });
});