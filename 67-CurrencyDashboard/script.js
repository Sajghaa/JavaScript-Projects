document.addEventListener('DOMContentLoaded', function() {
    const app = new CurrencyDashboard();
    app.init();
});

class CurrencyState {
    constructor() {
        this.state = {
            exchangeRates: {},
            baseCurrency: 'USD',
            conversions: [],
            lastUpdated: new Date(),
            popularCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY']
        };
    }

    getState() {
        return { ...this.state };
    }

    updateExchangeRates(rates) {
        this.state.exchangeRates = rates;
        this.state.lastUpdated = new Date();
        this.notifyListeners('ratesUpdated');
    }

    addConversion(conversion) {
        this.state.conversions.push(conversion);
        this.notifyListeners('conversionAdded');
    }

    updateConversion(index, conversion) {
        this.state.conversions[index] = conversion;
        this.notifyListeners('conversionUpdated');
    }

    removeConversion(index) {
        this.state.conversions.splice(index, 1);
        this.notifyListeners('conversionRemoved');
    }

    updateBaseCurrency(currency) {
        this.state.baseCurrency = currency;
        this.notifyListeners('baseCurrencyChanged');
    }

    listeners = {};

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    notifyListeners(event) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                callback(this.getState());
            });
        }
    }
}

class ExchangeRateService {
    constructor() {
        this.apiKey = 'demo_api_key';
        this.baseUrl = 'https://api.exchangerate-api.com/v4/latest';
    }

    async fetchExchangeRates(baseCurrency = 'USD') {
        document.getElementById('loading-overlay').style.display = 'flex';
        
        return new Promise(resolve => {
            setTimeout(() => {
                document.getElementById('loading-overlay').style.display = 'none';
                
                const mockRates = this.generateMockRates(baseCurrency);
                resolve({
                    base: baseCurrency,
                    rates: mockRates,
                    date: new Date().toISOString()
                });
            }, 1000);
        });
    }

    
    generateMockRates(baseCurrency) {
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'KRW'];
        const rates = {};
        
        
        const baseRates = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149.5,
            CAD: 1.36,
            AUD: 1.54,
            CHF: 0.88,
            CNY: 7.29,
            INR: 83.1,
            BRL: 4.92,
            MXN: 17.25,
            KRW: 1332.5
        };
        const baseRate = baseRates[baseCurrency] || 1;
        
        currencies.forEach(currency => {
            
            const fluctuation = (Math.random() - 0.5) * 0.02; // +/- 1%
            rates[currency] = ((baseRates[currency] || 1) / baseRate) * (1 + fluctuation);
        });
        
        return rates;
    }

    convert(amount, fromCurrency, toCurrency, rates) {
        if (fromCurrency === toCurrency) return amount;
        
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[toCurrency] || 1;
        
        const amountInUSD = amount / fromRate;
        return amountInUSD * toRate;
    }
}

class UIComponents {
    constructor(stateManager, apiService) {
        this.stateManager = stateManager;
        this.apiService = apiService;
    }

    // Initialize UI components
    init() {
        this.renderExchangeRates();
        this.renderPopularPairs();
        this.renderStatistics();
        this.setupEventListeners();
        this.addConversionItem(); // Add initial conversion item
    }

    // Render exchange rates table
    renderExchangeRates(state) {
        const rates = state?.exchangeRates || this.stateManager.getState().exchangeRates;
        const tableBody = document.getElementById('rates-table-body');
        
        if (!rates || Object.keys(rates).length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">Loading exchange rates...</td></tr>';
            return;
        }
        
        const popularCurrencies = this.stateManager.getState().popularCurrencies;
        let tableHTML = '';
        
        popularCurrencies.forEach(currency => {
            if (rates[currency]) {
                const rate = rates[currency];
                const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral';
                const trendIcon = trend === 'up' ? 'fa-arrow-up' : trend === 'down' ? 'fa-arrow-down' : 'fa-minus';
                const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';
                const currencyName = this.getCurrencyName(currency);
                
                tableHTML += `
                    <tr>
                        <td>
                            <div class="currency-name">${currencyName}</div>
                        </td>
                        <td>
                            <div class="currency-code">${currency}</div>
                        </td>
                        <td>${rate.toFixed(4)}</td>
                        <td class="${trendClass}">
                            <i class="fas ${trendIcon}"></i>
                            <span>${trend === 'up' ? '0.5%' : trend === 'down' ? '0.3%' : '0.0%'}</span>
                        </td>
                    </tr>
                `;
            }
        });
        
        tableBody.innerHTML = tableHTML;
    }

    // Render popular currency pairs
    renderPopularPairs(state) {
        const rates = state?.exchangeRates || this.stateManager.getState().exchangeRates;
        const container = document.getElementById('popular-pairs');
        
        if (!rates || Object.keys(rates).length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px;">Loading popular pairs...</div>';
            return;
        }
        
        const popularPairs = [
            { from: 'EUR', to: 'USD', name: 'Euro to US Dollar' },
            { from: 'GBP', to: 'USD', name: 'British Pound to US Dollar' },
            { from: 'USD', to: 'JPY', name: 'US Dollar to Japanese Yen' },
            { from: 'USD', to: 'CAD', name: 'US Dollar to Canadian Dollar' },
            { from: 'AUD', to: 'USD', name: 'Australian Dollar to US Dollar' },
            { from: 'USD', to: 'CHF', name: 'US Dollar to Swiss Franc' }
        ];
        
        let pairsHTML = '';
        
        popularPairs.forEach(pair => {
            const fromRate = rates[pair.from] || 1;
            const toRate = rates[pair.to] || 1;
            const rate = this.apiService.convert(1, pair.from, pair.to, rates);
            
            pairsHTML += `
                <div class="currency-pair">
                    <div class="pair-info">
                        <div class="pair-currencies">${pair.from} / ${pair.to}</div>
                        <div class="pair-name">${pair.name}</div>
                    </div>
                    <div class="pair-rate">${rate.toFixed(4)}</div>
                </div>
            `;
        });
        
        container.innerHTML = pairsHTML;
    }

    // Render statistics
    renderStatistics(state) {
        const rates = state?.exchangeRates || this.stateManager.getState().exchangeRates;
        const container = document.getElementById('stats-container');
        
        if (!rates || Object.keys(rates).length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px;">Loading statistics...</div>';
            return;
        }
        
        // Calculate some statistics
        const currencies = Object.keys(rates);
        const highestRate = Math.max(...Object.values(rates));
        const lowestRate = Math.min(...Object.values(rates));
        const highestCurrency = currencies.find(currency => rates[currency] === highestRate);
        const lowestCurrency = currencies.find(currency => rates[currency] === lowestRate);
        
        const statsHTML = `
            <div class="stat-item">
                <div class="stat-value">${currencies.length}</div>
                <div class="stat-label">Currencies Tracked</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${highestCurrency}</div>
                <div class="stat-label">Highest Rate (${highestRate.toFixed(4)})</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${lowestCurrency}</div>
                <div class="stat-label">Lowest Rate (${lowestRate.toFixed(4)})</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${this.stateManager.getState().baseCurrency}</div>
                <div class="stat-label">Base Currency</div>
            </div>
        `;
        
        container.innerHTML = statsHTML;
    }

    // Add a conversion item to the UI
    addConversionItem() {
        const container = document.getElementById('conversion-container');
        const index = container.children.length;
        
        const conversionHTML = `
            <div class="conversion-item" data-index="${index}">
                <div class="currency-input-group">
                    <label>Amount</label>
                    <div class="currency-input">
                        <select class="currency-from">
                            ${this.getCurrencyOptions()}
                        </select>
                        <input type="number" class="amount-input" value="100" min="0" step="0.01">
                    </div>
                </div>
                
                <div class="swap-btn-container">
                    <button class="swap-btn" title="Swap currencies">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                </div>
                
                <div class="currency-input-group">
                    <label>Convert to</label>
                    <div class="currency-input">
                        <select class="currency-to">
                            ${this.getCurrencyOptions('EUR')}
                        </select>
                        <input type="text" class="result-output" readonly>
                    </div>
                </div>
                
                <div class="delete-conversion-container">
                    ${index > 0 ? `<button class="delete-conversion" title="Remove conversion">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', conversionHTML);
        
        // Add to state
        const fromCurrency = container.querySelector(`.conversion-item[data-index="${index}"] .currency-from`).value;
        const toCurrency = container.querySelector(`.conversion-item[data-index="${index}"] .currency-to`).value;
        const amount = parseFloat(container.querySelector(`.conversion-item[data-index="${index}"] .amount-input`).value);
        
        this.stateManager.addConversion({
            from: fromCurrency,
            to: toCurrency,
            amount: amount,
            result: 0
        });
        
        this.calculateConversion(index);
        
        this.setupConversionListeners(index);
    }

    setupConversionListeners(index) {
        const conversionItem = document.querySelector(`.conversion-item[data-index="${index}"]`);
        
        if (!conversionItem) return;
        
        const amountInput = conversionItem.querySelector('.amount-input');
        amountInput.addEventListener('input', () => {
            this.calculateConversion(index);
        });

        const currencyFrom = conversionItem.querySelector('.currency-from');
        currencyFrom.addEventListener('change', () => {
            this.calculateConversion(index);
        });

        const currencyTo = conversionItem.querySelector('.currency-to');
        currencyTo.addEventListener('change', () => {
            this.calculateConversion(index);
        });

        const swapBtn = conversionItem.querySelector('.swap-btn');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                this.swapCurrencies(index);
            });
        }
        
        const deleteBtn = conversionItem.querySelector('.delete-conversion');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.removeConversionItem(index);
            });
        }
    }

    calculateConversion(index) {
        const conversionItem = document.querySelector(`.conversion-item[data-index="${index}"]`);
        
        if (!conversionItem) return;
        
        const amountInput = conversionItem.querySelector('.amount-input');
        const currencyFrom = conversionItem.querySelector('.currency-from');
        const currencyTo = conversionItem.querySelector('.currency-to');
        const resultOutput = conversionItem.querySelector('.result-output');
        
        const amount = parseFloat(amountInput.value) || 0;
        const fromCurrency = currencyFrom.value;
        const toCurrency = currencyTo.value;
        
        const rates = this.stateManager.getState().exchangeRates;
        
        if (Object.keys(rates).length === 0) {
            resultOutput.value = 'Loading rates...';
            return;
        }
        
        const result = this.apiService.convert(amount, fromCurrency, toCurrency, rates);
        resultOutput.value = result.toFixed(2);
        
        // Update state
        const conversions = [...this.stateManager.getState().conversions];
        conversions[index] = {
            from: fromCurrency,
            to: toCurrency,
            amount: amount,
            result: result
        };
        
        this.stateManager.state.conversions[index] = conversions[index];
        
        this.updateTotalConversion();
    }

    swapCurrencies(index) {
        const conversionItem = document.querySelector(`.conversion-item[data-index="${index}"]`);
        
        if (!conversionItem) return;
        
        const currencyFrom = conversionItem.querySelector('.currency-from');
        const currencyTo = conversionItem.querySelector('.currency-to');
        
        const temp = currencyFrom.value;
        currencyFrom.value = currencyTo.value;
        currencyTo.value = temp;
        
        this.calculateConversion(index);
    }

    removeConversionItem(index) {
        const container = document.getElementById('conversion-container');
        const itemToRemove = document.querySelector(`.conversion-item[data-index="${index}"]`);
        
        if (itemToRemove) {
            itemToRemove.remove();
            
            const remainingItems = container.querySelectorAll('.conversion-item');
            remainingItems.forEach((item, newIndex) => {
                item.setAttribute('data-index', newIndex);
                
                const deleteBtn = item.querySelector('.delete-conversion');
                if (newIndex === 0 && deleteBtn) {
                    deleteBtn.style.display = 'none';
                } else if (deleteBtn) {
                    deleteBtn.style.display = 'flex';
                }
            });
            
            this.stateManager.removeConversion(index);
            
            this.updateTotalConversion();
        }
    }

    updateTotalConversion() {
        const conversions = this.stateManager.getState().conversions;
        let total = 0;
        
        conversions.forEach(conversion => {
            total += conversion.result || 0;
        });
        
        const totalElement = document.getElementById('total-conversion');
        totalElement.textContent = total.toFixed(2);
        
        const baseCurrency = this.stateManager.getState().baseCurrency;
        document.querySelector('.conversion-result h3').textContent = `Total Conversion (${baseCurrency} equivalent)`;
    }

    setupEventListeners() {
        document.getElementById('refresh-rates').addEventListener('click', () => {
            this.refreshRates();
        });

        document.getElementById('add-conversion').addEventListener('click', () => {
            this.addConversionItem();
        });

        document.getElementById('rate-search').addEventListener('input', (e) => {
            this.filterRates(e.target.value);
        });
        
        // Subscribe to state changes
        this.stateManager.subscribe('ratesUpdated', (state) => {
            this.renderExchangeRates(state);
            this.renderPopularPairs(state);
            this.renderStatistics(state);
            this.updateAllConversions();
            this.updateLastUpdatedTime();
        });
        
        this.stateManager.subscribe('conversionAdded', () => {
            this.updateTotalConversion();
        });
        
        this.stateManager.subscribe('conversionUpdated', () => {
            this.updateTotalConversion();
        });
        
        this.stateManager.subscribe('conversionRemoved', () => {
            this.updateTotalConversion();
        });
    }

  
    async refreshRates() {
        const baseCurrency = this.stateManager.getState().baseCurrency;
        const data = await this.apiService.fetchExchangeRates(baseCurrency);
        this.stateManager.updateExchangeRates(data.rates);
    }

  
    filterRates(query) {
        const tableRows = document.querySelectorAll('#rates-table-body tr');
        const queryLower = query.toLowerCase();
        
        tableRows.forEach(row => {
            const currencyName = row.querySelector('.currency-name').textContent.toLowerCase();
            const currencyCode = row.querySelector('.currency-code').textContent.toLowerCase();
            
            if (currencyName.includes(queryLower) || currencyCode.includes(queryLower)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    updateAllConversions() {
        const conversionItems = document.querySelectorAll('.conversion-item');
        
        conversionItems.forEach((item, index) => {
            this.calculateConversion(index);
        });
    }

    updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('update-time').textContent = timeString;
    }

    getCurrencyOptions(selected = 'USD') {
        const currencies = [
            { code: 'USD', name: 'US Dollar' },
            { code: 'EUR', name: 'Euro' },
            { code: 'GBP', name: 'British Pound' },
            { code: 'JPY', name: 'Japanese Yen' },
            { code: 'CAD', name: 'Canadian Dollar' },
            { code: 'AUD', name: 'Australian Dollar' },
            { code: 'CHF', name: 'Swiss Franc' },
            { code: 'CNY', name: 'Chinese Yuan' },
            { code: 'INR', name: 'Indian Rupee' },
            { code: 'BRL', name: 'Brazilian Real' },
            { code: 'MXN', name: 'Mexican Peso' },
            { code: 'KRW', name: 'South Korean Won' }
        ];
        
        return currencies.map(currency => {
            return `<option value="${currency.code}" ${currency.code === selected ? 'selected' : ''}>${currency.code} - ${currency.name}</option>`;
        }).join('');
    }

    getCurrencyName(code) {
        const currencyNames = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'JPY': 'Japanese Yen',
            'CAD': 'Canadian Dollar',
            'AUD': 'Australian Dollar',
            'CHF': 'Swiss Franc',
            'CNY': 'Chinese Yuan',
            'INR': 'Indian Rupee',
            'BRL': 'Brazilian Real',
            'MXN': 'Mexican Peso',
            'KRW': 'South Korean Won'
        };
        
        return currencyNames[code] || code;
    }
}

class CurrencyDashboard {
    constructor() {
        this.stateManager = new CurrencyState();
        this.apiService = new ExchangeRateService();
        this.ui = new UIComponents(this.stateManager, this.apiService);
    }

    async init() {
     
        await this.loadInitialRates();

        this.ui.init();
        
        this.ui.updateLastUpdatedTime();
    }

   
    async loadInitialRates() {
        const data = await this.apiService.fetchExchangeRates();
        this.stateManager.updateExchangeRates(data.rates);
    }
}