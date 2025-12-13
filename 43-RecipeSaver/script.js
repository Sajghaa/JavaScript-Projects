// app.js
document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_KEY = 'd4af081c309f439b8e1e2e1e8ebad6cf'; // Spoonacular API key
    const API_URL = 'https://api.spoonacular.com/recipes';
    
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchTags = document.querySelectorAll('.search-tag');
    const recipesGrid = document.getElementById('recipes-grid');
    const favoritesGrid = document.getElementById('favorites-grid');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const filtersSection = document.getElementById('filters-section');
    const recipeModal = document.getElementById('recipe-modal');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Statistics Elements
    const recipesFoundEl = document.getElementById('recipes-found');
    const favoritesCountEl = document.getElementById('favorites-count');
    const avgTimeEl = document.getElementById('avg-time');
    const avgCaloriesEl = document.getElementById('avg-calories');
    
    // Filter Elements
    const dietFilter = document.getElementById('diet-filter');
    const mealType = document.getElementById('meal-type');
    const maxTime = document.getElementById('max-time');
    const maxCalories = document.getElementById('max-calories');
    const timeValue = document.getElementById('time-value');
    const caloriesValue = document.getElementById('calories-value');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const sortOptions = document.getElementById('sort-options');
    
    // Modal Elements
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalFavoriteBtn = document.getElementById('modal-favorite');
    const modalTime = document.getElementById('modal-time');
    const modalServings = document.getElementById('modal-servings');
    const modalCalories = document.getElementById('modal-calories');
    const modalType = document.getElementById('modal-type');
    const modalIngredients = document.getElementById('modal-ingredients');
    const modalInstructions = document.getElementById('modal-instructions');
    const modalNutrition = document.getElementById('modal-nutrition');
    
    // Template
    const recipeTemplate = document.getElementById('recipe-template');
    
    // Application State
    let currentRecipes = [];
    let favorites = [];
    let currentFilters = {
        diet: '',
        mealType: '',
        maxTime: 60,
        maxCalories: 500
    };
    let currentQuery = '';
    let currentPage = 1;
    let totalResults = 0;
    
    // Initialize the app
    function init() {
        console.log('Initializing Recipe Saver App...');
        
        // Load favorites from localStorage
        loadFavorites();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize range displays
        updateRangeDisplays();
        
        // Load sample recipes on startup
        searchRecipes('pasta');
        
        // Update statistics
        updateStats();
    }
    
    // Load favorites from localStorage
    function loadFavorites() {
        try {
            const favoritesJson = localStorage.getItem('recipeSaverFavorites');
            if (favoritesJson) {
                favorites = JSON.parse(favoritesJson);
                console.log(`Loaded ${favorites.length} favorites from localStorage`);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            favorites = [];
        }
    }
    
    // Save favorites to localStorage
    function saveFavorites() {
        try {
            localStorage.setItem('recipeSaverFavorites', JSON.stringify(favorites));
            console.log(`Saved ${favorites.length} favorites to localStorage`);
        } catch (error) {
            console.error('Error saving favorites:', error);
            showNotification('Error saving favorites', 'error');
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search button
        searchBtn.addEventListener('click', () => {
            if (searchInput.value.trim()) {
                searchRecipes(searchInput.value.trim());
            }
        });
        
        // Search input enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                searchRecipes(searchInput.value.trim());
            }
        });
        
        // Search tags
        searchTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const search = tag.dataset.search;
                searchInput.value = search;
                searchRecipes(search);
            });
        });
        
        // Tab navigation
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tab}-tab`) {
                        content.classList.add('active');
                    }
                });
                
                // Show/hide filters section
                if (tab === 'filters') {
                    filtersSection.style.display = 'block';
                } else {
                    filtersSection.style.display = 'none';
                }
                
                // Load favorites if on favorites tab
                if (tab === 'favorites') {
                    renderFavorites();
                }
            });
        });
        
        // Range inputs
        maxTime.addEventListener('input', () => {
            timeValue.textContent = `${maxTime.value} min`;
        });
        
        maxCalories.addEventListener('input', () => {
            caloriesValue.textContent = `${maxCalories.value} cal`;
        });
        
        // Filter buttons
        applyFiltersBtn.addEventListener('click', applyFilters);
        clearFiltersBtn.addEventListener('click', clearFilters);
        
        // Sort options
        sortOptions.addEventListener('change', () => {
            sortRecipes();
            renderRecipes();
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        // Click outside modal to close
        recipeModal.addEventListener('click', (e) => {
            if (e.target === recipeModal) {
                closeModal();
            }
        });
        
        // Clear favorites button
        document.getElementById('clear-favorites').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all favorites?')) {
                favorites = [];
                saveFavorites();
                renderFavorites();
                updateStats();
                showNotification('Favorites cleared', 'success');
            }
        });
        
        // Export favorites button
        document.getElementById('export-favorites').addEventListener('click', exportFavorites);
        
        // Import favorites button
        document.getElementById('import-favorites').addEventListener('click', () => {
            alert('Import feature: Save your favorites as JSON and use the browser console to import.');
        });
        
        // Print recipe button
        document.getElementById('print-recipe').addEventListener('click', printRecipe);
    }
    
    // Update range display values
    function updateRangeDisplays() {
        timeValue.textContent = `${maxTime.value} min`;
        caloriesValue.textContent = `${maxCalories.value} cal`;
    }
    
    // Show loading overlay
    function showLoading() {
        loadingOverlay.classList.add('active');
    }
    
    // Hide loading overlay
    function hideLoading() {
        loadingOverlay.classList.remove('active');
    }
    
    // Search recipes from API
    async function searchRecipes(query, page = 1) {
        if (!query) return;
        
        showLoading();
        currentQuery = query;
        currentPage = page;
        
        try {
            // Build query parameters
            const params = new URLSearchParams({
                apiKey: API_KEY,
                query: query,
                number: 12,
                offset: (page - 1) * 12,
                addRecipeInformation: true,
                fillIngredients: true,
                addRecipeNutrition: true
            });
            
            // Add filters
            if (currentFilters.diet) params.append('diet', currentFilters.diet);
            if (currentFilters.mealType) params.append('type', currentFilters.mealType);
            if (currentFilters.maxTime) params.append('maxReadyTime', currentFilters.maxTime);
            if (currentFilters.maxCalories) params.append('maxCalories', currentFilters.maxCalories);
            
            const response = await fetch(`${API_URL}/complexSearch?${params}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            currentRecipes = data.results || [];
            totalResults = data.totalResults || 0;
            
            // Fetch detailed information for each recipe
            await fetchRecipeDetails();
            
            // Sort recipes
            sortRecipes();
            
            // Render recipes
            renderRecipes();
            renderPagination();
            
            // Update stats
            updateStats();
            
            showNotification(`Found ${totalResults} recipes for "${query}"`, 'success');
            
        } catch (error) {
            console.error('Error searching recipes:', error);
            
            // Fallback to sample data if API fails
            useSampleData();
            
            showNotification('Using sample data (API limit reached)', 'warning');
        } finally {
            hideLoading();
        }
    }
    
    // Fetch detailed information for recipes
    async function fetchRecipeDetails() {
        const recipeIds = currentRecipes.map(recipe => recipe.id).join(',');
        
        if (!recipeIds) return;
        
        try {
            const response = await fetch(
                `${API_URL}/informationBulk?apiKey=${API_KEY}&ids=${recipeIds}`
            );
            
            if (response.ok) {
                const detailedRecipes = await response.json();
                
                // Merge detailed information with current recipes
                currentRecipes = currentRecipes.map(recipe => {
                    const detailed = detailedRecipes.find(d => d.id === recipe.id);
                    return detailed ? { ...recipe, ...detailed } : recipe;
                });
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
        }
    }
    
    // Use sample data when API fails
    function useSampleData() {
        currentRecipes = [
            {
                id: 1,
                title: "Classic Spaghetti Carbonara",
                image: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=600",
                readyInMinutes: 30,
                servings: 4,
                nutrition: { nutrients: [{ amount: 450, name: "Calories" }] },
                dishTypes: ["main course"],
                diets: ["gluten free"],
                summary: "A classic Italian pasta dish with eggs, cheese, and pancetta."
            },
            {
                id: 2,
                title: "Chocolate Chip Cookies",
                image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w-600",
                readyInMinutes: 25,
                servings: 24,
                nutrition: { nutrients: [{ amount: 120, name: "Calories" }] },
                dishTypes: ["dessert"],
                diets: ["vegetarian"],
                summary: "Soft and chewy chocolate chip cookies that melt in your mouth."
            },
            {
                id: 3,
                title: "Greek Salad",
                image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
                readyInMinutes: 15,
                servings: 2,
                nutrition: { nutrients: [{ amount: 250, name: "Calories" }] },
                dishTypes: ["salad"],
                diets: ["vegetarian", "gluten free"],
                summary: "Fresh Mediterranean salad with feta cheese and olives."
            },
            {
                id: 4,
                title: "Chicken Curry",
                image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600",
                readyInMinutes: 45,
                servings: 6,
                nutrition: { nutrients: [{ amount: 380, name: "Calories" }] },
                dishTypes: ["main course"],
                diets: ["gluten free"],
                summary: "Spicy and aromatic chicken curry with rich flavors."
            }
        ];
        
        totalResults = currentRecipes.length;
    }
    
    // Apply filters
    function applyFilters() {
        currentFilters = {
            diet: dietFilter.value,
            mealType: mealType.value,
            maxTime: parseInt(maxTime.value),
            maxCalories: parseInt(maxCalories.value)
        };
        
        if (currentQuery) {
            searchRecipes(currentQuery, 1);
        }
    }
    
    // Clear all filters
    function clearFilters() {
        dietFilter.value = '';
        mealType.value = '';
        maxTime.value = 60;
        maxCalories.value = 500;
        updateRangeDisplays();
        
        currentFilters = {
            diet: '',
            mealType: '',
            maxTime: 60,
            maxCalories: 500
        };
        
        if (currentQuery) {
            searchRecipes(currentQuery, 1);
        }
    }
    
    // Sort recipes
    function sortRecipes() {
        const sortBy = sortOptions.value;
        
        currentRecipes.sort((a, b) => {
            switch (sortBy) {
                case 'time':
                    return a.readyInMinutes - b.readyInMinutes;
                case 'calories':
                    const calA = a.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0;
                    const calB = b.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0;
                    return calA - calB;
                case 'popularity':
                    return (b.aggregateLikes || 0) - (a.aggregateLikes || 0);
                default:
                    return 0; // relevance - keep API order
            }
        });
    }
    
    // Render recipes grid
    function renderRecipes() {
        recipesGrid.innerHTML = '';
        
        if (currentRecipes.length === 0) {
            recipesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensil-spoon"></i>
                    <h3>No recipes found</h3>
                    <p>Try a different search term or adjust your filters</p>
                </div>
            `;
            return;
        }
        
        currentRecipes.forEach(recipe => {
            const recipeElement = recipeTemplate.content.cloneNode(true);
            const recipeCard = recipeElement.querySelector('.recipe-card');
            
            // Set recipe data
            recipeCard.dataset.id = recipe.id;
            
            const img = recipeCard.querySelector('.recipe-img');
            img.src = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
            img.alt = recipe.title;
            
            recipeCard.querySelector('.recipe-title').textContent = recipe.title;
            recipeCard.querySelector('.time-value').textContent = recipe.readyInMinutes || 'N/A';
            
            // Calculate calories
            const calories = recipe.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0;
            recipeCard.querySelector('.calories-value').textContent = Math.round(calories);
            
            recipeCard.querySelector('.servings-value').textContent = recipe.servings || 'N/A';
            
            // Add diet tags
            const dietTagsContainer = recipeCard.querySelector('.recipe-diet-tags');
            if (recipe.diets && recipe.diets.length > 0) {
                recipe.diets.slice(0, 3).forEach(diet => {
                    const tag = document.createElement('span');
                    tag.className = `diet-tag ${diet.toLowerCase().replace(/\s+/g, '-')}`;
                    tag.textContent = diet;
                    dietTagsContainer.appendChild(tag);
                });
            }
            
            // Truncate summary
            const summary = recipeCard.querySelector('.recipe-summary');
            if (recipe.summary) {
                const cleanSummary = recipe.summary.replace(/<[^>]*>/g, '');
                summary.textContent = cleanSummary.length > 150 
                    ? cleanSummary.substring(0, 150) + '...' 
                    : cleanSummary;
            } else {
                summary.textContent = 'No description available.';
            }
            
            // Set favorite button state
            const favoriteBtn = recipeCard.querySelector('.btn-favorite');
            const isFavorite = favorites.some(fav => fav.id === recipe.id);
            if (isFavorite) {
                favoriteBtn.classList.add('active');
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            
            // Add event listeners
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(recipe);
            });
            
            recipeCard.querySelector('.view-recipe').addEventListener('click', () => {
                showRecipeModal(recipe);
            });
            
            recipesGrid.appendChild(recipeElement);
        });
        
        // Update results count
        document.getElementById('results-count').textContent = `${currentRecipes.length} results`;
    }
    
    // Render favorites grid
    function renderFavorites() {
        favoritesGrid.innerHTML = '';
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>No favorites yet</h3>
                    <p>Click the heart icon on any recipe to save it here</p>
                </div>
            `;
            return;
        }
        
        favorites.forEach(recipe => {
            const recipeElement = recipeTemplate.content.cloneNode(true);
            const recipeCard = recipeElement.querySelector('.recipe-card');
            
            // Set recipe data
            recipeCard.dataset.id = recipe.id;
            
            const img = recipeCard.querySelector('.recipe-img');
            img.src = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
            img.alt = recipe.title;
            
            recipeCard.querySelector('.recipe-title').textContent = recipe.title;
            recipeCard.querySelector('.time-value').textContent = recipe.readyInMinutes || 'N/A';
            
            const calories = recipe.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0;
            recipeCard.querySelector('.calories-value').textContent = Math.round(calories);
            
            recipeCard.querySelector('.servings-value').textContent = recipe.servings || 'N/A';
            
            // Add diet tags
            const dietTagsContainer = recipeCard.querySelector('.recipe-diet-tags');
            if (recipe.diets && recipe.diets.length > 0) {
                recipe.diets.slice(0, 3).forEach(diet => {
                    const tag = document.createElement('span');
                    tag.className = `diet-tag ${diet.toLowerCase().replace(/\s+/g, '-')}`;
                    tag.textContent = diet;
                    dietTagsContainer.appendChild(tag);
                });
            }
            
            // Truncate summary
            const summary = recipeCard.querySelector('.recipe-summary');
            if (recipe.summary) {
                const cleanSummary = recipe.summary.replace(/<[^>]*>/g, '');
                summary.textContent = cleanSummary.length > 150 
                    ? cleanSummary.substring(0, 150) + '...' 
                    : cleanSummary;
            }
            
            // Set favorite button to active
            const favoriteBtn = recipeCard.querySelector('.btn-favorite');
            favoriteBtn.classList.add('active');
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
            
            // Add event listeners
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(recipe);
            });
            
            recipeCard.querySelector('.view-recipe').addEventListener('click', () => {
                showRecipeModal(recipe);
            });
            
            favoritesGrid.appendChild(recipeElement);
        });
    }
    
    // Render pagination
    function renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(totalResults / 12);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.app?.changePage(${currentPage - 1})" 
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="window.app?.changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.app?.changePage(${currentPage + 1})" 
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    // Change page
    function changePage(page) {
        if (page >= 1 && page <= Math.ceil(totalResults / 12)) {
            searchRecipes(currentQuery, page);
        }
    }
    
    // Toggle favorite
    function toggleFavorite(recipe) {
        const index = favorites.findIndex(fav => fav.id === recipe.id);
        
        if (index === -1) {
            // Add to favorites
            favorites.push(recipe);
            showNotification('Added to favorites!', 'success');
        } else {
            // Remove from favorites
            favorites.splice(index, 1);
            showNotification('Removed from favorites', 'info');
        }
        
        // Save favorites
        saveFavorites();
        
        // Update UI
        if (document.querySelector('.tab-btn.active').dataset.tab === 'favorites') {
            renderFavorites();
        } else {
            renderRecipes();
        }
        
        updateStats();
    }
    
    // Show recipe modal
    async function showRecipeModal(recipe) {
        showLoading();
        
        try {
            // Fetch complete recipe details if not available
            if (!recipe.analyzedInstructions || !recipe.extendedIngredients) {
                const response = await fetch(
                    `${API_URL}/${recipe.id}/information?apiKey=${API_KEY}`
                );
                
                if (response.ok) {
                    const detailedRecipe = await response.json();
                    recipe = { ...recipe, ...detailedRecipe };
                }
            }
            
            // Update modal content
            modalTitle.textContent = recipe.title;
            modalImage.src = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
            modalImage.alt = recipe.title;
            
            // Update favorite button
            const isFavorite = favorites.some(fav => fav.id === recipe.id);
            modalFavoriteBtn.classList.toggle('active', isFavorite);
            modalFavoriteBtn.innerHTML = isFavorite 
                ? '<i class="fas fa-heart"></i>' 
                : '<i class="far fa-heart"></i>';
            
            modalFavoriteBtn.onclick = () => toggleFavorite(recipe);
            
            // Update stats
            modalTime.textContent = recipe.readyInMinutes || 'N/A';
            modalServings.textContent = recipe.servings || 'N/A';
            
            const calories = recipe.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0;
            modalCalories.textContent = Math.round(calories);
            
            modalType.textContent = recipe.dishTypes?.[0] || 'Main Course';
            
            // Update ingredients
            modalIngredients.innerHTML = '';
            if (recipe.extendedIngredients) {
                recipe.extendedIngredients.forEach(ingredient => {
                    const li = document.createElement('li');
                    li.textContent = `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
                    modalIngredients.appendChild(li);
                });
            } else {
                modalIngredients.innerHTML = '<li>No ingredient information available</li>';
            }
            
            // Update instructions
            modalInstructions.innerHTML = '';
            if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
                recipe.analyzedInstructions[0].steps.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step.step;
                    modalInstructions.appendChild(li);
                });
            } else if (recipe.instructions) {
                const instructions = recipe.instructions.split('\n').filter(step => step.trim());
                instructions.forEach((step, index) => {
                    const li = document.createElement('li');
                    li.textContent = step;
                    modalInstructions.appendChild(li);
                });
            } else {
                modalInstructions.innerHTML = '<li>No instructions available</li>';
            }
            
            // Update nutrition info
            modalNutrition.innerHTML = '';
            if (recipe.nutrition?.nutrients) {
                const importantNutrients = [
                    { name: 'Calories', unit: 'kcal' },
                    { name: 'Protein', unit: 'g' },
                    { name: 'Carbohydrates', unit: 'g' },
                    { name: 'Fat', unit: 'g' },
                    { name: 'Fiber', unit: 'g' },
                    { name: 'Sugar', unit: 'g' }
                ];
                
                importantNutrients.forEach(nutrientInfo => {
                    const nutrient = recipe.nutrition.nutrients.find(n => 
                        n.name.toLowerCase().includes(nutrientInfo.name.toLowerCase())
                    );
                    
                    if (nutrient) {
                        const div = document.createElement('div');
                        div.className = 'nutrition-item';
                        div.innerHTML = `
                            <span class="label">${nutrientInfo.name}</span>
                            <span class="value">${Math.round(nutrient.amount)}${nutrientInfo.unit}</span>
                        `;
                        modalNutrition.appendChild(div);
                    }
                });
            } else {
                modalNutrition.innerHTML = '<div class="nutrition-item">No nutrition information available</div>';
            }
            
            // Show modal
            recipeModal.classList.add('active');
            
        } catch (error) {
            console.error('Error loading recipe details:', error);
            showNotification('Error loading recipe details', 'error');
        } finally {
            hideLoading();
        }
    }
    
    // Close modal
    function closeModal() {
        recipeModal.classList.remove('active');
    }
    
    // Print recipe
    function printRecipe() {
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <h1>${modalTitle.textContent}</h1>
            <p><strong>Preparation Time:</strong> ${modalTime.textContent} minutes</p>
            <p><strong>Servings:</strong> ${modalServings.textContent}</p>
            <p><strong>Calories:</strong> ${modalCalories.textContent} kcal per serving</p>
            
            <h2>Ingredients</h2>
            ${Array.from(modalIngredients.children).map(li => `<p>• ${li.textContent}</p>`).join('')}
            
            <h2>Instructions</h2>
            ${Array.from(modalInstructions.children).map((li, i) => `<p>${i + 1}. ${li.textContent}</p>`).join('')}
            
            <p style="margin-top: 30px; font-style: italic;">
                Printed from Recipe Saver • ${new Date().toLocaleDateString()}
            </p>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${modalTitle.textContent} - Recipe Saver</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                        h1 { color: #333; }
                        h2 { color: #555; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
    
    // Export favorites
    function exportFavorites() {
        if (favorites.length === 0) {
            showNotification('No favorites to export', 'warning');
            return;
        }
        
        const dataStr = JSON.stringify(favorites, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `recipe-favorites-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        showNotification('Favorites exported successfully!', 'success');
    }
    
    // Update statistics
    function updateStats() {
        // Recipes found
        recipesFoundEl.textContent = totalResults;
        
        // Favorites count
        favoritesCountEl.textContent = favorites.length;
        
        // Average preparation time
        if (currentRecipes.length > 0) {
            const totalTime = currentRecipes.reduce((sum, recipe) => sum + (recipe.readyInMinutes || 0), 0);
            const avgTime = Math.round(totalTime / currentRecipes.length);
            avgTimeEl.textContent = `${avgTime} min`;
        } else {
            avgTimeEl.textContent = '0 min';
        }
        
        // Average calories
        if (currentRecipes.length > 0) {
            let totalCalories = 0;
            let counted = 0;
            
            currentRecipes.forEach(recipe => {
                const calories = recipe.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount;
                if (calories) {
                    totalCalories += calories;
                    counted++;
                }
            });
            
            if (counted > 0) {
                const avgCalories = Math.round(totalCalories / counted);
                avgCaloriesEl.textContent = avgCalories;
            } else {
                avgCaloriesEl.textContent = '0';
            }
        } else {
            avgCaloriesEl.textContent = '0';
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
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
                    type === 'success' ? 'check-circle' : 'info-circle';
        
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
    
    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        }
        
        .notification-success {
            border-left: 4px solid var(--success-color);
        }
        
        .notification-info {
            border-left: 4px solid var(--info-color);
        }
        
        .notification-warning {
            border-left: 4px solid var(--warning-color);
        }
        
        .notification-error {
            border-left: 4px solid var(--danger-color);
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        .notification-success i {
            color: var(--success-color);
        }
        
        .notification-info i {
            color: var(--info-color);
        }
        
        .notification-warning i {
            color: var(--warning-color);
        }
        
        .notification-error i {
            color: var(--danger-color);
        }
        
        .notification span {
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--gray-color);
            cursor: pointer;
            font-size: 1rem;
            padding: 0;
            display: flex;
            align-items: center;
        }
        
        @keyframes slideInRight {
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
    
    // Expose functions to window for pagination
    window.app = {
        changePage
    };
    
    // Initialize the application
    init();
});