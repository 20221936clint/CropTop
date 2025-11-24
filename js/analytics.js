// Load analytics section - Make it globally accessible
window.loadAnalyticsSection = async function() {
    const contentContainer = document.getElementById('contentContainer');
    
    // Get current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    contentContainer.innerHTML = `
        <div class="dashboard-content analytics-content" data-date="${currentDate}">
            <div class="section-header">
                <h2 class="section-title">CropTop - Analytics</h2>
                <div class="header-actions">
                    <select id="analyticsMonthFilter" class="month-filter" onchange="handleAnalyticsMonthChange()">
                        <option value="2025-11">November 2025</option>
                        <option value="2025-10">October 2025</option>
                        <option value="2025-09">September 2025</option>
                        <option value="2025-08">August 2025</option>
                        <option value="2025-07">July 2025</option>
                        <option value="2025-06">June 2025</option>
                    </select>
                    <button class="action-btn blue" onclick="refreshAnalytics()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh
                    </button>
                    <button class="action-btn green" onclick="printAnalytics()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Print
                    </button>
                </div>
            </div>

            <!-- Analytics Summary Cards -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stat-card">
                    <div class="stat-icon-box purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Total Revenue:</p>
                        <h3 class="stat-number" id="totalRevenue">₱0.00</h3>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon-box teal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Active Members:</p>
                        <h3 class="stat-number" id="activeMembers">0</h3>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon-box orange">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                            <circle cx="7" cy="17" r="2"></circle>
                            <circle cx="17" cy="17" r="2"></circle>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Equipment Utilization:</p>
                        <h3 class="stat-number" id="equipmentUtilization">0%</h3>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon-box green">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Crop Success Rate:</p>
                        <h3 class="stat-number" id="cropSuccessRate">0%</h3>
                    </div>
                </div>
            </div>

            <!-- New Bar Charts Section -->
            <div class="charts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                <!-- Crops Bar Chart by Type (Most to Least Common) -->
                <div class="detailed-reports-section">
                    <h3 class="section-subtitle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Crop Types Analytics (Most to Least Common - Monthly Comparison)
                    </h3>
                    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 400px;">
                        <canvas id="cropsChart"></canvas>
                    </div>
                </div>

                <!-- Equipment Rentals Revenue Bar Chart -->
                <div class="detailed-reports-section">
                    <h3 class="section-subtitle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                        Equipment Rentals Revenue (Monthly)
                    </h3>
                    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 300px;">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>

                <!-- Equipment Performance Comparison Bar Chart -->
                <div class="detailed-reports-section" style="grid-column: 1 / -1;">
                    <h3 class="section-subtitle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                            <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                            <circle cx="7" cy="17" r="2"></circle>
                            <circle cx="17" cy="17" r="2"></circle>
                        </svg>
                        Equipment Performance Comparison (Monthly)
                    </h3>
                    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 350px;">
                        <canvas id="equipmentPerformanceChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Analytics Charts Section -->
            <div class="detailed-reports-section">
                <h3 class="section-subtitle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <line x1="12" y1="20" x2="12" y2="10"></line>
                        <line x1="18" y1="20" x2="18" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                    Revenue Analytics
                </h3>
                <div id="revenueAnalyticsContent">
                    <div class="loading-spinner">Loading revenue analytics...</div>
                </div>
            </div>

            <div class="detailed-reports-section">
                <h3 class="section-subtitle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                        <circle cx="7" cy="17" r="2"></circle>
                        <circle cx="17" cy="17" r="2"></circle>
                    </svg>
                    Equipment Performance
                </h3>
                <div id="equipmentPerformanceContent">
                    <div class="loading-spinner">Loading equipment performance...</div>
                </div>
            </div>

            <div class="detailed-reports-section">
                <h3 class="section-subtitle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Crop Analytics
                </h3>
                <div id="cropAnalyticsContent">
                    <div class="loading-spinner">Loading crop analytics...</div>
                </div>
            </div>
        </div>
    `;

    // Load Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = async () => {
            await loadAllAnalytics();
        };
        document.head.appendChild(script);
    } else {
        await loadAllAnalytics();
    }
}

// Print Analytics Function - Make it globally accessible
window.printAnalytics = function() {
    window.print();
}

// Make handleAnalyticsMonthChange globally accessible
window.handleAnalyticsMonthChange = function() {
    refreshAnalytics();
}

// Make refreshAnalytics globally accessible
window.refreshAnalytics = async function() {
    await loadAnalyticsSection();
}

// Load all analytics data
async function loadAllAnalytics() {
    await Promise.all([
        loadAnalyticsSummary(),
        loadRevenueAnalytics(),
        loadEquipmentPerformance(),
        loadCropAnalytics(),
        loadCropTypesByMonthChart(),
        loadRevenueBarChart(),
        loadEquipmentPerformanceBarChart()
    ]);
}

// Load Analytics Summary
async function loadAnalyticsSummary() {
    try {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        // Fetch total revenue from rentals
        const { data: rentalsData } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('total_cost')
            .gte('created_at', firstDay.toISOString());
        
        const totalRevenue = rentalsData?.reduce((sum, rental) => sum + (parseFloat(rental.total_cost) || 0), 0) || 0;
        document.getElementById('totalRevenue').textContent = `₱${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Fetch active members
        const { data: usersData } = await supabase
            .from('app_3704573dd8_users')
            .select('id')
            .eq('status', 'active');
        
        document.getElementById('activeMembers').textContent = usersData?.length || 0;
        
        // Calculate equipment utilization
        const { data: equipmentData } = await supabase
            .from('app_3704573dd8_equipment')
            .select('id, status');
        
        const totalEquipment = equipmentData?.length || 1;
        const rentedEquipment = equipmentData?.filter(e => e.status === 'RENTED').length || 0;
        const utilization = ((rentedEquipment / totalEquipment) * 100).toFixed(1);
        document.getElementById('equipmentUtilization').textContent = `${utilization}%`;
        
        // Calculate crop success rate
        const { data: cropsData } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('id, status')
            .gte('created_at', firstDay.toISOString());
        
        const totalCrops = cropsData?.length || 1;
        const successfulCrops = cropsData?.filter(c => c.status === 'HARVESTED' || c.status === 'COMPLETED').length || 0;
        const successRate = ((successfulCrops / totalCrops) * 100).toFixed(1);
        document.getElementById('cropSuccessRate').textContent = `${successRate}%`;
        
    } catch (error) {
        console.error('Error loading analytics summary:', error);
    }
}

// Load Crop Types Bar Chart (Most to Least Common with Monthly Comparison)
async function loadCropTypesByMonthChart() {
    try {
        const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
        const monthValues = ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11'];
        
        // Optimization: Fetch all data in one request using crop_name field
        const startDate = '2025-06-01T00:00:00.000Z';
        const endDate = '2025-11-30T23:59:59.999Z';

        const { data: allCropsData, error } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('crop_name, variety, created_at')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (error) throw error;

        // Process data
        const cropTypeTotals = {};
        const monthlyData = {}; 

        // Initialize monthlyData structure
        monthValues.forEach(m => monthlyData[m] = {});

        if (allCropsData) {
            allCropsData.forEach(crop => {
                // Use crop_name as the primary identifier
                const cropType = crop.crop_name || 'Unknown';
                const date = new Date(crop.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (monthlyData[monthKey]) {
                    // Total count
                    cropTypeTotals[cropType] = (cropTypeTotals[cropType] || 0) + 1;
                    // Monthly count
                    monthlyData[monthKey][cropType] = (monthlyData[monthKey][cropType] || 0) + 1;
                }
            });
        }

        // Sort crop types by total count (most to least common)
        const sortedCropTypes = Object.entries(cropTypeTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Limit to top 10 crop types
            .map(([cropType]) => cropType);

        if (sortedCropTypes.length === 0) {
            console.log('No crop data found for chart');
            const ctx = document.getElementById('cropsChart');
            if (ctx) {
                const parent = ctx.parentElement;
                parent.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No crop data available for the selected period</p>';
            }
            return;
        }

        // Create datasets for each month
        const datasets = [];
        const colors = [
            'rgba(34, 197, 94, 0.7)',   // green
            'rgba(59, 130, 246, 0.7)',  // blue
            'rgba(251, 146, 60, 0.7)',  // orange
            'rgba(168, 85, 247, 0.7)',  // purple
            'rgba(236, 72, 153, 0.7)',  // pink
            'rgba(234, 179, 8, 0.7)'    // yellow
        ];

        monthValues.forEach((monthValue, i) => {
            const monthCounts = monthlyData[monthValue];
            const data = sortedCropTypes.map(type => monthCounts[type] || 0);
            
            datasets.push({
                label: months[i],
                data: data,
                backgroundColor: colors[i % colors.length],
                borderColor: colors[i % colors.length].replace('0.7', '1'),
                borderWidth: 1
            });
        });

        const ctx = document.getElementById('cropsChart');
        if (ctx) {
            // Destroy existing chart if any to prevent "Canvas is already in use" error
            const existingChart = Chart.getChart(ctx);
            if (existingChart) existingChart.destroy();

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedCropTypes,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        },
                        x: {
                            ticks: {
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading crop types bar chart:', error);
    }
}

// Load Equipment Rentals Revenue Bar Chart (Monthly)
async function loadRevenueBarChart() {
    try {
        const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
        const monthValues = ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11'];
        
        const startDate = '2025-06-01T00:00:00.000Z';
        const endDate = '2025-11-30T23:59:59.999Z';

        const { data: rentalsData, error } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('total_cost, created_at')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (error) throw error;

        const monthlyRevenue = {};
        monthValues.forEach(m => monthlyRevenue[m] = 0);

        if (rentalsData) {
            rentalsData.forEach(rental => {
                const date = new Date(rental.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyRevenue[monthKey] !== undefined) {
                    monthlyRevenue[monthKey] += parseFloat(rental.total_cost) || 0;
                }
            });
        }

        const revenues = monthValues.map(m => monthlyRevenue[m]);

        const ctx = document.getElementById('revenueChart');
        if (ctx) {
            const existingChart = Chart.getChart(ctx);
            if (existingChart) existingChart.destroy();

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Revenue (₱)',
                        data: revenues,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return '₱' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2});
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₱' + value.toLocaleString('en-US');
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading revenue bar chart:', error);
    }
}

// Load Equipment Performance Comparison Bar Chart (Monthly)
async function loadEquipmentPerformanceBarChart() {
    try {
        // Get all equipment - FIXED: removed 'name' column, only select 'id' and 'equipment_name'
        const { data: equipmentData, error: eqError } = await supabase
            .from('app_3704573dd8_equipment')
            .select('id, equipment_name');

        if (eqError) throw eqError;
        if (!equipmentData || equipmentData.length === 0) return;

        const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
        const monthValues = ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11'];
        
        const startDate = '2025-06-01T00:00:00.000Z';
        const endDate = '2025-11-30T23:59:59.999Z';

        // Get all rentals in one go
        const { data: rentalsData, error: rentError } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('equipment_id, created_at')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (rentError) throw rentError;

        // Process rentals
        // Map: equipmentId -> { '2025-06': count, ... }
        const equipmentRentals = {};
        equipmentData.forEach(eq => {
            equipmentRentals[eq.id] = {};
            monthValues.forEach(m => equipmentRentals[eq.id][m] = 0);
        });

        if (rentalsData) {
            rentalsData.forEach(rental => {
                if (equipmentRentals[rental.equipment_id]) {
                    const date = new Date(rental.created_at);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (equipmentRentals[rental.equipment_id][monthKey] !== undefined) {
                        equipmentRentals[rental.equipment_id][monthKey]++;
                    }
                }
            });
        }
        
        // Create datasets for each equipment
        const datasets = [];
        const colors = [
            'rgba(239, 68, 68, 0.7)',   // red
            'rgba(59, 130, 246, 0.7)',  // blue
            'rgba(34, 197, 94, 0.7)',   // green
            'rgba(251, 146, 60, 0.7)',  // orange
            'rgba(168, 85, 247, 0.7)',  // purple
            'rgba(236, 72, 153, 0.7)',  // pink
            'rgba(14, 165, 233, 0.7)',  // cyan
            'rgba(234, 179, 8, 0.7)'    // yellow
        ];

        for (let i = 0; i < Math.min(equipmentData.length, 8); i++) {
            const equipment = equipmentData[i];
            const equipmentName = equipment.equipment_name || `Equipment ${i + 1}`;
            
            const rentalCounts = monthValues.map(m => equipmentRentals[equipment.id][m]);

            datasets.push({
                label: equipmentName,
                data: rentalCounts,
                backgroundColor: colors[i % colors.length],
                borderColor: colors[i % colors.length].replace('0.7', '1'),
                borderWidth: 2
            });
        }

        const ctx = document.getElementById('equipmentPerformanceChart');
        if (ctx) {
            const existingChart = Chart.getChart(ctx);
            if (existingChart) existingChart.destroy();

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading equipment performance bar chart:', error);
    }
}

// Load Revenue Analytics
async function loadRevenueAnalytics() {
    const container = document.getElementById('revenueAnalyticsContent');
    
    try {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const { data: rentalsData } = await supabase
            .from('app_3704573dd8_member_rental_requests')
            .select('*')
            .gte('created_at', firstDay.toISOString())
            .order('created_at', { ascending: true });
        
        if (!rentalsData || rentalsData.length === 0) {
            container.innerHTML = '<p class="no-data">No revenue data available for this month.</p>';
            return;
        }
        
        // Calculate revenue by equipment type
        const revenueByEquipment = {};
        rentalsData.forEach(rental => {
            const equipmentName = rental.equipment_name || 'Unknown';
            if (!revenueByEquipment[equipmentName]) {
                revenueByEquipment[equipmentName] = 0;
            }
            revenueByEquipment[equipmentName] += parseFloat(rental.total_cost) || 0;
        });
        
        const revenueHTML = Object.entries(revenueByEquipment)
            .sort((a, b) => b[1] - a[1])
            .map(([equipment, revenue]) => `
                <div class="analytics-item">
                    <div class="analytics-label">${equipment}</div>
                    <div class="analytics-value">₱${revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                </div>
            `).join('');
        
        container.innerHTML = `<div class="analytics-list">${revenueHTML}</div>`;
        
    } catch (error) {
        console.error('Error loading revenue analytics:', error);
        container.innerHTML = '<p class="error-text">Failed to load revenue analytics.</p>';
    }
}

// Load Equipment Performance
async function loadEquipmentPerformance() {
    const container = document.getElementById('equipmentPerformanceContent');
    
    try {
        const { data: equipmentData } = await supabase
            .from('app_3704573dd8_equipment')
            .select('*');
        
        if (!equipmentData || equipmentData.length === 0) {
            container.innerHTML = '<p class="no-data">No equipment data available.</p>';
            return;
        }
        
        const performanceHTML = equipmentData.map(equipment => {
            const statusClass = equipment.status?.toLowerCase() || 'available';
            return `
                <div class="analytics-item">
                    <div class="analytics-label">${equipment.equipment_name}</div>
                    <div class="analytics-value">
                        <span class="status-badge ${statusClass}">${equipment.status || 'AVAILABLE'}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `<div class="analytics-list">${performanceHTML}</div>`;
        
    } catch (error) {
        console.error('Error loading equipment performance:', error);
        container.innerHTML = '<p class="error-text">Failed to load equipment performance.</p>';
    }
}

// Load Crop Analytics
async function loadCropAnalytics() {
    const container = document.getElementById('cropAnalyticsContent');
    
    try {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const { data: cropsData } = await supabase
            .from('app_3704573dd8_user_crops')
            .select('*')
            .gte('created_at', firstDay.toISOString());
        
        if (!cropsData || cropsData.length === 0) {
            container.innerHTML = '<p class="no-data">No crop data available for this month.</p>';
            return;
        }
        
        // Count crops by crop_name (matching the crops.js structure)
        const cropsByType = {};
        cropsData.forEach(crop => {
            const cropType = crop.crop_name || 'Unknown';
            if (!cropsByType[cropType]) {
                cropsByType[cropType] = 0;
            }
            cropsByType[cropType]++;
        });
        
        const analyticsHTML = Object.entries(cropsByType)
            .sort((a, b) => b[1] - a[1])
            .map(([cropType, count]) => `
                <div class="analytics-item">
                    <div class="analytics-label">${cropType}</div>
                    <div class="analytics-value">${count} plantings</div>
                </div>
            `).join('');
        
        container.innerHTML = `<div class="analytics-list">${analyticsHTML}</div>`;
        
    } catch (error) {
        console.error('Error loading crop analytics:', error);
        container.innerHTML = '<p class="error-text">Failed to load crop analytics.</p>';
    }
}