// Supabase Configuration
const ADMIN_SUPABASE_URL = 'https://dvvvpfsnwnkrwhiphvcm.supabase.co';
const ADMIN_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dnZwZnNud25rcndoaXBodmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzU4MjAsImV4cCI6MjA5MjI1MTgyMH0.ZoZ2KMfWlymBE0MxM17Rqy0JJ3oCZ-vK_OF7MzQPtzs';

// Initialize Supabase client
window.supabaseClient = window.supabase.createClient(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_ANON_KEY);

// Default admin credentials stored in localStorage
const DEFAULT_ADMIN = {
    email: 'admin@croptop.com',
    password: 'admin123',
    full_name: 'System Administrator',
    username: 'admin',
    role: 'super_admin'
};

// Initialize default admin in localStorage
function initializeDefaultAdmin() {
    const storedAdmin = localStorage.getItem('default_admin');
    if (!storedAdmin) {
        localStorage.setItem('default_admin', JSON.stringify(DEFAULT_ADMIN));
    }
}

// Admin Login functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultAdmin();
    const adminForm = document.getElementById('adminLoginForm');
    
    if (adminForm) {
        checkExistingSession();
        handleAdminLogin(adminForm);
    }
});

async function checkExistingSession() {
    try {
        // Check localStorage session first
        const localSession = localStorage.getItem('admin_session');
        if (localSession) {
            const session = JSON.parse(localSession);
            if (session.expires_at && new Date(session.expires_at) > new Date()) {
                window.location.href = './admin-dashboard-modular.html';
                return;
            }
        }

        // Check Supabase session
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (session) {
            // Verify user is an admin
            const { data: adminData, error } = await window.supabaseClient
                .from('app_3704573dd8_admins')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single();
            
            if (adminData && !error) {
                // Store session info
                const sessionData = {
                    admin_id: adminData.id,
                    email: adminData.email,
                    full_name: adminData.full_name,
                    role: adminData.role,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                window.location.href = './admin-dashboard-modular.html';
            }
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

function handleAdminLogin(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const loginButton = form.querySelector('button[type="submit"]');
        
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';
        }
        
        try {
            // First check local admin credentials
            const storedAdmin = localStorage.getItem('default_admin');
            const adminCreds = storedAdmin ? JSON.parse(storedAdmin) : DEFAULT_ADMIN;
            
            // Try local credentials first
            if (email === adminCreds.email && password === adminCreds.password) {
                // Create local session
                const sessionData = {
                    admin_id: 'local-admin',
                    email: adminCreds.email,
                    full_name: adminCreds.full_name,
                    role: adminCreds.role,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                window.location.href = './admin-dashboard-modular.html';
                return;
            }
            
            // Try Supabase Auth
            const { data: authData, error: authError } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (authError) throw authError;
            
            if (authData && authData.user) {
                // Verify user is an admin in our database
                const { data: adminData, error } = await window.supabaseClient
                    .from('app_3704573dd8_admins')
                    .select('*')
                    .eq('email', email)
                    .eq('is_active', true)
                    .single();
                
                if (error || !adminData) {
                    // Sign out if not an admin
                    await window.supabaseClient.auth.signOut();
                    throw new Error('Access denied. You are not registered as an admin.');
                }
                
                // Store session info
                const sessionData = {
                    admin_id: adminData.id,
                    email: adminData.email,
                    full_name: adminData.full_name,
                    role: adminData.role,
                    user_id: authData.user.id,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                window.location.href = './admin-dashboard-modular.html';
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        }
    });
}

// Logout function
async function adminLogout() {
    try {
        await window.supabaseClient.auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('admin_session');
    window.location.href = './admin-login.html';
}

// Check if user is admin
function isAdmin() {
    const session = localStorage.getItem('admin_session');
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        if (sessionData.expires_at && new Date(sessionData.expires_at) > new Date()) {
            return true;
        }
    } catch (e) {
        return false;
    }
    
    return false;
}