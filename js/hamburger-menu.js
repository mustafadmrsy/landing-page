/**
 * Senirkent MYO Blog - Mobil Hamburger Menü
 * Açıklama: Hamburger menüsü kontrolü için özel script (mobil sorunu çözmek için)
 * Sürüm: 1.0.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

// DOMContentLoaded olayını bekle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hamburger Menu: Initialized - Minimal Version');
    
    // Mobil elementleri seç
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    
    // Menü durumunu kontrol et
    function isMenuOpen() {
        return mobileMenu.classList.contains('active');
    }
    
    // Menü açma/kapama işlevleri
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        console.log('Hamburger Menu: Opened');
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        console.log('Hamburger Menu: Closed');
    }
    
    // Hamburger butonuna tıklama olayı
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Sadece bu olayı durdur
            
            if (isMenuOpen()) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    // Menü kapatma butonuna tıklama olayı
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Sadece bu olayı durdur
            closeMobileMenu();
        });
    }
    
    // Overlay'e tıklama olayı
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function(e) {
            e.stopPropagation(); // Sadece bu olayı durdur
            closeMobileMenu();
        });
    }
});
