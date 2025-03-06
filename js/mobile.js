/**
 * Senirkent MYO Blog - Mobil Dokunma Çözümü (Acil Düzeltme)
 * Tüm mobil etkileşimleri doğru şekilde yöneten basit çözüm.
 * Sürüm: 3.0 - 06 Mart 2025
 */

// DOMContentLoaded olayı ile tetikle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile.js v3.0: Acil Düzeltme - Sadece belirli butonların çalışması için');
    
    // Mobil cihaz tespiti
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        console.log('Mobil cihaz tespit edildi. Özel dokunma işlemi aktif.');
        
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
        
        // Sadece hamburger butonuna dokunma
        if (hamburgerBtn) {
            console.log('Hamburger butonu bulundu, sadece bu butona dokunma işlemi ekleniyor');
            hamburgerBtn.addEventListener('touchend', function(e) {
                console.log('Hamburger butonuna dokunuldu');
                e.preventDefault();
                e.stopPropagation(); // Olayın başka yerlere gitmesini engelle
                toggleMobileMenu();
                return false;
            }, {passive: false});
            
            // Ayrıca normal tıklama olayını da ekle
            hamburgerBtn.addEventListener('click', function(e) {
                console.log('Hamburger butonuna tıklandı');
                e.preventDefault();
                e.stopPropagation(); // Olayın başka yerlere gitmesini engelle
                toggleMobileMenu();
                return false;
            }, {passive: false});
        }
        
        // Kapatma butonuna dokunma
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('touchend', function(e) {
                console.log('Kapatma butonuna dokunuldu');
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
                return false;
            }, {passive: false});
            
            // Ayrıca normal tıklama olayını da ekle
            mobileCloseBtn.addEventListener('click', function(e) {
                console.log('Kapatma butonuna tıklandı');
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
                return false;
            }, {passive: false});
        }
        
        // Overlay'e dokunma
        if (mobileOverlay) {
            mobileOverlay.addEventListener('touchend', function(e) {
                console.log('Overlay\'e dokunuldu');
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
                return false;
            }, {passive: false});
            
            // Ayrıca normal tıklama olayını da ekle
            mobileOverlay.addEventListener('click', function(e) {
                console.log('Overlay\'e tıklandı');
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
                return false;
            }, {passive: false});
        }
        
        // ===== BLOG BUTONLARI =====
        // "Devamını Oku" butonları için direkt dokunma olayı ekliyoruz
        var readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
        console.log('Devamını Oku butonları bulundu: ' + readMoreButtons.length);
        
        readMoreButtons.forEach(function(button) {
            // Dokunma olayı ekle
            button.addEventListener('touchend', function(e) {
                console.log('Devamını oku butonuna dokunuldu');
                e.preventDefault();
                e.stopPropagation();
                
                var postId = this.getAttribute('data-post-id');
                if (postId && window.showBlogPopup) {
                    console.log('Popup açılıyor, post ID:', postId);
                    window.showBlogPopup(postId);
                } else {
                    console.log('showBlogPopup fonksiyonu veya postId bulunamadı');
                }
                
                return false;
            }, {passive: false});
            
            // Normal tıklama olayı ekle
            button.addEventListener('click', function(e) {
                console.log('Devamını oku butonuna tıklandı');
                e.preventDefault();
                e.stopPropagation();
                
                var postId = this.getAttribute('data-post-id');
                if (postId && window.showBlogPopup) {
                    console.log('Popup açılıyor, post ID:', postId);
                    window.showBlogPopup(postId);
                } else {
                    console.log('showBlogPopup fonksiyonu veya postId bulunamadı');
                }
                
                return false;
            }, {passive: false});
        });
        
        // ===== KATEGORİ BUTONLARI =====
        // Kategori butonları için dokunma olayı
        var categoryButtons = document.querySelectorAll('.category-item');
        console.log('Kategori butonları bulundu: ' + categoryButtons.length);
        
        categoryButtons.forEach(function(button) {
            // Dokunma olayı ekle
            button.addEventListener('touchend', function(e) {
                console.log('Kategori butonuna dokunuldu');
                e.preventDefault();
                e.stopPropagation();
                
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
            }, {passive: false});
        });
        
        // 300ms dokunma gecikmesini kaldır
        document.addEventListener('touchstart', function(){}, {passive: true});
    }
    
    // hamburger-menu.js devre dışı bırakmak için
    window.hamburgerMenuInitialized = true;
});
