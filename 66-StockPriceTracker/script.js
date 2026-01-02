// Stock Price Tracker - Main Application
document.addEventListener('DOMContentLoaded', function() {

    const Config = {
        // API Configuration
        API_BASE_URL: 'https://api.twelvedata.com',
        API_KEY: 'demo', // Using demo key for development
        // Fallback API (Yahoo Finance)
        YAHOO_API: 'https://query1.finance.yahoo.com/v8/finance/chart',
        
        // App Configuration
        DEFAULT_STOCKS: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
        REFRESH_INTERVAL: 10000, // 10 seconds
        MAX_STOCKS: 20,
        
        // Local Storage Keys
        STORAGE_KEYS: {
            TRACKED_STOCKS: 'stockTracker_trackedStocks',
            SETTINGS: 'stockTracker_settings',
            THEME: 'stockTracker_theme'
        }
    };

    // ======================
    // MODULE 2: API Service
    // ======================
    const StockAPI = {
        // Cache for API responses
        cache: new Map(),
        cacheDuration: 60000, // 1 minute
        
        /**
         * Fetch real-time stock data
         * @param {string} symbol - Stock symbol
         * @returns {Promise<Object>} Stock data
         */
        async fetchStockData(symbol) {
            const cacheKey = `stock_${symbol}`;
            const cached = this.cache.get(cacheKey);
            
            // Return cached data if still valid
            if (cached && (Date.now() - cached.timestamp) < this.cacheDuration) {
                return cached.data;
            }
            
            try {
                // Try Twelve Data API first
                const url = `${Config.API_BASE_URL}/quote?symbol=${symbol}&apikey=${Config.API_KEY}`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error('API request failed');
                
                const data = await response.json();
                
                if (data.code === 400 || data.status === 'error') {
                    // Fallback to Yahoo Finance API
                    return await this.fetchFromYahoo(symbol);
                }
                
                const stockData = this.transformStockData(data, symbol);
                
                // Cache the response
                this.cache.set(cacheKey, {
                    data: stockData,
                    timestamp: Date.now()
                });
                
                return stockData;
            } catch (error) {
                console.error(`Error fetching ${symbol}:`, error);
                // Try Yahoo as fallback
                try {
                    return await this.fetchFromYahoo(symbol);
                } catch (yahooError) {
                    console.error('Yahoo fallback also failed:', yahooError);
                    return this.getMockData(symbol);
                }
            }
        },
        
        /**
         * Fallback to Yahoo Finance API
         */
        async fetchFromYahoo(symbol) {
            const url = `${Config.YAHOO_API}/${symbol}?interval=1d&range=1d`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Yahoo API failed');
            
            const data = await response.json();
            const result = data.chart.result[0];
            
            return {
                symbol: symbol,
                name: symbol, // Yahoo doesn't provide name in this endpoint
                price: result.meta.regularMarketPrice,
                change: result.meta.regularMarketPrice - result.meta.previousClose,
                changePercent: ((result.meta.regularMarketPrice - result.meta.previousClose) / result.meta.previousClose) * 100,
                volume: result.meta.regularMarketVolume,
                open: result.meta.open,
                high: result.meta.dayHigh,
                low: result.meta.dayLow,
                previousClose: result.meta.previousClose,
                timestamp: new Date().toISOString()
            };
        },
        
        /**
         * Get mock data for development/demo
         */
        getMockData(symbol) {
            const basePrice = 100 + Math.random() * 1000;
            const change = (Math.random() - 0.5) * 20;
            const changePercent = (change / basePrice) * 100;
            
            return {
                symbol: symbol,
                name: `${symbol} Inc.`,
                price: parseFloat(basePrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: Math.floor(Math.random() * 10000000),
                open: parseFloat((basePrice - change * 0.5).toFixed(2)),
                high: parseFloat((basePrice + Math.random() * 10).toFixed(2)),
                low: parseFloat((basePrice - Math.random() * 10).toFixed(2)),
                previousClose: parseFloat((basePrice - change).toFixed(2)),
                timestamp: new Date().toISOString()
            };
        },
        
        /**
         * Transform API response to app format
         */
        transformStockData(apiData, symbol) {
            return {
                symbol: symbol,
                name: apiData.name || symbol,
                price: parseFloat(apiData.close || apiData.price || 0),
                change: parseFloat(apiData.change || 0),
                changePercent: parseFloat(apiData.percent_change || 0),
                volume: parseInt(apiData.volume || 0),
                open: parseFloat(apiData.open || 0),
                high: parseFloat(apiData.high || 0),
                low: parseFloat(apiData.low || 0),
                previousClose: parseFloat(apiData.previous_close || 0),
                timestamp: new Date().toISOString()
            };
        },
        
        /**
         * Fetch historical data for charts
         */
        async fetchHistoricalData(symbol, period = '1mo') {
            try {
                const interval = this.getIntervalForPeriod(period);
                const range = this.getRangeForPeriod(period);
                
                const url = `${Config.YAHOO_API}/${symbol}?interval=${interval}&range=${range}`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error('Historical data fetch failed');
                
                const data = await response.json();
                const result = data.chart.result[0];
                
                return {
                    timestamps: result.timestamp.map(ts => new Date(ts * 1000)),
                    prices: result.indicators.quote[0].close,
                    volume: result.indicators.quote[0].volume
                };
            } catch (error) {
                console.error('Error fetching historical data:', error);
                return this.generateMockHistoricalData();
            }
        },
        
        /**
         * Generate mock historical data
         */
        generateMockHistoricalData() {
            const prices = [];
            const timestamps = [];
            const now = Date.now();
            const basePrice = 100 + Math.random() * 100;
            
            for (let i = 30; i >= 0; i--) {
                timestamps.push(new Date(now - i * 24 * 60 * 60 * 1000));
                const price = basePrice + (Math.random() - 0.5) * 20;
                prices.push(parseFloat(price.toFixed(2)));
            }
            
            return { timestamps, prices, volume: [] };
        },
        
        /**
         * Helper methods for historical data parameters
         */
        getIntervalForPeriod(period) {
            const intervals = {
                '1d': '5m',
                '5d': '30m',
                '1mo': '1d',
                '3mo': '1d',
                '6mo': '1wk'
            };
            return intervals[period] || '1d';
        },
        
        getRangeForPeriod(period) {
            const ranges = {
                '1d': '1d',
                '5d': '5d',
                '1mo': '1mo',
                '3mo': '3mo',
                '6mo': '6mo'
            };
            return ranges[period] || '1mo';
        },
        
        /**
         * Clear API cache
         */
        clearCache() {
            this.cache.clear();
        }
    };

    // ======================
    // MODULE 3: Data Manager
    // ======================
    const DataManager = {
        trackedStocks: new Set(),
        stockData: new Map(),
        sortConfig: { field: 'symbol', direction: 'asc' },
        
        /**
         * Initialize data manager
         */
        init() {
            this.loadFromStorage();
            this.setupDefaultStocks();
        },
        
        /**
         * Load data from local storage
         */
        loadFromStorage() {
            try {
                const storedStocks = localStorage.getItem(Config.STORAGE_KEYS.TRACKED_STOCKS);
                if (storedStocks) {
                    const stocks = JSON.parse(storedStocks);
                    this.trackedStocks = new Set(stocks);
                }
            } catch (error) {
                console.error('Error loading from storage:', error);
            }
        },
        
        /**
         * Save data to local storage
         */
        saveToStorage() {
            try {
                const stocks = Array.from(this.trackedStocks);
                localStorage.setItem(Config.STORAGE_KEYS.TRACKED_STOCKS, JSON.stringify(stocks));
            } catch (error) {
                console.error('Error saving to storage:', error);
            }
        },
        
        /**
         * Set up default stocks
         */
        setupDefaultStocks() {
            if (this.trackedStocks.size === 0) {
                Config.DEFAULT_STOCKS.forEach(symbol => {
                    this.trackedStocks.add(symbol.toUpperCase());
                });
                this.saveToStorage();
            }
        },
        
        /**
         * Add a stock to tracking
         */
        addStock(symbol) {
            const normalizedSymbol = symbol.toUpperCase().trim();
            
            if (this.trackedStocks.has(normalizedSymbol)) {
                throw new Error(`${normalizedSymbol} is already being tracked`);
            }
            
            if (this.trackedStocks.size >= Config.MAX_STOCKS) {
                throw new Error(`Cannot track more than ${Config.MAX_STOCKS} stocks`);
            }
            
            this.trackedStocks.add(normalizedSymbol);
            this.saveToStorage();
            return normalizedSymbol;
        },
        
        /**
         * Remove a stock from tracking
         */
        removeStock(symbol) {
            this.trackedStocks.delete(symbol);
            this.stockData.delete(symbol);
            this.saveToStorage();
        },
        
        /**
         * Clear all stocks
         */
        clearAllStocks() {
            this.trackedStocks.clear();
            this.stockData.clear();
            this.saveToStorage();
        },
        
        /**
         * Update stock data
         */
        updateStockData(symbol, data) {
            this.stockData.set(symbol, {
                ...data,
                lastUpdated: Date.now()
            });
        },
        
        /**
         * Get all stock data
         */
        getAllStockData() {
            return Array.from(this.stockData.values());
        },
        
        /**
         * Get sorted stock data
         */
        getSortedStockData() {
            const data = this.getAllStockData();
            
            return data.sort((a, b) => {
                let aValue = a[this.sortConfig.field];
                let bValue = b[this.sortConfig.field];
                
                // Handle special cases
                if (this.sortConfig.field === 'symbol' || this.sortConfig.field === 'name') {
                    aValue = aValue.toUpperCase();
                    bValue = bValue.toUpperCase();
                }
                
                if (aValue < bValue) {
                    return this.sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return this.sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        },
        
        /**
         * Set sort configuration
         */
        setSort(field, direction = 'asc') {
            this.sortConfig = { field, direction };
        },
        
        /**
         * Calculate portfolio metrics
         */
        calculatePortfolioMetrics() {
            const stocks = this.getAllStockData();
            let totalValue = 0;
            let totalChange = 0;
            let gainers = 0;
            let losers = 0;
            
            stocks.forEach(stock => {
                totalValue += stock.price * 100; // Assuming 100 shares each
                totalChange += stock.change * 100;
                
                if (stock.change > 0) gainers++;
                if (stock.change < 0) losers++;
            });
            
            const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
            
            return {
                totalValue: parseFloat(totalValue.toFixed(2)),
                totalChange: parseFloat(totalChange.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                gainers,
                losers,
                stockCount: stocks.length
            };
        }
    };

    // ======================
    // MODULE 4: UI Manager
    // ======================
    const UIManager = {
        // DOM Elements
        elements: {
            // Search and Controls
            stockSearch: document.getElementById('stockSearch'),
            searchBtn: document.getElementById('searchBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            refreshInterval: document.getElementById('refreshInterval'),
            themeSelect: document.getElementById('themeSelect'),
            exportBtn: document.getElementById('exportBtn'),
            
            // Status Indicators
            marketStatus: document.getElementById('marketStatus'),
            statusText: document.querySelector('.status-text'),
            lastUpdate: document.getElementById('lastUpdate'),
            
            // Tables and Lists
            stocksTableBody: document.getElementById('stocksTableBody'),
            popularTickers: document.querySelectorAll('.ticker-btn'),
            sortableHeaders: document.querySelectorAll('.sortable'),
            
            // Summary Displays
            portfolioValue: document.getElementById('portfolioValue'),
            dailyChange: document.getElementById('dailyChange'),
            dailyChangePercent: document.getElementById('dailyChangePercent'),
            gainersCount: document.getElementById('gainersCount'),
            losersCount: document.getElementById('losersCount'),
            totalStocks: document.getElementById('totalStocks'),
            visibleStocks: document.getElementById('visibleStocks'),
            
            // Chart Elements
            chartPeriod: document.getElementById('chartPeriod'),
            priceChart: document.getElementById('priceChart'),
            chartPlaceholder: document.getElementById('chartPlaceholder'),
            fullscreenChart: document.getElementById('fullscreenChart'),
            
            // Details Elements
            selectedStockSymbol: document.getElementById('selectedStockSymbol'),
            stockDetails: document.getElementById('stockDetails'),
            
            // Footer Elements
            footerRefreshRate: document.getElementById('footerRefreshRate'),
            footerLastUpdate: document.getElementById('footerLastUpdate'),
            footerStockCount: document.getElementById('footerStockCount'),
            
            // Pagination
            prevPage: document.getElementById('prevPage'),
            nextPage: document.getElementById('nextPage'),
            currentPage: document.getElementById('currentPage'),
            totalPages: document.getElementById('totalPages')
        },
        
        // UI State
        state: {
            currentPage: 1,
            pageSize: 10,
            selectedStock: null,
            chart: null,
            isRefreshing: false,
            autoRefreshInterval: null
        },
        
        /**
         * Initialize UI
         */
        init() {
            this.setupEventListeners();
            this.applyTheme();
            this.updateTimeDisplay();
            this.setupChart();
            
            // Start auto-refresh
            this.startAutoRefresh();
        },
        
        /**
         * Setup all event listeners
         */
        setupEventListeners() {
            // Search functionality
            this.elements.searchBtn.addEventListener('click', () => this.handleAddStock());
            this.elements.stockSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleAddStock();
            });
            
            // Popular tickers
            this.elements.popularTickers.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const symbol = e.target.dataset.symbol;
                    this.elements.stockSearch.value = symbol;
                    this.handleAddStock();
                });
            });
            
            // Control buttons
            this.elements.refreshBtn.addEventListener('click', () => App.refreshAllStocks());
            this.elements.clearAllBtn.addEventListener('click', () => this.confirmClearAll());
            this.elements.exportBtn.addEventListener('click', () => this.exportData());
            
            // Settings changes
            this.elements.refreshInterval.addEventListener('change', (e) => {
                this.updateRefreshInterval(parseInt(e.target.value));
            });
            
            this.elements.themeSelect.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
            
            // Chart controls
            this.elements.chartPeriod.addEventListener('change', () => {
                if (this.state.selectedStock) {
                    this.loadChartData(this.state.selectedStock);
                }
            });
            
            this.elements.fullscreenChart.addEventListener('click', () => {
                this.toggleChartFullscreen();
            });
            
            // Pagination
            this.elements.prevPage.addEventListener('click', () => this.prevPage());
            this.elements.nextPage.addEventListener('click', () => this.nextPage());
            
            // Sortable table headers
            this.elements.sortableHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const field = header.dataset.sort;
                    this.sortTable(field);
                });
            });
        },
        
        /**
         * Handle adding a stock
         */
        async handleAddStock() {
            const symbol = this.elements.stockSearch.value.trim();
            if (!symbol) {
                this.showToast('Please enter a stock symbol', 'error');
                return;
            }
            
            try {
                this.elements.searchBtn.innerHTML = '<div class="spinner"></div>';
                this.elements.searchBtn.disabled = true;
                
                // Add to data manager
                const addedSymbol = DataManager.addStock(symbol);
                
                // Fetch initial data
                await App.refreshStock(addedSymbol);
                
                // Update UI
                this.updateStocksTable();
                this.updateSummary();
                this.elements.stockSearch.value = '';
                
                this.showToast(`${addedSymbol} added successfully`, 'success');
            } catch (error) {
                this.showToast(error.message, 'error');
            } finally {
                this.elements.searchBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
                this.elements.searchBtn.disabled = false;
            }
        },
        
        /**
         * Update stocks table
         */
        updateStocksTable() {
            const stocks = DataManager.getSortedStockData();
            const startIndex = (this.state.currentPage - 1) * this.state.pageSize;
            const endIndex = startIndex + this.state.pageSize;
            const pageStocks = stocks.slice(startIndex, endIndex);
            
            // Clear table
            this.elements.stocksTableBody.innerHTML = '';
            
            if (pageStocks.length === 0) {
                // Show empty state
                const emptyRow = document.createElement('tr');
                emptyRow.className = 'empty-row';
                emptyRow.innerHTML = `
                    <td colspan="8">
                        <div class="empty-state">
                            <i class="fas fa-chart-line"></i>
                            <p>No stocks added yet. Search for a stock symbol to get started.</p>
                        </div>
                    </td>
                `;
                this.elements.stocksTableBody.appendChild(emptyRow);
            } else {
                // Add stock rows
                pageStocks.forEach(stock => {
                    const row = this.createStockRow(stock);
                    this.elements.stocksTableBody.appendChild(row);
                });
            }
            
            // Update pagination
            this.updatePagination(stocks.length);
            
            // Update visible stocks count
            this.elements.visibleStocks.textContent = 
                `Showing ${startIndex + 1}-${Math.min(endIndex, stocks.length)} of ${stocks.length} stocks`;
        },
        
        /**
         * Create a stock table row
         */
        createStockRow(stock) {
            const row = document.createElement('tr');
            row.dataset.symbol = stock.symbol;
            
            // Determine change color class
            const changeClass = stock.change > 0 ? 'positive' : stock.change < 0 ? 'negative' : 'neutral';
            
            // Format numbers
            const priceFormatted = `$${stock.price.toFixed(2)}`;
            const changeFormatted = `${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}`;
            const changePercentFormatted = `${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`;
            const volumeFormatted = this.formatNumber(stock.volume);
            
            row.innerHTML = `
                <td>
                    <div class="stock-symbol">${stock.symbol}</div>
                </td>
                <td>
                    <div class="stock-name" title="${stock.name}">${stock.name}</div>
                </td>
                <td>
                    <div class="stock-price">${priceFormatted}</div>
                </td>
                <td>
                    <div class="stock-change ${changeClass}">${changeFormatted}</div>
                </td>
                <td>
                    <div class="stock-change ${changeClass}">${changePercentFormatted}</div>
                </td>
                <td>
                    <div class="stock-volume">${volumeFormatted}</div>
                </td>
                <td>
                    <div class="stock-chart" id="miniChart-${stock.symbol}">
                        <canvas width="100" height="40"></canvas>
                    </div>
                </td>
                <td>
                    <div class="stock-actions">
                        <button class="action-btn view-details" data-symbol="${stock.symbol}" title="View Details">
                            <i class="fas fa-chart-line"></i>
                        </button>
                        <button class="action-btn remove" data-symbol="${stock.symbol}" title="Remove Stock">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Add event listeners to action buttons
            row.querySelector('.view-details').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showStockDetails(stock.symbol);
            });
            
            row.querySelector('.remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeStock(stock.symbol);
            });
            
            // Add click event to entire row for selection
            row.addEventListener('click', () => {
                this.selectStock(stock.symbol);
            });
            
            // Update mini-chart
            this.updateMiniChart(stock.symbol, stock.changePercent);
            
            return row;
        },
        
        /**
         * Update mini-chart for a stock
         */
        updateMiniChart(symbol, changePercent) {
            const canvas = document.querySelector(`#miniChart-${symbol} canvas`);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Determine color
            const color = changePercent > 0 ? '#10b981' : '#ef4444';
            
            // Draw simple trend line
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            
            // Create a simple line based on change
            const points = 10;
            const midY = height / 2;
            const amplitude = Math.min(Math.abs(changePercent) / 5, 1) * (height / 2);
            
            for (let i = 0; i <= points; i++) {
                const x = (i / points) * width;
                const y = midY + (changePercent > 0 ? -1 : 1) * 
                          Math.sin((i / points) * Math.PI) * amplitude;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        },
        
        /**
         * Update pagination controls
         */
        updatePagination(totalItems) {
            const totalPages = Math.ceil(totalItems / this.state.pageSize);
            
            this.elements.totalPages.textContent = totalPages;
            this.elements.currentPage.textContent = this.state.currentPage;
            
            // Enable/disable buttons
            this.elements.prevPage.disabled = this.state.currentPage <= 1;
            this.elements.nextPage.disabled = this.state.currentPage >= totalPages;
            
            // Hide pagination if only one page
            document.querySelector('.pagination').style.display = 
                totalPages <= 1 ? 'none' : 'flex';
        },
        
        /**
         * Go to previous page
         */
        prevPage() {
            if (this.state.currentPage > 1) {
                this.state.currentPage--;
                this.updateStocksTable();
            }
        },
        
        /**
         * Go to next page
         */
        nextPage() {
            const totalItems = DataManager.getSortedStockData().length;
            const totalPages = Math.ceil(totalItems / this.state.pageSize);
            
            if (this.state.currentPage < totalPages) {
                this.state.currentPage++;
                this.updateStocksTable();
            }
        },
        
        /**
         * Sort table by field
         */
        sortTable(field) {
            const currentField = DataManager.sortConfig.field;
            const currentDirection = DataManager.sortConfig.direction;
            
            let newDirection = 'asc';
            if (field === currentField) {
                newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
            }
            
            DataManager.setSort(field, newDirection);
            
            // Update sort indicators
            this.elements.sortableHeaders.forEach(header => {
                const icon = header.querySelector('i');
                if (header.dataset.sort === field) {
                    icon.className = newDirection === 'asc' ? 
                        'fas fa-sort-up' : 'fas fa-sort-down';
                } else {
                    icon.className = 'fas fa-sort';
                }
            });
            
            this.updateStocksTable();
        },
        
        /**
         * Show stock details
         */
        async showStockDetails(symbol) {
            this.state.selectedStock = symbol;
            this.elements.selectedStockSymbol.textContent = symbol;
            
            // Load stock data
            const stockData = DataManager.stockData.get(symbol);
            if (stockData) {
                this.displayStockDetails(stockData);
                await this.loadChartData(symbol);
            }
        },
        
        /**
         * Display stock details
         */
        displayStockDetails(stock) {
            const changeClass = stock.change > 0 ? 'positive' : 'negative';
            
            this.elements.stockDetails.innerHTML = `
                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Current Price</div>
                        <div class="detail-value">$${stock.price.toFixed(2)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Change</div>
                        <div class="detail-value ${changeClass}">
                            ${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Change %</div>
                        <div class="detail-value ${changeClass}">
                            ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Open</div>
                        <div class="detail-value">$${stock.open.toFixed(2)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">High</div>
                        <div class="detail-value">$${stock.high.toFixed(2)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Low</div>
                        <div class="detail-value">$${stock.low.toFixed(2)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Volume</div>
                        <div class="detail-value">${this.formatNumber(stock.volume)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Previous Close</div>
                        <div class="detail-value">$${stock.previousClose.toFixed(2)}</div>
                    </div>
                </div>
            `;
        },
        
        /**
         * Load chart data for a stock
         */
        async loadChartData(symbol) {
            const period = this.elements.chartPeriod.value;
            
            try {
                const historicalData = await StockAPI.fetchHistoricalData(symbol, period);
                
                // Show chart, hide placeholder
                this.elements.chartPlaceholder.style.display = 'none';
                this.elements.priceChart.style.display = 'block';
                
                this.updateChart(historicalData);
            } catch (error) {
                console.error('Error loading chart data:', error);
                this.showToast('Failed to load chart data', 'error');
            }
        },
        
        /**
         * Setup chart.js instance
         */
        setupChart() {
            const ctx = this.elements.priceChart.getContext('2d');
            
            this.state.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Price',
                        data: [],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                maxTicksLimit: 8
                            }
                        },
                        y: {
                            position: 'right',
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(2);
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    }
                }
            });
        },
        
        /**
         * Update chart with new data
         */
        updateChart(historicalData) {
            if (!this.state.chart) return;
            
            const { timestamps, prices } = historicalData;
            
            // Format dates for x-axis
            const formattedDates = timestamps.map(date => {
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            });
            
            // Update chart data
            this.state.chart.data.labels = formattedDates;
            this.state.chart.data.datasets[0].data = prices;
            
            // Update chart
            this.state.chart.update();
        },
        
        /**
         * Select a stock (highlight in table)
         */
        selectStock(symbol) {
            // Remove previous selection
            document.querySelectorAll('#stocksTableBody tr').forEach(row => {
                row.classList.remove('selected');
            });
            
            // Add selection to current row
            const selectedRow = document.querySelector(`tr[data-symbol="${symbol}"]`);
            if (selectedRow) {
                selectedRow.classList.add('selected');
            }
            
            // Show details
            this.showStockDetails(symbol);
        },
        
        /**
         * Remove a stock
         */
        removeStock(symbol) {
            if (confirm(`Are you sure you want to remove ${symbol} from tracking?`)) {
                DataManager.removeStock(symbol);
                this.updateStocksTable();
                this.updateSummary();
                
                if (this.state.selectedStock === symbol) {
                    this.state.selectedStock = null;
                    this.elements.stockDetails.innerHTML = `
                        <div class="details-empty">
                            <i class="fas fa-info"></i>
                            <p>Click on a stock row to see detailed information</p>
                        </div>
                    `;
                    this.elements.selectedStockSymbol.textContent = '--';
                    this.elements.chartPlaceholder.style.display = 'flex';
                    this.elements.priceChart.style.display = 'none';
                }
                
                this.showToast(`${symbol} removed from tracking`, 'info');
            }
        },
        
        /**
         * Confirm clear all stocks
         */
        confirmClearAll() {
            if (DataManager.trackedStocks.size === 0) {
                this.showToast('No stocks to clear', 'info');
                return;
            }
            
            if (confirm('Are you sure you want to clear all tracked stocks?')) {
                DataManager.clearAllStocks();
                this.updateStocksTable();
                this.updateSummary();
                this.showToast('All stocks cleared', 'info');
            }
        },
        
        /**
         * Update portfolio summary
         */
        updateSummary() {
            const metrics = DataManager.calculatePortfolioMetrics();
            
            this.elements.portfolioValue.textContent = `$${metrics.totalValue.toLocaleString()}`;
            this.elements.dailyChange.textContent = 
                `$${metrics.totalChange.toFixed(2)} `;
            this.elements.dailyChangePercent.textContent = 
                `(${metrics.changePercent > 0 ? '+' : ''}${metrics.changePercent.toFixed(2)}%)`;
            
            this.elements.gainersCount.textContent = metrics.gainers;
            this.elements.losersCount.textContent = metrics.losers;
            this.elements.totalStocks.textContent = metrics.stockCount;
            
            // Update footer
            this.elements.footerStockCount.textContent = metrics.stockCount;
        },
        
        /**
         * Update status indicators
         */
        updateStatus(isConnected = true) {
            const statusEl = this.elements.marketStatus;
            const statusText = this.elements.statusText;
            
            if (isConnected) {
                statusEl.className = 'status-indicator connected';
                statusText.textContent = 'Connected';
            } else {
                statusEl.className = 'status-indicator disconnected';
                statusText.textContent = 'Disconnected';
            }
        },
        
        /**
         * Update time display
         */
        updateTimeDisplay() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            this.elements.lastUpdate.textContent = `Last update: ${timeString}`;
            this.elements.footerLastUpdate.textContent = timeString;
            
            // Update summary time
            document.getElementById('summaryUpdateTime').textContent = timeString;
        },
        
        /**
         * Start auto-refresh
         */
        startAutoRefresh() {
            this.stopAutoRefresh();
            
            const interval = parseInt(this.elements.refreshInterval.value) * 1000;
            if (interval > 0) {
                this.state.autoRefreshInterval = setInterval(() => {
                    App.refreshAllStocks();
                }, interval);
                
                this.elements.footerRefreshRate.textContent = `${interval/1000}s`;
            } else {
                this.elements.footerRefreshRate.textContent = 'Manual';
            }
        },
        
        /**
         * Stop auto-refresh
         */
        stopAutoRefresh() {
            if (this.state.autoRefreshInterval) {
                clearInterval(this.state.autoRefreshInterval);
                this.state.autoRefreshInterval = null;
            }
        },
        
        /**
         * Update refresh interval
         */
        updateRefreshInterval(seconds) {
            this.startAutoRefresh();
        },
        
        /**
         * Change theme
         */
        changeTheme(theme) {
            document.body.className = `${theme}-theme`;
            localStorage.setItem(Config.STORAGE_KEYS.THEME, theme);
            
            // Update chart colors if needed
            if (this.state.chart) {
                this.state.chart.update();
            }
        },
        
        /**
         * Apply saved theme
         */
        applyTheme() {
            const savedTheme = localStorage.getItem(Config.STORAGE_KEYS.THEME) || 'light';
            this.elements.themeSelect.value = savedTheme;
            this.changeTheme(savedTheme);
        },
        
        /**
         * Toggle chart fullscreen
         */
        toggleChartFullscreen() {
            const chartContainer = this.elements.priceChart.parentElement;
            
            if (!document.fullscreenElement) {
                chartContainer.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        },
        
        /**
         * Export data as CSV
         */
        exportData() {
            const stocks = DataManager.getAllStockData();
            if (stocks.length === 0) {
                this.showToast('No data to export', 'info');
                return;
            }
            
            // Create CSV content
            let csv = 'Symbol,Name,Price,Change,Change%,Volume,Open,High,Low,Previous Close\n';
            
            stocks.forEach(stock => {
                csv += `${stock.symbol},"${stock.name}",${stock.price},${stock.change},${stock.changePercent},${stock.volume},${stock.open},${stock.high},${stock.low},${stock.previousClose}\n`;
            });
            
            // Create download link
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = `stock-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showToast('Data exported successfully', 'success');
        },
        
        /**
         * Show toast notification
         */
        showToast(message, type = 'info') {
            toastr[type](message);
            
            // Play sound if enabled
            const soundToggle = document.getElementById('soundToggle');
            if (soundToggle && soundToggle.checked) {
                this.playNotificationSound(type);
            }
        },
        
        /**
         * Play notification sound
         */
        playNotificationSound(type) {
            // Create audio context for simple beep sounds
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Set frequency based on notification type
                oscillator.frequency.value = type === 'success' ? 800 : type === 'error' ? 400 : 600;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        },
        
        /**
         * Format large numbers (e.g., 1000000 -> 1M)
         */
        formatNumber(num) {
            if (num >= 1000000000) {
                return (num / 1000000000).toFixed(1) + 'B';
            }
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        }
    };

    // ======================
    // MODULE 5: Main App Controller
    // ======================
    const App = {
        /**
         * Initialize the application
         */
        async init() {
            console.log('Initializing Stock Tracker...');
            
            // Initialize modules
            DataManager.init();
            UIManager.init();
            
            // Load initial data
            await this.refreshAllStocks();
            
            // Set up market status check
            this.setupMarketStatusCheck();
            
            console.log('Stock Tracker initialized successfully');
        },
        
        /**
         * Refresh all tracked stocks
         */
        async refreshAllStocks() {
            if (UIManager.state.isRefreshing) return;
            
            UIManager.state.isRefreshing = true;
            UIManager.elements.refreshBtn.innerHTML = '<div class="spinner"></div>';
            
            try {
                const symbols = Array.from(DataManager.trackedStocks);
                const promises = symbols.map(symbol => this.refreshStock(symbol));
                
                await Promise.allSettled(promises);
                
                // Update UI
                UIManager.updateStocksTable();
                UIManager.updateSummary();
                UIManager.updateStatus(true);
                UIManager.updateTimeDisplay();
                
                // Update selected stock details if needed
                if (UIManager.state.selectedStock) {
                    const stockData = DataManager.stockData.get(UIManager.state.selectedStock);
                    if (stockData) {
                        UIManager.displayStockDetails(stockData);
                    }
                }
                
                console.log(`Refreshed ${symbols.length} stocks`);
            } catch (error) {
                console.error('Error refreshing stocks:', error);
                UIManager.updateStatus(false);
                UIManager.showToast('Failed to refresh some stocks', 'error');
            } finally {
                UIManager.state.isRefreshing = false;
                UIManager.elements.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Now';
            }
        },
        
        /**
         * Refresh a single stock
         */
        async refreshStock(symbol) {
            try {
                const stockData = await StockAPI.fetchStockData(symbol);
                DataManager.updateStockData(symbol, stockData);
                return stockData;
            } catch (error) {
                console.error(`Error refreshing ${symbol}:`, error);
                throw error;
            }
        },
        
        /**
         * Set up market status check
         */
        setupMarketStatusCheck() {
            // Check connection every 30 seconds
            setInterval(() => {
                const isOnline = navigator.onLine;
                UIManager.updateStatus(isOnline);
                
                if (!isOnline) {
                    UIManager.showToast('Connection lost. Using cached data.', 'warning');
                }
            }, 30000);
            
            // Listen for online/offline events
            window.addEventListener('online', () => {
                UIManager.updateStatus(true);
                UIManager.showToast('Connection restored', 'success');
                this.refreshAllStocks();
            });
            
            window.addEventListener('offline', () => {
                UIManager.updateStatus(false);
                UIManager.showToast('You are offline', 'warning');
            });
        }
    };

    // ======================
    // Initialize the Application
    // ======================
    
    // Configure toastr
    toastr.options = {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        timeOut: 3000
    };
    
    // Start the app
    App.init();
});