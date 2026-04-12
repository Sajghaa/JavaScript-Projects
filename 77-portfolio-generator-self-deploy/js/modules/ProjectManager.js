export class ProjectManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.initializeProjects();
        this.setupEventListeners();
    }

    initializeProjects() {
        this.renderProjects();
        
        document.getElementById('addProjectBtn')?.addEventListener('click', () => {
            this.addProject();
        });
    }

    setupEventListeners() {
        this.stateManager.subscribe('projects', () => {
            this.renderProjects();
            this.eventBus.emit('state:changed');
        });
    }

    renderProjects() {
        const container = document.getElementById('projectsList');
        const projects = this.stateManager.get('projects');
        
        container.innerHTML = projects.map((project, index) => `
            <div class="project-editor-card" data-project-id="${project.id}">
                <div class="project-header">
                    <input type="text" class="project-title-input" value="${this.escapeHtml(project.title)}" placeholder="Project Title">
                    <div class="project-actions">
                        <button class="project-action-btn move-up" ${index === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="project-action-btn move-down" ${index === projects.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="project-action-btn delete-project">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="project-desc" rows="2">${this.escapeHtml(project.description || '')}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Image URL</label>
                    <input type="url" class="project-image" value="${project.image || ''}" placeholder="https://...">
                </div>
                
                <div class="form-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" class="project-tags" value="${(project.tags || []).join(', ')}" placeholder="React, JavaScript, CSS">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Live Demo URL</label>
                        <input type="url" class="project-link" value="${project.link || ''}" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label>GitHub URL</label>
                        <input type="url" class="project-github" value="${project.github || ''}" placeholder="https://github.com/...">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" class="project-featured" ${project.featured ? 'checked' : ''}>
                        Featured Project
                    </label>
                </div>
            </div>
        `).join('');
        
        this.attachProjectEvents();
    }

    attachProjectEvents() {
        document.querySelectorAll('.project-editor-card').forEach((card, index) => {
            const projectId = card.dataset.projectId;
            
            // Title input
            const titleInput = card.querySelector('.project-title-input');
            titleInput?.addEventListener('input', (e) => {
                this.updateProject(projectId, { title: e.target.value });
            });
            
            // Description
            const descInput = card.querySelector('.project-desc');
            descInput?.addEventListener('input', (e) => {
                this.updateProject(projectId, { description: e.target.value });
            });
            
            // Image
            const imageInput = card.querySelector('.project-image');
            imageInput?.addEventListener('input', (e) => {
                this.updateProject(projectId, { image: e.target.value });
            });
            
            // Tags
            const tagsInput = card.querySelector('.project-tags');
            tagsInput?.addEventListener('input', (e) => {
                const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                this.updateProject(projectId, { tags });
            });
            
            // Link
            const linkInput = card.querySelector('.project-link');
            linkInput?.addEventListener('input', (e) => {
                this.updateProject(projectId, { link: e.target.value });
            });
            
            // GitHub
            const githubInput = card.querySelector('.project-github');
            githubInput?.addEventListener('input', (e) => {
                this.updateProject(projectId, { github: e.target.value });
            });
            
            // Featured
            const featuredCheckbox = card.querySelector('.project-featured');
            featuredCheckbox?.addEventListener('change', (e) => {
                this.updateProject(projectId, { featured: e.target.checked });
            });
            
            // Delete button
            const deleteBtn = card.querySelector('.delete-project');
            deleteBtn?.addEventListener('click', () => {
                this.deleteProject(projectId);
            });
            
            // Move up
            const moveUpBtn = card.querySelector('.move-up');
            moveUpBtn?.addEventListener('click', () => {
                this.moveProject(projectId, 'up');
            });
            
            // Move down
            const moveDownBtn = card.querySelector('.move-down');
            moveDownBtn?.addEventListener('click', () => {
                this.moveProject(projectId, 'down');
            });
        });
    }

    addProject() {
        const newProject = {
            title: 'New Project',
            description: 'Project description goes here...',
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300',
            tags: ['New', 'Project'],
            link: '',
            github: '',
            featured: false
        };
        
        this.stateManager.addProject(newProject);
        this.eventBus.emit('notification', {
            message: 'Project added',
            type: 'success'
        });
    }

    updateProject(projectId, updates) {
        this.stateManager.updateProject(projectId, updates);
    }

    deleteProject(projectId) {
        if (confirm('Delete this project?')) {
            this.stateManager.deleteProject(projectId);
            this.eventBus.emit('notification', {
                message: 'Project deleted',
                type: 'info'
            });
        }
    }

    moveProject(projectId, direction) {
        const projects = this.stateManager.get('projects');
        const index = projects.findIndex(p => p.id === projectId);
        
        if (direction === 'up' && index > 0) {
            [projects[index - 1], projects[index]] = [projects[index], projects[index - 1]];
        } else if (direction === 'down' && index < projects.length - 1) {
            [projects[index], projects[index + 1]] = [projects[index + 1], projects[index]];
        }
        
        this.stateManager.set('projects', [...projects]);
    }

    loadProjects() {
        this.renderProjects();
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}