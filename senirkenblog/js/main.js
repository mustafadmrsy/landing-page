document.addEventListener('DOMContentLoaded', function() {
    // Beğenme fonksiyonu
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

    // Büyütme fonksiyonu
    const overlay = document.querySelector('.overlay');
    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const article = this.closest('.blog-post');
            const countElement = article.querySelector('.social-btn:nth-child(2) .social-count');
            
            if (!article.classList.contains('article-expanded')) {
                // Büyüt
                article.classList.add('article-expanded');
                overlay.classList.add('expanded');
                document.body.style.overflow = 'hidden';
                
                // Animasyon için kısa gecikme
                requestAnimationFrame(() => {
                    article.classList.add('active');
                });
                
                // Görüntülenme sayacını sadece ilk seferde artır
                if (!this.classList.contains('viewed')) {
                    let count = parseInt(countElement.textContent);
                    count++;
                    countElement.textContent = count;
                    countElement.classList.add('count-animate');
                    setTimeout(() => countElement.classList.remove('count-animate'), 500);
                    this.classList.add('viewed');
                }
            } else {
                // Küçült
                article.classList.remove('active');
                overlay.classList.remove('expanded');
                
                // Animasyon bittikten sonra temizle
                setTimeout(() => {
                    article.classList.remove('article-expanded');
                    document.body.style.overflow = 'auto';
                }, 400);
            }
        });
    });

    // Overlay tıklama
    overlay.addEventListener('click', function() {
        const expandedArticle = document.querySelector('.article-expanded');
        if (expandedArticle) {
            expandedArticle.classList.remove('active');
            this.classList.remove('expanded');
            
            setTimeout(() => {
                expandedArticle.classList.remove('article-expanded');
                document.body.style.overflow = 'auto';
            }, 400);
        }
    });
});
