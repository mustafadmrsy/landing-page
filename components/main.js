/**
 * Main JavaScript - Senirkent Blog
 * Her fonksiyon öneki: snk_main_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını tanımla
const snk_main_postsContainer = document.getElementById('snk_postsContainer');
const snk_main_filterButtons = document.querySelectorAll('.snk-filter-btn');
const snk_main_filterNewest = document.getElementById('snk_filterNewest');
const snk_main_filterPopular = document.getElementById('snk_filterPopular');

// Blog yazılarının tutulacağı dizi
let snk_main_blogPosts = [];
// Aktif filtreleme türü
let snk_main_activeFilter = 'newest';

/**
 * Sayfa yüklendiğinde çalışacak fonksiyonlar
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Main.js yüklendi");
    
    // DOM elemanlarını tekrar tanımla (lazy loading için güvenlik)
    const postsContainer = document.getElementById('snk_postsContainer');
    const filterNewest = document.getElementById('snk_filterNewest');
    const filterPopular = document.getElementById('snk_filterPopular');
    const sidebarPopular = document.getElementById('snk_sidebarPopular');
    
    console.log("Main elemanları:", {postsContainer, filterNewest, filterPopular, sidebarPopular});
    
    // Blog yazılarını yükle
    snk_main_loadBlogPosts();
    
    // Filtreleme butonları için olay dinleyicileri ekle
    if (filterNewest && filterPopular) {
        snk_main_setupFilterButtons();
    }
    
    // Sidebar'daki popüler linki için olay dinleyicisi
    if (sidebarPopular) {
        sidebarPopular.addEventListener('click', (e) => {
            e.preventDefault(); // Sayfanın yenilenmesini engelle
            
            // Popüler filtreyi aktifleştir
            if (filterPopular) {
                filterPopular.click(); // Popüler filtresine tıklamayı simüle et
            } else {
                // Popüler filtresi bulunamazsa manuel olarak uygula
                snk_main_activeFilter = 'popular';
                
                // UI güncelleme
                document.querySelectorAll('.snk-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.id === 'snk_filterPopular') {
                        btn.classList.add('active');
                    }
                });
                
                // Blog yazılarını filtrele ve göster
                snk_main_filterPosts();
            }
            
            // Sidebar link'lerinin aktif durumunu güncelle
            document.querySelectorAll('.snk-sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            sidebarPopular.classList.add('active');
        });
    }
    
    // Şifre görünürlük butonunu ayarla
    snk_main_setupPasswordToggle();
    
    // Giriş/Kayıt form geçişlerini ayarla
    snk_main_setupAuthFormToggles();
    
    // Login popup kapatma butonunu ayarla
    snk_main_setupLoginPopupClose();
});

/**
 * Blog yazılarını JSON dosyasından yükler
 */
function snk_main_loadBlogPosts() {
    console.log('Blog yazıları yükleniyor...');
    
    // Yükleniyor mesajını göster
    const container = document.getElementById('snk_postsContainer');
    if (!container) {
        console.error('Blog yazıları konteyneri bulunamadı');
        return;
    }
    
    container.innerHTML = `
        <div class="snk-loading">
            <i class="fas fa-spinner fa-spin"></i> Blog yazıları yükleniyor...
        </div>
    `;
    
    // Önce localStorage'dan kullanıcı yazılarını al
    const localPosts = JSON.parse(localStorage.getItem('snk_blog_posts') || '[]');
    console.log('LocalStorage\'dan yüklenen yazı sayısı:', localPosts.length);
    
    // Daha sonra JSON dosyasından varsayılan yazıları yükle
    fetch('../utils/blogPosts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Blog yazıları yüklenemedi');
            }
            return response.json();
        })
        .then(data => {
            console.log("Blog verileri yüklendi:", data.posts.length);
            
            // Blog yazılarını sakla
            snk_main_blogPosts = [...localPosts, ...data.posts];
            
            // Yazıları ekrana göster
            snk_main_onBlogPostsLoaded(snk_main_blogPosts);
        })
        .catch(error => {
            console.error('Blog yazıları yükleme hatası:', error);
            if (snk_main_postsContainer) {
                snk_main_postsContainer.innerHTML = `
                    <div class="snk-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                    </div>
                `;
            }
        });
}

/**
 * Blog yazılarının yüklenmesi tamamlandığında çağrılacak işlev
 * @param {Array} posts - Yüklenen blog yazıları dizisi
 */
function snk_main_onBlogPostsLoaded(posts) {
    // Sadece onaylanmış postları filtrele
    const approvedPosts = posts.filter(post => post.status === 'approved' || !post.status);
    
    // Tüm gönderileri göster
    snk_main_displayBlogPosts(approvedPosts);
    
    // En popüler yazıları göster
    snk_main_displayPopularPosts(approvedPosts, snk_main_activeFilter);
}

/**
 * Filtreleme butonlarını ayarla
 */
function snk_main_setupFilterButtons() {
    const newestBtn = document.getElementById('snk_filterNewest');
    const popularBtn = document.getElementById('snk_filterPopular');
    
    if (newestBtn && popularBtn) {
        newestBtn.addEventListener('click', () => {
            snk_main_activeFilter = 'newest';
            newestBtn.classList.add('active');
            popularBtn.classList.remove('active');
            const sortedPosts = [...snk_main_blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
            snk_main_displayBlogPosts(sortedPosts);
            snk_main_displayPopularPosts(sortedPosts, 'newest');
        });
        
        popularBtn.addEventListener('click', () => {
            snk_main_activeFilter = 'popular';
            popularBtn.classList.add('active');
            newestBtn.classList.remove('active');
            const sortedPosts = [...snk_main_blogPosts].sort((a, b) => b.views - a.views);
            snk_main_displayBlogPosts(sortedPosts);
            snk_main_displayPopularPosts(sortedPosts, 'popular');
        });
    }
}

/**
 * Blog kartları oluşturma fonksiyonu
 * @param {Array} posts - Blog gönderileri dizisi
 * @param {HTMLElement} container - Blog kartlarının ekleneceği konteyner
 */
function snk_main_createBlogCards(posts, container) {
    if (!container) {
        console.error("Blog kartları için konteyner bulunamadı");
        return;
    }
    
    // Konteyner içeriğini temizle
    container.innerHTML = '';
    
    // Her bir gönderi için kart oluştur
    posts.forEach(post => {
        // Blog kartı öğesi oluştur
        const cardElement = document.createElement('div');
        cardElement.className = 'snk-blog-card';
        cardElement.dataset.postId = post.id;
        
        // Kart içeriği HTML'i
        cardElement.innerHTML = `
            <div class="snk-blog-card-image">
                <img src="${post.imageSrc || '../assets/post-img-default.jpg'}" alt="${post.title}">
            </div>
            <div class="snk-blog-card-content">
                <div class="snk-blog-card-categories">
                    ${post.categories.map(cat => `<span class="snk-blog-category">${cat}</span>`).join('')}
                </div>
                <h3 class="snk-blog-card-title">${post.title}</h3>
                <p class="snk-blog-card-summary">${post.summary}</p>
                <div class="snk-blog-card-meta">
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                    <span><i class="fas fa-eye"></i> ${post.views} Okunma</span>
                </div>
                <div class="snk-post-actions">
                    <button class="snk-action-button snk-like-button" data-post-id="${post.id}">
                        <i class="far fa-heart"></i> <span class="snk-like-count">0</span> Beğen
                    </button>
                    <button class="snk-action-button snk-comment-button" data-post-id="${post.id}">
                        <i class="far fa-comment"></i> Yorum Yap
                    </button>
                    <button class="snk-action-button snk-share-button" data-post-id="${post.id}">
                        <i class="far fa-share-square"></i> Paylaş
                    </button>
                </div>
                <div class="snk-blog-card-read-more">
                    <button class="snk-blog-read-more-btn" data-post-id="${post.id}">
                        Devamını Oku <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Kartı konteyner'a ekle
        container.appendChild(cardElement);
        
        // Kart etkileşimlerini ayarla
        snk_main_setupPostInteractions(cardElement, post);
    });
}

/**
 * Blog kartları için etkileşimleri ayarlayan fonksiyon
 * @param {HTMLElement} postElement - Post elementi
 * @param {Object} postData - Post verisi
 */
function snk_main_setupPostInteractions(postElement, postData) {
    // Devamını Oku butonu
    const readMoreBtn = postElement.querySelector('.snk-blog-read-more-btn');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', function(event) {
            event.preventDefault();
            const postId = parseInt(this.dataset.postId);
            snk_main_showBlogPopup(postId);
        });
    }
    
    // Beğeni butonu
    const likeButton = postElement.querySelector('.snk-like-button');
    if (likeButton) {
        likeButton.addEventListener('click', function(event) {
            event.preventDefault();
            SNK_CommentSystem.toggleLike(this);
        });
    }
    
    // Yorum butonu
    const commentButton = postElement.querySelector('.snk-comment-button');
    if (commentButton) {
        commentButton.addEventListener('click', function(event) {
            event.preventDefault();
            const postId = this.getAttribute('data-post-id');
            SNK_CommentSystem.openCommentModal(postId);
        });
    }
    
    // Paylaş butonu
    const shareButton = postElement.querySelector('.snk-share-button');
    if (shareButton) {
        shareButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation(); // Tıklama olayının yayılmasını önle
            const postId = this.getAttribute('data-post-id');
            console.log("Paylaş butonuna tıklandı. Post ID:", postId);
            
            const post = snk_main_blogPosts.find(p => p.id === postId);
            
            if (post) {
                // Paylaş fonksiyonunu çağır
                SNK_CommentSystem.sharePost(postId, event);
            }
        });
    }
}

/**
 * Blog gönderilerini görüntüleme fonksiyonu (Reddit tarzı yeni tasarım için)
 * @param {Array} posts - Görüntülenecek blog gönderileri dizisi
 */
function snk_main_displayBlogPosts(posts) {
    console.log("Blog gönderileri görüntüleniyor:", posts);
    
    // HTML içeriğini hazırla
    let postsHTML = '';
    
    if (posts.length === 0) {
        postsHTML = `
            <div class="snk-empty-state">
                <i class="fas fa-search"></i>
                <p>Gösterilecek blog yazısı bulunamadı.</p>
            </div>
        `;
    } else {
        posts.forEach(post => {
            // Gönderi açıklamasını 150 karakterle sınırla
            const shortDescription = post.summary.length > 150
                ? post.summary.substring(0, 150) + '...'
                : post.summary;
                
            postsHTML += `
                <div class="snk-blog-card" data-post-id="${post.id}">
                    <div class="snk-blog-image">
                        <img src="${post.image || 'assets/images/default-post.jpg'}" alt="${post.title}">
                    </div>
                    <div class="snk-blog-content">
                        <div class="snk-blog-header">
                            <div class="snk-blog-meta">
                                <span class="snk-blog-category">${post.category}</span>
                                <span class="snk-blog-author"><i class="fas fa-user"></i> ${post.author || 'Anonim'}</span>
                                <span class="snk-blog-date"><i class="fas fa-calendar-alt"></i> ${post.date || 'Tarih bilgisi yok'}</span>
                            </div>
                            <h2 class="snk-blog-title">${post.title}</h2>
                        </div>
                        <p class="snk-blog-description">${shortDescription}</p>
                        <div class="snk-blog-actions">
                            <button class="snk-action-btn snk-like-button" data-post-id="${post.id}">
                                <i class="far fa-thumbs-up"></i> Beğen
                                <span class="snk-like-count">${post.likes || 0}</span>
                            </button>
                            <button class="snk-action-btn snk-comment-button" data-post-id="${post.id}">
                                <i class="far fa-comment"></i> Yorum Yap
                            </button>
                            <button class="snk-action-btn snk-share-button" data-post-id="${post.id}">
                                <i class="far fa-share-square"></i> Paylaş
                            </button>
                            <button class="snk-read-more-btn snk-read-more" data-post-id="${post.id}">
                                Devamını Oku <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    // İçeriği DOM'a ekle
    if (snk_main_postsContainer) {
        snk_main_postsContainer.innerHTML = postsHTML;
        
        // Etkileşimleri kur
        snk_main_setupPostInteractions(snk_main_postsContainer);
    }
}

/**
 * Yazı etkileşimlerini kuran fonksiyon (yeni Reddit tarzı tasarım için)
 * @param {HTMLElement} container - İçinde etkileşimli elemanların olduğu konteyner
 */
function snk_main_setupPostInteractions(container) {
    // Devamını Oku butonları
    const readMoreButtons = container.querySelectorAll('.snk-read-more');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const postId = parseInt(this.dataset.postId);
            console.log("Devamını Oku butonuna tıklandı. Post ID:", postId);
            snk_main_showBlogPopup(postId);
        });
    });
    
    // Beğen butonları
    const likeButtons = container.querySelectorAll('.snk-like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            SNK_CommentSystem.toggleLike(this);
        });
    });
    
    // Yorum butonları
    const commentButtons = container.querySelectorAll('.snk-comment-button');
    commentButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const postId = parseInt(this.dataset.postId);
            console.log("Yorum butonuna tıklandı. Post ID:", postId);
            
            // Popup içinde yorum bölümüne odaklanma
            SNK_CommentSystem.openCommentModal(postId);
        });
    });
    
    // Paylaş butonları
    const shareButtons = container.querySelectorAll('.snk-share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation(); // Tıklama olayının yayılmasını önle
            const postId = parseInt(this.dataset.postId);
            console.log("Paylaş butonuna tıklandı. Post ID:", postId);
            
            const post = snk_main_blogPosts.find(p => p.id === postId);
            if (post) {
                // Paylaş fonksiyonunu çağır
                SNK_CommentSystem.sharePost(postId, event);
            }
        });
    });
}

/**
 * Blog popup'ını gösterme fonksiyonu (Reddit tarzı tasarım için yenilendi)
 * @param {number} postId - Gösterilecek yazının ID'si
 * @param {boolean} focusComments - Yorum bölümüne odaklanılacak mı
 */
function snk_main_showBlogPopup(postId, focusComments = false) {
    console.log("Blog popup gösteriliyor. Post ID:", postId);
    
    // İlgili gönderiyi bul
    const post = snk_main_blogPosts.find(p => p.id === postId);
    
    if (!post) {
        console.error("Gösterilen yazı bulunamadı. ID:", postId);
        return;
    }
    
    // Popup HTML'ini oluştur
    const popupHTML = `
        <div class="snk-popup-overlay">
            <div class="snk-popup-content">
                <button class="snk-popup-close">&times;</button>
                <article class="snk-popup-article">
                    <header class="snk-popup-header">
                        <div class="snk-popup-meta">
                            <span class="snk-popup-category">${post.category}</span>
                            <span class="snk-popup-author">Yazar: ${post.author || 'Anonim'}</span>
                            <span class="snk-popup-date">${post.date || 'Tarih bilgisi yok'}</span>
                            <span class="snk-popup-views"><i class="far fa-eye"></i> ${post.views || 0} görüntülenme</span>
                        </div>
                        <h1 class="snk-popup-title">${post.title}</h1>
                    </header>
                    
                    <div class="snk-popup-featured-image">
                        <img src="${post.image || 'assets/images/default-post.jpg'}" alt="${post.title}">
                    </div>
                    
                    <div class="snk-popup-content-body">
                        ${post.content || post.summary}
                    </div>
                    
                    <footer class="snk-popup-footer">
                        <div class="snk-popup-tags">
                            ${post.tags ? post.tags.map(tag => `<span class="snk-popup-tag">#${tag}</span>`).join('') : ''}
                        </div>
                        
                        <div class="snk-popup-actions">
                            <button class="snk-popup-action-btn snk-popup-like">
                                <i class="far fa-thumbs-up"></i> Beğen
                                <span class="snk-popup-like-count">${post.likes || 0}</span>
                            </button>
                            <button class="snk-popup-action-btn snk-popup-share">
                                <i class="far fa-share-square"></i> Paylaş
                            </button>
                        </div>
                    </footer>
                    
                    <div class="snk-popup-comments" id="snk-popup-comments">
                        <h3 class="snk-comments-title">Yorumlar</h3>
                        <div class="snk-comment-form">
                            <textarea placeholder="Yorumunuzu buraya yazın..." class="snk-comment-textarea" id="snk_comment_textarea_${postId}"></textarea>
                            <button class="snk-comment-submit" id="snk_comment_submit_${postId}">Gönder</button>
                            <button class="snk-comment-cancel" id="snk_comment_cancel_${postId}">İptal</button>
                        </div>
                        <div class="snk-comments-list">
                            ${post.comments && post.comments.length > 0 
                                ? post.comments.map(comment => `
                                    <div class="snk-comment">
                                        <div class="snk-comment-avatar">
                                            <img src="${comment.avatar || 'assets/images/default-avatar.jpg'}" alt="${comment.author}">
                                        </div>
                                        <div class="snk-comment-content">
                                            <div class="snk-comment-header">
                                                <span class="snk-comment-author">${comment.author}</span>
                                                <span class="snk-comment-date">${comment.date}</span>
                                            </div>
                                            <div class="snk-comment-text">${comment.text}</div>
                                        </div>
                                    </div>
                                `).join('') 
                                : '<div class="snk-no-comments">Henüz yorum yapılmamış. İlk yorumu sen yap!</div>'
                            }
                        </div>
                    </div>
                </article>
            </div>
        </div>
    `;
    
    // Popup'ı DOM'a ekle
    const popupElement = document.createElement('div');
    popupElement.innerHTML = popupHTML;
    document.body.appendChild(popupElement.firstElementChild);
    
    // Popup kapatma olaylarını ekle
    const popup = document.querySelector('.snk-popup-overlay');
    const closeButton = popup.querySelector('.snk-popup-close');
    
    // Kapatma butonuna tıklama
    closeButton.addEventListener('click', function() {
        document.body.removeChild(popup);
    });
    
    // Overlay'e tıklama ile kapatma
    popup.addEventListener('click', function(event) {
        if (event.target === popup) {
            document.body.removeChild(popup);
        }
    });
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
    });
    
    // Yorumlara odaklan (eğer isteniyorsa)
    if (focusComments && document.getElementById('snk-popup-comments')) {
        document.getElementById('snk-popup-comments').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            document.querySelector('.snk-comment-textarea').focus();
        }, 500);
    }
}

/**
 * Blog yazılarını aktif filtreye göre filtreler
 */
function snk_main_filterPosts() {
    let filteredPosts = [...snk_main_blogPosts]; // Tüm yazıların bir kopyasını oluşt
    
    console.log("Yazılar filtreleniyor:", snk_main_activeFilter);
    
    // Filtreleme türüne göre sırala
    switch (snk_main_activeFilter) {
        case 'newest':
            // Tarihe göre en yeniden eskiye sırala
            filteredPosts.sort((a, b) => {
                const dateA = new Date(a.date.split('.').reverse().join('-'));
                const dateB = new Date(b.date.split('.').reverse().join('-'));
                return dateB - dateA;
            });
            break;
            
        case 'popular':
            // Görüntülenme sayısına göre sırala
            filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
    }
    
    // Filtrelenmiş yazıları göster
    snk_main_displayBlogPosts(filteredPosts);
    snk_main_displayPopularPosts(filteredPosts, snk_main_activeFilter);
}

/**
 * En çok okunan yazıları sağ sütunda göster
 * @param {Array} posts - Blog yazıları dizisi
 * @param {string} filterType - Filtreleme türü (newest/popular)
 */
function snk_main_displayPopularPosts(posts, filterType = 'newest') {
    const popularPostsContainer = document.getElementById('snk_popularPosts');
    
    if (!popularPostsContainer) return;
    
    // Filtreleme işlemi
    let sortedPosts;
    
    if (filterType === 'popular') {
        // En popüler yazılar - görüntülenme sayısına göre sırala
        sortedPosts = [...posts].sort((a, b) => b.views - a.views);
    } else if (filterType === 'newest') {
        // En yeni yazılar - tarihe göre sırala
        sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        // Varsayılan olarak görüntülenme sayısına göre sırala
        sortedPosts = [...posts].sort((a, b) => b.views - a.views);
    }
    
    // En popüler/yeni 5 yazıyı al
    const topPosts = sortedPosts.slice(0, 5);
    
    // HTML içeriğini hazırla
    let popularPostsHTML = '';
    
    // Widget başlığını filtre tipine göre güncelle
    const widgetTitle = document.querySelector('.snk-sidebar-widget-title');
    if (widgetTitle) {
        if (filterType === 'popular') {
            widgetTitle.innerHTML = '<i class="fas fa-fire"></i> En Popüler Yazılar';
        } else if (filterType === 'newest') {
            widgetTitle.innerHTML = '<i class="fas fa-clock"></i> En Yeni Yazılar';
        } else {
            widgetTitle.innerHTML = '<i class="fas fa-star"></i> En Çok Okunan Yazılar';
        }
    }
    
    topPosts.forEach(post => {
        popularPostsHTML += `
            <div class="snk-popular-post-item" data-post-id="${post.id}">
                <div class="snk-popular-post-meta">
                    <span class="snk-popular-post-category">${post.category}</span>
                    <span class="snk-popular-post-views">
                        ${filterType === 'newest' ? 
                            `<i class="fas fa-calendar-alt"></i> ${new Date(post.date).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short'})}` : 
                            `<i class="fas fa-eye"></i> ${post.views.toLocaleString()}`
                        }
                    </span>
                </div>
                <h4 class="snk-popular-post-title">${post.title}</h4>
            </div>
        `;
    });
    
    // Eğer hiç yazı yoksa
    if (topPosts.length === 0) {
        popularPostsHTML = '<div class="snk-no-posts">Henüz gösterilecek yazı bulunmuyor.</div>';
    }
    
    // İçeriği DOM'a ekle
    popularPostsContainer.innerHTML = popularPostsHTML;
    
    // Tıklama olaylarını ekle
    const popularPostItems = popularPostsContainer.querySelectorAll('.snk-popular-post-item');
    
    popularPostItems.forEach(item => {
        item.addEventListener('click', function() {
            const postId = parseInt(this.getAttribute('data-post-id'));
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                // İlgili blog yazısını ana içerik alanında göster
                const postsContainer = document.getElementById('snk_postsContainer');
                
                if (postsContainer) {
                    // Tüm yazıları gizle
                    const allPosts = document.querySelectorAll('.snk-post');
                    allPosts.forEach(postEl => {
                        postEl.style.display = 'none';
                    });
                    
                    // Seçilen yazıyı bul
                    const targetPost = document.querySelector(`.snk-post[data-post-id="${postId}"]`);
                    
                    if (targetPost) {
                        // Yazıyı göster
                        targetPost.style.display = 'flex';
                        
                        // İçeriğini genişlet
                        targetPost.classList.add('expanded');
                        const contentElement = targetPost.querySelector('.snk-post-summary');
                        
                        if (contentElement) {
                            // Tam içeriği oluştur
                            const fullContentHTML = `
                                <div class="snk-post-full-content">
                                    ${post.content}
                                    ${post.tags && post.tags.length ? `
                                        <div class="snk-post-tags">
                                            ${post.tags.map(tag => `<span class="snk-tag">#${tag}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                            
                            // İçeriği ekle
                            contentElement.innerHTML = fullContentHTML;
                        }
                        
                        // Sayfayı ilgili yazıya kaydır
                        targetPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // İlgili "Devamını Oku" butonunu "Daralt" olarak değiştir
                        const readMoreBtn = targetPost.querySelector('.snk-post-action.snk-read-more');
                        if (readMoreBtn) {
                            readMoreBtn.innerHTML = '<i class="fas fa-angle-up"></i> Daralt';
                            readMoreBtn.dataset.expanded = 'true';
                        }
                        
                        // Filtre başlığını güncelle
                        const contentTitle = document.querySelector('.snk-content-title');
                        if (contentTitle) {
                            contentTitle.textContent = 'Seçili Yazı';
                        }
                    } else {
                        // Yazı bulunamadıysa tüm yazıları göster
                        allPosts.forEach(postEl => {
                            postEl.style.display = 'flex';
                        });
                        
                        // İlgili yazıyı oluştur ve ekle
                        snk_main_createAndDisplaySinglePost(post, postsContainer);
                    }
                }
            }
        });
    });
}

/**
 * Tek bir blog yazısı oluşturup ekranda gösterir
 * @param {Object} post - Gösterilecek blog yazısı verisi
 * @param {HTMLElement} container - Yazının ekleneceği container
 */
function snk_main_createAndDisplaySinglePost(post, container) {
    // İlk önce container içeriğini temizle
    container.innerHTML = '';
    
    // Yazı HTML'ini oluştur
    const postHTML = `
        <div class="snk-post expanded" data-post-id="${post.id}">
            <div class="snk-post-content-wrapper">
                <div class="snk-post-main">
                    <div class="snk-post-header">
                        <div class="snk-post-info">
                            <span class="snk-post-category">r/${post.category}</span>
                            <span class="snk-post-author">Posted by u/${post.author}</span>
                            <span class="snk-post-date">${new Date(post.date).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                        </div>
                        <h3 class="snk-post-title">${post.title}</h3>
                    </div>
                    ${post.image ? `<div class="snk-post-image"><img src="${post.image}" alt="${post.title}"></div>` : ''}
                    <div class="snk-post-summary">
                        <div class="snk-post-full-content">
                            ${post.content}
                            ${post.tags && post.tags.length ? `
                                <div class="snk-post-tags">
                                    ${post.tags.map(tag => `<span class="snk-tag">#${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="snk-post-footer">
                        <button class="snk-post-action snk-read-more" data-post-id="${post.id}" data-expanded="true">
                            <i class="fas fa-angle-up"></i> Daralt
                        </button>
                        <button class="snk-post-action">
                            <i class="fas fa-comment-alt"></i> Yorumlar
                        </button>
                        <button class="snk-post-action">
                            <i class="fas fa-share"></i> Paylaş
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Yazıyı container'a ekle
    container.insertAdjacentHTML('afterbegin', postHTML);
    
    // Kategori filtresini kontrol et
    if (typeof updateCategoryVisibility === 'function') {
        updateCategoryVisibility();
    }
    
    // Etkileşim fonksiyonlarını ayarla - ZORUNLU
    snk_main_setupPostInteractions(container, post);
    
    // Başarı mesajı göster
    alert('Blog yazınız başarıyla oluşturuldu!');
}

/**
 * Blog yazılarında yorum bölümünü gösterir
 * @param {number} postId - Yorum yapılacak yazının ID'si
 */
function snk_main_toggleComments(postId) {
    const post = snk_main_blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Mevcut yorum bölümünü bul
    const postElement = document.querySelector(`.snk-post[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    // Varsa mevcut yorum bölümünü kontrol et
    let commentsSection = postElement.querySelector('.snk-post-comments');
    
    // Yorum bölümü varsa kapat, yoksa aç
    if (commentsSection) {
        if (commentsSection.classList.contains('active')) {
            commentsSection.classList.remove('active');
            setTimeout(() => commentsSection.remove(), 300);
        } else {
            commentsSection.classList.add('active');
        }
        return;
    }
    
    // Örnek yorumlar (gerçek uygulamada API'den gelecek)
    const comments = [
        {
            id: 1,
            author: 'mustafadmrsy',
            date: '2025-03-02',
            content: 'Harika bir yazı olmuş! Özellikle teknik detayları açıklamanız çok faydalı oldu.',
            likes: 5
        },
        {
            id: 2,
            author: 'senirkentli',
            date: '2025-03-03',
            content: 'Konuyu çok güzel özetlemişsiniz. Acaba kaynaklarınızı da paylaşabilir misiniz?',
            likes: 3
        },
        {
            id: 3,
            author: 'tekyazilimci',
            date: '2025-03-05',
            content: 'Ben de benzer bir proje üzerinde çalışıyorum. Bazı noktalarda zorlandım, bu yazı tam ihtiyacım olandı!',
            likes: 8
        }
    ];
    
    // Yorum bölümü oluştur
    commentsSection = document.createElement('div');
    commentsSection.className = 'snk-post-comments active';
    commentsSection.id = `snk_comment_section_${postId}`;
    
    // Yorumlar başlığı
    const headerHTML = `
        <div class="snk-comments-header" id="snk_comment_header_${postId}">
            <h3 class="snk-comments-title">
                <i class="fas fa-comment-alt"></i> Yorumlar
                <span class="snk-comments-count">${comments.length}</span>
            </h3>
            <button class="snk-comments-close" id="snk_comment_close_${postId}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Yorum listesi
    let commentsHTML = `<div class="snk-comments-list" id="snk_comment_list_${postId}">`;
    
    comments.forEach(comment => {
        commentsHTML += `
            <div class="snk-comment" data-comment-id="${comment.id}" id="snk_comment_item_${postId}_${comment.id}">
                <div class="snk-comment-header">
                    <span class="snk-comment-author">
                        <i class="fas fa-user-circle"></i> ${comment.author}
                    </span>
                    <span class="snk-comment-date">${new Date(comment.date).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                <div class="snk-comment-content">
                    ${comment.content}
                </div>
                <div class="snk-comment-actions">
                    <button class="snk-comment-action snk-comment-like" id="snk_comment_like_${postId}_${comment.id}">
                        <i class="fas fa-thumbs-up"></i> Beğen (${comment.likes})
                    </button>
                    <button class="snk-comment-action snk-comment-reply" id="snk_comment_reply_${postId}_${comment.id}">
                        <i class="fas fa-reply"></i> Yanıtla
                    </button>
                </div>
            </div>
        `;
    });
    
    commentsHTML += '</div>';
    
    // Yeni yorum formu
    const formHTML = `
        <div class="snk-new-comment" id="snk_comment_form_container_${postId}">
            <form class="snk-comment-form" id="snk_comment_form_${postId}">
                <textarea placeholder="Yorumunuzu buraya yazın..." class="snk-comment-textarea" id="snk_comment_textarea_${postId}"></textarea>
                <div class="snk-comment-form-actions">
                    <button type="button" class="snk-comment-btn snk-comment-cancel" id="snk_comment_cancel_${postId}">
                        İptal
                    </button>
                    <button type="submit" class="snk-comment-btn snk-comment-submit" id="snk_comment_submit_${postId}">
                        Yorum Yap
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Tüm HTML'i bir araya getir
    commentsSection.innerHTML = headerHTML + commentsHTML + formHTML;
    
    // Yorum bölümünü blog yazısının sonuna ekle
    postElement.appendChild(commentsSection);
    
    // Kapatma butonuna tıklama
    const closeBtn = document.getElementById(`snk_comment_close_${postId}`);
    closeBtn.addEventListener('click', () => {
        commentsSection.classList.remove('active');
        setTimeout(() => commentsSection.remove(), 300);
    });
    
    // İptal butonuna tıklama
    const cancelBtn = document.getElementById(`snk_comment_cancel_${postId}`);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const textarea = document.getElementById(`snk_comment_textarea_${postId}`);
            if (textarea) {
                textarea.value = '';
            }
        });
    }
    
    // Form gönderme olayı
    const commentForm = document.getElementById(`snk_comment_form_${postId}`);
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const textarea = document.getElementById(`snk_comment_textarea_${postId}`);
            if (textarea && textarea.value.trim()) {
                // Yeni yorum oluştur (gerçek uygulamada API'ye gönderilecek)
                alert('Yorumunuz başarıyla gönderildi!');
                textarea.value = '';
            }
        });
    }
    
    // Yorum beğenme butonlarına tıklama
    const likeButtons = commentsSection.querySelectorAll('.snk-comment-like');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = parseInt(this.closest('.snk-comment').getAttribute('data-comment-id'));
            snk_main_likeComment(commentId, this);
        });
    });
    
    // Yorum yanıtlama butonlarına tıklama
    const replyButtons = commentsSection.querySelectorAll('.snk-comment-reply');
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = parseInt(this.closest('.snk-comment').getAttribute('data-comment-id'));
            snk_main_replyToComment(commentId, this);
        });
    });
}

/**
 * Blog yazılarında bir yorumu beğenmek için kullanılır
 * @param {number} commentId - Beğenilecek yorumun ID'si
 * @param {HTMLElement} button - Tıklanan beğeni butonu
 */
function snk_main_likeComment(commentId, button) {
    const commentElement = document.querySelector(`.snk-comment[data-comment-id="${commentId}"]`);
    if (!commentElement) return;
    
    // Butondaki beğeni sayısını al
    const likeText = button.textContent;
    const likeCount = parseInt(likeText.match(/\d+/)[0]);
    
    // Eğer buton zaten beğenilmişse, beğeniyi kaldır
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        button.innerHTML = `<i class="fas fa-thumbs-up"></i> Beğen (${likeCount - 1})`;
    } else {
        // Beğeni ekle
        button.classList.add('active');
        button.innerHTML = `<i class="fas fa-thumbs-up"></i> Beğen (${likeCount + 1})`;
    }
    
    // Animasyon efekti
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
    
    // Gerçek uygulamada burada API çağrısı yapılırdı
    console.log(`Yorum ID: ${commentId} beğeni durumu değiştirildi.`);
}

/**
 * Blog yazılarında bir yoruma yanıt verme formunu gösterir
 * @param {number} commentId - Yanıtlanacak yorumun ID'si
 * @param {HTMLElement} button - Tıklanan yanıtla butonu
 */
function snk_main_replyToComment(commentId, button) {
    const commentElement = document.querySelector(`.snk-comment[data-comment-id="${commentId}"]`);
    if (!commentElement) return;
    
    // Post ID'sini al (yorum elementinden)
    const postId = commentElement.closest('.snk-post-comments').id.replace('snk_comment_section_', '');
    
    // Varsa mevcut yanıt formunu kontrol et
    let replyForm = commentElement.querySelector('.snk-reply-form-container');
    
    // Form varsa kaldır (toggle işlevi)
    if (replyForm) {
        replyForm.remove();
        return;
    }
    
    // Yanıt formunu oluştur
    replyForm = document.createElement('div');
    replyForm.className = 'snk-reply-form-container';
    replyForm.id = `snk_reply_form_container_${postId}_${commentId}`;
    
    // Formun HTML içeriğini oluştur
    replyForm.innerHTML = `
        <form class="snk-reply-form" id="snk_reply_form_${postId}_${commentId}">
            <textarea placeholder="Yanıtınızı buraya yazın..." class="snk-reply-textarea" id="snk_reply_textarea_${postId}_${commentId}"></textarea>
            <div class="snk-reply-form-actions">
                <button type="button" class="snk-reply-btn snk-reply-cancel" id="snk_reply_cancel_${postId}_${commentId}">
                    İptal
                </button>
                <button type="submit" class="snk-reply-btn snk-reply-submit" id="snk_reply_submit_${postId}_${commentId}">
                    Yanıtla
                </button>
            </div>
        </form>
    `;
    
    // Yanıt formunu yoruma ekle
    commentElement.appendChild(replyForm);
    
    // Form animasyonu
    setTimeout(() => {
        replyForm.style.maxHeight = '200px';
        replyForm.style.opacity = '1';
    }, 10);
    
    // Textarea'ya otomatik odaklanma
    const textarea = document.getElementById(`snk_reply_textarea_${postId}_${commentId}`);
    textarea.focus();
    
    // İptal butonuna tıklama
    const cancelBtn = document.getElementById(`snk_reply_cancel_${postId}_${commentId}`);
    cancelBtn.addEventListener('click', () => {
        replyForm.style.maxHeight = '0';
        replyForm.style.opacity = '0';
        setTimeout(() => replyForm.remove(), 300);
    });
    
    // Yanıt formunun gönderilmesi
    const form = document.getElementById(`snk_reply_form_${postId}_${commentId}`);
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const replyText = textarea.value.trim();
        if (replyText) {
            // Yeni yanıt yorumunu oluştur
            const newReply = document.createElement('div');
            newReply.className = 'snk-comment snk-reply';
            
            // Rastgele bir ID oluştur (gerçek uygulamada API'den gelir)
            const replyId = Math.floor(Math.random() * 1000) + commentId + 100;
            newReply.id = `snk_comment_reply_item_${postId}_${replyId}`;
            newReply.dataset.commentId = replyId;
            
            // Yanıt içeriğini oluştur
            newReply.innerHTML = `
                <div class="snk-comment-header">
                    <span class="snk-comment-author">
                        <i class="fas fa-user-circle"></i> Ziyaretçi
                    </span>
                    <span class="snk-comment-date">${new Date().toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                </div>
                <div class="snk-comment-content">
                    ${replyText}
                </div>
                <div class="snk-comment-actions">
                    <button class="snk-comment-action snk-comment-like" id="snk_comment_like_${postId}_${replyId}">
                        <i class="fas fa-thumbs-up"></i> Beğen (0)
                    </button>
                </div>
            `;
            
            // Yanıtı yorumdan hemen sonra ekle
            commentElement.after(newReply);
            
            // Yeni yanıta beğenme fonksiyonu ekle
            const newLikeButton = document.getElementById(`snk_comment_like_${postId}_${replyId}`);
            newLikeButton.addEventListener('click', function() {
                snk_main_likeComment(replyId, this);
            });
            
            // Formu kapat
            replyForm.remove();
            
            // Gerçek uygulamada burada API çağrısı yapılırdı
            console.log(`Yorum ID: ${commentId}'ye yanıt gönderildi: ${replyText}`);
        }
    });
}

/**
 * Blog yazılarında paylaşım panelini gösterir/gizler
 * @param {number} postId - Paylaşılacak yazının ID'si
 * @param {HTMLElement} button - Tıklanan paylaş butonu
 */
function snk_main_toggleSharePanel(postId, button) {
    const post = snk_main_blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Mevcut paylaşım panelini bul
    const postElement = document.querySelector(`.snk-post[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    // Butona göre pozisyonlanacak panel
    const buttonRect = button.getBoundingClientRect();
    
    // Varsa mevcut paylaşım panelini kontrol et
    let sharePanel = document.querySelector('.snk-share-panel');
    
    // Paylaşım paneli varsa kapat
    if (sharePanel) {
        // Aynı yazının paneli değilse, eskisini kapat
        if (sharePanel.dataset.postId != postId) {
            sharePanel.remove();
        } else {
            // Aynı yazının paneliyse, kapat ve çık
            sharePanel.classList.remove('active');
            setTimeout(() => {
                sharePanel.remove();
                document.removeEventListener('click', handleClickOutside);
            }, 300);
            return;
        }
    }
    
    // Paylaşım URL'i oluştur
    const shareUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;
    
    // Paylaşım paneli oluştur
    sharePanel = document.createElement('div');
    sharePanel.className = 'snk-share-panel active';
    sharePanel.id = `snk_share_panel_${postId}`;
    sharePanel.dataset.postId = postId;
    
    // Paylaşım paneli içeriğini oluştur
    sharePanel.innerHTML = `
        <div class="snk-share-header" id="snk_share_header_${postId}">
            <h3 class="snk-share-title">
                <i class="fas fa-share-alt"></i> Paylaş
            </h3>
            <button class="snk-share-close" id="snk_share_close_${postId}">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="snk-share-buttons" id="snk_share_buttons_${postId}">
            <button class="snk-share-button snk-share-twitter" id="snk_share_twitter_${postId}">
                <i class="fab fa-twitter"></i>
                Twitter
            </button>
            <button class="snk-share-button snk-share-facebook" id="snk_share_facebook_${postId}">
                <i class="fab fa-facebook"></i>
                Facebook
            </button>
            <button class="snk-share-button snk-share-linkedin" id="snk_share_linkedin_${postId}">
                <i class="fab fa-linkedin"></i>
                LinkedIn
            </button>
            <button class="snk-share-button snk-share-whatsapp" id="snk_share_whatsapp_${postId}">
                <i class="fab fa-whatsapp"></i>
                WhatsApp
            </button>
            <button class="snk-share-button snk-share-telegram" id="snk_share_telegram_${postId}">
                <i class="fab fa-telegram"></i>
                Telegram
            </button>
            <button class="snk-share-button snk-share-email" id="snk_share_email_${postId}">
                <i class="fas fa-envelope"></i>
                Email
            </button>
            <div class="snk-share-link" id="snk_share_link_container_${postId}">
                <div class="snk-share-link-input">
                    <input type="text" class="snk-share-url" id="snk_share_url_${postId}" value="${shareUrl}" readonly>
                    <button class="snk-share-copy" id="snk_share_copy_${postId}">Kopyala</button>
                </div>
            </div>
        </div>
    `;
    
    // Paneli sayfaya ekle
    document.body.appendChild(sharePanel);
    
    // Mobil cihaz kontrolü
    const isMobile = window.innerWidth <= 768;
    
    // Paneli konumlandır
    if (!isMobile) {
        // Masaüstü: butona göre konumlandır
        sharePanel.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
        
        // Ekran sınırlarını aşmaması için kontrol
        const panelRect = sharePanel.getBoundingClientRect();
        
        if (buttonRect.right - panelRect.width < 0) {
            // Soldan taşıyorsa, sola hizala
            sharePanel.style.left = `${buttonRect.left + window.scrollX}px`;
            sharePanel.style.right = 'auto';
        } else {
            // Normal durumda, butona göre hizala
            sharePanel.style.right = `${window.innerWidth - buttonRect.right - window.scrollX}px`;
            sharePanel.style.left = 'auto';
        }
    }
    
    // Kapatma butonuna tıklama
    const closeBtn = document.getElementById(`snk_share_close_${postId}`);
    closeBtn.addEventListener('click', () => {
        sharePanel.classList.remove('active');
        setTimeout(() => sharePanel.remove(), 300);
    });
    
    // Link kopyalama butonuna tıklama
    const copyBtn = document.getElementById(`snk_share_copy_${postId}`);
    const urlInput = document.getElementById(`snk_share_url_${postId}`);
    
    copyBtn.addEventListener('click', () => {
        urlInput.select();
        document.execCommand('copy');
        
        // Kopyalandı efekti
        copyBtn.textContent = 'Kopyalandı!';
        copyBtn.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            copyBtn.textContent = 'Kopyala';
            copyBtn.style.backgroundColor = '';
        }, 2000);
    });
    
    // Sosyal medya butonlarına tıklama
    const twitterBtn = document.getElementById(`snk_share_twitter_${postId}`);
    twitterBtn.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    const facebookBtn = document.getElementById(`snk_share_facebook_${postId}`);
    facebookBtn.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    const linkedinBtn = document.getElementById(`snk_share_linkedin_${postId}`);
    linkedinBtn.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    const whatsappBtn = document.getElementById(`snk_share_whatsapp_${postId}`);
    whatsappBtn.addEventListener('click', () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`, '_blank');
    });
    
    const telegramBtn = document.getElementById(`snk_share_telegram_${postId}`);
    telegramBtn.addEventListener('click', () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank');
    });
    
    const emailBtn = document.getElementById(`snk_share_email_${postId}`);
    emailBtn.addEventListener('click', () => {
        window.open(`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent('Bu yazıyı okumak isteyebilirsin: ' + shareUrl)}`, '_blank');
    });
    
    // Başka bir yere tıklandığında paneli kapat
    document.addEventListener('click', function handleClickOutside(event) {
        if (!sharePanel.contains(event.target) && event.target !== button) {
            sharePanel.classList.remove('active');
            setTimeout(() => {
                sharePanel.remove();
                document.removeEventListener('click', handleClickOutside);
            }, 300);
        }
    });
}

/**
 * Blog oluşturma popup'ını açar
 */
function snk_main_openCreatePostPopup() {
    console.log("main.js - Blog oluşturma popup açma işlevi çağrıldı");
    // Bu işlevi artık login-handler.js'deki showBlogCreatePopup fonksiyonu yapacak
    // Çakışma olmaması için var olan login-handler fonksiyonunu çağıralım
    const currentUser = JSON.parse(localStorage.getItem('snk_currentUser') || localStorage.getItem('snk_current_user') || '{}');
    
    if (window.showBlogCreatePopup && typeof window.showBlogCreatePopup === 'function') {
        window.showBlogCreatePopup(currentUser);
    } else {
        console.error("showBlogCreatePopup fonksiyonu bulunamadı");
    }
}

/**
 * Yeni blog yazısını en üste ekler ve görüntüyü günceller
 * @param {Object} postData - Blog yazısı verisi
 */
function snk_main_addNewBlogPost(postData) {
    // Gerçek bir uygulamada sunucuya kaydedilecek
    console.log('Yeni Blog Yazısı Eklendi:', postData);
    
    // Blog yazılarını içeren kapsayıcıyı bul - ID ile tam eşleşme sağla
    const postsContainer = document.getElementById('snk_postsContainer');
    if (!postsContainer) {
        console.error('Blog yazıları kapsayıcısı bulunamadı!');
        return;
    }
    
    // Önceki yükleme mesajını kaldır
    const loadingElement = postsContainer.querySelector('.snk-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Blog yazısını global diziye ekle - gerekli entegrasyon için
    postData.views = 0;
    postData.likes = 0;
    postData.comments = [];
    snk_main_blogPosts.unshift(postData);
    
    // Yeni blog yazısı HTML'ini oluştur - mevcut blog yazıları ile aynı yapıda
    const postHTML = `
        <div class="snk-post" data-post-id="${postData.id}" data-category="${postData.category}">
            <div class="snk-post-content-wrapper">
                <div class="snk-post-main">
                    <div class="snk-post-header">
                        <div class="snk-post-info">
                            <span class="snk-post-category">r/${postData.category}</span>
                            <span class="snk-post-author">Posted by u/${postData.author}</span>
                            <span class="snk-post-date">${new Date(postData.date).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                        </div>
                        <h3 class="snk-post-title">${postData.title}</h3>
                    </div>
                    ${postData.image ? `<div class="snk-post-image"><img src="${postData.image}" alt="${postData.title}"></div>` : ''}
                    <div class="snk-post-summary">
                        <div class="snk-post-full-content">
                            ${postData.content}
                            ${postData.tags && postData.tags.length ? `
                                <div class="snk-post-tags">
                                    ${postData.tags.map(tag => `<span class="snk-tag">#${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="snk-post-footer">
                        <button class="snk-post-action snk-read-more" data-post-id="${postData.id}" data-expanded="true">
                            <i class="fas fa-angle-up"></i> Daralt
                        </button>
                        <button class="snk-post-action">
                            <i class="fas fa-comment-alt"></i> Yorumlar
                        </button>
                        <button class="snk-post-action">
                            <i class="fas fa-share"></i> Paylaş
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Yeni yazıyı en başa ekle
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = postHTML;
    const newPostElement = tempDiv.firstElementChild;
    
    if (postsContainer.childElementCount > 0) {
        postsContainer.insertBefore(newPostElement, postsContainer.firstChild);
    } else {
        postsContainer.appendChild(newPostElement);
    }
    
    // Kategori filtresini kontrol et
    if (typeof updateCategoryVisibility === 'function') {
        updateCategoryVisibility();
    }
    
    // Etkileşim fonksiyonlarını ayarla - ZORUNLU
    snk_main_setupPostInteractions(newPostElement, postData);
    
    // Başarı mesajı göster
    alert('Blog yazınız başarıyla oluşturuldu!');
}

/**
 * Yeni eklenen blog yazısı için etkileşimleri ayarlar
 * @param {HTMLElement} postElement - Post elementi
 * @param {Object} postData - Post verisi
 */
function snk_main_setupPostInteractions(postElement, postData) {
    // Oylama butonları için olay dinleyicileri
    const voteButtons = postElement.querySelectorAll('.snk-vote-btn');
    /* Oy verme butonları kaldırıldı
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const voteCount = postElement.querySelector('.snk-vote-count');
            const currentCount = parseInt(voteCount.textContent);
            
            if (this.classList.contains('snk-upvote')) {
                voteCount.textContent = currentCount + 1;
                this.classList.toggle('active');
                postElement.querySelector('.snk-downvote').classList.remove('active');
            } else {
                voteCount.textContent = currentCount - 1;
                this.classList.toggle('active');
                postElement.querySelector('.snk-upvote').classList.remove('active');
            }
        });
    });
    */
    
    // "Devamını Oku" butonu için olay dinleyicisi
    const readMoreBtn = postElement.querySelector('.snk-read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', function() {
            const isExpanded = this.dataset.expanded === 'true';
            const summary = postElement.querySelector('.snk-blog-description');
            
            // Özet elementi bulunamadıysa işleme devam etme
            if (!summary) {
                console.error('Blog özet elementi bulunamadı');
                return;
            }
            
            if (!isExpanded) {
                // Content kontrolü yap, yoksa summary kullan
                const content = postData && postData.content ? postData.content : (postData && postData.summary ? postData.summary : 'İçerik bulunamadı');
                
                // Post içeriğini genişlet
                summary.innerHTML = content;
                
                // Buton metnini değiştir
                this.innerHTML = '<i class="fas fa-angle-up"></i> Küçült';
                this.dataset.expanded = 'true';
                
                // Gradient ve animasyon sınıflarını ekle
                this.classList.add('expanded');
            } else {
                // Summary kontrolü yap
                const summaryText = postData && postData.summary ? postData.summary : 'İçerik bulunamadı';
                
                // Post içeriğini küçült
                summary.innerHTML = summaryText;
                
                // Buton metnini değiştir
                this.innerHTML = '<i class="fas fa-angle-down"></i> Devamını Oku';
                this.dataset.expanded = 'false';
                
                // Gradient ve animasyon sınıflarını kaldır
                this.classList.remove('expanded');
            }
        });
    }
    
    // Yorum butonu için olay dinleyicisi
    const commentBtn = postElement.querySelector('.snk-comment-button');
    if (commentBtn) {
        commentBtn.addEventListener('click', function() {
            const postId = parseInt(this.dataset.postId);
            SNK_CommentSystem.openCommentModal(postId);
        });
    }
    
    // Paylaş butonu için olay dinleyicisi
    const shareBtn = postElement.querySelector('.snk-share-button');
    if (shareBtn) {
        shareBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation(); // Tıklama olayının yayılmasını önle
            const postId = parseInt(this.dataset.postId);
            console.log("Paylaş butonuna tıklandı. Post ID:", postId);
            
            const post = snk_main_blogPosts.find(p => p.id === postId);
            if (post) {
                // Paylaş fonksiyonunu çağır
                SNK_CommentSystem.sharePost(postId, event);
            }
        });
    }
}

/**
 * Kategori adını döndürür
 * @param {string} categoryKey - Kategori anahtarı
 * @returns {string} Kategori adı
 */
function getCategoryName(categoryKey) {
    const categories = {
        'teknoloji': 'Teknoloji',
        'egitim': 'Eğitim',
        'yasam': 'Yaşam',
        'kultursanat': 'Kültür & Sanat',
        'bilim': 'Bilim'
    };
    
    return categories[categoryKey] || categoryKey;
}

/**
 * Metni belirtilen uzunluğa kısaltır
 * @param {string} text - Kısaltılacak metin
 * @param {number} maxLength - Maksimum uzunluk
 * @returns {string} Kısaltılmış metin
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

/**
 * Tarihi formatlar
 * @param {string} dateString - ISO tarih formatı
 * @returns {string} Formatlanmış tarih
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

/**
 * Kategori filtresi değiştiğinde blog yazılarını günceller
 */
function updateCategoryVisibility() {
    const activeCategoryBtn = document.querySelector('.snk-category-btn.active');
    if (!activeCategoryBtn) return; // Aktif kategori butonu yoksa çık
    
    const selectedCategory = activeCategoryBtn.dataset.category;
    const allPosts = document.querySelectorAll('.snk-post');
    
    allPosts.forEach(post => {
        if (selectedCategory === 'all' || post.dataset.category === selectedCategory) {
            post.style.display = 'flex';
        } else {
            post.style.display = 'none';
        }
    });
}

/**
 * Kategori butonuna tıklandığında çalışır
 * @param {Event} event - Tıklama olayı
 * @param {string} category - Kategori değeri
 */
function snk_main_filterByCategory(event, category) {
    // Eski aktif butonu kaldır
    const currentActive = document.querySelector('.snk-category-btn.active');
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    
    // Yeni butonu aktif yap
    event.currentTarget.classList.add('active');
    
    // Blog yazılarını filtrele
    const allPosts = document.querySelectorAll('.snk-post');
    
    allPosts.forEach(post => {
        if (category === 'all' || post.dataset.category === category) {
            post.style.display = 'flex';
        } else {
            post.style.display = 'none';
        }
    });
}

// Kategori butonlarını işlevsel hale getir
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.snk-category-btn');
    
    categoryButtons.forEach(button => {
        const category = button.dataset.category;
        button.addEventListener('click', function(event) {
            snk_main_filterByCategory(event, category);
        });
    });
    
    // "Oluştur" butonu
    const createButton = document.querySelector('.snk-create-btn');
    if (createButton) {
        createButton.addEventListener('click', snk_main_openCreatePostPopup);
    }
});

// Global erişim için
window.snk_main_openCreatePostPopup = snk_main_openCreatePostPopup;

// Giriş formunda şifre görünürlüğünü ayarlamak için
function snk_main_setupPasswordToggle() {
    console.log("Şifre toggle butonu ayarlanıyor");
    
    // Bu fonksiyon document.ready'den sonra çağrıldığında DOM hazır olacak
    // Ancak 500ms sonra tekrar çağırmak en güvenli yol
    setTimeout(() => {
        const passwordToggleBtn = document.getElementById('snk_login_toggle_password');
        
        if (passwordToggleBtn) {
            console.log("Şifre toggle butonu bulundu");
            
            // Mevcut event listener'ları temizle (olası duplikasyonu önlemek için)
            passwordToggleBtn.removeEventListener('click', togglePasswordVisibility);
            
            // Yeni event listener ekle
            passwordToggleBtn.addEventListener('click', togglePasswordVisibility);
        } else {
            console.error("Şifre toggle butonu bulunamadı");
        }
    }, 500);
}

// Şifre görünürlüğünü değiştiren yardımcı fonksiyon
function togglePasswordVisibility(e) {
    console.log("Şifre toggle butonuna tıklandı");
    e.preventDefault(); // Form submit'i önle
    
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) {
        // Şifre görünürlüğünü değiştir
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // İkonu değiştir
        const icon = this.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    } else {
        console.error("Şifre input alanı bulunamadı");
    }
}

// Login popup kapatma butonunu ayarla
function snk_main_setupLoginPopupClose() {
    console.log("Login popup kapatma butonu ayarlanıyor");
    
    // Bir süre bekleyerek DOM'un tam olarak yüklenmesini sağla
    setTimeout(() => {
        const loginCloseBtn = document.getElementById('snk_loginCloseBtn');
        const loginPopup = document.getElementById('snk_loginPopup');
        
        if (loginCloseBtn && loginPopup) {
            console.log("Login popup kapatma butonu bulundu");
            
            // Mevcut event listener'ları temizle (olası duplikasyonu önlemek için)
            loginCloseBtn.removeEventListener('click', closeLoginPopup);
            
            // Yeni event listener ekle
            loginCloseBtn.addEventListener('click', closeLoginPopup);
        } else {
            console.error("Login popup kapatma butonu veya popup bulunamadı:", 
                          {closeBtn: !!loginCloseBtn, popup: !!loginPopup});
        }
    }, 500);
}

// Popup kapatma yardımcı fonksiyonu
function closeLoginPopup(e) {
    console.log("Login kapatma butonuna tıklandı");
    e.preventDefault();
    
    const loginPopup = document.getElementById('snk_loginPopup');
    if (loginPopup) {
        loginPopup.classList.remove('active');
        document.body.style.overflow = ''; // Sayfa scroll'u tekrar etkinleştir
    }
}

// Login popup'ını açma fonksiyonu
function snk_main_openLoginPopup() {
    console.log("Login popup açılıyor");
    
    const loginPopup = document.getElementById('snk_loginPopup');
    
    if (loginPopup) {
        loginPopup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Sayfa scroll'u devre dışı bırak
        
        // Popup açıldıktan sonra şifre görünürlük butonunu tekrar ayarla
        snk_main_setupPasswordToggle();
        // Kapatma butonunu tekrar ayarla
        snk_main_setupLoginPopupClose();
    } else {
        console.error("Login popup bulunamadı");
    }
}

// Login popup'ını kapatma fonksiyonu
function snk_main_closeLoginPopup() {
    closeLoginPopup({preventDefault: () => {}});
}

// Giriş yapma/kayıt olma formu geçişlerini ayarlamak için
function snk_main_setupAuthFormToggles() {
    const showRegisterLink = document.getElementById('showRegisterPopup');
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Login popup'ı kapat, register popup'ı aç
            const loginPopup = document.getElementById('snk_loginPopup');
            if (loginPopup) {
                loginPopup.classList.remove('active');
            }
            
            // Register popup kodunu buraya ekleyebiliriz
            // Ya da popup-handler.js'deki fonksiyonu çağırabiliriz
            if (typeof snk_popupHandler_showRegisterForm === 'function') {
                snk_popupHandler_showRegisterForm();
            }
        });
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    console.log("Main.js yüklendi");
    
    // DOM elemanlarını tekrar tanımla (lazy loading için güvenlik)
    const postsContainer = document.getElementById('snk_postsContainer');
    const filterNewest = document.getElementById('snk_filterNewest');
    const filterPopular = document.getElementById('snk_filterPopular');
    const sidebarPopular = document.getElementById('snk_sidebarPopular');
    
    console.log("Main elemanları:", {postsContainer, filterNewest, filterPopular, sidebarPopular});
    
    // Blog yazılarını yükle
    snk_main_loadBlogPosts();
    
    // Filtreleme butonları için olay dinleyicileri ekle
    snk_main_setupFilterButtons();
    
    // Sidebar'daki popüler linki için olay dinleyicisi
    if (sidebarPopular) {
        sidebarPopular.addEventListener('click', (e) => {
            e.preventDefault(); // Sayfanın yenilenmesini engelle
            
            // Popüler filtreyi aktifleştir
            if (filterPopular) {
                filterPopular.click(); // Popüler filtresine tıklamayı simüle et
            } else {
                // Popüler filtresi bulunamazsa manuel olarak uygula
                snk_main_activeFilter = 'popular';
                
                // UI güncelleme
                document.querySelectorAll('.snk-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.id === 'snk_filterPopular') {
                        btn.classList.add('active');
                    }
                });
                
                // Blog yazılarını filtrele ve göster
                snk_main_filterPosts();
            }
            
            // Sidebar link'lerinin aktif durumunu güncelle
            document.querySelectorAll('.snk-sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            sidebarPopular.classList.add('active');
        });
    }
    
    // Şifre görünürlük butonunu ayarla
    snk_main_setupPasswordToggle();
    
    // Giriş/Kayıt form geçişlerini ayarla
    snk_main_setupAuthFormToggles();
    
    // Login popup kapatma butonunu ayarla
    snk_main_setupLoginPopupClose();
    
    // Giriş yapma butonunu ayarla
    const loginButton = document.getElementById('snk_login_btn');
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            snk_main_openLoginPopup();
        });
    }
});

/**
 * Belirli bir kategoriye göre yazıları filtreler (kategori sayfası için)
 * @param {string} category - Filtrelenecek kategori adı
 */
function snk_main_filterByCategory(category) {
    console.log("Kategori filtreleniyor:", category);
    
    // Tüm yazılar yüklü değilse önce yükle
    if (snk_main_blogPosts.length === 0) {
        fetch('../utils/blogPosts.json')
            .then(response => response.json())
            .then(data => {
                snk_main_blogPosts = data.posts;
                // Kategori filtrelemesini yap
                const filteredPosts = snk_main_blogPosts.filter(post => 
                    post.category.toLowerCase() === category.toLowerCase()
                );
                snk_main_displayBlogPosts(filteredPosts);
            })
            .catch(error => {
                console.error('Kategori filtreleme hatası:', error);
                if (snk_main_postsContainer) {
                    snk_main_postsContainer.innerHTML = `
                        <div class="snk-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                        </div>
                    `;
                }
            });
    } else {
        // Veri zaten yüklü ise doğrudan filtrele
        const filteredPosts = snk_main_blogPosts.filter(post => 
            post.category.toLowerCase() === category.toLowerCase()
        );
        snk_main_displayBlogPosts(filteredPosts);
    }
}

// Global erişim için
window.snk_main_filterByCategory = snk_main_filterByCategory;
