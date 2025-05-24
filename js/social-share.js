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
            },
            linkedin: {
                name: 'LinkedIn',
                icon: 'fab fa-linkedin-in',
                color: '#0077B5',
                shareUrl: `https://www.linkedin.com/shareArticle?mini=true&url=${this.shareUrl}`
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
    }

    /**
     * Setup event handlers for share buttons
     */
    setupEventHandlers() {
        // Update share URLs with current page URL
        this.shareUrl = window.location.href;
        
        // Copy Link button
        document.querySelectorAll('.social-share-button.copy-link').forEach(button => {
            button.addEventListener('click', () => {
                this.copyLinkToClipboard();
            });
        });
    }

    /**
     * Copy the current page URL to clipboard
     */
    copyLinkToClipboard() {
        const el = document.createElement('textarea');
        el.value = window.location.href;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        
        // Show feedback
        const button = document.querySelector('.social-share-button.copy-link');
        const originalHTML = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }

    /**
     * Update share URLs with current page URL and article title
     * @param {string} title - The title of the article
     */
    updateShareUrls(title = '') {
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        const encodedTitle = encodeURIComponent(title);
        
        // Update Twitter
        const twitterButton = document.querySelector('.social-share-button.twitter');
        if (twitterButton) {
            twitterButton.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        }
        
        // Update Facebook
        const facebookButton = document.querySelector('.social-share-button.facebook');
        if (facebookButton) {
            facebookButton.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        }
        
        // Update LinkedIn
        const linkedinButton = document.querySelector('.social-share-button.linkedin');
        if (linkedinButton) {
            linkedinButton.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
        }
        
        // Update Email
        const emailButton = document.querySelector('.social-share-button.email');
        if (emailButton) {
            emailButton.href = `mailto:?subject=${encodedTitle}&body=I thought you might find this interesting: ${encodedUrl}`;
        }
    }
}
