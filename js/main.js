document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const articleMenu = document.getElementById('article-menu');
    const articleContainer = document.getElementById('article-container');
    const homeLink = document.getElementById('home-link');    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    const searchCloseBtn = document.getElementById('search-close');
    const themeToggle = document.getElementById('theme-toggle');
    const allArticlesNav = document.getElementById('all-articles-nav');
    const categoriesNav = document.getElementById('categories-nav');
    
    // Track current article ID
    let currentArticleId = null;
    
    // Initialize social sharing functionality
    const socialShare = new SocialShare();
    
    // Theme (dark mode) functionality
    function setupThemeToggle() {
        // Check for saved theme preference or respect OS preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Toggle theme when button is clicked
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Update theme in local storage
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }    // Search functionality
    function setupSearch() {
        // Get fresh references to DOM elements
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const searchToggle = document.getElementById('search-toggle');
        const searchOverlay = document.getElementById('search-overlay');
        const searchCloseBtn = document.getElementById('search-close');
        
        // Add null checks to prevent errors
        if (!searchToggle || !searchOverlay || !searchCloseBtn || !searchInput || !searchButton) {
            console.error('Search elements not found. Retrying in 500ms...');
            setTimeout(setupSearch, 500);
            return;
        }

        console.log('Search functionality setup successful!');

        // Show search overlay when search toggle is clicked
        searchToggle.addEventListener('click', function() {
            showSearchOverlay();
        });

        // Hide search overlay when close button is clicked
        searchCloseBtn.addEventListener('click', function() {
            hideSearchOverlay();
        });

        // Hide search overlay when clicking outside the search box
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                hideSearchOverlay();
            }
        });

        // Hide search overlay when ESC key is pressed
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                hideSearchOverlay();
            }
        });

        // Search when button is clicked
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
        
        // Search when Enter key is pressed
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
        
        // Update the global references for use in other functions
        window.searchElements = {
            searchInput,
            searchButton,
            searchToggle,
            searchOverlay,
            searchCloseBtn
        };
    }    // Show search overlay with animation
    function showSearchOverlay() {
        const elements = window.searchElements;
        if (elements && elements.searchOverlay) {
            // Hide the search toggle container
            const searchToggleContainer = document.querySelector('.search-toggle-container');
            if (searchToggleContainer) {
                searchToggleContainer.classList.add('hidden');
            }
            
            elements.searchOverlay.classList.add('active');
            // Focus on search input after animation completes
            setTimeout(() => {
                if (elements.searchInput) {
                    elements.searchInput.focus();
                }
            }, 300);
        }
    }

    // Hide search overlay with animation
    function hideSearchOverlay() {
        const elements = window.searchElements;
        if (elements && elements.searchOverlay) {
            elements.searchOverlay.classList.remove('active');
            
            // Restore the search toggle container
            const searchToggleContainer = document.querySelector('.search-toggle-container');
            if (searchToggleContainer) {
                searchToggleContainer.classList.remove('hidden');
            }
        }
        // Clear search input when hiding
        if (elements && elements.searchInput) {
            elements.searchInput.value = '';
        }
    }
    
    // Function to highlight search terms in content
    function highlightSearchTerms(content, query) {
        if (!query || typeof content !== 'string') return content;
        
        // Create a regex pattern that handles special regex characters safely
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        
        // Replace matched terms with highlighted version
        return content.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // Function to highlight search terms within HTML while preserving HTML structure
    function highlightSearchTermsInHTML(html, query) {
        if (!query || typeof html !== 'string') return html;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Function to recursively process text nodes
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                // Only process non-empty text nodes
                if (node.textContent.trim() !== '') {
                    const highlighted = highlightSearchTerms(node.textContent, query);
                    
                    // Only replace if something was highlighted
                    if (highlighted !== node.textContent) {
                        const span = document.createElement('span');
                        span.innerHTML = highlighted;
                        node.parentNode.replaceChild(span, node);
                    }
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip script and style elements
                if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                    Array.from(node.childNodes).forEach(processNode);
                }
            }
        }
        
        // Process the body element
        processNode(doc.body);
        
        return doc.body.innerHTML;
    }
      function performSearch(query) {
        if (!query.trim()) return;
        
        // Hide search overlay after search is performed
        hideSearchOverlay();
        
        query = query.toLowerCase();
        
        loadArticles().then(articles => {
            const searchResults = [];
            
            articles.forEach(article => {
                // Search in title
                const titleMatch = article.title.toLowerCase().includes(query);
                
                // Search in content (remove HTML tags for text search)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = article.content;
                const contentText = tempDiv.textContent || tempDiv.innerText;
                const contentMatch = contentText.toLowerCase().includes(query);
                
                if (titleMatch || contentMatch) {
                    // Get a snippet of the content around the match
                    let snippet = '';
                    if (contentMatch) {
                        const matchIndex = contentText.toLowerCase().indexOf(query);
                        const startIndex = Math.max(0, matchIndex - 40);
                        const endIndex = Math.min(contentText.length, matchIndex + query.length + 40);
                        snippet = contentText.substring(startIndex, endIndex).trim();
                        if (startIndex > 0) snippet = '...' + snippet;
                        if (endIndex < contentText.length) snippet += '...';
                    }
                    
                    searchResults.push({
                        id: article.id,
                        title: article.title,
                        snippet: snippet || 'Match found in title',
                    });
                }
            });
            
            displaySearchResults(searchResults, query);
        }).catch(error => {
            console.error('Search failed:', error);
            displaySearchResults([], query);
        });
    }
    
    function displaySearchResults(results, query) {
        // Clear current content
        articleContainer.innerHTML = '';
        
        // Create search results container
        const searchResultsContainer = document.createElement('div');
        searchResultsContainer.className = 'search-results-container';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'search-results-header';
        header.innerHTML = `
            <h1>Search Results for "${query}"</h1>
            <p>${results.length} result${results.length !== 1 ? 's' : ''} found</p>
        `;
        searchResultsContainer.appendChild(header);
        
        if (results.length > 0) {
            // Create results list
            const resultsList = document.createElement('div');
            resultsList.className = 'search-results-list';
            
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                
                // Highlight the query in the title and snippet
                const highlightedTitle = highlightSearchTerms(result.title, query);
                const highlightedSnippet = highlightSearchTerms(result.snippet, query);
                
                resultItem.innerHTML = `
                    <h2><a href="?article=${result.id}" data-id="${result.id}" class="search-result-link">${highlightedTitle}</a></h2>
                    <p class="search-result-snippet">${highlightedSnippet}</p>
                `;
                
                resultsList.appendChild(resultItem);
            });
            
            searchResultsContainer.appendChild(resultsList);
            
            // Add event listeners to search result links
            searchResultsContainer.querySelectorAll('.search-result-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const articleId = parseInt(this.getAttribute('data-id'));
                    loadArticle(articleId);
                    
                    // Update active menu item
                    document.querySelectorAll('#article-menu li').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
                    if (menuItem) {
                        menuItem.parentElement.classList.add('active');
                    }
                });
            });
        } else {
            // No results found
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.innerHTML = `
                <p>No results found for "${query}"</p>
                <p>Try different keywords or check your spelling.</p>
            `;
            searchResultsContainer.appendChild(noResults);
        }
          // Add button to clear search
        const clearSearchButton = document.createElement('button');
        clearSearchButton.className = 'clear-search-button';
        clearSearchButton.innerHTML = '<i class="fas fa-times"></i> Clear Search';
        clearSearchButton.addEventListener('click', function() {
            showHomePage();
        });
        
        searchResultsContainer.appendChild(clearSearchButton);
        
        // Add search results to the page
        articleContainer.appendChild(searchResultsContainer);
        
        // Update browser URL to include search query
        history.pushState({ search: query }, '', `?search=${encodeURIComponent(query)}`);
    }
    
    // Populate the menu with articles
    function populateMenu() {
        console.log('Starting to populate the article menu...');
        document.getElementById('article-menu').innerHTML = '<li class="loading-menu-item"><i class="fas fa-spinner fa-spin"></i> Loading articles...</li>';
        
        loadArticles().then(articlesData => {
            console.log('Loaded articles for menu:', articlesData.length);
            
            // Clear loading message
            document.getElementById('article-menu').innerHTML = '';
            
            if (articlesData.length === 0) {
                document.getElementById('article-menu').innerHTML = '<li class="error-message">No articles found</li>';
                return;
            }
            
            articlesData.forEach(article => {
                console.log('Creating menu item for article:', article.id, article.title);
                const li = document.createElement('li');
                li.innerHTML = `<a href="?article=${article.id}" data-id="${article.id}" class="article-link">${article.title}</a>`;
                
                // Add click event listener to article link
                const linkElement = li.querySelector('.article-link');
                linkElement.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all menu items
                    document.querySelectorAll('#article-menu li').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to clicked menu item
                    li.classList.add('active');
                    
                    // Load the article content
                    loadArticle(article.id);
                });
                
                articleMenu.appendChild(li);
            });
            
            // Apply read status to articles in the menu
            applyReadStatus();
            
            // If there are URL parameters, handle them after populating the menu
            checkUrlParams();
            
            // Apply read status to articles in the menu
            applyReadStatus();
        }).catch(error => {
            console.error('Failed to populate menu:', error);
            articleMenu.innerHTML = `<li class="error-message">Failed to load articles: ${error.message}</li>`;
        });
    }
    
    // Load article content by ID
    function loadArticle(id) {
        // Clear existing content first
        articleContainer.innerHTML = '<div class="loading-article"><i class="fas fa-spinner fa-spin"></i> Loading article...</div>';
        
        // Find the article in the loaded articles array
        const numericId = parseInt(id);
        getArticleById(numericId).then(article => {
            if (article) {
                // Update current article ID
                currentArticleId = numericId;
                
                // Set document title to include article title
                document.title = `${article.title} - GSATechDose`;
                
                // If we came from search, highlight the search term
                const urlParams = new URLSearchParams(window.location.search);
                const searchQuery = urlParams.get('search');
                
                // Display article content
                if (searchQuery) {
                    // Highlight search terms in the content if we came from search
                    articleContainer.innerHTML = highlightSearchTermsInHTML(article.content, searchQuery);
                } else {
                    // If not from search, just set the content directly
                    articleContainer.innerHTML = article.content;
                }
                  // Add social sharing buttons - but ensure we only add them once
                const articleContentDiv = articleContainer.querySelector('.article-content');
                const articleDiv = articleContainer.querySelector('.article');
                  // Check if share buttons already exist to prevent duplication
                if (!articleDiv.querySelector('.social-share-buttons')) {
                    const shareButtons = socialShare.generateShareButtons(article.title);
                    
                    // Add social sharing buttons before the article navigation (which is now outside article-content)
                    const articleNav = articleDiv.querySelector('.article-nav');
                    if (articleNav) {
                        articleNav.insertAdjacentHTML('beforebegin', shareButtons);
                        socialShare.setupEventHandlers();
                        socialShare.updateShareUrls(article.title);
                        // Update meta tags for better social sharing
                        socialShare.updateMetaTags(article.title, 'GSATechDose - Your Regular Dose of Global Secure Access Insights');
                    } else {
                        // Fallback: add at the end of article content if no navigation found
                        articleContentDiv.insertAdjacentHTML('beforeend', shareButtons);
                        socialShare.setupEventHandlers();
                        socialShare.updateShareUrls(article.title);
                        // Update meta tags for better social sharing
                        socialShare.updateMetaTags(article.title, 'GSATechDose - Your Regular Dose of Global Secure Access Insights');
                    }
                }
                
                // Update ARIA attributes for accessibility
                document.dispatchEvent(new Event('contentLoaded'));
                
                // Handle ONLY internal article link clicks (that have data-article-id)
                // Explicitly exclude external links
                const internalArticleLinks = articleContainer.querySelectorAll('a.article-link[data-article-id]');
                internalArticleLinks.forEach(link => {
                    // Clone the link to remove existing event listeners
                    const newLink = link.cloneNode(true);
                    link.parentNode.replaceChild(newLink, link);
                    
                    // Add a new click event listener
                    newLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        const articleId = parseInt(this.getAttribute('data-article-id'));
                        
                        // Only proceed if this is an internal article link
                        if (!this.classList.contains('external-link') && articleId) {
                            // Load the linked article
                            loadArticle(articleId);
                            
                            // Update active menu item
                            document.querySelectorAll('#article-menu li').forEach(item => {
                                item.classList.remove('active');
                            });
                            
                            const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
                            if (menuItem) {
                                menuItem.parentElement.classList.add('active');
                            }
                        }
                    });
                });
                
                // Update browser URL with article ID for bookmarking
                history.pushState({articleId: id}, article.title, `?article=${id}`);
                
                // Mark the article as read
                markArticleAsRead(numericId);
                
                // Scroll to top of the page
                window.scrollTo(0, 0);
            }
        }).catch(error => {
            console.error('Failed to load article:', error);
            articleContainer.innerHTML = `<div class="error-message">Failed to load article: ${error.message}</div>`;
        });
    }
    
    // Track which articles have been read by the user
    function markArticleAsRead(articleId) {
        // Get the read articles from local storage
        let readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
        
        // Add the article ID if it's not already in the list
        if (!readArticles.includes(articleId)) {
            readArticles.push(articleId);
            localStorage.setItem('readArticles', JSON.stringify(readArticles));
        }
        
        // Mark the article as read in the menu
        const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
        if (menuItem) {
            menuItem.classList.add('read');
        }
    }
    
    // Check if an article has been read
    function isArticleRead(articleId) {
        const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
        return readArticles.includes(articleId);
    }
    
    // Apply read status to all articles in the menu
    function applyReadStatus() {
        const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
        
        readArticles.forEach(articleId => {
            const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
            if (menuItem) {
                menuItem.classList.add('read');
            }
        });
    }
      // Check if there's an article ID, category, tag, or search query in the URL parameters
    function checkUrlParams() {
        // If there are no URL parameters at all, show the welcome page
        if (window.location.search === '') {
            showHomePage();
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('article');
        const searchQuery = urlParams.get('search');
        const category = urlParams.get('category');
        const tag = urlParams.get('tag');
        const pageParam = urlParams.get('page');
        
        if (articleId) {
            const id = parseInt(articleId);
            const menuItem = document.querySelector(`#article-menu li a[data-id="${id}"]`);
            
            if (menuItem) {
                menuItem.parentElement.classList.add('active');
                loadArticle(id);
            }
        } else if (searchQuery) {
            // There's a search query in the URL
            searchInput.value = searchQuery;
            performSearch(searchQuery);
        } else if (category) {
            // There's a category filter in the URL
            filterArticlesByCategory(category);
        } else if (tag) {
            // There's a tag filter in the URL
            filterArticlesByTag(tag);        } else if (pageParam === "categories") {
            // Show categories page
            showCategoriesPage();
        } else if (pageParam === "all-articles") {
            // Show all articles list
            showArticlesList(1);
        } else if (pageParam && !isNaN(pageParam)) {
            // Show specific page of articles list
            showArticlesList(parseInt(pageParam));
        } else {
            // Show the welcome page as default landing page
            showHomePage();
        }
    }
    
    // Function to show home page
    function showHomePage() {
        // Reset current article ID
        currentArticleId = null;
        
        // Reset page title
        document.title = "GSATechDose - Articles";
        
        // Remove active class from all menu items
        document.querySelectorAll('#article-menu li').forEach(item => {
            item.classList.remove('active');
        });
        
        // Show welcome message
        articleContainer.innerHTML = `
            <div class="welcome-message">
                <h1>Welcome to GSATechDose</h1>
                <div class="project-logo">
                    <img src="images/gsatechdose-logo.png" alt="GSATechDose Logo" onerror="this.src='https://via.placeholder.com/500x300?text=GSATechDose'" width="500">
                </div>
                <div class="project-description">
                    <h2>Your Regular Dose of Global Secure Access Insights</h2>
                    <p>GSATechDose is a knowledge-sharing platform dedicated to providing high-quality technical articles, tutorials, and insights on Microsoft Global Secure Access technology.</p>
                    <p>Our mission is to simplify complex technical concepts and make learning accessible to everyone - from beginners to experienced professionals.</p>
                    <h3>What We Cover:</h3>
                    <div class="topic-grid">
                        <div class="topic-item">
                            <i class="fas fa-code"></i>
                            <span>Software Development</span>
                        </div>
                        <div class="topic-item">
                            <i class="fas fa-globe"></i>
                            <span>Web Technologies</span>
                        </div>
                        <div class="topic-item">
                            <i class="fas fa-brain"></i>
                            <span>Artificial Intelligence</span>
                        </div>
                        <div class="topic-item">
                            <i class="fas fa-database"></i>
                            <span>Data Science</span>
                        </div>
                        <div class="topic-item">
                            <i class="fas fa-cloud"></i>
                            <span>Cloud Computing</span>
                        </div>
                        <div class="topic-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>Cybersecurity</span>
                        </div>
                    </div>
                    <p>Select an article from the menu on the left to begin reading, or browse by category.</p>
                    <p>
                        <a href="#" id="all-articles-link" class="btn-primary">Browse All Articles</a>
                    </p>
                </div>
                <div class="recent-articles">
                    <h3>Recent Articles</h3>
                    ${generateRecentArticlesList()}
                </div>
            </div>
        `;
        
        // Add event listener to "Browse All Articles" button
        document.getElementById('all-articles-link').addEventListener('click', function(e) {
            e.preventDefault();
            showArticlesList(1);
        });
        
        setupRecentArticleLinks();
        
        // Update URL to home
        history.pushState({}, '', window.location.pathname);
    }
    
    // Add event listener to home link
    homeLink.addEventListener('click', function(e) {
        e.preventDefault();
        showHomePage();
    });
    
    // Create an article link that can be used in any content
    function createArticleLink(articleId, linkText) {
        const link = document.createElement('a');
        link.href = `?article=${articleId}`;
        link.textContent = linkText || `Read Article #${articleId}`;
        link.classList.add('inline-article-link');
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find the article menu item and activate it
            const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
            if (menuItem) {
                document.querySelectorAll('#article-menu li').forEach(item => {
                    item.classList.remove('active');
                });
                menuItem.parentElement.classList.add('active');
            }
            
            // Load the article
            loadArticle(articleId);
        });
        
        return link;
    }
    
    // Helper function to add article links to the DOM after content is loaded
    function setupContentArticleLinks() {
        // Find any article links in the current page content that have data-article-id
        // Explicitly exclude external links
        const contentLinks = document.querySelectorAll('.article-content a[data-article-id]:not(.external-link)');
        contentLinks.forEach(link => {
            const articleId = parseInt(link.getAttribute('data-article-id'));
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Activate the correct menu item
                const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
                if (menuItem) {
                    document.querySelectorAll('#article-menu li').forEach(item => {
                        item.classList.remove('active');
                    });
                    menuItem.parentElement.classList.add('active');
                }
                
                // Load the article
                loadArticle(articleId);
            });
        });
    }
    
    // Generate HTML for recent articles list
    function generateRecentArticlesList() {
        // Create a loading placeholder first
        let html = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading recent articles...</div>';
        
        // Load the recent articles in the background
        loadArticles().then(articlesData => {
            // Sort articles by date (most recent first)
            const sortedArticles = [...articlesData].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            // Take first 5 articles or all if less than 5
            const recentArticles = sortedArticles.slice(0, 5);
            
            // Update the HTML for the recent articles list
            const recentArticlesContainer = document.querySelector('.recent-articles');
            if (recentArticlesContainer) {
                let updatedHtml = '<h3>Recent Articles</h3><ul class="recent-articles-list">';
                recentArticles.forEach(article => {
                    updatedHtml += `
                        <li>
                            <a href="?article=${article.id}" class="recent-article-link" data-id="${article.id}">
                                <div class="recent-article-title">${article.title}</div>
                                <div class="recent-article-meta">
                                    <span class="recent-article-date"><i class="far fa-calendar-alt"></i> ${article.date}</span>
                                </div>
                            </a>
                        </li>
                    `;
                });
                updatedHtml += '</ul>';
                
                recentArticlesContainer.innerHTML = updatedHtml;
                setupRecentArticleLinks();
            }
        }).catch(error => {
            console.error('Failed to load recent articles:', error);
            const recentArticlesContainer = document.querySelector('.recent-articles');
            if (recentArticlesContainer) {
                recentArticlesContainer.innerHTML = '<h3>Recent Articles</h3><p class="error-message">Failed to load recent articles.</p>';
            }
        });
        
        return html;
    }
    
    // Setup click handlers for recent article links
    function setupRecentArticleLinks() {
        const recentLinks = document.querySelectorAll('.recent-article-link');
        recentLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const articleId = parseInt(this.getAttribute('data-id'));
                
                // Load the linked article
                loadArticle(articleId);
                
                // Update active menu item
                document.querySelectorAll('#article-menu li').forEach(item => {
                    item.classList.remove('active');
                });
                
                const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
                if (menuItem) {
                    menuItem.parentElement.classList.add('active');
                }
            });        });    }
    
    // Filter articles by category
    function filterArticlesByCategory(category) {
        loadArticles().then(articlesData => {
            const filteredArticles = articlesData.filter(article => 
                article.categories && article.categories.includes(category)
            );
            
            // Show filtered articles list
            showArticlesList(1, filteredArticles);
            
            // Update URL
            history.pushState({ category }, `Category: ${category}`, `?category=${encodeURIComponent(category)}`);
        }).catch(error => {
            console.error('Failed to filter articles by category:', error);
            articleContainer.innerHTML = `<div class="error-message">Failed to load articles: ${error.message}</div>`;
        });
    }
    
    // Create HTML for articles list with pagination
    function showArticlesList(page = 1, articlesList = null) {
        // If articlesList is not provided, load all articles
        if (articlesList === null) {
            loadArticles().then(articlesData => {
                renderArticlesList(articlesData, page);
            }).catch(error => {
                console.error('Failed to load articles:', error);
                articleContainer.innerHTML = `<div class="error-message">Failed to load articles: ${error.message}</div>`;
            });
        } else {
            renderArticlesList(articlesList, page);
        }
        
        // Update the document title
        document.title = "GSATechDose - Articles";
        
        // Update browser URL to include page number if not already included
        if (!window.location.search.includes('category') && 
            !window.location.search.includes('tag') && 
            !window.location.search.includes('search')) {
            history.pushState({ page }, `Articles - Page ${page}`, page > 1 ? `?page=${page}` : window.location.pathname);
        }
    }
    
    // Helper function to render the articles list
    function renderArticlesList(articlesList, page) {
        const articlesPerPage = 4; // Adjusted for better display
        const totalPages = Math.ceil(articlesList.length / articlesPerPage);
        
        // Ensure page is within bounds
        page = Math.max(1, Math.min(page, totalPages || 1));
        
        // Calculate start and end indices for current page
        const startIndex = (page - 1) * articlesPerPage;
        const endIndex = Math.min(startIndex + articlesPerPage, articlesList.length);
        
        // Get articles for current page
        const currentPageArticles = articlesList.slice(startIndex, endIndex);
        
        // Create HTML for articles list
        let html = '<div class="articles-list-container">';
        
        // Determine if we're showing filtered articles
        let headerTitle = 'All Articles';
        if (window.location.search.includes('category')) {
            const category = new URLSearchParams(window.location.search).get('category');
            headerTitle = `Articles in Category: ${category}`;
        } else if (window.location.search.includes('tag')) {
            const tag = new URLSearchParams(window.location.search).get('tag');
            headerTitle = `Articles Tagged: ${tag}`;
        }
        
        html += `<h1 class="articles-list-title">${headerTitle}</h1>`;
        
        // Add total count and pagination info
        html += `
            <div class="articles-list-info">
                <p class="articles-list-count">
                    <span class="count-total">${articlesList.length}</span> articles total, showing page 
                    <span class="count-page">${page}</span> of 
                    <span class="count-total-pages">${totalPages || 1}</span>
                </p>
            </div>
        `;
        
        if (currentPageArticles.length > 0) {
            html += '<div class="articles-list">';
            
            currentPageArticles.forEach(article => {
                // Extract a snippet from the content (remove HTML tags)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = article.content;
                const contentText = tempDiv.textContent || tempDiv.innerText;
                const snippet = contentText.substring(0, 200).trim() + '...';
                
                // Check if article has been read
                const isRead = isArticleRead(article.id);
                const readClass = isRead ? ' read' : '';
                
                html += `
                    <div class="article-list-item${readClass}">
                        <h2><a href="?article=${article.id}" data-id="${article.id}" class="article-list-link${readClass}">${article.title}</a></h2>
                        <div class="article-list-meta">
                            <span class="article-list-date"><i class="far fa-calendar-alt"></i> ${article.date}</span>
                            <span class="article-list-author"><i class="far fa-user"></i> ${article.author}</span>
                        </div>
                        <div class="article-list-categories">
                            ${article.categories ? article.categories.map(category => 
                                `<span class="article-category" data-category="${category}">${category}</span>`
                            ).join('') : ''}
                        </div>
                        <div class="article-list-tags">
                            ${article.tags ? article.tags.map(tag => 
                                `<span class="article-tag" data-tag="${tag}">${tag}</span>`
                            ).join('') : ''}
                        </div>
                        <p class="article-list-snippet">${snippet}</p>
                        <a href="?article=${article.id}" data-id="${article.id}" class="read-more-link">Read More</a>
                    </div>
                `;
            });
            
            html += '</div>';
            
            // Add pagination if needed
            if (totalPages > 1) {
                html += createPagination(page, totalPages, articlesList);
            }
        } else {
            html += '<p class="no-articles">No articles found.</p>';
        }
        
        html += '</div>';
        
        // Display the articles list
        articleContainer.innerHTML = html;
        
        // Add event listeners to article list links
        setupArticleListLinks();
        
        // Add event listeners to category and tag links
        setupCategoryAndTagLinks();
        
        // Add event listeners to pagination links
        setupPaginationLinks(articlesList);
        
        // Update ARIA attributes for accessibility
        document.dispatchEvent(new Event('contentLoaded'));
    }
    
    // Create pagination HTML
    function createPagination(currentPage, totalPages, articlesList) {
        let html = '<div class="pagination">';
        
        // Previous button
        const prevDisabled = currentPage === 1 ? ' pagination-disabled' : '';
        html += `<div class="pagination-item pagination-prev${prevDisabled}">
            <a href="#" class="pagination-link${prevDisabled}" data-page="${currentPage - 1}" aria-label="Previous page">
                <i class="fas fa-chevron-left"></i>
            </a>
        </div>`;
        
        // Page numbers
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        
        // Adjust startPage if we're near the end
        if (endPage - startPage < maxPageButtons - 1) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        
        // First page if not in range
        if (startPage > 1) {
            html += `<div class="pagination-item">
                <a href="#" class="pagination-link" data-page="1">1</a>
            </div>`;
            
            if (startPage > 2) {
                html += `<div class="pagination-item pagination-ellipsis">...</div>`;
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? ' active' : '';
            html += `<div class="pagination-item">
                <a href="#" class="pagination-link${activeClass}" data-page="${i}">${i}</a>
            </div>`;
        }
        
        // Last page if not in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<div class="pagination-item pagination-ellipsis">...</div>`;
            }
            
            html += `<div class="pagination-item">
                <a href="#" class="pagination-link" data-page="${totalPages}">${totalPages}</a>
            </div>`;
        }
        
        // Next button
        const nextDisabled = currentPage === totalPages ? ' pagination-disabled' : '';
        html += `<div class="pagination-item pagination-next${nextDisabled}">
            <a href="#" class="pagination-link${nextDisabled}" data-page="${currentPage + 1}" aria-label="Next page">
                <i class="fas fa-chevron-right"></i>
            </a>
        </div>`;
        
        html += '</div>';
        
        return html;
    }
    
    // Setup event listeners for pagination links
    function setupPaginationLinks(articlesList = null) {
        document.querySelectorAll('.pagination-link:not(.pagination-disabled)').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                
                if (articlesList) {
                    showArticlesList(page, articlesList);
                } else {
                    showArticlesList(page);
                }
                
                // Scroll to top of the article list
                document.querySelector('.articles-list-container').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    
    // Setup event listeners for article list links
    function setupArticleListLinks() {
        document.querySelectorAll('.article-list-link, .read-more-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const articleId = parseInt(this.getAttribute('data-id'));
                
                // Load the article
                loadArticle(articleId);
                
                // Mark as read
                this.classList.add('read');
                
                // Update active menu item
                document.querySelectorAll('#article-menu li').forEach(item => {
                    item.classList.remove('active');
                });
                
                const menuItem = document.querySelector(`#article-menu li a[data-id="${articleId}"]`);
                if (menuItem) {
                    menuItem.parentElement.classList.add('active');
                }
            });
        });
    }
    
    // Setup event listeners for category and tag links in article list
    function setupCategoryAndTagLinks() {
        // Category links
        document.querySelectorAll('.article-list-categories .article-category').forEach(category => {
            category.addEventListener('click', function(e) {
                e.preventDefault();
                const categoryName = this.getAttribute('data-category');
                filterArticlesByCategory(categoryName);
                
                // Update URL to include category parameter
                history.pushState({ category: categoryName }, '', `?category=${encodeURIComponent(categoryName)}`);
            });
        });
        
        // Tag links
        document.querySelectorAll('.article-list-tags .article-tag').forEach(tag => {
            tag.addEventListener('click', function(e) {
                e.preventDefault();
                const tagName = this.getAttribute('data-tag');
                filterArticlesByTag(tagName);
                
                // Update URL to include tag parameter
                history.pushState({ tag: tagName }, '', `?tag=${encodeURIComponent(tagName)}`);
            });
        });
    }
    
    // Filter articles by tag
    function filterArticlesByTag(tag) {
        loadArticles().then(articlesData => {
            const filteredArticles = articlesData.filter(article => 
                article.tags && article.tags.includes(tag)
            );
            
            // Show filtered articles list
            showArticlesList(1, filteredArticles);
            
            // Update URL
            history.pushState({ tag }, `Tag: ${tag}`, `?tag=${encodeURIComponent(tag)}`);
        }).catch(error => {
            console.error('Failed to filter articles by tag:', error);
            articleContainer.innerHTML = `<div class="error-message">Failed to load articles: ${error.message}</div>`;
        });
    }
      /**
     * Display a categories overview page with all categories as clickable links
     */
    function showCategoriesPage() {
        loadArticles().then(articlesData => {
            // Create a map to group articles by category
            const categoriesMap = new Map();
            
            // Group articles by category
            articlesData.forEach(article => {
                if (article.categories && Array.isArray(article.categories)) {
                    article.categories.forEach(category => {
                        if (!categoriesMap.has(category)) {
                            categoriesMap.set(category, []);
                        }
                        categoriesMap.get(category).push(article);
                    });
                }
            });
            
            // Sort categories alphabetically
            const sortedCategories = [...categoriesMap.keys()].sort();
            
            // Build HTML for categories overview page
            let html = `
                <div class="categories-page">
                    <div class="page-header">
                        <h1><i class="fas fa-tags"></i> Article Categories</h1>
                        <p class="page-intro">Browse our collection of articles organized by category. Click on any category to view all articles in that category.</p>
                    </div>
                    <div class="categories-grid">`;
            
            sortedCategories.forEach(category => {
                const articles = categoriesMap.get(category);
                const categoryId = category.toLowerCase().replace(/\s+/g, '-');
                
                // Get a few recent articles from this category for preview
                const recentArticles = [...articles]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 3);
                
                html += `
                    <div class="category-card" data-category="${category}">
                        <div class="category-header">
                            <h2 class="category-title">
                                <a href="?category=${encodeURIComponent(category)}" class="category-link" data-category="${category}">
                                    ${category}
                                </a>
                            </h2>
                            <span class="category-count">${articles.length} article${articles.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="category-preview">
                            <h4>Recent Articles:</h4>
                            <ul class="category-articles-preview">`;
                
                recentArticles.forEach(article => {
                    html += `
                        <li>
                            <a href="?article=${article.id}" class="article-preview-link" data-id="${article.id}">
                                ${article.title}
                            </a>
                            <span class="article-date">${article.date}</span>
                        </li>`;
                });
                
                if (articles.length > 3) {
                    html += `<li class="show-more">
                        <a href="?category=${encodeURIComponent(category)}" class="category-link" data-category="${category}">
                            View all ${articles.length} articles →
                        </a>
                    </li>`;
                }
                
                html += `
                            </ul>
                        </div>
                    </div>`;
            });
            
            html += `
                    </div>
                </div>`;
            
            // Update the article container
            articleContainer.innerHTML = html;
            
            // Setup event listeners for category links
            setupCategoryLinks();
            
            // Setup event listeners for article preview links
            setupArticleListLinks();
            
            // Update page title and URL
            document.title = "Categories - GSATechDose";
            history.pushState({page: "categories"}, "Categories - GSATechDose", "?page=categories");
        });
    }
    
    /**
     * Setup event listeners for category links
     */
    function setupCategoryLinks() {
        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                filterArticlesByCategory(category);
            });
        });
    }
      // Setup navigation functionality
    function setupNavigation() {
        // All Articles navigation
        if (allArticlesNav) {
            allArticlesNav.addEventListener('click', function(e) {
                e.preventDefault();
                showArticlesList(1);
                
                // Update page title and URL
                document.title = "All Articles - GSATechDose";
                history.pushState({page: "all-articles"}, "All Articles - GSATechDose", "?page=all-articles");
            });
        }
        
        // Categories navigation
        if (categoriesNav) {
            categoriesNav.addEventListener('click', function(e) {
                e.preventDefault();
                showCategoriesPage();
            });
        }
        
        // Home link functionality
        if (homeLink) {
            homeLink.addEventListener('click', function(e) {
                e.preventDefault();
                showHomePage();
                
                // Update page title and URL
                document.title = "GSATechDose - Articles";
                history.pushState({page: "home"}, "GSATechDose - Articles", window.location.pathname);
            });
        }
    }    // Mobile menu functionality
    function setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const sidebar = document.getElementById('sidebar');
        
        if (!mobileMenuToggle || !mobileOverlay || !sidebar) {
            return;
        }
        
        // Toggle mobile menu
        function toggleMobileMenu() {
            const isOpen = sidebar.classList.contains('mobile-open');
            
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }
        
        // Open mobile menu
        function openMobileMenu() {
            sidebar.classList.add('mobile-open');
            mobileOverlay.classList.add('active');
            mobileMenuToggle.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        }
        
        // Close mobile menu
        function closeMobileMenu() {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
        
        // Event listeners
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        mobileOverlay.addEventListener('click', closeMobileMenu);
        
        // Close menu when clicking on article links
        const articleLinks = sidebar.querySelectorAll('a');
        articleLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Close mobile menu after a short delay to allow navigation
                setTimeout(closeMobileMenu, 150);
            });
        });
          // Close menu on window resize if screen becomes larger
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                closeMobileMenu();
            }
        });
        
        // Handle orientation change for better mobile UX
        window.addEventListener('orientationchange', () => {
            // Small delay to account for orientation change
            setTimeout(() => {
                if (window.innerWidth >= 768) {
                    closeMobileMenu();
                }
            }, 100);
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        });
    }
    
    // Initialize the page
    populateMenu();
    
    // Add a small delay to ensure all DOM elements are ready
    setTimeout(() => {
        setupSearch();
        setupThemeToggle();
        setupNavigation();
        setupMobileMenu();
    }, 100);
    
    // We'll handle URL parameters in checkUrlParams,
    // no need for a separate check for home page
    checkUrlParams();
      // Handle browser back/forward navigation
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.articleId) {
            loadArticle(event.state.articleId);
            
            // Update active menu item
            document.querySelectorAll('#article-menu li').forEach(item => {
                item.classList.remove('active');
            });
            
            const menuItem = document.querySelector(`#article-menu li a[data-id="${event.state.articleId}"]`);
            if (menuItem) {
                menuItem.parentElement.classList.add('active');
            }
        } else if (event.state && event.state.search) {
            // There was a search query in the state
            searchInput.value = event.state.search;
            performSearch(event.state.search);
        } else if (event.state && event.state.category) {
            filterArticlesByCategory(event.state.category);
        } else if (event.state && event.state.tag) {
            filterArticlesByTag(event.state.tag);
        } else if (event.state && event.state.page === "categories") {
            showCategoriesPage();
        } else if (event.state && event.state.page === "all-articles") {
            showArticlesList(1);
        } else {
            // If no state, show welcome message
            searchInput.value = '';
            showHomePage();
        }
    });
});
