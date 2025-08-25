/**
 * Main JavaScript - Senirkent Blog
 * Her fonksiyon öneki: snk_main_ (kod çakışmalarını önlemek için)
 */
// main.js dosyası

const switchToRegister = document.getElementById('snk_switch_to_register');
if (switchToRegister) {
    console.log("Kaydolun bağlantısı bulundu!");
} else {
    console.error("Kaydolun bağlantısı bulunamadı!");
}

// Fonksiyon tanımı
function snk_main_initializePage() {
    console.log("Sayfa başlatılıyor...");

    // Sidebar Toggle Butonunu Aktifleştir
    snk_main_setupSidebarToggle();

    // Sidebar Scroll Ayarlarını Yap
    snk_main_setupSidebarScroll();

    // Blog yazılarını yükle
    snk_main_loadBlogPosts();

    // "Oluştur" butonunu ayarla
    const createButton = document.getElementById('snk_create_btn');
    if (createButton) {
        createButton.addEventListener('click', snk_main_openCreatePostPopup);
    }

    // Diğer başlatma işlemleri...
}

// Sidebar Scroll Fonksiyonu
function snk_main_setupSidebarScroll() {
    const sidebar = document.querySelector('.sidebar');
    const footer = document.querySelector('.footer');
    const mainContent = document.querySelector('.main-content');
    
    if (!sidebar || !footer || !mainContent) return;
    
    function adjustSidebar() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) return; // Mobilde bu ayarları uygulamıyoruz
        
        const windowHeight = window.innerHeight;
        const sidebarHeight = sidebar.offsetHeight;
        const footerTop = footer.getBoundingClientRect().top;
        const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
        
        // Footer görünür olmaya başladıysa
        if (footerTop < windowHeight) {
            const visibleFooterHeight = windowHeight - footerTop;
            // Sidebar'ın alt kısmını footer'ın üzerine gelecek şekilde ayarla
            sidebar.style.height = `calc(100vh - ${headerHeight}px - ${visibleFooterHeight}px)`;
        } else {
            // Normal pozisyon
            sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
        }
    }
    
    // Sayfa yüklendiğinde ve scroll edildiğinde ayarla
    window.addEventListener('scroll', adjustSidebar);
    window.addEventListener('resize', adjustSidebar);
    
    // İlk yüklemede de çalıştır
    adjustSidebar();
}

// Sidebar Toggle Fonksiyonu
function snk_main_setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        // localStorage'dan sidebar durumunu kontrol et
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        const isMobile = window.innerWidth <= 768;
        
        // Sayfa yüklendiğinde durumu uygula
        if (isMobile) {
            // Mobil görünümde: toggle butonu sidebar'ı açar/kapatır (active sınıfı)
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });
        } else {
            // Desktop görünümde: toggle butonu sidebar'ı daraltır/genişletir
            // Sayfa yüklendiğinde localStorage'daki durumu uygula
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
            
            // Toggle butonuna tıklama eventi ekle
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
                
                // Durumu localStorage'a kaydet
                const newIsCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', newIsCollapsed);
            });
        }
        
        // Pencere boyutu değiştiğinde responsive davranışı ayarla
        window.addEventListener('resize', function() {
            const currentIsMobile = window.innerWidth <= 768;
            
            // Görünüm modu değiştiyse
            if (currentIsMobile !== isMobile) {
                // Eski event listener'ları temizle ve yeniden oluştur
                sidebarToggle.removeEventListener('click', null);
                
                if (currentIsMobile) {
                    // Mobil görünüme geçiş
                    sidebar.classList.remove('collapsed');
                    sidebar.classList.remove('active');
                    
                    sidebarToggle.addEventListener('click', function() {
                        sidebar.classList.toggle('active');
                    });
                } else {
                    // Desktop görünüme geçiş
                    sidebar.classList.remove('active');
                    
                    // LocalStorage'dan alınan son duruma dön
                    const storedIsCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
                    if (storedIsCollapsed) {
                        sidebar.classList.add('collapsed');
                    } else {
                        sidebar.classList.remove('collapsed');
                    }
                    
                    sidebarToggle.addEventListener('click', function() {
                        sidebar.classList.toggle('collapsed');
                        const newIsCollapsed = sidebar.classList.contains('collapsed');
                        localStorage.setItem('sidebarCollapsed', newIsCollapsed);
                    });
                }
            }
        });
    } else {
        console.error("Sidebar veya toggle butonu bulunamadı!");
    }
}

// Footer Pozisyonlama Fonksiyonu
function snk_main_adjustFooterPosition() {
    const container = document.querySelector('.container');
    const footer = document.querySelector('.footer');
    const contentHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    
    if (footer && container) {
        if (contentHeight < windowHeight) {
            // İçerik sayfa boyutundan küçükse footer'ı sayfanın altına sabitler
            container.style.minHeight = '100vh';
            footer.style.position = 'sticky';
            footer.style.bottom = '0';
        } else {
            // İçerik yeterince uzunsa normal akışta bırak
            container.style.minHeight = 'auto';
            footer.style.position = 'relative';
        }
    }
}

// Blog yazılarını yükleme fonksiyonu
function snk_main_loadBlogPosts() {
    console.log("Blog yazıları yükleniyor...");
    
    // DOM elemanlarını tekrar tanımla (lazy loading için güvenlik)
    const postsContainer = document.getElementById('snk_postsContainer');
    const filterNewest = document.getElementById('snk_filterNewest');
    const filterPopular = document.getElementById('snk_filterPopular');
    const sidebarPopular = document.getElementById('snk_sidebarPopular');

    console.log("Main elemanları:", { postsContainer, filterNewest, filterPopular, sidebarPopular });

    // Blog yazılarını yükle
    // API'den verileri al veya mock data kullan
    // Bu kısımda gerçek bir API çağrısı yapılabilir

    // Örnek veri
    const sampleData = [
        // Örnek blog yazıları
    ];

    // Blog yazılarını işle
    snk_main_onBlogPostsLoaded(sampleData);
}

// Popup açma fonksiyonu
function snk_main_openCreatePostPopup() {
    console.log("Yeni blog yazısı oluşturma popup'ı açılıyor...");

    // Popup içeriğini oluştur
    const popupContent = `
        <div class="snk-popup-overlay">
            <div class="snk-popup-container">
                <div class="snk-popup-header">
                    <h2>Yeni Blog Yazısı Oluştur</h2>
                    <button class="snk-popup-close-btn" id="snk_createCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="snk-popup-content">
                    <form id="snk_createPostForm">
                        <div class="snk-form-group">
                            <label for="snk_postTitle">Başlık</label>
                            <input type="text" id="snk_postTitle" name="title" required>
                        </div>
                        <div class="snk-form-group">
                            <label for="snk_postContent">İçerik</label>
                            <textarea id="snk_postContent" name="content" required></textarea>
                        </div>
                        <div class="snk-form-group">
                            <label for="snk_postCategory">Kategori</label>
                            <select id="snk_postCategory" name="category">
                                <option value="teknoloji">Teknoloji</option>
                                <option value="egitim">Eğitim</option>
                                <option value="yasam">Yaşam</option>
                                <option value="kultursanat">Kültür & Sanat</option>
                                <option value="bilim">Bilim</option>
                            </select>
                        </div>
                        <button type="submit" class="snk-submit-btn">Oluştur</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Popup'ı sayfaya ekle
    document.body.insertAdjacentHTML('beforeend', popupContent);

    // Popup'ı görünür yap
    const popupOverlay = document.querySelector('.snk-popup-overlay');
    popupOverlay.classList.add('active');

    // Kapatma butonunu ayarla
    const closeBtn = document.getElementById('snk_createCloseBtn');
    closeBtn.addEventListener('click', () => {
        popupOverlay.remove();
    });

    // Form gönderme işlemi
    const createForm = document.getElementById('snk_createPostForm');
    createForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const postData = {
            title: document.getElementById('snk_postTitle').value,
            content: document.getElementById('snk_postContent').value,
            category: document.getElementById('snk_postCategory').value,
            date: new Date().toISOString(),
            author: "Mustafa Demirsoy", // Bu kısım dinamik olmalı
            status: "pending" // Onay bekliyor
        };

        // Yeni blog yazısını kaydet
        snk_main_saveBlogPost(postData);

        // Popup'ı kapat
        popupOverlay.remove();
    });
}

// DOM elemanlarını tanımla
const snk_main_postsContainer = document.getElementById('snk_postsContainer');
const snk_main_filterNewest = document.getElementById('snk_filterNewest');
const snk_main_filterPopular = document.getElementById('snk_filterPopular');

// Blog yazılarının tutulacağı dizi
let snk_main_blogPosts = [];

/**
 * Sayfa yüklendiğinde çalışacak fonksiyonlar
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log("Main.js yüklendi");
    snk_main_initializePage();
    
    // Footer pozisyonunu ayarla
    snk_main_adjustFooterPosition();
    
    // Pencere boyutu değiştiğinde footer pozisyonunu tekrar ayarla
    window.addEventListener('resize', snk_main_adjustFooterPosition);

    // Sidebar'daki popüler linki için olay dinleyicisi
    const sidebarPopular = document.getElementById('snk_sidebarPopular');
    if (sidebarPopular) {
        sidebarPopular.addEventListener('click', (e) => {
            e.preventDefault(); // Sayfanın yenilenmesini engelle

            // Popüler filtreyi aktifleştir
            const filterPopular = document.getElementById('snk_filterPopular');
            if (filterPopular) {
                filterPopular.click(); // Popüler filtresine tıklamayı simüle et
            } else {
                // Popüler filtresi bulunamazsa manuel olarak uygula
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

    // Sidebar aktif linklerini güncelle
    snk_main_updateActiveSidebarLinks();
});

// Sidebar aktif linklerini güncelleme fonksiyonu
function snk_main_updateActiveSidebarLinks() {
    // Mevcut URL'yi al
    const currentPath = window.location.pathname;
    
    // Sidebar linklerini seç
    const sidebarLinks = document.querySelectorAll('.sidebar-item');
    
    // Her linki kontrol et
    sidebarLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Eğer link mevcut URL ile eşleşiyorsa aktif sınıfını ekle
        if (linkHref && currentPath.includes(linkHref)) {
            link.classList.add('active');
    } else {
            link.classList.remove('active');
        }
    });
}

// Blog yazıları yüklendiğinde çağrılacak fonksiyon
function snk_main_onBlogPostsLoaded(posts) {
    console.log("Blog yazıları yüklendi:", posts);
    snk_main_blogPosts = posts;

    // Yazıları göster
    snk_main_filterPosts();
}

// Filtreleme butonlarını ayarlama fonksiyonu
function snk_main_setupFilterButtons() {
    const filterNewest = document.getElementById('snk_filterNewest');
    const filterPopular = document.getElementById('snk_filterPopular');

    if (filterNewest) {
        filterNewest.addEventListener('click', () => {
            document.querySelectorAll('.snk-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            filterNewest.classList.add('active');
            snk_main_filterPosts('newest');
        });
    }

    if (filterPopular) {
        filterPopular.addEventListener('click', () => {
            document.querySelectorAll('.snk-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            filterPopular.classList.add('active');
            snk_main_filterPosts('popular');
        });
    }
}

// Blog kartları oluşturma fonksiyonu
function snk_main_createBlogCards(posts, container) {
    // Implementation goes here
}

// Post etkileşimlerini (beğeni, yorum gibi) ayarlama fonksiyonu
function snk_main_setupPostInteractions(postElement, postData) {
    if (!postElement) return;

    // Like button
    const likeBtn = postElement.querySelector('.snk-like-button');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const postId = this.getAttribute('data-postid');
            snk_main_likePost(postId, this);
        });
    }

    // Comment button
    const commentBtn = postElement.querySelector('.snk-comment-button');
    if (commentBtn) {
        commentBtn.addEventListener('click', function() {
            const postId = this.getAttribute('data-postid');
            snk_main_toggleComments(postId);
        });
    }

    // Share button
    const shareBtn = postElement.querySelector('.snk-share-button');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const postId = this.getAttribute('data-postid');
            snk_main_sharePost(postId);
        });
    }

    // Save button
    const saveBtn = postElement.querySelector('.snk-save-button');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const postId = this.getAttribute('data-postid');
            snk_main_savePost(postId, this);
        });
    }
}

// Blog yazılarını gösterme fonksiyonu
function snk_main_displayBlogPosts(posts) {
    // Implementation goes here
}

// Blog yazılarını filtreleme fonksiyonu
function snk_main_filterPosts(filterType = 'newest') {
    console.log(`Filtre uygulanıyor: ${filterType}`);
    
    if (!snk_main_blogPosts || !Array.isArray(snk_main_blogPosts)) {
        console.error("Blog yazıları henüz yüklenmedi veya geçerli değil");
        return;
    }

    let filteredPosts = [...snk_main_blogPosts];
    
    if (filterType === 'newest') {
        // En yeniye göre sırala
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filterType === 'popular') {
        // Popülerliğe göre sırala (beğeni sayısı)
        filteredPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    
    // Filtrelenmiş yazıları göster
    const postsContainer = document.getElementById('snk_postsContainer');
    if (postsContainer) {
        postsContainer.innerHTML = '';
        filteredPosts.forEach(post => {
            snk_main_createAndDisplaySinglePost(post, postsContainer);
        });
    }
}

// Popüler blog yazılarını gösterme fonksiyonu
function snk_main_displayPopularPosts(posts, filterType = 'newest') {
    // Implementation goes here
}

// Tek bir blog yazısını oluşturma ve gösterme fonksiyonu
function snk_main_createAndDisplaySinglePost(post, container) {
    // Implementation goes here
}

// Yorumları göster/gizle fonksiyonu
function snk_main_toggleComments(postId) {
    // Implementation goes here
}

// Yorumu beğenme fonksiyonu
function snk_main_likeComment(commentId, button) {
    // Implementation goes here
}

// Yoruma cevap verme fonksiyonu
function snk_main_replyToComment(commentId, button) {
    // Implementation goes here
}

// Blog gösterme popup fonksiyonu
function snk_main_showBlogPopup(postId) {
    // Implementation goes here
}

// Kategori adını alma fonksiyonu
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

// Metni kısaltma fonksiyonu
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Tarih formatı fonksiyonu
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Kategori görünürlüğünü güncelleme fonksiyonu
function updateCategoryVisibility() {
    // Implementation goes here
}

// Kategoriye göre filtreleme fonksiyonu
function snk_main_filterByCategory(event, category) {
    // Implementation goes here
}

// Şifre gösterme/gizleme butonunu ayarlama fonksiyonu
function snk_main_setupPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Şifre görünürlük butonunu oluştur
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'snk-password-toggle';
        toggleButton.innerHTML = '<i class="far fa-eye"></i>';
        
        // Butonu input'un yanına ekle
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(toggleButton);
        
        // Buton tıklama olayını ekle
        toggleButton.addEventListener('click', togglePasswordVisibility);
    });
}

// Şifre görünürlüğünü değiştirme fonksiyonu
function togglePasswordVisibility(e) {
    e.preventDefault();
    
    const button = e.currentTarget;
    const passwordInput = button.previousElementSibling;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        button.innerHTML = '<i class="far fa-eye-slash"></i>';
            } else {
        passwordInput.type = 'password';
        button.innerHTML = '<i class="far fa-eye"></i>';
    }
}

// Login popup kapatma butonunu ayarlama fonksiyonu
function snk_main_setupLoginPopupClose() {
    // Implementation goes here
}

// Login popup kapatma fonksiyonu
function closeLoginPopup(e) {
    // Implementation goes here
}

// Login popup açma fonksiyonu
function snk_main_openLoginPopup() {
    // Implementation goes here
}

// Login popup kapatma fonksiyonu
function snk_main_closeLoginPopup() {
    // Implementation goes here
}

// Giriş/Kayıt form geçişlerini ayarlama fonksiyonu
function snk_main_setupAuthFormToggles() {
    // Implementation goes here
}
