document.addEventListener('DOMContentLoaded', function() {
    // DOM Elementleri
    const newMessageBtn = document.getElementById('newMessageBtn');
    const newMessageModal = document.getElementById('newMessageModal');
    const closeNewMessageModal = document.getElementById('closeNewMessageModal');
    const userSearchInput = document.getElementById('userSearchInput');
    const userSearchResults = document.getElementById('userSearchResults');
    const conversationSearch = document.getElementById('conversationSearch');
    const conversationsList = document.getElementById('conversationsList');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messagesList = document.getElementById('messagesList');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const chatHeader = document.getElementById('chatHeader');
    const messageInputArea = document.getElementById('messageInputArea');
    
    let currentConversationId = null;
    let isLoadingMessages = false;
    let isLoadingConversations = false;
    let messageUpdateInterval = null;
    
    // Konuşmaları yükleme
    function loadConversations() {
        if (isLoadingConversations) return;
        isLoadingConversations = true;
        
        $.ajax({
            type: 'POST',
            url: 'messages.aspx/GetConversations',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({}),
            success: function(response) {
                if (response && response.d) {
                    const data = response.d;
                    if (data.success) {
                        conversationsList.innerHTML = '';
                        if (data.conversations && data.conversations.length > 0) {
                            data.conversations.forEach(conversation => {
                                const conversationItem = document.createElement('div');
                                conversationItem.className = 'conversation-item';
                                if (conversation.id === currentConversationId) {
                                    conversationItem.classList.add('active');
                                }
                                
                                conversationItem.innerHTML = `
                                    <div class="conversation-avatar">
                                        <img src="${conversation.otherUser.profileImage}" 
                                             alt="${conversation.otherUser.name}"
                                             onerror="this.src='/blogsite/assets/img/default-profile.png'; this.onerror=null;">
                                    </div>
                                    <div class="conversation-content">
                                        <div class="conversation-header">
                                            <h4 class="conversation-name">${conversation.otherUser.name}</h4>
                                            <span class="conversation-time">${formatTime(conversation.lastMessageTime)}</span>
                                        </div>
                                        <p class="conversation-preview">${conversation.lastMessage || 'Henüz mesaj yok'}</p>
                                    </div>
                                    ${conversation.unreadCount > 0 ? `<span class="conversation-badge">${conversation.unreadCount}</span>` : ''}
                                `;
                                
                                conversationItem.addEventListener('click', () => {
                                    document.querySelectorAll('.conversation-item').forEach(item => {
                                        item.classList.remove('active');
                                    });
                                    conversationItem.classList.add('active');
                                    loadConversation(conversation.id);
                                });
                                
                                conversationsList.appendChild(conversationItem);
                            });
                        } else {
                            conversationsList.innerHTML = '<div class="no-conversations">Henüz hiç konuşmanız yok</div>';
                        }
                    } else if (data.message) {
                        console.error('Konuşma yükleme hatası:', data.message);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Konuşmaları yükleme hatası:', error);
            },
            complete: function() {
                isLoadingConversations = false;
            }
        });
    }
    
    // Yeni mesaj modalını aç/kapa
    newMessageBtn.addEventListener('click', () => {
        newMessageModal.classList.add('active');
    });
    
    closeNewMessageModal.addEventListener('click', () => {
        newMessageModal.classList.remove('active');
        userSearchInput.value = '';
        userSearchResults.innerHTML = '';
    });
    
    // Modal dışına tıklandığında kapat
    newMessageModal.addEventListener('click', (e) => {
        if (e.target === newMessageModal) {
            newMessageModal.classList.remove('active');
            userSearchInput.value = '';
            userSearchResults.innerHTML = '';
        }
    });
    
    // Kullanıcı arama
    let searchTimeout;
    userSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.trim();
        
        if (searchTerm.length < 2) {
            userSearchResults.innerHTML = '';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchUsers(searchTerm);
        }, 300);
    });
    
    // Konuşma arama
    conversationSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.trim().toLowerCase();
        
        searchTimeout = setTimeout(() => {
            const conversations = conversationsList.querySelectorAll('.conversation-item');
            conversations.forEach(conversation => {
                const name = conversation.querySelector('.conversation-name').textContent.toLowerCase();
                const preview = conversation.querySelector('.conversation-preview').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || preview.includes(searchTerm)) {
                    conversation.style.display = 'flex';
                } else {
                    conversation.style.display = 'none';
                }
            });
        }, 300);
    });
    
    // Mesaj input alanı için otomatik yükseklik ayarı
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        const newHeight = Math.min(this.scrollHeight, 150); // maksimum 150px
        this.style.height = newHeight + 'px';
    });

    // Enter tuşu ile mesaj gönderme
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Mesaj gönderme animasyonu
    sendMessageBtn.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.add('sending');
        setTimeout(() => this.classList.remove('sending'), 1000);
        sendMessage();
    });
    
    // Kullanıcı arama fonksiyonu
    function searchUsers(searchTerm) {
        $.ajax({
            type: 'POST',
            url: 'messages.aspx/SearchUsers',
            data: JSON.stringify({ q: searchTerm }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(response) {
                if (response && response.d) {
                    const data = response.d;
                    if (data.success) {
                        userSearchResults.innerHTML = '';
                        if (data.users && data.users.length > 0) {
                            data.users.forEach(user => {
                                const userItem = document.createElement('div');
                                userItem.className = 'user-search-item';
                                userItem.innerHTML = `
                                    <div class="user-search-avatar">
                                        <img src="${user.profileImage}" 
                                             alt="${user.name}"
                                             onerror="this.src='/blogsite/assets/img/default-profile.png'; this.onerror=null;">
                                    </div>
                                    <div class="user-search-info">
                                        <h4 class="user-search-name">${user.name}</h4>
                                    </div>
                                `;
                                
                                userItem.addEventListener('click', () => {
                                    startNewConversation(user.id);
                                });
                                
                                userSearchResults.appendChild(userItem);
                            });
                        } else {
                            userSearchResults.innerHTML = '<div class="no-results">Kullanıcı bulunamadı</div>';
                        }
                    } else if (data.message) {
                        console.error('Kullanıcı arama hatası:', data.message);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Kullanıcı arama hatası:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
            }
        });
    }
    
    // Yeni konuşma başlatma
    function startNewConversation(userId) {
        $.ajax({
            type: 'POST',
            url: 'messages.aspx/StartConversation',
            data: JSON.stringify({ userId: userId }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(response) {
                if (response && response.d) {
                    const data = response.d;
                    if (data.success) {
                        newMessageModal.classList.remove('active');
                        loadConversation(data.conversationId);
                        loadConversations();
                    } else if (data.message) {
                        console.error('Konuşma başlatma hatası:', data.message);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Konuşma başlatma hatası:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
            }
        });
    }
    
    // Konuşma yükleme
    function loadConversation(conversationId) {
        if (isLoadingMessages) return;
        isLoadingMessages = true;
        
        // Önceki güncelleme aralığını temizle
        if (messageUpdateInterval) {
            clearInterval(messageUpdateInterval);
        }

        currentConversationId = conversationId;
        
        $.ajax({
            type: 'POST',
            url: 'messages.aspx/GetMessages',
            data: JSON.stringify({ conversationId: conversationId }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(response) {
                if (response && response.d) {
                    const data = response.d;
                    if (data.success) {
                        // Mesajları göster
                        welcomeMessage.style.display = 'none';
                        messagesList.style.display = 'flex';
                        messageInputArea.style.display = 'block';
                        messagesList.innerHTML = '';
                        
                        if (data.messages && data.messages.length > 0) {
                            data.messages.forEach(message => {
                                const messageElement = document.createElement('div');
                                messageElement.className = `message ${message.isMine ? 'sent' : 'received'}`;
                                messageElement.innerHTML = `
                                    <div class="message-content">
                                        <div class="message-sender">${message.senderName}</div>
                                        <div class="message-text">${message.content}</div>
                                        <div class="message-footer">
                                            <span class="message-time">${formatTime(message.createdAt)}</span>
                                            ${message.isMine ? `
                                            <button class="delete-message" data-message-id="${message.id}">
                                                <i class="fas fa-trash"></i>
                                            </button>` : ''}
                                        </div>
                                    </div>
                                `;

                                // Silme butonuna event listener ekle
                                if (message.isMine) {
                                    const deleteBtn = messageElement.querySelector('.delete-message');
                                    deleteBtn.addEventListener('click', function(e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deleteMessage(message.id, messageElement);
                                    });
                                }

                                messagesList.appendChild(messageElement);
                            });
                        } else {
                            messagesList.innerHTML = '<div class="no-messages">Henüz mesaj yok</div>';
                        }
                        
                        // Mesaj listesini en alta kaydır
                        messagesList.scrollTop = messagesList.scrollHeight;
                        
                        // Yeni mesajlar için güncelleme aralığı başlat
                        messageUpdateInterval = setInterval(() => {
                            if (currentConversationId === conversationId) {
                                loadNewMessages(conversationId);
                            }
                        }, 3000);
                    } else if (data.message) {
                        console.error('Konuşma yükleme hatası:', data.message);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Konuşma yükleme hatası:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
            },
            complete: function() {
                isLoadingMessages = false;
            }
        });
    }
    
    // Yeni mesajları yükle
    function loadNewMessages(conversationId) {
        $.ajax({
            type: 'POST',
            url: 'messages.aspx/GetMessages',
            data: JSON.stringify({ conversationId: conversationId }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(response) {
                if (response && response.d && response.d.success) {
                    const data = response.d;
                    const currentMessages = messagesList.children.length;
                    if (data.messages && data.messages.length > currentMessages) {
                        // Yeni mesajlar var
                        for (let i = currentMessages; i < data.messages.length; i++) {
                            const message = data.messages[i];
                            const messageElement = document.createElement('div');
                            messageElement.className = `message ${message.isMine ? 'sent' : 'received'}`;
                            messageElement.innerHTML = `
                                <div class="message-content">
                                    <div class="message-sender">${message.isMine ? 'Sen' : message.senderName}</div>
                                    <div class="message-text">${message.content}</div>
                                    <div class="message-footer">
                                        <span class="message-time">${formatTime(message.createdAt)}</span>
                                        ${message.isMine ? `
                                        <button class="delete-message" data-message-id="${message.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>` : ''}
                                    </div>
                                </div>
                            `;

                            // Silme butonuna event listener ekle
                            if (message.isMine) {
                                const deleteBtn = messageElement.querySelector('.delete-message');
                                deleteBtn.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteMessage(message.id, messageElement);
                                });
                            }

                            messagesList.appendChild(messageElement);
                        }
                        messagesList.scrollTop = messagesList.scrollHeight;
                        loadConversations();
                    }
                }
            }
        });
    }
    
    // Mesaj gönderme
    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content || !currentConversationId) return;
        
        $.ajax({
            type: 'POST',
            url: 'messages.aspx/SendMessage',
            data: JSON.stringify({
                conversationId: currentConversationId,
                content: content
            }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(response) {
                if (response && response.d && response.d.success) {
                    // Input'u temizle
                    messageInput.value = '';
                    messageInput.style.height = 'auto';
                    
                    // Yeni mesajı ekle
                    const messageElement = document.createElement('div');
                    messageElement.className = 'message sent';
                    messageElement.innerHTML = `
                        <div class="message-content">
                            <div class="message-sender">Sen</div>
                            <div class="message-text">${content}</div>
                            <div class="message-footer">
                                <span class="message-time">${formatTime(new Date())}</span>
                            </div>
                        </div>
                    `;
                    messagesList.appendChild(messageElement);
                    
                    // Scroll'u en alta getir
                    messagesList.scrollTop = messagesList.scrollHeight;
                    
                    // Konuşma listesini güncelle
                    loadConversations();
                }
            },
            error: function(error) {
                console.error('Mesaj gönderme hatası:', error);
            }
        });
    }
    
    // Mesaj ekleme
    function appendMessage(message) {
        const messageElement = createMessageElement(message);
        messagesList.appendChild(messageElement);
    }
    
    // Zaman formatı
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Dün';
        } else if (days < 7) {
            return date.toLocaleDateString('tr-TR', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
        }
    }
    
    // Mesaj bildirimi sayısını güncelleme
    function updateMessageBadge() {
        fetch('get-unread-message-count.aspx')
            .then(response => response.json())
            .then(data => {
                const messageBadge = document.getElementById('messageBadge');
                if (data.count > 0) {
                    messageBadge.style.display = 'flex';
                    messageBadge.textContent = data.count;
                } else {
                    messageBadge.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Bildirim sayısı güncelleme hatası:', error);
            });
    }
    
    // Mesaj silme fonksiyonu
    function deleteMessage(messageId, messageElement) {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        
        $.ajax({
            type: 'POST',
            url: 'messages.aspx/DeleteMessage',
            data: JSON.stringify({ messageId: messageId }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(response) {
                if (response && response.d && response.d.success) {
                    // Mesajı animasyonlu bir şekilde kaldır
                    messageElement.style.opacity = '0';
                    messageElement.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        messageElement.remove();
                    }, 300);
                    
                    // Konuşma listesini güncelle
                    loadConversations();
                } else {
                    alert('Mesaj silinirken bir hata oluştu: ' + (response.d ? response.d.message : 'Bilinmeyen hata'));
                }
            },
            error: function(xhr, status, error) {
                console.error('Mesaj silme hatası:', {xhr, status, error});
                alert('Mesaj silinirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        });
    }
    
    // Sayfa yüklendiğinde konuşmaları yükle
    loadConversations();

    // Her 30 saniyede bir konuşma listesini güncelle
    setInterval(loadConversations, 30000);
});

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.isMine ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-sender">${message.senderName}</div>
            <div class="message-text">${message.content}</div>
            <div class="message-footer">
                <span class="message-time">${formatTime(message.createdAt)}</span>
                ${message.isMine ? `
                <button class="delete-message" data-message-id="${message.id}">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </div>
        </div>
    `;
    return messageDiv;
} 