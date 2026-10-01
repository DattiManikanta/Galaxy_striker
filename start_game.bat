@echo off
TITLE Galaxy Striker 3D - Space Arcade Launcher
echo ========================================================
echo   GALAXY STRIKER 3D // SCI-FI SPACE ARCADE
echo ========================================================
echo.
echo Starting local game server on port 4050...
echo Opening browser...
echo.

if exist "..\tools\node.exe" (
  start "" http://localhost:4050
  "..\tools\node.exe" server.cjs
) else (
  start "" http://localhost:4050
  node server.cjs
)

pause
