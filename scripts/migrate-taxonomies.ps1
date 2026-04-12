param(
    [switch]$DryRun
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$blogDir = "content/blog"
$files = Get-ChildItem -Path $blogDir -Recurse -Filter "*.md"

$categoryMap = @{
    "閱讀心得" = "閱讀與筆記"
    "書摘" = "閱讀與筆記"
    "閱讀書摘" = "閱讀與筆記"
    "一行禪師" = "閱讀與筆記"
    "電影心得" = "閱讀與筆記"
    "講座筆記" = "閱讀與筆記"
    "講座心得" = "閱讀與筆記"
    "素描" = "閱讀與筆記"
    "日常書寫" = "日常書寫"
    "凝視日常" = "日常書寫"
    "日常生活凝視" = "日常書寫"
    "自我成長" = "自我成長"
    "成為一個人" = "自我成長"
    "親密關係" = "自我成長"
    "正念的河流" = "自我成長"
    "受苦的倒影" = "工作者反思"
    "會所模式" = "工作者反思"
    "會所工作日誌" = "工作者反思"
    "會所工作手冊" = "工作者反思"
    "會所實習" = "工作者反思"
    "開放式對話" = "工作者反思"
    "創傷知情" = "工作者反思"
    "邁向助人工作" = "工作者反思"
    "家族治療" = "工作者反思"
    "建制民族誌" = "工作者反思"
    "聆聽疼痛計畫" = "病痛經驗"
}

$mainCategories = @("閱讀與筆記", "日常書寫", "自我成長", "工作者反思", "病痛經驗")

$report = @()

foreach ($file in $files) {
    # Safely read as UTF-8 without BOM
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    
    # Standardize line endings to LF for processing
    $contentNorm = $content -replace "`r`n", "`n"
    $lines = $contentNorm -split "`n"
    
    if ($lines.Count -eq 0) { continue }
    
    $inFrontMatter = $false
    $frontMatterEndIdx = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($i -eq 0 -and $lines[$i] -match "^---$") {
            $inFrontMatter = $true
            continue
        }
        if ($inFrontMatter -and $lines[$i] -match "^---$") {
            $inFrontMatter = $false
            $frontMatterEndIdx = $i
            break
        }
    }
    
    if ($frontMatterEndIdx -eq -1) {
        continue
    }
    
    $fmLines = $lines[1..($frontMatterEndIdx - 1)]
    $bodyLines = @()
    if ($frontMatterEndIdx -lt ($lines.Count - 1)) {
        $bodyLines = $lines[($frontMatterEndIdx + 1)..($lines.Count - 1)]
    }
    
    $inCategories = $false
    $inTags = $false
    $inTopics = $false
    
    $newCategories = @()
    $newTags = @()
    $isFeatured = $false
    
    $otherLines = @()
    
    foreach ($line in $fmLines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        
        if ($line -match "^categories:") {
            $inCategories = $true; $inTags = $false; $inTopics = $false; continue
        }
        if ($line -match "^tags:") {
            $inTags = $true; $inCategories = $false; $inTopics = $false; continue
        }
        if ($line -match "^topics:") {
            $inTopics = $true; $inCategories = $false; $inTags = $false; continue
        }
        
        if ($line -match "^[a-zA-Z0-9_-]+:") {
            $inCategories = $false; $inTags = $false; $inTopics = $false
            if ($line -notmatch "^featured:") {
                $otherLines += $line
            }
            continue
        }
        
        if ($inCategories) {
            if ($line -match "^\s*-\s*`"?([^`"]+)`"?") {
                $cat = $matches[1].Trim()
                if ($cat -eq "精選文章") {
                    $isFeatured = $true
                } else {
                    if ($categoryMap.ContainsKey($cat)) {
                        $mapped = $categoryMap[$cat]
                        if (-not $newCategories.Contains($mapped)) { $newCategories += $mapped }
                    } else {
                        if ($mainCategories.Contains($cat)) {
                            if (-not $newCategories.Contains($cat)) { $newCategories += $cat }
                        } else {
                            if (-not $newTags.Contains($cat)) { $newTags += $cat }
                        }
                    }
                }
            }
        } elseif ($inTags) {
            if ($line -match "^\s*-\s*`"?([^`"]+)`"?") {
                $tag = $matches[1].Trim()
                if ($tag -eq "精選文章") {
                    $isFeatured = $true
                } else {
                    if (-not $newTags.Contains($tag)) { $newTags += $tag }
                }
            }
        } elseif ($inTopics) {
            if ($line -match "^\s*-\s*`"?([^`"]+)`"?") {
                $topic = $matches[1].Trim()
                if (-not $newTags.Contains($topic)) { $newTags += $topic }
            }
        } else {
            $otherLines += $line
        }
    }
    
    if ($newCategories.Count -eq 0) {
        $newCategories += "日常書寫"
    }
    
    $newFm = @("---")
    $newFm += $otherLines
    
    if ($isFeatured) {
        $newFm += "featured: true"
    }
    
    if ($newCategories.Count -gt 0) {
        $newFm += "categories:"
        foreach ($c in $newCategories) { $newFm += "  - $c" }
    }
    
    if ($newTags.Count -gt 0) {
        $newFm += "tags:"
        foreach ($t in $newTags) { $newFm += "  - $t" }
    }
    
    $newFm += "---"
    
    $newContentNorm = ($newFm + $bodyLines) -join "`n"
    $newContentNorm += "`n"
    
    if ($contentNorm.TrimEnd() -ne $newContentNorm.TrimEnd()) {
        $report += [PSCustomObject]@{
            File = $file.Name
            Path = $file.FullName
            Status = "Modified"
        }
        if (-not $DryRun) {
            [System.IO.File]::WriteAllText($file.FullName, $newContentNorm, $utf8NoBom)
        }
    }
}

Write-Host "Migration Report:"
$report | Format-Table File, Status
Write-Host "Total files modified: $($report.Count)"
if ($DryRun) {
    Write-Host "Dry-Run complete. No files were modified."
} else {
    Write-Host "Migration complete."
}
