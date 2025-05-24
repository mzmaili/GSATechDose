/**
 * Accessibility Enhancements
 * Improves accessibility features for GSATechDose website
 */
class AccessibilityHelper {
    constructor() {
        this.initializeAccessibility();
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        this.setupFocusIndicator();
        this.setupSkipLink();
        this.setupAriaAttributes();
        this.setupKeyboardNavigation();
    }

    /**
     * Setup visible focus indicator
     */
    setupFocusIndicator() {
        // Add visible focus class to focused elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        // Remove visible focus class when mouse is used
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }

    /**
     * Create skip navigation link
     */
    setupSkipLink() {
        // Create skip to main content link
        const skipLink = document.createElement('a');
        skipLink.id = 'skip-link';
        skipLink.href = '#article-container';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';

        // Insert at the beginning of the body
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add focus handler to make the target visible
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById('article-container');
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
                // Remove tabindex after focus (to avoid weird tab order)
                setTimeout(() => {
                    target.removeAttribute('tabindex');
                }, 1000);
            }
        });
    }

    /**
     * Add ARIA attributes to improve screen reader experience
     */
    setupAriaAttributes() {
        // Set main content role
        const articleContainer = document.getElementById('article-container');
        if (articleContainer) {
            articleContainer.setAttribute('role', 'main');
            articleContainer.setAttribute('aria-live', 'polite');
        }

        // Set navigation role for sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.setAttribute('role', 'navigation');
            sidebar.setAttribute('aria-label', 'Main navigation');
        }

        // Set search role
        const searchContainer = document.querySelector('.sidebar-search');
        if (searchContainer) {
            searchContainer.setAttribute('role', 'search');
        }
    }

    /**
     * Setup keyboard navigation for interactive elements
     */
    setupKeyboardNavigation() {
        // Make non-interactive elements with click handlers focusable
        document.querySelectorAll('.article-category, .article-tag').forEach(el => {
            if (!el.getAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }

            // Trigger click on Enter or Space
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.click();
                }
            });
        });
    }

    /**
     * Update ARIA attributes when content changes
     * This should be called after dynamic content updates
     */
    updateAriaForDynamicContent() {
        // Update heading hierarchy
        this.checkHeadingHierarchy();
        
        // Ensure all images have alt text
        this.checkImagesForAltText();
        
        // Ensure all links have accessible text
        this.checkLinksForAccessibleText();
    }

    /**
     * Check and report heading hierarchy issues
     */
    checkHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            
            // Check for skipped levels (e.g., h1 to h3)
            if (level - lastLevel > 1 && lastLevel !== 0) {
                console.warn('Accessibility: Heading level skipped', {
                    last: `h${lastLevel}`,
                    current: heading.tagName,
                    text: heading.textContent
                });
            }
            
            lastLevel = level;
        });
    }

    /**
     * Check and report images without alt text
     */
    checkImagesForAltText() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                console.warn('Accessibility: Image missing alt text', img);
                // Add empty alt if missing (better than nothing for screen readers)
                img.alt = '';
            }
        });
    }

    /**
     * Check links for accessible text
     */
    checkLinksForAccessibleText() {
        const links = document.querySelectorAll('a');
        
        links.forEach(link => {
            const linkText = link.textContent.trim();
            
            if (linkText === '' && !link.getAttribute('aria-label') && !link.querySelector('img[alt]')) {
                console.warn('Accessibility: Link may not have accessible text', link);
            } else if (/^click here$/i.test(linkText) || /^here$/i.test(linkText)) {
                console.warn('Accessibility: Link uses generic text like "click here"', link);
            }
        });
    }
}

// Initialize accessibility features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityHelper = new AccessibilityHelper();
});

// Update ARIA attributes after content changes
document.addEventListener('contentLoaded', () => {
    if (window.accessibilityHelper) {
        window.accessibilityHelper.updateAriaForDynamicContent();
    }
});
