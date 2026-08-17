$nodeDir = "C:\Users\Rajviba Chudasama\node\node-v20.18.0-win-x64"
$env:PATH = "$nodeDir;$env:PATH"
Set-Location -Path "c:\Users\Rajviba Chudasama\Desktop\Project\frontend"
& "$nodeDir\npm.cmd" run build
