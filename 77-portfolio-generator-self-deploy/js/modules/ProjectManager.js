class ProjectManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.projectEditor = new ProjectEditor(stateManager, eventBus);
    }
}

window.ProjectManager = ProjectManager;