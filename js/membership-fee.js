// Membership Fee Management module for Admin Dashboard

// Load Membership Fee Management Section
async function loadMembershipFeeManagement() {
    const container = document.getElementById('contentContainer');
    
    // Show loading state
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading">Loading membership fee management...</div>
        </div>
    `;
    
    try {
        // Fetch membership fee settings
        const { data: feeData, error: feeError } = await supabase
            .from('app_3704573dd8_membership_fee')
            .select('*')
            .single();
        
        if (feeError && feeError.code !== 'PGRST116') throw feeError;
        
        // Use default values if no fee data exists
        const fee = feeData || {
            annual_fee: 500.00,
            valid_until_default: '2025-12-31',
            benefits: [
                'Access to Equipment Rentals|Rent agricultural equipment at member rates',
                'Fertilizer Distribution|Receive subsidized fertilizers for your crops',
                'Training & Workshops|Participate in agricultural training programs',
                'Market Access|Connect with buyers and access better market prices',
                'Technical Support|Get expert advice on crop management and farming practices'
            ]
        };
        
        // Fetch all users with membership status
        const { data: users, error: usersError } = await supabase
            .from('app_3704573dd8_users')
            .select('id, full_name, email, membership_status, membership_valid_until')
            .order('full_name', { ascending: true });
        
        if (usersError) throw usersError;
        
        // Count active and inactive members
        const activeMembers = users.filter(u => u.membership_status === 'active').length;
        const inactiveMembers = users.filter(u => u.membership_status === 'inactive').length;
        
        // Parse benefits
        const benefits = Array.isArray(fee.benefits) ? fee.benefits : 
            (typeof fee.benefits === 'string' ? fee.benefits.split(',') : []);
        
        container.innerHTML = `
            <div class="membership-fee-management">
                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #e3f2fd;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3>Annual Fee</h3>
                            <p class="stat-value">₱${parseFloat(fee.annual_fee).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #e8f5e9;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3>Active Members</h3>
                            <p class="stat-value">${activeMembers}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #ffebee;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <h3>Inactive Members</h3>
                            <p class="stat-value">${inactiveMembers}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Fee Settings Card -->
                <div class="content-card">
                    <div class="card-header">
                        <h2 class="section-header">Membership Fee Settings</h2>
                        <button class="btn btn-primary" onclick="openEditMembershipFeeModal()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Settings
                        </button>
                    </div>
                    
                    <div class="fee-details">
                        <div class="fee-info-row">
                            <div class="fee-info-item">
                                <label>Annual Membership Fee</label>
                                <p class="fee-value">₱${parseFloat(fee.annual_fee).toFixed(2)}</p>
                            </div>
                            <div class="fee-info-item">
                                <label>Default Valid Until</label>
                                <p class="fee-value">${new Date(fee.valid_until_default).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        
                        <div class="benefits-section">
                            <h3>Membership Benefits</h3>
                            <div class="benefits-list">
                                ${benefits.map(benefit => {
                                    const [title, description] = benefit.split('|');
                                    return `
                                        <div class="benefit-item">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <div>
                                                <strong>${title}</strong>
                                                <p>${description}</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Members List Card -->
                <div class="content-card">
                    <div class="card-header">
                        <h2 class="section-header">Member Status Management</h2>
                    </div>
                    
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Member Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Valid Until</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(user => {
                                    const isExpired = new Date(user.membership_valid_until) < new Date();
                                    const statusClass = user.membership_status === 'active' ? 
                                        (isExpired ? 'status-expired' : 'status-active') : 'status-inactive';
                                    const statusText = user.membership_status === 'active' ? 
                                        (isExpired ? 'Expired' : 'Active') : 'Inactive';
                                    
                                    return `
                                        <tr>
                                            <td>${user.full_name}</td>
                                            <td>${user.email}</td>
                                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                                            <td>${new Date(user.membership_valid_until).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td>
                                                <button class="btn-icon" onclick="openEditMembershipStatusModal('${user.id}')" title="Edit Status">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading membership fee management:', error);
        container.innerHTML = `
            <div class="error-container">
                <p>Error loading membership fee management. Please try again later.</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

// Open Edit Membership Fee Modal
function openEditMembershipFeeModal() {
    const modal = document.getElementById('editMembershipFeeModal');
    if (!modal) {
        createEditMembershipFeeModal();
    }
    
    // Load current fee data
    loadCurrentFeeData();
    
    document.getElementById('editMembershipFeeModal').style.display = 'block';
}

// Close Edit Membership Fee Modal
function closeEditMembershipFeeModal() {
    document.getElementById('editMembershipFeeModal').style.display = 'none';
}

// Create Edit Membership Fee Modal
function createEditMembershipFeeModal() {
    const modalHTML = `
        <div id="editMembershipFeeModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Membership Fee Settings</h2>
                    <button class="close-modal" onclick="closeEditMembershipFeeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editMembershipFeeForm">
                        <input type="hidden" id="feeRecordId">
                        
                        <div class="form-group">
                            <label for="editAnnualFee">Annual Membership Fee (₱) *</label>
                            <input type="number" id="editAnnualFee" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editValidUntil">Default Valid Until Date *</label>
                            <input type="date" id="editValidUntil" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Membership Benefits</label>
                            <div id="benefitsContainer"></div>
                            <button type="button" class="btn btn-secondary" onclick="addBenefitField()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Benefit
                            </button>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('editMembershipFeeForm').addEventListener('submit', handleUpdateMembershipFee);
}

// Load current fee data into modal
async function loadCurrentFeeData() {
    try {
        const { data: feeData, error } = await supabase
            .from('app_3704573dd8_membership_fee')
            .select('*')
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        const fee = feeData || {
            annual_fee: 500.00,
            valid_until_default: '2025-12-31',
            benefits: [
                'Access to Equipment Rentals|Rent agricultural equipment at member rates',
                'Fertilizer Distribution|Receive subsidized fertilizers for your crops',
                'Training & Workshops|Participate in agricultural training programs',
                'Market Access|Connect with buyers and access better market prices',
                'Technical Support|Get expert advice on crop management and farming practices'
            ]
        };
        
        document.getElementById('feeRecordId').value = fee.id || '';
        document.getElementById('editAnnualFee').value = fee.annual_fee;
        document.getElementById('editValidUntil').value = fee.valid_until_default;
        
        // Load benefits
        const benefits = Array.isArray(fee.benefits) ? fee.benefits : 
            (typeof fee.benefits === 'string' ? fee.benefits.split(',') : []);
        
        const container = document.getElementById('benefitsContainer');
        container.innerHTML = '';
        
        benefits.forEach((benefit, index) => {
            const [title, description] = benefit.split('|');
            addBenefitField(title, description);
        });
        
    } catch (error) {
        console.error('Error loading fee data:', error);
        showNotification('Error', 'Failed to load current fee data', 'error');
    }
}

// Add benefit field
function addBenefitField(title = '', description = '') {
    const container = document.getElementById('benefitsContainer');
    const index = container.children.length;
    
    const benefitHTML = `
        <div class="benefit-field" data-index="${index}">
            <input type="text" class="benefit-title" placeholder="Benefit Title" value="${title}" required>
            <input type="text" class="benefit-description" placeholder="Benefit Description" value="${description}" required>
            <button type="button" class="btn-icon btn-danger" onclick="removeBenefitField(${index})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', benefitHTML);
}

// Remove benefit field
function removeBenefitField(index) {
    const field = document.querySelector(`.benefit-field[data-index="${index}"]`);
    if (field) field.remove();
}

// Handle update membership fee
async function handleUpdateMembershipFee(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Saving...</span>';
    submitBtn.disabled = true;
    
    try {
        const feeId = document.getElementById('feeRecordId').value;
        const annualFee = parseFloat(document.getElementById('editAnnualFee').value);
        const validUntil = document.getElementById('editValidUntil').value;
        
        // Collect benefits
        const benefitFields = document.querySelectorAll('.benefit-field');
        const benefits = Array.from(benefitFields).map(field => {
            const title = field.querySelector('.benefit-title').value;
            const description = field.querySelector('.benefit-description').value;
            return `${title}|${description}`;
        });
        
        const feeData = {
            annual_fee: annualFee,
            valid_until_default: validUntil,
            benefits: benefits,
            updated_at: new Date().toISOString()
        };
        
        let result;
        if (feeId) {
            // Update existing record
            result = await supabase
                .from('app_3704573dd8_membership_fee')
                .update(feeData)
                .eq('id', feeId);
        } else {
            // Insert new record
            result = await supabase
                .from('app_3704573dd8_membership_fee')
                .insert([feeData]);
        }
        
        if (result.error) throw result.error;
        
        showNotification('Success', 'Membership fee settings updated successfully', 'success');
        closeEditMembershipFeeModal();
        loadMembershipFeeManagement();
        
    } catch (error) {
        console.error('Error updating membership fee:', error);
        showNotification('Error', 'Failed to update membership fee settings', 'error');
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Open Edit Membership Status Modal
async function openEditMembershipStatusModal(userId) {
    const modal = document.getElementById('editMembershipStatusModal');
    if (!modal) {
        createEditMembershipStatusModal();
    }
    
    try {
        const { data: user, error } = await supabase
            .from('app_3704573dd8_users')
            .select('id, full_name, membership_status, membership_valid_until')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        document.getElementById('editMembershipUserId').value = user.id;
        document.getElementById('editMembershipUserName').textContent = user.full_name;
        document.getElementById('editMembershipStatus').value = user.membership_status || 'active';
        document.getElementById('editMembershipValidUntil').value = user.membership_valid_until || '2025-12-31';
        
        document.getElementById('editMembershipStatusModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading user membership data:', error);
        showNotification('Error', 'Failed to load user membership data', 'error');
    }
}

// Close Edit Membership Status Modal
function closeEditMembershipStatusModal() {
    document.getElementById('editMembershipStatusModal').style.display = 'none';
}

// Create Edit Membership Status Modal
function createEditMembershipStatusModal() {
    const modalHTML = `
        <div id="editMembershipStatusModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Member Status</h2>
                    <button class="close-modal" onclick="closeEditMembershipStatusModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editMembershipStatusForm">
                        <input type="hidden" id="editMembershipUserId">
                        
                        <div class="form-group">
                            <label>Member Name</label>
                            <p id="editMembershipUserName" style="font-weight: 600; color: #1e3a5f;"></p>
                        </div>
                        
                        <div class="form-group">
                            <label for="editMembershipStatus">Membership Status *</label>
                            <select id="editMembershipStatus" required>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="editMembershipValidUntil">Valid Until *</label>
                            <input type="date" id="editMembershipValidUntil" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Update Status
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('editMembershipStatusForm').addEventListener('submit', handleUpdateMembershipStatus);
}

// Handle update membership status
async function handleUpdateMembershipStatus(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Updating...</span>';
    submitBtn.disabled = true;
    
    try {
        const userId = document.getElementById('editMembershipUserId').value;
        const status = document.getElementById('editMembershipStatus').value;
        const validUntil = document.getElementById('editMembershipValidUntil').value;
        
        const { error } = await supabase
            .from('app_3704573dd8_users')
            .update({
                membership_status: status,
                membership_valid_until: validUntil
            })
            .eq('id', userId);
        
        if (error) throw error;
        
        showNotification('Success', 'Member status updated successfully', 'success');
        closeEditMembershipStatusModal();
        loadMembershipFeeManagement();
        
    } catch (error) {
        console.error('Error updating membership status:', error);
        showNotification('Error', 'Failed to update member status', 'error');
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}