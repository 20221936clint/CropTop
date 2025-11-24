// Load dashboard overview
async function loadDashboardOverview() {
    const contentContainer = document.getElementById('contentContainer');
    
    try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
            .from('app_3704573dd8_users')
            .select('*', { count: 'exact', head: true });
        
        // Fetch crop count
        const { count: cropCount, error: cropError } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('*', { count: 'exact', head: true });
        
        if (cropError) throw cropError;

        // Fetch equipment count
        const { count: equipmentCount, error: equipmentError } = await supabase
            .from('app_3704573dd8_equipment')
            .select('*', { count: 'exact', head: true });
        
        // Fetch pending rental requests count
        const { count: pendingCount, error: pendingError } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'PENDING');
        
        // Fetch recent system activities
        const { data: recentUsers, error: recentUsersError } = await supabase
            .from('app_3704573dd8_users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(2);
        
        // Fetch recent crops WITHOUT join - get user info separately
        const { data: recentCrops, error: recentCropsError } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(2);
        
        // Fetch recent rentals WITHOUT join - they already have user_name field
        const { data: recentRentals, error: recentRentalsError } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(2);
        
        // Combine and sort all activities
        const activities = [];
        
        if (recentUsers) {
            recentUsers.forEach(user => {
                activities.push({
                    type: 'user',
                    icon: 'user',
                    text: `New user registered: ${user.full_name || 'Unknown User'}`,
                    date: user.created_at
                });
            });
        }
        
        if (recentCrops) {
            // Fetch user details for each crop
            for (const crop of recentCrops) {
                let userName = 'Unknown User';
                if (crop.user_id) {
                    const { data: user } = await supabase
                        .from('app_3704573dd8_users')
                        .select('full_name')
                        .eq('id', crop.user_id)
                        .single();
                    if (user) {
                        userName = user.full_name;
                    }
                }
                activities.push({
                    type: 'crop',
                    icon: 'crop',
                    text: `${userName} added crop: ${crop.crop_type || crop.crop_name}`,
                    date: crop.created_at
                });
            }
        }
        
        if (recentRentals) {
            recentRentals.forEach(rental => {
                const userName = rental.user_name || 'Unknown User';
                activities.push({
                    type: 'rental',
                    icon: 'equipment',
                    text: `${userName} requested equipment: ${rental.equipment_name}`,
                    date: rental.created_at
                });
            });
        }
        
        // Sort activities by date
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const topActivities = activities.slice(0, 6);
        
        contentContainer.innerHTML = `
            <div class="dashboard-content">
                <h2 class="section-title">Dashboard Overview</h2>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card clickable" data-section="accounts" data-subsection="view-all-users">
                        <div class="stat-icon-box blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 class="stat-number">${userCount || 0}</h3>
                            <p class="stat-label">Total Users</p>
                        </div>
                    </div>

                    <div class="stat-card clickable" data-section="crops">
                        <div class="stat-icon-box blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 class="stat-number">${cropCount || 0}</h3>
                            <p class="stat-label">Total Crops</p>
                        </div>
                    </div>

                    <div class="stat-card clickable" data-section="equipment">
                        <div class="stat-icon-box blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                                <circle cx="7" cy="17" r="2"></circle>
                                <circle cx="17" cy="17" r="2"></circle>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 class="stat-number">${equipmentCount || 0}</h3>
                            <p class="stat-label">Equipment</p>
                        </div>
                    </div>

                    <div class="stat-card clickable" data-section="member-rentals">
                        <div class="stat-icon-box blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 class="stat-number">${pendingCount || 0}</h3>
                            <p class="stat-label">Pending Requests</p>
                        </div>
                    </div>
                </div>

                <!-- Activity and Actions Section -->
                <div class="dashboard-grid">
                    <!-- Recent System Activity -->
                    <div class="activity-card">
                        <h3 class="card-title">Recent System Activity</h3>
                        <div class="activity-list">
                            ${topActivities.length > 0 ? topActivities.map(activity => `
                                <div class="activity-item">
                                    <div class="activity-icon ${activity.icon}">
                                        ${getActivityIcon(activity.type)}
                                    </div>
                                    <div class="activity-details">
                                        <p class="activity-text">${activity.text}</p>
                                        <p class="activity-date">${formatDate(activity.date)}</p>
                                    </div>
                                </div>
                            `).join('') : '<p class="no-activity">No recent activity</p>'}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="actions-card">
                        <h3 class="card-title">Quick Actions</h3>
                        <div class="actions-list">
                            <button class="action-btn blue" data-subsection="create-user">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                                Create New User
                            </button>
                            <button class="action-btn green" data-section="equipment">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Equipment
                            </button>
                            <button class="action-btn teal" data-section="non-member-rentals">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                                Add Non-Member Rental
                            </button>
                            <button class="action-btn orange" data-section="announcements">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                New Announcement
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click handlers for stat cards
        document.querySelectorAll('.stat-card.clickable').forEach(card => {
            card.addEventListener('click', function() {
                const section = this.dataset.section;
                const subsection = this.dataset.subsection;
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                
                if (section === 'accounts' && subsection) {
                    // Navigate to accounts subsection
                    const accountsNav = document.querySelector('[data-section="accounts"]');
                    if (accountsNav) {
                        accountsNav.classList.add('active');
                        const submenu = document.getElementById('accountsSubmenu');
                        if (submenu) {
                            submenu.classList.add('open');
                            accountsNav.classList.add('open');
                        }
                    }
                    loadSubsection(subsection);
                } else {
                    // Navigate to section
                    const navItem = document.querySelector(`[data-section="${section}"]`);
                    if (navItem) {
                        navItem.classList.add('active');
                    }
                    loadSection(section);
                }
            });
        });
        
        // Add click handlers for action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.dataset.section;
                const subsection = this.dataset.subsection;
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                
                if (subsection === 'create-user') {
                    const accountsNav = document.querySelector('[data-section="accounts"]');
                    if (accountsNav) {
                        accountsNav.classList.add('active');
                        const submenu = document.getElementById('accountsSubmenu');
                        if (submenu) {
                            submenu.classList.add('open');
                            accountsNav.classList.add('open');
                        }
                    }
                    loadSubsection('create-user');
                } else if (section) {
                    const navItem = document.querySelector(`[data-section="${section}"]`);
                    if (navItem) {
                        navItem.classList.add('active');
                    }
                    loadSection(section);
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Helper function to get activity icon
function getActivityIcon(type) {
    switch(type) {
        case 'user':
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`;
        case 'crop':
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>`;
        case 'rental':
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                <circle cx="7" cy="17" r="2"></circle>
                <circle cx="17" cy="17" r="2"></circle>
            </svg>`;
        default:
            return '';
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Load user count
async function loadUserCount() {
    try {
        const { count, error } = await supabase
            .from('app_3704573dd8_users')
            .select('*', { count: 'exact', head: true });
        
        if (!error) {
            document.getElementById('totalUsers').textContent = count || 0;
        }
    } catch (error) {
        console.error('Error loading user count:', error);
    }
}

// Load admin count
async function loadAdminCount() {
    try {
        const { count, error } = await supabase
            .from('app_3704573dd8_admins')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        
        // Add 1 for default admin
        const totalAdmins = (count || 0) + 1;
        
        if (!error) {
            document.getElementById('totalAdmins').textContent = totalAdmins;
        }
    } catch (error) {
        console.error('Error loading admin count:', error);
    }
}