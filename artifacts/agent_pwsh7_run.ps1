# UPRISE Mobile — Windows Agent (Phases 0–6) FIXED v2
$ErrorActionPreference = "Continue"
$PSStyle.OutputRendering = "PlainText"

# Paths
$Root = "D:\uprise_mob"
$AndroidDir = Join-Path $Root "android"
$Artifacts = Join-Path $Root "artifacts"
$Docs = Join-Path $Root "docs"
New-Item -ItemType Directory -Force -Path $Artifacts, $Docs | Out-Null

# Helpers
function Write-OK($m){ Write-Host "[OK] $m" -ForegroundColor Green }
function Write-ERR($m){ Write-Host "[ERR] $m" -ForegroundColor Red }
function Save-Text($path,$text){ New-Item -ItemType File -Force -Path $path -Value $text | Out-Null }

# Phase 0 — Shell, Node, Yarn sanity
$psv = $PSVersionTable.PSVersion
if ($psv.Major -lt 7) { Write-ERR "PowerShell 7+ required"; exit 1 }
Write-OK ("pwsh {0}" -f $psv)

# Refresh PATH to pick up nvm shims (session-only)
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
# Try NVM 20.18.1 (best effort)
try { nvm use 20.18.1 | Out-Null } catch {}
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

$NodeOk = (Get-Command node -ErrorAction SilentlyContinue) -ne $null
$NpmOk  = (Get-Command npm  -ErrorAction SilentlyContinue) -ne $null
if (-not $NodeOk -or -not $NpmOk) { Write-ERR "node/npm not visible on PATH (session)" } else { Write-OK ("Node: {0}  NPM: {1}" -f (node -v),(npm -v)) }

$UseNpxYarn = $false
if (Get-Command yarn -ErrorAction SilentlyContinue) {
  $yv = (& yarn --version) 2>$null
  if ($yv) { Write-OK ("Yarn: {0}" -f $yv.Trim()) }
} else {
  $UseNpxYarn = $true
  $yv = (& npx -y yarn@1 --version) 2>$null
  if ($yv) { Write-OK ("Yarn(npx): {0}" -f $yv.Trim()) } else { Write-ERR "Yarn not available" }
}

# Install deps conservatively (no postinstall scripts)
Set-Location $Root
$yarnLog = Join-Path $Artifacts "yarn_install.log"
try {
  if ($UseNpxYarn) { & npx -y yarn@1 install --ignore-scripts --network-timeout 600000 *> $yarnLog }
  else { & yarn install --ignore-scripts --network-timeout 600000 *> $yarnLog }
  Write-OK "yarn install completed"
} catch { Write-ERR "yarn install failed (see $yarnLog)" }

# Phase 1 — Backend availability
$winHealthUrl = "http://localhost:8080/health"
$emuHealthUrl = "http://10.0.2.2:8080/health"
$backendOk = $false
$resp = $null
try { $resp = Invoke-WebRequest -UseBasicParsing $winHealthUrl -TimeoutSec 3; if ($resp.StatusCode -eq 200) { $backendOk = $true } } catch {}
if (-not $backendOk) {
  # Try WSL backend starter
  $wslScript = "/mnt/d/uprise_mob/scripts/wsl/start_backend.sh"
  try { wsl.exe bash -lc "bash $wslScript" | Out-Null } catch {}
  Start-Sleep 2
  try { $resp = Invoke-WebRequest -UseBasicParsing $winHealthUrl -TimeoutSec 5 } catch {}
  if ($resp -and $resp.StatusCode -eq 200) { $backendOk = $true }
}
if (-not $backendOk) {
  # Fallback to repo-local dev-backend (pure Node)
  $devServer = Join-Path $Root "dev-backend\devserver.js"
  if ((Test-Path $devServer -PathType Leaf) -and $NodeOk) {
    try { Start-Process -FilePath "node" -ArgumentList "`"$devServer`"" -WorkingDirectory $Root -WindowStyle Hidden; Start-Sleep 2 } catch {}
    try { $resp = Invoke-WebRequest -UseBasicParsing $winHealthUrl -TimeoutSec 5 } catch {}
    if ($resp -and $resp.StatusCode -eq 200) { $backendOk = $true }
  }
}
if ($backendOk -and $resp) { $resp.Content | Out-File -Encoding utf8 (Join-Path $Artifacts "backend_health_win.txt") }
$bk = $(if ($backendOk) {"[OK]"} else {"[ERR]"}); Write-Host "$bk Backend @ $winHealthUrl"

# Ensure .env.development points emulator to 10.0.2.2
$envFile = Join-Path $Root ".env.development"
if (-not (Test-Path $envFile)) { New-Item -ItemType File -Path $envFile | Out-Null }
if (-not (Test-Path "$envFile.bak")) { Copy-Item $envFile ("$envFile.bak") -Force }
$content = (Get-Content $envFile -Raw)
if ($content -notmatch "(?m)^\s*API_BASE_URL\s*=") {
  Add-Content $envFile "`nAPI_BASE_URL=http://10.0.2.2:8080"
} else {
  ($content -replace "(?m)^\s*API_BASE_URL\s*=.*$", "API_BASE_URL=http://10.0.2.2:8080") | Out-File -Encoding utf8 $envFile
}

# Phase 2 — ADB / Emulator connectivity
$Adb = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
$Device = ""
if (Test-Path $Adb) {
  try { $lines = & $Adb devices; $Device = ($lines | Select-String "`tdevice$" | Select-Object -First 1).Line.Split("`t")[0] } catch {}
}
if ($Device) {
  Save-Text (Join-Path $Artifacts "device.txt") $Device
  try { & $Adb -s $Device reverse tcp:8080 tcp:8080 | Out-Null } catch {}
  try { & $Adb -s $Device reverse tcp:8081 tcp:8081 | Out-Null } catch {}
  Write-OK ("ADB device: {0}" -f $Device)
} else { Write-ERR "No ADB device detected" }

# Phase 3 — Metro bundler (8081)
$metroPort = 8081
$metroListening = $false
try { $metroListening = Test-NetConnection -ComputerName "localhost" -Port $metroPort -InformationLevel Quiet } catch {}
if (-not $metroListening -and $NodeOk) {
  $metroStamp = Join-Path $Artifacts "metro_started.txt"
  try {
    Start-Process -FilePath "npx" -ArgumentList "react-native start --port $metroPort" -WorkingDirectory $Root -NoNewWindow
    Set-Content -Encoding utf8 -Path $metroStamp -Value (Get-Date -Format s)
    Start-Sleep 5
    $metroListening = Test-NetConnection -ComputerName "localhost" -Port $metroPort -InformationLevel Quiet
  } catch {}
}
$ms = $(if ($metroListening) {"[OK]"} else {"[ERR]"}); Write-Host "$ms Metro 8081"

# Phase 4 — Gradle sanity (non-destructive)
Set-Location $AndroidDir
$gradleLog = Join-Path $Artifacts "gradle_build_full.log"
try { .\gradlew.bat --stop >> $gradleLog 2>&1 } catch {}
# settings.gradle include ':app'
$settings = Join-Path $AndroidDir "settings.gradle"
if (Test-Path $settings) {
  $txt = Get-Content $settings -Raw
  if ($txt -notmatch "include\s+':app'") {
    if (-not (Test-Path "$settings.bak")) { Copy-Item $settings ("$settings.bak") -Force }
    ($txt + "`ninclude ':app'`n") | Out-File -Encoding utf8 $settings
  }
}
# Environment toggles
$env:REANIMATED_DONT_BUILD_FROM_SOURCE = "true"
$env:ORG_GRADLE_PROJECT_newArchEnabled = "false"
# JAVA_HOME fallback to Android Studio jbr if missing
if (-not (Test-Path $env:JAVA_HOME)) { $guess = "C:\\Program Files\\Android\\Android Studio\\jbr"; if (Test-Path $guess) { $env:JAVA_HOME = $guess } }
Write-Host ("JAVA_HOME={0}" -f $env:JAVA_HOME)
try { .\gradlew.bat --no-daemon --stacktrace --info help >> $gradleLog 2>&1 } catch {}
try { .\gradlew.bat --no-daemon --stacktrace --info :app:assembleDebug >> $gradleLog 2>&1 } catch {}
$Apk = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"
$ApkOk = (Test-Path $Apk) -and ((Get-Item $Apk).Length -gt 0)
if (-not $ApkOk) {
  # Extract first relevant failure window
  $errOut = Join-Path $Artifacts "gradle_first_error.txt"
  try {
    $lines = Get-Content $gradleLog -ErrorAction SilentlyContinue
    if ($lines) {
      $idx = ($lines | Select-String -Pattern "FAILURE: Build failed" -SimpleMatch | Select-Object -First 1).LineNumber
      if ($idx) {
        $start = [Math]::Max(0,$idx-40); $end = [Math]::Min($lines.Count-1,$idx+80)
        ($lines[$start..$end]) | Out-File -Encoding utf8 $errOut
      } else { $lines | Select-Object -Last 120 | Out-File -Encoding utf8 $errOut }
    }
  } catch {}
}

# Phase 5 — Install, launch, capture network
$netLog = Join-Path $Artifacts "net_boot.txt"
if ($Device -and $ApkOk -and (Test-Path $Adb)) {
  try { & $Adb -s $Device install -r $Apk | Out-Null } catch {}
  try { & $Adb -s $Device shell monkey -p "com.app.uprise.debug" -c android.intent.category.LAUNCHER 1 | Out-Null } catch {}
  try {
    & $Adb -s $Device logcat -c | Out-Null
    Start-Sleep 2
    (& $Adb -s $Device logcat -d) |
      Select-String -Pattern "http","/health","API_BASE_URL","Axios","fetch","8081","ReactNative" |
      ForEach-Object { $_.Line } | Out-File -Encoding utf8 $netLog
  } catch {}
}

# Phase 6 — Docs & summary
$stamp = Get-Date -Format s
Add-Content (Join-Path $Docs "runbook_android.md") "`n$stamp  agent: device=$Device, apk=$ApkOk, metro=$metroListening, backend=$backendOk"
Add-Content (Join-Path $Docs "CHANGELOG.md") "`n$(Get-Date -Format yyyy-MM-dd)  Windows agent ran phases 0–6 (backend=$backendOk, metro=$metroListening, apk=$ApkOk)."

# Prepare summary fields first (avoid inline if-expr)
$status = "FAILED"
if ($ApkOk -and $backendOk) { $status = "OK" }
$reasons = @()
if (-not $ApkOk) { $reasons += "apk-missing" }
if (-not $backendOk) { $reasons += "backend-missing" }
if (-not $metroListening) { $reasons += "metro-down" }

$summary = [pscustomobject]@{
  version            = "uprise-agent-pwsh-1"
  device             = ($Device | Out-String).Trim()
  apk_path           = $Apk
  backend_health_win = $backendOk
  health_url_win     = $winHealthUrl
  health_url_emu     = $emuHealthUrl
  metro_port         = 8081
  netlog             = $netLog
  gradle_log         = $gradleLog
  gradle_first_error = (Join-Path $Artifacts "gradle_first_error.txt")
  status             = $status
  reasons            = $reasons
}

$sumPath = Join-Path $Artifacts "agent_summary.json"
$summary | ConvertTo-Json -Compress | Tee-Object -Variable json | Out-File -Encoding utf8 $sumPath
Write-Output $json
