// Membership Fee module
import { supabase } from './config.js';

// Load Membership Fee Details
async function loadMembershipFee() {
    const container = document.getElementById('contentContainer');
    
    // Show loading state
    container.innerHTML = `
        <div class="membership-container">
            <div class="loading">Loading membership details...</div>
        </div>
    `;
    
    try {
        // Get current user session
        const userSession = localStorage.getItem('user_session');
        if (!userSession) {
            container.innerHTML = '<div class="error">Please login to view membership details</div>';
            return;
        }
        
        const session = JSON.parse(userSession);
        // Fix: use user_id instead of id, matching the login script's storage format
        const userId = session.user_id || session.id;
        
        if (!userId) {
            throw new Error('User ID not found in session');
        }
        
        // Fetch user's membership details
        const { data: userData, error: userError } = await supabase
            .from('app_3704573dd8_users')
            .select('membership_status, membership_valid_until')
            .eq('id', userId)
            .single();
        
        if (userError) throw userError;
        
        // Fetch global membership fee settings
        const { data: feeData, error: feeError } = await supabase
            .from('app_3704573dd8_membership_fee')
            .select('*')
            .single();
        
        if (feeError && feeError.code !== 'PGRST116') throw feeError;
        
        // Use default values if no fee data exists
        const fee = feeData || {
            annual_fee: 500.00,
            valid_until_default: '2025-12-31',
            benefits: [
                'Access to Equipment Rentals|Rent agricultural equipment at member rates',
                'Fertilizer Distribution|Receive subsidized fertilizers for your crops',
                'Training & Workshops|Participate in agricultural training programs',
                'Market Access|Connect with buyers and access better market prices',
                'Technical Support|Get expert advice on crop management and farming practices'
            ]
        };
        
        const membershipStatus = userData?.membership_status || 'active';
        const validUntil = userData?.membership_valid_until || fee.valid_until_default;
        const isExpired = new Date(validUntil) < new Date();
        
        // Parse benefits
        const benefits = Array.isArray(fee.benefits) ? fee.benefits : 
            (typeof fee.benefits === 'string' ? fee.benefits.split(',') : []);
        
        // Determine status display
        let statusClass = membershipStatus;
        let statusText = membershipStatus === 'active' ? 'Active Member' : 'Inactive Member';
        
        if (membershipStatus === 'active' && isExpired) {
            statusClass = 'expired';
            statusText = 'Membership Expired';
        }
        
        container.innerHTML = `
            <div class="membership-container">
                <div class="membership-header">
                    <h2 class="section-header">Membership Fee Details</h2>
                </div>
                
                <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                        <div style="border-left: 4px solid #2196f3; padding-left: 1.5rem;">
                            <h3 style="color: #1e3a5f; margin-bottom: 1rem; font-size: 1.25rem;">Annual Membership Fee</h3>
                            <p style="font-size: 2rem; font-weight: 700; color: #2196f3; margin-bottom: 0.5rem;">₱${parseFloat(fee.annual_fee).toFixed(2)}</p>
                            <p style="color: #666; font-size: 0.95rem;">Per year</p>
                        </div>
                        
                        <div style="border-left: 4px solid ${statusClass === 'active' ? '#4caf50' : (statusClass === 'expired' ? '#ffc107' : '#f44336')}; padding-left: 1.5rem;">
                            <h3 style="color: #1e3a5f; margin-bottom: 1rem; font-size: 1.25rem;">Your Status</h3>
                            <p style="font-size: 1.5rem; font-weight: 600; color: ${statusClass === 'active' ? '#4caf50' : (statusClass === 'expired' ? '#ffc107' : '#f44336')}; margin-bottom: 0.5rem;">${statusText}</p>
                            <p style="color: #666; font-size: 0.95rem;">Valid until: ${new Date(validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                    <h3 style="color: #1e3a5f; margin-bottom: 1.5rem; font-size: 1.25rem;">Membership Benefits</h3>
                    <div style="display: grid; gap: 1rem;">
                        ${benefits.map(benefit => {
                            const [title, description] = benefit.split('|');
                            return `
                                <div style="display: flex; align-items: start; gap: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2" style="flex-shrink: 0;">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <div>
                                        <strong style="color: #1e3a5f;">${title}</strong>
                                        <p style="color: #666; margin-top: 0.25rem; font-size: 0.9rem;">${description}</p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1.5rem; border-radius: 8px;">
                    <h3 style="color: #856404; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.5rem;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Payment Information
                    </h3>
                    <p style="color: #856404; margin-bottom: 0.5rem;">Annual membership fee is due at the beginning of each calendar year.</p>
                    <p style="color: #856404;">For payment inquiries or renewal, please contact the cooperative office.</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading membership fee:', error);
        container.innerHTML = `
            <div class="membership-container">
                <div class="error">
                    <p>Error loading membership details. Please try again later.</p>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${error.message}</p>
                </div>
            </div>
        `;
    }
}

export { loadMembershipFee };