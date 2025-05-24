# GSATechDose

GSATechDose is a GitHub Pages website for hosting articles with a left-side navigation menu. The website is built using HTML, CSS, and vanilla JavaScript.

## Features

### Core Features
- Responsive design that works on all screen sizes
- Left-side navigation menu for easy article browsing
- Article content loading with history API
- Recent articles list on homepage

### Enhanced Features
- **Search Functionality**: Search through articles by title and content
- **Dark Mode**: Toggle between light and dark themes with local storage persistence
- **Categories & Tags**: Filter articles by categories and tags
- **Pagination**: Navigate through articles with page controls
- **Social Sharing**: Share articles on social media platforms
- **Improved Accessibility**: Skip links, keyboard navigation, and ARIA attributes
- **SEO Optimization**: Meta tags for better search engine visibility

## Project Structure

- `index.html`: Main HTML file
- `css/styles.css`: Stylesheet for the website
- `js/articles-simple.js`: Contains the articles data in a simple, hardcoded format
- `js/main.js`: Handles the website functionality 
- `js/social-share.js`: Provides social sharing functionality
- `js/accessibility.js`: Improves website accessibility
- `images/`: Contains website images and icons

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/GSATechDose.git
   ```

2. Open `index.html` in your web browser to view the site locally.

## Adding New Articles

To add new articles, edit the `js/articles-simple.js` file:

1. Follow the existing article format in the articles array
2. Include tags and categories for better organization
3. Use the markdown-like syntax supported by the renderMarkdown function
4. Ensure proper article IDs are used sequentially

## Development Notes

### Coding Conventions
- Semantic HTML elements used throughout
- BEM naming convention for CSS classes
- ES6+ JavaScript features
- CSS variables for theming
- Responsive design with mobile-first approach

### Browser Compatibility
The website is designed to work on modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Future Improvements

Consider implementing these additional features:
- [ ] Article commenting system
- [ ] Reading time estimates 
- [ ] User preferences for font size and family
- [ ] Print-friendly article versions
- [ ] RSS feed for articles
- [ ] Related articles section

## Contributors

- GSATechDose Team

## License

[MIT License](LICENSE)
