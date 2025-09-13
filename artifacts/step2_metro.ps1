Continue = 'Continue'
# Set NODE_OPTIONS permanently
cmd /c setx NODE_OPTIONS "--openssl-legacy-provider"
 = '--openssl-legacy-provider'
Set-Location 'D:\uprise_mob'
# Install dependencies
& yarn install 2>&1 | Tee-Object -FilePath 'D:\uprise_mob\artifacts\logs\yarn_install.log'
# Start Metro with cache reset
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','yarn start --reset-cache' -WorkingDirectory 'D:\uprise_mob' -NoNewWindow
Start-Sleep -Seconds 3
