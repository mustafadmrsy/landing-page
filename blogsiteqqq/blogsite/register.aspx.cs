using System;
using System.Data.SqlClient;
using System.Text;
using System.Security.Cryptography;
using System.Diagnostics;
using System.Configuration;
using System.Net.Mail;
using System.Net;

public partial class blogsiteqqq_blogsite_register : System.Web.UI.Page
{
    // Veritabanı bağlantı stringi
    private readonly string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            // Session kontrolü - Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
            if (Session["KullaniciID"] != null)
            {
                Response.Redirect("default.aspx");
            }
            
            // Doğrulama kodu giriş alanını başlangıçta gizle
            DogrulamaKoduAlani.Visible = false;
        }
    }

    protected void btnKayit_Click(object sender, EventArgs e)
    {
        string kullaniciAdi = TxtKullaniciAdi.Text.Trim();
        string email = TxtEmail.Text.Trim();
        string sifre = TxtSifre.Text.Trim();
        string sifreTekrar = TxtSifreTekrar.Text.Trim();

        // Validasyon kontrolleri
        if (!FormuDogrula(kullaniciAdi, email, sifre, sifreTekrar))
        {
            return;
        }

        try
        {
            // Kullanıcı adı ve e-posta kontrolü
            if (KullaniciVarMi(kullaniciAdi, email))
            {
                return;
            }

            // Şifreyi MD5 ile hashle
            string hashliSifre = CreateMD5(sifre);
            
            // Doğrulama kodu oluştur
            string dogrulamaKodu = DogrulamaKoduOlustur();
            
            // PendingUsers tablosuna ekle
            if (BekleyenKullaniciKaydet(kullaniciAdi, email, hashliSifre, dogrulamaKodu))
            {
                // Doğrulama e-postası gönder
                string mailIcerik = DogrulamaMailIcerigiOlustur(kullaniciAdi, dogrulamaKodu);
                
                if (EmailGonder(email, "Senirkent Blog Hesap Doğrulama", mailIcerik))
                {
                    // E-posta başarıyla gönderildi, doğrulama ekranını göster
                    TxtKullaniciAdi.Enabled = false;
                    TxtEmail.Enabled = false;
                    TxtSifre.Enabled = false;
                    TxtSifreTekrar.Enabled = false;
                    BtnKayit.Visible = false;
                    
                    // Doğrulama kodu girişi alanını göster
                    DogrulamaKoduAlani.Visible = true;
                    
                    // Kullanıcıya bilgi ver
                    BasariGoster("E-posta adresinize doğrulama kodu gönderildi. Lütfen doğrulama kodunu girin.");
                    
                    // E-posta ve kullanıcı adını Session'da tut (doğrulama için)
                    Session["PendingEmail"] = email;
                    Session["PendingUsername"] = kullaniciAdi;
                }
                else
                {
                    HataGoster("Doğrulama e-postası gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
                }
            }
            else
            {
                HataGoster("Kayıt işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Hata: " + ex.Message);
            HataGoster("Kayıt işlemi sırasında bir hata oluştu: " + ex.Message);
        }
    }
    
    // Doğrulama kodlarını kontrol etme metodu
    protected void btnDogrula_Click(object sender, EventArgs e)
    {
        string dogrulamaKodu = TxtDogrulamaKodu.Text.Trim();
        string email = Session["PendingEmail"] as string;
        
        if (string.IsNullOrEmpty(dogrulamaKodu) || string.IsNullOrEmpty(email))
        {
            HataGoster("Doğrulama kodu boş olamaz.");
            return;
        }
        
        try
        {
            // Doğrulama kodunu kontrol et
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                string query = "SELECT PendingID, Username, Email, PasswordHash FROM PendingUsers " +
                               "WHERE Email = @Email AND VerificationToken = @VerificationToken";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@VerificationToken", dogrulamaKodu);
                    
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            // Doğrulama başarılı, kullanıcıyı Users tablosuna taşı
                            string kullaniciAdi = reader["Username"].ToString();
                            string hashliSifre = reader["PasswordHash"].ToString();
                            int pendingId = Convert.ToInt32(reader["PendingID"]);
                            
                            reader.Close();
                            
                            // Kullanıcıyı Users tablosuna ekle
                            if (KullaniciKaydet(kullaniciAdi, email, hashliSifre))
                            {
                                // PendingUsers tablosundan sil
                                BekleyenKullaniciSil(pendingId);
                                
                                // Session bilgilerini temizle
                                Session.Remove("PendingEmail");
                                Session.Remove("PendingUsername");
                                
                                // Login sayfasına yönlendir ve başarılı mesajı göster
                                Session["KayitBasarili"] = "true";
                                Response.Redirect("login.aspx");
                            }
                            else
                            {
                                HataGoster("Kullanıcı kaydı sırasında bir hata oluştu.");
                            }
                        }
                        else
                        {
                            HataGoster("Girdiğiniz doğrulama kodu hatalı veya süresi dolmuş.");
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Doğrulama Hatası: " + ex.Message);
            HataGoster("Doğrulama işlemi sırasında bir hata oluştu: " + ex.Message);
        }
    }

    private bool FormuDogrula(string kullaniciAdi, string email, string sifre, string sifreTekrar)
    {
        // Boş alan kontrolü
        if (string.IsNullOrEmpty(kullaniciAdi) || string.IsNullOrEmpty(email) || 
            string.IsNullOrEmpty(sifre) || string.IsNullOrEmpty(sifreTekrar))
        {
            HataGoster("Tüm alanları doldurunuz");
            return false;
        }

        // Şifrelerin eşleşme kontrolü
        if (sifre != sifreTekrar)
        {
            HataGoster("Şifreler eşleşmiyor");
            return false;
        }

        // Kullanıcı adı uzunluk kontrolü
        if (kullaniciAdi.Length < 3)
        {
            HataGoster("Kullanıcı adı en az 3 karakterden oluşmalıdır");
            return false;
        }

        // Şifre uzunluk kontrolü
        if (sifre.Length < 6)
        {
            HataGoster("Şifre en az 6 karakterden oluşmalıdır");
            return false;
        }

        return true;
    }

    private bool KullaniciVarMi(string kullaniciAdi, string email)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            // Kullanıcı adı kontrolü
            string queryUsername = "SELECT COUNT(*) FROM Users WHERE Username = @Username";
            using (SqlCommand command = new SqlCommand(queryUsername, connection))
            {
                command.Parameters.AddWithValue("@Username", kullaniciAdi);
                int count = (int)command.ExecuteScalar();
                if (count > 0)
                {
                    HataGoster("Bu kullanıcı adı zaten kullanılıyor");
                    return true;
                }
            }

            // E-posta kontrolü
            string queryEmail = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
            using (SqlCommand command = new SqlCommand(queryEmail, connection))
            {
                command.Parameters.AddWithValue("@Email", email);
                int count = (int)command.ExecuteScalar();
                if (count > 0)
                {
                    HataGoster("Bu e-posta adresi zaten kullanılıyor");
                    return true;
                }
            }
            
            // PendingUsers tablosunda e-posta kontrolü
            string queryPendingEmail = "SELECT COUNT(*) FROM PendingUsers WHERE Email = @Email";
            using (SqlCommand command = new SqlCommand(queryPendingEmail, connection))
            {
                command.Parameters.AddWithValue("@Email", email);
                int count = (int)command.ExecuteScalar();
                if (count > 0)
                {
                    HataGoster("Bu e-posta adresi ile bekleyen bir kaydınız var. Lütfen e-postanızı kontrol edin veya farklı bir e-posta kullanın.");
                    return true;
                }
            }
        }

        return false;
    }
    
    private bool BekleyenKullaniciKaydet(string kullaniciAdi, string email, string hashliSifre, string dogrulamaKodu)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string query = "INSERT INTO PendingUsers (Username, Email, PasswordHash, CreatedAt, VerificationToken, TokenCreatedAt) " +
                          "VALUES (@Username, @Email, @PasswordHash, @CreatedAt, @VerificationToken, @TokenCreatedAt)";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Username", kullaniciAdi);
                command.Parameters.AddWithValue("@Email", email);
                command.Parameters.AddWithValue("@PasswordHash", hashliSifre);
                command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                command.Parameters.AddWithValue("@VerificationToken", dogrulamaKodu);
                command.Parameters.AddWithValue("@TokenCreatedAt", DateTime.Now);

                int result = command.ExecuteNonQuery();
                return result > 0;
            }
        }
    }

    private bool KullaniciKaydet(string kullaniciAdi, string email, string hashliSifre)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string query = "INSERT INTO Users (Username, Email, PasswordHash, CreatedAt, IsVerified) " +
                          "VALUES (@Username, @Email, @PasswordHash, @CreatedAt, @IsVerified)";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Username", kullaniciAdi);
                command.Parameters.AddWithValue("@Email", email);
                command.Parameters.AddWithValue("@PasswordHash", hashliSifre);
                command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                command.Parameters.AddWithValue("@IsVerified", true);

                int result = command.ExecuteNonQuery();
                return result > 0;
            }
        }
    }
    
    private bool BekleyenKullaniciSil(int pendingId)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();

            string query = "DELETE FROM PendingUsers WHERE PendingID = @PendingID";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@PendingID", pendingId);
                int result = command.ExecuteNonQuery();
                return result > 0;
            }
        }
    }

    private void HataGoster(string mesaj)
    {
        LblHata.CssClass = "error-message";
        LblHata.Text = mesaj;
        LblHata.Visible = true;
        LblBasari.Visible = false;
    }

    private void BasariGoster(string mesaj)
    {
        LblBasari.CssClass = "success-message";
        LblBasari.Text = mesaj;
        LblBasari.Visible = true;
        LblHata.Visible = false;
    }

    // MD5 hash oluşturma metodu
    private string CreateMD5(string input)
    {
        using (MD5 md5 = MD5.Create())
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = md5.ComputeHash(inputBytes);

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("x2"));
            }
            return sb.ToString();
        }
    }
    
    // Rastgele doğrulama kodu oluşturma metodu
    private string DogrulamaKoduOlustur(int uzunluk = 6)
    {
        const string karakterler = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < uzunluk; i++)
        {
            int index = random.Next(karakterler.Length);
            sb.Append(karakterler[index]);
        }
        
        return sb.ToString();
    }
    
    // Mail gönderme metodu
    private bool EmailGonder(string aliciMail, string konu, string icerik)
    {
        try
        {
            // Web.config'den SMTP ayarlarını al
            string mailHost = ConfigurationManager.AppSettings["MailHost"];
            int mailPort = Convert.ToInt32(ConfigurationManager.AppSettings["MailPort"]);
            string mailUser = ConfigurationManager.AppSettings["MailUser"];
            string mailPass = ConfigurationManager.AppSettings["MailPass"];
            bool mailSSL = Convert.ToBoolean(ConfigurationManager.AppSettings["MailSSL"]);
            string senderName = ConfigurationManager.AppSettings["SenderDisplayName"];
            
            // Mail gönderme işlemi
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress(mailUser, senderName);
            mail.To.Add(aliciMail);
            mail.Subject = konu;
            mail.Body = icerik;
            mail.IsBodyHtml = true;
            
            SmtpClient smtp = new SmtpClient(mailHost, mailPort);
            smtp.EnableSsl = mailSSL;
            smtp.Credentials = new NetworkCredential(mailUser, mailPass);
            smtp.Send(mail);
            
            return true;
        }
        catch (Exception ex)
        {
            // Hata durumunda log tutulabilir
            System.Diagnostics.Debug.WriteLine("Mail Gönderme Hatası: " + ex.Message);
            return false;
        }
    }
    
    // Doğrulama mail içeriği oluşturma metodu
    private string DogrulamaMailIcerigiOlustur(string kullaniciAdi, string dogrulamaKodu)
    {
        string icerik = @"
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px; }
                .header { background-color: #4285f4; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { padding: 20px; }
                .code { font-size: 24px; font-weight: bold; text-align: center; padding: 15px; margin: 20px 0; background-color: #f5f5f5; border-radius: 5px; letter-spacing: 5px; }
                .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Senirkent Blog E-posta Doğrulama</h2>
                </div>
                <div class='content'>
                    <h3>Merhaba " + kullaniciAdi + @",</h3>
                    <p>Senirkent Blog hesabınızı doğrulamak için aşağıdaki kodu kullanınız.</p>
                    <p>Bu kod 30 dakika süreyle geçerlidir.</p>
                    <div class='code'>" + dogrulamaKodu + @"</div>
                    <p>Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
                    <p>Saygılarımızla,<br>Senirkent Blog Ekibi</p>
                </div>
                <div class='footer'>
                    <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen cevaplamayınız.</p>
                </div>
            </div>
        </body>
        </html>";
        
        return icerik;
    }
}