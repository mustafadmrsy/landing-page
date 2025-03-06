/**
 * Mobil Menü Yönetimi - v1.0
 * Basit ve sağlam mobil menü işlevselliği
 */

document.addEventListener('DOMContentLoaded', function() {
    // Gerekli elementleri seç
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;

    // Menü durumunu takip et
    let isMenuOpen = false;

    // Menü toggle fonksiyonu
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Click olaylarını yönet
    if (menuToggle && mobileMenu) {
        // Menü butonuna tıklama
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Menü dışına tıklama
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !mobileMenu.contains(e.target) && e.target !== menuToggle) {
                toggleMenu();
            }
        });

        // Menü içindeki linklere tıklama
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu();
            });
        });
    }

    // Ekran yeniden boyutlandırıldığında menüyü kapat
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen) {
            toggleMenu();
        }
    });
});
