/**
 * Yorum Sistemi JavaScript Dosyası - Modüler Yapıda
 */

// Yorum sistemini kapsülleme - Global alanı kirletmemek için
const SNK_CommentSystem = (function() {
    // Özel değişkenler
    const STORAGE_KEY = 'snk_comments_data';
    let activePostId = null;
    
    // DOM elementlerini seçme
    function getDOMElements() {
        return {
            commentModal: document.getElementById('commentModal'),
            commentsList: document.getElementById('commentsList'),
            commentText: document.getElementById('commentText'),
            noCommentsMessage: document.getElementById('noCommentsMessage'),
            submitButton: document.getElementById('submitComment'),
            cancelButton: document.getElementById('cancelComment'),
            closeButton: document.getElementById('closeCommentModal')
        };
    }
    
    // Modal HTML'ini oluştur
    function createCommentModalHTML() {
        return `
        <div class="snk-comment-overlay" id="commentModal">
            <div class="snk-comment-container">
                <div class="snk-comment-header">
                    <div class="snk-comment-title">
                        <i class="fas fa-comments"></i> Yorumlar
                    </div>
                    <button class="snk-comment-close" id="closeCommentModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="snk-comment-form">
                    <div class="snk-comment-form-group">
                        <textarea class="snk-comment-textarea" id="commentText" placeholder="Düşüncelerinizi paylaşın..."></textarea>
                    </div>
                    <div class="snk-comment-button-group">
                        <button class="snk-comment-button snk-comment-cancel" id="cancelComment">İptal</button>
                        <button class="snk-comment-button snk-comment-submit" id="submitComment">
                            <i class="fas fa-paper-plane"></i> Yorum Gönder
                        </button>
                    </div>
                </div>
                
                <div class="snk-comments-list" id="commentsList">
                    <!-- Yorumlar JavaScript ile buraya eklenecek -->
                    <div class="snk-comment-empty" id="noCommentsMessage">
                        <div class="snk-comment-empty-icon">
                            <i class="far fa-comment-dots"></i>
                        </div>
                        <div class="snk-comment-empty-text">
                            Henüz yorum yok. İlk yorumu siz yapın!
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    
    // Yorum modal penceresini body'ye ekle
    function appendModalToBody() {
        // Modal HTML'i daha önce eklenmiş mi kontrol et
        if (!document.getElementById('commentModal')) {
            document.body.insertAdjacentHTML('beforeend', createCommentModalHTML());
            setupModalEvents();
        }
    }
    
    // Modal olaylarını ayarla
    function setupModalEvents() {
        const elements = getDOMElements();
        
        // Kapatma butonu
        if (elements.closeButton) {
            elements.closeButton.addEventListener('click', closeModal);
        }
        
        // İptal butonu
        if (elements.cancelButton) {
            elements.cancelButton.addEventListener('click', closeModal);
        }
        
        // Gönder butonu
        if (elements.submitButton) {
            elements.submitButton.addEventListener('click', submitNewComment);
        }
        
        // Modal dışına tıklama
        const modal = elements.commentModal;
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        }
    }
    
    // Yorum sistemi butonlarına olayları ekle
    function setupCommentButtons() {
        // Yorum butonları
        const commentButtons = document.querySelectorAll('.snk-comment-button');
        commentButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const postId = this.getAttribute('data-post-id');
                openModal(postId);
            });
        });
        
        // Beğen butonları
        const likeButtons = document.querySelectorAll('.snk-like-button');
        likeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                toggleLike(this);
            });
        });
        
        // Paylaş butonları
        const shareButtons = document.querySelectorAll('.snk-share-button');
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const postId = this.getAttribute('data-post-id');
                sharePost(postId, e);
            });
        });
    }
    
    // Modal penceresini aç
    function openModal(postId) {
        // Kullanıcı kontrolü
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Yorum yapmak için giriş yapmalısınız!');
            return;
        }
        
        // Aktif post ID'sini ayarla
        activePostId = postId;
        
        // Yorum alanını temizle
        const elements = getDOMElements();
        if (elements.commentText) {
            elements.commentText.value = '';
        }
        
        // Yorumları yükle
        loadComments(postId);
        
        // Modal'ı göster
        if (elements.commentModal) {
            elements.commentModal.classList.add('active');
        }
    }
    
    // Modal penceresini kapat
    function closeModal() {
        const modal = getDOMElements().commentModal;
        if (modal) {
            modal.classList.remove('active');
            // Aktif post ID'sini sıfırla
            activePostId = null;
        }
    }
    
    // Yorum gönderme
    function submitNewComment() {
        // Aktif post kontrolü
        if (!activePostId) {
            console.error('Aktif post ID bulunamadı');
            return;
        }
        
        // Kullanıcı kontrolü
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Yorum yapmak için giriş yapmalısınız!');
            return;
        }
        
        // Yorum metni kontrolü
        const elements = getDOMElements();
        const commentText = elements.commentText;
        
        if (!commentText || !commentText.value.trim()) {
            alert('Lütfen bir yorum yazın');
            return;
        }
        
        // Yorum objesi
        const comment = {
            id: 'comment_' + Date.now(),
            postId: activePostId,
            text: commentText.value.trim(),
            userId: currentUser.id || currentUser.username || 'anonymous',
            userName: currentUser.name || currentUser.username || 'Kullanıcı',
            date: new Date().toISOString()
        };
        
        // Yanıt verme kontrolü
        if (commentText.dataset.replyTo) {
            comment.replyTo = commentText.dataset.replyTo;
            comment.replyToUserName = commentText.dataset.replyToUsername;
        }
        
        // Yorumu kaydet
        saveComment(comment);
        
        // Alanı temizle
        commentText.value = '';
        
        // Yanıt verme bilgilerini temizle
        cancelReply();
        
        // Yorumları yeniden yükle
        loadComments(activePostId);
        
        // Başarılı bildirim göster
        showNotification('Yorumunuz başarıyla eklendi!');
    }
    
    // Bildirim gösterme
    function showNotification(message) {
        // Mevcut bildirim varsa kaldır
        const existingNotification = document.querySelector('.snk-comment-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Yeni bildirim oluştur
        const notification = document.createElement('div');
        notification.className = 'snk-comment-notification';
        notification.innerHTML = `
            <div class="snk-comment-notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Bildirimi body'ye ekle
        document.body.appendChild(notification);
        
        // Animasyon için sınıf ekle
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 3 saniye sonra bildirimi kaldır
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Yorumları yükleme
    function loadComments(postId) {
        if (!postId) {
            console.error("loadComments: Post ID bulunamadı!", postId);
            return;
        }
        
        console.log("Yorumlar yükleniyor. Post ID:", postId);
        
        // Tüm yorumları al
        const allComments = getAllComments();
        console.log("Sistemdeki tüm yorumlar:", allComments);
        
        // İlgili post yorumlarını filtrele
        const comments = allComments.filter(comment => comment.postId === postId);
        console.log("Bu blog yazısının yorumları:", comments);
        
        // Yorumları göster
        displayComments(comments);
    }
    
    // Yorumları görüntüleme
    function displayComments(comments) {
        const elements = getDOMElements();
        const commentsList = elements.commentsList;
        const noCommentsMessage = elements.noCommentsMessage;
        
        if (!commentsList) return;
        
        // Mevcut yorumları temizle
        const existingComments = commentsList.querySelectorAll('.snk-comment-item');
        existingComments.forEach(comment => comment.remove());
        
        // Yorum yoksa mesajı göster
        if (comments.length === 0) {
            if (noCommentsMessage) {
                noCommentsMessage.style.display = 'flex';
            }
            return;
        }
        
        // Yorum varsa mesajı gizle
        if (noCommentsMessage) {
            noCommentsMessage.style.display = 'none';
        }
        
        // Yorumları tarihe göre sırala (en yeni üstte)
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Yorumları ekle
        const currentUser = getCurrentUser();
        const currentUserId = currentUser ? (currentUser.id || currentUser.username) : null;
        
        comments.forEach(comment => {
            // Avatar için ilk harf
            const firstLetter = comment.userName.charAt(0).toUpperCase();
            
            // Tarihi formatla
            const dateObj = new Date(comment.date);
            const formattedDate = `${dateObj.getDate()}.${dateObj.getMonth() + 1}.${dateObj.getFullYear()} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
            
            // Yanıt içeriği
            const replyContent = comment.replyTo ? `
                <div class="snk-comment-reply-to">
                    <i class="fas fa-reply"></i> 
                    <span>${comment.replyToUserName || 'Kullanıcı'}</span>'a yanıt:
                </div>` : '';
            
            // Yorum HTML
            const commentHTML = `
            <div class="snk-comment-item" data-comment-id="${comment.id}">
                <div class="snk-comment-user">
                    <div class="snk-comment-avatar">${firstLetter}</div>
                    <span class="snk-comment-username">${comment.userName}</span>
                    <span class="snk-comment-date">${formattedDate}</span>
                </div>
                ${replyContent}
                <div class="snk-comment-text">${comment.text}</div>
                <div class="snk-comment-actions">
                    <button class="snk-comment-action-btn snk-comment-like">
                        <i class="far fa-heart"></i> Beğen
                    </button>
                    <button class="snk-comment-action-btn snk-comment-reply" data-comment-id="${comment.id}" data-username="${comment.userName}">
                        <i class="far fa-comment"></i> Yanıtla
                    </button>
                    ${(currentUserId && currentUserId === comment.userId) ? 
                    `<button class="snk-comment-action-btn snk-comment-delete" data-comment-id="${comment.id}">
                        <i class="far fa-trash-alt"></i> Sil
                    </button>` : ''}
                </div>
            </div>
            `;
            
            // Yorumu listeye ekle
            commentsList.insertAdjacentHTML('beforeend', commentHTML);
        });
        
        // Yorum silme butonlarına olay ekle
        const deleteButtons = commentsList.querySelectorAll('.snk-comment-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commentId = this.getAttribute('data-comment-id');
                deleteComment(commentId);
            });
        });
        
        // Beğeni butonlarına olay ekle
        const likeButtons = commentsList.querySelectorAll('.snk-comment-like');
        likeButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.classList.toggle('liked');
                
                // İkon değiştir
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('far');
                    icon.classList.toggle('fas');
                }
                
                // Sayaç güncelle
                const counter = button.querySelector('.snk-like-count');
                if (counter) {
                    let count = parseInt(counter.textContent);
                    count = button.classList.contains('liked') ? count + 1 : Math.max(0, count - 1);
                    counter.textContent = count;
                }
            });
        });
        
        // Yanıtla butonlarına olay ekle
        const replyButtons = commentsList.querySelectorAll('.snk-comment-reply');
        replyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commentId = this.getAttribute('data-comment-id');
                const username = this.getAttribute('data-username');
                prepareReply(commentId, username);
            });
        });
    }
    
    // Yanıt vermeye hazırla
    function prepareReply(commentId, username) {
        const elements = getDOMElements();
        const commentText = elements.commentText;
        
        if (commentText) {
            // Textarea içine yanıt önekini ekle
            commentText.value = `@${username} `;
            commentText.focus();
            
            // Yanıt edilecek yorum bilgisini saklama
            commentText.dataset.replyTo = commentId;
            commentText.dataset.replyToUsername = username;
            
            // Yanıt göstergesini ekle/göster
            let replyIndicator = document.getElementById('replyIndicator');
            if (!replyIndicator) {
                const indicatorHTML = `
                <div class="snk-reply-indicator" id="replyIndicator">
                    <span>Yanıtlanıyor: <strong>${username}</strong></span>
                    <button id="cancelReply"><i class="fas fa-times"></i></button>
                </div>`;
                elements.commentText.parentNode.insertBefore(document.createRange().createContextualFragment(indicatorHTML), elements.commentText);
                
                // İptal butonuna olay ekle
                document.getElementById('cancelReply').addEventListener('click', cancelReply);
            } else {
                replyIndicator.querySelector('strong').textContent = username;
                replyIndicator.style.display = 'flex';
            }
        }
    }
    
    // Yanıt iptal
    function cancelReply() {
        const elements = getDOMElements();
        const commentText = elements.commentText;
        
        if (commentText) {
            // Yanıt verme bilgilerini temizle
            delete commentText.dataset.replyTo;
            delete commentText.dataset.replyToUsername;
            
            // Textarea içeriğini temizle
            if (commentText.value.startsWith('@')) {
                commentText.value = '';
            }
            
            // Yanıt göstergesini gizle
            const replyIndicator = document.getElementById('replyIndicator');
            if (replyIndicator) {
                replyIndicator.style.display = 'none';
            }
        }
    }
    
    // Yorumu sil
    function deleteComment(commentId) {
        if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
            // Tüm yorumları al
            const allComments = getAllComments();
            
            // Silinecek yorumu filtrele
            const newComments = allComments.filter(comment => comment.id !== commentId);
            
            // Kaydet
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newComments));
            
            // Yeniden yükle
            if (activePostId) {
                loadComments(activePostId);
            }
        }
    }
    
    // Tüm yorumları al
    function getAllComments() {
        const commentsStr = localStorage.getItem(STORAGE_KEY);
        if (commentsStr) {
            try {
                return JSON.parse(commentsStr);
            } catch (e) {
                console.error('Yorumlar çözümlenemedi:', e);
            }
        }
        return [];
    }
    
    // Yorum kaydet
    function saveComment(comment) {
        const allComments = getAllComments();
        allComments.push(comment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allComments));
    }
    
    // Beğeni değiştir
    function toggleLike(button) {
        button.classList.toggle('liked');
        
        // İkon değiştir
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
        }
        
        // Sayaç güncelle
        const counter = button.querySelector('.snk-like-count');
        if (counter) {
            let count = parseInt(counter.textContent);
            count = button.classList.contains('liked') ? count + 1 : Math.max(0, count - 1);
            counter.textContent = count;
        }
    }
    
    // Paylaş
    function sharePost(postId, event) {
        // Tıklama olayının yayılmasını önle
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const shareUrl = window.location.origin + window.location.pathname + '?post=' + postId;
        
        // Mevcut paylaşım paneli varsa kaldır
        const existingPanel = document.querySelector('.snk-share-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Paylaşım seçenekleri
        const shareOptions = [
            { name: 'Twitter', icon: 'fab fa-twitter', action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank') },
            { name: 'Facebook', icon: 'fab fa-facebook', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank') },
            { name: 'WhatsApp', icon: 'fab fa-whatsapp', action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, '_blank') },
            { name: 'LinkedIn', icon: 'fab fa-linkedin', action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank') },
            { name: 'Kopyala', icon: 'far fa-copy', action: () => {
                navigator.clipboard.writeText(shareUrl)
                    .then(() => {
                        const copyBtn = document.querySelector('.snk-share-option[data-option="Kopyala"]');
                        if (copyBtn) {
                            const originalText = copyBtn.querySelector('.snk-share-option-text').textContent;
                            copyBtn.classList.add('copied');
                            copyBtn.querySelector('.snk-share-option-text').textContent = 'Kopyalandı!';
                            
                            setTimeout(() => {
                                copyBtn.classList.remove('copied');
                                copyBtn.querySelector('.snk-share-option-text').textContent = originalText;
                            }, 2000);
                        }
                    })
                    .catch(err => {
                        console.error('Panoya kopyalama hatası:', err);
                        alert('Bağlantı kopyalanamadı: ' + err);
                    });
            }}
        ];
        
        // Paylaşım paneli HTML
        const panelHTML = `
        <div class="snk-share-panel" onclick="event.stopPropagation();">
            <div class="snk-share-panel-header">
                <h3>İçeriği Paylaş</h3>
                <button class="snk-share-panel-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="snk-share-url">
                <input type="text" value="${shareUrl}" readonly>
                <button class="snk-share-url-copy">
                    <i class="far fa-copy"></i>
                </button>
            </div>
            <div class="snk-share-options">
                ${shareOptions.map(option => `
                    <div class="snk-share-option" data-option="${option.name}">
                        <div class="snk-share-option-icon">
                            <i class="${option.icon}"></i>
                        </div>
                        <div class="snk-share-option-text">${option.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
        
        // Paneli body'ye ekle
        document.body.insertAdjacentHTML('beforeend', panelHTML);
        const panel = document.querySelector('.snk-share-panel');
        
        // Hemen document click olayını devre dışı bırakalım 
        // Bunu yapmak için bir overlay ekleyeceğiz
        const overlay = document.createElement('div');
        overlay.className = 'snk-share-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: rgba(0,0,0,0.5);';
        document.body.appendChild(overlay);
        
        // Overlay'a tıklama olayı
        overlay.addEventListener('click', function() {
            panel.classList.add('closing');
            overlay.classList.add('closing');
            setTimeout(() => {
                panel.remove();
                overlay.remove();
            }, 300);
        });
        
        // Panel açıldığında tıklama olayının dışarı yayılmasını önle
        panel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Görsel efekt için sınıf ekle (animasyon için)
        setTimeout(() => {
            panel.classList.add('active');
            overlay.classList.add('active');
        }, 10);
        
        // Kapatma butonuna tıklandığında kapat
        const closeButton = panel.querySelector('.snk-share-panel-close');
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Tıklama olayının yayılmasını önle
                panel.classList.add('closing');
                overlay.classList.add('closing');
                setTimeout(() => {
                    panel.remove();
                    overlay.remove();
                }, 300);
            });
        }
        
        // URL kopyalama butonuna tıklandığında kopyala
        const urlCopyButton = panel.querySelector('.snk-share-url-copy');
        if (urlCopyButton) {
            urlCopyButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Tıklama olayının yayılmasını önle
                const input = panel.querySelector('.snk-share-url input');
                if (input) {
                    navigator.clipboard.writeText(input.value)
                        .then(() => {
                            urlCopyButton.classList.add('copied');
                            urlCopyButton.innerHTML = '<i class="fas fa-check"></i>';
                            
                            setTimeout(() => {
                                urlCopyButton.classList.remove('copied');
                                urlCopyButton.innerHTML = '<i class="far fa-copy"></i>';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Panoya kopyalama hatası:', err);
                        });
                }
            });
        }
        
        // Paylaşım seçeneklerine tıklama olayları ekle
        const options = panel.querySelectorAll('.snk-share-option');
        options.forEach((option, index) => {
            option.addEventListener('click', function(e) {
                e.stopPropagation(); // Tıklama olayının yayılmasını önle
                shareOptions[index].action();
            });
        });
    }
    
    // Mevcut kullanıcıyı al
    function getCurrentUser() {
        // Ana sisteme uygun şekilde kullanıcı bilgisini al
        // İlk olarak snk_currentUser'ı kontrol et
        let user = JSON.parse(localStorage.getItem('snk_currentUser') || '{}');
        
        // Eğer kullanıcı bulunduysa ve giriş yapmışsa
        if (user && user.isLoggedIn) {
            return user;
        }
        
        // Alternatif olarak blogUser'ı kontrol et
        user = JSON.parse(localStorage.getItem('blogUser') || '{}');
        if (user && (user.username || user.name)) {
            return user;
        }
        
        return null;
    }
    
    // İlklendirme
    function init() {
        // Modal'ı body'ye ekle
        appendModalToBody();
        
        // Butonları ayarla - sayfa tamamen yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            setupCommentButtons();
        });
        
        // Sayfa yüklendiyse ve DOMContentLoaded olayı tetiklendiyse
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setupCommentButtons();
        }
    }
    
    // Dışa açılan API
    return {
        init: init,
        openCommentModal: openModal,
        toggleLike: toggleLike,
        sharePost: sharePost
    };
})();

// Yorum sistemini otomatik başlat
SNK_CommentSystem.init();

// Sayfa yüklendiğinde yorum sistemi butonlarını tekrar ayarla
window.addEventListener('load', function() {
    // 500ms bekledikten sonra butonları tekrar ayarla (dinamik içerik için)
    setTimeout(function() {
        SNK_CommentSystem.init();
    }, 500);
});
