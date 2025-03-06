/**
 * Senirkent MYO Blog - Popup İşleyici
 * Açıklama: Blog yazılarının popup olarak gösterilmesi ve kapatılması işlemleri
 * Yazar: Mustafa Demirsoy
 * Sürüm: 1.6.0
 * Güncelleme Tarihi: 6 Mart 2025
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup handler loaded v1.6.0 - Mobil uyumlu düzeltme');
    
    // Debug: blogData nesnesini kontrol et
    console.log('blogData mevcut mu?', window.blogData ? 'Evet' : 'Hayır');
    if (window.blogData) {
        console.log('blogData örnek:', window.blogData.blogPosts[0]);
    }
    
    // Popup elementlerini oluştur veya mevcut olanı güncelle
    let blogPopupOverlay = document.querySelector('.blog-popup-overlay');
    
    // Eğer popup overlay yoksa oluştur
    if (!blogPopupOverlay) {
        const popupHTML = `
            <div class="blog-popup-overlay">
                <div class="blog-popup-content">
                    <span class="blog-popup-close">&times;</span>
                    <div class="blog-popup-body">
                        <h2 class="blog-popup-title"></h2>
                        <div class="blog-popup-meta">
                            <span class="blog-popup-author"></span>
                            <span class="blog-popup-date"></span>
                        </div>
                        <div class="blog-popup-tags"></div>
                        <div class="blog-popup-content-text"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        blogPopupOverlay = document.querySelector('.blog-popup-overlay');
    } 
    // Eğer popup overlay varsa ama eski yapıdaysa, yeni yapıya güncelle
    else if (!blogPopupOverlay.querySelector('.blog-popup-title')) {
        // Eski popup içeriğini temizle
        blogPopupOverlay.innerHTML = `
            <div class="blog-popup-content">
                <span class="blog-popup-close">&times;</span>
                <div class="blog-popup-body">
                    <h2 class="blog-popup-title"></h2>
                    <div class="blog-popup-meta">
                        <span class="blog-popup-author"></span>
                        <span class="blog-popup-date"></span>
                    </div>
                    <div class="blog-popup-tags"></div>
                    <div class="blog-popup-content-text"></div>
                </div>
            </div>
        `;
    }

    // Popup elementlerini seç
    const blogPopupTitle = document.querySelector('.blog-popup-title');
    const blogPopupAuthor = document.querySelector('.blog-popup-author');
    const blogPopupDate = document.querySelector('.blog-popup-date');
    const blogPopupTags = document.querySelector('.blog-popup-tags');
    const blogPopupContentText = document.querySelector('.blog-popup-content-text');
    const blogPopupClose = document.querySelector('.blog-popup-close');
    const blogPopupContent = document.querySelector('.blog-popup-content');
    
    // DOM elementlerinin varlığını kontrol et
    if (!blogPopupTitle || !blogPopupAuthor || !blogPopupDate || !blogPopupTags || !blogPopupContentText) {
        console.error('Popup elementleri bulunamadı!', {
            title: blogPopupTitle,
            author: blogPopupAuthor,
            date: blogPopupDate,
            tags: blogPopupTags,
            content: blogPopupContentText
        });
        return; // Elementler bulunamazsa işlemi sonlandır
    }

    // Global işlev olarak tanımla
    window.showBlogPopup = function(postIdOrObject) {
        console.log('showBlogPopup fonksiyonu çağrıldı');
        
        let post = null;
        
        // postIdOrObject bir ID mi yoksa direkt post objesi mi kontrol et
        if (typeof postIdOrObject === 'object') {
            post = postIdOrObject;
            console.log('Direkt post objesi alındı');
        } else {
            // ID olarak geldiyse postu bul
            const postId = postIdOrObject;
            
            // Önce global blogData'dan post'u bulmaya çalış
            if (window.blogData && window.blogData.blogPosts) {
                post = window.blogData.blogPosts.find(p => p.id === postId || p.id === parseInt(postId));
                console.log('Global blogData\'dan post bulundu mu?', post ? 'Evet' : 'Hayır');
            }
        }
        
        // Post bulundu mu kontrol et
        if (post) {
            try {
                // Popup içeriğini doldur
                blogPopupTitle.textContent = post.title || 'Blog Yazısı';
                blogPopupAuthor.textContent = post.author ? `Yazar: ${post.author}` : '';
                blogPopupDate.textContent = post.date ? `Tarih: ${post.date}` : '';
                
                // Etiketleri ekle
                if (post.tags && post.tags.length > 0) {
                    blogPopupTags.innerHTML = '';
                    post.tags.forEach(tag => {
                        const tagElement = document.createElement('span');
                        tagElement.classList.add('blog-tag');
                        tagElement.textContent = tag;
                        blogPopupTags.appendChild(tagElement);
                    });
                    blogPopupTags.style.display = 'block';
                } else {
                    blogPopupTags.style.display = 'none';
                }
                
                // İçeriği ekle
                if (post.content) {
                    blogPopupContentText.innerHTML = post.content;
                } else {
                    blogPopupContentText.innerHTML = '<p>İçerik bulunamadı.</p>';
                }
                
                // Popup'ı göster
                blogPopupOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Scroll'u devre dışı bırak
                
                console.log('Popup gösterildi');
            } catch (error) {
                console.error('Popup içeriği doldurulurken hata oluştu:', error);
            }
        } else {
            console.error('Post bulunamadı, ID:', postIdOrObject);
        }
    };

    // Devamını oku butonlarına tıklama olayı ekle
    const readMoreButtons = document.querySelectorAll('.btn-daha, .read-more');
    
    if (readMoreButtons.length > 0) {
        console.log('Devamını oku butonları bulundu:', readMoreButtons.length);
        
        readMoreButtons.forEach(button => {
            // TOUCH EVENT - MOBİL CİHAZLAR İÇİN ÇOK ÖNEMLİ
            button.addEventListener('touchend', function(event) {
                // Tıklama olayının tüm diğer işlemleri durdur - ÇOK ÖNEMLİ
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                console.log('Devamını oku butonuna mobil dokunma olayı yakalandı');
                
                // Post ID'sini al
                const postId = this.getAttribute('data-post-id');
                console.log('Post ID:', postId);
                
                // Popup göster
                if (postId) {
                    window.showBlogPopup(postId);
                }
                
                return false; // Olayın daha fazla işlenmesini engelle
            }, { capture: true, passive: false });
            
            // NORMAL CLICK EVENT - MASAÜSTÜ CİHAZLAR İÇİN
            button.addEventListener('click', function(event) {
                // Tıklama olayının tüm diğer işlemleri durdur - ÇOK ÖNEMLİ
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                console.log('Devamını oku butonuna tıklama olayı yakalandı');
                
                // Post ID'sini al
                const postId = this.getAttribute('data-post-id');
                console.log('Post ID:', postId);
                
                // Popup göster
                if (postId) {
                    window.showBlogPopup(postId);
                }
                
                return false; // Olayın daha fazla işlenmesini engelle
            }, { capture: true });
        });
    } else {
        console.warn('Devamını oku butonları bulunamadı');
    }

    // Popup kapatma işlevi
    function closePopup() {
        if (blogPopupOverlay) {
            blogPopupOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Scroll'u tekrar etkinleştir
            console.log('Popup kapatıldı');
        }
    }

    // Popup content tıklamalarının overlay'e yayılmasını engelle
    if (blogPopupContent) {
        blogPopupContent.addEventListener('click', function(event) {
            event.stopPropagation(); // Olayın üst elementlere yayılmasını önle
            
            // Mobil görünümde ek koruma
            if (window.innerWidth <= 768) {
                event.stopImmediatePropagation();
            }
        }, { capture: true });
    }
    
    // Popup kapatma butonuna tıklama olayı
    if (blogPopupClose) {
        // TOUCH EVENT - MOBİL CİHAZLAR İÇİN
        blogPopupClose.addEventListener('touchend', function(event) {
            event.preventDefault();
            event.stopPropagation();
            closePopup();
            return false;
        }, { capture: true, passive: false });
        
        // CLICK EVENT - MASAÜSTÜ CİHAZLAR İÇİN
        blogPopupClose.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            closePopup();
            return false;
        }, { capture: true });
    }
    
    // Overlay tıklaması ile popupı kapat
    if (blogPopupOverlay) {
        // TOUCH EVENT - MOBİL CİHAZLAR İÇİN
        blogPopupOverlay.addEventListener('touchend', function(event) {
            // Sadece doğrudan overlay'e tıklandığında kapat (içeriğe tıklanınca değil)
            if (event.target === this) {
                event.preventDefault();
                closePopup();
            }
        }, { capture: true, passive: false });
        
        // CLICK EVENT - MASAÜSTÜ CİHAZLAR İÇİN
        blogPopupOverlay.addEventListener('click', function(event) {
            // Sadece doğrudan overlay'e tıklandığında kapat (içeriğe tıklanınca değil)
            if (event.target === this) {
                closePopup();
            }
        }, { capture: true });
    }
    
    // ESC tuşu ile popupı kapat
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && blogPopupOverlay && blogPopupOverlay.classList.contains('active')) {
            closePopup();
        }
    });
});
