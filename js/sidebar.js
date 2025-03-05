/**
 * Senirkent MYO Blog - Sidebar İşlevselliği
 * Açıklama: Sidebar'ın açılıp-kapanması, daraltılması ve mobil uyumluluğu için script
 * Yazar: Mustafa Demirsoy
 * Sürüm: 1.3.0
 * Güncelleme Tarihi: 5 Mart 2025
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar ve ilgili elementleri tanımla
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
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
    
    // Sidebar Toggle Fonksiyonu - Masaüstü/Mobil durumuna göre davran
    function toggleSidebar() {
        // Masaüstü görünümünde (769px ve üzeri) sidebar'ı daralt/genişlet
        if (window.innerWidth >= 769) {
            sidebar.classList.toggle('collapsed');
            
            // Sidebar daraltıldığında ikon yönünü değiştir
            if (sidebar.classList.contains('collapsed')) {
                sidebarToggleBtn.querySelector('i').classList.remove('fa-chevron-left');
                sidebarToggleBtn.querySelector('i').classList.add('fa-chevron-right');
            } else {
                sidebarToggleBtn.querySelector('i').classList.remove('fa-chevron-right');
                sidebarToggleBtn.querySelector('i').classList.add('fa-chevron-left');
            }
        } 
        // Mobil görünümünde (768px ve altı) sidebar'ı aç/kapat
        else {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            
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
    
    // Overlay'e tıklama olayını ekle - Mobil görünümde sidebar'ı kapat
    overlay.addEventListener('click', function() {
        if (sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
    
    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', function() {
        // Mobil görünümünden masaüstü görünümüne geçince
        if (window.innerWidth >= 769 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        }
        
        // Masaüstü görünümünden mobil görünüme geçince
        if (window.innerWidth < 769 && sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            sidebarToggleBtn.querySelector('i').classList.remove('fa-chevron-right');
            sidebarToggleBtn.querySelector('i').classList.add('fa-chevron-left');
        }
    });
    
    // Escape tuşuna basılınca sidebar'ı kapat (mobil görünümde)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
});
