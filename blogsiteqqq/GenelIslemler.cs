using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Net.Mail;
using System.Net;
using System.Configuration;
using System.IO;

namespace blogsiteqqq
{
    public class GenelIslemler
    {

        public static string MD5Olustur(string text)
        {
            MD5 md5 = new MD5CryptoServiceProvider();

            md5.ComputeHash(ASCIIEncoding.ASCII.GetBytes(text));

            byte[] result = md5.Hash;

            StringBuilder strBuilder = new StringBuilder();
            for (int i = 0; i < result.Length; i++)
            {
                strBuilder.Append(result[i].ToString("x2"));
            }

            return strBuilder.ToString();
        }
   
        
        
        
        
         public static string FotoResimIsimlendirme(string baslik)
        {

            //0 kucuk
            //1 buyuk
            //Bu metodumuzlada Türkçe karakterleri temizleyip url formatına uyarlıyoruz
            string Temp = baslik.ToLower();
            Temp = Temp.Replace("-", "");
            Temp = Temp.Replace("'", "");
            Temp = Temp.Replace(" ", "-");
            Temp = Temp.Replace("ç", "c"); Temp = Temp.Replace("ğ", "g");
            Temp = Temp.Replace("ı", "i"); Temp = Temp.Replace("ö", "o");
            Temp = Temp.Replace("ş", "s"); Temp = Temp.Replace("ü", "u");
            Temp = Temp.Replace("\"", ""); Temp = Temp.Replace("/", "");
            Temp = Temp.Replace("(", ""); Temp = Temp.Replace(")", "");
            Temp = Temp.Replace("(", ""); Temp = Temp.Replace("'", "");
            Temp = Temp.Replace("{", ""); Temp = Temp.Replace("}", "");
            Temp = Temp.Replace("%", ""); Temp = Temp.Replace("&", "");
            Temp = Temp.Replace("+", ""); Temp = Temp.Replace(",", "");
            Temp = Temp.Replace("?", ""); Temp = Temp.Replace(".", "");
            Temp = Temp.Replace("ı", "i"); Temp = Temp.Replace(":", "-");
            Temp = Temp.Replace("!", ""); Temp = Temp.Replace("'", "");
            DateTime tarih = DateTime.Now;
            Random rnd = new Random();
            //return "IspartaHaberleri/" + tarih.Year + "/" + tarih.Month + "/" + tarih.Day + "/" + MakaleID + "-" + Temp + ".aspx";//bize görünen adresi döndürür
            //return "IspartaHaberleri/" + MakaleID + "-" + Temp + ".aspx";//bize görünen adresi döndürür
            //return "IspartaWebRehberi/-" + MekanID + "-" + Temp + ".aspx";//bize görünen adresi döndürür
            string ifade = rnd.Next(0, 99).ToString();
            Temp = Temp + "-" + ifade;
            Temp = Temp.Replace("--", "-");
            return Temp;

        }
        
        
        
        // Rastgele doğrulama kodu oluşturma metodu
        public static string DogrulamaKoduOlustur(int uzunluk = 6)
        {
            const string karakterler = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            StringBuilder sb = new StringBuilder();
            Random random = new Random();
            
            for (int i = 0; i < uzunluk; i++)
            {
                int index = random.Next(karakterler.Length);
                sb.Append(karakterler[index]);
            }
            
            return sb.ToString();
        }
        
        // Mail gönderme metodu
        public static bool EmailGonder(string aliciMail, string konu, string icerik)
        {
            try
            {
                // Web.config'den SMTP ayarlarını al
                string mailHost = ConfigurationManager.AppSettings["MailHost"];
                int mailPort = Convert.ToInt32(ConfigurationManager.AppSettings["MailPort"]);
                string mailUser = ConfigurationManager.AppSettings["MailUser"];
                string mailPass = ConfigurationManager.AppSettings["MailPass"];
                bool mailSSL = Convert.ToBoolean(ConfigurationManager.AppSettings["MailSSL"]);
                string senderName = ConfigurationManager.AppSettings["SenderDisplayName"];
                
                // Mail gönderme işlemi
                MailMessage mail = new MailMessage();
                mail.From = new MailAddress(mailUser, senderName);
                mail.To.Add(aliciMail);
                mail.Subject = konu;
                mail.Body = icerik;
                mail.IsBodyHtml = true;
                
                SmtpClient smtp = new SmtpClient(mailHost, mailPort);
                smtp.EnableSsl = mailSSL;
                smtp.Credentials = new NetworkCredential(mailUser, mailPass);
                smtp.Send(mail);
                
                return true;
            }
            catch (Exception ex)
            {
                // Hata durumunda log tutulabilir
                System.Diagnostics.Debug.WriteLine("Mail Gönderme Hatası: " + ex.Message);
                return false;
            }
        }
        
        // Doğrulama mail içeriği oluşturma metodu
        public static string DogrulamaMailIcerigiOlustur(string kullaniciAdi, string dogrulamaKodu)
        {
            string icerik = @"
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px; }
                    .header { background-color: #4285f4; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { padding: 20px; }
                    .code { font-size: 24px; font-weight: bold; text-align: center; padding: 15px; margin: 20px 0; background-color: #f5f5f5; border-radius: 5px; letter-spacing: 5px; }
                    .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Senirkent Blog E-posta Doğrulama</h2>
                    </div>
                    <div class='content'>
                        <h3>Merhaba " + kullaniciAdi + @",</h3>
                        <p>Senirkent Blog hesabınızı doğrulamak için aşağıdaki kodu kullanınız.</p>
                        <p>Bu kod 30 dakika süreyle geçerlidir.</p>
                        <div class='code'>" + dogrulamaKodu + @"</div>
                        <p>Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
                        <p>Saygılarımızla,<br>Senirkent Blog Ekibi</p>
                    </div>
                    <div class='footer'>
                        <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen cevaplamayınız.</p>
                    </div>
                </div>
            </body>
            </html>";
            
            return icerik;
        }
    }
}