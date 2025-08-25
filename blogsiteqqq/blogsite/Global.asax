<%@ Application Language="C#" %>
<%@ Import Namespace="System.Web.SessionState" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="System.Diagnostics" %>
<%@ Import Namespace="System.Web.Security" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>

<script runat="server">
    void Application_Start(object sender, EventArgs e) 
    {
        // Uygulama başladığında çalışacak kod
        Debug.WriteLine("Uygulama başlatıldı: " + DateTime.Now);
        
        // Global kullanıcı bilgi depolama mekanizması
        Application["UserProfiles"] = new System.Collections.Concurrent.ConcurrentDictionary<string, Dictionary<string, string>>();
    }
    
    void Application_End(object sender, EventArgs e) 
    {
        // Uygulama sonlandığında çalışacak kod
        Debug.WriteLine("Uygulama sonlandı: " + DateTime.Now);
    }
        
    void Application_Error(object sender, EventArgs e) 
    { 
        // İşlenmemiş hatalar oluştuğunda çalışacak kod
        Exception ex = Server.GetLastError();
        if (ex != null)
        {
            Debug.WriteLine("Uygulama Hatası: " + ex.Message);
            Debug.WriteLine("Hata Kaynağı: " + ex.Source);
            Debug.WriteLine("Stack Trace: " + ex.StackTrace);
        }
    }

    void Session_Start(object sender, EventArgs e) 
    {
        // Yeni session başladığında çalışacak kod
        Session.Timeout = 180; // 180 dakika (3 saat)
        Session["LastActivity"] = DateTime.Now;
        Debug.WriteLine("Yeni oturum başlatıldı: " + Session.SessionID);
    }

    void Session_End(object sender, EventArgs e) 
    {
        // Session sonlandığında çalışacak kod
        Debug.WriteLine("Oturum sonlandırıldı: " + Session.SessionID);
        
        // Otomatik oturum yenileme için bir talimat yaz
        if (Session["KullaniciID"] != null)
        {
            Debug.WriteLine("Kullanıcı ID: " + Session["KullaniciID"] + " oturumu sonlandı, bir sonraki istekte otomatik yenilenecek");
        }
    }
    
    protected void Application_BeginRequest(object sender, EventArgs e)
    {
        // Timeout mesajlarını önle
        Response.AddHeader("X-Prevent-Timeout", "true");
        
        // Her istek başlangıcında
        HttpCookie userCookie = Request.Cookies["UserInfo"];
        if (userCookie != null && !string.IsNullOrEmpty(userCookie["UserID"]))
        {
            if (Session["KullaniciID"] == null)
            {
                // Cookie bilgilerini Session'a aktar
                Session["KullaniciID"] = userCookie["UserID"];
                
                if (userCookie["Username"] != null)
                    Session["KullaniciAdi"] = userCookie["Username"];
                
                if (userCookie["Email"] != null)
                    Session["Email"] = userCookie["Email"];
                
                // FullName bilgisinin doğru bir şekilde aktarılması
                if (userCookie["FullName"] != null && !string.IsNullOrEmpty(userCookie["FullName"]))
                {
                    Session["UserFullName"] = userCookie["FullName"];
                    Session["KullaniciAdSoyad"] = userCookie["FullName"];
                    Debug.WriteLine("FullName Session'a aktarıldı: " + userCookie["FullName"]);
                }
                // Eğer FullName yoksa ama FirstName ve LastName varsa, bunlardan FullName oluştur
                else if (userCookie["FirstName"] != null && userCookie["LastName"] != null)
                {
                    string firstName = userCookie["FirstName"];
                    string lastName = userCookie["LastName"];
                    string fullName = (firstName + " " + lastName).Trim();
                    
                    Session["FirstName"] = firstName;
                    Session["LastName"] = lastName;
                    Session["UserFullName"] = fullName;
                    Session["KullaniciAdSoyad"] = fullName;
                    Session["FullName"] = fullName;
                    
                    Debug.WriteLine("FullName oluşturulup Session'a aktarıldı: " + fullName);
                }
                else if (userCookie["FirstName"] != null)
                {
                    Session["FirstName"] = userCookie["FirstName"];
                    Session["UserFullName"] = userCookie["FirstName"];
                    Session["KullaniciAdSoyad"] = userCookie["FirstName"];
                    Session["FullName"] = userCookie["FirstName"];
                    
                    Debug.WriteLine("Sadece FirstName Session'a aktarıldı: " + userCookie["FirstName"]);
                }
                else if (userCookie["LastName"] != null)
                {
                    Session["LastName"] = userCookie["LastName"];
                    Session["UserFullName"] = userCookie["LastName"];
                    Session["KullaniciAdSoyad"] = userCookie["LastName"];
                    Session["FullName"] = userCookie["LastName"];
                }
                
                // Bio bilgisini Session'a aktarma
                if (userCookie["ShortBio"] != null)
                {
                    Session["Bio"] = userCookie["ShortBio"];
                    Debug.WriteLine("Bio bilgisi Session'a aktarıldı");
                }
                
                Debug.WriteLine("Cookie'den Session bilgileri yenilendi");
            }
            // Her seferinde FullName'in doğru olduğundan emin olalım (session var ama boş olabilir)
            else if (Session["UserFullName"] == null || string.IsNullOrEmpty(Session["UserFullName"].ToString()))
            {
                // FullName bilgisinin yeniden kontrolü
                if (userCookie["FullName"] != null && !string.IsNullOrEmpty(userCookie["FullName"]))
                {
                    Session["UserFullName"] = userCookie["FullName"];
                    Session["KullaniciAdSoyad"] = userCookie["FullName"];
                    Session["FullName"] = userCookie["FullName"];
                    Debug.WriteLine("FullName Session'a yeniden aktarıldı: " + userCookie["FullName"]);
                }
                // Eğer FullName yoksa ama FirstName ve LastName varsa, bunlardan FullName oluştur
                else if (userCookie["FirstName"] != null && userCookie["LastName"] != null)
                {
                    string firstName = userCookie["FirstName"];
                    string lastName = userCookie["LastName"];
                    string fullName = (firstName + " " + lastName).Trim();
                    
                    Session["FirstName"] = firstName;
                    Session["LastName"] = lastName;
                    Session["UserFullName"] = fullName;
                    Session["KullaniciAdSoyad"] = fullName;
                    Session["FullName"] = fullName;
                    
                    Debug.WriteLine("FullName yeniden oluşturulup Session'a aktarıldı: " + fullName);
                }
            }
            
            // Cookie süresini uzat
            userCookie.Expires = DateTime.Now.AddDays(1);
            Response.Cookies.Add(userCookie);
        }
        
        // Session aktivite kontrolü ve güncellemesi
        if (Session["LastActivity"] != null)
        {
            // Son aktiviteyi güncelle
            Session["LastActivity"] = DateTime.Now;
            
            // Session'ı her istekte yenile
            Session.Timeout = 180; // 180 dakika (3 saat)
        }
        
        // Oturum ping isteklerini yönet
        if (Request.QueryString["ping"] == "true")
        {
            // Sadece session'ı canlı tutmak için yapılan istek
            Debug.WriteLine("Session ping alındı, session yenileniyor");
            Session["LastActivity"] = DateTime.Now;
            Session.Timeout = 180; // 180 dakika (3 saat)
        }
    }

    void Application_EndRequest(object sender, EventArgs e)
    {
        // Her sayfa isteği tamamlandığında çalışacak kod
    }
</script> 