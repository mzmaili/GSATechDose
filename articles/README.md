# Article Management Utility

This folder contains individual article files in JSON format, making it easy to manage and edit articles separately.

## File Structure

- `index.json` - Contains metadata for all articles (used for quick loading of article list)
- `article-{id}.json` - Individual article files containing full content

## Adding a New Article

1. Create a new file `article-{next-id}.json` with the following structure:

```json
{
    "id": 5,
    "title": "Your Article Title",
    "date": "May 24, 2025",
    "author": "Author Name",
    "categories": ["Category1", "Category2"],
    "tags": ["tag1", "tag2", "tag3"],
    "content": "Your article content here using markdown-like syntax..."
}
```

2. Update `index.json` to include the new article metadata:

```json
{
    "articles": [
        // ... existing articles ...
        {
            "id": 5,
            "filename": "article-5.json",
            "title": "Your Article Title",
            "date": "May 24, 2025",
            "author": "Author Name",
            "categories": ["Category1", "Category2"],
            "tags": ["tag1", "tag2", "tag3"]
        }
    ]
}
```

## Content Format

Articles use a markdown-like syntax:

- `## Heading` - Creates an h2 heading
- `### Subheading` - Creates an h3 heading
- `**bold text**` - Makes text bold
- `*italic text*` - Makes text italic
- `- List item` - Creates bulleted lists
- `[Link Text](URL)` - Creates links
- `[articleId:Title]` - Creates internal article links

## Best Practices

- Keep article IDs sequential
- Use descriptive titles and appropriate categories
- Include relevant tags for better searchability
- Test articles after adding them to ensure proper formatting
