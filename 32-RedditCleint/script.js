// Reddit Client Application - Enhanced Version
class RedditClient {
    constructor() {
        this.currentSubreddit = 'popular';
        this.currentPage = 1;
        this.postsPerPage = 10;
        this.allPosts = [];
        this.filteredPosts = [];
        this.currentPosts = [];
        this.isLoading = false;
        this.searchTimeout = null;
        
        // DOM Elements
        this.postsContainer = document.getElementById('postsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.subredditSelect = document.getElementById('subredditSelect');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentPageSpan = document.getElementById('currentPage');
        this.errorContainer = document.getElementById('errorContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.pageSizeSelect = document.getElementById('pageSizeSelect');
        
        // Create page size selector if it doesn't exist
        this.createPageSizeSelector();
        
        // Event Listeners
        this.initializeEventListeners();
        
        // Load initial posts
        this.loadPosts();
    }
    
    createPageSizeSelector() {
        // Add page size selector to controls
        const controls = document.querySelector('.controls');
        if (!document.getElementById('pageSizeSelect')) {
            const pageSizeHtml = `
                <select id="pageSizeSelect" class="page-size-select" title="Posts per page">
                    <option value="5">5 per page</option>
                    <option value="10" selected>10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                </select>
            `;
            controls.insertAdjacentHTML('beforeend', pageSizeHtml);
            this.pageSizeSelect = document.getElementById('pageSizeSelect');
        }
    }
    
    initializeEventListeners() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.searchPosts());
        this.searchInput.addEventListener('input', () => {
            // Debounce search to improve performance
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchPosts();
            }, 300); // 300ms delay
        });
        
        // Subreddit change
        this.subredditSelect.addEventListener('change', (e) => {
            this.currentSubreddit = e.target.value;
            this.currentPage = 1;
            this.searchInput.value = ''; // Clear search on subreddit change
            this.loadPosts();
        });
        
        // Refresh button
        this.refreshBtn.addEventListener('click', () => {
            this.currentPage = 1;
            this.searchInput.value = '';
            this.loadPosts();
        });
        
        // Pagination
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        
        // Page size change
        if (this.pageSizeSelect) {
            this.pageSizeSelect.addEventListener('change', (e) => {
                this.postsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.displayCurrentPage();
            });
        }
        
        // Infinite scroll (optional)
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    async loadPosts() {
        // Show loading indicator
        this.showLoading();
        this.hideError();
        
        try {
            // Fetch posts from Reddit API with error handling
            const response = await fetch(`https://www.reddit.com/r/${this.currentSubreddit}/hot.json?limit=100`, {
                headers: {
                    'User-Agent': 'RedditClient/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if subreddit exists
            if (!data.data || !data.data.children || data.data.children.length === 0) {
                throw new Error(`Subreddit "r/${this.currentSubreddit}" not found or has no posts`);
            }
            
            // Extract posts from response with fallback values
            this.allPosts = data.data.children.map(item => ({
                id: item.data.id,
                title: item.data.title || 'Untitled',
                subreddit: item.data.subreddit || 'unknown',
                author: item.data.author || 'unknown',
                created_utc: item.data.created_utc || Date.now() / 1000,
                selftext: item.data.selftext || '',
                url: item.data.url || '',
                thumbnail: item.data.thumbnail || '',
                is_video: item.data.is_video || false,
                ups: item.data.ups || 0,
                num_comments: item.data.num_comments || 0,
                permalink: item.data.permalink || '',
                score: item.data.score || 0,
                over_18: item.data.over_18 || false
            }));
            
            // Reset filtered posts to all posts
            this.filteredPosts = [...this.allPosts];
            
            // Display first page
            this.displayCurrentPage();
            
        } catch (error) {
            this.showError(`Failed to load posts: ${error.message}`);
            console.error('Error loading posts:', error);
            
            // Display empty state
            this.postsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load posts</h3>
                    <p>${error.message}</p>
                    <p>Try selecting a different subreddit or check your connection.</p>
                </div>
            `;
            
            // Disable pagination
            this.prevBtn.disabled = true;
            this.nextBtn.disabled = true;
        } finally {
            this.hideLoading();
        }
    }
    
    displayCurrentPage() {
        // Calculate start and end indices for current page
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        
        // Get posts for current page
        this.currentPosts = this.filteredPosts.slice(startIndex, endIndex);
        
        // Clear posts container
        this.postsContainer.innerHTML = '';
        
        // Check if there are posts to display
        if (this.currentPosts.length === 0) {
            this.postsContainer.innerHTML = `
                <div class="no-results">
                    <i class="far fa-frown"></i>
                    <h3>No posts found</h3>
                    <p>Try a different search or select another subreddit.</p>
                </div>
            `;
            this.updatePagination();
            return;
        }
        
        // Create and append post elements
        this.currentPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            this.postsContainer.appendChild(postElement);
        });
        
        // Update pagination controls
        this.updatePagination();
        
        // Update results count
        this.updateResultsCount();
    }
    
    createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.setAttribute('data-id', post.id);
        
        // Format timestamp
        const postDate = new Date(post.created_utc * 1000);
        const timeAgo = this.getTimeAgo(postDate);
        
        // Determine if post has media
        const mediaHtml = this.createMediaHtml(post);
        
        // Truncate long text content
        const textContent = this.truncateText(post.selftext, 300);
        
        // Add NSFW warning if needed
        const nsfwWarning = post.over_18 ? '<span class="nsfw-tag">NSFW</span>' : '';
        
        postElement.innerHTML = `
            <div class="post-header">
                <span class="subreddit-name">r/${post.subreddit}</span>
                <span class="post-author">Posted by u/${post.author}</span>
                <span class="post-time">${timeAgo}</span>
                ${nsfwWarning}
            </div>
            <h3 class="post-title">${post.title}</h3>
            ${mediaHtml}
            ${textContent ? `<div class="post-content">${textContent}</div>` : ''}
            <div class="post-footer">
                <div class="score" title="Score">
                    <i class="fas fa-arrow-up"></i>
                    <span>${this.formatNumber(post.ups)}</span>
                </div>
                <div class="comments" title="Comments">
                    <i class="far fa-comment"></i>
                    <span>${this.formatNumber(post.num_comments)}</span>
                </div>
                <div class="score" title="Total Score">
                    <i class="fas fa-chart-line"></i>
                    <span>${this.formatNumber(post.score)}</span>
                </div>
                <a href="https://reddit.com${post.permalink}" target="_blank" class="read-more" title="Open on Reddit">
                    <i class="fas fa-external-link-alt"></i> Read on Reddit
                </a>
            </div>
        `;
        
        return postElement;
    }
    
    createMediaHtml(post) {
        // Check for different types of media
        if (post.is_video && post.media && post.media.reddit_video) {
            return `
                <div class="post-media">
                    <video controls class="post-video" preload="metadata">
                        <source src="${post.media.reddit_video.fallback_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        } else if (post.url && post.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            return `
                <div class="post-media">
                    <img src="${post.url}" alt="${post.title}" class="post-image" loading="lazy">
                </div>
            `;
        } else if (post.thumbnail && post.thumbnail.startsWith('http')) {
            return `
                <div class="post-media">
                    <img src="${post.thumbnail}" alt="${post.title}" class="post-thumbnail" loading="lazy">
                </div>
            `;
        } else if (post.url && (post.url.includes('youtube.com') || post.url.includes('youtu.be'))) {
            return `
                <div class="post-media">
                    <div class="external-link">
                        <i class="fab fa-youtube"></i>
                        <a href="${post.url}" target="_blank">Watch on YouTube</a>
                    </div>
                </div>
            `;
        }
        return '';
    }
    
    searchPosts() {
        const searchTerm = this.searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            // Reset to all posts if search is empty
            this.filteredPosts = [...this.allPosts];
        } else {
            // Filter posts by search term with multiple criteria
            this.filteredPosts = this.allPosts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) || 
                post.selftext.toLowerCase().includes(searchTerm) ||
                post.subreddit.toLowerCase().includes(searchTerm) ||
                post.author.toLowerCase().includes(searchTerm)
            );
        }
        
        // Reset to first page
        this.currentPage = 1;
        this.displayCurrentPage();
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayCurrentPage();
            this.scrollToTop();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayCurrentPage();
            this.scrollToTop();
        }
    }
    
    updatePagination() {
        // Update current page display
        this.currentPageSpan.textContent = this.currentPage;
        
        // Calculate total pages
        const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
        
        // Update button states
        this.prevBtn.disabled = this.currentPage <= 1;
        this.nextBtn.disabled = this.currentPage >= totalPages;
        
        // Update button text for better UX
        this.prevBtn.innerHTML = this.currentPage <= 1 ? 'Previous' : `<i class="fas fa-chevron-left"></i> Previous`;
        this.nextBtn.innerHTML = this.currentPage >= totalPages ? 'Next' : `Next <i class="fas fa-chevron-right"></i>`;
    }
    
    updateResultsCount() {
        // Add results count to page info
        const totalResults = this.filteredPosts.length;
        const start = Math.min((this.currentPage - 1) * this.postsPerPage + 1, totalResults);
        const end = Math.min(this.currentPage * this.postsPerPage, totalResults);
        
        const pageInfo = document.querySelector('.page-info');
        if (pageInfo) {
            pageInfo.innerHTML = `
                Page <span id="currentPage">${this.currentPage}</span> 
                <span class="results-count">(${start}-${end} of ${totalResults})</span>
            `;
            this.currentPageSpan = document.getElementById('currentPage');
        }
    }
    
    scrollToTop() {
        // Smooth scroll to top of posts
        window.scrollTo({
            top: this.postsContainer.offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    handleScroll() {
        // Optional infinite scroll implementation
        if (this.enableInfiniteScroll && !this.isLoading) {
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageBottom = document.body.offsetHeight - 500; // 500px from bottom
            
            if (scrollPosition >= pageBottom) {
                const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.appendNextPage();
                }
            }
        }
    }
    
    appendNextPage() {
        // Calculate start and end indices for next page
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        
        // Get posts for next page
        const nextPagePosts = this.filteredPosts.slice(startIndex, endIndex);
        
        // Append post elements
        nextPagePosts.forEach(post => {
            const postElement = this.createPostElement(post);
            this.postsContainer.appendChild(postElement);
        });
        
        // Update pagination controls
        this.updatePagination();
    }
    
    // Helper functions
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        
        return "just now";
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    showLoading() {
        this.isLoading = true;
        this.loadingIndicator.style.display = 'block';
        this.postsContainer.innerHTML = '';
        this.postsContainer.appendChild(this.loadingIndicator);
    }
    
    hideLoading() {
        this.isLoading = false;
        this.loadingIndicator.style.display = 'none';
    }
    
    showError(message) {
        this.errorContainer.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="retry-btn">Retry</button>
        `;
        this.errorContainer.style.display = 'block';
    }
    
    hideError() {
        this.errorContainer.style.display = 'none';
    }
}

// Initialize the Reddit client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const redditClient = new RedditClient();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Left arrow for previous page
        if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
            redditClient.previousPage();
        }
        // Right arrow for next page
        if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
            redditClient.nextPage();
        }
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === redditClient.searchInput) {
            redditClient.searchInput.value = '';
            redditClient.searchPosts();
        }
    });
});