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
    
    // Kullanıcının onay durumunu kontrol et
    checkUserApprovalStatus();
    
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

/**
 * Kullanıcının onay durumunu kontrol et
 */
function checkUserApprovalStatus() {
    // Mevcut kullanıcı bilgisini al
    const currentUser = JSON.parse(localStorage.getItem('snk_currentUser') || '{}');
    
    console.log('checkUserApprovalStatus çalışıyor, currentUser:', currentUser);
    
    // Kullanıcı giriş yapmış mı kontrol et
    if (currentUser && currentUser.email) {
        console.log('Kullanıcı giriş yapmış:', currentUser.email);
        
        // Kullanıcının durumunu kontrol et
        const pendingUsers = JSON.parse(localStorage.getItem('snk_pendingUsers') || '[]');
        console.log('Onay bekleyen kullanıcılar:', pendingUsers);
        
        const isPending = pendingUsers.some(user => user.email === currentUser.email);
        console.log('Kullanıcı onay bekliyor mu:', isPending);
        
        // Blog yazıları kontrolü - hem snk_blog_posts hem de snk_blogPosts'u kontrol et
        let blogPosts = JSON.parse(localStorage.getItem('snk_blog_posts') || '[]');
        if (blogPosts.length === 0) {
            blogPosts = JSON.parse(localStorage.getItem('snk_blogPosts') || '[]');
        }
        
        console.log('Blog yazıları:', blogPosts);
        
        // Kullanıcının onaylanmamış blog yazıları var mı?
        const hasPendingPosts = blogPosts.some(post => {
            // post.author kontrolü
            if (!post.author) return false;
            
            // post.author bir string olabilir veya bir obje olabilir
            let authorEmail = '';
            if (typeof post.author === 'string') {
                authorEmail = post.author;
            } else if (post.author.email) {
                authorEmail = post.author.email;
            }
            
            const isPendingPost = 
                authorEmail === currentUser.email && 
                (post.status === 'pending' || post.status !== 'published');
                
            console.log('Post kontrolü:', post.title, 'Yazar:', authorEmail, 'Status:', post.status, 'Pending mi:', isPendingPost);
            
            return isPendingPost;
        });
        
        console.log('Kullanıcının onaylanmamış yazısı var mı:', hasPendingPosts);
        
        if (isPending || hasPendingPosts) {
            console.log('Kullanıcı onay bekliyor veya onaylanmamış yazısı var, modal gösteriliyor');
            // Kullanıcı onay bekliyor veya onaylanmamış blog yazısı var
            showPendingApprovalMessage();
            return;
        }
    }
    
    console.log('Normal admin giriş formu gösteriliyor');
    // Her seferinde giriş formunu göster (localStorage kontrolünü kaldırdık)
    showAdminLoginForm();
}

/**
 * Onay bekleyen kullanıcı için bilgi mesajı göster
 */
function showPendingApprovalMessage() {
    console.log('showPendingApprovalMessage fonksiyonu çalıştı');
    
    const pendingModal = document.getElementById('pending-approval-modal');
    console.log('pending-approval-modal elementi:', pendingModal);
    
    if (pendingModal) {
        // Mevcut onay bekleme modalını göster
        pendingModal.style.display = 'flex';
        
        // OK butonuna olay dinleyicisi ekle
        const okButton = document.getElementById('pending-approval-ok');
        if (okButton) {
            console.log('OK butonu bulundu, event listener ekleniyor');
            // Eğer zaten olay dinleyicisi varsa, yeni bir tane eklemeyi önle
            okButton.removeEventListener('click', handlePendingOkClick);
            okButton.addEventListener('click', handlePendingOkClick);
        } else {
            console.error('pending-approval-ok butonu bulunamadı');
        }
    } else {
        console.error('pending-approval-modal elementi bulunamadı');
        // Modal yok, daha basit bir uyarı göster
        alert('Hesabınız veya blog yazılarınız yönetici onayı bekliyor. Şu anda admin paneline erişemezsiniz.');
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// OK butonu tıklama olayı için ayrılmış fonksiyon
function handlePendingOkClick() {
    console.log('Onay bekleme modalı kapatılıyor');
    const pendingModal = document.getElementById('pending-approval-modal');
    if (pendingModal) {
        pendingModal.style.display = 'none';
    }
    
    // Ana sayfaya yönlendir
    console.log('Ana sayfaya yönlendiriliyor');
    window.location.href = 'index.html';
}

// Sayfa yüklendiğinde admin sayfasını başlat
document.addEventListener('DOMContentLoaded', initAdminPage);

// Fonksiyonları global scope'a ekle
window.showAdminLoginForm = showAdminLoginForm;
window.validateAdminLogin = validateAdminLogin;
window.initAdminPage = initAdminPage;
window.logoutAdmin = logoutAdmin;
window.checkUserApprovalStatus = checkUserApprovalStatus;
window.showPendingApprovalMessage = showPendingApprovalMessage;
window.handlePendingOkClick = handlePendingOkClick;
