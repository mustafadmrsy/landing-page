/**
 * Senirkent MYO Blog - Mobil Dokunma Çözümü (Güçlendirilmiş)
 * Tüm mobil etkileşimleri direkt click olaylara dönüştüren basit çözüm.
 * Sürüm: 2.0 - 06 Mart 2025
 */

// DOMContentLoaded olayı ile tetikle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile.js v2.0: Tüm mobil etkileşimler için yükleniyor...');
    
    // Mobil cihaz tespiti
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        console.log('Mobil cihaz tespit edildi. Özel dokunma işlemi aktif.');
        
        // 300ms gecikmeyi kaldır
        document.addEventListener('touchstart', function(){}, {passive: true});
        
        // ===== ANA FONKSİYONLAR =====
        
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
        
        // ===== HAMBURGER MENÜ DOKUNMA İŞLEMLERİ =====
        
        // Hamburger butonuna dokunma
        if (hamburgerBtn) {
            console.log('Hamburger butonu bulundu, dokunma olayı ekleniyor');
            hamburgerBtn.addEventListener('touchend', function(e) {
                console.log('Hamburger butonuna dokunuldu');
                e.preventDefault();
                toggleMobileMenu();
            }, {passive: false});
        }
        
        // Kapatma butonuna dokunma
        if (mobileCloseBtn) {
            console.log('Kapatma butonu bulundu, dokunma olayı ekleniyor');
            mobileCloseBtn.addEventListener('touchend', function(e) {
                console.log('Kapatma butonuna dokunuldu');
                e.preventDefault();
                toggleMobileMenu();
            }, {passive: false});
        }
        
        // Overlay'e dokunma
        if (mobileOverlay) {
            console.log('Overlay bulundu, dokunma olayı ekleniyor');
            mobileOverlay.addEventListener('touchend', function(e) {
                console.log('Overlay\'e dokunuldu');
                e.preventDefault();
                toggleMobileMenu();
            }, {passive: false});
        }
        
        // ===== TÜM TIKLANABİLİR ÖĞELERİ AKTİF ET =====
        
        // "Devamını Oku" butonları için 
        makeAllElementsClickable('.btn-daha, .read-more', function(element) {
            var postId = element.getAttribute('data-post-id');
            if (postId && window.showBlogPopup) {
                window.showBlogPopup(postId);
                console.log('Popup açıldı: Post ID=' + postId);
            }
        });
        
        // Kategori butonları için
        makeAllElementsClickable('.category-item', function(element) {
            var category = element.getAttribute('data-category');
            if (category) {
                // Tüm aktif sınıfları kaldır
                document.querySelectorAll('.category-item').forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Bu butona aktif sınıfı ekle
                element.classList.add('active');
                
                // Blog fonksiyonlarını çağır
                if (window.displayBlogPosts) {
                    window.displayBlogPosts(category);
                } else if (window.loadBlogPosts) {
                    window.loadBlogPosts(category);
                }
                console.log('Kategori seçildi: ' + category);
            }
        });
        
        // Bağlantılar için
        makeAllElementsClickable('a', function(element) {
            var href = element.getAttribute('href');
            if (href && href !== '#' && !element.classList.contains('mobile-menu-link')) {
                console.log('Bağlantıya tıklandı: ' + href);
                window.location.href = href;
            }
        });
        
        // Butonlar için
        makeAllElementsClickable('button', function(element) {
            console.log('Butona tıklandı:', element);
            simulateClick(element);
        });
        
        // ===== YARDIMCI FONKSİYONLAR =====
        
        // TÜM ELEMANLARI TIKLANIR HAL GETİR
        function makeAllElementsClickable(selector, callback) {
            var elements = document.querySelectorAll(selector);
            console.log(selector + ' seçicisi için ' + elements.length + ' eleman bulundu');
            
            elements.forEach(function(element) {
                // Mevcut tıklama olaylarını yedekle
                if (element.onclick) {
                    element._originalClick = element.onclick;
                }
                
                // Dokunma olayı ekle - ÇOK ÖNEMLİ
                element.addEventListener('touchstart', function(e) {
                    console.log('Dokunma başladı: ' + selector);
                    element._touchStarted = true;
                    element._moved = false;
                }, {passive: true});
                
                element.addEventListener('touchmove', function(e) {
                    element._moved = true;
                }, {passive: true});
                
                element.addEventListener('touchend', function(e) {
                    console.log('Dokunma bitti: ' + selector);
                    if (element._touchStarted && !element._moved) {
                        e.preventDefault();
                        if (callback) {
                            callback(element);
                        } else if (element._originalClick) {
                            element._originalClick.call(element, e);
                        }
                    }
                    element._touchStarted = false;
                    element._moved = false;
                }, {passive: false});
            });
        }
        
        // Tıklama simüle et
        function simulateClick(element) {
            var event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        }
        
        // === DOĞRUDAN GEZİNME BAĞLANTILARI === 
        // Nav linkleri için özel işleme
        var navLinks = document.querySelectorAll('.mobile-menu-link, .mobile-nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('touchend', function(e) {
                e.preventDefault();
                var href = this.getAttribute('href');
                console.log('Menü bağlantısına dokunuldu: ' + href);
                window.location.href = href;
            });
        });
    }
});
