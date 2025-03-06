/**
 * Senirkent MYO Blog - Mobil Hamburger Menü
 * Açıklama: Hamburger menüsü kontrolü için özel script (mobil sorunu çözmek için)
 * Sürüm: 1.0.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

// DOMContentLoaded olayını bekle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hamburger Menu: Initialized');
    
    // Global dokunma olayı takibi
    let touchStartX = 0;
    let touchStartY = 0;
    
    // Mobil elementleri seç
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    // Varsa mevcut event listenerları temizle
    document.body.addEventListener('click', function(e) {
        // Sadece mobil görünümde çalışsın
        if (window.innerWidth > 768) {
            return;
        }
        
        // Hamburger butonu dışındaki tıklamalarda menü kapanmasın
        if (e.target !== hamburgerBtn && !hamburgerBtn.contains(e.target)) {
            // Devamını oku butonları için menüyü açma
            if (e.target.classList.contains('btn-daha') || 
                e.target.closest('.btn-daha') ||
                e.target.classList.contains('read-more') || 
                e.target.closest('.read-more') ||
                e.target.classList.contains('category-item') || 
                e.target.closest('.category-item')) {
                e.stopPropagation();
            }
        }
    }, true);
    
    // Hamburger menü fonksiyonları
    function openMobileMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        mobileMenu.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Hamburger Menu: Opened');
    }
    
    function closeMobileMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        mobileMenu.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Hamburger Menu: Closed');
    }
    
    // Menü durumunu kontrol et
    function isMenuOpen() {
        return mobileMenu.classList.contains('active');
    }
    
    // Hamburger butonuna tıklama olayı
    if (hamburgerBtn) {
        // Tüm eski event listenerları temizle
        const newHamburgerBtn = hamburgerBtn.cloneNode(true);
        hamburgerBtn.parentNode.replaceChild(newHamburgerBtn, hamburgerBtn);
        
        // Yeni buton için event
        newHamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isMenuOpen()) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Dokunma olayları için
        newHamburgerBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        newHamburgerBtn.addEventListener('touchend', function(e) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Küçük bir dokunma alanı içinde kaldıysa tıklama kabul et
            if (Math.abs(touchEndX - touchStartX) < 10 && Math.abs(touchEndY - touchStartY) < 10) {
                e.preventDefault();
                
                if (isMenuOpen()) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            }
        });
    }
    
    // Menü kapatma butonuna tıklama olayı
    if (mobileCloseBtn) {
        const newCloseBtn = mobileCloseBtn.cloneNode(true);
        mobileCloseBtn.parentNode.replaceChild(newCloseBtn, mobileCloseBtn);
        
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
    }
    
    // Overlay'e tıklama olayı
    if (mobileOverlay) {
        const newOverlay = mobileOverlay.cloneNode(true);
        mobileOverlay.parentNode.replaceChild(newOverlay, mobileOverlay);
        
        newOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
    }
    
    // Navigasyon linklerine tıklama olayı
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Link tıklamasının normal davranışını engelleme
            // closeMobileMenu(); // İsteğe bağlı - tıklandığında menüyü kapat
        });
    });
    
    // Mobil logo tıklamasını engelleme
    const mobileLogoLink = document.querySelector('.mobile-logo-link');
    if (mobileLogoLink) {
        const newLogoLink = mobileLogoLink.cloneNode(true);
        mobileLogoLink.parentNode.replaceChild(newLogoLink, mobileLogoLink);
        
        newLogoLink.addEventListener('click', function(e) {
            e.stopPropagation();
            // Normal navigasyon davranışını koru
        });
    }
    
    // Sayfa yüklendiğinde ve boyutu değiştiğinde
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen()) {
            closeMobileMenu();
        }
    });
    
    // Devamını Oku butonları için özel işleme
    document.addEventListener('click', function(e) {
        // Sadece mobil görünümde çalışsın
        if (window.innerWidth > 768) {
            return;
        }
        
        // Devamını Oku butonları veya kategori öğeleri için
        if (e.target.classList.contains('btn-daha') || 
            e.target.closest('.btn-daha') ||
            e.target.classList.contains('read-more') || 
            e.target.closest('.read-more') ||
            e.target.classList.contains('category-item') || 
            e.target.closest('.category-item')) {
            
            // Menüyü açmayı engelle
            e.stopPropagation();
        }
    }, true);
    
    // Dokunma olayları içinde hamburger menüyü etkinleştirme/devre dışı bırakma
    document.addEventListener('touchstart', function(e) {
        // Sadece mobil görünümde çalışsın
        if (window.innerWidth > 768) {
            return;
        }
        
        // Hamburger butonu dokunması
        if (e.target === hamburgerBtn || hamburgerBtn.contains(e.target)) {
            return; // Hamburger butonuna normal davranış
        }
        
        // Devamını Oku butonları veya kategori öğeleri için
        if (e.target.classList.contains('btn-daha') || 
            e.target.closest('.btn-daha') ||
            e.target.classList.contains('read-more') || 
            e.target.closest('.read-more') ||
            e.target.classList.contains('category-item') || 
            e.target.closest('.category-item')) {
            
            // Diğer olayları devreden çıkar, sadece tıklanan elemana özel davranış
            e.stopPropagation();
        }
    }, true);
});
