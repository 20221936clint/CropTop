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
                        <th>Photo</th>
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
                                ${dist.photo_url ? `
                                    <img src="${dist.photo_url}" alt="Fertilizer" 
                                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer;"
                                         onclick="viewFertilizerPhoto('${dist.photo_url}')">
                                ` : `
                                    <div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </div>
                                `}
                            </td>
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
                                    <button class="action-btn-small edit" onclick="editDistributionPhoto('${dist.id}', '${dist.photo_url || ''}')">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        ${dist.photo_url ? 'Change' : 'Add'} Photo
                                    </button>
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

// View Fertilizer Photo in Modal
function viewFertilizerPhoto(photoUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>Fertilizer Photo</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <img src="${photoUrl}" alt="Fertilizer" style="max-width: 100%; max-height: 70vh; border-radius: 8px;">
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Edit Distribution Photo
async function editDistributionPhoto(distributionId, currentPhotoUrl) {
    const modal = document.createElement('div');
    modal.id = 'editPhotoModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${currentPhotoUrl ? 'Change' : 'Add'} Fertilizer Photo</h2>
                <button class="close-modal" onclick="document.getElementById('editPhotoModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editPhotoForm" class="photo-form">
                    <input type="hidden" id="editPhotoDistributionId" value="${distributionId}">
                    
                    ${currentPhotoUrl ? `
                        <div class="current-photo" style="margin-bottom: 1rem; text-align: center;">
                            <p style="margin-bottom: 0.5rem; color: #666;">Current Photo:</p>
                            <img src="${currentPhotoUrl}" alt="Current" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label for="photoFile">Select New Photo *</label>
                        <input type="file" id="photoFile" name="photoFile" accept="image/*" required>
                        <small style="color: #666;">Supported formats: JPG, PNG, GIF (Max 5MB)</small>
                    </div>
                    
                    <div class="preview-container" id="previewContainer" style="display: none; margin-top: 1rem; text-align: center;">
                        <p style="margin-bottom: 0.5rem; color: #666;">Preview:</p>
                        <img id="photoPreview" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
                    </div>
                    
                    <button type="submit" class="submit-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Upload Photo
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Preview handler
    document.getElementById('photoFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('photoPreview').src = e.target.result;
                document.getElementById('previewContainer').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submit handler
    document.getElementById('editPhotoForm').onsubmit = handlePhotoUpload;
}

// Handle Photo Upload
async function handlePhotoUpload(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Uploading...';
    submitBtn.disabled = true;
    
    try {
        const distributionId = document.getElementById('editPhotoDistributionId').value;
        const fileInput = document.getElementById('photoFile');
        const file = fileInput.files[0];
        
        if (!file) {
            throw new Error('Please select a photo');
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
        }
        
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${distributionId}_${Date.now()}.${fileExt}`;
        const filePath = `fertilizer/${fileName}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('fertilizer-photos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('fertilizer-photos')
            .getPublicUrl(filePath);
        
        const photoUrl = urlData.publicUrl;
        
        // Update database with photo URL
        const { error: updateError } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .update({ photo_url: photoUrl })
            .eq('id', distributionId);
        
        if (updateError) throw updateError;
        
        showNotification('Success', 'Photo uploaded successfully!', 'success');
        document.getElementById('editPhotoModal').remove();
        loadDistributionTable();
        
    } catch (error) {
        console.error('Error uploading photo:', error);
        showNotification('Error', 'Failed to upload photo: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
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
        // Get the distribution to check if it has a photo
        const { data: dist, error: fetchError } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .select('photo_url')
            .eq('id', distributionId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Delete photo from storage if exists
        if (dist.photo_url) {
            const path = dist.photo_url.split('/fertilizer-photos/')[1];
            if (path) {
                await supabase.storage
                    .from('fertilizer-photos')
                    .remove([path]);
            }
        }
        
        // Delete distribution record
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