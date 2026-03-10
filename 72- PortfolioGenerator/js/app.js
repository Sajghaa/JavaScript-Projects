
import { StateManager } from './core/StateManager.js';
import { EventBus } from './core/EventBus.js';
import { StorageManager } from './core/StorageManager.js';
import { EditorManager } from './modules/EditorManager.js';
import { PreviewManager } from './modules/PreviewManager.js';
import { SectionManager } from './modules/SectionManager.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { ExportManager } from './modules/ExportManager.js';

class PortfolioGenerator {
    constructor() {
        this.stateManager = new StateManager();
        this.eventBus = new EventBus();
        
        this.initializeModules();
        this.initializeUI();
        this.setupEventListeners();
        this.loadInitialData();
    }

    initializeModules() {
        this.editorManager = new EditorManager(this.stateManager, this.eventBus);
        this.previewManager = new PreviewManager(this.stateManager, this.eventBus);
        this.sectionManager = new SectionManager(this.stateManager, this.eventBus);
        this.themeManager = new ThemeManager(this.stateManager, this.eventBus);
        this.exportManager = new ExportManager(this.stateManager, this.eventBus);
    }

    initializeUI() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Device preview switching
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const device = e.currentTarget.dataset.device;
                this.switchDevice(device);
            });
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.savePortfolio();
        });

        // Preview button
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.togglePreviewMode();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportModal();
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Section items drag
        document.querySelectorAll('.section-item').forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        // Theme selection
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.themeManager.setTheme(e.target.value);
        });

        // Color scheme selection
        document.querySelectorAll('.color-scheme').forEach(scheme => {
            scheme.addEventListener('click', () => {
                const primary = scheme.dataset.primary;
                const secondary = scheme.dataset.secondary;
                this.themeManager.setColors(primary, secondary);
            });
        });

        // Font selection
        document.getElementById('fontSelect').addEventListener('change', (e) => {
            this.themeManager.setFont(e.target.value);
        });

        // Layout selection
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layout = e.currentTarget.dataset.layout;
                this.themeManager.setLayout(layout);
            });
        });

        // Animations toggle
        document.getElementById('animationsToggle').addEventListener('change', (e) => {
            this.themeManager.setAnimations(e.target.checked);
        });

        // Social links
        ['github', 'linkedin', 'twitter', 'codepen'].forEach(platform => {
            document.getElementById(`${platform}Url`).addEventListener('input', (e) => {
                this.stateManager.set(`portfolio.social.${platform}`, e.target.value);
            });
        });

        // SEO fields
        document.getElementById('metaTitle').addEventListener('input', (e) => {
            this.stateManager.set('portfolio.seo.title', e.target.value);
        });

        document.getElementById('metaDescription').addEventListener('input', (e) => {
            this.stateManager.set('portfolio.seo.description', e.target.value);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    setupEventListeners() {
        // Listen for state changes
        this.stateManager.subscribe('*', () => {
            this.previewManager.updatePreview();
        });

        // Listen for section changes
        this.eventBus.on('section:added', (section) => {
            this.showToast(`Section "${section.type}" added`, 'success');
        });

        this.eventBus.on('section:removed', (section) => {
            this.showToast('Section removed', 'info');
        });

        this.eventBus.on('section:reordered', () => {
            this.showToast('Sections reordered', 'info');
        });

        // Listen for theme changes
        this.eventBus.on('theme:changed', (theme) => {
            this.showToast(`Theme changed to ${theme}`, 'success');
        });

        // Listen for export events
        this.eventBus.on('export:started', () => {
            this.showToast('Preparing export...', 'info');
        });

        this.eventBus.on('export:completed', (format) => {
            this.showToast(`Exported as ${format.toUpperCase()}`, 'success');
        });

        this.eventBus.on('export:error', (error) => {
            this.showToast(`Export failed: ${error}`, 'error');
        });
    }

    loadInitialData() {
        // Check if there's saved data
        const saved = this.stateManager.get('portfolio');
        if (!saved.personal.name) {
            // Load sample data
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const sampleData = {
            personal: {
                name: 'Alex Johnson',
                title: 'Creative Full Stack Developer',
                email: 'alex@example.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                bio: 'I\'m a passionate developer with 6+ years of experience creating beautiful, functional web applications. I love solving complex problems and building things that make a difference.'
            },
            sections: [
                { type: 'hero', id: 'hero1', visible: true },
                { type: 'about', id: 'about1', visible: true },
                { type: 'projects', id: 'projects1', visible: true },
                { type: 'skills', id: 'skills1', visible: true },
                { type: 'experience', id: 'experience1', visible: true },
                { type: 'contact', id: 'contact1', visible: true }
            ]
        };

        this.stateManager.beginBatch();
        this.stateManager.set('portfolio.personal', sampleData.personal);
        this.stateManager.set('portfolio.sections', sampleData.sections);
        this.stateManager.endBatch();
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update panels
        document.querySelectorAll('.sidebar-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tab}Panel`);
        });

        this.stateManager.set('ui.activeTab', tab);
    }

    switchDevice(device) {
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.device === device);
        });

        const frame = document.getElementById('previewFrame');
        const container = document.getElementById('previewContainer');

        // Adjust iframe size based on device
        switch(device) {
            case 'mobile':
                frame.style.maxWidth = '375px';
                frame.style.margin = '0 auto';
                break;
            case 'tablet':
                frame.style.maxWidth = '768px';
                frame.style.margin = '0 auto';
                break;
            default:
                frame.style.maxWidth = '100%';
                frame.style.margin = '0';
        }

        this.stateManager.set('ui.device', device);
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.stateManager.undo();
        }

        // Ctrl/Cmd + Shift + Z for redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            this.stateManager.redo();
        }

        // Ctrl/Cmd + S for save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.savePortfolio();
        }

        // Ctrl/Cmd + P for preview
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            this.togglePreviewMode();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeModals();
        }
    }

    savePortfolio() {
        this.stateManager.saveToStorage();
        this.showToast('Portfolio saved successfully!', 'success');
    }

    togglePreviewMode() {
        const isPreview = this.stateManager.get('ui.previewMode') === 'preview';
        this.stateManager.set('ui.previewMode', isPreview ? 'live' : 'preview');
        
        const previewBtn = document.getElementById('previewBtn');
        previewBtn.innerHTML = isPreview ? 
            '<i class="fas fa-eye"></i> Preview' : 
            '<i class="fas fa-edit"></i> Edit';
        
        this.showToast(isPreview ? 'Editing mode' : 'Preview mode', 'info');
    }

    showExportModal() {
        document.getElementById('exportModal').classList.add('active');
        
        // Setup export buttons
        document.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.export;
                this.exportManager.export(format);
                this.closeModals();
            }, { once: true });
        });
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PortfolioGenerator();
});