class EditorPanel {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentTab = 'basic';
        
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupFormListeners();
        this.loadPersonalInfo();
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        this.currentTab = tabId;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // Update tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}Tab`);
        });
    }

    setupFormListeners() {
        // Personal info fields
        const personalFields = [
            'userName', 'userTitle', 'userEmail', 'userPhone',
            'userLocation', 'userBio', 'userAvatar', 'githubUrl',
            'linkedinUrl', 'twitterUrl', 'codepenUrl'
        ];

        personalFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', () => {
                    const statePath = this.getStatePath(fieldId);
                    if (statePath) {
                        this.stateManager.set(statePath, element.value);
                    }
                });
            }
        });
    }

    loadPersonalInfo() {
        const personal = this.stateManager.get('personal');
        
        document.getElementById('userName').value = personal.name || '';
        document.getElementById('userTitle').value = personal.title || '';
        document.getElementById('userEmail').value = personal.email || '';
        document.getElementById('userPhone').value = personal.phone || '';
        document.getElementById('userLocation').value = personal.location || '';
        document.getElementById('userBio').value = personal.bio || '';
        document.getElementById('userAvatar').value = personal.avatar || '';
        document.getElementById('githubUrl').value = personal.github || '';
        document.getElementById('linkedinUrl').value = personal.linkedin || '';
        document.getElementById('twitterUrl').value = personal.twitter || '';
        document.getElementById('codepenUrl').value = personal.codepen || '';
    }

    getStatePath(fieldId) {
        const mapping = {
            userName: 'personal.name',
            userTitle: 'personal.title',
            userEmail: 'personal.email',
            userPhone: 'personal.phone',
            userLocation: 'personal.location',
            userBio: 'personal.bio',
            userAvatar: 'personal.avatar',
            githubUrl: 'personal.github',
            linkedinUrl: 'personal.linkedin',
            twitterUrl: 'personal.twitter',
            codepenUrl: 'personal.codepen'
        };
        return mapping[fieldId];
    }

    reset() {
        if (confirm('Reset all changes? This cannot be undone.')) {
            localStorage.removeItem('portfolio_data');
            window.location.reload();
        }
    }
}

window.EditorPanel = EditorPanel;