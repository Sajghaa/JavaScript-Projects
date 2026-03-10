export class PreviewManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.frame = document.getElementById('previewFrame');
        this.updateTimeout = null;
    }

    updatePreview() {
        // Debounce preview updates
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            this.generatePreview();
        }, 300);
    }

    generatePreview() {
        const portfolio = this.stateManager.get('portfolio');
        const html = this.generateHTML(portfolio);
        const css = this.generateCSS(portfolio);
        
        const previewDocument = this.frame.contentDocument || this.frame.contentWindow.document;
        previewDocument.open();
        previewDocument.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=${portfolio.theme.font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    ${css}
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `);
        previewDocument.close();
    }

    generateHTML(portfolio) {
        const sections = portfolio.sections
            .filter(s => s.visible)
            .map(section => this.renderSection(section))
            .join('');

        return `
            <div class="portfolio ${portfolio.theme.layout}">
                <nav class="navbar">
                    <div class="container">
                        <a href="#" class="logo">${portfolio.personal.name}</a>
                        <ul class="nav-links">
                            ${portfolio.sections.map(s => 
                                `<li><a href="#${s.type}">${s.title || this.getSectionTitle(s.type)}</a></li>`
                            ).join('')}
                        </ul>
                    </div>
                </nav>
                
                <main>
                    ${sections}
                </main>
                
                <footer class="footer">
                    <div class="container">
                        <p>© 2024 ${portfolio.personal.name}. All rights reserved.</p>
                        <div class="social-links">
                            ${Object.entries(portfolio.social)
                                .filter(([_, url]) => url)
                                .map(([platform, url]) => 
                                    `<a href="${url}" target="_blank"><i class="fab fa-${platform}"></i></a>`
                                ).join('')}
                        </div>
                    </div>
                </footer>
            </div>
        `;
    }

    generateCSS(portfolio) {
        const theme = portfolio.theme;
        
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: '${theme.font}', sans-serif;
                line-height: 1.6;
                color: #333;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
            }
            
            /* Navigation */
            .navbar {
                position: sticky;
                top: 0;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            
            .navbar .container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 2rem;
            }
            
            .logo {
                font-size: 1.5rem;
                font-weight: 700;
                color: ${theme.primary};
                text-decoration: none;
            }
            
            .nav-links {
                display: flex;
                list-style: none;
                gap: 2rem;
            }
            
            .nav-links a {
                text-decoration: none;
                color: #666;
                transition: color 0.3s;
            }
            
            .nav-links a:hover {
                color: ${theme.primary};
            }
            
            /* Sections */
            section {
                padding: 5rem 0;
            }
            
            section:nth-child(even) {
                background: #f8f9fa;
            }
            
            .section-title {
                text-align: center;
                margin-bottom: 3rem;
            }
            
            .section-title h2 {
                font-size: 2.5rem;
                color: ${theme.primary};
                margin-bottom: 1rem;
            }
            
            .section-title .divider {
                width: 80px;
                height: 4px;
                background: ${theme.primary};
                margin: 0 auto;
            }
            
            /* Hero Section */
            .hero {
                text-align: center;
                padding: 8rem 0;
                background: linear-gradient(135deg, ${theme.primary}10, ${theme.secondary}10);
            }
            
            .hero h1 {
                font-size: 3.5rem;
                margin-bottom: 1rem;
                color: ${theme.primary};
            }
            
            .hero h2 {
                font-size: 2rem;
                color: #666;
                margin-bottom: 2rem;
            }
            
            .hero p {
                max-width: 600px;
                margin: 0 auto 2rem;
                color: #666;
            }
            
            /* About Section */
            .about-content {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 4rem;
                align-items: center;
            }
            
            .about-image img {
                width: 100%;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            /* Skills Section */
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
            }
            
            .skill-item {
                margin-bottom: 1.5rem;
            }
            
            .skill-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }
            
            .skill-bar {
                height: 10px;
                background: #e9ecef;
                border-radius: 5px;
                overflow: hidden;
            }
            
            .skill-progress {
                height: 100%;
                background: ${theme.primary};
                transition: width 0.3s;
            }
            
            /* Projects Section */
            .projects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
            }
            
            .project-card {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: transform 0.3s;
            }
            
            .project-card:hover {
                transform: translateY(-5px);
            }
            
            .project-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            .project-info {
                padding: 1.5rem;
            }
            
            .project-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin: 1rem 0;
            }
            
            .project-tag {
                background: ${theme.primary}20;
                color: ${theme.primary};
                padding: 0.25rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
            }
            
            /* Experience Section */
            .timeline {
                position: relative;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .timeline-item {
                padding: 2rem;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                margin-bottom: 2rem;
            }
            
            .timeline-date {
                color: ${theme.primary};
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            /* Contact Section */
            .contact-content {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 4rem;
            }
            
            .contact-info {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .contact-item i {
                font-size: 1.5rem;
                color: ${theme.primary};
            }
            
            .contact-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 1rem;
            }
            
            .form-group textarea {
                min-height: 150px;
                resize: vertical;
            }
            
            .btn {
                background: ${theme.primary};
                color: white;
                padding: 0.75rem 2rem;
                border: none;
                border-radius: 5px;
                font-size: 1rem;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .btn:hover {
                background: ${theme.secondary};
            }
            
            /* Footer */
            .footer {
                background: #333;
                color: white;
                text-align: center;
                padding: 2rem 0;
            }
            
            .social-links {
                display: flex;
                justify-content: center;
                gap: 1.5rem;
                margin-top: 1rem;
            }
            
            .social-links a {
                color: white;
                font-size: 1.5rem;
                transition: color 0.3s;
            }
            
            .social-links a:hover {
                color: ${theme.primary};
            }
            
            /* Animations */
            ${theme.animations ? `
                .fade-in {
                    animation: fadeIn 1s ease;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            ` : ''}
            
            /* Responsive */
            @media (max-width: 768px) {
                .about-content,
                .contact-content {
                    grid-template-columns: 1fr;
                }
                
                .nav-links {
                    display: none;
                }
                
                .hero h1 {
                    font-size: 2.5rem;
                }
            }
        `;
    }

    renderSection(section) {
        const templates = {
            hero: (data) => `
                <section id="hero" class="hero">
                    <div class="container">
                        <h1>${data.name || this.stateManager.get('portfolio.personal.name')}</h1>
                        <h2>${data.title || this.stateManager.get('portfolio.personal.title')}</h2>
                        <p>${data.bio || this.stateManager.get('portfolio.personal.bio')}</p>
                        <a href="#contact" class="btn">Get In Touch</a>
                    </div>
                </section>
            `,
            
            about: (data) => `
                <section id="about">
                    <div class="container">
                        <div class="section-title">
                            <h2>About Me</h2>
                            <div class="divider"></div>
                        </div>
                        <div class="about-content">
                            <div class="about-image">
                                <img src="${data.image || 'https://via.placeholder.com/400x400'}" alt="About">
                            </div>
                            <div class="about-text">
                                <p>${data.content || this.stateManager.get('portfolio.personal.bio')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            `,
            
            skills: (data) => `
                <section id="skills">
                    <div class="container">
                        <div class="section-title">
                            <h2>My Skills</h2>
                            <div class="divider"></div>
                        </div>
                        <div class="skills-grid">
                            ${(data.skills || []).map(skill => `
                                <div class="skill-item">
                                    <div class="skill-info">
                                        <span>${skill.name}</span>
                                        <span>${skill.level}%</span>
                                    </div>
                                    <div class="skill-bar">
                                        <div class="skill-progress" style="width: ${skill.level}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `,
            
            projects: (data) => `
                <section id="projects">
                    <div class="container">
                        <div class="section-title">
                            <h2>My Projects</h2>
                            <div class="divider"></div>
                        </div>
                        <div class="projects-grid">
                            ${(data.projects || []).map(project => `
                                <div class="project-card">
                                    <img src="${project.image || 'https://via.placeholder.com/400x200'}" alt="${project.title}" class="project-image">
                                    <div class="project-info">
                                        <h3>${project.title}</h3>
                                        <p>${project.description}</p>
                                        <div class="project-tags">
                                            ${(project.tags || []).map(tag => 
                                                `<span class="project-tag">${tag}</span>`
                                            ).join('')}
                                        </div>
                                        <a href="${project.link}" class="btn" target="_blank">View Project</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `,
            
            experience: (data) => `
                <section id="experience">
                    <div class="container">
                        <div class="section-title">
                            <h2>Work Experience</h2>
                            <div class="divider"></div>
                        </div>
                        <div class="timeline">
                            ${(data.experiences || []).map(exp => `
                                <div class="timeline-item">
                                    <div class="timeline-date">${exp.startDate} - ${exp.endDate || 'Present'}</div>
                                    <h3>${exp.position}</h3>
                                    <h4>${exp.company}</h4>
                                    <p>${exp.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `,
            
            contact: (data) => `
                <section id="contact">
                    <div class="container">
                        <div class="section-title">
                            <h2>Get In Touch</h2>
                            <div class="divider"></div>
                        </div>
                        <div class="contact-content">
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>${data.email || this.stateManager.get('portfolio.personal.email')}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <span>${data.phone || this.stateManager.get('portfolio.personal.phone')}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${data.location || this.stateManager.get('portfolio.personal.location')}</span>
                                </div>
                            </div>
                            <form class="contact-form">
                                <div class="form-group">
                                    <input type="text" placeholder="Your Name">
                                </div>
                                <div class="form-group">
                                    <input type="email" placeholder="Your Email">
                                </div>
                                <div class="form-group">
                                    <textarea placeholder="Your Message"></textarea>
                                </div>
                                <button type="submit" class="btn">Send Message</button>
                            </form>
                        </div>
                    </div>
                </section>
            `
        };

        const template = templates[section.type];
        return template ? template(section.data || {}) : '';
    }

    getSectionTitle(type) {
        const titles = {
            hero: 'Home',
            about: 'About',
            projects: 'Projects',
            skills: 'Skills',
            experience: 'Experience',
            education: 'Education',
            testimonials: 'Testimonials',
            contact: 'Contact'
        };
        return titles[type] || type;
    }
}