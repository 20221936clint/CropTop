// Load User Crops
async function loadUserCrops() {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <div class="crops-management-container">
            <div class="crops-header">
                <h2 class="section-title">User Submitted Crops</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="refresh-btn" onclick="loadUserCrops()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh
                    </button>
                    <button class="print-btn" onclick="printCropsTable()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Print
                    </button>
                </div>
            </div>
            <div id="userCropsContainer">
                <div class="loading">Loading crops...</div>
            </div>
        </div>
    `;
    
    loadUserCropsTable();
}

// Load User Crops Table
async function loadUserCropsTable() {
    try {
        const { data: crops, error } = await supabase
            .from('app_3704573dd8_user_crops')
            .select(`
                *,
                app_3704573dd8_users (
                    full_name,
                    username,
                    email
                )
            `)
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('userCropsContainer');
        
        if (error) throw error;
        
        if (!crops || crops.length === 0) {
            container.innerHTML = '<div class="no-data">No crops submitted by users yet</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="crops-table" id="cropsTableToPrint">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Crop Name</th>
                        <th>Variety</th>
                        <th>Area (ha)</th>
                        <th>Planting Date</th>
                        <th>Expected Harvest</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Estimated Harvest Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${crops.map(crop => `
                        <tr>
                            <td>
                                <div class="user-info">
                                    <div class="user-name">${crop.app_3704573dd8_users?.full_name || 'N/A'}</div>
                                    <div class="user-email">${crop.app_3704573dd8_users?.email || 'N/A'}</div>
                                </div>
                            </td>
                            <td><strong>${crop.crop_name}</strong></td>
                            <td>${crop.variety || 'N/A'}</td>
                            <td>${crop.area_planted}</td>
                            <td>${new Date(crop.planting_date).toLocaleDateString()}</td>
                            <td>${crop.expected_harvest_date ? new Date(crop.expected_harvest_date).toLocaleDateString() : 'N/A'}</td>
                            <td><span class="status-badge ${crop.status}">${crop.status || 'active'}</span></td>
                            <td>${crop.notes ? `<div class="notes-cell">${crop.notes}</div>` : 'N/A'}</td>
                            <td>${crop.expected_harvest_quantity ? crop.expected_harvest_quantity + ' ' + (crop.harvest_unit || '') : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading user crops:', error);
        document.getElementById('userCropsContainer').innerHTML = '<div class="error">Error loading crops</div>';
    }
}

// Print Crops Table
function printCropsTable() {
    const table = document.getElementById('cropsTableToPrint');
    
    if (!table) {
        alert('No crops data to print');
        return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get current date for the report
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Write the HTML content
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>User Crops Report - CropTop</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                }
                
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #2ecc71;
                    padding-bottom: 20px;
                }
                
                .print-header h1 {
                    color: #2ecc71;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                
                .print-header p {
                    color: #666;
                    font-size: 14px;
                }
                
                .report-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                }
                
                .report-info div {
                    font-size: 14px;
                }
                
                .report-info strong {
                    color: #2ecc71;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                }
                
                thead {
                    background-color: #2ecc71;
                    color: white;
                }
                
                th, td {
                    padding: 12px 8px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                
                th {
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 11px;
                }
                
                tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                
                tbody tr:hover {
                    background-color: #e9ecef;
                }
                
                .user-info {
                    line-height: 1.4;
                }
                
                .user-name {
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                .user-email {
                    font-size: 10px;
                    color: #7f8c8d;
                }
                
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: bold;
                    text-transform: uppercase;
                    display: inline-block;
                }
                
                .status-badge.active {
                    background-color: #d4edda;
                    color: #155724;
                }
                
                .status-badge.harvested {
                    background-color: #cce5ff;
                    color: #004085;
                }
                
                .status-badge.failed {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                .notes-cell {
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .print-footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 2px solid #e9ecef;
                    padding-top: 20px;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    
                    .print-header {
                        page-break-after: avoid;
                    }
                    
                    table {
                        page-break-inside: auto;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    
                    thead {
                        display: table-header-group;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>CropTop - User Crops Report</h1>
                <p>Agricultural Cooperative Management System</p>
            </div>
            
            <div class="report-info">
                <div><strong>Report Date:</strong> ${currentDate}</div>
                <div><strong>Total Crops:</strong> ${table.querySelectorAll('tbody tr').length}</div>
            </div>
            
            ${table.outerHTML}
            
            <div class="print-footer">
                <p>Generated by CropTop Admin Dashboard | ${currentDate}</p>
                <p>This is a computer-generated report. No signature required.</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
    };
}