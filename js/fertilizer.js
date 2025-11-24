// Initialize Fertilizer Distribution Table
async function initializeFertilizerDistributionTable() {
    try {
        // Create table if it doesn't exist
        const { error } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .select('id')
            .limit(1);
        
        if (error && error.code === '42P01') {
            console.log('Fertilizer distribution table needs to be created');
        }
    } catch (error) {
        console.log('Checking fertilizer distribution table:', error);
    }
}

// Load Fertilizer Distribution
async function loadFertilizerDistribution() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="fertilizer-distribution-container">
            <div class="distribution-header">
                <h2 class="section-title">Fertilizer Distribution</h2>
                <div class="header-buttons">
                    <button class="add-distribution-btn" onclick="openAddDistributionModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Distribution
                    </button>
                    <button class="print-report-btn" onclick="printDistributionReport()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Print Report
                    </button>
                </div>
            </div>
            <div id="distributionTableContainer">
                <div class="loading">Loading distributions...</div>
            </div>
        </div>
    `;
    
    loadDistributionTable();
}

// Load Distribution Table
async function loadDistributionTable() {
    try {
        const { data: distributions, error } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .select(`
                *,
                app_3704573dd8_users (
                    full_name,
                    username,
                    email
                )
            `)
            .order('distribution_date', { ascending: false });
        
        const container = document.getElementById('distributionTableContainer');
        
        if (error) throw error;
        
        if (!distributions || distributions.length === 0) {
            container.innerHTML = '<div class="no-data">No fertilizer distributions found</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="distribution-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Fertilizer Type</th>
                        <th>Quantity</th>
                        <th>Distribution Date</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${distributions.map(dist => `
                        <tr>
                            <td>
                                <div class="user-info">
                                    <div class="user-name">${dist.app_3704573dd8_users?.full_name || 'N/A'}</div>
                                    <div class="user-email">${dist.app_3704573dd8_users?.email || 'N/A'}</div>
                                </div>
                            </td>
                            <td><strong>${dist.fertilizer_type}</strong></td>
                            <td>${dist.quantity} kg</td>
                            <td>${new Date(dist.distribution_date).toLocaleDateString()}</td>
                            <td>${dist.purpose || 'N/A'}</td>
                            <td><span class="status-badge ${dist.status || 'completed'}">${dist.status || 'Completed'}</span></td>
                            <td>
                                <div class="action-buttons-group">
                                    <button class="action-btn-small delete" onclick="deleteDistribution('${dist.id}')">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading distributions:', error);
        document.getElementById('distributionTableContainer').innerHTML = '<div class="error">Error loading distributions</div>';
    }
}

// Open Add Distribution Modal
async function openAddDistributionModal() {
    const modal = document.getElementById('addDistributionModal');
    modal.style.display = 'flex';
    
    // Reset form
    document.getElementById('addDistributionForm').reset();
    
    // Load users into dropdown
    await loadUsersDropdown();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('distributionDate').value = today;
    
    // Add form submit handler
    const form = document.getElementById('addDistributionForm');
    form.onsubmit = handleAddDistribution;
}

// Close Add Distribution Modal
function closeAddDistributionModal() {
    document.getElementById('addDistributionModal').style.display = 'none';
}

// Load Users Dropdown
async function loadUsersDropdown() {
    try {
        const { data: users, error } = await supabase
            .from('app_3704573dd8_users')
            .select('id, full_name, username, email')
            .eq('status', 'active')
            .order('full_name', { ascending: true });
        
        if (error) throw error;
        
        const select = document.getElementById('distributionUser');
        select.innerHTML = '<option value="">Select User</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.full_name} (${user.username})`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error', 'Failed to load users: ' + error.message, 'error');
    }
}

// Handle Add Distribution
async function handleAddDistribution(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Adding...';
    submitBtn.disabled = true;
    
    try {
        const formData = {
            user_id: document.getElementById('distributionUser').value,
            fertilizer_type: document.getElementById('distributionFertilizerType').value,
            quantity: parseFloat(document.getElementById('distributionQuantity').value),
            distribution_date: document.getElementById('distributionDate').value,
            purpose: document.getElementById('distributionPurpose').value || null,
            status: 'completed',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .insert([formData])
            .select();
        
        if (error) throw error;
        
        showNotification('Success', 'Distribution added successfully!', 'success');
        closeAddDistributionModal();
        loadDistributionTable();
        
    } catch (error) {
        console.error('Error adding distribution:', error);
        showNotification('Error', 'Failed to add distribution: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Delete Distribution
async function deleteDistribution(distributionId) {
    if (!confirm('Are you sure you want to delete this distribution record? This action cannot be undone.')) return;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .delete()
            .eq('id', distributionId);
        
        if (error) throw error;
        
        showNotification('Success', 'Distribution deleted successfully', 'success');
        loadDistributionTable();
        
    } catch (error) {
        console.error('Error deleting distribution:', error);
        showNotification('Error', 'Failed to delete distribution: ' + error.message, 'error');
    }
}

// Print Distribution Report
function printDistributionReport() {
    window.print();
}