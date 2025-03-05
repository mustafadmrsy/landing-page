/**
 * Senirkent MYO Blog - Sidebar İşlevselliği
 * Açıklama: Sidebar'ın açılıp-kapanması, daraltılması ve mobil uyumluluğu için script
 * Yazar: Mustafa Demirsoy
 * Sürüm: 2.0.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar ve ilgili elementleri tanımla
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
    const sidebarFixedToggleBtn = document.querySelector('.sidebar-fixed-toggle');
    const mainContent = document.querySelector('main');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Geçerli sayfayı belirle ve aktif linkini işaretle
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
        
        // Tooltip için data attribute ekle (daraltılmış sidebar için)
        if (link.querySelector('.nav-text')) {
            const text = link.querySelector('.nav-text').textContent.trim();
            link.setAttribute('data-title', text);
        }
    });
    
    // Sidebar overlay'i oluştur (mobil görünüm için)
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        body.appendChild(overlay);
    }
    
    // Mobil cihazlarda görünüme uygun sınıfları ekle
    function checkMobileView() {
        if (window.innerWidth <= 768) {
            body.classList.add('mobile-view');
            if (!sidebar.classList.contains('active')) {
                body.classList.remove('sidebar-active');
            }
        } else {
            body.classList.remove('mobile-view');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        }
    }
    
    // Sayfa yüklendiğinde mobil görünümü kontrol et
    checkMobileView();
    
    // Sidebar Toggle Fonksiyonu - Masaüstü/Mobil durumuna göre davran
    function toggleSidebar() {
        // Masaüstü görünümünde (769px ve üzeri) sidebar'ı daralt/genişlet
        if (window.innerWidth >= 769) {
            sidebar.classList.toggle('collapsed');
            body.classList.toggle('sidebar-collapsed');
            
            // Sidebar durumunu kaydet
            localStorage.setItem('sidebarState', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
            
            // Sidebar daraltıldığında ikon yönünü değiştir
            if (sidebar.classList.contains('collapsed')) {
                if (sidebarToggleBtn.querySelector('i')) {
                    sidebarToggleBtn.querySelector('i').classList.remove('fa-chevron-left');
                    sidebarToggleBtn.querySelector('i').classList.add('fa-chevron-right');
                }
            } else {
                if (sidebarToggleBtn.querySelector('i')) {
                    sidebarToggleBtn.querySelector('i').classList.remove('fa-chevron-right');
                    sidebarToggleBtn.querySelector('i').classList.add('fa-chevron-left');
                }
            }
        } 
        // Mobil görünümünde (768px ve altı) sidebar'ı aç/kapat
        else {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            body.classList.toggle('sidebar-active');
            
            // Sidebar açılınca scroll'u engelle
            if (sidebar.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        }
    }
    
    // Sidebar toggle butonuna tıklama olayını ekle
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Sabit toggle butonuna tıklama olayını ekle
    if (sidebarFixedToggleBtn) {
        sidebarFixedToggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Overlay'e tıklanınca sidebar'ı kapat (mobil görünümde)
    overlay.addEventListener('click', function() {
        if (sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
    
    // ESC tuşuna basılınca sidebar'ı kapat (mobil görünümde)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
    
    // Ekran boyutu değiştiğinde mobil görünümü kontrol et
    window.addEventListener('resize', function() {
        checkMobileView();
    });
    
    // Sidebar durumunu kontrol et - sayfa yüklendiğinde
    function checkSidebarState() {
        // Local storage'dan sidebar durumunu kontrol et
        const sidebarState = localStorage.getItem('sidebarState');
        
        // Eğer daha önce kapalı olarak kaydedilmişse
        if (sidebarState === 'collapsed') {
            sidebar.classList.add('collapsed');
            body.classList.add('sidebar-collapsed');
            
            if (sidebarToggleBtn.querySelector('i')) {
                sidebarToggleBtn.querySelector('i').classList.remove('fa-chevron-left');
                sidebarToggleBtn.querySelector('i').classList.add('fa-chevron-right');
            }
        }
    }
    
    // Sayfa yüklendiğinde sidebar durumunu kontrol et
    checkSidebarState();
});
