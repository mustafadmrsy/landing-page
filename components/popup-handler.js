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
                
                <button type="submit" class="snk-auth-submit">Oturum Aç</button>
                <div id="snk_login_message" class="snk-form-message" style="display: none;"></div> 
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
        const messageDiv = document.getElementById('snk_login_message');
        
        // Mesaj gösterme fonksiyonu
        function showMessage(message, isError = true) {
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.className = 'snk-form-message ' + (isError ? 'snk-error-message' : 'snk-success-message');
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('snk_login_email').value.trim();
                const password = document.getElementById('snk_login_password').value;
                
                // Kullanıcı veritabanını kontrol et
                const users = JSON.parse(localStorage.getItem('snk_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    // Başarılı giriş
                    showMessage('Giriş başarılı. Yönlendiriliyorsunuz...', false);
                    
                    // Kullanıcı oturum durumunu güncelle
                    localStorage.setItem('snk_currentUser', JSON.stringify({
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        isLoggedIn: true,
                        lastLogin: new Date().toISOString()
                    }));
                    
                    // 2 saniye sonra popup'ı kapat ve kullanıcı sayfasına yönlendir
                    setTimeout(() => {
                        snk_popupHandler_closePopup();
                        // Kullanıcı sayfasına yönlendir
                        window.location.href = 'userpage.html';
                    }, 2000);
                } else {
                    // Doğrulanmamış e-posta kontrolü
                    const pendingUsers = JSON.parse(localStorage.getItem('snk_pendingUsers') || '[]');
                    const pendingUser = pendingUsers.find(u => u.email === email);
                    
                    if (pendingUser) {
                        showMessage('Hesabınız henüz doğrulanmamış. Lütfen e-postanızı kontrol ediniz.');
                    } else {
                        showMessage('Geçersiz e-posta veya şifre.');
                    }
                }
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
        
        // "Kaydolun" bağlantısı event listener'ı - düzeltildi
        console.log('switchToRegister elementi:', switchToRegister);
        if (switchToRegister) {
            // Event listener'ı temizle ve yeniden ekle (olası çift bağlantıları önlemek için)
            switchToRegister.removeEventListener('click', handleSwitchToRegister);
            switchToRegister.addEventListener('click', handleSwitchToRegister);
        } else {
            console.error('"Kaydolun" bağlantısı bulunamadı (#snk_switch_to_register)');
            // Alternatif olarak document event delegation yöntemini kullan
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'snk_switch_to_register') {
                    handleSwitchToRegister(e);
                }
            });
        }
        
        // Kayıt formuna geçiş için işleyici fonksiyon
        function handleSwitchToRegister(e) {
            console.log('Kayıt formuna geçiş yapılıyor');
            e.preventDefault();
            snk_popupHandler_showRegisterForm();
        }
    }, 200); // Zaman aşımını 200ms'ye çıkardık, DOM elementlerinin yüklenmesi için daha fazla zaman
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
                    <input type="email" id="snk_register_email" class="snk-form-input" placeholder="E-posta adresiniz (@isparta.edu.tr)" required>
                    <small class="snk-email-info">Sadece @isparta.edu.tr uzantılı e-postalar kabul edilmektedir.</small>
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
                
                <div id="snk_register_message" class="snk-form-message" style="display: none;"></div>
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
        const emailInput = document.getElementById('snk_register_email');
        const messageDiv = document.getElementById('snk_register_message');
        
        // E-posta formatı kontrolü
        function isValidEmail(email) {
            // ol2413615008@isparta.edu.tr formatında e-postalar
            const regex = /^ol\d{10}@isparta\.edu\.tr$/;
            return regex.test(email);
        }
        
        // Hata mesajını göster
        function showMessage(message, isError = true) {
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.className = 'snk-form-message ' + (isError ? 'snk-error-message' : 'snk-success-message');
        }
        
        // E-posta doğrulama gönderimi
        function sendVerificationEmail(name, surname, email, password) {
            // Normalde burada API'ye istek atılır, şimdilik simulasyon yapıyoruz
            console.log(`Kullanıcı kaydı işleniyor: ${email}`);
            
            // Demo amaçlı asenkron işlem
            setTimeout(() => {
                showMessage(`Kayıt işleminiz alınmıştır. Onay için bekleyiniz.`, false);
                
                // Kullanıcı bilgilerini local storage'a geçici olarak kaydet
                const userData = {
                    id: 'user_' + Date.now(),
                    name: name || '',
                    surname: surname || '',
                    email: email || '',
                    password: password || '',
                    isVerified: false,
                    pendingApproval: true,
                    createdAt: new Date().toISOString(),
                    registrationDate: new Date().toLocaleDateString('tr-TR')
                };
                
                // Kaydedilen kullanıcıları al veya boş dizi başlat
                let pendingUsers = [];
                try {
                    pendingUsers = JSON.parse(localStorage.getItem('snk_pendingUsers') || '[]');
                    if (!Array.isArray(pendingUsers)) {
                        console.error('snk_pendingUsers bir dizi değil, sıfırlanıyor');
                        pendingUsers = [];
                    }
                } catch (error) {
                    console.error('snk_pendingUsers parse edilemedi:', error);
                    pendingUsers = [];
                }
                
                // Daha önce bu e-posta ile kayıt var mı kontrol et
                const existingUserIndex = pendingUsers.findIndex(user => user.email === email);
                if (existingUserIndex !== -1) {
                    // Varsa güncelle
                    console.log(`${email} için mevcut kayıt güncelleniyor`);
                    pendingUsers[existingUserIndex] = userData;
                } else {
                    // Yoksa ekle
                    console.log(`${email} için yeni kayıt ekleniyor`);
                    pendingUsers.push(userData);
                }
                
                // Local storage'a kaydet
                try {
                    localStorage.setItem('snk_pendingUsers', JSON.stringify(pendingUsers));
                    console.log('Onay bekleyen kullanıcı kaydedildi:', userData);
                    console.log('Toplam bekleyen kullanıcı sayısı:', pendingUsers.length);
                } catch (error) {
                    console.error('Kullanıcı kaydedilemedi:', error);
                }
                
                // UI güncelle
                if (registerForm) {
                    registerForm.reset();
                }
                
                // Onay bekleme ekranını göster (eğer admin.html'deki fonksiyon varsa)
                if (typeof window.showPendingApproval === 'function') {
                    window.showPendingApproval();
                } else {
                    // Fonksiyon yoksa alternatif bir bildirim göster
                    alert('Kaydınız alınmıştır! Yönetici onayı bekleniyor.');
                }
            }, 1500);
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('snk_register_name').value.trim();
                const surname = document.getElementById('snk_register_surname').value.trim();
                const email = document.getElementById('snk_register_email').value.trim();
                const password = document.getElementById('snk_register_password').value;
                const passwordConfirm = document.getElementById('snk_register_password_confirm').value;
                
                // E-posta formatı kontrolü
                if (!isValidEmail(email)) {
                    showMessage('Geçersiz e-posta formatı. Sadece isparta.edu.tr uzantılı e-postalar (örn: ol2413615008@isparta.edu.tr) kabul edilmektedir.');
                    return;
                }
                
                // Şifre eşleşmesi kontrolü
                if (password !== passwordConfirm) {
                    showMessage('Şifreler eşleşmiyor. Lütfen tekrar kontrol ediniz.');
                    return;
                }
                
                // Şifre uzunluğu kontrolü
                if (password.length < 6) {
                    showMessage('Şifre en az 6 karakter uzunluğunda olmalıdır.');
                    return;
                }
                
                // Kayıtlı kullanıcıları kontrol et
                const users = JSON.parse(localStorage.getItem('snk_users') || '[]');
                if (users.some(user => user.email === email)) {
                    showMessage('Bu e-posta adresi ile daha önce kayıt yapılmış.');
                    return;
                }
                
                // Doğrulama e-postası gönder
                sendVerificationEmail(name, surname, email, password);
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
        
        // "Oturum Açın" bağlantısı event listener'ı - düzeltildi
        console.log('switchToLogin elementi:', switchToLogin);
        if (switchToLogin) {
            // Event listener'ı temizle ve yeniden ekle (olası çift bağlantıları önlemek için)
            switchToLogin.removeEventListener('click', handleSwitchToLogin);
            switchToLogin.addEventListener('click', handleSwitchToLogin);
        } else {
            console.error('"Oturum Açın" bağlantısı bulunamadı (#snk_switch_to_login)');
            // Alternatif olarak document event delegation yöntemini kullan
            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'snk_switch_to_login') {
                    handleSwitchToLogin(e);
                }
            });
        }
        
        // Oturum açma formuna geçiş için işleyici fonksiyon
        function handleSwitchToLogin(e) {
            console.log('Oturum açma formuna geçiş yapılıyor');
            e.preventDefault();
            snk_popupHandler_showLoginForm();
        }
        
        // E-posta input alanı için canlı kontrol
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !isValidEmail(email)) {
                    showMessage('Geçersiz e-posta formatı. Sadece isparta.edu.tr uzantılı e-postalar (örn: ol2413615008@isparta.edu.tr) kabul edilmektedir.');
                } else {
                    messageDiv.style.display = 'none';
                }
            });
        }
    }, 200); // Zaman aşımını 200ms'ye çıkardık, DOM elementlerinin yüklenmesi için daha fazla zaman
}

// Sayfa yüklendiğinde hazırlık
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup Handler yüklendi');
    
    // Popup eventlerini kurulum
    snk_popupHandler_setupEvents();

    // "Devamını Oku" butonları için eventleri ekle
    snk_popupHandler_setupReadMoreButtons();
    
    // Kullanım Koşulları ve Gizlilik Politikası bağlantıları için click event'lerini ayarla
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('snk-terms-link')) {
            e.preventDefault();
            const linkText = e.target.textContent.trim();
            if (linkText === "Kullanım Koşulları") {
                snk_popupHandler_showTermsPopup();
            } else if (linkText === "Gizlilik Politikası") {
                snk_popupHandler_showPrivacyPopup();
            }
        }
    });
});

/**
 * Kullanım Koşulları popup'ını gösterir
 */
function snk_popupHandler_showTermsPopup() {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
    
    const termsContent = `
        <div class="snk-terms-policy-container">
            <h2 class="snk-terms-policy-title">Kullanım Koşulları</h2>
            <p class="snk-terms-policy-date">Son Güncelleme: ${formattedDate}</p>
            
            <div class="snk-terms-policy-section">
                <h3>1. Kabul Edilen Koşullar</h3>
                <p>Bu blog platformunu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Kullanım koşullarını kabul etmiyorsanız, lütfen platformu kullanmayın.</p>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>2. Hizmet Tanımı</h3>
                <p>Bu platform, kullanıcıların blog yazıları oluşturması ve yayınlaması için tasarlanmıştır. Platformun sunulan hizmetler konusunda herhangi bir garanti vermediğini ve değişikliğe tabi olabileceğini kabul edersiniz.</p>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>3. Kullanıcı Yükümlülükleri</h3>
                <ul class="snk-terms-policy-list">
                    <li>Yasalara ve etik kurallara uygun içerik yayınlamak.</li>
                    <li>Diğer kullanıcıların haklarına saygı göstermek.</li>
                    <li>Platforma zarar verebilecek veya hizmetin sürekliliğini riske atacak herhangi bir faaliyetten kaçınmak.</li>
                </ul>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>4. İçerik Sahipliği</h3>
                <p>Platformda yayınladığınız tüm içeriklerin sorumluluğu size aittir. Yayınladığınız içeriğin telif hakkı ve diğer yasal düzenlemelere uygun olduğunu taahhüt edersiniz.</p>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>5. Hesap Kapatma ve Erişim Engelleme</h3>
                <p>Platform, kullanıcıların kurallara aykırı davranması durumunda hesaplarını askıya alma veya sonlandırma hakkını saklı tutar.</p>
            </div>
            
            <div class="snk-terms-policy-back">
                <button id="snk_terms_back_button" class="snk-back-button">
                    <i class="fas fa-arrow-left"></i> Kayıt Formuna Geri Dön
                </button>
            </div>
        </div>
    `;
    
    snk_popupHandler_openPopup('Kullanım Koşulları', termsContent);
    
    // Geri dönüş butonu event listener'ı ekle
    setTimeout(() => {
        const backButton = document.getElementById('snk_terms_back_button');
        if (backButton) {
            backButton.addEventListener('click', function() {
                snk_popupHandler_showRegisterForm();
            });
        }
    }, 100);
}

/**
 * Gizlilik Politikası popup'ını gösterir
 */
function snk_popupHandler_showPrivacyPopup() {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
    
    const privacyContent = `
        <div class="snk-terms-policy-container">
            <h2 class="snk-terms-policy-title">Gizlilik Politikası</h2>
            <p class="snk-terms-policy-date">Son Güncelleme: ${formattedDate}</p>
            
            <div class="snk-terms-policy-section">
                <h3>1. Toplanan Bilgiler</h3>
                <p>Platformu kullanırken aşağıdaki bilgiler toplanabilir:</p>
                <ul class="snk-terms-policy-list">
                    <li>Ad, e-posta adresi ve diğer hesap bilgileri.</li>
                    <li>Blog yazıları, yorumlar ve diğer paylaşılan içerikler.</li>
                    <li>IP adresi, tarayıcı bilgileri ve platform kullanım verileri.</li>
                </ul>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>2. Bilgilerin Kullanımı</h3>
                <p>Toplanan bilgiler, platformun daha iyi hizmet sunması, güvenliğin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılabilir.</p>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>3. Çerezler ve Takip Teknolojileri</h3>
                <p>Platform, kullanıcı deneyimini iyileştirmek için çerezler ve benzeri teknolojiler kullanabilir. Tarayıcı ayarlarınızı değiştirerek çerezleri reddedebilirsiniz.</p>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>4. Bilgilerin Paylaşımı</h3>
                <p>Kullanıcı bilgileriniz, özel durumlar dışında (yasal zorunluluklar, hizmet sağlayıcılarla paylaşım vb.) üçüncü kişilerle paylaşılmaz.</p>
            </div>
            
            <div class="snk-terms-policy-section">
                <h3>5. Güvenlik</h3>
                <p>Bilgilerinizin güvenliğini sağlamak için uygun teknik ve idari önlemler alınmaktadır. Ancak internet üzerinden veri iletiminin tam güvenlik sağlamayabileceğini unutmayın.</p>
            </div>
            
            <div class="snk-terms-policy-back">
                <button id="snk_privacy_back_button" class="snk-back-button">
                    <i class="fas fa-arrow-left"></i> Kayıt Formuna Geri Dön
                </button>
            </div>
        </div>
    `;
    
    snk_popupHandler_openPopup('Gizlilik Politikası', privacyContent);
    
    // Geri dönüş butonu event listener'ı ekle
    setTimeout(() => {
        const backButton = document.getElementById('snk_privacy_back_button');
        if (backButton) {
            backButton.addEventListener('click', function() {
                snk_popupHandler_showRegisterForm();
            });
        }
    }, 100);
}

// Global alanda tanımla
window.snk_popupHandler_openPopup = snk_popupHandler_openPopup;
window.snk_popupHandler_closePopup = snk_popupHandler_closePopup;
