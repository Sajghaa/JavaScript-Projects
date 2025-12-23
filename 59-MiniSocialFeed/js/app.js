const App = (function(State, UI) {
    // Initialize application
    const init = () => {
        console.log('Initializing VibeSpace...');
        
        // Initialize state
        State.init();
        
        // Initialize UI
        UI.init();
        
        // Subscribe to state changes
        UI.subscribeToState();
        
        // Initial render
        UI.updateUI();
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        console.log('VibeSpace ready!');
    };

    // Setup keyboard shortcuts
    const setupKeyboardShortcuts = () => {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit post
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement.id === 'postInput') {
                    document.getElementById('submitPost')?.click();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
            
            // '/' to focus search
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                document.querySelector('.search-input')?.focus();
            }
        });
    };

    // Handle service worker for PWA (optional)
    const setupServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('ServiceWorker registration successful:', registration);
                    },
                    (error) => {
                        console.log('ServiceWorker registration failed:', error);
                    }
                );
            });
        }
    };

    // Public API
    return {
        init,
        setupServiceWorker
    };
})(State, UI);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    // Add some animations for fun
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Add some CSS animations for page load
document.head.insertAdjacentHTML('beforeend', `
    <style>
        body:not(.loaded) * {
            animation-play-state: paused !important;
        }
        
        .app-container {
            opacity: 0;
            animation: fadeIn 0.5s ease forwards;
            animation-delay: 0.3s;
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        .sidebar {
            transform: translateX(-20px);
            animation: slideInLeft 0.5s ease forwards;
            animation-delay: 0.5s;
        }
        
        @keyframes slideInLeft {
            to { transform: translateX(0); }
        }
        
        .main-content {
            transform: translateY(20px);
            animation: slideInUp 0.5s ease forwards;
            animation-delay: 0.7s;
        }
        
        @keyframes slideInUp {
            to { transform: translateY(0); }
        }
        
        .right-sidebar {
            transform: translateX(20px);
            animation: slideInRight 0.5s ease forwards;
            animation-delay: 0.9s;
        }
        
        @keyframes slideInRight {
            to { transform: translateX(0); }
        }
    </style>
`);