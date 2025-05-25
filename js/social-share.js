/**
 * Social Sharing Functionality
 * Provides sharing capability for articles on GSATechDose
 */

class SocialShare {
    constructor() {
        this.shareUrl = window.location.href;
        this.networks = {
            twitter: {
                name: 'Twitter',
                icon: 'fab fa-twitter',
                color: '#1DA1F2',
                shareUrl: `https://twitter.com/intent/tweet?url=${this.shareUrl}&text=`
            },
            facebook: {
                name: 'Facebook',
                icon: 'fab fa-facebook-f',
                color: '#4267B2',
                shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${this.shareUrl}`
            },            linkedin: {
                name: 'LinkedIn',
                icon: 'fab fa-linkedin-in',
                color: '#0077B5',
                shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${this.shareUrl}`
            },
            email: {
                name: 'Email',
                icon: 'fas fa-envelope',
                color: '#738A8D',
                shareUrl: `mailto:?subject=Check out this article&body=I thought you might find this interesting: ${this.shareUrl}`
            },
            copy: {
                name: 'Copy Link',
                icon: 'fas fa-link',
                color: '#333333'
            }
        };
    }

    /**
     * Generate HTML for social sharing buttons
     * @param {string} title - The title of the article to share
     * @returns {string} HTML for social sharing buttons
     */
    generateShareButtons(title = '') {
        const encodedTitle = encodeURIComponent(title);
        let html = '<div class="social-share-container">';
        html += '<h4 class="social-share-title">Share This Article</h4>';
        html += '<div class="social-share-buttons">';
        
        // Twitter
        html += this.createShareButton(
            'twitter',
            `${this.networks.twitter.shareUrl}${encodedTitle}`
        );
        
        // Facebook
        html += this.createShareButton(
            'facebook',
            this.networks.facebook.shareUrl
        );
        
        // LinkedIn
        html += this.createShareButton(
            'linkedin',
            this.networks.linkedin.shareUrl
        );
        
        // Email
        html += this.createShareButton(
            'email',
            this.networks.email.shareUrl
        );
        
        // Copy Link
        html += `<button class="social-share-button copy-link" data-network="copy" title="Copy link">
            <i class="${this.networks.copy.icon}"></i>
        </button>`;
        
        html += '</div>';
        html += '</div>';
        
        return html;
    }

    /**
     * Create a single share button
     * @param {string} network - The social network name
     * @param {string} url - The share URL
     * @returns {string} HTML button
     */
    createShareButton(network, url) {
        const networkInfo = this.networks[network];
        return `<a class="social-share-button ${network}" href="${url}" target="_blank" rel="noopener noreferrer" title="Share on ${networkInfo.name}">
            <i class="${networkInfo.icon}"></i>
        </a>`;
    }    /**
     * Setup event handlers for share buttons
     */
    setupEventHandlers() {
        // Update share URLs with current page URL
        this.shareUrl = window.location.href;
        
        // Copy Link button
        document.querySelectorAll('.social-share-button.copy-link').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.copyLinkToClipboard();
            });
        });

        // Add analytics tracking for social shares (optional)
        document.querySelectorAll('.social-share-button[href]').forEach(button => {
            button.addEventListener('click', (e) => {
                const network = button.classList.contains('twitter') ? 'twitter' :
                              button.classList.contains('facebook') ? 'facebook' :
                              button.classList.contains('linkedin') ? 'linkedin' :
                              button.classList.contains('email') ? 'email' : 'unknown';
                
                // You can add analytics tracking here if needed
                console.log(`Shared via ${network}:`, window.location.href);
            });
        });
    }/**
     * Copy the current page URL to clipboard using modern Clipboard API
     */
    async copyLinkToClipboard() {
        const button = document.querySelector('.social-share-button.copy-link');
        const originalHTML = button.innerHTML;
        
        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(window.location.href);
                this.showCopySuccess(button, originalHTML);
            } else {
                // Fallback to older method for non-HTTPS environments
                this.fallbackCopyToClipboard(window.location.href);
                this.showCopySuccess(button, originalHTML);
            }
        } catch (err) {
            console.error('Failed to copy URL to clipboard:', err);
            this.showCopyError(button, originalHTML);
        }
    }

    /**
     * Fallback copy method for older browsers or non-HTTPS
     */
    fallbackCopyToClipboard(text) {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    /**
     * Show success feedback for copy action
     */
    showCopySuccess(button, originalHTML) {
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        button.title = 'Link copied!';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
            button.title = 'Copy link';
        }, 2000);
    }

    /**
     * Show error feedback for copy action
     */
    showCopyError(button, originalHTML) {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        button.style.backgroundColor = '#f44336';
        button.title = 'Copy failed - try again';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.backgroundColor = '';
            button.title = 'Copy link';
        }, 2000);
    }    /**
     * Update share URLs with current page URL and article title
     * @param {string} title - The title of the article
     */
    updateShareUrls(title = '') {
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        // Clean and properly encode the title
        const cleanTitle = title.replace(/[^\w\s-]/g, '').trim();
        const encodedTitle = encodeURIComponent(cleanTitle);
        
        // Update Twitter
        const twitterButton = document.querySelector('.social-share-button.twitter');
        if (twitterButton) {
            const twitterText = cleanTitle ? `${cleanTitle} - ` : '';
            twitterButton.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(twitterText + 'Check out this article from GSATechDose')}`;
        }
        
        // Update Facebook
        const facebookButton = document.querySelector('.social-share-button.facebook');
        if (facebookButton) {
            facebookButton.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        }
          // Update LinkedIn
        const linkedinButton = document.querySelector('.social-share-button.linkedin');
        if (linkedinButton) {
            linkedinButton.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        }
        
        // Update Email
        const emailButton = document.querySelector('.social-share-button.email');
        if (emailButton) {
            const emailSubject = cleanTitle || 'Check out this article from GSATechDose';
            const emailBody = `I thought you might find this interesting:\n\n${cleanTitle ? cleanTitle + '\n' : ''}${currentUrl}\n\nFrom GSATechDose - Your Regular Dose of Global Secure Access Insights`;
            emailButton.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        }
    }

    /**
     * Update meta tags for better social sharing
     * @param {string} title - The article title
     * @param {string} description - The article description/excerpt
     * @param {string} url - The current page URL
     */
    updateMetaTags(title = '', description = '', url = '') {
        const currentUrl = url || window.location.href;
        const pageTitle = title || 'GSATechDose - Articles';
        const pageDescription = description || 'Your Regular Dose of Global Secure Access Insights';
        
        // Update Open Graph tags
        this.updateMetaTag('property', 'og:title', pageTitle);
        this.updateMetaTag('property', 'og:description', pageDescription);
        this.updateMetaTag('property', 'og:url', currentUrl);
        
        // Update Twitter card tags
        this.updateMetaTag('name', 'twitter:title', pageTitle);
        this.updateMetaTag('name', 'twitter:description', pageDescription);
        
        // Update page title
        document.title = pageTitle;
    }

    /**
     * Helper function to update or create meta tags
     * @param {string} attribute - The attribute name (name or property)
     * @param {string} attributeValue - The attribute value
     * @param {string} content - The content value
     */
    updateMetaTag(attribute, attributeValue, content) {
        let metaTag = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
        if (metaTag) {
            metaTag.setAttribute('content', content);
        } else {
            metaTag = document.createElement('meta');
            metaTag.setAttribute(attribute, attributeValue);
            metaTag.setAttribute('content', content);
            document.head.appendChild(metaTag);
        }
    }
}
