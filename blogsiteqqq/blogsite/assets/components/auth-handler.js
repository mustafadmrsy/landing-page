/**
 * Auth Handlers - Senirkent Blog
 * Kimlik doğrulama popup ve formları için JavaScript
 */

// DOM elementlerini seçme
const loginBtn = document.getElementById('snk_login_btn');
const registerBtn = document.getElementById('snk_register_btn');

const loginPopup = document.getElementById('snk_loginPopup');
const registerPopup = document.getElementById('snk_registerPopup');
const verificationPopup = document.getElementById('snk_verificationPopup');

const loginCloseBtn = document.getElementById('snk_loginCloseBtn');
const registerCloseBtn = document.getElementById('snk_registerCloseBtn');
const verificationCloseBtn = document.getElementById('snk_verificationCloseBtn');

const showRegisterPopupLink = document.getElementById('showRegisterPopup');
const showLoginPopupLink = document.getElementById('showLoginPopup');
const resendVerificationCodeLink = document.getElementById('resendVerificationCode');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const verificationForm = document.getElementById('verificationForm');

const loginAlertBox = document.getElementById('loginAlertBox');
const registerAlertBox = document.getElementById('registerAlertBox');
const verificationAlertBox = document.getElementById('verificationAlertBox');

const verificationEmail = document.getElementById('verificationEmail');

// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Yardımcı Fonksiyonlar

/**
 * Alert mesajı göster
 * @param {HTMLElement} alertBox - Alert kutusu elementi
 * @param {string} message - Gösterilecek mesaj
 * @param {string} type - Alert tipi ('success' veya 'error')
 */
function showAlert(alertBox, message, type) {
    alertBox.textContent = message;
    alertBox.className = `auth-alert ${type}`;
    alertBox.style.display = 'block';

    // 5 saniye sonra alert'i gizle
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

/**
 * Popup göster
 * @param {HTMLElement} popup - Gösterilecek popup
 */
function showPopup(popup) {
    // Tüm popup'ları gizle
    loginPopup.style.display = 'none';
    registerPopup.style.display = 'none';
    verificationPopup.style.display = 'none';

    // İstenen popup'ı göster
    popup.style.display = 'flex';
}

/**
 * Popup gizle
 * @param {HTMLElement} popup - Gizlenecek popup
 */
function hidePopup(popup) {
    popup.style.display = 'none';
}

// Event Listeners

// Buton tıklamaları
if (loginBtn) {
    loginBtn.addEventListener('click', () => showPopup(loginPopup));
}

if (registerBtn) {
    registerBtn.addEventListener('click', () => showPopup(registerPopup));
}

// Kapatma butonları
if (loginCloseBtn) {
    loginCloseBtn.addEventListener('click', () => hidePopup(loginPopup));
}

if (registerCloseBtn) {
    registerCloseBtn.addEventListener('click', () => hidePopup(registerPopup));
}

if (verificationCloseBtn) {
    verificationCloseBtn.addEventListener('click', () => hidePopup(verificationPopup));
}

// Popup geçişleri
if (showRegisterPopupLink) {
    showRegisterPopupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPopup(registerPopup);
    });
}

if (showLoginPopupLink) {
    showLoginPopupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPopup(loginPopup);
    });
}

// Form Gönderme İşleyicileri

// Kayıt formu


// Arka plana tıklayınca popup'ı kapat
window.addEventListener('click', (e) => {
    if (e.target === loginPopup) {
        hidePopup(loginPopup);
    } else if (e.target === registerPopup) {
        hidePopup(registerPopup);
    } else if (e.target === verificationPopup) {
        hidePopup(verificationPopup);
    }
});


// Sayfa yüklendiğinde oturum durumunu kontrol et
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// DOM yüklendikten sonra çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth handler yüklendi");
    
    // Login form gönderimi
    setupLoginForm();
    
    // Register form gönderimi
    setupRegisterForm();
    
    // Şifre görünürlük butonları
    setupPasswordToggles();
});

/**
 * Login formunu ayarlar
 */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Form validasyonu
            if (!email || !password) {
                showAuthError('login', 'Lütfen tüm alanları doldurun.');
                return;
            }
            
            // Login AJAX isteği
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('action', 'login');
            
            fetch('AuthHandler.ashx', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Başarılı giriş
                    showAuthSuccess('login', 'Giriş başarılı! Yönlendiriliyorsunuz...');
                    
                    // Popup'ı kapat ve sayfayı yenile
                    setTimeout(() => {
                        const loginPopup = document.getElementById('snk_loginPopup');
                        if (loginPopup) {
                            loginPopup.classList.remove('active');
                        }
                        window.location.reload();
                    }, 1500);
                } else {
                    // Hatalı giriş
                    showAuthError('login', data.message || 'Giriş yapılamadı. E-posta veya şifre hatalı.');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showAuthError('login', 'Bir hata oluştu. Lütfen tekrar deneyin.');
            });
        });
    }
}

/**
 * Register formunu ayarlar
 */
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const termsAgree = document.getElementById('termsAgree').checked;
            
            // Form validasyonu
            if (!name || !email || !username || !password || !passwordConfirm) {
                showAuthError('register', 'Lütfen tüm alanları doldurun.');
                return;
            }
            
            if (password !== passwordConfirm) {
                showAuthError('register', 'Şifreler eşleşmiyor.');
                return;
            }
            
            if (!termsAgree) {
                showAuthError('register', 'Kayıt olmak için kullanım koşullarını kabul etmelisiniz.');
                return;
            }
            
            // Email formatı kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAuthError('register', 'Geçerli bir e-posta adresi girin.');
                return;
            }
            
            // SDÜ email kontrolü yapılabilir, örnek:
            if (!email.toLowerCase().includes('isparta.edu.tr')) {
                showAuthError('register', 'Lütfen okul e-posta adresinizi kullanın (isparta.edu.tr)');
                return;
            }
            
            // Register AJAX isteği
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('action', 'register');
            
            fetch('AuthHandler.ashx', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Başarılı kayıt
                    showAuthSuccess('register', 'Kaydınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
                    
                    // Popup'ı kapat ve giriş sayfasına yönlendir
                    setTimeout(() => {
                        const registerPopup = document.getElementById('snk_registerPopup');
                        if (registerPopup) {
                            registerPopup.classList.remove('active');
                        }
                        
                        // Login popup'ı göster veya sayfayı yenile
                        const loginPopup = document.getElementById('snk_loginPopup');
                        if (loginPopup) {
                            loginPopup.classList.add('active');
                        } else {
                            window.location.reload();
                        }
                    }, 1500);
                } else {
                    // Hatalı kayıt
                    showAuthError('register', data.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
                }
            })
            .catch(error => {
                console.error('Register error:', error);
                showAuthError('register', 'Bir hata oluştu. Lütfen tekrar deneyin.');
            });
        });
    }
}

/**
 * Şifre görünürlük düğmelerini ayarlar
 */
function setupPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.snk-password-toggle-btn');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
}

/**
 * Hata mesajı gösterir
 * @param {string} formType - 'login' veya 'register'
 * @param {string} message - Gösterilecek hata mesajı
 */
function showAuthError(formType, message) {
    // Daha önce oluşturulmuş hata mesajını temizle
    clearAuthMessages(formType);
    
    // Form container'ını bul
    const formContainer = formType === 'login' 
        ? document.querySelector('.snk-login-form-container')
        : document.querySelector('.snk-register-form-container');
    
    if (formContainer) {
        // Hata mesajı elementini oluştur
        const errorElement = document.createElement('div');
        errorElement.className = 'snk-auth-error';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        // Form'un başına ekle
        const form = formContainer.querySelector('.snk-auth-form');
        form.insertBefore(errorElement, form.firstChild);
        
        // Hata animasyonu
        setTimeout(() => {
            errorElement.classList.add('visible');
        }, 10);
    }
}

/**
 * Başarı mesajı gösterir
 * @param {string} formType - 'login' veya 'register'
 * @param {string} message - Gösterilecek başarı mesajı
 */
function showAuthSuccess(formType, message) {
    // Daha önce oluşturulmuş mesajları temizle
    clearAuthMessages(formType);
    
    // Form container'ını bul
    const formContainer = formType === 'login' 
        ? document.querySelector('.snk-login-form-container')
        : document.querySelector('.snk-register-form-container');
    
    if (formContainer) {
        // Başarı mesajı elementini oluştur
        const successElement = document.createElement('div');
        successElement.className = 'snk-auth-success';
        successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        // Form'un başına ekle
        const form = formContainer.querySelector('.snk-auth-form');
        form.insertBefore(successElement, form.firstChild);
        
        // Başarı animasyonu
        setTimeout(() => {
            successElement.classList.add('visible');
        }, 10);
    }
}

/**
 * Tüm auth mesajlarını temizler
 * @param {string} formType - 'login' veya 'register'
 */
function clearAuthMessages(formType) {
    const formContainer = formType === 'login' 
        ? document.querySelector('.snk-login-form-container')
        : document.querySelector('.snk-register-form-container');
    
    if (formContainer) {
        const errorMessages = formContainer.querySelectorAll('.snk-auth-error');
        const successMessages = formContainer.querySelectorAll('.snk-auth-success');
        
        errorMessages.forEach(msg => msg.remove());
        successMessages.forEach(msg => msg.remove());
    }
}

// Global erişim için
window.snk_auth = {
    showError: showAuthError,
    showSuccess: showAuthSuccess,
    clearMessages: clearAuthMessages
};
