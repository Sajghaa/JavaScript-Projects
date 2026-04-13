class PreviewPanel {
    constructor(stateManager, eventBus, previewManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.previewManager = previewManager;
        this.currentDevice = 'desktop';
        
        this.init();
    }

    init() {
        this.setupDeviceButtons();
        this.setupActionButtons();
        this.setupThemeSelector();
        this.setupDesignControls();
    }

    setupDeviceButtons() {
        const deviceBtns = document.querySelectorAll('.preview-btn');
        deviceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const device = btn.dataset.device;
                this.setDevice(device);
                
                // Update active state
                deviceBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setDevice(device) {
        this.currentDevice = device;
        this.previewManager.setDevice(device);
    }

    setupActionButtons() {
        // Download button
        const downloadBtn = document.getElementById('downloadHTMLBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.eventBus.emit('export:download');
            });
        }
        
        // Copy link button
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                this.eventBus.emit('export:copyLink');
            });
        }
        
        // Deploy button
        const deployBtn = document.getElementById('deployBtn');
        if (deployBtn) {
            deployBtn.addEventListener('click', () => {
                this.eventBus.emit('deploy:show');
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all changes? This cannot be undone.')) {
                    localStorage.removeItem('portfolio_data');
                    window.location.reload();
                }
            });
        }
    }

    setupThemeSelector() {
        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => {
            card.addEventListener('click', () => {
                const theme = card.dataset.theme;
                this.stateManager.set('design.theme', theme);
                
                // Update active state
                themeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Apply theme CSS
                this.applyTheme(theme);
            });
        });
        
        // Set initial active theme
        const currentTheme = this.stateManager.get('design.theme');
        const activeCard = document.querySelector(`.theme-card[data-theme="${currentTheme}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
    }

    applyTheme(theme) {
        // Disable all theme stylesheets
        const themes = ['modern', 'creative', 'minimal', 'professional'];
        themes.forEach(t => {
            const link = document.getElementById(`theme${t.charAt(0).toUpperCase() + t.slice(1)}`);
            if (link) {
                link.disabled = true;
            }
        });
        
        // Enable selected theme
        const selectedLink = document.getElementById(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
        if (selectedLink) {
            selectedLink.disabled = false;
        }
    }

    setupDesignControls() {
        // Primary color picker
        const primaryColor = document.getElementById('primaryColor');
        const primaryValue = document.getElementById('primaryColorValue');
        if (primaryColor) {
            primaryColor.addEventListener('input', (e) => {
                this.stateManager.set('design.primaryColor', e.target.value);
                if (primaryValue) primaryValue.textContent = e.target.value;
            });
        }
        
        // Secondary color picker
        const secondaryColor = document.getElementById('secondaryColor');
        const secondaryValue = document.getElementById('secondaryColorValue');
        if (secondaryColor) {
            secondaryColor.addEventListener('input', (e) => {
                this.stateManager.set('design.secondaryColor', e.target.value);
                if (secondaryValue) secondaryValue.textContent = e.target.value;
            });
        }
        
        // Font family
        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily) {
            fontFamily.addEventListener('change', (e) => {
                this.stateManager.set('design.fontFamily', e.target.value);
            });
        }
        
        // Layout options
        const layoutRadios = document.querySelectorAll('input[name="layout"]');
        layoutRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.stateManager.set('design.layout', e.target.value);
                }
            });
        });
        
        // Animations toggle
        const animationsToggle = document.getElementById('animationsEnabled');
        if (animationsToggle) {
            animationsToggle.addEventListener('change', (e) => {
                this.stateManager.set('design.animations', e.target.checked);
            });
        }
    }

    updatePreview() {
        this.previewManager.updatePreview();
    }
}

window.PreviewPanel = PreviewPanel;