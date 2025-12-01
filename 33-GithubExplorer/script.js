class GitHubExplorer {
    constructor() {
        // DOM Elements
        this.reposContainer = document.getElementById('reposContainer');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.languageFilter = document.getElementById('languageFilter');
        this.starsFilter = document.getElementById('starsFilter');
        this.sortFilter = document.getElementById('sortFilter');
        this.resetFiltersBtn = document.getElementById('resetFilters');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.totalResultsSpan = document.getElementById('totalResults');
        this.loadingElement = document.getElementById('loading');
        this.errorContainer = document.getElementById('errorContainer');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.noResults = document.getElementById('noResults');
        this.gridViewBtn = document.getElementById('gridView');
        this.listViewBtn = document.getElementById('listView');
        this.repoModal = document.getElementById('repoModal');
        
        // Stats elements
        this.totalReposElement = document.getElementById('totalRepos');
        this.avgStarsElement = document.getElementById('avgStars');
        this.avgForksElement = document.getElementById('avgForks');
        
        // App State
        this.repositories = [];
        this.filteredRepositories = [];
        this.languages = new Set();
        this.currentPage = 1;
        this.reposPerPage = 9;
        this.currentView = 'grid'; // 'grid' or 'list'
        this.isLoading = false;
        
        // API Configuration
        this.apiBaseUrl = 'https://api.github.com/search/repositories';
        this.apiRateLimit = {
            remaining: 60,
            reset: null
        };
        
        // Initialize the app
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Filter changes
        this.languageFilter.addEventListener('change', () => this.applyFilters());
        this.starsFilter.addEventListener('change', () => this.applyFilters());
        this.sortFilter.addEventListener('change', () => this.applyFilters());
        
        // Reset filters
        this.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        
        // Pagination
        this.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());
        
        // View controls
        this.gridViewBtn.addEventListener('click', () => this.setView('grid'));
        this.listViewBtn.addEventListener('click', () => this.setView('list'));
        
        // Retry button
        this.retryBtn.addEventListener('click', () => this.loadInitialData());
        
        // Modal close
        this.repoModal.addEventListener('click', (e) => {
            if (e.target === this.repoModal || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.repoModal.style.display === 'flex') {
                this.closeModal();
            }
        });
    }
    
    async loadInitialData() {
        this.showLoading();
        this.hideError();
        
        try {
            // Fetch trending repositories (most stars in the last week)
            const date = new Date();
            date.setDate(date.getDate() - 7);
            const lastWeek = date.toISOString().split('T')[0];
            
            const query = `created:>${lastWeek} stars:>100`;
            const url = `${this.apiBaseUrl}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`;
            
            await this.fetchRepositories(url);
            
            // Populate language filter
            this.populateLanguageFilter();
            
        } catch (error) {
            this.showError('Failed to load repositories. Please try again.');
            console.error('Error loading initial data:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    async handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.loadInitialData();
            return;
        }
        
        this.showLoading();
        this.hideError();
        
        try {
            const url = `${this.apiBaseUrl}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`;
            await this.fetchRepositories(url);
            this.populateLanguageFilter();
        } catch (error) {
            this.showError('Search failed. Please try a different search term.');
            console.error('Error searching:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    async fetchRepositories(url) {
        try {
            this.isLoading = true;
            const response = await fetch(url);
            
            // Check rate limit headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const reset = response.headers.get('X-RateLimit-Reset');
            
            if (remaining && reset) {
                this.apiRateLimit.remaining = parseInt(remaining);
                this.apiRateLimit.reset = new Date(parseInt(reset) * 1000);
                
                if (this.apiRateLimit.remaining < 10) {
                    console.warn(`Low API rate limit: ${this.apiRateLimit.remaining} remaining`);
                }
            }
            
            if (!response.ok) {
                if (response.status === 403 && this.apiRateLimit.remaining === 0) {
                    const resetTime = new Date(this.apiRateLimit.reset).toLocaleTimeString();
                    throw new Error(`API rate limit exceeded. Resets at ${resetTime}`);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            this.repositories = data.items || [];
            this.filteredRepositories = [...this.repositories];
            
            if (this.repositories.length === 0) {
                this.showNoResults();
            } else {
                this.hideNoResults();
                this.renderRepositories();
                this.updateStats();
                this.updatePagination();
            }
            
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
    
    applyFilters() {
        const language = this.languageFilter.value;
        const minStars = parseInt(this.starsFilter.value);
        const sortBy = this.sortFilter.value;
        
        // Apply filters
        this.filteredRepositories = this.repositories.filter(repo => {
            // Language filter
            if (language && repo.language !== language) return false;
            
            // Stars filter
            if (minStars > 0 && repo.stargazers_count < minStars) return false;
            
            return true;
        });
        
        // Apply sorting
        this.sortRepositories(sortBy);
        
        // Reset to first page
        this.currentPage = 1;
        
        // Update display
        this.renderRepositories();
        this.updateStats();
        this.updatePagination();
        
        // Show no results message if needed
        if (this.filteredRepositories.length === 0) {
            this.showNoResults();
        } else {
            this.hideNoResults();
        }
    }
    
    sortRepositories(sortBy) {
        this.filteredRepositories.sort((a, b) => {
            switch (sortBy) {
                case 'stars':
                    return b.stargazers_count - a.stargazers_count;
                case 'forks':
                    return b.forks_count - a.forks_count;
                case 'updated':
                    return new Date(b.updated_at) - new Date(a.updated_at);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }
    
    populateLanguageFilter() {
        // Clear existing options except "All Languages"
        while (this.languageFilter.options.length > 1) {
            this.languageFilter.remove(1);
        }
        
        // Collect unique languages from repositories
        const languages = new Set();
        this.repositories.forEach(repo => {
            if (repo.language) {
                languages.add(repo.language);
            }
        });
        
        // Sort languages alphabetically
        const sortedLanguages = Array.from(languages).sort();
        
        // Add language options
        sortedLanguages.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            this.languageFilter.appendChild(option);
        });
    }
    
    resetFilters() {
        this.searchInput.value = '';
        this.languageFilter.value = '';
        this.starsFilter.value = '0';
        this.sortFilter.value = 'stars';
        this.loadInitialData();
    }
    
    renderRepositories() {
        this.reposContainer.innerHTML = '';
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.reposPerPage;
        const endIndex = startIndex + this.reposPerPage;
        const reposToShow = this.filteredRepositories.slice(startIndex, endIndex);
        
        // Create repo cards
        reposToShow.forEach(repo => {
            const repoCard = this.createRepoCard(repo);
            this.reposContainer.appendChild(repoCard);
        });
        
        // Apply view class
        this.reposContainer.className = this.currentView === 'list' ? 'repos-grid list-view' : 'repos-grid';
    }
    
    createRepoCard(repo) {
        const card = document.createElement('div');
        card.className = `repo-card ${this.currentView === 'list' ? 'list-view' : ''}`;
        card.dataset.id = repo.id;
        
        // Format numbers
        const stars = this.formatNumber(repo.stargazers_count);
        const forks = this.formatNumber(repo.forks_count);
        
        // Format date
        const updated = new Date(repo.updated_at).toLocaleDateString();
        
        // Language color
        const languageColor = this.getLanguageColor(repo.language);
        
        // Truncate description
        const description = repo.description ? 
            (repo.description.length > 150 ? repo.description.substring(0, 150) + '...' : repo.description) : 
            'No description provided';
        
        card.innerHTML = `
            <div class="repo-header">
                <a href="${repo.html_url}" target="_blank" class="repo-name">
                    <i class="fas fa-code-branch"></i>
                    ${repo.full_name}
                </a>
                <div class="repo-stats">
                    <span class="repo-stat" title="Stars">
                        <i class="fas fa-star"></i>
                        ${stars}
                    </span>
                    <span class="repo-stat" title="Forks">
                        <i class="fas fa-code-branch"></i>
                        ${forks}
                    </span>
                </div>
            </div>
            
            <p class="repo-description">${description}</p>
            
            ${repo.topics && repo.topics.length > 0 ? `
                <div class="repo-topics">
                    ${repo.topics.slice(0, 5).map(topic => 
                        `<span class="repo-topic">${topic}</span>`
                    ).join('')}
                    ${repo.topics.length > 5 ? `<span class="repo-topic">+${repo.topics.length - 5}</span>` : ''}
                </div>
            ` : ''}
            
            <div class="repo-footer">
                <div class="repo-language">
                    ${repo.language ? `
                        <span class="language-color" style="background-color: ${languageColor}"></span>
                        <span>${repo.language}</span>
                    ` : ''}
                </div>
                <div class="repo-updated">
                    Updated: ${updated}
                </div>
            </div>
        `;
        
        // Add click event for modal
        card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                this.showRepoDetails(repo);
            }
        });
        
        return card;
    }
    
    showRepoDetails(repo) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = this.repoModal.querySelector('.modal-body');
        
        // Format numbers
        const stars = this.formatNumber(repo.stargazers_count);
        const forks = this.formatNumber(repo.forks_count);
        const watchers = this.formatNumber(repo.watchers_count);
        
        // Format dates
        const created = new Date(repo.created_at).toLocaleDateString();
        const updated = new Date(repo.updated_at).toLocaleDateString();
        
        // Language color
        const languageColor = this.getLanguageColor(repo.language);
        
        modalTitle.textContent = repo.full_name;
        modalTitle.innerHTML = `
            <i class="fas fa-code-branch"></i> ${repo.full_name}
        `;
        
        modalBody.innerHTML = `
            <div class="modal-repo-info">
                ${repo.description ? `<p class="modal-description">${repo.description}</p>` : ''}
                
                <div class="modal-stats">
                    <div class="modal-stat">
                        <i class="fas fa-star"></i>
                        <div>
                            <strong>${stars}</strong>
                            <span>Stars</span>
                        </div>
                    </div>
                    <div class="modal-stat">
                        <i class="fas fa-code-branch"></i>
                        <div>
                            <strong>${forks}</strong>
                            <span>Forks</span>
                        </div>
                    </div>
                    <div class="modal-stat">
                        <i class="fas fa-eye"></i>
                        <div>
                            <strong>${watchers}</strong>
                            <span>Watchers</span>
                        </div>
                    </div>
                    <div class="modal-stat">
                        <i class="fas fa-exclamation-circle"></i>
                        <div>
                            <strong>${repo.open_issues_count}</strong>
                            <span>Open Issues</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-details">
                    ${repo.language ? `
                        <div class="modal-detail">
                            <i class="fas fa-code"></i>
                            <span>Language:</span>
                            <strong><span class="language-color" style="background-color: ${languageColor}"></span> ${repo.language}</strong>
                        </div>
                    ` : ''}
                    
                    <div class="modal-detail">
                        <i class="fas fa-calendar-plus"></i>
                        <span>Created:</span>
                        <strong>${created}</strong>
                    </div>
                    
                    <div class="modal-detail">
                        <i class="fas fa-calendar-check"></i>
                        <span>Updated:</span>
                        <strong>${updated}</strong>
                    </div>
                    
                    ${repo.homepage ? `
                        <div class="modal-detail">
                            <i class="fas fa-home"></i>
                            <span>Homepage:</span>
                            <a href="${repo.homepage}" target="_blank" class="modal-link">${repo.homepage}</a>
                        </div>
                    ` : ''}
                    
                    <div class="modal-detail">
                        <i class="fas fa-shield-alt"></i>
                        <span>License:</span>
                        <strong>${repo.license?.name || 'Not specified'}</strong>
                    </div>
                    
                    <div class="modal-detail">
                        <i class="fas fa-database"></i>
                        <span>Size:</span>
                        <strong>${this.formatNumber(repo.size)} KB</strong>
                    </div>
                </div>
                
                ${repo.topics && repo.topics.length > 0 ? `
                    <div class="modal-section">
                        <h4><i class="fas fa-tags"></i> Topics</h4>
                        <div class="modal-topics">
                            ${repo.topics.map(topic => `<span class="modal-topic">${topic}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-actions">
                    <a href="${repo.html_url}" target="_blank" class="btn btn-primary">
                        <i class="fab fa-github"></i> View on GitHub
                    </a>
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" class="btn btn-secondary">
                            <i class="fas fa-external-link-alt"></i> Visit Website
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add some modal-specific CSS
        const style = document.createElement('style');
        style.textContent = `
            .modal-description {
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 1.5rem;
                color: var(--text-color);
            }
            
            .modal-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .modal-stat {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                background: var(--background-color);
                border-radius: var(--radius);
            }
            
            .modal-stat i {
                font-size: 1.5rem;
                color: var(--secondary-color);
            }
            
            .modal-stat strong {
                display: block;
                font-size: 1.2rem;
                color: var(--text-color);
            }
            
            .modal-stat span {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
            
            .modal-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .modal-detail {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0;
            }
            
            .modal-detail i {
                color: var(--text-secondary);
                width: 20px;
            }
            
            .modal-detail span {
                color: var(--text-secondary);
            }
            
            .modal-detail strong, .modal-detail a {
                margin-left: auto;
                color: var(--text-color);
            }
            
            .modal-link {
                color: var(--secondary-color);
                text-decoration: none;
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .modal-link:hover {
                text-decoration: underline;
            }
            
            .modal-section {
                margin-bottom: 1.5rem;
            }
            
            .modal-section h4 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
                color: var(--text-color);
            }
            
            .modal-topics {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .modal-topic {
                background: var(--background-color);
                color: var(--secondary-color);
                padding: 0.4rem 0.8rem;
                border-radius: 20px;
                font-size: 0.85rem;
            }
            
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
            }
            
            @media (max-width: 600px) {
                .modal-stats {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .modal-details {
                    grid-template-columns: 1fr;
                }
                
                .modal-actions {
                    flex-direction: column;
                }
            }
        `;
        
        // Remove existing modal styles and add new ones
        const existingStyle = modalBody.querySelector('style');
        if (existingStyle) existingStyle.remove();
        modalBody.appendChild(style);
        
        // Show modal
        this.repoModal.style.display = 'flex';
    }
    
    closeModal() {
        this.repoModal.style.display = 'none';
    }
    
    updateStats() {
        const total = this.filteredRepositories.length;
        
        if (total === 0) {
            this.totalReposElement.textContent = '0';
            this.avgStarsElement.textContent = '0';
            this.avgForksElement.textContent = '0';
            return;
        }
        
        const totalStars = this.filteredRepositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = this.filteredRepositories.reduce((sum, repo) => sum + repo.forks_count, 0);
        
        const avgStars = Math.round(totalStars / total);
        const avgForks = Math.round(totalForks / total);
        
        this.totalReposElement.textContent = this.formatNumber(total);
        this.avgStarsElement.textContent = this.formatNumber(avgStars);
        this.avgForksElement.textContent = this.formatNumber(avgForks);
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredRepositories.length / this.reposPerPage);
        
        this.currentPageSpan.textContent = this.currentPage;
        this.totalPagesSpan.textContent = totalPages;
        this.totalResultsSpan.textContent = this.formatNumber(this.filteredRepositories.length);
        
        // Update button states
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= totalPages;
        
        // Update button text
        this.prevPageBtn.innerHTML = this.currentPage <= 1 ? 
            '<i class="fas fa-chevron-left"></i> Previous' : 
            `<i class="fas fa-chevron-left"></i> Page ${this.currentPage - 1}`;
            
        this.nextPageBtn.innerHTML = this.currentPage >= totalPages ? 
            'Next <i class="fas fa-chevron-right"></i>' : 
            `Page ${this.currentPage + 1} <i class="fas fa-chevron-right"></i>`;
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderRepositories();
            this.updatePagination();
            this.scrollToRepos();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredRepositories.length / this.reposPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderRepositories();
            this.updatePagination();
            this.scrollToRepos();
        }
    }
    
    setView(view) {
        this.currentView = view;
        
        // Update active button
        this.gridViewBtn.classList.toggle('active', view === 'grid');
        this.listViewBtn.classList.toggle('active', view === 'list');
        
        // Re-render repositories with new view
        this.renderRepositories();
    }
    
    scrollToRepos() {
        document.querySelector('.repos-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    showLoading() {
        this.loadingElement.style.display = 'block';
        this.reposContainer.style.display = 'none';
        this.noResults.style.display = 'none';
    }
    
    hideLoading() {
        this.loadingElement.style.display = 'none';
        this.reposContainer.style.display = 'grid';
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorContainer.style.display = 'block';
        this.reposContainer.style.display = 'none';
        this.loadingElement.style.display = 'none';
    }
    
    hideError() {
        this.errorContainer.style.display = 'none';
    }
    
    showNoResults() {
        this.noResults.style.display = 'block';
        this.reposContainer.style.display = 'none';
    }
    
    hideNoResults() {
        this.noResults.style.display = 'none';
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    getLanguageColor(language) {
        // Common language colors
        const colors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'Java': '#b07219',
            'TypeScript': '#2b7489',
            'C++': '#f34b7d',
            'Go': '#00ADD8',
            'Ruby': '#701516',
            'PHP': '#4F5D95',
            'C#': '#178600',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Rust': '#dea584',
            'Dart': '#00B4AB',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Vue': '#41b883',
            'React': '#61dafb',
            'Angular': '#dd0031',
            'Svelte': '#ff3e00'
        };
        
        return colors[language] || '#cccccc';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const explorer = new GitHubExplorer();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Left/Right arrow keys for pagination when not focused on inputs
        if (!e.target.matches('input, select, textarea')) {
            if (e.key === 'ArrowLeft') {
                explorer.previousPage();
            } else if (e.key === 'ArrowRight') {
                explorer.nextPage();
            }
        }
    });
});