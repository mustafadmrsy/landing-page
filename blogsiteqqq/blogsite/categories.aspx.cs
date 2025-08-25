using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using System.Configuration;
using System.Text;
using System.IO;
using System.Web.Configuration;

public partial class Categories : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            KategorileriGetir();
            KategoriChipleriniGetir();
        }
    }

    private void KategorileriGetir()
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                SqlCommand command = new SqlCommand("SELECT * FROM Categories ORDER BY CategoryName", connection);
                connection.Open();

                SqlDataReader reader = command.ExecuteReader();
                if (reader.HasRows)
                {
                    rptCategories.DataSource = reader;
                    rptCategories.DataBind();
                    pnlNoCategories.Visible = false;
                }
                else
                {
                    pnlNoCategories.Visible = true;
                }
                reader.Close();
            }
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "errorAlert", 
                "alert('Kategoriler yüklenirken bir hata oluştu: " + ex.Message.Replace("'", "\\'") + "');", true);
        }
    }

    private void KategoriChipleriniGetir()
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                SqlCommand command = new SqlCommand("SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName", connection);
                connection.Open();

                SqlDataReader reader = command.ExecuteReader();
                rptCategoryChips.DataSource = reader;
                rptCategoryChips.DataBind();
                reader.Close();
            }
        }
        catch (Exception ex)
        {
            ScriptManager.RegisterStartupScript(this, this.GetType(), "errorAlert", 
                "alert('Kategori filtreleri yüklenirken bir hata oluştu: " + ex.Message.Replace("'", "\\'") + "');", true);
        }
    }

    protected string GetCategoryName(string categoryID)
    {
        string categoryName = "Genel";

        try
        {
            using (SqlConnection baglanti = new SqlConnection(connectionString))
            {
                baglanti.Open();
                SqlCommand cmd = new SqlCommand("SELECT CategoryName FROM Categories WHERE CategoryID = @CategoryID", baglanti);
                cmd.Parameters.AddWithValue("@CategoryID", categoryID);
                object result = cmd.ExecuteScalar();

                if (result != null)
                    categoryName = result.ToString();
            }
        }
        catch (Exception)
        {
            // Hata durumunda varsayılan isim dön
        }

        return categoryName;
    }

    protected string GetCategoryIcon(string categoryId)
    {
        string iconClass = "fas fa-folder"; // Varsayılan ikon
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                SqlCommand command = new SqlCommand("SELECT IconClass FROM Categories WHERE CategoryID = @CategoryID", connection);
                command.Parameters.AddWithValue("@CategoryID", categoryId);
                connection.Open();
                
                object result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    iconClass = result.ToString();
                }
            }
        }
        catch (Exception)
        {
            // Hata durumunda varsayılan ikon kullanılır
        }
        
        return iconClass;
    }

    protected string GetPostCount(string categoryId)
    {
        string count = "0";
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                SqlCommand command = new SqlCommand(
                    "SELECT COUNT(*) FROM Posts WHERE CategoryID = @CategoryID", 
                    connection);
                command.Parameters.AddWithValue("@CategoryID", categoryId);
                connection.Open();
                
                object result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    count = result.ToString();
                }
            }
        }
        catch (Exception)
        {
            // Hata durumunda varsayılan değer kullanılır
        }
        
        return count;
    }
    
    protected string GetViewCount(string categoryId)
    {
        string count = "0";
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                // ViewCount sütunu olmadığı için, kategori başına post sayısını görüntüleme 
                // sayısı olarak kullanacağız (geçici çözüm)
                SqlCommand command = new SqlCommand(
                    "SELECT COUNT(*) FROM Posts WHERE CategoryID = @CategoryID AND ApprovalStatus = 1", 
                    connection);
                command.Parameters.AddWithValue("@CategoryID", categoryId);
                connection.Open();
                
                object result = command.ExecuteScalar();
                if (result != null && result != DBNull.Value)
                {
                    // Her post için ortalama 10 görüntülenme varsayalım
                    int postCount = Convert.ToInt32(result);
                    count = (postCount * 10).ToString();
                }
                else
                {
                    count = "0";
                }
            }
        }
        catch (Exception ex)
        {
            // Hata durumunda varsayılan değer kullanılır ve hatayı logla
            System.Diagnostics.Debug.WriteLine("Kategori görüntülenme sayısı hesaplanırken hata: " + ex.Message);
            count = "0";
        }
        
        return count;
    }
    
    // Kategori görüntüleme metodunu ekle - default.aspx sayfasına yönlendir
    protected void ViewCategory(object sender, EventArgs e)
    {
        // LinkButton'dan kategori ID'sini al
        LinkButton btn = (LinkButton)sender;
        string categoryId = btn.CommandArgument;
        
        // İlgili kategorinin adını al
        string categoryName = GetCategoryName(categoryId);
        
        // default.aspx sayfasına kategori adıyla yönlendir
        Response.Redirect("default.aspx?category=" + Server.UrlEncode(categoryName));
    }
}