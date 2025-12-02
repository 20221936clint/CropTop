// Fertilizer module
import { supabase } from './config.js';
import { getCurrentUser } from './session.js';

// Load Membership - Now shows fertilizer distributions with photos
async function loadMembership() {
    const container = document.getElementById('contentContainer');
    const currentUser = getCurrentUser();
    
    try {
        // Fetch user's fertilizer distributions
        const { data: fertilizers, error } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .select('*')
            .eq('user_id', currentUser.user_id)
            .order('distribution_date', { ascending: false });
        
        if (error) throw error;
        
        // Calculate total quantity
        const totalQuantity = fertilizers ? fertilizers.reduce((sum, f) => sum + parseFloat(f.quantity || 0), 0) : 0;
        
        // Filter fertilizers with photos
        const fertilizersWithPhotos = fertilizers ? fertilizers.filter(f => f.photo_url) : [];
        
        container.innerHTML = `
            <div class="membership-container">
                <div class="membership-header">
                    <h2 class="section-header">My Fertilizer Distributions</h2>
                    <div class="fertilizer-summary">
                        <div class="summary-card">
                            <div class="summary-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                            </div>
                            <div class="summary-details">
                                <div class="summary-value">${fertilizers ? fertilizers.length : 0}</div>
                                <div class="summary-label">Total Distributions</div>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                            </div>
                            <div class="summary-details">
                                <div class="summary-value">${totalQuantity.toFixed(2)} kg</div>
                                <div class="summary-label">Total Quantity</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${fertilizersWithPhotos.length > 0 ? `
                    <div class="fertilizer-photos-section" style="margin-bottom: 2rem;">
                        <h3 class="section-subheader" style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            Fertilizer Photos Gallery
                        </h3>
                        <div class="photo-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                            ${fertilizersWithPhotos.map(fert => `
                                <div class="photo-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" 
                                     onclick="viewFertilizerPhotoDetails('${fert.id}')">
                                    <div class="photo-wrapper" style="position: relative; padding-top: 100%; overflow: hidden;">
                                        <img src="${fert.photo_url}" alt="${fert.fertilizer_type}" 
                                             style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                    </div>
                                    <div class="photo-info" style="padding: 0.75rem;">
                                        <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 600; color: #2c3e50;">${fert.fertilizer_type}</h4>
                                        <p style="margin: 0; font-size: 0.85rem; color: #7f8c8d;">${fert.quantity} kg</p>
                                        <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #95a5a6;">${new Date(fert.distribution_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${fertilizers && fertilizers.length > 0 ? `
                    <h3 class="section-subheader" style="margin-bottom: 1rem;">Distribution Details</h3>
                    <div class="fertilizer-distributions">
                        ${fertilizers.map(fert => `
                            <div class="distribution-card">
                                <div class="distribution-header">
                                    <div class="distribution-type">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                        </svg>
                                        <h3>${fert.fertilizer_type}</h3>
                                    </div>
                                    <span class="status-badge ${fert.status || 'completed'}">${fert.status || 'Completed'}</span>
                                </div>
                                <div class="distribution-details">
                                    ${fert.photo_url ? `
                                        <div class="detail-row" style="margin-bottom: 0.75rem;">
                                            <img src="${fert.photo_url}" alt="${fert.fertilizer_type}" 
                                                 style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; cursor: pointer;"
                                                 onclick="viewFertilizerPhoto('${fert.photo_url}')">
                                        </div>
                                    ` : ''}
                                    <div class="detail-row">
                                        <span class="detail-label">Quantity:</span>
                                        <span class="detail-value"><strong>${fert.quantity} kg</strong></span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Distribution Date:</span>
                                        <span class="detail-value">${new Date(fert.distribution_date).toLocaleDateString()}</span>
                                    </div>
                                    ${fert.purpose ? `
                                        <div class="detail-row">
                                            <span class="detail-label">Purpose:</span>
                                            <span class="detail-value">${fert.purpose}</span>
                                        </div>
                                    ` : ''}
                                    <div class="detail-row">
                                        <span class="detail-label">Received On:</span>
                                        <span class="detail-value">${new Date(fert.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #bbb; margin-bottom: 1rem;">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        <p>No fertilizer distributions yet</p>
                    </div>
                `}
            </div>
        `;
        
        // Add hover effects for photo cards
        const style = document.createElement('style');
        style.textContent = `
            .photo-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
            }
        `;
        document.head.appendChild(style);
        
    } catch (error) {
        console.error('Error loading fertilizer distributions:', error);
        container.innerHTML = `
            <div class="activity-section">
                <h2 class="section-header">My Fertilizer Distributions</h2>
                <div class="error">Error loading fertilizer distributions. Please try again later.</div>
            </div>
        `;
    }
}

// View Fertilizer Photo in Modal (for users)
window.viewFertilizerPhoto = function(photoUrl) {
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
};

// View Fertilizer Photo with Details
window.viewFertilizerPhotoDetails = async function(fertilizerId) {
    try {
        const currentUser = getCurrentUser();
        
        const { data: fert, error } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .select('*')
            .eq('id', fertilizerId)
            .eq('user_id', currentUser.user_id)
            .single();
        
        if (error) throw error;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2>${fert.fertilizer_type}</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div style="text-align: center;">
                            <img src="${fert.photo_url}" alt="${fert.fertilizer_type}" 
                                 style="max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        </div>
                        <div>
                            <h3 style="margin-top: 0; margin-bottom: 1rem; color: #2c3e50;">Distribution Details</h3>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 0.25rem;">Fertilizer Type</div>
                                    <div style="font-size: 1.1rem; font-weight: 600; color: #2c3e50;">${fert.fertilizer_type}</div>
                                </div>
                                <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 0.25rem;">Quantity</div>
                                    <div style="font-size: 1.1rem; font-weight: 600; color: #27ae60;">${fert.quantity} kg</div>
                                </div>
                                <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 0.25rem;">Distribution Date</div>
                                    <div style="font-size: 1rem; color: #2c3e50;">${new Date(fert.distribution_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                                ${fert.purpose ? `
                                    <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 0.25rem;">Purpose</div>
                                        <div style="font-size: 0.95rem; color: #2c3e50;">${fert.purpose}</div>
                                    </div>
                                ` : ''}
                                <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 0.25rem;">Status</div>
                                    <div><span class="status-badge ${fert.status || 'completed'}">${fert.status || 'Completed'}</span></div>
                                </div>
                                <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 0.25rem;">Received On</div>
                                    <div style="font-size: 0.9rem; color: #2c3e50;">${new Date(fert.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
    } catch (error) {
        console.error('Error loading fertilizer details:', error);
        alert('Failed to load fertilizer details');
    }
};

export { loadMembership };