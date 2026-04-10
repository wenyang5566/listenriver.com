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
  ".tmp_hugo_repro",
  ".tmp_hugo_verify",
  ".tmp_layout_probe",
  ".tmp_layout_probe2",
  "public-build-check",
  "hugo-build.log",
  "generated-paths.txt",
  ".tmp_probe_lang.toml",
  ".tmp_probe_more.toml",
  ".tmp_probe_outputs.toml",
  ".tmp_server_probe.toml",
  ".tmp_server_probe2.toml",
  ".tmp_server_probe3.toml",
  ".tmp_server_probe4.toml",
  "hugo-repro.err.log",
  "hugo-repro.out.log",
  "hugo-server.err.log",
  "hugo-server.out.log",
  "hugo1313.err.log",
  "hugo1313.out.log"
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
