document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mainContent = document.querySelector('main');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const profileMenu = document.querySelector('.profile-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sidebar durumunu localStorage'dan al
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isSidebarCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
    }

    // Sidebar toggle butonu için event listener
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (window.innerWidth > 768) {
                sidebar.classList.toggle('collapsed');
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            } else {
                document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
            }
        });
    }

    // Mobil menü butonu için event listener
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Profil menüsü için event listener
    if (profileMenu) {
        profileMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            if (window.innerWidth <= 768) {
                this.classList.toggle('active');
            }
        });
    }

    // Mobilde sidebar dışına tıklandığında menüyü kapat
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const isClickInside = sidebar.contains(e.target) || 
                                (mobileMenuBtn && mobileMenuBtn.contains(e.target));
            
            if (!isClickInside && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Mobilde nav linklerine tıklandığında menüyü kapat
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Ekran boyutu değiştiğinde kontrol
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.body.style.overflow = '';
            if (isSidebarCollapsed) {
                sidebar.classList.add('collapsed');
            }
        } else {
            sidebar.classList.remove('active');
            sidebar.classList.remove('collapsed');
        }
    });

    const blogPopupOverlay = document.querySelector('.blog-popup-overlay');
    const blogPopupContent = document.querySelector('.blog-popup-content');
    const blogPopupClose = document.querySelector('.blog-popup-close');
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    
    if (readMoreBtns.length > 0 && blogPopupOverlay && blogPopupContent && blogPopupClose) {
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const blogPost = this.closest('.blog-post');
                const postFullContent = blogPost.querySelector('.post-full-content');
                const postTitle = blogPost.querySelector('.post-title').textContent;
                
                if (postFullContent) {
                    // Popup içeriğini ayarla
                    blogPopupContent.innerHTML = `
                        <h2>${postTitle}</h2>
                        ${postFullContent.innerHTML}
                    `;
                    
                    // Popup'ı göster
                    blogPopupOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        
        // Popup'ı kapatma işlevi
        blogPopupClose.addEventListener('click', function() {
            blogPopupOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Overlay'e tıklandığında popup'ı kapat
        blogPopupOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                blogPopupOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
