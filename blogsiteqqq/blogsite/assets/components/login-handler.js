﻿/**
 * Login Popup Handler - Senirkent Blog
 * Bu dosya login popup'ı ve form işlemlerini yönetir.
 */

// Login popup ile ilgili global değişkenler
const loginPopup = document.getElementById('snk_loginPopup');
const loginCloseBtn = document.getElementById('snk_loginCloseBtn');
const passwordToggleBtn = document.getElementById('snk_login_toggle_password');
const passwordInput = document.getElementById('loginPassword');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('snk_login_btn');
const createBtn = document.getElementById('snk_create_btn'); // Oluştur butonu

// Sayfa yüklendiğinde son yazıları göster
document.addEventListener('DOMContentLoaded', function () {
    console.log('Login Handler başlatıldı!');
    initLoginPopup(); // Login popup'ını başlat
    setupCreateButton(); // Oluştur butonunu ayarla
    updateRecentPostsDisplay(); // Son yazıları göster
});

// Login popup ve butonlarını başlat
function initLoginPopup() {
    console.log('Login popup başlatılıyor...');

    // Login butonuna tıklandığında popup'ı aç
    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openLoginPopup();
        });
        console.log('Login butonu tanımlandı');
    } else {
        console.error('Login butonu bulunamadı!');
    }

    // Popup dışına tıklandığında kapat (opsiyonel)
    if (loginPopup) {
        loginPopup.addEventListener('click', function (e) {
            // Popup dışına tıklanırsa kapat
            if (e.target === loginPopup) {
                closeLoginPopup();
            }
        });
        console.log('Login popup tanımlandı');
    } else {
        console.error('Login popup bulunamadı!');
    }

    // Kapatma butonuna tıklandığında popup'ı kapat
    if (loginCloseBtn) {
        loginCloseBtn.addEventListener('click', closeLoginPopup);
        console.log('Kapatma butonu tanımlandı');
    } else {
        console.error('Kapatma butonu bulunamadı!');
    }

    // Şifre göster/gizle butonu
    if (passwordToggleBtn && passwordInput) {
        passwordToggleBtn.addEventListener('click', togglePassword);
        console.log('Şifre toggle butonu tanımlandı');
    } else {
        console.error('Şifre toggle butonu veya password input bulunamadı!', {
            toggleBtn: !!passwordToggleBtn,
            passwordInput: !!passwordInput
        });
    }

    // Login formunu yönet
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login formu tanımlandı');
    } else {
        console.error('Login formu bulunamadı!');
    }

    // Şifremi unuttum linklerini kontrol et ve event listener ekle
    setupForgotPasswordLinks();
}

// Şifremi unuttum linklerini ayarla
function setupForgotPasswordLinks() {
    document.addEventListener('click', function (e) {
        // Şifremi unuttum linkine tıklandıysa
        if (e.target && (e.target.classList.contains('snk-forgot-password') || e.target.closest('.snk-forgot-password'))) {
            e.preventDefault();

            // Tüm popupları kapat
            clearAllPopups();

            // localStorage'a bildirim mesajı ekle
            localStorage.setItem('snk_notification', 'Şifrenizi mi unuttunuz? Lütfen iletişim formundan bizimle iletişime geçin.');

            // İletişim sayfasına yönlendir
            window.location.href = 'communication.html';
        }
    });
}

// Login popup'ı aç
function openLoginPopup() {
    console.log('Login popup açılıyor...');

    // Önce diğer tüm popupları temizle
    clearAllPopups();

    // Eğer statik login popup varsa onu kullan, yoksa dinamik oluştur
    const existingLoginPopup = document.getElementById('snk_loginPopup');
    if (existingLoginPopup) {
        existingLoginPopup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Sayfa scrollunu devre dışı bırak
    } else {
        // Statik popup bulunamadı, dinamik oluştur
        showLoginPopup();
    }
}

// Login popup'ı kapat
function closeLoginPopup(e) {
    if (e) e.preventDefault();
    console.log('Login popup kapatılıyor...');

    if (loginPopup) {
        loginPopup.classList.remove('active');
        document.body.style.overflow = ''; // Sayfa scrollunu tekrar aktifleştir
    } else {
        console.error('Login popup kapatılamadı!');
    }
}

// Şifre göster/gizle
function togglePassword(e) {
    e.preventDefault();
    console.log('Şifre görünürlüğü değiştiriliyor...');

    if (passwordInput) {
        // Şifre tipini değiştir
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // İkonu değiştir
        const icon = passwordToggleBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    } else {
        console.error('Şifre görünürlüğü değiştirilemedi!');
    }
}

// Login formunu işle

// Login mesajını göster
function showLoginMessage(message, type) {
    const alertBox = document.getElementById('loginAlertBox');

    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = 'snk-form-message';
        alertBox.classList.add(`snk-${type}-message`);
        alertBox.style.display = 'block';

        // 5 saniye sonra mesajı gizle
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }
}

// Oluştur butonunu ayarla

// Tüm popup'ları temizleyen yardımcı fonksiyon
function clearAllPopups() {
    const existingPopups = document.querySelectorAll('.snk-popup-overlay, .snk-create-post-popup, #blogCreatePopup');
    existingPopups.forEach(popup => {
        popup.classList.remove('active');
        if (popup.id !== 'snk_loginPopup') {
            popup.remove();
        }
    });
}

// Blog yazısı oluşturma popup'ını göster
function showBlogCreatePopup(user) {
    console.log("showBlogCreatePopup çağrıldı, tüm popuplar temizleniyor");

    // Mevcut açık popup'ları temizle (KAPAT)
    const existingPopups = document.querySelectorAll('.snk-popup-overlay, .snk-create-post-popup');
    if (existingPopups.length > 0) {
        console.log(`${existingPopups.length} adet popup temizleniyor`);
        existingPopups.forEach(popup => {
            popup.classList.remove('active');
            popup.remove(); // Hemen kaldır, timeout kullanma
        });
    }

    // Popup HTML yapısını oluştur
    const popupHTML = `
    <div class="snk-popup-overlay" id="blogCreatePopup">
        <div class="snk-popup-container">
            <div class="snk-popup-header">
                <h2 class="snk-popup-title">Yeni Blog Yazısı</h2>
                <button class="snk-popup-close-btn" id="blogCreateCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="snk-popup-content">
                <form class="snk-create-post-form">
                    <div class="snk-form-group">
                        <label for="post-title">Başlık</label>
                        <input type="text" id="post-title" class="snk-form-control" placeholder="Blog yazınızın başlığını girin" required>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="post-category">Kategori</label>
                        <select id="post-category" class="snk-form-control" required>
                            <option value="" disabled selected>Kategori seçin</option>
                            <option value="akademik-destek">Akademik Destek</option>
                            <option value="kariyer-staj">Kariyer ve Staj</option>
                            <option value="sosyal-hayat">Sosyal Hayat</option>
                            <option value="psikolojik-destek">Psikolojik Destek</option>
                            <option value="burs-firsatlar">Burs ve Fırsatlar</option>
                            <option value="random">Random</option>
                        </select>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="post-content">İçerik</label>
                        <textarea id="post-content" class="snk-form-control" placeholder="Blog yazınızın içeriğini girin" rows="8" required></textarea>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="post-tags">Etiketler (# ile ayırın)</label>
                        <input type="text" id="post-tags" class="snk-form-control" placeholder="Örn: #teknoloji #yazılım #web">
                        <div class="snk-tags-preview"></div>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="post-image">Kapak Görseli</label>
                        <div class="snk-image-upload">
                            <input type="file" id="post-image" class="snk-image-input" accept="image/*">
                            <label for="post-image" class="snk-image-label">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Görsel Seçin veya Sürükleyin</span>
                            </label>
                            <div class="snk-image-preview"></div>
                        </div>
                    </div>
                    
                    <div class="snk-form-actions">
                        <button type="button" class="snk-form-button snk-cancel-button" id="blogCancelBtn">İptal</button>
                        <button type="submit" class="snk-form-button snk-submit-button">Yazıyı Yayınla</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;

    // Popup'ı body'ye ekle
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Popup'ı göster
    const popup = document.getElementById('blogCreatePopup');
    setTimeout(() => {
        popup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Arka planı kaydırmayı engelle
    }, 10);

    // Kapat butonuna tıklanınca popup'ı kapat
    document.getElementById('blogCreateCloseBtn').addEventListener('click', function () {
        closePopup(popup);
    });

    // İptal butonuna tıklanınca popup'ı kapat
    document.getElementById('blogCancelBtn').addEventListener('click', function () {
        closePopup(popup);
    });

    // Popup dışına tıklandığında kapat
    popup.addEventListener('click', function (e) {
        if (e.target === popup) {
            closePopup(popup);
        }
    });

    // Form gönderildiğinde blog yazısını kaydet
    const form = document.querySelector('.snk-create-post-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('post-title').value;
        const category = document.getElementById('post-category').value;
        const content = document.getElementById('post-content').value;
        const tagsInput = document.getElementById('post-tags').value;
        const tags = tagsInput ? tagsInput.split('#').filter(tag => tag.trim() !== '').map(tag => tag.trim()) : [];

        // Görsel için base64 veri URL'sini al
        let imageUrl = '../public/images/blog-placeholder.jpg';
        const imagePreview = document.querySelector('.snk-image-preview img');
        if (imagePreview && imagePreview.src) {
            imageUrl = imagePreview.src;
        }

        // Blog yazısı nesnesini oluştur
        const blogPost = {
            id: Date.now(),
            title: title,
            category: category,
            summary: content.substring(0, 150) + '...',  // İlk 150 karakteri özet olarak al
            content: content,
            tags: tags,
            author: user.username || user.name || 'Anonim',
            author_id: user.id || Date.now().toString(),
            date: new Date().toLocaleDateString('tr-TR'),
            views: 0,
            image: imageUrl,
            status: 'pending',  // Onay bekliyor durumu
            createdDate: new Date().toLocaleDateString('tr-TR')
        };

        
        // Eğer fazla post varsa, localStorage dolmasını önlemek için
        // en eski postları sadeleştir (içeriklerini kısalt)
        if (blogPosts.length > 10) {
            console.log('Blog yazıları sınırı aşıldı, eski yazılar optimize ediliyor...');

            // En eski yazıları bul ve optimize et (ilk 5 yazı)
            for (let i = 0; i < Math.min(5, blogPosts.length); i++) {
                if (blogPosts[i].content && blogPosts[i].content.length > 200) {
                    // İçeriği kısalt ve optimize edildiğini belirt
                    blogPosts[i].content = blogPosts[i].content.substring(0, 200) + '...';
                    blogPosts[i].optimized = true;
                }
            }
        }

        // Yeni yazıyı ekle
        blogPosts.push(blogPost);

        // localStorage'a kaydet - kotayı aşarsa düzgün hata yönetimi sağla
        
    // Görsel yükleme fonksiyonalitesi
    const imageInput = document.getElementById('post-image');
    const imagePreview = document.querySelector('.snk-image-preview');

    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.innerHTML = `
                    <div class="snk-preview-container">
                        <img src="${e.target.result}" alt="Seçilen görsel">
                        <button type="button" class="snk-remove-image">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;

                // Görseli kaldırma butonu için event listener
                document.querySelector('.snk-remove-image').addEventListener('click', function () {
                    imagePreview.innerHTML = '';
                    imageInput.value = '';
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Etiket önizlemesi
    const tagsInput = document.getElementById('post-tags');
    const tagsPreview = document.querySelector('.snk-tags-preview');

    tagsInput.addEventListener('input', function () {
        const tags = this.value.split('#').filter(tag => tag.trim() !== '');

        if (tags.length > 0) {
            tagsPreview.innerHTML = tags.map(tag =>
                `<span class="snk-tag-item">#${tag.trim()}</span>`
            ).join('');
        } else {
            tagsPreview.innerHTML = '';
        }
    });
}

// Popup'ı kapat
function closePopup(popup) {
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => {
            popup.remove();
            document.body.style.overflow = ''; // Arka plan kaydırmayı tekrar etkinleştir
        }, 300);
    }
}

// Blog yazısı oluşturma popup'ını göster
function showLoginPopup() {
    console.log('showLoginPopup çağrıldı');

    // Önce tüm popupları temizle
    clearAllPopups();

    // HTML içinde statik olarak tanımlanmış bir login popup var mı kontrol et
    const existingLoginPopup = document.getElementById('snk_loginPopup');
    if (existingLoginPopup) {
        console.log('Statik login popup bulundu, onu kullanıyoruz');
        existingLoginPopup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Sayfa scrollunu devre dışı bırak

        // Kapatma butonunu ayarla
        const closeBtn = document.getElementById('snk_loginCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                existingLoginPopup.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Submit butonuna olay dinleyicisi ekle
        setupLoginFormHandlers();

        return; // Statik popup bulundu, dinamik oluşturmaya gerek yok
    }

    // Statik popup yoksa, dinamik oluştur (eski kod)
    console.log('Statik login popup bulunamadı, dinamik oluşturulacak');
    // Popup HTML yapısını oluştur - Yeni tasarım
    const popupHTML = `
    <div class="snk-popup-overlay" id="snk_loginPopup">
        <div class="snk-popup-container auth-popup">
            <div class="snk-popup-header">
                <h2 class="snk-popup-title">Giriş Yap</h2>
                <button class="snk-popup-close-btn" id="snk_loginCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="snk-popup-content" id="snk_popupContent">
                <div class="snk-login-form-container">
                    <form id="loginForm" class="snk-auth-form">
                        <div class="snk-form-group">
                            <label for="loginEmail">E-posta</label>
                            <input type="email" id="loginEmail" name="email" class="snk-form-input" placeholder="ol2413615XXX@isparta.edu.tr" required>
                        </div>
                        <div class="snk-form-group">
                            <label for="loginPassword">Şifre</label>
                            <div class="snk-password-container">
                                <input type="password" id="loginPassword" name="password" class="snk-form-input" placeholder="Şifreniz" required>
                                <button type="button" class="snk-password-toggle" id="snk_login_toggle_password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="snk-form-options">
                            <div class="snk-remember-me">
                                <input type="checkbox" id="snk_remember_me">
                                <label for="snk_remember_me">Beni hatırla</label>
                            </div>
                            <a href="#" class="snk-forgot-password">Şifremi unuttum</a>
                        </div>
                        <button type="submit" class="snk-auth-submit">Oturum Aç</button>
                        <div id="loginAlertBox" class="snk-form-message" style="display: none;"></div>
                        <div class="snk-auth-toggle">
                            Hesabınız yok mu? <a href="#" id="showRegisterPopup">Kaydolun</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;

    // Popup'ı body'ye ekle
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Popup'ı göster
    const popup = document.getElementById('snk_loginPopup');
    setTimeout(() => {
        popup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Arka planı kaydırmayı engelle
    }, 10);

    // Kapat butonuna tıklanınca popup'ı kapat
    document.getElementById('snk_loginCloseBtn').addEventListener('click', function () {
        closePopup(popup);
    });

    // Popup dışına tıklandığında kapat
    popup.addEventListener('click', function (e) {
        if (e.target === popup) {
            closePopup(popup);
        }
    });

    // Şifre görme butonunu aktifleştir
    const passwordToggleButton = document.getElementById('snk_login_toggle_password');
    const passwordInputField = document.getElementById('loginPassword');

    if (passwordToggleButton && passwordInputField) {
        passwordToggleButton.addEventListener('click', function (e) {
            e.preventDefault();
            // Şifre tipini değiştir
            const type = passwordInputField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInputField.setAttribute('type', type);

            // İkonu değiştir
            const icon = passwordToggleButton.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    // Form gönderildiğinde login işlemini gerçekleştir
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('snk_remember_me').checked;

        
            // Kullanıcıyı ara ve kullanıcı durumunu kontrol et
            let user = users.find(u => u.email === email && u.password === password) ||
                verifiedUsers.find(u => u.email === email && u.password === password);

            // Onay bekleyen kullanıcı kontrolü
            const isPending = pendingUsers.find(u => u.email === email && u.password === password);

            if (isPending) {
                // Kullanıcı onay bekliyor
                showLoginMessage('Hesabınız henüz onaylanmamış. Lütfen admin onayını bekleyin.', 'error');
                return;
            }

            if (user) {
                // Güvenlik kontrolü: Kullanıcının isVerified veya isActive durumu kontrol et
                if (user.isVerified === false) {
                    showLoginMessage('Hesabınız henüz doğrulanmamış. Lütfen doğrulama işlemini tamamlayın.', 'error');
                    return;
                }

                // Giriş başarılı
                showLoginMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');

                // Kullanıcı bilgilerini sakla
                const currentUser = {
                    ...user,
                    isLoggedIn: true,
                    lastLoginAt: new Date().toISOString()
                };
                

                // 1 saniye sonra sayfayı yeniden yükle
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                // Giriş başarısız
                showLoginMessage('E-posta veya şifre hatalı!', 'error');
            }
        } else {
            // Formda eksik bilgi var
            showLoginMessage('Lütfen tüm alanları doldurun!', 'error');
        }
    });
}

// Blog yazısı silme işlemi
function deleteBlogPost(postId) {
    console.log(`${postId} ID'li blog yazısı için silme işlemi başlatıldı`);

    // Silme onay popup'ını oluştur
    const confirmPopupHTML = `
    <div class="snk-popup-overlay active" id="snk_confirmDeletePopup">
        <div class="snk-popup-container snk-confirm-popup">
            <div class="snk-popup-header">
                <h2 class="snk-popup-title">Blog Yazısını Sil</h2>
                <button class="snk-popup-close-btn" id="snk_confirmCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="snk-popup-content">
                <p class="snk-confirm-message">Bu blog yazısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                <div class="snk-confirm-buttons">
                    <button id="snk_cancelDeleteBtn" class="snk-cancel-btn">İptal</button>
                    <button id="snk_confirmDeleteBtn" class="snk-confirm-btn">Sil</button>
                </div>
            </div>
        </div>
    </div>`;

    // Önce tüm popupları temizle
    const existingPopups = document.querySelectorAll('.snk-popup-overlay');
    existingPopups.forEach(popup => popup.remove());

    // Popup'ı sayfaya ekle
    document.body.insertAdjacentHTML('beforeend', confirmPopupHTML);
    document.body.style.overflow = 'hidden';

    // Kapatma ve iptal butonlarını ayarla
    const closeBtn = document.getElementById('snk_confirmCloseBtn');
    const cancelBtn = document.getElementById('snk_cancelDeleteBtn');
    const confirmBtn = document.getElementById('snk_confirmDeleteBtn');

    function closePopup() {
        const popup = document.getElementById('snk_confirmDeletePopup');
        if (popup) {
            popup.classList.remove('active');
            setTimeout(() => {
                popup.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (cancelBtn) cancelBtn.addEventListener('click', closePopup);

    
}

// Son yazıların gösterimini güncelle
function updateRecentPostsDisplay() {
    const recentPostsContainer = document.querySelector('.snk-recent-posts');
    if (!recentPostsContainer) return;

    // Blog yazılarını localStorage'dan al
    

    // Son 6 yazıyı al
    const recentPosts = blogPosts.slice(-6).reverse();

    // HTML oluştur
    const postsHTML = recentPosts.map(post => `
        <div class="snk-post-card" data-post-id="${post.id}">
            <div class="snk-post-image">
                <img src="${post.image || '../public/images/blog-placeholder.jpg'}" alt="${post.title}">
                <span class="snk-post-category">${post.category}</span>
            </div>
            <div class="snk-post-content">
                <h3 class="snk-post-title">${post.title}</h3>
                <p class="snk-post-summary">${post.summary}</p>
                <div class="snk-post-meta">
                    <span><i class="far fa-user"></i> ${post.author}</span>
                    <span><i class="far fa-calendar"></i> ${new Date(post.date).toLocaleDateString()}</span>
                    <span><i class="far fa-eye"></i> ${post.views} görüntülenme</span>
                </div>
                <div class="snk-post-tags">
                    ${post.tags.map(tag => `<span class="snk-tag">${tag}</span>`).join('')}
                </div>
                <button class="snk-read-more-btn" data-post-id="${post.id}">Devamını Oku</button>
            </div>
        </div>
    `).join('');

    // İçeriği güncelle
    recentPostsContainer.innerHTML = postsHTML;

    // "Devamını Oku" butonlarına tıklama olayı ekle
    const readMoreButtons = document.querySelectorAll('.snk-read-more-btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            openBlogPostPopup(postId);
        });
    });
}

// Blog yazısını popup'da açma
function openBlogPostPopup(postId) {
    // Blog yazılarını localStorage'dan al
    

    // ID'ye göre blog yazısını bul
    const post = blogPosts.find(post => post.id == postId);
    if (!post) return;

    // Blog yazısının görüntülenme sayısını arttır
    post.views += 1;
    

    // Popup içeriğini oluştur
    const popupHTML = `
        <div class="snk-popup-container snk-blog-post-popup">
            <div class="snk-popup-header">
                <h2 class="snk-popup-title">${post.title}</h2>
                <button class="snk-popup-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="snk-popup-content">
                <div class="snk-blog-post-image">
                    <img src="${post.image || '../public/images/blog-placeholder.jpg'}" alt="${post.title}">
                    <span class="snk-post-category">${post.category}</span>
                </div>
                <div class="snk-blog-post-meta">
                    <span><i class="far fa-user"></i> ${post.author}</span>
                    <span><i class="far fa-calendar"></i> ${new Date(post.date).toLocaleDateString()}</span>
                    <span><i class="far fa-eye"></i> ${post.views} görüntülenme</span>
                </div>
                <div class="snk-blog-post-tags">
                    ${post.tags.map(tag => `<span class="snk-tag">${tag}</span>`).join('')}
                </div>
                <div class="snk-blog-post-content">
                    <p class="snk-post-summary">${post.summary}</p>
                    <div class="snk-post-full-content">${post.content}</div>
                </div>
            </div>
        </div>
    `;

    // Popup'ı ekle ve göster
    const popupElement = document.createElement('div');
    popupElement.innerHTML = popupHTML;
    document.body.appendChild(popupElement.firstElementChild);

    const popupContainer = document.querySelector('.snk-blog-post-popup');
    setTimeout(() => {
        popupContainer.classList.add('active');
    }, 50);

    // Popup'ı kapatma düğmesine olay ekle
    popupContainer.querySelector('.snk-popup-close-btn').addEventListener('click', () => {
        closePopup(popupContainer);
    });
}

// Mobil cihazlar için özel ayarlamalar
function setupMobileCompatibility() {
    // Ekran genişliğini kontrol et
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mobil cihazlar için ek ayarlar yapılabilir
        console.log('Mobil cihaz tespit edildi, özel ayarlar yapılıyor...');

        // Örnek: Mobil cihazlarda popup genişliğini ayarla
        if (loginPopup) {
            const popupContainer = loginPopup.querySelector('.snk-popup-container');
            if (popupContainer) {
                popupContainer.style.width = '95%';
                popupContainer.style.maxWidth = '450px';
            }
        }
    }
}

// Ekran boyutu değiştiğinde mobil uyumluluğu kontrol et
window.addEventListener('resize', setupMobileCompatibility);

// İlk yüklemede mobil uyumluluğu kontrol et
setupMobileCompatibility();

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
    // Varsa eski bildirimi kaldır
    const existingNotification = document.querySelector('.snk-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `snk-notification ${type}`;

    // İkon seç
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    // Sayfaya ekle
    document.body.appendChild(notification);

    // Animasyonu başlat
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Otomatik kapat
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Blog yazısının onaya gönderildiğini bildiren onay popup'ı göster
function showApprovalPendingNotification() {
    // Önceki popup varsa kaldır
    const existingNotification = document.getElementById('approval-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Notifikasyon HTML'i oluştur
    const notificationHTML = `
    <div id="approval-notification" class="snk-notification-overlay">
        <div class="snk-notification-container">
            <div class="snk-notification-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Blog Yazınız Başarıyla Oluşturuldu!</h3>
            <p>Blog yazınız başarıyla kaydedildi ve şu anda yönetici onayı bekliyor.</p>
            <p>Yazınız onaylandığında tüm kullanıcılar tarafından görülebilecek.</p>
            <button id="understand-button" class="snk-notification-button">Anladım</button>
        </div>
    </div>`;

    // Notifikasyonu ekle
    document.body.insertAdjacentHTML('beforeend', notificationHTML);

    // Notifikasyonu göster
    const notification = document.getElementById('approval-notification');
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);

    // Anladım butonuna tıklanınca notifikasyonu kapat
    document.getElementById('understand-button').addEventListener('click', function () {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Kullanıcı blog yazılarını görüntüle
function updateUserPostsDisplay() {
    console.log("Kullanıcı yazıları görüntüleme fonksiyonu çağrıldı");

    // Kullanıcı oturum durumunu kontrol et
    const user = JSON.parse(localStorage.getItem('snk_currentUser') || localStorage.getItem('snk_current_user') || 'null');
    if (!user) {
        console.log("Oturum açık değil, kullanıcı yazıları görüntülenemez");
        return;
    }

    

    // Yazıların görüntüleneceği container'ı bul
    const postsContainer = document.querySelector('.snk-user-posts');
    if (!postsContainer) {
        console.error("Yazılar container'ı bulunamadı");
        return;
    }

    // Yükleniyor mesajını temizle
    postsContainer.innerHTML = '';

    // Eğer yazı yoksa, bilgi mesajı göster
    if (userPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="snk-no-posts">
                <i class="fas fa-pen-nib"></i>
                <p>Henüz bir blog yazısı yazmadınız.</p>
                <button class="snk-action-btn">
                    <i class="fas fa-plus-circle"></i> İlk Yazını Oluştur
                </button>
            </div>
        `;

        // İlk yazı oluştur butonuna tıklama olayı ekle
        const createButton = postsContainer.querySelector('.snk-action-btn');
        if (createButton) {
            createButton.addEventListener('click', function () {
                if (window.showBlogCreatePopup) {
                    window.showBlogCreatePopup(user);
                }
            });
        }

        return;
    }

    // Yazıları tarihe göre sırala (en yeniden en eskiye)
    userPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Her bir yazı için kart oluştur ve ekle
    userPosts.forEach((post, index) => {
        // Gecikme efekti için index'i kullan
        const delay = index * 0.1;

        // Kart HTML'ini oluştur
        const postCard = document.createElement('div');
        postCard.className = 'snk-user-post-card fade-in';
        postCard.style.animationDelay = `${delay}s`;

        // Kartın içeriğini oluştur
        postCard.innerHTML = `
            <div class="snk-user-post-image">
                <img src="${post.image || '../public/images/placeholder.jpg'}" alt="${post.title}">
                <span class="snk-user-post-category" data-category="${post.category}">${post.category}</span>
            </div>
            <div class="snk-user-post-content">
                <h3 class="snk-user-post-title">${post.title}</h3>
                <p class="snk-user-post-excerpt">${post.summary || post.content.substring(0, 150) + '...'}</p>
                <div class="snk-user-post-meta">
                    <span><i class="fas fa-calendar"></i> ${post.date}</span>
                    <span><i class="fas fa-eye"></i> ${post.views || 0} Okunma</span>
                </div>
            </div>
            <div class="snk-user-post-actions">
              <button class="snk-action-btn snk-like-button" data-post-id="1741484977975" style="background: #007bff; color: white; border-radius: 20px; padding: 6px 12px; border: none; cursor: pointer;">
                                <i class="far fa-thumbs-up" style="margin-right: 5px;"></i> Beğen
                                <span class="snk-like-count" style="font-weight: bold;">0</span>
                            </button>           <button class="snk-action-btn snk-comment-button" data-post-id="1741484977975" style="background: black; color: white; border-radius: 20px; padding: 6px 12px; border: none; cursor: pointer;">
                                <i class="far fa-comment" style="margin-right: 5px;"></i> Yorum Yap
                            </button>
               <button class="snk-action-btn snk-share-button" data-post-id="1741484977975" style="background: #007bff; color: white; border-radius: 20px; padding: 6px 12px; border: none; cursor: pointer;">
                                <i class="far fa-share-square" style="margin-right: 5px;"></i> Paylaş
                            </button>
                <button class="snk-post-action-btn delete-btn" data-action="delete" data-post-id="${post.id}" style="background: #ff3852; color: white; border-radius: 20px; padding: 6px 12px; border: none; cursor: pointer;">
                    <i class="far fa-trash-alt" style="margin-right: 5px;"></i> Sil
                </button>
            </div>
        `;

        // Kartı container'a ekle
        postsContainer.appendChild(postCard);

        // Butonlar için olay dinleyicileri ekle
        const likeBtn = postCard.querySelector('[data-action="like"]');
        const commentBtn = postCard.querySelector('[data-action="comment"]');
        const shareBtn = postCard.querySelector('[data-action="share"]');
        const deleteBtn = postCard.querySelector('[data-action="delete"]');

        // Beğenme butonu
        if (likeBtn) {
            likeBtn.addEventListener('click', function () {
                const postId = this.getAttribute('data-post-id');
                likePost(postId, this);
            });
        }

        // Yorum butonu
        if (commentBtn) {
            commentBtn.addEventListener('click', function () {
                const postId = this.getAttribute('data-post-id');
                openCommentPopup(postId);
            });
        }

        // Paylaş butonu
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                const postId = this.getAttribute('data-post-id');
                openShareOptions(postId);
            });
        }

        // Silme butonu
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const postId = this.getAttribute('data-post-id');
                deleteBlogPost(postId);
            });
        }
    });
}

// Global erişim için
window.showBlogCreatePopup = showBlogCreatePopup;
window.showApprovalPendingNotification = showApprovalPendingNotification;
window.updateUserPostsDisplay = updateUserPostsDisplay;
