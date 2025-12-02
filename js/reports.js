// Load reports section - Make it globally accessible
window.loadReportsSection = async function() {
    const contentContainer = document.getElementById('contentContainer');
    
    // Get current date for the report
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    contentContainer.innerHTML = `
        <div class="dashboard-content" data-date="${currentDate}">
            <div class="section-header">
                <h2 class="section-title">CropTop - Reports</h2>
                <div class="header-actions">
                    <select id="monthFilter" class="month-filter" onchange="handleMonthChange()">
                        <!-- Will be populated dynamically -->
                    </select>
                    <button class="action-btn blue" onclick="refreshReports()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh
                    </button>
                    <button class="action-btn teal" onclick="printReport()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Print Report
                    </button>
                </div>
            </div>

            <!-- Summary Statistics Cards -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stat-card">
                    <div class="stat-icon-box green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Report Period:</p>
                        <h3 class="stat-number" id="reportPeriod">Loading...</h3>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon-box green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Total Crops:</p>
                        <h3 class="stat-number" id="cropsPlantedCount">0</h3>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon-box blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                            <circle cx="7" cy="17" r="2"></circle>
                            <circle cx="17" cy="17" r="2"></circle>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Equipment Rentals:</p>
                        <h3 class="stat-number" id="equipmentRentalsCount">0</h3>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon-box red">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Problems Reported:</p>
                        <h3 class="stat-number" id="problemsReportedCount">0</h3>
                    </div>
                </div>
            </div>

            <!-- Problems & Issues Section -->
            <div class="problems-section" id="problemsSection">
                <!-- Will be populated by loadProblemsAndIssues() -->
                <div class="loading-spinner">Loading problems...</div>
            </div>

            <!-- Detailed Reports Section -->
            <div class="detailed-reports-section">
                <h3 class="section-subtitle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    User Crops Report
                </h3>
                <div class="crops-list" id="cropsPlantedList">
                    <div class="loading-spinner">Loading crops...</div>
                </div>
            </div>

            <div class="detailed-reports-section">
                <h3 class="section-subtitle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                        <circle cx="7" cy="17" r="2"></circle>
                        <circle cx="17" cy="17" r="2"></circle>
                    </svg>
                    Equipment Rentals Report
                </h3>
                <div class="rentals-list" id="equipmentRentalsList">
                    <div class="loading-spinner">Loading rentals...</div>
                </div>
            </div>
        </div>
        
        <!-- Import Reply Modal from Admin Feedback -->
        <div class="reply-modal" id="replyModal">
            <div class="reply-modal-content">
                <div class="reply-modal-header">
                    <h2>Reply to Feedback</h2>
                    <button class="reply-modal-close" onclick="closeReportReplyModal()">&times;</button>
                </div>
                <div class="reply-modal-body">
                    <div class="feedback-details" id="reportFeedbackDetails">
                        <!-- Details will be loaded here -->
                    </div>
                    
                    <form class="reply-form" id="reportReplyForm">
                        <div class="form-group">
                            <label for="reportReplyText">Your Reply</label>
                            <textarea 
                                id="reportReplyText" 
                                placeholder="Type your reply here..."
                                required
                            ></textarea>
                        </div>
                    </form>
                </div>
                <div class="reply-modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeReportReplyModal()">Cancel</button>
                    <button type="button" class="btn-send-reply" onclick="submitReportReply()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 2L11 13"></path>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                        </svg>
                        Send Reply
                    </button>
                </div>
            </div>
        </div>
    `;

    // Initialize month filter with available months
    await initializeMonthFilter();
    
    // Load all report data
    await Promise.all([
        loadSummaryStatistics(),
        loadProblemsAndIssues(),
        loadCropsPlanted(),
        loadEquipmentRentals()
    ]);
}

// Initialize month filter with available data months
async function initializeMonthFilter() {
    const monthFilter = document.getElementById('monthFilter');
    if (!monthFilter) return;
    
    try {
        // Get all unique months from crops, rentals, and feedback
        const [cropsData, rentalsData, feedbackData] = await Promise.all([
            supabase.from('app_3704573dd8_user_crops').select('created_at'),
            supabase.from('app_3704573dd8_member_rental_requests').select('created_at'),
            supabase.from('app_3704573dd8_feedback').select('created_at')
        ]);
        
        const allDates = [
            ...(cropsData.data || []).map(d => d.created_at),
            ...(rentalsData.data || []).map(d => d.created_at),
            ...(feedbackData.data || []).map(d => d.created_at)
        ];
        
        // Extract unique year-month combinations
        const monthsSet = new Set();
        allDates.forEach(dateStr => {
            if (dateStr) {
                const date = new Date(dateStr);
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthsSet.add(yearMonth);
            }
        });
        
        // Convert to array and sort (newest first)
        const months = Array.from(monthsSet).sort().reverse();
        
        // If no data, add current month
        if (months.length === 0) {
            const now = new Date();
            months.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        }
        
        // Add "All Time" option at the beginning
        let optionsHTML = '<option value="all">All Time</option>';
        
        // Populate dropdown with months
        optionsHTML += months.map(yearMonth => {
            const [year, month] = yearMonth.split('-');
            const date = new Date(year, parseInt(month) - 1, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return `<option value="${yearMonth}">${monthName}</option>`;
        }).join('');
        
        monthFilter.innerHTML = optionsHTML;
        
        // Store selected month globally - default to "All Time"
        window.selectedMonth = 'all';
        
    } catch (error) {
        console.error('Error initializing month filter:', error);
        // Fallback to "All Time"
        monthFilter.innerHTML = '<option value="all">All Time</option>';
        window.selectedMonth = 'all';
    }
}

// Get date range for selected month
function getSelectedMonthRange() {
    const selectedMonth = document.getElementById('monthFilter')?.value || window.selectedMonth;
    
    // If "All Time" is selected, return null to indicate no date filtering
    if (selectedMonth === 'all') {
        return null;
    }
    
    if (!selectedMonth) {
        const now = new Date();
        return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        };
    }
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    
    return { start, end };
}

// Load Summary Statistics for the top cards
async function loadSummaryStatistics() {
    try {
        const dateRange = getSelectedMonthRange();
        
        // Update report period display
        const reportPeriodEl = document.getElementById('reportPeriod');
        if (reportPeriodEl) {
            if (dateRange === null) {
                reportPeriodEl.textContent = 'All Time';
            } else {
                reportPeriodEl.textContent = dateRange.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }
        }
        
        // Build queries with optional date filtering
        let cropsQuery = supabase.from('app_3704573dd8_user_crops').select('id');
        let rentalsQuery = supabase.from('app_3704573dd8_member_rental_requests').select('id, total_cost');
        let problemsQuery = supabase.from('app_3704573dd8_feedback').select('id');
        
        // Apply date filters only if not "All Time"
        if (dateRange !== null) {
            cropsQuery = cropsQuery.gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString());
            rentalsQuery = rentalsQuery.gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString());
            problemsQuery = problemsQuery.gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString());
        }
        
        // Fetch data
        const { data: cropsData } = await cropsQuery;
        const { data: rentalsData } = await rentalsQuery;
        const { data: problemsData } = await problemsQuery;
        
        // Update the summary cards
        document.getElementById('cropsPlantedCount').textContent = cropsData?.length || 0;
        document.getElementById('equipmentRentalsCount').textContent = rentalsData?.length || 0;
        document.getElementById('problemsReportedCount').textContent = problemsData?.length || 0;
        
    } catch (error) {
        console.error('Error loading summary statistics:', error);
    }
}

// Load Problems & Issues
async function loadProblemsAndIssues() {
    const problemsSection = document.getElementById('problemsSection');
    
    try {
        const dateRange = getSelectedMonthRange();
        
        // Build query with optional date filtering
        let query = supabase.from('app_3704573dd8_feedback').select('*');
        
        // Apply date filters only if not "All Time"
        if (dateRange !== null) {
            query = query.gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString());
        }
        
        const { data: feedbackData, error } = await query.order('created_at', { ascending: false }).limit(10);

        if (error) throw error;

        if (!feedbackData || feedbackData.length === 0) {
            const periodText = dateRange === null ? 'in the system' : 'this month';
            problemsSection.innerHTML = `
                <div class="problems-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <h3>Problems & Issues</h3>
                </div>
                <div class="no-problems">
                    <p>No problems or issues reported ${periodText}.</p>
                </div>
            `;
            return;
        }

        const problemsHTML = feedbackData.map(issue => {
            // Use user_name from the feedback table directly
            const userName = issue.user_name || 'Unknown User';
            
            const categoryBadge = getCategoryBadge(issue.category);
            const priorityBadge = getPriorityBadge(issue.priority);
            const statusBadge = getStatusBadge(issue.status);
            
            return `
                <div class="problem-card">
                    <div class="problem-badges">
                        ${categoryBadge}
                        ${priorityBadge}
                        ${statusBadge}
                    </div>
                    
                    <div class="problem-content">
                        <div class="problem-info">
                            <div class="info-row">
                                <span class="info-label">Reporter:</span>
                                <span class="info-value">${escapeHtml(userName)}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Subject:</span>
                                <span class="info-value">${escapeHtml(issue.subject || 'N/A')}</span>
                            </div>
                        </div>
                        
                        <div class="problem-issue">
                            <span class="issue-label">Issue:</span>
                            <p class="issue-text">${escapeHtml(issue.message)}</p>
                        </div>
                        
                        ${issue.admin_reply ? `
                            <div class="admin-response">
                                <span class="response-label">Admin Response:</span>
                                <p class="response-text">${escapeHtml(issue.admin_reply)}</p>
                            </div>
                        ` : ''}
                        
                        <button class="update-reply-btn" onclick="openReportReplyModal('${issue.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            ${issue.admin_reply ? 'Update Reply' : 'Reply'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        problemsSection.innerHTML = `
            <div class="problems-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <h3>Problems & Issues</h3>
            </div>
            <div class="problems-list">
                ${problemsHTML}
            </div>
        `;

    } catch (error) {
        console.error('Error loading problems:', error);
        problemsSection.innerHTML = `
            <div class="problems-header">
                <h3>Problems & Issues</h3>
            </div>
            <div class="error-message">Failed to load problems and issues: ${error.message}</div>
        `;
    }
}

// Load Crops Planted This Month
async function loadCropsPlanted() {
    const cropsContainer = document.getElementById('cropsPlantedList');
    
    try {
        const dateRange = getSelectedMonthRange();
        
        // Build query with optional date filtering
        let query = supabase.from('app_3704573dd8_user_crops').select('*');
        
        // Apply date filters only if not "All Time"
        if (dateRange !== null) {
            query = query.gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString());
        }
        
        const { data: cropsData, error } = await query.order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (!cropsData || cropsData.length === 0) {
            const periodText = dateRange === null ? 'in the system' : 'this month';
            cropsContainer.innerHTML = `<p class="no-data">No crops planted ${periodText}.</p>`;
            return;
        }
        
        // Fetch user data separately if user_id exists
        const userIds = [...new Set(cropsData.map(crop => crop.user_id).filter(Boolean))];
        let usersMap = {};
        
        if (userIds.length > 0) {
            try {
                const { data: users, error: usersError } = await supabase
                    .from('app_3704573dd8_users')
                    .select('*')
                    .in('id', userIds);
                
                if (!usersError && users) {
                    usersMap = users.reduce((acc, user) => {
                        acc[user.id] = user;
                        return acc;
                    }, {});
                }
            } catch (userError) {
                console.warn('Could not fetch user details:', userError);
            }
        }
        
        const cropsHTML = await Promise.all(cropsData.map(async crop => {
            let userName = 'Unknown';
            let userEmail = 'N/A';
            
            const user = usersMap[crop.user_id];
            if (user) {
                // Try different name field combinations
                if (user.full_name) {
                    userName = user.full_name;
                } else if (user.first_name && user.last_name) {
                    userName = `${user.first_name} ${user.last_name}`;
                } else if (user.name) {
                    userName = user.name;
                } else if (user.username) {
                    userName = user.username;
                }
                
                // Get email
                if (user.email) {
                    userEmail = user.email;
                }
            }
            
            // Get crop name
            let cropName = 'Unknown Crop';
            if (crop.crop_name) cropName = crop.crop_name;
            else if (crop.crop_type) cropName = crop.crop_type;
            else if (crop.type) cropName = crop.type;
            else if (crop.name) cropName = crop.name;
            
            // Get variety
            let variety = crop.variety || crop.crop_variety || 'none';
            
            // Get area planted - use area_planted field
            let area = 'N/A';
            if (crop.area_planted !== null && crop.area_planted !== undefined && crop.area_planted !== '') {
                area = parseFloat(crop.area_planted).toFixed(2);
            }
            
            // Get estimated harvest quantity
            let estimatedHarvest = 'N/A';
            if (crop.expected_harvest_quantity !== null && crop.expected_harvest_quantity !== undefined && crop.expected_harvest_quantity !== '') {
                estimatedHarvest = crop.expected_harvest_quantity;
                if (crop.harvest_unit) {
                    estimatedHarvest += ' ' + crop.harvest_unit;
                }
            }
            
            // Format planting date
            const plantingDate = crop.planting_date || crop.created_at;
            const formattedPlantingDate = new Date(plantingDate).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
            
            // Format harvest date
            let harvestDate = 'N/A';
            if (crop.expected_harvest_date) {
                harvestDate = new Date(crop.expected_harvest_date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                });
            }
            
            // Get status
            const status = crop.status || 'active';
            
            // Load crop image if available
            let cropImageHTML = '';
            if (crop.image_url) {
                try {
                    let imageUrl = crop.image_url;
                    
                    // Check if it's already a full URL
                    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                        // It's already a full URL, use it directly
                        cropImageHTML = `
                            <div class="crop-image-container" style="margin-bottom: 1rem;">
                                <img src="${imageUrl}" alt="${escapeHtml(cropName)}" 
                                     style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;"
                                     onerror="this.parentElement.style.display='none'">
                            </div>
                        `;
                    } else {
                        // It's a storage path, get public URL from Supabase storage
                        const { data: urlData } = supabase.storage
                            .from('crop-images')
                            .getPublicUrl(imageUrl);
                        
                        if (urlData && urlData.publicUrl) {
                            cropImageHTML = `
                                <div class="crop-image-container" style="margin-bottom: 1rem;">
                                    <img src="${urlData.publicUrl}" alt="${escapeHtml(cropName)}" 
                                         style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;"
                                         onerror="this.parentElement.style.display='none'">
                                </div>
                            `;
                        }
                    }
                } catch (imgError) {
                    console.warn('Error loading crop image:', imgError);
                }
            }
            
            return `
                <div class="detail-card">
                    ${cropImageHTML}
                    <div class="detail-header">
                        <h4>${escapeHtml(cropName)}</h4>
                        <span class="status-badge ${status.toLowerCase()}">${status.toUpperCase()}</span>
                    </div>
                    <div class="detail-info">
                        <div class="info-row">
                            <span class="info-label">USER</span>
                            <span class="info-value">${escapeHtml(userName)}<br>${escapeHtml(userEmail)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">CROP NAME</span>
                            <span class="info-value">${escapeHtml(cropName)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">VARIETY</span>
                            <span class="info-value">${escapeHtml(variety)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">AREA (HA)</span>
                            <span class="info-value">${area}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">PLANTING DATE</span>
                            <span class="info-value">${formattedPlantingDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">HARVEST DATE</span>
                            <span class="info-value">${harvestDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ESTIMATED HARVEST QUANTITY</span>
                            <span class="info-value">${estimatedHarvest}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">STATUS</span>
                            <span class="info-value">${status.toUpperCase()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">NOTES</span>
                            <span class="info-value">${crop.notes || 'none'}</span>
                        </div>
                    </div>
                </div>
            `;
        }));
        
        cropsContainer.innerHTML = (await Promise.all(cropsHTML)).join('');
        
    } catch (error) {
        console.error('Error loading crops:', error);
        cropsContainer.innerHTML = '<p class="error-text">Failed to load crops data.</p>';
    }
}

// Load Equipment Rentals This Month
async function loadEquipmentRentals() {
    const rentalsContainer = document.getElementById('equipmentRentalsList');
    
    try {
        const dateRange = getSelectedMonthRange();
        
        // Build query with optional date filtering
        let query = supabase.from('app_3704573dd8_member_rental_requests').select('*');
        
        // Apply date filters only if not "All Time"
        if (dateRange !== null) {
            query = query.gte('created_at', dateRange.start.toISOString()).lte('created_at', dateRange.end.toISOString());
        }
        
        const { data: rentalsData, error } = await query.order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (!rentalsData || rentalsData.length === 0) {
            const periodText = dateRange === null ? 'in the system' : 'this month';
            rentalsContainer.innerHTML = `<p class="no-data">No equipment rentals ${periodText}.</p>`;
            return;
        }
        
        // Fetch user data separately
        const userIds = [...new Set(rentalsData.map(rental => rental.user_id).filter(Boolean))];
        let usersMap = {};
        
        if (userIds.length > 0) {
            try {
                const { data: users, error: usersError } = await supabase
                    .from('app_3704573dd8_users')
                    .select('*')
                    .in('id', userIds);
                
                if (!usersError && users) {
                    usersMap = users.reduce((acc, user) => {
                        acc[user.id] = user;
                        return acc;
                    }, {});
                }
            } catch (userError) {
                console.warn('Could not fetch user details:', userError);
            }
        }
        
        const rentalsHTML = rentalsData.map(rental => {
            let userName = 'Unknown';
            const user = usersMap[rental.user_id];
            if (user) {
                if (user.first_name && user.last_name) {
                    userName = `${user.first_name} ${user.last_name}`;
                } else if (user.name) {
                    userName = user.name;
                } else if (user.username) {
                    userName = user.username;
                }
            }
            
            // Use user_name from rental if available
            if (rental.user_name) {
                userName = rental.user_name;
            }
            
            const startDate = new Date(rental.start_date);
            const endDate = new Date(rental.end_date);
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            return `
                <div class="detail-card">
                    <div class="detail-header">
                        <h4>${escapeHtml(rental.equipment_name)}</h4>
                        <span class="status-badge ${rental.status?.toLowerCase()}">${rental.status}</span>
                    </div>
                    <div class="detail-info">
                        <div class="info-row">
                            <span class="info-label">Customer:</span>
                            <span class="info-value">${escapeHtml(userName)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Period:</span>
                            <span class="info-value">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Rental Days:</span>
                            <span class="info-value">${days} days</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Revenue:</span>
                            <span class="info-value">₱${parseFloat(rental.total_cost || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        rentalsContainer.innerHTML = rentalsHTML;
        
    } catch (error) {
        console.error('Error loading rentals:', error);
        rentalsContainer.innerHTML = '<p class="error-text">Failed to load rentals data.</p>';
    }
}

// Helper functions
function getCategoryBadge(category) {
    const colors = {
        'quality': 'badge-yellow',
        'service': 'badge-blue',
        'technical': 'badge-purple',
        'other': 'badge-gray'
    };
    const color = colors[category?.toLowerCase()] || 'badge-gray';
    return `<span class="problem-badge ${color}">${(category || 'OTHER').toUpperCase()}</span>`;
}

function getPriorityBadge(priority) {
    const colors = {
        'high': 'badge-red',
        'medium': 'badge-orange',
        'low': 'badge-green'
    };
    const color = colors[priority?.toLowerCase()] || 'badge-orange';
    return `<span class="problem-badge ${color}">${(priority || 'MEDIUM').toUpperCase()}</span>`;
}

function getStatusBadge(status) {
    const colors = {
        'replied': 'badge-purple',
        'pending': 'badge-yellow',
        'resolved': 'badge-green'
    };
    const color = colors[status?.toLowerCase()] || 'badge-yellow';
    return `<span class="problem-badge ${color}">${(status || 'PENDING').toUpperCase()}</span>`;
}

function handleMonthChange() {
    const monthFilter = document.getElementById('monthFilter');
    window.selectedMonth = monthFilter.value;
    refreshReports();
}

async function refreshReports() {
    // Only reload the data sections, not the entire page
    await Promise.all([
        loadSummaryStatistics(),
        loadProblemsAndIssues(),
        loadCropsPlanted(),
        loadEquipmentRentals()
    ]);
}

function printReport() {
    // Update the data-date attribute before printing
    const dashboardContent = document.querySelector('.dashboard-content');
    const monthFilter = document.getElementById('monthFilter');
    const selectedOption = monthFilter.options[monthFilter.selectedIndex];
    const selectedMonth = selectedOption.text;
    
    if (dashboardContent) {
        dashboardContent.setAttribute('data-date', `Report for ${selectedMonth} | Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
    }
    
    window.print();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal functions
let currentReportFeedbackId = null;

async function openReportReplyModal(feedbackId) {
    currentReportFeedbackId = feedbackId;
    const modal = document.getElementById('replyModal');
    const detailsContainer = document.getElementById('reportFeedbackDetails');
    
    try {
        const { data: feedback, error } = await supabase
            .from('app_3704573dd8_feedback')
            .select('*')
            .eq('id', feedbackId)
            .single();
            
        if (error) throw error;
        
        // Populate details
        detailsContainer.innerHTML = `
            <div class="feedback-detail-row">
                <span class="feedback-detail-label">From:</span>
                <span class="feedback-detail-value">${escapeHtml(feedback.user_name)}</span>
            </div>
            <div class="feedback-detail-row">
                <span class="feedback-detail-label">Subject:</span>
                <span class="feedback-detail-value">${escapeHtml(feedback.subject)}</span>
            </div>
            <div class="feedback-message-box">
                <div class="feedback-message-label">Message:</div>
                <div class="feedback-message-text">${escapeHtml(feedback.message)}</div>
            </div>
        `;
        
        // Pre-fill reply if exists
        const replyTextarea = document.getElementById('reportReplyText');
        replyTextarea.value = feedback.admin_reply || '';
        
        modal.classList.add('show');
        
    } catch (error) {
        console.error('Error fetching feedback details:', error);
        alert('Failed to load feedback details');
    }
}

function closeReportReplyModal() {
    const modal = document.getElementById('replyModal');
    modal.classList.remove('show');
    currentReportFeedbackId = null;
}

async function submitReportReply() {
    if (!currentReportFeedbackId) return;
    
    const replyText = document.getElementById('reportReplyText').value.trim();
    if (!replyText) {
        alert('Please enter a reply');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_feedback')
            .update({
                admin_reply: replyText,
                admin_reply_date: new Date().toISOString(),
                status: 'replied',
                updated_at: new Date().toISOString()
            })
            .eq('id', currentReportFeedbackId);
            
        if (error) throw error;
        
        closeReportReplyModal();
        loadProblemsAndIssues(); // Refresh the list
        
    } catch (error) {
        console.error('Error submitting reply:', error);
        alert('Failed to submit reply');
    }
}