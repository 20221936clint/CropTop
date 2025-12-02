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
                        <th>Photo</th>
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
                                ${crop.photo_url ? `
                                    <div class="crop-photo-thumbnail">
                                        <img src="${crop.photo_url}" alt="${crop.crop_name}" onclick="showPhotoModal('${crop.photo_url}', '${crop.crop_name}')" style="cursor: pointer;" data-photo-url="${crop.photo_url}" />
                                    </div>
                                ` : '<span style="color: #999;">No photo</span>'}
                            </td>
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

// Show photo in modal
window.showPhotoModal = function(photoUrl, cropName) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>${cropName}</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                <img src="${photoUrl}" alt="${cropName}" style="width: 100%; height: auto; display: block;" />
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
};

// Print Crops Table
function printCropsTable() {
    const table = document.getElementById('cropsTableToPrint');
    
    if (!table) {
        alert('No crops data to print');
        return;
    }
    
    // Clone the table to modify for printing
    const printTable = table.cloneNode(true);
    
    // Convert all images to base64 for printing
    const images = printTable.querySelectorAll('img[data-photo-url]');
    let imagesLoaded = 0;
    const totalImages = images.length;
    
    if (totalImages === 0) {
        // No images to load, proceed with printing
        generatePrintWindow(printTable);
        return;
    }
    
    // Convert each image to base64
    images.forEach((img, index) => {
        const photoUrl = img.getAttribute('data-photo-url');
        
        // Create a new image to load
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        
        tempImg.onload = function() {
            try {
                // Create canvas to convert to base64
                const canvas = document.createElement('canvas');
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(tempImg, 0, 0);
                
                // Convert to base64
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                img.src = base64;
            } catch (e) {
                console.error('Error converting image to base64:', e);
            }
            
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                generatePrintWindow(printTable);
            }
        };
        
        tempImg.onerror = function() {
            console.error('Error loading image:', photoUrl);
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                generatePrintWindow(printTable);
            }
        };
        
        tempImg.src = photoUrl;
    });
}

// Generate print window with the table
function generatePrintWindow(printTable) {
    const printWindow = window.open('', '_blank');
    
    // Get current date for the report
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const totalRows = printTable.querySelectorAll('tbody tr').length;
    
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
                    font-size: 11px;
                }
                
                thead {
                    background-color: #2ecc71;
                    color: white;
                }
                
                th, td {
                    padding: 10px 6px;
                    text-align: left;
                    border: 1px solid #ddd;
                    vertical-align: middle;
                }
                
                th {
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 10px;
                }
                
                tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                
                .crop-photo-thumbnail {
                    width: 50px;
                    height: 50px;
                    border-radius: 6px;
                    overflow: hidden;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .crop-photo-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                
                .user-info {
                    line-height: 1.4;
                }
                
                .user-name {
                    font-weight: bold;
                    color: #2c3e50;
                    font-size: 11px;
                }
                
                .user-email {
                    font-size: 9px;
                    color: #7f8c8d;
                }
                
                .status-badge {
                    padding: 3px 6px;
                    border-radius: 10px;
                    font-size: 9px;
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
                    max-width: 150px;
                    font-size: 10px;
                    line-height: 1.3;
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
                        padding: 10px;
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
                    
                    .crop-photo-thumbnail {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
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
                <div><strong>Total Crops:</strong> ${totalRows}</div>
            </div>
            
            ${printTable.outerHTML}
            
            <div class="print-footer">
                <p>Generated by CropTop Admin Dashboard | ${currentDate}</p>
                <p>This is a computer-generated report. No signature required.</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content and images to load, then print
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };
}