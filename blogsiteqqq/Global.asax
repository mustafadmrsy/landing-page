<%@ Application Language="C#" %>
<%@ Import Namespace="System.Web.Routing" %>

<script runat="server">
    void Application_Start(object sender, EventArgs e)
    {
        // Uygulama başlangıcında çalışacak kod
    }

    void Application_BeginRequest(object sender, EventArgs e)
    {
        // Kök dizine istek geldiğinde blogsite/default.aspx'e yönlendir
        if (Request.Url.AbsolutePath == "/" || string.IsNullOrEmpty(Request.Url.AbsolutePath) || Request.Url.AbsolutePath == "/blogsiteqqq/")
        {
            Response.Redirect("~/blogsite/default.aspx");
        }
    }
</script> 