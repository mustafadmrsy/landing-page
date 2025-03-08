/**
 * Video işleme modülü
 * Bu modül, blog yazılarına eklenen video dosyalarının işlenmesini sağlar
 */

// Video önizleme görüntüsü oluştur
function createVideoPreview(videoFile) {
    return new Promise((resolve, reject) => {
        if (!videoFile) {
            reject('Video dosyası bulunamadı');
            return;
        }
        
        // Video türünü kontrol et
        if (!videoFile.type.startsWith('video/')) {
            reject('Geçersiz dosya türü. Lütfen bir video dosyası seçin.');
            return;
        }

        // Geçici URL oluştur
        const videoURL = URL.createObjectURL(videoFile);
        
        // Video elementi oluştur
        const videoPreview = document.createElement('div');
        videoPreview.className = 'snk-preview-container';
        
        videoPreview.innerHTML = `
            <video controls src="${videoURL}"></video>
            <button type="button" class="snk-remove-video">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Sil butonunu etkinleştir
        const removeButton = videoPreview.querySelector('.snk-remove-video');
        removeButton.addEventListener('click', () => {
            URL.revokeObjectURL(videoURL); // Geçici URL'i serbest bırak
            videoPreview.remove();
            resolve(null);
        });
        
        resolve(videoPreview);
    });
}

// Video dosyasını base64'e dönüştür
function videoToBase64(videoFile) {
    return new Promise((resolve, reject) => {
        if (!videoFile) {
            reject('Video dosyası bulunamadı');
            return;
        }
        
        // Dosya türünü kontrol et
        if (!videoFile.type.startsWith('video/')) {
            reject('Geçersiz dosya türü. Lütfen bir video dosyası seçin.');
            return;
        }
        
        // Dosya boyutunu kontrol et (5MB üzeri uyarı)
        if (videoFile.size > 5 * 1024 * 1024) {
            console.warn('Video dosyası 5MB üzerinde. Performans sorunları yaşanabilir.');
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function() {
            reject('Video dosyası okunamadı');
        };
        
        reader.readAsDataURL(videoFile);
    });
}

// Base64 veriyi kullanarak video elementi oluştur
function createVideoElementFromBase64(base64Data, videoType) {
    if (!base64Data) return null;
    
    const videoContainer = document.createElement('div');
    videoContainer.className = 'snk-video-container';
    
    videoContainer.innerHTML = `
        <video controls>
            <source src="${base64Data}" type="${videoType}">
            Tarayıcınız video etiketini desteklemiyor.
        </video>
    `;
    
    return videoContainer;
}

// Video dosyası bilgilerini göster
function displayVideoInfo(videoFile) {
    if (!videoFile) return '';
    
    const fileSize = (videoFile.size / 1024 / 1024).toFixed(2); // MB cinsinden
    const fileType = videoFile.type;
    const fileName = videoFile.name;
    
    return `
        <div class="snk-file-info">
            <span class="snk-file-name">${fileName}</span>
            <span class="snk-file-size">${fileSize} MB</span>
            <span class="snk-file-type">${fileType}</span>
        </div>
    `;
}

// Blog yazısında video varsa, video bilgisini göster
function displayVideoInBlogCard(blogPost) {
    if (!blogPost.videoData) return '';
    
    return `
        <div class="snk-blog-card-badge">
            <i class="fas fa-video"></i>
            <span>Video</span>
        </div>
    `;
}

// Kullanılabilir export fonksiyonlarını dışa aktar
window.videoHandler = {
    createVideoPreview,
    videoToBase64,
    createVideoElementFromBase64,
    displayVideoInfo,
    displayVideoInBlogCard
};
