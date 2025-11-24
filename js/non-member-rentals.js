// Non-Member Rental Guidelines (stored in localStorage with auto-save)
let nonMemberRentalGuidelines = localStorage.getItem('non_member_rental_guidelines') || 
`1. Non-members must pay a 15% premium on equipment rental rates.
2. Valid government-issued ID is required for verification.
3. Security deposit must be paid before equipment pickup.
4. Equipment must be returned in the same condition as rented.
5. Late returns will incur additional charges.
6. All damages must be reported and paid for immediately.`;

// Load Non-Member Rentals Section
async function loadNonMemberRentals() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="non-member-rentals-container">
            <div class="rentals-header">
                <h2 class="section-title">Non-Member Rentals Management</h2>
                <button class="add-rental-btn" onclick="openAddNonMemberRentalModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Non-Member Rental
                </button>
            </div>

            <!-- Rules & Guidelines Box -->
            <div class="guidelines-box">
                <div class="guidelines-header">
                    <h3 class="guidelines-title">Non-Member Rental Rules & Guidelines</h3>
                    <div class="guidelines-actions">
                        <button class="guidelines-btn edit" onclick="openEditNonMemberGuidelinesModal()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>
                    </div>
                </div>
                <div class="guidelines-content" id="nonMemberGuidelinesDisplay">${nonMemberRentalGuidelines}</div>
            </div>

            <!-- Non-Member Rentals Table -->
            <div class="rentals-table-container">
                <div class="table-header">
                    <h3 class="table-title">Non-Member Rentals</h3>
                </div>
                <div id="nonMemberRentalsTable">
                    <div class="loading">Loading rentals...</div>
                </div>
            </div>
        </div>
    `;
    
    loadNonMemberRentalsTable();

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.action-dropdown')) {
            document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// Load Non-Member Rentals Table
async function loadNonMemberRentalsTable() {
    try {
        const { data: rentals, error } = await supabase
            .from('app_3704573dd8_non_member_rentals')
            .select('*')
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('nonMemberRentalsTable');
        
        if (error) {
            console.error('Error loading non-member rentals:', error);
            container.innerHTML = '<div class="no-data">No non-member rentals found</div>';
            return;
        }
        
        if (!rentals || rentals.length === 0) {
            container.innerHTML = '<div class="no-data">No non-member rentals yet. Click "Add Non-Member Rental" to create one!</div>';
            return;
        }
        
        // Update status based on current date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        container.innerHTML = `
            <table class="rentals-table">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Phone</th>
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
                    ${rentals.map(rental => {
                        const endDate = new Date(rental.end_date);
                        endDate.setHours(0, 0, 0, 0);
                        
                        // Determine status
                        let currentStatus = rental.status || 'Active';
                        if (currentStatus === 'Active' && endDate < today) {
                            currentStatus = 'Overdue';
                        }
                        
                        return `
                            <tr>
                                <td><strong>${rental.customer_name}</strong></td>
                                <td>${rental.phone}</td>
                                <td>${rental.equipment_name || 'N/A'}</td>
                                <td>${rental.equipment_type || 'N/A'}</td>
                                <td>${new Date(rental.start_date).toLocaleDateString()}</td>
                                <td>${new Date(rental.end_date).toLocaleDateString()}</td>
                                <td>${rental.total_days}</td>
                                <td><strong>₱${parseFloat(rental.total_cost).toFixed(2)}</strong></td>
                                <td><span class="status-badge ${currentStatus.toLowerCase()}">${currentStatus}</span></td>
                                <td>
                                    <div class="action-dropdown">
                                        <button class="action-dropdown-btn" onclick="toggleActionDropdown(this)">
                                            Actions
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </button>
                                        <div class="action-dropdown-menu">
                                            ${(currentStatus === 'Active' || currentStatus === 'Overdue') ? `
                                                <button class="action-dropdown-item return" onclick="handleReturnNonMemberRental('${rental.id}')">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <polyline points="9 11 12 14 22 4"></polyline>
                                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                                    </svg>
                                                    Return
                                                </button>
                                                <button class="action-dropdown-item reschedule" onclick="openRescheduleNonMemberModal('${rental.id}', '${rental.end_date}')">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                    </svg>
                                                    Reschedule
                                                </button>
                                                <button class="action-dropdown-item cancel" onclick="handleCancelNonMemberRental('${rental.id}')">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                                    </svg>
                                                    Cancel
                                                </button>
                                            ` : ''}
                                            <button class="action-dropdown-item delete" onclick="deleteNonMemberRental('${rental.id}')">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading non-member rentals:', error);
        document.getElementById('nonMemberRentalsTable').innerHTML = '<div class="error">Error loading rentals</div>';
    }
}

// Toggle Action Dropdown
function toggleActionDropdown(btn) {
    // Close all other dropdowns first
    document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
        if (menu !== btn.nextElementSibling) {
            menu.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
    const menu = btn.nextElementSibling;
    menu.classList.toggle('show');
}

// Handle Return Non-Member Rental
async function handleReturnNonMemberRental(rentalId) {
    if (!confirm('Mark this rental as returned? This will update the status to "Returned".')) return;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_non_member_rentals')
            .update({ status: 'Returned' })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        showNotification('Success', 'Rental marked as returned successfully', 'success');
        loadNonMemberRentalsTable();
        
    } catch (error) {
        console.error('Error returning rental:', error);
        showNotification('Error', 'Failed to return rental: ' + error.message, 'error');
    }
}

// Handle Cancel Non-Member Rental
async function handleCancelNonMemberRental(rentalId) {
    if (!confirm('Cancel this rental? This action will update the status to "Cancelled".')) return;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_non_member_rentals')
            .update({ status: 'Cancelled' })
            .eq('id', rentalId);
        
        if (error) throw error;
        
        showNotification('Success', 'Rental cancelled successfully', 'success');
        loadNonMemberRentalsTable();
        
    } catch (error) {
        console.error('Error cancelling rental:', error);
        showNotification('Error', 'Failed to cancel rental: ' + error.message, 'error');
    }
}

// Open Reschedule Non-Member Modal
function openRescheduleNonMemberModal(rentalId, currentEndDate) {
    const modal = document.getElementById('rescheduleNonMemberModal');
    if (!modal) {
        // Create modal if it doesn't exist
        const modalHTML = `
            <div id="rescheduleNonMemberModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Reschedule Rental</h2>
                        <button class="close-btn" onclick="closeRescheduleNonMemberModal()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <form id="rescheduleNonMemberForm">
                        <input type="hidden" id="rescheduleRentalId">
                        <div class="form-group">
                            <label for="rescheduleNewEndDate">New End Date</label>
                            <input type="date" id="rescheduleNewEndDate" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" onclick="closeRescheduleNonMemberModal()">Cancel</button>
                            <button type="submit" class="submit-btn">Reschedule</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    const modalElement = document.getElementById('rescheduleNonMemberModal');
    modalElement.style.display = 'flex';
    
    document.getElementById('rescheduleRentalId').value = rentalId;
    document.getElementById('rescheduleNewEndDate').value = currentEndDate;
    document.getElementById('rescheduleNewEndDate').min = new Date().toISOString().split('T')[0];
    
    const form = document.getElementById('rescheduleNonMemberForm');
    form.onsubmit = handleRescheduleNonMemberRental;
}

// Close Reschedule Non-Member Modal
function closeRescheduleNonMemberModal() {
    document.getElementById('rescheduleNonMemberModal').style.display = 'none';
}

// Handle Reschedule Non-Member Rental
async function handleRescheduleNonMemberRental(e) {
    e.preventDefault();
    
    const rentalId = document.getElementById('rescheduleRentalId').value;
    const newEndDate = document.getElementById('rescheduleNewEndDate').value;
    
    try {
        // Get current rental data
        const { data: rental, error: fetchError } = await supabase
            .from('app_3704573dd8_non_member_rentals')
            .select('*')
            .eq('id', rentalId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Calculate new total days
        const startDate = new Date(rental.start_date);
        const endDate = new Date(newEndDate);
        const diffTime = Math.abs(endDate - startDate);
        const newTotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Recalculate costs
        const equipmentCostPerDay = (rental.equipment_cost / rental.total_days);
        const operatorSalaryPerDay = (rental.operator_salary / rental.total_days);
        
        const newEquipmentCost = equipmentCostPerDay * newTotalDays;
        const newOperatorSalary = operatorSalaryPerDay * newTotalDays;
        const newTotalCost = newEquipmentCost + newOperatorSalary;
        
        // Update rental
        const { error: updateError } = await supabase
            .from('app_3704573dd8_non_member_rentals')
            .update({
                end_date: newEndDate,
                total_days: newTotalDays,
                equipment_cost: newEquipmentCost,
                operator_salary: newOperatorSalary,
                total_cost: newTotalCost,
                status: 'Active'
            })
            .eq('id', rentalId);
        
        if (updateError) throw updateError;
        
        showNotification('Success', 'Rental rescheduled successfully', 'success');
        closeRescheduleNonMemberModal();
        loadNonMemberRentalsTable();
        
    } catch (error) {
        console.error('Error rescheduling rental:', error);
        showNotification('Error', 'Failed to reschedule rental: ' + error.message, 'error');
    }
}

// Open Edit Non-Member Guidelines Modal
function openEditNonMemberGuidelinesModal() {
    const modal = document.getElementById('editNonMemberGuidelinesModal');
    modal.style.display = 'flex';
    
    const textarea = document.getElementById('nonMemberGuidelinesText');
    textarea.value = nonMemberRentalGuidelines;
    
    // Update character count
    updateCharCount();
    
    // Add character count listener
    textarea.addEventListener('input', updateCharCount);
    
    const form = document.getElementById('editNonMemberGuidelinesForm');
    form.onsubmit = handleEditNonMemberGuidelines;
}

// Update character count
function updateCharCount() {
    const textarea = document.getElementById('nonMemberGuidelinesText');
    const charCount = document.querySelector('.char-count');
    if (textarea && charCount) {
        charCount.textContent = `${textarea.value.length} / 500 characters`;
    }
}

// Close Edit Non-Member Guidelines Modal
function closeEditNonMemberGuidelinesModal() {
    document.getElementById('editNonMemberGuidelinesModal').style.display = 'none';
}

// Handle Edit Non-Member Guidelines
function handleEditNonMemberGuidelines(e) {
    e.preventDefault();
    
    const newGuidelines = document.getElementById('nonMemberGuidelinesText').value;
    
    if (newGuidelines.length > 500) {
        showNotification('Error', 'Guidelines cannot exceed 500 characters', 'error');
        return;
    }
    
    // Auto-save to localStorage
    localStorage.setItem('non_member_rental_guidelines', newGuidelines);
    nonMemberRentalGuidelines = newGuidelines;
    
    // Update display
    document.getElementById('nonMemberGuidelinesDisplay').textContent = newGuidelines;
    
    showNotification('Success', 'Guidelines updated and auto-saved successfully!', 'success');
    closeEditNonMemberGuidelinesModal();
}

// Open Add Non-Member Rental Modal
async function openAddNonMemberRentalModal() {
    const modal = document.getElementById('addNonMemberRentalModal');
    modal.style.display = 'flex';
    
    // Reset form
    document.getElementById('addNonMemberRentalForm').reset();
    resetCalculationSummary();
    
    // Load equipment dropdown
    await loadEquipmentForNonMemberRental();
    
    // Set minimum dates to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('nmStartDate').min = today;
    document.getElementById('nmEndDate').min = today;
    
    // Add event listeners for auto-calculation
    document.getElementById('nmEquipment').addEventListener('change', calculateNonMemberRentalCost);
    document.getElementById('nmStartDate').addEventListener('change', calculateNonMemberRentalCost);
    document.getElementById('nmEndDate').addEventListener('change', calculateNonMemberRentalCost);
    
    // Add form submit handler
    const form = document.getElementById('addNonMemberRentalForm');
    form.onsubmit = handleAddNonMemberRental;
}

// Close Add Non-Member Rental Modal
function closeAddNonMemberRentalModal() {
    document.getElementById('addNonMemberRentalModal').style.display = 'none';
}

// Load Equipment for Non-Member Rental
async function loadEquipmentForNonMemberRental() {
    try {
        const { data: equipment, error } = await supabase
            .from('app_3704573dd8_equipment')
            .select('*')
            .eq('status', 'AVAILABLE')
            .order('equipment_name', { ascending: true });
        
        if (error) throw error;
        
        const select = document.getElementById('nmEquipment');
        select.innerHTML = '<option value="">Select Equipment</option>';
        
        if (equipment && equipment.length > 0) {
            equipment.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.equipment_name} - ${item.equipment_type}`;
                option.dataset.memberRate = item.member_rate;
                option.dataset.operatorRate = item.operator_rate;
                option.dataset.equipmentName = item.equipment_name;
                option.dataset.equipmentType = item.equipment_type;
                select.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading equipment:', error);
        showNotification('Error', 'Failed to load equipment: ' + error.message, 'error');
    }
}

// Calculate Non-Member Rental Cost
function calculateNonMemberRentalCost() {
    const equipmentSelect = document.getElementById('nmEquipment');
    const startDate = document.getElementById('nmStartDate').value;
    const endDate = document.getElementById('nmEndDate').value;
    
    if (!equipmentSelect.value || !startDate || !endDate) {
        resetCalculationSummary();
        return;
    }
    
    const selectedOption = equipmentSelect.options[equipmentSelect.selectedIndex];
    const memberRate = parseFloat(selectedOption.dataset.memberRate);
    const operatorRate = parseFloat(selectedOption.dataset.operatorRate);
    
    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
    
    if (totalDays <= 0) {
        showNotification('Warning', 'End date must be after start date', 'warning');
        resetCalculationSummary();
        return;
    }
    
    // Calculate costs with 15% increase on equipment cost only
    const equipmentCostPerDay = memberRate * 1.15; // 15% increase for non-members
    const totalEquipmentCost = equipmentCostPerDay * totalDays;
    const totalOperatorSalary = operatorRate * totalDays;
    const totalCost = totalEquipmentCost + totalOperatorSalary;
    
    // Update display
    document.getElementById('nmTotalDays').textContent = totalDays;
    document.getElementById('nmEquipmentCost').textContent = `₱${totalEquipmentCost.toFixed(2)}`;
    document.getElementById('nmOperatorSalary').textContent = `₱${totalOperatorSalary.toFixed(2)}`;
    document.getElementById('nmTotalCost').textContent = `₱${totalCost.toFixed(2)}`;
}

// Reset Calculation Summary
function resetCalculationSummary() {
    document.getElementById('nmTotalDays').textContent = '0';
    document.getElementById('nmEquipmentCost').textContent = '₱0.00';
    document.getElementById('nmOperatorSalary').textContent = '₱0.00';
    document.getElementById('nmTotalCost').textContent = '₱0.00';
}

// Handle Add Non-Member Rental
async function handleAddNonMemberRental(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Creating...';
    submitBtn.disabled = true;
    
    try {
        const equipmentSelect = document.getElementById('nmEquipment');
        const selectedOption = equipmentSelect.options[equipmentSelect.selectedIndex];
        
        const startDate = document.getElementById('nmStartDate').value;
        const endDate = document.getElementById('nmEndDate').value;
        
        // Calculate values
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const memberRate = parseFloat(selectedOption.dataset.memberRate);
        const operatorRate = parseFloat(selectedOption.dataset.operatorRate);
        
        const equipmentCostPerDay = memberRate * 1.15;
        const totalEquipmentCost = equipmentCostPerDay * totalDays;
        const totalOperatorSalary = operatorRate * totalDays;
        const totalCost = totalEquipmentCost + totalOperatorSalary;
        
        const formData = {
            customer_name: document.getElementById('nmCustomerName').value,
            phone: document.getElementById('nmPhone').value,
            address: document.getElementById('nmAddress').value,
            equipment_id: equipmentSelect.value,
            equipment_name: selectedOption.dataset.equipmentName,
            equipment_type: selectedOption.dataset.equipmentType,
            start_date: startDate,
            end_date: endDate,
            total_days: totalDays,
            operator_salary: totalOperatorSalary,
            equipment_cost: totalEquipmentCost,
            total_cost: totalCost,
            purpose: document.getElementById('nmPurpose').value,
            status: 'Active',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('app_3704573dd8_non_member_rentals')
            .insert([formData])
            .select();
        
        if (error) throw error;
        
        showNotification('Success', 'Non-member rental created successfully!', 'success');
        closeAddNonMemberRentalModal();
        loadNonMemberRentalsTable();
        
    } catch (error) {
        console.error('Error adding non-member rental:', error);
        showNotification('Error', 'Failed to create rental: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Delete Non-Member Rental
async function deleteNonMemberRental(rentalId) {
    if (!confirm('Are you sure you want to delete this non-member rental? This action cannot be undone.')) return;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_non_member_rentals')
            .delete()
            .eq('id', rentalId);
        
        if (error) throw error;
        
        showNotification('Success', 'Non-member rental deleted successfully', 'success');
        loadNonMemberRentalsTable();
        
    } catch (error) {
        console.error('Error deleting non-member rental:', error);
        showNotification('Error', 'Failed to delete rental: ' + error.message, 'error');
    }
}