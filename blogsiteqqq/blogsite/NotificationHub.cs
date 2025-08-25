using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Configuration;
using System.Diagnostics;

namespace blogsiteqqq
{
    public class NotificationHub : Hub
    {
        private static readonly string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

        public async Task JoinUserGroup(int userId)
        {
            await Groups.Add(Context.ConnectionId, "User_" + userId);
            
            // Kullanıcının okunmamış bildirim sayısını gönder
            var unreadCount = GetUnreadNotificationCount(userId);
            await Clients.Caller.updateNotificationCount(unreadCount);
        }

        public async Task LeaveUserGroup(int userId)
        {
            await Groups.Remove(Context.ConnectionId, "User_" + userId);
        }

        public override Task OnConnected()
        {
            Debug.WriteLine($"SignalR bağlantı kuruldu: {Context.ConnectionId}");
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            Debug.WriteLine($"SignalR bağlantı kesildi: {Context.ConnectionId}");
            return base.OnDisconnected(stopCalled);
        }

        // Bildirim sayısını al
        private int GetUnreadNotificationCount(int userId)
        {
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    
                    string query = "SELECT COUNT(*) FROM Notifications WHERE UserID = @UserID AND IsRead = 0";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserID", userId);
                        return (int)command.ExecuteScalar();
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Okunmamış bildirim sayısı alınırken hata: {ex.Message}");
                return 0;
            }
        }

        // Kullanıcının bildirimlerini al
        public async Task GetUserNotifications(int userId, int page = 1, int pageSize = 10)
        {
            try
            {
                var notifications = new List<object>();

                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = @"
                        SELECT n.*, u.Username as SenderUsername, u.ProfileImage as SenderProfileImage
                        FROM Notifications n
                        LEFT JOIN Users u ON n.SenderID = u.UserID
                        WHERE n.UserID = @UserID
                        ORDER BY n.CreatedAt DESC
                        OFFSET @Offset ROWS
                        FETCH NEXT @PageSize ROWS ONLY";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserID", userId);
                        command.Parameters.AddWithValue("@Offset", (page - 1) * pageSize);
                        command.Parameters.AddWithValue("@PageSize", pageSize);

                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                notifications.Add(new
                                {
                                    id = reader["NotificationID"],
                                    type = reader["NotificationType"],
                                    content = reader["Content"],
                                    isRead = reader["IsRead"],
                                    createdAt = Convert.ToDateTime(reader["CreatedAt"]).ToString("dd.MM.yyyy HH:mm"),
                                    senderId = reader["SenderID"] != DBNull.Value ? reader["SenderID"] : null,
                                    senderUsername = reader["SenderUsername"] != DBNull.Value ? reader["SenderUsername"] : null,
                                    senderProfileImage = reader["SenderProfileImage"] != DBNull.Value ? reader["SenderProfileImage"] : null,
                                    contentId = reader["ContentID"] != DBNull.Value ? reader["ContentID"] : null,
                                    contentType = reader["ContentType"] != DBNull.Value ? reader["ContentType"] : null
                                });
                            }
                        }
                    }
                }

                await Clients.Caller.receiveNotifications(notifications);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Bildirimler alınırken hata: {ex.Message}");
                await Clients.Caller.receiveError("Bildirimler yüklenirken bir hata oluştu.");
            }
        }

        // Bildirimi okundu olarak işaretle
        public async Task MarkAsRead(int notificationId, int userId)
        {
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID AND UserID = @UserID";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@NotificationID", notificationId);
                        command.Parameters.AddWithValue("@UserID", userId);
                        
                        if (command.ExecuteNonQuery() > 0)
                        {
                            // Okunmamış bildirim sayısını güncelle
                            var unreadCount = GetUnreadNotificationCount(userId);
                            await Clients.Group("User_" + userId).updateNotificationCount(unreadCount);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Bildirim okundu işaretlenirken hata: {ex.Message}");
            }
        }

        // Tüm bildirimleri okundu olarak işaretle
        public async Task MarkAllAsRead(int userId)
        {
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = "UPDATE Notifications SET IsRead = 1 WHERE UserID = @UserID";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserID", userId);
                        command.ExecuteNonQuery();
                    }
                }

                // Bildirim sayısını sıfırla
                await Clients.Group("User_" + userId).updateNotificationCount(0);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Tüm bildirimler okundu işaretlenirken hata: {ex.Message}");
            }
        }

        // Yeni bildirim oluştur ve gönder
        public static void SendNotificationToUser(int userId, string type, string content, int? senderId = null, int? contentId = null)
        {
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Bildirimi veritabanına ekle
                    string query = @"
                        INSERT INTO Notifications (UserID, SenderID, NotificationType, Content, ContentID, CreatedAt)
                        VALUES (@UserID, @SenderID, @Type, @Content, @ContentID, GETDATE())";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserID", userId);
                        command.Parameters.AddWithValue("@SenderID", (object)senderId ?? DBNull.Value);
                        command.Parameters.AddWithValue("@Type", type);
                        command.Parameters.AddWithValue("@Content", content);
                        command.Parameters.AddWithValue("@ContentID", (object)contentId ?? DBNull.Value);

                        command.ExecuteNonQuery();
                    }
                }

                // SignalR ile kullanıcıya gerçek zamanlı gönder
                var context = GlobalHost.ConnectionManager.GetHubContext<NotificationHub>();
                context.Clients.Group("User_" + userId).newNotification(new
                {
                    type = type,
                    content = content,
                    createdAt = DateTime.Now.ToString("dd.MM.yyyy HH:mm"),
                    senderId = senderId,
                    contentId = contentId
                });

                // Okunmamış sayısını güncelle
                var hub = new NotificationHub();
                var unreadCount = hub.GetUnreadNotificationCount(userId);
                context.Clients.Group("User_" + userId).updateNotificationCount(unreadCount);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Bildirim gönderilirken hata: {ex.Message}");
            }
        }
    }
} 