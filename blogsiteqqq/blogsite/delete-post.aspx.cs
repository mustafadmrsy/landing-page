using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

public partial class DeletePost : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        // Kullanıcının giriş yapmış olup olmadığını kontrol et
        if (Session["KullaniciID"] == null)
        {
            ShowError("Bu işlemi gerçekleştirmek için giriş yapmalısınız.");
            return;
        }

        int currentUserId = Convert.ToInt32(Session["KullaniciID"]);

        // PostID parametresini kontrol et
        if (string.IsNullOrEmpty(Request.QueryString["id"]))
        {
            ShowError("Geçersiz post ID'si.");
            return;
        }

        // PostID'yi integer'a çevirmeyi dene
        if (!int.TryParse(Request.QueryString["id"], out int postId))
        {
            ShowError("Geçersiz post ID formatı.");
            return;
        }

        // Post'un mevcut olup olmadığını ve kullanıcının kendi postu olup olmadığını kontrol et
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Post'un sahipliğini kontrol et
                string checkOwnershipQuery = @"
                    SELECT COUNT(*) 
                    FROM Posts 
                    WHERE PostID = @PostID AND UserID = @UserID";

                using (SqlCommand checkCommand = new SqlCommand(checkOwnershipQuery, connection))
                {
                    checkCommand.Parameters.AddWithValue("@PostID", postId);
                    checkCommand.Parameters.AddWithValue("@UserID", currentUserId);

                    int matchCount = (int)checkCommand.ExecuteScalar();

                    if (matchCount == 0)
                    {
                        // Kullanıcı bu postun sahibi değil veya post mevcut değil
                        ShowError("Bu postu silme yetkiniz yok veya post mevcut değil.");
                        return;
                    }
                }

                // Postu silme işlemi
                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Önce yorumları sil
                        string deleteCommentsQuery = "DELETE FROM Comments WHERE PostID = @PostID";
                        using (SqlCommand deleteCommentsCommand = new SqlCommand(deleteCommentsQuery, connection, transaction))
                        {
                            deleteCommentsCommand.Parameters.AddWithValue("@PostID", postId);
                            deleteCommentsCommand.ExecuteNonQuery();
                        }

                        // Sonra beğenileri sil
                        string deleteLikesQuery = "DELETE FROM Likes WHERE PostID = @PostID";
                        using (SqlCommand deleteLikesCommand = new SqlCommand(deleteLikesQuery, connection, transaction))
                        {
                            deleteLikesCommand.Parameters.AddWithValue("@PostID", postId);
                            deleteLikesCommand.ExecuteNonQuery();
                        }

                        // Son olarak postu sil
                        string deletePostQuery = "DELETE FROM Posts WHERE PostID = @PostID AND UserID = @UserID";
                        using (SqlCommand deletePostCommand = new SqlCommand(deletePostQuery, connection, transaction))
                        {
                            deletePostCommand.Parameters.AddWithValue("@PostID", postId);
                            deletePostCommand.Parameters.AddWithValue("@UserID", currentUserId);
                            int rowsAffected = deletePostCommand.ExecuteNonQuery();

                            if (rowsAffected == 0)
                            {
                                // Post silinirken bir hata oluştu
                                transaction.Rollback();
                                ShowError("Post silinirken bir hata oluştu.");
                                return;
                            }
                        }

                        // Tüm işlemler başarılı olduysa, transaction'ı commit et
                        transaction.Commit();

                        // Başarılı mesajı göster ve kullanıcıyı yönlendir
                        ltlMessage.Text = "<div style='text-align:center; margin-top: 20px;'>" +
                                         "<p style='color:green; font-size: 16px;'>Post başarıyla silindi.</p>" +
                                         "<p>Anasayfaya yönlendiriliyorsunuz...</p>" +
                                         "</div>";

                        // 2 saniye sonra kullanıcıyı userpage.aspx'e yönlendir
                        string script = @"
                            setTimeout(function() {
                                window.location.href = 'userpage.aspx?id=" + currentUserId + @"';
                            }, 2000);";
                        ClientScript.RegisterStartupScript(this.GetType(), "RedirectScript", script, true);
                    }
                    catch (Exception ex)
                    {
                        // Hata durumunda transaction'ı geri al
                        transaction.Rollback();
                        LogError("Post silme işlemi sırasında hata: " + ex.Message);
                        ShowError("Post silinirken bir hata oluştu: " + ex.Message);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            LogError("Veritabanı bağlantısı sırasında hata: " + ex.Message);
            ShowError("Veritabanı bağlantısı sırasında bir hata oluştu: " + ex.Message);
        }
    }

    private void ShowError(string message)
    {
        ltlMessage.Text = "<div style='text-align:center; margin-top: 20px;'>" +
                         "<p style='color:red; font-size: 16px;'>" + message + "</p>" +
                         "<p>Anasayfaya yönlendiriliyorsunuz...</p>" +
                         "</div>";

        // 3 saniye sonra kullanıcıyı anasayfaya yönlendir
        string script = @"
            setTimeout(function() {
                window.location.href = 'default.aspx';
            }, 3000);";
        ClientScript.RegisterStartupScript(this.GetType(), "RedirectScript", script, true);
    }

    private void LogError(string message)
    {
        // Basit hata günlüğü - gerçek uygulamada daha kapsamlı olabilir
        System.Diagnostics.Debug.WriteLine(message);
    }
} 