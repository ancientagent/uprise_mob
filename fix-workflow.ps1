# Windows non-admin PowerShell. Guardrails: no admin, no registry, no symlinks.

$ErrorActionPreference = 'Stop'
$repo = 'D:\uprise_mob'
cd $repo

Write-Host "=== Starting workflow cleanup and fixes ===" -ForegroundColor Cyan

# 1) Remove legacy workflow file(s) if present
Write-Host "Checking for legacy workflow files..." -ForegroundColor Yellow
$legacy = Get-ChildItem .github\workflows -Filter '*fixed*.yml' -ErrorAction SilentlyContinue
if ($legacy) {
  Write-Host "Removing legacy files: $($legacy.Name -join ', ')" -ForegroundColor Yellow
  $legacy | Remove-Item -Force
  git add .github/workflows
  git commit -m "ci: remove legacy *fixed* workflow to prevent confusion"
  Write-Host "Legacy files removed" -ForegroundColor Green
} else {
  Write-Host "No legacy files found" -ForegroundColor Green
}

# 2) Add concurrency + run-name to main workflow (idempotent edit)
Write-Host "Adding concurrency controls to workflow..." -ForegroundColor Yellow
$wf = '.github/workflows/android-debug-build.yml'
if (-not (Test-Path $wf)) { throw "Workflow not found: $wf" }
$y = Get-Content $wf -Raw

if ($y -notmatch '^\s*concurrency:' ) {
  # Insert concurrency and run-name after 'name: ' line
  if ($y -match '^(name:\s*.*)') {
    $nameMatch = $Matches[0]
    # Remove the name line from the content first
    $restOfContent = $y -replace '^name:\s*.*\r?\n', ''
    # Build new content with concurrency
    $newContent = @"
$nameMatch
run-name: Android CI - `${{ github.ref_name }} @ `${{ github.sha }} 
concurrency:
  group: android-`${{ github.ref }}
  cancel-in-progress: true

$restOfContent
"@
    Set-Content $wf $newContent
    Write-Host "Concurrency controls added" -ForegroundColor Green
  }
} else {
  # ensure cancel-in-progress true
  $y = $y -replace '(concurrency:\s*[\s\S]*?cancel-in-progress:\s*)false','${1}true'
  Set-Content $wf $y
  Write-Host "Concurrency already configured" -ForegroundColor Green
}

# 3) Commit CI hardening if changed
git add $wf
try {
  git diff --cached --quiet
  Write-Host "No workflow changes to commit" -ForegroundColor Green
} catch {
  git commit -m "ci: add concurrency group + run-name for commit clarity and auto-cancel"
  Write-Host "Workflow changes committed" -ForegroundColor Green
}

# 4) Fix local Bash rc encoding error (UTF-16 -> UTF-8) or remove it
Write-Host "Fixing bashrc encoding issue..." -ForegroundColor Yellow
$bashrc = 'C:\Users\baris\.bashrc'
if (Test-Path $bashrc) {
  $bytes = [System.IO.File]::ReadAllBytes($bashrc)
  # UTF-16 LE BOM = FF FE; detect & convert
  if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
    $content = [System.Text.Encoding]::Unicode.GetString($bytes)
    [System.IO.File]::WriteAllText($bashrc, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Converted $bashrc from UTF-16 to UTF-8" -ForegroundColor Green
  } else {
    Write-Host "$bashrc already UTF-8 or different encoding" -ForegroundColor Green
  }
} else {
  Write-Host "No bashrc file found" -ForegroundColor Yellow
}

# 5) Push changes to your working branch
Write-Host "Pushing changes..." -ForegroundColor Yellow
$BR = git rev-parse --abbrev-ref HEAD
git push origin $BR
Write-Host "Pushed to branch: $BR" -ForegroundColor Green

Write-Host "`n=== Setup complete! ===" -ForegroundColor Cyan
Write-Host "All fixes applied. You can now:" -ForegroundColor Green
Write-Host "1. Go to GitHub Actions" -ForegroundColor White
Write-Host "2. Select 'Android Build & Smoke Test' workflow" -ForegroundColor White
Write-Host "3. Click 'Run workflow' and select branch: $BR" -ForegroundColor White
Write-Host "4. The new concurrency settings will auto-cancel old runs" -ForegroundColor White