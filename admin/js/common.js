// 共用工具函數
class Utils {
    // 檢查瀏覽器是否支持 localStorage
    static isLocalStorageSupported() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.error('LocalStorage is not supported:', e);
            return false;
        }
    }

    // 安全地從 localStorage 獲取數據
    static getFromStorage(key, defaultValue = []) {
        try {
            if (!this.isLocalStorageSupported()) {
                throw new Error('LocalStorage is not supported');
            }
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error getting data from localStorage:', error);
            this.showToast('無法讀取數據，請刷新頁面重試', 'error');
            return defaultValue;
        }
    }

    // 安全地保存數據到 localStorage
    static saveToStorage(key, data) {
        try {
            if (!this.isLocalStorageSupported()) {
                throw new Error('LocalStorage is not supported');
            }
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            this.showToast('無法保存數據，請重試', 'error');
            return false;
        }
    }

    // 顯示提示訊息
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.innerHTML = `
            <div class="toast-message">${this.escapeHtml(message)}</div>
            <button class="toast-close" aria-label="關閉">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // 添加顯示動畫
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 點擊關閉按鈕
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hideToast(toast));
        
        // 自動關閉
        setTimeout(() => this.hideToast(toast), 5000);
    }
    
    static hideToast(toast) {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }
    
    // 防止 XSS 攻擊
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // 表單驗證
    static validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            // 必填檢查
            if (rule.required && !value) {
                errors[field] = rule.requiredMessage || '此欄位為必填';
                continue;
            }
            
            // 格式檢查
            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.invalidMessage || '格式不正確';
                continue;
            }
            
            // 自定義驗證
            if (value && rule.validate) {
                const customError = rule.validate(value, formData);
                if (customError) {
                    errors[field] = customError;
                }
            }
        }
        
        return Object.keys(errors).length === 0 ? null : errors;
    }
    
    // 顯示加載動畫
    static showLoading(container, message = '加載中...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        container.style.position = 'relative';
        container.appendChild(loading);
        return loading;
    }
    
    // 隱藏加載動畫
    static hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.style.position = '';
            loadingElement.remove();
        }
    }
}

// 表單驗證規則
const ValidationRules = {
    required: (message = '此欄位為必填') => ({
        required: true,
        requiredMessage: message
    }),
    
    email: (message = '請輸入有效的電子郵件') => ({
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        invalidMessage: message
    }),
    
    phone: (message = '請輸入有效的手機號碼') => ({
        pattern: /^09\d{8}$/,
        invalidMessage: message
    }),
    
    date: (message = '請輸入有效的日期') => ({
        validate: (value) => {
            const date = new Date(value);
            return isNaN(date.getTime()) ? message : null;
        }
    })
};

// 初始化頁面
function initializePage(defaultTab, loadDataCallback) {
    // 顯示加載動畫
    const mainContent = document.querySelector('.main-content');
    const loading = Utils.showLoading(mainContent);
    
    // 加載數據
    const loadData = async () => {
        try {
            await loadDataCallback();
            // 檢查 URL hash 來決定顯示哪個標籤頁
            const hash = window.location.hash.substring(1);
            const validTabs = ['dashboard', 'maintenance', 'test-drive', 'events', 'inventory'];
            const targetTab = validTabs.includes(hash) ? hash : defaultTab;
            
            // 顯示目標標籤頁
            showTab(targetTab);
        } catch (error) {
            console.error('Error initializing page:', error);
            Utils.showToast('初始化頁面失敗，請刷新重試', 'error');
        } finally {
            Utils.hideLoading(loading);
        }
    };
    
    // 監聽 hash 變化
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            showTab(hash);
        }
    });
    
    // 初始加載
    loadData();
}

// 導出共用功能
export { Utils, ValidationRules, initializePage };
