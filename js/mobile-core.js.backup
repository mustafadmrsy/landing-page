/**
 * Senirkent MYO Blog - Mobil Etkileşim Temel Scripti
 * Açıklama: En basit, direkt yaklaşım - Anında çalışır, hiçbir event beklenmez
 * Sürüm: 3.0.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

console.log('Mobile-core.js - Anında çalışan sürüm başlatıldı');

// ANINDA ÇALIŞIR (sayfa tamamen yüklenmeyi beklemez)
(function() {
    // Anında uygula - Tıklama sorunları için
    setTimeout(handleMobileInteractions, 100);  // 100ms sonra başlat
    
    // 1 saniye sonra bir kez daha kontrol et
    setTimeout(handleMobileInteractions, 1000);
    
    // Sayfa yüklenince de çalıştır
    window.addEventListener('load', handleMobileInteractions);
    document.addEventListener('DOMContentLoaded', handleMobileInteractions);
})();

// Tüm mobil etkileşimleri ayarla
function handleMobileInteractions() {
    console.log('Mobil etkileşimler ayarlanıyor - ' + new Date().toLocaleTimeString());
    
    // 1. Hamburger Menü
    setupMobileMenu();
    
    // 2. Devamını Oku butonları
    setupReadMoreButtons();
    
    // 3. Kategori butonları
    setupCategoryButtons();
}

// 1. MOBİL MENÜ FONKSİYONLARI
function setupMobileMenu() {
    console.log('Mobil menü ayarlanıyor');
    
    // Hamburger butonu
    var hamburgerBtn = document.querySelector('.hamburger-btn');
    if (hamburgerBtn) {
        // Sadece onclick değil, birden fazla event ekleyelim
        hamburgerBtn.onclick = mobileMenuToggle;
        hamburgerBtn.addEventListener('touchstart', mobileMenuToggle);
        hamburgerBtn.addEventListener('mousedown', mobileMenuToggle);
        console.log('Hamburger butonu hazır');
    }
    
    // Kapatma butonu
    var closeBtn = document.querySelector('.mobile-close-btn');
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            console.log('Kapatma butonuna tıklandı');
            if (e) e.preventDefault();
            toggleMobileMenu(false);
            return false;
        };
        closeBtn.addEventListener('touchstart', function(e) {
            if (e) e.preventDefault();
            toggleMobileMenu(false);
        });
    }
    
    // Overlay
    var overlay = document.querySelector('.mobile-overlay');
    if (overlay) {
        overlay.onclick = function(e) {
            console.log('Overlay tıklandı');
            if (e) e.preventDefault();
            toggleMobileMenu(false);
            return false;
        };
        overlay.addEventListener('touchstart', function(e) {
            if (e) e.preventDefault();
            toggleMobileMenu(false);
        });
    }
}

// Hamburger menü toggle olayı
function mobileMenuToggle(e) {
    console.log('Hamburger butonuna tıklandı - Olay: ' + (e ? e.type : 'doğrudan çağrı'));
    if (e) e.preventDefault();
    toggleMobileMenu();
    return false;
}

// Menüyü aç/kapat
function toggleMobileMenu(forceState) {
    var mobileMenu = document.querySelector('.mobile-menu');
    var mobileOverlay = document.querySelector('.mobile-overlay');
    
    if (!mobileMenu) {
        console.log('Mobile menu bulunamadı!');
        return;
    }
    
    var isActive = mobileMenu.classList.contains('active');
    var newState = (forceState !== undefined) ? forceState : !isActive;
    
    console.log('Menü durumu: ' + (isActive ? 'açık' : 'kapalı') + ' -> ' + (newState ? 'açılıyor' : 'kapanıyor'));
    
    if (newState) {
        // Menüyü aç
        mobileMenu.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        // Menüyü kapat
        mobileMenu.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 2. DEVAMINI OKU BUTONLARI
function setupReadMoreButtons() {
    // Tüm devamını oku butonlarını seç
    var readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
    
    if (readMoreButtons.length === 0) {
        console.log('Devamını oku butonları bulunamadı');
        return;
    }
    
    console.log('Devamını oku butonları ayarlanıyor: ' + readMoreButtons.length + ' adet');
    
    readMoreButtons.forEach(function(button, index) {
        button.onclick = readMoreHandler;
        button.addEventListener('touchstart', readMoreHandler);
        button.addEventListener('mousedown', readMoreHandler);
        console.log('Buton #' + index + ' hazır: ' + button.textContent.trim());
    });
}

// Devamını oku butonu işleyici
function readMoreHandler(e) {
    if (e) e.preventDefault();
    console.log('Devamını oku butonuna tıklandı: ' + this.getAttribute('data-post-id') + ' - Olay: ' + (e ? e.type : 'doğrudan'));
    
    // Post ID ile blog içeriğini göster
    var postId = this.getAttribute('data-post-id');
    if (!postId) {
        console.log('Post ID bulunamadı!');
        return false;
    }
    
    // Menü açıksa kapat
    toggleMobileMenu(false);
    
    // Blog popup'ını göster
    if (typeof window.showBlogPopup === 'function') {
        try {
            if (typeof window.blogData !== 'undefined' && window.blogData.blogPosts) {
                var post = window.blogData.blogPosts.find(function(p) { 
                    return p.id == postId; 
                });
                
                if (post) {
                    window.showBlogPopup(post);
                    console.log('Post bulundu ve gösterildi: ' + post.title);
                } else {
                    window.showBlogPopup(postId);
                    console.log('Post ID ile gösterildi: ' + postId);
                }
            } else {
                window.showBlogPopup(postId);
                console.log('blogData bulunamadı, doğrudan ID ile gösterildi: ' + postId);
            }
        } catch (error) {
            console.error('Blog popup gösterilirken hata: ', error);
        }
    } else {
        console.error('showBlogPopup fonksiyonu bulunamadı!');
    }
    
    return false;
}

// 3. KATEGORİ BUTONLARI
function setupCategoryButtons() {
    // Tüm kategori butonlarını seç
    var categoryButtons = document.querySelectorAll('.category-item');
    
    if (categoryButtons.length === 0) {
        console.log('Kategori butonları bulunamadı');
        return;
    }
    
    console.log('Kategori butonları ayarlanıyor: ' + categoryButtons.length + ' adet');
    
    categoryButtons.forEach(function(button, index) {
        button.onclick = categoryHandler;
        button.addEventListener('touchstart', categoryHandler);
        button.addEventListener('mousedown', categoryHandler);
        console.log('Kategori #' + index + ' hazır: ' + button.getAttribute('data-category'));
    });
}

// Kategori butonu işleyici
function categoryHandler(e) {
    if (e) e.preventDefault();
    console.log('Kategori butonuna tıklandı: ' + this.getAttribute('data-category') + ' - Olay: ' + (e ? e.type : 'doğrudan'));
    
    // Menü açıksa kapat
    toggleMobileMenu(false);
    
    // Kategori değiştir
    var category = this.getAttribute('data-category');
    if (!category) {
        console.log('Kategori bulunamadı!');
        return false;
    }
    
    // Aktif sınıfını düzenle
    document.querySelectorAll('.category-item').forEach(function(btn) {
        btn.classList.remove('active');
    });
    this.classList.add('active');
    
    // Blog yazılarını göster
    if (typeof window.displayBlogPosts === 'function') {
        try {
            window.displayBlogPosts(category);
            console.log('Kategori değiştirildi: ' + category);
        } catch (error) {
            console.error('Kategoriler gösterilirken hata: ', error);
        }
    } else if (typeof window.loadBlogPosts === 'function') {
        try {
            window.loadBlogPosts(category);
            console.log('Kategoriler loadBlogPosts ile yüklendi: ' + category);
        } catch (error) {
            console.error('Kategoriler yüklenirken hata: ', error);
        }
    } else {
        console.error('displayBlogPosts veya loadBlogPosts fonksiyonu bulunamadı!');
    }
    
    return false;
}
