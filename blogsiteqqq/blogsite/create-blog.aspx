<%@ Page Title="Yazı Oluştur" Language="C#" MasterPageFile="~/blogsite/MasterPage.master" AutoEventWireup="true" CodeFile="create-blog.aspx.cs" Inherits="CreateBlog" ValidateRequest="false" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" Runat="Server">
    <!-- Zengin Metin Editörü yerine basit araç çubuğu -->
    
    <!-- Select2 için CDN -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
    
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <style>
        :root {
            --primary-color: #1a73e8;
            --primary-dark: #0d47a1;
            --primary-light: #4e92df;
            --dark-bg: #121212;
            --darker-bg: #0a0a0a;
            --dark-surface: #1e1e1e;
            --light-text: #ffffff;
            --text-secondary: #cccccc;
            --border-color: #303030;
            --error-color: #ff5252;
            --success-color: #4caf50;
            --border-radius: 8px;
            --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .create-blog-container {
            max-width: 1000px;
            margin: 40px auto;
            padding: 30px;
            background-color: var(--dark-surface);
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            color: var(--light-text);
        }
        
        .create-blog-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .create-blog-title {
            font-size: 2rem;
            margin-bottom: 10px;
            color: var(--primary-color);
        }
        
        .create-blog-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--border-color);
            background-color: rgba(255, 255, 255, 0.05);
            color: var(--light-text);
            border-radius: var(--border-radius);
            font-size: 1rem;
            transition: all 0.3s;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }
        
        .select2-container {
            width: 100% !important;
        }
        
        /* Özel Zengin Metin Düzenleyici */
        .editor-container {
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            overflow: hidden;
            background-color: #1a1a1a;
        }
        
        .editor-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            padding: 10px;
            background-color: #2a2a2a;
            border-bottom: 1px solid var(--border-color);
        }
        
        .editor-btn {
            background-color: #333;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        .editor-btn:hover {
            background-color: #444;
        }
        
        .editor-btn.active {
            background-color: var(--primary-color);
        }
        
        .editor-btn-group {
            display: flex;
            border-right: 1px solid #444;
            padding-right: 5px;
            margin-right: 5px;
        }
        
        .editor-content {
            min-height: 300px;
            padding: 15px;
            color: #fff;
            background-color: #1a1a1a;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            font-size: 16px;
            overflow-y: auto;
        }
        
        .editor-content:focus {
            outline: none;
        }
        
        /* Editor içindeki resimler için stiller */
        .editor-content img {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .editor-content img.expanded {
            width: 100%;
            object-fit: cover;
            max-height: 400px;
        }
        
        /* Sürükle-bırak etkisi için stil */
        .editor-content.drag-over {
            background-color: #2a2a2a;
            border: 2px dashed var(--primary-color);
        }
        
        /* Resim yükleme işlemi için stil */
        #img-loading {
            padding: 10px;
            background-color: rgba(26, 115, 232, 0.1);
            border-radius: 5px;
            margin: 10px 0;
            color: #fff;
            font-style: italic;
        }
        
        /* Resim yükleme bölümü */
        .image-upload {
            border: 2px dashed var(--border-color);
            padding: 20px;
            text-align: center;
            border-radius: var(--border-radius);
            margin-bottom: 20px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .image-upload:hover {
            border-color: var(--primary-color);
        }
        
        .image-upload-icon {
            font-size: 2rem;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .image-preview {
            max-width: 100%;
            max-height: 300px;
            margin-top: 15px;
            border-radius: var(--border-radius);
            display: none;
        }
        
        /* Butonlar */
        .form-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--primary-dark);
        }
        
        .btn-secondary {
            background-color: transparent;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
        }
        
        .btn-secondary:hover {
            background-color: rgba(26, 115, 232, 0.1);
        }
        
        /* Doğrulama Stil */
        .validation-error {
            color: var(--error-color);
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        /* Başarı mesajı */
        .success-message {
            background-color: rgba(76, 175, 80, 0.2);
            border: 1px solid var(--success-color);
            color: var(--success-color);
            padding: 15px;
            border-radius: var(--border-radius);
            margin-bottom: 20px;
            display: none;
        }
        
        /* SweetAlert Özelleştirmesi */
        .swal2-popup {
            background-color: var(--dark-surface);
            color: var(--light-text);
            border-radius: var(--border-radius);
        }
        
        .swal2-title, .swal2-content {
            color: var(--light-text);
        }
        
        .swal2-confirm {
            background-color: var(--primary-color) !important;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .create-blog-container {
                padding: 20px;
                margin: 20px 15px;
            }
            
            .form-actions {
                flex-direction: column;
                gap: 15px;
            }
            
            .btn {
                width: 100%;
            }
            
            .editor-toolbar {
                flex-wrap: wrap;
            }
        }
        
        /* Modern Resim Yükleme Bölümü Stilleri */
        .image-upload-container {
            margin-top: 20px;
            margin-bottom: 30px;
        }
        
        .image-upload-title {
            display: flex;
            align-items: center;
            font-size: 1.1rem;
            margin-bottom: 10px;
            color: #4e73df;
        }
        
        .image-upload-title i {
            margin-right: 8px;
            font-size: 1.2rem;
        }
        
        .image-upload-area {
            border: 2px dashed #4e73df;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: rgba(78, 115, 223, 0.05);
        }
        
        .image-upload-area:hover {
            background-color: rgba(78, 115, 223, 0.1);
            transform: translateY(-2px);
        }
        
        .image-upload-area i {
            font-size: 3rem;
            color: #4e73df;
            margin-bottom: 15px;
        }
        
        .image-upload-area p {
            font-size: 1.1rem;
            margin-bottom: 10px;
            color: #e0e0e0;
        }
        
        .image-upload-info {
            display: block;
            font-size: 0.9rem;
            color: #999;
        }
        
        /* Resim Önizleme Stilleri */
        .image-preview-container {
            margin-top: 15px;
            border: 1px solid #333;
            border-radius: 8px;
            overflow: hidden;
            background-color: #262626;
        }
        
        .image-preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: #2a2a2a;
            border-bottom: 1px solid #333;
        }
        
        .remove-image-btn {
            background: none;
            border: none;
            color: #ff5252;
            cursor: pointer;
            font-size: 1.1rem;
            transition: all 0.2s;
        }
        
        .remove-image-btn:hover {
            color: #ff7676;
            transform: scale(1.1);
        }
        
        #imagePreview {
            max-width: 100%;
            max-height: 300px;
            display: block;
            margin: 15px auto;
        }
        
        .insert-image-btn {
            display: block;
            width: 90%;
            margin: 0 auto 15px auto;
            padding: 10px;
            background-color: #4e73df;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }
        
        .insert-image-btn:hover {
            background-color: #375abd;
            transform: translateY(-2px);
        }
        
        .insert-image-btn i {
            margin-right: 5px;
        }
        
        /* Select2 dropdown koyu tema uyumu */
        .select2-container--classic .select2-results__option,
        .select2-container--default .select2-results__option {
            background-color: #23272b;
            color: #f8f9fa;
        }
        .select2-container--classic .select2-results__option--highlighted,
        .select2-container--default .select2-results__option--highlighted {
            background-color: #375abd !important;
            color: #fff !important;
        }
        .select2-container--classic .select2-dropdown,
        .select2-container--default .select2-dropdown {
            background-color: #23272b;
            color: #f8f9fa;
            border-color: #444;
        }
        .select2-container--classic .select2-selection--single,
        .select2-container--default .select2-selection--single {
            background-color: #23272b;
            color: #f8f9fa;
            border-color: #444;
        }
        .select2-container--classic .select2-selection__rendered,
        .select2-container--default .select2-selection__rendered {
            color: #f8f9fa;
        }
        .select2-container--classic .select2-selection__placeholder,
        .select2-container--default .select2-selection__placeholder {
            color: #b0b0b0;
        }
    </style>
    
    <script>
        // SweetAlert2 tema ayarları
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Swal !== 'undefined') {
                Swal.mixin({
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-secondary'
                    },
                    buttonsStyling: false
                });
            }
        });
        
        // Resim yükleme için değişkenler
        let uploadedImagePath = '';
        let uploadedImageElement = null;
        
        // Dosya seçme inputunu tetikle
        function triggerFileInput() {
            document.getElementById('<%= fileUpload.ClientID %>').click();
        }
        
        // Yüklenen resmi kaldır
        function removeImage() {
            document.getElementById('imagePreview').src = '#';
            document.getElementById('imagePreviewContainer').style.display = 'none';
            document.getElementById('<%= fileUpload.ClientID %>').value = '';
            uploadedImagePath = '';
            uploadedImageElement = null;
        }
        
        // Yüklenen resmi içeriğe ekle
        function insertUploadedImage() {
            if (!uploadedImagePath) {
                alert('Lütfen önce bir resim yükleyin.');
                return;
            }
            
            console.log('insertUploadedImage fonksiyonu çağrıldı');
            console.log('Eklenecek resim yolu:', uploadedImagePath);
            
            // Editöre resmi ekle
            const editor = document.getElementById('editor');
            
            // data-imgpath özelliği ile resim yolunu sakla
            const imgHtml = `<img src="${uploadedImagePath}" alt="Blog Resmi" class="editor-image expanded" data-imgpath="${uploadedImagePath}" style="display:block; max-width:100%; margin:15px auto;" />`;
            console.log('Oluşturulan HTML:', imgHtml);
            
            // Eğer seçili metin varsa, yerine resmi ekle, yoksa sona ekle
            if (window.getSelection && window.getSelection().rangeCount > 0) {
                const range = window.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createRange().createContextualFragment(imgHtml));
                console.log('Seçili metin yerine resim eklendi');
            } else {
                editor.focus();
                document.execCommand('insertHTML', false, imgHtml);
                console.log('İçeriğin sonuna resim eklendi');
            }
            
            // İçeriği hidden field'a aktar
            const content = editor.innerHTML;
            document.getElementById('<%= txtContent.ClientID %>').value = content;
            console.log('İçerik hidden field\'a aktarıldı, uzunluk:', content.length);
            
            // Resim yolunu da ayrıca sakla
            document.getElementById('hdnUploadedImageUrl').value = uploadedImagePath;
            console.log('Resim yolu hdnUploadedImageUrl alanına kaydedildi');
        }
        
        // Dosya yükleme işlemi
        $(document).ready(function() {
            const fileInput = document.getElementById('<%= fileUpload.ClientID %>');
            const dropArea = document.getElementById('imageDropArea');
            
            // Dosya seçildiğinde
            fileInput.addEventListener('change', function() {
                if (fileInput.files && fileInput.files[0]) {
                    uploadImageToServer(fileInput.files[0]);
                }
            });
            
            // Sürükle-bırak olayları
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });
            
            dropArea.addEventListener('dragenter', function() {
                this.classList.add('drag-over');
            }, false);
            
            dropArea.addEventListener('dragover', function() {
                this.classList.add('drag-over');
            }, false);
            
            dropArea.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            }, false);
            
            dropArea.addEventListener('drop', function(e) {
                this.classList.remove('drag-over');
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files && files.length > 0) {
                    uploadImageToServer(files[0]);
                }
            }, false);
        });
        
        // Resmi sunucuya yükle
        function uploadImageToServer(file) {
            // Dosya türü ve uzantı kontrolü
            const fileType = file.type;
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const fileName = file.name ? file.name.toLowerCase() : '';
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
            const isValidType = validTypes.includes(fileType) || validExtensions.some(ext => fileName.endsWith(ext));
            
            if (!isValidType) {
                alert('Lütfen geçerli bir resim dosyası yükleyin (jpg, jpeg, png, gif)');
                return;
            }
            
            // Dosya boyutu kontrolü (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Dosya boyutu 5MB\'dan küçük olmalıdır');
                return;
            }
            
            // FormData oluştur
            const formData = new FormData();
            formData.append('file', file);
            
            // Yükleme alanını göster
            document.getElementById('imageDropArea').innerHTML = `
                <div class="upload-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Resim yükleniyor...</p>
                </div>
            `;
            
            // AJAX ile dosya yükleme
            $.ajax({
                url: 'FileUploadHandler.ashx',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    try {
                        // Debug için cevabı log et
                        console.log('Raw response:', response);
                        
                        // Yanıt string değilse stringify yapalım
                        let jsonResponse = response;
                        if (typeof response === 'object') {
                            console.log('Response is already an object');
                            jsonResponse = JSON.stringify(response);
                        } else {
                            console.log('Response is string, parsing as JSON');
                        }
                        
                        // JSON olarak parse et
                        const result = typeof response === 'object' ? response : JSON.parse(jsonResponse);
                        console.log('Parsed result:', result);
                        
                        if (result.success) {
                            // Resim başarıyla yüklendi - URL'i tam olarak logla
                            console.log('Image uploaded successfully!');
                            console.log('File URL:', result.fileUrl);
                            console.log('File Name:', result.fileName);
                            
                            uploadedImagePath = result.fileUrl;
                            console.log('Saved path to uploadedImagePath:', uploadedImagePath);
                            
                            // Önizleme göster
                            document.getElementById('imagePreview').src = result.fileUrl;
                            document.getElementById('imagePreviewContainer').style.display = 'block';
                            
                            // Yükleme alanını sıfırla
                            document.getElementById('imageDropArea').innerHTML = `
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Resim yüklemek için tıklayın veya sürükleyin</p>
                                <span class="image-upload-info">En fazla 5MB, jpg, jpeg, png veya gif</span>
                            `;
                            
                            // Gizli alana da bilgiyi kaydet
                            document.getElementById('hdnUploadedImageUrl').value = result.fileUrl;
                            
                            console.log('Image upload process completed');
                        } else {
                            // Hata mesajı
                            alert('Resim yüklenirken bir hata oluştu: ' + (result.error || 'Bilinmeyen hata'));
                            
                            // Yükleme alanını sıfırla
                            document.getElementById('imageDropArea').innerHTML = `
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Resim yüklemek için tıklayın veya sürükleyin</p>
                                <span class="image-upload-info">En fazla 5MB, jpg, jpeg, png veya gif</span>
                            `;
                        }
                    } catch (e) {
                        console.error('Resim yükleme cevabı işlenirken hata:', e);
                        console.error('Response değeri:', response);
                        
                        // Ham yanıt kontrolü ve debug
                        let debugMessage = '';
                        try {
                            if (typeof response === 'string') {
                                debugMessage = 'String yanıt alındı, uzunluk: ' + response.length;
                                if (response.length < 100) debugMessage += ' İçerik: ' + response;
                            } else if (typeof response === 'object') {
                                debugMessage = 'Object yanıt alındı: ' + JSON.stringify(response);
                            } else {
                                debugMessage = 'Bilinmeyen yanıt türü: ' + typeof response;
                            }
                        } catch (err) {
                            debugMessage = 'Yanıt analiz edilemedi';
                        }
                        
                        console.log('Debug bilgisi:', debugMessage);
                        alert('Resim işlenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
                        
                        // Yükleme alanını sıfırla
                        document.getElementById('imageDropArea').innerHTML = `
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Resim yüklemek için tıklayın veya sürükleyin</p>
                            <span class="image-upload-info">En fazla 5MB, jpg, jpeg, png veya gif</span>
                        `;
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Resim yükleme AJAX hatası:', error);
                    alert('Resim yüklenirken bir hata oluştu: ' + error);
                    
                    // Yükleme alanını sıfırla
                    document.getElementById('imageDropArea').innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Resim yüklemek için tıklayın veya sürükleyin</p>
                        <span class="image-upload-info">En fazla 5MB, jpg, jpeg, png veya gif</span>
                    `;
                }
            });
        }
        
        // İçeriği hazırlayıp form gönderime hazır hale getir
        function prepareSubmit(mode) {
            try {
                console.log(mode + " modu için form gönderme işlemi başlatılıyor...");
                
                // İçeriği kaydet
                var editorContent = document.getElementById('editor').innerHTML;
                var hiddenField = document.getElementById('<%= txtContent.ClientID %>');
                
                // İçeriği HiddenField'a aktar
                if (hiddenField) {
                    hiddenField.value = editorContent;
                    console.log("İçerik HiddenField'a kaydedildi. Uzunluk: " + editorContent.length);
                } else {
                    console.error("HiddenField bulunamadı!");
                    alert("İçeriği kaydetme hatası! Lütfen sayfayı yenileyin.");
                    return false;
                }
                
                // İçerik ve başlık doğrulaması
                if (mode === 'publish') {
                    var title = document.getElementById('<%= txtTitle.ClientID %>').value.trim();
                    var category = document.getElementById('<%= ddlCategory.ClientID %>').value;
                    
                    if (!title) {
                        alert("Lütfen bir başlık giriniz.");
                        return false;
                    }
                    
                    if (!category) {
                        alert("Lütfen bir kategori seçiniz.");
                        return false;
                    }
                    
                    if (!editorContent || editorContent.trim() === '' || editorContent.trim() === '<p></p>') {
                        alert("Lütfen içerik alanını doldurunuz.");
                        return false;
                    }
                }
                
                // Post modunu ayarla
                document.getElementById('hdnPostMode').value = mode;
                console.log("Form gönderimi hazırlandı, sunucuya gönderiliyor...");
                
                // Form gönderimini devam ettir
                return true;
            } catch (e) {
                console.error("prepareSubmit hatası:", e);
                alert("Form hazırlanırken bir hata oluştu: " + e.message);
                return false;
            }
        }
        
        // İçerik düzenleyici fonksiyonları
        function formatText(command) {
            switch(command) {
                case 'bold':
                    document.execCommand('bold', false, null);
                    break;
                case 'italic':
                    document.execCommand('italic', false, null);
                    break;
                case 'underline':
                    document.execCommand('underline', false, null);
                    break;
                case 'h2':
                    document.execCommand('formatBlock', false, '<h2>');
                    break;
                case 'h3':
                    document.execCommand('formatBlock', false, '<h3>');
                    break;
                case 'p':
                    document.execCommand('formatBlock', false, '<p>');
                    break;
                case 'ul':
                    document.execCommand('insertUnorderedList', false, null);
                    break;
                case 'ol':
                    document.execCommand('insertOrderedList', false, null);
                    break;
                case 'link':
                    var url = prompt('Bağlantı adresini girin:', 'http://');
                    if (url) document.execCommand('createLink', false, url);
                    break;
                case 'alignLeft':
                    document.execCommand('justifyLeft', false, null);
                    break;
                case 'alignCenter':
                    document.execCommand('justifyCenter', false, null);
                    break;
                case 'alignRight':
                    document.execCommand('justifyRight', false, null);
                    break;
            }
            document.getElementById('editor').focus();
        }
        
        // Sayfa yüklendiğinde
        window.onload = function() {
            console.log("Sayfa yüklendi, editör hazırlanıyor...");
            
            // İçeriği yükle (varsa)
            var savedContent = document.getElementById('<%= txtContent.ClientID %>').value;
            if (savedContent) {
                document.getElementById('editor').innerHTML = savedContent;
                console.log("Önceki içerik editöre yüklendi");
            }
            
            // Select2 başlatma
            $(document).ready(function() {
                $('#<%=ddlCategory.ClientID%>').select2({
                    theme: 'classic',
                    placeholder: 'Kategori seçin',
                    allowClear: true
                });
            });
            
            // Düzenleyiciden çıkıldığında içeriği güncelle (ekstra önlem)
            document.getElementById('editor').addEventListener('blur', function() {
                var content = document.getElementById('editor').innerHTML;
                document.getElementById('<%= txtContent.ClientID %>').value = content;
                console.log("Editor blur: İçerik hidden field'a aktarıldı");
            });
        };
    </script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div class="create-blog-container">
        <div class="create-blog-header">
            <h1 class="create-blog-title">Yeni Yazı Oluştur</h1>
            <p class="create-blog-subtitle">Düşüncelerinizi, fikirlerinizi ve bilgilerinizi paylaşın</p>
        </div>
        
        <asp:Panel ID="pnlSuccess" runat="server" CssClass="success-message" Visible="false">
            <i class="fas fa-check-circle"></i> Yazınız başarıyla kaydedildi ve inceleme için gönderildi. Onaylandıktan sonra yayınlanacaktır.
        </asp:Panel>
        
        <div class="form-group">
            <asp:Label ID="lblTitle" runat="server" CssClass="form-label" AssociatedControlID="txtTitle">Başlık</asp:Label>
            <asp:TextBox ID="txtTitle" runat="server" CssClass="form-control" placeholder="Yazınızın başlığını girin"></asp:TextBox>
            <asp:RequiredFieldValidator ID="rfvTitle" runat="server" ControlToValidate="txtTitle" 
                ErrorMessage="Başlık alanı zorunludur" CssClass="validation-error" Display="Dynamic"></asp:RequiredFieldValidator>
        </div>
        
        <div class="form-group">
            <asp:Label ID="lblCategory" runat="server" CssClass="form-label" AssociatedControlID="ddlCategory">Kategori</asp:Label>
            <asp:DropDownList ID="ddlCategory" runat="server" CssClass="form-control"></asp:DropDownList>
            <asp:RequiredFieldValidator ID="rfvCategory" runat="server" ControlToValidate="ddlCategory" 
                ErrorMessage="Lütfen bir kategori seçin" CssClass="validation-error" Display="Dynamic" InitialValue=""></asp:RequiredFieldValidator>
        </div>
        
        <div class="form-group">
            <asp:Label ID="lblContent" runat="server" CssClass="form-label">İçerik</asp:Label>
            <div class="editor-container">
                <div class="editor-toolbar">
                    <div class="editor-btn-group">
                        <button type="button" class="editor-btn" onclick="formatText('bold')" title="Kalın"><i class="fas fa-bold"></i></button>
                        <button type="button" class="editor-btn" onclick="formatText('italic')" title="İtalik"><i class="fas fa-italic"></i></button>
                        <button type="button" class="editor-btn" onclick="formatText('underline')" title="Altı Çizili"><i class="fas fa-underline"></i></button>
                    </div>
                    <div class="editor-btn-group">
                        <button type="button" class="editor-btn" onclick="formatText('h2')" title="Başlık 2">H2</button>
                        <button type="button" class="editor-btn" onclick="formatText('h3')" title="Başlık 3">H3</button>
                        <button type="button" class="editor-btn" onclick="formatText('p')" title="Paragraf">P</button>
                    </div>
                    <div class="editor-btn-group">
                        <button type="button" class="editor-btn" onclick="formatText('ul')" title="Madde İşaretleri"><i class="fas fa-list-ul"></i></button>
                        <button type="button" class="editor-btn" onclick="formatText('ol')" title="Numaralı Liste"><i class="fas fa-list-ol"></i></button>
                    </div>
                    <div class="editor-btn-group">
                        <button type="button" class="editor-btn" onclick="formatText('link')" title="Bağlantı Ekle"><i class="fas fa-link"></i></button>
                    </div>
                    <div class="editor-btn-group">
                        <button type="button" class="editor-btn" onclick="formatText('alignLeft')" title="Sola Hizala"><i class="fas fa-align-left"></i></button>
                        <button type="button" class="editor-btn" onclick="formatText('alignCenter')" title="Ortala"><i class="fas fa-align-center"></i></button>
                        <button type="button" class="editor-btn" onclick="formatText('alignRight')" title="Sağa Hizala"><i class="fas fa-align-right"></i></button>
                    </div>
                </div>
                <div id="editor" class="editor-content" contenteditable="true"></div>
                <asp:HiddenField ID="txtContent" runat="server" />
            </div>
            <asp:CustomValidator ID="cvContent" runat="server" 
                ErrorMessage="İçerik alanı zorunludur" CssClass="validation-error" Display="Dynamic"
                ClientValidationFunction="validateContent" ValidateEmptyText="true" 
                OnServerValidate="cvContent_ServerValidate"></asp:CustomValidator>
        </div>
        
        <!-- Modern Resim Yükleme Bölümü -->
        <div class="form-group image-upload-container">
            <div class="image-upload-title">
                <i class="fas fa-image"></i> Yazınız için resim ekleyin
            </div>
            <div class="image-upload-area" id="imageDropArea" onclick="triggerFileInput()">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Resim yüklemek için tıklayın veya sürükleyin</p>
                <span class="image-upload-info">En fazla 5MB, jpg, jpeg, png veya gif</span>
            </div>
            <div id="imagePreviewContainer" class="image-preview-container" style="display:none">
                <div class="image-preview-header">
                    <span>Yüklenen Resim</span>
                    <button type="button" class="remove-image-btn" onclick="removeImage()"><i class="fas fa-times"></i></button>
                </div>
                <img id="imagePreview" src="#" alt="Resim Önizleme" />
                <button type="button" class="insert-image-btn" onclick="insertUploadedImage()">
                    <i class="fas fa-plus-circle"></i> İçeriğe Ekle
                </button>
            </div>
        </div>
        
        <div class="form-group">
            <asp:Label ID="lblTags" runat="server" CssClass="form-label" AssociatedControlID="txtTags">Etiketler (Virgülle ayırın)</asp:Label>
            <asp:TextBox ID="txtTags" runat="server" CssClass="form-control" placeholder="örnek, blog, yazılım"></asp:TextBox>
        </div>
        
        <!-- Gizli dosya yükleme alanı (İçeriğe resim eklemek için) -->
        <asp:FileUpload ID="fileUpload" runat="server" CssClass="d-none" />
        
        <div class="form-actions">
            <asp:Button ID="btnSaveDraft" runat="server" Text="Taslak Olarak Kaydet" 
                CssClass="btn btn-secondary" OnClick="btnSaveDraft_Click" CausesValidation="false" OnClientClick="return prepareSubmit('draft');" />
            <asp:Button ID="btnPublish" runat="server" Text="Yayınla" 
                CssClass="btn btn-primary" OnClick="btnPublish_Click" OnClientClick="return prepareSubmit('publish');" />
                
            <!-- İçerik transfer alanı -->
            <input type="hidden" id="hdnPostMode" name="hdnPostMode" value="" />
            <input type="hidden" id="hdnUploadedImageUrl" name="hdnUploadedImageUrl" value="" />
        </div>
    </div>
</asp:Content> 