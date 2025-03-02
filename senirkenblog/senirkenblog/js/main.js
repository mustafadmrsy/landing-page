document.addEventListener('DOMContentLoaded', function() {
    // Overlay elementini oluştur
    const overlay = document.createElement('div');
    overlay.className = 'content-overlay';
    document.body.appendChild(overlay);

    // Beğeni butonu işlevselliği
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const countElement = this.querySelector('.social-count');
            let count = parseInt(countElement.textContent);
            
            if (!this.classList.contains('active')) {
                count++;
                this.classList.add('active');
                countElement.textContent = count;
                countElement.classList.add('count-animate');
                setTimeout(() => countElement.classList.remove('count-animate'), 500);
            } else {
                count--;
                this.classList.remove('active');
                countElement.textContent = count;
            }
        });
    });

    // Devamını Oku butonu işlevselliği
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const article = this.closest('.blog-post');
            const readMoreText = this.querySelector('.read-more-text');
            const viewCount = article.querySelector('.view-btn .social-count');
            const fullContent = article.querySelector('.post-full-content');
            
            if (!article.classList.contains('expanded')) {
                // İçeriği genişlet ve overlay'i aktifleştir
                article.classList.add('expanded');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                readMoreText.textContent = 'Küçült';
                
                // Görüntülenme sayısını artır ve animasyon ekle
                if (!this.classList.contains('viewed')) {
                    let count = parseInt(viewCount.textContent);
                    count++;
                    viewCount.textContent = count;
                    viewCount.classList.add('count-animate');
                    setTimeout(() => viewCount.classList.remove('count-animate'), 500);
                    this.classList.add('viewed');
                }

                // Tam içeriği göster
                if (fullContent) {
                    fullContent.style.display = 'block';
                    setTimeout(() => {
                        fullContent.style.opacity = '1';
                        fullContent.style.transform = 'translateY(0)';
                    }, 10);
                }
            } else {
                // İçeriği küçült ve overlay'i kaldır
                article.classList.remove('expanded');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
                readMoreText.textContent = 'Devamını Oku';

                // Tam içeriği gizle
                if (fullContent) {
                    fullContent.style.opacity = '0';
                    fullContent.style.transform = 'translateY(-20px)';
                    setTimeout(() => {
                        fullContent.style.display = 'none';
                    }, 300);
                }
            }
        });
    });

    // Overlay'e tıklandığında içeriği küçült
    overlay.addEventListener('click', function() {
        const expandedArticle = document.querySelector('.blog-post.expanded');
        if (expandedArticle) {
            const readMoreBtn = expandedArticle.querySelector('.read-more-btn');
            const fullContent = expandedArticle.querySelector('.post-full-content');
            
            expandedArticle.classList.remove('expanded');
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
            readMoreBtn.querySelector('.read-more-text').textContent = 'Devamını Oku';

            // Tam içeriği gizle
            if (fullContent) {
                fullContent.style.opacity = '0';
                fullContent.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    fullContent.style.display = 'none';
                }, 300);
            }
        }
    });

    // Paylaşım butonları işlevselliği
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = window.location.href;
            const title = document.querySelector('.post-title').textContent;
            
            switch(true) {
                case this.classList.contains('twitter'):
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
                    break;
                case this.classList.contains('facebook'):
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    break;
                case this.classList.contains('linkedin'):
                    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
                    break;
                case this.classList.contains('copy-link'):
                    navigator.clipboard.writeText(url).then(() => {
                        const originalTitle = this.getAttribute('title');
                        this.setAttribute('title', 'Kopyalandı!');
                        setTimeout(() => {
                            this.setAttribute('title', originalTitle);
                        }, 2000);
                    });
                    break;
            }
        });
    });
});
