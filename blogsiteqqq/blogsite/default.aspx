<%@ Page Title="Ana Sayfa" Language="C#" MasterPageFile="MasterPage.master" AutoEventWireup="true" CodeFile="default.aspx.cs" Inherits="_default" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Web.UI.WebControls" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style>
        /* Ana Konteynır */
        .blog-container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 0 15px;
        }
        
        /* Arama Kutusu */
        .search-box {
            margin-bottom: 30px;
            display: flex;
            justify-content: center;
        }
        
        .search-input {
            width: 60%;
            padding: 12px 20px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 30px 0 0 30px;
            font-size: 16px;
            outline: none;
            background-color: rgba(255,255,255,0.1);
            color: #fff;
            transition: all 0.3s ease;
        }
        
        .search-input:focus {
            background-color: rgba(255,255,255,0.15);
            border-color: var(--primary-color);
        }
        
        .search-input::placeholder {
            color: rgba(255,255,255,0.6);
        }
        
        .search-btn {
            padding: 12px 25px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 0 30px 30px 0;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .search-btn:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
        }
        
        /* Arama Sonuçları */
        .search-results {
            background-color: rgba(255,255,255,0.05);
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 12px;
            border-left: 4px solid var(--primary-color);
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Blog Kartları */
        .blog-card {
            margin-bottom: 30px;
            background: linear-gradient(145deg, #1a1a1a, #262626);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
            transition: all 0.4s ease;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            max-width: 100%;
        }
        
        .blog-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.4), 0 0 20px rgba(26, 115, 232, 0.2);
            border-color: var(--primary-color);
        }
        
        .blog-image {
            width: 100%;
            height: 250px;
            overflow: hidden;
            position: relative;
        }
        
        .blog-image::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40%;
            background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
            z-index: 1;
        }
        
        .blog-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.7s ease;
        }
        
        .blog-card:hover .blog-image img {
            transform: scale(1.08);
        }
        
        .blog-category {
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: var(--primary-color);
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.3);
            z-index: 2;
            backdrop-filter: blur(5px);
        }
        
        .blog-details {
            padding: 25px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            position: relative;
        }
        
        .blog-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        
        .blog-title a {
            color: #fff;
            text-decoration: none;
            transition: color 0.3s ease;
            background: linear-gradient(90deg, #fff, #fff);
            background-size: 0 2px;
            background-repeat: no-repeat;
            background-position: left bottom;
            padding-bottom: 2px;
        }
        
        .blog-title a:hover {
            color: var(--primary-color);
            background-size: 100% 2px;
        }
        
        .blog-meta {
            display: flex;
            flex-wrap: wrap;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-bottom: 15px;
            gap: 15px;
        }
        
        .blog-author, .blog-date, .blog-views, .blog-comments {
            display: flex;
            align-items: center;
            transition: color 0.2s ease;
        }
        
        .blog-views, .blog-comments {
            background: rgba(255,255,255,0.08);
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 500;
        }
        
        .blog-views:hover, .blog-comments:hover {
            background: rgba(255,255,255,0.15);
            color: var(--primary-color);
        }
        
        .blog-meta i {
            margin-right: 5px;
            color: var(--primary-color);
        }
        
        .blog-excerpt {
            color: rgba(255,255,255,0.8);
            margin-bottom: 20px;
            line-height: 1.6;
            flex-grow: 1;
            font-size: 15px;
        }
        
        .blog-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 15px;
        }
        
        .blog-stats {
            display: flex;
            gap: 12px;
        }
        
        .blog-stat {
            display: flex;
            align-items: center;
            gap: 5px;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            background: rgba(255,255,255,0.05);
            padding: 6px 12px;
            border-radius: 20px;
            cursor: pointer;
        }
        
        .blog-stat:hover {
            color: var(--primary-color);
            background: rgba(255,255,255,0.1);
            transform: translateY(-3px);
        }
        
        .blog-stat i {
            color: var(--primary-color);
            transition: transform 0.3s ease;
        }
        
        .blog-stat:hover i {
            transform: scale(1.2);
        }
        
        .blog-stat.likes {
            position: relative;
            overflow: hidden;
        }
        
        .blog-stat.likes i {
            color: #ff5e5e;
        }
        
        .blog-stat.likes.active {
            background: rgba(255, 94, 94, 0.15);
        }
        
        .blog-stat.likes.active i {
            color: #ff5e5e;
        }
        
        .blog-stat.comments i {
            color: #5e9dff;
        }
        
        .blog-stat.views i {
            color: #5eff8f;
        }
        
        .read-more {
            display: inline-flex;
            align-items: center;
            padding: 10px 22px;
            background: linear-gradient(135deg, var(--primary-color), #4285f4);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.4s ease;
            box-shadow: 0 4px 15px rgba(26, 115, 232, 0.4);
            position: relative;
            overflow: hidden;
        }
        
        .read-more:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: all 0.4s ease;
        }
        
        .read-more:hover:before {
            left: 100%;
        }
        
        .read-more i {
            margin-left: 8px;
            transition: transform 0.3s ease;
        }
        
        .read-more:hover {
            background: linear-gradient(135deg, #4285f4, var(--primary-color));
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(26, 115, 232, 0.6);
        }
        
        .read-more:hover i {
            transform: translateX(4px);
        }
        
        .like-animation {
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            color: #ff5e5e;
            font-size: 20px;
            opacity: 0;
            pointer-events: none;
            animation: likeFloat 1s ease-out forwards;
        }
        
        @keyframes likeFloat {
            0% {
                top: 0;
                opacity: 1;
            }
            100% {
                top: -30px;
                opacity: 0;
        }
        }
        
        /* Kartlar için duyarlı tasarım ayarları */
        @media (max-width: 768px) {
            .blog-card {
                margin-bottom: 25px;
        }
        
            .blog-image {
                height: 200px;
        }
        
            .blog-details {
                padding: 20px;
            }
            
            .blog-title {
                font-size: 18px;
                margin-bottom: 10px;
        }
        
            .blog-meta {
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 10px;
        }
        
            .blog-excerpt {
                font-size: 14px;
                margin-bottom: 15px;
        }
        
            .blog-stats {
                flex-wrap: wrap;
                gap: 8px;
        }
        
            .blog-stat {
                padding: 5px 10px;
                font-size: 13px;
            }
            
            .read-more {
                padding: 8px 16px;
                font-size: 13px;
            }
        }
        
        /* Arama Sonuçları Stili */
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--light-text);
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--gray-light);
            }
            
        .no-results-container {
            background-color: var(--dark-surface);
            border-radius: var(--border-radius);
            padding: 3rem 1rem;
            text-align: center;
            margin-bottom: 2rem;
            }
            
        .no-results-message h3 {
            color: var(--light-text);
            margin-bottom: 0.5rem;
            }
            
        .no-results-message p {
            color: var(--gray-medium);
            }
            
        /* Kullanıcı Sonuçları Stili */
        .user-results-container {
            margin-bottom: 2rem;
        }
            
        .user-results-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }
            
        .user-card {
            background-color: var(--dark-surface);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            display: flex;
                flex-direction: column;
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid var(--gray-light);
        }
        
        .user-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--box-shadow-hover);
            border-color: var(--primary-color);
        }
        
        .user-image {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            margin-bottom: 1rem;
            border: 3px solid var(--primary-color);
        }
        
        .user-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            }
            
        .user-info {
            flex: 1;
        }
        
        .user-name {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            }
            
        .user-name a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .user-name a:hover {
            text-decoration: underline;
        }
        
        .user-fullname {
            color: var(--gray-medium);
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .user-bio {
            font-size: 0.9rem;
            color: var(--light-text);
            margin-bottom: 0.75rem;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .user-stats {
            display: flex;
            align-items: center;
            font-size: 0.85rem;
            color: var(--gray-medium);
        }
        
        .btn-view-profile {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: var(--primary-color);
            color: white;
            border-radius: 20px;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: background-color 0.2s ease;
            text-align: center;
        }
        
        .btn-view-profile:hover {
            background-color: var(--primary-dark);
            }
            
        /* Blog Sonuçları Stili */
        .blog-results-container {
            margin-bottom: 2rem;
        }
        
        .blog-results {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .panel-no-results {
            background-color: var(--dark-surface);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            text-align: center;
                }
        
        /* Önerilen Kullanıcılar Widget'ı Stili */
        .suggested-users-widget {
            background: linear-gradient(145deg, #1a1a1a, #262626);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            margin-bottom: 30px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .widget-header {
            padding: 15px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            background-color: rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
        }
        
        .widget-header:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, var(--primary-color), transparent);
        }
        
        .widget-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            display: flex;
            align-items: center;
        }
        
        .widget-header h3 i {
            margin-right: 10px;
            color: var(--primary-color);
            font-size: 20px;
        }
        
        .widget-content {
            padding: 15px;
        }
        
        .widget-description {
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            margin-bottom: 15px;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px dashed rgba(255,255,255,0.1);
        }
        
        .suggested-user-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
            background-color: rgba(255,255,255,0.05);
            border: 1px solid transparent;
        }
        
        .suggested-user-item:last-child {
            margin-bottom: 0;
        }
        
        .suggested-user-item:hover {
            background-color: rgba(255,255,255,0.1);
            transform: translateY(-3px);
            border-color: rgba(255,255,255,0.2);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .user-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid var(--primary-color);
            margin-right: 12px;
            flex-shrink: 0;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        }
        
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .suggested-user-item:hover .user-avatar img {
            transform: scale(1.1);
        }
        
        .user-info {
            flex: 1;
            min-width: 0;
        }
        
        .user-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .user-name a {
            color: #fff;
            transition: color 0.2s ease;
        }
        
        .user-name a:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }
        
        .user-meta {
            font-size: 13px;
            color: rgba(255,255,255,0.7);
        }
        
        .user-meta i {
            color: var(--primary-color);
            margin-right: 4px;
        }
        
        .btn-follow {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            white-space: nowrap;
            margin-left: 10px;
            box-shadow: 0 3px 10px rgba(26, 115, 232, 0.3);
        }
        
        .btn-follow i {
            margin-right: 4px;
        }
        
        .btn-follow:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 5px 15px rgba(26, 115, 232, 0.5);
        }
        
        /* Snackbar widget'ın duyarlı tasarımı */
        @media (max-width: 768px) {
            .snk-content-layout {
                flex-direction: column;
            }
            
            .snk-content-sidebar {
                width: 100%;
                margin-top: 30px;
            }
            
            .suggested-user-item {
                padding: 10px;
            }
            
            .user-avatar {
                width: 40px;
                height: 40px;
            }
            
            .user-name {
                font-size: 14px;
            }
            
            .btn-follow {
                padding: 4px 10px;
                font-size: 12px;
            }
        }

        .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background-color: var(--dark-bg);
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }

        /* Sütun Tasarımı */
        .snk-content-layout {
            display: flex;
            gap: 30px;
            margin-top: 30px;
        }

        .snk-content-main {
            flex: 1;
        }

        .snk-content-sidebar {
            width: 320px;
            flex-shrink: 0;
        }

        /* Kullanıcı adı linki için stil ekleyeceğim */
        .blog-author a {
            color: inherit; /* varsayılan renk */
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .blog-author a:hover {
            color: #1a73e8; /* primary rengi */
            text-decoration: underline;
        }
    </style>
    <script type="text/javascript">
        // Kullanıcı giriş durumu değişkeni
        var userLoggedIn = false; // JavaScript tarafında varsayılan olarak false
        
        // ASP.NET kullanıcı oturum durumunu almak için sayfa yüklendiğinde değeri güncelleyeceğiz
        document.addEventListener('DOMContentLoaded', function() {
            // Bu değer server tarafında ayarlanacak
            var isLoggedIn = '<%= Session["KullaniciID"] != null ? "true" : "false" %>';
            userLoggedIn = (isLoggedIn === 'true');
            console.log('Kullanıcı giriş durumu:', userLoggedIn);
        });
    </script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="blog-container">
        <h1 class="page-title"><asp:Literal ID="ltlPageTitle" runat="server">En Son Blog Yazıları</asp:Literal></h1>
        
        <!-- Arama Sonuç Kutuları -->
        <asp:Panel ID="pnlNoResults" runat="server" Visible="false" CssClass="no-results-container">
            <div class="no-results-message">
                <i class="fas fa-search fa-3x mb-3"></i>
                <h3>Sonuç Bulunamadı</h3>
                <p>Aramanızla eşleşen blog yazısı veya kullanıcı bulunamadı.</p>
            </div>
        </asp:Panel>
        
        <!-- Kullanıcı Arama Sonuçları -->
        <asp:Panel ID="pnlUserResults" runat="server" Visible="false" CssClass="user-results-container mb-4">
            <h2 class="section-title"><i class="fas fa-users me-2"></i>Kullanıcı Sonuçları</h2>
            
            <div class="user-results-list">
                <asp:Repeater ID="rptUsers" runat="server">
                <ItemTemplate>
                        <div class="user-card">
                            <div class="user-image">
                                <img src='<%# ((UserSearchResult)Container.DataItem).GetProfileImageUrl() %>' alt="Profil Resmi" />
                                </div>
                            <div class="user-info">
                                <h3 class="user-name">
                                    <a href='userpage.aspx?id=<%# Eval("UserID") %>'><%# Eval("Username") %></a>
                                </h3>
                                <p class="user-fullname"><%# Eval("FullName") %></p>
                                <p class="user-bio"><%# ((UserSearchResult)Container.DataItem).GetShortBio() %></p>
                                <div class="user-stats">
                                    <span><i class="fas fa-file-alt"></i> <%# Eval("PostCount") %> blog yazısı</span>
                                </div>
                            </div>
                            <a href='userpage.aspx?id=<%# Eval("UserID") %>' class="btn-view-profile">
                                <i class="fas fa-user"></i> Profili Görüntüle
                            </a>
                            </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
        </asp:Panel>
        
        <!-- Blog Yazıları Arama Sonuçları -->
        <asp:Panel ID="pnlBlogResults" runat="server" Visible="true" CssClass="blog-results-container">
            <h2 class="section-title" runat="server" id="blogResultsTitle"><i class="fas fa-file-alt me-2"></i>Blog Yazıları</h2>
            
            <div class="blog-results">
                <asp:Repeater ID="rptBlogs" runat="server">
                    <ItemTemplate>
                        <div class="blog-card">
                            <asp:Panel ID="pnlPostImage" runat="server" CssClass="blog-image" Visible='<%# HasPostImage(Eval("PostID")) %>'>
                                <img src='<%# GetPostImageUrl(Eval("PostID")) %>' alt='<%# Eval("Title") %>' />
                            </asp:Panel>
                            <div class="blog-category"><%# Eval("CategoryName") %></div>
                            <div class="blog-details">
                                <h2 class="blog-title"><a href='blog.aspx?id=<%# Eval("PostID") %>'><%# Eval("Title") %></a></h2>
                                <div class="blog-meta">
                                    <span class="blog-author"><i class="fas fa-user"></i> <a href='userpage.aspx?id=<%# Eval("UserID") %>'><%# Eval("Username") %></a></span>
                                    <span class="blog-date"><i class="far fa-calendar-alt"></i> <%# Eval("CreatedAt", "{0:dd.MM.yyyy}") %></span>
                                    <span class="blog-views"><i class="fas fa-eye"></i> <%# GetViewCount(Eval("PostID")) %></span>
                                    <span class="blog-comments"><i class="far fa-comment"></i> <%# GetCommentCount(Eval("PostID")) %></span>
                            </div>
                                <div class="blog-excerpt"><%# GetExcerpt(Eval("Content")) %></div>
                                <div class="blog-footer">
                                <div class="blog-stats">
                                        <div class="blog-stat views" title="Görüntülenme sayısı"><i class="fas fa-eye"></i> <%# GetViewCount(Eval("PostID")) %></div>
                                        <a href='blog.aspx?id=<%# Eval("PostID") %>#comments' class="blog-stat comments" title="Yorumlar"><i class="far fa-comment"></i> <%# GetCommentCount(Eval("PostID")) %></a>
                                        <div class="blog-stat likes <%# HasUserLiked(Eval("PostID")) ? "active" : "" %>" 
                                             onclick="handleLikeClick(<%# Eval("PostID") %>, this)" 
                                             data-postid="<%# Eval("PostID") %>" 
                                             title="<%# HasUserLiked(Eval("PostID")) ? "Beğenmekten vazgeç" : "Beğen" %>">
                                            <i class="<%# HasUserLiked(Eval("PostID")) ? "fas" : "far" %> fa-heart"></i> 
                                            <span class="like-count"><%# GetLikeCount(Eval("PostID")) %></span>
                                </div>
                                    </div>
                                    <a href='blog.aspx?id=<%# Eval("PostID") %>' class="read-more">Devamını Oku <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </div>
                    </div>
                </ItemTemplate>
            </asp:Repeater>
            </div>
        </asp:Panel>
        
        <!-- Blog Yazısı Bulunamadı Mesajı -->
        <asp:Panel ID="pnlNoBlogResults" runat="server" Visible="false" CssClass="panel-no-results">
            <div class="no-results-message">
                <i class="fas fa-file-alt fa-3x mb-3"></i>
                <h3>Blog Yazısı Bulunamadı</h3>
                <p>Aradığınız kriterlere uygun blog yazısı bulunamadı.</p>
            </div>
        </asp:Panel>
        
        <div class="snk-content-layout">
            <!-- Sol Sütun (Blog Yazıları) -->
            <div class="snk-content-main">
                <div class="snk-content-header">
                    <h2 class="snk-content-title">En Güncel Paylaşımlar</h2>
                </div>
                <asp:Repeater ID="Repeater1" runat="server">
                    <ItemTemplate>
                        <div class="blog-card">
                            <asp:Panel ID="pnlPostImage" runat="server" CssClass="blog-image" Visible='<%# HasPostImage(Eval("PostID")) %>'>
                                <img src='<%# GetPostImageUrl(Eval("PostID")) %>' alt='<%# Eval("Title") %>' />
                            </asp:Panel>
                            <div class="blog-category"><%# Eval("CategoryName") %></div>
                            <div class="blog-details">
                                <h2 class="blog-title"><a href='blog.aspx?id=<%# Eval("PostID") %>'><%# Eval("Title") %></a></h2>
                                <div class="blog-meta">
                                    <span class="blog-author"><i class="fas fa-user"></i> <a href='userpage.aspx?id=<%# Eval("UserID") %>'><%# Eval("Username") %></a></span>
                                    <span class="blog-date"><i class="far fa-calendar-alt"></i> <%# Eval("CreatedAt", "{0:dd.MM.yyyy}") %></span>
                                    <span class="blog-views"><i class="fas fa-eye"></i> <%# GetViewCount(Eval("PostID")) %></span>
                                    <span class="blog-comments"><i class="far fa-comment"></i> <%# GetCommentCount(Eval("PostID")) %></span>
                                    </div>
                                <div class="blog-excerpt"><%# GetExcerpt(Eval("Content")) %></div>
                                <div class="blog-footer">
                                    <div class="blog-stats">
                                        <div class="blog-stat views" title="Görüntülenme sayısı"><i class="fas fa-eye"></i> <%# GetViewCount(Eval("PostID")) %></div>
                                        <a href='blog.aspx?id=<%# Eval("PostID") %>#comments' class="blog-stat comments" title="Yorumlar"><i class="far fa-comment"></i> <%# GetCommentCount(Eval("PostID")) %></a>
                                        <div class="blog-stat likes <%# HasUserLiked(Eval("PostID")) ? "active" : "" %>" 
                                             onclick="handleLikeClick(<%# Eval("PostID") %>, this)" 
                                        data-postid="<%# Eval("PostID") %>"
                                             title="<%# HasUserLiked(Eval("PostID")) ? "Beğenmekten vazgeç" : "Beğen" %>">
                                            <i class="<%# HasUserLiked(Eval("PostID")) ? "fas" : "far" %> fa-heart"></i> 
                                            <span class="like-count"><%# GetLikeCount(Eval("PostID")) %></span>
                                </div>
                                    </div>
                                    <a href='blog.aspx?id=<%# Eval("PostID") %>' class="read-more">Devamını Oku <i class="fas fa-arrow-right"></i></a>
                                </div>
                            </div>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
            
            <!-- Sağ Sütun -->
            <div class="snk-content-sidebar" id="snk_contentSidebar">
                <!-- Önerilen Kullanıcılar Widget'ı Başlangıç -->
                <div class="suggested-users-widget">
                    <div class="widget-header">
                        <h3><i class="fas fa-users"></i> Önerilen Kullanıcılar</h3>
                    </div>
                    <div class="widget-content">
                        <div class="widget-description">
                            Bloglarını takip edebileceğiniz harika yazarlar burada!
                        </div>
                        <asp:Repeater ID="rptSuggestedUsers" runat="server">
                            <ItemTemplate>
                                <div class="suggested-user-item">
                                    <div class="user-avatar">
                                        <img src='<%# ((UserSearchResult)Container.DataItem).GetProfileImageUrl() %>' alt="Profil Resmi" onerror="this.src='assets/img/default-profile.png';" />
                                    </div>
                                    <div class="user-info">
                                        <div class="user-name">
                                            <a href='userpage.aspx?id=<%# Eval("UserID") %>'><%# Eval("Username") %></a>
                                        </div>
                                        <div class="user-meta">
                                            <span><i class="fas fa-file-alt"></i> <%# Eval("PostCount") %> yazı</span>
                                        </div>
                                    </div>
                                    <a href='userpage.aspx?id=<%# Eval("UserID") %>' class="btn-follow">
                                        <i class="fas fa-user-plus"></i> Profil
                                    </a>
                                </div>
                            </ItemTemplate>
                        </asp:Repeater>
                    </div>
                </div>
                <!-- Önerilen Kullanıcılar Widget'ı Bitiş -->
            </div>
        </div>
    </div>

    <!-- Beğeni ve animasyon işlemleri için JavaScript -->
    <script type="text/javascript">
        // Beğeni butonuna tıklandığında çalışacak AJAX fonksiyonu
        function handleLikeClick(postId, button) {
            console.log('Beğeni butonuna tıklandı, PostID:', postId);
            
            // Kullanıcı login durumunu kontrol et
            if (!isUserLoggedIn()) {
                alert('Beğeni işlemi için giriş yapmalısınız!');
                window.location.href = 'login.aspx?returnUrl=' + encodeURIComponent(window.location.href);
                return false;
            }
            
            // Çift tıklamayı engelle
            if (button.dataset.processing === 'true') {
                console.log('İşlem zaten devam ediyor, lütfen bekleyin.');
                return false;
            }
            
            // İşlem devam ediyor olarak işaretle
            button.dataset.processing = 'true';
            
            // İşlem devam ederken görselini değiştir
            var icon = button.querySelector('i');
            if (icon) {
                icon.className = 'fa fa-spinner fa-spin';
            }
            
            // Beğeni animasyonu ekle
            addLikeAnimation(button);
            
            // AJAX isteği gönder
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'like-handler.aspx', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            // Tüm yanıtı konsola yazdır (debug için)
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('AJAX yanıtı - Status:', xhr.status);
                    console.log('AJAX yanıtı - ResponseText:', xhr.responseText);
                    
                    if (xhr.status === 200) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            console.log('JSON Parse edilmiş yanıt:', response);
                            
                            if (response && typeof response.liked !== 'undefined' && typeof response.likeCount !== 'undefined') {
                                // Beğeni durumunu güncelle
                                updateLikeStatus(postId, response.liked, response.likeCount);
                                
                                // Görüntülenme sayılarını da güncelle
                                updateViewCounts(postId);
                            } else {
                                console.error('Yanıtta liked veya likeCount alanları bulunamadı:', response);
                                alert('Beğeni işlemi tamamlandı ama yanıt formatı hatalı.');
                                
                                // İşlem tamamlandı olarak işaretle ve ikonu düzelt
                                button.dataset.processing = 'false';
                                var isLiked = button.classList.contains('active');
                                if (icon) {
                                    icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
                                }
                            }
                        } catch (e) {
                            console.error('JSON parse hatası:', e);
                            console.error('Parse edilemeyen yanıt:', xhr.responseText);
                            alert('Beğeni işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
                            
                            // İşlem tamamlandı olarak işaretle ve ikonu düzelt
                            button.dataset.processing = 'false';
                            if (icon) {
                                // Mevcut beğeni durumuna göre simgeyi ayarla
                                var isLiked = button.classList.contains('active');
                                icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
                            }
                        }
                    } else {
                        console.error('AJAX hatası:', xhr.status, xhr.statusText);
                        console.error('Hata yanıtı:', xhr.responseText);
                        alert('Beğeni işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
                        
                        // İşlem tamamlandı olarak işaretle ve ikonu düzelt
                        button.dataset.processing = 'false';
                        if (icon) {
                            // Mevcut beğeni durumuna göre simgeyi ayarla
                            var isLiked = button.classList.contains('active');
                            icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
                        }
                    }
                }
            };
            
            // FormData kullanarak daha güvenli gönderim
            var formData = 'postId=' + encodeURIComponent(postId);
            console.log('Gönderilen veri:', formData);
            xhr.send(formData);
        }

        // Bir blog post kartındaki tüm beğeni butonlarını güncelle
        function updateLikeStatus(postId, isLiked, likeCount) {
            console.log('Beğeni durumu güncelleniyor:', postId, isLiked, likeCount);
            
            // Beğeni butonlarını bul (postId özniteliğine göre)
            var likeButtons = document.querySelectorAll('.blog-stat.likes[data-postid="' + postId + '"]');
            console.log('Bulunan beğeni butonları:', likeButtons.length);
            
            // Her butonu güncelle
            likeButtons.forEach(function(button) {
                // Buton sınıfını güncelle
                if (isLiked) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
        }
        
                // İkon ve başlık güncelle
            var icon = button.querySelector('i');
            if (icon) {
                icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
            }
            
                button.title = isLiked ? "Beğenmekten vazgeç" : "Beğen";
            
                // Beğeni sayısını güncelle
                var countElement = button.querySelector('.like-count');
                if (countElement) {
                    countElement.textContent = likeCount;
            }
            
            // İşlemi tamamlandı olarak işaretle
            button.dataset.processing = 'false';
            });
        }
        
        // Görüntülenme sayılarını güncelle (tüm postlar için)
        function updateViewCounts(postId) {
            // Tüm görüntülenme sayısı elementlerini bul
            var viewCountElements = document.querySelectorAll('.blog-stat.views[data-postid="' + postId + '"]');
            
            if (viewCountElements.length > 0) {
                // PostId için görüntülenme sayısını almak üzere AJAX isteği gönderebiliriz
                // Veya sayfayı yenileme olmadan +1 ekleyebiliriz
                viewCountElements.forEach(function(element) {
                    var countText = element.textContent.trim();
                    var count = parseInt(countText) || 0;
                    element.textContent = count + 1;
                });
            }
        }
        
        // Beğeni animasyonu ekle
        function addLikeAnimation(button) {
            var likeAnimation = document.createElement('span');
            likeAnimation.className = 'like-animation';
            likeAnimation.innerHTML = '<i class="fas fa-heart"></i>';
            
            button.appendChild(likeAnimation);
            
            // Animasyon bittikten sonra elementi kaldır
            setTimeout(function() {
                button.removeChild(likeAnimation);
            }, 1000);
        }
        
        // Session kontrolü
        function isUserLoggedIn() {
            return userLoggedIn;
        }
        
        // Sayfa yüklendiğinde, tüm blog kartlarına hover efekti ekle
        document.addEventListener('DOMContentLoaded', function() {
            var blogCards = document.querySelectorAll('.blog-card');
            
            blogCards.forEach(function(card) {
                // Kart üzerine gelindiğinde görsel efektler ekle
                card.addEventListener('mouseenter', function() {
                    card.style.transform = 'translateY(-8px)';
                    var image = card.querySelector('.blog-image img');
                    if (image) {
                        image.style.transform = 'scale(1.08)';
                    }
                });
                
                // Karttan ayrılınca efektleri kaldır
                card.addEventListener('mouseleave', function() {
                    card.style.transform = '';
                    var image = card.querySelector('.blog-image img');
                    if (image) {
                        image.style.transform = '';
                    }
                });
            });
            
            // Beğeni butonlarına tıklama olayı ekle
            var likeButtons = document.querySelectorAll('.blog-stat.likes');
            likeButtons.forEach(function(button) {
                var postId = button.getAttribute('data-postid');
                if (postId) {
                    button.addEventListener('click', function() {
                        handleLikeClick(postId, this);
                    });
                }
            });
        });
    </script>
</asp:Content> 

<asp:Content ID="Content3" ContentPlaceHolderID="scripts" runat="server">
    <script>
        // Blog bağlantılarını debug etmek için
        document.addEventListener('DOMContentLoaded', function() {
            var blogLinks = document.querySelectorAll('a[href*="blog.aspx"]');
            console.log('Blog bağlantı sayısı:', blogLinks.length);
            
            blogLinks.forEach(function(link) {
                console.log('Blog bağlantısı:', link.href);
                
                // Bağlantı tıklandığında
                link.addEventListener('click', function(e) {
                    // URL'i konsola yazdır
                    console.log('Tıklanan bağlantı:', this.href);
                });
            });
            
            // Beğeni butonlarına debug için console log ekle
            var likeButtons = document.querySelectorAll('.blog-action-btn.like-btn');
            console.log('Beğeni butonları toplamı:', likeButtons.length);
            likeButtons.forEach(function(btn) {
                console.log('Beğeni butonu PostID:', btn.getAttribute('data-postid'));
            });
        });
    </script>
</asp:Content> 


