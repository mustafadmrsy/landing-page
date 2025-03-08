const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Statik dosyaları servis et
app.use(express.static(path.join(__dirname, '..')));

// Doğrulama bekleyen kullanıcılar listesi (gerçek uygulamada veritabanında saklanmalı)
const pendingUsers = {};
const verifiedUsers = [];

// Sunucu başladığında örnek kullanıcı ekleme (test amaçlı)
// Bu, sunucuyu her başlattığımızda pendingUsers'ın boş olmamasını sağlar
pendingUsers['test@isparta.edu.tr'] = {
    name: 'Test',
    surname: 'Kullanıcı',
    email: 'test@isparta.edu.tr',
    password: 'test123',
    verificationCode: '123456',
    registrationDate: new Date(),
    createdAt: new Date()
};

console.log('Test kullanıcısı eklendi:', pendingUsers['test@isparta.edu.tr']);

// Öğrenci e-posta formatı kontrolü - ol... veya o... ile başlayan @isparta.edu.tr e-postaları
function isValidStudentEmail(email) {
    // Admin e-postası (özel durum)
    if (email === 'mustafadmrsy125@gmail.com') {
        return true;
    }
    
    // Öğrenci e-postası kontrolü
    const isparta_pattern = /^(ol|o)\d+@isparta\.edu\.tr$/i;
    return isparta_pattern.test(email);
}

// Kullanıcı kaydı endpoint'i
app.post('/api/register', (req, res) => {
    const { name, surname, email, password } = req.body;
    
    console.log('YENİ KAYIT İSTEĞİ:', { name, surname, email });
    
    // Eksik bilgi kontrolü
    if (!name || !surname || !email || !password) {
        console.log('KAYIT HATASI: Eksik bilgi');
        return res.status(400).json({
            success: false,
            message: 'Eksik bilgi. Ad, soyad, e-posta ve şifre gerekli.'
        });
    }
    
    // E-posta formatı kontrolü
    if (!isValidStudentEmail(email)) {
        console.log('KAYIT HATASI: Geçersiz e-posta formatı', email);
        return res.status(400).json({
            success: false,
            message: 'Geçersiz e-posta formatı. Sadece ISUBU öğrenci e-postaları (ol... veya o... ile başlayan @isparta.edu.tr uzantılı) kabul edilir.'
        });
    }
    
    // E-posta zaten kullanılıyor mu?
    const isEmailTaken = verifiedUsers.some(user => user.email === email) || 
                        Object.values(pendingUsers).some(user => user.email === email);
    
    if (isEmailTaken) {
        console.log('KAYIT HATASI: E-posta zaten kullanılıyor', email);
        return res.status(400).json({
            success: false,
            message: 'Bu e-posta adresi zaten kullanılıyor.'
        });
    }
    
    try {
        // 6 haneli doğrulama kodu oluştur
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Kullanıcıyı "doğrulama bekliyor" durumunda sakla
        pendingUsers[email] = {
            name,
            surname,
            email,
            password, // Gerçek uygulamada şifre hash'lenmeli!
            verificationCode,
            registrationDate: new Date(), // Admin panelinde görüntülenecek tarih
            createdAt: new Date()
        };
        
        console.log('YENİ KULLANICI EKLENDİ - pendingUsers:', pendingUsers);
        console.log('Bekleyen kullanıcı sayısı:', Object.keys(pendingUsers).length);
        console.log('Bekleyen kullanıcı e-postaları:', Object.keys(pendingUsers));
        
        // Admin'e bildirim gönder (gerçek uygulamada e-posta gönderimi yapılabilir)
        console.log('\n==================================================');
        console.log('YENİ KULLANICI KAYDI - ADMİN BİLDİRİMİ');
        console.log('==================================================');
        console.log(`İsim: ${name} ${surname}`);
        console.log(`E-posta: ${email}`);
        console.log(`Doğrulama Kodu: ${verificationCode}`);
        console.log(`Kayıt Tarihi: ${new Date().toLocaleString('tr-TR')}`);
        console.log('==================================================\n');
        
        // Kullanıcıya başarılı yanıt dön
        return res.status(200).json({
            success: true,
            message: 'Kayıt başarılı! Hesabınızı aktifleştirmek için doğrulama kodunu giriniz.',
            email: email,
            requiresVerification: true
        });
        
    } catch (error) {
        console.error('Kayıt hatası:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Kayıt işlemi sırasında bir hata oluştu.',
            error: error.message
        });
    }
});

// E-posta doğrulama endpoint'i
app.post('/api/verify-email', (req, res) => {
    const { email, verificationCode } = req.body;
    
    // Eksik bilgi kontrolü
    if (!email || !verificationCode) {
        return res.status(400).json({
            success: false,
            message: 'Eksik bilgi. E-posta ve doğrulama kodu gerekli.'
        });
    }
    
    // E-posta kayıtlı mı kontrol et
    if (!pendingUsers[email]) {
        return res.status(404).json({
            success: false,
            message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı veya hesap zaten doğrulanmış.'
        });
    }
    
    // Doğrulama kodu doğru mu kontrol et
    if (pendingUsers[email].verificationCode !== verificationCode) {
        return res.status(400).json({
            success: false,
            message: 'Geçersiz doğrulama kodu. Lütfen tekrar deneyiniz.'
        });
    }
    
    // Kullanıcıyı doğrulanmış olarak işaretle
    const verifiedUser = {
        ...pendingUsers[email],
        verifiedAt: new Date(),
        isActive: true
    };
    
    delete verifiedUser.verificationCode; // Doğrulama kodunu sil
    
    // Doğrulanmış kullanıcılar listesine ekle
    verifiedUsers.push(verifiedUser);
    
    // Bekleyen kullanıcı listesinden kaldır
    delete pendingUsers[email];
    
    // Başarılı yanıt dön
    return res.status(200).json({
        success: true,
        message: 'E-posta adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.',
        user: {
            name: verifiedUser.name,
            surname: verifiedUser.surname,
            email: verifiedUser.email
        }
    });
});

// Giriş endpoint'i
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // Eksik bilgi kontrolü
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Eksik bilgi. E-posta ve şifre gerekli.'
        });
    }
    
    // Kullanıcıyı bul
    const user = verifiedUsers.find(u => u.email === email);
    
    // Kullanıcı bulunamadı veya şifre yanlış
    if (!user || user.password !== password) { // Gerçek uygulamada hash karşılaştırması yapılmalı
        return res.status(401).json({
            success: false,
            message: 'Geçersiz e-posta veya şifre.'
        });
    }
    
    // Başarılı giriş
    return res.status(200).json({
        success: true,
        message: 'Giriş başarılı!',
        user: {
            name: user.name,
            surname: user.surname,
            email: user.email
        }
    });
});

// Doğrulama kodu yeniden gönderme (opsiyonel)
app.post('/api/resend-verification', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'E-posta adresi gerekli.'
        });
    }
    
    // E-posta kayıtlı mı kontrol et
    if (!pendingUsers[email]) {
        return res.status(404).json({
            success: false,
            message: 'Bu e-posta adresi ile kayıtlı bekleyen bir kullanıcı bulunamadı.'
        });
    }
    
    // Yeni doğrulama kodu oluştur
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUsers[email].verificationCode = newVerificationCode;
    
    // Admin'e bildirim gönder (gerçek uygulamada e-posta gönderimi yapılabilir)
    console.log('\n==================================================');
    console.log('DOĞRULAMA KODU YENİDEN GÖNDERİLDİ - ADMİN BİLDİRİMİ');
    console.log('==================================================');
    console.log(`İsim: ${pendingUsers[email].name} ${pendingUsers[email].surname}`);
    console.log(`E-posta: ${email}`);
    console.log(`Yeni Doğrulama Kodu: ${newVerificationCode}`);
    console.log(`Yeniden Gönderim Tarihi: ${new Date().toLocaleString('tr-TR')}`);
    console.log('==================================================\n');
    
    return res.status(200).json({
        success: true,
        message: 'Yeni doğrulama kodu oluşturuldu. Lütfen admin ile iletişime geçiniz.'
    });
});

// Admin için kullanıcı listesi (gerçek uygulamada yetki kontrolü eklenmeli)
app.get('/api/admin/users', (req, res) => {
    console.log('Admin paneli için kullanıcı listesi istendi');
    console.log('Bekleyen kullanıcılar:', Object.keys(pendingUsers).length);
    console.log('Bekleyen kullanıcı e-postaları:', Object.keys(pendingUsers));
    console.log('pendingUsers içeriği:', JSON.stringify(pendingUsers, null, 2));
    console.log('Onaylanmış kullanıcılar:', verifiedUsers.length);

    return res.status(200).json({
        pendingUsers: Object.values(pendingUsers),
        verifiedUsers: verifiedUsers
    });
});

// Kullanıcı reddetme (silme) endpoint'i
app.post('/api/admin/reject-user', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'E-posta adresi gerekli.'
        });
    }
    
    // Kullanıcı onay bekleyenler listesinde mi?
    if (!pendingUsers[email]) {
        return res.status(404).json({
            success: false,
            message: 'Bu e-posta adresiyle kayıtlı bekleyen bir kullanıcı bulunamadı.'
        });
    }
    
    // Kullanıcıyı onay bekleyenler listesinden çıkar
    const rejectedUser = pendingUsers[email];
    delete pendingUsers[email];
    
    console.log('\n==================================================');
    console.log('KULLANICI REDDEDİLDİ - ADMİN BİLDİRİMİ');
    console.log('==================================================');
    console.log(`İsim: ${rejectedUser.name} ${rejectedUser.surname}`);
    console.log(`E-posta: ${rejectedUser.email}`);
    console.log(`Red Tarihi: ${new Date().toLocaleString('tr-TR')}`);
    console.log('==================================================\n');
    
    return res.status(200).json({
        success: true,
        message: 'Kullanıcı başarıyla reddedildi.'
    });
});

// Ana sayfa ve diğer rotalar için
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
    console.log('Doğrulama kodu sistemi aktif.');
    console.log('Yeni kayıtlar için doğrulama kodu konsolda görüntülenecektir.');
});
