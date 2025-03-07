/**
 * Popup JavaScript - Senirkent Blog
 * Her fonksiyon öneki: snk_popup_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını tanımla
const snk_popup_overlay = document.getElementById('popupOverlay');
const snk_popup_container = document.querySelector('.snk-popup-container');
const snk_popup_closeBtn = document.getElementById('popupClose');
const snk_popup_title = document.getElementById('popupTitle');
const snk_popup_content = document.getElementById('popupContent');

/**
 * Popup'ı açar ve içeriğini doldurur
 * @param {Object} postData - Gösterilecek blog yazısının verileri
 */
function snk_popup_openPopup(postData) {
    // Popup başlığını ayarla
    snk_popup_title.textContent = postData.title;
    
    // Popup içeriğini oluştur
    let contentHTML = `
        <div class="snk-article-metadata">
            <div class="snk-article-author">
                <i class="fas fa-user"></i> ${postData.author}
            </div>
            <div class="snk-article-date">
                <i class="fas fa-calendar"></i> ${postData.date}
            </div>
            <div class="snk-article-views">
                <i class="fas fa-eye"></i> ${postData.views || '0'} görüntülenme
            </div>
        </div>
        
        <img src="${postData.image}" alt="${postData.title}" class="snk-article-image">
        
        <div class="snk-article-content">
            ${postData.content}
        </div>
        
        <div class="snk-article-tags">
    `;
    
    // Etiketleri ekle
    if (postData.tags && postData.tags.length > 0) {
        postData.tags.forEach(tag => {
            contentHTML += `<span class="snk-article-tag">${tag}</span>`;
        });
    }
    
    contentHTML += `</div>`;
    
    // İçeriği popup'a ekle
    snk_popup_content.innerHTML = contentHTML;
    
    // Popup'ı görünür yap
    snk_popup_overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı devre dışı bırak
    
    // İstatistik güncelleme (görüntülenme sayısını artırma)
    snk_popup_updateStats(postData.id);
}

/**
 * Popup'ı kapatır
 */
function snk_popup_closePopup() {
    snk_popup_overlay.classList.remove('active');
    document.body.style.overflow = ''; // Sayfa kaydırmayı tekrar etkinleştir
    
    // İçeriği temizle (hafızayı serbest bırakmak için)
    setTimeout(() => {
        snk_popup_content.innerHTML = '';
        snk_popup_title.textContent = '';
    }, 300);
}

/**
 * Post istatistiklerini günceller (görüntülenme sayısı vb.)
 * @param {number|string} postId - Güncellenecek yazının ID'si
 */
function snk_popup_updateStats(postId) {
    // Burada gerçek bir uygulamada AJAX çağrısı yapılabilir
    console.log(`Post #${postId} görüntülendi`);
    
    // Kullanım örneği: localStorage'da görüntülenme sayısını takip etme
    const viewedPosts = JSON.parse(localStorage.getItem('snk_viewed_posts') || '{}');
    viewedPosts[postId] = (viewedPosts[postId] || 0) + 1;
    localStorage.setItem('snk_viewed_posts', JSON.stringify(viewedPosts));
}

/**
 * ESC tuşuna basıldığında popup'ı kapatır
 * @param {KeyboardEvent} e - Klavye olayı
 */
function snk_popup_handleKeyPress(e) {
    if (e.key === 'Escape' && snk_popup_overlay.classList.contains('active')) {
        snk_popup_closePopup();
    }
}

/**
 * Popup dışına tıklandığında kapatır
 * @param {MouseEvent} e - Fare tıklama olayı
 */
function snk_popup_handleClickOutside(e) {
    if (e.target === snk_popup_overlay) {
        snk_popup_closePopup();
    }
}

// Olay dinleyicileri tanımla
snk_popup_closeBtn.addEventListener('click', snk_popup_closePopup);
document.addEventListener('keydown', snk_popup_handleKeyPress);
snk_popup_overlay.addEventListener('click', snk_popup_handleClickOutside);

// 'Devamını Oku' butonları için olay dinleyicileri ekle
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.snk-read-more-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Sayfa yenilenmesini önle
            const postId = button.getAttribute('data-post-id');
            
            // İlgili yazıyı getir ve popup'ta göster
            snk_popup_fetchPostData(postId);
        });
    });
});

/**
 * Belirli bir yazının verilerini getirir
 * @param {number|string} postId - Getirilecek yazının ID'si
 */
function snk_popup_fetchPostData(postId) {
    // Gerçek bir uygulamada burası AJAX ile sunucudan veri çeker
    
    // Yükleniyor mesajı göster
    snk_popup_content.innerHTML = `
        <div class="snk-loading">
            <i class="fas fa-spinner fa-spin"></i> Yazı yükleniyor...
        </div>
    `;
    snk_popup_title.textContent = 'Yükleniyor...';
    snk_popup_overlay.classList.add('active');
    
    // blogPosts.json'dan veri çekme işlemini simüle edelim
    setTimeout(() => {
        fetch('../../utils/blogPosts.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Veri yüklenemedi');
                }
                return response.json();
            })
            .then(data => {
                const post = data.posts.find(post => post.id === parseInt(postId) || post.id === postId);
                
                if (post) {
                    snk_popup_openPopup(post);
                } else {
                    throw new Error('Yazı bulunamadı');
                }
            })
            .catch(error => {
                console.error('Veri çekme hatası:', error);
                snk_popup_content.innerHTML = `
                    <div class="snk-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Yazı yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                    </div>
                `;
                snk_popup_title.textContent = 'Hata';
            });
    }, 500);
}
