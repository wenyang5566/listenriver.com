param(
  [string]$Root = "content",
  [int]$MaxDimension = 1600,
  [int]$JpegQuality = 82,
  [int]$MinBytes = 716800
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function Get-JpegEncoder {
  return [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } |
    Select-Object -First 1
}

function New-EncoderParameters([long]$quality) {
  $encoder = [System.Drawing.Imaging.Encoder]::Quality
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, $quality)
  return $params
}

function Get-ScaledSize($width, $height, $maxDimension) {
  if ($width -le $maxDimension -and $height -le $maxDimension) {
    return @{ Width = $width; Height = $height; Changed = $false }
  }

  if ($width -ge $height) {
    $ratio = $maxDimension / [double]$width
  }
  else {
    $ratio = $maxDimension / [double]$height
  }

  return @{
    Width = [Math]::Max(1, [int][Math]::Round($width * $ratio))
    Height = [Math]::Max(1, [int][Math]::Round($height * $ratio))
    Changed = $true
  }
}

function Save-Jpeg($bitmap, $path, $quality) {
  $encoder = Get-JpegEncoder
  $params = New-EncoderParameters $quality
  try {
    $bitmap.Save($path, $encoder, $params)
  }
  finally {
    $params.Dispose()
  }
}

function Get-ImageBytes($bitmap, $extension, $quality) {
  $stream = New-Object System.IO.MemoryStream
  try {
    if ($extension -eq '.png') {
      $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    else {
      $encoder = Get-JpegEncoder
      $params = New-EncoderParameters $quality
      try {
        $bitmap.Save($stream, $encoder, $params)
      }
      finally {
        $params.Dispose()
      }
    }

    return $stream.ToArray()
  }
  finally {
    $stream.Dispose()
  }
}

$extensions = @('*.jpg', '*.jpeg', '*.png')
$files = Get-ChildItem -Path $Root -Recurse -File -Include $extensions |
  Where-Object { $_.Length -ge $MinBytes }

$processed = 0
$skipped = 0
$bytesSaved = 0L

foreach ($file in $files) {
  $source = $null
  $canvas = $null
  $graphics = $null
  $fileStream = $null

  try {
    $fileBytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $fileStream = New-Object System.IO.MemoryStream(, $fileBytes)
    $source = [System.Drawing.Image]::FromStream($fileStream)
    $target = Get-ScaledSize $source.Width $source.Height $MaxDimension
    $ext = $file.Extension.ToLowerInvariant()
    $shouldResize = $target.Changed
    $shouldReencode = ($ext -eq '.jpg' -or $ext -eq '.jpeg')

    if (-not $shouldResize -and -not $shouldReencode) {
      $skipped++
      continue
    }

    $canvas = New-Object System.Drawing.Bitmap $target.Width, $target.Height
    $canvas.SetResolution($source.HorizontalResolution, $source.VerticalResolution)

    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($source, 0, 0, $target.Width, $target.Height)

    $newBytes = Get-ImageBytes $canvas $ext $JpegQuality
    $newLength = $newBytes.Length
    if ($newLength -lt $file.Length) {
      $bytesSaved += ($file.Length - $newLength)
      [System.IO.File]::WriteAllBytes($file.FullName, $newBytes)
      $processed++
    }
    else {
      $skipped++
    }
  }
  finally {
    if ($graphics) { $graphics.Dispose() }
    if ($canvas) { $canvas.Dispose() }
    if ($source) { $source.Dispose() }
    if ($fileStream) { $fileStream.Dispose() }
  }
}

[pscustomobject]@{
  Processed = $processed
  Skipped = $skipped
  SavedMB = [Math]::Round($bytesSaved / 1MB, 2)
  Root = (Resolve-Path $Root).Path
} | Format-List
