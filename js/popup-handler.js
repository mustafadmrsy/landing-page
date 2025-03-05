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
                        // Popup içeriğini ayarla - blog yazısının TAMAMINI göster
                        blogPopupContent.innerHTML = `
                            <article class="blog-post-full">
                                <h2 class="blog-popup-title">${post.title}</h2>
                                <div class="blog-popup-meta">
                                    <span class="blog-popup-meta-item"><i class="far fa-calendar-alt"></i> ${post.date}</span>
                                    <span class="blog-popup-meta-item"><i class="far fa-user"></i> ${post.author}</span>
                                    <span class="blog-popup-meta-item"><i class="far fa-clock"></i> ${post.readTime || '5 dk'} okuma</span>
                                    <span class="blog-popup-meta-item"><i class="far fa-eye"></i> ${post.views || '0'} görüntülenme</span>
                                </div>
                                <div class="blog-popup-body">
                                    ${post.content}
                                </div>
                                <div class="blog-popup-tags">
                                    ${post.tags.map(tag => `<span class="blog-popup-tag"><i class="fas fa-tag"></i> ${tag}</span>`).join('')}
                                </div>
                                <div class="blog-popup-footer">
                                    <button class="social-btn like-btn" data-post-id="${post.id}">
                                        <i class="far fa-heart"></i>
                                        <span class="social-count">0</span>
                                    </button>
                                    <span class="social-btn view-count" data-post-id="${post.id}">
                                        <i class="far fa-eye"></i>
                                        <span class="social-count">${post.views || '0'}</span>
                                    </span>
                                </div>
                            </article>
                        `;
                        
                        // Popup'ı göster
                        blogPopupOverlay.classList.add('active');
                        document.body.style.overflow = 'hidden'; // Arka planı kaydırmayı engelle
                        
                        // Popup içindeki beğeni butonu yönetimi like-handler.js tarafından yapılacak
                        // Burada tekrar event listener eklemiyoruz, bu MutationObserver ile like-handler.js'te yapılıyor
                    } else {
                        // Post bulunamadığında
                        blogPopupContent.innerHTML = `
                            <h2 class="blog-popup-title">Blog yazısı bulunamadı</h2>
                            <p>İstediğiniz blog yazısı bulunamadı. Lütfen tekrar deneyin.</p>
                        `;
                        
                        // Popup'ı göster
                        blogPopupOverlay.classList.add('active');
                        document.body.style.overflow = 'hidden'; // Arka planı kaydırmayı engelle
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
                        
                        // Üst veri bilgilerini al
                        const dateText = parentArticle.querySelector('.meta-item:has(.fa-calendar-alt)')?.textContent || 
                                         parentArticle.querySelector('.entry-date')?.textContent || '';
                        const authorText = parentArticle.querySelector('.meta-item:has(.fa-user)')?.textContent || 
                                          parentArticle.querySelector('.entry-author')?.textContent || '';
                        const readTimeText = parentArticle.querySelector('.meta-item:has(.fa-clock)')?.textContent || 
                                            parentArticle.querySelector('.entry-readtime')?.textContent || '';
                        
                        // İçeriği al - tüm içeriği göster
                        const contentElements = parentArticle.querySelectorAll('.entry-content p, .entry-summary p');
                        let allContent = '';
                        
                        // Tüm içeriği birleştir, "devamını okumak için..." butonunu atla
                        contentElements.forEach(el => {
                            if (!el.querySelector('.btn-daha')) {
                                allContent += el.outerHTML;
                            }
                        });
                        
                        // Eğer içerik bulunamadıysa, tüm HTML içeriği al ama butonu çıkar
                        if (!allContent) {
                            const contentEl = parentArticle.querySelector('.entry-content') || 
                                             parentArticle.querySelector('.entry-summary');
                            if (contentEl) {
                                // İçeriği kopyala
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = contentEl.innerHTML;
                                
                                // Devamını oku butonunu kaldır
                                const btnDaha = tempDiv.querySelector('.btn-daha');
                                if (btnDaha) {
                                    btnDaha.remove();
                                }
                                
                                allContent = tempDiv.innerHTML;
                            }
                        }
                        
                        // Post ID'sini al
                        const postId = this.getAttribute('data-post-id') || 
                                    parentArticle.getAttribute('data-post-id') || 
                                    'unknown';
                        
                        // Popup içeriğini hazırla - tam içeriği göster
                        blogPopupContent.innerHTML = `
                            <article class="blog-post-full">
                                <h2 class="blog-popup-title">${postTitle}</h2>
                                <div class="blog-popup-meta">
                                    <span class="blog-popup-meta-item">${dateText}</span>
                                    <span class="blog-popup-meta-item">${authorText}</span>
                                    <span class="blog-popup-meta-item">${readTimeText}</span>
                                </div>
                                <div class="blog-popup-body">${allContent}</div>
                                <div class="blog-popup-footer">
                                    <button class="social-btn like-btn" data-post-id="${postId}">
                                        <i class="far fa-heart"></i>
                                        <span class="social-count">0</span>
                                    </button>
                                </div>
                            </article>
                        `;
                        
                        // Popup'ı göster
                        blogPopupOverlay.classList.add('active');
                        document.body.style.overflow = 'hidden'; // Arka planı kaydırmayı engelle
                    }
                }
            });
        });
    }
    
    // Popup'ı kapatma fonksiyonu
    if (blogPopupClose) {
        blogPopupClose.addEventListener('click', function() {
            blogPopupOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Arka plan kaydırmayı tekrar etkinleştir
        });
    }
    
    // Popup overlay'e tıklanınca da kapat
    if (blogPopupOverlay) {
        blogPopupOverlay.addEventListener('click', function(e) {
            if (e.target === blogPopupOverlay) {
                blogPopupOverlay.classList.remove('active');
                document.body.style.overflow = ''; // Arka plan kaydırmayı tekrar etkinleştir
            }
        });
    }
    
    // Escape tuşuna basınca da kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogPopupOverlay.classList.contains('active')) {
            blogPopupOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Arka plan kaydırmayı tekrar etkinleştir
        }
    });
});
