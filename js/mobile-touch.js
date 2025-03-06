/**
 * Senirkent MYO Blog - Mobil Dokunma Düzeltmesi
 * En direkt, basit, saf çözüm - Hiçbir karmaşıklık yok
 */

(function() {
    // Mobil olup olmadığını kontrol et
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return; // Masaüstünde hiçbir şey yapma
    
    // Dokunma gecikmesini kaldır
    document.addEventListener('touchstart', function(){}, {passive: true});
    
    // Aktif ekranın boyutu (referans için)
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    
    console.log('Mobil: ' + screenWidth + 'x' + screenHeight + ' - Touch düzeltmesi aktif');
    
    // ===== ANA DOKUNMA YÖNETİCİSİ =====
    document.addEventListener('touchstart', function(e) {
        // İlk dokunulan noktayı kaydet
        window._touchStartX = e.touches[0].clientX;
        window._touchStartY = e.touches[0].clientY;
        window._touchStartTime = Date.now();
        window._touchTarget = e.target;
    }, {passive: true});
    
    document.addEventListener('touchend', function(e) {
        // Bitiş noktası
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        var touchTime = Date.now() - window._touchStartTime;
        var target = window._touchTarget;
        
        // Hareket mesafesi (kaydırma tespiti için)
        var moveX = Math.abs(touchEndX - window._touchStartX);
        var moveY = Math.abs(touchEndY - window._touchStartY);
        
        // Eğer bu bir kaydırma hareketi ise, tıklama olarak işleme!
        if (moveX > 15 || moveY > 15) return;
        
        // Eğer çok uzun bir dokunma ise, basılı tutma olabilir
        if (touchTime > 500) return;
        
        // Sabit değerli bir eleman için özel dokunma işlemi
        processTouchForElement(target, e);
        
    }, {passive: false});
    
    // ===== ELEMAN TİPİNE GÖRE DOKUNMA İŞLEME =====
    function processTouchForElement(target, e) {
        // Hamburger menü işlemi
        if (isElementOrParent(target, 'hamburger-btn') || 
            isElementOrParent(target, 'bar1') || 
            isElementOrParent(target, 'bar2') || 
            isElementOrParent(target, 'bar3')) {
            
            console.log('Hamburger menü dokunuşu');
            e.preventDefault();
            toggleMenu();
            return;
        }
        
        // Devamını oku butonu işlemi
        if (isElementOrParent(target, 'btn-daha') || isElementOrParent(target, 'read-more')) {
            console.log('Devamını oku dokunuşu');
            e.preventDefault();
            
            // Post ID'yi bul
            var postId = target.getAttribute('data-post-id');
            if (!postId) {
                var parent = findParentWithAttribute(target, 'data-post-id');
                if (parent) postId = parent.getAttribute('data-post-id');
            }
            
            // Blog popup'ı göster
            if (postId && typeof window.showBlogPopup === 'function') {
                window.showBlogPopup(postId);
            }
            return;
        }
        
        // Kategori butonu işlemi
        if (isElementOrParent(target, 'category-item')) {
            console.log('Kategori dokunuşu');
            e.preventDefault();
            
            // Kategori değerini bul
            var category = target.getAttribute('data-category');
            if (!category) {
                var parent = findParentWithAttribute(target, 'data-category');
                if (parent) category = parent.getAttribute('data-category');
            }
            
            if (category) {
                // Tüm kategori butonlarından active sınıfını kaldır
                var categoryBtns = document.querySelectorAll('.category-item');
                for (var i = 0; i < categoryBtns.length; i++) {
                    categoryBtns[i].classList.remove('active');
                }
                
                // Dokunulan butona active sınıfını ekle
                var buttonToActivate = isElementOfClass(target, 'category-item') ? 
                                  target : findParentWithClass(target, 'category-item');
                if (buttonToActivate) {
                    buttonToActivate.classList.add('active');
                }
                
                // İlgili kategori fonksiyonunu çağır
                if (typeof window.displayBlogPosts === 'function') {
                    window.displayBlogPosts(category);
                } else if (typeof window.loadBlogPosts === 'function') {
                    window.loadBlogPosts(category);
                }
            }
            return;
        }
        
        // Bağlantılar için özel işlem
        if (target.tagName === 'A' || findParentWithTag(target, 'A')) {
            var link = target.tagName === 'A' ? target : findParentWithTag(target, 'A');
            if (link && link.href) {
                console.log('Bağlantı dokunuşu: ' + link.href);
                e.preventDefault();
                window.location.href = link.href;
                return;
            }
        }
        
        // Diğer tüm butonlar için
        if (target.tagName === 'BUTTON' || isElementOrParent(target, 'btn') || 
            findParentWithTag(target, 'BUTTON')) {
            console.log('Buton dokunuşu');
            e.preventDefault();
            
            var button = target.tagName === 'BUTTON' ? target : 
                      (isElementOfClass(target, 'btn') ? target : 
                      (findParentWithTag(target, 'BUTTON') || findParentWithClass(target, 'btn')));
            
            if (button) {
                simulateClick(button);
            }
            return;
        }
    }
    
    // ===== MENÜ İŞLEMLERİ =====
    function toggleMenu() {
        console.log('Menü geçişi yapılıyor');
        
        var mobileMenu = document.querySelector('.mobile-menu');
        if (!mobileMenu) return;
        
        if (mobileMenu.classList.contains('active')) {
            // Menüyü kapat
            mobileMenu.classList.remove('active');
            var overlay = document.querySelector('.mobile-overlay');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // Menüyü aç
            mobileMenu.classList.add('active');
            var overlay = document.querySelector('.mobile-overlay');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // ===== YARDIMCI FONKSİYONLAR =====
    
    // Bir elementin veya üst elementinin belirli bir sınıfa sahip olup olmadığını kontrol eder
    function isElementOrParent(element, className) {
        if (!element || !element.classList) return false;
        
        // Element direkt olarak bu sınıfa sahip mi?
        if (element.classList.contains(className)) return true;
        
        // Üst elementler kontrol edilir
        var parent = element.parentElement;
        while (parent) {
            if (parent.classList && parent.classList.contains(className)) {
                return true;
            }
            parent = parent.parentElement;
        }
        
        return false;
    }
    
    // Bir elementin belirli bir sınıfa sahip olup olmadığını kontrol eder
    function isElementOfClass(element, className) {
        return element && element.classList && element.classList.contains(className);
    }
    
    // Belirli bir sınıfa sahip üst elementi bulur
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
    
    // Belirli bir etikete sahip üst elementi bulur
    function findParentWithTag(element, tagName) {
        var parent = element.parentElement;
        while (parent) {
            if (parent.tagName === tagName) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }
    
    // Belirli bir özelliğe sahip üst elementi bulur
    function findParentWithAttribute(element, attribute) {
        var parent = element.parentElement;
        while (parent) {
            if (parent.hasAttribute && parent.hasAttribute(attribute)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }
    
    // Tıklama olayını simüle eder
    function simulateClick(element) {
        var event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }
})();
