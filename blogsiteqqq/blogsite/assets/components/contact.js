// İletişim Formu İşlevselliği

document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            // Form e-posta olarak gönderilecek, bu yüzden e.preventDefault() kullanmıyoruz

            // Form değerlerini al
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value;

            // E-posta gönderme işlemi action="mailto:..." ile otomatik gerçekleştiriliyor
            console.log("Form gönderildi:", { name, email, subject, message });

            // Başarı mesajı göster - e-posta istemcisi açılacağı için burada göstermiyoruz
            // Verileri kontrol et
            if (!name || !email || !subject || !message) {
                e.preventDefault(); // Eğer form eksikse, gönderimi engelle
                showNotification("Lütfen tüm alanları doldurun!", "error");
                return false;
            }

            // Form başarıyla gönderildi
            showNotification("E-posta istemciniz açılıyor...", "info");

            // Form başarıyla gönderildiğinde kullanıcıya bilgi ver
            // Not: Gerçek e-posta gönderimi tarayıcının mailto: protokolü ile gerçekleşecek
            return true;
        });
    }

    // Bildirim fonksiyonu
    function showNotification(message, type = "info") {
        // Bildirim container'ı kontrol et, yoksa oluştur
        let notificationContainer = document.querySelector(".snk-notification-container");

        if (!notificationContainer) {
            notificationContainer = document.createElement("div");
            notificationContainer.className = "snk-notification-container";
            document.body.appendChild(notificationContainer);
        }

        // Yeni bildirim oluştur
        const notification = document.createElement("div");
        notification.className = `snk-notification ${type}`;

        // İkon seç
        let icon = "fa-info-circle";
        if (type === "success") icon = "fa-check-circle";
        if (type === "error") icon = "fa-exclamation-circle";
        if (type === "warning") icon = "fa-exclamation-triangle";

        // Bildirim içeriği
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="snk-notification-content">${message}</div>
            <button class="snk-notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Ekle ve göster
        notificationContainer.appendChild(notification);

        // Kapanma düğmesi olayını ekle
        const closeButton = notification.querySelector(".snk-notification-close");
        closeButton.addEventListener("click", function () {
            notification.classList.add("closing");
            setTimeout(() => {
                notification.remove();
            }, 300);
        });

        // Otomatik kapanma
        setTimeout(() => {
            notification.classList.add("closing");
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
});
