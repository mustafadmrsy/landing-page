<%@ Page Title="Kullanıcı Profili" Language="C#" MasterPageFile="/blogsite/MasterPage.master" AutoEventWireup="true" CodeFile="userpage.aspx.cs" Inherits="UserPageForm" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <style>
        :root {
            --dark-bg: #121212;
            --card-bg: #1e1e1e;
            --accent-color: #007fff;
            --text-color: #ffffff;
            --text-secondary: #b0b0b0;
            --border-color: #333333;
        }

        /* Profil Sayfası Genel Stiller */
        .profile-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            color: var(--text-color);
        }

        /* Düzenleme butonları için kesin görünür stiller */
        #htmlEditButton {
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 999 !important;
        }
        
        .edit-button-container {
            margin: 15px 0;
            display: block !important;
            position: relative !important;
            z-index: 999 !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* Profil Başlık Alanı */
        .profile-header {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            background-color: var(--card-bg);
            padding: 30px 20px 20px 20px;
        }

        .profile-details {
            position: relative;
            padding: 20px;
            background-color: var(--card-bg);
            border-radius: 12px;
        }

        .profile-img-container {
            position: relative;
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            z-index: 2;
        }

        .profile-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 5px solid var(--dark-bg);
            object-fit: cover;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Kullanıcı bilgileri için stilleri merkeze hizala */
        .user-info-container {
            text-align: center;
            margin-bottom: 20px;
        }

        .user-details {
            margin-left: 170px;
            padding-top: 10px;
        }

        .username {
            font-size: 1rem !important;
            color: var(--accent-color) !important;
            margin-left: 5px !important;
            display: inline-block !important;
            visibility: visible !important;
        }

        .profile-name {
            font-size: 1.8rem !important;
            font-weight: 700 !important;
            margin-bottom: 5px !important;
            display: block !important;
            visibility: visible !important;
            color: #ffffff !important;
        }

        .profile-bio {
            color: var(--text-secondary) !important;
            margin-bottom: 15px !important;
            line-height: 1.5 !important;
            display: block !important;
            visibility: visible !important;
        }

        /* Profil Aksiyon Butonları */
        .profile-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .btn {
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: 600;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            font-size: 0.9rem;
        }

        .btn-primary {
            background-color: var(--accent-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: #0066cc;
        }

        .btn-outline {
            background-color: transparent;
            color: var(--accent-color);
            border: 2px solid var(--accent-color);
        }

        .btn-outline:hover {
            background-color: rgba(0, 127, 255, 0.1);
        }

        /* Kullanıcı İstatistikleri */
        .user-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
        }

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .stat-count {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-color);
        }

        .stat-label {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        /* Tab Menüsü */
        .tab-container {
            margin-top: 30px;
        }

        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 30px;
        }

        .tab {
            padding: 15px 25px;
            cursor: pointer;
            position: relative;
            font-weight: 600;
            color: var(--text-secondary);
            transition: color 0.3s ease;
        }

        .tab:hover {
            color: var(--accent-color);
        }

        .tab.active {
            color: var(--accent-color);
        }

        .tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: var(--accent-color);
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
        }

        .tab-content {
            display: none;
            animation: fadeIn 0.5s ease forwards;
        }

        .tab-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Post ve Yorum Kartları */
        .post-card, .comment-card, .like-card {
            background-color: var(--card-bg);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .post-card h3, .like-card h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1.3rem;
        }

        .post-card p, .comment-card p, .like-card p {
            color: var(--text-secondary);
            line-height: 1.5;
        }

        .post-meta, .comment-meta, .like-meta {
            display: flex;
            justify-content: space-between;
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
        }

        .comment-card {
            padding: 15px;
        }

        .comment-text {
            margin: 5px 0 10px;
        }

        .post-link {
            color: var(--accent-color);
            text-decoration: none;
        }

        .post-link:hover {
            text-decoration: underline;
        }

        /* Profil Düzenleme Modalı */
        .modal-overlay {
            display: none !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 10000 !important;
            opacity: 0;
            transition: opacity 0.3s ease;
            overflow-y: auto;
        }

        .modal-overlay.active {
            display: flex !important;
            opacity: 1;
            justify-content: center;
            align-items: flex-start;
            padding: 30px 0;
        }

        .modal-container {
            background-color: #121212;
            width: 90%;
            max-width: 650px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            transform: translateY(-20px);
            transition: transform 0.3s ease, opacity 0.3s ease;
            margin: 20px 0;
            position: relative;
            opacity: 0.8;
            border: 1px solid #1a1a1a;
        }
        
        .modern-modal {
            background: linear-gradient(145deg, #121212, #0a0a0a);
            border: 1px solid #1a1a1a;
        }

        .modal-overlay.active .modal-container {
            transform: translateY(0);
        }
        
        .modal-scroll-container {
            max-height: 60vh;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 0 5px;
            scrollbar-width: thin;
            scrollbar-color: #00a2ff #121212;
        }
        
        .modal-scroll-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .modal-scroll-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
        
        .modal-scroll-container::-webkit-scrollbar-thumb {
            background-color: #00a2ff;
            border-radius: 10px;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: linear-gradient(to right, #00a2ff, #0077cc);
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .close-modal {
            background: rgba(0, 0, 0, 0.2);
            border: none;
            width: 32px;
            height: 32px;
            font-size: 1.5rem;
            color: #ffffff;
            cursor: pointer;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .close-modal:hover {
            background: rgba(0, 0, 0, 0.4);
            transform: scale(1.1);
        }
        
        .modal-body {
            padding: 25px;
            color: #ffffff;
        }
        
        .form-group {
            margin-bottom: 24px;
            position: relative;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #ffffff;
            font-weight: 500;
            font-size: 0.95rem;
        }
        
        .form-group label i {
            margin-right: 8px;
            color: #00a2ff;
        }
        
        .modern-input {
            width: 100%;
            padding: 12px 15px;
            border-radius: 10px;
            border: 2px solid #00a2ff;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .modern-input:focus {
            outline: none;
            border-color: #00a2ff;
            box-shadow: 0 0 0 3px rgba(0, 162, 255, 0.2);
            background-color: #ffffff !important;
        }
        
        .file-upload-wrapper {
            position: relative;
            padding: 8px;
            border: 2px dashed #00a2ff;
            border-radius: 10px;
            text-align: center;
            transition: all 0.3s ease;
            background-color: #ffffff;
        }
        
        .file-upload-wrapper:hover {
            border-color: #00a2ff;
            background-color: rgba(0, 162, 255, 0.05);
        }
        
        .file-upload {
            opacity: 0.8;
            padding: 12px;
            background-color: #ffffff;
            border-radius: 8px;
            transition: all 0.3s ease;
            color: #000000;
        }
        
        .file-upload:hover {
            opacity: 1;
        }
        
        .file-upload-info {
            font-size: 0.8rem;
            color: #cccccc;
            margin-top: 8px;
            font-style: italic;
        }
        
        .section-divider {
            position: relative;
            margin: 30px 0 20px;
            text-align: center;
        }
        
        .section-divider:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(to right, 
                rgba(255, 255, 255, 0.05), 
                rgba(255, 255, 255, 0.2),
                rgba(255, 255, 255, 0.05));
            z-index: 1;
        }
        
        .section-title {
            position: relative;
            z-index: 2;
            background-color: #121212;
            padding: 0 15px;
            display: inline-block;
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0;
            color: #ffffff;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            padding: 20px 25px;
            gap: 15px;
            border-top: 1px solid #1a1a1a;
            background-color: #0c0c0c;
            border-bottom-left-radius: 16px;
            border-bottom-right-radius: 16px;
        }
        
        .save-button {
            background: linear-gradient(to right, #00a2ff, #0077cc);
            padding: 12px 30px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0, 162, 255, 0.3);
            transition: all 0.3s ease;
            border-radius: 50px;
            color: #ffffff;
            border: none;
        }
        
        .save-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 162, 255, 0.4);
        }
        
        .btn-outline {
            background-color: transparent;
            border: 1px solid #333;
            color: #ffffff;
        }
        
        .btn-outline:hover {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: #00a2ff;
        }
        
        @media (max-width: 768px) {
            .modal-overlay.active {
                align-items: flex-start;
                padding: 10px;
            }
            
            .modal-container {
                width: 95%;
                margin: 10px 0;
            }
            
            .modal-scroll-container {
                max-height: 70vh;
            }
            
            .modal-header, .modal-footer, .modal-body {
                padding: 15px;
            }
        }

        /* Uyarı Mesajları */
        .alert-info {
            background-color: rgba(0, 127, 255, 0.1);
            border: 1px solid var(--accent-color);
            color: var(--accent-color);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }

        /* Responsive Tasarım */
        @media (max-width: 768px) {
            .profile-img {
                width: 120px;
                height: 120px;
            }

            .user-details {
                margin-left: 120px;
            }

            .cover-photo {
                height: 200px;
            }

            .tabs {
                overflow-x: auto;
                white-space: nowrap;
                padding-bottom: 5px;
            }

            .tab {
                padding: 10px 15px;
            }
        }

        @media (max-width: 576px) {
            .profile-img-container {
                left: 50%;
                transform: translate(-50%, 50%);
            }

            .profile-img {
                width: 100px;
                height: 100px;
            }

            .user-details {
                margin-left: 0;
                margin-top: 60px;
                text-align: center;
            }

            .profile-actions {
                justify-content: center;
            }

            .user-stats {
                justify-content: center;
            }
        }

        .modal-opened {
            animation: modalAppear 0.4s forwards;
        }
        
        .modal-closing {
            animation: modalDisappear 0.3s forwards;
        }
        
        @keyframes modalAppear {
            0% {
                opacity: 0.8;
                transform: scale(0.95) translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        @keyframes modalDisappear {
            0% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
            100% {
                opacity: 0;
                transform: scale(0.95) translateY(20px);
            }
        }

        /* Mesajlaşma alanı için genel stil düzeltmesi */
        textarea, input[type="text"], .message-input {
            background-color: #ffffff !important; 
            color: #000000 !important;
            border: 1px solid #00a2ff !important;
        }
        
        /* Özel bir sınıf ekliyoruz mesajlaşma alanları için */
        .message-input-visible {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #00a2ff !important;
            padding: 10px !important;
            border-radius: 8px !important;
            font-size: 16px !important;
        }

        /* Success Modal için özel stil */
        #successMessageModal {
            z-index: 20000 !important;
        }

        #successMessageModal.active {
            display: flex !important;
        }

        /* Popup stillerini ekle */
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1050;
            display: none;
        }
        
        .follow-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 500px;
            background-color: #121212;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            z-index: 1051;
            overflow: hidden;
            display: none;
            border: 1px solid #1a73e8;
        }
        
        .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid #1a73e8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #181818;
        }
        
        .modal-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #ffffff;
        }
        
        .close-btn:hover {
            color: #1a73e8;
        }
        
        .modal-body {
            padding: 20px;
            max-height: 400px;
            overflow-y: auto;
            background-color: #121212;
        }
        
        .user-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .user-item {
            padding: 10px;
            border-bottom: 1px solid #333;
            transition: all 0.3s ease;
        }
        
        .user-item:last-child {
            border-bottom: none;
        }
        
        .user-item:hover {
            background-color: #1e1e1e;
        }
        
        .user-link {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: inherit;
            width: 100%;
        }
        
        .user-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
            background-color: #333;
            border: 2px solid #1a73e8;
            overflow: hidden;
        }
        
        .user-info {
            flex: 1;
        }
        
        .user-name {
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #1a73e8;
        }
        
        .user-username {
            color: #b0b0b0;
            margin: 0;
            font-size: 0.9rem;
        }
        
        .no-users {
            text-align: center;
            padding: 20px;
            color: #ffffff;
        }
        
        /* Takipçi ve takip sayılarına hover efekti ve tıklanabilir stil */
        .profile-stat {
            cursor: pointer;
        }
        
        .profile-stat:hover {
            text-decoration: underline;
        }

        /* Kullanıcı ID ve adının vurgulanması */
        .mention-text {
            color: #00a2ff;
            font-weight: 500;
        }
        
        /* Post başlığı ve silme butonu için düzenleme */
        .post-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .post-header h3 {
            margin: 0;
            flex: 1;
        }
        
        .post-actions {
            margin-left: 15px;
        }
        
        .delete-post-action {
            color: #ff3030;
            background-color: rgba(255, 0, 0, 0.1);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        
        .delete-post-action:hover {
            background-color: rgba(255, 0, 0, 0.2);
            color: #ff5050;
            transform: scale(1.1);
        }
    </style>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div class="profile-container">
        <!-- Profil Başlık Alanı -->
        <div class="profile-header">
            <div class="profile-details">
                <div class="profile-img-container">
                    <asp:Image ID="imgProfilePhoto" runat="server" CssClass="profile-img" />
                </div>
                
                <!-- TÜM PROFİL BİLGİLERİ ALANI SIFIRDAN YENİ OLUŞTURULDU -->
                <div class="user-info-container" style="text-align: center; position: relative; z-index: 100; display: block !important;">
                    <!-- BASİT GÖSTERIM BİLGİLERİ -->
                    <h1 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 5px; color: #ffffff; display: block;">
                        <asp:Label ID="lblAdSoyad" runat="server" Text="" style="color: #ffffff;"></asp:Label>
                    </h1>
                    <div style="margin-bottom: 10px; color: #007fff; font-size: 1rem; display: block;">
                        <asp:Label ID="lblKullaniciAdi" runat="server" Text="" style="color: #007fff;"></asp:Label>
                    </div>
                    <div style="margin-bottom: 15px; color: #b0b0b0; line-height: 1.5; max-width: 600px; display: block; margin: 0 auto;">
                        <asp:Label ID="lblBio" runat="server" Text="" style="color: #b0b0b0;"></asp:Label>
                    </div>
                    
                    <!-- ESKİ KONTROLLER (GİZLİ) -->
                    <div id="profile-info-container" style="display:none;">
                        <h1 id="profile-name-container" style="display:none;">
                            <span id="profile-fullname" style="display:none;"><asp:Literal ID="ltlFullName" runat="server" Visible="true"></asp:Literal></span>
                            <span id="profile-username" style="display:none;"><asp:Literal ID="ltlUsername" runat="server" Visible="true"></asp:Literal></span>
                        </h1>
                        <p id="profile-bio-container" style="display:none;">
                            <span id="profile-bio-text" style="display:none;"><asp:Literal ID="ltlBio" runat="server" Visible="true"></asp:Literal></span>
                            <asp:Literal ID="ltlFullBio" runat="server" Visible="true"></asp:Literal>
                        </p>
                    </div>
                    
                    <!-- Ana Profil düzenleme butonu - Server-side kontrol ekledim -->
                    <asp:Panel ID="pnlEditButton" runat="server" Visible="true" style="margin: 15px 0; display: block !important; position: relative; z-index: 9999; visibility: visible; text-align: center;">
                        <button type="button" id="htmlEditButton" class="btn btn-primary edit-button" onclick="openEditModal(); console.log('Profil düzenleme butonu tıklandı'); return false;">
                            <i class="fas fa-edit"></i> Profili Düzenle
                        </button>
                    </asp:Panel>
                    
                        <asp:Panel ID="pnlOwnProfile" runat="server" Visible="false">
                            <!-- Boş bırakıyorum, yedek buton kaldırıldı -->
                        </asp:Panel>
                        
                    <asp:Panel ID="pnlOtherProfile" runat="server" Visible="false" style="text-align: center;">
                            <asp:Button ID="btnFollow" runat="server" Text="Takip Et" CssClass="btn btn-primary" OnClick="btnFollow_Click" />
                        </asp:Panel>
                </div>
                
                <div class="user-stats">
                    <div class="stat-item profile-stat">
                        <span class="stat-count" id="postCountValue">
                            <asp:Literal ID="ltlPostCount" runat="server">0</asp:Literal>
                        </span>
                        <span class="stat-label">Yazılar</span>
                    </div>
                    <div class="stat-item profile-stat">
                        <span class="stat-count" id="followerCountValue">
                            <asp:Literal ID="ltlFollowerCount" runat="server">0</asp:Literal>
                        </span>
                        <span class="stat-label">Takipçiler</span>
                    </div>
                    <div class="stat-item profile-stat">
                        <span class="stat-count" id="followingCountValue">
                            <asp:Literal ID="ltlFollowingCount" runat="server">0</asp:Literal>
                        </span>
                        <span class="stat-label">Takip Edilenler</span>
                    </div>
                </div>
            </div>
        </div>
                    
        <!-- Tab Menüsü -->
        <div class="tab-container">
            <div class="tabs">
                <div class="tab active" data-tab="posts">Yazılar</div>
                <div class="tab" data-tab="comments">Yorumlar</div>
                <div class="tab" data-tab="likes">Beğeniler</div>
                <div class="tab" data-tab="about">Hakkında</div>
            </div>
                
            <!-- Yazılar Tab İçeriği -->
            <div class="tab-content active" id="posts-content">
                <asp:Panel ID="pnlNoPosts" runat="server" Visible="false">
                    <div class="alert-info">Bu kullanıcı henüz yazı paylaşmamış.</div>
                </asp:Panel>

                <asp:Repeater ID="rptPosts" runat="server">
                    <ItemTemplate>
                        <div class="post-card">
                            <div class="post-header">
                                <h3><a href='<%# "blog.aspx?id=" + Eval("PostID") %>' class="post-link"><%# Eval("Title") %></a></h3>
                                
                                <!-- Silme butonu -->
                                <asp:Panel ID="pnlDeletePost" runat="server" Visible='<%# IsPostOwner(Convert.ToInt32(Eval("PostID"))) %>' CssClass="post-actions">
                                    <asp:LinkButton ID="btnDeletePost" runat="server" CssClass="delete-post-action" 
                                        OnClientClick="return confirm('Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');"
                                        OnClick="btnDeletePost_Click" CommandArgument='<%# Eval("PostID") %>'>
                                        <i class="fas fa-trash-alt"></i>
                                    </asp:LinkButton>
                                </asp:Panel>
                            </div>
                            <p><%# Eval("Summary") %></p>
                            <div class="post-meta">
                                <span><%# Eval("Createdat", "{0:dd MMMM yyyy}") %></span>
                                <span><%# Eval("CommentCount") %> yorum · <%# Eval("ViewCount") %> görüntülenme</span>
                            </div>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
            
            <!-- Yorumlar Tab İçeriği -->
            <div class="tab-content" id="comments-content">
                <asp:Panel ID="pnlNoComments" runat="server" Visible="false">
                    <div class="alert-info">Bu kullanıcı henüz yorum yapmamış.</div>
                </asp:Panel>

                <asp:Repeater ID="rptComments" runat="server">
                    <ItemTemplate>
                        <div class="comment-card">
                            <a href='<%# "blog.aspx?id=" + Eval("PostID") %>' class="post-link"><%# Eval("PostTitle") %></a>
                            <p class="comment-text"><%# Eval("CommentText") %></p>
                            <div class="comment-meta">
                                <span><%# Eval("CommentDate", "{0:dd MMMM yyyy}") %></span>
                            </div>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
            
            <!-- Beğeniler Tab İçeriği -->
            <div class="tab-content" id="likes-content">
                <asp:Panel ID="pnlNoLikes" runat="server" Visible="false">
                    <div class="alert-info">Bu kullanıcı henüz bir yazı beğenmemiş.</div>
                </asp:Panel>
                
                <asp:Repeater ID="rptLikes" runat="server">
                    <ItemTemplate>
                        <div class="like-card">
                            <h3><a href='<%# "blog.aspx?id=" + Eval("PostID") %>' class="post-link"><%# Eval("PostTitle") %></a></h3>
                            <p><%# Eval("PostSummary") %></p>
                            <div class="like-meta">
                                <span><%# Eval("LikeDate", "{0:dd MMMM yyyy}") %> tarihinde beğenildi</span>
                            </div>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
            
            <!-- Hakkında Tab İçeriği -->
            <div class="tab-content" id="about-content">
                <div class="post-card">
                    <h3>Profil Bilgileri</h3>
                    <p><asp:Literal ID="ltlFullBioContent" runat="server" Visible="true"></asp:Literal></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Profil Düzenleme Modalı -->
    <div id="profileEditModal" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Profil Düzenle</h3>
                <button type="button" class="close-modal" onclick="closeEditModal()">×</button>
            </div>
            
            <div class="modal-scroll-container">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="txtUsername">
                            <i class="fas fa-user-tag"></i> Kullanıcı Adı
                        </label>
                        <asp:TextBox ID="txtUsername" runat="server" CssClass="form-control modern-input" placeholder="Kullanıcı adınız"></asp:TextBox>
                    </div>
                
                    <div class="form-group">
                        <label for="txtFirstName">
                            <i class="fas fa-user"></i> Ad
                        </label>
                        <asp:TextBox ID="txtFirstName" runat="server" CssClass="form-control modern-input" placeholder="Adınız"></asp:TextBox>
                    </div>
                
                    <div class="form-group">
                        <label for="txtLastName">
                            <i class="fas fa-user"></i> Soyad
                        </label>
                        <asp:TextBox ID="txtLastName" runat="server" CssClass="form-control modern-input" placeholder="Soyadınız"></asp:TextBox>
                    </div>
                
                    <div class="form-group">
                        <label for="txtBio">
                            <i class="fas fa-info-circle"></i> Biyografi
                        </label>
                        <asp:TextBox ID="txtBio" runat="server" CssClass="form-control modern-input" TextMode="MultiLine" Rows="4" placeholder="Kendiniz hakkında kısa bir bilgi..."></asp:TextBox>
                    </div>
                
                    <div class="form-group upload-group">
                        <label for="fileProfilePhoto">
                            <i class="fas fa-portrait"></i> Profil Fotoğrafı
                        </label>
                        <div class="file-upload-wrapper">
                            <asp:FileUpload ID="fileProfilePhoto" runat="server" CssClass="form-control file-upload" />
                            <div class="file-upload-info">PNG, JPG veya GIF formatında bir resim yükleyin</div>
                        </div>
                    </div>
                
                    <div class="section-divider">
                        <h4 class="section-title"><i class="fas fa-lock"></i> Şifre Değiştir</h4>
                    </div>
                
                    <div class="form-group">
                        <label for="txtCurrentPassword">
                            <i class="fas fa-key"></i> Mevcut Şifre
                        </label>
                        <asp:TextBox ID="txtCurrentPassword" runat="server" CssClass="form-control modern-input" TextMode="Password" placeholder="Mevcut şifreniz"></asp:TextBox>
                    </div>
                
                    <div class="form-group">
                        <label for="txtNewPassword">
                            <i class="fas fa-key"></i> Yeni Şifre
                        </label>
                        <asp:TextBox ID="txtNewPassword" runat="server" CssClass="form-control modern-input" TextMode="Password" placeholder="Yeni şifreniz"></asp:TextBox>
                    </div>
                
                    <div class="form-group">
                        <label for="txtConfirmPassword">
                            <i class="fas fa-check-circle"></i> Şifre Tekrarı
                        </label>
                        <asp:TextBox ID="txtConfirmPassword" runat="server" CssClass="form-control modern-input" TextMode="Password" placeholder="Yeni şifrenizi tekrar girin"></asp:TextBox>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="closeEditModal()">
                    <i class="fas fa-times"></i> İptal
                </button>
                <asp:Button ID="btnSaveProfile" runat="server" Text="Kaydet" CssClass="btn btn-primary save-button" OnClick="btnSaveProfile_Click" UseSubmitBehavior="true" OnClientClick="console.log('Profil kaydet butonu tıklandı'); return true;" />
            </div>
        </div>
    </div>
    
    <!-- Font Awesome için CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <!-- jQuery kütüphanesini ekle - AJAX çağrıları için gerekli -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- Hata Mesajı Bildirimi -->
    <div id="errorMessageModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 500px; background-color: #111; border: 2px solid #ff3e3e;">
            <div class="modal-header" style="border-bottom: 1px solid #ff3e3e;">
                <h3><i class="fas fa-exclamation-triangle" style="color: #ff3e3e;"></i> Hata Bildirimi</h3>
                <button type="button" class="close-modal" onclick="closeErrorModal()">×</button>
            </div>
            <div class="modal-body" style="text-align: center; padding: 30px 20px;">
                <p id="errorMessageText" style="font-size: 18px; margin-bottom: 20px;"></p>
                <div style="margin-top: 20px;">
                    <button type="button" class="btn btn-danger" onclick="closeErrorModal()" 
                    style="background-color: #ff3e3e; color: white; border: none; padding: 10px 20px; border-radius: 5px;">
                        <i class="fas fa-check"></i> Tamam
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Başarı Mesajı Bildirimi (Basitleştirilmiş) -->
    <div id="successAlert" style="display: none; position: fixed; top: 20px; right: 20px; max-width: 400px; background-color: #004c8c; color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 20000;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <strong><i class="fas fa-check-circle"></i> Başarılı</strong>
            <button onclick="hideSuccessAlert()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
        </div>
        <p id="successAlertText"></p>
    </div>
    
    <!-- Takipçiler Modalı -->
    <div id="followersModalBackdrop" class="modal-backdrop"></div>
    <div id="followersModal" class="follow-modal">
        <div class="modal-header">
            <h5 class="modal-title">Takipçiler</h5>
            <button type="button" class="close-btn" onclick="closeFollowersModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div id="followersLoading" style="text-align: center; padding: 20px; color: #1a73e8;">
                <div class="spinner-border" style="color: #1a73e8;" role="status">
                    <span class="sr-only">Yükleniyor...</span>
                </div>
            </div>
            <ul id="followersList" class="user-list"></ul>
            <div id="noFollowers" class="no-users" style="display: none;">
                Henüz takipçi yok.
            </div>
        </div>
    </div>

    <!-- Takip Edilenler Modalı -->
    <div id="followingModalBackdrop" class="modal-backdrop"></div>
    <div id="followingModal" class="follow-modal">
        <div class="modal-header">
            <h5 class="modal-title">Takip Edilenler</h5>
            <button type="button" class="close-btn" onclick="closeFollowingModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div id="followingLoading" style="text-align: center; padding: 20px; color: #1a73e8;">
                <div class="spinner-border" style="color: #1a73e8;" role="status">
                    <span class="sr-only">Yükleniyor...</span>
                </div>
            </div>
            <ul id="followingList" class="user-list"></ul>
            <div id="noFollowing" class="no-users" style="display: none;">
                Henüz takip edilen kullanıcı yok.
            </div>
        </div>
    </div>
    
    <script type="text/javascript">
        // Profil bilgilerini direkt olarak güncelle - serverdan bağımsız
        function updateProfileDisplay(firstName, lastName, username, bio) {
            try {
                console.log('Profil bilgileri manuel olarak güncelleniyor:', {
                    firstName, lastName, username, bio
                });
                
                // Ad Soyad
                var fullName = (firstName + ' ' + lastName).trim();
                
                // Ana profil bilgilerini güncelle
                var nameDisplays = document.querySelectorAll('.profile-name, #lblAdSoyad, #profile-fullname');
                nameDisplays.forEach(function(el) {
                    if (el) el.innerText = fullName;
                });
                
                // Kullanıcı adı
                var usernameDisplays = document.querySelectorAll('.username, #lblKullaniciAdi, #profile-username');
                usernameDisplays.forEach(function(el) {
                    if (el) el.innerText = '@' + username;
                });
                
                // Bio
                var bioDisplays = document.querySelectorAll('.profile-bio, #lblBio, #profile-bio-text');
                bioDisplays.forEach(function(el) {
                    if (el) el.innerText = bio;
                });
                
                console.log('Profil bilgileri manuel olarak güncellendi');
                
                // Bir süre sonra başarı mesajını göster
                setTimeout(function() {
                    showSuccessMessage('Profil bilgileriniz başarıyla güncellendi');
                }, 300);
            } catch(err) {
                console.error('Profil bilgilerini manuel güncellerken hata:', err);
            }
        }
        
        // Sayfa tamamen yüklendiğinde çalışacak
        document.addEventListener('DOMContentLoaded', function() {
            // Kullanıcı istatistikleri
            setupFollowersClick();
            
            // Tab değiştirme
            setupTabSwitching();
            
            // Düzenleme butonu kontrolü
            configureEditButton();
            
            // LocalStorage'dan kullanıcı bilgilerini yükle 
            loadUserInfoFromLocalStorage();
            
            // Eğer sayfa profil güncellemesinden sonra yüklendiyse başarı mesajı göster
            if (window.location.href.indexOf('profileUpdated=true') > -1) {
                showSuccessMessage('Profil bilgileriniz başarıyla güncellendi.');
                console.log('Profil güncellemesi tespit edildi, bilgiler güncellendi');
                
                // 2 saniye sonra sayfa parametrelerini temizle (URL'deki profileUpdated parametresini kaldır)
                setTimeout(function() {
                    var currentUrl = window.location.href;
                    var cleanUrl = currentUrl.replace(/[&?]profileUpdated=true/, '');
                    // URL'i değiştir ama sayfayı yenileme
                    window.history.replaceState({}, document.title, cleanUrl);
                    console.log('URL temizlendi');
                }, 2000);
            }
            
            // Kontrol amaçlı log
            console.log('Profil Bilgileri Yüklendi');
        });
        
        // Takipçi ve takip edilenler kısımlarına tıklama işlevini ekle
        function setupFollowersClick() {
            // Takipçi sayısına tıklama
            var followerElement = document.querySelector('.stat-item:nth-child(2)');
            if (followerElement) {
                followerElement.addEventListener('click', function() {
                    showFollowers();
                    console.log('Takipçiler butonuna tıklandı');
                });
            }
            
            // Takip edilen sayısına tıklama
            var followingElement = document.querySelector('.stat-item:nth-child(3)');
            if (followingElement) {
                followingElement.addEventListener('click', function() {
                    showFollowing();
                    console.log('Takip edilenler butonuna tıklandı');
                });
            }
        }
        
        // LocalStorage'dan kullanıcı bilgilerini yükle ve arayüzü güncelle
        function loadUserInfoFromLocalStorage() {
            try {
                // localStorage'dan bilgileri al
                var userId = localStorage.getItem('user_id');
                var username = localStorage.getItem('username');
                var firstName = localStorage.getItem('first_name');
                var lastName = localStorage.getItem('last_name');
                var fullName = localStorage.getItem('full_name');
                var bio = localStorage.getItem('bio');
                
                console.log('LocalStorage kontrol ediliyor:', {
                    userId, username, firstName, lastName, fullName, bio
                });
                
                // Eğer localStorage'da bilgi varsa ve sayfadaki form boşsa, form alanlarını doldur
                var formFirstName = document.getElementById('<%= txtFirstName.ClientID %>');
                var formLastName = document.getElementById('<%= txtLastName.ClientID %>');
                var formUsername = document.getElementById('<%= txtUsername.ClientID %>');
                var formBio = document.getElementById('<%= txtBio.ClientID %>');
                
                if (userId && formFirstName && formLastName && formUsername && formBio) {
                    // Form alanları boşsa localStorage'dan doldur
                    if (formFirstName.value === '' && firstName) {
                        formFirstName.value = firstName;
                }
                
                    if (formLastName.value === '' && lastName) {
                        formLastName.value = lastName;
                    }
                    
                    if (formUsername.value === '' && username) {
                        formUsername.value = username;
                }
                
                    if (formBio.value === '' && bio) {
                        formBio.value = bio;
                    }
                    
                    console.log('Form alanları localStorage\'dan dolduruldu');
                }
                
                // Arayüz görünümünü güncelle - form dışındaki alanları
                var nameDisplay = document.getElementById('lblAdSoyad');
                var usernameDisplay = document.getElementById('lblKullaniciAdi');
                var bioDisplay = document.getElementById('lblBio');
                
                // Görünüm alanları boşsa localStorage'dan doldur
                if (nameDisplay && nameDisplay.innerText === '' && fullName) {
                    nameDisplay.innerText = fullName;
                }
                
                if (usernameDisplay && usernameDisplay.innerText === '' && username) {
                    usernameDisplay.innerText = '@' + username;
                }
                
                if (bioDisplay && bioDisplay.innerText === '' && bio) {
                    bioDisplay.innerText = bio;
                }
                
                console.log('Görünüm alanları localStorage\'dan güncellendi');
            } catch(err) {
                console.error('localStorage\'dan kullanıcı bilgilerini yükleme hatası:', err);
            }
        }
        
        // Profil düzenleme butonunu yapılandır - sunucu tarafı değişkenler kullanılarak
        function configureEditButton() {
            var currentUserID = '<%= CurrentUserID %>';
            var viewedUserID = '<%= ViewedUserID %>';
            var editButton = document.getElementById('htmlEditButton');
            var editPanel = document.querySelector('[id$="pnlEditButton"]');
            
            console.log('Profil kontrolü (Client):', {
                'CurrentUserID': currentUserID,
                'ViewedUserID': viewedUserID,
                'Aynı mı': currentUserID === viewedUserID
            });
            
            if (!editButton) {
                console.error('Düzenleme butonu bulunamadı!');
                return;
            }
            
            // Kesin eşitlik kontrolü yap ve aynı ID değilse kesinlikle gizle
            if (currentUserID && viewedUserID && currentUserID === viewedUserID) {
                // Kendi profili - butonu göster
                if (editPanel) {
                    editPanel.style.display = 'block';
                    editPanel.style.visibility = 'visible';
                }
                
                // Buton stilini güncelle
                editButton.removeAttribute('style'); // Önceki stilleri temizle
                editButton.style.display = 'inline-block';
                editButton.style.visibility = 'visible';
                editButton.style.opacity = '1';
                editButton.style.zIndex = '9999';
                console.log('CLIENT: Kendi profili - Düzenleme butonu gösterildi');
            } else {
                // Başkasının profili - kesinlikle gizle
                if (editPanel) {
                    editPanel.style.display = 'none';
                    editPanel.style.visibility = 'hidden';
                }
                
                // Buton stilini güncelle
                editButton.style.display = 'none';
                editButton.style.visibility = 'hidden';
                editButton.style.opacity = '0';
                console.log('CLIENT: Başkasının profili - Düzenleme butonu gizlendi');
            }
        }
        
        // Tab değiştirme işlevini yapılandır
        function setupTabSwitching() {
            const tabs = document.querySelectorAll('.tab');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Tüm tabları pasif hale getir
                    document.querySelectorAll('.tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    
                    // Tüm içerikleri gizle
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // Tıklanan tabı aktif yap
                    this.classList.add('active');
                    
                    // İlgili içeriği göster
                    const tabId = this.getAttribute('data-tab');
                    const contentElement = document.getElementById(tabId + '-content');
                    if (contentElement) {
                        contentElement.classList.add('active');
                    }
                });
            });
        }
        
        // Profil düzenleme modalını aç
        function openEditModal() {
            var modal = document.getElementById('profileEditModal');
            if (modal) {
                // Önce eski durumları temizle
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
                
                // Kısa bir bekleme sonrası modalı göster (önceki işlemler tamamlansın)
                setTimeout(function() {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                    console.log('Profil düzenleme modalı açıldı');
                }, 50);
            } else {
                console.error('profileEditModal elementi bulunamadı!');
            }
        }
        
        // Profil düzenleme modalını kapat
        function closeEditModal() {
            var modal = document.getElementById('profileEditModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                console.log('Profil düzenleme modalı kapatıldı');
                
                // Değişikliklerin görünmesi için sayfadaki gösterimleri güncelle
                setTimeout(updateDisplays, 100);
            } else {
                console.error('profileEditModal elementi bulunamadı!');
            }
        }
        
        // Sayfa üzerindeki görüntü alanlarını güncelle
        function updateDisplays() {
            try {
                console.log('Ekrandaki bilgiler güncelleniyor...');
                
                // Hız aşımını önlemek için kısa bir bekleme
                setTimeout(function() {
                    // Ctrl+F5 benzeri bir refresh efekti oluştur
                    var currentTop = window.scrollY;
                    window.scrollTo(0, currentTop + 1);
                    setTimeout(function() {
                        window.scrollTo(0, currentTop);
                    }, 10);
                }, 50);
            } catch(err) {
                console.error('updateDisplays hatası:', err);
            }
        }
        
        // Hata mesajı göster (eskisi ile uyumlu)
        function showErrorMessage(message) {
            var modal = document.getElementById('errorMessageModal');
            var messageElement = document.getElementById('errorMessageText');
            
            if (modal && messageElement) {
                messageElement.innerText = message;
                modal.classList.add('active');
                
                // Modal görünür hale getir
                var container = modal.querySelector('.modal-container');
                if (container) container.classList.add('modal-opened');
            } else {
                alert(message);
            }
        }
        
        // Hata mesajı modalını kapat
        function closeErrorModal() {
            var modal = document.getElementById('errorMessageModal');
            if (modal) {
                var container = modal.querySelector('.modal-container');
                if (container) container.classList.remove('modal-opened');
                
                setTimeout(function() {
                    modal.classList.remove('active');
                }, 500);
            }
        }
        
        // Başarı mesajını göster (basitleştirilmiş)
        function showSuccessMessage(message) {
            var alert = document.getElementById('successAlert');
            var messageText = document.getElementById('successAlertText');
            
            if (alert && messageText) {
                messageText.innerText = message;
                alert.style.display = 'block';
                
                // 5 saniye sonra otomatik olarak gizle
                setTimeout(function() {
                    hideSuccessAlert();
                }, 5000);
            } else {
                // Eğer uyarı elementi bulunamazsa normal alert kullan
                alert(message);
            }
        }
        
        // Başarı mesajını gizle
        function hideSuccessAlert() {
            var alert = document.getElementById('successAlert');
            if (alert) {
                alert.style.display = 'none';
            }
        }

        // Takipçileri göster
        function showFollowers() {
            console.log('Takipçiler modalını açma işlemi başladı');
            
            // Modal elementleri
            var backdrop = document.getElementById('followersModalBackdrop');
            var modal = document.getElementById('followersModal');
            var loading = document.getElementById('followersLoading');
            var list = document.getElementById('followersList');
            var noFollowers = document.getElementById('noFollowers');
            
            // Modal elementlerini görünür yap
            backdrop.style.display = 'block';
            modal.style.display = 'block';
            loading.style.display = 'block';
            list.innerHTML = '';
            noFollowers.style.display = 'none';
            
            console.log('Modal elementleri görünür yapıldı, AJAX isteği başlatılıyor');
            
            // AJAX ile takipçileri getir
            $.ajax({
                type: "POST",
                url: "userpage.aspx/GetFollowers",
                data: JSON.stringify({ userID: '<%= ViewedUserID %>' }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    console.log('AJAX başarılı, cevap alındı:', response);
                    loading.style.display = 'none';
                    
                    if (response.d && response.d.length > 0) {
                        console.log(response.d.length + ' takipçi bulundu');
                        var html = '';
                        for (var i = 0; i < response.d.length; i++) {
                            var user = response.d[i];
                            html += '<li class="user-item">';
                            // Profil bağlantısı ekle
                            html += '<a href="userpage.aspx?id=' + user.UserID + '" class="user-link">';
                            // Profil fotoğrafı 
                            html += '<div class="user-avatar" style="background-image: url(\'' + user.ProfilePicture + '\'); background-size: cover; background-position: center;"></div>';
                            html += '<div class="user-info">';
                            html += '<p class="user-name">' + user.Username + '</p>';
                            html += '<p class="user-username">@' + user.Username + '</p>';
                            html += '</div>';
                            html += '</a>';
                            html += '</li>';
                        }
                        
                        list.innerHTML = html;
                    } else {
                        console.log('Takipçi bulunamadı');
                        noFollowers.style.display = 'block';
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Takipçileri getirme hatası:");
                    console.error("Status: " + status);
                    console.error("Error: " + error);
                    console.error("Response: " + xhr.responseText);
                    
                    loading.style.display = 'none';
                    noFollowers.style.display = 'block';
                    noFollowers.innerText = 'Takipçiler yüklenirken bir hata oluştu: ' + error;
                }
            });
        }
        
        // Takip edilenleri göster
        function showFollowing() {
            console.log('Takip edilenler modalını açma işlemi başladı');
            
            // Modal elementleri
            var backdrop = document.getElementById('followingModalBackdrop');
            var modal = document.getElementById('followingModal');
            var loading = document.getElementById('followingLoading');
            var list = document.getElementById('followingList');
            var noFollowing = document.getElementById('noFollowing');
            
            // Modal elementlerini görünür yap
            backdrop.style.display = 'block';
            modal.style.display = 'block';
            loading.style.display = 'block';
            list.innerHTML = '';
            noFollowing.style.display = 'none';
            
            console.log('Modal elementleri görünür yapıldı, AJAX isteği başlatılıyor');
            
            // AJAX ile takip edilenleri getir
            $.ajax({
                type: "POST",
                url: "userpage.aspx/GetFollowing",
                data: JSON.stringify({ userID: '<%= ViewedUserID %>' }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    console.log('AJAX başarılı, cevap alındı:', response);
                    loading.style.display = 'none';
                    
                    if (response.d && response.d.length > 0) {
                        console.log(response.d.length + ' takip edilen kişi bulundu');
                        var html = '';
                        for (var i = 0; i < response.d.length; i++) {
                            var user = response.d[i];
                            html += '<li class="user-item">';
                            // Profil bağlantısı ekle
                            html += '<a href="userpage.aspx?id=' + user.UserID + '" class="user-link">';
                            // Profil fotoğrafı 
                            html += '<div class="user-avatar" style="background-image: url(\'' + user.ProfilePicture + '\'); background-size: cover; background-position: center;"></div>';
                            html += '<div class="user-info">';
                            html += '<p class="user-name">' + user.Username + '</p>';
                            html += '<p class="user-username">@' + user.Username + '</p>';
                            html += '</div>';
                            html += '</a>';
                            html += '</li>';
                        }
                        
                        list.innerHTML = html;
                    } else {
                        console.log('Takip edilen kişi bulunamadı');
                        noFollowing.style.display = 'block';
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Takip edilenleri getirme hatası:");
                    console.error("Status: " + status);
                    console.error("Error: " + error);
                    console.error("Response: " + xhr.responseText);
                    
                    loading.style.display = 'none';
                    noFollowing.style.display = 'block';
                    noFollowing.innerText = 'Takip edilenler yüklenirken bir hata oluştu: ' + error;
                }
            });
        }
        
        // Takipçiler modalını kapat
        function closeFollowersModal() {
            document.getElementById('followersModalBackdrop').style.display = 'none';
            document.getElementById('followersModal').style.display = 'none';
        }
        
        // Takip edilenler modalını kapat
        function closeFollowingModal() {
            document.getElementById('followingModalBackdrop').style.display = 'none';
            document.getElementById('followingModal').style.display = 'none';
        }
        
        // Modal arka planına tıklandığında kapat
        document.getElementById('followersModalBackdrop').addEventListener('click', closeFollowersModal);
        document.getElementById('followingModalBackdrop').addEventListener('click', closeFollowingModal);

        // Post silme için onay fonksiyonu
        function confirmDelete(button) {
            if (confirm("Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
                return true;
            }
            return false;
        }
    </script>
</asp:Content> 