using System;
using System.Web;
using System.Web.UI;
using System.Data.SqlClient;
using System.Web.Services;
using System.Web.Script.Services;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Configuration;

public partial class Messages : System.Web.UI.Page
{
    private static string ConnectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        // Oturum kontrolü
        if (Session["KullaniciID"] == null)
        {
            Response.Redirect("login.aspx");
            return;
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object GetConversations()
    {
        try
        {
            var currentUserId = HttpContext.Current.Session["KullaniciID"] != null ? 
                               HttpContext.Current.Session["KullaniciID"].ToString() : 
                               null;

            if (string.IsNullOrEmpty(currentUserId))
            {
                return new { success = false, message = "Oturum açmanız gerekiyor." };
            }

            var conversations = new List<object>();
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(@"
                    SELECT * FROM (
                        SELECT 
                            c.ConversationID,
                            c.CreatedAt as LastMessageTime,
                            m.Content as LastMessage,
                            m.CreatedAt as MessageTime,
                            u.UserID as OtherUserID,
                            u.Username as OtherUserName,
                            u.ProfilePicture as OtherUserProfileImage,
                            (SELECT COUNT(*) FROM Messages 
                             WHERE ConversationID = c.ConversationID 
                             AND SenderID != @currentUserId 
                             AND IsRead = 0) as UnreadCount,
                            ROW_NUMBER() OVER (PARTITION BY c.ConversationID ORDER BY m.CreatedAt DESC) as RowNum
                        FROM Conversations c
                        INNER JOIN ConversationParticipants cp1 ON c.ConversationID = cp1.ConversationID
                        INNER JOIN ConversationParticipants cp2 ON c.ConversationID = cp2.ConversationID
                        INNER JOIN Users u ON cp2.UserID = u.UserID
                        LEFT JOIN Messages m ON c.ConversationID = m.ConversationID
                        WHERE cp1.UserID = @currentUserId 
                        AND cp2.UserID != @currentUserId
                    ) AS ConvWithMessages
                    WHERE RowNum = 1 OR RowNum IS NULL
                    ORDER BY COALESCE(MessageTime, LastMessageTime) DESC", conn))
                {
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string lastMessage = reader["LastMessage"] == DBNull.Value ? 
                                               "Henüz mesaj yok" : 
                                               reader["LastMessage"].ToString();

                            string profileImage = reader["OtherUserProfileImage"] == DBNull.Value ? 
                                                null : 
                                                reader["OtherUserProfileImage"].ToString();

                            DateTime lastMessageTime = reader["MessageTime"] != DBNull.Value ? 
                                                     (DateTime)reader["MessageTime"] : 
                                                     (DateTime)reader["LastMessageTime"];

                            conversations.Add(new
                            {
                                id = reader["ConversationID"].ToString(),
                                lastMessageTime = lastMessageTime.ToString("o"),
                                lastMessage = lastMessage,
                                unreadCount = Convert.ToInt32(reader["UnreadCount"]),
                                otherUser = new
                                {
                                    id = reader["OtherUserID"].ToString(),
                                    name = reader["OtherUserName"].ToString(),
                                    profileImage = string.IsNullOrEmpty(profileImage) ? 
                                                 null : 
                                                 profileImage
                                }
                            });
                        }
                    }
                }
            }

            return new { success = true, conversations = conversations };
        }
        catch (Exception ex)
        {
            return new { success = false, message = ex.Message };
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object GetMessages(int conversationId)
    {
        try
        {
            var currentUserId = HttpContext.Current.Session["KullaniciID"] != null ? 
                               HttpContext.Current.Session["KullaniciID"].ToString() : 
                               null;

            if (string.IsNullOrEmpty(currentUserId))
            {
                return new { success = false, message = "Oturum açmanız gerekiyor." };
            }

            // Kullanıcının bu konuşmaya erişim yetkisi var mı kontrol et
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(@"
                    SELECT COUNT(*)
                    FROM ConversationParticipants
                    WHERE ConversationID = @conversationId AND UserID = @currentUserId", conn))
                {
                    cmd.Parameters.AddWithValue("@conversationId", conversationId);
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    
                    int count = Convert.ToInt32(cmd.ExecuteScalar());
                    if (count == 0)
                    {
                        return new { success = false, message = "Bu konuşmaya erişim yetkiniz yok." };
                    }
                }

                var messages = new List<object>();
                // Mesajları getir
                using (var cmd = new SqlCommand(@"
                    SELECT 
                        m.MessageID,
                        m.SenderID,
                        m.Content,
                        m.CreatedAt,
                        m.IsRead,
                        u.Username as SenderName,
                        u.ProfilePicture as SenderProfilePicture
                    FROM Messages m
                    INNER JOIN Users u ON m.SenderID = u.UserID
                    WHERE m.ConversationID = @conversationId
                    ORDER BY m.CreatedAt", conn))
                {
                    cmd.Parameters.AddWithValue("@conversationId", conversationId);

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string profileImage = reader["SenderProfilePicture"] == DBNull.Value ? 
                                                null : 
                                                reader["SenderProfilePicture"].ToString();

                            messages.Add(new
                            {
                                id = reader["MessageID"].ToString(),
                                senderId = reader["SenderID"].ToString(),
                                senderName = reader["SenderName"].ToString(),
                                senderProfileImage = string.IsNullOrEmpty(profileImage) ? 
                                                   null : 
                                                   profileImage,
                                content = reader["Content"].ToString(),
                                createdAt = ((DateTime)reader["CreatedAt"]).ToString("o"),
                                isRead = Convert.ToBoolean(reader["IsRead"]),
                                isMine = reader["SenderID"].ToString() == currentUserId
                            });
                        }
                    }
                }

                // Okunmamış mesajları okundu olarak işaretle
                using (var cmd = new SqlCommand(@"
                    UPDATE Messages
                    SET IsRead = 1
                    WHERE ConversationID = @conversationId
                    AND SenderID != @currentUserId
                    AND IsRead = 0", conn))
                {
                    cmd.Parameters.AddWithValue("@conversationId", conversationId);
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    cmd.ExecuteNonQuery();
                }

                return new { success = true, messages = messages };
            }
        }
        catch (Exception ex)
        {
            return new { success = false, message = ex.Message };
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object SendMessage(int conversationId, string content)
    {
        var currentUserId = HttpContext.Current.Session["KullaniciID"] != null ? 
                           HttpContext.Current.Session["KullaniciID"].ToString() : 
                           null;

        if (string.IsNullOrEmpty(currentUserId))
        {
            return new { success = false, message = "Oturum açmanız gerekiyor." };
        }

        using (var conn = new SqlConnection(ConnectionString))
        {
            conn.Open();

            // Alıcı ID'sini bul
            string receiverId;
            using (var cmd = new SqlCommand(@"
                SELECT cp.UserID as ReceiverID
                FROM ConversationParticipants cp
                WHERE cp.ConversationID = @conversationId 
                AND cp.UserID != @currentUserId", conn))
            {
                cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                cmd.Parameters.AddWithValue("@conversationId", conversationId);
                var result = cmd.ExecuteScalar();
                receiverId = result != null ? result.ToString() : null;
            }

            if (string.IsNullOrEmpty(receiverId))
            {
                return new { success = false, message = "Konuşma bulunamadı." };
            }

            // Mesajı kaydet
            int messageId;
            using (var cmd = new SqlCommand(@"
                INSERT INTO Messages (ConversationID, SenderID, ReceiverID, Content, CreatedAt, IsRead)
                VALUES (@conversationId, @currentUserId, @receiverId, @content, GETDATE(), 0);
                SELECT SCOPE_IDENTITY();", conn))
            {
                cmd.Parameters.AddWithValue("@conversationId", conversationId);
                cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                cmd.Parameters.AddWithValue("@receiverId", receiverId);
                cmd.Parameters.AddWithValue("@content", content);

                messageId = Convert.ToInt32(cmd.ExecuteScalar());
            }

            // Son mesaj zamanını güncelle
            using (var cmd = new SqlCommand(@"
                UPDATE Conversations
                SET LastMessageTime = GETDATE(),
                    LastMessage = @content
                WHERE ConversationID = @conversationId", conn))
            {
                cmd.Parameters.AddWithValue("@conversationId", conversationId);
                cmd.Parameters.AddWithValue("@content", content);
                cmd.ExecuteNonQuery();
            }

            // Bildirim ekle
            using (var cmd = new SqlCommand(@"
                INSERT INTO Notifications (UserID, SenderID, NotificationType, Content, ContentID, IsRead, CreatedAt)
                VALUES (@receiverId, @currentUserId, 'message', @content, @conversationId, 0, GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@receiverId", receiverId);
                cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                cmd.Parameters.AddWithValue("@content", content);
                cmd.Parameters.AddWithValue("@conversationId", conversationId);
                cmd.ExecuteNonQuery();
            }

            return new { 
                success = true, 
                message = new { 
                    id = messageId,
                    content = content,
                    createdAt = DateTime.Now.ToString("o"),
                    isMine = true
                } 
            };
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object StartConversation(int userId)
    {
        try
        {
            var currentUserId = HttpContext.Current.Session["KullaniciID"] != null ? 
                               HttpContext.Current.Session["KullaniciID"].ToString() : 
                               null;

            if (string.IsNullOrEmpty(currentUserId))
            {
                return new { success = false, message = "Oturum açmanız gerekiyor." };
            }

            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                
                // Önce mevcut konuşma var mı kontrol et
                using (var cmd = new SqlCommand(@"
                    SELECT c.ConversationID 
                    FROM Conversations c
                    INNER JOIN ConversationParticipants cp1 ON c.ConversationID = cp1.ConversationID
                    INNER JOIN ConversationParticipants cp2 ON c.ConversationID = cp2.ConversationID
                    WHERE cp1.UserID = @currentUserId AND cp2.UserID = @userId", conn))
                {
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    cmd.Parameters.AddWithValue("@userId", userId);

                    var existingConversationId = cmd.ExecuteScalar();
                    
                    if (existingConversationId != null)
                    {
                        return new { success = true, conversationId = existingConversationId };
                    }
                }

                // Yeni konuşma oluştur
                int conversationId;
                using (var cmd = new SqlCommand(@"
                    INSERT INTO Conversations (CreatedAt)
                    VALUES (GETDATE());
                    SELECT SCOPE_IDENTITY();", conn))
                {
                    conversationId = Convert.ToInt32(cmd.ExecuteScalar());
                }

                // Konuşma katılımcılarını ekle
                using (var cmd = new SqlCommand(@"
                    INSERT INTO ConversationParticipants (ConversationID, UserID)
                    VALUES (@conversationId, @currentUserId), (@conversationId, @userId)", conn))
                {
                    cmd.Parameters.AddWithValue("@conversationId", conversationId);
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    cmd.Parameters.AddWithValue("@userId", userId);
                    cmd.ExecuteNonQuery();
                }

                return new { success = true, conversationId = conversationId };
            }
        }
        catch (Exception ex)
        {
            return new { success = false, message = ex.Message };
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object SearchUsers(string q)
    {
        try
        {
            var currentUserId = HttpContext.Current.Session["KullaniciID"] != null ? 
                               HttpContext.Current.Session["KullaniciID"].ToString() : 
                               null;

            if (string.IsNullOrEmpty(currentUserId))
            {
                return new { success = false, message = "Oturum açmanız gerekiyor." };
            }

            var users = new List<object>();
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(@"
                    SELECT TOP 10 
                        UserID,
                        Username,
                        ProfilePicture
                    FROM Users 
                    WHERE UserID != @currentUserId 
                    AND (Username LIKE @searchTerm + '%' OR Email LIKE @searchTerm + '%')
                    ORDER BY Username", conn))
                {
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    cmd.Parameters.AddWithValue("@searchTerm", q);

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string profileImage = reader["ProfilePicture"] == DBNull.Value ? 
                                                null : 
                                                reader["ProfilePicture"].ToString();

                            users.Add(new
                            {
                                id = Convert.ToInt32(reader["UserID"]),
                                name = reader["Username"].ToString(),
                                profileImage = string.IsNullOrEmpty(profileImage) ? 
                                             null : 
                                             profileImage
                            });
                        }
                    }
                }
            }

            return new { success = true, users = users };
        }
        catch (Exception ex)
        {
            return new { success = false, message = ex.Message };
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object GetUnreadMessageCount()
    {
        try
        {
            var currentUserId = HttpContext.Current.Session["KullaniciID"] != null ? 
                               HttpContext.Current.Session["KullaniciID"].ToString() : 
                               null;

            if (string.IsNullOrEmpty(currentUserId))
            {
                return new { success = false, message = "Oturum açmanız gerekiyor." };
            }

            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                using (var cmd = new SqlCommand(@"
                    SELECT COUNT(*) 
                    FROM Messages m
                    WHERE m.ReceiverID = @currentUserId 
                    AND m.IsRead = 0", conn))
                {
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    int count = Convert.ToInt32(cmd.ExecuteScalar());
                    return new { success = true, count = count };
                }
            }
        }
        catch (Exception ex)
        {
            return new { success = false, message = ex.Message };
        }
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static object DeleteMessage(int messageId)
    {
        try
        {
            var currentUserId = HttpContext.Current.Session["KullaniciID"] != null ? 
                               HttpContext.Current.Session["KullaniciID"].ToString() : 
                               null;

            if (string.IsNullOrEmpty(currentUserId))
            {
                return new { success = false, message = "Oturum açmanız gerekiyor." };
            }

            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                
                // Önce mesajın sahibi olduğundan emin ol
                using (var cmd = new SqlCommand(@"
                    SELECT COUNT(*) 
                    FROM Messages 
                    WHERE MessageID = @messageId 
                    AND SenderID = @currentUserId", conn))
                {
                    cmd.Parameters.AddWithValue("@messageId", messageId);
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    
                    int count = Convert.ToInt32(cmd.ExecuteScalar());
                    if (count == 0)
                    {
                        return new { success = false, message = "Bu mesajı silme yetkiniz yok." };
                    }
                }

                // Mesajı sil
                using (var cmd = new SqlCommand(@"
                    DELETE FROM Messages 
                    WHERE MessageID = @messageId 
                    AND SenderID = @currentUserId", conn))
                {
                    cmd.Parameters.AddWithValue("@messageId", messageId);
                    cmd.Parameters.AddWithValue("@currentUserId", currentUserId);
                    cmd.ExecuteNonQuery();
                }

                // Son mesajı güncelle
                using (var cmd = new SqlCommand(@"
                    UPDATE c
                    SET LastMessage = m.Content,
                        LastMessageTime = m.CreatedAt
                    FROM Conversations c
                    CROSS APPLY (
                        SELECT TOP 1 Content, CreatedAt
                        FROM Messages
                        WHERE ConversationID = c.ConversationID
                        ORDER BY CreatedAt DESC
                    ) m", conn))
                {
                    cmd.ExecuteNonQuery();
                }

                return new { success = true };
            }
        }
        catch (Exception ex)
        {
            return new { success = false, message = ex.Message };
        }
    }
} 