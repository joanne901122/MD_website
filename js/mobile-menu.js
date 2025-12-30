document.addEventListener('DOMContentLoaded', function() {
    // 確保只在行動裝置上執行
    if (window.innerWidth <= 992) {
        const menuToggle = document.querySelector('.menu-toggle');
        const navList = document.querySelector('.nav-list');
        const overlay = document.querySelector('.overlay');
        const body = document.body;
        
        // 點擊漢堡選單按鈕
        if (menuToggle) {
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
                navList.classList.toggle('active');
                overlay.classList.toggle('active');
                body.style.overflow = this.classList.contains('active') ? 'hidden' : '';
            });
        }
        
        // 點擊遮罩關閉選單
        if (overlay) {
            overlay.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navList.classList.remove('active');
                this.classList.remove('active');
                body.style.overflow = '';
            });
        }
        
        // 點擊導航連結關閉選單
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navList.classList.remove('active');
                overlay.classList.remove('active');
                body.style.overflow = '';
            });
        });
        
        // 點擊頁面其他區域關閉選單
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-list') && !e.target.closest('.menu-toggle')) {
                menuToggle.classList.remove('active');
                navList.classList.remove('active');
                overlay.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }
    
    // 視窗大小改變時重新整理選單狀態
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 992) {
                // 桌面版：確保選單可見
                const navList = document.querySelector('.nav-list');
                const overlay = document.querySelector('.overlay');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (navList) navList.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, 250);
    });
});
