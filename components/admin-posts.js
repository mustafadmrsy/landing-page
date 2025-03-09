/**
 * Admin Posts Handler - Senirkent Blog
 * Bu dosya admin panelinde blog yazılarını yönetme işlemlerini sağlar.
 */

// DOM Elements
const pendingPostsContainer = document.getElementById('pending-posts');
const publishedPostsContainer = document.getElementById('published-posts');
const pendingPostsLoader = document.getElementById('pending-posts-loader');
const publishedPostsLoader = document.getElementById('published-posts-loader');

// Sayfa yüklendiğinde postları yükle
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Posts Handler başlatıldı');
    loadPendingPosts();
    loadPublishedPosts();
    
    // Yenileme butonuna tıklama olayını ekle
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            loadPendingPosts();
            loadPublishedPosts();
        });
    }
});

/**
 * Tüm postları yükler
 * @returns {Promise<Array>} Yüklenen postlar dizisi
 */
async function loadAllPosts() {
    // Loader'ları göster
    if (pendingPostsLoader) {
        pendingPostsLoader.style.display = 'block';
    }
    if (publishedPostsLoader) {
        publishedPostsLoader.style.display = 'block';
    }

    // localStorage'dan postları yükle - İki farklı anahtar kontrolü yapılıyor
    let allPosts = JSON.parse(localStorage.getItem('snk_blog_posts') || '[]');
    
    // Eğer snk_blog_posts boş ama eski anahtar snk_blogPosts doluysa, onun içeriğini kullan
    if (allPosts.length === 0) {
        allPosts = JSON.parse(localStorage.getItem('snk_blogPosts') || '[]');
        
        // Eğer eski anahtardan veri yüklendiyse, yeni anahtara da kaydet
        if (allPosts.length > 0) {
            localStorage.setItem('snk_blog_posts', JSON.stringify(allPosts));
            console.log('Blog yazıları yeni anahtara taşındı: snk_blog_posts');
        }
    }
    
    // Post ID'lerini kontrol et ve gerekirse ekle
    allPosts = allPosts.map(post => {
        if (!post.id) {
            post.id = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return post;
    });
    
    return allPosts;
}

/**
 * Onay bekleyen postları yükler ve gösterir
 */
async function loadPendingPosts() {
    try {
        const allPosts = await loadAllPosts();
        
        // Onay bekleyen yazıları filtrele
        const pendingPosts = allPosts.filter(post => post.status === 'pending');
        
        // Yükleme animasyonunu gizle
        if (pendingPostsLoader) {
            pendingPostsLoader.style.display = 'none';
        }
        
        // Container'ı temizle
        pendingPostsContainer.innerHTML = '';
        
        // Eğer onay bekleyen yazı yoksa bilgi mesajı göster
        if (pendingPosts.length === 0) {
            pendingPostsContainer.innerHTML = '<div class="no-data-message">Onay bekleyen yazı bulunmamaktadır.</div>';
            return;
        }
        
        // Her bir onay bekleyen yazı için HTML oluştur
        pendingPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'admin-post-item';
            postElement.setAttribute('data-post-id', post.id);
            
            // İçerik uzunluğunu kontrol et ve düzgün görüntülenecek şekilde ayarla
            const displayContent = post.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            postElement.innerHTML = `
                <div class="admin-post-header">
                    <h3 class="admin-post-title">${post.title}</h3>
                    <span class="admin-post-category">Kategori: ${post.category}</span>
                </div>
                <div class="admin-post-meta">
                    <span class="admin-post-author">Yazar: ${post.author}</span>
                    <span class="admin-post-date">Tarih: ${post.date}</span>
                </div>
                ${post.image ? `
                <div class="admin-post-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                ` : ''}
                <div class="admin-post-summary">
                    <p>${post.summary}</p>
                    <button class="admin-view-full-post">Tüm İçeriği Görüntüle</button>
                </div>
                <div class="admin-post-content" style="display: none;">
                    <div class="content-wrapper">${displayContent}</div>
                    ${post.tags && post.tags.length ? `
                        <div class="admin-post-tags">
                            ${post.tags.map(tag => `<span class="admin-tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="admin-post-actions">
                    <button class="admin-approve-post" data-post-id="${post.id}">Onayla</button>
                    <button class="admin-reject-post" data-post-id="${post.id}">Reddet</button>
                </div>
            `;
            
            pendingPostsContainer.appendChild(postElement);
        });
        
        // İçerik görüntüleme butonlarını etkinleştir
        setupViewContentButtons(pendingPostsContainer);
        
        // Post onaylama ve reddetme işlemlerini etkinleştir
        setupPostApprovalActions();
    } catch (error) {
        console.error('Onay bekleyen yazıları yüklerken hata:', error);
        if (pendingPostsContainer) {
            pendingPostsContainer.innerHTML = '<div class="no-data-message">Yazıları yüklerken bir hata oluştu.</div>';
        }
        if (pendingPostsLoader) {
            pendingPostsLoader.style.display = 'none';
        }
    }
}

/**
 * Yayında olan postları yükler ve gösterir
 */
async function loadPublishedPosts() {
    try {
        const allPosts = await loadAllPosts();
        
        // Yayında olan yazıları filtrele (onaylanmış olanlar)
        const publishedPosts = allPosts.filter(post => post.status === 'approved' || !post.status);
        
        // Yükleme animasyonunu gizle
        if (publishedPostsLoader) {
            publishedPostsLoader.style.display = 'none';
        }
        
        // Container'ı temizle
        publishedPostsContainer.innerHTML = '';
        
        // Eğer yayında olan yazı yoksa bilgi mesajı göster
        if (publishedPosts.length === 0) {
            publishedPostsContainer.innerHTML = '<div class="no-data-message">Yayında olan yazı bulunmamaktadır.</div>';
            return;
        }
        
        // Her bir yayında olan yazı için HTML oluştur
        publishedPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'admin-post-item';
            postElement.setAttribute('data-post-id', post.id);
            
            // İçerik uzunluğunu kontrol et ve düzgün görüntülenecek şekilde ayarla
            const displayContent = post.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            postElement.innerHTML = `
                <div class="admin-post-header">
                    <h3 class="admin-post-title">${post.title}</h3>
                    <span class="admin-post-category">Kategori: ${post.category}</span>
                </div>
                <div class="admin-post-meta">
                    <span class="admin-post-author">Yazar: ${post.author}</span>
                    <span class="admin-post-date">Tarih: ${post.date}</span>
                    <span class="admin-post-status">Durum: ${post.status === 'approved' ? 'Onaylanmış' : 'Yayında'}</span>
                </div>
                ${post.image ? `
                <div class="admin-post-image">
                    <img src="${post.image}" alt="${post.title}" />
                </div>
                ` : ''}
                <div class="admin-post-summary">
                    <p>${post.summary}</p>
                    <button class="admin-view-full-post">Tüm İçeriği Görüntüle</button>
                </div>
                <div class="admin-post-content" style="display: none;">
                    <div class="content-wrapper">${displayContent}</div>
                    ${post.tags && post.tags.length ? `
                        <div class="admin-post-tags">
                            ${post.tags.map(tag => `<span class="admin-tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="admin-post-actions">
                    <button class="admin-delete-post" data-post-id="${post.id}">Sil</button>
                </div>
            `;
            
            publishedPostsContainer.appendChild(postElement);
        });
        
        // İçerik görüntüleme butonlarını etkinleştir
        setupViewContentButtons(publishedPostsContainer);
        
        // Post silme işlemlerini etkinleştir
        setupPostDeleteActions();
    } catch (error) {
        console.error('Yayında olan yazıları yüklerken hata:', error);
        if (publishedPostsContainer) {
            publishedPostsContainer.innerHTML = '<div class="no-data-message">Yazıları yüklerken bir hata oluştu.</div>';
        }
        if (publishedPostsLoader) {
            publishedPostsLoader.style.display = 'none';
        }
    }
}

/**
 * Belirtilen ID'ye sahip yazıyı onaylar
 * @param {string} postId - Onaylanacak yazının ID'si
 */
function approvePost(postId) {
    console.log(`Yazı onaylanıyor: ${postId}`);
    
    // Onay işlemi için onay kutusu göster
    if (confirm('Bu yazıyı onaylamak istediğinize emin misiniz?')) {
        // LocalStorage'dan tüm yazıları al
        const allPosts = JSON.parse(localStorage.getItem('snk_blog_posts') || '[]');
        
        // Onaylanacak yazıyı bul
        const postIndex = allPosts.findIndex(post => post.id.toString() === postId.toString());
        
        if (postIndex !== -1) {
            // Yazının durumunu "approved" olarak güncelle
            allPosts[postIndex].status = 'approved';
            allPosts[postIndex].approvedDate = new Date().toLocaleDateString('tr-TR');
            
            // LocalStorage'a kaydet
            localStorage.setItem('snk_blog_posts', JSON.stringify(allPosts));
            
            // Yazının yazarının ID'sini al
            const authorId = allPosts[postIndex].author_id;
            
            // Yazarın yazılarını da güncelle
            if (authorId) {
                const userPosts = JSON.parse(localStorage.getItem(`snk_user_posts_${authorId}`) || '[]');
                const userPostIndex = userPosts.findIndex(post => post.id.toString() === postId.toString());
                
                if (userPostIndex !== -1) {
                    userPosts[userPostIndex].status = 'approved';
                    userPosts[userPostIndex].approvedDate = allPosts[postIndex].approvedDate;
                    localStorage.setItem(`snk_user_posts_${authorId}`, JSON.stringify(userPosts));
                }
            }
            
            // Sayfayı yenile
            loadPendingPosts();
            loadPublishedPosts();
            
            // Başarı mesajı göster
            alert('Yazı başarıyla onaylandı!');
        } else {
            alert('Yazı bulunamadı!');
        }
    }
}

/**
 * Belirtilen ID'ye sahip yazıyı reddeder
 * @param {string} postId - Reddedilecek yazının ID'si
 */
function rejectPost(postId) {
    console.log(`Yazı reddediliyor: ${postId}`);
    
    // Red işlemi için onay kutusu göster
    if (confirm('Bu yazıyı reddetmek istediğinize emin misiniz?')) {
        // LocalStorage'dan tüm yazıları al
        const allPosts = JSON.parse(localStorage.getItem('snk_blog_posts') || '[]');
        
        // Reddedilecek yazıyı bul
        const postIndex = allPosts.findIndex(post => post.id.toString() === postId.toString());
        
        if (postIndex !== -1) {
            // Yazının durumunu "rejected" olarak güncelle
            allPosts[postIndex].status = 'rejected';
            allPosts[postIndex].rejectedDate = new Date().toLocaleDateString('tr-TR');
            
            // LocalStorage'a kaydet
            localStorage.setItem('snk_blog_posts', JSON.stringify(allPosts));
            
            // Yazının yazarının ID'sini al
            const authorId = allPosts[postIndex].author_id;
            
            // Yazarın yazılarını da güncelle
            if (authorId) {
                const userPosts = JSON.parse(localStorage.getItem(`snk_user_posts_${authorId}`) || '[]');
                const userPostIndex = userPosts.findIndex(post => post.id.toString() === postId.toString());
                
                if (userPostIndex !== -1) {
                    userPosts[userPostIndex].status = 'rejected';
                    userPosts[userPostIndex].rejectedDate = allPosts[postIndex].rejectedDate;
                    localStorage.setItem(`snk_user_posts_${authorId}`, JSON.stringify(userPosts));
                }
            }
            
            // Sayfayı yenile
            loadPendingPosts();
            
            // Bilgi mesajı göster
            alert('Yazı reddedildi!');
        } else {
            alert('Yazı bulunamadı!');
        }
    }
}

/**
 * Belirtilen ID'ye sahip yazıyı siler
 * @param {string} postId - Silinecek yazının ID'si
 */
function deletePost(postId) {
    console.log(`Yazı siliniyor: ${postId}`);
    
    // Silme işlemi için onay kutusu göster
    if (confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
        // LocalStorage'dan tüm yazıları al
        const allPosts = JSON.parse(localStorage.getItem('snk_blog_posts') || '[]');
        
        // Silinecek yazıyı bul
        const postIndex = allPosts.findIndex(post => post.id.toString() === postId.toString());
        
        if (postIndex !== -1) {
            // Yazıyı listeden kaldır
            allPosts.splice(postIndex, 1);
            
            // LocalStorage'a kaydet
            localStorage.setItem('snk_blog_posts', JSON.stringify(allPosts));
            
            // Yazının yazarının ID'sini al
            const authorId = allPosts[postIndex].author_id;
            
            // Yazarın yazılarını da güncelle
            if (authorId) {
                const userPosts = JSON.parse(localStorage.getItem(`snk_user_posts_${authorId}`) || '[]');
                const userPostIndex = userPosts.findIndex(post => post.id.toString() === postId.toString());
                
                if (userPostIndex !== -1) {
                    userPosts.splice(userPostIndex, 1);
                    localStorage.setItem(`snk_user_posts_${authorId}`, JSON.stringify(userPosts));
                }
            }
            
            // Sayfayı yenile
            loadPublishedPosts();
            
            // Bilgi mesajı göster
            alert('Yazı silindi!');
        } else {
            alert('Yazı bulunamadı!');
        }
    }
}

// İçerik görüntüleme butonlarını etkinleştir
function setupViewContentButtons(container) {
    const viewFullButtons = container.querySelectorAll('.admin-view-full-post');
    
    viewFullButtons.forEach(button => {
        button.addEventListener('click', function() {
            const contentDiv = this.parentNode.nextElementSibling;
            const isVisible = contentDiv.style.display !== 'none';
            contentDiv.style.display = isVisible ? 'none' : 'block';
            this.textContent = isVisible ? 'Tüm İçeriği Görüntüle' : 'İçeriği Gizle';
        });
    });
}

// Post onaylama ve reddetme işlemlerini etkinleştir
function setupPostApprovalActions() {
    const approveButtons = document.querySelectorAll('.admin-approve-post');
    const rejectButtons = document.querySelectorAll('.admin-reject-post');
    
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            approvePost(postId);
        });
    });
    
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            rejectPost(postId);
        });
    });
}

// Post silme işlemlerini etkinleştir
function setupPostDeleteActions() {
    const deleteButtons = document.querySelectorAll('.admin-delete-post');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            deletePost(postId);
        });
    });
}

// Global erişim için
window.loadPendingPosts = loadPendingPosts;
window.loadPublishedPosts = loadPublishedPosts;
window.approvePost = approvePost;
window.rejectPost = rejectPost;
window.deletePost = deletePost;
