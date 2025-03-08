// Categories.js - Category page functionality for Senirkent Blog

document.addEventListener('DOMContentLoaded', function() {
    // Category filter functionality
    const categoryFilters = document.querySelectorAll('.snk-category-filter');
    const categoryCards = document.querySelectorAll('.snk-category-card');
    const recentPosts = document.querySelectorAll('.snk-recent-post-card');
    
    // Check URL parameters for pre-selected category
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        // If category parameter exists in URL, activate that filter
        categoryFilters.forEach(filter => {
            if (filter.getAttribute('data-filter') === categoryParam) {
                setActiveFilter(filter);
                filterCategories(categoryParam);
            }
        });
    }
    
    // Add click event listeners to all category filters
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.getAttribute('data-filter');
            setActiveFilter(this);
            filterCategories(category);
            
            // Update URL with selected category (without page refresh)
            if (category !== 'all') {
                const newUrl = `${window.location.pathname}?category=${category}`;
                window.history.pushState({path: newUrl}, '', newUrl);
            } else {
                window.history.pushState({path: window.location.pathname}, '', window.location.pathname);
            }
        });
    });
    
    // Set active class to the selected filter
    function setActiveFilter(activeFilter) {
        categoryFilters.forEach(filter => {
            filter.classList.remove('active');
        });
        activeFilter.classList.add('active');
    }
    
    // Filter category cards based on selected category
    function filterCategories(category) {
        if (category === 'all') {
            // Show all categories
            categoryCards.forEach(card => {
                card.style.display = 'flex';
            });
            
            // Show all recent posts
            recentPosts.forEach(post => {
                post.style.display = 'block';
            });
        } else {
            // Show only matching category cards
            categoryCards.forEach(card => {
                if (card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Filter recent posts by category
            recentPosts.forEach(post => {
                const postCategory = post.querySelector('.snk-post-category').getAttribute('data-category');
                if (postCategory === category) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        }
    }
    
    // Animation for category cards
    categoryCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
    
    // Animation for recent posts
    recentPosts.forEach((post, index) => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';
        post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        post.style.transitionDelay = `${index * 0.1 + 0.3}s`;
        
        setTimeout(() => {
            post.style.opacity = '1';
            post.style.transform = 'translateY(0)';
        }, 100);
    });
    
    // Compatibility with existing dark mode system
    // Check if dark mode is active on page load
    const currentTheme = localStorage.getItem('eren-theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('eren-dark-theme');
    }
});
