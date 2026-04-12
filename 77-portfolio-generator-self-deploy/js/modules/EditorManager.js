export class EditorManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.initializeInputs();
    }

    initializeInputs() {
        const personalFields = [
            'userName', 'userTitle', 'userEmail', 'userPhone',
            'userLocation', 'userBio', 'userAvatar', 'githubUrl',
            'linkedinUrl', 'twitterUrl', 'codepenUrl'
        ];

        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const statePath = this.getStatePath(field);
                element.value = this.stateManager.get(statePath) || '';
                
                element.addEventListener('input', (e) => {
                    this.stateManager.set(statePath, e.target.value);
                    this.eventBus.emit('state:changed');
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
}