export class SectionManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.sections = new Map();
        
        this.initializeSections();
        this.setupEventListeners();
    }

    initializeSections() {
        // Import all section components
        this.sections.set('hero', HeroSection);
        this.sections.set('about', AboutSection);
        this.sections.set('projects', ProjectsSection);
        this.sections.set('skills', SkillsSection);
        this.sections.set('experience', ExperienceSection);
        this.sections.set('education', EducationSection);
        this.sections.set('testimonials', TestimonialsSection);
        this.sections.set('contact', ContactSection);
    }

    setupEventListeners() {
        // Listen for section drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            if (type) {
                this.addSection(type);
            }
        });

        // Section reordering
        const activeSections = document.getElementById('activeSectionsList');
        new Sortable(activeSections, {
            animation: 150,
            onEnd: (evt) => {
                this.reorderSections(evt.oldIndex, evt.newIndex);
            }
        });
    }

    addSection(type) {
        const SectionClass = this.sections.get(type);
        if (!SectionClass) return;

        const section = new SectionClass(this.stateManager, this.eventBus);
        const sectionData = section.getDefaultData();
        
        const sections = this.stateManager.get('portfolio.sections');
        sections.push({
            ...sectionData,
            id: `${type}_${Date.now()}`,
            type
        });
        
        this.stateManager.set('portfolio.sections', sections);
        this.eventBus.emit('section:added', sectionData);
        this.renderActiveSections();
    }

    removeSection(sectionId) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        const filtered = sections.filter(s => s.id !== sectionId);
        
        this.stateManager.set('portfolio.sections', filtered);
        this.eventBus.emit('section:removed', section);
        this.renderActiveSections();
    }

    reorderSections(oldIndex, newIndex) {
        const sections = [...this.stateManager.get('portfolio.sections')];
        const [moved] = sections.splice(oldIndex, 1);
        sections.splice(newIndex, 0, moved);
        
        this.stateManager.set('portfolio.sections', sections);
        this.eventBus.emit('section:reordered', { oldIndex, newIndex });
    }

    duplicateSection(sectionId) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        
        if (section) {
            const duplicate = {
                ...section,
                id: `${section.type}_${Date.now()}`,
                title: `${section.title} (Copy)`
            };
            
            sections.push(duplicate);
            this.stateManager.set('portfolio.sections', sections);
            this.eventBus.emit('section:duplicated', duplicate);
            this.renderActiveSections();
        }
    }

    toggleSectionVisibility(sectionId) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        
        if (section) {
            section.visible = !section.visible;
            this.stateManager.set('portfolio.sections', sections);
            this.eventBus.emit('section:visibilityChanged', section);
        }
    }

    selectSection(sectionId) {
        this.stateManager.set('ui.activeSection', sectionId);
        this.renderActiveSections();
        this.loadSectionEditor(sectionId);
    }

    renderActiveSections() {
        const container = document.getElementById('activeSectionsList');
        const sections = this.stateManager.get('portfolio.sections');
        const activeId = this.stateManager.get('ui.activeSection');
        
        container.innerHTML = sections.map(section => `
            <div class="active-section-item ${section.id === activeId ? 'active' : ''}" 
                 data-id="${section.id}">
                <i class="fas fa-${this.getSectionIcon(section.type)}"></i>
                <div class="section-info">
                    <div class="section-name">${section.title || this.getSectionTitle(section.type)}</div>
                    <div class="section-status">
                        <i class="fas fa-${section.visible ? 'eye' : 'eye-slash'}"></i>
                        ${section.visible ? 'Visible' : 'Hidden'}
                    </div>
                </div>
                <div class="section-actions">
                    <button onclick="app.sectionManager.toggleSectionVisibility('${section.id}')">
                        <i class="fas fa-${section.visible ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button onclick="app.sectionManager.duplicateSection('${section.id}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="app.sectionManager.removeSection('${section.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add click handlers for section selection
        container.querySelectorAll('.active-section-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (!e.target.closest('.section-actions')) {
                    this.selectSection(el.dataset.id);
                }
            });
        });
    }

    loadSectionEditor(sectionId) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        
        if (section) {
            const SectionClass = this.sections.get(section.type);
            if (SectionClass) {
                const editor = new SectionClass(this.stateManager, this.eventBus);
                editor.renderEditor(sectionId);
            }
        }
    }

    getSectionIcon(type) {
        const icons = {
            hero: 'user',
            about: 'info-circle',
            projects: 'code-branch',
            skills: 'chart-bar',
            experience: 'briefcase',
            education: 'graduation-cap',
            testimonials: 'quote-right',
            contact: 'envelope'
        };
        return icons[type] || 'layer-group';
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
}