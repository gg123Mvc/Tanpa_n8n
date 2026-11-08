Add-Type -AssemblyName System.Drawing

$imgPath = "c:\xampp\htdocs\Ma\frontend\public\logo_ma.jpg"
$outPath = "c:\xampp\htdocs\Ma\frontend\public\logo_ma_round.png"

$img = [System.Drawing.Image]::FromFile($imgPath)

# Calculate size for a perfect circle (use the smaller dimension)
$size = [math]::Min($img.Width, $img.Height)

$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Transparent)

# Set high quality rendering
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $size, $size)

$g.SetClip($path)

# Calculate x and y to center the image if it's a rectangle
$x = ($img.Width - $size) / 2
$y = ($img.Height - $size) / 2
$rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
$g.DrawImage($img, $rect, $x, $y, $size, $size, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()
