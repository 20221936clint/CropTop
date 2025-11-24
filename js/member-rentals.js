// Member Rentals Management (Admin Side)

// Load Member Rentals Section
async function loadMemberRentals() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="member-rentals-container">
            <div class="rentals-header">
                <h2 class="section-title">Member Equipment Rentals</h2>
                <button class="print-btn" onclick="printMemberRentalsReport()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Print Report
                </button>
            </div>

            <!-- Rental Rules & Guidelines Section -->
            <div class="guidelines-section">
                <h3>Rental Rules & Guidelines</h3>
                <textarea 
                    id="memberRentalGuidelines" 
                    class="guidelines-textarea" 
                    placeholder="Enter rules for member equipment rentals (e.g., minimum rental period, payment terms, cancellation policy). These rules will be displayed to guide admins and can be referenced in reports."
                    maxlength="500"
                ></textarea>
                <div class="guidelines-footer">
                    <small class="char-count"><span id="guidelinesCharCount">0</span> / 500 characters. Changes are auto-saved.</small>
                </div>
            </div>

            <!-- Rentals Table -->
            <div class="rentals-table-wrapper">
                <div id="rentalTableContent">
                    <div class="loading">Loading rental requests...</div>
                </div>
            </div>
        </div>
    `;
    
    // Load guidelines
    await loadMemberRentalGuidelines();
    
    // Load rental requests
    await loadAllMemberRentals();
    
    // Setup auto-save for guidelines
    setupGuidelinesAutoSave();
}

// Load Member Rental Guidelines
async function loadMemberRentalGuidelines() {
    try {
        const { data, error } = await supabase
            .from('app_3704573dd8_rental_guidelines')
            .select('*')
            .eq('type', 'MEMBER')
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        const textarea = document.getElementById('memberRentalGuidelines');
        if (data && data.guidelines) {
            textarea.value = data.guidelines;
            document.getElementById('guidelinesCharCount').textContent = data.guidelines.length;
        }
    } catch (error) {
        console.error('Error loading guidelines:', error);
    }
}

// Setup Guidelines Auto-Save
function setupGuidelinesAutoSave() {
    const textarea = document.getElementById('memberRentalGuidelines');
    const charCount = document.getElementById('guidelinesCharCount');
    
    let saveTimeout;
    
    textarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
        
        // Clear existing timeout
        clearTimeout(saveTimeout);
        
        // Set new timeout to save after 1 second of no typing
        saveTimeout = setTimeout(async () => {
            await saveMemberRentalGuidelines(this.value);
        }, 1000);
    });
}

// Save Member Rental Guidelines
async function saveMemberRentalGuidelines(guidelines) {
    try {
        const { data: existing, error: fetchError } = await supabase
            .from('app_3704573dd8_rental_guidelines')
            .select('*')
            .eq('type', 'MEMBER')
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('app_3704573dd8_rental_guidelines')
                .update({ 
                    guidelines: guidelines,
                    updated_at: new Date().toISOString()
                })
                .eq('type', 'MEMBER');
            
            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('app_3704573dd8_rental_guidelines')
                .insert({ 
                    type: 'MEMBER',
                    guidelines: guidelines
                });
            
            if (error) throw error;
        }
    } catch (error) {
        console.error('Error saving guidelines:', error);
    }
}

// Load All Member Rentals
async function loadAllMemberRentals() {
    try {
        const { data: rentals, error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById('rentalTableContent');
        
        if (!rentals || rentals.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #bbb; margin-bottom: 1rem;">
                        <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                        <circle cx="7" cy="17" r="2"></circle>
                        <circle cx="17" cy="17" r="2"></circle>
                    </svg>
                    <p>No rental requests found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table class="rentals-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Equipment</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days</th>
                        <th>Total Cost</th>
                        <th>Operator Salary</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rentals.map(rental => {
                        const statusClass = rental.status.toLowerCase();
                        const startDate = new Date(rental.start_date);
                        const endDate = new Date(rental.end_date);
                        const formattedStartDate = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const formattedEndDate = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        
                        return `
                            <tr>
                                <td><strong>${rental.user_name}</strong></td>
                                <td>${rental.equipment_name}</td>
                                <td>${rental.equipment_type}</td>
                                <td>${formattedStartDate}</td>
                                <td>${formattedEndDate}</td>
                                <td>${rental.total_days} days</td>
                                <td><strong>₱${parseFloat(rental.total_cost).toFixed(2)}</strong></td>
                                <td>₱${parseFloat(rental.operator_salary).toFixed(2)}</td>
                                <td><span class="status-badge ${statusClass}">${rental.status}</span></td>
                                <td>
                                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                        <button class="action-btn-icon view" onclick="viewMemberRentalDetails('${rental.id}')" title="View Details">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                            View
                                        </button>
                                        ${rental.status === 'PENDING' ? `
                                            <button class="action-btn-icon" onclick="acceptMemberRental('${rental.id}')" title="Approve" style="border-color: #4caf50; color: #4caf50;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                Approve
                                            </button>
                                            <button class="action-btn-icon" onclick="cancelMemberRental('${rental.id}')" title="Cancel" style="border-color: #f44336; color: #f44336;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                                Cancel
                                            </button>
                                        ` : rental.status === 'RESCHEDULED' ? `
                                            <button class="action-btn-icon" onclick="approveReschedule('${rental.id}')" title="Approve Reschedule" style="border-color: #4caf50; color: #4caf50;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                Approve
                                            </button>
                                            <button class="action-btn-icon" onclick="rejectReschedule('${rental.id}')" title="Reject Reschedule" style="border-color: #f44336; color: #f44336;">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                                Reject
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading rental requests:', error);
        document.getElementById('rentalTableContent').innerHTML = '<div class="error">Error loading rental requests</div>';
    }
}

// Accept Member Rental
window.acceptMemberRental = async function(rentalId) {
    try {
        const { error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .update({ 
                status: 'APPROVED',
                updated_at: new Date().toISOString()
            })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        showNotification('Success', 'Rental request approved successfully! User has been notified.', 'success');
        await loadAllMemberRentals();
        
    } catch (error) {
        console.error('Error accepting rental:', error);
        showNotification('Error', 'Failed to approve rental request', 'error');
    }
};

// Approve Reschedule
window.approveReschedule = async function(rentalId) {
    try {
        const { error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .update({ 
                status: 'APPROVED',
                updated_at: new Date().toISOString()
            })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        showNotification('Success', 'Reschedule request approved! User has been notified.', 'success');
        await loadAllMemberRentals();
        
    } catch (error) {
        console.error('Error approving reschedule:', error);
        showNotification('Error', 'Failed to approve reschedule request', 'error');
    }
};

// Reject Reschedule
window.rejectReschedule = async function(rentalId) {
    const reason = prompt('Please provide a reason for rejecting the reschedule request:');
    
    if (!reason || reason.trim() === '') {
        showNotification('Warning', 'Rejection reason is required', 'warning');
        return;
    }
    
    try {
        // Fetch original rental data to restore previous dates
        const { data: rental, error: fetchError } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .eq('id', rentalId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const { error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .update({ 
                status: 'PENDING',
                reschedule_rejection_reason: reason.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        showNotification('Success', 'Reschedule request rejected. User has been notified.', 'success');
        await loadAllMemberRentals();
        
    } catch (error) {
        console.error('Error rejecting reschedule:', error);
        showNotification('Error', 'Failed to reject reschedule request', 'error');
    }
};

// Cancel Member Rental
window.cancelMemberRental = async function(rentalId) {
    const reason = prompt('Please provide a reason for cancellation:');
    
    if (!reason || reason.trim() === '') {
        showNotification('Warning', 'Cancellation reason is required', 'warning');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .update({ 
                status: 'CANCELLED',
                cancellation_reason: reason.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        showNotification('Success', 'Rental request cancelled. User has been notified.', 'success');
        await loadAllMemberRentals();
        
    } catch (error) {
        console.error('Error cancelling rental:', error);
        showNotification('Error', 'Failed to cancel rental request', 'error');
    }
};

// View Member Rental Details
window.viewMemberRentalDetails = async function(rentalId) {
    try {
        const { data: rental, error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .eq('id', rentalId)
            .single();
        
        if (error) throw error;
        
        const startDate = new Date(rental.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const endDate = new Date(rental.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const createdAt = new Date(rental.created_at).toLocaleString('en-US');
        
        const detailsHTML = `
            <div class="rental-details-modal">
                <div class="detail-section">
                    <h3>Member Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${rental.user_name}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Equipment Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Equipment:</span>
                        <span class="detail-value">${rental.equipment_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${rental.equipment_type}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Rental Period</h3>
                    <div class="detail-row">
                        <span class="detail-label">Start Date:</span>
                        <span class="detail-value">${startDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">End Date:</span>
                        <span class="detail-value">${endDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Days:</span>
                        <span class="detail-value">${rental.total_days} days</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Cost Breakdown</h3>
                    <div class="detail-row">
                        <span class="detail-label">Equipment Cost:</span>
                        <span class="detail-value">₱${parseFloat(rental.equipment_cost).toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Operator Salary:</span>
                        <span class="detail-value">₱${parseFloat(rental.operator_salary).toFixed(2)}</span>
                    </div>
                    <div class="detail-row total">
                        <span class="detail-label">Total Cost:</span>
                        <span class="detail-value">₱${parseFloat(rental.total_cost).toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Purpose</h3>
                    <p class="purpose-text">${rental.purpose}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Status Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value"><span class="status-badge ${rental.status.toLowerCase()}">${rental.status}</span></span>
                    </div>
                    ${rental.reschedule_reason ? `
                        <div class="detail-row">
                            <span class="detail-label">Reschedule Reason:</span>
                            <span class="detail-value" style="background: #fff3e0; padding: 0.5rem; border-radius: 4px; display: block; margin-top: 0.5rem;">${rental.reschedule_reason}</span>
                        </div>
                    ` : ''}
                    ${rental.reschedule_rejection_reason ? `
                        <div class="detail-row">
                            <span class="detail-label">Reschedule Rejection Reason:</span>
                            <span class="detail-value" style="background: #ffebee; padding: 0.5rem; border-radius: 4px; display: block; margin-top: 0.5rem;">${rental.reschedule_rejection_reason}</span>
                        </div>
                    ` : ''}
                    ${rental.cancellation_reason ? `
                        <div class="detail-row">
                            <span class="detail-label">Cancellation Reason:</span>
                            <span class="detail-value" style="background: #f5f5f5; padding: 0.5rem; border-radius: 4px; display: block; margin-top: 0.5rem;">${rental.cancellation_reason}</span>
                        </div>
                    ` : ''}
                    ${rental.admin_notes ? `
                        <div class="detail-row">
                            <span class="detail-label">Admin Notes:</span>
                            <span class="detail-value">${rental.admin_notes}</span>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Requested On:</span>
                        <span class="detail-value">${createdAt}</span>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Rental Details', detailsHTML);
        
    } catch (error) {
        console.error('Error viewing rental details:', error);
        showNotification('Error', 'Failed to load rental details', 'error');
    }
};

// Print Member Rentals Report
window.printMemberRentalsReport = async function() {
    try {
        const { data: rentals, error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const { data: guidelines } = await supabase
            .from('app_3704573dd8_rental_guidelines')
            .select('guidelines')
            .eq('type', 'MEMBER')
            .single();
        
        const guidelinesText = guidelines?.guidelines || 'No guidelines set';
        
        // Create print window
        const printWindow = window.open('', '_blank');
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Member Equipment Rentals Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #2196f3;
                    }
                    .header p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .guidelines {
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        border-left: 4px solid #2196f3;
                    }
                    .guidelines h3 {
                        margin-top: 0;
                        color: #2196f3;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background-color: #2196f3;
                        color: white;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .status-badge {
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                        display: inline-block;
                    }
                    .status-badge.pending {
                        background: #fff3e0;
                        color: #e65100;
                    }
                    .status-badge.approved {
                        background: #e8f5e9;
                        color: #2e7d32;
                    }
                    .status-badge.completed {
                        background: #e3f2fd;
                        color: #1565c0;
                    }
                    .status-badge.rejected {
                        background: #ffebee;
                        color: #c62828;
                    }
                    .status-badge.cancelled {
                        background: #f5f5f5;
                        color: #616161;
                    }
                    .status-badge.rescheduled {
                        background: #fff9c4;
                        color: #f57f17;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    @media print {
                        body {
                            padding: 10px;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Member Equipment Rentals Report</h1>
                    <p>Generated on: ${new Date().toLocaleString('en-US')}</p>
                    <p>Total Rentals: ${rentals?.length || 0}</p>
                </div>
                
                <div class="guidelines">
                    <h3>Rental Rules & Guidelines</h3>
                    <p>${guidelinesText}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Equipment</th>
                            <th>Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Days</th>
                            <th>Total Cost</th>
                            <th>Operator Salary</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rentals && rentals.length > 0 ? rentals.map(rental => {
                            const startDate = new Date(rental.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const endDate = new Date(rental.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return `
                                <tr>
                                    <td>${rental.user_name}</td>
                                    <td>${rental.equipment_name}</td>
                                    <td>${rental.equipment_type}</td>
                                    <td>${startDate}</td>
                                    <td>${endDate}</td>
                                    <td>${rental.total_days} days</td>
                                    <td>₱${parseFloat(rental.total_cost).toFixed(2)}</td>
                                    <td>₱${parseFloat(rental.operator_salary).toFixed(2)}</td>
                                    <td><span class="status-badge ${rental.status.toLowerCase()}">${rental.status}</span></td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="9" style="text-align: center;">No rentals found</td></tr>'}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>CropTop Admin Dashboard - Member Equipment Rentals Report</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Error', 'Failed to generate report', 'error');
    }
};

// Helper function to show modal
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}