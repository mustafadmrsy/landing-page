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
document.addEventListener('DOMContentLoaded', () => {
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
});

/**
 * Blog yazılarını JSON dosyasından yükler
 */
function snk_main_loadBlogPosts() {
    console.log("Blog yazıları yükleniyor");
    
    if (!snk_main_postsContainer) {
        console.error("Posts container bulunamadı!");
        return;
    }
    
    // Yükleniyor mesajını göster
    snk_main_postsContainer.innerHTML = `
        <div class="snk-loading">
            <i class="fas fa-spinner fa-spin"></i> Blog yazıları yükleniyor...
        </div>
    `;
    
    // JSON dosyasından verileri çek
    fetch('/utils/blogPosts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Blog yazıları yüklenemedi');
            }
            return response.json();
        })
        .then(data => {
            console.log("Blog verileri yüklendi:", data.posts.length);
            
            // Blog yazılarını sakla
            snk_main_blogPosts = data.posts;
            
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
    // Tüm gönderileri göster
    snk_main_displayBlogPosts(posts);
    
    // En popüler yazıları göster
    snk_main_displayPopularPosts(posts, snk_main_activeFilter);
    
    // Filtre butonlarına olay dinleyicileri ekle
    const newestBtn = document.getElementById('snk_filterNewest');
    const popularBtn = document.getElementById('snk_filterPopular');
    
    if (newestBtn && popularBtn) {
        newestBtn.addEventListener('click', () => {
            newestBtn.classList.add('active');
            popularBtn.classList.remove('active');
            const sortedPosts = [...snk_main_blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
            snk_main_displayBlogPosts(sortedPosts);
            snk_main_displayPopularPosts(sortedPosts, 'newest');
        });
        
        popularBtn.addEventListener('click', () => {
            popularBtn.classList.add('active');
            newestBtn.classList.remove('active');
            const sortedPosts = [...snk_main_blogPosts].sort((a, b) => b.views - a.views);
            snk_main_displayBlogPosts(sortedPosts);
            snk_main_displayPopularPosts(sortedPosts, 'popular');
        });
    }
}

/**
 * Blog yazılarını görüntüle
 * @param {Array} posts - Gösterilecek blog yazıları dizisi
 */
function snk_main_displayBlogPosts(posts) {
    const postsContainer = document.getElementById('snk_postsContainer');
    
    if (!postsContainer) return;
    
    // HTML içeriğini hazırla
    let postsHTML = '';
    
    posts.forEach(post => {
        postsHTML += `
            <div class="snk-post" data-post-id="${post.id}">
                <div class="snk-post-content-wrapper">
                    <div class="snk-post-vote">
                        <button class="snk-vote-btn snk-upvote">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <span class="snk-vote-count">0</span>
                        <button class="snk-vote-btn snk-downvote">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
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
                        <div class="snk-post-summary">${post.summary}</div>
                        <div class="snk-post-footer">
                            <button class="snk-post-action snk-read-more" data-post-id="${post.id}" data-expanded="false">
                                <i class="fas fa-angle-down"></i> Devamını Oku
                            </button>
                            <button class="snk-post-action snk-comment-btn" data-post-id="${post.id}">
                                <i class="fas fa-comment-alt"></i> Yorumlar
                            </button>
                            <button class="snk-post-action snk-share-btn" data-post-id="${post.id}">
                                <i class="fas fa-share"></i> Paylaş
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Eğer hiç yazı yoksa
    if (posts.length === 0) {
        postsHTML = '<div class="snk-no-posts">Gösterilecek yazı bulunamadı.</div>';
    }
    
    // İçeriği DOM'a ekle
    postsContainer.innerHTML = postsHTML;
    
    // "Devamını Oku" butonlarını ayarla
    const readMoreButtons = postsContainer.querySelectorAll('.snk-read-more');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isExpanded = this.dataset.expanded === 'true';
            const postId = parseInt(this.dataset.postId);
            const post = snk_main_blogPosts.find(p => p.id === postId);
            
            if (!post) return;
            
            const postElement = this.closest('.snk-post');
            const summaryElement = postElement.querySelector('.snk-post-summary');
            
            if (isExpanded) {
                // İçeriği daralt
                this.innerHTML = '<i class="fas fa-angle-down"></i> Devamını Oku';
                this.dataset.expanded = 'false';
                postElement.classList.remove('expanded');
                
                // Özeti göster
                summaryElement.textContent = post.summary;
            } else {
                // İçeriği genişlet
                this.innerHTML = '<i class="fas fa-angle-up"></i> Daralt';
                this.dataset.expanded = 'true';
                postElement.classList.add('expanded');
                
                // Tam içeriği göster
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
                summaryElement.innerHTML = fullContentHTML;
            }
        });
    });
    
    // Yorum butonlarını ayarla
    const commentButtons = postsContainer.querySelectorAll('.snk-comment-btn');
    
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = parseInt(this.dataset.postId);
            snk_main_toggleComments(postId);
        });
    });
    
    // Paylaşım butonlarını ayarla
    const shareButtons = postsContainer.querySelectorAll('.snk-share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = parseInt(this.dataset.postId);
            snk_main_toggleSharePanel(postId, this);
        });
    });
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
                <div class="snk-post-vote">
                    <button class="snk-vote-btn snk-upvote">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="snk-vote-count">0</span>
                    <button class="snk-vote-btn snk-downvote">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
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
    
    // Oy butonlarını ayarla
    snk_main_setupVoteButtons();
    
    // Filtre başlığını güncelle
    const contentTitle = document.querySelector('.snk-content-title');
    if (contentTitle) {
        contentTitle.textContent = 'Seçili Yazı';
    }
    
    // Genişletilmiş yazı için gerekli event listener'ları ekle
    const readMoreBtn = container.querySelector('.snk-post-action.snk-read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', function() {
            const isExpanded = this.dataset.expanded === 'true';
            const postId = parseInt(this.dataset.postId);
            
            if (isExpanded) {
                // İçeriği daralt
                this.innerHTML = '<i class="fas fa-angle-down"></i> Devamını Oku';
                this.dataset.expanded = 'false';
                
                // Tüm yazıları göster
                const allPosts = document.querySelectorAll('.snk-post');
                allPosts.forEach(postEl => {
                    postEl.style.display = 'flex';
                    postEl.classList.remove('expanded');
                    
                    // Özeti geri yükle
                    const summaryEl = postEl.querySelector('.snk-post-summary');
                    if (summaryEl && postEl.getAttribute('data-post-id') != postId) {
                        const post = snk_main_blogPosts.find(p => p.id === parseInt(postEl.getAttribute('data-post-id')));
                        if (post) {
                            summaryEl.textContent = post.summary;
                        }
                    }
                });
                
                // Başlığı geri yükle
                const contentTitle = document.querySelector('.snk-content-title');
                if (contentTitle) {
                    contentTitle.textContent = 'En Güncel Paylaşımlar';
                }
                
                // İlgili yazının özetini göster
                const currentPost = document.querySelector(`.snk-post[data-post-id="${postId}"]`);
                const summaryEl = currentPost.querySelector('.snk-post-summary');
                if (summaryEl) {
                    const post = snk_main_blogPosts.find(p => p.id === postId);
                    if (post) {
                        summaryEl.textContent = post.summary;
                    }
                }
            } else {
                // İçeriği genişlet
                this.innerHTML = '<i class="fas fa-angle-up"></i> Daralt';
                this.dataset.expanded = 'true';
                
                const post = snk_main_blogPosts.find(p => p.id === postId);
                if (post) {
                    // Yazının içeriğini göster
                    const currentPost = document.querySelector(`.snk-post[data-post-id="${postId}"]`);
                    currentPost.classList.add('expanded');
                    
                    const summaryEl = currentPost.querySelector('.snk-post-summary');
                    if (summaryEl) {
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
                        summaryEl.innerHTML = fullContentHTML;
                    }
                }
            }
        });
    }
}

/**
 * Blog yazılarını aktif filtreye göre filtreler
 */
function snk_main_filterPosts() {
    let filteredPosts = [...snk_main_blogPosts]; // Tüm yazıların bir kopyasını oluştur
    
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
 * Belirli bir kategoriye göre yazıları filtreler (kategori sayfası için)
 * @param {string} category - Filtrelenecek kategori adı
 */
function snk_main_filterByCategory(category) {
    console.log("Kategori filtreleniyor:", category);
    
    // Tüm yazılar yüklü değilse önce yükle
    if (snk_main_blogPosts.length === 0) {
        fetch('/utils/blogPosts.json')
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

/**
 * Blog yazısında yorum bölümünü gösterir
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
    
    // Yorumlar başlığı
    const headerHTML = `
        <div class="snk-comments-header">
            <h3 class="snk-comments-title">
                <i class="fas fa-comment-alt"></i> Yorumlar
                <span class="snk-comments-count">${comments.length}</span>
            </h3>
            <button class="snk-comments-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Yorum listesi
    let commentsHTML = '<div class="snk-comments-list">';
    
    comments.forEach(comment => {
        commentsHTML += `
            <div class="snk-comment" data-comment-id="${comment.id}">
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
                    <button class="snk-comment-action snk-comment-like">
                        <i class="fas fa-thumbs-up"></i> Beğen (${comment.likes})
                    </button>
                    <button class="snk-comment-action snk-comment-reply">
                        <i class="fas fa-reply"></i> Yanıtla
                    </button>
                </div>
            </div>
        `;
    });
    
    commentsHTML += '</div>';
    
    // Yeni yorum formu
    const formHTML = `
        <div class="snk-new-comment">
            <form class="snk-comment-form">
                <textarea class="snk-comment-textarea" placeholder="Yorumunuzu buraya yazın..."></textarea>
                <div class="snk-comment-form-actions">
                    <button type="button" class="snk-comment-btn snk-comment-cancel">İptal</button>
                    <button type="submit" class="snk-comment-btn snk-comment-submit">Yorum Yap</button>
                </div>
            </form>
        </div>
    `;
    
    // Tüm HTML'i bir araya getir
    commentsSection.innerHTML = headerHTML + commentsHTML + formHTML;
    
    // Yorum bölümünü blog yazısının sonuna ekle
    postElement.appendChild(commentsSection);
    
    // Kapatma butonuna tıklama
    const closeBtn = commentsSection.querySelector('.snk-comments-close');
    closeBtn.addEventListener('click', () => {
        commentsSection.classList.remove('active');
        setTimeout(() => commentsSection.remove(), 300);
    });
    
    // İptal butonuna tıklama
    const cancelBtn = commentsSection.querySelector('.snk-comment-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const textarea = commentsSection.querySelector('.snk-comment-textarea');
            if (textarea) {
                textarea.value = '';
            }
        });
    }
    
    // Form gönderme olayı
    const commentForm = commentsSection.querySelector('.snk-comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const textarea = commentsSection.querySelector('.snk-comment-textarea');
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
 * Blog yazısında bir yorumu beğenmek için kullanılır
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
 * Blog yazısında bir yoruma yanıt verme formunu gösterir
 * @param {number} commentId - Yanıtlanacak yorumun ID'si
 * @param {HTMLElement} button - Tıklanan yanıtla butonu
 */
function snk_main_replyToComment(commentId, button) {
    const commentElement = document.querySelector(`.snk-comment[data-comment-id="${commentId}"]`);
    if (!commentElement) return;
    
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
    
    // Formun HTML içeriğini oluştur
    replyForm.innerHTML = `
        <form class="snk-reply-form">
            <textarea class="snk-reply-textarea" placeholder="Yanıtınızı buraya yazın..."></textarea>
            <div class="snk-reply-form-actions">
                <button type="button" class="snk-reply-btn snk-reply-cancel">İptal</button>
                <button type="submit" class="snk-reply-btn snk-reply-submit">Yanıtla</button>
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
    const textarea = replyForm.querySelector('.snk-reply-textarea');
    textarea.focus();
    
    // İptal butonuna tıklama
    const cancelBtn = replyForm.querySelector('.snk-reply-cancel');
    cancelBtn.addEventListener('click', () => {
        replyForm.style.maxHeight = '0';
        replyForm.style.opacity = '0';
        setTimeout(() => replyForm.remove(), 300);
    });
    
    // Yanıt formunun gönderilmesi
    const form = replyForm.querySelector('.snk-reply-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const replyText = textarea.value.trim();
        if (replyText) {
            // Yeni yanıt yorumunu oluştur
            const newReply = document.createElement('div');
            newReply.className = 'snk-comment snk-reply';
            
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
                    <button class="snk-comment-action snk-comment-like">
                        <i class="fas fa-thumbs-up"></i> Beğen (0)
                    </button>
                </div>
            `;
            
            // Yanıtla butonunu gizle
            button.style.display = 'none';
            
            // Yanıtı yorumdan hemen sonra ekle
            commentElement.after(newReply);
            
            // Yeni yanıta beğenme fonksiyonu ekle
            const newLikeButton = newReply.querySelector('.snk-comment-like');
            newLikeButton.addEventListener('click', function() {
                const randomId = Math.floor(Math.random() * 1000) + 100; // Geçici ID
                snk_main_likeComment(randomId, this);
            });
            
            // Formu kapat
            replyForm.remove();
            
            // Gerçek uygulamada burada API çağrısı yapılırdı
            console.log(`Yorum ID: ${commentId}'ye yanıt gönderildi: ${replyText}`);
        }
    });
}

/**
 * Blog yazısında paylaşım panelini gösterir/gizler
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
            setTimeout(() => sharePanel.remove(), 300);
            return;
        }
    }
    
    // Paylaşım URL'i oluştur
    const shareUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;
    
    // Paylaşım paneli oluştur
    sharePanel = document.createElement('div');
    sharePanel.className = 'snk-share-panel active';
    sharePanel.dataset.postId = postId;
    
    // Paylaşım paneli içeriğini oluştur
    sharePanel.innerHTML = `
        <div class="snk-share-header">
            <h3 class="snk-share-title">
                <i class="fas fa-share-alt"></i> Paylaş
            </h3>
            <button class="snk-share-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="snk-share-buttons">
            <button class="snk-share-button snk-share-twitter">
                <i class="fab fa-twitter"></i>
                Twitter
            </button>
            <button class="snk-share-button snk-share-facebook">
                <i class="fab fa-facebook"></i>
                Facebook
            </button>
            <button class="snk-share-button snk-share-linkedin">
                <i class="fab fa-linkedin"></i>
                LinkedIn
            </button>
            <button class="snk-share-button snk-share-whatsapp">
                <i class="fab fa-whatsapp"></i>
                WhatsApp
            </button>
            <button class="snk-share-button snk-share-telegram">
                <i class="fab fa-telegram"></i>
                Telegram
            </button>
            <button class="snk-share-button snk-share-email">
                <i class="fas fa-envelope"></i>
                Email
            </button>
            <div class="snk-share-link">
                <div class="snk-share-link-input">
                    <input type="text" class="snk-share-url" value="${shareUrl}" readonly>
                    <button class="snk-share-copy">Kopyala</button>
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
    const closeBtn = sharePanel.querySelector('.snk-share-close');
    closeBtn.addEventListener('click', () => {
        sharePanel.classList.remove('active');
        setTimeout(() => sharePanel.remove(), 300);
    });
    
    // Link kopyalama butonuna tıklama
    const copyBtn = sharePanel.querySelector('.snk-share-copy');
    const urlInput = sharePanel.querySelector('.snk-share-url');
    
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
    const twitterBtn = sharePanel.querySelector('.snk-share-twitter');
    twitterBtn.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    const facebookBtn = sharePanel.querySelector('.snk-share-facebook');
    facebookBtn.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    const linkedinBtn = sharePanel.querySelector('.snk-share-linkedin');
    linkedinBtn.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    
    const whatsappBtn = sharePanel.querySelector('.snk-share-whatsapp');
    whatsappBtn.addEventListener('click', () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`, '_blank');
    });
    
    const telegramBtn = sharePanel.querySelector('.snk-share-telegram');
    telegramBtn.addEventListener('click', () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank');
    });
    
    const emailBtn = sharePanel.querySelector('.snk-share-email');
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
 * Blog yazısı oluşturma popup'ını açar
 */
function snk_main_openCreatePostPopup() {
    // Mevcut popup'ı kontrol et
    let createPostPopup = document.querySelector('.snk-create-post-popup');
    
    // Popup zaten varsa, kapat
    if (createPostPopup) {
        createPostPopup.classList.remove('active');
        setTimeout(() => createPostPopup.remove(), 300);
        return;
    }
    
    // Popup oluştur
    createPostPopup = document.createElement('div');
    createPostPopup.className = 'snk-create-post-popup active';
    
    // Popup içeriğini oluştur
    createPostPopup.innerHTML = `
        <div class="snk-create-post-container">
            <div class="snk-create-post-header">
                <h2 class="snk-create-post-title">
                    <i class="fas fa-edit"></i> Yeni Blog Yazısı Oluştur
                </h2>
                <button class="snk-create-post-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="snk-create-post-form">
                <div class="snk-form-group">
                    <label for="post-title">Başlık</label>
                    <input type="text" id="post-title" class="snk-form-control" placeholder="Blog yazınızın başlığını girin" required>
                </div>
                
                <div class="snk-form-group">
                    <label for="post-category">Kategori</label>
                    <select id="post-category" class="snk-form-control" required>
                        <option value="" disabled selected>Kategori seçin</option>
                        <option value="teknoloji">Teknoloji</option>
                        <option value="egitim">Eğitim</option>
                        <option value="yasam">Yaşam</option>
                        <option value="kultursanat">Kültür & Sanat</option>
                        <option value="bilim">Bilim</option>
                    </select>
                </div>
                
                <div class="snk-form-group">
                    <label for="post-content">İçerik</label>
                    <textarea id="post-content" class="snk-form-control" placeholder="Blog yazınızın içeriğini girin" rows="8" required></textarea>
                </div>
                
                <div class="snk-form-group">
                    <label for="post-tags">Etiketler (# ile ayırın)</label>
                    <input type="text" id="post-tags" class="snk-form-control" placeholder="Örn: #teknoloji #yazılım #web">
                    <div class="snk-tags-preview"></div>
                </div>
                
                <div class="snk-form-group">
                    <label for="post-image">Kapak Görseli</label>
                    <div class="snk-image-upload">
                        <input type="file" id="post-image" class="snk-image-input" accept="image/*">
                        <label for="post-image" class="snk-image-label">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Görsel Seçin veya Sürükleyin</span>
                        </label>
                        <div class="snk-image-preview"></div>
                    </div>
                </div>
                
                <div class="snk-form-actions">
                    <button type="button" class="snk-form-button snk-cancel-button">İptal</button>
                    <button type="submit" class="snk-form-button snk-submit-button">Yazıyı Yayınla</button>
                </div>
            </form>
        </div>
    `;
    
    // Popup'ı sayfaya ekle
    document.body.appendChild(createPostPopup);
    
    // Etiket önizleme işlevi
    const tagsInput = createPostPopup.querySelector('#post-tags');
    const tagsPreview = createPostPopup.querySelector('.snk-tags-preview');
    
    tagsInput.addEventListener('input', function() {
        const tags = this.value.match(/#[a-zA-ZğüşıöçĞÜŞİÖÇ0-9_]+/g) || [];
        
        tagsPreview.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'snk-tag';
            tagElement.textContent = tag;
            tagsPreview.appendChild(tagElement);
        });
    });
    
    // Görsel önizleme işlevi
    const imageInput = createPostPopup.querySelector('#post-image');
    const imagePreview = createPostPopup.querySelector('.snk-image-preview');
    let selectedImageData = null;
    
    imageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                selectedImageData = e.target.result;
                imagePreview.innerHTML = `
                    <img src="${selectedImageData}" alt="Seçilen görsel">
                    <button type="button" class="snk-remove-image">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Görsel kaldırma butonu
                const removeButton = imagePreview.querySelector('.snk-remove-image');
                removeButton.addEventListener('click', function() {
                    imagePreview.innerHTML = '';
                    imageInput.value = '';
                    selectedImageData = null;
                });
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Kapatma butonu
    const closeButton = createPostPopup.querySelector('.snk-create-post-close');
    closeButton.addEventListener('click', function() {
        createPostPopup.classList.remove('active');
        setTimeout(() => createPostPopup.remove(), 300);
    });
    
    // İptal butonu
    const cancelButton = createPostPopup.querySelector('.snk-cancel-button');
    cancelButton.addEventListener('click', function() {
        createPostPopup.classList.remove('active');
        setTimeout(() => createPostPopup.remove(), 300);
    });
    
    // Form gönderimi
    const form = createPostPopup.querySelector('.snk-create-post-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Gerekli alanları kontrol et
        const title = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
        const content = document.getElementById('post-content').value.trim();
        
        if (!title || !category || !content) {
            alert('Lütfen tüm gerekli alanları doldurun!');
            return;
        }
        
        // Form verilerini al
        const postData = {
            id: Date.now(), // Benzersiz ID için timestamp
            title: title,
            category: category,
            content: content,
            tags: (document.getElementById('post-tags').value.match(/#[a-zA-ZğüşıöçĞÜŞİÖÇ0-9_]+/g) || []).map(tag => tag.substring(1)),
            date: new Date().toISOString().split('T')[0],
            image: selectedImageData || '', // resim yoksa boş bırak
            author: 'Kullanıcı', // Gerçek uygulamada giriş yapmış kullanıcı bilgisi
            views: 0,
            likes: 0,
            comments: []
        };
        
        // Blog yazısını ekle ve sayfayı güncelle
        snk_main_addNewBlogPost(postData);
        
        // Popup'ı kapat
        createPostPopup.classList.remove('active');
        setTimeout(() => createPostPopup.remove(), 300);
    });
    
    // Popup dışına tıklama ile kapatma
    createPostPopup.addEventListener('click', function(e) {
        if (e.target === this) {
            createPostPopup.classList.remove('active');
            setTimeout(() => createPostPopup.remove(), 300);
        }
    });
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
                <div class="snk-post-vote">
                    <button class="snk-vote-btn snk-upvote">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <span class="snk-vote-count">0</span>
                    <button class="snk-vote-btn snk-downvote">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
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
                    <div class="snk-post-summary">${postData.summary}</div>
                    <div class="snk-post-footer">
                        <button class="snk-post-action snk-read-more" data-post-id="${postData.id}" data-expanded="false">
                            <i class="fas fa-angle-down"></i> Devamını Oku
                        </button>
                        <button class="snk-post-action snk-comment-btn" data-post-id="${postData.id}">
                            <i class="fas fa-comment-alt"></i> Yorumlar
                        </button>
                        <button class="snk-post-action snk-share-btn" data-post-id="${postData.id}">
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
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const voteCount = postElement.querySelector('.snk-vote-count');
            const currentCount = parseInt(voteCount.textContent);
            
            if (this.classList.contains('snk-upvote')) {
                voteCount.textContent = currentCount + 1;
                this.classList.add('active');
                postElement.querySelector('.snk-downvote').classList.remove('active');
                postData.likes++; // Beğeni sayısını güncelle
            } else {
                voteCount.textContent = currentCount - 1;
                this.classList.add('active');
                postElement.querySelector('.snk-upvote').classList.remove('active');
                postData.likes = Math.max(0, postData.likes - 1); // Beğeni sayısını güncelle (negatif olmamasını sağla)
            }
        });
    });
    
    // "Devamını Oku" butonu için olay dinleyicisi
    const readMoreBtn = postElement.querySelector('.snk-read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', function() {
            const isExpanded = this.dataset.expanded === 'true';
            const summary = postElement.querySelector('.snk-post-summary');
            
            if (!isExpanded) {
                // Post içeriğini genişlet
                summary.innerHTML = postData.content;
                
                // Buton metnini değiştir
                this.innerHTML = '<i class="fas fa-angle-up"></i> Küçült';
                this.dataset.expanded = 'true';
                
                // Gradient ve animasyon sınıflarını ekle
                this.classList.add('expanded');
            } else {
                // Post içeriğini küçült
                summary.innerHTML = postData.summary;
                
                // Buton metnini değiştir
                this.innerHTML = '<i class="fas fa-angle-down"></i> Devamını Oku';
                this.dataset.expanded = 'false';
                
                // Gradient ve animasyon sınıflarını kaldır
                this.classList.remove('expanded');
            }
        });
    }
    
    // Yorum butonu için olay dinleyicisi
    const commentBtn = postElement.querySelector('.snk-comment-btn');
    if (commentBtn) {
        commentBtn.addEventListener('click', function() {
            const postId = parseInt(this.dataset.postId);
            // snk_main_toggleComments fonksiyonunu güvenli şekilde çağır
            if (typeof snk_main_toggleComments === 'function') {
                snk_main_toggleComments(postId);
            } else {
                console.error('snk_main_toggleComments function not found');
                alert('Yorumlar şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
            }
        });
    }
    
    // Paylaş butonu için olay dinleyicisi
    const shareBtn = postElement.querySelector('.snk-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const postId = parseInt(this.dataset.postId);
            // snk_main_toggleSharePanel fonksiyonunu güvenli şekilde çağır
            if (typeof snk_main_toggleSharePanel === 'function') {
                snk_main_toggleSharePanel(postId, this);
            } else {
                console.error('snk_main_toggleSharePanel function not found');
                // Basit bir paylaşım paneli göster
                const url = window.location.href;
                alert(`Bu gönderiyi paylaşmak için şu linki kullanabilirsiniz: ${url}#post-${postId}`);
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
