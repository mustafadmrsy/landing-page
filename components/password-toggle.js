/**
 * Şifre Göster/Gizle Fonksiyonu
 * Bu script, şifre alanlarının görünürlüğünü değiştirmek için kullanılır.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Şifre gösterme/gizleme fonksiyonu yükleniyor...');
    
    // Sayfa yüklendiğinde ve her DOM değişikliğinde şifre butonlarını kontrol et
    setupPasswordToggleButtons();
    
    // MutationObserver ile DOM değişikliklerini izle (popup açıldığında vb.)
    const observer = new MutationObserver(function(mutations) {
        setupPasswordToggleButtons();
    });
    
    // Tüm document'ı izle
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Şifre gösterme/gizleme butonlarını ayarla
function setupPasswordToggleButtons() {
    // Tüm şifre toggle butonlarını seç
    const passwordToggles = document.querySelectorAll('.snk-password-toggle, #snk_login_toggle_password');
    
    passwordToggles.forEach(function(toggleBtn) {
        // Eğer bu butona daha önce event listener eklenmemişse
        if (!toggleBtn.dataset.initialized) {
            // Butonun yanındaki şifre input'unu bul
            const passwordInput = toggleBtn.closest('.snk-password-container').querySelector('input[type="password"], input[type="text"]');
            
            if (passwordInput) {
                // Event listener ekle
                toggleBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Input tipini değiştir
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    
                    // Button ikonunu değiştir
                    const icon = toggleBtn.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-eye');
                        icon.classList.toggle('fa-eye-slash');
                    }
                    
                    console.log('Şifre görünürlüğü değiştirildi:', type);
                });
                
                // Bu butona event listener eklendi olarak işaretle
                toggleBtn.dataset.initialized = 'true';
                console.log('Şifre toggle butonu başarıyla ayarlandı');
            }
        }
    });
}
