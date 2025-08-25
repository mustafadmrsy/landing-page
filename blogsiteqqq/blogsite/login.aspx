<%@ Page Title="Giriş Yap" Language="C#" MasterPageFile="MasterPage.master" AutoEventWireup="true" CodeFile="login.aspx.cs" Inherits="blogsiteqqq_blogsite_login" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <link href="assets/style/modern-auth.css" rel="stylesheet" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div class="auth-container login-container">
        <div class="auth-header">
            <h2>Kullanıcı Girişi</h2>
            <p>Blog sayfasına giriş yapın</p>
        </div>
        
        <asp:Label ID="LblHata" runat="server" CssClass="message error-message" Visible="false"></asp:Label>
        
        <div class="form-group">
            <label for="txtUserName">Kullanıcı Adı veya E-posta</label>
            <asp:TextBox ID="TxtKullaniciAdi" runat="server" CssClass="form-control" placeholder="Kullanıcı adı veya e-posta adresinizi girin"></asp:TextBox>
            <asp:RequiredFieldValidator ID="rfvUserName" runat="server" 
                ControlToValidate="TxtKullaniciAdi" 
                ErrorMessage="Kullanıcı adı gerekli" 
                CssClass="error-message" 
                Display="Dynamic">
            </asp:RequiredFieldValidator>
        </div>
        
        <div class="form-group">
            <label for="txtPassword">Şifre</label>
            <asp:TextBox ID="TxtSifre" runat="server" TextMode="Password" CssClass="form-control" placeholder="Şifrenizi girin"></asp:TextBox>
            <asp:RequiredFieldValidator ID="rfvPassword" runat="server" 
                ControlToValidate="TxtSifre" 
                ErrorMessage="Şifre gerekli" 
                CssClass="error-message" 
                Display="Dynamic">
            </asp:RequiredFieldValidator>
        </div>
        
        <div class="form-group remember-me">
            <asp:CheckBox ID="ChkBeniHatirla" runat="server" Text="Beni Hatırla" />
        </div>
        
        <div class="form-group">
            <asp:Button ID="BtnGiris" runat="server" Text="Giriş Yap" CssClass="auth-btn" OnClick="BtnGiris_Click" />
        </div>
        
        <div class="auth-link">
            Hesabınız yok mu? <a href="register.aspx">Kayıt Ol</a>
        </div>
    </div>
</asp:Content>
