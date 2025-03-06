/**
 * Senirkent MYO Blog - Ultra Basit Mobil Tıklama Düzeltmesi
 * Açıklama: Bu dosya, mobil etkileşim sorunlarını en basit yöntemle giderir
 * Sürüm: 1.0
 */

// 300ms dokunma gecikmesini kaldır
document.addEventListener('touchstart', function() {}, {passive: true});

// Etkileşim sorunu çözücü
(function() {
    // Mobil test
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if(!isMobile) {
        console.log('Mobil değil, normal işlevsellik korunuyor');
        return; // Masaüstünde çalışma
    }
    
    console.log('Mobil süper düzeltme aktif');
    
    // Dokunma için doğrudan olay ekle
    document.addEventListener('touchstart', function(e) {
        // Başlangıçta dokunulan eleman
        var touchTarget = e.target;
        window.lastTouchTarget = touchTarget;
    }, {passive: true});
    
    // Tıklama olayını geciktirerek tetikle
    document.addEventListener('touchend', function(e) {
        var touchTarget = e.target;
        
        // 0 ms gecikmeli tetikleyici (yeni thread'de)
        setTimeout(function() {
            // Hamburger menü kontrolü
            if (isHamburgerMenu(touchTarget)) {
                console.log('Hamburger menü tıklaması');
                if (typeof toggleMobileMenu === 'function') {
                    toggleMobileMenu();
                } else {
                    // Manuel hamburger işlemi
                    var mobileMenu = document.querySelector('.mobile-menu');
                    if (mobileMenu) {
                        mobileMenu.classList.toggle('active');
                    }
                }
                return;
            }
            
            // Devamını oku kontrolü
            if (isReadMoreButton(touchTarget)) {
                console.log('Devamını oku tıklaması');
                
                // Post ID'yi bul
                var postId = touchTarget.getAttribute('data-post-id');
                if (!postId) {
                    postId = findAttributeInParents(touchTarget, 'data-post-id');
                }
                
                if (postId && (typeof showBlogPopup === 'function')) {
                    showBlogPopup(postId);
                }
                return;
            }
            
            // Kategori buton kontrolü
            if (isCategoryButton(touchTarget)) {
                console.log('Kategori tıklaması');
                
                // Kategori değerini bul
                var category = touchTarget.getAttribute('data-category');
                if (!category) {
                    category = findAttributeInParents(touchTarget, 'data-category');
                }
                
                if (category) {
                    // Tüm kategori butonlarından active sınıfını kaldır
                    var buttons = document.querySelectorAll('.category-item');
                    for (var i = 0; i < buttons.length; i++) {
                        buttons[i].classList.remove('active');
                    }
                    
                    // Tıklanan butona veya ebeveynine active sınıfını ekle
                    var buttonToActivate = touchTarget.classList.contains('category-item') ? 
                                        touchTarget : findParentWithClass(touchTarget, 'category-item');
                    if (buttonToActivate) {
                        buttonToActivate.classList.add('active');
                    }
                    
                    // Kategori gösterme fonksiyonunu çağır
                    if (typeof displayBlogPosts === 'function') {
                        displayBlogPosts(category);
                    } else if (typeof loadBlogPosts === 'function') {
                        loadBlogPosts(category);
                    }
                }
                return;
            }
        }, 0);
        
    }, {passive: false});
    
    // Her etkileşimli elemente dokunma desteği ekle
    function addTouchTriggers() {
        // Tüm düğmeler ve bağlantılar
        var elements = document.querySelectorAll('a, button, .btn, .category-item, .hamburger-btn, .read-more, .btn-daha');
        
        // Her etkileşimli elemente özel dokunma tetikleyici ekle
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            
            // Dokunmada simüle tıklama
            element.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Eğer bağlantı ise localStorage ile durum tut (çift tıklama sorunu için)
                if (this.tagName === 'A' && this.href) {
                    localStorage.setItem('lastClickedLink', this.href);
                    localStorage.setItem('lastClickTime', Date.now());
                    window.location.href = this.href;
                } else {
                    // Diğer elementleri için tıklamayı simüle et
                    simulateClick(this);
                }
            }, {passive: false});
        }
    }
    
    // Sayfa yüklendiğinde dokunma tetikleyicileri ekle
    document.addEventListener('DOMContentLoaded', addTouchTriggers);
    
    // 100ms sonra da tetikleyicileri ekle (DOM hazır olmasa bile)
    setTimeout(addTouchTriggers, 100);
    
    // YARDIMCI FONKSİYONLAR
    
    // Hamburger menü elemanı mı kontrol et
    function isHamburgerMenu(element) {
        if (!element) return false;
        
        // Direkt hamburger-btn sınıfına sahipse
        if (element.classList && element.classList.contains('hamburger-btn')) {
            return true;
        }
        
        // Hamburger menu çubuklarından biriyse
        if (element.classList && (
            element.classList.contains('bar1') || 
            element.classList.contains('bar2') || 
            element.classList.contains('bar3')
        )) {
            return true;
        }
        
        // Hamburger menü içinde bir element mi?
        return hasParentWithClass(element, 'hamburger-btn');
    }
    
    // Devamını Oku butonu mu kontrol et
    function isReadMoreButton(element) {
        if (!element) return false;
        
        // Direkt Devamını Oku butonuysa
        if (element.classList && (
            element.classList.contains('btn-daha') || 
            element.classList.contains('read-more')
        )) {
            return true;
        }
        
        // Devamını Oku butonu içinde bir element mi?
        return hasParentWithClass(element, 'btn-daha') || 
               hasParentWithClass(element, 'read-more');
    }
    
    // Kategori butonu mu kontrol et
    function isCategoryButton(element) {
        if (!element) return false;
        
        // Direkt kategori butonuysa
        if (element.classList && element.classList.contains('category-item')) {
            return true;
        }
        
        // Kategori butonu içinde bir element mi?
        return hasParentWithClass(element, 'category-item');
    }
    
    // Verilen sınıfa sahip bir üst eleman var mı kontrol et
    function hasParentWithClass(element, className) {
        var current = element;
        while (current) {
            if (current.classList && current.classList.contains(className)) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }
    
    // Verilen sınıfa sahip bir üst eleman bul
    function findParentWithClass(element, className) {
        var current = element;
        while (current) {
            if (current.classList && current.classList.contains(className)) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
    
    // Üst elemanlarda bir özellik değerini bul
    function findAttributeInParents(element, attribute) {
        var current = element;
        while (current) {
            if (current.hasAttribute && current.hasAttribute(attribute)) {
                return current.getAttribute(attribute);
            }
            current = current.parentElement;
        }
        return null;
    }
    
    // Bir elemanda tıklama olayını simüle et
    function simulateClick(element) {
        var event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }
})();
