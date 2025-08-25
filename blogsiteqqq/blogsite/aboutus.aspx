<%@ Page Title="Hakkımızda" Language="C#" MasterPageFile="~/blogsite/MasterPage.master" AutoEventWireup="true" CodeFile="aboutus.aspx.cs" Inherits="WebForm1" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="assets/style/aboutus.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="snk-about-container">
        <div class="snk-about-header">
            <h2 class="snk-about-title">Hakkımızda</h2>
            <p class="snk-about-subtitle">Senirkent Blog ekibi olarak, en güncel ve kaliteli içerikleri sizlerle paylaşmaktayız.</p>
        </div>

        <div class="snk-about-grid">
            <!-- Biz Kimiz? -->
            <div class="snk-about-card">
                <div class="snk-about-card-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3 class="snk-about-card-title">Ben Kimim?</h3>
                <p class="snk-about-card-text">Ben,Mustafa Demirsoy, Isparta Uygulamalı Bilimler Üniversitesi'nde Bilgisayar Programcılığı öğrencisi olarak, öğrencilere yönelik faydalı bir platform oluşturmayı amaçlıyorum. Bu platform, öğrencilerin bilgi paylaşımında bulunabileceği, ders notlarına ve kaynaklara erişebileceği, güncel duyurular ve etkinliklerden haberdar olabileceği bir destek ağı sunar.

                    Hedefim, öğrenciler için rehber niteliğinde bir topluluk oluşturmak ve akademik gelişimlerini destekleyerek onların daha verimli bir öğrenme deneyimi yaşamasını sağlamaktır.</p>
            </div>

            <!-- Misyonumuz -->
            <div class="snk-about-card">
                <div class="snk-about-card-icon">
                    <i class="fas fa-bullseye"></i>
                </div>
                <h3 class="snk-about-card-title">Misyonum</h3>
                <p class="snk-about-card-text">Öğrenciler arasında bilgi paylaşımını kolaylaştıran, akademik gelişimi destekleyen ve topluluk ruhunu güçlendiren bir platform sunuyorum. Üniversitemizdeki öğrencilerin ders notlarına, kaynaklara ve güncel duyurulara kolayca erişmesini sağlarken, fikir alışverişi yapabilecekleri bir ortam oluşturuyorum.

                    Öğrencilerin birbirine destek olabileceği, bilgiye hızlı ve doğru şekilde ulaşabileceği etkileşimli bir topluluk inşa etmek için çalışıyorum.</p>
            </div>

            <!-- Vizyonumuz -->
            <div class="snk-about-card">
                <div class="snk-about-card-icon">
                    <i class="fas fa-eye"></i>
                </div>
                <h3 class="snk-about-card-title">Vizyonum</h3>
                <p class="snk-about-card-text">Gelecekte, üniversitemizdeki tüm öğrencilerin aktif olarak katkı sağladığı, bilgiye erişimin hızlı ve verimli olduğu, sürekli güncellenen ve genişleyen bir öğrenci destek platformu haline gelmeyi hedefliyorum.

                    Uzun vadede, sadece kendi üniversitemizle sınırlı kalmayıp, diğer üniversitelerle iş birliği yaparak daha geniş bir öğrenci ağı oluşturmayı ve öğrencilere daha fazla imkan sunmayı amaçlıyorum.
                                
                </p>
            </div>
        </div>

        <div class="snk-about-section">
            <h3 class="snk-team-title">Ekibim</h3>
            <div class="snk-team-container">
                <!-- Kurucu Üyeler -->
                <div class="snk-team-category">
                    <h4 class="snk-team-category-title">Kurucu Üyeler</h4>
                    <div class="snk-team-cards">
                        <!-- Kurucu Üye 1 -->
                        <div class="snk-team-card">
                            <div class="snk-team-card-inner">
                                <div class="snk-team-avatar">
                                    <img src="assets/img/mustafa-demirsoy.jpg" alt="Mustafa Demirsoy">
                                </div>
                                <div class="snk-team-info">
                                    <h5 class="snk-team-name">Mustafa Demirsoy</h5>
                                    <p class="snk-team-role">Kurucu & Yazılım ve Geliştirme Departmanı Sorumlusu</p>
                                    <div class="snk-team-social">
                                        <a href="http://linkedin.com/in/mustafa-demirsoy-085b4a271" target="_blank" class="snk-team-social-link"><i class="fab fa-linkedin-in"></i></a>
                                        <a href="https://x.com/mmustafadmrsyy" target="_blank" class="snk-team-social-link"><i class="fab fa-twitter"></i></a>
                                        <a href="https://www.instagram.com/mustafadmrsy/" target="_blank" class="snk-team-social-link"><i class="fab fa-instagram"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="scripts" runat="server">
    <!-- Hakkımızda sayfasına özel script -->
</asp:Content>
