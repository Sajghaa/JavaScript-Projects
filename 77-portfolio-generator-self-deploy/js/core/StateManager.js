export class StateManager {
    constructor() {
        this.state = {
            personal: {
                name: 'Alex Morgan',
                title: 'Creative Full Stack Developer',
                email: 'alex.morgan@example.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                bio: "I'm a passionate creative developer with 6+ years of experience crafting beautiful, functional web experiences. I love turning complex problems into elegant solutions and building things that make a difference.",
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
                github: 'https://github.com/alexmorgan',
                linkedin: 'https://linkedin.com/in/alexmorgan',
                twitter: 'https://twitter.com/alexmorgan',
                codepen: ''
            },
            projects: [
                {
                    id: '1',
                    title: 'AI Image Generator',
                    description: 'A powerful AI-powered tool that generates unique images from text descriptions using stable diffusion.',
                    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300',
                    tags: ['React', 'Python', 'TensorFlow', 'AI'],
                    link: 'https://example.com/ai-image',
                    github: 'https://github.com/ai-image-generator',
                    featured: true
                },
                {
                    id: '2',
                    title: 'EcoTrack Dashboard',
                    description: 'Real-time carbon footprint tracking dashboard for businesses to monitor and reduce their environmental impact.',
                    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300',
                    tags: ['Vue.js', 'D3.js', 'Node.js', 'MongoDB'],
                    link: 'https://example.com/ecotrack',
                    github: 'https://github.com/ecotrack',
                    featured: true
                },
                {
                    id: '3',
                    title: 'TaskFlow Pro',
                    description: 'Collaborative project management platform with real-time updates, task assignments, and progress tracking.',
                    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300',
                    tags: ['React', 'Firebase', 'TailwindCSS'],
                    link: 'https://example.com/taskflow',
                    github: 'https://github.com/taskflow-pro',
                    featured: false
                }
            ],
            skills: [
                { name: 'React', level: 92 },
                { name: 'JavaScript/TypeScript', level: 88 },
                { name: 'Python', level: 85 },
                { name: 'Node.js', level: 82 },
                { name: 'CSS/Tailwind', level: 90 },
                { name: 'GraphQL', level: 75 }
            ],
            softSkills: [
                'Team Leadership', 'Problem Solving', 'Communication', 'Agile Methodology'
            ],
            design: {
                theme: 'modern',
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                fontFamily: 'Inter',
                layout: 'grid',
                animations: true
            }
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
    }

    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        const oldValue = target[lastKey];
        
        target[lastKey] = value;
        
        this.notifyListeners(path, value, oldValue);
        this.saveToStorage();
    }

    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        return () => {
            this.listeners.get(path)?.delete(callback);
        };
    }

    notifyListeners(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    }

    // Project operations
    addProject(project) {
        const projects = [...this.state.projects];
        const newProject = {
            id: Date.now().toString(),
            ...project,
            featured: false
        };
        projects.push(newProject);
        this.set('projects', projects);
        return newProject;
    }

    updateProject(projectId, updates) {
        const projects = this.state.projects.map(p =>
            p.id === projectId ? { ...p, ...updates } : p
        );
        this.set('projects', projects);
    }

    deleteProject(projectId) {
        const projects = this.state.projects.filter(p => p.id !== projectId);
        this.set('projects', projects);
    }

    // Skill operations
    addSkill(skill) {
        const skills = [...this.state.skills, skill];
        this.set('skills', skills);
    }

    updateSkill(index, updates) {
        const skills = this.state.skills.map((s, i) =>
            i === index ? { ...s, ...updates } : s
        );
        this.set('skills', skills);
    }

    deleteSkill(index) {
        const skills = this.state.skills.filter((_, i) => i !== index);
        this.set('skills', skills);
    }

    // Soft skill operations
    addSoftSkill(skill) {
        const softSkills = [...this.state.softSkills, skill];
        this.set('softSkills', softSkills);
    }

    updateSoftSkill(index, value) {
        const softSkills = this.state.softSkills.map((s, i) =>
            i === index ? value : s
        );
        this.set('softSkills', softSkills);
    }

    deleteSoftSkill(index) {
        const softSkills = this.state.softSkills.filter((_, i) => i !== index);
        this.set('softSkills', softSkills);
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('portfolio_data', JSON.stringify(this.state));
        } catch (error) {
            console.error('Error saving:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('portfolio_data');
            if (saved) {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data };
            }
        } catch (error) {
            console.error('Error loading:', error);
        }
    }

    reset() {
        localStorage.removeItem('portfolio_data');
        window.location.reload();
    }
}