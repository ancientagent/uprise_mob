Continue = 'Continue'
 = Join-Path C:\Users\baris\AppData\Local 'Android\Sdk\platform-tools\adb.exe'
 = 'D:\uprise_mob\artifacts\logs\prep_clean.log'
"adb=" | Out-File -Encoding utf8 
if (-not (Test-Path )) { 'adb not found' | Out-File -Append ; exit 1 }
&  shell pm clear com.app.uprise            2>&1 | Tee-Object -FilePath 
&  uninstall com.app.uprise                 2>&1 | Tee-Object -Append -FilePath 
&  uninstall com.app.uprise.debug           2>&1 | Tee-Object -Append -FilePath 
