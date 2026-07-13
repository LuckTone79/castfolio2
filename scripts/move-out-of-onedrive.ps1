<#
.SYNOPSIS
  Copies this project out of OneDrive into a plain local folder.

.DESCRIPTION
  Not run automatically — this is prepared for you to run yourself, since it
  touches your live working directory. Close your editor and Claude Code
  session pointed at the OneDrive path before running this, so nothing has
  the source files open while robocopy runs.

  Copies everything except node_modules/.next (both get reinstalled/rebuilt
  fresh at the destination) including .git, so history and the GitHub remote
  come with it. Does NOT delete or modify the original OneDrive copy — do
  that yourself once you've confirmed the new location works.

.PARAMETER Destination
  Where to copy the project to. Defaults to C:\dev\castfolio.

.EXAMPLE
  .\scripts\move-out-of-onedrive.ps1
  .\scripts\move-out-of-onedrive.ps1 -Destination D:\code\castfolio
#>
param(
    [string]$Destination = "C:\dev\castfolio"
)

$Source = (Resolve-Path "$PSScriptRoot\..").Path

if (Test-Path $Destination) {
    Write-Host "Destination already exists: $Destination" -ForegroundColor Red
    Write-Host "Choose an empty path, or remove it first if it's a stale attempt." -ForegroundColor Red
    exit 1
}

Write-Host "Copying $Source" -ForegroundColor Cyan
Write-Host "     to $Destination" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $Destination | Out-Null

robocopy $Source $Destination /E /MT:8 /XD node_modules .next "prmaker\node_modules" "prmaker\.next" /XJ /NFL /NDL

Write-Host ""
Write-Host "Copy complete. Next steps:" -ForegroundColor Green
Write-Host "  1. cd `"$Destination`""
Write-Host "  2. npm install"
Write-Host "  3. cd prmaker; npm install; cd .."
Write-Host "  4. git status   # confirm remote + history came across cleanly"
Write-Host "  5. Point your editor / Claude Code session at the new path"
Write-Host "  6. Once verified, remove the old OneDrive copy yourself — this script does not touch it"
