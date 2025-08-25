<%@ Page Title="Kategoriler" Language="C#" MasterPageFile="~/blogsite/MasterPage.master" AutoEventWireup="true" CodeFile="categories.aspx.cs" Inherits="Categories" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    
    <style>
        :root {
            --primary-bg: #000000;
            --card-bg: #121212;
            --accent-color: #0077ff;
            --accent-hover: #0055cc;
            --text-primary: #ffffff;
            --text-secondary: #cccccc;
            --card-shadow: 0 4px 20px rgba(0, 119, 255, 0.2);
            --border-radius: 12px;
            --transition-speed: 0.3s;
        }
        
        body {
            background-color: var(--primary-bg);
            color: var(--text-primary);
        }
        
        .main-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        /* Kategori filtre bölümü */
        .category-filter {
            background-color: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 40px;
            box-shadow: var(--card-shadow);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .filter-header h2 {
            font-size: 1.5rem;
            margin: 0;
            color: var(--text-primary);
        }
        
        .filter-header h2 i {
            margin-right: 10px;
            color: var(--accent-color);
        }
        
        .clear-filter-btn {
            background-color: transparent;
            color: var(--accent-color);
            border: 1px solid var(--accent-color);
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all var(--transition-speed);
        }
        
        .clear-filter-btn:hover {
            background-color: var(--accent-color);
            color: var(--text-primary);
        }
        
        .chip-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .chip {
            background-color: transparent;
            color: var(--text-primary);
            border: 2px solid var(--accent-color);
            padding: 6px 14px;
            border-radius: 50px;
            cursor: pointer;
            transition: all var(--transition-speed);
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .chip:hover,
        .chip.active {
            background-color: var(--accent-color);
            color: var(--text-primary);
            transform: translateY(-2px);
        }
        
        /* Kategori kartları bölümü */
        .category-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 60px;
        }
        
        .category-card {
            background-color: var(--card-bg);
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--card-shadow);
            transition: transform var(--transition-speed), box-shadow var(--transition-speed);
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .category-card:hover,
        .category-card.hover {
            transform: translateY(-10px);
            box-shadow: 0 10px 30px rgba(0, 119, 255, 0.3);
        }
        
        .category-icon {
            background-color: var(--accent-color);
            color: var(--text-primary);
            padding: 25px 0;
            text-align: center;
            font-size: 3rem;
        }
        
        .category-details {
            padding: 20px;
            text-align: center;
        }
        
        .category-details h2 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 1.5rem;
            color: var(--text-primary);
        }
        
        .category-stats {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .category-stats span {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .category-stats span i {
            font-size: 1.5rem;
            margin-bottom: 5px;
            color: var(--accent-color);
        }
        
        .view-category-btn {
            display: inline-block;
            background-color: var(--accent-color);
            color: var(--text-primary);
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            width: 100%;
            transition: background-color var(--transition-speed);
            box-sizing: border-box;
            font-weight: 500;
        }
        
        .view-category-btn:hover {
            background-color: var(--accent-hover);
        }
        
        /* Boş veri paneli */
        .no-data {
            text-align: center;
            padding: 40px 20px;
            background-color: var(--card-bg);
            border-radius: var(--border-radius);
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .no-data i {
            font-size: 3rem;
            color: var(--accent-color);
            margin-bottom: 20px;
        }
        
        .no-data h3 {
            color: var(--text-secondary);
            font-weight: 500;
            margin: 0;
        }
        
        /* Responsive tasarım */
        @media (max-width: 768px) {
            .category-container {
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            }
            
            .filter-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
        }
        
        @media (max-width: 480px) {
            .main-container {
                padding: 20px 15px;
            }
            
            .category-stats {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div class="main-container">
        <!-- Kategori filtreleme -->
        <div class="category-filter">
            <div class="filter-header">
                <h2><i class="fas fa-filter"></i> Kategoriler</h2>
                <button id="clearFilter" class="clear-filter-btn" onclick="clearFilter()">
                    <i class="fas fa-times"></i> Filtreyi Temizle
                </button>
            </div>
            <div class="chip-container">
                <asp:Repeater ID="rptCategoryChips" runat="server">
                    <ItemTemplate>
                        <div class="chip" data-category-id='<%# Eval("CategoryID") %>'>
                            <span><%# Eval("CategoryName") %></span>
            </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
        </div>
                    
        <!-- Kategori kartları -->
        <asp:Panel ID="pnlNoCategories" runat="server" Visible="false" CssClass="no-data">
            <i class="fas fa-folder-open"></i>
            <h3>Henüz kategori bulunmamaktadır.</h3>
        </asp:Panel>
        
        <div class="category-container">
            <asp:Repeater ID="rptCategories" runat="server">
                <ItemTemplate>
                    <div class="category-card" data-category-id='<%# Eval("CategoryID") %>'>
                        <div class="category-icon">
                            <i class="<%# GetCategoryIcon(Eval("CategoryID").ToString()) %>"></i>
            </div>
                        <div class="category-details">
                            <h2><%# Eval("CategoryName") %></h2>
                            <div class="category-stats">
                                <span><i class="fas fa-file-alt"></i> <%# GetPostCount(Eval("CategoryID").ToString()) %> Yazı</span>
            </div>
                            <asp:LinkButton ID="lnkViewCategory" runat="server" CssClass="view-category-btn" 
                                OnClick="ViewCategory" CommandArgument='<%# Eval("CategoryID") %>'>
                                <i class="fas fa-arrow-right"></i> Kategoriyi Görüntüle
                            </asp:LinkButton>
            </div>
        </div>
                </ItemTemplate>
            </asp:Repeater>
        </div>
    </div>
    
    <script>
        // Kategori filtreleme için JavaScript
        document.addEventListener('DOMContentLoaded', function () {
            // Chip'lere tıklama olayı ekle
            var chips = document.querySelectorAll('.chip');
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    // Aktif durumu değiştir
                    this.classList.toggle('active');
                    
                    // Filtrelemeyi uygula
                    applyFilter();
                });
            });
            
            // Kartlar için hover efektleri
            var cards = document.querySelectorAll('.category-card');
            cards.forEach(function (card) {
                card.addEventListener('mouseenter', function () {
                    this.classList.add('hover');
                });
                
                card.addEventListener('mouseleave', function () {
                    this.classList.remove('hover');
                });
            });
        });
        
        // Filtreleme işlevi
        function applyFilter() {
            var activeChips = document.querySelectorAll('.chip.active');
            var categoryCards = document.querySelectorAll('.category-card');
            
            // Eğer hiç aktif filtre yoksa tüm kategorileri göster
            if (activeChips.length === 0) {
                categoryCards.forEach(function (card) {
                    card.style.display = 'flex';
                });
                return;
            }
            
            // Aktif filtrelere göre kategorileri göster veya gizle
            var selectedCategoryIds = [];
            activeChips.forEach(function (chip) {
                selectedCategoryIds.push(chip.getAttribute('data-category-id'));
            });
            
            categoryCards.forEach(function (card) {
                var cardCategoryId = card.getAttribute('data-category-id');
                if (selectedCategoryIds.includes(cardCategoryId)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        // Filtreyi temizleme işlevi
        function clearFilter() {
            var activeChips = document.querySelectorAll('.chip.active');
            activeChips.forEach(function (chip) {
                chip.classList.remove('active');
            });
            
            // Tüm kategorileri göster
            var categoryCards = document.querySelectorAll('.category-card');
            categoryCards.forEach(function (card) {
                card.style.display = 'flex';
            });
        }
    </script>
</asp:Content>