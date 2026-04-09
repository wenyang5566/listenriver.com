param(
  [string]$Destination = "public",
  [switch]$Minify = $true,
  [switch]$GC = $true
)

$ErrorActionPreference = "Stop"

$cacheDir = Join-Path (Get-Location).Path ".hugo_cache"
$arguments = @(
  "--cacheDir", $cacheDir,
  "--destination", $Destination
)

if ($GC) {
  $arguments += "--gc"
}

if ($Minify) {
  $arguments += "--minify"
}

& hugo @arguments
