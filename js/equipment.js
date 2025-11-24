// Load Equipment Management
async function loadEquipmentManagement() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="equipment-management-container">
            <div class="equipment-header">
                <h2 class="section-title">Equipment Management</h2>
                <button class="add-equipment-btn" onclick="openAddEquipmentModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Equipment
                </button>
            </div>
            <div id="equipmentTableContainer">
                <div class="loading">Loading equipment...</div>
            </div>
        </div>
    `;
    
    loadEquipmentTable();
}

// Load Equipment Table
async function loadEquipmentTable() {
    try {
        const { data: equipment, error } = await supabase
            .from('app_3704573dd8_equipment')
            .select('*')
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('equipmentTableContainer');
        
        if (error) throw error;
        
        if (!equipment || equipment.length === 0) {
            container.innerHTML = '<div class="no-data">No equipment found. Click "Add Equipment" to get started.</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="equipment-table">
                <thead>
                    <tr>
                        <th>Equipment Name</th>
                        <th>Type</th>
                        <th>Rate/Day</th>
                        <th>Operator Rate</th>
                        <th>Status</th>
                        <th>Total Rentals</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipment.map(item => `
                        <tr>
                            <td><strong>${item.equipment_name}</strong></td>
                            <td>${item.equipment_type}</td>
                            <td>₱${parseFloat(item.member_rate).toFixed(2)}/day</td>
                            <td>₱${parseFloat(item.operator_rate).toFixed(2)}/day</td>
                            <td><span class="status-badge ${item.status}">${item.status}</span></td>
                            <td>${item.total_rentals || 0}</td>
                            <td>
                                <div class="action-buttons-group">
                                    <button class="action-btn-small edit" onclick="openEditEquipmentModal('${item.id}')">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Edit
                                    </button>
                                    <button class="action-btn-small delete" onclick="deleteEquipment('${item.id}')">
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
        console.error('Error loading equipment:', error);
        document.getElementById('equipmentTableContainer').innerHTML = '<div class="error">Error loading equipment</div>';
    }
}

// Open Add Equipment Modal
function openAddEquipmentModal() {
    const modal = document.getElementById('addEquipmentModal');
    modal.style.display = 'flex';
    
    // Reset form
    document.getElementById('addEquipmentForm').reset();
    
    // Add form submit handler
    const form = document.getElementById('addEquipmentForm');
    form.onsubmit = handleAddEquipment;
}

// Close Add Equipment Modal
function closeAddEquipmentModal() {
    document.getElementById('addEquipmentModal').style.display = 'none';
}

// Handle Add Equipment
async function handleAddEquipment(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Adding...';
    submitBtn.disabled = true;
    
    try {
        const memberRate = parseFloat(document.getElementById('memberRate').value);
        
        const formData = {
            equipment_name: document.getElementById('equipmentName').value,
            equipment_type: document.getElementById('equipmentType').value,
            member_rate: memberRate,
            operator_rate: parseFloat(document.getElementById('operatorRate').value),
            status: document.getElementById('equipmentStatus').value,
            total_rentals: 0,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('app_3704573dd8_equipment')
            .insert([formData])
            .select();
        
        if (error) throw error;
        
        showNotification('Success', 'Equipment added successfully!', 'success');
        closeAddEquipmentModal();
        loadEquipmentTable();
        
    } catch (error) {
        console.error('Error adding equipment:', error);
        showNotification('Error', 'Failed to add equipment: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Open Edit Equipment Modal
async function openEditEquipmentModal(equipmentId) {
    try {
        const { data: equipment, error } = await supabase
            .from('app_3704573dd8_equipment')
            .select('*')
            .eq('id', equipmentId)
            .single();
        
        if (error) throw error;
        
        // Populate form
        document.getElementById('editEquipmentId').value = equipment.id;
        document.getElementById('editEquipmentName').value = equipment.equipment_name;
        document.getElementById('editEquipmentType').value = equipment.equipment_type;
        document.getElementById('editMemberRate').value = equipment.member_rate;
        document.getElementById('editOperatorRate').value = equipment.operator_rate;
        document.getElementById('editEquipmentStatus').value = equipment.status;
        
        // Show modal
        const modal = document.getElementById('editEquipmentModal');
        modal.style.display = 'flex';
        
        // Add form submit handler
        const form = document.getElementById('editEquipmentForm');
        form.onsubmit = handleEditEquipment;
        
    } catch (error) {
        console.error('Error loading equipment details:', error);
        showNotification('Error', 'Failed to load equipment details: ' + error.message, 'error');
    }
}

// Close Edit Equipment Modal
function closeEditEquipmentModal() {
    document.getElementById('editEquipmentModal').style.display = 'none';
}

// Handle Edit Equipment
async function handleEditEquipment(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Updating...';
    submitBtn.disabled = true;
    
    try {
        const equipmentId = document.getElementById('editEquipmentId').value;
        const memberRate = parseFloat(document.getElementById('editMemberRate').value);
        
        const updateData = {
            equipment_name: document.getElementById('editEquipmentName').value,
            equipment_type: document.getElementById('editEquipmentType').value,
            member_rate: memberRate,
            operator_rate: parseFloat(document.getElementById('editOperatorRate').value),
            status: document.getElementById('editEquipmentStatus').value,
            updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('app_3704573dd8_equipment')
            .update(updateData)
            .eq('id', equipmentId);
        
        if (error) throw error;
        
        showNotification('Success', 'Equipment updated successfully!', 'success');
        closeEditEquipmentModal();
        loadEquipmentTable();
        
    } catch (error) {
        console.error('Error updating equipment:', error);
        showNotification('Error', 'Failed to update equipment: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Delete Equipment
async function deleteEquipment(equipmentId) {
    if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) return;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_equipment')
            .delete()
            .eq('id', equipmentId);
        
        if (error) throw error;
        
        showNotification('Success', 'Equipment deleted successfully', 'success');
        loadEquipmentTable();
        
    } catch (error) {
        console.error('Error deleting equipment:', error);
        showNotification('Error', 'Failed to delete equipment: ' + error.message, 'error');
    }
}

// Equipment Rentals Section - Placeholder Data
let rentalGuidelines = `1. Equipment must be returned in the same condition as rented.
2. Late returns will incur additional charges.
3. Operator services are optional but recommended.
4. All damages must be reported immediately.
5. Payment must be made before equipment pickup.
6. Cancellations must be made 24 hours in advance.`;

let acceptRentals = true;

// Placeholder data for pending requests
let pendingRequests = [
    {
        id: 1,
        user: "Juan Dela Cruz",
        equipment: "Tractor",
        type: "Heavy Machinery",
        startDate: "2025-01-15",
        endDate: "2025-01-20",
        days: 5,
        operatorSalary: 500,
        equipmentCost: 2000,
        totalCost: 12500,
        purpose: "Land preparation for rice planting"
    },
    {
        id: 2,
        user: "Maria Santos",
        equipment: "Harvester",
        type: "Harvesting Equipment",
        startDate: "2025-01-18",
        endDate: "2025-01-22",
        days: 4,
        operatorSalary: 600,
        equipmentCost: 3000,
        totalCost: 14400,
        purpose: "Rice harvest"
    }
];

// Placeholder data for active rentals
let activeRentals = [
    {
        id: 3,
        user: "Pedro Garcia",
        equipment: "Plow",
        type: "Tillage Equipment",
        startDate: "2025-01-10",
        endDate: "2025-01-14",
        days: 4,
        operatorSalary: 400,
        equipmentCost: 1500,
        totalCost: 7600,
        purpose: "Field preparation"
    }
];

// Load Equipment Rentals Section
function loadEquipmentRentals() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="equipment-rentals-container">
            <div class="rentals-header">
                <h2 class="section-title">Equipment Rentals Management</h2>
            </div>

            <!-- Rules & Guidelines Box -->
            <div class="guidelines-box">
                <div class="guidelines-header">
                    <h3 class="guidelines-title">Rules & Guidelines</h3>
                    <div class="guidelines-actions">
                        <button class="guidelines-btn edit" onclick="openEditGuidelinesModal()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>
                    </div>
                </div>
                <div class="guidelines-content" id="guidelinesDisplay">${rentalGuidelines}</div>
            </div>

            <!-- Accept Rentals Toggle -->
            <div class="accept-rentals-box">
                <span class="toggle-label">Accept Rentals</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="acceptRentalsToggle" ${acceptRentals ? 'checked' : ''} onchange="toggleAcceptRentals()">
                    <span class="toggle-slider"></span>
                </label>
            </div>

            <!-- Pending Requests Table -->
            <div class="rentals-table-container">
                <div class="table-header">
                    <h3 class="table-title">Pending Rental Requests</h3>
                </div>
                <div id="pendingRequestsTable">
                    ${renderPendingRequestsTable()}
                </div>
            </div>

            <!-- Active Rentals Table -->
            <div class="rentals-table-container">
                <div class="table-header">
                    <h3 class="table-title">Active Rentals</h3>
                </div>
                <div id="activeRentalsTable">
                    ${renderActiveRentalsTable()}
                </div>
            </div>
        </div>
    `;
}

// Render Pending Requests Table
function renderPendingRequestsTable() {
    if (pendingRequests.length === 0) {
        return '<div class="no-data">No pending rental requests</div>';
    }

    return `
        <table class="rentals-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Equipment</th>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Days</th>
                    <th>Operator Salary</th>
                    <th>Equipment Cost</th>
                    <th>Total Cost</th>
                    <th>Purpose</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${pendingRequests.map(request => `
                    <tr>
                        <td><strong>${request.user}</strong></td>
                        <td>${request.equipment}</td>
                        <td>${request.type}</td>
                        <td>${new Date(request.startDate).toLocaleDateString()}</td>
                        <td>${new Date(request.endDate).toLocaleDateString()}</td>
                        <td>${request.days}</td>
                        <td>₱${request.operatorSalary.toFixed(2)}/day</td>
                        <td>₱${request.equipmentCost.toFixed(2)}/day</td>
                        <td><strong>₱${request.totalCost.toFixed(2)}</strong></td>
                        <td>${request.purpose}</td>
                        <td>
                            <div class="action-buttons-group">
                                <button class="action-btn-small approve" onclick="approveRequest(${request.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Approve
                                </button>
                                <button class="action-btn-small reject" onclick="rejectRequest(${request.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                    Reject
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Render Active Rentals Table
function renderActiveRentalsTable() {
    if (activeRentals.length === 0) {
        return '<div class="no-data">No active rentals</div>';
    }

    return `
        <table class="rentals-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Equipment</th>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Days</th>
                    <th>Operator Salary</th>
                    <th>Equipment Cost</th>
                    <th>Total Cost</th>
                    <th>Purpose</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${activeRentals.map(rental => `
                    <tr>
                        <td><strong>${rental.user}</strong></td>
                        <td>${rental.equipment}</td>
                        <td>${rental.type}</td>
                        <td>${new Date(rental.startDate).toLocaleDateString()}</td>
                        <td>${new Date(rental.endDate).toLocaleDateString()}</td>
                        <td>${rental.days}</td>
                        <td>₱${rental.operatorSalary.toFixed(2)}/day</td>
                        <td>₱${rental.equipmentCost.toFixed(2)}/day</td>
                        <td><strong>₱${rental.totalCost.toFixed(2)}</strong></td>
                        <td>${rental.purpose}</td>
                        <td>
                            <div class="action-buttons-group">
                                <button class="action-btn-small return" onclick="returnEquipment(${rental.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 14 4 9 9 4"></polyline>
                                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                                    </svg>
                                    Return
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Toggle Accept Rentals
function toggleAcceptRentals() {
    acceptRentals = document.getElementById('acceptRentalsToggle').checked;
    const status = acceptRentals ? 'enabled' : 'disabled';
    showNotification('Settings Updated', `Equipment rentals are now ${status}`, 'success');
}

// Approve Request
function approveRequest(requestId) {
    if (!confirm('Are you sure you want to approve this rental request?')) return;
    
    const requestIndex = pendingRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
        const approvedRequest = pendingRequests.splice(requestIndex, 1)[0];
        activeRentals.push(approvedRequest);
        
        showNotification('Request Approved', 'Rental request has been approved successfully', 'success');
        loadEquipmentRentals();
    }
}

// Reject Request
function rejectRequest(requestId) {
    if (!confirm('Are you sure you want to reject this rental request?')) return;
    
    const requestIndex = pendingRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
        pendingRequests.splice(requestIndex, 1);
        
        showNotification('Request Rejected', 'Rental request has been rejected', 'warning');
        loadEquipmentRentals();
    }
}

// Return Equipment
function returnEquipment(rentalId) {
    if (!confirm('Confirm that the equipment has been returned?')) return;
    
    const rentalIndex = activeRentals.findIndex(r => r.id === rentalId);
    if (rentalIndex !== -1) {
        activeRentals.splice(rentalIndex, 1);
        
        showNotification('Equipment Returned', 'Equipment has been marked as returned successfully', 'success');
        loadEquipmentRentals();
    }
}