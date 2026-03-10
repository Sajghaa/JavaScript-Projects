export class AboutSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'about',
            title: 'About Me',
            visible: true,
            data: {
                content: 'I am a passionate developer with experience in building web applications.',
                image: null,
                layout: 'left',
                showProgress: false,
                progressBars: [
                    { label: 'Web Development', percentage: 90 },
                    { label: 'UI/UX Design', percentage: 75 },
                    { label: 'Problem Solving', percentage: 85 }
                ],
                cvLink: '',
                achievements: []
            }
        };
    }

    renderPreview(data) {
        const personal = this.stateManager.get('portfolio.personal');
        const content = data.content || personal.bio || '';
        const layout = data.layout || 'left';
        const image = data.image || 'https://via.placeholder.com/400x400';
        const showProgress = data.showProgress || false;
        const progressBars = data.progressBars || [];
        const achievements = data.achievements || [];
        const cvLink = data.cvLink || '';

        const imageHtml = `<img src="${image}" alt="About me" class="about-image">`;

        const contentHtml = `
            <div class="about-text">
                <p>${content}</p>
                ${achievements.length > 0 ? `
                    <div class="achievements">
                        ${achievements.map(achievement => `
                            <div class="achievement">
                                <i class="fas fa-${achievement.icon || 'trophy'}"></i>
                                <span>${achievement.text}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${cvLink ? `
                    <a href="${cvLink}" class="btn btn-outline" download>
                        <i class="fas fa-download"></i> Download CV
                    </a>
                ` : ''}
            </div>
        `;

        const progressHtml = showProgress ? `
            <div class="progress-bars">
                ${progressBars.map(bar => `
                    <div class="progress-item">
                        <div class="progress-label">${bar.label}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${bar.percentage}%"></div>
                            <span class="progress-percentage">${bar.percentage}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : '';

        let layoutHtml;
        switch(layout) {
            case 'left':
                layoutHtml = `
                    <div class="about-grid left-layout">
                        <div class="about-image-col">${imageHtml}</div>
                        <div class="about-content-col">
                            ${contentHtml}
                            ${progressHtml}
                        </div>
                    </div>
                `;
                break;
            case 'right':
                layoutHtml = `
                    <div class="about-grid right-layout">
                        <div class="about-content-col">
                            ${contentHtml}
                            ${progressHtml}
                        </div>
                        <div class="about-image-col">${imageHtml}</div>
                    </div>
                `;
                break;
            case 'top':
                layoutHtml = `
                    <div class="about-stack top-layout">
                        <div class="about-image-full">${imageHtml}</div>
                        <div class="about-content-full">
                            ${contentHtml}
                            ${progressHtml}
                        </div>
                    </div>
                `;
                break;
            default:
                layoutHtml = contentHtml;
        }

        return `
            <section id="about" class="about-section">
                <div class="container">
                    <div class="section-header">
                        <h2>${data.title || 'About Me'}</h2>
                        <div class="divider"></div>
                    </div>
                    ${layoutHtml}
                </div>
            </section>
        `;
    }
}