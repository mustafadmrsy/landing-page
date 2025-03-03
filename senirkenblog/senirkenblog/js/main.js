document.addEventListener('DOMContentLoaded', function() {
    // Overlay elementini oluştur
    const overlay = document.createElement('div');
    overlay.className = 'content-overlay';
    document.body.appendChild(overlay);

    // Devamını Oku butonu işlevselliği
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const article = this.closest('.blog-post');
            const readMoreText = this.querySelector('.read-more-text');
            const viewCount = article.querySelector('.view-btn .social-count');
            
            if (!article.classList.contains('expanded')) {
                // İçeriği genişlet
                article.classList.add('expanded');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                readMoreText.textContent = 'Küçült';
                
                // Görüntülenme sayısını artır
                if (!this.classList.contains('viewed')) {
                    let count = parseInt(viewCount.textContent);
                    count++;
                    viewCount.textContent = count;
                    viewCount.classList.add('count-animate');
                    setTimeout(() => viewCount.classList.remove('count-animate'), 500);
                    this.classList.add('viewed');
                }
            } else {
                // İçeriği küçült
                article.classList.remove('expanded');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
                readMoreText.textContent = 'Devamını Oku';
            }
        });
    });

    // Overlay'e tıklandığında içeriği küçült
    overlay.addEventListener('click', function() {
        const expandedArticle = document.querySelector('.blog-post.expanded');
        if (expandedArticle) {
            expandedArticle.classList.remove('expanded');
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
            expandedArticle.querySelector('.read-more-text').textContent = 'Devamını Oku';
        }
    });

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

    // İletişim formu işlevselliği
    document.getElementById("contact-form")?.addEventListener("submit", function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const name = formData.get("name");
        const email = formData.get("email");
        const message = formData.get("message");

        console.log(name, email, message);
        alert("Mesajınız başarıyla gönderildi!");
    });

    // Hakkımızda sayfası etkileşimi
    const hakkimizdaPage = document.getElementById('hakkimizda-page');
    if (hakkimizdaPage) {
        hakkimizdaPage.querySelectorAll('.interactive-element').forEach(element => {
            element.addEventListener('click', function() {
                console.log('Interactive element clicked!');
            });
        });
    }
});
