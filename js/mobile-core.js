/**
 * Senirkent MYO Blog - Mobil Çekirdek Script
 * Açıklama: Sadece mobil cihazlarda çalışacak ve masaüstü uyumluluğuna dokunmayacak kod
 * Sürüm: 1.0.0 (Kesin Çözüm)
 * Güncelleme Tarihi: 6 Mart 2025
 */

(function() {
    // Sadece mobil cihazlarda çalışsın
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
        console.log("Mobile-core.js: Mobil cihaz olmadığı için pasif");
        return; // Mobil cihaz değilse çık ve hiçbir şey yapma
    }
    
    console.log("Mobile-core.js: Mobil cihaz algılandı, başlatılıyor");
    
    // DOMContentLoaded olayını bekle
    document.addEventListener('DOMContentLoaded', function() {
        // Mobil menü elementleri
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-overlay');
        const mobileCloseBtn = document.querySelector('.mobile-close-btn');
        
        // Tüm etkileşimli elementler
        const popupElements = document.querySelectorAll('.blog-popup-overlay, .popup');
        const readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
        const categoryButtons = document.querySelectorAll('.category-item');
        
        // Menü durumunu izle
        let menuOpen = false;
        
        // ----- Menü Fonksiyonları -----
        
        // Menüyü açma fonksiyonu
        function openMenu() {
            if (!menuOpen && mobileMenu) {
                mobileMenu.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                menuOpen = true;
                console.log("Mobil menü açıldı");
            }
        }
        
        // Menüyü kapatma fonksiyonu
        function closeMenu() {
            if (menuOpen && mobileMenu) {
                mobileMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
                menuOpen = false;
                console.log("Mobil menü kapatıldı");
            }
        }
        
        // ----- Mobil Element Olay Dinleyicileri -----
        
        // Hamburger butonuna tıklama
        if (hamburgerBtn) {
            // Mevcut dinleyicileri kaldır ve temiz bir şekilde yeniden ekle
            const oldBtn = hamburgerBtn;
            const newBtn = oldBtn.cloneNode(true);
            if (oldBtn.parentNode) {
                oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            }
            
            // Yeni event listener ekle
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                menuOpen ? closeMenu() : openMenu();
            });
        }
        
        // Kapatma butonuna tıklama
        if (mobileCloseBtn) {
            // Mevcut dinleyicileri kaldır ve temiz bir şekilde yeniden ekle
            const oldBtn = mobileCloseBtn;
            const newBtn = oldBtn.cloneNode(true);
            if (oldBtn.parentNode) {
                oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            }
            
            // Yeni event listener ekle
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeMenu();
            });
        }
        
        // Overlay'e tıklandığında
        if (mobileOverlay) {
            // Mevcut dinleyicileri kaldır ve temiz bir şekilde yeniden ekle
            const oldOverlay = mobileOverlay;
            const newOverlay = oldOverlay.cloneNode(true);
            if (oldOverlay.parentNode) {
                oldOverlay.parentNode.replaceChild(newOverlay, oldOverlay);
            }
            
            // Yeni event listener ekle
            newOverlay.addEventListener('click', function(e) {
                e.stopPropagation();
                closeMenu();
            });
        }
        
        // ----- "Devamını Oku" Butonları -----
        
        // Tüm read-more butonlarını işle
        if (readMoreButtons.length > 0) {
            readMoreButtons.forEach(button => {
                // Mevcut dinleyicileri kaldır ve temiz bir şekilde yeniden ekle
                const oldBtn = button;
                const newBtn = oldBtn.cloneNode(true);
                if (oldBtn.parentNode) {
                    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
                }
                
                // Yeni event listener ekle
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Devamını oku butonuna tıklandı (mobile-core.js)");
                    
                    // Eğer menü açıksa kapat
                    if (menuOpen) {
                        closeMenu();
                    }
                    
                    // Blog popup'ını göster
                    const postId = this.getAttribute('data-post-id');
                    if (postId && typeof window.showBlogPopup === 'function' && typeof window.blogData !== 'undefined') {
                        const post = window.blogData.blogPosts.find(p => p.id == postId);
                        if (post) {
                            window.showBlogPopup(post);
                            console.log("Blog popup açıldı:", post.title);
                        }
                    } else if (postId && typeof window.showBlogPopup === 'function') {
                        window.showBlogPopup(postId);
                        console.log("Blog popup açıldı (ID ile):", postId);
                    } else {
                        console.warn("showBlogPopup fonksiyonu veya blogData bulunamadı");
                    }
                });
            });
        }
        
        // ----- Kategori Butonları -----
        
        // Kategori butonlarını işle
        if (categoryButtons.length > 0) {
            categoryButtons.forEach(button => {
                // Mevcut dinleyicileri kaldır ve temiz bir şekilde yeniden ekle
                const oldBtn = button;
                const newBtn = oldBtn.cloneNode(true);
                if (oldBtn.parentNode) {
                    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
                }
                
                // Yeni event listener ekle
                newBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log("Kategori butonuna tıklandı");
                    
                    // Eğer menü açıksa kapat
                    if (menuOpen) {
                        closeMenu();
                    }
                    
                    // Kategori değiştir
                    const category = this.getAttribute('data-category');
                    if (category && typeof window.displayBlogPosts === 'function') {
                        // Aktif kategoriyi güncelle
                        categoryButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Blog yazılarını göster
                        window.displayBlogPosts(category);
                        console.log("Kategori değiştirildi:", category);
                    }
                });
            });
        }
        
        // ----- Blog Popup Overlay İşlemleri -----
        
        // Popup kapatma işlevleri - Mobil düzgün çalışması için
        const blogPopupOverlay = document.querySelector('.blog-popup-overlay');
        const blogPopupClose = document.querySelector('.blog-popup-close');
        
        if (blogPopupOverlay) {
            blogPopupOverlay.addEventListener('click', function(e) {
                // Sadece doğrudan overlay'e tıklandığında kapat
                if (e.target === this) {
                    this.classList.remove('active');
                    document.body.style.overflow = '';
                }
                // Hamburger menüsünün açılmasını engelle
                e.stopPropagation();
            });
        }
        
        if (blogPopupClose) {
            blogPopupClose.addEventListener('click', function(e) {
                const overlay = document.querySelector('.blog-popup-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                // Hamburger menüsünün açılmasını engelle
                e.stopPropagation();
            });
        }
        
        console.log("Mobile-core.js: Tüm mobil işlevler yüklendi");
    });
})();
