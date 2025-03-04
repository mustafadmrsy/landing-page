// Sidebar işlevselliği
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sidebar.js yüklendi ve sadeleştirildi');
    
    // Temel elementleri seç
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    
    console.log('Sidebar mevcut mu:', !!sidebar);
    console.log('Sidebar toggle buton mevcut mu:', !!sidebarToggle);

    // Basit ve doğrudan çalışan işlev
    function handleSidebarToggle(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('Sidebar toggle tetiklendi');
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            sidebar.classList.toggle('active');
            
            // Local storage'a durumu kaydet
            if (window.innerWidth > 768) {
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            }
            
            // Mobil görünümde body'ye sınıf ekleyip kaldırma
            if (window.innerWidth <= 768) {
                document.body.classList.toggle('sidebar-open');
                
                // Sidebar açıkken body scroll'u engelleme
                if (sidebar.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
            
            console.log('Sidebar durumu değiştirildi');
        }
    }
    
    // Event listeners ekle
    if (sidebarToggle) {
        // Tüm eski event listener'ları temizle
        sidebarToggle.replaceWith(sidebarToggle.cloneNode(true));
        
        // Yeni buton referansını al
        const newSidebarToggle = document.querySelector('.sidebar-toggle');
        
        // Click event listener'ı ekle
        newSidebarToggle.addEventListener('click', handleSidebarToggle);
        
        // Dokunmatik ekranlar için touch event listener
        newSidebarToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            handleSidebarToggle(e);
        });
        
        console.log('Sidebar toggle event listener eklendi');
    }
    
    // Sidebar dışına tıklandığında sidebar'ı kapat (mobil)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
            // Sidebar'ın içine veya toggle butonuna tıklanmadıysa
            if (!sidebar.contains(e.target) && 
                !document.querySelector('.sidebar-toggle').contains(e.target)) {
                sidebar.classList.remove('active');
                document.body.classList.remove('sidebar-open');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Sidebar durumunu localStorage'dan al
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isSidebarCollapsed && window.innerWidth > 768 && sidebar) {
        sidebar.classList.add('collapsed');
    }
});
