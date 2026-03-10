export class EducationSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'education',
            title: 'Education',
            visible: true,
            data: {
                items: [
                    {
                        degree: 'Bachelor of Science in Computer Science',
                        institution: 'University of Technology',
                        startDate: '2016',
                        endDate: '2020',
                        description: 'Graduated with honors. Focused on software development and algorithms.',
                        grade: '3.8 GPA',
                        achievements: [
                            'Dean\'s List for 4 semesters',
                            'Senior Project Award'
                        ]
                    },
                    {
                        degree: 'High School Diploma',
                        institution: 'City High School',
                        startDate: '2012',
                        endDate: '2016',
                        description: 'STEM focus with advanced placement courses.',
                        achievements: [
                            'Math Olympiad Finalist',
                            'Computer Club President'
                        ]
                    }
                ],
                layout: 'timeline', // timeline, grid, list
                showGrade: true,
                showAchievements: true
            }
        };
    }

    renderPreview(data) {
        const items = data.items || [];
        const layout = data.layout || 'timeline';
        const showGrade = data.showGrade !== false;
        const showAchievements = data.showAchievements !== false;

        if (items.length === 0) return '';

        let itemsHtml;
        switch(layout) {
            case 'grid':
                itemsHtml = `
                    <div class="education-grid">
                        ${items.map(item => `
                            <div class="education-card">
                                <div class="card-header">
                                    <h3>${item.degree}</h3>
                                    <h4>${item.institution}</h4>
                                    <div class="date">${item.startDate} - ${item.endDate || 'Present'}</div>
                                </div>
                                <div class="card-body">
                                    <p>${item.description}</p>
                                    ${showGrade && item.grade ? `
                                        <div class="grade">
                                            <i class="fas fa-star"></i>
                                            <span>${item.grade}</span>
                                        </div>
                                    ` : ''}
                                    ${showAchievements && item.achievements?.length ? `
                                        <div class="achievements">
                                            <h5>Key Achievements:</h5>
                                            <ul>
                                                ${item.achievements.map(ach => `<li>${ach}</li>`).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;

            case 'list':
                itemsHtml = `
                    <div class="education-list">
                        ${items.map(item => `
                            <div class="education-item">
                                <div class="item-left">
                                    <div class="institution-logo">
                                        <i class="fas fa-university"></i>
                                    </div>
                                </div>
                                <div class="item-right">
                                    <h3>${item.degree}</h3>
                                    <h4>${item.institution}</h4>
                                    <div class="meta">
                                        <span><i class="far fa-calendar"></i> ${item.startDate} - ${item.endDate || 'Present'}</span>
                                        ${showGrade && item.grade ? `
                                            <span><i class="fas fa-star"></i> ${item.grade}</span>
                                        ` : ''}
                                    </div>
                                    <p>${item.description}</p>
                                    ${showAchievements && item.achievements?.length ? `
                                        <div class="achievements-list">
                                            ${item.achievements.map(ach => `
                                                <span class="achievement-tag">
                                                    <i class="fas fa-check-circle"></i> ${ach}
                                                </span>
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
                    <div class="education-timeline">
                        ${items.map((item, index) => `
                            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <div class="timeline-date">${item.startDate} - ${item.endDate || 'Present'}</div>
                                    <h3>${item.degree}</h3>
                                    <h4>${item.institution}</h4>
                                    <p>${item.description}</p>
                                    ${showGrade && item.grade ? `
                                        <div class="timeline-grade">
                                            <i class="fas fa-award"></i> ${item.grade}
                                        </div>
                                    ` : ''}
                                    ${showAchievements && item.achievements?.length ? `
                                        <ul class="timeline-achievements">
                                            ${item.achievements.map(ach => `<li>${ach}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
        }

        return `
            <section id="education" class="education-section">
                <div class="container">
                    <div class="section-header">
                        <h2>${data.title || 'Education'}</h2>
                        <div class="divider"></div>
                    </div>
                    ${itemsHtml}
                </div>
            </section>
        `;
    }
}