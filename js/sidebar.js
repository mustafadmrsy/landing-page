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
    
    // Mobil menü elementleri
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
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
    
    // Mobil nav linklerinde aktif olanı işaretle
    mobileNavLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
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
    
    // Hamburger menü işlevselliği
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        
        // Mobil menü açılınca scroll'u engelle
        if (mobileMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
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
    
    // Hamburger butonuna tıklama olayını ekle
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Mobil menü kapatma butonuna tıklama olayını ekle
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Mobil overlay'e tıklama olayını ekle
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', toggleMobileMenu);
    }
    
    // Overlay'e tıklama olayını ekle
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }
    
    // Pencere boyutu değiştiğinde mobil görünümü kontrol et
    window.addEventListener('resize', function() {
        checkMobileView();
        
        // Masaüstü görünümüne geçildiğinde mobil menüyü kapat
        if (window.innerWidth > 768) {
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            body.style.overflow = '';
        }
    });
    
    // Sidebar durumunu kontrol et - sayfa yüklendiğinde
    function checkSidebarState() {
        const savedState = localStorage.getItem('sidebarState');
        
        // Eğer önceden kaydedilmiş durum varsa
        if (savedState === 'collapsed') {
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
