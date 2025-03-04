// Sidebar butonunu düzeltme script'i
(function() {
    // Sayfa yüklenir yüklenmez çalıştır
    function initSidebarToggle() {
        console.log('Sidebar-fix.js çalışıyor');
        
        // Sidebar toggle butonunu seç
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        // Eğer buton yoksa işlem yapma
        if (!sidebarToggle) {
            console.error('Sidebar toggle butonu bulunamadı!');
            return;
        }
        
        console.log('Sidebar toggle butonu bulundu, düzeltme uygulanıyor');
        
        // Buton için doğrudan onclick özelliği ekleyerek çalışmasını sağla
        sidebarToggle.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Sidebar toggle butonu tıklandı');
            
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.toggle('active');
                
                console.log('Sidebar durumu değiştirildi');
                
                // Masaüstünde local storage'a kaydet
                if (window.innerWidth > 768) {
                    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
                }
            } else {
                console.error('Sidebar elementi bulunamadı!');
            }
            
            return false;
        };
        
        console.log('Sidebar toggle butonu için düzeltme tamamlandı');
    }
    
    // Sayfa yüklendiğinde çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebarToggle);
    } else {
        initSidebarToggle();
    }
    
    // 500ms sonra tekrar çalıştır
    setTimeout(initSidebarToggle, 500);
    
    // 1000ms sonra tekrar çalıştır
    setTimeout(initSidebarToggle, 1000);
})();
