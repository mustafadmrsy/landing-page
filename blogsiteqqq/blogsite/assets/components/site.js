// Mesaj bildirimi ve chat widget fonksiyonları
function updateMessageBadge() {
    if (!document.getElementById('messageBadge')) return; // Kullanıcı giriş yapmamışsa çık
    
    $.ajax({
        type: 'POST',
        url: 'messages.aspx/GetUnreadMessageCount',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
            if (response && response.d && response.d.success) {
                const count = response.d.count;
                const messageBadge = document.getElementById('messageBadge');
                if (count > 0) {
                    messageBadge.style.display = 'flex';
                    messageBadge.textContent = count;
                } else {
                    messageBadge.style.display = 'none';
                }
            }
        }
    });
}

function loadChatWidgetConversations() {
    const chatWidgetConversations = document.querySelector('.chat-widget-conversations');
    if (!chatWidgetConversations) return; // Widget yoksa çık
    
    $.ajax({
        type: 'POST',
        url: 'messages.aspx/GetConversations',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(response) {
            if (response && response.d && response.d.success) {
                const conversations = response.d.conversations;
                const chatWidgetEmpty = document.querySelector('.chat-widget-empty');

                if (conversations && conversations.length > 0) {
                    chatWidgetConversations.style.display = 'block';
                    chatWidgetEmpty.style.display = 'none';
                    chatWidgetConversations.innerHTML = '';

                    conversations.forEach(conversation => {
                        const conversationItem = document.createElement('div');
                        conversationItem.className = 'chat-widget-conversation-item';
                        conversationItem.innerHTML = `
                            <div class="conversation-content">
                                <div class="conversation-header">
                                    <h4>${conversation.otherUser.name}</h4>
                                    <span>${formatTime(conversation.lastMessageTime)}</span>
                                </div>
                                <p>${conversation.lastMessage}</p>
                            </div>
                            ${conversation.unreadCount > 0 ? `<span class="conversation-badge">${conversation.unreadCount}</span>` : ''}
                        `;

                        conversationItem.addEventListener('click', () => {
                            window.location.href = `messages.aspx?conversation=${conversation.id}`;
                        });

                        chatWidgetConversations.appendChild(conversationItem);
                    });
                } else {
                    chatWidgetConversations.style.display = 'none';
                    chatWidgetEmpty.style.display = 'block';
                }
            }
        }
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget) { // Sadece widget varsa (kullanıcı giriş yapmışsa) çalıştır
        const chatWidgetToggle = document.getElementById('chatWidgetToggle');
        const chatWidgetNewMessage = document.getElementById('chatWidgetNewMessage');

        // Widget'ı aç/kapa
        chatWidgetToggle.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
            if (chatWidget.classList.contains('active')) {
                loadChatWidgetConversations();
            }
        });

        // Yeni mesaj butonuna tıklandığında
        chatWidgetNewMessage.addEventListener('click', () => {
            window.location.href = 'messages.aspx';
        });

        // Her 30 saniyede bir mesaj sayısını güncelle
        updateMessageBadge();
        setInterval(updateMessageBadge, 30000);

        // Her 30 saniyede bir widget konuşmalarını güncelle
        setInterval(() => {
            if (chatWidget.classList.contains('active')) {
                loadChatWidgetConversations();
            }
        }, 30000);
    }
}); 