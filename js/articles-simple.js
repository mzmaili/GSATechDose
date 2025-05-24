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
            return `<a href="${url}" class="article-link">${text}</a>`;
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
// Articles are now loaded from individual JSON files in the articles/ directory
// with a fallback to embedded data for direct file opening
let articles = [];
let articlesIndex = null;
let articlesLoaded = false;

// Minimal fallback embedded articles data for when files cannot be loaded (CORS restrictions)
// This is just basic metadata - the actual content is loaded from articles/*.json files
const embeddedArticles = [
    {
        id: 1,
        title: "GSATechDose #1",
        date: "May 21, 2025",
        author: "GSATechDose Team",
        categories: ["Introduction", "Security"],
        tags: ["welcome", "Global Secure Access", "Zero Trust"],
        content: "![GSATechDose Logo](images/TechDose1.png)\n 🔐 **Did you know?** Microsoft's Global Secure Access brings together Entra Internet Access and Entra Private Access into a unified platform, enabling secure, identity-aware access to both public and private resources.\n\nThis is a game-changer for organizations embracing Zero Trust. With Global Secure Access, you can:\n ✅ Enforce Conditional Access policies across all traffic\n ✅ Protect users from malicious internet threats\n ✅ Secure access to internal apps without VPNs\n ✅ Leverage Microsoft's global edge network for performance and reliability\n\nWhether you're securing SaaS apps or legacy internal systems, this solution helps you do it all, securely and seamlessly.\n\n🔗 Learn more: [Microsoft Learn – What is Global Secure Access](https://learn.microsoft.com/en-us/entra/global-secure-access/)"
    },    {
        id: 2,
        title: "GSATechDose #2",
        date: "May 22, 2025",
        author: "GSATechDose Team",
        categories: ["Security", "Tutorial", "Zero Trust"],
        tags: ["Global Secure Access", "Entra Private Access", "Zero Trust", "VPN replacement", "getting started"],
        content: "![GSATechDose Logo](images/TechDose2.png)\n\n# 🚀 How to Get Started with Microsoft Global Secure Access\n\nLooking to modernize your network security and embrace Zero Trust? Microsoft's Global Secure Access is your gateway to secure, identity-aware access for both internet and private resources—without the need for legacy VPNs.\n\nHere's how to get started:\n\n✅ Enable 𝗘𝗻𝘁𝗿𝗮 𝗣𝗿𝗶𝘃𝗮𝘁𝗲 𝗔𝗰𝗰𝗲𝘀𝘀\n\n✅ Install & configure the 𝗣𝗿𝗶𝘃𝗮𝘁𝗲 𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗼𝗿\n\n✅ Set up 𝗤𝘂𝗶𝗰𝗸 𝗔𝗰𝗰𝗲𝘀𝘀 as a VPN replacement\n\n✅ Install the 𝗚𝗹𝗼𝗯𝗮𝗹 𝗦𝗲𝗰𝘂𝗿𝗲 𝗔𝗰𝗰𝗲𝘀𝘀 𝗖𝗹𝗶𝗲𝗻𝘁\n\n✅ Seamlessly access 𝗼𝗻-𝗽𝗿𝗲𝗺 𝘀𝗵𝗮𝗿𝗲𝗱 𝗳𝗼𝗹𝗱𝗲𝗿𝘀\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\n[https://www.youtube.com/watch?v=MfcZ3zQhF-4](https://www.youtube.com/watch?v=MfcZ3zQhF-4)"
    },
    {
        id: 3,
        title: "GSATechDose #3",
        date: "May 23, 2025",
        author: "Web Development Team",
        categories: ["Web Development", "Tutorial"],
        tags: ["HTML", "CSS", "JavaScript", "best practices"],
        content: "In this article, we'll cover essential web development best practices that every developer should follow to create high-quality, maintainable websites.\n\n## 1. Write Semantic HTML\nUsing semantic HTML elements like <header>, <nav>, <section>, and <footer> makes your code more readable and improves accessibility.\n\n## 2. Follow CSS Naming Conventions\nAdopt a consistent naming convention like BEM (Block, Element, Modifier) to create more maintainable CSS code.\n\n## 3. Optimize Performance\nMinimize HTTP requests, compress images, and use lazy loading to improve page load times.\n\n## 4. Ensure Accessibility\nMake your website accessible to all users, including those with disabilities, by following WCAG guidelines."
    },
    {
        id: 4,
        title: "GSATechDose #4",
        date: "May 24, 2025",
        author: "Cloud Team",
        categories: ["Cloud Computing", "Tutorial"],
        tags: ["AWS", "Azure", "GCP", "cloud"],
        content: "Cloud computing has revolutionized the way businesses deploy and manage their IT infrastructure. In this article, we'll explore the basics of cloud computing and its benefits.\n\n## What is Cloud Computing?\nCloud computing is the delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet (\"the cloud\").\n\n## Types of Cloud Services\n- **IaaS (Infrastructure as a Service)**: Provides virtualized computing resources over the internet.\n- **PaaS (Platform as a Service)**: Provides a platform allowing customers to develop, run, and manage applications.\n- **SaaS (Software as a Service)**: Delivers software applications over the internet, on-demand and typically on a subscription basis.\n\n## Major Cloud Providers\n- Amazon Web Services (AWS)\n- Microsoft Azure\n- Google Cloud Platform (GCP)\n- IBM Cloud"
    },    {
        id: 5,
        title: "GSATechDose #5",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 6,
        title: "GSATechDose #6",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 7,
        title: "GSATechDose #7",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 8,
        title: "GSATechDose #8",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 9,
        title: "GSATechDose #9",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 10,
        title: "GSATechDose #10",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 11,
        title: "GSATechDose #11",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 12,
        title: "GSATechDose #12",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 13,
        title: "GSATechDose #13",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 14,
        title: "GSATechDose #14",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    },
    {
        id: 15,
        title: "GSATechDose #15",
        date: "May 24, 2025",
        author: "Security Team",
        categories: ["Security", "Advanced"],
        tags: ["zero trust", "conditional access", "security best practices"],
        content: "![GSATechDose Logo](images/TechDose5.png)\n\n🚫 Still relying on traditional VPNs to connect your workforce to internal resources?\n\nIt's time to rethink that approach.\n\n🔐 Microsoft Entra Private Access is transforming how organizations enable secure remote access — moving beyond legacy VPN models to a modern, identity-first architecture.\n\nHere's why it matters:\n\n💡 **Identity-centric Zero Trust-based access**\n\nAccess decisions are made based on user identity, device health, and real-time risk — not just network location.\n\n🔒 **Granular security controls**\n\nEasily enforce the least privilege access and context-aware policies, minimizing lateral movement and exposure.\n\n⚡ **Faster, more reliable performance**\n\nCloud-native connectivity means better scalability, lower latency, and improved user experience — without backhauling traffic through VPN concentrators.\n\nWhether your team is remote, hybrid, or global — Microsoft Entra Private Access ensures they stay securely connected to what they need, when they need it.\n\n🎥 𝗪𝗮𝘁𝗰𝗵 𝗻𝗼𝘄 𝗮𝗻𝗱 Enable Entra Private Access in less than 10 minutes:\n\nhttps://www.youtube.com/watch?v=MfcZ3zQhF-4"
    }
];

/**
 * Check if we're running from a web server or file:// protocol
 * @returns {boolean} True if running from a web server
 */
function isRunningFromServer() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
}

/**
 * Load the articles index from articles/index.json
 * @returns {Promise} A promise that resolves with the articles index
 */
async function loadArticlesIndex() {
    if (articlesIndex) {
        return articlesIndex;
    }
    
    // Always try to load from server first
    try {
        const response = await fetch('articles/index.json');
        if (!response.ok) {
            throw new Error(`Failed to load articles index: ${response.status}`);
        }
        articlesIndex = await response.json();
        console.log('Loaded articles index from server:', articlesIndex.articles.length, 'articles');
        return articlesIndex;
    } catch (error) {
        console.error('Error loading articles index, falling back to embedded data:', error);
        // Fallback to embedded data
        articlesIndex = {
            articles: embeddedArticles.map(article => ({
                id: article.id,
                filename: `article-${article.id}.json`,
                title: article.title,
                date: article.date,
                author: article.author,
                categories: article.categories,
                tags: article.tags
            }))
        };
        return articlesIndex;
    }
}

/**
 * Load all articles from individual JSON files
 * @returns {Promise} A promise that resolves with the articles array
 */
async function loadArticles() {
    if (articlesLoaded && articles.length > 0) {
        console.log('Articles already loaded, returning cached data:', articles.length);
        return articles;
    }
    
    console.log('Loading articles... Protocol:', window.location.protocol);
    
    // Check if we're running from a web server or file:// protocol
    const isServerProtocol = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    
    if (isServerProtocol) {
        // Try to load from JSON files first when running from server
        try {
            // First load the index to know which articles exist
            const index = await loadArticlesIndex();
            
            // Load each article file
            const articlePromises = index.articles.map(async (articleInfo) => {
                try {
                    const response = await fetch(`articles/${articleInfo.filename}`);
                    if (!response.ok) {
                        throw new Error(`Failed to load article ${articleInfo.id}: ${response.status}`);
                    }
                    const article = await response.json();
                    console.log(`Loaded article ${article.id}: ${article.title}`);
                    return article;
                } catch (error) {
                    console.error(`Error loading article ${articleInfo.id}:`, error);
                    // If file loading fails, fallback to embedded data for this specific article
                    const embeddedArticle = embeddedArticles.find(a => a.id === articleInfo.id);
                    if (embeddedArticle) {
                        console.log(`Using embedded fallback for article ${articleInfo.id}`);
                        return embeddedArticle;
                    }
                    return null;
                }
            });
            
            // Wait for all articles to load
            const loadedArticles = await Promise.all(articlePromises);
            
            // Filter out any failed loads and sort by ID
            articles = loadedArticles
                .filter(article => article !== null)
                .sort((a, b) => a.id - b.id);
            
            articlesLoaded = true;
            console.log('Articles loaded successfully from JSON files:', articles.length);
            return articles;
        } catch (error) {
            console.error('Error loading articles from server, falling back to embedded data:', error);
        }
    } else {
        console.log('Running from file:// protocol, CORS restrictions prevent JSON loading');
    }
    
    // Fallback to embedded data (for file:// protocol or server loading failures)
    console.log('Using embedded articles data as fallback');
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
    
    // Check if we're running from a web server and try individual file loading
    const isServerProtocol = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    
    if (isServerProtocol) {
        try {
            // Try loading individual file first
            const response = await fetch(`articles/article-${numericId}.json`);
            if (response.ok) {
                const article = await response.json();
                console.log(`Loaded individual article ${id}: ${article.title}`);
                
                // Generate HTML if it hasn't been generated yet
                if (!article.hasOwnProperty('contentHTML')) {
                    article.contentHTML = await generateArticleHTML(article);
                }
                // Set the content to the generated HTML
                article.content = article.contentHTML;
                
                return article;
            }
        } catch (error) {
            console.log(`Could not load article ${id} from individual file:`, error);
        }
    }
    
    // If individual file loading failed or we're on file:// protocol, find in loaded articles
    let article = articles.find(article => article.id === numericId);
    
    if (!article) {
        // Last resort: check embedded data directly
        article = embeddedArticles.find(a => a.id === numericId);
        if (article) {
            console.log(`Using embedded fallback for article ${id}:`, article.title);
        }
    }
      
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
