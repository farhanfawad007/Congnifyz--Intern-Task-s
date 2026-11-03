# Starts server + worker in separate PowerShell windows
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectDir'; npm start"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectDir'; npm run worker"

Write-Host "Started server and worker in 2 new windows."
Write-Host "Open http://localhost:3000 in your browser."
