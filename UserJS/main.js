// Main entry point - imports and initializes all modules
import { checkUserSession } from './session.js';
import { initializeNavigation, initializeDropdown } from './navigation.js';
import { loadOverview } from './overview.js';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loading...');
    
    // Check user session
    const sessionValid = checkUserSession();
    
    if (sessionValid) {
        // Initialize navigation and dropdown after session is confirmed
        initializeNavigation();
        initializeDropdown();
        
        // Load overview by default
        loadOverview();
    }
});