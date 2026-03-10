export class ExperienceSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'experience',
            title: 'Work Experience',
            visible: true,
            data: {
                items: [
                    {
                        position: 'Senior Developer',
                        company: 'Tech Company Inc.',
                        location: 'San Francisco, CA',
                        startDate: '2020',
                        endDate: 'Present',
                        description: 'Lead developer for multiple web applications.',
                        achievements: [
                            'Developed scalable web applications using React and Node.js',
                            'Led a team of 5 developers',
                            'Improved performance by 40%'
                        ],
                        technologies: ['React', 'Node.js', 'MongoDB', 'AWS']
                    },
                    {
                        position: 'Junior Developer',
                        company: 'StartUp Ltd.',
                        location: 'New York, NY',
                        startDate: '2018',
                        endDate: '2020',
                        description: 'Full stack developer for various client projects.',
                        achievements: [
                            'Built responsive websites for 10+ clients',
                            'Implemented CI/CD pipeline',
                            'Reduced bug count by 30%'
                        ],
                        technologies: ['JavaScript', 'PHP', 'MySQL']
                    }
                ],
                layout: 'timeline', // timeline, cards, list
                showCompanyLogo: true,
                showTechnologies: true,
                showLocation: true
            }
        };
    }

    renderPreview(data) {
        const items = data.items || [];
        const layout = data.layout || 'timeline';
        const showTechnologies = data.showTechnologies !== false;
        const showLocation = data.showLocation !== false;

        if (items.length === 0) return '';

        let itemsHtml;
        switch(layout) {
            case 'cards':
                itemsHtml = `
                    <div class="experience-cards">
                        ${items.map(item => `
                            <div class="experience-card">
                                <div class="card-header">
                                    <div class="company-info">
                                        ${data.showCompanyLogo ? `
                                            <div class="company-logo">
                                                <i class="fas fa-building"></i>
                                            </div>
                                        ` : ''}
                                        <div>
                                            <h3>${item.position}</h3>
                                            <h4>${item.company}</h4>
                                        </div>
                                    </div>
                                    <div class="date-badge">${item.startDate} - ${item.endDate || 'Present'}</div>
                                </div>
                                <div class="card-body">
                                    <p>${item.description}</p>
                                    ${item.achievements?.length ? `
                                        <ul class="achievements">
                                            ${item.achievements.map(ach => `<li>${ach}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                    ${showTechnologies && item.technologies?.length ? `
                                        <div class="tech-stack">
                                            ${item.technologies.map(tech => `
                                                <span class="tech-tag">${tech}</span>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;

            default: // timeline
                itemsHtml = `
                    <div class="experience-timeline">
                        ${items.map((item, index) => `
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-header">
                                        <h3>${item.position}</h3>
                                        <div class="timeline-date">${item.startDate} - ${item.endDate || 'Present'}</div>
                                    </div>
                                    <div class="timeline-subheader">
                                        <h4>${item.company}</h4>
                                        ${showLocation && item.location ? `
                                            <span class="location">
                                                <i class="fas fa-map-marker-alt"></i> ${item.location}
                                            </span>
                                        ` : ''}
                                    </div>
                                    <p class="timeline-description">${item.description}</p>
                                    ${item.achievements?.length ? `
                                        <ul class="timeline-achievements">
                                            ${item.achievements.map(ach => `<li>${ach}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                    ${showTechnologies && item.technologies?.length ? `
                                        <div class="timeline-tech">
                                            ${item.technologies.map(tech => `
                                                <span class="tech-badge">${tech}</span>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
        }

        return `
            <section id="experience" class="experience-section">
                <div class="container">
                    <div class="section-header">
                        <h2>${data.title || 'Work Experience'}</h2>
                        <div class="divider"></div>
                    </div>
                    ${itemsHtml}
                </div>
            </section>
        `;
    }
}