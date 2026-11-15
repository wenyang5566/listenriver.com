param([string]$Destination = 'public-build-check')
& (Join-Path $PSScriptRoot 'hugo-local.ps1') -Mode Build -Destination $Destination
