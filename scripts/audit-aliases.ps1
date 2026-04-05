param(
    [string]$ContentRoot = (Join-Path $PSScriptRoot "..\content"),
    [switch]$FixKnownNoise
)

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$resolvedRoot = (Resolve-Path $ContentRoot).Path
$files = Get-ChildItem -Path $resolvedRoot -Recurse -Filter index.md -File

$summary = [ordered]@{}
$findings = New-Object System.Collections.Generic.List[object]

function Add-SummaryCount {
    param([string]$Name)
    if (-not $summary.Contains($Name)) {
        $summary[$Name] = 0
    }
    $summary[$Name]++
}

function Get-Classification {
    param([string]$AliasLine)

    $alias = $AliasLine.Trim() -replace '^[-\s]+', ''
    if ($alias.Contains('categories')) {
        return 'Known typo slug'
    }

    $intentionalSeriesPrefixes = @(
        '/blog/素描/素描',
        '/blog/聆聽疼痛計畫/聆聽疼痛計畫',
        '/blog/會所工作日誌/會所工作日誌',
        '/blog/講座筆記/講座筆記',
        '/blog/受苦的倒影/受苦的倒影'
    )
    foreach ($prefix in $intentionalSeriesPrefixes) {
        if ($alias.StartsWith($prefix)) {
            return 'Intentional legacy series slug'
        }
    }

    if ($alias -match '^/blog/([^/]+)/([^/]+)/?$') {
        $section = $matches[1]
        $slug = $matches[2]
        if ($slug.StartsWith($section) -and $slug.Length -gt ($section.Length + 1)) {
            return 'Repeated section prefix (review)'
        }
    }

    if ($alias.Contains('%20')) {
        return 'Encoded space (review)'
    }

    if ($alias -match '^/blog/.+/\d{8}.+$') {
        return 'Legacy dated slug'
    }

    return 'Keep'
}

foreach ($file in $files) {
    $lines = Get-Content -LiteralPath $file.FullName
    $inAliases = $false
    $updatedLines = New-Object System.Collections.Generic.List[string]
    $fileChanged = $false

    foreach ($line in $lines) {
        if ($line -match '^aliases:\s*$') {
            $inAliases = $true
            $updatedLines.Add($line)
            continue
        }

        if ($inAliases -and $line -match '^\S') {
            $inAliases = $false
        }

        if ($inAliases -and $line -match '^\s*-\s+/blog/') {
            $classification = Get-Classification -AliasLine $line
            Add-SummaryCount -Name $classification

            $findings.Add([pscustomobject]@{
                Classification = $classification
                File = $file.FullName
                Alias = $line.Trim()
            })

            if ($FixKnownNoise -and $classification -eq 'Known typo slug') {
                $fileChanged = $true
                continue
            }
        }

        $updatedLines.Add($line)
    }

    if ($FixKnownNoise -and $fileChanged) {
        [System.IO.File]::WriteAllLines($file.FullName, $updatedLines, $utf8NoBom)
    }
}

Write-Output 'Alias summary'
foreach ($entry in $summary.GetEnumerator()) {
    Write-Output ('- {0}: {1}' -f $entry.Key, $entry.Value)
}

if ($FixKnownNoise) {
    Write-Output ''
    Write-Output 'Known typo aliases removed.'
}

Write-Output ''
Write-Output 'Flagged aliases'
$findings |
    Where-Object { $_.Classification -notin @('Keep', 'Legacy dated slug', 'Intentional legacy series slug') } |
    Sort-Object Classification, File, Alias |
    Format-Table -AutoSize
