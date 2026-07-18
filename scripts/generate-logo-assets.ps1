# One-shot generator: builds all app logo/icon assets from a master logo image.
# Usage: powershell -File scripts/generate-logo-assets.ps1 -Source path\to\master-logo.png
param(
    [Parameter(Mandatory = $true)][string]$Source
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "src\assets"
$res = Join-Path $root "android\app\src\main\res"

$srcImg = [System.Drawing.Bitmap]::FromFile((Resolve-Path $Source))

# Crop a square around the "KA" mark (master is 1024x1024 with large dark margins)
$cropRect = New-Object System.Drawing.Rectangle(180, 175, 720, 720)
$crop = New-Object System.Drawing.Bitmap($cropRect.Width, $cropRect.Height)
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.DrawImage($srcImg, (New-Object System.Drawing.Rectangle(0, 0, $cropRect.Width, $cropRect.Height)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

function New-Resized([System.Drawing.Image]$img, [int]$w, [int]$h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $gr = [System.Drawing.Graphics]::FromImage($bmp)
    $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gr.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gr.DrawImage($img, 0, 0, $w, $h)
    $gr.Dispose()
    return $bmp
}

function Save-Png([System.Drawing.Bitmap]$bmp, [string]$path) {
    $dir = Split-Path -Parent $path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "wrote $path"
}

# --- Web assets ---
$logo512 = New-Resized $crop 512 512
Save-Png $logo512 (Join-Path $assets "kapunter-logo.png")
Save-Png $logo512 (Join-Path $assets "kapunter-icon-512.png")
$logo192 = New-Resized $crop 192 192
Save-Png $logo192 (Join-Path $assets "kapunter-icon-192.png")

# favicon.ico: ICO container wrapping a 256px PNG (supported by all modern browsers)
$fav = New-Resized $crop 256 256
$ms = New-Object System.IO.MemoryStream
$fav.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray()
$ms.Dispose()
$ico = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ico)
$bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]1)   # ICONDIR
$bw.Write([byte]0); $bw.Write([byte]0)                             # 256x256 encoded as 0
$bw.Write([byte]0); $bw.Write([byte]0)
$bw.Write([uint16]1); $bw.Write([uint16]32)
$bw.Write([uint32]$png.Length); $bw.Write([uint32]22)              # size + offset
$bw.Write($png)
[System.IO.File]::WriteAllBytes((Join-Path $root "src\favicon.ico"), $ico.ToArray())
$bw.Dispose()
Write-Host "wrote src\favicon.ico"

# --- Android launcher icons ---
$densities = @(
    @{ dir = "mipmap-mdpi";    launcher = 48;  fg = 108 },
    @{ dir = "mipmap-hdpi";    launcher = 72;  fg = 162 },
    @{ dir = "mipmap-xhdpi";   launcher = 96;  fg = 216 },
    @{ dir = "mipmap-xxhdpi";  launcher = 144; fg = 324 },
    @{ dir = "mipmap-xxxhdpi"; launcher = 192; fg = 432 }
)

foreach ($d in $densities) {
    $dirPath = Join-Path $res $d.dir
    if (-not (Test-Path $dirPath)) { continue }

    $size = $d.launcher
    $ic = New-Resized $crop $size $size
    Save-Png $ic (Join-Path $dirPath "ic_launcher.png")

    # Round variant: circular mask
    $round = New-Object System.Drawing.Bitmap($size, $size)
    $gr = [System.Drawing.Graphics]::FromImage($round)
    $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $gr.SetClip($path)
    $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gr.DrawImage($crop, 0, 0, $size, $size)
    $gr.Dispose()
    Save-Png $round (Join-Path $dirPath "ic_launcher_round.png")
    $round.Dispose()

    # Adaptive-icon foreground: full-bleed (outer ~18% is masked away by the launcher)
    $fg = New-Resized $crop $d.fg $d.fg
    Save-Png $fg (Join-Path $dirPath "ic_launcher_foreground.png")
    $fg.Dispose()
    $ic.Dispose()
}

# --- Android splash screens: dark background + centered logo ---
$bgColor = $srcImg.GetPixel(10, 10)
Get-ChildItem $res -Recurse -Filter "splash.png" -ErrorAction SilentlyContinue | ForEach-Object {
    $old = [System.Drawing.Bitmap]::FromFile($_.FullName)
    $w = $old.Width; $h = $old.Height
    $old.Dispose()

    $splash = New-Object System.Drawing.Bitmap($w, $h)
    $gr = [System.Drawing.Graphics]::FromImage($splash)
    $gr.Clear($bgColor)
    $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $logoSize = [int]([Math]::Min($w, $h) * 0.45)
    $gr.DrawImage($crop, [int](($w - $logoSize) / 2), [int](($h - $logoSize) / 2), $logoSize, $logoSize)
    $gr.Dispose()

    $tmp = "$($_.FullName).tmp.png"
    Save-Png $splash $tmp
    $splash.Dispose()
    Move-Item -Force $tmp $_.FullName
    Write-Host "replaced $($_.FullName) (${w}x${h})"
}

$logo512.Dispose(); $logo192.Dispose(); $fav.Dispose(); $crop.Dispose(); $srcImg.Dispose()
Write-Host "done"
