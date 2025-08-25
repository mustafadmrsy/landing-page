<%@ Page Title="İletişim" Language="C#" MasterPageFile="~/blogsite/MasterPage.master" AutoEventWireup="true" CodeFile="contact.aspx.cs" Inherits="contact" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <!-- İletişim sayfasına özel stil dosyaları buraya eklenebilir -->
    <link rel="stylesheet" href="assets/style/contact.css" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="snk-contact-container">
        <h1 class="snk-contact-header">İletişim</h1>
        
        <div class="snk-contact-content">
            <div class="snk-contact-info-container">
                <h2 class="snk-contact-section-title"><i class="fas fa-envelope"></i> Bize Ulaşın</h2>
                <p class="snk-contact-subtitle">Aşağıdaki iletişim bilgilerini kullanarak bize ulaşabilirsiniz:</p>
                
                <div class="snk-contact-info">
                    <div class="snk-contact-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="snk-contact-text">
                            <h4>Adres</h4>
                            <p>Senirkent Meslek Yüksekokulu,Isparta Uygulamalı Bilimler Üniversitesi</p>
                            <p>Senirkent, Isparta, Türkiye</p>
                        </div>
                    </div>
                    
                    <div class="snk-contact-info-item">
                        <i class="fas fa-phone"></i>
                        <div class="snk-contact-text">
                            <h4>Telefon</h4>
                            <p>+90 551 662 23 09</p>
                        </div>
                    </div>
                    
                    <div class="snk-contact-info-item">
                        <i class="fas fa-envelope"></i>
                        <div class="snk-contact-text">
                            <h4>E-posta</h4>
                            <p>senirkentmyo@sdu.edu.tr</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="snk-contact-form-container">
                <h2 class="snk-contact-section-title"><i class="fas fa-paper-plane"></i> İletişim Formu</h2>
                <p class="snk-contact-subtitle">Sorularınızı, önerilerinizi veya geri bildirimlerinizi aşağıdaki form aracılığıyla bize iletebilirsiniz:</p>
                
                <div class="snk-contact-form">
                    <div class="snk-form-group">
                        <label for="name"><i class="fas fa-user"></i> Adınız Soyadınız</label>
                        <input type="text" id="name" name="name" class="snk-form-input" required>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="email"><i class="fas fa-envelope"></i> E-posta Adresiniz</label>
                        <input type="email" id="email" name="email" class="snk-form-input" required>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="subject"><i class="fas fa-tag"></i> Konu</label>
                        <input type="text" id="subject" name="subject" class="snk-form-input" required>
                    </div>
                    
                    <div class="snk-form-group">
                        <label for="message"><i class="fas fa-comment"></i> Mesajınız</label>
                        <textarea id="message" name="message" rows="5" class="snk-form-textarea" required></textarea>
                    </div>
                    
                    <button type="submit" class="snk-contact-submit-btn"><i class="fas fa-paper-plane"></i> Gönder</button>
                </div>
            </div>
        </div>
        
        <div class="snk-map-container">
            <h2 class="snk-contact-section-title"><i class="fas fa-map-marked-alt"></i> Bizi Bulun</h2>
            <div class="snk-map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3157.675424604353!2d30.5534073!3d38.1036001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c59aeac53c0f57%3A0xd46e12cfd7d1b91e!2sSenirkent%20Meslek%20Y%C3%BCksekokulu!5e0!3m2!1str!2str!4v1624276547718!5m2!1str!2str" 
                    width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
            </div>
        </div>
        
        <div class="snk-social-media">
            <h2 class="snk-contact-section-title"><i class="fas fa-share-alt"></i> Sosyal Medya</h2>
            <div class="snk-social-icons">
                <a href="#" class="snk-social-icon"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="snk-social-icon"><i class="fab fa-twitter"></i></a>
                <a href="#" class="snk-social-icon"><i class="fab fa-instagram"></i></a>
                <a href="#" class="snk-social-icon"><i class="fab fa-linkedin-in"></i></a>
                <a href="#" class="snk-social-icon"><i class="fab fa-youtube"></i></a>
            </div>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="scripts" runat="server">
    <!-- İletişim sayfasına özel script dosyaları buraya eklenebilir -->
</asp:Content>
