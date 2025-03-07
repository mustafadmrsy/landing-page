/**
 * DOM Utility Functions - Senirkent Blog
 * Her fonksiyon öneki: snk_dom_ (kod çakışmalarını önlemek için)
 */

/**
 * DOM elemanını ID'ye göre seçer
 * @param {string} id - Element ID'si
 * @returns {HTMLElement|null} - Seçilen element veya null
 */
function snk_dom_getById(id) {
    return document.getElementById(id);
}

/**
 * DOM elemanını seçicide göre seçer
 * @param {string} selector - CSS seçicisi
 * @returns {HTMLElement|null} - Seçilen element veya null
 */
function snk_dom_getElement(selector) {
    return document.querySelector(selector);
}

/**
 * DOM elemanlarını seçicide göre seçer
 * @param {string} selector - CSS seçicisi
 * @returns {NodeList} - Seçilen elementler
 */
function snk_dom_getAllElements(selector) {
    return document.querySelectorAll(selector);
}

/**
 * DOM elemanına olay dinleyici ekler
 * @param {HTMLElement} element - Olay eklenecek element
 * @param {string} eventType - Olay tipi (click, mouseover, vb.)
 * @param {Function} callback - Olay gerçekleştiğinde çalışacak fonksiyon
 */
function snk_dom_addEvent(element, eventType, callback) {
    if (element) {
        element.addEventListener(eventType, callback);
    } else {
        console.error('Element bulunamadı:', element);
    }
}

/**
 * DOM elemanını oluşturur
 * @param {string} tagName - Element tag adı (div, span, vb.)
 * @param {Object} attributes - Element özellikleri (class, id, vb.)
 * @param {string|Node} content - Element içeriği (metin veya başka bir Node)
 * @returns {HTMLElement} - Oluşturulan element
 */
function snk_dom_createElement(tagName, attributes = {}, content = '') {
    const element = document.createElement(tagName);
    
    // Özellikleri ekle
    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
    
    // İçerik ekle
    if (content) {
        if (typeof content === 'string') {
            element.textContent = content;
        } else {
            element.appendChild(content);
        }
    }
    
    return element;
}

/**
 * HTML dizesini DOM elementine dönüştürür
 * @param {string} htmlString - HTML dizesi
 * @returns {DocumentFragment} - Dönüştürülen DOM fragmanı
 */
function snk_dom_parseHTML(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content;
}

/**
 * Elementin sınıfını değiştirir
 * @param {HTMLElement} element - Hedef element
 * @param {string} className - Eklenecek/çıkarılacak sınıf adı
 * @param {boolean} add - Eklemek için true, çıkarmak için false
 */
function snk_dom_toggleClass(element, className, add) {
    if (element) {
        if (add === undefined) {
            element.classList.toggle(className);
        } else if (add) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }
}

/**
 * Elementi gizler veya gösterir
 * @param {HTMLElement} element - Hedef element
 * @param {boolean} show - Göstermek için true, gizlemek için false
 */
function snk_dom_toggleVisibility(element, show) {
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

/**
 * Elementi belirtilen içerikle günceller
 * @param {HTMLElement} element - Hedef element
 * @param {string|Node} content - Yeni içerik
 */
function snk_dom_updateContent(element, content) {
    if (element) {
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else {
            element.innerHTML = '';
            element.appendChild(content);
        }
    }
}

console.log('DOM Utilities yüklendi');
