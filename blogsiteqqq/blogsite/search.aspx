<%@ Page Title="Arama Sonuçları" Language="C#" MasterPageFile="MasterPage.master" AutoEventWireup="true" CodeFile="search.aspx.cs" Inherits="search" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <style>
        .search-box {
            display: flex;
            margin-bottom: 1rem;
        }
        .search-box .form-control {
            border-radius: 4px 0 0 4px;
            border-right: none;
        }
        .search-box .btn {
            border-radius: 0 4px 4px 0;
            margin-left: 0 !important;
        }
        .user-card {
            background-color: #262626;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        }
        .user-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            border-color: var(--primary-color);
        }
    </style>
    
    <div class="container py-5">
        <div class="row mb-4">
            <div class="col-md-8">
                <h1 class="h3 mb-3">Arama Sonuçları</h1>
                <p class="text-muted">
                    "<asp:Literal ID="ltlSearchQuery" runat="server"></asp:Literal>" için arama sonuçları
                </p>
            </div>
            <div class="col-md-4">
                <div class="search-box">
                    <asp:TextBox ID="txtSearch" runat="server" CssClass="form-control" placeholder="Ara..."></asp:TextBox>
                    <asp:Button ID="btnSearch" runat="server" Text="Ara" CssClass="btn btn-primary" OnClick="btnSearch_Click" />
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <!-- Sonuç bilgisi -->
                <asp:Panel ID="pnlNoResults" runat="server" Visible="false" CssClass="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> Aramanızla eşleşen sonuç bulunamadı.
                </asp:Panel>
                
                <!-- Kullanıcı sonuçları -->
                <asp:Panel ID="pnlUsers" runat="server" Visible="false">
                    <h2 class="h4 mt-4 mb-3">Kullanıcılar</h2>
                    <div class="row">
                        <asp:Repeater ID="rptUsers" runat="server">
                            <ItemTemplate>
                                <div class="col-md-4 mb-4">
                                    <div class="card user-card h-100">
                                        <div class="card-body d-flex align-items-center">
                                            <div class="user-avatar me-3">
                                                <img src='<%# string.IsNullOrEmpty(Eval("ProfileImage").ToString()) ? "assets/img/default-profile.png" : Eval("ProfileImage") %>' 
                                                     alt='<%# Eval("Username") %>' 
                                                     class="rounded-circle" width="50" height="50"
                                                     onerror="this.src='assets/img/default-profile.png';">
                                            </div>
                                            <div class="user-info">
                                                <h5 class="card-title mb-1">@<%# Eval("Username") %></h5>
                                                <p class="card-text text-muted small mb-0"><%# Eval("FullName") %></p>
                                                <p class="card-text text-muted small"><%# Eval("Email") %></p>
                                            </div>
                                        </div>
                                        <div class="card-footer bg-transparent border-top-0 text-center">
                                            <a href='userpage.aspx?id=<%# Eval("UserID") %>' class="btn btn-sm btn-outline-primary">Profili Görüntüle</a>
                                        </div>
                                    </div>
                                </div>
                            </ItemTemplate>
                        </asp:Repeater>
                    </div>
                </asp:Panel>
                
                <!-- Blog yazıları sonuçları -->
                <asp:Panel ID="pnlPosts" runat="server" Visible="false">
                    <h2 class="h4 mt-5 mb-3">Blog Yazıları</h2>
                    <div class="row">
                        <asp:Repeater ID="rptPosts" runat="server">
                            <ItemTemplate>
                                <div class="col-md-6 mb-4">
                                    <div class="card blog-card h-100">
                                        <div class="card-body">
                                            <h5 class="card-title"><%# Eval("Title") %></h5>
                                            <p class="card-text text-muted small">
                                                <i class="fas fa-user me-1"></i> <%# Eval("Author") %> 
                                                <span class="mx-2">|</span>
                                                <i class="fas fa-calendar me-1"></i> <%# Eval("Date") %>
                                                <span class="mx-2">|</span>
                                                <i class="fas fa-tag me-1"></i> <%# Eval("Category") %>
                                            </p>
                                            <p class="card-text excerpt"><%# Eval("Excerpt") %></p>
                                        </div>
                                        <div class="card-footer bg-transparent border-top-0">
                                            <a href='blog.aspx?id=<%# Eval("PostID") %>' class="btn btn-sm btn-outline-primary">Yazıyı Oku</a>
                                        </div>
                                    </div>
                                </div>
                            </ItemTemplate>
                        </asp:Repeater>
                    </div>
                </asp:Panel>
            </div>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="scripts" Runat="Server">
    <script type="text/javascript">
        $(document).ready(function() {
            // Enter tuşuna basıldığında arama yap
            $("#<%= txtSearch.ClientID %>").keypress(function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    $("#<%= btnSearch.ClientID %>").click();
                }
            });
        });
    </script>
</asp:Content> 