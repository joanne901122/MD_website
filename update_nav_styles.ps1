# This script updates all HTML files to use the new common navigation styles

# Define the list of HTML files to update
$htmlFiles = @(
    "index.html",
    "products.html",
    "booking-ride.html",
    "booking-service.html",
    "event-signup.html",
    "admin.html"
)

# Define the new CSS link to add
$newCssLink = '    <link rel="stylesheet" href="css/common.css">'

foreach ($file in $htmlFiles) {
    $filePath = Join-Path -Path $PSScriptRoot -ChildPath $file
    
    if (Test-Path $filePath) {
        # Read the file content
        $content = Get-Content -Path $filePath -Raw
        
        # Check if common.css is already included
        if ($content -notmatch 'common\.css') {
            # Add the common.css link after the last stylesheet link
            $content = $content -replace '(?<=\s*<link[^>]*?\srel=["\']stylesheet["\'][^>]*>\s*)', "$newCssLink`n"
            
            # Remove any duplicate mobile-menu.css if it exists after our new link
            $content = $content -replace '(?s)(' + [regex]::Escape($newCssLink) + '\s*<link[^>]*?mobile-menu\.css[^>]*>)', '$1'
            
            # Save the updated content
            $content | Set-Content -Path $filePath -NoNewline -Encoding UTF8
            Write-Host "Updated: $file"
        } else {
            Write-Host "Skipped (already updated): $file"
        }
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Navigation styles update complete!"
