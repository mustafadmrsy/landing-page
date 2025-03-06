/**
 * Senirkent MYO Blog - Mobil Dokunma Çözümü (Acil Düzeltme)
 * Tüm mobil etkileşimleri doğru şekilde yöneten basit çözüm.
 * Sürüm: 4.0 - 06 Mart 2025
 */

// hamburger-menu.js devre dışı bırakmak için en başta tanımla
window.hamburgerMenuInitialized = true;

// DOMContentLoaded olayı ile tetikle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile.js v4.0: KRITIK DÜZELTME - Script yükleme sırası değiştirildi');
    
    // Mobil cihaz tespiti
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Mobil veya değil, bu script her zaman çalışsın (daha güvenli)
    console.log('Mobil durum:', isMobile ? 'MOBİL CİHAZ' : 'MASAÜSTÜ CİHAZ');
    
    // ===== HAMBURGER MENÜ DOKUNMA İŞLEMLERİ =====
    // Hamburger menü öğelerini tanımla
    var hamburgerBtn = document.querySelector('.hamburger-btn');
    var mobileMenu = document.querySelector('.mobile-menu');
    var mobileOverlay = document.querySelector('.mobile-overlay');
    var mobileCloseBtn = document.querySelector('.mobile-close-btn');
    
    // Menü kontrolü - Ana fonksiyon
    function toggleMobileMenu() {
        if (mobileMenu) {
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                mobileMenu.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            console.log('Mobil menü durumu değiştirildi');
        }
    }
    
    // Global olarak menü açma/kapama fonksiyonu
    window.toggleMobileMenu = toggleMobileMenu;
    
    // Sadece hamburger butonuna dokunma
    if (hamburgerBtn) {
        console.log('Hamburger butonu bulundu');
        
        // ÖNEMLİ: Tüm olayları kaldır (çakışmaları önlemek için)
        var newHamburgerBtn = hamburgerBtn.cloneNode(true);
        hamburgerBtn.parentNode.replaceChild(newHamburgerBtn, hamburgerBtn);
        hamburgerBtn = newHamburgerBtn;
        
        // Dokunma olayı ekle
        hamburgerBtn.addEventListener('touchend', function(e) {
            console.log('Hamburger butonuna dokunuldu');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleMobileMenu();
            return false;
        }, {capture: true, passive: false});
        
        // Ayrıca normal tıklama olayını da ekle
        hamburgerBtn.addEventListener('click', function(e) {
            console.log('Hamburger butonuna tıklandı');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleMobileMenu();
            return false;
        }, {capture: true, passive: false});
    }
    
    // Kapatma butonuna dokunma
    if (mobileCloseBtn) {
        // ÖNEMLİ: Tüm olayları kaldır (çakışmaları önlemek için)
        var newMobileCloseBtn = mobileCloseBtn.cloneNode(true);
        mobileCloseBtn.parentNode.replaceChild(newMobileCloseBtn, mobileCloseBtn);
        mobileCloseBtn = newMobileCloseBtn;
        
        mobileCloseBtn.addEventListener('touchend', function(e) {
            console.log('Kapatma butonuna dokunuldu');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleMobileMenu();
            return false;
        }, {capture: true, passive: false});
        
        // Ayrıca normal tıklama olayını da ekle
        mobileCloseBtn.addEventListener('click', function(e) {
            console.log('Kapatma butonuna tıklandı');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleMobileMenu();
            return false;
        }, {capture: true, passive: false});
    }
    
    // Overlay'e dokunma
    if (mobileOverlay) {
        // ÖNEMLİ: Tüm olayları kaldır (çakışmaları önlemek için)
        var newMobileOverlay = mobileOverlay.cloneNode(true);
        mobileOverlay.parentNode.replaceChild(newMobileOverlay, mobileOverlay);
        mobileOverlay = newMobileOverlay;
        
        mobileOverlay.addEventListener('touchend', function(e) {
            console.log('Overlay\'e dokunuldu');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleMobileMenu();
            return false;
        }, {capture: true, passive: false});
        
        // Ayrıca normal tıklama olayını da ekle
        mobileOverlay.addEventListener('click', function(e) {
            console.log('Overlay\'e tıklandı');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleMobileMenu();
            return false;
        }, {capture: true, passive: false});
    }
    
    // ===== BLOG BUTONLARI =====
    // "Devamını Oku" butonları için direkt dokunma olayı ekliyoruz
    var readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
    console.log('Devamını Oku butonları bulundu: ' + readMoreButtons.length);
    
    readMoreButtons.forEach(function(button) {
        // ÖNEMLİ: Tüm olayları kaldır (çakışmaları önlemek için)
        var newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        button = newButton;
        
        // Dokunma olayı ekle
        button.addEventListener('touchend', function(e) {
            console.log('Devamını oku butonuna dokunuldu');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            var postId = this.getAttribute('data-post-id');
            if (postId && window.showBlogPopup) {
                console.log('Popup açılıyor, post ID:', postId);
                window.showBlogPopup(postId);
            } else {
                console.log('showBlogPopup fonksiyonu veya postId bulunamadı');
            }
            
            return false;
        }, {capture: true, passive: false});
        
        // Normal tıklama olayı ekle
        button.addEventListener('click', function(e) {
            console.log('Devamını oku butonuna tıklandı');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            var postId = this.getAttribute('data-post-id');
            if (postId && window.showBlogPopup) {
                console.log('Popup açılıyor, post ID:', postId);
                window.showBlogPopup(postId);
            } else {
                console.log('showBlogPopup fonksiyonu veya postId bulunamadı');
            }
            
            return false;
        }, {capture: true, passive: false});
    });
    
    // ===== KATEGORİ BUTONLARI =====
    // Kategori butonları için dokunma olayı
    var categoryButtons = document.querySelectorAll('.category-item');
    console.log('Kategori butonları bulundu: ' + categoryButtons.length);
    
    categoryButtons.forEach(function(button) {
        // ÖNEMLİ: Tüm olayları kaldır (çakışmaları önlemek için)
        var newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        button = newButton;
        
        // Dokunma olayı ekle
        button.addEventListener('touchend', function(e) {
            console.log('Kategori butonuna dokunuldu');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            var category = this.getAttribute('data-category');
            if (category) {
                // Tüm aktif sınıfları kaldır
                document.querySelectorAll('.category-item').forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Bu butona aktif sınıfı ekle
                this.classList.add('active');
                
                // Blog fonksiyonlarını çağır
                if (window.displayBlogPosts) {
                    window.displayBlogPosts(category);
                } else if (window.loadBlogPosts) {
                    window.loadBlogPosts(category);
                }
                console.log('Kategori seçildi: ' + category);
            }
            
            return false;
        }, {capture: true, passive: false});
        
        // Normal tıklama olayı ekle
        button.addEventListener('click', function(e) {
            console.log('Kategori butonuna tıklandı');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            var category = this.getAttribute('data-category');
            if (category) {
                // Tüm aktif sınıfları kaldır
                document.querySelectorAll('.category-item').forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Bu butona aktif sınıfı ekle
                this.classList.add('active');
                
                // Blog fonksiyonlarını çağır
                if (window.displayBlogPosts) {
                    window.displayBlogPosts(category);
                } else if (window.loadBlogPosts) {
                    window.loadBlogPosts(category);
                }
                console.log('Kategori seçildi: ' + category);
            }
            
            return false;
        }, {capture: true, passive: false});
    });
    
    // 300ms dokunma gecikmesini kaldır
    document.addEventListener('touchstart', function(){}, {passive: true});
    
    // ===== ANA BELGE BODY KORUMASI =====
    // Diğer tüm tıklamaların hamburger menüsünü açmasını engelle
    document.body.addEventListener('click', function(e) {
        // Hamburger butonuna veya açık menüye tıklanmadıysa
        const isHamburgerBtn = e.target.closest('.hamburger-btn') != null;
        const isMenuElement = e.target.closest('.mobile-menu') != null;
        const isOverlay = e.target.closest('.mobile-overlay') != null;
        
        if (!isHamburgerBtn && !isMenuElement && !isOverlay && 
            !e.target.classList.contains('btn-daha') && 
            !e.target.closest('.btn-daha') && 
            !e.target.classList.contains('read-more') && 
            !e.target.closest('.read-more') && 
            !e.target.classList.contains('category-item') && 
            !e.target.closest('.category-item')) {
            
            // Hamburger menüsünün açılmasını önle
            console.log('Genel sayfaya tıklama yakalandı - hamburger menüsü etkilenmeyecek');
            
            // Eğer hamburger menüsü açıksa ve overlay'e tıklandıysa kapat
            if (mobileMenu && mobileMenu.classList.contains('active') && isOverlay) {
                toggleMobileMenu();
            }
        }
    }, {capture: true});
    
    // Dokunma olayları için de aynı korumayı ekle
    document.body.addEventListener('touchend', function(e) {
        // Hamburger butonuna veya açık menüye dokunulmadıysa
        const isHamburgerBtn = e.target.closest('.hamburger-btn') != null;
        const isMenuElement = e.target.closest('.mobile-menu') != null;
        const isOverlay = e.target.closest('.mobile-overlay') != null;
        
        if (!isHamburgerBtn && !isMenuElement && !isOverlay && 
            !e.target.classList.contains('btn-daha') && 
            !e.target.closest('.btn-daha') && 
            !e.target.classList.contains('read-more') && 
            !e.target.closest('.read-more') && 
            !e.target.classList.contains('category-item') && 
            !e.target.closest('.category-item')) {
            
            // Hamburger menüsünün açılmasını önle
            console.log('Genel sayfaya dokunma yakalandı - hamburger menüsü etkilenmeyecek');
            
            // Eğer hamburger menüsü açıksa ve overlay'e tıklandıysa kapat
            if (mobileMenu && mobileMenu.classList.contains('active') && isOverlay) {
                toggleMobileMenu();
            }
        }
    }, {capture: true});
});
