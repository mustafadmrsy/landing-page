/**
 * Senirkent MYO Blog - Mobil Hamburger Menü
 * Açıklama: Hamburger menüsü kontrolü için özel script (mobil sorunu çözmek için)
 * Sürüm: 1.2.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

// DOMContentLoaded olayını bekle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hamburger Menu: Initialized - v1.2.0');
    
    // Mobil elementleri seç
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    
    // Popup ile ilgili elementleri seç
    const popupElements = document.querySelectorAll('.popup, .blog-popup-overlay, .popup-content, .blog-popup-content');
    
    // Menü durumunu kontrol et
    function isMenuOpen() {
        return mobileMenu && mobileMenu.classList.contains('active');
    }
    
    // Menü açma işlevi
    function openMobileMenu(e) {
        if (e) e.stopPropagation();
        
        if (mobileMenu) mobileMenu.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Arka planı kaydırmayı engelle
        console.log('Hamburger Menu: Opened');
    }
    
    // Menü kapatma işlevi
    function closeMobileMenu(e) {
        if (e) e.stopPropagation();
        
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Normal kaydırmaya izin ver
        console.log('Hamburger Menu: Closed');
    }
    
    // Popup ve etkileşimli içerik alanlarına tıklandığında hamburger menüyü engelle
    document.body.addEventListener('click', function(e) {
        // Mobil görünümde değilsek işlem yapma
        if (window.innerWidth > 768) return;
        
        // Popup veya içeriği tıklanmışsa hamburger menüyü açmayı engelle
        const isPopupElement = e.target.closest('.popup') || 
                              e.target.closest('.blog-popup-overlay') || 
                              e.target.closest('.btn-daha') || 
                              e.target.closest('.read-more') || 
                              e.target.closest('.category-item') || 
                              e.target.closest('.blog-content') || 
                              e.target.closest('.popup-content') ||
                              e.target.closest('.blog-popup-content');
        
        if (isPopupElement) {
            e.stopPropagation();
            console.log('İçerik etkileşimi - hamburger menü etkilenmeyecek');
        }
    }, true); // true ile capture aşamasında yakalıyoruz
    
    // Hamburger butonuna tıklama olayı
    if (hamburgerBtn) {
        // Daha önce eklenmiş event listener'ları temizle
        const newHamburgerBtn = hamburgerBtn.cloneNode(true);
        hamburgerBtn.parentNode.replaceChild(newHamburgerBtn, hamburgerBtn);
        
        // Yeni event listener ekle
        newHamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            if (isMenuOpen()) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    // Menü kapatma butonuna tıklama olayı
    if (mobileCloseBtn) {
        // Daha önce eklenmiş event listener'ları temizle
        const newCloseBtn = mobileCloseBtn.cloneNode(true);
        mobileCloseBtn.parentNode.replaceChild(newCloseBtn, mobileCloseBtn);
        
        // Yeni event listener ekle
        newCloseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            closeMobileMenu();
        });
    }
    
    // Overlay'e tıklama olayı
    if (mobileOverlay) {
        // Daha önce eklenmiş event listener'ları temizle
        const newOverlay = mobileOverlay.cloneNode(true);
        mobileOverlay.parentNode.replaceChild(newOverlay, mobileOverlay);
        
        // Yeni event listener ekle
        newOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            closeMobileMenu();
        });
    }
    
    // "Devamını Oku" butonları için özel işlem
    const readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
    readMoreButtons.forEach(button => {
        // Daha önce eklenmiş event listener'ları temizle
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Yeni event listener ekle
        newButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Eğer menü açıksa kapat
            if (isMenuOpen()) {
                closeMobileMenu();
            }
            
            // Normal popup işlevi
            const postId = this.getAttribute('data-post-id');
            if (postId && typeof window.showBlogPopup === 'function' && typeof blogData !== 'undefined') {
                // Post'u bul
                const post = blogData.blogPosts.find(p => p.id == postId);
                if (post) {
                    window.showBlogPopup(post);
                }
            }
        });
    });
    
    // Kategori öğeleri için özel işlem
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        // Daha önce eklenmiş event listener'ları temizle
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // Yeni event listener ekle
        newItem.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Eğer menü açıksa kapat
            if (isMenuOpen()) {
                closeMobileMenu();
            }
            
            // Kategori değiştirme işlevi
            const categoryName = this.getAttribute('data-category');
            if (categoryName && typeof window.displayBlogPosts === 'function') {
                // Aktif kategoriyi güncelle
                document.querySelectorAll('.category-item').forEach(cat => {
                    cat.classList.remove('active');
                });
                this.classList.add('active');
                
                // Blog yazılarını göster
                window.displayBlogPosts(categoryName);
            }
        });
    });
    
    // ESC tuşuna basıldığında hamburger menüyü kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen()) {
            closeMobileMenu();
        }
    });
});
