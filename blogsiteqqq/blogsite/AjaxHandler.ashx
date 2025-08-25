<%@ WebHandler Language="C#" Class="AjaxHandler" %>

using System;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Configuration;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

public class AjaxHandler : IHttpHandler {
    
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
    
    public void ProcessRequest(HttpContext context) {
        context.Response.ContentType = "application/json";
        
        try {
            string action = context.Request.QueryString["action"];
            
            switch (action) {
                case "search":
                    HandleSearch(context);
                    break;
                default:
                    SendError(context, "Geçersiz işlem");
                    break;
            }
        }
        catch (Exception ex) {
            System.Diagnostics.Debug.WriteLine("ProcessRequest Hatası: " + ex.Message);
            SendError(context, "Sunucu hatası: " + ex.Message);
        }
    }
    
    private void HandleSearch(HttpContext context) {
        try {
            string query = context.Request.QueryString["q"];
            
            if (string.IsNullOrEmpty(query)) {
                SendError(context, "Arama sorgusu boş olamaz");
                return;
            }
            
            // CORS başlıkları ekle
            context.Response.AddHeader("Access-Control-Allow-Origin", "*");
            context.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST");
            context.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type");
            
            // Önbellek kontrolü için başlıklar
            context.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            context.Response.Cache.SetNoStore();
            context.Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            context.Response.AddHeader("Pragma", "no-cache");
            context.Response.AddHeader("Expires", "0");
            
            // Veri aramasını yap
            var users = GetUsers(query);
            var posts = GetPosts(query);
            
            var responseData = new {
                success = true,
                users = users,
                posts = posts
            };
            
            var serializer = new JavaScriptSerializer();
            string json = serializer.Serialize(responseData);
            
            context.Response.Write(json);
        }
        catch (Exception ex) {
            System.Diagnostics.Debug.WriteLine("HandleSearch Hatası: " + ex.Message);
            SendError(context, "Arama hatası: " + ex.Message);
        }
    }
    
    private List<Dictionary<string, object>> GetUsers(string query) {
        List<Dictionary<string, object>> users = new List<Dictionary<string, object>>();
        
        try {
            using (SqlConnection connection = new SqlConnection(connectionString)) {
                connection.Open();
                
                // Kullanıcıları ve profil bilgilerini al
                string sql = @"
                    SELECT TOP 5 u.UserID, u.Username, 
                        COALESCE(u.FirstName, '') AS FirstName,
                        COALESCE(u.LastName, '') AS LastName,
                        COALESCE(u.ProfilePicture, '') AS ProfilePicture,
                        COALESCE(u.Bio, '') AS Bio
                    FROM Users u
                    WHERE u.Username LIKE @Query 
                       OR u.FirstName LIKE @Query 
                       OR u.LastName LIKE @Query
                       OR u.Email LIKE @Query
                       OR (u.FirstName + ' ' + u.LastName) LIKE @Query
                    ORDER BY 
                        CASE WHEN u.Username = @ExactQuery THEN 1
                             WHEN u.Username LIKE @StartQuery THEN 2
                             WHEN (u.FirstName + ' ' + u.LastName) LIKE @Query THEN 3
                             ELSE 4
                        END
                ";
                
                using (SqlCommand command = new SqlCommand(sql, connection)) {
                    command.Parameters.AddWithValue("@Query", "%" + query + "%");
                    command.Parameters.AddWithValue("@ExactQuery", query);
                    command.Parameters.AddWithValue("@StartQuery", query + "%");
                    
                    using (SqlDataReader reader = command.ExecuteReader()) {
                        while (reader.Read()) {
                            // Kullanıcı bilgilerini hazırla
                            string userId = reader["UserID"].ToString();
                            string username = reader["Username"].ToString();
                            string firstName = reader["FirstName"].ToString();
                            string lastName = reader["LastName"].ToString();
                            string fullName = string.IsNullOrEmpty(firstName) && string.IsNullOrEmpty(lastName) 
                                ? "" 
                                : (firstName + " " + lastName).Trim();
                            
                            // Profil fotoğrafını al
                            string profileImage = reader["ProfilePicture"].ToString();
                            
                            // Hiç profil resmi yoksa varsayılan resmi kullan
                            if (string.IsNullOrEmpty(profileImage)) {
                                profileImage = "assets/img/default-profile.png";
                            }
                            
                            // Bio değerini al
                            string bio = reader["Bio"].ToString();
                            
                            // Kullanıcıyı listeye ekle
                            Dictionary<string, object> user = new Dictionary<string, object> {
                                { "userId", userId },
                                { "username", username },
                                { "fullName", fullName },
                                { "bio", bio },
                                { "profileImage", profileImage }
                            };
                            
                            users.Add(user);
                        }
                    }
                }
            }
        }
        catch (Exception ex) {
            System.Diagnostics.Debug.WriteLine("GetUsers Hatası: " + ex.Message);
        }
        
        return users;
    }
    
    private List<Dictionary<string, object>> GetPosts(string query) {
        List<Dictionary<string, object>> posts = new List<Dictionary<string, object>>();
        
        try {
            using (SqlConnection connection = new SqlConnection(connectionString)) {
                connection.Open();
                
                string sql = @"
                    SELECT TOP 5 p.PostID, p.Title, p.Content, p.CategoryID, p.UserID,
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
                
                using (SqlCommand command = new SqlCommand(sql, connection)) {
                    command.Parameters.AddWithValue("@Query", "%" + query + "%");
                    
                    using (SqlDataReader reader = command.ExecuteReader()) {
                        while (reader.Read()) {
                            Dictionary<string, object> post = new Dictionary<string, object>();
                            
                            // Sütunları güvenli şekilde ekle
                            try { post.Add("postId", reader["PostID"]); }
                            catch { post.Add("postId", 0); }
                            
                            try { post.Add("title", reader["Title"]); }
                            catch { post.Add("title", "Başlıksız yazı"); }
                            
                            try { post.Add("author", reader["AuthorName"]); }
                            catch { post.Add("author", "Anonim"); }
                            
                            try { post.Add("category", reader["CategoryName"]); } 
                            catch { post.Add("category", "Genel"); }
                            
                            // Tarih formatını düzgün şekilde çevir
                            try {
                                DateTime createDate = Convert.ToDateTime(reader["CreatedAt"]);
                                post.Add("date", createDate.ToString("dd.MM.yyyy"));
                            }
                            catch {
                                post.Add("date", DateTime.Now.ToString("dd.MM.yyyy"));
                            }
                            
                            // İçerikten kısa bir özet oluştur
                            try {
                                string content = reader["Content"].ToString();
                                // HTML etiketlerini temizle
                                content = Regex.Replace(content, "<.*?>", string.Empty);
                                // Kısalt (150 karakter)
                                if (content.Length > 150) {
                                    content = content.Substring(0, 147) + "...";
                                }
                                post.Add("excerpt", content);
                            }
                            catch {
                                post.Add("excerpt", "");
                            }
                            
                            posts.Add(post);
                        }
                    }
                }
            }
        }
        catch (Exception ex) {
            System.Diagnostics.Debug.WriteLine("GetPosts Hatası: " + ex.Message);
        }
        
        return posts;
    }
    
    private void SendError(HttpContext context, string message) {
        try {
            var responseData = new {
                success = false,
                message = message
            };
            
            var serializer = new JavaScriptSerializer();
            string json = serializer.Serialize(responseData);
            
            context.Response.Clear();
            context.Response.Write(json);
        }
        catch (Exception ex) {
            System.Diagnostics.Debug.WriteLine("SendError hatası: " + ex.Message);
            context.Response.Clear();
            context.Response.ContentType = "text/plain";
            context.Response.Write("Hata: " + message);
        }
    }
    
    public bool IsReusable {
        get {
            return false;
        }
    }
} 