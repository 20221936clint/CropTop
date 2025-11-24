// Profile module
import { supabase } from './config.js';
import { getCurrentUser } from './session.js';

// Load Announcements
async function loadAnnouncements() {
    const container = document.getElementById('contentContainer');
    
    try {
        // Fetch announcements from database
        const { data: announcements, error } = await supabase
            .from('app_3704573dd8_announcements')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        container.innerHTML = `
            <div class="announcements-user-container">
                <div class="announcements-user-header">
                    <h2 class="section-header">Announcements</h2>
                    <button class="refresh-btn" onclick="loadSection('announcements')" style="padding: 0.5rem 1rem; background: #2196f3; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
                
                <div class="announcements-list">
                    ${announcements && announcements.length > 0 ? announcements.map(announcement => `
                        <div class="announcement-user-card priority-${announcement.priority}">
                            <div class="announcement-user-header">
                                <h3 class="announcement-user-title">${announcement.title}</h3>
                                <div class="announcement-user-badges">
                                    <span class="category-badge ${announcement.category}">${announcement.category}</span>
                                    <span class="priority-badge ${announcement.priority}">${announcement.priority}</span>
                                </div>
                            </div>
                            <div class="announcement-user-message">${announcement.message}</div>
                            <div class="announcement-user-footer">
                                <div class="announcement-user-date">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    ${new Date(announcement.created_at).toLocaleString()}
                                </div>
                                <div class="announcement-user-author">By: ${announcement.admin_name || 'Admin'}</div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="no-announcements">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #bbb; margin-bottom: 1rem;">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <p style="color: #666; font-size: 1.1rem;">No announcements at this time</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = `
            <div class="activity-section">
                <h2 class="section-header">Announcements</h2>
                <div class="error">Error loading announcements. Please try again later.</div>
            </div>
        `;
    }
}

// Load Feedback
function loadFeedback() {
    const container = document.getElementById('contentContainer');
    container.innerHTML = `
        <div class="activity-section">
            <h2 class="section-header">Feedback</h2>
            <div class="no-activity">Feedback form will be available here.</div>
        </div>
    `;
}

// Load Profile with Update Form
async function loadProfile() {
    const container = document.getElementById('contentContainer');
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="activity-section">
                <h2 class="section-header">Profile Information</h2>
                <div class="error">Unable to load user information. Please log in again.</div>
            </div>
        `;
        return;
    }

    // Use user_id instead of id (matching the login script's session structure)
    const userId = currentUser.user_id || currentUser.id;
    
    if (!userId) {
        container.innerHTML = `
            <div class="activity-section">
                <h2 class="section-header">Profile Information</h2>
                <div class="error">Invalid user session. Please log in again.</div>
            </div>
        `;
        return;
    }

    try {
        // Fetch current user data from database
        const { data: userData, error } = await supabase
            .from('app_3704573dd8_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('User data loaded:', userData);

        container.innerHTML = `
            <div class="profile-section">
                <h2 class="section-header">Profile Information</h2>
                
                <div class="profile-card">
                    <form id="updateProfileForm" class="profile-form">
                        <div class="form-group">
                            <label for="fullName">Full Name</label>
                            <input type="text" id="fullName" name="fullName" 
                                   value="${userData.full_name || ''}" 
                                   placeholder="Enter your full name" required>
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" 
                                   value="${userData.email || ''}" 
                                   placeholder="Enter your email" required>
                        </div>

                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" 
                                   value="${userData.username || ''}" 
                                   placeholder="Enter your username" required>
                        </div>

                        <div class="form-group">
                            <label for="totalHectares">Total Hectares</label>
                            <input type="number" id="totalHectares" name="totalHectares" 
                                   value="${userData.total_hectares || ''}" 
                                   placeholder="Enter total farm size in hectares" 
                                   step="0.01" min="0" required>
                        </div>

                        <div class="form-group">
                            <label for="farmName">Farm Name</label>
                            <input type="text" id="farmName" name="farmName" 
                                   value="${userData.farm_name || ''}" 
                                   placeholder="Enter your farm name" required>
                        </div>

                        <div class="form-group">
                            <label for="location">Location</label>
                            <input type="text" id="location" name="location" 
                                   value="${userData.location || ''}" 
                                   placeholder="Enter your location" required>
                        </div>

                        <div class="form-group">
                            <label for="phoneNumber">Phone Number</label>
                            <input type="tel" id="phoneNumber" name="phoneNumber" 
                                   value="${userData.phone_number || ''}" 
                                   placeholder="Enter your phone number">
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Update Profile
                            </button>
                        </div>
                    </form>

                    <div id="profileMessage" class="profile-message"></div>
                </div>
            </div>
        `;

        // Add form submit handler
        const form = document.getElementById('updateProfileForm');
        form.addEventListener('submit', handleProfileUpdate);

    } catch (error) {
        console.error('Error loading profile:', error);
        container.innerHTML = `
            <div class="activity-section">
                <h2 class="section-header">Profile Information</h2>
                <div class="error">Error loading profile: ${error.message || 'Unknown error'}. Please try again later.</div>
            </div>
        `;
    }
}

// Handle Profile Update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showProfileMessage('User session not found. Please log in again.', 'error');
        return;
    }

    // Use user_id instead of id (matching the login script's session structure)
    const userId = currentUser.user_id || currentUser.id;
    
    if (!userId) {
        showProfileMessage('Invalid user session. Please log in again.', 'error');
        return;
    }

    const formData = {
        full_name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        username: document.getElementById('username').value.trim(),
        total_hectares: parseFloat(document.getElementById('totalHectares').value) || 0,
        farm_name: document.getElementById('farmName').value.trim(),
        location: document.getElementById('location').value.trim(),
        phone_number: document.getElementById('phoneNumber').value.trim() || null,
        updated_at: new Date().toISOString()
    };

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Updating...
        `;

        // Update user profile in database
        const { data, error } = await supabase
            .from('app_3704573dd8_users')
            .update(formData)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Update local session storage with the correct structure
        const updatedSession = {
            user_id: userId,
            email: formData.email,
            username: formData.username,
            full_name: formData.full_name,
            farm_name: formData.farm_name,
            expires_at: currentUser.expires_at
        };
        localStorage.setItem('user_session', JSON.stringify(updatedSession));

        // Update UI with new username
        const userNameElement = document.getElementById('userName');
        const headerUserNameElement = document.getElementById('headerUserName');
        
        if (userNameElement) {
            userNameElement.textContent = formData.username || formData.full_name || 'User';
        }
        if (headerUserNameElement) {
            headerUserNameElement.textContent = formData.username || formData.full_name || 'User';
        }

        // Show success message
        showProfileMessage('Profile updated successfully!', 'success');

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

    } catch (error) {
        console.error('Error updating profile:', error);
        showProfileMessage('Error updating profile: ' + error.message, 'error');
        
        // Restore button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Update Profile
        `;
    }
}

// Show profile message
function showProfileMessage(message, type) {
    const messageDiv = document.getElementById('profileMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `profile-message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

export { loadAnnouncements, loadFeedback, loadProfile };