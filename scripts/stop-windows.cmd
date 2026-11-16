@echo off
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0start-local.ps1" -Stop
if errorlevel 1 pause
