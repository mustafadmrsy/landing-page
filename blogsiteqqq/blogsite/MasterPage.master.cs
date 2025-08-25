using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Diagnostics;
using System.Data.SqlClient;
using System.Configuration;

public partial class MasterPage : System.Web.UI.MasterPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            // Oturum kontrolü
            if (Session["KullaniciID"] != null)
            {
                // Kullanıcı giriş yapmış
                if (pnlUyeGirisYok != null) pnlUyeGirisYok.Visible = false;
                if (pnlUyeGirisVar != null) pnlUyeGirisVar.Visible = true;
                
                // ÖNCE: localStorage ve cookie'den kullanıcı bilgilerini kontrol et
                TryLoadUserInfoFromPermanentStorage();
                
                // Kullanıcı adını göster
                if (Session["KullaniciAdi"] != null)
                {
                    string kullaniciAdi = Session["KullaniciAdi"].ToString();
                    
                    // Literal kontrollerini kontrol et ve varsa kullanıcı adını göster
                    if (ltlKullaniciAdi != null) ltlKullaniciAdi.Text = kullaniciAdi;
                    if (ltlKullaniciAdiMenu != null) ltlKullaniciAdiMenu.Text = kullaniciAdi;
                    
                    // Admin kontrolü 
                    if (IsAdminUser(kullaniciAdi))
                    {
                        // Admin paneli linkini görünür yap
                        if (pnlAdminLink != null) pnlAdminLink.Visible = true;
                    }
                    else
                    {
                        if (pnlAdminLink != null) pnlAdminLink.Visible = false;
                    }
                }
                
                // Kullanıcının tam adını göster (varsa)
                if (Session["UserFullName"] != null && !string.IsNullOrEmpty(Session["UserFullName"].ToString()))
                {
                    string fullName = Session["UserFullName"].ToString();
                    // Session değerinini DEBUG bilgisine yazdır
                    Debug.WriteLine("MasterPage: Kullanıcı tam adı: " + fullName);
                }
                // Eğer UserFullName yoksa ama FullName varsa
                else if (Session["FullName"] != null && !string.IsNullOrEmpty(Session["FullName"].ToString()))
                {
                    string fullName = Session["FullName"].ToString();
                    Session["UserFullName"] = fullName; // UserFullName'i de ayarla
                    Debug.WriteLine("MasterPage: FullName'den UserFullName'e aktarıldı: " + fullName);
                }
                // FullName yoksa, FirstName ve LastName'den oluştur
                else if (Session["FirstName"] != null || Session["LastName"] != null)
                {
                    string firstName = Session["FirstName"] != null ? Session["FirstName"].ToString() : "";
                    string lastName = Session["LastName"] != null ? Session["LastName"].ToString() : "";
                    string fullName = (firstName + " " + lastName).Trim();
                    
                    // Eğer oluşturulan ad anlamlıysa
                    if (!string.IsNullOrEmpty(fullName))
                    {
                        Session["UserFullName"] = fullName;
                        Session["FullName"] = fullName;
                        Debug.WriteLine("MasterPage: FirstName ve LastName'den fullName oluşturuldu: " + fullName);
                    }
                }

                // Session değişkenlerini debug bilgisine ekle
                string debugInfo = @"
                <script>
                    console.log('MasterPage Session Bilgileri:');
                    console.log('KullaniciID: " + Session["KullaniciID"] + @"');
                    console.log('KullaniciAdi: " + Session["KullaniciAdi"] + @"');
                    console.log('UserFullName: " + Session["UserFullName"] + @"');
                    console.log('FullName: " + Session["FullName"] + @"');
                    console.log('KullaniciAdSoyad: " + Session["KullaniciAdSoyad"] + @"');
                    console.log('FirstName: " + Session["FirstName"] + @"');
                    console.log('LastName: " + Session["LastName"] + @"');
                </script>";
                
                Page.ClientScript.RegisterStartupScript(this.GetType(), "SessionDebug", debugInfo);
                
                // LocalStorage'dan kullanıcı bilgilerini okuyan JavaScript
                string loadFromLocalStorageScript = @"
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        try {
                            // LocalStorage'dan kullanıcı bilgilerini kontrol et
                            var storedUsername = localStorage.getItem('username');
                            var storedFullName = localStorage.getItem('full_name') || localStorage.getItem('user_full_name');
                            
                            console.log('MasterPage: LocalStorage kontrol - username:', storedUsername);
                            console.log('MasterPage: LocalStorage kontrol - fullName:', storedFullName);
                            
                            // Session ile karşılaştır
                            var sessionUsername = '" + (Session["KullaniciAdi"] != null ? Session["KullaniciAdi"].ToString() : "") + @"';
                            var sessionFullName = '" + (Session["UserFullName"] != null ? Session["UserFullName"].ToString() : "") + @"';
                            
                            console.log('MasterPage: Session kontrol - username:', sessionUsername);
                            console.log('MasterPage: Session kontrol - fullName:', sessionFullName);
                            
                            // Menü öğelerini güncelle
                            var userNameElements = document.querySelectorAll('.username-display, .profile-username');
                            var fullNameElements = document.querySelectorAll('.fullname-display, .profile-fullname');
                            
                            // Username güncelle
                            if (storedUsername && userNameElements.length > 0) {
                                userNameElements.forEach(function(element) {
                                    if (element.innerText.trim() === '' || element.innerText === '@') {
                                        element.innerText = '@' + storedUsername;
                                        console.log('MasterPage: Kullanıcı adı LocalStorage\'dan güncellendi:', storedUsername);
                                    }
                                });
                            }
                            
                            // FullName güncelle
                            if (storedFullName && fullNameElements.length > 0) {
                                fullNameElements.forEach(function(element) {
                                    if (element.innerText.trim() === '') {
                                        element.innerText = storedFullName;
                                        console.log('MasterPage: Tam ad LocalStorage\'dan güncellendi:', storedFullName);
                                    }
                                });
                            }
                        } catch(err) {
                            console.error('MasterPage: LocalStorage kontrol hatası:', err);
                        }
                    });
                </script>";
                
                Page.ClientScript.RegisterStartupScript(this.GetType(), "LoadFromLocalStorage", loadFromLocalStorageScript, false);
            }
            else
            {
                // Kullanıcı giriş yapmamış
                if (pnlUyeGirisYok != null) pnlUyeGirisYok.Visible = true;
                if (pnlUyeGirisVar != null) pnlUyeGirisVar.Visible = false;
                
                // Session boş olduğunu loglama
                string debugInfo = "<script>console.log('MasterPage: Session[KullaniciID] is null');</script>";
                Page.ClientScript.RegisterStartupScript(this.GetType(), "SessionDebug", debugInfo);
            }
        }
    }
    
    // LocalStorage ve Cookie'den kullanıcı bilgilerini yüklemeyi dene
    private void TryLoadUserInfoFromPermanentStorage()
    {
        try
        {
            // 1. Cookie kontrolü
            HttpCookie userCookie = Request.Cookies["UserInfo"];
            if (userCookie != null && Session["KullaniciID"] != null)
            {
                // Cookie'deki kullanıcı ID'si Session ile aynı ise bilgileri aktarabilirsin
                if (userCookie["UserID"] == Session["KullaniciID"].ToString())
                {
                    // Session'da olmayan değerleri cookie'den yükle
                    if (Session["KullaniciAdi"] == null && userCookie["Username"] != null)
                        Session["KullaniciAdi"] = userCookie["Username"];
                        
                    if (Session["Username"] == null && userCookie["Username"] != null)
                        Session["Username"] = userCookie["Username"];
                    
                    if (Session["FirstName"] == null && userCookie["FirstName"] != null)
                        Session["FirstName"] = userCookie["FirstName"];
                        
                    if (Session["LastName"] == null && userCookie["LastName"] != null)
                        Session["LastName"] = userCookie["LastName"];
                        
                    if (Session["FullName"] == null && userCookie["FullName"] != null)
                        Session["FullName"] = userCookie["FullName"];
                        
                    if (Session["UserFullName"] == null && userCookie["FullName"] != null)
                        Session["UserFullName"] = userCookie["FullName"];
                        
                    if (Session["Bio"] == null && userCookie["ShortBio"] != null)
                        Session["Bio"] = userCookie["ShortBio"];
                    
                    Debug.WriteLine("MasterPage: Cookie'den kullanıcı bilgileri yüklendi: " + userCookie["FullName"]);
                }
            }
            
            // 2. Uygulama seviyesinde profil bilgileri kontrolü
            var userProfiles = Application["UserProfiles"] as System.Collections.Concurrent.ConcurrentDictionary<string, Dictionary<string, string>>;
            if (userProfiles != null && Session["KullaniciID"] != null)
            {
                string userId = Session["KullaniciID"].ToString();
                if (userProfiles.ContainsKey(userId))
                {
                    var userInfo = userProfiles[userId];
                    
                    // Session'da eksik bilgileri doldur
                    if (Session["KullaniciAdi"] == null && userInfo.ContainsKey("Username"))
                        Session["KullaniciAdi"] = userInfo["Username"];
                        
                    if (Session["Username"] == null && userInfo.ContainsKey("Username"))
                        Session["Username"] = userInfo["Username"];
                    
                    if (Session["FirstName"] == null && userInfo.ContainsKey("FirstName"))
                        Session["FirstName"] = userInfo["FirstName"];
                        
                    if (Session["LastName"] == null && userInfo.ContainsKey("LastName"))
                        Session["LastName"] = userInfo["LastName"];
                        
                    if (Session["FullName"] == null && userInfo.ContainsKey("FullName"))
                        Session["FullName"] = userInfo["FullName"];
                        
                    if (Session["UserFullName"] == null && userInfo.ContainsKey("FullName"))
                        Session["UserFullName"] = userInfo["FullName"];
                        
                    if (Session["Bio"] == null && userInfo.ContainsKey("Bio"))
                        Session["Bio"] = userInfo["Bio"];
                    
                    Debug.WriteLine("MasterPage: Application seviyesinden kullanıcı bilgileri yüklendi: " + 
                        (userInfo.ContainsKey("FullName") ? userInfo["FullName"] : "bilgi yok"));
                }
            }
            
            // 3. Eğer diğer bilgiler varsa ama FullName yoksa, oluştur
            if ((Session["FirstName"] != null || Session["LastName"] != null) && 
                (Session["FullName"] == null || Session["UserFullName"] == null))
            {
                string firstName = Session["FirstName"] != null ? Session["FirstName"].ToString() : "";
                string lastName = Session["LastName"] != null ? Session["LastName"].ToString() : "";
                string fullName = (firstName + " " + lastName).Trim();
                
                if (!string.IsNullOrEmpty(fullName))
                {
                    if (Session["FullName"] == null)
                        Session["FullName"] = fullName;
                        
                    if (Session["UserFullName"] == null)
                        Session["UserFullName"] = fullName;
                        
                    if (Session["KullaniciAdSoyad"] == null)
                        Session["KullaniciAdSoyad"] = fullName;
                    
                    Debug.WriteLine("MasterPage: Ad ve soyaddan FullName oluşturuldu: " + fullName);
                }
            }
            
            // LocalStorage'dan yükleme JavaScript ile ayrıca yapılacak
        }
        catch (Exception ex)
        {
            Debug.WriteLine("MasterPage: Kullanıcı bilgilerini yükleme hatası: " + ex.Message);
        }
    }

    // Kullanıcının admin olup olmadığını kontrol et
    private bool IsAdminUser(string username)
    {
        bool isAdmin = false;
        
        try
        {
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = "SELECT COUNT(*) FROM admins WHERE usarname = @Username";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Username", username);
                    
                    conn.Open();
                    int count = (int)cmd.ExecuteScalar();
                    
                    isAdmin = (count > 0);
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Admin kontrolü sırasında hata: " + ex.Message);
            isAdmin = false;
        }
        
        return isAdmin;
    }

    protected void lnkLogout_Click(object sender, EventArgs e)
    {
        Debug.WriteLine("Çıkış yapılıyor...");
        
        // Session temizle
        Session.Clear();
        Session.Abandon();

        // Authentication cookie'yi temizle
        System.Web.Security.FormsAuthentication.SignOut();
        
        // Anasayfaya yönlendir
        Response.Redirect("default.aspx");
    }
    
    protected void btnHeaderSearch_Click(object sender, EventArgs e)
    {
        // Arama işlevi
        try {
            Button btn = sender as Button;
            if (btn != null)
            {
                TextBox txtSearch = btn.Parent.FindControl("txtHeaderSearch") as TextBox;
                if (txtSearch != null && !string.IsNullOrEmpty(txtSearch.Text.Trim()))
                {
                    string searchText = txtSearch.Text.Trim();
                    // Arama sayfasına yönlendir
                    Response.Redirect("search.aspx?q=" + Server.UrlEncode(searchText));
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Arama hatası: " + ex.Message);
        }
    }

    // Bildirim sistemi için metot
    [System.Web.Services.WebMethod]
    public static List<Dictionary<string, string>> GetUserNotifications(int userId)
    {
        List<Dictionary<string, string>> notifications = new List<Dictionary<string, string>>();
        
        try
        {
            // Veritabanı bağlantı stringi
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Bildirim tablosunun varlığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications'";
                using (SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection))
                {
                    int tableExists = (int)checkCommand.ExecuteScalar();
                    
                    if (tableExists > 0)
                    {
                        // Mevcut bildirimleri getir
                        string query = @"
                            SELECT TOP 10 NotificationID, UserID, SenderID, NotificationType, Content, 
                                   CreatedAt, IsRead, ContentID 
                            FROM Notifications 
                            WHERE UserID = @UserID 
                            ORDER BY CreatedAt DESC";
                        
                        using (SqlCommand command = new SqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@UserID", userId);
                            
                            using (SqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    Dictionary<string, string> notification = new Dictionary<string, string>();
                                    
                                    notification["id"] = reader["NotificationID"].ToString();
                                    notification["type"] = reader["NotificationType"].ToString();
                                    notification["content"] = reader["Content"].ToString();
                                    notification["isRead"] = reader["IsRead"].ToString();
                                    notification["createdAt"] = Convert.ToDateTime(reader["CreatedAt"]).ToString("dd.MM.yyyy HH:mm");
                                    notification["senderId"] = reader["SenderID"].ToString();
                                    notification["contentId"] = reader["ContentID"] != DBNull.Value ? reader["ContentID"].ToString() : "";
                                    
                                    notifications.Add(notification);
                                }
                            }
                        }
                    }
                    
                    // Eğer bildirim yoksa veya çok az bildirim varsa, 
                    // yeni bildirimleri oluştur ve veritabanına ekle
                    if (notifications.Count < 5)
                    {
                        // Yeni bildirimleri oluştur
                        GenerateNotifications(connection, userId);
                        
                        // Yeni bildirimleri getir
                        string query = @"
                            SELECT TOP 10 NotificationID, UserID, SenderID, NotificationType, Content, 
                                   CreatedAt, IsRead, ContentID 
                            FROM Notifications 
                            WHERE UserID = @UserID 
                            ORDER BY CreatedAt DESC";
                        
                        using (SqlCommand command = new SqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@UserID", userId);
                            
                            using (SqlDataReader reader = command.ExecuteReader())
                            {
                                // Önceki bildirimleri temizle
                                notifications.Clear();
                                
                                while (reader.Read())
                                {
                                    Dictionary<string, string> notification = new Dictionary<string, string>();
                                    
                                    notification["id"] = reader["NotificationID"].ToString();
                                    notification["type"] = reader["NotificationType"].ToString();
                                    notification["content"] = reader["Content"].ToString();
                                    notification["isRead"] = reader["IsRead"].ToString();
                                    notification["createdAt"] = Convert.ToDateTime(reader["CreatedAt"]).ToString("dd.MM.yyyy HH:mm");
                                    notification["senderId"] = reader["SenderID"].ToString();
                                    notification["contentId"] = reader["ContentID"] != DBNull.Value ? reader["ContentID"].ToString() : "";
                                    
                                    notifications.Add(notification);
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Bildirim yükleme hatası: " + ex.Message);
            // Hata durumunda boş bildirim listesi döndür
        }
        
        return notifications;
    }
    
    // Okunmamış bildirim sayısını alma metodu
    [System.Web.Services.WebMethod]
    public static int GetUnreadNotificationCount(int userId)
    {
        int count = 0;
        
        try
        {
            // Veritabanı bağlantı stringi
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Bildirim tablosunun varlığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications'";
                using (SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection))
                {
                    int tableExists = (int)checkCommand.ExecuteScalar();
                    
                    if (tableExists > 0)
                    {
                        // Okunmamış bildirim sayısını getir
                        string query = "SELECT COUNT(*) FROM Notifications WHERE UserID = @UserID AND IsRead = 0";
                        
                        using (SqlCommand command = new SqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@UserID", userId);
                            count = (int)command.ExecuteScalar();
                        }
                        
                        // Eğer okunmamış bildirim yoksa, yeni bildirimler oluştur
                        if (count == 0)
                        {
                            // Bildirim oluştur
                            GenerateNotifications(connection, userId);
                            
                            // Tekrar bildirim sayısını kontrol et
                            using (SqlCommand command = new SqlCommand(query, connection))
                            {
                                command.Parameters.AddWithValue("@UserID", userId);
                                count = (int)command.ExecuteScalar();
                            }
                        }
                    }
                    else
                    {
                        // Bildirim tablosu yoksa oluştur ve bildirimler ekle
                        EnsureNotificationsTableExists(connection);
                        GenerateNotifications(connection, userId);
                        
                        // Bildirim sayısını getir
                        string query = "SELECT COUNT(*) FROM Notifications WHERE UserID = @UserID AND IsRead = 0";
                        using (SqlCommand command = new SqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@UserID", userId);
                            count = (int)command.ExecuteScalar();
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Bildirim sayısı hatası: " + ex.Message);
            // Hata durumunda 0 döndür
        }
        
        return count;
    }

    // Kullanıcının profil resmini alır
    protected string GetUserProfileImage()
    {
        try
        {
            // Önbellekteki resmi temizleme
            Session.Remove("ProfileImage");
            
            if (Session["KullaniciID"] != null)
            {
                string userId = Session["KullaniciID"].ToString();
                
                // Veritabanından kontrol et
                string profileImage = GetProfileImageFromDatabase(userId);
                if (!string.IsNullOrEmpty(profileImage))
                {
                    // Debug bilgisi
                    Debug.WriteLine("Profil resmi bulundu: " + profileImage);
                    return profileImage;
                }
            }
            
            // Varsayılan resim
            return "assets/img/default-profile.png";
        }
        catch (Exception ex)
        {
            Debug.WriteLine("GetUserProfileImage error: " + ex.Message);
            return "assets/img/default-profile.png";
        }
    }

    private string GetProfileImageFromDatabase(string userId)
    {
        try
        {
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // 1. Önce Users tablosundaki ProfilePicture'ı kontrol et (ana tablo)
                string sql = "SELECT ProfilePicture FROM Users WHERE UserID = @UserID";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    object result = command.ExecuteScalar();
                    
                    if (result != null && result != DBNull.Value && !string.IsNullOrEmpty(result.ToString()))
                    {
                        Debug.WriteLine("ProfilePicture found in Users table: " + result.ToString());
                        return result.ToString();
                    }
                }
                
                // 2. Sonra UserProfiles'dan kontrol et
                sql = "SELECT ProfileImage FROM UserProfiles WHERE UserID = @UserID";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    object result = command.ExecuteScalar();
                    
                    if (result != null && result != DBNull.Value && !string.IsNullOrEmpty(result.ToString()))
                    {
                        Debug.WriteLine("ProfileImage found in UserProfiles table: " + result.ToString());
                        return result.ToString();
                    }
                }
                
                // 3. Profiles tablosunu kontrol et
                sql = "SELECT ProfileImage FROM Profiles WHERE UserID = @UserID";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    object result = command.ExecuteScalar();
                    
                    if (result != null && result != DBNull.Value && !string.IsNullOrEmpty(result.ToString()))
                    {
                        Debug.WriteLine("ProfileImage found in Profiles table: " + result.ToString());
                        return result.ToString();
                    }
                }
                
                // 4. Avatar tablosunu kontrol et
                sql = "SELECT AvatarPath FROM Avatars WHERE UserID = @UserID";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    object result = command.ExecuteScalar();
                    
                    if (result != null && result != DBNull.Value && !string.IsNullOrEmpty(result.ToString()))
                    {
                        Debug.WriteLine("AvatarPath found in Avatars table: " + result.ToString());
                        return result.ToString();
                    }
                }
            }
            
            Debug.WriteLine("No profile image found for user ID: " + userId);
            return "";
        }
        catch (Exception ex)
        {
            Debug.WriteLine("GetProfileImageFromDatabase error: " + ex.Message);
            return "";
        }
    }

    // Kullanıcı için bildirimler oluşturma metodu
    private static void GenerateNotifications(SqlConnection connection, int userId)
    {
        try
        {
            // Bildirim tablosunun varlığını kontrol et ve gerekirse oluştur
            EnsureNotificationsTableExists(connection);
            
            // 1. Beğenilen yazılarım için bildirimler
            GenerateLikeNotifications(connection, userId);
            
            // 2. Gelen yorumlar için bildirimler
            GenerateCommentNotifications(connection, userId);
            
            // 3. Takip bildirimlerini oluştur
            GenerateFollowerNotifications(connection, userId);
            
            // 4. Takip edilen kişilerin yeni gönderileri için bildirimler
            GenerateFollowingNewPostNotifications(connection, userId);
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Bildirim oluşturma hatası: " + ex.Message);
        }
    }
    
    // Bildirim tablosunun varlığını kontrol et ve gerekirse oluştur
    private static void EnsureNotificationsTableExists(SqlConnection connection)
    {
        string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications'";
        using (SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection))
        {
            int tableExists = (int)checkCommand.ExecuteScalar();
            
            if (tableExists == 0)
            {
                // Notifications tablosu yoksa oluştur
                string createTableQuery = @"
                    CREATE TABLE Notifications (
                        NotificationID INT IDENTITY(1,1) PRIMARY KEY,
                        UserID INT NOT NULL,
                        SenderID INT NULL,
                        NotificationType NVARCHAR(50) NOT NULL,
                        Content NVARCHAR(500) NOT NULL,
                        ContentID INT NULL,
                        IsRead BIT DEFAULT 0,
                        CreatedAt DATETIME DEFAULT GETDATE(),
                        FOREIGN KEY (UserID) REFERENCES Users(UserID)
                    )";
                
                using (SqlCommand createCommand = new SqlCommand(createTableQuery, connection))
                {
                    createCommand.ExecuteNonQuery();
                }
            }
        }
    }
    
    // Beğeni bildirimleri oluştur
    private static void GenerateLikeNotifications(SqlConnection connection, int userId)
    {
        try
        {
            // Kullanıcının gönderilerini beğenenler için bildirim oluştur
            string query = @"
                SELECT TOP 5 l.PostID, l.UserID AS LikerID, u.Username AS LikerName, p.Title AS PostTitle
                FROM Likes l
                INNER JOIN Posts p ON l.PostID = p.PostID
                INNER JOIN Users u ON l.UserID = u.UserID
                WHERE p.UserID = @UserID AND l.UserID != @UserID
                ORDER BY l.CreatedAt DESC";
            
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserID", userId);
                
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        int postId = Convert.ToInt32(reader["PostID"]);
                        int likerId = Convert.ToInt32(reader["LikerID"]);
                        string likerName = reader["LikerName"].ToString();
                        string postTitle = reader["PostTitle"].ToString();
                        
                        // Bildirim içeriği oluştur
                        string content = likerName + " \"" + postTitle + "\" başlıklı yazınızı beğendi.";
                        
                        // Bildirim zaten var mı kontrol et
                        if (!NotificationExists(connection, userId, likerId, "like", postId))
                        {
                            // Bildirim oluştur
                            InsertNotification(connection, userId, likerId, "like", content, postId);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Beğeni bildirimleri oluşturulamadı: " + ex.Message);
        }
    }
    
    // Yorum bildirimleri oluştur
    private static void GenerateCommentNotifications(SqlConnection connection, int userId)
    {
        try
        {
            // Kullanıcının gönderilerine yapılan yorumlar için bildirim oluştur
            string query = @"
                SELECT TOP 5 c.CommentID, c.PostID, c.UserID AS CommenterID, u.Username AS CommenterName, 
                       p.Title AS PostTitle, c.CommentText
                FROM Comments c
                INNER JOIN Posts p ON c.PostID = p.PostID
                INNER JOIN Users u ON c.UserID = u.UserID
                WHERE p.UserID = @UserID AND c.UserID != @UserID
                ORDER BY c.CreatedAt DESC";
            
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserID", userId);
                
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        int commentId = Convert.ToInt32(reader["CommentID"]);
                        int postId = Convert.ToInt32(reader["PostID"]);
                        int commenterId = Convert.ToInt32(reader["CommenterID"]);
                        string commenterName = reader["CommenterName"].ToString();
                        string postTitle = reader["PostTitle"].ToString();
                        
                        // Bildirim içeriği oluştur
                        string content = commenterName + " \"" + postTitle + "\" başlıklı yazınıza yorum yaptı.";
                        
                        // Bildirim zaten var mı kontrol et
                        if (!NotificationExists(connection, userId, commenterId, "comment", postId))
                        {
                            // Bildirim oluştur
                            InsertNotification(connection, userId, commenterId, "comment", content, postId);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Yorum bildirimleri oluşturulamadı: " + ex.Message);
        }
    }
    
    // Takipçi bildirimleri oluştur
    private static void GenerateFollowerNotifications(SqlConnection connection, int userId)
    {
        try
        {
            // Kullanıcıyı takip edenler için bildirim oluştur
            string query = @"
                SELECT TOP 5 f.FollowerID, u.Username AS FollowerName
                FROM followers f
                INNER JOIN Users u ON f.FollowerID = u.UserID
                WHERE f.FollowingUserID = @UserID
                ORDER BY f.FollowDate DESC";
            
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserID", userId);
                
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        int followerId = Convert.ToInt32(reader["FollowerID"]);
                        string followerName = reader["FollowerName"].ToString();
                        
                        // Bildirim içeriği oluştur
                        string content = followerName + " sizi takip etmeye başladı.";
                        
                        // Bildirim zaten var mı kontrol et
                        if (!NotificationExists(connection, userId, followerId, "follow", null))
                        {
                            // Bildirim oluştur
                            InsertNotification(connection, userId, followerId, "follow", content, null);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Takipçi bildirimleri oluşturulamadı: " + ex.Message);
        }
    }
    
    // Takip edilen kişilerin yeni gönderileri için bildirimler
    private static void GenerateFollowingNewPostNotifications(SqlConnection connection, int userId)
    {
        try
        {
            // Kullanıcının takip ettiği kişilerin son gönderileri için bildirim oluştur
            string query = @"
                SELECT TOP 5 p.PostID, p.UserID AS AuthorID, u.Username AS AuthorName, p.Title
                FROM Posts p
                INNER JOIN Users u ON p.UserID = u.UserID
                INNER JOIN followers f ON p.UserID = f.FollowingUserID
                WHERE f.FollowerID = @UserID
                ORDER BY p.CreatedAt DESC";
            
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserID", userId);
                
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        int postId = Convert.ToInt32(reader["PostID"]);
                        int authorId = Convert.ToInt32(reader["AuthorID"]);
                        string authorName = reader["AuthorName"].ToString();
                        string postTitle = reader["Title"].ToString();
                        
                        // Bildirim içeriği oluştur
                        string content = authorName + " \"" + postTitle + "\" başlıklı yeni bir yazı paylaştı.";
                        
                        // Bildirim zaten var mı kontrol et
                        if (!NotificationExists(connection, userId, authorId, "new_post", postId))
                        {
                            // Bildirim oluştur
                            InsertNotification(connection, userId, authorId, "new_post", content, postId);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Takip edilen kişilerin gönderileri için bildirimler oluşturulamadı: " + ex.Message);
        }
    }
    
    // Bildirim zaten var mı kontrol et
    private static bool NotificationExists(SqlConnection connection, int userId, int senderId, string type, int? contentId)
    {
        string query = @"
            SELECT COUNT(*) FROM Notifications 
            WHERE UserID = @UserID AND SenderID = @SenderID AND NotificationType = @Type";
        
        // ContentID varsa kontrole ekle
        if (contentId.HasValue)
        {
            query += " AND ContentID = @ContentID";
        }
        
        using (SqlCommand command = new SqlCommand(query, connection))
        {
            command.Parameters.AddWithValue("@UserID", userId);
            command.Parameters.AddWithValue("@SenderID", senderId);
            command.Parameters.AddWithValue("@Type", type);
            
            if (contentId.HasValue)
            {
                command.Parameters.AddWithValue("@ContentID", contentId.Value);
            }
            
            int count = (int)command.ExecuteScalar();
            return count > 0;
        }
    }
    
    // Bildirim ekle
    private static void InsertNotification(SqlConnection connection, int userId, int senderId, string type, string content, int? contentId)
    {
        try
        {
            string query = @"
                INSERT INTO Notifications (UserID, SenderID, NotificationType, Content, ContentID, IsRead, CreatedAt)
                VALUES (@UserID, @SenderID, @Type, @Content, @ContentID, 0, GETDATE())";
            
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserID", userId);
                command.Parameters.AddWithValue("@SenderID", senderId);
                command.Parameters.AddWithValue("@Type", type);
                command.Parameters.AddWithValue("@Content", content);
                
                if (contentId.HasValue)
                {
                    command.Parameters.AddWithValue("@ContentID", contentId.Value);
                }
                else
                {
                    command.Parameters.AddWithValue("@ContentID", DBNull.Value);
                }
                
                command.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Bildirim eklenemedi: " + ex.Message);
        }
    }

    // Bildirimi okundu olarak işaretle
    [System.Web.Services.WebMethod]
    public static bool MarkNotificationAsRead(int notificationId)
    {
        try
        {
            // Veritabanı bağlantı stringi
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Bildirimi okundu olarak işaretle
                string query = "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@NotificationID", notificationId);
                    int affectedRows = command.ExecuteNonQuery();
                    
                    return affectedRows > 0;
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Bildirim işaretleme hatası: " + ex.Message);
            return false;
        }
    }
} 