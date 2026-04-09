$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$targets = @(
  "public",
  "resources\_gen",
  ".hugo_cache",
  ".hugo_build.lock",
  ".tmp_hugo_check",
  ".tmp_hugo_cache",
  ".tmp_hugo_profile",
  "public-build-check",
  "hugo-build.log"
)

foreach ($relativePath in $targets) {
  $fullPath = Join-Path $root $relativePath

  if (-not (Test-Path -LiteralPath $fullPath)) {
    continue
  }

  try {
    Get-ChildItem -LiteralPath $fullPath -Recurse -Force -ErrorAction SilentlyContinue |
      ForEach-Object {
        if ($_.Attributes -band [System.IO.FileAttributes]::ReadOnly) {
          $_.Attributes = ($_.Attributes -bxor [System.IO.FileAttributes]::ReadOnly)
        }
      }

    $item = Get-Item -LiteralPath $fullPath -Force
    if ($item.PSIsContainer) {
      Remove-Item -LiteralPath $fullPath -Recurse -Force
    } else {
      if ($item.Attributes -band [System.IO.FileAttributes]::ReadOnly) {
        $item.Attributes = ($item.Attributes -bxor [System.IO.FileAttributes]::ReadOnly)
      }
      Remove-Item -LiteralPath $fullPath -Force
    }

    Write-Host ("Removed {0}" -f $relativePath)
  } catch {
    Write-Warning ("Skipped {0}: {1}" -f $relativePath, $_.Exception.Message)
  }
}
