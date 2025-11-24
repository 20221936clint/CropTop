// Supabase Configuration
const SUPABASE_URL = 'https://isjmawdwipxcpcrgjnjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzam1hd2R3aXB4Y3BjcmdqbmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDcyNTQsImV4cCI6MjA3ODUyMzI1NH0.iuZZQhQ6Lp9BC15UAo3dW1D8RNdOHQ4jHldIau0X2K0';

let supabaseClient = null;

// Initialize Supabase with your project credentials
function initializeSupabase() {
    // Check if Supabase library is available
    if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized successfully');
            return supabaseClient;
        } catch (error) {
            console.error('Error initializing Supabase:', error);
            return null;
        }
    } else {
        console.warn('Supabase library not loaded yet');
        return null;
    }
}

// Mobile Menu Toggle
class MobileMenu {
    constructor() {
        this.menuToggle = null;
        this.nav = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        // Create mobile menu toggle button
        this.createToggleButton();
        this.nav = document.querySelector('.nav');
        this.setupEventListeners();
    }

    createToggleButton() {
        const headerContent = document.querySelector('.header-content');
        const logo = document.querySelector('.logo');
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle menu');
        toggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        
        headerContent.insertBefore(toggleBtn, logo);
        this.menuToggle = toggleBtn;
    }

    setupEventListeners() {
        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Close menu when clicking nav links
        this.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.close();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.nav.contains(e.target) && 
                !this.menuToggle.contains(e.target)) {
                this.close();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.nav.classList.add('active');
        this.menuToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.nav.classList.remove('active');
        this.menuToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        this.isOpen = false;
        document.body.style.overflow = '';
    }
}

// Carousel functionality
class Carousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.autoPlayInterval = null;
        this.slidesContainer = document.getElementById('carouselSlides');
        this.indicatorsContainer = document.getElementById('carouselIndicators');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        this.init();
    }

    async init() {
        await this.loadSlides();
        this.setupEventListeners();
        this.startAutoPlay();
    }

    async loadSlides() {
        // Try to load from Supabase first
        const supabaseSlides = await this.loadFromSupabase();
        
        if (supabaseSlides && supabaseSlides.length > 0) {
            this.slides = supabaseSlides;
            console.log('Loaded carousel images from Supabase:', this.slides);
        } else {
            // Fallback to default slides with corrected paths
            this.slides = [
                {
                    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=600&fit=crop',
                    title: 'Grow Smart. Harvest Better.',
                    description: 'Track crops, forecast yields, and cooperative operations in one comprehensive system designed for modern agriculture.',
                    primaryCTA: 'Get Started',
                    secondaryCTA: 'Learn More'
                },
                {
                    image: '/images/AgricultureManagement.jpg',
                    title: 'Comprehensive Agricultural Management',
                    description: 'Everything you need to manage your agricultural cooperative efficiently with modern technology and data-driven insights.',
                    primaryCTA: 'Explore Features',
                    secondaryCTA: 'Watch Demo'
                },
                {
                    image: 'https://hglvjxnyiazwdgotrfia.supabase.co/storage/v1/object/sign/Images/empowering.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81OGYzZTdlZC04NTkzLTRiNGYtOWJhZS00NzYxN2E1MzNjOGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZW1wb3dlcmluZy5hdmlmIiwiaWF0IjoxNzYyODY1NjcwLCJleHAiOjE3OTQ0MDE2NzB9.pTyPz311aANmFTzcL58uebxpQVkl3n3kOFiMLWitKqE',
                    title: 'Empower Your Cooperative',
                    description: 'Join our fellow farmers using CropTop to improve the management of crops, rentals of equipment, and maximize yields.',
                    primaryCTA: 'Join Now',
                    secondaryCTA: 'Contact Us'
                }
            ];
            console.log('Using fallback carousel images');
        }

        this.renderSlides();
        this.renderIndicators();
    }

    async loadFromSupabase() {
        if (!supabaseClient) {
            console.log('Supabase client not available');
            return null;
        }

        try {
            // Query carousel_images table
            const { data, error } = await supabaseClient
                .from('carousel_images')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) {
                console.error('Error loading carousel images from Supabase:', error);
                return null;
            }

            if (!data || data.length === 0) {
                console.log('No carousel images found in Supabase');
                return null;
            }

            return data.map(item => ({
                image: item.image_url,
                title: item.title || 'Grow Smart. Harvest Better.',
                description: item.description || 'Track crops, forecast yields, and streamline operations.',
                primaryCTA: item.primary_cta || 'Get Started',
                secondaryCTA: item.secondary_cta || 'Learn More'
            }));
        } catch (error) {
            console.error('Supabase error:', error);
            return null;
        }
    }

    renderSlides() {
        this.slidesContainer.innerHTML = this.slides.map((slide, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <img src="${slide.image}" alt="Slide ${index + 1}" onerror="this.src='https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=600&fit=crop'">
                <div class="carousel-content">
                    <h1>${slide.title}</h1>
                    <p>${slide.description}</p>
                    <div class="carousel-buttons">
                        <a href="#get-started" class="carousel-cta primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                            ${slide.primaryCTA}
                        </a>
                        <a href="#learn-more" class="carousel-cta secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="10 8 16 12 10 16 10 8"></polygon>
                            </svg>
                            ${slide.secondaryCTA}
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderIndicators() {
        this.indicatorsContainer.innerHTML = this.slides.map((_, index) => `
            <div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
        `).join('');

        // Add click listeners to indicators
        this.indicatorsContainer.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Pause autoplay on hover
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
        carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());

        // Touch support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) {
                this.nextSlide();
            }
            if (touchEndX > touchStartX + 50) {
                this.prevSlide();
            }
        };

        this.handleSwipe = handleSwipe;
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateCarousel();
    }

    updateCarousel() {
        const offset = -this.currentSlide * 100;
        this.slidesContainer.style.transform = `translateX(${offset}%)`;

        // Update indicators
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        // Auto-advance every 2 seconds as requested
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 2000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Login Dropdown functionality
class LoginDropdown {
    constructor() {
        this.loginBtn = document.getElementById('loginBtn');
        this.loginDropdown = document.getElementById('loginDropdown');
        this.init();
    }

    init() {
        this.loginBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.loginDropdown.contains(e.target) && !this.loginBtn.contains(e.target)) {
                this.close();
            }
        });
    }

    toggle() {
        const isActive = this.loginDropdown.classList.contains('active');
        if (isActive) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.loginDropdown.classList.add('active');
        this.loginBtn.classList.add('active');
    }

    close() {
        this.loginDropdown.classList.remove('active');
        this.loginBtn.classList.remove('active');
    }
}

// Scroll to Top functionality
class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scrollToTopBtn');
        this.init();
    }

    init() {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });

        // Scroll to top when button is clicked
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#admin-login' || href === '#user-login') {
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase if available
    supabaseClient = initializeSupabase();
    
    // Initialize mobile menu
    new MobileMenu();
    
    // Initialize carousel
    new Carousel();
    
    // Initialize login dropdown
    new LoginDropdown();
    
    // Initialize scroll to top button
    new ScrollToTop();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    console.log('CropTop website initialized successfully!');
    
    // Log Supabase status
    if (supabaseClient) {
        console.log('✓ Supabase connected - carousel images will be loaded from database');
    } else {
        console.log('⚠ Supabase not connected - using fallback carousel images');
    }
});