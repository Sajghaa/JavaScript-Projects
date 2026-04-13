class DeploymentModal {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.modal = null;
    }

    show() {
        // Remove existing modal if any
        this.hide();
        
        // Create modal element
        this.modal = document.createElement('div');
        this.modal.className = 'modal active';
        this.modal.id = 'deployModal';
        this.modal.innerHTML = this.render();
        
        document.body.appendChild(this.modal);
        
        // Add event listeners
        this.attachEvents();
    }

    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    render() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-rocket"></i> Deploy Your Portfolio</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="deploy-options">
                        <div class="deploy-card" data-method="download">
                            <i class="fas fa-download"></i>
                            <h3>Download Files</h3>
                            <p>Save your portfolio as HTML/CSS files</p>
                            <button class="btn btn-primary">Download</button>
                        </div>
                        
                        <div class="deploy-card" data-method="github">
                            <i class="fab fa-github"></i>
                            <h3>GitHub Pages</h3>
                            <p>Deploy instantly to GitHub Pages</p>
                            <button class="btn btn-primary">Deploy to GitHub</button>
                        </div>
                        
                        <div class="deploy-card" data-method="netlify">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <h3>Netlify Drop</h3>
                            <p>Drag and drop to Netlify</p>
                            <button class="btn btn-primary">Deploy to Netlify</button>
                        </div>
                        
                        <div class="deploy-card" data-method="vercel">
                            <i class="fas fa-charging-station"></i>
                            <h3>Vercel</h3>
                            <p>One-click Vercel deployment</p>
                            <button class="btn btn-primary">Deploy to Vercel</button>
                        </div>
                    </div>
                    
                    <div class="deploy-note">
                        <i class="fas fa-info-circle"></i>
                        <p>Your portfolio data is saved locally. Choose a deployment method to publish your portfolio online.</p>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        // Close modal button
        const closeBtn = this.modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
        
        // Deploy buttons
        const deployCards = this.modal.querySelectorAll('.deploy-card');
        deployCards.forEach(card => {
            const btn = card.querySelector('.btn');
            const method = card.dataset.method;
            btn.addEventListener('click', () => {
                this.eventBus.emit('deploy:method', method);
                this.hide();
            });
        });
    }
}

window.DeploymentModal = DeploymentModal;