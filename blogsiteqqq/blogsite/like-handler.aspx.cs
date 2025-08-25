using System;
using System.Data;
using System.Data.SqlClient;
using System.Web;
using System.Configuration;
using System.Text;
using System.Web.Script.Serialization;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class LikeHandler : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
    private bool responseWasSent = false;
    
    protected void Page_Load(object sender, EventArgs e)
    {
        // AJAX Post isteği için CSRF koruması gerekiyor
        HttpContext.Current.Response.Cache.SetCacheability(HttpCacheability.NoCache);
        HttpContext.Current.Response.Cache.SetNoStore();
        
        // Ajax isteği olduğunu kontrol et
        if (Request.HttpMethod == "POST")
        {
            HandleLikeAction();
        }
        else
        {
            // GET istekleri için basit bir açıklama göster
            Response.Write("Bu sayfaya doğrudan erişim yoktur. Ajax POST istekleri için bir işleyicidir.");
        }
    }
    
    private void HandleLikeAction()
    {
        try
        {
            // Kullanıcı oturum açmış mı kontrol et
            if (Session["KullaniciID"] == null)
            {
                SendErrorResponse("Login gerekiyor", 401);
            return;
        }
        
            // Post ID'yi al
            int postId = 0;
            if (!int.TryParse(Request.Form["postId"], out postId) || postId <= 0)
        {
                SendErrorResponse("Geçersiz post ID", 400);
            return;
        }
        
            // Kullanıcı ID'yi al
        int userId = Convert.ToInt32(Session["KullaniciID"]);
        
            // Beğeni işlemini gerçekleştir
        ProcessLikeAction(postId, userId);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Like işlemi hatası: " + ex.Message);
            SendErrorResponse("Bir hata oluştu: " + ex.Message, 500);
        }
    }
    
    private void ProcessLikeAction(int postId, int userId)
    {
        bool isLiked = false;
        int likeCount = 0;
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                System.Diagnostics.Debug.WriteLine(string.Format("Database bağlantısı açıldı - PostId: {0}, UserId: {1}", postId, userId));
                
                // Önce Likes tablosunun varlığını kontrol et
                CheckAndCreateLikesTable(connection);
                
                // Kullanıcının daha önce beğenip beğenmediğini kontrol et
                string checkQuery = "SELECT COUNT(*) FROM Likes WHERE PostID = @PostID AND UserID = @UserID";
                using (SqlCommand checkCommand = new SqlCommand(checkQuery, connection))
                {
                    checkCommand.Parameters.AddWithValue("@PostID", postId);
                    checkCommand.Parameters.AddWithValue("@UserID", userId);
                    
                    int existingLike = (int)checkCommand.ExecuteScalar();
                    
                    if (existingLike > 0)
                    {
                        // Beğeni varsa kaldır
                    string deleteQuery = "DELETE FROM Likes WHERE PostID = @PostID AND UserID = @UserID";
                    using (SqlCommand deleteCommand = new SqlCommand(deleteQuery, connection))
                    {
                        deleteCommand.Parameters.AddWithValue("@PostID", postId);
                        deleteCommand.Parameters.AddWithValue("@UserID", userId);
                            deleteCommand.ExecuteNonQuery();
                        }
                        
                        isLiked = false;
                }
                else
                {
                        // Beğeni yoksa ekle
                        string insertQuery = "INSERT INTO Likes (PostID, UserID, CreatedAt) VALUES (@PostID, @UserID, @CreatedAt)";
                    using (SqlCommand insertCommand = new SqlCommand(insertQuery, connection))
                    {
                        insertCommand.Parameters.AddWithValue("@PostID", postId);
                        insertCommand.Parameters.AddWithValue("@UserID", userId);
                            insertCommand.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                            insertCommand.ExecuteNonQuery();
                        }
                        
                        isLiked = true;
                        
                        // Beğeni bildirimi gönder
                        SendLikeNotification(connection, postId, userId);
                        
                        // Aynı zamanda, görüntülenme sayısını da artır
                        IncrementViewCount(connection, postId, userId);
                    }
                }
                
                // Son beğeni sayısını al
                string countQuery = "SELECT COUNT(*) FROM Likes WHERE PostID = @PostID";
                using (SqlCommand countCommand = new SqlCommand(countQuery, connection))
                {
                    countCommand.Parameters.AddWithValue("@PostID", postId);
                    likeCount = (int)countCommand.ExecuteScalar();
                }
            }
            
            // Beğeni durumunu ve sayısını JSON olarak döndür
            SendSuccessResponse(isLiked, likeCount);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Veritabanı hatası: " + ex.Message);
            throw;
        }
    }
    
    private void CheckAndCreateLikesTable(SqlConnection connection)
    {
        string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Likes'";
        using (SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection))
        {
            int tableExists = (int)checkCommand.ExecuteScalar();
            
            if (tableExists == 0)
            {
                // Likes tablosu yoksa oluştur
                string createTableQuery = @"
                    CREATE TABLE Likes (
                        ID INT IDENTITY(1,1) PRIMARY KEY,
                        PostID INT NOT NULL,
                        UserID INT NOT NULL,
                        CreatedAt DATETIME DEFAULT GETDATE(),
                        CONSTRAINT UC_PostUser UNIQUE (PostID, UserID),
                        FOREIGN KEY (PostID) REFERENCES Posts(PostID),
                        FOREIGN KEY (UserID) REFERENCES Users(UserID)
                    )";
                
                using (SqlCommand createCommand = new SqlCommand(createTableQuery, connection))
                {
                    createCommand.ExecuteNonQuery();
                    System.Diagnostics.Debug.WriteLine("Likes tablosu oluşturuldu");
                }
            }
        }
    }
    
    private void SendLikeNotification(SqlConnection connection, int postId, int userId)
    {
        try
        {
            // Gönderi yazarının ID'sini ve başlığını al
            string authorQuery = "SELECT UserID, Title FROM Posts WHERE PostID = @PostID";
            using (SqlCommand authorCommand = new SqlCommand(authorQuery, connection))
            {
                authorCommand.Parameters.AddWithValue("@PostID", postId);
                using (SqlDataReader reader = authorCommand.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        int authorId = Convert.ToInt32(reader["UserID"]);
                        string postTitle = reader["Title"].ToString();
                        
                        // Kendi gönderisini beğenen kullanıcıya bildirim gönderme
                        if (authorId != userId)
                        {
                            reader.Close();
                            
                            // Beğenen kullanıcının adını al
                            string likerNameQuery = "SELECT Username FROM Users WHERE UserID = @UserID";
                            using (SqlCommand nameCommand = new SqlCommand(likerNameQuery, connection))
                            {
                                nameCommand.Parameters.AddWithValue("@UserID", userId);
                                object nameResult = nameCommand.ExecuteScalar();
                                string likerName = nameResult != null ? nameResult.ToString() : "Bilinmeyen Kullanıcı";
                                
                                // Bildirim içeriği oluştur
                                string notificationContent = likerName + " \"" + postTitle + "\" başlıklı yazınızı beğendi.";
                                
                                // Önce Notifications tablosunun varlığını kontrol et
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
                                                FOREIGN KEY (UserID) REFERENCES Users(UserID),
                                                FOREIGN KEY (SenderID) REFERENCES Users(UserID)
                                            )";
                                        
                                        using (SqlCommand createCommand = new SqlCommand(createTableQuery, connection))
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
                                
                                using (SqlCommand notifCommand = new SqlCommand(insertNotificationQuery, connection))
                                {
                                    notifCommand.Parameters.AddWithValue("@UserID", authorId);
                                    notifCommand.Parameters.AddWithValue("@SenderID", userId);
                                    notifCommand.Parameters.AddWithValue("@Type", "like");
                                    notifCommand.Parameters.AddWithValue("@Content", notificationContent);
                                    notifCommand.Parameters.AddWithValue("@ContentID", postId);
                                    
                                    notifCommand.ExecuteNonQuery();
                                    System.Diagnostics.Debug.WriteLine("Bildirim veritabanına eklendi: " + notificationContent);
                                }
                                
                                // SignalR ile gerçek zamanlı bildirim gönder
                                try
                                {
                                    // Assembly'leri tarayarak NotificationHub'ı bul
                                    System.Type notificationHubType = null;
                                    foreach (System.Reflection.Assembly assembly in System.AppDomain.CurrentDomain.GetAssemblies())
                                    {
                                        notificationHubType = assembly.GetType("blogsiteqqq.NotificationHub");
                                        if (notificationHubType != null)
                                        {
                                            break;
                                        }
                                    }
                                    
                                    if (notificationHubType != null)
                                    {
                                        System.Reflection.MethodInfo sendMethod = notificationHubType.GetMethod("SendNotificationToUser", 
                                            System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
                                        
                                        if (sendMethod != null)
                                        {
                                            sendMethod.Invoke(null, new object[] { authorId, "like", notificationContent, userId, postId });
                                            System.Diagnostics.Debug.WriteLine("Beğeni bildirimi gönderildi: " + authorId);
                                        }
                                        else
                                        {
                                            System.Diagnostics.Debug.WriteLine("SendNotificationToUser metodu bulunamadı");
                                        }
                                    }
                                    else
                                    {
                                        System.Diagnostics.Debug.WriteLine("NotificationHub sınıfı bulunamadı");
                                    }
                                }
                                catch (Exception signalREx)
                                {
                                    System.Diagnostics.Debug.WriteLine("SignalR bildirim hatası: " + signalREx.Message);
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Beğeni bildirimi gönderme hatası: " + ex.Message);
        }
    }

    private void IncrementViewCount(SqlConnection connection, int postId, int userId)
    {
        try
        {
            // PostViews tablosunun varlığını kontrol et
            string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PostViews'";
            using (SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection))
            {
                int tableExists = (int)checkCommand.ExecuteScalar();
                
                if (tableExists == 0)
                {
                    // PostViews tablosu yoksa oluştur
                    string createTableQuery = @"
                        CREATE TABLE PostViews (
                            ID INT IDENTITY(1,1) PRIMARY KEY,
                            PostID INT NOT NULL,
                            ViewerIP NVARCHAR(50),
                            ViewerUserID INT,
                            ViewDate DATETIME DEFAULT GETDATE(),
                            FOREIGN KEY (PostID) REFERENCES Posts(PostID)
                        )";
                    
                    using (SqlCommand createCommand = new SqlCommand(createTableQuery, connection))
                    {
                        createCommand.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("PostViews tablosu oluşturuldu");
                    }
                }
            }
            
            // Kullanıcı IP adresini al
            string userIp = Request.UserHostAddress;
            
            // Son 24 saat içinde aynı kullanıcının kaydı var mı kontrol et
            string checkViewQuery = @"
                SELECT COUNT(*) FROM PostViews 
                WHERE PostID = @PostID AND (
                    (@UserID IS NOT NULL AND ViewerUserID = @UserID) OR 
                    (@UserIP IS NOT NULL AND ViewerIP = @UserIP)
                ) AND ViewDate > @CutoffDate";
            
            using (SqlCommand checkViewCommand = new SqlCommand(checkViewQuery, connection))
            {
                checkViewCommand.Parameters.AddWithValue("@PostID", postId);
                checkViewCommand.Parameters.AddWithValue("@UserID", userId);
                checkViewCommand.Parameters.AddWithValue("@UserIP", userIp);
                checkViewCommand.Parameters.AddWithValue("@CutoffDate", DateTime.Now.AddHours(-24));
                
                int existingViews = (int)checkViewCommand.ExecuteScalar();
                
                if (existingViews == 0)
                {
                    // Yeni görüntüleme kaydı ekle
                    string insertViewQuery = @"
                        INSERT INTO PostViews (PostID, ViewerIP, ViewerUserID, ViewDate)
                        VALUES (@PostID, @ViewerIP, @ViewerUserID, @ViewDate)";
                    
                    using (SqlCommand insertViewCommand = new SqlCommand(insertViewQuery, connection))
                    {
                        insertViewCommand.Parameters.AddWithValue("@PostID", postId);
                        insertViewCommand.Parameters.AddWithValue("@ViewerIP", userIp);
                        insertViewCommand.Parameters.AddWithValue("@ViewerUserID", userId);
                        insertViewCommand.Parameters.AddWithValue("@ViewDate", DateTime.Now);
                        
                        insertViewCommand.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("Görüntüleme sayısı güncellendi");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Görüntüleme artırma hatası: " + ex.Message);
            // İşlemi devam ettir, beğeni işlemini etkilemesin
        }
    }
    
    private void SendSuccessResponse(bool isLiked, int likeCount)
    {
        if (!responseWasSent)
        {
            try
            {
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                var response = new { 
                    success = true, 
                    liked = isLiked, 
                    likeCount = likeCount,
                    message = isLiked ? "Gönderi beğenildi" : "Beğeni kaldırıldı"
                };
                
                string jsonResponse = serializer.Serialize(response);
                System.Diagnostics.Debug.WriteLine(string.Format("Başarı yanıtı: {0}", jsonResponse));
                
                Response.Clear();
                Response.ContentType = "application/json";
                Response.Write(jsonResponse);
                responseWasSent = true;
                Response.End();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Başarı yanıtı gönderirken hata oluştu: {0}", ex.Message));
            }
        }
    }
    
    private void SendErrorResponse(string message, int statusCode)
    {
        if (!responseWasSent)
        {
            try
            {
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                var response = new { success = false, message = message };
                
                string jsonResponse = serializer.Serialize(response);
                System.Diagnostics.Debug.WriteLine(string.Format("Hata yanıtı: {0}", jsonResponse));
                
                Response.Clear();
                Response.ContentType = "application/json";
                Response.StatusCode = statusCode;
                Response.Write(jsonResponse);
                responseWasSent = true;
                Response.End();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Hata yanıtı gönderirken hata oluştu: {0}", ex.Message));
                
                if (!responseWasSent)
                {
                    Response.ContentType = "application/json";
                    Response.Write("{\"success\":false,\"message\":\"İşlem sırasında hata oluştu.\"}");
                    responseWasSent = true;
                    Response.End();
                }
            }
        }
    }
} 