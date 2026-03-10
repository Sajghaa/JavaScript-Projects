export class HeroSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'hero',
            title: 'Hero Section',
            visible: true,
            data: {
                name: '',
                title: '',
                bio: '',
                image: null,
                buttons: [
                    { text: 'Get In Touch', link: '#contact' },
                    { text: 'View Projects', link: '#projects' }
                ]
            }
        };
    }

    renderEditor(sectionId) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        const data = section.data || {};

        const editor = document.getElementById('contentEditor');
        editor.innerHTML = `
            <div class="editor-section">
                <h4>Hero Section Settings</h4>
                
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" id="heroName" value="${data.name || ''}" 
                           placeholder="John Doe">
                </div>
                
                <div class="form-group">
                    <label>Professional Title</label>
                    <input type="text" id="heroTitle" value="${data.title || ''}" 
                           placeholder="Full Stack Developer">
                </div>
                
                <div class="form-group">
                    <label>Bio</label>
                    <textarea id="heroBio" rows="4" 
                              placeholder="Tell your story...">${data.bio || ''}</textarea>
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
                
                <h4>Call to Action Buttons</h4>
                
                <div id="buttonsContainer">
                    ${(data.buttons || []).map((btn, index) => `
                        <div class="button-item" data-index="${index}">
                            <input type="text" class="btn-text" value="${btn.text}" 
                                   placeholder="Button text">
                            <input type="text" class="btn-link" value="${btn.link}" 
                                   placeholder="Button link">
                            <button class="remove-btn" onclick="this.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <button id="addButton" class="add-skill-btn">
                    <i class="fas fa-plus"></i> Add Button
                </button>
            </div>
        `;

        // Add event listeners
        document.getElementById('heroName').addEventListener('input', (e) => {
            this.updateSectionData(sectionId, 'name', e.target.value);
        });

        document.getElementById('heroTitle').addEventListener('input', (e) => {
            this.updateSectionData(sectionId, 'title', e.target.value);
        });

        document.getElementById('heroBio').addEventListener('input', (e) => {
            this.updateSectionData(sectionId, 'bio', e.target.value);
        });

        document.getElementById('addButton').addEventListener('click', () => {
            const buttons = [...(data.buttons || []), { text: 'New Button', link: '#' }];
            this.updateSectionData(sectionId, 'buttons', buttons);
            this.renderEditor(sectionId);
        });

        // Image upload handling
        const upload = document.querySelector('#heroImageUpload input');
        upload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.updateSectionData(sectionId, 'image', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateSectionData(sectionId, key, value) {
        const sections = this.stateManager.get('portfolio.sections');
        const section = sections.find(s => s.id === sectionId);
        
        if (section) {
            if (!section.data) section.data = {};
            section.data[key] = value;
            this.stateManager.set('portfolio.sections', sections);
        }
    }
}