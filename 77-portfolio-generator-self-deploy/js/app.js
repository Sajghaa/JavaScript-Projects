// app.js - Main application entry point
import { StateManager } from './core/StateManager.js';
import { EventBus } from './core/EventBus.js';
import { StorageManager } from './core/StorageManager.js';
import { EditorManager } from './modules/EditorManager.js';
import { PreviewManager } from './modules/PreviewManager.js';
import { TemplateManager } from './modules/TemplateManager.js';
import { ExportManager } from './modules/ExportManager.js';
import { SkillManager } from './modules/SkillManager.js';
import { ProjectManager } from './modules/ProjectManager.js';
import { DeploymentManager } from './modules/DeploymentManager.js';

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
        this.templateManager = new TemplateManager(this.stateManager, this.eventBus);
        this.exportManager = new ExportManager(this.stateManager, this.eventBus);
        this.skillManager = new SkillManager(this.stateManager, this.eventBus);
        this.projectManager = new ProjectManager(this.stateManager, this.eventBus);
        this.deploymentManager = new DeploymentManager(this.stateManager, this.eventBus);
    }

    initializeUI() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Theme selection
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const theme = card.dataset.theme;
                this.stateManager.set('design.theme', theme);
                this.updateThemeUI(theme);
                this.previewManager.updatePreview();
            });
        });

        // Color pickers
        const primaryColor = document.getElementById('primaryColor');
        const secondaryColor = document.getElementById('secondaryColor');
        
        primaryColor?.addEventListener('input', (e) => {
            this.stateManager.set('design.primaryColor', e.target.value);
            document.getElementById('primaryColorValue').textContent = e.target.value;
            this.previewManager.updatePreview();
        });
        
        secondaryColor?.addEventListener('input', (e) => {
            this.stateManager.set('design.secondaryColor', e.target.value);
            document.getElementById('secondaryColorValue').textContent = e.target.value;
            this.previewManager.updatePreview();
        });

        // Font family
        const fontFamily = document.getElementById('fontFamily');
        fontFamily?.addEventListener('change', (e) => {
            this.stateManager.set('design.fontFamily', e.target.value);
            this.previewManager.updatePreview();
        });

        // Layout options
        document.querySelectorAll('input[name="layout"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.stateManager.set('design.layout', e.target.value);
                    this.previewManager.updatePreview();
                }
            });
        });

        // Animations toggle
        const animationsToggle = document.getElementById('animationsEnabled');
        animationsToggle?.addEventListener('change', (e) => {
            this.stateManager.set('design.animations', e.target.checked);
            this.previewManager.updatePreview();
        });

        // Reset button
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            if (confirm('Reset all changes? This cannot be undone.')) {
                this.stateManager.reset();
            }
        });

        // Deploy button
        document.getElementById('deployBtn')?.addEventListener('click', () => {
            this.showDeployModal();
        });

        // Download button
        document.getElementById('downloadHTMLBtn')?.addEventListener('click', () => {
            this.exportManager.downloadPortfolio();
        });

        // Copy link button
        document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
            this.exportManager.copyPreviewLink();
        });

        // Device preview buttons
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const device = btn.dataset.device;
                this.previewManager.setDevice(device);
                
                document.querySelectorAll('.preview-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Close modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Click outside modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.exportManager.downloadPortfolio();
            }
            
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    setupEventListeners() {
        this.eventBus.on('state:changed', () => {
            this.previewManager.updatePreview();
        });

        this.eventBus.on('notification', ({ message, type }) => {
            this.showToast(message, type);
        });
    }

    loadInitialData() {
        this.editorManager.loadPersonalInfo();
        this.skillManager.loadSkills();
        this.projectManager.loadProjects();
        this.previewManager.updatePreview();
        
        const theme = this.stateManager.get('design.theme');
        this.updateThemeUI(theme);
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}Tab`);
        });
    }

    updateThemeUI(theme) {
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === theme);
        });
    }

    showDeployModal() {
        const modal = document.getElementById('deployModal');
        modal.classList.add('active');
        
        // Setup deploy buttons
        document.querySelectorAll('.deploy-card').forEach(card => {
            const btn = card.querySelector('.btn');
            btn.onclick = () => {
                const method = card.dataset.method;
                this.deploymentManager.deploy(method);
                this.closeModals();
            };
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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PortfolioGenerator();
});