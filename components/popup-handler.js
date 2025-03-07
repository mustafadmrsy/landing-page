/**
 * Popup Handler - Senirkent Blog
 * Her fonksiyon öneki: snk_popupHandler_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını seç
const snk_popupHandler_overlay = document.getElementById('snk_popupOverlay');
const snk_popupHandler_container = document.querySelector('.snk-popup-container');
const snk_popupHandler_closeBtn = document.getElementById('snk_popupCloseBtn');
const snk_popupHandler_title = document.getElementById('snk_popupTitle');
const snk_popupHandler_content = document.getElementById('snk_popupContent');
const snk_popupHandler_readMoreBtns = document.querySelectorAll('.snk-read-more-btn');

/**
 * Popup'ı açar
 * @param {string} title - Popup başlığı
 * @param {string} content - Popup içeriği (HTML formatında)
 */
function snk_popupHandler_openPopup(title, content) {
    console.log('Popup açılıyor:', title);
    
    // Popup içeriğini ayarla
    if (snk_popupHandler_title) {
        snk_popupHandler_title.textContent = title;
    }
    
    if (snk_popupHandler_content) {
        snk_popupHandler_content.innerHTML = content;
    }
    
    // Popup'ı görünür yap
    if (snk_popupHandler_overlay) {
        snk_popupHandler_overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Arka plan kaydırmayı engelle
    }
    
    // Popup animasyonu için timeout kullan
    setTimeout(() => {
        if (snk_popupHandler_container) {
            snk_popupHandler_container.classList.add('active');
        }
    }, 10);
}

/**
 * Popup'ı kapatır
 */
function snk_popupHandler_closePopup() {
    console.log('Popup kapatılıyor');
    
    if (snk_popupHandler_container) {
        snk_popupHandler_container.classList.remove('active');
    }
    
    // Önce container animasyonunu tamamla, sonra overlay'i gizle
    setTimeout(() => {
        if (snk_popupHandler_overlay) {
            snk_popupHandler_overlay.classList.remove('active');
            document.body.style.overflow = ''; // Arka plan kaydırmayı etkinleştir
        }
    }, 300); // CSS geçiş süresiyle eşleşmeli
}

/**
 * "Devamını Oku" butonlarına tıklama olayı ekler
 */
function snk_popupHandler_setupReadMoreButtons() {
    console.log('Devamını Oku butonları ayarlanıyor');
    
    const readMoreButtons = document.querySelectorAll('.snk-read-more-btn');
    if (readMoreButtons.length > 0) {
        readMoreButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault(); // Bağlantı davranışını engelle
                
                const postId = this.getAttribute('data-post-id');
                console.log('Post ID:', postId);
                
                if (postId) {
                    // popup.js içindeki fonksiyonu çağır
                    if (typeof snk_popup_fetchPostData === 'function') {
                        snk_popup_fetchPostData(postId);
                    } else {
                        console.error('snk_popup_fetchPostData fonksiyonu bulunamadı');
                    }
                } else {
                    console.error('Geçersiz post ID');
                }
            });
        });
    } else {
        console.warn('Hiç "Devamını Oku" butonu bulunamadı');
    }
}

/**
 * Popup eventlerini ayarlar
 */
function snk_popupHandler_setupEvents() {
    console.log('Popup olayları ayarlanıyor');
    
    // Kapatma butonuna tıklama
    if (snk_popupHandler_closeBtn) {
        snk_popupHandler_closeBtn.addEventListener('click', snk_popupHandler_closePopup);
    } else {
        console.error('Popup kapatma butonu bulunamadı');
    }
    
    // Overlay'e tıklama
    if (snk_popupHandler_overlay) {
        snk_popupHandler_overlay.addEventListener('click', function(e) {
            // Sadece overlay'e tıklandığında kapat (popup içeriğine tıklamada değil)
            if (e.target === snk_popupHandler_overlay) {
                snk_popupHandler_closePopup();
            }
        });
    }
    
    // ESC tuşuna basma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && snk_popupHandler_overlay && 
            snk_popupHandler_overlay.classList.contains('active')) {
            snk_popupHandler_closePopup();
        }
    });
}

// Sayfa yüklendiğinde hazırlık
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup Handler yüklendi');
    
    // Popup olaylarını ayarla
    snk_popupHandler_setupEvents();
    
    // "Devamını Oku" butonlarını ayarla
    // Burada setupReadMoreButtons fonksiyonunu çağırmıyoruz çünkü
    // butonlar main.js tarafından dinamik olarak oluşturuluyor olabilir
    
    // Ana içerik yüklendiğinde butonları ayarla
    const postsContainer = document.getElementById('snk_postsContainer');
    if (postsContainer) {
        // MutationObserver ile DOM değişikliklerini izle
        const observer = new MutationObserver(function(mutations) {
            // DOM değiştiğinde "Devamını Oku" butonlarını ayarla
            snk_popupHandler_setupReadMoreButtons();
        });
        
        // Gözlem yapılandırması
        const config = { childList: true, subtree: true };
        
        // Gözlemi başlat
        observer.observe(postsContainer, config);
    }
});

// Global alanda tanımla
window.snk_popupHandler_openPopup = snk_popupHandler_openPopup;
window.snk_popupHandler_closePopup = snk_popupHandler_closePopup;
