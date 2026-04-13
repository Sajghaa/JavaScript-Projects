// PreviewManager.js - Manages live preview generation
class PreviewManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.frame = document.getElementById('previewFrame');
        this.currentDevice = 'desktop';
    }

    updatePreview() {
        const html = this.generateHTML();
        const doc = this.frame.contentDocument || this.frame.contentWindow.document;
        
        doc.open();
        doc.write(html);
        doc.close();
    }

    generateHTML() {
        const personal = this.stateManager.get('personal');
        const projects = this.stateManager.get('projects');
        const skills = this.stateManager.get('skills');
        const softSkills = this.stateManager.get('softSkills');
        const design = this.stateManager.get('design');

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(personal.name)} | Portfolio</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=${design.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: '${design.fontFamily}', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #1f2937;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* Header */
        .header {
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor});
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            text-decoration: none;
            color: #4b5563;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: ${design.primaryColor};
        }
        
        /* Hero Section */
        .hero {
            padding: 6rem 0;
            text-align: center;
            background: linear-gradient(135deg, ${design.primaryColor}10, ${design.secondaryColor}10);
        }
        
        .hero-avatar {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor});
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        
        .hero-title {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 1rem;
        }
        
        .hero-location {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #6b7280;
            margin-bottom: 1.5rem;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }
        
        .social-links a {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${design.primaryColor};
            transition: all 0.3s;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .social-links a:hover {
            transform: translateY(-3px);
            background: ${design.primaryColor};
            color: white;
        }
        
        /* About Section */
        .about {
            padding: 5rem 0;
            background: white;
        }
        
        .section-title {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 3rem;
            position: relative;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor});
            border-radius: 2px;
        }
        
        .about-content {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            color: #4b5563;
        }
        
        /* Skills Section */
        .skills {
            padding: 5rem 0;
            background: linear-gradient(135deg, #f9fafb, #f3f4f6);
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .skill-category h3 {
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
        }
        
        .skill-item {
            margin-bottom: 1rem;
        }
        
        .skill-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .skill-bar {
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .skill-progress {
            height: 100%;
            background: linear-gradient(90deg, ${design.primaryColor}, ${design.secondaryColor});
            border-radius: 4px;
            transition: width 0.3s;
        }
        
        .soft-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 1rem;
        }
        
        .soft-skill {
            padding: 0.5rem 1rem;
            background: white;
            border-radius: 25px;
            font-size: 0.85rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        /* Projects Section */
        .projects {
            padding: 5rem 0;
            background: white;
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }
        
        .project-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .project-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
        }
        
        .project-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .project-content {
            padding: 1.5rem;
        }
        
        .project-title {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }
        
        .project-description {
            color: #6b7280;
            margin-bottom: 1rem;
            line-height: 1.6;
        }
        
        .project-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .project-tag {
            padding: 0.25rem 0.75rem;
            background: #f3f4f6;
            border-radius: 20px;
            font-size: 0.75rem;
            color: #4b5563;
        }
        
        .project-links {
            display: flex;
            gap: 1rem;
        }
        
        .project-links a {
            text-decoration: none;
            color: ${design.primaryColor};
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .project-links a:hover {
            text-decoration: underline;
        }
        
        /* Contact Section */
        .contact {
            padding: 5rem 0;
            background: linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor});
            color: white;
        }
        
        .contact .section-title::after {
            background: white;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            margin-top: 2rem;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .contact-item i {
            font-size: 1.25rem;
        }
        
        .contact-item a {
            color: white;
            text-decoration: none;
        }
        
        .contact-item a:hover {
            text-decoration: underline;
        }
        
        /* Footer */
        .footer {
            padding: 2rem;
            text-align: center;
            background: #1f2937;
            color: #9ca3af;
        }
        
        ${design.animations ? `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .hero, .about, .skills, .projects, .contact {
                animation: fadeInUp 0.6s ease-out;
            }
        ` : ''}
        
        @media (max-width: 768px) {
            .nav {
                flex-direction: column;
                gap: 1rem;
            }
            
            .hero h1 {
                font-size: 2rem;
            }
            
            .projects-grid {
                grid-template-columns: 1fr;
            }
            
            .skills-grid {
                grid-template-columns: 1fr;
            }
            
            .contact-info {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">${this.escapeHtml(personal.name.split(' ')[0])}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="container">
                <img src="${this.escapeHtml(personal.avatar)}" alt="${this.escapeHtml(personal.name)}" class="hero-avatar">
                <h1>${this.escapeHtml(personal.name)}</h1>
                <div class="hero-title">${this.escapeHtml(personal.title)}</div>
                <div class="hero-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.escapeHtml(personal.location)}</span>
                </div>
                <div class="social-links">
                    ${personal.github ? `<a href="${this.escapeHtml(personal.github)}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                    ${personal.linkedin ? `<a href="${this.escapeHtml(personal.linkedin)}" target="_blank"><i class="fab fa-linkedin"></i></a>` : ''}
                    ${personal.twitter ? `<a href="${this.escapeHtml(personal.twitter)}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                    ${personal.codepen ? `<a href="${this.escapeHtml(personal.codepen)}" target="_blank"><i class="fab fa-codepen"></i></a>` : ''}
                </div>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2 class="section-title">About Me</h2>
                <div class="about-content">
                    <p>${this.escapeHtml(personal.bio)}</p>
                </div>
            </div>
        </section>

        <section id="skills" class="skills">
            <div class="container">
                <h2 class="section-title">Skills</h2>
                <div class="skills-grid">
                    <div class="skill-category">
                        <h3>Technical Skills</h3>
                        ${skills.map(skill => `
                            <div class="skill-item">
                                <div class="skill-info">
                                    <span>${this.escapeHtml(skill.name)}</span>
                                    <span>${skill.level}%</span>
                                </div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: ${skill.level}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="skill-category">
                        <h3>Soft Skills</h3>
                        <div class="soft-skills">
                            ${softSkills.map(skill => `
                                <span class="soft-skill">${this.escapeHtml(skill)}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="projects" class="projects">
            <div class="container">
                <h2 class="section-title">Featured Projects</h2>
                <div class="projects-grid">
                    ${projects.map(project => `
                        <div class="project-card">
                            <img src="${this.escapeHtml(project.image)}" alt="${this.escapeHtml(project.title)}" class="project-image">
                            <div class="project-content">
                                <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
                                <p class="project-description">${this.escapeHtml(project.description)}</p>
                                <div class="project-tags">
                                    ${project.tags.map(tag => `<span class="project-tag">${this.escapeHtml(tag)}</span>`).join('')}
                                </div>
                                <div class="project-links">
                                    ${project.link ? `<a href="${this.escapeHtml(project.link)}" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                                    ${project.github ? `<a href="${this.escapeHtml(project.github)}" target="_blank"><i class="fab fa-github"></i> Source Code</a>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2 class="section-title">Get In Touch</h2>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <a href="mailto:${this.escapeHtml(personal.email)}">${this.escapeHtml(personal.email)}</a>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${this.escapeHtml(personal.phone)}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.escapeHtml(personal.location)}</span>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${this.escapeHtml(personal.name)}. All rights reserved.</p>
        </div>
    </footer>
    
    <script>
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>
</body>
</html>
        `;
    }

    setDevice(device) {
        this.currentDevice = device;
        const frame = this.frame;
        const container = document.getElementById('previewContainer');
        
        switch(device) {
            case 'mobile':
                frame.style.width = '375px';
                frame.style.margin = '0 auto';
                if (container) container.style.backgroundColor = '#000';
                break;
            case 'tablet':
                frame.style.width = '768px';
                frame.style.margin = '0 auto';
                if (container) container.style.backgroundColor = '#f0f0f0';
                break;
            default:
                frame.style.width = '100%';
                frame.style.margin = '0';
                if (container) container.style.backgroundColor = 'var(--background)';
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

window.PreviewManager = PreviewManager;