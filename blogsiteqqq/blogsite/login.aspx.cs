using System;
using System.Data.SqlClient;
using System.Text;
using System.Security.Cryptography;
using System.Web.Security;
using System.Diagnostics;
using System.Web;
using System.Configuration;
using System.Collections.Generic;

public partial class blogsiteqqq_blogsite_login : System.Web.UI.Page
{
    // Veritabanı bağlantı stringi - Web.config'den al
    private readonly string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        // Sayfa ilk yüklendiğinde çalışacak kod
        if (!IsPostBack)
        {
            Debug.WriteLine("Login sayfası yüklendi");
            
            // Oturum ve cookie kontrolünü kaldır
            // Kullanıcının açıkça giriş yapmasını sağla
            
            // Sadece başarılı kayıt mesajı varsa göster
            if (Session["KayitBasarili"] != null && Session["KayitBasarili"].ToString() == "true")
            {
                // Kayıt başarılı mesajını göster
                LblHata.Text = "Kaydınız başarıyla oluşturuldu. Lütfen giriş yapın.";
                LblHata.CssClass = "message success-message";
                LblHata.Visible = true;
                
                // Session'ı temizle
                Session.Remove("KayitBasarili");
            }
            
            // Hata mesajı varsa göster
            if (Session["LoginError"] != null)
            {
                LblHata.Text = Session["LoginError"].ToString();
                LblHata.Visible = true;
                Session.Remove("LoginError");
            }
        }
    }

    protected void BtnGiris_Click(object sender, EventArgs e)
    {
        string kullanici = TxtKullaniciAdi.Text.Trim();
        string sifre = TxtSifre.Text.Trim();
        bool rememberMe = ChkBeniHatirla.Checked;

        if (string.IsNullOrEmpty(kullanici) || string.IsNullOrEmpty(sifre))
        {
            HataGoster("Kullanıcı adı ve şifre girilmelidir!");
            return;
        }

        // Önce hardcoded admin kontrolü
        if (kullanici == "adminsnk" && sifre == "1414snk")
        {
            Session["AdminID"] = 1;
            Session["AdminName"] = kullanici;
            Session["KullaniciID"] = 1; // Admin için geçici kullanıcı ID'si
            Session["KullaniciAdi"] = kullanici;
            
            // Çerez oluştur ve admin paneline yönlendir
            SetAuthCookie(kullanici, true, "Admin,User");
            Response.Redirect("admin.aspx");
            return;
        }

        try
        {
            // Önce admin tablosunda kontrol et
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    
                    // Admin girişi kontrolü
                    string adminQuery = "SELECT [adminID], [usarname] FROM admins WHERE [usarname] = @Kullanici AND [Password] = @Sifre";
                    using (SqlCommand adminCmd = new SqlCommand(adminQuery, connection))
                    {
                        adminCmd.Parameters.AddWithValue("@Kullanici", kullanici);
                        adminCmd.Parameters.AddWithValue("@Sifre", sifre);
                        
                        using (SqlDataReader adminReader = adminCmd.ExecuteReader())
                        {
                            if (adminReader.Read())
                            {
                                int adminId = Convert.ToInt32(adminReader["adminID"]);
                                string adminUsername = adminReader["usarname"].ToString();
                                
                                // Admin bilgilerini session'a kaydet
                                Session["AdminID"] = adminId;
                                Session["AdminName"] = adminUsername;
                                Session["KullaniciID"] = adminId; // Admin için geçici kullanıcı ID'si
                                Session["KullaniciAdi"] = adminUsername;
                                
                                // Çerez oluştur ve admin paneline yönlendir
                                SetAuthCookie(adminUsername, true, "Admin,User");
                                Response.Redirect("admin.aspx");
                                return;
                            }
                        }
                    }
                    
                    // MD5 hash oluştur
                    string sifreMD5 = CreateMD5(sifre);
                    
                    // Normal kullanıcı girişi kontrolü
                    string userQuery = "SELECT UserID, Username, Email, IsVerified FROM Users WHERE (Username = @Kullanici OR Email = @Kullanici) AND PasswordHash = @Sifre";
                    using (SqlCommand userCmd = new SqlCommand(userQuery, connection))
                    {
                        userCmd.Parameters.AddWithValue("@Kullanici", kullanici);
                        userCmd.Parameters.AddWithValue("@Sifre", sifreMD5);
                        
                        using (SqlDataReader userReader = userCmd.ExecuteReader())
                        {
                            if (userReader.Read())
                            {
                                int userId = Convert.ToInt32(userReader["UserID"]);
                                string username = userReader["Username"].ToString();
                                string email = userReader["Email"] != DBNull.Value ? userReader["Email"].ToString() : "";
                                bool isVerified = userReader["IsVerified"] != DBNull.Value && Convert.ToBoolean(userReader["IsVerified"]);
                                
                                // E-posta doğrulaması kontrolü
                                if (!isVerified)
                                {
                                    HataGoster("Hesabınız henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol ediniz.");
                                    return;
                                }
                                
                                // Kullanıcı bilgilerini Session'a kaydet
                                Session["KullaniciID"] = userId;
                                Session["KullaniciAdi"] = username;
                                Session["Email"] = email;
                                Session["LastActivity"] = DateTime.Now;
                                Session["SessionStartTime"] = DateTime.Now;
                                Session.Timeout = 180; // 180 dakika (3 saat)
                                
                                // Kullanıcı bilgilerini çerezde sakla
                                SaveUserCookie(userId, username, email, rememberMe);
                                
                                // Admin kontrolü
                                bool isAdmin = CheckIfAdmin(userId, username);
                                
                                // Çerez oluştur ve yönlendir
                                if (isAdmin)
                                {
                                    Session["AdminID"] = userId;
                                    Session["AdminName"] = username;
                                    SetAuthCookie(username, rememberMe, "Admin,User");
                                    Response.Redirect("admin.aspx");
                                }
                                else
                                {
                                    SetAuthCookie(username, rememberMe, "User");
                                    Response.Redirect("default.aspx");
                                }
                                return;
                            }
                            else
                            {
                                HataGoster("Kullanıcı adı veya şifre hatalı!");
                            }
                        }
                    }
                }
                catch (SqlException sqlEx)
                {
                    Debug.WriteLine("SQL Hatası: " + sqlEx.Message);
                    HataGoster("Veritabanı hatası: " + sqlEx.Message);
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Genel Hata: " + ex.Message);
            Debug.WriteLine("Stack Trace: " + ex.StackTrace);
            HataGoster("Giriş sırasında bir hata oluştu: " + ex.Message);
        }
    }

    // Auth cookie oluşturma helper metodu
    private void SetAuthCookie(string username, bool isPersistent, string roles)
    {
        try
        {
            // Kimlik bileti oluştur (ticket)
            FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(
                1,                      // Versiyon
                username,               // Kullanıcı adı
                DateTime.Now,           // Başlangıç zamanı
                DateTime.Now.AddDays(1), // Bitiş zamanı (1 gün)
                isPersistent,           // Kalıcı çerez olsun mu?
                roles,                  // Kullanıcı rolleri
                FormsAuthentication.FormsCookiePath // Çerez yolu
            );

            // Bileti şifrele
            string encryptedTicket = FormsAuthentication.Encrypt(ticket);
            
            // Çerez oluştur
            HttpCookie authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
            
            if (isPersistent)
            {
                authCookie.Expires = ticket.Expiration;
            }
            
            // Çerezi ekle
            Response.Cookies.Add(authCookie);
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Auth Cookie Hatası: " + ex.Message);
            HataGoster("Kimlik doğrulama hatası: " + ex.Message);
        }
    }

    private void HataGoster(string hataMetni)
    {
        LblHata.CssClass = "error-message";
        LblHata.Text = hataMetni;
        LblHata.Visible = true;
    }

    // MD5 hash oluşturma metodu
    private string CreateMD5(string input)
    {
        try
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
        catch (Exception ex)
        {
            Debug.WriteLine("MD5 Hash Hatası: " + ex.Message);
            throw new Exception("Şifre işleme hatası: " + ex.Message);
        }
    }

    // Kullanıcının admin olup olmadığını kontrol et
    private bool CheckIfAdmin(int userId, string username)
    {
        // Hardcoded admin kullanıcı adı kontrolü
        if (username == "adminsnk")
        {
            return true;
        }
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // admins tablosunda kullanıcı var mı kontrol et
                string query = "SELECT COUNT(*) FROM admins WHERE [adminID] = @UserID OR [usarname] = @Username";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    command.Parameters.AddWithValue("@Username", username);
                    
                    int count = Convert.ToInt32(command.ExecuteScalar());
                    return count > 0;
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Admin kontrolü hatası: " + ex.Message);
            return false;
        }
    }

    // Kullanıcı bilgilerini çerezde sakla
    private void SaveUserCookie(int userId, string username, string email, bool rememberMe)
    {
        try
        {
            HttpCookie userCookie = new HttpCookie("UserInfo");
            userCookie.Values["UserID"] = userId.ToString();
            userCookie.Values["Username"] = username;
            if (!string.IsNullOrEmpty(email))
                userCookie.Values["Email"] = email;
            
            if (rememberMe)
            {
                userCookie.Expires = DateTime.Now.AddDays(30); // 30 gün
            }
            
            Response.Cookies.Add(userCookie);
            Debug.WriteLine("Kullanıcı bilgileri çerezde saklandı: " + username);
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Çerez oluşturma hatası: " + ex.Message);
        }
    }
}