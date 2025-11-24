// Supabase Configuration
const SUPABASE_URL = 'https://isjmawdwipxcpcrgjnjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzam1hd2R3aXB4Y3BjcmdqbmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDcyNTQsImV4cCI6MjA3ODUyMzI1NH0.iuZZQhQ6Lp9BC15UAo3dW1D8RNdOHQ4jHldIau0X2K0';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // Verify user is an admin
            const { data: adminData, error } = await supabase
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
        
        const button = form.querySelector('.login-button');
        const emailInput = document.getElementById('adminEmail');
        const passwordInput = document.getElementById('adminPassword');
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Remove any existing messages
        removeMessages(form);
        
        // Validate inputs
        if (!email || !password) {
            showErrorMessage(form, 'Please enter both email and password.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage(form, 'Please enter a valid email address.');
            return;
        }
        
        // Add loading state
        button.classList.add('loading');
        button.disabled = true;
        const originalButtonText = button.innerHTML;
        button.innerHTML = '<svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Authenticating...';
        
        try {
            // Check if it's the default admin (localStorage)
            const defaultAdmin = JSON.parse(localStorage.getItem('default_admin'));
            
            if (email === defaultAdmin.email && password === defaultAdmin.password) {
                // Default admin login via localStorage
                const sessionData = {
                    admin_id: 'default',
                    email: defaultAdmin.email,
                    full_name: defaultAdmin.full_name,
                    username: defaultAdmin.username,
                    role: defaultAdmin.role,
                    is_default: true,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                
                showSuccessMessage(form, `Welcome back, ${defaultAdmin.full_name}! Redirecting to dashboard...`);
                
                setTimeout(() => {
                    window.location.href = './admin-dashboard-modular.html';
                }, 1500);
                
            } else {
                // Try Supabase authentication for other admins
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (authError) {
                    throw new Error(authError.message);
                }
                
                // Verify user is an admin
                const { data: adminData, error: adminError } = await supabase
                    .from('app_3704573dd8_admins')
                    .select('*')
                    .eq('user_id', authData.user.id)
                    .eq('is_active', true)
                    .single();
                
                if (adminError || !adminData) {
                    // Not an admin, sign out
                    await supabase.auth.signOut();
                    throw new Error('Access denied. This account does not have admin privileges.');
                }
                
                // Store admin session
                const sessionData = {
                    admin_id: adminData.id,
                    email: adminData.email,
                    full_name: adminData.full_name,
                    username: adminData.username,
                    role: adminData.role,
                    is_default: false,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('admin_session', JSON.stringify(sessionData));
                
                showSuccessMessage(form, `Welcome back, ${adminData.full_name || 'Admin'}! Redirecting to dashboard...`);
                
                setTimeout(() => {
                    window.location.href = './admin-dashboard-modular.html';
                }, 1500);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showErrorMessage(form, error.message || 'Invalid credentials. Please try again.');
            button.classList.remove('loading');
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    });
    
    // Add real-time input validation
    addInputValidation();
}

function addInputValidation() {
    const inputs = document.querySelectorAll('.input-group input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#2ecc71';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#3498db';
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#e0e0e0';
            }
        });
    });
}

function showErrorMessage(form, message) {
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
    `;
    form.appendChild(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

function showSuccessMessage(form, message) {
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message}</span>
    `;
    form.appendChild(successDiv);
}

function removeMessages(form) {
    const errorMsg = form.querySelector('.error-message');
    const successMsg = form.querySelector('.success-message');
    
    if (errorMsg) errorMsg.remove();
    if (successMsg) successMsg.remove();
}