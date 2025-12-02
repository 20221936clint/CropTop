// Admin Feedback Management
// Initialize Supabase (assuming it's already initialized in utils.js)

let currentFeedback = null;

// Initialize admin feedback section
async function initializeAdminFeedback() {
    renderAdminFeedbackSection();
    await populateFeedbackMonthFilter();
    await loadAllFeedback();
    setupAdminFeedbackEventListeners();
}

function renderAdminFeedbackSection() {
    const container = document.getElementById('contentContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-feedback-section">
            <div class="admin-feedback-header">
                <h2>User Feedback</h2>
                <p>Manage and respond to user feedback</p>
            </div>
            
            <div class="feedback-filters">
                <div class="filter-group">
                    <label for="feedbackMonthFilter">Month</label>
                    <select id="feedbackMonthFilter">
                        <option value="all">All Months</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="statusFilter">Status</label>
                    <select id="statusFilter">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="replied">Replied</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="priorityFilter">Priority</label>
                    <select id="priorityFilter">
                        <option value="all">All Priorities</option>
                        <option value="red">Red - Urgent</option>
                        <option value="orange">Orange - High</option>
                        <option value="yellow">Yellow - Medium</option>
                        <option value="green">Green - Low</option>
                        <option value="blue">Blue - Info</option>
                        <option value="purple">Purple - Suggestion</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="categoryFilter">Category</label>
                    <select id="categoryFilter">
                        <option value="all">All Categories</option>
                        <option value="technical">Technical</option>
                        <option value="service">Service</option>
                        <option value="quality">Quality</option>
                        <option value="billing">Billing</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            
            <div class="admin-feedback-table" id="feedbackTableContainer">
                <div class="loading">Loading feedback...</div>
            </div>
        </div>
        
        <!-- Reply Modal -->
        <div class="reply-modal" id="replyModal">
            <div class="reply-modal-content">
                <div class="reply-modal-header">
                    <h2>Reply to Feedback</h2>
                    <button class="reply-modal-close" id="closeReplyModal">&times;</button>
                </div>
                <div class="reply-modal-body">
                    <div class="feedback-details" id="feedbackDetailsContainer">
                        <!-- Feedback details will be loaded here -->
                    </div>
                    
                    <form class="reply-form" id="replyForm">
                        <div class="form-group">
                            <label for="adminReplyText">Your Reply</label>
                            <textarea 
                                id="adminReplyText" 
                                placeholder="Type your reply here..."
                                required
                            ></textarea>
                        </div>
                    </form>
                </div>
                <div class="reply-modal-actions">
                    <button type="button" class="btn-cancel" id="cancelReplyBtn">Cancel</button>
                    <button type="submit" form="replyForm" class="btn-send-reply">
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
}

// Populate month filter dropdown
async function populateFeedbackMonthFilter() {
    try {
        const { data: feedbackList, error } = await supabase
            .from('app_3704573dd8_feedback')
            .select('created_at')
            .eq('is_deleted_by_user', false)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const monthSet = new Set();
        feedbackList.forEach(feedback => {
            const date = new Date(feedback.created_at);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthSet.add(monthYear);
        });
        
        const monthFilter = document.getElementById('feedbackMonthFilter');
        const sortedMonths = Array.from(monthSet).sort().reverse();
        
        sortedMonths.forEach(monthYear => {
            const [year, month] = monthYear.split('-');
            const date = new Date(year, month - 1);
            const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            
            const option = document.createElement('option');
            option.value = monthYear;
            option.textContent = monthName;
            monthFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating month filter:', error);
    }
}

function setupAdminFeedbackEventListeners() {
    // Filter change events
    const monthFilter = document.getElementById('feedbackMonthFilter');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (monthFilter) {
        monthFilter.addEventListener('change', loadAllFeedback);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', loadAllFeedback);
    }
    if (priorityFilter) {
        priorityFilter.addEventListener('change', loadAllFeedback);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadAllFeedback);
    }
    
    // Modal close buttons
    const closeBtn = document.getElementById('closeReplyModal');
    const cancelBtn = document.getElementById('cancelReplyBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeReplyModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeReplyModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('replyModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeReplyModal();
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('replyForm');
    if (form) {
        form.addEventListener('submit', handleReplySubmit);
    }
}

async function loadAllFeedback() {
    const container = document.getElementById('feedbackTableContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading feedback...</div>';
    
    try {
        // Get filter values
        const monthFilter = document.getElementById('feedbackMonthFilter')?.value || 'all';
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        
        // Build query
        let query = supabase
            .from('app_3704573dd8_feedback')
            .select('*')
            .eq('is_deleted_by_user', false)
            .order('created_at', { ascending: false });
        
        // Apply month filter
        if (monthFilter !== 'all') {
            const [year, month] = monthFilter.split('-');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            
            query = query
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());
        }
        
        // Apply other filters
        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }
        if (priorityFilter !== 'all') {
            query = query.eq('priority', priorityFilter);
        }
        if (categoryFilter !== 'all') {
            query = query.eq('category', categoryFilter);
        }
        
        const { data: feedbackList, error } = await query;
        
        if (error) throw error;
        
        if (!feedbackList || feedbackList.length === 0) {
            container.innerHTML = `
                <div class="no-feedback">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3>No Feedback Found</h3>
                    <p>No feedback matches the selected filters</p>
                </div>
            `;
            return;
        }
        
        renderFeedbackTable(feedbackList);
        
    } catch (error) {
        console.error('Error loading feedback:', error);
        container.innerHTML = '<div class="error">Failed to load feedback. Please refresh the page.</div>';
    }
}

function renderFeedbackTable(feedbackList) {
    const container = document.getElementById('feedbackTableContainer');
    if (!container) return;
    
    const priorityLabels = {
        'red': 'Red',
        'orange': 'Orange',
        'yellow': 'Yellow',
        'green': 'Green',
        'blue': 'Blue',
        'purple': 'Purple'
    };
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${feedbackList.map(feedback => {
                    const date = new Date(feedback.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    return `
                        <tr>
                            <td>
                                <div class="user-info">
                                    <span class="user-name">${escapeHtml(feedback.user_name)}</span>
                                    <span class="user-email">${escapeHtml(feedback.user_email)}</span>
                                </div>
                            </td>
                            <td class="feedback-subject-cell">
                                <div class="feedback-subject-text">${escapeHtml(feedback.subject)}</div>
                                <div class="feedback-preview">${escapeHtml(feedback.message)}</div>
                            </td>
                            <td>${escapeHtml(feedback.category)}</td>
                            <td>
                                <span class="priority-badge ${feedback.priority}">
                                    ${priorityLabels[feedback.priority] || feedback.priority}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge ${feedback.status}">
                                    ${feedback.status.toUpperCase()}
                                </span>
                            </td>
                            <td class="feedback-date">${date}</td>
                            <td>
                                <div class="feedback-actions">
                                    <button class="btn-reply" onclick="openReplyModal('${feedback.id}')">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                        </svg>
                                        ${feedback.status === 'replied' ? 'Update' : 'Reply'}
                                    </button>
                                    <button class="btn-view" onclick="viewFeedbackDetails('${feedback.id}')">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                        View
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

async function openReplyModal(feedbackId) {
    try {
        const { data: feedback, error } = await supabase
            .from('app_3704573dd8_feedback')
            .select('*')
            .eq('id', feedbackId)
            .single();
        
        if (error) throw error;
        
        currentFeedback = feedback;
        
        const detailsContainer = document.getElementById('feedbackDetailsContainer');
        if (detailsContainer) {
            const date = new Date(feedback.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const priorityLabels = {
                'red': '🔴 Red - Urgent Issues',
                'orange': '🟠 Orange - High Priority',
                'yellow': '🟡 Yellow - Medium Priority',
                'green': '🟢 Green - Low Priority',
                'blue': '🔵 Blue - Information',
                'purple': '🟣 Purple - Suggestion'
            };
            
            detailsContainer.innerHTML = `
                <div class="feedback-detail-row">
                    <span class="feedback-detail-label">From:</span>
                    <span class="feedback-detail-value">${escapeHtml(feedback.user_name)} (${escapeHtml(feedback.user_email)})</span>
                </div>
                <div class="feedback-detail-row">
                    <span class="feedback-detail-label">Subject:</span>
                    <span class="feedback-detail-value">${escapeHtml(feedback.subject)}</span>
                </div>
                <div class="feedback-detail-row">
                    <span class="feedback-detail-label">Category:</span>
                    <span class="feedback-detail-value">${escapeHtml(feedback.category)}</span>
                </div>
                <div class="feedback-detail-row">
                    <span class="feedback-detail-label">Priority:</span>
                    <span class="feedback-detail-value">${priorityLabels[feedback.priority] || feedback.priority}</span>
                </div>
                <div class="feedback-detail-row">
                    <span class="feedback-detail-label">Date:</span>
                    <span class="feedback-detail-value">${date}</span>
                </div>
                <div class="feedback-message-box">
                    <div class="feedback-message-label">Message:</div>
                    <div class="feedback-message-text">${escapeHtml(feedback.message)}</div>
                </div>
            `;
        }
        
        // Pre-fill reply if exists
        const replyTextarea = document.getElementById('adminReplyText');
        if (replyTextarea && feedback.admin_reply) {
            replyTextarea.value = feedback.admin_reply;
        } else if (replyTextarea) {
            replyTextarea.value = '';
        }
        
        const modal = document.getElementById('replyModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        
    } catch (error) {
        console.error('Error loading feedback details:', error);
        showNotification('Failed to load feedback details', 'error');
    }
}

function closeReplyModal() {
    const modal = document.getElementById('replyModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        currentFeedback = null;
        
        // Reset form
        const form = document.getElementById('replyForm');
        if (form) {
            form.reset();
        }
    }
}

async function handleReplySubmit(e) {
    e.preventDefault();
    
    if (!currentFeedback) return;
    
    const replyText = document.getElementById('adminReplyText').value.trim();
    
    if (!replyText) {
        showNotification('Please enter a reply', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-send-reply');
    submitBtn.disabled = true;
    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
        </svg>
        Sending...
    `;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_feedback')
            .update({
                admin_reply: replyText,
                admin_reply_date: new Date().toISOString(),
                status: 'replied',
                updated_at: new Date().toISOString()
            })
            .eq('id', currentFeedback.id);
        
        if (error) throw error;
        
        showNotification('Reply sent successfully!', 'success');
        closeReplyModal();
        await loadAllFeedback();
        
    } catch (error) {
        console.error('Error sending reply:', error);
        showNotification('Failed to send reply. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
    }
}

async function viewFeedbackDetails(feedbackId) {
    await openReplyModal(feedbackId);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally
window.openReplyModal = openReplyModal;
window.viewFeedbackDetails = viewFeedbackDetails;
window.initializeAdminFeedback = initializeAdminFeedback;