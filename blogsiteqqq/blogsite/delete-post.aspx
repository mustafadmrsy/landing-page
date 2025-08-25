<%@ Page Language="C#" AutoEventWireup="true" CodeFile="delete-post.aspx.cs" Inherits="DeletePost" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Post Siliniyor...</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <!-- Bu sayfa sadece post silme işlemini gerçekleştirir, kullanıcı arayüzü içermez -->
            <asp:Literal ID="ltlMessage" runat="server"></asp:Literal>
        </div>
    </form>
</body>
</html> 