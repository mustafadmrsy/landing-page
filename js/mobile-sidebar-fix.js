// Mobil cihazlar için sidebar buton düzeltme
document.addEventListener('DOMContentLoaded', function() {
    function fixMobileSidebarButton() {
        // Sidebar toggle butonunu seç
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        
        // Eğer buton yoksa işlem yapma
        if (!sidebarToggle) return;
        
        // Eğer mobil cihaz ise (768px altında)
        if (window.innerWidth <= 768) {
            // Butonun görünürlüğünü kontrol et ve düzelt
            sidebarToggle.style.cssText = `
                position: fixed !important;
                right: auto !important;
                left: 10px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                width: 50px !important;
                height: 50px !important;
                background-color: rgba(0, 86, 179, 0.9) !important;
                color: white !important;
                border-radius: 50% !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
                z-index: 9999 !important;
                opacity: 1 !important;
                visibility: visible !important;
                border: 2px solid white !important;
            `;
            
            // Sidebar toggle butonundaki simgeyi düzelt
            const icon = sidebarToggle.querySelector('i');
            if (icon) {
                icon.style.color = 'white';
                icon.style.fontSize = '1.5rem';
            }
            
            console.log('Mobil sidebar butonu düzeltildi');
        } else {
            // Masaüstü görünümünde (768px üzerinde) ise tüm inline stilleri temizle
            sidebarToggle.removeAttribute('style');
            
            // Simgenin stilini de temizle
            const icon = sidebarToggle.querySelector('i');
            if (icon) {
                icon.removeAttribute('style');
            }
            
            console.log('Masaüstü görünümü için sidebar butonu orijinal haline getirildi');
        }
    }
    
    // Sayfa yüklendiğinde düzeltmeyi uygula
    fixMobileSidebarButton();
    
    // Sayfa boyutu değiştiğinde de kontrol et
    window.addEventListener('resize', fixMobileSidebarButton);
    
    // 500ms sonra tekrar kontrol et (bazı tarayıcılarda geç yüklenen elementler için)
    setTimeout(fixMobileSidebarButton, 500);
});
