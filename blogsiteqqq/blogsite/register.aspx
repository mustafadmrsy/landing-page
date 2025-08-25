<%@ Page Title="Kayıt Ol" Language="C#" MasterPageFile="MasterPage.master" AutoEventWireup="true" CodeFile="register.aspx.cs" Inherits="blogsiteqqq_blogsite_register" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link href="assets/style/modern-auth.css" rel="stylesheet" />
    <style>
        /* Doğrulama kodu stili */
        .verification-container {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }
        .verification-code {
            letter-spacing: 5px;
            font-size: 18px;
            text-align: center;
        }
        .resend-link {
            margin-top: 10px;
            text-align: center;
            font-size: 14px;
        }
    </style>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="auth-container register-container">
        <div class="auth-header">
            <h2>Hesap Oluştur</h2>
            <p>Senirkent Blog'a katılın ve yazılarınızı paylaşın</p>
        </div>
        
        <asp:Label ID="LblHata" runat="server" CssClass="error-message" Visible="false"></asp:Label>
        <asp:Label ID="LblBasari" runat="server" CssClass="success-message" Visible="false"></asp:Label>
        
        <div class="form-group">
            <label for="TxtKullaniciAdi">Kullanıcı Adı</label>
            <asp:TextBox ID="TxtKullaniciAdi" runat="server" CssClass="form-control" placeholder="Kullanıcı adınızı girin"></asp:TextBox>
            <asp:RequiredFieldValidator ID="rfvKullaniciAdi" runat="server" 
                ControlToValidate="TxtKullaniciAdi" CssClass="error-message" 
                ErrorMessage="Kullanıcı adı gerekli" Display="Dynamic"></asp:RequiredFieldValidator>
        </div>
        
        <div class="form-group">
            <label for="TxtEmail">E-posta Adresi</label>
            <asp:TextBox ID="TxtEmail" runat="server" CssClass="form-control" placeholder="E-posta adresinizi girin" TextMode="Email"></asp:TextBox>
            <asp:RequiredFieldValidator ID="rfvEmail" runat="server" 
                ControlToValidate="TxtEmail" CssClass="error-message" 
                ErrorMessage="E-posta adresi gerekli" Display="Dynamic"></asp:RequiredFieldValidator>
            <asp:RegularExpressionValidator ID="revEmail" runat="server" 
                ControlToValidate="TxtEmail" CssClass="error-message" 
                ErrorMessage="Geçerli bir e-posta adresi girin" 
                ValidationExpression="\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*" Display="Dynamic"></asp:RegularExpressionValidator>
        </div>
        
        <div class="form-group">
            <label for="TxtSifre">Şifre</label>
            <asp:TextBox ID="TxtSifre" runat="server" CssClass="form-control" placeholder="Şifrenizi girin" TextMode="Password"></asp:TextBox>
            <asp:RequiredFieldValidator ID="rfvSifre" runat="server" 
                ControlToValidate="TxtSifre" CssClass="error-message" 
                ErrorMessage="Şifre gerekli" Display="Dynamic"></asp:RequiredFieldValidator>
        </div>
        
        <div class="form-group">
            <label for="TxtSifreTekrar">Şifre Tekrar</label>
            <asp:TextBox ID="TxtSifreTekrar" runat="server" CssClass="form-control" placeholder="Şifrenizi tekrar girin" TextMode="Password"></asp:TextBox>
            <asp:RequiredFieldValidator ID="rfvSifreTekrar" runat="server" 
                ControlToValidate="TxtSifreTekrar" CssClass="error-message" 
                ErrorMessage="Şifre tekrarı gerekli" Display="Dynamic"></asp:RequiredFieldValidator>
            <asp:CompareValidator ID="cvSifre" runat="server" 
                ControlToCompare="TxtSifre" ControlToValidate="TxtSifreTekrar" 
                CssClass="error-message" ErrorMessage="Şifreler eşleşmiyor" Display="Dynamic"></asp:CompareValidator>
        </div>
        
        <div class="form-group">
            <asp:Button ID="BtnKayit" runat="server" Text="Hesap Oluştur" 
                CssClass="auth-btn" OnClick="btnKayit_Click" />
        </div>
        
        <%-- Doğrulama Kodu Alanı --%>
        <asp:Panel ID="DogrulamaKoduAlani" runat="server" CssClass="verification-container" Visible="false">
            <h3>E-posta Doğrulama</h3>
            <p>E-posta adresinize gönderilen 6 haneli doğrulama kodunu giriniz.</p>
            
            <div class="form-group">
                <label for="TxtDogrulamaKodu">Doğrulama Kodu</label>
                <asp:TextBox ID="TxtDogrulamaKodu" runat="server" CssClass="form-control verification-code" 
                    placeholder="XXXXXX" MaxLength="6"></asp:TextBox>
                <asp:RequiredFieldValidator ID="rfvDogrulamaKodu" runat="server" 
                    ControlToValidate="TxtDogrulamaKodu" CssClass="error-message" 
                    ErrorMessage="Doğrulama kodu gerekli" Display="Dynamic"
                    ValidationGroup="DogrulamaGrubu"></asp:RequiredFieldValidator>
            </div>
            
            <div class="form-group">
                <asp:Button ID="BtnDogrula" runat="server" Text="Doğrula" 
                    CssClass="auth-btn" OnClick="btnDogrula_Click" ValidationGroup="DogrulamaGrubu" />
            </div>
            
            <div class="resend-link">
                <p>Kod gelmedi mi? <asp:LinkButton ID="LnkKodYenidenGonder" runat="server" OnClick="btnKayit_Click">Yeniden Gönder</asp:LinkButton></p>
            </div>
        </asp:Panel>
        
        <div class="auth-link">
            Zaten hesabınız var mı? <a href="login.aspx">Giriş Yap</a>
        </div>
    </div>
</asp:Content>
