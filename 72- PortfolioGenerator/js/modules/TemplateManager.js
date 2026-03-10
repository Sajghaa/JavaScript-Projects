export class TemplateManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.templates = {
            creative: {
                name: 'Creative Portfolio',
                description: 'Bold and creative design for artists and designers',
                thumbnail: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Creative',
                sections: ['hero', 'about', 'projects', 'skills', 'testimonials', 'contact'],
                theme: {
                    primary: '#7c3aed',
                    secondary: '#5b21b6',
                    font: 'Poppins',
                    layout: 'full',
                    animations: true
                }
            },
            minimal: {
                name: 'Minimal Portfolio',
                description: 'Clean and minimal design for professionals',
                thumbnail: 'https://via.placeholder.com/300x200/333333/ffffff?text=Minimal',
                sections: ['hero', 'about', 'projects', 'contact'],
                theme: {
                    primary: '#333333',
                    secondary: '#666666',
                    font: 'Montserrat',
                    layout: 'boxed',
                    animations: false
                }
            },
            professional: {
                name: 'Professional Portfolio',
                description: 'Corporate style for business professionals',
                thumbnail: 'https://via.placeholder.com/300x200/059669/ffffff?text=Professional',
                sections: ['hero', 'about', 'experience', 'education', 'skills', 'contact'],
                theme: {
                    primary: '#059669',
                    secondary: '#047857',
                    font: 'Roboto',
                    layout: 'full',
                    animations: true
                }
            },
            developer: {
                name: 'Developer Portfolio',
                description: 'Perfect for showcasing code and projects',
                thumbnail: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=Developer',
                sections: ['hero', 'about', 'projects', 'skills', 'contact'],
                theme: {
                    primary: '#2563eb',
                    secondary: '#1e40af',
                    font: 'Inter',
                    layout: 'full',
                    animations: true
                }
            }
        };
    }

    showTemplateGallery() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'templateModal';
        
        modal.innerHTML = `
            <div class="modal-content template-gallery">
                <div class="modal-header">
                    <h2>Choose a Template</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="templates-grid">
                        ${Object.entries(this.templates).map(([id, template]) => `
                            <div class="template-card" data-template="${id}">
                                <img src="${template.thumbnail}" alt="${template.name}" class="template-thumbnail">
                                <div class="template-info">
                                    <h3>${template.name}</h3>
                                    <p>${template.description}</p>
                                    <div class="template-features">
                                        <span><i class="fas fa-layer-group"></i> ${template.sections.length} sections</span>
                                        <span><i class="fas fa-palette"></i> Customizable</span>
                                    </div>
                                    <button class="btn btn-primary use-template">Use Template</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Use template buttons
        modal.querySelectorAll('.use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.closest('.template-card').dataset.template;
                this.applyTemplate(templateId);
                modal.remove();
            });
        });
    }

    applyTemplate(templateId) {
        const template = this.templates[templateId];
        if (!template) return;

        // Create sections based on template
        const sections = template.sections.map((type, index) => ({
            id: `${type}_${Date.now()}_${index}`,
            type: type,
            title: this.getSectionTitle(type),
            visible: true,
            data: this.getDefaultSectionData(type)
        }));

        // Update state
        this.stateManager.beginBatch();
        this.stateManager.set('portfolio.sections', sections);
        this.stateManager.set('portfolio.theme', template.theme);
        this.stateManager.endBatch();

        this.eventBus.emit('template:applied', templateId);
        this.showNotification(`Template "${template.name}" applied successfully!`, 'success');
    }

    saveAsTemplate(name, description) {
        const portfolio = this.stateManager.get('portfolio');
        const templateId = 'custom_' + Date.now();
        
        const template = {
            name: name,
            description: description,
            thumbnail: 'https://via.placeholder.com/300x200/1db954/ffffff?text=Custom',
            sections: portfolio.sections.map(s => s.type),
            theme: portfolio.theme
        };

        // Save to localStorage
        const savedTemplates = JSON.parse(localStorage.getItem('customTemplates') || '{}');
        savedTemplates[templateId] = template;
        localStorage.setItem('customTemplates', JSON.stringify(savedTemplates));

        this.showNotification('Template saved successfully!', 'success');
        return templateId;
    }

    exportTemplate() {
        const portfolio = this.stateManager.get('portfolio');
        const template = {
            name: 'Exported Portfolio',
            description: 'Custom exported template',
            sections: portfolio.sections.map(s => s.type),
            theme: portfolio.theme,
            data: portfolio.sections // Include actual content
        };

        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importTemplate(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const template = JSON.parse(e.target.result);
                this.applyImportedTemplate(template);
            } catch (error) {
                this.showNotification('Invalid template file', 'error');
            }
        };
        reader.readAsText(file);
    }

    applyImportedTemplate(template) {
        if (template.sections && template.theme) {
            const sections = template.sections.map((type, index) => ({
                id: `${type}_${Date.now()}_${index}`,
                type: type,
                title: this.getSectionTitle(type),
                visible: true,
                data: template.data?.[index] || this.getDefaultSectionData(type)
            }));

            this.stateManager.beginBatch();
            this.stateManager.set('portfolio.sections', sections);
            this.stateManager.set('portfolio.theme', template.theme);
            this.stateManager.endBatch();

            this.showNotification('Template imported successfully!', 'success');
        } else {
            this.showNotification('Invalid template format', 'error');
        }
    }

    getSectionTitle(type) {
        const titles = {
            hero: 'Hero Section',
            about: 'About Me',
            projects: 'Projects',
            skills: 'Skills',
            experience: 'Experience',
            education: 'Education',
            testimonials: 'Testimonials',
            contact: 'Contact'
        };
        return titles[type] || type;
    }

    getDefaultSectionData(type) {
        const defaults = {
            hero: {
                name: '',
                title: '',
                bio: '',
                buttons: [
                    { text: 'Get In Touch', link: '#contact', style: 'primary' },
                    { text: 'View Work', link: '#projects', style: 'secondary' }
                ]
            },
            about: {
                content: '',
                layout: 'left',
                showProgress: false
            },
            projects: {
                projects: []
            },
            skills: {
                skills: [],
                layout: 'bars'
            },
            experience: {
                experiences: []
            },
            education: {
                education: []
            },
            testimonials: {
                testimonials: []
            }
        };
        return defaults[type] || {};
    }

    showNotification(message, type) {
        const event = new CustomEvent('notification', { detail: { message, type } });
        document.dispatchEvent(event);
    }
}