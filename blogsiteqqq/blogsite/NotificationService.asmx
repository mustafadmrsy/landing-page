<%@ WebService Language="C#" Class="NotificationService" %>

using System;
using System.Collections.Generic;
using System.Web.Services;
using System.Web.Script.Services;
using System.Data.SqlClient;
using System.Configuration;

[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.ComponentModel.ToolboxItem(false)]
[ScriptService]
public class NotificationService : System.Web.Services.WebService
{
    [WebMethod]
    public string HelloWorld()
    {
        return "Hello World";
    }



    [WebMethod(EnableSession = true)]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
    public object GetUserNotifications(int userId, int page, int pageSize)
    {
        try
        {
            List<object> notifications = new List<object>();
            
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Tabloyu kontrol et ve eksik kolonları ekle
                EnsureNotificationTableExists(connection);

                // Bildirimleri getir - önce hangi kolonların var olduğunu kontrol et
                string query = @"SELECT TOP 10 NotificationID, NotificationType, Content, IsRead, CreatedAt";
                
                // SenderID varsa ekle
                if (ColumnExists(connection, "Notifications", "SenderID"))
                {
                    query += ", SenderID";
                }
                
                // ContentID varsa ekle  
                if (ColumnExists(connection, "Notifications", "ContentID"))
                {
                    query += ", ContentID";
                }
                
                // ContentType varsa ekle
                if (ColumnExists(connection, "Notifications", "ContentType"))
                {
                    query += ", ContentType";
                }

                query += @" FROM Notifications 
                           WHERE UserID = @UserID 
                           ORDER BY CreatedAt DESC";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            notifications.Add(new
                            {
                                id = reader["NotificationID"],
                                type = reader["NotificationType"].ToString(),
                                content = reader["Content"].ToString(),
                                isRead = Convert.ToBoolean(reader["IsRead"]),
                                createdAt = Convert.ToDateTime(reader["CreatedAt"]).ToString("dd.MM.yyyy HH:mm"),
                                senderId = HasColumn(reader, "SenderID") && reader["SenderID"] != DBNull.Value ? reader["SenderID"] : null,
                                contentId = HasColumn(reader, "ContentID") && reader["ContentID"] != DBNull.Value ? reader["ContentID"] : null,
                                contentType = HasColumn(reader, "ContentType") && reader["ContentType"] != DBNull.Value ? reader["ContentType"].ToString() : null
                            });
                        }
                    }
                }

                // Okunmamış sayısını hesapla
                int unreadCount = 0;
                string countQuery = "SELECT COUNT(*) FROM Notifications WHERE UserID = @UserID AND IsRead = 0";
                using (SqlCommand countCmd = new SqlCommand(countQuery, connection))
                {
                    countCmd.Parameters.AddWithValue("@UserID", userId);
                    unreadCount = (int)countCmd.ExecuteScalar();
                }

                return new { 
                    notifications = notifications, 
                    unreadCount = unreadCount,
                    success = true 
                };
            }
        }
        catch (Exception ex)
        {
            return new { 
                notifications = new List<object>(), 
                unreadCount = 0,
                success = false,
                error = ex.Message 
            };
        }
    }

    [WebMethod(EnableSession = true)]
    public bool MarkNotificationAsRead(int notificationId)
    {
        try
        {
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @NotificationID";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@NotificationID", notificationId);
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }
        catch (Exception)
        {
            return false;
        }
    }

    [WebMethod(EnableSession = true)]
    public bool MarkAllNotificationsAsRead(int userId)
    {
        try
        {
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "UPDATE Notifications SET IsRead = 1 WHERE UserID = @UserID AND IsRead = 0";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    int updatedRows = command.ExecuteNonQuery();
                    return updatedRows >= 0; // 0 da başarılı sayılır (zaten okunmuş olabilir)
                }
            }
        }
        catch (Exception)
        {
            return false;
        }
    }

    [WebMethod(EnableSession = true)]
    public bool DeleteAllNotifications(int userId)
    {
        try
        {
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "DELETE FROM Notifications WHERE UserID = @UserID";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    int deletedRows = command.ExecuteNonQuery();
                    return deletedRows >= 0; // 0 da başarılı sayılır (zaten boş olabilir)
                }
            }
        }
        catch (Exception)
        {
            return false;
        }
    }

    public static void CreateNotification(int userId, string notificationType, string content, int? senderId = null, int? contentId = null, string contentType = null)
    {
        try
        {
            string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Basit INSERT - sadece temel kolonları kullan
                string query = @"INSERT INTO Notifications (UserID, NotificationType, Content, CreatedAt)
                                VALUES (@UserID, @NotificationType, @Content, GETDATE())";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserID", userId);
                    command.Parameters.AddWithValue("@NotificationType", notificationType);
                    command.Parameters.AddWithValue("@Content", content);

                    command.ExecuteNonQuery();
                }
            }
        }
        catch (Exception)
        {
            // Hata durumunda sessizce geç
        }
    }

    // Yardımcı metodlar
    private void EnsureNotificationTableExists(SqlConnection connection)
    {
        string checkTable = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications'";
        using (SqlCommand cmd = new SqlCommand(checkTable, connection))
        {
            if ((int)cmd.ExecuteScalar() == 0)
            {
                // Tablo yoksa temel yapıyla oluştur
                string createTable = @"CREATE TABLE Notifications (
                    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
                    UserID INT NOT NULL,
                    NotificationType NVARCHAR(50) NOT NULL,
                    Content NVARCHAR(500) NOT NULL,
                    IsRead BIT DEFAULT 0,
                    CreatedAt DATETIME DEFAULT GETDATE()
                )";
                using (SqlCommand createCmd = new SqlCommand(createTable, connection))
                {
                    createCmd.ExecuteNonQuery();
                }
            }
        }
    }

    private bool ColumnExists(SqlConnection connection, string tableName, string columnName)
    {
        string query = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @TableName AND COLUMN_NAME = @ColumnName";
        using (SqlCommand cmd = new SqlCommand(query, connection))
        {
            cmd.Parameters.AddWithValue("@TableName", tableName);
            cmd.Parameters.AddWithValue("@ColumnName", columnName);
            return (int)cmd.ExecuteScalar() > 0;
        }
    }

    private bool HasColumn(SqlDataReader reader, string columnName)
    {
        try
        {
            return reader.GetOrdinal(columnName) >= 0;
        }
        catch
        {
            return false;
        }
    }
} 