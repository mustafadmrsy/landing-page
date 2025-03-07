/**
 * Main JavaScript - Senirkent Blog
 * Her fonksiyon öneki: snk_main_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını tanımla
const snk_main_postsContainer = document.getElementById('snk_postsContainer');
const snk_main_filterButtons = document.querySelectorAll('.snk-filter-btn');
const snk_main_filterNewest = document.getElementById('snk_filterNewest');
const snk_main_filterPopular = document.getElementById('snk_filterPopular');
const snk_main_filterTrend = document.getElementById('snk_filterTrend');

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
    const filterTrend = document.getElementById('snk_filterTrend');
    
    console.log("Main elemanları:", {postsContainer, filterNewest, filterPopular, filterTrend});
    
    // Blog yazılarını yükle
    snk_main_loadBlogPosts();
    
    // Filtreleme butonları için olay dinleyicileri ekle
    snk_main_setupFilterButtons();
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
            snk_main_blogPosts = data.posts;
            
            // Yazıları ekrana göster
            snk_main_displayPosts(snk_main_blogPosts);
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
 * Blog yazılarını ekranda gösterir
 * @param {Array} posts - Gösterilecek blog yazıları dizisi
 */
function snk_main_displayPosts(posts) {
    if (!snk_main_postsContainer) {
        console.error("Posts container bulunamadı!");
        return;
    }
    
    // Container'ı temizle
    snk_main_postsContainer.innerHTML = '';
    
    // Yazı yoksa bilgi mesajı göster
    if (posts.length === 0) {
        snk_main_postsContainer.innerHTML = `
            <div class="snk-info">
                <i class="fas fa-info-circle"></i>
                <p>Bu kriterlere uygun blog yazısı bulunamadı.</p>
            </div>
        `;
        return;
    }
    
    console.log("Blog yazıları gösteriliyor:", posts.length);
    
    // Her yazı için HTML oluştur ve ekrana ekle
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'snk-post';
        
        postElement.innerHTML = `
            <div class="snk-post-metadata">
                <div class="snk-post-category">${post.category}</div>
                <div class="snk-post-date">${post.date}</div>
            </div>
            <h3 class="snk-post-title">${post.title}</h3>
            <div class="snk-post-content">
                <p>${post.summary || post.content.substring(0, 150) + '...'}</p>
            </div>
            <div class="snk-post-buttons">
                <button class="snk-read-more-btn" data-post-id="${post.id}">
                    Devamını Oku <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        snk_main_postsContainer.appendChild(postElement);
    });
    
    // 'Devamını Oku' butonları için olay dinleyicileri ekle
    snk_main_setupReadMoreButtons();
}

/**
 * 'Devamını Oku' butonları için olay dinleyicileri ekler
 */
function snk_main_setupReadMoreButtons() {
    console.log("Devamını Oku butonları ayarlanıyor");
    
    const readMoreButtons = document.querySelectorAll('.snk-read-more-btn');
    if (readMoreButtons.length > 0) {
        console.log("Devamını Oku butonları bulundu:", readMoreButtons.length);
        
        readMoreButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); // Sayfa yenilenmesini önle
                const postId = button.getAttribute('data-post-id');
                console.log("Devamını Oku butonuna tıklandı, Post ID:", postId);
                
                // İlgili yazıyı getir ve popup'ta göster (popup.js içindeki fonksiyonu çağır)
                if (typeof window.snk_popup_fetchPostData === 'function') {
                    window.snk_popup_fetchPostData(postId);
                } else {
                    console.error('snk_popup_fetchPostData fonksiyonu tanımlı değil');
                }
            });
        });
    } else {
        console.warn("Hiç 'Devamını Oku' butonu bulunamadı");
    }
}

/**
 * Filtreleme butonları için olay dinleyicileri ekler
 */
function snk_main_setupFilterButtons() {
    console.log("Filtre butonları ayarlanıyor");
    
    // Önce ID ile butonları seçelim (snk_filterNewest, snk_filterPopular, snk_filterTrend)
    const filterNewest = document.getElementById('snk_filterNewest');
    const filterPopular = document.getElementById('snk_filterPopular');
    const filterTrend = document.getElementById('snk_filterTrend');
    
    const filterButtons = [filterNewest, filterPopular, filterTrend].filter(button => button !== null);
    
    if (filterButtons.length === 0) {
        console.warn("Hiçbir filtre butonu bulunamadı.");
        
        // Alternatif olarak class ile seçmeyi deneyelim
        const classButtons = document.querySelectorAll('.snk-filter-btn');
        if (classButtons.length > 0) {
            console.log("Class ile filtre butonları bulundu:", classButtons.length);
            
            classButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Tıklanan butonun ID'sinden filtre tipini belirle
                    let filterType = 'newest'; // Varsayılan
                    
                    if (button.id === 'snk_filterPopular') {
                        filterType = 'popular';
                    } else if (button.id === 'snk_filterTrend') {
                        filterType = 'trending';
                    }
                    
                    // Aktif filtreyi güncelle
                    snk_main_activeFilter = filterType;
                    
                    console.log("Filtre değiştirildi:", snk_main_activeFilter);
                    
                    // UI güncelleme - aktif buton vurgusu
                    classButtons.forEach(btn => {
                        btn.classList.remove('active');
                    });
                    button.classList.add('active');
                    
                    // Blog yazılarını filtrele ve göster
                    snk_main_filterPosts();
                });
            });
        }
        return;
    }
    
    // ID ile bulunan butonlar için olay dinleyicileri
    filterButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                // Tıklanan butonun ID'sinden filtre tipini belirle
                let filterType = 'newest'; // Varsayılan
                
                if (button.id === 'snk_filterPopular') {
                    filterType = 'popular';
                } else if (button.id === 'snk_filterTrend') {
                    filterType = 'trending';
                }
                
                // Aktif filtreyi güncelle
                snk_main_activeFilter = filterType;
                
                console.log("Filtre değiştirildi:", snk_main_activeFilter);
                
                // UI güncelleme - aktif buton vurgusu
                filterButtons.forEach(btn => {
                    if (btn) btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Blog yazılarını filtrele ve göster
                snk_main_filterPosts();
            });
        }
    });
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
            
        case 'trending':
            // Son 7 günde en popüler olanlara göre sırala
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            // Son bir haftadaki yazıları filtrele ve popülerliğe göre sırala
            filteredPosts = filteredPosts.filter(post => {
                const postDate = new Date(post.date.split('.').reverse().join('-'));
                return postDate >= oneWeekAgo;
            }).sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
    }
    
    // Filtrelenmiş yazıları göster
    snk_main_displayPosts(filteredPosts);
}

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
                snk_main_displayPosts(filteredPosts);
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
        snk_main_displayPosts(filteredPosts);
    }
}

// Global erişim için
window.snk_main_filterByCategory = snk_main_filterByCategory;
