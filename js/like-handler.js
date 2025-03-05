document.addEventListener('DOMContentLoaded', function() {
    console.log('Like handler yüklendi');
    
    // Beğeni butonlarını dinleme fonksiyonu - hem sayfa yüklendiğinde hem de daha sonra dinamik olarak eklenecek butonlar için
    function setupLikeButtons() {
        // Tüm beğeni butonlarını seç
        const likeButtons = document.querySelectorAll('.like-btn');
        
        // Local Storage'dan kayıtlı beğenileri al
        let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};
        
        // Genel beğeni sayısını al 
        let generalLikeCount = parseInt(localStorage.getItem('generalLikeCount')) || 0;
        
        // Beğeni butonlarının durumunu güncelle
        likeButtons.forEach(button => {
            // Daha önce bir event listener eklenmişse, tekrar eklemeyi önle
            if (button.getAttribute('data-event-attached') === 'true') {
                return;
            }
            
            const postId = button.getAttribute('data-post-id');
            const countElement = button.querySelector('.social-count');
            
            // data-post-id olmayan butonlar için genel beğeni sayısını göster
            if (!postId && countElement) {
                countElement.textContent = generalLikeCount;
                
                // Genel beğeni durumunu kontrol et
                if (localStorage.getItem('generalLiked') === 'true') {
                    button.classList.add('active');
                    const icon = button.querySelector('i');
                    if (icon && icon.classList.contains('far')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                }
            }
            // data-post-id olan butonlar için post özelindeki beğeni sayısını göster
            else if (postId && countElement) {
                // Beğenilmiş durumunda butonun görünümünü ayarla
                if (likedPosts[postId]) {
                    button.classList.add('active');
                    const icon = button.querySelector('i');
                    if (icon && icon.classList.contains('far')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                }
            }
            
            // Click event listener ekle
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-post-id');
                const countElement = this.querySelector('.social-count');
                
                if (!countElement) {
                    console.error('Beğeni butonu için sayaç elementi bulunamadı.');
                    return;
                }
                
                // data-post-id olmayan butonlar için genel beğeni kullan
                if (!postId) {
                    // Beğeni sayısını al
                    let likeCount = parseInt(countElement.textContent) || 0;
                    
                    // Beğeni durumunu kontrol et
                    if (localStorage.getItem('generalLiked') === 'true') {
                        // Beğeniyi kaldır
                        likeCount = Math.max(0, likeCount - 1);
                        localStorage.setItem('generalLiked', 'false');
                        this.classList.remove('active');
                        const icon = this.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fas');
                            icon.classList.add('far');
                        }
                    } else {
                        // Beğeni ekle
                        likeCount++;
                        localStorage.setItem('generalLiked', 'true');
                        this.classList.add('active');
                        const icon = this.querySelector('i');
                        if (icon) {
                            icon.classList.remove('far');
                            icon.classList.add('fas');
                        }
                    }
                    
                    // Sayacı güncelle
                    countElement.textContent = likeCount;
                    // Genel beğeni sayısını güncelle
                    localStorage.setItem('generalLikeCount', likeCount.toString());
                    
                    // Aynı data-post-id'si olmayan diğer beğeni butonlarını da güncelle
                    updateGeneralLikeButtons(likeCount, localStorage.getItem('generalLiked') === 'true', this);
                } 
                // data-post-id olan butonlar için post özelinde beğeni kullan
                else {
                    // Beğeni sayısını al
                    let likeCount = parseInt(countElement.textContent) || 0;
                    
                    // Daha önce beğenilmiş mi kontrol et
                    if (likedPosts[postId]) {
                        // Beğeniyi kaldır
                        likeCount = Math.max(0, likeCount - 1);
                        delete likedPosts[postId];
                        this.classList.remove('active');
                        const icon = this.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fas');
                            icon.classList.add('far');
                        }
                    } else {
                        // Beğeni ekle
                        likeCount++;
                        likedPosts[postId] = true;
                        this.classList.add('active');
                        const icon = this.querySelector('i');
                        if (icon) {
                            icon.classList.remove('far');
                            icon.classList.add('fas');
                        }
                    }
                    
                    // Sayacı güncelle
                    countElement.textContent = likeCount;
                    
                    // Local Storage'a kaydet
                    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                    
                    // Aynı postId'ye sahip diğer beğeni butonlarını da güncelle
                    updatePostLikeButtons(postId, likeCount, likedPosts[postId], this);
                }
                
                // Animasyon efekti
                animateLike(this);
            });
            
            // Event listener eklendiğini işaretle
            button.setAttribute('data-event-attached', 'true');
        });
    }
    
    // data-post-id olmayan beğeni butonlarını güncelle
    function updateGeneralLikeButtons(likeCount, isLiked, currentButton) {
        const allGeneralLikeButtons = document.querySelectorAll('.like-btn:not([data-post-id])');
        allGeneralLikeButtons.forEach(btn => {
            if (btn !== currentButton) { // Şu anki butonun dışındakileri güncelle
                const btnCountElement = btn.querySelector('.social-count');
                if (btnCountElement) {
                    btnCountElement.textContent = likeCount;
                }
                
                if (isLiked) {
                    btn.classList.add('active');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                } else {
                    btn.classList.remove('active');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                }
            }
        });
    }
    
    // data-post-id olan beğeni butonlarını güncelle
    function updatePostLikeButtons(postId, likeCount, isLiked, currentButton) {
        const allPostLikeButtons = document.querySelectorAll(`.like-btn[data-post-id="${postId}"]`);
        allPostLikeButtons.forEach(btn => {
            if (btn !== currentButton) { // Şu anki butonun dışındakileri güncelle
                const btnCountElement = btn.querySelector('.social-count');
                if (btnCountElement) {
                    btnCountElement.textContent = likeCount;
                }
                
                if (isLiked) {
                    btn.classList.add('active');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                } else {
                    btn.classList.remove('active');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    }
                }
            }
        });
    }
    
    // Beğeni butonları için animasyon
    function animateLike(button) {
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 500);
    }
    
    // Sayfa ilk yüklendiğinde beğeni butonlarını ayarla
    setupLikeButtons();
    
    // Popup açıldığında veya DOM değişikliği olduğunda yeni eklenen beğeni butonlarını dinle
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Yeni eklenen düğümlerde beğeni butonları var mı kontrol et
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1 && node.classList && node.classList.contains('like-btn')) {
                        // Doğrudan eklenen düğüm beğeni butonu ise
                        setupLikeButtons();
                        break;
                    } else if (node.nodeType === 1) {
                        // İçinde beğeni butonu olabilecek bir konteyner ise
                        const buttons = node.querySelectorAll('.like-btn');
                        if (buttons.length > 0) {
                            setupLikeButtons();
                            break;
                        }
                    }
                }
            }
        });
    });
    
    // Tüm belgeyi gözlemle (özellikle popup içeriğini)
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Popup kapatıldığında tekrar kontrol et
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('blog-popup-close') || 
            e.target.closest('.blog-popup-close') || 
            e.target.classList.contains('blog-popup-overlay')) {
            // Popup kapandıktan sonra ana sayfadaki beğeni butonlarını güncelle
            setTimeout(setupLikeButtons, 100);
        }
    });
});
