/**
 * Senirkent MYO Blog - Mobil Sorun Çözücü
 * Açıklama: Mobil görünümde hamburger menüsünün yanlış açılma sorununu çözen script
 * Sürüm: 1.0.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

(function() {
    // Sayfa yüklendiğinde çalışır
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Mobil Sorun Çözücü aktif');
        
        // Hamburger menüsünü açan fonksiyon
        let isMenuOpen = false;
        
        // Mobil görünümde olup olmadığını kontrol et
        function isMobileView() {
            return window.innerWidth <= 768;
        }
        
        // Hamburger butonuna yeni click handler ata
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-overlay');
        
        if (hamburgerBtn && mobileMenu) {
            // Önceki tüm click event listenerları kaldır
            const oldHamburger = hamburgerBtn.cloneNode(true);
            hamburgerBtn.parentNode.replaceChild(oldHamburger, hamburgerBtn);
            
            // Yeni event listener ekle
            oldHamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                
                // Menüyü aç/kapat
                isMenuOpen = !isMenuOpen;
                mobileMenu.classList.toggle('active', isMenuOpen);
                if (mobileOverlay) mobileOverlay.classList.toggle('active', isMenuOpen);
                document.body.style.overflow = isMenuOpen ? 'hidden' : '';
                
                console.log('Hamburger menü durumu:', isMenuOpen ? 'açık' : 'kapalı');
            });
        }
        
        // Menü kapatma butonuna yeni handler ata
        const closeBtn = document.querySelector('.mobile-close-btn');
        if (closeBtn) {
            // Önceki tüm click event listenerları kaldır
            const oldCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(oldCloseBtn, closeBtn);
            
            // Yeni event listener ekle
            oldCloseBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                
                // Menüyü kapat
                isMenuOpen = false;
                mobileMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
                
                console.log('Hamburger menü kapatıldı');
            });
        }
        
        // Mobil overlay'e yeni handler ata
        if (mobileOverlay) {
            // Önceki tüm click event listenerları kaldır
            const oldOverlay = mobileOverlay.cloneNode(true);
            mobileOverlay.parentNode.replaceChild(oldOverlay, mobileOverlay);
            
            // Yeni event listener ekle
            oldOverlay.addEventListener('click', function(e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                
                // Menüyü kapat
                isMenuOpen = false;
                mobileMenu.classList.remove('active');
                oldOverlay.classList.remove('active');
                document.body.style.overflow = '';
                
                console.log('Hamburger menü kapatıldı (overlay)');
            });
        }
        
        // Logo tıklamaları için düzeltme
        const mobileLogoLink = document.querySelector('.mobile-logo-link');
        if (mobileLogoLink) {
            // Önceki tüm click event listenerları kaldır
            const oldLogo = mobileLogoLink.cloneNode(true);
            mobileLogoLink.parentNode.replaceChild(oldLogo, mobileLogoLink);
            
            // Yeni event listener ekle
            oldLogo.addEventListener('click', function(e) {
                if (isMobileView()) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // Logo linki çalışsın, varsayılan davranışı engelleme
                }
            });
        }
        
        // Tüm "Devamını Oku" butonları için düzeltme
        function fixReadMoreButtons() {
            const readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
            
            readMoreButtons.forEach(button => {
                // Önceki tüm click event listenerları kaldır
                const oldButton = button.cloneNode(true);
                button.parentNode.replaceChild(oldButton, button);
                
                // Yeni event listener ekle - Önemli: capture true ile
                oldButton.addEventListener('click', function(e) {
                    if (isMobileView()) {
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        // Post ID'yi al
                        const postId = this.getAttribute('data-post-id');
                        if (!postId) return;
                        
                        // Burada popup açma işlemini çağır
                        if (typeof window.showBlogPopup === 'function' && typeof blogData !== 'undefined') {
                            e.preventDefault(); // Sayfanın yenilenmesini engelle
                            
                            // Post'u bul ve popup'ı göster
                            const post = blogData.blogPosts.find(p => p.id == postId);
                            if (post) {
                                window.showBlogPopup(post);
                            }
                        }
                    }
                }, true);
            });
        }
        
        // Tüm kategori öğeleri için düzeltme
        function fixCategoryItems() {
            const categoryItems = document.querySelectorAll('.category-item');
            
            categoryItems.forEach(item => {
                // Önceki tüm click event listenerları kaldır
                const oldItem = item.cloneNode(true);
                item.parentNode.replaceChild(oldItem, item);
                
                // Yeni event listener ekle - Önemli: capture true ile
                oldItem.addEventListener('click', function(e) {
                    if (isMobileView()) {
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        // Kategori adını al
                        const categoryName = this.getAttribute('data-category');
                        if (!categoryName) return;
                        
                        // Tüm kategori öğelerinden active sınıfını kaldır
                        categoryItems.forEach(cat => cat.classList.remove('active'));
                        
                        // Bu öğeye active sınıfını ekle
                        this.classList.add('active');
                        
                        // Kategori displayBlogPosts fonksiyonunu çağır
                        if (typeof window.displayBlogPosts === 'function') {
                            window.displayBlogPosts(categoryName);
                        }
                    }
                }, true);
            });
        }
        
        // Sayfa tamamen yüklendiğinde ve DOM değişikliklerinde butonları düzelt
        document.addEventListener('DOMContentLoaded', function() {
            if (isMobileView()) {
                fixReadMoreButtons();
                fixCategoryItems();
            }
        });
        
        // DOM değişiklikleri için gözlemci ekle
        const observer = new MutationObserver(function(mutations) {
            if (isMobileView()) {
                fixReadMoreButtons();
                fixCategoryItems();
            }
        });
        
        // Tüm DOM değişikliklerini izle
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        
        // Pencere boyutu değiştiğinde kontrol et
        window.addEventListener('resize', function() {
            if (isMobileView()) {
                fixReadMoreButtons();
                fixCategoryItems();
            }
        });
    });
})();
