using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Text.RegularExpressions;

public partial class CreateBlog : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;
    private int userID = 0;

    // Bu özellikler page instance yaşam döngüsü boyunca veri saklamak için
    protected string ContentValue
    {
        get { return ViewState["ContentValue"] as string ?? string.Empty; }
        set { ViewState["ContentValue"] = value; }
    }
    
    protected string PostMode
    {
        get { return ViewState["PostMode"] as string ?? string.Empty; }
        set { ViewState["PostMode"] = value; }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            // Debug bilgisi
            System.Diagnostics.Debug.WriteLine("Page_Load metodu çalıştı");
            
            // Kullanıcı girişi yapılmış mı kontrol et
            if (Session["KullaniciID"] == null)
            {
                // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
                Response.Redirect("login.aspx?returnUrl=" + Server.UrlEncode(Request.RawUrl));
                return;
            }

            // Kullanıcı ID'sini al
            userID = Convert.ToInt32(Session["KullaniciID"]);
            
            // Form verilerini kontrol et
            if (IsPostBack)
            {
                // hdnPostMode değerini al (JavaScript'ten)
                string postMode = Request.Form["hdnPostMode"];
                if (!string.IsNullOrEmpty(postMode))
                {
                    System.Diagnostics.Debug.WriteLine("Post modu: " + postMode);
                    PostMode = postMode;
                }
                
                // İçeriği doğrulanmadan form verilerinden al
                try
                {
                    // Unvalidated form içeriğine erişim 
                    string formContent = Request.Unvalidated.Form[txtContent.UniqueID];
                    if (!string.IsNullOrEmpty(formContent))
                    {
                        txtContent.Value = formContent;
                        ContentValue = formContent;
                        System.Diagnostics.Debug.WriteLine("İçerik formdan alındı: " + (formContent.Length > 50 ? formContent.Substring(0, 50) + "..." : formContent));
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("İçerik formdan alınırken hata: " + ex.Message);
                }
            }
            
            if (!IsPostBack)
            {
                // Kategorileri yükle
                LoadCategories();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("HATA: Page_Load'da genel istisna - " + ex.Message);
        }
    }

    private void LoadCategories()
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string query = "SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName";
                SqlCommand command = new SqlCommand(query, connection);

                connection.Open();
                SqlDataReader reader = command.ExecuteReader();

                ddlCategory.Items.Clear();
                ddlCategory.Items.Add(new ListItem("Kategori Seçin", ""));

                while (reader.Read())
                {
                    string categoryId = reader["CategoryID"].ToString();
                    string categoryName = reader["CategoryName"].ToString();
                    ddlCategory.Items.Add(new ListItem(categoryName, categoryId));
                }

                reader.Close();
            }
        }
        catch (Exception ex)
        {
            ShowErrorMessage("× Kategoriler yüklenirken bir hata oluştu: " + ex.Message);
        }
    }

    // Server tarafında içerik doğrulaması
    protected void cvContent_ServerValidate(object source, ServerValidateEventArgs args)
    {
        args.IsValid = !string.IsNullOrWhiteSpace(txtContent.Value);
    }

    protected void btnPublish_Click(object sender, EventArgs e)
    {
        System.Diagnostics.Debug.WriteLine("btnPublish_Click çalıştı");
        
        try
        {
            // İçeriği kontrol et
            string content = ContentValue;
            if (string.IsNullOrEmpty(content))
            {
                content = txtContent.Value; // HiddenField'dan kontrol et
            }
            
            // Form gönderiminde kullanılan Unvalidated içeriğe eriş
            if (string.IsNullOrEmpty(content) && Request.Unvalidated.Form[txtContent.UniqueID] != null)
            {
                content = Request.Unvalidated.Form[txtContent.UniqueID];
            }
            
            System.Diagnostics.Debug.WriteLine("İçerik uzunluğu: " + (content != null ? content.Length : 0));
            
            // Content kontrolü
            if (string.IsNullOrWhiteSpace(content))
            {
                ShowErrorMessage("× İçerik alanı boş olamaz!");
                return;
            }
            
            SavePost(0); // 0 = Onay bekliyor durumu (Ana sayfada gösterilmez)
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Publish hatası: " + ex.Message + " - " + ex.StackTrace);
            ShowErrorMessage("× Yayınlama sırasında bir hata oluştu: " + ex.Message);
        }
    }

    protected void btnSaveDraft_Click(object sender, EventArgs e)
    {
        System.Diagnostics.Debug.WriteLine("btnSaveDraft_Click çalıştı");
        
        try
        {
            // İçeriği kontrol et - taslak için içerik zorunlu değil
            string content = ContentValue;
            if (string.IsNullOrEmpty(content))
            {
                content = txtContent.Value; // HiddenField'dan kontrol et
            }
            
            // Form gönderiminde kullanılan Unvalidated içeriğe eriş
            if (string.IsNullOrEmpty(content) && Request.Unvalidated.Form[txtContent.UniqueID] != null)
            {
                content = Request.Unvalidated.Form[txtContent.UniqueID];
            }
            
            System.Diagnostics.Debug.WriteLine("Taslak içerik uzunluğu: " + (content != null ? content.Length : 0));
            
            // Taslak olarak kaydet
            SavePost(2); // 2 = Taslak durumu
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Draft kaydetme hatası: " + ex.Message + " - " + ex.StackTrace);
            ShowErrorMessage("× Taslak kaydetme sırasında bir hata oluştu: " + ex.Message);
        }
    }

    private void SavePost(int status)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("SavePost metodu çağrıldı. Status: " + status);
            
            // Başlık kontrolü
            if (string.IsNullOrWhiteSpace(txtTitle.Text))
            {
                ShowErrorMessage("× Lütfen bir başlık girin.");
                return;
            }

            // Kategori kontrolü
            if (string.IsNullOrEmpty(ddlCategory.SelectedValue))
            {
                ShowErrorMessage("× Lütfen bir kategori seçin.");
                return;
            }

            // İçeriği doğrudan doğrulanmamış form verilerinden al
            string content = "";
            
            try
            {
                // Unvalidated form içeriğine erişim 
                content = Request.Unvalidated.Form[txtContent.UniqueID];
                System.Diagnostics.Debug.WriteLine("Form içeriği alındı: " + (content != null ? "Evet, uzunluk: " + content.Length : "Hayır"));
                
                if (content == null)
                {
                    // Eğer HiddenField'ın ID'si farklıysa, direkt değer kullan
                    content = txtContent.Value;
                    System.Diagnostics.Debug.WriteLine("HiddenField içeriği alındı: " + (content != null ? "Evet, uzunluk: " + content.Length : "Hayır"));
                }
                
                // İçerik kontrolü
                if (string.IsNullOrWhiteSpace(content) && status == 1)
                {
                    ShowErrorMessage("× İçerik alanı boş olamaz.");
                    return;
                }
                
                System.Diagnostics.Debug.WriteLine("İçerik başarıyla alındı, uzunluk: " + (content != null ? content.Length : 0));
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("İçerik alma hatası: " + ex.Message);
                
                if (status == 1) // Yayın için içerik gerekli
                {
                    ShowErrorMessage("× İçerik alınamadı. Lütfen tekrar deneyiniz.");
                    return;
                }
                
                content = ""; // Taslak için boş içerik kabul edilebilir
            }

            // UserID kontrol et
            if (userID <= 0)
            {
                if (Session["KullaniciID"] != null)
                {
                    userID = Convert.ToInt32(Session["KullaniciID"]);
                    System.Diagnostics.Debug.WriteLine("UserID session'dan alındı: " + userID);
                }
                else
                {
                    ShowErrorMessage("× Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
                    Response.Redirect("login.aspx");
                    return;
                }
            }

            // Resim yolunu bul
            string photoPath = null;
            
            // İçerikteki resmi bul ve içerikten kaldır
            if (!string.IsNullOrEmpty(content))
            {
                try 
                {
                    // İçerikteki data-imgpath özelliğine sahip tüm img etiketlerini bul
                    System.Diagnostics.Debug.WriteLine("İçerik uzunluğu: " + content.Length);
                    System.Diagnostics.Debug.WriteLine("İçerik içinde img etiketlerini arıyorum...");
                    
                    // Tüm resim etiketlerini bul (herhangi bir özellik olmadan)
                    System.Text.RegularExpressions.MatchCollection allImgMatches = 
                        System.Text.RegularExpressions.Regex.Matches(content, @"<img[^>]*src=[""'](?<src>[^""']*)[""'][^>]*>");
                    
                    System.Diagnostics.Debug.WriteLine("Toplam resim sayısı: " + allImgMatches.Count);
                    foreach (System.Text.RegularExpressions.Match match in allImgMatches)
                    {
                        System.Diagnostics.Debug.WriteLine("Bulunan resim src: " + match.Groups["src"].Value);
                    }
                    
                    // data-imgpath özelliğine sahip olanları bul
                    System.Text.RegularExpressions.MatchCollection imgMatches = 
                        System.Text.RegularExpressions.Regex.Matches(content, @"<img[^>]*data-imgpath=[""'](?<path>[^""']*)[""'][^>]*>");
                    
                    System.Diagnostics.Debug.WriteLine("data-imgpath'e sahip resim sayısı: " + imgMatches.Count);
                    
                    // İlk resmi kapak resmi olarak kullan
                    if (imgMatches.Count > 0)
                    {
                        string imgPath = imgMatches[0].Groups["path"].Value;
                        System.Diagnostics.Debug.WriteLine("İlk resmin data-imgpath değeri: " + imgPath);
                        
                        if (!string.IsNullOrEmpty(imgPath))
                        {
                            photoPath = imgPath;
                            System.Diagnostics.Debug.WriteLine("Kapak resmi olarak kullanılacak: " + photoPath);
                        }
                    }
                    // data-imgpath bulunamadıysa normal src değerine bak
                    else if (allImgMatches.Count > 0)
                    {
                        string imgSrc = allImgMatches[0].Groups["src"].Value;
                        if (!string.IsNullOrEmpty(imgSrc) && imgSrc.Contains("/assets/uploads/posts/"))
                        {
                            photoPath = imgSrc;
                            System.Diagnostics.Debug.WriteLine("src değeri kapak resmi olarak kullanılacak: " + photoPath);
                        }
                    }
                    
                    // Alternatif: Form içindeki gizli alandan al
                    if (string.IsNullOrEmpty(photoPath))
                    {
                        string hdnPath = Request.Form["hdnUploadedImageUrl"];
                        if (!string.IsNullOrEmpty(hdnPath))
                        {
                            photoPath = hdnPath;
                            System.Diagnostics.Debug.WriteLine("Gizli alandan resim yolu alındı: " + photoPath);
                        }
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Resim yolu ayıklama hatası: " + ex.Message);
                    System.Diagnostics.Debug.WriteLine("Hata Stack Trace: " + ex.StackTrace);
                }
            }

            // Veritabanına kaydet
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı açılıyor...");
                    connection.Open();
                    System.Diagnostics.Debug.WriteLine("Veritabanı bağlantısı başarıyla açıldı");
                    
                    // İçeriği al
                    string contentToSave = ContentValue;
                    if (string.IsNullOrEmpty(contentToSave))
                    {
                        contentToSave = txtContent.Value;
                    }
                    
                    // İçerik hala boşsa, doğrudan formdan oku
                    if (string.IsNullOrEmpty(contentToSave))
                    {
                        contentToSave = Request.Unvalidated.Form[txtContent.UniqueID];
                    }
                    
                    // PhotoPath değerini de ekleyerek yazı ekleme sorgusu
                    string query = @"INSERT INTO Posts (Title, Content, UserID, CategoryID, CreatedAt, UpdatedAt, ApprovalStatus, PhotoPath) 
                                   VALUES (@Title, @Content, @UserID, @CategoryID, @CreatedAt, @UpdatedAt, @Status, @PhotoPath); 
                                   SELECT SCOPE_IDENTITY();";
                                   
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Title", txtTitle.Text.Trim());
                        command.Parameters.AddWithValue("@Content", contentToSave);
                        command.Parameters.AddWithValue("@UserID", userID);
                        command.Parameters.AddWithValue("@CategoryID", Convert.ToInt32(ddlCategory.SelectedValue));
                        command.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                        command.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
                        command.Parameters.AddWithValue("@Status", status); // Parametre olarak gelen durum değeri
                        
                        // PhotoPath parametresi
                        if (string.IsNullOrEmpty(photoPath))
                        {
                            System.Diagnostics.Debug.WriteLine("PhotoPath NULL olarak kaydedilecek");
                            command.Parameters.AddWithValue("@PhotoPath", DBNull.Value);
                        }
                        else
                        {
                            // Yol düzeltmesi (göreceli yolları tam URL'e çevirme)
                            if (photoPath.StartsWith("~/"))
                            {
                                photoPath = photoPath.Replace("~/", "/");
                            }
                            
                            // Yol başında / karakteri yoksa ekle
                            if (!photoPath.StartsWith("/"))
                            {
                                photoPath = "/" + photoPath;
                            }
                            
                            System.Diagnostics.Debug.WriteLine("PhotoPath değeri olarak kaydedilecek: " + photoPath);
                            command.Parameters.AddWithValue("@PhotoPath", photoPath);
                        }
                        
                        // Komutu çalıştır ve eklenen yazının ID'sini al
                        object result = command.ExecuteScalar();
                        System.Diagnostics.Debug.WriteLine("SQL Sorgu sonucu: " + (result != null ? result.ToString() : "null"));
                        
                        int postID = 0;
                        if (result != null && result != DBNull.Value)
                        {
                            postID = Convert.ToInt32(result);
                            System.Diagnostics.Debug.WriteLine("Yazı kaydedildi. PostID: " + postID);
                            
                            // İşlem başarılı mesajı göster
                            if (status == 2)
                            {
                                ShowSuccessMessage("✓ Yazınız taslak olarak kaydedildi.");
                            }
                            else if (status == 0)
                            {
                                ShowSuccessMessage("✓ Yazınız başarıyla gönderildi ve admin onayı için bekliyor.");
                            }
                            else if (status == 1)
                            {
                                ShowSuccessMessage("✓ Yazınız başarıyla onaylandı ve yayınlandı.");
                            }

                            // Formu temizle
                            ClearForm();

                            // Kullanıcı profil sayfasına yönlendir (2 saniye sonra)
                            string script = @"
                                setTimeout(function() {
                                    window.location.href = 'userpage.aspx?userid=" + userID + @"';
                                }, 2000);";
                            ScriptManager.RegisterStartupScript(this, GetType(), "redirectScript", script, true);
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine("Hata: Yazı kaydedilemedi veya ID alınamadı.");
                            ShowErrorMessage("× Yazı kaydedilemedi. Lütfen tekrar deneyiniz.");
                        }
                    }
                }
                catch (SqlException sqlEx)
                {
                    System.Diagnostics.Debug.WriteLine("SQL hatası: " + sqlEx.Message);
                    System.Diagnostics.Debug.WriteLine("SQL Hata Detayı: " + sqlEx.StackTrace);
                    
                    // SQL hata kodunu kontrol et
                    if (sqlEx.Number == 2627 || sqlEx.Number == 2601) // Primary key veya unique constraint ihlali
                    {
                        ShowErrorMessage("× Bu yazı zaten mevcut.");
                    }
                    else if (sqlEx.Number == 547) // Foreign key constraint ihlali
                    {
                        ShowErrorMessage("× Geçersiz kategori ID'si veya kullanıcı ID'si.");
                    }
                    else if (sqlEx.Number == 8152) // String veya binary veri uzunluğu sınırlaması
                    {
                        ShowErrorMessage("× İçerik çok uzun. Lütfen daha kısa bir içerik girmeyi deneyin.");
                    }
                    else
                    {
                        ShowErrorMessage("× Veritabanı hatası: " + sqlEx.Message);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Veritabanı işlemi sırasında genel hata: " + ex.Message);
                    System.Diagnostics.Debug.WriteLine("Hata Stack Trace: " + ex.StackTrace);
                    ShowErrorMessage("× Beklenmeyen bir hata oluştu: " + ex.Message);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Genel hata: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Hata Stack Trace: " + ex.StackTrace);
            ShowErrorMessage("× Yazı kaydedilirken bir hata oluştu: " + ex.Message);
        }
    }

    private string UploadImage()
    {
        try
        {
            // Dosya seçilmiş mi kontrol et
            if (fileUpload.HasFile)
            {
                string fileName = Path.GetFileName(fileUpload.FileName);
                string fileExtension = Path.GetExtension(fileName).ToLower();

                // İzin verilen dosya uzantıları
                string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

                if (!allowedExtensions.Contains(fileExtension))
                {
                    ShowErrorMessage("× Sadece .jpg, .jpeg, .png ve .gif uzantılı dosyalar yüklenebilir.");
                    return null;
                }

                // Dosya boyutu kontrolü (5MB)
                if (fileUpload.PostedFile.ContentLength > 5 * 1024 * 1024)
                {
                    ShowErrorMessage("× Dosya boyutu 5MB'dan büyük olamaz.");
                    return null;
                }

                // Benzersiz dosya adı oluştur
                string uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
                
                // Yükleme klasörü yoksa oluştur
                string uploadFolderPath = Server.MapPath("~/assets/uploads/posts/");
                if (!Directory.Exists(uploadFolderPath))
                {
                    Directory.CreateDirectory(uploadFolderPath);
                    System.Diagnostics.Debug.WriteLine("Klasör oluşturuldu: " + uploadFolderPath);
                }

                // Dosyayı kaydet
                string filePath = Path.Combine(uploadFolderPath, uniqueFileName);
                fileUpload.SaveAs(filePath);
                System.Diagnostics.Debug.WriteLine("Dosya kaydedildi: " + filePath);

                // Veritabanı için göreceli yolu döndür
                return "/assets/uploads/posts/" + uniqueFileName;
            }
            
            // Dosya seçilmemiş
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Resim yükleme hatası: " + ex.Message + " - " + ex.StackTrace);
            ShowErrorMessage("× Görsel yüklenirken bir hata oluştu: " + ex.Message);
            return null;
        }
    }

    private void ShowSuccessMessage(string message)
    {
        // Hem panel gösterimi hem de JavaScript alert gösterimi
        pnlSuccess.Visible = true;
        pnlSuccess.Controls.Clear();
        pnlSuccess.Controls.Add(new LiteralControl("<i class='fas fa-check-circle'></i> " + message));

        // Popup mesajı göster
        string script = @"
            // Panel gösterimi
            document.querySelector('.success-message').style.display = 'block';
            
            // SweetAlert veya temel alert gösterimi
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Başarılı!',
                    text: '" + message.Replace("'", "\\'") + @"',
                    icon: 'success',
                    confirmButtonText: 'Tamam'
                });
            } else {
                alert('" + message.Replace("'", "\\'") + @"');
            }
        ";
        ScriptManager.RegisterStartupScript(this, GetType(), "showSuccessMessage", script, true);
    }

    private void ShowErrorMessage(string message)
    {
        // Popup mesajı göster
        string script = @"
            // SweetAlert veya temel alert gösterimi
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Hata!',
                    text: '" + message.Replace("'", "\\'") + @"',
                    icon: 'error',
                    confirmButtonText: 'Tamam'
                });
            } else {
                alert('" + message.Replace("'", "\\'") + @"');
            }
        ";
        ScriptManager.RegisterStartupScript(this, GetType(), "showErrorMessage", script, true);
    }

    private void ClearForm()
    {
        txtTitle.Text = "";
        txtContent.Value = ""; // HiddenField için Value kullanıyoruz
        ddlCategory.SelectedIndex = 0;
        txtTags.Text = "";

        // Editor içeriğini temizle
        ScriptManager.RegisterStartupScript(this, GetType(), "clearEditor", "document.getElementById('editor').innerHTML = '';", true);
    }
} 