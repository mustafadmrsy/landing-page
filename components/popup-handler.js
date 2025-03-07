/**
 * Popup Handler - Senirkent Blog
 * Her fonksiyon öneki: snk_popupHandler_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını seç
const snk_popupHandler_overlay = document.getElementById('snk_popupOverlay');
const snk_popupHandler_container = document.querySelector('.snk-popup-container');
const snk_popupHandler_closeBtn = document.getElementById('snk_popupCloseBtn');
const snk_popupHandler_title = document.getElementById('snk_popupTitle');
const snk_popupHandler_content = document.getElementById('snk_popupContent');
const snk_popupHandler_readMoreBtns = document.querySelectorAll('.snk-read-more-btn');

/**
 * Popup'ı açar
 * @param {string} title - Popup başlığı
 * @param {string} content - Popup içeriği (HTML formatında)
 */
function snk_popupHandler_openPopup(title, content) {
    console.log('Popup açılıyor:', title);
    
    // Popup içeriğini ayarla
    if (snk_popupHandler_title) {
        snk_popupHandler_title.textContent = title;
    }
    
    if (snk_popupHandler_content) {
        snk_popupHandler_content.innerHTML = content;
    }
    
    // Popup'ı görünür yap
    if (snk_popupHandler_overlay) {
        snk_popupHandler_overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Arka plan kaydırmayı engelle
    }
    
    // Popup animasyonu için timeout kullan
    setTimeout(() => {
        if (snk_popupHandler_container) {
            snk_popupHandler_container.classList.add('active');
        }
    }, 10);
}

/**
 * Popup'ı kapatır
 */
function snk_popupHandler_closePopup() {
    console.log('Popup kapatılıyor');
    
    if (snk_popupHandler_container) {
        snk_popupHandler_container.classList.remove('active');
    }
    
    // Önce container animasyonunu tamamla, sonra overlay'i gizle
    setTimeout(() => {
        if (snk_popupHandler_overlay) {
            snk_popupHandler_overlay.classList.remove('active');
            document.body.style.overflow = ''; // Arka plan kaydırmayı etkinleştir
        }
    }, 300); // CSS geçiş süresiyle eşleşmeli
}

/**
 * "Devamını Oku" butonlarına tıklama olayı ekler
 */
function snk_popupHandler_setupReadMoreButtons() {
    console.log('Devamını Oku butonları ayarlanıyor');
    
    const readMoreButtons = document.querySelectorAll('.snk-read-more-btn');
    if (readMoreButtons.length > 0) {
        readMoreButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault(); // Bağlantı davranışını engelle
                
                const postId = this.getAttribute('data-post-id');
                console.log('Post ID:', postId);
                
                if (postId) {
                    // popup.js içindeki fonksiyonu çağır
                    if (typeof snk_popup_fetchPostData === 'function') {
                        snk_popup_fetchPostData(postId);
                    } else {
                        console.error('snk_popup_fetchPostData fonksiyonu bulunamadı');
                    }
                } else {
                    console.error('Geçersiz post ID');
                }
            });
        });
    } else {
        console.warn('Hiç "Devamını Oku" butonu bulunamadı');
    }
}

/**
 * Popup eventlerini ayarlar
 */
function snk_popupHandler_setupEvents() {
    console.log('Popup olayları ayarlanıyor');
    
    // Kapat butonuna tıklama olayı
    if (snk_popupHandler_closeBtn) {
        snk_popupHandler_closeBtn.addEventListener('click', snk_popupHandler_closePopup);
    }
    
    // Overlay'e tıklama olayı (popup dışına tıklanınca kapanması için)
    if (snk_popupHandler_overlay) {
        snk_popupHandler_overlay.addEventListener('click', function(e) {
            // Sadece doğrudan overlay'e tıklanırsa kapat (içeriğe tıklamayı engelle)
            if (e.target === snk_popupHandler_overlay) {
                snk_popupHandler_closePopup();
            }
        });
    }
    
    // Esc tuşuna basma olayı
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            snk_popupHandler_closePopup();
        }
    });
    
    // Oturum Açma butonuna tıklama olayı
    const loginBtn = document.getElementById('snk_login_btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', snk_popupHandler_showLoginForm);
    }
    
    // Kaydol butonuna tıklama olayı
    const registerBtn = document.getElementById('snk_register_btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', snk_popupHandler_showRegisterForm);
    }
}

/**
 * Oturum açma formunu gösterir
 */
function snk_popupHandler_showLoginForm() {
    console.log('Oturum açma formu gösteriliyor');
    
    const loginFormContent = `
        <div class="snk-login-form-container">
            <form id="snk_login_form" class="snk-auth-form">
                <div class="snk-form-group">
                    <label for="snk_login_email">E-posta</label>
                    <input type="email" id="snk_login_email" class="snk-form-input" placeholder="E-posta adresiniz" required>
                </div>
                
                <div class="snk-form-group">
                    <label for="snk_login_password">Şifre</label>
                    <div class="snk-password-container">
                        <input type="password" id="snk_login_password" class="snk-form-input" placeholder="Şifreniz" required>
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
                
                <div class="snk-auth-divider">
                    <span>veya</span>
                </div>
                
                <div class="snk-social-login">
                    <button type="button" class="snk-social-btn snk-google-btn">
                        <i class="fab fa-google"></i>
                        Google ile Giriş Yap
                    </button>
                    <button type="button" class="snk-social-btn snk-facebook-btn">
                        <i class="fab fa-facebook-f"></i>
                        Facebook ile Giriş Yap
                    </button>
                </div>
                
                <div class="snk-auth-toggle">
                    Hesabınız yok mu? <a href="#" id="snk_switch_to_register">Kaydolun</a>
                </div>
            </form>
        </div>
    `;
    
    // Popup'ı aç
    snk_popupHandler_openPopup('Oturum Aç', loginFormContent);
    
    // Form olaylarını ekle
    setTimeout(() => {
        const loginForm = document.getElementById('snk_login_form');
        const passwordToggle = document.getElementById('snk_login_toggle_password');
        const switchToRegister = document.getElementById('snk_switch_to_register');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Bu aşamada gerçek bir login işlemi yapılmayacak, sadece demo olarak mesaj gösteriyoruz
                alert('Oturum açma işlevi henüz uygulanmadı. Bu bir prototiptir.');
            });
        }
        
        if (passwordToggle) {
            passwordToggle.addEventListener('click', function() {
                const passwordInput = document.getElementById('snk_login_password');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Göz ikonunu değiştir
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', function(e) {
                e.preventDefault();
                snk_popupHandler_showRegisterForm();
            });
        }
    }, 100);
}

/**
 * Kaydolma formunu gösterir
 */
function snk_popupHandler_showRegisterForm() {
    console.log('Kaydolma formu gösteriliyor');
    
    const registerFormContent = `
        <div class="snk-register-form-container">
            <form id="snk_register_form" class="snk-auth-form">
                <div class="snk-form-row">
                    <div class="snk-form-group">
                        <label for="snk_register_name">Ad</label>
                        <input type="text" id="snk_register_name" class="snk-form-input" placeholder="Adınız" required>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="snk_register_surname">Soyad</label>
                        <input type="text" id="snk_register_surname" class="snk-form-input" placeholder="Soyadınız" required>
                    </div>
                </div>
                
                <div class="snk-form-group">
                    <label for="snk_register_email">E-posta</label>
                    <input type="email" id="snk_register_email" class="snk-form-input" placeholder="E-posta adresiniz" required>
                </div>
                
                <div class="snk-form-group">
                    <label for="snk_register_password">Şifre</label>
                    <div class="snk-password-container">
                        <input type="password" id="snk_register_password" class="snk-form-input" placeholder="Şifreniz" required>
                        <button type="button" class="snk-password-toggle" id="snk_register_toggle_password">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="snk-form-group">
                    <label for="snk_register_password_confirm">Şifre (Tekrar)</label>
                    <div class="snk-password-container">
                        <input type="password" id="snk_register_password_confirm" class="snk-form-input" placeholder="Şifrenizi tekrar girin" required>
                    </div>
                </div>
                
                <div class="snk-terms-container">
                    <input type="checkbox" id="snk_terms_agreement" required>
                    <label for="snk_terms_agreement">
                        <a href="#" class="snk-terms-link">Kullanım Koşulları</a> ve 
                        <a href="#" class="snk-terms-link">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
                    </label>
                </div>
                
                <button type="submit" class="snk-auth-submit">Kaydol</button>
                
                <div class="snk-auth-divider">
                    <span>veya</span>
                </div>
                
                <div class="snk-social-login">
                    <button type="button" class="snk-social-btn snk-google-btn">
                        <i class="fab fa-google"></i>
                        Google ile Kaydol
                    </button>
                    <button type="button" class="snk-social-btn snk-facebook-btn">
                        <i class="fab fa-facebook-f"></i>
                        Facebook ile Kaydol
                    </button>
                </div>
                
                <div class="snk-auth-toggle">
                    Zaten hesabınız var mı? <a href="#" id="snk_switch_to_login">Oturum Açın</a>
                </div>
            </form>
        </div>
    `;
    
    // Popup'ı aç
    snk_popupHandler_openPopup('Kaydol', registerFormContent);
    
    // Form olaylarını ekle
    setTimeout(() => {
        const registerForm = document.getElementById('snk_register_form');
        const passwordToggle = document.getElementById('snk_register_toggle_password');
        const switchToLogin = document.getElementById('snk_switch_to_login');
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Bu aşamada gerçek bir kayıt işlemi yapılmayacak, sadece demo olarak mesaj gösteriyoruz
                alert('Kaydolma işlevi henüz uygulanmadı. Bu bir prototiptir.');
            });
        }
        
        if (passwordToggle) {
            passwordToggle.addEventListener('click', function() {
                const passwordInput = document.getElementById('snk_register_password');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Göz ikonunu değiştir
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', function(e) {
                e.preventDefault();
                snk_popupHandler_showLoginForm();
            });
        }
    }, 100);
}

// Sayfa yüklendiğinde hazırlık
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup Handler yüklendi');
    
    // Popup olaylarını ayarla
    snk_popupHandler_setupEvents();
    
    // "Devamını Oku" butonlarını ayarla
    // Burada setupReadMoreButtons fonksiyonunu çağırmıyoruz çünkü
    // butonlar main.js tarafından dinamik olarak oluşturuluyor olabilir
    
    // Ana içerik yüklendiğinde butonları ayarla
    const postsContainer = document.getElementById('snk_postsContainer');
    if (postsContainer) {
        // MutationObserver ile DOM değişikliklerini izle
        const observer = new MutationObserver(function(mutations) {
            // DOM değiştiğinde "Devamını Oku" butonlarını ayarla
            snk_popupHandler_setupReadMoreButtons();
        });
        
        // Gözlem yapılandırması
        const config = { childList: true, subtree: true };
        
        // Gözlemi başlat
        observer.observe(postsContainer, config);
    }
});

// Global alanda tanımla
window.snk_popupHandler_openPopup = snk_popupHandler_openPopup;
window.snk_popupHandler_closePopup = snk_popupHandler_closePopup;
