export class TemplateManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.templates = {
            modern: {
                name: 'Modern',
                description: 'Clean and contemporary design with gradient accents',
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                fontFamily: 'Inter'
            },
            creative: {
                name: 'Creative',
                description: 'Bold and artistic design for creative professionals',
                primaryColor: '#ec4899',
                secondaryColor: '#f43f5e',
                fontFamily: 'Poppins'
            },
            minimal: {
                name: 'Minimal',
                description: 'Simple and elegant design focusing on content',
                primaryColor: '#1f2937',
                secondaryColor: '#374151',
                fontFamily: 'Montserrat'
            },
            professional: {
                name: 'Professional',
                description: 'Corporate style for business professionals',
                primaryColor: '#0f172a',
                secondaryColor: '#1e293b',
                fontFamily: 'Roboto'
            }
        };
    }

    applyTemplate(templateId) {
        const template = this.templates[templateId];
        if (template) {
            this.stateManager.set('design.theme', templateId);
            this.stateManager.set('design.primaryColor', template.primaryColor);
            this.stateManager.set('design.secondaryColor', template.secondaryColor);
            this.stateManager.set('design.fontFamily', template.fontFamily);
            
            this.eventBus.emit('state:changed');
            this.eventBus.emit('notification', {
                message: `${template.name} theme applied!`,
                type: 'success'
            });
        }
    }

    getTemplate(templateId) {
        return this.templates[templateId];
    }

    getAllTemplates() {
        return this.templates;
    }
}