document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    const overlay = document.querySelector('.overlay');
    const body = document.body;
    
    // 確保元素存在
    if (!menuToggle || !navList || !overlay) return;

    // 切換選單函數
    function toggleMenu(isOpening) {
        menuToggle.classList.toggle('active', isOpening);
        navList.classList.toggle('active', isOpening);
        overlay.classList.toggle('active', isOpening);
        body.classList.toggle('menu-open', isOpening);

        // 處理滾動鎖定
        if (isOpening) {
            const scrollY = window.scrollY;
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.width = '100%';
        } else {
            const scrollY = body.style.top;
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }

    // 點擊漢堡選單按鈕
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpening = !this.classList.contains('active');
        toggleMenu(isOpening);
    });

    // 點擊遮罩關閉選單
    overlay.addEventListener('click', function() {
        toggleMenu(false);
    });

    // 點擊導航連結關閉選單
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            toggleMenu(false);
        });
    });

    // 點擊頁面其他區域關閉選單
    document.addEventListener('click', function(e) {
        if (menuToggle.classList.contains('active') && 
            !e.target.closest('.nav-list') && 
            !e.target.closest('.menu-toggle')) {
            toggleMenu(false);
        }
    });

    // 視窗大小改變時檢查是否要隱藏選單
    function handleResize() {
        if (window.innerWidth > 992) {
            toggleMenu(false);
        }
    }

    // 添加防抖函數
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // 視窗大小改變時重新整理選單狀態
    window.addEventListener('resize', debounce(handleResize, 250));
});
