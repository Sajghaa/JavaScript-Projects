class SkillEditor {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.init();
    }

    init() {
        this.renderSkills();
        this.renderSoftSkills();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add skill button
        const addSkillBtn = document.getElementById('addSkillBtn');
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => this.addSkill());
        }
        
        // Add soft skill button
        const addSoftSkillBtn = document.getElementById('addSoftSkillBtn');
        if (addSoftSkillBtn) {
            addSoftSkillBtn.addEventListener('click', () => this.addSoftSkill());
        }
        
        // Listen for state changes
        document.addEventListener('stateChanged', (e) => {
            if (e.detail.path === 'skills') {
                this.renderSkills();
            }
            if (e.detail.path === 'softSkills') {
                this.renderSoftSkills();
            }
        });
    }

    renderSkills() {
        const container = document.getElementById('skillsList');
        const skills = this.stateManager.get('skills');
        
        if (!container) return;
        
        container.innerHTML = skills.map((skill, index) => `
            <div class="skill-item" data-skill-index="${index}">
                <input type="text" class="skill-name-input" value="${this.escapeHtml(skill.name)}" placeholder="Skill name">
                <div class="skill-level">
                    <input type="range" class="skill-level-slider" min="0" max="100" value="${skill.level}">
                    <span class="skill-level-value">${skill.level}%</span>
                </div>
                <i class="fas fa-times remove-skill"></i>
            </div>
        `).join('');
        
        this.attachSkillEvents();
    }

    attachSkillEvents() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            const index = parseInt(item.dataset.skillIndex);
            const nameInput = item.querySelector('.skill-name-input');
            const levelSlider = item.querySelector('.skill-level-slider');
            const levelValue = item.querySelector('.skill-level-value');
            const removeBtn = item.querySelector('.remove-skill');
            
            if (nameInput) {
                nameInput.addEventListener('input', (e) => {
                    this.updateSkill(index, { name: e.target.value });
                });
            }
            
            if (levelSlider) {
                levelSlider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    levelValue.textContent = `${value}%`;
                    this.updateSkill(index, { level: value });
                });
            }
            
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.deleteSkill(index);
                });
            }
        });
    }

    renderSoftSkills() {
        const container = document.getElementById('softSkillsList');
        const softSkills = this.stateManager.get('softSkills');
        
        if (!container) return;
        
        container.innerHTML = softSkills.map((skill, index) => `
            <div class="soft-skill-item" data-skill-index="${index}">
                <input type="text" value="${this.escapeHtml(skill)}" placeholder="Soft skill">
                <i class="fas fa-times remove-skill"></i>
            </div>
        `).join('');
        
        this.attachSoftSkillEvents();
    }

    attachSoftSkillEvents() {
        const softSkillItems = document.querySelectorAll('.soft-skill-item');
        
        softSkillItems.forEach(item => {
            const index = parseInt(item.dataset.skillIndex);
            const input = item.querySelector('input');
            const removeBtn = item.querySelector('.remove-skill');
            
            if (input) {
                input.addEventListener('input', (e) => {
                    this.updateSoftSkill(index, e.target.value);
                });
            }
            
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.deleteSoftSkill(index);
                });
            }
        });
    }

    addSkill() {
        this.stateManager.addSkill({ name: 'New Skill', level: 50 });
        this.showToast('Skill added', 'success');
    }

    updateSkill(index, updates) {
        this.stateManager.updateSkill(index, updates);
    }

    deleteSkill(index) {
        this.stateManager.deleteSkill(index);
        this.showToast('Skill deleted', 'info');
    }

    addSoftSkill() {
        this.stateManager.addSoftSkill('New Soft Skill');
        this.showToast('Soft skill added', 'success');
    }

    updateSoftSkill(index, value) {
        if (value.trim()) {
            this.stateManager.updateSoftSkill(index, value);
        }
    }

    deleteSoftSkill(index) {
        this.stateManager.deleteSoftSkill(index);
        this.showToast('Soft skill deleted', 'info');
    }

    showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
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

window.SkillEditor = SkillEditor;