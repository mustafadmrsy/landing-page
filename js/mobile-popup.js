/**
 * Mobil Popup Sistemi - v2.0
 * Blog yazılarının popup şeklinde gösterilmesi için özel mobil uyumlu sistem
 */

document.addEventListener('DOMContentLoaded', function() {
    // Popup elementlerini seç
    const popupContainer = document.querySelector('.popup-container');
    const popupContent = document.querySelector('.popup-content');
    const readMoreButtons = document.querySelectorAll('.read-more-btn');

    // Popup açma fonksiyonu
    function openPopup(content) {
        if (popupContainer && popupContent) {
            // Popup içeriğini ayarla
            popupContent.innerHTML = `
                <button class="popup-close" aria-label="Kapat">
                    <i class="fas fa-times"></i>
                </button>
                ${content}
            `;

            // Popup'ı göster
            popupContainer.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Kapatma butonunu aktifleştir
            const closeButton = popupContent.querySelector('.popup-close');
            if (closeButton) {
                closeButton.addEventListener('click', closePopup);
            }

            // Dışarı tıklamayı dinle
            popupContainer.addEventListener('click', function(e) {
                if (e.target === popupContainer) {
                    closePopup();
                }
            });

            // ESC tuşunu dinle
            document.addEventListener('keydown', handleEscKey);
        }
    }

    // Popup kapatma fonksiyonu
    function closePopup() {
        if (popupContainer) {
            popupContainer.classList.remove('active');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscKey);
        }
    }

    // ESC tuşu için event handler
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    }

    // Devamını Oku butonlarına tıklama olayı ekle
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Blog içeriğini al
            const blogPost = this.closest('.blog-post');
            if (blogPost) {
                const content = blogPost.querySelector('.full-content').innerHTML;
                openPopup(content);
            }
        });
    });
});
