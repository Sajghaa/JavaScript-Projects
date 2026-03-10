export class ThemeManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.themes = {
            modern: {
                primary: '#2563eb',
                secondary: '#1e40af',
                font: 'Inter',
                name: 'modern'
            },
            minimal: {
                primary: '#333333',
                secondary: '#666666',
                font: 'Montserrat',
                name: 'minimal'
            },
            creative: {
                primary: '#7c3aed',
                secondary: '#5b21b6',
                font: 'Poppins',
                name: 'creative'
            },
            professional: {
                primary: '#059669',
                secondary: '#047857',
                font: 'Roboto',
                name: 'professional'
            }
        };
        
        this.loadTheme();
    }

    loadTheme() {
        const theme = this.stateManager.get('portfolio.theme');
        if (theme) {
            this.applyTheme(theme);
        }
    }

    setTheme(themeName) {
        const theme = this.themes[themeName];
        if (theme) {
            this.stateManager.set('portfolio.theme', theme);
            this.applyTheme(theme);
            this.eventBus.emit('theme:changed', themeName);
        }
    }

    setColors(primary, secondary) {
        const theme = this.stateManager.get('portfolio.theme');
        theme.primary = primary;
        theme.secondary = secondary;
        this.stateManager.set('portfolio.theme', theme);
        this.applyColors(primary, secondary);
    }

    setFont(font) {
        const theme = this.stateManager.get('portfolio.theme');
        theme.font = font;
        this.stateManager.set('portfolio.theme', theme);
        this.loadFont(font);
    }

    setLayout(layout) {
        this.stateManager.set('portfolio.theme.layout', layout);
    }

    setAnimations(enabled) {
        this.stateManager.set('portfolio.theme.animations', enabled);
    }

    applyTheme(theme) {
        this.applyColors(theme.primary, theme.secondary);
        this.loadFont(theme.font);
        
        // Update UI
        document.querySelectorAll('.color-scheme').forEach(el => {
            const primary = el.dataset.primary;
            el.classList.toggle('active', primary === theme.primary);
        });
        
        document.getElementById('themeSelect').value = theme.name;
        document.getElementById('fontSelect').value = theme.font;
        document.getElementById('animationsToggle').checked = theme.animations;
    }

    applyColors(primary, secondary) {
        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--primary-dark', secondary);
    }

    loadFont(font) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
}