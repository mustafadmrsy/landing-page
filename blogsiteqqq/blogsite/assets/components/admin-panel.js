/**
 * Admin Panel - SNK Blog
 * Admin panelindeki JavaScript işlevleri
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Panel JS loaded');
    
    // Tab sistemi
    initTabs();
    
    // Modal işlemleri
    initModal();
    
    // AJAX çağrıları için CSRF koruması ayarla
    setupAjaxCsrf();
    
    // Tablo işlemleri
    initDataTables();
    
    // Kategori form işlemleri
    handleCategoryForm();
    
    // Blog başlıklarına tıklama dinleyicisi ekle
    addPostTitleClickListeners();
});

/**
 * Tab sistemini başlat
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Aktif sekme sınıfını kaldır
            tabs.forEach(t => t.classList.remove('active'));
            
            // Tıklanan sekmeye aktif sınıfı ekle
            this.classList.add('active');
            
            // Tüm içerikleri gizle
            tabContents.forEach(content => content.classList.remove('active'));
            
            // İlgili içeriği göster
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Modal işlevlerini başlat
 */
function initModal() {
    const modal = document.getElementById('postDetailModal');
    const closeButton = document.querySelector('.close-modal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // Kapatma düğmesine tıklandığında modalı kapat
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Kapatma butonuna tıklandığında modalı kapat
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Modal dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Onay ve red butonları
    const approveBtn = document.getElementById('approvePostBtn');
    const rejectBtn = document.getElementById('rejectPostBtn');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            const postId = document.getElementById('hdnCurrentPostId').value;
            if (postId) {
                if (confirm('Bu yazıyı onaylamak istediğinize emin misiniz?')) {
                    updatePostStatus(postId, 1); // 1 = Onaylı
                }
            }
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            const postId = document.getElementById('hdnCurrentPostId').value;
            if (postId) {
                if (confirm('Bu yazıyı reddetmek istediğinize emin misiniz?')) {
                    updatePostStatus(postId, 2); // 2 = Reddedildi
                }
            }
        });
    }
}

/**
 * AJAX CSRF koruması için gerekli yapılandırmayı ayarla
 */
function setupAjaxCsrf() {
    // ASP.NET AJAX için CSRF token ayarı
    if (typeof Sys !== 'undefined' && Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.WebForms.PageRequestManager.getInstance().add_beginRequest(function(sender, args) {
            if (args.get_postBackElement().id) {
                // İşlem başladığında spinner göster
                showSpinner();
            }
        });
        
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function() {
            // İşlem bittiğinde spinner gizle
            hideSpinner();
        });
    }
}

/**
 * Blog yazısı detaylarını göster
 * @param {number} postId - Blog yazısı ID'si
 */
function showPostDetail(postId) {
    if (!postId) return;
    
    showSpinner();
    
    // AJAX ile yazı detaylarını getir
    $.ajax({
        type: "POST",
        url: "admin.aspx/GetPostDetails",
        data: JSON.stringify({ postId: postId }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            hideSpinner();
            
            if (response && response.d) {
                var post = response.d;
                
                // Modal içeriğini doldur
                document.getElementById('postTitle').textContent = post.Title;
                document.getElementById('postCategory').textContent = post.CategoryName;
                document.getElementById('postAuthor').textContent = post.Username;
                document.getElementById('postDate').textContent = formatDate(post.CreatedAt);
                
                // Durum badge'i
                const statusBadge = document.getElementById('postStatus');
                statusBadge.textContent = getStatusText(post.ApprovalStatus);
                statusBadge.className = 'status-badge ' + getStatusClass(post.ApprovalStatus);
                
                // İçerik
                document.getElementById('postContent').innerHTML = post.Content;
                
                // Etiketler
                const tagsElement = document.getElementById('postTags');
                tagsElement.innerHTML = '';
                
                if (post.Tags && post.Tags.length > 0) {
                    const tagsArray = post.Tags.split(',');
                    tagsArray.forEach(tag => {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = 'tag';
                        tagSpan.textContent = tag.trim();
                        tagsElement.appendChild(tagSpan);
                    });
                } else {
                    tagsElement.textContent = 'Etiket bulunmuyor';
                }
                
                // Post ID'sini gizli input'a kaydet
                document.getElementById('hdnCurrentPostId').value = post.PostID;
                
                // Durum butonlarını göster/gizle
                const approveBtn = document.getElementById('approvePostBtn');
                const rejectBtn = document.getElementById('rejectPostBtn');
                
                if (post.ApprovalStatus === 0) { // Onay bekliyor
                    approveBtn.style.display = 'inline-block';
                    rejectBtn.style.display = 'inline-block';
                } else if (post.ApprovalStatus === 1) { // Onaylandı
                    approveBtn.style.display = 'none';
                    rejectBtn.style.display = 'inline-block';
                } else if (post.ApprovalStatus === 2) { // Reddedildi
                    approveBtn.style.display = 'inline-block';
                    rejectBtn.style.display = 'none';
                }
                
                // Modalı göster
                document.getElementById('postDetailModal').style.display = 'block';
            } else {
                alert('Blog yazısı bilgileri alınamadı.');
            }
        },
        error: function(error) {
            hideSpinner();
            console.error('AJAX Error:', error);
            alert('Blog yazısı bilgileri alınırken bir hata oluştu: ' + error.statusText);
        }
    });
}

/**
 * Blog yazısı durumunu güncelle
 * @param {number} postId - Blog yazısı ID'si
 * @param {number} status - Durum kodu (0: Onay bekliyor, 1: Onaylı, 2: Reddedildi)
 */
function updatePostStatus(postId, status) {
    if (!postId) return;
    
    showSpinner();
    
    // AJAX ile durum güncelle
    $.ajax({
        type: "POST",
        url: "admin.aspx/UpdatePostStatus",
        data: JSON.stringify({ postId: postId, status: status }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            hideSpinner();
            
            if (response && response.d) {
                // Modalı kapat
                document.getElementById('postDetailModal').style.display = 'none';
                
                // Sayfayı yenile
                location.reload();
            } else {
                alert('İşlem başarısız. Lütfen tekrar deneyin.');
            }
        },
        error: function(error) {
            hideSpinner();
            console.error('AJAX Error:', error);
            alert('Durum güncellenirken bir hata oluştu: ' + error.statusText);
        }
    });
}

/**
 * Durum koduna göre metin döndür
 * @param {number} status - Durum kodu
 * @returns {string} Durum metni
 */
function getStatusText(status) {
    switch (status) {
        case 0: return 'Onay Bekliyor';
        case 1: return 'Onaylandı';
        case 2: return 'Reddedildi';
        default: return 'Bilinmiyor';
    }
}

/**
 * Durum koduna göre CSS sınıfı döndür
 * @param {number} status - Durum kodu
 * @returns {string} CSS sınıfı
 */
function getStatusClass(status) {
    switch (status) {
        case 0: return 'status-pending';
        case 1: return 'status-approved';
        case 2: return 'status-rejected';
        default: return '';
    }
}

/**
 * Tarih formatını düzenle
 * @param {string} dateString - ISO formatında tarih
 * @returns {string} Formatlanmış tarih
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return dateString;
    }
    
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Spinner göster
 */
function showSpinner() {
    // Spinner varsa göster yoksa oluştur
    let spinner = document.getElementById('ajaxSpinner');
    
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'ajaxSpinner';
        spinner.className = 'ajax-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
    }
    
    spinner.style.display = 'flex';
}

/**
 * Spinner gizle
 */
function hideSpinner() {
    const spinner = document.getElementById('ajaxSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

/**
 * Tablo işlemleri
 */
function initDataTables() {
    // Tablo işlemleri için gerekli kod burada eklenecek
}

/**
 * Kategori form işlemleri
 */
function handleCategoryForm() {
    // Kategori form işlemleri için gerekli kod burada eklenecek
}

/**
 * Blog başlıklarına tıklama olayı dinleyicileri ekle
 */
function addPostTitleClickListeners() {
    const postTitleLinks = document.querySelectorAll('.post-title-link');
    
    postTitleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            if (postId) {
                showPostDetail(postId);
            }
        });
    });
} 