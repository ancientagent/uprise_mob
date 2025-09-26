# UPRISE Phase 2: Local backend + Android emulator (Debug)
# Guardrails: no admin, no symlinks, user-writable paths only.
# Stop on error, print the last file touched.

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$lastTouched = ''
function Touch($path) { $script:lastTouched = $path }
function Fail($msg) {
  Write-Host "ERROR: $msg" -ForegroundColor Red
  if ($script:lastTouched) { Write-Host "Last file touched: $script:lastTouched" -ForegroundColor Yellow }
  exit 1
}

function Run($cmd, $timeoutSec=120) {
  Write-Host "> $cmd" -ForegroundColor Cyan
  $job = Start-Job -ScriptBlock { param($c) powershell -NoLogo -NoProfile -Command $c } -ArgumentList $cmd
  if (-not (Wait-Job $job -Timeout $timeoutSec)) {
    Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
    Fail "Command timed out after ${timeoutSec}s: $cmd"
  }
  $res = Receive-Job $job -Keep
  if ($LASTEXITCODE -ne 0) { Fail "Command failed: $cmd`n$res" }
  $res
}

# Inputs (adjust if paths differ)
$mob = 'D:\uprise_mob'
$api = 'D:\webapp_api'
$docs = 'D:\uprise_mob\docs'
$nodeBin = 'C:\\tools\\node-v20.19.0-win-x64'
$adb = Join-Path $env:LOCALAPPDATA 'Android\\Sdk\\platform-tools\\adb.exe'
$emulator = Join-Path $env:LOCALAPPDATA 'Android\\Sdk\\emulator\\emulator.exe'

Write-Host "=== PRECHECKS ===" -ForegroundColor Green
try {
  & node -v | Write-Host
  & npm -v | Write-Host
  & yarn -v | Write-Host
} catch { Write-Host "Node/yarn check non-fatal: $_" -ForegroundColor Yellow }
try { & $adb --version | Write-Host } catch { Write-Host "adb not found: $adb" -ForegroundColor Yellow }

Write-Host "=== BACKEND: START (port 8080) ===" -ForegroundColor Green
if (-not (Test-Path $api)) { Fail "Backend repo missing: $api" }

$envFile = Join-Path $api '.env.development.local'
if (-not (Test-Path $envFile)) {
  Touch $envFile
  @(
    'PORT=8080'
    'NODE_ENV=development'
    'LOG_LEVEL=debug'
  ) | Out-File -Encoding ASCII -FilePath $envFile
}

Push-Location $api
try {
  if (Test-Path (Join-Path $api 'yarn.lock')) {
    Run 'yarn install --frozen-lockfile --ignore-scripts --network-timeout 600000' 900
  } else {
    Run 'yarn install --ignore-scripts --network-timeout 600000' 900
  }

  $logPath = Join-Path $api 'local_server.log'
  $startCmds = @('yarn dev', 'yarn start:dev', 'yarn start')
  $started = $false
  foreach ($c in $startCmds) {
    try {
      Write-Host "Attempt: $c (logging to $logPath)" -ForegroundColor DarkCyan
      $ps = Start-Process powershell -ArgumentList "-NoLogo -NoProfile -Command cd `"$api`"; `$env:PORT=8080; `$env:NODE_ENV='development'; $c *>> `"$logPath`"" -PassThru -WindowStyle Hidden
      Start-Sleep -Seconds 8
      $started = $true; break
    } catch { continue }
  }
  if (-not $started) { Fail "Could not start API with yarn dev/start:dev/start" }

  # Health check
  $urls = @(
    'http://localhost:8080/health',
    'http://localhost:8080/api/health',
    'http://localhost:8080/'
  )
  $healthy = $false
  $healthOut = ''
  foreach ($u in $urls) {
    try {
      $resp = Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 -Uri $u
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { $healthy = $true; $healthOut = "${u} => ${($resp.StatusCode)}"; break }
    } catch { continue }
  }
  if (-not $healthy) {
    Write-Host "Backend health failed. Tail of $logPath:" -ForegroundColor Red
    if (Test-Path $logPath) { Get-Content $logPath -Tail 80 | Write-Host }
    Fail "No health endpoint responded at /health or /api/health or /"
  }
  Write-Host "API OK: $healthOut" -ForegroundColor Green

  # Save artifact for reference
  $mobArtifacts = Join-Path $mob 'artifacts'
  if (-not (Test-Path $mobArtifacts)) { New-Item -ItemType Directory -Path $mobArtifacts | Out-Null }
  Touch (Join-Path $mobArtifacts 'backend_health.txt')
  "${healthOut}`n" | Out-File -Encoding ASCII -FilePath (Join-Path $mobArtifacts 'backend_health.txt')
} finally { Pop-Location }

Write-Host "=== MOBILE: ENV (point to 10.0.2.2:8080) ===" -ForegroundColor Green
if (-not (Test-Path $mob)) { Fail "Mobile repo missing: $mob" }

$envSrc = Join-Path $mob '.env'
if (-not (Test-Path $envSrc)) { Fail ".env missing in mobile repo: $envSrc" }

$envLocal = Join-Path $mob '.env.localdebug'
Touch $envLocal
(Get-Content $envSrc -Raw) -replace '(?m)^BASE_URL\s*=.*$', 'BASE_URL=http://10.0.2.2:8080' | Out-File -Encoding ASCII -FilePath $envLocal

Write-Host "=== ANDROID: EMULATOR ===" -ForegroundColor Green
try {
  $avds = & $emulator -list-avds
} catch { Fail "Cannot list AVDs: $_" }
if (-not $avds) { Fail "No AVDs found. Create an API 31+ emulator first." }
$chosen = ($avds | Select-String -Pattern 'API_3|_31|31' | Select-Object -First 1).ToString()
if (-not $chosen) { $chosen = $avds | Select-Object -First 1 }
Write-Host "Using AVD: $chosen"

Start-Process $emulator -ArgumentList @('-avd', $chosen, '-netdelay', 'none', '-netspeed', 'full') -WindowStyle Minimized | Out-Null
& $adb wait-for-device
$boot = & $adb shell getprop sys.boot_completed
if ($boot.Trim() -ne '1') { Fail "Emulator failed to boot (sys.boot_completed=$boot)" }

Write-Host "=== BUILD + INSTALL DEBUG APK ===" -ForegroundColor Green
Push-Location $mob
try {
  # Ensure env for react-native-config
  $env:ENVFILE = $envLocal
  Run 'yarn install --ignore-scripts --network-timeout 600000' 900
  Push-Location (Join-Path $mob 'android')
  try {
    Run '.\gradlew.bat :app:assembleDebug' 1200
  } catch {
    $log = Join-Path (Join-Path $mob 'android') 'build.log'
    Touch $log
    "Build failed at $(Get-Date -Format o)" | Out-File -FilePath $log -Encoding ASCII
    Fail "Gradle build failed. See $log"
  } finally { Pop-Location }

  $apk = Join-Path $mob 'android\\app\\build\\outputs\\apk\\debug\\app-debug.apk'
  if (-not (Test-Path $apk)) { Fail "APK not found: $apk" }

  & $adb install -r $apk | Write-Host

  # Derive package name from aapt if possible; fallback to known debug id
  $pkg = 'com.app.uprise.debug'
  $aapt = Join-Path $env:LOCALAPPDATA 'Android\\Sdk\\build-tools\\31.0.0\\aapt.exe'
  if (Test-Path $aapt) {
    try {
      $badge = & $aapt dump badging $apk 2>$null
      $m = [regex]::Match($badge, "package: name='([^']+)'")
      if ($m.Success) { $pkg = $m.Groups[1].Value }
    } catch { }
  }
  & $adb shell monkey -p $pkg -c android.intent.category.LAUNCHER 1 | Write-Host
} finally { Pop-Location }

Write-Host "=== VERIFY BACKEND CONNECTIVITY (logcat 20s) ===" -ForegroundColor Green
$mobArtifacts = Join-Path $mob 'artifacts'
if (-not (Test-Path $mobArtifacts)) { New-Item -ItemType Directory -Path $mobArtifacts | Out-Null }
$logcatOut = Join-Path $mobArtifacts 'logcat_backend.txt'
Touch $logcatOut
$scriptBlock = {
  param($adbPath, $outPath)
  & $adbPath logcat -v time *:W ReactNative:V ReactNativeJS:V |
    Select-String -Pattern 'http|/health|/auth|BASE_URL|API_BASE_URL' -SimpleMatch |
    ForEach-Object { $_.Line } | Out-File -Encoding ASCII -FilePath $outPath
}
$job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $adb, $logcatOut
Wait-Job $job -Timeout 20 | Out-Null
Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
Receive-Job $job -ErrorAction SilentlyContinue | Out-Null
Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null

Write-Host "=== SUMMARY ===" -ForegroundColor Green
Write-Host "API health: $healthOut"
Write-Host "Emulator: $chosen"
Write-Host "APK: $apk"
Write-Host "Logcat: $logcatOut"

Write-Host "Done." -ForegroundColor Green
