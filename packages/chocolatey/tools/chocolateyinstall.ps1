$ErrorActionPreference = 'Stop'

$packageName = 'gdit'
$toolsDir = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)"

# Package parameters
$packageArgs = @{
  packageName   = $packageName
  unzipLocation = $toolsDir
  url64bit      = "https://github.com/praaatap/Gdit/releases/download/v$env:ChocolateyPackageVersion/gdit.exe"
  checksum64    = '' # Will be updated by CI
  checksumType64= 'sha256'
}

# Download the executable
$exePath = Join-Path $toolsDir 'gdit.exe'
Get-ChocolateyWebFile @packageArgs -FileFullPath $exePath

# Create shim for command line access
Install-BinFile -Name 'gdit' -Path $exePath

Write-Host ""
Write-Host "✅ gdit has been installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  1. gdit setup-creds  - Configure Google API credentials"
Write-Host "  2. gdit login        - Authenticate with Google"
Write-Host "  3. gdit init         - Initialize a repository"
Write-Host ""
Write-Host "Run 'gdit --help' for more commands."
