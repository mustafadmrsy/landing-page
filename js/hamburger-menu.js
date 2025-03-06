/**
 * Senirkent MYO Blog - Mobil Hamburger Menü
 * Açıklama: Hamburger menüsü kontrolü için özel script (mobil sorunu çözmek için)
 * Sürüm: 1.3.1
 * Güncelleme Tarihi: 6 Mart 2025
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Hamburger Menu: Initialized - v1.3.1 - Düzeltilmiş versiyon');
    
    // Mobil elementleri seç
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    
    // Hamburger butonu için işlevsellik ekle
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Tıklama olayının yayılmasını engelle
            console.log('Hamburger butonuna tıklandı');
            toggleMobileMenu();
        });
    }
    
    // Menü kapatma butonu için işlevsellik ekle
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Tıklama olayının yayılmasını engelle
            console.log('Menü kapatma butonuna tıklandı');
            toggleMobileMenu();
        });
    }
    
    // Overlay için işlevsellik ekle
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function(e) {
            if (e.target === mobileOverlay) { // Sadece overlay'e tıklandığında çalış
                console.log('Overlay tıklandı');
                toggleMobileMenu();
            }
        });
    }
    
    // Menüyü aç/kapat
    function toggleMobileMenu() {
        if (mobileMenu) {
            const isActive = mobileMenu.classList.contains('active');
            
            if (isActive) {
                // Menü açıksa kapat
                mobileMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
                console.log('Menü kapatıldı');
            } else {
                // Menü kapalıysa aç
                mobileMenu.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('Menü açıldı');
            }
        }
    }
    
    // Devamını oku butonları için işlevsellik
    const readMoreHandler = function(e) {
        const target = e.target;
        // Sadece devamını oku butonlarına tıklandığında işlem yap
        const isReadMoreButton = target.classList.contains('btn-daha') || 
                               target.closest('.btn-daha') ||
                               target.classList.contains('read-more') || 
                               target.closest('.read-more');
        
        if (isReadMoreButton) {
            e.stopPropagation(); // Tıklama olayının yayılmasını engelle
            console.log('Devamını oku butonuna tıklandı');
            const button = target.closest('.btn-daha') || target.closest('.read-more') || target;
            const postId = button.getAttribute('data-post-id');
            
            if (postId && typeof window.showBlogPopup === 'function' && typeof blogData !== 'undefined') {
                const post = blogData.blogPosts.find(p => p.id == postId);
                if (post) {
                    window.showBlogPopup(post);
                    console.log('Popup açıldı: ', post.title);
                }
            }
        }
    };

    // Devamını oku butonları için olay dinleyicisini ekle
    document.querySelector('.posts-grid')?.addEventListener('click', readMoreHandler);
});
