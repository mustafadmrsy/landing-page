<%@ WebHandler Language="C#" Class="FileUploadHandler" %>

using System;
using System.Web;
using System.IO;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class FileUploadHandler : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        
        try
        {
            // İstek kontrol et
            if (context.Request.Files.Count > 0)
            {
                var file = context.Request.Files[0];
                
                // Dosya boyutu kontrolü (5MB)
                if (file.ContentLength > 5 * 1024 * 1024)
                {
                    SendErrorResponse(context, "Dosya boyutu 5MB'dan büyük olamaz.");
                    return;
                }
                
                // Dosya uzantısı kontrolü
                string fileExtension = Path.GetExtension(file.FileName).ToLower();
                string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
                
                if (Array.IndexOf(allowedExtensions, fileExtension) == -1)
                {
                    SendErrorResponse(context, "Sadece jpg, jpeg, png ve gif uzantılı dosyalar desteklenmektedir.");
                    return;
                }
                
                // Benzersiz dosya adı oluştur
                string uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
                
                // Klasör yolu
                string uploadDirectory = "~/assets/uploads/posts/";
                string physicalUploadPath = context.Server.MapPath(uploadDirectory);
                
                // Klasör yoksa oluştur
                if (!Directory.Exists(physicalUploadPath))
                {
                    Directory.CreateDirectory(physicalUploadPath);
                }
                
                // Dosya yolunu oluştur
                string filePath = Path.Combine(physicalUploadPath, uniqueFileName);
                
                // Dosyayı kaydet
                file.SaveAs(filePath);
                
                // Debug: Dosya yolları ve bilgileri logla
                System.Diagnostics.Debug.WriteLine("========= DOSYA YÜKLEME BİLGİLERİ =========");
                System.Diagnostics.Debug.WriteLine("Fiziksel Yol: " + filePath);
                System.Diagnostics.Debug.WriteLine("Sanal Yol: " + uploadDirectory);
                System.Diagnostics.Debug.WriteLine("Dosya Adı: " + uniqueFileName);
                System.Diagnostics.Debug.WriteLine("Dosya Boyutu: " + file.ContentLength + " bytes");
                System.Diagnostics.Debug.WriteLine("=======================================");
                
                // Başarılı cevap döndür
                string fileUrl = VirtualPathUtility.ToAbsolute(Path.Combine(uploadDirectory, uniqueFileName));
                System.Diagnostics.Debug.WriteLine("Dönüş URL: " + fileUrl);
                
                // URL formatlama - ~/ karakterlerini kaldır
                if (fileUrl.StartsWith("~/"))
                {
                    fileUrl = fileUrl.Substring(2); // ~/ karakterlerini kaldır
                }
                
                // URL başında / yoksa ekle
                if (!fileUrl.StartsWith("/"))
                {
                    fileUrl = "/" + fileUrl;
                }
                
                System.Diagnostics.Debug.WriteLine("Düzeltilmiş URL: " + fileUrl);
                
                var response = new
                {
                    success = true,
                    fileUrl = fileUrl,
                    fileName = uniqueFileName
                };
                
                var serializer = new JavaScriptSerializer();
                string jsonResponse = serializer.Serialize(response);
                
                // Yanıt başlıklarını ayarla
                context.Response.Clear();
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = 200;
                context.Response.Write(jsonResponse);
                context.Response.Flush();
                context.Response.End();
            }
            else
            {
                SendErrorResponse(context, "Dosya alınamadı.");
            }
        }
        catch (Exception ex)
        {
            SendErrorResponse(context, "Hata: " + ex.Message);
            
            // Hata logla
            System.Diagnostics.Debug.WriteLine("Resim yükleme hatası: " + ex.Message);
            System.Diagnostics.Debug.WriteLine("Stack Trace: " + ex.StackTrace);
        }
    }
    
    private void SendErrorResponse(HttpContext context, string errorMessage)
    {
        var response = new
        {
            success = false,
            error = errorMessage
        };
        
        var serializer = new JavaScriptSerializer();
        string jsonResponse = serializer.Serialize(response);
        
        context.Response.Clear();
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 400;
        context.Response.Write(jsonResponse);
        context.Response.Flush();
        context.Response.End();
    }
    
    public bool IsReusable
    {
        get { return false; }
    }
} 