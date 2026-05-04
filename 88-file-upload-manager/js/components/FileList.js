class FileList {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.fileCard = new FileCard(stateManager, eventBus);
    }

    render(files, selectedIds) {
        if(files.length === 0) return '';
        return files.map(file => this.fileCard.render(file, selectedIds.includes(file.id))).join('');
    }
}
window.FileList = FileList;