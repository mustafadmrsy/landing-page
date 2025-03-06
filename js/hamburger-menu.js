/**
 * Senirkent MYO Blog - Mobil Hamburger Menü
 * Açıklama: Hamburger menüsü kontrolü için özel script (mobil sorunu çözmek için)
 * Sürüm: 1.3.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

// DOMContentLoaded olayını bekle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hamburger Menu: Initialized - v1.3.0 - Basit versiyon');
    
    // Mobil elementleri seç
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    
    // Hamburger butonu için işlevsellik ekle (klonlama olmadan)
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            console.log('Hamburger butonuna tıklandı');
            toggleMobileMenu();
        });
    }
    
    // Menü kapatma butonu için işlevsellik ekle (klonlama olmadan)
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', function(e) {
            console.log('Menü kapatma butonuna tıklandı');
            toggleMobileMenu();
        });
    }
    
    // Overlay için işlevsellik ekle (klonlama olmadan)
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function(e) {
            console.log('Overlay tıklandı');
            toggleMobileMenu();
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
    document.addEventListener('click', function(e) {
        // Devamını oku butonuna tıklandı mı?
        const isReadMoreButton = e.target.classList.contains('btn-daha') || 
                                e.target.closest('.btn-daha') ||
                                e.target.classList.contains('read-more') || 
                                e.target.closest('.read-more');
        
        if (isReadMoreButton) {
            console.log('Devamını oku butonuna tıklandı');
            const button = e.target.closest('.btn-daha') || e.target.closest('.read-more') || e.target;
            const postId = button.getAttribute('data-post-id');
            
            if (postId && typeof window.showBlogPopup === 'function' && typeof blogData !== 'undefined') {
                const post = blogData.blogPosts.find(p => p.id == postId);
                if (post) {
                    window.showBlogPopup(post);
                    console.log('Popup açıldı: ', post.title);
                }
            }
        }
    });
});
