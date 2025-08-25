public partial class Blog
{
    // Blog başlık ve meta bilgileri
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl blogTitle;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl blogAuthor;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl blogDate;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl blogCategory;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl blogViews;
    
    // Öne çıkan görsel
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl featuredImageContainer;
    protected global::System.Web.UI.HtmlControls.HtmlImage featuredImage;
    
    // Blog içeriği
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl blogContent;
    
    // Etiketler
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl tagsContainer;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl tagsList;
    
    // Yorumlar
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl commentsList;
    protected global::System.Web.UI.WebControls.Repeater rptComments;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl noCommentsMessage;
    
    // Yorum formu
    protected global::System.Web.UI.WebControls.Panel pnlCommentForm;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl nameFieldContainer;
    protected global::System.Web.UI.WebControls.TextBox txtCommentName;
    protected global::System.Web.UI.WebControls.RequiredFieldValidator rfvName;
    protected global::System.Web.UI.WebControls.TextBox txtCommentText;
    protected global::System.Web.UI.WebControls.RequiredFieldValidator rfvComment;
    protected global::System.Web.UI.WebControls.Button btnSubmitComment;
    
    // Giriş hatırlatıcı
    protected global::System.Web.UI.WebControls.Panel pnlLoginReminder;
    
    // Başarı mesajı
    protected global::System.Web.UI.WebControls.Panel pnlCommentSuccess;
    
    // Hata mesajları
    protected global::System.Web.UI.WebControls.Panel pnlError;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl errorText;
    
    // Debug bilgileri (visible=false, geliştirme sırasında gerektiğinde görünür yapılabilir)
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl debugInfo;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl debug_id;
    protected global::System.Web.UI.HtmlControls.HtmlGenericControl debug_path;
} 