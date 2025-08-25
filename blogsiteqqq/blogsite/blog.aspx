<%@ Page Title="Blog Detayı" Language="C#" MasterPageFile="~/blogsite/MasterPage.master" AutoEventWireup="true" CodeFile="blog.aspx.cs" Inherits="Blog" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="assets/style/blogdetails.css?v=1.2" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Blog içeriği - detaylı bilgiler burada" runat="server" id="metaDescription" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">
    <title>Blog Detayı</title>
    <style>
        body {
            background-color: #121212 !important;
            color: #f8f9fa !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        .container {
            background-color: #121212 !important;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .main-content {
            background-color: #121212 !important;
            padding: 0 !important;
        }
        
        .header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .footer {
            background-color: #0a0a0a !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .sidebar {
            background-color: #121212 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Blog içeriği için yazı tipi ve genel görünüm */
        .blog-content {
            font-family: 'Merriweather', 'Segoe UI', Tahoma, Geneva, Verdana, serif !important;
            font-size: 1.15rem !important;
            line-height: 1.9 !important;
            letter-spacing: 0.01em !important;
            font-weight: 300 !important;
        }
        
        /* Blog kartlarını daha modern ve çekici hale getir */
        .blog-detail {
            background-color: #1e1e1e !important;
            border: none !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
            overflow: hidden !important;
            margin: 30px auto !important;
            max-width: 600px !important; /* Instagram stili için dar kart */
            position: relative;
        }
        
        /* Blog içeriği */
        .blog-content {
            margin-top: 15px;
            padding: 5px 24px 20px 24px;
            font-size: 1rem;
            line-height: 1.7;
            color: #f1f1f1;
            width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .blog-content p {
            margin-bottom: 18px;
        }
        
        /* Sosyal medya tarzı başlık ve meta bölümü */
        .blog-title {
            background: #1e1e1e !important;
            padding: 16px 24px !important;
            position: relative !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        
        .blog-title:before {
            display: none;
        }
        
        .blog-title h1 {
            font-weight: 700 !important;
            font-size: 1.5rem !important;
            line-height: 1.3 !important;
            margin-bottom: 12px !important;
            color: #ffffff !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
            letter-spacing: -0.02em !important;
        }
        
        .blog-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .post-author {
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .post-author i {
            color: #4e73df;
            font-size: 1.1rem;
        }
        
        .post-details {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 8px;
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .post-details i {
            color: #4e73df;
            margin-right: 5px;
        }
        
        /* İçerik resimleri için stiller - Instagram tarzı */
        .blog-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0;
            margin: 0;
            box-shadow: none;
        }
        
        /* Resim kapsayıcısı - Instagram tarzı */
        .image-container {
            background-color: #000;
            margin: 24px 0;
            position: relative;
            overflow: hidden;
            border-radius: 4px;
            line-height: 0;
            max-height: 600px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        
        .image-container:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            z-index: 5;
        }
        
        .image-container:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            z-index: 5;
        }
        
        .image-container img {
            width: 100%;
            object-fit: contain;
            max-height: 600px;
            background-color: #000;
            display: block;
            margin: 0 auto;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .image-container:hover img {
            transform: scale(1.02);
        }
        
        /* Etkileşim butonları - Instagram/Reddit tarzı */
        .social-interaction {
            display: flex;
            padding: 16px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to right, rgba(78, 115, 223, 0.05), transparent);
        }
        
        .interaction-buttons {
            display: flex;
            gap: 24px;
        }
        
        .interaction-btn {
            background: transparent;
            border: none;
            color: #f1f1f1;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            position: relative;
            padding: 8px 12px;
            border-radius: 50px;
        }
        
        .interaction-btn i {
            font-size: 1.3rem;
            transition: transform 0.3s ease;
        }
        
        .interaction-btn::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50px;
            background: linear-gradient(135deg, rgba(78, 115, 223, 0.05), rgba(78, 115, 223, 0.1));
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
        }
        
        .interaction-btn:hover {
            color: #4e73df;
            transform: translateY(-2px);
        }
        
        .interaction-btn:hover::after {
            opacity: 1;
        }
        
        .interaction-btn:hover i {
            transform: scale(1.15);
        }
        
        .interaction-count {
            font-size: 0.9rem;
            font-weight: 600;
            transition: color 0.3s ease;
        }
        
        /* Beğeni butonu */
        .like-btn {
            color: #f1f1f1;
        }
        
        .like-btn:hover, .like-btn.liked {
            color: #ff4d6d;
        }
        
        .like-btn:hover::after {
            background: linear-gradient(135deg, rgba(255, 77, 109, 0.05), rgba(255, 77, 109, 0.1));
        }
        
        .like-btn.liked i {
            color: #ff4d6d;
        }
        
        .like-btn.liked .interaction-count {
            color: #ff4d6d;
        }
        
        /* Yorum butonu */
        .comment-btn:hover {
            color: #4e73df;
        }
        
        .comment-btn:hover .interaction-count {
            color: #4e73df;
        }
        
        /* Görüntülenme butonu */
        .view-btn {
            cursor: default;
            opacity: 0.9;
        }
        
        .view-btn:hover {
            transform: none;
        }
        
        .view-btn:hover::after {
            opacity: 0;
        }
        
        .view-btn i {
            color: rgba(255, 255, 255, 0.7);
        }
        
        /* Paylaş butonu */
        .share-interaction-btn:hover {
            color: #4ecdc4;
        }
        
        .share-interaction-btn:hover::after {
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.05), rgba(78, 205, 196, 0.1));
        }
        
        /* Animasyon efektleri */
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
        }
        
        .like-btn.liked i {
            animation: pulse 0.4s ease-out;
        }
        
        /* Paylaşım butonları */
        .blog-share {
            padding: 16px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(30, 30, 30, 0.5);
        }
        
        .share-title {
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #f1f1f1;
        }
        
        .share-buttons {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 12px;
        }
        
        .share-btn {
            width: 38px !important;
            height: 38px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
                justify-content: center !important;
            margin-right: 0 !important;
            font-size: 1rem !important;
            transition: all 0.3s ease !important;
            color: white !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
            border: 2px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .share-btn.facebook {
            background: linear-gradient(135deg, #3b5998, #2d4373) !important;
        }
        
        .share-btn.twitter {
            background: linear-gradient(135deg, #1da1f2, #0c85d0) !important;
        }
        
        .share-btn.linkedin {
            background: linear-gradient(135deg, #0077b5, #00589b) !important;
        }
        
        .share-btn.email {
            background: linear-gradient(135deg, #dd4b39, #c23321) !important;
        }
        
        .share-btn:hover {
            transform: translateY(-4px) !important;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Yorum bölümü - Instagram tarzı */
        .blog-comments-section {
            padding: 18px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            background: linear-gradient(to bottom, #1e1e1e, #171717);
        }
        
        .blog-comments-section h3 {
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 18px;
            color: #fff;
            position: relative;
            padding-bottom: 10px;
            letter-spacing: -0.01em;
        }
        
        .blog-comments-section h3:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 3px;
            background: linear-gradient(90deg, #4e73df, rgba(78, 115, 223, 0.5));
            border-radius: 3px;
        }
        
        .comments-container {
            margin-bottom: 20px;
            }
            
            .comment-item {
            background-color: transparent !important;
            border-left: none !important;
            margin-bottom: 15px !important;
            border-radius: 0 !important;
            padding: 12px 0 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            transition: all 0.2s ease-in-out !important;
        }
        
        .comment-item:hover {
            transform: none !important;
            background-color: rgba(40, 40, 40, 0.3) !important;
            padding-left: 10px !important;
            }
            
            .comment-header {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .comment-author {
            font-weight: 600;
            font-size: 0.95rem;
        }
        
        .comment-author a {
            background: linear-gradient(45deg, #4e73df, #6d8be7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
            }
            
            .comment-date {
            font-size: 0.8rem;
            opacity: 0.7;
        }
        
        .comment-text {
            color: #e6e6e6;
            line-height: 1.6;
            font-size: 0.95rem;
        }
        
        /* Etiketler bölümü */
        .blog-tags {
            padding: 16px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(25, 25, 25, 0.5);
        }
        
        .tags-title {
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: #f1f1f1;
            display: flex;
            align-items: center;
        }
        
        .tags-title i {
            margin-right: 8px;
            color: #4e73df;
        }
        
        .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .blog-tag {
            display: inline-block;
            background: rgba(78, 115, 223, 0.1);
            color: #a4b7f5;
            padding: 6px 14px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            border: 1px solid rgba(78, 115, 223, 0.2);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .blog-tag:hover {
            background: rgba(78, 115, 223, 0.2);
            color: #ffffff;
            transform: translateY(-3px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        
        /* Yorum formu */
        .comment-form {
            margin-top: 25px;
            background: rgba(30, 30, 30, 0.3);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .comment-form h4 {
            font-size: 1.05rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: #fff;
            letter-spacing: -0.01em;
            position: relative;
            display: inline-block;
        }
        
        .comment-form h4:after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, #4e73df, rgba(78, 115, 223, 0));
        }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        .form-control {
            background-color: rgba(20, 20, 20, 0.6) !important;
            border: 1px solid rgba(78, 115, 223, 0.2) !important;
            color: #fff !important;
            border-radius: 8px !important;
            padding: 12px 16px !important;
            font-size: 0.95rem !important;
            transition: all 0.3s ease !important;
        }
        
        .form-control:focus {
            background-color: rgba(25, 25, 25, 0.7) !important;
            border-color: #4e73df !important;
            box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.25) !important;
        }
        
        .comment-submit-btn {
            background: linear-gradient(135deg, #4e73df, #375abd) !important;
            color: white !important;
            padding: 10px 22px !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            font-size: 0.95rem !important;
            border: none !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
            transition: all 0.3s ease !important;
            letter-spacing: 0.02em !important;
        }
        
        .comment-submit-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3) !important;
            background: linear-gradient(135deg, #5a80e6, #4469c7) !important;
        }
        
        /* Fullscreen görüntüleme */
        .fullscreen-image-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.95);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            cursor: zoom-out;
            backdrop-filter: blur(3px);
        }
        
        .fullscreen-image {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.7);
            border-radius: 3px;
            transition: transform 0.3s ease;
        }
        
        .fullscreen-close {
            position: absolute;
            top: 20px;
            right: 20px;
            color: #fff;
            font-size: 26px;
            cursor: pointer;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(40, 40, 40, 0.7);
            border-radius: 50%;
            transition: all 0.3s;
            z-index: 1001;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .fullscreen-close:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
        }
        
        /* Okuma ilerleme çubuğu */
        .reading-progress-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: transparent;
            z-index: 1000;
        }
        
        .reading-progress-bar {
            height: 100%;
            background: linear-gradient(to right, #4e73df, #6d8be7);
            width: 0%;
            transition: width 0.1s ease;
        }
        
        /* Mobil görünüm için düzenlemeler */
        @media (max-width: 768px) {
            .blog-detail {
                margin: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                max-width: 100% !important;
            }
            
            .image-container {
                margin: 15px 0;
            }
            
            .social-interaction, .blog-share, .blog-tags, .blog-comments-section {
                padding: 15px 20px;
            }
            
            .interaction-buttons {
                gap: 20px;
            }
            
            .blog-title {
                padding: 16px 20px !important;
            }
            
            .blog-title h1 {
                font-size: 1.3rem !important;
            }
            
            .blog-content {
                padding: 5px 20px 20px 20px;
            }
            
            .comment-item {
                padding: 10px 0 !important;
            }
            
            .comment-form {
                padding: 15px;
                margin-top: 20px;
            }
        }
        
        /* Yorum yanıtlama için stiller */
        .comment-actions {
            margin-top: 10px;
            display: flex;
            gap: 15px;
        }
        
        .reply-button {
            color: #4e73df;
            font-size: 0.85rem;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s;
        }
        
        .reply-button:hover {
            color: #375abd;
            transform: translateX(3px);
        }
        
        .reply-form-container {
            margin: 15px 0 15px 20px;
            border-left: 2px solid #4e73df;
            padding-left: 15px;
        }
        
        .reply-form {
            background: rgba(30, 30, 30, 0.4);
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }
        
        .reply-form-buttons {
            display: flex;
            gap: 10px;
        }
        
        .reply-submit-btn {
            background: linear-gradient(135deg, #4e73df, #375abd) !important;
            color: white !important;
            padding: 8px 16px !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
            font-size: 0.9rem !important;
            border: none !important;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2) !important;
            transition: all 0.3s ease !important;
        }
        
        .reply-submit-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
        }
        
        .reply-cancel-btn {
            background: rgba(80, 80, 80, 0.2) !important;
            color: #e0e0e0 !important;
            padding: 8px 16px !important;
            border-radius: 6px !important;
            font-weight: 500 !important;
            font-size: 0.9rem !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
        }
        
        .reply-cancel-btn:hover {
            background: rgba(100, 100, 100, 0.3) !important;
        }
        
        /* Alt yorumlar için stiller */
        .comment-replies {
            margin-top: 15px;
            margin-left: 25px;
            border-left: 2px solid rgba(78, 115, 223, 0.4);
            padding-left: 15px;
        }
        
        .reply-item {
            background-color: rgba(35, 35, 35, 0.4) !important;
            padding: 12px !important;
            margin-bottom: 10px !important;
            border-radius: 8px !important;
            transition: all 0.2s ease-in-out !important;
        }
        
        .reply-item:hover {
            background-color: rgba(40, 40, 40, 0.5) !important;
        }
        
        .reply-header {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .reply-author {
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .reply-author a {
            background: linear-gradient(45deg, #4e73df, #6d8be7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
        }
        
        .reply-date {
            font-size: 0.75rem;
            opacity: 0.7;
        }
        
        .reply-text {
            color: #e0e0e0;
            line-height: 1.5;
            font-size: 0.9rem;
        }
    </style>
    
    <script type="text/javascript">
        function confirmDelete() {
            return confirm("Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.");
        }
        
        // Resimleri tıklayınca tam ekran gösterme
        document.addEventListener('DOMContentLoaded', function() {
            // Tam ekran container'ı ekle (eğer yoksa)
            if (!document.querySelector('.fullscreen-image-container')) {
                const fullscreenContainer = document.createElement('div');
                fullscreenContainer.className = 'fullscreen-image-container';
                fullscreenContainer.innerHTML = `
                    <div class="fullscreen-close"><i class="fas fa-times"></i></div>
                    <img class="fullscreen-image" src="" alt="Tam Ekran Görüntü">
                `;
                document.body.appendChild(fullscreenContainer);
            
            // Kapatma düğmesine veya container'a tıklama
                fullscreenContainer.addEventListener('click', function(e) {
                    if (e.target !== document.querySelector('.fullscreen-image')) {
                        this.style.display = 'none';
                        document.body.style.overflow = 'auto';
                }
            });
            
            // ESC tuşuna basınca kapat
                document.addEventListener('keydown', function(e) {
                if (e.keyCode === 27) { // ESC tuşu
                        fullscreenContainer.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            }
            
            // Resimlere tıklama olayı ekle
            document.querySelectorAll('.blog-content img').forEach(img => {
                img.addEventListener('click', function() {
                    const imgSrc = this.getAttribute('src');
                    document.querySelector('.fullscreen-image').setAttribute('src', imgSrc);
                    fullscreenContainer.style.display = 'flex';
                    document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı engelle
                });
            });
            
            // Meta açıklamayı otomatik olarak blogdan al
            const blogContent = document.querySelector('.blog-content');
            const blogTitle = document.getElementById('<%= blogTitle.ClientID %>');
            if (blogContent && blogTitle) {
                const metaDesc = document.getElementById('<%= metaDescription.ClientID %>');
                if (metaDesc) {
                    const titleText = blogTitle.innerText || '';
                    const contentText = blogContent.innerText || '';
                    const description = contentText.substring(0, 150).trim() + '...';
                    metaDesc.setAttribute('content', titleText + ' - ' + description);
                }
            }
        });
    </script>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <!-- Okuma ilerleme çubuğu -->
    <div class="reading-progress-container">
        <div class="reading-progress-bar" id="readingProgressBar"></div>
    </div>

    <div class="blog-detail-container">
        <!-- Blog Kartı -->
        <div class="blog-detail">
            <!-- Başlık Bölümü -->
            <div class="blog-title">
                <div class="blog-meta">
                    <span id="blogAuthor" runat="server" class="post-author"><i class="fas fa-user"></i> <span class="meta-text"></span></span>
                    <span id="blogDate" runat="server"><i class="far fa-calendar-alt"></i> <span class="meta-text"></span></span>
                    
                    <!-- Silme butonu - Sadece post sahibi görebilir -->
                    <asp:Panel ID="pnlDeleteButton" runat="server" Visible="false" CssClass="delete-post-area">
                        <asp:LinkButton ID="btnDeletePost" runat="server" CssClass="delete-post-btn" OnClientClick="return confirmDelete();" OnClick="btnDeletePost_Click">
                            <i class="fas fa-trash-alt"></i> <span class="meta-text">Sil</span>
                        </asp:LinkButton>
                    </asp:Panel>
                </div>
                <h1 id="blogTitle" runat="server"></h1>
                <div class="post-details">
                    <span id="blogCategory" runat="server"><i class="fas fa-folder"></i> <span class="meta-text"></span></span>
                    <span id="blogReadTime" runat="server" visible="false"><i class="far fa-clock"></i> <span class="meta-text"></span></span>
                </div>
            </div>

            <!-- Blog içeriği -->
            <div class="blog-body">
                <!-- Blog İçeriği -->
                <article id="blogContent" runat="server" class="blog-content">
                    <!-- İçerik dinamik olarak doldurulacak -->
                </article>
                </div>

            <!-- Sosyal Etkileşim Butonları -->
            <div class="social-interaction">
                <div class="interaction-buttons">
                    <a href="#" class="interaction-btn like-btn" id="likeBtn" onclick="toggleLike(); return false;">
                        <i id="likeIcon" class="far fa-heart"></i>
                        <span id="likeCount" class="interaction-count">0</span>
                    </a>
                    <a href="#comments" class="interaction-btn comment-btn">
                        <i class="far fa-comment"></i>
                        <span id="commentCount" runat="server" class="interaction-count">0</span>
                    </a>
                    <div class="interaction-btn view-btn">
                        <i class="fas fa-eye"></i>
                        <span id="blogViews" runat="server" class="interaction-count">0</span>
                    </div>
                </div>
                <a href="#" onclick="copyLink(); return false;" class="interaction-btn share-interaction-btn" id="copyLinkBtn" title="Bağlantıyı kopyala" aria-label="Bağlantıyı kopyala">
                    <i class="fas fa-share-alt"></i>
                </a>
            </div>

            <!-- Etiketler -->
            <div id="tagsContainer" runat="server" class="blog-tags" visible="false">
                <div class="tags-title"><i class="fas fa-tags"></i> Etiketler</div>
                <div id="tagsList" runat="server" class="tags-list">
                    <!-- Etiketler dinamik olarak doldurulacak -->
                </div>
            </div>

            <!-- Paylaşım Butonları -->
            <div class="blog-share">
                <div class="share-title">Bu yazıyı paylaş:</div>
                <div class="share-buttons">
                    <a href="#" onclick="shareOnFacebook(); return false;" class="share-btn facebook" title="Facebook'ta paylaş" aria-label="Facebook'ta paylaş">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" onclick="shareOnTwitter(); return false;" class="share-btn twitter" title="Twitter'da paylaş" aria-label="Twitter'da paylaş">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" onclick="shareOnLinkedIn(); return false;" class="share-btn linkedin" title="LinkedIn'de paylaş" aria-label="LinkedIn'de paylaş">
                        <i class="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#" onclick="shareByEmail(); return false;" class="share-btn email" title="E-posta ile paylaş" aria-label="E-posta ile paylaş">
                        <i class="fas fa-envelope"></i>
                    </a>
                </div>
            </div>

            <!-- Yorumlar Bölümü -->
            <div class="blog-comments-section" id="comments">
                <h3>Yorumlar</h3>
                <div id="commentsList" runat="server" class="comments-container">
                    <!-- Yorumlar dinamik olarak doldurulacak -->
                    <asp:Repeater ID="rptComments" runat="server" OnItemDataBound="rptComments_ItemDataBound">
                        <ItemTemplate>
                            <div class="comment-item" id="comment-<%# Eval("CommentID") %>">
                                <div class="comment-header">
                                    <span class="comment-author"><a href='userpage.aspx?id=<%# Eval("UserID") %>'><%# Eval("Username") %></a></span>
                                    <span class="comment-date"><i class="far fa-calendar-alt"></i> <%# Eval("CreatedAt", "{0:dd MMMM yyyy}") %></span>
                                </div>
                                <div class="comment-text"><%# Eval("CommentText") %></div>
                                <div class="comment-actions">
                                    <a href="#" class="reply-button" data-commentid="<%# Eval("CommentID") %>">
                                        <i class="fas fa-reply"></i> Yanıtla
                                    </a>
                                </div>
                                
                                <!-- Yanıt formu (gizli) -->
                                <div class="reply-form-container" id="replyForm-<%# Eval("CommentID") %>" style="display: none;">
                                    <asp:Panel ID="pnlReplyForm" runat="server" DefaultButton="btnSubmitReply" CssClass="reply-form">
                                        <div class="form-group">
                                            <asp:TextBox ID="txtReplyText" runat="server" TextMode="MultiLine" CssClass="form-control" 
                                                placeholder="Yanıtınızı yazın..."></asp:TextBox>
                                            <asp:HiddenField ID="hdnParentCommentID" runat="server" Value='<%# Eval("CommentID") %>' />
                                            <asp:RequiredFieldValidator ID="rfvReplyText" runat="server" 
                                                ControlToValidate="txtReplyText" Display="Dynamic" 
                                                ErrorMessage="Yanıt metni boş olamaz" 
                                                ValidationGroup='<%# "ReplyGroup" + Eval("CommentID") %>'
                                                CssClass="validation-error" ForeColor="#ff4d6d"></asp:RequiredFieldValidator>
                                        </div>
                                        <div class="reply-form-buttons">
                                            <asp:Button ID="btnSubmitReply" runat="server" Text="Yanıtla" 
                                                CssClass="reply-submit-btn" OnClick="btnSubmitReply_Click" 
                                                ValidationGroup='<%# "ReplyGroup" + Eval("CommentID") %>' />
                                            <button type="button" class="reply-cancel-btn" data-commentid="<%# Eval("CommentID") %>">İptal</button>
                                        </div>
                                    </asp:Panel>
                                </div>
                                
                                <!-- Alt yorumlar -->
                                <asp:Repeater ID="rptReplies" runat="server">
                                    <HeaderTemplate>
                                        <div class="comment-replies">
                                    </HeaderTemplate>
                                    <ItemTemplate>
                                        <div class="reply-item">
                                            <div class="reply-header">
                                                <span class="reply-author"><a href='userpage.aspx?id=<%# Eval("UserID") %>'><%# Eval("Username") %></a></span>
                                                <span class="reply-date"><i class="far fa-calendar-alt"></i> <%# Eval("CreatedAt", "{0:dd MMMM yyyy}") %></span>
                                            </div>
                                            <div class="reply-text"><%# Eval("CommentText") %></div>
                                        </div>
                                    </ItemTemplate>
                                    <FooterTemplate>
                                        </div>
                                    </FooterTemplate>
                                </asp:Repeater>
                            </div>
                        </ItemTemplate>
                    </asp:Repeater>
                    
                    <!-- Yorum yoksa gösterilecek mesaj -->
                    <div id="noCommentsMessage" runat="server" class="no-comments" visible="false">
                        <p>Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                    </div>
                </div>

                <!-- Yorum Formu -->
                <div class="comment-form">
                    <h4>Yorum Yap</h4>
                    <asp:Panel ID="pnlCommentForm" runat="server" DefaultButton="btnSubmitComment">
                        <div class="form-group" id="nameFieldContainer" runat="server">
                            <asp:TextBox ID="txtCommentName" runat="server" placeholder="Adınız" CssClass="form-control"></asp:TextBox>
                            <asp:RequiredFieldValidator ID="rfvName" runat="server" ControlToValidate="txtCommentName"
                                ErrorMessage="Lütfen adınızı girin" Display="Dynamic" CssClass="validation-error"
                                ValidationGroup="CommentGroup"></asp:RequiredFieldValidator>
                        </div>
                        <div class="form-group">
                            <asp:TextBox ID="txtCommentText" runat="server" TextMode="MultiLine" placeholder="Yorumunuzu yazın..." CssClass="form-control"></asp:TextBox>
                            <asp:RequiredFieldValidator ID="rfvComment" runat="server" ControlToValidate="txtCommentText"
                                ErrorMessage="Lütfen yorumunuzu girin" Display="Dynamic" CssClass="validation-error"
                                ValidationGroup="CommentGroup"></asp:RequiredFieldValidator>
                        </div>
                        <asp:Button ID="btnSubmitComment" runat="server" Text="Yorum Gönder" 
                            CssClass="comment-submit-btn" OnClick="btnSubmitComment_Click" ValidationGroup="CommentGroup" />
                    </asp:Panel>
                    
                    <!-- Giriş Yapma Hatırlatıcısı (Kullanıcı giriş yapmamışsa) -->
                    <asp:Panel ID="pnlLoginReminder" runat="server" Visible="false">
                        <div class="login-reminder">
                            <p>Yorum yapabilmek için <a href="login.aspx?returnUrl=<%=HttpUtility.UrlEncode(Request.Url.PathAndQuery)%>">giriş yapmalısınız</a>.</p>
                        </div>
                    </asp:Panel>
                    
                    <!-- Başarı Mesajı -->
                    <asp:Panel ID="pnlCommentSuccess" runat="server" CssClass="comment-success" Visible="false">
                        <i class="fas fa-check-circle"></i>
                        <p>Yorumunuz başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır. Teşekkür ederiz!</p>
                    </asp:Panel>
                </div>
            </div>
        </div>
        
        <!-- Hata Mesajları -->
        <asp:Panel ID="pnlError" runat="server" CssClass="error-message" Visible="false">
            <i class="fas fa-exclamation-circle"></i>
            <p id="errorText" runat="server">Blog yazısı bulunamadı veya bir hata oluştu.</p>
            <a href="default.aspx" class="back-button">Ana Sayfaya Dön</a>
        </asp:Panel>
    </div>
    
    <!-- SEO için yapısal veri işaretlemesi -->
    <div class="blog-structured-data" runat="server" id="structuredData"></div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="scripts" runat="server">
    <script>
        // Sayfa içeriğini güvenlik kontrolü
        function checkElements() {
            console.log("Beğeni butonu:", document.getElementById('likeBtn'));
            console.log("Beğeni ikonu:", document.getElementById('likeIcon'));
            console.log("Beğeni sayacı:", document.getElementById('likeCount'));
        }
        
        // Sayfa yüklendiğinde çalıştır
        window.addEventListener('load', checkElements);
        
        // Beğeni işlevselliği
        let liked = false;
        function toggleLike() {
            // Doğrudan elementlere erişim
            const likeBtn = document.getElementById('likeBtn');
            const likeIcon = document.getElementById('likeIcon');
            const likeCount = document.getElementById('likeCount');
            
            if (!likeBtn) {
                console.error('Beğeni butonu bulunamadı');
                return;
            }
            
            if (!likeIcon) {
                console.error('Beğeni ikonu bulunamadı');
                return;
            }
            
            if (!liked) {
                // Beğen
                liked = true;
                likeBtn.classList.add('liked');
                likeIcon.className = 'fas fa-heart'; // Doğrudan sınıfı değiştir
                
                // Beğeni sayısını arttır
                if (likeCount) {
                    let count = parseInt(likeCount.textContent || '0');
                    likeCount.textContent = count + 1;
                }
                
                // Lokal storage'a beğeniyi kaydet
                try {
                    const blogId = getUrlParameter('id');
                    if (blogId) {
                        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
                        if (!likedPosts.includes(blogId)) {
                            likedPosts.push(blogId);
                            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                        }
                    }
                } catch (e) {
                    console.error('Local storage erişimi sırasında hata oluştu:', e);
                }
            } else {
                // Beğeniyi kaldır
                liked = false;
                likeBtn.classList.remove('liked');
                likeIcon.className = 'far fa-heart'; // Doğrudan sınıfı değiştir
                
                // Beğeni sayısını azalt
                if (likeCount) {
                    let count = parseInt(likeCount.textContent || '0');
                    if (count > 0) {
                        likeCount.textContent = count - 1;
                    }
                }
                
                // Lokal storage'dan beğeniyi kaldır
                try {
                    const blogId = getUrlParameter('id');
                    if (blogId) {
                        let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
                        likedPosts = likedPosts.filter(id => id !== blogId);
                        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                    }
                } catch (e) {
                    console.error('Local storage erişimi sırasında hata oluştu:', e);
                }
            }
        }
        
        // URL parametrelerini alma işlevi
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }
        
        // Sayfa yüklendiğinde beğeni durumunu kontrol et ve diğer işlevleri başlat
        document.addEventListener('DOMContentLoaded', function() {
            const likeBtn = document.getElementById('likeBtn');
            const likeIcon = document.getElementById('likeIcon');
            
            if (!likeBtn || !likeIcon) {
                console.error('Beğeni butonu veya ikonu bulunamadı');
                return;
            }
            
            // Beğeni durumunu kontrol et
            try {
                const blogId = getUrlParameter('id');
                if (blogId) {
                    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
                    if (likedPosts.includes(blogId)) {
                        liked = true;
                        likeBtn.classList.add('liked');
                        likeIcon.className = 'fas fa-heart'; // Doğrudan sınıfı değiştir
                    }
                }
            } catch (e) {
                console.error('Local storage erişimi sırasında hata oluştu:', e);
            }
            
            // Okuma ilerleme çubuğunu kontrol etme
            const progressBar = document.getElementById('readingProgressBar');
            const content = document.querySelector('.blog-content');
            
            if (progressBar && content) {
                window.addEventListener('scroll', function() {
                    // İçerik elementinin konumunu al
                    const contentBox = content.getBoundingClientRect();
                    const contentTop = contentBox.top;
                    const contentHeight = contentBox.height;
                    
                    // Görüntü alanını al
                    const windowHeight = window.innerHeight;
                    
                    // İçerik görüntü alanına girmeden önce ilerleme 0
                    if (contentTop >= windowHeight) {
                        progressBar.style.width = '0%';
                        return;
                    }
                    
                    // İçerik tamamen görüntülendiğinde ilerleme 100%
                    if (contentTop + contentHeight <= 0) {
                        progressBar.style.width = '100%';
                        return;
                    }
                    
                    // İçeriğin görünen kısmını oran olarak hesapla
                    let visibleContent = 0;
                    
                    if (contentTop < 0) {
                        // İçerik yukarı doğru scroll edilmiş
                        visibleContent = Math.min(contentHeight, -contentTop);
                    } else {
                        // İçerik hala görüntü alanında
                        visibleContent = Math.min(contentHeight, windowHeight - contentTop);
                    }
                    
                    // İlerleme oranını hesapla ve progress bar'a uygula
                    const progress = (visibleContent / contentHeight) * 100;
                    progressBar.style.width = progress + '%';
                });
                
                // İlk sayfa yüklendiğinde ilerleme çubuğunu güncelle
                window.dispatchEvent(new Event('scroll'));
            }
            
            // Blog içeriğindeki görselleri Instagram/Reddit tarzı kapsayıcılara çevir
            const blogImages = content.querySelectorAll('img:not(.emoji)');
            blogImages.forEach(img => {
                // Zaten kapsayıcıda değilse (iç içe kapsayıcı olmaması için kontrol)
                if (img.parentNode.className !== 'image-container') {
                    // Orijinal src ve alt değerlerini al
                    const imgSrc = img.getAttribute('src');
                    const imgAlt = img.getAttribute('alt') || 'Blog görseli';
                    
                    // Kapsayıcı oluştur
                    const container = document.createElement('div');
                    container.className = 'image-container';
                    
                    // Yeni img elementi oluştur
                    const newImg = document.createElement('img');
                    newImg.src = imgSrc;
                    newImg.alt = imgAlt;
                    if (!newImg.hasAttribute('loading')) {
                        newImg.setAttribute('loading', 'lazy');
                    }
                    
                    // Tam ekran gösterme olayı
                    newImg.addEventListener('click', function() {
                        showFullscreenImage(imgSrc);
                    });
                    
                    // Kapsayıcıya resmi ekle
                    container.appendChild(newImg);
                    
                    // Orijinal resim yerine kapsayıcıyı ekle
                    img.parentNode.replaceChild(container, img);
                }
            });
            
            // Yorum sayısını göster
            const commentCountElement = document.getElementById('commentCount');
            const commentItems = document.querySelectorAll('.comment-item');
            if (commentCountElement && commentItems) {
                commentCountElement.textContent = commentItems.length;
            }
            
            // Blog içeriğindeki dış bağlantıları güvenli şekilde açma
            const externalLinks = document.querySelectorAll('.blog-content a[href^="http"]');
            externalLinks.forEach(link => {
                // Kendi domain'imiz değilse target="_blank" ve rel="noopener noreferrer" ekle
                const url = new URL(link.href);
                if (url.host !== window.location.host) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    
                    // Güvenli olmayan link uyarısı (isteğe bağlı)
                    if (url.protocol === 'http:') {
                        link.classList.add('insecure-link');
                        link.setAttribute('title', link.getAttribute('title') + ' - Güvenli olmayan bağlantı');
                    }
                }
            });
            
            // Tahmini okuma süresini hesaplama
            const blogReadTime = document.getElementById('blogReadTime');
            if (blogReadTime && content) {
                const text = content.textContent || content.innerText;
                const wordCount = text.trim().split(/\s+/).length;
                const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200)); // Ortalama okuma hızı: dakikada 200 kelime
                
                const metaTextElement = blogReadTime.querySelector('.meta-text');
                if (metaTextElement) {
                    metaTextElement.textContent = readingTimeMinutes + ' dk';
                    blogReadTime.style.display = 'inline-flex';
                }
            }
            
            // Meta açıklamayı otomatik olarak blogdan al
            const metaDesc = document.querySelector('meta[name="description"]');
            const blogTitle = document.getElementById('blogTitle');
            if (metaDesc && blogTitle && content) {
                const titleText = blogTitle.innerText || '';
                const contentText = content.innerText || '';
                const description = contentText.substring(0, 150).trim() + '...';
                metaDesc.setAttribute('content', titleText + ' - ' + description);
            }
            
            // Yapısal veri işaretlemesi (Schema.org) oluştur - SEO için önemli
            const structuredData = document.getElementById('structuredData');
            if (structuredData) {
                const blogTitle = document.getElementById('blogTitle');
                const blogContent = document.getElementById('blogContent');
                const blogAuthor = document.getElementById('blogAuthor');
                const blogDate = document.getElementById('blogDate');
                
                if (blogTitle && blogContent && blogAuthor && blogDate) {
                    // JSON-LD formatında schema.org veri işaretleme
                    const authorName = blogAuthor.querySelector('.meta-text').textContent.trim();
                    const dateText = blogDate.querySelector('.meta-text').textContent.trim();
                    const publishDate = new Date(dateText).toISOString();
                    
                    const schemaData = {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": blogTitle.innerText,
                        "datePublished": publishDate,
                        "dateModified": publishDate,
                        "author": {
                            "@type": "Person",
                            "name": authorName
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Blog Sitesi",
                            "logo": {
                                "@type": "ImageObject",
                                "url": window.location.origin + "/blogsite/assets/images/logo.png"
                            }
                        },
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": window.location.href
                        }
                    };
                    
                    // Kapak resmi varsa ekle
                    const firstImage = blogContent.querySelector('img');
                    if (firstImage && firstImage.src) {
                        schemaData.image = firstImage.src;
                    }
                    
                    structuredData.innerHTML = '<script type="application/ld+json">' + 
                        JSON.stringify(schemaData) + 
                        '<\/script>';
                }
            }
        });
        
        // Tam ekran resim gösterme fonksiyonu
        function showFullscreenImage(imgSrc) {
            const fullscreenContainer = document.querySelector('.fullscreen-image-container');
            const fullscreenImage = document.querySelector('.fullscreen-image');
            
            if (fullscreenContainer && fullscreenImage) {
                fullscreenImage.src = imgSrc;
                fullscreenContainer.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı engelle
            }
        }
        
        // Sosyal medya paylaşım fonksiyonları
        function shareOnFacebook() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.getElementById('blogTitle').innerText);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        }

        function shareOnTwitter() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.getElementById('blogTitle').innerText);
            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
        }

        function shareOnLinkedIn() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.getElementById('blogTitle').innerText);
            window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
        }

        function shareByEmail() {
            const url = window.location.href;
            const title = document.getElementById('blogTitle').innerText;
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Bu blog yazısını okumanı öneririm: ' + url)}`;
        }

        function copyLink() {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                const copyBtn = document.getElementById('copyLinkBtn');
                const originalHTML = copyBtn.innerHTML;
                
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                // Fallback için manuel kopyalama mekanizması
                const textArea = document.createElement('textarea');
                textArea.value = url;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        const copyBtn = document.getElementById('copyLinkBtn');
                        const originalHTML = copyBtn.innerHTML;
                        
                        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                        copyBtn.classList.add('copied');
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = originalHTML;
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Fallback kopyalama yöntemi de başarısız oldu:', err);
                }
                
                document.body.removeChild(textArea);
            });
        }
        
        // Yorum yanıtlama işlevselliği
        function showReplyForm(commentId) {
            // Tüm yanıt formlarını gizle
            document.querySelectorAll('.reply-form-container').forEach(form => {
                form.style.display = 'none';
            });
            
            // İlgili yanıt formunu göster
            const replyForm = document.getElementById('replyForm-' + commentId);
            if (replyForm) {
                replyForm.style.display = 'block';
                const textarea = replyForm.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                }
            }
        }
        
        function hideReplyForm(commentId) {
            const replyForm = document.getElementById('replyForm-' + commentId);
            if (replyForm) {
                replyForm.style.display = 'none';
                const textarea = replyForm.querySelector('textarea');
                if (textarea) {
                    textarea.value = '';
                }
            }
        }
        
        // Tüm yanıtla butonlarına olay dinleyici ekle
        document.addEventListener('DOMContentLoaded', function() {
            // Yanıtla butonları için
            document.querySelectorAll('.reply-button').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const commentId = this.getAttribute('data-commentid');
                    showReplyForm(commentId);
                });
            });
            
            // İptal butonları için
            document.querySelectorAll('.reply-cancel-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const commentId = this.getAttribute('data-commentid');
                    hideReplyForm(commentId);
                });
            });
        });
    </script>
</asp:Content> 