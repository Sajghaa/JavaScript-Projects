export class TestimonialsSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'testimonials',
            title: 'Client Testimonials',
            visible: true,
            data: {
                testimonials: [
                    {
                        name: 'Sarah Johnson',
                        position: 'CEO, TechStart',
                        image: 'https://via.placeholder.com/100x100',
                        content: 'Working with this developer was an absolute pleasure. They delivered beyond our expectations and were professional throughout.',
                        rating: 5,
                        date: '2023',
                        linkedin: 'https://linkedin.com/in/sarah'
                    },
                    {
                        name: 'Michael Chen',
                        position: 'Project Manager, DevCorp',
                        image: 'https://via.placeholder.com/100x100',
                        content: 'Exceptional technical skills and great communication. Would definitely work with them again.',
                        rating: 5,
                        date: '2023',
                        linkedin: 'https://linkedin.com/in/michael'
                    }
                ],
                layout: 'grid', // grid, carousel, masonry
                showRatings: true,
                showImages: true,
                autoplay: false,
                autoplaySpeed: 5000
            }
        };
    }

    renderPreview(data) {
        const testimonials = data.testimonials || [];
        const layout = data.layout || 'grid';
        const showRatings = data.showRatings !== false;
        const showImages = data.showImages !== false;

        if (testimonials.length === 0) return '';

        const testimonialsHtml = testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <i class="fas fa-quote-left quote-icon"></i>
                    <p class="testimonial-text">${testimonial.content}</p>
                </div>
                
                <div class="testimonial-footer">
                    ${showImages && testimonial.image ? `
                        <img src="${testimonial.image}" alt="${testimonial.name}" class="testimonial-image">
                    ` : ''}
                    
                    <div class="testimonial-info">
                        <h4 class="testimonial-name">${testimonial.name}</h4>
                        <p class="testimonial-position">${testimonial.position}</p>
                        
                        ${showRatings && testimonial.rating ? `
                            <div class="testimonial-rating">
                                ${Array(5).fill().map((_, i) => `
                                    <i class="fas fa-star ${i < testimonial.rating ? 'filled' : ''}"></i>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${testimonial.date ? `
                            <span class="testimonial-date">${testimonial.date}</span>
                        ` : ''}
                    </div>
                    
                    ${testimonial.linkedin ? `
                        <a href="${testimonial.linkedin}" target="_blank" class="testimonial-linkedin">
                            <i class="fab fa-linkedin"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');

        let containerClass = 'testimonials-grid';
        if (layout === 'carousel') {
            containerClass = 'testimonials-carousel';
        } else if (layout === 'masonry') {
            containerClass = 'testimonials-masonry';
        }

        return `
            <section id="testimonials" class="testimonials-section">
                <div class="container">
                    <div class="section-header">
                        <h2>${data.title || 'Client Testimonials'}</h2>
                        <div class="divider"></div>
                    </div>
                    
                    <div class="${containerClass}">
                        ${testimonialsHtml}
                    </div>
                    
                    ${layout === 'carousel' && data.autoplay ? `
                        <div class="carousel-controls">
                            <button class="carousel-prev"><i class="fas fa-chevron-left"></i></button>
                            <button class="carousel-next"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    ` : ''}
                </div>
            </section>
        `;
    }
}