export class EditorManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.activeSectionId = null;
        this.activeElementId = null;
        
        this.initializeEditor();
        this.setupEventListeners();
    }

    initializeEditor() {
        this.editorContainer = document.getElementById('contentEditor');
        this.propertiesPanel = document.getElementById('propertiesPanel');
    }

    setupEventListeners() {
        // Listen for section selection
        this.eventBus.on('section:selected', (sectionId) => {
            this.loadSectionEditor(sectionId);
        });

        // Listen for element selection
        this.eventBus.on('element:selected', (elementId) => {
            this.loadElementProperties(elementId);
        });

        // Keyboard shortcuts for editor
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        this.formatText('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.formatText('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.formatText('underline');
                        break;
                }
            }
        });
    }

    loadSectionEditor(sectionId) {
        this.activeSectionId = sectionId;
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        
        if (!section) return;

        // Clear properties panel
        this.propertiesPanel.innerHTML = '';

        // Load appropriate editor based on section type
        switch(section.type) {
            case 'hero':
                this.renderHeroEditor(section);
                break;
            case 'about':
                this.renderAboutEditor(section);
                break;
            case 'projects':
                this.renderProjectsEditor(section);
                break;
            case 'skills':
                this.renderSkillsEditor(section);
                break;
            case 'experience':
                this.renderExperienceEditor(section);
                break;
            case 'education':
                this.renderEducationEditor(section);
                break;
            case 'testimonials':
                this.renderTestimonialsEditor(section);
                break;
            case 'contact':
                this.renderContactEditor(section);
                break;
            default:
                this.renderGenericEditor(section);
        }

        this.eventBus.emit('editor:loaded', sectionId);
    }

    renderHeroEditor(section) {
        const data = section.data || {};
        
        this.editorContainer.innerHTML = `
            <div class="editor-section">
                <h3 class="editor-title">Hero Section</h3>
                
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="heroName" class="property-input" 
                           value="${data.name || this.stateManager.get('portfolio.personal.name') || ''}">
                </div>

                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="heroTitle" class="property-input" 
                           value="${data.title || this.stateManager.get('portfolio.personal.title') || ''}">
                </div>

                <div class="form-group">
                    <label>Bio</label>
                    <textarea id="heroBio" class="property-input" rows="4">${data.bio || this.stateManager.get('portfolio.personal.bio') || ''}</textarea>
                </div>

                <div class="form-group">
                    <label>Profile Image</label>
                    <div class="image-upload" id="heroImageUpload">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click or drag to upload</p>
                        <input type="file" accept="image/*">
                    </div>
                    ${data.image ? `<img src="${data.image}" class="image-preview">` : ''}
                </div>

                <div class="form-group">
                    <label>Background Style</label>
                    <select id="heroBackground" class="property-input">
                        <option value="light" ${data.background === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${data.background === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="gradient" ${data.background === 'gradient' ? 'selected' : ''}>Gradient</option>
                        <option value="image" ${data.background === 'image' ? 'selected' : ''}>Image</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Text Alignment</label>
                    <div class="alignment-buttons">
                        <button class="align-btn ${data.alignment === 'left' ? 'active' : ''}" data-align="left">
                            <i class="fas fa-align-left"></i>
                        </button>
                        <button class="align-btn ${data.alignment === 'center' ? 'active' : ''}" data-align="center">
                            <i class="fas fa-align-center"></i>
                        </button>
                        <button class="align-btn ${data.alignment === 'right' ? 'active' : ''}" data-align="right">
                            <i class="fas fa-align-right"></i>
                        </button>
                    </div>
                </div>

                <h4>Call to Action Buttons</h4>
                <div id="buttonsContainer" class="buttons-editor">
                    ${(data.buttons || [
                        { text: 'Get In Touch', link: '#contact' },
                        { text: 'View Work', link: '#projects' }
                    ]).map((btn, index) => `
                        <div class="button-item" data-index="${index}">
                            <input type="text" class="btn-text property-input" value="${btn.text}" placeholder="Button text">
                            <input type="text" class="btn-link property-input" value="${btn.link}" placeholder="Button link">
                            <select class="btn-style property-input">
                                <option value="primary" ${btn.style === 'primary' ? 'selected' : ''}>Primary</option>
                                <option value="secondary" ${btn.style === 'secondary' ? 'selected' : ''}>Secondary</option>
                                <option value="outline" ${btn.style === 'outline' ? 'selected' : ''}>Outline</option>
                            </select>
                            <button class="remove-btn" onclick="this.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>

                <button id="addButton" class="btn-add">
                    <i class="fas fa-plus"></i> Add Button
                </button>
            </div>
        `;

        // Add event listeners
        this.addHeroEventListeners(section.id);
    }

    addHeroEventListeners(sectionId) {
        const fields = ['name', 'title', 'bio', 'background'];
        fields.forEach(field => {
            const element = document.getElementById(`hero${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.updateSectionData(sectionId, field, e.target.value);
                });
            }
        });

        // Alignment buttons
        document.querySelectorAll('.align-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateSectionData(sectionId, 'alignment', btn.dataset.align);
            });
        });

        // Add button
        const addButton = document.getElementById('addButton');
        if (addButton) {
            addButton.addEventListener('click', () => {
                const sections = this.stateManager.get('portfolio.sections');
                const section = sections.find(s => s.id === sectionId);
                if (!section.data) section.data = {};
                if (!section.data.buttons) section.data.buttons = [];
                
                section.data.buttons.push({ text: 'New Button', link: '#', style: 'primary' });
                this.stateManager.set('portfolio.sections', sections);
                this.loadSectionEditor(sectionId);
            });
        }

        // Image upload
        const upload = document.querySelector('#heroImageUpload input');
        if (upload) {
            upload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.updateSectionData(sectionId, 'image', e.target.result);
                        this.loadSectionEditor(sectionId);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Button inputs
        document.querySelectorAll('.button-item input, .button-item select').forEach((input, index) => {
            input.addEventListener('input', (e) => {
                this.updateButtonData(sectionId, index, e.target.className.includes('text') ? 'text' : 'link', e.target.value);
            });
        });
    }

    renderAboutEditor(section) {
        const data = section.data || {};
        
        this.editorContainer.innerHTML = `
            <div class="editor-section">
                <h3 class="editor-title">About Section</h3>
                
                <div class="form-group">
                    <label>Section Title</label>
                    <input type="text" id="aboutTitle" class="property-input" 
                           value="${data.title || 'About Me'}">
                </div>

                <div class="form-group">
                    <label>Content</label>
                    <div class="rich-editor">
                        <div class="editor-toolbar">
                            <button class="toolbar-btn" data-command="bold"><i class="fas fa-bold"></i></button>
                            <button class="toolbar-btn" data-command="italic"><i class="fas fa-italic"></i></button>
                            <button class="toolbar-btn" data-command="underline"><i class="fas fa-underline"></i></button>
                            <button class="toolbar-btn" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
                            <button class="toolbar-btn" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
                            <button class="toolbar-btn" data-command="createLink"><i class="fas fa-link"></i></button>
                        </div>
                        <div id="aboutContent" class="editor-content" contenteditable="true">
                            ${data.content || ''}
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Profile Image</label>
                    <div class="image-upload" id="aboutImageUpload">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click or drag to upload</p>
                        <input type="file" accept="image/*">
                    </div>
                    ${data.image ? `<img src="${data.image}" class="image-preview">` : ''}
                </div>

                <div class="form-group">
                    <label>Layout</label>
                    <select id="aboutLayout" class="property-input">
                        <option value="left" ${data.layout === 'left' ? 'selected' : ''}>Image Left, Text Right</option>
                        <option value="right" ${data.layout === 'right' ? 'selected' : ''}>Image Right, Text Left</option>
                        <option value="top" ${data.layout === 'top' ? 'selected' : ''}>Image Top, Text Bottom</option>
                        <option value="full" ${data.layout === 'full' ? 'selected' : ''}>Text Only</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Show Progress Bars</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="aboutProgress" ${data.showProgress ? 'checked' : ''}>
                        <label for="aboutProgress"></label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Download CV Button</label>
                    <input type="text" id="aboutCV" class="property-input" 
                           value="${data.cvLink || ''}" placeholder="Link to CV file">
                </div>
            </div>
        `;

        this.addAboutEventListeners(section.id);
    }

    addAboutEventListeners(sectionId) {
        // Title input
        const titleInput = document.getElementById('aboutTitle');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.updateSectionData(sectionId, 'title', e.target.value);
            });
        }

        // Rich text editor
        const editor = document.getElementById('aboutContent');
        if (editor) {
            editor.addEventListener('input', (e) => {
                this.updateSectionData(sectionId, 'content', e.target.innerHTML);
            });

            // Toolbar buttons
            document.querySelectorAll('[data-command]').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.execCommand(btn.dataset.command, false, null);
                    editor.focus();
                });
            });
        }

        // Layout select
        const layoutSelect = document.getElementById('aboutLayout');
        if (layoutSelect) {
            layoutSelect.addEventListener('change', (e) => {
                this.updateSectionData(sectionId, 'layout', e.target.value);
            });
        }

        // Progress toggle
        const progressToggle = document.getElementById('aboutProgress');
        if (progressToggle) {
            progressToggle.addEventListener('change', (e) => {
                this.updateSectionData(sectionId, 'showProgress', e.target.checked);
            });
        }

        // CV input
        const cvInput = document.getElementById('aboutCV');
        if (cvInput) {
            cvInput.addEventListener('input', (e) => {
                this.updateSectionData(sectionId, 'cvLink', e.target.value);
            });
        }

        // Image upload
        const upload = document.querySelector('#aboutImageUpload input');
        if (upload) {
            upload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.updateSectionData(sectionId, 'image', e.target.result);
                        this.loadSectionEditor(sectionId);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    renderProjectsEditor(section) {
        const data = section.data || {};
        const projects = data.projects || [
            { title: 'Project 1', description: 'Description here', image: '', tags: [], link: '' }
        ];

        this.editorContainer.innerHTML = `
            <div class="editor-section">
                <h3 class="editor-title">Projects Section</h3>
                
                <div class="form-group">
                    <label>Section Title</label>
                    <input type="text" id="projectsTitle" class="property-input" 
                           value="${data.title || 'My Projects'}">
                </div>

                <div class="form-group">
                    <label>Layout Style</label>
                    <select id="projectsLayout" class="property-input">
                        <option value="grid" ${data.layout === 'grid' ? 'selected' : ''}>Grid</option>
                        <option value="masonry" ${data.layout === 'masonry' ? 'selected' : ''}>Masonry</option>
                        <option value="carousel" ${data.layout === 'carousel' ? 'selected' : ''}>Carousel</option>
                    </select>
                </div>

                <h4>Projects</h4>
                <div id="projectsList" class="projects-list">
                    ${projects.map((project, index) => `
                        <div class="project-editor-item" data-index="${index}">
                            <div class="project-header">
                                <input type="text" class="project-title-input property-input" 
                                       value="${project.title}" placeholder="Project Title">
                                <button class="remove-project" onclick="this.closest('.project-editor-item').remove()">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="project-description property-input" rows="3">${project.description || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Project Image</label>
                                <div class="image-upload project-image-upload">
                                    <input type="file" accept="image/*" data-index="${index}">
                                    ${project.image ? `<img src="${project.image}" class="image-preview">` : ''}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Project URL</label>
                                <input type="url" class="project-link property-input" value="${project.link || ''}" placeholder="https://...">
                            </div>
                            
                            <div class="form-group">
                                <label>Technologies</label>
                                <div class="tags-input">
                                    <input type="text" class="tag-input property-input" placeholder="Add a tag and press Enter">
                                    <div class="tags-list">
                                        ${(project.tags || []).map(tag => `
                                            <span class="project-tag">
                                                ${tag}
                                                <i class="fas fa-times" onclick="this.parentElement.remove()"></i>
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button id="addProject" class="btn-add">
                    <i class="fas fa-plus"></i> Add Project
                </button>
            </div>
        `;

        this.addProjectsEventListeners(section.id);
    }

    addProjectsEventListeners(sectionId) {
        const titleInput = document.getElementById('projectsTitle');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.updateSectionData(sectionId, 'title', e.target.value);
            });
        }

        const layoutSelect = document.getElementById('projectsLayout');
        if (layoutSelect) {
            layoutSelect.addEventListener('change', (e) => {
                this.updateSectionData(sectionId, 'layout', e.target.value);
            });
        }

        document.getElementById('addProject').addEventListener('click', () => {
            const sections = this.stateManager.get('portfolio.sections');
            const section = sections.find(s => s.id === sectionId);
            if (!section.data) section.data = {};
            if (!section.data.projects) section.data.projects = [];
            
            section.data.projects.push({
                title: 'New Project',
                description: '',
                image: '',
                tags: [],
                link: ''
            });
            
            this.stateManager.set('portfolio.sections', sections);
            this.loadSectionEditor(sectionId);
        });

        // Project inputs
        document.querySelectorAll('.project-editor-item').forEach((item, index) => {
            // Title
            const titleInput = item.querySelector('.project-title-input');
            titleInput?.addEventListener('input', (e) => {
                this.updateProjectData(sectionId, index, 'title', e.target.value);
            });

            // Description
            const descInput = item.querySelector('.project-description');
            descInput?.addEventListener('input', (e) => {
                this.updateProjectData(sectionId, index, 'description', e.target.value);
            });

            // Link
            const linkInput = item.querySelector('.project-link');
            linkInput?.addEventListener('input', (e) => {
                this.updateProjectData(sectionId, index, 'link', e.target.value);
            });

            // Image upload
            const imageUpload = item.querySelector('.project-image-upload input');
            imageUpload?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.updateProjectData(sectionId, index, 'image', e.target.result);
                        this.loadSectionEditor(sectionId);
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Tags
            const tagInput = item.querySelector('.tag-input');
            const tagsList = item.querySelector('.tags-list');
            
            tagInput?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tag = e.target.value.trim();
                    if (tag) {
                        this.addProjectTag(sectionId, index, tag);
                        e.target.value = '';
                    }
                }
            });
        });
    }

    renderSkillsEditor(section) {
        const data = section.data || {};
        const skills = data.skills || [
            { name: 'JavaScript', level: 90 },
            { name: 'React', level: 85 },
            { name: 'Node.js', level: 80 }
        ];

        this.editorContainer.innerHTML = `
            <div class="editor-section">
                <h3 class="editor-title">Skills Section</h3>
                
                <div class="form-group">
                    <label>Section Title</label>
                    <input type="text" id="skillsTitle" class="property-input" 
                           value="${data.title || 'My Skills'}">
                </div>

                <div class="form-group">
                    <label>Layout Style</label>
                    <select id="skillsLayout" class="property-input">
                        <option value="bars" ${data.layout === 'bars' ? 'selected' : ''}>Progress Bars</option>
                        <option value="circles" ${data.layout === 'circles' ? 'selected' : ''}>Circular Progress</option>
                        <option value="tags" ${data.layout === 'tags' ? 'selected' : ''}>Tags</option>
                        <option value="grid" ${data.layout === 'grid' ? 'selected' : ''}>Grid</option>
                    </select>
                </div>

                <h4>Skills</h4>
                <div id="skillsList" class="skills-editor">
                    ${skills.map((skill, index) => `
                        <div class="skill-item" data-index="${index}">
                            <div class="skill-header">
                                <input type="text" class="skill-name property-input" 
                                       value="${skill.name}" placeholder="Skill name">
                                <button class="remove-skill" onclick="this.closest('.skill-item').remove()">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="skill-level">
                                <input type="range" class="skill-range" min="0" max="100" value="${skill.level}">
                                <span class="skill-percentage">${skill.level}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button id="addSkill" class="btn-add">
                    <i class="fas fa-plus"></i> Add Skill
                </button>

                <div class="form-group">
                    <label>Show Skill Categories</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="skillCategories" ${data.showCategories ? 'checked' : ''}>
                        <label for="skillCategories"></label>
                    </div>
                </div>
            </div>
        `;

        this.addSkillsEventListeners(section.id);
    }

    addSkillsEventListeners(sectionId) {
        const titleInput = document.getElementById('skillsTitle');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.updateSectionData(sectionId, 'title', e.target.value);
            });
        }

        const layoutSelect = document.getElementById('skillsLayout');
        if (layoutSelect) {
            layoutSelect.addEventListener('change', (e) => {
                this.updateSectionData(sectionId, 'layout', e.target.value);
            });
        }

        document.getElementById('addSkill').addEventListener('click', () => {
            const sections = this.stateManager.get('portfolio.sections');
            const section = sections.find(s => s.id === sectionId);
            if (!section.data) section.data = {};
            if (!section.data.skills) section.data.skills = [];
            
            section.data.skills.push({ name: 'New Skill', level: 50 });
            this.stateManager.set('portfolio.sections', sections);
            this.loadSectionEditor(sectionId);
        });

        // Skill inputs
        document.querySelectorAll('.skill-item').forEach((item, index) => {
            const nameInput = item.querySelector('.skill-name');
            nameInput?.addEventListener('input', (e) => {
                this.updateSkillData(sectionId, index, 'name', e.target.value);
            });

            const rangeInput = item.querySelector('.skill-range');
            const percentageSpan = item.querySelector('.skill-percentage');
            
            rangeInput?.addEventListener('input', (e) => {
                percentageSpan.textContent = e.target.value + '%';
                this.updateSkillData(sectionId, index, 'level', parseInt(e.target.value));
            });
        });

        const categoriesToggle = document.getElementById('skillCategories');
        if (categoriesToggle) {
            categoriesToggle.addEventListener('change', (e) => {
                this.updateSectionData(sectionId, 'showCategories', e.target.checked);
            });
        }
    }

    // Helper methods for updating data
    updateSectionData(sectionId, key, value) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        if (section) {
            if (!section.data) section.data = {};
            section.data[key] = value;
            this.stateManager.set('portfolio.sections', sections);
        }
    }

    updateButtonData(sectionId, buttonIndex, key, value) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        if (section && section.data && section.data.buttons) {
            section.data.buttons[buttonIndex][key] = value;
            this.stateManager.set('portfolio.sections', sections);
        }
    }

    updateProjectData(sectionId, projectIndex, key, value) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        if (section && section.data && section.data.projects) {
            section.data.projects[projectIndex][key] = value;
            this.stateManager.set('portfolio.sections', sections);
        }
    }

    updateSkillData(sectionId, skillIndex, key, value) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        if (section && section.data && section.data.skills) {
            section.data.skills[skillIndex][key] = value;
            this.stateManager.set('portfolio.sections', sections);
        }
    }

    addProjectTag(sectionId, projectIndex, tag) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        if (section && section.data && section.data.projects) {
            if (!section.data.projects[projectIndex].tags) {
                section.data.projects[projectIndex].tags = [];
            }
            section.data.projects[projectIndex].tags.push(tag);
            this.stateManager.set('portfolio.sections', sections);
            this.loadSectionEditor(sectionId);
        }
    }

    loadElementProperties(elementId) {
        // Load properties for selected element (for fine-tuning)
        this.propertiesPanel.innerHTML = `
            <div class="property-group">
                <h4>Element Properties</h4>
                <div class="property-row">
                    <label>ID</label>
                    <input type="text" class="property-input" value="${elementId}" readonly>
                </div>
                <div class="property-row">
                    <label>Classes</label>
                    <input type="text" class="property-input" id="elementClasses">
                </div>
                <div class="property-row">
                    <label>Margin</label>
                    <input type="text" class="property-input" id="elementMargin" placeholder="0px">
                </div>
                <div class="property-row">
                    <label>Padding</label>
                    <input type="text" class="property-input" id="elementPadding" placeholder="0px">
                </div>
                <div class="property-row">
                    <label>Background Color</label>
                    <div class="color-input-group">
                        <input type="color" id="elementBgColor" class="color-input">
                        <input type="text" class="property-input" id="elementBgColorHex" placeholder="#ffffff">
                    </div>
                </div>
            </div>
        `;
    }

    renderGenericEditor(section) {
        this.editorContainer.innerHTML = `
            <div class="editor-section">
                <h3 class="editor-title">${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</h3>
                <div class="form-group">
                    <label>Section Title</label>
                    <input type="text" id="genericTitle" class="property-input" 
                           value="${section.title || ''}">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea id="genericContent" class="property-input" rows="6">${section.data?.content || ''}</textarea>
                </div>
            </div>
        `;

        const titleInput = document.getElementById('genericTitle');
        titleInput?.addEventListener('input', (e) => {
            this.updateSectionData(section.id, 'title', e.target.value);
        });

        const contentInput = document.getElementById('genericContent');
        contentInput?.addEventListener('input', (e) => {
            this.updateSectionData(section.id, 'content', e.target.value);
        });
    }
}