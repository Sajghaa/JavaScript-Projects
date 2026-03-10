export class ProjectsSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'projects',
            title: 'My Projects',
            visible: true,
            data: {
                projects: [
                    {
                        title: 'E-Commerce Platform',
                        description: 'A full-stack e-commerce platform with React and Node.js',
                        image: 'https://via.placeholder.com/600x400',
                        tags: ['React', 'Node.js', 'MongoDB', 'Redux'],
                        link: 'https://example.com',
                        github: 'https://github.com',
                        featured: true,
                        category: 'Web App'
                    },
                    {
                        title: 'Mobile Weather App',
                        description: 'Weather application built with React Native',
                        image: 'https://via.placeholder.com/600x400',
                        tags: ['React Native', 'JavaScript', 'API'],
                        link: 'https://example.com',
                        github: 'https://github.com',
                        featured: false,
                        category: 'Mobile'
                    }
                ],
                layout: 'grid', // grid, masonry, carousel
                columns: 3,
                showFilters: true,
                showSearch: false,
                categories: ['All', 'Web App', 'Mobile', 'API'],
                hoverEffect: 'scale', // scale, slide, fade
                modalPreview: true
            }
        };
    }

    renderPreview(data) {
        const projects = data.projects || [];
        const layout = data.layout || 'grid';
        const columns = data.columns || 3;
        const showFilters = data.showFilters || false;
        const hoverEffect = data.hoverEffect || 'scale';
        const categories = data.categories || ['All'];

        if (projects.length === 0) return '';

        const projectsHtml = projects.map(project => `
            <div class="project-item ${hoverEffect}-effect ${project.featured ? 'featured' : ''}" data-category="${project.category || 'All'}">
                <div class="project-image">
                    <img src="${project.image || 'https://via.placeholder.com/600x400'}" alt="${project.title}" loading="lazy">
                    <div class="project-overlay">
                        <div class="project-links">
                            ${project.link ? `<a href="${project.link}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                            ${project.github ? `<a href="${project.github}" target="_blank" class="project-link"><i class="fab fa-github"></i></a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${(project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        const filtersHtml = showFilters ? `
            <div class="project-filters">
                ${categories.map(category => `
                    <button class="filter-btn ${category === 'All' ? 'active' : ''}" data-filter="${category}">${category}</button>
                `).join('')}
            </div>
        ` : '';

        let gridClass = '';
        switch(columns) {
            case 2: gridClass = 'grid-2'; break;
            case 3: gridClass = 'grid-3'; break;
            case 4: gridClass = 'grid-4'; break;
            default: gridClass = 'grid-3';
        }

        return `
            <section id="projects" class="projects-section">
                <div class="container">
                    <div class="section-header">
                        <h2>${data.title || 'My Projects'}</h2>
                        <div class="divider"></div>
                    </div>
                    
                    ${filtersHtml}
                    
                    <div class="projects-grid ${gridClass} ${layout}">
                        ${projectsHtml}
                    </div>
                </div>
            </section>
        `;
    }
}