document.addEventListener('DOMContentLoaded', function() {
    // Tüm kategorileri ve blog gönderilerini seçme
    const categoryItems = document.querySelectorAll('.category-item');
    const blogPostsSection = document.getElementById('blog-posts');
    const postsGrid = document.querySelector('.posts-grid');
    const sectionTitle = document.querySelector('.section-header .category-info');
    const blogPopupOverlay = document.querySelector('.blog-popup-overlay');
    const blogPopupContent = document.querySelector('.blog-popup-content');
    const blogPopupClose = document.querySelector('.blog-popup-close');
    
    // Sanal blog içeriği (gerçek uygulamada bu veriler API'den veya veritabanından alınabilir)
    const blogPosts = {
        "Teknoloji": [
            {
                title: "Teknolojinin Eğitime Etkileri",
                author: "Ahmet Yılmaz",
                date: "10 Şubat 2025",
                preview: "Günümüzde teknoloji eğitim alanında devrim yaratıyor. Uzaktan eğitim platformları, interaktif öğrenme araçları ve yapay zeka destekli kişiselleştirilmiş eğitim programları öğrencilere yeni öğrenme fırsatları sunuyor.",
                content: `<p>Günümüzde teknoloji eğitim alanında devrim yaratıyor. Uzaktan eğitim platformları, interaktif öğrenme araçları ve yapay zeka destekli kişiselleştirilmiş eğitim programları öğrencilere yeni öğrenme fırsatları sunuyor.</p>
                <p>Eğitim teknolojilerinin en önemli avantajlarından biri, öğrenme sürecini her öğrencinin ihtiyaçlarına göre uyarlayabilmesidir. Yapay zeka algoritmaları, öğrencilerin güçlü ve zayıf yönlerini analiz ederek kişiselleştirilmiş öğrenme yolları oluşturabiliyor.</p>
                <p>Ayrıca, artırılmış gerçeklik (AR) ve sanal gerçeklik (VR) teknolojileri, öğrencilerin karmaşık kavramları daha iyi anlamalarına yardımcı oluyor. Örneğin, tıp öğrencileri sanal bir insan vücudu üzerinde ameliyat yapma pratiği yapabilirken, tarih öğrencileri antik medeniyetlerin sanal rekonstrüksiyonlarını gezebiliyor.</p>
                <p>Bulut tabanlı öğrenme yönetim sistemleri, öğretmenlerin ödevleri dağıtmasını, ilerlemeyi izlemesini ve öğrencilere anında geri bildirim vermesini kolaylaştırıyor. Bu sistemler aynı zamanda ebeveynlerin çocuklarının akademik gelişimini takip etmelerine de olanak tanıyor.</p>
                <p>Eğitim teknolojilerinin bir diğer faydası da global erişim sağlamasıdır. İnternet bağlantısı olan herkes, dünyanın herhangi bir yerindeki kaliteli eğitim içeriklerine erişebiliyor. Bu, özellikle geleneksel eğitim kurumlarına erişimi sınırlı olan bölgelerdeki öğrenciler için büyük bir fırsat yaratıyor.</p>`,
                tags: ["Teknoloji", "Eğitim"]
            },
            {
                title: "Yapay Zeka ve Geleceğimiz",
                author: "Zeynep Kaya",
                date: "5 Mart 2025",
                preview: "Yapay zeka teknolojileri hayatımızın her alanını dönüştürüyor. Sağlıktan eğitime, ulaşımdan iş dünyasına kadar pek çok sektörde yapay zeka uygulamaları giderek yaygınlaşıyor.",
                content: `<p>Yapay zeka teknolojileri hayatımızın her alanını dönüştürüyor. Sağlıktan eğitime, ulaşımdan iş dünyasına kadar pek çok sektörde yapay zeka uygulamaları giderek yaygınlaşıyor.</p>
                <p>Yapay zeka algoritmalarının en etkileyici özelliklerinden biri, büyük veri setlerini analiz ederek insan uzmanlarının gözden kaçırabileceği karmaşık desenleri tespit edebilmeleridir. Örneğin, tıp alanında yapay zeka sistemleri, binlerce tıbbi görüntüyü inceleyerek kanser gibi hastalıkları erken aşamada teşhis edebiliyor.</p>
                <p>Otonom araçlar, yapay zekanın ulaşım sektöründeki en heyecan verici uygulamalarından biridir. Bu araçlar, gelişmiş sensörler ve makine öğrenimi algoritmaları sayesinde trafiği analiz edebiliyor, yolu izleyebiliyor ve potansiyel tehlikeleri öngörebiliyor.</p>
                <p>İş dünyasında yapay zeka, müşteri davranışlarını analiz ederek kişiselleştirilmiş pazarlama stratejileri geliştirme, tedarik zinciri optimizasyonu ve finansal analizler gibi alanlarda devrim yaratıyor.</p>
                <p>Ancak yapay zekanın yaygınlaşması, veri gizliliği, algoritmaların şeffaflığı ve potansiyel iş kayıpları gibi birçok etik ve sosyal soruyu da beraberinde getiriyor. Bu teknolojinin sorumlu bir şekilde geliştirilmesi ve düzenlenmesi, geleceğimiz için kritik öneme sahip.</p>`,
                tags: ["Yapay Zeka", "Teknoloji"]
            }
        ],
        "Eğitim": [
            {
                title: "Modern Öğrenme Yöntemleri",
                author: "Mehmet Öztürk",
                date: "15 Ocak 2025",
                preview: "Eğitim dünyası, teknolojinin gelişimiyle birlikte büyük bir dönüşüm geçiriyor. Geleneksel sınıf ortamından çıkıp, dijital platformlara taşınan eğitim, yeni öğrenme modellerini de beraberinde getiriyor.",
                content: `<p>Eğitim dünyası, teknolojinin gelişimiyle birlikte büyük bir dönüşüm geçiriyor. Geleneksel sınıf ortamından çıkıp, dijital platformlara taşınan eğitim, yeni öğrenme modellerini de beraberinde getiriyor.</p>
                <p>Karma öğrenme (blended learning), geleneksel yüz yüze eğitim ile çevrimiçi eğitimi birleştiren modern bir yaklaşımdır. Bu model, öğrencilere hem sosyal etkileşim fırsatı sunar hem de kendi hızlarında ilerlemelerine olanak tanır.</p>
                <p>Proje tabanlı öğrenme, öğrencilerin gerçek dünya problemlerini çözmek için bilgi ve becerilerini uyguladıkları bir yöntemdir. Bu yaklaşım, eleştirel düşünme, işbirliği ve yaratıcılık gibi 21. yüzyıl becerilerini geliştirmeye odaklanır.</p>
                <p>Tersyüz edilmiş sınıf (flipped classroom) modelinde, öğrenciler dersten önce evde video dersler izler ve temel kavramları öğrenir. Sınıf zamanı ise tartışma, problem çözme ve grup çalışmaları için kullanılır.</p>
                <p>Oyunlaştırma, eğitimi daha etkileşimli ve eğlenceli hale getirmek için oyun elementlerini öğrenme sürecine dahil eder. Rozet sistemleri, ilerleme çizelgeleri ve rekabet unsurları, öğrencilerin motivasyonunu artırmaya yardımcı olur.</p>`,
                tags: ["Eğitim", "Öğrenme"]
            }
        ],
        "Çevre": [
            {
                title: "Sürdürülebilir Yaşam İçin Pratik Öneriler",
                author: "Ayşe Demir",
                date: "20 Şubat 2025",
                preview: "Günümüzde çevre sorunları giderek artıyor ve bireysel olarak yapacağımız küçük değişiklikler, gezegenimizdeki büyük farklar yaratabilir. İşte sürdürülebilir bir yaşam için uygulayabileceğiniz basit öneriler.",
                content: `<p>Günümüzde çevre sorunları giderek artıyor ve bireysel olarak yapacağımız küçük değişiklikler, gezegenimizdeki büyük farklar yaratabilir. İşte sürdürülebilir bir yaşam için uygulayabileceğiniz basit öneriler.</p>
                <p>Tek kullanımlık plastik ürünleri hayatınızdan çıkarın. Yanınızda her zaman yeniden kullanılabilir su şişesi, kahve bardağı ve alışveriş çantası bulundurun. Plastik pipet yerine metal, bambu veya kağıt pipetleri tercih edin.</p>
                <p>Enerji tasarrufu sağlayan LED ampuller kullanın ve evde olmadığınızda elektronik cihazları tamamen kapatın. Uygun hava koşullarında çamaşırlarınızı asarak kurutun ve bulaşık makinenizi sadece doluyken çalıştırın.</p>
                <p>Yerel ve mevsiminde ürünler satın alın. Uzak mesafelerden taşınan gıdalar, daha fazla karbon emisyonuna neden olur. Ayrıca, mümkünse haftalık bir gün et tüketmeden yaşamayı deneyin.</p>
                <p>Kompost yaparak organik atıklarınızı değerlendirin. Bahçeniz yoksa bile, balkonda veya mutfakta kullanabileceğiniz küçük kompost sistemleri mevcuttur. Bu sayede hem çöp miktarınızı azaltır hem de bitkileriniz için doğal gübre elde edersiniz.</p>`,
                tags: ["Çevre", "Sürdürülebilirlik"]
            }
        ],
        "Mobil Geliştirme": [],
        "Siber Güvenlik": [],
        "Veri Bilimi": []
    };
    
    // Kategori tıklama işlevselliği
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Tüm kategorilerdeki active sınıfını kaldır
            categoryItems.forEach(cat => cat.classList.remove('active'));
            
            // Tıklanan kategoriye active sınıfını ekle
            this.classList.add('active');
            
            // Kategori adını al
            const categoryName = this.getAttribute('data-category');
            
            // Blog yazılarını göster
            displayBlogPosts(categoryName);
        });
    });
    
    // Blog yazılarını gösterme fonksiyonu
    function displayBlogPosts(category) {
        // Kategori başlığını güncelle
        sectionTitle.textContent = category;
        
        // Post grid içeriğini temizle
        postsGrid.innerHTML = '';
        
        // Seçilen kategorideki blog yazılarını al
        const posts = blogPosts[category] || [];
        
        if (posts.length === 0) {
            // Eğer blog yazısı yoksa bilgi mesajı göster
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <i class="far fa-file-alt"></i>
                    <p>Bu kategoride henüz blog yazısı bulunmamaktadır.</p>
                </div>
            `;
        } else {
            // Blog yazılarını ekrana ekle
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'blog-post-card';
                postElement.innerHTML = `
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span><i class="far fa-calendar-alt"></i> ${post.date}</span>
                        <span><i class="far fa-user"></i> ${post.author}</span>
                    </div>
                    <p class="post-preview">${post.preview}</p>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="read-more-button">
                        <button class="read-more" data-title="${post.title}">
                            <span>Devamını Oku</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    <div class="post-full-content" style="display: none;">${post.content}</div>
                `;
                postsGrid.appendChild(postElement);
                
                // Devamını Oku butonuna tıklama olayı ekle
                const readMoreBtn = postElement.querySelector('.read-more');
                readMoreBtn.addEventListener('click', function() {
                    const postTitle = this.getAttribute('data-title');
                    const postContent = this.parentElement.parentElement.querySelector('.post-full-content').innerHTML;
                    
                    // Popup içeriğini ayarla
                    blogPopupContent.innerHTML = `
                        <h2>${postTitle}</h2>
                        ${postContent}
                    `;
                    
                    // Popup'ı göster
                    blogPopupOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            });
        }
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
    
    // "btn-daha" butonlarına da popup işlevselliği ekle
    const btnDahaButtons = document.querySelectorAll('.btn-daha');
    if (btnDahaButtons.length > 0) {
        btnDahaButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // En yakın blog içeriğini bul
                const parentArticle = this.closest('article') || this.closest('.blog-post-card') || this.closest('.blog-post');
                if (!parentArticle) return;
                
                // Blog başlığı ve içeriğini al
                const postTitle = parentArticle.querySelector('.post-title')?.textContent || 'Blog Yazısı';
                const postContent = parentArticle.querySelector('.post-full-content')?.innerHTML;
                
                if (!postContent) {
                    // Eğer içerik bulunamazsa, mevcut içeriği kullan
                    const contentElements = parentArticle.querySelectorAll('p, img, h2, h3, h4, ul, ol');
                    let fullContent = '';
                    contentElements.forEach(el => {
                        if (el !== this && !el.classList.contains('preview')) {
                            fullContent += el.outerHTML;
                        }
                    });
                    
                    // Popup içeriğini ayarla
                    blogPopupContent.innerHTML = `
                        <h2>${postTitle}</h2>
                        ${fullContent || parentArticle.innerHTML}
                    `;
                } else {
                    // Tam içerik mevcutsa onu kullan
                    blogPopupContent.innerHTML = `
                        <h2>${postTitle}</h2>
                        ${postContent}
                    `;
                }
                
                // Popup'ı göster
                blogPopupOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
    }
    
    // Sayfa yüklendiğinde ilk kategoriyi seç
    if (categoryItems.length > 0) {
        categoryItems[0].click();
    }
});
