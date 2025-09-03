# Wait up to 90s for "ReactNativeJS" in logcat
$deadline = (Get-Date).AddSeconds(90)
do {
  $log = adb logcat -d | Select-String -SimpleMatch "ReactNativeJS"
  if ($log) { Write-Host "✅ ReactNativeJS detected"; exit 0 }
  Start-Sleep -Seconds 5
} while ((Get-Date) -lt $deadline)
Write-Error "❌ No ReactNativeJS logs within 90s"; exit 1