// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeDropdown();
    initializeNavigation();
    initializeAccountsSubmenu();
    loadDashboardOverview();
    initializeFertilizerDistributionTable();
    
    // Setup feedback navigation
    setupFeedbackNavigation();
});

function setupFeedbackNavigation() {
    const feedbackNav = document.querySelector('.nav-item[data-section="feedback"]');
    if (feedbackNav) {
        feedbackNav.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to feedback nav
            this.classList.add('active');
            
            // Update page title
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = 'User Feedback';
            }
            
            // Load admin feedback section
            if (typeof window.initializeAdminFeedback === 'function') {
                window.initializeAdminFeedback();
            }
        });
    }
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

// Load subsection content
function loadSubsection(subsection) {
    const pageTitle = document.getElementById('pageTitle');
    
    switch(subsection) {
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