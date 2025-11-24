// Equipment module
import { supabase } from './config.js';
import { getCurrentUser } from './session.js';

// Load Equipment Rentals
async function loadEquipmentRentals() {
    const container = document.getElementById('contentContainer');
    const currentUser = getCurrentUser();
    
    try {
        // Fetch available equipment from database
        const { data: equipment, error: equipmentError } = await supabase
            .from('app_3704573dd8_equipment')
            .select('*')
            .eq('status', 'AVAILABLE')
            .order('equipment_name', { ascending: true });
        
        if (equipmentError) {
            console.error('Error fetching equipment:', equipmentError);
        }
        
        // Fetch user's rental requests
        const { data: userRentals, error: rentalsError } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .eq('user_id', currentUser.user_id)
            .order('created_at', { ascending: false });
        
        if (rentalsError) {
            console.error('Error fetching rentals:', rentalsError);
        }
        
        // Sample rental rules data
        const rentalRules = [
            "Equipment must be returned in the same condition as received",
            "Rental period starts from the date of pickup",
            "Late returns will incur additional charges of ₱100 per day",
            "Operator services are optional and charged separately",
            "Damage or loss of equipment will be charged to the renter",
            "Advance booking is required at least 3 days before rental date"
        ];
        
        container.innerHTML = `
            <div class="equipment-rentals-container">
                <div class="equipment-rentals-header">
                    <h2 class="section-header">Equipment Rentals</h2>
                </div>
                
                <!-- Rental Rules Box -->
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h3 style="color: #856404; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.5rem;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Rental Rules & Guidelines
                    </h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${rentalRules.map(rule => `
                            <li style="padding: 0.5rem 0; color: #856404; position: relative; padding-left: 1.5rem;">
                                <span style="position: absolute; left: 0;">•</span>
                                ${rule}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <!-- My Rental Requests Table -->
                <div id="myRentalRequestsContainer" style="background: var(--white); border-radius: 12px; padding: 1.5rem; box-shadow: var(--card-shadow); margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--text-dark); font-size: 1.25rem;">My Rental Requests</h3>
                    ${userRentals && userRentals.length > 0 ? `
                        <div style="overflow-x: auto;">
                            <table class="equipment-table">
                                <thead>
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Total Cost</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${userRentals.map(rental => `
                                        <tr>
                                            <td><strong>${rental.equipment_name}</strong></td>
                                            <td>${rental.equipment_type}</td>
                                            <td>${new Date(rental.start_date).toLocaleDateString()}</td>
                                            <td>${new Date(rental.end_date).toLocaleDateString()}</td>
                                            <td>${rental.total_days} days</td>
                                            <td><strong>₱${parseFloat(rental.total_cost).toFixed(2)}</strong></td>
                                            <td><span class="status-badge ${rental.status.toLowerCase()}">${rental.status}</span></td>
                                            <td>
                                                <div class="rental-actions-dropdown" style="position: relative;">
                                                    ${rental.status === 'PENDING' || rental.status === 'APPROVED' ? `
                                                        <button class="action-dropdown-btn" onclick="toggleRentalActionsDropdown(event, '${rental.id}')" style="background: #2196f3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
                                                            Actions
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                            </svg>
                                                        </button>
                                                        <div class="rental-actions-menu" id="rental-actions-${rental.id}" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #e0e0e0; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 150px; z-index: 1000; margin-top: 0.25rem;">
                                                            ${rental.status === 'PENDING' ? `
                                                                <button onclick="openRescheduleModal('${rental.id}', '${rental.start_date}', '${rental.end_date}')" style="width: 100%; text-align: left; padding: 0.75rem 1rem; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #2196f3; font-size: 0.9rem;">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                    </svg>
                                                                    Reschedule
                                                                </button>
                                                                <button onclick="cancelUserRental('${rental.id}')" style="width: 100%; text-align: left; padding: 0.75rem 1rem; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #f44336; font-size: 0.9rem; border-top: 1px solid #f0f0f0;">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                                                    </svg>
                                                                    Cancel
                                                                </button>
                                                            ` : rental.status === 'APPROVED' ? `
                                                                <button onclick="openRescheduleModal('${rental.id}', '${rental.start_date}', '${rental.end_date}')" style="width: 100%; text-align: left; padding: 0.75rem 1rem; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #2196f3; font-size: 0.9rem;">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                    </svg>
                                                                    Reschedule
                                                                </button>
                                                                <button onclick="cancelUserRental('${rental.id}')" style="width: 100%; text-align: left; padding: 0.75rem 1rem; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #f44336; font-size: 0.9rem; border-top: 1px solid #f0f0f0;">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                                                    </svg>
                                                                    Cancel
                                                                </button>
                                                                <button onclick="returnEquipment('${rental.id}')" style="width: 100%; text-align: left; padding: 0.75rem 1rem; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: #4caf50; font-size: 0.9rem; border-top: 1px solid #f0f0f0;">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                                    </svg>
                                                                    Return
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                    ` : rental.cancellation_reason ? `
                                                        <button class="action-btn-small" onclick="viewCancellationReason('${rental.cancellation_reason}')" style="background: #9e9e9e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                                            View Reason
                                                        </button>
                                                    ` : '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="no-data">You have no rental requests yet.</div>
                    `}
                </div>
                
                <!-- Available Equipment Table -->
                <div id="availableEquipmentContainer" style="background: var(--white); border-radius: 12px; padding: 1.5rem; box-shadow: var(--card-shadow); overflow-x: auto;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--text-dark); font-size: 1.25rem;">Available Equipment</h3>
                    ${equipment && equipment.length > 0 ? `
                        <table class="equipment-table">
                            <thead>
                                <tr>
                                    <th>Equipment Name</th>
                                    <th>Type</th>
                                    <th>Rate/Day (₱)</th>
                                    <th>Operator Rate/Day (₱)</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${equipment.map(item => `
                                    <tr>
                                        <td><strong>${item.equipment_name}</strong></td>
                                        <td>${item.equipment_type}</td>
                                        <td>₱${parseFloat(item.member_rate).toFixed(2)}</td>
                                        <td>₱${parseFloat(item.operator_rate).toFixed(2)}</td>
                                        <td><span class="status-badge available">${item.status}</span></td>
                                        <td>
                                            <button class="action-btn-small view" onclick="openRequestModal('${item.id}', '${item.equipment_name}', '${item.equipment_type}', ${item.member_rate}, ${item.operator_rate})">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                                Request
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div class="no-data">No equipment available at this time. Please check back later.</div>
                    `}
                </div>
            </div>
            
            <!-- Request Equipment Modal -->
            <div id="requestEquipmentModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Request Equipment Rental</h2>
                        <button class="close-modal" onclick="closeRequestEquipmentModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="requestEquipmentForm" class="rental-form">
                            <input type="hidden" id="requestEquipmentId">
                            <input type="hidden" id="requestMemberRate">
                            <input type="hidden" id="requestOperatorRate">
                            
                            <div class="form-group">
                                <label>Equipment</label>
                                <input type="text" id="requestEquipmentDisplay" readonly style="background: #f5f5f5;">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="rentalStartDate">Start Date *</label>
                                    <input type="date" id="rentalStartDate" name="rentalStartDate" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="rentalEndDate">End Date *</label>
                                    <input type="date" id="rentalEndDate" name="rentalEndDate" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="totalDays">Total Days</label>
                                <input type="number" id="totalDays" name="totalDays" readonly style="background: #f5f5f5;">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="equipmentCostInput">Equipment Cost (₱)</label>
                                    <input type="number" id="equipmentCostInput" name="equipmentCostInput" step="0.01" readonly style="background: #f5f5f5;">
                                </div>
                                
                                <div class="form-group">
                                    <label for="operatorSalaryInput">Operator Salary (₱)</label>
                                    <input type="number" id="operatorSalaryInput" name="operatorSalaryInput" step="0.01" readonly style="background: #f5f5f5;">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="totalCostInput">Total Cost (₱)</label>
                                <input type="number" id="totalCostInput" name="totalCostInput" step="0.01" readonly style="background: #f5f5f5; font-weight: bold;">
                            </div>
                            
                            <div class="form-group">
                                <label for="purpose">Purpose *</label>
                                <textarea id="purpose" name="purpose" rows="3" placeholder="Describe the purpose of this rental..." required></textarea>
                            </div>
                            
                            <div class="button-group" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                                <button type="button" class="cancel-btn" onclick="closeRequestEquipmentModal()" style="flex: 1; padding: 0.875rem; background: #e0e0e0; color: #333; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                                <button type="submit" class="submit-btn" style="flex: 1;">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Reschedule Modal -->
            <div id="rescheduleModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Reschedule Rental</h2>
                        <button class="close-modal" onclick="closeRescheduleModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="rescheduleForm" class="rental-form">
                            <input type="hidden" id="rescheduleRentalId">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="rescheduleStartDate">New Start Date *</label>
                                    <input type="date" id="rescheduleStartDate" name="rescheduleStartDate" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="rescheduleEndDate">New End Date *</label>
                                    <input type="date" id="rescheduleEndDate" name="rescheduleEndDate" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="rescheduleReason">Reason for Rescheduling *</label>
                                <textarea id="rescheduleReason" name="rescheduleReason" rows="3" placeholder="Please provide a reason for rescheduling..." required></textarea>
                            </div>
                            
                            <div class="button-group" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                                <button type="button" class="cancel-btn" onclick="closeRescheduleModal()" style="flex: 1; padding: 0.875rem; background: #e0e0e0; color: #333; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                                <button type="submit" class="submit-btn" style="flex: 1;">
                                    Submit Reschedule Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Attach reschedule form handler
        const rescheduleForm = document.getElementById('rescheduleForm');
        if (rescheduleForm) {
            rescheduleForm.addEventListener('submit', handleRescheduleSubmit);
        }
        
    } catch (error) {
        console.error('Error loading equipment rentals:', error);
        container.innerHTML = `
            <div class="activity-section">
                <h2 class="section-header">Equipment Rentals</h2>
                <div class="error">Error loading equipment. Please try again later.</div>
            </div>
        `;
    }
}

// Toggle rental actions dropdown
window.toggleRentalActionsDropdown = function(event, rentalId) {
    event.stopPropagation();
    const menu = document.getElementById(`rental-actions-${rentalId}`);
    
    // Close all other dropdowns
    document.querySelectorAll('.rental-actions-menu').forEach(m => {
        if (m.id !== `rental-actions-${rentalId}`) {
            m.style.display = 'none';
        }
    });
    
    // Toggle current dropdown
    if (menu) {
        menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
    }
};

// Close dropdowns when clicking outside
document.addEventListener('click', function() {
    document.querySelectorAll('.rental-actions-menu').forEach(menu => {
        menu.style.display = 'none';
    });
});

// Open Reschedule Modal
window.openRescheduleModal = function(rentalId, currentStartDate, currentEndDate) {
    const modal = document.getElementById('rescheduleModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('rescheduleRentalId').value = rentalId;
        
        // Set minimum dates to today
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById('rescheduleStartDate');
        const endDateInput = document.getElementById('rescheduleEndDate');
        
        startDateInput.min = today;
        endDateInput.min = today;
        startDateInput.value = currentStartDate;
        endDateInput.value = currentEndDate;
        
        // Close the actions dropdown
        document.querySelectorAll('.rental-actions-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
};

// Close Reschedule Modal
window.closeRescheduleModal = function() {
    const modal = document.getElementById('rescheduleModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('rescheduleForm').reset();
    }
};

// Handle Reschedule Submit
async function handleRescheduleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const rentalId = document.getElementById('rescheduleRentalId').value;
        const newStartDate = document.getElementById('rescheduleStartDate').value;
        const newEndDate = document.getElementById('rescheduleEndDate').value;
        const reason = document.getElementById('rescheduleReason').value;
        
        // Validate dates
        if (new Date(newEndDate) <= new Date(newStartDate)) {
            alert('End date must be after start date');
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            return;
        }
        
        // Calculate new total days and cost
        const start = new Date(newStartDate);
        const end = new Date(newEndDate);
        const timeDiff = end.getTime() - start.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Fetch the original rental to get rates
        const { data: rental, error: fetchError } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .eq('id', rentalId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const equipmentCostPerDay = parseFloat(rental.equipment_cost) / parseInt(rental.total_days);
        const operatorSalaryPerDay = parseFloat(rental.operator_salary) / parseInt(rental.total_days);
        
        const newEquipmentCost = equipmentCostPerDay * totalDays;
        const newOperatorSalary = operatorSalaryPerDay * totalDays;
        const newTotalCost = newEquipmentCost + newOperatorSalary;
        
        // Update the rental request with RESCHEDULED status
        const { error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .update({ 
                start_date: newStartDate,
                end_date: newEndDate,
                total_days: totalDays,
                equipment_cost: newEquipmentCost,
                operator_salary: newOperatorSalary,
                total_cost: newTotalCost,
                reschedule_reason: reason,
                status: 'RESCHEDULED',
                updated_at: new Date().toISOString()
            })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        alert('Rental rescheduled successfully. Admin has been notified and will review your request.');
        closeRescheduleModal();
        loadEquipmentRentals();
        
    } catch (error) {
        console.error('Error rescheduling rental:', error);
        alert('Failed to reschedule rental: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Cancel User Rental
window.cancelUserRental = async function(rentalId) {
    const reason = prompt('Please provide a reason for cancellation:');
    
    if (!reason || reason.trim() === '') {
        alert('Cancellation reason is required');
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
        
        alert('Rental request cancelled successfully. Admin has been notified.');
        
        // Close the actions dropdown
        document.querySelectorAll('.rental-actions-menu').forEach(menu => {
            menu.style.display = 'none';
        });
        
        loadEquipmentRentals();
        
    } catch (error) {
        console.error('Error cancelling rental:', error);
        alert('Failed to cancel rental request: ' + error.message);
    }
};

// Return Equipment
window.returnEquipment = async function(rentalId) {
    if (!confirm('Are you sure you want to mark this equipment as returned? This action will notify the admin.')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .update({ 
                status: 'RETURNED',
                return_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        alert('Equipment marked as returned successfully. Admin has been notified for verification.');
        
        // Close the actions dropdown
        document.querySelectorAll('.rental-actions-menu').forEach(menu => {
            menu.style.display = 'none';
        });
        
        loadEquipmentRentals();
        
    } catch (error) {
        console.error('Error returning equipment:', error);
        alert('Failed to mark equipment as returned: ' + error.message);
    }
};

// View Cancellation Reason
window.viewCancellationReason = function(reason) {
    alert('Cancellation Reason:\n\n' + reason);
};

// Open Request Modal
window.openRequestModal = function(equipmentId, equipmentName, equipmentType, memberRate, operatorRate) {
    const modal = document.getElementById('requestEquipmentModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Set equipment details
        document.getElementById('requestEquipmentId').value = equipmentId;
        document.getElementById('requestEquipmentDisplay').value = `${equipmentName} - ${equipmentType}`;
        document.getElementById('requestMemberRate').value = memberRate;
        document.getElementById('requestOperatorRate').value = operatorRate;
        
        // Set minimum dates to today
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById('rentalStartDate');
        const endDateInput = document.getElementById('rentalEndDate');
        
        startDateInput.min = today;
        endDateInput.min = today;
        startDateInput.value = '';
        endDateInput.value = '';
        
        // Reset calculated fields
        document.getElementById('totalDays').value = '';
        document.getElementById('equipmentCostInput').value = '';
        document.getElementById('operatorSalaryInput').value = '';
        document.getElementById('totalCostInput').value = '';
        document.getElementById('purpose').value = '';
        
        // Add event listeners for date calculation
        startDateInput.removeEventListener('change', calculateRentalCost);
        endDateInput.removeEventListener('change', calculateRentalCost);
        startDateInput.addEventListener('change', calculateRentalCost);
        endDateInput.addEventListener('change', calculateRentalCost);
        
        // Add form submit handler
        const form = document.getElementById('requestEquipmentForm');
        form.onsubmit = handleRequestEquipmentSubmit;
    }
};

// Close Request Equipment Modal
window.closeRequestEquipmentModal = function() {
    const modal = document.getElementById('requestEquipmentModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('requestEquipmentForm').reset();
    }
};

// Calculate Rental Cost
function calculateRentalCost() {
    const startDate = document.getElementById('rentalStartDate').value;
    const endDate = document.getElementById('rentalEndDate').value;
    
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
        alert('End date must be after start date');
        return;
    }
    
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const memberRate = parseFloat(document.getElementById('requestMemberRate').value);
    const operatorRate = parseFloat(document.getElementById('requestOperatorRate').value);
    
    const equipmentCost = memberRate * totalDays;
    const operatorSalary = operatorRate * totalDays;
    const totalCost = equipmentCost + operatorSalary;
    
    document.getElementById('totalDays').value = totalDays;
    document.getElementById('equipmentCostInput').value = equipmentCost.toFixed(2);
    document.getElementById('operatorSalaryInput').value = operatorSalary.toFixed(2);
    document.getElementById('totalCostInput').value = totalCost.toFixed(2);
}

// Handle Request Equipment Submit
async function handleRequestEquipmentSubmit(e) {
    e.preventDefault();
    const currentUser = getCurrentUser();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const equipmentId = document.getElementById('requestEquipmentId').value;
        const equipmentDisplay = document.getElementById('requestEquipmentDisplay').value;
        const [equipmentName, equipmentType] = equipmentDisplay.split(' - ');
        const startDate = document.getElementById('rentalStartDate').value;
        const endDate = document.getElementById('rentalEndDate').value;
        const totalDays = parseInt(document.getElementById('totalDays').value);
        const equipmentCost = parseFloat(document.getElementById('equipmentCostInput').value);
        const operatorSalary = parseFloat(document.getElementById('operatorSalaryInput').value);
        const totalCost = parseFloat(document.getElementById('totalCostInput').value);
        const purpose = document.getElementById('purpose').value;
        
        // Save to database
        const { data, error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .insert([{
                user_id: currentUser.user_id,
                user_name: currentUser.username || currentUser.full_name,
                equipment_id: equipmentId,
                equipment_name: equipmentName,
                equipment_type: equipmentType,
                start_date: startDate,
                end_date: endDate,
                total_days: totalDays,
                equipment_cost: equipmentCost,
                operator_salary: operatorSalary,
                total_cost: totalCost,
                purpose: purpose,
                status: 'PENDING',
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        alert('Equipment rental request submitted successfully! You will be notified once approved by admin.');
        closeRequestEquipmentModal();
        loadEquipmentRentals();
        
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('Error submitting request: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

export { loadEquipmentRentals };