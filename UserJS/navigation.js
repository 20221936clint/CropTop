// Navigation module
import { loadSection } from './utilities.js';

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get section
            const section = this.getAttribute('data-section');
            
            // Load section content
            loadSection(section);
        });
    });
}

// Initialize dropdown
function initializeDropdown() {
    const profileBtn = document.getElementById('userProfileBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!profileBtn || !dropdownMenu || !logoutBtn) {
        console.error('Dropdown elements not found');
        return;
    }
    
    // Toggle dropdown
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user_session');
            window.location.href = './user-login.html';
        }
    });
}

export { initializeNavigation, initializeDropdown };