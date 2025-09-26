Continue = 'Continue'
 = Join-Path C:\Users\baris\AppData\Local 'Android\Sdk\platform-tools\adb.exe'
 = 'D:\uprise_mob\artifacts\logs\crash_tail.txt'
 = 'D:\uprise_mob\artifacts\logs\app_pid_log.txt'
 = 'D:\uprise_mob\artifacts\logs\crash_buffer.txt'
 = 'D:\uprise_mob\artifacts\logs\dumpsys_crashes.txt'

if (Test-Path ) {
  # Trigger app launch
  &  shell monkey -p 'com.app.uprise.debug' -c android.intent.category.LAUNCHER 1
  Start-Sleep -Seconds 5
  
  # Capture crash logs
  &  logcat -d | Select-String 'ReactNativeJS|AndroidRuntime|FATAL EXCEPTION' | Select-Object -Last 200 | Out-File -Encoding utf8 
  
  # Optional PID-scoped log
  85800 = (&  shell pidof com.app.uprise.debug)
  if (85800) {
    &  logcat --pid 85800 -v time -d | Out-File -Encoding utf8 
  }
  
  # Fast alternatives - crash buffer and dumpsys
  &  logcat -b crash -v time -d | Out-File -Encoding utf8 
  &  shell dumpsys activity crashes | Out-File -Encoding utf8 
  
  # Additional focused crash set
  &  logcat -d | Select-String 'AndroidRuntime|FATAL EXCEPTION|ReactNativeJS|Process com.app.uprise|RuntimeInit|libc' | Select-Object -Last 200 | Out-File -Encoding utf8 
}
