# Keep Godot / LibreSprite / Piskel alive outside a short-lived shell.
$ErrorActionPreference = "Stop"
$godot = "C:\Users\windo\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7.2-stable_win64.exe"
$libresprite = "C:\Users\windo\tools\libresprite\libresprite.exe"
$piskel = "C:\Users\windo\tools\piskel-desktop\Piskel-0.14.0\Piskel-0.14.0.exe"
$proj = "C:\Users\windo\3KDmap\tools\godot-eiketsu"
$tiles = "C:\Users\windo\3KDmap\public\assets\eiketsu\tileset.png"

Start-Process -FilePath $godot -ArgumentList @("--editor", "--path", $proj)
Start-Process -FilePath $libresprite -ArgumentList @($tiles)
Start-Process -FilePath $piskel
Write-Output "launched godot+libresprite+piskel"
while ($true) { Start-Sleep -Seconds 60 }
