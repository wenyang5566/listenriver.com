$results = @()
Get-ChildItem -Path content -Recurse -Filter *.md | ForEach-Object {
  $path = $_.FullName
  $lines = Get-Content -LiteralPath $path
  $cats = New-Object System.Collections.Generic.List[string]
  $front = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($i -eq 0 -and $line -eq '---') { $front = $true; continue }
    if ($front -and $line -eq '---') { break }
    if ($front -and $line -match '^categories:\s*$') {
      for ($j = $i + 1; $j -lt $lines.Count; $j++) {
        $next = $lines[$j]
        if ($next -match '^\s*-\s*(.+?)\s*$') {
          [void]$cats.Add($matches[1])
        } elseif ($next -match '^\S') {
          break
        }
      }
      break
    }
  }
  $results += [PSCustomObject]@{Path=$_.FullName.Replace((Get-Location).Path + '\\',''); Categories=($cats -join ', '); Count=$cats.Count}
}
