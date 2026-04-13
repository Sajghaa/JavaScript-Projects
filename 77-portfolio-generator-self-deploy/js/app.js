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

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.editor-sidebar');
    
    if (!toggleBtn || !sidebar) return;
    
    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Toggle sidebar collapse
    function toggleSidebar() {
        if (isMobile()) {
            sidebar.classList.toggle('collapsed');
            const icon = toggleBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-down';
            } else {
                icon.className = 'fas fa-chevron-up';
            }
        }
    }
    
    // Reset sidebar state on resize
    function handleResize() {
        if (!isMobile()) {
            sidebar.classList.remove('collapsed');
            toggleBtn.style.display = 'none';
        } else {
            toggleBtn.style.display = 'flex';
            // Start collapsed on mobile for better UX
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                const icon = toggleBtn.querySelector('i');
                icon.className = 'fas fa-chevron-down';
            }
        }
    }
    
    // Event listeners
    toggleBtn.addEventListener('click', toggleSidebar);
    window.addEventListener('resize', handleResize);
    
    // Initialize
    handleResize();
}

// Call when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}