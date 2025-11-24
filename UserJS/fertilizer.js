// Fertilizer module
import { supabase } from './config.js';
import { getCurrentUser } from './session.js';

// Load Membership - Now shows fertilizer distributions
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
                
                ${fertilizers && fertilizers.length > 0 ? `
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

export { loadMembership };