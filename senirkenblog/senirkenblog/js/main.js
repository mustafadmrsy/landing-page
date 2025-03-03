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
                article.classList.add('expanded');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                readMoreText.textContent = 'Küçült';
                
                if (!this.classList.contains('viewed')) {
                    let count = parseInt(viewCount.textContent);
                    count++;
                    viewCount.textContent = count;
                    viewCount.classList.add('count-animate');
                    setTimeout(() => viewCount.classList.remove('count-animate'), 500);
                    this.classList.add('viewed');
                }
            } else {
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

    document.addEventListener('DOMContentLoaded', function() {
        // İletişim formu işlevselliği
        const contactForm = document.getElementById("contact-form");
        if (contactForm) {
            contactForm.addEventListener("submit", function(event) {
                event.preventDefault();
                const formData = new FormData(this);
                const name = formData.get("name");
                const email = formData.get("email");
                const message = formData.get("message");
    
                console.log(name, email, message);
                alert("Mesajınız başarıyla gönderildi!");
            });
        }
    
        // Kategoriler sayfasında blog yazılarını gösterme
        function loadBlogPosts(category) {
            fetch('blogPosts.json')
                .then(response => response.json())
                .then(data => {
                    const normalizedCategory = category.toLowerCase().trim();
                    const filteredPosts = data.blogPosts.filter(post => 
                        post.tags.some(tag => tag.toLowerCase() === normalizedCategory)
                    );
                    displayPosts(filteredPosts, category);
                })
                .catch(error => console.error('Error loading blog posts:', error));
        }
    
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                loadBlogPosts(category);
            });
        });
    
        const categoryButtons = document.querySelectorAll('.category-button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category'); 
                loadBlogPosts(category);
            });
        });
    
        const readMoreButtons = document.querySelectorAll('.read-more-btn');
        readMoreButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.closest('.blog-post').querySelector('.post-meta .meta-item').textContent.trim(); 
                loadBlogPosts(category);
            });
        });
    
        function displayPosts(posts, category) {
            const blogPostsContainer = document.getElementById('blog-posts');
            blogPostsContainer.innerHTML = '';
            if (posts.length > 0) {
                posts.forEach(post => {
                    const postElement = document.createElement('article');
                    postElement.className = 'blog-post';
                    postElement.innerHTML = `
                        <div class='post-header'>
                            <h2 class='post-title'>${post.title}</h2>
                            <div class='post-meta'>
                                <span class='meta-item'><i class='far fa-calendar-alt'></i> ${post.date}</span>
                                <span class='meta-separator'>•</span>
                                <span class='meta-item'><i class='far fa-user'></i> ${post.author}</span>
                            </div>
                        </div>
                        <div class='post-content'>
                            <div class='post-preview'>
                                <p>${post.preview}</p>
                            </div>
                        </div>
                    `;
                    blogPostsContainer.appendChild(postElement);
                });
            } else {
                blogPostsContainer.innerHTML = '<p>Bu kategoride hiç blog yazısı bulunmamaktadır.</p>';
            }
        }
    
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', function(e) {
                e.preventDefault();
                const tagName = this.textContent.trim();
                window.location.href = `kategoriler.html?category=${tagName}`;
            });
        });
    
        // Hakkımızda sayfası için interaktivite
        const hakkimizdaPage = document.getElementById('hakkimizda-page');
        if (hakkimizdaPage) {
            const interactiveElements = hakkimizdaPage.querySelectorAll('.interactive-element');
            interactiveElements.forEach(element => {
                element.addEventListener('click', function() {
                    console.log('Interactive element clicked!');
                });
            });
        }
    });