class DeploymentManager {
    constructor(stateManager, eventBus, previewManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.previewManager = previewManager;
        this.deploymentModal = new DeploymentModal(stateManager, eventBus);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('deploy:show', () => this.deploymentModal.show());
        this.eventBus.on('deploy:method', (method) => this.deploy(method));
    }

    deploy(method) {
        switch(method) {
            case 'download':
                this.deployDownload();
                break;
            case 'github':
                this.deployGitHub();
                break;
            case 'netlify':
                this.deployNetlify();
                break;
            case 'vercel':
                this.deployVercel();
                break;
        }
    }

    deployDownload() {
        const previewFrame = document.getElementById('previewFrame');
        const html = previewFrame.contentDocument.documentElement.outerHTML;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${this.stateManager.get('personal.name').toLowerCase().replace(/\s+/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.eventBus.emit('notification', {
            message: 'Portfolio downloaded! You can now host it anywhere.',
            type: 'success'
        });
    }

    deployGitHub() {
        this.eventBus.emit('notification', {
            message: 'Opening GitHub Pages setup guide...',
            type: 'info'
        });
        
        setTimeout(() => {
            window.open('https://github.com/new', '_blank');
            this.eventBus.emit('notification', {
                message: 'Create a new repository and upload your portfolio files',
                type: 'info'
            });
        }, 1000);
    }

    deployNetlify() {
        this.eventBus.emit('notification', {
            message: 'Preparing for Netlify Drop deployment...',
            type: 'info'
        });
        
        const previewFrame = document.getElementById('previewFrame');
        const html = previewFrame.contentDocument.documentElement.outerHTML;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
            window.open('https://app.netlify.com/drop', '_blank');
            this.eventBus.emit('notification', {
                message: 'Drag and drop the downloaded file to Netlify Drop',
                type: 'info'
            });
        }, 1000);
    }

    deployVercel() {
        this.eventBus.emit('notification', {
            message: 'Preparing for Vercel deployment...',
            type: 'info'
        });
        
        const previewFrame = document.getElementById('previewFrame');
        const html = previewFrame.contentDocument.documentElement.outerHTML;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
            window.open('https://vercel.com/new', '_blank');
            this.eventBus.emit('notification', {
                message: 'Upload your portfolio to Vercel',
                type: 'info'
            });
        }, 1000);
    }
}

window.DeploymentManager = DeploymentManager;