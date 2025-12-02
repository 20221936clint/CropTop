// Supabase Configuration
const SUPABASE_URL = 'https://isjmawdwipxcpcrgjnjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzam1hd2R3aXB4Y3BjcmdqbmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDcyNTQsImV4cCI6MjA3ODUyMzI1NH0.iuZZQhQ6Lp9BC15UAo3dW1D8RNdOHQ4jHldIau0X2K0';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current admin session
let currentAdmin = null;

// Notification System
function showNotification(title, message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    
    let iconSVG = '';
    if (type === 'success') {
        iconSVG = '<svg class="notification-icon success" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'error') {
        iconSVG = '<svg class="notification-icon error" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else if (type === 'warning') {
        iconSVG = '<svg class="notification-icon warning" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    }
    
    notification.innerHTML = `
        ${iconSVG}
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Check if user is authenticated as admin
async function checkAuthentication() {
    try {
        const adminSession = localStorage.getItem('admin_session');
        
        if (!adminSession) {
            window.location.href = './admin-login.html';
            return;
        }
        
        const session = JSON.parse(adminSession);
        
        // Check if session expired
        if (new Date(session.expires_at) < new Date()) {
            localStorage.removeItem('admin_session');
            window.location.href = './admin-login.html';
            return;
        }
        
        currentAdmin = session;
        
        // Update admin name in header
        const adminNameElement = document.querySelector('.admin-name');
        if (adminNameElement) {
            adminNameElement.textContent = session.full_name || 'Admin';
        }
        
    } catch (error) {
        console.error('Authentication check error:', error);
        window.location.href = './admin-login.html';
    }
}

// Initialize dropdown menu
function initializeDropdown() {
    const profileBtn = document.getElementById('adminProfileBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!profileBtn || !dropdownMenu || !logoutBtn) return;
    
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', function(e) {
        if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        await handleLogout();
    });
}

// Handle logout functionality
async function handleLogout() {
    try {
        const logoutBtn = document.getElementById('logoutBtn');
        const originalContent = logoutBtn.innerHTML;
        logoutBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg><span>Logging out...</span>';
        logoutBtn.disabled = true;
        
        // Check if it's a Supabase authenticated admin
        if (currentAdmin && !currentAdmin.is_default) {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        }
        
        // Clear localStorage
        localStorage.removeItem('admin_session');
        window.location.href = './admin-login.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
        
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg><span>Logout</span>';
        logoutBtn.disabled = false;
    }
}

// Initialize Accounts submenu
function initializeAccountsSubmenu() {
    const accountsNav = document.getElementById('accountsNav');
    const accountsSubmenu = document.getElementById('accountsSubmenu');
    
    if (!accountsNav || !accountsSubmenu) return;
    
    accountsNav.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.toggle('open');
        accountsSubmenu.classList.toggle('open');
    });
    
    const submenuItems = accountsSubmenu.querySelectorAll('.submenu-item');
    submenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            submenuItems.forEach(si => si.classList.remove('active'));
            this.classList.add('active');
            
            const subsection = this.getAttribute('data-subsection');
            loadSubsection(subsection);
        });
    });
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item:not(.has-submenu)');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.getAttribute('data-section');
            loadSection(section);
        });
    });
}

// Load section content
function loadSection(section) {
    const pageTitle = document.getElementById('pageTitle');
    
    switch(section) {
        case 'overview':
            pageTitle.textContent = 'Dashboard Overview';
            loadDashboardOverview();
            break;
        case 'crops':
            pageTitle.textContent = 'User Crops Management';
            loadUserCrops();
            break;
        case 'equipment':
            pageTitle.textContent = 'Equipment Management';
            loadEquipmentManagement();
            break;
        case 'fertilizer':
            pageTitle.textContent = 'Fertilizer Distribution';
            loadFertilizerDistribution();
            break;
        case 'fertilizer-distribution':
            pageTitle.textContent = 'Fertilizer Distribution';
            loadFertilizerDistribution();
            break;
        case 'equipment-rentals':
            pageTitle.textContent = 'Equipment Rentals Management';
            loadEquipmentRentals();
            break;
        case 'member-rentals':
            pageTitle.textContent = 'Member Equipment Rentals';
            loadMemberRentals();
            break;
        case 'announcements':
            pageTitle.textContent = 'Announcements Management';
            loadAnnouncementsSection();
            break;
        case 'non-member-rentals':
            pageTitle.textContent = 'Non-Member Rentals Management';
            loadNonMemberRentals();
            break;
        case 'membership-fee':
            pageTitle.textContent = 'Membership Fee Management';
            loadMembershipFeeManagement();
            break;
        case 'feedback':
            pageTitle.textContent = 'User Feedback Management';
            initializeAdminFeedback();
            break;
        case 'reports':
            pageTitle.textContent = 'Reports';
            loadReportsSection();
            break;
        case 'analytics':
            pageTitle.textContent = 'Analytics';
            loadAnalyticsSection();
            break;
        default:
            console.log('Section not implemented:', section);
    }
}

// Load subsection content
function loadSubsection(subsection) {
    const pageTitle = document.getElementById('pageTitle');
    
    switch(subsection) {
        case 'view-all-users':
            pageTitle.textContent = 'User Management';
            loadViewAllUsers();
            break;
        case 'create-user':
            pageTitle.textContent = 'Create New User';
            loadCreateUserForm();
            break;
        case 'create-admin':
            pageTitle.textContent = 'Admin Management';
            loadCreateAdminForm();
            break;
        case 'member-list':
            pageTitle.textContent = 'Member List';
            loadMemberList();
            break;
        default:
            console.log('Subsection not implemented:', subsection);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const userModal = document.getElementById('userDetailsModal');
    const addEquipmentModal = document.getElementById('addEquipmentModal');
    const editEquipmentModal = document.getElementById('editEquipmentModal');
    const addDistributionModal = document.getElementById('addDistributionModal');
    const addAnnouncementModal = document.getElementById('addAnnouncementModal');
    const editAnnouncementModal = document.getElementById('editAnnouncementModal');
    const editNonMemberGuidelinesModal = document.getElementById('editNonMemberGuidelinesModal');
    const addNonMemberRentalModal = document.getElementById('addNonMemberRentalModal');
    const editMembershipFeeModal = document.getElementById('editMembershipFeeModal');
    const editMembershipStatusModal = document.getElementById('editMembershipStatusModal');
    
    if (event.target === userModal) {
        userModal.style.display = 'none';
    }
    if (event.target === addEquipmentModal) {
        addEquipmentModal.style.display = 'none';
    }
    if (event.target === editEquipmentModal) {
        editEquipmentModal.style.display = 'none';
    }
    if (event.target === addDistributionModal) {
        addDistributionModal.style.display = 'none';
    }
    if (event.target === addAnnouncementModal) {
        closeAddAnnouncementModal();
    }
    if (event.target === editAnnouncementModal) {
        closeEditAnnouncementModal();
    }
    if (event.target === editNonMemberGuidelinesModal) {
        closeEditNonMemberGuidelinesModal();
    }
    if (event.target === addNonMemberRentalModal) {
        closeAddNonMemberRentalModal();
    }
    if (event.target === editMembershipFeeModal) {
        closeEditMembershipFeeModal();
    }
    if (event.target === editMembershipStatusModal) {
        closeEditMembershipStatusModal();
    }
};