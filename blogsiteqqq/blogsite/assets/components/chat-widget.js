document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = document.getElementById('chatWidget');
    const chatWidgetToggle = document.getElementById('chatWidgetToggle');
    const chatWidgetConversations = document.querySelector('.chat-widget-conversations');
    const chatWidgetEmpty = document.querySelector('.chat-widget-empty');
    const chatWidgetNewMessage = document.getElementById('chatWidgetNewMessage');
    let isLoadingConversations = false;
    let updateInterval;

    // Widget'ı aç/kapa
    chatWidgetToggle.addEventListener('click', function() {
        chatWidget.classList.toggle('active');
        if (chatWidget.classList.contains('active')) {
            loadConversations();
            startUpdateInterval();
        } else {
            stopUpdateInterval();
        }
    });

    // Yeni mesaj butonu
    chatWidgetNewMessage.addEventListener('click', function() {
        window.location.href = 'messages.aspx';
    });

    // Konuşmaları yükle
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
                if (response && response.d && response.d.success) {
                    const conversations = response.d.conversations;
                    updateConversationsList(conversations);
                }
            },
            complete: function() {
                isLoadingConversations = false;
            }
        });
    }

    // Konuşmalar listesini güncelle
    function updateConversationsList(conversations) {
        if (conversations && conversations.length > 0) {
            chatWidgetConversations.innerHTML = '';
            chatWidgetEmpty.style.display = 'none';
            chatWidgetConversations.style.display = 'block';

            conversations.forEach(conversation => {
                const conversationItem = document.createElement('div');
                conversationItem.className = 'chat-widget-conversation-item';
                conversationItem.innerHTML = `
                    <div class="conversation-avatar">
                        <img src="${conversation.otherUser.profileImage}" 
                             alt="${conversation.otherUser.name}"
                             onerror="this.src='/blogsite/assets/img/default-profile.png'">
                    </div>
                    <div class="conversation-content">
                        <div class="conversation-header">
                            <h4>${conversation.otherUser.name}</h4>
                            <span>${formatTime(conversation.lastMessageTime)}</span>
                        </div>
                        <p>${conversation.lastMessage || 'Henüz mesaj yok'}</p>
                    </div>
                    ${conversation.unreadCount > 0 ? 
                        `<span class="conversation-badge">${conversation.unreadCount}</span>` : ''}
                `;

                conversationItem.addEventListener('click', () => {
                    window.location.href = `messages.aspx?conversation=${conversation.id}`;
                });

                chatWidgetConversations.appendChild(conversationItem);
            });
        } else {
            chatWidgetConversations.style.display = 'none';
            chatWidgetEmpty.style.display = 'flex';
        }
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

    // Güncelleme aralığını başlat
    function startUpdateInterval() {
        updateInterval = setInterval(loadConversations, 10000); // Her 10 saniyede bir güncelle
    }

    // Güncelleme aralığını durdur
    function stopUpdateInterval() {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    }

    // Sayfa yüklendiğinde konuşmaları yükle
    if (chatWidget.classList.contains('active')) {
        loadConversations();
        startUpdateInterval();
    }
}); 