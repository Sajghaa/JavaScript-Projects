class FilePreview {
    constructor(stateManager, eventBus) { this.stateManager = stateManager; this.eventBus = eventBus; }

    render(file, fileData) {
        const size = (file.size / 1024 / 1024).toFixed(2);
        return `
            <div class="preview-container">
                ${this.getMediaPreview(file, fileData)}
                <div class="preview-info">
                    <h3>${file.name}</h3>
                    <div class="preview-meta">
                        <div class="meta-item"><span class="meta-label">Size:</span> ${size} MB</div>
                        <div class="meta-item"><span class="meta-label">Type:</span> ${file.type}</div>
                        <div class="meta-item"><span class="meta-label">Uploaded:</span> ${new Date(file.uploadDate).toLocaleString()}</div>
                        <div class="meta-item"><span class="meta-label">Category:</span> ${file.category || 'Uncategorized'}</div>
                    </div>
                    ${file.description ? `<p><strong>Description:</strong> ${file.description}</p>` : ''}
                    ${file.tags && file.tags.length ? `<p><strong>Tags:</strong> ${file.tags.join(', ')}</p>` : ''}
                </div>
            </div>
        `;
    }

    getMediaPreview(file, data) {
        if(file.typeCategory === 'image') return `<img src="${data}" alt="${file.name}" class="preview-media">`;
        if(file.typeCategory === 'video') return `<video controls class="preview-media"><source src="${data}" type="${file.type}"></video>`;
        if(file.typeCategory === 'audio') return `<audio controls class="preview-media"><source src="${data}" type="${file.type}"></audio>`;
        return `<div class="preview-media file-icon"><i class="fas fa-file-alt" style="font-size:5rem;"></i></div>`;
    }
}
window.FilePreview = FilePreview;