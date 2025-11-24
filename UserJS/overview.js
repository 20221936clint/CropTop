// Overview module
import { supabase } from './config.js';
import { getCurrentUser } from './session.js';

// Load Overview
async function loadOverview() {
    const container = document.getElementById('contentContainer');
    const currentUser = getCurrentUser();
    
    if (!container) {
        console.error('Content container not found');
        return;
    }
    
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
        
        // Fetch user's crop data
        const { data: crops, error: cropsError } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('*')
            .eq('user_id', currentUser.user_id);
        
        if (cropsError) {
            console.error('Error fetching crops:', cropsError);
        }
        
        // Fetch user's fertilizer distributions
        const { data: fertilizers, error: fertilizersError } = await supabase
            .from('app_3704573dd8_fertilizer_distribution')
            .select('*')
            .eq('user_id', currentUser.user_id)
            .order('distribution_date', { ascending: false });
        
        if (fertilizersError) {
            console.error('Error fetching fertilizers:', fertilizersError);
        }
        
        // Fetch user's rental requests
        const { data: rentals, error: rentalsError } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .eq('user_id', currentUser.user_id)
            .order('created_at', { ascending: false });
        
        if (rentalsError) {
            console.error('Error fetching rentals:', rentalsError);
        }
        
        // Calculate stats
        const totalCrops = crops ? crops.length : 0;
        const farmHectares = userData?.total_hectares || 0;
        const plantedHectares = crops ? crops.reduce((sum, crop) => sum + (parseFloat(crop.area_planted) || 0), 0).toFixed(2) : '0.00';
        const totalFertilizers = fertilizers ? fertilizers.length : 0;
        const totalRentals = rentals ? rentals.length : 0;
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">${totalCrops}</div>
                        <div class="stat-label">Total Crops</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon green">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">${farmHectares}</div>
                        <div class="stat-label">Farm Hectares</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">${plantedHectares}</div>
                        <div class="stat-label">Planted Hectares</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                            <circle cx="7" cy="17" r="2"></circle>
                            <circle cx="17" cy="17" r="2"></circle>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">${totalRentals}</div>
                        <div class="stat-label">Equipment Rentals</div>
                    </div>
                </div>
            </div>
            
            ${rentals && rentals.length > 0 ? `
                <div class="activity-section">
                    <h2 class="section-header">Recent Equipment Rental Requests</h2>
                    <div class="fertilizer-list">
                        ${rentals.slice(0, 3).map(rental => `
                            <div class="fertilizer-item">
                                <div class="fertilizer-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                                        <circle cx="7" cy="17" r="2"></circle>
                                        <circle cx="17" cy="17" r="2"></circle>
                                    </svg>
                                </div>
                                <div class="fertilizer-details">
                                    <div class="fertilizer-type"><strong>${rental.equipment_name}</strong></div>
                                    <div class="fertilizer-info">
                                        <span>${rental.total_days} days</span>
                                        <span>•</span>
                                        <span>₱${parseFloat(rental.total_cost).toFixed(2)}</span>
                                        <span>•</span>
                                        <span>${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span class="status-badge ${rental.status.toLowerCase()}">${rental.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${fertilizers && fertilizers.length > 0 ? `
                <div class="activity-section">
                    <h2 class="section-header">Recent Fertilizer Distributions</h2>
                    <div class="fertilizer-list">
                        ${fertilizers.slice(0, 3).map(fert => `
                            <div class="fertilizer-item">
                                <div class="fertilizer-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                    </svg>
                                </div>
                                <div class="fertilizer-details">
                                    <div class="fertilizer-type"><strong>${fert.fertilizer_type}</strong></div>
                                    <div class="fertilizer-info">
                                        <span>${fert.quantity} kg</span>
                                        <span>•</span>
                                        <span>${new Date(fert.distribution_date).toLocaleDateString()}</span>
                                    </div>
                                    ${fert.purpose ? `<div class="fertilizer-purpose">${fert.purpose}</div>` : ''}
                                </div>
                                <span class="status-badge ${fert.status || 'completed'}">${fert.status || 'Completed'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Error loading overview:', error);
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Total Crops</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon green">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Farm Hectares</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon orange">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">0.00</div>
                        <div class="stat-label">Planted Hectares</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                            <circle cx="7" cy="17" r="2"></circle>
                            <circle cx="17" cy="17" r="2"></circle>
                        </svg>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Equipment Rentals</div>
                    </div>
                </div>
            </div>
            
            <div class="activity-section">
                <h2 class="section-header">Recent Activity</h2>
                <div class="no-activity">Error loading data. Please try again.</div>
            </div>
        `;
    }
}

export { loadOverview };