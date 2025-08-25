using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Configuration;
using System.Web.Script.Serialization;
using System.Diagnostics;
using System.Web.Configuration;

public partial class UserPageForm : System.Web.UI.Page
{
    // Bağlantı string'i
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    // Görüntülenen kullanıcının ID'si
    protected string ViewedUserID;
    
    // Oturum açmış kullanıcının ID'si
    protected string CurrentUserID;
    
    // Kullanıcı profil verisi için sınıflar
    public class UserProfile
    {
        public string UserID { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Bio { get; set; }
        public string ProfilePhotoUrl { get; set; }
        public string CoverPhotoUrl { get; set; }
    }
    
    public class PasswordChange
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmPassword { get; set; }
    }

    // Veritabanında mevcut kullanıcı tablosunu ve alan adlarını tespit et
    private string userTableName = "Users";  // Varsayılan tablo adı
    private string userIdColumn = "UserID";  // Varsayılan ID sütunu
    private string usernameColumn = "Username";  // Varsayılan kullanıcı adı sütunu
    private string firstNameColumn = "FirstName";  // Varsayılan ad sütunu
    private string lastNameColumn = "LastName";  // Varsayılan soyad sütunu
    private string bioColumn = "Bio";  // Varsayılan bio sütunu
    private string profilePicColumn = "ProfilePicture";  // Varsayılan profil resmi sütunu
    private string coverPhotoColumn = "CoverPhoto";  // Varsayılan kapak resmi sütunu
    private string fullName = ""; // Profil adı için sınıf kapsamında değişken
    
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("\n====== PAGE_LOAD BASLADI ======");
            System.Diagnostics.Debug.WriteLine("IsPostBack: " + IsPostBack);
            
            // URL'den sorgu parametrelerini al
            string userIdParam = Request.QueryString["id"];
            
            // "undefined" kontrolü ekle
            if (userIdParam == "undefined")
            {
                System.Diagnostics.Debug.WriteLine("HATA: URL'de 'undefined' değeri bulundu");
                Response.Write("Sayfa yüklenirken bir hata oluştu: Conversion failed when converting the nvarchar value 'undefined' to data type int.");
                return;
            }
            
            // Veritabanı bağlantısı kontrolleri
            EnsureRequiredTables();
            
            // Sorgu string parametresi var mı kontrol et
            if (!string.IsNullOrEmpty(userIdParam))
            {
                ViewedUserID = userIdParam;
                System.Diagnostics.Debug.WriteLine("URL'den alınan kullanıcı ID'si: " + ViewedUserID);
            }
            else
            {
                // Kullanıcı Session'dan al (kendi profiliyse)
                if (Session["KullaniciID"] != null)
                {
                    ViewedUserID = Session["KullaniciID"].ToString();
                    System.Diagnostics.Debug.WriteLine("Session'dan alınan kullanıcı ID'si: " + ViewedUserID);
                }
                else
                {
                    // Hata durumu - hem URL'de id yok hem de session'da kullanıcı yok
                    System.Diagnostics.Debug.WriteLine("HATA: Kullanıcı ID'si bulunamadı! Ne URL'de ne Session'da var!");
                    Response.Redirect("~/default.aspx?error=usernotfound");
                    return;
                }
            }
            
            // CurrentUserID atama - giriş yapmış kullanıcı
                if (Session["KullaniciID"] != null)
                {
                    CurrentUserID = Session["KullaniciID"].ToString();
                System.Diagnostics.Debug.WriteLine("Giriş yapmış kullanıcı (CurrentUserID): " + CurrentUserID);
            }
            
            // Eğer kendi profili değilse
            bool isOwnProfile = (CurrentUserID == ViewedUserID);
            System.Diagnostics.Debug.WriteLine("Kendi profili mi? " + isOwnProfile);
                pnlOwnProfile.Visible = isOwnProfile;
                pnlOtherProfile.Visible = !isOwnProfile;
                
            if (!IsPostBack)
            {
                System.Diagnostics.Debug.WriteLine("İlk sayfa yüklemesi, kullanıcı verilerini yükle");
                
                // 1. Profil bilgilerini yükle
                LoadUserProfile();
                
                // 2. Kullanıcı takip durumunu kontrol et (kendi profili değilse)
                if (!isOwnProfile && !string.IsNullOrEmpty(CurrentUserID))
                {
                    CheckFollowStatus();
                }
                
                // 3. Mesajları kontrol et
                CheckForMessages();
            }
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Takipçi ve takip edilen sayılarını doğrudan HTML'e ekle
                string followerCountSql = "SELECT COUNT(*) FROM Followers WHERE FollowingUserID = @UserID";
                using (SqlCommand cmd = new SqlCommand(followerCountSql, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                    int followerCount = (int)cmd.ExecuteScalar();
                    ltlFollowerCount.Text = followerCount.ToString();
                }
                
                string followingCountSql = "SELECT COUNT(*) FROM Followers WHERE FollowerID = @UserID";
                using (SqlCommand cmd = new SqlCommand(followingCountSql, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                    int followingCount = (int)cmd.ExecuteScalar();
                    ltlFollowingCount.Text = followingCount.ToString();
                }
                
                // Post sayısını güncelle
                string postCountSql = "SELECT COUNT(*) FROM Posts WHERE UserID = @UserID AND ApprovalStatus = 1";
                using (SqlCommand cmd = new SqlCommand(postCountSql, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                    int postCount = (int)cmd.ExecuteScalar();
                    ltlPostCount.Text = postCount.ToString();
                }
            }
            
            RegisterUserInfoScript();
            
            System.Diagnostics.Debug.WriteLine("====== PAGE_LOAD TAMAMLANDI ======\n");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("PAGE_LOAD HATASI: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata ayrıntısı: " + ex.StackTrace);
            Response.Write("Sayfa yüklenirken bir hata oluştu: " + ex.Message);
        }
    }

    // Mesaj kontrol fonksiyonu
    private void CheckForMessages()
    {
        // Hata mesajı varsa göster ve temizle
        if (Session["ErrorMessage"] != null)
        {
            string errorMsg = Session["ErrorMessage"].ToString();
            ScriptManager.RegisterStartupScript(this, GetType(), "ErrorMessage", 
                "showErrorMessage('" + errorMsg + "');", true);
            
            // Mesajı temizle
            Session.Remove("ErrorMessage");
        }
        
        // Başarı mesajı varsa göster ve temizle
        if (Session["SuccessMessage"] != null)
        {
            string successMsg = Session["SuccessMessage"].ToString();
            ScriptManager.RegisterStartupScript(this, GetType(), "SuccessMessage", 
                "showSuccessMessage('" + successMsg + "');", true);
            
            // Mesajı temizle
            Session.Remove("SuccessMessage");
        }
    }

    // Kullanıcı profilini yükleme
    protected void LoadUserProfile()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("LoadUserProfile metodu çağrıldı - ViewedUserID: " + ViewedUserID);
            if (string.IsNullOrEmpty(ViewedUserID))
            {
                System.Diagnostics.Debug.WriteLine("HATA: ViewedUserID boş veya null!");
                return;
            }
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                // 1. Kullanıcı ana bilgilerini çek (Users tablosu)
                    string userSql = "SELECT * FROM Users WHERE UserID = @UserID";
                    using (SqlCommand cmd = new SqlCommand(userSql, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            // Profil fotoğrafını yükle
                            string profilePhotoPath = reader["ProfilePicture"] != DBNull.Value ? reader["ProfilePicture"].ToString() : "";
                            
                            System.Diagnostics.Debug.WriteLine("Veritabanından alınan profil fotoğrafı yolu: " + profilePhotoPath);
                            
                            // Profil fotoğrafı yolunu temizle ve kontrol etme
                            if (!string.IsNullOrEmpty(profilePhotoPath))
                            {
                                // Tam yol kontrolü
                                string physicalPath;
                                if (profilePhotoPath.StartsWith("~/"))
                                {
                                    physicalPath = Server.MapPath(profilePhotoPath);
                                }
                                else if (profilePhotoPath.StartsWith("/"))
                                {
                                    physicalPath = Server.MapPath("~" + profilePhotoPath);
                                }
                                else
                                {
                                    physicalPath = Server.MapPath("~/" + profilePhotoPath);
                                }
                                
                                // Dosya var mı kontrolü
                                bool fileExists = System.IO.File.Exists(physicalPath);
                                System.Diagnostics.Debug.WriteLine("Dosya fiziksel olarak var mı: " + fileExists + " - Yol: " + physicalPath);
                                
                                if (fileExists)
                                {
                                    // Önbellek engelleme parametresi ekle
                                    string cacheBuster = "?v=" + DateTime.Now.Ticks;
                                    imgProfilePhoto.ImageUrl = profilePhotoPath.StartsWith("/") ? profilePhotoPath + cacheBuster : "/" + profilePhotoPath + cacheBuster;
                                    System.Diagnostics.Debug.WriteLine("Profil fotoğrafı yüklendi: " + imgProfilePhoto.ImageUrl);
                                }
                                else
                                {
                                    // Dosya bulunamadıysa varsayılan profil fotoğrafını göster
                                    imgProfilePhoto.ImageUrl = "/assets/img/default-profile.png";
                                    System.Diagnostics.Debug.WriteLine("Profil fotoğrafı dosyası bulunamadı, varsayılan resim gösteriliyor");
                                }
                            }
                            else
                            {
                                // Yol boşsa varsayılan profil fotoğrafını göster
                                imgProfilePhoto.ImageUrl = "/assets/img/default-profile.png";
                                System.Diagnostics.Debug.WriteLine("Profil fotoğrafı yolu boş, varsayılan resim gösteriliyor");
                            }
                            
                            string username = reader["Username"] != DBNull.Value ? reader["Username"].ToString() : "";
                                ltlUsername.Text = "<span class='username'>@" + username + "</span>";
                                lblKullaniciAdi.Text = "@" + username;
                            }
                        else
                        {
                            // Kullanıcı bulunamadıysa varsayılan profil fotoğrafını göster
                            imgProfilePhoto.ImageUrl = "/assets/img/default-profile.png";
                            System.Diagnostics.Debug.WriteLine("Profil bulunamadı, varsayılan resim gösteriliyor");
                        }
                                }
                    }
                    
                // 2. Kullanıcı profil bilgilerini çek (UserProfiles tablosu)
                    string profileSql = "SELECT * FROM UserProfiles WHERE UserID = @UserID";
                    using (SqlCommand cmd = new SqlCommand(profileSql, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                            string firstName = reader["FirstName"] != DBNull.Value ? reader["FirstName"].ToString() : "";
                            string lastName = reader["LastName"] != DBNull.Value ? reader["LastName"].ToString() : "";
                            string bio = reader["Bio"] != DBNull.Value ? reader["Bio"].ToString() : "";
                            string fullName = (firstName + " " + lastName).Trim();
                            ltlFullName.Text = !string.IsNullOrEmpty(fullName) ? fullName : lblKullaniciAdi.Text;
                            lblAdSoyad.Text = !string.IsNullOrEmpty(fullName) ? fullName : lblKullaniciAdi.Text;
                                ltlBio.Text = bio;
                                ltlFullBioContent.Text = bio;
                                lblBio.Text = bio;
                                txtUsername.Text = lblKullaniciAdi.Text.TrimStart('@');
                                txtFirstName.Text = firstName;
                                txtLastName.Text = lastName;
                                txtBio.Text = bio;
                                }
                                else
                                {
                            ltlFullName.Text = lblKullaniciAdi.Text;
                                lblAdSoyad.Text = lblKullaniciAdi.Text;
                                ltlBio.Text = "Henüz biyografi eklenmemiş.";
                                lblBio.Text = "Henüz biyografi eklenmemiş.";
                            }
                        }
                    }
                    LoadUserStats(conn);
                    CheckFollowStatus();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("LoadUserProfile hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata ayrıntısı: " + ex.StackTrace);
            ShowErrorMessage("Kullanıcı profili yüklenirken hata oluştu: " + ex.Message);
        }
        LoadUserPosts();
        LoadComments();
        LoadLikes();
        RegisterUserInfoScript();
    }
    
    // Kullanıcı istatistiklerini yükleme
    private void LoadUserStats(SqlConnection conn)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("LoadUserStats metodu çağrıldı");
            // Yazı sayısı
            string postCountSql = "SELECT COUNT(*) FROM Posts WHERE UserID = @UserID AND IsApproved = 1";
            int postCount = 0;
            using (SqlCommand cmd = new SqlCommand(postCountSql, conn))
            {
                cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                postCount = (int)cmd.ExecuteScalar();
                // lblPostCount yerine JavaScript ile güncelleme yapalım
                System.Diagnostics.Debug.WriteLine("Yazı sayısı: " + postCount);
            }
            
            // Silinen yazı sayısı
            string deletedPostCountSql = "SELECT COUNT(*) FROM Posts WHERE UserID = @UserID AND IsDeleted = 1";
            int deletedPostCount = 0;
            using (SqlCommand cmd = new SqlCommand(deletedPostCountSql, conn))
            {
                cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                deletedPostCount = (int)cmd.ExecuteScalar();
                // lblDeletedPostCount yerine JavaScript ile güncelleme yapalım
                System.Diagnostics.Debug.WriteLine("Silinen yazı sayısı: " + deletedPostCount);
            }
            
            // Takipçi sayısı
            string followerCountSql = "SELECT COUNT(*) FROM Followers WHERE FollowingUserID = @UserID";
            int followerCount = 0;
            using (SqlCommand cmd = new SqlCommand(followerCountSql, conn))
            {
                cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                followerCount = (int)cmd.ExecuteScalar();
                // lblFollowerCount yerine JavaScript ile güncelleme yapalım
                System.Diagnostics.Debug.WriteLine("Takipçi sayısı: " + followerCount);
            }
            
            // Takip edilen sayısı
            string followingCountSql = "SELECT COUNT(*) FROM Followers WHERE FollowerID = @UserID";
            int followingCount = 0;
            using (SqlCommand cmd = new SqlCommand(followingCountSql, conn))
            {
                cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                followingCount = (int)cmd.ExecuteScalar();
                // lblFollowingCount yerine JavaScript ile güncelleme yapalım
                System.Diagnostics.Debug.WriteLine("Takip edilen sayısı: " + followingCount);
            }
            
            // İstatistik değerlerini sayfa yüklendikten sonra JavaScript ile güncelleyelim
            string updateStatsScript = @"
                <script type='text/javascript'>
                    $(document).ready(function() {
                        // İstatistik değerlerini güncelle
                        $('#postCountValue').text('" + postCount + @"');
                        $('#deletedPostCountValue').text('" + deletedPostCount + @"');
                        $('#followerCountValue').text('" + followerCount + @"');
                        $('#followingCountValue').text('" + followingCount + @"');
                        
                        console.log('İstatistikler güncellendi: Yazı: " + postCount + @", Takipçi: " + followerCount + @", Takip Edilen: " + followingCount + @"');
                    });
                </script>";
            
            ClientScript.RegisterStartupScript(this.GetType(), "UpdateStats", updateStatsScript);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("LoadUserStats hatası: " + ex.Message);
            // Hatayı sessizce işle, kullanıcıya gösterme
        }
    }

    // Kullanıcı yorumlarını yükleme
    protected void LoadComments()
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Önce tablonun var olup olmadığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comments'";
                using (SqlCommand checkCmd = new SqlCommand(checkTableQuery, conn))
                {
                    int tableExists = (int)checkCmd.ExecuteScalar();
                    
                    if (tableExists == 0)
                    {
                        System.Diagnostics.Debug.WriteLine("Comments tablosu mevcut değil!");
                        pnlNoComments.Visible = true;
                        return;
                    }
                }
                
                // Ardından IsApproved sütununu kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
                bool isApprovedColumnExists = false;
                using (SqlCommand checkColCmd = new SqlCommand(checkColumnQuery, conn))
                {
                    int columnExists = (int)checkColCmd.ExecuteScalar();
                    isApprovedColumnExists = (columnExists > 0);
                    
                    if (!isApprovedColumnExists)
                    {
                        System.Diagnostics.Debug.WriteLine("IsApproved sütunu mevcut değil!");
                        // IsApproved sütununu ekle - varsayılan değer 1 (onaylı)
                        string addColumnQuery = "ALTER TABLE Comments ADD IsApproved BIT DEFAULT 1";
                        using (SqlCommand addColCmd = new SqlCommand(addColumnQuery, conn))
                        {
                            addColCmd.ExecuteNonQuery();
                            System.Diagnostics.Debug.WriteLine("IsApproved sütunu eklendi (varsayılan: onaylı)");
                            isApprovedColumnExists = true;
                        }
                    }
                }
                
                // SQL sorgusunu, yorumları ve ilgili post başlıklarını getirmek için güncelledim
                string sql;
                if (isApprovedColumnExists)
                {
                    sql = @"
                        SELECT c.CommentID, c.PostID, c.UserID, c.CommentText, c.CreatedAt as CommentDate, p.Title AS PostTitle, c.IsApproved
                        FROM Comments c
                        INNER JOIN Posts p ON c.PostID = p.PostID
                        WHERE c.UserID = @UserID AND c.IsApproved = 1
                        ORDER BY c.CreatedAt DESC";
                }
                else
                {
                    sql = @"
                        SELECT c.CommentID, c.PostID, c.UserID, c.CommentText, c.CreatedAt as CommentDate, p.Title AS PostTitle
                        FROM Comments c
                        INNER JOIN Posts p ON c.PostID = p.PostID
                        WHERE c.UserID = @UserID 
                        ORDER BY c.CreatedAt DESC";
                }
                
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                
                SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();
                adapter.Fill(dt);
                
                if (dt.Rows.Count > 0)
                {
                    rptComments.DataSource = dt;
                    rptComments.DataBind();
                    pnlNoComments.Visible = false;
                    
                    // Debug için
                    System.Diagnostics.Debug.WriteLine("Yüklenen yorum sayısı: " + dt.Rows.Count);
                    foreach (DataRow row in dt.Rows)
                    {
                        System.Diagnostics.Debug.WriteLine("Yorum ID: " + row["CommentID"] + ", Text: " + row["CommentText"]);
                    }
                    
                    // JavaScript ile debug ekleme
                    ClientScript.RegisterStartupScript(this.GetType(), "CommentLoadDebug", 
                        string.Format("console.log('Yorumlar yüklendi: {0} yorum bulundu');", dt.Rows.Count), true);
                        }
                        else
                        {
                    pnlNoComments.Visible = true;
                    ClientScript.RegisterStartupScript(this.GetType(), "CommentLoadDebug",
                        "console.log('Hiç yorum bulunamadı');", true);
                    }
                }
            }
            catch (Exception ex)
            {
            // Hata durumunda konsola kaydet
            System.Diagnostics.Debug.WriteLine("Yorumlar yüklenemedi: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
            ClientScript.RegisterStartupScript(this.GetType(), "ErrorDebug", 
                string.Format("console.error('Yorumları yüklerken hata: {0}');", ex.Message), true);
            pnlNoComments.Visible = true;
        }
        
        // Metot sonuna ekleniyor - JavaScript bilgileri güncelle
        RegisterUserInfoScript();
    }
    
    // Kullanıcı beğenilerini yükleme
    protected void LoadLikes()
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Önce tablonun var olup olmadığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Likes'";
                using (SqlCommand checkCmd = new SqlCommand(checkTableQuery, conn))
                {
                    int tableExists = (int)checkCmd.ExecuteScalar();
                    
                    if (tableExists == 0)
                    {
                        System.Diagnostics.Debug.WriteLine("Likes tablosu mevcut değil!");
                        pnlNoLikes.Visible = true;
                        return;
                    }
                }
                
                // SQL sorgusunu, beğenileri ve ilgili post bilgilerini getirmek için güncelledim
                string sql = @"
                    SELECT l.LikeID, l.PostID, l.UserID, l.CreatedAt AS LikeDate, p.Title AS PostTitle,
                           SUBSTRING(p.Content, 1, 100) + '...' AS PostSummary
                    FROM Likes l
                    INNER JOIN Posts p ON l.PostID = p.PostID
                    WHERE l.UserID = @UserID
                    ORDER BY l.CreatedAt DESC";
                
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                
                SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();
                adapter.Fill(dt);
                
                if (dt.Rows.Count > 0)
                {
                    rptLikes.DataSource = dt;
                    rptLikes.DataBind();
                    pnlNoLikes.Visible = false;
                    
                    // Debug için
                    System.Diagnostics.Debug.WriteLine("Yüklenen beğeni sayısı: " + dt.Rows.Count);
                    foreach (DataRow row in dt.Rows)
                    {
                        System.Diagnostics.Debug.WriteLine("Beğeni ID: " + row["LikeID"] + ", Post ID: " + row["PostID"]);
                    }
                    
                    // JavaScript ile debug ekleme
                    ClientScript.RegisterStartupScript(this.GetType(), "LikeLoadDebug", 
                        string.Format("console.log('Beğeniler yüklendi: {0} beğeni bulundu');", dt.Rows.Count), true);
                }
                else
                {
                    pnlNoLikes.Visible = true;
                    ClientScript.RegisterStartupScript(this.GetType(), "LikeLoadDebug",
                        "console.log('Hiç beğeni bulunamadı');", true);
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda konsola kaydet
            System.Diagnostics.Debug.WriteLine("Beğeniler yüklenemedi: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
            ClientScript.RegisterStartupScript(this.GetType(), "ErrorDebug", 
                string.Format("console.error('Beğenileri yüklerken hata: {0}');", ex.Message), true);
            pnlNoLikes.Visible = true;
        }
        
        // Metot sonuna ekleniyor - JavaScript bilgileri güncelle
        RegisterUserInfoScript();
    }

    // Gerekli tabloları oluşturma
    private void EnsureRequiredTables()
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                Debug.WriteLine("EnsureRequiredTables: Connection opened successfully");

                // Comments tablosunu kontrol et ve oluştur
                bool commentsExists = CheckTableExists(conn, "Comments");
                Debug.WriteLine("Comments table exists: " + commentsExists);
                
                if (!commentsExists)
                {
                    string createCommentsTable = @"
                        CREATE TABLE Comments (
                            CommentID INT IDENTITY(1,1) PRIMARY KEY,
                            BlogID INT NOT NULL,
                            UserID INT NOT NULL,
                            CommentText NVARCHAR(MAX) NOT NULL,
                            CreatedAt DATETIME DEFAULT GETDATE(),
                            IsApproved BIT DEFAULT 1,
                            CONSTRAINT FK_Comments_Bloglar FOREIGN KEY (BlogID) REFERENCES Bloglar(BlogID),
                            CONSTRAINT FK_Comments_Users FOREIGN KEY (UserID) REFERENCES Users(UserID)
                        )";
                    
                    using (SqlCommand cmd = new SqlCommand(createCommentsTable, conn))
                    {
                        cmd.ExecuteNonQuery();
                        Debug.WriteLine("Comments tablosu oluşturuldu.");
                    }
                }

                // Likes tablosunu kontrol et ve oluştur
                bool likesExists = CheckTableExists(conn, "Likes");
                Debug.WriteLine("Likes table exists: " + likesExists);
                
                if (!likesExists)
                {
                    string createLikesTable = @"
                        CREATE TABLE Likes (
                            LikeID INT IDENTITY(1,1) PRIMARY KEY,
                            BlogID INT NOT NULL,
                            UserID INT NOT NULL,
                            CreatedAt DATETIME DEFAULT GETDATE(),
                            CONSTRAINT FK_Likes_Bloglar FOREIGN KEY (BlogID) REFERENCES Bloglar(BlogID),
                            CONSTRAINT FK_Likes_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
                            CONSTRAINT UQ_Likes UNIQUE (BlogID, UserID)
                        )";
                    
                    using (SqlCommand cmd = new SqlCommand(createLikesTable, conn))
                    {
                        cmd.ExecuteNonQuery();
                        Debug.WriteLine("Likes tablosu oluşturuldu.");
                    }
                }

                // Followers tablosunu kontrol et ve oluştur
                bool followersExists = CheckTableExists(conn, "Followers");
                Debug.WriteLine("Followers table exists: " + followersExists);
                
                if (!followersExists)
                {
                    string createFollowersTable = @"
                        CREATE TABLE Followers (
                            ID INT IDENTITY(1,1) PRIMARY KEY,
                            FollowerID INT NOT NULL,
                            FollowingUserID INT NOT NULL,
                            FollowDate DATETIME DEFAULT GETDATE(),
                            CONSTRAINT UC_Follower UNIQUE (FollowerID, FollowingUserID)
                        )";
                    
                    using (SqlCommand cmd = new SqlCommand(createFollowersTable, conn))
                    {
                        cmd.ExecuteNonQuery();
                        Debug.WriteLine("Followers tablosu oluşturuldu.");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("EnsureRequiredTables Error: " + ex.Message);
            Debug.WriteLine("Exception Stack Trace: " + ex.StackTrace);
            // Sadece loglama yap, sayfanın yüklenmesini engelleme
        }
    }

    private bool CheckTableExists(SqlConnection conn, string tableName)
    {
        string query = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @TableName";
        using (SqlCommand cmd = new SqlCommand(query, conn))
        {
            cmd.Parameters.AddWithValue("@TableName", tableName);
            return (int)cmd.ExecuteScalar() > 0;
        }
    }

    private void CheckFollowStatus()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("\n======= TAKIP DURUMU KONTROL EDILIYOR =======");
            System.Diagnostics.Debug.WriteLine("CurrentUserID: " + (CurrentUserID ?? "NULL"));
            System.Diagnostics.Debug.WriteLine("ViewedUserID: " + (ViewedUserID ?? "NULL"));
            
            // Giriş yapmamış kullanıcı veya kendi profilini görüntülüyorsa işlem yapma
            if (string.IsNullOrEmpty(CurrentUserID))
            {
                System.Diagnostics.Debug.WriteLine("Takip durumu kontrol edilmiyor: Kullanıcı giriş yapmamış");
                pnlOtherProfile.Visible = false;
                return;
            }
            
            if (CurrentUserID == ViewedUserID)
            {
                System.Diagnostics.Debug.WriteLine("Takip durumu kontrol edilmiyor: Kendi profili");
                pnlOtherProfile.Visible = false;
                return;
            }
            
            // Diğer kullanıcının profilini görüntülediği için takip butonunu gösterecek
            pnlOtherProfile.Visible = true;
            System.Diagnostics.Debug.WriteLine("Takip butonu görünür yapıldı - diğer kullanıcının profili");
                
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı açıldı - takip durumu kontrol ediliyor");
                
                // Followers tablosunun var olup olmadığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Followers'";
                int tableExists = 0;
                
                using (SqlCommand cmd = new SqlCommand(checkTableQuery, conn))
                {
                    tableExists = (int)cmd.ExecuteScalar();
                }
                
                if (tableExists == 0)
                {
                    System.Diagnostics.Debug.WriteLine("Followers tablosu bulunamadı - oluşturuluyor");
                    
                    // Tablo yoksa oluştur
                    string createTableQuery = @"CREATE TABLE Followers (
                        ID INT IDENTITY(1,1) PRIMARY KEY,
                        FollowerID INT NOT NULL,
                        FollowingUserID INT NOT NULL,
                        FollowDate DATETIME DEFAULT GETDATE(),
                        CONSTRAINT UC_Follower UNIQUE (FollowerID, FollowingUserID)
                    )";
                    SqlCommand createTableCommand = new SqlCommand(createTableQuery, conn);
                    createTableCommand.ExecuteNonQuery();
                    System.Diagnostics.Debug.WriteLine("Followers tablosu oluşturuldu");
                    
                    // Yeni tablo oluşturuldu, takip edilmiyor
                    btnFollow.Text = "Takip Et";
                    return;
                }
                
                // Takip durumunu kontrol et
                string query = "SELECT COUNT(*) FROM Followers WHERE FollowerID = @FollowerID AND FollowingUserID = @FollowingUserID";
                int followCount = 0;
                
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                    cmd.Parameters.AddWithValue("@FollowerID", CurrentUserID);
                    cmd.Parameters.AddWithValue("@FollowingUserID", ViewedUserID);
                        
                    followCount = (int)cmd.ExecuteScalar();
                        
                    // Takip durumuna göre buton metnini ayarla
                    if (followCount > 0)
                        {
                        btnFollow.Text = "Takibi Bırak";
                        System.Diagnostics.Debug.WriteLine("Takip durumu: Takip ediliyor (" + followCount + " kayıt bulundu)");
                        }
                        else
                        {
                        btnFollow.Text = "Takip Et";
                        System.Diagnostics.Debug.WriteLine("Takip durumu: Takip edilmiyor (0 kayıt)");
                    }
                }
            }
            
            System.Diagnostics.Debug.WriteLine("Takip durumu kontrolü tamamlandı - Buton metni: " + btnFollow.Text);
            System.Diagnostics.Debug.WriteLine("============================================\n");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Takip durumu kontrolünde hata: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata ayrıntısı: " + ex.StackTrace);
            
            // Hata durumunda varsayılan olarak takip etme butonu göster
            if (pnlOtherProfile.Visible)
            {
                btnFollow.Text = "Takip Et";
            }
        }
    }

    protected void btnFollow_Click(object sender, EventArgs e)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("\n======= TAKIP ISLEMI BASLATIYLDI =======");
            
            // Session'dan kullanıcı ID'sini yeniden al (her zaman en güncel değeri kullanmak için)
            string currentUser = null;
            if (Session["KullaniciID"] != null)
            {
                currentUser = Session["KullaniciID"].ToString();
                CurrentUserID = currentUser; // Sınıf üyesi değişkeni de güncelle
                System.Diagnostics.Debug.WriteLine("CurrentUserID Session'dan güncellendi: " + CurrentUserID);
            }
            
            // Oturum kontrolü
            if (string.IsNullOrEmpty(currentUser) || Session["KullaniciID"] == null)
            {
                System.Diagnostics.Debug.WriteLine("HATA: Kullanıcı giriş yapmamış (Session[KullaniciID] = " + 
                    (Session["KullaniciID"] != null ? Session["KullaniciID"].ToString() : "NULL") + ")");
                ShowErrorMessage("Bu işlemi gerçekleştirmek için giriş yapmalısınız.");
                    return;
                }
            
            // Görüntülenen profil ID kontrolü
            if (string.IsNullOrEmpty(ViewedUserID))
            {
                System.Diagnostics.Debug.WriteLine("HATA: Görüntülenen kullanıcı ID'si bulunamadı");
                ShowErrorMessage("İşlem yapılacak kullanıcı profili bulunamadı.");
                return;
            }
            
            // Kendi profilini takip etmeye çalışıyorsa engelle
            if (currentUser == ViewedUserID)
            {
                System.Diagnostics.Debug.WriteLine("HATA: Kullanıcı kendi profilini takip etmeye çalışıyor");
                ShowErrorMessage("Kendinizi takip edemezsiniz.");
                return;
            }
            
            System.Diagnostics.Debug.WriteLine("Takip işlemi için parametreler:");
            System.Diagnostics.Debug.WriteLine("Takip eden (CurrentUser): " + currentUser);
            System.Diagnostics.Debug.WriteLine("Takip edilen (ViewedUser): " + ViewedUserID);
                
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı açıldı");
                
                // 1. ADIM: Followers tablosu var mı kontrol et, yoksa oluştur
                EnsureFollowersTable(conn);
                
                // 2. ADIM: Mevcut takip durumunu kontrol et
                bool isFollowing = CheckIfFollowing(conn, currentUser, ViewedUserID);
                System.Diagnostics.Debug.WriteLine("Mevcut takip durumu: " + (isFollowing ? "Takip ediliyor" : "Takip edilmiyor"));
                
                // 3. ADIM: Takip durumuna göre işlem yap
                if (isFollowing)
                {
                    // Takibi bırak
                    UnfollowUser(conn, currentUser, ViewedUserID);
                }
                else
                {
                    // Takip et
                    FollowUser(conn, currentUser, ViewedUserID);
                }
                
                // 4. ADIM: Takipçi istatistiklerini güncelle
                // Takipçi sayısını güncelle 
                string followerCountSql = "SELECT COUNT(*) FROM Followers WHERE FollowingUserID = @UserID";
                using (SqlCommand cmd = new SqlCommand(followerCountSql, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                    int followerCount = (int)cmd.ExecuteScalar();
                    ltlFollowerCount.Text = followerCount.ToString();
                    System.Diagnostics.Debug.WriteLine("Güncel takipçi sayısı: " + followerCount);
                }
                
                // Takip edilen sayısını güncelle
                string followingCountSql = "SELECT COUNT(*) FROM Followers WHERE FollowerID = @UserID";
                using (SqlCommand cmd = new SqlCommand(followingCountSql, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                    int followingCount = (int)cmd.ExecuteScalar();
                    ltlFollowingCount.Text = followingCount.ToString();
                    System.Diagnostics.Debug.WriteLine("Güncel takip edilen sayısı: " + followingCount);
                }
                
                // 5. ADIM: Son takip durumunu kontrol et ve doğrula
                bool finalFollowStatus = CheckIfFollowing(conn, currentUser, ViewedUserID);
                System.Diagnostics.Debug.WriteLine("Son takip durumu: " + (finalFollowStatus ? "Takip ediliyor" : "Takip edilmiyor"));
                
                // 6. ADIM: Buton metnini ayarla
                btnFollow.Text = finalFollowStatus ? "Takibi Bırak" : "Takip Et";
            }
            
            // JavaScript ile sayfa üzerindeki değerleri güncelle
            string scriptUpdate = @"
                <script type='text/javascript'>
                    $(document).ready(function() {
                        // Takipçi ve takip edilen sayılarını güncelle
                        $('#followerCountValue').text('" + ltlFollowerCount.Text + @"');
                        $('#followingCountValue').text('" + ltlFollowingCount.Text + @"');
                        
                        // Buton metnini güncelle
                        $('#" + btnFollow.ClientID + @"').text('" + btnFollow.Text + @"');
                        
                        console.log('Takipçi/takip edilen sayıları güncellendi: Takipçi: " + ltlFollowerCount.Text + @", Takip Edilen: " + ltlFollowingCount.Text + @"');
                    });
                </script>";
            
            ClientScript.RegisterStartupScript(this.GetType(), "UpdateFollowStats", scriptUpdate);
            
            System.Diagnostics.Debug.WriteLine("Takip işlemi başarıyla tamamlandı. Buton metni: " + btnFollow.Text);
            System.Diagnostics.Debug.WriteLine("======= TAKIP ISLEMI TAMAMLANDI =======\n");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Takip işleminde hata: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
            ShowErrorMessage("Takip işlemi sırasında bir hata oluştu: " + ex.Message);
        }
    }

    // Followers tablosunun var olduğundan emin ol
    private void EnsureFollowersTable(SqlConnection conn)
    {
        try
        {
                    string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Followers'";
            int tableExists = 0;
                    
                    using (SqlCommand cmd = new SqlCommand(checkTableQuery, conn))
                    {
                tableExists = (int)cmd.ExecuteScalar();
            }
            
            if (tableExists == 0)
            {
                System.Diagnostics.Debug.WriteLine("Followers tablosu bulunamadı, oluşturuluyor...");
                
                string createTableQuery = @"CREATE TABLE Followers (
                            ID INT IDENTITY(1,1) PRIMARY KEY,
                            FollowerID INT NOT NULL,
                            FollowingUserID INT NOT NULL,
                            FollowDate DATETIME DEFAULT GETDATE(),
                            CONSTRAINT UC_Follower UNIQUE (FollowerID, FollowingUserID)
                        )";
                        
                        using (SqlCommand cmd = new SqlCommand(createTableQuery, conn))
                        {
                            cmd.ExecuteNonQuery();
                    System.Diagnostics.Debug.WriteLine("Followers tablosu başarıyla oluşturuldu");
                        }
                    }
                }
                catch (Exception ex)
                {
            System.Diagnostics.Debug.WriteLine("Followers tablosu oluşturulurken hata: " + ex.Message);
            throw; // Hatayı yukarı ilet
        }
    }

    // Kullanıcının takip edip etmediğini kontrol et
    private bool CheckIfFollowing(SqlConnection conn, string followerId, string followingId)
    {
        try
        {
                string checkQuery = "SELECT COUNT(*) FROM Followers WHERE FollowerID = @FollowerID AND FollowingUserID = @FollowingUserID";
                
                using (SqlCommand cmd = new SqlCommand(checkQuery, conn))
                {
                cmd.Parameters.AddWithValue("@FollowerID", followerId);
                cmd.Parameters.AddWithValue("@FollowingUserID", followingId);
                
                int count = (int)cmd.ExecuteScalar();
                return count > 0;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Takip durumu kontrolünde hata: " + ex.Message);
            throw; // Hatayı yukarı ilet
        }
    }

    // Kullanıcıyı takip et
    private void FollowUser(SqlConnection conn, string followerId, string followingId)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("Kullanıcı takip ediliyor...");
            
            string insertQuery = "INSERT INTO Followers (FollowerID, FollowingUserID, FollowDate) VALUES (@FollowerID, @FollowingUserID, GETDATE())";
            
            using (SqlCommand cmd = new SqlCommand(insertQuery, conn))
            {
                cmd.Parameters.AddWithValue("@FollowerID", followerId);
                cmd.Parameters.AddWithValue("@FollowingUserID", followingId);
                        
                        int rowsAffected = cmd.ExecuteNonQuery();
                System.Diagnostics.Debug.WriteLine("Takip işlemi tamamlandı. Etkilenen satır: " + rowsAffected);
                
                if (rowsAffected > 0)
                {
                    // Takip bildirimi gönder
                    SendFollowNotification(conn, followerId, followingId);
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("UYARI: Takip işlemi başarısız - satır eklenmedi");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Kullanıcı takip edilirken hata: " + ex.Message);
            throw; // Hatayı yukarı ilet
        }
    }
    
    private void SendFollowNotification(SqlConnection conn, string followerId, string followingId)
    {
        try
        {
            // Takip eden kullanıcının adını al
            string followerNameQuery = "SELECT Username FROM Users WHERE UserID = @UserID";
            using (SqlCommand nameCommand = new SqlCommand(followerNameQuery, conn))
            {
                nameCommand.Parameters.AddWithValue("@UserID", followerId);
                object nameResult = nameCommand.ExecuteScalar();
                string followerName = nameResult != null ? nameResult.ToString() : "Bilinmeyen Kullanıcı";
                
                // Bildirim içeriği oluştur
                string notificationContent = followerName + " sizi takip etmeye başladı.";
                
                // Notifications tablosunun varlığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications'";
                using (SqlCommand checkCommand = new SqlCommand(checkTableQuery, conn))
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
                                FOREIGN KEY (UserID) REFERENCES Users(UserID),
                                FOREIGN KEY (SenderID) REFERENCES Users(UserID)
                            )";
                        
                        using (SqlCommand createCommand = new SqlCommand(createTableQuery, conn))
                        {
                            createCommand.ExecuteNonQuery();
                            System.Diagnostics.Debug.WriteLine("Notifications tablosu oluşturuldu");
                        }
                    }
                }
                
                // Veritabanına bildirim ekle
                string insertNotificationQuery = @"
                    INSERT INTO Notifications (UserID, SenderID, NotificationType, Content, ContentID, CreatedAt)
                    VALUES (@UserID, @SenderID, @Type, @Content, @ContentID, GETDATE())";
                
                using (SqlCommand notifCommand = new SqlCommand(insertNotificationQuery, conn))
                {
                    notifCommand.Parameters.AddWithValue("@UserID", followingId);
                    notifCommand.Parameters.AddWithValue("@SenderID", followerId);
                    notifCommand.Parameters.AddWithValue("@Type", "follow");
                    notifCommand.Parameters.AddWithValue("@Content", notificationContent);
                    notifCommand.Parameters.AddWithValue("@ContentID", DBNull.Value); // Takip için ContentID yok
                    
                    notifCommand.ExecuteNonQuery();
                    System.Diagnostics.Debug.WriteLine("Takip bildirimi veritabanına eklendi: " + notificationContent);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Takip bildirimi gönderme hatası: " + ex.Message);
        }
    }

    // Kullanıcı takibini bırak
    private void UnfollowUser(SqlConnection conn, string followerId, string followingId)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("Kullanıcı takibi bırakılıyor...");
            
            string deleteQuery = "DELETE FROM Followers WHERE FollowerID = @FollowerID AND FollowingUserID = @FollowingUserID";
            
            using (SqlCommand cmd = new SqlCommand(deleteQuery, conn))
            {
                cmd.Parameters.AddWithValue("@FollowerID", followerId);
                cmd.Parameters.AddWithValue("@FollowingUserID", followingId);
                        
                        int rowsAffected = cmd.ExecuteNonQuery();
                System.Diagnostics.Debug.WriteLine("Takibi bırakma işlemi tamamlandı. Etkilenen satır: " + rowsAffected);
                
                if (rowsAffected <= 0)
                {
                    System.Diagnostics.Debug.WriteLine("UYARI: Takibi bırakma işlemi başarısız - satır silinmedi");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Kullanıcı takibi bırakılırken hata: " + ex.Message);
            throw; // Hatayı yukarı ilet
        }
    }

    // Profili kaydet
    protected void btnSaveProfile_Click(object sender, EventArgs e)
    {
        // Debug loglaması
        System.Diagnostics.Debug.WriteLine("===== PROFİL GÜNCELLEME BAŞLADI =====");
        try
        {
            // Oturum kontrolü
            if (Session["KullaniciID"] == null)
            {
                System.Diagnostics.Debug.WriteLine("Kullanıcı oturumu bulunamadı, güncelleme iptal edildi.");
                ShowErrorMessage("Profil güncellemek için giriş yapmalısınız.");
                        return;
            }
            string userID = Session["KullaniciID"].ToString();
            string connStr = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            
            // PROFİL FOTOĞRAFI YÜKLEME VE KAYDETME
            if (fileProfilePhoto.HasFile)
            {
                System.Diagnostics.Debug.WriteLine("fileProfilePhoto.HasFile: TRUE - Dosya seçilmiş.");
                System.Diagnostics.Debug.WriteLine("Dosya adı: " + fileProfilePhoto.FileName);
                System.Diagnostics.Debug.WriteLine("Dosya boyutu: " + fileProfilePhoto.PostedFile.ContentLength + " byte");
                
                try {
                    // Klasör yoksa oluştur
                    string uploadFolder = Server.MapPath("~/assets/uploads/profile/");
                    if (!System.IO.Directory.Exists(uploadFolder))
                    {
                        System.Diagnostics.Debug.WriteLine("assets/uploads/profile klasörü bulunamadı, oluşturuluyor...");
                        System.IO.Directory.CreateDirectory(uploadFolder);
                        System.Diagnostics.Debug.WriteLine("assets/uploads/profile klasörü oluşturuldu.");
                    }
                    
                    // Dosya adını güvenli hale getir ve uzantıyı kontrol et
                    string extension = Path.GetExtension(fileProfilePhoto.FileName).ToLower();
                    if (extension != ".jpg" && extension != ".jpeg" && extension != ".png" && extension != ".gif")
                    {
                        ShowErrorMessage("Sadece JPG, PNG veya GIF formatındaki resim dosyaları yüklenebilir.");
                        System.Diagnostics.Debug.WriteLine("HATA: Desteklenmeyen dosya formatı: " + extension);
                        return;
                    }
                    
                    // Eski profil fotoğrafını temizle
                    try {
                        // Önce eski fotoğraf adını veritabanından al
                        string oldPhotoPath = "";
                        using (SqlConnection connOldPhoto = new SqlConnection(connStr))
                        {
                            connOldPhoto.Open();
                            string querySql = "SELECT ProfilePicture FROM Users WHERE UserID = @UserID";
                            using (SqlCommand queryCmd = new SqlCommand(querySql, connOldPhoto))
                            {
                                queryCmd.Parameters.AddWithValue("@UserID", userID);
                                object result = queryCmd.ExecuteScalar();
                                if (result != null && result != DBNull.Value)
                                {
                                    oldPhotoPath = result.ToString();
                                }
                            }
                        }
                        
                        // Eski fotoğrafı sil (varsayılan resim değilse)
                        if (!string.IsNullOrEmpty(oldPhotoPath) && !oldPhotoPath.EndsWith("default-profile.png"))
                        {
                            string oldPhysicalPath = "";
                            if (oldPhotoPath.StartsWith("~/"))
                            {
                                oldPhysicalPath = Server.MapPath(oldPhotoPath);
                            }
                            else if (oldPhotoPath.StartsWith("/"))
                            {
                                oldPhysicalPath = Server.MapPath("~" + oldPhotoPath);
                            }
                            else
                            {
                                oldPhysicalPath = Server.MapPath("~/" + oldPhotoPath);
                            }
                            
                            if (System.IO.File.Exists(oldPhysicalPath))
                            {
                                System.IO.File.Delete(oldPhysicalPath);
                                System.Diagnostics.Debug.WriteLine("Eski profil fotoğrafı silindi: " + oldPhysicalPath);
                            }
                        }
                    }
                    catch (Exception exOld) {
                        System.Diagnostics.Debug.WriteLine("Eski fotoğraf silinirken hata: " + exOld.Message);
                        // Hata olsa bile devam et
                    }
                    
                    // Dosya adında rastgele bir değer ekleyelim (önbellek sorunlarını önlemek ve benzersiz isim için)
                    string randomSuffix = DateTime.Now.Ticks.ToString();
                    string fileName = "user_" + userID + "_" + randomSuffix + extension;
                    string savePath = Path.Combine(uploadFolder, fileName);
                    
                    // Dosya kaydet
                    fileProfilePhoto.SaveAs(savePath);
                    System.Diagnostics.Debug.WriteLine("Dosya başarıyla kaydedildi: " + savePath);
                    
                    // Veritabanında profil resmi yolunu güncelle
                    string dbPath = "/assets/uploads/profile/" + fileName;
                    using (SqlConnection connPhoto = new SqlConnection(connStr))
                    {
                        connPhoto.Open();
                        string sql = "UPDATE Users SET ProfilePicture = @ProfilePicture WHERE UserID = @UserID";
                        using (SqlCommand cmd = new SqlCommand(sql, connPhoto))
                        {
                            cmd.Parameters.AddWithValue("@ProfilePicture", dbPath);
                            cmd.Parameters.AddWithValue("@UserID", userID);
                            int affected = cmd.ExecuteNonQuery();
                            System.Diagnostics.Debug.WriteLine("Veritabanı güncellendi. Etkilenen satır sayısı: " + affected);
                            
                            // ImageUrl'i hemen güncelle - sayfa yeniden yüklenmeden görünecek
                            imgProfilePhoto.ImageUrl = dbPath + "?v=" + DateTime.Now.Ticks; // önbellek engelleme parametresi ekle
                            System.Diagnostics.Debug.WriteLine("ImageUrl güncellendi: " + imgProfilePhoto.ImageUrl);
                        }
                    }
                    
                    // JavaScript ile profil fotoğrafını güncelle
                    string updatePhotoScript = @"
                        setTimeout(function() {
                            var profileImgs = document.querySelectorAll('.profile-img, [id$=""imgProfilePhoto""]');
                            profileImgs.forEach(function(img) {
                                img.src = '" + dbPath + "?v=" + DateTime.Now.Ticks + @"';
                                console.log('Profil fotoğrafı güncellendi:', img);
                            });
                        }, 300);
                    ";
                    ClientScript.RegisterStartupScript(this.GetType(), "UpdateProfilePhoto", updatePhotoScript, true);
                }
                catch (Exception ex) {
                    System.Diagnostics.Debug.WriteLine("DOSYA YÜKLEME HATASI: " + ex.Message);
                    System.Diagnostics.Debug.WriteLine("Stack Trace: " + ex.StackTrace);
                    ShowErrorMessage("Profil fotoğrafı yüklenirken bir hata oluştu: " + ex.Message);
                }
            }

            // Profil sahibinin ID'sini al
            System.Diagnostics.Debug.WriteLine("Kullanıcı ID: " + userID);
            
            // Form verilerini loglama
            System.Diagnostics.Debug.WriteLine("Form verileri:");
            System.Diagnostics.Debug.WriteLine("- Adı: " + txtFirstName.Text);
            System.Diagnostics.Debug.WriteLine("- Soyadı: " + txtLastName.Text); 
            System.Diagnostics.Debug.WriteLine("- Kullanıcı Adı: " + txtUsername.Text);
            System.Diagnostics.Debug.WriteLine("- Bio: " + txtBio.Text);
            
            // Veritabanı bağlantısı oluştur
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();
                System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı açıldı.");
                
                // 1. AŞAMA: Kullanıcı adını güncelle
                bool usernameUpdated = false;
                try
                {
                    string updateUserSQL = "UPDATE Users SET Username = @Username WHERE UserID = @UserID";
                    using (SqlCommand cmd = new SqlCommand(updateUserSQL, conn))
                    {
                        cmd.Parameters.AddWithValue("@Username", txtUsername.Text.Trim());
                        cmd.Parameters.AddWithValue("@UserID", userID);
                        
                        int rowsAffected = cmd.ExecuteNonQuery();
                        usernameUpdated = (rowsAffected > 0);
                        System.Diagnostics.Debug.WriteLine("Username güncelleme: " + (usernameUpdated ? "Başarılı" : "Başarısız"));
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Username güncelleme hatası: " + ex.Message);
                }
                
                // 2. AŞAMA: Profil bilgilerini güncelle - resminizde ProfileID, UserID, FirstName, LastName, Bio sütunları olan tablo
                bool profileUpdated = false;
                
                try
                {
                    // Önce UserProfiles tablosunda güncelleme dene
                    string updateSQL = "UPDATE UserProfiles SET FirstName = @FirstName, LastName = @LastName, Bio = @Bio WHERE UserID = @UserID";
                    using (SqlCommand cmd = new SqlCommand(updateSQL, conn))
                    {
                        cmd.Parameters.AddWithValue("@FirstName", txtFirstName.Text.Trim());
                        cmd.Parameters.AddWithValue("@LastName", txtLastName.Text.Trim());
                        cmd.Parameters.AddWithValue("@Bio", txtBio.Text.Trim());
                        cmd.Parameters.AddWithValue("@UserID", userID);
                        
                        int rowsAffected = cmd.ExecuteNonQuery();
                        profileUpdated = (rowsAffected > 0);
                        System.Diagnostics.Debug.WriteLine("UserProfiles tablosu güncelleme: " + (profileUpdated ? "Başarılı" : "Başarısız"));
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("UserProfiles güncelleme hatası: " + ex.Message);
                }
                
                // UserProfiles çalışmadıysa, Profiles tablosunu dene
                if (!profileUpdated)
                {
                    try
                    {
                        string updateSQL = "UPDATE Profiles SET FirstName = @FirstName, LastName = @LastName, Bio = @Bio WHERE UserID = @UserID";
                        using (SqlCommand cmd = new SqlCommand(updateSQL, conn))
                        {
                            cmd.Parameters.AddWithValue("@FirstName", txtFirstName.Text.Trim());
                            cmd.Parameters.AddWithValue("@LastName", txtLastName.Text.Trim());
                            cmd.Parameters.AddWithValue("@Bio", txtBio.Text.Trim());
                            cmd.Parameters.AddWithValue("@UserID", userID);
                            
                            int rowsAffected = cmd.ExecuteNonQuery();
                            profileUpdated = (rowsAffected > 0);
                            System.Diagnostics.Debug.WriteLine("Profiles tablosu güncelleme: " + (profileUpdated ? "Başarılı" : "Başarısız"));
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("Profiles güncelleme hatası: " + ex.Message);
                    }
                }
                
                // Hala başarısızsa, kayıt yoksa INSERT dene
                if (!profileUpdated)
                {
                    // Burada resimden gördüğümüz tabloya (Profile, Profiles veya UserProfiles olabilir) yeni kayıt ekleyelim
                    
                    // Önce UserProfiles tablosuna kayıt ekle
                    try
                    {
                        string insertSQL = "INSERT INTO UserProfiles (UserID, FirstName, LastName, Bio) VALUES (@UserID, @FirstName, @LastName, @Bio)";
                        using (SqlCommand cmd = new SqlCommand(insertSQL, conn))
                        {
                            cmd.Parameters.AddWithValue("@UserID", userID);
                            cmd.Parameters.AddWithValue("@FirstName", txtFirstName.Text.Trim());
                            cmd.Parameters.AddWithValue("@LastName", txtLastName.Text.Trim());
                            cmd.Parameters.AddWithValue("@Bio", txtBio.Text.Trim());
                            
                            int rowsAffected = cmd.ExecuteNonQuery();
                            profileUpdated = (rowsAffected > 0);
                            System.Diagnostics.Debug.WriteLine("UserProfiles tablosuna INSERT: " + (profileUpdated ? "Başarılı" : "Başarısız"));
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("UserProfiles tablosuna INSERT hatası: " + ex.Message);
                        
                        // UserProfiles INSERT başarısızsa, Profiles'a dene
                        try
                        {
                            string insertSQL = "INSERT INTO Profiles (UserID, FirstName, LastName, Bio) VALUES (@UserID, @FirstName, @LastName, @Bio)";
                            using (SqlCommand cmd = new SqlCommand(insertSQL, conn))
                            {
                                cmd.Parameters.AddWithValue("@UserID", userID);
                                cmd.Parameters.AddWithValue("@FirstName", txtFirstName.Text.Trim());
                                cmd.Parameters.AddWithValue("@LastName", txtLastName.Text.Trim());
                                cmd.Parameters.AddWithValue("@Bio", txtBio.Text.Trim());
                                
                                int rowsAffected = cmd.ExecuteNonQuery();
                                profileUpdated = (rowsAffected > 0);
                                System.Diagnostics.Debug.WriteLine("Profiles tablosuna INSERT: " + (profileUpdated ? "Başarılı" : "Başarısız"));
                            }
                        }
                        catch (Exception ex2)
                        {
                            System.Diagnostics.Debug.WriteLine("Profiles tablosuna INSERT hatası: " + ex2.Message);
                        }
                    }
                }
                
                // 3. AŞAMA: Sonuçları değerlendir ve kullanıcıya bildir
                if (profileUpdated || usernameUpdated)
                {
                    string message = "";
                    
                    if (profileUpdated && usernameUpdated)
                        message = "Tüm profil bilgileriniz başarıyla güncellendi!";
                    else if (profileUpdated)
                        message = "Ad, soyad ve biyografi bilgileriniz güncellendi.";
                    else if (usernameUpdated)
                        message = "Kullanıcı adınız güncellendi.";
                    
                    // Bilgi mesajını logla (u: CS0219 uyarısını giderir)
#if DEBUG
                    System.Diagnostics.Debug.WriteLine("Profil güncelleme sonucu: " + message);
#endif
                    
                    // Verileri Session'a kaydedelim - master sayfası ve diğer sayfalar için
                    if (usernameUpdated)
                    {
                        Session["KullaniciAdi"] = txtUsername.Text.Trim();
                        
#if DEBUG
                        System.Diagnostics.Debug.WriteLine("KullaniciAdi Session'a güncellendi: " + txtUsername.Text.Trim());
#endif
                        
                        // Cookie'yi de güncelle
                        UpdateUserCookie();
                    }
                    
                    if (profileUpdated)
                    {
                        // Ad soyad bilgilerini Session'a kaydet
                        string userFullName = txtFirstName.Text.Trim() + " " + txtLastName.Text.Trim();
                        Session["KullaniciAdSoyad"] = userFullName;
                        Session["FirstName"] = txtFirstName.Text.Trim();
                        Session["LastName"] = txtLastName.Text.Trim();
                        Session["Bio"] = txtBio.Text.Trim();
                        System.Diagnostics.Debug.WriteLine("Tüm profil bilgileri Session'a güncellendi");
                        
                        // Cookie'yi de güncelle
                        UpdateUserCookie();
                    }
                    
                    // Tüm kullanıcı bilgilerini kalıcı olarak kaydet
                    if (profileUpdated || usernameUpdated)
                    {
                        SaveUserInfoPermanently();
                        System.Diagnostics.Debug.WriteLine("SaveUserInfoPermanently() metodu çağrıldı - kullanıcı bilgileri kalıcı olarak kaydedildi");
                    }
                    
                    // Profil bilgilerini hemen sayfada güncelle
                    if (usernameUpdated)
                    {
                        ltlUsername.Text = "<span class='username'>@" + txtUsername.Text.Trim() + "</span>";
                        lblKullaniciAdi.Text = "@" + txtUsername.Text.Trim();
                        System.Diagnostics.Debug.WriteLine("Kullanıcı adı güncellendi: " + lblKullaniciAdi.Text);
                    }
                    
                    if (profileUpdated)
                    {
                        string userFullName = txtFirstName.Text.Trim() + " " + txtLastName.Text.Trim();
                        ltlFullName.Text = userFullName;
                        ltlBio.Text = txtBio.Text.Trim();
                        ltlFullBioContent.Text = txtBio.Text.Trim();
                        
                        lblAdSoyad.Text = userFullName;
                        lblBio.Text = txtBio.Text.Trim();
                        System.Diagnostics.Debug.WriteLine("Ad Soyad güncellendi: " + lblAdSoyad.Text);
                        System.Diagnostics.Debug.WriteLine("Bio güncellendi: " + lblBio.Text);
                    }
                    
                    // Önbelleği temizle
                    Response.Cache.SetCacheability(HttpCacheability.NoCache);
                    Response.Cache.SetNoStore();
                    
                    // ViewState bilgilerini güncelle ama temizleme
                    ViewState["Username"] = txtUsername.Text.Trim();
                    ViewState["FirstName"] = txtFirstName.Text.Trim();
                    ViewState["LastName"] = txtLastName.Text.Trim();
                    ViewState["Bio"] = txtBio.Text.Trim();
                    
                    // Modal'ı kapat
                    closeEditModal();
                    
                    // Profil sayfasını yeniden yüklemek yerine burada bilgileri direkt güncelleyelim
                    try {
                        // Önce form alanlarını güncelleyelim
                        string updatedFirstName = txtFirstName.Text.Trim();
                        string updatedLastName = txtLastName.Text.Trim();
                        fullName = updatedFirstName + " " + updatedLastName;
                        string updatedUsername = txtUsername.Text.Trim();
                        string updatedBio = txtBio.Text.Trim();
                        
                        // Label kontrollerini güncelle
                        lblAdSoyad.Text = fullName;
                        lblKullaniciAdi.Text = "@" + updatedUsername;
                        lblBio.Text = updatedBio;
                        
                        // Literal kontrollerini güncelle
                        ltlFullName.Text = fullName;
                        ltlUsername.Text = "<span class='username'>@" + updatedUsername + "</span>";
                        ltlBio.Text = updatedBio;
                        ltlFullBioContent.Text = updatedBio;
                        
                        // Konsola bilgi yazdır
                        System.Diagnostics.Debug.WriteLine("Kontroller manuel olarak güncellendi:");
                        System.Diagnostics.Debug.WriteLine("lblAdSoyad: " + lblAdSoyad.Text);
                        System.Diagnostics.Debug.WriteLine("lblKullaniciAdi: " + lblKullaniciAdi.Text);
                        System.Diagnostics.Debug.WriteLine("lblBio: " + lblBio.Text);
                        System.Diagnostics.Debug.WriteLine("ltlFullName: " + ltlFullName.Text);
                        System.Diagnostics.Debug.WriteLine("ltlUsername: " + ltlUsername.Text);
                        System.Diagnostics.Debug.WriteLine("ltlBio: " + ltlBio.Text);
                        
                        // Şimdi JavaScript ile doğrudan HTML içeriğini güncelle
                    string updateUIScript = "setTimeout(function() { try { var nameElements = document.querySelectorAll('[id$=\"lblAdSoyad\"], .profile-name'); var usernameElements = document.querySelectorAll('[id$=\"lblKullaniciAdi\"], .username'); var bioElements = document.querySelectorAll('[id$=\"lblBio\"], .profile-bio'); nameElements.forEach(function(el) { el.innerText = '" + fullName.Replace("'", "\\'") + "'; console.log('Ad Soyad güncellendi:', el.innerText); }); usernameElements.forEach(function(el) { el.innerText = '@" + updatedUsername.Replace("'", "\\'") + "'; console.log('Kullanıcı adı güncellendi:', el.innerText); }); bioElements.forEach(function(el) { el.innerText = '" + updatedBio.Replace("'", "\\'").Replace("\n", "<br>") + "'; console.log('Bio güncellendi:', el.innerText); }); console.log('Tüm profil bilgileri JavaScript ile güncellendi'); } catch(err) { console.error('Profil bilgilerini güncellerken hata:', err); } }, 100);";
                        
                        ClientScript.RegisterStartupScript(this.GetType(), "UpdateUIElements", updateUIScript, true);
                        
                        // Ayrıca yeni eklediğimiz updateProfileDisplay fonksiyonunu çağır
                        string directUpdateScript = "setTimeout(function() { if (typeof updateProfileDisplay === 'function') { updateProfileDisplay('" + updatedFirstName.Replace("'", "\\'") + "', '" + updatedLastName.Replace("'", "\\'") + "', '" + updatedUsername.Replace("'", "\\'") + "', '" + updatedBio.Replace("'", "\\'").Replace("\n", "\\n") + "'); console.log('updateProfileDisplay fonksiyonu çağrıldı'); } else { console.error('updateProfileDisplay fonksiyonu bulunamadı'); } }, 200);";
                        
                        ClientScript.RegisterStartupScript(this.GetType(), "DirectUpdateScript", directUpdateScript, true);
                    }
                    catch (Exception ex) {
                        System.Diagnostics.Debug.WriteLine("Manuel güncelleme hatası: " + ex.Message);
                    }
                    
                    // Ayrıca veritabanından yeniden yükle (manuel güncellemenin bir sorun çıkardığı durumlar için yedek)
                    LoadUserProfile();
                    
                    // JS ile kullanıcıya bildirme
                    string script = "setTimeout(function() { document.getElementById('successAlertText').innerText = 'Profil bilgileriniz başarıyla güncellendi.'; document.getElementById('successAlert').style.display = 'block'; setTimeout(function() { document.getElementById('successAlert').style.display = 'none'; }, 5000); }, 500);";
                    
                    ClientScript.RegisterStartupScript(this.GetType(), "UpdateSuccess", script, true);
                    
                    System.Diagnostics.Debug.WriteLine("Profil güncellendi, sayfa yenilenmeden güncellendi");
                }
                else
                {
                    ShowErrorMessage("Profil bilgileriniz güncellenemedi. Lütfen daha sonra tekrar deneyin.");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Genel Hata: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Stack: " + ex.StackTrace);
            ShowErrorMessage("Beklenmeyen bir hata oluştu: " + ex.Message);
        }
        
        System.Diagnostics.Debug.WriteLine("===== PROFİL GÜNCELLEME TAMAMLANDI =====");
        
        // Güncelleme sonrası JavaScript bilgilerini de güncelle
        RegisterUserInfoScript();
    }
    
    // Hata mesajı gösterme yardımcı metodu
    private void ShowErrorMessage(string message)
    {
        string script = "showErrorMessage('" + message.Replace("'", "\\'") + "');";
        ClientScript.RegisterStartupScript(this.GetType(), "ErrorMessage", script, true);
    }

    // Edit modalını kapatma yardımcı metodu
    private void closeEditModal()
    {
        string script = "closeEditModal();";
        ClientScript.RegisterStartupScript(this.GetType(), "CloseModal", script, true);
    }

    // Veritabanında mevcut kullanıcı tablosunu ve alan adlarını tespit et
    private void FindUserTable()
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                System.Diagnostics.Debug.WriteLine("FindUserTable: Veritabanı bağlantısı açıldı");
                
                // Olası kullanıcı tablolarını tanımla
                string[] possibleTables = { "Users", "UserProfiles", "Profiles", "User", "Profile", "Kullanicilar", "Uyeler", "tblUser", "tblUsers" };
                    
                // Her tabloyu kontrol et
                foreach (string tableName in possibleTables)
                {
                    string checkTableSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @TableName";
                    bool tableExists = false;
                    
                    using (SqlCommand cmd = new SqlCommand(checkTableSql, conn))
                    {
                        cmd.Parameters.AddWithValue("@TableName", tableName);
                        int result = (int)cmd.ExecuteScalar();
                        tableExists = (result > 0);
                    }
                    
                    if (tableExists)
                    {
                        System.Diagnostics.Debug.WriteLine("Olası kullanıcı tablosu bulundu: " + tableName);
                        
                        // Tablo içinde UserID veya benzer bir alan ara
                        string checkColumnsSql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @TableName";
                        List<string> columns = new List<string>();
                        
                        using (SqlCommand cmd = new SqlCommand(checkColumnsSql, conn))
                        {
                            cmd.Parameters.AddWithValue("@TableName", tableName);
                            using (SqlDataReader reader = cmd.ExecuteReader())
                            {
                        while (reader.Read())
                        {
                            columns.Add(reader["COLUMN_NAME"].ToString());
                        }
                            }
                        }
                        
                        // ID alanı ara
                        string idColumn = null;
                        foreach (string col in columns)
                        {
                            if (col.Equals("UserID", StringComparison.OrdinalIgnoreCase) || 
                                col.Equals("ID", StringComparison.OrdinalIgnoreCase) ||
                                col.Equals("Userid", StringComparison.OrdinalIgnoreCase) ||
                                col.Equals("KullaniciID", StringComparison.OrdinalIgnoreCase))
                            {
                                idColumn = col;
                                break;
                            }
                        }
                        
                        // Eğer ID bulunduysa, bu tabloyu kullan
                        if (idColumn != null)
                        {
                            userTableName = tableName;
                            userIdColumn = idColumn;
                            
                            // Diğer sütunları da belirle
                            foreach (string col in columns)
                            {
                                if (col.Equals("Username", StringComparison.OrdinalIgnoreCase) || 
                                    col.Equals("UserName", StringComparison.OrdinalIgnoreCase) ||
                                    col.Equals("KullaniciAdi", StringComparison.OrdinalIgnoreCase))
                                {
                                    usernameColumn = col;
                                }
                                else if (col.Equals("FirstName", StringComparison.OrdinalIgnoreCase) || 
                                         col.Equals("Ad", StringComparison.OrdinalIgnoreCase) ||
                                         col.Equals("Isim", StringComparison.OrdinalIgnoreCase))
                                {
                                    firstNameColumn = col;
                                }
                                else if (col.Equals("LastName", StringComparison.OrdinalIgnoreCase) || 
                                         col.Equals("Soyad", StringComparison.OrdinalIgnoreCase) ||
                                         col.Equals("Soyisim", StringComparison.OrdinalIgnoreCase))
                                {
                                    lastNameColumn = col;
                                }
                                else if (col.Equals("Bio", StringComparison.OrdinalIgnoreCase) || 
                                         col.Equals("Biography", StringComparison.OrdinalIgnoreCase) ||
                                         col.Equals("About", StringComparison.OrdinalIgnoreCase) ||
                                         col.Equals("Hakkinda", StringComparison.OrdinalIgnoreCase))
                                {
                                    bioColumn = col;
                                }
                                else if (col.Equals("ProfilePicture", StringComparison.OrdinalIgnoreCase) || 
                                         col.Equals("ProfilePhoto", StringComparison.OrdinalIgnoreCase) ||
                                         col.Equals("Avatar", StringComparison.OrdinalIgnoreCase) ||
                                         col.Equals("ProfilResmi", StringComparison.OrdinalIgnoreCase))
                                {
                                    profilePicColumn = col;
                                }
                                else if (col.Equals("CoverPhoto", StringComparison.OrdinalIgnoreCase) || 
                                         col.Equals("CoverPicture", StringComparison.OrdinalIgnoreCase) ||
                                         col.Equals("KapakResmi", StringComparison.OrdinalIgnoreCase))
                                {
                                    coverPhotoColumn = col;
                                }
                    }
                    
                            // Debug için kolonları göster
                            System.Diagnostics.Debug.WriteLine("Kullanılacak tablo ve kolonlar:");
                            System.Diagnostics.Debug.WriteLine(" - Tablo: " + userTableName);
                            System.Diagnostics.Debug.WriteLine(" - ID Kolonu: " + userIdColumn);
                            System.Diagnostics.Debug.WriteLine(" - Username Kolonu: " + usernameColumn);
                            System.Diagnostics.Debug.WriteLine(" - FirstName Kolonu: " + firstNameColumn);
                            System.Diagnostics.Debug.WriteLine(" - LastName Kolonu: " + lastNameColumn);
                            System.Diagnostics.Debug.WriteLine(" - Bio Kolonu: " + bioColumn);
                            
                            // Daha detaylı bilgi için table içeriğini logla
                            string checkUsersQuery = "SELECT TOP 3 * FROM " + userTableName;
                            using (SqlCommand cmd = new SqlCommand(checkUsersQuery, conn))
                            {
                                try
                                {
                                    using (SqlDataReader reader = cmd.ExecuteReader())
                            {
                                        int count = 0;
                                while (reader.Read())
                                {
                                            count++;
                                            System.Diagnostics.Debug.WriteLine("Örnek Kullanıcı #" + count + ":");
                                
                                            // Tüm sütunları göster
                                            for (int i = 0; i < reader.FieldCount; i++)
                                            {
                                                string colName = reader.GetName(i);
                                                object value = reader[i];
                                                System.Diagnostics.Debug.WriteLine(" - " + colName + ": " + 
                                                    (value == DBNull.Value ? "NULL" : value.ToString()));
                                            }
                                        }
                                        System.Diagnostics.Debug.WriteLine("Toplam " + count + " kullanıcı bulundu.");
                                    }
                                }
                                catch (Exception ex)
                                {
                                    System.Diagnostics.Debug.WriteLine("Kullanıcı verileri listelenirken hata: " + ex.Message);
                                }
                            }
                            
                            // Eğer Session'da KullaniciID varsa, bu kullanıcıyı kontrol et
                            if (Session["KullaniciID"] != null)
                            {
                                string checkCurrentUser = "SELECT COUNT(*) FROM " + userTableName + 
                                    " WHERE " + userIdColumn + " = @UserID";
                                
                                using (SqlCommand cmd = new SqlCommand(checkCurrentUser, conn))
                                {
                                    cmd.Parameters.AddWithValue("@UserID", Session["KullaniciID"].ToString());
                                    int result = (int)cmd.ExecuteScalar();
                                    System.Diagnostics.Debug.WriteLine("Session'daki kullanıcı (" + 
                                        Session["KullaniciID"] + ") veritabanında " + 
                                        (result > 0 ? "BULUNDU" : "BULUNAMADI"));
                                }
                            }
                            
                            // Kullanıcı tablosu ve sütunları bulundu, metodu sonlandır
                            return;
                        }
                    }
                }
                
                // Eğer buraya kadar geldiyse, hiçbir tablo bulunamadı demektir
                System.Diagnostics.Debug.WriteLine("UYARI: Hiçbir kullanıcı tablosu bulunamadı!");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("FindUserTable hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata ayrıntısı: " + ex.StackTrace);
        }
    }

    // Kullanıcı bilgilerini cookie'de güncelle
    private void UpdateUserCookie()
    {
        try 
        {
            HttpCookie userCookie = new HttpCookie("UserInfo");
            userCookie["UserID"] = CurrentUserID;
            
            // Kullanıcı adı bilgisini kontrol et ve ekle
            if (Session["KullaniciAdi"] != null)
            {
                userCookie["Username"] = Session["KullaniciAdi"].ToString();
            }
            else if (!string.IsNullOrEmpty(txtUsername.Text))
            {
                userCookie["Username"] = txtUsername.Text.Trim();
                Session["KullaniciAdi"] = txtUsername.Text.Trim();
            }
            
            // Email bilgisini kontrol et ve ekle
            if (Session["Email"] != null)
            {
                userCookie["Email"] = Session["Email"].ToString();
            }
            
            // Ad Soyad bilgilerini ekle
            if (!string.IsNullOrEmpty(txtFirstName.Text))
            {
                userCookie["FirstName"] = txtFirstName.Text.Trim();
                Session["FirstName"] = txtFirstName.Text.Trim();
            }
            
            if (!string.IsNullOrEmpty(txtLastName.Text))
            {
                userCookie["LastName"] = txtLastName.Text.Trim();
                Session["LastName"] = txtLastName.Text.Trim();
            }
            
            // Biyografi bilgisini ekle
            if (!string.IsNullOrEmpty(txtBio.Text))
            {
                // Bio bilgisi çok uzun olabilir, kısaltılmış versiyonunu ekle
                string shortBio = txtBio.Text.Length > 100 ? txtBio.Text.Substring(0, 100) + "..." : txtBio.Text;
                userCookie["ShortBio"] = shortBio;
                Session["Bio"] = txtBio.Text.Trim();
            }
            
            // Son güncelleme zamanını ekle
            userCookie["LastUpdate"] = DateTime.Now.ToString();
            Session["LastUpdate"] = DateTime.Now;
            
            // 1 gün süreli cookie oluştur
            userCookie.Expires = DateTime.Now.AddDays(1);
            Response.Cookies.Add(userCookie);
            
            System.Diagnostics.Debug.WriteLine("Kullanıcı cookie'si güncellendi, 1 gün süreyle geçerli");
            
            // Session'ı canlı tut
            Session.Timeout = 60; // 60 dakika
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Cookie güncellemede hata: " + ex.Message);
        }
    }

    // Kullanıcı bilgilerini kalıcı olarak kaydet (çoklu depolama kullanarak) - MasterPage için
    private void SaveUserInfoPermanently()
    {
        try
        {
            // 1. Önce Session değerlerini güncelle - tüm Session anahtarlarını doldur
            Session["FirstName"] = txtFirstName.Text.Trim();
            Session["LastName"] = txtLastName.Text.Trim();
            string fullNameValue = txtFirstName.Text.Trim() + " " + txtLastName.Text.Trim();
            
            // Tüm olası Session anahtarlarına tam adı kaydet
            Session["FullName"] = fullNameValue;
            Session["UserFullName"] = fullNameValue;
            Session["KullaniciAdSoyad"] = fullNameValue;
            
            // Kullanıcı adını kaydet
            Session["KullaniciAdi"] = txtUsername.Text.Trim();
            Session["DisplayUsername"] = txtUsername.Text.Trim();
            
            // Bio bilgisini kaydet
            Session["Bio"] = txtBio.Text.Trim();
            
            // 2. Cookie'ye kullanıcı bilgilerini kaydet - uzun ömürlü
            HttpCookie userCookie = new HttpCookie("UserInfo");
            userCookie["UserID"] = Session["KullaniciID"].ToString();
            userCookie["Username"] = txtUsername.Text.Trim();
            userCookie["FirstName"] = txtFirstName.Text.Trim();
            userCookie["LastName"] = txtLastName.Text.Trim();
            userCookie["FullName"] = fullNameValue;
            userCookie["ShortBio"] = txtBio.Text.Trim();
            userCookie.Expires = DateTime.Now.AddDays(30); // 30 gün geçerli olsun
            Response.Cookies.Add(userCookie);
            
            // 3. Application seviyesinde kullanıcı bilgilerini güncelle
            UpdateApplicationLevelUserInfo();
            
            // 4. JavaScript LocalStorage'a kaydet (istemci tarafı veri saklamak için)
            string script = @"
            <script>
                localStorage.setItem('user_id', '" + Session["KullaniciID"] + @"');
                localStorage.setItem('username', '" + txtUsername.Text.Trim().Replace("'", "\\'") + @"');
                localStorage.setItem('first_name', '" + txtFirstName.Text.Trim().Replace("'", "\\'") + @"');
                localStorage.setItem('last_name', '" + txtLastName.Text.Trim().Replace("'", "\\'") + @"');
                localStorage.setItem('full_name', '" + fullNameValue.Replace("'", "\\'") + @"');
                localStorage.setItem('bio', '" + txtBio.Text.Trim().Replace("'", "\\'") + @"');
                console.log('Kullanıcı bilgileri localStorage\'a kaydedildi');
                
                // Değerlerin doğru kaydedildiğini kontrol et
                console.log('LOCAL STORAGE KONTROL:');
                console.log('UserID:', localStorage.getItem('user_id'));
                console.log('Username:', localStorage.getItem('username'));
                console.log('FirstName:', localStorage.getItem('first_name'));
                console.log('LastName:', localStorage.getItem('last_name'));
                console.log('FullName:', localStorage.getItem('full_name'));
                console.log('Bio:', localStorage.getItem('bio'));
            </script>";
            
            ClientScript.RegisterStartupScript(this.GetType(), "SaveUserInfo", script, false);
            
            // 5. Güncelleme için debug bilgisi
            System.Diagnostics.Debug.WriteLine("KULLANICI BİLGİLERİ KALICI OLARAK KAYDEDİLDİ");
            System.Diagnostics.Debug.WriteLine("Session[FullName]: " + Session["FullName"]);
            System.Diagnostics.Debug.WriteLine("Session[UserFullName]: " + Session["UserFullName"]);
            System.Diagnostics.Debug.WriteLine("Session[KullaniciAdSoyad]: " + Session["KullaniciAdSoyad"]);
            System.Diagnostics.Debug.WriteLine("Session[KullaniciAdi]: " + Session["KullaniciAdi"]);
            System.Diagnostics.Debug.WriteLine("Cookie FullName: " + userCookie["FullName"]);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("SaveUserInfoPermanently Error: " + ex.Message);
        }
    }

    private void UpdateApplicationLevelUserInfo()
    {
        try
        {
            // Application seviyesinde kullanıcı profillerini al
            var userProfiles = Application["UserProfiles"] as System.Collections.Concurrent.ConcurrentDictionary<string, Dictionary<string, string>>;
            
            // Eğer null ise, yeni oluştur
            if (userProfiles == null)
            {
                userProfiles = new System.Collections.Concurrent.ConcurrentDictionary<string, Dictionary<string, string>>();
                Application["UserProfiles"] = userProfiles;
            }
            
            string userId = Session["KullaniciID"].ToString();
            string fullNameValue = txtFirstName.Text.Trim() + " " + txtLastName.Text.Trim();
            
            // Kullanıcı bilgilerini içeren sözlük
            Dictionary<string, string> userInfo = new Dictionary<string, string>();
            userInfo["Username"] = txtUsername.Text.Trim();
            userInfo["FirstName"] = txtFirstName.Text.Trim();
            userInfo["LastName"] = txtLastName.Text.Trim();
            userInfo["FullName"] = fullNameValue;
            userInfo["Bio"] = txtBio.Text.Trim();
            
            // Kullanıcı bilgilerini Application'a kaydet/güncelle
            userProfiles[userId] = userInfo;
            
            System.Diagnostics.Debug.WriteLine("Application seviyesinde kullanıcı bilgileri güncellendi");
            System.Diagnostics.Debug.WriteLine("App FullName: " + userInfo["FullName"]);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("UpdateApplicationLevelUserInfo Error: " + ex.Message);
        }
    }

    // Kullanıcı bilgilerini JavaScript'e aktaran yeni metot
    private void RegisterUserInfoScript()
    {
        try
        {
            // Session'da kullanıcı bilgilerini JavaScript'e aktar - MasterPage için olası tüm anahtarlarla
            string userScript = @"
            <script>
                // Kullanıcı bilgilerini localStorage'a kaydet (MasterPage için)
                var KullaniciID = '" + (Session["KullaniciID"] != null ? Session["KullaniciID"].ToString() : "") + @"';
                var KullaniciAdi = '" + (Session["KullaniciAdi"] != null ? Session["KullaniciAdi"].ToString().Replace("'", "\\'") : "") + @"';
                var Username = '" + (Session["Username"] != null ? Session["Username"].ToString().Replace("'", "\\'") : "") + @"';
                var FirstName = '" + (Session["FirstName"] != null ? Session["FirstName"].ToString().Replace("'", "\\'") : "") + @"';
                var LastName = '" + (Session["LastName"] != null ? Session["LastName"].ToString().Replace("'", "\\'") : "") + @"';
                var UserFullName = '" + (Session["UserFullName"] != null ? Session["UserFullName"].ToString().Replace("'", "\\'") : "") + @"';
                var FullName = '" + (Session["FullName"] != null ? Session["FullName"].ToString().Replace("'", "\\'") : "") + @"';
                var Bio = '" + (Session["Bio"] != null ? Session["Bio"].ToString().Replace("'", "\\'") : "") + @"';
                
                // Bu değerleri localStorage'a kaydet
                if (KullaniciID) localStorage.setItem('user_id', KullaniciID);
                if (KullaniciAdi) localStorage.setItem('username', KullaniciAdi);
                if (Username) localStorage.setItem('username', Username);  // İkinci bir yol
                if (FirstName) localStorage.setItem('first_name', FirstName);
                if (LastName) localStorage.setItem('last_name', LastName);
                if (UserFullName) localStorage.setItem('full_name', UserFullName);
                if (UserFullName) localStorage.setItem('user_full_name', UserFullName);  // İkinci bir yol
                if (FullName) localStorage.setItem('full_name', FullName);  // İkinci bir yol
                if (Bio) localStorage.setItem('bio', Bio);
                
                console.log('UserPage: Session bilgileri JavaScript değişkenlerine yüklendi - KullaniciAdi:', KullaniciAdi); 
                console.log('UserPage: Session bilgileri localStorage\'a kaydedildi - FullName:', UserFullName);
            </script>";
            
            ClientScript.RegisterStartupScript(this.GetType(), "SessionToJSVars", userScript, false);
            
            System.Diagnostics.Debug.WriteLine("Kullanıcı bilgileri JavaScript'e aktarıldı");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("JavaScript bilgisi aktarılırken hata: " + ex.Message);
        }
    }

    // Veritabanı ve tablo kontrolü için yeni metod
    private void CheckDatabaseSetup()
    {
        System.Diagnostics.Debug.WriteLine("====== DATABASE DIAGNOSTIC CHECK BAŞLADI ======");
        
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı başarılı");
                
                // Mevcut tabloları listele
                string tableQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
                using (SqlCommand cmd = new SqlCommand(tableQuery, conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        System.Diagnostics.Debug.WriteLine("Veritabanındaki Tablolar:");
                        int tableCount = 0;
                        while (reader.Read())
                        {
                            tableCount++;
                            System.Diagnostics.Debug.WriteLine(" - " + reader["TABLE_NAME"].ToString());
                        }
                        System.Diagnostics.Debug.WriteLine("Toplam " + tableCount + " tablo bulundu.");
                    }
                }
                
                // Kullanıcılar tablosunu kontrol et
                string usersCheckQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users'";
                bool usersTableExists = false;
                using (SqlCommand cmd = new SqlCommand(usersCheckQuery, conn))
                {
                    int count = (int)cmd.ExecuteScalar();
                    usersTableExists = (count > 0);
                    System.Diagnostics.Debug.WriteLine("Users tablosu mevcut: " + usersTableExists);
                }
                
                // Users tablosu varsa, kayıt sayısını göster
                if (usersTableExists)
                {
                    string userCountQuery = "SELECT COUNT(*) FROM Users";
                    using (SqlCommand cmd = new SqlCommand(userCountQuery, conn))
                    {
                        int count = (int)cmd.ExecuteScalar();
                        System.Diagnostics.Debug.WriteLine("Users tablosunda " + count + " kayıt bulundu");
                    }
                    
                    // Aktif kullanıcı varsa, session bilgisi ile karşılaştır
                    if (Session["KullaniciID"] != null)
                    {
                        string currentUserQuery = "SELECT COUNT(*) FROM Users WHERE UserID = @UserID";
                        using (SqlCommand cmd = new SqlCommand(currentUserQuery, conn))
                        {
                            cmd.Parameters.AddWithValue("@UserID", Session["KullaniciID"].ToString());
                            int count = (int)cmd.ExecuteScalar();
                            System.Diagnostics.Debug.WriteLine("Session ID ile eşleşen kayıt: " + count + 
                                " (Session[KullaniciID] = " + Session["KullaniciID"] + ")");
                        }
                    }
                }
                
                // Session değerlerini göster
                System.Diagnostics.Debug.WriteLine("Session Değerleri:");
                foreach (string key in Session.Keys)
                {
                    System.Diagnostics.Debug.WriteLine(" - " + key + ": " + Session[key]);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Veritabanı kontrolü sırasında hata: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata ayrıntısı: " + ex.StackTrace);
        }
        
        System.Diagnostics.Debug.WriteLine("====== DATABASE DIAGNOSTIC CHECK TAMAMLANDI ======");
    }

    // Kullanıcının takipçilerini getirme
    [System.Web.Services.WebMethod]
    public static List<Dictionary<string, string>> GetFollowers(string userID)
    {
        List<Dictionary<string, string>> followers = new List<Dictionary<string, string>>();
        string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
        
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Takipçileri getir - profil fotoğrafları ile birlikte
                string query = @"
                    SELECT f.FollowerID, u.Username, u.ProfilePicture 
                    FROM Followers f
                    INNER JOIN Users u ON f.FollowerID = u.UserID
                    WHERE f.FollowingUserID = @UserID
                    ORDER BY f.FollowDate DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            Dictionary<string, string> follower = new Dictionary<string, string>();
                            follower["UserID"] = reader["FollowerID"].ToString();
                            follower["Username"] = reader["Username"].ToString();
                            
                            // Profil fotoğrafını ekle
                            string profilePic = reader["ProfilePicture"] != DBNull.Value ? reader["ProfilePicture"].ToString() : "";
                            if (string.IsNullOrEmpty(profilePic))
                            {
                                profilePic = "/assets/img/default-profile.png";
                            }
                            follower["ProfilePicture"] = profilePic;
                            
                            followers.Add(follower);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Takipçileri getirme hatası: " + ex.Message);
        }
        
        return followers;
    }
    
    // Kullanıcının takip ettiği kişileri getirme
    [System.Web.Services.WebMethod]
    public static List<Dictionary<string, string>> GetFollowing(string userID)
    {
        List<Dictionary<string, string>> following = new List<Dictionary<string, string>>();
        string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
        
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Takip edilen kullanıcıları getir - profil fotoğrafları ile birlikte
                string query = @"
                    SELECT f.FollowingUserID, u.Username, u.ProfilePicture
                    FROM Followers f
                    INNER JOIN Users u ON f.FollowingUserID = u.UserID
                    WHERE f.FollowerID = @UserID
                    ORDER BY f.FollowDate DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            Dictionary<string, string> followedUser = new Dictionary<string, string>();
                            followedUser["UserID"] = reader["FollowingUserID"].ToString();
                            followedUser["Username"] = reader["Username"].ToString();
                            
                            // Profil fotoğrafını ekle
                            string profilePic = reader["ProfilePicture"] != DBNull.Value ? reader["ProfilePicture"].ToString() : "";
                            if (string.IsNullOrEmpty(profilePic))
                            {
                                profilePic = "/assets/img/default-profile.png";
                            }
                            followedUser["ProfilePicture"] = profilePic;
                            
                            following.Add(followedUser);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Takip edilenleri getirme hatası: " + ex.Message);
        }
        
        return following;
    }

    private void LoadUserPosts()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("LoadUserPosts metodu çağrıldı - ViewedUserID: " + ViewedUserID);
            if (string.IsNullOrEmpty(ViewedUserID))
            {
                System.Diagnostics.Debug.WriteLine("HATA: ViewedUserID boş veya null!");
                pnlNoPosts.Visible = true;
                return;
            }
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                System.Diagnostics.Debug.WriteLine("Yazılar için veritabanı bağlantısı açıldı");
                
                // Kullanıcıya ait yazıları getir
                string sql = @"
                    SELECT PostID, Title, CreatedAt, 
                           (SELECT COUNT(*) FROM Comments WHERE PostID = p.PostID) AS CommentCount,
                           0 AS ViewCount, -- Eğer Views tablosu yoksa 0 döndür
                           SUBSTRING(Content, 1, 150) + '...' AS Summary
                    FROM Posts p
                    WHERE UserID = @UserID AND ApprovalStatus = 1
                    ORDER BY CreatedAt DESC";
                    
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@UserID", ViewedUserID);
                System.Diagnostics.Debug.WriteLine("Yazılar sorgusu çalıştırılıyor: " + cmd.CommandText);

                SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();
                adapter.Fill(dt);
                
                System.Diagnostics.Debug.WriteLine(dt.Rows.Count + " adet yazı bulundu");

                rptPosts.DataSource = dt;
                rptPosts.DataBind();

                pnlNoPosts.Visible = (dt.Rows.Count == 0);
                
                if (dt.Rows.Count == 0) {
                    System.Diagnostics.Debug.WriteLine("Kullanıcıya ait yazı bulunamadı");
                }
                else {
                    foreach (DataRow row in dt.Rows)
                    {
                        System.Diagnostics.Debug.WriteLine("Yazı: ID=" + row["PostID"] + ", Başlık=" + row["Title"]);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Kullanıcı yazıları yüklenemedi: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
            pnlNoPosts.Visible = true;
        }
    }
    
    // Kullanıcının postun sahibi olup olmadığını kontrol eder
    protected bool IsCurrentUserOwner(string postId)
    {
        // Kullanıcı giriş yapmamışsa false döndür
        if (Session["KullaniciID"] == null || CurrentUserID != ViewedUserID)
            return false;
            
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = "SELECT COUNT(*) FROM Posts WHERE PostID = @PostID AND UserID = @UserID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@PostID", postId);
                cmd.Parameters.AddWithValue("@UserID", CurrentUserID);
                
                int count = (int)cmd.ExecuteScalar();
                return (count > 0);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Post sahibi kontrolü hatası: " + ex.Message);
            return false;
        }
    }
    
    // Post silme işlemi için click handler
    protected void btnDeletePost_Click(object sender, EventArgs e)
    {
        // Hata ayıklama bilgisi
        System.Diagnostics.Debug.WriteLine("btnDeletePost_Click başladı");
        
        // Silme butonundan post ID'sini al
        LinkButton btn = (LinkButton)sender;
        string postId = btn.CommandArgument;
        
        System.Diagnostics.Debug.WriteLine("Silinecek PostID: " + postId);
        
        // Oturum kontrolü
        if (Session["KullaniciID"] == null || string.IsNullOrEmpty(CurrentUserID))
        {
            ShowErrorMessage("Bu işlemi gerçekleştirmek için giriş yapmalısınız.");
            System.Diagnostics.Debug.WriteLine("Silme işlemi başarısız: Kullanıcı giriş yapmamış");
            return;
        }
        
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı açılıyor...");
                conn.Open();
                System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı açıldı");
                
                // Önce yazının mevcut olup olmadığını ve kullanıcıya ait olup olmadığını kontrol et
                string checkOwnerSql = "SELECT UserID FROM Posts WHERE PostID = @PostID";
                SqlCommand checkCmd = new SqlCommand(checkOwnerSql, conn);
                checkCmd.Parameters.AddWithValue("@PostID", postId);
                
                System.Diagnostics.Debug.WriteLine("Post sahibi sorgusu çalıştırılıyor: " + checkCmd.CommandText);
                object result = checkCmd.ExecuteScalar();
                
                if (result == null)
                {
                    ShowErrorMessage("Post bulunamadı.");
                    System.Diagnostics.Debug.WriteLine("Silme işlemi başarısız: Post bulunamadı (PostID: " + postId + ")");
                    return;
                }
                
                int postUserId = Convert.ToInt32(result);
                int currentUserId = Convert.ToInt32(CurrentUserID);
                
                System.Diagnostics.Debug.WriteLine("Post UserID: " + postUserId);
                System.Diagnostics.Debug.WriteLine("Giriş yapmış kullanıcı ID: " + currentUserId);
                
                if (postUserId != currentUserId)
                {
                    ShowErrorMessage("Bu yazıyı silmek için yetkiniz bulunmuyor.");
                    System.Diagnostics.Debug.WriteLine("Silme işlemi başarısız: Kullanıcı post sahibi değil");
                    return;
                }
                
                System.Diagnostics.Debug.WriteLine("Yetki kontrolü başarılı, yorumlar siliniyor...");
                
                // PostViews tablosundaki görüntülenme kayıtlarını sil (varsa)
                try
                {
                    string deleteViewsSql = "DELETE FROM PostViews WHERE PostID = @PostID";
                    SqlCommand deleteViewsCmd = new SqlCommand(deleteViewsSql, conn);
                    deleteViewsCmd.Parameters.AddWithValue("@PostID", postId);
                    
                    int deletedViews = deleteViewsCmd.ExecuteNonQuery();
                    System.Diagnostics.Debug.WriteLine(deletedViews + " adet görüntülenme kaydı silindi");
                }
                catch (Exception viewEx)
                {
                    // PostViews tablosu yoksa veya başka bir hata olursa sadece logla
                    System.Diagnostics.Debug.WriteLine("Görüntülenme kayıtları silinirken hata: " + viewEx.Message);
                }
                
                // Yorumları sil
                string deleteCommentsSql = "DELETE FROM Comments WHERE PostID = @PostID";
                SqlCommand deleteCommentsCmd = new SqlCommand(deleteCommentsSql, conn);
                deleteCommentsCmd.Parameters.AddWithValue("@PostID", postId);
                
                int deletedComments = deleteCommentsCmd.ExecuteNonQuery();
                System.Diagnostics.Debug.WriteLine(deletedComments + " adet yorum silindi");
                
                // Postu sil
                string deletePostSql = "DELETE FROM Posts WHERE PostID = @PostID";
                SqlCommand deletePostCmd = new SqlCommand(deletePostSql, conn);
                deletePostCmd.Parameters.AddWithValue("@PostID", postId);
                
                int deletedPosts = deletePostCmd.ExecuteNonQuery();
                System.Diagnostics.Debug.WriteLine(deletedPosts + " adet post silindi");
                
                if (deletedPosts > 0)
                {
                    System.Diagnostics.Debug.WriteLine("Silme işlemi başarılı, sayfa yenileniyor...");
                    // İstatistikleri güncelle (varsa)
                    LoadUserStats(conn);
                    
                    // Sayfayı yenile - QueryString parametrelerini koruyarak
                    Response.Redirect(Request.RawUrl);
                }
                else
                {
                    ShowErrorMessage("Post silinirken bir hata oluştu: Hiçbir kayıt etkilenmedi.");
                    System.Diagnostics.Debug.WriteLine("Silme işlemi başarısız: Hiçbir kayıt etkilenmedi");
                }
            }
        }
        catch (Exception ex)
        {
            ShowErrorMessage("Post silinirken bir hata oluştu: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Post silme hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
        }
    }

    // Kullanıcının postun sahibi olup olmadığını kontrol eder
    protected bool IsPostOwner(int postId)
    {
        System.Diagnostics.Debug.WriteLine("IsPostOwner metoduna çağrı - PostID: " + postId);
        
        // Kullanıcı giriş yapmamışsa false döndür
        if (Session["KullaniciID"] == null || string.IsNullOrEmpty(CurrentUserID))
        {
            System.Diagnostics.Debug.WriteLine("IsPostOwner: Kullanıcı giriş yapmamış");
            return false;
        }
        
        if (string.IsNullOrEmpty(ViewedUserID) || CurrentUserID != ViewedUserID)
        {
            System.Diagnostics.Debug.WriteLine("IsPostOwner: Kullanıcı, görüntülenen profil sahibi değil");
            return false;
        }
    
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string sql = "SELECT COUNT(*) FROM Posts WHERE PostID = @PostID AND UserID = @UserID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@PostID", postId);
                cmd.Parameters.AddWithValue("@UserID", CurrentUserID);
                
                int count = (int)cmd.ExecuteScalar();
                System.Diagnostics.Debug.WriteLine("IsPostOwner: Post sahibi kontrol sonucu = " + (count > 0));
                return (count > 0);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("IsPostOwner hatası: " + ex.Message);
            return false;
        }
    }
}