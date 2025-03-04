document.addEventListener('DOMContentLoaded', function() {
    // Harita görüntüleme işlemleri
    if (document.getElementById('contact-map')) {
        const map = L.map('contact-map').setView([38.0614, 30.8093], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        const marker = L.marker([38.0614, 30.8093]).addTo(map);
        marker.bindPopup("<b>Senirkent Meslek Yüksekokulu</b><br>Isparta, Türkiye").openPopup();
    }
    
    // Sıkça Sorulan Sorular için accordion işlevselliği
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
        });
    });
    
    // Profil menüsü için toggle fonksiyonu
    const profileImage = document.querySelector('.profile-image');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileImage && profileDropdown) {
        profileImage.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!profileDropdown.contains(e.target) && e.target !== profileImage) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // Kategori ve Blog işlevselliği
    const categoryCards = document.querySelectorAll('.category-card');
    const blogPostsGrid = document.querySelector('.posts-grid');
    const categoryInfo = document.querySelector('.category-info');
    let activeCategory = null;

    function updatePostCounts(data) {
        const categories = {};
        data.blogPosts.forEach(post => {
            post.tags.forEach(tag => {
                categories[tag] = (categories[tag] || 0) + 1;
            });
        });

        categoryCards.forEach(card => {
            const category = card.dataset.category;
            const count = categories[category] || 0;
            const countElement = card.querySelector('.post-count');
            countElement.textContent = `${count} Yazı`;
        });
    }

    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Aktif kategoriyi güncelle
            categoryCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Kategori başlığını güncelle
            categoryInfo.textContent = category;
            
            // Blog yazılarını yükle
            loadBlogPosts(category);
            
            // Mobil görünümde otomatik kaydırma
            if (window.innerWidth <= 768) {
                const blogSection = document.querySelector('.blog-posts-section');
                blogSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    function loadBlogPosts(category) {
        fetch('senirkenblog/blogPosts.json')
            .then(response => response.json())
            .then(data => {
                updatePostCounts(data);
                const filteredPosts = category 
                    ? data.blogPosts.filter(post => post.tags.includes(category))
                    : data.blogPosts;
                displayPosts(filteredPosts);
            })
            .catch(error => console.error('Blog yazıları yüklenirken hata:', error));
    }

    function displayPosts(posts) {
        blogPostsGrid.innerHTML = '';
        if (posts.length === 0) {
            blogPostsGrid.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-inbox"></i>
                    <p>Bu kategoride henüz blog yazısı bulunmuyor.</p>
                </div>
            `;
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-post-card';
            postElement.innerHTML = `
                <div class="post-meta">
                    <span class="post-date"><i class="far fa-calendar-alt"></i> ${post.date}</span>
                    <span class="post-author"><i class="far fa-user"></i> ${post.author}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-preview">${post.preview}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="#" class="read-more" data-post-id="${post.id}">Devamını Oku <i class="fas fa-arrow-right"></i></a>
            `;
            blogPostsGrid.appendChild(postElement);
        });

        setupBlogPopups();
    }

    // Blog popup fonksiyonları
    function setupBlogPopups() {
        const readMoreLinks = document.querySelectorAll('.read-more');
        const popupOverlay = document.querySelector('.blog-popup-overlay');
        const popupClose = document.querySelector('.blog-popup-close');
        const popupContent = document.querySelector('.blog-popup-content');

        if (!popupOverlay || !popupClose || !popupContent) return;

        readMoreLinks.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                const postId = this.dataset.postId;
                
                try {
                    const response = await fetch('senirkenblog/blogPosts.json');
                    const data = await response.json();
                    const post = data.blogPosts.find(p => p.id === postId);
                    
                    if (post) {
                        popupContent.innerHTML = `
                            <h2 class="blog-popup-title">${post.title}</h2>
                            <div class="blog-popup-meta">
                                <span><i class="far fa-calendar-alt"></i> ${post.date}</span>
                                <span><i class="far fa-user"></i> ${post.author}</span>
                            </div>
                            <div class="blog-popup-body">
                                ${post.content}
                            </div>
                            <div class="blog-popup-tags">
                                ${post.tags.map(tag => `<span class="tag"><i class="fas fa-tag"></i> ${tag}</span>`).join('')}
                            </div>
                        `;
                        
                        popupOverlay.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                } catch (error) {
                    console.error('Blog yazısı yüklenirken hata:', error);
                }
            });
        });

        function closePopup() {
            popupOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        popupClose.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                closePopup();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && popupOverlay.style.display === 'flex') {
                closePopup();
            }
        });
    }

    // Sayfa yüklendiğinde tüm blog yazılarını göster
    loadBlogPosts();
});
