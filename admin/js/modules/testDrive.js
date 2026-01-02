// Test Drive Module

// 確保函數在全局作用域中可用
window.updateTestDriveStatus = updateTestDriveStatus;
window.deleteTestDrive = deleteTestDrive;
window.loadAndDisplayTestDrives = loadAndDisplayTestDrives;

// 初始化事件監聽
document.addEventListener('DOMContentLoaded', function() {
    initializeTestDriveEvents();
    loadAndDisplayTestDrives();
});

// 更新賞車預約表格行
function updateTestDriveTableRow(row, testDrive) {
    const status = testDrive.status || 'pending';
    const statusText = status === 'completed' ? '已賞車' : '未賞車';
    const statusClass = status === 'completed' ? 'status-completed' : 'status-pending';
    
    row.innerHTML = `
        <td>${testDrive.customerName || '--'}</td>
        <td>${testDrive.phone || '--'}</td>
        <td>${testDrive.brand ? testDrive.brand + (testDrive.carModel ? ' - ' + testDrive.carModel : '') : '--'}</td>
        <td>${testDrive.appointmentDate ? new Date(testDrive.appointmentDate).toLocaleDateString('zh-TW') + ' ' + (testDrive.timeSlot || '') : '--'}</td>
        <td>${testDrive.notes || '--'}</td>
        <td>
            <span class="status-badge ${statusClass}">
                ${statusText}
            </span>
        </td>
        <td class="actions">
            <div class="btn-group">
                <button class="btn btn-sm btn-status ${status === 'completed' ? 'btn-success' : 'btn-outline-secondary'}" 
                        onclick="testDriveModule.updateTestDriveStatus('${testDrive.id}', '${status === 'completed' ? 'pending' : 'completed'}')">
                    <i class="fas ${status === 'completed' ? 'fa-undo' : 'fa-check'}"></i>
                    ${status === 'completed' ? '標記未賞車' : '標記已賞車'}
                </button>
                <button class="btn btn-sm btn-edit" onclick="testDriveModule.editTestDrive('${testDrive.id}')">
                    <i class="fas fa-edit"></i> 編輯
                </button>
                <button class="btn btn-sm btn-delete" onclick="if(confirm('確定要刪除此預約嗎？')) { testDriveModule.deleteTestDrive('${testDrive.id}'); }">
                    <i class="fas fa-trash"></i> 刪除
                </button>
            </div>
        </td>
    `;
}

// 載入並顯示賞車預約數據
function loadAndDisplayTestDrives() {
    const allSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    // 過濾出試乘預約的資料
    const testDrives = allSubmissions.filter(item => item && item.type === 'test-drive');
    const tbody = document.querySelector('#test-drive-table tbody');
    
    if (!tbody) {
        console.error('找不到表格主體元素');
        return;
    }
    
    // 清空現有內容
    tbody.innerHTML = '';
    
    if (testDrives.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">暫無預約資料</td>';
        tbody.appendChild(row);
        return;
    }
    
    // 更新今日預約計數
    const today = new Date().toISOString().split('T')[0];
    const todayCount = testDrives.filter(drive => {
        const driveDate = drive.selectedDate || drive.date;
        return driveDate && new Date(driveDate).toISOString().split('T')[0] === today;
    }).length;
    updateTodayTestDriveCount(todayCount);
    
    // 按預約日期和時間排序（從早到晚）
    const sortedTestDrives = [...testDrives].sort((a, b) => {
        // 獲取日期和時間
        const dateA = a.selectedDate || a.date || '';
        const timeA = a.selectedTime || a.timeSlot || '';
        const dateB = b.selectedDate || b.date || '';
        const timeB = b.selectedTime || b.timeSlot || '';
        
        // 轉換為可比較的日期時間格式
        const dateTimeA = new Date(`${dateA} ${timeA}`).getTime();
        const dateTimeB = new Date(`${dateB} ${timeB}`).getTime();
        
        // 從早到晚排序
        return dateTimeA - dateTimeB;
    });
    
    // 生成表格行
    sortedTestDrives.forEach((testDrive) => {
        const row = document.createElement('tr');
        updateTestDriveTableRow(row, {
            ...testDrive,
            // 確保所有需要的字段都有值
            customerName: testDrive.name || testDrive.customerName,
            phone: testDrive.phone || '',
            brand: testDrive.brand || '',
            carModel: testDrive.model || testDrive.carModel || '',
            appointmentDate: testDrive.selectedDate || testDrive.date || '',
            timeSlot: testDrive.selectedTime || testDrive.timeSlot || '',
            notes: testDrive.notes || '',
            status: testDrive.status || 'pending',
            id: testDrive.id
        });
        tbody.appendChild(row);
    });
}

// 更新試乘車型選項
function updateTestDriveModels(selectElement) {
    const modelSelect = document.getElementById('modelSelect');
    const brand = selectElement.value;
    
    // 清空現有選項
    modelSelect.innerHTML = '';
    
    // 根據選擇的品牌添加對應的車型選項
    let options = [{value: '', text: '— 第二步：請選擇預約車款 —', disabled: true, selected: true}];
    
    if (brand === 'kawasaki') {
        options = options.concat([
            {value: 'ninja_zx10r', text: 'NINJA ZX-10R'},
            {value: 'ninja_zx6r', text: 'NINJA ZX-6R'},
            {value: 'z_h2', text: 'Z H2'},
            {value: 'ninja_h2', text: 'NINJA H2'},
            {value: 'versys_1000', text: 'VERSYS 1000'},
            {value: 'z650', text: 'Z650'}
        ]);
    } else if (brand === 'kymco') {
        options = options.concat([
            {value: 'ak550', text: 'AK550'},
            {value: 'dt_x360', text: 'DT X360'},
            {value: 'krv', text: 'KRV'},
            {value: 'racing_s', text: 'RACING S'},
            {value: 'new_many', text: 'NEW MANY'}
        ]);
    } else if (brand === 'used') {
        options = options.concat([
            {value: 'used_1', text: '二手車 1'},
            {value: 'used_2', text: '二手車 2'},
            {value: 'used_3', text: '二手車 3'}
        ]);
    }
    
    // 添加選項到下拉選單
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        if (option.disabled) optionElement.disabled = true;
        if (option.selected) optionElement.selected = true;
        modelSelect.appendChild(optionElement);
    });
    
    // 啟用車型選擇
    modelSelect.disabled = !brand;
}

// 更新賞車預約狀態
function updateTestDriveStatus(id, status) {
    const allSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    const index = allSubmissions.findIndex(item => item && item.id === id && item.type === 'test-drive');

    if (index !== -1) {
        allSubmissions[index].status = status;
        localStorage.setItem('formSubmissions', JSON.stringify(allSubmissions));
        showToast('狀態更新成功', 'success');
        loadAndDisplayTestDrives();
    } else {
        showToast('找不到對應的預約資料', 'error');
    }
}

// 刪除賞車預約
function deleteTestDrive(id) {
    if (!confirm('確定要刪除此賞車預約嗎？')) return;
    
    const allSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    const updatedSubmissions = allSubmissions.filter(item => !(item && item.id === id && item.type === 'test-drive'));
    
    localStorage.setItem('formSubmissions', JSON.stringify(updatedSubmissions));
    loadAndDisplayTestDrives();
    showToast('預約已刪除', 'success');
}

// 更新今日賞車預約計數
function updateTodayTestDriveCount(testDrives) {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = testDrives.filter(drive => 
        drive.appointmentDate === today
    ).length;
    
    const element = document.querySelector('.stat-card:nth-child(2) .stat-number');
    if (element) {
        element.textContent = todayCount;
        const changeElement = element.nextElementSibling;
        if (todayCount > 0) {
            changeElement.textContent = '今日預約';
            changeElement.style.color = '#2ecc71';
        } else {
            changeElement.textContent = '尚無預約';
            changeElement.style.color = '';
        }
    }
}

// 初始化事件監聽
function initializeTestDriveEvents() {
    // 新增賞車預約按鈕
    const addButton = document.getElementById('add-test-drive');
    if (addButton) {
        addButton.addEventListener('click', function() {
            openModal('testDrive');
        });
    }
    
    // 刷新按鈕
    const refreshButton = document.getElementById('refresh-test-drive');
    if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
            e.preventDefault();
            loadAndDisplayTestDrives();
            showToast('賞車預約列表已刷新', 'info');
        });
    }
}

// 導出模組
const testDriveModule = {
    updateTestDriveTableRow,
    loadAndDisplayTestDrives,
    updateTestDriveModels,
    updateTestDriveStatus,
    deleteTestDrive,
    editTestDrive: function(id) {
        editItem('test-drive', id);
    }
};

// 將模組添加到全局作用域
window.testDriveModule = testDriveModule;
