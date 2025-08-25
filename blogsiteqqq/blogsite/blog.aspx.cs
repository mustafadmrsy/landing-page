using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Text;

public partial class Blog : System.Web.UI.Page
{
    // Veritabanı bağlantı dizesini web.config'den al
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
    private int postId = 0;

    protected void Page_Load(object sender, EventArgs e)
    {
        // Sayfa body etiketine blog-page sınıfı ekle
        Page.ClientScript.RegisterStartupScript(this.GetType(), "AddBodyClass", 
            "document.body.classList.add('blog-page');", true);
        
        if (!IsPostBack)
        {
            LoadBlogPost();
            CheckUserLoginStatus();
        }
    }

    private void LoadBlogPost()
    {
        // URL'den post ID'sini al
        string idParam = Request.QueryString["id"];
        
        // "undefined" kontrolü ekle
        if (idParam == "undefined")
        {
            ShowError("Geçersiz blog yazısı ID'si: undefined. Lütfen geçerli bir blog yazısı seçin.");
            return;
        }
        
        if (!string.IsNullOrEmpty(idParam) && int.TryParse(idParam, out postId))
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Blog yazısını çek
                    LoadPostDetails(connection);

                    // Görüntülenme sayısını artır
                    UpdateViewCount(connection);

                    // Yorumları çek
                    LoadComments();
                }
            }
            catch (Exception ex)
            {
                // Hata durumunda kullanıcıya uygun mesaj göster
                ShowError("Blog yazısı yüklenirken bir hata oluştu: " + ex.Message);
                LogError("Blog post yükleme hatası", ex);
            }
        }
        else
        {
            // Geçersiz veya eksik ID
            ShowError("Geçersiz blog yazısı ID'si. Lütfen geçerli bir blog yazısı seçin.");
        }
    }

    private void LoadPostDetails(SqlConnection connection)
    {
        string query = @"
            SELECT p.Title, p.Content, p.CreatedAt, p.PhotoPath, p.UserID,
                   u.Username, c.CategoryName, p.PostID
            FROM Posts p
            LEFT JOIN Users u ON p.UserID = u.UserID
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE p.PostID = @PostID";

        using (SqlCommand command = new SqlCommand(query, connection))
        {
            command.Parameters.AddWithValue("@PostID", postId);

            using (SqlDataReader reader = command.ExecuteReader())
            {
                if (reader.Read())
                {
                    // Blog başlığı ve içeriği
                    blogTitle.InnerText = reader["Title"].ToString();
                    
                    // İçerik yükleme
                    string content = reader["Content"].ToString();
                    
                    // Kapak fotoğrafı kontrolü ve debug
                    System.Diagnostics.Debug.WriteLine("PhotoPath kontrolü:");
                    if (reader["PhotoPath"] != DBNull.Value)
                    {
                        System.Diagnostics.Debug.WriteLine("PhotoPath değeri var: " + reader["PhotoPath"].ToString());
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("PhotoPath değeri NULL");
                    }
                    
                    if (reader["PhotoPath"] != DBNull.Value && !string.IsNullOrEmpty(reader["PhotoPath"].ToString()))
                    {
                        string photoPath = reader["PhotoPath"].ToString();
                        System.Diagnostics.Debug.WriteLine("Yüklenecek resim: " + photoPath);
                        
                        // URL kontrolü yap
                        if (!photoPath.StartsWith("http") && !photoPath.StartsWith("/"))
                        {
                            photoPath = "/" + photoPath;
                            System.Diagnostics.Debug.WriteLine("Resim yolu düzeltildi: " + photoPath);
                        }
                        
                        // Fotoğraf yolu içerikte yoksa, ekle
                        if (!content.Contains(photoPath))
                        {
                            try
                            {
                                // İçeriğin başına büyük kapak fotoğrafı olarak ekle
                                string imgHtml = "<div class='blog-cover-container'><img src=\"" + photoPath + 
                                                "\" alt=\"Blog Kapak Resmi\" class=\"blog-cover-image\"></div>";
                                
                                content = imgHtml + content;
                                System.Diagnostics.Debug.WriteLine("İçeriğe resim eklendi: " + imgHtml);
                            }
                            catch (Exception ex)
                            {
                                System.Diagnostics.Debug.WriteLine("Resim ekleme hatası: " + ex.Message);
                            }
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine("Resim zaten içerikte var, eklenmedi");
                            
                            // İçerikteki ilk resmi başa taşıyıp kapak resmi yap
                            try
                            {
                                System.Text.RegularExpressions.Regex imgRegex = 
                                    new System.Text.RegularExpressions.Regex("<img[^>]*src=[\"']" + photoPath + "[\"'][^>]*>");
                                
                                if (imgRegex.IsMatch(content))
                                {
                                    string imgMatch = imgRegex.Match(content).Value;
                                    content = content.Replace(imgMatch, ""); // Mevcut resmi kaldır
                                    
                                    // En başa büyük kapak resmi olarak ekle
                                    string imgHtml = "<div class='blog-cover-container'><img src=\"" + photoPath + 
                                                    "\" alt=\"Blog Kapak Resmi\" class=\"blog-cover-image\"></div>";
                                    
                                    content = imgHtml + content;
                                    System.Diagnostics.Debug.WriteLine("Resim içerikten başa taşındı");
                                }
                            }
                            catch (Exception ex)
                            {
                                System.Diagnostics.Debug.WriteLine("Resim taşıma hatası: " + ex.Message);
                            }
                        }
                    }
                    
                    // İçeriği yükle
                    blogContent.InnerHtml = content;
                    System.Diagnostics.Debug.WriteLine("İçerik HTML'e yüklendi, uzunluk: " + content.Length);

                    // Meta bilgileri
                    string username = reader["Username"].ToString();
                    string userId = reader["UserID"].ToString();
                    blogAuthor.InnerHtml = "<i class='fas fa-user'></i> <span class='meta-text'><a href='userpage.aspx?id=" + userId + "'>" + username + "</a></span>";
                    blogDate.InnerHtml = "<i class='fas fa-calendar-alt'></i> <span class='meta-text'>" + Convert.ToDateTime(reader["CreatedAt"]).ToString("dd MMMM yyyy") + "</span>";
                    blogCategory.InnerHtml = "<i class='fas fa-folder'></i> <span class='meta-text'>" + reader["CategoryName"].ToString() + "</span>";
                    
                    // Görüntülenme sayısı - varsayılan olarak 1 olarak ayarla
                    blogViews.InnerHtml = "<i class='fas fa-eye'></i> <span class='meta-text'>1</span>";

                    // Kullanıcı giriş yapmış ve post'un sahibi ise silme butonunu göster
                    if (Session["KullaniciID"] != null)
                    {
                        int currentUserId = Convert.ToInt32(Session["KullaniciID"]);
                        int postUserId = Convert.ToInt32(reader["UserID"]);
                        
                        // Debug için session bilgisini logla
                        System.Diagnostics.Debug.WriteLine("Session KullaniciID: " + currentUserId);
                        System.Diagnostics.Debug.WriteLine("Post UserID: " + postUserId);
                        System.Diagnostics.Debug.WriteLine("postId: " + postId);
                        System.Diagnostics.Debug.WriteLine("RequestIP: " + Request.UserHostAddress);
                        System.Diagnostics.Debug.WriteLine("Server Variables: " + Request.ServerVariables["REMOTE_ADDR"]);
                        
                        // Kullanıcı post'un sahibi ise silme butonunu göster
                        if (currentUserId == postUserId)
                        {
                            System.Diagnostics.Debug.WriteLine("KULLANICI POST SAHİBİ - SİLME BUTONU GÖSTERİLİYOR");
                            Panel deletePanel = FindControl("pnlDeleteButton") as Panel;
                            if (deletePanel != null)
                            {
                                deletePanel.Visible = true;
                            }
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine("KULLANICI POST SAHİBİ DEĞİL");
                        }
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("KULLANICI GİRİŞ YAPMAMIŞ");
                    }

                    // Etiketler için kontrol - şu an için gizli
                    tagsContainer.Visible = false;

                    // Meta etiketlerini ayarla
                    string description = Regex.Replace(reader["Content"].ToString(), "<.*?>", string.Empty);
                    
                    if (description.Length > 160)
                    {
                        description = description.Substring(0, 157) + "...";
                    }
                    
                    // Sayfa başlığını ayarla
                    Page.Title = reader["Title"].ToString() + " - SNK Blog";
                    
                    // Meta açıklamasını ekle
                    HtmlMeta metaDescription = new HtmlMeta();
                    metaDescription.Name = "description";
                    metaDescription.Content = description;
                    Page.Header.Controls.Add(metaDescription);
                }
                else
                {
                    ShowError("İstediğiniz blog yazısı bulunamadı veya yayından kaldırılmış olabilir.");
                }
            }
        }
    }

    private void UpdateViewCount(SqlConnection connection)
    {
        try
        {
            // ViewCount için PostViews tablosunun varlığını kontrol et
            string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PostViews'";
            using (SqlCommand checkCmd = new SqlCommand(checkTableQuery, connection))
            {
                int tableExists = (int)checkCmd.ExecuteScalar();
                
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
                    
                    using (SqlCommand createCmd = new SqlCommand(createTableQuery, connection))
                    {
                        createCmd.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("PostViews tablosu oluşturuldu");
                    }
                }
            }
            
            // Kullanıcı IP adresi veya kimliğinin daha önce bu yazıyı görüntüleyip görüntülemediğini kontrol et
            string userIp = Request.UserHostAddress;
            int? userId = null;
            
            if (Session["KullaniciID"] != null)
            {
                userId = Convert.ToInt32(Session["KullaniciID"]);
            }
            
            System.Diagnostics.Debug.WriteLine("Görüntüleme kontrolü - Kullanıcı IP: " + userIp);
            System.Diagnostics.Debug.WriteLine("Görüntüleme kontrolü - Kullanıcı ID: " + (userId.HasValue ? userId.ToString() : "null"));
            
            // Sorgu düzeltildi: Her kullanıcı için ayrı kontrol yapılıyor
            string checkViewQuery = @"
                SELECT COUNT(*) FROM PostViews 
                WHERE PostID = @PostID AND (
                    (ViewerUserID = @UserID AND @UserID IS NOT NULL) OR 
                    (ViewerIP = @UserIP AND @UserIP IS NOT NULL AND ViewerUserID IS NULL)
                ) AND ViewDate > @CutoffDate";
            
            using (SqlCommand checkViewCmd = new SqlCommand(checkViewQuery, connection))
            {
                checkViewCmd.Parameters.AddWithValue("@PostID", postId);
                
                if (userId.HasValue)
                {
                    checkViewCmd.Parameters.AddWithValue("@UserID", userId.Value);
                }
                else
                {
                    checkViewCmd.Parameters.AddWithValue("@UserID", DBNull.Value);
                }
                
                checkViewCmd.Parameters.AddWithValue("@UserIP", userIp);
                checkViewCmd.Parameters.AddWithValue("@CutoffDate", DateTime.Now.AddHours(-24));
                
                int viewCount = (int)checkViewCmd.ExecuteScalar();
                System.Diagnostics.Debug.WriteLine("Görüntüleme kontrolü sonucu: " + viewCount);
                
                if (viewCount == 0)
                {
                    // Yeni görüntüleme kaydı ekle
                    string insertViewQuery = @"
                        INSERT INTO PostViews (PostID, ViewerIP, ViewerUserID, ViewDate)
                        VALUES (@PostID, @ViewerIP, @ViewerUserID, @ViewDate)";
                    
                    using (SqlCommand insertViewCmd = new SqlCommand(insertViewQuery, connection))
                    {
                        insertViewCmd.Parameters.AddWithValue("@PostID", postId);
                        insertViewCmd.Parameters.AddWithValue("@ViewerIP", userIp);
                        
                        if (userId.HasValue)
                        {
                            insertViewCmd.Parameters.AddWithValue("@ViewerUserID", userId.Value);
                        }
                        else
                        {
                            insertViewCmd.Parameters.AddWithValue("@ViewerUserID", DBNull.Value);
                        }
                        
                        insertViewCmd.Parameters.AddWithValue("@ViewDate", DateTime.Now);
                        
                        insertViewCmd.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("Görüntüleme sayısı güncellendi - Yeni görüntüleme eklendi");
                    }
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("Bu kullanıcı/IP son 24 saat içinde zaten görüntülemiş");
                }
            }
            
            // Güncel görüntüleme sayısını görüntüle
            string getViewsQuery = "SELECT COUNT(*) FROM PostViews WHERE PostID = @PostID";
            using (SqlCommand getViewsCmd = new SqlCommand(getViewsQuery, connection))
            {
                getViewsCmd.Parameters.AddWithValue("@PostID", postId);
                
                int viewCount = (int)getViewsCmd.ExecuteScalar();
                blogViews.InnerHtml = "<i class='fas fa-eye'></i> <span class='meta-text'>" + viewCount.ToString() + "</span>";
                
                System.Diagnostics.Debug.WriteLine("Toplam görüntüleme sayısı: " + viewCount);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Görüntüleme sayısı güncellenirken bir hata oluştu: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
        }
    }

    private void LoadComments()
    {
        try
        {
            if (postId <= 0)
            {
                System.Diagnostics.Debug.WriteLine("LoadComments: postId <= 0, yorumlar yüklenemiyor.");
                return;
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Önce Comments tablosunun varlığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comments'";
                SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection);
                int tableExists = (int)checkCommand.ExecuteScalar();

                if (tableExists == 0)
                {
                    // Comments tablosu yoksa, yorumlar da yoktur
                    System.Diagnostics.Debug.WriteLine("LoadComments: Comments tablosu bulunamadı.");
                    noCommentsMessage.Visible = true;
                    return;
                }

                // IsApproved sütunu var mı kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
                SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, connection);
                int columnExists = (int)checkColumnCommand.ExecuteScalar();

                // ParentCommentID sütunu var mı kontrol et
                string checkParentColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'ParentCommentID'";
                SqlCommand checkParentColumnCommand = new SqlCommand(checkParentColumnQuery, connection);
                int parentColumnExists = (int)checkParentColumnCommand.ExecuteScalar();

                string query;
                if (columnExists > 0)
                {
                    // IsApproved sütunu varsa ve ParentCommentID sütunu da varsa, sadece ana yorumları getir
                    if (parentColumnExists > 0)
                    {
                        query = @"
                            SELECT c.CommentID, c.CommentText, c.CreatedAt, c.UserID, u.Username 
                            FROM Comments c
                            INNER JOIN Users u ON c.UserID = u.UserID
                            WHERE c.PostID = @PostID AND c.IsApproved = 1 AND (c.ParentCommentID IS NULL OR c.ParentCommentID = 0)
                            ORDER BY c.CreatedAt DESC";
                    }
                    else
                    {
                        // ParentCommentID sütunu yoksa, tüm yorumları getir
                    query = @"
                        SELECT c.CommentID, c.CommentText, c.CreatedAt, c.UserID, u.Username 
                        FROM Comments c
                        INNER JOIN Users u ON c.UserID = u.UserID
                        WHERE c.PostID = @PostID AND c.IsApproved = 1
                        ORDER BY c.CreatedAt DESC";
                    }
                }
                else
                {
                    // IsApproved sütunu yoksa, tüm yorumları getir
                    query = @"
                        SELECT c.CommentID, c.CommentText, c.CreatedAt, c.UserID, u.Username 
                        FROM Comments c
                        INNER JOIN Users u ON c.UserID = u.UserID
                        WHERE c.PostID = @PostID
                        ORDER BY c.CreatedAt DESC";
                }

                SqlCommand command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@PostID", postId);

                // Veri adaptörü ve veri tablosu oluştur
                SqlDataAdapter adapter = new SqlDataAdapter(command);
                DataTable commentsTable = new DataTable();
                adapter.Fill(commentsTable);

                // Yorum sayısını kontrol et
                int commentCount = commentsTable.Rows.Count;
                System.Diagnostics.Debug.WriteLine("Yorum sayısı: " + commentCount);

                if (commentCount > 0)
                {
                    // Repeater'a veri kaynağını bağla
                    rptComments.DataSource = commentsTable;
                    rptComments.DataBind();
                    noCommentsMessage.Visible = false;
                    System.Diagnostics.Debug.WriteLine("Yorumlar repeater'a başarıyla yüklendi");
                }
                else
                {
                    // Yorum yoksa mesajı göster
                    rptComments.DataSource = null;
                    rptComments.DataBind();
                    noCommentsMessage.Visible = true;
                    System.Diagnostics.Debug.WriteLine("Hiç yorum bulunamadı. Mesaj görüntüleniyor.");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("LoadComments hatası: " + ex.Message);
            LogError("Yorumları yükleme hatası", ex);
        }
    }

    protected void btnSubmitComment_Click(object sender, EventArgs e)
    {
        // Yorum ekleme işlemine geçmeden önce postId değerini kontrol et
        if (Request.QueryString["id"] == null || !int.TryParse(Request.QueryString["id"], out postId))
        {
            ShowError("Yorum eklenemiyor. Geçersiz blog yazısı.");
            return;
        }

        try
        {
            int? userId = null;
            string commentText = txtCommentText.Text.Trim();

            // Kullanıcı giriş yapmışsa, kullanıcı ID'sini al
            if (Session["KullaniciID"] != null)
            {
                userId = Convert.ToInt32(Session["KullaniciID"]);
            }
            else
            {
                // Sadece giriş yapmış kullanıcılar yorum yapabilir
                ShowError("Yorum yapabilmek için giriş yapmalısınız.");
                return;
            }

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Önce Comments tablosunun varlığını kontrol edelim
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comments'";
                SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection);
                int tableExists = (int)checkCommand.ExecuteScalar();

                if (tableExists == 0)
                {
                    // Comments tablosu yoksa oluşturalım (IsApproved sütunu ile birlikte)
                    string createTableQuery = @"
                        CREATE TABLE Comments (
                            CommentID INT IDENTITY(1,1) PRIMARY KEY,
                            PostID INT NOT NULL,
                            UserID INT NOT NULL,
                            CommentText NVARCHAR(MAX) NOT NULL,
                            CreatedAt DATETIME DEFAULT GETDATE(),
                            IsApproved BIT DEFAULT 1,
                            ParentCommentID INT NULL,
                            FOREIGN KEY (PostID) REFERENCES Posts(PostID),
                            FOREIGN KEY (UserID) REFERENCES Users(UserID)
                        )";
                    
                    SqlCommand createCommand = new SqlCommand(createTableQuery, connection);
                    createCommand.ExecuteNonQuery();
                }
                else
                {
                    // Tablo var ama IsApproved sütunu var mı kontrol et
                    string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
                    SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, connection);
                    int columnExists = (int)checkColumnCommand.ExecuteScalar();

                    if (columnExists == 0)
                    {
                        // IsApproved sütunu yoksa ekle
                        string addColumnQuery = "ALTER TABLE Comments ADD IsApproved BIT DEFAULT 1";
                        SqlCommand addColumnCommand = new SqlCommand(addColumnQuery, connection);
                        addColumnCommand.ExecuteNonQuery();
                    }
                }

                // Son 2 dakika içinde aynı kullanıcı tarafından aynı gönderiye yapılan yorum var mı kontrol et
                string checkTimeoutQuery = @"
                    SELECT COUNT(*) FROM Comments 
                    WHERE UserID = @UserID AND PostID = @PostID AND CreatedAt > DATEADD(MINUTE, -2, GETDATE())";
                
                using (SqlCommand timeoutCommand = new SqlCommand(checkTimeoutQuery, connection))
                {
                    timeoutCommand.Parameters.AddWithValue("@UserID", userId.Value);
                    timeoutCommand.Parameters.AddWithValue("@PostID", postId);
                    
                    int recentCommentCount = (int)timeoutCommand.ExecuteScalar();
                    
                    if (recentCommentCount > 0)
                    {
                        ShowError("Aynı gönderi için 2 dakika içinde birden fazla yorum yapamazsınız. Lütfen daha sonra tekrar deneyin.");
                        return;
                    }
                }

                // Yorumu veritabanına ekle (otomatik onaylı olarak)
                string query = @"
                    INSERT INTO Comments (PostID, UserID, CommentText, CreatedAt, IsApproved)
                    VALUES (@PostID, @UserID, @CommentText, @CreatedAt, 1)";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postId);
                    command.Parameters.AddWithValue("@UserID", userId.Value);
                    command.Parameters.AddWithValue("@CommentText", commentText);
                    command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                    
                    command.ExecuteNonQuery();
                    
                    System.Diagnostics.Debug.WriteLine("Yorum başarıyla eklendi. PostID: " + postId + ", UserID: " + userId.Value);
                }
            }

            // Başarılı mesajını göster ve formu temizle
            txtCommentText.Text = string.Empty;
            pnlCommentSuccess.Visible = true;
            
            // 1 saniye sonra sayfayı yenileyerek yeni yorumu göster
            string refreshScript = @"
                <script type='text/javascript'>
                    setTimeout(function() {
                        window.location.href = window.location.href;
                    }, 1000);
                </script>";
            
            ClientScript.RegisterStartupScript(this.GetType(), "RefreshPage", refreshScript);
            
            // Başarı mesajını güncelle
            pnlCommentSuccess.Controls.Clear();
            HtmlGenericControl icon = new HtmlGenericControl("i");
            icon.Attributes["class"] = "fas fa-check-circle";
            HtmlGenericControl message = new HtmlGenericControl("p");
            message.InnerText = "Yorumunuz başarıyla yayınlandı. Teşekkür ederiz!";
            pnlCommentSuccess.Controls.Add(icon);
            pnlCommentSuccess.Controls.Add(message);
            
            // Yorumları yeniden yükle
            LoadComments();
        }
        catch (Exception ex)
        {
            ShowError("Yorumunuz gönderilirken bir hata oluştu: " + ex.Message);
            LogError("Yorum gönderme hatası", ex);
        }
    }

    private void CheckUserLoginStatus()
    {
        // Kullanıcı giriş yapmışsa isim alanını gösterme
        if (Session["KullaniciID"] != null)
        {
            nameFieldContainer.Visible = false;
            pnlLoginReminder.Visible = false;
            pnlCommentForm.Visible = true;
        }
        else
        {
            // Kullanıcı giriş yapmamışsa yorum formunu gizle ve giriş hatırlatıcısını göster
            nameFieldContainer.Visible = false;
            pnlCommentForm.Visible = false;
            pnlLoginReminder.Visible = true;
        }
    }

    private void ShowError(string message)
    {
        // Hata panelini görünür yap ve mesajı göster
        pnlError.Visible = true;
        errorText.InnerText = message;
        
        // Ana içeriği gizle
        if (blogTitle != null)
        {
            blogTitle.InnerText = "Hata";
        }
    }

    private void LogError(string message, Exception ex)
    {
        // Hata logları için (isterseniz veritabanına ya da dosyaya kaydedilebilir)
        System.Diagnostics.Debug.WriteLine(message + ": " + ex.Message);
        System.Diagnostics.Debug.WriteLine("Stack Trace: " + ex.StackTrace);
    }
    
    // Silme butonu için olay işleyicisi
    protected void btnDeletePost_Click(object sender, EventArgs e)
    {
        try
        {
            if (Session["KullaniciID"] == null)
            {
                ShowError("Bu işlemi gerçekleştirmek için giriş yapmalısınız.");
                return;
            }

            // Post ID'yi al
            if (Request.QueryString["id"] == null || !int.TryParse(Request.QueryString["id"], out postId))
            {
                ShowError("Geçersiz blog yazısı ID'si.");
                return;
            }

            // Kullanıcının yetkisini kontrol et
            int currentUserId = Convert.ToInt32(Session["KullaniciID"]);
            bool isAuthorized = false;

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT UserID FROM Posts WHERE PostID = @PostID";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postId);
                    
                    object result = command.ExecuteScalar();
                    if (result != null && Convert.ToInt32(result) == currentUserId)
                    {
                        isAuthorized = true;
                    }
                }

                // Kullanıcı post'un sahibiyse silme işlemini gerçekleştir
                if (isAuthorized)
                {
                    // Önce PostViews tablosundaki kayıtları sil
                    try
                    {
                        string deleteViewsQuery = "DELETE FROM PostViews WHERE PostID = @PostID";
                        using (SqlCommand command = new SqlCommand(deleteViewsQuery, connection))
                        {
                            command.Parameters.AddWithValue("@PostID", postId);
                            command.ExecuteNonQuery();
                            System.Diagnostics.Debug.WriteLine("PostViews kayıtları silindi: PostID=" + postId);
                        }
                    }
                    catch (Exception viewEx)
                    {
                        // PostViews tablosu yoksa veya başka bir hata olursa logla ama işleme devam et
                        System.Diagnostics.Debug.WriteLine("PostViews silme hatası: " + viewEx.Message);
                    }
                    
                    // Sonra yorumları sil
                    string deleteCommentsQuery = "DELETE FROM Comments WHERE PostID = @PostID";
                    using (SqlCommand command = new SqlCommand(deleteCommentsQuery, connection))
                    {
                        command.Parameters.AddWithValue("@PostID", postId);
                        int commentCount = command.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine(commentCount + " adet yorum silindi");
                    }
                    
                    // Bildirim tablosu varsa, ilgili bildirimleri sil
                    try
                    {
                        string deleteNotificationsQuery = "DELETE FROM Notifications WHERE ContentID = @PostID";
                        using (SqlCommand command = new SqlCommand(deleteNotificationsQuery, connection))
                        {
                            command.Parameters.AddWithValue("@PostID", postId);
                            command.ExecuteNonQuery();
                        }
                    }
                    catch (Exception notificationEx)
                    {
                        // Bildirim tablosu yoksa veya başka bir hata olursa logla ama işleme devam et
                        System.Diagnostics.Debug.WriteLine("Bildirim silme hatası: " + notificationEx.Message);
                    }
                    
                    // Son olarak postu sil
                    string deletePostQuery = "DELETE FROM Posts WHERE PostID = @PostID";
                    using (SqlCommand command = new SqlCommand(deletePostQuery, connection))
                    {
                        command.Parameters.AddWithValue("@PostID", postId);
                        int result = command.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("Blog yazısı silindi: " + (result > 0 ? "Başarılı" : "Başarısız"));
                    }
                    
                    // Anasayfaya yönlendir
                    Response.Redirect("default.aspx");
                }
                else
                {
                    ShowError("Bu yazıyı silmek için yetkiniz bulunmuyor.");
                }
            }
        }
        catch (Exception ex)
        {
            ShowError("Post silinirken bir hata oluştu: " + ex.Message);
            LogError("Post silme hatası", ex);
        }
    }

    // Yorum listesi bağlandığında alt yorumları yükle
    protected void rptComments_ItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {
            DataRowView rowView = (DataRowView)e.Item.DataItem;
            int commentId = Convert.ToInt32(rowView["CommentID"]);
            
            // Alt yorumları yükle
            Repeater rptReplies = (Repeater)e.Item.FindControl("rptReplies");
            if (rptReplies != null)
            {
                LoadReplies(rptReplies, commentId);
            }
        }
    }
    
    // Alt yorumları yükleme
    private void LoadReplies(Repeater repeater, int parentCommentId)
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // ParentCommentID sütununun varlığını kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'ParentCommentID'";
                SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, connection);
                int columnExists = (int)checkColumnCommand.ExecuteScalar();
                
                System.Diagnostics.Debug.WriteLine("LoadReplies - ParentCommentID sütunu var mı? " + (columnExists > 0 ? "Evet" : "Hayır"));
                
                if (columnExists == 0)
                {
                    // ParentCommentID sütunu yoksa ekle
                    string addColumnQuery = "ALTER TABLE Comments ADD ParentCommentID INT NULL";
                    SqlCommand addColumnCommand = new SqlCommand(addColumnQuery, connection);
                    addColumnCommand.ExecuteNonQuery();
                    
                    System.Diagnostics.Debug.WriteLine("LoadReplies - ParentCommentID sütunu eklendi");
                    return; // Henüz veri olmayacağı için boş döndür
                }
                
                // Alt yorumları getiren sorgu
                string query = @"
                    SELECT c.CommentID, c.CommentText, c.CreatedAt, c.UserID, u.Username 
                    FROM Comments c
                    INNER JOIN Users u ON c.UserID = u.UserID
                    WHERE c.ParentCommentID = @ParentCommentID AND c.IsApproved = 1
                    ORDER BY c.CreatedAt ASC";
                
                System.Diagnostics.Debug.WriteLine("LoadReplies - Sorgu: " + query);
                System.Diagnostics.Debug.WriteLine("LoadReplies - ParentCommentID: " + parentCommentId);
                
                SqlCommand command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@ParentCommentID", parentCommentId);
                
                // Veri adaptörü ve veri tablosu oluştur
                SqlDataAdapter adapter = new SqlDataAdapter(command);
                DataTable repliesTable = new DataTable();
                adapter.Fill(repliesTable);
                
                int replyCount = repliesTable.Rows.Count;
                System.Diagnostics.Debug.WriteLine("LoadReplies - Yanıt sayısı: " + replyCount);
                
                // Alt yorumları repeater'a bağla
                if (replyCount > 0)
                {
                    repeater.DataSource = repliesTable;
                    repeater.DataBind();
                    repeater.Visible = true;
                    System.Diagnostics.Debug.WriteLine("LoadReplies - Yanıtlar başarıyla bağlandı");
                    
                    // Hata ayıklama için yanıtları listele
                    foreach (DataRow row in repliesTable.Rows)
                    {
                        System.Diagnostics.Debug.WriteLine("LoadReplies - Yanıt: ID=" + row["CommentID"] + 
                            ", UserID=" + row["UserID"] + ", Text=" + row["CommentText"]);
                    }
                }
                else
                {
                    repeater.Visible = false;
                    System.Diagnostics.Debug.WriteLine("LoadReplies - Yanıt bulunamadı");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("LoadReplies hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("LoadReplies hata detayı: " + ex.StackTrace);
            LogError("Alt yorumları yükleme hatası", ex);
        }
    }
    
    // Yanıt gönderme butonu için olay işleyicisi
    protected void btnSubmitReply_Click(object sender, EventArgs e)
    {
        // Kullanıcı giriş yapmışsa işlem yap
        if (Session["KullaniciID"] == null)
        {
            ShowError("Yanıt vermek için giriş yapmalısınız.");
            return;
        }
        
        try
        {
            // URL'den post ID'sini al
            if (Request.QueryString["id"] == null || !int.TryParse(Request.QueryString["id"], out postId))
            {
                ShowError("Geçersiz blog yazısı ID'si.");
                return;
            }
            
            // Butonun bulunduğu kontrol ağacından yanıt metnini ve üst yorum ID'sini al
            Button btn = (Button)sender;
            RepeaterItem item = (RepeaterItem)btn.NamingContainer;
            
            TextBox txtReplyText = (TextBox)item.FindControl("txtReplyText");
            HiddenField hdnParentCommentID = (HiddenField)item.FindControl("hdnParentCommentID");
            
            if (txtReplyText == null || hdnParentCommentID == null)
            {
                ShowError("Yanıt formu bilgileri alınamadı.");
                System.Diagnostics.Debug.WriteLine("Yanıt formu kontrolleri bulunamadı: txtReplyText=" + (txtReplyText != null) + ", hdnParentCommentID=" + (hdnParentCommentID != null));
                return;
            }
            
            string replyText = txtReplyText.Text.Trim();
            int parentCommentId;
            
            // ParentCommentID'yi doğru şekilde alma
            if (!int.TryParse(hdnParentCommentID.Value, out parentCommentId))
            {
                ShowError("Geçersiz üst yorum ID'si.");
                System.Diagnostics.Debug.WriteLine("Geçersiz ParentCommentID: " + hdnParentCommentID.Value);
                return;
            }
            
            int userId = Convert.ToInt32(Session["KullaniciID"]);
            
            if (string.IsNullOrEmpty(replyText))
            {
                ShowError("Yanıt metni boş olamaz.");
                return;
            }
            
            System.Diagnostics.Debug.WriteLine("Yanıt ekleniyor: PostID=" + postId + ", UserID=" + userId + ", ParentCommentID=" + parentCommentId + ", Text=" + replyText);
            
            // Yanıtı veritabanına ekle
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // ParentCommentID sütunu var mı kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'ParentCommentID'";
                SqlCommand checkCommand = new SqlCommand(checkColumnQuery, connection);
                int columnExists = (int)checkCommand.ExecuteScalar();
                
                System.Diagnostics.Debug.WriteLine("ParentCommentID sütunu var mı? " + (columnExists > 0 ? "Evet" : "Hayır"));
                
                if (columnExists == 0)
                {
                    // ParentCommentID sütunu yoksa ekle
                    string addColumnQuery = "ALTER TABLE Comments ADD ParentCommentID INT NULL";
                    SqlCommand addCommand = new SqlCommand(addColumnQuery, connection);
                    addCommand.ExecuteNonQuery();
                    System.Diagnostics.Debug.WriteLine("ParentCommentID sütunu eklendi");
                }
                
                // Son 2 dakika içinde aynı kullanıcı tarafından aynı yoruma yapılan yanıt var mı kontrol et
                string checkTimeoutQuery = @"
                    SELECT COUNT(*) FROM Comments 
                    WHERE UserID = @UserID AND ParentCommentID = @ParentCommentID 
                    AND CreatedAt > DATEADD(MINUTE, -2, GETDATE())";
                
                using (SqlCommand timeoutCommand = new SqlCommand(checkTimeoutQuery, connection))
                {
                    timeoutCommand.Parameters.AddWithValue("@UserID", userId);
                    timeoutCommand.Parameters.AddWithValue("@ParentCommentID", parentCommentId);
                    
                    int recentReplyCount = (int)timeoutCommand.ExecuteScalar();
                    
                    if (recentReplyCount > 0)
                    {
                        ShowError("Aynı yoruma 2 dakika içinde birden fazla yanıt yapamazsınız. Lütfen daha sonra tekrar deneyin.");
                        return;
                    }
                }
                
                // Yanıtı ekle (Debug için komutun SQL metnini çıktı olarak ver)
                string insertQuery = @"
                    INSERT INTO Comments (PostID, UserID, CommentText, CreatedAt, IsApproved, ParentCommentID)
                    VALUES (@PostID, @UserID, @CommentText, @CreatedAt, 1, @ParentCommentID)";
                
                System.Diagnostics.Debug.WriteLine("Yanıt ekleme sorgusu: " + insertQuery);
                System.Diagnostics.Debug.WriteLine("Parametreler: PostID=" + postId + ", UserID=" + userId + 
                    ", CommentText='" + replyText + "', ParentCommentID=" + parentCommentId);
                
                using (SqlCommand command = new SqlCommand(insertQuery, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postId);
                    command.Parameters.AddWithValue("@UserID", userId);
                    command.Parameters.AddWithValue("@CommentText", replyText);
                    command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                    command.Parameters.AddWithValue("@ParentCommentID", parentCommentId);
                    
                    try
                    {
                        int rowsAffected = command.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("Yanıt ekleme sonucu: " + rowsAffected + " satır etkilendi");
                        
                        if (rowsAffected > 0)
                        {
                            // Başarılı
                            System.Diagnostics.Debug.WriteLine("Yanıt başarıyla eklendi.");
                        }
                        else
                        {
                            // Başarısız
                            System.Diagnostics.Debug.WriteLine("Yanıt eklenemedi!");
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("Yanıt ekleme hatası: " + ex.Message);
                        System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
                        throw; // hatayı yukarı ilet
                    }
                }
            }
            
            // Sayfayı yeniden yükle
            string refreshScript = "alert('Yanıtınız başarıyla eklendi.'); " +
                "window.location.href = window.location.href.split('#')[0] + '#comment-" + parentCommentId + "'; " +
                "location.reload();";
            
            ClientScript.RegisterStartupScript(this.GetType(), "RefreshPage", refreshScript, true);
            
            // Yorumları yeniden yükle
            LoadComments();
        }
        catch (Exception ex)
        {
            ShowError("Yanıtınız gönderilirken bir hata oluştu: " + ex.Message);
            LogError("Yanıt gönderme hatası", ex);
        }
    }
} 