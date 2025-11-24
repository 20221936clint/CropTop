// Mobile Menu Functionality for User Dashboard

class UserMobileMenu {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleBtn = null;
        this.overlay = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createToggleButton();
        this.createOverlay();
        this.setupEventListeners();
        this.handleResize();
    }

    createToggleButton() {
        // Check if button already exists
        if (document.querySelector('.mobile-menu-toggle')) {
            this.toggleBtn = document.querySelector('.mobile-menu-toggle');
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'mobile-menu-toggle';
        btn.setAttribute('aria-label', 'Toggle menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        document.body.appendChild(btn);
        this.toggleBtn = btn;
    }

    createOverlay() {
        // Check if overlay already exists
        if (document.querySelector('.mobile-overlay')) {
            this.overlay = document.querySelector('.mobile-overlay');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    setupEventListeners() {
        // Toggle button click
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Overlay click
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // Close menu when clicking nav items
        const navItems = this.sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    this.close();
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Prevent body scroll when menu is open
        this.sidebar.addEventListener('touchmove', (e) => {
            if (this.isOpen) {
                e.stopPropagation();
            }
        }, { passive: false });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.sidebar.classList.add('mobile-open');
        this.overlay.classList.add('active');
        this.toggleBtn.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Change icon to X
        this.toggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
    }

    close() {
        this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('active');
        this.toggleBtn.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        // Change icon back to hamburger
        this.toggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
    }

    handleResize() {
        if (window.innerWidth > 992 && this.isOpen) {
            this.close();
        }
    }
}

// Initialize mobile menu when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UserMobileMenu();
    });
} else {
    new UserMobileMenu();
}

// Export for use in other scripts
export default UserMobileMenu;