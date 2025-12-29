$ErrorActionPreference = 'Stop'

$packageName = 'gdit'
$toolsDir = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)"

# Remove shim
Uninstall-BinFile -Name 'gdit'

# Remove executable
$exePath = Join-Path $toolsDir 'gdit.exe'
if (Test-Path $exePath) {
  Remove-Item $exePath -Force
}

Write-Host ""
Write-Host "✅ gdit has been uninstalled successfully!" -ForegroundColor Green
