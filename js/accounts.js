// Load Create User Form
function loadCreateUserForm() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="form-container">
            <div class="form-card">
                <h2 class="form-title">Create New User</h2>
                <form id="createUserForm" class="user-form">
                    <div class="form-group">
                        <label for="fullName">Full Name *</label>
                        <input type="text" id="fullName" name="fullName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="username">Username *</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password *</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="farmName">Farm Name *</label>
                        <input type="text" id="farmName" name="farmName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="location">Location *</label>
                        <input type="text" id="location" name="location" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="totalHectares">Total Hectares *</label>
                        <input type="number" id="totalHectares" name="totalHectares" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phoneNumber">Phone Number</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber">
                    </div>
                    
                    <button type="submit" class="submit-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Create User
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('createUserForm').addEventListener('submit', handleCreateUser);
}

// Handle Create User
async function handleCreateUser(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Creating...';
    submitBtn.disabled = true;
    
    try {
        const formData = {
            full_name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            farm_name: document.getElementById('farmName').value,
            location: document.getElementById('location').value,
            total_hectares: parseFloat(document.getElementById('totalHectares').value),
            phone_number: document.getElementById('phoneNumber').value || null,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        // Insert user into database
        const { data, error } = await supabase
            .from('app_3704573dd8_users')
            .insert([formData])
            .select();
        
        if (error) throw error;
        
        showNotification('Success', 'User created successfully! They can login immediately with their username/email and password.', 'success');
        e.target.reset();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('Error', 'Failed to create user: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Load Create Admin Form
async function loadCreateAdminForm() {
    const contentContainer = document.getElementById('contentContainer');
    
    // Check current admin count
    const { count, error } = await supabase
        .from('app_3704573dd8_admins')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
    
    const currentAdmins = (count || 0) + 1;
    const maxAdmins = 8;
    
    contentContainer.innerHTML = `
        <div class="admin-management-container">
            <div class="admin-header">
                <h2 class="section-title">Admin Management</h2>
                <div class="admin-count">Current Admins: ${currentAdmins}/${maxAdmins}</div>
            </div>
            
            <div class="admin-info-box">
                <p><strong>Default Admin:</strong> admin@croptop.com / admin123 (Stored in localStorage)</p>
                <p><strong>New Admins:</strong> Require Supabase authentication and email verification</p>
            </div>
            
            <div class="admin-layout">
                <div class="admin-form-card">
                    <h3 class="form-subtitle">Add New Admin</h3>
                    <form id="createAdminForm" class="admin-form">
                        <div class="form-group">
                            <label for="adminFullName">Full Name *</label>
                            <input type="text" id="adminFullName" name="adminFullName" required ${currentAdmins >= maxAdmins ? 'disabled' : ''}>
                        </div>
                        
                        <div class="form-group">
                            <label for="adminEmail">Email *</label>
                            <input type="email" id="adminEmail" name="adminEmail" required ${currentAdmins >= maxAdmins ? 'disabled' : ''}>
                        </div>
                        
                        <div class="form-group">
                            <label for="adminUsername">Username *</label>
                            <input type="text" id="adminUsername" name="adminUsername" required ${currentAdmins >= maxAdmins ? 'disabled' : ''}>
                        </div>
                        
                        <div class="form-group">
                            <label for="adminPassword">Password *</label>
                            <input type="password" id="adminPassword" name="adminPassword" required ${currentAdmins >= maxAdmins ? 'disabled' : ''}>
                        </div>
                        
                        <button type="submit" class="submit-btn" ${currentAdmins >= maxAdmins ? 'disabled' : ''}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            ${currentAdmins >= maxAdmins ? 'Maximum Admins Reached' : 'Add Admin'}
                        </button>
                    </form>
                </div>
                
                <div class="admin-list-card">
                    <div class="admin-list-header">
                        <h3 class="form-subtitle">Current Admins</h3>
                        <button class="refresh-btn" onclick="loadCreateAdminForm()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Refresh
                        </button>
                    </div>
                    <div id="adminListContainer">
                        <div class="loading">Loading admins...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (currentAdmins < maxAdmins) {
        document.getElementById('createAdminForm').addEventListener('submit', handleCreateAdmin);
    }
    
    loadAdminList();
}

// Load Admin List
async function loadAdminList() {
    try {
        const { data: admins, error } = await supabase
            .from('app_3704573dd8_admins')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('adminListContainer');
        
        if (error) throw error;
        
        // Add default admin
        const defaultAdmin = JSON.parse(localStorage.getItem('default_admin'));
        const allAdmins = [
            {
                id: 'default',
                full_name: defaultAdmin.full_name,
                username: defaultAdmin.username,
                email: defaultAdmin.email,
                created_at: '2024-01-01',
                is_default: true
            },
            ...(admins || [])
        ];
        
        if (allAdmins.length === 0) {
            container.innerHTML = '<div class="no-data">No admins found</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allAdmins.map(admin => `
                        <tr>
                            <td>${admin.full_name || 'N/A'}</td>
                            <td>${admin.username || 'N/A'}</td>
                            <td>${admin.email || 'N/A'}</td>
                            <td>${admin.is_default ? '<span class="badge-default">Default</span>' : '<span class="badge-supabase">Supabase</span>'}</td>
                            <td>${new Date(admin.created_at).toLocaleDateString()}</td>
                            <td>
                                ${admin.is_default ? 
                                    '<span class="text-muted">Cannot delete</span>' :
                                    `<button class="action-btn-small delete" onclick="deleteAdmin('${admin.id}')">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>`
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading admin list:', error);
        document.getElementById('adminListContainer').innerHTML = '<div class="error">Error loading admins</div>';
    }
}

// Handle Create Admin
async function handleCreateAdmin(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Creating...';
    submitBtn.disabled = true;
    
    try {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const fullName = document.getElementById('adminFullName').value;
        const username = document.getElementById('adminUsername').value;
        
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    username: username
                }
            }
        });
        
        if (authError) throw authError;
        
        // Insert admin record
        const { error: insertError } = await supabase
            .from('app_3704573dd8_admins')
            .insert([{
                user_id: authData.user.id,
                email: email,
                full_name: fullName,
                username: username,
                role: 'admin',
                is_active: true,
                created_at: new Date().toISOString()
            }]);
        
        if (insertError) throw insertError;
        
        showNotification('Success', 'Admin created successfully! They will receive a confirmation email.', 'success');
        loadCreateAdminForm();
        
    } catch (error) {
        console.error('Error creating admin:', error);
        showNotification('Error', 'Failed to create admin: ' + error.message, 'error');
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Delete Admin
async function deleteAdmin(adminId) {
    if (adminId === 'default') {
        showNotification('Warning', 'Cannot delete the default admin.', 'warning');
        return;
    }
    
    if (!confirm('Are you sure you want to remove this admin?')) return;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_admins')
            .update({ is_active: false })
            .eq('id', adminId);
        
        if (error) throw error;
        
        showNotification('Success', 'Admin removed successfully', 'success');
        loadCreateAdminForm();
        
    } catch (error) {
        console.error('Error deleting admin:', error);
        showNotification('Error', 'Failed to remove admin: ' + error.message, 'error');
    }
}

// Load Member List with Print Button
async function loadMemberList() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="users-container">
            <div class="users-header">
                <h2 class="section-title">Member List</h2>
                <div class="header-actions">
                    <button class="print-btn" onclick="printMemberList()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Print List
                    </button>
                    <button class="refresh-btn" onclick="loadMemberList()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>
            <div id="membersTableContainer">
                <div class="loading">Loading members...</div>
            </div>
        </div>
    `;
    
    loadMembersTable();
}

// Load Members Table
async function loadMembersTable() {
    try {
        const { data: users, error } = await supabase
            .from('app_3704573dd8_users')
            .select('*')
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('membersTableContainer');
        
        if (error) throw error;
        
        if (!users || users.length === 0) {
            container.innerHTML = '<div class="no-data">No members found</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="users-table" id="membersPrintTable">
                <thead>
                    <tr>
                        <th>FULL NAME</th>
                        <th>USERNAME</th>
                        <th>EMAIL</th>
                        <th>FARM NAME</th>
                        <th>LOCATION</th>
                        <th>HECTARES</th>
                        <th>PHONE</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.full_name || 'N/A'}</td>
                            <td>${user.username || 'N/A'}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>${user.farm_name || 'N/A'}</td>
                            <td>${user.location || 'N/A'}</td>
                            <td>${user.total_hectares ? user.total_hectares + ' ha' : 'N/A'}</td>
                            <td>${user.phone_number || 'N/A'}</td>
                            <td><span class="status-badge ${user.status}">${user.status || 'active'}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading members:', error);
        document.getElementById('membersTableContainer').innerHTML = '<div class="error">Error loading members</div>';
    }
}

// Print Member List Function
function printMemberList() {
    const printContent = document.getElementById('membersPrintTable');
    if (!printContent) {
        showNotification('Error', 'No member list to print', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CropTop Member List - ${new Date().toLocaleDateString()}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #4CAF50;
                    padding-bottom: 20px;
                }
                .print-header h1 {
                    color: #4CAF50;
                    margin: 0 0 10px 0;
                }
                .print-header p {
                    margin: 5px 0;
                    color: #666;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px 8px;
                    text-align: left;
                    font-size: 12px;
                }
                th {
                    background-color: #4CAF50;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                }
                .status-badge.active {
                    background-color: #d4edda;
                    color: #155724;
                }
                .status-badge.blocked {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                .print-footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 11px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                @media print {
                    body { padding: 10px; }
                    .print-header { page-break-after: avoid; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>CropTop Member List</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Total Members: ${printContent.querySelectorAll('tbody tr').length}</p>
            </div>
            ${printContent.outerHTML}
            <div class="print-footer">
                <p>CropTop Agricultural Cooperative - Member Management System</p>
                <p>This document is confidential and for internal use only</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// View User Details
async function viewUserDetails(userId) {
    try {
        const { data: user, error } = await supabase
            .from('app_3704573dd8_users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        const modal = document.getElementById('userDetailsModal');
        const content = document.getElementById('userDetailsContent');
        
        content.innerHTML = `
            <div class="user-details-grid">
                <div class="detail-item">
                    <label>Full Name:</label>
                    <span>${user.full_name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Username:</label>
                    <span>${user.username || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${user.email || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Phone Number:</label>
                    <span>${user.phone_number || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Farm Name:</label>
                    <span>${user.farm_name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Location:</label>
                    <span>${user.location || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Total Hectares:</label>
                    <span>${user.total_hectares ? user.total_hectares + ' ha' : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge ${user.status}">${user.status || 'active'}</span>
                </div>
                <div class="detail-item">
                    <label>Created At:</label>
                    <span>${new Date(user.created_at).toLocaleString()}</span>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error loading user details:', error);
        showNotification('Error', 'Failed to load user details: ' + error.message, 'error');
    }
}

// Close User Details Modal
function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').style.display = 'none';
}