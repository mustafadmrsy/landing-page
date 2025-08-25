<%@ Page Title="Kullanıcılar" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true" CodeFile="users.aspx.cs" Inherits="Users" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <style>
        :root {
            --primary-color: #2563eb;
            --primary-hover: #1d4ed8;
            --secondary-color: #f8fafc;
            --text-color: #f8fafc;
            --background-color: #111827;
            --card-bg: #1f2937;
            --card-hover: #374151;
            --accent-color: #3b82f6;
            --error-color: #ef4444;
            --transition: all 0.3s ease;
        }

        .page-container {
            padding: 2rem;
            background-color: var(--background-color);
            min-height: 100vh;
            color: var(--text-color);
        }

        .search-container {
            max-width: 1200px;
            margin: 0 auto 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .search-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-align: center;
            color: var(--text-color);
        }

        .search-box {
            width: 100%;
            max-width: 600px;
            display: flex;
            gap: 0.5rem;
        }

        .search-input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 2px solid var(--card-bg);
            border-radius: 0.5rem;
            background-color: var(--card-bg);
            color: var(--text-color);
            font-size: 1rem;
            transition: var(--transition);
        }

        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
        }

        .search-button {
            padding: 0.75rem 1.5rem;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }

        .search-button:hover {
            background-color: var(--primary-hover);
        }

        .results-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .results-header {
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--card-bg);
        }

        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .user-card {
            background-color: var(--card-bg);
            border-radius: 0.75rem;
            overflow: hidden;
            transition: var(--transition);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            display: flex;
            flex-direction: column;
        }

        .user-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            background-color: var(--card-hover);
        }

        .user-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            background-color: var(--primary-color);
            border: 3px solid var(--primary-color);
        }

        .user-info {
            flex: 1;
        }

        .user-name {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            color: var(--text-color);
        }

        .user-username {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .user-body {
            padding: 1.25rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .user-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1.25rem;
        }

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .stat-value {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--primary-color);
        }

        .stat-label {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .user-actions {
            margin-top: auto;
        }

        .view-profile-btn {
            display: block;
            width: 100%;
            padding: 0.75rem 0;
            background-color: transparent;
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
            border-radius: 0.5rem;
            text-align: center;
            font-weight: 600;
            transition: var(--transition);
            text-decoration: none;
        }

        .view-profile-btn:hover {
            background-color: var(--primary-color);
            color: white;
        }

        .no-results {
            padding: 3rem 2rem;
            text-align: center;
            background-color: var(--card-bg);
            border-radius: 0.75rem;
            color: var(--text-color);
        }

        .no-results h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .no-results p {
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 1.5rem;
        }

        .animated {
            animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
            .search-box {
                flex-direction: column;
            }
            
            .search-button {
                width: 100%;
            }
            
            .users-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
        }
    </style>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div class="page-container">
        <div class="search-container">
            <h1 class="search-title">Kullanıcı Ara</h1>
            <div class="search-box">
                <asp:TextBox ID="txtSearch" runat="server" CssClass="search-input" placeholder="Kullanıcı adı, isim veya e-posta ara..."></asp:TextBox>
                <asp:Button ID="btnSearch" runat="server" Text="Ara" CssClass="search-button" OnClick="btnSearch_Click" />
            </div>
        </div>

        <asp:Panel ID="pnlSearchResults" runat="server" CssClass="results-container animated" Visible="false">
            <div class="results-header">
                <span><strong><asp:Literal ID="ltlSearchQuery" runat="server"></asp:Literal></strong> için arama sonuçları</span>
                <span><asp:Literal ID="ltlResultCount" runat="server"></asp:Literal></span>
            </div>

            <div class="users-grid">
                <asp:Repeater ID="rptUsers" runat="server">
                    <ItemTemplate>
                        <div class="user-card">
                            <div class="user-header">
                                <img src='<%# GetProfilePicture(Eval("ProfilePicture")) %>' alt="<%# Eval("Username") %>" class="user-avatar" />
                                <div class="user-info">
                                    <h3 class="user-name"><%# GetFullName(Eval("FirstName"), Eval("LastName"), Eval("Username")) %></h3>
                                    <div class="user-username">@<%# Eval("Username") %></div>
                                </div>
                            </div>
                            <div class="user-body">
                                <div class="user-stats">
                                    <div class="stat-item">
                                        <div class="stat-value"><%# GetPostCount(Eval("UserID")) %></div>
                                        <div class="stat-label">Yazılar</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value"><%# GetFormattedDate(Eval("CreatedAt")) %></div>
                                        <div class="stat-label">Katılma Tarihi</div>
                                    </div>
                                </div>
                                <div class="user-actions">
                                    <a href="userpage.aspx?userid=<%# Eval("UserID") %>" class="view-profile-btn">Profili Görüntüle</a>
                                </div>
                            </div>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
            
            <asp:Panel ID="pnlNoUsers" runat="server" CssClass="no-results animated" Visible="false">
                <h3>Arama kriterlerine uygun kullanıcı bulunamadı</h3>
                <p>Farklı anahtar kelimeler deneyebilir veya tüm kullanıcıları görüntülemek için boş arama yapabilirsiniz.</p>
            </asp:Panel>
        </asp:Panel>
    </div>

    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('<%= txtSearch.ClientID %>').focus();
        });
    </script>
</asp:Content> 