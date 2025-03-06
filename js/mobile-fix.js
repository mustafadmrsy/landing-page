/**
 * Senirkent MYO Blog - Basit Mobil Tıklama Çözümü
 * Açıklama: Sadece temel mobil tıklama sorununu çözen çok basit kod
 * Sürüm: 1.0.1
 */

// Basit ve anında çalışan çözüm
(function() {
    console.log('Mobil düzeltme aktif - En basit çözüm');
    
    // Doğrudan tıklama olaylarını engelleme
    document.documentElement.addEventListener('touchend', function(e) {
        // Sadece tıklama olayını engelleme, diğer olayları etkileme
        setTimeout(function() {
            // Tıklanan element bir buton, bağlantı veya kategori ise
            var target = e.target;
            
            if (isMenuElement(target)) {
                // Hamburger menü veya menü elemanlarına tıklandıysa
                console.log('Menü elemanı tıklaması algılandı:', target.tagName, target.className);
                
                // Menüyü aç/kapat
                if (typeof toggleMobileMenu === 'function') {
                    toggleMobileMenu();
                } else {
                    // Alternatif açma yöntemi
                    var mobileMenu = document.querySelector('.mobile-menu');
                    if (mobileMenu) {
                        if (mobileMenu.classList.contains('active')) {
                            mobileMenu.classList.remove('active');
                        } else {
                            mobileMenu.classList.add('active');
                        }
                    }
                }
                
                return;
            }
            
            if (isReadMoreButton(target)) {
                // Devamını oku düğmesine tıklandıysa
                console.log('Devamını oku tıklaması algılandı:', target.tagName, target.className);
                
                var postId = target.getAttribute('data-post-id');
                if (!postId) {
                    var parent = findClosestWithAttribute(target, 'data-post-id');
                    if (parent) postId = parent.getAttribute('data-post-id');
                }
                
                if (postId && typeof showBlogPopup === 'function') {
                    showBlogPopup(postId);
                }
                
                return;
            }
            
            if (isCategoryButton(target)) {
                // Kategori düğmesine tıklandıysa
                console.log('Kategori tıklaması algılandı:', target.tagName, target.className);
                
                var category = target.getAttribute('data-category');
                if (!category) {
                    var parent = findClosestWithAttribute(target, 'data-category');
                    if (parent) category = parent.getAttribute('data-category');
                }
                
                if (category) {
                    // Tüm butonlardan active sınıfını kaldır
                    var categoryButtons = document.querySelectorAll('.category-item');
                    for (var i = 0; i < categoryButtons.length; i++) {
                        categoryButtons[i].classList.remove('active');
                    }
                    
                    // Tıklanan butona active ekle
                    var buttonToActivate = target.classList.contains('category-item') ? 
                                          target : findClosestWithClass(target, 'category-item');
                    if (buttonToActivate) {
                        buttonToActivate.classList.add('active');
                    }
                    
                    // İlgili fonksiyonu çağır
                    if (typeof displayBlogPosts === 'function') {
                        displayBlogPosts(category);
                    } else if (typeof loadBlogPosts === 'function') {
                        loadBlogPosts(category);
                    }
                }
                
                return;
            }
        }, 10);
    });
    
})();

// Tıklanan elementin hamburger menü veya menü elemanı olup olmadığını kontrol et
function isMenuElement(element) {
    if (!element) return false;
    
    // Element hamburger buton mu?
    if (element.classList && element.classList.contains('hamburger-btn')) {
        return true;
    }
    
    // Element menü öğesi mi?
    if (element.classList && (
        element.classList.contains('bar1') || 
        element.classList.contains('bar2') || 
        element.classList.contains('bar3') ||
        element.classList.contains('mobile-menu-link')
    )) {
        return true;
    }
    
    // Element hamburger buton içinde mi?
    var parent = element.parentElement;
    while (parent) {
        if (parent.classList && parent.classList.contains('hamburger-btn')) {
            return true;
        }
        parent = parent.parentElement;
    }
    
    return false;
}

// Tıklanan elementin "Devamını Oku" düğmesi olup olmadığını kontrol et
function isReadMoreButton(element) {
    if (!element) return false;
    
    // Element "Devamını Oku" buton mu?
    if (element.classList && (
        element.classList.contains('btn-daha') ||
        element.classList.contains('read-more')
    )) {
        return true;
    }
    
    // Element "Devamını Oku" butonu içinde mi?
    var parent = element.parentElement;
    while (parent) {
        if (parent.classList && (
            parent.classList.contains('btn-daha') ||
            parent.classList.contains('read-more')
        )) {
            return true;
        }
        parent = parent.parentElement;
    }
    
    return false;
}

// Tıklanan elementin kategori düğmesi olup olmadığını kontrol et
function isCategoryButton(element) {
    if (!element) return false;
    
    // Element kategori buton mu?
    if (element.classList && element.classList.contains('category-item')) {
        return true;
    }
    
    // Element kategori butonu içinde mi?
    var parent = element.parentElement;
    while (parent) {
        if (parent.classList && parent.classList.contains('category-item')) {
            return true;
        }
        parent = parent.parentElement;
    }
    
    return false;
}

// Belirtilen sınıfa sahip en yakın üst elementi bul
function findClosestWithClass(element, className) {
    if (!element) return null;
    
    if (element.classList && element.classList.contains(className)) {
        return element;
    }
    
    var parent = element.parentElement;
    while (parent) {
        if (parent.classList && parent.classList.contains(className)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    
    return null;
}

// Belirtilen attribute'a sahip en yakın üst elementi bul
function findClosestWithAttribute(element, attributeName) {
    if (!element) return null;
    
    if (element.hasAttribute && element.hasAttribute(attributeName)) {
        return element;
    }
    
    var parent = element.parentElement;
    while (parent) {
        if (parent.hasAttribute && parent.hasAttribute(attributeName)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    
    return null;
}
