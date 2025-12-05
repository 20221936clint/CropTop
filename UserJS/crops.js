// Crops module
import { supabase } from './config.js';
import { getCurrentUser } from './session.js';

// Validate image file
function validateImageFile(file) {
    // Check file size (10MB max for better mobile compatibility)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
        throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
    }
    
    return true;
}

// Compress image before upload (helps with mobile uploads)
async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    } else {
                        reject(new Error('Image compression failed'));
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

// Load My Crops
async function loadMyCrops() {
    const container = document.getElementById('contentContainer');
    const currentUser = getCurrentUser();
    
    try {
        // Fetch fresh user data to get updated total_hectares
        const { data: userData, error: userError } = await supabase
            .from('app_3704573dd8_users')
            .select('total_hectares')
            .eq('id', currentUser.user_id)
            .single();
        
        if (userError) {
            console.error('Error fetching user data:', userError);
        }
        
        // Fetch user's crops
        const { data: crops, error } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('*')
            .eq('user_id', currentUser.user_id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Calculate total planted hectares
        const totalPlanted = crops ? crops.reduce((sum, crop) => sum + (parseFloat(crop.area_planted) || 0), 0) : 0;
        const farmHectares = userData?.total_hectares || 0;
        const availableHectares = (farmHectares - totalPlanted).toFixed(2);
        
        container.innerHTML = `
            <div class="crops-container">
                <div class="crops-header">
                    <h2 class="section-header">My Crops</h2>
                    <button class="add-crop-btn" onclick="showAddCropModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add New Crop
                    </button>
                </div>
                
                <div id="cropsListContainer">
                    ${crops && crops.length > 0 ? `
                        <div class="crops-grid">
                            ${crops.map(crop => `
                                <div class="crop-card">
                                    ${crop.photo_url ? `
                                        <div class="crop-photo">
                                            <img src="${crop.photo_url}" alt="${crop.crop_name}" />
                                        </div>
                                    ` : ''}
                                    <div class="crop-header">
                                        <h3>${crop.crop_name}</h3>
                                        <span class="crop-status ${crop.status || 'active'}">${crop.status || 'active'}</span>
                                    </div>
                                    <div class="crop-details">
                                        <div class="crop-detail-item">
                                            <span class="label">Variety:</span>
                                            <span class="value">${crop.variety || 'N/A'}</span>
                                        </div>
                                        <div class="crop-detail-item">
                                            <span class="label">Area Planted:</span>
                                            <span class="value">${crop.area_planted} ha</span>
                                        </div>
                                        <div class="crop-detail-item">
                                            <span class="label">Planting Date:</span>
                                            <span class="value">${new Date(crop.planting_date).toLocaleDateString()}</span>
                                        </div>
                                        <div class="crop-detail-item">
                                            <span class="label">Expected Harvest:</span>
                                            <span class="value">${crop.expected_harvest_date ? new Date(crop.expected_harvest_date).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        ${crop.expected_harvest_quantity ? `
                                            <div class="crop-detail-item">
                                                <span class="label">Expected Quantity:</span>
                                                <span class="value">${crop.expected_harvest_quantity} ${crop.harvest_unit || ''}</span>
                                            </div>
                                        ` : ''}
                                        ${crop.notes ? `
                                            <div class="crop-detail-item full-width">
                                                <span class="label">Notes:</span>
                                                <span class="value">${crop.notes}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="crop-actions">
                                        <button class="crop-action-btn delete" onclick="deleteCrop('${crop.id}')">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <p>No crops added yet. Click "Add New Crop" to get started!</p>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Add Crop Modal -->
            <div id="addCropModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add New Crop</h2>
                        <button class="close-modal" onclick="closeAddCropModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="hectares-info" style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: #1e3a5f;">Total Farm Hectares:</span>
                                <span style="font-weight: 600; color: #2196f3;">${farmHectares} ha</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; color: #1e3a5f;">Already Planted:</span>
                                <span style="font-weight: 600; color: #ff9800;">${totalPlanted.toFixed(2)} ha</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 2px solid #2196f3;">
                                <span style="font-weight: 700; color: #1e3a5f;">Available Hectares:</span>
                                <span style="font-weight: 700; color: #4caf50;">${availableHectares} ha</span>
                            </div>
                        </div>
                        <form id="addCropForm" class="crop-form">
                            <div class="form-group">
                                <label for="cropPhoto">Crop Photo</label>
                                <input type="file" id="cropPhoto" name="cropPhoto" accept="image/*">
                                <small style="color: #666; display: block; margin-top: 0.25rem;">Max 10MB. Supported: JPG, PNG, WebP, GIF</small>
                                <div id="photoPreview" class="photo-preview" style="display: none;">
                                    <img id="previewImage" src="" alt="Preview" />
                                    <button type="button" class="remove-photo-btn" onclick="removePhotoPreview()">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="cropName">Crop Name *</label>
                                <input type="text" id="cropName" name="cropName" placeholder="e.g., Rice, Corn, Wheat" required>
                                <span class="error-message">This field is required</span>
                            </div>
                            
                            <div class="form-group">
                                <label for="variety">Variety *</label>
                                <input type="text" id="variety" name="variety" placeholder="e.g., IR64, Sweet Corn" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="plantingDate">Planted Date *</label>
                                    <input type="date" id="plantingDate" name="plantingDate" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="expectedHarvestDate">Estimated Harvest Date *</label>
                                    <input type="date" id="expectedHarvestDate" name="expectedHarvestDate" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="areaPlanted">Planted Hectares * (Max: ${availableHectares} ha)</label>
                                    <input type="number" id="areaPlanted" name="areaPlanted" step="0.01" min="0.01" max="${availableHectares}" placeholder="0.0" required>
                                    <span class="error-message" id="areaPlantedError">Cannot exceed available hectares (${availableHectares} ha)</span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="expectedHarvestQuantity">Estimated Harvest Quantity *</label>
                                    <input type="number" id="expectedHarvestQuantity" name="expectedHarvestQuantity" step="0.01" placeholder="0.0" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="harvestUnit">Harvest Unit *</label>
                                <select id="harvestUnit" name="harvestUnit" required>
                                    <option value="">Select Unit</option>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="tons">Tons</option>
                                    <option value="bags">Bags</option>
                                    <option value="sacks">Sacks</option>
                                    <option value="Box">Box</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="notes">Notes</label>
                                <textarea id="notes" name="notes" rows="3" placeholder="Additional notes about this crop..."></textarea>
                            </div>
                            
                            <button type="submit" class="submit-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Crop
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Attach form submit handler
        const form = document.getElementById('addCropForm');
        if (form) {
            form.addEventListener('submit', handleAddCrop);
            
            // Add real-time validation for area planted
            const areaPlantedInput = document.getElementById('areaPlanted');
            if (areaPlantedInput) {
                areaPlantedInput.addEventListener('input', function() {
                    const value = parseFloat(this.value);
                    const maxValue = parseFloat(availableHectares);
                    const errorMsg = document.getElementById('areaPlantedError');
                    const formGroup = this.closest('.form-group');
                    
                    if (value > maxValue) {
                        formGroup.classList.add('error');
                        errorMsg.style.display = 'block';
                        this.setCustomValidity('Exceeds available hectares');
                    } else {
                        formGroup.classList.remove('error');
                        errorMsg.style.display = 'none';
                        this.setCustomValidity('');
                    }
                });
            }
            
            // Add photo preview functionality with validation
            const photoInput = document.getElementById('cropPhoto');
            if (photoInput) {
                photoInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            validateImageFile(file);
                            
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                const preview = document.getElementById('photoPreview');
                                const previewImage = document.getElementById('previewImage');
                                previewImage.src = e.target.result;
                                preview.style.display = 'block';
                            };
                            reader.onerror = function() {
                                alert('Error reading file. Please try again.');
                                photoInput.value = '';
                            };
                            reader.readAsDataURL(file);
                        } catch (error) {
                            alert(error.message);
                            photoInput.value = '';
                            document.getElementById('photoPreview').style.display = 'none';
                        }
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Error loading crops:', error);
        container.innerHTML = `
            <div class="activity-section">
                <h2 class="section-header">My Crops</h2>
                <div class="error">Error loading crops. Please try again.</div>
            </div>
        `;
    }
}

// Show Add Crop Modal
window.showAddCropModal = function() {
    const modal = document.getElementById('addCropModal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

// Close Add Crop Modal
window.closeAddCropModal = function() {
    const modal = document.getElementById('addCropModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('addCropForm').reset();
        document.getElementById('photoPreview').style.display = 'none';
    }
};

// Remove photo preview
window.removePhotoPreview = function() {
    document.getElementById('cropPhoto').value = '';
    document.getElementById('photoPreview').style.display = 'none';
};

// Handle Add Crop
async function handleAddCrop(e) {
    e.preventDefault();
    const currentUser = getCurrentUser();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Adding...';
    submitBtn.disabled = true;
    
    try {
        const areaPlanted = parseFloat(document.getElementById('areaPlanted').value);
        
        // Fetch fresh user data to get updated total_hectares
        const { data: userData, error: userError } = await supabase
            .from('app_3704573dd8_users')
            .select('total_hectares')
            .eq('id', currentUser.user_id)
            .single();
        
        if (userError) throw userError;
        
        // Fetch current crops to calculate total planted
        const { data: existingCrops, error: fetchError } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('area_planted')
            .eq('user_id', currentUser.user_id);
        
        if (fetchError) throw fetchError;
        
        const totalPlanted = existingCrops ? existingCrops.reduce((sum, crop) => sum + (parseFloat(crop.area_planted) || 0), 0) : 0;
        const farmHectares = userData?.total_hectares || 0;
        const availableHectares = farmHectares - totalPlanted;
        
        // Validate area planted
        if (areaPlanted > availableHectares) {
            alert(`Cannot add crop. You only have ${availableHectares.toFixed(2)} hectares available. You are trying to plant ${areaPlanted} hectares.`);
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            return;
        }
        
        // Upload photo if provided
        let photoUrl = null;
        const photoFile = document.getElementById('cropPhoto').files[0];
        if (photoFile) {
            try {
                // Validate file
                validateImageFile(photoFile);
                
                // Compress image
                const compressedFile = await compressImage(photoFile);
                
                const fileExt = 'jpg'; // Always use jpg after compression
                const fileName = `${currentUser.user_id}/crop_${Date.now()}.${fileExt}`;
                
                // Upload with retry logic
                let uploadSuccess = false;
                let retryCount = 0;
                const maxRetries = 3;
                
                while (!uploadSuccess && retryCount < maxRetries) {
                    try {
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('crop-photos')
                            .upload(fileName, compressedFile, {
                                cacheControl: '3600',
                                upsert: false,
                                contentType: 'image/jpeg'
                            });
                        
                        if (uploadError) {
                            throw uploadError;
                        }
                        
                        const { data: urlData } = supabase.storage
                            .from('crop-photos')
                            .getPublicUrl(fileName);
                        photoUrl = urlData.publicUrl;
                        uploadSuccess = true;
                    } catch (uploadError) {
                        retryCount++;
                        console.error(`Upload attempt ${retryCount} failed:`, uploadError);
                        
                        if (retryCount >= maxRetries) {
                            console.error('Photo upload failed after multiple attempts:', uploadError);
                            alert('Warning: Photo upload failed, but crop will be added without photo. Error: ' + uploadError.message);
                            break;
                        }
                        
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }
            } catch (photoError) {
                console.error('Error processing photo:', photoError);
                alert('Warning: Photo processing failed, but crop will be added without photo. Error: ' + photoError.message);
            }
        }
        
        const formData = {
            user_id: currentUser.user_id,
            crop_name: document.getElementById('cropName').value,
            variety: document.getElementById('variety').value || null,
            area_planted: areaPlanted,
            planting_date: document.getElementById('plantingDate').value,
            expected_harvest_date: document.getElementById('expectedHarvestDate').value || null,
            expected_harvest_quantity: parseFloat(document.getElementById('expectedHarvestQuantity').value) || null,
            harvest_unit: document.getElementById('harvestUnit').value || null,
            notes: document.getElementById('notes').value || null,
            photo_url: photoUrl,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('app_3704573dd8_user_crops')
            .insert([formData])
            .select();
        
        if (error) throw error;
        
        alert('Crop added successfully!');
        closeAddCropModal();
        loadMyCrops();
        
    } catch (error) {
        console.error('Error adding crop:', error);
        alert('Error adding crop: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Delete Crop
window.deleteCrop = async function(cropId) {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    
    try {
        // Get crop data to delete photo from storage
        const { data: cropData, error: fetchError } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('photo_url')
            .eq('id', cropId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Delete photo from storage if exists
        if (cropData.photo_url) {
            const photoPath = cropData.photo_url.split('/crop-photos/')[1];
            if (photoPath) {
                await supabase.storage
                    .from('crop-photos')
                    .remove([photoPath]);
            }
        }
        
        // Delete crop record
        const { error } = await supabase
            .from('app_3704573dd8_user_crops')
            .delete()
            .eq('id', cropId);
        
        if (error) throw error;
        
        alert('Crop deleted successfully!');
        loadMyCrops();
        
    } catch (error) {
        console.error('Error deleting crop:', error);
        alert('Error deleting crop: ' + error.message);
    }
};

export { loadMyCrops };