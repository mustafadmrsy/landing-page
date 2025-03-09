/**
 * Admin Authentication Module
 * 
 * Bu modül, admin sayfasına erişim için kimlik doğrulama işlemlerini yönetir.
 * Admin şifresi doğrudan bu dosyada tanımlanmıştır.
 */

// Admin şifresi (sabit olarak tanımlanmıştır)
const ADMIN_PASSWORD = "SN2023MYO4321"; // Admin şifresi

/**
 * Admin giriş formunu göster
 */
function showAdminLoginForm() {
    // Admin giriş formunu oluştur
    const loginForm = document.createElement('div');
    loginForm.className = 'admin-login-overlay';
    loginForm.innerHTML = `
        <div class="admin-login-container">
            <h2>Admin Paneli</h2>
            <p>Bu sayfa sadece yöneticiler için erişilebilir.</p>
            <p>Lütfen admin giriş kodunu girin:</p>
            <input type="password" id="adminPasswordInput" class="admin-password-input" placeholder="Admin Kodu">
            <div class="admin-login-buttons">
                <button id="adminLoginButton" class="admin-login-button">Giriş Yap</button>
            </div>
        </div>
    `;
    
    // Formu sayfaya ekle
    document.body.appendChild(loginForm);
    
    // Giriş butonuna tıklama olayı ekle
    document.getElementById('adminLoginButton').addEventListener('click', validateAdminLogin);
    
    // Enter tuşuna basıldığında da giriş yap
    document.getElementById('adminPasswordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateAdminLogin();
        }
    });
}

/**
 * Admin girişini doğrula
 */
function validateAdminLogin() {
    const passwordInput = document.getElementById('adminPasswordInput');
    const enteredPassword = passwordInput.value;
    
    // Şifre doğru mu kontrol et
    if (enteredPassword === ADMIN_PASSWORD) {
        // Başarılı giriş - artık localStorage kullanmıyoruz, yalnızca oturum için geçerli
        
        // Giriş formunu kaldır
        const loginForm = document.querySelector('.admin-login-overlay');
        if (loginForm) {
            loginForm.remove();
        }
        
        // Admin içeriğini göster
        showAdminContent();
    } else {
        // Başarısız giriş
        alert('Hatalı admin kodu! Lütfen tekrar deneyin.');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

/**
 * Admin içeriğini göster
 */
function showAdminContent() {
    // Admin panelinin içeriğini görünür yap
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        adminContainer.style.display = 'block';
    }
    
    // Karşılama mesajını göster
    const welcomeBanner = document.querySelector('.admin-welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.style.display = 'block';
        welcomeBanner.innerHTML = `Hoşgeldiniz, Değerli Yönetim Üyesi! | Senirkent MYO Blog Admin Paneline Hoşgeldiniz! | ${new Date().toLocaleDateString('tr-TR')} | Yönetim Paneli Aktif`;
    }
    
    // Çıkış butonu için olay dinleyici ekle
    const logoutButton = document.getElementById('admin-logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutAdmin);
    }
}

/**
 * Admin çıkışı yapma
 */
function logoutAdmin() {
    // Sayfayı yeniden yükle
    window.location.reload();
}

/**
 * Admin sayfasını başlat
 */
function initAdminPage() {
    // Dark mode durumunu kontrol et ve uygula
    const isDarkMode = localStorage.getItem('eren-theme') === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Admin sayfası içeriğini gizle
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        adminContainer.style.display = 'none';
    }
    
    // Her seferinde giriş formunu göster (localStorage kontrolünü kaldırdık)
    showAdminLoginForm();
    
    // Dark mode değişikliklerini dinle
    window.addEventListener('storage', function(e) {
        if (e.key === 'eren-theme') {
            if (e.newValue === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    });
}

// Sayfa yüklendiğinde admin sayfasını başlat
document.addEventListener('DOMContentLoaded', initAdminPage);

// Fonksiyonları global scope'a ekle
window.showAdminLoginForm = showAdminLoginForm;
window.validateAdminLogin = validateAdminLogin;
window.initAdminPage = initAdminPage;
window.logoutAdmin = logoutAdmin;
