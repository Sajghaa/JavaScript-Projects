class SkillManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.skillEditor = new SkillEditor(stateManager, eventBus);
    }
}

window.SkillManager = SkillManager;