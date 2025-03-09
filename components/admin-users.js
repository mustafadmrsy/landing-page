/**
 * Admin Users Management - Senirkent Blog
 * Bu dosya admin panelindeki kullanıcı yönetimi işlemlerini yönetir.
 */

// DOM Elements - Kullanıcı container'ları
const pendingUsersContainer = document.getElementById('pending-users');
const verifiedUsersContainer = document.getElementById('verified-users');
const registeredUsersContainer = document.getElementById('registered-users');

// Loader Elements
const pendingLoader = document.getElementById('pending-loader');
const verifiedLoader = document.getElementById('verified-loader');
const registeredLoader = document.getElementById('registered-loader');

// Modal Elements
const confirmModal = document.getElementById('confirm-modal');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmProceed = document.getElementById('confirm-proceed');
const pendingApprovalModal = document.getElementById('pending-approval-modal');
const pendingApprovalOk = document.getElementById('pending-approval-ok');
const alertBox = document.getElementById('alert-box');

// Geçici veri tutacağımız değişken
let userToReject = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin kullanıcı yönetimi başlatıldı');
    initUserManagement();
});

// Kullanıcı yönetimi başlat
function initUserManagement() {
    // DOM elementleri kontrol et
    if (!pendingUsersContainer) console.error('pendingUsersContainer bulunamadı');
    if (!verifiedUsersContainer) console.error('verifiedUsersContainer bulunamadı');
    if (!registeredUsersContainer) console.error('registeredUsersContainer bulunamadı');
    
    // Event listeners
    document.getElementById('refresh-button').addEventListener('click', loadUsers);
    
    // Yerel kullanıcıları görüntüleme butonu
    const viewLocalUsersButton = document.getElementById('view-local-users-button');
    if (viewLocalUsersButton) {
        viewLocalUsersButton.addEventListener('click', showLocalUsers);
    } else {
        console.error('view-local-users-button bulunamadı');
    }
    
    confirmCancel.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        userToReject = null;
    });
    
    confirmProceed.addEventListener('click', () => {
        if (userToReject) {
            rejectUser(userToReject);
            confirmModal.style.display = 'none';
            userToReject = null;
        }
    });
    
    // Kullanıcıları yükle
    loadUsers();
}

// Kullanıcıları yükle - Sadece yerel depo kullanarak
function loadUsers() {
    showLoaders(true);
    
    try {
        console.log('Kullanıcı yükleme işlemi başlatıldı');
        
        // Bekleyen kullanıcıları al
        const pendingUsers = JSON.parse(localStorage.getItem('snk_pendingUsers') || '[]');
        console.log('Bekleyen kullanıcı verileri:', pendingUsers);
        
        // Onaylanmış kullanıcıları al
        const verifiedUsers = JSON.parse(localStorage.getItem('snk_verifiedUsers') || '[]');
        console.log('Onaylanmış kullanıcı verileri:', verifiedUsers);
        
        // Bekleyen kullanıcılar (onay bekleyenler)
        if (pendingUsersContainer) {
            if (pendingUsers && pendingUsers.length > 0) {
                displayUsers('pending-users', pendingUsers, true);
            } else {
                pendingUsersContainer.innerHTML = '<div class="no-users">Bekleyen kullanıcı bulunmamaktadır.</div>';
            }
        }
        
        // Onaylanmış kullanıcılar
        if (verifiedUsersContainer) {
            if (verifiedUsers && verifiedUsers.length > 0) {
                displayUsers('verified-users', verifiedUsers, false);
            } else {
                verifiedUsersContainer.innerHTML = '<div class="no-users">Onaylanmış kullanıcı bulunmamaktadır.</div>';
            }
        }
        
        // Kayıtlı kullanıcılar (onaylanmış kullanıcılarla aynı)
        if (registeredUsersContainer) {
            if (verifiedUsers && verifiedUsers.length > 0) {
                displayUsers('registered-users', verifiedUsers, false, true);
            } else {
                registeredUsersContainer.innerHTML = '<div class="no-users">Kayıtlı kullanıcı bulunmamaktadır.</div>';
            }
        }
        
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        if (pendingUsersContainer) pendingUsersContainer.innerHTML = '<div class="no-users">Kullanıcıları yüklerken bir hata oluştu.</div>';
        if (verifiedUsersContainer) verifiedUsersContainer.innerHTML = '<div class="no-users">Kullanıcıları yüklerken bir hata oluştu.</div>';
        if (registeredUsersContainer) registeredUsersContainer.innerHTML = '<div class="no-users">Kullanıcıları yüklerken bir hata oluştu.</div>';
    } finally {
        showLoaders(false);
    }
}

// Kullanıcıları görüntüle
function displayUsers(containerId, users, isPending, isRegistered = false) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container bulunamadı: #${containerId}`);
        return;
    }
    
    if (!users || users.length === 0) {
        container.innerHTML = '<div class="no-users">Kullanıcı bulunamadı.</div>';
        return;
    }
    
    let html = '';
    
    users.forEach(user => {
        // Tarih bilgisi kontrol
        let dateDisplay = '';
        if (user.registrationDate) {
            dateDisplay = formatDate(user.registrationDate);
        } else if (user.createdAt) {
            dateDisplay = formatDate(user.createdAt);
        } else {
            dateDisplay = 'Tarih bilgisi yok';
        }
        
        // Durum gösterimi
        let statusDisplay = '';
        if (user.pendingApproval === true) {
            statusDisplay = '<div class="status-badge pending">Onay Bekliyor</div>';
        } else if (user.isVerified === true) {
            statusDisplay = '<div class="status-badge verified">Onaylanmış</div>';
        } else if (isRegistered) {
            statusDisplay = '<div class="status-badge active">Kayıtlı Kullanıcı</div>';
        }
        
        html += `
        <div class="user-card">
            <div class="user-info">
                <div class="user-name">${user.name || ''} ${user.surname || ''}</div>
                <div class="user-email">${user.email || 'Email yok'}</div>
                <div class="user-password">Şifre: ${user.password || 'Belirtilmemiş'}</div>
                <div class="user-date">Kayıt: ${dateDisplay}</div>
                ${statusDisplay}
            </div>
            <div class="action-buttons">
                ${isPending ? `
                    <button class="action-button approve-btn" onclick="approveUser('${user.email}')">Onayla</button>
                    <button class="action-button reject-btn" onclick="showRejectConfirm('${user.email}')">Reddet</button>
                ` : `
                    <button class="action-button reject-btn" onclick="removeLocalUser('${user.email}')">Sil</button>
                `}
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`${containerId} paneline ${users.length} kullanıcı yüklendi`);
}

// Yükleyicileri göster/gizle
function showLoaders(show) {
    if (pendingLoader) pendingLoader.style.display = show ? 'block' : 'none';
    if (verifiedLoader) verifiedLoader.style.display = show ? 'block' : 'none';
    if (registeredLoader) registeredLoader.style.display = show ? 'block' : 'none';
}

// Yardımcı fonksiyonlar
// Tarih formatını okunaklı hale getir
function formatDate(dateString) {
    if (!dateString) return 'Belirtilmemiş';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Geçersiz Tarih';
        
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Tarih formatı hatası:', e);
        return 'Hatalı Tarih';
    }
}

// Onay bekleme ekranını göster
function showPendingApproval() {
    if (pendingApprovalModal) {
        pendingApprovalModal.style.display = 'flex';
    }
}

// Reddetme onayını göster
function showRejectConfirm(email) {
    userToReject = email;
    if (confirmModal) {
        confirmModal.style.display = 'flex';
    }
}

// Kullanıcıyı reddet - Yerel depodan silme işlemi
async function rejectUser(email) {
    try {
        console.log('Kullanıcı reddediliyor:', email);
        
        // Yerel depodan kullanıcıyı sil
        const users = JSON.parse(localStorage.getItem('snk_pendingUsers') || '[]');
        const userIndex = users.findIndex(user => user.email === email);
        
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            localStorage.setItem('snk_pendingUsers', JSON.stringify(users));
            
            showAlert('Başarılı', 'Kullanıcı başarıyla reddedildi.', 'success');
            loadUsers(); // Kullanıcı listesini yenile
        } else {
            showAlert('Hata', 'Kullanıcı bulunamadı.', 'error');
        }
    } catch (error) {
        console.error('Kullanıcı reddedilirken hata:', error);
        showAlert('Hata', 'Kullanıcı reddedilirken bir hata oluştu: ' + error.message, 'error');
    }
}

// Kullanıcıyı onayla
async function approveUser(email) {
    try {
        console.log('Kullanıcı onaylanıyor:', email);
        
        // Onay bekleyen kullanıcıları al
        const pendingUsers = JSON.parse(localStorage.getItem('snk_pendingUsers') || '[]');
        const userIndex = pendingUsers.findIndex(user => user.email === email);
        
        if (userIndex === -1) {
            showAlert('Hata', 'Onaylanacak kullanıcı bulunamadı.', 'error');
            return;
        }
        
        // Kullanıcıyı bulundu, onaylanmış kullanıcılar listesine ekle
        const user = pendingUsers[userIndex];
        user.isVerified = true;
        user.pendingApproval = false;
        user.approvedAt = new Date().toISOString();
        
        // Onaylanmış kullanıcılar listesini al ve güncelle
        const verifiedUsers = JSON.parse(localStorage.getItem('snk_verifiedUsers') || '[]');
        
        // E-posta kontrolü yap, varsa güncelle, yoksa ekle
        const existingIndex = verifiedUsers.findIndex(u => u.email === email);
        if (existingIndex !== -1) {
            verifiedUsers[existingIndex] = user;
        } else {
            verifiedUsers.push(user);
        }
        
        // Onaylanmış kullanıcıları kaydet
        localStorage.setItem('snk_verifiedUsers', JSON.stringify(verifiedUsers));
        
        // Ayrıca snk_users listesine de ekle - oturum açma işlemi için
        const users = JSON.parse(localStorage.getItem('snk_users') || '[]');
        const userInUsersIndex = users.findIndex(u => u.email === email);
        if (userInUsersIndex !== -1) {
            users[userInUsersIndex] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem('snk_users', JSON.stringify(users));
        
        // Kullanıcıyı bekleyenler listesinden çıkar
        pendingUsers.splice(userIndex, 1);
        localStorage.setItem('snk_pendingUsers', JSON.stringify(pendingUsers));
        
        // UI güncelle
        showAlert('Başarılı', 'Kullanıcı başarıyla onaylandı.', 'success');
        
        // Kullanıcı listesini yenile
        loadUsers();
        
    } catch (error) {
        console.error('Kullanıcı onaylanırken hata:', error);
        showAlert('Hata', 'Kullanıcı onaylanırken bir hata oluştu: ' + error.message, 'error');
    }
}

// Bildirim göster
function showAlert(title, message, type) {
    if (!alertBox) {
        console.error('Alert box bulunamadı');
        alert(`${title}: ${message}`);
        return;
    }
    
    alertBox.querySelector('.alert-title').textContent = title;
    alertBox.querySelector('.alert-message').textContent = message;
    
    alertBox.className = `alert-box ${type}`;
    alertBox.style.display = 'block';
    
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// Yerel kullanıcıyı sil
function removeLocalUser(email) {
    try {
        // Onaylanmış kullanıcıları al
        const verifiedUsers = JSON.parse(localStorage.getItem('snk_verifiedUsers') || '[]');
        const userIndex = verifiedUsers.findIndex(user => user.email === email);
        
        if (userIndex !== -1) {
            const removedUser = verifiedUsers[userIndex];
            verifiedUsers.splice(userIndex, 1);
            localStorage.setItem('snk_verifiedUsers', JSON.stringify(verifiedUsers));
            
            // Aynı zamanda snk_users listesinden de çıkar
            const users = JSON.parse(localStorage.getItem('snk_users') || '[]');
            const userUsersIndex = users.findIndex(user => user.email === email);
            
            if (userUsersIndex !== -1) {
                users.splice(userUsersIndex, 1);
                localStorage.setItem('snk_users', JSON.stringify(users));
            }
            
            // Eğer silinen kullanıcı şu anda oturum açmışsa oturumu kapat
            const currentUser = JSON.parse(localStorage.getItem('snk_currentUser') || '{}');
            if (currentUser && currentUser.email === email) {
                localStorage.removeItem('snk_currentUser');
                console.log('Silinen kullanıcı aktif oturumu olduğu için, oturum bilgileri temizlendi');
            }
            
            showAlert('Başarılı', 'Kullanıcı başarıyla silindi.', 'success');
            loadUsers(); // Kullanıcı listesini yenile
        } else {
            showAlert('Hata', 'Silinecek kullanıcı bulunamadı.', 'error');
        }
    } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        showAlert('Hata', 'Kullanıcı silinirken bir hata oluştu: ' + error.message, 'error');
    }
}

// Yerel kayıtlı kullanıcıları göster
function showLocalUsers() {
    console.log('Yerel kullanıcılar görüntüleniyor...');
    
    const localUsersModal = document.getElementById('local-users-modal');
    const localUsersContainer = document.getElementById('local-users-container');
    
    if (!localUsersModal || !localUsersContainer) {
        console.error('local-users-modal veya local-users-container bulunamadı');
        showAlert('Hata', 'Yerel kullanıcılar görüntülenemiyor: UI elementleri bulunamadı', 'error');
        return;
    }
    
    // Tüm localStorage'dan kullanıcıları al
    const users = JSON.parse(localStorage.getItem('snk_users') || '[]');
    const verifiedUsers = JSON.parse(localStorage.getItem('snk_verifiedUsers') || '[]');
    const pendingUsers = JSON.parse(localStorage.getItem('snk_pendingUsers') || '[]');
    
    // Tüm kullanıcıları birleştir
    const allUsers = [
        ...users.map(user => ({...user, source: 'snk_users'})),
        ...verifiedUsers.map(user => ({...user, source: 'snk_verifiedUsers'})),
        ...pendingUsers.map(user => ({...user, source: 'snk_pendingUsers'}))
    ];
    
    // E-posta adresine göre benzersiz kullanıcıları filtrele
    const uniqueEmails = new Set();
    const uniqueUsers = allUsers.filter(user => {
        if (!user.email || uniqueEmails.has(user.email)) return false;
        uniqueEmails.add(user.email);
        return true;
    });
    
    let html = '';
    
    if (uniqueUsers.length === 0) {
        html = '<div class="no-users">Yerel kayıtlı kullanıcı bulunmamaktadır.</div>';
    } else {
        html = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
        html += '<thead><tr style="background-color: #f2f2f2; text-align: left;">';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">Ad</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">Soyad</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">E-posta</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">Şifre</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">Durum</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">Kayıt Tarihi</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">Kaynak</th>';
        html += '<th style="padding: 10px; border: 1px solid #ddd;">İşlemler</th>';
        html += '</tr></thead><tbody>';
        
        uniqueUsers.forEach((user) => {
            // Durum belirleme
            let statusText = 'Belirsiz';
            let statusColor = '#888';
            
            if (user.pendingApproval) {
                statusText = 'Onay Bekliyor';
                statusColor = '#f39c12';
            } else if (user.isVerified) {
                statusText = 'Onaylanmış';
                statusColor = '#27ae60';
            } else if (user.source === 'snk_users') {
                statusText = 'Kayıtlı';
                statusColor = '#3498db';
            }
            
            // Tarih formatı
            const dateDisplay = user.createdAt ? formatDate(user.createdAt) : 
                               (user.registrationDate ? formatDate(user.registrationDate) : 'Belirtilmemiş');
            
            html += `<tr style="border-bottom: 1px solid #ddd;">`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;">${user.name || '-'}</td>`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;">${user.surname || '-'}</td>`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;">${user.email || '-'}</td>`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;">${user.password || '-'}</td>`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;"><span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></td>`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;">${dateDisplay}</td>`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;">${user.source}</td>`;
            html += `<td style="padding: 10px; border: 1px solid #ddd;">
                <button class="delete-user-button" data-email="${user.email}" data-source="${user.source}" style="background-color: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table>';
    }
    
    localUsersContainer.innerHTML = html;
    localUsersModal.style.display = 'flex';
    
    // Her kullanıcı için silme butonlarına olay dinleyicileri ekle
    document.querySelectorAll('.delete-user-button').forEach(button => {
        button.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            const source = this.getAttribute('data-source');
            
            if (confirm(`${email} adresli kullanıcıyı silmek istediğinize emin misiniz?`)) {
                deleteUserByEmail(email, source);
                // Modalı yeniden yükle
                showLocalUsers();
            }
        });
    });
    
    // Modal kapatma butonu
    document.getElementById('local-users-close').addEventListener('click', () => {
        localUsersModal.style.display = 'none';
    });
    
    // LocalStorage temizleme butonu
    document.getElementById('local-users-clear').addEventListener('click', () => {
        if (confirm('Tüm yerel kullanıcı kayıtlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            localStorage.removeItem('snk_users');
            localStorage.removeItem('snk_verifiedUsers');
            localStorage.removeItem('snk_pendingUsers');
            localStorage.removeItem('snk_currentUser');
            
            showAlert('Başarılı', 'Tüm yerel kullanıcı kayıtları temizlendi.', 'success');
            localUsersModal.style.display = 'none';
            
            // Kullanıcı listesini yenile
            loadUsers();
        }
    });
}

// E-posta ve kaynağa göre kullanıcıyı sil
function deleteUserByEmail(email, source) {
    try {
        console.log(`Kullanıcı siliniyor: ${email} (Kaynak: ${source})`);
        
        // İlgili kaynaktaki veriyi al
        const sourceKey = source || 'snk_users'; // Varsayılan olarak snk_users
        const users = JSON.parse(localStorage.getItem(sourceKey) || '[]');
        
        // Kullanıcıyı bul ve sil
        const userIndex = users.findIndex(user => user.email === email);
        
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            localStorage.setItem(sourceKey, JSON.stringify(users));
            
            // Diğer kaynaklarda da aynı e-postaya sahip kullanıcıyı sil
            const otherSources = ['snk_users', 'snk_verifiedUsers', 'snk_pendingUsers'].filter(key => key !== sourceKey);
            
            otherSources.forEach(key => {
                const otherUsers = JSON.parse(localStorage.getItem(key) || '[]');
                const otherIndex = otherUsers.findIndex(user => user.email === email);
                
                if (otherIndex !== -1) {
                    otherUsers.splice(otherIndex, 1);
                    localStorage.setItem(key, JSON.stringify(otherUsers));
                    console.log(`Kullanıcı bu kaynaktan da silindi: ${key}`);
                }
            });
            
            // Eğer şu anda oturum açan kullanıcı siliniyorsa, oturumu kapat
            const currentUser = JSON.parse(localStorage.getItem('snk_currentUser') || '{}');
            if (currentUser && currentUser.email === email) {
                localStorage.removeItem('snk_currentUser');
                console.log('Silinen kullanıcı aktif oturumu olduğu için, oturum bilgileri temizlendi');
            }
            
            showAlert('Başarılı', 'Kullanıcı başarıyla silindi.', 'success');
            
            // Kullanıcı listesini yenile
            loadUsers();
            return true;
        } else {
            showAlert('Hata', 'Kullanıcı bulunamadı.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        showAlert('Hata', 'Kullanıcı silinirken bir hata oluştu: ' + error.message, 'error');
        return false;
    }
}
