import { supabase } from './config.js';
import { showNotification } from './utilities.js';

let currentUserSession = null;

export async function initializeFeedbackSection() {
    // Get user session
    const sessionData = localStorage.getItem('user_session');
    if (!sessionData) {
        window.location.href = './user-login.html';
        return;
    }
    
    currentUserSession = JSON.parse(sessionData);
    
    // Render feedback section
    renderFeedbackSection();
    
    // Load feedback list
    await loadUserFeedback();
    
    // Setup event listeners
    setupFeedbackEventListeners();
}

function renderFeedbackSection() {
    const container = document.getElementById('contentContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="feedback-section">
            <div class="feedback-header">
                <h2>Feedback & Comments</h2>
                <button class="submit-feedback-btn" id="submitFeedbackBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Submit Feedback
                </button>
            </div>
            
            <div class="feedback-list" id="feedbackListContainer">
                <div class="loading">Loading feedback...</div>
            </div>
        </div>
        
        <!-- Feedback Modal -->
        <div class="feedback-modal" id="feedbackModal">
            <div class="feedback-modal-content">
                <div class="feedback-modal-header">
                    <h2>Submit Feedback</h2>
                    <button class="feedback-modal-close" id="closeFeedbackModal">&times;</button>
                </div>
                <div class="feedback-modal-body">
                    <form class="feedback-form" id="feedbackForm">
                        <div class="form-group">
                            <label for="feedbackSubject">
                                Subject <span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="feedbackSubject" 
                                placeholder="Brief description of your feedback"
                                required
                            />
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="feedbackCategory">
                                    Category <span class="required">*</span>
                                </label>
                                <select id="feedbackCategory" required>
                                    <option value="">Select Category</option>
                                    <option value="technical">Technical</option>
                                    <option value="service">Service</option>
                                    <option value="quality">Quality</option>
                                    <option value="billing">Billing</option>
                                    <option value="suggestion">Suggestion</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="feedbackPriority">
                                    Priority <span class="required">*</span>
                                </label>
                                <div class="priority-dropdown">
                                    <select id="feedbackPriority" required>
                                        <option value="">Select Priority</option>
                                        <option value="red">🔴 Red - Urgent Issues</option>
                                        <option value="orange">🟠 Orange - High Priority</option>
                                        <option value="yellow">🟡 Yellow - Medium Priority</option>
                                        <option value="green">🟢 Green - Low Priority</option>
                                        <option value="blue">🔵 Blue - Information</option>
                                        <option value="purple">🟣 Purple - Suggestion</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="feedbackMessage">
                                Message <span class="required">*</span>
                            </label>
                            <textarea 
                                id="feedbackMessage" 
                                placeholder="Please describe your feedback or concern in detail..."
                                required
                            ></textarea>
                        </div>
                    </form>
                </div>
                <div class="feedback-modal-actions">
                    <button type="button" class="feedback-cancel-btn" id="cancelFeedbackBtn">
                        Cancel
                    </button>
                    <button type="submit" form="feedbackForm" class="feedback-submit-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 2L11 13"></path>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                        </svg>
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupFeedbackEventListeners() {
    // Submit feedback button
    const submitBtn = document.getElementById('submitFeedbackBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', openFeedbackModal);
    }
    
    // Modal close button
    const closeBtn = document.getElementById('closeFeedbackModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeFeedbackModal);
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelFeedbackBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeFeedbackModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeFeedbackModal();
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', handleFeedbackSubmit);
    }
}

function openFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('feedbackForm');
        if (form) {
            form.reset();
            // Clear error states
            document.querySelectorAll('.error').forEach(el => {
                el.classList.remove('error');
            });
            document.querySelectorAll('.error-message').forEach(el => {
                el.remove();
            });
        }
    }
}

async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.querySelector('.feedback-submit-btn');
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
    
    // Get form data
    const subject = document.getElementById('feedbackSubject').value.trim();
    const category = document.getElementById('feedbackCategory').value;
    const priority = document.getElementById('feedbackPriority').value;
    const message = document.getElementById('feedbackMessage').value.trim();
    
    // Validate
    let hasError = false;
    
    if (!subject) {
        showFieldError('feedbackSubject', 'Subject is required');
        hasError = true;
    }
    
    if (!category) {
        showFieldError('feedbackCategory', 'Category is required');
        hasError = true;
    }
    
    if (!priority) {
        showFieldError('feedbackPriority', 'Priority is required');
        hasError = true;
    }
    
    if (!message) {
        showFieldError('feedbackMessage', 'Message is required');
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
        </svg>
        Submitting...
    `;
    
    try {
        // Insert feedback
        const { data, error } = await supabase
            .from('app_3704573dd8_feedback')
            .insert([{
                user_id: currentUserSession.user_id,
                user_name: currentUserSession.full_name,
                user_email: currentUserSession.email,
                subject: subject,
                category: category,
                priority: priority,
                message: message,
                status: 'pending'
            }])
            .select();
        
        if (error) throw error;
        
        showNotification('Feedback submitted successfully!', 'success');
        closeFeedbackModal();
        await loadUserFeedback();
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showNotification('Failed to submit feedback. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${message}</span>
        `;
        field.parentElement.appendChild(errorMsg);
    }
}

async function loadUserFeedback() {
    const container = document.getElementById('feedbackListContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading feedback...</div>';
    
    try {
        const { data: feedbackList, error } = await supabase
            .from('app_3704573dd8_feedback')
            .select('*')
            .eq('user_id', currentUserSession.user_id)
            .eq('is_deleted_by_user', false)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!feedbackList || feedbackList.length === 0) {
            container.innerHTML = `
                <div class="no-feedback">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3>No Feedback Yet</h3>
                    <p>Share your thoughts with us!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = feedbackList.map(feedback => renderFeedbackCard(feedback)).join('');
        
        // Setup delete buttons
        document.querySelectorAll('.feedback-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const feedbackId = btn.dataset.feedbackId;
                handleDeleteFeedback(feedbackId);
            });
        });
        
    } catch (error) {
        console.error('Error loading feedback:', error);
        container.innerHTML = '<div class="error">Failed to load feedback. Please refresh the page.</div>';
    }
}

function renderFeedbackCard(feedback) {
    const priorityColors = {
        'red': 'red',
        'orange': 'orange',
        'yellow': 'yellow',
        'green': 'green',
        'blue': 'blue',
        'purple': 'purple'
    };
    
    const priorityLabels = {
        'red': 'Red - Urgent Issues',
        'orange': 'Orange - High Priority',
        'yellow': 'Yellow - Medium Priority',
        'green': 'Green - Low Priority',
        'blue': 'Blue - Information',
        'purple': 'Purple - Suggestion'
    };
    
    const priorityColor = priorityColors[feedback.priority] || 'gray';
    const priorityLabel = priorityLabels[feedback.priority] || feedback.priority;
    
    const date = new Date(feedback.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    let replyHtml = '';
    if (feedback.admin_reply) {
        const replyDate = new Date(feedback.admin_reply_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        replyHtml = `
            <div class="feedback-reply">
                <div class="feedback-reply-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    Admin Reply
                </div>
                <div class="feedback-reply-content">${escapeHtml(feedback.admin_reply)}</div>
                <div class="feedback-reply-date">Replied on ${replyDate}</div>
            </div>
        `;
    }
    
    return `
        <div class="feedback-card priority-${priorityColor}">
            <div class="feedback-card-header">
                <div class="feedback-card-title">
                    <h3>${escapeHtml(feedback.subject)}</h3>
                    <div class="feedback-meta">
                        <span class="feedback-badge category">${escapeHtml(feedback.category)}</span>
                        <span class="feedback-badge priority ${priorityColor}">${priorityLabel}</span>
                        <span class="feedback-badge status ${feedback.status}">${feedback.status.toUpperCase()}</span>
                        <span class="feedback-date">${date}</span>
                    </div>
                </div>
                <div class="feedback-actions">
                    <button class="feedback-delete-btn" data-feedback-id="${feedback.id}" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="feedback-card-body">
                <div class="feedback-message">${escapeHtml(feedback.message)}</div>
                ${replyHtml}
            </div>
        </div>
    `;
}

async function handleDeleteFeedback(feedbackId) {
    if (!confirm('Are you sure you want to delete this feedback? It will be hidden from your view but remain visible to administrators.')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_feedback')
            .update({ is_deleted_by_user: true })
            .eq('id', feedbackId);
        
        if (error) throw error;
        
        showNotification('Feedback deleted successfully', 'success');
        await loadUserFeedback();
        
    } catch (error) {
        console.error('Error deleting feedback:', error);
        showNotification('Failed to delete feedback. Please try again.', 'error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}