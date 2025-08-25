using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text.RegularExpressions;

public partial class search : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
    
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            string query = Request.QueryString["q"];
            
            if (!string.IsNullOrEmpty(query))
            {
                txtSearch.Text = query;
                ltlSearchQuery.Text = Server.HtmlEncode(query);
                PerformSearch(query);
            }
        }
    }
    
    protected void btnSearch_Click(object sender, EventArgs e)
    {
        string searchText = txtSearch.Text.Trim();
        
        if (!string.IsNullOrEmpty(searchText))
        {
            Response.Redirect("search.aspx?q=" + Server.UrlEncode(searchText));
        }
    }
    
    private void PerformSearch(string query)
    {
        List<UserInfo> users = SearchUsers(query);
        List<PostInfo> posts = SearchPosts(query);
        
        // Debug bilgisi
        System.Diagnostics.Debug.WriteLine("Arama sorgusu: " + query);
        System.Diagnostics.Debug.WriteLine("Bulunan kullanıcı sayısı: " + users.Count);
        System.Diagnostics.Debug.WriteLine("Bulunan blog yazısı sayısı: " + posts.Count);
        
        // Kullanıcı sonuçlarını göster
        if (users.Count > 0)
        {
            rptUsers.DataSource = users;
            rptUsers.DataBind();
            pnlUsers.Visible = true;
            System.Diagnostics.Debug.WriteLine("Kullanıcılar paneli görünür yapıldı");
        }
        else
        {
            System.Diagnostics.Debug.WriteLine("Kullanıcı bulunamadı.");
        }
        
        // Blog yazıları sonuçlarını göster
        if (posts.Count > 0)
        {
            rptPosts.DataSource = posts;
            rptPosts.DataBind();
            pnlPosts.Visible = true;
        }
        
        // Hiç sonuç yoksa uyarı göster
        if (users.Count == 0 && posts.Count == 0)
        {
            pnlNoResults.Visible = true;
        }
    }
    
    private List<UserInfo> SearchUsers(string query)
    {
        List<UserInfo> users = new List<UserInfo>();
        
        try
        {
            // Debug için sorguyu yazdır
            System.Diagnostics.Debug.WriteLine("Kullanıcı arama sorgusu: " + query);
            
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Resimli kullanıcıları bulmak için Users ve UserProfiles tablolarını birleştirme
                string sql = @"
                    SELECT u.UserID, u.Username, u.Email, 
                           ISNULL(up.FirstName, '') AS FirstName,
                           ISNULL(up.LastName, '') AS LastName,
                           ISNULL(u.ProfilePicture, '') AS ProfilePicture,
                           ISNULL(up.Bio, '') AS Bio
                    FROM Users u
                    LEFT JOIN UserProfiles up ON u.UserID = up.UserID
                    WHERE u.Username LIKE @Query 
                       OR u.Email LIKE @Query
                       OR up.FirstName LIKE @Query 
                       OR up.LastName LIKE @Query
                    ORDER BY u.Username
                ";
                
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Query", "%" + query + "%");
                    
                    try
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            // Veritabanı sorgu sonuçlarını kontrol et
                            if (!reader.HasRows)
                            {
                                System.Diagnostics.Debug.WriteLine("Kullanıcı sorgusu sonuç getirmedi.");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine("Kullanıcı sorgusu sonuç getirdi!");
                            }
                            
                            while (reader.Read())
                            {
                                // Kullanıcı bilgilerini oku
                                UserInfo user = new UserInfo();
                                
                                // UserID ve Username kesinlikle olmalı
                                user.UserID = reader["UserID"].ToString();
                                user.Username = reader["Username"].ToString();
                                user.Email = reader["Email"] != DBNull.Value ? reader["Email"].ToString() : "";
                                
                                // Diğer alanlar null olabilir
                                user.FirstName = reader["FirstName"] != DBNull.Value ? reader["FirstName"].ToString() : "";
                                user.LastName = reader["LastName"] != DBNull.Value ? reader["LastName"].ToString() : "";
                                user.Bio = reader["Bio"] != DBNull.Value ? reader["Bio"].ToString() : "";
                                
                                // Tam ad oluştur
                                user.FullName = string.IsNullOrEmpty(user.FirstName) && string.IsNullOrEmpty(user.LastName)
                                    ? ""
                                    : (user.FirstName + " " + user.LastName).Trim();
                                
                                // Profil fotoğrafı
                                user.ProfileImage = reader["ProfilePicture"] != DBNull.Value ? reader["ProfilePicture"].ToString() : "";
                                
                                // Profil resmi yoksa varsayılan resmi kullan
                                if (string.IsNullOrEmpty(user.ProfileImage))
                                {
                                    user.ProfileImage = "assets/img/default-profile.png";
                                }
                                
                                // Debug bilgisi
                                System.Diagnostics.Debug.WriteLine("Bulunan kullanıcı: " + user.Username + " (ID: " + user.UserID + ")");
                                
                                users.Add(user);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("SqlReader hatası: " + ex.Message);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Kullanıcı arama hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata detayı: " + ex.ToString());
        }
        
        return users;
    }
    
    private List<PostInfo> SearchPosts(string query)
    {
        List<PostInfo> posts = new List<PostInfo>();
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                string sql = @"
                    SELECT p.PostID, p.Title, p.Content, p.CategoryID, p.UserID,
                           COALESCE(u.Username, 'Anonim') AS AuthorName,
                           COALESCE(c.CategoryName, 'Genel') AS CategoryName,
                           p.CreatedAt
                    FROM Posts p
                    LEFT JOIN Users u ON p.UserID = u.UserID
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE (
                        p.Title LIKE @Query
                        OR p.Content LIKE @Query
                        OR u.Username LIKE @Query
                        OR c.CategoryName LIKE @Query
                    )
                    ORDER BY p.CreatedAt DESC
                ";
                
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Query", "%" + query + "%");
                    
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            PostInfo post = new PostInfo();
                            
                            // Değerleri güvenli bir şekilde al
                            try { post.PostID = reader["PostID"].ToString(); }
                            catch { post.PostID = "0"; }
                            
                            try { post.Title = reader["Title"].ToString(); }
                            catch { post.Title = "Başlıksız yazı"; }
                            
                            try { post.Author = reader["AuthorName"].ToString(); }
                            catch { post.Author = "Anonim"; }
                            
                            try { post.Category = reader["CategoryName"].ToString(); }
                            catch { post.Category = "Genel"; }
                            
                            // Tarih
                            try
                            {
                                DateTime createDate = Convert.ToDateTime(reader["CreatedAt"]);
                                post.Date = createDate.ToString("dd.MM.yyyy");
                            }
                            catch
                            {
                                post.Date = DateTime.Now.ToString("dd.MM.yyyy");
                            }
                            
                            // İçerikten kısa bir özet oluştur
                            try
                            {
                                string content = reader["Content"].ToString();
                                // HTML etiketlerini temizle
                                content = Regex.Replace(content, "<.*?>", string.Empty);
                                // Kısalt (150 karakter)
                                if (content.Length > 150)
                                {
                                    content = content.Substring(0, 147) + "...";
                                }
                                post.Excerpt = content;
                            }
                            catch
                            {
                                post.Excerpt = "";
                            }
                            
                            posts.Add(post);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Blog yazısı arama hatası: " + ex.Message);
        }
        
        return posts;
    }
    
    // Kullanıcı bilgilerini temsil eden sınıf
    public class UserInfo
    {
        public string UserID { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public string ProfileImage { get; set; }
        public string Bio { get; set; }
    }
    
    // Blog yazısı bilgilerini temsil eden sınıf
    public class PostInfo
    {
        public string PostID { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Category { get; set; }
        public string Date { get; set; }
        public string Excerpt { get; set; }
    }
} 