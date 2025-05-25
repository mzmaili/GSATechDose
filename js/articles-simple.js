// Articles in a structured, markdown-like format for easier management
// This new format makes it easier to read and add new articles, similar to GitHub's organization

/**
 * Function to render markdown-like content into HTML 
 * @param {string} content - The markdown-like content
 * @returns {string} - HTML representation of the content
 */
function renderMarkdown(content) {
    // Basic markdown-like rendering
    let html = content;
    
    // Handle code blocks first (```language\ncode\n```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const langClass = language ? ` class="language-${language}"` : '';
        return `<pre><code${langClass}>${code.trim()}</code></pre>`;
    });
      // Handle images ![alt text](url) - MUST be before paragraph processing
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        return `<img src="${src}" alt="${alt}" class="article-image">`;
    });
    
    // Handle headings
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    
    // Handle blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Handle horizontal rules
    html = html.replace(/^---\s*$/gm, '<hr>');
    
    // Handle unordered lists
    let inList = false;
    const lines = html.split('\n');
    html = lines.map((line, index) => {
        if (line.trim().startsWith('- ')) {
            const itemContent = line.trim().substring(2);
            if (!inList) {
                inList = true;
                return `<ul><li>${itemContent}</li>`;
            } else {
                return `<li>${itemContent}</li>`;
            }
        } else {
            if (inList) {
                inList = false;
                return `</ul>${line}`;
            } else {
                return line;
            }
        }
    }).join('\n');
    
    // Close any open list at the end
    if (inList) {
        html += '</ul>';
    }
    
    // Handle links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        const isExternal = /^https?:\/\//.test(url);
        if (isExternal) {
            return `<a href="${url}" class="external-link" target="_blank" rel="noopener">${text}</a>`;
        } else {
            return `<a href="${url}" class="article-link">${url}</a>`;
        }
    });
    
    // Handle article links [articleId:title]
    html = html.replace(/\[(\d+):([^\]]+)\]/g, (match, id, title) => {
        return `<a href="?article=${id}" class="article-link" data-article-id="${id}">${title}</a>`;
    });
      // Handle bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle paragraphs (empty line delimited text) - MUST be last and exclude HTML elements
    // Split by lines and process each line individually to avoid wrapping HTML elements
    const paragraphLines = html.split('\n');
    html = paragraphLines.map(line => {
        const trimmedLine = line.trim();
        // Skip empty lines, HTML tags, and lines that are already processed
        if (!trimmedLine || 
            trimmedLine.startsWith('<') || 
            trimmedLine.includes('<img') ||
            trimmedLine.includes('<h1') ||
            trimmedLine.includes('<h2') ||
            trimmedLine.includes('<h3') ||
            trimmedLine.includes('<pre') ||
            trimmedLine.includes('<blockquote') ||
            trimmedLine.includes('<ul') ||
            trimmedLine.includes('<li') ||
            trimmedLine.includes('</')) {
            return line;
        }
        // Only wrap in <p> if it's plain text
        return `<p>${line}</p>`;
    }).join('\n');
    
    return html;
}

/**
 * Function to generate the HTML structure for an article
 * @param {Object} article - The article object
 * @returns {string} - The complete HTML for the article
 */
async function generateArticleHTML(article) {
    // Ensure we have all articles loaded for navigation
    const allArticles = await loadArticles();
    
    // Generate header
    let html = `<div class="article">
        <div class="article-header">
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
                <span class="article-date"><i class="far fa-calendar-alt"></i> ${article.date}</span>
                <span class="article-author"><i class="far fa-user"></i> ${article.author}</span>
            </div>
            <div class="article-categories">
                <span class="article-category-label">Categories:</span>
                ${article.categories.map(category => `<span class="article-category">${category}</span>`).join('')}
            </div>
            <div class="article-tags">
                ${article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
            </div>
        </div>
        <div class="article-content">`;
      // Add the rendered markdown content
    html += renderMarkdown(article.content);
    
    // Close the article-content div
    html += `</div>`;
    
    // Generate navigation outside of article-content but inside article container
    html += `<div class="article-nav">`;
      // Add previous article link if not the first article
    if (article.id > 1) {
        const prevId = article.id - 1;
        const prevArticle = allArticles.find(a => a.id === prevId);
        const prevTitle = prevArticle ? prevArticle.title : `GSATechDose #${prevId}`;
        html += `<div class="article-nav-prev">
            <a href="?article=${prevId}" class="article-link" data-article-id="${prevId}">
                <i class="fas fa-arrow-left"></i> Previous: ${prevTitle}
            </a>
        </div>`;
    } else {
        // Add empty div to maintain layout even when no previous article
        html += `<div class="article-nav-prev"></div>`;
    }
    
    // Add next article link if not the last article
    if (article.id < allArticles.length) {
        const nextId = article.id + 1;
        const nextArticle = allArticles.find(a => a.id === nextId);
        const nextTitle = nextArticle ? nextArticle.title : `GSATechDose #${nextId}`;
        html += `<div class="article-nav-next">
            <a href="?article=${nextId}" class="article-link" data-article-id="${nextId}">
                Next: ${nextTitle} <i class="fas fa-arrow-right"></i>
            </a>
        </div>`;
    } else {
        // Add empty div to maintain layout even when no next article
        html += `<div class="article-nav-next"></div>`;
    }
    
    // Close navigation div and article div
    html += `</div></div>`;
    
    return html;
}

// Article data in a GitHub-like structure for easy editing
// Articles are embedded directly in this file for easy management
let articles = [];
let articlesIndex = null;
let articlesLoaded = false;

// Embedded articles data with full content
const embeddedArticles = [
    {
        id: 1,
        title: "GSATechDose #1",
        date: "May 21, 2025",
        author: "GSATechDose Team",
        categories: ["Global Secure Access", "Entra Internet Access", "Entra Private Access"],
        tags: ["Global Secure Access", "Entra Internet Access", "Entra Private Access"],
        content: "![GSATechDose Logo](images/TechDose1.png)\n 🔐 **Did you know?** Microsoft's Global Secure Access brings together Entra Internet Access and Entra Private Access into a unified platform, enabling secure, identity-aware access to both public and private resources.\n\nThis is a game-changer for organizations embracing Zero Trust. With Global Secure Access, you can:\n ✅ Enforce Conditional Access policies across all traffic\n ✅ Protect users from malicious internet threats\n ✅ Secure access to internal apps without VPNs\n ✅ Leverage Microsoft's global edge network for performance and reliability\n\nWhether you're securing SaaS apps or legacy internal systems, this solution helps you do it all, securely and seamlessly.\n\n🔗 Learn more: [Microsoft Learn – What is Global Secure Access](https://learn.microsoft.com/en-us/entra/global-secure-access/)"
    },
    {
        id: 2,
        title: "GSATechDose #2",
        date: "May 22, 2025",
        author: "GSATechDose Team",
        categories: ["Global Secure Access", "Entra Private Access"],
        tags: ["Global Secure Access", "Entra Private Access", "Zero Trust", "VPN replacement", "getting started"],
        content: "![GSATechDose Logo](images/TechDose2.png)\n\n# 🚀 How to Get Started with Microsoft Global Secure Access\n\nLooking to modernize your network security and embrace Zero Trust? Microsoft's Global Secure Access is your gateway to secure, identity-aware access for both internet and private resources—without the need for legacy VPNs.\n\nHere's how to get started:\n\n✅ Enable 𝗘𝗻𝘁𝗿𝗮 𝗣𝗿𝗶𝘃𝗮𝘁𝗲 𝗔𝗰𝗰𝗲𝘀𝘀\n\n✅ Install & configure the 𝗣𝗿𝗶𝘃𝗮𝘁𝗲 𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗼𝗿\n\n✅ Set up 𝗤𝘂𝗶𝗰𝗸 𝗔𝗰𝗰𝗲𝘀𝘀 as a VPN replacement\n\n✅ Install the 𝗚𝗹𝗼𝗯𝗮𝗹 𝗦𝗲𝗰𝘂𝗿𝗲 𝗔𝗰𝗰𝗲𝘀𝘀 𝗖𝗹𝗶𝗲𝗻𝘁\n\n✅ Seamlessly access 𝗼𝗻-𝗽𝗿𝗲𝗺 𝘀𝗵𝗮𝗿𝗲𝗱 𝗳𝗼𝗹𝗱𝗲𝗿𝘀\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\n[https://www.youtube.com/watch?v=MfcZ3zQhF-4](https://www.youtube.com/watch?v=MfcZ3zQhF-4)"
    },
    {
        id: 3,
        title: "GSATechDose #3",
        date: "May 23, 2025",
        author: "GSATechDose Team",
        categories: ["Global Secure Access", "Entra Internet Access", "Entra Private Access"],
        tags: ["Global Secure Access", "Entra Internet Access", "Entra Private Access"],
        content: "![GSATechDose Logo](images/GSATechDose3.png)\n\n🚀 𝗜𝗻𝘁𝗿𝗼𝗱𝘂𝗰𝗶𝗻𝗴 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗻𝘁𝗿𝗮 𝗚𝗹𝗼𝗯𝗮𝗹 𝗦𝗲𝗰𝘂𝗿𝗲 𝗔𝗰𝗰𝗲𝘀𝘀 🚀\n\nIn today's dynamic work environment, securing access to applications and data from anywhere is crucial. Microsoft Entra Global Secure Access is a comprehensive Security Service Edge (SSE) solution, designed to meet these modern needs.\n\n🔒 𝗞𝗲𝘆 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:\n  • 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗻𝘁𝗿𝗮 𝗜𝗻𝘁𝗲𝗿𝗻𝗲𝘁 𝗔𝗰𝗰𝗲𝘀𝘀: Protects access to internet and SaaS apps with an identity-based Secure Web Gateway (SWG).\n  • 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗻𝘁𝗿𝗮 𝗣𝗿𝗶𝘃𝗮𝘁𝗲 𝗔𝗰𝗰𝗲𝘀𝘀: Provides secure access to private, corporate resources without requiring a VPN.\n  • 𝗭𝗲𝗿𝗼 𝗧𝗿𝘂𝘀𝘁 𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗹𝗲𝘀: Built on least privilege, verify explicitly, and assume breach.\n\n🌐 𝗪𝗵𝘆 𝗖𝗵𝗼𝗼𝘀𝗲 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗻𝘁𝗿𝗮 𝗚𝗹𝗼𝗯𝗮𝗹 𝗦𝗲𝗰𝘂𝗿𝗲 𝗔𝗰𝗰𝗲𝘀𝘀?\n  • Unified access policy management for employees, partners, and digital workloads.\n  • Continuous monitoring and real-time adjustments to user access.\n  • Seamless integration with Microsoft Defender for Cloud Apps and other security solutions.\n\nJoin us in embracing a secure, cloud-delivered network perimeter that ensures optimal connectivity and security for your organization.\n\n🔗 Learn more: [What is Global Secure Access?](https://learn.microsoft.com/en-us/entra/global-secure-access/overview-what-is-global-secure-access)"
    },
    {
        id: 4,
        title: "GSATechDose #4",
        date: "May 24, 2025",
        author: "GSATechDose Team",
        categories: ["Global Secure Access", "Entra Internet Access"],
        tags: ["web filtering", "global secure access", "content filtering", "security"],
        content: "![GSATechDose Logo](images/GSATechDose4.png)\n\n# 🚀 Enhance Your Internet Security with Microsoft Entra 🚀\nIn today's digital age, safeguarding your organization's internet access is crucial. Microsoft Entra Global Secure Access offers robust web content filtering, allowing you to implement granular controls based on website categorization. This ensures a secure and productive online environment for your team.\n🔒 Key Benefits:\n•\tGranular Control: Customize internet access based on specific website categories.\n•\tEnhanced Security: Protect your organization from malicious sites and content.\n•\tProductivity Boost: Ensure employees access only work-related websites during business hours.\nStay ahead in the cybersecurity game with Microsoft Entra! 💼🔐\n\n🔗 Learn more: [Microsoft Entra Internet Access - Global Secure Access | Microsoft Learn](https://learn.microsoft.com/en-us/entra/global-secure-access/concept-internet-access)"
    },
    {
        id: 5,
        title: "GSATechDose #5",
        date: "May 24, 2025",
        author: "GSATechDose Team",
        categories: ["Global Secure Access", "Entra Internet Access"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/GSATechDose5.png)\n\n# 🌍 𝗨𝘀𝗲 𝗖𝗮𝘀𝗲 𝗦𝗽𝗼𝘁𝗹𝗶𝗴𝗵𝘁: 𝗦𝗲𝗰𝘂𝗿𝗶𝗻𝗴 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝟯𝟲𝟱 𝗔𝗰𝗰𝗲𝘀𝘀 — 𝗔𝗻𝘆𝘁𝗶𝗺𝗲, 𝗔𝗻𝘆𝘄𝗵𝗲𝗿𝗲\n\nYour workforce is no longer confined to the office. They're working from coffee shops, airports, home offices — and everywhere in between. But is your Microsoft 365 access truly secure in this new reality?\n\nWith 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗻𝘁𝗿𝗮 𝗜𝗻𝘁𝗲𝗿𝗻𝗲𝘁 𝗔𝗰𝗰𝗲𝘀𝘀, you can ensure:\n\n🔐 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻-𝗶𝗻𝗱𝗲𝗽𝗲𝗻𝗱𝗲𝗻𝘁 𝗖𝗼𝗻𝗱𝗶𝘁𝗶𝗼𝗻𝗮𝗹 𝗔𝗰𝗰𝗲𝘀𝘀 — enforce your policies no matter where users connect\n📶 𝗢𝗽𝘁𝗶𝗺𝗶𝘇𝗲𝗱 𝗰𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝘃𝗶𝘁𝘆 — prioritize M365 traffic for better performance and reliability\n🛡️ 𝗕𝘂𝗶𝗹𝘁-𝗶𝗻 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 — prevent data exfiltration with integrated security capabilities\n🚫 𝗡𝗼 𝗩𝗣𝗡𝘀. No legacy appliances.\n✅ Just fast, secure, 𝗶𝗱𝗲𝗻𝘁𝗶𝘁𝘆-𝗮𝘄𝗮𝗿𝗲 𝗮𝗰𝗰𝗲𝘀𝘀 — designed for the modern workforce\n🔗 Learn more: [Microsoft Entra Internet Access - Global Secure Access | Microsoft Learn](https://learn.microsoft.com/en-us/entra/global-secure-access/concept-internet-access)"
    },
    {
        id: 6,
        title: "GSATechDose #6",
        date: "May 24, 2025",
        author: "GSATechDose Team",
        categories: ["Global Secure Access", "Entra Private Access"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose6.png)\n\n# 🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    }
];

/**
 * Load all articles from embedded data
 * @returns {Promise} A promise that resolves with the articles array
 */
async function loadArticles() {
    if (articlesLoaded && articles.length > 0) {
        console.log('Articles already loaded, returning cached data:', articles.length);
        return articles;
    }
    
    console.log('Loading articles from embedded data...');
    
    // Use embedded articles data
    articles = [...embeddedArticles];
    articlesLoaded = true;
    console.log('Articles loaded from embedded data:', articles.length);
    return articles;
}

/**
 * Get an article by ID
 * @param {number} id The article ID
 * @returns {Promise} A promise that resolves with the article data
 */
async function getArticleById(id) {
    console.log(`Getting article ID ${id}...`);
    const numericId = parseInt(id);
    
    // First ensure articles are loaded
    await loadArticles();
    
    // Find in loaded articles
    let article = articles.find(article => article.id === numericId);
    
    if (article) {
        // Generate HTML if it hasn't been generated yet
        if (!article.hasOwnProperty('contentHTML')) {
            article.contentHTML = await generateArticleHTML(article);
        }
        // Set the content to the cached or newly generated HTML
        article.content = article.contentHTML;
        console.log(`Found article ${id}:`, article.title);
    } else {
        console.log(`Article ${id} not found`);
    }    
    return article;
}