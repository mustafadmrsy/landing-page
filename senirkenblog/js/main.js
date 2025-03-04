document.addEventListener('DOMContentLoaded', function() {
    // Harita görüntüleme işlemleri
    if (document.getElementById('contact-map')) {
        const map = L.map('contact-map').setView([38.0614, 30.8093], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        const marker = L.marker([38.0614, 30.8093]).addTo(map);
        marker.bindPopup("<b>Senirkent Meslek Yüksekokulu</b><br>Isparta, Türkiye").openPopup();
    }
    
    // Sıkça Sorulan Sorular için accordion işlevselliği
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            // Tıklanan sorunun açık/kapalı durumunu değiştir
            question.classList.toggle('active');
        });
    });
    
    // Profil menüsü için toggle fonksiyonu
    const profileImage = document.querySelector('.profile-image');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileImage && profileDropdown) {
        profileImage.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!profileDropdown.contains(e.target) && e.target !== profileImage) {
                profileDropdown.classList.remove('active');
            }
        });
    }
});
