/**
 * Profile Editor - Senirkent Blog
 * Profil düzenleme sayfası için JavaScript işlevselliği
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile Editor JS loaded');
    
    // DOM Elementlerini Seçme
    const profileEditBtn = document.getElementById('profileEditBtn');
    const profileEditOverlay = document.getElementById('profileEditOverlay');
    const profileEditCloseBtn = document.getElementById('profileEditClose');
    const profileEditForm = document.getElementById('profileEditForm');
    const profileCancelBtn = document.getElementById('profileCancelBtn');
    const profileEditTabs = document.querySelectorAll('.snk-profile-edit-tab');
    const profileEditSections = document.querySelectorAll('.snk-profile-edit-section');
    
    // Dosya yükleme alanları
    const profilePicturePreview = document.getElementById('profilePicturePreview');
    const coverPicturePreview = document.getElementById('coverPicturePreview');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const coverPictureInput = document.getElementById('coverPictureInput');
    
    // API Base URL
    const API_BASE_URL = 'http://localhost:3001/api';
    
    // Sayfa yüklendiğinde localStorage'dan verileri yükle
    loadProfileData();
    
    /**
     * Profil Düzenleme Modal'ını Göster
     */
    function showProfileEditModal() {
        if (profileEditOverlay) {
            profileEditOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Sayfayı kaydırmayı engelle
        }
    }
    
    /**
     * Profil Düzenleme Modal'ını Gizle
     */
    function hideProfileEditModal() {
        if (profileEditOverlay) {
            profileEditOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Sayfayı kaydırmayı tekrar etkinleştir
        }
    }
    
    /**
     * Sekme değiştirme işlevselliği
     */
    function initTabs() {
        if (profileEditTabs.length > 0 && profileEditSections.length > 0) {
            profileEditTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabTarget = this.getAttribute('data-tab');
                    console.log('Tab clicked:', tabTarget);
                    
                    // Aktif sekme işaretini değiştir
                    profileEditTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // İlgili bölümü göster
                    profileEditSections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === `profileEdit_${tabTarget}`) {
                            section.classList.add('active');
                        }
                    });
                });
            });
        }
    }
    
    /**
     * Form alanlarını mevcut profil verilerine göre doldur
     */
    function populateFormFields() {
        // LocalStorage'dan profil bilgilerini al
        const savedProfileData = localStorage.getItem('userProfileData');
        
        if (savedProfileData) {
            const profileData = JSON.parse(savedProfileData);
            
            // Form alanlarını doldur
            const displayNameInput = document.getElementById('profileDisplayName');
            const nameInput = document.getElementById('profileName');
            const emailInput = document.getElementById('profileEmail');
            const phoneInput = document.getElementById('profilePhone');
            const bioInput = document.getElementById('profileBio');
            const locationInput = document.getElementById('profileLocation');
            
            // Sosyal medya alanları
            const twitterInput = document.getElementById('profileTwitter');
            const instagramInput = document.getElementById('profileInstagram');
            const linkedinInput = document.getElementById('profileLinkedin');
            const githubInput = document.getElementById('profileGithub');
            const websiteInput = document.getElementById('profileWebsite');
            const youtubeInput = document.getElementById('profileYoutube');
            
            // Kişisel bilgiler
            if (displayNameInput && profileData.displayName) displayNameInput.value = profileData.displayName;
            if (nameInput && profileData.username) nameInput.value = profileData.username;
            if (emailInput && profileData.email) emailInput.value = profileData.email;
            if (phoneInput && profileData.phone) phoneInput.value = profileData.phone;
            if (bioInput && profileData.bio) bioInput.value = profileData.bio;
            if (locationInput && profileData.location) locationInput.value = profileData.location;
            
            // Sosyal medya
            if (twitterInput && profileData.twitter) twitterInput.value = profileData.twitter;
            if (instagramInput && profileData.instagram) instagramInput.value = profileData.instagram;
            if (linkedinInput && profileData.linkedin) linkedinInput.value = profileData.linkedin;
            if (githubInput && profileData.github) githubInput.value = profileData.github;
            if (websiteInput && profileData.website) websiteInput.value = profileData.website;
            if (youtubeInput && profileData.youtube) youtubeInput.value = profileData.youtube;
            
            // Onay kutuları
            const notifEmail = document.getElementById('notifEmail');
            const notifWeb = document.getElementById('notifWeb');
            const notifContent = document.getElementById('notifContent');
            const privacyProfile = document.getElementById('privacyProfile');
            const privacyEmail = document.getElementById('privacyEmail');
            
            if (notifEmail && profileData.notifEmail) notifEmail.checked = profileData.notifEmail === 'on';
            if (notifWeb && profileData.notifWeb) notifWeb.checked = profileData.notifWeb === 'on';
            if (notifContent && profileData.notifContent) notifContent.checked = profileData.notifContent === 'on';
            if (privacyProfile && profileData.privacyProfile) privacyProfile.checked = profileData.privacyProfile === 'on';
            if (privacyEmail && profileData.privacyEmail) privacyEmail.checked = profileData.privacyEmail === 'on';
            
        } else {
            // Eğer localStorage'da veri yoksa, DOM'dan mevcut bilgileri topla
            const nameInput = document.getElementById('profileName');
            const displayNameInput = document.getElementById('profileDisplayName');
            const bioInput = document.getElementById('profileBio');
            
            const nameDisplay = document.querySelector('.snk-user-name');
            const usernameDisplay = document.querySelector('.snk-user-username');
            const bioDisplay = document.querySelector('.snk-user-bio');
            
            if (displayNameInput && nameDisplay) {
                displayNameInput.value = nameDisplay.textContent.trim();
            }
            
            if (nameInput && usernameDisplay) {
                // @ işaretini kaldır
                const username = usernameDisplay.textContent.trim().replace('@', '');
                nameInput.value = username;
            }
            
            if (bioInput && bioDisplay) {
                bioInput.value = bioDisplay.textContent.trim();
            }
        }
    }
    
    /**
     * Profil resmini önizleme
     * @param {Event} event - Dosya seçme olayı
     * @param {HTMLElement} previewElement - Resim önizleme elementi
     */
    function previewImage(event, previewElement) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Placeholder'ı gizle
                const placeholder = previewElement.querySelector('.snk-image-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                // Resim elementini oluştur veya güncelle
                let imgElement = previewElement.querySelector('.preview-image');
                if (!imgElement) {
                    imgElement = document.createElement('img');
                    imgElement.classList.add('preview-image');
                    previewElement.appendChild(imgElement);
                }
                
                imgElement.src = e.target.result;
                previewElement.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * Form gönderildiğinde çalışacak işlev
     * @param {Event} e - Form submit olayı
     */
    async function handleProfileFormSubmit(e) {
        e.preventDefault();
        console.log('Profil formu gönderildi');
        
        try {
            // Form verilerini topla
            const formData = new FormData(profileEditForm);
            const profileData = {};
            
            // FormData'dan JavaScript nesnesine dönüştür
            for (const [key, value] of formData.entries()) {
                profileData[key] = value;
            }
            
            // Profil ve kapak resimleri için özel işlem
            if (profilePictureInput && profilePictureInput.files.length > 0) {
                const profileReader = new FileReader();
                profileReader.onload = function(e) {
                    profileData.profilePictureUrl = e.target.result;
                    localStorage.setItem('userProfileData', JSON.stringify(profileData));
                    updateProfileUI(profileData);
                };
                profileReader.readAsDataURL(profilePictureInput.files[0]);
            }
            
            if (coverPictureInput && coverPictureInput.files.length > 0) {
                const coverReader = new FileReader();
                coverReader.onload = function(e) {
                    profileData.coverPictureUrl = e.target.result;
                    localStorage.setItem('userProfileData', JSON.stringify(profileData));
                    updateProfileUI(profileData);
                };
                coverReader.readAsDataURL(coverPictureInput.files[0]);
            }
            
            // Eğer resim yoksa direkt localStorage'a kaydet
            if ((!profilePictureInput || profilePictureInput.files.length === 0) && 
                (!coverPictureInput || coverPictureInput.files.length === 0)) {
                localStorage.setItem('userProfileData', JSON.stringify(profileData));
                updateProfileUI(profileData);
            }
            
            // Başarılı güncelleme mesajı
            alert('Profiliniz başarıyla güncellendi!');
            
            // Modal'ı kapat
            hideProfileEditModal();
            
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            alert('Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
    
    /**
     * Profil arayüzünü form verilerine göre güncelle
     * @param {Object} profileData - Profil verileri
     */
    function updateProfileUI(profileData) {
        if (!profileData) return;
        
        // Ana profil alanlarını güncelle
        const userNameElement = document.querySelector('.snk-user-name');
        const userUsernameElement = document.querySelector('.snk-user-username');
        const userBioElement = document.querySelector('.snk-user-bio');
        const userProfileImg = document.getElementById('userProfileImg');
        
        if (userNameElement && profileData.displayName) {
            userNameElement.textContent = profileData.displayName;
        }
        
        if (userUsernameElement && profileData.username) {
            userUsernameElement.textContent = '@' + profileData.username;
        }
        
        if (userBioElement && profileData.bio) {
            userBioElement.textContent = profileData.bio;
        }
        
        // Profil ve kapak resimlerini güncelle
        if (userProfileImg && profileData.profilePictureUrl) {
            userProfileImg.src = profileData.profilePictureUrl;
        }
        
        const userCoverImg = document.querySelector('.snk-user-cover img');
        if (userCoverImg && profileData.coverPictureUrl) {
            userCoverImg.src = profileData.coverPictureUrl;
        }
        
        // Hakkında sekmesindeki kişisel bilgileri güncelle
        updateAboutSectionPersonalInfo(profileData);
        
        // Hakkında sekmesindeki sosyal medya bilgilerini güncelle
        updateAboutSectionSocialMedia(profileData);
    }
    
    /**
     * "Hakkında" sekmesindeki kişisel bilgileri güncelle
     * @param {Object} profileData - Profil verileri
     */
    function updateAboutSectionPersonalInfo(profileData) {
        // Kişisel bilgileri güncelle
        const nameDisplay = document.querySelector('.snk-user-name-display');
        const usernameDisplay = document.querySelector('.snk-user-username-display');
        const emailDisplay = document.querySelector('.snk-user-email-display');
        const phoneDisplay = document.querySelector('.snk-user-phone-display');
        const bioDisplay = document.querySelector('.snk-user-bio-display');

        if (nameDisplay && profileData.displayName) {
            nameDisplay.textContent = profileData.displayName;
        }
        
        if (usernameDisplay && profileData.username) {
            usernameDisplay.textContent = profileData.username;
        }
        
        if (emailDisplay && profileData.email) {
            emailDisplay.textContent = profileData.email;
        }
        
        if (phoneDisplay && profileData.phone) {
            phoneDisplay.textContent = profileData.phone;
        }
        
        if (bioDisplay && profileData.bio) {
            bioDisplay.textContent = profileData.bio;
        }
    }
    
    /**
     * "Hakkında" sekmesindeki sosyal medya bilgilerini güncelle
     * @param {Object} profileData - Profil verileri
     */
    function updateAboutSectionSocialMedia(profileData) {
        // Sosyal medya bilgilerini güncelle
        const twitterDisplay = document.querySelector('.snk-user-twitter-display');
        const instagramDisplay = document.querySelector('.snk-user-instagram-display');
        const linkedinDisplay = document.querySelector('.snk-user-linkedin-display');
        const githubDisplay = document.querySelector('.snk-user-github-display');
        const websiteDisplay = document.querySelector('.snk-user-website-display');
        const youtubeDisplay = document.querySelector('.snk-user-youtube-display');
        
        if (twitterDisplay && profileData.twitter) {
            twitterDisplay.textContent = profileData.twitter;
        }
        
        if (instagramDisplay && profileData.instagram) {
            instagramDisplay.textContent = profileData.instagram;
        }
        
        if (linkedinDisplay && profileData.linkedin) {
            linkedinDisplay.textContent = profileData.linkedin;
        }
        
        if (githubDisplay && profileData.github) {
            githubDisplay.textContent = profileData.github;
        }
        
        if (websiteDisplay && profileData.website) {
            websiteDisplay.textContent = profileData.website;
        }
        
        if (youtubeDisplay && profileData.youtube) {
            youtubeDisplay.textContent = profileData.youtube;
        }
    }
    
    /**
     * Sayfa yüklendiğinde localStorage'dan profil verilerini yükler ve UI'a uygular
     */
    function loadProfileData() {
        const savedProfileData = localStorage.getItem('userProfileData');
        
        if (savedProfileData) {
            try {
                const profileData = JSON.parse(savedProfileData);
                updateProfileUI(profileData);
                
                // Profil ve kapak resmi önizlemelerini yükle 
                if (profileData.profilePictureUrl && profilePicturePreview) {
                    // Placeholder'ı gizle
                    const placeholder = profilePicturePreview.querySelector('.snk-image-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    
                    // Resmi göster
                    let imgElement = profilePicturePreview.querySelector('.preview-image');
                    if (!imgElement) {
                        imgElement = document.createElement('img');
                        imgElement.classList.add('preview-image');
                        profilePicturePreview.appendChild(imgElement);
                    }
                    
                    imgElement.src = profileData.profilePictureUrl;
                    profilePicturePreview.classList.add('has-image');
                }
                
                if (profileData.coverPictureUrl && coverPicturePreview) {
                    // Placeholder'ı gizle
                    const placeholder = coverPicturePreview.querySelector('.snk-image-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    
                    // Resmi göster
                    let imgElement = coverPicturePreview.querySelector('.preview-image');
                    if (!imgElement) {
                        imgElement = document.createElement('img');
                        imgElement.classList.add('preview-image');
                        coverPicturePreview.appendChild(imgElement);
                    }
                    
                    imgElement.src = profileData.coverPictureUrl;
                    coverPicturePreview.classList.add('has-image');
                }
                
                console.log('Profil verileri localStorage\'dan yüklendi');
            } catch (error) {
                console.error('Profil verileri yüklenirken hata:', error);
            }
        }
    }
    
    // Event Listeners
    if (profileEditBtn) {
        profileEditBtn.addEventListener('click', function() {
            showProfileEditModal();
            populateFormFields(); // Modal açıldığında form alanlarını doldur
        });
    }
    
    if (profileEditCloseBtn) {
        profileEditCloseBtn.addEventListener('click', hideProfileEditModal);
    }
    
    if (profileCancelBtn) {
        profileCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideProfileEditModal();
        });
    }
    
    // Profil resmi yükleme
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', function(e) {
            previewImage(e, profilePicturePreview);
        });
    }
    
    // Kapak resmi yükleme
    if (coverPictureInput) {
        coverPictureInput.addEventListener('change', function(e) {
            previewImage(e, coverPicturePreview);
        });
    }
    
    // Form gönderimi
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', handleProfileFormSubmit);
    }
    
    // Modal dışına tıklandığında kapat
    if (profileEditOverlay) {
        profileEditOverlay.addEventListener('click', function(e) {
            if (e.target === profileEditOverlay) {
                hideProfileEditModal();
            }
        });
    }
    
    // ESC tuşuna basma olayını dinle
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && profileEditOverlay && profileEditOverlay.classList.contains('active')) {
            hideProfileEditModal();
        }
    });
    
    // Sekme işlevselliğini başlat
    initTabs();
});
