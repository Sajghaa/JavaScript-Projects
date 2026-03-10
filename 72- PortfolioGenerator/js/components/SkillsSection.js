export class SkillsSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'skills',
            title: 'My Skills',
            visible: true,
            data: {
                categories: [
                    {
                        name: 'Frontend',
                        skills: [
                            { name: 'JavaScript', level: 90, icon: 'fab fa-js' },
                            { name: 'React', level: 85, icon: 'fab fa-react' },
                            { name: 'HTML/CSS', level: 95, icon: 'fab fa-html5' }
                        ]
                    },
                    {
                        name: 'Backend',
                        skills: [
                            { name: 'Node.js', level: 80, icon: 'fab fa-node' },
                            { name: 'Python', level: 75, icon: 'fab fa-python' },
                            { name: 'SQL', level: 85, icon: 'fas fa-database' }
                        ]
                    }
                ],
                layout: 'bars', // bars, circles, tags, icons
                showLevels: true,
                showIcons: true,
                columns: 2
            }
        };
    }

    renderPreview(data) {
        const categories = data.categories || [];
        const layout = data.layout || 'bars';
        const showLevels = data.showLevels !== false;
        const showIcons = data.showIcons !== false;
        const columns = data.columns || 2;

        if (categories.length === 0) return '';

        let skillsHtml;
        switch(layout) {
            case 'bars':
                skillsHtml = categories.map(category => `
                    <div class="skill-category">
                        <h3 class="category-title">${category.name}</h3>
                        <div class="skills-bars">
                            ${category.skills.map(skill => `
                                <div class="skill-bar-item">
                                    <div class="skill-info">
                                        ${showIcons && skill.icon ? `<i class="${skill.icon}"></i>` : ''}
                                        <span class="skill-name">${skill.name}</span>
                                        ${showLevels ? `<span class="skill-level">${skill.level}%</span>` : ''}
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${skill.level}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                break;

            case 'circles':
                skillsHtml = categories.map(category => `
                    <div class="skill-category">
                        <h3 class="category-title">${category.name}</h3>
                        <div class="skills-circles">
                            ${category.skills.map(skill => `
                                <div class="skill-circle-item">
                                    <div class="circle-progress" data-level="${skill.level}">
                                        <svg viewBox="0 0 36 36" class="circular-chart">
                                            <path class="circle-bg"
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#eee"
                                                stroke-width="2"
                                            />
                                            <path class="circle"
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#3498db"
                                                stroke-width="2"
                                                stroke-dasharray="${skill.level}, 100"
                                            />
                                            <text x="18" y="20.35" class="percentage">${skill.level}%</text>
                                        </svg>
                                    </div>
                                    <div class="skill-circle-label">
                                        ${showIcons && skill.icon ? `<i class="${skill.icon}"></i>` : ''}
                                        <span>${skill.name}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                break;

            case 'tags':
                skillsHtml = categories.map(category => `
                    <div class="skill-category">
                        <h3 class="category-title">${category.name}</h3>
                        <div class="skills-tags">
                            ${category.skills.map(skill => `
                                <span class="skill-tag">
                                    ${showIcons && skill.icon ? `<i class="${skill.icon}"></i>` : ''}
                                    ${skill.name}
                                    ${showLevels ? `<span class="tag-level">${skill.level}%</span>` : ''}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                break;

            case 'icons':
                skillsHtml = categories.map(category => `
                    <div class="skill-category">
                        <h3 class="category-title">${category.name}</h3>
                        <div class="skills-icons">
                            ${category.skills.map(skill => `
                                <div class="skill-icon-item" title="${skill.name} - ${skill.level}%">
                                    ${showIcons && skill.icon ? `<i class="${skill.icon}"></i>` : ''}
                                    <span class="skill-icon-label">${skill.name}</span>
                                    ${showLevels ? `<span class="skill-icon-level">${skill.level}%</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                break;
        }

        return `
            <section id="skills" class="skills-section">
                <div class="container">
                    <div class="section-header">
                        <h2>${data.title || 'My Skills'}</h2>
                        <div class="divider"></div>
                    </div>
                    
                    <div class="skills-container" style="grid-template-columns: repeat(${columns}, 1fr)">
                        ${skillsHtml}
                    </div>
                </div>
            </section>
        `;
    }
}