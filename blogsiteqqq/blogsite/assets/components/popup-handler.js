/**
 * Popup Handler - Senirkent Blog
 * Popup işlevselliğini sağlayan JavaScript kodu
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup Handler JS loaded');
    
    // For login button - redirect to login.aspx instead of opening popup
    document.querySelectorAll('#snk_showLogin, .snk_login_button').forEach(function (element) {
        if (element) {
            element.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'login.aspx';
            });
        }
    });

    // For register button - redirect to register.aspx instead of opening popup
    document.querySelectorAll('#snk_showRegister, .snk_register_button, #snk_switchToRegister').forEach(function (element) {
        if (element) {
            element.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'register.aspx';
            });
        }
    });

    // Popup işleme fonksiyonları
    function showPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (!popup) {
            console.warn(`Popup with ID ${popupId} not found.`);
            return;
        }

        // Show the popup
        popup.classList.add('show');
        document.body.classList.add('popup-open');

        // Add the close event to the close buttons
        popup.querySelectorAll('.popup-close, .btn-cancel').forEach(function (closeBtn) {
            closeBtn.addEventListener('click', function () {
                hidePopup(popupId);
            });
        });

        // Close when clicking outside the popup content
        popup.addEventListener('click', function (e) {
            if (e.target === popup) {
                hidePopup(popupId);
            }
        });

        // Handle ESC key to close the popup
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                hidePopup(popupId);
            }
        });
    }

    function hidePopup(popupId) {
        const popup = document.getElementById(popupId);
        if (!popup) {
            return;
        }

        popup.classList.remove('show');
        document.body.classList.remove('popup-open');
    }

    // Handle any other popups (not login/register)
    document.querySelectorAll('[data-popup]').forEach(function (element) {
        if (element) {
            element.addEventListener('click', function (e) {
                e.preventDefault();
                const popupId = this.getAttribute('data-popup');
                if (popupId !== 'login-popup' && popupId !== 'register-popup') {
                    showPopup(popupId);
                }
            });
        }
    });

    // Tab sistemi - Önce öğelerin varlığını kontrol et
    const tabs = document.querySelectorAll('.snk-user-tab');
    const sections = document.querySelectorAll('.snk-user-section');
    
    if (tabs.length > 0 && sections.length > 0) {
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                // Aktif tab'ı bul ve class'ı kaldır
                document.querySelector('.snk-user-tab.active').classList.remove('active');
                
                // Tıklanan tab'a active class'ı ekle
                this.classList.add('active');
                
                // Tab'a karşılık gelen section'ı bul
                const tabId = this.getAttribute('data-tab');
                
                // Tüm section'ları gizle
                sections.forEach(function (section) {
                    section.classList.remove('active');
                });
                
                // İlgili section'ı göster
                document.querySelector(`.snk-user-section[data-tab="${tabId}"]`).classList.add('active');
            });
        });
    }

    // Not: Header ile ilgili tüm işlevler (profile dropdown, sidebar toggle, mobile menu button)
    // modern-ui.js dosyasına taşınmıştır. Bu sayede header ile ilgili tüm işlevler tek dosyada toplanmıştır.

    // Takip et butonu - Önce öğenin varlığını kontrol et
    const followBtn = document.getElementById('user_followBtn');
    if (followBtn) {
        followBtn.addEventListener('click', function() {
            this.classList.toggle('following');
            if (this.classList.contains('following')) {
                this.innerHTML = '<i class="fas fa-check"></i> Takip Ediliyor';
            } else {
                this.innerHTML = '<i class="fas fa-user-plus"></i> Takip Et';
            }
        });
    }
    
    // Profil düzenleme modal - Önce tüm öğelerin varlığını kontrol et
    const profileEditBtn = document.getElementById('profileEditBtn');
    const profileEditModal = document.getElementById('profileEditModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    
    // Sadece tüm gerekli elementler varsa devam et
    if (profileEditBtn && profileEditModal && closeProfileModal) {
        // Modal'ı aç
        profileEditBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            profileEditModal.style.display = 'block';
            
            // Form alanlarını al
            const fullNameField = document.getElementById('fullName');
            const usernameField = document.getElementById('username');
            const emailField = document.getElementById('email');
            const bioField = document.getElementById('bio');
            
            // Varsayılan değerleri yükle (eğer form alanları varsa)
            if (fullNameField) fullNameField.value = "Ad Soyad";
            if (usernameField) usernameField.value = "kullaniciadi";
            if (emailField) emailField.value = "mail@example.com";
            if (bioField) bioField.value = "Biyografi";
            
            return false;
        });
        
        // Modal'ı kapat
        closeProfileModal.addEventListener('click', function() {
            profileEditModal.style.display = 'none';
        });
        
        // Cancel butonları
        const cancelButtons = document.querySelectorAll('.profile-form-cancel');
        if (cancelButtons.length > 0) {
            cancelButtons.forEach(button => {
                button.addEventListener('click', function() {
                    profileEditModal.style.display = 'none';
                });
            });
        }
        
        // Dışarı tıklandığında modal'ı kapat
        window.addEventListener('click', function(event) {
            if (event.target === profileEditModal) {
                profileEditModal.style.display = 'none';
            }
        });
        
        // Modal içine tıklandığında kapanmaması için
        const modalContent = profileEditModal.querySelector('.profile-edit-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // Modal tabs - Önce öğelerin varlığını kontrol et
        const modalTabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (modalTabs.length > 0 && tabContents.length > 0) {
            modalTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    if (!tabId) return;
                    
                    modalTabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    this.classList.add('active');
                    
                    const targetTab = document.getElementById(tabId + 'Tab');
                    if (targetTab) {
                        targetTab.classList.add('active');
                    }
                });
            });
        }
        
        // Kişisel bilgileri kaydet butonu
        const savePersonalBtn = document.getElementById('savePersonal');
        if (savePersonalBtn) {
            savePersonalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const fullName = document.getElementById('fullName')?.value || '';
                const username = document.getElementById('username')?.value || '';
                const email = document.getElementById('email')?.value || '';
                const bio = document.getElementById('bio')?.value || '';
                
                // Form doğrulama
                if (!fullName || !username || !email) {
                    alert('Lütfen gerekli alanları doldurun.');
                    return;
                }
                
                // Demo amaçlı bilgileri güncelle
                const displayUsername = document.getElementById('displayUsername');
                const displayUserHandle = document.getElementById('displayUserHandle');
                const displayBio = document.getElementById('displayBio');
                
                if (displayUsername) displayUsername.textContent = fullName;
                if (displayUserHandle) displayUserHandle.textContent = '@' + username;
                if (displayBio) displayBio.textContent = bio;
                
                alert('Profil bilgileri başarıyla güncellendi!');
                profileEditModal.style.display = 'none';
            });
        }
        
        // Şifre değiştir butonu
        const savePasswordBtn = document.getElementById('savePassword');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword')?.value || '';
                const newPassword = document.getElementById('newPassword')?.value || '';
                const confirmPassword = document.getElementById('confirmPassword')?.value || '';
                
                // Form doğrulama
                if (!currentPassword || !newPassword || !confirmPassword) {
                    alert('Lütfen tüm şifre alanlarını doldurun.');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    alert('Yeni şifreler eşleşmiyor!');
                    return;
                }
                
                if (newPassword.length < 6) {
                    alert('Şifre en az 6 karakter olmalıdır.');
                    return;
                }
                
                alert('Şifreniz başarıyla değiştirildi!');
                profileEditModal.style.display = 'none';
                
                // Şifre alanlarını temizle
                const currentPasswordField = document.getElementById('currentPassword');
                const newPasswordField = document.getElementById('newPassword');
                const confirmPasswordField = document.getElementById('confirmPassword');
                
                if (currentPasswordField) currentPasswordField.value = '';
                if (newPasswordField) newPasswordField.value = '';
                if (confirmPasswordField) confirmPasswordField.value = '';
            });
        }
        
        // Fotoğrafları kaydet butonu
        const savePhotosBtn = document.getElementById('savePhotos');
        if (savePhotosBtn) {
            savePhotosBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const profilePhotoInput = document.getElementById('profilePhoto');
                const coverPhotoInput = document.getElementById('coverPhoto');
                
                if (!profilePhotoInput || !coverPhotoInput) {
                    alert('Fotoğraf yükleme alanları bulunamadı.');
                    return;
                }
                
                const profilePhoto = profilePhotoInput.files[0];
                const coverPhoto = coverPhotoInput.files[0];
                
                if (!profilePhoto && !coverPhoto) {
                    alert('Lütfen en az bir fotoğraf seçin.');
                    return;
                }
                
                // Dosya önizleme
                if (profilePhoto) {
                    const reader = new FileReader();
                    const userProfileImg = document.getElementById('userProfileImg');
                    
                    reader.onload = function(e) {
                        if (userProfileImg) {
                            userProfileImg.src = e.target.result;
                        }
                    }
                    reader.readAsDataURL(profilePhoto);
                }
                
                if (coverPhoto) {
                    const reader = new FileReader();
                    const coverImage = document.getElementById('coverImage');
                    
                    reader.onload = function(e) {
                        if (coverImage) {
                            coverImage.src = e.target.result;
                        }
                    }
                    reader.readAsDataURL(coverPhoto);
                }
                
                alert('Fotoğraflar başarıyla güncellendi!');
                profileEditModal.style.display = 'none';
                
                // Dosya seçim alanlarını sıfırla
                profilePhotoInput.value = '';
                coverPhotoInput.value = '';
            });
        }
    }
});
