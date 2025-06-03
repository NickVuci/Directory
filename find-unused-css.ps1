# PowerShell script to find unused CSS classes
$cssFile = "css/styles.css"

# Extract all CSS class selectors (remove pseudo-selectors and combinators)
$cssClasses = Select-String -Path $cssFile -Pattern "^\." | ForEach-Object {
    $line = $_.Line
    # Extract just the class name, removing pseudo-selectors, combinators, and brackets
    if ($line -match "^\.([a-zA-Z0-9_-]+)") {
        $matches[1]
    }
} | Sort-Object -Unique

# Extract all classes used in HTML files
$htmlClasses = Select-String -Path "*.html" -Pattern 'class="([^"]*)"' | ForEach-Object {
    $classes = $_.Matches.Groups[1].Value -split '\s+'
    $classes | Where-Object { $_ -ne "" }
} | Sort-Object -Unique

# Extract classes used in JavaScript files
$jsClasses = @()
$jsFiles = Get-ChildItem -Path "js/*.js", "*.js" -ErrorAction SilentlyContinue
foreach ($file in $jsFiles) {
    $content = Get-Content $file -Raw
    
    # Match className assignments
    $classNameMatches = [regex]::Matches($content, "className\s*=\s*['\"]([^'\"]*)['\"]")
    foreach ($match in $classNameMatches) {
        $jsClasses += $match.Groups[1].Value
    }
    
    # Match querySelector with class selectors
    $querySelectorMatches = [regex]::Matches($content, "querySelector[^'\"]*['\"]\.([^'\"]*)['\"]")
    foreach ($match in $querySelectorMatches) {
        $jsClasses += $match.Groups[1].Value
    }
    
    # Match classList.add
    $classListMatches = [regex]::Matches($content, "classList\.add\(['\"]([^'\"]*)['\"]\)")
    foreach ($match in $classListMatches) {
        $jsClasses += $match.Groups[1].Value
    }
    
    # Match template literals with class attributes
    $templateMatches = [regex]::Matches($content, 'class="([^"]*)"')
    foreach ($match in $templateMatches) {
        $classes = $match.Groups[1].Value -split '\s+'
        $jsClasses += $classes | Where-Object { $_ -ne "" }
    }
}

$jsClasses = $jsClasses | Sort-Object -Unique

# Combine all used classes
$usedClasses = ($htmlClasses + $jsClasses) | Sort-Object -Unique

# Find unused classes
$unusedClasses = $cssClasses | Where-Object { $_ -notin $usedClasses }

Write-Host "=== CSS CLASSES DEFINED IN STYLES.CSS ===" -ForegroundColor Green
$cssClasses | ForEach-Object { Write-Host "  $_" }

Write-Host "`n=== CLASSES USED IN HTML/JS FILES ===" -ForegroundColor Blue  
$usedClasses | ForEach-Object { Write-Host "  $_" }

Write-Host "`n=== POTENTIALLY UNUSED CSS CLASSES ===" -ForegroundColor Red
if ($unusedClasses.Count -eq 0) {
    Write-Host "  No unused classes found!" -ForegroundColor Green
} else {
    $unusedClasses | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Yellow
Write-Host "Total CSS classes defined: $($cssClasses.Count)"
Write-Host "Total classes used: $($usedClasses.Count)" 
Write-Host "Potentially unused: $($unusedClasses.Count)"
