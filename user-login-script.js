// Wait for Supabase to load
(function() {
    // Check if Supabase is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded!');
        alert('Error: Unable to load authentication library. Please refresh the page.');
        return;
    }

    // Supabase Configuration
    const SUPABASE_URL = 'https://isjmawdwipxcpcrgjnjp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzam1hd2R3aXB4Y3BjcmdqbmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDcyNTQsImV4cCI6MjA3ODUyMzI1NH0.iuZZQhQ6Lp9BC15UAo3dW1D8RNdOHQ4jHldIau0X2K0';

    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // User Login functionality (NO Supabase Auth - Direct DB lookup)
    document.addEventListener('DOMContentLoaded', function() {
        const userForm = document.getElementById('userLoginForm');
        
        if (userForm) {
            checkExistingUserSession();
            handleUserLogin(userForm);
        }
    });

    async function checkExistingUserSession() {
        try {
            const userSession = localStorage.getItem('user_session');
            if (userSession) {
                const session = JSON.parse(userSession);
                if (session.expires_at && new Date(session.expires_at) > new Date()) {
                    window.location.href = './user-dashboard.html';
                }
            }
        } catch (error) {
            console.error('Session check error:', error);
        }
    }

    function handleUserLogin(form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = form.querySelector('.login-button');
            const usernameInput = document.getElementById('userUsername');
            const passwordInput = document.getElementById('userPassword');
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            // Remove any existing messages
            removeMessages(form);
            
            // Validate inputs
            if (!username || !password) {
                showErrorMessage(form, 'Please enter both username/email and password.');
                return;
            }
            
            // Add loading state
            button.classList.add('loading');
            button.disabled = true;
            const originalButtonText = button.innerHTML;
            button.innerHTML = '<svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Authenticating...';
            
            try {
                // Query user from database (no Supabase Auth)
                const { data: users, error } = await supabase
                    .from('app_3704573dd8_users')
                    .select('*')
                    .or(`email.eq.${username},username.eq.${username}`)
                    .eq('status', 'active')
                    .limit(1);
                
                if (error) {
                    throw new Error('Database error: ' + error.message);
                }
                
                if (!users || users.length === 0) {
                    throw new Error('Invalid username or email.');
                }
                
                const user = users[0];
                
                // Simple password verification (in production, use bcrypt.compare)
                // For now, we'll do a simple string comparison
                // TODO: Implement proper password hashing with bcrypt
                if (user.password !== password) {
                    throw new Error('Invalid password.');
                }
                
                // Check if user is blocked
                if (user.status === 'blocked') {
                    throw new Error('Your account has been blocked. Please contact administrator.');
                }
                
                // Create user session
                const sessionData = {
                    user_id: user.id,
                    email: user.email,
                    username: user.username,
                    full_name: user.full_name,
                    farm_name: user.farm_name,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('user_session', JSON.stringify(sessionData));
                
                showSuccessMessage(form, `Welcome back, ${user.full_name}! Redirecting to dashboard...`);
                
                setTimeout(() => {
                    window.location.href = './user-dashboard.html';
                }, 1500);
                
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
})();