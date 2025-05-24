# PowerShell script to add a new article to GSATechDose
param(
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$true)]
    [string]$Author,
    
    [Parameter(Mandatory=$true)]
    [string]$Categories,
    
    [Parameter(Mandatory=$true)]
    [string]$Tags,
    
    [Parameter(Mandatory=$true)]
    [string]$Content
)

# Get the articles directory
$articlesDir = Split-Path $MyInvocation.MyCommand.Path

# Load the current index to find the next ID
$indexPath = Join-Path $articlesDir "index.json"
if (Test-Path $indexPath) {
    $index = Get-Content $indexPath | ConvertFrom-Json
    $nextId = ($index.articles | Measure-Object -Property id -Maximum).Maximum + 1
} else {
    $nextId = 1
    $index = @{ articles = @() }
}

# Parse categories and tags
$categoryArray = $Categories -split "," | ForEach-Object { $_.Trim() }
$tagArray = $Tags -split "," | ForEach-Object { $_.Trim() }

# Get current date
$currentDate = Get-Date -Format "MMMM dd, yyyy"

# Create the article object
$article = @{
    id = $nextId
    title = $Title
    date = $currentDate
    author = $Author
    categories = $categoryArray
    tags = $tagArray
    content = $Content
}

# Create the article file
$articleFileName = "article-$nextId.json"
$articlePath = Join-Path $articlesDir $articleFileName
$article | ConvertTo-Json -Depth 10 | Set-Content $articlePath -Encoding UTF8

# Update the index
$indexEntry = @{
    id = $nextId
    filename = $articleFileName
    title = $Title
    date = $currentDate
    author = $Author
    categories = $categoryArray
    tags = $tagArray
}

$index.articles += $indexEntry
$index | ConvertTo-Json -Depth 10 | Set-Content $indexPath -Encoding UTF8

Write-Host "Created article $nextId: $Title" -ForegroundColor Green
Write-Host "File: $articleFileName" -ForegroundColor Gray
Write-Host "Updated index.json" -ForegroundColor Gray
