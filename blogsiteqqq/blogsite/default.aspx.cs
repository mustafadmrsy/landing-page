using System;
using System.Data;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;

public partial class _default : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            // Kategorileri yükle
            LoadCategories();
            
            // "category" query string parametresi varsa ilgili kategorideki blogları getir
            if (!string.IsNullOrEmpty(Request.QueryString["category"]))
            {
                string categoryName = Request.QueryString["category"];
                LoadBlogsByCategory(categoryName);
            }
            // "search" query string parametresi varsa arama sonuçlarını getir
            else if (!string.IsNullOrEmpty(Request.QueryString["search"]))
            {
                string searchTerm = Request.QueryString["search"];
                SearchBlogs(searchTerm);
            }
            // "sort" query string parametresi varsa sıralama türüne göre blogları getir
            else if (!string.IsNullOrEmpty(Request.QueryString["sort"]))
            {
                string sortType = Request.QueryString["sort"];
                
                if (sortType.Equals("popular", StringComparison.OrdinalIgnoreCase))
                {
                    LoadPopularBlogs();
                }
                else if (sortType.Equals("recent", StringComparison.OrdinalIgnoreCase))
                {
                    LoadRecentBlogs();
                }
                else
                {
                    // Geçersiz sıralama türü, varsayılan olarak tüm blogları getir
                    LoadAllBlogs();
                }
            }
            // Hiçbir parametre yoksa tüm blogları getir
            else
            {
                LoadAllBlogs();
            }
            
            // Önerilen kullanıcıları yükle
            LoadSuggestedUsers();
            
            // Kullanıcı login durumunu session'dan kontrol et
            bool isLoggedIn = (Session["KullaniciID"] != null);
            
            // Client-side değişkeni set et (string interpolation kullanmadan)
            string script = string.Format("var userLoggedIn = {0};", isLoggedIn ? "true" : "false");
            ClientScript.RegisterStartupScript(this.GetType(), "UserLoginStatus", script, true);
        }
    }

    private void LoadBlogPosts()
    {
        // Bu metot kullanım dışı
    }

    protected void btnSearch_Click(object sender, EventArgs e)
    {
        // Bu metot kullanım dışı
    }

    private void SearchBlogPosts(string searchTerm)
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string query = @"SELECT p.PostID, p.Title, p.Content, p.CreatedAt, 
                               u.Username, c.CategoryName 
                        FROM Posts p
                        LEFT JOIN Users u ON p.UserID = u.UserID
                        LEFT JOIN Categories c ON p.CategoryID = c.CategoryID  
                        WHERE (p.Title LIKE @SearchTerm OR p.Content LIKE @SearchTerm OR u.Username LIKE @SearchTerm) 
                        AND p.ApprovalStatus = 1 
                        ORDER BY p.CreatedAt DESC";

                SqlCommand command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@SearchTerm", "%" + searchTerm + "%");

                SqlDataAdapter adapter = new SqlDataAdapter(command);
                DataTable dt = new DataTable();

                connection.Open();
                adapter.Fill(dt);

                rptBlogs.DataSource = dt;
                rptBlogs.DataBind();
            }
        }
        catch (Exception ex)
        {
            // Hata durumunu logla (u: CS0168 uyarısını da giderir)
#if DEBUG
            System.Diagnostics.Debug.WriteLine("SearchBlogPosts hata: " + ex.Message);
#endif
        }
    }

    protected string GetExcerpt(object content)
    {
        if (content == null)
            return string.Empty;

        string text = content.ToString();
        // Strip HTML tags
        text = System.Text.RegularExpressions.Regex.Replace(text, "<.*?>", string.Empty);
        
        // Limit to 150 characters and add ellipsis if needed
        int maxLength = 150;
        if (text.Length > maxLength)
        {
            text = text.Substring(0, maxLength) + "...";
        }
        
        return text;
    }
    
    protected int GetViewCount(object postId)
    {
        if (postId == null)
            return 0;
            
        int postIdValue = Convert.ToInt32(postId);
        int viewCount = 0;
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Görüntülenme sayısını çek
                string query = "SELECT COUNT(*) FROM PostViews WHERE PostID = @PostID";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postIdValue);
                    
                    // PostViews tablosu yoksa 0 döndür
                    try {
                        viewCount = (int)command.ExecuteScalar();
                    }
                    catch {
                        viewCount = 0;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Error getting view count: " + ex.Message);
        }
        
        return viewCount;
    }
    
    protected int GetLikeCount(object postId)
    {
        if (postId == null)
            return 0;
            
        int postIdValue = Convert.ToInt32(postId);
        int likeCount = 0;
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                System.Diagnostics.Debug.WriteLine(string.Format("GetLikeCount: Bağlantı açıldı, Post ID: {0}", postIdValue));
                
                // Beğeni sayısını çek
                string query = "SELECT COUNT(*) FROM Likes WHERE PostID = @PostID";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postIdValue);
                    
                    try {
                        likeCount = (int)command.ExecuteScalar();
                        System.Diagnostics.Debug.WriteLine(string.Format("GetLikeCount: Post ID {0} için beğeni sayısı: {1}", postIdValue, likeCount));
                    }
                    catch (Exception sqlEx) {
                        System.Diagnostics.Debug.WriteLine("GetLikeCount SQL hatası: " + sqlEx.Message);
                        likeCount = 0;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("GetLikeCount genel hata: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata stack trace: " + ex.StackTrace);
        }
        
        return likeCount;
    }
    
    protected int GetCommentCount(object postId)
    {
        if (postId == null)
            return 0;
            
        int postIdValue = Convert.ToInt32(postId);
        int commentCount = 0;
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Yorum sayısını çek
                string query = "SELECT COUNT(*) FROM Comments WHERE PostID = @PostID";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postIdValue);
                    
                    // Comments tablosu yoksa 0 döndür
                    try {
                        commentCount = (int)command.ExecuteScalar();
                    }
                    catch {
                        commentCount = 0;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Error getting comment count: " + ex.Message);
        }
        
        return commentCount;
    }
    
    // Kullanıcının bir blog yazısını beğenip beğenmediğini kontrol eder
    protected bool HasUserLiked(object postId)
    {
        // Kullanıcı oturum açmamışsa false döndür
        if (Session["KullaniciID"] == null)
            return false;
            
        int userId = Convert.ToInt32(Session["KullaniciID"]);
        int postIdValue = Convert.ToInt32(postId);
        
        return HasUserLiked(postIdValue, userId);
    }

    // Kullanıcının bir blog yazısını beğenip beğenmediğini kontrol eder
    protected bool HasUserLiked(int postId, int userId)
    {
        if (userId <= 0)
        {
            return false;
        }

        bool hasLiked = false;
        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                string queryString = "SELECT COUNT(*) FROM Likes WHERE PostID = @PostID AND UserID = @UserID";
                using (SqlCommand command = new SqlCommand(queryString, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postId);
                    command.Parameters.AddWithValue("@UserID", userId);
                    
                    int likeCount = (int)command.ExecuteScalar();
                    hasLiked = likeCount > 0;
                    
                    Debug.WriteLine(string.Format("HasUserLiked: PostID={0}, UserID={1}, Sonuç={2}", postId, userId, hasLiked));
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine(string.Format("HasUserLiked Error: {0}", ex.Message));
        }
        
        return hasLiked;
    }
    
    // Post'un beğeni sayısını al
    protected int GetLikeCount(int postId)
    {
        int likeCount = 0;
        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                string queryString = "SELECT COUNT(*) FROM Likes WHERE PostID = @PostID";
                using (SqlCommand command = new SqlCommand(queryString, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postId);
                    
                    likeCount = (int)command.ExecuteScalar();
                    Debug.WriteLine(string.Format("GetLikeCount: PostID={0}, Beğeni Sayısı={1}", postId, likeCount));
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine(string.Format("GetLikeCount Error: {0}", ex.Message));
        }
        
        return likeCount;
    }

    // Resim dosyasının olup olmadığını kontrol eder
    protected bool HasPostImage(object postId)
    {
        if (postId == null)
            return false;
            
        int postIdValue = Convert.ToInt32(postId);
        
        try
        {
            // Veritabanından resim yolunu kontrol et
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT PhotoPath FROM Posts WHERE PostID = @PostID";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postIdValue);
                    object result = command.ExecuteScalar();
                    
                    if (result != null && result != DBNull.Value)
                    {
                        string photoPath = result.ToString();
                        if (!string.IsNullOrEmpty(photoPath))
                        {
                            // Server'daki fiziksel dosyanın varlığını kontrol et
                            string physicalPath = Server.MapPath("~" + photoPath);
                            return System.IO.File.Exists(physicalPath);
                        }
                    }
                }
            }
            
            return false;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("HasPostImage hatası: " + ex.Message);
            return false;
        }
    }
    
    // Resim dosyasının URL'sini döndürür
    protected string GetPostImageUrl(object postId)
    {
        if (postId == null)
            return "assets/img/default-post.jpg";
            
        int postIdValue = Convert.ToInt32(postId);
        
        try
        {
            // Veritabanından resim yolunu al
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT PhotoPath FROM Posts WHERE PostID = @PostID";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PostID", postIdValue);
                    object result = command.ExecuteScalar();
                    
                    if (result != null && result != DBNull.Value)
        {
                        string photoPath = result.ToString();
                        if (!string.IsNullOrEmpty(photoPath))
                        {
                            // Server'daki fiziksel dosyanın varlığını kontrol et
                            string physicalPath = Server.MapPath("~" + photoPath);
                            if (System.IO.File.Exists(physicalPath))
                            {
                                return photoPath;
                            }
                        }
                    }
            }
        }
        
        // Resim bulunamazsa varsayılan görseli döndür
            return "assets/img/default-post.jpg";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("GetPostImageUrl hatası: " + ex.Message);
            return "assets/img/default-post.jpg";
        }
    }

    // Kategorileri yükler
    private void LoadCategories()
    {
        // Bu metot kategori bilgilerini yükler, şu an için boş bırakıyoruz
        // Eğer kategori kısmını göstermek isterseniz daha sonra geliştirilebilir
    }
    
    // Tüm blogları getirir
    private void LoadAllBlogs()
    {
        System.Diagnostics.Debug.WriteLine("LoadAllBlogs çağrıldı - Tüm bloglar yükleniyor");
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                string query = @"
                    SELECT p.PostID, p.Title, p.Content, p.UserID, p.CategoryID, p.CreatedAt, p.ApprovalStatus, 
                           u.Username, c.CategoryName 
                    FROM Posts p
                    JOIN Users u ON p.UserID = u.UserID
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.ApprovalStatus = 1 
                    ORDER BY p.CreatedAt DESC";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(command);
                    DataTable dataTable = new DataTable();
                    adapter.Fill(dataTable);
                    
                    System.Diagnostics.Debug.WriteLine(string.Format("Toplam {0} blog yazısı yüklendi", dataTable.Rows.Count));
                    
                    if (dataTable.Rows.Count > 0)
                    {
                        // Blog yazılarını listeye yükle
                        Repeater1.DataSource = dataTable;
                        Repeater1.DataBind();
                        Repeater1.Visible = true;
                        
                        // Başlığı sıfırla
                        ltlPageTitle.Text = "En Son Blog Yazıları";
                    }
                    else
                    {
                        // Hiç blog yazısı yoksa
                        Repeater1.Visible = false;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("Blog yükleme hatası: {0}", ex.Message));
            ShowErrorMessage("Blog yazıları yüklenirken bir hata oluştu: " + ex.Message);
        }
    }
    
    // Kategori bazlı blog yazılarını yükle
    private void LoadBlogsByCategory(string categoryName)
    {
        System.Diagnostics.Debug.WriteLine(string.Format("LoadBlogsByCategory çağrıldı - Kategori: {0}", categoryName));
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                string query = @"
                    SELECT p.PostID, p.Title, p.Content, p.UserID, p.CategoryID, p.CreatedAt, p.ApprovalStatus, 
                           u.Username, c.CategoryName 
                    FROM Posts p
                    JOIN Users u ON p.UserID = u.UserID
                    JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.ApprovalStatus = 1 AND c.CategoryName = @CategoryName
                    ORDER BY p.CreatedAt DESC";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@CategoryName", categoryName);
                    
                    SqlDataAdapter adapter = new SqlDataAdapter(command);
                    DataTable dataTable = new DataTable();
                    adapter.Fill(dataTable);
                    
                    System.Diagnostics.Debug.WriteLine(string.Format("Kategori '{0}' için {1} blog yazısı yüklendi", categoryName, dataTable.Rows.Count));
                    
                    if (dataTable.Rows.Count > 0)
                    {
                        // Başlığı ayarla ve paneli görünür yap
                        ltlPageTitle.Text = "Kategori: " + categoryName;
                        pnlBlogResults.Visible = true;
                        rptBlogs.DataSource = dataTable;
                        rptBlogs.DataBind();
                        pnlNoBlogResults.Visible = false;
                    }
                    else
                    {
                        // Sonuç bulunamadı
                        ltlPageTitle.Text = "Kategori: " + categoryName;
                        pnlBlogResults.Visible = false;
                        pnlNoBlogResults.Visible = true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("Kategori blogları yükleme hatası: {0}", ex.Message));
            ShowErrorMessage("Kategori blog yazıları yüklenirken bir hata oluştu: " + ex.Message);
        }
    }
    
    // Arama sonuçlarını yükle
    private void SearchBlogs(string searchTerm)
    {
        try
        {
            // Arama terimi gerekliliği ve temizleme
            if (string.IsNullOrEmpty(searchTerm))
            {
                LoadAllBlogs();
                return;
            }

            searchTerm = searchTerm.Trim();
            
            // Blog yazılarını ara
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Ana başlığı değiştir
                ltlPageTitle.Text = string.Format("Arama Sonuçları: \"{0}\"", searchTerm);
                
                // Blog yazılarını ara
                string query = @"
                    SELECT p.PostID, p.Title, p.Content, p.CreatedAt, p.UserID,
                           u.Username, c.CategoryName, c.CategoryID
                    FROM Posts p
                    LEFT JOIN Users u ON p.UserID = u.UserID
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE (p.Title LIKE @SearchTerm OR p.Content LIKE @SearchTerm OR u.Username LIKE @SearchTerm) 
                    AND p.ApprovalStatus = 1 
                    ORDER BY p.CreatedAt DESC";
                
                SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@SearchTerm", "%" + searchTerm + "%");
                    
                    SqlDataAdapter adapter = new SqlDataAdapter(command);
                DataTable dtPosts = new DataTable();
                adapter.Fill(dtPosts);
                
                // Kullanıcıları ara
                List<UserSearchResult> users = SearchUsers(searchTerm, connection);
                
                // Kullanıcı sonuçları var mı kontrol et
                if (users.Count > 0)
                    {
                    rptUsers.DataSource = users;
                    rptUsers.DataBind();
                    pnlUserResults.Visible = true;
                }
                else
                {
                    pnlUserResults.Visible = false;
                }
                
                // Blog yazısı sonuçları
                if (dtPosts.Rows.Count > 0)
                {
                    rptBlogs.DataSource = dtPosts;
                        rptBlogs.DataBind();
                    pnlBlogResults.Visible = true;
                    pnlNoBlogResults.Visible = false;
                }
                else
                {
                    pnlBlogResults.Visible = false;
                    pnlNoBlogResults.Visible = true;
                }
                
                // Sonuç yoksa mesaj göster
                if (dtPosts.Rows.Count == 0 && users.Count == 0)
                {
                    pnlNoResults.Visible = true;
                    }
                    else
                    {
                    pnlNoResults.Visible = false;
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Error searching: " + ex.Message);
            ShowErrorMessage("Arama sırasında bir hata oluştu: " + ex.Message);
        }
    }
    
    private List<UserSearchResult> SearchUsers(string searchTerm, SqlConnection existingConnection = null)
    {
        List<UserSearchResult> users = new List<UserSearchResult>();
        
        try
        {
            bool closeConnection = false;
            SqlConnection connection = existingConnection;
            
            if (connection == null)
            {
                connection = new SqlConnection(connectionString);
                connection.Open();
                closeConnection = true;
            }
            
            string sql = @"
                SELECT TOP 10
                    u.UserID, 
                    u.Username, 
                    COALESCE(u.FirstName + ' ' + u.LastName, '') AS FullName,
                    COALESCE(up.Bio, '') AS Bio,
                    COALESCE(up.ProfileImage, '') AS ProfileImage,
                    (SELECT COUNT(*) FROM Posts p WHERE p.UserID = u.UserID AND p.ApprovalStatus = 1) AS PostCount
                FROM Users u
                LEFT JOIN UserProfiles up ON u.UserID = up.UserID
                WHERE u.Username LIKE @Query 
                   OR u.FirstName LIKE @Query 
                   OR u.LastName LIKE @Query
                   OR u.Email LIKE @Query
                ORDER BY 
                    CASE WHEN u.Username LIKE @StartsWith THEN 0 ELSE 1 END,
                    u.Username
            ";
            
            using (SqlCommand command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@Query", "%" + searchTerm + "%");
                command.Parameters.AddWithValue("@StartsWith", searchTerm + "%");
                
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        UserSearchResult user = new UserSearchResult
                        {
                            UserID = Convert.ToInt32(reader["UserID"]),
                            Username = reader["Username"].ToString(),
                            FullName = reader["FullName"].ToString(),
                            Bio = reader["Bio"].ToString(),
                            ProfileImage = reader["ProfileImage"].ToString(),
                            PostCount = Convert.ToInt32(reader["PostCount"])
                        };
                        
                        users.Add(user);
                    }
                }
            }
            
            if (closeConnection)
            {
                connection.Close();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("SearchUsers Error: " + ex.Message);
        }
        
        return users;
    }
    
    public class UserSearchResult
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Bio { get; set; }
        public string ProfileImage { get; set; }
        public int PostCount { get; set; }
        
        public string GetShortBio()
        {
            if (string.IsNullOrEmpty(Bio))
                return string.Empty;
                
            // Strip HTML
            string text = System.Text.RegularExpressions.Regex.Replace(Bio, "<.*?>", string.Empty);
            
            // Limit length
            if (text.Length > 100)
                return text.Substring(0, 100) + "...";
                
            return text;
        }
        
        public string GetProfileImageUrl()
        {
            if (string.IsNullOrEmpty(ProfileImage))
                return "assets/img/default-profile.png";
                
            // ProfilePicture değeri /assets/uploads ile başlıyorsa
            if (ProfileImage.Contains("/assets/uploads"))
                return ProfileImage;
                
            return "assets/img/default-profile.png";
        }
    }

    private void ShowErrorMessage(string message)
    {
        // JavaScript alert ile hatayı göster
        ClientScript.RegisterStartupScript(this.GetType(), "ErrorMessage", 
            string.Format("alert('{0}');", message.Replace("'", "\\'")), true);
    }

    protected int GetCurrentUserId()
    {
        if (Session["KullaniciID"] != null)
        {
            return Convert.ToInt32(Session["KullaniciID"]);
        }
        return 0;
    }

    private void LoadSuggestedUsers()
    {
        try
        {
            List<UserSearchResult> suggestedUsers = new List<UserSearchResult>();
            
            // Veritabanı bağlantı bilgilerini logla
            System.Diagnostics.Debug.WriteLine("Bağlantı string: " + connectionString);
            
            // Gerçek veritabanından veri çekmeyi dene (simulasyon yok)
            bool isSimulation = false;
            
            if (!isSimulation)
            {
                try
                {
                    using (SqlConnection connection = new SqlConnection(connectionString))
                    {
                        connection.Open();
                        System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı başarıyla açıldı.");
                        
                        // Rastgele maximum 6 kullanıcı seç
                        string query = @"
                            SELECT TOP 6
                                u.UserID, 
                                u.Username, 
                                '' AS FullName, 
                                '' AS Bio, 
                                u.ProfilePicture AS ProfileImage,
                                (SELECT COUNT(*) FROM Posts p WHERE p.UserID = u.UserID AND p.ApprovalStatus = 1) AS PostCount
                            FROM Users u
                            ORDER BY NEWID()";  // NEWID() ile rastgele sıralama
                        
                        using (SqlCommand command = new SqlCommand(query, connection))
                        {
                            System.Diagnostics.Debug.WriteLine("SQL sorgusu çalıştırılıyor: " + query);
                            
                            using (SqlDataReader reader = command.ExecuteReader())
                            {
                                if (reader.HasRows)
                                {
                                    System.Diagnostics.Debug.WriteLine("Veritabanından kullanıcılar bulundu!");
                                    while (reader.Read())
                                    {
                                        int userID = reader.GetInt32(0);
                                        string username = reader.GetString(1);
                                        string fullName = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                                        string bio = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
                                        string profileImage = reader.IsDBNull(4) ? string.Empty : reader.GetString(4);
                                        int postCount = reader.IsDBNull(5) ? 0 : reader.GetInt32(5);
                                        
                                        UserSearchResult user = new UserSearchResult
                                        {
                                            UserID = userID,
                                            Username = username,
                                            FullName = fullName,
                                            Bio = bio,
                                            ProfileImage = profileImage,
                                            PostCount = postCount
                                        };
                                        
                                        suggestedUsers.Add(user);
                                        System.Diagnostics.Debug.WriteLine("DB Kullanıcı: ID=" + userID + ", Username=" + username + ", PostCount=" + postCount);
                                    }
                                }
                                else
                                {
                                    System.Diagnostics.Debug.WriteLine("Veritabanında kullanıcı bulunamadı!");
                                }
                            }
                        }
                    }
                }
                catch (Exception dbEx)
                {
                    System.Diagnostics.Debug.WriteLine("*** Veritabanı hatası: " + dbEx.Message);
                    System.Diagnostics.Debug.WriteLine("*** Hata detayı: " + dbEx.ToString());
                }
            }
            
            // Eğer veritabanından kullanıcı bulunamadıysa veya isSimulation=true ise test verilerini kullan
            if (suggestedUsers.Count == 0 || isSimulation)
            {
                System.Diagnostics.Debug.WriteLine("Test kullanıcı verileri oluşturuluyor...");
                // Görüntülenen kullanıcıları test verileri ile doldur
                CreateTestUserData(suggestedUsers);
                
                // Test verilerini de rastgele karıştır ve maksimum 6 tane göster
                Random rnd = new Random();
                suggestedUsers = suggestedUsers.OrderBy(x => rnd.Next()).Take(6).ToList();
            }
            
            // Kullanıcıları Repeater kontrolüne bağla
            if (suggestedUsers.Count > 0)
            {
                System.Diagnostics.Debug.WriteLine("Toplam " + suggestedUsers.Count + " kullanıcı yüklendi ve gösteriliyor.");
                foreach (var user in suggestedUsers)
                {
                    System.Diagnostics.Debug.WriteLine("Gösterilecek kullanıcı: " + user.Username + ", Yazı sayısı: " + user.PostCount);
                }
                rptSuggestedUsers.DataSource = suggestedUsers;
                rptSuggestedUsers.DataBind();
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("HATA: Hiç kullanıcı bulunamadı ve gösterilemedi!");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("*** GENEL HATA: Önerilen kullanıcılar yüklenirken hata: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("*** Hata Kaynağı: " + ex.Source);
            System.Diagnostics.Debug.WriteLine("*** Stack Trace: " + ex.StackTrace);
        }
    }
    
    // Test kullanıcı verisi oluştur - Bu method gerçek veritabanı yokken çalışacak
    private void CreateTestUserData(List<UserSearchResult> usersList)
    {
        // Listeyi temizle (önceden veri varsa)
        usersList.Clear();
        
        // Örnek kullanıcılar oluştur
        usersList.Add(new UserSearchResult
        {
            UserID = 1,
            Username = "murat_yilmaz",
            FullName = "Murat Yılmaz",
            Bio = "Web geliştirici ve teknoloji meraklısı",
            ProfileImage = "assets/img/default-profile.png",
            PostCount = 12
        });
        
        usersList.Add(new UserSearchResult
        {
            UserID = 2,
            Username = "ayse_kara",
            FullName = "Ayşe Kara",
            Bio = "Grafik tasarımcı ve blog yazarı",
            ProfileImage = "assets/img/default-profile.png",
            PostCount = 8
        });

        usersList.Add(new UserSearchResult
        {
            UserID = 4,
            Username = "zeynep_demir",
            FullName = "Zeynep Demir",
            Bio = "Edebiyat ve sinema üzerine yazılar yazıyorum",
            ProfileImage = "assets/img/default-profile.png",
            PostCount = 5
        });
        
        usersList.Add(new UserSearchResult
        {
            UserID = 5,
            Username = "mustafa_demirsoy",
            FullName = "Mustafa Demirsoy",
            Bio = "Sosyal medya uzmanı ve içerik üreticisi",
            ProfileImage = "assets/img/mustafa-demirsoy.jpg",
            PostCount = 10
        });
        
        System.Diagnostics.Debug.WriteLine("5 adet test kullanıcı oluşturuldu.");
        foreach (var user in usersList)
        {
            System.Diagnostics.Debug.WriteLine("Test Kullanıcı: ID={user.UserID}, Username={user.Username}");
        }
    }

    // En popüler (en çok beğenilen) blog yazılarını getirir
    private void LoadPopularBlogs()
    {
        System.Diagnostics.Debug.WriteLine("LoadPopularBlogs çağrıldı - En popüler bloglar yükleniyor");
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Önce her blog yazısının beğeni sayısını hesaplayan bir sorgu
                string query = @"
                    WITH PostLikeCounts AS (
                        SELECT p.PostID, 
                               COUNT(l.LikeID) AS LikeCount
                        FROM Posts p
                        LEFT JOIN Likes l ON p.PostID = l.PostID
                        WHERE p.ApprovalStatus = 1
                        GROUP BY p.PostID
                    )
                    SELECT p.PostID, p.Title, p.Content, p.UserID, p.CategoryID, p.CreatedAt, p.ApprovalStatus, 
                           u.Username, c.CategoryName, ISNULL(plc.LikeCount, 0) AS LikeCount
                    FROM Posts p
                    JOIN Users u ON p.UserID = u.UserID
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                    LEFT JOIN PostLikeCounts plc ON p.PostID = plc.PostID
                    WHERE p.ApprovalStatus = 1
                    ORDER BY LikeCount DESC, p.CreatedAt DESC";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    try
                    {
                        SqlDataAdapter adapter = new SqlDataAdapter(command);
                        DataTable dataTable = new DataTable();
                        adapter.Fill(dataTable);
                        
                        System.Diagnostics.Debug.WriteLine("Popüler bloglar yüklendi. Satır sayısı: {dataTable.Rows.Count}");
                        
                        // Debug için beğeni sayılarını konsola yazdır
                        foreach (DataRow row in dataTable.Rows)
                        {
                            int postId = Convert.ToInt32(row["PostID"]);
                            string title = row["Title"].ToString();
                            int likeCount = Convert.ToInt32(row["LikeCount"]);
                            System.Diagnostics.Debug.WriteLine("PostID: {postId}, Title: {title}, LikeCount: {likeCount}");
                        }
                        
                        if (dataTable.Rows.Count > 0)
                        {
                            // Blog yazılarını listeye yükle
                            Repeater1.DataSource = dataTable;
                            Repeater1.DataBind();
                            Repeater1.Visible = true;
                            
                            // Başlığı güncelle
                            ltlPageTitle.Text = "En Popüler Blog Yazıları";
                        }
                        else
                        {
                            // Hiç blog yazısı yoksa
                            Repeater1.Visible = false;
                            ltlPageTitle.Text = "Hiç blog yazısı bulunamadı";
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("Popüler blog verileri getirilirken hata: " + ex.Message);
                        
                        // Daha basit bir sorgu deneyelim
                        string simpleQuery = @"
                            SELECT p.PostID, p.Title, p.Content, p.UserID, p.CategoryID, p.CreatedAt, p.ApprovalStatus, 
                                   u.Username, c.CategoryName,
                                   (SELECT COUNT(*) FROM Likes WHERE PostID = p.PostID) AS LikeCount
                            FROM Posts p
                            JOIN Users u ON p.UserID = u.UserID
                            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                            WHERE p.ApprovalStatus = 1
                            ORDER BY LikeCount DESC, p.CreatedAt DESC";
                        
                        using (SqlCommand simpleCommand = new SqlCommand(simpleQuery, connection))
                        {
                            try
                            {
                                SqlDataAdapter simpleAdapter = new SqlDataAdapter(simpleCommand);
                                DataTable simpleTable = new DataTable();
                                simpleAdapter.Fill(simpleTable);
                                
                                System.Diagnostics.Debug.WriteLine("Basit sorgu ile yüklendi. Satır sayısı: {simpleTable.Rows.Count}");
                                
                                if (simpleTable.Rows.Count > 0)
                                {
                                    Repeater1.DataSource = simpleTable;
                                    Repeater1.DataBind();
                                    Repeater1.Visible = true;
                                    ltlPageTitle.Text = "En Popüler Blog Yazıları";
                                }
                                else
                                {
                                    Repeater1.Visible = false;
                                    ltlPageTitle.Text = "Hiç blog yazısı bulunamadı";
                                }
                            }
                            catch (Exception ex2)
                            {
                                System.Diagnostics.Debug.WriteLine("Basit sorgu da başarısız: " + ex2.Message);
                                
                                // Son çare olarak tarihe göre sırala
                                LoadRecentBlogs();
                                ltlPageTitle.Text = "Blog Yazıları (Popüler sıralama şu anda kullanılamıyor)";
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Popüler blog yükleme hatası: {ex.Message}");
            ShowErrorMessage("Popüler blog yazıları yüklenirken bir hata oluştu: " + ex.Message);
        }
    }

    // En son eklenen blog yazılarını getirir
    private void LoadRecentBlogs()
    {
        System.Diagnostics.Debug.WriteLine("LoadRecentBlogs çağrıldı - En yeni bloglar yükleniyor");
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                string query = @"
                    SELECT p.PostID, p.Title, p.Content, p.UserID, p.CategoryID, p.CreatedAt, p.ApprovalStatus, 
                           u.Username, c.CategoryName 
                    FROM Posts p
                    JOIN Users u ON p.UserID = u.UserID
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.ApprovalStatus = 1 
                    ORDER BY p.CreatedAt DESC";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(command);
                    DataTable dataTable = new DataTable();
                    adapter.Fill(dataTable);
                    
                    System.Diagnostics.Debug.WriteLine(string.Format("Toplam {0} yeni blog yazısı yüklendi", dataTable.Rows.Count));
                    
                    if (dataTable.Rows.Count > 0)
                    {
                        // Blog yazılarını listeye yükle
                        Repeater1.DataSource = dataTable;
                        Repeater1.DataBind();
                        Repeater1.Visible = true;
                        
                        // Başlığı güncelle
                        ltlPageTitle.Text = "En Son Eklenen Blog Yazıları";
                    }
                    else
                    {
                        // Hiç blog yazısı yoksa
                        Repeater1.Visible = false;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("Yeni blog yükleme hatası: {0}", ex.Message));
            ShowErrorMessage("Yeni blog yazıları yüklenirken bir hata oluştu: " + ex.Message);
        }
    }
}
