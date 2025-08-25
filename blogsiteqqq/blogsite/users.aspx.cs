using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;

public partial class Users : System.Web.UI.Page
{
    private string connectionString = ConfigurationManager.ConnectionStrings["BlokDB"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            // Check if there's a search parameter in the URL
            string searchQuery = Request.QueryString["q"];
            if (!string.IsNullOrEmpty(searchQuery))
            {
                txtSearch.Text = searchQuery;
                SearchUsers(searchQuery);
            }
        }
    }

    protected void btnSearch_Click(object sender, EventArgs e)
    {
        string searchText = txtSearch.Text.Trim();
        if (!string.IsNullOrEmpty(searchText))
        {
            SearchUsers(searchText);
        }
    }

    private void SearchUsers(string searchText)
    {
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();

                string sql = @"SELECT UserID, Username, Email, FirstName, LastName, ProfilePicture, CreatedAt 
                              FROM Users 
                              WHERE Username LIKE @SearchText OR Email LIKE @SearchText OR 
                                    FirstName LIKE @SearchText OR LastName LIKE @SearchText";

                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@SearchText", "%" + searchText + "%");

                    SqlDataAdapter adapter = new SqlDataAdapter(command);
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    if (dt.Rows.Count > 0)
                    {
                        rptUsers.DataSource = dt;
                        rptUsers.DataBind();
                        pnlSearchResults.Visible = true;
                        pnlNoUsers.Visible = false;
                        ltlResultCount.Text = dt.Rows.Count + " kullanıcı bulundu";
                    }
                    else
                    {
                        pnlSearchResults.Visible = true;
                        pnlNoUsers.Visible = true;
                        ltlResultCount.Text = "0 kullanıcı bulundu";
                    }

                    ltlSearchQuery.Text = searchText;
                }
            }
        }
        catch (Exception ex)
        {
            // Log the error
            string errorMessage = "Kullanıcılar aranırken bir hata oluştu: " + ex.Message;
            Response.Write("<script>alert('" + errorMessage + "');</script>");
        }
    }

    protected bool HasProfilePicture(object profilePicture)
    {
        return profilePicture != null && !string.IsNullOrEmpty(profilePicture.ToString());
    }

    protected string GetProfilePicture(object profilePicture)
    {
        if (profilePicture != null && !string.IsNullOrEmpty(profilePicture.ToString()))
        {
            string picturePath = profilePicture.ToString();
            
            // Check if the path is already a relative URL
            if (picturePath.StartsWith("~/"))
            {
                return picturePath;
            }
            
            // Check if the file exists in the uploads folder
            string fullPath = Server.MapPath("~/uploads/" + picturePath);
            if (File.Exists(fullPath))
            {
                return "~/uploads/" + picturePath;
            }
            
            // Return default profile picture if file doesn't exist
            return "~/images/default-avatar.png";
        }
        
        return "~/images/default-avatar.png";
    }

    protected string GetFullName(object firstName, object lastName, object username)
    {
        string first = (firstName != null) ? firstName.ToString() : string.Empty;
        string last = (lastName != null) ? lastName.ToString() : string.Empty;
        
        if (!string.IsNullOrEmpty(first) || !string.IsNullOrEmpty(last))
        {
            return string.Format("{0} {1}", first, last).Trim();
        }
        else
        {
            return username.ToString();
        }
    }

    protected string GetFormattedDate(object date)
    {
        if (date != null && date != DBNull.Value)
        {
            DateTime createdDate = Convert.ToDateTime(date);
            return createdDate.ToString("dd MMM yyyy");
        }
        return "Bilinmiyor";
    }

    protected int GetPostCount(object userID)
    {
        if (userID == null || userID == DBNull.Value)
        {
            return 0;
        }

        int count = 0;
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string sql = "SELECT COUNT(*) FROM Posts WHERE UserID = @UserID";
                
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@UserID", Convert.ToInt32(userID));
                    count = (int)command.ExecuteScalar();
                }
            }
        }
        catch (Exception)
        {
            // Silently fail - just return 0 if there's an error
            count = 0;
        }
        
        return count;
    }
}