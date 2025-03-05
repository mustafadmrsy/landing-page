# Senirkent MYO Blog Sitesi

## Proje Hakkında
Bu proje, Senirkent Meslek Yüksekokulu için geliştirilmiş modern ve duyarlı (responsive) bir blog sitesidir. Site, öğrencilere ve öğretim görevlilerine içerik paylaşım platformu sağlar.

## Dosya Yapısı

```
blogsite/
│
├── css/                      # CSS dosyaları
│   ├── base/                 # Temel stil dosyaları
│   │   ├── reset.css         # Tarayıcı stillerini sıfırlama
│   │   ├── variables.css     # CSS değişkenleri
│   │   └── utils.css         # Yardımcı sınıflar
│   │
│   ├── components/           # Bileşen stilleri
│   │   ├── buttons.css       # Buton stilleri
│   │   ├── categories.css    # Kategori bileşenleri
│   │   ├── entry.css         # Blog yazı bileşenleri
│   │   ├── popup.css         # Popup bileşeni
│   │   ├── profile.css       # Profil menüsü
│   │   └── search.css        # Arama bileşeni
│   │
│   ├── layout/               # Düzen stilleri
│   │   ├── footer.css        # Alt bilgi (footer) stilleri
│   │   ├── main-layout.css   # Ana içerik düzeni
│   │   ├── responsive.css    # Duyarlı tasarım (responsive) stilleri
│   │   └── sidebar.css       # Kenar çubuğu (sidebar) stilleri
│   │
│   └── main.css              # Ana CSS dosyası (tüm CSS'leri içe aktarır)
│
├── js/                       # JavaScript dosyaları
│   ├── components/           # JavaScript bileşenleri
│   │   ├── popup.js          # Popup işlevselliği
│   │   └── sidebar.js        # Sidebar işlevselliği
│   │
│   ├── utils/                # Yardımcı JavaScript fonksiyonları
│   │   └── dom-utils.js      # DOM yardımcı fonksiyonları
│   │
│   └── main.js               # Ana JavaScript dosyası
│
├── assets/                   # Statik dosyalar
│   ├── images/               # Görseller
│   └── fonts/                # Fontlar
│
├── index.html                # Ana sayfa
└── kategoriler.html          # Kategoriler sayfası
```

## Özellikler

- **Modern CSS Yapısı**: BEM metodolojisi ve CSS değişkenleri kullanılarak oluşturulmuş modüler CSS yapısı
- **Duyarlı Tasarım**: Mobil cihazlardan masaüstü ekranlara kadar tüm cihazlarda sorunsuz çalışan arayüz
- **Modüler JavaScript**: Bileşen tabanlı JavaScript yapısı
- **Özelleştirilebilir**: Kolay tema değişimi ve özelleştirme imkanı
- **Performans Odaklı**: Lazy loading ve optimizasyon teknikleri
- **Sidebar İşlevselliği**: Hem masaüstü hem de mobil cihazlarda optimize edilmiş sidebar

## Kullanım

1. Ana CSS dosyası olan `css/main.css` dosyasını HTML belgenizde çağırın:
```html
<link rel="stylesheet" href="/css/main.css">
```

2. Ana JavaScript dosyasını HTML belgenizin sonunda çağırın:
```html
<script src="/js/main.js" type="module"></script>
```

3. Gereken HTML yapısını kurun (index.html ve kategoriler.html dosyalarından referans alabilirsiniz).

## Geliştiriciler

- Mustafa Demirsoy

## Lisans

Bu proje özel lisans altında dağıtılmaktadır. Tüm hakları saklıdır.
