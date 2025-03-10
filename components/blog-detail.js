// Blog Detail JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get blog ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    
    if (!blogId) {
        showErrorMessage('Blog ID bulunamadı.');
        return;
    }
    
    // Fetch blog details
    fetchBlogDetails(blogId);
    fetchBlogComments(blogId);
    
    // Set up comment form
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComment(blogId);
        });
    }
});

/**
 * Fetch blog details from the server
 * @param {string} blogId - The ID of the blog post
 */
function fetchBlogDetails(blogId) {
    console.log("Blog detayları getiriliyor. ID:", blogId);
    
    // URL'i konsola yazdır (hata ayıklama için)
    console.log("Mevcut sayfa URL'i:", window.location.href);
    
    try {
        // localStorage'dan blog yazılarını al
        let allPosts = [];
        try {
            // Ana depolama 'snk_blog_posts' anahtarını kontrol et
            const storedPosts = localStorage.getItem('snk_blog_posts');
            if (storedPosts) {
                allPosts = JSON.parse(storedPosts);
                console.log("Yazılar 'snk_blog_posts' anahtarından alındı:", allPosts.length);
            } else {
                console.log("'snk_blog_posts' anahtarında veri bulunamadı");
            }
        } catch (e) {
            console.warn("'snk_blog_posts' okuma hatası:", e);
        }
        
        // Eğer allPosts bir array değilse veya boşsa başka kaynakları kontrol et
        if (!Array.isArray(allPosts) || allPosts.length === 0) {
            try {
                const blogPostsJson = localStorage.getItem('posts');
                if (blogPostsJson) {
                    const parsed = JSON.parse(blogPostsJson);
                    // posts anahtarı içinde bir array varsa onu kullan
                    if (parsed && Array.isArray(parsed.posts)) {
                        allPosts = parsed.posts;
                        console.log("Yazılar 'posts' anahtarından alındı:", allPosts.length);
                    } else if (parsed && Array.isArray(parsed)) {
                        allPosts = parsed;
                        console.log("Yazılar 'posts' anahtarından array olarak alındı:", allPosts.length);
                    }
                }
            } catch (e) {
                console.warn("'posts' okuma hatası:", e);
            }
        }
        
        // Test amaçlı tüm blog verilerini konsola yazdır
        console.log("Tüm blog verileri:", allPosts);
        
        // ID'ye göre yazıyı bul
        const post = allPosts.find(p => {
            const postIdInt = parseInt(p.id);
            const targetIdInt = parseInt(blogId);
            return postIdInt === targetIdInt;
        });
        
        if (post) {
            console.log("Blog yazısı bulundu:", post);
            
            // İçeriği temizle ve resim yollarını düzelt
            let content = post.content || post.fullContent || post.summary || 'İçerik bulunamadı';
            
            // Varsayılan görsel yolu
            let defaultImagePath = '../images/default-blog.jpg';
            
            // Ana gösterim resmi
            let featuredImage = `
                <div class="blog-featured-image">
                    <img src="${defaultImagePath}" alt="${post.title || 'Blog Görseli'}" class="img-fluid">
                </div>
            `;
            
            // Tüm görsel bilgilerini konsola yazdır (debug için)
            console.log("Post veri yapısındaki image:", typeof post.image, post.image);
            
            // Bu kısım şimdilik yorum satırı olarak kalacak, görüntü sorununu çözdükten sonra aktif edebiliriz
            /*
            if (post.image && post.image !== 'undefined' && post.image !== 'null' && post.image.trim() !== '') {
                // Resim yolunu logla
                console.log("Orijinal resim yolu:", post.image);
                
                // Görüntü yolunu kontrol et ve düzelt
                let imagePath = post.image;
                
                // Tam URL kontrolü
                if (imagePath.startsWith('http')) {
                    // HTTP URL'i değiştirme (zaten tam URL)
                } else if (imagePath.indexOf('://') !== -1) {
                    // Diğer protokoller de değiştirilmemeli
                } else {
                    // Dosya yollarını düzelt
                    if (imagePath.startsWith('./')) {
                        // ./images/foo.jpg -> ../images/foo.jpg
                        imagePath = imagePath.replace('./', '../');
                    } else if (imagePath.startsWith('/')) {
                        // /images/foo.jpg -> ../images/foo.jpg
                        imagePath = '..' + imagePath;
                    } else if (!imagePath.startsWith('../')) {
                        // images/foo.jpg -> ../images/foo.jpg
                        imagePath = '../' + imagePath;
                    }
                }
                
                // Düzeltilmiş resim yolunu logla
                console.log("Düzeltilen resim yolu:", imagePath);
                
                featuredImage = `
                    <div class="blog-featured-image">
                        <img src="${imagePath}" alt="${post.title}" class="img-fluid" 
                            onerror="this.onerror=null; this.src='${defaultImagePath}'; console.log('Resim yüklenemedi, varsayılan resim kullanılıyor');">
                    </div>
                `;
            }
            */
            
            // Metindeki tüm img etiketlerini bul ve düzelt
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
            let match;
            let newContent = content;
            
            // İçerikteki her resim etiketini bul
            while (match = imgRegex.exec(content)) {
                const originalSrc = match[1];
                let newSrc = originalSrc;
                
                // Resim yollarını düzelt
                if (newSrc.startsWith('http')) {
                    // HTTP URL'ini değiştirme
                } else if (newSrc.startsWith('./')) {
                    newSrc = newSrc.replace('./', '../');
                } else if (newSrc.startsWith('/')) {
                    newSrc = '..' + newSrc;
                } else if (!newSrc.startsWith('../')) {
                    newSrc = '../' + newSrc;
                }
                
                // Orijinal img etiketini ve düzeltilmiş etiketle değiştir
                if (originalSrc !== newSrc) {
                    console.log(`Resim yolu düzeltildi: ${originalSrc} -> ${newSrc}`);
                    const originalImgTag = match[0];
                    const newImgTag = originalImgTag.replace(`src="${originalSrc}"`, `src="${newSrc}"`);
                    newContent = newContent.replace(originalImgTag, newImgTag);
                }
            }
            
            // Düzeltilmiş içeriği kullan
            content = newContent;
            
            displayBlogDetails({
                title: post.title,
                author: post.author || 'Anonim',
                date: formatDate(post.date) || 'Belirtilmemiş',
                category: getCategoryName(post.category) || 'Genel',
                content: content,
                featuredImage: featuredImage
            });
            document.title = `${post.title} - Senirkent Blog`;
        } else {
            console.error(`ID: ${blogId} olan yazı bulunamadı`);
            displayErrorMessage("Bu blog yazısı bulunamadı.");
        }
    } catch (err) {
        console.error("Blog detayları getirilirken hata oluştu:", err);
        displayErrorMessage("Blog yazısı yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.");
    }
}

/**
 * Format a date string
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Geçersiz tarih ise orijinal string'i döndür
        
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        console.warn("Tarih formatlanırken hata oluştu:", e);
        return dateString;
    }
}

/**
 * Get category name from category key
 * @param {string} categoryKey - The category key
 * @returns {string} Category name
 */
function getCategoryName(categoryKey) {
    const categories = {
        'technology': 'Teknoloji',
        'science': 'Bilim',
        'health': 'Sağlık',
        'education': 'Eğitim',
        'sport': 'Spor',
        'culture': 'Kültür',
        'art': 'Sanat',
        'travel': 'Seyahat',
        'food': 'Yemek',
        'literature': 'Edebiyat'
    };
    
    return categories[categoryKey] || categoryKey || 'Genel';
}

/**
 * Display error message in the blog content area
 * @param {string} message - The error message to display
 */
function displayErrorMessage(message) {
    const blogContentEl = document.getElementById('blog-content');
    if (blogContentEl) {
        blogContentEl.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <a href="../index.html" class="back-button">Ana Sayfaya Dön</a>
            </div>
        `;
    }
    
    // Hide comments section
    const commentsSection = document.querySelector('.blog-comments-section');
    if (commentsSection) {
        commentsSection.style.display = 'none';
    }
    
    // Update title
    document.getElementById('blog-title').textContent = 'Hata';
    document.getElementById('blog-author').textContent = '-';
    document.getElementById('blog-date').textContent = '-';
    document.getElementById('blog-category').textContent = '-';
}

/**
 * Display blog details in the DOM
 * @param {Object} blogData - The blog data to display
 */
function displayBlogDetails(blogData) {
    document.getElementById('blog-title').textContent = blogData.title;
    document.getElementById('blog-author').textContent = blogData.author;
    document.getElementById('blog-date').textContent = blogData.date;
    document.getElementById('blog-category').textContent = blogData.category;
    
    // Önce ana görseli ekle, sonra içeriği
    const contentElement = document.getElementById('blog-content');
    if (contentElement) {
        // Mevcut içeriği temizle
        contentElement.innerHTML = '';
        
        // Ana görsel varsa ekle, yoksa varsayılan görseli ekle
        if (blogData.featuredImage) {
            contentElement.innerHTML += blogData.featuredImage;
        } else {
            // Varsayılan görsel ekle
            contentElement.innerHTML += `
                <div class="blog-featured-image">
                    <img src="../public/img/logo.png" alt="Varsayılan Görsel" class="img-fluid">
                </div>
            `;
        }
        
        // İçeriği ekle
        contentElement.innerHTML += blogData.content;
        
        // Dark mode uyumluluğunu kontrol et
        setTimeout(() => {
            if (document.body.classList.contains('dark-mode')) {
                console.log("Dark mode aktif, blog içeriği için ek dark mode stilleri uygulanıyor");
                // Ek dark mode ayarlamaları burada yapılabilir
            }
        }, 100);
    }
}

/**
 * Fetch comments for the blog
 * @param {string} blogId - The ID of the blog post
 */
function fetchBlogComments(blogId) {
    // This would normally be an API call, simplified for this example
    // Example: fetch(`/api/blogs/${blogId}/comments`)
    
    // Simulate data for now
    setTimeout(() => {
        const commentsData = [
            {
                author: 'Ahmet Yılmaz',
                date: '09.03.2025',
                text: 'Harika bir yazı olmuş, tebrikler!'
            },
            {
                author: 'Ayşe Demir',
                date: '08.03.2025',
                text: 'Bu konuyla ilgili daha fazla içerik paylaşmanızı rica ediyorum. Çok faydalı oldu.'
            },
            {
                author: 'Mehmet Kaya',
                date: '07.03.2025',
                text: 'Katılıyorum, özellikle son paragrafta bahsettiğiniz nokta çok önemli.'
            }
        ];
        
        displayComments(commentsData);
    }, 500);
}

/**
 * Display comments in the DOM
 * @param {Array} commentsData - The comments data to display
 */
function displayComments(commentsData) {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';
    
    if (commentsData.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>';
        return;
    }
    
    commentsData.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;
        commentsContainer.appendChild(commentElement);
    });
}

/**
 * Submit a new comment
 * @param {string} blogId - The ID of the blog post
 */
function submitComment(blogId) {
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');
    
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    
    if (!name || !text) {
        showErrorMessage('Lütfen tüm alanları doldurun.');
        return;
    }
    
    // This would normally be an API call, simplified for this example
    // Example: fetch(`/api/blogs/${blogId}/comments`, { method: 'POST', body: ... })
    
    // Simulate successful comment submission
    setTimeout(() => {
        // Add new comment to the comments container
        const commentsContainer = document.getElementById('comments-container');
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item new-comment';
        
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`;
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${name}</span>
                <span class="comment-date">${formattedDate}</span>
            </div>
            <div class="comment-text">${text}</div>
        `;
        
        commentsContainer.prepend(commentElement);
        
        // Clear form inputs
        nameInput.value = '';
        textInput.value = '';
        
        showSuccessMessage('Yorumunuz başarıyla gönderildi!');
    }, 300);
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    // Implementation depends on the site's notification system
    // This is a simplified version
    alert(message);
}

/**
 * Show a success message
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    // Implementation depends on the site's notification system
    // This is a simplified version
    alert(message);
    
    // If the site has a notification system, use that instead
    // Example:
    // const notificationElement = document.createElement('div');
    // notificationElement.className = 'snk-notification success';
    // notificationElement.textContent = message;
    // document.body.appendChild(notificationElement);
    // setTimeout(() => notificationElement.remove(), 3000);
}
