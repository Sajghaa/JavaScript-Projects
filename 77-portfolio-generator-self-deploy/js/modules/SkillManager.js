export class SkillManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.initializeSkills();
        this.setupEventListeners();
    }

    initializeSkills() {
        this.renderSkills();
        this.renderSoftSkills();
        
        document.getElementById('addSkillBtn')?.addEventListener('click', () => {
            this.addSkill();
        });
        
        document.getElementById('addSoftSkillBtn')?.addEventListener('click', () => {
            this.addSoftSkill();
        });
    }

    setupEventListeners() {
        this.stateManager.subscribe('skills', () => {
            this.renderSkills();
            this.eventBus.emit('state:changed');
        });
        
        this.stateManager.subscribe('softSkills', () => {
            this.renderSoftSkills();
            this.eventBus.emit('state:changed');
        });
    }

    renderSkills() {
        const container = document.getElementById('skillsList');
        const skills = this.stateManager.get('skills');
        
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
        document.querySelectorAll('.skill-item').forEach((item, index) => {
            const nameInput = item.querySelector('.skill-name-input');
            const levelSlider = item.querySelector('.skill-level-slider');
            const levelValue = item.querySelector('.skill-level-value');
            const removeBtn = item.querySelector('.remove-skill');
            
            nameInput?.addEventListener('input', (e) => {
                this.updateSkill(index, { name: e.target.value });
            });
            
            levelSlider?.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                levelValue.textContent = `${value}%`;
                this.updateSkill(index, { level: value });
            });
            
            removeBtn?.addEventListener('click', () => {
                this.deleteSkill(index);
            });
        });
    }

    renderSoftSkills() {
        const container = document.getElementById('softSkillsList');
        const softSkills = this.stateManager.get('softSkills');
        
        container.innerHTML = softSkills.map((skill, index) => `
            <div class="soft-skill-item" data-skill-index="${index}">
                <input type="text" value="${this.escapeHtml(skill)}" placeholder="Soft skill">
                <i class="fas fa-times remove-skill"></i>
            </div>
        `).join('');
        
        this.attachSoftSkillEvents();
    }

    attachSoftSkillEvents() {
        document.querySelectorAll('.soft-skill-item').forEach((item, index) => {
            const input = item.querySelector('input');
            const removeBtn = item.querySelector('.remove-skill');
            
            input?.addEventListener('input', (e) => {
                this.updateSoftSkill(index, e.target.value);
            });
            
            removeBtn?.addEventListener('click', () => {
                this.deleteSoftSkill(index);
            });
        });
    }

    addSkill() {
        this.stateManager.addSkill({ name: 'New Skill', level: 50 });
        this.eventBus.emit('notification', {
            message: 'Skill added',
            type: 'success'
        });
    }

    updateSkill(index, updates) {
        this.stateManager.updateSkill(index, updates);
    }

    deleteSkill(index) {
        this.stateManager.deleteSkill(index);
        this.eventBus.emit('notification', {
            message: 'Skill deleted',
            type: 'info'
        });
    }

    addSoftSkill() {
        this.stateManager.addSoftSkill('New Soft Skill');
        this.eventBus.emit('notification', {
            message: 'Soft skill added',
            type: 'success'
        });
    }

    updateSoftSkill(index, value) {
        if (value.trim()) {
            this.stateManager.updateSoftSkill(index, value);
        }
    }

    deleteSoftSkill(index) {
        this.stateManager.deleteSoftSkill(index);
        this.eventBus.emit('notification', {
            message: 'Soft skill deleted',
            type: 'info'
        });
    }

    loadSkills() {
        this.renderSkills();
        this.renderSoftSkills();
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