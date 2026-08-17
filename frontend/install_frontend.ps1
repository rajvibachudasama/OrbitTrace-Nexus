$nodeDir = "C:\Users\Rajviba Chudasama\node\node-v20.18.0-win-x64"
$env:PATH = "$nodeDir;$env:PATH"
[System.Environment]::SetEnvironmentVariable("PATH", "$nodeDir;" + [System.Environment]::GetEnvironmentVariable("PATH", "User"), "User")

Write-Host "Node version: $(& "$nodeDir\node.exe" --version)"
Write-Host "NPM version: $(& "$nodeDir\npm.cmd" --version)"

Set-Location -Path "c:\Users\Rajviba Chudasama\Desktop\Project\frontend"
& "$nodeDir\npm.cmd" install --no-audit
