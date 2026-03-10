export class ContactSection {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    getDefaultData() {
        return {
            type: 'contact',
            title: 'Get In Touch',
            visible: true,
            data: {
                email: '',
                phone: '',
                location: '',
                formEnabled: true,
                mapEnabled: false,
                mapLocation: '',
                socialEnabled: true,
                contactInfo: [
                    { type: 'email', value: '', icon: 'envelope' },
                    { type: 'phone', value: '', icon: 'phone' },
                    { type: 'location', value: '', icon: 'map-marker-alt' }
                ],
                formFields: [
                    { name: 'name', label: 'Name', type: 'text', required: true },
                    { name: 'email', label: 'Email', type: 'email', required: true },
                    { name: 'message', label: 'Message', type: 'textarea', required: true }
                ]
            }
        };
    }

    renderPreview(data) {
        const personal = this.stateManager.get('portfolio.personal');
        const social = this.stateManager.get('portfolio.social');
        const contactInfo = data.contactInfo || [
            { type: 'email', value: personal.email, icon: 'envelope' },
            { type: 'phone', value: personal.phone, icon: 'phone' },
            { type: 'location', value: personal.location, icon: 'map-marker-alt' }
        ];
        const formEnabled = data.formEnabled !== false;
        const mapEnabled = data.mapEnabled || false;
        const socialEnabled = data.socialEnabled !== false;
        const formFields = data.formFields || this.getDefaultData().data.formFields;

        return `
            <section id="contact" class="contact-section">
                <div class="container">
                    <div class="section-header">
                        <h2>${data.title || 'Get In Touch'}</h2>
                        <div class="divider"></div>
                    </div>

                    <div class="contact-wrapper ${mapEnabled ? 'with-map' : ''}">
                        <div class="contact-info">
                            <h3>Contact Information</h3>
                            <div class="info-items">
                                ${contactInfo.map(info => `
                                    <div class="info-item">
                                        <i class="fas fa-${info.icon}"></i>
                                        <div>
                                            <h4>${info.type.charAt(0).toUpperCase() + info.type.slice(1)}</h4>
                                            <p>${info.value}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            ${socialEnabled ? `
                                <div class="social-links">
                                    <h4>Follow Me</h4>
                                    <div class="social-icons">
                                        ${Object.entries(social).filter(([_, url]) => url).map(([platform, url]) => `
                                            <a href="${url}" target="_blank" class="social-icon">
                                                <i class="fab fa-${platform}"></i>
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        ${formEnabled ? `
                            <div class="contact-form">
                                <h3>Send a Message</h3>
                                <form id="contactForm" onsubmit="return false;">
                                    ${formFields.map(field => `
                                        <div class="form-group">
                                            <label for="${field.name}">${field.label}</label>
                                            ${field.type === 'textarea' 
                                                ? `<textarea id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}></textarea>`
                                                : `<input type="${field.type}" id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>`
                                            }
                                        </div>
                                    `).join('')}
                                    <button type="submit" class="btn btn-primary">Send Message</button>
                                </form>
                            </div>
                        ` : ''}
                    </div>

                    ${mapEnabled ? `
                        <div class="map-container">
                            <iframe 
                                src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(data.mapLocation || personal.location || '')}"
                                width="100%"
                                height="400"
                                style="border:0;"
                                allowfullscreen=""
                                loading="lazy">
                            </iframe>
                        </div>
                    ` : ''}
                </div>
            </section>
        `;
    }
}