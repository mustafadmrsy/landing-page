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
            console.log('Sidebar durumu değişiyor:', sidebar.classList.contains('active') ? 'açık -> kapalı' : 'kapalı -> açık');
            
            // Toggle active class
            sidebar.classList.toggle('active');
            
            // Desktop için collapsed class toggle et
            if (window.innerWidth > 768) {
                sidebar.classList.toggle('collapsed');
                
                // Main padding'i ayarla
                const mainElement = document.querySelector('main');
                if (mainElement) {
                    if (sidebar.classList.contains('collapsed')) {
                        mainElement.classList.add('sidebar-collapsed');
                    } else {
                        mainElement.classList.remove('sidebar-collapsed');
                    }
                }
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
            
            console.log('Sidebar durumu değiştirildi, yeni durum:', 
                         sidebar.classList.contains('active') ? 'açık' : 'kapalı');
        }
    }
    
    // Event listeners ekle
    if (sidebarToggle) {
        console.log('Toggle butonuna event listener ekleniyor');
        
        // Click event listener'ı ekle
        sidebarToggle.addEventListener('click', handleSidebarToggle);
        
        // Dokunmatik ekranlar için touch event listener
        sidebarToggle.addEventListener('touchend', function(e) {
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
                console.log('Sidebar dışına tıklandı, kapatıldı');
            }
        }
    });
    
    // Sayfa yüklendiğinde collapsed sınıfı varsa sidebar-collapsed sınıfını ekle
    if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('collapsed')) {
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.classList.add('sidebar-collapsed');
        }
    }
});
