/**
 * Sidebar JavaScript - Senirkent Blog
 * Her fonksiyon öneki: snk_sidebar_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını tanımla
const snk_sidebar_container = document.querySelector('.snk-container');
const snk_sidebar_element = document.querySelector('.snk-sidebar');
const snk_sidebar_toggleBtn = document.querySelector('#sidebarToggle');
const snk_sidebar_profileTrigger = document.querySelector('#profileTrigger');
const snk_sidebar_profileMenu = document.querySelector('#profileMenu');
const snk_sidebar_mainContent = document.querySelector('#mainContent');

// Overlay element oluştur (mobil görünüm için)
const snk_sidebar_overlay = document.createElement('div');
snk_sidebar_overlay.className = 'snk-overlay';
document.body.appendChild(snk_sidebar_overlay);

/**
 * Ekran genişliğini kontrol edip masaüstü/mobil olma durumunu döndürür
 * @returns {boolean} - true: masaüstü, false: mobil
 */
function snk_sidebar_isDesktop() {
    return window.innerWidth >= 769;
}

/**
 * Sidebar durumunu değiştirir (masaüstü: daralt/genişlet, mobil: aç/kapat)
 */
function snk_sidebar_toggleSidebar() {
    if (snk_sidebar_isDesktop()) {
        // Masaüstü görünümü
        snk_sidebar_container.classList.toggle('collapsed');
    } else {
        // Mobil görünümü
        snk_sidebar_element.classList.toggle('active');
        snk_sidebar_overlay.classList.toggle('active');
    }
}

/**
 * Profil menüsünü açıp kapatır
 * @param {Event} e - Tıklama olayı
 */
function snk_sidebar_toggleProfileMenu(e) {
    e.stopPropagation();
    snk_sidebar_profileTrigger.classList.toggle('active');
    snk_sidebar_profileMenu.classList.toggle('active');
}

/**
 * Sidebar dışında tıklama yapıldığında sidebar ve profil menüsünü kapatır
 * @param {Event} e - Tıklama olayı
 */
function snk_sidebar_handleClickOutside(e) {
    // Profil menüsü dışında tıklama
    if (snk_sidebar_profileMenu.classList.contains('active') && 
        !snk_sidebar_profileTrigger.contains(e.target) && 
        !snk_sidebar_profileMenu.contains(e.target)) {
        snk_sidebar_profileTrigger.classList.remove('active');
        snk_sidebar_profileMenu.classList.remove('active');
    }

    // Mobil görünümde sidebar dışında tıklama
    if (!snk_sidebar_isDesktop() && 
        snk_sidebar_element.classList.contains('active') && 
        !snk_sidebar_element.contains(e.target) && 
        !snk_sidebar_toggleBtn.contains(e.target)) {
        snk_sidebar_element.classList.remove('active');
        snk_sidebar_overlay.classList.remove('active');
    }
}

/**
 * ESC tuşuna basıldığında açık menüleri kapatır
 * @param {KeyboardEvent} e - Klavye olayı
 */
function snk_sidebar_handleKeyPress(e) {
    if (e.key === 'Escape') {
        // Profil menüsünü kapat
        if (snk_sidebar_profileMenu.classList.contains('active')) {
            snk_sidebar_profileTrigger.classList.remove('active');
            snk_sidebar_profileMenu.classList.remove('active');
        }
        
        // Mobil görünümde sidebar'ı kapat
        if (!snk_sidebar_isDesktop() && snk_sidebar_element.classList.contains('active')) {
            snk_sidebar_element.classList.remove('active');
            snk_sidebar_overlay.classList.remove('active');
        }
    }
}

/**
 * Ekran yeniden boyutlandığında davranışları ayarla
 */
function snk_sidebar_handleResize() {
    if (snk_sidebar_isDesktop()) {
        // Mobil görünümden masaüstü görünümüne geçişte temizlik
        snk_sidebar_element.classList.remove('active');
        snk_sidebar_overlay.classList.remove('active');
        
        // Daraltma durumunu koruma kodu
        if (localStorage.getItem('snk_sidebar_collapsed') === 'true') {
            snk_sidebar_container.classList.add('collapsed');
        } else {
            snk_sidebar_container.classList.remove('collapsed');
        }
    } else {
        // Masaüstü daralt durumunu kaldır
        snk_sidebar_container.classList.remove('collapsed');
    }
}

/**
 * Daraltma durumunu yerel depolamaya kaydet
 */
function snk_sidebar_saveCollapseState() {
    if (snk_sidebar_isDesktop()) {
        const isCollapsed = snk_sidebar_container.classList.contains('collapsed');
        localStorage.setItem('snk_sidebar_collapsed', isCollapsed);
    }
}

// Sayfa yüklendiğinde önceki durumu yükle
document.addEventListener('DOMContentLoaded', () => {
    // Kayıtlı daraltma durumunu yükle (sadece masaüstü görünümünde)
    if (snk_sidebar_isDesktop() && localStorage.getItem('snk_sidebar_collapsed') === 'true') {
        snk_sidebar_container.classList.add('collapsed');
    }
    
    // Aktif sayfayı vurgula
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.snk-nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Olay dinleyicileri tanımla
snk_sidebar_toggleBtn.addEventListener('click', snk_sidebar_toggleSidebar);
snk_sidebar_toggleBtn.addEventListener('click', snk_sidebar_saveCollapseState);
snk_sidebar_profileTrigger.addEventListener('click', snk_sidebar_toggleProfileMenu);
document.addEventListener('click', snk_sidebar_handleClickOutside);
document.addEventListener('keydown', snk_sidebar_handleKeyPress);
window.addEventListener('resize', snk_sidebar_handleResize);
snk_sidebar_overlay.addEventListener('click', snk_sidebar_toggleSidebar);

// Sidebar menü öğeleri için tooltip verileri ekle (daraltılmış görünümde kullanmak için)
document.querySelectorAll('.snk-nav-link').forEach(link => {
    const text = link.querySelector('.snk-nav-text').textContent;
    link.setAttribute('data-title', text);
});
