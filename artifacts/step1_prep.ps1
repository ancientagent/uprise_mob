$ErrorActionPreference='Continue'
$Adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
if (-not (Test-Path $Adb)) { Write-Host 'adb not found at' $Adb -ForegroundColor Red; exit 1 }
$pkgs = @('com.app.uprise','com.app.uprise.debug')
foreach ($p in $pkgs) {
  try { & $Adb shell pm clear $p | Out-Null } catch {}
  try { & $Adb uninstall $p | Out-Null } catch {}
}
'prep-clean-done' | Out-File -Encoding utf8 (Join-Path 'D:\uprise_mob\artifacts\logs' 'step1_done.txt')
