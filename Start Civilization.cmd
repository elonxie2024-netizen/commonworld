@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0browser\start.ps1"
if errorlevel 1 pause
