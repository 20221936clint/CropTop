// Utilities module
import { loadOverview } from './overview.js';
import { loadMyCrops } from './crops.js';
import { loadEquipmentRentals } from './equipment.js';
import { loadMembership } from './fertilizer.js';
import { loadMembershipFee } from './membership.js';
import { loadAnnouncements, loadProfile } from './profile.js';
import { initializeFeedbackSection } from './feedback.js';

// Load section content
function loadSection(section) {
    switch(section) {
        case 'overview':
            loadOverview();
            break;
        case 'my-crops':
            loadMyCrops();
            break;
        case 'equipment-rentals':
            loadEquipmentRentals();
            break;
        case 'membership':
            loadMembership();
            break;
        case 'membership-fee':
            loadMembershipFee();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'feedback':
            initializeFeedbackSection();
            break;
        case 'profile':
            loadProfile();
            break;
        default:
            loadOverview();
    }
}

// Make loadSection available globally
window.loadSection = loadSection;

// Show notification
export function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : 
                  type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' :
                  '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const addCropModal = document.getElementById('addCropModal');
    const requestEquipmentModal = document.getElementById('requestEquipmentModal');
    const rescheduleModal = document.getElementById('rescheduleModal');
    
    if (event.target === addCropModal) {
        window.closeAddCropModal();
    }
    if (event.target === requestEquipmentModal) {
        window.closeRequestEquipmentModal();
    }
    if (event.target === rescheduleModal) {
        window.closeRescheduleModal();
    }
};

export { loadSection };