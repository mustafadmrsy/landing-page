/**
 * Modern UI JavaScript - Senirkent Blog
 * Header, Sidebar ve Profile Dropdown işlevselliği
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Modern UI JS loaded');
    
    // DOM elementleri
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const toggleIcon = document.getElementById('toggleIcon');
    const mainContent = document.querySelector('.main-content');
    
    // Profile dropdown
    const profileDropdownTrigger = document.getElementById('profileDropdownTrigger');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    
    // Bildirim dropdown
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    // Mobil cihaz kontrolü
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Tüm açık dropdown/menüleri kapatma fonksiyonu
    function closeAllMenus() {
        // Sidebar menüsünü kapat (sadece mobilde)
        if (isMobile() && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            
            // Overlay'ı kaldır
            const existingOverlay = document.querySelector('.mobile-menu-overlay');
            if (existingOverlay) {
                document.body.removeChild(existingOverlay);
            }
        }
        
        // Profil dropdown'ı kapat
        if (profileDropdownMenu && profileDropdownMenu.classList.contains('active')) {
            profileDropdownMenu.classList.remove('active');
        }
        
        // Bildirim dropdown'ı kapat
        if (notificationDropdown && notificationDropdown.classList.contains('active')) {
            notificationDropdown.classList.remove('active');
        }
    }
    
    // Sayfa body'sine tıklandığında tüm menüleri kapat
    document.body.addEventListener('click', function(e) {
        // Eğer tıklanan öğe dropdown trigger veya dropdown menü içerisinde değilse
        if (profileDropdownTrigger && !profileDropdownTrigger.contains(e.target) && 
            profileDropdownMenu && !profileDropdownMenu.contains(e.target) &&
            notificationIcon && !notificationIcon.contains(e.target) &&
            notificationDropdown && !notificationDropdown.contains(e.target) &&
            mobileMenuBtn && !mobileMenuBtn.contains(e.target) &&
            !sidebar.contains(e.target)) {
            
            closeAllMenus();
        }
    });
    
    // Eğer dropdown trigger varsa (kullanıcı giriş yapmışsa)
    if (profileDropdownTrigger && profileDropdownMenu) {
        profileDropdownTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Önce diğer açık menüleri kapat
            if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
            
            // Profil menüsünü aç/kapat
            profileDropdownMenu.classList.toggle('active');
        });
        
        // Dropdown içine tıklandığında yayılmayı durdur
        profileDropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Bildirim ikonu event handler'ı MasterPage.master içindeki script'te tanımlandı
    // Çatışmayı önlemek için buradaki handler kaldırıldı
    
    // Sidebar toggle durumunu localStorage'dan al
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Sayfa yüklendiğinde sidebar durumunu ayarla
    if (isSidebarCollapsed && !isMobile()) {
        sidebar.classList.add('collapsed');
        toggleIcon.classList.remove('fa-chevron-left');
        toggleIcon.classList.add('fa-chevron-right');
    }
    
    // Sidebar toggle butonu
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Olayın yayılmasını engelle
            
            // Önce açık menüleri kapat
            if (profileDropdownMenu && profileDropdownMenu.classList.contains('active')) {
                profileDropdownMenu.classList.remove('active');
            }
            
            if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
            
            if (isMobile()) {
                // Mobil cihazlarda
                sidebar.classList.toggle('active');
            } else {
                // Masaüstü cihazlarda
                sidebar.classList.toggle('collapsed');
                
                // Toggle icon değiştir
                if (sidebar.classList.contains('collapsed')) {
                    toggleIcon.classList.remove('fa-chevron-left');
                    toggleIcon.classList.add('fa-chevron-right');
                    localStorage.setItem('sidebarCollapsed', 'true');
                } else {
                    toggleIcon.classList.remove('fa-chevron-right');
                    toggleIcon.classList.add('fa-chevron-left');
                    localStorage.setItem('sidebarCollapsed', 'false');
                }
            }
        });
    }
    
    // Mobil menü için
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Olayın yayılmasını engelle
            
            // Önce açık menüleri kapat
            if (profileDropdownMenu && profileDropdownMenu.classList.contains('active')) {
                profileDropdownMenu.classList.remove('active');
            }
            
            if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
            
            sidebar.classList.toggle('active');
            
            // Arka plan efekti ekleyerek mobil menü açıldığında gölge oluştur
            if (sidebar.classList.contains('active')) {
                const overlay = document.createElement('div');
                overlay.className = 'mobile-menu-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '899';
                document.body.appendChild(overlay);
                
                // Overlay'a tıklayınca menüyü kapat
                overlay.addEventListener('click', function() {
                    sidebar.classList.remove('active');
                    document.body.removeChild(overlay);
                });
            } else {
                // Menü kapanırsa overlay'ı kaldır
                const existingOverlay = document.querySelector('.mobile-menu-overlay');
                if (existingOverlay) {
                    document.body.removeChild(existingOverlay);
                }
            }
        });
    }
    
    // Sayfa içeriğine tıklandığında mobil menüyü kapat
    if (mainContent && sidebar) {
        mainContent.addEventListener('click', function() {
            closeAllMenus();
        });
    }
    
    // Pencere boyutu değiştiğinde kontrol et
    window.addEventListener('resize', function() {
        // Mobil -> Masaüstü geçişte ayarları düzelt
        if (!isMobile()) {
            // Mobil menü açıksa kapat
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                
                // Overlay'ı kaldır
                const existingOverlay = document.querySelector('.mobile-menu-overlay');
                if (existingOverlay) {
                    document.body.removeChild(existingOverlay);
                }
            }
            
            // Sidebar collapsed durumunu localStorage'dan kontrol et
            const shouldBeCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (shouldBeCollapsed) {
                sidebar.classList.add('collapsed');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-chevron-left');
                    toggleIcon.classList.add('fa-chevron-right');
                }
            } else {
                sidebar.classList.remove('collapsed');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-chevron-right');
                    toggleIcon.classList.add('fa-chevron-left');
                }
            }
        } else {
            // Masaüstü -> Mobil geçişte ayarları düzelt
            sidebar.classList.remove('collapsed');
            
            // Açık menüleri kapat
            closeAllMenus();
        }
    });
}); 