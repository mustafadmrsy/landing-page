<%@ Page Title="Mesajlar" Language="C#" MasterPageFile="MasterPage.master" AutoEventWireup="true" CodeFile="messages.aspx.cs" Inherits="Messages" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <link rel="stylesheet" href="assets/style/messages.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div class="messages-container">
        <!-- Sol Panel - Konuşmalar -->
        <div class="conversations-panel">
            <div class="conversations-header">
                <h2>Mesajlar</h2>
                <button type="button" id="newMessageBtn" class="new-message-btn">
                    <i class="fas fa-edit"></i>
                    <span>Yeni Mesaj</span>
                </button>
            </div>
            
            <div class="conversations-search">
                <i class="fas fa-search"></i>
                <input type="text" id="conversationSearch" placeholder="Konuşmalarda ara..." />
            </div>
            
            <div class="conversations-list" id="conversationsList">
                <!-- Konuşmalar dinamik olarak buraya eklenecek -->
            </div>
        </div>
        
        <!-- Sağ Panel - Mesajlar -->
        <div class="messages-panel">
            <!-- Hoş geldin mesajı -->
            <div class="welcome-message" id="welcomeMessage">
                <div class="welcome-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h2>Mesajlarınıza Hoş Geldiniz</h2>
                <p>Bir konuşma seçin veya yeni bir mesaj başlatın</p>
                <button type="button" class="new-message-btn" onclick="document.getElementById('newMessageBtn').click()">
                    <i class="fas fa-edit"></i>
                    <span>Yeni Mesaj</span>
                </button>
            </div>
            
            <!-- Mesaj listesi -->
            <div class="messages-list" id="messagesList" style="display: none;">
                <!-- Mesajlar dinamik olarak buraya eklenecek -->
            </div>
            
            <!-- Mesaj gönderme alanı -->
            <div class="message-input-area" id="messageInputArea" style="display: none;">
                <textarea id="messageInput" placeholder="Bir mesaj yazın..." rows="1"></textarea>
                <button type="button" id="sendMessageBtn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
    
    <!-- Yeni Mesaj Modal -->
    <div class="modal" id="newMessageModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Yeni Mesaj</h3>
                <button type="button" id="closeNewMessageModal" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="search-container">
                    <i class="fas fa-search"></i>
                    <input type="text" id="userSearchInput" placeholder="Kullanıcı ara..." />
                </div>
                
                <div class="user-search-results" id="userSearchResults">
                    <!-- Arama sonuçları buraya eklenecek -->
                </div>
            </div>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="scripts" Runat="Server">
    <script src="assets/components/messages.js"></script>
</asp:Content> 