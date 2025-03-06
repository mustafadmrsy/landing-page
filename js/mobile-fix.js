/**
 * Senirkent MYO Blog - Mobil Etkileşim Düzeltmesi
 * Bu dosya mobil cihazlarda tıklama sorunlarını giderir
 * Basit ve doğrudan bir çözüm
 */

// Hemen çalışacak IIFE
(function() {
    // Sadece mobile cihazlarda çalışmasını sağla
    if (window.innerWidth > 768) {
        console.log('Mobile-fix.js: Bu bir mobil cihaz değil, kodlar çalıştırılmayacak');
        return; // Masaüstünde hiçbir şey yapma
    }
    
    console.log('Mobile-fix.js v1.0 aktif - Mobil cihaz tespit edildi');
    
    // Sayfa yüklenir yüklenirse çalış
    document.addEventListener('DOMContentLoaded', fixMobileInteractions);
    
    // Hem DOMContentLoaded hem de load eventlerini dinle (hangisi önce gelirse)
    window.addEventListener('load', fixMobileInteractions);
    
    // Anında da çalıştır
    setTimeout(fixMobileInteractions, 100);
    
    // Sayfada oluşan tüm tıklama olaylarını dinle (delegasyon ile)
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('touchend', handleGlobalTouch, true);
})();

// Tüm sayfadaki tıklama olaylarını yakalayan fonksiyon
function handleGlobalClick(event) {
    // Sadece mobile cihazlar için
    if (window.innerWidth > 768) return;
    
    console.log('Global click: ', event.target.tagName, event.target.className);
}

// Tüm sayfadaki dokunma olaylarını yakalayan fonksiyon
function handleGlobalTouch(event) {
    // Sadece mobile cihazlar için
    if (window.innerWidth > 768) return;
    
    console.log('Global touch: ', event.target.tagName, event.target.className);
    
    var target = event.target;
    
    // Tıklanan eleman bir buton, bağlantı veya bir kategori ise
    if (isInteractiveElement(target)) {
        console.log('Etkileşimli element tespit edildi:', target.tagName, target.className);
        
        // Hamburger butonu mu?
        if (target.classList.contains('hamburger-btn') || isInsideClass(target, 'hamburger-btn')) {
            event.preventDefault();
            event.stopPropagation();
            toggleMobileMenu();
            console.log('Hamburger menü tetiklendi');
            return false;
        }
        
        // Devamını oku butonu mu?
        if (target.classList.contains('btn-daha') || target.classList.contains('read-more') || 
            isInsideClass(target, 'btn-daha') || isInsideClass(target, 'read-more')) {
            
            event.preventDefault();
            event.stopPropagation();
            
            // Buton veya üst elemandan post ID'yi bul
            var postId = target.getAttribute('data-post-id');
            if (!postId) {
                var parent = findParentWithAttribute(target, 'data-post-id');
                if (parent) postId = parent.getAttribute('data-post-id');
            }
            
            if (postId && typeof window.showBlogPopup === 'function') {
                console.log('Devamını oku butonu tetiklendi: ' + postId);
                window.showBlogPopup(postId);
            }
            return false;
        }
        
        // Kategori butonu mu?
        if (target.classList.contains('category-item') || isInsideClass(target, 'category-item')) {
            event.preventDefault();
            event.stopPropagation();
            
            // Buton veya üst elemandan kategori değerini bul
            var category = target.getAttribute('data-category');
            if (!category) {
                var parent = findParentWithAttribute(target, 'data-category');
                if (parent) category = parent.getAttribute('data-category');
            }
            
            if (category) {
                console.log('Kategori butonu tetiklendi: ' + category);
                
                // Tüm kategori butonlarından active sınıfını kaldır
                document.querySelectorAll('.category-item').forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Tıklanan butona active sınıfını ekle
                if (target.classList.contains('category-item')) {
                    target.classList.add('active');
                } else {
                    var categoryButton = findParentWithClass(target, 'category-item');
                    if (categoryButton) categoryButton.classList.add('active');
                }
                
                // Kategori filtrelemesini uygula
                if (typeof window.displayBlogPosts === 'function') {
                    window.displayBlogPosts(category);
                } else if (typeof window.loadBlogPosts === 'function') {
                    window.loadBlogPosts(category);
                }
            }
            return false;
        }
    }
}

// Mobil etkileşimleri düzelten ana fonksiyon
function fixMobileInteractions() {
    // Sadece mobile cihazlar için
    if (window.innerWidth > 768) return;
    
    // Hamburger menü düzeltmesi
    fixHamburgerMenu();
    
    // Devamını oku butonları düzeltmesi
    fixReadMoreButtons();
    
    // Kategori butonları düzeltmesi
    fixCategoryButtons();
    
    console.log('Mobil etkileşim düzeltmeleri uygulandı');
}

// Hamburger menü etkileşimini düzeltme
function fixHamburgerMenu() {
    var hamburgerBtn = document.querySelector('.hamburger-btn');
    if (!hamburgerBtn) return;
    
    // Olay dinleyicilerini kaldır ve yeniden ekle
    var newBtn = hamburgerBtn.cloneNode(true);
    if (hamburgerBtn.parentNode) {
        hamburgerBtn.parentNode.replaceChild(newBtn, hamburgerBtn);
    }
    
    // Yeni eventi ekle
    newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
        return false;
    });
    
    // Mobil için touchend eventi ekle
    newBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
        return false;
    });
    
    console.log('Hamburger menü düzeltildi');
}

// "Devamını Oku" butonlarını düzeltme
function fixReadMoreButtons() {
    var readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
    if (readMoreButtons.length === 0) return;
    
    readMoreButtons.forEach(function(button) {
        // Olay dinleyicilerini kaldır ve yeniden ekle
        var newBtn = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newBtn, button);
        }
        
        // Click ve touchend eventlerini ekle
        newBtn.addEventListener('click', handleReadMoreClick);
        newBtn.addEventListener('touchend', handleReadMoreClick);
    });
    
    console.log('Devamını oku butonları düzeltildi: ' + readMoreButtons.length + ' adet');
}

// "Devamını Oku" tıklama olayı işleyicisi
function handleReadMoreClick(e) {
    // Sadece mobile cihazlar için
    if (window.innerWidth > 768) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    var postId = this.getAttribute('data-post-id');
    console.log('Devamını oku tıklandı: ' + postId);
    
    if (postId && typeof window.showBlogPopup === 'function') {
        window.showBlogPopup(postId);
    }
    
    return false;
}

// Kategori butonlarını düzeltme
function fixCategoryButtons() {
    var categoryButtons = document.querySelectorAll('.category-item');
    if (categoryButtons.length === 0) return;
    
    categoryButtons.forEach(function(button) {
        // Olay dinleyicilerini kaldır ve yeniden ekle
        var newBtn = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newBtn, button);
        }
        
        // Click ve touchend eventlerini ekle
        newBtn.addEventListener('click', handleCategoryClick);
        newBtn.addEventListener('touchend', handleCategoryClick);
    });
    
    console.log('Kategori butonları düzeltildi: ' + categoryButtons.length + ' adet');
}

// Kategori tıklama olayı işleyicisi
function handleCategoryClick(e) {
    // Sadece mobile cihazlar için
    if (window.innerWidth > 768) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    var category = this.getAttribute('data-category');
    console.log('Kategori tıklandı: ' + category);
    
    if (category) {
        // Active sınıfını düzenle
        document.querySelectorAll('.category-item').forEach(function(btn) {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Kategori değiştir
        if (typeof window.displayBlogPosts === 'function') {
            window.displayBlogPosts(category);
        } else if (typeof window.loadBlogPosts === 'function') {
            window.loadBlogPosts(category);
        }
    }
    
    return false;
}

// Mobil menüyü aç/kapat
function toggleMobileMenu() {
    var mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) return;
    
    if (mobileMenu.classList.contains('active')) {
        // Menüyü kapat
        mobileMenu.classList.remove('active');
        var overlay = document.querySelector('.mobile-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Mobil menü kapatıldı');
    } else {
        // Menüyü aç
        mobileMenu.classList.add('active');
        var overlay = document.querySelector('.mobile-overlay');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Mobil menü açıldı');
    }
}

// YARDIMCI FONKSİYONLAR

// Bir elementin belirtilen sınıfa sahip bir ebeveyn elementi olup olmadığını kontrol eder
function isInsideClass(element, className) {
    var parent = element.parentElement;
    while (parent) {
        if (parent.classList && parent.classList.contains(className)) {
            return true;
        }
        parent = parent.parentElement;
    }
    return false;
}

// Belirtilen sınıfa sahip üst elementi bulur
function findParentWithClass(element, className) {
    var parent = element.parentElement;
    while (parent) {
        if (parent.classList && parent.classList.contains(className)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
}

// Belirtilen attribute'a sahip üst elementi bulur
function findParentWithAttribute(element, attributeName) {
    var parent = element.parentElement;
    while (parent) {
        if (parent.hasAttribute(attributeName)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return null;
}

// Bir elementin etkileşimli (tıklanabilir) olup olmadığını kontrol eder
function isInteractiveElement(element) {
    if (!element) return false;
    
    // Standart etkileşimli elementler
    var interactiveTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'];
    if (interactiveTags.includes(element.tagName)) return true;
    
    // Etkileşimli CSS sınıfları
    var interactiveClasses = ['btn', 'button', 'hamburger-btn', 'category-item', 'btn-daha', 'read-more'];
    for (var i = 0; i < interactiveClasses.length; i++) {
        if (element.classList && element.classList.contains(interactiveClasses[i])) {
            return true;
        }
    }
    
    // Role attribute'u
    if (element.getAttribute('role') === 'button') return true;
    
    // onClick attribute'u
    if (element.hasAttribute('onclick')) return true;
    
    return false;
}
