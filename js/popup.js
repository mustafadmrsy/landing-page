/**
 * Senirkent MYO Blog - Popup Bileşeni
 * Açıklama: Blog yazılarını görüntülemek için popup bileşeni
 * Yazar: Mustafa Demirsoy
 * Sürüm: 1.0.0
 * Güncelleme Tarihi: 5 Mart 2025
 */

/**
 * Popup bileşeni 
 */
function initPopup() {
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
                
                // En yakın blog içeriğini bul
                const parentArticle = this.closest('article') || 
                                     this.closest('.blog-post') || 
                                     this.closest('.blog-content') || 
                                     this.closest('.entry-item') ||
                                     this.closest('.post');
                
                if (!parentArticle) {
                    console.log('Parent article not found, trying to get content from siblings');
                    // Eğer parent article bulunamazsa, aynı seviyedeki diğer elementleri dene
                    const siblings = Array.from(this.parentElement.children);
                    let contentHTML = '';
                    let title = 'Blog Yazısı';
                    
                    siblings.forEach(el => {
                        if (el !== this && !el.classList.contains('btn-daha')) {
                            if (el.tagName === 'H2' || el.tagName === 'H3') {
                                title = el.textContent;
                            } else {
                                contentHTML += el.outerHTML;
                            }
                        }
                    });
                    
                    // Popup içeriğini ayarla
                    blogPopupContent.innerHTML = `
                        <h2>${title}</h2>
                        ${contentHTML}
                    `;
                } else {
                    console.log('Parent article found:', parentArticle.className);
                    // Blog başlığı ve içeriğini al
                    const postTitle = parentArticle.querySelector('.post-title')?.textContent || 
                                    parentArticle.querySelector('.entry-title')?.textContent ||
                                    parentArticle.querySelector('h2')?.textContent || 
                                    parentArticle.querySelector('h3')?.textContent || 
                                    'Blog Yazısı';
                    
                    // İçerik alanını bul
                    const postFullContent = parentArticle.querySelector('.post-full-content') || 
                                          parentArticle.querySelector('.post-content');
                    
                    let contentHTML = '';
                    
                    if (postFullContent) {
                        contentHTML = postFullContent.innerHTML;
                    } else {
                        // Eğer içerik bulunamazsa, mevcut içeriği kullan
                        const contentElements = parentArticle.querySelectorAll('p, img, h4, ul, ol, blockquote');
                        contentElements.forEach(el => {
                            if (!el.contains(this) && !el.classList.contains('preview')) {
                                contentHTML += el.outerHTML;
                            }
                        });
                    }
                    
                    // Popup içeriğini ayarla
                    blogPopupContent.innerHTML = `
                        <h2>${postTitle}</h2>
                        ${contentHTML}
                    `;
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
        if (e.key === 'Escape' && blogPopupOverlay.classList.contains('active')) {
            blogPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Sayfa yüklendiğinde popup fonksiyonlarını başlat
document.addEventListener('DOMContentLoaded', initPopup);
