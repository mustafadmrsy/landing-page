/**
 * Senirkent MYO Blog - DOM Yardımcı Fonksiyonları
 * Açıklama: DOM işlemleri için yardımcı fonksiyonlar
 * Yazar: Mustafa Demirsoy
 * Sürüm: 1.0.0
 * Güncelleme Tarihi: 5 Mart 2025
 */

/**
 * Element seçme işlevi
 * @param {string} selector - CSS seçici
 * @param {Element} [parent=document] - Üst element (varsayılan: document)
 * @returns {Element|null} - Seçilen element veya null
 */
function select(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Çoklu element seçme işlevi
 * @param {string} selector - CSS seçici
 * @param {Element} [parent=document] - Üst element (varsayılan: document)
 * @returns {NodeList} - Seçilen elementler
 */
function selectAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Elemente class ekleme/kaldırma işlevi
 * @param {Element} element - Hedef element
 * @param {string} className - Eklenecek/kaldırılacak class adı
 * @param {boolean} condition - Eklenecek (true) veya kaldırılacak (false)
 */
function toggleClass(element, className, condition) {
    if (condition === undefined) {
        element.classList.toggle(className);
        return;
    }
    
    if (condition) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

/**
 * Element oluşturma işlevi
 * @param {string} tag - HTML tag adı
 * @param {Object} [options={}] - Element özellikleri
 * @param {string} [options.className] - Element class adı
 * @param {string} [options.id] - Element ID'si
 * @param {string} [options.text] - Element metin içeriği
 * @param {string} [options.html] - Element HTML içeriği
 * @param {Object} [options.attributes] - Element attribute'ları
 * @param {Element[]} [options.children] - Element çocukları
 * @returns {Element} - Oluşturulan element
 */
function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
        element.className = options.className;
    }
    
    if (options.id) {
        element.id = options.id;
    }
    
    if (options.text) {
        element.textContent = options.text;
    }
    
    if (options.html) {
        element.innerHTML = options.html;
    }
    
    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            element.setAttribute(key, value);
        }
    }
    
    if (options.children) {
        options.children.forEach(child => {
            element.appendChild(child);
        });
    }
    
    return element;
}

/**
 * Event listener ekleme işlevi
 * @param {Element|Element[]} elements - Hedef element(ler)
 * @param {string} eventType - Event tipi (click, mouseenter vb.)
 * @param {Function} callback - Event callback fonksiyonu
 * @param {Object} [options] - Event listener seçenekleri
 */
function addEventToElements(elements, eventType, callback, options) {
    const elementList = Array.isArray(elements) ? elements : [elements];
    
    elementList.forEach(element => {
        if (element) {
            element.addEventListener(eventType, callback, options);
        }
    });
}

/**
 * LocalStorage değeri kaydetme işlevi
 * @param {string} key - Anahtar
 * @param {*} value - Değer
 */
function saveToLocalStorage(key, value) {
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
    localStorage.setItem(key, valueToStore);
}

/**
 * LocalStorage değeri alma işlevi
 * @param {string} key - Anahtar
 * @param {boolean} [parseJSON=true] - JSON olarak parse edilsin mi
 * @returns {*} - Alınan değer
 */
function getFromLocalStorage(key, parseJSON = true) {
    const value = localStorage.getItem(key);
    
    if (!value) return null;
    
    if (parseJSON) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    
    return value;
}
