param([int]$Port = 1313)
& (Join-Path $PSScriptRoot 'hugo-local.ps1') -Mode Preview -Port $Port
