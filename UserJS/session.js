// Session management module
import { supabase } from './config.js';

// Global user session
let currentUser = null;

// Check user session
function checkUserSession() {
    try {
        const userSession = localStorage.getItem('user_session');
        console.log('User session from localStorage:', userSession);
        
        if (!userSession) {
            console.log('No session found, redirecting to login...');
            setTimeout(() => {
                window.location.href = './user-login.html';
            }, 100);
            return;
        }
        
        const session = JSON.parse(userSession);
        console.log('Parsed session:', session);
        
        // Check if session is expired
        if (session.expires_at && new Date(session.expires_at) < new Date()) {
            console.log('Session expired, redirecting to login...');
            localStorage.removeItem('user_session');
            setTimeout(() => {
                window.location.href = './user-login.html';
            }, 100);
            return;
        }
        
        currentUser = session;
        console.log('Current user set:', currentUser);
        
        // Update UI with user info
        const userNameElement = document.getElementById('userName');
        const headerUserNameElement = document.getElementById('headerUserName');
        
        if (userNameElement) {
            userNameElement.textContent = session.username || session.full_name || 'User';
        }
        if (headerUserNameElement) {
            headerUserNameElement.textContent = session.username || session.full_name || 'User';
        }
        
        return true;
        
    } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('user_session');
        setTimeout(() => {
            window.location.href = './user-login.html';
        }, 100);
        return false;
    }
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

export { checkUserSession, getCurrentUser };