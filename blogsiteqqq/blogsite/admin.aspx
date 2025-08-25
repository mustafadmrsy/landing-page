<%@ Page Title="Admin Paneli" Language="C#" MasterPageFile="MasterPage.master" AutoEventWireup="true" CodeFile="admin.aspx.cs" Inherits="AdminPanel" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
    <link rel="stylesheet" href="assets/style/admin-panel.css?v=1.0" />
    <!-- <link rel="stylesheet" href="assets/style/admin.css?v=1.0" /> -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <!-- Arama motorlarının indexlememesi için meta etiketleri -->
    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">
    <script>
        // Göz butonuna tıklandığında çalışacak fonksiyon - doğrudan tanımla
        window.showPostDetail = function(postId) {
            if (!postId) return;
            
            // AJAX ile yazı detaylarını getir
            $.ajax({
                type: "POST",
                url: "admin.aspx/GetPostDetails",
                data: JSON.stringify({ postId: parseInt(postId) }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    if (response && response.d) {
                        var post = response.d;
                        
                        // Modal içeriğini doldur
                        document.getElementById('postTitle').textContent = post.Title;
                        document.getElementById('postCategory').textContent = post.CategoryName;
                        document.getElementById('postAuthor').textContent = post.Username;
                        document.getElementById('postDate').textContent = formatDate(post.CreatedAt);
                        
                        // Durum badge'i
                        const statusBadge = document.getElementById('postStatus');
                        statusBadge.textContent = getStatusText(post.ApprovalStatus);
                        statusBadge.className = 'status-badge ' + getStatusClass(post.ApprovalStatus);
                        
                        // İçerik
                        document.getElementById('postContent').innerHTML = post.Content;
                        
                        // Etiketler
                        const tagsElement = document.getElementById('postTags');
                        tagsElement.innerHTML = '';
                        
                        if (post.Tags && post.Tags.length > 0) {
                            const tagsArray = post.Tags.split(',');
                            tagsArray.forEach(tag => {
                                const tagSpan = document.createElement('span');
                                tagSpan.className = 'tag';
                                tagSpan.textContent = tag.trim();
                                tagsElement.appendChild(tagSpan);
                            });
                        } else {
                            tagsElement.textContent = 'Etiket bulunmuyor';
                        }
                        
                        // Post ID'sini gizli input'a kaydet
                        document.getElementById('hdnCurrentPostId').value = post.PostID;
                        
                        // Durum butonlarını göster/gizle
                        const approveBtn = document.getElementById('approvePostBtn');
                        const rejectBtn = document.getElementById('rejectPostBtn');
                        
                        if (post.ApprovalStatus === 0) { // Onay bekliyor
                            approveBtn.style.display = 'inline-block';
                            rejectBtn.style.display = 'inline-block';
                        } else if (post.ApprovalStatus === 1) { // Onaylandı
                            approveBtn.style.display = 'none';
                            rejectBtn.style.display = 'inline-block';
                        } else if (post.ApprovalStatus === 2) { // Reddedildi
                            approveBtn.style.display = 'inline-block';
                            rejectBtn.style.display = 'none';
                        }
                        
                        // Modalı göster
                        document.getElementById('postDetailModal').style.display = 'block';
                    } else {
                        alert('Blog yazısı bilgileri alınamadı.');
                    }
                },
                error: function(error) {
                    console.error('AJAX Error:', error);
                    alert('Blog yazısı bilgileri alınırken bir hata oluştu. Detay: ' + error.statusText);
                }
            });
        };
        
        function getStatusText(status) {
            switch (status) {
                case 0: return 'Onay Bekliyor';
                case 1: return 'Onaylandı';
                case 2: return 'Reddedildi';
                default: return 'Bilinmiyor';
            }
        }
        
        function getStatusClass(status) {
            switch (status) {
                case 0: return 'status-pending';
                case 1: return 'status-approved';
                case 2: return 'status-rejected';
                default: return '';
            }
        }
        
        function formatDate(dateString) {
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                return dateString;
            }
            
            return date.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        window.updatePostStatus = function(postId, status) {
            if (!postId) return;
            
            $.ajax({
                type: "POST",
                url: "admin.aspx/UpdatePostStatus",
                data: JSON.stringify({ postId: postId, status: status }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    if (response && response.d) {
                        // Modalı kapat
                        document.getElementById('postDetailModal').style.display = 'none';
                        
                        // Sayfayı yenile
                        location.reload();
                    } else {
                        alert('İşlem başarısız. Lütfen tekrar deneyin.');
                    }
                },
                error: function(error) {
                    console.error('AJAX Error:', error);
                    alert('Durum güncellenirken bir hata oluştu: ' + error.statusText);
                }
            });
        };
    </script>
    <style>
        /* Mevcut stiller */
        /* ... */
        
        /* Yorum Yönetimi Stilleri */
        .comments-section {
            margin-bottom: 40px;
        }
        
        .comments-section h3 {
            font-size: 1.2rem;
            margin-bottom: 20px;
            color: #555;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        
        .admin-comments {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .admin-comment-item {
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
        }
        
        .comment-content {
            flex: 1;
        }
        
        .comment-header {
            margin-bottom: 10px;
        }
        
        .comment-author {
            font-weight: bold;
            color: #444;
            margin-right: 15px;
        }
        
        .comment-date {
            color: #888;
            font-size: 0.85rem;
            margin-right: 15px;
        }
        
        .comment-post {
            color: #666;
            font-size: 0.9rem;
        }
        
        .comment-post a {
            color: #4e73df;
            text-decoration: none;
        }
        
        .comment-post a:hover {
            text-decoration: underline;
        }
        
        .comment-text {
            color: #333;
            line-height: 1.5;
        }
        
        .comment-actions {
            display: flex;
            gap: 10px;
            align-items: flex-start;
        }
        
        .btn-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #f5f5f5;
            color: #555;
            text-decoration: none;
            transition: all 0.2s ease;
        }
        
        .btn-approve {
            background-color: #e8f5e9;
            color: #43a047;
        }
        
        .btn-approve:hover {
            background-color: #43a047;
            color: white;
        }
        
        .btn-delete {
            background-color: #ffebee;
            color: #e53935;
        }
        
        .btn-delete:hover {
            background-color: #e53935;
            color: white;
        }
        
        .no-data-message {
            background-color: #f8f9fa;
            border: 1px dashed #dee2e6;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            color: #6c757d;
        }
        
        .no-data-message i {
            font-size: 2rem;
            margin-bottom: 15px;
            color: #adb5bd;
        }
        
        /* Yeni Modern Kullanıcı Kartları Stilleri */
        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .user-card {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .user-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        
        .user-card-header {
            background: linear-gradient(135deg, #4e73df 0%, #36b9cc 100%);
            color: white;
            padding: 15px;
            position: relative;
        }
        
        .user-card-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            border: 3px solid white;
            font-size: 24px;
            color: #555;
            margin-top: -30px;
            position: relative;
            z-index: 1;
            overflow: hidden;
        }
        
        .user-card-avatar i {
            font-size: 30px;
        }
        
        .user-admin-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: rgba(255,255,255,0.2);
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .user-card-body {
            padding: 20px 15px;
            text-align: center;
        }
        
        .user-card-name {
            font-size: 1.2rem;
            font-weight: bold;
            margin: 10px 0 5px;
        }
        
        .user-card-email {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 10px;
            word-break: break-all;
        }
        
        .user-card-date {
            color: #999;
            font-size: 0.8rem;
            margin-bottom: 15px;
        }
        
        .user-card-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .user-card-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 12px;
            border-radius: 6px;
            color: white;
            text-decoration: none;
            transition: all 0.2s ease;
            font-size: 0.9rem;
        }
        
        .btn-view-posts {
            background-color: #4e73df;
        }
        
        .btn-view-posts:hover {
            background-color: #2e59d9;
        }
        
        .btn-toggle-admin {
            background-color: #36b9cc;
        }
        
        .btn-toggle-admin:hover {
            background-color: #2c9faf;
        }
        
        .btn-remove-admin {
            background-color: #f6c23e;
        }
        
        .btn-remove-admin:hover {
            background-color: #e0a800;
        }
        
        .btn-delete-user {
            background-color: #e74a3b;
        }
        
        .btn-delete-user:hover {
            background-color: #d52a1a;
        }
        
        .user-card-btn i {
            margin-right: 5px;
        }
        
        .section-title {
            color: #4e73df;
            border-left: 4px solid #4e73df;
            padding-left: 10px;
            margin-bottom: 20px;
        }
        
        .filter-controls {
            background-color: #f8f9fc;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .search-box {
            display: flex;
            gap: 10px;
            flex: 1;
            min-width: 250px;
        }
        
        .form-control {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d3e2;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .btn-primary {
            background-color: #4e73df;
            border: none;
            color: white;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .btn-primary:hover {
            background-color: #2e59d9;
        }
    </style>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
    <div class="admin-container">
        <!-- Admin Giriş Paneli -->
        <asp:Panel ID="pnlAdminLogin" runat="server" CssClass="admin-login-panel" DefaultButton="btnAdminLogin">
            <div class="admin-login-box">
                <h2 class="admin-title">Admin Paneli</h2>
                <p class="admin-subtitle">Lütfen admin bilgilerinizle giriş yapın</p>
                
                <div class="form-group">
                    <label for="txtAdminUsername">Kullanıcı Adı</label>
                    <asp:TextBox ID="txtAdminUsername" runat="server" CssClass="form-control" placeholder="Admin kullanıcı adı"></asp:TextBox>
                    <asp:RequiredFieldValidator ID="rfvUsername" runat="server" ControlToValidate="txtAdminUsername"
                        ErrorMessage="Kullanıcı adı gerekli" CssClass="text-danger" Display="Dynamic" ValidationGroup="adminLogin"></asp:RequiredFieldValidator>
                </div>
                
                <div class="form-group">
                    <label for="txtAdminPassword">Şifre</label>
                    <asp:TextBox ID="txtAdminPassword" runat="server" CssClass="form-control" TextMode="Password" placeholder="Şifre"></asp:TextBox>
                    <asp:RequiredFieldValidator ID="rfvPassword" runat="server" ControlToValidate="txtAdminPassword"
                        ErrorMessage="Şifre gerekli" CssClass="text-danger" Display="Dynamic" ValidationGroup="adminLogin"></asp:RequiredFieldValidator>
        </div>
        
                <div class="form-actions">
                    <asp:Button ID="btnAdminLogin" runat="server" Text="Giriş Yap" CssClass="btn btn-primary" OnClick="btnAdminLogin_Click" ValidationGroup="adminLogin" />
                </div>
                
                <asp:Label ID="lblLoginError" runat="server" CssClass="error-message" Visible="false"></asp:Label>
                    </div>
        </asp:Panel>
        
        <!-- Admin Panel Ana İçerik - Login başarılıysa gösterilecek -->
        <asp:Panel ID="pnlAdminContent" runat="server" Visible="false">
            <div class="admin-header">
                <h1 class="admin-panel-title">SNK Blog Admin Paneli</h1>
                <div class="admin-user-info">
                    <span>Hoş geldiniz, <asp:Literal ID="ltlAdminName" runat="server"></asp:Literal></span>
                    <asp:Button ID="btnAdminLogout" runat="server" Text="Çıkış Yap" CssClass="btn btn-sm btn-danger" OnClick="btnAdminLogout_Click" />
                </div>
            </div>
            
            <div class="admin-tabs">
                <div class="tab active" data-tab="pendingPosts">Onay Bekleyen Yazılar</div>
                <div class="tab" data-tab="approvedPostsTab">Onaylanmış Yazılar</div>
                <div class="tab" data-tab="rejectedPostsTab">Reddedilmiş Yazılar</div>
                <div class="tab" data-tab="comments">Yorumlar</div>
                <div class="tab" data-tab="users">Kullanıcılar</div>
            </div>
            
            <div class="admin-content">
                <!-- Onay Bekleyen Yazılar -->
                <div id="pendingPosts" class="tab-content active">
                    <h2 class="section-title">Onay Bekleyen Yazılar</h2>
                    
                    <div class="filter-controls">
                        <div class="search-box">
                            <asp:TextBox ID="txtPendingSearch" runat="server" CssClass="form-control" placeholder="Blog yazısı ara..."></asp:TextBox>
                            <asp:Button ID="btnPendingSearch" runat="server" Text="Ara" CssClass="btn btn-sm btn-primary" OnClick="btnPendingSearch_Click" />
                        </div>
                        <div class="filter-box">
                            <asp:DropDownList ID="ddlPendingCategory" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlPendingCategory_SelectedIndexChanged">
                                <asp:ListItem Text="Tüm Kategoriler" Value=""></asp:ListItem>
                            </asp:DropDownList>
                </div>
                    </div>
                    
                    <asp:Repeater ID="rptPendingPosts" runat="server" OnItemCommand="rptPendingPosts_ItemCommand">
                        <HeaderTemplate>
                            <div class="blog-posts-table">
                                <div class="table-header">
                                    <div class="col-id">ID</div>
                                    <div class="col-title">Başlık</div>
                                    <div class="col-author">Yazar</div>
                                    <div class="col-category">Kategori</div>
                                    <div class="col-date">Tarih</div>
                                    <div class="col-actions">İşlemler</div>
                                </div>
                        </HeaderTemplate>
                        <ItemTemplate>
                            <div class="table-row">
                                <div class="col-id"><%# Eval("PostID") %></div>
                                <div class="col-title">
                                    <a href="javascript:void(0);" class="post-title-link" data-post-id='<%# Eval("PostID") %>'>
                                        <%# Eval("Title") %>
                                    </a>
                                </div>
                                <div class="col-author"><%# Eval("Username") %></div>
                                <div class="col-category"><%# Eval("CategoryName") %></div>
                                <div class="col-date"><%# Eval("CreatedAt", "{0:dd.MM.yyyy}") %></div>
                                <div class="col-actions">
                                    <asp:LinkButton ID="btnViewPost" runat="server" CssClass="btn-action btn-view" 
                                        CommandName="ViewPost" CommandArgument='<%# Eval("PostID") %>' 
                                        ToolTip="Görüntüle"><i class="fas fa-eye"></i></asp:LinkButton>
                                    
                                    <asp:LinkButton ID="btnApprovePost" runat="server" CssClass="btn-action btn-approve" 
                                        CommandName="ApprovePost" CommandArgument='<%# Eval("PostID") %>' 
                                        OnClientClick="return confirm('Bu yazıyı onaylamak istediğinize emin misiniz?');"
                                        ToolTip="Onayla"><i class="fas fa-check"></i></asp:LinkButton>
                                    
                                    <asp:LinkButton ID="btnRejectPost" runat="server" CssClass="btn-action btn-reject" 
                                        CommandName="RejectPost" CommandArgument='<%# Eval("PostID") %>' 
                                        OnClientClick="return confirm('Bu yazıyı reddetmek istediğinize emin misiniz?');"
                                        ToolTip="Reddet"><i class="fas fa-times"></i></asp:LinkButton>
                </div>
            </div>
                        </ItemTemplate>
                        <FooterTemplate>
                            </div>
                        </FooterTemplate>
                    </asp:Repeater>
                    
                    <asp:Panel ID="pnlNoPendingPosts" runat="server" CssClass="no-data-message" Visible="false">
                        <i class="fas fa-info-circle"></i>
                        <p>Onay bekleyen blog yazısı bulunmamaktadır.</p>
                    </asp:Panel>
                </div>
                
                <!-- Yorumlar -->
                <div id="comments" class="tab-content">
                    <h2 class="section-title">Yorum Yönetimi</h2>
                    
                    <!-- Onay Bekleyen Yorumlar -->
                    <div class="comments-section">
                        <h3>Onay Bekleyen Yorumlar</h3>
                        <asp:Repeater ID="rptPendingComments" runat="server" OnItemCommand="rptComments_ItemCommand">
                            <HeaderTemplate>
                                <div class="admin-comments">
                            </HeaderTemplate>
                            <ItemTemplate>
                                <div class="admin-comment-item">
                                    <div class="comment-content">
                                        <div class="comment-header">
                                            <span class="comment-author"><%# Eval("Username") %></span>
                                            <span class="comment-date"><%# Eval("CreatedAt", "{0:dd.MM.yyyy HH:mm}") %></span>
                                            <span class="comment-post">Blog: <a href="blog.aspx?id=<%# Eval("PostID") %>" target="_blank"><%# Eval("PostTitle") %></a></span>
                                        </div>
                                        <div class="comment-text"><%# Eval("CommentText") %></div>
                                    </div>
                                    <div class="comment-actions">
                                        <asp:LinkButton ID="btnApproveComment" runat="server" CssClass="btn-action btn-approve" 
                                            CommandName="ApproveComment" CommandArgument='<%# Eval("CommentID") %>' 
                                            ToolTip="Onayla"><i class="fas fa-check"></i></asp:LinkButton>
                                        
                                        <asp:LinkButton ID="btnDeleteComment" runat="server" CssClass="btn-action btn-delete" 
                                            CommandName="DeleteComment" CommandArgument='<%# Eval("CommentID") %>'
                                            OnClientClick="return confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?');"
                                            ToolTip="Sil"><i class="fas fa-trash"></i></asp:LinkButton>
                                    </div>
                                </div>
                            </ItemTemplate>
                            <FooterTemplate>
                                </div>
                            </FooterTemplate>
                        </asp:Repeater>
                        
                        <asp:Panel ID="pnlNoPendingComments" runat="server" CssClass="no-data-message" Visible="false">
                            <i class="fas fa-info-circle"></i>
                            <p>Onay bekleyen yorum bulunmamaktadır.</p>
                        </asp:Panel>
                    </div>
                    
                    <!-- Onaylanmış Yorumlar -->
                    <div class="comments-section">
                        <h3>Onaylanmış Yorumlar</h3>
                        <asp:Repeater ID="rptApprovedComments" runat="server" OnItemCommand="rptComments_ItemCommand">
                            <HeaderTemplate>
                                <div class="admin-comments">
                            </HeaderTemplate>
                            <ItemTemplate>
                                <div class="admin-comment-item">
                                    <div class="comment-content">
                                        <div class="comment-header">
                                            <span class="comment-author"><%# Eval("Username") %></span>
                                            <span class="comment-date"><%# Eval("CreatedAt", "{0:dd.MM.yyyy HH:mm}") %></span>
                                            <span class="comment-post">Blog: <a href="blog.aspx?id=<%# Eval("PostID") %>" target="_blank"><%# Eval("PostTitle") %></a></span>
                                        </div>
                                        <div class="comment-text"><%# Eval("CommentText") %></div>
                                    </div>
                                    <div class="comment-actions">
                                        <asp:LinkButton ID="btnDeleteComment" runat="server" CssClass="btn-action btn-delete" 
                                            CommandName="DeleteComment" CommandArgument='<%# Eval("CommentID") %>'
                                            OnClientClick="return confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?');"
                                            ToolTip="Sil"><i class="fas fa-trash"></i></asp:LinkButton>
                                    </div>
                                </div>
                            </ItemTemplate>
                            <FooterTemplate>
                                </div>
                            </FooterTemplate>
                        </asp:Repeater>
                        
                        <asp:Panel ID="pnlNoApprovedComments" runat="server" CssClass="no-data-message" Visible="false">
                            <i class="fas fa-info-circle"></i>
                            <p>Onaylanmış yorum bulunmamaktadır.</p>
                        </asp:Panel>
                    </div>
                </div>
                
                <!-- Onaylanmış Yazılar -->
                <div class="tab-content" id="approvedPostsTab">
                    <h2 class="section-title">Onaylanmış Blog Yazıları</h2>
                    
                    <div class="filter-controls">
                        <div class="search-box">
                            <asp:TextBox ID="txtApprovedSearch" runat="server" CssClass="form-control" placeholder="Blog yazısı ara..."></asp:TextBox>
                            <asp:Button ID="btnApprovedSearch" runat="server" Text="Ara" CssClass="btn btn-sm btn-primary" OnClick="btnApprovedSearch_Click" />
                        </div>
                        <div class="filter-box">
                            <asp:DropDownList ID="ddlApprovedCategory" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlApprovedCategory_SelectedIndexChanged">
                                <asp:ListItem Text="Tüm Kategoriler" Value=""></asp:ListItem>
                            </asp:DropDownList>
                        </div>
                    </div>
                    
                    <asp:Repeater ID="rptApprovedPosts" runat="server" OnItemCommand="rptApprovedPosts_ItemCommand">
                        <HeaderTemplate>
                            <div class="blog-posts-table">
                                <div class="table-header">
                                    <div class="col-id">ID</div>
                                    <div class="col-title">Başlık</div>
                                    <div class="col-author">Yazar</div>
                                    <div class="col-category">Kategori</div>
                                    <div class="col-date">Tarih</div>
                                    <div class="col-actions">İşlemler</div>
                                </div>
                        </HeaderTemplate>
                        <ItemTemplate>
                            <div class="table-row">
                                <div class="col-id"><%# Eval("PostID") %></div>
                                <div class="col-title">
                                    <a href="blog.aspx?id=<%# Eval("PostID") %>" class="post-title-link">
                                        <%# Eval("Title") %>
                                    </a>
                                </div>
                                <div class="col-author"><%# Eval("Username") %></div>
                                <div class="col-category"><%# Eval("CategoryName") %></div>
                                <div class="col-date"><%# Eval("CreatedAt", "{0:dd.MM.yyyy}") %></div>
                                <div class="col-actions">
                                    <a href="blog.aspx?id=<%# Eval("PostID") %>" class="btn-action btn-view" title="Görüntüle">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    
                                    <asp:LinkButton ID="btnUnapprovePost" runat="server" CssClass="btn-action btn-reject" 
                                        CommandName="UnapprovePost" CommandArgument='<%# Eval("PostID") %>' 
                                        OnClientClick="return confirm('Bu yazının onayını kaldırmak istediğinize emin misiniz?');"
                                        ToolTip="Onayı Kaldır"><i class="fas fa-ban"></i></asp:LinkButton>
                                        
                                    <asp:LinkButton ID="btnDeleteApprovedPost" runat="server" CssClass="btn-action btn-delete" 
                                        CommandName="DeletePost" CommandArgument='<%# Eval("PostID") %>' 
                                        OnClientClick="return confirm('Bu yazıyı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz!');"
                                        ToolTip="Tamamen Sil"><i class="fas fa-trash"></i></asp:LinkButton>
                </div>
            </div>
                        </ItemTemplate>
                        <FooterTemplate>
                            </div>
                        </FooterTemplate>
                    </asp:Repeater>
                    
                    <asp:Panel ID="pnlNoApprovedPosts" runat="server" CssClass="no-data-message" Visible="false">
                        <i class="fas fa-info-circle"></i>
                        <p>Onaylanmış blog yazısı bulunmamaktadır.</p>
                    </asp:Panel>
                </div>
                
                <!-- Reddedilmiş Yazılar -->
                <div class="tab-content" id="rejectedPostsTab">
                    <h2 class="section-title">Reddedilmiş Blog Yazıları</h2>
                    
                    <div class="filter-controls">
                        <div class="search-box">
                            <asp:TextBox ID="txtRejectedSearch" runat="server" CssClass="form-control" placeholder="Blog yazısı ara..."></asp:TextBox>
                            <asp:Button ID="btnRejectedSearch" runat="server" Text="Ara" CssClass="btn btn-sm btn-primary" OnClick="btnRejectedSearch_Click" />
                        </div>
                        <div class="filter-box">
                            <asp:DropDownList ID="ddlRejectedCategory" runat="server" CssClass="form-control" AutoPostBack="true" OnSelectedIndexChanged="ddlRejectedCategory_SelectedIndexChanged">
                                <asp:ListItem Text="Tüm Kategoriler" Value=""></asp:ListItem>
                            </asp:DropDownList>
                        </div>
                    </div>
                    
                    <asp:Repeater ID="rptRejectedPosts" runat="server" OnItemCommand="rptRejectedPosts_ItemCommand">
                        <HeaderTemplate>
                            <div class="blog-posts-table">
                                <div class="table-header">
                                    <div class="col-id">ID</div>
                                    <div class="col-title">Başlık</div>
                                    <div class="col-author">Yazar</div>
                                    <div class="col-category">Kategori</div>
                                    <div class="col-date">Tarih</div>
                                    <div class="col-actions">İşlemler</div>
                                </div>
                        </HeaderTemplate>
                        <ItemTemplate>
                            <div class="table-row">
                                <div class="col-id"><%# Eval("PostID") %></div>
                                <div class="col-title">
                                    <a href="javascript:void(0);" class="post-title-link" data-post-id='<%# Eval("PostID") %>'>
                                        <%# Eval("Title") %>
                                    </a>
                                </div>
                                <div class="col-author"><%# Eval("Username") %></div>
                                <div class="col-category"><%# Eval("CategoryName") %></div>
                                <div class="col-date"><%# Eval("CreatedAt", "{0:dd.MM.yyyy}") %></div>
                                <div class="col-actions">
                                    <asp:LinkButton ID="btnViewPost" runat="server" CssClass="btn-action btn-view" 
                                        CommandName="ViewPost" CommandArgument='<%# Eval("PostID") %>' 
                                        ToolTip="Görüntüle"><i class="fas fa-eye"></i></asp:LinkButton>
                                    
                                    <asp:LinkButton ID="btnApproveRejectedPost" runat="server" CssClass="btn-action btn-approve" 
                                        CommandName="ApprovePost" CommandArgument='<%# Eval("PostID") %>' 
                                        OnClientClick="return confirm('Bu yazıyı onaylamak istediğinize emin misiniz?');"
                                        ToolTip="Onayla"><i class="fas fa-check"></i></asp:LinkButton>
                                    
                                    <asp:LinkButton ID="btnDeleteRejectedPost" runat="server" CssClass="btn-action btn-delete" 
                                        CommandName="DeletePost" CommandArgument='<%# Eval("PostID") %>' 
                                        OnClientClick="return confirm('Bu yazıyı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz!');"
                                        ToolTip="Tamamen Sil"><i class="fas fa-trash"></i></asp:LinkButton>
                                </div>
                            </div>
                        </ItemTemplate>
                        <FooterTemplate>
                            </div>
                        </FooterTemplate>
                    </asp:Repeater>
                    
                    <asp:Panel ID="pnlNoRejectedPosts" runat="server" CssClass="no-data-message" Visible="false">
                        <i class="fas fa-info-circle"></i>
                        <p>Reddedilmiş blog yazısı bulunmamaktadır.</p>
                    </asp:Panel>
                </div>
                
                <!-- Kullanıcılar -->
                <div id="users" class="tab-content">
                    <h2 class="section-title">Kullanıcı Yönetimi</h2>
                    
                    <div class="filter-controls">
                        <div class="search-box">
                            <asp:TextBox ID="txtUserSearch" runat="server" CssClass="form-control" placeholder="Kullanıcı ara..."></asp:TextBox>
                            <asp:Button ID="btnUserSearch" runat="server" Text="Ara" CssClass="btn btn-sm btn-primary" OnClick="btnUserSearch_Click" />
        </div>
    </div>
    
                    <asp:Repeater ID="rptUsers" runat="server" OnItemCommand="rptUsers_ItemCommand">
                        <HeaderTemplate>
                            <div class="users-grid">
                        </HeaderTemplate>
                        <ItemTemplate>
                            <div class="user-card">
                                <div class="user-card-header">
                                    <div class="user-card-avatar">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div class="user-admin-badge">
                                        <%# Convert.ToBoolean(Eval("IsAdmin")) ? "Admin" : "Kullanıcı" %>
                                    </div>
                                </div>
                                <div class="user-card-body">
                                    <h3 class="user-card-name"><%# Eval("Username") %></h3>
                                    <p class="user-card-email"><%# Eval("Email") %></p>
                                    <p class="user-card-date"><%# Eval("RegisterDate", "{0:dd.MM.yyyy}") %></p>
                                    <div class="user-card-actions">
                                        <asp:LinkButton ID="btnViewUserPosts" runat="server" CssClass="user-card-btn btn-view-posts" 
                                            CommandName="ViewUserPosts" CommandArgument='<%# Eval("UserID") %>' 
                                            ToolTip="Yazılarını Gör">
                                            <i class="fas fa-file-alt"></i> Yazıları Gör
                                        </asp:LinkButton>
                                        
                                        <asp:LinkButton ID="btnToggleAdmin" runat="server" CssClass='<%# Convert.ToBoolean(Eval("IsAdmin")) ? "user-card-btn btn-remove-admin" : "user-card-btn btn-toggle-admin" %>' 
                                            CommandName="ToggleAdmin" CommandArgument='<%# Eval("UserID") %>' 
                                            OnClientClick="return confirm('Bu kullanıcının admin durumunu değiştirmek istediğinize emin misiniz?');"
                                            ToolTip='<%# Convert.ToBoolean(Eval("IsAdmin")) ? "Admin Yetkisini Kaldır" : "Admin Yap" %>'>
                                            <i class='<%# Convert.ToBoolean(Eval("IsAdmin")) ? "fas fa-user-minus" : "fas fa-user-shield" %>'></i>
                                            <%# Convert.ToBoolean(Eval("IsAdmin")) ? "Yetkiyi Kaldır" : "Admin Yap" %>
                                        </asp:LinkButton>
                                        
                                        <asp:LinkButton ID="btnDeleteUser" runat="server" CssClass="user-card-btn btn-delete-user" 
                                            CommandName="DeleteUser" CommandArgument='<%# Eval("UserID") %>' 
                                            OnClientClick="return confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');">
                                            <i class="fas fa-trash"></i> Sil
                                        </asp:LinkButton>
                                    </div>
                                </div>
                            </div>
                        </ItemTemplate>
                        <FooterTemplate>
    </div>
                        </FooterTemplate>
                    </asp:Repeater>
                    
                    <asp:Panel ID="pnlNoUsers" runat="server" CssClass="no-data-message" Visible="false">
                        <i class="fas fa-info-circle"></i>
                        <p>Hiç kullanıcı bulunmamaktadır.</p>
                    </asp:Panel>
                </div>
            </div>
        </asp:Panel>
        
        <!-- Blog Yazısı Detay Modal -->
        <div id="postDetailModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="postTitle"></h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="post-info">
                        <p><strong>Kategori:</strong> <span id="postCategory"></span></p>
                        <p><strong>Yazar:</strong> <span id="postAuthor"></span></p>
                        <p><strong>Tarih:</strong> <span id="postDate"></span></p>
                        <p><strong>Durum:</strong> <span id="postStatus" class="status-badge"></span></p>
            </div>
                    <div class="post-content-container">
                        <h3>İçerik</h3>
                        <div id="postContent" class="post-content"></div>
        </div>
                    <div class="post-tags">
                        <h3>Etiketler</h3>
                        <div id="postTags"></div>
    </div>
                    <div class="post-actions">
                        <button id="approvePostBtn" class="btn btn-success">Onayla</button>
                        <button id="rejectPostBtn" class="btn btn-danger">Reddet</button>
                        <button id="closeModalBtn" class="btn btn-secondary">Kapat</button>
    </div>
            </div>
            </div>
        </div>
        
        <asp:HiddenField ID="hdnCurrentPostId" runat="server" />
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="scripts" runat="Server">
    <!-- <script src="assets/components/admin-panel.js?v=1.0"></script> -->
    <script>
        // DOM yüklendikten sonra çalışacak kodlar
        document.addEventListener('DOMContentLoaded', function() {
            // Tab fonksiyonalitesini ekle
            const tabs = document.querySelectorAll('.admin-tabs .tab');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Önceki aktif tab'ı kaldır
                    document.querySelectorAll('.admin-tabs .tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    
                    // Tüm içerikleri gizle
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // Tıklanan tab'ı aktifleştir
                    this.classList.add('active');
                    
                    // İlgili içeriği göster
                    const tabId = this.getAttribute('data-tab');
                    const content = document.getElementById(tabId);
                    if (content) {
                        content.classList.add('active');
                    }
                });
            });
            
            // Modal kapatma düğmeleri
            const modal = document.getElementById('postDetailModal');
            const closeButton = document.querySelector('.close-modal');
            const closeModalBtn = document.getElementById('closeModalBtn');
            
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            }
            
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            }
            
            // Modal dışına tıklandığında kapat
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            // Onay ve red butonları
            const approveBtn = document.getElementById('approvePostBtn');
            const rejectBtn = document.getElementById('rejectPostBtn');
            
            if (approveBtn) {
                approveBtn.addEventListener('click', function() {
                    const postId = document.getElementById('hdnCurrentPostId').value;
                    if (postId) {
                        if (confirm('Bu yazıyı onaylamak istediğinize emin misiniz?')) {
                            updatePostStatus(postId, 1); // 1 = Onaylı
                        }
                    }
                });
            }
            
            if (rejectBtn) {
                rejectBtn.addEventListener('click', function() {
                    const postId = document.getElementById('hdnCurrentPostId').value;
                    if (postId) {
                        if (confirm('Bu yazıyı reddetmek istediğinize emin misiniz?')) {
                            updatePostStatus(postId, 2); // 2 = Reddedildi
                        }
                    }
                });
            }
            
            // Başlığa tıklama olaylarını ekle
            const postTitleLinks = document.querySelectorAll('.post-title-link');
            postTitleLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const postId = this.getAttribute('data-post-id');
                    if (postId) {
                        redirectToPostDetail(postId);
                    }
                });
            });
            
            // Göz ikonlarına tıklama olaylarını ekle - doğrudan blog sayfasına yönlendir
            document.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Butonun bulunduğu satırdan post ID'yi bul
                    const container = this.closest('.table-row');
                    if (container) {
                        const idColumn = container.querySelector('.col-id');
                        if (idColumn) {
                            const postId = idColumn.textContent.trim();
                            if (postId) {
                                redirectToPostDetail(postId);
                                return false;
                            }
                        }
                    }
                    
                    return false;
                });
            });
            
            // Kullanıcı silme butonları için olay dinleyici ekle
            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', function(e) {
                    // Eğer bu bir ASP.NET LinkButton ise ve href değeri javascript:__doPostBack(...) şeklinde ise
                    if (this.getAttribute('href') && this.getAttribute('href').indexOf('__doPostBack') > -1) {
                        // Normal işleme devam et
                        return true;
                    }
                    
                    console.log('Silme butonuna tıklandı');
                    // Eğer onclick ile confirm zaten tanımlanmışsa, işlemi engellemek için bir şey yapmaya gerek yok
                });
            });
        });
        
        // Göz butonuna tıklandığında yazının detay sayfasına yönlendir
        function redirectToPostDetail(postId) {
            if (!postId) return;
            
            // Blog detay sayfasına yönlendir
            window.location.href = 'blog.aspx?id=' + postId;
        }
        
        // Manuel olarak __doPostBack fonksiyonunu çağırmak için yardımcı fonksiyon
        function manualPostBack(targetControl, argument) {
            if (typeof(__doPostBack) == 'function') {
                __doPostBack(targetControl, argument);
                return false;
            }
            return true;
        }
        
        // Kullanıcı silme işlemi
        function handleDeleteUser(userId) {
            if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
                // İşlemi başlat
                if (typeof(__doPostBack) == 'function') {
                    __doPostBack('ctl00$ContentPlaceHolder1$rptUsers$ctl' + userId + '$btnDeleteUser', '');
                    return false;
                }
            }
            return false;
        }
    </script>
</asp:Content> 