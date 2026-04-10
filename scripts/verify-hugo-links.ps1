param(
  [string]$OutputRoot = "",
  [switch]$Diagnostics,
  [switch]$KeepOutput
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
  $runId = Get-Date -Format "yyyyMMdd-HHmmss-fff"
  $OutputRoot = ".tmp_hugo_verify\runs\$runId\public-check"
}
$outputPath = Join-Path $repoRoot $OutputRoot
$outputDir = Split-Path -Parent $outputPath
$cacheDir = Join-Path $outputDir "cache"

function Remove-GeneratedPath {
  param([string]$PathToRemove)

  if (-not (Test-Path -LiteralPath $PathToRemove)) {
    return
  }

  try {
    Remove-Item -LiteralPath $PathToRemove -Recurse -Force -ErrorAction Stop
  } catch {
    Write-Warning ("Skipped cleanup for {0}: {1}" -f $PathToRemove, $_.Exception.Message)
  }
}

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

Push-Location $repoRoot
try {
  $hugoArgs = @(
    "--cacheDir", $cacheDir,
    "--destination", $outputPath,
    "--printPathWarnings"
  )

  if ($Diagnostics) {
    $hugoArgs += @("--printUnusedTemplates", "--templateMetrics")
  }

  & hugo @hugoArgs | Out-Host

  $htmlFiles = Get-ChildItem -Path $outputPath -Recurse -File -Include *.html

  $mdHrefMatches = $htmlFiles | Select-String -Pattern 'href="[^"]+\.md"'
  $mdTextMatches = $htmlFiles | Select-String -Pattern '\.md(?=<|&lt;)'

  $contentFiles = Get-ChildItem -Path (Join-Path $repoRoot "content") -Recurse -File -Include *.md
  $mdLabelMatches = $contentFiles | Select-String -Pattern '\[[^\]]*\.md\]\('

  $summary = [pscustomobject]@{
    HtmlFilesChecked          = ($htmlFiles | Measure-Object).Count
    MarkdownHrefOccurrences   = ($mdHrefMatches | Measure-Object).Count
    MarkdownLabelOccurrences  = ($mdTextMatches | Measure-Object).Count
    SourceMdLabelOccurrences  = ($mdLabelMatches | Measure-Object).Count
    OutputPath                = $outputPath
  }

  $summary | Format-List | Out-Host

  if ($mdHrefMatches) {
    Write-Host ""
    Write-Host "HTML still contains .md href targets:" -ForegroundColor Red
    $mdHrefMatches | Select-Object -First 20 Path, LineNumber, Line | Format-Table -AutoSize | Out-Host
    throw "Found unresolved .md href targets in generated HTML."
  }

  if ($mdTextMatches) {
    Write-Host ""
    Write-Host "Generated HTML still contains visible .md labels:" -ForegroundColor Yellow
    $mdTextMatches | Select-Object -First 20 Path, LineNumber, Line | Format-Table -AutoSize | Out-Host
  }

  if ($mdLabelMatches) {
    Write-Host ""
    Write-Host "Source content still contains link labels ending with .md:" -ForegroundColor Yellow
    $mdLabelMatches | Select-Object -First 20 Path, LineNumber, Line | Format-Table -AutoSize | Out-Host
  }
}
finally {
  Pop-Location

  if (-not $KeepOutput) {
    foreach ($path in @($outputDir, $cacheDir)) {
      Remove-GeneratedPath -PathToRemove $path
    }
  }
}
