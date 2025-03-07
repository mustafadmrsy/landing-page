/**
 * Sidebar JavaScript - Senirkent Blog
 * Her fonksiyon öneki: snk_sidebar_ (kod çakışmalarını önlemek için)
 */

// DOM elemanlarını tanımla
const snk_sidebar = document.querySelector('.snk-sidebar');
const snk_mainContent = document.querySelector('.snk-main-content');
const snk_sidebarToggle = document.getElementById('sidebarToggle');
const snk_mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
const snk_profileTrigger = document.getElementById('profileTrigger');
const snk_profileMenu = document.getElementById('profileMenu');

// Medya sorgusu - mobil mi masaüstü mü
const snk_sidebar_isMobile = () => window.innerWidth <= 768;

/**
 * Sayfa yüklendiğinde çalışacak fonksiyonlar
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sidebar.js yüklendi");

    // DOM elemanlarını kontrol et ve ekrana bilgi yazdır
    console.log("Sidebar elemanları:", {
        sidebar: snk_sidebar, 
        mainContent: snk_mainContent,
        sidebarToggle: snk_sidebarToggle,
        mobileSidebarToggle: snk_mobileSidebarToggle,
        profileTrigger: snk_profileTrigger,
        profileMenu: snk_profileMenu
    });

    // Başlangıç durumunu ayarla
    snk_sidebar_setupInitialState();
    
    // Olay dinleyicilerini ekle
    snk_sidebar_setupEventListeners();
    
    // Pencere yeniden boyutlandırıldığında kontrolleri yap
    window.addEventListener('resize', snk_sidebar_handleResize);
});

/**
 * Sidebar başlangıç durumunu ayarlar
 */
function snk_sidebar_setupInitialState() {
    if (!snk_sidebar) {
        console.error("Sidebar bulunamadı");
        return;
    }
    
    // Yerel depolamadan sidebar durumunu al (collapsed mı değil mi)
    const isCollapsed = localStorage.getItem('snk_sidebar_collapsed') === 'true';
    
    if (snk_sidebar_isMobile()) {
        // Mobil görünümde sidebar varsayılan olarak kapalı
        snk_sidebar.classList.remove('collapsed');
        snk_sidebar.classList.remove('active');
        
        // Mobil menü butonunu göster
        if (snk_mobileSidebarToggle) {
            snk_mobileSidebarToggle.style.display = 'flex';
        }
        
        // Mobil görünüme geçince sidebar toggle butonunun ikonunu güncelle
        if (snk_sidebarToggle) {
            const icon = snk_sidebarToggle.querySelector('i');
            if (icon) {
                icon.className = ''; // Önceki tüm sınıfları temizle
                icon.classList.add('fas', 'fa-times'); // Çarpı ikonu ekle
            }
        }
        
        // Ana içeriğin margin'ini kaldır
        if (snk_mainContent) {
            snk_mainContent.style.marginLeft = '0';
        }
    } else {
        // Masaüstü görünümde yerel depolamadaki durumu uygula
        if (isCollapsed) {
            snk_sidebar.classList.add('collapsed');
            if (snk_mainContent) {
                snk_mainContent.style.marginLeft = 'var(--snk-sidebar-collapsed-width)';
            }
            
            // Toggle butonundaki ikonu güncelle
            if (snk_sidebarToggle) {
                const icon = snk_sidebarToggle.querySelector('i');
                if (icon) {
                    icon.className = ''; // Önceki tüm sınıfları temizle
                    icon.classList.add('fas', 'fa-chevron-right');
                }
            }
        } else {
            snk_sidebar.classList.remove('collapsed');
            if (snk_mainContent) {
                snk_mainContent.style.marginLeft = 'var(--snk-sidebar-width)';
            }
            
            // Toggle butonundaki ikonu güncelle
            if (snk_sidebarToggle) {
                const icon = snk_sidebarToggle.querySelector('i');
                if (icon) {
                    icon.className = ''; // Önceki tüm sınıfları temizle
                    icon.classList.add('fas', 'fa-chevron-left');
                }
            }
        }
        
        // Mobil menü butonunu gizle
        if (snk_mobileSidebarToggle) {
            snk_mobileSidebarToggle.style.display = 'none';
        }
    }
}

/**
 * Olay dinleyicilerini ekler
 */
function snk_sidebar_setupEventListeners() {
    // Sidebar toggle butonu için olay dinleyicisi
    if (snk_sidebarToggle) {
        snk_sidebarToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Tıklamanın dışarı yayılmasını engelle
            
            // Mobil görünümde farklı davranış
            if (snk_sidebar_isMobile()) {
                snk_sidebar_toggleMobileSidebar();
            } else {
                snk_sidebar_toggleSidebar();
            }
        });
        console.log("Sidebar toggle butonu olay dinleyicisi eklendi");
    } else {
        console.warn("Sidebar toggle butonu bulunamadı (ID: sidebarToggle)");
    }
    
    // Mobil hamburger menüsü için olay dinleyicisi
    if (snk_mobileSidebarToggle) {
        snk_mobileSidebarToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Tıklamanın dışarı yayılmasını engelle
            snk_sidebar_toggleMobileSidebar();
        });
        console.log("Mobil menu butonu olay dinleyicisi eklendi");
    } else {
        console.warn("Mobil sidebar toggle butonu bulunamadı (ID: mobileSidebarToggle)");
    }
    
    // Profil menüsü için olay dinleyicisi
    if (snk_profileTrigger && snk_profileMenu) {
        snk_profileTrigger.addEventListener('click', (event) => {
            event.stopPropagation(); // Tıklamanın dışarı yayılmasını engelle
            snk_profileMenu.classList.toggle('active');
            
            // Profil menüsü açıldığında dışarı tıklandığında kapanması için
            document.addEventListener('click', snk_sidebar_handleDocumentClick);
        });
    } else {
        console.warn("Profil trigger veya profil menüsü bulunamadı");
    }
    
    // Mobil görünümde sayfa dışına tıklanınca sidebar'ı kapat
    document.addEventListener('click', (event) => {
        if (snk_sidebar_isMobile() && 
            snk_sidebar && 
            snk_sidebar.classList.contains('active') &&
            !snk_sidebar.contains(event.target) &&
            (!snk_mobileSidebarToggle || !snk_mobileSidebarToggle.contains(event.target))) {
            snk_sidebar.classList.remove('active');
        }
    });
}

/**
 * Sayfa genişliği değiştiğinde çalışacak fonksiyon
 */
function snk_sidebar_handleResize() {
    // Medya sorgusuna göre sidebar'ı ayarla
    snk_sidebar_setupInitialState();
}

/**
 * Belge tıklamalarını işler (profil menüsü için)
 */
function snk_sidebar_handleDocumentClick(event) {
    if (snk_profileTrigger && 
        snk_profileMenu && 
        !snk_profileTrigger.contains(event.target) && 
        !snk_profileMenu.contains(event.target)) {
        
        snk_profileMenu.classList.remove('active');
        
        // Event listener'ı kaldır (performans için)
        document.removeEventListener('click', snk_sidebar_handleDocumentClick);
    }
}

/**
 * Sidebar'ı genişlet/daralt (masaüstü görünümü için)
 */
function snk_sidebar_toggleSidebar() {
    if (!snk_sidebar) {
        console.error("Sidebar bulunamadı");
        return;
    }
    
    // Mobil görünümde sidebar davranışını farklı ele al
    if (snk_sidebar_isMobile()) {
        snk_sidebar_toggleMobileSidebar();
        return;
    }
    
    // Masaüstü görünümünde sidebar davranışı
    const isCollapsed = snk_sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Sidebar daraltılmışsa genişlet
        snk_sidebar.classList.remove('collapsed');
        if (snk_mainContent) {
            snk_mainContent.style.marginLeft = 'var(--snk-sidebar-width)';
        }
        
        // İkonu güncelle
        if (snk_sidebarToggle) {
            const icon = snk_sidebarToggle.querySelector('i');
            if (icon) {
                icon.className = ''; // Önceki tüm sınıfları temizle
                icon.classList.add('fas', 'fa-chevron-left');
            }
        }
    } else {
        // Sidebar genişse daralt
        snk_sidebar.classList.add('collapsed');
        if (snk_mainContent) {
            snk_mainContent.style.marginLeft = 'var(--snk-sidebar-collapsed-width)';
        }
        
        // İkonu güncelle
        if (snk_sidebarToggle) {
            const icon = snk_sidebarToggle.querySelector('i');
            if (icon) {
                icon.className = ''; // Önceki tüm sınıfları temizle
                icon.classList.add('fas', 'fa-chevron-right');
            }
        }
    }
    
    // Yeni durumu yerel depolamaya kaydet
    localStorage.setItem('snk_sidebar_collapsed', !isCollapsed);
    
    console.log("Sidebar durumu değiştirildi:", !isCollapsed ? "daraltıldı" : "genişletildi");
}

/**
 * Mobil görünümde sidebar'ı aç/kapat
 */
function snk_sidebar_toggleMobileSidebar() {
    if (!snk_sidebar) {
        console.error("Sidebar bulunamadı");
        return;
    }
    
    // Mobil görünümde active class'ı ile aç/kapat
    const isActive = snk_sidebar.classList.contains('active');
    
    if (isActive) {
        // Açıksa kapat
        snk_sidebar.classList.remove('active');
        
        // İkonu güncelle (toggle butonunda)
        if (snk_sidebarToggle) {
            const icon = snk_sidebarToggle.querySelector('i');
            if (icon) {
                icon.className = '';
                icon.classList.add('fas', 'fa-times');
            }
        }
    } else {
        // Kapalıysa aç
        snk_sidebar.classList.add('active');
        
        // İkonu güncelle (toggle butonunda)
        if (snk_sidebarToggle) {
            const icon = snk_sidebarToggle.querySelector('i');
            if (icon) {
                icon.className = '';
                icon.classList.add('fas', 'fa-times');
            }
        }
    }
    
    console.log("Mobil sidebar durumu değiştirildi:", !isActive ? "açıldı" : "kapandı");
}

// Global erişim için
window.snk_sidebar_toggleSidebar = snk_sidebar_toggleSidebar;
window.snk_sidebar_toggleMobileSidebar = snk_sidebar_toggleMobileSidebar;
