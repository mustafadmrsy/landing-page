using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Services;
using System.Web.Script.Services;
using System.Web.Script.Serialization;
using System.Text;

public partial class AdminPanel : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            // Oturum kontrolü
            CheckAdminSession();
            
            // Kategori listelerini doldur
            LoadCategories();
            
            if (pnlAdminContent.Visible)
            {
                // Admin paneli görünür ise verileri yükle
                LoadPendingPosts();
                LoadApprovedPosts();
                LoadRejectedPosts();
                LoadComments();
                LoadUsers();
            }
        }
    }

    private void CheckAdminSession()
    {
        // Admin oturumu kontrolü
        if (Session["AdminID"] != null)
        {
            // Admin giriş yapmış, admin panelini göster
            pnlAdminLogin.Visible = false;
            pnlAdminContent.Visible = true;
            
            // Admin adını göster
            if (Session["AdminName"] != null)
            {
                ltlAdminName.Text = Session["AdminName"].ToString();
            }
        }
        else
        {
            // Admin giriş yapmamış, login formunu göster
            pnlAdminLogin.Visible = true;
            pnlAdminContent.Visible = false;
        }
    }

    protected void btnAdminLogin_Click(object sender, EventArgs e)
    {
        string username = txtAdminUsername.Text.Trim();
        string password = txtAdminPassword.Text;
        
        if (ValidateAdmin(username, password))
        {
            // Yeniden sayfa yükle
            Response.Redirect("admin.aspx");
        }
        else
        {
            // Hata mesajı göster
            lblLoginError.Text = "Hatalı kullanıcı adı veya şifre!";
            lblLoginError.Visible = true;
        }
    }
    
    private bool ValidateAdmin(string username, string password)
    {
        bool isValid = false;
        
        try
        {
            // Remote veritabanı bağlantı bilgileri
            string connectionString = "Data Source=213.238.183.232\\MSSQLSERVER2022;Initial Catalog=11Senirkent;User ID=11Senirkent;Password=H7jso6?64";
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                // Giriş bilgilerini doğrudan kontrol et
                if (username == "adminsnk" && password == "1414snk")
                {
                    // Manuel doğrulama başarılı
                    Session["AdminID"] = "1";
                    Session["AdminName"] = username;
                    return true;
                }
                
                // dbo.admins tablosunu kullanıyoruz
                string query = "SELECT adminID, username FROM dbo.admins WHERE username = @Username AND Password = @Password";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Username", username);
                    cmd.Parameters.AddWithValue("@Password", password);
                    
                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();
                    
                    if (reader.Read())
                    {
                        // Admin doğrulandı, oturum bilgilerini kaydet
                        Session["AdminID"] = reader["adminID"];
                        Session["AdminName"] = reader["username"];
                        isValid = true;
                    }
                    
                    reader.Close();
                }
            }
        }
        catch (Exception ex)
        {
            lblLoginError.Text = "Bir hata oluştu: " + ex.Message;
            lblLoginError.Visible = true;
        }
        
        return isValid;
    }

    protected void btnAdminLogout_Click(object sender, EventArgs e)
    {
        // Admin oturumunu sonlandır
        Session.Remove("AdminID");
        Session.Remove("AdminName");
        
        // Sayfayı yeniden yükle
        Response.Redirect("admin.aspx");
    }
    
    private void LoadCategories()
    {
        try
        {
            // Remote veritabanı bağlantı bilgileri
            string connectionString = "Data Source=213.238.183.232\\MSSQLSERVER2022;Initial Catalog=11Senirkent;User ID=11Senirkent;Password=H7jso6?64";
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = "SELECT CategoryID, CategoryName FROM dbo.Categories ORDER BY CategoryName";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();
                    
                    // Kategori dropdown'larını doldur
                    ddlPendingCategory.Items.Clear();
                    ddlApprovedCategory.Items.Clear();
                    ddlRejectedCategory.Items.Add(new ListItem("Tüm Kategoriler", ""));
                    
                    // Varsayılan "Tüm Kategoriler" seçeneği
                    ddlPendingCategory.Items.Add(new ListItem("Tüm Kategoriler", ""));
                    ddlApprovedCategory.Items.Add(new ListItem("Tüm Kategoriler", ""));
                    
                    while (reader.Read())
                    {
                        string categoryId = reader["CategoryID"].ToString();
                        string categoryName = reader["CategoryName"].ToString();
                        
                        ddlPendingCategory.Items.Add(new ListItem(categoryName, categoryId));
                        ddlApprovedCategory.Items.Add(new ListItem(categoryName, categoryId));
                        ddlRejectedCategory.Items.Add(new ListItem(categoryName, categoryId));
                    }
                    
                    reader.Close();
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda işlem yapma
            System.Diagnostics.Debug.WriteLine("Kategori yükleme hatası: " + ex.Message);
        }
    }
    
    // Blog yazılarını yönetme metotları
    
    // Onay bekleyen yazıları yükle
    private void LoadPendingPosts(string searchText = "", string categoryId = "")
    {
        try
        {
            // Remote veritabanı bağlantı bilgileri
            string connectionString = "Data Source=213.238.183.232\\MSSQLSERVER2022;Initial Catalog=11Senirkent;User ID=11Senirkent;Password=H7jso6?64";
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"
                    SELECT p.PostID, p.Title, p.CreatedAt, p.UpdatedAt, 
                           u.Username, c.CategoryName 
                    FROM dbo.Posts p
                    INNER JOIN dbo.Users u ON p.UserID = u.UserID
                    INNER JOIN dbo.Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.ApprovalStatus = 0";
                
                // Filtreleme koşulları ekle
                if (!string.IsNullOrEmpty(searchText))
                {
                    query += " AND (p.Title LIKE @SearchText OR p.Content LIKE @SearchText)";
                }
                
                if (!string.IsNullOrEmpty(categoryId))
                {
                    query += " AND p.CategoryID = @CategoryID";
                }
                
                query += " ORDER BY p.CreatedAt DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    if (!string.IsNullOrEmpty(searchText))
                    {
                        cmd.Parameters.AddWithValue("@SearchText", "%" + searchText + "%");
                    }
                    
                    if (!string.IsNullOrEmpty(categoryId))
                    {
                        cmd.Parameters.AddWithValue("@CategoryID", categoryId);
                    }
                    
                    try
                    {
                    conn.Open();
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);
                    
                    if (dt.Rows.Count > 0)
                    {
                        rptPendingPosts.DataSource = dt;
                        rptPendingPosts.DataBind();
                        pnlNoPendingPosts.Visible = false;
                            System.Diagnostics.Debug.WriteLine("Bekleyen yazılar yüklendi. Sayı: " + dt.Rows.Count);
                    }
                    else
                    {
                        rptPendingPosts.DataSource = null;
                        rptPendingPosts.DataBind();
                        pnlNoPendingPosts.Visible = true;
                            System.Diagnostics.Debug.WriteLine("Bekleyen yazı bulunamadı.");
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı veya komut yürütme hatası: " + ex.Message);
                        System.Diagnostics.Debug.WriteLine("Stack trace: " + ex.StackTrace);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda işlem yapma
            System.Diagnostics.Debug.WriteLine("Onay bekleyen yazıları yükleme hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Stack trace: " + ex.StackTrace);
        }
    }
    
    // Onaylanmış yazıları yükle
    private void LoadApprovedPosts(string searchText = "", string categoryId = "")
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"
                    SELECT p.PostID, p.Title, p.CreatedAt, p.UpdatedAt, 
                           u.Username, c.CategoryName 
                    FROM Posts p
                    INNER JOIN Users u ON p.UserID = u.UserID
                    INNER JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.ApprovalStatus = 1";
                
                // Filtreleme koşulları ekle
                if (!string.IsNullOrEmpty(searchText))
                {
                    query += " AND (p.Title LIKE @SearchText OR p.Content LIKE @SearchText)";
                }
                
                if (!string.IsNullOrEmpty(categoryId))
                {
                    query += " AND p.CategoryID = @CategoryID";
                }
                
                query += " ORDER BY p.CreatedAt DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    if (!string.IsNullOrEmpty(searchText))
                    {
                        cmd.Parameters.AddWithValue("@SearchText", "%" + searchText + "%");
                    }
                    
                    if (!string.IsNullOrEmpty(categoryId))
                    {
                        cmd.Parameters.AddWithValue("@CategoryID", categoryId);
                    }
                    
                    conn.Open();
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);
                    
                    if (dt.Rows.Count > 0)
                    {
                        rptApprovedPosts.DataSource = dt;
                        rptApprovedPosts.DataBind();
                        pnlNoApprovedPosts.Visible = false;
                    }
                    else
                    {
                        rptApprovedPosts.DataSource = null;
                        rptApprovedPosts.DataBind();
                        pnlNoApprovedPosts.Visible = true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda işlem yapma
            System.Diagnostics.Debug.WriteLine("Onaylanmış yazıları yükleme hatası: " + ex.Message);
        }
    }
    
    // Reddedilmiş yazıları yükle
    private void LoadRejectedPosts(string searchText = "", string categoryId = "")
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"
                    SELECT p.PostID, p.Title, p.CreatedAt, p.UpdatedAt, 
                           u.Username, c.CategoryName 
                    FROM Posts p
                    INNER JOIN Users u ON p.UserID = u.UserID
                    INNER JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.ApprovalStatus = 2";
                
                // Filtreleme koşulları ekle
                if (!string.IsNullOrEmpty(searchText))
                {
                    query += " AND (p.Title LIKE @SearchText OR p.Content LIKE @SearchText)";
                }
                
                if (!string.IsNullOrEmpty(categoryId))
                {
                    query += " AND p.CategoryID = @CategoryID";
                }
                
                query += " ORDER BY p.CreatedAt DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    if (!string.IsNullOrEmpty(searchText))
                    {
                        cmd.Parameters.AddWithValue("@SearchText", "%" + searchText + "%");
                    }
                    
                    if (!string.IsNullOrEmpty(categoryId))
                    {
                        cmd.Parameters.AddWithValue("@CategoryID", categoryId);
                    }
                    
                    conn.Open();
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);
                    
                    if (dt.Rows.Count > 0)
                    {
                        rptRejectedPosts.DataSource = dt;
                        rptRejectedPosts.DataBind();
                        pnlNoRejectedPosts.Visible = false;
                    }
                    else
                    {
                        rptRejectedPosts.DataSource = null;
                        rptRejectedPosts.DataBind();
                        pnlNoRejectedPosts.Visible = true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda işlem yapma
            System.Diagnostics.Debug.WriteLine("Reddedilmiş yazıları yükleme hatası: " + ex.Message);
        }
    }
    
    // Kullanıcıları yükle
    private void LoadUsers(string searchText = "")
    {
        try
        {
            // Bağlantı bilgilerini doğrudan tanımla
            string directConnectionString = "Data Source=213.238.183.232\\MSSQLSERVER2022;Initial Catalog=11Senirkent;User ID=11Senirkent;Password=H7jso6?64";
            
            using (SqlConnection conn = new SqlConnection(directConnectionString))
            {
                // Doğru veritabanı tablosu ve sütunlarını kullan - Cache'lemeyi engellemek için timestamp ekle
                string query = @"
                    SELECT 
                        u.UserID, 
                        u.Username,
                        u.Email,
                        u.CreatedAt AS RegisterDate,
                        CASE WHEN a.usarname IS NOT NULL THEN 1 ELSE 0 END AS IsAdmin,
                        COALESCE(u.Username, '') AS FullName,
                        GETDATE() as CurrentTimestamp -- Cache önleme için timestamp ekle
                    FROM Users u
                    LEFT JOIN admins a ON u.Username = a.usarname";
                
                // Filtreleme koşulları ekle
                if (!string.IsNullOrEmpty(searchText))
                {
                    query += " WHERE u.Username LIKE @SearchText OR u.Email LIKE @SearchText";
                }
                
                query += " ORDER BY u.UserID ASC"; // ID'ye göre sırala
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    if (!string.IsNullOrEmpty(searchText))
                    {
                        cmd.Parameters.AddWithValue("@SearchText", "%" + searchText + "%");
                    }
                    
                    try {
                        conn.Open();
                    }
                    catch (Exception ex) {
                        System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı açılamadı: " + ex.Message);
                        return;
                    }
                    
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);
                    
                    if (dt.Rows.Count > 0)
                    {
                        rptUsers.DataSource = dt;
                        rptUsers.DataBind();
                        pnlNoUsers.Visible = false;
                    }
                    else
                    {
                        rptUsers.DataSource = null;
                        rptUsers.DataBind();
                        pnlNoUsers.Visible = true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda işlem yapma
            System.Diagnostics.Debug.WriteLine("Kullanıcıları yükleme hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Stack Trace: " + ex.StackTrace);
        }
    }
    
    // Arama ve Filtre Olayları
    protected void btnPendingSearch_Click(object sender, EventArgs e)
    {
        string searchText = txtPendingSearch.Text.Trim();
        string categoryId = ddlPendingCategory.SelectedValue;
        LoadPendingPosts(searchText, categoryId);
    }
    
    protected void ddlPendingCategory_SelectedIndexChanged(object sender, EventArgs e)
    {
        string searchText = txtPendingSearch.Text.Trim();
        string categoryId = ddlPendingCategory.SelectedValue;
        LoadPendingPosts(searchText, categoryId);
    }
    
    protected void btnApprovedSearch_Click(object sender, EventArgs e)
    {
        string searchText = txtApprovedSearch.Text.Trim();
        string categoryId = ddlApprovedCategory.SelectedValue;
        LoadApprovedPosts(searchText, categoryId);
    }
    
    protected void ddlApprovedCategory_SelectedIndexChanged(object sender, EventArgs e)
    {
        string searchText = txtApprovedSearch.Text.Trim();
        string categoryId = ddlApprovedCategory.SelectedValue;
        LoadApprovedPosts(searchText, categoryId);
    }
    
    protected void btnRejectedSearch_Click(object sender, EventArgs e)
    {
        string searchText = txtRejectedSearch.Text.Trim();
        string categoryId = ddlRejectedCategory.SelectedValue;
        LoadRejectedPosts(searchText, categoryId);
    }
    
    protected void ddlRejectedCategory_SelectedIndexChanged(object sender, EventArgs e)
    {
        string searchText = txtRejectedSearch.Text.Trim();
        string categoryId = ddlRejectedCategory.SelectedValue;
        LoadRejectedPosts(searchText, categoryId);
    }
    
    protected void btnUserSearch_Click(object sender, EventArgs e)
    {
        string searchText = txtUserSearch.Text.Trim();
        LoadUsers(searchText);
    }
    
    // Blog yazısı işlemleri
    protected void rptPendingPosts_ItemCommand(object source, RepeaterCommandEventArgs e)
    {
        int postId = Convert.ToInt32(e.CommandArgument);
        
        if (e.CommandName == "ViewPost")
        {
            // Blog yazısı detaylarını görmek için ID'yi sakla
            hdnCurrentPostId.Value = postId.ToString();
            
            // JavaScript ile modal gösterme işlemi client-side yapılacak
            ClientScript.RegisterStartupScript(this.GetType(), "ViewPostModal", "showPostDetail(" + postId + ");", true);
        }
        else if (e.CommandName == "ApprovePost")
        {
            // Blog yazısını onayla
            UpdatePostStatus(postId, 1); // 1 = Onaylandı
        }
        else if (e.CommandName == "RejectPost")
        {
            // Blog yazısını reddet
            UpdatePostStatus(postId, 2); // 2 = Reddedildi
        }
    }
    
    protected void rptApprovedPosts_ItemCommand(object source, RepeaterCommandEventArgs e)
    {
        if (e.CommandName == "UnapprovePost")
        {
            // Yazının onayını kaldır
            if (e.CommandArgument != null)
            {
                int postId;
                if (int.TryParse(e.CommandArgument.ToString(), out postId))
                {
                    UpdatePostStatus(postId, 2); // 2 = Reddedildi
                }
            }
        }
        else if (e.CommandName == "DeletePost")
        {
            // Yazıyı tamamen sil
            if (e.CommandArgument != null)
            {
                int postId;
                if (int.TryParse(e.CommandArgument.ToString(), out postId))
                {
                    DeletePost(postId);
                    
                    // Onaylı yazılar listesini yenile
                    LoadApprovedPosts();
                }
            }
        }
    }
    
    protected void rptRejectedPosts_ItemCommand(object source, RepeaterCommandEventArgs e)
    {
        if (e.CommandName == "ViewPost")
        {
            // Yazıyı görüntüle
            if (e.CommandArgument != null)
            {
                // JavaScript fonksiyonunu çağır
                string script = "showPostDetail(" + e.CommandArgument.ToString() + ");";
                ScriptManager.RegisterStartupScript(this, GetType(), "ViewPostScript", script, true);
            }
        }
        else if (e.CommandName == "ApprovePost")
        {
            // Yazıyı onayla
            if (e.CommandArgument != null)
            {
                int postId;
                if (int.TryParse(e.CommandArgument.ToString(), out postId))
                {
                    UpdatePostStatus(postId, 1); // 1 = Onaylandı
        }
    }
        }
        else if (e.CommandName == "DeletePost")
        {
            // Yazıyı tamamen sil
            if (e.CommandArgument != null)
    {
                int postId;
                if (int.TryParse(e.CommandArgument.ToString(), out postId))
                {
                    DeletePost(postId);
                }
            }
        }
    }
    
    // Yazıyı tamamen silmek için yeni metod
    private void DeletePost(int postId)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
        {
                conn.Open();
                
                // Bir transaction başlat
                SqlTransaction transaction = conn.BeginTransaction();
                
                try
                {
                    // Önce yazının görüntülenme kayıtlarını sil (PostViews tablosu varsa)
                    try
                    {
                        string deleteViewsQuery = "DELETE FROM PostViews WHERE PostID = @PostID";
                        using (SqlCommand cmd = new SqlCommand(deleteViewsQuery, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@PostID", postId);
                            cmd.ExecuteNonQuery();
                        }
                    }
                    catch (Exception ex)
                    {
                        // PostViews tablosu yoksa hata görmezden geliniyor
                        System.Diagnostics.Debug.WriteLine("PostViews tablosu bulunamadı: " + ex.Message);
                    }
                    
                    // Yazının yorumlarını sil
                    string deleteCommentsQuery = "DELETE FROM Comments WHERE PostID = @PostID";
                    using (SqlCommand cmd = new SqlCommand(deleteCommentsQuery, conn, transaction))
                    {
                        cmd.Parameters.AddWithValue("@PostID", postId);
                        cmd.ExecuteNonQuery();
                    }
                    
                    // Yazının beğenilerini sil (Likes tablosu varsa)
                    try
                    {
                        string deleteLikesQuery = "DELETE FROM Likes WHERE PostID = @PostID";
                        using (SqlCommand cmd = new SqlCommand(deleteLikesQuery, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@PostID", postId);
                            cmd.ExecuteNonQuery();
                        }
                    }
                    catch (Exception ex)
                    {
                        // Likes tablosu yoksa hata görmezden geliniyor
                        System.Diagnostics.Debug.WriteLine("Likes tablosu bulunamadı: " + ex.Message);
                    }
                    
                    // Son olarak yazının kendisini sil
                    string deletePostQuery = "DELETE FROM Posts WHERE PostID = @PostID";
                    using (SqlCommand cmd = new SqlCommand(deletePostQuery, conn, transaction))
                    {
                        cmd.Parameters.AddWithValue("@PostID", postId);
                        int result = cmd.ExecuteNonQuery();
                        
                        if (result > 0)
                        {
                            // İşlem başarılı, transaction'ı commit et
                            transaction.Commit();
                            
                            // Başarı mesajı göster
                            ShowSuccessMessage("Blog yazısı ve ilişkili tüm veriler başarıyla silindi.");
                            
                            // Yönlendirme yaparak tüm listeleri yenile
                            Response.Redirect(Request.RawUrl);
                        }
                        else
                        {
                            // Yazı bulunamadı
                            transaction.Rollback();
                            ShowErrorMessage("Silinecek blog yazısı bulunamadı.");
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Hata durumunda transaction'ı geri al
                    transaction.Rollback();
                    ShowErrorMessage("Blog yazısı silinirken bir hata oluştu: " + ex.Message);
                    System.Diagnostics.Debug.WriteLine("Blog yazısı silme hatası: " + ex.Message);
                }
            }
        }
        catch (Exception ex)
        {
            ShowErrorMessage("Veritabanına bağlanırken bir hata oluştu: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Veritabanı bağlantı hatası: " + ex.Message);
        }
    }
    
    // Kullanıcı işlemleri
    protected void rptUsers_ItemCommand(object source, RepeaterCommandEventArgs e)
    {
        int userId = Convert.ToInt32(e.CommandArgument);
        
        if (e.CommandName == "ViewUserPosts")
        {
            // Kullanıcının yazılarını göster - Modal veya ayrı sayfa olabilir
            // Bu örnekte sadece alert gösterilecek
            ClientScript.RegisterStartupScript(this.GetType(), "ViewUserPosts", 
                "alert('Kullanıcı ID: " + userId + " yazıları görüntülenecek.');", true);
        }
        else if (e.CommandName == "ToggleAdmin")
        {
            // Kullanıcının admin statüsünü değiştir
            ToggleAdminStatus(userId);
        }
        else if (e.CommandName == "DeleteUser")
        {
            // Kullanıcıyı sil
            DeleteUser(userId);
        }
    }
    
    // Blog yazısının durumunu güncelle
    private void UpdatePostStatus(int postId, int status)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = "UPDATE Posts SET ApprovalStatus = @Status, UpdatedAt = @UpdatedAt WHERE PostID = @PostID";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Status", status);
                    cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
                    cmd.Parameters.AddWithValue("@PostID", postId);
                    
                    conn.Open();
                    int rowsAffected = cmd.ExecuteNonQuery();
                    
                    if (rowsAffected > 0)
                    {
                        // Yazara bildirim gönder
                        SendNotificationToAuthor(postId, status);
                        
                        // Sayfayı yenile
                        Response.Redirect(Request.RawUrl);
                    }
                    else
                    {
                        // Güncelleme başarısız
                        ClientScript.RegisterStartupScript(this.GetType(), "UpdateError", 
                            "alert('Blog yazısı güncellenirken bir hata oluştu.');", true);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda
            ClientScript.RegisterStartupScript(this.GetType(), "UpdateError", 
                "alert('Hata: " + ex.Message.Replace("'", "\\'") + "');", true);
        }
    }
    
    // Kullanıcının admin durumunu değiştir
    private void ToggleAdminStatus(int userId)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Önce kullanıcının kullanıcı adını al
                string username = "";
                string password = "";
                
                string getUserQuery = "SELECT Username, PasswordHash FROM Users WHERE UserID = @UserID";
                using (SqlCommand getUserCmd = new SqlCommand(getUserQuery, conn))
                {
                    getUserCmd.Parameters.AddWithValue("@UserID", userId);
                    
                    using (SqlDataReader reader = getUserCmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            username = reader["Username"].ToString();
                            password = reader["PasswordHash"].ToString();
                        }
                    }
                }
                
                // Kullanıcı adı alınamadıysa işlemi durdur
                if (string.IsNullOrEmpty(username))
                {
                    throw new Exception("Kullanıcı bulunamadı!");
                }
                
                // Kullanıcının mevcut admin durumunu kontrol et
                string checkQuery = "SELECT usarname FROM admins WHERE usarname = @Username";
                using (SqlCommand checkCmd = new SqlCommand(checkQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@Username", username);
                    
                    object result = checkCmd.ExecuteScalar();
                    
                    if (result != null)
                    {
                        // Admin ise, admin yetkisini kaldır
                        string deleteQuery = "DELETE FROM admins WHERE usarname = @Username";
                        using (SqlCommand deleteCmd = new SqlCommand(deleteQuery, conn))
                        {
                            deleteCmd.Parameters.AddWithValue("@Username", username);
                            deleteCmd.ExecuteNonQuery();
                        }
                    }
                    else
                    {
                        // Admin değilse, admin yetkisi ver
                        // Admin tablosuna ekle - kullanıcı adı ve şifre ile
                        string insertQuery = "INSERT INTO admins (usarname, Password) VALUES (@Username, @Password)";
                        using (SqlCommand insertCmd = new SqlCommand(insertQuery, conn))
                        {
                            insertCmd.Parameters.AddWithValue("@Username", username);
                            insertCmd.Parameters.AddWithValue("@Password", password);
                            insertCmd.ExecuteNonQuery();
                        }
                    }
                }
                
                // Kullanıcı listesini yenile
                LoadUsers();
                
                // Başarılı mesajı göster
                ClientScript.RegisterStartupScript(this.GetType(), "AdminToggle", 
                    "alert('Kullanıcının admin durumu başarıyla değiştirildi.');", true);
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda
            ClientScript.RegisterStartupScript(this.GetType(), "ToggleError", 
                "alert('Hata: " + ex.Message.Replace("'", "\\'") + "');", true);
        }
    }
    
    // Yazara bildirim gönder
    private void SendNotificationToAuthor(int postId, int status)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                // Önce blog yazısının yazarını (UserID) bul
                string getUserQuery = "SELECT UserID, Title FROM Posts WHERE PostID = @PostID";
                
                conn.Open();
                int userId = 0;
                string postTitle = "";
                
                using (SqlCommand getUserCmd = new SqlCommand(getUserQuery, conn))
                {
                    getUserCmd.Parameters.AddWithValue("@PostID", postId);
                    
                    using (SqlDataReader reader = getUserCmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            userId = Convert.ToInt32(reader["UserID"]);
                            postTitle = reader["Title"].ToString();
                        }
                    }
                }
                
                // Bildirim sistemi henüz oluşturulmamış, bu nedenle sadece loglama yapıyoruz
                if (userId > 0)
                {
                    // Bildirim mesajını hazırla
                    string message = "";
                    
                    switch (status)
                    {
                        case 0: // Onay bekliyor
                            message = "'" + postTitle + "' başlıklı blog yazınız tekrar incelemeye alındı.";
                            break;
                        case 1: // Onaylandı
                            message = "'" + postTitle + "' başlıklı blog yazınız onaylandı ve yayınlandı.";
                            break;
                        case 2: // Reddedildi
                            message = "'" + postTitle + "' başlıklı blog yazınız reddedildi. Lütfen içeriği gözden geçirip tekrar gönderiniz.";
                            break;
                    }
                    
                    // Bildirim işlemini sadece loglayalım
                    System.Diagnostics.Debug.WriteLine("Bildirim gönderildi - UserID: " + userId + ", Mesaj: " + message);
                }
            }
        }
        catch (Exception ex)
        {
            // Bildirim gönderme hatası loglama
            System.Diagnostics.Debug.WriteLine("Bildirim gönderme hatası: " + ex.Message);
        }
    }

    // Kullanıcıyı sil - ilişkili tüm kayıtlarla birlikte güvenli silme
    protected void DeleteUser(int userId)
    {
        if (userId <= 0)
        {
            ShowErrorMessage("Invalid user ID format");
            return;
        }

        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
        
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            try
            {
                connection.Open();
                
                // First check if user exists
                bool userExists = false;
                using (SqlCommand checkCmd = new SqlCommand("SELECT COUNT(*) FROM Users WHERE UserID = @UserID", connection))
                {
                    checkCmd.Parameters.AddWithValue("@UserID", userId);
                    int userCount = (int)checkCmd.ExecuteScalar();
                    userExists = (userCount > 0);
                }
                
                if (!userExists)
                {
                    // Kullanıcı zaten silinmişse hata gösterme, sessizce işlemi bitir
                    // ShowSuccessMessage("Kullanıcı zaten silinmiş veya bulunamadı."); // İstersen bunu açabilirsin
                    return;
                }
                
                SqlTransaction transaction = connection.BeginTransaction();
                try
                {
                    // Admin tablosundan sil
                    using (SqlCommand getUsername = new SqlCommand("SELECT Username FROM Users WHERE UserID = @UserID", connection, transaction))
                    {
                        getUsername.Parameters.AddWithValue("@UserID", userId);
                        string username = (string)getUsername.ExecuteScalar();
                        if (!string.IsNullOrEmpty(username))
                        {
                            using (SqlCommand deleteAdmin = new SqlCommand("DELETE FROM Admins WHERE usarname = @Username", connection, transaction))
                            {
                                deleteAdmin.Parameters.AddWithValue("@Username", username);
                                deleteAdmin.ExecuteNonQuery();
                            }
                        }
                    }

                    // Tüm yabancı anahtar kısıtlamalarını devre dışı bırakma gereksiz, sıralı silme ile ilerle

                    // 1. Kullanıcının gönderilerine ait yorumları sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM Comments WHERE PostID IN (SELECT PostID FROM Posts WHERE UserID = @UserID)", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 2. Kullanıcının gönderilerine ait beğenileri sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM Likes WHERE PostID IN (SELECT PostID FROM Posts WHERE UserID = @UserID)", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 3. Kullanıcının gönderilerine ait görüntülenme kayıtlarını sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM PostViews WHERE PostID IN (SELECT PostID FROM Posts WHERE UserID = @UserID)", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 4. Kullanıcının gönderilerini sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM Posts WHERE UserID = @UserID", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 5. Kullanıcının yaptığı yorumlara gelen yanıtları sil (alt yorumlar)
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM Comments WHERE ParentCommentID IN (SELECT CommentID FROM Comments WHERE UserID = @UserID)", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 6. Kullanıcının yaptığı yorumları sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM Comments WHERE UserID = @UserID", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 7. Kullanıcının yaptığı beğenileri sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM Likes WHERE UserID = @UserID", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 8. Kullanıcı profilini sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM UserProfiles WHERE UserID = @UserID", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.ExecuteNonQuery();
                    }
                    // 9. Kullanıcıyı sil
                    using (SqlCommand cmd = new SqlCommand("DELETE FROM Users WHERE UserID = @UserID", connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        int rowsAffected = cmd.ExecuteNonQuery();
                        if (rowsAffected == 0)
                        {
                            transaction.Rollback();
                            ShowErrorMessage("Failed to delete user with ID: " + userId);
                            return;
                        }
                    }
                    // Commit
                    transaction.Commit();
                    ShowSuccessMessage("Kullanıcı ve tüm ilişkili veriler başarıyla silindi");
                    LoadUsers();
                }
                catch (SqlException sqlEx)
                {
                    transaction.Rollback();
                    ShowErrorMessage("Database error: " + sqlEx.Message + " (Error: " + sqlEx.Number + ")");
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    ShowErrorMessage("Error deleting user: " + ex.Message);
                }
            }
            catch (Exception ex)
            {
                ShowErrorMessage("Could not connect to database: " + ex.Message);
            }
        }
    }

    private void ShowErrorMessage(string message)
    {
        // Show client-side alert for errors
        ScriptManager.RegisterStartupScript(this, GetType(), "errorAlert", 
            string.Format("alert('Error: {0}');", message.Replace("'", "\\'")), true);
    }

    private void ShowSuccessMessage(string message)
    {
        // Show client-side alert for success
        ScriptManager.RegisterStartupScript(this, GetType(), "successAlert", 
            string.Format("alert('{0}');", message.Replace("'", "\\'")), true);
    }

    // Yorum Yönetimi Metodları
    private void LoadComments()
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Önce Comments tablosunun varlığını kontrol et
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comments'";
                SqlCommand checkCommand = new SqlCommand(checkTableQuery, conn);
                int tableExists = (int)checkCommand.ExecuteScalar();
                
                if (tableExists == 0)
                {
                    System.Diagnostics.Debug.WriteLine("Comments tablosu bulunamadı!");
                    pnlNoPendingComments.Visible = true;
                    pnlNoApprovedComments.Visible = true;
                    return;
                }
                
                // IsApproved sütunu var mı kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
                SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, conn);
                int columnExists = (int)checkColumnCommand.ExecuteScalar();
                
                if (columnExists == 0)
                {
                    System.Diagnostics.Debug.WriteLine("IsApproved sütunu bulunamadı!");
                    
                    // IsApproved sütunu eklemeyi dene
                    try
                    {
                        string addColumnQuery = "ALTER TABLE Comments ADD IsApproved BIT DEFAULT 0";
                        SqlCommand addColumnCommand = new SqlCommand(addColumnQuery, conn);
                        addColumnCommand.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("IsApproved sütunu eklendi");
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("IsApproved sütunu eklenemedi: " + ex.Message);
                        pnlNoPendingComments.Visible = true;
                        pnlNoApprovedComments.Visible = true;
                        return;
                    }
                }
                
                // Onay bekleyen yorumları yükle
                LoadPendingComments(conn);
                
                // Onaylanmış yorumları yükle
                LoadApprovedComments(conn);
            }
        }
        catch (Exception ex)
        {
            // Hata mesajı göster
            ClientScript.RegisterStartupScript(this.GetType(), "loadError", 
                "alert('Yorumlar yüklenirken bir hata oluştu: " + ex.Message.Replace("'", "\\'") + "');", true);
            System.Diagnostics.Debug.WriteLine("Yorumlar yüklenirken hata: " + ex.Message);
        }
    }
    
    private void LoadPendingComments(SqlConnection conn)
    {
        try {
            // IsApproved sütunu var mı kontrol et
            string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
            SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, conn);
            int columnExists = (int)checkColumnCommand.ExecuteScalar();
            bool isApprovedExists = (columnExists > 0);
            
            string query;
            if (isApprovedExists)
            {
                // IsApproved sütunu varsa ona göre filtrele
                query = @"
                    SELECT DISTINCT c.CommentID, c.PostID, c.UserID, c.CommentText, c.CreatedAt, 
                           u.Username, p.Title AS PostTitle
                    FROM Comments c
                    INNER JOIN Users u ON c.UserID = u.UserID
                    INNER JOIN Posts p ON c.PostID = p.PostID
                    WHERE c.IsApproved = 0 OR c.IsApproved IS NULL
                    ORDER BY c.CreatedAt DESC";
            }
            else
            {
                // IsApproved sütunu yoksa tüm yorumları getir (ilk onay sistemi kurulduğunda)
                query = @"
                    SELECT DISTINCT c.CommentID, c.PostID, c.UserID, c.CommentText, c.CreatedAt, 
                           u.Username, p.Title AS PostTitle
                    FROM Comments c
                    INNER JOIN Users u ON c.UserID = u.UserID
                    INNER JOIN Posts p ON c.PostID = p.PostID
                    ORDER BY c.CreatedAt DESC";
                
                System.Diagnostics.Debug.WriteLine("IsApproved sütunu olmadığı için tüm yorumlar onay bekliyor olarak gösteriliyor");
            }
            
            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();
                adapter.Fill(dt);
                
                if (dt.Rows.Count > 0)
                {
                    rptPendingComments.DataSource = dt;
                    rptPendingComments.DataBind();
                    pnlNoPendingComments.Visible = false;
                    System.Diagnostics.Debug.WriteLine("Onay bekleyen yorum sayısı: " + dt.Rows.Count);
                    
                    // Yorumları debug için logla
                    foreach (DataRow row in dt.Rows)
                    {
                        System.Diagnostics.Debug.WriteLine("Bekleyen Yorum - ID: " + row["CommentID"] + 
                                                      ", Text: " + row["CommentText"] + 
                                                      ", PostID: " + row["PostID"]);
                    }
                }
                else
                {
                    rptPendingComments.Visible = false;
                    pnlNoPendingComments.Visible = true;
                    System.Diagnostics.Debug.WriteLine("Onay bekleyen yorum bulunamadı");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Onay bekleyen yorumlar yüklenemedi: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
            rptPendingComments.Visible = false;
            pnlNoPendingComments.Visible = true;
        }
    }
    
    private void LoadApprovedComments(SqlConnection conn)
    {
        try {
            // IsApproved sütunu var mı kontrol et
            string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
            SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, conn);
            int columnExists = (int)checkColumnCommand.ExecuteScalar();
            bool isApprovedExists = (columnExists > 0);
            
            if (isApprovedExists)
            {
                // Onaylanmış yorumları getir
                string query = @"
                    SELECT DISTINCT c.CommentID, c.PostID, c.UserID, c.CommentText, c.CreatedAt, 
                           u.Username, p.Title AS PostTitle
                    FROM Comments c
                    INNER JOIN Users u ON c.UserID = u.UserID
                    INNER JOIN Posts p ON c.PostID = p.PostID
                    WHERE c.IsApproved = 1
                    ORDER BY c.CreatedAt DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);
                    
                    if (dt.Rows.Count > 0)
                    {
                        rptApprovedComments.DataSource = dt;
                        rptApprovedComments.DataBind();
                        pnlNoApprovedComments.Visible = false;
                        System.Diagnostics.Debug.WriteLine("Onaylanmış yorum sayısı: " + dt.Rows.Count);
                        
                        // Yorumları debug için logla
                        foreach (DataRow row in dt.Rows)
                        {
                            System.Diagnostics.Debug.WriteLine("Onaylı Yorum - ID: " + row["CommentID"] + 
                                                          ", Text: " + row["CommentText"] + 
                                                          ", PostID: " + row["PostID"]);
                        }
                    }
                    else
                    {
                        rptApprovedComments.Visible = false;
                        pnlNoApprovedComments.Visible = true;
                        System.Diagnostics.Debug.WriteLine("Onaylanmış yorum bulunamadı");
                    }
                }
            }
            else
            {
                // IsApproved sütunu yoksa onaylı yorum yok
                rptApprovedComments.Visible = false;
                pnlNoApprovedComments.Visible = true;
                System.Diagnostics.Debug.WriteLine("IsApproved sütunu olmadığı için onaylı yorum gösterilemiyor");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Onaylanmış yorumlar yüklenemedi: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
            rptApprovedComments.Visible = false;
            pnlNoApprovedComments.Visible = true;
        }
    }
    
    protected void rptComments_ItemCommand(object source, RepeaterCommandEventArgs e)
    {
        if (Session["AdminID"] == null)
        {
            // Admin değilse işlemi reddet
            ClientScript.RegisterStartupScript(this.GetType(), "AccessDenied", 
                "alert('Bu işlemi yapabilmek için admin olmalısınız.');", true);
            return;
        }
        
        int commentId = Convert.ToInt32(e.CommandArgument);
        
        if (e.CommandName == "ApproveComment")
        {
            // Yorumu onayla
            ApproveComment(commentId);
        }
        else if (e.CommandName == "DeleteComment")
        {
            // Yorumu sil
            DeleteComment(commentId);
        }
    }
    
    private void ApproveComment(int commentId)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Önce yorumun durumunu kontrol et
                string checkStatusQuery = "SELECT IsApproved FROM Comments WHERE CommentID = @CommentID";
                using (SqlCommand checkCmd = new SqlCommand(checkStatusQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@CommentID", commentId);
                    object result = checkCmd.ExecuteScalar();
                    
                    // Yorum zaten onaylanmışsa tekrar onaylama
                    if (result != null && result != DBNull.Value && Convert.ToBoolean(result))
                    {
                        ClientScript.RegisterStartupScript(this.GetType(), "AlreadyApproved", 
                            "alert('Bu yorum zaten onaylanmış.');", true);
                        System.Diagnostics.Debug.WriteLine("Yorum zaten onaylı: CommentID=" + commentId);
                        return;
                    }
                }
                
                // IsApproved sütunu var mı kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
                SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, conn);
                int columnExists = (int)checkColumnCommand.ExecuteScalar();
                
                if (columnExists == 0)
                {
                    // IsApproved sütunu yoksa eklemeyi dene
                    try
                    {
                        string addColumnQuery = "ALTER TABLE Comments ADD IsApproved BIT DEFAULT 1";
                        SqlCommand addColumnCommand = new SqlCommand(addColumnQuery, conn);
                        addColumnCommand.ExecuteNonQuery();
                        System.Diagnostics.Debug.WriteLine("IsApproved sütunu eklendi ve otomatik onay için 1 değeri verildi");
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("IsApproved sütunu eklenemedi: " + ex.Message);
                        ClientScript.RegisterStartupScript(this.GetType(), "SutunEklenemedi", 
                        "alert('Yorum onaylanamadı. IsApproved sütunu mevcut değil ve eklenemedi.');", true);
                        return;
                    }
                }
                
                // Yorumu onayla - sadece onaylanmamış olanları
                string query = "UPDATE Comments SET IsApproved = 1 WHERE CommentID = @CommentID AND (IsApproved = 0 OR IsApproved IS NULL)";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@CommentID", commentId);
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    
                    if (rowsAffected > 0)
                    {
                        // Başarılı mesajı göster
                        ClientScript.RegisterStartupScript(this.GetType(), "YorumOnayi", 
                            "alert('Yorum başarıyla onaylandı.');", true);
                        
                        System.Diagnostics.Debug.WriteLine("Yorum onaylandı: CommentID=" + commentId);
                        
                        // Listeleri güncelle
                        LoadPendingComments(conn);
                        LoadApprovedComments(conn);
                    }
                    else
                    {
                        // Güncelleme başarısız
                        ClientScript.RegisterStartupScript(this.GetType(), "YorumOnaylanamadi", 
                            "alert('Yorum onaylanamadı. Yorum bulunamadı veya zaten onaylanmış.');", true);
                        
                        System.Diagnostics.Debug.WriteLine("Yorum onaylanamadı: CommentID=" + commentId + ", etkilenen satır sayısı: " + rowsAffected);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda
            ClientScript.RegisterStartupScript(this.GetType(), "YorumOnayHata", 
                "alert('Yorum onaylanırken bir hata oluştu: " + ex.Message.Replace("'", "\\'") + "');", true);
            
            System.Diagnostics.Debug.WriteLine("Yorum onaylama hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
        }
    }
    
    private void DeleteComment(int commentId)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                
                // Önce yorumun varlığını kontrol et
                string checkCommentQuery = "SELECT COUNT(*) FROM Comments WHERE CommentID = @CommentID";
                using (SqlCommand checkCmd = new SqlCommand(checkCommentQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@CommentID", commentId);
                    int commentExists = (int)checkCmd.ExecuteScalar();
                    
                    if (commentExists == 0)
                    {
                        ClientScript.RegisterStartupScript(this.GetType(), "CommentNotFound", 
                            "alert('Silinecek yorum bulunamadı.');", true);
                        System.Diagnostics.Debug.WriteLine("Silinecek yorum bulunamadı: CommentID=" + commentId);
                        return;
                    }
                }
                
                // Yorumu sil
                string query = "DELETE FROM Comments WHERE CommentID = @CommentID";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@CommentID", commentId);
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    
                    if (rowsAffected > 0)
                    {
                        // Başarılı mesajı göster
                        ClientScript.RegisterStartupScript(this.GetType(), "DeleteSuccess", 
                            "alert('Yorum başarıyla silindi.');", true);
                        
                        System.Diagnostics.Debug.WriteLine("Yorum silindi: CommentID=" + commentId);
                        
                        // Sayfayı yenile
                        Response.Redirect(Request.RawUrl);
                    }
                    else
                    {
                        // Silme başarısız
                        ClientScript.RegisterStartupScript(this.GetType(), "DeleteError", 
                            "alert('Yorum silinirken bir hata oluştu.');", true);
                        
                        System.Diagnostics.Debug.WriteLine("Yorum silinemedi: CommentID=" + commentId + ", etkilenen satır sayısı: " + rowsAffected);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda
            ClientScript.RegisterStartupScript(this.GetType(), "DeleteError", 
                "alert('Hata: " + ex.Message.Replace("'", "\\'") + "');", true);
            
            System.Diagnostics.Debug.WriteLine("Yorum silme hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.StackTrace);
        }
    }

    // GetPostDetails metodu için Post model sınıfı
    public class PostDetails
    {
        public int PostID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Username { get; set; }
        public string CategoryName { get; set; }
        public string CreatedAt { get; set; }
        public int ApprovalStatus { get; set; }
        public string Tags { get; set; }
    }

    // AJAX için WebMethod
    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static PostDetails GetPostDetails(int postId)
    {
        PostDetails post = null;
        
        try
        {
            // Remote veritabanı bağlantı bilgileri
            string connectionString = "Data Source=213.238.183.232\\MSSQLSERVER2022;Initial Catalog=11Senirkent;User ID=11Senirkent;Password=H7jso6?64";
            
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"
                    SELECT p.PostID, p.Title, p.Content, p.CreatedAt, p.ApprovalStatus, p.Tags,
                           u.Username, c.CategoryName 
                    FROM dbo.Posts p
                    INNER JOIN dbo.Users u ON p.UserID = u.UserID
                    INNER JOIN dbo.Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.PostID = @PostID";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@PostID", postId);
                    
                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();
                    
                    if (reader.Read())
                    {
                        post = new PostDetails
                        {
                            PostID = Convert.ToInt32(reader["PostID"]),
                            Title = reader["Title"].ToString(),
                            Content = reader["Content"].ToString(),
                            Username = reader["Username"].ToString(),
                            CategoryName = reader["CategoryName"].ToString(),
                            CreatedAt = Convert.ToDateTime(reader["CreatedAt"]).ToString("yyyy-MM-dd HH:mm:ss"),
                            ApprovalStatus = Convert.ToInt32(reader["ApprovalStatus"]),
                            Tags = reader["Tags"] != DBNull.Value ? reader["Tags"].ToString() : ""
                        };
                    }
                    
                    reader.Close();
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda null dön
            System.Diagnostics.Debug.WriteLine("Blog detayı yükleme hatası: " + ex.Message);
            return null;
        }
        
        return post;
    }

    protected void DeleteUser_Command(object sender, CommandEventArgs e)
    {
        if (e.CommandName == "DeleteUser" && e.CommandArgument != null)
        {
            int userId;
            if (int.TryParse(e.CommandArgument.ToString(), out userId))
            {
                DeleteUser(userId);
            }
            else
            {
                ShowErrorMessage("Invalid user ID format");
            }
        }
    }

    private void LoadUnapprovedComments()
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Önce tablo var mı diye kontrol edelim
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comments'";
                SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection);
                int tableExists = (int)checkCommand.ExecuteScalar();

                if (tableExists == 0)
                {
                    System.Diagnostics.Debug.WriteLine("Henüz yorum tablosu bulunmamaktadır.");
                    return;
                }

                // IsApproved sütunu var mı kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
                SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, connection);
                int columnExists = (int)checkColumnCommand.ExecuteScalar();

                if (columnExists == 0)
                {
                    System.Diagnostics.Debug.WriteLine("Onay bekleyen yorum bulunmamaktadır. Tüm yorumlar otomatik onaylanmaktadır.");
                    return;
                }

                // Onay bekleyen yorum sayısını getir
                // Not: Artık tüm yorumlar otomatik onaylandığı için onay bekleyen yorum olmayacak
                string countQuery = "SELECT COUNT(*) FROM Comments WHERE IsApproved = 0";
                SqlCommand countCommand = new SqlCommand(countQuery, connection);
                int unapprovedCount = 0;
                
                try
                {
                    unapprovedCount = (int)countCommand.ExecuteScalar();
                }
                catch
                {
                    // IsApproved sütunu yeni eklendiyse veya sorguda hata olduysa
                    unapprovedCount = 0;
                }

                // Onay bekleyen yorum olmadığını bildiren mesajı göster
                if (unapprovedCount == 0)
                {
                    System.Diagnostics.Debug.WriteLine("Onay bekleyen yorum bulunmamaktadır. Tüm yorumlar otomatik onaylanmaktadır.");
                    return;
                }

                // Bu noktaya gelindiyse (ki yeni sistemde gelmemeli), eski onay bekleyen yorumları göster
                string query = @"
                    SELECT c.CommentID, c.PostID, c.CommentText, c.CreatedAt, u.Username, p.Title as PostTitle
                    FROM Comments c
                    INNER JOIN Users u ON c.UserID = u.UserID
                    INNER JOIN Posts p ON c.PostID = p.PostID
                    WHERE c.IsApproved = 0
                    ORDER BY c.CreatedAt DESC";

                SqlCommand command = new SqlCommand(query, connection);
                SqlDataAdapter adapter = new SqlDataAdapter(command);
                DataTable dt = new DataTable();
                adapter.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    System.Diagnostics.Debug.WriteLine("Onay bekleyen " + dt.Rows.Count + " yorum bulundu:");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("Onay bekleyen yorum bulunmamaktadır.");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Yorumlar yüklenirken bir hata oluştu.");
            LogError("LoadUnapprovedComments", ex);
        }
    }

    private void LoadApprovedComments()
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Önce tablo var mı diye kontrol edelim
                string checkTableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comments'";
                SqlCommand checkCommand = new SqlCommand(checkTableQuery, connection);
                int tableExists = (int)checkCommand.ExecuteScalar();

                if (tableExists == 0)
                {
                    System.Diagnostics.Debug.WriteLine("Henüz yorum tablosu bulunmamaktadır.");
                    return;
                }

                // IsApproved sütunu var mı kontrol et
                string checkColumnQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Comments' AND COLUMN_NAME = 'IsApproved'";
                SqlCommand checkColumnCommand = new SqlCommand(checkColumnQuery, connection);
                int columnExists = (int)checkColumnCommand.ExecuteScalar();

                if (columnExists == 0)
                {
                    // Bu durumda bütün yorumlar "onaylı değil" olarak kabul edilir
                    System.Diagnostics.Debug.WriteLine("Onay sistemi henüz kurulmamış, onaylı yorum bulunmamaktadır.");
                    return;
                }

                // Onaylı yorumları getir
                string query = @"
                    SELECT c.CommentID, c.PostID, c.CommentText, c.CreatedAt, u.Username, p.Title as PostTitle
                    FROM Comments c
                    INNER JOIN Users u ON c.UserID = u.UserID
                    INNER JOIN Posts p ON c.PostID = p.PostID
                    WHERE c.IsApproved = 1
                    ORDER BY c.CreatedAt DESC";

                SqlCommand command = new SqlCommand(query, connection);
                SqlDataAdapter adapter = new SqlDataAdapter(command);
                DataTable dt = new DataTable();
                adapter.Fill(dt);

                if (dt.Rows.Count > 0)
                {
                    System.Diagnostics.Debug.WriteLine("Onaylanmış " + dt.Rows.Count + " yorum bulundu:");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("Onaylanmış yorum bulunmamaktadır.");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Yorumlar yüklenirken bir hata oluştu.");
            LogError("LoadApprovedComments", ex);
        }
    }

    private void LogError(string methodName, Exception ex)
    {
        // Bu metodun içeriği, hata günlüğüne kaydetme işlemi için kullanılabilir.
        // Bu örnekte, hata mesajını konsola yazdırıyoruz.
        System.Diagnostics.Debug.WriteLine("Hata: " + ex.Message + " - Metod: " + methodName);
    }
}