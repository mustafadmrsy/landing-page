using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.UI;
using System.Data.SqlClient;
using System.Configuration;
using System.Threading;

namespace blogsiteqqq
{
    public class Global : System.Web.HttpApplication
    {
        // 12 saatte bir çalışacak Timer
        private static System.Threading.Timer _cleanupTimer;
        
        void Application_Start(object sender, EventArgs e)
        {
            // UnobtrusiveValidationMode için jQuery tanımlaması
            ScriptManager.ScriptResourceMapping.AddDefinition("jquery",
                new ScriptResourceDefinition
                {
                    Path = "~/Scripts/jquery-3.7.1.min.js",
                    DebugPath = "~/Scripts/jquery-3.7.1.js",
                    CdnPath = "https://code.jquery.com/jquery-3.7.1.min.js",
                    CdnDebugPath = "https://code.jquery.com/jquery-3.7.1.js"
                });

            // Varsayılan doğrulama modu ayarı
            ValidationSettings.UnobtrusiveValidationMode = UnobtrusiveValidationMode.None;
            
            // Süresi dolmuş PendingUsers kayıtlarını temizlemek için timer başlat
            StartCleanupTimer();
            
            // Mesajlaşma tablolarını oluştur
            CreateTables.CreateMessagingTables();
        }
        
        // Temizleme timerını başlat
        private void StartCleanupTimer()
        {
            try
            {
                // 12 saat = 43,200,000 milisaniye
                const int cleanupInterval = 43200000;
                
                // İlk çalıştırma için başlat, sonra periyodik olarak çalışır
                _cleanupTimer = new System.Threading.Timer(CleanupExpiredRecords, null, 0, cleanupInterval);
            }
            catch (Exception ex)
            {
#if DEBUG
                System.Diagnostics.Debug.WriteLine("Timer başlatma hatası: " + ex.Message);
#endif
            }
        }
        
        // Süresi dolmuş kayıtları temizle
        private void CleanupExpiredRecords(object state)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
                
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    
                    // 24 saat önce oluşturulmuş ve hala doğrulanmamış kayıtları sil
                    string query = "DELETE FROM PendingUsers WHERE DATEDIFF(HOUR, TokenCreatedAt, GETDATE()) > 24";
                    
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        int affectedRows = command.ExecuteNonQuery();
#if DEBUG
                        System.Diagnostics.Debug.WriteLine($"{DateTime.Now} - {affectedRows} adet süresi dolmuş PendingUsers kaydı temizlendi.");
#endif
                    }
                }
            }
            catch (Exception ex)
            {
#if DEBUG
                System.Diagnostics.Debug.WriteLine($"Temizleme işlemi sırasında hata: {ex.Message}");
#endif
            }
        }

        void Application_BeginRequest(object sender, EventArgs e)
        {
            // Kök dizine istek geldiğinde blogsite/default.aspx'e yönlendir
            if (Request.Url.AbsolutePath == "/" || string.IsNullOrEmpty(Request.Url.AbsolutePath) || Request.Url.AbsolutePath == "/blogsiteqqq/")
            {
                Response.Redirect("~/blogsite/default.aspx");
            }
        }
        
        void Application_End(object sender, EventArgs e)
        {
            // Uygulama sonlandığında timer'ı temizle
            if (_cleanupTimer != null)
            {
                _cleanupTimer.Dispose();
            }
        }
        
        void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            // Auth cookie varsa kullanıcı bilgilerini ayarla
            if (Request.IsAuthenticated)
            {
                HttpCookie authCookie = Request.Cookies[FormsAuthentication.FormsCookieName];
                if (authCookie != null)
                {
                    FormsAuthenticationTicket ticket = FormsAuthentication.Decrypt(authCookie.Value);
                    string userData = ticket.UserData;
                    string[] roles = userData.Split(',');
                    Context.User = new System.Security.Principal.GenericPrincipal(Context.User.Identity, roles);
                }
            }
        }
    }
} 