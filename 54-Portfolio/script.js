document.addEventListener('DOMContentLoaded', function() {
    console.log(' Portfolio loading...');
    
    initNavigation();
    initTheme();
    initCounters();
    initTerminal();
    initContactForm();
    
    setTimeout(() => {
        document.body.classList.add('loaded');
        console.log('✨ Portfolio ready!');
    }, 100);
    
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle?.classList.remove('active');
            });
        });
        
        window.addEventListener('scroll', updateActiveNav);
    }
    
    function updateActiveNav() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollPos = window.scrollY + 100;
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        const storedTheme = localStorage.getItem('theme');
        const systemTheme = prefersDark.matches ? 'dark' : 'light';
        const currentTheme = storedTheme || systemTheme;
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        
       
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const newTheme = current === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }
    
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        if (!counters.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-count'));
                    animateCounter(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 20);
    }
    
    // Terminal typing effect
    function initTerminal() {
        const typingElement = document.querySelector('.typing .command');
        if (!typingElement) return;
        
        const commands = [
            'contact --open',
            'projects --list',
            'skills --show',
            'status --available'
        ];
        
        let commandIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentCommand = commands[commandIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentCommand.substring(0, charIndex - 1);
                charIndex--;
                
                if (charIndex === 0) {
                    isDeleting = false;
                    commandIndex = (commandIndex + 1) % commands.length;
                    setTimeout(type, 500);
                    return;
                }
            } else {
                typingElement.textContent = currentCommand.substring(0, charIndex + 1);
                charIndex++;
                
                if (charIndex === currentCommand.length) {
                    isDeleting = true;
                    setTimeout(type, 2000);
                    return;
                }
            }
            
            setTimeout(type, isDeleting ? 50 : 100);
        }
        
        setTimeout(type, 1000);
    }
    
    // Contact form
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Message sent successfully!');
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            }
        } else {
            navbar.style.background = '';
            navbar.style.boxShadow = '';
        }
    });
});