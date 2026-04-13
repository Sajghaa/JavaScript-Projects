class ThemeSelector {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.themes = {
            modern: {
                name: 'Modern',
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                fontFamily: 'Inter',
                description: 'Clean and contemporary design with gradient accents'
            },
            creative: {
                name: 'Creative',
                primaryColor: '#ec4899',
                secondaryColor: '#f43f5e',
                fontFamily: 'Poppins',
                description: 'Bold and artistic design for creative professionals'
            },
            minimal: {
                name: 'Minimal',
                primaryColor: '#1f2937',
                secondaryColor: '#374151',
                fontFamily: 'Montserrat',
                description: 'Simple and elegant design focusing on content'
            },
            professional: {
                name: 'Professional',
                primaryColor: '#0f172a',
                secondaryColor: '#1e293b',
                fontFamily: 'Roboto',
                description: 'Corporate style for business professionals'
            }
        };
        
        this.init();
    }

    init() {
        this.renderThemeOptions();
        this.setupEventListeners();
        this.applyCurrentTheme();
    }

    renderThemeOptions() {
        const container = document.getElementById('themeOptions');
        if (!container) return;
        
        const currentTheme = this.stateManager.get('design.theme');
        
        container.innerHTML = Object.entries(this.themes).map(([key, theme]) => `
            <div class="theme-card ${currentTheme === key ? 'active' : ''}" data-theme="${key}">
                <div class="theme-preview ${key}-preview" style="background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor});"></div>
                <span>${theme.name}</span>
                <small>${theme.description}</small>
            </div>
        `).join('');
    }

    setupEventListeners() {
        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => {
            card.addEventListener('click', () => {
                const theme = card.dataset.theme;
                this.applyTheme(theme);
            });
        });
    }

    applyTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme) return;
        
        // Update state
        this.stateManager.set('design.theme', themeId);
        this.stateManager.set('design.primaryColor', theme.primaryColor);
        this.stateManager.set('design.secondaryColor', theme.secondaryColor);
        this.stateManager.set('design.fontFamily', theme.fontFamily);
        
        // Update UI
        this.updateColorPickers(theme.primaryColor, theme.secondaryColor);
        this.updateFontSelect(theme.fontFamily);
        
        // Update active state
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === themeId);
        });
        
        // Apply theme CSS
        this.applyThemeCSS(themeId);
        
        // Emit event
        this.eventBus.emit('theme:applied', themeId);
        this.eventBus.emit('state:changed');
        
        this.showToast(`${theme.name} theme applied!`, 'success');
    }

    applyCurrentTheme() {
        const currentTheme = this.stateManager.get('design.theme');
        if (currentTheme && this.themes[currentTheme]) {
            this.applyThemeCSS(currentTheme);
        }
    }

    applyThemeCSS(themeId) {
        // Disable all theme stylesheets
        const themes = ['modern', 'creative', 'minimal', 'professional'];
        themes.forEach(t => {
            const link = document.getElementById(`theme${t.charAt(0).toUpperCase() + t.slice(1)}`);
            if (link) {
                link.disabled = true;
            }
        });
        
        // Enable selected theme
        const selectedLink = document.getElementById(`theme${themeId.charAt(0).toUpperCase() + themeId.slice(1)}`);
        if (selectedLink) {
            selectedLink.disabled = false;
        }
        
        // Update CSS variables
        const theme = this.themes[themeId];
        if (theme) {
            document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
            document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        }
    }

    updateColorPickers(primary, secondary) {
        const primaryPicker = document.getElementById('primaryColor');
        const primaryValue = document.getElementById('primaryColorValue');
        const secondaryPicker = document.getElementById('secondaryColor');
        const secondaryValue = document.getElementById('secondaryColorValue');
        
        if (primaryPicker) {
            primaryPicker.value = primary;
            if (primaryValue) primaryValue.textContent = primary;
        }
        
        if (secondaryPicker) {
            secondaryPicker.value = secondary;
            if (secondaryValue) secondaryValue.textContent = secondary;
        }
    }

    updateFontSelect(fontFamily) {
        const fontSelect = document.getElementById('fontFamily');
        if (fontSelect) {
            // Find the option that matches the font family
            for (let i = 0; i < fontSelect.options.length; i++) {
                if (fontSelect.options[i].value === fontFamily) {
                    fontSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    getTheme(themeId) {
        return this.themes[themeId];
    }

    getAllThemes() {
        return this.themes;
    }

    showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

window.ThemeSelector = ThemeSelector;