// Global announcements data
let allAnnouncements = [];

// Load Announcements Section
async function loadAnnouncementsSection() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="announcements-management-container">
            <div class="announcements-header">
                <h2 class="section-title">Announcements Management</h2>
                <button class="add-announcement-btn" onclick="openAddAnnouncementModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Announcement
                </button>
            </div>
            
            <div class="filter-section">
                <div class="filter-group">
                    <label for="announcementMonthFilter">Month:</label>
                    <select id="announcementMonthFilter" onchange="filterAnnouncements()">
                        <option value="all">All Months</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="categoryFilter">Category:</label>
                    <select id="categoryFilter" onchange="filterAnnouncements()">
                        <option value="all">All Categories</option>
                        <option value="general">General</option>
                        <option value="meeting">Meeting</option>
                        <option value="event">Event</option>
                        <option value="notice">Notice</option>
                        <option value="emergency">Emergency</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="priorityFilter">Priority:</label>
                    <select id="priorityFilter" onchange="filterAnnouncements()">
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            <div id="announcementsListContainer">
                <div class="loading">Loading announcements...</div>
            </div>
        </div>
    `;
    
    await populateAnnouncementMonthFilter();
    loadAnnouncementsList();
}

// Populate month filter dropdown
async function populateAnnouncementMonthFilter() {
    try {
        const { data: announcements, error } = await supabase
            .from('app_3704573dd8_announcements')
            .select('created_at')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const monthSet = new Set();
        announcements.forEach(announcement => {
            const date = new Date(announcement.created_at);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthSet.add(monthYear);
        });
        
        const monthFilter = document.getElementById('announcementMonthFilter');
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

// Load Announcements List
async function loadAnnouncementsList() {
    try {
        const { data: announcements, error } = await supabase
            .from('app_3704573dd8_announcements')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allAnnouncements = announcements || [];
        filterAnnouncements();
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        document.getElementById('announcementsListContainer').innerHTML = '<div class="error">Error loading announcements</div>';
    }
}

// Filter Announcements
function filterAnnouncements() {
    const monthFilter = document.getElementById('announcementMonthFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';
    
    let filtered = allAnnouncements;
    
    // Apply month filter
    if (monthFilter !== 'all') {
        const [year, month] = monthFilter.split('-');
        filtered = filtered.filter(a => {
            const date = new Date(a.created_at);
            const announcementMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return announcementMonth === monthFilter;
        });
    }
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(a => a.category === categoryFilter);
    }
    
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(a => a.priority === priorityFilter);
    }
    
    displayAnnouncements(filtered);
}

// Display Announcements
function displayAnnouncements(announcements) {
    const container = document.getElementById('announcementsListContainer');
    
    if (!announcements || announcements.length === 0) {
        container.innerHTML = '<div class="no-data">No announcements yet. Click "New Announcement" to create one!</div>';
        return;
    }
    
    container.innerHTML = announcements.map(announcement => `
        <div class="announcement-card priority-${announcement.priority}">
            <div class="announcement-header">
                <div class="announcement-title-section">
                    <h3 class="announcement-title">${announcement.title}</h3>
                    <div class="announcement-meta">
                        <span class="category-badge ${announcement.category}">${announcement.category}</span>
                        <span class="priority-badge ${announcement.priority}">${announcement.priority}</span>
                    </div>
                </div>
                <div class="announcement-actions">
                    <button class="action-btn edit" onclick="openEditAnnouncementModal('${announcement.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteAnnouncement('${announcement.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="announcement-message">${announcement.message}</div>
            <div class="announcement-footer">
                <div class="announcement-date">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${new Date(announcement.created_at).toLocaleString()}
                </div>
                <div class="announcement-author">By: ${announcement.admin_name || 'Admin'}</div>
            </div>
        </div>
    `).join('');
}

// Open Add Announcement Modal
function openAddAnnouncementModal() {
    document.getElementById('addAnnouncementModal').style.display = 'flex';
    document.getElementById('addAnnouncementForm').reset();
    
    const form = document.getElementById('addAnnouncementForm');
    form.onsubmit = handleAddAnnouncement;
}

// Close Add Announcement Modal
function closeAddAnnouncementModal() {
    document.getElementById('addAnnouncementModal').style.display = 'none';
}

// Handle Add Announcement
async function handleAddAnnouncement(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Posting...';
    submitBtn.disabled = true;
    
    try {
        const formData = {
            title: document.getElementById('announcementTitle').value,
            category: document.getElementById('announcementCategory').value,
            priority: document.getElementById('announcementPriority').value,
            message: document.getElementById('announcementMessage').value,
            admin_name: currentAdmin.full_name || currentAdmin.username || 'Admin',
            admin_id: currentAdmin.user_id || currentAdmin.id,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('app_3704573dd8_announcements')
            .insert([formData])
            .select();
        
        if (error) throw error;
        
        showNotification('Success', 'Announcement posted successfully!', 'success');
        closeAddAnnouncementModal();
        loadAnnouncementsList();
        
    } catch (error) {
        console.error('Error adding announcement:', error);
        showNotification('Error', 'Failed to post announcement: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Open Edit Announcement Modal
async function openEditAnnouncementModal(announcementId) {
    try {
        const { data: announcement, error } = await supabase
            .from('app_3704573dd8_announcements')
            .select('*')
            .eq('id', announcementId)
            .single();
        
        if (error) throw error;
        
        document.getElementById('editAnnouncementId').value = announcement.id;
        document.getElementById('editAnnouncementTitle').value = announcement.title;
        document.getElementById('editAnnouncementCategory').value = announcement.category;
        document.getElementById('editAnnouncementPriority').value = announcement.priority;
        document.getElementById('editAnnouncementMessage').value = announcement.message;
        
        document.getElementById('editAnnouncementModal').style.display = 'flex';
        
        const form = document.getElementById('editAnnouncementForm');
        form.onsubmit = handleEditAnnouncement;
        
    } catch (error) {
        console.error('Error loading announcement:', error);
        showNotification('Error', 'Failed to load announcement details', 'error');
    }
}

// Close Edit Announcement Modal
function closeEditAnnouncementModal() {
    document.getElementById('editAnnouncementModal').style.display = 'none';
}

// Handle Edit Announcement
async function handleEditAnnouncement(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Updating...';
    submitBtn.disabled = true;
    
    try {
        const announcementId = document.getElementById('editAnnouncementId').value;
        
        const updateData = {
            title: document.getElementById('editAnnouncementTitle').value,
            category: document.getElementById('editAnnouncementCategory').value,
            priority: document.getElementById('editAnnouncementPriority').value,
            message: document.getElementById('editAnnouncementMessage').value,
            updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('app_3704573dd8_announcements')
            .update(updateData)
            .eq('id', announcementId);
        
        if (error) throw error;
        
        showNotification('Success', 'Announcement updated successfully!', 'success');
        closeEditAnnouncementModal();
        loadAnnouncementsList();
        
    } catch (error) {
        console.error('Error updating announcement:', error);
        showNotification('Error', 'Failed to update announcement: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Delete Announcement
async function deleteAnnouncement(announcementId) {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return;
    
    try {
        const { error } = await supabase
            .from('app_3704573dd8_announcements')
            .delete()
            .eq('id', announcementId);
        
        if (error) throw error;
        
        showNotification('Success', 'Announcement deleted successfully', 'success');
        loadAnnouncementsList();
        
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showNotification('Error', 'Failed to delete announcement: ' + error.message, 'error');
    }
}