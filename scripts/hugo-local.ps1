param(
    [ValidateSet('Build', 'Preview')][string]$Mode = 'Build',
    [string]$Destination = 'public-build-check',
    [int]$Port = 1313
)

$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
$hugoVersion = '0.160.1' # Keep aligned with CI and Cloudflare Pages.
$toolDirectory = Join-Path $siteRoot ".tmp/hugo-local/$hugoVersion"
$hugoBinary = $null
foreach ($candidate in @((Join-Path $siteRoot '.tmp/hugo-ci/hugo.exe'), (Join-Path $toolDirectory 'hugo.exe'))) {
    if (Test-Path -LiteralPath $candidate) {
        $versionText = & $candidate version 2>$null
        if ($LASTEXITCODE -eq 0 -and $versionText -match "^hugo v$([regex]::Escape($hugoVersion))[-+].*extended") {
            $hugoBinary = $candidate
            break
        }
    }
}
if (-not $hugoBinary) {
    New-Item -ItemType Directory -Force -Path $toolDirectory | Out-Null
    $archiveName = "hugo_extended_${hugoVersion}_windows-amd64.zip"
    $releaseUrl = "https://github.com/gohugoio/hugo/releases/download/v$hugoVersion"
    $archivePath = Join-Path $toolDirectory $archiveName
    $checksumPath = Join-Path $toolDirectory 'checksums.txt'
    Invoke-WebRequest "$releaseUrl/$archiveName" -OutFile $archivePath
    Invoke-WebRequest "$releaseUrl/hugo_${hugoVersion}_checksums.txt" -OutFile $checksumPath
    $checksumLine = Get-Content -LiteralPath $checksumPath | Where-Object { $_ -match "\s+\*?$([regex]::Escape($archiveName))$" }
    if (-not $checksumLine -or @($checksumLine).Count -ne 1) { throw 'Missing or ambiguous Hugo checksum.' }
    $expectedHash = ($checksumLine -split '\s+')[0]
    if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $expectedHash) { throw 'Hugo checksum mismatch.' }
    Expand-Archive -LiteralPath $archivePath -DestinationPath $toolDirectory -Force
    $hugoBinary = Join-Path $toolDirectory 'hugo.exe'
}

$previousGoDebug = $env:GODEBUG
$hugoArguments = @('--cacheDir', (Join-Path $siteRoot '.tmp/hugo-cache'))
try {
    # Local Windows workaround: default Go preemption crashes in warpc/wazero.
    # Preserve other GODEBUG settings and restore the caller's environment below.
    $debugOptions = @($previousGoDebug -split ',' | Where-Object { $_ -and $_ -notmatch '^asyncpreemptoff=' })
    $env:GODEBUG = ($debugOptions + 'asyncpreemptoff=1') -join ','
    Push-Location $siteRoot
    if ($Mode -eq 'Preview') {
        & $hugoBinary server -D --bind 127.0.0.1 --port $Port --disableFastRender @hugoArguments
    } else {
        & $hugoBinary --destination $Destination @hugoArguments
    }
    $hugoExitCode = $LASTEXITCODE
} finally {
    Pop-Location
    $env:GODEBUG = $previousGoDebug
}
if ($hugoExitCode -ne 0) { throw "Hugo exited with code $hugoExitCode." }
