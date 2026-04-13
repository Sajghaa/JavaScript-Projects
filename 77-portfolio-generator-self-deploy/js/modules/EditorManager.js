class EditorManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.editorPanel = new EditorPanel(stateManager, eventBus);
        this.projectEditor = new ProjectEditor(stateManager, eventBus);
        this.skillEditor = new SkillEditor(stateManager, eventBus);
        this.themeSelector = new ThemeSelector(stateManager, eventBus);
    }
}

window.EditorManager = EditorManager;