/**
 * Senirkent MYO Blog - Mobil Ana Kodu
 * Tüm mobil etkileşimleri tek yerden yöneten basit ve sade kod.
 * Çakışmaları engellemek için minimal tasarım.
 * Sürüm: 1.0 - 06 Mart 2025
 */

(function() {
    // Sayfa yüklendiğinde çalış
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Mobile.js: Aktif - Yeni sürüm');
        
        // Mobil cihaz kontrolü 
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Mobil elementleri
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-overlay');
        const mobileCloseBtn = document.querySelector('.mobile-close-btn');
        
        // ===== MOBİL MENÜ İŞLEVLERİ =====
        
        // Mobil menüyü toggle etme fonksiyonu
        function toggleMobileMenu() {
            if (!mobileMenu) return;
            
            const isActive = mobileMenu.classList.contains('active');
            
            if (isActive) {
                // Menüyü kapat
                mobileMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                // Menüyü aç
                mobileMenu.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        // ===== OLAY DİNLEYİCİLERİ =====
        
        // Hamburger menü butonu
        if (hamburgerBtn) {
            console.log('Hamburger butonu bulundu ve hazırlandı');
            addSafeEventListener(hamburgerBtn, 'click', function(e) {
                console.log('Hamburger butonuna tıklandı');
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
            });
        }
        
        // Mobil menü kapatma butonu
        if (mobileCloseBtn) {
            console.log('Menü kapatma butonu bulundu ve hazırlandı');
            addSafeEventListener(mobileCloseBtn, 'click', function(e) {
                console.log('Kapatma butonuna tıklandı');
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
            });
        }
        
        // Overlay tıklama - menüyü kapat
        if (mobileOverlay) {
            console.log('Overlay bulundu ve hazırlandı');
            addSafeEventListener(mobileOverlay, 'click', function(e) {
                console.log('Overlay tıklandı');
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
            });
        }
        
        // ===== BLOG POSTLARI VE KATEGORİLER =====
        
        // Devamını oku butonları için
        setupDevaminiOkuButtons();
        
        // Kategori butonları için
        setupCategoryButtons();
        
        // ===== MOBİL ÖZEL İŞLEVLER =====
        
        // Mobil cihazlarda özel dokunma gecikmesini kaldırma
        if (isMobile) {
            console.log('Mobil cihaz tespit edildi, özel dokunma iyileştirmeleri yapılıyor');
            
            // Dokunma gecikmesini kaldır
            document.addEventListener('touchstart', function(){}, {passive: true});
            
            // Hamburger butonu için dokunma olayı
            if (hamburgerBtn) {
                addSafeEventListener(hamburgerBtn, 'touchend', function(e) {
                    console.log('Hamburger dokunma algılandı');
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMobileMenu();
                }, {passive: false});
            }
            
            // Kapatma butonu için dokunma olayı
            if (mobileCloseBtn) {
                addSafeEventListener(mobileCloseBtn, 'touchend', function(e) {
                    console.log('Kapatma dokunma algılandı');
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMobileMenu();
                }, {passive: false});
            }
            
            // Overlay için dokunma olayı
            if (mobileOverlay) {
                addSafeEventListener(mobileOverlay, 'touchend', function(e) {
                    console.log('Overlay dokunma algılandı');
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMobileMenu();
                }, {passive: false});
            }
            
            // Genel dokunma olayı delegesi
            document.addEventListener('touchend', function(e) {
                handleTouchEvent(e);
            }, {passive: false});
        }
    });
    
    // ===== YARDIMCI FONKSİYONLAR =====
    
    // Devamını oku butonları
    function setupDevaminiOkuButtons() {
        // Bütün devamını oku butonlarını topla
        const readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
        
        if (readMoreButtons.length > 0) {
            console.log('Devamını oku butonları bulundu ve hazırlandı: ' + readMoreButtons.length);
            
            readMoreButtons.forEach(button => {
                addSafeEventListener(button, 'click', function(e) {
                    handleReadMoreClick(e, this);
                });
            });
        }
    }
    
    // "Devamını oku" butonuna tıklandığında
    function handleReadMoreClick(e, button) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Devamını oku butonuna tıklandı');
        
        // Post ID'yi al
        const postId = button.getAttribute('data-post-id');
        if (!postId) {
            console.log('Post ID bulunamadı');
            return;
        }
        
        // Blog popup fonksiyonu var mı kontrol et ve çağır
        if (typeof window.showBlogPopup === 'function') {
            console.log('Popup açılıyor: Post ID ' + postId);
            window.showBlogPopup(postId);
        } else {
            console.log('showBlogPopup fonksiyonu bulunamadı');
        }
    }
    
    // Kategori butonları
    function setupCategoryButtons() {
        // Bütün kategori butonlarını topla
        const categoryButtons = document.querySelectorAll('.category-item');
        
        if (categoryButtons.length > 0) {
            console.log('Kategori butonları bulundu ve hazırlandı: ' + categoryButtons.length);
            
            categoryButtons.forEach(button => {
                addSafeEventListener(button, 'click', function(e) {
                    handleCategoryClick(e, this);
                });
            });
        }
    }
    
    // Kategori butonuna tıklandığında
    function handleCategoryClick(e, button) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Kategori butonuna tıklandı');
        
        // Aktif sınıfları kaldır
        const allCategoryBtns = document.querySelectorAll('.category-item');
        allCategoryBtns.forEach(btn => btn.classList.remove('active'));
        
        // Aktif sınıfı ekle
        button.classList.add('active');
        
        // Kategoriyi al
        const category = button.getAttribute('data-category');
        if (!category) {
            console.log('Kategori bulunamadı');
            return;
        }
        
        // Blog yükleme fonksiyonlarını çağır
        if (typeof window.displayBlogPosts === 'function') {
            console.log('Blog gönderileri yükleniyor: Kategori ' + category);
            window.displayBlogPosts(category);
        } else if (typeof window.loadBlogPosts === 'function') {
            console.log('Blog gönderileri yükleniyor: Kategori ' + category);
            window.loadBlogPosts(category);
        } else {
            console.log('Blog yükleme fonksiyonu bulunamadı');
        }
    }
    
    // Dokunma olayını işle (mobil için)
    function handleTouchEvent(e) {
        // Dokunulan eleman
        const target = e.target;
        
        // Devamını oku butonları için
        if (target.classList.contains('btn-daha') || 
            target.classList.contains('read-more') || 
            findParentWithClass(target, 'btn-daha') || 
            findParentWithClass(target, 'read-more')) {
            
            const button = target.classList.contains('btn-daha') || target.classList.contains('read-more') ? 
                          target : (findParentWithClass(target, 'btn-daha') || findParentWithClass(target, 'read-more'));
            
            if (button) {
                e.preventDefault();
                handleReadMoreClick(e, button);
            }
        }
        
        // Kategori butonları için
        if (target.classList.contains('category-item') || findParentWithClass(target, 'category-item')) {
            const button = target.classList.contains('category-item') ? 
                          target : findParentWithClass(target, 'category-item');
            
            if (button) {
                e.preventDefault();
                handleCategoryClick(e, button);
            }
        }
    }
    
    // Ebeveyn elementi belirli bir sınıfa sahip olan elementi bul
    function findParentWithClass(element, className) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.classList && parent.classList.contains(className)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }
    
    // Güvenli event listener ekleme (hata yakalamak için)
    function addSafeEventListener(element, eventType, handler, options) {
        if (element && typeof element.addEventListener === 'function') {
            try {
                element.addEventListener(eventType, handler, options);
            } catch (error) {
                console.error('Event dinleyici eklenemedi:', error);
            }
        }
    }
})();
