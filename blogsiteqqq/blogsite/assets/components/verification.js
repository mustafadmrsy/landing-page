/**
 * E-posta Doğrulama Modülü - Senirkent Blog
 * E-posta doğrulama işlemleri burada yapılır
 */

// Özel kimlikler için yardımcı fonksiyon
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// E-posta doğrulama token'ı oluştur
function generateVerificationToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
}

// E-posta doğrulama sistemi için gerekli fonksiyonlar
// Local storage anahtar adları
const SNK_USERS_KEY = 'snk_users';
const SNK_PENDING_USERS_KEY = 'snk_pending_users';
const SNK_CURRENT_USER_KEY = 'snk_current_user';

// API endpointleri
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * E-posta doğrulama token'ı oluştur
 * @returns {string} Oluşturulan token
 */
function snk_verification_generateToken() {
    // Basit bir token oluştur
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

/**
 * İsparta Meslek Yüksekokulu e-posta kontrolü
 * Sadece ol ile başlayan ve @isparta.edu.tr uzantılı e-postalar kabul edilir 
 * @param {string} email - Kontrol edilecek e-posta adresi
 * @returns {boolean} E-posta geçerli mi?
 */
function snk_verification_isValidEmail(email) {
    // ol2413615008@isparta.edu.tr benzeri e-postalar
    const regex = /^ol\d{10}@isparta\.edu\.tr$/;
    return regex.test(email);
}

/**
 * E-posta formatını doğrular
 * @param {string} email - Kontrol edilecek e-posta
 * @returns {boolean} - E-posta formatı geçerli mi
 */
function snk_verification_isValidEmailFormat(email) {
    // isparta.edu.tr formatında e-posta kontrolü (örn: ol2413615008@isparta.edu.tr)
    const regex = /^ol\d{10}@isparta\.edu\.tr$/;
    return regex.test(email);
}

/**
 * Doğrulama e-postası gönder
 * @param {Object} userData - Kullanıcı bilgileri
 * @returns {Object} İşlem sonucu
 */
function snk_verification_sendVerificationEmail(userData) {
    if (!userData || !userData.email) {
        console.error('Geçersiz kullanıcı verisi');
        return { success: false, message: 'Geçersiz kullanıcı verisi.' };
    }

    // E-posta formatını kontrol et
    if (!snk_verification_isValidEmailFormat(userData.email)) {
        return { success: false, message: 'Geçersiz e-posta formatı. Sadece isparta.edu.tr uzantılı e-postalar kabul edilmektedir.' };
    }

    try {
        // Token oluştur
        const verificationToken = snk_verification_generateToken();

        // API'ye gönderilecek veri
        const payload = {
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
            verificationToken: verificationToken
        };

        

        // Kullanıcı daha önce eklenmiş mi kontrol et
        const existingUserIndex = pendingUsers.findIndex(user => user.email === userData.email);

        if (existingUserIndex !== -1) {
            // Kullanıcıyı güncelle
            pendingUsers[existingUserIndex] = {
                ...userData,
                verificationToken
            };
        } else {
            // Yeni kullanıcı ekle
            pendingUsers.push({
                ...userData,
                verificationToken
            });
        }

        

        
        return {
            success: true,
            message: 'Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin.'
        };

    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        return { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' };
    }
}

/**
 * E-posta doğrulama e-postası gönderir
 * Bu fonksiyon gerçek bir e-posta göndermek yerine, doğrulama sürecini simüle eder
 * 
 * @param {Object} userData - Kullanıcı verileri 
 * @returns {Object} - İşlem sonucu
 */
function snk_verification_sendVerificationEmailSimulation(userData) {
    console.log('Doğrulama e-postası gönderme isteği:', userData.email);

    // E-posta format kontrolü
    if (!snk_verification_isValidEmailFormat(userData.email)) {
        return {
            success: false,
            message: 'Geçersiz e-posta formatı. Sadece isparta.edu.tr uzantılı e-postalar kabul edilmektedir.'
        };
    }

    // Doğrulama token'ı oluştur
    const verificationToken = generateVerificationToken();
    const userId = generateUniqueId();

    // Kullanıcı verilerini hazırla
    const pendingUser = {
        id: userId,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        password: userData.password, // Gerçekte şifrelenmiş olmalı
        verificationToken: verificationToken,
        isVerified: false,
        createdAt: new Date().toISOString()
    };

    // Bekleyen kullanıcıları localStorage'dan al
    

    // Kullanıcı zaten beklemede mi kontrol et
    const existingUserIndex = pendingUsers.findIndex(user => user.email === userData.email);

    if (existingUserIndex !== -1) {
        // Kullanıcıyı güncelle
        pendingUsers[existingUserIndex] = {
            ...pendingUsers[existingUserIndex],
            ...pendingUser
        };
    } else {
        // Yeni kullanıcı ekle
        pendingUsers.push(pendingUser);
    }

    // Güncellenmiş listeyi kaydet

    // Doğrulama URL'i oluştur (gerçekte backend tarafından işlenecek)
    const verificationUrl = `verify.html?token=${verificationToken}&email=${encodeURIComponent(userData.email)}`;

    // Doğrulama detaylarını konsola yaz (gerçek uygulamada e-posta gönderilir)
    console.log('Admin e-posta adresi:', 'mustafadmrsy125@gmail.com');
    console.log('Doğrulama URL:', verificationUrl);
    console.log('Doğrulama token:', verificationToken);

    // E-postanın gönderildiğini simüle et
    return {
        success: true,
        message: 'Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin.',
        // Gerçek uygulamada bu bilgiler kullanıcıya sunulmaz, sadece geliştirme amaçlıdır
        debug: {
            token: verificationToken,
            url: verificationUrl
        }
    };
}

/**
 * E-posta doğrulama işlemini gerçekleştirir
 * 
 * @param {string} token - Doğrulama token'ı
 * @param {string} email - Kullanıcı e-postası
 * @returns {Object} - İşlem sonucu
 */
function snk_verification_verifyEmail(token, email) {
    console.log('E-posta doğrulama isteği:', email, token);

   
    // Token ve e-posta ile eşleşen kullanıcıyı bul
    const userIndex = pendingUsers.findIndex(
        user => user.email === email && user.verificationToken === token
    );

    if (userIndex === -1) {
        return {
            success: false,
            message: 'Geçersiz doğrulama bilgileri veya süre dolmuş.'
        };
    }

    // Kullanıcıyı al ve doğrulanmış kullanıcılar listesine ekle
    const verifiedUser = { ...pendingUsers[userIndex] };
    delete verifiedUser.verificationToken; // Token'ı kaldır
    verifiedUser.isVerified = true;
    verifiedUser.verifiedAt = new Date().toISOString();

    

    // Kullanıcı zaten var mı kontrol et
    const existingUserIndex = users.findIndex(user => user.email === email);

    if (existingUserIndex !== -1) {
        // Mevcut kullanıcıyı güncelle
        users[existingUserIndex] = {
            ...users[existingUserIndex],
            ...verifiedUser
        };
    } else {
        // Yeni kullanıcı ekle
        users.push(verifiedUser);
    }

    

    
    return {
        success: true,
        message: 'E-posta başarıyla doğrulandı!',
        user: {
            name: verifiedUser.name,
            email: verifiedUser.email
        }
    };
}

/**
 * E-posta doğrulama işlemi
 * @param {string} token - Doğrulama token'ı
 * @param {string} email - Doğrulanacak e-posta
 * @returns {Object} İşlem sonucu ve kullanıcı bilgisi
 */
function snk_verification_verifyEmail(token, email) {
    if (!token || !email) {
        return { success: false, message: 'Geçersiz doğrulama bilgileri.' };
    }

   
}

/**
 * Kullanıcı doğrulanmış mı kontrol et
 * @param {string} email - Kontrol edilecek e-posta
 * @returns {boolean} Kullanıcı doğrulanmış mı?
 */
function snk_verification_isUserVerified(email) {
    if (!email) return false;

   
}

/**
 * Kullanıcı kayıt bekliyor mu kontrol et
 * @param {string} email - Kontrol edilecek e-posta
 * @returns {boolean} Kullanıcı kayıt bekliyor mu?
 */
function snk_verification_isPendingVerification(email) {
    if (!email) return false;
}

// Modül dışa aktarma
window.snk_verification_isValidEmail = snk_verification_isValidEmail;
window.snk_verification_sendVerificationEmail = snk_verification_sendVerificationEmail;
window.snk_verification_sendVerificationEmailSimulation = snk_verification_sendVerificationEmailSimulation;
window.snk_verification_verifyEmail = snk_verification_verifyEmail;
window.snk_verification_isUserVerified = snk_verification_isUserVerified;
window.snk_verification_isPendingVerification = snk_verification_isPendingVerification;
