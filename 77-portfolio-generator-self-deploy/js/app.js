function initializeApp() {
    console.log('Initializing Portfolio Generator...');
    
    // Create instances
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const previewManager = new PreviewManager(stateManager, eventBus);
    const exportManager = new ExportManager(stateManager, eventBus, previewManager);
    const deploymentManager = new DeploymentManager(stateManager, eventBus, previewManager);
    const editorManager = new EditorManager(stateManager, eventBus);
    const templateManager = new TemplateManager(stateManager, eventBus);
    const skillManager = new SkillManager(stateManager, eventBus);
    const projectManager = new ProjectManager(stateManager, eventBus);
    
    // Set up preview panel
    const previewPanel = new PreviewPanel(stateManager, eventBus, previewManager);
    
    // Initial preview update
    previewManager.updatePreview();
    
    // Set up event listeners for real-time updates
    document.addEventListener('stateChanged', () => {
        previewManager.updatePreview();
    });
    
    // Set up notification handling
    eventBus.on('notification', ({ message, type }) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    });
    
    console.log('Portfolio Generator initialized successfully!');
}

// Make sure DOM is loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}