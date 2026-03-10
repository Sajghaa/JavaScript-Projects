export class ExportManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    async export(format) {
        this.eventBus.emit('export:started', format);
        
        try {
            switch(format) {
                case 'html':
                    await this.exportHTML();
                    break;
                case 'pdf':
                    await this.exportPDF();
                    break;
                case 'json':
                    await this.exportJSON();
                    break;
                case 'github':
                    await this.exportToGithub();
                    break;
                default:
                    throw new Error(`Unknown format: ${format}`);
            }
            
            this.eventBus.emit('export:completed', format);
        } catch (error) {
            this.eventBus.emit('export:error', error.message);
        }
    }

    async exportHTML() {
        const portfolio = this.stateManager.get('portfolio');
        const preview = document.getElementById('previewFrame');
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.personal.name} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=${portfolio.theme.font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        ${preview.contentDocument.querySelector('style').innerHTML}
    </style>
</head>
<body>
    ${preview.contentDocument.body.innerHTML}
</body>
</html>
        `;
        
        this.downloadFile(html, 'portfolio.html', 'text/html');
    }

    async exportPDF() {
        // In production, use a library like jsPDF or html2canvas
        this.eventBus.emit('export:error', 'PDF export requires additional library');
    }

    async exportJSON() {
        const data = this.stateManager.exportData();
        this.downloadFile(data, 'portfolio.json', 'application/json');
    }

    async exportToGithub() {
        // In production, implement GitHub API integration
        this.eventBus.emit('export:error', 'GitHub Pages publishing requires API integration');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}