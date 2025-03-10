/**
 * Popup JavaScript - Senirkent Blog
 * Her fonksiyon öneki: snk_popup_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını tanımla
const snk_popup_overlay = document.getElementById('snk_popupOverlay');
const snk_popup_container = document.querySelector('.snk-popup-container');
const snk_popup_closeBtn = document.getElementById('snk_popupCloseBtn');
const snk_popup_title = document.getElementById('snk_popupTitle');
const snk_popup_content = document.getElementById('snk_popupContent');

/**
 * Popup'ı açar ve içeriğini doldurur
 * @param {Object} postData - Gösterilecek blog yazısının verileri
 */
function snk_popup_openPopup(postData) {
    console.log("Popup açılıyor:", postData.title);
    
    // Popup başlığını ayarla
    if (snk_popup_title) {
        snk_popup_title.textContent = postData.title;
    }
    
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
    if (snk_popup_content) {
        snk_popup_content.innerHTML = contentHTML;
    }
    
    // Popup'ı görünür yap
    if (snk_popup_overlay) {
        snk_popup_overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı devre dışı bırak
    }
    
    // İstatistik güncelleme (görüntülenme sayısını artırma)
    snk_popup_updateStats(postData.id);
}

/**
 * Popup'ı kapatır
 */
function snk_popup_closePopup() {
    console.log("Popup kapatılıyor");
    
    if (snk_popup_overlay) {
        snk_popup_overlay.classList.remove('active');
        document.body.style.overflow = ''; // Sayfa kaydırmayı tekrar etkinleştir
    }
    
    // İçeriği temizle (hafızayı serbest bırakmak için)
    setTimeout(() => {
        if (snk_popup_content) {
            snk_popup_content.innerHTML = '';
        }
        if (snk_popup_title) {
            snk_popup_title.textContent = '';
        }
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
    if (e.key === 'Escape' && snk_popup_overlay && snk_popup_overlay.classList.contains('active')) {
        snk_popup_closePopup();
    }
}

/**
 * Popup dışına tıklandığında kapatır
 * @param {MouseEvent} e - Fare tıklama olayı
 */
function snk_popup_handleClickOutside(e) {
    if (snk_popup_overlay && e.target === snk_popup_overlay) {
        snk_popup_closePopup();
    }
}

/**
 * Belirli bir yazının verilerini getirir
 * @param {number|string} postId - Getirilecek yazının ID'si
 */
function snk_popup_fetchPostData(postId) {
    console.log("Post verisi getiriliyor:", postId);
    
    // Gerçek bir uygulamada burası AJAX ile sunucudan veri çeker
    
    // Yükleniyor mesajı göster
    if (snk_popup_content) {
        snk_popup_content.innerHTML = `
            <div class="snk-loading">
                <i class="fas fa-spinner fa-spin"></i> Yazı yükleniyor...
            </div>
        `;
    }
    
    if (snk_popup_title) {
        snk_popup_title.textContent = 'Yükleniyor...';
    }
    
    if (snk_popup_overlay) {
        snk_popup_overlay.classList.add('active');
    }
    
    // Tüm olası localStorage anahtarlarını kontrol et
    const storageKeys = ['snk_blog_posts', 'snk_blogPosts', 'blog_posts'];
    let foundPost = null;
    let allPosts = [];
    
    // Her bir anahtar için kontrol et
    for (const key of storageKeys) {
        const posts = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Bu anahtardan gelen yazıları allPosts'a ekle
        allPosts = [...allPosts, ...posts];
        
        // PostId ile eşleşen yazıyı bul
        const post = posts.find(post => 
            post.id === parseInt(postId) || 
            post.id === postId || 
            post.id === postId.toString()
        );
        
        if (post) {
            foundPost = post;
            console.log(`Yazı ${key} içinde bulundu:`, post.title);
            break;
        }
    }
    
    // Yazı bulunduysa göster
    if (foundPost) {
        // Eğer yazı bulunduysa durumunu approved olarak ayarla
        foundPost.status = foundPost.status || 'approved';
        
        // Yazıyı göster
        snk_popup_openPopup(foundPost);
        
        // Yazıyı tüm localStorage anahtarlarına kaydet (veri tutarlılığı için)
        // Bu, yazının ana sayfada ve admin sayfasında görünmesini sağlar
        for (const key of storageKeys) {
            let posts = JSON.parse(localStorage.getItem(key) || '[]');
            
            // Yazı bu anahtarda varsa, güncelle
            const existingIndex = posts.findIndex(post => 
                post.id === parseInt(postId) || 
                post.id === postId || 
                post.id === postId.toString()
            );
            
            if (existingIndex !== -1) {
                posts[existingIndex] = foundPost;
            } else {
                // Yazı bu anahtarda yoksa, ekle
                posts.push(foundPost);
            }
            
            // Güncellenmiş yazıları localStorage'a kaydet
            localStorage.setItem(key, JSON.stringify(posts));
            console.log(`Yazı ${key} içine kaydedildi`);
        }
        
        return;
    }
    
    // Kullanıcı gönderilerinde bulunamadıysa, blogPosts.json'dan veri çek
    setTimeout(() => {
        fetch('../utils/blogPosts.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Veri yüklenemedi');
                }
                return response.json();
            })
            .then(data => {
                const post = data.posts.find(post => post.id === parseInt(postId) || post.id === postId);
                
                if (post) {
                    // Yazı durumunu approved olarak ayarla
                    post.status = post.status || 'approved';
                    
                    // Popup'ı açarak yazıyı göster
                    snk_popup_openPopup(post);
                    
                    // Bu yazıyı localStorage'a da ekle
                    for (const key of storageKeys) {
                        let posts = JSON.parse(localStorage.getItem(key) || '[]');
                        
                        // Yazı zaten mevcutsa ekleme
                        if (!posts.some(p => p.id === post.id)) {
                            posts.push(post);
                            localStorage.setItem(key, JSON.stringify(posts));
                            console.log(`Yazı ${key} içine kaydedildi`);
                        }
                    }
                } else {
                    throw new Error('Yazı bulunamadı');
                }
            })
            .catch(error => {
                console.error('Veri çekme hatası:', error);
                if (snk_popup_content) {
                    snk_popup_content.innerHTML = `
                        <div class="snk-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Yazı yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                        </div>
                    `;
                }
                
                if (snk_popup_title) {
                    snk_popup_title.textContent = 'Hata';
                }
            });
    }, 500);
}

// Sayfa yüklendiğinde hazırlık
document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup.js yüklendi");
    
    // DOM elemanlarını tekrar seç (lazy loading için)
    const popupOverlay = document.getElementById('snk_popupOverlay');
    const popupCloseBtn = document.getElementById('snk_popupCloseBtn');
    
    console.log("Popup elemanları:", {popupOverlay, popupCloseBtn});
    
    // Olay dinleyicilerini ekle
    if (popupCloseBtn) {
        console.log("Popup kapatma butonu olayı ekleniyor");
        popupCloseBtn.addEventListener('click', snk_popup_closePopup);
    } else {
        console.error("Popup kapatma butonu bulunamadı!");
    }
    
    if (popupOverlay) {
        console.log("Popup dışı tıklama olayı ekleniyor");
        popupOverlay.addEventListener('click', snk_popup_handleClickOutside);
    } else {
        console.error("Popup overlay bulunamadı!");
    }
    
    document.addEventListener('keydown', snk_popup_handleKeyPress);
    
    // 'Devamını Oku' butonları için olay dinleyicileri ekle
    const readMoreButtons = document.querySelectorAll('.snk-read-more-btn');
    if (readMoreButtons.length > 0) {
        console.log("Devamını Oku butonları bulundu:", readMoreButtons.length);
        readMoreButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); // Sayfa yenilenmesini önle
                const postId = button.getAttribute('data-post-id');
                console.log("Devamını Oku butonuna tıklandı, Post ID:", postId);
                
                // İlgili yazıyı getir ve popup'ta göster
                snk_popup_fetchPostData(postId);
            });
        });
    } else {
        console.warn("Hiç 'Devamını Oku' butonu bulunamadı");
    }
});

// Global olarak bu fonksiyonlara erişim sağla
window.snk_popup_fetchPostData = snk_popup_fetchPostData;
window.snk_popup_openPopup = snk_popup_openPopup;
window.snk_popup_closePopup = snk_popup_closePopup;
