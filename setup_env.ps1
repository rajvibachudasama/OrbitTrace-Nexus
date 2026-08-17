$pthFile = "C:\Users\Rajviba Chudasama\python311\python311._pth"
if (Test-Path $pthFile) {
    $content = Get-Content $pthFile
    $content = $content -replace '#import site', 'import site'
    Set-Content -Path $pthFile -Value $content
    if (-not ($content -contains 'Lib\site-packages')) {
        Add-Content -Path $pthFile -Value 'Lib\site-packages'
    }
}

$pyExe = "C:\Users\Rajviba Chudasama\python311\python.exe"
$getPip = "$env:TEMP\get-pip.py"
Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile $getPip
& $pyExe $getPip --no-warn-script-location

Write-Host "Verifying PIP..."
& "$pyExe" -m pip --version
