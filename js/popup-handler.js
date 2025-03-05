document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup handler loaded');
    
    // Popup elementlerini oluştur (eğer sayfada yoksa)
    if (!document.querySelector('.blog-popup-overlay')) {
        const popupHTML = `
            <div class="blog-popup-overlay">
                <div class="blog-popup">
                    <button class="blog-popup-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="blog-popup-content"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
    
    // Popup elementlerini seç
    const blogPopupOverlay = document.querySelector('.blog-popup-overlay');
    const blogPopupContent = document.querySelector('.blog-popup-content');
    const blogPopupClose = document.querySelector('.blog-popup-close');
    
    // "btn-daha" butonlarına popup işlevselliği ekle
    const btnDahaButtons = document.querySelectorAll('.btn-daha');
    console.log('Found btn-daha buttons:', btnDahaButtons.length);
    
    if (btnDahaButtons.length > 0) {
        btnDahaButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Default düğme davranışını engelle
                e.preventDefault();
                e.stopPropagation();
                console.log('btn-daha clicked');
                
                // Blog yazısını bul
                const postId = this.getAttribute('data-post-id');
                
                // Blogdata'dan yazıyı getir (statik-blog-data.js dosyasından)
                if (postId && window.blogData) {
                    const post = blogData.blogPosts.find(p => p.id === parseInt(postId) || p.id === postId);
                    
                    if (post) {
                        // Popup içeriğini ayarla
                        blogPopupContent.innerHTML = `
                            <h2 class="blog-popup-title">${post.title}</h2>
                            <div class="blog-popup-meta">
                                <span class="blog-popup-meta-item"><i class="far fa-calendar-alt"></i> ${post.date}</span>
                                <span class="blog-popup-meta-item"><i class="far fa-user"></i> ${post.author}</span>
                                <span class="blog-popup-meta-item"><i class="far fa-clock"></i> ${post.readTime} okuma</span>
                            </div>
                            <div class="blog-popup-body">
                                ${post.content}
                            </div>
                            <div class="blog-popup-tags">
                                ${post.tags.map(tag => `<span class="blog-popup-tag"><i class="fas fa-tag"></i> ${tag}</span>`).join('')}
                            </div>
                        `;
                    } else {
                        // Post bulunamadığında
                        blogPopupContent.innerHTML = `
                            <h2 class="blog-popup-title">Blog yazısı bulunamadı</h2>
                            <p>İstediğiniz blog yazısı bulunamadı. Lütfen tekrar deneyin.</p>
                        `;
                    }
                } else {
                    // Default olarak en yakın blog içeriğini kullan
                    const parentArticle = this.closest('article') || 
                                        this.closest('.blog-post') || 
                                        this.closest('.blog-content') || 
                                        this.closest('.entry-item');
                    
                    if (parentArticle) {
                        // Blog başlığı ve içeriğini al
                        const postTitle = parentArticle.querySelector('.entry-title')?.textContent || 
                                        parentArticle.querySelector('h2')?.textContent || 
                                        'Blog Yazısı';
                        
                        // İçerik alanını bul
                        const postFullContent = parentArticle.querySelector('.post-full-content');
                        
                        if (postFullContent) {
                            // Popup içeriğini ayarla
                            blogPopupContent.innerHTML = postFullContent.innerHTML;
                        } else {
                            blogPopupContent.innerHTML = `
                                <h2 class="blog-popup-title">${postTitle}</h2>
                                <p>İçerik bulunamadı.</p>
                            `;
                        }
                    } else {
                        blogPopupContent.innerHTML = `<h2>Blog yazısı bulunamadı</h2>`;
                    }
                }
                
                // Popup'ı göster
                blogPopupOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
    }
    
    // Popup'ı kapatma fonksiyonu
    if (blogPopupClose) {
        blogPopupClose.addEventListener('click', function() {
            blogPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Overlay'e tıklayınca popup'ı kapatma
    if (blogPopupOverlay) {
        blogPopupOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Escape tuşu ile popup'ı kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogPopupOverlay && blogPopupOverlay.classList.contains('active')) {
            blogPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
